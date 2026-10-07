/* Stage 1 — website landing, 3-screen lead capture, indicative eligibility */

function Landing({ go }) {
  const { data, set } = useJ();
  const [mob, setMob] = useState(data.mobile || '');
  return (
    <div className="app">
      <div className="web-nav">
        <Wordmark size={30} />
        <div className="r"><span className="login">Login</span><Ic k="menu" s={20} /></div>
      </div>
      <div className="scroll">
        <div className="web-hero">
          <div className="crumb">Loans › Home Loans › Buy a resale home</div>
          <h1>Your own home, <em>sooner</em> than you think.</h1>
          <p>Get an in-principle decision in about 5 minutes — no documents to start. We verify the property and the seller with you, and stand by you on registration day.</p>
          <div className="hero-stats">
            <div><b>8.50%*</b><span>p.a. onwards</span></div>
            <div><b>90%</b><span>funding up to ₹30L</span></div>
            <div><b>₹0</b><span>prepayment fee</span></div>
          </div>
        </div>
        <div className="web-card">
          <h2>Check your eligibility</h2>
          <div className="wc-sub">3 quick screens. We show an estimate before asking for a single document.</div>
          <div className="field">
            <div className="lab">Mobile number</div>
            <div className="ctrl"><span className="pre">+91</span>
              <input inputMode="numeric" placeholder="10-digit mobile" value={mob} onChange={(e) => setMob(e.target.value.replace(/[^\d ]/g, '').slice(0, 11))} /></div>
          </div>
          <button className={'btn' + (mob.replace(/\s/g, '').length === 10 ? '' : ' off')}
            onClick={() => { if (mob.replace(/\s/g, '').length !== 10) return; set({ mobile: mob }); go('lead1'); }}>
            Check eligibility <Ic k="arrow" s={16} c="#fff" />
          </button>
          <div className="center" style={{ marginTop: 10 }}><DemoChip onClick={() => setMob(ARJUN.mobile)}>Use Arjun&rsquo;s number</DemoChip></div>
        </div>
        <div className="web-sec">
          <h3>Why buy with Ujjivan</h3>
          {[
            ['spark', 'Decision in one sitting', 'PAN, Aadhaar and your salary account — fetched with your consent, no uploads.'],
            ['users', 'We verify the seller with you', 'Your seller gets a secure link to prove ownership and bank details. You see live status.'],
            ['home', 'Doorstep valuation', 'An empanelled valuer visits the property; you track them live.'],
            ['building', 'Registration-day support', 'Our executive meets you at the sub-registrar; money goes straight to the seller.'],
          ].map(([k, t, d]) => (
            <div className="feat" key={t}><div className="fi"><Ic k={k} s={18} /></div><div><b>{t}</b><p>{d}</p></div></div>
          ))}
        </div>
        <div className="web-foot">
          *Rates are floating and linked to the bank&rsquo;s external benchmark; your rate depends on your profile. Loans are at the sole discretion of Ujjivan Small Finance Bank. Grievance Redressal Officer details are available on every communication. Prototype screen — illustrative data only.
        </div>
      </div>
    </div>
  );
}

