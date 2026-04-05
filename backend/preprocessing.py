from __future__ import annotations

from typing import List

import cv2
import librosa
import numpy as np


class Preprocessor:
    @staticmethod
    def preprocess_mri(image_path: str, size: int = 224) -> np.ndarray:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Unable to decode MRI image")
        img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
        img = img.astype("float32") / 255.0
        return np.expand_dims(img, axis=0)

    @staticmethod
    def preprocess_clinical(features: List[float]) -> np.ndarray:
        arr = np.asarray(features, dtype=float)
        return np.expand_dims(arr, axis=0)

    @staticmethod
    def extract_mfcc(audio_path: str, n_mfcc: int = 26, sr: int = 16000) -> np.ndarray:
        y, _ = librosa.load(audio_path, sr=sr, mono=True)
        if y.size == 0:
            raise ValueError("Audio signal is empty")
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
        stats = np.concatenate([mfcc.mean(axis=1), mfcc.std(axis=1)])
        # Keep exactly n_mfcc values for model compatibility.
        if len(stats) < n_mfcc:
            padded = np.zeros(n_mfcc, dtype=np.float32)
            padded[: len(stats)] = stats
            stats = padded
        return stats[:n_mfcc]
