// Home Loan STP rule book — renderer, hash router and live calculators. Content lives in hl-data.js.
const $ = (s, el = document) => el.querySelector(s);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const lakh = (n) => "₹" + (n / 1e5).toFixed(n % 1e5 ? 1 : 0) + "L";
const emiPerLakh = (ratePct, months) => { const r = ratePct / 1200, f = Math.pow(1 + r, months); return 1e5 * r * f / (f - 1); };
const ltvCapPct = (value) => value <= 3e6 ? 90 : value <= 7.5e6 ? 80 : 75;
const foirCapPct = (income) => FOIR_GRID.find(([max]) => income <= max)[1];

const TONE = { PASS: "accent", SOFT: "warn", FLAG: "warn", REFER: "refer", DECLINE: "danger", NA: "muted" };
const pill = (text, tone = "accent") => tone === "muted"
  ? `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold surface-2 muted whitespace-nowrap">${text}</span>`
  : `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style="background:var(--${tone}-soft);color:var(--${tone})">${text}</span>`;
const cell = (c) => typeof c === "string" && c.startsWith("pill:") ? (([, t, tone]) => pill(t, tone))(c.split(":")) : c;
const card = (inner, cls = "") => `<div class="surface rounded-2xl p-5 md:p-6 ${cls}">${inner}</div>`;
const h3 = (t) => t ? `<h3 class="font-display font-semibold text-base mb-3">${t}</h3>` : "";
const tableWrap = (inner) => `<div class="surface rounded-2xl overflow-x-auto"><table class="tbl">${inner}</table></div>`;
const field = (label, input) => `<label class="flex flex-col gap-1 text-xs muted font-semibold">${label}${input}</label>`;
const num = (id, v, step = 1000) => `<input id="${id}" type="number" step="${step}" value="${v}" class="num text-sm text-[var(--text)]">`;
const kv = (k, v, strong) => `<div class="flex justify-between gap-4 py-2 border-b border-c last:border-0 text-sm"><span class="muted">${k}</span><span class="num text-right ${strong ? "font-semibold" : ""}">${v}</span></div>`;

