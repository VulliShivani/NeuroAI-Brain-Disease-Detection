from __future__ import annotations

import base64
import io
from datetime import datetime
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image as RLImage
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.styles.add(
            ParagraphStyle(
                name="TitleHospital",
                parent=self.styles["Heading1"],
                fontSize=22,
                textColor=colors.HexColor("#0F6FDB"),
                alignment=TA_CENTER,
                fontName="Helvetica-Bold",
            )
        )
        self.styles.add(
            ParagraphStyle(
                name="BodyHospital",
                parent=self.styles["BodyText"],
                fontSize=10,
                leading=14,
                alignment=TA_JUSTIFY,
            )
        )

    def generate_report(self, patient_summary: Dict[str, Any], result: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
        story: List[Any] = []

        story.append(Paragraph("NeuroAI Clinical Decision Support Report", self.styles["TitleHospital"]))
        story.append(Spacer(1, 0.2 * inch))

        generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        metadata = [
            ["Generated", generated_at],
            ["Disease", str(result.get("disease", "N/A"))],
            ["Class Prediction", str(result.get("class_prediction", result.get("prediction", "N/A")))],
            ["Confidence", f"{float(result.get('confidence', 0.0)) * 100:.1f}%"],
            ["Severity Level", str(result.get("severity_level", result.get("stage", "N/A")))],
            ["Risk Level", str(result.get("risk_level", "N/A"))],
            ["Abnormality Type", str(result.get("abnormality_type", "N/A"))],
            ["Confidence Control", str((result.get("confidence_control") or {}).get("status", "N/A"))],
        ]
        table = Table(metadata, colWidths=[2.0 * inch, 4.2 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFF6FF")),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.2 * inch))

        probabilities = result.get("probabilities", {}) or {}
        if probabilities:
            prob_rows = [["Class", "Probability"]]
            for label, score in probabilities.items():
                prob_rows.append([str(label), f"{float(score) * 100:.1f}%"])

            prob_table = Table(prob_rows, colWidths=[3.2 * inch, 1.6 * inch])
            prob_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F6FDB")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ]
                )
            )
            story.append(Paragraph("Prediction Probabilities", self.styles["Heading2"]))
            story.append(prob_table)
            story.append(Spacer(1, 0.15 * inch))

        story.append(Paragraph("Patient Input Summary", self.styles["Heading2"]))
        if patient_summary:
            for key, value in patient_summary.items():
                story.append(Paragraph(f"<b>{key}</b>: {value}", self.styles["BodyHospital"]))
        else:
            story.append(Paragraph("No additional patient summary provided.", self.styles["BodyHospital"]))

        story.append(Spacer(1, 0.15 * inch))
        story.append(Paragraph("Explainability Summary", self.styles["Heading2"]))
        explainability = result.get("explainability", {}) or {}
        summary = explainability.get("summary") or result.get("explanation") or "No explainability summary available."
        story.append(Paragraph(summary, self.styles["BodyHospital"]))

        disease_explanation = explainability.get("detailed_summary") or result.get("explanation")
        if disease_explanation:
            story.append(Spacer(1, 0.08 * inch))
            story.append(Paragraph("Detailed Explainability Narrative", self.styles["Heading2"]))
            story.append(Paragraph(disease_explanation, self.styles["BodyHospital"]))

        precautions = explainability.get("precautions")
        if precautions:
            story.append(Spacer(1, 0.08 * inch))
            story.append(Paragraph("Clinical Precautions", self.styles["Heading2"]))
            story.append(Paragraph(str(precautions), self.styles["BodyHospital"]))

        explain_rec = explainability.get("clinical_recommendations")
        if explain_rec:
            story.append(Spacer(1, 0.08 * inch))
            story.append(Paragraph("Explainability-Linked Recommendation", self.styles["Heading2"]))
            story.append(Paragraph(str(explain_rec), self.styles["BodyHospital"]))

        notes = result.get("notes", []) or []
        if notes:
            story.append(Spacer(1, 0.08 * inch))
            story.append(Paragraph("Clinical Notes", self.styles["Heading2"]))
            for note in notes[:6]:
                story.append(Paragraph(f"• {note}", self.styles["BodyHospital"]))

        feature_rows = [["Feature", "Importance", "Percent"]]
        combined_features = []
        for key in ["clinical_feature_importance", "speech_feature_importance"]:
            combined_features.extend(explainability.get(key, []) or [])
        for feat in combined_features[:10]:
            if not isinstance(feat, dict):
                continue
            feature_rows.append(
                [
                    str(feat.get("name", "N/A")),
                    f"{float(feat.get('importance', 0.0)):.4f}",
                    f"{float(feat.get('percentage', 0.0)):.2f}%",
                ]
            )

        if len(feature_rows) > 1:
            feat_table = Table(feature_rows, colWidths=[2.5 * inch, 1.5 * inch, 1.3 * inch])
            feat_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F6FDB")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ]
                )
            )
            story.append(Spacer(1, 0.1 * inch))
            story.append(feat_table)

        modality_breakdown = result.get("modality_breakdown", {}) or {}
        if modality_breakdown:
            story.append(Spacer(1, 0.15 * inch))
            story.append(Paragraph("Modality Evidence", self.styles["Heading2"]))
            for name, payload in modality_breakdown.items():
                stage = payload.get("stage", "N/A") if isinstance(payload, dict) else "N/A"
                confidence = payload.get("confidence", 0.0) if isinstance(payload, dict) else 0.0
                story.append(
                    Paragraph(
                        f"<b>{name}</b>: stage {stage}, confidence {float(confidence) * 100:.1f}%",
                        self.styles["BodyHospital"],
                    )
                )

        panels = explainability.get("mri_panels") or {}
        panel_original = panels.get("original_mri")
        panel_heatmap = panels.get("heatmap")
        panel_overlay = panels.get("overlay")

        if panel_original and panel_heatmap and panel_overlay:
            try:
                story.append(Spacer(1, 0.15 * inch))
                story.append(Paragraph("MRI Visual Interpretation Panels", self.styles["Heading2"]))
                panel_rows = [
                    ["Original MRI", "Heatmap (JET)", "Overlay"],
                    [
                        RLImage(io.BytesIO(base64.b64decode(panel_original)), width=1.8 * inch, height=1.8 * inch),
                        RLImage(io.BytesIO(base64.b64decode(panel_heatmap)), width=1.8 * inch, height=1.8 * inch),
                        RLImage(io.BytesIO(base64.b64decode(panel_overlay)), width=1.8 * inch, height=1.8 * inch),
                    ],
                ]
                panel_table = Table(panel_rows, colWidths=[1.95 * inch, 1.95 * inch, 1.95 * inch])
                panel_table.setStyle(
                    TableStyle(
                        [
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                        ]
                    )
                )
                story.append(panel_table)
            except Exception:
                story.append(Paragraph("MRI panel images could not be rendered.", self.styles["BodyHospital"]))
        else:
            heatmap = explainability.get("mri_heatmap")
            if heatmap:
                try:
                    story.append(Spacer(1, 0.15 * inch))
                    story.append(Paragraph("MRI Grad-CAM Heatmap", self.styles["Heading2"]))
                    img = RLImage(io.BytesIO(base64.b64decode(heatmap)), width=4.5 * inch, height=4.5 * inch)
                    story.append(img)
                except Exception:
                    story.append(Paragraph("Heatmap image could not be rendered.", self.styles["BodyHospital"]))

        recommendation = result.get("recommendation", "Consult a qualified specialist for final diagnosis.")
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph("Clinical Recommendation", self.styles["Heading2"]))
        story.append(Paragraph(recommendation, self.styles["BodyHospital"]))

        story.append(Spacer(1, 0.2 * inch))
        medical_disclaimer = result.get(
            "medical_disclaimer",
            "This report assists clinicians and must not be used as a standalone diagnosis. Final decisions require full clinical context and physician judgment.",
        )
        story.append(
            Paragraph(
                medical_disclaimer,
                self.styles["BodyHospital"],
            )
        )

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def get_filename(disease: str) -> str:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe = str(disease).lower().replace(" ", "_")
        return f"NeuroAI_Report_{safe}_{stamp}.pdf"
