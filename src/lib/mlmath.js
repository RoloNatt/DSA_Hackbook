// Real numerical implementations, no dependencies.
//
// Everything here is deterministic: all randomness comes from a seeded
// mulberry32 generator, so a simulator showing "loss = 0.0413" shows the same
// number on every machine and can be checked by hand.

// ─── RANDOMNESS ─────────────────────────────────────────────────────────────

export function rng(seed = 42) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller. Returns one standard normal per call.
export function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function shuffled(arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── SMALL DENSE LINEAR ALGEBRA ─────────────────────────────────────────────

export const zeros = (n) => new Array(n).fill(0);
export const zeros2 = (r, c) => Array.from({ length: r }, () => new Array(c).fill(0));
export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const transpose = (A) => A[0].map((_, j) => A.map((row) => row[j]));
export const matmul = (A, B) => {
  const Bt = transpose(B);
  return A.map((row) => Bt.map((col) => dot(row, col)));
};
export const matvec = (A, x) => A.map((row) => dot(row, x));
export const norm = (v) => Math.sqrt(dot(v, v));
export const scale = (v, k) => v.map((x) => x * k);
export const addv = (a, b) => a.map((x, i) => x + b[i]);
export const subv = (a, b) => a.map((x, i) => x - b[i]);
export const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length;
export const variance = (v) => { const m = mean(v); return mean(v.map((x) => (x - m) ** 2)); };
export const std = (v) => Math.sqrt(variance(v));

// Solve A x = b by Gaussian elimination with partial pivoting.
// A is n×n (mutated copy), b length n. Returns null if singular.
export function solve(A0, b0) {
  const n = A0.length;
  const A = A0.map((r, i) => [...r, b0[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    if (Math.abs(A[piv][c]) < 1e-12) return null;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[n] / row[i]);
}

// ─── ACTIVATION / LINK FUNCTIONS ────────────────────────────────────────────

export const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z))));

export function softmax(logits, temperature = 1) {
  const t = Math.max(1e-6, temperature);
  const z = logits.map((l) => l / t);
  const m = Math.max(...z);
  const e = z.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
}

// ─── POLYNOMIAL / RIDGE REGRESSION (closed form) ─────────────────────────────
// Fits y ≈ Σ w_j x^j with L2 penalty lambda (the intercept is not penalized).
// This is the honest closed form: w = (XᵀX + λI)⁻¹ Xᵀy.

export function polyFit(xs, ys, degree, lambda = 0) {
  const X = xs.map((x) => Array.from({ length: degree + 1 }, (_, j) => x ** j));
  const Xt = transpose(X);
  const XtX = matmul(Xt, X);
  for (let i = 1; i <= degree; i++) XtX[i][i] += lambda;   // skip bias term
  const Xty = matvec(Xt, ys);
  return solve(XtX, Xty) || zeros(degree + 1);
}

export const polyEval = (w, x) => w.reduce((s, wj, j) => s + wj * x ** j, 0);

export const mse = (yTrue, yPred) =>
  mean(yTrue.map((y, i) => (y - yPred[i]) ** 2));

export function r2(yTrue, yPred) {
  const m = mean(yTrue);
  const ssRes = yTrue.reduce((s, y, i) => s + (y - yPred[i]) ** 2, 0);
  const ssTot = yTrue.reduce((s, y) => s + (y - m) ** 2, 0);
  return ssTot < 1e-12 ? 0 : 1 - ssRes / ssTot;
}

// ─── LINEAR REGRESSION BY GRADIENT DESCENT ──────────────────────────────────
// Returns the full parameter trajectory so a simulator can animate the path
// across the loss surface — the point being that GD is a *walk*, not a formula.

export function gdLinear(xs, ys, { lr = 0.1, steps = 60, w0 = 0, b0 = 0 } = {}) {
  const n = xs.length;
  let w = w0, b = b0;
  const path = [{ w, b, loss: mseLine(xs, ys, w, b) }];
  for (let s = 0; s < steps; s++) {
    let gw = 0, gb = 0;
    for (let i = 0; i < n; i++) {
      const err = w * xs[i] + b - ys[i];
      gw += 2 * err * xs[i];
      gb += 2 * err;
    }
    w -= (lr * gw) / n;
    b -= (lr * gb) / n;
    if (!isFinite(w) || !isFinite(b) || Math.abs(w) > 1e6) { w = NaN; b = NaN; path.push({ w, b, loss: NaN }); break; }
    path.push({ w, b, loss: mseLine(xs, ys, w, b) });
  }
  return path;
}

