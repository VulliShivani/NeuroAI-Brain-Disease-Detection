from __future__ import annotations

from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np

from config import SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS


class InputValidator:
    @staticmethod
    def validate_image_file(path: Path, max_size_mb: int = 50) -> Tuple[bool, List[str], List[str]]:
        errors: List[str] = []
        warnings: List[str] = []

        if not path.exists():
            return False, [f"Image file not found: {path}"], warnings

        ext = path.suffix.lower()
        if ext not in SUPPORTED_IMAGE_EXTENSIONS:
            errors.append(f"Unsupported image format: {ext}")

        size_mb = path.stat().st_size / (1024 * 1024)
        if size_mb <= 0:
            errors.append("Image file is empty")
        elif size_mb > max_size_mb:
            errors.append(f"Image is too large ({size_mb:.2f} MB > {max_size_mb} MB)")

        img = cv2.imread(str(path))
        if img is None:
            errors.append("Image cannot be decoded")
        else:
            h, w = img.shape[:2]
            if min(h, w) < 50:
                errors.append(f"Image too small for reliable inference ({w}x{h})")
            if max(h, w) > 4096:
                warnings.append("Image is very large; downscaling will be applied")

        return len(errors) == 0, errors, warnings

    @staticmethod
    def validate_audio_file(path: Path, max_size_mb: int = 40) -> Tuple[bool, List[str], List[str]]:
        errors: List[str] = []
        warnings: List[str] = []

        if not path.exists():
            return False, [f"Audio file not found: {path}"], warnings

        ext = path.suffix.lower()
        if ext not in SUPPORTED_AUDIO_EXTENSIONS:
            errors.append(f"Unsupported audio format: {ext}")

        size_mb = path.stat().st_size / (1024 * 1024)
        if size_mb <= 0:
            errors.append("Audio file is empty")
        elif size_mb > max_size_mb:
            errors.append(f"Audio file is too large ({size_mb:.2f} MB > {max_size_mb} MB)")

        return len(errors) == 0, errors, warnings

    @staticmethod
    def validate_vector(values: List[float], expected_len: int, field_name: str) -> Tuple[bool, List[str], List[str]]:
        errors: List[str] = []
        warnings: List[str] = []

        if values is None:
            return False, [f"{field_name} is required"], warnings

        arr = np.asarray(values, dtype=float)
        if arr.ndim != 1:
            errors.append(f"{field_name} must be a 1D vector")
            return False, errors, warnings

        if len(arr) != expected_len:
            errors.append(f"{field_name} must have {expected_len} values, got {len(arr)}")

        if np.any(np.isnan(arr)):
            errors.append(f"{field_name} contains NaN values")

        if np.any(np.isinf(arr)):
            errors.append(f"{field_name} contains infinite values")

        if np.max(np.abs(arr)) > 1e6:
            warnings.append(f"{field_name} contains unusually large magnitudes")

        return len(errors) == 0, errors, warnings
