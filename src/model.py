import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv, BatchNorm as PyGBatchNorm


class DrugInteractionGNN(nn.Module):

    def __init__(
        self,
        drug_feature_dim: int,
        num_proteins: int,
        num_side_effects: int,
        protein_embed_dim: int = 64,
        hidden_dim: int = 64,
        embed_dim: int = 32,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.num_proteins     = num_proteins
        self.embed_dim        = embed_dim
        self.num_side_effects = num_side_effects

        self.protein_embedding = nn.Embedding(num_proteins, protein_embed_dim)
        self.drug_proj         = nn.Linear(drug_feature_dim, hidden_dim)
        self.protein_proj      = nn.Linear(protein_embed_dim, hidden_dim)

        # Relation-specific convolutions for layer 1 (Decagon Section 4.1)
        self.conv_dd_1 = SAGEConv(hidden_dim, hidden_dim)  # drug-drug
        self.conv_dp_1 = SAGEConv(hidden_dim, hidden_dim)  # drug-protein
        self.conv_pp_1 = SAGEConv(hidden_dim, hidden_dim)  # protein-protein
        self.bn1       = PyGBatchNorm(hidden_dim)

        # Shared layer 2
        self.conv2 = SAGEConv(hidden_dim, embed_dim)
        self.bn2   = PyGBatchNorm(embed_dim)

        self.dropout = nn.Dropout(dropout)

        # Diagonal bilinear decoder: one D_r per side effect (Decagon Eq. 2)
        self.diag_matrices = nn.Parameter(torch.empty(num_side_effects, embed_dim))
        nn.init.xavier_uniform_(self.diag_matrices)

        # Global relation matrix R: score = z_i^T · diag(D_r) · R · z_j
        self.global_R = nn.Parameter(torch.empty(embed_dim, embed_dim))
        nn.init.xavier_uniform_(self.global_R)

        self.harm_head = nn.Sequential(
            nn.Linear(num_side_effects, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, 1),
        )

    def encode(
        self,
        drug_features: torch.Tensor,
        edge_index: torch.Tensor,
        num_drugs: int,
        dd_edge_index: torch.Tensor | None = None,
        dp_edge_index: torch.Tensor | None = None,
        pp_edge_index: torch.Tensor | None = None,
    ) -> torch.Tensor:
        x_drug   = F.relu(self.drug_proj(drug_features))
        prot_idx = torch.arange(self.num_proteins, device=drug_features.device)
        x_prot   = F.relu(self.protein_proj(self.protein_embedding(prot_idx)))
        x        = torch.cat([x_drug, x_prot], dim=0)

        # Layer 1 — relation-specific aggregation when separate indices are available
        if dd_edge_index is not None and dp_edge_index is not None and pp_edge_index is not None:
            x = self.dropout(F.relu(self.bn1(
                self.conv_dd_1(x, dd_edge_index) +
                self.conv_dp_1(x, dp_edge_index) +
                self.conv_pp_1(x, pp_edge_index)
            )))
        else:
            x = self.dropout(F.relu(self.bn1(self.conv_dd_1(x, edge_index))))

        # Layer 2 — shared
        x = self.dropout(F.relu(self.bn2(self.conv2(x, edge_index))))
        return x

    def decode_side_effects(self, z: torch.Tensor, drug_pairs: torch.Tensor) -> torch.Tensor:
        dtype = self.diag_matrices.dtype
        z_i   = z[drug_pairs[:, 0]].to(dtype)          # [P, D]
        z_j   = z[drug_pairs[:, 1]].to(dtype)          # [P, D]
        # DEDICOM: z_i^T · D_r · R · D_r · z_j  (Decagon Eq. 2)
        zi_d  = z_i.unsqueeze(1) * self.diag_matrices  # [P, SE, D]
        zj_d  = z_j.unsqueeze(1) * self.diag_matrices  # [P, SE, D]
        zj_dr = zj_d @ self.global_R.t()               # [P, SE, D]
        return (zi_d * zj_dr).sum(dim=-1)              # [P, SE]

    def decode_harmfulness(self, se_probs: torch.Tensor, freq_weights: torch.Tensor | None = None) -> torch.Tensor:
        if freq_weights is not None:
            se_probs = se_probs * freq_weights.unsqueeze(0)
        return self.harm_head(se_probs)

    def forward(
        self,
        drug_features,
        edge_index,
        drug_pairs,
        num_drugs,
        freq_weights=None,
        dd_edge_index=None,
        dp_edge_index=None,
        pp_edge_index=None,
    ):
        z         = self.encode(drug_features, edge_index, num_drugs, dd_edge_index, dp_edge_index, pp_edge_index)
        se_logits = self.decode_side_effects(z, drug_pairs)
        se_probs  = torch.sigmoid(se_logits)
        return se_logits, self.decode_harmfulness(se_probs, freq_weights)
