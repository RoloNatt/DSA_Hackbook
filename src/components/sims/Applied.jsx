import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Guide, Label, Heatmap, Bars, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");
const pct = (v) => `${(v * 100).toFixed(1)}%`;

// ════════════════════════════════════════════════════════════════════════════
// 1. OVERFITTING
// ════════════════════════════════════════════════════════════════════════════

export function OverfittingSim() {
  const [degree, setDegree] = useState(3);
  const [lambda, setLambda] = useState(0);
  const [nTrain, setNTrain] = useState(9);

  const ds = D.TEMPERATURE_DAY;
  const all = ds.points;
  // Alternate points into train/test so both cover the same range.
  const trainIdx = all.map((_, i) => i).filter((i) => i % 2 === 0).slice(0, nTrain);
  const testIdx = all.map((_, i) => i).filter((i) => i % 2 === 1);
  const trX = trainIdx.map((i) => all[i].x), trY = trainIdx.map((i) => all[i].y);
  const teX = testIdx.map((i) => all[i].x), teY = testIdx.map((i) => all[i].y);

  const w = useMemo(() => M.polyFit(trX, trY, degree, lambda), [degree, lambda, nTrain]);
  const trainErr = M.mse(trY, trX.map((x) => M.polyEval(w, x)));
  const testErr = M.mse(teY, teX.map((x) => M.polyEval(w, x)));

  const curve = Array.from({ length: 120 }, (_, i) => { const x = 5.5 + (i / 119) * 14; return [x, M.polyEval(w, x)]; });
  const sweep = useMemo(() => Array.from({ length: 10 }, (_, d) => {
    const ww = M.polyFit(trX, trY, d + 1, lambda);
    return { d: d + 1, tr: M.mse(trY, trX.map((x) => M.polyEval(ww, x))), te: M.mse(teY, teX.map((x) => M.polyEval(ww, x))) };
  }), [lambda, nTrain]);
  const bestD = sweep.reduce((a, b) => (b.te < a.te ? b : a));
  const gap = testErr - trainErr;

  return (
    <Sim
      n={1}
      title="Overfitting"
      breadcrumb="Applied ML · The central problem"
      hook={<>Temperature readings through one day, taken every hour. Half are used to fit the curve (blue); the other half are hidden and used only to check it (amber). The true shape is a smooth arc — the wobble is measurement noise.</>}
      question="How curvy should the fit be? More flexibility always fits the training points better, so what stops you?"
      readout={
        <>
          Degree <strong style={{ fontFamily: "Consolas, monospace" }}>{degree}</strong> with penalty
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(lambda)}</strong>:
          {" "}training error <strong style={{ color: P.class0, fontFamily: "Consolas, monospace" }}>{f2(trainErr)}</strong>,
          {" "}held-out error <strong style={{ color: testErr < trainErr * 3 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f2(testErr)}</strong>
          {" "}— a gap of <strong style={{ color: gap > trainErr * 2 ? P.bad : P.good, fontFamily: "Consolas, monospace" }}>{f2(gap)}</strong>.
          {" "}Best held-out error across all degrees is at degree
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{bestD.d}</strong> ({f2(bestD.te)}).
        </>
      }
      notice={"Set the degree to 9 with no penalty. The curve passes almost exactly through every blue point — training error near zero — and then swings wildly between them, missing every amber point. Zero training error, useless model.\n\nNow raise the penalty. The curve calms down, training error rises slightly, and held-out error drops. That is regularization: deliberately fitting the training data worse in order to predict better."}
      formalName="Overfitting, and ridge regularization"
      formalNote="A model with more parameters than the data supports fits the noise as well as the signal. The L2 penalty adds λ‖w‖² to the loss, shrinking coefficients toward zero and buying variance reduction at the price of a little bias."
    >
      <Controls>
        <Slider label="Polynomial degree" value={degree} set={setDegree} min={1} max={9} step={1} color={P.highlight}
          hint={degree === 1 ? "a straight line — too rigid" : degree >= 8 ? "very flexible" : ""} />
        <Slider label="Regularization λ" value={lambda} set={setLambda} min={0} max={20} step={0.5} fmt={f2} color={P.derived}
          hint={lambda === 0 ? "none" : lambda > 10 ? "heavy" : "moderate"} />
        <Slider label="Training points" value={nTrain} set={setNTrain} min={4} max={7} step={1} color={P.class0} />
      </Controls>

      <Row>
        <Col flex="1 1 360px">
          <Plot width={380} height={260} xMin={5.5} xMax={19.5} yMin={0} yMax={34}
            xLabel="Hour of Day" yLabel="Temperature (°C)">
            {({ sx, sy }) => (
              <g>
                <Line pts={Array.from({ length: 100 }, (_, i) => { const x = 6 + (i / 99) * 13; return [sx(x), sy(ds.trueFn(x))]; })}
                  color={P.faint} width={1.3} dash="4 4" />
                <Line pts={curve.filter(([, y]) => y > -20 && y < 60).map(([x, y]) => [sx(x), sy(y)])} color={P.predict} width={2.4} />
                {testIdx.map((i) => (
                  <line key={`t${i}`} x1={sx(all[i].x)} y1={sy(all[i].y)} x2={sx(all[i].x)} y2={sy(M.polyEval(w, all[i].x))}
                    stroke={P.highlight} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7" />
                ))}
                {trainIdx.map((i) => <Dot key={`r${i}`} cx={sx(all[i].x)} cy={sy(all[i].y)} color={P.class0} r={4.5} />)}
                {testIdx.map((i) => <Dot key={`e${i}`} cx={sx(all[i].x)} cy={sy(all[i].y)} color={P.highlight} r={4.5} />)}
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.class0, label: "used to fit" }, { color: P.highlight, label: "held back" },
            { color: P.predict, label: "the fit", line: true }, { color: P.faint, label: "true shape", dash: true }]} />
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Error vs flexibility — the whole story in one plot
          </div>
          <Plot width={310} height={190} xMin={1} xMax={10} yMin={0} yMax={Math.min(200, Math.max(...sweep.map((s) => s.te)) * 1.1)}
            xLabel="polynomial degree" yLabel="mean squared error" xTicks={4} yTicks={4} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={sweep.map((s) => [sx(s.d), sy(Math.min(200, s.tr))])} color={P.class0} width={2.2} />
                <Line pts={sweep.map((s) => [sx(s.d), sy(Math.min(200, s.te))])} color={P.highlight} width={2.2} />
                <line x1={sx(bestD.d)} y1={sy(0)} x2={sx(bestD.d)} y2={sy(Math.min(200, Math.max(...sweep.map((s) => s.te)) * 1.1))}
                  stroke={P.good} strokeWidth="1.3" strokeDasharray="4 3" />
                <Dot cx={sx(degree)} cy={sy(Math.min(200, testErr))} color={P.bad} r={5.5} halo={P.bad} />
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.class0, label: "training error", line: true }, { color: P.highlight, label: "held-out error", line: true }, { color: P.good, label: "best degree", dash: true }]} />
          <Caption>Training error only ever falls. Held-out error turns back up — and that turning point is the answer.</Caption>
          <Stats>
            <Stat label="Training" value={f2(trainErr)} color={P.class0} />
            <Stat label="Held out" value={f2(testErr)} color={testErr < trainErr * 3 ? P.good : P.bad} big />
            <Stat label="Gap" value={f2(gap)} color={gap > trainErr * 2 ? P.bad : P.good} />
          </Stats>
          {degree >= 7 && lambda < 1 && (
            <Verdict tone="bad">
              Training error {f2(trainErr)} but held-out error {f2(testErr)} — {(testErr / Math.max(0.01, trainErr)).toFixed(0)}× worse. The curve has memorized the noise in the blue points.
            </Verdict>
          )}
          {degree === 1 && (
            <Verdict tone="warn">A straight line cannot bend. Both errors are high together — that is underfitting, and more data will not help.</Verdict>
          )}
          {degree === bestD.d && (
            <Verdict tone="good">This is the best held-out error available. Flexible enough to capture the arc, not flexible enough to chase noise.</Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. CROSS-VALIDATION
// ════════════════════════════════════════════════════════════════════════════

export function CrossValidationSim() {
  const [k, setK] = useState(5);
  const [fold, setFold] = useState(0);
  const [degree, setDegree] = useState(3);

  const ds = D.TEMPERATURE_DAY;
  const n = ds.points.length;
  const folds = useMemo(() => M.kFolds(n, k, 5), [k, n]);

  const perFold = useMemo(() => folds.map((f) => {
    const trX = f.train.map((i) => ds.points[i].x), trY = f.train.map((i) => ds.points[i].y);
    const teX = f.test.map((i) => ds.points[i].x), teY = f.test.map((i) => ds.points[i].y);
    const w = M.polyFit(trX, trY, degree, 0);
    return { ...f, err: M.mse(teY, teX.map((x) => M.polyEval(w, x))), w };
  }), [folds, degree]);

  const mean = M.mean(perFold.map((f) => f.err));
  const sd = M.std(perFold.map((f) => f.err));
  const cur = perFold[Math.min(fold, k - 1)];
  const singleSplit = perFold[0].err;

  return (
    <Sim
      n={2}
      title="Cross-Validation"
      breadcrumb="Applied ML · Trusting your estimate"
      hook={<>You hold back some data to test on. But <em>which</em> data you happened to hold back changes the answer — sometimes a lot. With only {n} readings, one unlucky split can make a bad model look good.</>}
      question="How do you get an error estimate that does not depend on one lucky split?"
      readout={
        <>
          Fold <strong>{fold + 1}</strong> of {k} trains on
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{cur.train.length}</strong> points, tests on
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{cur.test.length}</strong>, and gets error
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(cur.err)}</strong>.
          {" "}Across all {k} folds errors range
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(Math.min(...perFold.map((f) => f.err)))} to {f2(Math.max(...perFold.map((f) => f.err)))}</strong>,
          {" "}averaging <strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f2(mean)} ± {f2(sd)}</strong>.
          {" "}A single split would have reported <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(singleSplit)}</strong> —
          {" "}off by <strong style={{ color: Math.abs(singleSplit - mean) > sd ? P.bad : P.good, fontFamily: "Consolas, monospace" }}>{f2(Math.abs(singleSplit - mean))}</strong>.
        </>
      }
      notice={`Step through the folds and watch the error jump around. The spread here is ±${f2(sd)} — so any two models whose scores differ by less than that are indistinguishable on this data, and picking the "better" one is picking noise.\n\nThat is the real reason to report a standard deviation, not just a mean. Every point is used for testing exactly once and for training k−1 times, which is why cross-validation extracts more information from small data than a single split can.`}
      formalName="k-fold cross-validation"
      formalNote="Split into k folds, train on k−1 and test on the held-out one, rotate, average. Use stratified folds for imbalanced classification, and grouped folds when rows share a subject or session — otherwise near-duplicates leak across the split."
    >
      <Controls>
        <Slider label="Folds (k)" value={k} set={(v) => { setK(v); setFold(0); }} min={2} max={7} step={1} color={P.highlight}
          hint={`${Math.floor(n / k)}–${Math.ceil(n / k)} test points each`} />
        <Slider label="Model degree" value={degree} set={setDegree} min={1} max={7} step={1} color={P.predict} />
      </Controls>
      <StepPlayer step={fold} setStep={setFold} max={k - 1} speed={1100} autoLabel="Rotate folds"
        labels={perFold.map((f, i) => `Fold ${i + 1}: test on points [${f.test.join(", ")}], error ${f2(f.err)}.`)} />

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Which points are held out, per fold
          </div>
          {perFold.map((f, fi) => (
            <div key={fi} style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 4, padding: "4px 7px", borderRadius: 6,
              background: fi === fold ? `${P.highlight}12` : "transparent",
              border: `1px solid ${fi === fold ? P.highlight : "transparent"}`,
            }}>
              <span style={{ fontSize: 10, color: fi === fold ? P.highlight : P.faint, width: 30, fontFamily: "Consolas, monospace" }}>F{fi + 1}</span>
              <span style={{ display: "flex", gap: 2, flex: 1 }}>
                {ds.points.map((_, i) => (
                  <span key={i} style={{
                    flex: 1, height: 15, borderRadius: 2,
                    background: f.test.includes(i) ? P.highlight : P.class0,
                    opacity: f.test.includes(i) ? 0.95 : 0.28,
                  }} />
                ))}
              </span>
              <span style={{ fontSize: 10.5, color: P.dim, fontFamily: "Consolas, monospace", width: 44, textAlign: "right" }}>{f2(f.err)}</span>
            </div>
          ))}
          <Key items={[{ color: P.class0, label: "trained on" }, { color: P.highlight, label: "tested on" }]} />
          <div style={{ marginTop: 12 }}>
            <Plot width={340} height={160} xMin={5.5} xMax={19.5} yMin={0} yMax={34} xLabel="Hour" yLabel="Temp (°C)" xTicks={3} yTicks={3}>
              {({ sx, sy }) => (
                <g>
                  <Line pts={Array.from({ length: 90 }, (_, i) => { const x = 6 + (i / 89) * 13; return [sx(x), sy(M.polyEval(cur.w, x))]; }).filter(([, y]) => y > -50 && y < 400)}
                    color={P.predict} width={2.2} />
                  {ds.points.map((p, i) => (
                    <Dot key={i} cx={sx(p.x)} cy={sy(p.y)} color={cur.test.includes(i) ? P.highlight : P.class0} r={cur.test.includes(i) ? 5 : 3.4}
                      halo={cur.test.includes(i) ? P.highlight : null} opacity={cur.test.includes(i) ? 1 : 0.6} />
                  ))}
                </g>
              )}
            </Plot>
            <Caption>The fit for fold {fold + 1}. Circled points were invisible during training.</Caption>
          </div>
        </Col>
        <Col flex="1 1 290px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Error per fold
          </div>
          <Bars width={300} height={150} items={perFold.map((f, i) => ({ label: `F${i + 1}`, value: f.err }))}
            fmt={f2} colorFor={(it, i) => (i === fold ? P.highlight : P.predict)} />
          <Caption>Same model, same data, {k} different answers.</Caption>
          <Stats>
            <Stat label="Mean error" value={f2(mean)} color={P.good} big />
            <Stat label="Std dev" value={f2(sd)} color={P.derived} hint="the honest ±" />
          </Stats>
          <Stats>
            <Stat label="Best fold" value={f2(Math.min(...perFold.map((f) => f.err)))} color={P.good} />
            <Stat label="Worst fold" value={f2(Math.max(...perFold.map((f) => f.err)))} color={P.bad} />
          </Stats>
          {sd > mean * 0.4 && (
            <Verdict tone="warn">
              The spread ({f2(sd)}) is large relative to the mean ({f2(mean)}). Any model comparison closer than that is
              noise — report the interval, not just the average.
            </Verdict>
          )}
          <Note>
            Reporting only the best fold is a classic way to fool yourself. Here that would claim
            {" "}{f2(Math.min(...perFold.map((f) => f.err)))} when the honest estimate is {f2(mean)}.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. IMBALANCED DATA & THRESHOLDS
