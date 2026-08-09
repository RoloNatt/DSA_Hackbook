// Neural network internals, written to be inspected rather than to be fast.
//
// Every intermediate value a simulator wants to show — pre-activations, per-layer
// gradients, weight norms, the exact chain-rule product at each step — is kept
// and returned rather than discarded. That is the whole point: the interesting
// thing about backprop is not the answer, it's the intermediate quantities.

import { rng, gauss, zeros, zeros2, dot, mean } from "./mlmath.js";

// ─── ACTIVATIONS (value + derivative, side by side) ─────────────────────────

export const ACTIVATIONS = {
  relu: {
    label: "ReLU", f: (z) => Math.max(0, z), df: (z) => (z > 0 ? 1 : 0),
    range: "[0, ∞)", saturates: "only on the left (dead ReLU)",
    note: "Cheap, non-saturating for positive inputs, and the default for hidden layers. Gradient is exactly 0 for negative inputs, so a unit whose input is always negative stops learning forever.",
  },
  leaky: {
    label: "Leaky ReLU", f: (z) => (z > 0 ? z : 0.1 * z), df: (z) => (z > 0 ? 1 : 0.1),
    range: "(−∞, ∞)", saturates: "never",
    note: "Fixes dead ReLU by leaking a small gradient (0.1 here) for negative inputs. Costs one comparison; almost always a safe swap.",
  },
  tanh: {
    label: "tanh", f: (z) => Math.tanh(z), df: (z) => 1 - Math.tanh(z) ** 2,
    range: "(−1, 1)", saturates: "both ends",
    note: "Zero-centred, which helps optimization versus sigmoid. Derivative peaks at 1.0 and decays fast — stack many layers and the product of derivatives vanishes.",
  },
  sigmoid: {
    label: "sigmoid", f: (z) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z)))),
    df: (z) => { const s = 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z)))); return s * (1 - s); },
    range: "(0, 1)", saturates: "both ends",
    note: "Derivative maxes out at 0.25, so ten stacked sigmoid layers scale the gradient by at most 0.25¹⁰ ≈ 1e−6. This single number is why deep sigmoid networks did not train before ReLU.",
  },
  linear: {
    label: "linear", f: (z) => z, df: () => 1,
    range: "(−∞, ∞)", saturates: "never",
    note: "No non-linearity. Stacking linear layers collapses to one linear layer — the algebra is in the Deep Learning section. Useful only for regression outputs.",
  },
  gelu: {
    label: "GELU", f: (z) => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * z ** 3))),
    df: (z) => {
      const c = Math.sqrt(2 / Math.PI), inner = c * (z + 0.044715 * z ** 3);
      const t = Math.tanh(inner), sech2 = 1 - t * t;
      return 0.5 * (1 + t) + 0.5 * z * sech2 * c * (1 + 3 * 0.044715 * z * z);
    },
    range: "(−0.17, ∞)", saturates: "softly on the left",
    note: "Smooth ReLU-like curve used in transformers. Slightly negative just below zero, so it can keep a small gradient where ReLU is flat.",
  },
};

// ─── WEIGHT INITIALIZATION ──────────────────────────────────────────────────

export const INITS = {
  xavier: (fanIn, fanOut, r) => gauss(r) * Math.sqrt(2 / (fanIn + fanOut)),
  he: (fanIn, _fanOut, r) => gauss(r) * Math.sqrt(2 / fanIn),
  small: (_i, _o, r) => gauss(r) * 0.01,
  large: (_i, _o, r) => gauss(r) * 3,
  zero: () => 0,
};

// ─── MLP ────────────────────────────────────────────────────────────────────
// layers: array of hidden widths, e.g. [4, 4]. Output is a single sigmoid unit
// (binary classification) or a linear unit (regression).

export function makeMLP({
  inputDim = 2, hidden = [4, 4], activation = "tanh", output = "sigmoid",
  init = "xavier", seed = 3,
} = {}) {
  const r = rng(seed);
  const sizes = [inputDim, ...hidden, 1];
  const initFn = INITS[init] || INITS.xavier;
  const W = [], b = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    W.push(Array.from({ length: sizes[l + 1] }, () => Array.from({ length: sizes[l] }, () => initFn(sizes[l], sizes[l + 1], r))));
    b.push(zeros(sizes[l + 1]));
  }
  return {
    W, b, sizes, activation, output, seed,
    nParams: W.reduce((s, m) => s + m.length * m[0].length, 0) + b.reduce((s, v) => s + v.length, 0),
    // Adam state
    mW: W.map((m) => m.map((row) => row.map(() => 0))), vW: W.map((m) => m.map((row) => row.map(() => 0))),
    mb: b.map((v) => v.map(() => 0)), vb: b.map((v) => v.map(() => 0)),
    t: 0,
  };
}

