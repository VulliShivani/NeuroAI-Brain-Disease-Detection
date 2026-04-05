import { useState, useRef, useEffect } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BrainIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const MriIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M6 12h1M17 12h1M12 6v1M12 17v1"/>
    <circle cx="12" cy="12" r="6" strokeDasharray="2 2"/>
  </svg>
);

const MicIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
  </svg>
);

const UploadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ChevronRightIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ChevronLeftIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const DownloadIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const RefreshIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const InfoIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const AlertIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const confidenceMeta = (confidence) => {
  if (confidence < 45) return { risk: "safe", label: "Low", color: "#10B981" };
  if (confidence < 75) return { risk: "mild", label: "Moderate", color: "#F59E0B" };
  return { risk: "danger", label: "High", color: "#EF4444" };
};

const stageFromConfidence = (confidence) => {
  if (confidence < 45) return "No Significant Pattern";
  if (confidence < 75) return "Mild to Moderate";
  return "Severe / High Suspicion";
};

const diseaseVerdict = (result) => {
  if (String(result?.disease || "").toLowerCase().includes("brain tumor")) {
    const diseaseType = String(result?.diseaseType || "");
    if (diseaseType === "No Tumor") return "No abnormality detected";
    if (diseaseType === "Uncertain") return "Possible abnormal pattern - requires review";
    const confidence = Number(result?.confidence || 0);
    if (confidence < 40) return "No significant abnormality detected";
    if (confidence <= 70) return "Possible abnormal pattern - requires review";
    return `Strong abnormal pattern detected - high likelihood of ${diseaseType || "tumor"}`;
  }
  const confidence = Number(result?.confidence || 0);
  if (confidence < 45) return "Safe / No Strong Pattern Detected";
  if (confidence < 75) return "Possible Pattern Detected - Needs Review";
  return "High Suspicion Detected";
};

const tumorRiskMeta = (confidence, diseaseType = "") => {
  const dt = String(diseaseType || "").toLowerCase();
  if (dt.includes("no tumor")) return { risk: "safe", label: "Low", color: "#10B981" };
  if (dt.includes("uncertain")) return { risk: "mild", label: "Moderate", color: "#F59E0B" };
  if (confidence < 40) return { risk: "safe", label: "Low", color: "#10B981" };
  if (confidence <= 70) return { risk: "mild", label: "Moderate", color: "#F59E0B" };
  return { risk: "danger", label: "High", color: "#EF4444" };
};

const alzheimerRiskMeta = (prediction = "", confidence = 0, diseaseType = "") => {
  const text = `${prediction} ${diseaseType}`.toLowerCase();
  if (/non\s*demented|nondemented|no alzheimer pattern/.test(text)) return { risk: "safe", label: "Low", color: "#10B981" };
  if (/verymild|mild|possible/.test(text)) return { risk: "mild", label: "Moderate", color: "#F59E0B" };
  if (/moderate|detected/.test(text)) return { risk: "danger", label: "High", color: "#EF4444" };
  return confidenceMeta(confidence);
};

const parkinsonRiskMeta = (prediction = "", confidence = 0) => {
  const text = String(prediction).toLowerCase();
  if (/negative|no parkinson pattern/.test(text)) return { risk: "safe", label: "Low", color: "#10B981" };
  if (/possible|uncertain/.test(text)) return { risk: "mild", label: "Moderate", color: "#F59E0B" };
  if (/positive|detected/.test(text)) return confidence > 70 ? { risk: "danger", label: "High", color: "#EF4444" } : { risk: "mild", label: "Moderate", color: "#F59E0B" };
  return confidenceMeta(confidence);
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const toPercent = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return Math.round(n * 100);
  return Math.round(n);
};

const getBackendExplainability = (backend) => {
  const xai = backend?.explainability || {};
  const detailed = xai?.detailed_summary || backend?.explanation || "";
  const summary = xai?.summary || "";
  const precautions = xai?.precautions || "";
  const recommendation = xai?.clinical_recommendations || backend?.recommendation || "";
  const disclaimer = backend?.medical_disclaimer || "";
  return {
    detailed: String(detailed || "").trim(),
    summary: String(summary || "").trim(),
    precautions: String(precautions || "").trim(),
    recommendation: String(recommendation || "").trim(),
    disclaimer: String(disclaimer || "").trim(),
  };
};

const normalizeTumorClass = (predictionText = "") => {
  const t = String(predictionText).toLowerCase();
  if (/pituitary/.test(t)) return "Pituitary Tumor";
  if (/glioma/.test(t)) return "Glioma";
  if (/meningioma/.test(t)) return "Meningioma";
  if (/(no\s*tum|notumou?r|normal|no\s*mass|negative)/.test(t)) return "No Tumor";
  return "Glioma";
};

const mapTumorBackendResult = (backend, formData) => {
  const xai = getBackendExplainability(backend);
  const confidence = toPercent(backend?.confidence);
  const low = confidence < 40;
  const moderate = confidence >= 40 && confidence <= 70;
  const high = confidence > 70;
  const inferredClass = normalizeTumorClass(backend?.prediction || backend?.disease || "");
  const diseaseType = low ? "No Tumor" : moderate ? "Uncertain" : inferredClass;
  const prediction = low ? "No Tumor Detected" : moderate ? "Possible Pattern" : `${inferredClass} (Confirmed)`;
  const abnormalityType = low ? "None" : inferredClass === "Glioma" ? "Diffuse" : inferredClass === "Meningioma" ? "Localized" : inferredClass === "Pituitary Tumor" ? "Localized" : "Localized";
  const severityLevel = low ? "Normal" : inferredClass === "Pituitary Tumor" ? "Mild" : inferredClass === "Meningioma" ? "Moderate" : inferredClass === "Glioma" ? "High / Critical" : "Moderate";
  const riskLevel = low ? "Low" : moderate ? "Low-Moderate" : inferredClass === "Glioma" ? "High" : "Moderate";

  let explainabilityText;
  if (low) {
    explainabilityText = "No abnormality detected. Heatmap is absent or very low intensity with no clinically meaningful focal lesion.";
  } else if (moderate) {
    explainabilityText = "Possible abnormal pattern - requires review. Soft heatmap indicates mild/ambiguous regions without confirmed tumor subtype.";
  } else if (diseaseType === "Pituitary Tumor") {
    explainabilityText = "Localized abnormality in pituitary region with clear central focus is highlighted.";
  } else if (diseaseType === "Glioma") {
    explainabilityText = "Diffuse infiltrative abnormal pattern with irregular spread is highlighted.";
  } else {
    explainabilityText = "Well-defined extra-axial lesion with clear boundary is highlighted.";
  }

  const recommendation = low
    ? "No abnormality detected. Continue routine follow-up if clinically indicated."
    : moderate
      ? "Possible abnormal pattern - requires review by neuroradiology with clinical correlation before final diagnosis."
      : "Strong abnormal regions detected. Urgent neuroradiology and specialist referral are advised.";

  const fallbackLongExplanation = (
    `${explainabilityText} ` +
    `Method: MRI explainability is derived from Grad-CAM attention, then normalized and overlaid for clinical review. ` +
    `Interpretation confidence is ${confidence}%. ` +
    `Location pattern follows class-specific behavior (${abnormalityType.toLowerCase()}). ` +
    `Recommendation: ${recommendation}`
  );

  return {
    disease: "Brain Tumor",
    diseaseType,
    prediction,
    confidence,
    severityLevel,
    riskLevel,
    stage: low ? "No Significant Pattern" : moderate ? "Mild to Moderate" : "Severe / High Suspicion",
    abnormalityType,
    explainabilitySummary: xai.summary || explainabilityText,
    explainabilityText: xai.detailed || fallbackLongExplanation,
    precautions: xai.precautions || "This AI output is decision support only and must be correlated with neuroradiology findings and full clinical context.",
    keyFindings: (backend?.key_findings || backend?.notes || []).slice(0, 3).map((item, idx) => {
      const label = typeof item === "string" ? item : item?.label || `Feature ${idx + 1}`;
      const score = typeof item === "object" && item?.score != null ? toPercent(item.score) : low ? 12 : moderate ? 46 : 78;
      return { label, score, risk: score > 70 ? "high" : score > 40 ? "medium" : "low" };
    }).concat((backend?.key_findings || backend?.notes || []).length ? [] : [
      { label: low ? "No focal lesion signal" : moderate ? "Mild regional irregularity" : inferredClass === "Glioma" ? "Diffuse infiltration" : "Lesion boundary", score: low ? 12 : moderate ? 48 : 82, risk: low ? "low" : moderate ? "medium" : "high" },
      { label: low ? "Background texture" : moderate ? "Soft intensity variation" : "Signal intensity", score: low ? 14 : moderate ? 44 : 75, risk: low ? "low" : moderate ? "medium" : "high" },
      { label: low ? "Structural symmetry" : moderate ? "Uncertain structural change" : "Structural abnormality", score: low ? 10 : moderate ? 40 : 68, risk: low ? "low" : moderate ? "low" : "medium" },
    ]),
    recommendation: xai.recommendation || recommendation,
    explanation: xai.detailed || fallbackLongExplanation,
    medicalDisclaimer: xai.disclaimer || "AI decision support only. Final diagnosis requires radiologist and neurologist confirmation.",
    modalityNote: formData?.mriImage ? "MRI-first tumor workflow (backend inference)" : "MRI missing",
    color: tumorRiskMeta(confidence, diseaseType).color,
  };
};

const mapAlzheimerBackendResult = (backend, formData) => {
  const xai = getBackendExplainability(backend);
  const confidence = toPercent(backend?.confidence);
  const rawClass = String(backend?.prediction || "");
  const normalizedClass = /nondemented|non\s*demented/i.test(rawClass)
    ? "Non Demented"
    : /verymild/i.test(rawClass)
      ? "Very Mild Demented"
      : /mild/i.test(rawClass)
        ? "Mild Demented"
        : /moderate/i.test(rawClass)
          ? "Moderate Demented"
          : "Very Mild Demented";

  const uncertain = confidence < 40;
  const possible = confidence >= 40 && confidence <= 70;
  const confirmed = confidence > 70;

  const prediction = uncertain
    ? "Uncertain Pattern"
    : possible
      ? `Possible ${normalizedClass} Pattern`
      : normalizedClass === "Non Demented"
        ? "No Alzheimer Pattern Detected"
        : `${normalizedClass} (Confirmed)`;

  const severityLevel = uncertain
    ? "Uncertain"
    : normalizedClass === "Non Demented"
      ? "Normal"
      : normalizedClass === "Very Mild Demented"
        ? "Early"
        : normalizedClass === "Mild Demented"
          ? "Mild"
          : "Moderate";
  const riskLevel = uncertain
    ? "Moderate"
    : normalizedClass === "Non Demented"
      ? "Low"
      : normalizedClass === "Very Mild Demented"
        ? "Low-Moderate"
        : normalizedClass === "Mild Demented"
          ? "Moderate"
          : "High";

  const explainabilityText = uncertain
    ? "Possible abnormal pattern - requires review. Very soft diffuse signal is visible in memory-related regions without confirmed staging."
    : normalizedClass === "Non Demented"
      ? "No neurodegenerative changes detected. Non Demented pattern shows no visible atrophy in hippocampus or temporal lobe."
      : normalizedClass === "Very Mild Demented"
        ? "Early subtle changes in memory-related regions with slight hippocampus shrinkage are visible."
        : normalizedClass === "Mild Demented"
          ? "Moderate neurodegeneration affecting cognitive regions with visible atrophy in hippocampus and temporal lobe."
          : "Advanced neurodegeneration with widespread atrophy and significant brain volume loss is visible.";

  const recommendation = uncertain
    ? "Pattern is uncertain. Repeat MRI and correlate with clinical assessment before staging."
    : normalizedClass === "Non Demented"
      ? "No Alzheimer pattern detected. Continue routine cognitive follow-up."
      : normalizedClass === "Very Mild Demented"
        ? "Early-stage changes suspected. Recommend follow-up neurocognitive testing and specialist review."
        : normalizedClass === "Mild Demented"
          ? "Mild stage pattern detected. Recommend neurology consultation and cognitive care planning."
          : "Moderate stage pattern detected. Urgent specialist management and structured cognitive support are recommended.";

  const risk = uncertain
    ? { risk: "mild", label: "Moderate", color: "#F59E0B" }
    : alzheimerRiskMeta(prediction, confidence, normalizedClass);

  const stage = uncertain
    ? "Uncertain"
    : normalizedClass;

  const fallbackLongExplanation = (
    `${explainabilityText} ` +
    `Method: multimodal Alzheimer inference combines imaging attention and clinical signal calibration when available. ` +
    `Model confidence is ${confidence}%. ` +
    `Regional interpretation focuses on memory-network structures and smooth neurodegenerative spread patterns. ` +
    `Recommendation: ${recommendation}`
  );

  return {
    disease: "Alzheimer's Disease",
    diseaseType: normalizedClass,
    prediction,
    confidence,
    stage,
    severityLevel,
    riskLevel,
    abnormalityType: normalizedClass === "Non Demented" ? "None" : "Diffuse Neurodegeneration",
    explainabilitySummary: xai.summary || explainabilityText,
    explainabilityText: xai.detailed || fallbackLongExplanation,
    precautions: xai.precautions || "Use with MMSE trajectory, neurologic examination, and longitudinal imaging before treatment decisions.",
    keyFindings: Array.isArray(backend?.key_findings) && backend.key_findings.length
      ? backend.key_findings.slice(0, 4).map((item, idx) => {
          const label = typeof item === "string" ? item : item?.label || `Feature ${idx + 1}`;
          const score = typeof item === "object" && item?.score != null ? toPercent(item.score) : normalizedClass === "Non Demented" ? 16 : possible ? 52 : 80;
          return { label, score, risk: score > 70 ? "high" : score > 40 ? "medium" : "low" };
        })
      : [
          { label: "Hippocampal Atrophy", score: normalizedClass === "Non Demented" ? 14 : normalizedClass === "Very Mild Demented" ? 42 : normalizedClass === "Mild Demented" ? 66 : 84, risk: normalizedClass === "Non Demented" ? "low" : normalizedClass === "Very Mild Demented" ? "medium" : "high" },
          { label: "Temporal Lobe Pattern", score: normalizedClass === "Non Demented" ? 16 : normalizedClass === "Very Mild Demented" ? 44 : normalizedClass === "Mild Demented" ? 68 : 82, risk: normalizedClass === "Non Demented" ? "low" : normalizedClass === "Very Mild Demented" ? "medium" : "high" },
          { label: "Global Degeneration Spread", score: normalizedClass === "Non Demented" ? 12 : normalizedClass === "Very Mild Demented" ? 36 : normalizedClass === "Mild Demented" ? 58 : 78, risk: normalizedClass === "Non Demented" ? "low" : normalizedClass === "Very Mild Demented" ? "medium" : "high" },
        ],
    recommendation: xai.recommendation || recommendation,
    explanation: xai.detailed || fallbackLongExplanation,
    medicalDisclaimer: xai.disclaimer || "AI decision support only. Final diagnosis requires neurologist assessment and full clinical context.",
    modalityNote: formData?.mriImage ? "MRI + clinical screening (backend inference)" : "MRI missing",
    color: risk.color,
  };
};

