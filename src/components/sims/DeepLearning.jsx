import { useState, useMemo, useEffect, useRef } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Guide, Label, Regions, Heatmap, Bars, Graph, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as N from "../../lib/nn.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");
const f4 = (v) => (Number.isFinite(v) ? v.toFixed(4) : "—");

function bounds(X, padFrac = 0.14) {
  const xs = X.map((p) => p[0]), ys = X.map((p) => p[1]);
  const xr = Math.max(...xs) - Math.min(...xs), yr = Math.max(...ys) - Math.min(...ys);
  return {
    xMin: Math.min(...xs) - xr * padFrac, xMax: Math.max(...xs) + xr * padFrac,
    yMin: Math.min(...ys) - yr * padFrac, yMax: Math.max(...ys) + yr * padFrac,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ONE NEURON
// ════════════════════════════════════════════════════════════════════════════

export function NeuronSim() {
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-0.5);
  const [bias, setBias] = useState(0.2);
  const [act, setAct] = useState("sigmoid");
  const [in1, setIn1] = useState(1.5);
  const [in2, setIn2] = useState(2);

  const A = N.ACTIVATIONS[act];
  const z = w1 * in1 + w2 * in2 + bias;
  const out = A.f(z);

  const curve = Array.from({ length: 90 }, (_, i) => { const x = -6 + (i / 89) * 12; return [x, A.f(x)]; });
  const yLo = Math.min(...curve.map((c) => c[1])) - 0.2, yHi = Math.max(...curve.map((c) => c[1])) + 0.2;

  return (
    <Sim
      n={1}
      title="A Single Neuron"
      breadcrumb="Deep learning · The building block"
      hook={<>Two measurements come in — say a tumour's <strong style={{ color: P.class0 }}>size</strong> ({in1} cm) and a patient's <strong style={{ color: P.class0 }}>age</strong> ({in2} decades). The neuron multiplies each by an importance weight, adds them up with an offset, then squashes the total into a decision.</>}
      question="Three numbers of your choosing — two weights and one bias. What does the neuron output?"
      readout={
        <>
          Weighted sum: <strong style={{ fontFamily: "Consolas, monospace" }}>({f2(w1)} × {f2(in1)}) + ({f2(w2)} × {f2(in2)}) + {f2(bias)} = <span style={{ color: P.highlight }}>{f2(z)}</span></strong>.
          {" "}Squashed through {A.label}: <strong style={{ color: P.predict, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(out)}</strong>.
          {" "}Slope there is <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(A.df(z))}</strong> — that number is how much this neuron can still learn.
          {A.df(z) < 0.02 && <strong style={{ color: P.bad }}> Nearly zero: this neuron is saturated and effectively frozen.</strong>}
        </>
      }
      notice={"Push both weights up until the sum passes about 5. The output flattens at 1.0 and the slope collapses to near zero — the neuron is now saturated, and because learning is proportional to that slope, it stops responding to training. That is the whole reason sigmoid fell out of favour for hidden layers.\n\nSwitch to ReLU and set the sum negative. The slope becomes exactly 0, not just small. A neuron stuck there never recovers: the dead-ReLU problem."}
      formalName="An artificial neuron (perceptron with a non-linear activation)"
      formalNote="A dot product plus a bias, passed through a non-linearity. Every network in existence is millions of these, arranged in layers."
    >
      <Controls>
        <Slider label="Input 1 (size)" value={in1} set={setIn1} min={-4} max={4} step={0.1} fmt={f2} color={P.class0} />
        <Slider label="Input 2 (age)" value={in2} set={setIn2} min={-4} max={4} step={0.1} fmt={f2} color={P.class0} />
        <Choice label="Activation" value={act} set={setAct} options={Object.entries(N.ACTIVATIONS).map(([id, a]) => ({ id, label: a.label }))} />
      </Controls>
      <Controls>
        <Slider label="Weight 1" value={w1} set={setW1} min={-3} max={3} step={0.05} fmt={f2} color={P.predict} />
        <Slider label="Weight 2" value={w2} set={setW2} min={-3} max={3} step={0.05} fmt={f2} color={P.predict} />
        <Slider label="Bias" value={bias} set={setBias} min={-3} max={3} step={0.05} fmt={f2} color={P.derived} />
      </Controls>

      <Row>
        <Col flex="1 1 320px">
          <Graph width={340} height={190}
            nodes={[
              { x: 40, y: 55, r: 20, fill: P.class0Fill, stroke: P.class0, text: f2(in1), label: "size" },
              { x: 40, y: 135, r: 20, fill: P.class0Fill, stroke: P.class0, text: f2(in2), label: "age" },
              { x: 170, y: 95, r: 27, fill: P.panel, stroke: P.highlight, strokeWidth: 2.4, text: f2(z), label: "sum + bias" },
              { x: 295, y: 95, r: 24, fill: `${P.predict}22`, stroke: P.predict, strokeWidth: 2.4, text: f3(out), label: A.label },
            ]}
            edges={[
              { x1: 60, y1: 55, x2: 145, y2: 88, color: w1 >= 0 ? P.class0 : P.class1, width: 1 + Math.abs(w1) * 1.9, label: f2(w1) },
              { x1: 60, y1: 135, x2: 145, y2: 102, color: w2 >= 0 ? P.class0 : P.class1, width: 1 + Math.abs(w2) * 1.9, label: f2(w2) },
              { x1: 197, y1: 95, x2: 271, y2: 95, color: P.highlight, width: 2 },
            ]}
          >
            <text x={170} y={162} fill={P.derived} fontSize="9.5" textAnchor="middle" fontFamily="Consolas, monospace">bias {f2(bias)}</text>
          </Graph>
          <Caption>Edge thickness is weight magnitude; blue is positive, red negative. This is the entire computation.</Caption>
        </Col>
        <Col flex="1 1 300px">
          <Plot width={310} height={200} xMin={-6} xMax={6} yMin={yLo} yMax={yHi} xLabel="weighted sum (z)" yLabel="output" yTicks={4}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(0)} y1={sy(yLo)} x2={sx(0)} y2={sy(yHi)} stroke={P.grid} strokeWidth="1" />
                <Line pts={curve.map(([x, y]) => [sx(x), sy(y)])} color={P.predict} width={2.4} />
                {/* the derivative, scaled, to show where learning is possible */}
                <Line pts={Array.from({ length: 90 }, (_, i) => { const x = -6 + (i / 89) * 12; return [sx(x), sy(yLo + A.df(x) * (yHi - yLo) * 0.5)]; })}
                  color={P.derived} width={1.4} dash="4 3" />
                <Guide sx={sx} sy={sy} x={z} y={out} xMin={-6} yMin={yLo} />
                <Dot cx={sx(z)} cy={sy(out)} color={P.highlight} r={6} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.predict, label: "output", line: true }, { color: P.derived, label: "slope (learning ability)", dash: true }, { color: P.highlight, label: "you are here" }]} />
          <Stats>
            <Stat label="Sum (z)" value={f2(z)} color={P.highlight} />
            <Stat label="Output" value={f3(out)} color={P.predict} />
            <Stat label="Slope" value={f3(A.df(z))} color={A.df(z) < 0.02 ? P.bad : P.derived} hint={A.df(z) < 0.02 ? "frozen" : "can learn"} />
          </Stats>
          <Note>{A.note}</Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. WHY NON-LINEARITY IS MANDATORY
