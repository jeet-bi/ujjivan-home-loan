/* Stage 2 — KYC + financial data. Hub launches focused sub-flows; PAN seeds the golden record. */

function KycHub({ go }) {
  const { data, set } = useJ();
  const [open, setOpen] = useState(null);
  const st = data.kyc || {};
  const done = (k, v) => { set({ kyc: { ...st, [k]: v } }); setOpen(null); };
  if (open === 'pan') return <PanVerify onClose={() => setOpen(null)} onDone={(v) => done('pan', v)} />;
  if (open === 'aadhaar') return <AadhaarDL onClose={() => setOpen(null)} onDone={(v) => done('aadhaar', v)} />;
  if (open === 'face') return <Liveness onClose={() => setOpen(null)} onDone={(v) => done('face', v)} />;
  if (open === 'fin') return <FinData onClose={() => setOpen(null)} onDone={(v) => done('fin', v)} />;
  const n = ['pan', 'aadhaar', 'face', 'fin'].filter((k) => st[k]).length;
  return (
    <div className="app">
      <FlowHeader title="Verify & get your sanction" sub="Four quick steps · about 5 minutes" stepNo="Stage 2 / 7" pct={60} onBack={() => go('elig')} />
      <div className="scroll"><div className="flow-body">
        <div className="hub-intro">You type only your PAN. Everything else comes from <b>government and bank sources</b>, with your permission for each one.</div>
        <HubProgress done={n} total={4} />
        <Task icon="pan" name="PAN" tag="Start here" desc="We check it with the Income Tax database." done={st.pan} onOpen={() => setOpen('pan')} />
        <Task icon="aadhaar" name="Aadhaar e-KYC" tag="DigiLocker" desc="Address and photo, straight from DigiLocker." done={st.aadhaar} locked={!st.pan} lockedText="Unlocks after PAN." onOpen={() => setOpen('aadhaar')} />
        <Task icon="face" name="Selfie check" desc="A 5-second live selfie matched to your Aadhaar photo." done={st.face} locked={!st.aadhaar} lockedText="Unlocks after Aadhaar." onOpen={() => setOpen('face')} />
        <Task icon="chart" name="Income & credit check" tag="Account Aggregator" desc="Credit report, salary account and EPF — with separate consents." done={st.fin} locked={!st.pan} lockedText="Unlocks after PAN." onOpen={() => setOpen('fin')} />
        <div className="hub-secure"><Ic k="lock" s={13} /> Encrypted · stored in India · we never ask for net-banking passwords</div>
      </div></div>
      <HelpFab />
      <div className="cta-bar"><button className={'btn' + (n === 4 ? '' : ' off')} onClick={() => n === 4 && go('uw')}>{n === 4 ? 'Get my decision' : 'Complete all four to continue'}</button></div>
    </div>
  );
}

