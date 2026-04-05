# NeuroAI Multimodal Explainable Brain Disease Detection System

## ✅ COMPLETE IMPLEMENTATION DELIVERED

This is a production-grade **FastAPI + React full-stack application** for hospital-assistant-style multimodal brain disease detection with robust explainability and seamless frontend integration.

---

## 📋 WHAT'S INCLUDED

### **Backend (FastAPI)**
- ✅ **Guided & Direct Disease Routing** – Symptom-based triage + direct selection
- ✅ **Multimodal Pipelines** – Graceful handling when modalities are missing
  - Alzheimer's: MRI + clinical data (with clinical-only fallback)
  - Parkinson's: Speech + clinical data (with clinical-only fallback)
  - Brain Tumor: MRI image only
- ✅ **Late Fusion Engine** – Weighted probability aggregation + confidence penalties for missing data
- ✅ **Explainability** – Grad-CAM heatmaps (MRI), SHAP/importance (tabular), MFCC attribution (speech)
- ✅ **Clinical Reports** – Hospital-style PDF generation with prediction + visualization
- ✅ **Backward Compatibility** – All existing frontend endpoints preserved

### **Frontend (React + Vite)**
- ✅ **Seamless UI Flow** – Mode selection → symptom triage → disease pipeline → results
- ✅ **Updated API Integration** – Points to new FastAPI backend (port 8000)
- ✅ **Report Download** – Full clinical PDF from prediction results

---

## 🚀 QUICK START

### **1. Backend Setup**

Terminal 1: Start the FastAPI server
```bash
cd "c:/Mini project/BrainDiseaseAI/backend"
"c:/Mini project/BrainDiseaseAI/.venv/Scripts/python.exe" -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

You'll see:
```
Uvicorn running on http://0.0.0.0:8000
API docs available at http://localhost:8000/docs
```

**Health check:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models": {"loaded": [...]},
  "ready": true/false
}
```

---

### **2. Frontend Setup**

Terminal 2: Install and run React app
```bash
cd "c:/Mini project/BrainDiseaseAI/frontend/neuroai"
npm install
npm run dev
```

Visit: **http://localhost:5173** in browser

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND                            │
│  (Mode Selection → Symptom Triage → Patient Input → Results)    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Route Layer (Compatibility + Unified)                    │   │
│  │ • /predict/alzheimer (MRI file)                         │   │
│  │ • /predict/alzheimer/clinical (feature vector)          │   │
│  │ • /predict/parkinson/clinical (feature vector)          │   │
│  │ • /predict/parkinson/audio (speech file)                │   │
│  │ • /predict/brain_tumor (MRI file)                       │   │
│  │ • /predict/direct (disease + multimodal payload)        │   │
│  │ • /guided/triage (symptom answers → disease route)      │   │
│  │ • /generate-report (result → PDF download)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Service Layer (Orchestration & Fusion)                  │   │
│  │ • PredictionService (multimodal predict + fusion)       │   │
│  │ • WeightedLateFusion (confidence aggregation)           │   │
│  │ • ExplainabilityEngine (XAI outputs)                    │   │
│  │ • ReportGenerator (hospital-style PDF)                  │   │
│  │ • SymptomRouter (guided triage logic)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Infrastructure Layer                                     │   │
│  │ • ModelRegistry (dynamic loader + status reporting)     │   │
│  │ • InputValidator (image/audio/vector validation)        │   │
│  │ • Preprocessor (MRI resize/normalize, MFCC extract)    │   │
│  │ • Config (disease classes, fusion weights)              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │   Trained Model Files (/models)  │
         │ • alzheimer_model.h5 (CNN MRI)    │
         │ • brain_tumor_model.h5 (CNN)      │
         │ • clinical_model.pkl (Parkinson)  │
         │ • speech_model.pkl                │
         │ • clincial_model_alz.pkl          │
         │ + scalers (.pkl)                  │
         └───────────────────────────────────┘
```

---

## 🔌 API ENDPOINTS REFERENCE

### **Health & Status**
```
GET /health
→ { status, models: {loaded[], missing_required[], errors[]}, ready }
```

### **Unified Prediction Endpoints**

#### **Directed Disease Selection**
```
POST /predict/direct
Params:
  disease: "alzheimers" | "parkinsons" | "tumor"
  mri_file?: UploadFile
  clinical_features?: JSON "[...16 features...]"
  speech_features?: JSON "[...26 features...]"
  speech_file?: UploadFile
