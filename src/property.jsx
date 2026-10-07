/* Stage 4 — property valuation, legal and seller due diligence (buyer's view) */

function PropHub({ go }) {
  const { sc, data, set, log } = useJ();
  const [open, setOpen] = useState(null);
  const p = data.prop || {};
  const save = (patch) => { set({ prop: { ...p, ...patch } }); setOpen(null); };
  if (open === 'docs') return <PropDocs onClose={() => setOpen(null)} onDone={(v) => save({ docs: v })} />;
  if (open === 'seller') return <SellerInvite current={p.seller} waiting={!!p.sellerWait} onClose={() => setOpen(null)} onDone={(v, wait) => save(wait ? { sellerWait: v } : { seller: v, sellerWait: null })} />;
  if (open === 'valuer') return <ValuerVisit onClose={() => setOpen(null)}
    onDone={(v) => { const patch = { valuer: v }; if (sc === 'sellerQR' && !p.seller) { patch.seller = 'Completed on site via valuer’s QR · originals sighted'; patch.sellerWait = null; log('P3', 'Seller DD completed via valuer QR (geo-fenced, 30 min)', 'PASS'); } save(patch); }} />;
  const legal = p.docs && p.seller ? 'Title clear & marketable · EC nil · no litigation' : null;
  const n = [p.docs, p.seller, p.valuer, legal].filter(Boolean).length;
  return (
    <div className="app">
      <FlowHeader title="Property & seller checks" sub="Five checks run in parallel · 2–5 working days" stepNo="Stage 4 / 7" pct={70} onBack={() => go('ips')} />
      <div className="scroll"><div className="flow-body">
        <div className="hub-intro">Your sanction for <b>{lakh(Math.min(data.ask || DEAL.ask, 0.9 * DEAL.price))}</b> is ready. Now we make sure the house is worth it, the title is clean and the money reaches the right person.</div>
        <HubProgress done={n} total={4} />
        <Task icon="doc" name="Property papers" tag="You" desc="Agreement to sell, seller’s deed, tax receipt — photos are fine." done={p.docs} onOpen={() => setOpen('docs')} />
        <Task icon="users" name="Seller verification" tag="Seller" tagOr desc={`Invite ${DEAL.seller.split(' ')[0]} to verify ownership and bank details.`} done={p.seller} wait={p.sellerWait} onOpen={() => setOpen('seller')} />
        <Task icon="home" name="Valuer visit" tag="On site" tagOr desc="Pick a slot. The valuer inspects and photographs the house." done={p.valuer} onOpen={() => setOpen('valuer')} />
        <Task icon="scale" name="Legal & title search" tag="Ujjivan" desc="30-year title chain, encumbrance, court records."
          done={legal} wait={!legal ? (p.docs ? 'Advocate reviewing · needs seller verification' : 'Starts when papers are uploaded') : null} onOpen={() => setOpen('legal')} />
        {open === 'legal' && (
          <Sheet onClose={() => setOpen(null)}>
            <h3>What our team is checking</h3>
            <p className="lede">No action needed from you. If our advocate needs something, you&rsquo;ll get a specific document request here — not a phone call.</p>
            <div className="tl">
              {[['Technical valuation', p.valuer ? 'Report submitted' : 'Waiting for visit', !!p.valuer],
                ['Legal title search (30 yrs)', p.docs ? (legal ? 'Clear & marketable' : 'In progress') : 'Waiting for papers', !!legal],
                ['Seller due diligence', p.seller ? 'Identity, ownership & payee verified' : 'Waiting for seller', !!p.seller],
                ['Encumbrance & charge (CERSAI, EC, eCourts)', p.docs ? 'No live charge · no litigation' : 'Queued', !!p.docs],
                ['Document forensics (sample)', p.docs ? 'No tampering found' : 'Queued', !!p.docs]].map(([t, s, d]) => (
                <div key={t} className={'tl-i' + (d ? ' done' : '')}><div className="dot">{d && <Check s={10} />}</div><b>{t}</b><span>{s}</span></div>
              ))}
            </div>
          </Sheet>
        )}
      </div></div>
      <HelpFab />
      <div className="cta-bar"><button className={'btn' + (n === 4 ? '' : ' off')} onClick={() => n === 4 && go('propEngine')}>{n === 4 ? 'Get property decision' : `${4 - n} check${4 - n > 1 ? 's' : ''} pending`}</button></div>
    </div>
  );
}