/* PAN → anchor of the golden record */
function PanVerify({ onClose, onDone }) {
  const { log } = useJ();
  const [view, setView] = useState('enter');
  const [pan, setPan] = useState('');
  if (view === 'fetch') return (
    <div className="sub"><Fetching title="Verifying your PAN" sub="Income Tax · Protean (NSDL)"
      lines={[['PAN status', 'VALID'], ['Name on PAN', 'match 100'], ['Date of birth', 'EXACT'], ['Aadhaar seeding', 'Y'], ['CKYC search by PAN', 'FOUND']]}
      onDone={() => { log('K-01', 'PAN ABCPM1234K valid', 'PASS'); log('K-02', 'PAN operative · Aadhaar-seeded', 'PASS'); log('§3', 'Golden record anchored on PAN name + DOB', 'INFO'); log('CKYC', 'Record 300012345678901 found (updated 2021)', 'INFO'); setView('res'); }} /></div>
  );
  if (view === 'res') return (
    <div className="sub">
      <SubHead title="PAN verified" sub="This is now your identity anchor" tag="PROTEAN" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede"><div className="sl-ic ok"><Check s={24} /></div><h2>Hi {ARJUN.first}, that&rsquo;s you.</h2>
          <p>Every document from here on is matched against these details, so nobody else can apply in your name.</p></div>
        <KV rows={[['Name', ARJUN.name], ['PAN', ARJUN.pan, 1], ['Date of birth', '17 Mar 1994'], ['Aadhaar linked', 'Yes'], ['CKYC record', 'Found · will be updated after disbursal']]} />
      </div></div>
      <div className="sub-cta"><button className="btn teal" onClick={() => onDone('ABCPM1234K · name & DOB matched')}>Continue</button></div>
    </div>
  );
  const ok = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  return (
    <div className="sub">
      <SubHead title="Verify PAN" sub="The only thing you type" tag="STEP 1" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede"><div className="sl-ic"><Ic k="pan" s={24} c="#fff" /></div><h2>Enter your PAN</h2><p>We check status, name and date of birth with the Income Tax database.</p></div>
        <div className="field"><div className="lab">PAN</div>
          <div className="ctrl"><input className="mono" style={{ letterSpacing: '.14em', textTransform: 'uppercase' }} placeholder="ABCDE1234F" maxLength={10}
            value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />{ok && <span className="verified-pill">Format OK</span>}</div></div>
        <div className="center"><DemoChip onClick={() => setPan(ARJUN.pan)}>Use Arjun&rsquo;s PAN</DemoChip></div>
        <div className="sub-points">
          <div className="sub-point ok"><span className="sp-ic"><Check s={11} /></span><span>By continuing, you consent to PAN verification and a CKYC search for this application.</span></div>
        </div>
      </div></div>
      <div className="sub-cta"><button className={'btn' + (ok ? '' : ' off')} onClick={() => ok && setView('fetch')}>Verify PAN</button></div>
    </div>
  );
}

