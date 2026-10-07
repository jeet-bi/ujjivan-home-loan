/* Persona, product terms and scenario switches — all figures from
   "Home Loan STP Journey — BRE & Rule Book" (synthetic test data, application HL-2026-10-000482).
   Update numbers here only; screens read from these objects. */

const ARJUN = {
  name: 'Arjun Ramesh Mehta', first: 'Arjun', mobile: '98765 43210', mobileMasked: '+91 98765 ••210',
  email: 'arjun.mehta@gmail.com', dob: '17-03-1994', age: 32, pan: 'ABCPM1234K', aadhaarLast4: '4821',
  ckyc: '300012345678901', father: 'Ramesh Chand Mehta',
  address: 'House 14, Gali No 3, Shanti Nagar, Nagpur 440015',
  employer: 'Technova Solutions Pvt Ltd', employerCat: 'B', tenureJob: '4 yrs 2 mths',
  net: 65000, gross: 82000, existingEmi: 6500, plLeft: 14,
  bank: 'HDFC Bank', acct: 'XXXXXX4417', ifsc: 'HDFC0001234',
  altBank: 'ICICI Bank', altAcct: 'XXXXXX9150',
  uan: '1009XXXXXX21', cibil: 762,
};

const DEAL = {
  appId: 'HL-2026-10-000482', propertyType: 'Independent house', purpose: 'Resale purchase',
  address: 'House 18, Gali No 3, Shanti Nagar, Nagpur 440015', pin: '440015',
  price: 2500000, ask: 2000000, tenureYrs: 20, token: 100000,
  seller: 'Suresh Kumar Jain', sellerMobile: '98220 11873', sellerBank: 'SBI', sellerAcct: 'XXXXXXX9032', sellerIfsc: 'SBIN0005678',
  valuation: 2580000, guideline: 2340000, age: 18, residual: 42, builtUp: 1450, land: 1200,
  titleChain: '1998 allotment → 2011 gift deed → seller', geoFromApplicant: 58, geoFromAddress: 34,
};

const TERMS = {
  cardRate: 8.75, bufferRate: 9.25, grade: 'B', score: 740, pfPct: 0.0035, pf: 7000, gst: 1260,
  validityDays: 45, coolingOffDays: 3, kfsNo: 'HL-2026-10-000482-K1', estamp: 'IN-MH-2026-XXXX881',
  umrn: 'HDFC7021000012345678', firstEmi: '05 Nov 2026', lastEmi: '05 Oct 2046',
  registration: { office: 'Sub-Registrar Office, Nagpur (Urban-2)', date: 'Mon, 19 Oct 2026', time: '11:30 AM', exec: 'Priya Kulkarni', execPh: '+91 90110 4XXXX' },
  valuer: { name: 'R. Deshmukh & Associates', id: 'EMP-V-221' },
  utr: 'SBINR52026101900048213', loanAc: 'UJHL0004821', vault: 'VLT-NGP-0482-17',
};

const SELLER_LENDER = { name: 'SBI Home Loans', foreclosure: 640000, acct: 'SBI loan a/c XXXX7731' };

const SCENARIOS = [
  { id: 'happy', label: 'Happy path — straight-through', desc: 'Every rule passes. Two planned human touches only: valuer visit and registration day.' },
  { id: 'faceGrey', label: 'Face match 68 → assisted re-KYC (K-06)', desc: 'Selfie in poor light lands in the 65–79 grey zone. A ticket opens, an ops executive calls and sends a scoped "Re-initiate KYC" link; retake scores 89.' },
  { id: 'aaDown', label: 'Salary bank not live on AA (F-01)', desc: 'Arjun uploads a 12-month e-statement PDF instead; tamper checks run on metadata, fonts and recomputed balances.' },
  { id: 'repayDiff', label: 'EMI from a different account (F-12 / N-01)', desc: 'Repayment account differs from the AA income account. Same-holder proof via reverse penny drop; mandate tagged NON_SALARY.' },
  { id: 'valLow', label: 'Valuation 88% of price → counter-offer (P-01)', desc: 'Valuer reports ₹22.0L. LTV re-computed on valuation, sanction becomes ₹19.8L and own contribution rises; Arjun accepts in-app.' },
  { id: 'sellerLoan', label: "Seller's house is mortgaged → split payout (P-10 / D-10)", desc: "Seller declares an SBI home loan. Foreclosure letter collected; disbursement pays the seller's lender first, balance to the seller." },
  { id: 'sellerQR', label: 'Seller misses link → valuer QR on site', desc: 'Seller link sits idle past 48 h. Valuer shows a geo-fenced QR at the visit; seller completes KYC on his own phone and originals are sighted.' },
];

