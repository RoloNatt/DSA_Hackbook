import { useState, useMemo } from "react";
import {
  P, Sim, Controls, Choice, Stat, Stats, Verdict, Plot, Dot, Line, Label, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as CX from "../../lib/complexity.js";

// ════════════════════════════════════════════════════════════════════════════
// THE DOUBLING TEST — measure complexity instead of guessing it
// ════════════════════════════════════════════════════════════════════════════

const BY_ID = Object.fromEntries(CX.ALGORITHMS.map((a) => [a.id, a]));
const GROUPS = [...new Set(CX.ALGORITHMS.map((a) => a.group))];

const PRESETS = [
  { label: "Set vs list", a: "hashdup", b: "inlist", metric: "ops" },
  { label: "Sliding window vs all pairs", a: "window", b: "pairs", metric: "ops" },
  { label: "Naive vs memoized Fibonacci", a: "fibnaive", b: "fibmemo", metric: "ops" },
  { label: "Merge sort vs all pairs", a: "mergesort", b: "pairs", metric: "ops" },
  { label: "Balanced vs skewed tree (space)", a: "treebal", b: "treeskew", metric: "space" },
];

const GUIDES = [
  { label: "O(1)", f: () => 1 },
  { label: "O(log n)", f: (n) => Math.log2(Math.max(2, n)) },
  { label: "O(n)", f: (n) => n },
  { label: "O(n log n)", f: (n) => n * Math.log2(Math.max(2, n)) },
  { label: "O(n²)", f: (n) => n * n },
  { label: "O(n³)", f: (n) => n * n * n },
  { label: "O(2ⁿ)", f: (n) => 2 ** n },
];

const compact = (v) => {
  if (!Number.isFinite(v)) return "∞";
  const a = Math.abs(v);
  if (a >= 1e12) return (v / 1e12).toFixed(a >= 1e13 ? 0 : 1) + "T";
  if (a >= 1e9) return (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + "B";
  if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
  if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
  return Math.round(v).toString();
};

export function ComplexityLab() {
  const [aId, setAId] = useState("hashdup");
  const [bId, setBId] = useState("inlist");
  const [metric, setMetric] = useState("ops");

  const A = BY_ID[aId];
  const B = bId ? BY_ID[bId] : null;

  // When comparing, measure both on the SMALLER size range so a quadratic
  // algorithm is never asked to run at 65,536 just because its partner can.
  const ns = useMemo(() => {
    if (!B) return A.ns;
    return A.ns[A.ns.length - 1] <= B.ns[B.ns.length - 1] ? A.ns : B.ns;
  }, [aId, bId]);

  const ptsA = useMemo(() => CX.measure(A, ns), [aId, ns]);
  const ptsB = useMemo(() => (B ? CX.measure(B, ns) : null), [bId, ns]);

  const key = metric === "ops" ? "ops" : "space";
  const fitA = useMemo(() => CX.fitClass(ptsA, key), [ptsA, key]);
  const fitB = useMemo(() => (ptsB ? CX.fitClass(ptsB, key) : null), [ptsB, key]);
  const dblA = CX.doublingRatio(ptsA, key);
  const declaredA = metric === "ops" ? A.time : A.space;
  const declaredB = B ? (metric === "ops" ? B.time : B.space) : null;

  const isDoubling = ns.length > 1 && ns[1] === 2 * ns[0];
  const xOf = (n) => (isDoubling ? Math.log2(n) : n);
  const lastA = ptsA[ptsA.length - 1];
  const lastB = ptsB ? ptsB[ptsB.length - 1] : null;

  const vals = [...ptsA.map((p) => p[key]), ...(ptsB ? ptsB.map((p) => p[key]) : [])].filter((v) => v > 0);
  const yLo = Math.floor(Math.log10(Math.min(...vals))) - 0.3;
  const yHi = Math.ceil(Math.log10(Math.max(...vals))) + 0.3;
  const xMin = xOf(ns[0]), xMax = xOf(ns[ns.length - 1]);

  // Reference curves pinned to A's first measurement, so "which guide does the
  // data run along?" is a visual question.
  const n0 = ptsA[0].n, v0 = Math.max(1, ptsA[0][key]);
  const guides = GUIDES.filter((g) => (isDoubling ? g.label !== "O(2ⁿ)" : true));

  const lastRatio = dblA[dblA.length - 1];
  const reading = lastRatio ? CX.interpretRatio(lastRatio.ratio, lastRatio.added) : null;
  const matches = fitA.label === declaredA;

  const unit = metric === "ops" ? "operations" : "memory slots";

  return (
    <Sim
      n={1}
      title="The Doubling Test"
      breadcrumb="DSA · Measuring complexity"
      hook={<>Instead of reasoning about the code, <strong>run it</strong>: on 16 items, then 32, then 64, and count the work each time. If doubling the input doubles the work, it's linear. If the work quadruples, it's quadratic. If it only goes up by one, it's logarithmic. The numbers tell you the Big-O.</>}
      question={B
        ? `Same job, two approaches. How differently do "${A.label}" and "${B.label}" grow?`
        : `What happens to "${A.label}" every time n doubles?`}
      readout={
        <>
          At <strong style={{ fontFamily: "Consolas, monospace" }}>n = {lastA.n.toLocaleString()}</strong>, "{A.label}" used
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace", fontSize: 15 }}>{lastA[key].toLocaleString()}</strong> {unit}.
          {lastRatio && <> The last time n doubled, the {metric === "ops" ? "work" : "memory"} went
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>×{lastRatio.ratio.toFixed(2)}</strong> — {reading}.</>}
          {" "}Best-fit class from the measurements alone:
          {" "}<strong style={{ color: matches ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{fitA.label}</strong>
          {fitA.exponential && <> (measured growth <strong style={{ fontFamily: "Consolas, monospace" }}>{fitA.baseLabel}</strong>)</>}
          {matches ? <span style={{ color: P.good }}> — matches the analysis.</span> : <span style={{ color: P.bad }}> — analysis says {declaredA}.</span>}
          {B && lastB && (
            <> Compared with "{B.label}" at the same n: <strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{lastB[key].toLocaleString()}</strong>
              {" "}({fitB.label}) — {lastB[key] >= lastA[key]
                ? <strong style={{ fontFamily: "Consolas, monospace" }}>{(lastB[key] / Math.max(1, lastA[key])).toLocaleString(undefined, { maximumFractionDigits: 1 })}× more</strong>
                : <strong style={{ fontFamily: "Consolas, monospace" }}>{(lastA[key] / Math.max(1, lastB[key])).toLocaleString(undefined, { maximumFractionDigits: 1 })}× less</strong>}.</>
          )}
        </>
      }
      notice={"Look at the ratio column, not the raw numbers. Raw counts depend on the machine and the constant factors; the RATIO on doubling depends only on the growth class — ×1 constant, +1 step logarithmic, ×2 linear, a little over ×2 for n log n, ×4 quadratic, ×8 cubic. That is why Big-O drops constants: they don't change the ratio.\n\nTry \"Sliding window vs all pairs\". Both have a loop inside a loop, but the window's ratio sits at exactly ×2.00 while the pairs sit at ×4.00. Nesting doesn't decide complexity — how many times the inner loop runs in TOTAL does.\n\nThen switch the metric to Space and pick \"Balanced vs skewed tree\": identical code, identical O(n) time, but the skewed tree needs n stack frames and the balanced one only log n."}
      formalName="Empirical complexity analysis (the doubling / ratio test)"
      formalNote="Measure cost at n, 2n, 4n … and inspect T(2n)/T(n). It is how you sanity-check a derivation, and the same idea behind reading constraints: each doubling of n multiplies an O(nᵏ) algorithm's work by 2ᵏ."
    >
      <Controls>
        <Choice label="Metric" value={metric} set={setMetric} options={[{ id: "ops", label: "Time (operations)" }, { id: "space", label: "Space (peak memory)" }]} />
      </Controls>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: P.dim, marginBottom: 5 }}>
          Classic comparisons
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((p) => {
            const on = aId === p.a && bId === p.b && metric === p.metric;
            return (
              <button key={p.label} onClick={() => { setAId(p.a); setBId(p.b); setMetric(p.metric); }} style={{
                padding: "5px 11px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)",
                fontWeight: on ? 700 : 400, border: `1px solid ${on ? P.highlight : P.grid}`,
                background: on ? `${P.highlight}22` : "transparent", color: on ? P.highlight : P.dim,
              }}>{p.label}</button>
            );
          })}
          <button onClick={() => setBId(null)} style={{
            padding: "5px 11px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)",
            border: `1px solid ${P.grid}`, background: "transparent", color: B ? P.dim : P.faint,
          }}>{B ? "✕ Stop comparing" : "No comparison"}</button>
        </div>
      </div>

      <div style={{ padding: "10px 12px", background: P.panel, borderRadius: 10, border: `1px solid ${P.grid}`, marginBottom: 14 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: P.dim, marginBottom: 6 }}>
          Or pick any algorithm {B ? "(changes the amber line)" : ""}
        </div>
        {GROUPS.map((g) => (
          <div key={g} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 10.5, color: P.faint, width: 128, flexShrink: 0 }}>{g}</span>
            {CX.ALGORITHMS.filter((a) => a.group === g).map((a) => {
              const on = aId === a.id;
              const isB = bId === a.id;
              return (
                <button key={a.id} onClick={() => { setAId(a.id); if (bId === a.id) setBId(null); }} style={{
                  padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11.5, fontFamily: "var(--font-sans)",
                  fontWeight: on ? 700 : 400,
                  border: `1px solid ${on ? P.highlight : isB ? P.class1 : P.grid}`,
                  background: on ? `${P.highlight}22` : isB ? `${P.class1}18` : "transparent",
                  color: on ? P.highlight : isB ? P.class1 : P.dim, whiteSpace: "nowrap",
                }}>{a.label} <span style={{ opacity: 0.7, fontFamily: "Consolas, monospace" }}>{metric === "ops" ? a.time : a.space}</span></button>
              );
            })}
          </div>
        ))}
      </div>

      <Row>
        <Col flex="1 1 420px">
          <Plot width={460} height={320} xMin={xMin} xMax={xMax} yMin={yLo} yMax={yHi}
            xLabel={isDoubling ? "input size n (doubling each step)" : "input size n"}
            yLabel={`${metric === "ops" ? "operations" : "peak memory"} (log scale)`}
            xTicks={Math.min(ns.length, 7)} yTicks={5}
            xFmt={(v) => compact(isDoubling ? 2 ** v : v)} yFmt={(v) => compact(10 ** v)}>
            {({ sx, sy, W, H, pad }) => {
              const clipId = `cx-clip-${aId}-${bId}-${metric}`;
              return (
                <g>
                  <defs><clipPath id={clipId}><rect x={pad.l} y={pad.t} width={W} height={H} /></clipPath></defs>
                  <g clipPath={`url(#${clipId})`}>
                    {guides.map((g) => {
                      const pts = ns.map((n) => {
                        const v = (v0 * g.f(n)) / g.f(n0);
                        return [sx(xOf(n)), sy(Math.log10(Math.max(1e-9, v)))];
                      });
                      return <Line key={g.label} pts={pts} color={P.faint} width={1} dash="3 4" opacity={0.7} />;
                    })}
                  </g>
                  {guides.map((g) => {
                    const v = (v0 * g.f(ns[ns.length - 1])) / g.f(n0);
                    const y = Math.log10(Math.max(1e-9, v));
                    if (y < yLo || y > yHi) return null;
                    return <Label key={g.label} x={sx(xMax) - 3} y={sy(y) - 3} size={9} color={P.faint} anchor="end">{g.label}</Label>;
                  })}
                  {ptsB && (
                    <>
                      <Line pts={ptsB.filter((p) => p[key] > 0).map((p) => [sx(xOf(p.n)), sy(Math.log10(p[key]))])} color={P.class1} width={2.6} />
                      {ptsB.filter((p) => p[key] > 0).map((p, i) => <Dot key={`b${i}`} cx={sx(xOf(p.n))} cy={sy(Math.log10(p[key]))} color={P.class1} r={3.6} />)}
                    </>
                  )}
                  <Line pts={ptsA.filter((p) => p[key] > 0).map((p) => [sx(xOf(p.n)), sy(Math.log10(p[key]))])} color={P.highlight} width={2.8} />
                  {ptsA.filter((p) => p[key] > 0).map((p, i) => <Dot key={`a${i}`} cx={sx(xOf(p.n))} cy={sy(Math.log10(p[key]))} color={P.highlight} r={4} />)}
                </g>
              );
            }}
          </Plot>
          <Key items={[
            { color: P.highlight, label: `${A.label} (measured)`, line: true },
            ...(B ? [{ color: P.class1, label: `${B.label} (measured)`, line: true }] : []),
            { color: P.faint, label: "reference growth rates", dash: true },
          ]} />
          <Caption>Both axes are logarithmic{isDoubling ? "" : " on the vertical"}, so every growth class is a straight line with its own slope. The measured line runs parallel to its class.</Caption>
        </Col>

        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {isDoubling ? "Each time n doubled" : "Each step up in n"}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr>
                {["n", A.label.length > 18 ? "measured" : A.label, isDoubling ? "× ratio" : "× per step"].map((h) => (
                  <th key={h} style={{ textAlign: "right", padding: "4px 6px", color: P.dim, fontWeight: 700, fontSize: 10, textTransform: "uppercase", borderBottom: `1px solid ${P.grid}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ptsA.map((p, i) => {
                const prev = ptsA[i - 1];
                const r = prev && prev[key] > 0 ? p[key] / prev[key] : null;
                return (
                  <tr key={p.n} style={{ background: i % 2 ? P.panel : "transparent" }}>
                    <td style={{ textAlign: "right", padding: "3px 6px", color: P.dim, fontFamily: "Consolas, monospace" }}>{p.n.toLocaleString()}</td>
                    <td style={{ textAlign: "right", padding: "3px 6px", color: P.text, fontFamily: "Consolas, monospace" }}>{p[key].toLocaleString()}</td>
                    <td style={{ textAlign: "right", padding: "3px 6px", color: P.highlight, fontFamily: "Consolas, monospace", fontWeight: 700 }}>
                      {r === null ? "—" : `×${r.toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {reading && <Note color={P.predict}>Last doubling: <strong>{reading}</strong></Note>}

          <Stats>
            <Stat label={metric === "ops" ? "Measured time" : "Measured space"} value={fitA.label} color={matches ? P.good : P.bad} big
              hint={fitA.exponential ? fitA.baseLabel : `analysis: ${declaredA}`} />
            {B && <Stat label="Comparison" value={fitB.label} color={P.class1} hint={`analysis: ${declaredB}`} />}
          </Stats>
          <Stats>
            <Stat label="Time (analysis)" value={A.time} color={P.derived} />
            <Stat label="Space (analysis)" value={A.space} color={P.derived} />
          </Stats>
        </Col>
      </Row>

      <Row>
        <Col flex="1 1 360px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "14px 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The code being measured — {A.label}
          </div>
          <pre style={{
            margin: 0, padding: "11px 13px", background: "#0A0E17", borderRadius: 8, border: `1px solid ${P.grid}`,
            color: "#cdd6f4", fontFamily: "Consolas, monospace", fontSize: 12, lineHeight: 1.65, overflowX: "auto", whiteSpace: "pre",
          }}>{A.code}</pre>
          <Note>{A.lesson}</Note>
        </Col>
        {B && (
          <Col flex="1 1 360px">
            <div style={{ fontSize: 11, fontWeight: 700, color: P.class1, margin: "14px 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Compared with — {B.label}
            </div>
            <pre style={{
              margin: 0, padding: "11px 13px", background: "#0A0E17", borderRadius: 8, border: `1px solid ${P.class1}55`,
              color: "#cdd6f4", fontFamily: "Consolas, monospace", fontSize: 12, lineHeight: 1.65, overflowX: "auto", whiteSpace: "pre",
            }}>{B.code}</pre>
            <Note>{B.lesson}</Note>
          </Col>
        )}
      </Row>

      {aId === "hashdup" && bId === "inlist" && metric === "ops" && (
        <Verdict tone="warn">
          The only difference between these two functions is <code>set()</code> versus <code>[]</code>. At
          {" "}{lastA.n.toLocaleString()} numbers, that one word costs {(lastB[key] / lastA[key]).toLocaleString(undefined, { maximumFractionDigits: 0 })}× more work.
        </Verdict>
      )}
      {aId === "window" && bId === "pairs" && metric === "ops" && (
        <Verdict tone="good">
          Both have a loop nested inside a loop. The window stays within 2n operations because its left pointer only moves forward; the pairs version
          really does run its inner loop n times per outer step.
        </Verdict>
      )}
    </Sim>
  );
}