/* Aadhaar OKYC via DigiLocker */
function AadhaarDL({ onClose, onDone }) {
  const { log } = useJ();
  const [view, setView] = useState('intro');
  const [aad, setAad] = useState(''); const [otp, setOtp] = useState('');
  const order = ['intro', 'login', 'otp', 'consent'];
  if (view === 'fetch') return (
    <div className="sub"><Fetching slate title="Fetching from DigiLocker" sub="Government-issued Aadhaar e-KYC"
      lines={['Signing in to DigiLocker', 'Authorising Aadhaar e-KYC', 'Downloading signed Aadhaar XML', ['Validating digital signature', 'VALID']]}
      onDone={() => { log('K-03', 'PAN–Aadhaar name score 100', 'PASS'); log('K-04', 'DOB 17-03-1994 exact', 'PASS'); log('K-09', 'Address PIN 440015 + locality match CKYC', 'PASS'); log('§3', 'Record enriched (address, photo) and locked', 'INFO'); setView('res'); }} /></div>
  );
  if (view === 'res') return (
    <div className="sub">
      <SubHead title="Aadhaar verified" sub="Pulled from DigiLocker" tag="DIGILOCKER" step={3} total={3} onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede" style={{ marginBottom: 14 }}><div className="sl-ic ok"><Check s={24} /></div><h2>Matched with your PAN</h2><p>No uploads, no typing. Only a reference to your Aadhaar is stored — never the full number.</p></div>
        <div className="ekyc-card">
          <div className="ekyc-head"><div className="ek-pic">AM</div><div><div className="ek-nm">{ARJUN.name}</div><div className="ek-src"><Ic k="shield" s={12} /> Verified · DigiLocker e-KYC</div></div></div>
          <div className="kv-card" style={{ border: 0, margin: 0 }}>
            {[['Date of birth', '17 Mar 1994'], ['Gender', 'Male'], ['Aadhaar', 'XXXX XXXX 4821'], ['Address', ARJUN.address], ['Match with PAN', <span className="ok">Name 100 · DOB exact</span>]].map(([k, v]) =>
              <div className="r" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>)}
          </div>
        </div>
      </div></div>
      <div className="sub-cta"><button className="btn teal" onClick={() => onDone('Aadhaar ••4821 · address & photo verified')}>Confirm &amp; continue</button></div>
    </div>
  );
  const back = view === 'intro' ? undefined : () => setView(order[order.indexOf(view) - 1]);
  return (
    <div className="sub">
      <SubHead title="Aadhaar verification" sub="Securely via DigiLocker" tag="DIGILOCKER" step={order.indexOf(view)} total={3} onClose={view === 'intro' ? onClose : undefined} onBack={back} />
      <div className="scroll"><div className="sub-body">
        {view === 'intro' && <Fragment>
          <div className="sub-lede"><div className="sl-ic slate"><Ic k="aadhaar" s={24} c="#fff" /></div><h2>Verify Aadhaar via DigiLocker</h2>
            <p>Sharing Aadhaar is <b>voluntary</b>. If you prefer, you can do a short video KYC with our team instead.</p></div>
          <div className="sub-points">
            <div className="sub-point"><span className="sp-ic"><Ic k="doc" s={12} /></span><span>No card photos, no manual entry.</span></div>
            <div className="sub-point ok"><span className="sp-ic"><Check s={11} /></span><span>You approve exactly what we can read, one time only.</span></div>
          </div>
          <button className="btn teal" onClick={() => setView('login')}>Continue to DigiLocker</button>
          <button className="btn ghost" onClick={() => {}}>I&rsquo;d rather do video KYC</button>
        </Fragment>}
        {view === 'login' && <Fragment>
          <div className="info-note" style={{ marginBottom: 16 }}><span className="ni"><Ic k="lock" s={16} /></span><span>You&rsquo;re on DigiLocker&rsquo;s secure sign-in. Ujjivan can&rsquo;t see your DigiLocker credentials.</span></div>
          <div className="field"><div className="lab">Aadhaar number</div>
            <div className="ctrl"><input className="mono" placeholder="XXXX XXXX XXXX" value={aad}
              onChange={(e) => setAad(e.target.value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 '))} /></div></div>
          <div className="center"><DemoChip onClick={() => setAad('5284 7190 4821')}>Use Arjun&rsquo;s Aadhaar</DemoChip></div>
        </Fragment>}
        {view === 'otp' && <Fragment>
          <div className="otp-sent">DigiLocker sent a 6-digit OTP to your Aadhaar-linked mobile<br /><b>{ARJUN.mobileMasked}</b></div>
          <OtpRow value={otp} onChange={setOtp} /><ResendLine />
        </Fragment>}
        {view === 'consent' && <Fragment>
          <div className="consent-panel">
            <div className="cp-head slate"><div className="cp-logo"><Ic k="aadhaar" s={17} c="#fff" /></div><div><div className="cp-ht">Ujjivan Small Finance Bank</div><div className="cp-hs">requests access via DigiLocker</div></div></div>
            {[['Document', 'Aadhaar e-KYC (XML)'], ['Shares', 'Name, DOB, gender, address & photo'], ['Purpose', 'KYC for home loan'], ['Access', 'One-time only']].map(([k, v]) =>
              <div className="cp-row" key={k}><span className="cp-k">{k}</span><span className="cp-v">{v}</span></div>)}
          </div>
          <div className="foot-note">Consent logged with time, device and purpose (DPDP Act 2023).</div>
        </Fragment>}
      </div></div>
      {view === 'login' && <div className="sub-cta"><button className={'btn teal' + (aad.length === 14 ? '' : ' off')} onClick={() => aad.length === 14 && setView('otp')}>Send OTP</button></div>}
      {view === 'otp' && <div className="sub-cta"><button className={'btn teal' + (otp.length === 6 ? '' : ' off')} onClick={() => otp.length === 6 && setView('consent')}>Verify</button></div>}
      {view === 'consent' && <div className="sub-cta"><button className="btn teal" onClick={() => setView('fetch')}>Allow &amp; share</button></div>}
    </div>
  );
}

/* Selfie with passive liveness + face match (K-05/K-06), with grey-zone assisted recovery */
function Liveness({ onClose, onDone }) {
  const { sc, log } = useJ();
  const [view, setView] = useState('intro');
  const [attempt, setAttempt] = useState(1);
  const grey = sc === 'faceGrey' && attempt === 1;
  if (view === 'scan') return <div className="sub"><SubHead title="Face verification" sub={attempt > 1 ? 'Second attempt · daylight' : 'Follow the prompts'} tag="LIVENESS" onBack={() => setView('intro')} /><LiveScan onEnd={() => setView('match')} /></div>;
  if (view === 'match') return (
    <div className="sub"><Fetching slate title="Matching your face" sub="Against your Aadhaar photo" hold={500}
      lines={[['Passive liveness', '0.97'], ['Extracting face features', ''], ['Match with Aadhaar photo', grey ? '68' : attempt > 1 ? '89' : '91']]}
      onDone={() => {
        log('K-05', 'Passive liveness 0.97 ≥ 0.9', 'PASS');
        if (grey) { log('K-06', 'Face match 68 — grey zone 65–79', 'REFER'); log('§13', 'Assisted-support ticket auto-opened (failed step)', 'INFO'); setView('grey'); }
        else { log('K-06', `Face match ${attempt > 1 ? 89 : 91} ≥ 80`, 'PASS'); setView('ok'); }
      }} /></div>
  );
  if (view === 'ok') return <SubDone title="It's really you" line={`Live selfie matched your Aadhaar photo (score ${attempt > 1 ? 89 : 91}).`} chip="Liveness passed" cta="Continue" onDone={() => onDone(`Live selfie · match ${attempt > 1 ? 89 : 91}${attempt > 1 ? ' (after assisted retry)' : ''}`)} />;
  if (view === 'grey') return <GreyZone onRetry={() => { setAttempt(2); setView('intro'); }} onClose={onClose} />;
  return (
    <div className="sub">
      <SubHead title="Face verification" sub="Quick liveness check" tag="LIVENESS" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede"><div className="sl-ic"><Ic k="face" s={24} c="#fff" /></div><h2>{attempt > 1 ? "Let's try once more" : 'A quick live selfie'}</h2>
          <p>{attempt > 1 ? 'Face a window or a bright light. Our executive is on the line if you need them.' : 'This confirms a real person — not a photo — is applying, and matches you to your Aadhaar.'}</p></div>
        <div className="sub-points">
          <div className="sub-point"><span className="sp-ic"><Ic k="sun" s={12} /></span><span>Find a <b>well-lit</b> spot, facing the light.</span></div>
          <div className="sub-point"><span className="sp-ic"><Ic k="face" s={12} /></span><span>Remove caps and sunglasses.</span></div>
          <div className="sub-point"><span className="sp-ic"><Ic k="phone" s={12} /></span><span>Hold the phone at <b>eye level</b>.</span></div>
        </div>
      </div></div>
      <div className="sub-cta"><button className="btn teal" onClick={() => setView('scan')}><Ic k="camera" s={16} c="#fff" /> Start selfie</button></div>
    </div>
  );
}
function LiveScan({ onEnd }) {
  const ch = [['Center your face in the oval', 'Hold still…'], ['Blink slowly', 'Detecting liveness'], ['Turn your head left', 'A little more…'], ['Now turn right', 'Almost there'], ['Smile', 'Capturing']];
  const [i, setI] = useState(0);
  useEffect(() => { if (i >= ch.length) { const t = setTimeout(onEnd, 450); return () => clearTimeout(t); } const t = setTimeout(() => setI(i + 1), 1000); return () => clearTimeout(t); }, [i]);
  const cur = ch[Math.min(i, ch.length - 1)], pct = Math.min(1, i / ch.length);
  const w = 232, h = 282, rx = 112, ry = 137, circ = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  return (
    <div className="live-stage">
      <div className="live-prompt">{cur[0]}</div><div className="live-sub">{cur[1]}</div>
      <div className="live-oval-wrap">
        <div className="live-oval"><div className="live-head" /><div className="live-body" /><div className="live-scanl" /></div>
        <div className="live-ring" />
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: -6, transform: 'rotate(-90deg)' }} fill="none">
          <ellipse cx={w / 2} cy={h / 2} rx={rx} ry={ry} stroke="#FFB066" strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset .5s ease' }} />
        </svg>
      </div>
      <div className="live-dots">{ch.map((_, k) => <div key={k} className={'ld' + (k < i ? ' done' : k === i ? ' active' : '')} />)}</div>
      <div className="live-tips"><span className="live-tip"><Check s={11} /> Face detected</span><span className="live-tip"><Check s={11} /> Camera only for KYC</span></div>
    </div>
  );
}
/* Section 13: grey zone → executive call → scoped "Re-initiate KYC" link */
function GreyZone({ onRetry, onClose }) {
  const { log } = useJ();
  const [step, setStep] = useState(0);
  useEffect(() => { if (step === 0) { const t = setTimeout(() => setStep(1), 2200); return () => clearTimeout(t); } }, [step]);
  return (
    <div className="sub">
      <SubHead title="Face verification" sub="We need one more try" tag="ASSISTED" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        {step === 0 && <Fragment>
          <div className="sub-lede"><div className="sl-ic warn"><Ic k="sun" s={24} c="#fff" /></div><h2>The light was a bit low</h2>
            <p>Your selfie scored <b>68</b> — not clear enough to confirm a match. Nothing is wrong with your application. A home-loan expert will call you in a moment to help.</p></div>
          <div className="info-note"><span className="ni"><Ic k="clock" s={16} /></span><span>Your progress is saved. Typical call-back: under 15 minutes.</span></div>
        </Fragment>}
        {step === 1 && <Fragment>
          <div className="call-card">
            <div className="call-av">PK</div>
            <div className="disp" style={{ fontSize: 17 }}>Priya · Ujjivan Home Loans</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 3 }}>Incoming call · recorded for quality</div>
            <div className="call-actions">
              <button style={{ background: '#C0392B' }} onClick={() => setStep(2)}><Ic k="close" s={20} c="#fff" /></button>
              <button style={{ background: '#12A16B' }} onClick={() => { setStep(2); log('§13', 'Executive called within 15 min · view-only guidance', 'INFO'); }}><Ic k="call" s={20} c="#fff" /></button>
            </div>
          </div>
        </Fragment>}
        {step === 2 && <Fragment>
          <div className="sms"><div className="sh"><b>Priya (on call)</b><span>now</span></div>
            <p>&ldquo;Your selfie was taken in low light. Please stand facing a window. I&rsquo;m sending you a secure link that reopens only the selfie step — I can&rsquo;t take it for you.&rdquo;</p></div>
          <div className="sms"><div className="sh"><b>UJJIVN · SMS</b><span>now</span></div>
            <p>Re-initiate KYC for your home-loan application {DEAL.appId}: <a onClick={() => { log('§13', 'Single-use link (24 h, OTP-bound) — scope: Re-initiate KYC', 'INFO'); onRetry(); }}>ujjivansfb.in/r/7Hq2</a> · valid 24 hrs · do not share.</p></div>
        </Fragment>}
      </div></div>
      {step === 2 && <div className="sub-cta"><button className="btn teal" onClick={() => { log('§13', 'Single-use link (24 h, OTP-bound) — scope: Re-initiate KYC', 'INFO'); onRetry(); }}><Ic k="link" s={16} c="#fff" /> Open secure link</button></div>}
    </div>
  );
}

