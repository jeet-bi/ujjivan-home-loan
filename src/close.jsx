/* Stages 5–7 — KFS & final offer, e-sign + e-NACH, pre-disbursement checks, registration day, disbursal */

function FinalOffer({ go }) {
  const { sc, data, log } = useJ();
  const d = dealFor(sc, data.ask || DEAL.ask, data.tenure || DEAL.tenureYrs);
  const [read, setRead] = useState(false); const [ack, setAck] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false); const [otp, setOtp] = useState('');
  const [lang, setLang] = useState('EN');
  const onScroll = (e) => { const el = e.target; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) setRead(true); };
  const row = (k, v) => <tr key={k}><td>{k}</td><td>{v}</td></tr>;
  const sec = (t) => <tr className="sec" key={t}><td colSpan="2">{t}</td></tr>;
  return (
    <div className="app">
      <div className="o2-hero" style={{ paddingBottom: 18 }}>
        <div className="o2-top"><div className="o2-back" onClick={() => go('cleared')}><Ic k="back" s={15} c="#fff" /></div><div className="o2-eyebrow">FINAL OFFER · STAGE 5</div><div style={{ width: 32 }} /></div>
        <div className="o2-approved" style={{ marginTop: 14 }}>Your sanctioned home loan</div>
        <div className="o2-amount">{inr(d.sanctioned)}</div>
        <div className="o2-meta"><span>EMI <b>{inr(d.emi)}</b></span><span>{TERMS.cardRate}% · <b>{d.m} mo</b></span><span>APR <b>{d.apr.toFixed(2)}%</b></span></div>
      </div>
      <div className="scroll" onScroll={onScroll}><div className="o2-body">
        <div className="info-note" style={{ marginBottom: 12 }}><span className="ni"><Ic k="info" s={16} /></span><span>Please read the Key Facts Statement to the end. These terms are held for you until <b>16 Oct 2026</b> (3 working days) — no need to decide right now.</span></div>
        <div className="kfs-doc">
          <div className="kh"><b>{lang === 'EN' ? 'Key Facts Statement' : lang === 'HI' ? 'मुख्य तथ्य विवरण' : 'मुख्य तथ्य विवरणपत्र'}</b>
            <div className="lang">{['EN', 'HI', 'MR'].map((l) => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l === 'EN' ? 'English' : l === 'HI' ? 'हिन्दी' : 'मराठी'}</button>)}</div></div>
          <table><tbody>
            {row('Proposal number', <span className="mono">{TERMS.kfsNo}</span>)}{row('Issued / valid till', '13 Oct 2026 / 16 Oct 2026')}
            {sec('Loan')}{row('Sanctioned amount', inr(d.sanctioned))}{row('Tenure', `${d.m} months`)}
            {row('Interest rate', `${TERMS.cardRate}% p.a. floating`)}{row('Benchmark & reset', 'External benchmark · reset quarterly')}
            {row('EMI', `${inr(d.emi)} × ${d.m}`)}{row('First EMI', TERMS.firstEmi)}
            {sec('Charges (all of them)')}{row('Processing fee', `${inr(TERMS.pf)} + GST ${inr(TERMS.gst)}`)}{row('Legal & technical', '₹0 — absorbed by Ujjivan')}
            {row('Stamp duty on loan agreement', 'As per Maharashtra schedule')}{row('CERSAI registration', 'At actuals')}
            {row('Prepayment / foreclosure', 'Nil (floating rate, individual)')}{row('Annual Percentage Rate (APR)', `${d.apr.toFixed(2)}%`)}
            {sec('Your rights')}{row('Cooling-off period', `${TERMS.coolingOffDays} days — exit by repaying principal + proportionate APR, no penalty`)}
            {row('Insurance', 'Optional — not a condition of this loan')}{row('Disbursal', `Directly to ${d.split.map((s) => s.to).join(' then ')}`)}
            {row('Recovery', 'Ujjivan staff only · no recovery agents for current accounts')}{row('Grievance officer', 'Nodal GRO · escalate to RBI Ombudsman after 30 days')}
          </tbody></table>
        </div>
        <div className="slider-card">
          <div className="sh"><span style={{ color: 'var(--ink)', fontWeight: 700 }}>Home & life cover (optional)</span><span className="tk-tag">Separate</span></div>
          <div className="hint">Offered on its own — saying no won&rsquo;t change your loan.</div>
        </div>
        <div className="consents" style={{ marginTop: 10, opacity: read ? 1 : .45 }}>
          <Consent on={ack} onToggle={() => read && setAck(!ack)}>I have read the Key Facts Statement ({TERMS.kfsNo}) and understood all charges and the APR.</Consent>
        </div>
        {!read && <div className="hint" style={{ textAlign: 'center' }}>Scroll to the end to continue</div>}
        <div style={{ height: 6 }} />
      </div></div>
      <div className="cta-bar"><button className={'btn' + (ack ? '' : ' off')} onClick={() => ack && setOtpOpen(true)}>Accept offer with OTP</button></div>
      {otpOpen && (
        <Sheet onClose={() => setOtpOpen(false)}>
          <h3>Accept your offer</h3>
          <p className="lede">Enter the OTP sent to <b>{ARJUN.mobileMasked}</b>. This accepts KFS {TERMS.kfsNo}; it becomes the first schedule of your loan agreement.</p>
          <OtpRow value={otp} onChange={setOtp} />
          <div style={{ height: 14 }} />
          <button className={'btn' + (otp.length === 6 ? '' : ' off')} onClick={() => {
            if (otp.length !== 6) return;
            log('O-01', 'Bureau & AA ≤ 30 days old — no refresh needed', 'PASS'); log('O-02', `Final LTV ${d.ltv.toFixed(0)}% · FOIR ${d.foir.toFixed(1)}%`, 'PASS');
            log('O-03', `KFS ${TERMS.kfsNo} · APR ${d.apr.toFixed(2)}% · valid 3 working days`, 'PASS'); log('O-04', 'Accepted by OTP · read-checkbox logged', 'PASS'); go('sign');
          }}>Accept</button>
        </Sheet>
      )}
    </div>
  );
}

