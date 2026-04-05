from __future__ import annotations

import logging
import os
import shutil
import tempfile
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from config import UPLOADS_DIR
from model_registry import ModelRegistry
from predictor_service import PredictionService
from report_generator import ReportGenerator
from schemas import ParkinsonClinicalRequest, SpeechFeatureRequest, TriageRequest
from symptom_router import triage_from_answers

logger = logging.getLogger("uvicorn.error")

# Suppress scikit-learn version warnings (models work despite pickle version mismatch)
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")


app = FastAPI(title="NeuroAI Multimodal Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

registry = ModelRegistry(Path(__file__).resolve().parent / "models")
report = registry.load_all()
service = PredictionService(registry)
report_generator = ReportGenerator()


def _save_upload(file: UploadFile) -> Path:
    """Save uploaded file to temp location and return path."""
    suffix = Path(file.filename or "upload.bin").suffix
    fd, tmp = tempfile.mkstemp(suffix=suffix, dir=str(UPLOADS_DIR))
    os.close(fd)  # Close the file descriptor immediately
    out_path = Path(tmp)
    with out_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    return out_path


def _cleanup_file(path: Optional[Path]) -> None:
    """Safely delete a file with Windows compatibility."""
    if not path:
        return
    try:
        path.unlink(missing_ok=True)
    except OSError as e:
        # On Windows, file locks can prevent immediate deletion
        logger.warning(f"Failed to delete temp file {path}: {e}")
        # File will be cleaned up by OS temp cleanup


def _education_to_score(education: Any) -> float:
    if isinstance(education, (int, float)):
        return float(education)
    text = str(education or "").strip().lower()
    mapping = {
        "high school": 8.0,
        "some college": 12.0,
        "bachelor": 16.0,
        "bachelor's": 16.0,
        "bachelor degree": 16.0,
        "graduate": 18.0,
        "graduate degree": 18.0,
        "postgraduate": 18.0,
    }
    return mapping.get(text, 10.0)


def _build_alzheimer_clinical_features(clinical_data: Dict[str, Any], expected_len: int) -> List[float]:
    age = float(clinical_data.get("age", 65))
    mmse = float(clinical_data.get("mmse", 24))
    edu = _education_to_score(clinical_data.get("education", 10))

    base = [
        age,
        mmse,
        edu,
        age / 10.0,
        mmse / 30.0,
        max(0.0, 30.0 - mmse),
        edu / 20.0,
        1.0 if age > 70 else 0.0,
        1.0 if mmse < 24 else 0.0,
    ]

    # Preserve training-time feature count compatibility.
    if len(base) >= expected_len:
        return base[:expected_len]
    return base + [0.0] * (expected_len - len(base))


def _build_parkinson_clinical_features(clinical_data: Dict[str, Any], expected_len: int) -> List[float]:
    age = float(clinical_data.get("age", 65))
    gender = str(clinical_data.get("gender", "female")).strip().lower()
    symptoms = clinical_data.get("symptoms") or {}

    def _sym(name: str) -> float:
        return 1.0 if bool(symptoms.get(name, False)) else 0.0

    tremor = _sym("tremor")
    rigidity = _sym("rigidity")
    bradykinesia = _sym("bradykinesia")
    postural = _sym("postural")
    speech = _sym("speech")
    depression = _sym("depression")
    sleep = _sym("sleep")
    voice_uploaded = 1.0 if bool(clinical_data.get("voice_uploaded", False)) else 0.0

    symptom_count = tremor + rigidity + bradykinesia + postural + speech + depression + sleep

    base = [
        age,
        1.0 if gender == "male" else 0.0,
        tremor,
        rigidity,
        bradykinesia,
        postural,
        speech,
        depression,
        sleep,
        symptom_count,
        1.0 if age > 60 else 0.0,
        1.0 if age > 70 else 0.0,
        tremor + rigidity,
        bradykinesia + postural,
        speech + depression,
        voice_uploaded,
        age / 100.0,
        symptom_count / 7.0,
        (tremor + bradykinesia + postural) / 3.0,
        (speech + sleep + depression) / 3.0,
    ]

    if len(base) >= expected_len:
        return base[:expected_len]
    return base + [0.0] * (expected_len - len(base))


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models": report,
        "ready": registry.healthy(),
    }


