# 🧠 NeuroAI – Multimodal Brain Disease Detection System

An AI-powered clinical decision support system for detecting brain diseases using multimodal inputs such as MRI, clinical data, and speech.

---

## 🚀 Features

* 🧠 Alzheimer’s Detection (MRI + Clinical)
* 🧠 Parkinson’s Detection (Speech + Clinical)
* 🧠 Brain Tumor Detection (MRI)
* 📊 Explainable AI (Grad-CAM, SHAP, Feature Importance)
* 📄 Hospital-style Report Generation (PDF)
* 🔀 Guided Symptom-Based Triage System

---

## 🏗️ Tech Stack

### Backend

* FastAPI
* TensorFlow / Scikit-learn
* SHAP, Grad-CAM

### Frontend

* React (Vite)
* Tailwind CSS

---

## 📁 Project Structure

```
BrainDiseaseAI/
│
├── backend/
├── frontend/
├── UI/
├── notebooks/
├── .gitignore
├── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/VulliShivani/NeuroAI-Brain-Disease-Detection.git
cd NeuroAI-Brain-Disease-Detection
```

---

### 2️⃣ Backend Setup

```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install tensorflow==2.18.0   # optional for MRI models

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3️⃣ Frontend Setup

```
cd frontend/neuroai
npm install
npm run dev
```

---

### 4️⃣ Open App

```
http://localhost:5173
```

---

## 📊 System Workflow

1. Select mode (Guided / Direct)
2. Provide patient data (MRI / Clinical / Speech)
3. AI processes inputs using multimodal fusion
4. View predictions + explainability
5. Download clinical report

---

## ⚠️ Notes

* MRI models require TensorFlow installation
* System supports partial inputs (graceful fallback)
* Not a replacement for professional medical diagnosis

---

## 🎯 Future Improvements

* Deploy on cloud (AWS / Render)
* Add more diseases
* Improve UI/UX for hospital usage

---

## 👩‍💻 Author

Vulli Shivani
GitHub: https://github.com/VulliShivani

---

⭐ If you like this project, give it a star!
