import { useState } from "react";
import { ALGOS } from "./src/data/algos.js";
import { CODE_SNIPPETS, SNIPPET_CATEGORIES } from "./src/data/snippets.js";
import { PATTERNS } from "./src/data/identify.js";
import { DECISION_STEPS, RESULTS } from "./src/data/decision.js";
import {
  GOOGLE_FORMAT, GOOGLE_RUBRIC, GOOGLE_TOPIC_FREQ,
  GOOGLE_STYLE, GOOGLE_PROTOCOL, GOOGLE_PROBLEMS, ML_DOMAIN,
} from "./src/data/google.js";
import { PLAN, PLAN_RULES } from "./src/data/plan.js";
import { CONSTRAINT_TABLE, PYTHON_COSTS, COMPLEXITY_NOTES } from "./src/data/bigo.js";
import MLSection from "./src/components/MLSection.jsx";
import SDSection from "./src/components/SDSection.jsx";
import LabsSection from "./src/components/LabsSection.jsx";
import { TRACKS, DSA_STAGES, LOOP_STAGES, STAGES_BY_TRACK, START } from "./src/data/paths.js";
import { StageNav, PathFooter } from "./src/components/PathNav.jsx";

// ─── SHARED UI ──────────────────────────────────────────────────────────────

const GOOGLE_BLUE = "#1A73E8";

function GoogleBadge({ stars, compact }) {
  if (!stars) return null;
  const label = ["", "occasional", "common", "core"][stars];
  return (
    <span title={`Google frequency: ${label}`} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: compact ? 10 : 11, fontWeight: 700, padding: compact ? "1px 7px" : "2px 9px",
      borderRadius: 100, background: "#E8F0FE", color: GOOGLE_BLUE,
      border: "0.5px solid #C6DAFC", whiteSpace: "nowrap",
    }}>
      G {"★".repeat(stars)}{"☆".repeat(3 - stars)}
    </span>
  );
}

function SectionHead({ children, sub }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text-primary)" }}>{children}</h2>
      {sub && <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{sub}</p>}
    </div>
  );
}

