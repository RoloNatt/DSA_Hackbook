import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Guide, Label, Regions, Heatmap, Bars, Graph, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");

// Shared bounds helper for 2D scatter sims.
function bounds(X, padFrac = 0.12) {
  const xs = X.map((p) => p[0]), ys = X.map((p) => p[1]);
  const xr = Math.max(...xs) - Math.min(...xs), yr = Math.max(...ys) - Math.min(...ys);
  return {
    xMin: Math.min(...xs) - xr * padFrac, xMax: Math.max(...xs) + xr * padFrac,
    yMin: Math.min(...ys) - yr * padFrac, yMax: Math.max(...ys) + yr * padFrac,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. LINEAR REGRESSION
// ════════════════════════════════════════════════════════════════════════════

export function LinearRegressionSim() {
  const [setId, setSetId] = useState("study");
  const [slope, setSlope] = useState(4);
  const [intercept, setIntercept] = useState(40);
  const [showResiduals, setShowResiduals] = useState(true);
  const [predictAt, setPredictAt] = useState(6);
  const [auto, setAuto] = useState(false);

  const ds = D.REGRESSION_SETS.find((d) => d.id === setId);
  const xs = ds.points.map((p) => p.x), ys = ds.points.map((p) => p.y);
  const best = useMemo(() => M.olsLine(xs, ys), [setId]);

  const w = auto ? best.w : slope;
  const b = auto ? best.b : intercept;
  const err = M.mseLine(xs, ys, w, b);
  const bestErr = M.mseLine(xs, ys, best.w, best.b);
  const pred = w * predictAt + b;

  const xr = { min: Math.min(...xs) - (Math.max(...xs) - Math.min(...xs)) * 0.1, max: Math.max(...xs) + (Math.max(...xs) - Math.min(...xs)) * 0.1 };
  const yr = { min: Math.min(...ys) - 20, max: Math.max(...ys) + 20 };

  return (
    <Sim
      n={1}
      title="Linear Regression"
      breadcrumb="Supervised · Regression"
      hook={<>Ten students told us how long they revised and what they scored. Each dot is one person: <strong style={{ color: P.class0 }}>{ds.xLabel}</strong> across, <strong style={{ color: P.class0 }}>{ds.yLabel}</strong> up.</>}
      question={ds.question}
      readout={
        <>
          Your line is <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{ds.yLabel} = {f2(w)} × {ds.xLabel} + {f2(b)}</strong>.
          {" "}Average squared miss: <strong style={{ color: err <= bestErr * 1.02 ? P.good : P.highlight, fontFamily: "Consolas, monospace" }}>{f2(err)}</strong>
          {" "}(the best possible is <span style={{ fontFamily: "Consolas, monospace" }}>{f2(bestErr)}</span>).
          {" "}At <strong>{predictAt} {ds.xUnit}</strong> it predicts <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(pred)} {ds.yUnit}</strong>.
          {err <= bestErr * 1.02 && <span style={{ color: P.good }}> ← that is the best-fit line.</span>}
        </>
      }
      notice={"Drag the slope away from the best value and watch the error grow — but notice it grows SLOWLY at first. That flat bottom is why optimizers can get \"close enough\" quickly and then crawl.\n\nThe error uses squared distances, so one point that is twice as far away contributes four times as much. That is why a single outlier can drag the whole line."}
      formalName="Ordinary Least Squares"
      formalNote="The line minimizing the mean squared error. It has a closed-form solution — no iteration needed — which is why it is the one model you can always compute exactly."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={(v) => { setSetId(v); setAuto(false); const d = D.REGRESSION_SETS.find((x) => x.id === v); setPredictAt(Math.round((Math.min(...d.points.map((p) => p.x)) + Math.max(...d.points.map((p) => p.x))) / 2)); }}
          options={D.REGRESSION_SETS.map((d) => ({ id: d.id, label: d.xLabel + " → " + d.yLabel }))} />
      </Controls>
      <Controls>
        <Slider label="Slope" value={auto ? Number(best.w.toFixed(2)) : slope} set={(v) => { setSlope(v); setAuto(false); }} min={-5} max={30} step={0.1} fmt={f2}
          hint={`per ${ds.xUnit || "unit"}`} color={P.predict} />
        <Slider label="Intercept" value={auto ? Number(best.b.toFixed(2)) : intercept} set={(v) => { setIntercept(v); setAuto(false); }} min={-50} max={200} step={1} fmt={f2}
          hint="value at zero" color={P.predict} />
        <Slider label="Predict at" value={predictAt} set={setPredictAt} min={Math.min(...xs)} max={Math.max(...xs)} step={0.5} unit={" " + ds.xUnit} color={P.highlight} />
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <Toggle label="Show misses" on={showResiduals} set={setShowResiduals} />
          <Toggle label="Snap to best fit" on={auto} set={setAuto} color={P.good} />
        </div>
      </Controls>

      <Row>
        <Col flex="1 1 420px">
          <Plot width={470} height={330} xMin={xr.min} xMax={xr.max} yMin={yr.min} yMax={yr.max}
            xLabel={ds.xLabel + (ds.xUnit ? ` (${ds.xUnit})` : "")} yLabel={ds.yLabel + (ds.yUnit ? ` (${ds.yUnit})` : "")}>
            {({ sx, sy }) => (
              <g>
                {/* residual sticks first, so dots sit on top */}
                {showResiduals && ds.points.map((p, i) => (
                  <line key={i} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(w * p.x + b)}
                    stroke={P.class1} strokeWidth="1.4" opacity="0.6" strokeDasharray="2 2" />
                ))}
                <Line pts={[[sx(xr.min), sy(w * xr.min + b)], [sx(xr.max), sy(w * xr.max + b)]]} color={P.predict} width={2.4} />
                {ds.points.map((p, i) => <Dot key={i} cx={sx(p.x)} cy={sy(p.y)} color={P.class0} r={4.5} />)}
                {/* the prediction, called out explicitly */}
                <Guide sx={sx} sy={sy} x={predictAt} y={pred} xMin={xr.min} yMin={yr.min} />
                <Dot cx={sx(predictAt)} cy={sy(pred)} color={P.highlight} r={5.5} halo={P.highlight} />
                <Label x={sx(predictAt) + 9} y={sy(pred) - 8} color={P.highlight} size={11.5}>{f2(pred)}</Label>
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.class0, label: "actual students" }, { color: P.predict, label: "your line", line: true },
            { color: P.class1, label: "the miss (residual)", dash: true }, { color: P.highlight, label: "prediction" }]} />
        </Col>
        <Col flex="1 1 220px" min={210}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            How the error is built
          </div>
          <Bars width={230} height={140} items={ds.points.map((p, i) => ({ label: String(p.x), value: (w * p.x + b - p.y) ** 2 }))}
            fmt={(v) => v.toFixed(0)} colorFor={(it) => (it.value > err * 2 ? P.bad : P.class1)} />
          <Caption>Squared miss per student. Bars above the average are pulling the line hardest.</Caption>
          <Stats>
            <Stat label="Mean sq. error" value={f2(err)} color={err <= bestErr * 1.02 ? P.good : P.highlight} />
            <Stat label="R²" value={f3(M.r2(ys, xs.map((x) => w * x + b)))} color={P.derived} hint="1.0 = perfect" />
          </Stats>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. GRADIENT DESCENT
// ════════════════════════════════════════════════════════════════════════════

export function GradientDescentSim() {
  const [lr, setLr] = useState(0.02);
  const [step, setStep] = useState(0);
  const ds = D.STUDY_HOURS;
  const xs = ds.points.map((p) => p.x), ys = ds.points.map((p) => p.y);

  const path = useMemo(() => M.gdLinear(xs, ys, { lr, steps: 60, w0: 1, b0: 5 }), [lr]);
  const best = useMemo(() => M.olsLine(xs, ys), []);
  const cur = path[Math.min(step, path.length - 1)];
  const diverged = !Number.isFinite(cur.loss);

  // Loss surface slice over (w, b)
  const surface = useMemo(() => {
    const cells = [];
    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        const w = -2 + (i / 39) * 14, b = -20 + (j / 39) * 80;
        cells.push({ w, b, loss: M.mseLine(xs, ys, w, b) });
      }
    }
    const max = Math.max(...cells.map((c) => c.loss));
    return { cells, max };
  }, []);

  return (
    <Sim
      n={2}
      title="Gradient Descent"
      breadcrumb="How models learn"
      hook={<>The best-fit line has a formula, but almost nothing else does. So instead: start with a <strong>bad</strong> line, measure which way is downhill, take a small step, repeat.</>}
      question="Starting from a deliberately wrong line, can small repeated steps find the best one — and what happens if the steps are too big?"
      readout={
        diverged
          ? <>After <strong>{step}</strong> steps the error is <strong style={{ color: P.bad }}>infinite</strong> — the steps overshot so far the line flew off to nowhere. Learning rate <strong style={{ fontFamily: "Consolas, monospace" }}>{lr}</strong> is too big.</>
          : <>Step <strong>{step}</strong>: line is <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{f2(cur.w)}×hours + {f2(cur.b)}</strong>, error <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(cur.loss)}</strong>.
            {" "}The exact answer is <span style={{ fontFamily: "Consolas, monospace" }}>{f2(best.w)}×hours + {f2(best.b)}</span> with error <span style={{ fontFamily: "Consolas, monospace" }}>{f2(M.mseLine(xs, ys, best.w, best.b))}</span>.
            {" "}Still <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(Math.abs(cur.w - best.w))}</strong> away on slope.</>
      }
      notice={"Set the learning rate to 0.002 and press play: it crawls, correct but painfully slow. Set it to 0.05 and it zig-zags down the valley. Push past 0.1 and it diverges completely.\n\nThat is the whole learning-rate story, and it is why the first thing to try when a model will not train is a smaller learning rate."}
      formalName="Batch Gradient Descent"
      formalNote="Each step computes the slope of the error with respect to every parameter using all the data, then moves against it. Every neural network is trained by a variant of this."
    >
      <Controls>
        <Slider label="Learning rate" value={lr} set={(v) => { setLr(v); setStep(0); }} min={0.002} max={0.14} step={0.002} fmt={(v) => v.toFixed(3)}
          hint="step size" color={P.highlight} />
      </Controls>
      <StepPlayer step={step} setStep={setStep} max={path.length - 1} speed={220} autoLabel="Descend"
        labels={path.map((p, i) => i === 0 ? "Step 0 — a deliberately bad starting guess." : Number.isFinite(p.loss) ? `Step ${i} — error ${f2(p.loss)}` : `Step ${i} — diverged.`)} />

      <Row>
        <Col flex="1 1 300px">
          <Plot width={340} height={280} xMin={0} xMax={11} yMin={20} yMax={110} xLabel="Hours Studied" yLabel="Exam Score">
            {({ sx, sy }) => (
              <g>
                {/* every line tried so far, fading */}
                {path.slice(0, step + 1).map((p, i) => Number.isFinite(p.w) && (
                  <line key={i} x1={sx(0)} y1={sy(p.b)} x2={sx(11)} y2={sy(p.w * 11 + p.b)}
                    stroke={P.predict} strokeWidth="1" opacity={0.06 + 0.5 * (i / (step + 1))} />
                ))}
                <Line pts={[[sx(0), sy(best.b)], [sx(11), sy(best.w * 11 + best.b)]]} color={P.good} width={1.6} dash="5 4" />
                {Number.isFinite(cur.w) && <Line pts={[[sx(0), sy(cur.b)], [sx(11), sy(cur.w * 11 + cur.b)]]} color={P.highlight} width={2.6} />}
                {ds.points.map((p, i) => <Dot key={i} cx={sx(p.x)} cy={sy(p.y)} color={P.class0} r={4} />)}
              </g>
            )}
          </Plot>
          <Caption>Faint lines are every guess so far. Amber is now; dashed green is the exact answer.</Caption>
        </Col>
        <Col flex="1 1 300px">
          <Plot width={330} height={280} xMin={-2} xMax={12} yMin={-20} yMax={60} xLabel="Slope (w)" yLabel="Intercept (b)">
            {({ sx, sy }) => (
              <g>
                {surface.cells.map((c, i) => {
                  const t = Math.min(1, Math.log10(1 + c.loss) / Math.log10(1 + surface.max));
                  return <rect key={i} x={sx(c.w) - 4.6} y={sy(c.b) - 3} width={9.6} height={6.4}
                    fill={`rgba(185, 140, 255, ${0.75 - t * 0.7})`} />;
                })}
                <Line pts={path.slice(0, step + 1).filter((p) => Number.isFinite(p.w)).map((p) => [sx(p.w), sy(p.b)])}
                  color={P.highlight} width={1.8} />
                {path.slice(0, step + 1).filter((p) => Number.isFinite(p.w)).map((p, i) => (
                  <Dot key={i} cx={sx(p.w)} cy={sy(p.b)} color={P.highlight} r={2.2} opacity={0.5} />
                ))}
                <Dot cx={sx(best.w)} cy={sy(best.b)} color={P.good} r={5} halo={P.good} />
                {Number.isFinite(cur.w) && <Dot cx={sx(cur.w)} cy={sy(cur.b)} color={P.highlight} r={5} />}
              </g>
            )}
          </Plot>
          <Caption>The same run seen from above the error landscape. Bright = low error. The walk should end on the green dot.</Caption>
        </Col>
      </Row>
      <Stats>
        <Stat label="Step" value={step} color={P.text} />
        <Stat label="Error" value={Number.isFinite(cur.loss) ? f2(cur.loss) : "∞"} color={diverged ? P.bad : P.highlight} />
        <Stat label="Slope now" value={Number.isFinite(cur.w) ? f2(cur.w) : "—"} color={P.predict} />
        <Stat label="Target slope" value={f2(best.w)} color={P.good} />
      </Stats>
      {diverged && <Verdict tone="bad">Diverged. Each step overshot the bottom of the valley and landed further up the other side, so the error grew instead of shrinking. Lower the learning rate.</Verdict>}
      {!diverged && step >= path.length - 1 && Math.abs(cur.w - best.w) < 0.05 && <Verdict tone="good">Converged to the exact least-squares answer, without ever using its formula.</Verdict>}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. LOGISTIC REGRESSION