/* ───────── Block renderers ───────── */
const R = {
  table: (b) => `${h3(b.title)}${tableWrap(`<thead><tr>${b.cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
    <tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i === 0 ? "font-semibold" : ""}">${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody>`)}`,

  list: (b) => card(`${h3(b.title)}<${b.ordered ? "ol" : "ul"} class="space-y-2 text-sm ${b.ordered ? "list-decimal" : "list-disc"} pl-5 marker:text-[var(--orange)]">${b.items.map((i) => `<li>${i}</li>`).join("")}</${b.ordered ? "ol" : "ul"}>`),

  checklist: (b) => card(`${h3(b.title)}<ul class="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">${b.items.map((i) => `<li class="flex gap-2"><span class="brand font-bold">✓</span><span>${i}</span></li>`).join("")}</ul>
    <p class="text-xs muted mt-4">Current reading of the rules — thresholds and any 2026 circulars to be confirmed with compliance before go-live.</p>`),

  callout: (b) => `<div class="rounded-2xl p-5 border-l-4" style="background:var(--${b.tone}-soft);border-color:var(--${b.tone === "brand" ? "brand" : b.tone})">
    <p class="font-display font-semibold text-sm mb-1" style="color:var(--${b.tone === "orange" ? "orange-ink" : b.tone})">${b.title}</p><p class="text-sm">${b.html}</p></div>`,

  steps: (b) => `${h3(b.title)}<ol class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${b.items.map(([t, d], i) => `
    <li class="surface rounded-xl p-4"><div class="flex items-center gap-2 mb-1.5"><span class="num w-6 h-6 rounded-full grid place-items-center text-xs font-bold text-white" style="background:var(--brand)">${i + 1}</span>
    <span class="font-semibold text-sm">${t}</span></div><p class="text-xs muted leading-relaxed">${d}</p></li>`).join("")}</ol>`,

  persona: () => card(`<div class="flex flex-col md:flex-row gap-6">
    <div class="md:w-64 shrink-0"><div class="w-14 h-14 rounded-2xl grid place-items-center text-white font-display font-bold text-xl mb-3" style="background:linear-gradient(135deg,var(--brand),var(--brand-deep))">AM</div>
      <p class="text-xs uppercase tracking-wider muted font-semibold">Build-case persona</p><h3 class="font-display font-semibold text-lg">${PERSONA.name}</h3>
      <p class="text-sm muted">32 · salaried · ${PERSONA.app}</p>
      <div class="flex flex-wrap gap-1.5 mt-3">${PERSONA.flags.map((f) => `<code class="text-[11px] px-2 py-0.5 rounded-md" style="background:var(--orange-soft);color:var(--orange-ink)">${f}</code>`).join("")}</div></div>
    <div class="flex-1 grid sm:grid-cols-2 gap-x-6">
      ${kv("Employer", "Pvt Ltd IT services · 4 yrs 2 m")}${kv("Net / gross salary", "₹65,000 / ₹82,000")}
      ${kv("Existing obligations", "PL EMI ₹6,500 (14 left) · card 18%")}${kv("Purpose", "Resale house of neighbour, ~60 m")}
      ${kv("Agreement value", "₹25,00,000 (token ₹1L paid)")}${kv("Loan ask", "₹20,00,000 · 20 yrs", true)}
      ${kv("Own contribution", "₹5,00,000")}${kv("Co-applicant", "Optional: spouse (stamp-duty concession)")}</div></div>`),

  flow: () => `${h3("End-to-end journey · BRE gate at each stage")}
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">${STAGES.map((s) => `
      <a href="#${s.id}" class="surface rounded-xl p-3 hover:border-[var(--orange)] transition flex flex-col">
        <span class="num text-xs font-bold" style="color:var(--orange)">0${s.n}</span>
        <span class="font-semibold text-sm leading-tight mt-0.5">${s.name}</span>
        <span class="num text-lg font-semibold brand mt-2">${s.stp}</span><span class="text-[11px] muted">target STP</span>
        <span class="text-[11px] mt-2 pt-2 border-t border-c ${s.human === "None" ? "muted" : "font-semibold"}" ${s.human === "None" ? "" : 'style="color:var(--orange-ink)"'}>${s.human === "None" ? "No planned touch" : "👤 " + s.human}</span></a>`).join("")}</div>
    <p class="text-xs muted mt-2">Only two planned human steps on the green path. Every other human action starts from a BRE REFER with a reason code.</p>`,

  rules: (b, k) => `<div data-rules="${k}">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">${h3(b.title).replace("mb-3", "")}
      <div class="flex flex-wrap gap-1.5 text-xs">${["All", ...new Set(b.rows.map((r) => r[4]))].map((f, i) => `<button data-f="${f}" class="px-2.5 py-1 rounded-full border border-c ${i ? "" : "surface-2 font-semibold"}">${f === "All" ? `All ${b.rows.length}` : f}</button>`).join("")}</div></div>
    ${tableWrap(`<thead><tr><th>ID</th><th>Rule</th><th>Logic</th><th>Outcome on fail</th><th>Arjun</th></tr></thead><tbody>${b.rows.map(([id, rule, logic, out, res, note]) => `
      <tr data-r="${res}"><td class="num font-semibold whitespace-nowrap brand">${id}</td><td class="font-semibold">${rule}</td><td>${logic}</td><td class="muted">${out}</td>
      <td>${pill(res === "NA" ? "N/A" : res, TONE[res])}<div class="text-xs muted mt-1">${note}</div></td></tr>`).join("")}</tbody>`)}</div>`,

  lanes: () => `${h3("Stage 2 parallel orchestration · 4 lanes, 1 gate")}
    <div class="surface rounded-2xl p-5">
      <div class="flex items-center gap-2 text-sm mb-4"><span class="px-3 py-1.5 rounded-lg text-white font-semibold" style="background:var(--brand)">PAN verify → anchor</span><span class="muted">all four lanes start on response</span></div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${[
        ["Identity", "CKYC → OKYC (DigiLocker) → selfie liveness + face match", "Aadhaar OTP"],
        ["Bureau", "CIBIL → Experian → CRIF fallback", ""],
        ["Banking (AA)", "AA consent → fetch → statement analyser", "AA approval · slowest, 60–90 s"],
        ["Employment & checks", "EPFO UAN · penny drop · screening (sanctions, PEP, wilful defaulter, CERSAI)", ""],
      ].map(([t, d, p]) => `<div class="rounded-xl p-3 surface-2"><p class="font-semibold text-sm">${t}</p><p class="text-xs muted mt-1">${d}</p>${p ? `<p class="text-[11px] mt-2 font-semibold" style="color:var(--orange-ink)">Customer prompt: ${p}</p>` : ""}</div>`).join("")}</div>
      <div class="mt-4 text-sm flex items-center gap-2"><span class="px-3 py-1.5 rounded-lg font-semibold" style="background:var(--orange-soft);color:var(--orange-ink)">Gate</span><span class="muted">fires once all lanes report or time out → K, B, F, E-rules</span></div></div>`,

  layers: () => `${h3("Four layers, three exits")}<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${[
    ["1", "Knock-outs", "Any hit = decline", "danger"], ["2", "Scorecard", "1,000 points → grade A–E", "brand"],
    ["3", "Eligibility", "min(FOIR loan, LTV loan, ask, cap)", "brand"], ["4", "Deviations", "REFER with authority matrix", "refer"],
  ].map(([n, t, d, tone]) => `<div class="surface rounded-xl p-4 border-t-4" style="border-top-color:var(--${tone})"><p class="num text-xs muted">Layer ${n}</p><p class="font-semibold">${t}</p><p class="text-xs muted mt-1">${d}</p></div>`).join("")}</div>
    <div class="flex flex-wrap gap-2 mt-3 text-xs">${pill("Exit · APPROVE_STP", "accent")}${pill("Exit · REFER (reason code)", "refer")}${pill("Exit · DECLINE (written reason)", "danger")}</div>`,

  kfs: () => card(`<div class="flex flex-wrap justify-between gap-3 mb-4"><div><p class="text-xs uppercase tracking-wider muted font-semibold">Key Facts Statement</p>
      <h3 class="font-display font-semibold text-lg">Binding sanction · ${PERSONA.name}</h3></div><code class="num text-xs self-start px-2 py-1 rounded-md surface-2">HL-2026-10-000482-K1</code></div>
    <div class="grid sm:grid-cols-3 gap-3 mb-4">${[["Sanctioned", "₹20,00,000"], ["EMI", "₹17,674"], ["Rate", "8.75% floating"]].map(([l, v]) => `<div class="rounded-xl p-3" style="background:var(--brand-soft)"><p class="text-xs muted">${l}</p><p class="num text-xl font-semibold brand">${v}</p></div>`).join("")}</div>
    <div class="grid md:grid-cols-2 gap-x-6">${kv("Tenure", "240 months")}${kv("Benchmark reset", "Quarterly")}${kv("Processing fee", "₹7,000 + GST (0.35%)")}
      ${kv("Legal & technical", "₹0 (absorbed)")}${kv("Stamp duty / CERSAI", "Per state / actuals")}${kv("Prepayment / foreclosure", "Nil (floating, individual)")}
      ${kv("APR (all-in)", "Disclosed with all charges")}${kv("Insurance", "Optional, unbundled")}${kv("Offer validity", "45 days · KFS held ≥ 3 working days")}${kv("Payee", "Suresh Kumar Jain · SBIN …9032")}</div>
    <div class="flex flex-wrap items-center gap-3 mt-5"><button class="btn" data-kfs>Accept with OTP</button><span class="text-xs muted" data-kfs-msg>Customer scrolls to the end and ticks the acknowledgement first.</span></div>`),

  moneyflow: () => `${h3("Money flow · disbursement, own contribution, repayment")}
    <div class="surface rounded-2xl p-5 grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center text-sm">
      <div class="space-y-3">${[["Ujjivan SFB · disbursement a/c", "brand"], ["Arjun · HDFC …4417", "orange"]].map(([t, c]) => `<div class="rounded-xl p-3 font-semibold text-center" style="background:var(--${c}-soft);color:var(--${c === "orange" ? "orange-ink" : c})">${t}</div>`).join("")}</div>
      <div class="space-y-3 text-xs text-center">
        <div><span class="num font-semibold">₹20,00,000 RTGS</span><div class="muted">at registration, D-09 verified →</div></div>
        <div><span class="num font-semibold">₹1L token + ₹4L</span><div class="muted">own contribution →</div></div>
        <div><span class="num font-semibold">← ₹17,674 / month</span><div class="muted">e-NACH to lender collection a/c</div></div></div>
      <div class="rounded-xl p-3 font-semibold text-center surface-2">Seller · Suresh Kumar Jain<div class="text-xs muted font-normal">SBIN …9032 · penny-drop 100</div></div></div>
    <p class="text-xs muted mt-2">No pass-through to the borrower, an LSP or any third party. If the property is mortgaged, the seller's lender is paid first (D-10).</p>`,

  kpis: () => `${h3("KPIs")}<div class="grid grid-cols-2 md:grid-cols-3 gap-3">${KPIS.map(([l, v, s]) => `<div class="surface rounded-xl p-4"><p class="text-xs muted">${l}</p><p class="num text-2xl font-semibold brand">${v}</p><p class="text-[11px] muted">${s}</p></div>`).join("")}</div>`,

  json: () => `<div class="grid gap-3">${API_SAMPLES.map(([t, o], i) => `<details class="surface rounded-2xl overflow-hidden" ${i === API_SAMPLES.length - 1 ? "open" : ""}>
    <summary class="cursor-pointer px-5 py-3 font-semibold text-sm flex justify-between"><span>${t}</span><span class="muted text-xs">JSON</span></summary>
    <pre class="json m-3 mt-0">${JSON.stringify(o, null, 2).replace(/</g, "&lt;")}</pre></details>`).join("")}</div>`,

  matcher: () => card(`${h3("Try the name matcher")}
    <p class="text-xs muted mb-3">Strips titles, lowercases, removes punctuation, sorts tokens, expands initials, then scores with Jaro-Winkler. (Production adds an Indian phonetic key.)</p>
    <div class="grid sm:grid-cols-2 gap-3">${field("Golden record (PAN)", `<input id="mA" value="ARJUN RAMESH MEHTA">`)}${field("Incoming document", `<input id="mB" value="Mr. A R Mehtaa">`)}</div>
    <div id="mOut" class="mt-4"></div>`),

  calc: (b) => ({ indicative: calcIndicativeHTML, eligibility: calcEligibilityHTML, scorecard: calcScorecardHTML, dcheck: calcDcheckHTML })[b.name](),
};