export const mseLine = (xs, ys, w, b) =>
  mean(xs.map((x, i) => (w * x + b - ys[i]) ** 2));

// Closed-form least squares for a straight line — the target GD walks toward.
export function olsLine(xs, ys) {
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const w = den < 1e-12 ? 0 : num / den;
  return { w, b: my - w * mx };
}

// ─── LOGISTIC REGRESSION ────────────────────────────────────────────────────

export function logisticFit(X, y, { lr = 0.5, steps = 300, l2 = 0 } = {}) {
  const d = X[0].length, n = X.length;
  let w = zeros(d), b = 0;
  const history = [];
  for (let s = 0; s <= steps; s++) {
    const p = X.map((xi) => sigmoid(dot(w, xi) + b));
    if (s % Math.max(1, Math.floor(steps / 40)) === 0) {
      history.push({ step: s, loss: logLoss(y, p), acc: accuracy(y, p.map((q) => (q >= 0.5 ? 1 : 0))), w: [...w], b });
    }
    const gw = zeros(d);
    let gb = 0;
    for (let i = 0; i < n; i++) {
      const e = p[i] - y[i];
      for (let j = 0; j < d; j++) gw[j] += e * X[i][j];
      gb += e;
    }
    for (let j = 0; j < d; j++) w[j] -= lr * (gw[j] / n + l2 * w[j]);
    b -= (lr * gb) / n;
  }
  return { w, b, history };
}

export const logLoss = (y, p) =>
  -mean(y.map((yi, i) => {
    const q = Math.min(1 - 1e-12, Math.max(1e-12, p[i]));
    return yi * Math.log(q) + (1 - yi) * Math.log(1 - q);
  }));

export const accuracy = (y, yhat) =>
  mean(y.map((yi, i) => (yi === yhat[i] ? 1 : 0)));

// ─── k-NEAREST NEIGHBOURS ───────────────────────────────────────────────────

export function knnPredict(Xtr, ytr, q, k, { weighted = false } = {}) {
  const d = Xtr.map((x, i) => ({ i, d: Math.hypot(...x.map((v, j) => v - q[j])) }))
    .sort((a, b) => a.d - b.d).slice(0, k);
  const votes = {};
  for (const { i, d: dist } of d) {
    const wt = weighted ? 1 / (dist + 1e-9) : 1;
    votes[ytr[i]] = (votes[ytr[i]] || 0) + wt;
  }
  let best = null, bv = -Infinity;
  for (const c of Object.keys(votes)) if (votes[c] > bv) { bv = votes[c]; best = Number(c); }
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  return { label: best, confidence: bv / total, neighbours: d };
}

// ─── DECISION TREES (CART) ──────────────────────────────────────────────────

export const gini = (counts) => {
  const n = counts.reduce((a, b) => a + b, 0);
  if (n === 0) return 0;
  return 1 - counts.reduce((s, c) => s + (c / n) ** 2, 0);
};

export const entropy = (counts) => {
  const n = counts.reduce((a, b) => a + b, 0);
  if (n === 0) return 0;
  return -counts.reduce((s, c) => (c === 0 ? s : s + (c / n) * Math.log2(c / n)), 0);
};

function classCounts(y, nClasses) {
  const c = zeros(nClasses);
  for (const v of y) c[v]++;
  return c;
}

