import { jsPDF } from "jspdf";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function severityLabel(severity) {
  if (severity === "high") return "High Risk";
  if (severity === "moderate") return "Moderate Risk";
  return "Low Risk";
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function generateMedicationReportPdf(data) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Medication Interaction Report", MARGIN, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, y);
  y += 12;

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Medications Analyzed", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  data.medications.forEach((med, i) => {
    doc.text(`${i + 1}. ${med}`, MARGIN, y);
    y += 6;
  });
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Most Likely Interaction", MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Medicine A: ${data.medicineA}`, MARGIN, y);
  y += 6;
  doc.text(`Medicine B: ${data.medicineB}`, MARGIN, y);
  y += 6;
  doc.text(`Risk Level: ${severityLabel(data.insight.severity)}`, MARGIN, y);
  y += 6;
  doc.text(`Likelihood: ${data.insight.likelihood}%`, MARGIN, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Associated Symptoms", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  data.insight.symptoms.forEach((symptom) => {
    doc.text(`• ${symptom}`, MARGIN, y);
    y += 6;
  });
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Clinical Explanation", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = addWrappedText(
    doc,
    data.insight.detailedExplanation,
    MARGIN,
    y,
    CONTENT_WIDTH,
    5
  );
  y += 8;

  if (data.preview.insights.length > 1) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Other Possible Combinations", MARGIN, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.preview.insights.slice(1, 4).forEach((item) => {
      y = addWrappedText(doc, `• ${item.headline}`, MARGIN, y, CONTENT_WIDTH, 5);
      y += 2;
    });
  }

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(120);
  y = addWrappedText(
    doc,
    "Decision support only. Not a substitute for clinical judgment. This report is for informational purposes.",
    MARGIN,
    y,
    CONTENT_WIDTH,
    4
  );

  doc.save(`medication-interaction-report-${Date.now()}.pdf`);
}