@app.post("/guided/triage")
def guided_triage(payload: TriageRequest):
    return triage_from_answers(payload.answers)


@app.post("/predict/direct")
async def predict_direct(
    disease: str = Form(...),
    clinical_features: Optional[str] = Form(None),
    speech_features: Optional[str] = Form(None),
    mri_file: Optional[UploadFile] = File(None),
    speech_file: Optional[UploadFile] = File(None),
):
    import json

    disease_key = disease.strip().lower()
    clinical = json.loads(clinical_features) if clinical_features else None
    speech = json.loads(speech_features) if speech_features else None

    mri_path = _save_upload(mri_file) if mri_file else None
    speech_path = _save_upload(speech_file) if speech_file else None

    try:
        if disease_key in {"alzheimers", "alzheimer", "alz"}:
            return service.predict_alzheimers(mri_path=mri_path, clinical_features=clinical)
        if disease_key in {"parkinsons", "parkinson", "pd"}:
            return service.predict_parkinsons(
                clinical_features=clinical,
                speech_features=speech,
                speech_audio_path=speech_path,
            )
        raise HTTPException(status_code=400, detail=f"Unsupported disease: {disease}")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    finally:
        _cleanup_file(mri_path)
        _cleanup_file(speech_path)


@app.post("/predict/alzheimer")
async def predict_alzheimer(
    mri_image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    clinical_data: Optional[str] = Form(None),
):
    import json

    upload = mri_image or file
    path = _save_upload(upload) if upload else None

    parsed_clinical: Optional[List[float]] = None
    if clinical_data:
        try:
            payload = json.loads(clinical_data)
        except json.JSONDecodeError:
            return JSONResponse(status_code=400, content={"error": "clinical_data must be valid JSON"})

        expected = service.get_alzheimer_clinical_feature_count()
        if isinstance(payload, dict):
            parsed_clinical = _build_alzheimer_clinical_features(payload, expected)
        elif isinstance(payload, list):
            parsed_clinical = [float(v) for v in payload]
        else:
            return JSONResponse(status_code=400, content={"error": "clinical_data must be an object or feature list"})

    if path is None and parsed_clinical is None:
        return JSONResponse(status_code=400, content={"error": "Provide at least one modality: mri_image or clinical_data"})

    try:
        result = service.predict_alzheimers(mri_path=path, clinical_features=parsed_clinical)
        return {
            "disease": "Alzheimer's",
            "prediction": result["prediction"],
            "class_prediction": result.get("class_prediction", result["prediction"]),
            "confidence": result["confidence"],
            "stage": result["stage"],
            "severity_level": result.get("severity_level", result["stage"]),
            "risk_level": result.get("risk_level", "N/A"),
            "abnormality_type": result.get("abnormality_type", "N/A"),
            "confidence_control": result.get("confidence_control", {}),
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "modality_breakdown": result.get("modality_breakdown", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "medical_disclaimer": result.get("medical_disclaimer", "AI support only; specialist confirmation required."),
            "notes": result.get("notes", []),
            "heatmap": result["explainability"].get("mri_heatmap"),
            "explanation": result.get("explanation", result["explainability"].get("summary")),
            "key_findings": result.get("notes", []),
        }
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
    finally:
        _cleanup_file(path)


@app.post("/predict/brain_tumor")
async def predict_brain_tumor(file: UploadFile = File(...)):
    path = _save_upload(file)
    try:
        result = service.predict_brain_tumor(mri_path=path)
        return {
            "disease": result["disease"],
            "prediction": result["prediction"],
            "class_prediction": result.get("class_prediction", result["prediction"]),
            "confidence": result["confidence"],
            "stage": result["stage"],
            "severity_level": result.get("severity_level", result["stage"]),
            "risk_level": result.get("risk_level", "N/A"),
            "abnormality_type": result.get("abnormality_type", "N/A"),
            "confidence_control": result.get("confidence_control", {}),
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "modality_breakdown": result.get("modality_breakdown", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "medical_disclaimer": result.get("medical_disclaimer", "AI support only; specialist confirmation required."),
            "notes": result.get("notes", []),
            "heatmap": result["explainability"].get("mri_heatmap"),
            "explanation": result.get("explanation", result["explainability"].get("summary")),
            "key_findings": result.get("notes", []),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid MRI file: {str(exc)}") from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail="Brain tumor model unavailable. Please try again later.",
        ) from exc
    finally:
        _cleanup_file(path)


@app.post("/predict/alzheimer/clinical")
def predict_alzheimer_clinical(payload: SpeechFeatureRequest):
    try:
        expected = service.get_alzheimer_clinical_feature_count()
        got = len(payload.features)
        if got != expected:
            return JSONResponse(status_code=400, content={"error": f"Expected {expected} features, got {got}"})

        result = service.predict_alzheimers(mri_path=None, clinical_features=payload.features)
        return {
            "disease": "Alzheimer (Clinical)",
            "prediction": result["prediction"],
            "class_prediction": result.get("class_prediction", result["prediction"]),
            "confidence": result["confidence"],
            "stage": result["stage"],
            "severity_level": result.get("severity_level", result["stage"]),
            "risk_level": result.get("risk_level", "N/A"),
            "abnormality_type": result.get("abnormality_type", "N/A"),
            "confidence_control": result.get("confidence_control", {}),
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "medical_disclaimer": result.get("medical_disclaimer", "AI support only; specialist confirmation required."),
            "explanation": result.get("explanation", result.get("explainability", {}).get("summary")),
        }
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})