// Classification tree. Returns a node graph carrying the impurity and the
// samples reaching it, so a diagram can show *why* each split was chosen.
// minGain mirrors scikit-learn's min_impurity_decrease, which defaults to 0 —
// meaning a ZERO-gain split is still taken. That detail matters: it's the only
// reason a depth-2 tree can solve XOR, where both root splits look useless on
// their own. Raise minGain to see pre-pruning bite.
export function buildTree(X, y, {
  maxDepth = 3, minSamples = 2, nClasses = 2, criterion = "gini", minGain = 0, depth = 0, idx = null,
} = {}) {
  const rows = idx || X.map((_, i) => i);
  const ys = rows.map((i) => y[i]);
  const counts = classCounts(ys, nClasses);
  const imp = criterion === "entropy" ? entropy(counts) : gini(counts);
  const majority = counts.indexOf(Math.max(...counts));
  const node = { n: rows.length, counts, impurity: imp, prediction: majority, depth, rows };

  if (depth >= maxDepth || rows.length < minSamples || imp === 0) return { ...node, leaf: true };

  let best = null;
  for (let f = 0; f < X[0].length; f++) {
    const vals = [...new Set(rows.map((i) => X[i][f]))].sort((a, b) => a - b);
    for (let v = 0; v < vals.length - 1; v++) {
      const thr = (vals[v] + vals[v + 1]) / 2;
      const L = rows.filter((i) => X[i][f] <= thr);
      const R = rows.filter((i) => X[i][f] > thr);
      if (!L.length || !R.length) continue;
      const iL = criterion === "entropy" ? entropy(classCounts(L.map((i) => y[i]), nClasses)) : gini(classCounts(L.map((i) => y[i]), nClasses));
      const iR = criterion === "entropy" ? entropy(classCounts(R.map((i) => y[i]), nClasses)) : gini(classCounts(R.map((i) => y[i]), nClasses));
      const weighted = (L.length * iL + R.length * iR) / rows.length;
      const gain = imp - weighted;
      if (!best || gain > best.gain + 1e-12) best = { feature: f, threshold: thr, gain, L, R, iL, iR };
    }
  }
  if (!best || best.gain < minGain - 1e-12) return { ...node, leaf: true };

  return {
    ...node, leaf: false, feature: best.feature, threshold: best.threshold, gain: best.gain,
    left: buildTree(X, y, { maxDepth, minSamples, nClasses, criterion, minGain, depth: depth + 1, idx: best.L }),
    right: buildTree(X, y, { maxDepth, minSamples, nClasses, criterion, minGain, depth: depth + 1, idx: best.R }),
  };
}

export function treePredict(node, x) {
  let n = node;
  while (!n.leaf) n = x[n.feature] <= n.threshold ? n.left : n.right;
  return n.prediction;
}

export function treeProba(node, x, nClasses = 2) {
  let n = node;
  while (!n.leaf) n = x[n.feature] <= n.threshold ? n.left : n.right;
  const tot = n.counts.reduce((a, b) => a + b, 0);
  return n.counts.map((c) => c / tot);
}

export const countLeaves = (n) => (n.leaf ? 1 : countLeaves(n.left) + countLeaves(n.right));
export const treeDepth = (n) => (n.leaf ? n.depth : Math.max(treeDepth(n.left), treeDepth(n.right)));

// ─── REGRESSION TREE (for gradient boosting) ────────────────────────────────

export function buildRegTree(X, y, { maxDepth = 2, minSamples = 2, depth = 0, idx = null } = {}) {
  const rows = idx || X.map((_, i) => i);
  const ys = rows.map((i) => y[i]);
  const pred = mean(ys);
  const node = { n: rows.length, prediction: pred, sse: ys.reduce((s, v) => s + (v - pred) ** 2, 0), depth };
  if (depth >= maxDepth || rows.length < minSamples) return { ...node, leaf: true };

  let best = null;
  for (let f = 0; f < X[0].length; f++) {
    const vals = [...new Set(rows.map((i) => X[i][f]))].sort((a, b) => a - b);
    for (let v = 0; v < vals.length - 1; v++) {
      const thr = (vals[v] + vals[v + 1]) / 2;
      const L = rows.filter((i) => X[i][f] <= thr);
      const R = rows.filter((i) => X[i][f] > thr);
      if (!L.length || !R.length) continue;
      const sse = (rs) => { const m = mean(rs.map((i) => y[i])); return rs.reduce((s, i) => s + (y[i] - m) ** 2, 0); };
      const tot = sse(L) + sse(R);
      if (!best || tot < best.sse - 1e-12) best = { feature: f, threshold: thr, sse: tot, L, R };
    }
  }
  if (!best || best.sse >= node.sse - 1e-12) return { ...node, leaf: true };
  return {
    ...node, leaf: false, feature: best.feature, threshold: best.threshold,
    left: buildRegTree(X, y, { maxDepth, minSamples, depth: depth + 1, idx: best.L }),
    right: buildRegTree(X, y, { maxDepth, minSamples, depth: depth + 1, idx: best.R }),
  };
}

export function regTreePredict(node, x) {
  let n = node;
  while (!n.leaf) n = x[n.feature] <= n.threshold ? n.left : n.right;
  return n.prediction;
}

// ─── RANDOM FOREST (bagging + feature subsampling) ──────────────────────────

