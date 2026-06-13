import itertools
import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch

from src.model import DrugInteractionGNN

_PROC = Path("data/processed")
_MAP  = Path("data/mappings")
_CATS = Path("data/datasets/bio-decagon-effectcategories/bio-decagon-effectcategories.csv")

_SEVERITY_MAP = {
    "cardiovascular system disease":  "CRITICAL",
    "hematopoietic system disease":   "CRITICAL",
    "hematopoietic system diseases":  "CRITICAL",
    "respiratory system disease":     "HIGH",
    "thoracic disease":               "HIGH",
    "urinary system disease":         "HIGH",
    "gastrointestinal system disease": "MODERATE",
    "nervous system disease":         "MODERATE",
}

# Keyword fallback for side effects not covered by the effectcategories CSV
_NAME_SEVERITY_KEYWORDS = [
    (["atrial", "cardiac", "cardio", "arteri", "heart", "ventric", "coronar", "myocard"], "CRITICAL"),
    (["haemo", "hemo", "bleed", "thromb", "coagul", "platelet", "anaemia", "anemia"],      "CRITICAL"),
    (["pulmonary", "respiratory", "bronch", "asthma", "pneumo", "sinus", "rhinitis"],      "HIGH"),
    (["renal", "kidney", "hepat", "liver", "urinar"],                                      "HIGH"),
    (["gastroint", "colitis", "gastric", "intestin", "bowel"],                             "MODERATE"),
    (["neuro", "neuritis", "parkinson", "epilep", "seizure", "enceph"],                    "MODERATE"),
]

_SE_PROB_THRESHOLD = 0.50  # global floor; effective threshold is per-pair (mean + 1.5σ)
_TOP_SE_LIMIT      = 20
_TOP_PAIR_SE_LIMIT = 5
_TEMPERATURE       = 1.0   # set >1 if model is still overconfident after retraining

_SEVERITY_SCORE_WEIGHT = {"CRITICAL": 0.15, "HIGH": 0.08, "MODERATE": 0.03, "LOW": 0.01}

def _compute_polypharmacy_score(max_harm: float, side_effects: list) -> tuple[int, str]:
    se_contribution = min(1.0, sum(
        _SEVERITY_SCORE_WEIGHT.get(se.get("severity", "LOW"), 0.01)
        for se in side_effects
    ))
    raw = max_harm * 0.65 + se_contribution * 0.35
    score = max(0, min(100, round(raw * 100)))
    if score >= 80:
        grade = "CRITICAL"
    elif score >= 65:
        grade = "HIGH"
    elif score >= 40:
        grade = "MODERATE"
    elif score >= 20:
        grade = "LOW"
    else:
        grade = "MINIMAL"
    return score, grade


def _load_json(path) -> dict:
    with open(path) as f:
        return json.load(f)


def _name_based_severity(name: str) -> str:
    lower = name.lower()
    for keywords, severity in _NAME_SEVERITY_KEYWORDS:
        if any(kw in lower for kw in keywords):
            return severity
    return "LOW"


def _build_category_maps(se_to_idx: dict, cats_path: Path) -> tuple[dict, dict]:
    idx_to_category: dict[int, str] = {}
    idx_to_severity: dict[int, str] = {}
    try:
        df      = pd.read_csv(cats_path, low_memory=False)
        id_col  = df.columns[0]
        cat_col = next(
            (c for c in df.columns if "class" in c.lower() or "category" in c.lower()),
            df.columns[-1],
        )
        for _, row in df.iterrows():
            se_id = str(row[id_col]).strip()
            idx   = se_to_idx.get(se_id)
            if idx is not None:
                category = str(row[cat_col]).strip()
                idx_to_category[int(idx)] = category
                idx_to_severity[int(idx)] = _SEVERITY_MAP.get(category.lower(), "LOW")
    except FileNotFoundError:
        pass
    return idx_to_category, idx_to_severity