// Forward pass keeping every z and every a, so a diagram can label the actual
// numbers flowing through each edge.
export function forward(net, x) {
  const act = ACTIVATIONS[net.activation];
  const zs = [], as = [x];
  let a = x;
  for (let l = 0; l < net.W.length; l++) {
    const z = net.W[l].map((row, i) => dot(row, a) + net.b[l][i]);
    zs.push(z);
    const isLast = l === net.W.length - 1;
    a = isLast
      ? z.map((v) => (net.output === "sigmoid" ? ACTIVATIONS.sigmoid.f(v) : v))
      : z.map(act.f);
    as.push(a);
  }
  return { zs, as, out: a[0] };
}

// Backward pass. Returns per-layer gradients AND their norms, because the norms
// are what reveal vanishing/exploding behaviour across depth.
export function backward(net, x, yTrue) {
  const act = ACTIVATIONS[net.activation];
  const { zs, as, out } = forward(net, x);
  const L = net.W.length;
  const gW = net.W.map((m) => m.map((row) => row.map(() => 0)));
  const gb = net.b.map((v) => v.map(() => 0));

  // For sigmoid output + binary cross-entropy, dL/dz collapses to (p − y).
  // For linear output + squared error it is 2(p − y).
  let delta = net.output === "sigmoid" ? [out - yTrue] : [2 * (out - yTrue)];

  // deltaNorms[l] = magnitude of the error signal ARRIVING at layer l. This is
  // the quantity that vanishes or explodes; weight-gradient norms also depend on
  // activation scale, which muddies the picture.
  const deltaNorms = new Array(L).fill(0);

  for (let l = L - 1; l >= 0; l--) {
    deltaNorms[l] = Math.sqrt(delta.reduce((s, v) => s + v * v, 0));
    for (let i = 0; i < net.W[l].length; i++) {
      gb[l][i] += delta[i];
      for (let j = 0; j < net.W[l][i].length; j++) gW[l][i][j] += delta[i] * as[l][j];
    }
    if (l > 0) {
      const prev = zeros(net.W[l][0].length);
      for (let j = 0; j < prev.length; j++) {
        let s = 0;
        for (let i = 0; i < net.W[l].length; i++) s += net.W[l][i][j] * delta[i];
        prev[j] = s * act.df(zs[l - 1][j]);
      }
      delta = prev;
    }
  }

  const gradNorms = gW.map((m) => Math.sqrt(m.reduce((s, row) => s + row.reduce((t, v) => t + v * v, 0), 0)));
  const loss = net.output === "sigmoid"
    ? -(yTrue * Math.log(Math.max(1e-12, out)) + (1 - yTrue) * Math.log(Math.max(1e-12, 1 - out)))
    : (out - yTrue) ** 2;
  return { gW, gb, loss, out, zs, as, gradNorms, deltaNorms };
}