export function randomForest(X, y, { nTrees = 10, maxDepth = 3, nClasses = 2, seed = 7, featureFrac = 1 } = {}) {
  const r = rng(seed);
  const n = X.length, d = X[0].length;
  const trees = [];
  for (let t = 0; t < nTrees; t++) {
    const boot = Array.from({ length: n }, () => Math.floor(r() * n));   // sample WITH replacement
    const oob = new Set(X.map((_, i) => i));
    boot.forEach((i) => oob.delete(i));
    const nFeat = Math.max(1, Math.round(d * featureFrac));
    const feats = shuffled(Array.from({ length: d }, (_, j) => j), r).slice(0, nFeat).sort();
    // Project onto the chosen features, train, then remap indices back.
    const Xs = boot.map((i) => feats.map((f) => X[i][f]));
    const tree = buildTree(Xs, boot.map((i) => y[i]), { maxDepth, nClasses });
    trees.push({ tree, feats, oob: [...oob] });
  }
  return { trees, nClasses };
}

export function forestProba(forest, x) {
  const acc = zeros(forest.nClasses);
  for (const { tree, feats } of forest.trees) {
    const p = treeProba(tree, feats.map((f) => x[f]), forest.nClasses);
    for (let c = 0; c < forest.nClasses; c++) acc[c] += p[c];
  }
  return acc.map((v) => v / forest.trees.length);
}

export const forestPredict = (forest, x) => {
  const p = forestProba(forest, x);
  return p.indexOf(Math.max(...p));
};

// ─── GRADIENT BOOSTING (squared loss, 1D or 2D features) ────────────────────
// Keeps every stage so a simulator can show the residuals shrinking — the
// single most useful picture for understanding boosting.

export function gradientBoost(X, y, { nStages = 5, lr = 0.3, maxDepth = 2 } = {}) {
  const base = mean(y);
  let pred = y.map(() => base);
  const stages = [];
  for (let s = 0; s < nStages; s++) {
    const residual = y.map((yi, i) => yi - pred[i]);
    const tree = buildRegTree(X, residual, { maxDepth });
    const step = X.map((xi) => regTreePredict(tree, xi));
    pred = pred.map((p, i) => p + lr * step[i]);
    stages.push({ tree, residual, pred: [...pred], mse: mse(y, pred) });
  }
  return { base, lr, stages };
}

export function boostPredict(model, x, upTo = Infinity) {
  let p = model.base;
  model.stages.slice(0, upTo).forEach(({ tree }) => { p += model.lr * regTreePredict(tree, x); });
  return p;
}

// ─── SVM (SMO on the dual) ──────────────────────────────────────────────────
// Sequential Minimal Optimization: repeatedly pick two multipliers and solve
// that 2-variable sub-problem exactly. This converges to the true optimum, which
// matters here — a simulator that highlights "the support vectors" and draws
// "the margin" has to be showing the real ones, not an approximation that
// happens to classify correctly.
//
// Works with any kernel. For the linear kernel we also recover
// w = Σ αᵢ yᵢ xᵢ so the boundary and both margin lines can be drawn.

export const rbf = (a, bv, gamma) =>
  Math.exp(-gamma * a.reduce((s, x, i) => s + (x - bv[i]) ** 2, 0));

export const polyKernel = (a, bv, degree = 3, coef0 = 1) => (dot(a, bv) + coef0) ** degree;

export function kernelFn(kernel, { gamma = 1, degree = 3 } = {}) {
  if (kernel === "rbf") return (a, b) => rbf(a, b, gamma);
  if (kernel === "poly") return (a, b) => polyKernel(a, b, degree);
  return (a, b) => dot(a, b);
}

