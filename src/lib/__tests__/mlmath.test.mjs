import * as M from "../mlmath.js";

const ok = (name, cond, extra = "") =>
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
const close = (a, b, t = 1e-6) => Math.abs(a - b) < t;

// ── solve ────────────────────────────────────────────────────────────────
// 2x + y = 5 ; x + 3y = 10  →  x = 1, y = 3
const s = M.solve([[2, 1], [1, 3]], [5, 10]);
ok("solve 2x2", close(s[0], 1) && close(s[1], 3), `x=${s[0].toFixed(6)} y=${s[1].toFixed(6)}`);

// ── OLS on exactly-linear data ───────────────────────────────────────────
const xs = [1, 2, 3, 4, 5], ys = xs.map(x => 2 * x + 1);
const ols = M.olsLine(xs, ys);
ok("olsLine exact", close(ols.w, 2) && close(ols.b, 1), `w=${ols.w} b=${ols.b}`);

// ── polyFit degree 1 must match OLS ──────────────────────────────────────
const p1 = M.polyFit(xs, ys, 1, 0);
ok("polyFit==OLS", close(p1[1], 2, 1e-6) && close(p1[0], 1, 1e-6), `[b,w]=[${p1[0].toFixed(6)},${p1[1].toFixed(6)}]`);

// ── polyFit degree 2 on a known quadratic: y = 3x^2 - 2x + 5 ─────────────
const xq = [-2, -1, 0, 1, 2, 3];
const yq = xq.map(x => 3 * x * x - 2 * x + 5);
const p2 = M.polyFit(xq, yq, 2, 0);
ok("polyFit quad", close(p2[0], 5, 1e-5) && close(p2[1], -2, 1e-5) && close(p2[2], 3, 1e-5),
  `c=${p2.map(v => v.toFixed(4)).join(",")}`);

// ── ridge shrinks the slope toward 0 ────────────────────────────────────
const rid0 = M.polyFit(xs, ys, 1, 0)[1], rid5 = M.polyFit(xs, ys, 1, 50)[1];
ok("ridge shrinks slope", rid5 < rid0 && rid5 > 0, `λ=0 → ${rid0.toFixed(4)}, λ=50 → ${rid5.toFixed(4)}`);

// ── GD converges to OLS ─────────────────────────────────────────────────
const path = M.gdLinear(xs, ys, { lr: 0.02, steps: 4000 });
const last = path[path.length - 1];
ok("gdLinear → OLS", close(last.w, 2, 0.02) && close(last.b, 1, 0.08),
  `w=${last.w.toFixed(4)} b=${last.b.toFixed(4)} loss=${last.loss.toExponential(2)}`);
ok("gdLinear loss monotone", path.every((p, i) => i === 0 || p.loss <= path[i - 1].loss + 1e-12));

// diverges at a too-large lr (the thing the sim demonstrates)
const bad = M.gdLinear(xs, ys, { lr: 5, steps: 40 });
ok("gdLinear diverges at lr=5", !isFinite(bad[bad.length - 1].loss) || bad[bad.length - 1].loss > path[0].loss,
  `final loss=${bad[bad.length - 1].loss}`);

// ── sigmoid / softmax ───────────────────────────────────────────────────
ok("sigmoid(0)=0.5", close(M.sigmoid(0), 0.5));
const sm = M.softmax([1, 2, 3]);
ok("softmax sums to 1", close(sm.reduce((a, b) => a + b, 0), 1), sm.map(v => v.toFixed(4)).join(","));
ok("softmax T→0 = argmax", close(M.softmax([1, 2, 3], 0.01)[2], 1, 1e-6));
const smHot = M.softmax([1, 2, 3], 100);
ok("softmax T→∞ = uniform", close(smHot[0], 1 / 3, 0.01), smHot.map(v => v.toFixed(4)).join(","));

// ── logistic on separable data ──────────────────────────────────────────
const Xl = [[0, 0], [0, 1], [1, 0], [3, 3], [3, 4], [4, 3]];
const yl = [0, 0, 0, 1, 1, 1];
const lg = M.logisticFit(Xl, yl, { lr: 0.5, steps: 2000 });
const acc = M.accuracy(yl, Xl.map(x => (M.sigmoid(M.dot(lg.w, x) + lg.b) >= 0.5 ? 1 : 0)));
ok("logistic separates", acc === 1, `acc=${acc} loss=${lg.history[lg.history.length - 1].loss.toFixed(5)}`);
ok("logistic loss decreasing", lg.history[lg.history.length - 1].loss < lg.history[0].loss);

