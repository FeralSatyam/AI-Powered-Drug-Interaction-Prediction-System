import { jsPDF } from "jspdf";

// A4 dimensions
const PW = 210, PH = 297, M = 18, CW = PW - M * 2;

// ── Palette ──────────────────────────────────────────────────────────────────
// Red is reserved for warning blocks only.
// Graph edges are the only other colored elements.
const BLACK  = [17,  24,  39];
const DARK   = [55,  65,  81];
const MID    = [107, 114, 128];
const LIGHT  = [156, 163, 175];
const BORDER = [209, 213, 219];
const FAINT  = [243, 244, 246];
const WHITE  = [255, 255, 255];
const RED    = [220, 38,  38];
const RED_BG = [254, 226, 226];

// Graph edge colors — the only color outside warning blocks
const E_HIGH = [220, 38,  38];  // red
const E_MOD  = [217, 119, 6];   // amber
const E_LOW  = [161, 161, 170]; // zinc-400

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const tc = (d, c) => d.setTextColor(c[0], c[1], c[2]);
const fc = (d, c) => d.setFillColor(c[0], c[1], c[2]);
const dc = (d, c) => d.setDrawColor(c[0], c[1], c[2]);

function graphEdgeColor(s) {
  if (s === "critical" || s === "high") return E_HIGH;
  if (s === "moderate")                 return E_MOD;
  return E_LOW;
}

// B&W severity display — badge fill shade + text label
function sevStyle(s) {
  if (s === "critical") return { shade: BLACK, text: "CRITICAL" };
  if (s === "high")     return { shade: DARK,  text: "HIGH RISK" };
  if (s === "moderate") return { shade: MID,   text: "MODERATE" };
  return                       { shade: LIGHT, text: "LOW RISK" };
}

// ── Page break guard ──────────────────────────────────────────────────────────
function checkPage(doc, y, needed) {
  if (y + needed > PH - M - 8) {
    doc.addPage();
    return M + 8;
  }
  return y;
}