/* Upload checklist with OCR classification */
const PROP_DOCS = [
  ['Agreement to sell', 'Price ₹25,00,000 · token ₹1,00,000 paid'],
  ['Seller’s registered deed', 'Gift deed 2011 · Suresh Kumar Jain · House 18'],
  ['Earlier chain deeds', '1998 municipal allotment · Kamla Devi Jain'],
  ['Property tax receipt', '2026-27 · Suresh K Jain · paid'],
  ['Mutation / khata extract', 'In the name of Suresh Kumar Jain'],
  ['Approved building plan', 'G+1 · 1,450 sq ft sanctioned'],
  ['Electricity bill', 'House 18, Shanti Nagar · Sep 2026'],
];
function PropDocs({ onClose, onDone }) {
  const { log } = useJ();
  const [st, setSt] = useState({});
  const up = (i) => { setSt((s) => ({ ...s, [i]: 'busy' })); setTimeout(() => setSt((s) => ({ ...s, [i]: 'ok' })), 1100 + i * 120); };
  const all = PROP_DOCS.every((_, i) => st[i] === 'ok');
  return (
    <div className="sub">
      <SubHead title="Property papers" sub="We read and sort each file as it arrives" tag="OCR" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="info-note" style={{ marginBottom: 14 }}><span className="ni"><Ic k="info" s={16} /></span><span>The seller&rsquo;s PAN, Aadhaar and bank details come through <b>his own link</b> — you don&rsquo;t need to collect them.</span></div>
        {PROP_DOCS.map(([n, ocr], i) => (
          <div key={n} className={'doc-row' + (st[i] === 'ok' ? ' done' : '')}>
            <div className="di"><Ic k={st[i] === 'ok' ? 'check' : 'doc'} s={18} /></div>
            <div className="dn"><b>{n}</b>{st[i] === 'ok' ? <span className="ocr">Read: {ocr}</span> : <span>{st[i] === 'busy' ? 'Reading & classifying…' : 'Photo or PDF'}</span>}</div>
            {!st[i] && <button className="mini-btn" onClick={() => up(i)}><Ic k="camera" s={13} /> Add</button>}
            {st[i] === 'busy' && <div className="spin-dark" />}
          </div>
        ))}
        <div className="hint">Completion / occupancy certificate: not applicable for this house.</div>
        <div className="center"><DemoChip onClick={() => PROP_DOCS.forEach((_, i) => !st[i] && up(i))}>Upload all of Arjun&rsquo;s papers</DemoChip></div>
      </div></div>
      <div className="sub-cta"><button className={'btn teal' + (all ? '' : ' off')} onClick={() => { if (!all) return; log('P-16', '7 uploads · tamper score below threshold', 'PASS'); onDone('7 papers read · owner Suresh Kumar Jain'); }}>Submit papers</button></div>
    </div>
  );
}

