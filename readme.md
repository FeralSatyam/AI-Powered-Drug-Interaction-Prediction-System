# Polypharmacy Risk Detection

A GNN-powered clinical tool that predicts dangerous drug combinations before they reach patients.

---

## The Problem

When patients take multiple drugs simultaneously, interactions can occur through shared protein targets — causing serious adverse effects. The number of possible combinations from just 2,135 drugs is nearly 2 million. No database can cover them all, and existing tools only flag known pairs with binary yes/no alerts.

PharmaSafe uses a Graph Neural Network trained on biological drug-protein-protein interaction graphs to reason about combinations that were never explicitly tested.

---

## What It Does

Given a list of drugs, it:

1. Scores all pairwise combinations against **1,317 known polypharmacy side effects**
2. Assigns a **harm score per pair** and a **combined polypharmacy risk grade** (CRITICAL / HIGH / MODERATE / LOW)
3. Returns predicted side effects with severity and organ-system category
4. Stores per-patient medication history and lets clinicians generate a PDF report
5. Connects to an **AI pharmacology chatbot** pre-loaded with the detected interaction context

---

## Model

**Architecture:** DrugInteractionGNN (GraphSAGE encoder + diagonal bilinear decoder + MLP harm head)

**Graph:** 21,257 nodes (2,135 drugs + 19,122 proteins), 1,820,238 edges  
**Training data:** 4.6 M polypharmacy side-effect records — [DECAGON, Stanford SNAP](http://snap.stanford.edu/decagon/)  
**Labels:** 63,473 drug pairs · 1,317 side effects · 30.2% harmful

| Metric | Score |
|---|---|
| ROC-AUC | **0.884** |
| Recall (sensitivity) | **0.988** |
| Average Precision | 0.747 |
| F1 Score | 0.531 |

High recall (98.8%) is intentional — in a safety tool, missing a real interaction is far worse than a false positive.

---

## Stack

| Layer | Technology |
|---|---|
| ML model | PyTorch + PyTorch Geometric (GraphSAGE) |
| Backend | FastAPI |
| Frontend | React + Vite |
| AI chatbot | Gemini 2.5 Flash Lite |
| PDF export | jsPDF |

---

## Running Locally

```bash
# Backend
conda activate pytorch_env
python main.py          # starts at http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev
```

**Key endpoints**

```
GET  /drugs    list of all 2,135 valid drug IDs
POST /predict  { "drugs": ["Warfarin", "Aspirin", "Ibuprofen"] }
```

---

## Project Structure

```
.
├── main.py                      # FastAPI server
├── src/
│   ├── model.py                 # DrugInteractionGNN
│   └── predict.py               # Inference wrapper
├── models/best_model.pt         # Trained checkpoint
├── data/
│   ├── processed/               # Edge tensors, features, splits
│   └── mappings/                # Drug / protein / SE index maps
├── frontend/                    # React app
├── drug_interaction_gnn.ipynb   # Data pipeline + training
└── calculate_scores.ipynb       # Model evaluation (polypharmacy risk only)
```

---

## References

- Zitnik M, Agrawal M, Leskovec J. *Modeling polypharmacy side effects with graph convolutional networks.* Bioinformatics 2018. — [dataset](http://snap.stanford.edu/decagon/)
- Hamilton WL et al. *Inductive representation learning on large graphs.* NeurIPS 2017.
- SIDER side-effect database · ChEMBL 37 · STRING PPI network