// ════════════════════════════════════════════════════════════════════════════

export function LinearCollapseSim() {
  const [act, setAct] = useState("linear");
  const [layers, setLayers] = useState(2);
  const [width, setWidth] = useState(6);
  const [epoch, setEpoch] = useState(0);
  const [running, setRunning] = useState(false);

  const ds = D.XOR_QUADRANTS;
  const netRef = useRef(null);
  const [tick, setTick] = useState(0);

  const key = `${act}-${layers}-${width}`;
  useEffect(() => {
    netRef.current = N.makeMLP({ inputDim: 2, hidden: Array(layers).fill(width), activation: act, seed: 7 });
    setEpoch(0); setTick((t) => t + 1);
  }, [key]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const net = netRef.current;
      if (!net) return;
      for (let i = 0; i < 25; i++) N.trainStep(net, ds.X, ds.y, { lr: 0.05, optimizer: "adam" });
      setEpoch((e) => e + 25);
      setTick((t) => t + 1);
    }, 60);
    return () => clearInterval(id);
  }, [running, ds]);

  const net = netRef.current;
  const ev = net ? N.evaluate(net, ds.X, ds.y) : { loss: 0, accuracy: 0 };
  const bb = bounds(ds.X);
  const grid = useMemo(() => (net ? M.decisionGrid((p) => N.predict(net, p), { ...bb, res: 32 }) : null), [tick]);

  return (
    <Sim
      n={2}
      title="Why Networks Need a Curve"
      breadcrumb="Deep learning · The key idea"
      hook={<>These four clusters follow one rule: diagonal corners belong together. Neither feature alone tells you anything — each is 50/50 useless on its own.</>}
      question="Can stacking more layers solve this, or does something else have to change?"
      readout={
        <>
          {N.ACTIVATIONS[act].label} activation, <strong>{layers}</strong> hidden {layers === 1 ? "layer" : "layers"} of <strong>{width}</strong>,
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{net?.nParams}</strong> parameters, trained <strong style={{ fontFamily: "Consolas, monospace" }}>{epoch}</strong> steps:
          {" "}accuracy <strong style={{ color: ev.accuracy > 0.95 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f2(ev.accuracy)}</strong>,
          {" "}loss <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(ev.loss)}</strong>.
          {act === "linear" && ev.accuracy <= 0.75 && <strong style={{ color: P.bad }}> Stuck at chance level, and more layers will not help.</strong>}
          {act !== "linear" && ev.accuracy > 0.95 && <strong style={{ color: P.good }}> Solved — the boundary is now curved.</strong>}
        </>
      }
      notice={"Start with the linear activation and 3 layers of 8. Train it as long as you like: it will not beat 0.5, because stacked linear layers collapse algebraically into a single linear layer. W₃(W₂(W₁x)) is just (W₃W₂W₁)x — one matrix. Depth without a non-linearity buys literally nothing.\n\nNow switch to tanh with the same shape. It solves it. The activation function is not a detail; it is the thing that makes depth mean anything."}
      formalName="The universal approximation requirement"
      formalNote="A network with at least one hidden layer and a non-polynomial activation can approximate any continuous function. Remove the non-linearity and the entire network is equivalent to one matrix multiply."
    >
      <Controls>
        <Choice label="Activation" value={act} set={setAct} options={[{ id: "linear", label: "linear (none)" }, { id: "tanh", label: "tanh" }, { id: "relu", label: "ReLU" }, { id: "sigmoid", label: "sigmoid" }]} />
        <Slider label="Hidden layers" value={layers} set={setLayers} min={1} max={4} step={1} color={P.highlight} />
        <Slider label="Neurons per layer" value={width} set={setWidth} min={2} max={12} step={1} color={P.predict} />
        <Toggle label={running ? "Training…" : "Train"} on={running} set={setRunning} color={P.good} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <Plot width={320} height={280} {...bb} xLabel="Feature A" yLabel="Feature B">
            {({ sx, sy }) => (
              <g>
                {grid && <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.85} />}
                {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.6} />)}
              </g>
            )}
          </Plot>
          <Caption>{act === "linear" ? "A straight cut — the best a linear stack can ever do." : "Curved regions, learned from the data."}</Caption>
        </Col>
        <Col flex="1 1 280px">
          <Stats>
            <Stat label="Accuracy" value={f2(ev.accuracy)} color={ev.accuracy > 0.95 ? P.good : P.bad} big />
            <Stat label="Loss" value={f3(ev.loss)} color={P.highlight} />
          </Stats>
          <Stats>
            <Stat label="Steps" value={epoch} color={P.text} />
            <Stat label="Parameters" value={net?.nParams ?? 0} color={P.derived} />
          </Stats>
          {act === "linear" && (
            <Verdict tone="bad">
              Stacked linear layers collapse: W₃(W₂(W₁x)) = (W₃W₂W₁)x. You have {net?.nParams} parameters expressing what 3 could. Adding depth changes nothing.
            </Verdict>
          )}
          {act !== "linear" && ev.accuracy > 0.95 && (
            <Verdict tone="good">
              The same architecture, one function changed, and now it works. Each hidden neuron bends space a little; enough bends make the diagonal rule expressible.
            </Verdict>
          )}
          <Note>Set the activation to linear and try every layer/width combination. Nothing reaches 1.00. That negative result is worth more than a proof.</Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. NEURAL NETWORK PLAYGROUND