/* Seller invite — applicant sees statuses only, never the seller's documents */
function SellerInvite({ current, waiting, onClose, onDone }) {
  const { sc, log } = useJ();
  const [view, setView] = useState(current || waiting ? 'track' : 'form');
  const [f, setF] = useState({ name: '', mob: '' });
  const [ch, setCh] = useState('wa');
  const [t, setT] = useState(waiting ? 99 : 0);
  const stuck = sc === 'sellerQR';
  const steps = stuck
    ? [['Link sent on WhatsApp', 'OTP-bound to seller’s mobile · valid 72 hrs'], ['Reminder sent', 'After 24 hours'], ['Second reminder sent', 'After 48 hours · link not opened yet']]
    : [['Link sent on WhatsApp', 'OTP-bound to seller’s mobile · valid 72 hrs'], ['Seller opened the link', 'Read the privacy notice — he isn’t taking a loan'],
       ['Identity verified', 'PAN, Aadhaar (DigiLocker) and live selfie'], ['Ownership confirmed', 'Name matches deed, mutation and tax receipt'],
       ...(sc === 'sellerLoan' ? [['Existing loan declared', `${SELLER_LENDER.name} · foreclosure letter received`]] : []),
       ['Payee bank verified', 'Penny drop · name match on the account'], ['Declarations e-signed', 'Sole owner · price · token received · not related']];
  useEffect(() => { if (view !== 'track' || current || t >= steps.length) return; const x = setTimeout(() => setT(t + 1), 900); return () => clearTimeout(x); }, [view, t]);
  const finished = current || t >= steps.length;
  if (view === 'form') return (
    <div className="sub">
      <SubHead title="Invite your seller" sub="About 10 minutes on his own phone" tag="SELLER" step={0} total={2} onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede"><div className="sl-ic or"><Ic k="users" s={24} c="#fff" /></div><h2>Your seller verifies — you just send the link</h2>
          <p>We pay the sale money straight to the seller, so we confirm he owns the house, nobody else has a claim on it, and the bank account is his.</p></div>
        <div className="field"><div className="lab">Seller&rsquo;s name</div><div className="ctrl"><input value={f.name} placeholder="As you know him" onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="hint">Only a hint — we match it against his PAN and the deed.</div></div>
        <div className="field"><div className="lab">Seller&rsquo;s mobile</div><div className="ctrl"><span className="pre">+91</span><input inputMode="numeric" value={f.mob} onChange={(e) => setF({ ...f, mob: e.target.value.replace(/[^\d ]/g, '').slice(0, 11) })} /></div>
          <div className="hint">Must be his own number — not yours or a co-applicant&rsquo;s.</div></div>
        <div className="center"><DemoChip onClick={() => setF({ name: DEAL.seller, mob: DEAL.sellerMobile })}>Fill Suresh&rsquo;s details</DemoChip></div>
        <div className="sub-points">
          <div className="sub-point ok"><span className="sp-ic"><Check s={11} /></span><span>Several owners? Each one gets their own link.</span></div>
          <div className="sub-point"><span className="sp-ic"><Ic k="qr" s={12} /></span><span>Seller not comfortable online? The valuer can help him on site with a QR code.</span></div>
        </div>
      </div></div>
      <div className="sub-cta"><button className={'btn' + (f.name && f.mob.replace(/\s/g, '').length === 10 ? '' : ' off')} onClick={() => f.name && setView('share')}>Continue</button></div>
    </div>
  );
  if (view === 'share') return (
    <div className="sub">
      <SubHead title="Send the link" sub={f.name} tag="SELLER" step={1} total={2} onBack={() => setView('form')} />
      <div className="scroll"><div className="sub-body">
        <div className="person"><div className="av or">SJ</div><div className="pn"><b>{f.name}</b><span>+91 {f.mob} · seller</span></div></div>
        <div className="kv-title">Send via</div>
        <div className="share-grid">
          {[['wa', 'WhatsApp', '#25D366'], ['sms', 'SMS', 'var(--t)'], ['mail', 'Email', '#6B5BD2'], ['copy', 'Copy link', '#4B5F63']].map(([id, nm, c]) => (
            <div key={id} className={'share-opt' + (ch === id ? ' sel' : '')} onClick={() => setCh(id)}><div className="so" style={{ background: c }}><Ic k={id} s={17} c="#fff" /></div><b>{nm}</b></div>
          ))}
        </div>
        <div className="sms" style={{ marginTop: 14 }}><div className="sh"><b>Preview</b><span>to {f.name.split(' ')[0]}</span></div>
          <p>Namaste! {ARJUN.first} Mehta is buying your house at House 18, Shanti Nagar with a home loan from Ujjivan SFB. Please verify ownership and your bank details here: <a>ujjivansfb.in/s/k3Pz</a> · valid 72 hrs. You are not taking a loan.</p></div>
        <div className="foot-note">The seller sees only his own tasks and a deal summary — address, price and your name.</div>
      </div></div>
      <div className="sub-cta"><button className="btn" onClick={() => { log('P3', 'Seller link issued (OTP-bound, seller device ≠ applicant)', 'INFO'); setView('track'); }}><Ic k="arrow" s={16} c="#fff" /> Send link</button></div>
    </div>
  );
  const status = finished && !stuck ? 3 : t >= 2 ? (stuck ? 0 : 2) : t >= 1 ? 1 : 0;
  return (
    <div className="sub">
      <SubHead title="Seller verification" sub={DEAL.seller} tag="LIVE STATUS" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="status-steps">
          {['Invited', 'In progress', 'Action needed', 'Completed'].map((s, i) => (
            <div key={s} className={i < status || (i === 3 && status === 3) ? 'on' : i === status ? 'cur' : ''}><i />{s}</div>
          ))}
        </div>
        <div className="tl" style={{ marginTop: 16 }}>
          {steps.map(([a, b], i) => (
            <div key={a} className={'tl-i' + (current || i < t ? ' done' : i === t ? ' on' : '')}><div className="dot">{(current || i < t) && <Check s={10} />}</div><b>{a}</b><span>{b}</span></div>
          ))}
        </div>
        {stuck && t >= steps.length && (
          <div className="info-note warn"><span className="ni"><Ic k="qr" s={16} /></span>
            <span>{DEAL.seller.split(' ')[0]} hasn&rsquo;t opened the link. No problem — when the valuer visits, he&rsquo;ll show a QR code so your seller can finish on his own phone in front of him. Our team can also call him if you prefer.</span></div>
        )}
        {sc === 'sellerLoan' && finished && (
          <div className="info-note" style={{ marginTop: 6 }}><span className="ni"><Ic k="info" s={16} /></span>
            <span>The house has a loan with {SELLER_LENDER.name}. On registration day we pay that lender first (≈ {inr(SELLER_LENDER.foreclosure)}) and the balance to the seller — so the title comes to you free of any charge.</span></div>
        )}
      </div></div>
      <div className="sub-cta">
        {stuck ? <button className={'btn teal' + (t >= steps.length ? '' : ' off')} onClick={() => { if (t < steps.length) return; log('P3', 'Seller link idle 48 h → valuer-QR route', 'SOFT'); onDone('Link not opened · valuer will help on site', true); }}>Okay, continue</button>
          : <button className={'btn teal' + (finished ? '' : ' off')} onClick={() => { if (!finished) return; log('P-08', 'Seller KYC name vs deed 96, tax receipt 94', 'PASS'); log('P-14', 'Payee penny drop SURESH KUMAR JAIN · match 100', 'PASS'); onDone('Identity, ownership and bank verified'); }}>{finished ? 'Done' : 'Waiting for seller…'}</button>}
      </div>
    </div>
  );
}

