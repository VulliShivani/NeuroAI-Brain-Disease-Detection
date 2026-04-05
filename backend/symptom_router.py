from __future__ import annotations

from typing import Any, Dict, List


QUESTION_BANK: List[str] = [
    "Has the patient had progressive memory loss over the last year?",
    "Does the patient show resting tremor in hands or limbs?",
    "Is there slowed movement (bradykinesia) or rigidity?",
    "Are there speech articulation changes or reduced vocal volume?",
    "Are there disorientation episodes affecting daily living?",
    "Does the patient have persistent headaches, seizures, or vision changes?",
]


def triage_from_answers(answers: Dict[str, Any]) -> Dict[str, Any]:
    # Expected answer keys can be arbitrary strings from frontend; we read common ones.
    memory = int(bool(answers.get("memory_loss")))
    tremor = int(bool(answers.get("tremor")))
    bradykinesia = int(bool(answers.get("bradykinesia")))
    speech_change = int(bool(answers.get("speech_change")))
    disorientation = int(bool(answers.get("disorientation")))
    headache = int(bool(answers.get("headache")))
    balance = int(bool(answers.get("balance")))
    vision = int(bool(answers.get("vision")))
    seizure = int(bool(answers.get("seizure")))

    # Lightweight clinical triage scoring for guided routing.
    alz_score = 0.50 * memory + 0.30 * disorientation + 0.10 * (1 - tremor) + 0.10 * (1 - headache)
    park_score = 0.40 * tremor + 0.30 * bradykinesia + 0.20 * speech_change + 0.10 * balance
    tumor_score = 0.35 * headache + 0.25 * vision + 0.20 * seizure + 0.20 * balance

    total = max(1e-6, alz_score + park_score + tumor_score)
    disease_scores = {
        "alzheimers": alz_score / total,
        "parkinsons": park_score / total,
        "brain_tumor": tumor_score / total,
    }

    probable = max(disease_scores, key=disease_scores.get)
    confidence = float(disease_scores[probable])

    next_questions: List[str] = []
    if probable == "alzheimers" and not memory:
        next_questions.append("Has short-term memory declined in the past 6 months?")
    if probable == "parkinsons" and not tremor:
        next_questions.append("Is unilateral tremor visible at rest?")
    if probable == "brain_tumor" and not headache:
        next_questions.append("Are headaches persistent or worsening?")
    if not next_questions:
        next_questions.append("Proceed to disease-specific multimodal analysis.")

    return {
        "probable_disease": probable,
        "confidence": confidence,
        "disease_scores": disease_scores,
        "next_questions": next_questions,
    }