const diffColor = (d) =>
  d && d.startsWith("Easy") ? "#0F7A5A" : d && d.includes("Hard") ? "#C62828" : "#B8860B";

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function App() {
  const [track, setTrack] = useState("start");
  const [dsaTab, setDsaTab] = useState("identify");
  const [mlTab, setMlTab] = useState("playbook");
  const [sdTab, setSdTab] = useState("framework");
  const [labsTab, setLabsTab] = useState("linreg");
  const [loopTab, setLoopTab] = useState("google");
  const [activeCode, setActiveCode] = useState("hashmap");
  const [activeAlgo, setActiveAlgo] = useState("hashmap");
  const [googleFocus, setGoogleFocus] = useState(false);
  const [googleSub, setGoogleSub] = useState("format");
  const [decisionStep, setDecisionStep] = useState("start");
  const [decisionResult, setDecisionResult] = useState(null);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [planChecks, setPlanChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dsa-plan-checks")) || {}; }
    catch { return {}; }
  });

  // Track + section guards. Every render block below asks "am I the visible
  // section of the visible track?" so ordering lives entirely in paths.js.
  const dsa = (t) => track === "dsa" && dsaTab === t;
  const loop = (t) => track === "loop" && loopTab === t;

  const algo = ALGOS.find(a => a.id === activeAlgo);
  const step = DECISION_STEPS.find(s => s.id === decisionStep);
  const result = decisionResult ? RESULTS[decisionResult] : null;

  function togglePlanCheck(key) {
    const next = { ...planChecks, [key]: !planChecks[key] };
    setPlanChecks(next);
    try { localStorage.setItem("dsa-plan-checks", JSON.stringify(next)); } catch { /* private mode */ }
  }

  function choose(option) {
    setDecisionHistory([...decisionHistory, { stepId: decisionStep, choice: option.label }]);
    if (option.result) setDecisionResult(option.result);
    else if (option.next) setDecisionStep(option.next);
  }

  function resetDecision() {
    setDecisionStep("start");
    setDecisionResult(null);
    setDecisionHistory([]);
  }

  function openLearn(algoId) {
    if (ALGOS.some(a => a.id === algoId)) {
      setActiveAlgo(algoId);
      setTrack("dsa");
      setDsaTab("learn");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Sub-tab state for every track lives here so Start Here can deep-link
  // straight to a numbered step, not just to the track.
  const SETTERS = { dsa: setDsaTab, ml: setMlTab, labs: setLabsTab, sd: setSdTab, loop: setLoopTab };

  function goTrack(id, section) {
    setTrack(id);
    if (section && SETTERS[id]) SETTERS[id](section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const focusToggle = (
    <button onClick={() => setGoogleFocus(!googleFocus)} style={{
      padding: "6px 14px", borderRadius: 100, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
      fontFamily: "var(--font-sans)", transition: "all 0.15s",
      border: `1.5px solid ${googleFocus ? GOOGLE_BLUE : "var(--color-border-secondary)"}`,
      background: googleFocus ? "#E8F0FE" : "transparent",
      color: googleFocus ? GOOGLE_BLUE : "var(--color-text-secondary)",
    }}>
      {googleFocus ? "✓ " : ""}Sort by Google frequency
    </button>
  );

  const activeTrack = TRACKS.find(t => t.id === track);

  return (
    <div style={{ fontFamily: "var(--font-sans)", paddingBottom: "3rem", maxWidth: 1240, margin: "0 auto" }}>

      {/* ══ TRACK RAIL — top level: which round are you preparing for? ══ */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {TRACKS.map(t => {
          const on = track === t.id;
          return (
            <button key={t.id} onClick={() => goTrack(t.id)} style={{
              flex: "1 1 178px", textAlign: "left", cursor: "pointer",
              padding: "11px 14px", borderRadius: 11, fontFamily: "var(--font-sans)",
              border: `1.5px solid ${on ? t.accent : "var(--color-border-tertiary)"}`,
              background: on ? `${t.accent}14` : "var(--color-background-secondary)",
              transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 14, fontWeight: on ? 700 : 600, color: on ? t.accent : "var(--color-text-primary)" }}>
                {t.icon} {t.label}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", lineHeight: 1.4, marginTop: 3 }}>
                {t.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* ══ TRACK: START HERE ══ */}
      {track === "start" && (
        <div>
          <SectionHead sub={START.blurb}>{START.headline}</SectionHead>

          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: "1.5rem 0 10px" }}>
            🧭 Where to start, by round
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 10 }}>
            {START.order.map((o, i) => (
              <div key={i} style={{ padding: "13px 15px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.45, marginBottom: 5 }}>{o.t}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{o.d}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: "2rem 0 10px" }}>
            🗺️ Every track, in full
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRACKS.filter(t => t.id !== "start").map(t => {
              const stages = STAGES_BY_TRACK[t.id] || [];
              let n = 0;
              return (
                <div key={t.id} style={{ borderRadius: 11, border: `1px solid ${t.accent}44`, overflow: "hidden" }}>
                  <button onClick={() => goTrack(t.id)} style={{
                    width: "100%", textAlign: "left", cursor: "pointer", border: "none",
                    padding: "11px 15px", background: `${t.accent}14`, fontFamily: "var(--font-sans)",
                  }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: t.accent }}>{t.icon} {t.label}</span>
                    <span style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginLeft: 8 }}>
                      · {stages.reduce((a, s) => a + s.items.length, 0)} sections · open →
                    </span>
                  </button>
                  <div style={{ padding: "11px 15px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {stages.map((s, si) => (
                      <div key={s.stage} style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                        <span style={{ minWidth: 128, fontSize: 11.5, fontWeight: 800, color: "var(--color-text-primary)" }}>
                          {"①②③④⑤⑥"[si]} {s.stage}
                        </span>
                        <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {s.items.map(it => {
                            n += 1;
                            return (
                              <button key={it.id} onClick={() => goTrack(t.id, it.id)} style={{
                                fontSize: 12, padding: "3px 11px", borderRadius: 100, cursor: "pointer",
                                border: "0.5px solid var(--color-border-secondary)", fontFamily: "var(--font-sans)",
                                background: "var(--color-background-secondary)", color: "var(--color-text-secondary)",
                              }}>
                                <strong style={{ color: t.accent }}>{n}</strong> {it.label}
                              </button>
                            );
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: "2rem 0 10px" }}>
            ⚙️ How to use it
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 10 }}>
            {START.how.map((h, i) => (
              <div key={i} style={{ padding: "13px 15px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 5 }}>{h.icon} {h.t}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{h.d}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "#FFF8E1", borderRadius: 10, borderLeft: "3px solid #F9A825" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#B28704", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Worth knowing up front</div>
            {START.honesty.map((h, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.75 }}>• {h}</div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TRACK HEADER + READING PATH (DSA / Interview Loop) ══ */}
      {(track === "dsa" || track === "loop") && (
        <>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text-primary)" }}>
              {activeTrack.icon} {activeTrack.label}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
              {track === "dsa"
                ? "Four stages, in order: recognize the pattern from the problem statement, understand how it works, predict its cost, then write it from memory."
                : "Round-by-round formats and the evaluation rubric, then a day-by-day schedule that sequences the other tracks for you."}
            </p>
          </div>
          <StageNav
            stages={track === "dsa" ? DSA_STAGES : LOOP_STAGES}
            tab={track === "dsa" ? dsaTab : loopTab}
            setTab={track === "dsa" ? setDsaTab : setLoopTab}
            accent={activeTrack.accent}
          />
        </>
      )}

      {/* ══ TAB: IDENTIFY ══ */}
      {dsa("identify") && (
        <div>
          <SectionHead sub={
            <>Scan the problem statement for these signal phrases — each maps to a specific pattern. Rules marked <GoogleBadge stars={3} compact /> are high-frequency Google territory.</>
          }>How to identify which algorithm to use</SectionHead>
          {PATTERNS.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `2px solid ${cat.color}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: cat.color }}>{cat.category}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cat.rules.map((rule, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 5 }}>If you see this in the problem</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55, fontStyle: "italic" }}>{rule.signal}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>e.g. {rule.example}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: cat.color, fontSize: 20, padding: "0 4px" }}>→</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 5 }}>Use this</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: cat.bg, color: cat.color }}>{rule.algo}</span>
                        {rule.google && <GoogleBadge stars={3} compact />}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>{rule.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ TAB: DECISION TREE ══ */}
      {dsa("decision") && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <SectionHead sub="Answer these questions about your problem to find the right algorithm.">Algorithm Decision Tree</SectionHead>

          {decisionHistory.length > 0 && (
            <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
              {decisionHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0, color: "var(--color-text-secondary)", marginTop: 2 }}>{i + 1}</div>
                  <div style={{ flex: 1, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 13, color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>You chose: </span>{h.choice}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!decisionResult ? (
            <div style={{ padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 12, border: "0.5px solid var(--color-border-secondary)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 10 }}>
                Question {decisionHistory.length + 1}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{step?.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {step?.options.map((opt, i) => (
                  <button key={i} onClick={() => choose(opt)} style={{
                    padding: "12px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                    background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14,
                    color: "var(--color-text-primary)", textAlign: "left", fontFamily: "var(--font-sans)", transition: "all 0.12s",
                  }}
                    onMouseEnter={e => e.target.style.borderColor = GOOGLE_BLUE}
                    onMouseLeave={e => e.target.style.borderColor = "var(--color-border-secondary)"}
                  >{opt.label}</button>
                ))}
              </div>
              {decisionHistory.length > 0 && (
                <button onClick={resetDecision} style={{ marginTop: 14, padding: "6px 12px", borderRadius: 6, background: "transparent", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)" }}>↺ Start over</button>
              )}
            </div>
          ) : (
            <div style={{ padding: "1.5rem", background: result.bg, borderRadius: 12, border: `2px solid ${result.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: result.color, marginBottom: 10 }}>✅ Algorithm identified</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: result.color, marginBottom: 10 }}>{result.label}</div>
              <div style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: "1.25rem" }}>{result.tip}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={resetDecision} style={{ padding: "10px 20px", borderRadius: 8, background: result.color, color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }}>↺ Try another problem</button>
                <button onClick={() => { openLearn(result.algoId); resetDecision(); }} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", color: result.color, border: `1.5px solid ${result.color}`, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }}>Learn this algorithm →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: LEARN ══ */}
      {dsa("learn") && (() => {
        const list = googleFocus ? [...ALGOS].sort((a, b) => (b.google?.stars || 0) - (a.google?.stars || 0)) : ALGOS;
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: "1rem" }}>
              <SectionHead sub="Pick a pattern. Analogy first, then mechanics, complexity, and the traps.">Learn each algorithm</SectionHead>
              {focusToggle}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {list.map(a => (
                <button key={a.id} onClick={() => setActiveAlgo(a.id)} style={{
                  padding: "7px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                  background: activeAlgo === a.id ? a.color : "var(--color-background-secondary)",
                  color: activeAlgo === a.id ? "white" : "var(--color-text-secondary)",
                  cursor: "pointer", fontSize: 12.5, fontWeight: activeAlgo === a.id ? 500 : 400,
                  fontFamily: "var(--font-sans)", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  {a.emoji} {a.label}
                  {googleFocus && (a.google?.stars || 0) >= 3 && <span style={{ fontSize: 10 }}>★</span>}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Left */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                  <span style={{ fontSize: 36 }}>{algo.emoji}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>{algo.fullName}</h2>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: algo.bg, color: algo.color }}>{algo.family}</span>
                      <GoogleBadge stars={algo.google?.stars} />
                    </div>
                    <div style={{ fontSize: 14, color: algo.color, fontWeight: 500, marginTop: 3 }}>{algo.tagline}</div>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: "1rem" }}>{algo.analogy}</div>

                <div style={{ padding: "12px 14px", background: algo.bg, borderRadius: 8, fontSize: 13, color: algo.color, fontWeight: 500, marginBottom: "1rem" }}>{algo.memHook}</div>

                {algo.google?.note && (
                  <div style={{ padding: "12px 14px", background: "#E8F0FE", borderRadius: 8, border: "0.5px solid #C6DAFC", marginBottom: "1rem" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GOOGLE_BLUE, marginBottom: 4 }}>AT GOOGLE</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{algo.google.note}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 8 }}>Signal keywords (see these → use this)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {algo.keywords.map((kw, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 100, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                  <div style={{ flex: 1, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)" }}>Time</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: algo.color, fontFamily: "Consolas, monospace" }}>{algo.complexity?.time}</div>
                  </div>
                  <div style={{ flex: 1, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)" }}>Space</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: algo.color, fontFamily: "Consolas, monospace" }}>{algo.complexity?.space}</div>
                  </div>
                  {algo.complexity?.note && (
                    <div style={{ flex: 2, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)" }}>Note</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{algo.complexity.note}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 8 }}>How it works — step by step</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {algo.steps.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: algo.bg, color: algo.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                        <div style={{ flex: 1, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: algo.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}: </span>
                          <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55 }}>{s.t}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div style={{ padding: "1rem", background: "#E2F5EF", borderRadius: 8, borderLeft: "3px solid #0F7A5A" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#0F7A5A", marginBottom: 6 }}>Use when</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{algo.when}</div>
                  </div>
                  <div style={{ padding: "1rem", background: "#FCEBEB", borderRadius: 8, borderLeft: "3px solid #CC2A2A" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#CC2A2A", marginBottom: 6 }}>Don't use when</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{algo.notWhen}</div>
                  </div>
                </div>

                {algo.pitfalls && (
                  <div style={{ padding: "1rem", background: "#FFF8E1", borderRadius: 8, borderLeft: "3px solid #F9A825" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#B28704", marginBottom: 6 }}>⚠️ Interview pitfalls</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{algo.pitfalls}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ TAB: COMPARE ══ */}
      {dsa("compare") && (() => {
        const rows = googleFocus ? [...ALGOS].sort((a, b) => (b.google?.stars || 0) - (a.google?.stars || 0)) : ALGOS;
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <SectionHead sub="Every pattern side by side. Click a row to open its Learn card.">Algorithm quick reference</SectionHead>
              {focusToggle}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary)" }}>
                    {["Pattern", "Family", "Time", "Space", "Reach for it when", "Google"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a, i) => (
                    <tr key={a.id} onClick={() => openLearn(a.id)} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)", cursor: "pointer" }}>
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: a.color }}>{a.emoji} {a.label}</span>
                      </td>
                      <td style={{ padding: "11px 12px", color: "var(--color-text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>{a.family}</td>
                      <td style={{ padding: "11px 12px", fontFamily: "Consolas, monospace", fontSize: 12, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{a.complexity?.time}</td>
                      <td style={{ padding: "11px 12px", fontFamily: "Consolas, monospace", fontSize: 12, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{a.complexity?.space}</td>
                      <td style={{ padding: "11px 12px", color: "var(--color-text-secondary)", fontSize: 12, lineHeight: 1.5, fontStyle: "italic" }}>{a.keywords.slice(0, 3).join(" · ")}</td>
                      <td style={{ padding: "11px 12px" }}><GoogleBadge stars={a.google?.stars} compact /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 12 }}>🧠 One-line memory hooks</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
                {rows.map(a => (
                  <div key={a.id} style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 600, color: a.color }}>{a.emoji} {a.label}: </span>
                    <span style={{ color: "var(--color-text-secondary)" }}>{a.tagline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ TAB: CODE ══ */}
      {dsa("code") && (
        <div>
          <SectionHead sub="Copy-paste ready, self-contained implementations. Drill these until you can type them from memory in a plain doc — that's the interview condition.">Python code templates</SectionHead>

          {SNIPPET_CATEGORIES.map(cat => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "10px 0 6px" }}>{cat}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CODE_SNIPPETS.filter(s => s.category === cat).map(s => (
                  <button key={s.id} onClick={() => setActiveCode(s.id)} style={{
                    padding: "7px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                    background: activeCode === s.id ? s.color : "var(--color-background-secondary)",
                    color: activeCode === s.id ? "white" : "var(--color-text-secondary)",
                    cursor: "pointer", fontSize: 12.5, fontWeight: activeCode === s.id ? 500 : 400,
                    fontFamily: "var(--font-sans)", transition: "all 0.15s",
                  }}>{s.emoji} {s.label}</button>
                ))}
              </div>
            </div>
          ))}

          {(() => {
            const s = CODE_SNIPPETS.find(x => x.id === activeCode);
            if (!s) return null;
            return (
              <div style={{ borderRadius: 12, border: `1.5px solid ${s.color}`, overflow: "hidden", marginTop: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: s.bg, borderBottom: `1px solid ${s.color}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2, lineHeight: 1.5 }}>{s.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(s.code)}
                    style={{ padding: "7px 14px", borderRadius: 7, border: `1.5px solid ${s.color}`, background: "transparent", color: s.color, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)", transition: "all 0.15s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.target.style.background = s.color; e.target.style.color = "white"; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = s.color; }}
                  >📋 Copy</button>
                </div>
                <div style={{ background: "#1e1e2e", padding: "1.25rem 1.5rem", overflowX: "auto", margin: 0 }}>
                  <pre style={{ margin: 0, fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: 13, lineHeight: 1.75, color: "#cdd6f4", whiteSpace: "pre" }}>{s.code}</pre>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══ TAB: BIG-O ══ */}
      {dsa("bigo") && (
        <div>
          <SectionHead sub="Two superpowers: reading the intended solution off the constraints, and knowing what Python's built-ins actually cost.">Big-O & constraints</SectionHead>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>🕵️ Constraints tell you the answer</div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.6 }}>
              A computer does ~10⁸ simple operations per second. The problem setter chose n so the intended solution fits — so read n FIRST and work backwards to the algorithm.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary)" }}>
                    {["Constraint", "Intended complexity", "Meaning", "Typical algorithms"].map(h => (
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
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>🐍 What Python built-ins cost</div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.6 }}>
              Google interviewers ask "what's the complexity of that line?" — these are the answers.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary)" }}>
                    {["Operation", "Cost", "Watch out"].map(h => (
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
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>💬 Things to say out loud in the interview</div>
            {COMPLEXITY_NOTES.map((n, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>• {n}</div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB: GOOGLE PREP ══ */}
      {loop("google") && (
        <div>
          <SectionHead sub="Compiled from 250+ candidate reports for SWE III / L4 loops (2024–2026). Everything below is Google-specific.">🎯 Google interview prep</SectionHead>

          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {[["format", "📋 Format & Rubric"], ["style", "🎭 How Google asks"], ["problems", "📝 Most-asked problems"], ["ml", "🤖 AI/ML domain round"]].map(([id, label]) => (
              <button key={id} onClick={() => setGoogleSub(id)} style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)",
                border: `1.5px solid ${googleSub === id ? GOOGLE_BLUE : "var(--color-border-secondary)"}`,
                background: googleSub === id ? "#E8F0FE" : "var(--color-background-secondary)",
                color: googleSub === id ? GOOGLE_BLUE : "var(--color-text-secondary)",
                fontWeight: googleSub === id ? 600 : 400,
              }}>{label}</button>
            ))}
          </div>

          {googleSub === "format" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>{GOOGLE_FORMAT.headline}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
                {GOOGLE_FORMAT.rounds.map((r, i) => (
                  <div key={i} style={{ padding: "1rem 1.1rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>{r.icon} {r.name}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{r.detail}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "1rem 1.25rem", background: "#FFF8E1", borderRadius: 10, borderLeft: "3px solid #F9A825", marginBottom: "2rem" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#B28704", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Know before you go</div>
                {GOOGLE_FORMAT.facts.map((f, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.8 }}>• {f}</div>
                ))}
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>📊 What Google actually asks (topic frequency)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "2rem" }}>
                {GOOGLE_TOPIC_FREQ.map((t, i) => (
                  <div key={i} style={{ padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{t.topic}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GOOGLE_BLUE, whiteSpace: "nowrap" }}>{t.pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--color-border-tertiary)", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", width: `${(t.pct / 35) * 100}%`, background: GOOGLE_BLUE, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: 6 }}>{t.note}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {t.algoIds.map(id => {
                        const a = ALGOS.find(x => x.id === id);
                        return a ? (
                          <button key={id} onClick={() => openLearn(id)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: a.bg, color: a.color, border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                            {a.emoji} {a.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>🧾 The 4-axis evaluation rubric</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: "2rem" }}>
                {GOOGLE_RUBRIC.map((r, i) => (
                  <div key={i} style={{ padding: "1rem 1.1rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{r.axis}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: GOOGLE_BLUE }}>{r.weight}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{r.what}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-primary)", lineHeight: 1.6, padding: "8px 10px", background: "#E8F0FE", borderRadius: 6 }}>💡 {r.tell}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>⏱️ The 45-minute protocol</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {GOOGLE_PROTOCOL.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 130, padding: "8px 10px", background: "#E8F0FE", color: GOOGLE_BLUE, borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: "center" }}>{p.phase}</div>
                    <div style={{ flex: 1, padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>
                      {p.items.map((it, j) => (
                        <div key={j} style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>• {it}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {googleSub === "style" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {GOOGLE_STYLE.map((s, i) => (
                <div key={i} style={{ padding: "1.1rem 1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>{s.icon} {s.title}</div>
                  <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{s.body}</div>
                </div>
              ))}
            </div>
          )}

          {googleSub === "problems" && (
            <div>
              <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
                The most-reported Google problems, tagged by pattern. Click a pattern chip to open its Learn card. Don't memorize solutions — memorize which pattern each one is.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background-secondary)" }}>
                      {["Problem", "LC#", "Difficulty", "Pattern", "Why it matters"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {GOOGLE_PROBLEMS.map((p, i) => {
                      const a = ALGOS.find(x => x.id === p.algoId);
                      return (
                        <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                          <td style={{ padding: "9px 12px", fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{p.name}</td>
                          <td style={{ padding: "9px 12px", fontFamily: "Consolas, monospace", fontSize: 12, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{p.lc || "—"}</td>
                          <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: diffColor(p.diff) }}>{p.diff}</span>
                          </td>
                          <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                            {a ? (
                              <button onClick={() => openLearn(a.id)} style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 100, background: a.bg, color: a.color, border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                                {a.emoji} {p.pattern}
                              </button>
                            ) : p.pattern}
                          </td>
                          <td style={{ padding: "9px 12px", color: "var(--color-text-secondary)", fontSize: 12.5, lineHeight: 1.5 }}>{p.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {googleSub === "ml" && (
            <div>
              <div style={{ padding: "1rem 1.25rem", background: "#E8F0FE", borderRadius: 10, border: "0.5px solid #C6DAFC", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.7 }}>{ML_DOMAIN.intro}</div>
              </div>
              {ML_DOMAIN.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${GOOGLE_BLUE}` }}>{sec.icon} {sec.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{ padding: "12px 16px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: GOOGLE_BLUE, marginBottom: 5 }}>{item.q}</div>
                        <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>{item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: AI/ML DOMAIN ══ */}
      {track === "ml" && <MLSection tab={mlTab} setTab={setMlTab} />}

      {/* ══ TAB: SYSTEM DESIGN ══ */}
      {track === "sd" && <SDSection tab={sdTab} setTab={setSdTab} />}

      {/* ══ TRACK: INTERACTIVE LABS ══ */}
      {track === "labs" && <LabsSection tab={labsTab} setTab={setLabsTab} />}

      {/* ══ TAB: 7-DAY PLAN ══ */}
      {loop("plan") && (
        <div>
          <SectionHead sub="One week to the Google loop: 2 DSA rounds + 1 AI/ML round. Daily shape: ~1h concepts here, ~3h problems, 30 min evening recall. Checkboxes save automatically.">🗓️ Your 7-day crash plan</SectionHead>

          <div style={{ padding: "1rem 1.25rem", background: "#FFF8E1", borderRadius: 10, borderLeft: "3px solid #F9A825", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#B28704", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rules of the week</div>
            {PLAN_RULES.map((r, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.8 }}>• {r}</div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PLAN.map(day => {
              const done = day.problems.filter((_, i) => planChecks[`${day.day}-${i}`]).length;
              return (
                <div key={day.day} style={{ borderRadius: 12, border: `1.5px solid ${day.color}33`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", background: day.bg, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: day.color }}>Day {day.day} — {day.title}</span>
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 10 }}>{day.freq}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: day.color }}>{done}/{day.problems.length} done</span>
                  </div>
                  <div style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {day.focus.map((f, i) => {
                        const a = ALGOS.find(x => x.label === f || x.fullName === f);
                        return (
                          <button key={i} onClick={() => a && openLearn(a.id)} style={{
                            fontSize: 11.5, padding: "3px 10px", borderRadius: 100, fontWeight: 600, fontFamily: "var(--font-sans)",
                            background: a ? a.bg : "var(--color-background-secondary)", color: a ? a.color : "var(--color-text-secondary)",
                            border: "none", cursor: a ? "pointer" : "default",
                          }}>{f}</button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 12 }}>{day.concepts}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {day.problems.map((p, i) => {
                        const key = `${day.day}-${i}`;
                        const checked = !!planChecks[key];
                        return (
                          <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: checked ? "var(--color-background-secondary)" : "transparent" }}>
                            <input type="checkbox" checked={checked} onChange={() => togglePlanCheck(key)} style={{ marginTop: 3, accentColor: day.color, cursor: "pointer" }} />
                            <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-text-primary)", textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.6 : 1 }}>
                              <strong>{p.name}</strong>
                              {p.lc ? <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}> · LC {p.lc}</span> : null}
                              {p.diff && p.diff !== "—" ? <span style={{ color: diffColor(p.diff), fontSize: 12, fontWeight: 700 }}> · {p.diff}</span> : null}
                              <span style={{ color: "var(--color-text-secondary)" }}> — {p.why}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                      🌙 <strong style={{ color: "var(--color-text-primary)" }}>Evening:</strong> {day.evening}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ NEXT-UP FOOTER (DSA / Interview Loop) ══ */}
      {(track === "dsa" || track === "loop") && (
        <PathFooter
          stages={track === "dsa" ? DSA_STAGES : LOOP_STAGES}
          tab={track === "dsa" ? dsaTab : loopTab}
          setTab={track === "dsa" ? setDsaTab : setLoopTab}
          accent={activeTrack.accent}
        />
      )}
    </div>
  );
}
