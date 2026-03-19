import { useState, useEffect, useRef } from "react";

const CX  = "#8b2e12";
const CY  = "#1e50a0";
const CXY = "#2a5028";
const CET = "#5a3e10";

function gaussPDF(x, mu, sig) {
  return Math.exp(-0.5 * ((x - mu) / sig) ** 2) / (sig * Math.sqrt(2 * Math.PI));
}

export default function SparseUpdateWidget() {
  const NU0 = 0.4;
  const INIT = {
    xOnly: [ 1.4, -1.0,  0.3,  1.8, -0.6],
    yOnly: [ 1.2, -0.5,  0.8, -1.2,  0.1],
    pairs: [[-1.1, -0.8], [1.0, 1.3], [0.5, 0.6], [-0.7, -0.5]],
  };
  const [obs,    setObs]    = useState(INIT);
  const [newX,   setNewX]   = useState(0.5);
  const [newY,   setNewY]   = useState(0.5);
  const [type,   setType]   = useState("pair");

  const scatRef   = useRef(null);
  const scatWrap  = useRef(null);
  const postCRef  = useRef(null);
  const postCWrap = useRef(null);

  const computePost = ({ xOnly, yOnly, pairs }) => {
    const allX = [...xOnly, ...pairs.map(p => p[0])];
    const allY = [...yOnly, ...pairs.map(p => p[1])];
    const nu_x   = NU0 + allX.length;
    const lam_x  = allX.reduce((s, v) => s + v, 0);
    const nu_y   = NU0 + allY.length;
    const lam_y  = allY.reduce((s, v) => s + v, 0);
    const nu_xy  = NU0 + pairs.length;
    const lam_xy = pairs.reduce((s, [x, y]) => s + x * y, 0);
    return {
      x:  { mean: lam_x  / nu_x,  std: 1 / Math.sqrt(nu_x),  nu: nu_x,  lam: lam_x  },
      y:  { mean: lam_y  / nu_y,  std: 1 / Math.sqrt(nu_y),  nu: nu_y,  lam: lam_y  },
      xy: { mean: lam_xy / nu_xy, std: 1 / Math.sqrt(nu_xy), nu: nu_xy, lam: lam_xy },
    };
  };

  const computeEM = ({ xOnly, yOnly, pairs }, maxIter = 80, tol = 1e-10) => {
    const nx = xOnly.length, ny = yOnly.length, nxy = pairs.length;
    const n_total = nx + ny + nxy;
    const nu = NU0 + n_total;

    let mx = 0, my = 0, sxy = 0;
    let iters = 0;

    for (let t = 0; t < maxIter; t++) {
      iters = t + 1;

      const sum_x = xOnly.reduce((s, x) => s + x, 0)
                  + pairs.reduce((s, [x]) => s + x, 0)
                  + yOnly.reduce((s, y) => s + mx + sxy * (y - my), 0);
      const sum_y = yOnly.reduce((s, y) => s + y, 0)
                  + pairs.reduce((s, [, y]) => s + y, 0)
                  + xOnly.reduce((s, x) => s + my + sxy * (x - mx), 0);

      const mx_n = sum_x / nu;
      const my_n = sum_y / nu;

      const sXY = pairs.reduce((s, [x, y]) => s + (x - mx_n) * (y - my_n), 0);
      const sX2 = xOnly.reduce((s, x) => s + (x - mx_n) ** 2, 0);
      const sY2 = yOnly.reduce((s, y) => s + (y - my_n) ** 2, 0);

      const denom = nu - sX2 - sY2;
      const sxy_n = denom > 1e-6 ? sXY / denom : 0;

      const diff = Math.abs(mx_n - mx) + Math.abs(my_n - my) + Math.abs(sxy_n - sxy);
      mx = mx_n; my = my_n; sxy = sxy_n;
      if (diff < tol) break;
    }

    const std_x  = 1 / Math.sqrt(nu);
    const std_xy = 1 / Math.sqrt(nu);
    return {
      x:  { mean: mx,  std: std_x,  nu, lam: mx  * nu },
      y:  { mean: my,  std: std_x,  nu, lam: my  * nu },
      xy: { mean: sxy, std: std_xy, nu, lam: sxy * nu },
      iters,
    };
  };

  const postPP = computePost(obs);
  const postEM = computeEM(obs);

  const addObs = () => setObs(prev => {
    if (type === "xOnly") return { ...prev, xOnly: [...prev.xOnly, newX] };
    if (type === "yOnly") return { ...prev, yOnly: [...prev.yOnly, newY] };
    return { ...prev, pairs: [...prev.pairs, [newX, newY]] };
  });
  const reset = () => setObs(INIT);

  const drawScatter = (o, pp, em) => {
    const canvas = scatRef.current, wrap = scatWrap.current;
    if (!canvas || !wrap) return;
    const W = wrap.clientWidth; if (!W) return;
    const H = 280, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    const PAD = 44, pW = W - 2 * PAD, pH = H - 2 * PAD;
    const DOM = 2.8;
    const tx = v => PAD + (v + DOM) / (2 * DOM) * pW;
    const ty = v => PAD + (DOM - v) / (2 * DOM) * pH;
    ctx.fillStyle = "#fafaf8"; ctx.fillRect(PAD, PAD, pW, pH);
    ctx.strokeStyle = "#e8e0d5"; ctx.lineWidth = 1;
    for (let v = -2; v <= 2; v++) {
      ctx.beginPath(); ctx.moveTo(tx(v), PAD); ctx.lineTo(tx(v), PAD + pH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, ty(v)); ctx.lineTo(PAD + pW, ty(v)); ctx.stroke();
    }
    ctx.strokeStyle = "#b8b0a5"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(tx(0), PAD); ctx.lineTo(tx(0), PAD + pH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD, ty(0)); ctx.lineTo(PAD + pW, ty(0)); ctx.stroke();

    const bPP = pp.xy.mean, bPPHi = bPP + 1.96 * pp.xy.std, bPPLo = bPP - 1.96 * pp.xy.std;
    ctx.beginPath();
    ctx.moveTo(tx(-DOM), ty(-DOM * bPPHi)); ctx.lineTo(tx(DOM), ty(DOM * bPPHi));
    ctx.lineTo(tx(DOM), ty(DOM * bPPLo));   ctx.lineTo(tx(-DOM), ty(-DOM * bPPLo));
    ctx.closePath(); ctx.fillStyle = `${CET}0e`; ctx.fill();

    const bEM = em.xy.mean, bEMHi = bEM + 1.96 * em.xy.std, bEMLo = bEM - 1.96 * em.xy.std;
    ctx.beginPath();
    ctx.moveTo(tx(-DOM), ty(-DOM * bEMHi)); ctx.lineTo(tx(DOM), ty(DOM * bEMHi));
    ctx.lineTo(tx(DOM), ty(DOM * bEMLo));   ctx.lineTo(tx(-DOM), ty(-DOM * bEMLo));
    ctx.closePath(); ctx.fillStyle = `${CET}22`; ctx.fill();

    ctx.beginPath(); ctx.strokeStyle = `${CET}66`; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
    ctx.moveTo(tx(-DOM), ty(-DOM * bPP)); ctx.lineTo(tx(DOM), ty(DOM * bPP));
    ctx.stroke(); ctx.setLineDash([]);

    ctx.beginPath(); ctx.strokeStyle = CET; ctx.lineWidth = 2.5;
    ctx.moveTo(tx(-DOM), ty(-DOM * bEM)); ctx.lineTo(tx(DOM), ty(DOM * bEM));
    ctx.stroke();

    o.yOnly.forEach(yi => {
      const cx = tx(0), cy = ty(yi);
      ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = `${CY}c0`; ctx.fill();
      ctx.strokeStyle = CY; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - 9, cy); ctx.lineTo(cx + 9, cy); ctx.stroke();
    });
    o.xOnly.forEach(xi => {
      const cx = tx(xi), cy = ty(0);
      ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = `${CX}c0`; ctx.fill();
      ctx.strokeStyle = CX; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy + 9); ctx.stroke();
    });
    o.pairs.forEach(([xi, yi]) => {
      const cx = tx(xi), cy = ty(yi);
      ctx.strokeStyle = "#90906028"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, ty(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx(0), cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, 6.5, 0, 2 * Math.PI);
      ctx.fillStyle = `${CXY}cc`; ctx.fill();
      ctx.strokeStyle = CXY; ctx.lineWidth = 1.5; ctx.stroke();
    });

    ctx.font = "11px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#8a837a";
    for (let v = -2; v <= 2; v++) {
      ctx.fillText(v, tx(v), ty(0) + 18);
      if (v !== 0) { ctx.textAlign = "right"; ctx.fillText(v, tx(0) - 7, ty(v) + 4); ctx.textAlign = "center"; }
    }
    ctx.fillStyle = CX; ctx.font = "bold 12px 'JetBrains Mono', monospace"; ctx.fillText("X", PAD + pW + 16, ty(0) + 4);
    ctx.fillStyle = CY; ctx.textAlign = "left"; ctx.fillText("Y", tx(0) + 6, PAD + 15);

    const leg = [
      { col: CX,  txt: `X seul  n=${o.xOnly.length}` },
      { col: CY,  txt: `Y seul  n=${o.yOnly.length}` },
      { col: CXY, txt: `paires  n=${o.pairs.length}` },
    ];
    ctx.font = "10px 'JetBrains Mono', monospace"; ctx.textAlign = "left";
    leg.forEach(({ col, txt }, i) => {
      ctx.fillStyle = col; ctx.fillRect(PAD + 6, PAD + 8 + i * 17, 9, 9);
      ctx.fillStyle = "#4a4540"; ctx.fillText(txt, PAD + 19, PAD + 16 + i * 17);
    });
    const ly = PAD + 8 + leg.length * 17 + 6;
    ctx.fillStyle = "#4a4540";
    ctx.setLineDash([6, 5]); ctx.strokeStyle = `${CET}66`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD + 6, ly + 4); ctx.lineTo(PAD + 22, ly + 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText("PP", PAD + 25, ly + 8);
    ctx.strokeStyle = CET; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(PAD + 6, ly + 19); ctx.lineTo(PAD + 22, ly + 19); ctx.stroke();
    ctx.fillText("EM", PAD + 25, ly + 23);
  };

  const drawPosteriors = (pp, em) => {
    const canvas = postCRef.current, wrap = postCWrap.current;
    if (!canvas || !wrap) return;
    const W = wrap.clientWidth; if (!W) return;
    const KEYS = ["x", "y", "xy"];
    const COLORS = [CX, CY, CET];
    const LABELS = ["\\eta_x", "\\eta_y", "\\eta_{xy}"];
    const PH = 80, H = KEYS.length * PH + 18;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    const PAD_L = 70, PAD_R = 14, GAP = 5;
    const pW = W - PAD_L - PAD_R;
    const DOM = 3.3;
    const tx = v => PAD_L + (v + DOM) / (2 * DOM) * pW;
    ctx.fillStyle = "#fafaf8"; ctx.fillRect(0, 0, W, H);

    KEYS.forEach((key, i) => {
      const color = COLORS[i], label = LABELS[i];
      const ppB = pp[key], emB = em[key];
      const y0 = i * PH + GAP + 6, pH2 = PH - 2 * GAP - 6, yc = y0 + pH2 / 2;
      ctx.fillStyle = "white"; ctx.fillRect(PAD_L, y0, pW, pH2);
      ctx.strokeStyle = "#e8e0d5"; ctx.lineWidth = 1; ctx.strokeRect(PAD_L, y0, pW, pH2);
      ctx.strokeStyle = "#c8bfb0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx(0), y0); ctx.lineTo(tx(0), y0 + pH2); ctx.stroke();

      const peakEM = gaussPDF(emB.mean, emB.mean, emB.std);
      const yMax   = peakEM / 0.82;
      const toYd   = v => y0 + pH2 - Math.min(v / yMax, 1.06) * pH2;

      ctx.beginPath(); ctx.moveTo(PAD_L, y0 + pH2);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        ctx.lineTo(PAD_L + px, toYd(gaussPDF(xv, ppB.mean, ppB.std)));
      }
      ctx.lineTo(PAD_L + pW, y0 + pH2); ctx.closePath();
      ctx.fillStyle = `${color}10`; ctx.fill();

      ctx.beginPath(); ctx.strokeStyle = `${color}70`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        const ypx = toYd(gaussPDF(xv, ppB.mean, ppB.std));
        px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
      }
      ctx.stroke(); ctx.setLineDash([]);

      ctx.beginPath(); ctx.moveTo(PAD_L, y0 + pH2);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        ctx.lineTo(PAD_L + px, toYd(gaussPDF(xv, emB.mean, emB.std)));
      }
      ctx.lineTo(PAD_L + pW, y0 + pH2); ctx.closePath();
      ctx.fillStyle = `${color}28`; ctx.fill();

      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        const ypx = toYd(gaussPDF(xv, emB.mean, emB.std));
        px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
      }
      ctx.stroke();

      const peakPP = gaussPDF(ppB.mean, ppB.mean, ppB.std);
      ctx.beginPath(); ctx.arc(tx(ppB.mean), toYd(peakPP), 3, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}80`; ctx.fill();
      ctx.beginPath(); ctx.arc(tx(emB.mean), toYd(peakEM), 4, 0, 2 * Math.PI);
      ctx.fillStyle = color; ctx.fill();

      const ciEM = 1.96 * emB.std;
      ctx.strokeStyle = `${color}90`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      [emB.mean - ciEM, emB.mean + ciEM].forEach(v => {
        ctx.beginPath(); ctx.moveTo(tx(v), y0 + 4); ctx.lineTo(tx(v), y0 + pH2 - 4); ctx.stroke();
      });
      ctx.setLineDash([]);

      ctx.font = "bold 12px 'JetBrains Mono', monospace"; ctx.textAlign = "right";
      ctx.fillStyle = color; ctx.fillText(label, PAD_L - 5, yc + 4);

      ctx.font = "9px 'JetBrains Mono', monospace"; ctx.fillStyle = "#8a837a";
      ctx.fillText(`PP ν=${ppB.nu.toFixed(1)}`, PAD_L - 5, yc + 17);
      ctx.fillStyle = color;
      ctx.fillText(`EM ν=${emB.nu.toFixed(1)}`, PAD_L - 5, yc + 27);

      ctx.textAlign = "right"; ctx.fillStyle = color; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`EM: ${emB.mean.toFixed(2)} ± ${ciEM.toFixed(2)}`, W - PAD_R - 2, y0 + pH2 - 5);

      if (i === KEYS.length - 1) {
        ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillStyle = "#8a837a"; ctx.textAlign = "center";
        for (let v = -3; v <= 3; v++) ctx.fillText(v, tx(v), H - 2);
      }
    });
  };

  useEffect(() => {
    const id = setTimeout(() => { drawScatter(obs, postPP, postEM); drawPosteriors(postPP, postEM); }, 30);
    return () => clearTimeout(id);
  }, [obs]);

  const obsR   = useRef(obs);
  const ppR    = useRef(postPP);
  const emR    = useRef(postEM);
  useEffect(() => {
    obsR.current = obs;
    ppR.current  = computePost(obs);
    emR.current  = computeEM(obs);
  });
  useEffect(() => {
    const ro = new ResizeObserver(() => { drawScatter(obsR.current, ppR.current, emR.current); drawPosteriors(ppR.current, emR.current); });
    if (scatWrap.current) ro.observe(scatWrap.current);
    return () => ro.disconnect();
  }, []);

  const BTNS = [
    { key: "xOnly", label: "X seul",      color: CX  },
    { key: "yOnly", label: "Y seul",       color: CY  },
    { key: "pair",  label: "Paire (X,Y)",  color: CXY },
  ];

  return (
    <div className="widget">
      <div className="widget-title" style={{ marginBottom:20 }}>
        Simulation — prior-produit (pointillés) vs EM (trait plein) superposés
      </div>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-end", marginBottom:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <label style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-faint)", letterSpacing:"0.08em" }}>
            Type d'observation
          </label>
          <div style={{ display:"flex", gap:6 }}>
            {BTNS.map(({ key, label, color }) => (
              <button key={key} onClick={() => setType(key)} style={{
                background: type === key ? color : "transparent",
                color: type === key ? "white" : color,
                border: `1px solid ${color}`,
                padding:"7px 13px", fontFamily:"var(--mono)", fontSize:11,
                cursor:"pointer", borderRadius:2, letterSpacing:"0.05em", transition:"all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
        {type !== "yOnly" && (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-faint)", letterSpacing:"0.08em" }}>Valeur X</label>
            <input type="range" min="-2.5" max="2.5" step="0.1" value={newX}
              onChange={e => setNewX(parseFloat(e.target.value))}
              style={{ width:130, accentColor:CX }} />
            <span style={{ fontFamily:"var(--mono)", fontSize:13, color:CX, textAlign:"center" }}>{newX.toFixed(1)}</span>
          </div>
        )}
        {type !== "xOnly" && (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-faint)", letterSpacing:"0.08em" }}>Valeur Y</label>
            <input type="range" min="-2.5" max="2.5" step="0.1" value={newY}
              onChange={e => setNewY(parseFloat(e.target.value))}
              style={{ width:130, accentColor:CY }} />
            <span style={{ fontFamily:"var(--mono)", fontSize:13, color:CY, textAlign:"center" }}>{newY.toFixed(1)}</span>
          </div>
        )}
        <button onClick={addObs} style={{
          background:"var(--ink)", color:"var(--cream)", border:"none",
          padding:"10px 20px", fontFamily:"var(--mono)", fontSize:12,
          letterSpacing:"0.08em", cursor:"pointer", borderRadius:2, alignSelf:"flex-end",
        }}>+ Ajouter</button>
        <button onClick={reset} style={{
          background:"transparent", color:"var(--ink-faint)", border:"1px solid var(--rule)",
          padding:"10px 16px", fontFamily:"var(--mono)", fontSize:11,
          cursor:"pointer", borderRadius:2, alignSelf:"flex-end",
        }}>Réinitialiser</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"ν_x",  pp:postPP.x.nu,  em:postEM.x.nu,  col:CX  },
          { label:"ν_y",  pp:postPP.y.nu,  em:postEM.y.nu,  col:CY  },
          { label:"ν_xy", pp:postPP.xy.nu, em:postEM.xy.nu, col:CET },
        ].map(({ label, pp, em, col }) => (
          <div key={label} style={{ background:"var(--cream)", border:`1px solid ${col}30`, padding:"10px 14px", borderRadius:2 }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:col, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
            <div style={{ display:"flex", gap:10, alignItems:"baseline" }}>
              <div>
                <div style={{ fontFamily:"var(--mono)", fontSize:9, color:"var(--ink-faint)", marginBottom:2 }}>PP</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:18, color:`${col}99`, fontWeight:500 }}>{pp.toFixed(1)}</div>
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:14, color:"var(--rule)" }}>→</div>
              <div>
                <div style={{ fontFamily:"var(--mono)", fontSize:9, color:col, marginBottom:2 }}>EM</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:18, color:col, fontWeight:500 }}>{em.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={scatWrap} className="canvas-wrap" style={{ marginBottom:12 }}>
        <canvas ref={scatRef} style={{ display:"block", width:"100%" }} />
      </div>
      <div ref={postCWrap} className="canvas-wrap">
        <canvas ref={postCRef} style={{ display:"block", width:"100%" }} />
      </div>
      <div style={{ marginTop:10, fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-faint)", lineHeight:1.9 }}>
        <span style={{ color:CX }}>●</span> X seul &nbsp;·&nbsp;
        <span style={{ color:CY }}>●</span> Y seul &nbsp;·&nbsp;
        <span style={{ color:CXY }}>●</span> Paire &nbsp;·&nbsp;
        <span style={{ color:`${CET}66` }}>- - -</span> prior-produit (PP) &nbsp;·&nbsp;
        <span style={{ color:CET }}>———</span> EM (données complétées)
      </div>
    </div>
  );
}