export function svmSMO(X, y01, {
  C = 1, kernel = "linear", gamma = 1, degree = 3,
  tol = 1e-4, maxPasses = 40, seed = 17,
} = {}) {
  const y = y01.map((v) => (v === 1 ? 1 : -1));
  const n = X.length;
  const kfn = kernelFn(kernel, { gamma, degree });
  const K = X.map((a) => X.map((b) => kfn(a, b)));
  const alpha = zeros(n);
  let b = 0;
  const r = rng(seed);

  const f = (i) => {
    let s = b;
    for (let j = 0; j < n; j++) if (alpha[j] !== 0) s += alpha[j] * y[j] * K[i][j];
    return s;
  };

  let passes = 0, iterations = 0;
  while (passes < maxPasses) {
    let changed = 0;
    for (let i = 0; i < n; i++) {
      const Ei = f(i) - y[i];
      // KKT violation check
      if ((y[i] * Ei < -tol && alpha[i] < C) || (y[i] * Ei > tol && alpha[i] > 0)) {
        let j = i;
        while (j === i) j = Math.floor(r() * n);
        const Ej = f(j) - y[j];
        const ai = alpha[i], aj = alpha[j];

        let L, H;
        if (y[i] !== y[j]) { L = Math.max(0, aj - ai); H = Math.min(C, C + aj - ai); }
        else { L = Math.max(0, ai + aj - C); H = Math.min(C, ai + aj); }
        if (H - L < 1e-12) continue;

        const eta = K[i][i] + K[j][j] - 2 * K[i][j];
        if (eta <= 1e-12) continue;

        let ajNew = aj + (y[j] * (Ei - Ej)) / eta;
        ajNew = Math.min(H, Math.max(L, ajNew));
        if (Math.abs(ajNew - aj) < 1e-9) continue;

        const aiNew = ai + y[i] * y[j] * (aj - ajNew);
        alpha[i] = aiNew;
        alpha[j] = ajNew;

        const b1 = b - Ei - y[i] * (aiNew - ai) * K[i][i] - y[j] * (ajNew - aj) * K[i][j];
        const b2 = b - Ej - y[i] * (aiNew - ai) * K[i][j] - y[j] * (ajNew - aj) * K[j][j];
        if (aiNew > 1e-9 && aiNew < C - 1e-9) b = b1;
        else if (ajNew > 1e-9 && ajNew < C - 1e-9) b = b2;
        else b = (b1 + b2) / 2;

        changed++;
        iterations++;
      }
    }
    passes = changed === 0 ? passes + 1 : 0;
    if (iterations > 40000) break;
  }

  const decide = (x) => {
    let s = b;
    for (let j = 0; j < n; j++) if (alpha[j] > 1e-9) s += alpha[j] * y[j] * kfn(x, X[j]);
    return s;
  };

  const svIdx = alpha.map((a, i) => ({ a, i })).filter(({ a }) => a > 1e-6).map(({ i }) => i);
  const margins = X.map((xi, i) => y[i] * decide(xi));

  // Linear kernel: recover the explicit weight vector.
  let w = null, marginWidth = null;
  if (kernel === "linear") {
    w = zeros(X[0].length);
    for (let i = 0; i < n; i++) if (alpha[i] > 1e-9) for (let d = 0; d < w.length; d++) w[d] += alpha[i] * y[i] * X[i][d];
    marginWidth = 2 / Math.max(1e-12, norm(w));
  }

  return {
    alpha, b, decide, margins, w, marginWidth, iterations, C, kernel, gamma,
    supportVectors: svIdx,
    // Points sitting exactly ON the margin (0 < α < C) vs those that violate it
    // (α = C). Distinguishing them is the whole story of what C does.
    onMargin: svIdx.filter((i) => alpha[i] < C - 1e-6),
    violators: svIdx.filter((i) => alpha[i] >= C - 1e-6),
    objective: (() => {
      let s = 0;
      for (let i = 0; i < n; i++) s += alpha[i];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s -= 0.5 * alpha[i] * alpha[j] * y[i] * y[j] * K[i][j];
      return s;
    })(),
  };
}

// Convenience wrappers so callers read clearly.
export const svmLinear = (X, y, opts = {}) => svmSMO(X, y, { ...opts, kernel: "linear" });
export const svmKernel = (X, y, opts = {}) => svmSMO(X, y, { kernel: "rbf", ...opts });

// ─── k-MEANS (exposed one iteration at a time) ──────────────────────────────

export function kmeansInit(X, k, seed = 3) {
  const r = rng(seed);
  const idx = shuffled(X.map((_, i) => i), r).slice(0, k);
  return idx.map((i) => [...X[i]]);
}

export function kmeansAssign(X, centroids) {
  return X.map((x) => {
    let best = 0, bd = Infinity;
    centroids.forEach((c, j) => {
      const d = c.reduce((s, v, k) => s + (v - x[k]) ** 2, 0);
      if (d < bd) { bd = d; best = j; }
    });
    return best;
  });
}