// ── Wrapped-text block (returns new y) ───────────────────────────────────────
function wrappedBlock(doc, text, x, y, maxW, lineH) {
  if (!text) return y;
  const lines = doc.splitTextToSize(String(text), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

// ── Horizontal rule ───────────────────────────────────────────────────────────
function rule(doc, y, color = BORDER) {
  dc(doc, color);
  doc.setLineWidth(0.3);
  doc.line(M, y, M + CW, y);
}

// ── Section header: label between two hairlines ───────────────────────────────
function sectionHeader(doc, label, y) {
  rule(doc, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  tc(doc, MID);
  doc.text(label, M, y + 5.5);
  rule(doc, y + 7.5);
  return y + 13;
}

// ── Red warning block ─────────────────────────────────────────────────────────
function warningBlock(doc, y) {
  const h = 16;
  fc(doc, RED_BG);
  dc(doc, RED);
  doc.setLineWidth(0.5);
  doc.roundedRect(M - 2, y, CW + 4, h, 2, 2, "FD");
  // Red left accent
  fc(doc, RED);
  doc.roundedRect(M - 2, y, 5, h, 2, 2, "F");
  fc(doc, RED);
  doc.rect(M + 1, y, 2, h, "F"); // square off right side of accent
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  tc(doc, RED);
  doc.text(
    "DECISION SUPPORT ONLY  -  Not a substitute for clinical judgment. This report is for informational purposes.",
    M + 7, y + 10,
    { maxWidth: CW - 9 }
  );
  return y + h + 6;
}

// ── Interaction network graph ─────────────────────────────────────────────────
// Container: a fixed-height light-gray panel.
// Nodes: white circles with dark border, index number inside.
// Edges: colored by severity (the only non-B&W element outside warning blocks).
// Labels: placed outside each node using angle-based alignment so they never
//         overlap with each other or clip outside the container.
function drawGraph(doc, medications, interactions, y) {
  const n = medications.length;
  if (n < 2) return y;

  const GRAPH_H = 74;
  const gx = M;                  // container left
  const gw = CW;                 // container width
  const gt = y;                  // container top
  const gb = y + GRAPH_H;        // container bottom

  // ── Container background ──────────────────────────────────────────────────
  fc(doc, FAINT);
  dc(doc, BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(gx, gt, gw, GRAPH_H, 2, 2, "FD");

  // Graph center — pushed slightly toward the center of the available space
  const cx = gx + gw / 2;
  const gy = gt + GRAPH_H / 2 + (n === 2 ? 0 : 3); // N≥3: shift down a touch for top label clearance

  // ── Circle radius ─────────────────────────────────────────────────────────
  const r = n === 2 ? 27 : n === 3 ? 22 : n === 4 ? 24 : Math.min(28, 14 + n * 3);

  // ── Node angle helper ─────────────────────────────────────────────────────
  // N=2: horizontal (left / right) for a cleaner pair visualization
  const angle = (i) =>
    n === 2
      ? i * Math.PI           // 0° = right, 180° = left
      : (i / n) * Math.PI * 2 - Math.PI / 2; // start at top for N≥3

  // ── Edges ──────────────────────────────────────────────────────────────────
  for (const ix of interactions) {
    const ai = medications.indexOf(ix.medications[0]);
    const bi = medications.indexOf(ix.medications[1]);
    if (ai === -1 || bi === -1) continue;

    const aA = angle(ai), bA = angle(bi);
    dc(doc, graphEdgeColor(ix.severity));
    doc.setLineWidth(
      ix.severity === "critical" ? 1.5 :
      ix.severity === "high"     ? 1.2 :
      ix.severity === "moderate" ? 0.8 : 0.45
    );
    doc.line(
      cx + r * Math.cos(aA), gy + r * Math.sin(aA),
      cx + r * Math.cos(bA), gy + r * Math.sin(bA)
    );
  }

  // ── Nodes + labels ────────────────────────────────────────────────────────
  const nodeR  = 6;
  const labelR = r + nodeR + 7; // label center distance from graph center

  for (let i = 0; i < n; i++) {
    const a  = angle(i);
    const nx = cx + r * Math.cos(a);
    const ny = gy + r * Math.sin(a);

    // Node
    fc(doc, WHITE);
    dc(doc, DARK);
    doc.setLineWidth(0.7);
    doc.ellipse(nx, ny, nodeR, nodeR, "FD");

    // Index inside node
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    tc(doc, BLACK);
    doc.text(String(i + 1), nx, ny + 1.4, { align: "center" });

    // Label outside node
    const cosA  = Math.cos(a);
    const sinA  = Math.sin(a);
    const lx    = cx + labelR * cosA;
    const ly    = gy + labelR * sinA + 1.4; // +1.4 to center vertically on baseline

    const name  = medications[i];
    const label = name.length > 12 ? name.slice(0, 12) + "." : name;

    const align =
      cosA >  0.3 ? "left"   :
      cosA < -0.3 ? "right"  : "center";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    tc(doc, BLACK);
    doc.text(label, lx, ly, { align });
  }

  return gb + 5; // return y below container
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateMedicationReportPdf(data, chatHistory = []) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = M;

  // ── 1. Title ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  tc(doc, BLACK);
  doc.text("Medication Interaction Report", M, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  tc(doc, MID);
  doc.text(`Generated: ${new Date().toLocaleString()}`, M, y + 14);

  rule(doc, y + 18);
  y += 24;

  // ── 2. Medications analyzed ───────────────────────────────────────────────
  y = sectionHeader(doc, "MEDICATIONS ANALYZED", y);

  const cols   = Math.min(3, data.medications.length);
  const colW   = CW / cols;
  const medRows = Math.ceil(data.medications.length / cols);

  data.medications.forEach((med, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx  = M + col * colW;
    const by  = y + row * 9;
    fc(doc, WHITE);
    dc(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, colW - 3, 7.5, 1, 1, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    tc(doc, BLACK);
    doc.text(`${i + 1}.  ${med}`, bx + 3, by + 5);
  });
  y += medRows * 9 + 6;

  // ── 4. Overall risk assessment ────────────────────────────────────────────
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, "OVERALL RISK ASSESSMENT", y);

  const ovSev            = data.insight?.severity ?? "low";
  const { shade, text: ovLabel } = sevStyle(ovSev);

  fc(doc, WHITE);
  dc(doc, BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 18, 1, 1, "FD");

  fc(doc, shade);
  doc.roundedRect(M, y, 5, 18, 1, 1, "F");
  fc(doc, shade);
  doc.rect(M + 2, y, 3, 18, "F"); // square off right side of left bar

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  tc(doc, BLACK);
  doc.text(ovLabel, M + 9, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  tc(doc, DARK);
  doc.text(
    `${data.medicineA ?? "-"}  +  ${data.medicineB ?? "-"}   |   Confidence: ${data.preview?.confidence ?? 0}%   |   Likelihood: ${data.insight?.likelihood ?? 0}%`,
    M + 9, y + 14.5
  );
  y += 24;

  // ── 5. Drug interaction network ───────────────────────────────────────────
  y = checkPage(doc, y, 100);
  y = sectionHeader(doc, "DRUG INTERACTION NETWORK", y);

  // Legend: colored sample lines
  const legendItems = [
    ["High risk",     E_HIGH, 1.4],
    ["Moderate risk", E_MOD,  0.9],
    ["Low / None",    E_LOW,  0.5],
  ];
  legendItems.forEach(([lbl, color, lw], i) => {
    const lx = M + i * 58;
    dc(doc, color);
    doc.setLineWidth(lw);
    doc.line(lx, y + 3, lx + 14, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    tc(doc, MID);
    doc.text(lbl, lx + 17, y + 5);
  });
  y += 10;

  y = drawGraph(doc, data.medications, data.preview?.interactions ?? [], y);

  // ── 6. Pair-level interaction details ────────────────────────────────────
  y = checkPage(doc, y, 25);
  y = sectionHeader(doc, "PAIR-LEVEL INTERACTION DETAILS", y);

  for (const ix of (data.preview?.insights ?? [])) {
    y = checkPage(doc, y, 32);
    const { shade: bar, text: badge } = sevStyle(ix.severity);

    // Row background + left accent
    fc(doc, FAINT);
    dc(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 9, 1, 1, "FD");
    fc(doc, bar);
    doc.roundedRect(M, y, 5, 9, 1, 1, "F");
    fc(doc, bar);
    doc.rect(M + 2, y, 3, 9, "F");

    // Drug pair label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    tc(doc, BLACK);
    doc.text(ix.medications.join("  +  "), M + 8, y + 6);

    // Severity badge (B&W: filled with shade, white text)
    const bw = 26;
    const bx = M + CW - bw;
    fc(doc, bar);
    dc(doc, bar);
    doc.setLineWidth(0);
    doc.roundedRect(bx, y + 1.5, bw, 6, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    tc(doc, WHITE);
    doc.text(badge, bx + bw / 2, y + 5.8, { align: "center" });
    y += 16;

    // Explanation bullets
    if (ix.detailedExplanation) {
      const bullets = String(ix.detailedExplanation)
        .split("\n")
        .map(l => l.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      tc(doc, BLACK);
      for (const bullet of bullets) {
        y = checkPage(doc, y, 7);
        y = wrappedBlock(doc, `•  ${bullet}`, M + 4, y, CW - 4, 4.5);
        y += 0.5;
      }
    }

    // Thin separator between pairs
    y += 3;
    rule(doc, y, BORDER);
    y += 5;
  }

  // ── 7. AI consultation history ────────────────────────────────────────────
  if (chatHistory.length > 0) {
    y = checkPage(doc, y, 25);
    y = sectionHeader(doc, "AI CONSULTATION HISTORY", y);

    for (const msg of chatHistory) {
      const isUser    = msg.role === "user";
      const cleanText = String(msg.text).replace(/^[-*]\s*/gm, "•  ");
      const textLines = doc.splitTextToSize(cleanText, CW - 8);
      const bH        = textLines.length * 4.2 + 8;

      y = checkPage(doc, y, bH + 12);

      // Speaker label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      tc(doc, isUser ? BLACK : MID);
      doc.text(isUser ? "You" : "AI Assistant", M, y);
      y += 4.5;

      // Message box
      fc(doc, isUser ? WHITE : FAINT);
      dc(doc, BORDER);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, bH, 1.5, 1.5, "FD");

      if (isUser) {
        // Black left accent for user messages
        fc(doc, BLACK);
        doc.roundedRect(M, y, 4, bH, 1.5, 1.5, "F");
        fc(doc, BLACK);
        doc.rect(M + 1.5, y, 2.5, bH, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      tc(doc, BLACK);
      doc.text(textLines, M + (isUser ? 7 : 4), y + 5.5);
      y += bH + 6;
    }
    y += 3;
  }

  // ── 8. Footer warning ─────────────────────────────────────────────────────
  y = checkPage(doc, y, 28);
  warningBlock(doc, y);

  // ── 9. Page numbers ───────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    tc(doc, LIGHT);
    doc.text(`Page ${p} of ${pages}`, PW / 2, PH - 5, { align: "center" });
  }

  doc.save(`medication-report-${Date.now()}.pdf`);
}