// ════════════════════════════════════════════════════════════════════════════

export function ImbalanceSim() {
  const [thr, setThr] = useState(0.5);
  const [dsId, setDsId] = useState("fraud");
  const [costFn, setCostFn] = useState(20);
  const [costFp, setCostFp] = useState(1);

  const ds = dsId === "fraud" ? D.FRAUD_SCORES : D.TINY_SCORES;
  const y = ds.rows.map((r) => r.y), scores = ds.rows.map((r) => r.score);
  const cm = M.confusion(y, scores, thr);
  const roc = useMemo(() => M.rocCurve(y, scores), [dsId]);
  const pr = useMemo(() => M.prCurve(y, scores), [dsId]);
  const prevalence = y.filter((v) => v === 1).length / y.length;
  const alwaysNegAcc = 1 - prevalence;

  // Cost-optimal threshold
  const costAt = (t) => { const c = M.confusion(y, scores, t); return c.fn * costFn + c.fp * costFp; };
  const bestThr = useMemo(() => {
    let best = { t: 0.5, cost: Infinity };
    for (let t = 0.02; t <= 0.98; t += 0.01) { const c = costAt(t); if (c < best.cost) best = { t, cost: c }; }
    return best;
  }, [dsId, costFn, costFp]);

  return (
    <Sim
      n={3}
      title="Imbalanced Data & Thresholds"
      breadcrumb="Applied ML · Why accuracy lies"
      hook={<><strong style={{ fontFamily: "Consolas, monospace" }}>{y.filter((v) => v === 1).length}</strong> {ds.positiveLabel.toLowerCase()} cases hide among <strong style={{ fontFamily: "Consolas, monospace" }}>{y.filter((v) => v === 0).length}</strong> {ds.negativeLabel.toLowerCase()} ones. A model that simply says "{ds.negativeLabel.toLowerCase()}" every single time scores <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{pct(alwaysNegAcc)}</strong> accuracy.</>}
      question={ds.question}
      readout={
        <>
          At cut-off <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(thr)}</strong>:
          {" "}caught <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{cm.tp}</strong>,
          {" "}missed <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{cm.fn}</strong>,
          {" "}false alarms <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{cm.fp}</strong>.
          {" "}Precision <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.precision)}</strong>,
          {" "}recall <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.recall)}</strong>,
          {" "}F1 <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(cm.f1)}</strong>,
          {" "}accuracy <strong style={{ color: P.faint, fontFamily: "Consolas, monospace" }}>{pct(cm.accuracy)}</strong>.
          {" "}Total cost <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{cm.fn * costFn + cm.fp * costFp}</strong>
          {" "}— minimized at cut-off <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f2(bestThr.t)}</strong> (cost {bestThr.cost}).
        </>
      }
      notice={`Watch the accuracy figure as you drag the threshold. It barely moves, and it stays high everywhere — including at settings where you catch almost no ${ds.positiveLabel.toLowerCase()} at all. With ${pct(prevalence)} positives, accuracy is dominated by the majority class and tells you essentially nothing.\n\nNow watch precision and recall pull against each other. There is no "correct" threshold in the abstract — only one that reflects what a miss costs versus what a false alarm costs. Set those two numbers and the threshold follows.`}
      formalName="Class imbalance, the precision–recall trade-off, and cost-sensitive thresholds"
      formalNote="ROC-AUC can look strong on imbalanced data because the false-positive rate has a huge denominator. PR-AUC is the more honest summary. The threshold is a business decision, not a model parameter."
    >
      <Controls>
        <Choice label="Dataset" value={dsId} set={setDsId} options={[{ id: "fraud", label: "200 transactions, 5% fraud" }, { id: "tiny", label: "10 patients (countable by hand)" }]} />
        <Slider label="Decision cut-off" value={thr} set={setThr} min={0.02} max={0.98} step={0.01} fmt={f2} color={P.highlight} />
      </Controls>
      <Controls>
        <Slider label="Cost of a miss" value={costFn} set={setCostFn} min={1} max={50} step={1} color={P.bad}
          hint="false negative" />
        <Slider label="Cost of a false alarm" value={costFp} set={setCostFp} min={1} max={50} step={1} color={P.class1}
          hint="false positive" />
        <button onClick={() => setThr(Number(bestThr.t.toFixed(2)))} style={{
          padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
          border: `1px solid ${P.good}`, background: `${P.good}18`, color: P.good,
        }}>Jump to cheapest cut-off</button>
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Every case, by score
          </div>
          <Plot width={310} height={170} xMin={0} xMax={ds.rows.length - 1} yMin={0} yMax={1}
            xLabel="ranked by model score" yLabel="score" xTicks={2} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => {
              const sorted = ds.rows.map((r) => r).sort((a, b) => a.score - b.score);
              return (
                <g>
                  <line x1={sx(0)} y1={sy(thr)} x2={sx(ds.rows.length - 1)} y2={sy(thr)} stroke={P.highlight} strokeWidth="1.6" strokeDasharray="4 3" />
                  {sorted.map((r, i) => <Dot key={i} cx={sx(i)} cy={sy(r.score)} color={r.y ? P.class1 : P.class0} r={dsId === "tiny" ? 5 : 2.6} opacity={dsId === "tiny" ? 1 : 0.75} />)}
                </g>
              );
            }}
          </Plot>
          <Key items={[{ color: P.class1, label: ds.positiveLabel }, { color: P.class0, label: ds.negativeLabel }, { color: P.highlight, label: "cut-off", dash: true }]} />
          <Heatmap title="Confusion matrix" data={[[cm.tn, cm.fp], [cm.fn, cm.tp]]}
            rowLabels={[`Actually ${ds.negativeLabel.toLowerCase()}`, `Actually ${ds.positiveLabel.toLowerCase()}`]}
            colLabels={["Predicted neg", "Predicted pos"]} cell={62} fmt={(v) => String(v)}
            colorFor={(v, i, j) => (i === j ? `rgba(74,222,128,${0.12 + Math.min(0.55, v / y.length * 2)})` : `rgba(255,107,107,${0.12 + Math.min(0.55, v / Math.max(1, y.filter((x) => x === 1).length))})`)} />
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ROC and precision–recall
          </div>
          <Row gap={8}>
            <Plot width={150} height={150} xMin={0} xMax={1} yMin={0} yMax={1} xLabel="FPR" yLabel="TPR" xTicks={2} yTicks={2} yFmt={f2}
              pad={{ l: 34, r: 6, t: 8, b: 30 }}>
              {({ sx, sy }) => (
                <g>
                  <Line pts={[[sx(0), sy(0)], [sx(1), sy(1)]]} color={P.faint} width={1} dash="3 3" />
                  <Line pts={roc.points.map((p) => [sx(p.fpr), sy(p.tpr)])} color={P.predict} width={2} />
                  <Dot cx={sx(cm.fpr)} cy={sy(cm.tpr)} color={P.highlight} r={5} halo={P.highlight} />
                </g>
              )}
            </Plot>
            <Plot width={150} height={150} xMin={0} xMax={1} yMin={0} yMax={1} xLabel="Recall" yLabel="Precision" xTicks={2} yTicks={2} yFmt={f2}
              pad={{ l: 34, r: 6, t: 8, b: 30 }}>
              {({ sx, sy }) => (
                <g>
                  <line x1={sx(0)} y1={sy(prevalence)} x2={sx(1)} y2={sy(prevalence)} stroke={P.faint} strokeWidth="1" strokeDasharray="3 3" />
                  <Line pts={pr.points.map((p) => [sx(p.recall), sy(p.precision)])} color={P.derived} width={2} />
                  <Dot cx={sx(cm.recall)} cy={sy(cm.precision)} color={P.highlight} r={5} halo={P.highlight} />
                </g>
              )}
            </Plot>
          </Row>
          <Stats>
            <Stat label="ROC-AUC" value={f3(roc.auc)} color={P.predict} hint="looks great" />
            <Stat label="PR-AUC" value={f3(pr.ap)} color={pr.ap < roc.auc - 0.15 ? P.bad : P.good} hint="the honest one" />
          </Stats>
          <Stats>
            <Stat label="Precision" value={f2(cm.precision)} color={P.good} />
            <Stat label="Recall" value={f2(cm.recall)} color={P.good} />
            <Stat label="Accuracy" value={pct(cm.accuracy)} color={P.faint} hint="misleading" />
          </Stats>
          <Stats>
            <Stat label="Total cost" value={cm.fn * costFn + cm.fp * costFp} color={P.highlight} big
              hint={`${cm.fn}×${costFn} + ${cm.fp}×${costFp}`} />
          </Stats>
          {roc.auc - pr.ap > 0.2 && (
            <Verdict tone="warn">
              ROC-AUC {f3(roc.auc)} looks strong while PR-AUC is only {f3(pr.ap)}. With {pct(prevalence)} positives, the
              false-positive rate has a huge denominator, so ROC flatters the model. Report PR-AUC.
            </Verdict>
          )}
          {Math.abs(thr - bestThr.t) < 0.02 && (
            <Verdict tone="good">
              This is the cost-minimizing threshold given a miss costing {costFn} and a false alarm costing {costFp}.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. FEATURE SCALING
// ════════════════════════════════════════════════════════════════════════════

export function ScalingSim() {
  const [scaled, setScaled] = useState(false);
  const [lr, setLr] = useState(0.05);
  const [steps, setSteps] = useState(30);

  // Two features on wildly different scales — the classic pathology.
  const raw = useMemo(() => {
    const r = M.rng(19);
    const X = [], y = [];
    for (let i = 0; i < 40; i++) {
      const size = 50 + r() * 250;      // 50–300 (sq m)
      const rooms = 1 + Math.floor(r() * 5);  // 1–5
      X.push([size, rooms]);
      y.push(size * 0.9 + rooms * 12 + M.gauss(r) * 15 > 190 ? 1 : 0);
    }
    return { X, y };
  }, []);
  const std = useMemo(() => M.standardize(raw.X), [raw]);
  const X = scaled ? std.Z : raw.X;

  const fit = useMemo(() => M.logisticFit(X, raw.y, { lr, steps }), [X, lr, steps]);
  const path = fit.history;
  const finalAcc = M.accuracy(raw.y, X.map((x) => (M.sigmoid(M.dot(fit.w, x) + fit.b) >= 0.5 ? 1 : 0)));
  const converged = useMemo(() => M.logisticFit(X, raw.y, { lr, steps: 3000 }), [X, lr]);
  const convAcc = M.accuracy(raw.y, X.map((x) => (M.sigmoid(M.dot(converged.w, x) + converged.b) >= 0.5 ? 1 : 0)));

  const range0 = [Math.min(...X.map((x) => x[0])), Math.max(...X.map((x) => x[0]))];
  const range1 = [Math.min(...X.map((x) => x[1])), Math.max(...X.map((x) => x[1]))];

  return (
    <Sim
      n={4}
      title="Feature Scaling"
      breadcrumb="Applied ML · A one-line fix"
      hook={<>Two features describe each flat: <strong style={{ color: P.class0 }}>floor area</strong> (roughly {range0[0].toFixed(0)}–{range0[1].toFixed(0)}) and <strong style={{ color: P.class1 }}>number of rooms</strong> ({range1[0].toFixed(0)}–{range1[1].toFixed(0)}). One spans hundreds, the other single digits.</>}
      question="Does that scale mismatch matter to gradient descent — and by how much?"
      readout={
        <>
          {scaled ? "Standardized" : "Raw"} features, learning rate <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(lr)}</strong>,
          {" "}after <strong style={{ fontFamily: "Consolas, monospace" }}>{steps}</strong> steps:
          {" "}loss <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f3(path[path.length - 1].loss)}</strong>,
          {" "}accuracy <strong style={{ color: finalAcc > 0.85 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{pct(finalAcc)}</strong>.
          {" "}Given 3000 steps it would reach <strong style={{ fontFamily: "Consolas, monospace" }}>{pct(convAcc)}</strong>.
          {" "}Feature ranges differ by <strong style={{ color: scaled ? P.good : P.bad, fontFamily: "Consolas, monospace" }}>
            {((range0[1] - range0[0]) / (range1[1] - range1[0])).toFixed(0)}×
          </strong>.
        </>
      }
      notice={"Leave scaling off and watch the loss curve: it barely moves in 30 steps. The gradient is dominated entirely by the large-scale feature, so any learning rate small enough to be stable for that one is far too small for the other. The optimizer crawls along a narrow valley.\n\nTurn scaling on with the same learning rate and the same number of steps. It converges. Nothing about the model changed — only the units of the inputs.\n\nThis also affects kNN and SVM, where distance is computed across features: unscaled, floor area drowns out room count entirely. Trees are the exception — they only compare within one feature at a time, so scale is irrelevant to them."}
      formalName="Standardization (z-score normalization)"
      formalNote="Subtract the mean, divide by the standard deviation, per feature. Fit the scaler on the TRAINING set only and apply it to validation and test — computing it over everything first is a textbook leak."
    >
      <Controls>
        <Toggle label="Standardize features" on={scaled} set={setScaled} color={P.good} />
        <Slider label="Learning rate" value={lr} set={setLr} min={0.001} max={0.5} step={0.001} fmt={f3} color={P.highlight} />
        <Slider label="Steps" value={steps} set={setSteps} min={5} max={300} step={5} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The data, in its own units
          </div>
          <Plot width={310} height={210}
            xMin={range0[0] - (range0[1] - range0[0]) * 0.08} xMax={range0[1] + (range0[1] - range0[0]) * 0.08}
            yMin={range1[0] - (range1[1] - range1[0]) * 0.15} yMax={range1[1] + (range1[1] - range1[0]) * 0.15}
            xLabel={scaled ? "floor area (standardized)" : "floor area"} yLabel={scaled ? "rooms (standardized)" : "rooms"}
            xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                {X.map((p, i) => <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={raw.y[i] ? P.class1 : P.class0} r={3.6} />)}
              </g>
            )}
          </Plot>
          <Caption>{scaled ? "Both axes now span roughly −2 to +2." : "The x-axis spans hundreds; the y-axis spans 4. Gradient descent sees a canyon."}</Caption>
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Loss over {steps} steps
          </div>
          <Plot width={310} height={180} xMin={0} xMax={steps} yMin={0} yMax={Math.max(...path.map((h) => h.loss)) * 1.1}
            xLabel="step" yLabel="loss" xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <Line pts={path.map((h) => [sx(h.step), sy(h.loss)])} color={scaled ? P.good : P.bad} width={2.4} />
              </g>
            )}
          </Plot>
          <Stats>
            <Stat label="Loss now" value={f3(path[path.length - 1].loss)} color={P.highlight} />
            <Stat label="Accuracy" value={pct(finalAcc)} color={finalAcc > 0.85 ? P.good : P.bad} big />
          </Stats>
          <Stats>
            <Stat label="Scale ratio" value={`${((range0[1] - range0[0]) / (range1[1] - range1[0])).toFixed(0)}×`} color={scaled ? P.good : P.bad} />
            <Stat label="If given 3000 steps" value={pct(convAcc)} color={P.derived} />
          </Stats>
          {!scaled && finalAcc < 0.8 && (
            <Verdict tone="bad">
              Stuck at {pct(finalAcc)} after {steps} steps. The large-scale feature dominates every gradient, so progress
              on the small one is glacial. Toggle standardization and try again with identical settings.
            </Verdict>
          )}
          {scaled && finalAcc > 0.85 && (
            <Verdict tone="good">
              {pct(finalAcc)} in the same {steps} steps at the same learning rate. One preprocessing line, no model change.
            </Verdict>
          )}
          <Note>
            Affects gradient descent, kNN, SVM and PCA. Does not affect decision trees or forests, which only ever
            compare values within a single feature.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. DATA LEAKAGE