export function kmeansUpdate(X, labels, k) {
  const sums = Array.from({ length: k }, () => zeros(X[0].length));
  const counts = zeros(k);
  X.forEach((x, i) => { counts[labels[i]]++; x.forEach((v, j) => { sums[labels[i]][j] += v; }); });
  return sums.map((s, j) => (counts[j] === 0 ? null : s.map((v) => v / counts[j])));
}

export const inertia = (X, labels, centroids) =>
  X.reduce((s, x, i) => {
    const c = centroids[labels[i]];
    return c ? s + c.reduce((t, v, j) => t + (v - x[j]) ** 2, 0) : s;
  }, 0);

// ─── PCA (power iteration on the covariance matrix) ─────────────────────────

export function covariance(X) {
  const n = X.length, d = X[0].length;
  const mu = Array.from({ length: d }, (_, j) => mean(X.map((x) => x[j])));
  const Xc = X.map((x) => x.map((v, j) => v - mu[j]));
  const C = zeros2(d, d);
  for (const x of Xc) for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) C[i][j] += (x[i] * x[j]) / (n - 1);
  return { C, mu, Xc };
}

// Top eigenvector by power iteration; deflate to get the next one.
export function topEigen(C, iters = 200) {
  const d = C.length;
  let v = Array.from({ length: d }, (_, i) => (i === 0 ? 1 : 0.3));
  for (let t = 0; t < iters; t++) {
    v = matvec(C, v);
    const nv = norm(v);
    if (nv < 1e-14) break;
    v = scale(v, 1 / nv);
  }
  const lambda = dot(v, matvec(C, v));
  return { vector: v, value: lambda };
}

export function pca(X, k = 2) {
  const { C, mu, Xc } = covariance(X);
  let M = C.map((r) => [...r]);
  const comps = [];
  for (let c = 0; c < k; c++) {
    const { vector, value } = topEigen(M);
    comps.push({ vector, value });
    // Deflate: M ← M − λ v vᵀ
    for (let i = 0; i < M.length; i++) for (let j = 0; j < M.length; j++) M[i][j] -= value * vector[i] * vector[j];
  }
  const totalVar = C.reduce((s, r, i) => s + r[i], 0);
  return {
    components: comps.map((c) => ({ ...c, explained: c.value / totalVar })),
    mu, Xc, totalVar,
    project: (x, comp) => dot(x.map((v, j) => v - mu[j]), comps[comp].vector),
  };
}

// Project onto an arbitrary unit direction — lets a simulator let you DRAG the
// axis and see why the principal one is special.
export function projectOnto(X, theta) {
  const u = [Math.cos(theta), Math.sin(theta)];
  const mu = [mean(X.map((x) => x[0])), mean(X.map((x) => x[1]))];
  const t = X.map((x) => (x[0] - mu[0]) * u[0] + (x[1] - mu[1]) * u[1]);
  const recon = t.map((s) => [mu[0] + s * u[0], mu[1] + s * u[1]]);
  const reconError = mean(X.map((x, i) => (x[0] - recon[i][0]) ** 2 + (x[1] - recon[i][1]) ** 2));
  return { u, mu, t, recon, variance: variance(t), reconError };
}

// ─── TRUNCATED SVD (used by the LoRA lab) ───────────────────────────────────
// One singular triplet at a time via power iteration on AᵀA, then deflate.

export function truncatedSVD(A, rank) {
  let M = A.map((r) => [...r]);
  const triplets = [];
  for (let k = 0; k < rank; k++) {
    const At = transpose(M);
    const AtA = matmul(At, M);
    const { vector: v } = topEigen(AtA, 300);
    const Av = matvec(M, v);
    const s = norm(Av);
    if (s < 1e-10) break;
    const u = scale(Av, 1 / s);
    triplets.push({ u, s, v });
    for (let i = 0; i < M.length; i++) for (let j = 0; j < M[0].length; j++) M[i][j] -= s * u[i] * v[j];
  }
  return triplets;
}

export function svdReconstruct(triplets, rows, cols, rank = Infinity) {
  const R = zeros2(rows, cols);
  triplets.slice(0, rank).forEach(({ u, s, v }) => {
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) R[i][j] += s * u[i] * v[j];
  });
  return R;
}

export const frobenius = (A, B) =>
  Math.sqrt(A.reduce((s, row, i) => s + row.reduce((t, v, j) => t + (v - B[i][j]) ** 2, 0), 0));

// ─── GAUSSIAN NAIVE BAYES ───────────────────────────────────────────────────