class DrugInteractionPredictor:

    def __init__(self, model_path: str):
        self.device = torch.device("cpu")

        self.drug_to_idx = _load_json(_MAP / "drug_to_idx.json")
        self.num_drugs   = len(self.drug_to_idx)

        _name_map_path = _MAP / "drug_name_to_stitch.json"
        self._name_to_stitch: dict[str, str] = (
            _load_json(_name_map_path) if _name_map_path.exists() else {}
        )

        se_to_idx  = _load_json(_MAP / "se_to_idx.json")
        se_to_name = _load_json(_MAP / "se_to_name.json")
        self.num_se = len(se_to_idx)

        self.idx_to_name = {
            int(idx): str(se_to_name.get(se_id, se_id)).title()
            for se_id, idx in se_to_idx.items()
        }
        self.idx_to_category, self.idx_to_severity = _build_category_maps(se_to_idx, _CATS)

        # Fill in name-based severity for SEs missing from the effectcategories CSV
        for se_id, idx in se_to_idx.items():
            i = int(idx)
            if i not in self.idx_to_severity:
                name = self.idx_to_name.get(i, "")
                self.idx_to_severity[i] = _name_based_severity(name)

        drug_features      = np.load(_PROC / "drug_features.npy")
        self.drug_feat_t   = torch.tensor(drug_features, dtype=torch.float32)
        self.edge_index_t  = torch.load(_PROC / "full_edge_index.pt", weights_only=True)
        self.dd_edge_index = torch.load(_PROC / "dd_edge_index.pt", weights_only=True)
        self.dp_edge_index = torch.load(_PROC / "dp_edge_index.pt", weights_only=True)
        self.pp_edge_index = torch.load(_PROC / "pp_edge_index.pt", weights_only=True)

        num_proteins = len(_load_json(_MAP / "protein_to_idx.json"))

        self.model = DrugInteractionGNN(
            drug_feature_dim = drug_features.shape[1],
            num_proteins     = num_proteins,
            num_side_effects = self.num_se,
        )
        self.model.load_state_dict(torch.load(model_path, map_location="cpu", weights_only=True))
        self.model.eval()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            try:
                feat_g = self.drug_feat_t.cuda()
                edge_g = self.edge_index_t.cuda()
                dd_g   = self.dd_edge_index.cuda()
                dp_g   = self.dp_edge_index.cuda()
                pp_g   = self.pp_edge_index.cuda()
                self.model.cuda()
                with torch.no_grad():
                    self._z = self.model.encode(feat_g, edge_g, self.num_drugs, dd_g, dp_g, pp_g)
                self.drug_feat_t   = feat_g
                self.edge_index_t  = edge_g
                self.dd_edge_index = dd_g
                self.dp_edge_index = dp_g
                self.pp_edge_index = pp_g
                self.device        = torch.device("cuda")
                return
            except (torch.cuda.OutOfMemoryError, RuntimeError):
                torch.cuda.empty_cache()
                self.model.cpu()

        with torch.no_grad():
            self._z = self.model.encode(
                self.drug_feat_t, self.edge_index_t, self.num_drugs,
                self.dd_edge_index, self.dp_edge_index, self.pp_edge_index,
            )

    def _resolve(self, name: str) -> str:
        upper = name.strip().upper()
        if upper in self.drug_to_idx:
            return upper
        stitch = self._name_to_stitch.get(name.strip().lower())
        if stitch and stitch in self.drug_to_idx:
            return stitch
        raise ValueError(f"Unknown drug: {name!r}")

    def get_available_drugs(self) -> list:
        return sorted(self.drug_to_idx.keys())

    def predict(self, drug_names: list) -> dict:
        try:
            resolved = [self._resolve(d) for d in drug_names]
        except ValueError as e:
            raise ValueError(str(e))
        missing = [d for d in resolved if d not in self.drug_to_idx]
        if missing:
            raise ValueError(f"Unknown drug(s): {', '.join(missing)}")

        pairs  = list(itertools.combinations(resolved, 2))
        pair_t = torch.tensor(
            [[self.drug_to_idx[a], self.drug_to_idx[b]] for a, b in pairs],
            dtype=torch.long,
            device=self.device,
        )

        with torch.no_grad():
            se_logits   = self.model.decode_side_effects(self._z, pair_t)
            # Temperature scaling: divide logits before sigmoid to spread probability distribution
            se_probs    = torch.sigmoid(se_logits / _TEMPERATURE)
            harm_scores = torch.sigmoid(
                self.model.decode_harmfulness(se_probs)
            ).squeeze(1).cpu().numpy()
            se_probs_np = se_probs.cpu().numpy()

        max_harm   = float(harm_scores.max())
        harmful    = max_harm > 0.6
        risk_level = "HIGH" if max_harm > 0.8 else ("MEDIUM" if max_harm > 0.6 else "LOW")

        # Weighted aggregation across pairs — harm score as weight (Issue 5)
        # More dangerous pairs contribute more to the final SE profile.
        weights      = harm_scores / (harm_scores.sum() + 1e-8)         # [P]
        weighted_se  = (se_probs_np * weights[:, np.newaxis]).sum(axis=0)  # [R]

        # Per-pair adaptive threshold: only flag SEs that are anomalously high
        # relative to this pair's own distribution (mean + 1.5σ). This prevents
        # showing SEs that are just "globally common" across many pairs.
        pair_thresh = float(weighted_se.mean() + 1.5 * weighted_se.std())
        eff_thresh  = max(_SE_PROB_THRESHOLD, pair_thresh)
        top_idxs = np.where(weighted_se > eff_thresh)[0]
        top_idxs = top_idxs[np.argsort(-weighted_se[top_idxs])][:_TOP_SE_LIMIT]

        side_effects = [
            {
                "name":        self.idx_to_name.get(int(i), f"SE_{i}"),
                "probability": round(float(weighted_se[i]), 4),
                "category":    self.idx_to_category.get(int(i), "Unknown"),
                "severity":    self.idx_to_severity.get(int(i), "LOW"),
            }
            for i in top_idxs
        ]

        stitch_to_display = {self._resolve(d): str(d).strip() for d in drug_names}

        pair_details = []
        for p_idx, (a, b) in enumerate(pairs):
            p_probs = se_probs_np[p_idx]
            top_p   = np.argsort(-p_probs)[:_TOP_PAIR_SE_LIMIT]
            top_p   = top_p[p_probs[top_p] > (_SE_PROB_THRESHOLD * 0.5)]  # looser per-pair threshold
            pair_details.append({
                "drug_a":           stitch_to_display.get(a, a),
                "drug_b":           stitch_to_display.get(b, b),
                "top_side_effects": [self.idx_to_name.get(int(i), f"SE_{i}") for i in top_p],
                "pair_harm_score":  round(float(harm_scores[p_idx]), 4),
            })

        poly_score, risk_grade = _compute_polypharmacy_score(max_harm, side_effects)

        return {
            "harmful":             harmful,
            "confidence":          round(max_harm, 4),
            "risk_level":          risk_level,
            "drug_count":          len(drug_names),
            "pairs_analyzed":      len(pairs),
            "polypharmacy_score":  poly_score,
            "risk_grade":          risk_grade,
            "side_effects":        side_effects,
            "pair_details":        pair_details,
        }
