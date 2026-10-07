/* Shell — router, journey state, scenario switcher and BRE console */

const URLS = {
  web: 'home-loans', lead1: 'home-loans/apply', lead2: 'home-loans/apply', lead3: 'home-loans/apply', eligLoad: 'home-loans/apply/eligibility', elig: 'home-loans/apply/eligibility',
};
const urlFor = (s) => URLS[s] || `home-loans/application/${DEAL.appId}`;

/* Data a stage needs when the console jumps straight to it */
const KYC_DONE = { pan: 'ABCPM1234K · name match 100', aadhaar: 'DigiLocker e-KYC · address verified', face: 'Live · match 92', fin: 'CIBIL 762 · salary ₹65,000 verified' };
const PROP_DONE = { docs: '7 documents · OCR classified', seller: 'Identity, ownership & payee verified', valuer: 'Visit done · report submitted' };
function defaultsFor(stage) {
  const d = {};
  if (stage >= 2) Object.assign(d, { ask: DEAL.ask, tenure: DEAL.tenureYrs, lead: true });
  if (stage >= 3) d.kyc = KYC_DONE;
  if (stage >= 5) d.prop = PROP_DONE;
  if (stage >= 7) d.sign = { esign: '8 documents signed', enach: 'e-NACH accepted' };
  return d;
}

// Deep link for demos: index.html#<screen>&<scenario>, e.g. #done&sellerLoan
const HASH = location.hash.slice(1).split('&');
const START = SCREEN_STAGE[HASH[0]] ? HASH[0] : 'web';
const START_SC = SCENARIOS.some((x) => x.id === HASH[1]) ? HASH[1] : 'happy';

function App() {
  const [screen, setScreen] = useState(START);
  const [sc, setSc] = useState(START_SC);
  const [data, setData] = useState(() => ({ ...defaultsFor(SCREEN_STAGE[START]), ...(START_SC === 'valLow' && SCREEN_STAGE[START] >= 5 ? { ask: dealFor('valLow').sanctioned } : {}) }));
  const [logs, setLogs] = useState([]);
  const [key, setKey] = useState(0);
  const logRef = useRef(null);

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const log = (id, text, outcome = 'PASS') => setLogs((l) => [...l.filter((x) => x.id !== id), { id, text, outcome }]);
  const go = (s) => setScreen(s);
  const reset = (nextSc = sc) => { setSc(nextSc); setData({}); setLogs([]); setScreen('web'); setKey((k) => k + 1); };
  const jump = (st) => {
    const stage = STAGES.find((x) => x.n === st);
    // valLow at stage 5+ means the counter-offer was already accepted
    setData({ ...defaultsFor(st), ...(sc === 'valLow' && st >= 5 ? { ask: dealFor(sc).sanctioned } : {}) });
    setLogs([{ id: 'JUMP', text: `Jumped to stage ${st} with defaults`, outcome: 'INFO' }]);
    setScreen(stage.start); setKey((k) => k + 1);
  };
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const curStage = SCREEN_STAGE[screen] || 1;
  const scObj = SCENARIOS.find((x) => x.id === sc);
  const S = {
    web: <Landing go={go} />, lead1: <Lead1 go={go} />, lead2: <Lead2 go={go} />, lead3: <Lead3 go={go} />,
    eligLoad: <BrandLoader msg="Calculating your eligibility" sub="Using only what you told us — no credit check yet" ms={2300} onDone={() => go('elig')} />,
    elig: <Eligibility go={go} />, kyc: <KycHub go={go} />, uw: <Underwrite go={go} />, ips: <InPrinciple go={go} />,
    prop: <PropHub go={go} />, propEngine: <PropEngine go={go} />, cleared: <Cleared go={go} />,
    final: <FinalOffer go={go} />, sign: <SignHub go={go} />, dcheck: <DCheck go={go} />, reg: <Registration go={go} />,
    done: <Done restart={() => reset()} />,
  };

  return (
    <JourneyCtx.Provider value={{ sc, data, set, log }}>
      <div className="stage">
        <div className="stage-header">
          <div className="stage-brand"><Wordmark light size={34} />
            <div><h1>Home Loan journey prototype</h1><p>Persona: Arjun Mehta, salaried, Nagpur · buyer side, end to end</p></div></div>
          <div className="meta">HL-STP · {DEAL.appId}</div>
        </div>
        <div className="layout">
          <div className="phone-shell">
            <div className="phone-label">Customer · Android</div>
            <AndroidDevice url={urlFor(screen)}><Fragment key={key + screen}>{S[screen]}</Fragment></AndroidDevice>
          </div>
          <div className="console">
            <div className="panel">
              <h3>Scenario <small>{SCENARIOS.findIndex((x) => x.id === sc) + 1} / {SCENARIOS.length}</small></h3>
              <select className="scn" value={sc} onChange={(e) => reset(e.target.value)}>
                {SCENARIOS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
              <div className="scn-desc">{scObj.desc}</div>
            </div>
            <div className="panel">
              <h3>Journey stages <small>click to jump</small></h3>
              {STAGES.map((x) => (
                <button key={x.n} className={'stp' + (x.n < curStage ? ' done' : x.n === curStage ? ' on' : '')} onClick={() => jump(x.n)}>
                  <span className="n">{x.n < curStage ? '✓' : x.n}</span>{x.name}{x.human && <span className="h">{x.human}</span>}
                </button>
              ))}
            </div>
            <div className="panel">
              <h3>Rule engine log <small>{logs.length} entries</small></h3>
              <div className="log" ref={logRef}>
                {logs.length === 0 ? <div className="log-empty">Rules fire here as Arjun moves through the journey.</div>
                  : logs.map((l) => <div className="log-row" key={l.id}><span className="id">{l.id}</span><span className="tx">{l.text}</span><span className={'oc ' + l.outcome}>{l.outcome}</span></div>)}
              </div>
            </div>
            <div className="kbd-note">Prototype only. All figures are illustrative and live in <span className="mono">src/data.jsx</span>. OTPs auto-fill with the demo chip. <a href="rulebook/index.html" style={{ color: 'var(--og)' }}>Open the BRE rule book →</a></div>
          </div>
        </div>
      </div>
    </JourneyCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
