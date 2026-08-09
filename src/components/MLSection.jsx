import { useState } from "react";
import {
  C, Card, H, Body, Sub, Table, Code, Callout, Collapse,
  DartboardGrid, BiasVarianceExplorer, ComplexityCurve, DoubleDescentCurve,
  MetricsLab, LearningRateViz, ActivationPlots, ConvCalculator,
  AttentionWalkthrough, RAGPipeline, LSTMDiagram, Flashcard, DiffPill,
} from "./MLWidgets.jsx";

import { ROUND_SHAPE, RUBRIC, ANSWER_SHAPES, RED_GREEN, RED_GREEN_PATTERN, DESIGN_FRAMEWORK, PROJECT_DEFENSE, QUESTIONS_TO_ASK, EXECUTION } from "../data/ml/playbook.js";
import { CORE_TOPICS, FORMULA_SHEET, ALGO_ONELINERS, WHY_THIS_NOT_THAT } from "../data/ml/coreTopics.js";
import { TERMINOLOGY_TRAP, GLOSSARY, MATH, GRADIENT_DESCENT, LOSSES, SPLITS, REGULARIZATION, OPTIMIZERS, NORMALIZATION, FEATURES, DEBUG_TABLE, WHEN_NOT_ML } from "../data/ml/foundations.js";
import { METRICS_INTRO, CONFUSION_MATRIX, RATES, SWEEP_DATA, ROC, ROC_VS_PR, PRECISION_RECALL, OTHER_METRICS, METRIC_DECISION, METRIC_FOLLOWUP } from "../data/ml/metrics.js";
import { ALGO_ZOO, BAGGING_VS_BOOSTING, ALGO_SELECTOR, SIMPLE_VS_COMPLEX, CLASSICAL_VS_DEEP, GENERATIVE_VS_DISCRIMINATIVE, PARAMETRIC_VS_NON } from "../data/ml/algorithms.js";
import { NEURON, ACTIVATIONS, BACKPROP, TRANSFORMER, NLP, GENERATIVE_FAMILIES } from "../data/ml/deep.js";
import { PICKING_ADVICE, SPECIALIZATIONS } from "../data/ml/specializations.js";
import { BANK_ADVICE, SECTIONS, QUESTIONS, DEPTH_PROBES } from "../data/ml/questions.js";
import { CODE_INTRO, ML_SNIPPETS, ML_CODE_CATEGORIES, ALSO_DRILL } from "../data/ml/code.js";
import { PLAN_RULE, ALLOCATION, DAYS, COMPRESSED, SELF_TEST, SELF_TEST_TARGET, LAST_DAYS, THREE_THINGS } from "../data/ml/plan.js";
import { ML_STAGES } from "../data/paths.js";
import { StageNav, PathFooter } from "./PathNav.jsx";

const BLUE = "#1A73E8";

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px", color: C.text }}>{children}</h3>
      {sub && <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>{sub}</div>}
    </div>
  );
}