/* Valuer visit: book slot → live tracker */
function ValuerVisit({ onClose, onDone }) {
  const { sc, log } = useJ();
  const [view, setView] = useState('book');
  const [day, setDay] = useState(1); const [slot, setSlot] = useState('11:00 – 12:00');
  const [t, setT] = useState(0);
  const days = [['Thu', '8 Oct'], ['Fri', '9 Oct'], ['Sat', '10 Oct'], ['Mon', '12 Oct']];
  const steps = [
    ['Valuer assigned', `${TERMS.valuer.name} · ${TERMS.valuer.id}`],
    ['On the way', 'Live location shared · ETA 18 min'],
    ['Reached the property', `GPS ${DEAL.geoFromAddress} m from the address · ${DEAL.geoFromApplicant} m from your home`],
    ['Inspection', '12 geo-tagged photos · RCC G+1 · 1,450 sq ft · no deviation from plan'],
    ...(sc === 'sellerQR' ? [['Seller verified on site', 'Scanned the valuer’s QR (valid 30 min, geo-fenced) · original deeds photographed']] : [['Original deeds sighted', 'Photographed by the valuer']]),
    ['Report submitted', 'Our technical team is reviewing it'],
  ];
  useEffect(() => { if (view !== 'track' || t >= steps.length) return; const x = setTimeout(() => setT(t + 1), 950); return () => clearTimeout(x); }, [view, t]);
  if (view === 'book') return (
    <div className="sub">
      <SubHead title="Book the valuer" sub="A physical visit is required by policy" tag="VALUATION" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede"><div className="sl-ic or"><Ic k="home" s={24} c="#fff" /></div><h2>When can someone open the house?</h2>
          <p>The valuer needs about 45 minutes inside. The seller or a family member can let him in — you don&rsquo;t have to be there.</p></div>
        <KV rows={[['Property', DEAL.address], ['Contact on site', `${DEAL.seller} (seller)`]]} />
        <div className="kv-title">Day</div>
        <div className="chips">{days.map(([d, dt], i) => <div key={dt} className={'chip' + (day === i ? ' on' : '')} onClick={() => setDay(i)}>{d}<small>{dt}</small></div>)}</div>
        <div className="kv-title" style={{ marginTop: 12 }}>Time</div>
        <div className="chips">{['09:00 – 10:00', '11:00 – 12:00', '14:00 – 15:00', '16:00 – 17:00'].map((s) => <div key={s} className={'chip' + (slot === s ? ' on' : '')} onClick={() => setSlot(s)}>{s}</div>)}</div>
        <div className="hint" style={{ marginTop: 12 }}>Locked or unreachable? We reschedule twice before we call you.</div>
      </div></div>
      <div className="sub-cta"><button className="btn" onClick={() => setView('track')}>Confirm {days[day][0]}, {days[day][1]} · {slot.split(' ')[0]}</button></div>
    </div>
  );
  const fin = t >= steps.length;
  return (
    <div className="sub">
      <SubHead title="Valuer visit" sub={`${days[day][0]}, ${days[day][1]} · ${slot}`} tag="LIVE" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="person"><div className="av">RD</div><div className="pn"><b>{TERMS.valuer.name}</b><span>Empanelled valuer · {TERMS.valuer.id}</span></div><button className="mini-btn"><Ic k="call" s={13} /> Call</button></div>
        <div className="tl">
          {steps.map(([a, b], i) => <div key={a} className={'tl-i' + (i < t ? ' done' : i === t ? ' on' : '')}><div className="dot">{i < t && <Check s={10} />}</div><b>{a}</b><span>{b}</span></div>)}
        </div>
      </div></div>
      <div className="sub-cta"><button className={'btn teal' + (fin ? '' : ' off')} onClick={() => { if (!fin) return; log('P-06', `Valuer GPS ${DEAL.geoFromAddress} m from address; ${DEAL.geoFromApplicant} m from applicant (≤ 500 m, neighbour sale)`, 'PASS'); onDone(`Visited ${days[day][1]} · report submitted`); }}>{fin ? 'Done' : 'Visit in progress…'}</button></div>
    </div>
  );
}

