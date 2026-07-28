import { useState, useMemo } from "react";
import { SWEEP_DATA } from "../data/ml/metrics.js";

// ─── SHARED PRIMITIVES ──────────────────────────────────────────────────────

export const C = {
  text: "var(--color-text-primary)",
  sub: "var(--color-text-secondary)",
  bg: "var(--color-background-secondary)",
  border: "var(--color-border-tertiary)",
  border2: "var(--color-border-secondary)",
};

export function Card({ children, accent, style }) {
  return (
    <div style={{
      padding: "14px 16px", background: C.bg, borderRadius: 10,
      border: `0.5px solid ${C.border}`,
      borderLeft: accent ? `3px solid ${accent}` : `0.5px solid ${C.border}`,
      ...style,
    }}>{children}</div>
  );
}

export function H({ children, color, size = 15, mt = 0 }) {
  return (
    <div style={{ fontSize: size, fontWeight: 700, color: color || C.text, marginTop: mt, marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function Body({ children, size = 13.5 }) {
  return (
    <div style={{ fontSize: size, color: C.text, lineHeight: 1.75, whiteSpace: "pre-line" }}>{children}</div>
  );
}

export function Sub({ children, size = 13 }) {
  return (
    <div style={{ fontSize: size, color: C.sub, lineHeight: 1.7, whiteSpace: "pre-line" }}>{children}</div>
  );
}

export function Table({ headers, rows, color = "#1A73E8", compact }) {
  return (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: compact ? 12 : 12.5 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "8px 10px", textAlign: "left", fontSize: 10.5, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em", color: C.sub,
                borderBottom: `1.5px solid ${color}33`, whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `0.5px solid ${C.border}`, background: i % 2 ? C.bg : "transparent" }}>
              {r.map((cell, j) => (
                <td key={j} style={{
                  padding: "8px 10px", color: j === 0 ? C.text : C.sub,
                  fontWeight: j === 0 ? 600 : 400, lineHeight: 1.55, verticalAlign: "top",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Code({ children, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ margin: "10px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 12px", background: "#2a2a3e", fontSize: 11, color: "#9aa5ce",
        fontFamily: "Consolas, monospace",
      }}>
        <span>{label || "python"}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          style={{
            background: "transparent", border: "1px solid #4a4a6a", color: "#9aa5ce",
            borderRadius: 5, padding: "2px 9px", fontSize: 10.5, cursor: "pointer", fontFamily: "inherit",
          }}
        >{copied ? "✓ copied" : "copy"}</button>
      </div>
      <pre style={{
        margin: 0, background: "#1e1e2e", padding: "14px 16px", overflowX: "auto",
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontSize: 12.5, lineHeight: 1.7, color: "#cdd6f4", whiteSpace: "pre",
      }}>{children}</pre>
    </div>
  );
}

export function Callout({ children, tone = "info", title }) {
  const tones = {
    info: { bg: "#E8F0FE", bd: "#1A73E8", fg: "#1A73E8" },
    warn: { bg: "#FFF8E1", bd: "#F9A825", fg: "#B28704" },
    good: { bg: "#E2F5EF", bd: "#0F7A5A", fg: "#0F7A5A" },
    bad: { bg: "#FCEBEB", bd: "#CC2A2A", fg: "#CC2A2A" },
  };
  const t = tones[tone] || tones.info;
  return (
    <div style={{ padding: "12px 15px", background: t.bg, borderRadius: 9, borderLeft: `3px solid ${t.bd}`, margin: "10px 0" }}>
      {title && <div style={{ fontSize: 11, fontWeight: 700, color: t.fg, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{title}</div>}
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{children}</div>
    </div>
  );
}

export function Collapse({ title, children, defaultOpen = false, color = "#1A73E8", badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `0.5px solid ${C.border2}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, padding: "11px 14px", background: open ? C.bg : "transparent",
        border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: open ? color : C.text }}>{title}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {badge}
          <span style={{ color: C.sub, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && <div style={{ padding: "4px 14px 14px" }}>{children}</div>}
    </div>
  );
}

// ─── BIAS-VARIANCE DARTBOARD ────────────────────────────────────────────────

const DART_SETS = {
  ll: [[0, -3], [3, 2], [-3, 2], [1, -1], [-2, -1], [2, 0]],
  lh: [[-16, -12], [18, 9], [2, -20], [-6, 18], [14, -8], [-12, 6]],
  hl: [[16, 15], [19, 12], [15, 19], [18, 17], [21, 14], [17, 21]],
  hh: [[14, 16], [26, 4], [8, 26], [22, 22], [4, 12], [28, 14]],
};

function Dartboard({ id, label, sublabel, color }) {
  const darts = DART_SETS[id];
  const cx = 55, cy = 55;
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 110 110" style={{ width: "100%", maxWidth: 150, height: "auto" }}>
        <circle cx={cx} cy={cy} r="48" fill="none" stroke={C.border} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="32" fill="none" stroke={C.border} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="16" fill="none" stroke={C.border} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill="#CC2A2A" opacity="0.85" />
        {darts.map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r="3.6" fill={color} opacity="0.9" />
        ))}
      </svg>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.45 }}>{sublabel}</div>
    </div>
  );
}

export function DartboardGrid() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 18, margin: "14px 0" }}>
        <Dartboard id="ll" color="#0F7A5A" label="Low bias, low variance" sublabel="THE GOAL — tight on the bullseye" />
        <Dartboard id="lh" color="#B84A00" label="Low bias, HIGH variance" sublabel="OVERFITTING — scattered, but the average is centred" />
        <Dartboard id="hl" color="#1A6BCC" label="HIGH bias, low variance" sublabel="UNDERFITTING — tight, but in the wrong place" />
        <Dartboard id="hh" color="#CC2A2A" label="High bias, high variance" sublabel="Worst case — scattered AND off-centre" />
      </div>
      <Callout tone="info" title="The subtle one">
        Look at "low bias, high variance": the AVERAGE of the darts is dead centre, but no single dart is. That's overfitting — the model class CAN represent the truth, but any individual trained model is thrown off by whichever noisy sample it happened to see.
      </Callout>
    </div>
  );
}

// ─── BIAS-VARIANCE COMPLEXITY EXPLORER ──────────────────────────────────────

const DEGREE_DATA = [
  { deg: 1, bias2: 0.2042, var: 0.0250, note: "A straight line cannot be a sine wave — wrong on average no matter the data. But every fitted line looks the same.", verdict: "UNDERFITTING", vc: "#1A6BCC" },
  { deg: 2, bias2: 0.2062, var: 0.0458, note: "Still too rigid to bend into a sine shape. Bias barely moved.", verdict: "Still underfitting", vc: "#1A6BCC" },
  { deg: 3, bias2: 0.0048, var: 0.0172, note: "A cubic approximates a sine wave well. Bias collapses, variance stays low.", verdict: "SWEET SPOT", vc: "#0F7A5A" },
  { deg: 5, bias2: 0.0001, var: 0.0473, note: "Bias is essentially zero now, but variance has started climbing.", verdict: "Past optimal", vc: "#9B6400" },
  { deg: 9, bias2: 0.3656, var: 159.7369, note: "A 9th-degree polynomial through 30 noisy points swings wildly between them — and swings DIFFERENTLY depending on which 30 points it saw.", verdict: "OVERFITTING, catastrophically", vc: "#CC2A2A" },
];

export function BiasVarianceExplorer() {
  const [idx, setIdx] = useState(2);
  const d = DEGREE_DATA[idx];
  const total = d.bias2 + d.var;
  const logScale = (v) => Math.min(100, Math.log10(v + 1.0001) * 48 + (v > 0 ? 6 : 0));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>Polynomial degree</span>
        <input
          type="range" min="0" max={DEGREE_DATA.length - 1} value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          style={{ flex: 1, minWidth: 160, accentColor: d.vc, cursor: "pointer" }}
        />
        <span style={{
          fontFamily: "Consolas, monospace", fontSize: 17, fontWeight: 700, color: d.vc,
          minWidth: 28, textAlign: "center",
        }}>{d.deg}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 12 }}>
        {[
          { l: "Bias²", v: d.bias2, c: "#1A6BCC", hint: "wrong on average" },
          { l: "Variance", v: d.var, c: "#CC2A2A", hint: "inconsistent" },
          { l: "Total error", v: total, c: "#6A1B9A", hint: "what you care about" },
        ].map((m) => (
          <div key={m.l} style={{ padding: "10px 12px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.sub }}>{m.l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.c, fontFamily: "Consolas, monospace" }}>
              {m.v < 100 ? m.v.toFixed(4) : m.v.toFixed(1)}
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 100, overflow: "hidden", marginTop: 5 }}>
              <div style={{ height: "100%", width: `${logScale(m.v)}%`, background: m.c, borderRadius: 100, transition: "width .2s" }} />
            </div>
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 3 }}>{m.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "11px 14px", background: `${d.vc}12`, borderRadius: 8, borderLeft: `3px solid ${d.vc}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: d.vc, marginBottom: 3 }}>{d.verdict}</div>
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{d.note}</div>
      </div>

      <Sub size={12}>
        {"\n"}Real numbers from fitting polynomials to a noisy sine wave, 200 times each on different random datasets. Bars use a log scale — degree 9's variance is 160, over 3,000× the sweet spot.
      </Sub>
    </div>
  );
}

// ─── COMPLEXITY CURVE + DOUBLE DESCENT ──────────────────────────────────────

export function ComplexityCurve() {
  return (
    <svg viewBox="0 0 420 200" style={{ width: "100%", height: "auto", maxWidth: 480 }}>
      <line x1="45" y1="165" x2="405" y2="165" stroke={C.border} strokeWidth="1.5" />
      <line x1="45" y1="18" x2="45" y2="165" stroke={C.border} strokeWidth="1.5" />
      <text x="225" y="188" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.65">model complexity →</text>
      <text x="14" y="95" fontSize="11" fill="currentColor" opacity="0.65" transform="rotate(-90 14 95)" textAnchor="middle">error</text>

      {/* Bias: high then falling */}
      <path d="M 55 35 Q 150 130 250 152 T 400 160" fill="none" stroke="#1A6BCC" strokeWidth="2.5" />
      <text x="70" y="30" fontSize="11" fill="#1A6BCC" fontWeight="700">bias²</text>

      {/* Variance: low then rising */}
      <path d="M 55 160 Q 180 155 270 120 T 400 30" fill="none" stroke="#CC2A2A" strokeWidth="2.5" />
      <text x="352" y="26" fontSize="11" fill="#CC2A2A" fontWeight="700">variance</text>

      {/* Total: U shape */}
      <path d="M 55 42 Q 150 108 205 112 T 400 45" fill="none" stroke="#6A1B9A" strokeWidth="3" strokeDasharray="0" />
      <text x="222" y="62" fontSize="11" fill="#6A1B9A" fontWeight="700">total error</text>

      {/* Sweet spot marker */}
      <line x1="205" y1="112" x2="205" y2="165" stroke="#0F7A5A" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="205" cy="112" r="5" fill="#0F7A5A" />
      <text x="205" y="132" fontSize="10.5" fill="#0F7A5A" fontWeight="700" textAnchor="middle">sweet spot</text>

      <text x="70" y="152" fontSize="10" fill="currentColor" opacity="0.55">too simple</text>
      <text x="330" y="152" fontSize="10" fill="currentColor" opacity="0.55">too complex</text>
    </svg>
  );
}

export function DoubleDescentCurve() {
  return (
    <div>
      <svg viewBox="0 0 460 200" style={{ width: "100%", height: "auto", maxWidth: 520 }}>
        <line x1="45" y1="165" x2="445" y2="165" stroke={C.border} strokeWidth="1.5" />
        <line x1="45" y1="18" x2="45" y2="165" stroke={C.border} strokeWidth="1.5" />
        <text x="245" y="190" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.65">model capacity →</text>
        <text x="14" y="92" fontSize="11" fill="currentColor" opacity="0.65" transform="rotate(-90 14 92)" textAnchor="middle">test error</text>

        {/* Classical U, spike, second descent */}
        <path d="M 58 40 Q 110 118 155 122 Q 190 124 210 92 Q 222 40 232 28"
          fill="none" stroke="#6A1B9A" strokeWidth="3" />
        <path d="M 232 28 Q 250 60 280 92 Q 330 128 440 138"
          fill="none" stroke="#6A1B9A" strokeWidth="3" />

        {/* Interpolation threshold */}
        <line x1="232" y1="22" x2="232" y2="165" stroke="#CC2A2A" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="232" y="15" fontSize="10" fill="#CC2A2A" fontWeight="700" textAnchor="middle">interpolation threshold</text>

        <text x="105" y="150" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="middle">classical U</text>
        <text x="360" y="120" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="middle">second descent</text>

        <circle cx="155" cy="122" r="4" fill="#0F7A5A" />
        <text x="155" y="140" fontSize="9.5" fill="#0F7A5A" textAnchor="middle" fontWeight="700">classical min</text>
        <circle cx="440" cy="138" r="4" fill="#0F7A5A" />
      </svg>
      <Sub size={12}>
        Three regimes: the familiar U as capacity grows · a SPIKE where the model has just barely enough capacity to fit the training data exactly (only one contorted solution exists) · then a second descent, often below the classical minimum, because past that point there are infinitely many perfect fits and gradient descent implicitly picks a smooth one.
      </Sub>
    </div>
  );
}

// ─── METRICS LAB: THRESHOLD → CONFUSION → ROC ───────────────────────────────

function computeAt(threshold) {
  const { yTrue, yScores } = SWEEP_DATA;
  let TP = 0, FP = 0, FN = 0, TN = 0;
  for (let i = 0; i < yTrue.length; i++) {
    const pred = yScores[i] >= threshold ? 1 : 0;
    if (pred === 1 && yTrue[i] === 1) TP++;
    else if (pred === 1 && yTrue[i] === 0) FP++;
    else if (pred === 0 && yTrue[i] === 1) FN++;
    else TN++;
  }
  const tpr = TP + FN ? TP / (TP + FN) : 0;
  const fpr = FP + TN ? FP / (FP + TN) : 0;
  const prec = TP + FP ? TP / (TP + FP) : 0;
  const f1 = prec + tpr ? (2 * prec * tpr) / (prec + tpr) : 0;
  return { TP, FP, FN, TN, tpr, fpr, prec, f1 };
}

export function MetricsLab() {
  const [t, setT] = useState(0.5);
  const m = computeAt(t);

  const rocPoints = useMemo(() => {
    const pts = [{ fpr: 0, tpr: 0 }];
    const sorted = [...SWEEP_DATA.yScores].sort((a, b) => b - a);
    for (const s of sorted) {
      const r = computeAt(s);
      pts.push({ fpr: r.fpr, tpr: r.tpr });
    }
    pts.push({ fpr: 1, tpr: 1 });
    return pts;
  }, []);

  const X = (v) => 45 + v * 300;
  const Y = (v) => 175 - v * 145;
  const path = rocPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${X(p.fpr)} ${Y(p.tpr)}`).join(" ");

  const cell = (label, val, color, hint) => (
    <div style={{ padding: "10px 8px", background: `${color}14`, borderRadius: 8, textAlign: "center", border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Consolas, monospace", lineHeight: 1.2 }}>{val}</div>
      <div style={{ fontSize: 9.5, color: C.sub }}>{hint}</div>
    </div>
  );

  return (
    <div>
      <Callout tone="info" title="How to use this">
        10 examples: 4 actually positive, 6 actually negative, with the model's scores. Drag the threshold and watch everything move. The key thing to internalize: LOWERING the threshold raises TPR and FPR TOGETHER — you cannot improve one without worsening the other.
      </Callout>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "14px 0" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>Threshold</span>
        <input type="range" min="0" max="1" step="0.01" value={t}
          onChange={(e) => setT(Number(e.target.value))}
          style={{ flex: 1, minWidth: 180, accentColor: "#1A73E8", cursor: "pointer" }} />
        <span style={{ fontFamily: "Consolas, monospace", fontSize: 17, fontWeight: 700, color: "#1A73E8", minWidth: 50, textAlign: "center" }}>
          {t.toFixed(2)}
        </span>
      </div>

      {/* Score strip */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
        {SWEEP_DATA.yScores.map((s, i) => {
          const isPos = SWEEP_DATA.yTrue[i] === 1;
          const flagged = s >= t;
          return (
            <div key={i} title={`${isPos ? "actually positive" : "actually negative"} · score ${s}`} style={{
              padding: "5px 8px", borderRadius: 6, fontSize: 11, fontFamily: "Consolas, monospace",
              fontWeight: 700,
              background: flagged ? (isPos ? "#0F7A5A" : "#CC2A2A") : C.bg,
              color: flagged ? "#fff" : C.sub,
              border: `1.5px solid ${isPos ? "#0F7A5A" : "#CC2A2A"}${flagged ? "" : "55"}`,
            }}>
              {s.toFixed(2)}
            </div>
          );
        })}
      </div>
      <Sub size={11.5}>
        Green border = actually positive · red border = actually negative · FILLED = the model flagged it at this threshold. Filled green = TP, filled red = FP, hollow green = FN (a miss), hollow red = TN.
      </Sub>

      {/* Confusion matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "14px 0" }}>
        {cell("TP", m.TP, "#0F7A5A", "caught it")}
        {cell("FP", m.FP, "#CC2A2A", "false alarm")}
        {cell("FN", m.FN, "#B84A00", "missed it")}
        {cell("TN", m.TN, "#1A6BCC", "correctly ignored")}
      </div>

      {/* Derived metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { l: "TPR / Recall", v: m.tpr, f: "TP/(TP+FN)", c: "#0F7A5A" },
          { l: "FPR", v: m.fpr, f: "FP/(FP+TN)", c: "#CC2A2A" },
          { l: "Precision", v: m.prec, f: "TP/(TP+FP)", c: "#6A1B9A" },
          { l: "F1", v: m.f1, f: "2PR/(P+R)", c: "#1A73E8" },
        ].map((x) => (
          <div key={x.l} style={{ padding: "9px 11px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{x.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: x.c, fontFamily: "Consolas, monospace" }}>{x.v.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: C.sub, fontFamily: "Consolas, monospace" }}>{x.f}</div>
          </div>
        ))}
      </div>

      {/* ROC */}
      <H size={13.5}>The ROC curve — every point is this same model at a different threshold</H>
      <svg viewBox="0 0 380 210" style={{ width: "100%", height: "auto", maxWidth: 430 }}>
        <line x1="45" y1="175" x2="355" y2="175" stroke={C.border} strokeWidth="1.5" />
        <line x1="45" y1="25" x2="45" y2="175" stroke={C.border} strokeWidth="1.5" />
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={C.sub} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
        <text x={X(0.62)} y={Y(0.52)} fontSize="10" fill="currentColor" opacity="0.55" transform={`rotate(-26 ${X(0.62)} ${Y(0.52)})`}>random guessing</text>
        <path d={path} fill="none" stroke="#1A73E8" strokeWidth="2.5" strokeLinejoin="round" />
        {rocPoints.map((p, i) => <circle key={i} cx={X(p.fpr)} cy={Y(p.tpr)} r="3" fill="#1A73E8" opacity="0.6" />)}
        <circle cx={X(m.fpr)} cy={Y(m.tpr)} r="7" fill="#CC2A2A" stroke="#fff" strokeWidth="2" />
        <text x="200" y="200" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">FPR →</text>
        <text x="16" y="100" fontSize="11" fill="currentColor" opacity="0.7" transform="rotate(-90 16 100)" textAnchor="middle">TPR →</text>
        <text x={X(0)} y="192" fontSize="9.5" fill="currentColor" opacity="0.55" textAnchor="middle">0</text>
        <text x={X(1)} y="192" fontSize="9.5" fill="currentColor" opacity="0.55" textAnchor="middle">1</text>
        <text x="38" y={Y(1)} fontSize="9.5" fill="currentColor" opacity="0.55" textAnchor="end">1</text>
        <text x="38" y={Y(0)} fontSize="9.5" fill="currentColor" opacity="0.55" textAnchor="end">0</text>
        <text x={X(0.05)} y={Y(0.95)} fontSize="10" fill="#0F7A5A" fontWeight="700">◤ perfect</text>
      </svg>
      <Sub size={12}>
        The red dot is your current threshold. AUC for this model is 0.875 — meaning a randomly chosen positive scores higher than a randomly chosen negative 87.5% of the time.
      </Sub>
    </div>
  );
}

// ─── LEARNING RATE VISUALIZER ───────────────────────────────────────────────

const LR_CASES = [
  { id: "small", label: "Too small", lr: "0.0001", color: "#1A6BCC", path: "M 40 40 Q 120 52 200 62 T 340 76", result: "w = 1.768 after 100 epochs (true w = 3.0)", note: "Shuffling forward one millimetre at a time. Still falling at the end — the tell that you should increase by 3–10×." },
  { id: "good", label: "Just right", lr: "0.01", color: "#0F7A5A", path: "M 40 38 Q 90 105 150 128 T 340 136", result: "w = 3.124 — converged", note: "Smooth decrease that flattens out. Confident walking pace. Nothing to change." },
  { id: "big", label: "Too big", lr: "0.1", color: "#CC2A2A", path: "M 40 100 L 70 55 L 100 125 L 130 30 L 160 140 L 190 18 L 220 145 L 250 12", result: "w = −1.09e+85 — DIVERGED", note: "Overshot the valley and landed higher on the opposite hillside, then overshot worse. Exponential blowup in about ten iterations. In a real run this shows up as NaN." },
];

export function LearningRateViz() {
  const [sel, setSel] = useState("good");
  const c = LR_CASES.find((x) => x.id === sel);
  return (
    <div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {LR_CASES.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} style={{
            padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12.5,
            fontFamily: "var(--font-sans)", fontWeight: sel === x.id ? 600 : 400,
            border: `1.5px solid ${sel === x.id ? x.color : C.border2}`,
            background: sel === x.id ? `${x.color}18` : "transparent",
            color: sel === x.id ? x.color : C.sub,
          }}>{x.label} <span style={{ fontFamily: "Consolas, monospace", fontSize: 11 }}>lr={x.lr}</span></button>
        ))}
      </div>
      <svg viewBox="0 0 380 175" style={{ width: "100%", height: "auto", maxWidth: 440 }}>
        <line x1="35" y1="155" x2="360" y2="155" stroke={C.border} strokeWidth="1.5" />
        <line x1="35" y1="10" x2="35" y2="155" stroke={C.border} strokeWidth="1.5" />
        <text x="197" y="171" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.65">training steps →</text>
        <text x="12" y="82" fontSize="10.5" fill="currentColor" opacity="0.65" transform="rotate(-90 12 82)" textAnchor="middle">loss</text>
        <path d={c.path} fill="none" stroke={c.color} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div style={{ padding: "11px 14px", background: `${c.color}12`, borderRadius: 8, borderLeft: `3px solid ${c.color}`, marginTop: 8 }}>
        <div style={{ fontFamily: "Consolas, monospace", fontSize: 12.5, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.result}</div>
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{c.note}</div>
      </div>
    </div>
  );
}

// ─── ACTIVATION FUNCTION PLOTS ──────────────────────────────────────────────

const ACTS = [
  { name: "ReLU", color: "#0F7A5A", fn: (x) => Math.max(0, x), note: "max(0,x). The default. Gradient exactly 1 for x>0 — doesn't attenuate the backward signal." },
  { name: "Sigmoid", color: "#1A6BCC", fn: (x) => 1 / (1 + Math.exp(-x)), note: "Squashes to (0,1). SATURATES at both ends → vanishing gradients. Output layer only." },
  { name: "Tanh", color: "#6A1B9A", fn: (x) => Math.tanh(x), note: "Squashes to (−1,1). Zero-centered, but still saturates." },
  { name: "GELU", color: "#B84A00", fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))), note: "Smooth ReLU variant. The default inside Transformers." },
  { name: "Leaky ReLU", color: "#AD1457", fn: (x) => (x > 0 ? x : 0.1 * x), note: "max(αx, x). Fixes dying ReLU — a unit stuck negative still gets gradient." },
];

function ActPlot({ act }) {
  const w = 130, h = 100, xr = 4, yr = 2.2;
  const X = (x) => (x + xr) / (2 * xr) * w;
  const Y = (y) => h - ((y + yr) / (2 * yr)) * h;
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const x = -xr + (2 * xr * i) / 80;
    pts.push(`${i === 0 ? "M" : "L"} ${X(x).toFixed(1)} ${Math.max(-20, Math.min(h + 20, Y(act.fn(x)))).toFixed(1)}`);
  }
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: 140, height: "auto" }}>
        <line x1="0" y1={Y(0)} x2={w} y2={Y(0)} stroke={C.border} strokeWidth="1" />
        <line x1={X(0)} y1="0" x2={X(0)} y2={h} stroke={C.border} strokeWidth="1" />
        <path d={pts.join(" ")} fill="none" stroke={act.color} strokeWidth="2.2" />
      </svg>
      <div style={{ fontSize: 12, fontWeight: 700, color: act.color, marginTop: 2 }}>{act.name}</div>
    </div>
  );
}

export function ActivationPlots() {
  const [sel, setSel] = useState(0);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 10 }}>
        {ACTS.map((a, i) => (
          <div key={a.name} onClick={() => setSel(i)} style={{
            cursor: "pointer", padding: 6, borderRadius: 8,
            border: `1.5px solid ${sel === i ? a.color : "transparent"}`,
            background: sel === i ? `${a.color}0d` : "transparent",
          }}>
            <ActPlot act={a} />
          </div>
        ))}
      </div>
      <Callout tone="info" title={ACTS[sel].name}>{ACTS[sel].note}</Callout>
    </div>
  );
}

// ─── CNN SHAPE CALCULATOR ───────────────────────────────────────────────────

export function ConvCalculator() {
  const [W, setW] = useState(32);
  const [K, setK] = useState(3);
  const [P, setP] = useState(1);
  const [S, setS] = useState(1);
  const [Cin, setCin] = useState(3);
  const [Cout, setCout] = useState(16);

  const out = Math.floor((W - K + 2 * P) / S) + 1;
  const params = (K * K * Cin + 1) * Cout;
  const denseEquiv = W * W * Cin * (out * out * Cout);
  const valid = out > 0;

  const field = (label, val, set, min, max) => (
    <div style={{ flex: "1 1 90px", minWidth: 84 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>{label}</label>
      <input type="number" value={val} min={min} max={max}
        onChange={(e) => set(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        style={{
          width: "100%", padding: "7px 9px", borderRadius: 7, border: `1px solid ${C.border2}`,
          background: "var(--color-background-primary)", color: C.text,
          fontFamily: "Consolas, monospace", fontSize: 14, fontWeight: 600,
        }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
        {field("Input W", W, setW, 1, 1024)}
        {field("Kernel K", K, setK, 1, 15)}
        {field("Padding P", P, setP, 0, 10)}
        {field("Stride S", S, setS, 1, 8)}
        {field("C_in", Cin, setCin, 1, 2048)}
        {field("C_out", Cout, setCout, 1, 2048)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <div style={{ padding: "12px 14px", background: "#E3F2FD", borderRadius: 9, border: "1px solid #1565C033" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Output shape</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1565C0", fontFamily: "Consolas, monospace" }}>
            {valid ? `${out}×${out}×${Cout}` : "invalid"}
          </div>
          <div style={{ fontSize: 11, color: C.sub, fontFamily: "Consolas, monospace", marginTop: 2 }}>
            ({W} − {K} + 2·{P}) / {S} + 1 = {valid ? out : "—"}
          </div>
        </div>
        <div style={{ padding: "12px 14px", background: "#E8F5E9", borderRadius: 9, border: "1px solid #2E7D3233" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#2E7D32", textTransform: "uppercase", letterSpacing: "0.05em" }}>Parameters</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2E7D32", fontFamily: "Consolas, monospace" }}>
            {params.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: C.sub, fontFamily: "Consolas, monospace", marginTop: 2 }}>
            ({K}·{K}·{Cin} + 1) · {Cout}
          </div>
        </div>
        <div style={{ padding: "12px 14px", background: "#FCEBEB", borderRadius: 9, border: "1px solid #CC2A2A33" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#CC2A2A", textTransform: "uppercase", letterSpacing: "0.05em" }}>A dense layer would need</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#CC2A2A", fontFamily: "Consolas, monospace" }}>
            {valid ? denseEquiv.toLocaleString() : "—"}
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
            {valid && params > 0 ? `${Math.round(denseEquiv / params).toLocaleString()}× more` : ""}
          </div>
        </div>
      </div>

      <Callout tone="warn" title="Practise these until instant">
        {"32×32, K=3, P=1, S=1 → 32 (\"same\" padding preserves size)\n32×32, K=3, P=0, S=1 → 30 (shrinks)\n224, K=7, P=3, S=2 → 112 (stride halves it)\nParams for K=3, C_in=3, C_out=16 → 448"}
      </Callout>
    </div>
  );
}

// ─── ATTENTION WALKTHROUGH ──────────────────────────────────────────────────

export function AttentionWalkthrough({ steps }) {
  const [step, setStep] = useState(0);
  const parts = [
    { t: "QKᵀ", on: step >= 1, c: "#1A73E8" },
    { t: " / √d_k", on: step >= 2, c: "#CC2A2A" },
    { t: " → softmax", on: step >= 3, c: "#B84A00" },
    { t: " · V", on: step >= 4, c: "#0F7A5A" },
  ];
  return (
    <div>
      <div style={{
        padding: "18px 16px", background: "#1e1e2e", borderRadius: 10, textAlign: "center",
        fontFamily: "'Fira Code', Consolas, monospace", fontSize: 17, marginBottom: 12, overflowX: "auto",
      }}>
        <span style={{ color: "#9aa5ce" }}>Attention(Q,K,V) = </span>
        {parts.map((p, i) => (
          <span key={i} style={{
            color: p.on ? p.c : "#4a4a6a", fontWeight: p.on ? 700 : 400,
            transition: "color .25s", textShadow: p.on ? `0 0 12px ${p.c}66` : "none",
          }}>{p.t}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {[0, 1, 2, 3, 4].map((n) => (
          <button key={n} onClick={() => setStep(n)} style={{
            padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 12,
            fontFamily: "var(--font-sans)", fontWeight: step === n ? 700 : 400,
            border: `1.5px solid ${step === n ? "#1A73E8" : C.border2}`,
            background: step === n ? "#E8F0FE" : "transparent",
            color: step === n ? "#1A73E8" : C.sub,
          }}>{n === 0 ? "start" : `step ${n}`}</button>
        ))}
      </div>

      {step > 0 && steps[step - 1] && (
        <div style={{ padding: "13px 16px", background: C.bg, borderRadius: 9, borderLeft: `3px solid ${parts[step - 1].c}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: parts[step - 1].c, marginBottom: 5, fontFamily: "Consolas, monospace" }}>
            {steps[step - 1].label}
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{steps[step - 1].body}</div>
        </div>
      )}
      {step === 0 && (
        <Sub>Click through the steps to build the formula up piece by piece. Step 2 — the √d_k scaling — is the part that gets asked constantly.</Sub>
      )}
    </div>
  );
}

// ─── RAG PIPELINE DIAGRAM ───────────────────────────────────────────────────

export function RAGPipeline() {
  const ingest = [
    { l: "Parse & clean", n: "PDF/HTML → text, preserve structure" },
    { l: "Chunk", n: "200–800 tokens, 10–20% overlap, structure-aware" },
    { l: "Enrich", n: "metadata, titles, contextual summaries" },
    { l: "Embed", n: "chunk → vector" },
    { l: "Index", n: "vector DB + BM25 keyword index" },
  ];
  const query = [
    { l: "Query processing", n: "rewrite, expand, decompose" },
    { l: "Retrieve", n: "dense + sparse hybrid, top-N = 20–100" },
    { l: "Rerank", n: "cross-encoder → top-k = 3–10" },
    { l: "Assemble prompt", n: "context + question + grounding instructions" },
    { l: "Generate", n: "LLM" },
    { l: "Post-process", n: "citations, validation, guardrails" },
  ];
  const col = (title, items, color, tag) => (
    <div style={{ flex: "1 1 260px", minWidth: 240 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {title} <span style={{ opacity: 0.65, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{tag}</span>
      </div>
      {items.map((s, i) => (
        <div key={i} style={{ position: "relative", paddingLeft: 22, paddingBottom: i === items.length - 1 ? 0 : 12 }}>
          {i !== items.length - 1 && (
            <div style={{ position: "absolute", left: 7, top: 16, bottom: 0, width: 2, background: `${color}33` }} />
          )}
          <div style={{
            position: "absolute", left: 0, top: 3, width: 16, height: 16, borderRadius: "50%",
            background: color, color: "#fff", fontSize: 9.5, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{i + 1}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{s.l}</div>
          <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5 }}>{s.n}</div>
        </div>
      ))}
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "16px 18px", background: C.bg, borderRadius: 10, border: `0.5px solid ${C.border}` }}>
        {col("Ingestion", ingest, "#6A1B9A", "— offline, once + on updates")}
        {col("Query", query, "#1A73E8", "— online, per request")}
      </div>
      <Callout tone="warn" title="Be able to draw this from memory">
        If you're asked to design a RAG system, drawing this and then discussing a tradeoff at EVERY stage is the answer. Chunking strategy, hybrid vs dense-only, top-N before reranking, k after, grounding instruction strength, and how you'd evaluate each half separately.
      </Callout>
    </div>
  );
}

// ─── LSTM GATE DIAGRAM ──────────────────────────────────────────────────────

export function LSTMDiagram() {
  return (
    <div>
      <svg viewBox="0 0 460 190" style={{ width: "100%", height: "auto", maxWidth: 520 }}>
        {/* Cell state highway */}
        <line x1="20" y1="42" x2="440" y2="42" stroke="#0F7A5A" strokeWidth="3.5" />
        <text x="26" y="32" fontSize="11" fill="#0F7A5A" fontWeight="700">cell state C — the memory conveyor belt (additive, gated)</text>
        <polygon points="440,42 432,38 432,46" fill="#0F7A5A" />

        {/* Forget gate */}
        <circle cx="130" cy="42" r="13" fill="#CC2A2A" opacity="0.9" />
        <text x="130" y="47" fontSize="13" fill="#fff" fontWeight="700" textAnchor="middle">×</text>
        <line x1="130" y1="120" x2="130" y2="58" stroke="#CC2A2A" strokeWidth="2" />
        <rect x="98" y="120" width="64" height="26" rx="6" fill="#CC2A2A" opacity="0.15" stroke="#CC2A2A" strokeWidth="1.5" />
        <text x="130" y="137" fontSize="10.5" fill="#CC2A2A" fontWeight="700" textAnchor="middle">forget σ</text>
        <text x="130" y="163" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="middle">what to erase</text>

        {/* Input gate */}
        <circle cx="250" cy="42" r="13" fill="#1A6BCC" opacity="0.9" />
        <text x="250" y="48" fontSize="15" fill="#fff" fontWeight="700" textAnchor="middle">+</text>
        <line x1="250" y1="120" x2="250" y2="58" stroke="#1A6BCC" strokeWidth="2" />
        <rect x="216" y="120" width="68" height="26" rx="6" fill="#1A6BCC" opacity="0.15" stroke="#1A6BCC" strokeWidth="1.5" />
        <text x="250" y="137" fontSize="10.5" fill="#1A6BCC" fontWeight="700" textAnchor="middle">input σ × C̃</text>
        <text x="250" y="163" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="middle">what to write</text>

        {/* Output gate */}
        <circle cx="370" cy="42" r="13" fill="#B84A00" opacity="0.9" />
        <text x="370" y="47" fontSize="13" fill="#fff" fontWeight="700" textAnchor="middle">×</text>
        <line x1="370" y1="120" x2="370" y2="58" stroke="#B84A00" strokeWidth="2" />
        <rect x="338" y="120" width="64" height="26" rx="6" fill="#B84A00" opacity="0.15" stroke="#B84A00" strokeWidth="1.5" />
        <text x="370" y="137" fontSize="10.5" fill="#B84A00" fontWeight="700" textAnchor="middle">output σ</text>
        <text x="370" y="163" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="middle">what to expose</text>

        {/* h_t out */}
        <line x1="370" y1="42" x2="370" y2="20" stroke="#B84A00" strokeWidth="2" />
        <text x="382" y="18" fontSize="11.5" fill="#B84A00" fontWeight="700">h_t</text>
      </svg>
      <Callout tone="good" title="The line to say">
        The cell state is updated ADDITIVELY and gated, so the gradient path through memory is multiplied by the FORGET GATE rather than by a weight matrix raised to a power — so it doesn't vanish exponentially the way a vanilla RNN's does.
      </Callout>
    </div>
  );
}

// ─── FLASHCARD ──────────────────────────────────────────────────────────────

export function Flashcard({ q, a, meta, followUp, detects }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ border: `0.5px solid ${C.border2}`, borderRadius: 10, marginBottom: 9, overflow: "hidden" }}>
      <button onClick={() => setShow(!show)} style={{
        width: "100%", padding: "12px 15px", background: show ? C.bg : "transparent",
        border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{q}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {meta}
          <span style={{ fontSize: 11, color: "#1A73E8", fontWeight: 600, whiteSpace: "nowrap" }}>
            {show ? "hide" : "reveal"}
          </span>
        </span>
      </button>
      {show && (
        <div style={{ padding: "0 15px 14px" }}>
          {detects && (
            <div style={{ fontSize: 11.5, color: "#B28704", background: "#FFF8E1", padding: "7px 10px", borderRadius: 6, marginBottom: 9, lineHeight: 1.55 }}>
              <strong>Detects:</strong> {detects}
            </div>
          )}
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: "pre-line" }}>{a}</div>
          {followUp && (
            <div style={{ marginTop: 11, padding: "10px 13px", background: "#E8F0FE", borderRadius: 8, borderLeft: "3px solid #1A73E8" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1A73E8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Follow-up they'll ask
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 4 }}>{followUp.q}</div>
              <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7 }}>{followUp.a}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DiffPill({ d }) {
  const map = { Easy: "#0F7A5A", Medium: "#B8860B", Hard: "#C62828", Practice: "#6A1B9A" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
      background: `${map[d] || "#666"}18`, color: map[d] || "#666", whiteSpace: "nowrap",
    }}>{d}</span>
  );
}