export default function MLSection({ tab, setTab }) {
  const [activeTopic, setActiveTopic] = useState("supervised");
  const [activeSpec, setActiveSpec] = useState("genai");
  const [activeCode, setActiveCode] = useState("softmax");
  const [bankSection, setBankSection] = useState("All");
  const [bankDiff, setBankDiff] = useState("All");
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ml-selftest")) || {}; } catch { return {}; }
  });

  function toggle(key) {
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    try { localStorage.setItem("ml-selftest", JSON.stringify(next)); } catch { /* private mode */ }
  }

  const topic = CORE_TOPICS.find((t) => t.id === activeTopic);
  const spec = SPECIALIZATIONS.find((s) => s.id === activeSpec);
  const snippet = ML_SNIPPETS.find((s) => s.id === activeCode);

  const filtered = QUESTIONS.filter(
    (q) => (bankSection === "All" || q.s === bankSection) && (bankDiff === "All" || q.d === bankDiff)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px", color: C.text }}>
          🤖 AI/ML Domain Round
        </h2>
        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>
          A 45-minute conversation built to find the edge of your knowledge. Covers the exact topics named for the round —
          supervised/unsupervised, bias-variance, overfitting, linear &amp; logistic regression, decision trees, SVMs, CNNs, RNNs —
          plus the specialization tracks, the question bank, and the coding asks.
        </p>
      </div>

      {/* Reading path */}
      <StageNav stages={ML_STAGES} tab={tab} setTab={setTab} accent={BLUE} />

      {/* ══ PLAYBOOK ══ */}
      {tab === "playbook" && (
        <div>
          <SectionTitle sub={ROUND_SHAPE.blurb}>{ROUND_SHAPE.headline}</SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
            {ROUND_SHAPE.timeline.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  minWidth: 92, padding: "7px 9px", background: "#E8F0FE", color: BLUE,
                  borderRadius: 7, fontSize: 11.5, fontWeight: 700, textAlign: "center",
                }}>{t.span}</div>
                <div style={{ flex: 1, padding: "9px 13px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.label}</div>
                  <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, marginTop: 2 }}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <H>Where the 45 minutes goes</H>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
            {ROUND_SHAPE.split.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: BLUE }}>{s.pct}%</span>
                </div>
                <div style={{ height: 7, background: C.border, borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: BLUE, borderRadius: 100 }} />
                </div>
                <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3 }}>{s.note}</div>
              </div>
            ))}
          </div>

          <Callout tone="warn" title="The trap for applied/product backgrounds">{ROUND_SHAPE.warning}</Callout>

          <H mt={20}>What's being scored</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
            {RUBRIC.map((r, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.axis}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{r.weight}</span>
                </div>
                <Sub size={12.5}>{r.what}</Sub>
                <div style={{ marginTop: 7, padding: "7px 10px", background: "#E8F0FE", borderRadius: 6, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                  💡 {r.tell}
                </div>
              </Card>
            ))}
          </div>

          <H mt={20}>The answer shapes that score</H>
          {ANSWER_SHAPES.map((a, i) => (
            <Collapse key={i} title={a.name} color={BLUE} defaultOpen={i === 0}>
              <div style={{
                padding: "10px 13px", background: "#1e1e2e", borderRadius: 8, color: "#cdd6f4",
                fontFamily: "Consolas, monospace", fontSize: 12.5, lineHeight: 1.6, marginBottom: 9,
              }}>{a.template}</div>
              <Sub>{a.why}</Sub>
              <div style={{ marginTop: 8 }}><Callout tone="good" title="Example">{a.example}</Callout></div>
            </Collapse>
          ))}

          <H mt={20}>Red flag vs green flag — same knowledge, two deliveries</H>
          <Table color="#CC2A2A" headers={["They ask", "🚩 Red flag", "✅ Green flag"]} rows={RED_GREEN.map((r) => [r.q, r.red, r.green])} />
          <Callout tone="good">{RED_GREEN_PATTERN}</Callout>

          <H mt={20}>ML system design framework</H>
          <Sub>Use this for every open-ended "how would you build X" question. Talk through it out loud, and always start with clarifying questions.</Sub>
          <div style={{ marginTop: 10 }}>
            {DESIGN_FRAMEWORK.map((s, i) => (
              <Collapse key={i} title={`${s.step}${s.time ? ` · ${s.time}` : ""}`} color="#0F7A5A">
                {s.points.map((p, j) => (
                  <div key={j} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {p}</div>
                ))}
              </Collapse>
            ))}
          </div>

          <H mt={20}>Defending your projects</H>
          <Sub>{PROJECT_DEFENSE.intro}</Sub>
          <div style={{ marginTop: 10 }}><Callout tone="warn" title="The rule">{PROJECT_DEFENSE.rule}</Callout></div>
          <div style={{ marginTop: 10 }}>
            {PROJECT_DEFENSE.archetypes.map((a, i) => (
              <Collapse key={i} title={a.name} color="#6A1B9A">
                {a.probes.map((p, j) => (
                  <div key={j} style={{ marginBottom: 11 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#6A1B9A", marginBottom: 4 }}>{p.q}</div>
                    <Sub size={12.5}>{p.a}</Sub>
                  </div>
                ))}
              </Collapse>
            ))}
          </div>
          <Callout tone="info" title="Three pocket stories to have ready">
            {PROJECT_DEFENSE.pocketStories.map((s, i) => `${i + 1}. ${s}`).join("\n")}
          </Callout>

          <H mt={20}>Execution: do and don't</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            <Card accent="#0F7A5A">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F7A5A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Do</div>
              {EXECUTION.do.map((d, i) => <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7 }}>• {d}</div>)}
            </Card>
            <Card accent="#CC2A2A">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#CC2A2A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Don't</div>
              {EXECUTION.dont.map((d, i) => <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7 }}>• {d}</div>)}
            </Card>
          </div>

          <H mt={20}>Questions to ask them — this is scored</H>
          {QUESTIONS_TO_ASK.map((q, i) => (
            <Card key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.6 }}>"{q.q}"</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>→ {q.why}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ CORE 10 ══ */}
      {tab === "core" && (
        <div>
          <SectionTitle sub="The exact topics named for this round. Each one: intuition → mechanics and math → code → when/why/vs → questions laddered easy to hard.">
            The 10 core topics
          </SectionTitle>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {CORE_TOPICS.map((t) => (
              <button key={t.id} onClick={() => setActiveTopic(t.id)} style={{
                padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                fontFamily: "var(--font-sans)", fontWeight: activeTopic === t.id ? 600 : 400,
                border: `1.5px solid ${activeTopic === t.id ? t.color : C.border2}`,
                background: activeTopic === t.id ? t.bg : "transparent",
                color: activeTopic === t.id ? t.color : C.sub,
              }}>{t.emoji} {t.n}. {t.title.split("(")[0].trim()}</button>
            ))}
          </div>

          {topic && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 14 }}>
                <span style={{ fontSize: 34 }}>{topic.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>{topic.title}</h3>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: topic.bg, color: topic.color }}>
                      {topic.group}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: topic.color, fontWeight: 600, marginTop: 3 }}>{topic.oneLiner}</div>
                </div>
              </div>

              {topic.flag && <Callout tone="warn" title="Note">{topic.flag}</Callout>}

              <H color={topic.color} mt={14}>Intuition</H>
              <Body>{topic.intuition}</Body>

              {topic.prereq && (
                <div style={{ marginTop: 12 }}>
                  <Collapse title={topic.prereq.h} color={topic.color}>
                    <Body>{topic.prereq.body}</Body>
                  </Collapse>
                </div>
              )}

              <H color={topic.color} mt={20}>Mechanics &amp; math</H>
              {topic.mechanics.map((m, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 5 }}>{m.h}</div>
                  <div style={{
                    fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: "pre-line",
                    fontFamily: /[=∂ΣσΠ⊙←→]/.test(m.body) ? "'Fira Code', Consolas, monospace" : "inherit",
                  }}>{m.body}</div>
                </div>
              ))}

              {/* Topic-specific interactive widgets */}
              {topic.id === "biasvariance" && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>The dartboard</H>
                  <DartboardGrid />
                  <H color={topic.color} mt={20}>Watch the tradeoff happen — drag the polynomial degree</H>
                  <BiasVarianceExplorer />
                  <H color={topic.color} mt={20}>The curve</H>
                  <ComplexityCurve />
                </div>
              )}
              {topic.id === "cnn" && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>Conv shape &amp; parameter calculator</H>
                  <ConvCalculator />
                </div>
              )}
              {topic.id === "rnn" && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>The LSTM cell — why the additive path survives</H>
                  <LSTMDiagram />
                </div>
              )}

              {topic.code && (
                <>
                  <H color={topic.color} mt={20}>Code</H>
                  <Code>{topic.code}</Code>
                  {topic.codeNote && <Callout tone="info">{topic.codeNote}</Callout>}
                </>
              )}

              {topic.whyNotMSE && (
                <div style={{ marginTop: 18 }}>
                  <Callout tone="warn" title={topic.whyNotMSE.h}>
                    {topic.whyNotMSE.points.map((p, i) => `${i + 1}. ${p}`).join("\n\n")}
                  </Callout>
                </div>
              )}

              {topic.diagnosisTable && (
                <>
                  <H color={topic.color} mt={20}>Diagnosis in practice</H>
                  <Table color={topic.color} headers={topic.diagnosisTable.headers} rows={topic.diagnosisTable.rows} />
                </>
              )}

              {topic.toolbox && (
                <>
                  <H color={topic.color} mt={20}>The full toolbox</H>
                  <Table color={topic.color} headers={topic.toolbox.headers} rows={topic.toolbox.rows} />
                </>
              )}

              {topic.l1l2 && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>{topic.l1l2.h}</H>
                  <Code label="the penalties">{topic.l1l2.formula}</Code>
                  <Body>{topic.l1l2.why}</Body>
                  <Table color={topic.color} headers={topic.l1l2.table.headers} rows={topic.l1l2.table.rows} />
                  <Callout tone="warn" title="Gotcha">{topic.l1l2.gotcha}</Callout>
                </div>
              )}

              {topic.extra && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>{topic.extra.h}</H>
                  <Body>{topic.extra.body}</Body>
                  {topic.extra.code && <Code>{topic.extra.code}</Code>}
                </div>
              )}

              {topic.doubleDescent && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>{topic.doubleDescent.h}</H>
                  <Body>{topic.doubleDescent.body}</Body>
                  <div style={{ margin: "12px 0" }}><DoubleDescentCurve /></div>
                  <Callout tone="good" title="Say this">{topic.doubleDescent.say}</Callout>
                </div>
              )}

              {topic.resnet && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>{topic.resnet.h}</H>
                  <Body>{topic.resnet.body}</Body>
                </div>
              )}

              {topic.architectures && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>Architectures worth naming</H>
                  <Table color={topic.color} compact headers={["Architecture", "Why it matters"]} rows={topic.architectures.map((a) => [a.name, a.note])} />
                </div>
              )}

              {topic.visionTasks && (
                <div style={{ marginTop: 18 }}>
                  <H color={topic.color}>{topic.visionTasks.h}</H>
                  <Body>{topic.visionTasks.body}</Body>
                </div>
              )}

              {topic.compare && (
                <div style={{ marginTop: 18 }}>
                  <Table color={topic.color} headers={topic.compare.headers} rows={topic.compare.rows} />
                </div>
              )}

              {topic.whenWhy && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                    <Card accent="#0F7A5A">
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0F7A5A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Use when</div>
                      <Sub size={12.5}>{topic.whenWhy.use}</Sub>
                    </Card>
                    <Card accent="#CC2A2A">
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#CC2A2A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Don't use when</div>
                      <Sub size={12.5}>{topic.whenWhy.dont}</Sub>
                    </Card>
                  </div>
                  {topic.whenWhy.vs && <div style={{ marginTop: 10 }}><Callout tone="info" title="Versus">{topic.whenWhy.vs}</Callout></div>}
                </div>
              )}

              {topic.keyInsight && <div style={{ marginTop: 14 }}><Callout tone="good" title="Key insight">{topic.keyInsight}</Callout></div>}

              <H color={topic.color} mt={22}>Questions — easy to hard</H>
              {topic.questions.map((q, i) => (
                <Flashcard key={i} q={q.q} a={q.a} meta={<DiffPill d={q.level} />} />
              ))}

              <div style={{ marginTop: 14 }}>
                <Callout tone="warn" title="🗣️ Say this out loud, without notes">{topic.sayOutLoud}</Callout>
              </div>
            </div>
          )}

          <H mt={26}>The formulas to have memorized</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
            {FORMULA_SHEET.map((f, i) => (
              <div key={i} style={{ padding: "9px 12px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.name}</div>
                <div style={{ fontFamily: "'Fira Code', Consolas, monospace", fontSize: 13, color: BLUE, fontWeight: 600, marginTop: 2 }}>{f.f}</div>
              </div>
            ))}
          </div>

          <H mt={22}>Algorithm one-liners</H>
          <Table headers={ALGO_ONELINERS.headers} rows={ALGO_ONELINERS.rows} />

          <H mt={22}>"Why this, not that"</H>
          {WHY_THIS_NOT_THAT.map((w, i) => (
            <Card key={i} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: BLUE }}>{w.pair}</div>
              <Sub size={12.5}>{w.answer}</Sub>
            </Card>
          ))}
        </div>
      )}

      {/* ══ FOUNDATIONS ══ */}
      {tab === "foundations" && (
        <div>
          <SectionTitle sub="The vocabulary, the math, and the machinery underneath every other answer.">Foundations</SectionTitle>

          <Collapse title="⚠️ The terminology trap — read this first" color="#CC2A2A" defaultOpen>
            <Sub>{TERMINOLOGY_TRAP.intro}</Sub>
            <Table color="#CC2A2A" compact headers={TERMINOLOGY_TRAP.headers} rows={TERMINOLOGY_TRAP.rows} />
            <Callout tone="bad">{TERMINOLOGY_TRAP.keyLine}</Callout>
          </Collapse>

          <Collapse title="📐 The math you actually need" color="#6A1B9A">
            {MATH.map((m, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 5 }}>{m.h}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: "pre-line", fontFamily: /[=∂Σ∇σ·]/.test(m.body) ? "'Fira Code', Consolas, monospace" : "inherit" }}>{m.body}</div>
                {m.table && <Table color="#6A1B9A" compact headers={m.table.headers} rows={m.table.rows} />}
              </div>
            ))}
          </Collapse>

          <Collapse title="⛰️ Gradient descent & the learning rate" color="#0F7A5A" defaultOpen>
            <Body>{GRADIENT_DESCENT.analogy}</Body>
            <H mt={14} size={13.5}>The loop</H>
            {GRADIENT_DESCENT.loop.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 5 }}>
                <div style={{ width: 21, height: 21, borderRadius: "50%", background: "#E2F5EF", color: "#0F7A5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, fontFamily: l.includes("_") ? "Consolas, monospace" : "inherit" }}>{l}</div>
              </div>
            ))}
            <Callout tone="good">{GRADIENT_DESCENT.keyLine}</Callout>
            <Code>{GRADIENT_DESCENT.code}</Code>

            <H mt={16} size={13.5}>What the learning rate actually does — watch it break</H>
            <LearningRateViz />
            <Code>{GRADIENT_DESCENT.lrDemo}</Code>
            <Table color="#0F7A5A" headers={GRADIENT_DESCENT.diagnosis.headers} rows={GRADIENT_DESCENT.diagnosis.rows} />
            <Callout tone="warn" title="The answer they want">{GRADIENT_DESCENT.theAnswer}</Callout>

            <H mt={16} size={13.5}>Batch, epoch, iteration</H>
            <Table color="#0F7A5A" compact headers={GRADIENT_DESCENT.batchWords.headers} rows={GRADIENT_DESCENT.batchWords.rows} />
            <Table color="#0F7A5A" compact headers={GRADIENT_DESCENT.batchVariants.headers} rows={GRADIENT_DESCENT.batchVariants.rows} />
            <Callout tone="info" title="Batch size and learning rate">{GRADIENT_DESCENT.batchSizeLR}</Callout>
          </Collapse>

          <Collapse title="📉 Loss functions" color="#B84A00">
            <Table color="#B84A00" headers={LOSSES.headers} rows={LOSSES.rows} />
            <Callout tone="warn" title="Top-5 most-asked">{LOSSES.crossEntropyNote}</Callout>
          </Collapse>

          <Collapse title="✂️ Splits, cross-validation & data leakage" color="#1A6BCC">
            <Table color="#1A6BCC" headers={SPLITS.purpose.headers} rows={SPLITS.purpose.rows} />
            <Callout tone="info" title="Why three splits, not two">{SPLITS.whyThree}</Callout>
            <Code>{SPLITS.code}</Code>

            <H mt={16} size={13.5}>{SPLITS.cv.h}</H>
            <Body>{SPLITS.cv.body}</Body>
            <Code>{SPLITS.cv.code}</Code>
            <Callout tone="good">{SPLITS.cv.stdNote}</Callout>
            <Table color="#1A6BCC" headers={SPLITS.cv.variants.headers} rows={SPLITS.cv.variants.rows} />

            <H mt={16} size={13.5}>{SPLITS.leakage.h}</H>
            <Body>{SPLITS.leakage.body}</Body>
            {SPLITS.leakage.four.map((l, i) => (
              <Card key={i} accent="#CC2A2A" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#CC2A2A" }}>{i + 1}. {l.name}</div>
                <Sub size={12.5}>{l.detail}</Sub>
                <div style={{ fontSize: 12.5, color: "#0F7A5A", marginTop: 4 }}>✅ {l.fix}</div>
              </Card>
            ))}
            <Code>{SPLITS.leakage.code}</Code>
            <Callout tone="good">{SPLITS.leakage.say}</Callout>
          </Collapse>

          <Collapse title="🛡️ Regularization" color="#6A1B9A">
            <Callout tone="info">{REGULARIZATION.definition}</Callout>
            <Code label="the penalties">{REGULARIZATION.formulas}</Code>
            <Code>{REGULARIZATION.code}</Code>
            <Callout tone="warn">{REGULARIZATION.codeNote}</Callout>

            <H mt={16} size={13.5}>{REGULARIZATION.dropout.h}</H>
            <Body>{REGULARIZATION.dropout.body}</Body>
            <Code>{REGULARIZATION.dropout.code}</Code>

            <H mt={16} size={13.5}>{REGULARIZATION.earlyStopping.h}</H>
            <Code>{REGULARIZATION.earlyStopping.code}</Code>
            <Sub>{REGULARIZATION.earlyStopping.note}</Sub>

            <H mt={16} size={13.5}>The full toolbox</H>
            <Table color="#6A1B9A" headers={REGULARIZATION.toolbox.headers} rows={REGULARIZATION.toolbox.rows} />
            <Callout tone="bad" title="The thing to internalize">{REGULARIZATION.keyLine}</Callout>
            <Callout tone="warn" title="Augmentation is not free">{REGULARIZATION.augWarning}</Callout>
          </Collapse>

          <Collapse title="⚙️ Optimizers" color="#B84A00">
            <Code>{OPTIMIZERS.code}</Code>
            <Table color="#B84A00" headers={OPTIMIZERS.table.headers} rows={OPTIMIZERS.table.rows} />
            <Code label="adam">{OPTIMIZERS.adam}</Code>
            <Callout tone="info" title="Decoupled weight decay">{OPTIMIZERS.adamW}</Callout>
            <Callout tone="good" title="Default answer">{OPTIMIZERS.defaultAnswer}</Callout>
            <Sub>{OPTIMIZERS.schedules}</Sub>
          </Collapse>

          <Collapse title="📏 Normalization & feature scaling" color="#00838F">
            <H size={13.5}>{NORMALIZATION.layers.h}</H>
            <Body>{NORMALIZATION.layers.body}</Body>
            <H mt={16} size={13.5}>{NORMALIZATION.scaling.h}</H>
            <Table color="#00838F" headers={NORMALIZATION.scaling.headers} rows={NORMALIZATION.scaling.rows} />
            <Callout tone="good">{NORMALIZATION.scaling.say}</Callout>
            <Sub>{NORMALIZATION.scaling.normVsStd}</Sub>
          </Collapse>

          <Collapse title="🔧 Feature engineering & preprocessing" color="#827717">
            {FEATURES.map((f, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{f.h}</div>
                <Sub>{f.body}</Sub>
              </div>
            ))}
          </Collapse>

          <Collapse title="🔍 Fixing a broken model — the master diagnostic" color="#CC2A2A" defaultOpen>
            <Table color="#CC2A2A" headers={DEBUG_TABLE.headers} rows={DEBUG_TABLE.rows} />
            <Callout tone="warn" title="Great offline, bad in production — check in this order">{DEBUG_TABLE.productionOrder}</Callout>
            <Callout tone="info" title="Data drift vs concept drift">{DEBUG_TABLE.drift}</Callout>
            <Callout tone="bad" title="Silent degradation">{DEBUG_TABLE.silentFailure}</Callout>
          </Collapse>

          <Collapse title="🚫 When NOT to use ML" color="#37474F">
            <Sub>{WHEN_NOT_ML.why}</Sub>
            <div style={{ marginTop: 8 }}><Body>{WHEN_NOT_ML.body}</Body></div>
          </Collapse>

          <Collapse title="📖 Glossary" color="#37474F">
            {GLOSSARY.map((g, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{g.group}</div>
                {g.items.map(([term, def], j) => (
                  <div key={j} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.75, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: C.text, minWidth: 150 }}>{term}</span>
                    <span style={{ color: C.sub, flex: 1 }}>{def}</span>
                  </div>
                ))}
              </div>
            ))}
          </Collapse>
        </div>
      )}

      {/* ══ METRICS LAB ══ */}
      {tab === "metrics" && (
        <div>
          <SectionTitle sub="Build these in order. Do not skip to ROC — it only makes sense once you know that a classifier outputs a score and you choose the threshold.">
            Metrics, built from zero
          </SectionTitle>

          <Callout tone="warn" title={METRICS_INTRO.h}>{METRICS_INTRO.body}</Callout>

          <H mt={20}>{CONFUSION_MATRIX.h}</H>
          <Code label="the four outcomes">{CONFUSION_MATRIX.diagram}</Code>
          <Callout tone="info" title="How to read the names">{CONFUSION_MATRIX.mnemonic}</Callout>
          <Code>{CONFUSION_MATRIX.code}</Code>

          <H mt={20}>{RATES.h}</H>
          <Sub>{RATES.intro}</Sub>
          <Table color="#00838F" headers={RATES.headers} rows={RATES.rows} />
          <Callout tone="warn" title="The critical structural point">{RATES.critical}</Callout>
          <Callout tone="info">{RATES.recallIsTPR}</Callout>

          <H mt={22}>🔬 Interactive: threshold → confusion matrix → ROC</H>
          <MetricsLab />

          <H mt={22}>The threshold sweep, tabulated</H>
          <Table color="#1A73E8" compact headers={SWEEP_DATA.table.headers} rows={SWEEP_DATA.table.rows.map((r) => r.map(String))} />
          <Callout tone="good" title="Read down the table">{SWEEP_DATA.reading}</Callout>
          <Code>{SWEEP_DATA.code}</Code>

          <H mt={22}>{ROC.h}</H>
          <Body>{ROC.body}</Body>
          <div style={{ margin: "10px 0" }}>
            {ROC.reading.map((r, i) => <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {r}</div>)}
          </div>
          <Code>{ROC.code}</Code>

          <H mt={18}>{ROC.auc.h}</H>
          <Body>{ROC.auc.body}</Body>
          <Callout tone="warn" title="What AUC is and isn't for">{ROC.auc.forAndAgainst}</Callout>

          <H mt={22}>{ROC_VS_PR.h}</H>
          <Sub>{ROC_VS_PR.setup}</Sub>
          <Code>{ROC_VS_PR.code}</Code>
          <Callout tone="bad" title="Stop and look at that">{ROC_VS_PR.punchline}</Callout>
          <Body>{ROC_VS_PR.mechanism}</Body>
          <Table color="#CC2A2A" headers={ROC_VS_PR.rule.headers} rows={ROC_VS_PR.rule.rows} />
          <Callout tone="good" title="The interview answer, in one breath">{ROC_VS_PR.theAnswer}</Callout>

          <H mt={22}>{PRECISION_RECALL.h}</H>
          <Code label="the formulas">{PRECISION_RECALL.formulas}</Code>
          <Callout tone="info">{PRECISION_RECALL.keepStraight}</Callout>
          <Sub>{PRECISION_RECALL.f1Note}</Sub>
          <div style={{ marginTop: 10 }}><Callout tone="bad" title="Why accuracy can be a lie">{PRECISION_RECALL.accuracyTrap}</Callout></div>
          <H mt={16} size={13.5}>Which do you optimize?</H>
          <Table color="#6A1B9A" headers={PRECISION_RECALL.whichToOptimize.headers} rows={PRECISION_RECALL.whichToOptimize.rows} />
          <Callout tone="good" title="Memorize verbatim">{PRECISION_RECALL.generalRule}</Callout>
          <Sub>{PRECISION_RECALL.tradeoff}</Sub>
          <div style={{ marginTop: 10 }}><Callout tone="warn" title="Why not just optimize F1?">{PRECISION_RECALL.notJustF1}</Callout></div>
          <Code>{PRECISION_RECALL.thresholdCode}</Code>
          <Callout tone="good">{PRECISION_RECALL.productionNote}</Callout>

          <H mt={22}>{OTHER_METRICS.h}</H>
          {OTHER_METRICS.groups.map((g, i) => (
            <Card key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>{g.name}</div>
              <Sub size={12.5}>{g.body}</Sub>
            </Card>
          ))}

          <H mt={22}>Which metric — the decision table</H>
          <Table headers={METRIC_DECISION.headers} rows={METRIC_DECISION.rows} />
          <Callout tone="warn" title="The follow-up you must nail">{METRIC_FOLLOWUP}</Callout>
        </div>
      )}

      {/* ══ BIAS-VARIANCE LAB ══ */}
      {tab === "biasvar" && (() => {
        const bv = CORE_TOPICS.find((t) => t.id === "biasvariance");
        return (
          <div>
            <SectionTitle sub="The most-asked fundamentals question in any ML interview. Learn it cold — it answers three or four separate questions.">
              Bias–Variance Lab
            </SectionTitle>

            <Callout tone="bad" title="Kill the confusion first">
              {"\"Bias\" here does NOT mean the b in y = wx + b, and it does not mean prejudice toward the data. It means ERROR FROM AN OVERSIMPLIFIED ASSUMPTION.\n\nThe substitution to make: bias = PREJUDICED (too rigid, committed to a wrong belief). Variance = SUGGESTIBLE (too flexible, bends to whatever it sees, including the noise)."}
            </Callout>

            <H mt={20}>The dartboard — the picture that makes it precise</H>
            <Sub>{"Imagine training your model 200 times, each on a different random sample. Pick ONE test point and look at all 200 predictions.\n\nBIAS = how far the AVERAGE of the 200 is from the truth. VARIANCE = how SPREAD OUT they are from each other."}</Sub>
            <DartboardGrid />

            <H mt={22}>Watch it happen — drag the polynomial degree</H>
            <BiasVarianceExplorer />

            <H mt={22}>The curve</H>
            <ComplexityCurve />
            <Callout tone="info">
              Increasing complexity LOWERS bias and RAISES variance. You cannot minimize both — the best model minimizes the SUM, which sits in the middle. And because the two problems have OPPOSITE fixes, diagnosing wrong makes things worse: regularizing an underfit model, or growing an overfit one, both backfire.
            </Callout>

            <H mt={22}>The decomposition</H>
            <Code label="for squared error">{"E[(y − f̂(x))²]  =  Bias[f̂(x)]²  +  Var[f̂(x)]  +  σ²\n                     underfit        overfit      noise floor\n\nwhere Bias[f̂(x)] = E[f̂(x)] − f(x)"}</Code>
            <Body>{"Bias² — you're wrong on average. Fix: a more flexible model.\nVariance — you're inconsistent. Fix: more data, or more constraint.\nIrreducible noise — randomness in the world. Cannot be fixed by anything, ever. If two identical houses sold for different prices, no model can predict both."}</Body>

            <H mt={22}>Diagnosis in practice</H>
            <Table color="#C62828" headers={bv.diagnosisTable.headers} rows={bv.diagnosisTable.rows} />
            <Callout tone="good" title="Two signals to internalize">{bv.keyInsight}</Callout>

            <H mt={22}>{bv.extra.h}</H>
            <Body>{bv.extra.body}</Body>
            <Code>{bv.extra.code}</Code>

            <H mt={22}>{bv.doubleDescent.h}</H>
            <Body>{bv.doubleDescent.body}</Body>
            <div style={{ margin: "12px 0" }}><DoubleDescentCurve /></div>
            <Callout tone="good" title="Say this if asked whether deep learning breaks the tradeoff">{bv.doubleDescent.say}</Callout>

            <H mt={22}>Run it yourself</H>
            <Code>{bv.code}</Code>
            <Callout tone="info">{bv.codeNote}</Callout>

            <H mt={22}>Questions</H>
            {bv.questions.map((q, i) => <Flashcard key={i} q={q.q} a={q.a} meta={<DiffPill d={q.level} />} />)}
          </div>
        );
      })()}

      {/* ══ ALGORITHM ZOO ══ */}
      {tab === "zoo" && (
        <div>
          <SectionTitle sub="Everything beyond the four algorithms named explicitly. These come up as follow-ups — 'what else would you try?' — and in the ensembles question.">
            The algorithm zoo
          </SectionTitle>

          {ALGO_ZOO.map((a) => (
            <Collapse key={a.id} title={`${a.emoji} ${a.name}`} color={a.color}
              badge={<span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 100, background: a.bg, color: a.color, fontWeight: 600 }}>{a.family}</span>}>
              <div style={{ fontSize: 13, color: a.color, fontWeight: 600, marginBottom: 8 }}>{a.oneLiner}</div>
              {a.analogy && <Body>{a.analogy}</Body>}
              <div style={{ marginTop: 10 }}><Body>{a.how}</Body></div>
              {a.keyInsight && <div style={{ marginTop: 10 }}><Callout tone="good" title="Key insight">{a.keyInsight}</Callout></div>}
              {a.extras && <div style={{ marginTop: 10 }}><Sub>{a.extras}</Sub></div>}
              {a.compare && <Table color={a.color} headers={a.compare.headers} rows={a.compare.rows} />}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 9, marginTop: 12 }}>
                <Card accent="#0F7A5A"><div style={{ fontSize: 10.5, fontWeight: 700, color: "#0F7A5A", textTransform: "uppercase", marginBottom: 4 }}>Use when</div><Sub size={12.5}>{a.use}</Sub></Card>
                <Card accent="#CC2A2A"><div style={{ fontSize: 10.5, fontWeight: 700, color: "#CC2A2A", textTransform: "uppercase", marginBottom: 4 }}>Don't when</div><Sub size={12.5}>{a.dont}</Sub></Card>
              </div>
              {a.code && <Code>{a.code}</Code>}
              {a.codeNote && <Callout tone="info">{a.codeNote}</Callout>}
            </Collapse>
          ))}

          <H mt={22}>Bagging vs boosting — the table they want</H>
          <Table color="#B84A00" headers={BAGGING_VS_BOOSTING.headers} rows={BAGGING_VS_BOOSTING.rows} />
          <Sub>{BAGGING_VS_BOOSTING.stacking}</Sub>

          <H mt={22}>Which algorithm for which problem</H>
          <Table headers={ALGO_SELECTOR.headers} rows={ALGO_SELECTOR.rows} />

          <H mt={22}>Simple vs complex</H>
          <Table color="#0F7A5A" headers={SIMPLE_VS_COMPLEX.headers} rows={SIMPLE_VS_COMPLEX.rows} />
          <Callout tone="good" title="The senior instinct">{SIMPLE_VS_COMPLEX.instinct}</Callout>

          <H mt={22}>Classical ML vs deep learning</H>
          <Table color="#6A1B9A" headers={CLASSICAL_VS_DEEP.headers} rows={CLASSICAL_VS_DEEP.rows} />
          <Callout tone="warn" title="The question that follows">{CLASSICAL_VS_DEEP.theQuestion}</Callout>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginTop: 18 }}>
            <Card><div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>{GENERATIVE_VS_DISCRIMINATIVE.h}</div><Sub size={12.5}>{GENERATIVE_VS_DISCRIMINATIVE.body}</Sub></Card>
            <Card><div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>{PARAMETRIC_VS_NON.h}</div><Sub size={12.5}>{PARAMETRIC_VS_NON.body}</Sub></Card>
          </div>
        </div>
      )}

      {/* ══ DEEP LEARNING ══ */}
      {tab === "deep" && (
        <div>
          <SectionTitle sub="Neuron → network → backprop → the architecture that took over.">Deep learning</SectionTitle>

          <Collapse title="🔵 From a neuron to a network" color="#1565C0" defaultOpen>
            <Body>{NEURON.body}</Body>
            <div style={{ marginTop: 12 }}>
              <Callout tone="bad" title={NEURON.whyNonlinear.h}>{NEURON.whyNonlinear.body}</Callout>
            </div>
            <div style={{ marginTop: 12 }}><Callout tone="good" title="What the layers actually learn">{NEURON.whatLayersLearn}</Callout></div>
            <div style={{ marginTop: 10 }}><Sub>{NEURON.universalApprox}</Sub></div>
          </Collapse>

          <Collapse title="⚡ Activation functions" color="#0F7A5A" defaultOpen>
            <ActivationPlots />
            <Table color="#0F7A5A" headers={ACTIVATIONS.headers} rows={ACTIVATIONS.rows} />
            <Callout tone="warn" title="Dying ReLU">{ACTIVATIONS.dyingRelu}</Callout>
            <Callout tone="info">{ACTIVATIONS.whyRelu}</Callout>
          </Collapse>

          <Collapse title="🔄 Backpropagation, worked by hand" color="#6A1B9A">
            <Body>{BACKPROP.intuition}</Body>
            <H mt={14} size={13.5}>{BACKPROP.worked.h}</H>
            <Sub>{BACKPROP.worked.setup}</Sub>
            <Code label="forward">{BACKPROP.worked.forward}</Code>
            <Code label="backward">{BACKPROP.worked.backward}</Code>
            <Callout tone="good">{BACKPROP.worked.update}</Callout>
            <Callout tone="info" title="Say this">{BACKPROP.worked.say}</Callout>

            <H mt={16} size={13.5}>{BACKPROP.vanishing.h}</H>
            <Body>{BACKPROP.vanishing.body}</Body>
            <div style={{ marginTop: 8 }}>
              {BACKPROP.vanishing.fixes.map((f, i) => <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {f}</div>)}
            </div>
            <Callout tone="good">{BACKPROP.vanishing.say}</Callout>

            <H mt={16} size={13.5}>{BACKPROP.init.h}</H>
            <Body>{BACKPROP.init.body}</Body>

            <H mt={16} size={13.5}>A network from scratch, in NumPy</H>
            <Code>{BACKPROP.scratchCode}</Code>
            {BACKPROP.scratchNotes.map((n, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7, marginBottom: 6 }}>
                <strong style={{ color: BLUE }}>{i + 1}.</strong> {n}
              </div>
            ))}
            <Code label="pytorch equivalent">{BACKPROP.pytorchNote}</Code>
            <Callout tone="warn">{BACKPROP.pytorchGotcha}</Callout>
          </Collapse>

          <Collapse title="🔺 Transformers & attention" color="#AD1457" defaultOpen>
            <Callout tone="warn" title="Note">{TRANSFORMER.flag}</Callout>
            <H mt={12} size={13.5}>{TRANSFORMER.coreIdea.h}</H>
            <Body>{TRANSFORMER.coreIdea.body}</Body>
            <div style={{ marginTop: 10 }}><Body>{TRANSFORMER.coreIdea.qkv}</Body></div>

            <H mt={16} size={13.5}>Build the formula step by step</H>
            <AttentionWalkthrough steps={TRANSFORMER.steps.map((s) => ({ label: s.label, body: s.body }))} />
            <Code label="the formula">{TRANSFORMER.formula}</Code>
            <Callout tone="warn" title="Why √d_k and not d_k?">{TRANSFORMER.whySqrt}</Callout>

            <H mt={16} size={13.5}>{TRANSFORMER.multiHead.h}</H>
            <Body>{TRANSFORMER.multiHead.body}</Body>

            <H mt={16} size={13.5}>Masking &amp; cross-attention</H>
            <Body>{TRANSFORMER.masking}</Body>

            <H mt={16} size={13.5}>Positional encoding</H>
            <Body>{TRANSFORMER.positional}</Body>

            <H mt={16} size={13.5}>The rest of the block</H>
            <Body>{TRANSFORMER.block}</Body>

            <H mt={16} size={13.5}>Complexity — the one weakness</H>
            <Body>{TRANSFORMER.complexity}</Body>

            <H mt={16} size={13.5}>Model families</H>
            <Table color="#AD1457" headers={TRANSFORMER.families.headers} rows={TRANSFORMER.families.rows} />
            <Callout tone="info" title="Why decoder-only won">{TRANSFORMER.families.why}</Callout>
            <Table color="#AD1457" headers={TRANSFORMER.bertVsGpt.headers} rows={TRANSFORMER.bertVsGpt.rows} />
            <Callout tone="good">{TRANSFORMER.whyWon}</Callout>
          </Collapse>

          <Collapse title="💬 NLP fundamentals" color="#00695C">
            <H size={13.5}>{NLP.tokenization.h}</H>
            <Body>{NLP.tokenization.body}</Body>
            <div style={{ marginTop: 8 }}>
              {NLP.tokenization.consequences.map((c, i) => <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {c}</div>)}
            </div>
            <Sub>{NLP.tokenization.fix}</Sub>
            <H mt={16} size={13.5}>{NLP.embeddings.h}</H>
            <Body>{NLP.embeddings.body}</Body>
            <div style={{ marginTop: 10 }}><Body>{NLP.embeddings.static}</Body></div>
            <div style={{ marginTop: 10 }}><Callout tone="warn" title="Practical selection criteria">{NLP.embeddings.selection}</Callout></div>
            <Sub>{NLP.tasks}</Sub>
            <div style={{ marginTop: 8 }}><Sub>{NLP.tfidf}</Sub></div>
          </Collapse>

          <Collapse title="🎨 Other generative model families" color="#B84A00">
            {GENERATIVE_FAMILIES.map((g, i) => (
              <Card key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#B84A00" }}>{g.name}</div>
                <Sub size={12.5}>{g.body}</Sub>
              </Card>
            ))}
          </Collapse>
        </div>
      )}

      {/* ══ SPECIALIZATIONS ══ */}
      {tab === "spec" && (
        <div>
          <SectionTitle sub="You choose one, and they ask from it. Pick where you can survive four layers of follow-ups, not what sounds most impressive.">
            Specialization tracks
          </SectionTitle>

          <Callout tone="warn" title={PICKING_ADVICE.h}>{PICKING_ADVICE.body}</Callout>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "1.25rem 0" }}>
            {SPECIALIZATIONS.map((s) => (
              <button key={s.id} onClick={() => setActiveSpec(s.id)} style={{
                padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12.5,
                fontFamily: "var(--font-sans)", fontWeight: activeSpec === s.id ? 600 : 400,
                border: `1.5px solid ${activeSpec === s.id ? s.color : C.border2}`,
                background: activeSpec === s.id ? s.bg : "transparent",
                color: activeSpec === s.id ? s.color : C.sub,
              }}>{s.emoji} {s.name}</button>
            ))}
          </div>

          {spec && (
            <div>
              <div style={{ padding: "13px 16px", background: spec.bg, borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: spec.color }}>{spec.emoji} {spec.name}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginTop: 3 }}>{spec.tagline}</div>
              </div>

              {spec.sections.map((sec, i) => (
                <Collapse key={i} title={sec.h} color={spec.color} defaultOpen={i === 0}>
                  {sec.flag && <Callout tone="warn" title="Note">{sec.flag}</Callout>}
                  {sec.note && <Callout tone="info">{sec.note}</Callout>}
                  {sec.simple && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0F7A5A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Simple</div>
                      <Body>{sec.simple}</Body>
                    </div>
                  )}
                  {sec.deep && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: spec.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Deep</div>
                      <Body>{sec.deep}</Body>
                    </div>
                  )}
                  {sec.body && <Body>{sec.body}</Body>}
                  {sec.pipeline && <Code label="pipeline">{sec.pipeline}</Code>}
                  {sec.id === "genai" && null}
                  {sec.h === "RAG in full" && <div style={{ margin: "14px 0" }}><RAGPipeline /></div>}
                  {sec.fourThings && <Callout tone="good">{sec.fourThings}</Callout>}
                  {sec.table && <Table color={spec.color} headers={sec.table.headers} rows={sec.table.rows} />}
                  {sec.formal && <div style={{ marginTop: 10 }}><Callout tone="info">{sec.formal}</Callout></div>}
                  {sec.loop && <Code label="the agent loop">{sec.loop}</Code>}
                  {sec.patterns && <Table color={spec.color} headers={sec.patterns.headers} rows={sec.patterns.rows} />}
                  {sec.steps && <Table color={spec.color} headers={["#", "Step", "Detail"]} rows={sec.steps.map((s) => [String(s.n), s.label, s.body])} />}
                  {sec.procedure && <Callout tone="good" title="The decision procedure to recite">{sec.procedure}</Callout>}
                  {sec.trap && <Callout tone="bad" title="The trap answer to avoid">{sec.trap}</Callout>}
                  {sec.efficiency && <div style={{ marginTop: 10 }}><Sub>{sec.efficiency}</Sub></div>}
                  {sec.ann && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.ann.h}</H>
                      <Sub>{sec.ann.body}</Sub>
                      <Table color={spec.color} headers={sec.ann.table.headers} rows={sec.ann.table.rows} />
                      <Sub>{sec.ann.knobs}</Sub>
                    </div>
                  )}
                  {sec.chunking && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.chunking.h}</H>
                      <Table color={spec.color} headers={sec.chunking.table.headers} rows={sec.chunking.table.rows} />
                      <Body>{sec.chunking.params}</Body>
                    </div>
                  )}
                  {sec.retrieval && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.retrieval.h}</H>
                      <Body>{sec.retrieval.body}</Body>
                      <Table color={spec.color} headers={sec.retrieval.queryTransform.headers} rows={sec.retrieval.queryTransform.rows} />
                    </div>
                  )}
                  {sec.reranking && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.reranking.h}</H>
                      <Body>{sec.reranking.simple}</Body>
                      <Table color={spec.color} headers={sec.reranking.table.headers} rows={sec.reranking.table.rows} />
                      <Callout tone="good">{sec.reranking.note}</Callout>
                    </div>
                  )}
                  {sec.generation && <div style={{ marginTop: 10 }}><Body>{sec.generation}</Body></div>}
                  {sec.whyNotBigContext && <Callout tone="warn" title="Defend the architecture">{sec.whyNotBigContext}</Callout>}
                  {sec.whyNotBigK && <Callout tone="warn">{sec.whyNotBigK}</Callout>}
                  {sec.advanced && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>Advanced RAG patterns</H>
                      <Table color={spec.color} headers={sec.advanced.headers} rows={sec.advanced.rows} />
                      <Callout tone="good">{sec.advanced.senior}</Callout>
                    </div>
                  )}
                  {sec.failureModes && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color="#CC2A2A">{sec.failureModes.h}</H>
                      <Sub>{sec.failureModes.note}</Sub>
                      <Table color="#CC2A2A" headers={sec.failureModes.headers} rows={sec.failureModes.rows} />
                      <Callout tone="good" title="How to isolate definitively">{sec.failureModes.oracle}</Callout>
                    </div>
                  )}
                  {sec.evaluation && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.evaluation.h}</H>
                      <Callout tone="bad" title="The critical insight">{sec.evaluation.critical}</Callout>
                      <Table color={spec.color} headers={sec.evaluation.retrievalMetrics.headers} rows={sec.evaluation.retrievalMetrics.rows} />
                      <Table color={spec.color} headers={sec.evaluation.generationMetrics.headers} rows={sec.evaluation.generationMetrics.rows} />
                      <Callout tone="info" title="Building the golden set">{sec.evaluation.goldenSet}</Callout>
                      <Callout tone="warn">{sec.evaluation.abstention}</Callout>
                      <Sub>{sec.evaluation.llmJudge}</Sub>
                      <div style={{ marginTop: 8 }}><Sub>{sec.evaluation.online}</Sub></div>
                      <Callout tone="good" title="The strongest single sentence">{sec.evaluation.strongest}</Callout>
                    </div>
                  )}
                  {sec.tools && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>{sec.tools.h}</H>
                      <Body>{sec.tools.mechanics}</Body>
                      <div style={{ marginTop: 10 }}><Callout tone="good" title="Tool design principles">{sec.tools.design}</Callout></div>
                    </div>
                  )}
                  {sec.memory && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color={spec.color}>Memory</H>
                      <Table color={spec.color} headers={sec.memory.headers} rows={sec.memory.rows} />
                      <Callout tone="warn">{sec.memory.note}</Callout>
                    </div>
                  )}
                  {sec.failures && (
                    <div style={{ marginTop: 12 }}>
                      <H size={13.5} color="#CC2A2A">{sec.failures.h}</H>
                      <Table color="#CC2A2A" headers={sec.failures.headers} rows={sec.failures.rows} />
                      <Callout tone="bad" title="The arithmetic to quote">{sec.failures.arithmetic}</Callout>
                      <Sub>{sec.failures.evaluating}</Sub>
                    </div>
                  )}
                  {sec.cost && (
                    <div style={{ marginTop: 12 }}>
                      <Body>{sec.cost.simple}</Body>
                      <Table color={spec.color} headers={sec.cost.headers} rows={sec.cost.rows} />
                      <Callout tone="good" title="The structural insight">{sec.cost.insight}</Callout>
                    </div>
                  )}
                  {sec.guardrails && <div style={{ marginTop: 10 }}><Body>{sec.guardrails}</Body></div>}
                  {sec.monitoring && <div style={{ marginTop: 10 }}><Body>{sec.monitoring}</Body></div>}
                  {sec.framework && <div style={{ marginTop: 10 }}><Callout tone="info" title="The framework">{sec.framework}</Callout></div>}
                  {sec.walkthroughs && sec.walkthroughs.map((w, j) => (
                    <div key={j} style={{ marginTop: 12 }}>
                      <Collapse title={w.title} color="#0F7A5A"><Body>{w.body}</Body></Collapse>
                    </div>
                  ))}
                  {sec.thirtySec && <Callout tone="good">{sec.thirtySec}</Callout>}
                  {sec.followUp && (
                    <div style={{ marginTop: 10 }}>
                      <Callout tone="warn" title={`Follow-up: ${sec.followUp.q}`}>{sec.followUp.a}</Callout>
                    </div>
                  )}
                </Collapse>
              ))}

              <H mt={20} color={spec.color}>Questions for this track</H>
              {spec.questions.map((q, i) => <Flashcard key={i} q={q.q} a={q.a} meta={<DiffPill d={q.level} />} />)}
            </div>
          )}
        </div>
      )}

      {/* ══ QUESTION BANK ══ */}
      {tab === "bank" && (
        <div>
          <SectionTitle sub="Every question, deduplicated and tagged. Cover the answer, say yours OUT LOUD, then reveal and compare.">
            The question bank
          </SectionTitle>

          <Callout tone="warn" title={BANK_ADVICE.h}>{BANK_ADVICE.body}</Callout>
          <Callout tone="bad" title="Why memorizing these backfires">{BANK_ADVICE.warning}</Callout>

          <Callout tone="info" title="Use it as a diagnostic">
            {"For each question, try to answer BEFORE revealing. Then bucket yourself:\n1. Could answer from experience → rehearse it with your specifics attached\n2. Understood it immediately → you know the concept, practise SAYING it\n3. Needed the answer → a genuine gap: study it, or plan to be honest about it\n\nBucket 3 is the useful output. It tells you where you're thin before an interviewer finds out."}
          </Callout>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "1.25rem 0 0.75rem" }}>
            {["All", ...SECTIONS].map((s) => (
              <button key={s} onClick={() => setBankSection(s)} style={{
                padding: "5px 11px", borderRadius: 100, cursor: "pointer", fontSize: 11.5,
                fontFamily: "var(--font-sans)", fontWeight: bankSection === s ? 600 : 400,
                border: `1px solid ${bankSection === s ? BLUE : C.border2}`,
                background: bankSection === s ? "#E8F0FE" : "transparent",
                color: bankSection === s ? BLUE : C.sub,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Difficulty:</span>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} onClick={() => setBankDiff(d)} style={{
                padding: "4px 11px", borderRadius: 100, cursor: "pointer", fontSize: 11.5,
                fontFamily: "var(--font-sans)", fontWeight: bankDiff === d ? 600 : 400,
                border: `1px solid ${bankDiff === d ? "#6A1B9A" : C.border2}`,
                background: bankDiff === d ? "#F3E5F5" : "transparent",
                color: bankDiff === d ? "#6A1B9A" : C.sub,
              }}>{d}</button>
            ))}
            <span style={{ fontSize: 11.5, color: C.sub, marginLeft: "auto" }}>{filtered.length} questions</span>
          </div>

          {filtered.map((q, i) => (
            <Flashcard key={i} q={q.q} a={q.a} meta={
              <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.sub, whiteSpace: "nowrap" }}>{q.s}</span>
                <DiffPill d={q.d} />
              </span>
            } />
          ))}

          <H mt={26}>🔬 Depth probes — the questions with a second layer</H>
          <Sub>These are specifically designed to detect whether someone did the work. Each shows what the interviewer is really testing, and the follow-up that comes next.</Sub>
          <div style={{ marginTop: 12 }}>
            {DEPTH_PROBES.map((p, i) => (
              <Flashcard key={i} q={p.q} a={p.a} detects={p.detects} followUp={p.followUp}
                meta={<span style={{ fontSize: 10, color: C.sub, whiteSpace: "nowrap" }}>{p.s}</span>} />
            ))}
          </div>
        </div>
      )}

      {/* ══ ML CODING ══ */}
      {tab === "code" && (
        <div>
          <SectionTitle sub={CODE_INTRO.body}>{CODE_INTRO.h}</SectionTitle>
          <Callout tone="warn">{CODE_INTRO.drill}</Callout>

          {ML_CODE_CATEGORIES.map((cat) => (
            <div key={cat} style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.sub, marginBottom: 6 }}>{cat}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ML_SNIPPETS.filter((s) => s.category === cat).map((s) => (
                  <button key={s.id} onClick={() => setActiveCode(s.id)} style={{
                    padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                    fontFamily: "var(--font-sans)", fontWeight: activeCode === s.id ? 600 : 400,
                    border: `1.5px solid ${activeCode === s.id ? s.color : C.border2}`,
                    background: activeCode === s.id ? s.bg : "transparent",
                    color: activeCode === s.id ? s.color : C.sub,
                  }}>{s.emoji} {s.label}</button>
                ))}
              </div>
            </div>
          ))}

          {snippet && (
            <div style={{ marginTop: 20 }}>
              <div style={{ padding: "13px 16px", background: snippet.bg, borderRadius: "10px 10px 0 0", border: `1.5px solid ${snippet.color}`, borderBottom: "none" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: snippet.color }}>{snippet.emoji} {snippet.label}</div>
                <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.55 }}>{snippet.description}</div>
              </div>
              <div style={{ border: `1.5px solid ${snippet.color}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                <Code>{snippet.code}</Code>
              </div>
            </div>
          )}

          <H mt={22}>Also drill these</H>
          {ALSO_DRILL.map((d, i) => (
            <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>• {d}</div>
          ))}
        </div>
      )}

      {/* ══ STUDY PLAN ══ */}
      {tab === "plan" && (
        <div>
          <SectionTitle sub="Roughly 3 focused hours a day. Depth on the core beats a thin film over everything.">
            Study plan &amp; self-test
          </SectionTitle>

          <Callout tone="bad" title={PLAN_RULE.h}>{PLAN_RULE.body}</Callout>
          <Callout tone="warn">{PLAN_RULE.metric}</Callout>
          <Callout tone="info" title={ALLOCATION.h}>{ALLOCATION.body}</Callout>

          <H mt={22}>The seven days</H>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DAYS.map((d) => (
              <div key={d.day} style={{ borderRadius: 11, border: `1.5px solid ${d.color}33`, overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", background: d.bg }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: d.color }}>Day {d.day} — {d.title}</span>
                </div>
                <div style={{ padding: "13px 16px" }}>
                  <div style={{ marginBottom: 9 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B8860B", textTransform: "uppercase", letterSpacing: "0.06em" }}>☀️ Morning</span>
                    <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.65, marginTop: 2 }}>{d.morning}</div>
                  </div>
                  <div style={{ marginBottom: 9 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6A1B9A", textTransform: "uppercase", letterSpacing: "0.06em" }}>🌙 Evening — say it out loud</span>
                    <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.65, marginTop: 2 }}>{d.evening}</div>
                  </div>
                  <div style={{ padding: "8px 11px", background: C.bg, borderRadius: 7, fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>
                    ⌨️ <strong style={{ color: C.text }}>Drill:</strong> {d.drill}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}><Callout tone="info" title={COMPRESSED.h}>{COMPRESSED.body}</Callout></div>

          <H mt={26}>✅ The readiness self-test</H>
          <Sub>Cover the answers. Say each one out loud, in full sentences. Tick the ones you can produce fluently WITHOUT notes. Progress saves automatically.</Sub>
          {(() => {
            const all = SELF_TEST.flatMap((g, gi) => g.items.map((_, ii) => `${gi}-${ii}`));
            const done = all.filter((k) => checks[k]).length;
            const pct = Math.round((done / all.length) * 100);
            return (
              <div style={{ margin: "12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{done} of {all.length} answered fluently</span>
                  <span style={{ fontWeight: 700, color: pct >= 80 ? "#0F7A5A" : pct >= 50 ? "#B8860B" : "#CC2A2A" }}>{pct}%</span>
                </div>
                <div style={{ height: 9, background: C.border, borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#0F7A5A" : pct >= 50 ? "#B8860B" : "#CC2A2A", borderRadius: 100, transition: "width .2s" }} />
                </div>
              </div>
            );
          })()}

          {SELF_TEST.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{g.group}</div>
              {g.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const on = !!checks[key];
                return (
                  <label key={ii} style={{
                    display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 9px",
                    borderRadius: 7, cursor: "pointer", background: on ? C.bg : "transparent",
                  }}>
                    <input type="checkbox" checked={on} onChange={() => toggle(key)}
                      style={{ marginTop: 3, accentColor: "#0F7A5A", cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, lineHeight: 1.6, color: C.text, textDecoration: on ? "line-through" : "none", opacity: on ? 0.55 : 1 }}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          ))}

          <Callout tone="warn" title="Target">{SELF_TEST_TARGET}</Callout>

          <H mt={22}>{LAST_DAYS.h}</H>
          <Table headers={["Priority", "What", "Why"]} rows={LAST_DAYS.rows.map((r) => [r.p, r.what, r.why])} />
          <Callout tone="bad">{LAST_DAYS.dont}</Callout>

          <H mt={22}>{THREE_THINGS.h}</H>
          {THREE_THINGS.items.map((t, i) => (
            <Card key={i} accent="#0F7A5A" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65 }}><strong style={{ color: "#0F7A5A" }}>{i + 1}.</strong> {t}</div>
            </Card>
          ))}
          <Callout tone="good">{THREE_THINGS.closing}</Callout>
        </div>
      )}

      <PathFooter stages={ML_STAGES} tab={tab} setTab={setTab} accent={BLUE} />
    </div>
  );
}
