// utils/pdf-generator.js
// v2.1 | last: full header rewrite, fixed logo/CLOSET PROFILE alignment, no gap | next: —
(function () {
  function dateDisplay() {
    const d = new Date();
    return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
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

    const doc  = new jsPDF(); // default: mm, A4 (210x297mm)
    const left = 15;
    const right = 195;

    // ── FIXED HEADER COORDINATES ─────────────────────────────
    // Everything in the header uses explicit mm values — no y accumulation
    const LOGO_TOP    = 10;  // logo starts 10mm from top
    const LOGO_H      = 25;  // logo height 25mm (~50pt equivalent, not too big)
    const RULE_Y      = LOGO_TOP + LOGO_H + 3; // gold rule sits 3mm below logo bottom
    const LABEL_Y     = RULE_Y + 6;  // CLIENT / DATE labels
    const NAME_Y      = LABEL_Y + 4; // client name / date value
    const SUBINFO_Y   = NAME_Y + 5;  // address/phone/email starts here

    // ── LOGO ─────────────────────────────────────────────────
    try {
      const logoImg = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = "assets/images/icons/Logo.png?" + Date.now();
      });
      const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
      const logoW = Math.min(LOGO_H * aspectRatio, 80);
      doc.addImage(logoImg, "PNG", left, LOGO_TOP, logoW, LOGO_H);
    } catch (e) {
      console.log("Logo not added to PDF");
    }

    // ── CLOSET PROFILE — top-right, aligned to logo top ──────
    doc.setFont(undefined, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text("CLOSET PROFILE", right, LOGO_TOP + 4, { align: "right" });

    // ── GOLD RULE ─────────────────────────────────────────────
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(left, RULE_Y, right, RULE_Y);

    // ── CLIENT / DATE LABELS ──────────────────────────────────
    doc.setFont(undefined, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text("CLIENT", left, LABEL_Y);
    doc.text("DATE", right, LABEL_Y, { align: "right" });

    // ── CLIENT NAME / DATE VALUE ──────────────────────────────
    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...black);
    doc.text(state.contact?.name || "—", left, NAME_Y);
    doc.text(dateDisplay(), right, NAME_Y, { align: "right" });

    // ── SUB INFO (address, phone, email) ─────────────────────
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    const contactLines = [
      state.contact?.address,
      state.contact?.phone,
      state.contact?.email
    ].filter(Boolean);
    contactLines.forEach((line, i) => {
      doc.text(line, left, SUBINFO_Y + (i * 4));
    });

    // ── CONTACT PREF — right, aligned to first sub info line ─
    doc.setFont(undefined, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text("CONTACT PREF", right, SUBINFO_Y, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(state.contact?.method || "—", right, SUBINFO_Y + 4, { align: "right" });

    // ── BORDER BOTTOM OF CLIENT BLOCK ────────────────────────
    const clientBlockBottom = SUBINFO_Y + (contactLines.length * 4) + 4;
    doc.setDrawColor(...lineclr);
    doc.setLineWidth(0.3);
    doc.line(left, clientBlockBottom, right, clientBlockBottom);

    // ── CONTENT STARTS HERE ───────────────────────────────────
    let y = clientBlockBottom + 8;

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