// ── logLoss sanity: perfect vs random ───────────────────────────────────
ok("logLoss perfect ≈ 0", M.logLoss([1, 0], [0.9999, 0.0001]) < 1e-3);
ok("logLoss coinflip = ln2", close(M.logLoss([1, 0], [0.5, 0.5]), Math.LN2, 1e-9),
  M.logLoss([1, 0], [0.5, 0.5]).toFixed(8));

// ── gini / entropy ──────────────────────────────────────────────────────
ok("gini pure = 0", M.gini([5, 0]) === 0);
ok("gini 50/50 = 0.5", close(M.gini([5, 5]), 0.5));
ok("entropy 50/50 = 1 bit", close(M.entropy([5, 5]), 1));
ok("entropy pure = 0", M.entropy([7, 0]) === 0);

// ── decision tree on XOR: depth 1 cannot, depth 2 can ───────────────────
const Xx = [[0, 0], [0, 1], [1, 0], [1, 1]], yx = [0, 1, 1, 0];
const t1 = M.buildTree(Xx, yx, { maxDepth: 1, nClasses: 2 });
const t2 = M.buildTree(Xx, yx, { maxDepth: 2, nClasses: 2 });
const accT = (t) => M.accuracy(yx, Xx.map(x => M.treePredict(t, x)));
ok("tree depth1 fails XOR", accT(t1) < 1, `acc=${accT(t1)}`);
ok("tree depth2 solves XOR", accT(t2) === 1, `acc=${accT(t2)} leaves=${M.countLeaves(t2)}`);
const t2p = M.buildTree(Xx, yx, { maxDepth: 2, nClasses: 2, minGain: 0.01 });
ok("minGain>0 pre-prunes XOR to a stump", M.countLeaves(t2p) === 1 && accT(t2p) < 1,
  `leaves=${M.countLeaves(t2p)} acc=${accT(t2p)}`);

// ── knn ─────────────────────────────────────────────────────────────────
const kn = M.knnPredict([[0, 0], [0, 1], [5, 5], [5, 6]], [0, 0, 1, 1], [0.2, 0.2], 3);
ok("knn k=3 picks majority 0", kn.label === 0, `conf=${kn.confidence.toFixed(3)}`);

// ── gradient boosting: MSE must fall each stage ──────────────────────────
const xb = Array.from({ length: 40 }, (_, i) => [i / 10]);
const yb = xb.map(([x]) => Math.sin(x) * 2);
const gb = M.gradientBoost(xb, yb, { nStages: 8, lr: 0.4, maxDepth: 2 });
const mses = gb.stages.map(s => s.mse);
ok("boosting MSE decreasing", mses.every((m, i) => i === 0 || m <= mses[i - 1] + 1e-12),
  mses.map(m => m.toFixed(4)).join(" → "));
const p = M.boostPredict(gb, [2.0]);
ok("boostPredict finite", isFinite(p), `pred(2.0)=${p.toFixed(4)} true=${(Math.sin(2) * 2).toFixed(4)}`);

// ── k-means: inertia must not increase ──────────────────────────────────
const r = M.rng(1);
const Xk = [];
for (let c = 0; c < 3; c++) for (let i = 0; i < 20; i++) Xk.push([c * 4 + M.gauss(r), c * 2 + M.gauss(r)]);
let cent = M.kmeansInit(Xk, 3, 3);
const iner = [];
for (let it = 0; it < 12; it++) {
  const lab = M.kmeansAssign(Xk, cent);
  iner.push(M.inertia(Xk, lab, cent));
  const nc = M.kmeansUpdate(Xk, lab, 3);
  cent = nc.map((c, j) => c || cent[j]);
}
ok("kmeans inertia non-increasing", iner.every((v, i) => i === 0 || v <= iner[i - 1] + 1e-9),
  iner.slice(0, 5).map(v => v.toFixed(2)).join(" → "));