/* ───────── Calculators ───────── */
function calcIndicativeHTML() {
  return card(`<div class="flex flex-wrap justify-between gap-2 mb-4"><div><p class="text-xs uppercase tracking-wider font-semibold" style="color:var(--orange-ink)">Live · customer screen</p>
    <h3 class="font-display font-semibold text-base">Indicative eligibility at lead capture</h3></div><button class="text-xs muted underline" data-reset="ind">Reset to Arjun</button></div>
    <div class="grid sm:grid-cols-3 gap-3 mb-5">
      ${field("Take-home salary / month", num("iInc", 65000))}${field("Existing EMIs / month", num("iEmi", 6500, 500))}
      ${field("Employment", `<select id="iType" class="text-sm"><option value="0.10">Salaried (−10%)</option><option value="0.25">Self-employed (−25%)</option></select>`)}
      ${field("Property price", num("iPrice", 2500000, 50000))}${field("Loan amount needed", num("iAsk", 2000000, 50000))}${field("Tenure (years)", num("iTen", 20, 1))}</div>
    <div id="iOut"></div>`);
}
function runIndicative() {
  const v = (id) => +$("#" + id).value || 0;
  const inc = v("iInc"), emi = v("iEmi"), hc = +$("#iType").value, price = v("iPrice"), ask = v("iAsk"), m = v("iTen") * 12;
  if (!inc || !price || !m) return;
  const incH = inc * (1 - hc), cap = foirCapPct(incH) - 5, capacity = Math.max(0, incH * cap / 100 - emi);
  const pl = emiPerLakh(9.25, m), foirLoan = capacity / pl * 1e5;
  const ltvP = ltvCapPct(price), ltvLoan = price * ltvP / 100, elig = Math.min(foirLoan, ltvLoan);
  const askEmi = ask / 1e5 * emiPerLakh(8.75, m), foirShown = (askEmi + emi) / inc * 100, ltvShown = ask / price * 100;
  const fits = ask <= elig;
  $("#iOut").innerHTML = `<div class="grid md:grid-cols-[1fr_1.2fr] gap-5">
    <div class="rounded-xl p-5 text-white" style="background:linear-gradient(135deg,var(--brand),var(--brand-deep))">
      <p class="text-xs opacity-80">Estimated eligibility up to</p><p class="num text-3xl font-semibold">${lakh(Math.floor(elig / 1e4) * 1e4)}</p>
      <p class="text-sm mt-2 font-semibold" style="color:${fits ? "#BFF0DA" : "#FFD3A8"}">${fits ? `Your ${lakh(ask)} request fits.` : `Your ${lakh(ask)} request is above the estimate.`}</p>
      <p class="text-xs opacity-80 mt-3">Your down payment: ${inr(price - ask)} (${(100 - ltvShown).toFixed(0)}%)<br>EMIs would take ${foirShown.toFixed(0)}% of your salary</p>
      <p class="text-[10px] opacity-70 mt-3">Estimate, subject to verification — not a sanction or offer.</p></div>
    <div>${kv("Income after haircut", `${inr(inc)} × ${100 - hc * 100}% = ${inr(incH)}`)}${kv("FOIR cap (grid − 5%)", cap + "%")}
      ${kv("EMI capacity", `${inr(incH * cap / 100)} − ${inr(emi)} = ${inr(capacity)}`)}${kv("EMI per lakh @ 9.25%", inr(pl))}
      ${kv("FOIR-based loan", lakh(foirLoan))}${kv(`LTV cap (${ltvP}% slab)`, lakh(ltvLoan))}
      ${kv("Indicative LTV / FOIR", `${ltvShown.toFixed(0)}% ${pill(ltvShown <= ltvP ? "L-05 PASS" : "L-05 auto-cap", ltvShown <= ltvP ? "accent" : "warn")} · ${foirShown.toFixed(1)}% ${pill(foirShown <= cap + 5 ? "L-06 PASS" : "L-06 show max", foirShown <= cap + 5 ? "accent" : "warn")}`, true)}</div></div>`;
}

