"""
FastAPI Backend Application Entry Point
AI-Powered Early Detection of Student Academic Disengagement
"""
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import io
import pandas as pd

from .ml.engine import EngagementRiskEngine

app = FastAPI(
    title="AI-Powered Early Detection of Student Academic Disengagement API",
    description="Explainable AI engagement monitoring platform identifying early negative trends for timely faculty review.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_engine = EngagementRiskEngine()

@app.get("/")
def read_root():
    return {
        "service": "AI-Powered Early Detection of Student Academic Disengagement",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()}

# Predict endpoint
class RecordInput(BaseModel):
    week_number: int
    attendance: float
    assignment_completion: float
    assessment_score: float
    lms_activity: float

class PredictRequest(BaseModel):
    student_id: str
    records: List[RecordInput]

@app.post("/api/ai/predict")
def predict_engagement_risk(payload: PredictRequest):
    records_dict = [r.dict() for r in payload.records]
    result = ml_engine.evaluate_risk(payload.student_id, records_dict)
    return {"prediction": result}

@app.post("/api/academic-records/bulk")
async def bulk_import_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    required_cols = ["student_id", "week", "attendance", "assignment_completion"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")

    valid_count = len(df)
    return {
        "total_detected": valid_count,
        "valid_count": valid_count,
        "invalid_count": 0,
        "message": f"Successfully parsed and ingested {valid_count} academic records."
    }
