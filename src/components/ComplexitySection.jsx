import { useState } from "react";
import { C, Table, Callout } from "./MLWidgets.jsx";
import { StageNav } from "./PathNav.jsx";
import { ComplexityLab } from "./sims/Complexity.jsx";
import { TimeByExample, SpaceByExample, TimeShapes, SpaceShapes } from "./ComplexityExamples.jsx";
import { CONSTRAINT_TABLE, PYTHON_COSTS, COMPLEXITY_NOTES } from "../data/bigo.js";
import {
  INTRO, TIME_METHOD, TIME_RULES, SPACE_METHOD, SPACE_RULES, WORKED, QUIZ, SAY_IT,
} from "../data/complexity.js";

// Time & space complexity, as an ordered path: understand the idea, learn to
// work it out, see it measured, apply it, then test yourself.

const ACCENT = "#1A73E8";

export const COMPLEXITY_STAGES = [
  {
    stage: "Understand", hint: "What Big-O is actually measuring",
    items: [
      { id: "meaning", label: "💡 What Big-O means", why: "One concrete story — finding duplicate phone numbers two ways — and why one approach falls over at 100,000 items while the other doesn't notice." },
    ],
  },
  {
    stage: "Time", hint: "Code first, then the bare shapes, then the rules",
    items: [
      { id: "timeEx", label: "⏱️ Time, by example", why: "Real Python, one rule at a time: one loop, sequential loops, nested loops, constant inner loops, halving, hidden costs, the amortized trap, and recursion." },
      { id: "timeShapes", label: "🔁 Time: loop shapes", why: "Just the loop shape — `for i in n: for j in range(i, m)` — and the answer. 38 cards with a hide-answers mode, each showing its real step count." },
      { id: "time", label: "📋 Time: the procedure", why: "The 8 steps to follow on any code you've never seen, plus a code-shape lookup table." },
    ],
  },
  {
    stage: "Space", hint: "Same order: code, shapes, rules",
    items: [
      { id: "spaceEx", label: "🧠 Space, by example", why: "Real Python: variables, sets, 2D tables and the rolling-row trick, recursion depth, copies — then the time-for-space trade-off and a summary of both." },
      { id: "spaceShapes", label: "🗂️ Space: shapes", why: "18 bare shapes for memory. The recursion ones are where people slip: count calls open at once, not calls in total." },
      { id: "space", label: "📋 Space: the procedure", why: "What counts, what doesn't, and Python's ~1,000-frame recursion limit." },
    ],
  },
  {
    stage: "Real code", hint: "Apply it, then measure it",
    items: [
      { id: "worked", label: "📝 Worked examples", why: "Ten real functions annotated line by line and derived step by step — including the hidden slice in Word Break and pseudo-polynomial coin change." },
      { id: "lab", label: "🔬 The doubling test", why: "Run 16 algorithms at n, 2n, 4n … and watch the work ratio reveal the class. Compare a set against a list, a window against pairs, a balanced tree against a skewed one." },
    ],
  },
  {
    stage: "In the interview", hint: "Read the constraints; know the hidden costs",
    items: [
      { id: "constraints", label: "🕵️ Constraints → algorithm", why: "Read n first and work backwards: the input limit tells you which complexity — and so which family of algorithms — the setter intended." },
      { id: "costs", label: "🐍 Python's hidden costs", why: "The lines that look O(1) but aren't, and the exact phrases to say out loud when you state a complexity." },
    ],
  },
  {
    stage: "Test yourself", hint: "Answer before you reveal",
    items: [
      { id: "quiz", label: "✅ Practice quiz", why: "Fourteen snippets. Pick the time and space for each before revealing — your score is saved in this browser." },
    ],
  },
];

const FLAT = COMPLEXITY_STAGES.flatMap((s) => s.items);

// ─── small light-theme primitives ───────────────────────────────────────────

function Title({ children, sub }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px", color: C.text }}>{children}</h3>
      {sub && <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>{sub}</div>}
    </div>
  );
}

const CodeBlock = ({ code }) => (
  <pre style={{
    margin: 0, padding: "12px 14px", background: "#1e1e2e", borderRadius: 9, overflowX: "auto",
    color: "#cdd6f4", fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace", fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre",
  }}>{code}</pre>
);

const Pill = ({ children, color = ACCENT }) => (
  <span style={{
    display: "inline-block", fontFamily: "Consolas, monospace", fontSize: 12.5, fontWeight: 700,
    padding: "2px 9px", borderRadius: 100, background: `${color}14`, color, border: `1px solid ${color}33`, whiteSpace: "nowrap",
  }}>{children}</span>
);

