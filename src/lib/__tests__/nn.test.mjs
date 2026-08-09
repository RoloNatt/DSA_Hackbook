import * as N from "../nn.js";
import * as M from "../mlmath.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);
const close = (a, b, t = 1e-6) => Math.abs(a - b) < t;

// ── activation derivatives vs central differences ───────────────────────────
for (const [name, a] of Object.entries(N.ACTIVATIONS)) {
  let worst = 0;
  for (const z of [-3, -1.5, -0.4, 0.3, 1.2, 2.7]) {
    const num = (a.f(z + 1e-6) - a.f(z - 1e-6)) / 2e-6;
    worst = Math.max(worst, Math.abs(num - a.df(z)));
  }
  ok(`d/dz ${name} matches numeric`, worst < 1e-4, `max err=${worst.toExponential(2)}`);
}
ok("sigmoid' peaks at 0.25", close(N.ACTIVATIONS.sigmoid.df(0), 0.25, 1e-9), N.ACTIVATIONS.sigmoid.df(0).toFixed(6));
ok("tanh' peaks at 1.0", close(N.ACTIVATIONS.tanh.df(0), 1, 1e-9));
ok("relu' is 0 for negatives (dead ReLU)", N.ACTIVATIONS.relu.df(-2) === 0);
ok("leaky relu' is 0.1 for negatives", close(N.ACTIVATIONS.leaky.df(-2), 0.1));

// ── the claim in the sigmoid note: 0.25^10 ≈ 1e-6 ───────────────────────────
ok("0.25^10 ≈ 1e-6 (the sigmoid depth claim)", 0.25 ** 10 < 1e-6 && 0.25 ** 10 > 9e-7, (0.25 ** 10).toExponential(3));

// ── BACKPROP vs numerical gradient — the critical test ──────────────────────
for (const activation of ["tanh", "relu", "sigmoid", "gelu", "leaky"]) {
  const net = N.makeMLP({ inputDim: 3, hidden: [4, 3], activation, output: "sigmoid", seed: 11 });
  const gc = N.gradCheck(net, [0.4, -1.1, 0.7], 1);
  ok(`gradCheck ${activation} (${gc.n} weights)`, gc.maxRelError < 1e-5,
    `max rel err=${gc.maxRelError.toExponential(2)} mean=${gc.meanRelError.toExponential(2)}`);
}
{
  const net = N.makeMLP({ inputDim: 2, hidden: [5], activation: "tanh", output: "linear", seed: 4 });
  const gc = N.gradCheck(net, [0.9, -0.3], 2.5);
  ok("gradCheck linear output / squared error", gc.maxRelError < 1e-5, `max rel err=${gc.maxRelError.toExponential(2)}`);
}

// ── training actually reduces loss and solves XOR ────────────────────────────
const XOR = [[0, 0], [0, 1], [1, 0], [1, 1]], yXOR = [0, 1, 1, 0];
{
  const net = N.makeMLP({ inputDim: 2, hidden: [4, 4], activation: "tanh", seed: 7 });
  const before = N.evaluate(net, XOR, yXOR);
  for (let e = 0; e < 4000; e++) N.trainStep(net, XOR, yXOR, { lr: 0.05, optimizer: "adam" });
  const after = N.evaluate(net, XOR, yXOR);
  ok("MLP solves XOR", after.accuracy === 1 && after.loss < 0.05,
    `loss ${before.loss.toFixed(4)} → ${after.loss.toFixed(5)}, acc=${after.accuracy}`);
}
{
  // No hidden layer = linear model = cannot solve XOR. The point of the sim.
  const net = N.makeMLP({ inputDim: 2, hidden: [], activation: "tanh", seed: 7 });
  for (let e = 0; e < 4000; e++) N.trainStep(net, XOR, yXOR, { lr: 0.05, optimizer: "adam" });
  const r = N.evaluate(net, XOR, yXOR);
  ok("no hidden layer FAILS XOR", r.accuracy < 1, `acc=${r.accuracy} loss=${r.loss.toFixed(4)}`);
}
{
  // Linear activation with hidden layers is still linear — also fails.
  const net = N.makeMLP({ inputDim: 2, hidden: [8, 8], activation: "linear", seed: 7 });
  for (let e = 0; e < 4000; e++) N.trainStep(net, XOR, yXOR, { lr: 0.05, optimizer: "adam" });
  const r = N.evaluate(net, XOR, yXOR);
  ok("linear activations FAIL XOR despite depth", r.accuracy < 1, `acc=${r.accuracy}`);
}