/* Lead screen 1 — about you */
function Lead1({ go }) {
  const { data, set, log } = useJ();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(!!data.mobileVerified);
  const [f, setF] = useState({ name: data.name || '', dob: data.dob || '', email: data.email || '' });
  const fill = () => setF({ name: ARJUN.name, dob: '1994-03-17', email: ARJUN.email });
  const ok = verified && f.name && f.dob && f.email;
  return (
    <div className="app">
      <FlowHeader title="About you" sub="Name exactly as on your PAN" stepNo="1 / 3" pct={14} onBack={() => go('web')} />
      <div className="scroll"><div className="flow-body">
        <div className="field">
          <div className="lab">Mobile number {verified && <span className="verified-pill"><Check s={9} /> Verified</span>}</div>
          <div className="ctrl"><span className="pre">+91</span><input value={data.mobile || ''} readOnly />
            {!verified && !otpSent && <button className="link-btn" onClick={() => setOtpSent(true)}>Send OTP</button>}</div>
        </div>
        {otpSent && !verified && (
          <div className="field" style={{ animation: 'drop .2s ease' }}>
            <div className="otp-sent">Enter the 6-digit code sent to <b>+91 {data.mobile}</b></div>
            <OtpRow value={otp} onChange={(v) => { setOtp(v); if (v.length === 6) { setVerified(true); set({ mobileVerified: true }); log('L-01', 'Mobile OTP verified on 1st attempt', 'PASS'); log('L-07', 'Dedupe on mobile/device — no live or rejected application', 'PASS'); } }} />
            <ResendLine />
          </div>
        )}
        <div className="field"><div className="lab">Full name (as on PAN)</div>
          <div className="ctrl"><input placeholder="e.g. Arjun Ramesh Mehta" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div></div>
        <div className="row2">
          <div className="field"><div className="lab">Date of birth</div>
            <div className="ctrl"><input type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></div></div>
          <div className="field"><div className="lab">Email</div>
            <div className="ctrl"><input type="email" placeholder="you@mail.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div></div>
        </div>
        <div className="center"><DemoChip onClick={fill}>Fill Arjun&rsquo;s details</DemoChip></div>
      </div></div>
      <div className="cta-bar">
        <button className={'btn' + (ok ? '' : ' off')} onClick={() => { if (!ok) return; set(f); go('lead2'); }}>Continue <Ic k="arrow" s={16} c="#fff" /></button>
      </div>
    </div>
  );
}

/* Lead screen 2 — work & income */
const EMPLOYERS = [
  ['Technova Solutions Pvt Ltd', 'Cat B · MCA active · Nagpur'],
  ['Technova Systems LLP', 'Cat C · Pune'],
  ['Tech Mahindra Ltd', 'Cat A · Listed'],
];
function Lead2({ go }) {
  const { data, set, log } = useJ();
  const [f, setF] = useState({ emp: data.emp || 'Salaried', employer: data.employer || '', income: data.income || '', emis: data.emis ?? '' });
  const [q, setQ] = useState(false);
  const ok = f.employer && f.income && f.emis !== '';
  const fill = () => setF({ emp: 'Salaried', employer: ARJUN.employer, income: '65000', emis: '6500' });
  const matches = EMPLOYERS.filter(([n]) => f.employer.length > 1 && n.toLowerCase().includes(f.employer.toLowerCase()) && n !== f.employer);
  return (
    <div className="app">
      <FlowHeader title="Your work & income" sub="Take-home means after tax and PF" stepNo="2 / 3" pct={28} onBack={() => go('lead1')} />
      <div className="scroll"><div className="flow-body">
        <div className="field"><div className="lab">Employment type</div>
          <Seg options={['Salaried', 'Self-employed professional', 'Self-employed business']} value={f.emp} onChange={(v) => setF({ ...f, emp: v })} />
          {f.emp !== 'Salaried' && <div className="hint warn">We&rsquo;ll use a more conservative estimate for self-employed income (−25%) and ask for ITR in the next step.</div>}
        </div>
        <div className="field"><div className="lab">Employer</div>
          <div className="ctrl"><Ic k="search" s={16} c="var(--faint)" />
            <input placeholder="Start typing your company" value={f.employer} onFocus={() => setQ(true)} onChange={(e) => { setF({ ...f, employer: e.target.value }); setQ(true); }} /></div>
          {q && matches.length > 0 && (
            <div className="suggest">{matches.map(([n, d]) => <div key={n} onClick={() => { setF({ ...f, employer: n }); setQ(false); }}><span>{n}</span><small>{d}</small></div>)}</div>
          )}
          <div className="hint">Matched against our employer list and MCA21 records.</div>
        </div>
        <div className="row2">
          <div className="field"><div className="lab">Monthly take-home</div>
            <div className="ctrl"><span className="pre">₹</span><input inputMode="numeric" value={f.income} onChange={(e) => setF({ ...f, income: e.target.value.replace(/\D/g, '') })} /></div></div>
          <div className="field"><div className="lab">Current EMIs / month</div>
            <div className="ctrl"><span className="pre">₹</span><input inputMode="numeric" value={f.emis} onChange={(e) => setF({ ...f, emis: e.target.value.replace(/\D/g, '') })} /></div></div>
        </div>
        <div className="hint">Include personal, car and other loan EMIs. Credit-card bills don&rsquo;t count.</div>
        <div className="center"><DemoChip onClick={fill}>Fill Arjun&rsquo;s details</DemoChip></div>
      </div></div>
      <div className="cta-bar">
        <button className={'btn' + (ok ? '' : ' off')} onClick={() => { if (!ok) return; set(f); log('L-09', 'Employer not on negative list · Cat B', 'PASS'); go('lead3'); }}>Continue <Ic k="arrow" s={16} c="#fff" /></button>
      </div>
    </div>
  );
}