// ════════════════════════════════════════════════════════════════════════════

export function LogisticRegressionSim() {
  const [setId, setSetId] = useState("spam");
  const [threshold, setThreshold] = useState(0.5);
  const [steps, setSteps] = useState(400);

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const { Z, mu, sd } = useMemo(() => M.standardize(ds.X), [setId]);
  const fit = useMemo(() => M.logisticFit(Z, ds.y, { lr: 0.5, steps }), [setId, steps]);

  const probaAt = (p) => M.sigmoid(M.dot(fit.w, [(p[0] - mu[0]) / sd[0], (p[1] - mu[1]) / sd[1]]) + fit.b);
  const bb = bounds(ds.X);
  const grid = useMemo(() => M.decisionGrid(probaAt, { ...bb, res: 38 }), [setId, steps]);
  const probs = ds.X.map(probaAt);
  const cm = M.confusion(ds.y, probs, threshold);

  return (
    <Sim
      n={3}
      title="Logistic Regression"
      breadcrumb="Supervised · Classification"
      hook={<>Same idea as a straight-line fit, but the answer must now be a <strong>probability</strong>, not a number. Each dot is one email: <strong style={{ color: P.class0 }}>{ds.xLabel}</strong> across, <strong style={{ color: P.class0 }}>{ds.yLabel}</strong> up.</>}
      question={ds.question}
      readout={
        <>
          At a cut-off of <strong style={{ fontFamily: "Consolas, monospace" }}>{threshold.toFixed(2)}</strong>:
          {" "}caught <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{cm.tp}</strong> of {cm.tp + cm.fn} {ds.class1?.toLowerCase()},
          {" "}wrongly flagged <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{cm.fp}</strong> of {cm.fp + cm.tn} {ds.class0?.toLowerCase()},
          {" "}missed <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{cm.fn}</strong>.
          {" "}Precision <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.precision)}</strong>, recall <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.recall)}</strong>, accuracy <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.accuracy)}</strong>.
        </>
      }
      notice={"The boundary is still a straight line — logistic regression only bends the OUTPUT, never the boundary. Switch to the ring dataset and watch it fail completely: no straight line can separate a ring from its centre.\n\nDrag the cut-off. The model does not change at all; only where you cut it does. Every false-positive/false-negative tradeoff argument is about this one slider, not about the model."}
      formalName="Logistic Regression"
      formalNote="A linear score squashed through the sigmoid into (0,1), trained by minimizing cross-entropy. Despite the name it is a classifier, and it is still linear in its inputs."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setId2 => setSetId(setId2)} options={D.CLASSIFICATION_SETS.map((d) => ({ id: d.id, label: d.id === "spam" ? "Spam (easy)" : d.id === "loan" ? "Loans (overlapping)" : d.id === "circles" ? "Ring (impossible)" : d.id === "moons" ? "Moons" : d.id === "xor" ? "XOR" : "Spiral" }))} />
        <Slider label="Decision cut-off" value={threshold} set={setThreshold} min={0.05} max={0.95} step={0.01} fmt={f2} color={P.highlight} />
        <Slider label="Training steps" value={steps} set={setSteps} min={5} max={800} step={5} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 330px">
          <Plot width={360} height={300} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.85} />
                {/* the cut-off contour, drawn as the actual level set */}
                {grid.cells.filter((c) => Math.abs(c.v - threshold) < 0.035).map((c, i) => (
                  <rect key={i} x={sx(c.x - grid.dx / 2)} y={sy(c.y + grid.dy / 2)}
                    width={Math.abs(sx(grid.dx) - sx(0)) + 1} height={Math.abs(sy(0) - sy(grid.dy)) + 1} fill={P.highlight} opacity="0.5" />
                ))}
                {ds.X.map((p, i) => {
                  const wrong = (probs[i] >= threshold ? 1 : 0) !== ds.y[i];
                  return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={4.2}
                    halo={wrong ? P.highlight : null} />;
                })}
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.class0, label: ds.class0 }, { color: P.class1, label: ds.class1 },
            { color: P.highlight, label: "cut-off line" }, { color: P.highlight, label: "circled = misclassified" }]} />
        </Col>
        <Col flex="1 1 280px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Every point's probability, sorted
          </div>
          <Plot width={300} height={190} xMin={0} xMax={ds.X.length - 1} yMin={0} yMax={1} xLabel="ranked by score" yLabel="P(class red)" yTicks={3} xTicks={2}>
            {({ sx, sy }) => {
              const order = probs.map((p, i) => ({ p, y: ds.y[i] })).sort((a, b) => a.p - b.p);
              return (
                <g>
                  <line x1={sx(0)} y1={sy(threshold)} x2={sx(ds.X.length - 1)} y2={sy(threshold)} stroke={P.highlight} strokeWidth="1.5" strokeDasharray="4 3" />
                  {order.map((o, i) => <Dot key={i} cx={sx(i)} cy={sy(o.p)} color={o.y ? P.class1 : P.class0} r={3} />)}
                </g>
              );
            }}
          </Plot>
          <Caption>Perfect separation would mean all blue below the dashed line and all red above it.</Caption>
          <Heatmap
            title="Confusion matrix"
            data={[[cm.tn, cm.fp], [cm.fn, cm.tp]]}
            rowLabels={["Actually blue", "Actually red"]}
            colLabels={["Said blue", "Said red"]}
            cell={54} fmt={(v) => String(v)}
            colorFor={(v, i, j) => (i === j ? `rgba(74, 222, 128, ${0.15 + 0.5 * (v / Math.max(1, ds.X.length / 2))})` : `rgba(255, 107, 107, ${0.15 + 0.5 * (v / Math.max(1, ds.X.length / 4))})`)}
          />
        </Col>
      </Row>
      {ds.needsNonlinear && (
        <Verdict tone="warn">
          This shape needs a curved boundary. Logistic regression can only draw a straight one, so it is stuck near {f2(cm.accuracy)} accuracy no matter how long it trains. That limitation is the reason SVMs with kernels and neural networks exist.
        </Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. NAIVE BAYES
// ════════════════════════════════════════════════════════════════════════════

export function NaiveBayesSim() {
  const [setId, setSetId] = useState("spam");
  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const [qi, setQi] = useState(0);

  const nb = useMemo(() => M.gaussianNB(ds.X, ds.y, 2), [setId]);
  const bb = bounds(ds.X);
  const grid = useMemo(() => M.decisionGrid((p) => nb.predictProba(p)[1], { ...bb, res: 38 }), [setId]);
  const q = ds.X[qi % ds.X.length];
  const pp = nb.predictProba(q);

  // Per-feature likelihood contributions for the chosen point — the "naive" part.
  const contrib = [0, 1].map((j) => [0, 1].map((c) => {
    const { mu, sigma } = nb.params[c];
    return Math.exp(-((q[j] - mu[j]) ** 2) / (2 * sigma[j])) / Math.sqrt(2 * Math.PI * sigma[j]);
  }));

  return (
    <Sim
      n={4}
      title="Naive Bayes"
      breadcrumb="Supervised · Classification"
      hook={<>Instead of drawing a boundary, ask a different question: <em>if this email really were spam, how likely is it to look like this?</em> Then compare that against the same question for real email.</>}
      question={`This email has ${f2(q[0])} ${ds.xLabel.toLowerCase()} and ${f2(q[1])} ${ds.yLabel.toLowerCase()}. Which class explains it better?`}
      readout={
        <>
          {ds.class0} explains it with likelihood <strong style={{ color: P.class0, fontFamily: "Consolas, monospace" }}>{(contrib[0][0] * contrib[1][0]).toExponential(2)}</strong>,
          {" "}{ds.class1} with <strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{(contrib[0][1] * contrib[1][1]).toExponential(2)}</strong>.
          {" "}After weighting by how common each class is, the verdict is
          {" "}<strong style={{ color: pp[1] > 0.5 ? P.class1 : P.class0 }}>{pp[1] > 0.5 ? ds.class1 : ds.class0}</strong>
          {" "}at <strong style={{ fontFamily: "Consolas, monospace" }}>{(Math.max(...pp) * 100).toFixed(1)}%</strong> confidence.
          {" "}Truth: <strong style={{ color: ds.y[qi % ds.X.length] ? P.class1 : P.class0 }}>{ds.y[qi % ds.X.length] ? ds.class1 : ds.class0}</strong>.
        </>
      }
      notice={"The word \"naive\" is doing real work. The two feature likelihoods above are simply MULTIPLIED, which is only valid if the features are independent given the class. Links and capital letters in spam are obviously correlated, so that assumption is false.\n\nIt still works. That is the surprise worth remembering: the probabilities come out badly calibrated, but the argmax — which class wins — is often right anyway."}
      formalName="Gaussian Naive Bayes"
      formalNote="Bayes' rule with a per-feature Gaussian likelihood and a conditional-independence assumption. It needs very little data because it only estimates a mean and variance per feature per class."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={(v) => { setSetId(v); setQi(0); }} options={[{ id: "spam", label: "Spam" }, { id: "loan", label: "Loans" }, { id: "circles", label: "Ring" }]} />
        <Slider label="Which point to test" value={qi} set={setQi} min={0} max={ds.X.length - 1} step={1} color={P.highlight} />
      </Controls>

      <Row>
        <Col flex="1 1 320px">
          <Plot width={350} height={290} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.8} />
                {/* one-sigma ellipses: the model IS these two bells */}
                {[0, 1].map((c) => (
                  <ellipse key={c} cx={sx(nb.params[c].mu[0])} cy={sy(nb.params[c].mu[1])}
                    rx={Math.abs(sx(nb.params[c].mu[0] + Math.sqrt(nb.params[c].sigma[0])) - sx(nb.params[c].mu[0]))}
                    ry={Math.abs(sy(nb.params[c].mu[1] + Math.sqrt(nb.params[c].sigma[1])) - sy(nb.params[c].mu[1]))}
                    fill="none" stroke={c ? P.class1 : P.class0} strokeWidth="1.6" strokeDasharray="4 3" opacity="0.9" />
                ))}
                {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.6} opacity={i === qi ? 1 : 0.55} />)}
                <Guide sx={sx} sy={sy} x={q[0]} y={q[1]} xMin={bb.xMin} yMin={bb.yMin} />
                <Dot cx={sx(q[0])} cy={sy(q[1])} color={P.highlight} r={6} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Caption>Dashed ellipses are one standard deviation of each class's fitted bell. That pair of bells is the entire model.</Caption>
        </Col>
        <Col flex="1 1 260px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            One feature at a time, then multiplied
          </div>
          {[0, 1].map((j) => (
            <div key={j} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, color: P.text, marginBottom: 3 }}>{j === 0 ? ds.xLabel : ds.yLabel} = <span style={{ fontFamily: "Consolas, monospace", color: P.highlight }}>{f2(q[j])}</span></div>
              <Bars width={280} height={64} horizontal
                items={[{ label: ds.class0, value: contrib[j][0], color: P.class0 }, { label: ds.class1, value: contrib[j][1], color: P.class1 }]}
                fmt={(v) => v.toExponential(1)} />
            </div>
          ))}
          <div style={{ padding: "9px 11px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, fontSize: 12, color: P.dim, lineHeight: 1.6 }}>
            <span style={{ color: P.text, fontWeight: 600 }}>Multiply them: </span>
            <span style={{ fontFamily: "Consolas, monospace" }}>
              {contrib[0][0].toExponential(1)} × {contrib[1][0].toExponential(1)} = {(contrib[0][0] * contrib[1][0]).toExponential(2)}
            </span>
            <span style={{ color: P.faint }}> for {ds.class0}</span>
          </div>
          <Stats>
            <Stat label={`P(${ds.class0})`} value={f3(pp[0])} color={P.class0} />
            <Stat label={`P(${ds.class1})`} value={f3(pp[1])} color={P.class1} />
          </Stats>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. K-NEAREST NEIGHBOURS
// ════════════════════════════════════════════════════════════════════════════

export function KnnSim() {
  const [k, setK] = useState(5);
  const [setId, setSetId] = useState("moons");
  const [qx, setQx] = useState(0);
  const [qy, setQy] = useState(0);
  const [weighted, setWeighted] = useState(false);

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const bb = bounds(ds.X, 0.16);
  const q = [bb.xMin + ((qx + 100) / 200) * (bb.xMax - bb.xMin), bb.yMin + ((qy + 100) / 200) * (bb.yMax - bb.yMin)];

  const res = M.knnPredict(ds.X, ds.y, q, Math.min(k, ds.X.length), { weighted });
  const grid = useMemo(() => M.decisionGrid((p) => M.knnPredict(ds.X, ds.y, p, Math.min(k, ds.X.length), { weighted }).label,
    { ...bb, res: 30 }), [setId, k, weighted]);

  const votes = res.neighbours.reduce((acc, nb) => { acc[ds.y[nb.i]] = (acc[ds.y[nb.i]] || 0) + 1; return acc; }, {});
  const v0 = votes[0] || 0, v1 = votes[1] || 0;

  return (
    <Sim
      n={5}
      title="K-Nearest Neighbours"
      breadcrumb="Supervised · Classification"
      hook={<>No training at all. To classify a new point, find the <strong>{k}</strong> closest examples you already have labels for, and let them vote.</>}
      question="Move the amber point anywhere. Which neighbours does it ask, and what do they say?"
      readout={
        <>
          The <strong>{Math.min(k, ds.X.length)}</strong> nearest neighbours vote
          {" "}<strong style={{ color: P.class0, fontFamily: "Consolas, monospace" }}>{ds.class0}: {v0}</strong>
          {" "}<span style={{ color: P.faint }}>vs</span>
          {" "}<strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{ds.class1}: {v1}</strong>.
          {" "}Verdict: <strong style={{ color: res.label ? P.class1 : P.class0 }}>{res.label ? ds.class1 : ds.class0}</strong>
          {" "}at <strong style={{ fontFamily: "Consolas, monospace" }}>{(res.confidence * 100).toFixed(0)}%</strong>.
          {" "}Closest neighbour is <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(res.neighbours[0].d)}</strong> away.
        </>
      }
      notice={"Set k = 1 and look at the boundary: it is jagged, and every single point gets its own little island. That is memorizing the training set — maximum variance.\n\nNow push k up to 30. The boundary smooths out, then starts swallowing whole regions of the minority class. That is underfitting. k is a bias-variance dial you can literally watch turn."}
      formalName="k-Nearest Neighbours"
      formalNote="A non-parametric, lazy learner: it stores the data and defers all work to prediction time. Cost is O(n) per query, and it degrades badly in high dimensions as distances all become similar."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={[{ id: "spam", label: "Spam" }, { id: "moons", label: "Moons" }, { id: "circles", label: "Ring" }, { id: "xor", label: "XOR" }]} />
        <Slider label="k (neighbours)" value={k} set={setK} min={1} max={31} step={1} color={P.highlight}
          hint={k === 1 ? "memorizes" : k > 20 ? "over-smoothed" : "balanced"} />
        <Toggle label="Weight by distance" on={weighted} set={setWeighted} />
      </Controls>
      <Controls>
        <Slider label="Test point ←→" value={qx} set={setQx} min={-100} max={100} step={1} fmt={() => f2(q[0])} color={P.highlight} />
        <Slider label="Test point ↑↓" value={qy} set={setQy} min={-100} max={100} step={1} fmt={() => f2(q[1])} color={P.highlight} />
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <Plot width={370} height={310} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.55} />
                {/* circle enclosing the k neighbours — the "reach" of the query */}
                <circle cx={sx(q[0])} cy={sy(q[1])}
                  r={Math.abs(sx(q[0] + res.neighbours[res.neighbours.length - 1].d) - sx(q[0]))}
                  fill="none" stroke={P.highlight} strokeWidth="1.3" strokeDasharray="4 3" opacity="0.85" />
                {res.neighbours.map((nb, i) => (
                  <line key={i} x1={sx(q[0])} y1={sy(q[1])} x2={sx(ds.X[nb.i][0])} y2={sy(ds.X[nb.i][1])}
                    stroke={P.highlight} strokeWidth="1" opacity="0.55" />
                ))}
                {ds.X.map((p, i) => {
                  const isNb = res.neighbours.some((nb) => nb.i === i);
                  return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0}
                    r={isNb ? 5 : 3.4} halo={isNb ? P.highlight : null} opacity={isNb ? 1 : 0.5} />;
                })}
                <Dot cx={sx(q[0])} cy={sy(q[1])} color={P.highlight} r={6.5} stroke={P.bg} />
              </g>
            )}
          </Plot>
          <Caption>Circled points are the k that got a vote. Everything outside the dashed circle is ignored entirely.</Caption>
        </Col>
        <Col flex="1 1 240px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>The vote</div>
          <Bars width={250} height={92} items={[{ label: ds.class0, value: v0, color: P.class0 }, { label: ds.class1, value: v1, color: P.class1 }]}
            fmt={(v) => String(v)} maxValue={Math.max(v0, v1, 1)} />
          <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: P.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>Neighbours, nearest first</div>
          <div style={{ marginTop: 5 }}>
            {res.neighbours.slice(0, 8).map((nb, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "2.5px 7px", borderRadius: 5, background: i % 2 ? P.panel : "transparent" }}>
                <span style={{ color: ds.y[nb.i] ? P.class1 : P.class0, fontWeight: 600 }}>{ds.y[nb.i] ? ds.class1 : ds.class0}</span>
                <span style={{ color: P.dim, fontFamily: "Consolas, monospace" }}>{f2(nb.d)} away</span>
              </div>
            ))}
          </div>
          {k % 2 === 0 && v0 === v1 && <Verdict tone="warn">An even k just produced a tie. This is why odd k is the default for two classes.</Verdict>}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. SUPPORT VECTOR MACHINES