// One optimizer step over a batch. Returns the mean loss and gradient norms.
export function trainStep(net, X, y, { lr = 0.1, optimizer = "sgd", momentum = 0.9, l2 = 0 } = {}) {
  const n = X.length;
  const GW = net.W.map((m) => m.map((row) => row.map(() => 0)));
  const Gb = net.b.map((v) => v.map(() => 0));
  let loss = 0;
  const normAcc = zeros(net.W.length);

  for (let i = 0; i < n; i++) {
    const { gW, gb, loss: li, gradNorms } = backward(net, X[i], y[i]);
    loss += li;
    gradNorms.forEach((v, l) => { normAcc[l] += v / n; });
    for (let l = 0; l < GW.length; l++) {
      for (let a = 0; a < GW[l].length; a++) {
        Gb[l][a] += gb[l][a] / n;
        for (let c = 0; c < GW[l][a].length; c++) GW[l][a][c] += gW[l][a][c] / n;
      }
    }
  }

  net.t += 1;
  if (!net.velW) {
    net.velW = net.W.map((m) => m.map((row) => row.map(() => 0)));
    net.velb = net.b.map((v) => v.map(() => 0));
  }

  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
  for (let l = 0; l < net.W.length; l++) {
    for (let i = 0; i < net.W[l].length; i++) {
      for (let j = 0; j < net.W[l][i].length; j++) {
        const g = GW[l][i][j] + l2 * net.W[l][i][j];
        if (optimizer === "adam") {
          net.mW[l][i][j] = beta1 * net.mW[l][i][j] + (1 - beta1) * g;
          net.vW[l][i][j] = beta2 * net.vW[l][i][j] + (1 - beta2) * g * g;
          const mh = net.mW[l][i][j] / (1 - beta1 ** net.t);
          const vh = net.vW[l][i][j] / (1 - beta2 ** net.t);
          net.W[l][i][j] -= (lr * mh) / (Math.sqrt(vh) + eps);
        } else if (optimizer === "momentum") {
          net.velW[l][i][j] = momentum * net.velW[l][i][j] - lr * g;
          net.W[l][i][j] += net.velW[l][i][j];
        } else {
          net.W[l][i][j] -= lr * g;
        }
      }
      const gbv = Gb[l][i];
      if (optimizer === "adam") {
        net.mb[l][i] = beta1 * net.mb[l][i] + (1 - beta1) * gbv;
        net.vb[l][i] = beta2 * net.vb[l][i] + (1 - beta2) * gbv * gbv;
        net.b[l][i] -= (lr * (net.mb[l][i] / (1 - beta1 ** net.t))) / (Math.sqrt(net.vb[l][i] / (1 - beta2 ** net.t)) + eps);
      } else if (optimizer === "momentum") {
        net.velb[l][i] = momentum * net.velb[l][i] - lr * gbv;
        net.b[l][i] += net.velb[l][i];
      } else {
        net.b[l][i] -= lr * gbv;
      }
    }
  }
  return { loss: loss / n, gradNorms: normAcc };
}

export const predict = (net, x) => forward(net, x).out;

export function evaluate(net, X, y) {
  let loss = 0, correct = 0;
  X.forEach((x, i) => {
    const p = predict(net, x);
    loss += net.output === "sigmoid"
      ? -(y[i] * Math.log(Math.max(1e-12, p)) + (1 - y[i]) * Math.log(Math.max(1e-12, 1 - p)))
      : (p - y[i]) ** 2;
    if (net.output === "sigmoid" && (p >= 0.5 ? 1 : 0) === y[i]) correct++;
  });
  return { loss: loss / X.length, accuracy: correct / X.length };
}

// ─── GRADIENT CHECK ─────────────────────────────────────────────────────────
// Central differences against the analytic gradient. Shipped because a network
// simulator whose backprop is subtly wrong teaches the wrong thing confidently.

export function gradCheck(net, x, y, eps = 1e-5) {
  const { gW } = backward(net, x, y);
  const errs = [];
  const lossAt = () => {
    const p = forward(net, x).out;
    return net.output === "sigmoid"
      ? -(y * Math.log(Math.max(1e-12, p)) + (1 - y) * Math.log(Math.max(1e-12, 1 - p)))
      : (p - y) ** 2;
  };
  for (let l = 0; l < net.W.length; l++) {
    for (let i = 0; i < net.W[l].length; i++) {
      for (let j = 0; j < net.W[l][i].length; j++) {
        const orig = net.W[l][i][j];
        net.W[l][i][j] = orig + eps; const up = lossAt();
        net.W[l][i][j] = orig - eps; const dn = lossAt();
        net.W[l][i][j] = orig;
        const numeric = (up - dn) / (2 * eps);
        const analytic = gW[l][i][j];
        const denom = Math.max(1e-8, Math.abs(numeric) + Math.abs(analytic));
        errs.push(Math.abs(numeric - analytic) / denom);
      }
    }
  }
  return { maxRelError: Math.max(...errs), meanRelError: mean(errs), n: errs.length };
}

// ─── VANISHING / EXPLODING GRADIENTS ────────────────────────────────────────
// Measures the actual gradient magnitude reaching each layer of a deep stack,
// which is the honest way to show why activation choice and init scale matter.