/* Lead screen 3 — the home you're buying + consents */
function Lead3({ go }) {
  const { data, set, log } = useJ();
  const [f, setF] = useState({
    purpose: 'resale', ptype: 'Independent house', pin: data.pin || '', price: data.price || '', loan: data.loan || '',
    tenure: 20, sellerType: 'Individual', rel: data.rel || '', owners: 'Just me',
  });
  const [c, setC] = useState({ comms: false, terms: false });
  const fill = () => setF({ ...f, pin: '440015', price: '2500000', loan: '2000000', rel: 'Neighbour' });
  const price = +f.price || 0, loan = +f.loan || 0, cap = ltvCap(price) * price;
  const ok = f.pin.length === 6 && price && loan && f.rel && c.comms && c.terms;
  const maxT = Math.min(30, 60 - ARJUN.age);
  const submit = () => {
    if (!ok) return;
    set({ ...f, ask: Math.min(loan, cap), tenure: f.tenure });
    log('L-02', `Age ${ARJUN.age} + ${f.tenure} yrs = ${ARJUN.age + f.tenure} ≤ 60`, 'PASS');
    log('L-03', `PIN ${f.pin} serviceable · branch ≤ 50 km`, 'PASS');
    log('L-04', `${f.ptype}, value ${lakhS(price)} within ₹5L–₹5Cr`, 'PASS');
    log('L-05', `Indicative LTV ${(loan / price * 100).toFixed(0)}% vs cap ${ltvCap(price) * 100}%`, loan <= cap ? 'PASS' : 'SOFT');
    log('L-08', 'Velocity / device / email checks clean', 'PASS');
    log('L-10', `Seller = ${f.rel.toLowerCase()} → ${f.rel === 'Relative' ? 'REL_PARTY=Y' : f.rel === 'Neighbour' ? 'NEIGHBOUR_SALE=Y' : 'no flag'} · TXN_TYPE=RESALE`, f.rel === 'Other' ? 'PASS' : 'FLAG');
    go('eligLoad');
  };
  return (
    <div className="app">
      <FlowHeader title="The home you're buying" sub="Rough numbers are fine for now" stepNo="3 / 3" pct={42} onBack={() => go('lead2')} />
      <div className="scroll"><div className="flow-body">
        <div className="field"><div className="lab">I want to</div>
          <Seg value={f.purpose} onChange={(v) => setF({ ...f, purpose: v })} options={[
            { v: 'resale', l: 'Buy a resale home' }, { v: 'builder', l: 'Buy from a builder' },
            { v: 'plot', l: 'Plot + construction' }, { v: 'bt', l: 'Transfer my loan' }]} />
          {f.purpose !== 'resale' && <div className="hint warn">This prototype walks the resale journey. Builder, plot and transfer cases switch seller checks off and stage-wise payouts on.</div>}
        </div>
        <div className="field"><div className="lab">Property type</div>
          <Seg value={f.ptype} onChange={(v) => setF({ ...f, ptype: v })} options={['Independent house', 'Flat', 'Plot + construction']} /></div>
        <div className="row2">
          <div className="field"><div className="lab">Property PIN</div><div className="ctrl"><input inputMode="numeric" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
            {f.pin === '440015' && <div className="hint ok">Nagpur · Shanti Nagar ✓</div>}</div>
          <div className="field"><div className="lab">Tenure</div>
            <div className="stepper-ctl"><button onClick={() => setF({ ...f, tenure: Math.max(5, f.tenure - 1) })}>−</button>
              <b className="disp" style={{ fontSize: 16 }}>{f.tenure} yrs</b>
              <button onClick={() => setF({ ...f, tenure: Math.min(maxT, f.tenure + 1) })}>+</button></div></div>
        </div>
        <div className="row2">
          <div className="field"><div className="lab">Agreed price</div><div className="ctrl"><span className="pre">₹</span><input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '') })} /></div>
            {price > 0 && <div className="hint">{lakh(price)}</div>}</div>
          <div className="field"><div className="lab">Loan needed</div><div className="ctrl"><span className="pre">₹</span><input inputMode="numeric" value={f.loan} onChange={(e) => setF({ ...f, loan: e.target.value.replace(/\D/g, '') })} /></div>
            {loan > 0 && <div className={'hint' + (loan > cap ? ' warn' : '')}>{loan > cap ? `Max ${lakh(cap)} (${ltvCap(price) * 100}% of price)` : `Down payment ${lakh(price - loan)}`}</div>}</div>
        </div>
        <div className="field"><div className="lab">Who is selling?</div>
          <Seg value={f.sellerType} onChange={(v) => setF({ ...f, sellerType: v })} options={['Individual', 'Builder', 'Housing society']} /></div>
        <div className="field"><div className="lab">Do you know the seller?</div>
          <Seg value={f.rel} onChange={(v) => setF({ ...f, rel: v })} options={['Neighbour', 'Relative', 'Other']} />
          {f.rel === 'Neighbour' && <div className="hint">Good to know — we&rsquo;ll run a couple of extra checks that protect you in sales between neighbours.</div>}
          {f.rel === 'Relative' && <div className="hint warn">Family sales are reviewed by our credit team (gift vs sale) and may carry a lower LTV.</div>}
        </div>
        <div className="field"><div className="lab">Who will own the home?</div>
          <Seg value={f.owners} onChange={(v) => setF({ ...f, owners: v })} options={['Just me', 'Jointly with spouse']} />
          {f.owners !== 'Just me' && <div className="hint">Every co-owner must also be a co-applicant — we&rsquo;ll send your spouse a short link. Some states offer a stamp-duty concession for women co-owners.</div>}
        </div>
        <div className="center" style={{ marginBottom: 12 }}><DemoChip onClick={fill}>Fill Arjun&rsquo;s deal</DemoChip></div>
        <div className="consents">
          <Consent on={c.comms} onToggle={() => setC({ ...c, comms: !c.comms })}><span className="req">*</span> Ujjivan SFB may contact me about this application by call, SMS, WhatsApp and email.</Consent>
          <Consent on={c.terms} onToggle={() => setC({ ...c, terms: !c.terms })}><span className="req">*</span> I agree to the <b>Terms of Use</b> and have read the <b>Privacy Notice</b>.</Consent>
        </div>
        <div className="info-note" style={{ marginTop: 6 }}><span className="ni"><Ic k="info" s={16} /></span>
          <span>Next, we&rsquo;ll ask separately for your permission to check your credit bureau report and bank data. Nothing is pulled yet.</span></div>
      </div></div>
      <div className="cta-bar"><button className={'btn' + (ok ? '' : ' off')} onClick={submit}>See my eligibility <Ic k="arrow" s={16} c="#fff" /></button></div>
    </div>
  );
}

