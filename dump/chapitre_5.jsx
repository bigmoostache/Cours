import { useState, useEffect, useRef } from "react";

// ── KaTeX loader ──────────────────────────────────────────────────────────────
const KATEX_CSS = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
const KATEX_JS  = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";

function useKatex() {
  const [ready, setReady] = useState(!!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    if (!document.querySelector(`link[href="${KATEX_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = KATEX_CSS;
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = KATEX_JS; s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ children }) {
  const ref = useRef(null); const ready = useKatex();
  useEffect(() => {
    if (ready && ref.current)
      try { window.katex.render(children, ref.current, { throwOnError: false }); } catch(e) {}
  }, [ready, children]);
  return <span ref={ref} />;
}

function D({ children, label }) {
  const ref = useRef(null); const ready = useKatex();
  useEffect(() => {
    if (ready && ref.current)
      try { window.katex.render(children, ref.current, { throwOnError: false, displayMode: true }); } catch(e) {}
  }, [ready, children]);
  return (
    <div className="math-block">
      {label && <div className="math-label">{label}</div>}
      <div ref={ref} className="math-display" />
    </div>
  );
}

function Box({ children, title }) {
  const ref = useRef(null); const ready = useKatex();
  useEffect(() => {
    if (ready && ref.current)
      try { window.katex.render(children, ref.current, { throwOnError: false, displayMode: true }); } catch(e) {}
  }, [ready, children]);
  return (
    <div className="boxed">
      {title && <div className="box-title">{title}</div>}
      <div ref={ref} className="math-display" />
    </div>
  );
}

// ── Styles (identiques au chapitre 4) ────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f4ee; color: #1a1714; font-family: 'EB Garamond', Georgia, serif; font-size: 18px; line-height: 1.75; }
  :root {
    --ink: #1a1714; --ink-light: #4a4540; --ink-faint: #8a837a;
    --cream: #f7f4ee; --cream-dark: #ede8df; --accent: #8b2e12;
    --accent-light: #c4623e; --rule: #c8bfb0; --mono: 'JetBrains Mono', monospace;
  }
  .page { max-width: 780px; margin: 0 auto; padding: 60px 40px 120px; }

  .chapter-header { border-top: 3px solid var(--ink); padding-top: 32px; margin-bottom: 72px; }
  .chapter-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
  .chapter-title { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 300; line-height: 1.1; color: var(--ink); margin-bottom: 24px; letter-spacing: -0.01em; }
  .chapter-subtitle { font-size: 19px; font-style: italic; color: var(--ink-light); max-width: 580px; line-height: 1.6; border-left: 2px solid var(--accent); padding-left: 20px; }

  .section { margin-bottom: 64px; opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .section.visible { opacity: 1; transform: translateY(0); }
  .section-number { font-family: var(--mono); font-size: 11px; letter-spacing: 0.15em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
  h2 { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: var(--ink); margin-bottom: 24px; line-height: 1.2; }
  h3 { font-family: 'EB Garamond', serif; font-size: 20px; font-weight: 600; color: var(--ink); margin: 32px 0 12px; font-style: italic; }
  p { margin-bottom: 16px; color: var(--ink-light); font-size: 18px; }
  hr.rule { border: none; border-top: 1px solid var(--rule); margin: 48px 0; }

  .math-block { background: white; border: 1px solid var(--rule); border-left: 3px solid var(--accent); border-radius: 2px; padding: 20px 28px; margin: 24px 0; overflow-x: auto; }
  .math-display { padding: 4px 0; }
  .math-label { font-family: var(--mono); font-size: 10px; color: var(--ink-faint); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }

  .boxed { background: #fdf8f2; border: 2px solid var(--ink); border-radius: 2px; padding: 24px 28px; margin: 28px 0; overflow-x: auto; }
  .boxed .box-title { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }

  code.inline { font-family: var(--mono); font-size: 14px; background: var(--cream-dark); padding: 1px 6px; border-radius: 2px; color: var(--accent); }

  .data-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 16px; }
  .data-table th { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); padding: 8px 16px; text-align: left; border-bottom: 2px solid var(--ink); }
  .data-table td { padding: 10px 16px; border-bottom: 1px solid var(--rule); color: var(--ink-light); font-variant-numeric: tabular-nums; }
  .data-table tr:last-child td { border-bottom: 2px solid var(--ink); font-weight: 500; color: var(--ink); }
  .data-table td.accent { color: var(--accent); font-weight: 600; }

  .callout { background: #fdf5f2; border: 1px solid #e8bfb0; border-radius: 2px; padding: 16px 20px; margin: 20px 0; font-size: 16px; color: var(--ink-light); }
  .callout strong { color: var(--accent); font-style: normal; }

  .widget { background: white; border: 1px solid var(--rule); border-radius: 4px; padding: 32px; margin: 32px 0; }
  .widget-title { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 20px; }
  .obs-tag { display: inline-block; background: var(--cream-dark); padding: 2px 8px; border-radius: 10px; margin: 2px 4px 2px 0; color: var(--ink-light); }

  .chapter-footer { margin-top: 80px; padding-top: 24px; border-top: 2px solid var(--ink); display: flex; justify-content: space-between; align-items: center; }
  .footer-label { font-family: var(--mono); font-size: 11px; color: var(--ink-faint); letter-spacing: 0.1em; }

  .math-display .katex-display { margin: 0; }
  .math-display .katex { font-size: 1.05em; }
`;

// ── Couleur heatmap : crème → brun chaud → accent ────────────────────────────
function heatColor(t) {
  const s = Math.pow(Math.max(0, Math.min(1, t)), 0.43);
  const r = s < 0.5 ? 247 + (s / 0.5) * (212 - 247) : 212 + ((s - 0.5) / 0.5) * (139 - 212);
  const g = s < 0.5 ? 244 + (s / 0.5) * (148 - 244) : 148 + ((s - 0.5) / 0.5) * (46 - 148);
  const b = s < 0.5 ? 238 + (s / 0.5) * (90 - 238) : 90 + ((s - 0.5) / 0.5) * (18 - 90);
  return [r | 0, g | 0, b | 0];
}

const TX_FN  = { x: x => x,             abs: x => Math.abs(x),    sgn: x => Math.sign(x) };
const TY_FN  = { y: y => y,             abs: y => Math.abs(y),    sgn: y => Math.sign(y) };
const TX_LAB = { x: 'x',               abs: '|x|',               sgn: 'sgn x' };
const TY_LAB = { y: 'y',               abs: '|y|',               sgn: 'sgn y' };

// ── Widget interactif ─────────────────────────────────────────────────────────
function InteractionWidget() {
  const [etaXY,  setEtaXY]  = useState(0.75);
  const [etaX,   setEtaX]   = useState(0.0);
  const [txKey,  setTxKey]  = useState('x');
  const [tyKey,  setTyKey]  = useState('y');
  const [xSlice, setXSlice] = useState(1.5);

  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const GRID = 62, DOMAIN = 3.1;

  const doDraw = (etaXY, etaX, txKey, tyKey, xSlice) => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = wrap.clientWidth; if (!W) return;
    const H = 278, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);

    const Tx = TX_FN[txKey], Ty = TY_FN[tyKey];
    const PL = 30, PT = 20, PB = 28;
    const COND_W = 104, GAP = 18;
    const HMW = W - PL - COND_W - GAP;
    const HMH = H - PT - PB;
    const CX0 = PL + HMW + GAP;

    // ── Densité jointe ──────────────────────────────────────────────────────
    const logp = new Float32Array(GRID * GRID);
    let mxLog = -Infinity;
    for (let i = 0; i < GRID; i++) {
      const xv = -DOMAIN + (i + 0.5) / GRID * 2 * DOMAIN;
      const tx = Tx(xv);
      for (let j = 0; j < GRID; j++) {
        const yv = -DOMAIN + (j + 0.5) / GRID * 2 * DOMAIN;
        const ty = Ty(yv);
        const lp = etaX * tx - 0.5 * xv * xv - 0.5 * yv * yv + etaXY * tx * ty;
        logp[i * GRID + j] = lp;
        if (lp > mxLog) mxLog = lp;
      }
    }
    const p = new Float32Array(GRID * GRID); let pMax = 0;
    for (let k = 0; k < GRID * GRID; k++) {
      p[k] = Math.exp(logp[k] - mxLog);
      if (p[k] > pMax) pMax = p[k];
    }

    // ── Heatmap (cellules colorées) ─────────────────────────────────────────
    const cW = HMW / GRID, cH = HMH / GRID;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const [r, g, b] = heatColor(p[i * GRID + j] / pMax);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(PL + i * cW, PT + (GRID - 1 - j) * cH, cW + 0.5, cH + 0.5);
      }
    }

    // ── Courbe du mode conditionnel y*(x) = η_xy · T_x(x)  [si T_y = y] ──
    if (tyKey === 'y') {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(42, 108, 195, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      let first = true;
      for (let px = 0; px <= HMW; px++) {
        const xv = -DOMAIN + (px / HMW) * 2 * DOMAIN;
        const mY = etaXY * Tx(xv);
        const cy = PT + ((DOMAIN - mY) / (2 * DOMAIN)) * HMH;
        if (cy >= PT && cy <= PT + HMH) {
          if (first) { ctx.moveTo(PL + px, cy); first = false; }
          else ctx.lineTo(PL + px, cy);
        } else first = true;
      }
      ctx.stroke();
    }

    // ── Ligne de tranche x₀ ─────────────────────────────────────────────────
    const sX = PL + ((xSlice + DOMAIN) / (2 * DOMAIN)) * HMW;
    if (sX >= PL && sX <= PL + HMW) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(139,46,18,0.88)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(sX, PT); ctx.lineTo(sX, PT + HMH);
      ctx.stroke(); ctx.setLineDash([]);
    }

    // ── Cadre + axes heatmap ────────────────────────────────────────────────
    ctx.strokeStyle = '#c8bfb0'; ctx.lineWidth = 1;
    ctx.strokeRect(PL, PT, HMW, HMH);
    ctx.font = "9px 'JetBrains Mono',monospace"; ctx.fillStyle = '#8a837a';
    ctx.textAlign = 'center';
    for (let v = -3; v <= 3; v += 1) {
      const px = PL + ((v + DOMAIN) / (2 * DOMAIN)) * HMW;
      ctx.fillText(v.toFixed(0), px, PT + HMH + 14);
    }
    ctx.fillText('x', PL + HMW / 2, PT + HMH + 26);
    ctx.textAlign = 'right';
    for (let v = -3; v <= 3; v += 1.5) {
      const py = PT + ((DOMAIN - v) / (2 * DOMAIN)) * HMH;
      ctx.fillText(v.toFixed(1), PL - 3, py + 3);
    }
    ctx.save();
    ctx.translate(11, PT + HMH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.fillText('y', 0, 0);
    ctx.restore();
    ctx.textAlign = 'left'; ctx.fillStyle = '#8a837a';
    ctx.font = "9px 'JetBrains Mono',monospace";
    ctx.fillText('p(x, y)', PL + 4, PT + 12);

    // ── Conditionnelle p(y | x = x₀) ───────────────────────────────────────
    const Tx0 = Tx(xSlice);
    const cLogP = new Float32Array(GRID); let cMx = -Infinity;
    for (let j = 0; j < GRID; j++) {
      const yv = -DOMAIN + (j + 0.5) / GRID * 2 * DOMAIN;
      const lp = etaXY * Tx0 * Ty(yv) - 0.5 * yv * yv;
      cLogP[j] = lp; if (lp > cMx) cMx = lp;
    }
    const cP = new Float32Array(GRID); let cPMax = 0;
    for (let j = 0; j < GRID; j++) {
      cP[j] = Math.exp(cLogP[j] - cMx);
      if (cP[j] > cPMax) cPMax = cP[j];
    }

    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(CX0, PT, COND_W, HMH);
    ctx.strokeStyle = '#c8bfb0'; ctx.lineWidth = 1;
    ctx.strokeRect(CX0, PT, COND_W, HMH);

    for (let j = 0; j < GRID; j++) {
      const yv = -DOMAIN + (j + 0.5) / GRID * 2 * DOMAIN;
      const py = PT + ((DOMAIN - yv) / (2 * DOMAIN)) * HMH;
      const bH = Math.max(1, HMH / GRID);
      const bW = (cP[j] / cPMax) * (COND_W - 6);
      const al = (0.2 + 0.75 * cP[j] / cPMax).toFixed(2);
      ctx.fillStyle = `rgba(139,46,18,${al})`;
      ctx.fillRect(CX0 + 2, py - bH / 2, bW, bH);
    }

    // Mode conditionnel théorique (T_y = y)
    if (tyKey === 'y') {
      const mY = etaXY * Tx0;
      const mPy = PT + ((DOMAIN - mY) / (2 * DOMAIN)) * HMH;
      if (mPy >= PT && mPy <= PT + HMH) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(42,108,195,0.88)';
        ctx.lineWidth = 1.8;
        ctx.moveTo(CX0, mPy); ctx.lineTo(CX0 + COND_W, mPy);
        ctx.stroke();
      }
    }

    ctx.font = "8px 'JetBrains Mono',monospace"; ctx.fillStyle = '#8b2e12';
    ctx.textAlign = 'center';
    ctx.fillText(`p(y | x=${xSlice.toFixed(1)})`, CX0 + COND_W / 2, PT - 5);
  };

  const pRef = useRef({ etaXY, etaX, txKey, tyKey, xSlice });
  useEffect(() => { pRef.current = { etaXY, etaX, txKey, tyKey, xSlice }; });

  useEffect(() => {
    const id = setTimeout(() => doDraw(etaXY, etaX, txKey, tyKey, xSlice), 20);
    return () => clearTimeout(id);
  }, [etaXY, etaX, txKey, tyKey, xSlice]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const q = pRef.current;
      doDraw(q.etaXY, q.etaX, q.txKey, q.tyKey, q.xSlice);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const Tx = TX_FN[txKey];
  const tiltedEta = (etaXY * Tx(xSlice)).toFixed(3);
  const isIndep = Math.abs(etaXY) < 0.04;

  const btnStyle = (active) => ({
    fontFamily: "var(--mono)",
    fontSize: 11,
    padding: "5px 11px",
    background: active ? "var(--ink)" : "var(--cream-dark)",
    color: active ? "var(--cream)" : "var(--ink-light)",
    border: `1px solid ${active ? "var(--ink)" : "var(--rule)"}`,
    borderRadius: 2,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div className="widget">
      <div className="widget-title">Simulation interactive — densité jointe et conditionnelle</div>

      {/* Sélecteurs de statistiques suffisantes */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { label: "T_x(x)", cur: txKey, set: setTxKey, opts: TX_LAB },
          { label: "T_y(y)", cur: tyKey, set: setTyKey, opts: TY_LAB },
        ].map(({ label, cur, set, opts }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {label}
            </label>
            <div style={{ display: "flex", gap: 5 }}>
              {Object.entries(opts).map(([k, v]) => (
                <button key={k} onClick={() => set(k)} style={btnStyle(cur === k)}>{v}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 20 }}>
        {[
          { label: "η_xy (interaction)", val: etaXY, set: setEtaXY, min: -0.9, max: 0.9, step: 0.05 },
          { label: "η_x (biais marginal)", val: etaX,  set: setEtaX,  min: -2.0, max: 2.0, step: 0.1  },
          { label: "x₀ (tranche)",         val: xSlice, set: setXSlice, min: -2.5, max: 2.5, step: 0.1  },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.06em" }}>
              {label}
            </label>
            <input
              type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ width: 128, accentColor: "var(--accent)" }}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)", textAlign: "center" }}>
              {val.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div ref={wrapRef} style={{ width: "100%" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", display: "block", border: "1px solid var(--rule)", borderRadius: 2 }}
        />
      </div>

      {/* Grille de statistiques */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
        {[
          { label: "η_xy",          value: etaXY.toFixed(3),     hi: true  },
          { label: "T_x(x₀)",       value: Tx(xSlice).toFixed(3), hi: false },
          { label: "η_y*(x₀)",      value: tiltedEta,             hi: false },
          { label: isIndep ? "indépendance" : "couplage actif",
            value: isIndep ? "η_xy ≈ 0" : "η_xy ≠ 0",            hi: !isIndep },
        ].map(s => (
          <div key={s.label} style={{
            background: s.hi ? "#fdf5f2" : "var(--cream)",
            border: `1px solid ${s.hi ? "var(--accent-light)" : "var(--rule)"}`,
            padding: "10px 12px", borderRadius: 2,
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500, color: s.hi ? "var(--accent)" : "var(--ink)" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--mono)", marginTop: 9, lineHeight: 1.6 }}>
        ██ densité jointe p(x,y) &nbsp;·&nbsp; — courbe bleue : mode y*(x) = η_xy·T_x(x) [si T_y = y]
        &nbsp;·&nbsp; ┊ tranche x₀ &nbsp;·&nbsp; droite : p(y | x₀) &nbsp;·&nbsp;
        T_x = x, T_y = y : normalisable si |η_xy| &lt; 1
      </div>
    </div>
  );
}

// ── Composant Section (identique au chapitre 4) ───────────────────────────────
function Section({ number, title, children }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`section ${vis ? "visible" : ""}`}>
      <div className="section-number">{number}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ── Chapitre ──────────────────────────────────────────────────────────────────
export default function Chapter() {
  return (
    <>
      <style>{styles}</style>
      <div className="page">

        <div className="chapter-header">
          <div className="chapter-label">Inférence Bayésienne · Chapitre 5</div>
          <h1 className="chapter-title">Interactions entre<br />Familles Exponentielles</h1>
          <p className="chapter-subtitle">
            Un seul paramètre <em>η_xy</em> couple deux distributions arbitraires —
            pas nécessairement de la même famille. La conditionnelle reste dans la sienne ;
            la marginale en sort. De cette asymétrie naissent les modèles linéaires généralisés.
          </p>
        </div>

        {/* ────────────────────────────────── § 1 */}
        <Section number="§ 1" title="De la variable isolée au couple">
          <p>
            Au chapitre précédent, on traitait <M>{`x`}</M> seul. Dès qu'on observe un couple
            <M>{`(x, y)`}</M>, la question est : comment écrire <M>{`p(x,y\\mid\\eta)`}</M> comme
            une famille exponentielle ? La réponse tient à la structure même de la définition canonique.
          </p>
          <p>
            Il suffit de construire une <em>statistique suffisante jointe</em> qui concatène les
            statistiques marginales et leurs produits :
          </p>
          <D label="Statistique suffisante jointe — forme générale">{`
            T(x,y) = \\begin{pmatrix} T_x(x) \\\\ T_y(y) \\\\ T_x(x) \\otimes T_y(y) \\end{pmatrix},
            \\qquad
            \\eta = \\begin{pmatrix} \\eta_x \\\\ \\eta_y \\\\ \\eta_{xy} \\end{pmatrix}
          `}</D>
          <p>
            Le produit naturel <M>{`\\eta^\\top T(x,y)`}</M> se décompose alors en trois blocs
            distincts, chacun avec son rôle propre :
          </p>
          <D>{`
            \\eta^\\top T(x,y) =
            \\underbrace{\\eta_x^\\top T_x(x)}_{\\text{information sur }x}
            +\\;\\underbrace{\\eta_y^\\top T_y(y)}_{\\text{information sur }y}
            +\\;\\underbrace{\\mathrm{vec}(\\eta_{xy})^\\top(T_x(x)\\otimes T_y(y))}_{\\text{interaction}}
          `}</D>
          <p>
            La log-partition <M>{`A(\\eta_x, \\eta_y, \\eta_{xy})`}</M> normalise l'ensemble.
            Toute la nouveauté — et toute la richesse — réside dans le troisième bloc.
          </p>
          <div className="callout">
            <strong>Un seul cadre, deux variables.</strong> On n'a pas créé de nouvelle théorie :
            la famille exponentielle jointe est une famille exponentielle ordinaire, avec une statistique
            suffisante de plus grande dimension. Tout ce qui a été prouvé au chapitre 4 s'applique
            immédiatement — y compris la mise à jour bayésienne en deux additions.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 2 */}
        <Section number="§ 2" title="Le paramètre d'interaction η_xy">
          <p>
            Quand <M>{`T_x`}</M> est de dimension <M>{`k_x`}</M> et <M>{`T_y`}</M> de dimension
            <M>{`k_y`}</M>, le bloc d'interaction <M>{`\\eta_{xy}`}</M> est une matrice de taille
            <M>{`k_x \\times k_y`}</M>. Dans le cas scalaire (<M>{`k_x = k_y = 1`}</M>), c'est
            simplement un réel — le cas canonique qui sera visualisé dans la simulation.
          </p>
          <Box title="Définition — paramètre d'interaction">{`
            \\eta_{xy} \\in \\mathbb{R}^{k_x \\times k_y}, \\qquad
            \\text{terme d'interaction } = \\, T_x(x)^\\top \\,\\eta_{xy}\\, T_y(y)
          `}</Box>
          <p>
            Sa signification structurelle est immédiate : quand <M>{`\\eta_{xy} = 0`}</M>, le terme
            d'interaction disparaît et la densité jointe se factorise :
          </p>
          <D>{`
            \\eta_{xy} = 0 \\iff
            p(x,y\\mid\\eta) = p_x(x\\mid\\eta_x)\\,p_y(y\\mid\\eta_y)
            \\iff X \\perp\\!\\!\\!\\perp Y
          `}</D>
          <p>
            La norme de <M>{`\\eta_{xy}`}</M> mesure l'intensité du couplage. Son rang révèle la
            <em> dimensionnalité effective</em> de l'interaction : un rang 1 signifie que la dépendance
            passe entièrement par un seul axe dans l'espace des statistiques suffisantes.
          </p>

          <h3>Contrainte de normalisabilité — dérivation depuis les premiers principes</h3>
          <p>
            Repartons de la condition générale. Pour une seule variable <M>{`z`}</M> dans une famille
            exponentielle, l'espace naturel des paramètres admissibles est l'ensemble des{" "}
            <M>{`\\eta`}</M> pour lesquels la log-partition est finie :
          </p>
          <D label="Domaine naturel — définition">{`
            \\Omega = \\Bigl\\{\\,\\eta \\in \\mathbb{R}^k
            \\;:\\;
            \\int h(z)\\,e^{\\,\\eta^\\top T(z)}\\,dz < \\infty\\,\\Bigr\\}
          `}</D>
          <p>
            h(z) apparaît bien dans l'intégrale et peut en principe affecter sa convergence —
            une mesure de base qui décroît vite à l'infini peut rendre convergente une intégrale
            qui ne le serait pas sans elle. Pour la famille gaussienne scalaire,{" "}
            <M>{`h(z) = (2\\pi)^{-1/2}`}</M> est une constante positive : elle se factorise hors
            de l'intégrale et ne change pas la question de convergence. C'est un fait spécifique
            au cas gaussien, pas une propriété générale.
          </p>
          <p>
            Avec <M>{`T(z) = (z,\\, z^2)^\\top`}</M> et{" "}
            <M>{`\\eta = (\\eta_1,\\, \\eta_2)^\\top`}</M>, l'intégrale{" "}
            <M>{`\\int e^{\\,\\eta_1 z + \\eta_2 z^2}\\,dz`}</M> converge si et seulement si le
            coefficient du terme <em>dominant</em> pour <M>{`|z| \\to \\infty`}</M> est négatif :{" "}
            <M>{`\\eta_2 < 0`}</M>. La partie linéaire <M>{`\\eta_1 z`}</M> croît plus lentement
            que le terme quadratique et ne pose jamais de problème dès que <M>{`\\eta_2 < 0`}</M>.
          </p>
          <p>
            Pour un vecteur <M>{`z \\in \\mathbb{R}^p`}</M> avec statistiques quadratiques, la
            généralisation est immédiate : l'intégrale{" "}
            <M>{`\\int e^{\\,-\\frac{1}{2} z^\\top Q z\\,+\\,b^\\top z}\\,dz`}</M> converge si et
            seulement si la matrice <M>{`Q`}</M> est <em>définie positive</em> — c'est la
            condition pour que l'exponentielle décroisse dans toutes les directions.
          </p>

          <h3>Application au modèle joint (x, y)</h3>
          <p>
            La densité jointe <M>{`p(x, y)`}</M> est une famille exponentielle avec variable
            <M>{`z = (x, y)^\\top \\in \\mathbb{R}^2`}</M>. Dans le cas{" "}
            <M>{`T_x(x) = x`}</M>, <M>{`T_y(y) = y`}</M>, l'exposant s'écrit :
          </p>
          <D>{`
            \\eta_x x + \\eta_y y + \\eta_{xy}\\,x y
            - \\tfrac{1}{2}x^2 - \\tfrac{1}{2}y^2
            = -\\tfrac{1}{2}\\,z^\\top Q\\,z + b^\\top z
          `}</D>
          <p>
            où <M>{`b = (\\eta_x, \\eta_y)^\\top`}</M> et <M>{`Q`}</M> est la matrice de précision
            lue directement depuis l'exposant — les coefficients diagonaux viennent de
            <M>{`-\\frac{1}{2}x^2`}</M> et <M>{`-\\frac{1}{2}y^2`}</M>, le terme hors-diagonale
            de <M>{`\\eta_{xy}\\,xy = -\\frac{1}{2}(-2\\eta_{xy})\\,xy`}</M> :
          </p>
          <D label="Matrice de précision du modèle joint">{`
            Q =
            \\begin{pmatrix}1 & -\\eta_{xy}\\\\ -\\eta_{xy} & 1\\end{pmatrix}
          `}</D>
          <p>
            La condition de normalisabilité est <M>{`Q \\succ 0`}</M>. On la vérifie par les
            critères de Sylvester — les mineurs principaux doivent être strictement positifs :
          </p>
          <D>{`
            \\Delta_1 = 1 > 0 \\quad\\checkmark,
            \\qquad
            \\Delta_2 = \\det(Q) = 1 - \\eta_{xy}^2 > 0
            \\iff |\\eta_{xy}| < 1
          `}</D>
          <Box title="Domaine naturel du modèle joint — cas linéaire">{`
            \\Omega_{xy} = \\bigl\\{(\\eta_x, \\eta_y, \\eta_{xy}) \\in \\mathbb{R}^3
            \\;:\\; |\\eta_{xy}| < 1\\bigr\\}
          `}</Box>
          <p>
            La borne <M>{`|\\eta_{xy}| < 1`}</M> n'est pas arbitraire — c'est exactement la
            condition pour que la corrélation entre <M>{`X`}</M> et <M>{`Y`}</M> reste dans
            <M>{`(-1, 1)`}</M>, ce que l'on retrouvera : à l'optimum gaussien,{" "}
            <M>{`\\eta_{xy} = -\\rho / \\sigma_x \\sigma_y`}</M> où <M>{`\\rho`}</M> est le
            coefficient de corrélation.
          </p>

          <h3>Pourquoi la forme de T change le domaine</h3>
          <p>
            La dérivation ci-dessus repose sur la croissance de{" "}
            <M>{`T_x(x) T_y(y) = xy`}</M> lorsque <M>{`|(x,y)| \\to \\infty`}</M> : le terme
            d'interaction peut compenser l'ancrage quadratique et faire diverger l'intégrale.
            Pour des statistiques bornées — comme{" "}
            <M>{`T_x(x) = \\mathrm{sgn}(x) \\in \\{-1, +1\\}`}</M> — le terme d'interaction est
            borné par <M>{`|\\eta_{xy}|`}</M> quelle que soit la valeur de <M>{`x`}</M> : il ne
            peut pas compenser le terme quadratique, qui domine toujours. L'ancrage suffit alors
            à garantir <M>{`Q \\succ 0`}</M> pour tout <M>{`\\eta_{xy} \\in \\mathbb{R}`}</M> et
            le domaine naturel est <M>{`\\mathbb{R}^3`}</M> entier.
          </p>
          <div className="callout">
            <strong>Principe général.</strong> Le domaine naturel <M>{`\\Omega`}</M> est convexe
            et ouvert — c'est une propriété universelle des familles exponentielles. La borne{" "}
            <M>{`|\\eta_{xy}| < 1`}</M> délimite la frontière de cet ensemble convexe : sur la
            frontière, la gaussienne jointe dégénère en une masse de Dirac sur la droite{" "}
            <M>{`y = \\pm x`}</M>. Au-delà, l'intégrale diverge et il n'existe tout simplement
            aucune distribution normalisable avec ce paramètre.
          </div>

          <h3>Les statistiques suffisantes du couplage sont libres</h3>
          <p>
            Jusqu'ici on a écrit le terme d'interaction comme{" "}
            <M>{`T_x(x)^\\top \\eta_{xy} T_y(y)`}</M> en réutilisant les mêmes fonctions{" "}
            <M>{`T_x`}</M> et <M>{`T_y`}</M> que les termes marginaux. C'est un choix de
            notation commode, pas une contrainte. La forme la plus générale de la densité jointe
            introduit des fonctions de couplage <M>{`\\phi_x`}</M> et <M>{`\\phi_y`}</M>{" "}
            indépendantes des statistiques marginales :
          </p>
          <D label="Forme générale — statistiques de couplage distinctes">{`
            \\log p(x,y) =
            \\underbrace{\\eta_x^\\top T_x(x)}_{\\text{marginal }X}
            +\\;\\underbrace{\\eta_y^\\top T_y(y)}_{\\text{marginal }Y}
            +\\;\\underbrace{\\eta_{xy}^\\top\\bigl(\\phi_x(x)\\otimes\\phi_y(y)\\bigr)}_{\\text{couplage}}
            - A(\\eta)
          `}</D>
          <p>
            Les quatre fonctions <M>{`T_x,\\, T_y,\\, \\phi_x,\\, \\phi_y`}</M> sont des choix
            de modélisation orthogonaux. La loi marginale de <M>{`X`}</M> est gouvernée par{" "}
            <M>{`T_x`}</M> ; la façon dont <M>{`X`}</M> influence la loi de <M>{`Y`}</M> est
            gouvernée par <M>{`\\phi_x`}</M>. Rien n'impose <M>{`\\phi_x = T_x`}</M>.
          </p>
          <p>
            Le paramètre incliné de la conditionnelle devient alors :
          </p>
          <D>{`
            \\eta_y^*(x) = \\eta_y + \\eta_{xy}^\\top\\,\\phi_x(x)
          `}</D>
          <p>
            C'est <M>{`\\phi_x(x)`}</M> — et non <M>{`T_x(x)`}</M> — qui incline le paramètre
            de <M>{`Y`}</M>. Deux observations <M>{`x`}</M> et <M>{`x'`}</M> qui ont le même{" "}
            <M>{`T_x(x) = T_x(x')`}</M> mais des <M>{`\\phi_x`}</M> différents induiront des
            lois conditionnelles de <M>{`Y`}</M> différentes. Inversement, deux observations
            avec <M>{`T_x(x) \\neq T_x(x')`}</M> mais <M>{`\\phi_x(x) = \\phi_x(x')`}</M>
            induiront exactement la même loi pour <M>{`Y`}</M>.
          </p>
          <p>
            La mise à jour bayésienne en tient compte : les trois blocs de <M>{`\\lambda`}</M>
            accumulent des statistiques potentiellement distinctes,
          </p>
          <D>{`
            \\lambda^{(x)} \\mathrel{+}= T_x(x_i),\\quad
            \\lambda^{(y)} \\mathrel{+}= T_y(y_j),\\quad
            \\lambda^{(xy)} \\mathrel{+}= \\phi_x(x_k)\\otimes\\phi_y(y_k)
          `}</D>
          <p>
            et les trois compteurs <M>{`\\nu`}</M> se mettent à jour indépendamment
            selon le type d'observation disponible, comme discuté en §7.
          </p>
          <div className="callout">
            <strong>Exemple.</strong> <M>{`X`}</M> gaussien avec <M>{`T_x(x) = (x, x^2)`}</M>
            — la loi marginale de <M>{`X`}</M> est entièrement décrite par sa moyenne et sa
            variance. Mais on pose <M>{`\\phi_x(x) = \\mathrm{sgn}(x)`}</M> pour le couplage :
            seul le <em>signe</em> de <M>{`X`}</M> incline la loi de <M>{`Y`}</M>, pas sa
            magnitude. Deux patients avec des températures <M>{`+0.3^\\circ`}</M>C et{" "}
            <M>{`+2^\\circ`}</M>C au-dessus de la normale induisent la même loi pour un
            symptôme binaire — la direction importe, pas l'amplitude. Ce modèle est
            parfaitement cohérent et normalisable ; il serait impossible à exprimer si on
            forçait <M>{`\\phi_x = T_x`}</M>.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 3 */}
        <Section number="§ 3" title="Théorème fondamental : la conditionnelle reste dans sa famille">
          <p>
            La propriété la plus remarquable de la densité jointe exponentielle est la suivante :
            si on conditionne sur <em>tous les voisins directs</em> de <M>{`Y`}</M> dans le modèle
            joint — c'est-à-dire sur sa <em>couverture de Markov</em> — la loi de <M>{`Y`}</M>
            reste dans la même famille exponentielle, avec un paramètre naturel <em>incliné</em>
            par chaque voisin.
          </p>
          <Box title="Théorème — la conditionnelle sur la couverture de Markov">{`
            p\\bigl(y\\mid\\mathbf{x}_{\\partial Y},\\eta\\bigr)
            \\propto h_y(y)\\,\\exp\\Bigl(
              \\eta_y^*(\\mathbf{x}_{\\partial Y})^\\top T_y(y)
            \\Bigr),
            \\quad
            \\eta_y^* = \\eta_y + \\sum_{k\\,:\\,\\eta_{ky}\\neq 0}
              \\eta_{ky}^\\top T_k(x_k)
          `}</Box>
          <p>
            La somme porte sur tous les voisins directs <M>{`k`}</M> de <M>{`Y`}</M> — ceux pour
            lesquels <M>{`\\eta_{ky} \\neq 0`}</M>. Chaque voisin contribue un décalage
            <M>{`\\eta_{ky}^\\top T_k(x_k)`}</M> au paramètre naturel de <M>{`Y`}</M>. Le résultat
            est encore une distribution dans la famille de <M>{`Y`}</M> — la conjugaison tient.
          </p>
          <D label="Paramètre incliné — formule générale">{`
            \\eta_y^*\\!(\\mathbf{x}_{\\partial Y})
            = \\eta_y + \\sum_{k \\in \\partial Y} \\eta_{ky}^\\top T_k(x_k)
          `}</D>

          <h3>La limite cruciale : conditionnement partiel et chemins indirects</h3>
          <p>
            Le théorème exige que l'on conditionne sur <em>tous</em> les voisins de <M>{`Y`}</M>,
            pas sur un sous-ensemble. Si on ne conditionne que sur certains voisins — ou sur des
            variables plus lointaines dans le graphe — la loi de <M>{`Y`}</M> sort généralement
            de sa famille, pour la même raison que la marginale : il faut intégrer sur les
            variables non observées, ce qui fait apparaître des log-partitions non linéaires.
          </p>
          <p>
            La chaîne <M>{`X - Y - Z`}</M> illustre exactement cette limite. Avec{" "}
            <M>{`\\eta_{xy} \\neq 0`}</M>, <M>{`\\eta_{yz} \\neq 0`}</M>,{" "}
            <M>{`\\eta_{xz} = 0`}</M> :
          </p>
          <D label="Chaîne X–Y–Z — deux couplages, pas de lien direct">{`
            p(x,y,z) \\propto \\exp\\!\\Bigl(
              \\eta_x T_x + \\eta_y T_y + \\eta_z T_z
              + \\eta_{xy}\\,T_x T_y
              + \\eta_{yz}\\,T_y T_z
            \\Bigr)
          `}</D>
          <p>
            Le théorème s'applique correctement à chaque conditionnelle <em>sur la couverture
            complète</em> :
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Conditionnelle</th>
                <th>Couverture complète ?</th>
                <th>Paramètre incliné</th>
                <th>Reste dans la famille ?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`p(y\\mid x, z)`}</M></td>
                <td className="accent">Oui — ∂Y = {"{"}X, Z{"}"}</td>
                <td><M>{`\\eta_y + \\eta_{xy}\\,T_x + \\eta_{yz}\\,T_z`}</M></td>
                <td className="accent">Oui</td>
              </tr>
              <tr>
                <td><M>{`p(x\\mid y)`}</M></td>
                <td className="accent">Oui — ∂X = {"{"}Y{"}"}</td>
                <td><M>{`\\eta_x + \\eta_{xy}\\,T_y`}</M></td>
                <td className="accent">Oui</td>
              </tr>
              <tr>
                <td><M>{`p(z\\mid x)`}</M></td>
                <td>Non — Z est lié à X via Y</td>
                <td><M>{`\\int p(z\\mid y)\\,p(y\\mid x)\\,dy`}</M></td>
                <td>Non — mélange de distributions</td>
              </tr>
            </tbody>
          </table>
          <p>
            La conditionnelle <M>{`p(z\\mid x)`}</M> est un mélange continu de distributions dans la
            famille de <M>{`Z`}</M>, pondéré par <M>{`p(y \\mid x)`}</M>. Elle sort donc de la
            famille — exactement comme §4 le prédit pour la marginale. Formellement :
          </p>
          <D>{`
            p(z\\mid x) = \\int p(z\\mid y)\\,p(y\\mid x)\\,dy
            \\propto \\int h_z(z)\\,
            \\exp\\!\\bigl(\\eta_{yz}^*(y)^\\top T_z(z)\\bigr)
            \\cdot p(y\\mid x)\\,dy
          `}</D>
          <p>
            L'exposant dépend de <M>{`y`}</M> à travers <M>{`\\eta_{yz}^*(y) = \\eta_z + \\eta_{yz}\\,T_y(y)`}</M>.
            Intégrer sur <M>{`y`}</M> revient à évaluer la log-partition de <M>{`Y`}</M> au
            paramètre incliné par <M>{`z`}</M> — le même mécanisme de sortie de famille qu'en §4,
            mais cette fois pour la conditionnelle distante plutôt que pour la marginale.
          </p>

          <h3>Absence de couplage direct n'implique pas indépendance marginale</h3>
          <p>
            Hammersley-Clifford (§6) garantit <M>{`X \\perp\\!\\!\\!\\perp Z \\mid Y`}</M> quand{" "}
            <M>{`\\eta_{xz} = 0`}</M> — une indépendance <em>conditionnelle</em>. Mais{" "}
            <M>{`X`}</M> et <M>{`Z`}</M> sont <em>marginalement dépendants</em> : la
            corrélation entre <M>{`T_x(X)`}</M> et <M>{`T_z(Z)`}</M> est non nulle dès que
            les deux couplages existent. La loi marginale jointe de <M>{`(X, Z)`}</M> est :
          </p>
          <D>{`
            p(x,z) = \\int p(x,y,z)\\,dy
            \\propto h_x h_z \\exp\\!\\Bigl(
              \\eta_x T_x + \\eta_z T_z
              + \\underbrace{A_y(\\eta_y + \\eta_{xy} T_x + \\eta_{yz} T_z)}_{
                \\text{couplage indirect }X{-}Z}
            \\Bigr)
          `}</D>
          <p>
            Le terme <M>{`A_y(\\eta_y + \\eta_{xy} T_x + \\eta_{yz} T_z)`}</M> couple{" "}
            <M>{`T_x`}</M> et <M>{`T_z`}</M> de façon non linéaire, même en l'absence de
            <M>{`\\eta_{xz}`}</M> direct. C'est la <em>dépendance induite</em> : marginaliser sur
            un intermédiaire connecté à deux variables crée un couplage apparent entre elles —
            l'analogue probabiliste du lemme de d-séparation dans les graphes bayésiens.
          </p>

          <div className="callout">
            <strong>Récapitulatif corrigé du théorème.</strong>{" "}
            <M>{`p(y \\mid \\mathbf{x}_{\\partial Y})`}</M> reste dans la famille de <M>{`Y`}</M>
            si et seulement si on conditionne sur la couverture complète de <M>{`Y`}</M>. Dès
            qu'un voisin est manquant — ou qu'on conditionne sur une variable non voisine — on
            intègre sur des inconnues et on sort de la famille. En particulier, l'absence de
            couplage direct <M>{`\\eta_{xz} = 0`}</M> garantit <M>{`X \\perp Z \\mid Y`}</M>,
            pas <M>{`X \\perp Z`}</M> : la dépendance indirecte via <M>{`Y`}</M> survit
            toujours à la marginalisation.
          </div>

          <h3>Connexion aux modèles linéaires généralisés</h3>
          <p>
            Dans un GLM, on modélise explicitement <M>{`p(y\\mid x)`}</M> — on suppose que
            <M>{`X`}</M> est la couverture complète de <M>{`Y`}</M>, c'est-à-dire qu'il n'existe
            aucune variable latente couplée à <M>{`Y`}</M> mais non observée. Sous cette
            hypothèse, le paramètre incliné <M>{`\\eta_y^*(x) = \\eta_y + \\eta_{xy}^\\top T_x(x)`}</M>
            suffit et la conditionnelle reste dans sa famille. La « fonction de lien » n'est autre
            que <M>{`\\nabla A_y`}</M> vue depuis l'autre sens.
          </p>
          <div className="callout">
            <strong>Intuition géométrique.</strong> Chaque valeur observée de la couverture de
            Markov sélectionne un point dans la famille de <M>{`Y`}</M> via la carte affine{" "}
            <M>{`\\mathbf{x}_{\\partial Y} \\mapsto \\eta_y + \\sum_{k \\in \\partial Y} \\eta_{ky}^\\top T_k(x_k)`}</M>.
            Faire varier un voisin <M>{`x_k`}</M> trace une droite dans l'espace des paramètres
            naturels de <M>{`Y`}</M> — dans la direction <M>{`\\eta_{ky}`}</M>, indépendamment
            des autres voisins. Les contributions des voisins s'<em>additionnent</em>.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 4 */}
        <Section number="§ 4" title="La marginale sort de sa famille">
          <p>
            La situation est asymétrique : si la conditionnelle de <M>{`Y`}</M> sachant <M>{`X`}</M>{" "}
            reste dans la famille de <M>{`Y`}</M>, la <em>marginale de <M>{`X`}</M></em>, elle, en sort
            généralement. L'intégration sur <M>{`y`}</M> fait apparaître la log-partition de
            <M>{`Y`}</M> évaluée au paramètre incliné :
          </p>
          <D label="Loi marginale de X — forme générale">{`
            p(x\\mid\\eta) \\propto h_x(x)\\,\\exp\\!\\Bigl(
              \\eta_x^\\top T_x(x) + A_y\\!\\bigl(\\eta_y + \\eta_{xy}^\\top T_x(x)\\bigr)
            \\Bigr)
          `}</D>
          <p>
            Le terme <M>{`A_y(\\eta_y + \\eta_{xy}^\\top T_x(x))`}</M> est en général une fonction
            <em> non linéaire</em> de <M>{`T_x(x)`}</M>. La statistique suffisante de la marginale
            ne peut donc pas se résumer à <M>{`T_x(x)`}</M> seul — sauf exception.
          </p>


          <div className="callout">
            <strong>Asymétrie fondamentale.</strong> Conditionner est gratuit dans la famille
            exponentielle. Marginaliser est coûteux — sauf dans les cas polynomiaux. C'est cette
            asymétrie qui justifie l'omniprésence des modèles conditionnels (GLM, réseaux de neurones)
            par rapport aux modèles joints complets.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 5 */}
        <Section number="§ 5" title="L'interaction cross-type — deux familles différentes">
          <p>
            Rien dans la construction précédente n'exige que <M>{`X`}</M> et <M>{`Y`}</M> appartiennent
            à la même famille exponentielle. Le terme d'interaction <M>{`\\eta_{xy} T_x(x) T_y(y)`}</M>
            couple les statistiques suffisantes de deux familles <em>arbitraires et distinctes</em>.
          </p>
          <p>
            La conditionnelle de <M>{`Y`}</M> sachant <M>{`X`}</M> reste dans la famille de{" "}
            <M>{`Y`}</M> — peu importe la famille de <M>{`X`}</M>. La seule trace de <M>{`X`}</M>{" "}
            dans cette conditionnelle est la valeur scalaire <M>{`T_x(x)`}</M>, qui incline le
            paramètre naturel.
          </p>

          <h3>Catalogue des interactions cross-type</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th><M>{`T_x(x)`}</M></th>
                <th><M>{`T_y(y)`}</M></th>
                <th>Forme du couplage</th>
                <th>Effet sur <M>{`p(y|x)`}</M></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`x`}</M></td>
                <td><M>{`y`}</M></td>
                <td><M>{`\\eta_{xy}\\cdot x\\cdot y`}</M></td>
                <td>Mode de <M>{`Y`}</M> se déplace linéairement en <M>{`x`}</M></td>
              </tr>
              <tr>
                <td><M>{`x`}</M></td>
                <td><M>{`|y|`}</M></td>
                <td><M>{`\\eta_{xy}\\cdot x\\cdot|y|`}</M></td>
                <td>Dispersion de <M>{`Y`}</M> modulée par <M>{`x`}</M></td>
              </tr>
              <tr>
                <td><M>{`\\mathrm{sgn}(x)`}</M></td>
                <td><M>{`y`}</M></td>
                <td><M>{`\\eta_{xy}\\cdot\\mathrm{sgn}(x)\\cdot y`}</M></td>
                <td>Décalage discret du mode (flip à <M>{`x=0`}</M>)</td>
              </tr>
              <tr>
                <td><M>{`|x|`}</M></td>
                <td><M>{`\\mathrm{sgn}(y)`}</M></td>
                <td><M>{`\\eta_{xy}\\cdot|x|\\cdot\\mathrm{sgn}(y)`}</M></td>
                <td>Intensité de <M>{`X`}</M> biaise l'orientation de <M>{`Y`}</M></td>
              </tr>
            </tbody>
          </table>
          <p>
            Dans chaque cas, le paramètre incliné de <M>{`Y`}</M> est{" "}
            <M>{`\\eta_y^*(x) = \\eta_y + \\eta_{xy}\\cdot T_x(x)`}</M>. Ce qui change, c'est la
            <em> forme de la fonction</em> <M>{`x \\mapsto T_x(x)`}</M> qui module cette inclinaison —
            linéaire, en V, en marche d'escalier, symétrique ou non.
          </p>
          <div className="callout">
            <strong>La famille de <M>{`X`}</M> est transparente.</strong> Du point de vue de
            <M>{`Y`}</M>, ce qui importe n'est pas la distribution de <M>{`X`}</M> mais seulement
            la valeur de <M>{`T_x(x)`}</M>. Deux <M>{`x`}</M> donnant le même
            <M>{`T_x(x)`}</M> induisent exactement la même loi conditionnelle pour <M>{`Y`}</M>.
            C'est le théorème de suffisance vu sous l'angle de l'interaction.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 5bis */}
        <Section number="§ 5bis" title="Directionalité — ce que η_xy peut et ne peut pas encoder">
          <p>
            Une question naturelle se pose : peut-on faire en sorte que l'interaction soit
            <em> orientée</em> — que <M>{`X`}</M> influence <M>{`Y`}</M> mais pas l'inverse ?
            La réponse courte est non, pas dans le cadre d'une densité jointe. Mais la nuance
            mérite d'être déroulée avec soin, car la structure de <M>{`\\eta_{xy}`}</M> crée
            bien une forme d'asymétrie — géométrique, pas causale.
          </p>

          <h3>L'obstacle fondamental : la symétrie du scalaire</h3>
          <p>
            Le terme d'interaction est un scalaire. En permutant les rôles de{" "}
            <M>{`X`}</M> et <M>{`Y`}</M> :
          </p>
          <D>{`
            T_x(x)^\\top\\,\\eta_{xy}\\,T_y(y)
            \\ =\\ T_y(y)^\\top\\,\\eta_{xy}^\\top\\,T_x(x)
          `}</D>
          <p>
            Les deux expressions sont identiques — c'est la même valeur scalaire, écrite dans
            deux ordres différents. La densité jointe <M>{`p(x,y)`}</M> est donc invariante par
            l'échange <M>{`(x,y,\\eta_{xy}) \\leftrightarrow (y,x,\\eta_{xy}^\\top)`}</M> :
          </p>
          <D>{`
            p(x,y\\mid\\eta_x,\\eta_y,\\eta_{xy})
            = p(y,x\\mid\\eta_y,\\eta_x,\\eta_{xy}^\\top)
          `}</D>
          <p>
            Un modèle avec couplage <M>{`\\eta_{xy}`}</M> dans le sens <M>{`X \\to Y`}</M> est
            <em> rigoureusement indiscernable</em> — du point de vue de la densité jointe — d'un
            modèle avec couplage <M>{`\\eta_{xy}^\\top`}</M> dans le sens <M>{`Y \\to X`}</M>.
            La distribution de probabilité sur les couples <M>{`(x, y)`}</M> ne peut pas encoder
            de directionalité : elle est une mesure sur un produit d'espaces, pas sur des flèches.
          </p>
          <div className="callout">
            <strong>La directionalité est une propriété du générateur, pas de la distribution.</strong>{" "}
            Deux physiciens peuvent regarder la même loi jointe gaussienne et l'un dire
            « <M>{`X`}</M> cause <M>{`Y`}</M> » et l'autre « <M>{`Y`}</M> cause <M>{`X`}</M> » :
            aucune donnée d'observation ne peut les départager si leur modèle est seulement
            <M>{`p(x,y)`}</M>. C'est la thèse centrale de l'inférence causale (Pearl, Spirtes).
          </div>

          <h3>Ce que la structure de η_xy encode réellement : l'asymétrie des conditionnelles</h3>
          <p>
            Même si <M>{`p(x,y)`}</M> ne porte pas de directionalité, les deux conditionnelles
            <M>{`p(y\\mid x)`}</M> et <M>{`p(x\\mid y)`}</M> ont des formes <em>généralement
            différentes</em>, et c'est là que la structure de <M>{`\\eta_{xy}`}</M> joue un rôle.
          </p>
          <p>
            Supposons <M>{`T_x`}</M> de dimension <M>{`k_x`}</M> et <M>{`T_y`}</M> de dimension
            <M>{`k_y`}</M>, avec <M>{`\\eta_{xy} \\in \\mathbb{R}^{k_x \\times k_y}`}</M>. Les deux
            paramètres inclinés sont :
          </p>
          <D label="Paramètres inclinés dans les deux sens">{`
            \\eta_y^*(x) = \\eta_y + \\eta_{xy}^\\top T_x(x) \\in \\mathbb{R}^{k_y},
            \\qquad
            \\eta_x^*(y) = \\eta_x + \\eta_{xy}\\, T_y(y) \\in \\mathbb{R}^{k_x}
          `}</D>
          <p>
            La décomposition en valeurs singulières de{" "}
            <M>{`\\eta_{xy} = U\\,\\Sigma\\,V^\\top`}</M> révèle la géométrie de cette
            inclinaison. Les colonnes de <M>{`V`}</M> sont les <em>directions de</em>{" "}
            <M>{`T_x`}</M> qui modulent <M>{`\\eta_y^*`}</M> ; les colonnes de <M>{`U`}</M> sont
            les <em>directions de</em> <M>{`T_y`}</M> qui modulent <M>{`\\eta_x^*`}</M>. Les
            valeurs singulières <M>{`\\sigma_k`}</M> mesurent l'intensité de chaque canal.
          </p>

          <h3>Rang de η_xy et dimensionnalité de l'interaction</h3>
          <p>
            Si <M>{`\\mathrm{rang}(\\eta_{xy}) = r`}</M>, l'interaction passe entièrement par
            <M>{`r`}</M> canaux indépendants. Au rang 1 — le cas le plus simple —{" "}
            <M>{`\\eta_{xy} = \\sigma\\, u v^\\top`}</M> et :
          </p>
          <D>{`
            \\eta_y^*(x) = \\eta_y + \\sigma\\,(v^\\top T_x(x))\\,u,
            \\qquad
            \\eta_x^*(y) = \\eta_x + \\sigma\\,(u^\\top T_y(y))\\,v
          `}</D>
          <p>
            Du côté <M>{`Y`}</M>, seule la projection <M>{`v^\\top T_x(x)`}</M> importe — toute
            l'information de <M>{`x`}</M> est compressée en un scalaire avant d'incliner
            <M>{`\\eta_y`}</M> dans la direction <M>{`u`}</M>. Symétriquement du côté <M>{`X`}</M>.
            La structure de rang révèle la <em>dimensionnalité effective du canal d'interaction</em>,
            mais de façon parfaitement symétrique.
          </p>

          <h3>La non-carrure de η_xy crée une asymétrie structurelle</h3>
          <p>
            Si <M>{`k_x \\neq k_y`}</M> — statistiques suffisantes de dimensions différentes —
            alors <M>{`\\eta_{xy}`}</M> est une matrice rectangulaire. Les deux inclinaisons ont
            alors des <em>dimensions différentes</em> :
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Conditionnelle</th>
                <th>Paramètre incliné</th>
                <th>Dimension</th>
                <th>Sens du transfert</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`p(y\\mid x)`}</M></td>
                <td><M>{`\\eta_y + \\eta_{xy}^\\top T_x(x)`}</M></td>
                <td><M>{`k_y`}</M></td>
                <td><M>{`k_x`}</M> dimensions → <M>{`k_y`}</M> dim.</td>
              </tr>
              <tr>
                <td><M>{`p(x\\mid y)`}</M></td>
                <td><M>{`\\eta_x + \\eta_{xy}\\, T_y(y)`}</M></td>
                <td><M>{`k_x`}</M></td>
                <td><M>{`k_y`}</M> dimensions → <M>{`k_x`}</M> dim.</td>
              </tr>
            </tbody>
          </table>
          <p>
            Si <M>{`k_x > k_y`}</M>, le passage <M>{`X \\to Y`}</M> est une{" "}
            <em>compression</em> (projection de <M>{`k_x`}</M> sur <M>{`k_y`}</M> dimensions),
            tandis que <M>{`Y \\to X`}</M> est une <em>expansion</em>. Les deux conditionnelles
            ont structurellement des propriétés différentes — l'une est un goulot
            d'étranglement, l'autre un enrichissement. Mais ces propriétés sont déterminées par
            le ratio <M>{`k_x / k_y`}</M>, pas par un choix de direction causale.
          </p>

          <h3>Comment encoder une vraie directionalité : la factorisation de la jointe</h3>
          <p>
            La seule façon d'inscrire une directionalité dans le modèle est de choisir
            explicitement une <em>factorisation causale</em> de la loi jointe. Déroulons
            les deux sens pour voir quelles contraintes structurelles cela impose sur le
            triplet <M>{`(\\eta_x, \\eta_y, \\eta_{xy})`}</M> et les fonctions{" "}
            <M>{`(T_x, T_y, \\phi_x, \\phi_y)`}</M> — en ignorant les constantes de normalisation,
            toujours intractables.
          </p>

          <h3>Factorisation X → Y</h3>
          <p>
            On postule <M>{`p(x)`}</M> dans la famille de <M>{`X`}</M> et{" "}
            <M>{`p(y\\mid x)`}</M> dans la famille de <M>{`Y`}</M> à paramètre incliné.
            En développant le produit :
          </p>
          <D>{`
            \\log p(x,y) \\propto
            \\;\\eta_x^\\top T_x(x)
            \\;+\\; \\eta_y^\\top T_y(y)
            \\;+\\; \\phi_x(x)^\\top \\eta_{xy}\\, \\mathbf{T_y(y)}
          `}</D>
          <p>
            La statistique de couplage côté <M>{`Y`}</M> est <em>forcée</em> d'être{" "}
            <M>{`T_y`}</M> — la même fonction que celle qui définit la loi marginale de{" "}
            <M>{`Y`}</M>. On ne peut pas choisir <M>{`\\phi_y \\neq T_y`}</M> librement :
            ce serait modéliser <M>{`p(y\\mid x)`}</M> dans une famille différente de celle
            de <M>{`Y`}</M>.
          </p>

          <h3>Factorisation Y → X</h3>
          <p>
            Le sens inverse force symétriquement :
          </p>
          <D>{`
            \\log p(x,y) \\propto
            \\;\\eta_x^\\top \\mathbf{T_x(x)}
            \\;+\\; \\eta_y^\\top T_y(y)
            \\;+\\; T_x(x)^\\top \\eta_{xy}^\\top\\, \\phi_y(y)
          `}</D>
          <p>
            Cette fois c'est <M>{`\\phi_x = T_x`}</M> qui est figé. La statistique de
            couplage côté <M>{`X`}</M> doit coïncider avec la statistique marginale de{" "}
            <M>{`X`}</M>.
          </p>

          <Box title="Contraintes structurelles — résumé">{`
            X \\to Y \\implies \\phi_y = T_y, \\quad \\phi_x \\text{ libre}\\\\[6pt]
            Y \\to X \\implies \\phi_x = T_x, \\quad \\phi_y \\text{ libre}
          `}</Box>

          <p>
            La contrainte est donc toujours du côté de la variable <em>causée</em> : sa
            statistique de couplage est verrouillée sur sa propre statistique marginale.
            La variable <em>cause</em> garde une liberté totale sur <M>{`\\phi`}</M> —
            elle peut présenter un résumé différent de ses données pour le couplage que
            pour sa loi propre.
          </p>
          <p>
            Conséquence immédiate : un modèle joint avec{" "}
            <M>{`\\phi_x \\neq T_x`}</M> <em>et</em> <M>{`\\phi_y \\neq T_y`}</M>
            simultanément ne peut être décomposé sous aucune des deux factorisations
            tout en maintenant chaque composante dans sa famille exponentielle. C'est un
            modèle genuinement joint — il ne correspond à aucun mécanisme directionnel
            propre.
          </p>
          <div className="callout">
            <strong>Ce que la directionalité contraint vraiment.</strong> Choisir{" "}
            <M>{`X \\to Y`}</M> ne contraint pas <M>{`\\eta_{xy}`}</M> lui-même — il
            reste un paramètre libre. Ce qu'il contraint, c'est <M>{`\\phi_y`}</M> :
            la façon dont <M>{`Y`}</M> participe au couplage doit être la même que la
            façon dont <M>{`Y`}</M> se distribue marginalement. Autrement dit, on ne
            peut pas choisir de ne coupler <M>{`X`}</M> qu'à une <em>fonction partielle</em>
            de <M>{`Y`}</M> tout en restant dans le cadre directionnel — le couplage
            porte sur toute la statistique suffisante de <M>{`Y`}</M>, sans exception.
          </div>


          <h3>Le cas où la distribution peut trahir une direction — LiNGAM</h3>
          <p>
            Il existe un cas remarquable où la distribution observée <em>peut</em> révéler une
            direction causale préférentielle : lorsque les lois marginales appartiennent à des
            familles distinctes et que les résidus du modèle causal sont non gaussiens.
          </p>
          <p>
            Le modèle additif à bruit non gaussien postule <M>{`Y = f(X) + \\varepsilon`}</M> avec{" "}
            <M>{`\\varepsilon \\perp X`}</M>. Si <M>{`\\varepsilon`}</M> est non gaussien, le
            modèle inverse <M>{`X = g(Y) + \\varepsilon'`}</M> ne peut en général{" "}
            <em>pas</em> satisfaire simultanément <M>{`\\varepsilon' \\perp Y`}</M> — sauf si la
            distribution est gaussienne (cas dégénéré où les deux directions sont également
            valides). Hors du cas gaussien, la direction causale est donc identifiable depuis
            la seule distribution jointe.
          </p>
          <p>
            Ce résultat n'est pas une propriété de <M>{`\\eta_{xy}`}</M>, mais une conséquence
            des <em>contraintes de la famille exponentielle</em> sur la structure des résidus.
            La gaussienne est le seul membre de la famille exponentielle pour lequel
            la directionalité causale reste non identifiable depuis la distribution jointe — ce
            qui explique a posteriori pourquoi les familles exponentielles non gaussiennes
            (Poisson, Bernoulli, Gamma...) portent une information causale que la gaussienne
            ne porte pas.
          </p>
          <h3>Exemple — grippe (Bernoulli) × température (Gaussienne)</h3>
          <p>
            Reprenons le patient fébrile du chapitre 4, mais en ajoutant une variable binaire :{" "}
            <M>{`X \in \{0,1\}`}</M> indique la présence d'une grippe, et{" "}
            <M>{`Y`}</M> est la température mesurée. Les deux familles sont différentes —
            Bernoulli pour <M>{`X`}</M>, Gaussienne pour <M>{`Y`}</M>. Le terme d'interaction est
            scalaire, <M>{`T_x(x) = x`}</M>, <M>{`T_y(y) = y`}</M>.
          </p>
          <p>
            Avec les paramètres numériques : prévalence de base{" "}
            <M>{`\\pi_0 = 0.3`}</M>, température saine <M>{`\\mu_0 = 36.8^\\circ`}</M>C,
            écart-type instrument <M>{`\\sigma = 0.4^\\circ`}</M>C, et fièvre{" "}
            <M>{`\\delta = 1.7^\\circ`}</M>C en cas de grippe. Le paramètre d'interaction vaut :
          </p>
          <D label="Identification de η_xy depuis les paramètres cliniques">{`
            \\eta_{xy} = \\frac{\\delta}{\\sigma^2} = \\frac{1.7}{0.16} \\approx 10.6,
            \\qquad
            \\eta_x = \\log\\frac{\\pi_0}{1-\\pi_0} \\approx -0.85,
            \\qquad
            \\eta_y = \\frac{\\mu_0}{\\sigma^2} \\approx 230
          `}</D>
          <p>
            Un seul scalaire, <M>{`\\eta_{xy} \\approx 10.6`}</M>, encode tout le couplage.
            Les deux conditionnelles se lisent immédiatement depuis le paramètre incliné :
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Conditionnelle</th>
                <th>Paramètre incliné</th>
                <th>Forme</th>
                <th>Interprétation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`p(y \\mid x)`}</M></td>
                <td><M>{`\\eta_y^*(x) = \\eta_y + \\eta_{xy}\\cdot x`}</M></td>
                <td><M>{`\\mathcal{N}(\\mu_0 + \\delta\\cdot x,\\;\\sigma^2)`}</M></td>
                <td>Gaussienne décalée de +1.7°C si grippe</td>
              </tr>
              <tr>
                <td><M>{`p(x \\mid y)`}</M></td>
                <td><M>{`\\eta_x^*(y) = \\eta_x + \\eta_{xy}\\cdot y`}</M></td>
                <td><M>{`\\mathrm{Bernoulli}\\bigl(\\sigma(\\eta_x + \\eta_{xy}\\,y)\\bigr)`}</M></td>
                <td>Régression logistique de la grippe sur la température</td>
              </tr>
            </tbody>
          </table>

          <p>
            Les deux conditionnelles coexistent dans la même densité jointe. La première est la
            narration clinique naturelle — la grippe provoque la fièvre. La seconde est
            mathématiquement cohérente mais causalement absurde : la température <em>cause</em>{" "}
            la grippe. La densité jointe est muette sur laquelle choisir.
          </p>

          <h3>Pourquoi la distribution trahit malgré tout la direction ici</h3>
          <p>
            C'est précisément parce que <M>{`X`}</M> est <em>Bernoulli</em> — non gaussien —
            que la direction causale est identifiable. Supposons le modèle génératif{" "}
            <M>{`Y = \mu_0 + \delta X + \varepsilon`}</M> avec <M>{`\varepsilon \sim \mathcal{N}(0,\sigma^2)`}</M>{" "}
            et <M>{`\varepsilon \perp X`}</M>. La loi marginale de <M>{`Y`}</M> est alors un
            mélange de deux gaussiennes :
          </p>
          <D>{`
            p(y) = 0.7\;\mathcal{N}(36.8, 0.16) + 0.3\;\mathcal{N}(38.5, 0.16)
          `}</D>
          <p>
            Ce mélange bimodal est la signature de la direction <M>{`X \to Y`}</M>. Peut-on
            écrire un modèle inverse <M>{`X = g(Y) + \varepsilon'`}</M> avec{" "}
            <M>{`\varepsilon' \perp Y`}</M> dans la même forme additive ? Non — car{" "}
            <M>{`X`}</M> est binaire : pour tout <M>{`g`}</M>, le « résidu »{" "}
            <M>{`\varepsilon' = X - g(Y)`}</M> ne peut pas être indépendant de <M>{`Y`}</M>,
            puisque la distribution de <M>{`Y`}</M> est un mélange dont les composantes sont
            indexées par <M>{`X`}</M> lui-même. Toute information sur <M>{`Y`}</M> contient
            de l'information sur <M>{`X`}</M> — le résidu ne peut pas s'en affranchir.
          </p>
          <p>
            Concrètement : observer <M>{`Y = 38.5^{\circ}`}</M>C met à jour la probabilité
            de grippe via{" "}
            <M>{`p(x=1 \mid y=38.5) = \sigma(-0.85 + 10.6 \times 38.5) \approx 1`}</M>.
            Le signal résiduel de <M>{`X`}</M> dans <M>{`Y`}</M> reste informatif — il ne
            disparaît jamais dans un bruit indépendant de <M>{`Y`}</M>. La direction{" "}
            <M>{`X \to Y`}</M> est la seule pour laquelle un modèle additif à résidus
            indépendants existe.
          </p>
          <div className="callout">
            <strong>Bilan.</strong> La matrice <M>{`\\eta_{xy}`}</M> peut encoder l'<em>intensité</em>
            du couplage (via ses valeurs singulières), sa <em>dimensionnalité effective</em>
            (via son rang), et la <em>géométrie des directions couplées</em> (via sa SVD).
            Elle ne peut pas encoder de directionalité causale — la densité jointe est
            intrinsèquement symétrique. La vraie directionalité requiert soit de choisir
            explicitement une factorisation <M>{`p(y|x)\\,p(x)`}</M>, soit de se placer hors
            du cas gaussien : dans l'exemple grippe × température, la nature discrète de
            <M>{`X`}</M> rend le modèle inverse structurellement impossible, et la direction
            <M>{`X \\to Y`}</M> est identifiable depuis la distribution jointe seule.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 6 */}
        <Section number="§ 6" title="Champs de Markov exponentiels">
          <p>
            La construction se généralise naturellement à <M>{`p`}</M> variables. La densité jointe
            d'un <em>champ de Markov exponentiel</em> sur <M>{`(X_1,\\dots,X_p)`}</M> s'écrit :
          </p>
          <D label="Champ de Markov — forme générale">{`
            p(x_1,\\dots,x_p\\mid\\eta)
            = \\frac{1}{Z(\\eta)}\\,\\prod_i h_i(x_i)\\,
            \\exp\\!\\Bigl(
              \\sum_i \\eta_i^\\top T_i(x_i)
              + \\sum_{i < j} T_i(x_i)^\\top\\,\\eta_{ij}\\,T_j(x_j)
            \\Bigr)
          `}</D>
          <p>
            La collection de matrices <M>{`(\\eta_{ij})_{i < j}`}</M> définit un graphe non orienté :
            une arête entre <M>{`i`}</M> et <M>{`j`}</M> existe si et seulement si{" "}
            <M>{`\\eta_{ij} \\neq 0`}</M>. Ce graphe encode exactement les indépendances
            conditionnelles du modèle.
          </p>
          <Box title="Théorème de Hammersley-Clifford">{`
            X_i \\perp\\!\\!\\!\\perp X_j \\mid \\mathbf{x}_{-ij}
            \\iff \\eta_{ij} = 0
          `}</Box>
          <p>
            Autrement dit, l'<em>annulation d'un paramètre d'interaction</em> est équivalente à une
            indépendance conditionnelle — une correspondance parfaite entre la géométrie algébrique du
            modèle et sa structure probabiliste.
          </p>

          <h3>Le modèle d'Ising comme cas particulier</h3>
          <p>
            Si chaque <M>{`X_i \\in \\{-1,+1\\}`}</M> avec <M>{`T_i(x_i) = x_i`}</M>, le champ de
            Markov exponentiel donne exactement le modèle d'Ising de la physique statistique :
          </p>
          <D>{`
            p(\\mathbf{x}\\mid J, h) \\propto \\exp\\!\\Bigl(\\sum_{i} h_i x_i + \\sum_{i<j} J_{ij}\\,x_i x_j\\Bigr)
          `}</D>
          <p>
            où <M>{`h_i = \\eta_i`}</M> est le champ local et <M>{`J_{ij} = \\eta_{ij}`}</M> est le
            couplage. La physique des transitions de phase — ferromagnétisme, liquide-gaz — est encodée
            dans le seul schéma de non-zéros de <M>{`(J_{ij})`}</M>.
          </p>
          <div className="callout">
            <strong>La structure de la famille suffit à tout décrire.</strong> Les indépendances
            conditionnelles, la structure graphique, la séparabilité du modèle : tout cela se lit dans
            le schéma de zéros du tenseur d'interaction <M>{`(\\eta_{ij})`}</M>. On n'a pas besoin de
            calculer des probabilités — le paramètre seul révèle la géométrie des dépendances.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 7 */}
        <Section number="§ 7" title="Mise à jour conjuguée — les statistiques croisées s'accumulent">
          <p>
            La beauté du cadre conjugué s'étend intact au cas joint. Un échantillon de{" "}
            <M>{`n`}</M> paires <M>{`(x_i, y_i)`}</M> forme une famille exponentielle avec statistique
            suffisante jointe. La même règle de mise à jour en deux additions s'applique — avec un
            bloc supplémentaire pour le terme croisé :
          </p>
          <Box title="Règle de mise à jour — statistiques croisées">{`
            \\lambda_n = \\begin{pmatrix}
              \\lambda_0^{(x)} + \\sum_i T_x(x_i) \\\\[4pt]
              \\lambda_0^{(y)} + \\sum_i T_y(y_i) \\\\[4pt]
              \\lambda_0^{(xy)} + \\sum_i T_x(x_i)\\otimes T_y(y_i)
            \\end{pmatrix},
            \\qquad \\nu_n = \\nu_0 + n
          `}</Box>
          <p>
            Le bloc croisé <M>{`\\lambda_n^{(xy)}`}</M> accumule les <em>moments croisés empiriques</em>
            <M>{`\\sum_i T_x(x_i) \\otimes T_y(y_i)`}</M>. Pour les statistiques linéaires (
            <M>{`T_x(x) = x`}</M>, <M>{`T_y(y) = y`}</M>), c'est la somme <M>{`\\sum_i x_i y_i`}</M>
            — directement liée à la covariance empirique.
          </p>

          <h3>Interprétation des trois blocs de λ</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bloc</th>
                <th>Ce qu'il accumule</th>
                <th>Information portée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`\\lambda^{(x)}`}</M></td>
                <td><M>{`\\sum_i T_x(x_i)`}</M></td>
                <td>Comportement marginal de <M>{`X`}</M></td>
              </tr>
              <tr>
                <td><M>{`\\lambda^{(y)}`}</M></td>
                <td><M>{`\\sum_i T_y(y_i)`}</M></td>
                <td>Comportement marginal de <M>{`Y`}</M></td>
              </tr>
              <tr>
                <td><M>{`\\lambda^{(xy)}`}</M></td>
                <td><M>{`\\sum_i T_x(x_i)\\otimes T_y(y_i)`}</M></td>
                <td>Dépendance, corrélation, couplage</td>
              </tr>
            </tbody>
          </table>
          <p>
            La mise à jour de <M>{`\\eta_{xy}`}</M> a posteriori dépend uniquement de
            <M>{`\\lambda^{(xy)}`}</M> et de <M>{`\\nu_n`}</M> — exactement comme le
            sous-chapitre 4.4 pour les paramètres marginaux. La <em>structure algébrique est
            identique</em> ; seule la dimension du vecteur <M>{`\\lambda`}</M> a grandi.
          </p>
          <div className="callout">
            <strong>Le résultat le plus profond.</strong> Toute l'information sur l'interaction
            entre <M>{`X`}</M> et <M>{`Y`}</M> contenue dans <M>{`n`}</M> observations est
            entièrement capturée par le vecteur de dimension fixe{" "}
            <M>{`\\lambda^{(xy)} = \\sum_i T_x(x_i) \\otimes T_y(y_i)`}</M>.
            C'est à nouveau le théorème de suffisance — appliqué au couple.
            Deux jeux de données de tailles différentes donnant le même moment croisé sont{" "}
            <em>équivalents</em> pour inférer <M>{`\\eta_{xy}`}</M>.
          </div>
        </Section>

        <hr className="rule" />

        {/* ────────────────────────────────── § 8 */}
        <Section number="§ 8" title="Simulation interactive">
          <p>
            La densité jointe simulée ci-dessous est de la forme
            <M>{`\\log p(x,y) = \\eta_x T_x(x) - \\tfrac{1}{2}x^2 - \\tfrac{1}{2}y^2 + \\eta_{xy}\\,T_x(x)\\,T_y(y)`}</M>.
            L'ancrage quadratique assure la normalisabilité pour{" "}
            <M>{`|\\eta_{xy}| < 1`}</M> (cas linéaire) ou pour tout <M>{`\\eta_{xy}`}</M>
            (statistiques bornées comme <M>{`\\mathrm{sgn}`}</M>).
          </p>

          <h3>Ce que la visualisation révèle</h3>
          <p>
            Avec <M>{`T_x = x`}</M> et <M>{`T_y = y`}</M>, la <em>courbe bleue</em> trace le mode
            conditionnel <M>{`y^*(x) = \\eta_{xy}\\cdot x`}</M> — une droite dont la pente est
            exactement le paramètre d'interaction. C'est la régression de <M>{`Y`}</M> sur
            <M>{`T_x(X)`}</M>.
          </p>
          <p>
            En passant à <M>{`T_x = |x|`}</M>, la courbe devient un V : le mode conditionnel est
            symétrique, la dépendance ne distingue pas <M>{`x > 0`}</M> de <M>{`x < 0`}</M>.
            Avec <M>{`T_x = \\mathrm{sgn}(x)`}</M>, la courbe devient une marche d'escalier : le signe
            seul de <M>{`X`}</M> détermine la loi conditionnelle de <M>{`Y`}</M>.
          </p>
          <p>
            Dans chaque cas, le panneau de droite montre <M>{`p(y\\mid x = x_0)`}</M> : la même
            formule <M>{`\\eta_y^*(x_0) = \\eta_{xy}\\cdot T_x(x_0)`}</M> est à l'œuvre, la forme de
            <M>{`T_x`}</M> changeant uniquement la façon dont <M>{`x_0`}</M> est résumé.
          </p>

          <InteractionWidget />

          <div className="callout" style={{ marginTop: 24 }}>
            <strong>Lecture de la simulation.</strong> Quand <M>{`\\eta_{xy} = 0`}</M>, les contours
            de la densité jointe sont circulaires et le panneau conditionnel est identique pour
            toute valeur de <M>{`x_0`}</M> — indépendance parfaite. En augmentant{" "}
            <M>{`|\\eta_{xy}|`}</M>, les contours s'inclient et le mode conditionnel se déplace.
            Changer la statistique suffisante change la <em>géométrie</em> de cette inclinaison
            sans modifier la formule abstraite du couplage.
          </div>
        </Section>

        <hr className="rule" />

        {/* ── Synthèse ── */}
        <Section number="Synthèse" title="Ce que la structure des interactions révèle">
          <table className="data-table">
            <thead>
              <tr>
                <th>Objet</th>
                <th>Rôle</th>
                <th>Propriété clé</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`T_x(x) \\otimes T_y(y)`}</M></td>
                <td>Statistique suffisante croisée</td>
                <td>Capture toute l'information sur <M>{`\\eta_{xy}`}</M></td>
              </tr>
              <tr>
                <td><M>{`\\eta_{xy}`}</M></td>
                <td>Paramètre d'interaction</td>
                <td><M>{`= 0`}</M> iff indépendance conditionnelle</td>
              </tr>
              <tr>
                <td><M>{`\\eta_y^*(x) = \\eta_y + \\eta_{xy}^\\top T_x(x)`}</M></td>
                <td>Paramètre incliné</td>
                <td>Conditionnel : même famille, param. décalé</td>
              </tr>
              <tr>
                <td><M>{`A_y(\\eta_y^*(x))`}</M></td>
                <td>Log-partition inclinée</td>
                <td>Marginaliser = intégrer ce terme non linéaire</td>
              </tr>
              <tr>
                <td><M>{`\\lambda^{(xy)} = \\sum_i T_x(x_i)\\otimes T_y(y_i)`}</M></td>
                <td>Mémoire des interactions</td>
                <td>Suffit pour mettre à jour <M>{`\\eta_{xy}`}</M></td>
              </tr>
              <tr>
                <td>Schéma de zéros de <M>{`(\\eta_{ij})`}</M></td>
                <td>Graphe des dépendances</td>
                <td>Hammersley-Clifford : graphe = indépendances</td>
              </tr>
            </tbody>
          </table>
          <div className="callout" style={{ marginTop: 20 }}>
            <strong>Le fil conducteur.</strong> Que ce soient deux variables ou <M>{`p`}</M> variables,
            qu'elles appartiennent à la même famille ou à des familles distinctes : la famille
            exponentielle jointe est toujours une famille exponentielle, et sa mise à jour est toujours
            deux additions. L'interaction entre variables n'est pas une complication — c'est juste une
            dimension supplémentaire dans l'espace des statistiques suffisantes.
          </div>
        </Section>

        <div className="chapter-footer">
          <span className="footer-label">Inférence Bayésienne · Chapitre 5</span>
          <span className="footer-label">Interactions · Familles Exponentielles</span>
        </div>

      </div>
    </>
  );
}