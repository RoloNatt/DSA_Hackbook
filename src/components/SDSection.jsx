import { useState } from "react";
import {
  C, Card, H, Body, Sub, Table, Code, Callout, Collapse, Flashcard, DiffPill,
} from "./MLWidgets.jsx";

import { ROUND, PHASES, REQUIREMENTS_CHECKLIST, ESTIMATION, LATENCY_NUMBERS, AVAILABILITY, SCORING } from "../data/sd/framework.js";
import { COMPONENTS, SQL_VS_NOSQL, INDEXING, SHARDING, REPLICATION, CAP, DISTRIBUTED } from "../data/sd/blocks.js";
import { AI_INTRO, AGENT_ARCH, AI_DESIGN_DECISIONS, INTEGRATION, RELIABILITY } from "../data/sd/aiops.js";
import { CASE_INTRO, CASES } from "../data/sd/cases.js";
import { DISCOVERY_INTRO, DISCOVERY_FRAMEWORK, SCOPING_ANSWERS, STAR, STORIES, BEHAVIOURAL_QUESTIONS, YOUR_QUESTIONS } from "../data/sd/discovery.js";
import { SD_STAGES } from "../data/paths.js";
import { StageNav, PathFooter } from "./PathNav.jsx";

const BLUE = "#00897B";

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px", color: C.text }}>{children}</h3>
      {sub && <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>{sub}</div>}
    </div>
  );
}

// ─── INTERACTIVE ESTIMATION CALCULATOR ──────────────────────────────────────