function calcEligibilityHTML() {
  return card(`<div class="flex flex-wrap justify-between gap-2 mb-4"><div><p class="text-xs uppercase tracking-wider font-semibold" style="color:var(--orange-ink)">Live · Layer 3</p>
    <h3 class="font-display font-semibold text-base">Eligibility engine on verified data</h3></div><button class="text-xs muted underline" data-reset="elig">Reset to Arjun</button></div>
    <div class="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      ${field("Verified take-home", num("eInc", 65000))}${field("Max obligations", num("eEmi", 6500, 500))}
      ${field("Grade", `<select id="eGrade" class="text-sm"><option>A</option><option selected>B</option><option>C</option></select>`)}
      ${field("Agreement value", num("eAgr", 2500000, 50000))}${field("Valuation", num("eVal", 2580000, 50000))}${field("Loan ask", num("eAsk", 2000000, 50000))}</div>
    <div id="eOut"></div>`);
}
function runEligibility() {
  const v = (id) => +$("#" + id).value || 0;
  const inc = v("eInc"), emi = v("eEmi"), g = $("#eGrade").value, agr = v("eAgr"), val = v("eVal") || agr, ask = v("eAsk"), m = 240;
  if (!inc || !agr) return;
  const [rate, fee] = PRICING[g], cap = foirCapPct(inc) - (g === "C" ? 5 : 0), all = inc * cap / 100, avail = Math.max(0, all - emi);
  const pl = emiPerLakh(rate, m), foirLoan = avail / pl * 1e5, value = Math.min(agr, val), ltvP = ltvCapPct(value), ltvLoan = value * ltvP / 100;
  const cands = [["FOIR loan", foirLoan], ["LTV loan", ltvLoan], ["Loan ask", ask], ["Product cap", 5e7]];
  const [binding, elig] = cands.reduce((a, b) => (b[1] < a[1] ? b : a));
  const newEmi = elig / 1e5 * pl, foirAfter = (newEmi + emi) / inc * 100;
  const step = (n, t, rows) => `<div class="rounded-xl p-4 surface-2"><p class="text-xs font-bold mb-2" style="color:var(--orange-ink)">${n} · ${t}</p>${rows}</div>`;
  $("#eOut").innerHTML = `<div class="grid md:grid-cols-3 gap-3">
    ${step("A", "How much his salary can repay", kv("FOIR ceiling", `${cap}% × ${inr(inc)} = ${inr(all)}`) + kv("Minus existing EMI", inr(avail)) + kv(`EMI per lakh @ ${rate}%`, inr(pl)) + kv("FOIR loan", lakh(foirLoan), true))}
    ${step("B", "How much the house allows", kv("Value = min(agreement, valuation)", lakh(value)) + kv("RBI cap", ltvP + "%") + kv("LTV loan", lakh(ltvLoan), true))}
    ${step("C", "Smallest wins", cands.map(([l, a]) => kv(l === binding ? `<b style="color:var(--orange-ink)">${l} ← binding</b>` : l, a >= 5e7 ? "—" : lakh(a))).join(""))}</div>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">${[["Eligible", lakh(elig)], ["Rate", rate + "%"], ["EMI", inr(newEmi)], ["FOIR after", foirAfter.toFixed(1) + "%"], ["Fee", fee]].map(([l, x], i) => `
      <div class="rounded-xl p-3 ${i ? "surface" : ""}" ${i ? "" : 'style="background:var(--brand);color:#fff"'}><p class="text-xs ${i ? "muted" : "opacity-80"}">${l}</p><p class="num text-lg font-semibold">${x}</p></div>`).join("")}</div>
    ${val < agr * 0.9 ? `<p class="text-xs mt-3" style="color:var(--warn)">P-01: valuation below 90% of agreement — ${val < agr * 0.8 ? "REFER (inflated price risk)" : "LTV on valuation, auto counter-offer"}.</p>` : ""}`;
}

