from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np

from config import ALZHEIMER_CLASSES, BRAIN_TUMOR_CLASSES, FUSION_WEIGHTS, PARKINSON_CLASSES
from explainability import ExplainabilityEngine
from fusion import weighted_late_fusion
from input_validator import InputValidator
from model_registry import ModelRegistry
from preprocessing import Preprocessor


class PredictionService:
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.xai = ExplainabilityEngine()

    @staticmethod
    def _confidence_control(confidence: float) -> Dict[str, Any]:
        if confidence < 0.40:
            return {
                "status": "Uncertain - Needs Review",
                "heatmap_intensity": "very_light",
                "range": "<40%",
            }
        if confidence <= 0.70:
            return {
                "status": "Possible Pattern",
                "heatmap_intensity": "medium",
                "range": "40-70%",
            }
        return {
            "status": "Confirmed Pattern",
            "heatmap_intensity": "strong",
            "range": ">70%",
        }

    @staticmethod
    def _tumor_clinical_profile(prediction: str, confidence: float) -> Dict[str, str]:
        mapping = {
            "notumor": {
                "class_prediction": "No Tumor",
                "severity_level": "Normal",
                "risk_level": "Low",
                "abnormality_type": "None",
                "explanation": "No abnormality detected",
                "recommendation": "No focal tumor pattern detected. Continue routine clinical follow-up if symptoms persist.",
            },
            "pituitary": {
                "class_prediction": "Pituitary Tumor",
                "severity_level": "Mild",
                "risk_level": "Low-Moderate",
                "abnormality_type": "Localized",
                "explanation": "Localized abnormality in pituitary region",
                "recommendation": "Correlate with endocrine profile and schedule focused sellar MRI review.",
            },
            "meningioma": {
                "class_prediction": "Meningioma",
                "severity_level": "Moderate",
                "risk_level": "Moderate",
                "abnormality_type": "Localized",
                "explanation": "Well-defined extra-axial lesion",
                "recommendation": "Recommend neurosurgical and neuroradiology consultation for lesion characterization.",
            },
            "glioma": {
                "class_prediction": "Glioma",
                "severity_level": "High/Critical",
                "risk_level": "High",
                "abnormality_type": "Diffuse",
                "explanation": "Diffuse infiltrative tumor pattern",
                "recommendation": "Urgent neuro-oncology review and contrast-enhanced MRI protocol are recommended.",
            },
        }
        profile = dict(mapping.get(prediction, mapping["notumor"]))

        # Safety: avoid definitive tumor wording under low confidence.
        if prediction != "notumor" and confidence < 0.70:
            profile["recommendation"] = "Possible tumor pattern. Immediate specialist review and confirmatory imaging are required."
        return profile

    @staticmethod
    def _alzheimer_clinical_profile(prediction: str) -> Dict[str, str]:
        mapping = {
            "NonDemented": {
                "class_prediction": "Non Demented",
                "severity_level": "Normal",
                "risk_level": "Low",
                "abnormality_type": "None",
                "explanation": "No neurodegeneration detected",
                "recommendation": "Maintain routine cognitive follow-up and risk-factor control.",
            },
            "VeryMildDemented": {
                "class_prediction": "Very Mild Demented",
                "severity_level": "Early Stage",
                "risk_level": "Low-Moderate",
                "abnormality_type": "Localized",
                "explanation": "Subtle early changes in memory regions",
                "recommendation": "Initiate early cognitive intervention and repeat structured cognitive assessment.",
            },
            "MildDemented": {
                "class_prediction": "Mild Demented",
                "severity_level": "Moderate",
                "risk_level": "Moderate",
                "abnormality_type": "Diffuse",
                "explanation": "Moderate neurodegeneration",
                "recommendation": "Recommend neurologist review, caregiver planning, and multimodal follow-up.",
            },
            "ModerateDemented": {
                "class_prediction": "Moderate Demented",
                "severity_level": "High",
                "risk_level": "High",
                "abnormality_type": "Diffuse",
                "explanation": "Advanced neurodegeneration with brain atrophy",
                "recommendation": "Urgent specialist care pathway and comprehensive dementia management planning are advised.",
            },
        }
        return dict(mapping.get(prediction, mapping["NonDemented"]))

    @staticmethod
    def _tumor_detailed_explanation(profile: Dict[str, str], confidence: float, policy_status: str) -> str:
        location_hint = {
            "No Tumor": "No focal intracranial lesion pattern is emphasized.",
            "Pituitary Tumor": "Activation is concentrated near the central sellar/pituitary region.",
            "Meningioma": "Activation tracks an outer extra-axial boundary pattern, consistent with peripheral lesion margins.",
            "Glioma": "Activation is diffuse and irregular within parenchymal regions, suggesting infiltrative spread.",
        }.get(profile.get("class_prediction", "No Tumor"), "Activation pattern is not localized to a single canonical region.")

        return (
            f"Method: MRI explainability is produced using Grad-CAM over the final convolutional feature maps, then normalized, "
            f"contrast-enhanced, and rendered with JET colormap for visual interpretation. "
            f"How this result was obtained: the model assigned {confidence * 100:.1f}% confidence to class '{profile.get('class_prediction', 'Unknown')}', "
            f"which corresponds to severity '{profile.get('severity_level', 'N/A')}' and risk '{profile.get('risk_level', 'N/A')}'. "
            f"Where the model is focusing: {location_hint} "
            f"Clinical interpretation: {profile.get('explanation', 'No class-specific explanation available')}. "
            f"Decision status: {policy_status}. "
            f"Recommended actions: {profile.get('recommendation', 'Specialist correlation advised')}. "
            "Precautions: do not use this as a standalone diagnosis; correlate with contrast MRI sequences, full neurological exam, and radiology report before treatment planning."
        )

    @staticmethod
    def _alzheimer_detailed_explanation(profile: Dict[str, str], prediction: str, confidence: float, policy_status: str) -> str:
        region_hint = {
            "NonDemented": "No sustained neurodegenerative hotspot is emphasized.",
            "VeryMildDemented": "Mild bilateral emphasis appears in memory-associated medial temporal/hippocampal regions.",
            "MildDemented": "Visible spread extends across temporal lobe memory networks.",
            "ModerateDemented": "Widespread smooth activation pattern suggests advanced cortical and subcortical involvement.",
        }.get(prediction, "Region emphasis is mixed and requires specialist interpretation.")

        return (
            f"Method: Alzheimer explainability uses Grad-CAM and a smooth regional prior to avoid sharp, non-physiologic boundaries. "
            f"The map is normalized, power-scaled, and blended on grayscale MRI for clinician readability. "
            f"How this result was obtained: predicted stage is '{profile.get('class_prediction', prediction)}' at {confidence * 100:.1f}% confidence, "
            f"mapped to severity '{profile.get('severity_level', 'N/A')}' and risk '{profile.get('risk_level', 'N/A')}'. "
            f"Where changes are suggested: {region_hint} "
            f"Clinical interpretation: {profile.get('explanation', 'No class-specific explanation available')}. "
            f"Decision status: {policy_status}. "
            f"Recommended actions: {profile.get('recommendation', 'Neurology follow-up advised')}. "
            "Precautions: integrate with MMSE/cognitive testing, medication history, and longitudinal imaging before final diagnosis or staging decisions."
        )

    def predict_alzheimers(
        self,
        mri_path: Optional[Path] = None,
        clinical_features: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        modality_results: Dict[str, Dict[str, Any]] = {}
        notes: List[str] = []

        if mri_path is not None:
            ok, errors, warnings = InputValidator.validate_image_file(mri_path)
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            modality_results["mri"] = self._predict_alzheimer_mri(str(mri_path))

        if clinical_features is not None:
            expected = self._expected_alzheimer_clinical_features()
            ok, errors, warnings = InputValidator.validate_vector(clinical_features, expected, "clinical_features")
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            modality_results["clinical"] = self._predict_alzheimer_clinical(clinical_features)

        return self._fuse_alzheimer(modality_results, notes)

    def predict_parkinsons(
        self,
        speech_features: Optional[List[float]] = None,
        clinical_features: Optional[List[float]] = None,
        speech_audio_path: Optional[Path] = None,
    ) -> Dict[str, Any]:
        modality_results: Dict[str, Dict[str, Any]] = {}
        notes: List[str] = []

        if speech_audio_path is not None and speech_features is None:
            ok, errors, warnings = InputValidator.validate_audio_file(speech_audio_path)
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            speech_expected = self._expected_parkinson_speech_features()
            speech_features = Preprocessor.extract_mfcc(str(speech_audio_path), n_mfcc=speech_expected).tolist()

        if speech_features is not None:
            speech_expected = self._expected_parkinson_speech_features()
            ok, errors, warnings = InputValidator.validate_vector(speech_features, speech_expected, "speech_features")
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            modality_results["speech"] = self._predict_parkinson_speech(speech_features)

        if clinical_features is not None:
            clinical_expected = self._expected_parkinson_clinical_features()
            ok, errors, warnings = InputValidator.validate_vector(clinical_features, clinical_expected, "clinical_features")
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            modality_results["clinical"] = self._predict_parkinson_clinical(clinical_features)

        return self._fuse_parkinson(modality_results, notes)

    def predict_parkinsons_training_pipeline(
        self,
        speech_features: Optional[List[float]] = None,
        clinical_features: Optional[List[float]] = None,
        speech_audio_path: Optional[Path] = None,
    ) -> Dict[str, Any]:
        """
        Reconstruct the same Parkinson multimodal pipeline used during training:
        - per-modality preprocessing with saved scalers
        - modality-wise probability scores
        - simple average fusion when both modalities exist
        """
        notes: List[str] = []
        speech_positive: Optional[float] = None
        clinical_positive: Optional[float] = None
        explainability: Dict[str, Any] = {}

        if speech_audio_path is not None and speech_features is None:
            ok, errors, warnings = InputValidator.validate_audio_file(speech_audio_path)
            if not ok:
                raise ValueError(errors[0])
            notes.extend(warnings)
            speech_features = Preprocessor.extract_mfcc(
                str(speech_audio_path),
                n_mfcc=self._expected_parkinson_speech_features(),
            ).tolist()

        if speech_features is not None:
            speech_expected = self._expected_parkinson_speech_features()
            ok, errors, warnings = InputValidator.validate_vector(speech_features, speech_expected, "speech_features")
            if not ok:
                # Graceful missing-modality handling: if clinical modality is available,
                # continue with clinical-only inference instead of failing the whole request.
                if clinical_features is not None:
                    notes.append(f"Speech modality skipped: {errors[0]}")
                else:
                    raise ValueError(errors[0])
            else:
                notes.extend(warnings)
                speech_result = self._predict_parkinson_speech(speech_features)
                speech_positive = float(speech_result["probabilities"].get("Positive", 0.0))
                explainability["speech_feature_importance"] = speech_result.get("feature_importance", [])

        if clinical_features is not None:
            clinical_expected = self._expected_parkinson_clinical_features()
            ok, errors, warnings = InputValidator.validate_vector(clinical_features, clinical_expected, "clinical_features")
            if not ok:
                # Graceful missing-modality handling: if speech modality is available,
                # continue with speech-only inference instead of failing the whole request.
                if speech_features is not None or speech_audio_path is not None:
                    notes.append(f"Clinical modality skipped: {errors[0]}")
                else:
                    raise ValueError(errors[0])
            else:
                notes.extend(warnings)
                clinical_result = self._predict_parkinson_clinical(clinical_features)
                clinical_positive = float(clinical_result["probabilities"].get("Positive", 0.0))
                explainability["clinical_feature_importance"] = clinical_result.get("feature_importance", [])

        if speech_positive is None and clinical_positive is None:
            raise ValueError("At least one modality is required for parkinsons prediction")

        if speech_positive is not None and clinical_positive is not None:
            final_positive = (speech_positive + clinical_positive) / 2.0
        elif speech_positive is not None:
            final_positive = speech_positive
        else:
            final_positive = float(clinical_positive)

        prediction = "Positive" if final_positive > 0.5 else "Negative"
        stage = "Early" if final_positive < 0.4 else ("Moderate" if final_positive < 0.7 else "Severe")
        confidence = float(final_positive)

        explainability["summary"] = self.xai.plain_language_summary(
            "Parkinsons",
            prediction,
            confidence,
            stage,
            int(speech_positive is not None) + int(clinical_positive is not None),
        )

        return {
            "disease": "Parkinson's",
            "prediction": prediction,
            "confidence": confidence,
            "stage": stage,
            "probabilities": {
                "Negative": float(1.0 - final_positive),
                "Positive": float(final_positive),
            },
            "explainability": explainability,
            "notes": notes,
        }

    def _expected_parkinson_clinical_features(self) -> int:
        scaler = self.registry.get("clinical_scaler.pkl")
        model = self.registry.get("clinical_model.pkl")
        if scaler is not None and hasattr(scaler, "n_features_in_"):
            return int(scaler.n_features_in_)
        if model is not None and hasattr(model, "n_features_in_"):
            return int(model.n_features_in_)
        raise RuntimeError("Cannot determine Parkinson clinical feature count from loaded artifacts")

    def _expected_parkinson_speech_features(self) -> int:
        scaler = self.registry.get("speech_scaler.pkl")
        model = self.registry.get("speech_model.pkl")
        if scaler is not None and hasattr(scaler, "n_features_in_"):
            return int(scaler.n_features_in_)
        if model is not None and hasattr(model, "n_features_in_"):
            return int(model.n_features_in_)
        raise RuntimeError("Cannot determine Parkinson speech feature count from loaded artifacts")

    def get_parkinson_clinical_feature_count(self) -> int:
        return self._expected_parkinson_clinical_features()

    def get_parkinson_speech_feature_count(self) -> int:
        return self._expected_parkinson_speech_features()

    def _expected_alzheimer_clinical_features(self) -> int:
        model = self.registry.get("clincial_model_alz.pkl")
        if model is not None and hasattr(model, "n_features_in_"):
            return int(model.n_features_in_)
        # Keep legacy fallback only if metadata is unavailable.
        return 16

    def get_alzheimer_clinical_feature_count(self) -> int:
        return self._expected_alzheimer_clinical_features()

    def predict_brain_tumor(self, mri_path: Path) -> Dict[str, Any]:
        ok, errors, warnings = InputValidator.validate_image_file(mri_path)
        if not ok:
            raise ValueError(errors[0])

        model = self.registry.get("brain_tumor_model.h5")
        if model is None:
            raise RuntimeError("Required model unavailable: brain_tumor_model.h5")

        x = Preprocessor.preprocess_mri(str(mri_path), size=128)
        probs = model.predict(x, verbose=0)[0]
        probs_dict = {label: float(p) for label, p in zip(BRAIN_TUMOR_CLASSES, probs)}
        pred_idx = int(np.argmax(probs))
        pred_label = BRAIN_TUMOR_CLASSES[pred_idx]
        conf = float(np.max(probs))

        confidence_policy = self._confidence_control(conf)
        profile = self._tumor_clinical_profile(pred_label, conf)

        heatmap = self.xai.generate_grad_cam(model, x)
        visual_bundle = self.xai.build_mri_visual_bundle(
            img_array=x,
            raw_heatmap=heatmap,
            disease="Brain Tumor",
            prediction=pred_label,
            confidence=conf,
            allow_heatmap=(pred_label != "notumor"),
        )
        notes_out = list(warnings)

        if pred_label != "notumor" and conf < 0.70:
            notes_out.append("Tumor class confidence is below 70%; flagged as possible pattern requiring expert confirmation.")
        if pred_label == "notumor":
            notes_out.append("No tumor class selected; heatmap intentionally suppressed to avoid false lesion emphasis.")

        summary = (
            f"{confidence_policy['status']}: {profile['class_prediction']} with {conf * 100:.1f}% confidence. "
            f"Severity {profile['severity_level']}, risk {profile['risk_level']}. "
            f"Pattern: {profile['abnormality_type'].lower()}. {profile['explanation']}."
        )
        detailed_summary = self._tumor_detailed_explanation(profile, conf, confidence_policy["status"])

        return {
            "disease": "Brain Tumor",
            "disease_type": "Brain Tumor",
            "prediction": pred_label,
            "class_prediction": profile["class_prediction"],
            "confidence": conf,
            "stage": pred_label,
            "severity_level": profile["severity_level"],
            "risk_level": profile["risk_level"],
            "abnormality_type": profile["abnormality_type"],
            "confidence_control": confidence_policy,
            "diagnostic_statement": confidence_policy["status"],
            "explanation": detailed_summary,
            "medical_disclaimer": "AI decision support only. Final diagnosis requires radiologist and neurologist confirmation.",
            "probabilities": probs_dict,
            "explainability": {
                "mri_heatmap": visual_bundle.get("overlay"),
                "mri_panels": visual_bundle,
                "summary": summary,
                "detailed_summary": detailed_summary,
                "clinical_recommendations": profile["recommendation"],
                "precautions": "Do not interpret as standalone diagnosis. Correlate with neuroradiology, contrast imaging, and complete clinical context.",
            },
            "notes": notes_out,
            "recommendation": profile["recommendation"],
        }

    def _predict_alzheimer_mri(self, image_path: str) -> Dict[str, Any]:
        model = self.registry.get("alzheimer_model.h5")
        if model is None:
            raise RuntimeError("Required model unavailable: alzheimer_model.h5")

        x = Preprocessor.preprocess_mri(image_path, size=224)
        probs = model.predict(x, verbose=0)[0]
        probs_dict = {label: float(p) for label, p in zip(ALZHEIMER_CLASSES, probs)}
        pred_idx = int(np.argmax(probs))
        pred_label = ALZHEIMER_CLASSES[pred_idx]
        conf = float(np.max(probs))

        heatmap = self.xai.generate_grad_cam(model, x)
        visual_bundle = self.xai.build_mri_visual_bundle(
            img_array=x,
            raw_heatmap=heatmap,
            disease="Alzheimers",
            prediction=pred_label,
            confidence=conf,
            allow_heatmap=(pred_label != "NonDemented"),
        )

        return {
            "prediction": pred_label,
            "confidence": conf,
            "probabilities": probs_dict,
            "stage": pred_label,
            "heatmap": visual_bundle.get("overlay"),
            "mri_panels": visual_bundle,
        }

    def _predict_alzheimer_clinical(self, features: List[float]) -> Dict[str, Any]:
        model = self.registry.get("clincial_model_alz.pkl")
        x = Preprocessor.preprocess_clinical(features)

        age = float(features[0]) if len(features) > 0 else None
        mmse = float(features[1]) if len(features) > 1 else None
        rule_stage = self._alzheimer_stage_from_mmse(mmse)
        rule_probs = self._alzheimer_rule_distribution(rule_stage)

        model_positive_risk: Optional[float] = None
        imp: List[Dict[str, float]] = []
        if model is not None:
            try:
                pred = int(model.predict(x)[0])
                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(x)[0]
                    model_positive_risk = float(proba[-1])
                else:
                    model_positive_risk = float(pred)
                imp = self.xai.tabular_feature_importance(model, x, prefix="alz_clinical")
            except Exception:
                # Keep fallback operational even if model inference fails.
                model_positive_risk = None

        if model_positive_risk is not None:
            risk_probs = {
                "NonDemented": max(0.0, 1.0 - model_positive_risk),
                "VeryMildDemented": model_positive_risk * 0.45,
                "MildDemented": model_positive_risk * 0.35,
                "ModerateDemented": model_positive_risk * 0.20,
            }
            total = float(sum(risk_probs.values())) or 1.0
            risk_probs = {k: float(v / total) for k, v in risk_probs.items()}
            probs_dict = {
                k: float(0.75 * rule_probs.get(k, 0.0) + 0.25 * risk_probs.get(k, 0.0))
                for k in ALZHEIMER_CLASSES
            }
        else:
            probs_dict = dict(rule_probs)

        pred_label = max(probs_dict, key=probs_dict.get)
        conf = float(probs_dict[pred_label])
        reasoning = self._build_alzheimer_clinical_reasoning(
            age=age,
            mmse=mmse,
            rule_stage=rule_stage,
            model_positive_risk=model_positive_risk,
        )

        return {
            "prediction": pred_label,
            "confidence": conf,
            "probabilities": probs_dict,
            "stage": pred_label,
            "feature_importance": imp,
            "clinical_reasoning": reasoning,
        }

    @staticmethod
    def _alzheimer_stage_from_mmse(mmse: Optional[float]) -> str:
        if mmse is None:
            return "VeryMildDemented"
        if mmse >= 27:
            return "NonDemented"
        if mmse >= 24:
            return "VeryMildDemented"
        if mmse >= 21:
            return "MildDemented"
        return "ModerateDemented"

    @staticmethod
    def _alzheimer_rule_distribution(stage: str) -> Dict[str, float]:
        # Rule-based clinical fallback using MMSE stage bands.
        distributions = {
            "NonDemented": {
                "NonDemented": 0.72,
                "VeryMildDemented": 0.18,
                "MildDemented": 0.07,
                "ModerateDemented": 0.03,
            },
            "VeryMildDemented": {
                "NonDemented": 0.20,
                "VeryMildDemented": 0.55,
                "MildDemented": 0.20,
                "ModerateDemented": 0.05,
            },
            "MildDemented": {
                "NonDemented": 0.07,
                "VeryMildDemented": 0.18,
                "MildDemented": 0.55,
                "ModerateDemented": 0.20,
            },
            "ModerateDemented": {
                "NonDemented": 0.03,
                "VeryMildDemented": 0.10,
                "MildDemented": 0.22,
                "ModerateDemented": 0.65,
            },
        }
        return dict(distributions.get(stage, distributions["VeryMildDemented"]))

    @staticmethod
    def _build_alzheimer_clinical_reasoning(
        age: Optional[float],
        mmse: Optional[float],
        rule_stage: str,
        model_positive_risk: Optional[float],
    ) -> str:
        parts: List[str] = []
        if mmse is not None:
            parts.append(f"MMSE score {mmse:.1f} maps to clinical stage '{rule_stage}'")
        else:
            parts.append("MMSE score missing; used cautious clinical fallback")

        if age is not None:
            parts.append(f"patient age {age:.0f} considered in clinical context")

        if model_positive_risk is not None:
            parts.append(f"clinical model risk signal {model_positive_risk * 100:.1f}% blended with MMSE rule")

        return "; ".join(parts) + "."

    def _predict_parkinson_clinical(self, features: List[float]) -> Dict[str, Any]:
        model = self.registry.get("clinical_model.pkl")
        scaler = self.registry.get("clinical_scaler.pkl")
        if model is None or scaler is None:
            raise RuntimeError("Required model unavailable: clinical_model.pkl / clinical_scaler.pkl")

        x = Preprocessor.preprocess_clinical(features)
        x_scaled = scaler.transform(x)
        pred = int(model.predict(x_scaled)[0])
        proba = model.predict_proba(x_scaled)[0]
        probs_dict = {"Negative": float(proba[0]), "Positive": float(proba[-1])}
        conf = float(np.max(proba))
        imp = self.xai.tabular_feature_importance(model, x_scaled, prefix="park_clinical")
        stage = "Mild Risk" if probs_dict["Positive"] < 0.5 else ("Moderate Risk" if probs_dict["Positive"] < 0.75 else "High Risk")
        return {
            "prediction": "Positive" if pred == 1 else "Negative",
            "confidence": conf,
            "probabilities": probs_dict,
            "stage": stage,
            "feature_importance": imp,
        }

    def _predict_parkinson_speech(self, features: List[float]) -> Dict[str, Any]:
        model = self.registry.get("speech_model.pkl")
        scaler = self.registry.get("speech_scaler.pkl")
        if model is None or scaler is None:
            raise RuntimeError("Required model unavailable: speech_model.pkl / speech_scaler.pkl")

        x = Preprocessor.preprocess_clinical(features)
        x_scaled = scaler.transform(x)
        pred = int(model.predict(x_scaled)[0])
        proba = model.predict_proba(x_scaled)[0]
        probs_dict = {"Negative": float(proba[0]), "Positive": float(proba[-1])}
        conf = float(np.max(proba))
        attr = self.xai.speech_feature_attribution(x_scaled)
        stage = "Mild Risk" if probs_dict["Positive"] < 0.5 else ("Moderate Risk" if probs_dict["Positive"] < 0.75 else "High Risk")
        return {
            "prediction": "Positive" if pred == 1 else "Negative",
            "confidence": conf,
            "probabilities": probs_dict,
            "stage": stage,
            "feature_importance": attr,
        }

    def _fuse_alzheimer(self, modality_results: Dict[str, Dict[str, Any]], notes: List[str]) -> Dict[str, Any]:
        if not modality_results:
            raise ValueError("At least one modality is required for alzheimers prediction")

        probabilities = {k: v["probabilities"] for k, v in modality_results.items()}
        fused, coverage = weighted_late_fusion(probabilities, FUSION_WEIGHTS["alzheimers"])

        pred = max(fused, key=fused.get)
        confidence = float(fused[pred] * (0.7 + 0.3 * coverage))
        stage = pred
        confidence_policy = self._confidence_control(confidence)
        profile = self._alzheimer_clinical_profile(pred)

        if pred == "NonDemented":
            notes.append("Non-demented class selected; heatmap is kept minimal to avoid false neurodegeneration emphasis.")

        explainability = {
            "mri_heatmap": modality_results.get("mri", {}).get("heatmap"),
            "mri_panels": modality_results.get("mri", {}).get("mri_panels"),
            "clinical_feature_importance": modality_results.get("clinical", {}).get("feature_importance", []),
            "summary": (
                f"{confidence_policy['status']}: {profile['class_prediction']} with {confidence * 100:.1f}% confidence. "
                f"Severity {profile['severity_level']}, risk {profile['risk_level']}. "
                f"Pattern: {profile['abnormality_type'].lower()}. {profile['explanation']}."
            ),
        }
        detailed_summary = self._alzheimer_detailed_explanation(profile, pred, confidence, confidence_policy["status"])
        explainability["detailed_summary"] = detailed_summary
        explainability["clinical_recommendations"] = profile["recommendation"]
        explainability["precautions"] = (
            "Do not use isolated AI output for diagnosis. Combine with MMSE trajectory, neurologic exam, and longitudinal follow-up."
        )

        clinical_reasoning = modality_results.get("clinical", {}).get("clinical_reasoning")
        if clinical_reasoning:
            explainability["summary"] = f"{explainability['summary']} {clinical_reasoning}"

        if coverage < 1.0:
            notes.append("Some modalities were missing. Confidence was adjusted for partial evidence.")

        return {
            "disease": "Alzheimers",
            "disease_type": "Alzheimers",
            "prediction": pred,
            "class_prediction": profile["class_prediction"],
            "confidence": confidence,
            "stage": stage,
            "severity_level": profile["severity_level"],
            "risk_level": profile["risk_level"],
            "abnormality_type": profile["abnormality_type"],
            "confidence_control": confidence_policy,
            "diagnostic_statement": confidence_policy["status"],
            "explanation": detailed_summary,
            "medical_disclaimer": "AI decision support only. Final diagnosis requires neurologist assessment and complete clinical context.",
            "modality_breakdown": modality_results,
            "probabilities": fused,
            "explainability": explainability,
            "recommendation": profile["recommendation"],
            "notes": notes,
        }

    def _fuse_parkinson(self, modality_results: Dict[str, Dict[str, Any]], notes: List[str]) -> Dict[str, Any]:
        if not modality_results:
            raise ValueError("At least one modality is required for parkinsons prediction")

        probabilities = {k: v["probabilities"] for k, v in modality_results.items()}
        fused, coverage = weighted_late_fusion(probabilities, FUSION_WEIGHTS["parkinsons"])

        pred = max(fused, key=fused.get)
        confidence = float(fused[pred] * (0.7 + 0.3 * coverage))
        pos_prob = fused.get("Positive", 0.0)
        stage = "Low Risk" if pos_prob < 0.4 else ("Moderate Risk" if pos_prob < 0.7 else "High Risk")

        explainability = {
            "speech_feature_importance": modality_results.get("speech", {}).get("feature_importance", []),
            "clinical_feature_importance": modality_results.get("clinical", {}).get("feature_importance", []),
            "summary": self.xai.plain_language_summary("Parkinsons", pred, confidence, stage, len(modality_results)),
        }

        if coverage < 1.0:
            notes.append("Some modalities were missing. Confidence was adjusted for partial evidence.")

        return {
            "disease": "Parkinsons",
            "prediction": pred,
            "confidence": confidence,
            "stage": stage,
            "modality_breakdown": modality_results,
            "probabilities": fused,
            "explainability": explainability,
            "recommendation": "Use this output as decision support and correlate with UPDRS and specialist assessment.",
            "notes": notes,
        }
