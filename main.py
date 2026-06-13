import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
load_dotenv()

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.predict import DrugInteractionPredictor

MODEL_PATH      = "models/best_model.pt"
GEMINI_API_KEY  = os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_URL  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"

predictor: DrugInteractionPredictor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    predictor = DrugInteractionPredictor(MODEL_PATH)
    yield


app = FastAPI(title="Drug Interaction API", lifespan=lifespan)


class PredictRequest(BaseModel):
    drugs: list[str]


class ExplainRequest(BaseModel):
    drugs: list[str]
    risk_level: str
    side_effects: list[str]


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
def predict(req: PredictRequest) -> dict[str, Any]:
    if len(req.drugs) < 2:
        raise HTTPException(status_code=400, detail="At least 2 drug names are required.")
    try:
        return predictor.predict(req.drugs)
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/drugs")
def get_drugs() -> list[str]:
    return predictor.get_available_drugs()


def _fallback_explanation(drugs: list[str], risk_level: str) -> str:
    drugs_str = " and ".join(drugs)
    risk = risk_level.lower()
    return (
        f"The combination of {drugs_str} carries {risk} interaction risk based on shared "
        f"pharmacological pathways. Consult a pharmacist or clinical reference for detailed guidance."
    )


@app.post("/explain")
async def explain(req: ExplainRequest) -> dict[str, str]:
    drugs_str = " + ".join(req.drugs)
    prompt = (
        f"You are a clinical pharmacist advising a physician.\n\n"
        f"The patient is prescribed: {drugs_str}\n"
        f"A drug interaction model has flagged this combination as {req.risk_level.upper()} risk.\n\n"
        f"In exactly 3 concise sentences aimed at healthcare professionals:\n"
        f"1. Explain the known pharmacological mechanism behind this interaction.\n"
        f"2. Describe what clinical symptoms or effects the patient may experience.\n"
        f"3. State the recommended monitoring or clinical precautions.\n\n"
        f"Be specific and factual. Do not hedge with 'may' excessively. "
        f"Do not mention any AI model or prediction system."
    )

    if not GEMINI_API_KEY:
        return {"explanation": _fallback_explanation(req.drugs, req.risk_level)}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"maxOutputTokens": 512, "temperature": 0.2},
                },
            )
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        return {"explanation": text}
    except Exception:
        return {"explanation": _fallback_explanation(req.drugs, req.risk_level)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