// ════════════════════════════════════════════════════════════════════════════

export function MlpPlaygroundSim() {
  const [setId, setSetId] = useState("moons");
  const [layers, setLayers] = useState(2);
  const [width, setWidth] = useState(6);
  const [act, setAct] = useState("tanh");
  const [opt, setOpt] = useState("adam");
  const [lr, setLr] = useState(0.05);
  const [running, setRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState([]);

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const netRef = useRef(null);

  const key = `${setId}-${layers}-${width}-${act}-${opt}`;
  const reset = () => {
    netRef.current = N.makeMLP({ inputDim: 2, hidden: Array(layers).fill(width), activation: act, seed: 11 });
    setEpoch(0); setHistory([]); setTick((t) => t + 1);
  };
  useEffect(reset, [key]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const net = netRef.current;
      if (!net) return;
      let last = null;
      for (let i = 0; i < 15; i++) last = N.trainStep(net, ds.X, ds.y, { lr, optimizer: opt });
      setEpoch((e) => {
        const ne = e + 15;
        setHistory((h) => [...h.slice(-160), { epoch: ne, loss: last.loss, gradNorms: last.gradNorms }]);
        return ne;
      });
      setTick((t) => t + 1);
    }, 55);
    return () => clearInterval(id);
  }, [running, lr, opt, ds]);

  const net = netRef.current;
  const ev = net ? N.evaluate(net, ds.X, ds.y) : { loss: 0, accuracy: 0 };
  const bb = bounds(ds.X);
  const grid = useMemo(() => (net ? M.decisionGrid((p) => N.predict(net, p), { ...bb, res: 34 }) : null), [tick]);
  const maxLoss = Math.max(...history.map((h) => h.loss), 0.8);

  // Architecture diagram driven by the actual weights
  const diagram = useMemo(() => {
    if (!net) return { nodes: [], edges: [] };
    const nodes = [], edges = [];
    const colX = net.sizes.map((_, l) => 34 + (l * 300) / Math.max(1, net.sizes.length - 1));
    net.sizes.forEach((sz, l) => {
      const shown = Math.min(sz, 8);
      for (let i = 0; i < shown; i++) {
        const y = 22 + (i * 150) / Math.max(1, shown - 1 || 1);
        nodes.push({
          x: colX[l], y: shown === 1 ? 97 : y, r: 9,
          fill: l === 0 ? P.class0Fill : l === net.sizes.length - 1 ? `${P.predict}22` : P.panel,
          stroke: l === 0 ? P.class0 : l === net.sizes.length - 1 ? P.predict : P.axis,
          strokeWidth: 1.4, text: null,
        });
      }
    });
    let off = 0;
    net.sizes.slice(0, -1).forEach((sz, l) => {
      const shownA = Math.min(sz, 8), shownB = Math.min(net.sizes[l + 1], 8);
      const baseA = off, baseB = off + shownA;
      for (let i = 0; i < shownA; i++) {
        for (let j = 0; j < shownB; j++) {
          const w = net.W[l][j]?.[i] ?? 0;
          if (Math.abs(w) < 0.05) continue;
          edges.push({
            x1: nodes[baseA + i].x + 9, y1: nodes[baseA + i].y,
            x2: nodes[baseB + j].x - 9, y2: nodes[baseB + j].y,
            color: w >= 0 ? P.class0 : P.class1,
            width: Math.min(3, 0.3 + Math.abs(w) * 0.85),
            opacity: Math.min(0.85, 0.15 + Math.abs(w) * 0.3),
          });
        }
      }
      off = baseB;
    });
    return { nodes, edges };
  }, [tick]);

  return (
    <Sim
      n={3}
      title="Neural Network Playground"
      breadcrumb="Deep learning · Training live"
      hook={<>A real network, training in your browser right now. Blue edges are positive weights, red negative, and thickness is magnitude — you are watching the actual numbers change.</>}
      question="How much network does this shape really need — and what does too much look like?"
      readout={
        <>
          <strong>{layers}×{width}</strong> {N.ACTIVATIONS[act].label} network, <strong style={{ fontFamily: "Consolas, monospace" }}>{net?.nParams}</strong> parameters,
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{epoch}</strong> steps of {opt}:
          {" "}accuracy <strong style={{ color: ev.accuracy > 0.95 ? P.good : ev.accuracy > 0.8 ? P.highlight : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f2(ev.accuracy)}</strong>,
          {" "}loss <strong style={{ fontFamily: "Consolas, monospace" }}>{f4(ev.loss)}</strong>.
          {history.length > 1 && <> Gradient reaching the first layer: <strong style={{ fontFamily: "Consolas, monospace" }}>{history[history.length - 1].gradNorms[0]?.toExponential(1)}</strong>.</>}
        </>
      }
      notice={"Try the spiral with 1 layer of 3 neurons — it cannot do it, no matter how long you train. That is underfitting from insufficient capacity. Now 3 layers of 12: it fits, but look at the boundary contorting toward individual points.\n\nSwitch the optimizer to plain SGD at the same learning rate and watch how much slower the loss falls. Then set the learning rate to 0.5 and watch it destabilize. Same network, same data — the optimizer and step size decide whether it works."}
      formalName="Multi-Layer Perceptron trained by backpropagation"
      formalNote="Forward pass computes the prediction, backward pass applies the chain rule to get every parameter's gradient, the optimizer takes a step. Verified against numerical gradients to within 1e-5."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={D.CLASSIFICATION_SETS.map((d) => ({ id: d.id, label: d.id === "spam" ? "Spam" : d.id === "loan" ? "Loans" : d.id === "moons" ? "Moons" : d.id === "circles" ? "Ring" : d.id === "xor" ? "XOR" : "Spiral" }))} />
        <Toggle label={running ? "❚❚ Training" : "▶ Train"} on={running} set={setRunning} color={P.good} />
        <button onClick={() => { setRunning(false); reset(); }} style={{
          padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
          border: `1px solid ${P.grid}`, background: "transparent", color: P.dim,
        }}>↺ Reset weights</button>
      </Controls>
      <Controls>
        <Slider label="Hidden layers" value={layers} set={setLayers} min={1} max={4} step={1} color={P.highlight} />
        <Slider label="Neurons / layer" value={width} set={setWidth} min={2} max={14} step={1} color={P.highlight} />
        <Choice label="Activation" value={act} set={setAct} options={[{ id: "tanh", label: "tanh" }, { id: "relu", label: "ReLU" }, { id: "sigmoid", label: "sigmoid" }, { id: "gelu", label: "GELU" }]} />
      </Controls>
      <Controls>
        <Choice label="Optimizer" value={opt} set={setOpt} options={[{ id: "sgd", label: "SGD" }, { id: "momentum", label: "Momentum" }, { id: "adam", label: "Adam" }]} />
        <Slider label="Learning rate" value={lr} set={setLr} min={0.005} max={0.5} step={0.005} fmt={f3} color={P.highlight}
          hint={lr > 0.3 ? "likely unstable" : lr < 0.02 ? "slow" : "reasonable"} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <Plot width={320} height={280} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                {grid && <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.9} />}
                {ds.X.map((p, i) => {
                  const wrong = net && ((N.predict(net, p) >= 0.5 ? 1 : 0) !== ds.y[i]);
                  return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.6} halo={wrong ? P.highlight : null} />;
                })}
              </g>
            )}
          </Plot>
          <Caption>Circled points are still wrong. Blended colours mean the network is genuinely unsure there.</Caption>
        </Col>
        <Col flex="1 1 330px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The live network
          </div>
          <Graph nodes={diagram.nodes} edges={diagram.edges} width={350} height={195} />
          <Caption>Actual current weights. Edges below 0.05 are hidden; up to 8 neurons per layer shown.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Loss over training
          </div>
          <Plot width={340} height={130} xMin={0} xMax={Math.max(60, epoch)} yMin={0} yMax={maxLoss * 1.05}
            xLabel="steps" yLabel="loss" xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                {history.length > 1 && <Line pts={history.map((h) => [sx(h.epoch), sy(h.loss)])} color={P.good} width={1.8} />}
              </g>
            )}
          </Plot>
        </Col>
      </Row>
      <Stats>
        <Stat label="Accuracy" value={f2(ev.accuracy)} color={ev.accuracy > 0.95 ? P.good : P.highlight} big />
        <Stat label="Loss" value={f4(ev.loss)} color={P.highlight} />
        <Stat label="Steps" value={epoch} color={P.text} />
        <Stat label="Parameters" value={net?.nParams ?? 0} color={P.derived} />
        <Stat label="Data points" value={ds.X.length} color={P.faint} />
      </Stats>
      {net && net.nParams > ds.X.length && (
        <Verdict tone="warn">
          {net.nParams} parameters for {ds.X.length} training points. There is more than enough capacity to memorize every example — whatever accuracy you reach here says little about unseen data.
        </Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. BACKPROPAGATION, STEP BY STEP
// ════════════════════════════════════════════════════════════════════════════

export function BackpropSim() {
  const [stage, setStage] = useState(0);
  const net = useMemo(() => N.makeMLP({ inputDim: 2, hidden: [2], activation: "sigmoid", output: "sigmoid", seed: 3 }), []);
  const x = [0.6, -0.4], target = 1;
  const bp = useMemo(() => N.backward(net, x, target), []);
  const gc = useMemo(() => N.gradCheck(N.makeMLP({ inputDim: 2, hidden: [2], activation: "sigmoid", seed: 3 }), x, target), []);

  const STAGES = [
    "Nothing computed yet. Two inputs, two hidden neurons, one output.",
    "Forward: each hidden neuron computes its weighted sum.",
    "Forward: each sum is squashed by sigmoid.",
    "Forward: the output neuron combines them and squashes again — that is the prediction.",
    "Compare against the target. This gap is the loss.",
    "Backward: for sigmoid output with cross-entropy, the output error is just (prediction − target). No chain rule needed for this one step.",
    "Backward: that error flows back through the output weights, multiplied by each hidden neuron's own slope.",
    "Every weight now has a gradient: how much the loss would change if you nudged it.",
  ];

  const show = (s) => stage >= s;

  const nodes = [
    { x: 44, y: 60, r: 17, fill: P.class0Fill, stroke: P.class0, text: f2(x[0]), label: "in 1" },
    { x: 44, y: 145, r: 17, fill: P.class0Fill, stroke: P.class0, text: f2(x[1]), label: "in 2" },
    { x: 185, y: 60, r: 19, fill: show(2) ? `${P.highlight}22` : P.panel, stroke: show(1) ? P.highlight : P.axis, strokeWidth: show(1) ? 2.2 : 1.3,
      text: show(2) ? f2(bp.as[1][0]) : show(1) ? f2(bp.zs[0][0]) : "?", label: show(1) ? (show(2) ? "after sigmoid" : "sum") : "hidden 1" },
    { x: 185, y: 145, r: 19, fill: show(2) ? `${P.highlight}22` : P.panel, stroke: show(1) ? P.highlight : P.axis, strokeWidth: show(1) ? 2.2 : 1.3,
      text: show(2) ? f2(bp.as[1][1]) : show(1) ? f2(bp.zs[0][1]) : "?", label: show(1) ? (show(2) ? "after sigmoid" : "sum") : "hidden 2" },
    { x: 330, y: 102, r: 22, fill: show(3) ? `${P.predict}22` : P.panel, stroke: show(3) ? P.predict : P.axis, strokeWidth: show(3) ? 2.4 : 1.3,
      text: show(3) ? f3(bp.out) : "?", label: "prediction" },
  ];

  const edges = [
    { x1: 61, y1: 60, x2: 166, y2: 55, color: P.faint, width: 1.4, label: f2(net.W[0][0][0]) },
    { x1: 61, y1: 145, x2: 166, y2: 68, color: P.faint, width: 1.4, label: f2(net.W[0][0][1]) },
    { x1: 61, y1: 60, x2: 166, y2: 137, color: P.faint, width: 1.4, label: f2(net.W[0][1][0]) },
    { x1: 61, y1: 145, x2: 166, y2: 152, color: P.faint, width: 1.4, label: f2(net.W[0][1][1]) },
    { x1: 204, y1: 60, x2: 308, y2: 95, color: show(3) ? P.predict : P.faint, width: 1.6, label: f2(net.W[1][0][0]) },
    { x1: 204, y1: 145, x2: 308, y2: 110, color: show(3) ? P.predict : P.faint, width: 1.6, label: f2(net.W[1][0][1]) },
  ];
  if (show(5)) {
    edges.push({ x1: 308, y1: 118, x2: 204, y2: 160, color: P.class1, width: 2.2, dash: "4 3", label: f3(bp.out - target), labelColor: P.class1 });
  }

  return (
    <Sim
      n={4}
      title="Backpropagation"
      breadcrumb="Deep learning · How learning happens"
      hook={<>One tiny network: two inputs, two hidden neurons, one output. Small enough that every number fits on screen — so you can follow the actual arithmetic instead of trusting a formula.</>}
      question="The prediction is wrong. How does each individual weight find out how much it was to blame?"
      readout={
        stage === 0 ? <>Nothing computed yet. Press Next to push the inputs forward one step at a time.</>
          : stage < 4 ? <>Forward pass, step {stage} of 3. {stage >= 3 ? <>Prediction is <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{f3(bp.out)}</strong> and the target is <strong style={{ fontFamily: "Consolas, monospace" }}>{target}</strong>.</> : "Values are appearing on the nodes as they are computed."}</>
            : stage === 4 ? <>Prediction <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{f3(bp.out)}</strong> vs target <strong style={{ fontFamily: "Consolas, monospace" }}>{target}</strong> gives loss <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{f4(bp.loss)}</strong>.</>
              : <>
                Output error is <strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{f3(bp.out)} − {target} = {f3(bp.out - target)}</strong>.
                {" "}Propagated back, the largest gradient is <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f4(Math.max(...bp.gW.flat(2).map(Math.abs)))}</strong>
                {" "}and the smallest is <strong style={{ fontFamily: "Consolas, monospace" }}>{f4(Math.min(...bp.gW.flat(2).map(Math.abs)))}</strong> —
                {" "}a <strong style={{ fontFamily: "Consolas, monospace" }}>{(Math.max(...bp.gW.flat(2).map(Math.abs)) / Math.max(1e-12, Math.min(...bp.gW.flat(2).map(Math.abs)))).toFixed(0)}×</strong> spread across just two layers.
              </>
      }
      notice={"Look at the gradient magnitudes in the bar chart. The output layer's are much larger than the first layer's, and this network is only two layers deep. Stack twelve sigmoid layers and that shrinkage compounds — that is vanishing gradients, and it is visible here already.\n\nThe output error being exactly (prediction − target) is not a simplification. Sigmoid's derivative and cross-entropy's derivative cancel precisely, which is why that pairing is standard."}
      formalName="Backpropagation (reverse-mode automatic differentiation)"
      formalNote={`One backward sweep gets every parameter's gradient, at roughly the cost of one forward pass. Verified against central differences: worst relative error ${gc.maxRelError.toExponential(1)} across ${gc.n} weights.`}
    >
      <StepPlayer step={stage} setStep={setStage} max={7} speed={1300} autoLabel="Walk through" labels={STAGES} />

      <Row>
        <Col flex="1 1 380px">
          <Graph nodes={nodes} edges={edges} width={400} height={195} />
          <Caption>{stage >= 5 ? "The dashed red arrow is the error travelling backwards." : "Numbers appear as they are computed."}</Caption>
        </Col>
        <Col flex="1 1 280px">
          {stage >= 4 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>The loss</div>
              <div style={{ padding: "10px 13px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, fontSize: 13, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.7 }}>
                −log({f3(bp.out)}) = <span style={{ color: P.bad }}>{f4(bp.loss)}</span>
              </div>
            </>
          )}
          {stage >= 6 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Gradient magnitude per layer
              </div>
              <Bars width={290} height={110} horizontal
                items={bp.gradNorms.map((g, i) => ({ label: i === bp.gradNorms.length - 1 ? "output layer" : `hidden ${i + 1}`, value: g }))}
                fmt={(v) => v.toExponential(2)} colorFor={(it, i) => (i === bp.gradNorms.length - 1 ? P.predict : P.highlight)} />
              <Caption>Already shrinking toward the input, in a 2-layer net.</Caption>
            </>
          )}
          {stage >= 7 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Every weight's gradient
              </div>
              <Heatmap data={bp.gW[0]} rowLabels={["→ hid 1", "→ hid 2"]} colLabels={["in 1", "in 2"]} cell={46} fmt={f3}
                colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.15 + Math.min(0.8, Math.abs(v) * 8)})` : `rgba(255,92,92,${0.15 + Math.min(0.8, Math.abs(v) * 8)})`)} />
              <Note>Each cell says: nudge this weight up by a little, and the loss changes by this much. The optimizer just steps the other way.</Note>
            </>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. VANISHING & EXPLODING GRADIENTS
// ════════════════════════════════════════════════════════════════════════════

export function GradientFlowSim() {
  const [depth, setDepth] = useState(14);
  const [act, setAct] = useState("sigmoid");
  const [init, setInit] = useState("xavier");

  const flow = useMemo(() => N.gradientFlow({ depth, width: 6, activation: act, init, seed: 5 }), [depth, act, init]);
  const norms = flow.deltaNorms;
  const logs = norms.map((v) => Math.log10(Math.max(1e-30, v)));
  const lo = Math.min(...logs) - 0.5, hi = Math.max(...logs) + 0.5;

  return (
    <Sim
      n={5}
      title="Vanishing & Exploding Gradients"
      breadcrumb="Deep learning · Why depth was hard"
      hook={<>The error starts at the output and travels backward layer by layer, getting multiplied at every hop. Multiply by 0.25 fourteen times and there is nothing left; multiply by 5 fourteen times and it blows up.</>}
      question="How much of the learning signal actually reaches the first layer of a deep network?"
      readout={
        <>
          Signal at the output layer: <strong style={{ fontFamily: "Consolas, monospace" }}>{norms[norms.length - 1].toExponential(2)}</strong>.
          {" "}By the time it reaches layer 1: <strong style={{ color: flow.verdict === "healthy" ? P.good : P.bad, fontFamily: "Consolas, monospace" }}>{norms[0].toExponential(2)}</strong>.
          {" "}That is a factor of <strong style={{ color: flow.verdict === "healthy" ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{flow.ratio.toExponential(1)}</strong>,
          {" "}or <strong style={{ fontFamily: "Consolas, monospace" }}>{flow.perLayerFactor.toFixed(3)}×</strong> per layer.
          {" "}Verdict: <strong style={{ color: flow.verdict === "healthy" ? P.good : P.bad }}>{flow.verdict}</strong>.
        </>
      }
      notice={"Sigmoid at depth 14 gives roughly 0.24 per layer — almost exactly its theoretical maximum derivative of 0.25. Fourteen hops of that is about 1e-9, so the first layer receives a billionth of the signal the last one gets. It is not learning; it is frozen.\n\nSwitch to ReLU with He initialization and the per-layer factor jumps close to 1. That single change, plus residual connections, is what made networks deeper than about 20 layers trainable at all."}
      formalName="The vanishing gradient problem"
      formalNote="Backpropagation multiplies by the weight matrix and the activation derivative at every layer. If that product is consistently below 1, the signal decays geometrically with depth; above 1, it explodes."
    >
      <Controls>
        <Slider label="Depth (hidden layers)" value={depth} set={setDepth} min={2} max={26} step={1} color={P.highlight} />
        <Choice label="Activation" value={act} set={setAct} options={[{ id: "sigmoid", label: "sigmoid" }, { id: "tanh", label: "tanh" }, { id: "relu", label: "ReLU" }, { id: "leaky", label: "Leaky ReLU" }, { id: "gelu", label: "GELU" }]} />
        <Choice label="Weight init" value={init} set={setInit} options={[{ id: "xavier", label: "Xavier" }, { id: "he", label: "He" }, { id: "small", label: "Tiny (×0.01)" }, { id: "large", label: "Huge (×3)" }]} />
      </Controls>

      <Row>
        <Col flex="1 1 380px">
          <Plot width={400} height={250} xMin={1} xMax={norms.length} yMin={lo} yMax={hi}
            xLabel="layer (1 = nearest the input)" yLabel="log₁₀ signal strength" yTicks={5} yFmt={(v) => `1e${v.toFixed(0)}`}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(1)} y1={sy(0)} x2={sx(norms.length)} y2={sy(0)} stroke={P.faint} strokeWidth="1" strokeDasharray="4 3" />
                <Line pts={logs.map((v, i) => [sx(i + 1), sy(v)])}
                  color={flow.verdict === "healthy" ? P.good : flow.verdict === "exploding" ? P.bad : P.highlight} width={2.4} />
                {logs.map((v, i) => (
                  <Dot key={i} cx={sx(i + 1)} cy={sy(v)} color={flow.verdict === "healthy" ? P.good : flow.verdict === "exploding" ? P.bad : P.highlight} r={3.4} />
                ))}
                <Dot cx={sx(1)} cy={sy(logs[0])} color={P.class1} r={6} halo={P.class1} />
              </g>
            )}
          </Plot>
          <Caption>Note the axis is logarithmic — a straight line here means constant multiplication per layer. The circled point is the first layer.</Caption>
        </Col>
        <Col flex="1 1 260px">
          <Stats>
            <Stat label="Per-layer factor" value={flow.perLayerFactor.toFixed(3)} color={flow.perLayerFactor > 0.7 && flow.perLayerFactor < 1.5 ? P.good : P.bad} big
              hint={flow.perLayerFactor < 1 ? "shrinking" : "growing"} />
          </Stats>
          <Stats>
            <Stat label="Output layer" value={norms[norms.length - 1].toExponential(1)} color={P.predict} />
            <Stat label="First layer" value={norms[0].toExponential(1)} color={P.bad} />
          </Stats>
          {act === "sigmoid" && (
            <Verdict tone="bad">
              Sigmoid's derivative peaks at exactly 0.25. Even in the best case, {depth} layers scale the gradient by at most 0.25^{depth} ≈ {(0.25 ** depth).toExponential(1)}. This is arithmetic, not bad luck.
            </Verdict>
          )}
          {flow.verdict === "exploding" && (
            <Verdict tone="bad">Exploding: each layer multiplies the signal by about {flow.perLayerFactor.toFixed(1)}. Weights will jump to NaN within a few steps. Fix with smaller initialization or gradient clipping.</Verdict>
          )}
          {flow.verdict === "healthy" && (
            <Verdict tone="good">Healthy: the signal reaching layer 1 is within a factor of {flow.ratio.toExponential(1)} of the output. This network can actually train end to end.</Verdict>
          )}
          <Note>Try sigmoid at depth 4 — fine. Depth 20 — hopeless. The depth at which a network stops training is not mysterious; it is set by this multiplier.</Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. NORMALIZATION & DROPOUT
// ════════════════════════════════════════════════════════════════════════════

export function RegularizationSim() {
  const [p, setP] = useState(0.5);
  const [mode, setMode] = useState("batchnorm");

  // Two features on wildly different scales — the situation batchnorm fixes.
  const batch = useMemo(() => {
    const r = M.rng(15);
    return Array.from({ length: 16 }, () => [2 + M.gauss(r) * 0.6, 400 + M.gauss(r) * 90]);
  }, []);
  const bn = N.batchNorm(batch);
  const ln = N.layerNorm(batch[0]);

  const acts = useMemo(() => Array.from({ length: 24 }, (_, i) => 1 + Math.sin(i) * 0.35), []);
  const dp = N.dropout(acts, p, 9);

  return (
    <Sim
      n={6}
      title="Normalization & Dropout"
      breadcrumb="Deep learning · Making training stable"
      hook={<>Two inputs arrive on completely different scales: tumour size around <strong style={{ fontFamily: "Consolas, monospace" }}>2</strong> and a blood marker around <strong style={{ fontFamily: "Consolas, monospace" }}>400</strong>. The network's weights have to compensate for a 200× difference before they can learn anything useful.</>}
      question="What happens if you simply re-centre and re-scale each feature before the network sees it?"
      readout={
        mode === "batchnorm"
          ? <>
            Before: feature 1 spans <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(Math.min(...batch.map((b) => b[0])))}–{f2(Math.max(...batch.map((b) => b[0])))}</strong>,
            {" "}feature 2 spans <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(Math.min(...batch.map((b) => b[1])))}–{f2(Math.max(...batch.map((b) => b[1])))}</strong> — a
            {" "}<strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{(M.std(batch.map((b) => b[1])) / M.std(batch.map((b) => b[0]))).toFixed(0)}×</strong> scale gap.
            {" "}After batch norm both have mean <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f3(M.mean(bn.out.map((o) => o[0])))}</strong> and
            {" "}standard deviation <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f3(M.std(bn.out.map((o) => o[0])))}</strong>. The gap is gone.
          </>
          : <>
            Dropping <strong style={{ fontFamily: "Consolas, monospace" }}>{(p * 100).toFixed(0)}%</strong> of activations:
            {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{dp.kept}</strong> of {acts.length} survived,
            {" "}the rest are exactly zero. Survivors were scaled up by <strong style={{ fontFamily: "Consolas, monospace" }}>1/(1−{p.toFixed(2)}) = {(1 / (1 - p)).toFixed(2)}×</strong>,
            {" "}so the mean stays at <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f3(M.mean(dp.out))}</strong> instead of collapsing to
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f3(M.mean(acts) * (1 - p))}</strong>.
          </>
      }
      notice={mode === "batchnorm"
        ? "Batch norm normalizes DOWN a column — each feature across the whole batch. Layer norm normalizes ACROSS a row — all features of one sample. That difference is why transformers use layer norm: with variable-length sequences and batch size 1 at inference, batch statistics are unavailable or meaningless.\n\nThe practical effect is that you can use a much larger learning rate without diverging."
        : "The scaling is the part people forget. Without it, switching dropout off at test time would suddenly make every activation about twice as large, and the network would see inputs it was never trained on. Inverted dropout scales up during training so inference needs no change at all.\n\nDrag p to 0.9 and watch the mean become unstable — too much dropout destroys the signal along with the co-adaptation."}
      formalName={mode === "batchnorm" ? "Batch Normalization / Layer Normalization" : "Inverted Dropout"}
      formalNote={mode === "batchnorm"
        ? "Subtract the mean, divide by the standard deviation, then apply a learnable scale and shift so the network can undo it if that helps."
        : "Randomly zero units during training only, scaling survivors by 1/(1−p). Forces redundant representations because no unit can rely on any other being present."}
    >
      <Controls>
        <Choice label="Technique" value={mode} set={setMode} options={[{ id: "batchnorm", label: "Normalization" }, { id: "dropout", label: "Dropout" }]} />
        {mode === "dropout" && <Slider label="Drop probability" value={p} set={setP} min={0.05} max={0.9} step={0.05} fmt={f2} color={P.highlight} />}
      </Controls>

      {mode === "batchnorm" ? (
        <Row>
          <Col flex="1 1 300px">
            <Heatmap title="Before — raw activations (16 samples × 2 features)"
              data={batch} rowLabels={batch.map((_, i) => `s${i + 1}`)} colLabels={["size", "marker"]} cell={40} fmt={(v) => v.toFixed(0)}
              colorFor={(v, i, j) => `rgba(255,92,92,${0.1 + 0.7 * (v / 600)})`} />
            <Caption>Column 2 dwarfs column 1. Any single learning rate is wrong for one of them.</Caption>
          </Col>
          <Col flex="1 1 300px">
            <Heatmap title="After batch norm — each column standardized"
              data={bn.out} rowLabels={bn.out.map((_, i) => `s${i + 1}`)} colLabels={["size", "marker"]} cell={40} fmt={f2}
              colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.12 + Math.min(0.75, Math.abs(v) / 3)})` : `rgba(255,201,60,${0.12 + Math.min(0.75, Math.abs(v) / 3)})`)} />
            <Caption>Both columns now mean 0, standard deviation 1. Comparable at last.</Caption>
          </Col>
          <Col flex="1 1 240px" min={230}>
            <Stats>
              <Stat label="Scale gap before" value={`${(M.std(batch.map((b) => b[1])) / M.std(batch.map((b) => b[0]))).toFixed(0)}×`} color={P.bad} big />
            </Stats>
            <Stats>
              <Stat label="Col 1 mean → " value={f3(M.mean(bn.out.map((o) => o[0])))} color={P.good} />
              <Stat label="Col 2 mean → " value={f3(M.mean(bn.out.map((o) => o[1])))} color={P.good} />
            </Stats>
            <Stats>
              <Stat label="Col 1 std → " value={f3(M.std(bn.out.map((o) => o[0])))} color={P.good} />
              <Stat label="Col 2 std → " value={f3(M.std(bn.out.map((o) => o[1])))} color={P.good} />
            </Stats>
            <div style={{ marginTop: 12, padding: "10px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.derived, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Layer norm, same sample 1</div>
              <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.65, fontFamily: "Consolas, monospace" }}>
                [{batch[0].map((v) => v.toFixed(0)).join(", ")}] → [{ln.out.map(f2).join(", ")}]
              </div>
              <div style={{ fontSize: 11.5, color: P.faint, marginTop: 5, lineHeight: 1.5 }}>
                Normalized across this row alone — no other sample involved. That independence is why transformers use it.
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col flex="1 1 400px">
            <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              24 activations — grey means dropped this pass
            </div>
            <Bars width={420} height={160} items={dp.out.map((v, i) => ({ label: "", value: v }))}
              fmt={f2} showValues={false} colorFor={(it, i) => (dp.mask[i] ? P.predict : P.grid)} maxValue={Math.max(...dp.out, 1)} />
            <Caption>Every forward pass drops a different random subset, so the network can never depend on any one unit.</Caption>
            <div style={{ marginTop: 12 }}>
              <Bars width={420} height={110} horizontal
                items={[
                  { label: "Original mean", value: M.mean(acts), color: P.faint },
                  { label: "Without scaling", value: M.mean(acts) * (1 - p), color: P.bad },
                  { label: "With 1/(1−p)", value: M.mean(dp.out), color: P.good },
                ]} fmt={f3} />
              <Caption>The scaling is what keeps the mean where the next layer expects it.</Caption>
            </div>
          </Col>
          <Col flex="1 1 220px">
            <Stats>
              <Stat label="Kept" value={`${dp.kept}/${acts.length}`} color={P.good} big />
              <Stat label="Scale-up" value={`${(1 / (1 - p)).toFixed(2)}×`} color={P.highlight} />
            </Stats>
            <Stats>
              <Stat label="Mean kept" value={f3(M.mean(dp.out))} color={P.good} hint={`target ${f3(M.mean(acts))}`} />
            </Stats>
            {p > 0.7 && <Verdict tone="warn">At {(p * 100).toFixed(0)}% only {dp.kept} units survive. Beyond about 0.5 you are usually destroying signal rather than preventing co-adaptation.</Verdict>}
            <Note>At inference dropout is switched off entirely and nothing is rescaled — because the training-time scaling already handled it.</Note>
          </Col>
        </Row>
      )}
    </Sim>
  );
}

export const DEEP_LEARNING_SIMS = [
  { id: "neuron", label: "A Single Neuron", Comp: NeuronSim },
  { id: "nonlinear", label: "Why Networks Need a Curve", Comp: LinearCollapseSim },
  { id: "playground", label: "Network Playground", Comp: MlpPlaygroundSim },
  { id: "backprop", label: "Backpropagation", Comp: BackpropSim },
  { id: "gradflow", label: "Vanishing Gradients", Comp: GradientFlowSim },
  { id: "normreg", label: "Normalization & Dropout", Comp: RegularizationSim },
];
