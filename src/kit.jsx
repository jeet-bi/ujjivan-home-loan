/* Shared building blocks: device frame, brand mark, icons, headers, loaders, OTP, sub-flow shell */
const { useState, useEffect, useRef, useMemo, createContext, useContext, Fragment } = React;
const JourneyCtx = createContext(null);
const useJ = () => useContext(JourneyCtx);

/* ── Icons (simple stroke glyphs) ── */
function Ic({ k, s = 20, c = 'currentColor', w = 1.9 }) {
  const p = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (k) {
    case 'check': return <svg {...p} strokeWidth="3.2"><path d="M5 12l5 5L20 7"/></svg>;
    case 'back': return <svg {...p} strokeWidth="2.4"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
    case 'close': return <svg {...p} strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'chev': return <svg {...p} strokeWidth="2.2"><path d="M9 6l6 6-6 6"/></svg>;
    case 'arrow': return <svg {...p} strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'lock': return <svg {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'bank': return <svg {...p}><path d="M3 10l9-6 9 6"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>;
    case 'home': return <svg {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>;
    case 'doc': return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>;
    case 'pan': return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h5M7 14h3"/><circle cx="16.5" cy="12" r="2"/></svg>;
    case 'aadhaar': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="2"/><path d="M5.5 16c0-1.7 1.3-3 3-3s3 1.3 3 3"/><path d="M14 9h4M14 12h4M14 15h2.5"/></svg>;
    case 'face': return <svg {...p}><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2"/><circle cx="12" cy="11" r="3.2"/><path d="M8 17c.8-1.6 2.3-2.4 4-2.4s3.2.8 4 2.4"/></svg>;
    case 'chart': return <svg {...p}><path d="M4 19V5M4 19h16"/><path d="M8 15l3-4 3 2 4-6"/></svg>;
    case 'user': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'users': return <svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2.2.6 3.5 2.6 3.5 6"/></svg>;
    case 'phone': return <svg {...p}><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>;
    case 'call': return <svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 22s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'cal': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'sign': return <svg {...p}><path d="M3 17c3-1 5-9 8-9s2 6 5 6 4-3 5-4"/><path d="M3 21h18"/></svg>;
    case 'rupee': return <svg {...p}><path d="M6 4h12M6 8h12M14 4c3 0 3 8-3 8H6l8 8"/></svg>;
    case 'link': return <svg {...p}><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1"/></svg>;
    case 'qr': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>;
    case 'upload': return <svg {...p}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>;
    case 'camera': return <svg {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'alert': return <svg {...p}><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>;
    case 'menu': return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'building': return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>;
    case 'key': return <svg {...p}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/></svg>;
    case 'scale': return <svg {...p}><path d="M12 3v18M5 7h14M7 7l-3 7h6zM17 7l-3 7h6z"/><path d="M8 21h8"/></svg>;
    case 'mail': return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>;
    case 'sms': return <svg {...p}><path d="M4 5h16v11H9l-4 3v-3H4z"/></svg>;
    case 'wa': return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0112 4zm-2.5 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7s1.5-.6 1.7-1.2c.2-.6.2-1.1.1-1.2l-.5-.3-1.6-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.5-.4-.4-.5-.5z"/></svg>;
    case 'copy': return <svg {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>;
    case 'download': return <svg {...p}><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>;
    case 'wallet': return <svg {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1.3" fill={c} stroke="none"/></svg>;
    case 'spark': return <svg {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>;
    default: return null;
  }
}
const Check = ({ s = 12 }) => <Ic k="check" s={s} />;

/* ── Brand mark: official Ujjivan SFB logo (assets/ujjivan-mark.png, transparent).
     On coloured surfaces (loader) it sits on a white disc; the ring spins, the logo never rotates. ── */
const LOGO_SRC = 'assets/ujjivan-mark.png';
function UMark({ size = 40, tile = false, spin = false }) {
  if (tile || spin) return (
    <div className={'umark-tile' + (spin ? ' breathe' : '')} style={{ width: size, height: size }}>
      <img src={LOGO_SRC} alt="Ujjivan SFB" width={Math.round(size * 0.66)} height={Math.round(size * 0.66)} />
    </div>
  );
  return <img src={LOGO_SRC} alt="Ujjivan SFB" width={size} height={size} style={{ display: 'block', flexShrink: 0 }} />;
}
function Wordmark({ light, size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <UMark size={size} />
      <span className={'wm' + (light ? ' light' : '')}><b>ujjivan</b><small>Small Finance Bank</small></span>
    </div>
  );
}

/* ── Device ── */
function AndroidDevice({ children, url }) {
  return (
    <div className="device">
      <div className="sbar">
        <span>9:41</span><div className="cam" />
        <div className="ic">
          <svg width="15" height="15" viewBox="0 0 16 16"><path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill="#10201F"/></svg>
          <svg width="15" height="15" viewBox="0 0 16 16"><path d="M14.67 14.67V1.33L1.33 14.67h13.34z" fill="#10201F"/></svg>
          <svg width="15" height="15" viewBox="0 0 16 16"><rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill="#10201F"/><rect x="5.5" y=".9" width="5" height="2" rx=".5" fill="#10201F"/></svg>
        </div>
      </div>
      <div className="chrome">
        <div className="url"><Ic k="lock" s={13} c="#3D5357" /> <span><b>ujjivansfb.in</b>/{url}</span></div>
        <div className="tabs">1</div>
        <Ic k="menu" s={18} c="#3D5357" />
      </div>
      <div className="screen">{children}</div>
      <div className="navbar"><i /></div>
    </div>
  );
}

/* ── Headers ── */
function FlowHeader({ title, sub, stepNo, pct, onBack }) {
  return (
    <div className="flow-header">
      <div className="top">
        {onBack && <button className="icon-btn" onClick={onBack}><Ic k="back" s={14} /></button>}
        <div className="titles"><div className="t">{title}</div>{sub && <div className="s">{sub}</div>}</div>
        {stepNo && <div className="stepno">{stepNo}</div>}
      </div>
      {pct != null && <div className="bar"><div className="fill" style={{ width: pct + '%' }} /></div>}
    </div>
  );
}
function SubHead({ title, sub, tag, step, total, onClose, onBack }) {
  return (
    <div className="sub-head">
      <div className="row1">
        <button className="icon-btn" onClick={onBack || onClose}><Ic k={onBack ? 'back' : 'close'} s={14} /></button>
        <div><div className="sh-t">{title}</div>{sub && <div className="sh-s">{sub}</div>}</div>
        {tag && <div className="sh-brand">{tag}</div>}
      </div>
      {total > 1 && (
        <div className="sub-pips">
          {Array.from({ length: total }).map((_, i) => <div key={i} className={'pip' + (i < step ? ' done' : i === step ? ' active' : '')} />)}
        </div>
      )}
    </div>
  );
}

/* ── Inputs ── */
function Cbox({ on }) { return <div className={'cbox' + (on ? ' on' : '')}>{on && <Check s={12} />}</div>; }
function Consent({ on, onToggle, children }) {
  return <div className="consent-check" onClick={onToggle}><Cbox on={on} /><div className="ctx">{children}</div></div>;
}
function DemoChip({ onClick, children }) {
  return <div className="demo-chip" onClick={onClick}><span className="dot" />{children}</div>;
}
function Seg({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map((o) => {
        const v = typeof o === 'object' ? o.v : o, l = typeof o === 'object' ? o.l : o, dis = typeof o === 'object' && o.disabled;
        return <button key={v} className={value === v ? 'on' : ''} disabled={dis} onClick={() => onChange(v)}>{l}</button>;
      })}
    </div>
  );
}
function OtpRow({ value, onChange, demo = '482917' }) {
  const ref = useRef(null);
  return (
    <div>
      <div className="otp-wrap" onClick={() => ref.current && ref.current.focus()}>
        <div className="otp-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={'otp-cell' + (value[i] ? ' filled' : '') + (value.length === i ? ' active' : '')}>{value[i] || ''}</div>
          ))}
        </div>
        <input ref={ref} className="otp-hidden" inputMode="numeric" maxLength={6} value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      </div>
      <div className="center"><DemoChip onClick={() => onChange(demo)}>Demo OTP — tap to autofill {demo.split('').join(' ')}</DemoChip></div>
    </div>
  );
}
function ResendLine() {
  const [s, setS] = useState(28); const [sent, setSent] = useState(false);
  useEffect(() => { if (s <= 0) return; const t = setTimeout(() => setS(s - 1), 1000); return () => clearTimeout(t); }, [s]);
  return (
    <div className="otp-foot">
      {sent ? <span style={{ color: 'var(--okd)', fontWeight: 700 }}>OTP re-sent ✓</span>
        : s > 0 ? <span>Didn&rsquo;t get it? Resend in <b>0:{String(s).padStart(2, '0')}</b></span>
        : <span>Didn&rsquo;t get the code? <span className="resend" onClick={() => setSent(true)}>Resend OTP</span></span>}
    </div>
  );
}

/* ── Loaders ── */
function BrandLoader({ msg, sub, ms = 2300, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, ms); return () => clearTimeout(t); }, []);
  return (
    <div className="app">
      <div className="bloader">
        <div className="bl-ring"><div className="ring-conic" /><UMark size={76} spin /></div>
        <span className="wm light"><b style={{ fontSize: 28 }}>ujjivan</b><small>Home Loans</small></span>
        <div className="bl-msg">{msg}</div>
        {sub && <div className="bl-sub">{sub}</div>}
        <div className="bl-dots"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function Fetching({ title, sub, lines, slate, onDone, hold = 600, step = 700 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const ts = lines.map((_, k) => setTimeout(() => setI(k + 1), step * (k + 1)));
    ts.push(setTimeout(onDone, step * lines.length + hold));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className={'fetching' + (slate ? ' slate' : '')}>
      <div className="ft-ring" />
      <h2>{title}</h2>
      <div className="ft-sub">{sub}</div>
      <div className="ft-list">
        {lines.map((l, k) => {
          const [t, r] = Array.isArray(l) ? l : [l, null];
          return (
            <div key={t} className={'ft-row' + (k < i ? ' done' : '')}>
              <div className="fr-dot">{k < i ? <Check s={10} /> : k === i ? <div className="mini-spin" /> : null}</div>
              {t}{r && k < i && <span className="fr-r">{r}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Engine: makes backend work visible — cycling chips, staged progress, eased percentage */
function Engine({ eyebrow, title, chips, unit, stages, total = 4600, onDone }) {
  const [pct, setPct] = useState(0); const [ci, setCi] = useState(0); const [stage, setStage] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const e = Math.min(1, (Date.now() - start) / total);
      setPct(Math.round((1 - Math.pow(1 - e, 2.2)) * 100));
      setStage(Math.min(stages.length - 1, Math.floor(e * stages.length)));
      if (e >= 1) { clearInterval(tick); setTimeout(onDone, 420); }
    }, 40);
    const cyc = setInterval(() => setCi((i) => (i + 1) % chips.length), 150);
    return () => { clearInterval(tick); clearInterval(cyc); };
  }, []);
  const checked = Math.min(chips.length, Math.max(1, Math.round(pct / 100 * chips.length)));
  return (
    <div className="app">
      <div className="engine">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <div className="scan"><div className="ring-conic" /><div className="scan-core"><div className="scan-chip" key={ci}>{chips[ci]}</div></div></div>
        <div className="e-count"><b>{checked}</b><span>/ {chips.length} {unit}</span></div>
        <div className="e-cur">Evaluating <b>{chips[ci]}</b></div>
        <div className="e-stages">
          {stages.map((s, i) => (
            <div key={s.t} className={'fstage' + (i < stage ? ' done' : i === stage ? ' active' : '')}>
              <div className="fs-dot">{i < stage ? <Check s={11} /> : i === stage ? <span className="fs-spin" /> : null}</div>
              <div><div className="fs-t">{s.t}</div>{i === stage && <div className="fs-d">{s.d}</div>}</div>
            </div>
          ))}
        </div>
        <div className="e-progress"><div className="e-bar"><div className="e-fill" style={{ width: pct + '%' }} /></div><div className="e-pct">{pct}%</div></div>
      </div>
    </div>
  );
}

/* ── Hub task row ── */
function Task({ icon, name, tag, tagOr, desc, done, wait, locked, lockedText, onOpen }) {
  const cls = 'task' + (done ? ' done' : wait ? ' wait' : locked ? ' locked' : '');
  return (
    <div className={cls} onClick={() => !done && !locked && onOpen && onOpen()}>
      <div className="tk-ic">{done ? <Check s={20} /> : <Ic k={icon} s={22} />}</div>
      <div className="tk-body">
        <div className="tk-nm">{name}{tag && <span className={'tk-tag' + (tagOr ? ' or' : '')}>{tag}</span>}</div>
        {done ? <div className="tk-done">{done}</div> : wait ? <div className="tk-wait">{wait}</div>
          : <div className="tk-ds">{locked ? lockedText : desc}</div>}
      </div>
      {done ? <div className="tk-status"><Check s={13} /> Done</div>
        : locked ? <div className="tk-status" style={{ color: '#C5D2D3' }}><Ic k="lock" s={14} /></div>
        : <div className="tk-status">{wait ? 'View' : 'Start'}<Ic k="chev" s={15} /></div>}
    </div>
  );
}
function HubProgress({ done, total }) {
  return (
    <div className="hub-progress">
      <div className="hp-bar"><div className="hp-fill" style={{ width: (done / total * 100) + '%' }} /></div>
      <div className="hp-txt">{done} / {total} done</div>
    </div>
  );
}

function SubDone({ title, line, chip, cta = 'Done', onDone, warn }) {
  return (
    <div className="sub">
      <div className="sub-done">
        <div className={'ring-ok' + (warn ? ' ring-warn' : '')}>{warn ? <Ic k="alert" s={34} c="#fff" /> : <Check s={38} />}</div>
        <h2>{title}</h2><p>{line}</p>
        {chip && <div className="sd-chip"><Ic k="shield" s={14} /> {chip}</div>}
        <div style={{ height: 22 }} />
        <button className="btn teal" onClick={onDone}>{cta}</button>
      </div>
    </div>
  );
}

function Sheet({ onClose, children }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}><div className="grabber" />{children}</div>
    </div>
  );
}

function KV({ rows, title }) {
  return (
    <Fragment>
      {title && <div className="kv-title">{title}</div>}
      <div className="kv-card">
        {rows.map(([k, v, mono]) => <div className="r" key={k}><span className="k">{k}</span><span className={'v' + (mono ? ' mono' : '')}>{v}</span></div>)}
      </div>
    </Fragment>
  );
}

/* Assisted support — "Call me" (section 13): executive guides, never acts for the customer */
function HelpFab() {
  const [open, setOpen] = useState(false); const [req, setReq] = useState(false);
  const { log } = useJ();
  return (
    <Fragment>
      <button className="help-fab" onClick={() => setOpen(true)}><Ic k="call" s={14} /> Need help?</button>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <h3>{req ? 'Call-back booked' : 'Talk to a home-loan expert'}</h3>
          <p className="lede">{req
            ? 'An Ujjivan executive will call you within 15 minutes on your registered mobile. Your progress is saved — nothing is lost.'
            : 'We can call you, share your screen in view-only mode and send a secure link to the exact step you are on. Our team guides you but never enters data, gives consent or signs for you.'}</p>
          {!req ? (
            <Fragment>
              <button className="btn teal" onClick={() => { setReq(true); log('§13', 'Customer tapped "Call me" — assisted-support ticket opened', 'INFO'); }}><Ic k="call" s={16} c="#fff" /> Call me in 15 minutes</button>
              <button className="btn ghost" onClick={() => setOpen(false)}>Continue on my own</button>
            </Fragment>
          ) : <button className="btn" onClick={() => setOpen(false)}>Okay</button>}
        </Sheet>
      )}
    </Fragment>
  );
}
