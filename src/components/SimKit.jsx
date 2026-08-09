import { useState, useEffect, useRef } from "react";

// Shared simulator kit.
//
// The <Sim> wrapper encodes the five-beat teaching structure as a component
// contract, so the structure cannot drift:
//
//   1. title      — the concept name, plainly, first
//   2. hook       — one concrete real-world scenario, plain-English variables
//   3. children   — the visual, built up incrementally
//   4. readout    — an explicit numeric result, always on screen
//   5. formalName — the jargon, attached only at the end
//
// hook and readout are REQUIRED. A simulator that renders a diagram without
// stating its result in words is exactly what this is designed to prevent.

// ─── PALETTE ────────────────────────────────────────────────────────────────
// One small palette, and each colour means the same thing everywhere:
// blue = class 0, red = class 1, amber = the thing being pointed at,
// cyan = a model's prediction, violet = a derived/second-order quantity.

export const P = {
  bg: "#0F1420",
  panel: "#161C2B",
  grid: "#252D3F",
  axis: "#4A5468",
  text: "#E6EAF2",
  dim: "#8A94A8",
  faint: "#5A6478",

  class0: "#4A9EFF",
  class1: "#FF5C5C",
  class0Fill: "rgba(74, 158, 255, 0.16)",
  class1Fill: "rgba(255, 92, 92, 0.16)",

  highlight: "#FFC93C",
  predict: "#3DD9C4",
  derived: "#B98CFF",
  good: "#4ADE80",
  bad: "#FF6B6B",
  neutral: "#8A94A8",
};

export const CLASS_COLORS = [P.class0, P.class1];

// ─── SIM WRAPPER ────────────────────────────────────────────────────────────

export function Sim({
  n, title, hook, question, children, readout, formalName, formalNote,
  notice, breadcrumb, height,
}) {
  if (!hook) throw new Error(`Sim "${title}" is missing its real-world hook (beat 2).`);
  if (!readout) throw new Error(`Sim "${title}" is missing its result readout (beat 4).`);

  return (
    <div style={{
      background: P.bg, borderRadius: 14, border: `1px solid ${P.grid}`,
      overflow: "hidden", marginBottom: 20,
    }}>
      {/* Beat 1 — title card. Breadcrumb doubles as the "you are here" marker. */}
      <div style={{
        padding: "13px 18px", borderBottom: `1px solid ${P.grid}`,
        display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: P.text, letterSpacing: "-0.01em" }}>
          {n != null && <span style={{ color: P.faint, fontWeight: 500 }}>{n}. </span>}
          {title}
        </div>
        {breadcrumb && (
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: P.faint }}>
            {breadcrumb}
          </div>
        )}
      </div>

      {/* Beat 2 — the hook, before any notation */}
      <div style={{ padding: "13px 18px", background: P.panel, borderBottom: `1px solid ${P.grid}` }}>
        <div style={{ fontSize: 13.5, color: P.text, lineHeight: 1.65 }}>{hook}</div>
        {question && (
          <div style={{ fontSize: 13.5, color: P.highlight, lineHeight: 1.6, marginTop: 7, fontWeight: 600 }}>
            {question}
          </div>
        )}
      </div>

      {/* Beat 3 — the visual */}
      <div style={{ padding: "16px 18px", minHeight: height }}>{children}</div>

      {/* Beat 4 — the explicit readout, never optional */}
      <div style={{
        padding: "12px 18px", borderTop: `1px solid ${P.grid}`,
        background: "rgba(255, 201, 60, 0.07)",
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: P.highlight, marginBottom: 6 }}>
          Result
        </div>
        <div style={{ fontSize: 13.5, color: P.text, lineHeight: 1.7 }}>{readout}</div>
      </div>

      {notice && (
        <div style={{ padding: "11px 18px", borderTop: `1px solid ${P.grid}`, background: P.panel }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: P.predict, marginBottom: 5 }}>
            What to notice
          </div>
          <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.7, whiteSpace: "pre-line" }}>{notice}</div>
        </div>
      )}

      {/* Beat 5 — the formal name, last */}
      {formalName && (
        <div style={{ padding: "11px 18px", borderTop: `1px solid ${P.grid}` }}>
          <span style={{ fontSize: 12, color: P.faint }}>The formal name for this: </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.derived }}>{formalName}</span>
          {formalNote && <div style={{ fontSize: 12.5, color: P.dim, lineHeight: 1.65, marginTop: 5 }}>{formalNote}</div>}
        </div>
      )}
    </div>
  );
}

