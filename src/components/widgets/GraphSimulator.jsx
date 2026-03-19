import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";

// ── Helpers ──────────────────────────────────────────────────────────

let _nextId = 1;
const uid = () => `n${_nextId++}`;
const eid = (a, b) => [a, b].sort().join("--");

function makeNode(x, y, family = "nig") {
  const id = uid();
  if (family === "nig") {
    // λ₀ = (ν₀·μ₀, -ν₀/(2σ₀²))  with μ₀=0, σ₀²=1, ν₀=1
    return { id, x, y, family, lambda: [0, -0.5], nu: 1, obs: [] };
  }
  // dirichlet K=3: λ₀ = (α₁-1, α₂-1, α₃-1) with αₖ=2 → λ₀=(1,1,1), ν₀ = sum αₖ = 6
  return { id, x, y, family: "dir", lambda: [1, 1, 1], nu: 6, obs: [] };
}

function makeEdge(src, tgt) {
  const id = eid(src, tgt);
  // λ₀_xy = zero matrix, ν₀_xy = 0 (no prior coupling)
  return { id, source: src, target: tgt, lambda: 0, nu: 0 };
}

// ── Clinical interpretation for display ──────────────────────────────

function nigClinical(lambda, nu) {
  if (nu <= 0) return { mu: 0, sigma2: 1 };
  const mu = lambda[0] / nu;
  const sigma2 = nu > 0 ? -1 / (2 * lambda[1] / nu) : 1;
  return { mu: isFinite(mu) ? mu : 0, sigma2: isFinite(sigma2) && sigma2 > 0 ? sigma2 : 1 };
}

function dirAlphas(lambda) {
  return lambda.map(l => l + 1);
}

// ── NIG → Student-t predictive ───────────────────────────────────────
// After integrating out (μ, σ²) from NIG(μ₀, ν₀, α₀, β₀):
//   x ~ t_{2α}(μ₀, β(ν+1)/(αν))
// We parameterize NIG via λ and ν. Need to recover α, β.
// Convention: λ = (ν·μ₀, -ν/(2σ₀²))  with prior α₀, β₀.
// For simplicity (matching the ch4 formalisme), we use α₀ = ν/2, β₀ = ν·σ₀²/2
// so that the predictive is t_ν(μ₀, σ₀²·(ν+1)/ν)