// A linear output is used deliberately: with a sigmoid output and large weights
// the prediction saturates, dL/dz becomes ~0 and EVERY layer reads zero — which
// is a real failure mode but a different one, and it masks the depth effect.
export function gradientFlow({ depth = 12, width = 6, activation = "sigmoid", init = "xavier", seed = 5 } = {}) {
  const net = makeMLP({ inputDim: width, hidden: Array(depth).fill(width), activation, init, output: "linear", seed });
  const r = rng(seed + 1);
  const x = Array.from({ length: width }, () => gauss(r));
  const { gradNorms, deltaNorms, out } = backward(net, x, 0);

  const last = deltaNorms[deltaNorms.length - 1];   // nearest the output
  const first = deltaNorms[0];                       // nearest the input
  const ratio = last === 0 ? 0 : first / last;

  return {
    gradNorms, deltaNorms, out,
    // How much of the output-layer signal survives the trip back to layer 1.
    ratio,
    perLayerFactor: ratio > 0 ? ratio ** (1 / Math.max(1, deltaNorms.length - 1)) : 0,
    verdict: last === 0 ? "no signal (output saturated)"
      : ratio < 1e-3 ? "vanishing"
        : ratio > 1e3 ? "exploding" : "healthy",
  };
}

// ─── CONVOLUTION ────────────────────────────────────────────────────────────

export function conv2d(img, kernel, { stride = 1, padding = 0, mode = "zeros" } = {}) {
  const H = img.length, W = img[0].length;
  const kh = kernel.length, kw = kernel[0].length;
  const get = (y, x) => {
    if (y >= 0 && y < H && x >= 0 && x < W) return img[y][x];
    if (mode === "replicate") return img[Math.min(H - 1, Math.max(0, y))][Math.min(W - 1, Math.max(0, x))];
    return 0;
  };
  const outH = Math.floor((H + 2 * padding - kh) / stride) + 1;
  const outW = Math.floor((W + 2 * padding - kw) / stride) + 1;
  const out = zeros2(outH, outW);
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      let s = 0;
      for (let ky = 0; ky < kh; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          s += kernel[ky][kx] * get(oy * stride - padding + ky, ox * stride - padding + kx);
        }
      }
      out[oy][ox] = s;
    }
  }
  return out;
}

// Returns the receptive-field patch and the term-by-term products for ONE output
// cell, so the simulator can show the multiply-and-sum actually happening.
export function convCellDetail(img, kernel, oy, ox, { stride = 1, padding = 0 } = {}) {
  const kh = kernel.length, kw = kernel[0].length;
  const H = img.length, W = img[0].length;
  const terms = [];
  let sum = 0;
  for (let ky = 0; ky < kh; ky++) {
    for (let kx = 0; kx < kw; kx++) {
      const y = oy * stride - padding + ky, x = ox * stride - padding + kx;
      const inside = y >= 0 && y < H && x >= 0 && x < W;
      const px = inside ? img[y][x] : 0;
      const prod = kernel[ky][kx] * px;
      sum += prod;
      terms.push({ ky, kx, y, x, px, k: kernel[ky][kx], prod, inside });
    }
  }
  return { terms, sum };
}

export function maxPool2d(img, size = 2, stride = size) {
  const H = img.length, W = img[0].length;
  const outH = Math.floor((H - size) / stride) + 1;
  const outW = Math.floor((W - size) / stride) + 1;
  const out = zeros2(outH, outW), argmax = zeros2(outH, outW);
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      let best = -Infinity, bi = null;
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const v = img[oy * stride + dy][ox * stride + dx];
          if (v > best) { best = v; bi = [oy * stride + dy, ox * stride + dx]; }
        }
      }
      out[oy][ox] = best; argmax[oy][ox] = bi;
    }
  }
  return { out, argmax };
}

export function avgPool2d(img, size = 2, stride = size) {
  const H = img.length, W = img[0].length;
  const outH = Math.floor((H - size) / stride) + 1;
  const outW = Math.floor((W - size) / stride) + 1;
  const out = zeros2(outH, outW);
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      let s = 0;
      for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) s += img[oy * stride + dy][ox * stride + dx];
      out[oy][ox] = s / (size * size);
    }
  }
  return out;
}