function SignHub({ go }) {
  const { sc, data, set } = useJ();
  const d = dealFor(sc, data.ask || DEAL.ask, data.tenure || DEAL.tenureYrs);
  const [open, setOpen] = useState(null);
  const st = data.sign || {};
  const save = (k, v) => { set({ sign: { ...st, [k]: v } }); setOpen(null); };
  if (open === 'esign') return <ESign d={d} onClose={() => setOpen(null)} onDone={(v) => save('esign', v)} />;
  if (open === 'enach') return <ENach d={d} onClose={() => setOpen(null)} onDone={(v) => save('enach', v)} />;
  const n = (st.esign ? 1 : 0) + (st.enach ? 1 : 0);
  return (
    <div className="app">
      <FlowHeader title="Sign & set up auto-pay" sub="One sitting · about 3 minutes" stepNo="Stage 6 / 7" pct={88} onBack={() => go('final')} />
      <div className="scroll"><div className="flow-body">
        <div className="hub-intro">Your loan documents are signed digitally with Aadhaar. The <b>sale deed</b> itself is signed in person at the sub-registrar — the law requires that.</div>
        <HubProgress done={n} total={2} />
        <Task icon="sign" name="Sign loan documents" tag="Aadhaar e-sign" desc="Agreement, KFS, MITC and your payment instruction." done={st.esign} onOpen={() => setOpen('esign')} />
        <Task icon="wallet" name="Set up EMI auto-pay" tag="e-NACH" desc={`From your ${ARJUN.bank} salary account.`} done={st.enach} onOpen={() => setOpen('enach')} />
        <div className="kv-title" style={{ marginTop: 14 }}>Where your loan money goes</div>
        {d.split.map((s) => (
          <div className="person" key={s.to}><div className={'av' + (s.to === DEAL.seller ? ' or' : '')}>{s.to === DEAL.seller ? 'SJ' : 'SB'}</div>
            <div className="pn"><b>{s.to}</b><span className="mono">{s.ac}</span><span style={{ display: 'block' }}>{s.note}</span></div>
            <b className="disp" style={{ fontSize: 15 }}>{inr(s.amt)}</b></div>
        ))}
        <div className="info-note"><span className="ni"><Ic k="lock" s={16} /></span><span>Payee details are locked once you sign. Any request to change them later — new account, part cash, someone else — is treated as fraud and stops the payout.</span></div>
      </div></div>
      <HelpFab />
      <div className="cta-bar"><button className={'btn' + (n === 2 ? '' : ' off')} onClick={() => n === 2 && go('dcheck')}>{n === 2 ? 'Get disbursement-ready' : 'Complete both to continue'}</button></div>
    </div>
  );
}

