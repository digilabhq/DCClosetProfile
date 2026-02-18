// app.js
// v1.2 | last: desktop=download only, mobile=Web Share | next: —
(function () {
  const cfg = window.DCV_CONFIG;
  if (!cfg) throw new Error("Missing DCV_CONFIG");

  const root = document.getElementById("app");
  const flow = cfg.flow;

  const state = {
    q1: [],
    q2: 50,
    q3: [],
    q4: null,
    q5: { pulls_handles: null, hanging_rods: null },
    q6: "",
    q7: null,
    contact: { name: "", email: "", phone: "", address: "", method: (flow.find(x => x.id==="contact")?.defaultMethod || "Email") }
  };

  let index = 0;
  let showValidation = false;

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  }

  function setActive(i) {
    index = Math.max(0, Math.min(flow.length - 1, i));
    showValidation = false;
    render();
  }

  function next() {
    if (!canContinue(flow[index])) {
      showValidation = true;
      render();
      return;
    }
    setActive(index + 1);
  }

  function back() {
    setActive(index - 1);
  }

  function validationMessage(item) {
    if (!showValidation) return "";
    switch (item.id) {
      case "q1": return "Please select at least one priority to continue.";
      case "q4": return "Please select a material finish to continue.";
      case "q5": return "Please select both a pull/handle and hanging rod style to continue.";
      case "q7": return "Please select Yes or No to continue.";
      case "contact": return "Please fill in your name, email, and address to continue.";
      default: return "";
    }
  }

  function stepMeta(item) {
    const step = item.step;
    if (!step) return "";
    return `
      <div class="top-meta">
        <div class="top-left">
          <div class="top-k">${esc(item.section || "")}</div>
          <div class="top-rule"><div class="top-rule-fill" style="width:${(step / cfg.meta.stepsCount) * 100}%"></div></div>
        </div>
        <div class="top-right">${step} of ${cfg.meta.stepsCount}</div>
      </div>
    `;
  }

  function header() {
    return `
      <div class="q-header">
        <div class="q-brand"><img src="${cfg.meta.iconPath}" alt="DC icon" onerror="this.onerror=null;this.src='assets/images/icons/Icon.jpg';"></div>
        <div class="q-tagline">${esc(cfg.meta.tagline)}</div>
      </div>
    `;
  }

  function navButtons(item) {
    if (item.type === "welcome") return "";
    const isReview = item.type === "review";
    const nextLabel = isReview ? (item.cta || "Generate Summary") : "Continue";
    const msg = validationMessage(item);
    return `
      <div class="nav-wrap">
        ${msg ? `<div class="validation-msg">${esc(msg)}</div>` : ""}
        <div class="nav">
          <button class="btn-outline nav-back" type="button" data-action="back">Back</button>
          <button class="btn-outline nav-next" type="button" data-action="next">${esc(nextLabel)}</button>
        </div>
      </div>
    `;
  }

  function canContinue(item) {
    switch (item.id) {
      case "q1": return state.q1.length >= 1 && state.q1.length <= 3;
      case "q4": return !!state.q4;
      case "q5": return !!state.q5.pulls_handles && !!state.q5.hanging_rods;
      case "contact": return !!state.contact.name.trim() && !!state.contact.email.trim() && !!state.contact.address.trim() && !!state.contact.method;
      case "q7": return state.q7 === "Yes" || state.q7 === "No";
      default: return true;
    }
  }

  function renderWelcome(item) {
    const headline = `<span class="lower">${esc(cfg.welcome.headlineParts[0])}</span><span class="gold">${esc(cfg.welcome.headlineParts[1])}</span>`;
    const logo = `<div class="logo"><img src="${cfg.meta.logoPath}" alt="Desire Cabinets Logo" onerror="this.onerror=null;this.src='assets/images/icons/Logo.jpg';"></div>`;
    return `
      <section class="page active" id="page-welcome">
        <div class="welcome">
          <div class="accent accent-top"></div>
          ${logo}
          <div class="welcome-title">${headline}</div>
          <div class="welcome-desc">${esc(cfg.welcome.subtext)}</div>
          <button class="btn-outline cta" type="button" data-action="start">${esc(cfg.welcome.cta)}</button>
          <div class="accent accent-bottom"></div>
        </div>
      </section>
    `;
  }

  function renderThankYou(pdfBlob) {
    return `
      <section class="page active" id="page-thankyou">
        <div class="thankyou">
          <div class="accent accent-top"></div>
          <div class="ty-icon">
            <img src="${cfg.meta.iconPath}" alt="Desire Cabinets" onerror="this.onerror=null;this.src='assets/images/icons/Icon.jpg';">
          </div>
          <div class="ty-title">Thank you for sharing your vision.</div>
          <div class="ty-divider"></div>
          <div class="ty-body">A closet that is truly yours is on its way.<br>We'll be in touch soon.</div>
          <div class="ty-divider"></div>
          <div class="ty-actions">
            <button class="btn-outline" type="button" id="ty-share-btn">
              ${navigator.share ? "Share Summary" : "Download Summary"}
            </button>
          </div>
          <div class="ty-note">Please share this summary with Desire Cabinets.</div>
          <div class="accent accent-bottom"></div>
        </div>
      </section>
    `;
  }

  function wrapQuestion(item, innerHtml) {
    const meta = item.step ? stepMeta(item) : "";
    const msg = validationMessage(item);
    return `
      <section class="page active" id="page-${esc(item.id)}">
        <div class="q-wrap">
          ${header()}
          ${meta}
          <div class="q-body">
            <div class="q-head">
              <div class="q-title">${esc(item.title || "")}</div>
              <div class="q-subtitle">${esc(item.subtitle || "")}</div>
            </div>
            ${innerHtml}
          </div>
          ${navButtons(item)}
        </div>
      </section>
    `;
  }

  function renderQ1(item) {
    const slots = `
      <div class="tier-label">Your Top 3</div>
      <div class="tier-slots">
        <div class="tier-slot" data-slot="0">${state.q1[0] ? esc(state.q1[0]) : "1st"}</div>
        <div class="tier-slot" data-slot="1">${state.q1[1] ? esc(state.q1[1]) : "2nd"}</div>
        <div class="tier-slot" data-slot="2">${state.q1[2] ? esc(state.q1[2]) : "3rd"}</div>
      </div>
    `;
    const rows = item.options.map(opt => {
      const idx = state.q1.indexOf(opt);
      const selected = idx !== -1;
      const disabled = !selected && state.q1.length >= 3;
      const pill = selected ? `<div class="pill">${idx + 1}</div>` : `<div class="pill"></div>`;
      return `
        <div class="row rank ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" data-value="${esc(opt)}">
          <div class="row-name">${esc(opt)}</div>
          ${pill}
        </div>
      `;
    }).join("");
    return wrapQuestion(item, `${slots}<div class="list" id="q1-list">${rows}</div>`);
  }

  function renderQ2(item) {
    const presets = item.presets.map(p => {
      const label = esc(p.label).replace(/\n/g, "<br>");
      return `<button class="preset" type="button" data-shelving="${p.shelving}">${label}</button>`;
    }).join("");
    const readout = `${100 - state.q2}% Hanging · ${state.q2}% Shelving`;
    const inner = `
      <div class="ratio">
        <div class="ratio-head">
          <div class="ratio-end">MOSTLY HANGING</div>
          <div class="ratio-end right">MOSTLY SHELVING</div>
        </div>
        <div class="slider-wrap">
          <div class="slider-track" aria-hidden="true"></div>
          <div class="slider-fill" id="q2-fill" style="width:${state.q2}%" aria-hidden="true"></div>
          <input class="slider" id="q2-slider" type="range" min="0" max="100" value="${state.q2}" />
        </div>
        <div class="ratio-readout" id="q2-readout">${readout}</div>
        <div class="preset-row" id="q2-presets">${presets}</div>
      </div>
    `;
    return wrapQuestion(item, inner);
  }

  function renderQ3(item) {
    const rows = item.options.map(opt => {
      const selected = state.q3.includes(opt);
      return `
        <div class="row radio ${selected ? "selected" : ""}" data-value="${esc(opt)}">
          <div class="row-name">${esc(opt)}</div>
          <div class="radio-dot" aria-hidden="true"></div>
        </div>
      `;
    }).join("");
    return wrapQuestion(item, `<div class="list list-radio" id="q3-list">${rows}</div>`);
  }

  function renderQ4(item) {
    const cards = item.options.map(o => {
      const selected = state.q4 === o.name;
      return `
        <button class="card ${selected ? "selected" : ""}" type="button" data-value="${esc(o.name)}" aria-pressed="${selected ? "true" : "false"}">
          <div class="card-media"><img class="media-img" alt="" src="${esc(o.image)}"></div>
          <div class="card-label">${esc(o.name)}</div>
          <div class="card-check" aria-hidden="true"></div>
        </button>
      `;
    }).join("");
    return wrapQuestion(item, `<div class="grid" id="q4-grid">${cards}</div>`);
  }

  function renderQ5(item) {
    const blocks = item.categories.map(cat => {
      const cards = cat.options.map(o => {
        const selected = state.q5[cat.id] === o.label;
        return `
          <button class="hw-card ${selected ? "selected" : ""}" type="button"
            data-cat="${esc(cat.id)}" data-label="${esc(o.label)}"
            aria-pressed="${selected ? "true" : "false"}">
            <div class="hw-media"><img class="hw-img" alt="" src="${esc(o.image)}"></div>
            <div class="hw-label">${esc(o.label)}</div>
            <div class="hw-check" aria-hidden="true"></div>
          </button>
        `;
      }).join("");
      return `
        <div class="split">
          <div class="split-head">${esc(cat.heading)}</div>
          <div class="hw-grid" data-grid="${esc(cat.id)}">${cards}</div>
        </div>
      `;
    }).join("");
    return wrapQuestion(item, blocks);
  }

  function renderQ6(item) {
    const len = state.q6.length;
    const inner = `
      <div class="field">
        <textarea id="q6-text" class="textarea" maxlength="${item.max}" placeholder="${esc(item.placeholder)}">${esc(state.q6)}</textarea>
        <div class="counter"><span id="q6-count">${len}</span> / ${item.max}</div>
      </div>
    `;
    return wrapQuestion(item, inner);
  }

  function renderQ7(item) {
    const yesOn = state.q7 === "Yes";
    const noOn = state.q7 === "No";
    const promptHidden = !yesOn;
    const inner = `
      <div class="yn" id="q7-yn">
        <button class="yn-btn ${yesOn ? "active" : ""}" type="button" data-value="Yes">${esc(item.yes)}</button>
        <button class="yn-btn ${noOn ? "active" : ""}" type="button" data-value="No">${esc(item.no)}</button>
      </div>
      <div class="prompt" id="q7-prompt" ${promptHidden ? "hidden" : ""}>
        <div class="prompt-title gold-text">${esc(item.promptTitle)}</div>
        <div class="prompt-line"><span class="prompt-k">Email</span><a class="prompt-v" href="mailto:${esc(item.email)}">${esc(item.email)}</a></div>
        <div class="prompt-line"><span class="prompt-k">Phone</span><a class="prompt-v" href="tel:${esc(item.phone)}">${esc(item.phone)}</a></div>
      </div>
    `;
    return wrapQuestion(item, inner);
  }

  function renderContact(item) {
    const methods = item.methods.map(m => {
      const active = state.contact.method === m;
      return `<button class="toggle-btn ${active ? "active" : ""}" type="button" data-method="${esc(m)}">${esc(m)}</button>`;
    }).join("");
    const inner = `
      <div class="field">
        <label class="field-label" for="c-name">Name<span class="req">*</span></label>
        <input id="c-name" class="input" type="text" value="${esc(state.contact.name)}" placeholder="Full name" />
      </div>
      <div class="field">
        <label class="field-label" for="c-email">Email<span class="req">*</span></label>
        <input id="c-email" class="input" type="email" value="${esc(state.contact.email)}" placeholder="you@example.com" />
      </div>
      <div class="field">
        <label class="field-label" for="c-address">Address<span class="req">*</span></label>
        <input id="c-address" class="input" type="text" value="${esc(state.contact.address)}" placeholder="Street, City, State, ZIP" />
      </div>
      <div class="field">
        <label class="field-label" for="c-phone">Phone (optional)</label>
        <input id="c-phone" class="input" type="tel" value="${esc(state.contact.phone)}" placeholder="(000) 000-0000" />
      </div>
      <div class="field">
        <div class="field-label">Preferred Contact Method</div>
        <div class="toggle" id="c-method">${methods}</div>
      </div>
    `;
    return wrapQuestion(item, inner);
  }

  function renderReview(item) {
    const blocks = flow.filter(x => ["q1","q2","q3","q4","q5","q6","q7","contact"].includes(x.id)).map(x => {
      const val = reviewValue(x.id);
      return `
        <div class="review-card">
          <div class="review-top">
            <div class="review-k">${esc(x.section || x.id.toUpperCase())}</div>
            <button class="review-edit" type="button" data-edit="${esc(x.id)}">Edit</button>
          </div>
          <div class="review-v">${esc(val)}</div>
        </div>
      `;
    }).join("");
    return `
      <section class="page active" id="page-review">
        <div class="q-wrap">
          ${header()}
          <div class="q-body">
            <div class="q-head">
              <div class="q-title">${esc(item.title)}</div>
              <div class="q-subtitle">${esc(item.subtitle)}</div>
            </div>
            <div class="review-stack">${blocks}</div>
          </div>
          <div class="nav">
            <button class="btn-outline nav-back" type="button" data-action="back">Back</button>
            <button class="btn-outline nav-next" type="button" data-action="pdf">${esc(item.cta || "Generate Summary")}</button>
          </div>
        </div>
      </section>
    `;
  }

  function reviewValue(id) {
    switch (id) {
      case "q1": return state.q1.length ? state.q1.join(", ") : "—";
      case "q2": return `${100 - state.q2}% Hanging · ${state.q2}% Shelving`;
      case "q3": return state.q3.length ? state.q3.join(", ") : "—";
      case "q4": return state.q4 || "—";
      case "q5": return `Pulls/Handles: ${state.q5.pulls_handles || "—"} | Hanging Rods: ${state.q5.hanging_rods || "—"}`;
      case "q6": return state.q6 ? state.q6 : "—";
      case "q7": return state.q7 || "—";
      case "contact": return `${state.contact.name || "—"} · ${state.contact.email || "—"} · ${state.contact.address || "—"} · ${state.contact.method || "—"}`;
      default: return "—";
    }
  }

  function render() {
    const item = flow[index];
    let html = "";
    if (item.type === "welcome") html = renderWelcome(item);
    else if (item.type === "rank3") html = renderQ1(item);
    else if (item.type === "balance") html = renderQ2(item);
    else if (item.type === "multi_list") html = renderQ3(item);
    else if (item.type === "single_grid") html = renderQ4(item);
    else if (item.type === "hardware") html = renderQ5(item);
    else if (item.type === "textarea") html = renderQ6(item);
    else if (item.type === "yesno") html = renderQ7(item);
    else if (item.type === "contact") html = renderContact(item);
    else if (item.type === "review") html = renderReview(item);
    else html = "<div></div>";

    root.innerHTML = html;
    bindEvents(item);
  }

  function bindEvents(item) {
    root.querySelector('[data-action="start"]')?.addEventListener("click", () => setActive(1));
    root.querySelector('[data-action="back"]')?.addEventListener("click", back);
    root.querySelector('[data-action="next"]')?.addEventListener("click", next);

    // Review — Generate Summary → show thank you screen
    root.querySelector('[data-action="pdf"]')?.addEventListener("click", async () => {
      if (!canContinue(flow.find(x => x.id==="contact"))) {
        const ci = flow.findIndex(x => x.id==="contact");
        setActive(ci);
        return;
      }
      try {
        const pdfBlob = await window.DCV_PDF.generatePdf(state);
        // Show thank you screen
        root.innerHTML = renderThankYou(pdfBlob);
        bindThankYouEvents(pdfBlob, state);
      } catch(e) {
        console.error("PDF generation failed", e);
      }
    });

    // Q1
    if (item.id === "q1") {
      root.querySelector("#q1-list")?.addEventListener("click", (e) => {
        const row = e.target.closest(".row.rank");
        if (!row || row.classList.contains("disabled")) return;
        const val = row.getAttribute("data-value");
        const idx = state.q1.indexOf(val);
        if (idx !== -1) state.q1.splice(idx, 1);
        else if (state.q1.length < 3) state.q1.push(val);
        showValidation = false;
        render();
      });
    }

    // Q2
    if (item.id === "q2") {
      const slider = root.querySelector("#q2-slider");
      const fill = root.querySelector("#q2-fill");
      const ro = root.querySelector("#q2-readout");
      slider?.addEventListener("input", () => {
        state.q2 = Number(slider.value);
        if (fill) fill.style.width = `${state.q2}%`;
        if (ro) ro.textContent = `${100 - state.q2}% Hanging · ${state.q2}% Shelving`;
      });
      root.querySelector("#q2-presets")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".preset");
        if (!btn) return;
        state.q2 = Number(btn.getAttribute("data-shelving"));
        render();
      });
    }

    // Q3
    if (item.id === "q3") {
      root.querySelector("#q3-list")?.addEventListener("click", (e) => {
        const row = e.target.closest(".row.radio");
        if (!row) return;
        const val = row.getAttribute("data-value");
        const i = state.q3.indexOf(val);
        if (i !== -1) state.q3.splice(i, 1);
        else state.q3.push(val);
        render();
      });
    }

    // Q4
    if (item.id === "q4") {
      root.querySelector("#q4-grid")?.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        if (!card) return;
        state.q4 = card.getAttribute("data-value");
        showValidation = false;
        render();
      });
    }

    // Q5
    if (item.id === "q5") {
      root.querySelectorAll(".hw-grid").forEach(grid => {
        grid.addEventListener("click", (e) => {
          const card = e.target.closest(".hw-card");
          if (!card) return;
          const cat = card.getAttribute("data-cat");
          const label = card.getAttribute("data-label");
          state.q5[cat] = label;
          showValidation = false;
          render();
        });
      });
    }

    // Q6
    if (item.id === "q6") {
      const ta = root.querySelector("#q6-text");
      const count = root.querySelector("#q6-count");
      ta?.addEventListener("input", () => {
        state.q6 = ta.value || "";
        if (count) count.textContent = String(state.q6.length);
      });
    }

    // Q7
    if (item.id === "q7") {
      root.querySelector("#q7-yn")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".yn-btn");
        if (!btn) return;
        state.q7 = btn.getAttribute("data-value");
        showValidation = false;
        render();
      });
    }

    // Contact
    if (item.id === "contact") {
      root.querySelector("#c-name")?.addEventListener("input", (e) => state.contact.name = e.target.value);
      root.querySelector("#c-email")?.addEventListener("input", (e) => state.contact.email = e.target.value);
      root.querySelector("#c-phone")?.addEventListener("input", (e) => state.contact.phone = e.target.value);
      root.querySelector("#c-address")?.addEventListener("input", (e) => state.contact.address = e.target.value);
      root.querySelector("#c-method")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".toggle-btn");
        if (!btn) return;
        state.contact.method = btn.getAttribute("data-method");
        render();
      });
    }

    // Review edit
    if (item.id === "review") {
      root.querySelectorAll("[data-edit]")?.forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-edit");
          const i = flow.findIndex(x => x.id === id);
          if (i !== -1) setActive(i);
        });
      });
    }
  }

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function bindThankYouEvents(pdfBlob, state) {
    const btn = document.getElementById("ty-share-btn");
    if (!btn) return;

    const name = (state.contact?.name || "client").trim().replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ");
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${name} - ${stamp}.pdf`;

    btn.addEventListener("click", async () => {
      if (!pdfBlob) return;

      // Mobile: Web Share API
      if (isMobile() && navigator.share) {
        try {
          const file = new File([pdfBlob], filename, { type: "application/pdf" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Design Vision Summary" });
            return;
          }
        } catch (e) {
          console.warn("Share failed, falling back to download", e);
        }
      }

      // Desktop (or share fallback): straight download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  }

  render();
})();