// ─── CONTROLS ───────────────────────────────────────────────────────────────

export function Slider({ label, value, set, min, max, step = 1, unit = "", fmt, hint, color = P.highlight, width }) {
  const shown = fmt ? fmt(value) : value;
  return (
    <div style={{ flex: width ? `0 0 ${width}px` : "1 1 160px", minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: P.dim }}>
          {label}
        </label>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Consolas, monospace" }}>{shown}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", height: 4 }} />
      {hint && <div style={{ fontSize: 10.5, color: P.faint, lineHeight: 1.4, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

export function Choice({ label, value, set, options, color = P.predict }) {
  return (
    <div style={{ flex: "1 1 auto" }}>
      {label && (
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: P.dim, marginBottom: 4 }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {options.map((o) => {
          const id = typeof o === "string" ? o : o.id;
          const lab = typeof o === "string" ? o : o.label;
          const on = value === id;
          return (
            <button key={id} onClick={() => set(id)} title={typeof o === "object" ? o.hint : undefined} style={{
              padding: "5px 11px", borderRadius: 7, cursor: "pointer", fontSize: 12,
              fontFamily: "var(--font-sans)", fontWeight: on ? 700 : 400,
              border: `1px solid ${on ? color : P.grid}`,
              background: on ? `${color}22` : "transparent",
              color: on ? color : P.dim, whiteSpace: "nowrap", transition: "all 0.12s",
            }}>{lab}</button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({ label, on, set, color = P.predict }) {
  return (
    <button onClick={() => set(!on)} style={{
      padding: "6px 12px", borderRadius: 100, cursor: "pointer", fontSize: 12,
      fontFamily: "var(--font-sans)", fontWeight: on ? 700 : 400,
      border: `1px solid ${on ? color : P.grid}`,
      background: on ? `${color}22` : "transparent", color: on ? color : P.dim, whiteSpace: "nowrap",
    }}>{on ? "✓ " : ""}{label}</button>
  );
}

export function Controls({ children, wrap = true }) {
  return (
    <div style={{
      display: "flex", gap: 14, flexWrap: wrap ? "wrap" : "nowrap", alignItems: "flex-end",
      marginBottom: 14, padding: "11px 13px", background: P.panel, borderRadius: 10, border: `1px solid ${P.grid}`,
    }}>{children}</div>
  );
}

// ─── STEP PLAYER (beat 3: build up incrementally) ────────────────────────────

export function StepPlayer({ step, setStep, max, labels, speed = 700, autoLabel = "Play", color = P.highlight }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= max) { setPlaying(false); return s; }
        return s + 1;
      });
    }, speed);
    return () => clearInterval(timer.current);
  }, [playing, max, speed, setStep]);

  const btn = (txt, onClick, disabled, primary) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 13px", borderRadius: 7, fontSize: 12, fontFamily: "var(--font-sans)",
      fontWeight: primary ? 700 : 400, cursor: disabled ? "not-allowed" : "pointer",
      border: `1px solid ${primary ? color : P.grid}`,
      background: primary ? `${color}22` : "transparent",
      color: disabled ? P.faint : primary ? color : P.dim, opacity: disabled ? 0.45 : 1,
    }}>{txt}</button>
  );

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        {btn("↺", () => { setPlaying(false); setStep(0); }, step === 0)}
        {btn("‹ Back", () => setStep(Math.max(0, step - 1)), step === 0)}
        {btn(playing ? "❚❚ Pause" : `▶ ${autoLabel}`, () => { if (step >= max) setStep(0); setPlaying(!playing); }, false, true)}
        {btn("Next ›", () => setStep(Math.min(max, step + 1)), step >= max)}
        <span style={{ fontSize: 12, color: P.dim, fontFamily: "Consolas, monospace", marginLeft: 4 }}>
          step {step} / {max}
        </span>
      </div>
      {/* Progress track doubles as a scrubber */}
      <input type="range" min={0} max={max} value={step} onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }}
        style={{ width: "100%", accentColor: color, cursor: "pointer", height: 4 }} />
      {labels && labels[step] && (
        <div style={{ fontSize: 12.5, color: P.text, lineHeight: 1.6, marginTop: 7, padding: "7px 11px", background: P.panel, borderRadius: 7, borderLeft: `2px solid ${color}` }}>
          {labels[step]}
        </div>
      )}
    </div>
  );
}