@app.post("/predict/parkinson/clinical")
def predict_parkinson_clinical(payload: ParkinsonClinicalRequest):
    try:
        expected = service.get_parkinson_clinical_feature_count()
        got = len(payload.features)
        if got != expected:
            return JSONResponse(status_code=400, content={"error": f"Expected {expected} features, got {got}"})

        result = service.predict_parkinsons(clinical_features=payload.features)
        return {
            "disease": "Parkinson (Clinical)",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "stage": result["stage"],
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "explanation": result.get("explainability", {}).get("summary"),
        }
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})


@app.post("/predict/parkinson/speech")
def predict_parkinson_speech(payload: SpeechFeatureRequest):
    try:
        expected = service.get_parkinson_speech_feature_count()
        got = len(payload.features)
        if got != expected:
            return JSONResponse(status_code=400, content={"error": f"Expected {expected} features, got {got}"})

        result = service.predict_parkinsons(speech_features=payload.features)
        return {
            "disease": "Parkinson (Speech)",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "stage": result["stage"],
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "explanation": result.get("explainability", {}).get("summary"),
        }
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})

    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})


@app.post("/predict/parkinson/audio")
async def predict_parkinson_audio(file: UploadFile = File(...), clinical_features: Optional[str] = Form(None)):
    import json

    path = _save_upload(file)
    clinical = None
    if clinical_features:
        try:
            clinical = json.loads(clinical_features)
        except json.JSONDecodeError:
            return JSONResponse(status_code=400, content={"error": "clinical_features must be valid JSON array"})

    try:
        return service.predict_parkinsons(speech_audio_path=path, clinical_features=clinical)
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
    finally:
        _cleanup_file(path)