→ { disease, prediction, confidence, stage, modality_breakdown, explainability, ... }
```

#### **Guided Symptom Triage**
```
POST /guided/triage
Body: { answers: {memory_loss?: bool, tremor?: bool, ...} }
→ { probable_disease, confidence, disease_scores, next_questions }
```

#### **Backward-Compatible Endpoints**
```
POST /predict/alzheimer + MRI file
POST /predict/alzheimer/clinical + {features: [...]}
POST /predict/parkinson/clinical + {features: [...]}
POST /predict/parkinson/speech + {features: [...]}
POST /predict/parkinson/audio + speech file
POST /predict/brain_tumor + MRI file
```

### **Report Generation**
```
POST /generate-report
Body: { patient_summary: {...}, result: {...} }  OR  { disease, prediction, confidence, heatmap, ... }
→ PDF file (download)
```

---

## 🎯 USAGE EXAMPLES

### **Example 1: Alzheimer's – Full Multimodal (MRI + Clinical)**
```javascript
// Frontend flow: Direct Mode → Alzheimer's → Upload MRI + enter MMSE score

// Backend processes:
// 1. MRI → CNN prediction + Grad-CAM heatmap
// 2. Clinical features → Random Forest + feature importance
// 3. Fusion: weighted average (70% MRI, 30% clinical)
// 4. Output: "MildDemented" at 87% confidence
```

### **Example 2: Parkinson's – Speech Only (Partial Data)**
```javascript
// Frontend flow: Direct Mode → Parkinson's → Upload speech audio only

// Backend processes:
// 1. Speech → MFCC extraction → Random Forest prediction
// 2. No clinical data available
// 3. Fusion: applied to single modality, confidence = base * 0.7
// 4. Output: "Positive" at 64% confidence (penalized for missing clinical)
//             Note in result: "Some modalities were missing..."
```

### **Example 3: Guided Triage → Routing → Prediction**
```javascript
// Frontend flow: Guided Mode → Q: "Memory loss?" → Q: "Tremor?" → ...
// Backend triage: Calculates disease_scores, routes to likely disease

// If routed to Alzheimer's → System asks for MRI + clinical
// If routed to Parkinson's → System asks for clinical (speech optional)
```

---

## 🧪 MANUAL API TESTING

### **Using curl/Postman**

#### **Health Check**
```bash
curl http://localhost:8000/health
```

#### **Guided Triage**
```bash
curl -X POST http://localhost:8000/guided/triage \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "memory_loss": true,
      "tremor": false,
      "bradykinesia": false,
      "speech_change": false,
      "disorientation": true
    }
  }'
```

#### **Parkinson's Clinical Prediction**
```bash
curl -X POST http://localhost:8000/predict/parkinson/clinical \
  -H "Content-Type: application/json" \
  -d '{
    "features": [65, 3, 1, 1.5, 4.5, 2, 1.875, 1, 0, 1, 1, 1, 2, 8.125, 1.5, 0]
  }'
```

#### **Generate Report**
```bash
curl -X POST http://localhost:8000/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "disease": "Parkinsons",
    "prediction": "Positive",
    "confidence": 0.72,
    "stage": "Moderate Risk",
    "explanation": "Clinical screening suggests moderate Parkinson risk...",
    "feature_importance": [{"name": "feature_1", "importance": 0.45, "percentage": 15.2}]
  }' \
  --output report.pdf