function Steps({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", background: `${ACCENT}14`, color: ACCENT, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, marginTop: 1,
          }}>{i + 1}</div>
          <div style={{ flex: 1, padding: "8px 12px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 2 }}>{s.step}</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── the sections ───────────────────────────────────────────────────────────

function Meaning() {
  return (
    <div>
      <Title>What Big-O means</Title>
      <div style={{ padding: "12px 15px", background: C.bg, borderRadius: 10, border: `0.5px solid ${C.border}`, marginBottom: 12, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
        {INTRO.hook}
      </div>
      <Table headers={INTRO.table.headers} rows={INTRO.table.rows} color={ACCENT} />
      <Callout tone="warn" title="The result">{INTRO.readout}</Callout>
      <Callout tone="info" title="The formal name">{INTRO.formal}</Callout>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "1.5rem 0 8px" }}>The growth ladder</div>
      <Table headers={INTRO.ladder.headers} rows={INTRO.ladder.rows} color={ACCENT} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginTop: 14 }}>
        {INTRO.cases.map((c) => (
          <div key={c.h} style={{ padding: "12px 14px", background: C.bg, borderRadius: 10, border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>{c.h}</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Time() {
  return (
    <div>
      <Title sub="Follow these in order on any piece of code. After a few weeks it becomes automatic — but say the steps out loud in the interview anyway; it is what they are listening for.">
        Working out TIME complexity
      </Title>
      <Steps items={TIME_METHOD} />
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "1.6rem 0 8px" }}>Code shape → complexity</div>
      <Table headers={TIME_RULES.headers} rows={TIME_RULES.rows} color={ACCENT} />
      <Callout tone="warn" title="The single biggest mistake">
        Counting how deeply loops are NESTED instead of how many times they actually RUN. A loop over 4 directions inside a loop over n is O(n). A while loop inside a for loop is O(n) if its pointer only moves forward. A single loop containing `x in list` is O(n²). The Worked Examples and the doubling test show all three.
      </Callout>
    </div>
  );
}

function Space() {
  return (
    <div>
      <Title sub="Space complexity is the extra memory your algorithm needs as the input grows. The procedure is shorter than for time — but step 3 catches almost everyone.">
        Working out SPACE complexity
      </Title>
      <Steps items={SPACE_METHOD} />
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "1.6rem 0 8px" }}>What you create → space</div>
      <Table headers={SPACE_RULES.headers} rows={SPACE_RULES.rows} color={ACCENT} />
      <Callout tone="info" title="Time and space trade against each other">
        Most optimizations spend memory to save time: a set turns an O(n²) duplicate check into O(n) at the cost of O(n) space; memoization turns O(2ⁿ) into O(n) at the cost of O(n) space. When you give your answer, name both — and if the interviewer asks for less memory, that is usually a hint to trade back.
      </Callout>
    </div>
  );
}

function Worked() {
  const [open, setOpen] = useState(WORKED[0].id);
  return (
    <div>
      <Title sub="Each function is annotated line by line with what that line costs, then the answer is derived — not just stated. Cover the answer and try each one first.">
        Worked examples
      </Title>
      {WORKED.map((w, i) => {
        const on = open === w.id;
        return (
          <div key={w.id} style={{ border: `0.5px solid ${on ? ACCENT : C.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
            <button onClick={() => setOpen(on ? null : w.id)} style={{
              width: "100%", textAlign: "left", cursor: "pointer", border: "none", padding: "10px 14px",
              background: on ? `${ACCENT}0D` : C.bg, fontFamily: "var(--font-sans)",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
            }}>
              <span>
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginRight: 8 }}>{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{w.title}</span>
                <span style={{ fontSize: 12, color: C.sub, marginLeft: 8 }}>· {w.rule}</span>
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                {on ? <><Pill>time {w.time}</Pill><Pill color="#7C4DFF">space {w.space}</Pill></> : <span style={{ fontSize: 12, color: C.sub }}>▸ open</span>}
              </span>
            </button>
            {on && (
              <div style={{ padding: "12px 14px" }}>
                <CodeBlock code={w.code} />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.07em", margin: "12px 0 6px" }}>
                  Deriving it
                </div>
                {w.steps.map((s, j) => (
                  <div key={j} style={{ display: "flex", gap: 9, fontSize: 13, color: C.text, lineHeight: 1.65, marginBottom: 4 }}>
                    <span style={{ color: ACCENT, fontWeight: 800, fontFamily: "Consolas, monospace" }}>{j + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, margin: "10px 0", flexWrap: "wrap" }}>
                  <Pill>Time: {w.time}</Pill>
                  <Pill color="#7C4DFF">Space: {w.space}</Pill>
                </div>
                <Callout tone="good" title="Take away">{w.lesson}</Callout>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Constraints() {
  return (
    <div>
      <Title sub="A computer does ~10⁸ simple operations per second. The problem setter chose n so the intended solution fits — so read n FIRST and work backwards to the algorithm.">
        🕵️ Constraints tell you the answer
      </Title>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--color-background-secondary)" }}>
              {["Constraint", "Intended complexity", "Meaning", "Typical algorithms"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONSTRAINT_TABLE.map((r, i) => (
              <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                <td style={{ padding: "10px 12px", fontFamily: "Consolas, monospace", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{r.n}</td>
                <td style={{ padding: "10px 12px", fontFamily: "Consolas, monospace", fontWeight: 700, color: "#C62828", whiteSpace: "nowrap" }}>{r.target}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.hint}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-primary)" }}>{r.algos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="info" title="Worked: n ≤ 10⁵">
        {"O(n²) → 10¹⁰ operations ≈ 100 seconds ✗\nO(n log n) → 1.7 × 10⁶ ≈ 0.02 seconds ✓\nO(n) → 10⁵ ≈ 0.001 seconds ✓\n\nSo `n ≤ 10⁵` is the setter saying \"no nested loops — sort, heap, binary search or a hashmap\". You know the answer's shape before you've thought about the problem."}
      </Callout>
      <Callout tone="warn" title="At Google, you often have to ask">
        Interviewers frequently leave constraints out on purpose. "How large can the input get?" belongs in your first five minutes — and the answer tells you which row of this table they have in mind. Pure Python runs slower than 10⁸ simple operations per second, so treat borderline rows as too slow.
      </Callout>
    </div>
  );
}

function Costs() {
  return (
    <div>
      <Title sub={'Google interviewers ask "what\'s the complexity of that line?" — these are the answers.'}>
        🐍 What Python built-ins cost
      </Title>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--color-background-secondary)" }}>
              {["Operation", "Cost", "Watch out"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PYTHON_COSTS.map((r, i) => (
              <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                <td style={{ padding: "9px 12px", fontFamily: "Consolas, monospace", fontSize: 12.5, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{r.op}</td>
                <td style={{ padding: "9px 12px", fontFamily: "Consolas, monospace", fontWeight: 700, color: r.cost.includes("O(n)") || r.cost.includes("O(j") || r.cost.includes("O(len") ? "#C62828" : "#0F7A5A", whiteSpace: "nowrap" }}>{r.cost}</td>
                <td style={{ padding: "9px 12px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)", marginTop: "1.5rem" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>💬 Things to say out loud in the interview</div>
        {COMPLEXITY_NOTES.map((n, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>• {n}</div>
        ))}
        {SAY_IT.map((n, i) => (
          <div key={`s${i}`} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>• {n}</div>
        ))}
      </div>
    </div>
  );
}

function Quiz() {
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cx-quiz")) || {}; } catch { return {}; }
  });
  const save = (next) => {
    setAnswers(next);
    try { localStorage.setItem("cx-quiz", JSON.stringify(next)); } catch { /* private mode */ }
  };
  const pick = (qid, part, opt) => {
    const cur = answers[qid] || {};
    if (cur.revealed) return;
    save({ ...answers, [qid]: { ...cur, [part]: opt } });
  };
  const reveal = (qid) => save({ ...answers, [qid]: { ...(answers[qid] || {}), revealed: true } });

  const done = QUIZ.filter((q) => answers[q.id]?.revealed);
  const score = done.reduce((s, q) => s + (answers[q.id].time === q.time.answer ? 1 : 0) + (answers[q.id].space === q.space.answer ? 1 : 0), 0);

  const opt = (q, part, o) => {
    const a = answers[q.id] || {};
    const chosen = a[part] === o;
    const right = q[part].answer === o;
    let bg = "transparent", border = C.border2, color = C.sub;
    if (a.revealed && right) { bg = "#E2F5EF"; border = "#0F7A5A"; color = "#0F7A5A"; }
    else if (a.revealed && chosen && !right) { bg = "#FCEBEB"; border = "#CC2A2A"; color = "#CC2A2A"; }
    else if (chosen) { bg = `${ACCENT}14`; border = ACCENT; color = ACCENT; }
    return (
      <button key={o} onClick={() => pick(q.id, part, o)} style={{
        padding: "5px 11px", borderRadius: 7, cursor: a.revealed ? "default" : "pointer", fontSize: 12.5,
        fontFamily: "Consolas, monospace", fontWeight: chosen || (a.revealed && right) ? 700 : 400,
        border: `1.5px solid ${border}`, background: bg, color,
      }}>{o}{a.revealed && right ? " ✓" : ""}</button>
    );
  };

  return (
    <div>
      <Title sub="Work each one out using the procedure, pick your answers, then reveal. Say your reasoning out loud before you click — that's the skill being tested, not the multiple choice.">
        Practice quiz
      </Title>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <Pill>{done.length} / {QUIZ.length} answered</Pill>
        <Pill color={score === done.length * 2 && done.length ? "#0F7A5A" : "#B28704"}>score {score} / {done.length * 2}</Pill>
        {done.length > 0 && (
          <button onClick={() => save({})} style={{
            padding: "4px 10px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
            border: `1px solid ${C.border2}`, background: "transparent", color: C.sub,
          }}>↺ Reset quiz</button>
        )}
      </div>
      {QUIZ.map((q, i) => {
        const a = answers[q.id] || {};
        return (
          <div key={q.id} style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: a.revealed ? C.bg : "transparent" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>Question {i + 1}</div>
            <CodeBlock code={q.code} />
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Time</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{q.time.options.map((o) => opt(q, "time", o))}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Space</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{q.space.options.map((o) => opt(q, "space", o))}</div>
              </div>
            </div>
            {!a.revealed ? (
              <button onClick={() => reveal(q.id)} disabled={!a.time || !a.space} style={{
                marginTop: 10, padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontFamily: "var(--font-sans)", fontWeight: 600,
                cursor: a.time && a.space ? "pointer" : "not-allowed",
                border: `1.5px solid ${a.time && a.space ? ACCENT : C.border2}`,
                background: a.time && a.space ? `${ACCENT}14` : "transparent", color: a.time && a.space ? ACCENT : C.sub,
              }}>{a.time && a.space ? "Check my answer" : "Pick a time and a space first"}</button>
            ) : (
              <Callout tone={a.time === q.time.answer && a.space === q.space.answer ? "good" : "warn"}
                title={a.time === q.time.answer && a.space === q.space.answer ? "Both right" : `Answer: time ${q.time.answer}, space ${q.space.answer}`}>
                {q.explain}
              </Callout>
            )}
          </div>
        );
      })}
    </div>
  );
}

const RENDER = {
  meaning: Meaning, timeEx: TimeByExample, timeShapes: TimeShapes, time: Time,
  spaceEx: SpaceByExample, spaceShapes: SpaceShapes, space: Space, worked: Worked,
  lab: ComplexityLab, constraints: Constraints, costs: Costs, quiz: Quiz,
};

export default function ComplexitySection() {
  const [tab, setTab] = useState("meaning");
  const Comp = RENDER[tab];
  const pos = FLAT.findIndex((i) => i.id === tab);
  const next = FLAT[pos + 1];
  const prev = FLAT[pos - 1];

  const go = (id) => { setTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Big-O: time & space complexity</h2>
        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, margin: 0 }}>
          How fast your solution's cost grows as the input grows — and how to work it out from code, prove it by measuring, and read the intended answer off the constraints.
        </p>
      </div>
      <StageNav stages={COMPLEXITY_STAGES} tab={tab} setTab={setTab} accent={ACCENT}
        title={`Inside Big-O — ${FLAT.length} short sections, in this order`} />
      <Comp />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "2rem" }}>
        {prev && (
          <button onClick={() => go(prev.id)} style={{
            flex: "1 1 220px", textAlign: "left", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            border: `0.5px solid ${C.border2}`, background: C.bg, fontFamily: "var(--font-sans)",
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.sub }}>← Previous in Big-O</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: ACCENT, marginTop: 2 }}>{prev.label}</div>
          </button>
        )}
        {next && (
          <button onClick={() => go(next.id)} style={{
            flex: "1 1 220px", textAlign: "right", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            border: `0.5px solid ${ACCENT}55`, background: `${ACCENT}0A`, fontFamily: "var(--font-sans)",
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.sub }}>Next in Big-O →</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: ACCENT, marginTop: 2 }}>{next.label}</div>
            <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.45, marginTop: 2 }}>{next.why}</div>
          </button>
        )}
      </div>
    </div>
  );
}