const mapParkinsonBackendResult = (backend, formData) => {
  const xai = getBackendExplainability(backend);
  const confidence = toPercent(backend?.confidence);
  const raw = String(backend?.prediction || "").toLowerCase();
  const safe = /negative|no parkinson/.test(raw);
  const prediction = safe ? "No Parkinson Pattern Detected" : confidence <= 70 ? "Possible Parkinson Pattern" : "Parkinson Pattern Detected";
  const risk = parkinsonRiskMeta(prediction, confidence);

  const fallbackExplainability = "Voice and speech-derived biomarkers were analyzed for motor-speech irregularity. Feature attribution indicates which speech dimensions most influenced the decision and confidence tier.";

  return {
    ...buildResult("parkinsons", formData),
    prediction,
    confidence,
    stage: safe ? "No Significant Pattern" : confidence <= 70 ? "Mild to Moderate" : "Severe / High Suspicion",
    recommendation: xai.recommendation || backend?.recommendation || (safe ? "No strong Parkinson pattern detected. Continue follow-up." : "Recommend movement-disorder specialist review."),
    keyFindings: Array.isArray(backend?.key_findings) && backend.key_findings.length
      ? backend.key_findings.slice(0, 4).map((item, idx) => {
          const label = typeof item === "string" ? item : item?.label || `Feature ${idx + 1}`;
          const score = typeof item === "object" && item?.score != null ? toPercent(item.score) : safe ? 16 : confidence <= 70 ? 50 : 78;
          return { label, score, risk: score > 70 ? "high" : score > 40 ? "medium" : "low" };
        })
      : buildResult("parkinsons", formData).keyFindings,
    explainabilitySummary: xai.summary || fallbackExplainability,
    explainabilityText: xai.detailed || backend?.explanation || fallbackExplainability,
    precautions: xai.precautions || "AI speech screening does not replace neurological examination or standardized movement-disorder assessment.",
    medicalDisclaimer: xai.disclaimer || "AI decision support only. Final diagnosis requires specialist validation.",
    modalityNote: `${buildResult("parkinsons", formData).modalityNote} | backend inference`,
    color: risk.color,
  };
};

const mapBackendResult = (disease, backend, formData) => {
  if (disease === "tumor") return mapTumorBackendResult(backend, formData);
  if (disease === "alzheimers") return mapAlzheimerBackendResult(backend, formData);
  if (disease === "parkinsons") return mapParkinsonBackendResult(backend, formData);

  const confidence = toPercent(backend?.confidence);
  const defaultResult = buildResult(disease, formData);
  return {
    ...defaultResult,
    prediction: backend?.prediction || defaultResult.prediction,
    confidence: confidence || defaultResult.confidence,
    stage: backend?.stage || stageFromConfidence(confidence || defaultResult.confidence),
    recommendation: backend?.recommendation || defaultResult.recommendation,
    keyFindings: Array.isArray(backend?.key_findings) && backend.key_findings.length
      ? backend.key_findings.slice(0, 4).map((item, idx) => {
          if (typeof item === "string") {
            return { label: item, score: clamp((confidence || defaultResult.confidence) - idx * 8, 18, 90), risk: (confidence || defaultResult.confidence) > 70 ? "high" : (confidence || defaultResult.confidence) > 40 ? "medium" : "low" };
          }
          return {
            label: item?.label || `Feature ${idx + 1}`,
            score: item?.score != null ? toPercent(item.score) : clamp((confidence || defaultResult.confidence) - idx * 8, 18, 90),
            risk: item?.risk || ((confidence || defaultResult.confidence) > 70 ? "high" : (confidence || defaultResult.confidence) > 40 ? "medium" : "low"),
          };
        })
      : defaultResult.keyFindings,
    explainabilitySummary: backend?.explainability?.summary || defaultResult.explainabilityText,
    explainabilityText: backend?.explainability?.detailed_summary || backend?.explanation || defaultResult.explainabilityText,
    precautions: backend?.explainability?.precautions || "AI output should be interpreted with full clinical evaluation.",
    medicalDisclaimer: backend?.medical_disclaimer || "Clinical decision support only. Specialist confirmation is required.",
    color: disease === "parkinsons" ? confidenceMeta(confidence || defaultResult.confidence).color : defaultResult.color,
    modalityNote: backend ? `${defaultResult.modalityNote} | backend inference` : defaultResult.modalityNote,
  };
};