/* Indicative eligibility — conservative on purpose (declared income −10%, rate +0.50%, FOIR grid −5%) */
function Eligibility({ go }) {
  const { data, set } = useJ();
  const price = +data.price || DEAL.price;
  const inc = +data.income || ARJUN.net, emis = +data.emis || 0;
  const self = data.emp && data.emp !== 'Salaried';
  const [dp, setDp] = useState(price - (data.ask || DEAL.ask));
  const [ten, setTen] = useState(data.tenure || 20);
  const capPct = ltvCap(price), minDp = Math.round(price * (1 - capPct));
  const ask = price - dp, m = ten * 12;
  const incH = inc * (self ? 0.75 : 0.9), capFoir = foirCap(incH) - 5;
  const room = Math.max(0, incH * capFoir / 100 - emis);
  const foirLoan = room / emiPerLakh(TERMS.bufferRate, m) * 1e5;
  const elig = Math.floor(Math.min(foirLoan, capPct * price) / 10000) * 10000;
  const fits = ask <= elig;
  const emi = emiFor(ask, TERMS.cardRate, m);
  const foirShown = (emi + emis) / inc * 100;
  return (
    <div className="app">
      <FlowHeader title="Your estimate" sub="Based on what you told us" pct={52} onBack={() => go('lead3')} />
      <div className="scroll"><div className="flow-body">
        <div className="elig-hero">
          <div className="lab2">Estimated eligibility up to</div>
          <div className="big">{lakh(elig)}</div>
          <div className={'fit' + (fits ? '' : ' no')}>{fits ? <Check s={11} /> : <Ic k="info" s={13} />} {fits ? `Your ${lakh(ask)} request fits.` : `Your ${lakh(ask)} request is above the estimate.`}</div>
          <div className="disc">Estimate only, subject to verification — not a sanction or an offer. We haven&rsquo;t checked your credit report yet.</div>
        </div>

        <div className="slider-card">
          <div className="sh"><span>Your down payment</span><b>{inr(dp)} <span style={{ fontSize: 12, color: 'var(--muted)' }}>({Math.round(dp / price * 100)}%)</span></b></div>
          <input className="range" type="range" min={minDp} max={Math.round(price * 0.5)} step={10000} value={dp} onChange={(e) => setDp(+e.target.value)} />
          <div className="hint">{dp <= minDp ? `RBI caps funding at ${capPct * 100}% for homes up to ₹30L — this is the smallest down payment possible.` : 'Slide to see how a bigger down payment changes your loan.'}</div>
        </div>
        <div className="slider-card">
          <div className="sh"><span>Loan amount</span><b>{inr(ask)}</b></div>
          <div className="sh" style={{ marginTop: 8 }}><span>Tenure</span>
            <div className="stepper-ctl"><button onClick={() => setTen(Math.max(5, ten - 1))}>−</button><b className="disp">{ten} yrs</b><button onClick={() => setTen(Math.min(60 - ARJUN.age, ten + 1))}>+</button></div></div>
          <div className="sh" style={{ marginTop: 10 }}><span>Approx. EMI at {TERMS.cardRate}%</span><b>{inr(emi)}</b></div>
          <div className="meter"><i style={{ width: Math.min(100, foirShown / 60 * 100) + '%' }} /></div>
          <div className="hint">EMIs would take <b>{Math.round(foirShown)}%</b> of your take-home{emis ? ', including your current EMI' : ''}.</div>
        </div>
        {!fits && (
          <div className="info-note warn" style={{ marginTop: 14 }}><span className="ni"><Ic k="info" s={16} /></span>
            <span>To fit, try a bigger down payment or a longer tenure — or add an earning co-applicant in the next step.</span></div>
        )}
        <div className="o2-sec">What happens next · about 5 minutes</div>
        <div className="bens">
          {['Verify PAN and Aadhaar (DigiLocker) and take a selfie', 'Approve a one-time read of your salary account via Account Aggregator', 'Get an in-principle sanction on screen'].map((t) => (
            <div className="ben" key={t}><span className="tick"><Check s={11} /></span>{t}</div>
          ))}
        </div>
        <div className="hint" style={{ marginTop: 10 }}>Keep handy: PAN, your Aadhaar-linked mobile and your salary bank&rsquo;s net-banking OTP.</div>
      </div></div>
      <div className="cta-bar"><button className={'btn' + (fits ? '' : ' off')} onClick={() => { if (!fits) return; set({ ask, tenure: ten }); go('kyc'); }}>Verify &amp; get my sanction <Ic k="arrow" s={16} c="#fff" /></button></div>
    </div>
  );
}