// ─── READOUT TILES ──────────────────────────────────────────────────────────

export function Stat({ label, value, unit = "", color = P.text, hint, big }) {
  return (
    <div style={{
      flex: "1 1 96px", minWidth: 88, padding: "8px 11px", background: P.panel,
      borderRadius: 8, border: `1px solid ${P.grid}`,
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: P.dim }}>
        {label}
      </div>
      <div style={{ fontSize: big ? 22 : 17, fontWeight: 700, color, fontFamily: "Consolas, monospace", lineHeight: 1.25 }}>
        {value}<span style={{ fontSize: 11, color: P.faint }}>{unit}</span>
      </div>
      {hint && <div style={{ fontSize: 10, color: P.faint, lineHeight: 1.35, marginTop: 1 }}>{hint}</div>}
    </div>
  );
}

export const Stats = ({ children }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>{children}</div>
);

export function Verdict({ tone = "neutral", children }) {
  const c = { good: P.good, bad: P.bad, warn: P.highlight, neutral: P.predict }[tone];
  return (
    <div style={{
      padding: "9px 12px", borderRadius: 8, background: `${c}18`, borderLeft: `3px solid ${c}`,
      fontSize: 13, color: P.text, lineHeight: 1.65, marginTop: 10,
    }}>{children}</div>
  );
}

// ─── PLOT PRIMITIVES ────────────────────────────────────────────────────────

// A minimal-chrome cartesian frame: one axis pair, sparse ticks, no legend box.
export function Plot({
  width = 460, height = 320, xMin, xMax, yMin, yMax, xLabel, yLabel,
  children, pad = { l: 52, r: 14, t: 14, b: 42 }, xTicks = 5, yTicks = 5,
  xFmt = (v) => (Math.abs(v) >= 1000 ? v.toFixed(0) : Math.abs(v) < 1 && v !== 0 ? v.toFixed(1) : v.toFixed(v % 1 === 0 ? 0 : 1)),
  yFmt = null, grid = true,
}) {
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const sx = (v) => pad.l + ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => pad.t + H - ((v - yMin) / (yMax - yMin)) * H;
  const fy = yFmt || xFmt;

  const xt = Array.from({ length: xTicks }, (_, i) => xMin + ((xMax - xMin) * i) / (xTicks - 1));
  const yt = Array.from({ length: yTicks }, (_, i) => yMin + ((yMax - yMin) * i) / (yTicks - 1));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, height: "auto", display: "block" }}>
      {grid && (
        <g>
          {xt.map((v, i) => <line key={`gx${i}`} x1={sx(v)} y1={pad.t} x2={sx(v)} y2={pad.t + H} stroke={P.grid} strokeWidth="1" />)}
          {yt.map((v, i) => <line key={`gy${i}`} x1={pad.l} y1={sy(v)} x2={pad.l + W} y2={sy(v)} stroke={P.grid} strokeWidth="1" />)}
        </g>
      )}
      <line x1={pad.l} y1={pad.t + H} x2={pad.l + W} y2={pad.t + H} stroke={P.axis} strokeWidth="1.5" />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + H} stroke={P.axis} strokeWidth="1.5" />
      {xt.map((v, i) => (
        <text key={`tx${i}`} x={sx(v)} y={pad.t + H + 15} fill={P.dim} fontSize="10" textAnchor="middle" fontFamily="Consolas, monospace">{xFmt(v)}</text>
      ))}
      {yt.map((v, i) => (
        <text key={`ty${i}`} x={pad.l - 7} y={sy(v) + 3.5} fill={P.dim} fontSize="10" textAnchor="end" fontFamily="Consolas, monospace">{fy(v)}</text>
      ))}
      {xLabel && <text x={pad.l + W / 2} y={height - 6} fill={P.text} fontSize="11.5" textAnchor="middle" fontWeight="600">{xLabel}</text>}
      {yLabel && <text x={13} y={pad.t + H / 2} fill={P.text} fontSize="11.5" textAnchor="middle" fontWeight="600" transform={`rotate(-90, 13, ${pad.t + H / 2})`}>{yLabel}</text>}
      {typeof children === "function" ? children({ sx, sy, W, H, pad }) : children}
    </svg>
  );
}