const STAGES = [
  { n: 1, name: 'Lead & eligibility', start: 'web', human: '' },
  { n: 2, name: 'KYC & financial data', start: 'kyc', human: '' },
  { n: 3, name: 'In-principle sanction', start: 'uw', human: '' },
  { n: 4, name: 'Property & seller checks', start: 'prop', human: 'Valuer visit' },
  { n: 5, name: 'Final offer & KFS', start: 'final', human: '' },
  { n: 6, name: 'e-Sign & auto-pay', start: 'sign', human: '' },
  { n: 7, name: 'Disbursement', start: 'dcheck', human: 'Registration day' },
];

const SCREEN_STAGE = {
  web: 1, lead1: 1, lead2: 1, lead3: 1, eligLoad: 1, elig: 1,
  kyc: 2, uw: 3, ips: 3, prop: 4, propEngine: 4, cleared: 4,
  final: 5, sign: 6, dcheck: 7, reg: 7, done: 7,
};

/* ── maths ── */
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const lakh = (n) => { const v = n / 1e5; return '₹' + (Math.abs(v - Math.round(v)) < 0.005 ? Math.round(v) : v.toFixed(1)) + ' lakh'; };
const lakhS = (n) => lakh(n).replace(' lakh', 'L');
const emiPerLakh = (rate, m) => { const r = rate / 1200, f = Math.pow(1 + r, m); return 1e5 * r * f / (f - 1); };
const emiFor = (p, rate, m) => p / 1e5 * emiPerLakh(rate, m);
const ltvCap = (v) => (v <= 3000000 ? 0.9 : v <= 7500000 ? 0.8 : 0.75);
const foirCap = (inc) => (inc <= 30000 ? 45 : inc <= 75000 ? 55 : inc <= 150000 ? 60 : 65);
// APR: rate at which the EMI stream discounts to (principal − upfront charges)
const aprFor = (p, emi, m, fees) => {
  let lo = 0, hi = 30;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; const r = mid / 1200; const pv = emi * (1 - Math.pow(1 + r, -m)) / r; pv > p - fees ? (lo = mid) : (hi = mid); }
  return (lo + hi) / 2;
};

/* Final numbers for the selected scenario */
function dealFor(sc, ask = DEAL.ask, tenureYrs = DEAL.tenureYrs) {
  const valuation = sc === 'valLow' ? 2200000 : DEAL.valuation;
  const value = Math.min(DEAL.price, valuation);
  const sanctioned = Math.min(ask, ltvCap(value) * value);
  const m = tenureYrs * 12;
  const emi = emiFor(sanctioned, TERMS.cardRate, m);
  const fees = TERMS.pf + TERMS.gst;
  const split = sc === 'sellerLoan'
    ? [{ to: SELLER_LENDER.name, ac: SELLER_LENDER.acct, amt: SELLER_LENDER.foreclosure, note: 'Foreclosure as per lender letter' },
       { to: DEAL.seller, ac: `${DEAL.sellerBank} ${DEAL.sellerAcct}`, amt: sanctioned - SELLER_LENDER.foreclosure, note: 'Balance sale consideration' }]
    : [{ to: DEAL.seller, ac: `${DEAL.sellerBank} ${DEAL.sellerAcct}`, amt: sanctioned, note: 'Sale consideration' }];
  return {
    valuation, value, sanctioned, m, emi, fees, apr: aprFor(sanctioned, Math.round(emi), m, fees),
    own: DEAL.price - sanctioned, ltv: sanctioned / DEAL.price * 100,
    foir: (emi + ARJUN.existingEmi) / ARJUN.net * 100, foirLater: emi / ARJUN.net * 100,
    mandateMax: Math.ceil(emi * 1.5 / 100) * 100, split,
  };
}