// ── optimizers all converge, adam fastest here ──────────────────────────────
{
  const losses = {};
  for (const opt of ["sgd", "momentum", "adam"]) {
    const net = N.makeMLP({ inputDim: 2, hidden: [6], activation: "tanh", seed: 5 });
    for (let e = 0; e < 600; e++) N.trainStep(net, XOR, yXOR, { lr: 0.1, optimizer: opt });
    losses[opt] = N.evaluate(net, XOR, yXOR).loss;
  }
  ok("all optimizers reduce loss below 0.7", Object.values(losses).every((l) => l < 0.7),
    Object.entries(losses).map(([k, v]) => `${k}=${v.toFixed(4)}`).join(" "));
  ok("adam beats plain sgd at equal steps", losses.adam < losses.sgd,
    `adam=${losses.adam.toFixed(4)} sgd=${losses.sgd.toFixed(4)}`);
}

// ── gradient flow: sigmoid vanishes, relu survives ──────────────────────────
{
  const sig = N.gradientFlow({ depth: 14, activation: "sigmoid", init: "xavier", seed: 5 });
  const relu = N.gradientFlow({ depth: 14, activation: "relu", init: "he", seed: 5 });
  ok("deep sigmoid vanishes", sig.verdict === "vanishing", `ratio=${sig.ratio.toExponential(2)} (${sig.verdict})`);
  ok("deep relu+he does not vanish", relu.ratio > sig.ratio,
    `relu ratio=${relu.ratio.toExponential(2)} vs sigmoid ${sig.ratio.toExponential(2)}`);
  const big = N.gradientFlow({ depth: 10, activation: "leaky", init: "large", seed: 5 });
  ok("large init explodes", big.verdict === "exploding", `ratio=${big.ratio.toExponential(2)} per-layer=${big.perLayerFactor.toFixed(3)} (${big.verdict})`);
  ok("healthy net keeps signal within 1000x", N.gradientFlow({ depth: 6, activation: "relu", init: "he", seed: 5 }).verdict === "healthy",
    `${N.gradientFlow({ depth: 6, activation: "relu", init: "he", seed: 5 }).ratio.toExponential(2)}`);
  ok("sigmoid per-layer factor < 1 (shrinks every hop)", sig.perLayerFactor < 1, `factor=${sig.perLayerFactor.toFixed(4)}`);
}

// ── BPTT magnitude: w<1 vanishes, w>1 explodes ──────────────────────────────
{
  const v = N.bpttMagnitude({ T: 40, w: 0.8 });
  const e = N.bpttMagnitude({ T: 40, w: 3.0, activation: "leaky" });
  ok("w=0.8 vanishes over 40 steps", v.verdict === "vanished", `final=${v.final.toExponential(2)} halfLife=${v.halfLife}`);
  ok("w=3.0 explodes", e.final > 1e3, `final=${e.final.toExponential(2)}`);
  ok("magnitude monotone for w<1", v.perStep.every((p, i) => i === 0 || p.magnitude <= v.perStep[i - 1].magnitude));
}

