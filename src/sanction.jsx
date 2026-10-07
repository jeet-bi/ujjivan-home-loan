/* Stage 3 — four-layer underwriting engine → in-principle sanction */

const RULE_CHIPS = ['K-01', 'K-04', 'B-03', 'B-05', 'KO-FRAUD', 'KO-PAN', 'BUREAU', 'REPAY', 'APPETITE', 'BANKING', 'FOIR', 'RESIDUAL', 'LTV', 'EMPLOY', 'EMPLOYER', 'RESIDENCE', 'FOIR-LOAN', 'LTV-LOAN', 'CAP', 'DEV-01', 'DEV-02', 'FRAUD-SC', 'TRIANG'];

function Underwrite({ go }) {
  const { log } = useJ();
  return <Engine eyebrow="UJJIVAN DECISION ENGINE · HL-BRE-4.2" title="Deciding your in-principle sanction" chips={RULE_CHIPS} unit="checks run" total={5200}
    stages={[
      { t: 'Layer 1 · Knock-outs', d: 'KYC, fraud, sanctions, current overdue, derogatory' },
      { t: 'Layer 2 · Risk scorecard', d: '10 factors · 1,000 points from verified data only' },
      { t: 'Layer 3 · Eligibility', d: 'Smaller of what your salary repays and what the house allows' },
      { t: 'Layer 4 · Deviation check', d: 'No exceptions needed → straight-through' },
      { t: 'Issuing your sanction', d: 'Non-binding · valid 45 days' },
    ]}
    onDone={() => {
      log('L1', 'No knock-out hit (KYC, fraud, sanctions, B-03, B-05, multiple PAN)', 'PASS');
      log('L2', 'Scorecard 740 / 1,000 → Grade B (10 short of A)', 'PASS');
      log('L3', 'FOIR loan ₹33.1L · LTV loan ₹22.5L · ask ₹20L → ₹20L', 'PASS');
      log('L4', 'No deviation required', 'PASS');
      log('FRAUD', 'Vendor fraud score < 400 · triangulation no field < 70', 'PASS');
      log('S3', 'APPROVE_STP — in-principle sanction issued', 'PASS');
      go('ips');
    }} />;
}

function InPrinciple({ go }) {
  const { data } = useJ();
  const ask = data.ask || DEAL.ask, ten = data.tenure || DEAL.tenureYrs, m = ten * 12;
  const amt = Math.min(ask, ltvCap(DEAL.price) * DEAL.price);
  const emi = emiFor(amt, TERMS.cardRate, m);
  const capacity = (foirCap(ARJUN.net) / 100 * ARJUN.net - ARJUN.existingEmi) / emiPerLakh(TERMS.cardRate, m) * 1e5;
  return (
    <div className="app">
      <div className="o2-hero">
        <div className="o2-top"><div className="o2-back" onClick={() => go('kyc')}><Ic k="back" s={15} c="#fff" /></div><div className="o2-eyebrow">IN-PRINCIPLE SANCTION</div><div style={{ width: 32 }} /></div>
        <div className="o2-matched"><span className="o2-pulse" /> Decided in 4 min 52 s · no human review needed</div>
        <div className="o2-approved">Congratulations {ARJUN.first}, you&rsquo;re approved for</div>
        <div className="o2-amount">{inr(amt)}</div>
        <div className="o2-amtlabel">home loan · subject to property clearance</div>
        <div className="o2-meta"><span>Valid till <b>21 Nov 2026</b></span><span>Ref <b className="mono" style={{ fontSize: 12 }}>{DEAL.appId}</b></span></div>
      </div>
      <div className="scroll"><div className="o2-body">
        <div className="o2-terms">
          <div className="o2-term"><div className="o2-tk">Rate</div><div className="o2-tv">{TERMS.cardRate}%</div><div className="o2-ts">floating · reset quarterly</div></div>
          <div className="o2-term"><div className="o2-tk">Tenure</div><div className="o2-tv">{m} mo</div><div className="o2-ts">{ten} years</div></div>
          <div className="o2-term"><div className="o2-tk">EMI</div><div className="o2-tv">{inr(emi)}</div><div className="o2-ts">per month</div></div>
        </div>
        <details className="why" style={{ marginTop: 12 }}>
          <summary>How we decided <Ic k="chev" s={16} /></summary>
          <div className="wb">
            <KV rows={[
              ['Your salary can repay up to', lakh(capacity)], ['The house allows (90% of ₹25L)', lakh(0.9 * DEAL.price)],
              ['You asked for', lakh(ask)], ['EMIs after this loan', `${Math.round((emi + ARJUN.existingEmi) / ARJUN.net * 100)}% of take-home`],
              ['…once your personal loan ends', `${Math.round(emi / ARJUN.net * 100)}% (in ${ARJUN.plLeft} months)`], ['Risk grade', `${TERMS.grade} · ${TERMS.score}/1,000`]]} />
            <div className="hint">You were 10 points short of Grade A (8.50%). Paying off the personal loan early would help at your next rate review.</div>
          </div>
        </details>
        <div className="o2-sec">Next: we check the house and the seller</div>
        <div className="bens">
          {[['Upload the property papers you have', 'Agreement to sell, seller’s sale deed, tax receipt…'],
            ['Invite your seller', 'He verifies identity, ownership and bank on his own phone (~10 min)'],
            ['Book the valuer’s visit', 'An empanelled valuer inspects the house — usually within 48 hrs'],
            ['Our lawyers check the title', '30-year title search, encumbrance and court records — no action from you']].map(([t, d]) => (
            <div className="ben" key={t}><span className="tick or"><Ic k="arrow" s={11} /></span><div>{t}<div className="hint" style={{ marginTop: 1 }}>{d}</div></div></div>
          ))}
        </div>
        <div className="info-note" style={{ marginTop: 14 }}><span className="ni"><Ic k="info" s={16} /></span>
          <span>This letter is non-binding. Your final offer and Key Facts Statement come once the property clears — usually 2–5 working days.</span></div>
        <div className="center"><button className="link-btn"><Ic k="download" s={14} /> Download sanction letter (PDF)</button></div>
      </div></div>
      <div className="cta-bar"><button className="btn" onClick={() => go('prop')}>Start property verification <Ic k="arrow" s={16} c="#fff" /></button></div>
    </div>
  );
}