function ESign({ d, onClose, onDone }) {
  const { log } = useJ();
  const [view, setView] = useState('pack'); const [otp, setOtp] = useState('');
  const docs = ['Sanction letter', `Key Facts Statement ${TERMS.kfsNo} (annexed)`, `Loan agreement · e-stamped ${TERMS.estamp}`, 'Most Important Terms & Conditions',
    'Undertaking to deposit original title deeds', 'e-NACH authorisation', 'End-use declaration (purchase of House 18)', `Disbursement request · ${d.split.length} payee${d.split.length > 1 ? 's' : ''}`];
  if (view === 'signing') return (
    <div className="sub"><Fetching title="Signing your documents" sub="Licensed e-Sign service provider · Aadhaar OTP"
      lines={[['e-Stamp certificate verified', TERMS.estamp.slice(-6)], ['Document hash sealed', '9a3f…c1'], ['Aadhaar e-signature applied', 'SIGNED'], ['Signer: name · last-4 · birth year', 'MATCH'], ['Registered on NeSL (DDE)', 'DONE']]}
      onDone={() => { log('S-00', `KFS ${TERMS.kfsNo} accepted in window · envelope terms = KFS`, 'PASS'); log('S-04', 'e-Stamp certificate valid · Maharashtra schedule', 'PASS'); log('S-01', 'Cert name 100 · Aadhaar last-4 4821 · YOB 1994', 'PASS'); log('S-02', 'Post-sign hash = pre-sign hash', 'PASS'); log('S-03', 'All parties signed (sole applicant)', 'PASS'); setView('done'); }} /></div>
  );
  if (view === 'done') return <SubDone title="Documents signed" line="Signed copies are in your email and on this page. Your registration on NeSL is complete." chip="Aadhaar e-sign · NeSL registered" cta="Continue" onDone={() => onDone('8 documents signed · NeSL registered')} />;
  return (
    <div className="sub">
      <SubHead title="Sign loan documents" sub="Aadhaar OTP e-sign" tag="E-SIGN" step={view === 'pack' ? 0 : 1} total={2} onClose={view === 'pack' ? onClose : undefined} onBack={view === 'otp' ? () => setView('pack') : undefined} />
      <div className="scroll"><div className="sub-body">
        {view === 'pack' ? <Fragment>
          <div className="kv-title">Your document pack</div>
          {docs.map((t) => <div className="doc-row done" key={t}><div className="di"><Ic k="doc" s={17} /></div><div className="dn"><b style={{ fontSize: 13 }}>{t}</b></div><Ic k="chev" s={15} c="var(--faint)" /></div>)}
          <KV title="You're agreeing to" rows={[['Loan', inr(d.sanctioned)], ['EMI', `${inr(d.emi)} × ${d.m}`], ['APR', `${d.apr.toFixed(2)}%`]]} />
        </Fragment> : <Fragment>
          <div className="otp-sent">Enter the Aadhaar OTP sent to the mobile linked with Aadhaar <b>XXXX XXXX 4821</b></div>
          <OtpRow value={otp} onChange={setOtp} /><ResendLine />
          <div className="foot-note" style={{ marginTop: 14 }}>OTP not arriving? You can sign with a video-KYC-backed digital signature or at a branch.</div>
        </Fragment>}
      </div></div>
      <div className="sub-cta">
        {view === 'pack' ? <button className="btn teal" onClick={() => setView('otp')}><Ic k="sign" s={16} c="#fff" /> Sign with Aadhaar</button>
          : <button className={'btn teal' + (otp.length === 6 ? '' : ' off')} onClick={() => otp.length === 6 && setView('signing')}>Sign all documents</button>}
      </div>
    </div>
  );
}