export const Dot = ({ cx, cy, color, r = 4.5, stroke, halo, opacity = 1 }) => (
  <g opacity={opacity}>
    {halo && <circle cx={cx} cy={cy} r={r + 4.5} fill="none" stroke={halo} strokeWidth="1.6" opacity="0.75" />}
    <circle cx={cx} cy={cy} r={r} fill={color} stroke={stroke || P.bg} strokeWidth={stroke ? 1.6 : 0.8} />
  </g>
);

export const Line = ({ pts, color, width = 2, dash, opacity = 1, fill = "none" }) => (
  <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill={fill} stroke={color}
    strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinejoin="round" strokeLinecap="round" />
);

// Dashed guide from a point to both axes — the video's "point at exactly this".
export const Guide = ({ sx, sy, x, y, xMin, yMin, color = P.highlight }) => (
  <g opacity="0.75">
    <line x1={sx(x)} y1={sy(y)} x2={sx(xMin)} y2={sy(y)} stroke={color} strokeWidth="1" strokeDasharray="3 3" />
    <line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(yMin)} stroke={color} strokeWidth="1" strokeDasharray="3 3" />
  </g>
);

export const Label = ({ x, y, children, color = P.text, size = 11, anchor = "start", weight = 600, bg }) => (
  <g>
    {bg && <rect x={anchor === "middle" ? x - 26 : x - 3} y={y - 9} width={String(children).length * size * 0.58 + 8} height={13.5} fill={P.bg} opacity="0.82" rx="3" />}
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} fontWeight={weight} fontFamily="var(--font-sans)">{children}</text>
  </g>
);

// ─── DECISION-REGION SHADING ────────────────────────────────────────────────

export function Regions({ cells, dx, dy, sx, sy, opacity = 0.5 }) {
  return (
    <g opacity={opacity}>
      {cells.map((c, i) => {
        const x0 = sx(c.x - dx / 2), x1 = sx(c.x + dx / 2);
        const y0 = sy(c.y + dy / 2), y1 = sy(c.y - dy / 2);
        // Continuous score → blend; discrete label → flat colour
        const fill = typeof c.v === "number" && c.v > 0 && c.v < 1
          ? `rgba(${Math.round(255 * c.v + 74 * (1 - c.v))}, ${Math.round(92 * c.v + 158 * (1 - c.v))}, ${Math.round(92 * c.v + 255 * (1 - c.v))}, 0.30)`
          : c.v >= 0.5 ? P.class1Fill : P.class0Fill;
        return <rect key={i} x={x0} y={y0} width={Math.max(1, x1 - x0) + 0.5} height={Math.max(1, y1 - y0) + 0.5} fill={fill} />;
      })}
    </g>
  );
}

// ─── HEATMAP / MATRIX ───────────────────────────────────────────────────────