// ── conv2d: identity kernel is a no-op ──────────────────────────────────────
const img = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
{
  const out = N.conv2d(img, N.KERNELS.identity.k, { padding: 1 });
  ok("identity kernel reproduces image", JSON.stringify(out) === JSON.stringify(img), `${out.length}x${out[0].length}`);
}
{
  // Hand-computed: 3x3 box blur, padding 1, top-left cell
  // = (0+0+0 + 0+1+2 + 0+5+6)/9 = 14/9 = 1.5556
  const b = N.conv2d(img, N.KERNELS.blur.k, { padding: 1 });
  ok("blur top-left == hand-computed 14/9", close(b[0][0], 14 / 9, 1e-9), `${b[0][0].toFixed(6)} vs ${(14 / 9).toFixed(6)}`);
  // centre cell (1,1) = mean of the full 3x3 = (1+2+3+5+6+7+9+10+11)/9 = 54/9 = 6
  ok("blur centre == 6", close(b[1][1], 6, 1e-9), b[1][1].toFixed(6));
}
{
  // Sobel X on a vertical step edge must fire on the edge and be 0 elsewhere
  const step = [[0, 0, 9, 9], [0, 0, 9, 9], [0, 0, 9, 9], [0, 0, 9, 9]];
  const sx = N.conv2d(step, N.KERNELS.sobelX.k, { padding: 1 });
  ok("sobelX fires on a vertical edge", Math.max(...sx.flat()) > 30, `max=${Math.max(...sx.flat())}`);
  const sy = N.conv2d(step, N.KERNELS.sobelY.k, { padding: 1 });
  const interior = [sy[1][1], sy[1][2], sy[2][1], sy[2][2]];
  ok("sobelY is blind to a vertical edge (interior)", interior.every((v) => Math.abs(v) < 1e-9), `interior=${interior}`);
}
{
  // Edge kernel sums to zero → constant image gives zero response
  const flat = Array.from({ length: 5 }, () => Array(5).fill(7));
  const e = N.conv2d(flat, N.KERNELS.edgeAll.k, { padding: 0 });
  ok("edge kernel gives 0 on a flat region", e.flat().every((v) => Math.abs(v) < 1e-9), `vals=${e.flat().slice(0, 3)}`);
  const s = N.KERNELS.edgeAll.k.flat().reduce((a, b) => a + b, 0);
  ok("edge kernel weights sum to 0", close(s, 0, 1e-12), `sum=${s}`);
  const bs = N.KERNELS.blur.k.flat().reduce((a, b) => a + b, 0);
  ok("blur kernel weights sum to 1 (brightness preserved)", close(bs, 1, 1e-12), `sum=${bs}`);
}
{
  const d = N.convCellDetail(img, N.KERNELS.blur.k, 1, 1, { padding: 0 });
  ok("convCellDetail sum matches conv2d", close(d.sum, N.conv2d(img, N.KERNELS.blur.k)[1][1], 1e-12), `sum=${d.sum.toFixed(6)}`);
  ok("convCellDetail has k*k terms", d.terms.length === 9);
}

// ── shapes: the classic 224 → 112 case ──────────────────────────────────────
{
  const s = N.convShape({ inSize: 224, kernel: 7, stride: 2, padding: 3, inCh: 3, outCh: 64 });
  ok("224 /k7 /s2 /p3 → 112", s.out === 112, s.formula);
  ok("params = 7*7*3*64 + 64 = 9472", s.params === 9472, `params=${s.params}`);
  const s2 = N.convShape({ inSize: 32, kernel: 3, stride: 1, padding: 1, inCh: 3, outCh: 16 });
  ok("32 /k3 /s1 /p1 → 32 (same padding)", s2.out === 32, s2.formula);
  ok("params = 3*3*3*16 + 16 = 448", s2.params === 448, `params=${s2.params}`);
  ok("dense equivalent is vastly larger", s2.denseEquivalent > s2.params * 1000,
    `conv=${s2.params} dense=${s2.denseEquivalent.toLocaleString()}`);
  ok("same-padding for k=5 is 2", N.convShape({ inSize: 10, kernel: 5 }).samePadding === 2);
  ok("dilation widens receptive field", N.convShape({ inSize: 20, kernel: 3, dilation: 3 }).receptiveField === 7);
}

// ── pooling ─────────────────────────────────────────────────────────────────
{
  const { out } = N.maxPool2d(img, 2, 2);
  ok("maxpool 2x2 on 4x4 → 2x2 = [[6,8],[14,16]]", JSON.stringify(out) === JSON.stringify([[6, 8], [14, 16]]), JSON.stringify(out));
  const a = N.avgPool2d(img, 2, 2);
  ok("avgpool 2x2 top-left = (1+2+5+6)/4 = 3.5", close(a[0][0], 3.5), a[0][0].toString());
}