// ── PCA: data stretched along y=x must give a component at 45° ──────────
const r2g = M.rng(9);
const Xp = Array.from({ length: 300 }, () => { const t = M.gauss(r2g) * 3, n = M.gauss(r2g) * 0.4; return [t + n, t - n]; });
const pc = M.pca(Xp, 2);
const angle = Math.abs(Math.atan2(pc.components[0].vector[1], pc.components[0].vector[0]) * 180 / Math.PI);
ok("PCA first comp ≈ 45°", close(angle, 45, 2) || close(angle, 135, 2), `angle=${angle.toFixed(2)}°`);
ok("PCA explained sums ≈ 1", close(pc.components[0].explained + pc.components[1].explained, 1, 0.02),
  `${pc.components[0].explained.toFixed(4)} + ${pc.components[1].explained.toFixed(4)}`);
ok("PCA comp1 > comp2", pc.components[0].value > pc.components[1].value,
  `λ=${pc.components[0].value.toFixed(3)} vs ${pc.components[1].value.toFixed(3)}`);

// projectOnto must peak in variance at the principal direction
let bestTheta = 0, bestVar = -1;
for (let d = 0; d < 180; d++) { const v = M.projectOnto(Xp, (d * Math.PI) / 180).variance; if (v > bestVar) { bestVar = v; bestTheta = d; } }
ok("max-variance direction ≈ 45°", close(bestTheta, 45, 3) || close(bestTheta, 135, 3), `θ=${bestTheta}°`);
// and reconstruction error must be MINIMIZED at the same angle
let bestE = Infinity, bestET = 0;
for (let d = 0; d < 180; d++) { const e = M.projectOnto(Xp, (d * Math.PI) / 180).reconError; if (e < bestE) { bestE = e; bestET = d; } }
ok("min recon-error direction == max-variance direction", bestET === bestTheta, `θ_err=${bestET}° θ_var=${bestTheta}°`);

// ── truncated SVD: rank-1 matrix must be exact at rank 1 ────────────────
const u = [1, 2, 3], v = [4, 5];
const A1 = u.map(ui => v.map(vj => ui * vj));
const tr1 = M.truncatedSVD(A1, 2);
const rec1 = M.svdReconstruct(tr1, 3, 2, 1);
ok("SVD rank1 exact", M.frobenius(A1, rec1) < 1e-8, `err=${M.frobenius(A1, rec1).toExponential(2)}`);
ok("SVD 2nd singular ≈ 0", !tr1[1] || tr1[1].s < 1e-6, `s2=${tr1[1] ? tr1[1].s.toExponential(2) : "none"}`);

// full-rank matrix: error must fall monotonically with rank
const rr = M.rng(11);
const A2 = Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => M.gauss(rr)));
const tr2 = M.truncatedSVD(A2, 5);
const errs = [1, 2, 3, 4, 5].map(k => M.frobenius(A2, M.svdReconstruct(tr2, 6, 5, k)));
ok("SVD error decreasing in rank", errs.every((e, i) => i === 0 || e <= errs[i - 1] + 1e-9), errs.map(e => e.toFixed(4)).join(" → "));
ok("SVD full rank ≈ exact", errs[4] < 1e-6, `err@5=${errs[4].toExponential(2)}`);
ok("SVD singular values descending", tr2.every((t, i) => i === 0 || t.s <= tr2[i - 1].s + 1e-9), tr2.map(t => t.s.toFixed(3)).join(" > "));

// ── SVM: separable data, margin sane, support vectors found ─────────────
const Xs2 = [[0, 0], [1, 0], [0, 1], [4, 4], [5, 4], [4, 5]], ys2 = [0, 0, 0, 1, 1, 1];
const sv = M.svmLinear(Xs2, ys2, { C: 1e6 });
const svAcc = M.accuracy(ys2, Xs2.map(x => (sv.decide(x) >= 0 ? 1 : 0)));
ok("svm separates", svAcc === 1, `acc=${svAcc} margin=${sv.marginWidth.toFixed(3)} #SV=${sv.supportVectors.length}`);

// larger C = less regularization = narrower margin
const svC = M.svmLinear(Xs2, ys2, { C: 0.01 });
ok("smaller C → wider margin", svC.marginWidth > sv.marginWidth,
  `C=1e6 → ${sv.marginWidth.toFixed(3)}, C=0.01 → ${svC.marginWidth.toFixed(3)}`);