@app.post("/predict/parkinson")
async def predict_parkinson(
    speech_file: Optional[UploadFile] = File(None),
    clinical_data: Optional[str] = Form(None),
    clinical_features: Optional[str] = Form(None),
):
    import json

    speech_path = _save_upload(speech_file) if speech_file else None

    parsed_clinical = None
    raw_clinical = clinical_data if clinical_data is not None else clinical_features

    if raw_clinical is not None and raw_clinical.strip() != "":
        try:
            parsed_clinical = json.loads(raw_clinical)
        except json.JSONDecodeError:
            return JSONResponse(status_code=400, content={"error": "clinical_data must be valid JSON"})

    if isinstance(parsed_clinical, dict):
        if isinstance(parsed_clinical.get("features"), list):
            parsed_clinical = parsed_clinical["features"]
        else:
            expected = service.get_parkinson_clinical_feature_count()
            parsed_clinical = _build_parkinson_clinical_features(parsed_clinical, expected)

    if parsed_clinical is not None and not isinstance(parsed_clinical, list):
        return JSONResponse(status_code=400, content={"error": "clinical_data must be a JSON array or object"})

    try:
        result = service.predict_parkinsons_training_pipeline(
            speech_audio_path=speech_path,
            clinical_features=parsed_clinical,
        )
        return {
            "disease": result["disease"],
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "stage": result["stage"],
            "probabilities": result.get("probabilities", {}),
            "explainability": result.get("explainability", {}),
            "modality_breakdown": result.get("modality_breakdown", {}),
            "recommendation": result.get("recommendation", "Consult a specialist for final review."),
            "notes": result.get("notes", []),
            "explanation": result.get("explainability", {}).get("summary", ""),
        }
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
    finally:
        _cleanup_file(speech_path)


@app.post("/predict/guided")
async def predict_guided(
    triage: TriageRequest,
    clinical_features: Optional[Dict[str, Any]] = None,
):
    triage_result = triage_from_answers(triage.answers)
    probable = triage_result["probable_disease"]
    if probable == "alzheimers":
        if clinical_features and "features" in clinical_features:
            result = service.predict_alzheimers(clinical_features=clinical_features["features"])
        else:
            raise HTTPException(status_code=400, detail="Guided alzheimers flow needs at least one modality payload")
    elif probable == "parkinsons":
        if clinical_features and "features" in clinical_features:
            result = service.predict_parkinsons(clinical_features=clinical_features["features"])
        else:
            raise HTTPException(status_code=400, detail="Guided parkinsons flow needs at least one modality payload")
    else:
        raise HTTPException(status_code=400, detail="Guided brain tumor flow needs an MRI payload through the direct prediction endpoint")
    return {
        "triage": triage_result,
        "result": result,
    }


@app.post("/generate-report")
def generate_report(payload: Dict[str, Any]):
    # Accepts both legacy frontend payload and new structured payload.
    if "result" in payload:
        patient_summary = payload.get("patient_summary", {})
        result = payload["result"]
    else:
        result = {
            "disease": payload.get("disease", "Unknown"),
            "prediction": payload.get("prediction", "Unknown"),
            "confidence": payload.get("confidence", 0.0),
            "stage": payload.get("prediction", "Unknown"),
            "recommendation": "Consult doctor for final clinical interpretation.",
            "explainability": {
                "summary": payload.get("explanation", "No explanation provided."),
                "mri_heatmap": payload.get("heatmap"),
                "clinical_feature_importance": payload.get("feature_importance", []),
            },
        }
        patient_summary = payload.get("patient_summary", {})

    pdf_bytes = report_generator.generate_report(patient_summary=patient_summary, result=result)
    filename = report_generator.get_filename(result.get("disease", "unknown"))
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    if request.url.path == "/predict/parkinson/clinical":
        body = None
        try:
            body = await request.json()
        except Exception:
            body = None

        expected_text = "the required"
        try:
            expected_text = str(service.get_parkinson_clinical_feature_count())
        except Exception:
            expected_text = "the required"

        if isinstance(body, dict) and isinstance(body.get("features"), list):
            return JSONResponse(
                status_code=400,
                content={"error": f"Expected {expected_text} features, got {len(body['features'])}"},
            )

        return JSONResponse(status_code=400, content={"error": "Expected payload: {'features': [f1..fN]}"})

    return JSONResponse(status_code=422, content={"error": "Request validation failed", "detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    return JSONResponse(status_code=500, content={"error": str(exc), "type": "internal_error"})