// ── attention ───────────────────────────────────────────────────────────────
{
  const Q = [[1, 0], [0, 1]], K = [[1, 0], [0, 1]], V = [[10, 0], [0, 20]];
  const a = N.attention(Q, K, V);
  ok("attention rows sum to 1", a.weights.every((r) => close(r.reduce((x, y) => x + y, 0), 1)),
    a.weights.map((r) => r.map((v) => v.toFixed(3)).join("/")).join("  "));
  ok("attention scale is sqrt(dk)", close(a.sqrtDk, Math.SQRT2), a.sqrtDk.toFixed(6));
  // Token 0's query matches key 0 → must attend mostly to itself
  ok("self-match dominates", a.weights[0][0] > a.weights[0][1], `${a.weights[0][0].toFixed(4)} vs ${a.weights[0][1].toFixed(4)}`);
  // Causal mask: token 0 cannot see token 1
  const c = N.attention(Q, K, V, { mask: N.causalMask });
  ok("causal mask zeroes the future", c.weights[0][1] === 0 && close(c.weights[0][0], 1),
    `row0=[${c.weights[0].map((v) => v.toFixed(3))}]`);
  ok("causal row 1 sees both", c.weights[1][0] > 0 && c.weights[1][1] > 0, `row1=[${c.weights[1].map((v) => v.toFixed(3))}]`);
  // Low temperature sharpens
  const sharp = N.attention(Q, K, V, { temperature: 0.1 });
  ok("low temperature sharpens attention", sharp.weights[0][0] > a.weights[0][0],
    `T=1 → ${a.weights[0][0].toFixed(4)}, T=0.1 → ${sharp.weights[0][0].toFixed(4)}`);
  // Unscaled scores are larger in magnitude -> more saturated softmax
  // dk = 16: query of ones vs key of ones (dot 16) and key of halves (dot 8).
  // Unscaled: softmax(16, 8) is near one-hot. Scaled by 1/4: softmax(4, 2) is soft.
  const dk = 16;
  const Qb = [Array(dk).fill(1)];
  const Kb = [Array(dk).fill(1), Array(dk).fill(0.5)];
  const Vb = [[1, 0], [0, 1]];
  const un = N.attention(Qb, Kb, Vb, { scale: false });
  const sc = N.attention(Qb, Kb, Vb, { scale: true });
  ok("no 1/sqrt(dk) saturates softmax", un.weights[0][0] > sc.weights[0][0] && un.weights[0][0] > 0.999 && sc.weights[0][0] < 0.9,
    `unscaled=${un.weights[0][0].toFixed(6)} scaled=${sc.weights[0][0].toFixed(6)} (dk=${dk})`);
  ok("scaling keeps gradients alive (weight not ~0/1)", sc.weights[0][1] > 0.1,
    `scaled attends ${(sc.weights[0][1] * 100).toFixed(1)}% to the weaker key vs ${(un.weights[0][1] * 100).toExponential(1)}% unscaled`);
}

// ── LSTM: forget gate at 0 must erase the cell ──────────────────────────────
{
  const H = 2;
  const mk = (v) => Array.from({ length: H }, () => [v]);
  const mkh = (v) => Array.from({ length: H }, () => Array(H).fill(v));
  const P = {
    Wxf: mk(0), Whf: mkh(0), bf: Array(H).fill(-20),   // forget gate ≈ 0
    Wxi: mk(0), Whi: mkh(0), bi: Array(H).fill(20),    // input gate ≈ 1
    Wxo: mk(0), Who: mkh(0), bo: Array(H).fill(20),    // output gate ≈ 1
    Wxg: mk(1), Whg: mkh(0), bg: Array(H).fill(0),
  };
  const { trace } = N.lstmRun([1, 0, 0, 0], P);
  ok("forget≈0 erases memory of step 1", Math.abs(trace[3].c[0]) < 0.01,
    `c over time = ${trace.map((t) => t.c[0].toFixed(4)).join(", ")}`);
  const P2 = { ...P, bf: Array(H).fill(20) };          // forget gate ≈ 1 = remember
  const r2 = N.lstmRun([1, 0, 0, 0], P2);
  ok("forget≈1 retains memory of step 1", r2.trace[3].c[0] > 0.7,
    `c over time = ${r2.trace.map((t) => t.c[0].toFixed(4)).join(", ")}`);
}

