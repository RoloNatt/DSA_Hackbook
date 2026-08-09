// Text, ranking and recommender internals.

import { rng, gauss, zeros, zeros2, dot, norm, mean, softmax } from "./mlmath.js";

// ─── TOKENIZATION ───────────────────────────────────────────────────────────

export const words = (text) => text.toLowerCase().match(/[a-z']+/g) || [];

export const charTokens = (text) => text.split("");

// Byte-Pair Encoding, trained step by step so a lab can show each merge as it
// happens. This is how "tokenization" stops being a black box: it is just
// "repeatedly glue the most common adjacent pair."
export function bpeTrain(corpus, numMerges) {
  // Start from characters, with a word-boundary marker.
  let vocabWords = {};
  for (const w of words(corpus)) {
    const key = w.split("").join(" ") + " </w>";
    vocabWords[key] = (vocabWords[key] || 0) + 1;
  }
  const merges = [];
  const alphabet = new Set(corpus.toLowerCase().replace(/[^a-z']/g, "").split(""));
  let vocabSize = alphabet.size + 1;

  for (let step = 0; step < numMerges; step++) {
    // Count every adjacent pair, weighted by how often the word occurs.
    const pairs = {};
    for (const [w, freq] of Object.entries(vocabWords)) {
      const syms = w.split(" ");
      for (let i = 0; i < syms.length - 1; i++) {
        const p = `${syms[i]} ${syms[i + 1]}`;
        pairs[p] = (pairs[p] || 0) + freq;
      }
    }
    const entries = Object.entries(pairs);
    if (!entries.length) break;
    entries.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));   // deterministic ties
    const [bestPair, count] = entries[0];
    if (count < 2) break;

    const [l, r] = bestPair.split(" ");
    const merged = l + r;
    const next = {};
    for (const [w, freq] of Object.entries(vocabWords)) {
      next[w.split(` ${bestPair.split(" ").join(" ")} `).join(` ${merged} `)
        .replace(new RegExp(`(^|\\s)${escapeRe(l)} ${escapeRe(r)}(\\s|$)`, "g"), `$1${merged}$2`)] = freq;
    }
    // Simpler and safer: rebuild by scanning symbol lists.
    const rebuilt = {};
    for (const [w, freq] of Object.entries(vocabWords)) {
      const syms = w.split(" ");
      const out = [];
      let i = 0;
      while (i < syms.length) {
        if (i < syms.length - 1 && syms[i] === l && syms[i + 1] === r) { out.push(merged); i += 2; }
        else { out.push(syms[i]); i += 1; }
      }
      const key = out.join(" ");
      rebuilt[key] = (rebuilt[key] || 0) + freq;
    }
    vocabWords = rebuilt;
    vocabSize += 1;
    merges.push({ step: step + 1, pair: [l, r], merged, count, vocabSize,
      sample: Object.keys(rebuilt).slice(0, 4) });
  }
  return { merges, finalWords: vocabWords, alphabet: [...alphabet].sort(), vocabSize };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Apply learned merges to a new word — the encode step.
export function bpeEncode(word, merges) {
  let syms = word.toLowerCase().split("");
  syms.push("</w>");
  const applied = [];
  for (const m of merges) {
    const out = [];
    let i = 0, hit = false;
    while (i < syms.length) {
      if (i < syms.length - 1 && syms[i] === m.pair[0] && syms[i + 1] === m.pair[1]) { out.push(m.merged); i += 2; hit = true; }
      else { out.push(syms[i]); i += 1; }
    }
    syms = out;
    if (hit) applied.push({ ...m, result: [...syms] });
  }
  return { tokens: syms, applied, nTokens: syms.length };
}

// ─── BAG OF WORDS / TF-IDF ──────────────────────────────────────────────────

export function tfidf(docs) {
  const tokenized = docs.map(words);
  const vocab = [...new Set(tokenized.flat())].sort();
  const N = docs.length;

  const df = vocab.map((t) => tokenized.filter((d) => d.includes(t)).length);
  // Smoothed IDF, matching scikit-learn's default so the numbers are checkable.
  const idf = df.map((d) => Math.log((1 + N) / (1 + d)) + 1);

  const rows = tokenized.map((d) => {
    const counts = vocab.map((t) => d.filter((x) => x === t).length);
    const tf = counts.map((c) => c / Math.max(1, d.length));
    const raw = tf.map((v, j) => v * idf[j]);
    const nrm = norm(raw) || 1;
    return { counts, tf, tfidf: raw.map((v) => v / nrm), rawTfidf: raw };
  });

  return {
    vocab, df, idf, rows,
    matrix: rows.map((r) => r.tfidf),
    counts: rows.map((r) => r.counts),
    // Words appearing in every document get the lowest weight — the whole point.
    mostDistinctive: vocab.map((t, j) => ({ term: t, idf: idf[j], df: df[j] })).sort((a, b) => b.idf - a.idf),
  };
}

export const cosine = (a, b) => {
  const na = norm(a), nb = norm(b);
  return na === 0 || nb === 0 ? 0 : dot(a, b) / (na * nb);
};

export const euclidean = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

// ─── N-GRAM LANGUAGE MODEL ──────────────────────────────────────────────────
// The simplest possible "predict the next token" model. Its failures are the
// motivation for everything that came after.

export function ngramTrain(corpus, n = 2, { charLevel = false } = {}) {
  const toks = charLevel ? charTokens(corpus.toLowerCase()) : words(corpus);
  const table = new Map();
  for (let i = 0; i + n - 1 < toks.length; i++) {
    const ctx = toks.slice(i, i + n - 1).join(" ");
    const next = toks[i + n - 1];
    if (!table.has(ctx)) table.set(ctx, new Map());
    const m = table.get(ctx);
    m.set(next, (m.get(next) || 0) + 1);
  }
  return { table, n, tokens: toks, vocab: [...new Set(toks)].sort(), charLevel };
}

export function ngramDistribution(model, context) {
  const ctx = Array.isArray(context) ? context.slice(-(model.n - 1)).join(" ") : context;
  const m = model.table.get(ctx);
  if (!m) return { context: ctx, candidates: [], backoff: true };
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  const candidates = [...m.entries()]
    .map(([tok, c]) => ({ token: tok, count: c, p: c / total }))
    .sort((a, b) => b.p - a.p || (a.token < b.token ? -1 : 1));
  return { context: ctx, candidates, total, backoff: false };
}

// ─── DECODING STRATEGIES ────────────────────────────────────────────────────
// Given ONE next-token distribution, show exactly which candidates survive each
// strategy. This is the clearest way to see what temperature/top-k/top-p do.

export function applyTemperature(candidates, temperature) {
  if (temperature <= 0.001) {
    const best = candidates.reduce((a, c) => (c.p > a.p ? c : a));
    return candidates.map((c) => ({ ...c, p: c === best ? 1 : 0 }));
  }
  const logits = candidates.map((c) => Math.log(Math.max(1e-12, c.p)));
  const p = softmax(logits, temperature);
  return candidates.map((c, i) => ({ ...c, p: p[i] }));
}

export function decode(candidates, { strategy = "greedy", temperature = 1, k = 5, p: topP = 0.9 } = {}) {
  const sorted = [...candidates].sort((a, b) => b.p - a.p);

  if (strategy === "greedy") {
    return { kept: sorted.slice(0, 1), dropped: sorted.slice(1), renormalized: [{ ...sorted[0], p: 1 }],
      note: "Always the single highest-probability token. Deterministic, and the reason greedy output loops: nothing can ever break a repetition." };
  }

  const scaled = applyTemperature(sorted, temperature).sort((a, b) => b.p - a.p);

  if (strategy === "temperature") {
    return { kept: scaled, dropped: [], renormalized: scaled,
      note: `Every token stays eligible; temperature ${temperature} reshapes how peaked the distribution is. Even a terrible token keeps a small chance — which is where derailment comes from.` };
  }

  if (strategy === "topk") {
    const kept = scaled.slice(0, k), dropped = scaled.slice(k);
    const t = kept.reduce((s, c) => s + c.p, 0);
    return { kept, dropped, renormalized: kept.map((c) => ({ ...c, p: c.p / t })),
      note: `Keeps a FIXED count (${k}) regardless of shape. When the model is certain, k=${k} forces in ${k - 1} bad options; when it is uncertain, it cuts off good ones.` };
  }

  // top-p / nucleus: smallest set whose cumulative probability reaches topP
  let cum = 0;
  const kept = [];
  for (const c of scaled) { kept.push(c); cum += c.p; if (cum >= topP) break; }
  const dropped = scaled.slice(kept.length);
  const t = kept.reduce((s, c) => s + c.p, 0);
  return {
    kept, dropped, cumulative: cum,
    renormalized: kept.map((c) => ({ ...c, p: c.p / t })),
    note: `Keeps a VARIABLE count — however many tokens it takes to reach ${topP} cumulative probability. Here that is ${kept.length}. This adapts to the model's confidence, which is why it is the usual default.`,
  };
}

export function sampleFrom(candidates, r) {
  const u = r();
  let cum = 0;
  for (const c of candidates) { cum += c.p; if (u <= cum) return c; }
  return candidates[candidates.length - 1];
}

// ─── KV CACHE COST ──────────────────────────────────────────────────────────
// Why generation gets slower and memory-hungry as context grows.

export function kvCacheCost({ nTokens, nLayers = 32, nHeads = 32, headDim = 128, bytesPerValue = 2, batch = 1 }) {
  const perTokenPerLayer = 2 * nHeads * headDim * bytesPerValue;   // K and V
  const perToken = perTokenPerLayer * nLayers;
  const steps = [];
  for (let t = 1; t <= nTokens; t++) {
    steps.push({
      token: t,
      cacheBytes: perToken * t * batch,
      // Without a cache, step t must recompute attention over all t tokens.
      flopsNoCache: t * t,
      flopsWithCache: t,
    });
  }
  const totalNoCache = steps.reduce((s, x) => s + x.flopsNoCache, 0);
  const totalWithCache = steps.reduce((s, x) => s + x.flopsWithCache, 0);
  return {
    steps, perToken, perTokenPerLayer,
    totalBytes: perToken * nTokens * batch,
    speedup: totalNoCache / totalWithCache,
    totalNoCache, totalWithCache,
  };
}

// ─── RAG: CHUNKING + RETRIEVAL ──────────────────────────────────────────────
// Uses TF-IDF cosine as the retriever. Not a neural embedding, but the failure
// modes a lab needs to show — a chunk too small to contain the answer, an answer
// split across a boundary, a context window overflowing — are identical.

export function chunkText(text, { chunkSize = 120, overlap = 20 } = {}) {
  const chunks = [];
  const step = Math.max(1, chunkSize - overlap);
  for (let start = 0; start < text.length; start += step) {
    const body = text.slice(start, start + chunkSize);
    if (!body.trim()) break;
    chunks.push({ id: chunks.length, start, end: start + body.length, text: body, tokens: Math.ceil(body.length / 4) });
    if (start + chunkSize >= text.length) break;
  }
  return chunks;
}

export function retrieve(query, chunks, { topK = 3 } = {}) {
  const model = tfidf([query, ...chunks.map((c) => c.text)]);
  const q = model.matrix[0];
  const scored = chunks.map((c, i) => ({ ...c, score: cosine(q, model.matrix[i + 1]) }))
    .sort((a, b) => b.score - a.score);
  const kept = scored.slice(0, topK);
  return {
    ranked: scored, kept,
    contextTokens: kept.reduce((s, c) => s + c.tokens, 0),
    vocab: model.vocab,
    // Did the retriever surface anything at all? Zero cosine everywhere means
    // no lexical overlap — the classic keyword-retriever failure.
    anyMatch: scored.some((c) => c.score > 0.001),
  };
}

// ─── WORD EMBEDDINGS (analogy arithmetic) ───────────────────────────────────

export function analogy(vectors, a, b, c, { topN = 3 } = {}) {
  // a is to b as c is to ?   →   target = b − a + c
  const target = vectors[b].map((v, i) => v - vectors[a][i] + vectors[c][i]);
  const scored = Object.entries(vectors)
    .filter(([w]) => w !== a && w !== b && w !== c)
    .map(([w, v]) => ({ word: w, sim: cosine(target, v) }))
    .sort((x, y) => y.sim - x.sim);
  return { target, results: scored.slice(0, topN), all: scored };
}

export function nearest(vectors, word, { topN = 5 } = {}) {
  return Object.entries(vectors)
    .filter(([w]) => w !== word)
    .map(([w, v]) => ({ word: w, sim: cosine(vectors[word], v) }))
    .sort((a, b) => b.sim - a.sim).slice(0, topN);
}

// ─── RANKING METRICS ────────────────────────────────────────────────────────
// Every one of these is computed from the SAME ranked list, so reordering one
// item shows which metrics care about position and which do not.

export function precisionAtK(relevance, k) {
  const top = relevance.slice(0, k);
  return top.filter((r) => r > 0).length / k;
}

export function recallAtK(relevance, k) {
  const total = relevance.filter((r) => r > 0).length;
  return total === 0 ? 0 : relevance.slice(0, k).filter((r) => r > 0).length / total;
}

export function averagePrecision(relevance) {
  let hits = 0, sum = 0;
  relevance.forEach((r, i) => { if (r > 0) { hits++; sum += hits / (i + 1); } });
  const total = relevance.filter((r) => r > 0).length;
  return total === 0 ? 0 : sum / total;
}

export function reciprocalRank(relevance) {
  const i = relevance.findIndex((r) => r > 0);
  return i === -1 ? 0 : 1 / (i + 1);
}

export function dcg(relevance, k = relevance.length) {
  return relevance.slice(0, k).reduce((s, r, i) => s + (2 ** r - 1) / Math.log2(i + 2), 0);
}

export function ndcg(relevance, k = relevance.length) {
  const ideal = [...relevance].sort((a, b) => b - a);
  const idcg = dcg(ideal, k);
  return idcg === 0 ? 0 : dcg(relevance, k) / idcg;
}

export function rankingReport(relevance, k = 5) {
  return {
    precisionAtK: precisionAtK(relevance, k),
    recallAtK: recallAtK(relevance, k),
    ap: averagePrecision(relevance),
    mrr: reciprocalRank(relevance),
    dcg: dcg(relevance, k),
    ndcg: ndcg(relevance, k),
    idealDcg: dcg([...relevance].sort((a, b) => b - a), k),
    k,
  };
}

// ─── COLLABORATIVE FILTERING ────────────────────────────────────────────────
// R is a users × items matrix with null for "not rated".

export function userSimilarity(R) {
  const n = R.length;
  const S = zeros2(n, n);
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      // Compare only on items BOTH users rated — otherwise missing data looks
      // like agreement at zero.
      const common = R[a].map((v, j) => (v != null && R[b][j] != null ? j : -1)).filter((j) => j >= 0);
      if (common.length === 0) { S[a][b] = 0; continue; }
      const va = common.map((j) => R[a][j]), vb = common.map((j) => R[b][j]);
      const ma = mean(va), mb = mean(vb);
      const ca = va.map((v) => v - ma), cb = vb.map((v) => v - mb);
      const d = norm(ca) * norm(cb);
      S[a][b] = d === 0 ? 0 : dot(ca, cb) / d;   // Pearson on co-rated items
    }
  }
  return S;
}

export function itemSimilarity(R) {
  const T = R[0].map((_, j) => R.map((row) => row[j]));
  return userSimilarity(T);
}

export function cfPredict(R, S, user, item, { k = 2 } = {}) {
  const userMean = mean(R[user].filter((v) => v != null));
  const neighbours = R.map((row, u) => ({ u, sim: S[user][u], rating: row[item] }))
    .filter((n) => n.u !== user && n.rating != null && n.sim > 0)
    .sort((a, b) => b.sim - a.sim).slice(0, k);
  if (!neighbours.length) return { prediction: userMean, neighbours: [], fellBackToMean: true, userMean };
  let num = 0, den = 0;
  for (const n of neighbours) {
    const nMean = mean(R[n.u].filter((v) => v != null));
    num += n.sim * (n.rating - nMean);
    den += Math.abs(n.sim);
  }
  return { prediction: userMean + num / den, neighbours, fellBackToMean: false, userMean };
}

// ─── MATRIX FACTORIZATION (SGD) ─────────────────────────────────────────────

export function matrixFactorize(R, { dim = 2, lr = 0.02, epochs = 400, reg = 0.05, seed = 8 } = {}) {
  const r = rng(seed);
  const nU = R.length, nI = R[0].length;
  const P = Array.from({ length: nU }, () => Array.from({ length: dim }, () => gauss(r) * 0.1));
  const Q = Array.from({ length: nI }, () => Array.from({ length: dim }, () => gauss(r) * 0.1));
  const observed = [];
  for (let u = 0; u < nU; u++) for (let i = 0; i < nI; i++) if (R[u][i] != null) observed.push([u, i, R[u][i]]);
  const globalMean = mean(observed.map((o) => o[2]));
  const bu = zeros(nU), bi = zeros(nI);
  const history = [];

  for (let e = 0; e <= epochs; e++) {
    if (e % Math.max(1, Math.floor(epochs / 40)) === 0) {
      const se = observed.reduce((s, [u, i, v]) => s + (v - (globalMean + bu[u] + bi[i] + dot(P[u], Q[i]))) ** 2, 0);
      history.push({ epoch: e, rmse: Math.sqrt(se / observed.length) });
    }
    for (const [u, i, v] of observed) {
      const pred = globalMean + bu[u] + bi[i] + dot(P[u], Q[i]);
      const err = v - pred;
      bu[u] += lr * (err - reg * bu[u]);
      bi[i] += lr * (err - reg * bi[i]);
      for (let d = 0; d < dim; d++) {
        const pu = P[u][d], qi = Q[i][d];
        P[u][d] += lr * (err * qi - reg * pu);
        Q[i][d] += lr * (err * pu - reg * qi);
      }
    }
  }

  const predict = (u, i) => globalMean + bu[u] + bi[i] + dot(P[u], Q[i]);
  return {
    P, Q, bu, bi, globalMean, history, predict,
    full: Array.from({ length: nU }, (_, u) => Array.from({ length: nI }, (_, i) => predict(u, i))),
    nParams: nU * dim + nI * dim + nU + nI,
    nObserved: observed.length,
    rmse: history[history.length - 1].rmse,
  };
}

// ─── POPULARITY BIAS / EXPLORATION ──────────────────────────────────────────

export function recommendWithExploration(scores, { epsilon = 0, seed = 2, n = 3 } = {}) {
  const r = rng(seed);
  const pool = scores.map((s, i) => ({ i, ...s }));
  const chosen = [];
  const remaining = [...pool];
  for (let slot = 0; slot < n && remaining.length; slot++) {
    if (r() < epsilon) {
      const pick = Math.floor(r() * remaining.length);
      chosen.push({ ...remaining[pick], reason: "explore" });
      remaining.splice(pick, 1);
    } else {
      remaining.sort((a, b) => b.score - a.score);
      chosen.push({ ...remaining[0], reason: "exploit" });
      remaining.shift();
    }
  }
  return chosen;
}