/* Income & credit: separate consents → AA (or statement upload) → 4 parallel lanes */
const AA_BANKS = [
  { id: 'hdfc', nm: 'HDFC Bank', sub: 'Accounts linked to your mobile', c: '#004C8F', ab: 'H' },
  { id: 'icici', nm: 'ICICI Bank', sub: 'Savings · Current', c: '#AE282E', ab: 'I' },
  { id: 'sbi', nm: 'State Bank of India', sub: 'Savings', c: '#22409A', ab: 'S' },
  { id: 'ujj', nm: 'Ujjivan SFB', sub: 'Savings', c: '#219D83', ab: 'U' },
];
function FinData({ onClose, onDone }) {
  const { sc, log } = useJ();
  const [view, setView] = useState('consent');
  const [cons, setCons] = useState({ bureau: false, aa: false, epfo: false });
  const [bank, setBank] = useState('hdfc'); const [otp, setOtp] = useState(''); const [acct, setAcct] = useState(true);
  const [file, setFile] = useState(false);
  const all = cons.bureau && cons.aa && cons.epfo;
  if (view === 'tamper') return (
    <div className="sub"><Fetching title="Checking your statement" sub="HDFC_Statement_Oct25-Sep26.pdf · 12 months"
      lines={[['PDF metadata & producer', 'BANK-ISSUED'], ['Fonts & layout consistency', 'OK'], ['Recomputed running balances', '0 breaks'], ['Salary credits found', '12 / 12']]}
      onDone={() => { log('F-01', 'AA unavailable → 12-month PDF; tamper score below threshold', 'PASS'); setView('lanes'); }} /></div>
  );
  if (view === 'lanes') return <Lanes onDone={() => setView('res')} />;
  if (view === 'res') return (
    <div className="sub">
      <SubHead title="Income & credit verified" sub="From the sources you approved" tag="SUMMARY" onClose={onClose} />
      <div className="scroll"><div className="sub-body">
        <div className="sub-lede" style={{ marginBottom: 12 }}><div className="sl-ic ok"><Check s={24} /></div><h2>All verified</h2><p>Your declared income matched your bank data — so the estimate you saw holds.</p></div>
        <KV title="What we found" rows={[
          ['Take-home (median, 6 mths)', '₹65,000 · 6/6 credits'], ['Employer', 'Technova Solutions · EPF 12/12'],
          ['Credit score', 'CIBIL 762'], ['Current EMIs', '₹6,500 (personal loan, 14 left)'], ['Token to seller', '₹1,00,000 IMPS · 12 Sep'],
          ['Salary account', `${ARJUN.bank} ${ARJUN.acct} · name 100`]]} />
      </div></div>
      <div className="sub-cta"><button className="btn teal" onClick={() => onDone('CIBIL 762 · salary ₹65,000 verified · EPF active')}>Continue</button></div>
    </div>
  );
  const order = ['consent', 'bank', 'otp', 'disc', 'aaok'];
  const idx = Math.max(0, order.indexOf(view));
  return (
    <div className="sub">
      <SubHead title="Income & credit check" sub="Account Aggregator · read-only" tag="RBI · NBFC-AA" step={idx} total={view === 'down' || view === 'upload' ? 0 : 5}
        onClose={view === 'consent' ? onClose : undefined} onBack={view === 'consent' ? undefined : () => setView(view === 'upload' ? 'down' : view === 'down' ? 'bank' : order[idx - 1])} />
      <div className="scroll"><div className="sub-body">
        {view === 'consent' && <Fragment>
          <div className="sub-lede"><div className="sl-ic"><Ic k="shield" s={24} c="#fff" /></div><h2>Your permission, item by item</h2><p>Each consent is separate and saved with time and purpose. You can withdraw the bank-data consent anytime.</p></div>
          <div className="consents" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '2px 12px' }}>
            <Consent on={cons.bureau} onToggle={() => setCons({ ...cons, bureau: !cons.bureau })}><b>Credit bureau report</b> — a hard enquiry with CIBIL (Experian / CRIF as backup) for this home loan.</Consent>
            <Consent on={cons.aa} onToggle={() => setCons({ ...cons, aa: !cons.aa })}><b>Bank statements via Account Aggregator</b> — 12 months of deposit-account data, one-time fetch, for loan underwriting. Consent expires in 30 days.</Consent>
            <Consent on={cons.epfo} onToggle={() => setCons({ ...cons, epfo: !cons.epfo })}><b>EPFO / UAN</b> — employer and last six PF contributions.</Consent>
          </div>
          <div className="center"><DemoChip onClick={() => setCons({ bureau: true, aa: true, epfo: true })}>Tick all three</DemoChip></div>
        </Fragment>}
        {view === 'bank' && <Fragment>
          <div className="sub-lede"><div className="sl-ic"><Ic k="bank" s={24} c="#fff" /></div><h2>Where does your salary come in?</h2><p>Pick that bank. We&rsquo;ll never ask for your net-banking password.</p></div>
          <div className="choice">{AA_BANKS.map((b) => (
            <div key={b.id} className={'choice-card' + (bank === b.id ? ' sel' : '')} onClick={() => setBank(b.id)}>
              <div className="bank-mark" style={{ background: b.c }}>{b.ab}</div>
              <div className="cc-body"><div className="cc-t">{b.nm}</div><div className="cc-d">{b.sub}</div></div><div className="radio" />
            </div>))}</div>
        </Fragment>}
        {view === 'down' && <Fragment>
          <div className="sub-lede"><div className="sl-ic warn"><Ic k="alert" s={24} c="#fff" /></div><h2>HDFC Bank isn&rsquo;t responding on Account Aggregator</h2><p>We tried twice and the backup route. You can upload a bank-issued e-statement instead — it takes a minute.</p></div>
          <div className="choice">
            <div className="choice-card or" onClick={() => setView('upload')}><div className="cc-ic"><Ic k="upload" s={20} /></div><div className="cc-body"><div className="cc-t">Upload 12-month e-statement (PDF)</div><div className="cc-d">Download it from net banking. Password-protected files are fine.</div></div><Ic k="chev" s={16} c="var(--faint)" /></div>
            <div className="choice-or">OR</div>
            <div className="choice-card" onClick={() => setView('bank')}><div className="cc-ic"><Ic k="bank" s={20} /></div><div className="cc-body"><div className="cc-t">Try another bank</div><div className="cc-d">If your salary also lands elsewhere.</div></div><Ic k="chev" s={16} c="var(--faint)" /></div>
          </div>
        </Fragment>}
        {view === 'upload' && <Fragment>
          <div className="sub-lede"><h2 style={{ fontSize: 18 }}>Upload your e-statement</h2><p>Original PDF from {ARJUN.bank}, last 12 months. We check it for tampering automatically.</p></div>
          <div className={'doc-row' + (file ? ' done' : '')}>
            <div className="di"><Ic k={file ? 'check' : 'doc'} s={18} /></div>
            <div className="dn"><b>{file ? 'HDFC_Statement_Oct25-Sep26.pdf' : 'No file chosen'}</b><span>{file ? '412 KB · 38 pages' : 'PDF up to 10 MB'}</span></div>
            {!file && <button className="mini-btn" onClick={() => setFile(true)}>Choose file</button>}
          </div>
        </Fragment>}
        {view === 'otp' && <Fragment>
          <div className="otp-sent">Enter the OTP from your Account Aggregator, sent to<br /><b>{ARJUN.mobileMasked}</b></div>
          <OtpRow value={otp} onChange={setOtp} /><ResendLine />
        </Fragment>}
        {view === 'disc' && <Fragment>
          <div className="sub-lede"><div className="sl-ic ok"><Check s={24} /></div><h2>Accounts found</h2><p>Choose the account your salary comes into.</p></div>
          <div className={'choice-card' + (acct ? ' sel' : '')} onClick={() => setAcct(!acct)}><Cbox on={acct} /><div className="cc-body"><div className="cc-t">Savings account</div><div className="cc-d mono">{ARJUN.bank} · {ARJUN.acct}</div></div></div>
        </Fragment>}
        {view === 'aaok' && <Fragment>
          <div className="consent-panel">
            <div className="cp-head"><div className="cp-logo"><Ic k="bank" s={17} c="#fff" /></div><div><div className="cp-ht">Ujjivan Small Finance Bank</div><div className="cp-hs">requests via your Account Aggregator</div></div></div>
            {[['What', 'Deposit-account statements (transactions & balances)'], ['Account', `${ARJUN.bank} ${ARJUN.acct}`], ['Period', 'Last 12 months'], ['Purpose', 'Loan underwriting'], ['Frequency', 'One-time fetch'], ['Consent expires', '30 days']].map(([k, v]) =>
              <div className="cp-row" key={k}><span className="cp-k">{k}</span><span className="cp-v">{v}</span></div>)}
          </div>
          <div className="foot-note">Revoke anytime from your AA app — we&rsquo;ll stop and delete the fetched data as the consent requires.</div>
        </Fragment>}
      </div></div>
      {view === 'consent' && <div className="sub-cta"><button className={'btn teal' + (all ? '' : ' off')} onClick={() => all && setView('bank')}>Continue</button></div>}
      {view === 'bank' && <div className="sub-cta"><button className="btn teal" onClick={() => setView(sc === 'aaDown' && bank === 'hdfc' ? 'down' : 'otp')}>Continue with {AA_BANKS.find((b) => b.id === bank).nm}</button></div>}
      {view === 'upload' && <div className="sub-cta"><button className={'btn teal' + (file ? '' : ' off')} onClick={() => file && setView('tamper')}>Upload &amp; verify</button></div>}
      {view === 'otp' && <div className="sub-cta"><button className={'btn teal' + (otp.length === 6 ? '' : ' off')} onClick={() => otp.length === 6 && setView('disc')}>Verify</button></div>}
      {view === 'disc' && <div className="sub-cta"><button className={'btn teal' + (acct ? '' : ' off')} onClick={() => acct && setView('aaok')}>Continue</button></div>}
      {view === 'aaok' && <div className="sub-cta"><button className="btn teal" onClick={() => setView('lanes')}><Ic k="shield" s={16} c="#fff" /> Approve &amp; share</button></div>}
    </div>
  );
}