// ════════════════════════════════════════════════════════════════════════════

export function SvmSim() {
  const [setId, setSetId] = useState("spam");
  const [logC, setLogC] = useState(0);
  const [kernel, setKernel] = useState("linear");
  const [gamma, setGamma] = useState(1);

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const C = 10 ** logC;
  const model = useMemo(() => M.svmSMO(ds.X, ds.y, { C, kernel, gamma, maxPasses: 25 }), [setId, C, kernel, gamma]);
  const bb = bounds(ds.X);
  const grid = useMemo(() => M.decisionGrid((p) => (model.decide(p) >= 0 ? 1 : 0), { ...bb, res: 34 }), [setId, C, kernel, gamma]);
  const acc = M.accuracy(ds.y, ds.X.map((p) => (model.decide(p) >= 0 ? 1 : 0)));

  return (
    <Sim
      n={6}
      title="Support Vector Machines"
      breadcrumb="Supervised · Classification"
      hook={<>Many lines separate these two groups. An SVM picks a specific one: the line with the <strong>widest empty corridor</strong> on either side. Only the points touching that corridor matter.</>}
      question="Which points actually determine the boundary — and what happens to the rest?"
      readout={
        <>
          Boundary decided by <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{model.supportVectors.length}</strong> of {ds.X.length} points.
          {kernel === "linear" && <> Corridor width <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(model.marginWidth)}</strong>.</>}
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{model.onMargin.length}</strong> sit exactly on the edge,
          {" "}<strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{model.violators.length}</strong> are inside it or on the wrong side.
          {" "}Accuracy <strong style={{ color: acc === 1 ? P.good : P.highlight, fontFamily: "Consolas, monospace" }}>{f2(acc)}</strong>.
          {" "}Deleting any non-circled point would change nothing.
        </>
      }
      notice={"Drag C down to 0.01: the corridor widens, swallows points, and the model stops caring about individual mistakes. Push C to 1000: the corridor shrinks to squeeze past every point, and it starts contorting to fit noise. C is literally the price of a mistake.\n\nNow switch to the ring dataset with a linear kernel — it fails. Change the kernel to RBF and it separates cleanly, without ever computing coordinates in a higher-dimensional space."}
      formalName="Support Vector Machine (soft margin, solved by SMO)"
      formalNote="Maximizes the margin subject to slack penalized by C. The kernel trick replaces every dot product with a similarity function, giving curved boundaries at linear cost."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={[{ id: "spam", label: "Spam" }, { id: "loan", label: "Loans" }, { id: "moons", label: "Moons" }, { id: "circles", label: "Ring" }, { id: "xor", label: "XOR" }]} />
        <Choice label="Kernel" value={kernel} set={setKernel} options={[{ id: "linear", label: "Linear" }, { id: "rbf", label: "RBF" }, { id: "poly", label: "Polynomial" }]} />
      </Controls>
      <Controls>
        <Slider label="C (cost of a mistake)" value={logC} set={setLogC} min={-2} max={3} step={0.25}
          fmt={(v) => (10 ** v).toPrecision(2)} color={P.highlight}
          hint={logC < -0.5 ? "forgiving, wide corridor" : logC > 1.5 ? "strict, may overfit" : "balanced"} />
        {kernel === "rbf" && <Slider label="Gamma (reach)" value={gamma} set={setGamma} min={0.05} max={8} step={0.05} fmt={f2} color={P.derived}
          hint={gamma < 0.3 ? "very smooth" : gamma > 4 ? "memorizing" : "balanced"} />}
      </Controls>

      <Row>
        <Col flex="1 1 360px">
          <Plot width={380} height={320} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.6} />
                {kernel === "linear" && model.w && (() => {
                  const [w1, w2] = model.w, b = model.b;
                  const lineAt = (off) => {
                    // w1 x + w2 y + b = off
                    if (Math.abs(w2) < 1e-9) return null;
                    return [[bb.xMin, (off - b - w1 * bb.xMin) / w2], [bb.xMax, (off - b - w1 * bb.xMax) / w2]];
                  };
                  return [[0, P.highlight, 2.4, null], [1, P.faint, 1.2, "5 4"], [-1, P.faint, 1.2, "5 4"]].map(([off, col, wid, dash], i) => {
                    const pts = lineAt(off);
                    return pts ? <Line key={i} pts={pts.map(([x, y]) => [sx(x), sy(y)])} color={col} width={wid} dash={dash} /> : null;
                  });
                })()}
                {ds.X.map((p, i) => {
                  const isSV = model.supportVectors.includes(i);
                  const isViol = model.violators.includes(i);
                  return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0}
                    r={isSV ? 5.2 : 3.4} halo={isViol ? P.bad : isSV ? P.highlight : null} opacity={isSV ? 1 : 0.45} />;
                })}
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.highlight, label: "boundary", line: true }, { color: P.faint, label: "corridor edge", dash: true },
            { color: P.highlight, label: "support vector" }, { color: P.bad, label: "margin violator" }]} />
        </Col>
        <Col flex="1 1 230px">
          <Stats>
            <Stat label="Support vectors" value={`${model.supportVectors.length}/${ds.X.length}`} color={P.highlight} big />
            <Stat label="Accuracy" value={f2(acc)} color={acc === 1 ? P.good : P.highlight} />
          </Stats>
          <Stats>
            <Stat label="On the margin" value={model.onMargin.length} color={P.predict} hint="α < C" />
            <Stat label="Violating it" value={model.violators.length} color={P.bad} hint="α = C" />
          </Stats>
          {kernel === "linear" && <Stats><Stat label="Corridor width" value={f3(model.marginWidth)} color={P.derived} /></Stats>}
          <Note>
            {model.supportVectors.length / ds.X.length > 0.6
              ? `${Math.round((model.supportVectors.length / ds.X.length) * 100)}% of points are support vectors — the model is leaning on almost everything, which means it is memorizing rather than generalizing.`
              : `Only ${Math.round((model.supportVectors.length / ds.X.length) * 100)}% of the data is doing any work. That sparsity is the SVM's signature property.`}
          </Note>
          {ds.needsNonlinear && kernel === "linear" && (
            <Verdict tone="bad">A straight line cannot do this. Switch the kernel to RBF.</Verdict>
          )}
          {ds.needsNonlinear && kernel === "rbf" && acc === 1 && (
            <Verdict tone="good">Solved — with a curved boundary, computed without ever leaving 2D. That is the kernel trick.</Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. DECISION TREES
// ════════════════════════════════════════════════════════════════════════════

function TreeDiagram({ node, ds, width = 430, height = 260 }) {
  const levels = [];
  const walk = (n, depth, x0, x1) => {
    if (!n) return;
    (levels[depth] = levels[depth] || []).push({ n, x: (x0 + x1) / 2, x0, x1, depth });
    if (!n.leaf) { walk(n.left, depth + 1, x0, (x0 + x1) / 2); walk(n.right, depth + 1, (x0 + x1) / 2, x1); }
  };
  walk(node, 0, 20, width - 20);
  const maxD = levels.length;
  const yOf = (d) => 26 + (d * (height - 60)) / Math.max(1, maxD - 1);

  const nodes = [], edges = [];
  levels.forEach((lvl, d) => lvl.forEach((item) => {
    const { n, x } = item;
    const purity = 1 - n.impurity / 0.5;
    nodes.push({
      x, y: yOf(d), r: n.leaf ? 13 : 15,
      fill: n.leaf ? (n.prediction ? P.class1Fill : P.class0Fill) : P.panel,
      stroke: n.leaf ? (n.prediction ? P.class1 : P.class0) : P.axis,
      strokeWidth: n.leaf ? 2 : 1.4,
      text: n.leaf ? (n.prediction ? "R" : "B") : `f${n.feature}`,
      textColor: n.leaf ? (n.prediction ? P.class1 : P.class0) : P.text,
      fontSize: 9.5,
      label: n.leaf ? `${n.n}` : `≤${n.threshold.toFixed(1)}`,
    });
    if (!n.leaf) {
      const kids = levels[d + 1]?.filter((c) => c.x0 >= item.x0 - 0.01 && c.x1 <= item.x1 + 0.01) || [];
      kids.slice(0, 2).forEach((c, i) => {
        edges.push({ x1: x, y1: yOf(d) + 15, x2: c.x, y2: yOf(d + 1) - 14, color: P.grid, width: 1.3, label: i === 0 ? "yes" : "no", labelColor: P.faint });
      });
    }
  }));
  return <Graph nodes={nodes} edges={edges} width={width} height={height} />;
}

export function DecisionTreeSim() {
  const [setId, setSetId] = useState("moons");
  const [depth, setDepth] = useState(3);
  const [criterion, setCriterion] = useState("gini");

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const tree = useMemo(() => M.buildTree(ds.X, ds.y, { maxDepth: depth, nClasses: 2, criterion }), [setId, depth, criterion]);
  const bb = bounds(ds.X);
  const grid = useMemo(() => M.decisionGrid((p) => M.treePredict(tree, p), { ...bb, res: 40 }), [setId, depth, criterion]);
  const acc = M.accuracy(ds.y, ds.X.map((p) => M.treePredict(tree, p)));
  const leaves = M.countLeaves(tree);
  const rootImp = criterion === "entropy" ? M.entropy(tree.counts) : M.gini(tree.counts);

  return (
    <Sim
      n={7}
      title="Decision Trees"
      breadcrumb="Supervised · Classification"
      hook={<>Ask one yes/no question at a time about a single feature. Each question splits the data into two purer piles. Keep going until each pile is (mostly) one class.</>}
      question="Which single question separates these two groups best — and how many questions deep do you need to go?"
      readout={
        <>
          The first question is <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>
            is {tree.feature === 0 ? ds.xLabel : ds.yLabel} ≤ {tree.threshold?.toFixed(2)}?
          </strong>
          {" "}It drops impurity from <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(rootImp)}</strong> to
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f3(rootImp - tree.gain)}</strong> — a gain of
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f3(tree.gain)}</strong>.
          {" "}At depth <strong>{depth}</strong> the tree has <strong style={{ fontFamily: "Consolas, monospace" }}>{leaves}</strong> leaves
          {" "}and gets <strong style={{ color: acc === 1 ? P.good : P.highlight, fontFamily: "Consolas, monospace" }}>{f2(acc)}</strong> accuracy.
        </>
      }
      notice={"Look at the boundary: it is made only of horizontal and vertical steps. A tree can never draw a diagonal, because every question is about one feature at a time. On the moons that means a staircase approximating a curve.\n\nPush depth to 8 and accuracy hits 1.00 — but look at the thin slivers carved out around individual points. Each sliver is the tree memorizing one example. That is overfitting you can see."}
      formalName="CART (Classification and Regression Trees)"
      formalNote="Greedily picks the split with the largest impurity decrease, recursing until a stopping rule fires. Needs no feature scaling and handles mixed types, but a single deep tree is high-variance."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={[{ id: "spam", label: "Spam" }, { id: "moons", label: "Moons" }, { id: "xor", label: "XOR" }, { id: "circles", label: "Ring" }]} />
        <Slider label="Max depth" value={depth} set={setDepth} min={1} max={8} step={1} color={P.highlight}
          hint={depth === 1 ? "a single question (stump)" : depth >= 7 ? "likely memorizing" : `${leaves} leaves`} />
        <Choice label="Impurity measure" value={criterion} set={setCriterion} options={[{ id: "gini", label: "Gini" }, { id: "entropy", label: "Entropy" }]} />
      </Controls>

      <Row>
        <Col flex="1 1 330px">
          <Plot width={350} height={300} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={grid.cells} dx={grid.dx} dy={grid.dy} sx={sx} sy={sy} opacity={0.75} />
                {/* the root split, called out */}
                {!tree.leaf && (tree.feature === 0
                  ? <line x1={sx(tree.threshold)} y1={sy(bb.yMin)} x2={sx(tree.threshold)} y2={sy(bb.yMax)} stroke={P.highlight} strokeWidth="2.2" />
                  : <line x1={sx(bb.xMin)} y1={sy(tree.threshold)} x2={sx(bb.xMax)} y2={sy(tree.threshold)} stroke={P.highlight} strokeWidth="2.2" />)}
                {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.6} />)}
              </g>
            )}
          </Plot>
          <Caption>Amber is the very first question. Every boundary is axis-aligned — no diagonals possible.</Caption>
        </Col>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>The tree it built</div>
          <TreeDiagram node={tree} ds={ds} width={360} height={225} />
          <Caption>f0 = {ds.xLabel}, f1 = {ds.yLabel}. B / R leaves are the predicted class; the number below is how many training points landed there.</Caption>
          <Stats>
            <Stat label="Leaves" value={leaves} color={P.text} />
            <Stat label="Accuracy" value={f2(acc)} color={acc === 1 ? P.good : P.highlight} />
            <Stat label="Root gain" value={f3(tree.gain || 0)} color={P.good} />
          </Stats>
        </Col>
      </Row>
      {setId === "xor" && depth === 1 && (
        <Verdict tone="warn">
          Depth 1 gets exactly 0.50 on XOR — no better than a coin flip. Neither feature alone carries any signal. Set depth to 2 and it jumps to 1.00: the second question is what unlocks the interaction.
        </Verdict>
      )}
      {depth >= 7 && acc === 1 && (
        <Verdict tone="bad">Perfect training accuracy with {leaves} leaves for {ds.X.length} points. Those thin slivers are memorized individual examples — this will not generalize.</Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. RANDOM FORESTS
// ════════════════════════════════════════════════════════════════════════════

export function RandomForestSim() {
  const [nTrees, setNTrees] = useState(12);
  const [depth, setDepth] = useState(4);
  const [setId, setSetId] = useState("moons");
  const [showTree, setShowTree] = useState(0);

  const ds = D.CLASSIFICATION_SETS.find((d) => d.id === setId);
  const forest = useMemo(() => M.randomForest(ds.X, ds.y, { nTrees, maxDepth: depth, nClasses: 2, seed: 7 }), [setId, nTrees, depth]);
  const single = useMemo(() => M.buildTree(ds.X, ds.y, { maxDepth: depth, nClasses: 2 }), [setId, depth]);
  const bb = bounds(ds.X);

  const forestGrid = useMemo(() => M.decisionGrid((p) => M.forestProba(forest, p)[1], { ...bb, res: 34 }), [setId, nTrees, depth]);
  const oneGrid = useMemo(() => {
    const t = forest.trees[Math.min(showTree, forest.trees.length - 1)];
    return M.decisionGrid((p) => M.treePredict(t.tree, t.feats.map((f) => p[f])), { ...bb, res: 34 });
  }, [setId, nTrees, depth, showTree]);

  const accF = M.accuracy(ds.y, ds.X.map((p) => M.forestPredict(forest, p)));
  const accS = M.accuracy(ds.y, ds.X.map((p) => M.treePredict(single, p)));
  const votesAtCenter = forest.trees.map((t) => M.treePredict(t.tree, t.feats.map((f) => [(bb.xMin + bb.xMax) / 2, (bb.yMin + bb.yMax) / 2][f])));

  return (
    <Sim
      n={8}
      title="Random Forests"
      breadcrumb="Supervised · Ensemble"
      hook={<>One deep tree memorizes. So grow <strong>{nTrees}</strong> of them, each on a different random sample of the data, and let them vote. Individually they are worse; together they are better.</>}
      question="Each tree sees a different slice of the data and draws a different boundary. What does averaging them do?"
      readout={
        <>
          Tree #{showTree + 1} alone scores <strong style={{ fontFamily: "Consolas, monospace" }}>
            {f2(M.accuracy(ds.y, ds.X.map((p) => { const t = forest.trees[Math.min(showTree, forest.trees.length - 1)]; return M.treePredict(t.tree, t.feats.map((f) => p[f])); })))}
          </strong>.
          {" "}All <strong>{nTrees}</strong> voting together score
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f2(accF)}</strong>,
          {" "}versus <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(accS)}</strong> for a single tree trained on all the data.
          {" "}Each tree was trained on about <strong style={{ fontFamily: "Consolas, monospace" }}>63%</strong> of the rows —
          {" "}tree #{showTree + 1} left <strong style={{ fontFamily: "Consolas, monospace" }}>{forest.trees[Math.min(showTree, forest.trees.length - 1)].oob.length}</strong> points out entirely.
        </>
      }
      notice={"Step through the individual trees. Each boundary is different and each looks worse than the ensemble — jagged, oddly placed, clearly reacting to whichever points it happened to be given.\n\nThe averaged boundary is smooth and confident in the middle, uncertain (purple) exactly where the trees disagree. Those blended zones are the ensemble telling you where it is unsure, which a single tree never does."}
      formalName="Random Forest (bootstrap aggregating + feature subsampling)"
      formalNote="Sampling rows with replacement decorrelates the trees; averaging then cancels their individual variance while keeping their low bias. The rows a tree never saw give a free validation estimate."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={setSetId} options={[{ id: "moons", label: "Moons" }, { id: "circles", label: "Ring" }, { id: "xor", label: "XOR" }, { id: "loan", label: "Loans" }]} />
        <Slider label="Trees in the forest" value={nTrees} set={(v) => { setNTrees(v); setShowTree(Math.min(showTree, v - 1)); }} min={1} max={40} step={1} color={P.good} />
        <Slider label="Depth of each tree" value={depth} set={setDepth} min={1} max={7} step={1} color={P.highlight} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <Plot width={320} height={280} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={oneGrid.cells} dx={oneGrid.dx} dy={oneGrid.dy} sx={sx} sy={sy} opacity={0.75} />
                {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.2} opacity={0.75} />)}
              </g>
            )}
          </Plot>
          <Caption>One tree, on its own random sample</Caption>
          <div style={{ marginTop: 6 }}>
            <Slider label="Which tree" value={showTree} set={setShowTree} min={0} max={Math.max(0, nTrees - 1)} step={1}
              fmt={(v) => `#${v + 1}`} color={P.predict} />
          </div>
        </Col>
        <Col flex="1 1 300px">
          <Plot width={320} height={280} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                <Regions cells={forestGrid.cells} dx={forestGrid.dx} dy={forestGrid.dy} sx={sx} sy={sy} opacity={0.9} />
                {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={ds.y[i] ? P.class1 : P.class0} r={3.2} opacity={0.75} />)}
              </g>
            )}
          </Plot>
          <Caption>All {nTrees} averaged. Blended colours = trees disagree there.</Caption>
        </Col>
      </Row>
      <Stats>
        <Stat label="One tree" value={f2(M.accuracy(ds.y, ds.X.map((p) => { const t = forest.trees[Math.min(showTree, forest.trees.length - 1)]; return M.treePredict(t.tree, t.feats.map((f) => p[f])); })))} color={P.dim} />
        <Stat label={`Forest of ${nTrees}`} value={f2(accF)} color={P.good} big />
        <Stat label="Single full tree" value={f2(accS)} color={P.highlight} />
        <Stat label="Left out of tree" value={forest.trees[Math.min(showTree, forest.trees.length - 1)].oob.length} color={P.derived} hint="out-of-bag" />
      </Stats>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. GRADIENT BOOSTING / XGBOOST
