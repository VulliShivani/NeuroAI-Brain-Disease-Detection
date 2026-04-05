from __future__ import annotations

import base64
import io
from typing import Dict, List, Optional

import cv2
import numpy as np
import shap
from PIL import Image


class ExplainabilityEngine:
    @staticmethod
    def _encode_rgb_png(rgb: np.ndarray) -> str:
        pil_img = Image.fromarray(rgb.astype(np.uint8))
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    @staticmethod
    def _to_grayscale_u8(img_array: np.ndarray) -> np.ndarray:
        img = np.asarray(img_array[0])
        if img.ndim == 3 and img.shape[2] == 3:
            bgr = (img * 255).astype(np.uint8)
            gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        else:
            gray = (img * 255).astype(np.uint8)
        return gray

    @staticmethod
    def _normalize_heatmap(heatmap: np.ndarray) -> np.ndarray:
        hm = np.asarray(heatmap, dtype=np.float32)
        hm -= float(hm.min())
        denom = float(hm.max()) + 1e-12
        hm = hm / denom
        hm = np.power(hm, 0.5)  # Boost mid-activation visibility.
        hm = cv2.normalize(hm, None, 0.0, 1.0, cv2.NORM_MINMAX)
        return hm

    @staticmethod
    def _generate_spatial_prior(shape: tuple, disease: str, prediction: str) -> np.ndarray:
        h, w = shape
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        yy = yy / max(1.0, float(h - 1))
        xx = xx / max(1.0, float(w - 1))

        pred = str(prediction or "").strip().lower()
        dis = str(disease or "").strip().lower()

        if "tumor" in dis:
            if pred == "notumor":
                return np.zeros((h, w), dtype=np.float32)
            if pred == "pituitary":
                # Small central hotspot for pituitary region.
                return np.exp(-(((xx - 0.5) ** 2) / 0.01 + ((yy - 0.55) ** 2) / 0.015)).astype(np.float32)
            if pred == "meningioma":
                # Peripheral ring-like emphasis for extra-axial lesions.
                cx = xx - 0.5
                cy = yy - 0.5
                rr = np.sqrt(cx * cx + cy * cy)
                ring = np.exp(-((rr - 0.38) ** 2) / 0.003)
                return ring.astype(np.float32)
            # Glioma default: diffuse and irregular spread.
            diffuse = np.exp(-(((xx - 0.45) ** 2) / 0.20 + ((yy - 0.5) ** 2) / 0.24))
            texture = 0.85 + 0.15 * np.sin(12.0 * xx) * np.cos(9.0 * yy)
            return np.clip(diffuse * texture, 0.0, 1.0).astype(np.float32)

        if "alz" in dis:
            if pred == "nondemented":
                return np.zeros((h, w), dtype=np.float32)
            if pred == "verymilddemented":
                # Bilateral subtle hippocampal regions.
                left = np.exp(-(((xx - 0.38) ** 2) / 0.01 + ((yy - 0.62) ** 2) / 0.02))
                right = np.exp(-(((xx - 0.62) ** 2) / 0.01 + ((yy - 0.62) ** 2) / 0.02))
                return np.clip(left + right, 0.0, 1.0).astype(np.float32)
            if pred == "milddemented":
                # Temporal lobe-focused spread.
                left = np.exp(-(((xx - 0.30) ** 2) / 0.03 + ((yy - 0.58) ** 2) / 0.05))
                right = np.exp(-(((xx - 0.70) ** 2) / 0.03 + ((yy - 0.58) ** 2) / 0.05))
                return np.clip(left + right, 0.0, 1.0).astype(np.float32)
            # Moderate dementia: stronger global atrophy-like spread.
            wide = np.exp(-(((xx - 0.5) ** 2) / 0.22 + ((yy - 0.5) ** 2) / 0.26))
            return wide.astype(np.float32)

        return np.ones((h, w), dtype=np.float32)

    @staticmethod
    def _confidence_heatmap_gain(confidence: float) -> float:
        if confidence < 0.40:
            return 0.28
        if confidence <= 0.70:
            return 0.66
        return 1.00

    def build_mri_visual_bundle(
        self,
        img_array: np.ndarray,
        raw_heatmap: Optional[np.ndarray],
        disease: str,
        prediction: str,
        confidence: float,
        allow_heatmap: bool = True,
    ) -> Dict[str, Optional[str]]:
        gray = self._to_grayscale_u8(img_array)
        gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        original_b64 = self._encode_rgb_png(gray_rgb)

        if raw_heatmap is None:
            hm = np.zeros_like(gray, dtype=np.float32)
        else:
            hm = self._normalize_heatmap(raw_heatmap)

        prior = self._generate_spatial_prior(hm.shape, disease=disease, prediction=prediction)
        hm = np.clip(hm * prior, 0.0, 1.0)

        if "alz" in str(disease).lower():
            # Alzheimer map should look smooth, not sharply segmented.
            hm = cv2.GaussianBlur(hm, (0, 0), sigmaX=3.0, sigmaY=3.0)

        # Confidence-controlled intensity for clinical caution.
        gain = self._confidence_heatmap_gain(float(confidence))
        hm = np.clip(hm * gain, 0.0, 1.0)

        # Hard safety: no strong heatmap for no-tumor / non-demented.
        pred = str(prediction).strip().lower()
        if ("tumor" in str(disease).lower() and pred == "notumor") or pred == "nondemented":
            hm = np.zeros_like(hm, dtype=np.float32)

        heat_u8 = (hm * 255).astype(np.uint8)
        colored = cv2.applyColorMap(heat_u8, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
        heatmap_b64 = self._encode_rgb_png(heatmap_rgb)

        # Keep strong overlay difference versus original as requested.
        alpha = 0.80 if allow_heatmap else 0.0
        overlay_rgb = cv2.addWeighted(gray_rgb, 1.0 - alpha, heatmap_rgb, alpha, 0)
        overlay_b64 = self._encode_rgb_png(overlay_rgb)

        return {
            "original_mri": original_b64,
            "heatmap": heatmap_b64,
            "overlay": overlay_b64,
            "overlay_alpha": alpha,
        }

    @staticmethod
    def generate_grad_cam(model, img_array, layer_name=None):
        try:
            import tensorflow as tf
        except Exception:
            return None

        try:
            if layer_name is None:
                for layer in reversed(model.layers):
                    if "conv" in layer.name.lower():
                        layer_name = layer.name
                        break
            if layer_name is None:
                return None

            grad_model = tf.keras.models.Model(
                model.inputs,
                [model.get_layer(layer_name).output, model.outputs[0]],
            )

            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(img_array)
                class_idx = tf.argmax(predictions[0])
                target = predictions[:, class_idx]

            grads = tape.gradient(target, conv_outputs)
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            conv_outputs = conv_outputs[0]
            heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
            heatmap = tf.squeeze(heatmap)
            heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-12)
            heatmap = heatmap.numpy()
            heatmap = cv2.resize(heatmap, (img_array.shape[2], img_array.shape[1]))
            return heatmap
        except Exception:
            return None

    @staticmethod
    def heatmap_overlay_base64(img_array, heatmap, alpha=0.35):
        if heatmap is None:
            return None
        gray = ExplainabilityEngine._to_grayscale_u8(img_array)
        gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        hm = ExplainabilityEngine._normalize_heatmap(heatmap)
        colored = cv2.applyColorMap((hm * 255).astype(np.uint8), cv2.COLORMAP_JET)
        colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
        overlay = cv2.addWeighted(gray_rgb, 1 - alpha, colored, alpha, 0)
        return ExplainabilityEngine._encode_rgb_png(overlay)

    @staticmethod
    def tabular_feature_importance(model, features: np.ndarray, prefix: str = "feature") -> List[Dict[str, float]]:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features)
            if isinstance(shap_values, list):
                shap_values = shap_values[-1]
            importance = np.abs(shap_values).mean(axis=0)
        except Exception:
            if hasattr(model, "feature_importances_"):
                importance = np.asarray(model.feature_importances_)
            else:
                return []

        # Normalize to 1D [n_features] even when SHAP/model output carries extra axes.
        importance = np.asarray(importance)
        while importance.ndim > 1:
            importance = importance.mean(axis=-1)

        total = float(np.sum(importance)) or 1.0
        order = np.argsort(importance)[::-1]
        result = []
        for idx in order[:10]:
            score = float(importance[idx])
            result.append(
                {
                    "name": f"{prefix}_{idx + 1}",
                    "importance": score,
                    "percentage": (score / total) * 100.0,
                }
            )
        return result

    @staticmethod
    def speech_feature_attribution(features: np.ndarray) -> List[Dict[str, float]]:
        arr = np.asarray(features).flatten()
        abs_arr = np.abs(arr)
        total = float(abs_arr.sum()) or 1.0
        order = np.argsort(abs_arr)[::-1]
        top = []
        for idx in order[:8]:
            val = float(abs_arr[idx])
            top.append(
                {
                    "name": f"mfcc_{idx + 1}",
                    "importance": val,
                    "percentage": (val / total) * 100.0,
                }
            )
        return top

    @staticmethod
    def plain_language_summary(disease: str, prediction: str, confidence: float, stage: str, modality_count: int) -> str:
        return (
            f"The AI assistant suggests {disease} result '{prediction}' with {confidence * 100:.1f}% confidence. "
            f"Estimated stage/risk: {stage}. "
            f"This decision used {modality_count} available modality stream(s). "
            "Please interpret together with neurological examination and specialist review."
        )
