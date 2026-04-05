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
const MOCK_RESULTS = {
  alzheimers: {
    disease: "Alzheimer's Disease",
    confidence: 87,
    stage: "Mild Cognitive Impairment",
    keyFindings: [
      { label: "Hippocampal Atrophy", score: 78, risk: "high" },
      { label: "Memory Score (MMSE)", score: 62, risk: "high" },
      { label: "Cortical Thinning", score: 55, risk: "medium" },
      { label: "Age Risk Factor", score: 40, risk: "medium" },
    ],
    recommendation: "Recommend neurology consultation and follow-up cognitive testing in 3 months.",
    color: "#0EA5E9",
  },
  parkinsons: {
    disease: "Parkinson's Disease",
    confidence: 91,
    stage: "Early Stage (Hoehn & Yahr 1–2)",
    keyFindings: [
      { label: "Vocal Tremor Index", score: 85, risk: "high" },
      { label: "HNR (Voice Quality)", score: 70, risk: "high" },
      { label: "Tremor Severity", score: 60, risk: "medium" },
      { label: "RPDE (Nonlinear)", score: 45, risk: "medium" },
    ],
    recommendation: "Consider dopamine transporter scan (DaT-SPECT) and movement disorder specialist referral.",
    color: "#8B5CF6",
  },
  tumor: {
    disease: "Brain Tumor",
    confidence: 94,
    stage: "Glioma — Grade II (Low Grade)",
    keyFindings: [
      { label: "Mass Effect Detection", score: 92, risk: "high" },
      { label: "Contrast Enhancement", score: 80, risk: "high" },
      { label: "Tumor Volume (est.)", score: 65, risk: "medium" },
      { label: "Perilesional Edema", score: 50, risk: "medium" },
    ],
    recommendation: "Urgent neurosurgical evaluation recommended. MRI with contrast and biopsy consideration.",
    color: "#EF4444",
  },
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --primary: #0F6FDB;
    --primary-light: #EFF6FF;
    --primary-mid: #BFDBFE;
    --secondary: #0EA5E9;
    --accent: #06B6D4;
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
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Sora', sans-serif;
  }

  .app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* NAVBAR */
  .navbar {
    background: rgba(255,255,255,0.92);
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
    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
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
    background: #FFFBEB;
    border: 1.5px solid #FDE68A;
    border-radius: var(--radius-sm);
    padding: 14px 18px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 24px;
  }
  .disclaimer p {
    font-size: 13px;
    color: #92400E;
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

  const toggle = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  const getSuggestion = () => {
    const counts = {};
    Object.entries(answers).forEach(([id, val]) => {
      if (val === "yes") {
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
        <div key={s.id} className={`symptom-card ${answers[s.id] === "yes" ? "active" : ""}`}>
          <div className="symptom-label">
            <span className="symptom-emoji">{s.emoji}</span>
            {s.label}
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${answers[s.id] === "yes" ? "yes-active" : ""}`}
              onClick={() => toggle(s.id, answers[s.id] === "yes" ? null : "yes")}
            >Yes</button>
            <button
              className={`toggle-btn ${answers[s.id] === "no" ? "no-active" : ""}`}
              onClick={() => toggle(s.id, answers[s.id] === "no" ? null : "no")}
            >No</button>
          </div>
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
    onFile && onFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
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
  const [mmse, setMmse] = useState(24);
  const [tremorSeverity, setTremorSeverity] = useState(3);
  const [voiceIssues, setVoiceIssues] = useState("mild");

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
          />
        ) : (
          <FileUpload
            label="Upload MRI Image"
            accept="image/*"
            hint="Supported: .png, .jpg, .dcm — Axial T1/T2 weighted MRI"
          />
        )}
      </div>

      {/* Clinical Data */}
      {disease !== "tumor" && (
        <div className="form-section">
          <div className="form-section-label">📋 Clinical Data</div>

          {disease === "alzheimers" && (
            <>
              <div className="input-grid">
                <div className="input-field">
                  <label>Patient Age</label>
                  <input type="number" min={40} max={100} value={age} onChange={e => setAge(e.target.value)} />
                  <span className="input-hint">Typical range: 50–90 years</span>
                </div>
                <div className="input-field">
                  <label>Education Level</label>
                  <select>
                    <option>High School</option>
                    <option>Some College</option>
                    <option>Bachelor's Degree</option>
                    <option>Graduate Degree</option>
                  </select>
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
            </>
          )}

          {disease === "parkinsons" && (
            <>
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
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-primary" onClick={onSubmit}>
          Run AI Analysis <ChevronRightIcon size={18} />
        </button>
      </div>
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
function ResultsPage({ disease, onRestart }) {
  const [animated, setAnimated] = useState(false);
  const result = MOCK_RESULTS[disease] || MOCK_RESULTS.alzheimers;

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  return (
    <div className="page">
      <StepIndicator current={4} />

      {/* Hero */}
      <div className="result-hero" style={{ background: `linear-gradient(135deg, ${result.color} 0%, ${result.color}99 100%)` }}>
        <div className="result-hero-top">
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.75, marginBottom: 8 }}>
              Predicted Condition
            </div>
            <div className="result-disease">{result.disease}</div>
            <div className="result-stage">{result.stage}</div>
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
          <span>{result.confidence}% — High Certainty</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="heatmap-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <MriIcon size={18} /> Grad-CAM Explainability Heatmap
        </h3>
        <div className="heatmap-placeholder">
          <div className="heatmap-overlay" />
          <span className="heatmap-brain">🧠</span>
          <span className="heatmap-label">Grad-CAM · Simulated Region Activation</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 10, lineHeight: 1.6 }}>
          Red/orange regions indicate areas of highest model attention during prediction. These highlights correspond to anatomical regions associated with {result.disease}.
        </p>
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
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <AlertIcon size={18} color="#D97706" />
        <p>
          <strong>Medical Disclaimer:</strong> This system is intended for clinical decision support only and does not constitute a formal medical diagnosis. All findings must be reviewed and confirmed by a qualified medical professional.
        </p>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="btn-primary" onClick={() => alert("Report download simulated — integrate with PDF export in production.")}>
          <DownloadIcon size={18} /> Download Report
        </button>
        <button className="btn-secondary" onClick={onRestart}>
          <RefreshIcon size={18} /> Start New Analysis
        </button>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [mode, setMode] = useState(null);
  const [disease, setDisease] = useState(null);

  const restart = () => { setScreen("landing"); setMode(null); setDisease(null); };

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
          <span className="navbar-badge">Decision Support Only</span>
        </nav>

        {/* PAGES */}
        {screen === "landing" && <LandingPage onStart={() => setScreen("mode")} />}

        {screen === "mode" && (
          <ModePage onSelect={m => {
            setMode(m);
            setScreen(m === "guided" ? "symptoms" : "disease");
          }} />
        )}

        {screen === "symptoms" && (
          <SymptomPage onNext={d => {
            if (d) setDisease(d);
            setScreen("disease");
          }} />
        )}

        {screen === "disease" && (
          <DiseasePage preSelected={disease} onSelect={d => {
            setDisease(d);
            setScreen("form");
          }} />
        )}

        {screen === "form" && disease && (
          <InputFormPage disease={disease} onSubmit={() => setScreen("processing")} />
        )}

        {screen === "processing" && (
          <ProcessingPage onDone={() => setScreen("results")} />
        )}

        {screen === "results" && disease && (
          <ResultsPage disease={disease} onRestart={restart} />
        )}
      </div>
    </>
  );
}