function PropEngine({ go }) {
  const { sc, log } = useJ();
  const d = dealFor(sc);
  return <Engine eyebrow="PROPERTY DECISION · P-RULES" title="Clearing your property" total={4800}
    chips={['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09', 'P-10', 'P-11', 'P-12', 'P-13', 'P-14', 'P-15', 'P-16']} unit="property rules"
    stages={[{ t: 'Valuation vs price', d: 'Valuation, circle rate, residual life, deviations' }, { t: 'Title chain', d: '30-year look-back · no GPA-only transfers' },
      { t: 'Seller = owner', d: 'KYC vs deed, mutation, tax receipt · all co-owners' }, { t: 'Encumbrance & litigation', d: 'EC, CERSAI, eCourts' }, { t: 'Neighbour-sale checks', d: 'Related party, token trail, geo-tag' }]}
    onDone={() => {
      const pct = Math.round(d.valuation / DEAL.price * 100);
      log('P-01', `Valuation ${lakhS(d.valuation)} = ${pct}% of price${pct < 90 ? ' → LTV on valuation, counter-offer' : ''}`, pct < 90 ? 'SOFT' : 'PASS');
      log('P-02', `${pct}% ≤ 120% — no under-declaration signal`, 'PASS');
      log('P-03', 'Price ₹25L ≥ guideline ₹23.4L', 'PASS');
      log('P-04', 'Residual life 42 yrs ≥ tenure + 5', 'PASS');
      log('P-05', 'Construction deviation 0%', 'PASS');
      log('P-07', 'Registered chain 1998 → 2011 → seller', 'PASS');
      log('P-09', 'Sole owner = sole seller', 'PASS');
      log('P-10', sc === 'sellerLoan' ? `Live charge: ${SELLER_LENDER.name} → takeover flow, split disbursal` : 'EC nil · no CERSAI charge', sc === 'sellerLoan' ? 'FLAG' : 'PASS');
      log('P-11', 'eCourts: no case on property or seller', 'PASS');
      log('P-12', 'No family link (surname, father, address, transfers)', 'PASS');
      log('P-13', 'Token IMPS to SURESH K JAIN · name 91', 'PASS');
      log('P-15', 'Seller resident — no s.195 TDS; price < ₹50L so no s.194-IA', 'PASS');
      log('S4', 'Property cleared straight-through', 'PASS');
      go('cleared');
    }} />;
}