function ENach({ d, onClose, onDone }) {
  const { sc, log } = useJ();
  const [acc, setAcc] = useState(sc === 'repayDiff' ? 'alt' : 'sal');
  const [view, setView] = useState('acct'); const [mode, setMode] = useState('nb');
  const alt = acc === 'alt';
  const acctLabel = alt ? `${ARJUN.altBank} ${ARJUN.altAcct}` : `${ARJUN.bank} ${ARJUN.acct}`;
  if (view === 'rpd') return (
    <div className="sub"><Fetching title="Confirming the account is yours" sub="Reverse penny drop · ₹1 via UPI"
      lines={[['₹1 received from UPI', 'arjun.m@icici'], ['Payer name per bank', 'ARJUN RAMESH MEHTA'], ['Name vs your PAN', 'match 100'], ['Monthly top-up from salary a/c', '₹25,000']]}
      onDone={() => { log('F-12', 'Repayment a/c ≠ AA income a/c → same holder via reverse penny drop; funded monthly', 'PASS'); log('N-01', 'Mandate on ICICI ••9150 tagged NON_SALARY (pre-EMI balance alert)', 'FLAG'); setView('mandate'); }} /></div>
  );
  if (view === 'auth') return (
    <div className="sub"><Fetching slate title={`Authorising with ${alt ? ARJUN.altBank : ARJUN.bank}`} sub="NPCI API e-mandate"
      lines={[[mode === 'nb' ? 'Net-banking login' : 'Debit card + OTP', 'OK'], ['Mandate details confirmed', inr(d.mandateMax)], ['NPCI status', 'ACCEPTED']]}
      onDone={() => { log('N-02', `NPCI ACCEPTED · UMRN ${TERMS.umrn.slice(0, 8)}…`, 'PASS'); log('N-03', 'Bank live for API e-NACH', 'PASS'); log('N-04', `Max ${inr(d.mandateMax)} = 1.5 × EMI`, 'PASS'); setView('done'); }} /></div>
  );
  if (view === 'done') return <SubDone title="Auto-pay is set up" line={`Your EMI of ${inr(d.emi)} will be collected from ${acctLabel} from ${TERMS.firstEmi}.`} chip={`UMRN ${TERMS.umrn.slice(0, 10)}…`} cta="Continue" onDone={() => onDone(`e-NACH on ${acctLabel} · accepted`)} />;
  return (
    <div className="sub">
      <SubHead title="EMI auto-pay" sub="e-NACH mandate" tag="NPCI" step={view === 'acct' ? 0 : 1} total={2} onClose={view === 'acct' ? onClose : undefined} onBack={view === 'mandate' ? () => setView('acct') : undefined} />
      <div className="scroll"><div className="sub-body">
        {view === 'acct' ? <Fragment>
          <div className="sub-lede"><h2 style={{ fontSize: 19 }}>Which account should pay your EMI?</h2><p>Your salary account is already verified, so it&rsquo;s the quickest.</p></div>
          <div className="choice">
            <div className={'choice-card' + (!alt ? ' sel' : '')} onClick={() => setAcc('sal')}><div className="bank-mark" style={{ background: '#004C8F' }}>H</div>
              <div className="cc-body"><div className="cc-t">{ARJUN.bank} · salary</div><div className="cc-d mono">{ARJUN.acct} · verified via AA</div></div><div className="radio" /></div>
            <div className={'choice-card' + (alt ? ' sel' : '')} onClick={() => setAcc('alt')}><div className="bank-mark" style={{ background: '#AE282E' }}>I</div>
              <div className="cc-body"><div className="cc-t">A different account</div><div className="cc-d">{ARJUN.altBank} {ARJUN.altAcct} · needs a ₹1 check</div></div><div className="radio" /></div>
          </div>
          {alt && <div className="info-note" style={{ marginTop: 12 }}><span className="ni"><Ic k="info" s={16} /></span><span>We&rsquo;ll confirm it&rsquo;s in your name by asking you to send ₹1 by UPI from it. It must also get regular money in, so EMIs don&rsquo;t bounce.</span></div>}
        </Fragment> : <Fragment>
          <KV title="Mandate details" rows={[['Account', acctLabel, 1], ['Maximum per debit', `${inr(d.mandateMax)} (1.5× EMI, covers rate resets)`], ['Frequency', 'As and when presented'], ['Starts', 'Nov 2026'], ['Ends', 'Oct 2047 (tenure + 12 months)'], ['Collected by', 'Ujjivan SFB directly']]} />
          <div className="kv-title">Authorise with</div>
          <Seg value={mode} onChange={setMode} options={[{ v: 'nb', l: 'Net banking' }, { v: 'dc', l: 'Debit card' }]} />
        </Fragment>}
      </div></div>
      <div className="sub-cta">
        {view === 'acct' ? <button className="btn teal" onClick={() => setView(alt ? 'rpd' : 'mandate')}>{alt ? 'Send ₹1 by UPI' : 'Continue'}</button>
          : <button className="btn teal" onClick={() => setView('auth')}>Authorise mandate</button>}
      </div>
    </div>
  );
}