// ════════════════════════════════════════════════════════════════════════════

export function LeakageSim() {
  const [which, setWhich] = useState(0);

  const CASES = [
    {
      name: "Scaling before splitting",
      wrong: "scaler.fit(all_data)  →  then split into train/test",
      right: "split first  →  scaler.fit(train_only)  →  scaler.transform(test)",
      why: "The mean and standard deviation are computed using test rows, so information about the test set is baked into every training feature.",
      symptom: "Validation score is optimistically high by a small but consistent margin. Easy to miss because nothing looks broken.",
      severity: "Subtle",
    },
    {
      name: "A feature computed after the outcome",
      wrong: "Predict churn using \"number_of_support_tickets_last_month\"",
      right: "Use only features whose values were knowable at prediction time.",
      why: "Customers about to churn raise tickets first. The feature is partly a consequence of the label, not a cause — it is leaking the future.",
      symptom: "Suspiciously excellent offline performance that collapses in production, because at real prediction time the feature is empty or different.",
      severity: "Severe",
    },
    {
      name: "Random split on grouped data",
      wrong: "Randomly split 10,000 medical images from 500 patients",
      right: "Split by patient, so all of one patient's images fall on one side.",
      why: "Two images of the same patient land on opposite sides of the split. The model recognizes the patient rather than the disease.",
      symptom: "Excellent test accuracy that vanishes on a genuinely new patient. Very common in medical and audio work.",
      severity: "Severe",
    },
    {
      name: "Random split on time-series",
      wrong: "Shuffle daily sales data, then split 80/20",
      right: "Train on earlier dates, test on later ones. Never shuffle.",
      why: "The model gets to see the future while predicting the past, and neighbouring days are nearly identical anyway.",
      symptom: "Near-perfect backtest, useless forecast. The model learned interpolation, which is not the task.",
      severity: "Severe",
    },
    {
      name: "Tuning on the test set",
      wrong: "Try 40 model variants, report the best test score",
      right: "Tune on validation, touch test exactly once at the very end.",
      why: "Each peek leaks a little information. After 40 comparisons you have effectively fitted the test set through your own choices.",
      symptom: "Reported score is better than anything reproducible. The more variants tried, the worse the overstatement.",
      severity: "Severe",
    },
    {
      name: "Duplicate rows across the split",
      wrong: "Split a scraped dataset containing near-duplicate records",
      right: "Deduplicate — including near-duplicates — before splitting.",
      why: "An identical row appearing in both train and test means part of the test set was memorized verbatim.",
      symptom: "Test accuracy tracks the duplicate rate. Deduplicating suddenly makes the model look much worse.",
      severity: "Moderate",
    },
  ];
  const c = CASES[which];
  const sevColor = { Severe: P.bad, Moderate: P.highlight, Subtle: P.derived }[c.severity];

  // Concrete numeric demonstration of case 0.
  const demo = useMemo(() => {
    const r = M.rng(31);
    const all = Array.from({ length: 20 }, () => 50 + M.gauss(r) * 30);
    const train = all.filter((_, i) => i % 2 === 0), test = all.filter((_, i) => i % 2 === 1);
    return {
      leakyMean: M.mean(all), leakySd: M.std(all),
      cleanMean: M.mean(train), cleanSd: M.std(train),
      testMean: M.mean(test),
    };
  }, []);

  return (
    <Sim
      n={5}
      title="Data Leakage"
      breadcrumb="Applied ML · The mistake that fools everyone"
      hook={<>Your model scores 0.97. You ship it. In production it scores 0.61. Nothing was broken — the evaluation was, and it was broken in a way that made everything look <em>better</em> than it was.</>}
      question={`Case: ${c.name}. Where exactly does the information cross the line?`}
      readout={
        <>
          <strong style={{ color: P.bad }}>Wrong:</strong> <span style={{ fontFamily: "Consolas, monospace" }}>{c.wrong}</span>
          {" · "}<strong style={{ color: P.good }}>Right:</strong> <span style={{ fontFamily: "Consolas, monospace" }}>{c.right}</span>
          {" "}Severity <strong style={{ color: sevColor }}>{c.severity}</strong>.
          {which === 0 && <> Concretely: fitting the scaler on everything gives mean <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{f2(demo.leakyMean)}</strong> / sd <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{f2(demo.leakySd)}</strong>, while the honest train-only version gives <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f2(demo.cleanMean)}</strong> / <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f2(demo.cleanSd)}</strong> — the difference is exactly the test set's influence.</>}
        </>
      }
      notice={"The tell is always the same: a result that is too good, and a gap between offline and production that nobody can explain. If your validation score jumps sharply after adding one feature, suspect that feature before celebrating it.\n\nThe single most useful habit is to ask, for every feature: would this value have been available, with this value, at the moment the prediction needed to be made? If not, it is leaking."}
      formalName="Data leakage / train–test contamination"
      formalNote="Any path by which information from the evaluation set influences training. Prevention is structural, not statistical: split first, build every transformation inside a pipeline fitted on training folds only, and split along whatever unit generalization is actually claimed over — patient, user, session, or time."
    >
      <Controls>
        <Choice label="Leakage case" value={String(which)} set={(v) => setWhich(Number(v))}
          options={CASES.map((cc, i) => ({ id: String(i), label: cc.name.length > 26 ? cc.name.slice(0, 24) + "…" : cc.name }))} />
      </Controls>

      <Row>
        <Col flex="1 1 380px">
          <div style={{ padding: "12px 15px", borderRadius: 9, background: `${P.bad}12`, borderLeft: `3px solid ${P.bad}`, marginBottom: 9 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.bad, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>✗ What people do</div>
            <div style={{ fontSize: 12.5, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.6 }}>{c.wrong}</div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 9, background: `${P.good}12`, borderLeft: `3px solid ${P.good}`, marginBottom: 9 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.good, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>✓ What to do instead</div>
            <div style={{ fontSize: 12.5, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.6 }}>{c.right}</div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 9, background: P.panel, marginBottom: 9 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Why it leaks</div>
            <div style={{ fontSize: 13, color: P.text, lineHeight: 1.65 }}>{c.why}</div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 9, background: P.panel, borderLeft: `3px solid ${sevColor}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: sevColor, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>How you would notice</div>
            <div style={{ fontSize: 13, color: P.text, lineHeight: 1.65 }}>{c.symptom}</div>
          </div>
        </Col>
        <Col flex="1 1 280px">
          {which === 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                The numbers, for this exact case
              </div>
              <Bars width={290} height={130} horizontal items={[
                { label: "Mean (all data)", value: demo.leakyMean, color: P.bad },
                { label: "Mean (train only)", value: demo.cleanMean, color: P.good },
                { label: "SD (all data)", value: demo.leakySd, color: P.bad },
                { label: "SD (train only)", value: demo.cleanSd, color: P.good },
              ]} fmt={f2} />
              <Caption>Red values were computed using test rows. That difference is the leak.</Caption>
            </>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            All {CASES.length} cases by severity
          </div>
          {CASES.map((cc, i) => {
            const sc = { Severe: P.bad, Moderate: P.highlight, Subtle: P.derived }[cc.severity];
            return (
              <button key={i} onClick={() => setWhich(i)} style={{
                display: "flex", width: "100%", justifyContent: "space-between", gap: 8, alignItems: "center",
                padding: "6px 10px", marginBottom: 4, borderRadius: 7, cursor: "pointer", fontFamily: "var(--font-sans)",
                border: `1px solid ${i === which ? sc : P.grid}`,
                background: i === which ? `${sc}14` : "transparent",
              }}>
                <span style={{ fontSize: 12, color: i === which ? P.text : P.dim, textAlign: "left", lineHeight: 1.3 }}>{cc.name}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: sc, textTransform: "uppercase", whiteSpace: "nowrap" }}>{cc.severity}</span>
              </button>
            );
          })}
          <Note>
            The safest structural habit: put every transformation inside a pipeline, and fit the pipeline only inside
            each cross-validation fold. Then leakage is impossible by construction rather than by discipline.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. DATA DRIFT
// ════════════════════════════════════════════════════════════════════════════

export function DriftSim() {
  const [month, setMonth] = useState(0);
  const [driftRate, setDriftRate] = useState(0.35);
  const [retrain, setRetrain] = useState(false);

  const MONTHS = 12;
  // Train once on month 0, then let the world move.
  const sim = useMemo(() => {
    const r = M.rng(29);
    const gen = (shift) => {
      const X = [], y = [];
      for (let i = 0; i < 90; i++) {
        const a = M.gauss(r) + shift, b = M.gauss(r) + shift * 0.5;
        X.push([a, b]);
        y.push(a + b > 0.4 ? 1 : 0);
      }
      return { X, y };
    };
    const base = gen(0);
    const model = M.logisticFit(base.X, base.y, { lr: 0.5, steps: 500 });
    const months = [];
    let live = model;
    for (let m = 0; m < MONTHS; m++) {
      const shift = m * driftRate;
      const d = gen(shift);
      if (retrain && m > 0 && m % 3 === 0) live = M.logisticFit(d.X, d.y, { lr: 0.5, steps: 500 });
      const accFixed = M.accuracy(d.y, d.X.map((x) => (M.sigmoid(M.dot(model.w, x) + model.b) >= 0.5 ? 1 : 0)));
      const accLive = M.accuracy(d.y, d.X.map((x) => (M.sigmoid(M.dot(live.w, x) + live.b) >= 0.5 ? 1 : 0)));
      months.push({ m, shift, data: d, accFixed, accLive, meanA: M.mean(d.X.map((x) => x[0])), retrained: retrain && m > 0 && m % 3 === 0 });
    }
    return { base, model, months };
  }, [driftRate, retrain]);

  const cur = sim.months[month];
  const drop = sim.months[0].accFixed - cur.accFixed;
  const psi = Math.abs(cur.meanA - sim.months[0].meanA);

  return (
    <Sim
      n={6}
      title="Data Drift"
      breadcrumb="Applied ML · After you ship"
      hook={<>You trained a model in January and it scored well. Nothing about the model changes after deployment — but the world does. Customers change, prices change, behaviour changes.</>}
      question="The model is frozen and the data is moving. How fast does accuracy decay, and would you notice?"
      readout={
        <>
          Month <strong>{cur.m}</strong>: the input distribution has moved
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(psi)}</strong> standard deviations from where it was trained.
          {" "}The frozen model now scores
          {" "}<strong style={{ color: cur.accFixed > 0.85 ? P.good : cur.accFixed > 0.7 ? P.highlight : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{pct(cur.accFixed)}</strong>,
          {" "}down <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{pct(drop)}</strong> from month 0.
          {retrain && <> With quarterly retraining it holds at <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{pct(cur.accLive)}</strong>.</>}
        </>
      }
      notice={"Notice that nothing alerts you. The model returns confident predictions the whole way down — it has no idea the inputs are unusual. Accuracy is only visible if you have labels, and labels typically arrive weeks late or not at all.\n\nThat is why production monitoring watches the INPUT distribution, not just accuracy. A shift in feature means is detectable immediately and needs no labels. Turn quarterly retraining on and compare the two curves."}
      formalName="Covariate shift / data drift"
      formalNote="The input distribution P(X) moves while the model stays fixed. Concept drift is worse: P(y|X) itself changes, so even retraining on fresh inputs will not help without fresh labels. Monitor input distributions (PSI, KL divergence) plus prediction distributions, and alert on both."
    >
      <Controls>
        <Slider label="Drift per month" value={driftRate} set={setDriftRate} min={0} max={0.8} step={0.05} fmt={f2} color={P.bad}
          hint={driftRate === 0 ? "static world" : driftRate > 0.5 ? "fast-moving" : "gradual"} />
        <Toggle label="Retrain quarterly" on={retrain} set={setRetrain} color={P.good} />
      </Controls>
      <StepPlayer step={month} setStep={setMonth} max={MONTHS - 1} speed={700} autoLabel="Advance months"
        labels={sim.months.map((m) => `Month ${m.m}: accuracy ${pct(m.accFixed)}${m.retrained ? " — retrained this month" : ""}.`)} />

      <Row>
        <Col flex="1 1 300px">
          <Plot width={310} height={220} xMin={-3} xMax={7} yMin={-3} yMax={5}
            xLabel="Feature A" yLabel="Feature B">
            {({ sx, sy }) => (
              <g>
                {/* where the model was trained */}
                {sim.base.X.map((p, i) => <Dot key={`b${i}`} cx={sx(p[0])} cy={sy(p[1])} color={P.faint} r={2.4} opacity={0.4} />)}
                {/* the model's boundary, fixed forever */}
                {(() => {
                  const [w1, w2] = sim.model.w, b = sim.model.b;
                  if (Math.abs(w2) < 1e-9) return null;
                  return <Line pts={[[sx(-3), sy((-b - w1 * -3) / w2)], [sx(7), sy((-b - w1 * 7) / w2)]]} color={P.highlight} width={2.2} />;
                })()}
                {cur.data.X.map((p, i) => {
                  const wrong = (M.sigmoid(M.dot(sim.model.w, p) + sim.model.b) >= 0.5 ? 1 : 0) !== cur.data.y[i];
                  return <Dot key={i} cx={sx(p[0])} cy={sy(p[1])} color={cur.data.y[i] ? P.class1 : P.class0} r={3.4} halo={wrong ? P.bad : null} />;
                })}
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.faint, label: "training data (month 0)" }, { color: P.highlight, label: "frozen boundary", line: true },
            { color: P.bad, label: "now wrong" }]} />
          <Caption>Grey ghosts show where the model learned. The live data has drifted away from it.</Caption>
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Accuracy over 12 months
          </div>
          <Plot width={330} height={180} xMin={0} xMax={MONTHS - 1} yMin={0.4} yMax={1.02}
            xLabel="month" yLabel="accuracy" xTicks={4} yTicks={4} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(0)} y1={sy(0.8)} x2={sx(MONTHS - 1)} y2={sy(0.8)} stroke={P.bad} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <Label x={sx(0) + 4} y={sy(0.8) - 4} size={9} color={P.bad}>SLO floor</Label>
                <Line pts={sim.months.map((m) => [sx(m.m), sy(m.accFixed)])} color={P.bad} width={2.4} />
                {retrain && <Line pts={sim.months.map((m) => [sx(m.m), sy(m.accLive)])} color={P.good} width={2.4} />}
                {retrain && sim.months.filter((m) => m.retrained).map((m) => (
                  <line key={m.m} x1={sx(m.m)} y1={sy(0.4)} x2={sx(m.m)} y2={sy(1.02)} stroke={P.good} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
                ))}
                <Dot cx={sx(cur.m)} cy={sy(cur.accFixed)} color={P.highlight} r={5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.bad, label: "frozen model", line: true }, ...(retrain ? [{ color: P.good, label: "retrained quarterly", line: true }] : [])]} />
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Input drift — detectable without any labels
          </div>
          <Bars width={330} height={100} items={sim.months.map((m) => ({ label: String(m.m), value: Math.abs(m.meanA - sim.months[0].meanA) }))}
            fmt={f2} showValues={false} colorFor={(it, i) => (i === month ? P.highlight : Math.abs(sim.months[i].meanA - sim.months[0].meanA) > 1 ? P.bad : P.predict)} />
          <Caption>Shift in the mean of feature A. This is what production monitoring actually watches.</Caption>
          <Stats>
            <Stat label="Accuracy now" value={pct(cur.accFixed)} color={cur.accFixed > 0.85 ? P.good : P.bad} big />
            <Stat label="Lost since launch" value={pct(drop)} color={P.bad} />
            <Stat label="Input shift" value={f2(psi)} unit="σ" color={psi > 1 ? P.bad : P.predict} />
          </Stats>
          {cur.accFixed < 0.8 && !retrain && (
            <Verdict tone="bad">
              Below the 80% SLO floor at month {cur.m}, and nothing in the system raised an alarm. The model is still
              returning confident predictions — it has no way to know its inputs are now unfamiliar.
            </Verdict>
          )}
          {retrain && cur.accLive - cur.accFixed > 0.08 && (
            <Verdict tone="good">
              Quarterly retraining is recovering {pct(cur.accLive - cur.accFixed)} of accuracy. Note this only works
              because fresh labels are available — for covariate shift, not concept drift.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

export const APPLIED_SIMS = [
  { id: "overfit", label: "Overfitting", Comp: OverfittingSim },
  { id: "crossval", label: "Cross-Validation", Comp: CrossValidationSim },
  { id: "imbalance", label: "Imbalanced Data", Comp: ImbalanceSim },
  { id: "scaling", label: "Feature Scaling", Comp: ScalingSim },
  { id: "leakage", label: "Data Leakage", Comp: LeakageSim },
  { id: "drift", label: "Data Drift", Comp: DriftSim },
];