function calcScorecardHTML() {
  return card(`<div class="flex flex-wrap justify-between gap-2 mb-4"><div><p class="text-xs uppercase tracking-wider font-semibold" style="color:var(--orange-ink)">Live · Layer 2</p>
    <h3 class="font-display font-semibold text-base">Risk scorecard (1,000 points)</h3><p class="text-xs muted">Change any band to see the grade and price move.</p></div><button class="text-xs muted underline" data-reset="sc">Reset to Arjun</button></div>
    <div class="overflow-x-auto -mx-1"><table class="tbl"><thead><tr><th>Factor</th><th>Arjun's verified input</th><th>Band</th><th class="text-right">Points</th></tr></thead><tbody>
    ${SCORECARD.map(([f, max, bands, idx, input, src], i) => `<tr><td class="font-semibold">${f}<div class="text-xs muted font-normal">max ${max} · ${src}</div></td><td class="text-xs">${input}</td>
      <td><select data-sc="${i}" class="text-xs max-w-[220px]">${bands.map(([l, p], j) => `<option value="${p}" ${j === idx ? "selected" : ""}>${l} · ${p}</option>`).join("")}</select></td>
      <td class="num text-right font-semibold" data-pts="${i}"></td></tr>`).join("")}</tbody></table></div>
    <div id="scOut" class="mt-4"></div>`);
}
function runScorecard() {
  let total = 0;
  document.querySelectorAll("[data-sc]").forEach((s) => { total += +s.value; $(`[data-pts="${s.dataset.sc}"]`).textContent = s.value; });
  const [g, , tone, action] = GRADES.find(([, min]) => total >= min);
  const price = PRICING[g];
  $("#scOut").innerHTML = `<div class="flex flex-wrap items-center gap-4 rounded-xl p-4 surface-2">
    <div><p class="text-xs muted">Total</p><p class="num text-3xl font-semibold">${total}<span class="text-base muted"> / 1,000</span></p></div>
    <div class="w-16 h-16 rounded-2xl grid place-items-center font-display text-3xl font-bold" style="background:var(--${tone}-soft);color:var(--${tone})">${g}</div>
    <div class="text-sm"><p class="font-semibold">${action}</p><p class="muted text-xs">${price ? `Rate ${price[0]}% · fee ${price[1]}` : "No STP price"}${g === "B" && total >= 740 && total < 750 ? ` · ${750 - total} points short of Grade A` : ""}</p></div>
    <div class="flex gap-1 ml-auto text-[11px]">${GRADES.map(([x, min]) => `<span class="px-2 py-1 rounded-md ${x === g ? "font-bold" : "muted"}" style="${x === g ? `background:var(--${tone}-soft);color:var(--${tone})` : ""}">${x} ${min ? "≥ " + min : "< 450"}</span>`).join("")}</div></div>`;
}

