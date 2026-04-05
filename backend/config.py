from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR.parent / "uploads"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".dcm"}
SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}

ALZHEIMER_CLASSES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
PARKINSON_CLASSES = ["Negative", "Positive"]
# IMPORTANT: this order must match the trained model output indices exactly.
# Verified against test samples: idx0->meningioma, idx1->notumor, idx2->glioma, idx3->pituitary.
BRAIN_TUMOR_CLASSES = ["meningioma", "notumor", "glioma", "pituitary"]

# Modality weights per disease for late fusion.
FUSION_WEIGHTS = {
    "alzheimers": {
        "mri": 0.7,
        "clinical": 0.3,
    },
    "parkinsons": {
        "speech": 0.55,
        "clinical": 0.45,
    },
}
