import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Label, Heatmap, Bars, PixelGrid, Graph, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as N from "../../lib/nn.js";
import * as D from "../../lib/datasets.js";
import { CNN_DEPTH, TREE_DEPTH, RNN_DEPTH, SVM_DEPTH } from "../../data/labDepth.js";

const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "—");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");

// ════════════════════════════════════════════════════════════════════════════
// CNN — THE FULL STACK
// ════════════════════════════════════════════════════════════════════════════

export function CnnStackSim() {
  const [imgId, setImgId] = useState("digitSeven");
  const [stage, setStage] = useState(0);
  const [poolType, setPoolType] = useState("max");

  const img = D.IMAGES[imgId];

  // Layer 1: four hand-set filters standing in for what a first layer learns.
  const L1_FILTERS = [
    { name: "vertical edge", k: N.KERNELS.sobelX.k },
    { name: "horizontal edge", k: N.KERNELS.sobelY.k },
    { name: "blob / centre", k: N.KERNELS.laplacian.k },
    { name: "diagonal", k: N.KERNELS.emboss.k },
  ];

  const pipeline = useMemo(() => {
    const conv1 = L1_FILTERS.map((f) => N.conv2d(img.px, f.k, { padding: 1, mode: "replicate" }));
    const relu1 = conv1.map((m) => m.map((r) => r.map((v) => Math.max(0, v))));
    const pool1 = relu1.map((m) => (poolType === "max" ? N.maxPool2d(m, 2, 2).out : N.avgPool2d(m, 2, 2)));
    // Layer 2 combines layer-1 channels: sum the four pooled maps, then detect
    // structure in that combination. This is where "corners" come from.
    const summed = pool1[0].map((r, i) => r.map((_, j) => pool1.reduce((s, m) => s + Math.abs(m[i][j]), 0)));
    const conv2 = N.conv2d(summed, N.KERNELS.edgeAll.k, { padding: 1, mode: "replicate" });
    const relu2 = conv2.map((r) => r.map((v) => Math.max(0, v)));
    const pool2 = poolType === "max" ? N.maxPool2d(relu2, 2, 2).out : N.avgPool2d(relu2, 2, 2);
    const flat = pool2.flat();
    return { conv1, relu1, pool1, summed, conv2, relu2, pool2, flat };
  }, [imgId, poolType]);

  // Parameter accounting for the real thing (not the hand-set demo filters)
  const p1 = N.convShape({ inSize: 8, kernel: 3, stride: 1, padding: 1, inCh: 1, outCh: 4 });
  const p2 = N.convShape({ inSize: 4, kernel: 3, stride: 1, padding: 1, inCh: 4, outCh: 8 });
  const denseParams = pipeline.flat.length * 10 + 10;
  const totalParams = p1.params + p2.params + denseParams;

  const STAGES = [
    "The raw 8×8 image. One channel, 64 numbers.",
    "Conv layer 1: four different 3×3 filters each scan the whole image, giving four feature maps.",
    "ReLU: negatives clipped to zero. Each map now says only 'how strongly is my pattern present here'.",
    `Pool: each 2×2 block becomes one number (${poolType}). Maps halve to 4×4 — a quarter of the numbers.`,
    "Conv layer 2 looks at layer 1's OUTPUT, not the image. Because pooling doubled the stride, its receptive field on the original image is now 8×8.",
    "Pool again to 2×2. From 64 numbers down to 4 — but each of those 4 summarizes a large region.",
    "Flatten and hand to a small dense classifier. Only now does anything look at the whole image at once.",
  ];

  const rf = [1, 3, 3, 4, 8, 10, 10][stage];

  return (
    <Sim
      n={7}
      title="A CNN, End to End"
      breadcrumb="Computer vision · The whole architecture"
      hook={<>The individual operations are simple. What makes a CNN work is the <strong>stack</strong>: filters find edges, then later filters find patterns <em>among those edges</em>, and pooling keeps widening how much of the picture each unit can see while the parameter count stays tiny.</>}
      question="Follow one 8×8 digit all the way to a prediction. What does each layer actually add?"
      readout={
        <>
          Stage <strong>{stage}</strong>: {STAGES[stage]}
          {" "}Data is <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>
            {stage === 0 ? "8×8×1 = 64" : stage <= 2 ? "8×8×4 = 256" : stage === 3 ? "4×4×4 = 64" : stage <= 5 && stage >= 4 ? (stage === 4 ? "4×4×1 = 16" : "2×2×1 = 4") : "4"}
          </strong> numbers.
          {" "}A unit here sees <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{rf}×{rf}</strong> of the original image.
          {" "}Whole network: <strong style={{ fontFamily: "Consolas, monospace" }}>{totalParams.toLocaleString()}</strong> parameters
          {" "}({p1.params} + {p2.params} conv, {denseParams} dense).
        </>
      }
      notice={"Watch the receptive field column, not the pictures. It grows 1 → 3 → 4 → 8 → 10 as you go deeper, even though every kernel is only 3×3. That growth is the point of depth: a layer-2 unit judges a 8×8 region using nine weights, because it reads summaries rather than pixels.\n\nAlso notice where the parameters are. The two conv layers together are a few hundred weights; the dense head at the end is comparable to both despite doing far less. In VGG that imbalance was extreme — the dense head held the majority of the model's parameters, which is exactly why global average pooling replaced it."}
      formalName="Convolutional Neural Network"
      formalNote="Alternating convolution, non-linearity and downsampling, forming a feature hierarchy, then a small classifier head. Layer 1 learns edges regardless of the dataset; later layers learn task-specific compositions — which is precisely why transfer learning works."
      simple={CNN_DEPTH.simple}
      deep={CNN_DEPTH.deep}
    >
      <Controls>
        <Choice label="Image" value={imgId} set={setImgId} options={Object.entries(D.IMAGES).map(([id, im]) => ({ id, label: im.label }))} />
        <Choice label="Pooling" value={poolType} set={setPoolType} options={[{ id: "max", label: "Max" }, { id: "avg", label: "Average" }]} />
      </Controls>
      <StepPlayer step={stage} setStep={setStage} max={6} speed={1500} autoLabel="Walk the stack" labels={STAGES} />

      <Row>
        <Col flex="0 1 150px" min={130}>
          <PixelGrid px={img.px} cell={16} max={9} showValues={false} label="Input 8×8" />
          <Caption>1 channel</Caption>
        </Col>

        {stage >= 1 && (
          <Col flex="1 1 250px" min={230}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, marginBottom: 4, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {stage >= 2 ? "After ReLU" : "Conv 1"} — 4 feature maps
            </div>
            <Row gap={5}>
              {(stage >= 2 ? pipeline.relu1 : pipeline.conv1).map((m, i) => (
                <div key={i} style={{ flex: "0 0 auto" }}>
                  <PixelGrid px={m} cell={12} min={stage >= 2 ? 0 : Math.min(...m.flat())} max={Math.max(...m.flat())}
                    diverging={stage < 2} showValues={false} />
                  <div style={{ fontSize: 8.5, color: P.faint, textAlign: "center", marginTop: 2, lineHeight: 1.2, maxWidth: 100 }}>
                    {L1_FILTERS[i].name}
                  </div>
                </div>
              ))}
            </Row>
            <Caption>Each map is one filter's answer to "is my pattern here?"</Caption>
          </Col>
        )}

        {stage >= 3 && (
          <Col flex="0 1 200px" min={180}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, marginBottom: 4, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Pooled to 4×4
            </div>
            <Row gap={5}>
              {pipeline.pool1.map((m, i) => (
                <div key={i} style={{ flex: "0 0 auto" }}>
                  <PixelGrid px={m} cell={16} min={0} max={Math.max(...m.flat())} showValues={false} />
                </div>
              ))}
            </Row>
            <Caption>256 numbers → 64</Caption>
          </Col>
        )}

        {stage >= 4 && (
          <Col flex="0 1 170px" min={150}>
            <PixelGrid px={pipeline.relu2} cell={22} min={0} max={Math.max(...pipeline.relu2.flat())}
              showValues={false} label="Conv 2 + ReLU" />
            <Caption>Reads layer 1's maps, not pixels</Caption>
          </Col>
        )}

        {stage >= 5 && (
          <Col flex="0 1 130px" min={110}>
            <PixelGrid px={pipeline.pool2} cell={30} min={0} max={Math.max(...pipeline.pool2.flat())}
              label="Pooled 2×2" />
            <Caption>4 numbers left</Caption>
          </Col>
        )}

        {stage >= 6 && (
          <Col flex="1 1 200px" min={180}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Flattened → dense head
            </div>
            <Bars width={200} height={100} items={pipeline.flat.map((v, i) => ({ label: `f${i}`, value: v }))}
              fmt={(v) => v.toFixed(0)} colorFor={() => P.derived} />
            <Caption>These {pipeline.flat.length} numbers are the image's learned description.</Caption>
          </Col>
        )}
      </Row>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Receptive field grows with depth, using only 3×3 kernels
        </div>
        <Plot width={460} height={140} xMin={0} xMax={6} yMin={0} yMax={12}
          xLabel="stage" yLabel="pixels of original image seen" xTicks={4} yTicks={4} yFmt={(v) => v.toFixed(0)}>
          {({ sx, sy }) => (
            <g>
              <Line pts={[1, 3, 3, 4, 8, 10, 10].map((r, i) => [sx(i), sy(r)])} color={P.highlight} width={2.4} />
              {[1, 3, 3, 4, 8, 10, 10].map((r, i) => (
                <Dot key={i} cx={sx(i)} cy={sy(r)} color={i <= stage ? P.highlight : P.grid} r={4} />
              ))}
              <Dot cx={sx(stage)} cy={sy(rf)} color={P.good} r={6} halo={P.good} />
            </g>
          )}
        </Plot>
      </div>

      <Stats>
        <Stat label="Conv 1 params" value={p1.params} color={P.predict} hint="3×3×1×4 + 4" />
        <Stat label="Conv 2 params" value={p2.params} color={P.predict} hint="3×3×4×8 + 8" />
        <Stat label="Dense head" value={denseParams} color={P.derived} hint={`${pipeline.flat.length}×10 + 10`} />
        <Stat label="Total" value={totalParams.toLocaleString()} color={P.highlight} big />
        <Stat label="Receptive field" value={`${rf}×${rf}`} color={P.good} />
      </Stats>
      <Verdict tone="neutral">
        A dense network on this 8×8 image with one hidden layer of 64 would need 64×64 + 64 = <strong>4,160</strong> parameters
        for the first layer alone — and would have to relearn each pattern separately for every position. The convolutional
        stack uses {p1.params + p2.params} for both conv layers and is position-independent by construction.
      </Verdict>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LSTM GATES
// ════════════════════════════════════════════════════════════════════════════

export function LstmGatesSim() {
  const [forgetBias, setForgetBias] = useState(2);
  const [inputBias, setInputBias] = useState(0);
  const [outputBias, setOutputBias] = useState(2);
  const [step, setStep] = useState(4);

  // "The cat, which was hungry, ate" — the signal at step 1 must survive to 6.
  const inputs = [1, 0, 0, 0, 0, 0, 0, 0];
  const H = 2;

  const params = useMemo(() => {
    const mk = (v) => Array.from({ length: H }, () => [v]);
    const mkh = (v) => Array.from({ length: H }, () => Array(H).fill(v));
    return {
      Wxf: mk(0), Whf: mkh(0), bf: Array(H).fill(forgetBias),
      Wxi: mk(0), Whi: mkh(0), bi: Array(H).fill(inputBias),
      Wxo: mk(0), Who: mkh(0), bo: Array(H).fill(outputBias),
      Wxg: mk(2), Whg: mkh(0), bg: Array(H).fill(0),
    };
  }, [forgetBias, inputBias, outputBias]);

  const run = useMemo(() => N.lstmRun(inputs, params), [params]);
  const trace = run.trace;
  const cur = trace[Math.min(step, trace.length - 1)];
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const fGate = sig(forgetBias), iGate = sig(inputBias), oGate = sig(outputBias);

  const retention = trace[0].c[0] !== 0 ? cur.c[0] / trace[0].c[0] : 0;
  const cSeries = trace.map((t) => t.c[0]);
  const hSeries = trace.map((t) => t.h[0]);

  // A vanilla RNN on the same input, for comparison
  const rnnRun = useMemo(() => N.rnnRun(inputs, {
    Wxh: Array.from({ length: H }, () => [2]),
    Whh: Array.from({ length: H }, (_, i) => Array.from({ length: H }, (_, j) => (i === j ? 0.6 : 0))),
    bh: Array(H).fill(0),
  }), []);
  const rnnRetention = rnnRun.states[1][0] !== 0 ? rnnRun.states[Math.min(step + 1, rnnRun.states.length - 1)][0] / rnnRun.states[1][0] : 0;

  return (
    <Sim
      n={6}
      title="LSTM Gates"
      breadcrumb="NLP · How memory becomes deliberate"
      hook={<>A plain RNN's memory fades whether you want it to or not — it is overwritten a little at every step. An LSTM adds three <strong>gates</strong>: small sigmoid units that output between 0 and 1 and act as soft switches deciding what to keep, what to write, and what to reveal.</>}
      question="An important signal arrives at step 1. Can the gates keep it intact through seven steps of irrelevant input?"
      readout={
        <>
          Forget gate is open at <strong style={{ color: fGate > 0.8 ? P.good : P.bad, fontFamily: "Consolas, monospace" }}>{f2(fGate)}</strong>,
          {" "}input at <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(iGate)}</strong>,
          {" "}output at <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(oGate)}</strong>.
          {" "}After <strong>{step + 1}</strong> steps the memory cell holds
          {" "}<strong style={{ color: P.predict, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(cur.c[0])}</strong> —
          {" "}<strong style={{ color: retention > 0.7 ? P.good : P.bad, fontFamily: "Consolas, monospace" }}>{(retention * 100).toFixed(1)}%</strong> of what it stored at step 1.
          {" "}A vanilla RNN on the same input retains <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{(rnnRetention * 100).toFixed(1)}%</strong>.
        </>
      }
      notice={"Set the forget bias to −4. The gate closes to about 0.02 and the memory of step 1 is gone within two steps — you have built a worse RNN. Set it to +4 and the gate sits at 0.98, so the cell holds its value almost perfectly across all eight steps.\n\nThat is why the forget-gate bias is conventionally initialized to 1 rather than 0. At 0 the gate starts at 0.5, halving the memory every step, and the network must learn to remember before it can learn any long-range dependency at all. Starting it open makes remembering the default."}
      formalName="Long Short-Term Memory"
      formalNote="Two states: h (the output) and c (long-term memory). The critical design choice is that c is updated by ADDITION — c_t = f⊙c_{t−1} + i⊙g̃ — so ∂c_t/∂c_{t−1} = f. With f near 1 the gradient passes back unchanged instead of being multiplied down."
      simple={RNN_DEPTH.simple}
      deep={RNN_DEPTH.deep}
    >
      <Controls>
        <Slider label="Forget gate bias" value={forgetBias} set={setForgetBias} min={-5} max={5} step={0.5} fmt={f1} color={P.highlight}
          hint={`gate = ${f2(fGate)} — ${fGate > 0.8 ? "remembers" : fGate < 0.3 ? "erases" : "leaks"}`} />
        <Slider label="Input gate bias" value={inputBias} set={setInputBias} min={-5} max={5} step={0.5} fmt={f1} color={P.class0}
          hint={`gate = ${f2(iGate)} — ${iGate > 0.7 ? "writes freely" : "mostly blocks"}`} />
        <Slider label="Output gate bias" value={outputBias} set={setOutputBias} min={-5} max={5} step={0.5} fmt={f1} color={P.predict}
          hint={`gate = ${f2(oGate)} — ${oGate > 0.7 ? "exposes memory" : "hides memory"}`} />
      </Controls>
      <StepPlayer step={step} setStep={setStep} max={trace.length - 1} speed={750} autoLabel="Read the sequence"
        labels={trace.map((t, i) => `Step ${i + 1}: input ${inputs[i]}. Cell holds ${f3(t.c[0])}, output ${f3(t.h[0])}.`)} />

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Memory cell vs a vanilla RNN's hidden state
          </div>
          <Plot width={350} height={200} xMin={1} xMax={trace.length} yMin={-0.1} yMax={Math.max(1.1, ...cSeries) * 1.1}
            xLabel="timestep" yLabel="stored value" xTicks={4} yTicks={4} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <Line pts={cSeries.map((v, i) => [sx(i + 1), sy(v)])} color={P.good} width={2.6} />
                <Line pts={hSeries.map((v, i) => [sx(i + 1), sy(v)])} color={P.predict} width={1.8} dash="4 3" />
                <Line pts={rnnRun.states.slice(1).map((s, i) => [sx(i + 1), sy(s[0])])} color={P.bad} width={2} />
                <Dot cx={sx(step + 1)} cy={sy(cur.c[0])} color={P.highlight} r={5.5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.good, label: "LSTM cell state (c)", line: true }, { color: P.predict, label: "LSTM output (h)", dash: true },
            { color: P.bad, label: "vanilla RNN hidden state", line: true }]} />
          <Caption>The green line is flat because addition does not decay. The red one is a geometric decline.</Caption>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {inputs.map((x, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 5, fontSize: 12, fontFamily: "Consolas, monospace",
                background: i === 0 ? `${P.class0}33` : P.panel,
                border: `1px solid ${i === step ? P.highlight : P.grid}`,
                color: i === 0 ? P.text : P.faint, fontWeight: i === 0 ? 700 : 400,
              }}>{x}</div>
            ))}
          </div>
          <Caption>The signal to remember arrives at step 1. Everything after is filler.</Caption>
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gate values at step {step + 1}
          </div>
          <Bars width={300} height={120} horizontal items={[
            { label: "forget (keep old)", value: cur.f[0], color: cur.f[0] > 0.8 ? P.good : P.bad },
            { label: "input (write new)", value: cur.i[0], color: P.class0 },
            { label: "output (reveal)", value: cur.o[0], color: P.predict },
          ]} fmt={f3} maxValue={1} />
          <Caption>All three are sigmoids, so all three live in (0, 1) — soft switches, not hard ones.</Caption>

          <div style={{ marginTop: 12, padding: "10px 13px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.derived, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              The update, with this step's numbers
            </div>
            <div style={{ fontSize: 12, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.9 }}>
              c = <span style={{ color: cur.f[0] > 0.8 ? P.good : P.bad }}>{f3(cur.f[0])}</span> × {f3(step === 0 ? 0 : trace[step - 1].c[0])}
              {" + "}<span style={{ color: P.class0 }}>{f3(cur.i[0])}</span> × {f3(cur.g[0])}
              {" = "}<span style={{ color: P.highlight, fontWeight: 700 }}>{f3(cur.c[0])}</span>
              <br />
              h = <span style={{ color: P.predict }}>{f3(cur.o[0])}</span> × tanh({f3(cur.c[0])}) = <span style={{ color: P.highlight, fontWeight: 700 }}>{f3(cur.h[0])}</span>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "12px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gates over all steps
          </div>
          <Heatmap
            data={[trace.map((t) => t.f[0]), trace.map((t) => t.i[0]), trace.map((t) => t.o[0]), trace.map((t) => t.c[0])]}
            rowLabels={["forget", "input", "output", "cell"]}
            colLabels={trace.map((_, i) => `t${i + 1}`)}
            cell={33} fmt={f2} min={0} max={Math.max(1, ...cSeries)}
            highlight={(r, c) => c === step}
            colorFor={(v) => `rgba(61,217,196,${0.06 + Math.min(0.9, Math.abs(v))})`} />

          <Stats>
            <Stat label="Retained" value={`${(retention * 100).toFixed(0)}%`} color={retention > 0.7 ? P.good : P.bad} big />
            <Stat label="RNN retained" value={`${(rnnRetention * 100).toFixed(0)}%`} color={P.bad} />
          </Stats>
          {fGate > 0.9 && retention > 0.8 && (
            <Verdict tone="good">
              The cell held {(retention * 100).toFixed(0)}% across {step + 1} steps while the vanilla RNN kept {(rnnRetention * 100).toFixed(0)}%.
              Same input, same length — the difference is entirely that one path is additive.
            </Verdict>
          )}
          {fGate < 0.3 && (
            <Verdict tone="bad">
              With the forget gate at {f2(fGate)} the LSTM is erasing its own memory faster than a plain RNN would.
              The gates are only an advantage if the network learns to open them.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE KERNEL TRICK
// ════════════════════════════════════════════════════════════════════════════

export function KernelTrickSim() {
  const [lift, setLift] = useState(0);
  const [showPlane, setShowPlane] = useState(true);

  const ds = D.CIRCLES;
  // The lift: (x, y) → (x, y, x² + y²). A ring becomes a paraboloid, and a
  // FLAT plane at the right height separates inner from outer.
  const lifted = useMemo(() => ds.X.map((p) => [p[0], p[1], p[0] ** 2 + p[1] ** 2]), []);
  const zVals = lifted.map((p) => p[2]);

  const linear2D = useMemo(() => M.svmSMO(ds.X, ds.y, { C: 1, kernel: "linear" }), []);
  const linear3D = useMemo(() => M.svmSMO(lifted, ds.y, { C: 1, kernel: "linear" }), [lifted]);
  const rbf2D = useMemo(() => M.svmSMO(ds.X, ds.y, { C: 5, kernel: "rbf", gamma: 0.5 }), []);

  const acc2D = M.accuracy(ds.y, ds.X.map((p) => (linear2D.decide(p) >= 0 ? 1 : 0)));
  const acc3D = M.accuracy(ds.y, lifted.map((p) => (linear3D.decide(p) >= 0 ? 1 : 0)));
  const accRbf = M.accuracy(ds.y, ds.X.map((p) => (rbf2D.decide(p) >= 0 ? 1 : 0)));

  // Threshold on z that separates the classes — the plane's height
  const innerMax = Math.max(...zVals.filter((_, i) => ds.y[i] === 0));
  const outerMin = Math.min(...zVals.filter((_, i) => ds.y[i] === 1));
  const planeZ = (innerMax + outerMin) / 2;

  // Kernel values: same numbers the SVM actually uses
  const kSameClass = M.rbf(ds.X[0], ds.X[1], 0.5);
  const iOther = ds.y.findIndex((v) => v !== ds.y[0]);
  const kDiffClass = M.rbf(ds.X[0], ds.X[iOther], 0.5);

  const t = lift / 100;

  return (
    <Sim
      n={12}
      title="The Kernel Trick"
      breadcrumb="Core ML · How SVMs curve"
      hook={<>These two groups form a ring inside a ring. No straight line can separate them — you can verify that by eye. But add a third coordinate, <strong>distance from the centre squared</strong>, and the inner group sinks while the outer group rises. Now a <em>flat</em> plane cuts cleanly between them.</>}
      question="Does the SVM have to compute that third coordinate — or can it get the same answer without ever leaving 2D?"
      readout={
        <>
          A straight line in the original 2D space manages only
          {" "}<strong style={{ color: P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{(acc2D * 100).toFixed(1)}%</strong> accuracy.
          {" "}Add the third coordinate z = x² + y² and a <em>flat plane</em> at height
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(planeZ)}</strong> reaches
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{(acc3D * 100).toFixed(1)}%</strong>.
          {" "}An RBF kernel in the original 2D space reaches
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{(accRbf * 100).toFixed(1)}%</strong> using
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{rbf2D.supportVectors.length}</strong> support vectors —
          {" "}<strong>without computing a single coordinate in any higher space.</strong>
        </>
      }
      notice={"Drag the lift slider and watch the ring turn into a bowl. That is the transformation made literal — and it is the picture worth carrying into an interview.\n\nThe trick is that the SVM's dual form only ever touches the data through dot products. Replace each dot product with a similarity function and you have implicitly moved to whatever space that function corresponds to. For the RBF kernel that space is infinite-dimensional, so computing coordinates there is not merely expensive — it is impossible. The kernel sidesteps the question entirely."}
      formalName="The kernel trick (Mercer's theorem)"
      formalNote="Any positive semi-definite similarity function corresponds to an inner product in some feature space. Since the SVM dual depends on data only via xᵢᵀxⱼ, substituting K(xᵢ,xⱼ) trains in that space at the cost of evaluating K — never of visiting it."
      simple={SVM_DEPTH.simple}
      deep={SVM_DEPTH.deep}
    >
      <Controls>
        <Slider label="Lift into the third dimension" value={lift} set={setLift} min={0} max={100} step={1} unit="%" color={P.highlight}
          hint={t === 0 ? "flat, original 2D" : t === 1 ? "fully lifted" : "in between"} />
        <Toggle label="Show separating plane" on={showPlane} set={setShowPlane} color={P.good} />
      </Controls>

      <Row>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The original 2D view — no line works
          </div>
          <Plot width={330} height={280} xMin={-4.5} xMax={4.5} yMin={-4.5} yMax={4.5} xLabel="Sensor A" yLabel="Sensor B">
            {({ sx, sy }) => {
              const [w1, w2] = linear2D.w, b = linear2D.b;
              return (
                <g>
                  {Math.abs(w2) > 1e-9 && (
                    <Line pts={[[sx(-4.5), sy((-b - w1 * -4.5) / w2)], [sx(4.5), sy((-b - w1 * 4.5) / w2)]]}
                      color={P.bad} width={2.2} />
                  )}
                  {ds.X.map((p, i) => {
                    const wrong = (linear2D.decide(p) >= 0 ? 1 : 0) !== ds.y[i];
                    return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.8}
                      halo={wrong ? P.bad : null} />;
                  })}
                </g>
              );
            }}
          </Plot>
          <Caption>The best straight line available, and it is hopeless: {(acc2D * 100).toFixed(0)}% accuracy. Circled points are wrong.</Caption>
        </Col>

        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Lifted: side view of (x, z) where z = x² + y²
          </div>
          <Plot width={350} height={280} xMin={-4.5} xMax={4.5} yMin={-2} yMax={20}
            xLabel="Sensor A" yLabel="height = A² + B²" yTicks={5} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                {showPlane && t > 0.15 && (
                  <>
                    <line x1={sx(-4.5)} y1={sy(planeZ * t)} x2={sx(4.5)} y2={sy(planeZ * t)}
                      stroke={P.good} strokeWidth="2.4" />
                    <Label x={sx(-4.3)} y={sy(planeZ * t) - 6} size={10.5} color={P.good}>a flat plane at z = {f2(planeZ)}</Label>
                  </>
                )}
                {lifted.map((p, i) => (
                  <Dot key={i} cx={sx(p[0])} cy={sy(p[2] * t)} color={ds.y[i] ? P.class1 : P.class0} r={3.8} />
                ))}
              </g>
            )}
          </Plot>
          <Caption>
            {t < 0.15 ? "Slide the lift up to separate them by height." : `Blue sinks to the bottom, red rises to the rim. A horizontal cut at ${f2(planeZ)} separates them perfectly.`}
          </Caption>
        </Col>
      </Row>

      <Row>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "8px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Three ways to attack the same problem
          </div>
          <Bars width={310} height={130} horizontal items={[
            { label: "Linear, 2D", value: acc2D, color: P.bad },
            { label: "Linear, lifted to 3D", value: acc3D, color: P.good },
            { label: "RBF kernel, still 2D", value: accRbf, color: P.good },
          ]} fmt={(v) => `${(v * 100).toFixed(1)}%`} maxValue={1} />
          <Caption>The last two agree — but only the middle one paid to build a new coordinate.</Caption>
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "8px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What the kernel actually returns
          </div>
          <div style={{ padding: "11px 14px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.text, lineHeight: 1.95 }}>
            <div style={{ color: P.faint, fontSize: 11, fontFamily: "var(--font-sans)", marginBottom: 5 }}>
              K(a, b) = exp(−γ‖a − b‖²), γ = 0.5
            </div>
            <div>
              two points, <span style={{ color: P.class0 }}>same ring</span>:
              {" "}K = <span style={{ color: P.good, fontWeight: 700 }}>{f3(kSameClass)}</span>
            </div>
            <div>
              two points, <span style={{ color: P.class1 }}>different rings</span>:
              {" "}K = <span style={{ color: P.bad, fontWeight: 700 }}>{f3(kDiffClass)}</span>
            </div>
          </div>
          <Note>
            That is the entire computation — one number per pair, from the original 2D coordinates. High for nearby
            points, low for distant ones. The SVM never learns what the higher-dimensional space looks like, and it
            never needs to.
          </Note>
          <Stats>
            <Stat label="Support vectors" value={`${rbf2D.supportVectors.length}/${ds.X.length}`} color={P.highlight} />
            <Stat label="Dimensions computed" value="2" color={P.good} hint="never left the plane" />
          </Stats>
        </Col>
      </Row>
      <Verdict tone="good">
        For the RBF kernel the implied feature space is <strong>infinite-dimensional</strong>. You could not build those
        coordinates if you tried — and the ½‖w‖² term still bounds complexity, which is why training in an infinite space
        does not automatically overfit.
      </Verdict>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TREE SPLIT SEARCH
// ════════════════════════════════════════════════════════════════════════════

export function TreeCriteriaSim() {
  const [criterion, setCriterion] = useState("gini");
  const [feature, setFeature] = useState(0);
  const [minGain, setMinGain] = useState(0);
  const [depth, setDepth] = useState(3);
  const [setId, setSetId] = useState("loan");

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const imp = criterion === "entropy" ? M.entropy : M.gini;

  // Every candidate threshold on the chosen feature, with its actual gain.
  const candidates = useMemo(() => {
    const vals = [...new Set(ds.X.map((p) => p[feature]))].sort((a, b) => a - b);
    const counts = (rows) => {
      const c = [0, 0];
      rows.forEach((i) => { c[ds.y[i]]++; });
      return c;
    };
    const all = ds.X.map((_, i) => i);
    const parentImp = imp(counts(all));
    return vals.slice(0, -1).map((v, vi) => {
      const thr = (v + vals[vi + 1]) / 2;
      const L = all.filter((i) => ds.X[i][feature] <= thr);
      const R = all.filter((i) => ds.X[i][feature] > thr);
      const weighted = (L.length * imp(counts(L)) + R.length * imp(counts(R))) / all.length;
      return { thr, gain: parentImp - weighted, nL: L.length, nR: R.length,
        impL: imp(counts(L)), impR: imp(counts(R)), parentImp };
    });
  }, [setId, feature, criterion]);

  const best = candidates.reduce((a, b) => (b.gain > a.gain ? b : a), candidates[0]);
  const tree = useMemo(() => M.buildTree(ds.X, ds.y, { maxDepth: depth, nClasses: 2, criterion, minGain }), [setId, depth, criterion, minGain]);
  const acc = M.accuracy(ds.y, ds.X.map((p) => M.treePredict(tree, p)));
  const leaves = M.countLeaves(tree);

  // Impurity curve: how the measure behaves as class balance changes
  const curve = Array.from({ length: 51 }, (_, i) => {
    const p = i / 50;
    return { p, gini: M.gini([p * 100, (1 - p) * 100]), entropy: M.entropy([p * 100, (1 - p) * 100]) };
  });

  // Split counts per feature, as a crude importance signal
  const featureUse = useMemo(() => {
    const used = [0, 0];
    const walk = (nd) => { if (!nd.leaf) { used[nd.feature] += nd.n; walk(nd.left); walk(nd.right); } };
    walk(tree);
    const tot = used[0] + used[1];
    return used.map((u) => (tot === 0 ? 0 : u / tot));
  }, [tree]);

  return (
    <Sim
      n={13}
      title="How a Tree Picks Its Question"
      breadcrumb="Core ML · Inside the split search"
      hook={<>A tree does not guess its questions. For every feature, it tries <strong>every threshold between two neighbouring values</strong>, scores how much purer the two resulting piles are, and keeps the best. That exhaustive search is the whole training algorithm — no gradients, no iteration.</>}
      question={`On ${feature === 0 ? ds.xLabel : ds.yLabel}, there are ${candidates.length} candidate thresholds. Which one wins, and by how much?`}
      readout={
        <>
          Parent impurity is <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(best.parentImp)}</strong>.
          {" "}The best threshold is <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(best.thr)}</strong>,
          {" "}splitting {ds.X.length} points into <strong style={{ fontFamily: "Consolas, monospace" }}>{best.nL}</strong> (impurity {f3(best.impL)})
          {" "}and <strong style={{ fontFamily: "Consolas, monospace" }}>{best.nR}</strong> (impurity {f3(best.impR)}),
          {" "}for a gain of <strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(best.gain)}</strong>.
          {" "}The worst candidate gains only <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(Math.min(...candidates.map((c) => c.gain)))}</strong>.
          {" "}Full tree at depth {depth}: <strong style={{ fontFamily: "Consolas, monospace" }}>{leaves}</strong> leaves, {f2(acc)} accuracy.
        </>
      }
      notice={"Switch between Gini and entropy and watch the chosen threshold. It usually does not move. Both measures peak at a 50/50 split and hit zero at purity; entropy is slightly more aggressive because of the logarithm, but the split it picks is almost always the same one. That is why 'which criterion' is not a real tuning knob — and saying so is a stronger answer than inventing a preference.\n\nNow raise the minimum gain. Splits worth less than the threshold are refused and the tree shrinks. That is pre-pruning, and it is myopic: it can refuse a split that looks worthless on its own but would have unlocked a good one below it. XOR is the extreme case — every first split there gains exactly zero."}
      formalName="Exhaustive split search with an impurity criterion (CART)"
      formalNote="For each feature and each midpoint between sorted unique values, compute the size-weighted child impurity and keep the largest decrease. Cost is O(n·d·log n) per node with pre-sorting — which is why trees scale well despite the search being exhaustive."
      simple={TREE_DEPTH.simple}
      deep={TREE_DEPTH.deep}
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={[{ id: "loan", label: "Loans" }, { id: "spam", label: "Spam" }, { id: "moons", label: "Moons" }, { id: "xor", label: "XOR" }]} />
        <Choice label="Search on" value={String(feature)} set={(v) => setFeature(Number(v))}
          options={[{ id: "0", label: ds.xLabel }, { id: "1", label: ds.yLabel }]} />
        <Choice label="Criterion" value={criterion} set={setCriterion} options={[{ id: "gini", label: "Gini" }, { id: "entropy", label: "Entropy" }]} />
      </Controls>
      <Controls>
        <Slider label="Max depth" value={depth} set={setDepth} min={1} max={8} step={1} color={P.predict}
          hint={`${leaves} leaves`} />
        <Slider label="Minimum gain to split" value={minGain} set={setMinGain} min={0} max={0.2} step={0.005} fmt={f3} color={P.derived}
          hint={minGain === 0 ? "sklearn default — takes zero-gain splits" : "pre-pruning active"} />
      </Controls>

      <Row>
        <Col flex="1 1 350px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gain at every candidate threshold
          </div>
          <Plot width={360} height={210}
            xMin={Math.min(...candidates.map((c) => c.thr))} xMax={Math.max(...candidates.map((c) => c.thr))}
            yMin={Math.min(0, ...candidates.map((c) => c.gain))} yMax={Math.max(...candidates.map((c) => c.gain)) * 1.15}
            xLabel={feature === 0 ? ds.xLabel : ds.yLabel} yLabel="impurity decrease" xTicks={4} yTicks={4} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                {minGain > 0 && (
                  <line x1={sx(Math.min(...candidates.map((c) => c.thr)))} y1={sy(minGain)}
                    x2={sx(Math.max(...candidates.map((c) => c.thr)))} y2={sy(minGain)}
                    stroke={P.derived} strokeWidth="1.4" strokeDasharray="4 3" />
                )}
                <Line pts={candidates.map((c) => [sx(c.thr), sy(c.gain)])} color={P.predict} width={1.8} />
                {candidates.map((c, i) => (
                  <Dot key={i} cx={sx(c.thr)} cy={sy(c.gain)} color={c.gain < minGain ? P.grid : P.predict} r={2.4} />
                ))}
                <Dot cx={sx(best.thr)} cy={sy(best.gain)} color={P.highlight} r={6} halo={P.highlight} />
                <Label x={sx(best.thr) + 9} y={sy(best.gain) - 7} size={10.5} color={P.highlight}>best: {f2(best.thr)}</Label>
              </g>
            )}
          </Plot>
          <Caption>Every dot is one threshold the tree actually evaluated. Grey dots fall below your minimum gain.</Caption>
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gini vs entropy, as class balance changes
          </div>
          <Plot width={310} height={175} xMin={0} xMax={1} yMin={0} yMax={1.05}
            xLabel="fraction of class red" yLabel="impurity" xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <Line pts={curve.map((c) => [sx(c.p), sy(c.gini)])} color={criterion === "gini" ? P.highlight : P.faint} width={criterion === "gini" ? 2.6 : 1.4} />
                <Line pts={curve.map((c) => [sx(c.p), sy(c.entropy)])} color={criterion === "entropy" ? P.highlight : P.faint} width={criterion === "entropy" ? 2.6 : 1.4} />
                <Label x={sx(0.52)} y={sy(0.52)} size={10} color={P.faint}>Gini max 0.5</Label>
                <Label x={sx(0.52)} y={sy(1.0) + 12} size={10} color={P.faint}>Entropy max 1.0 bit</Label>
              </g>
            )}
          </Plot>
          <Caption>Same shape, different scale. Both are zero at pure and maximal at 50/50.</Caption>
          <Stats>
            <Stat label="Best gain" value={f3(best.gain)} color={P.good} big />
            <Stat label="Leaves" value={leaves} color={P.text} />
            <Stat label="Accuracy" value={f2(acc)} color={acc === 1 ? P.good : P.highlight} />
          </Stats>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Which feature the tree relies on
          </div>
          <Bars width={300} height={80} horizontal items={[
            { label: ds.xLabel, value: featureUse[0], color: P.class0 },
            { label: ds.yLabel, value: featureUse[1], color: P.class1 },
          ]} fmt={(v) => `${(v * 100).toFixed(0)}%`} maxValue={1} />
          <Caption>Share of split decisions, weighted by samples affected — the basis of default feature importance.</Caption>
        </Col>
      </Row>
      {setId === "xor" && (
        <Verdict tone={best.gain < 0.02 ? "warn" : "neutral"}>
          The best split available on {feature === 0 ? ds.xLabel : ds.yLabel} gains only
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f3(best.gain)}</strong> — XOR's defining property is
          that neither feature carries information alone. On this <em>noisy</em> 64-point version the greedy root split
          therefore follows whatever small imbalance the noise happens to offer, so depth {depth} reaches only
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(acc)}</strong>; push the depth to 4 or more and it
          recovers the four quadrants.
          {" "}On the textbook <em>clean</em> 4-point XOR the effect is exact: every first split gains precisely 0, and a
          depth-2 tree reaches 1.00 <strong>only</strong> because scikit-learn's default accepts zero-gain splits. Set a
          minimum gain above 0 there and it collapses to a stump at 0.50.
        </Verdict>
      )}
      {setId !== "xor" && minGain > best.gain && (
        <Verdict tone="bad">
          Your minimum gain ({f3(minGain)}) exceeds the best available gain ({f3(best.gain)}), so the tree refuses to
          split at all — {leaves} {leaves === 1 ? "leaf" : "leaves"}, {f2(acc)} accuracy. Pre-pruning set too aggressively
          does not simplify the model, it deletes it.
        </Verdict>
      )}
    </Sim>
  );
}

export const CNN_STACK_SIM = { id: "cnnstack", label: "A CNN End to End", Comp: CnnStackSim };
export const LSTM_SIM = { id: "lstm", label: "LSTM Gates", Comp: LstmGatesSim };
export const KERNEL_SIM = { id: "kernel", label: "The Kernel Trick", Comp: KernelTrickSim };
export const TREE_CRITERIA_SIM = { id: "treecriteria", label: "How a Tree Picks Its Question", Comp: TreeCriteriaSim };

export const ARCHITECTURE_SIMS = [CNN_STACK_SIM, LSTM_SIM, KERNEL_SIM, TREE_CRITERIA_SIM];