function calcDcheckHTML() {
  return card(`<div class="flex flex-wrap justify-between items-end gap-3 mb-4"><div><p class="text-xs uppercase tracking-wider font-semibold" style="color:var(--orange-ink)">Maker = system · checker = BRE</p>
    <h3 class="font-display font-semibold text-base">18-point pre-disbursement checklist</h3></div>
    <div class="flex flex-wrap gap-2 items-center">${field("Simulate", `<select id="dSim" class="text-xs"><option value="">Green path</option><option value="D-09">Payee change after lock</option><option value="D-11">Registration postponed</option><option value="D-02">New loan in bureau refresh</option></select>`)}
    <button class="btn self-end text-sm" id="dRun">Run checks</button></div></div>
    <div class="grid sm:grid-cols-2 gap-2" id="dList">${DCHECKS.map(([id, c, logic, fail, ev]) => `<div class="rounded-xl p-3 surface-2 flex gap-3 items-start" data-d="${id}">
      <span class="num text-xs font-bold brand w-10 shrink-0 pt-0.5">${id}</span><div class="flex-1 min-w-0"><p class="text-sm font-semibold">${c}</p><p class="text-xs muted">${logic}</p><p class="text-xs mt-1" data-ev></p></div><span data-st>${pill("Queued", "muted")}</span></div>`).join("")}</div>
    <div id="dOut" class="mt-4"></div>`);
}
let dTimer;
function runDcheck() {
  clearInterval(dTimer);
  const sim = $("#dSim").value, simMsg = { "D-09": ["BLOCK", "danger", "Payee change request → release blocked, RCU callback on registered mobile"], "D-11": ["HOLD", "warn", "Registration postponed → funds held; D-01, D-02 re-checked on new date"], "D-02": ["HOLD", "warn", "New obligation in bureau → FOIR re-run before release"] };
  document.querySelectorAll("[data-d]").forEach((el) => { $("[data-st]", el).innerHTML = pill("Queued", "muted"); $("[data-ev]", el).textContent = ""; });
  $("#dOut").innerHTML = "";
  let i = 0;
  dTimer = setInterval(() => {
    const [id, , , fail, ev] = DCHECKS[i], el = $(`[data-d="${id}"]`), hit = id === sim;
    $("[data-st]", el).innerHTML = hit ? pill(simMsg[sim][0], simMsg[sim][1]) : pill("PASS", "accent");
    $("[data-ev]", el).innerHTML = hit ? `<span style="color:var(--${simMsg[sim][1]})">${fail}</span>` : ev;
    if (++i === DCHECKS.length) {
      clearInterval(dTimer);
      $("#dOut").innerHTML = sim
        ? R.callout({ tone: simMsg[sim][1], title: `Not disbursement-ready · ${sim}`, html: simMsg[sim][2] + "." })
        : R.callout({ tone: "brand", title: "DISBURSEMENT_READY", html: "All 18 checks passed. RTGS of ₹20,00,000 to Suresh Kumar Jain (SBIN …9032) sits in the pre-approved queue — released within 15 minutes of the registered-deed OCR match ≥ 95." });
    }
  }, 110);
}

