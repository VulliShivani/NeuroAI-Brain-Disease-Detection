from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)


class TriageResponse(BaseModel):
    probable_disease: str
    confidence: float
    disease_scores: Dict[str, float]
    next_questions: List[str] = Field(default_factory=list)


class ClinicalPredictRequest(BaseModel):
    disease: str
    features: List[float]


class SpeechFeatureRequest(BaseModel):
    features: List[float]


class ParkinsonClinicalRequest(BaseModel):
    # IMPORTANT: Expected feature count is determined from saved training artifacts
    # (scaler/model n_features_in_), not hardcoded here.
    features: List[float]


class UnifiedPredictResponse(BaseModel):
    disease: str
    prediction: str
    confidence: float
    stage: str
    modality_breakdown: Dict[str, Any]
    probabilities: Dict[str, float]
    explainability: Dict[str, Any]
    recommendation: str
    notes: List[str] = Field(default_factory=list)


class ReportRequest(BaseModel):
    patient_summary: Dict[str, Any] = Field(default_factory=dict)
    result: Dict[str, Any]
