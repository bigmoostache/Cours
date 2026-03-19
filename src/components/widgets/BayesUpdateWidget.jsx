import { useState, useEffect, useRef } from "react";

function gaussianPDF(x, mu, sigma) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

function logGamma(z) {
  const g = 7;
  const c = [0.99999999999980993,676.5203681218851,-1259.1392167224028,
    771.32342877765313,-176.61502916214059,12.507343278686905,
    -0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function studentPDF(x, mu, scale, df) {
  const z = (x - mu) / scale;
  const logNorm = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - Math.log(scale);
  const logKernel = -((df + 1) / 2) * Math.log(1 + z * z / df);
  return Math.exp(logNorm + logKernel);
}

export default function BayesUpdateWidget() {
  const MU_0         = 36.2;
  const ALPHA_0      = 3;
  const SIGMA_INST   = 0.25;
  const SIGMA_TARGET = 1.0;
  const BETA_0       = ALPHA_0 * SIGMA_INST ** 2;
  const NU_0         = BETA_0 / (ALPHA_0 * SIGMA_TARGET ** 2);

  const [newObs, setNewObs] = useState(38.2);
  const [observations, setObservations] = useState([38.2, 38.6, 38.1]);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  const computePosterior = (obs) => {
    const n = obs.length;
    const sumX = n > 0 ? obs.reduce((a, b) => a + b, 0) : 0;
    const xbar = n > 0 ? sumX / n : MU_0;
    const S    = n > 0 ? obs.reduce((a, x) => a + (x - xbar) ** 2, 0) : 0;

    const nu_n    = NU_0 + n;
    const mu_n    = (NU_0 * MU_0 + sumX) / nu_n;
    const alpha_n = ALPHA_0 + n / 2;
    const beta_n  = BETA_0 + 0.5 * S + (n > 0 ? (NU_0 * n * (xbar - MU_0) ** 2) / (2 * nu_n) : 0);

    const sigma_mu    = Math.sqrt(beta_n / (alpha_n * nu_n));
    const sigma2_post = alpha_n > 1 ? beta_n / (alpha_n - 1) : Infinity;

    const lambda1 = NU_0 * MU_0 / BETA_0 + sumX;
    const lambda2 = -(NU_0 / (2 * BETA_0) + obs.reduce((a, x) => a + x * x, 0));

    return { mu: mu_n, sigma: sigma_mu, sigma2: sigma2_post, lambda1, lambda2, nu: nu_n, alpha_n, beta_n };
  };

  const post = computePosterior(observations);
  const addObs = () => setObservations(prev => [...prev, newObs]);
  const removeObs = (i) => setObservations(prev => prev.filter((_, idx) => idx !== i));
  const reset = () => setObservations([38.2, 38.6, 38.1]);

  const doDraw = (obs, mu, sigma, lambda1, lambda2, nu, alpha_n, beta_n) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    if (W === 0 || H === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const PAD_L = 10, PAD_R = 10, PAD_T = 24, PAD_B = 22;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const xMin = 35.2, xMax = 40.3, range = xMax - xMin;
    const toX = v => PAD_L + ((v - xMin) / range) * plotW;
    const df = 2 * alpha_n;
    const scale = Math.sqrt(beta_n / (alpha_n * nu));

    const peakStudent = studentPDF(mu, mu, scale, df);
    const yMax = peakStudent / 0.80;
    const toY = v => PAD_T + plotH - Math.min(v / yMax, 1.05) * plotH;

    ctx.fillStyle = "#fafaf8";
    ctx.fillRect(PAD_L, PAD_T, plotW, plotH);

    ctx.strokeStyle = "#e8e0d5"; ctx.lineWidth = 1;
    for (let t = 35.5; t <= 40.5; t += 0.5) {
      ctx.beginPath(); ctx.moveTo(toX(t), PAD_T); ctx.lineTo(toX(t), PAD_T + plotH); ctx.stroke();
    }

    ctx.strokeStyle = "#c8bfb0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD_L, PAD_T + plotH); ctx.lineTo(PAD_L + plotW, PAD_T + plotH); ctx.stroke();

    const priorSigma = 1.0;
    const priorPeak = gaussianPDF(MU_0, MU_0, priorSigma);
    const priorScale = (yMax * 0.35) / priorPeak;
    ctx.beginPath(); ctx.strokeStyle = "#b0a898"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    for (let px = 0; px <= plotW; px++) {
      const xv = xMin + (px / plotW) * range;
      const y = gaussianPDF(xv, MU_0, priorSigma) * priorScale;
      const ypx = PAD_T + plotH - (y / yMax) * plotH;
      px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
    }
    ctx.stroke(); ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(PAD_L, PAD_T + plotH);
    for (let px = 0; px <= plotW; px++) {
      const xv = xMin + (px / plotW) * range;
      ctx.lineTo(PAD_L + px, toY(studentPDF(xv, mu, scale, df)));
    }
    ctx.lineTo(PAD_L + plotW, PAD_T + plotH);
    ctx.closePath();
    ctx.fillStyle = "rgba(139,46,18,0.10)"; ctx.fill();

    ctx.beginPath(); ctx.strokeStyle = "#8b2e12"; ctx.lineWidth = 2.5;
    for (let px = 0; px <= plotW; px++) {
      const xv = xMin + (px / plotW) * range;
      const ypx = toY(studentPDF(xv, mu, scale, df));
      px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
    }
    ctx.stroke();

    ctx.beginPath(); ctx.strokeStyle = "rgba(139,46,18,0.35)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    for (let px = 0; px <= plotW; px++) {
      const xv = xMin + (px / plotW) * range;
      const ypx = toY(gaussianPDF(xv, mu, sigma));
      px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
    }
    ctx.stroke(); ctx.setLineDash([]);

    const fx = toX(38);
    ctx.beginPath(); ctx.strokeStyle = "#c4623e"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 3]);
    ctx.moveTo(fx, PAD_T); ctx.lineTo(fx, PAD_T + plotH); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#c4623e"; ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillText("38°C", fx + 4, PAD_T + 12);

    obs.forEach(xi => {
      const ox = toX(xi);
      ctx.beginPath(); ctx.strokeStyle = "rgba(139,46,18,0.5)"; ctx.lineWidth = 2;
      ctx.moveTo(ox, PAD_T + plotH - 4); ctx.lineTo(ox, PAD_T + plotH + 5); ctx.stroke();
    });

    const muX = toX(mu);
    const muY = toY(peakStudent);
    ctx.beginPath(); ctx.arc(muX, muY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#8b2e12"; ctx.fill();
    ctx.fillStyle = "#8b2e12"; ctx.font = "bold 11px 'JetBrains Mono', monospace";
    const labelX = muX + 8 + (muX > W * 0.75 ? -130 : 0);
    ctx.fillText(`μ = ${mu.toFixed(2)}°C`, labelX, muY + 4);

    ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillStyle = "#8a837a"; ctx.textAlign = "center";
    for (let t = 35.5; t <= 40; t += 0.5) {
      ctx.fillText(t.toFixed(1), toX(t), PAD_T + plotH + PAD_B - 4);
    }
    ctx.textAlign = "left";
  };

  useEffect(() => {
    const id = setTimeout(() => {
      doDraw(observations, post.mu, post.sigma, post.lambda1, post.lambda2, post.nu, post.alpha_n, post.beta_n);
    }, 30);
    return () => clearTimeout(id);
  }, [observations, post.mu, post.sigma]);

  const postRef = useRef(post);
  const obsRef = useRef(observations);
  useEffect(() => { postRef.current = post; obsRef.current = observations; });
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const p = postRef.current, o = obsRef.current;
      doDraw(o, p.mu, p.sigma, p.lambda1, p.lambda2, p.nu, p.alpha_n, p.beta_n);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const stats = [
    { label: "n", value: observations.length, hi: false },
    { label: "λ₁", value: post.lambda1.toFixed(2), hi: false },
    { label: "λ₂", value: post.lambda2.toFixed(1), hi: false },
    { label: "ν", value: post.nu.toFixed(3), hi: false },
    { label: "μ post", value: `${post.mu.toFixed(2)}°C`, hi: true },
    { label: "df = 2α", value: (2 * post.alpha_n).toFixed(1), hi: false },
    { label: "scale", value: post.sigma.toFixed(3), hi: false },
    { label: "÷σ prior", value: observations.length > 0 ? `×${(post.sigma < 0.25 ? (0.25/post.sigma).toFixed(0) : "—")}` : "—", hi: false },
  ];

  return (
    <div className="widget">
      <div className="widget-title">Simulation interactive — mise à jour bayésienne</div>

      <div style={{display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end", marginBottom:20}}>
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          <label style={{fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-faint)", letterSpacing:"0.08em"}}>
            Nouvelle observation
          </label>
          <input type="range" min="35" max="41" step="0.1" value={newObs}
            onChange={e => setNewObs(parseFloat(e.target.value))}
            style={{width:160, accentColor:"var(--accent)"}} />
          <span style={{fontFamily:"var(--mono)", fontSize:13, color:"var(--accent)", textAlign:"center"}}>
            {newObs.toFixed(1)}°C
          </span>
        </div>
        <button className="add-obs-btn" onClick={addObs}>+ Ajouter</button>
        <button className="reset-btn" onClick={reset}>Réinitialiser</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16}}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.hi ? "#fdf5f2" : "var(--cream)",
            border: `1px solid ${s.hi ? "var(--accent-light)" : "var(--rule)"}`,
            padding:"10px 12px", borderRadius:2
          }}>
            <div style={{fontFamily:"var(--mono)", fontSize:9, color:"var(--ink-faint)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4}}>
              {s.label}
            </div>
            <div style={{fontFamily:"var(--mono)", fontSize:16, fontWeight:500, color: s.hi ? "var(--accent)" : "var(--ink)"}}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{fontFamily:"var(--mono)", fontSize:12, marginBottom:12, minHeight:24}}>
        <span style={{color:"var(--ink-faint)", marginRight:6}}>observations (clic pour supprimer) :</span>
        {observations.map((x, i) => (
          <span
            key={i}
            className="obs-tag"
            onClick={() => removeObs(i)}
            style={{cursor:"pointer", userSelect:"none"}}
            title="Cliquer pour supprimer"
          >
            {x.toFixed(1)}°C ×
          </span>
        ))}
      </div>

      <div ref={wrapRef} className="posterior-canvas-wrap">
        <canvas ref={canvasRef} className="posterior-canvas" />
      </div>

      <div style={{fontSize:11, color:"var(--ink-faint)", fontFamily:"var(--mono)", marginTop:8}}>
        — — prior (large) &nbsp;&nbsp; —— Student t(2α) exact &nbsp;&nbsp; - - Gaussienne approx &nbsp;&nbsp; | 38°C &nbsp;&nbsp; ↓ obs
      </div>
    </div>
  );
}