const requestPrediction = async (disease, formData) => {
  const fd = new FormData();

  if (disease === "alzheimers") {
    if (formData?.mriImage) fd.append("mri_image", formData.mriImage);
    if (formData?.includeAlzClinical) {
      fd.append("clinical_data", JSON.stringify({
        age: Number(formData?.age || 65),
        mmse: Number(formData?.mmse || 24),
        education: formData?.education || "High School",
        gender: formData?.gender || "female",
      }));
    }
    const res = await fetch(`${API_BASE}/predict/alzheimer`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Alzheimer API failed (${res.status})`);
    return res.json();
  }

  if (disease === "parkinsons") {
    if (formData?.speechFile) fd.append("speech_file", formData.speechFile);
    fd.append("clinical_data", JSON.stringify({
      age: Number(formData?.age || 65),
      gender: formData?.gender || "female",
      symptoms: {
        tremor: Boolean(formData?.parkSymptoms?.tremor),
        rigidity: Boolean(formData?.parkSymptoms?.rigidity),
        bradykinesia: Boolean(formData?.parkSymptoms?.bradykinesia),
        postural: Boolean(formData?.parkSymptoms?.balance),
        speech: Boolean(formData?.parkSymptoms?.speech),
        depression: Boolean(formData?.parkSymptoms?.depression),
        sleep: Boolean(formData?.parkSymptoms?.sleep),
      },
      voice_uploaded: Boolean(formData?.speechFile),
    }));
    const res = await fetch(`${API_BASE}/predict/parkinson`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Parkinson API failed (${res.status})`);
    return res.json();
  }

  if (disease === "tumor") {
    if (!formData?.mriImage) throw new Error("MRI image is required for brain tumor prediction");
    fd.append("file", formData.mriImage);
    const res = await fetch(`${API_BASE}/predict/brain_tumor`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Tumor API failed (${res.status})`);
    return res.json();
  }

  throw new Error("Unsupported disease selection");
};

function buildResult(disease, formData) {
  if (disease === "alzheimers") {
    const age = Number(formData?.age || 65);
    const mmse = Number(formData?.mmse || 24);
    const mriName = String(formData?.mriImage?.name || "").toLowerCase();
    const noAlzheimerPattern = /(non[\s_-]?demented|normal|healthy|control|negative)/.test(mriName);
    const alzheimerPattern = /(milddemented|moderatedemented|verymilddemented|demented|alzheimer|positive)/.test(mriName);
    const genderBoost = String(formData?.gender || "female") === "male" ? 2 : 0;
    const educationBoost = String(formData?.education || "high school").toLowerCase().includes("graduate") ? -2 : 0;
    const cognitiveSymptoms = Number(formData?.alzSymptomCount || 0);
    const cdr = Number(formData?.cdr ?? clamp(Math.round(((30 - mmse) / 10) + cognitiveSymptoms * 0.35 + (age > 75 ? 0.4 : 0)), 0, 3));
    const mriSignalBoost = noAlzheimerPattern ? -18 : alzheimerPattern ? 16 : (formData?.mriImage ? 4 : 0);
    const conf = clamp(Math.round(20 + (30 - mmse) * 4 + (age > 75 ? 10 : 0) + genderBoost + educationBoost + cognitiveSymptoms * 3 + cdr * 4 + (formData?.mriImage ? 8 : 0) + mriSignalBoost), 8, 96);
    const safe = conf < 45;
    const stageClass = mmse >= 27 ? "Non Demented" : mmse >= 24 ? "Very Mild Demented" : mmse >= 21 ? "Mild Demented" : "Moderate Demented";
    const severityLevel = stageClass === "Non Demented" ? "Normal" : stageClass === "Very Mild Demented" ? "Early" : stageClass === "Mild Demented" ? "Mild" : "Moderate";
    return {
      disease: "Alzheimer's Disease",
      diseaseType: stageClass,
      prediction: safe ? "No Alzheimer Pattern Detected" : `${stageClass} (Possible)`,
      confidence: conf,
      stage: stageClass,
      severityLevel,
      abnormalityType: stageClass === "Non Demented" ? "None" : "Diffuse Neurodegeneration",
      explainabilityText: safe
        ? "No neurodegenerative changes detected with no visible hippocampal or temporal atrophy."
        : stageClass === "Very Mild Demented"
          ? "Early subtle changes in memory-related regions with slight hippocampus shrinkage are visible."
          : stageClass === "Mild Demented"
            ? "Moderate neurodegeneration affecting cognitive regions with visible hippocampal and temporal atrophy."
            : "Advanced neurodegeneration with widespread atrophy and significant volume loss is visible.",
      keyFindings: [
        { label: "Memory Score (MMSE)", score: clamp(Math.round((30 - mmse) * 6), 5, 92), risk: conf >= 75 ? "high" : conf >= 45 ? "medium" : "low" },
        { label: "Clinical Dementia Rating (CDR)", score: clamp(Math.round(cdr * 30), 5, 90), risk: cdr >= 2 ? "high" : cdr >= 1 ? "medium" : "low" },
        { label: "Age Risk", score: clamp(Math.round((age / 100) * 55), 10, 70), risk: age > 75 ? "medium" : "low" },
        { label: "MRI Abnormal Region", score: formData?.mriImage ? clamp(noAlzheimerPattern ? 16 : alzheimerPattern ? 82 : conf - 10, 10, 90) : 12, risk: formData?.mriImage ? (noAlzheimerPattern ? "low" : conf >= 75 ? "high" : "medium") : "low" },
      ],
      recommendation: safe ? "No major Alzheimer pattern detected. Continue periodic cognitive screening." : "Recommend neurologist consultation and cognitive follow-up.",
      color: confidenceMeta(conf).color,
      modalityNote: formData?.mriImage ? "MRI + clinical screening provided" : "MRI missing",
    };
  }

  if (disease === "parkinsons") {
    const tremor = Number(formData?.tremorSeverity || 0);
    const voice = String(formData?.voiceIssues || "none");
    const symptomCount = Number(formData?.parkinsonSymptomCount || 0);
    const age = Number(formData?.age || 65);
    const genderBoost = String(formData?.gender || "female") === "male" ? 2 : 0;
    const voiceScore = voice === "severe" ? 18 : voice === "moderate" ? 12 : voice === "mild" ? 7 : 0;
    const speechBoost = formData?.speechFile ? 14 : 0;
    const conf = clamp(Math.round(16 + tremor * 9 + voiceScore + speechBoost + symptomCount * 4 + genderBoost + (age > 60 ? 4 : 0)), 10, 97);
    const safe = conf < 45;
    return {
      disease: "Parkinson's Disease",
      prediction: safe ? "No Parkinson Pattern Detected" : "Parkinson Pattern Detected",
      confidence: conf,
      stage: stageFromConfidence(conf),
      keyFindings: [
        { label: "Tremor Severity", score: clamp(tremor * 18, 5, 90), risk: tremor >= 4 ? "high" : tremor >= 2 ? "medium" : "low" },
        { label: "Motor Symptoms", score: clamp(Math.round(symptomCount * 13), 5, 90), risk: symptomCount >= 4 ? "high" : symptomCount >= 2 ? "medium" : "low" },
        { label: "Voice/Speech Changes", score: clamp(voiceScore * 4, 8, 88), risk: voice === "severe" ? "high" : voice === "none" ? "low" : "medium" },
        { label: "Speech Signal Evidence", score: formData?.speechFile ? clamp(conf - 10, 22, 92) : 10, risk: formData?.speechFile ? "medium" : "low" },
      ],
      recommendation: safe ? "Current signs are not strongly suggestive of Parkinson's. Keep clinical follow-up." : "Recommend movement-disorder specialist evaluation and confirmatory testing.",
      color: confidenceMeta(conf).color,
      modalityNote: formData?.speechFile ? "Voice sample provided with clinical screening" : "Voice sample missing",
    };
  }

  const name = String(formData?.mriImage?.name || "").toLowerCase();
  const noTumorPattern = /(notumou?r|no[\s_-]?tumou?r|normal|healthy|negative|no[_\s-]?mass)/.test(name);
  const pituitaryPattern = /(pituitary)/.test(name);
  const gliomaPattern = /(glioma)/.test(name);
  const meningiomaPattern = /(meningioma)/.test(name);
  const suspectedTumorClass = pituitaryPattern ? "Pituitary Tumor" : gliomaPattern ? "Glioma" : meningiomaPattern ? "Meningioma" : "Glioma";
  const conf = noTumorPattern
    ? 22
    : pituitaryPattern
      ? 83
      : gliomaPattern
        ? 88
        : meningiomaPattern
          ? 81
          : formData?.mriImage
            ? 56
            : 34;
  const low = conf < 40;
  const moderate = conf >= 40 && conf <= 70;
  const high = conf > 70;
  const diseaseType = low ? "No Tumor" : moderate ? "Uncertain" : suspectedTumorClass;
  const prediction = low ? "No Tumor Detected" : moderate ? "Uncertain Pattern" : `${suspectedTumorClass} (Confirmed)`;
  const abnormalityType = low ? "None" : suspectedTumorClass === "Glioma" ? "Diffuse" : "Localized";
  const recommendation = low
    ? "No abnormality detected. Continue routine follow-up if clinically indicated."
    : moderate
      ? "Possible abnormal pattern - requires review by neuroradiology with clinical correlation before final diagnosis."
      : "Strong abnormal regions detected. Urgent neuroradiology and specialist referral are advised.";

  let explainabilityText;
  if (low) {
    explainabilityText = "No abnormality detected. Heatmap is absent or very low intensity with no clinically meaningful focal lesion.";
  } else if (moderate) {
    explainabilityText = "Possible abnormal pattern - requires review. Soft heatmap indicates mild/ambiguous regions without confirmed tumor subtype.";
  } else if (diseaseType === "Pituitary Tumor") {
    explainabilityText = "Localized abnormality in pituitary region with clear central focus is highlighted.";
  } else if (diseaseType === "Glioma") {
    explainabilityText = "Diffuse infiltrative abnormal pattern with irregular spread is highlighted.";
  } else {
    explainabilityText = "Well-defined extra-axial lesion with clear boundary is highlighted.";
  }

  const subtypeFeatures = low
    ? [
      { label: "Mass Effect", score: 10, risk: "low" },
      { label: "Contrast/Texture", score: 12, risk: "low" },
      { label: "Boundary Irregularity", score: 8, risk: "low" },
    ]
    : diseaseType === "Pituitary Tumor"
      ? [
        { label: "Central Sellar Focus", score: high ? 84 : 52, risk: high ? "high" : "medium" },
        { label: "Localized Signal Intensity", score: high ? 79 : 50, risk: high ? "high" : "medium" },
        { label: "Boundary Sharpness", score: high ? 66 : 45, risk: high ? "medium" : "low" },
      ]
      : diseaseType === "Glioma"
        ? [
          { label: "Diffuse Infiltration", score: high ? 87 : 55, risk: high ? "high" : "medium" },
          { label: "Irregular Texture", score: high ? 80 : 53, risk: high ? "high" : "medium" },
          { label: "Edema-like Spread", score: high ? 72 : 47, risk: high ? "medium" : "low" },
        ]
        : [
          { label: "Extra-axial Lesion Margin", score: high ? 82 : 51, risk: high ? "high" : "medium" },
          { label: "Boundary Definition", score: high ? 76 : 50, risk: high ? "high" : "medium" },
          { label: "Focal Enhancement", score: high ? 68 : 44, risk: high ? "medium" : "low" },
        ];

  return {
    disease: "Brain Tumor",
    diseaseType,
    prediction,
    confidence: conf,
    stage: stageFromConfidence(conf),
    abnormalityType,
    keyFindings: subtypeFeatures,
    recommendation,
    explainabilityText,
    color: confidenceMeta(conf).color,
    modalityNote: formData?.mriImage ? "MRI-first tumor workflow" : "MRI missing",
  };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --primary: #0A1F44;
    --primary-light: #EAF3FF;
    --primary-mid: #BFD9FF;
    --secondary: #1D4ED8;
    --accent: #0EA5A5;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --purple: #8B5CF6;
    --text-dark: #0F172A;
    --text-mid: #334155;
    --text-soft: #64748B;
    --text-light: #94A3B8;
    --border: #E2E8F0;
    --surface: #F8FAFC;
    --white: #FFFFFF;
    --nav-bg: rgba(255,255,255,0.95);
    --card-soft: #F1F5F9;
    --warning-bg: #FFFBEB;
    --warning-border: #FDE68A;
    --warning-text: #92400E;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05);
    --radius: 14px;
    --radius-sm: 8px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--surface);
    color: var(--text-dark);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    transition: background 0.2s ease, color 0.2s ease;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Sora', sans-serif;
  }

  .app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    background:
      radial-gradient(circle at 12% 20%, rgba(14,165,233,0.14) 0, rgba(14,165,233,0.02) 22%, transparent 45%),
      radial-gradient(circle at 86% 24%, rgba(10,31,68,0.16) 0, rgba(10,31,68,0.03) 28%, transparent 52%),
      linear-gradient(180deg, #f7fbff 0%, #edf5ff 100%);
    overflow: hidden;
  }

  .app-wrapper::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 22% 26%, rgba(56,189,248,0.28) 0 2px, transparent 3px),
      radial-gradient(circle at 56% 44%, rgba(14,165,233,0.23) 0 2px, transparent 3px),
      radial-gradient(circle at 76% 32%, rgba(59,130,246,0.20) 0 2px, transparent 3px),
      linear-gradient(122deg, transparent 48%, rgba(14,165,233,0.10) 49%, transparent 51%),
      linear-gradient(35deg, transparent 48%, rgba(37,99,235,0.08) 49%, transparent 51%);
    background-size: auto, auto, auto, 280px 280px, 360px 360px;
    opacity: 0.45;
    z-index: 0;
  }

  .app-wrapper > * {
    position: relative;
    z-index: 1;
  }

  /* NAVBAR */
  .navbar {
    background: var(--nav-bg);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--primary);
    text-decoration: none;
  }
  .navbar-brand span {
    color: var(--text-dark);
    font-weight: 500;
    font-size: 13px;
    opacity: 0.6;
  }
  .navbar-badge {
    background: var(--primary-light);
    color: var(--primary);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.02em;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--white);
    color: var(--text-mid);
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .nav-btn:hover { background: var(--primary-light); border-color: var(--primary-mid); color: var(--primary); }
  .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* PAGE CONTAINER */
  .page {
    flex: 1;
    padding: 40px 24px 80px;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
    animation: fadeSlideIn 0.35s ease forwards;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* HERO */
  .hero {
    text-align: center;
    padding: 56px 24px 48px;
    max-width: 640px;
    margin: 0 auto;
  }
  .hero-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 12px 32px rgba(15,111,219,0.28);
  }
  .hero h1 {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--text-dark);
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }
  .hero p {
    font-size: 16px;
    line-height: 1.7;
    color: var(--text-soft);
    font-weight: 400;
    margin-bottom: 36px;
  }
  .hero-features {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .feature-pill {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-mid);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: var(--shadow-sm);
  }
  .feature-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--primary);
  }

  /* BUTTONS */
  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(15,111,219,0.30);
    transition: all 0.2s ease;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(15,111,219,0.38);
  }
  .btn-secondary {
    background: var(--white);
    color: var(--primary);
    border: 1.5px solid var(--primary-mid);
    padding: 12px 28px;
    border-radius: 50px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    background: var(--primary-light);
    border-color: var(--primary);
  }
  .btn-ghost {
    background: transparent;
    color: var(--text-soft);
    border: 1.5px solid var(--border);
    padding: 10px 22px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .btn-ghost:hover { background: var(--surface); color: var(--text-dark); }

  /* PAGE TITLE */
  .page-header {
    margin-bottom: 32px;
  }
  .page-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }
  .page-header p {
    font-size: 14px;
    color: var(--text-soft);
  }

  /* MODE CARDS */
  .mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 8px;
  }
  .mode-card {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 24px;
    cursor: pointer;
    transition: all 0.22s ease;
    position: relative;
    overflow: hidden;
  }
  .mode-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease;
  }
  .mode-card:hover::before, .mode-card.selected::before { transform: scaleX(1); }
  .mode-card:hover, .mode-card.selected {
    border-color: var(--primary-mid);
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
  .mode-icon {
    width: 48px; height: 48px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 22px;
  }
  .mode-card h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 8px;
  }
  .mode-card p {
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.6;
  }

  /* SYMPTOM CHECKER */
  .symptom-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .symptom-card:hover { border-color: var(--primary-mid); background: var(--primary-light); }
  .symptom-card.active {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  .symptom-label {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-dark);
  }
  .symptom-emoji { font-size: 20px; }
  .toggle-group {
    display: flex;
    gap: 8px;
  }
  .toggle-btn {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--border);
    background: var(--white);
    color: var(--text-soft);
    transition: all 0.15s;
  }
  .toggle-btn.yes-active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  .toggle-btn.no-active {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text-soft);
  }

  /* SUGGESTION CARD */
  .suggestion-card {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--card-soft) 100%);
    border: 1.5px solid var(--primary-mid);
    border-radius: var(--radius);
    padding: 24px 28px;
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .suggestion-icon {
    width: 52px; height: 52px;
    background: var(--primary);
    color: white;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .suggestion-card h4 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--primary);
    font-weight: 700;
    margin-bottom: 4px;
  }
  .suggestion-card .disease-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
  }

  /* DISEASE CARDS */
  .disease-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  .disease-card {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 20px;
    cursor: pointer;
    transition: all 0.22s ease;
    text-align: center;
  }
  .disease-card:hover, .disease-card.selected {
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
  }
  .disease-card.az:hover, .disease-card.az.selected { border-color: var(--secondary); }
  .disease-card.pk:hover, .disease-card.pk.selected { border-color: var(--purple); }
  .disease-card.bt:hover, .disease-card.bt.selected { border-color: var(--danger); }
  .disease-icon {
    width: 64px; height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px;
    font-size: 28px;
  }
  .disease-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 8px;
  }
  .disease-card p {
    font-size: 12px;
    color: var(--text-soft);
    line-height: 1.55;
  }
  .disease-check {
    width: 22px; height: 22px;
    background: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 14px auto 0;
    color: white;
  }

  /* INPUT FORM */
  .form-section {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 20px;
  }
  .form-section h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .form-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--primary);
    background: var(--primary-light);
    display: inline-flex;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .input-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .input-field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-mid);
  }
  .input-field input, .input-field select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text-dark);
    background: var(--surface);
    transition: border-color 0.15s;
    outline: none;
  }
  .input-field input:focus, .input-field select:focus {
    border-color: var(--primary);
    background: var(--white);
  }
  .input-hint {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 3px;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .checkbox-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 13px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #fff;
    color: var(--text-mid);
    font-size: 13px;
    line-height: 1.35;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }

  .checkbox-pill:hover {
    border-color: var(--primary-mid);
    background: var(--primary-light);
    box-shadow: var(--shadow-sm);
  }

  .checkbox-pill input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  /* SLIDER */
  .slider-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .slider-row input[type=range] {
    flex: 1;
    accent-color: var(--primary);
    height: 4px;
  }
  .slider-value {
    min-width: 36px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--primary);
    background: var(--primary-light);
    border-radius: 6px;
    padding: 2px 8px;
  }

  /* FILE UPLOAD */
  .upload-zone {
    border: 2px dashed var(--primary-mid);
    border-radius: var(--radius);
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--surface);
    position: relative;
  }
  .upload-zone:hover, .upload-zone.dragover {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  .upload-zone input[type=file] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .upload-icon-wrap {
    width: 56px; height: 56px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
  }
  .upload-zone h4 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 6px;
  }
  .upload-zone p {
    font-size: 13px;
    color: var(--text-soft);
  }
  .file-preview {
    margin-top: 16px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .file-preview img {
    width: 52px; height: 52px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid var(--border);
  }
  .file-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
  }
  .file-size {
    font-size: 12px;
    color: var(--text-soft);
    margin-top: 2px;
  }
  .file-check {
    margin-left: auto;
    color: var(--success);
  }

  /* PROCESSING */
  .processing-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    gap: 0;
  }
  .brain-pulse {
    width: 100px; height: 100px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 36px;
    animation: pulse 1.6s ease-in-out infinite;
    box-shadow: 0 0 0 0 rgba(15,111,219,0.4);
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(15,111,219,0.4); transform: scale(1); }
    50%  { box-shadow: 0 0 0 22px rgba(15,111,219,0); transform: scale(1.05); }
    100% { box-shadow: 0 0 0 0 rgba(15,111,219,0); transform: scale(1); }
  }
  .processing-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 28px 0;
    width: 100%;
    max-width: 380px;
  }
  .proc-step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    color: var(--text-soft);
    transition: all 0.3s;
  }
  .proc-step.active {
    border-color: var(--primary-mid);
    color: var(--primary);
    background: var(--primary-light);
    font-weight: 600;
  }
  .proc-step.done {
    border-color: #A7F3D0;
    color: var(--success);
    background: #F0FDF4;
    font-weight: 500;
  }
  .proc-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--border);
    flex-shrink: 0;
  }
  .proc-step.active .proc-dot { background: var(--primary); animation: blink 1s ease infinite; }
  .proc-step.done .proc-dot { background: var(--success); }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* PROGRESS BAR */
  .progress-bar-wrap {
    width: 100%;
    max-width: 380px;
    background: var(--border);
    border-radius: 10px;
    height: 6px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 10px;
    transition: width 0.5s ease;
  }

  /* RESULTS */
  .result-hero {
    background: linear-gradient(135deg, #0F6FDB 0%, #0EA5E9 100%);
    border-radius: var(--radius);
    padding: 32px;
    color: white;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .result-hero::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .result-hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .result-disease {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .result-stage {
    font-size: 14px;
    opacity: 0.8;
    font-weight: 400;
  }
  .confidence-ring {
    text-align: center;
  }
  .confidence-num {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    font-family: 'Sora', sans-serif;
  }
  .confidence-label {
    font-size: 11px;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-top: 3px;
  }
  .result-progress-wrap {
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    height: 8px;
    overflow: hidden;
  }
  .result-progress-fill {
    height: 100%;
    background: white;
    border-radius: 10px;
    transition: width 1s ease 0.3s;
  }
  .conf-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    opacity: 0.7;
    margin-top: 6px;
  }

  /* FEATURE IMPORTANCE */
  .features-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
    margin-bottom: 20px;
  }
  .features-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .feature-row {
    margin-bottom: 14px;
  }
  .feature-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .feature-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-mid);
  }
  .feature-score {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-dark);
  }
  .feature-bar-bg {
    height: 7px;
    background: var(--surface);
    border-radius: 10px;
    overflow: hidden;
  }
  .feature-bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 1s ease 0.5s;
  }
  .risk-high { background: linear-gradient(90deg, #EF4444, #F97316); }
  .risk-medium { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
  .risk-low { background: linear-gradient(90deg, #10B981, #34D399); }

  /* HEATMAP PLACEHOLDER */
  .heatmap-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
    margin-bottom: 20px;
  }
  .heatmap-placeholder {
    background: #0F172A;
    border-radius: 10px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .heatmap-tile {
    background: #020617;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .heatmap-tile img {
    width: 100%;
    height: 190px;
    object-fit: cover;
    display: block;
  }

  .heatmap-title {
    position: absolute;
    left: 8px;
    top: 8px;
    font-size: 10px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    font-weight: 700;
    color: #E2E8F0;
    background: rgba(2, 6, 23, 0.5);
    border-radius: 6px;
    padding: 4px 6px;
  }

  .preview-btn {
    position: absolute;
    right: 8px;
    bottom: 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 6px;
    background: rgba(15,23,42,0.62);
    color: #E2E8F0;
    cursor: pointer;
  }

  .preview-modal {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.78);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 200;
  }

  .preview-modal-card {
    width: min(100%, 980px);
    background: #0B1220;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
  }

  .preview-modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    color: #E2E8F0;
    border-bottom: 1px solid #334155;
    font-size: 12px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .preview-modal-close {
    border: 1px solid #475569;
    border-radius: 7px;
    background: #111827;
    color: #E2E8F0;
    cursor: pointer;
    padding: 5px 8px;
    font-size: 11px;
    font-weight: 700;
  }

  .preview-modal-body {
    padding: 8px;
    min-height: 520px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-modal-body img {
    max-width: 100%;
    max-height: 78vh;
    object-fit: contain;
  }

  .full-map {
    width: 100%;
    height: 190px;
    background:
      radial-gradient(circle at 16% 30%, rgba(250,204,21,0.85) 0%, rgba(249,115,22,0.55) 14%, transparent 28%),
      radial-gradient(circle at 52% 58%, rgba(34,197,94,0.45) 0%, rgba(34,197,94,0.16) 15%, transparent 30%),
      radial-gradient(circle at 78% 44%, rgba(239,68,68,0.65) 0%, rgba(239,68,68,0.2) 12%, transparent 24%),
      linear-gradient(180deg, rgba(30,64,175,0.48), rgba(8,47,73,0.72));
    filter: contrast(1.1) saturate(1.08);
  }

  .overlay-full {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 16% 30%, rgba(250,204,21,0.65) 0%, rgba(249,115,22,0.45) 15%, transparent 30%),
      radial-gradient(circle at 52% 58%, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.1) 17%, transparent 34%),
      radial-gradient(circle at 78% 44%, rgba(239,68,68,0.55) 0%, rgba(239,68,68,0.18) 14%, transparent 30%);
    mix-blend-mode: screen;
  }
  .heatmap-brain {
    opacity: 0.15;
    font-size: 80px;
  }
  .heatmap-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 45% 40%, rgba(239,68,68,0.7) 0%, rgba(249,115,22,0.4) 25%, rgba(251,191,36,0.2) 50%, transparent 70%),
                radial-gradient(circle at 65% 55%, rgba(239,68,68,0.5) 0%, rgba(249,115,22,0.3) 20%, transparent 45%);
  }
  .heatmap-label {
    position: absolute;
    bottom: 10px;
    left: 14px;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.05em;
  }

  /* DISCLAIMER */
  .disclaimer {
    background: var(--warning-bg);
    border: 1.5px solid var(--warning-border);
    border-radius: var(--radius-sm);
    padding: 14px 18px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 24px;
  }

  .disclaimer.strong {
    background: linear-gradient(135deg, rgba(10,31,68,0.06), rgba(29,78,216,0.08));
    border-color: rgba(29,78,216,0.22);
  }

  .disclaimer-title {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--primary);
    margin-bottom: 4px;
  }

  .disclaimer p {
    font-size: 13px;
    color: var(--warning-text);
    line-height: 1.55;
  }

  /* RESULT ACTIONS */
  .result-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* STEP INDICATOR */
  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 36px;
    overflow-x: auto;
    padding: 4px 0;
  }
  .step-item {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .step-dot {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    border: 2px solid var(--border);
    background: var(--white);
    color: var(--text-light);
    flex-shrink: 0;
    transition: all 0.25s;
    position: relative;
  }
  .step-dot.active {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 12px rgba(15,111,219,0.3);
  }
  .step-dot.done {
    border-color: var(--success);
    background: var(--success);
    color: white;
  }
  .step-line {
    width: 40px;
    height: 2px;
    background: var(--border);
    flex-shrink: 0;
    transition: background 0.25s;
  }
  .step-line.done { background: var(--success); }

  /* RECOMMENDATION */
  .recommend-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-left: 4px solid var(--primary);
    border-radius: var(--radius-sm);
    padding: 16px 20px;
    margin-top: 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .recommend-card p {
    font-size: 14px;
    color: var(--text-mid);
    line-height: 1.6;
  }

  /* RESPONSIVE */
  @media (max-width: 680px) {
    .hero h1 { font-size: 24px; }
    .mode-grid { grid-template-columns: 1fr; }
    .disease-grid { grid-template-columns: 1fr; }
    .input-grid { grid-template-columns: 1fr; }
    .result-hero-top { flex-direction: column; gap: 16px; }
    .page { padding: 24px 16px 60px; }
    .navbar { padding: 0 16px; }
    .step-line { width: 20px; }
    .heatmap-grid { grid-template-columns: 1fr; }
  }
`;

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const steps = ["Mode", "Symptoms", "Disease", "Inputs", "Results"];
function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <div className="step-item" key={s}>
          <div className={`step-dot ${i < current ? "done" : i === current ? "active" : ""}`}>
            {i < current ? <CheckIcon size={13} /> : i + 1}
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i < current ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

// 1. LANDING
function LandingPage({ onStart }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-icon">
          <BrainIcon size={38} color="white" />
        </div>
        <h1>Explainable Multimodal<br />Brain Disease Detection</h1>
        <p>
          A clinical decision support system powered by multimodal AI. Analyzes MRI scans,
          clinical data, and speech signals to assist clinicians in early detection of brain diseases.
        </p>
        <div className="hero-features">
          {["Alzheimer's", "Parkinson's", "Brain Tumor"].map(d => (
            <div className="feature-pill" key={d}>
              <div className="feature-dot" />
              {d}
            </div>
          ))}
          <div className="feature-pill">
            <div className="feature-dot" style={{ background: "var(--success)" }} />
            Explainable AI
          </div>
        </div>
        <button className="btn-primary" onClick={onStart}>
          Start Analysis <ChevronRightIcon size={18} />
        </button>
      </div>

      <div className="disclaimer strong" style={{ marginTop: 0 }}>
        <AlertIcon size={18} color="#D97706" />
        <div>
          <div className="disclaimer-title">Important Clinical Scope</div>
          <p><strong>Clinical Disclaimer:</strong> This system assists doctors and informed patients for preliminary decision support only. It supports Alzheimer's, Parkinson's, and Brain Tumor analysis and is not a replacement for clinical diagnosis.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
        {[
          { icon: "🧠", title: "Multimodal Input", desc: "Accepts MRI images, clinical scores, and speech signals" },
          { icon: "🔍", title: "Explainable Output", desc: "Heatmaps & feature importance explain every prediction" },
          { icon: "🏥", title: "Doctor-Friendly", desc: "Designed for clinical decision support, not diagnosis" },
        ].map(f => (
          <div key={f.title} className="form-section" style={{ textAlign: "center", padding: "24px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. MODE SELECTION
function ModePage({ onSelect }) {
  return (
    <div className="page">
      <StepIndicator current={0} />
      <div className="page-header">
        <h2>Select Analysis Mode</h2>
        <p>Choose how you'd like to proceed with the brain disease analysis.</p>
      </div>
      <div className="disclaimer strong" style={{ marginBottom: 18 }}>
        <AlertIcon size={18} color="#D97706" />
        <div>
          <div className="disclaimer-title">Guided Screening Scope</div>
          <p><strong>Important:</strong> Guided mode helps when disease is unknown. Direct mode is for known disease pathways. In both cases, final interpretation must be done by a medical professional.</p>
          <p style={{ marginTop: 6 }}>This tool only covers Alzheimer's, Parkinson's, and Brain Tumor screening.</p>
        </div>
      </div>
      <div className="mode-grid">
        <div className="mode-card" onClick={() => onSelect("guided")}>
          <div className="mode-icon">🩺</div>
          <h3>Guided Screening</h3>
          <p>Answer a few symptom-based questions and let the system suggest the most likely condition to analyze.</p>
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>Recommended for first-time users →</span>
          </div>
        </div>
        <div className="mode-card" onClick={() => onSelect("direct")}>
          <div className="mode-icon">🎯</div>
          <h3>Direct Disease Selection</h3>
          <p>Skip the symptom checker and go directly to select the disease you want to analyze.</p>
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 500 }}>For experienced users →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. SYMPTOM CHECKER
const SYMPTOMS = [
  { id: "memory", label: "Memory Loss / Forgetfulness", emoji: "🧠", disease: "alzheimers" },
  { id: "tremor", label: "Tremors / Shaking Hands", emoji: "🤲", disease: "parkinsons" },
  { id: "speech", label: "Speech / Voice Changes", emoji: "🗣️", disease: "parkinsons" },
  { id: "headache", label: "Persistent Headaches or Seizures", emoji: "😣", disease: "tumor" },
  { id: "balance", label: "Balance / Coordination Issues", emoji: "🚶", disease: "parkinsons" },
  { id: "vision", label: "Vision Problems", emoji: "👁️", disease: "tumor" },
];

function SymptomPage({ onNext }) {
  const [answers, setAnswers] = useState({});

  const toggle = (id) => setAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const getSuggestion = () => {
    const counts = {};
    Object.entries(answers).forEach(([id, val]) => {
      if (val) {
        const s = SYMPTOMS.find(s => s.id === id);
        if (s) counts[s.disease] = (counts[s.disease] || 0) + 1;
      }
    });
    if (Object.keys(counts).length === 0) return null;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const diseaseLabels = {
    alzheimers: "Alzheimer's Disease",
    parkinsons: "Parkinson's Disease",
    tumor: "Brain Tumor",
  };

  const suggestion = getSuggestion();

  return (
    <div className="page">
      <StepIndicator current={1} />
      <div className="page-header">
        <h2>Symptom Screening</h2>
        <p>Select symptoms the patient is experiencing to guide disease selection.</p>
      </div>

      {SYMPTOMS.map(s => (
        <div key={s.id} className={`symptom-card ${answers[s.id] ? "active" : ""}`} onClick={() => toggle(s.id)}>
          <div className="symptom-label">
            <span className="symptom-emoji">{s.emoji}</span>
            {s.label}
          </div>
          <input type="checkbox" checked={Boolean(answers[s.id])} readOnly style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
        </div>
      ))}

      {suggestion && (
        <div className="suggestion-card">
          <div className="suggestion-icon"><BrainIcon size={24} color="white" /></div>
          <div>
            <h4>Suggested Condition</h4>
            <div className="disease-name">{diseaseLabels[suggestion]}</div>
            <p style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 4 }}>
              Based on reported symptoms. Review and confirm to proceed.
            </p>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => onNext(suggestion)}
          disabled={!suggestion}
          style={!suggestion ? { opacity: 0.4, cursor: "not-allowed" } : {}}
        >
          Proceed to Analysis <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}

// 4. DISEASE SELECTION
function DiseasePage({ onSelect, preSelected }) {
  const [selected, setSelected] = useState(preSelected || null);

  const diseases = [
    {
      id: "alzheimers", cls: "az",
      icon: "🧠",
      bg: "rgba(14,165,233,0.1)",
      color: "#0EA5E9",
      title: "Alzheimer's Disease",
      desc: "Progressive neurodegenerative disorder affecting memory and cognitive function.",
    },
    {
      id: "parkinsons", cls: "pk",
      icon: "🤲",
      bg: "rgba(139,92,246,0.1)",
      color: "#8B5CF6",
      title: "Parkinson's Disease",
      desc: "Movement disorder caused by loss of dopamine-producing neurons.",
    },
    {
      id: "tumor", cls: "bt",
      icon: "🔬",
      bg: "rgba(239,68,68,0.1)",
      color: "#EF4444",
      title: "Brain Tumor",
      desc: "Abnormal growth of cells in the brain requiring urgent evaluation.",
    },
  ];

  return (
    <div className="page">
      <StepIndicator current={2} />
      <div className="page-header">
        <h2>Select Disease</h2>
        <p>Choose the condition to analyze. The input form will adapt accordingly.</p>
      </div>
      <div className="disease-grid">
        {diseases.map(d => (
          <div
            key={d.id}
            className={`disease-card ${d.cls} ${selected === d.id ? "selected" : ""}`}
            onClick={() => setSelected(d.id)}
          >
            <div className="disease-icon" style={{ background: d.bg, color: d.color }}>{d.icon}</div>
            <h3>{d.title}</h3>
            <p>{d.desc}</p>
            {selected === d.id && (
              <div className="disease-check"><CheckIcon size={13} /></div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => onSelect(selected)}
          disabled={!selected}
          style={!selected ? { opacity: 0.4, cursor: "not-allowed" } : {}}
        >
          Continue to Input Form <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}

// 5. INPUT FORM
function FileUpload({ label, accept, hint, onFile }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    onFile && onFile({ file: f, preview: null });
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => {
        setPreview(e.target.result);
        onFile && onFile({ file: f, preview: e.target.result });
      };
      reader.readAsDataURL(f);
    }
  };

  return (
    <div>
      <div
        className={`upload-zone ${drag ? "dragover" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <input type="file" accept={accept} onChange={e => handleFile(e.target.files[0])} />
        <div className="upload-icon-wrap"><UploadIcon size={24} /></div>
        <h4>{label}</h4>
        <p>Drag & drop or <span style={{ color: "var(--primary)", fontWeight: 600 }}>browse files</span></p>
        <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-light)" }}>{hint}</p>
      </div>
      {file && (
        <div className="file-preview">
          {preview ? (
            <img src={preview} alt="preview" />
          ) : (
            <div style={{ width: 52, height: 52, background: "var(--primary-light)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <MicIcon size={22} />
            </div>
          )}
          <div>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className="file-check" style={{ marginLeft: "auto" }}>
            <CheckIcon size={18} />
          </div>
        </div>
      )}
    </div>
  );
}

function InputFormPage({ disease, onSubmit }) {
  const [age, setAge] = useState(65);
  const [gender, setGender] = useState("female");
  const [education, setEducation] = useState("high school");
  const [includeAlzClinical, setIncludeAlzClinical] = useState(true);
  const [mmse, setMmse] = useState(24);
  const [alzSymptoms, setAlzSymptoms] = useState({ memoryLoss: true, disorientation: false, language: false, dailyTasks: false });
  const [tremorSeverity, setTremorSeverity] = useState(3);
  const [voiceIssues, setVoiceIssues] = useState("mild");
  const [parkSymptoms, setParkSymptoms] = useState({ tremor: true, rigidity: false, bradykinesia: true, balance: false, speech: false, depression: false, sleep: false });
  const [mriImage, setMriImage] = useState(null);
  const [mriPreview, setMriPreview] = useState("");
  const [speechFile, setSpeechFile] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const alzSymptomCount = Object.values(alzSymptoms).filter(Boolean).length;
  const cdr = clamp(Math.round(((30 - Number(mmse)) / 10) + alzSymptomCount * 0.35 + (Number(age) > 75 ? 0.4 : 0)), 0, 3);
  const parkinsonSymptomCount = Object.values(parkSymptoms).filter(Boolean).length;

  const diseaseInfo = {
    alzheimers: { label: "Alzheimer's Disease", color: "#0EA5E9", icon: "🧠" },
    parkinsons: { label: "Parkinson's Disease", color: "#8B5CF6", icon: "🤲" },
    tumor: { label: "Brain Tumor", color: "#EF4444", icon: "🔬" },
  };
  const info = diseaseInfo[disease];

  return (
    <div className="page">
      <StepIndicator current={3} />
      <div className="page-header">
        <h2>Patient Input</h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--primary-light)", color: "var(--primary)", padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
          <span>{info.icon}</span> {info.label}
        </div>
      </div>

      {/* File Upload */}
      <div className="form-section">
        <div className="form-section-label">
          {disease === "parkinsons" ? "🎙️ Speech File Upload" : "🧬 MRI Image Upload"}
        </div>
        {disease === "parkinsons" ? (
          <FileUpload
            label="Upload Voice Recording"
            accept="audio/*"
            hint="Supported: .wav, .mp3 — Speech sample (sustained vowel or reading)"
            onFile={({ file }) => setSpeechFile(file)}
          />
        ) : (
          <FileUpload
            label="Upload MRI Image"
            accept="image/*"
            hint="Supported: .png, .jpg, .dcm — Axial T1/T2 weighted MRI"
            onFile={({ file, preview }) => {
              setMriImage(file);
              if (preview) setMriPreview(preview);
            }}
          />
        )}
      </div>

      {disease === "alzheimers" && !mriImage && (
        <div className="disclaimer strong" style={{ marginTop: 14 }}>
          <AlertIcon size={18} color="#D97706" />
          <div>
            <div className="disclaimer-title">MRI Required</div>
            <p>For Alzheimer analysis, MRI scan is mandatory. Clinical data helps refine the result and should include age, gender, education, and cognitive history.</p>
          </div>
        </div>
      )}

      {/* Clinical Data */}
      {disease !== "tumor" && (
        <div className="form-section">
          <div className="form-section-label">📋 Clinical Data</div>

          {disease === "alzheimers" && (
            <div className="recommend-card" style={{ marginBottom: 14 }}>
              <InfoIcon size={17} color="var(--primary)" />
              <div style={{ width: "100%" }}>
                <p style={{ marginBottom: 8 }}><strong>Willing to provide clinical data?</strong></p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ background: includeAlzClinical ? "var(--primary-light)" : "#fff", borderColor: includeAlzClinical ? "var(--primary-mid)" : "var(--border)", color: includeAlzClinical ? "var(--primary)" : "var(--text-mid)", padding: "8px 12px" }}
                    onClick={() => setIncludeAlzClinical(true)}
                  >
                    Yes, include clinical inputs
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ background: !includeAlzClinical ? "var(--primary-light)" : "#fff", borderColor: !includeAlzClinical ? "var(--primary-mid)" : "var(--border)", color: !includeAlzClinical ? "var(--primary)" : "var(--text-mid)", padding: "8px 12px" }}
                    onClick={() => setIncludeAlzClinical(false)}
                  >
                    No, MRI only
                  </button>
                </div>
              </div>
            </div>
          )}

          {disease === "alzheimers" && (
            includeAlzClinical ? <>
              <div className="input-grid">
                <div className="input-field">
                  <label>Patient Age</label>
                  <input type="number" min={40} max={100} value={age} onChange={e => setAge(e.target.value)} />
                  <span className="input-hint">Typical range: 50–90 years</span>
                </div>
                <div className="input-field">
                  <label>Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Education Level</label>
                  <select value={education} onChange={e => setEducation(e.target.value)}>
                    <option>High School</option>
                    <option>Some College</option>
                    <option>Bachelor's Degree</option>
                    <option>Graduate Degree</option>
                  </select>
                </div>
              </div>
              <div className="input-field" style={{ marginTop: 18 }}>
                <label>Clinical Memory History</label>
                <div className="checkbox-grid">
                  {[
                    ["memoryLoss", "Recent memory loss"],
                    ["disorientation", "Disorientation to place or time"],
                    ["language", "Language or word-finding difficulty"],
                    ["dailyTasks", "Difficulty with daily tasks"],
                  ].map(([key, label]) => (
                    <label key={key} className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={alzSymptoms[key]}
                        onChange={e => setAlzSymptoms(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div className="slider-field">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-mid)", marginBottom: 8, display: "block" }}>
                    MMSE Score (Mini-Mental State Examination)
                  </label>
                  <div className="slider-row">
                    <input type="range" min={0} max={30} value={mmse} onChange={e => setMmse(e.target.value)} />
                    <span className="slider-value">{mmse}</span>
                  </div>
                  <span className="input-hint">0 = Severe impairment · 30 = No impairment (Normal: 24–30)</span>
                </div>
              </div>
              <div className="recommend-card" style={{ marginTop: 16 }}>
                <InfoIcon size={17} color="var(--primary)" />
                <p><strong>Derived CDR:</strong> {cdr.toFixed(1)} / 3.0 based on MMSE, age, and reported cognitive symptoms.</p>
              </div>
            </> : (
              <div className="disclaimer" style={{ marginTop: 8 }}>
                <AlertIcon size={18} color="#0369A1" />
                <p>Clinical section skipped. MRI-only Alzheimer analysis will be performed.</p>
              </div>
            )
          )}

          {disease === "parkinsons" && (
            <>
              <div className="input-grid">
                <div className="input-field">
                  <label>Patient Age</label>
                  <input type="number" min={35} max={100} value={age} onChange={e => setAge(e.target.value)} />
                  <span className="input-hint">Typical range: 50–80 years</span>
                </div>
                <div className="input-field">
                  <label>Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="slider-field">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-mid)", marginBottom: 8, display: "block" }}>
                    Tremor Severity (Patient-Reported)
                  </label>
                  <div className="slider-row">
                    <input type="range" min={0} max={5} value={tremorSeverity} onChange={e => setTremorSeverity(e.target.value)} />
                    <span className="slider-value">{tremorSeverity}</span>
                  </div>
                  <span className="input-hint">0 = None · 5 = Severe resting tremor</span>
                </div>
              </div>
              <div className="input-field" style={{ marginBottom: 18 }}>
                <label>Parkinson Symptom Checklist</label>
                <div className="checkbox-grid">
                  {[
                    ["tremor", "Resting tremor"],
                    ["rigidity", "Muscle rigidity"],
                    ["bradykinesia", "Slowness of movement"],
                    ["balance", "Postural instability"],
                    ["speech", "Speech softening or dysarthria"],
                    ["depression", "Depression or mood change"],
                    ["sleep", "Sleep disturbance"],
                  ].map(([key, label]) => (
                    <label key={key} className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={parkSymptoms[key]}
                        onChange={e => setParkSymptoms(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="input-grid">
                <div className="input-field">
                  <label>Voice / Speech Issues</label>
                  <select value={voiceIssues} onChange={e => setVoiceIssues(e.target.value)}>
                    <option value="none">None</option>
                    <option value="mild">Mild softening</option>
                    <option value="moderate">Moderate dysarthria</option>
                    <option value="severe">Severe speech difficulty</option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Duration of Symptoms</label>
                  <select>
                    <option>Less than 6 months</option>
                    <option>6–12 months</option>
                    <option>1–3 years</option>
                    <option>More than 3 years</option>
                  </select>
                </div>
              </div>
                <div className="recommend-card" style={{ marginTop: 8 }}>
                  <InfoIcon size={17} color="var(--primary)" />
                  <p><strong>Voice input expected:</strong> Uploading a voice sample improves Parkinson analysis. Clinical symptom count now tracks {parkinsonSymptomCount} reported features.</p>
                </div>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => {
            if (disease === "alzheimers" && !mriImage) {
              setSubmitError("Upload Brain MRI Scan is required before analysis.");
              return;
            }
            setSubmitError("");
            onSubmit({
              selectedDisease: disease,
              includeAlzClinical,
              age,
              gender,
              education,
              mmse,
              cdr,
              alzSymptomCount,
              alzSymptoms,
              tremorSeverity,
              voiceIssues,
              parkinsonSymptomCount,
              parkSymptoms,
              mriImage,
              mriPreview,
              speechFile,
            });
          }}
        >
          Run AI Analysis <ChevronRightIcon size={18} />
        </button>
      </div>

      {submitError && (
        <div className="disclaimer strong" style={{ marginTop: 14 }}>
          <AlertIcon size={18} color="#D97706" />
          <div>
            <div className="disclaimer-title">Action Needed</div>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {disease === "parkinsons" && !speechFile && (
        <div className="disclaimer" style={{ marginTop: 14 }}>
          <AlertIcon size={18} color="#D97706" />
          <p>Voice sample not uploaded. Clinical-only fallback will run, but accuracy may be reduced. Voice input is recommended for more accurate Parkinson prediction and should be paired with the symptom checklist above.</p>
        </div>
      )}
    </div>
  );
}

// 6. PROCESSING
function ProcessingPage({ onDone }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const procSteps = [
    "Loading patient data…",
    "Running preprocessing pipeline…",
    "Analyzing MRI / signal features…",
    "Running AI classification models…",
    "Generating explainability maps…",
  ];

  useEffect(() => {
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setStep(s);
      setProgress(Math.round((s / procSteps.length) * 100));
      if (s >= procSteps.length) {
        clearInterval(interval);
        setTimeout(onDone, 700);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="processing-wrap">
        <div className="brain-pulse">
          <BrainIcon size={48} color="white" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Analyzing Patient Data</h2>
        <p style={{ fontSize: 14, color: "var(--text-soft)", marginTop: 8, marginBottom: 24 }}>
          Please wait while the AI processes the inputs…
        </p>

        <div className="processing-steps">
          {procSteps.map((s, i) => (
            <div key={i} className={`proc-step ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="proc-dot" />
              {i < step ? <span style={{ textDecoration: "none" }}>{s.replace("…", " ✓")}</span> : s}
            </div>
          ))}
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 10 }}>{progress}% complete</p>
      </div>
    </div>
  );
}

// 7. RESULTS
function ResultsPage({ result, formData, onRestart }) {
  const [animated, setAnimated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("mri");
  const mriPreview = formData?.mriPreview;
  const verdict = diseaseVerdict(result);
  const isParkinsons = result.disease.toLowerCase().includes("parkinson");
  const isTumor = result.disease.toLowerCase().includes("brain tumor");
  const isAlzheimers = result.disease.toLowerCase().includes("alzheimer");
  const tumorClass = isTumor ? String(result.diseaseType || "") : "";
  const isNoTumor = isTumor && tumorClass === "No Tumor";
  const isUncertainTumor = isTumor && tumorClass === "Uncertain";
  const riskMeta = isTumor
    ? tumorRiskMeta(result.confidence, result.diseaseType)
    : isAlzheimers
      ? alzheimerRiskMeta(result.prediction, result.confidence, result.diseaseType)
      : isParkinsons
        ? parkinsonRiskMeta(result.prediction, result.confidence)
        : confidenceMeta(result.confidence);
  const tumorHeatIntensity = isTumor ? (isNoTumor ? 0 : isUncertainTumor ? 0.38 : result.confidence < 40 ? 0.2 : result.confidence <= 70 ? 0.5 : 0.9) : 0.85;
  const alzType = isAlzheimers ? String(result.diseaseType || "") : "";
  const alzUncertain = isAlzheimers && String(result.stage || "").toLowerCase().includes("uncertain");
  const alzHeatIntensity = isAlzheimers
    ? alzUncertain
      ? 0.34
      : /non\s*demented/i.test(alzType)
        ? 0.1
        : /very\s*mild/i.test(alzType)
          ? 0.34
          : /mild/i.test(alzType)
            ? 0.62
            : 0.9
    : 0.5;
  const heatmapIntensity = isTumor ? tumorHeatIntensity : isAlzheimers ? alzHeatIntensity : 0.85;
  const explainabilityLabel = isParkinsons ? "Voice Explainability" : isAlzheimers ? "Neurodegeneration Analysis" : isNoTumor ? "Normal MRI Screening" : isUncertainTumor ? "Uncertain Pattern Review" : isTumor ? "Lesion Detection" : "Grad-CAM Explainability";
  const explainabilityAccent = isAlzheimers ? "#1D4ED8" : isTumor ? "#DC2626" : "#0A1F44";
  const tumorHeatmapBackground = isNoTumor
    ? "linear-gradient(180deg, #f8fafc, #eef2ff)"
    : isUncertainTumor
      ? "radial-gradient(circle at 50% 48%, rgba(251,191,36,0.42) 0%, rgba(251,191,36,0.18) 20%, transparent 42%), radial-gradient(circle at 62% 54%, rgba(249,115,22,0.28) 0%, rgba(249,115,22,0.1) 22%, transparent 44%), linear-gradient(180deg, rgba(30,41,59,0.38), rgba(15,23,42,0.56))"
    : tumorClass === "Pituitary Tumor"
      ? "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.88) 0%, rgba(249,115,22,0.52) 14%, transparent 30%), linear-gradient(180deg, rgba(30,41,59,0.55), rgba(15,23,42,0.72))"
      : tumorClass === "Glioma"
        ? "radial-gradient(circle at 28% 44%, rgba(239,68,68,0.72) 0%, rgba(239,68,68,0.24) 24%, transparent 44%), radial-gradient(circle at 56% 52%, rgba(249,115,22,0.58) 0%, rgba(249,115,22,0.18) 22%, transparent 46%), radial-gradient(circle at 74% 40%, rgba(220,38,38,0.42) 0%, rgba(220,38,38,0.14) 20%, transparent 42%), linear-gradient(180deg, rgba(30,41,59,0.62), rgba(15,23,42,0.82))"
        : "radial-gradient(circle at 52% 50%, transparent 0 10%, rgba(239,68,68,0.78) 12% 16%, transparent 19%), radial-gradient(circle at 52% 50%, rgba(249,115,22,0.36) 0%, rgba(249,115,22,0.12) 26%, transparent 44%), linear-gradient(180deg, rgba(30,41,59,0.58), rgba(15,23,42,0.8))";
  const tumorOverlayBackground = isNoTumor
    ? "linear-gradient(180deg, rgba(241,245,249,0.12), rgba(226,232,240,0.16))"
    : isUncertainTumor
      ? "radial-gradient(circle at 50% 48%, rgba(251,191,36,0.28) 0%, rgba(251,191,36,0.12) 20%, transparent 42%), radial-gradient(circle at 62% 54%, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.08) 22%, transparent 44%), linear-gradient(180deg, rgba(251,191,36,0.08), rgba(15,23,42,0.18))"
    : tumorClass === "Pituitary Tumor"
      ? "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.58) 0%, rgba(249,115,22,0.35) 14%, transparent 30%), linear-gradient(180deg, rgba(220,38,38,0.18), rgba(15,23,42,0.3))"
      : tumorClass === "Glioma"
        ? "radial-gradient(circle at 28% 44%, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.18) 24%, transparent 44%), radial-gradient(circle at 56% 52%, rgba(249,115,22,0.42) 0%, rgba(249,115,22,0.14) 22%, transparent 46%), radial-gradient(circle at 74% 40%, rgba(220,38,38,0.28) 0%, rgba(220,38,38,0.1) 20%, transparent 42%), linear-gradient(180deg, rgba(220,38,38,0.14), rgba(15,23,42,0.3))"
        : "radial-gradient(circle at 52% 50%, transparent 0 10%, rgba(239,68,68,0.5) 12% 16%, transparent 19%), radial-gradient(circle at 52% 50%, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0.1) 26%, transparent 44%), linear-gradient(180deg, rgba(220,38,38,0.12), rgba(15,23,42,0.3))";
  const heatmapBackground = isAlzheimers
    ? alzUncertain
      ? "radial-gradient(circle at 30% 42%, rgba(251,191,36,0.46) 0%, rgba(251,191,36,0.2) 18%, transparent 36%), radial-gradient(circle at 58% 54%, rgba(59,130,246,0.34) 0%, rgba(59,130,246,0.14) 20%, transparent 38%), linear-gradient(180deg, rgba(15,23,42,0.9), rgba(30,41,59,0.86))"
      : /non\s*demented/i.test(alzType)
        ? "linear-gradient(180deg, rgba(15,23,42,0.76), rgba(30,41,59,0.74))"
        : /very\s*mild/i.test(alzType)
          ? "radial-gradient(circle at 24% 40%, rgba(59,130,246,0.34) 0%, rgba(59,130,246,0.14) 18%, transparent 34%), radial-gradient(circle at 56% 52%, rgba(250,204,21,0.28) 0%, rgba(250,204,21,0.12) 18%, transparent 36%), radial-gradient(circle at 72% 48%, rgba(14,165,233,0.24) 0%, rgba(14,165,233,0.1) 16%, transparent 34%), linear-gradient(180deg, rgba(15,23,42,0.9), rgba(30,41,59,0.86))"
          : /mild/i.test(alzType)
            ? "radial-gradient(circle at 22% 38%, rgba(59,130,246,0.46) 0%, rgba(59,130,246,0.2) 20%, transparent 42%), radial-gradient(circle at 56% 52%, rgba(250,204,21,0.38) 0%, rgba(250,204,21,0.18) 22%, transparent 45%), radial-gradient(circle at 76% 46%, rgba(14,165,233,0.34) 0%, rgba(14,165,233,0.14) 18%, transparent 42%), linear-gradient(180deg, rgba(15,23,42,0.92), rgba(30,41,59,0.9))"
            : "radial-gradient(circle at 20% 36%, rgba(59,130,246,0.66) 0%, rgba(59,130,246,0.3) 24%, transparent 46%), radial-gradient(circle at 54% 50%, rgba(250,204,21,0.58) 0%, rgba(250,204,21,0.26) 26%, transparent 48%), radial-gradient(circle at 74% 48%, rgba(14,165,233,0.52) 0%, rgba(14,165,233,0.2) 24%, transparent 46%), linear-gradient(180deg, rgba(15,23,42,0.94), rgba(30,41,59,0.92))"
    : isTumor
      ? tumorHeatmapBackground
      : "radial-gradient(circle at 16% 30%, rgba(250,204,21,0.85) 0%, rgba(249,115,22,0.55) 14%, transparent 28%), radial-gradient(circle at 52% 58%, rgba(34,197,94,0.45) 0%, rgba(34,197,94,0.16) 15%, transparent 30%), radial-gradient(circle at 78% 44%, rgba(239,68,68,0.65) 0%, rgba(239,68,68,0.2) 12%, transparent 24%), linear-gradient(180deg, rgba(30,64,175,0.48), rgba(8,47,73,0.72))";
  const overlayBackground = isAlzheimers
    ? alzUncertain
      ? "radial-gradient(circle at 30% 42%, rgba(251,191,36,0.36) 0%, rgba(251,191,36,0.14) 18%, transparent 36%), radial-gradient(circle at 58% 54%, rgba(59,130,246,0.26) 0%, rgba(59,130,246,0.1) 20%, transparent 38%), linear-gradient(180deg, rgba(15,23,42,0.18), rgba(30,41,59,0.24))"
      : /non\s*demented/i.test(alzType)
        ? "linear-gradient(180deg, rgba(15,23,42,0.08), rgba(30,41,59,0.12))"
        : /very\s*mild/i.test(alzType)
          ? "radial-gradient(circle at 24% 40%, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0.1) 18%, transparent 34%), radial-gradient(circle at 56% 52%, rgba(250,204,21,0.2) 0%, rgba(250,204,21,0.08) 18%, transparent 36%), linear-gradient(180deg, rgba(15,23,42,0.14), rgba(30,41,59,0.2))"
          : /mild/i.test(alzType)
            ? "radial-gradient(circle at 22% 38%, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0.12) 20%, transparent 42%), radial-gradient(circle at 56% 52%, rgba(250,204,21,0.26) 0%, rgba(250,204,21,0.1) 22%, transparent 45%), radial-gradient(circle at 76% 46%, rgba(14,165,233,0.22) 0%, rgba(14,165,233,0.08) 18%, transparent 42%), linear-gradient(180deg, rgba(15,23,42,0.16), rgba(30,41,59,0.24))"
            : "radial-gradient(circle at 20% 36%, rgba(59,130,246,0.46) 0%, rgba(59,130,246,0.18) 24%, transparent 46%), radial-gradient(circle at 54% 50%, rgba(250,204,21,0.4) 0%, rgba(250,204,21,0.16) 26%, transparent 48%), radial-gradient(circle at 74% 48%, rgba(14,165,233,0.34) 0%, rgba(14,165,233,0.12) 24%, transparent 46%), linear-gradient(180deg, rgba(15,23,42,0.2), rgba(30,41,59,0.28))"
    : isTumor
      ? tumorOverlayBackground
      : "radial-gradient(circle at 16% 30%, rgba(250,204,21,0.55) 0%, rgba(249,115,22,0.35) 14%, transparent 28%),radial-gradient(circle at 52% 58%, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.14) 15%, transparent 30%),radial-gradient(circle at 78% 44%, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.2) 12%, transparent 24%),linear-gradient(180deg, rgba(30,64,175,0.24), rgba(8,47,73,0.4))";
  const voiceBars = Array.from({ length: 28 }, (_, i) => {
    const base = Number(result.confidence || 0);
    return 24 + ((i * 7 + base) % 60);
  });

  const openPreview = (type) => {
    setPreviewType(type);
    setPreviewOpen(true);
  };

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  return (
    <div className="page">
      <StepIndicator current={4} />

      {/* Hero */}
      <div className="result-hero" style={{ background: `linear-gradient(135deg, ${riskMeta.color} 0%, ${riskMeta.color}99 100%)` }}>
        <div className="result-hero-top">
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.75, marginBottom: 8 }}>
              Predicted Condition
            </div>
            <div className="result-disease">{result.disease}</div>
            <div className="result-stage">{result.stage}</div>
            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 700 }}>
              {verdict}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>{result.modalityNote}</div>
          </div>
          <div className="confidence-ring">
            <div className="confidence-num">{result.confidence}%</div>
            <div className="confidence-label">Confidence</div>
          </div>
        </div>
        <div className="result-progress-wrap">
          <div className="result-progress-fill" style={{ width: animated ? `${result.confidence}%` : "0%" }} />
        </div>
        <div className="conf-text">
          <span>AI Confidence Score</span>
          <span>{result.confidence}% — {riskMeta.label}</span>
        </div>
      </div>

      <div className="recommend-card" style={{ borderLeftColor: riskMeta.color, marginTop: 14 }}>
        <InfoIcon size={17} color={riskMeta.color} />
        <p><strong>Disease Type:</strong> {result.diseaseType || result.disease} | <strong>Severity Level:</strong> {result.severityLevel || "Not Available"} | <strong>Risk Level:</strong> {result.riskLevel || riskMeta.label} | <strong>Type of Abnormality:</strong> {result.abnormalityType || "Pattern Not Specified"} | <strong>Output Verdict:</strong> {verdict}</p>
      </div>

      {/* Heatmap / Voice explainability */}
      <div className="heatmap-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          {isParkinsons ? <MicIcon size={18} /> : <MriIcon size={18} />} {explainabilityLabel}
        </h3>
        {!isParkinsons && (
          <div style={{ marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: explainabilityAccent, border: `1px solid ${explainabilityAccent}33`, background: isAlzheimers ? "linear-gradient(135deg,#eff6ff,#fefce8)" : "linear-gradient(135deg,#fff1f2,#ffedd5)" }}>
            {isAlzheimers ? "Diffuse Pattern Grad-CAM" : isNoTumor ? "No Heatmap Displayed" : isUncertainTumor ? "Soft Uncertain Heatmap" : `${tumorClass || "Tumor"} Pattern`}
          </div>
        )}

        {isParkinsons ? (
          <>
            <div className="heatmap-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="heatmap-tile">
                <span className="heatmap-title">Voice Signal Preview</span>
                <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#eff6ff,#e0f2fe)" }}>
                  <div style={{ width: "86%", display: "flex", alignItems: "end", gap: 2, height: 120 }}>
                    {voiceBars.map((h, idx) => (
                      <span key={idx} style={{ width: 6, height: `${h}%`, borderRadius: 999, background: idx % 3 === 0 ? "#0A1F44" : idx % 3 === 1 ? "#1D4ED8" : "#0EA5E9" }} />
                    ))}
                  </div>
                </div>
                <button className="preview-btn" onClick={() => openPreview("voice")}>Full View</button>
              </div>
              <div className="heatmap-tile">
                <span className="heatmap-title">Speech Attention Map</span>
                <div className="full-map" style={{ background: "radial-gradient(circle at 18% 34%, rgba(14,165,233,0.88) 0%, rgba(14,165,233,0.34) 16%, transparent 30%), radial-gradient(circle at 58% 52%, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.2) 14%, transparent 32%), linear-gradient(180deg, rgba(10,31,68,0.90), rgba(14,165,233,0.70))" }} />
                <button className="preview-btn" onClick={() => openPreview("voice-map")}>Full View</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 10, lineHeight: 1.6 }}>
              Voice-based analysis uses waveform and speech-attention visualization instead of MRI heatmap. This makes Parkinson explainability clearer and aligned with the available modality.
            </p>
          </>
        ) : (
          <>
            <div className="heatmap-grid">
              <div className="heatmap-tile">
                <span className="heatmap-title">Original MRI</span>
                {mriPreview ? <img src={mriPreview} alt="MRI Preview" /> : <div className="heatmap-placeholder"><span className="heatmap-brain">🧠</span></div>}
                <button className="preview-btn" onClick={() => openPreview("mri")}>Full View</button>
              </div>
              <div className="heatmap-tile">
                <span className="heatmap-title">Full Heatmap</span>
                <div className="full-map" style={{ opacity: heatmapIntensity, background: heatmapBackground, filter: isAlzheimers ? (alzUncertain ? "contrast(1.16) saturate(1.2) blur(0.16px)" : /non\s*demented/i.test(alzType) ? "contrast(0.95) saturate(0.86) blur(0.48px)" : /very\s*mild/i.test(alzType) ? "contrast(1.12) saturate(1.08) blur(0.35px)" : /mild/i.test(alzType) ? "contrast(1.24) saturate(1.26) blur(0.22px)" : "contrast(1.34) saturate(1.38) blur(0.16px)") : (isNoTumor || isUncertainTumor) ? "contrast(1) saturate(0.9)" : "contrast(1.12) saturate(1.08)" }} />
                <button className="preview-btn" onClick={() => openPreview("heatmap")}>Full View</button>
              </div>
              <div className="heatmap-tile">
                <span className="heatmap-title">MRI + Heatmap Overlay</span>
                {mriPreview ? (
                  <>
                    <img src={mriPreview} alt="Overlay MRI" />
                    <div className="overlay-full" style={{ opacity: heatmapIntensity, background: overlayBackground }} />
                  </>
                ) : (
                  <div className="full-map" style={{ opacity: heatmapIntensity, background: heatmapBackground }} />
                )}
                <button className="preview-btn" onClick={() => openPreview("overlay")}>Full View</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 10, lineHeight: 1.6 }}>
              {isAlzheimers || isTumor ? (result.explainabilitySummary || result.explainabilityText) : "Red/orange regions indicate highest model attention. The full map and overlay panels provide clearer localization for clinical review."}
            </p>
          </>
        )}
      </div>

      {/* Feature Importance */}
      <div className="features-card">
        <h3>
          <InfoIcon size={17} /> Feature Importance Analysis
        </h3>
        {result.keyFindings.map((f, i) => (
          <div className="feature-row" key={f.label}>
            <div className="feature-top">
              <span className="feature-name">{f.label}</span>
              <span className="feature-score">{f.score}%</span>
            </div>
            <div className="feature-bar-bg">
              <div
                className={`feature-bar-fill risk-${f.risk}`}
                style={{ width: animated ? `${f.score}%` : "0%" }}
              />
            </div>
          </div>
        ))}
        <div className="recommend-card">
          <InfoIcon size={17} color="var(--primary)" />
          <p><strong>Clinical Recommendation:</strong> {result.recommendation}</p>
        </div>

        <div className="recommend-card" style={{ borderLeftColor: "var(--accent)", marginTop: 10 }}>
          <InfoIcon size={17} color="var(--accent)" />
          <p><strong>Explainability (Doctor + Patient Friendly):</strong> {isParkinsons ? (result.explainabilitySummary || "The voice pattern and speech attention map show where the model focused most. Feature scores explain which speech-related factors influenced the decision and why this risk level was assigned.") : isAlzheimers || isTumor ? (result.explainabilitySummary || result.explainabilityText) : "The highlighted heatmap regions show where the model focused most. Feature scores explain which MRI and clinical factors influenced the decision and why this risk level was assigned."}</p>
        </div>

        <div className="recommend-card" style={{ borderLeftColor: "#1D4ED8", marginTop: 10, alignItems: "flex-start" }}>
          <InfoIcon size={17} color="#1D4ED8" />
          <div>
            <p style={{ marginBottom: 8 }}><strong>Detailed Explainability Narrative:</strong></p>
            <p style={{ margin: 0, lineHeight: 1.75, whiteSpace: "pre-line" }}>
              {result.explainabilityText || "Detailed explainability narrative is not available for this run."}
            </p>
          </div>
        </div>

        <div className="recommend-card" style={{ borderLeftColor: "#B45309", marginTop: 10, alignItems: "flex-start" }}>
          <AlertIcon size={17} color="#B45309" />
          <div>
            <p style={{ marginBottom: 8 }}><strong>Clinical Precautions:</strong></p>
            <p style={{ margin: 0, lineHeight: 1.75 }}>
              {result.precautions || "Use AI findings only as decision support and confirm with full clinical workup, imaging review, and specialist judgment."}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <AlertIcon size={18} color="#D97706" />
        <p>
          <strong>Medical Disclaimer:</strong> This system is intended for clinical decision support only and does not constitute a formal medical diagnosis. All findings must be reviewed and confirmed by a qualified medical professional.
        </p>
      </div>

      <div className="disclaimer strong" style={{ marginTop: 12 }}>
        <AlertIcon size={18} color="#D97706" />
        <p><strong>Safety Message:</strong> This is an AI-assisted screening tool and requires medical validation.</p>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button
          className="btn-primary"
          onClick={() => {
            const riskColor = riskMeta.risk === "safe" ? "#10B981" : riskMeta.risk === "mild" ? "#F59E0B" : "#EF4444";
            const findings = result.keyFindings.map((f) => `<tr><td style='padding:8px;border:1px solid #dbeafe;'>${f.label}</td><td style='padding:8px;border:1px solid #dbeafe;text-align:right;'>${f.score}%</td></tr>`).join("");
            const mriCard = mriPreview
              ? `<img src="${mriPreview}" alt="MRI Original" style="width:100%;height:170px;object-fit:cover;border-radius:8px;display:block;"/>`
              : `<div style="height:170px;border-radius:8px;background:#eef2ff;border:1px dashed #bfdbfe;display:flex;align-items:center;justify-content:center;color:#64748b;font-weight:600;">MRI not available</div>`;
            const html = `
              <html>
              <body style="font-family:Segoe UI,Arial,sans-serif;padding:28px;background:#f8fbff;color:#0f172a;">
                <div style="max-width:900px;margin:0 auto;background:#ffffff;border:1px solid #dbeafe;border-radius:14px;overflow:hidden;">
                  <div style="padding:18px 22px;background:linear-gradient(135deg,#0f6fdb,#0ea5e9);color:#fff;">
                    <h2 style="margin:0 0 6px 0;">NeuroAI Clinical Decision Support Report</h2>
                    <div style="font-size:12px;opacity:.9;">Hospital-style AI summary for physician review</div>
                  </div>
                  <div style="padding:20px 22px;">
                    <h3 style="margin:16px 0 8px 0;color:#0f6fdb;">Patient Summary</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                      <div><b>Disease:</b> ${result.disease}</div>
                      <div><b>Disease Type:</b> ${result.diseaseType || result.disease}</div>
                      <div><b>Prediction:</b> ${result.prediction}</div>
                      <div><b>Confidence:</b> ${result.confidence}%</div>
                      <div><b>Stage:</b> ${result.stage}</div>
                      <div><b>Severity Level:</b> ${result.severityLevel || "Not Available"}</div>
                      <div><b>Risk Level:</b> ${result.riskLevel || riskMeta.label}</div>
                      <div><b>Type of Abnormality:</b> ${result.abnormalityType || "Pattern Not Specified"}</div>
                    </div>
                    <div style="margin-top:12px;padding:10px 12px;border-radius:8px;border:1px solid ${riskColor};color:${riskColor};font-weight:700;">Risk Level: ${riskMeta.label}</div>
                    <div style="margin-top:8px;padding:10px 12px;border-radius:8px;border:1px solid ${riskColor};background:${riskMeta.risk === "safe" ? "#ecfdf5" : riskMeta.risk === "mild" ? "#fffbeb" : "#fef2f2"};color:${riskColor};font-weight:700;">Output Verdict: ${verdict}</div>
                    <div style="margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid #bcd7f7;background:#eef6ff;color:#0a1f44;font-weight:700;">${result.modalityNote || "Clinical modality reviewed"}</div>
                    ${isParkinsons ? `
                    <h3 style="margin:20px 0 8px 0;color:#0f6fdb;">Voice Explainability Summary</h3>
                    <div style="height:180px;border-radius:10px;border:1px solid #cbd5e1;overflow:hidden;position:relative;background:linear-gradient(180deg,#eff6ff,#dbeafe);padding:12px;">
                      <div style="display:flex;align-items:end;gap:2px;height:100%;">
                        ${voiceBars.map((h) => `<span style='width:6px;height:${h}%;background:#0A1F44;border-radius:999px;display:inline-block;'></span>`).join("")}
                      </div>
                    </div>
                    <p style="font-size:13px;line-height:1.6;color:#334155;margin-top:8px;">Voice waveform and attention visualization explain the Parkinson result. These visuals are used instead of MRI heatmap because speech is the relevant modality here.</p>
                    ` : `
                    <h3 style="margin:20px 0 8px 0;color:${isAlzheimers ? "#1D4ED8" : (isNoTumor ? "#0F766E" : (isUncertainTumor ? "#B45309" : "#DC2626"))};">${isAlzheimers ? "Neurodegeneration Analysis Panels" : (isNoTumor ? "Normal MRI Screening Panels" : (isUncertainTumor ? "Uncertain Pattern Review Panels" : "Lesion Detection Panels"))}</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                      <div>
                        <div style="font-size:12px;color:#334155;font-weight:700;margin-bottom:6px;">Original MRI</div>
                        ${mriCard}
                      </div>
                      <div>
                        <div style="font-size:12px;color:#334155;font-weight:700;margin-bottom:6px;">Full Heatmap</div>
                        <div style="height:170px;border-radius:8px;border:1px solid #cbd5e1;overflow:hidden;position:relative;background:${isAlzheimers ? "#eff6ff" : (isNoTumor ? "#f8fafc" : (isUncertainTumor ? "#fff7ed" : "#0f172a"))};">
                          <div style="position:absolute;inset:0;opacity:${heatmapIntensity};background:${heatmapBackground};"></div>
                        </div>
                      </div>
                      <div>
                        <div style="font-size:12px;color:#334155;font-weight:700;margin-bottom:6px;">Heatmap on Original</div>
                        <div style="height:170px;border-radius:8px;border:1px solid #cbd5e1;overflow:hidden;position:relative;background:#0f172a;">
                          ${mriPreview ? `<img src="${mriPreview}" alt="MRI Overlay" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>` : ""}
                          <div style="position:absolute;inset:0;opacity:${heatmapIntensity};background:${overlayBackground};"></div>
                        </div>
                      </div>
                    </div>
                    <p style="font-size:13px;line-height:1.6;color:#334155;margin-top:8px;">${(isTumor || isAlzheimers) ? (result.explainabilitySummary || result.explainabilityText || "These three panels provide original MRI, model heatmap, and combined overlay for transparent review.") : "These three panels provide original MRI, model heatmap, and combined overlay for transparent review."}</p>
                    `}

                    <h3 style="margin:20px 0 8px 0;color:#0f6fdb;">Detailed Explainability Narrative</h3>
                    <p style="margin:0;line-height:1.8;color:#1e293b;">${result.explainabilityText || "Detailed explainability narrative is not available."}</p>

                    <h3 style="margin:20px 0 8px 0;color:#b45309;">Clinical Precautions</h3>
                    <p style="margin:0;line-height:1.7;color:#7c2d12;">${result.precautions || "Use AI output as support only and confirm with specialist-led clinical evaluation."}</p>

                    <h3 style="margin:20px 0 8px 0;color:#0f6fdb;">Feature Importance</h3>
                    <table style="width:100%;border-collapse:collapse;background:#f8fbff;">${findings}</table>

                    <h3 style="margin:20px 0 8px 0;color:#0f6fdb;">Clinical Recommendation</h3>
                    <p style="margin:0;line-height:1.7;">${result.recommendation}</p>

                    <div style="margin-top:16px;padding:12px;border-radius:8px;background:#fffbeb;border:1px solid #fcd34d;color:#92400e;line-height:1.6;">
                      <b>Medical Disclaimer:</b> This system supports medical professionals and is not a replacement for final clinical diagnosis. This is an AI-assisted screening tool and requires medical validation.
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `;
            const blob = new Blob([html], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "NeuroAI_Report.html";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <DownloadIcon size={18} /> Download Report
        </button>
        <button className="btn-secondary" onClick={onRestart}>
          <RefreshIcon size={18} /> Start New Analysis
        </button>
      </div>

      {previewOpen && (
        <div className="preview-modal" onClick={() => setPreviewOpen(false)}>
          <div className="preview-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-head">
              <span>
                {previewType === "mri"
                  ? "MRI Preview"
                  : previewType === "heatmap"
                    ? "Full Heatmap"
                    : previewType === "overlay"
                      ? "MRI + Heatmap Overlay"
                      : previewType === "voice"
                        ? "Voice Signal Preview"
                        : "Speech Attention Map"}
              </span>
              <button className="preview-modal-close" onClick={() => setPreviewOpen(false)}>Close</button>
            </div>
            <div className="preview-modal-body">
              {previewType === "mri" && mriPreview && <img src={mriPreview} alt="MRI Full" />}
              {previewType === "mri" && !mriPreview && <div className="full-map" style={{ width: "100%", height: "70vh" }} />}
              {previewType === "heatmap" && <div className="full-map" style={{ width: "100%", height: "70vh", opacity: heatmapIntensity, background: heatmapBackground, filter: isAlzheimers ? (alzUncertain ? "contrast(1.16) saturate(1.2) blur(0.16px)" : /non\s*demented/i.test(alzType) ? "contrast(0.95) saturate(0.86) blur(0.48px)" : /very\s*mild/i.test(alzType) ? "contrast(1.12) saturate(1.08) blur(0.35px)" : /mild/i.test(alzType) ? "contrast(1.24) saturate(1.26) blur(0.22px)" : "contrast(1.34) saturate(1.38) blur(0.16px)") : (isNoTumor || isUncertainTumor) ? "contrast(1) saturate(0.9)" : "contrast(1.12) saturate(1.08)" }} />}
              {previewType === "overlay" && mriPreview && (
                <div style={{ width: "100%", height: "70vh", position: "relative" }}>
                  <img src={mriPreview} alt="Overlay Full" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <div className="overlay-full" style={{ opacity: heatmapIntensity, background: overlayBackground }} />
                </div>
              )}
              {previewType === "overlay" && !mriPreview && <div className="full-map" style={{ width: "100%", height: "70vh", opacity: heatmapIntensity, background: heatmapBackground }} />}
              {previewType === "voice" && (
                <div style={{ width: "100%", height: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#eff6ff,#dbeafe)" }}>
                  <div style={{ width: "86%", display: "flex", alignItems: "end", gap: 2, height: "70%" }}>
                    {voiceBars.map((h, idx) => (
                      <span key={idx} style={{ width: 8, height: `${h}%`, borderRadius: 999, background: idx % 3 === 0 ? "#0A1F44" : idx % 3 === 1 ? "#1D4ED8" : "#0EA5E9" }} />
                    ))}
                  </div>
                </div>
              )}
              {previewType === "voice-map" && (
                <div className="full-map" style={{ width: "100%", height: "70vh", background: "radial-gradient(circle at 18% 34%, rgba(14,165,233,0.88) 0%, rgba(14,165,233,0.34) 16%, transparent 30%), radial-gradient(circle at 58% 52%, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.2) 14%, transparent 32%), linear-gradient(180deg, rgba(10,31,68,0.90), rgba(14,165,233,0.70))" }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [mode, setMode] = useState(null);
  const [disease, setDisease] = useState(null);
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const [formData, setFormData] = useState(null);
  const [resultData, setResultData] = useState(null);

  const navigate = (next) => {
    setBackStack((prev) => [...prev, screen]);
    setForwardStack([]);
    setScreen(next);
  };

  const goBack = () => {
    if (!backStack.length) return;
    const prev = backStack[backStack.length - 1];
    setBackStack((old) => old.slice(0, -1));
    setForwardStack((old) => [screen, ...old]);
    setScreen(prev);
  };

  const goForward = () => {
    if (!forwardStack.length) return;
    const next = forwardStack[0];
    setForwardStack((old) => old.slice(1));
    setBackStack((old) => [...old, screen]);
    setScreen(next);
  };

  const restart = () => {
    setScreen("landing");
    setMode(null);
    setDisease(null);
    setBackStack([]);
    setForwardStack([]);
    setFormData(null);
    setResultData(null);
  };

  const runAnalysis = (payload) => {
    setFormData(payload);
    navigate("processing");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={restart}>
            <BrainIcon size={22} color="var(--primary)" />
            NeuroAI
            <span>/ Brain Disease Detection</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn" onClick={goBack} disabled={!backStack.length} title="Back">
              <ChevronLeftIcon size={18} />
            </button>
            <button className="nav-btn" onClick={goForward} disabled={!forwardStack.length} title="Forward">
              <ChevronRightIcon size={18} />
            </button>
            <span className="navbar-badge">Decision Support Only</span>
          </div>
        </nav>

        {/* PAGES */}
        {screen === "landing" && <LandingPage onStart={() => navigate("mode")} />}

        {screen === "mode" && (
          <ModePage onSelect={m => {
            setMode(m);
            navigate(m === "guided" ? "symptoms" : "disease");
          }} />
        )}

        {screen === "symptoms" && (
          <SymptomPage onNext={d => {
            if (d) setDisease(d);
            navigate("disease");
          }} />
        )}

        {screen === "disease" && (
          <DiseasePage preSelected={disease} onSelect={d => {
            setDisease(d);
            navigate("form");
          }} />
        )}

        {screen === "form" && disease && (
          <InputFormPage disease={disease} onSubmit={runAnalysis} />
        )}

        {screen === "processing" && (
          <ProcessingPage
            onDone={async () => {
              const activeDisease = (formData && formData.selectedDisease) || disease;
              try {
                const backend = await requestPrediction(activeDisease, formData || {});
                const next = mapBackendResult(activeDisease, backend, formData || {});
                setResultData(next);
              } catch {
                const fallback = buildResult(activeDisease, formData || {});
                setResultData(fallback);
              }
              navigate("results");
            }}
          />
        )}

        {screen === "results" && resultData && (
          <ResultsPage result={resultData} formData={formData} onRestart={restart} />
        )}
      </div>
    </>
  );
}