function Cleared({ go }) {
  const { sc, data, set, log } = useJ();
  const d = dealFor(sc, data.ask || DEAL.ask, data.tenure || DEAL.tenureYrs);
  const low = sc === 'valLow';
  return (
    <div className="app">
      <FlowHeader title={low ? 'Property cleared — revised amount' : 'Your property is cleared'} sub="Legal, technical and seller checks complete" stepNo="Stage 4 / 7" pct={78} onBack={() => go('prop')} />
      <div className="scroll"><div className="flow-body">
        {low ? (
          <Fragment>
            <div className="sub-lede"><div className="sl-ic warn"><Ic k="scale" s={24} c="#fff" /></div><h2>The valuer put the house at {lakh(d.valuation)}</h2>
              <p>That&rsquo;s {Math.round(d.valuation / DEAL.price * 100)}% of your agreed price. RBI lets us fund up to 90% of the <b>lower</b> of price and valuation, so your loan comes down slightly.</p></div>
            <KV rows={[['Agreed price', inr(DEAL.price)], ['Valuation', inr(d.valuation)], ['Loan (90% of valuation)', <b style={{ color: 'var(--od)' }}>{inr(d.sanctioned)}</b>], ['Your own contribution', inr(d.own)], ['New EMI', inr(d.emi)]]} />
            <div className="info-note"><span className="ni"><Ic k="info" s={16} /></span><span>You could also renegotiate the price with the seller — if the agreement changes, we&rsquo;ll recompute instantly.</span></div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="sub-lede"><div className="sl-ic ok"><Check s={24} /></div><h2>Everything checks out</h2><p>The house, its papers and the seller are verified. Your loan stays at <b>{inr(d.sanctioned)}</b>.</p></div>
            <div className="bens">
              {[`Valued at ${lakh(d.valuation)} — ${Math.round(d.valuation / DEAL.price * 100)}% of your price (we use the lower, ₹25 lakh)`, 'Above the government guideline value of ₹23.4 lakh',
                '18-year-old RCC house with 42 years of life left · built as per plan', 'Clean title: 1998 allotment → 2011 gift deed → seller', 'No loan, charge or court case on the property',
                `Seller matches the deed (96) and the bank account is his`, `Your ₹1 lakh token reached the seller’s account`, `Valuer was ${DEAL.geoFromApplicant} m from your home — fits a neighbour sale`]
                .map((t) => <div className="ben" key={t}><span className="tick"><Check s={11} /></span>{t}</div>)}
            </div>
            {sc === 'sellerLoan' && <div className="info-note" style={{ marginTop: 14 }}><span className="ni"><Ic k="info" s={16} /></span>
              <span>The seller&rsquo;s {SELLER_LENDER.name} loan ({inr(SELLER_LENDER.foreclosure)}) is paid off first from your loan on registration day; the balance goes to the seller.</span></div>}
          </Fragment>
        )}
      </div></div>
      <div className="cta-bar">
        <button className="btn" onClick={() => { if (low) log('O-02', `Counter-offer ${lakhS(d.sanctioned)} accepted in-app`, 'PASS'); set({ ask: d.sanctioned }); go('final'); }}>{low ? `Accept ${lakh(d.sanctioned)} & see final offer` : 'See my final offer'}</button>
      </div>
    </div>
  );
}
