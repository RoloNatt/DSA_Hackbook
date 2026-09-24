import { useState } from "react";
import { C, Table } from "./MLWidgets.jsx";
import { TIME_EXAMPLES, SPACE_EXAMPLES, TRADE_OFF, SUMMARY } from "../data/complexityExamples.js";
import { TIME_SHAPES, SPACE_SHAPES, DISPLAY } from "../data/loopShapes.js";

const BLUE = "#1A73E8";
const PURPLE = "#7C4DFF";

const mono = "'Fira Code', 'Cascadia Code', Consolas, monospace";

function Title({ children, sub }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px", color: C.text }}>{children}</h3>
      {sub && <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>{sub}</div>}
    </div>
  );
}

const Pill = ({ label, value, color }) => (
  <span style={{
    display: "inline-flex", alignItems: "baseline", gap: 6, padding: "3px 11px", borderRadius: 100,
    background: `${color}14`, border: `1px solid ${color}40`, whiteSpace: "nowrap",
  }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "Consolas, monospace", color }}>{value}</span>
  </span>
);

// ─── BY EXAMPLE: real Python, one rule per group ────────────────────────────

function ExampleGroups({ groups }) {
  return groups.map((g, gi) => (
    <div key={g.h} style={{ marginBottom: "1.6rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.sub, fontFamily: "Consolas, monospace" }}>{gi + 1}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{g.h}</span>
      </div>
      {g.items.map((it, ii) => (
        <div key={ii} style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
          <pre style={{
            margin: 0, padding: "12px 14px", background: "#1e1e2e", overflowX: "auto",
            color: "#cdd6f4", fontFamily: mono, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre",
          }}>{it.code}</pre>
          <div style={{ padding: "10px 14px", background: C.bg, display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {it.time && <Pill label="time" value={it.time} color={BLUE} />}
              {it.space && <Pill label="space" value={it.space} color={PURPLE} />}
            </div>
            <div style={{ flex: "1 1 260px", fontSize: 13, color: C.text, lineHeight: 1.65 }}>{it.note}</div>
          </div>
        </div>
      ))}
    </div>
  ));
}

export function TimeByExample() {
  return (
    <div>
      <Title sub="The question for time: as n grows, how many times does the work repeat? Each group below adds one rule. Read the comments — they are the counting.">
        Time complexity, by example
      </Title>
      <ExampleGroups groups={TIME_EXAMPLES} />
    </div>
  );
}

export function SpaceByExample() {
  return (
    <div>
      <Title sub="The question for space: what's the MOST extra memory you're holding at one moment? The input doesn't count — only what you create, including recursion frames.">
        Space complexity, by example
      </Title>
      <ExampleGroups groups={SPACE_EXAMPLES} />
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0.4rem 0 8px" }}>{TRADE_OFF.h}</div>
      <ExampleGroups groups={[{ h: "Same problem, two answers", items: TRADE_OFF.items }]} />
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0.4rem 0 4px" }}>Time and space together</div>
      <Table headers={SUMMARY.headers} rows={SUMMARY.rows} color={BLUE} />
    </div>
  );
}

// ─── SHAPES: minimal pseudocode → answer ────────────────────────────────────

function sizeLabel(s) {
  const usesM = /\bm\b/.test(s.code) || /·m|\(m\)/.test(s.answer);
  const usesK = /\bk\b/.test(s.code);
  const n = s.exp ? DISPLAY.nExp : DISPLAY.n;
  const parts = [`n = ${n.toLocaleString()}`];
  if (usesM) parts.push(`m = ${DISPLAY.m.toLocaleString()}`);
  if (usesK) parts.push(`k = ${DISPLAY.k}`);
  return { label: parts.join(", "), value: s.steps(n, DISPLAY.m, DISPLAY.k) };
}

function Shapes({ list, kind }) {
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState({});
  const groups = [...new Set(list.map((s) => s.group))];
  const accent = kind === "time" ? BLUE : PURPLE;
  const unit = kind === "time" ? "steps" : "held in memory at the peak";

  const toggle = (v) => { setHide(v); setShown({}); };
  const revealedCount = Object.keys(shown).length;

  return (
    <div>
      <Title sub={kind === "time"
        ? "Only the shape — no setup, no bodies, no base cases. Read it, say the answer out loud, then check. The count on each card is real: it's what that exact shape does at the size shown."
        : "Same idea for memory. For recursion, count how many calls are open at the same moment — not how many happen in total."}>
        {kind === "time" ? "Time: loop shapes" : "Space: shapes"}
      </Title>

      <div style={{
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16,
        padding: "9px 12px", background: C.bg, borderRadius: 9, border: `0.5px solid ${C.border}`,
      }}>
        <button onClick={() => toggle(!hide)} style={{
          padding: "6px 13px", borderRadius: 100, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
          fontFamily: "var(--font-sans)", border: `1.5px solid ${hide ? accent : C.border2}`,
          background: hide ? `${accent}14` : "transparent", color: hide ? accent : C.sub,
        }}>{hide ? "✓ Answers hidden — test yourself" : "Hide answers (test yourself)"}</button>
        {hide && (
          <>
            <span style={{ fontSize: 12.5, color: C.sub }}>{revealedCount} / {list.length} revealed</span>
            <button onClick={() => setShown(Object.fromEntries(list.map((s) => [s.id, true])))} style={{
              padding: "5px 11px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)",
              border: `1px solid ${C.border2}`, background: "transparent", color: C.sub,
            }}>Reveal all</button>
          </>
        )}
      </div>

      {groups.map((g) => (
        <div key={g} style={{ marginBottom: "1.4rem" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{g}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {list.filter((s) => s.group === g).map((s) => {
              const visible = !hide || shown[s.id];
              const { label, value } = sizeLabel(s);
              return (
                <div key={s.id} style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <pre style={{
                    margin: 0, padding: "12px 14px", background: "#1e1e2e", color: "#cdd6f4",
                    fontFamily: mono, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre", overflowX: "auto", flex: 1,
                  }}>{s.code}</pre>
                  <div style={{ padding: "9px 13px", background: C.bg, minHeight: 64 }}>
                    {visible ? (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "Consolas, monospace" }}>→ {s.answer}</div>
                        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55, marginTop: 3 }}>{s.why}</div>
                        <div style={{ fontSize: 11.5, color: C.sub, marginTop: 5, fontFamily: "Consolas, monospace" }}>
                          {label} → {Number.isFinite(value) ? value.toLocaleString() : "∞"} {unit}
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShown({ ...shown, [s.id]: true })} style={{
                        width: "100%", padding: "10px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700,
                        fontFamily: "var(--font-sans)", border: `1.5px dashed ${accent}66`, background: "transparent", color: accent,
                      }}>→ ?  (say it, then reveal)</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export const TimeShapes = () => <Shapes list={TIME_SHAPES} kind="time" />;
export const SpaceShapes = () => <Shapes list={SPACE_SHAPES} kind="space" />;