/* Name matcher: normalise → expand initials → Jaro-Winkler on sorted tokens */
function jaro(a, b) {
  if (a === b) return 1;
  const md = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1), am = [], bm = [];
  let m = 0, t = 0;
  for (let i = 0; i < a.length; i++) for (let j = Math.max(0, i - md); j < Math.min(b.length, i + md + 1); j++) if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break; }
  if (!m) return 0;
  for (let i = 0, k = 0; i < a.length; i++) if (am[i]) { while (!bm[k]) k++; if (a[i] !== b[k++]) t++; }
  const j = (m / a.length + m / b.length + (m - t / 2) / m) / 3;
  let p = 0; while (p < 4 && a[p] && a[p] === b[p]) p++;
  return j + p * 0.1 * (1 - j);
}
const TITLES = /\b(mr|mrs|ms|shri|smt|dr|kumari)\b\.?/g;
const norm = (s) => s.toLowerCase().replace(TITLES, " ").replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean);
function nameScore(a, b) {
  const A = norm(a), B = norm(b);
  const expand = (src, ref) => src.map((t) => t.length === 1 ? ref.find((r) => r[0] === t) || t : t);
  const A2 = expand(A, B), B2 = expand(B, A);
  const [s, l] = A2.length <= B2.length ? [A2, B2] : [B2, A2];
  const tok = s.map((t) => Math.max(...l.map((x) => jaro(t, x))));
  let score = tok.reduce((x, y) => x + y, 0) / (s.length || 1) * 100;
  if (l.length > s.length) score -= 3 * (l.length - s.length); // missing middle name — light penalty
  return { score: Math.max(0, Math.round(score)), A: A2, B: B2, initials: A.some((t) => t.length === 1) || B.some((t) => t.length === 1) };
}
function runMatcher() {
  const r = nameScore($("#mA").value, $("#mB").value);
  const [o, tone] = r.score >= 85 ? ["PASS", "accent"] : r.score >= 70 ? ["SOFT-FAIL → rule resolution", "warn"] : r.score >= 50 ? ["REFER (RCU)", "refer"] : ["DECLINE / re-KYC", "danger"];
  $("#mOut").innerHTML = `<div class="flex flex-wrap items-center gap-4"><span class="num text-3xl font-semibold" style="color:var(--${tone})">${r.score}</span>${pill(o, tone)}
    <span class="text-xs muted">Normalised: <code>${r.A.slice().sort().join(" ")}</code> vs <code>${r.B.slice().sort().join(" ")}</code>${r.initials ? " · initials expanded" : ""}</span></div>`;
}

