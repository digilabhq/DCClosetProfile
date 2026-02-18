// utils/pdf-generator.js
// v1.9 | last: logo aligned to CLOSET PROFILE top, content pushed down to prevent overlap | next: —
(function () {
  function dateDisplay() {
    const d = new Date();
    return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
  }
  function sanitizeFilename(s) {
    return (s || "client").trim().replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ");
  }
  function dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function ensureJsPDF() {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function generatePdf(state) {
    await ensureJsPDF();
    const { jsPDF } = window.jspdf;

    const gold    = [171, 137, 0];
    const black   = [0, 0, 0];
    const muted   = [125, 117, 103];
    const faint   = [184, 173, 154];
    const lineclr = [230, 224, 212];
    const tintbg  = [250, 248, 243];

    const doc  = new jsPDF();
    const left = 15;
    const right= 195;
    let y      = 15;

    // ── LOGO — top aligned with CLOSET PROFILE text ──────────
    const logoY = y;
    try {
      const logoImg = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = "assets/images/icons/Logo.png?" + Date.now();
      });
      const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
      const logoH = 50;
      const logoW = Math.min(logoH * aspectRatio, 160);
      doc.addImage(logoImg, "PNG", left, logoY, logoW, logoH);
    } catch (e) {
      console.log("Logo not added to PDF");
    }

    // CLOSET PROFILE — top right, same Y as logo top
    doc.setFontSize(7);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...black);
    doc.text("CLOSET PROFILE", right, logoY + 5, { align: "right" });

    // Push y past the logo block before drawing rule
    y = logoY + 54;

    // ── GOLD RULE ────────────────────────────────────────────
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 8;

    // ── CLIENT BLOCK ─────────────────────────────────────────
    doc.setFontSize(7);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...black);
    doc.text("CLIENT", left, y);
    doc.text("DATE", right, y, { align: "right" });
    y += 4;

    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...black);
    doc.text(state.contact?.name || "—", left, y);
    doc.text(dateDisplay(), right, y, { align: "right" });
    y += 4;

    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    const contactLines = [state.contact?.address, state.contact?.phone, state.contact?.email].filter(Boolean);
    contactLines.forEach(line => { doc.text(line, left, y); y += 3.5; });

    // CONTACT PREF — right side aligned with first contact line
    const cpY = y - (3.5 * contactLines.length);
    doc.setFontSize(7);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...black);
    doc.text("CONTACT PREF", right, cpY, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(state.contact?.method || "—", right, cpY + 4, { align: "right" });

    y += 6;

    // Border bottom
    doc.setDrawColor(...lineclr);
    doc.setLineWidth(0.3);
    doc.line(left, y, right, y);
    y += 8;

    // ── SECTION HELPER ───────────────────────────────────────
    function section(title) {
      if (y > 265) { doc.addPage(); y = 15; }
      doc.setFontSize(6.5);
      doc.setFont(undefined, "bold");
      doc.setTextColor(...black);
      doc.text(title.toUpperCase(), left, y);
      y += 1.5;
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.line(left, y, right, y);
      y += 5;
      doc.setTextColor(...black);
    }

    // ── ROW HELPER ───────────────────────────────────────────
    function row(label, value) {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFont(undefined, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...black);
      doc.text(label, left, y);
      const wrapped = doc.splitTextToSize(String(value || "—"), 90);
      doc.setTextColor(...gold);
      doc.text(wrapped, right, y, { align: "right" });
      doc.setDrawColor(...lineclr);
      doc.setLineWidth(0.2);
      doc.line(left, y + 2, right, y + 2);
      y += Math.max(wrapped.length * 3.5, 3.5) + 3.5;
      doc.setTextColor(...black);
    }

    // ── STORAGE PRIORITIES ───────────────────────────────────
    section("Storage Priorities");
    row("1st Priority", state.q1?.[0] || "—");
    row("2nd Priority", state.q1?.[1] || "—");
    row("3rd Priority", state.q1?.[2] || "—");
    y += 3;

    // ── SPACE RATIO ──────────────────────────────────────────
    section("Space Ratio");
    const hangPct = 100 - (state.q2 ?? 50);
    const shelvPct = state.q2 ?? 50;
    row("Hanging", `${hangPct}%`);
    row("Shelving", `${shelvPct}%`);
    y += 3;

    // ── SPECIAL FEATURES ─────────────────────────────────────
    section("Special Features");
    row("Selected", state.q3?.length ? state.q3.join(", ") : "—");
    y += 3;

    // ── MATERIAL & HARDWARE ──────────────────────────────────
    section("Material & Hardware");
    row("Material Finish", state.q4 || "—");
    row("Pulls / Handles", state.q5?.pulls_handles || "—");
    row("Hanging Rods", state.q5?.hanging_rods || "—");
    y += 3;

    // ── ADDITIONAL NOTES ─────────────────────────────────────
    section("Additional Notes");
    const notes = state.q6 || "—";
    const notesWrapped = doc.splitTextToSize(notes, right - left - 6);
    const boxH = notesWrapped.length * 3.8 + 6;
    doc.setFillColor(...tintbg);
    doc.setDrawColor(...lineclr);
    doc.setLineWidth(0.3);
    doc.rect(left, y - 2, right - left, boxH, "FD");
    doc.setFont(undefined, "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(notesWrapped, left + 3, y + 3);
    y += boxH + 5;

    // ── INSPIRATION ──────────────────────────────────────────
    section("Inspiration");
    const inspoVal = state.q7 === "Yes" ? "Yes — will send separately" : (state.q7 || "—");
    row("Has Inspiration Photos", inspoVal);

    // ── FOOTER ───────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 14;

    doc.setDrawColor(...lineclr);
    doc.setLineWidth(0.3);
    doc.line(left, footerY - 6, right, footerY - 6);

    doc.setFont(undefined, "italic");
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("Thank you for sharing your vision!", (left + right) / 2, footerY - 1, { align: "center" });

    doc.setFont(undefined, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...faint);
    doc.text("Rangel Pineda  ·  678-709-3790  ·  rangelp@desirecabinets.com", (left + right) / 2, footerY + 4, { align: "center" });

    return doc.output("blob");
  }

  window.DCV_PDF = { generatePdf };
})();