function DCheck({ go }) {
  const { sc, log } = useJ();
  const chips = Array.from({ length: 18 }, (_, i) => 'D-' + String(i + 1).padStart(2, '0'));
  return <Engine eyebrow="PRE-DISBURSEMENT · MAKER = SYSTEM, CHECKER = ENGINE" title="Getting you disbursement-ready" chips={chips} unit="checks passed" total={4600}
    stages={[{ t: 'Freshness', d: 'Sanction validity, bureau & salary refresh, fraud re-check' }, { t: 'Signatures & mandate', d: 'S-01…S-04, NPCI ACCEPTED' },
      { t: 'Property & payee', d: 'P-rules final, payee = verified account, takeover split' }, { t: 'Registration & draft deed', d: 'Slot booked, draft deed matches agreement' }, { t: 'Ledger & compliance', d: 'Loan account, schedule, screening ≤ 24 h' }]}
    onDone={() => {
      [['D-01', 'Sanction valid (day 12 of 45)'], ['D-02', 'Bureau re-pull: no new loan or DPD'], ['D-03', 'Oct salary credited by Technova'], ['D-04', 'No new negative hit'],
        ['D-05', 'All signatures valid'], ['D-06', 'Mandate live'], ['D-07', 'Legal & technical reports final'], ['D-08', 'Own contribution held in HDFC ••4417'],
        ['D-09', 'Payee = penny-drop verified account'], ['D-10', sc === 'sellerLoan' ? `Split: ${SELLER_LENDER.name} first, balance to seller` : 'No takeover — single payee'],
        ['D-11', 'Sub-registrar slot fixed · draft deed vetted'], ['D-12', 'Draft deed parties, schedule, price match'], ['D-13', 'Processing fee + GST collected'],
        ['D-14', 'Insurance opted out'], ['D-15', 'Amount ≤ sanction ≤ LTV cap'], ['D-16', 'RTGS to payee'], ['D-17', 'Loan account & schedule created'], ['D-18', 'KFS ack, consents, screening ≤ 24 h']]
        .forEach(([a, b]) => log(a, b, a === 'D-10' && sc === 'sellerLoan' ? 'FLAG' : 'PASS'));
      log('S7', 'DISBURSEMENT_READY', 'PASS'); go('reg');
    }} />;
}

