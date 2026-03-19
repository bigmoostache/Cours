import { useState, useEffect, useRef } from "react";

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

export default function InteractionWidget() {
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

    const cW = HMW / GRID, cH = HMH / GRID;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const [r, g, b] = heatColor(p[i * GRID + j] / pMax);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(PL + i * cW, PT + (GRID - 1 - j) * cH, cW + 0.5, cH + 0.5);
      }
    }

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

    const sX = PL + ((xSlice + DOMAIN) / (2 * DOMAIN)) * HMW;
    if (sX >= PL && sX <= PL + HMW) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(139,46,18,0.88)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(sX, PT); ctx.lineTo(sX, PT + HMH);
      ctx.stroke(); ctx.setLineDash([]);
    }

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

      <div ref={wrapRef} style={{ width: "100%" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", display: "block", border: "1px solid var(--rule)", borderRadius: 2 }}
        />
      </div>

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