export function gaussianNB(X, y, nClasses = 2) {
  const d = X[0].length;
  const params = [];
  for (let c = 0; c < nClasses; c++) {
    const rows = X.filter((_, i) => y[i] === c);
    params.push({
      prior: rows.length / X.length,
      mu: Array.from({ length: d }, (_, j) => mean(rows.map((x) => x[j]))),
      sigma: Array.from({ length: d }, (_, j) => Math.max(1e-6, variance(rows.map((x) => x[j])))),
    });
  }
  const logProb = (x, c) => {
    const p = params[c];
    let lp = Math.log(p.prior);
    for (let j = 0; j < d; j++) {
      lp += -0.5 * Math.log(2 * Math.PI * p.sigma[j]) - ((x[j] - p.mu[j]) ** 2) / (2 * p.sigma[j]);
    }
    return lp;
  };
  return {
    params,
    predictProba: (x) => {
      const lps = Array.from({ length: nClasses }, (_, c) => logProb(x, c));
      const m = Math.max(...lps);
      const e = lps.map((l) => Math.exp(l - m));
      const s = e.reduce((a, b) => a + b, 0);
      return e.map((v) => v / s);
    },
  };
}

// ─── CLASSIFICATION METRICS ─────────────────────────────────────────────────

export function confusion(y, scores, threshold) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  y.forEach((yi, i) => {
    const pred = scores[i] >= threshold ? 1 : 0;
    if (yi === 1 && pred === 1) tp++;
    else if (yi === 0 && pred === 1) fp++;
    else if (yi === 1 && pred === 0) fn++;
    else tn++;
  });
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  return {
    tp, fp, fn, tn, precision, recall,
    tpr: recall,
    fpr: fp + tn === 0 ? 0 : fp / (fp + tn),
    f1: precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall),
    accuracy: (tp + tn) / y.length,
    specificity: fp + tn === 0 ? 0 : tn / (fp + tn),
  };
}

export function rocCurve(y, scores) {
  const thresholds = [...new Set(scores)].sort((a, b) => b - a);
  const pts = [{ fpr: 0, tpr: 0, threshold: Infinity }];
  for (const t of thresholds) {
    const c = confusion(y, scores, t);
    pts.push({ fpr: c.fpr, tpr: c.tpr, threshold: t, precision: c.precision });
  }
  pts.push({ fpr: 1, tpr: 1, threshold: -Infinity });
  let auc = 0;
  for (let i = 1; i < pts.length; i++) auc += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  return { points: pts, auc };
}

export function prCurve(y, scores) {
  const thresholds = [...new Set(scores)].sort((a, b) => b - a);
  const pts = thresholds.map((t) => { const c = confusion(y, scores, t); return { recall: c.recall, precision: c.precision, threshold: t }; });
  let ap = 0, prev = 0;
  for (const p of pts) { ap += (p.recall - prev) * p.precision; prev = p.recall; }
  return { points: pts, ap };
}

// ─── CROSS-VALIDATION ───────────────────────────────────────────────────────

export function kFolds(n, k, seed = 5) {
  const order = shuffled(Array.from({ length: n }, (_, i) => i), rng(seed));
  const folds = Array.from({ length: k }, () => []);
  order.forEach((i, p) => folds[p % k].push(i));
  return folds.map((test, f) => ({
    fold: f, test: test.sort((a, b) => a - b),
    train: order.filter((i) => !test.includes(i)).sort((a, b) => a - b),
  }));
}

// ─── STANDARDIZATION ────────────────────────────────────────────────────────

export function standardize(X) {
  const d = X[0].length;
  const mu = Array.from({ length: d }, (_, j) => mean(X.map((x) => x[j])));
  const sd = Array.from({ length: d }, (_, j) => Math.max(1e-9, std(X.map((x) => x[j]))));
  return { mu, sd, Z: X.map((x) => x.map((v, j) => (v - mu[j]) / sd[j])) };
}

// ─── GRID HELPER (decision-region rendering) ─────────────────────────────────

export function decisionGrid(predictFn, { xMin, xMax, yMin, yMax, res = 34 }) {
  const cells = [];
  const dx = (xMax - xMin) / res, dy = (yMax - yMin) / res;
  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const x = xMin + (i + 0.5) * dx, y = yMin + (j + 0.5) * dy;
      cells.push({ x, y, i, j, v: predictFn([x, y]) });
    }
  }
  return { cells, dx, dy, res };
}