// ════════════════════════════════════════════════════════════════════════════

export function BoostingSim() {
  const [stage, setStage] = useState(0);
  const [lr, setLr] = useState(0.3);
  const [maxDepth, setMaxDepth] = useState(2);
  const nStages = 12;

  const ds = D.TEMPERATURE_DAY;
  const X = ds.points.map((p) => [p.x]), y = ds.points.map((p) => p.y);
  const model = useMemo(() => M.gradientBoost(X, y, { nStages, lr, maxDepth }), [lr, maxDepth]);

  const curMse = stage === 0 ? M.mse(y, y.map(() => M.mean(y))) : model.stages[stage - 1].mse;
  const residuals = stage === 0 ? y.map((v) => v - M.mean(y)) : model.stages[stage - 1].residual;
  const nextRes = stage < nStages ? (model.stages[stage]?.residual || residuals) : residuals;

  const curve = Array.from({ length: 60 }, (_, i) => {
    const x = 6 + (i / 59) * 13;
    return [x, stage === 0 ? M.mean(y) : M.boostPredict(model, [x], stage)];
  });

  return (
    <Sim
      n={9}
      title="Gradient Boosting"
      breadcrumb="Supervised · Ensemble"
      hook={<>A forest builds every tree independently. Boosting instead builds them <strong>in sequence</strong>: each new tree is trained only on what the previous ones got <em>wrong</em>.</>}
      question="Start with a flat guess — the average temperature. Can a chain of tiny corrections turn it into the right curve?"
      readout={
        stage === 0
          ? <>Stage 0: predict the average, <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{f2(M.mean(y))}°C</strong>, for every hour. Error <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{f2(curMse)}</strong>. The leftover misses below are what tree 1 will be trained on.</>
          : <>After <strong>{stage}</strong> {stage === 1 ? "tree" : "trees"}, error is
            {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f2(curMse)}</strong>
            {" "}— down from <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(M.mse(y, y.map(() => M.mean(y))))}</strong> at stage 0
            {" "}(<strong style={{ fontFamily: "Consolas, monospace" }}>{((1 - curMse / M.mse(y, y.map(() => M.mean(y)))) * 100).toFixed(0)}%</strong> of the error removed).
            {" "}Biggest remaining miss: <strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{f2(Math.max(...residuals.map(Math.abs)))}°C</strong>.</>
      }
      notice={"Watch the lower panel, not the upper one. The residuals are the whole algorithm: each tree looks only at those bars and tries to flatten them. As they shrink, the prediction above sharpens.\n\nSet the learning rate to 1.0 and step through: it lurches, overshoots, and the residuals bounce. At 0.1 it moves too slowly to finish in 12 trees. Small steps and many trees beats big steps and few — that is the whole tuning story."}
      formalName="Gradient Boosting (the idea behind XGBoost and LightGBM)"
      formalNote="Each tree fits the negative gradient of the loss — for squared error, exactly the residuals. Learning rate shrinks each tree's contribution, trading more trees for better generalization."
    >
      <Controls>
        <Slider label="Learning rate" value={lr} set={(v) => { setLr(v); setStage(0); }} min={0.05} max={1} step={0.05} fmt={f2} color={P.highlight}
          hint={lr >= 0.8 ? "lurches" : lr <= 0.1 ? "too slow" : "healthy"} />
        <Slider label="Depth per tree" value={maxDepth} set={(v) => { setMaxDepth(v); setStage(0); }} min={1} max={4} step={1} color={P.derived}
          hint={maxDepth === 1 ? "stumps" : "weak learners"} />
      </Controls>
      <StepPlayer step={stage} setStep={setStage} max={nStages} speed={700} autoLabel="Add trees"
        labels={Array.from({ length: nStages + 1 }, (_, i) => i === 0
          ? "Stage 0 — the flat average. Every point is wrong by some amount."
          : `Tree ${i} trained on the leftover misses from the previous ${i - 1 === 0 ? "guess" : "trees"}. Error now ${f2(model.stages[i - 1].mse)}.`)} />

      <Row>
        <Col flex="1 1 340px">
          <Plot width={360} height={230} xMin={5.5} xMax={19.5} yMin={5} yMax={30} xLabel="Hour of Day" yLabel="Temperature (°C)">
            {({ sx, sy }) => (
              <g>
                <Line pts={Array.from({ length: 60 }, (_, i) => { const x = 6 + (i / 59) * 13; return [sx(x), sy(ds.trueFn(x))]; })}
                  color={P.faint} width={1.3} dash="4 4" />
                <Line pts={curve.map(([x, v]) => [sx(x), sy(v)])} color={P.predict} width={2.6} />
                {ds.points.map((p, i) => (
                  <g key={i}>
                    <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(p.y - residuals[i])} stroke={P.class1} strokeWidth="1.3" opacity="0.55" />
                    <Dot cx={sx(p.x)} cy={sy(p.y)} color={P.class0} r={4} />
                  </g>
                ))}
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.class0, label: "readings" }, { color: P.predict, label: "prediction so far", line: true }, { color: P.faint, label: "true shape", dash: true }]} />
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What is still wrong — the next tree's only input
          </div>
          <Plot width={340} height={200} xMin={5.5} xMax={19.5} yMin={-9} yMax={9} xLabel="Hour of Day" yLabel="Miss (°C)" yTicks={5}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(5.5)} y1={sy(0)} x2={sx(19.5)} y2={sy(0)} stroke={P.axis} strokeWidth="1.4" />
                {ds.points.map((p, i) => (
                  <rect key={i} x={sx(p.x) - 7} y={residuals[i] >= 0 ? sy(residuals[i]) : sy(0)}
                    width={14} height={Math.max(1, Math.abs(sy(residuals[i]) - sy(0)))}
                    fill={residuals[i] >= 0 ? P.class1 : P.class0} opacity="0.8" rx="2" />
                ))}
                {stage < nStages && ds.points.map((p, i) => (
                  <Dot key={`n${i}`} cx={sx(p.x)} cy={sy(nextRes[i])} color={P.good} r={2.6} />
                ))}
              </g>
            )}
          </Plot>
          <Caption>Bars = current misses. Green dots = what they become after the next tree. The goal is to flatten every bar to zero.</Caption>
          <Stats>
            <Stat label="Trees used" value={stage} color={P.text} />
            <Stat label="Error" value={f2(curMse)} color={P.good} />
            <Stat label="Worst miss" value={f2(Math.max(...residuals.map(Math.abs)))} unit="°C" color={P.class1} />
          </Stats>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10. K-MEANS CLUSTERING
