from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

import joblib


class ModelSpec:
    def __init__(self, filename: str, model_type: str, required: bool, disease: str, modality: str, input_size: Optional[int] = None, feature_count: Optional[int] = None):
        self.filename = filename
        self.model_type = model_type
        self.required = required
        self.disease = disease
        self.modality = modality
        self.input_size = input_size
        self.feature_count = feature_count


class ModelRegistry:
    SPECS = [
        ModelSpec("alzheimer_model.h5", "keras", False, "alzheimers", "mri", input_size=224),
        ModelSpec("brain_tumor_model.h5", "keras", False, "tumor", "mri", input_size=128),
        ModelSpec("clincial_model_alz.pkl", "sklearn", False, "alzheimers", "clinical", feature_count=16),
        ModelSpec("clinical_model.pkl", "sklearn", True, "parkinsons", "clinical", feature_count=16),
        ModelSpec("clinical_scaler.pkl", "sklearn", True, "parkinsons", "clinical_scaler", feature_count=16),
        ModelSpec("speech_model.pkl", "sklearn", True, "parkinsons", "speech", feature_count=26),
        ModelSpec("speech_scaler.pkl", "sklearn", True, "parkinsons", "speech_scaler", feature_count=26),
    ]

    def __init__(self, models_dir: Path):
        self.models_dir = Path(models_dir)
        self.models: Dict[str, Any] = {}
        self.report: Dict[str, Any] = {
            "loaded": [],
            "missing_required": [],
            "missing_optional": [],
            "errors": [],
        }

    def load_all(self) -> Dict[str, Any]:
        self.models.clear()
        self.report = {
            "loaded": [],
            "missing_required": [],
            "missing_optional": [],
            "errors": [],
        }

        for spec in self.SPECS:
            path = self.models_dir / spec.filename
            if not path.exists():
                bucket = "missing_required" if spec.required else "missing_optional"
                self.report[bucket].append(spec.filename)
                continue

            try:
                model = self._load_by_type(path, spec.model_type)
                self.models[spec.filename] = model
                self.report["loaded"].append(spec.filename)
            except Exception as exc:
                self.report["errors"].append({"model": spec.filename, "error": str(exc)})

        return self.report

    def _load_by_type(self, path: Path, model_type: str):
        if model_type == "keras":
            try:
                from tensorflow.keras.models import load_model as tf_load_model

                return tf_load_model(path)
            except Exception:
                from keras.models import load_model as keras_load_model

                return keras_load_model(path)
        return joblib.load(path)

    def get(self, filename: str):
        return self.models.get(filename)

    def healthy(self) -> bool:
        return len(self.report["missing_required"]) == 0 and len(self.report["errors"]) == 0