function Registration({ go }) {
  const { sc, data, log } = useJ();
  const d = dealFor(sc, data.ask || DEAL.ask, data.tenure || DEAL.tenureYrs);
  const R = TERMS.registration;
  const [live, setLive] = useState(false); const [t, setT] = useState(0);
  const steps = [['Sale deed registered', 'You and the seller sign before the sub-registrar'], ['Originals handed over', '2026 sale deed · 2011 gift deed · 1998 allotment — against acknowledgement'],
    ['Deeds scanned & matched', 'OCR match with the vetted draft: 98'], ['Payee re-verified', 'Penny drop on the seller’s account · same name'], ['RTGS released', 'From the pre-approved queue · within 15 min']];
  useEffect(() => {
    if (!live) return;
    if (t >= steps.length) { log('REG', 'OCR match 98 ≥ 95 · D-09 penny drop re-run < 24 h', 'PASS'); const x = setTimeout(() => go('done'), 700); return () => clearTimeout(x); }
    const x = setTimeout(() => setT(t + 1), 1000); return () => clearTimeout(x);
  }, [live, t]);
  return (
    <div className="app">
      <FlowHeader title="You're disbursement-ready" sub="All 18 checks passed" stepNo="Stage 7 / 7" pct={96} />
      <div className="scroll"><div className="flow-body">
        {!live ? <Fragment>
          <div className="sub-lede"><div className="sl-ic ok"><Check s={24} /></div><h2>See you at the sub-registrar</h2>
            <p>Our executive meets you and the seller there. The money goes to the seller only after the deed is registered — never to your account.</p></div>
          <KV title="Appointment" rows={[['Where', R.office], ['When', `${R.date} · ${R.time}`], ['Ujjivan executive', `${R.exec} · ${R.execPh}`]]} />
          <div className="kv-title">Bring with you</div>
          <div className="bens" style={{ marginBottom: 14 }}>
            {['PAN and Aadhaar (originals)', `Proof of your own contribution — ${inr(d.own)} (₹1 lakh token already paid)`, 'Stamp duty and registration fee payment receipt', 'Two passport photos'].map((x) =>
              <div className="ben" key={x}><span className="tick"><Check s={11} /></span>{x}</div>)}
          </div>
          <div className="kv-title">Payout on the day</div>
          <div className="kv-card">{d.split.map((s) => <div className="r" key={s.to}><span className="k">{s.to}</span><span className="v">{inr(s.amt)}</span></div>)}</div>
          <div className="hint">Registration postponed? Just tell us — we hold the funds and re-check sanction validity and your bureau report on the new date.</div>
        </Fragment> : <Fragment>
          <div className="sub-lede"><h2>Registration day · live</h2><p>{R.office}</p></div>
          <div className="tl">{steps.map(([a, b], i) => <div key={a} className={'tl-i' + (i < t ? ' done' : i === t ? ' on' : '')}><div className="dot">{i < t && <Check s={10} />}</div><b>{a}</b><span>{b}</span></div>)}</div>
        </Fragment>}
      </div></div>
      {!live && <div className="cta-bar"><button className="btn" onClick={() => setLive(true)}>It&rsquo;s registration day →</button></div>}
    </div>
  );
}

function Done({ restart }) {
  const { sc, data } = useJ();
  const d = dealFor(sc, data.ask || DEAL.ask, data.tenure || DEAL.tenureYrs);
  return (
    <div className="app">
      <div className="scroll"><div className="done-wrap" style={{ justifyContent: 'flex-start', paddingTop: 30 }}>
        <div className="ring-ok"><Check s={40} /></div>
        <h2>Congratulations, {ARJUN.first} — it&rsquo;s your home!</h2>
        <p>Your loan has been paid {d.split.length > 1 ? 'to the seller’s lender and the seller' : 'to the seller'} by RTGS.</p>
        <div className="disb-card">
          <div className="dl">Loan disbursed</div><div className="da">{inr(d.sanctioned)}</div>
          {d.split.map((s) => <div className="disb-line" key={s.to}><span>{s.to}</span><b>{inr(s.amt)}</b></div>)}
          <div className="disb-line"><span>UTR</span><b>{TERMS.utr}</b></div>
        </div>
        <div style={{ width: '100%', textAlign: 'left' }}>
          <KV title="Your loan" rows={[['Loan account', TERMS.loanAc, 1], ['EMI', `${inr(d.emi)} from ${TERMS.firstEmi}`], ['Auto-pay', `UMRN ${TERMS.umrn.slice(0, 12)}…`], ['Prepayment', 'Free, anytime']]} />
          <KV title="Your original papers" rows={[['Stored in', `Ujjivan vault · ${TERMS.vault}`], ['Mortgage', 'Deposit of title deeds · CERSAI filed within 30 days'], ['Returned to you', 'Within 30 days of closing the loan']]} />
          <button className="btn teal"><Ic k="download" s={16} c="#fff" /> Welcome kit, schedule &amp; KFS copy</button>
          <button className="btn ghost" onClick={restart}>Restart prototype</button>
        </div>
      </div></div>
    </div>
  );
}