ok("svm finds support vectors", sv.supportVectors.length >= 2,
  `#SV=${sv.supportVectors.length} margins=${sv.margins.map(m => m.toFixed(3)).join(",")}`);
ok("svm min margin ≈ 1 (max-margin solution)", Math.abs(Math.min(...sv.margins) - 1) < 0.15,
  `min margin=${Math.min(...sv.margins).toFixed(4)}`);

// RBF SVM must beat linear on XOR-like data
const Xr = [], yr = [];
const rq = M.rng(4);
for (let i = 0; i < 30; i++) {
  const q = i % 4;
  const cx = q === 0 || q === 3 ? 1 : -1, cy = q === 0 || q === 1 ? 1 : -1;
  Xr.push([cx + M.gauss(rq) * 0.3, cy + M.gauss(rq) * 0.3]);
  yr.push(cx * cy > 0 ? 1 : 0);
}
const rbfm = M.svmKernel(Xr, yr, { C: 5, gamma: 1.5 });
const rbfAcc = M.accuracy(yr, Xr.map(x => (rbfm.decide(x) >= 0 ? 1 : 0)));
const linm = M.svmLinear(Xr, yr, { C: 1 });
const linAcc = M.accuracy(yr, Xr.map(x => (linm.decide(x) >= 0 ? 1 : 0)));
ok("RBF beats linear on XOR", rbfAcc > linAcc, `rbf=${rbfAcc.toFixed(3)} linear=${linAcc.toFixed(3)}`);
ok("kernel svm has support vectors", rbfm.supportVectors.length > 0 && rbfm.supportVectors.length <= Xr.length,
  `#SV=${rbfm.supportVectors.length}/${Xr.length}`);
{ const wide = M.svmKernel(Xr, yr, { C: 5, gamma: 0.008 });
  const tight = M.svmKernel(Xr, yr, { C: 5, gamma: 30 });
  const a = M.accuracy(yr, Xr.map(x => (wide.decide(x) >= 0 ? 1 : 0)));
  const b = M.accuracy(yr, Xr.map(x => (tight.decide(x) >= 0 ? 1 : 0)));
  ok("gamma extremes behave (tiny γ underfits XOR)", a < rbfAcc, `γ=0.008 → ${a.toFixed(3)}, γ=1.5 → ${rbfAcc.toFixed(3)}, γ=30 → ${b.toFixed(3)}`); }

// ── random forest ≥ single tree on noisy data ──────────────────────────
const rf3 = M.rng(21);
const Xf = [], yf = [];
for (let i = 0; i < 120; i++) {
  const x = [M.gauss(rf3) * 2, M.gauss(rf3) * 2];
  let lab = x[0] * x[1] > 0 ? 1 : 0;
  if (rf3() < 0.12) lab = 1 - lab;              // label noise
  Xf.push(x); yf.push(lab);
}
const single = M.buildTree(Xf, yf, { maxDepth: 4, nClasses: 2 });
const forest = M.randomForest(Xf, yf, { nTrees: 25, maxDepth: 4, nClasses: 2, seed: 7, featureFrac: 1 });
// held-out grid comparison against the TRUE (noise-free) rule
const rg = M.rng(99);
const Xh = Array.from({ length: 400 }, () => [M.gauss(rg) * 2, M.gauss(rg) * 2]);
const yh = Xh.map(x => (x[0] * x[1] > 0 ? 1 : 0));
const accS = M.accuracy(yh, Xh.map(x => M.treePredict(single, x)));
const accF = M.accuracy(yh, Xh.map(x => M.forestPredict(forest, x)));
ok("forest ≥ single tree (held out)", accF >= accS, `tree=${accS.toFixed(4)} forest=${accF.toFixed(4)}`);
ok("forest probabilities in [0,1]", M.forestProba(forest, [1, 1]).every(v => v >= 0 && v <= 1),
  M.forestProba(forest, [1, 1]).map(v => v.toFixed(3)).join(","));