// The shape formula, plus the parameter count — the two things asked about CNNs.
export function convShape({ inSize, kernel, stride = 1, padding = 0, inCh = 1, outCh = 1, dilation = 1 }) {
  const effK = dilation * (kernel - 1) + 1;
  const out = Math.floor((inSize + 2 * padding - effK) / stride) + 1;
  return {
    out,
    valid: out > 0 && Number.isFinite(out),
    params: kernel * kernel * inCh * outCh + outCh,
    weights: kernel * kernel * inCh * outCh,
    biases: outCh,
    // A dense layer doing the same job, for the comparison that makes weight
    // sharing land: it is thousands of times larger.
    denseEquivalent: inSize * inSize * inCh * (out * out * outCh),
    receptiveField: effK,
    formula: `⌊(${inSize} + 2·${padding} − ${effK}) / ${stride}⌋ + 1 = ${out}`,
    samePadding: Math.ceil((effK - 1) / 2),
  };
}

export const KERNELS = {
  identity: { k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], label: "Identity", note: "Copies the input. Useful as a sanity check that the convolution is wired correctly." },
  edgeAll: { k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], label: "Edge detect", note: "Centre weight 8 against eight −1s: sums to 0, so flat regions output 0 and only changes survive." },
  sobelX: { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], label: "Sobel X", note: "Vertical-edge detector. Left column negative, right positive → responds to horizontal intensity change." },
  sobelY: { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], label: "Sobel Y", note: "The same operator rotated: responds to vertical intensity change." },
  blur: { k: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], label: "Box blur", note: "Plain average. Weights sum to 1, so overall brightness is preserved." },
  gaussian: { k: [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]], label: "Gaussian blur", note: "Weighted average favouring the centre. Smoother than a box blur and separable, so it is cheaper than it looks." },
  sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], label: "Sharpen", note: "Original plus its own edges. Equivalent to image + (image − blur)." },
  emboss: { k: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], label: "Emboss", note: "Directional derivative along one diagonal, giving a lit-from-a-corner look." },
  laplacian: { k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], label: "Laplacian", note: "Second derivative: zero-crossings mark edges. Very noise-sensitive, which is why Gaussian smoothing usually comes first." },
};

// ─── ATTENTION ──────────────────────────────────────────────────────────────
// Scaled dot-product attention with every intermediate exposed.

export function attention(Q, K, V, { scale = true, mask = null, temperature = 1 } = {}) {
  const dk = K[0].length;
  const scores = Q.map((q) => K.map((k) => dot(q, k)));
  const scaled = scores.map((row) => row.map((s) => (scale ? s / Math.sqrt(dk) : s) / temperature));
  const masked = scaled.map((row, i) => row.map((s, j) => (mask && mask(i, j) ? -Infinity : s)));
  const weights = masked.map((row) => {
    const m = Math.max(...row.filter((v) => isFinite(v)));
    const e = row.map((v) => (isFinite(v) ? Math.exp(v - m) : 0));
    const t = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / (t || 1));
  });
  const out = weights.map((wr) => V[0].map((_, d) => wr.reduce((s, w, j) => s + w * V[j][d], 0)));
  return { scores, scaled, weights, out, dk, sqrtDk: Math.sqrt(dk) };
}

export const causalMask = (i, j) => j > i;

// ─── RECURRENT CELLS ────────────────────────────────────────────────────────
// Returns the hidden state at EVERY timestep, which is the only way to see what
// "carrying information forward" actually means.

export function rnnRun(xs, { Wxh, Whh, bh, h0 = null, activation = "tanh" } = {}) {
  const act = ACTIVATIONS[activation];
  const hidden = Whh.length;
  let h = h0 || zeros(hidden);
  const states = [[...h]];
  const preacts = [];
  for (const x of xs) {
    const z = Array.from({ length: hidden }, (_, i) =>
      dot(Wxh[i], Array.isArray(x) ? x : [x]) + dot(Whh[i], h) + bh[i]);
    preacts.push(z);
    h = z.map(act.f);
    states.push([...h]);
  }
  return { states, preacts, final: h };
}