/* Stage 2 parallel orchestration — 4 lanes, 1 gate */
function Lanes({ onDone }) {
  const { log } = useJ();
  const L = [
    { t: 'Identity', items: [['CKYC', 'FOUND', 1], ['OKYC', 'MATCH', 2], ['Face', 'PASS', 3]] },
    { t: 'Bureau', items: [['CIBIL', '762', 2], ['DPD 24m', '0', 3], ['Enquiries 3m', '1', 4]] },
    { t: 'Banking · AA', items: [['Salary 6/6', '₹65,000', 3], ['Bounces', '0', 5], ['Token', '₹1L', 6]] },
    { t: 'Employment & checks', items: [['EPFO', '12/12', 2], ['Penny drop', '100', 4], ['Screening', 'CLEAR', 5]] },
  ];
  const [t, setT] = useState(0);
  useEffect(() => {
    if (t > 7) {
      [['B-01', 'Bureau hit, PAN match', 'PASS'], ['B-02', 'CIBIL 762 (green)', 'PASS'], ['B-03', 'No current overdue', 'PASS'], ['B-04', '0 DPD in 24 months', 'PASS'], ['B-05', 'No derogatory', 'PASS'], ['B-06', '1 enquiry in 3 months', 'PASS'], ['B-07', 'Unsecured ₹1.08L ≤ 12× income', 'PASS'],
        ['F-02', 'Salary 6/6, same employer, variance <1%', 'PASS'], ['F-03', 'AA median ₹65,000 = declared', 'PASS'], ['F-04', '0 bounces', 'PASS'], ['F-05', 'No hidden NACH debits', 'PASS'], ['F-06', 'Cash 2.1%, no circular flow', 'PASS'], ['F-07', 'ABB ₹41,200 ≥ 1 EMI', 'PASS'], ['F-08', 'Balance ₹4.13L + token ≥ 50% own contribution', 'PASS'], ['F-09', 'IMPS ₹1,00,000 → SURESH K JAIN', 'PASS'], ['F-10', 'AA holder name 100', 'PASS'], ['F-11', 'Penny-drop name 100, same a/c', 'PASS'],
        ['E-01', 'EPFO establishment match 94, last contribution Sep-26', 'PASS'], ['K-08', 'Sanctions / wilful defaulter / suit-filed: no hit', 'PASS'], ['K-10', 'Telco name score ≥ 70', 'PASS']].forEach(([a, b, c]) => log(a, b, c));
      const x = setTimeout(onDone, 900); return () => clearTimeout(x);
    }
    const x = setTimeout(() => setT(t + 1), 520); return () => clearTimeout(x);
  }, [t]);
  return (
    <div className="sub"><div className="fetching" style={{ paddingTop: 40 }}>
      <div className="ft-ring" />
      <h2>Building your financial profile</h2>
      <div className="ft-sub">Four checks run in parallel — as long as the slowest one</div>
      <div className="lanes">
        {L.map((l) => {
          const done = l.items.every((i) => t >= i[2]);
          return (
            <div key={l.t} className={'lane' + (done ? ' done' : '')}>
              <div className="lh">{l.t}{done ? <Check s={12} /> : <span className="mini-spin" />}</div>
              <div className="ll">{l.items.map(([n, v, at]) => <div key={n} className={'li' + (t >= at ? ' on' : '')}><span>{n}</span><b>{t >= at ? v : '…'}</b></div>)}</div>
            </div>
          );
        })}
      </div>
      <div className="gate">{t > 6 ? <Check s={11} /> : <span className="mini-spin" />} Gate · {t > 6 ? 'all lanes reported' : 'waiting for all lanes'}</div>
    </div></div>
  );
}