function EstimateCalc() {
  const [users, setUsers] = useState(10);          // millions
  const [actions, setActions] = useState(5);       // per user per day
  const [size, setSize] = useState(1);             // KB per record
  const [retain, setRetain] = useState(3);         // years
  const [ratio, setRatio] = useState(20);          // read:write
  const [peak, setPeak] = useState(3);             // peak multiplier

  const writesDay = users * 1e6 * actions;
  const writesSec = writesDay / 86400;
  const peakWrites = writesSec * peak;
  const readsSec = writesSec * ratio;
  const peakReads = readsSec * peak;
  const bytesDay = writesDay * size * 1024;
  const totalBytes = bytesDay * 365 * retain;

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toFixed(0);
  };
  const bytes = (n) => {
    if (n >= 1e15) return (n / 1e15).toFixed(1) + " PB";
    if (n >= 1e12) return (n / 1e12).toFixed(1) + " TB";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + " GB";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " MB";
    return (n / 1e3).toFixed(1) + " KB";
  };

  const field = (label, val, set, min, max, step, unit) => (
    <div style={{ flex: "1 1 110px", minWidth: 104 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input type="number" value={val} min={min} max={max} step={step}
          onChange={(e) => set(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
          style={{
            width: "100%", padding: "7px 9px", borderRadius: 7, border: `1px solid ${C.border2}`,
            background: "var(--color-background-primary)", color: C.text,
            fontFamily: "Consolas, monospace", fontSize: 14, fontWeight: 600,
          }} />
        {unit && <span style={{ fontSize: 10.5, color: C.sub, whiteSpace: "nowrap" }}>{unit}</span>}
      </div>
    </div>
  );

  // Derived guidance
  const guidance = [];
  if (peakWrites < 5000) guidance.push({ t: "good", m: `${fmt(peakWrites)} peak writes/sec fits comfortably in one well-tuned relational primary. Do NOT shard yet — say that explicitly.` });
  else if (peakWrites < 20000) guidance.push({ t: "warn", m: `${fmt(peakWrites)} peak writes/sec is at the edge of a single primary. Consider batching, write-behind caching, or partitioning soon.` });
  else guidance.push({ t: "bad", m: `${fmt(peakWrites)} peak writes/sec exceeds a single primary. You need partitioning — and the shard key is now the most important decision in the design.` });

  if (peakReads > 20000) guidance.push({ t: "warn", m: `${fmt(peakReads)} peak reads/sec needs read replicas plus a cache layer. Size the cache for the HOT SET, not the whole dataset.` });
  else guidance.push({ t: "good", m: `${fmt(peakReads)} peak reads/sec is servable with read replicas; a cache is an optimization rather than a necessity.` });

  if (totalBytes > 5e12) guidance.push({ t: "warn", m: `${bytes(totalBytes)} over ${retain} years will not fit on one machine. Plan partitioning or cold-storage tiering before you need it.` });
  else guidance.push({ t: "good", m: `${bytes(totalBytes)} over ${retain} years fits on a single large volume. Archiving buys you more runway than sharding.` });

  const tone = { good: { bg: "#E2F5EF", fg: "#0F7A5A" }, warn: { bg: "#FFF8E1", fg: "#B28704" }, bad: { bg: "#FCEBEB", fg: "#CC2A2A" } };

  return (
    <div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
        {field("Users", users, setUsers, 0.01, 10000, 1, "M")}
        {field("Actions/user/day", actions, setActions, 0.1, 1000, 1, "")}
        {field("Record size", size, setSize, 0.1, 10000, 1, "KB")}
        {field("Retention", retain, setRetain, 1, 20, 1, "yr")}
        {field("Read:write", ratio, setRatio, 1, 1000, 1, ": 1")}
        {field("Peak factor", peak, setPeak, 1, 20, 1, "×")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 9, marginBottom: 14 }}>
        {[
          { l: "Writes / sec (avg)", v: fmt(writesSec), c: "#0F7A5A" },
          { l: "Writes / sec (peak)", v: fmt(peakWrites), c: "#B84A00" },
          { l: "Reads / sec (peak)", v: fmt(peakReads), c: "#1A73E8" },
          { l: "Storage / day", v: bytes(bytesDay), c: "#6A1B9A" },
          { l: `Storage / ${retain} yr`, v: bytes(totalBytes), c: "#C62828" },
        ].map((x) => (
          <div key={x.l} style={{ padding: "10px 12px", background: C.bg, borderRadius: 8, border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{x.l}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: x.c, fontFamily: "Consolas, monospace" }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        So what — the decisions these numbers force
      </div>
      {guidance.map((g, i) => (
        <div key={i} style={{
          padding: "9px 12px", background: tone[g.t].bg, borderRadius: 7,
          borderLeft: `3px solid ${tone[g.t].fg}`, marginBottom: 6,
          fontSize: 12.5, color: C.text, lineHeight: 1.6,
        }}>{g.m}</div>
      ))}
      <Sub size={12}>
        {"\n"}This is the whole point of estimating. An unused calculation is wasted interview minutes — every number should justify a later design decision.
      </Sub>
    </div>
  );
}

// ─── LATENCY SCALE VISUAL ───────────────────────────────────────────────────

function LatencyScale() {
  const rows = LATENCY_NUMBERS.rows;
  const maxLog = Math.log10(rows[rows.length - 1].ns);
  const minLog = 0;
  const color = (ns) => {
    if (ns < 1e3) return "#0F7A5A";
    if (ns < 1e6) return "#1A73E8";
    if (ns < 1e9) return "#B84A00";
    return "#CC2A2A";
  };
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r, i) => {
          const pct = ((Math.log10(r.ns) - minLog) / (maxLog - minLog)) * 100;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ minWidth: 230, fontSize: 12, color: C.text, lineHeight: 1.4 }}>{r.op}</div>
              <div style={{ flex: 1, height: 14, background: C.border, borderRadius: 100, overflow: "hidden", minWidth: 60 }}>
                <div style={{ height: "100%", width: `${Math.max(1.5, pct)}%`, background: color(r.ns), borderRadius: 100 }} />
              </div>
              <div style={{ minWidth: 62, textAlign: "right", fontFamily: "Consolas, monospace", fontSize: 12, fontWeight: 700, color: color(r.ns) }}>
                {r.human}
              </div>
            </div>
          );
        })}
      </div>
      <Sub size={11.5}>{"\n"}Bars are on a LOG scale — each equal step is roughly 10×. That's the point: the differences are orders of magnitude, not percentages.</Sub>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function SDSection({ tab, setTab }) {
  const [activeComp, setActiveComp] = useState("lb");
  const [activeCase, setActiveCase] = useState("support-agent");

  const comp = COMPONENTS.find((c) => c.id === activeComp);
  const kase = CASES.find((c) => c.id === activeCase);

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px", color: C.text }}>
          🏗️ System Design
        </h2>
        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>
          The open-ended round: you're handed a vague problem and scored on how you turn it into a design.
          Covers the classic distributed-systems core, production AI architecture, integration patterns,
          reliability, and turning an ambiguous real-world problem into something shippable.
        </p>
      </div>

      <StageNav stages={SD_STAGES} tab={tab} setTab={setTab} accent={BLUE} />

      {/* ══ FRAMEWORK ══ */}
      {tab === "framework" && (
        <div>
          <SectionTitle sub={ROUND.blurb}>{ROUND.h}</SectionTitle>

          <Callout tone="info" title="Five things to internalize before you start">
            {ROUND.truths.map((t, i) => `${i + 1}. ${t}`).join("\n")}
          </Callout>

          <H mt={20}>The seven phases</H>
          <Sub>Timings assume a 45-minute round. Adjust proportionally, and say out loud when you're moving between phases — it makes you easy to follow.</Sub>
          <div style={{ marginTop: 12 }}>
            {PHASES.map((p) => (
              <Collapse key={p.n} title={`${p.n}. ${p.name}`} color={p.color} defaultOpen={p.n === 1}
                badge={<span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 100, background: `${p.color}18`, color: p.color, fontWeight: 700 }}>{p.time}</span>}>
                <div style={{ fontSize: 13, color: p.color, fontWeight: 600, marginBottom: 8 }}>{p.goal}</div>
                {p.doThis.map((d, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {d}</div>
                ))}
                {p.questions.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                      Questions to actually ask
                    </div>
                    {p.questions.map((q, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, fontStyle: "italic" }}>"{q}"</div>
                    ))}
                  </div>
                )}
                {p.warning && <Callout tone="warn">{p.warning}</Callout>}
                <div style={{ marginTop: 10, padding: "8px 11px", background: C.bg, borderRadius: 7, fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>
                  <strong style={{ color: C.text }}>You should leave this phase with:</strong> {p.output}
                </div>
              </Collapse>
            ))}
          </div>

          <H mt={22}>{REQUIREMENTS_CHECKLIST.h}</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            {[REQUIREMENTS_CHECKLIST.functional, REQUIREMENTS_CHECKLIST.nonFunctional].map((g, i) => (
              <Card key={i} accent={g.color}>
                <div style={{ fontSize: 12, fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>{g.label}</div>
                {g.items.map((it, j) => <div key={j} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7 }}>• {it}</div>)}
              </Card>
            ))}
          </div>
          <Callout tone="good">{REQUIREMENTS_CHECKLIST.tip}</Callout>

          <H mt={22}>Anti-patterns that cost you the round</H>
          {ROUND.antipatterns.map((a, i) => (
            <Card key={i} accent="#CC2A2A" style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#CC2A2A" }}>🚩 {a.bad}</div>
              <Sub size={12.5}>{a.why}</Sub>
            </Card>
          ))}

          <H mt={22}>{SCORING.h}</H>
          <Table color={BLUE} headers={["Axis", "Weight", "What they're watching for"]}
            rows={SCORING.axes.map((a) => [a.axis, a.weight, a.what])} />
          <Callout tone="good" title="Senior signals — say these unprompted">
            {SCORING.seniorSignals.map((s) => `• ${s}`).join("\n")}
          </Callout>
        </div>
      )}

      {/* ══ ESTIMATION ══ */}
      {tab === "estimate" && (
        <div>
          <SectionTitle sub={ESTIMATION.intro}>{ESTIMATION.h}</SectionTitle>

          <H>🔢 Interactive: size a system</H>
          <EstimateCalc />

          <H mt={24}>Rounding rules that make this fast</H>
          {ESTIMATION.rounding.map((r, i) => (
            <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>• {r}</div>
          ))}

          <H mt={20}>Data sizes worth knowing</H>
          <Table color="#6A1B9A" compact headers={ESTIMATION.dataSizes.headers} rows={ESTIMATION.dataSizes.rows} />

          <H mt={20}>Powers of two</H>
          <Table color="#0F7A5A" compact headers={ESTIMATION.powers.headers} rows={ESTIMATION.powers.rows} />

          <H mt={20}>{ESTIMATION.worked.h}</H>
          <Code label="worked example">{ESTIMATION.worked.body}</Code>

          <H mt={20}>{ESTIMATION.serverMath.h}</H>
          <Table color="#B84A00" compact headers={["Component", "Rough capacity"]} rows={ESTIMATION.serverMath.rows} />
          <Callout tone="warn" title="The sizing intuition that matters most for AI systems">{ESTIMATION.serverMath.note}</Callout>

          <H mt={24}>{LATENCY_NUMBERS.h}</H>
          <Sub>{LATENCY_NUMBERS.note}</Sub>
          <div style={{ marginTop: 12 }}><LatencyScale /></div>
          <Callout tone="good" title="What to take from this">
            {LATENCY_NUMBERS.takeaways.map((t) => `• ${t}`).join("\n\n")}
          </Callout>

          <H mt={24}>{AVAILABILITY.h}</H>
          <Table color="#CC2A2A" headers={AVAILABILITY.headers} rows={AVAILABILITY.rows} />
          <Callout tone="warn">{AVAILABILITY.note}</Callout>
        </div>
      )}

      {/* ══ BUILDING BLOCKS ══ */}
      {tab === "blocks" && (
        <div>
          <SectionTitle sub="The component vocabulary. For each: what it is, the requirement that justifies it, and what it costs you — because adding a component without naming the requirement is exactly the over-engineering signal interviewers watch for.">
            Building blocks
          </SectionTitle>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {COMPONENTS.map((c) => (
              <button key={c.id} onClick={() => setActiveComp(c.id)} style={{
                padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12.5,
                fontFamily: "var(--font-sans)", fontWeight: activeComp === c.id ? 600 : 400,
                border: `1.5px solid ${activeComp === c.id ? c.color : C.border2}`,
                background: activeComp === c.id ? c.bg : "transparent",
                color: activeComp === c.id ? c.color : C.sub,
              }}>{c.emoji} {c.name}</button>
            ))}
          </div>

          {comp && (
            <div>
              <div style={{ padding: "13px 16px", background: comp.bg, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: comp.color }}>{comp.emoji} {comp.name}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginTop: 3 }}>{comp.what}</div>
              </div>

              <H size={13.5} color={comp.color}>Why you'd add it</H>
              <Body>{comp.why}</Body>

              <H size={13.5} color={comp.color} mt={16}>How it works</H>
              <Body>{comp.detail}</Body>

              {comp.pitfalls && (
                <div style={{ marginTop: 14 }}>
                  <Callout tone="bad" title="Failure modes to name">{comp.pitfalls}</Callout>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <Callout tone="warn" title="What it costs you">{comp.tradeoff}</Callout>
              </div>
              <Callout tone="good" title="The question to ask yourself">{comp.ask}</Callout>
            </div>
          )}
        </div>
      )}

      {/* ══ DATA & DISTRIBUTED ══ */}
      {tab === "data" && (
        <div>
          <SectionTitle sub="Where most designs are actually won or lost. The storage choice and the partition key are the decisions you can't cheaply undo.">
            Data & distributed systems
          </SectionTitle>

          <Collapse title="🗄️ SQL vs NoSQL — the decision, not the religion" color="#0F7A5A" defaultOpen>
            <Table color="#0F7A5A" compact headers={SQL_VS_NOSQL.table.headers} rows={SQL_VS_NOSQL.table.rows} />
            <Body>{SQL_VS_NOSQL.guidance}</Body>
            <Callout tone="good" title="The distinction that lands">{SQL_VS_NOSQL.keyPoint}</Callout>
          </Collapse>

          <Collapse title="📇 Indexes" color="#1A73E8">
            <Body>{INDEXING.body}</Body>
          </Collapse>

          <Collapse title="🔪 Partitioning & sharding" color="#B84A00">
            <Sub>{SHARDING.intro}</Sub>
            <Table color="#B84A00" headers={SHARDING.strategies.headers} rows={SHARDING.strategies.rows} />
            <Callout tone="warn" title="Choosing the shard key">{SHARDING.choosingKey}</Callout>
            <Callout tone="bad" title="What sharding costs you">{SHARDING.pain}</Callout>
          </Collapse>

          <Collapse title="📑 Replication" color="#6A1B9A">
            <Body>{REPLICATION.body}</Body>
          </Collapse>

          <Collapse title="⚖️ CAP, PACELC & consistency models" color="#C62828">
            <Body>{CAP.cap}</Body>
            <div style={{ marginTop: 12 }}><Callout tone="info" title="PACELC — the more useful version">{CAP.pacelc}</Callout></div>
            <Table color="#C62828" headers={CAP.models.headers} rows={CAP.models.rows} />
            <Callout tone="good" title="The move that separates senior answers">{CAP.practical}</Callout>
          </Collapse>

          {DISTRIBUTED.map((d, i) => (
            <Collapse key={i} title={`🔗 ${d.h}`} color="#37474F">
              <Body>{d.body}</Body>
            </Collapse>
          ))}
        </div>
      )}

      {/* ══ PRODUCTION AI ══ */}
      {tab === "ai" && (
        <div>
          <SectionTitle sub={AI_INTRO.body}>{AI_INTRO.h}</SectionTitle>

          <H mt={20}>{AGENT_ARCH.h}</H>
          <Sub>The layers, in request order. Each one exists because of a specific failure it prevents.</Sub>
          <div style={{ marginTop: 12 }}>
            {AGENT_ARCH.layers.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  minWidth: 4, alignSelf: "stretch", background: l.color, borderRadius: 100,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: l.color, marginBottom: 4 }}>{l.name}</div>
                  <Sub size={12.5}>{l.body}</Sub>
                </div>
              </div>
            ))}
          </div>

          <H mt={22}>{AI_DESIGN_DECISIONS.h}</H>
          {AI_DESIGN_DECISIONS.items.map((it, i) => (
            <Flashcard key={i} q={it.q} a={it.a} meta={<DiffPill d="Hard" />} />
          ))}
        </div>
      )}

      {/* ══ INTEGRATIONS ══ */}
      {tab === "integrate" && (
        <div>
          <SectionTitle sub={INTEGRATION.intro}>{INTEGRATION.h}</SectionTitle>

          <H>API & transport styles</H>
          <Table color={BLUE} headers={INTEGRATION.apiStyles.headers} rows={INTEGRATION.apiStyles.rows} />

          <H mt={20}>{INTEGRATION.pull.h}</H>
          <Body>{INTEGRATION.pull.body}</Body>

          <H mt={20}>{INTEGRATION.batchStream.h}</H>
          <Body>{INTEGRATION.batchStream.body}</Body>

          <H mt={20}>{INTEGRATION.auth.h}</H>
          <Table color="#6A1B9A" compact headers={["Mechanism", "What to know"]} rows={INTEGRATION.auth.rows} />

          <H mt={20}>{INTEGRATION.resilience.h}</H>
          <Body>{INTEGRATION.resilience.body}</Body>

          <H mt={20}>{INTEGRATION.legacy.h}</H>
          <Body>{INTEGRATION.legacy.body}</Body>
        </div>
      )}

      {/* ══ RELIABILITY ══ */}
      {tab === "reliability" && (
        <div>
          <SectionTitle sub="Owning something in production means owning what happens when it breaks. This is where 'I've built it' and 'I've operated it' separate.">
            {RELIABILITY.h}
          </SectionTitle>

          <Collapse title="🎯 SLI, SLO, SLA & error budgets" color="#0F7A5A" defaultOpen>
            <Body>{RELIABILITY.slo.body}</Body>
          </Collapse>

          <Collapse title="🔭 Observability" color="#1A73E8" defaultOpen>
            <Table color="#1A73E8" compact headers={["Pillar", "What it answers"]} rows={RELIABILITY.observability.rows} />
            <Callout tone="info">{RELIABILITY.observability.note}</Callout>
            <H mt={14} size={13.5}>{RELIABILITY.golden.h}</H>
            <Table color="#1A73E8" compact headers={["Signal", "What to watch"]} rows={RELIABILITY.golden.rows} />
          </Collapse>

          <Collapse title="💥 Failure modes to name unprompted" color="#CC2A2A" defaultOpen>
            <Table color="#CC2A2A" headers={["Failure mode", "What happens & how to fix it"]} rows={RELIABILITY.failures.rows} />
          </Collapse>

          <Collapse title="🪫 Graceful degradation" color="#B84A00">
            <Body>{RELIABILITY.degradation.body}</Body>
          </Collapse>

          <Collapse title="🚀 Deployment & change safety" color="#6A1B9A">
            <Table color="#6A1B9A" compact headers={["Strategy", "When & what it costs"]} rows={RELIABILITY.deploy.rows} />
            <Callout tone="warn" title="Schema migrations">{RELIABILITY.deploy.schema}</Callout>
          </Collapse>

          <Collapse title="🚨 Incident response" color="#37474F">
            <Body>{RELIABILITY.incident.body}</Body>
          </Collapse>
        </div>
      )}

      {/* ══ CASE STUDIES ══ */}
      {tab === "cases" && (
        <div>
          <SectionTitle sub={CASE_INTRO.body}>{CASE_INTRO.h}</SectionTitle>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {CASES.map((c) => (
              <button key={c.id} onClick={() => setActiveCase(c.id)} style={{
                padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                fontFamily: "var(--font-sans)", fontWeight: activeCase === c.id ? 600 : 400,
                border: `1.5px solid ${activeCase === c.id ? c.color : C.border2}`,
                background: activeCase === c.id ? c.bg : "transparent",
                color: activeCase === c.id ? c.color : C.sub, textAlign: "left",
              }}>{c.emoji} {c.title.replace("Design a ", "").replace("Design an ", "")}</button>
            ))}
          </div>

          {kase && (
            <div>
              <div style={{ padding: "14px 17px", background: kase.bg, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: kase.color }}>{kase.emoji} {kase.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: `${kase.color}22`, color: kase.color }}>{kase.tag}</span>
                  <DiffPill d={kase.difficulty.includes("Hard") ? "Hard" : "Medium"} />
                </div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{kase.why}</div>
              </div>

              <H size={14} color="#1A73E8">1 · Clarify</H>
              {kase.clarify.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {c}</div>
              ))}

              <H size={14} color="#0F7A5A" mt={18}>2 · Estimate</H>
              <Code label="back of envelope">{kase.estimate}</Code>

              <H size={14} color="#6A1B9A" mt={18}>3 · API & data model</H>
              <Code>{kase.api}</Code>

              <H size={14} color="#B84A00" mt={18}>4 · High-level design</H>
              <Code label="architecture">{kase.hld}</Code>

              <H size={14} color="#C62828" mt={18}>5 · {kase.deepDive.h}</H>
              <Body>{kase.deepDive.body}</Body>

              <H size={14} color="#37474F" mt={18}>6 · Failure modes</H>
              {kase.failure.map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>• {f}</div>
              ))}

              <H size={14} color="#827717" mt={18}>7 · Tradeoffs to state explicitly</H>
              {kase.tradeoffs.map((t, i) => (
                <Card key={i} accent="#827717" style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#827717" }}>{t.d}</div>
                  <Sub size={12.5}>{t.w}</Sub>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ DISCOVERY ══ */}
      {tab === "discovery" && (
        <div>
          <SectionTitle sub={DISCOVERY_INTRO.body}>{DISCOVERY_INTRO.h}</SectionTitle>

          <H mt={18}>The discovery framework</H>
          <div style={{ marginTop: 10 }}>
            {DISCOVERY_FRAMEWORK.map((p) => (
              <Collapse key={p.n} title={`${p.n}. ${p.phase}`} color={p.color} defaultOpen={p.n === 1}>
                <div style={{ fontSize: 13, color: p.color, fontWeight: 600, marginBottom: 8 }}>{p.goal}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                  Questions to ask
                </div>
                {p.questions.map((q, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.75, fontStyle: "italic" }}>"{q}"</div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <Callout tone="warn" title="What to watch for">{p.watchFor}</Callout>
                </div>
              </Collapse>
            ))}
          </div>

          <H mt={22}>{SCOPING_ANSWERS.h}</H>
          {SCOPING_ANSWERS.items.map((it, i) => (
            <Flashcard key={i} q={it.q} a={it.a} meta={<DiffPill d="Hard" />} />
          ))}
        </div>
      )}

      {/* ══ BEHAVIOURAL ══ */}
      {tab === "behavioural" && (
        <div>
          <SectionTitle sub="Scored as seriously as the technical rounds, and the one most people under-prepare. Every story needs a number and something you got wrong.">
            Behavioural
          </SectionTitle>

          <Callout tone="info" title={STAR.h}>{STAR.body}</Callout>

          <H mt={20}>{STORIES.h}</H>
          <Sub>{STORIES.intro}</Sub>
          <div style={{ marginTop: 12 }}>
            {STORIES.items.map((s, i) => (
              <Collapse key={i} title={s.theme} color="#6A1B9A">
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                  Asked as
                </div>
                {s.probes.map((p, j) => (
                  <div key={j} style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, fontStyle: "italic" }}>"{p}"</div>
                ))}
                <div style={{ marginTop: 10 }}><Body>{s.shape}</Body></div>
              </Collapse>
            ))}
          </div>

          <H mt={22}>More questions, and what each is testing</H>
          {BEHAVIOURAL_QUESTIONS.map((b, i) => (
            <Card key={i} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.55 }}>"{b.q}"</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.6 }}>→ {b.look}</div>
            </Card>
          ))}

          <H mt={22}>{YOUR_QUESTIONS.h}</H>
          <Sub>{YOUR_QUESTIONS.intro}</Sub>
          <div style={{ marginTop: 10 }}>
            {YOUR_QUESTIONS.items.map((q, i) => (
              <Card key={i} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.55 }}>"{q.q}"</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>→ {q.why}</div>
              </Card>
            ))}
          </div>
          <Callout tone="warn">{YOUR_QUESTIONS.avoid}</Callout>
        </div>
      )}

      <PathFooter stages={SD_STAGES} tab={tab} setTab={setTab} accent={BLUE} />
    </div>
  );
}