// ── Gaussian NB ─────────────────────────────────────────────────────────
const nb = M.gaussianNB(Xl, yl, 2);
ok("NB proba sums to 1", close(nb.predictProba([0, 0]).reduce((a, b) => a + b, 0), 1));
ok("NB classifies training set", M.accuracy(yl, Xl.map(x => { const pp = nb.predictProba(x); return pp[1] > pp[0] ? 1 : 0; })) === 1);

// ── confusion / ROC / PR ────────────────────────────────────────────────
const yb2 = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
const sc = [0.95, 0.8, 0.6, 0.3, 0.7, 0.4, 0.35, 0.2, 0.1, 0.05];
const cf = M.confusion(yb2, sc, 0.5);
ok("confusion at 0.5", cf.tp === 3 && cf.fp === 1 && cf.fn === 1 && cf.tn === 5,
  `TP=${cf.tp} FP=${cf.fp} FN=${cf.fn} TN=${cf.tn} P=${cf.precision.toFixed(4)} R=${cf.recall.toFixed(4)}`);
ok("confusion counts total", cf.tp + cf.fp + cf.fn + cf.tn === 10);
const roc = M.rocCurve(yb2, sc);
ok("ROC AUC in range", roc.auc > 0.8 && roc.auc <= 1, `AUC=${roc.auc.toFixed(4)}`);
const rocPerfect = M.rocCurve([1, 1, 0, 0], [0.9, 0.8, 0.2, 0.1]);
ok("ROC AUC perfect = 1", close(rocPerfect.auc, 1, 1e-9), `AUC=${rocPerfect.auc}`);
const rocRandom = M.rocCurve([1, 0, 1, 0], [0.6, 0.6, 0.4, 0.4]);
ok("ROC AUC ties = 0.5", close(rocRandom.auc, 0.5, 1e-9), `AUC=${rocRandom.auc}`);
const pr = M.prCurve(yb2, sc);
ok("PR AP in range", pr.ap > 0.5 && pr.ap <= 1, `AP=${pr.ap.toFixed(4)}`);

// ── k-fold: partitions must be disjoint and cover everything ───────────
const folds = M.kFolds(20, 5, 5);
const allTest = folds.flatMap(f => f.test);
ok("kFolds covers all once", allTest.length === 20 && new Set(allTest).size === 20);
ok("kFolds train/test disjoint", folds.every(f => f.train.every(i => !f.test.includes(i))));
ok("kFolds train sizes = n - |test|", folds.every(f => f.train.length === 20 - f.test.length),
  folds.map(f => `${f.train.length}/${f.test.length}`).join(" "));

// ── standardize ─────────────────────────────────────────────────────────
const sd = M.standardize([[1, 10], [2, 20], [3, 30], [4, 40]]);
ok("standardize mean 0", sd.Z[0].every((_, j) => close(M.mean(sd.Z.map(z => z[j])), 0, 1e-9)));
ok("standardize std 1", sd.Z[0].every((_, j) => close(M.std(sd.Z.map(z => z[j])), 1, 1e-9)));

// ── RNG determinism ─────────────────────────────────────────────────────
const a1 = Array.from({ length: 5 }, M.rng(42)), a2 = Array.from({ length: 5 }, M.rng(42));
ok("rng deterministic", a1.every((v, i) => v === a2[i]), a1.map(v => v.toFixed(6)).join(","));
ok("rng in [0,1)", a1.every(v => v >= 0 && v < 1));
const gr = M.rng(7); const g2 = Array.from({ length: 20000 }, () => M.gauss(gr));
ok("gauss mean ≈ 0", Math.abs(M.mean(g2)) < 0.03, `mean=${M.mean(g2).toFixed(5)}`);
ok("gauss std ≈ 1", close(M.std(g2), 1, 0.03), `std=${M.std(g2).toFixed(5)}`);

// ── decisionGrid ────────────────────────────────────────────────────────
const dg = M.decisionGrid(([x, y]) => (x + y > 0 ? 1 : 0), { xMin: -1, xMax: 1, yMin: -1, yMax: 1, res: 10 });
ok("decisionGrid size", dg.cells.length === 100);
ok("decisionGrid splits ~half", Math.abs(dg.cells.filter(c => c.v === 1).length - 50) <= 5,
  `ones=${dg.cells.filter(c => c.v === 1).length}`);