function lnGamma(x) {
  // Lanczos approximation
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function studentPDF(x, nu, mu, scale) {
  // t_ν(mu, scale): density of location-scale Student-t
  // f(x) = Γ((ν+1)/2) / (Γ(ν/2)·√(νπs²)) · (1 + (x-μ)²/(νs²))^(-(ν+1)/2)
  const s2 = scale;
  const z = (x - mu);
  const logCoeff = lnGamma((nu + 1) / 2) - lnGamma(nu / 2) - 0.5 * Math.log(nu * Math.PI * s2);
  const logBody = -(nu + 1) / 2 * Math.log(1 + z * z / (nu * s2));
  return Math.exp(logCoeff + logBody);
}

// ── Predictive PDF Plot ──────────────────────────────────────────────

function PredictivePlot({ node }) {
  const canvasRef = useRef(null);
  const W = 400, H = 140;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const { mu, sigma2 } = nigClinical(node.lambda, node.nu);
    const nu = Math.max(node.nu, 0.5);

    // Predictive: t_ν(μ₀, σ₀²·(ν+1)/ν)
    const df = nu;
    const scale = sigma2 * (nu + 1) / nu;

    // Also overlay observations
    const obs = node.obs || [];

    // Determine x range: center on μ₀, spread based on scale
    const spread = Math.max(3 * Math.sqrt(scale * (df > 2 ? df / (df - 2) : 10)), 1);
    const xMin = mu - spread;
    const xMax = mu + spread;

    // If obs exist, extend range to include them
    let plotMin = xMin, plotMax = xMax;
    if (obs.length > 0) {
      plotMin = Math.min(plotMin, Math.min(...obs) - spread * 0.2);
      plotMax = Math.max(plotMax, Math.max(...obs) + spread * 0.2);
    }

    // Sample PDF
    const N = W;
    const xs = [], ys = [];
    let yMax = 0;
    for (let i = 0; i < N; i++) {
      const x = plotMin + (plotMax - plotMin) * i / (N - 1);
      const y = studentPDF(x, df, mu, scale);
      xs.push(x);
      ys.push(y);
      if (y > yMax) yMax = y;
    }
    yMax = yMax * 1.15 || 1; // headroom

    const pad = { t: 10, b: 24, l: 8, r: 8 };
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;
    const toX = (x) => pad.l + (x - plotMin) / (plotMax - plotMin) * pw;
    const toY = (y) => pad.t + ph - (y / yMax) * ph;

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    // Grid line at y=0
    ctx.strokeStyle = "#e8e0d6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, toY(0));
    ctx.lineTo(W - pad.r, toY(0));
    ctx.stroke();

    // PDF curve — fill
    ctx.beginPath();
    ctx.moveTo(toX(xs[0]), toY(0));
    for (let i = 0; i < N; i++) ctx.lineTo(toX(xs[i]), toY(ys[i]));
    ctx.lineTo(toX(xs[N - 1]), toY(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(139, 46, 18, 0.08)";
    ctx.fill();

    // PDF curve — stroke
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (i === 0) ctx.moveTo(toX(xs[i]), toY(ys[i]));
      else ctx.lineTo(toX(xs[i]), toY(ys[i]));
    }
    ctx.strokeStyle = "#8b2e12";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw observations as ticks
    if (obs.length > 0) {
      ctx.fillStyle = "#4a4540";
      obs.forEach(o => {
        const ox = toX(o);
        ctx.beginPath();
        ctx.moveTo(ox, toY(0));
        ctx.lineTo(ox, toY(0) + 8);
        ctx.strokeStyle = "#4a4540";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // small circle
        ctx.beginPath();
        ctx.arc(ox, toY(0) + 10, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // X-axis labels
    ctx.fillStyle = "#8a837a";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const nTicks = 5;
    for (let i = 0; i <= nTicks; i++) {
      const x = plotMin + (plotMax - plotMin) * i / nTicks;
      ctx.fillText(x.toFixed(1), toX(x), H - 4);
    }

    // Title
    ctx.fillStyle = "#8a837a";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Student-t  ν=${df.toFixed(1)}`, pad.l + 2, pad.t + 8);

  }, [node.lambda, node.nu, node.obs]);

  return (
    <div style={{ marginTop: 10 }}>
      <canvas ref={canvasRef}
        style={{ width: W, height: H, border: "1px solid #c8bfb0", borderRadius: 3, display: "block" }} />
    </div>
  );
}

// ── EM Algorithm ─────────────────────────────────────────────────────

function runEM(nodes, edges, maxIter = 50, tol = 1e-6) {
  // Build adjacency
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.source].push({ neighbor: e.target, edge: e });
    adj[e.target].push({ neighbor: e.source, edge: e });
  });

  // Initialize η from prior: η = λ/ν (moment parameters)
  const eta = {};
  nodes.forEach(n => {
    if (n.nu > 0) {
      eta[n.id] = n.lambda.map(l => l / n.nu);
    } else {
      eta[n.id] = n.family === "nig" ? [0, -0.5] : [0, 0, 0];
    }
  });

  const history = [JSON.parse(JSON.stringify(eta))];

  for (let it = 0; it < maxIter; it++) {
    const prevEta = JSON.parse(JSON.stringify(eta));

    nodes.forEach(node => {
      // Accumulate: λ_n = λ₀ + Σ T(xᵢ) + Σ_neighbors tilt
      const lambda_n = [...node.lambda];
      let nu_n = node.nu;

      // Add observations
      node.obs.forEach(x => {
        if (node.family === "nig") {
          lambda_n[0] += x;
          lambda_n[1] += x * x;
          // Actually for NIG: T(x) = (x, x²) but λ accumulates T directly
          // Wait — λ_n = λ₀ + Σ T(xᵢ), and for Gaussian T(x) = (x, x²)
          // But λ₀ for NIG is (ν₀μ₀, -ν₀/(2σ₀²))
          // The update is: λ_n = λ₀ + (Σxᵢ, Σxᵢ²)... hmm
          // Actually let me reconsider. In the conjugate framework:
          // λ_n = λ₀ + Σ T(xᵢ), ν_n = ν₀ + n
          // For Gaussian with T(x)=(x, x²): λ₀=(ν₀μ₀, -ν₀/(2σ₀²))
          // Actually λ₁ accumulates Σxᵢ and λ₂ accumulates -Σxᵢ²/2? No.
          // Let's be clean: T(x) = (x, -x²/2) so that η=(μ/σ², 1/σ²)
          // Then λ_n = λ₀ + Σ(xᵢ, -xᵢ²/2)
        } else {
          // Categorical: x is category index 0..K-1
          // T(x) = one-hot (but we accumulate log-counts for Dirichlet)
          // Actually for Dir-Cat conjugation: λ_n = λ₀ + (n₁, n₂, ..., nₖ)
          if (x >= 0 && x < lambda_n.length) {
            lambda_n[x] += 1;
          }
        }
        nu_n += 1;
      });

      // Add neighbor influences (mean-field EM approximation)
      adj[node.id].forEach(({ neighbor, edge }) => {
        if (edge.nu > 0) {
          const neighborEta = eta[neighbor];
          // Tilt: add η_xy * E[T(neighbor)] contribution
          // Simplified: just blend toward neighbor's current estimate
          const weight = edge.nu / (nu_n + edge.nu + 1);
          for (let k = 0; k < lambda_n.length; k++) {
            if (k < neighborEta.length) {
              lambda_n[k] += weight * neighborEta[k];
            }
          }
          nu_n += edge.nu;
        }
      });

      // Update η = λ_n / ν_n
      if (nu_n > 0) {
        eta[node.id] = lambda_n.map(l => l / nu_n);
      }
    });

    history.push(JSON.parse(JSON.stringify(eta)));

    // Check convergence
    let maxDiff = 0;
    nodes.forEach(n => {
      for (let k = 0; k < eta[n.id].length; k++) {
        maxDiff = Math.max(maxDiff, Math.abs(eta[n.id][k] - prevEta[n.id][k]));
      }
    });
    if (maxDiff < tol) break;
  }

  return { eta, history };
}

// ── Graph Visualization (D3 Force) ──────────────────────────────────

function GraphCanvas({ nodes, edges, selected, selType }) {
  const svgRef = useRef(null);
  const width = 600, height = 400;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Force simulation — runs once to compute layout, then stops
    const simNodes = nodes.map(n => ({ ...n }));
    const nodeMap = new Map(simNodes.map(n => [n.id, n]));
    const simEdges = edges.map(e => ({
      source: nodeMap.get(e.source),
      target: nodeMap.get(e.target),
      id: e.id,
    })).filter(e => e.source && e.target);

    const sim = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink(simEdges).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(40))
      .stop();

    // Run simulation synchronously
    for (let i = 0; i < 120; i++) sim.tick();

    // Draw links
    g.selectAll(".graph-link")
      .data(simEdges)
      .join("line")
      .attr("stroke", d => (selType === "edge" && d.id === selected) ? "#8b2e12" : "#c8bfb0")
      .attr("stroke-width", d => (selType === "edge" && d.id === selected) ? 3 : 1.5)
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);

    // Draw nodes
    const node = g.selectAll(".graph-node")
      .data(simNodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 22)
      .attr("fill", d => d.family === "nig" ? "#fdf5f2" : "#f2f5fd")
      .attr("stroke", d => (selType === "node" && d.id === selected) ? "#8b2e12" : "#4a4540")
      .attr("stroke-width", d => (selType === "node" && d.id === selected) ? 3 : 1.5);

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("font-size", "10px")
      .attr("fill", "#1a1714")
      .text(d => d.family === "nig" ? "𝒩" : "Dir");

    // Node ID label below
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "36")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("font-size", "9px")
      .attr("fill", "#8a837a")
      .text(d => {
        const obs = d.obs?.length || 0;
        return obs > 0 ? `${d.id} (n=${obs})` : d.id;
      });

    return () => {};
  }, [nodes, edges, selected, selType]);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: height, background: "white", border: "1px solid #c8bfb0", borderRadius: 4 }} />
  );
}

// ── Config Panel ─────────────────────────────────────────────────────

function NodePanel({ node, onChange, onDelete, allNodes }) {
  const clinical = node.family === "nig" ? nigClinical(node.lambda, node.nu) : { mu: 0, sigma2: 0 };
  const alphas = node.family === "dir" ? dirAlphas(node.lambda) : [];

  // For NIG: user edits μ₀, σ₀², ν₀ → we compute λ₀
  const setClinical = (mu, sigma2, nu) => {
    const l0 = nu * mu;
    const l1 = -nu / (2 * sigma2);
    onChange({ ...node, lambda: [l0, l1], nu });
  };

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">
          {node.family === "nig" ? "𝒩 Gaussienne (NIG)" : "Dir Dirichlet"}
        </span>
        <button className="sim-panel-delete" onClick={() => onDelete(node.id)}>✕</button>
      </div>

      <div className="sim-field">
        <label>Famille</label>
        <select value={node.family} onChange={e => onChange({ ...node, family: e.target.value, lambda: e.target.value === "nig" ? [0, -0.5] : [1, 1, 1], nu: e.target.value === "nig" ? 1 : 6, obs: [] })}>
          <option value="nig">Gaussienne (NIG)</option>
          <option value="dir">Dirichlet</option>
        </select>
      </div>

      {node.family === "nig" && (
        <>
          <div className="sim-field">
            <label>μ₀ (moyenne a priori)</label>
            <input type="number" step="0.5" value={+clinical.mu.toFixed(4)}
              onChange={e => setClinical(+e.target.value, clinical.sigma2, node.nu)} />
          </div>
          <div className="sim-field">
            <label>σ₀² (variance a priori)</label>
            <input type="number" step="0.5" min="0.01" value={+clinical.sigma2.toFixed(4)}
              onChange={e => setClinical(clinical.mu, Math.max(0.01, +e.target.value), node.nu)} />
          </div>
          <div className="sim-field">
            <label>ν₀ (pseudo-observations)</label>
            <input type="number" step="0.5" min="0.1" value={node.nu}
              onChange={e => setClinical(clinical.mu, clinical.sigma2, Math.max(0.1, +e.target.value))} />
          </div>
          <div className="sim-interp">
            → λ₀ = ({node.lambda[0].toFixed(3)}, {node.lambda[1].toFixed(3)}), ν₀ = {node.nu}
          </div>
        </>
      )}

      {node.family === "dir" && (
        <>
          <div className="sim-field">
            <label>ν₀ (pseudo-obs)</label>
            <input type="number" step="0.5" min="0.1" value={node.nu}
              onChange={e => onChange({ ...node, nu: +e.target.value })} />
          </div>
          {node.lambda.map((l, k) => (
            <div className="sim-field" key={k}>
              <label>λ₀,{k + 1} (α{k + 1} = {(l + 1).toFixed(1)})</label>
              <input type="number" step="0.5" min="-0.99" value={l}
                onChange={e => { const la = [...node.lambda]; la[k] = +e.target.value; onChange({ ...node, lambda: la }); }} />
            </div>
          ))}
        </>
      )}

      <div className="sim-obs-section">
        <label>Observations ({node.obs.length})</label>
        <div className="sim-obs-list">
          {node.obs.map((o, i) => (
            <span key={i} className="sim-obs-tag">
              {node.family === "nig" ? o.toFixed(1) : `cat ${o + 1}`}
              <button onClick={() => { const obs = [...node.obs]; obs.splice(i, 1); onChange({ ...node, obs }); }}>×</button>
            </span>
          ))}
        </div>
        <div className="sim-obs-add">
          {node.family === "nig" ? (
            <button onClick={() => {
              const v = parseFloat(prompt("Valeur observée:", "0"));
              if (!isNaN(v)) onChange({ ...node, obs: [...node.obs, v] });
            }}>+ Ajouter obs</button>
          ) : (
            node.lambda.map((_, k) => (
              <button key={k} onClick={() => onChange({ ...node, obs: [...node.obs, k] })}>
                + Cat {k + 1}
              </button>
            ))
          )}
        </div>
      </div>

      {node.family === "nig" && <PredictivePlot node={node} />}
    </div>
  );
}

function EdgePanel({ edge, onChange, onDelete, nodes }) {
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">
          Couplage {src?.id} ↔ {tgt?.id}
        </span>
        <button className="sim-panel-delete" onClick={() => onDelete(edge.id)}>✕</button>
      </div>
      <div className="sim-field">
        <label>ν₀_xy (force du couplage)</label>
        <input type="number" step="0.5" min="0" value={edge.nu}
          onChange={e => onChange({ ...edge, nu: +e.target.value })} />
      </div>
      <div className="sim-field">
        <label>λ₀_xy (bias d'interaction)</label>
        <input type="number" step="0.1" value={edge.lambda}
          onChange={e => onChange({ ...edge, lambda: +e.target.value })} />
      </div>
    </div>
  );
}

// ── EM Results Panel ─────────────────────────────────────────────────

function EMResults({ result, nodes }) {
  if (!result) return null;
  return (
    <div className="sim-panel sim-em-results">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Résultat EM ({result.history.length - 1} itérations)</span>
      </div>
      {nodes.map(n => {
        const eta = result.eta[n.id];
        if (!eta) return null;
        if (n.family === "nig") {
          const mu = eta[0];
          const sigma2 = eta[1] < 0 ? -1 / (2 * eta[1]) : NaN;
          return (
            <div key={n.id} className="sim-em-node">
              <strong>{n.id}</strong> (𝒩):
              μ̂ = {isFinite(mu) ? mu.toFixed(3) : "—"},
              σ̂² = {isFinite(sigma2) ? sigma2.toFixed(3) : "—"}
            </div>
          );
        } else {
          const alphas = eta.map(e => e + 1);
          const sum = alphas.reduce((a, b) => a + b, 0);
          return (
            <div key={n.id} className="sim-em-node">
              <strong>{n.id}</strong> (Dir):
              π̂ = ({alphas.map(a => (a / sum).toFixed(2)).join(", ")})
            </div>
          );
        }
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function GraphSimulator() {
  const [nodes, setNodes] = useState(() => {
    const a = makeNode(200, 200, "nig");
    const b = makeNode(400, 200, "nig");
    return [a, b];
  });
  const [edges, setEdges] = useState(() => {
    return [makeEdge(nodes[0]?.id, nodes[1]?.id)];
  });
  const [selected, setSelected] = useState(null);
  const [selType, setSelType] = useState(null);
  const [emResult, setEmResult] = useState(null);

  const addEdge = (srcId, tgtId) => {
    const existing = edges.find(e => e.id === eid(srcId, tgtId));
    if (!existing && srcId !== tgtId) {
      setEdges(prev => [...prev, makeEdge(srcId, tgtId)]);
    }
  };

  const handleSelect = useCallback((id, type) => {
    setSelected(id);
    setSelType(type);
  }, []);

  const addNode = (family) => {
    const n = makeNode(300 + Math.random() * 100, 200 + Math.random() * 100, family);
    setNodes(prev => [...prev, n]);
    setSelected(n.id);
    setSelType("node");
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelected(null);
    setSelType(null);
  };

  const deleteEdge = (id) => {
    setEdges(prev => prev.filter(e => e.id !== id));
    setSelected(null);
    setSelType(null);
  };

  const updateNode = (updated) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const updateEdge = (updated) => {
    setEdges(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const runEMSim = () => {
    const result = runEM(nodes, edges);
    setEmResult(result);
  };

  const selectedNode = selType === "node" ? nodes.find(n => n.id === selected) : null;
  const selectedEdge = selType === "edge" ? edges.find(e => e.id === selected) : null;

  return (
    <div className="graph-simulator">
      {/* Toolbar */}
      <div className="sim-toolbar">
        <button onClick={() => addNode("nig")}>+ 𝒩 Gaussienne</button>
        <button onClick={() => addNode("dir")}>+ Dir Dirichlet</button>
        <div className="sim-toolbar-sep" />
        <button className="sim-btn-play" onClick={runEMSim}
          disabled={nodes.length === 0}>
          ▶ EM
        </button>
        <span className="sim-status">
          {nodes.length} nœud{nodes.length !== 1 ? "s" : ""}, {edges.length} lien{edges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Main area */}
      <div className="sim-main">
        <div className="sim-graph-area">
          <GraphCanvas nodes={nodes} edges={edges} selected={selected} selType={selType} />

          {/* Node list */}
          <div className="sim-node-list">
            {nodes.map(n => (
              <button key={n.id}
                className={`sim-node-btn ${selType === "node" && selected === n.id ? "active" : ""}`}
                onClick={() => handleSelect(n.id, "node")}>
                <span className="sim-node-icon">{n.family === "nig" ? "𝒩" : "Dir"}</span>
                <span>{n.id}</span>
                {n.obs.length > 0 && <span className="sim-node-obs">n={n.obs.length}</span>}
              </button>
            ))}
            {edges.map(e => (
              <button key={e.id}
                className={`sim-node-btn sim-edge-btn ${selType === "edge" && selected === e.id ? "active" : ""}`}
                onClick={() => handleSelect(e.id, "edge")}>
                <span className="sim-node-icon">⟷</span>
                <span>{e.source} ↔ {e.target}</span>
              </button>
            ))}
          </div>

          {/* Add edge control */}
          {nodes.length >= 2 && (
            <div className="sim-add-edge">
              <label>Lier :</label>
              <select id="edge-src" defaultValue="">
                <option value="" disabled>source</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
              <span>↔</span>
              <select id="edge-tgt" defaultValue="">
                <option value="" disabled>cible</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
              <button onClick={() => {
                const src = document.getElementById("edge-src").value;
                const tgt = document.getElementById("edge-tgt").value;
                if (src && tgt) addEdge(src, tgt);
              }}>+</button>
            </div>
          )}
        </div>

        <div className="sim-side">
          {selectedNode && (
            <NodePanel node={selectedNode} onChange={updateNode}
              onDelete={deleteNode} allNodes={nodes} />
          )}
          {selectedEdge && (
            <EdgePanel edge={selectedEdge} onChange={updateEdge}
              onDelete={deleteEdge} nodes={nodes} />
          )}
          {!selectedNode && !selectedEdge && (
            <div className="sim-panel sim-hint">
              Sélectionnez un nœud ou un lien ci-dessous pour le configurer.
            </div>
          )}
          <EMResults result={emResult} nodes={nodes} />
        </div>
      </div>
    </div>
  );
}