// ── RNN hidden state evolves and stays bounded by tanh ──────────────────────
{
  const Wxh = [[0.8], [-0.5]], Whh = [[0.5, 0.2], [0.1, 0.6]], bh = [0, 0];
  const { states } = N.rnnRun([1, 1, 1, 1, 1], { Wxh, Whh, bh });
  ok("rnn returns T+1 states", states.length === 6, `${states.length}`);
  ok("rnn tanh keeps |h| < 1", states.flat().every((v) => Math.abs(v) < 1), `final=${states[5].map((v) => v.toFixed(4))}`);
  ok("rnn state actually changes", Math.abs(states[1][0] - states[0][0]) > 1e-6);
}

// ── batch norm / layer norm ────────────────────────────────────────────────
{
  const b = N.batchNorm([[1, 100], [2, 200], [3, 300], [4, 400]]);
  const col0 = b.out.map((x) => x[0]), col1 = b.out.map((x) => x[1]);
  ok("batchnorm zero-means each feature", close(M.mean(col0), 0, 1e-9) && close(M.mean(col1), 0, 1e-9));
  ok("batchnorm unit-variances each feature", close(M.std(col0), 1, 1e-4) && close(M.std(col1), 1, 1e-4),
    `std=${M.std(col0).toFixed(6)}, ${M.std(col1).toFixed(6)}`);
  ok("batchnorm equalizes wildly different scales", close(col0[0], col1[0], 1e-4),
    `feature scales 1-4 and 100-400 both → ${col0[0].toFixed(4)} / ${col1[0].toFixed(4)}`);
  const l = N.layerNorm([1, 2, 3, 4]);
  ok("layernorm normalizes across features of ONE sample", close(M.mean(l.out), 0, 1e-9) && close(M.std(l.out), 1, 1e-4),
    `out=${l.out.map((v) => v.toFixed(4))}`);
}

// ── dropout: inverted scaling preserves expectation ────────────────────────
{
  const x = Array(2000).fill(1);
  const d = N.dropout(x, 0.5, 9);
  ok("dropout keeps ≈(1−p) fraction", Math.abs(d.kept / 2000 - 0.5) < 0.05, `kept=${(d.kept / 2000).toFixed(4)}`);
  ok("inverted dropout preserves the mean", Math.abs(M.mean(d.out) - 1) < 0.1, `mean=${M.mean(d.out).toFixed(4)} (target 1.0)`);
  ok("dropout is a no-op at eval time", N.dropout(x, 0.5, 9, false).out.every((v) => v === 1));
  ok("dropout p=0 is identity", N.dropout([1, 2, 3], 0, 1).out.join() === "1,2,3");
}

// ── softmax cross-entropy: grad = p − onehot ───────────────────────────────
{
  const r = N.softmaxCrossEntropy([2, 1, 0.1], 0);
  ok("sce probs sum to 1", close(r.probs.reduce((a, b) => a + b, 0), 1));
  ok("sce grad = p − onehot", close(r.grad[0], r.probs[0] - 1) && close(r.grad[1], r.probs[1]),
    `grad=${r.grad.map((v) => v.toFixed(4))}`);
  ok("sce grad sums to 0", close(r.grad.reduce((a, b) => a + b, 0), 0, 1e-12));
  ok("confident+correct → tiny loss", N.softmaxCrossEntropy([20, 0, 0], 0).loss < 1e-8,
    N.softmaxCrossEntropy([20, 0, 0], 0).loss.toExponential(2));
  ok("confident+wrong → huge loss", N.softmaxCrossEntropy([20, 0, 0], 2).loss > 15,
    N.softmaxCrossEntropy([20, 0, 0], 2).loss.toFixed(4));
  ok("uniform 3-class loss = ln3", close(N.softmaxCrossEntropy([0, 0, 0], 1).loss, Math.log(3), 1e-12),
    N.softmaxCrossEntropy([0, 0, 0], 1).loss.toFixed(8));
}

// ── determinism & param counting ───────────────────────────────────────────
{
  const a = N.makeMLP({ inputDim: 2, hidden: [3, 3], seed: 42 });
  const b = N.makeMLP({ inputDim: 2, hidden: [3, 3], seed: 42 });
  ok("makeMLP deterministic for a seed", JSON.stringify(a.W) === JSON.stringify(b.W));
  // 2→3: 6w+3b, 3→3: 9w+3b, 3→1: 3w+1b  =  18 + 7 = 25
  ok("nParams counted correctly (25)", a.nParams === 25, `${a.nParams}`);
}