export function Heatmap({
  data, rowLabels, colLabels, cell = 34, min, max, fmt = (v) => v.toFixed(2),
  colorFor, title, highlight, showValues = true,
}) {
  const flat = data.flat().filter((v) => Number.isFinite(v));
  const lo = min ?? Math.min(...flat), hi = max ?? Math.max(...flat);
  const paint = colorFor || ((v) => {
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    return `rgba(61, 217, 196, ${0.08 + t * 0.82})`;
  });
  const labelW = rowLabels ? 66 : 6;
  const labelH = colLabels ? 22 : 6;

  return (
    <div style={{ overflowX: "auto" }}>
      {title && <div style={{ fontSize: 11.5, fontWeight: 700, color: P.dim, marginBottom: 6 }}>{title}</div>}
      <svg viewBox={`0 0 ${labelW + data[0].length * cell + 4} ${labelH + data.length * cell + 4}`}
        style={{ width: "100%", maxWidth: labelW + data[0].length * cell + 4, height: "auto", display: "block" }}>
        {colLabels?.map((l, j) => (
          <text key={j} x={labelW + j * cell + cell / 2} y={labelH - 7} fill={P.dim} fontSize="10" textAnchor="middle" fontFamily="var(--font-sans)">{l}</text>
        ))}
        {data.map((row, i) => (
          <g key={i}>
            {rowLabels && <text x={labelW - 7} y={labelH + i * cell + cell / 2 + 3.5} fill={P.dim} fontSize="10" textAnchor="end" fontFamily="var(--font-sans)">{rowLabels[i]}</text>}
            {row.map((v, j) => {
              const hot = highlight && highlight(i, j);
              return (
                <g key={j}>
                  <rect x={labelW + j * cell} y={labelH + i * cell} width={cell - 2} height={cell - 2} rx="3"
                    fill={paint(v, i, j)} stroke={hot ? P.highlight : P.grid} strokeWidth={hot ? 2 : 0.5} />
                  {showValues && Number.isFinite(v) && (
                    <text x={labelW + j * cell + (cell - 2) / 2} y={labelH + i * cell + (cell - 2) / 2 + 3.5}
                      fill={P.text} fontSize={cell > 30 ? "9.5" : "8.5"} textAnchor="middle" fontFamily="Consolas, monospace">{fmt(v)}</text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── PIXEL GRID (images, feature maps) ──────────────────────────────────────

export function PixelGrid({
  px, cell = 26, max = 9, min = 0, label, highlight, onCellClick, showValues = true, diverging = false,
}) {
  const lo = min, hi = max;
  return (
    <div>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textAlign: "center" }}>{label}</div>}
      <svg viewBox={`0 0 ${px[0].length * cell + 2} ${px.length * cell + 2}`}
        style={{ width: "100%", maxWidth: px[0].length * cell + 2, height: "auto", display: "block", margin: "0 auto" }}>
        {px.map((row, r) => row.map((v, c) => {
          const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
          // Diverging scale for signed feature maps: red negative, blue positive.
          const fill = diverging
            ? v >= 0 ? `rgba(74, 158, 255, ${Math.min(1, Math.abs(v) / Math.max(1e-6, hi)) * 0.9 + 0.05})`
              : `rgba(255, 92, 92, ${Math.min(1, Math.abs(v) / Math.max(1e-6, Math.abs(lo))) * 0.9 + 0.05})`
            : `rgba(230, 234, 242, ${0.04 + t * 0.94})`;
          const hot = highlight && highlight(r, c);
          return (
            <g key={`${r}-${c}`} onClick={onCellClick ? () => onCellClick(r, c) : undefined} style={{ cursor: onCellClick ? "pointer" : "default" }}>
              <rect x={c * cell + 1} y={r * cell + 1} width={cell - 1} height={cell - 1}
                fill={fill} stroke={hot ? P.highlight : P.grid} strokeWidth={hot ? 2.2 : 0.5} />
              {showValues && cell >= 20 && (
                <text x={c * cell + 1 + (cell - 1) / 2} y={r * cell + 1 + (cell - 1) / 2 + 3.2}
                  fill={diverging ? P.text : t > 0.55 ? P.bg : P.text} fontSize="9" textAnchor="middle" fontFamily="Consolas, monospace">
                  {Number.isInteger(v) ? v : v.toFixed(1)}
                </text>
              )}
            </g>
          );
        }))}
      </svg>
    </div>
  );
}

// ─── BAR CHART ──────────────────────────────────────────────────────────────

export function Bars({
  items, height = 150, width = 460, color = P.predict, fmt = (v) => v.toFixed(2),
  maxValue, showValues = true, horizontal = false, colorFor,
}) {
  const max = maxValue ?? Math.max(...items.map((i) => Math.abs(i.value)), 1e-9);

  if (horizontal) {
    const rowH = 22;
    return (
      <svg viewBox={`0 0 ${width} ${items.length * rowH + 6}`} style={{ width: "100%", maxWidth: width, height: "auto", display: "block" }}>
        {items.map((it, i) => {
          const w = (Math.abs(it.value) / max) * (width - 150);
          return (
            <g key={i}>
              <text x={92} y={i * rowH + 15} fill={P.dim} fontSize="11" textAnchor="end" fontFamily="var(--font-sans)">{it.label}</text>
              <rect x={98} y={i * rowH + 5} width={Math.max(1, w)} height={rowH - 10} rx="2.5" fill={colorFor ? colorFor(it, i) : it.color || color} />
              {showValues && <text x={98 + w + 6} y={i * rowH + 15} fill={P.text} fontSize="10.5" fontFamily="Consolas, monospace">{fmt(it.value)}</text>}
            </g>
          );
        })}
      </svg>
    );
  }

  const bw = (width - 20) / items.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, height: "auto", display: "block" }}>
      <line x1={10} y1={height - 26} x2={width - 10} y2={height - 26} stroke={P.axis} strokeWidth="1.2" />
      {items.map((it, i) => {
        const h = (Math.abs(it.value) / max) * (height - 52);
        return (
          <g key={i}>
            <rect x={10 + i * bw + bw * 0.14} y={height - 26 - h} width={bw * 0.72} height={Math.max(1, h)} rx="2.5"
              fill={colorFor ? colorFor(it, i) : it.color || color} />
            {showValues && h > 12 && (
              <text x={10 + i * bw + bw / 2} y={height - 30 - h} fill={P.text} fontSize="9.5" textAnchor="middle" fontFamily="Consolas, monospace">{fmt(it.value)}</text>
            )}
            <text x={10 + i * bw + bw / 2} y={height - 12} fill={P.dim} fontSize="10" textAnchor="middle" fontFamily="var(--font-sans)">{it.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── NODE-AND-EDGE DIAGRAM (networks, trees) ────────────────────────────────

export function Graph({ nodes, edges, width = 460, height = 300, children }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, height: "auto", display: "block" }}>
      {edges?.map((e, i) => (
        <g key={`e${i}`}>
          <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.color || P.grid}
            strokeWidth={e.width || 1.2} opacity={e.opacity ?? 1} strokeDasharray={e.dash} />
          {e.label && (
            <text x={(e.x1 + e.x2) / 2} y={(e.y1 + e.y2) / 2 - 3} fill={e.labelColor || P.faint}
              fontSize="9" textAnchor="middle" fontFamily="Consolas, monospace">{e.label}</text>
          )}
        </g>
      ))}
      {nodes?.map((nd, i) => (
        <g key={`n${i}`}>
          <circle cx={nd.x} cy={nd.y} r={nd.r || 15} fill={nd.fill || P.panel}
            stroke={nd.stroke || P.axis} strokeWidth={nd.strokeWidth || 1.5} />
          {nd.text != null && (
            <text x={nd.x} y={nd.y + 3.5} fill={nd.textColor || P.text} fontSize={nd.fontSize || 10}
              textAnchor="middle" fontFamily="Consolas, monospace" fontWeight="600">{nd.text}</text>
          )}
          {nd.label && (
            <text x={nd.x} y={nd.y - (nd.r || 15) - 5} fill={P.dim} fontSize="9.5" textAnchor="middle" fontFamily="var(--font-sans)">{nd.label}</text>
          )}
        </g>
      ))}
      {children}
    </svg>
  );
}

// ─── SIDE-BY-SIDE ROW ───────────────────────────────────────────────────────

export const Row = ({ children, gap = 16, align = "flex-start", wrap = true }) => (
  <div style={{ display: "flex", gap, flexWrap: wrap ? "wrap" : "nowrap", alignItems: align }}>{children}</div>
);

export const Col = ({ children, flex = "1 1 300px", min = 260 }) => (
  <div style={{ flex, minWidth: min }}>{children}</div>
);

export const Caption = ({ children }) => (
  <div style={{ fontSize: 11.5, color: P.faint, lineHeight: 1.55, marginTop: 6, textAlign: "center" }}>{children}</div>
);

export const Note = ({ children, color = P.dim }) => (
  <div style={{ fontSize: 12.5, color, lineHeight: 1.65, marginTop: 8 }}>{children}</div>
);

// A compact key. Colour conventions are global, so this stays tiny.
export function Key({ items }) {
  return (
    <div style={{ display: "flex", gap: 13, flexWrap: "wrap", marginTop: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: P.dim }}>
          <span style={{
            width: it.line ? 14 : 9, height: it.line ? 2.5 : 9, borderRadius: it.line ? 2 : "50%",
            background: it.color, display: "inline-block",
            ...(it.dash ? { background: "none", borderTop: `2px dashed ${it.color}`, height: 0 } : {}),
          }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
