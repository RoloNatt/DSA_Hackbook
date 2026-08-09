import { C } from "./MLWidgets.jsx";
import { P } from "./SimKit.jsx";
import { StageNav, PathFooter } from "./PathNav.jsx";
import { LABS_STAGES } from "../data/paths.js";
import { CORE_ML_SIMS } from "./sims/CoreML.jsx";

// Interactive simulators.
//
// Every number on screen is computed by the verified implementations in
// src/lib — nothing here is illustrative. One lab at a time, deliberately:
// the teaching spec's pacing rule is a hard budget per concept.

const REGISTRY = Object.fromEntries(CORE_ML_SIMS.map((s) => [s.id, s.Comp]));

const ACCENT = "#E91E8C";

export default function LabsSection({ tab, setTab }) {
  const Comp = REGISTRY[tab];

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px", color: C.text }}>
          🔬 Interactive Labs
        </h2>
        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>
          Each model below is genuinely running in your browser — real gradient descent, a real SMO solver, real
          convolution arithmetic. Move a control and every number, diagram and graph recomputes together. Each lab
          opens with a concrete scenario, builds the mechanism one piece at a time, and always states its result in
          plain words before naming the formal term.
        </p>
      </div>

      <StageNav stages={LABS_STAGES} tab={tab} setTab={setTab} accent={ACCENT} />

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

      <PathFooter stages={LABS_STAGES} tab={tab} setTab={setTab} accent={ACCENT} />
    </div>
  );
}