/* ───────── Router ───────── */
function renderNav(active) {
  const groups = [...new Set(SECTIONS.map((s) => s.group))];
  $("#nav").innerHTML = groups.map((g) => `<p class="text-[11px] uppercase tracking-wider muted font-semibold px-3 mt-4 mb-1">${g}</p>` +
    SECTIONS.filter((s) => s.group === g).map((s) => `<a href="#${s.id}" class="navlink ${s.id === active ? "active" : ""}">${s.nav}</a>`).join("")).join("");
  $("#navSelect").innerHTML = SECTIONS.map((s) => `<option value="${s.id}" ${s.id === active ? "selected" : ""}>${s.nav}</option>`).join("");
}
function render() {
  const id = location.hash.slice(1) || "overview";
  const sec = SECTIONS.find((s) => s.id === id) || SECTIONS[0], idx = SECTIONS.indexOf(sec);
  renderNav(sec.id);
  const prev = SECTIONS[idx - 1], next = SECTIONS[idx + 1];
  $("#main").innerHTML = `
    <p class="text-xs uppercase tracking-[0.14em] font-semibold" style="color:var(--orange-ink)">${sec.kicker}</p>
    <h2 class="font-display text-2xl md:text-3xl font-semibold mt-1">${sec.title}</h2>
    <p class="muted text-sm md:text-base mt-2 max-w-3xl">${sec.intro}</p>
    <div class="space-y-8 mt-8">${sec.blocks.map((b, k) => `<section>${R[b.type](b, k)}</section>`).join("")}</div>
    <div class="flex justify-between gap-3 mt-12 pt-6 border-t border-c text-sm">
      ${prev ? `<a href="#${prev.id}" class="muted hover:text-[var(--text)]">← ${prev.nav}</a>` : "<span></span>"}
      ${next ? `<a href="#${next.id}" class="font-semibold" style="color:var(--orange-ink)">${next.nav} →</a>` : ""}</div>`;
  window.scrollTo(0, 0);
  wire();
}
function wire() {
  if ($("#iOut")) { runIndicative(); document.querySelectorAll("#iInc,#iEmi,#iType,#iPrice,#iAsk,#iTen").forEach((e) => e.addEventListener("input", runIndicative)); }
  if ($("#eOut")) { runEligibility(); document.querySelectorAll("#eInc,#eEmi,#eGrade,#eAgr,#eVal,#eAsk").forEach((e) => e.addEventListener("input", runEligibility)); }
  if ($("#scOut")) { runScorecard(); document.querySelectorAll("[data-sc]").forEach((e) => e.addEventListener("change", runScorecard)); }
  if ($("#dRun")) $("#dRun").addEventListener("click", runDcheck);
  if ($("#mOut")) { runMatcher(); ["#mA", "#mB"].forEach((s) => $(s).addEventListener("input", runMatcher)); }
  document.querySelectorAll("[data-reset]").forEach((b) => b.addEventListener("click", render));
  document.querySelectorAll("[data-kfs]").forEach((b) => b.addEventListener("click", () => {
    b.disabled = true; b.textContent = "Accepted ✓"; b.style.background = "var(--accent)";
    $("[data-kfs-msg]").textContent = "OTP verified · timestamp logged · KFS annexed as first schedule (O-04 PASS). Stage 6 envelope can now be generated (S-00).";
  }));
  document.querySelectorAll("[data-rules]").forEach((wrap) => wrap.querySelectorAll("[data-f]").forEach((btn) => btn.addEventListener("click", () => {
    wrap.querySelectorAll("[data-f]").forEach((x) => x.classList.remove("surface-2", "font-semibold"));
    btn.classList.add("surface-2", "font-semibold");
    wrap.querySelectorAll("tr[data-r]").forEach((tr) => { tr.hidden = btn.dataset.f !== "All" && tr.dataset.r !== btn.dataset.f; });
  })));
}

$("#navSelect").addEventListener("change", (e) => { location.hash = e.target.value; });
$("#theme").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "light" : "dark";
});
window.addEventListener("hashchange", render);
render();
