import { C } from "./MLWidgets.jsx";
import { P } from "./SimKit.jsx";
import { StageNav, PathFooter } from "./PathNav.jsx";
import { LAB_DOMAINS, LAB_DOMAIN_OF } from "../data/labDomains.js";
import { CORE_ML_SIMS } from "./sims/CoreML.jsx";
import { DEEP_LEARNING_SIMS } from "./sims/DeepLearning.jsx";
import { VISION_SIMS } from "./sims/Vision.jsx";
import { LANGUAGE_SIMS } from "./sims/Language.jsx";

// Interactive simulators.
//
// Every number on screen is computed by the verified implementations in
// src/lib — nothing here is illustrative. One lab at a time, deliberately:
// the teaching spec's pacing rule is a hard budget per concept.

const REGISTRY = Object.fromEntries(
  [...CORE_ML_SIMS, ...DEEP_LEARNING_SIMS, ...VISION_SIMS, ...LANGUAGE_SIMS].map((s) => [s.id, s.Comp])
);

export default function LabsSection({ tab, setTab }) {
  const Comp = REGISTRY[tab];
  const domainId = LAB_DOMAIN_OF[tab] || LAB_DOMAINS[0].id;
  const domain = LAB_DOMAINS.find((d) => d.id === domainId);
  const total = LAB_DOMAINS.reduce((a, d) => a + d.stages.reduce((b, s) => b + s.items.length, 0), 0);

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px", color: C.text }}>
          🔬 Interactive Labs
        </h2>
        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>
          {total} simulators, each genuinely running in your browser — real gradient descent, a real SMO solver, real
          convolution arithmetic, real Q-learning. Move a control and every number, diagram and graph recomputes
          together. Each lab opens with a concrete scenario, builds the mechanism one piece at a time, states its
          result in plain words, and only then names the formal term.
        </p>
      </div>

      {/* Domain rail — these are separate fields, each with its own path. */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: "1rem" }}>
        {LAB_DOMAINS.map((d) => {
          const on = d.id === domainId;
          const n = d.stages.reduce((a, s) => a + s.items.length, 0);
          return (
            <button key={d.id} onClick={() => setTab(d.stages[0].items[0].id)} style={{
              padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13,
              fontFamily: "var(--font-sans)", fontWeight: on ? 700 : 400,
              border: `1.5px solid ${on ? d.accent : C.border2}`,
              background: on ? `${d.accent}1A` : C.bg,
              color: on ? d.accent : C.sub, whiteSpace: "nowrap",
            }}>
              {d.icon} {d.label} <span style={{ color: on ? d.accent : P.faint, fontWeight: 400 }}>· {n}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        padding: "11px 14px", background: C.bg, borderRadius: 10, border: `0.5px solid ${C.border}`,
        fontSize: 13, color: C.sub, lineHeight: 1.65, marginBottom: "1rem",
      }}>
        {domain.blurb}
      </div>

      <StageNav stages={domain.stages} tab={tab} setTab={setTab} accent={domain.accent} />

      {Comp
        ? <Comp />
        : (
          <div style={{
            padding: "1.25rem", background: P.bg, borderRadius: 12, border: `1px solid ${P.grid}`,
            color: P.dim, fontSize: 13.5, lineHeight: 1.7,
          }}>
            This lab is not built yet. Pick another from the path above.
          </div>
        )}

      <PathFooter stages={domain.stages} tab={tab} setTab={setTab} accent={domain.accent} />
    </div>
  );
}