export function lstmRun(xs, P) {
  const H = P.bf.length;
  let h = zeros(H), c = zeros(H);
  const trace = [];
  const sig = ACTIVATIONS.sigmoid.f;
  for (const xRaw of xs) {
    const x = Array.isArray(xRaw) ? xRaw : [xRaw];
    const gate = (Wx, Wh, b, fn) =>
      Array.from({ length: H }, (_, i) => fn(dot(Wx[i], x) + dot(Wh[i], h) + b[i]));
    const f = gate(P.Wxf, P.Whf, P.bf, sig);
    const inp = gate(P.Wxi, P.Whi, P.bi, sig);
    const o = gate(P.Wxo, P.Who, P.bo, sig);
    const g = gate(P.Wxg, P.Whg, P.bg, Math.tanh);
    const cNew = c.map((cv, i) => f[i] * cv + inp[i] * g[i]);
    const hNew = cNew.map((cv, i) => o[i] * Math.tanh(cv));
    trace.push({ f, i: inp, o, g, c: [...cNew], h: [...hNew], forgotten: c.map((cv, i) => cv * (1 - f[i])) });
    c = cNew; h = hNew;
  }
  return { trace, h, c };
}

// The gradient of a length-T recurrence scales like (w·act')^T. This computes
// that product exactly, which turns "vanishing gradient" from a slogan into a
// number you can watch cross 1.0.
export function bpttMagnitude({ T = 30, w = 0.9, activation = "tanh" } = {}) {
  const act = ACTIVATIONS[activation];
  const perStep = [];
  let mag = 1;
  let h = 0.5;
  for (let t = 0; t < T; t++) {
    const z = w * h;
    const d = act.df(z);
    mag *= Math.abs(w) * d;
    h = act.f(z);
    perStep.push({ t: t + 1, magnitude: mag, localDeriv: d });
  }
  return {
    perStep,
    final: mag,
    // A 1000× weakened gradient is already unusable in practice: the early
    // timesteps get 1/1000th of the update the late ones do, so long-range
    // dependencies never get learned.
    verdict: mag < 1e-3 ? "vanished" : mag > 1e3 ? "exploded" : "usable",
    halfLife: perStep.findIndex((p) => p.magnitude < 0.5) + 1 || null,
    // How many steps back before the signal drops under 1e-3.
    usableRange: (() => { const i = perStep.findIndex((p) => p.magnitude < 1e-3); return i === -1 ? T : i + 1; })(),
  };
}

// ─── NORMALIZATION & DROPOUT ────────────────────────────────────────────────

export function batchNorm(batch, { gamma = 1, beta = 0, eps = 1e-5 } = {}) {
  const d = batch[0].length;
  const mu = Array.from({ length: d }, (_, j) => mean(batch.map((x) => x[j])));
  const varr = Array.from({ length: d }, (_, j) => mean(batch.map((x) => (x[j] - mu[j]) ** 2)));
  return {
    mu, var: varr,
    out: batch.map((x) => x.map((v, j) => gamma * ((v - mu[j]) / Math.sqrt(varr[j] + eps)) + beta)),
  };
}

export function layerNorm(x, { gamma = 1, beta = 0, eps = 1e-5 } = {}) {
  const mu = mean(x);
  const varr = mean(x.map((v) => (v - mu) ** 2));
  return { mu, var: varr, out: x.map((v) => gamma * ((v - mu) / Math.sqrt(varr + eps)) + beta) };
}

export function dropout(x, p, seed = 1, training = true) {
  if (!training || p <= 0) return { out: [...x], mask: x.map(() => 1), kept: x.length };
  const r = rng(seed);
  const mask = x.map(() => (r() >= p ? 1 : 0));
  // Inverted dropout: scale up at train time so inference needs no change.
  return { out: x.map((v, i) => (v * mask[i]) / (1 - p)), mask, kept: mask.reduce((a, b) => a + b, 0) };
}

// ─── SOFTMAX CROSS-ENTROPY (with the gradient that surprises people) ────────

export function softmaxCrossEntropy(logits, label) {
  const m = Math.max(...logits);
  const e = logits.map((l) => Math.exp(l - m));
  const s = e.reduce((a, b) => a + b, 0);
  const p = e.map((v) => v / s);
  return {
    probs: p,
    loss: -Math.log(Math.max(1e-12, p[label])),
    // dL/dlogits = p − onehot(y). One subtraction; no chain rule needed.
    grad: p.map((v, i) => v - (i === label ? 1 : 0)),
  };
}