// ════════════════════════════════════════════════════════════════════════════

export function KMeansSim() {
  const [k, setK] = useState(3);
  const [seed, setSeed] = useState(3);
  const [iter, setIter] = useState(0);
  const [setId, setSetId] = useState("customers");

  const ds = D.CLUSTER_SETS.find((d) => d.id === setId);
  const maxIter = 10;

  // Recompute the whole trajectory so the step player can scrub freely.
  const history = useMemo(() => {
    let cent = M.kmeansInit(ds.X, k, seed);
    const out = [{ centroids: cent.map((c) => [...c]), labels: null, inertia: null, phase: "init" }];
    for (let t = 0; t < maxIter; t++) {
      const labels = M.kmeansAssign(ds.X, cent);
      out.push({ centroids: cent.map((c) => [...c]), labels: [...labels], inertia: M.inertia(ds.X, labels, cent), phase: "assign" });
      const nc = M.kmeansUpdate(ds.X, labels, k).map((c, j) => c || cent[j]);
      const moved = nc.reduce((s, c, j) => s + Math.hypot(c[0] - cent[j][0], c[1] - cent[j][1]), 0);
      cent = nc;
      out.push({ centroids: cent.map((c) => [...c]), labels: [...labels], inertia: M.inertia(ds.X, labels, cent), phase: "move", moved });
      if (moved < 1e-9) break;
    }
    return out;
  }, [setId, k, seed]);

  const cur = history[Math.min(iter, history.length - 1)];
  const bb = bounds(ds.X);
  const CL = [P.class0, P.class1, P.predict, P.derived, P.highlight, P.good];
  const converged = history.length < maxIter * 2;

  // Elbow curve: inertia for every k
  const elbow = useMemo(() => [1, 2, 3, 4, 5, 6].map((kk) => {
    let c = M.kmeansInit(ds.X, kk, seed);
    let lab = [];
    for (let t = 0; t < 25; t++) { lab = M.kmeansAssign(ds.X, c); c = M.kmeansUpdate(ds.X, lab, kk).map((x, j) => x || c[j]); }
    return { k: kk, inertia: M.inertia(ds.X, lab, c) };
  }), [setId, seed]);

  return (
    <Sim
      n={10}
      title="K-Means Clustering"
      breadcrumb="Unsupervised"
      hook={<>Nobody labelled these {ds.X.length} shoppers. Drop <strong>{k}</strong> markers at random, then repeat two steps: each shopper joins its nearest marker, then each marker moves to the middle of its group.</>}
      question={ds.question}
      readout={
        cur.phase === "init"
          ? <>Started with <strong>{k}</strong> markers placed at random (seed {seed}). Nothing is assigned yet — press play.</>
          : <>
            Round <strong>{Math.ceil(iter / 2)}</strong>, just {cur.phase === "assign" ? "assigned every point to its nearest marker" : "moved each marker to the centre of its group"}.
            {" "}Total spread <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{cur.inertia.toFixed(1)}</strong>
            {" "}(started at <span style={{ fontFamily: "Consolas, monospace" }}>{history[1]?.inertia.toFixed(1)}</span>).
            {" "}Group sizes: <strong style={{ fontFamily: "Consolas, monospace" }}>
              {Array.from({ length: k }, (_, j) => cur.labels.filter((l) => l === j).length).join(" / ")}
            </strong>.
            {cur.phase === "move" && cur.moved < 1e-9 && <span style={{ color: P.good }}> Markers stopped moving — done.</span>}
          </>
      }
      notice={"Change the seed a few times with k = 3. Sometimes you get the three obvious groups; sometimes two markers land in one blob and split it while the third swallows two. Same data, same algorithm, different answer — k-means only finds a LOCAL optimum, which is why real implementations restart it ten times and keep the best.\n\nThe elbow plot on the right is how you choose k without knowing the answer: spread always falls as k rises, so you look for where it stops falling steeply."}
      formalName="k-Means (Lloyd's algorithm)"
      formalNote="Alternates assignment and centroid update, minimizing within-cluster sum of squares. Assumes clusters are spherical and similarly sized — which is exactly what the uneven dataset breaks."
    >
      <Controls>
        <Choice label="Dataset" value={setId} set={(v) => { setSetId(v); setIter(0); }} options={D.CLUSTER_SETS.map((d) => ({ id: d.id, label: d.id === "customers" ? "Shoppers (3 groups)" : "Uneven blobs" }))} />
        <Slider label="k (markers)" value={k} set={(v) => { setK(v); setIter(0); }} min={1} max={6} step={1} color={P.highlight}
          hint={ds.trueK === k ? "matches the real structure" : k < ds.trueK ? "too few" : "too many"} />
        <Slider label="Random start" value={seed} set={(v) => { setSeed(v); setIter(0); }} min={1} max={12} step={1} color={P.derived}
          hint="different seed, different answer" />
      </Controls>
      <StepPlayer step={iter} setStep={setIter} max={history.length - 1} speed={800} autoLabel="Run"
        labels={history.map((h, i) => h.phase === "init" ? "Markers dropped at random. No groups yet."
          : h.phase === "assign" ? `Assign: every point joins its nearest marker. Spread ${h.inertia.toFixed(1)}.`
            : `Move: each marker jumps to the centre of its group. Spread ${h.inertia.toFixed(1)}.${h.moved < 1e-9 ? " Nothing moved — converged." : ""}`)} />

      <Row>
        <Col flex="1 1 330px">
          <Plot width={350} height={300} {...bb} xLabel={ds.xLabel} yLabel={ds.yLabel}>
            {({ sx, sy }) => (
              <g>
                {/* spokes from points to their marker: the assignment made visible */}
                {cur.labels && ds.X.map((p, i) => (
                  <line key={i} x1={sx(p[0])} y1={sy(p[1])} x2={sx(cur.centroids[cur.labels[i]][0])} y2={sy(cur.centroids[cur.labels[i]][1])}
                    stroke={CL[cur.labels[i] % CL.length]} strokeWidth="0.7" opacity="0.3" />
                ))}
                {ds.X.map((p, i) => (
                  <Dot key={i} cx={sx(p[0])} cy={sy(p[1])}
                    color={cur.labels ? CL[cur.labels[i] % CL.length] : P.faint} r={3.8} />
                ))}
                {cur.centroids.map((c, j) => (
                  <g key={j}>
                    <circle cx={sx(c[0])} cy={sy(c[1])} r={9} fill={CL[j % CL.length]} stroke={P.bg} strokeWidth="2" />
                    <circle cx={sx(c[0])} cy={sy(c[1])} r={13} fill="none" stroke={CL[j % CL.length]} strokeWidth="1.3" strokeDasharray="3 2" />
                  </g>
                ))}
              </g>
            )}
          </Plot>
          <Caption>Big rings are the markers. Faint spokes show which marker each point currently belongs to.</Caption>
        </Col>
        <Col flex="1 1 280px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Spread falls every round, never rises</div>
          <Plot width={300} height={150} xMin={0} xMax={Math.max(4, history.length - 1)} yMin={0} yMax={Math.max(...history.filter((h) => h.inertia).map((h) => h.inertia)) * 1.1}
            xLabel="step" yLabel="total spread" xTicks={3} yTicks={3} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={history.map((h, i) => h.inertia ? [sx(i), sy(h.inertia)] : null).filter(Boolean)} color={P.good} width={2} />
                {cur.inertia && <Dot cx={sx(iter)} cy={sy(cur.inertia)} color={P.highlight} r={5} halo={P.highlight} />}
              </g>
            )}
          </Plot>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Choosing k: the elbow</div>
          <Bars width={300} height={130} items={elbow.map((e) => ({ label: `k=${e.k}`, value: e.inertia }))}
            fmt={(v) => v.toFixed(0)} colorFor={(it, i) => (elbow[i].k === k ? P.highlight : elbow[i].k === ds.trueK ? P.good : P.faint)} />
          <Caption>Green is the true number of groups. The bend is where extra markers stop buying much.</Caption>
        </Col>
      </Row>
      {setId === "uneven" && k === 2 && iter > 4 && (
        <Verdict tone="warn">
          k-means splits the dense blob and hands part of it to the sparse one, because it minimizes squared distance and assumes both clusters are the same size and shape. This is its central blind spot.
        </Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11. PRINCIPAL COMPONENT ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

export function PcaSim() {
  const [angle, setAngle] = useState(20);
  const [snap, setSnap] = useState(false);

  const ds = D.HEIGHT_WEIGHT;
  const pca = useMemo(() => M.pca(ds.X, 2), []);
  const bestAngle = (Math.atan2(pca.components[0].vector[1], pca.components[0].vector[0]) * 180) / Math.PI;
  const theta = ((snap ? bestAngle : angle) * Math.PI) / 180;
  const proj = M.projectOnto(ds.X, theta);

  const totalVar = M.variance(ds.X.map((p) => p[0])) + M.variance(ds.X.map((p) => p[1]));
  const pct = (proj.variance / totalVar) * 100;
  const bb = bounds(ds.X, 0.14);

  // Variance as a function of direction — the curve you are climbing.
  const sweep = useMemo(() => Array.from({ length: 91 }, (_, i) => {
    const t = (i * 2 * Math.PI) / 180;
    return { deg: i * 2, v: M.projectOnto(ds.X, t).variance };
  }), []);
  const maxSweep = Math.max(...sweep.map((s) => s.v));

  return (
    <Sim
      n={11}
      title="Principal Component Analysis"
      breadcrumb="Unsupervised · Dimensionality reduction"
      hook={<>Each of these 90 people has two numbers: <strong style={{ color: P.class0 }}>height</strong> and <strong style={{ color: P.class0 }}>weight</strong>. But the cloud <em>leans</em> — tall people tend to be heavier. If you had to keep only <strong>one</strong> number per person, which one loses the least?</>}
      question={ds.question}
      readout={
        <>
          Projecting onto a line at <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{Math.round(snap ? bestAngle : angle)}°</strong> keeps
          {" "}<strong style={{ color: pct > 95 ? P.good : P.highlight, fontFamily: "Consolas, monospace" }}>{pct.toFixed(1)}%</strong> of the total variation,
          {" "}with an average squared reconstruction error of <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(proj.reconError)}</strong>.
          {" "}The best possible direction is <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{Math.round(bestAngle)}°</strong>,
          {" "}keeping <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{(pca.components[0].explained * 100).toFixed(1)}%</strong>.
          {" "}Keeping height alone (0°) would preserve only <strong style={{ fontFamily: "Consolas, monospace" }}>{((M.projectOnto(ds.X, 0).variance / totalVar) * 100).toFixed(1)}%</strong>.
        </>
      }
      notice={"Two things happen at the same angle, and that is the whole idea: the spread along the line is largest exactly where the reconstruction error is smallest. Maximizing what you keep and minimizing what you lose are the same problem.\n\nNotice the best direction is neither height nor weight. It is a blend — roughly \"overall body size\" — and no original axis could have expressed it."}
      formalName="Principal Component Analysis"
      formalNote="The principal components are the eigenvectors of the covariance matrix, ordered by eigenvalue. Each eigenvalue is the variance captured along its direction."
    >
      <Controls>
        <Slider label="Direction to project onto" value={angle} set={(v) => { setAngle(v); setSnap(false); }} min={0} max={179} step={1} unit="°" color={P.highlight} />
        <Toggle label="Snap to best direction" on={snap} set={setSnap} color={P.good} />
      </Controls>

      <Row>
        <Col flex="1 1 330px">
          <Plot width={350} height={300} {...bb} xLabel="Height (cm)" yLabel="Weight (kg)" xFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => {
              const L = 60;
              const [mx, my] = proj.mu;
              return (
                <g>
                  {/* projection spokes: what gets thrown away */}
                  {ds.X.map((p, i) => (
                    <line key={i} x1={sx(p[0])} y1={sy(p[1])} x2={sx(proj.recon[i][0])} y2={sy(proj.recon[i][1])}
                      stroke={P.class1} strokeWidth="0.9" opacity="0.4" />
                  ))}
                  <Line pts={[[sx(mx - proj.u[0] * L), sy(my - proj.u[1] * L)], [sx(mx + proj.u[0] * L), sy(my + proj.u[1] * L)]]}
                    color={P.highlight} width={2.2} />
                  {ds.X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={P.class0} r={3.2} opacity={0.7} />)}
                  {proj.recon.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={P.predict} r={2.2} />)}
                  <Dot cx={sx(mx)} cy={sy(my)} color={P.good} r={4.5} halo={P.good} />
                </g>
              );
            }}
          </Plot>
          <Key items={[{ color: P.class0, label: "people" }, { color: P.highlight, label: "the line you keep", line: true },
            { color: P.predict, label: "where they land" }, { color: P.class1, label: "what is lost", dash: true }]} />
        </Col>
        <Col flex="1 1 290px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Variance kept, by direction
          </div>
          <Plot width={310} height={160} xMin={0} xMax={180} yMin={0} yMax={maxSweep * 1.12} xLabel="angle (°)" yLabel="variance kept" xTicks={4} yTicks={3} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={sweep.map((s) => [sx(s.deg), sy(s.v)])} color={P.derived} width={2} />
                <line x1={sx(bestAngle < 0 ? bestAngle + 180 : bestAngle)} y1={sy(0)} x2={sx(bestAngle < 0 ? bestAngle + 180 : bestAngle)} y2={sy(maxSweep * 1.12)}
                  stroke={P.good} strokeWidth="1.4" strokeDasharray="4 3" />
                <Dot cx={sx(snap ? (bestAngle < 0 ? bestAngle + 180 : bestAngle) : angle)} cy={sy(proj.variance)} color={P.highlight} r={5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Caption>One hill, one peak. The dashed green line is the principal component.</Caption>
          <Stats>
            <Stat label="Variance kept" value={`${pct.toFixed(1)}%`} color={pct > 95 ? P.good : P.highlight} big />
            <Stat label="Recon. error" value={f2(proj.reconError)} color={P.class1} />
          </Stats>
          <Stats>
            <Stat label="PC1 explains" value={`${(pca.components[0].explained * 100).toFixed(1)}%`} color={P.good} />
            <Stat label="PC2 explains" value={`${(pca.components[1].explained * 100).toFixed(1)}%`} color={P.faint} />
          </Stats>
          <Note>
            Two numbers became one and {pct.toFixed(1)}% of the information survived. On a 4096-pixel image the same trick routinely keeps 95% with 100 numbers instead of 4096.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

export const CORE_ML_SIMS = [
  { id: "linreg", label: "Linear Regression", Comp: LinearRegressionSim },
  { id: "gd", label: "Gradient Descent", Comp: GradientDescentSim },
  { id: "logreg", label: "Logistic Regression", Comp: LogisticRegressionSim },
  { id: "nb", label: "Naive Bayes", Comp: NaiveBayesSim },
  { id: "knn", label: "K-Nearest Neighbours", Comp: KnnSim },
  { id: "svm", label: "Support Vector Machines", Comp: SvmSim },
  { id: "tree", label: "Decision Trees", Comp: DecisionTreeSim },
  { id: "forest", label: "Random Forests", Comp: RandomForestSim },
  { id: "boost", label: "Gradient Boosting", Comp: BoostingSim },
  { id: "kmeans", label: "K-Means Clustering", Comp: KMeansSim },
  { id: "pca", label: "PCA", Comp: PcaSim },
];
