import { useState, useEffect, useRef } from "react";

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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f4ee; color: #1a1714; font-family: 'EB Garamond', Georgia, serif; font-size: 18px; line-height: 1.75; }
  :root {
    --ink: #1a1714; --ink-light: #4a4540; --ink-faint: #8a837a;
    --cream: #f7f4ee; --cream-dark: #ede8df; --accent: #8b2e12;
    --accent-light: #c4623e; --rule: #c8bfb0; --mono: 'JetBrains Mono', monospace;
    --blue: #1e50a0; --green: #2a5028;
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
  .data-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 16px; }
  .data-table th { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); padding: 8px 16px; text-align: left; border-bottom: 2px solid var(--ink); }
  .data-table td { padding: 10px 16px; border-bottom: 1px solid var(--rule); color: var(--ink-light); font-variant-numeric: tabular-nums; }
  .data-table tr:last-child td { border-bottom: 2px solid var(--ink); font-weight: 500; color: var(--ink); }
  .data-table td.accent { color: var(--accent); font-weight: 600; }
  .data-table td.blue   { color: var(--blue);   font-weight: 600; }
  .data-table td.green  { color: var(--green);  font-weight: 600; }
  .data-table td.faint  { color: var(--ink-faint); font-style: italic; }
  .callout { background: #fdf5f2; border: 1px solid #e8bfb0; border-radius: 2px; padding: 16px 20px; margin: 20px 0; font-size: 16px; color: var(--ink-light); }
  .callout strong { color: var(--accent); font-style: normal; }
  .widget { background: white; border: 1px solid var(--rule); border-radius: 4px; padding: 32px; margin: 32px 0; }
  .widget-title { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 20px; }
  .canvas-wrap { width: 100%; position: relative; background: white; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
  .chapter-footer { margin-top: 80px; padding-top: 24px; border-top: 2px solid var(--ink); display: flex; justify-content: space-between; align-items: center; }
  .footer-label { font-family: var(--mono); font-size: 11px; color: var(--ink-faint); letter-spacing: 0.1em; }
  .math-display .katex-display { margin: 0; }
  .math-display .katex { font-size: 1.05em; }
`;

const CX  = "#8b2e12";
const CY  = "#1e50a0";
const CXY = "#2a5028";
const CET = "#5a3e10";

function gaussPDF(x, mu, sig) {
  return Math.exp(-0.5 * ((x - mu) / sig) ** 2) / (sig * Math.sqrt(2 * Math.PI));
}

function SparseUpdateWidget() {
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

  // ── Approximation prior-produit (§4) ──────────────────────────────────────
  // Chaque bloc accumule ses propres statistiques indépendamment.
  // ν^(xy) ne compte que les paires → incertitude incompressible sur η_xy.
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

  // ── Algorithme EM (§7) — version centrée, convergence garantie ────────────
  //
  // Bug de la version brute : le coefficient d'auto-couplage de η_xy dans
  // l'itération vaut (Σx² + Σy²) / ν (sommes de carrés NON centrées).
  // Dès que les observations ont magnitude > 1, ce coefficient dépasse 1
  // et l'itération diverge.
  //
  // Correction : travailler avec des quantités centrées sur (μ_x, μ_y)
  // courants. Le coefficient d'auto-couplage devient alors
  //   (Σ(x-μ_x)² + Σ(y-μ_y)²) / ν  ≈  (n_x + n_y) / ν  < 1  toujours,
  // car ν = NU0 + n_total > n_x + n_y. Convergence garantie.
  //
  // E-step (centré) :
  //   type B : ỹ_i = μ_y + σ_xy·(x_i − μ_x)
  //   type C : x̃_j = μ_x + σ_xy·(y_j − μ_y)
  // M-step (centré) :
  //   μ_x_new = (Σ x observés + Σ x̃_j imputés) / ν
  //   μ_y_new = (Σ y observés + Σ ỹ_i imputés) / ν
  //   σ_xy_new = (Σ_paires (x-μ)(y-μ) + σ_xy·Σ_B(x-μ)² + σ_xy·Σ_C(y-μ)²) / ν
  //            → point fixe résolu en une étape : σ_xy = sXY / (ν − sX2_B − sY2_C)
  const computeEM = ({ xOnly, yOnly, pairs }, maxIter = 80, tol = 1e-10) => {
    const nx = xOnly.length, ny = yOnly.length, nxy = pairs.length;
    const n_total = nx + ny + nxy;
    const nu = NU0 + n_total;

    // Initialisation : prior mean (μ = 0, σ = 0)
    let mx = 0, my = 0, sxy = 0;
    let iters = 0;

    for (let t = 0; t < maxIter; t++) {
      iters = t + 1;

      // ── E-step : sommes de données complétées ──────────────────────────
      // Σ x (observés type A+B, imputés type C : x̃_j = mx + sxy·(y_j−my))
      const sum_x = xOnly.reduce((s, x) => s + x, 0)
                  + pairs.reduce((s, [x]) => s + x, 0)
                  + yOnly.reduce((s, y) => s + mx + sxy * (y - my), 0);
      // Σ y (observés type A+C, imputés type B : ỹ_i = my + sxy·(x_i−mx))
      const sum_y = yOnly.reduce((s, y) => s + y, 0)
                  + pairs.reduce((s, [, y]) => s + y, 0)
                  + xOnly.reduce((s, x) => s + my + sxy * (x - mx), 0);

      // ── M-step pour les moyennes ───────────────────────────────────────
      const mx_n = sum_x / nu;   // prior mean = 0 → NU0·0 disparaît
      const my_n = sum_y / nu;

      // ── E-step centré pour la covariance ──────────────────────────────
      // Σ_paires (x_k − mx_n)(y_k − my_n)
      const sXY = pairs.reduce((s, [x, y]) => s + (x - mx_n) * (y - my_n), 0);
      // Σ_B (x_i − mx_n)²  — contribution type B à l'auto-couplage
      const sX2 = xOnly.reduce((s, x) => s + (x - mx_n) ** 2, 0);
      // Σ_C (y_j − my_n)²  — contribution type C à l'auto-couplage
      const sY2 = yOnly.reduce((s, y) => s + (y - my_n) ** 2, 0);

      // ── M-step pour σ_xy (point fixe résolu analytiquement) ───────────
      // σ·ν = sXY + σ·(sX2+sY2)  →  σ = sXY / (ν − sX2 − sY2)
      // Le dénominateur ≥ NU0 + nxy > 0 car sX2+sY2 ≈ nx+ny < ν
      const denom = nu - sX2 - sY2;
      const sxy_n = denom > 1e-6 ? sXY / denom : 0;

      const diff = Math.abs(mx_n - mx) + Math.abs(my_n - my) + Math.abs(sxy_n - sxy);
      mx = mx_n; my = my_n; sxy = sxy_n;
      if (diff < tol) break;
    }

    const std_x  = 1 / Math.sqrt(nu);
    const std_xy = 1 / Math.sqrt(nu);   // toutes les obs contribuent après imputation
    return {
      x:  { mean: mx,  std: std_x,  nu, lam: mx  * nu },
      y:  { mean: my,  std: std_x,  nu, lam: my  * nu },
      xy: { mean: sxy, std: std_xy, nu, lam: sxy * nu },
      iters,
    };
  };

  // Toujours calculer les deux approches simultanément
  const postPP = computePost(obs);   // prior-produit — pointillés
  const postEM = computeEM(obs);     // EM            — trait plein

  const addObs = () => setObs(prev => {
    if (type === "xOnly") return { ...prev, xOnly: [...prev.xOnly, newX] };
    if (type === "yOnly") return { ...prev, yOnly: [...prev.yOnly, newY] };
    return { ...prev, pairs: [...prev.pairs, [newX, newY]] };
  });
  const reset = () => setObs(INIT);

  // ── Nuage de points — deux bandes et deux droites superposées ──────────────
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

    // Bande IC prior-produit (large, très transparente)
    const bPP = pp.xy.mean, bPPHi = bPP + 1.96 * pp.xy.std, bPPLo = bPP - 1.96 * pp.xy.std;
    ctx.beginPath();
    ctx.moveTo(tx(-DOM), ty(-DOM * bPPHi)); ctx.lineTo(tx(DOM), ty(DOM * bPPHi));
    ctx.lineTo(tx(DOM), ty(DOM * bPPLo));   ctx.lineTo(tx(-DOM), ty(-DOM * bPPLo));
    ctx.closePath(); ctx.fillStyle = `${CET}0e`; ctx.fill();

    // Bande IC EM (plus étroite, plus opaque)
    const bEM = em.xy.mean, bEMHi = bEM + 1.96 * em.xy.std, bEMLo = bEM - 1.96 * em.xy.std;
    ctx.beginPath();
    ctx.moveTo(tx(-DOM), ty(-DOM * bEMHi)); ctx.lineTo(tx(DOM), ty(DOM * bEMHi));
    ctx.lineTo(tx(DOM), ty(DOM * bEMLo));   ctx.lineTo(tx(-DOM), ty(-DOM * bEMLo));
    ctx.closePath(); ctx.fillStyle = `${CET}22`; ctx.fill();

    // Droite prior-produit — pointillés fins
    ctx.beginPath(); ctx.strokeStyle = `${CET}66`; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
    ctx.moveTo(tx(-DOM), ty(-DOM * bPP)); ctx.lineTo(tx(DOM), ty(DOM * bPP));
    ctx.stroke(); ctx.setLineDash([]);

    // Droite EM — trait plein gras
    ctx.beginPath(); ctx.strokeStyle = CET; ctx.lineWidth = 2.5;
    ctx.moveTo(tx(-DOM), ty(-DOM * bEM)); ctx.lineTo(tx(DOM), ty(DOM * bEM));
    ctx.stroke();

    // Observations
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

    // Graduations
    ctx.font = "11px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#8a837a";
    for (let v = -2; v <= 2; v++) {
      ctx.fillText(v, tx(v), ty(0) + 18);
      if (v !== 0) { ctx.textAlign = "right"; ctx.fillText(v, tx(0) - 7, ty(v) + 4); ctx.textAlign = "center"; }
    }
    ctx.fillStyle = CX; ctx.font = "bold 12px 'JetBrains Mono', monospace"; ctx.fillText("X", PAD + pW + 16, ty(0) + 4);
    ctx.fillStyle = CY; ctx.textAlign = "left"; ctx.fillText("Y", tx(0) + 6, PAD + 15);

    // Légende observations
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
    // Légende droites
    const ly = PAD + 8 + leg.length * 17 + 6;
    ctx.fillStyle = "#4a4540";
    ctx.setLineDash([6, 5]); ctx.strokeStyle = `${CET}66`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD + 6, ly + 4); ctx.lineTo(PAD + 22, ly + 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText("PP", PAD + 25, ly + 8);
    ctx.strokeStyle = CET; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(PAD + 6, ly + 19); ctx.lineTo(PAD + 22, ly + 19); ctx.stroke();
    ctx.fillText("EM", PAD + 25, ly + 23);
  };

  // ── Densités a posteriori — deux courbes par panneau ──────────────────────
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

      // Normaliser sur le pic EM (plus étroit → plus haut → domine l'échelle)
      const peakEM = gaussPDF(emB.mean, emB.mean, emB.std);
      const yMax   = peakEM / 0.82;
      const toYd   = v => y0 + pH2 - Math.min(v / yMax, 1.06) * pH2;

      // Aire prior-produit (très transparente)
      ctx.beginPath(); ctx.moveTo(PAD_L, y0 + pH2);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        ctx.lineTo(PAD_L + px, toYd(gaussPDF(xv, ppB.mean, ppB.std)));
      }
      ctx.lineTo(PAD_L + pW, y0 + pH2); ctx.closePath();
      ctx.fillStyle = `${color}10`; ctx.fill();

      // Courbe prior-produit — pointillés fins
      ctx.beginPath(); ctx.strokeStyle = `${color}70`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        const ypx = toYd(gaussPDF(xv, ppB.mean, ppB.std));
        px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
      }
      ctx.stroke(); ctx.setLineDash([]);

      // Aire EM (plus opaque)
      ctx.beginPath(); ctx.moveTo(PAD_L, y0 + pH2);
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        ctx.lineTo(PAD_L + px, toYd(gaussPDF(xv, emB.mean, emB.std)));
      }
      ctx.lineTo(PAD_L + pW, y0 + pH2); ctx.closePath();
      ctx.fillStyle = `${color}28`; ctx.fill();

      // Courbe EM — trait plein gras
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      for (let px = 0; px <= pW; px++) {
        const xv = -DOM + (px / pW) * 2 * DOM;
        const ypx = toYd(gaussPDF(xv, emB.mean, emB.std));
        px === 0 ? ctx.moveTo(PAD_L + px, ypx) : ctx.lineTo(PAD_L + px, ypx);
      }
      ctx.stroke();

      // Modes (points)
      const peakPP = gaussPDF(ppB.mean, ppB.mean, ppB.std);
      ctx.beginPath(); ctx.arc(tx(ppB.mean), toYd(peakPP), 3, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}80`; ctx.fill();
      ctx.beginPath(); ctx.arc(tx(emB.mean), toYd(peakEM), 4, 0, 2 * Math.PI);
      ctx.fillStyle = color; ctx.fill();

      // IC 95% EM (barres verticales)
      const ciEM = 1.96 * emB.std;
      ctx.strokeStyle = `${color}90`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      [emB.mean - ciEM, emB.mean + ciEM].forEach(v => {
        ctx.beginPath(); ctx.moveTo(tx(v), y0 + 4); ctx.lineTo(tx(v), y0 + pH2 - 4); ctx.stroke();
      });
      ctx.setLineDash([]);

      // Étiquette gauche
      ctx.font = "bold 12px 'JetBrains Mono', monospace"; ctx.textAlign = "right";
      ctx.fillStyle = color; ctx.fillText(label, PAD_L - 5, yc + 4);

      // ν PP et ν EM à gauche
      ctx.font = "9px 'JetBrains Mono', monospace"; ctx.fillStyle = "#8a837a";
      ctx.fillText(`PP ν=${ppB.nu.toFixed(1)}`, PAD_L - 5, yc + 17);
      ctx.fillStyle = color;
      ctx.fillText(`EM ν=${emB.nu.toFixed(1)}`, PAD_L - 5, yc + 27);

      // IC numérique EM à droite
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
      {/* Cartes ν — PP vs EM côte à côte pour chaque bloc */}
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

function Section({ number, title, children }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`section ${vis ? "visible" : ""}`}>
      <div className="section-number">{number}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function Chapter() {
  return (
    <>
      <style>{styles}</style>
      <div className="page">

        <div className="chapter-header">
          <div className="chapter-label">Inférence Bayésienne · Chapitre 6</div>
          <h1 className="chapter-title">Observations Éparses,<br />Non Appariées, Mixtes</h1>
          <p className="chapter-subtitle">
            Quand les données manquent par structure — certaines portent sur <em>X</em> seul,
            d'autres sur <em>Y</em> seul, d'autres sur les deux — les trois blocs de <em>λ</em>
            s'alimentent de façon asynchrone. Trois compteurs <em>ν</em> distincts naissent.
            La conjugaison tient, mais à un prix que ce chapitre quantifie.
          </p>
        </div>

        <hr className="rule" />

        {/* §1 */}
        <Section number="§ 1" title="Le problème : observations hétérogènes dans un modèle joint">
          <p>
            Au chapitre 5, chaque observation était une paire complète <M>{`(x_i, y_i)`}</M>.
            En pratique, ce confort est l'exception. Dans une cohorte clinique, certains patients
            n'ont qu'une mesure de température <M>{`x_i`}</M> sans résultat sérologique ; d'autres
            ont un titre anticorps <M>{`y_j`}</M> sans thermomètre de proximité ; d'autres encore
            ont les deux. Comment la mise à jour bayésienne se comporte-t-elle lorsque les
            observations ne renseignent qu'une partie de la statistique suffisante jointe ?
          </p>

          <h3>Taxonomie des observations</h3>
          <p>
            On distingue trois types d'observations dans le modèle joint{" "}
            <M>{`p(x, y \\mid \\eta)`}</M> de la famille exponentielle (ch. 5, §1) :
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th><th>Ce qui est observé</th>
                <th>Statistique suffisante disponible</th><th>Notation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="accent">A — Paire complète</td>
                <td><M>{`(x_k, y_k)`}</M></td>
                <td><M>{`T_x(x_k),\\; T_y(y_k),\\; T_x(x_k)\\otimes T_y(y_k)`}</M></td>
                <td><M>{`n_{xy}`}</M> obs.</td>
              </tr>
              <tr>
                <td className="blue">B — Marginale X</td>
                <td><M>{`x_i`}</M> seul</td>
                <td><M>{`T_x(x_i)`}</M> uniquement</td>
                <td><M>{`n_x`}</M> obs.</td>
              </tr>
              <tr>
                <td className="green">C — Marginale Y</td>
                <td><M>{`y_j`}</M> seul</td>
                <td><M>{`T_y(y_j)`}</M> uniquement</td>
                <td><M>{`n_y`}</M> obs.</td>
              </tr>
            </tbody>
          </table>
          <p>
            La statistique suffisante croisée <M>{`T_x(x_k) \\otimes T_y(y_k)`}</M> n'est
            disponible que pour les observations de type A. Elle seule informe directement
            <M>{`\eta_{xy}`}</M>. Les types B et C ne la fournissent pas — mais ne l'ignorent
            pas non plus, comme le §6 le détaillera.
          </p>
          <div className="callout">
            <strong>La question centrale.</strong> Un dataset avec{" "}
            <M>{`n_x = 1000`}</M> observations X seules, <M>{`n_y = 1000`}</M> observations
            Y seules, et <M>{`n_{xy} = 3`}</M> paires — que sait-on sur <M>{`\\eta_{xy}`}</M> ?
            La réponse, surprenante, est que <M>{`\\eta_{xy}`}</M> reste très incertain
            malgré les 2000 observations marginales. Les paires sont irremplaçables.
          </div>
        </Section>

        <hr className="rule" />

        {/* §2 */}
        <Section number="§ 2" title="La vraisemblance exacte — pourquoi la conjugaison se brise">
          <p>
            Rappelons la densité jointe du chapitre 5 (§1–§2) avec les trois blocs de paramètres :
          </p>
          <D label="Modèle joint — forme canonique">{`
            p(x, y \\mid \\eta)
            = h_x(x)\\,h_y(y)\\,\\exp\\!\\Bigl(
              \\eta_x^\\top T_x(x)
              + \\eta_y^\\top T_y(y)
              + T_x(x)^\\top\\eta_{xy}\\,T_y(y)
              - A(\\eta)
            \\Bigr)
          `}</D>
          <p>
            avec <M>{`A(\\eta) = A(\\eta_x, \\eta_y, \\eta_{xy})`}</M> la log-partition jointe.
            Avec <M>{`n_{xy}`}</M> paires complètes, la mise à jour conjuguée du chapitre 5 s'applique
            directement — deux additions. La difficulté vient des observations marginales.
          </p>

          <h3>La vraisemblance exacte d'une observation X seule</h3>
          <p>
            Pour une observation <M>{`x_i`}</M> de type B, la vraisemblance exacte est la marginale
            obtenue en intégrant <M>{`Y`}</M> hors du modèle joint :
          </p>
          <D label="Vraisemblance marginale exacte — type B">{`
            p(x_i \\mid \\eta)
            \\propto h_x(x_i)\\,\\exp\\!\\Bigl(
              \\eta_x^\\top T_x(x_i)
              + \\underbrace{A_y\\!\\bigl(\\eta_y + \\eta_{xy}^\\top T_x(x_i)\\bigr)}_{= \\log \\int h_y(y)\\,e^{\\,\\eta_y^*(x_i)^\\top T_y(y)}\\,dy}
              - A(\\eta)
            \\Bigr)
          `}</D>
          <p>
            où <M>{`A_y(\\cdot)`}</M> est la log-partition de la famille marginale de <M>{`Y`}</M> et{" "}
            <M>{`\\eta_y^*(x_i) = \\eta_y + \\eta_{xy}^\\top T_x(x_i)`}</M> est le paramètre incliné
            du chapitre 5 (§3). En incorporant cette vraisemblance dans le prior conjugué universel{" "}
            <M>{`\\exp(\\eta^\\top\\lambda_0 - \\nu_0 A(\\eta))`}</M>, le posterior devient :
          </p>
          <D>{`
            p(\\eta \\mid x_i) \\propto
            \\exp\\!\\Bigl(
              \\bigl(\\lambda_0^{(x)} + T_x(x_i)\\bigr)^\\top \\!\\eta_x
              + \\lambda_0^{(y)\\top} \\eta_y
              + \\lambda_0^{(xy)\\top} \\mathrm{vec}(\\eta_{xy})
              + A_y\\!\\bigl(\\eta_y + \\eta_{xy}^\\top T_x(x_i)\\bigr)
              - (\\nu_0 + 1)\\,A(\\eta)
            \\Bigr)
          `}</D>
          <p>
            La partie linéaire en <M>{`\\eta_x`}</M> se met à jour proprement :{" "}
            <M>{`\\lambda^{(x)} \\mathrel{+}= T_x(x_i)`}</M>, <M>{`\\nu \\mathrel{+}= 1`}</M>.
            Mais le terme résiduel <M>{`A_y(\\eta_y + \\eta_{xy}^\\top T_x(x_i))`}</M> est
            non linéaire en <M>{`(\\eta_y, \\eta_{xy})`}</M> — il ne s'écrit pas comme une
            forme linéaire <M>{`\\mathrm{const}^\\top \\eta`}</M>. Le posterior sort de la
            famille conjuguée.
          </p>

          <Box title="Obstruction à la conjugaison — énoncé précis">{`
            \\text{Si } \\eta_{xy} \\neq 0 \\text{ est inconnu, les observations marginales}\\\\[4pt]
            \\text{(type B ou C) brisent la structure conjuguée du posterior en } (\\eta_y, \\eta_{xy}).
          `}</Box>

          <div className="callout">
            <strong>Intuition géométrique.</strong> Le terme <M>{`A_y(\\eta_y^*(x_i))`}</M> mesure
            l'énergie libre de <M>{`Y`}</M> lorsque son paramètre naturel est décalé par{" "}
            <M>{`\\eta_{xy}^\\top T_x(x_i)`}</M>. Cette dépendance est non-polynomiale en
            <M>{`\\eta_{xy}`}</M>. La famille exponentielle est close par conditionnement
            (ch. 5, §3) — la conditionnelle reste dans sa famille. Elle n'est pas close
            par marginalisation : intégrer sur <M>{`Y`}</M> fait apparaître la log-partition
            <M>{`A_y`}</M>, qui est convexe et non-linéaire.
          </div>
        </Section>

        <hr className="rule" />

        {/* §3 */}
        <Section number="§ 3" title="Le cas η_xy connu — découplage exact">
          <p>
            La situation se simplifie radicalement si <M>{`\\eta_{xy}`}</M> est fixé à une
            valeur connue <M>{`\\eta_{xy}^0`}</M>. L'inférence porte alors uniquement sur
            <M>{`(\\eta_x, \\eta_y)`}</M>, et le terme perturbateur devient une constante.
          </p>
          <p>
            Pour une observation X seule <M>{`x_i`}</M>, la vraisemblance conditionnelle
            sur <M>{`\\eta_x`}</M> avec <M>{`\\eta_{xy} = \\eta_{xy}^0`}</M> fixé est :
          </p>
          <D label="Vraisemblance exacte — η_xy connu">{`
            \\log p(x_i \\mid \\eta_x,\\, \\eta_{xy}^0)
            = \\eta_x^\\top T_x(x_i)
            - A_x(\\eta_x) + \\mathrm{const}(\\eta_{xy}^0, x_i)
          `}</D>
          <p>
            Le terme <M>{`A_y(\\eta_y^0 + (\\eta_{xy}^0)^\\top T_x(x_i))`}</M> est devenu
            une constante par rapport à <M>{`\\eta_x`}</M>. La mise à jour de <M>{`\\eta_x`}</M>
            est alors exactement conjuguée :
          </p>
          <D label="Mise à jour exacte — η_x avec η_xy fixé">{`
            \\lambda_n^{(x)} = \\lambda_0^{(x)} + T_x(x_i),
            \\qquad
            \\nu_n^x = \\nu_0^x + 1
          `}</D>

          <h3>Le cas η_xy = 0 — indépendance et découplage total</h3>
          <p>
            Le découplage est exact et total quand <M>{`\\eta_{xy} = 0`}</M>. La loi jointe
            se factorise <M>{`p(x,y) = p_x(x)\\,p_y(y)`}</M>, et les marginales ne dépendent
            pas des paramètres croisés. Les trois blocs évoluent indépendamment :
          </p>
          <D label="Découplage exact — η_xy = 0">{`
            \\lambda_n^{(x)} = \\lambda_0^{(x)} + \\sum_{\\text{B,A}} T_x(x_i), \\qquad
            \\lambda_n^{(y)} = \\lambda_0^{(y)} + \\sum_{\\text{C,A}} T_y(y_j)
          `}</D>
          <p>
            C'est le cas de référence. Toutes les approximations du §4 visent à s'en rapprocher
            en traitant chaque bloc comme si les autres paramètres étaient nuls.
          </p>
          <div className="callout">
            <strong>Corollaire.</strong> Si le modèle générateur correct est un modèle
            d'indépendance (<M>{`\\eta_{xy} = 0`}</M>), alors utiliser des données marginales
            pour mettre à jour <M>{`\\eta_x`}</M> et <M>{`\\eta_y`}</M> est{" "}
            <em>exactement optimal</em> — pas une approximation. La richesse bayésienne
            est intégralement préservée.
          </div>
        </Section>

        <hr className="rule" />

        {/* §4 */}
        <Section number="§ 4" title="L'approximation des priors produits — formalisation du découplage">
          <p>
            Dans la pratique bayésienne approchée, l'hypothèse qui rétablit la conjugaison est
            la <em>factorisation du prior</em> en trois facteurs indépendants, un par bloc :
          </p>
          <Box title="Hypothèse — prior produit (mean-field sur les blocs)">{`
            p(\\eta_x, \\eta_y, \\eta_{xy}\\mid \\lambda_0, \\nu_0)
            = p_x(\\eta_x \\mid \\lambda_0^{(x)},\\, \\nu_0^x)
            \\;\\cdot\\;
            p_y(\\eta_y \\mid \\lambda_0^{(y)},\\, \\nu_0^y)
            \\;\\cdot\\;
            p_{xy}(\\eta_{xy} \\mid \\lambda_0^{(xy)},\\, \\nu_0^{xy})
          `}</Box>
          <p>
            Chaque facteur est le prior conjugué canonique (ch. 4, §3) pour son propre bloc,
            avec hyperparamètres <M>{`(\\lambda_0^{(\\cdot)}, \\nu_0^\\cdot)`}</M> indépendants.
            Ce prior produit <em>n'est pas</em> le prior conjugué du modèle joint complet — qui
            serait <M>{`\\exp(\\lambda_0^\\top \\eta - \\nu_0 A(\\eta))`}</M> avec la log-partition
            jointe <M>{`A`}</M>. C'est une approximation de champ moyen sur les blocs.
          </p>

          <h3>Vraisemblance marginale approchée</h3>
          <p>
            Sous l'hypothèse prior-produit, la vraisemblance d'une observation de type B est
            approchée par la famille marginale de <M>{`X`}</M>, traitée comme si <M>{`\\eta_{xy}`}</M>
            était nul dans la marginalisation :
          </p>
          <D label="Vraisemblance approchée — type B">{`
            \\log \\tilde{p}(x_i \\mid \\eta_x)
            \\approx
            \\eta_x^\\top T_x(x_i) - A_x(\\eta_x) + \\log h_x(x_i)
          `}</D>
          <p>
            où <M>{`A_x(\\eta_x)`}</M> est la log-partition de la famille marginale de <M>{`X`}</M>
            — exactement la structure du chapitre 4. La mise à jour découle immédiatement.
          </p>

          <h3>La règle de mise à jour découplée</h3>
          <p>
            Sous l'hypothèse prior-produit avec vraisemblances marginales approchées, les trois blocs
            se mettent à jour indépendamment. Pour un dataset mixte avec <M>{`n_{xy}`}</M> paires,
            <M>{`n_x`}</M> observations X seules et <M>{`n_y`}</M> observations Y seules :
          </p>
          <Box title="Règle de mise à jour — observations hétérogènes">{`
            \\lambda_n^{(x)}
            = \\lambda_0^{(x)}
            + \\sum_{\\text{type B}}\\! T_x(x_i)
            + \\sum_{\\text{type A}}\\! T_x(x_k),
            \\qquad
            \\nu_n^x = \\nu_0^x + n_x + n_{xy}
            \\\\[10pt]
            \\lambda_n^{(y)}
            = \\lambda_0^{(y)}
            + \\sum_{\\text{type C}}\\! T_y(y_j)
            + \\sum_{\\text{type A}}\\! T_y(y_k),
            \\qquad
            \\nu_n^y = \\nu_0^y + n_y + n_{xy}
            \\\\[10pt]
            \\lambda_n^{(xy)}
            = \\lambda_0^{(xy)}
            + \\sum_{\\text{type A}}\\! T_x(x_k)\\otimes T_y(y_k),
            \\qquad
            \\nu_n^{xy} = \\nu_0^{xy} + n_{xy}
          `}</Box>

          <p>
            La structure est transparente : chaque observation contribue aux blocs dont elle
            fournit les statistiques suffisantes. Les paires (type A) contribuent aux{" "}
            <em>trois</em> blocs ; les marginales ne contribuent qu'à un seul bloc chacune.
          </p>

          <div className="callout">
            <strong>Le statut de l'approximation.</strong> Elle est <em>exacte</em> quand
            <M>{`\\eta_{xy} = 0`}</M> (§3). Elle est <em>asymptotiquement exacte</em> quand
            <M>{`n_{xy} \\to \\infty`}</M> : les paires dominent l'inférence sur
            <M>{`\\eta_{xy}`}</M> et les blocs deviennent asymptotiquement orthogonaux dans la
            métrique de Fisher. En dehors de ces régimes, elle sous-estime l'information
            sur <M>{`\\eta_{xy}`}</M> portée par les données marginales. Le §6 quantifie
            ce coût ; le §7 le récupère via l'algorithme EM.
          </div>
        </Section>

        <hr className="rule" />

        {/* §5 */}
        <Section number="§ 5" title="Les trois compteurs ν — une mémoire différenciée">
          <p>
            L'asymétrie la plus frappante de la règle découplée est que <M>{`\\nu_n^x`}</M>,
            <M>{`\\nu_n^y`}</M> et <M>{`\\nu_n^{xy}`}</M> croissent à des vitesses différentes
            selon la composition du dataset.
          </p>

          <h3>Tableau de contribution par type d'observation</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th><M>{`\\Delta\\nu^x`}</M></th>
                <th><M>{`\\Delta\\nu^y`}</M></th>
                <th><M>{`\\Delta\\nu^{xy}`}</M></th>
                <th>Blocs mis à jour</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="accent">A — Paire <M>{`(x_k, y_k)`}</M></td>
                <td className="accent">+1</td><td className="accent">+1</td><td className="accent">+1</td>
                <td><M>{`\\lambda^{(x)}`}</M>, <M>{`\\lambda^{(y)}`}</M>, <M>{`\\lambda^{(xy)}`}</M></td>
              </tr>
              <tr>
                <td className="blue">B — X seul <M>{`x_i`}</M></td>
                <td className="blue">+1</td><td>0</td><td>0</td>
                <td><M>{`\\lambda^{(x)}`}</M> uniquement</td>
              </tr>
              <tr>
                <td className="green">C — Y seul <M>{`y_j`}</M></td>
                <td>0</td><td className="green">+1</td><td>0</td>
                <td><M>{`\\lambda^{(y)}`}</M> uniquement</td>
              </tr>
            </tbody>
          </table>

          <h3>Interprétation en termes d'information de Fisher</h3>
          <p>
            Les compteurs <M>{`\\nu`}</M> sont proportionnels à la précision a posteriori de
            chaque bloc — c'est-à-dire à l'information de Fisher cumulée. Pour une famille
            exponentielle à statistiques scalaires et variance unitaire, la matrice d'information
            de Fisher est bloc-diagonale sous le prior produit :
          </p>
          <D label="Précision a posteriori — structure bloc-diagonale">{`
            \\mathrm{Prec}_{\\text{post}}(\\eta_x) = \\nu_n^x, \\quad
            \\mathrm{Prec}_{\\text{post}}(\\eta_y) = \\nu_n^y, \\quad
            \\mathrm{Prec}_{\\text{post}}(\\eta_{xy}) = \\nu_n^{xy}
          `}</D>
          <p>
            La précision sur <M>{`\\eta_{xy}`}</M> est proportionnelle à <M>{`n_{xy}`}</M> seul.
            Aucune accumulation de données marginales ne la réduit.
          </p>

          <h3>L'incertitude sur η_xy est incompressible par les marginales</h3>
          <D label="Incertitude sur η_xy — formule exacte sous le prior produit">{`
            \\mathrm{Var}_{\\text{post}}[\\eta_{xy}]
            = \\frac{1}{\\nu_n^{xy}}
            = \\frac{1}{\\nu_0^{xy} + n_{xy}}
          `}</D>
          <p>
            Pour halvir l'incertitude sur <M>{`\\eta_{xy}`}</M>, il faut doubler{" "}
            <M>{`n_{xy}`}</M> — pas augmenter <M>{`n_x`}</M> ou <M>{`n_y`}</M>. Les paires
            sont une ressource irremplaçable pour inférer le couplage.
          </p>

          <div className="callout">
            <strong>Analogie avec l'urne du chapitre 4.</strong> Chaque bloc a sa propre urne :
            l'urne <M>{`(\\lambda^{(xy)}, \\nu^{xy})`}</M> n'accepte que les billes des paires.
            Mille observations X seules remplissent l'urne <M>{`(\\lambda^{(x)}, \\nu^x)`}</M>
            mais ne versent pas une seule bille dans l'urne <M>{`(\\lambda^{(xy)}, \\nu^{xy})`}</M>.
            Les deux urnes évoluent indépendamment. La précision sur <M>{`\\eta_{xy}`}</M>
            ne croît qu'avec les billes appariées.
          </div>
        </Section>

        <hr className="rule" />

        {/* §6 */}
        <Section number="§ 6" title="Ce que l'approximation ignore — l'information indirecte">
          <p>
            L'approximation prior-produit a un coût précis : elle néglige l'information sur
            <M>{`\\eta_{xy}`}</M> que portent les observations marginales via la log-partition
            non linéaire <M>{`A_y`}</M>. Quantifions ce terme rejeté.
          </p>

          <h3>Le terme rejeté — correction de marginalisation</h3>
          <p>
            En comparant la vraisemblance exacte (§2) et la vraisemblance approchée (§4)
            d'une observation X seule, le terme négligé est :
          </p>
          <D label="Information indirecte — terme négligé par l'approximation">{`
            \\delta(x_i, \\eta)
            \\;\\equiv\\;
            A_y\\!\\bigl(\\eta_y + \\eta_{xy}^\\top T_x(x_i)\\bigr) - A_y(\\eta_y)
          `}</D>
          <p>
            Ce terme mesure le décalage de la log-partition de <M>{`Y`}</M> induit par la
            valeur de <M>{`T_x(x_i)`}</M> via le couplage. Il est nul quand <M>{`\\eta_{xy} = 0`}</M>
            et croît avec <M>{`\\|\\eta_{xy}\\|`}</M>. Son gradient par rapport à
            <M>{`\\eta_{xy}`}</M> est :
          </p>
          <D>{`
            \\nabla_{\\eta_{xy}}\\,\\delta(x_i, \\eta)
            = T_x(x_i) \\otimes \\mathbb{E}_{p(y\\mid x_i,\\,\\eta)}[T_y(Y)]
          `}</D>
          <p>
            Ce gradient a la forme d'une statistique croisée imputée —{" "}
            <M>{`T_x(x_i) \\otimes \\mathbb{E}[T_y(Y) \\mid x_i]`}</M> — où la valeur
            inobservée <M>{`T_y(y_i)`}</M> est remplacée par son espérance conditionnelle.
            C'est exactement la clé de l'algorithme EM du §7.
          </p>

          <h3>Quand l'approximation est-elle fidèle ?</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Régime</th><th>Erreur de l'approximation</th><th>Justification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`\\eta_{xy} = 0`}</M></td>
                <td className="accent">Nulle — exacte</td>
                <td>La marginalisation ne crée aucun couplage</td>
              </tr>
              <tr>
                <td><M>{`\\|\\eta_{xy}\\| \\ll 1`}</M></td>
                <td className="blue">Faible — <M>{`O(\\|\\eta_{xy}\\|^2)`}</M></td>
                <td><M>{`\\delta`}</M> est d'ordre 2 en <M>{`\\eta_{xy}`}</M></td>
              </tr>
              <tr>
                <td><M>{`n_{xy} \\gg n_x, n_y`}</M></td>
                <td className="green">Asymptotiquement nulle</td>
                <td>L'information directe sur <M>{`\\eta_{xy}`}</M> domine</td>
              </tr>
              <tr>
                <td><M>{`n_{xy} \\approx 0`}</M>, <M>{`\\|\\eta_{xy}\\|`}</M> grand</td>
                <td className="faint">Forte — pertes réelles</td>
                <td>L'information indirecte est la seule source</td>
              </tr>
            </tbody>
          </table>

          <div className="callout">
            <strong>La vraie contrainte informationnelle.</strong> La famille exponentielle jointe a
            une asymétrie fondamentale entre conditionnement et marginalisation. Conditionner sur un
            paramètre est gratuit : la conditionnelle reste dans la famille (ch. 5, §3), la mise à
            jour est exactement conjuguée. Marginaliser coûte : intégrer sur une variable fait
            apparaître <M>{`A_y`}</M>, non linéaire. L'information indirecte sur <M>{`\\eta_{xy}`}</M>
            portée par les marginales existe, mais passe par ce canal non linéaire — et c'est
            précisément ce que l'algorithme EM récupère.
          </div>
        </Section>

        <hr className="rule" />

        {/* §7 */}
        <Section number="§ 7" title="L'algorithme EM — imputation des statistiques manquantes">
          <p>
            L'obstruction à la conjugaison vient du terme manquant <M>{`T_y(y_i)`}</M> dans la
            statistique croisée <M>{`T_x(x_i) \\otimes T_y(y_i)`}</M> pour une observation de
            type B. L'algorithme EM rétablit la conjugaison en <em>imputant</em> cette valeur
            manquante par son espérance conditionnelle sous le modèle courant.
          </p>

          <h3>L'étape E — imputation bayésienne des statistiques suffisantes</h3>
          <p>
            À l'itération <M>{`t`}</M>, avec paramètres courants <M>{`\\eta^{(t)}`}</M>, on calcule
            l'espérance de <M>{`T_y(Y_i)`}</M> conditionnellement à <M>{`X_i = x_i`}</M>. Par la
            propriété fondamentale des familles exponentielles (ch. 4, §1), cette espérance est le
            gradient de la log-partition :
          </p>
          <D label="Étape E — statistique suffisante imputée">{`
            \\widetilde{T}_y^{(t)}(x_i)
            \\equiv
            \\mathbb{E}_{p(y\\mid x_i,\\,\\eta^{(t)})}\\!\\bigl[T_y(Y)\\bigr]
            = \\nabla_{\\eta_y}\\, A_y\\!\\bigl(\\eta_y^{(t)} + (\\eta_{xy}^{(t)})^\\top T_x(x_i)\\bigr)
          `}</D>
          <p>
            La statistique croisée imputée pour l'observation <M>{`x_i`}</M> (type B) est alors :
          </p>
          <D>{`
            \\widetilde{T}_{xy}^{(t)}(x_i)
            \\equiv
            T_x(x_i) \\otimes \\widetilde{T}_y^{(t)}(x_i)
          `}</D>
          <p>
            Symétriquement, pour une observation <M>{`y_j`}</M> de type C, on impute{" "}
            <M>{`T_x(x_j)`}</M> par son espérance conditionnelle{" "}
            <M>{`\\widetilde{T}_x^{(t)}(y_j) = \\nabla_{\\eta_x} A_x(\\eta_x^{(t)} + \\eta_{xy}^{(t)} T_y(y_j))`}</M>.
          </p>

          <h3>L'étape M — mise à jour conjuguée sur les données complétées</h3>
          <p>
            En traitant les statistiques imputées comme des observations fictives, le dataset est
            « complété » et la règle conjuguée du chapitre 5 s'applique intégralement :
          </p>
          <Box title="Étape M — règle de mise à jour avec données complétées">{`
            \\lambda_{t+1}^{(xy)}
            = \\lambda_0^{(xy)}
            + \\sum_{\\text{type A}} T_x(x_k) \\otimes T_y(y_k)
            + \\sum_{\\text{type B}} \\widetilde{T}_{xy}^{(t)}(x_i)
            + \\sum_{\\text{type C}} T_x(x_j) \\otimes \\widetilde{T}_y^{(t)}(y_j)
            \\\\[8pt]
            \\nu_{t+1}^{xy} = \\nu_0^{xy} + n_{xy} + n_x + n_y
          `}</Box>
          <p>
            À convergence, <M>{`\\eta_{xy}^{(t)}`}</M> stationne au mode a posteriori. Le
            compteur <M>{`\\nu^{xy}`}</M> atteint sa valeur maximale : toutes les observations,
            y compris les marginales via leurs imputations, contribuent désormais à l'estimation
            de <M>{`\\eta_{xy}`}</M>.
          </p>

          <h3>Cas gaussien — la forme explicite de l'étape E</h3>
          <p>
            Dans le cas gaussien avec <M>{`T_x(x) = x`}</M>, <M>{`T_y(y) = y`}</M> et variances
            unitaires, <M>{`A_y(\\eta_y) = \\eta_y^2 / 2`}</M>, donc{" "}
            <M>{`\\nabla_{\\eta_y} A_y(\\eta_y) = \\eta_y`}</M>. L'étape E prend la forme
            explicite :
          </p>
          <D label="Étape E gaussienne — formule close">{`
            \\widetilde{T}_y^{(t)}(x_i)
            = \\mathbb{E}[Y \\mid X = x_i,\\,\\eta^{(t)}]
            = \\eta_y^{(t)} + \\eta_{xy}^{(t)} \\cdot x_i
          `}</D>
          <p>
            La contribution de <M>{`x_i`}</M> à <M>{`\\lambda^{(xy)}`}</M> est alors :
          </p>
          <D>{`
            \\widetilde{T}_{xy}^{(t)}(x_i)
            = x_i \\cdot \\bigl(\\eta_y^{(t)} + \\eta_{xy}^{(t)} \\cdot x_i\\bigr)
            = \\eta_y^{(t)} \\cdot x_i + \\eta_{xy}^{(t)} \\cdot x_i^2
          `}</D>
          <p>
            Le terme <M>{`\\eta_{xy}^{(t)} \\cdot x_i^2`}</M> est auto-renforçant : plus
            <M>{`\\eta_{xy}`}</M> est grand, plus chaque observation marginale X amplifie sa propre
            contribution à <M>{`\\lambda^{(xy)}`}</M>. C'est la signature de la structure
            non-identifiable : sans paire, les marginales seules ne peuvent lever l'ambiguïté sur
            le signe de <M>{`\\eta_{xy}`}</M> — les itérations EM peuvent converger vers
            <M>{`+\\hat{\\eta}_{xy}`}</M> ou <M>{`-\\hat{\\eta}_{xy}`}</M> selon l'initialisation.
          </p>

          <h3>Convergence et garanties</h3>
          <p>
            Chaque itération EM augmente la log-vraisemblance marginale{" "}
            <M>{`\\log p(x_{\\text{obs}} \\mid \\eta)`}</M> — c'est la propriété fondamentale de
            l'algorithme (Dempster, Laird, Rubin, 1977). La convergence vers un maximum local est
            garantie sous des conditions de régularité standard. Le nombre d'itérations nécessaires
            dépend du ratio <M>{`n_{xy}/(n_x + n_y + n_{xy})`}</M> : plus ce ratio est faible, plus
            les données manquantes dominent et plus la convergence est lente.
          </p>

          <h3>Comment calculer le terme d'imputation — <M>{`\\nabla_{\\eta_y} A_y(\\eta_y^*(x_i))`}</M></h3>
          <p>
            Ce terme est la clé de l'étape E. Il apparaît parce que la vraisemblance exacte d'une
            observation <M>{`x_i`}</M> de type B contient{" "}
            <M>{`A_y(\\eta_y^*(x_i))`}</M> — la log-partition de <M>{`Y`}</M> évaluée au paramètre
            incliné. Son gradient par rapport à <M>{`\\eta_y`}</M>, et donc par rapport à
            <M>{`\\eta_{xy}`}</M> via <M>{`\\eta_y^* = \\eta_y + \\eta_{xy}^\\top T_x(x_i)`}</M>,
            est donné directement par la propriété fondamentale des familles exponentielles établie
            au chapitre 4 (§1) :
          </p>
          <Box title="Propriété clé — le gradient de A est l'espérance de T">{`
            \\nabla_{\\eta_y} A_y\\!\\bigl(\\eta_y^*(x_i)\\bigr)
            = \\mathbb{E}_{p(y\\,\\mid\\,\\eta_y^*(x_i))}[T_y(Y)]
          `}</Box>
          <p>
            C'est l'espérance de la statistique suffisante de <M>{`Y`}</M> sous sa loi avec le
            paramètre incliné. <em>C'est exactement la valeur que l'étape E impute</em> à la place
            de <M>{`T_y(y_i)`}</M> manquant — la valeur que <M>{`y_i`}</M> aurait en moyenne
            sachant <M>{`x_i`}</M>. Pas de calcul de gradient explicite : l'espérance de la
            statistique suffisante <em>est</em> le gradient.
          </p>

          <h3>Catalogue par famille — formules closes</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Famille de Y</th>
                <th><M>{`T_y(y)`}</M></th>
                <th><M>{`\\nabla_{\\eta_y} A_y(\\eta_y^*)`}</M></th>
                <th>Valeur imputée <M>{`\\widetilde{T}_y(x_i)`}</M></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gaussienne</td>
                <td><M>{`y`}</M></td>
                <td><M>{`\\eta_y^*`}</M></td>
                <td><M>{`\\eta_y + \\eta_{xy} \\cdot T_x(x_i)`}</M></td>
              </tr>
              <tr>
                <td>Bernoulli</td>
                <td><M>{`y \\in \\{0,1\\}`}</M></td>
                <td><M>{`\\sigma(\\eta_y^*)`}</M></td>
                <td><M>{`\\sigma\\!\\bigl(\\eta_y + \\eta_{xy}\\cdot T_x(x_i)\\bigr)`}</M></td>
              </tr>
              <tr>
                <td>Poisson</td>
                <td><M>{`y \\in \\mathbb{N}`}</M></td>
                <td><M>{`e^{\\eta_y^*}`}</M></td>
                <td><M>{`\\exp\\!\\bigl(\\eta_y + \\eta_{xy}\\cdot T_x(x_i)\\bigr)`}</M></td>
              </tr>
              <tr>
                <td>Gamma</td>
                <td><M>{`-y`}</M></td>
                <td><M>{`-1/\\eta_y^*`}</M></td>
                <td><M>{`-1/(\\eta_y + \\eta_{xy}\\cdot T_x(x_i))`}</M></td>
              </tr>
            </tbody>
          </table>
          <p>
            Dans tous les cas la recette est identique : évaluer la fonction de lien inverse
            (la dérivée de <M>{`A_y`}</M>) au paramètre naturel incliné{" "}
            <M>{`\\eta_y^*(x_i)`}</M>. Numériquement, c'est une seule évaluation de fonction —
            pas d'intégrale, pas de simulation Monte-Carlo. Si la famille n'a pas de forme close
            (mélange, modèle hiérarchique), on peut toujours estimer l'espérance par Monte-Carlo
            en tirant quelques <M>{`y \\sim p(y \\mid \\eta_y^*(x_i))`}</M> et en moyennant
            leurs <M>{`T_y(y)`}</M>.
          </p>

          <div className="callout">
            <strong>Le fil conducteur des trois chapitres.</strong> Au chapitre 4, la mise à jour
            était deux additions. Au chapitre 5, la statistique suffisante jointe s'est enrichie
            d'un bloc croisé — toujours deux additions. Ici, l'obstruction vient d'une statistique
            <M>{`T_y(y_i)`}</M> non observée. L'algorithme EM la remplace par son espérance sous
            le modèle courant — exactement une bille imputée dans l'urne de <M>{`\\lambda^{(xy)}`}</M>.
            La mécanique des deux additions reprend ses droits ; seule la nature de la bille change :
            observée pour les paires, imputée pour les marginales. Et le gradient de cet algorithme
            — via l'identité de Louis ou la différentiation implicite — reste calculable en termes
            de statistiques suffisantes et de log-partition, fidèle jusqu'au bout à la géométrie
            de la famille exponentielle.
          </div>
        </Section>

        <hr className="rule" />

        {/* §8 */}
        <Section number="§ 8" title="Simulation interactive">
          <p>
            La simulation illustre le comportement des trois compteurs{" "}
            <M>{`\\nu_n^x`}</M>, <M>{`\\nu_n^y`}</M>, <M>{`\\nu_n^{xy}`}</M> et des
            distributions a posteriori correspondantes, sous l'approximation des priors produits (§4).
            Le modèle est gaussien avec variances unitaires et prior gaussien{" "}
            <M>{`N(0, 1/\\nu_0)`}</M> sur chaque paramètre avec <M>{`\\nu_0 = 0.4`}</M>.
          </p>

          <h3>Ce que la visualisation révèle</h3>
          <p>
            Le panneau du bas affiche les trois densités a posteriori sur{" "}
            <M>{`\\eta_x`}</M>, <M>{`\\eta_y`}</M>, <M>{`\\eta_{xy}`}</M> comme des gaussiennes,
            avec leur intervalle de confiance à 95 %. Ajoutez de nombreuses observations X seules :
            la densité de <M>{`\\eta_x`}</M> se concentre rapidement, mais celle de
            <M>{`\\eta_{xy}`}</M> reste inchangée. Ajoutez des observations Y seules : la densité
            de <M>{`\\eta_y`}</M> se concentre, celle de <M>{`\\eta_{xy}`}</M> reste plate.
            Seules les paires concentrent la densité de <M>{`\\eta_{xy}`}</M>.
          </p>
          <p>
            Le nuage de points montre les trois types d'observations dans leur géométrie naturelle :
            les observations X seules (rouge) sur l'axe X, les observations Y seules (bleu) sur
            l'axe Y, les paires (vert) dans le plan. La droite en pointillés est
            <M>{`y = \\hat{\\eta}_{xy} \\cdot x`}</M> avec sa bande de confiance à 95 %.
            Cette bande ne rétrécit qu'avec les paires.
          </p>

          <SparseUpdateWidget />

          <div className="callout">
            <strong>Lecture quantitative.</strong> Avec les données initiales (5 X seuls, 5 Y seuls,
            4 paires), <M>{`\\nu^x = 9.4`}</M> et <M>{`\\nu^y = 9.4`}</M> mais{" "}
            <M>{`\\nu^{xy} = 4.4`}</M>. Ajoutez 10 observations X seules : <M>{`\\nu^x`}</M> passe
            à 19.4 — la précision sur <M>{`\\eta_x`}</M> double — mais <M>{`\\nu^{xy}`}</M> reste à
            4.4. La bande de régression ne bouge pas d'un pixel. C'est la traduction directe de
            l'incompressibilité du §5.
          </div>
        </Section>

        <hr className="rule" />

        {/* Synthèse */}
        <Section number="Synthèse" title="Ce que la structure des données hétérogènes révèle">
          <table className="data-table">
            <thead>
              <tr><th>Objet</th><th>Rôle</th><th>Propriété clé</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><M>{`\\nu_n^x,\\,\\nu_n^y,\\,\\nu_n^{xy}`}</M></td>
                <td>Trois compteurs indépendants</td>
                <td><M>{`\\nu_n^{xy}`}</M> ne croît qu'avec les paires (type A)</td>
              </tr>
              <tr>
                <td><M>{`\\lambda_n^{(xy)} = \\sum_{\\text{A}} T_x \\otimes T_y`}</M></td>
                <td>Mémoire du couplage</td>
                <td>Seules les observations appariées y contribuent directement</td>
              </tr>
              <tr>
                <td>Vraisemblance marginale exacte</td>
                <td>Brise la conjugaison</td>
                <td>Via <M>{`A_y(\\eta_y + \\eta_{xy}^\\top T_x(x_i))`}</M> non linéaire</td>
              </tr>
              <tr>
                <td>Approximation prior-produit</td>
                <td>Rétablit la conjugaison</td>
                <td>Exacte si <M>{`\\eta_{xy} = 0`}</M>, approchée sinon</td>
              </tr>
              <tr>
                <td>EM — étape E</td>
                <td>Imputation de <M>{`T_y(y_i)`}</M></td>
                <td><M>{`= \\nabla_{\\eta_y} A_y(\\eta_y^*(x_i))`}</M> — espérance cond.</td>
              </tr>
              <tr>
                <td>EM — étape M</td>
                <td>Mise à jour conjuguée</td>
                <td>Deux additions avec statistiques complétées (ch. 5, §7)</td>
              </tr>
              <tr>
                <td><M>{`\\mathrm{Var}[\\eta_{xy}] = 1/\\nu_n^{xy}`}</M></td>
                <td>Incertitude sur le couplage</td>
                <td>Incompressible par les seules données marginales</td>
              </tr>
            </tbody>
          </table>
          <div className="callout" style={{ marginTop: 20 }}>
            <strong>Le résultat le plus profond.</strong> Le théorème de suffisance établit que toute
            l'information sur <M>{`\\eta_{xy}`}</M> dans les données <em>appariées</em> est capturée
            par <M>{`\\lambda^{(xy)} = \\sum_k T_x(x_k) \\otimes T_y(y_k)`}</M>. Ce théorème ne dit
            rien sur les données marginales — non parce qu'elles sont non-informatives, mais parce
            que leur information sur <M>{`\\eta_{xy}`}</M> passe par la log-partition non linéaire
            <M>{`A_y`}</M> — exactement l'asymétrie fondamentale conditionnement/marginalisation
            du chapitre 5 (§4). L'algorithme EM transforme cette information indirecte en statistiques
            suffisantes imputées, et les deux additions reprennent leurs droits.
          </div>
        </Section>

        <div className="chapter-footer">
          <span className="footer-label">Inférence Bayésienne · Chapitre 6</span>
          <span className="footer-label">Observations Éparses · Familles Exponentielles</span>
        </div>

      </div>
    </>
  );
}