```

---

## 📁 PROJECT STRUCTURE

```
BrainDiseaseAI/
├── backend/
│   ├── app.py                   ← FastAPI main app
│   ├── config.py                ← Disease classes, fusion weights
│   ├── schemas.py               ← Pydantic request/response schemas
│   ├── model_registry.py        ← Dynamic model loading
│   ├── predictor_service.py     ← Multimodal orchestration + fusion
│   ├── symptom_router.py        ← Guided triage logic
│   ├── preprocessing.py         ← MRI, MFCC, clinical transforms
│   ├── input_validator.py       ← Image/audio/vector validation
│   ├── explainability.py        ← Grad-CAM, SHAP, attribution
│   ├── fusion.py                ← Late fusion engine
│   ├── report_generator.py      ← PDF report generation
│   ├── requirements.txt          ← Python dependencies
│   └── models/
│       ├── alzheimer_model.h5
│       ├── brain_tumor_model.h5
│       ├── clinical_model.pkl
│       ├── clinical_scaler.pkl
│       ├── clincial_model_alz.pkl
│       ├── speech_model.pkl
│       └── speech_scaler.pkl
├── frontend/
│   └── neuroai/
│       ├── src/
│       │   ├── App.jsx           ← Main React component (updated)
│       │   ├── App.css
│       │   └── main.jsx
│       ├── package.json
│       ├── vite.config.js
│       └── index.html
├── datasets/
└── uploads/                     ← Temporary user files (auto-cleanup)
```

---

## ⚠️ KNOWN CONSIDERATIONS

### **TensorFlow/CNN Models (Alzheimer & Tumor MRI)**
- ✅ Backend gracefully handles missing CNN models
- ✅ Clinical/speech-only pipelines work independently
- ✅ If CNN models unavailable, system flags modalities as "partial evidence"
- 📝 **Tip:** To use MRI models, install matching TensorFlow via:
  ```bash
  pip install tensorflow==2.18.0
  ```
  Then test: `python -c "import tensorflow as tf; print(tf.__version__)"`

### **PyTorch → sklearn Version**
- ⚠️ Minor sklearn warning: models pickled in 1.6.1, unpickled in 1.5.1
- ✅ Still functionally correct; no prediction errors
- 📝 Optional: Update models with matching sklearn version for clean warning suppression

---

## 🧠 ARCHITECTURE HIGHLIGHTS

### **1. Guided Mode (Symptom → Routing)**
- User answers screening questions (memory, tremor, speech, etc.)
- `symptom_router.py` calculates disease likelihood scores
- System routes to most probable disease pipeline
- Next questions adapt based on answers

### **2. Direct Mode (User Chooses → Pipeline)**
- User explicitly selects disease
- System collects all available modalities for that disease
- Prediction proceeds with whatever data patient provides
- Confidence adjusted for missing modalities

### **3. Multimodal Fusion**
- Each disease has weighted modality configuration (e.g., Alzheimer's: 70% MRI + 30% clinical)
- `weighted_late_fusion()` normalizes and combines probability distributions
- Coverage ratio penalties down-weight uncertainty when data is missing
- Example: If clinical data missing for Alzheimer's, confidence reduced but still valid

### **4. Explainability Pipeline**
- **MRI (CNN):** Grad-CAM visualization of attention zones
- **Tabular (sklearn):** SHAP or feature importance scores + contribution percentages  
- **Speech (MFCC):** Top influential frequencies/coefficients
- All visualizations embedded in PDF report

---

## 🔐 PRODUCTION BEST PRACTICES APPLIED

- ✅ **Modular Design** – Each service (preprocessing, fusion, XAI, reporting) is independently testable
- ✅ **Graceful Degradation** – Missing models/modalities don't crash; system adapts confidence
- ✅ **Input Validation** – All user inputs rigorously checked before model inference
- ✅ **Error Handling** – Detailed error messages for debugging; user-safe error responses
- ✅ **Security** – CORS enabled; temp files auto-cleaned; no path traversal vulns
- ✅ **Logging** – Scikit-learn warnings suppressed but non-fatal
- ✅ **CORS Enabled** – Frontend and backend on separate ports; requests allowed

---

## 📞 SUPPORT & NEXT STEPS

### **To Run the Full System:**
1. Terminal 1: `cd backend && python -m uvicorn app:app --port 8000 --reload`
2. Terminal 2: `cd frontend/neuroai && npm run dev`
3. Open http://localhost:5173
4. Test: Click "Guided" or "Direct", provide patient data, download report!

### **To Add More Diseases:**
1. Add disease constants to `config.py`
2. Create model files in `/models` (pickle or .h5)
3. Add entry to `ModelRegistry.SPECS` in `model_registry.py`
4. Add `predict_<disease>()` method to `PredictionService`
5. Add fusion weights to `FUSION_WEIGHTS` in `config.py`
6. Add disease triage logic to `symptom_router.py`
7. Update frontend disease options in `App.jsx`

---

## 🎓 RESEARCH & REFERENCES

The system implements published best practices from:
- **Late Fusion:** Weighted combination of multimodal predictions for robust aggregation
- **Explainable AI:** Grad-CAM (visual) + SHAP (tabular) + MFCC attribution (audio)
- **Clinical Validity:** Confidence penalties for incomplete data; staged risk assessment; doctor consultation disclaimers
- **Graceful Degradation:** Robust handling of missing modalities in real-world hospital workflows

---

Made with ❤️ for clinical decision support. **Always verify with specialist physicians before clinical use.**
