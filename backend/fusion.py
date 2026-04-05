from __future__ import annotations

from typing import Dict, Tuple


def weighted_late_fusion(modality_probs: Dict[str, Dict[str, float]], modality_weights: Dict[str, float]) -> Tuple[Dict[str, float], float]:
    """Fuse modality probabilities and return fused probs plus confidence penalty.

    Confidence penalty down-weights certainty when modalities are missing.
    """
    if not modality_probs:
        return {}, 0.0

    classes = set()
    for probs in modality_probs.values():
        classes.update(probs.keys())

    available_weight = 0.0
    weighted_sum = {cls: 0.0 for cls in classes}

    for modality, probs in modality_probs.items():
        w = float(modality_weights.get(modality, 0.0))
        if w <= 0:
            continue
        available_weight += w
        for cls in classes:
            weighted_sum[cls] += w * float(probs.get(cls, 0.0))

    if available_weight == 0:
        return {}, 0.0

    fused = {cls: val / available_weight for cls, val in weighted_sum.items()}
    max_possible = sum(float(x) for x in modality_weights.values()) or 1.0
    coverage_ratio = min(1.0, available_weight / max_possible)
    return fused, coverage_ratio
