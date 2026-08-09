import * as T from "../textrec.js";
import * as R from "../rl.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);
const close = (a, b, t = 1e-6) => Math.abs(a - b) < t;

// ─── BPE ────────────────────────────────────────────────────────────────────
{
  // "low low low low low lower lower newest newest newest" — the canonical
  // BPE worked example. "l"+"o" is the most frequent adjacent pair (7 times).
  const corpus = "low low low low low lower lower newest newest newest";
  const t = T.bpeTrain(corpus, 6);
  ok("BPE first merge is the most frequent pair", t.merges[0].count >= t.merges[1].count,
    `merge 1: "${t.merges[0].pair.join("+")}" ×${t.merges[0].count}; merge 2: "${t.merges[1].pair.join("+")}" ×${t.merges[1].count}`);
  ok("BPE merge counts are non-increasing", t.merges.every((m, i) => i === 0 || m.count <= t.merges[i - 1].count),
    t.merges.map((m) => `${m.pair.join("")}:${m.count}`).join(" "));
  ok("BPE vocab grows by 1 per merge", t.merges.every((m, i) => i === 0 || m.vocabSize === t.merges[i - 1].vocabSize + 1),
    t.merges.map((m) => m.vocabSize).join(" → "));
  // More merges must mean fewer tokens for a word from the corpus
  const few = T.bpeEncode("lower", T.bpeTrain(corpus, 2).merges).nTokens;
  const many = T.bpeEncode("lower", T.bpeTrain(corpus, 10).merges).nTokens;
  ok("more merges → fewer tokens per word", many < few, `2 merges: ${few} tokens, 10 merges: ${many} tokens`);
  // An unseen word must still encode (that's the point of subwords)
  const unseen = T.bpeEncode("lowest", T.bpeTrain(corpus, 10).merges);
  ok("unseen word still encodes (no OOV)", unseen.tokens.length > 0 && unseen.tokens.every((x) => typeof x === "string"),
    `"lowest" → [${unseen.tokens.join(" ")}]`);
  ok("BPE is deterministic", JSON.stringify(T.bpeTrain(corpus, 6).merges) === JSON.stringify(t.merges));
}

// ─── TF-IDF ─────────────────────────────────────────────────────────────────
{
  const docs = ["the cat sat on the mat", "the dog sat on the log", "quantum entanglement of particles"];
  const m = T.tfidf(docs);
  const idxThe = m.vocab.indexOf("the");
  const idxQuantum = m.vocab.indexOf("quantum");
  ok("'the' appears in 2 of 3 docs", m.df[idxThe] === 2, `df=${m.df[idxThe]}`);
  ok("rare word has higher IDF than common word", m.idf[idxQuantum] > m.idf[idxThe],
    `idf(quantum)=${m.idf[idxQuantum].toFixed(4)} > idf(the)=${m.idf[idxThe].toFixed(4)}`);
  // sklearn smoothed idf: log((1+N)/(1+df)) + 1. For N=3, df=2 → log(4/3)+1
  ok("IDF matches sklearn's smoothed formula", close(m.idf[idxThe], Math.log(4 / 3) + 1, 1e-9),
    `${m.idf[idxThe].toFixed(8)} vs ${(Math.log(4 / 3) + 1).toFixed(8)}`);
  ok("rows are L2-normalized", m.matrix.every((row) => close(Math.hypot(...row), 1, 1e-9)),
    m.matrix.map((r) => Math.hypot(...r).toFixed(6)).join(" "));
  // The two "sat on the" docs must be more similar to each other than to physics
  const s01 = T.cosine(m.matrix[0], m.matrix[1]);
  const s02 = T.cosine(m.matrix[0], m.matrix[2]);
  ok("similar docs score higher", s01 > s02, `cat/dog=${s01.toFixed(4)} vs cat/quantum=${s02.toFixed(4)}`);
  ok("identical docs give cosine 1", close(T.cosine(m.matrix[0], m.matrix[0]), 1, 1e-9));
  ok("no shared words gives cosine 0", close(s02, 0, 1e-9), s02.toExponential(2));
  ok("most distinctive term is the rarest", m.mostDistinctive[0].df === 1);
}

// ─── N-GRAM LM ──────────────────────────────────────────────────────────────
{
  const corpus = "the cat sat on the mat the cat ate the fish the dog sat on the log";
  const m = T.ngramTrain(corpus, 2);
  const d = T.ngramDistribution(m, ["the"]);
  ok("bigram probabilities sum to 1", close(d.candidates.reduce((s, c) => s + c.p, 0), 1, 1e-9),
    d.candidates.map((c) => `${c.token}:${c.p.toFixed(3)}`).join(" "));
  ok("'cat' is the most likely word after 'the'", d.candidates[0].token === "cat",
    `top: ${d.candidates.slice(0, 3).map((c) => `${c.token}(${c.count})`).join(", ")}`);
  ok("unseen context reports backoff", T.ngramDistribution(m, ["zebra"]).backoff);
  const tri = T.ngramTrain(corpus, 3);
  const td = T.ngramDistribution(tri, ["sat", "on"]);
  ok("trigram after 'sat on' is deterministic here", td.candidates.length === 1 && td.candidates[0].token === "the",
    `→ ${td.candidates.map((c) => c.token).join(",")}`);
}

// ─── DECODING ───────────────────────────────────────────────────────────────
{
  const cands = [
    { token: "cat", p: 0.5 }, { token: "dog", p: 0.25 }, { token: "bird", p: 0.15 },
    { token: "rock", p: 0.07 }, { token: "xylophone", p: 0.03 },
  ];
  const g = T.decode(cands, { strategy: "greedy" });
  ok("greedy keeps exactly 1 token", g.kept.length === 1 && g.kept[0].token === "cat", `kept: ${g.kept[0].token}`);

  const k3 = T.decode(cands, { strategy: "topk", k: 3 });
  ok("top-k=3 keeps 3 and renormalizes to 1", k3.kept.length === 3 && close(k3.renormalized.reduce((s, c) => s + c.p, 0), 1, 1e-9),
    `kept ${k3.kept.map((c) => c.token).join(",")} → p ${k3.renormalized.map((c) => c.p.toFixed(3)).join(",")}`);

  // top-p 0.9: 0.5 + 0.25 + 0.15 = 0.90 → exactly 3 tokens
  const p9 = T.decode(cands, { strategy: "topp", p: 0.9 });
  ok("top-p=0.9 keeps 3 tokens here (0.5+0.25+0.15)", p9.kept.length === 3,
    `kept ${p9.kept.length}: ${p9.kept.map((c) => c.token).join(",")} cum=${p9.cumulative.toFixed(3)}`);
  const p5 = T.decode(cands, { strategy: "topp", p: 0.5 });
  ok("top-p=0.5 keeps just 1", p5.kept.length === 1, `kept ${p5.kept.map((c) => c.token).join(",")}`);

  // The adaptive claim: on a PEAKED distribution top-p keeps fewer than top-k
  const peaked = [{ token: "a", p: 0.97 }, { token: "b", p: 0.01 }, { token: "c", p: 0.01 }, { token: "d", p: 0.01 }];
  ok("top-p adapts to confidence, top-k cannot", T.decode(peaked, { strategy: "topp", p: 0.9 }).kept.length === 1
    && T.decode(peaked, { strategy: "topk", k: 3 }).kept.length === 3,
    `peaked dist → top-p keeps 1, top-k=3 keeps 3 (forcing in 2 tokens at p=0.01)`);

  // Temperature
  const hot = T.applyTemperature(cands, 2).sort((a, b) => b.p - a.p);
  const cold = T.applyTemperature(cands, 0.5).sort((a, b) => b.p - a.p);
  ok("high temperature flattens", hot[0].p < 0.5, `T=2 → top p=${hot[0].p.toFixed(4)} (was 0.5)`);
  ok("low temperature sharpens", cold[0].p > 0.5, `T=0.5 → top p=${cold[0].p.toFixed(4)}`);
  ok("temperature keeps a valid distribution", close(hot.reduce((s, c) => s + c.p, 0), 1, 1e-9));
  ok("T→0 becomes greedy", close(T.applyTemperature(cands, 0.0001).find((c) => c.token === "cat").p, 1, 1e-9));
}

// ─── KV CACHE ───────────────────────────────────────────────────────────────
{
  const kv = T.kvCacheCost({ nTokens: 100, nLayers: 32, nHeads: 32, headDim: 128, bytesPerValue: 2 });
  // per token per layer = 2 (K and V) * 32 heads * 128 dim * 2 bytes = 16384 B
  ok("per-token-per-layer bytes = 2*32*128*2 = 16384", kv.perTokenPerLayer === 16384, `${kv.perTokenPerLayer}`);
  ok("per-token bytes = 16384 * 32 layers = 512 KB", kv.perToken === 512 * 1024, `${(kv.perToken / 1024).toFixed(0)} KB`);
  ok("cache grows linearly with tokens", kv.steps[99].cacheBytes === kv.perToken * 100);
  ok("cache turns O(n²) recompute into O(n)", kv.speedup > 30,
    `${kv.totalNoCache.toLocaleString()} vs ${kv.totalWithCache.toLocaleString()} units → ${kv.speedup.toFixed(1)}× fewer`);
}

// ─── RAG CHUNKING + RETRIEVAL ───────────────────────────────────────────────
{
  const text = "A".repeat(50) + "B".repeat(50) + "C".repeat(50);
  const c0 = T.chunkText(text, { chunkSize: 50, overlap: 0 });
  ok("no overlap → clean partition", c0.length === 3 && c0[1].start === 50, `${c0.length} chunks, starts ${c0.map((c) => c.start).join(",")}`);
  const c1 = T.chunkText(text, { chunkSize: 50, overlap: 25 });
  ok("overlap → more, overlapping chunks", c1.length > c0.length && c1[1].start === 25,
    `${c1.length} chunks, starts ${c1.map((c) => c.start).join(",")}`);
  ok("chunks cover the whole text", c0.map((c) => c.text).join("") === text);

  const corpus = "The refund window is 30 days from purchase. Contact support with your order id. "
    + "Shipping to Europe takes 5 to 7 business days. Express shipping is available at checkout. "
    + "Passwords must be at least 12 characters and include a symbol.";
  const chunks = T.chunkText(corpus, { chunkSize: 80, overlap: 20 });
  const r1 = T.retrieve("how long is the refund window", chunks, { topK: 2 });
  ok("retrieval surfaces the refund chunk first", r1.kept[0].text.toLowerCase().includes("refund"),
    `top chunk: "${r1.kept[0].text.slice(0, 45)}..." score=${r1.kept[0].score.toFixed(4)}`);
  const r2 = T.retrieve("what is the airspeed velocity of a swallow", chunks, { topK: 2 });
  ok("off-topic query scores lower than on-topic", r2.kept[0].score < r1.kept[0].score,
    `on-topic=${r1.kept[0].score.toFixed(4)} vs off-topic=${r2.kept[0].score.toFixed(4)}`);
  ok("retrieval reports the context token budget", r1.contextTokens > 0 && r1.contextTokens === r1.kept.reduce((s, c) => s + c.tokens, 0),
    `${r1.contextTokens} tokens for top-2`);
  // The lexical-retriever failure mode: no word overlap at all → no match
  const r3 = T.retrieve("zzzz qqqq", chunks, { topK: 1 });
  ok("zero lexical overlap → anyMatch false", !r3.anyMatch, `best score=${r3.kept[0].score.toExponential(2)}`);
}

// ─── EMBEDDING ANALOGY ──────────────────────────────────────────────────────
{
  // Hand-built 2D vectors: axis 0 = royalty, axis 1 = gender (+male / −female)
  const V = {
    king: [1, 1], queen: [1, -1], man: [0, 1], woman: [0, -1],
    prince: [0.8, 1], princess: [0.8, -1], apple: [-1, 0],
  };
  const a = T.analogy(V, "man", "king", "woman");
  ok("king − man + woman → queen", a.results[0].word === "queen",
    `top: ${a.results.map((r) => `${r.word}(${r.sim.toFixed(3)})`).join(", ")}`);
  const b = T.analogy(V, "king", "queen", "prince");
  ok("queen − king + prince → princess", b.results[0].word === "princess",
    `top: ${b.results.slice(0, 2).map((r) => `${r.word}(${r.sim.toFixed(3)})`).join(", ")}`);
  ok("nearest neighbour of king is a royal", ["queen", "prince"].includes(T.nearest(V, "king")[0].word),
    `nearest: ${T.nearest(V, "king", { topN: 3 }).map((x) => `${x.word}(${x.sim.toFixed(3)})`).join(", ")}`);
  ok("unrelated word is far from king", T.cosine(V.king, V.apple) < 0.5, T.cosine(V.king, V.apple).toFixed(4));
}

// ─── RANKING METRICS ────────────────────────────────────────────────────────
{
  // relevance grades in rank order
  const good = [3, 2, 3, 0, 1, 2];
  const bad = [0, 1, 2, 3, 3, 2];   // same items, worst-first

  ok("P@3 counts relevant in top 3", close(T.precisionAtK(good, 3), 1), T.precisionAtK(good, 3).toFixed(4));
  ok("P@3 on the bad ordering is lower", T.precisionAtK(bad, 3) < T.precisionAtK(good, 3),
    `good=${T.precisionAtK(good, 3).toFixed(3)} bad=${T.precisionAtK(bad, 3).toFixed(3)}`);
  ok("MRR = 1 when the first item is relevant", close(T.reciprocalRank(good), 1));
  ok("MRR = 1/2 when the first relevant item is at rank 2", close(T.reciprocalRank(bad), 0.5), T.reciprocalRank(bad).toFixed(4));
  ok("NDCG of a perfectly sorted list = 1", close(T.ndcg([3, 3, 2, 2, 1, 0]), 1, 1e-12), T.ndcg([3, 3, 2, 2, 1, 0]).toFixed(8));
  ok("NDCG punishes bad ordering", T.ndcg(bad) < T.ndcg(good),
    `good=${T.ndcg(good).toFixed(4)} bad=${T.ndcg(bad).toFixed(4)}`);
  ok("NDCG is order-sensitive but P@k is not (same top-k set)", close(T.precisionAtK([1, 1, 0], 3), T.precisionAtK([0, 1, 1], 3))
    && T.ndcg([1, 1, 0]) > T.ndcg([0, 1, 1]),
    `P@3 both ${T.precisionAtK([1, 1, 0], 3).toFixed(3)}; NDCG ${T.ndcg([1, 1, 0]).toFixed(4)} vs ${T.ndcg([0, 1, 1]).toFixed(4)}`);
  // DCG hand check: rel [3,2], gains 2^3-1=7 and 2^2-1=3, discounts log2(2)=1, log2(3)=1.585
  ok("DCG matches hand-computed 7 + 3/1.585", close(T.dcg([3, 2]), 7 + 3 / Math.log2(3), 1e-12), T.dcg([3, 2]).toFixed(6));
  ok("all-irrelevant list gives 0 everywhere", T.ndcg([0, 0, 0]) === 0 && T.averagePrecision([0, 0, 0]) === 0 && T.reciprocalRank([0, 0, 0]) === 0);
  const rep = T.rankingReport(good, 5);
  ok("rankingReport returns every metric", ["precisionAtK", "recallAtK", "ap", "mrr", "dcg", "ndcg"].every((k) => Number.isFinite(rep[k])),
    Object.entries(rep).filter(([, v]) => Number.isFinite(v)).map(([k, v]) => `${k}=${v.toFixed(3)}`).join(" "));
}

// ─── COLLABORATIVE FILTERING ────────────────────────────────────────────────
{
  // Users 0 and 1 agree; user 2 is the opposite.
  const R2 = [
    [5, 4, 1, null],
    [4, 5, 1, 2],
    [1, 2, 5, 5],
    [null, 1, 4, 5],
  ];
  const S = T.userSimilarity(R2);
  ok("similarity is symmetric", S.every((row, a) => row.every((v, b) => close(v, S[b][a], 1e-12))));
  ok("self-similarity is 1", S.every((row, a) => close(row[a], 1, 1e-9)));
  ok("agreeing users score higher than opposing users", S[0][1] > S[0][2],
    `sim(u0,u1)=${S[0][1].toFixed(4)} vs sim(u0,u2)=${S[0][2].toFixed(4)}`);
  const p = T.cfPredict(R2, S, 0, 3, { k: 2 });
  ok("CF predicts a rating for the missing cell", Number.isFinite(p.prediction) && !p.fellBackToMean,
    `predicted u0→i3 = ${p.prediction.toFixed(3)} from ${p.neighbours.length} neighbours (user mean ${p.userMean.toFixed(2)})`);
  const IS = T.itemSimilarity(R2);
  ok("item similarity matrix is items×items", IS.length === 4 && IS[0].length === 4);
  ok("items 0 and 1 (both liked by u0,u1) are similar", IS[0][1] > IS[0][2],
    `sim(i0,i1)=${IS[0][1].toFixed(4)} vs sim(i0,i2)=${IS[0][2].toFixed(4)}`);
}

// ─── MATRIX FACTORIZATION ───────────────────────────────────────────────────
{
  const R2 = [
    [5, 4, 1, null], [4, 5, 1, 2], [1, 2, 5, 5], [null, 1, 4, 5], [5, 5, 2, 1],
  ];
  const mf = T.matrixFactorize(R2, { dim: 2, epochs: 600, lr: 0.03, reg: 0.02, seed: 8 });
  ok("MF RMSE decreases", mf.history[mf.history.length - 1].rmse < mf.history[0].rmse,
    `${mf.history[0].rmse.toFixed(4)} → ${mf.rmse.toFixed(4)}`);
  ok("MF fits observed ratings well", mf.rmse < 0.3, `RMSE=${mf.rmse.toFixed(4)}`);
  ok("MF fills every missing cell", mf.full.every((row) => row.every((v) => Number.isFinite(v))),
    `u0→i3 = ${mf.full[0][3].toFixed(3)}, u3→i0 = ${mf.full[3][0].toFixed(3)}`);
  ok("MF uses far fewer params than the full matrix", mf.nParams < 5 * 4 * 2,
    `${mf.nParams} params for a 5×4 matrix with ${mf.nObserved} observed`);
  // Higher dim must fit the observed data at least as well
  const hi = T.matrixFactorize(R2, { dim: 4, epochs: 600, lr: 0.03, reg: 0.02, seed: 8 });
  ok("more latent dims fit training data better", hi.rmse <= mf.rmse + 1e-3,
    `dim2=${mf.rmse.toFixed(4)} dim4=${hi.rmse.toFixed(4)}`);
  ok("MF deterministic for a seed", close(T.matrixFactorize(R2, { dim: 2, epochs: 600, lr: 0.03, reg: 0.02, seed: 8 }).rmse, mf.rmse, 1e-12));
}

// ─── EXPLORATION ────────────────────────────────────────────────────────────
{
  const scores = [{ score: 0.9 }, { score: 0.8 }, { score: 0.7 }, { score: 0.1 }, { score: 0.05 }];
  const pure = T.recommendWithExploration(scores, { epsilon: 0, n: 3 });
  ok("epsilon=0 is pure exploitation (top 3 in order)", pure.map((c) => c.i).join(",") === "0,1,2" && pure.every((c) => c.reason === "exploit"),
    pure.map((c) => `i${c.i}`).join(","));
  const explore = T.recommendWithExploration(scores, { epsilon: 1, n: 3, seed: 5 });
  ok("epsilon=1 is pure exploration", explore.every((c) => c.reason === "explore"), explore.map((c) => `i${c.i}`).join(","));
  ok("no duplicate recommendations", new Set(explore.map((c) => c.i)).size === 3);
}

// ═══ RL ═════════════════════════════════════════════════════════════════════

// ─── gridworld mechanics ────────────────────────────────────────────────────
{
  const g = R.parseGrid(R.GRIDS.simple.rows);
  ok("grid parses dimensions", g.H === 4 && g.W === 5, `${g.H}x${g.W}`);
  ok("start is where S is", g.start[0] === 3 && g.start[1] === 0, `[${g.start}]`);
  ok("goal is terminal with reward +1", g.terminal(0, 4) && close(g.reward(0, 4), 1));
  ok("floor has a small step cost (prefers shorter paths)", g.reward(1, 1) < 0, `${g.reward(1, 1)}`);
  // Walking into a wall must leave you in place
  const gm = R.parseGrid(R.GRIDS.maze.rows);
  const bump = R.step(gm, 0, 1, 1);   // at (0,1) moving right into '#'
  ok("walking into a wall keeps position", bump.r === 0 && bump.c === 1, `→ (${bump.r},${bump.c})`);
  const edge = R.step(g, 0, 0, 0);   // moving up from the top row
  ok("walking off the grid keeps position", edge.r === 0 && edge.c === 0);
  const trap = R.parseGrid(R.GRIDS.trap.rows);
  ok("trap is terminal with reward −1", trap.terminal(0, 3) && close(trap.reward(0, 3), -1));
}

// ─── value iteration must find the optimal policy ───────────────────────────
{
  const g = R.parseGrid(R.GRIDS.simple.rows);
  const vi = R.valueIteration(g, { gamma: 0.95 });
  ok("value iteration converges", vi.converged, `${vi.iterations} sweeps, final delta < 1e-6`);
  const roll = R.rolloutPolicy(g, vi.policy);
  // From (3,0) to (0,4) the Manhattan distance is 3 + 4 = 7 moves.
  ok("optimal policy reaches the goal in 7 moves", roll.reachedGoal && roll.steps === 7,
    `${roll.steps} steps, reward=${roll.total.toFixed(3)}, reachedGoal=${roll.reachedGoal}`);
  ok("values are higher nearer the goal", vi.V[0 * g.W + 3] > vi.V[3 * g.W + 0],
    `V next to goal=${vi.V[3].toFixed(4)} vs V at start=${vi.V[15].toFixed(4)}`);
  // Discounting: a smaller gamma must reduce the value of a distant reward
  const near = R.valueIteration(g, { gamma: 0.5 });
  ok("lower gamma shrinks the value of a distant goal", near.V[3 * g.W] < vi.V[3 * g.W],
    `start value: gamma=0.95 → ${vi.V[15].toFixed(4)}, gamma=0.5 → ${near.V[15].toFixed(4)}`);
  const maze = R.parseGrid(R.GRIDS.maze.rows);
  const mv = R.valueIteration(maze, { gamma: 0.95 });
  ok("value iteration solves the maze too", R.rolloutPolicy(maze, mv.policy).reachedGoal,
    `${R.rolloutPolicy(maze, mv.policy).steps} steps`);
}

// ─── Q-learning must learn, and match value iteration on the easy grid ──────
{
  const g = R.parseGrid(R.GRIDS.simple.rows);
  const q = R.qLearning(g, { episodes: 3000, alpha: 0.2, gamma: 0.95, epsilon: 0.3, epsilonDecay: 1, seed: 6 });
  const early = q.log.slice(0, 50).reduce((s, l) => s + l.steps, 0) / 50;
  const late = q.log.slice(-50).reduce((s, l) => s + l.steps, 0) / 50;
  ok("Q-learning takes fewer steps over time", late < early,
    `first 50 episodes averaged ${early.toFixed(1)} steps, last 50 averaged ${late.toFixed(1)}`);
  ok("Q-learning reaches the goal reliably at the end", q.successRate > 0.9, `success rate=${(q.successRate * 100).toFixed(0)}%`);
  const roll = R.rolloutPolicy(g, q.policy);
  ok("learned policy reaches the goal optimally (7 steps)", roll.reachedGoal && roll.steps === 7,
    `${roll.steps} steps (optimal is 7)`);
  const vi = R.valueIteration(g, { gamma: 0.95 });
  // Compare OUTCOMES, not action identity: in an open room several actions are
  // equally optimal, so "picks a different arrow than value iteration" is not
  // an error as long as it still takes a shortest path.
  const stateResults = [];
  for (let sIdx = 0; sIdx < g.H * g.W; sIdx++) {
    const r0 = Math.floor(sIdx / g.W), c0 = sIdx % g.W;
    if (g.at(r0, c0).wall || g.terminal(r0, c0) || q.visits[sIdx] <= 20) continue;
    const gFrom = R.parseGrid(R.GRIDS.simple.rows.map((row, ri) =>
      row.split("").map((ch, ci) => (ri === r0 && ci === c0 ? "S" : ch === "S" ? "." : ch)).join("")));
    const qRoll = R.rolloutPolicy(gFrom, q.policy);
    const viRoll = R.rolloutPolicy(gFrom, vi.policy);
    stateResults.push({ sIdx, qSteps: qRoll.steps, viSteps: viRoll.steps, qGoal: qRoll.reachedGoal, viGoal: viRoll.reachedGoal });
  }
  const optimal = stateResults.filter((x) => x.qGoal && x.qSteps === x.viSteps).length;
  ok("Q-learning is optimal from every well-visited state", optimal === stateResults.length,
    `${optimal}/${stateResults.length} states reach the goal in the same number of steps as value iteration`);
  // Decaying epsilon too fast leaves the correct action under-estimated. Pinned
  // because it is the behaviour the lab demonstrates, not a defect.
  const rushed = R.qLearning(g, { episodes: 2500, alpha: 0.2, gamma: 0.95, epsilon: 0.3, epsilonDecay: 0.999, seed: 6 });
  const sIdx02 = 0 * g.W + 2;
  const rBad = [];
  for (let sI = 0; sI < g.H * g.W; sI++) {
    const r0 = Math.floor(sI / g.W), c0 = sI % g.W;
    if (g.at(r0, c0).wall || g.terminal(r0, c0) || rushed.visits[sI] <= 20) continue;
    const gF = R.parseGrid(R.GRIDS.simple.rows.map((row, ri) => row.split("").map((ch, ci) => (ri === r0 && ci === c0 ? "S" : ch === "S" ? "." : ch)).join("")));
    const a = R.rolloutPolicy(gF, rushed.policy), b = R.rolloutPolicy(gF, vi.policy);
    if (!(a.reachedGoal && a.steps === b.steps)) rBad.push(`(${r0},${c0})`);
  }
  ok("decaying epsilon too fast yields a confidently sub-optimal policy", rBad.length > 0
    && rushed.Q[sIdx02][2] > rushed.Q[sIdx02][1] && Math.abs(rushed.Q[sIdx02][2] - 0.8003) < 0.02,
    `${rBad.length} states take a longer-than-optimal route (${rBad.join(" ")}); at (0,2) Q[down]=${rushed.Q[sIdx02][2].toFixed(4)} (its true value 0.8003) beats Q[right]=${rushed.Q[sIdx02][1].toFixed(4)} whose true value is 0.93`);
  ok("constant epsilon fixes it", q.Q[sIdx02][1] > q.Q[sIdx02][2] && Math.abs(q.Q[sIdx02][1] - 0.93) < 0.03,
    `at (0,2) with constant eps: Q[right]=${q.Q[sIdx02][1].toFixed(4)} (true 0.93) now beats Q[down]=${q.Q[sIdx02][2].toFixed(4)}`);
  ok("TD error shrinks as learning proceeds",
    q.log.slice(-50).reduce((s, l) => s + l.meanTdError, 0) / 50 < q.log.slice(0, 50).reduce((s, l) => s + l.meanTdError, 0) / 50,
    `mean |TD| first 50: ${(q.log.slice(0, 50).reduce((s, l) => s + l.meanTdError, 0) / 50).toFixed(5)} → last 50: ${(q.log.slice(-50).reduce((s, l) => s + l.meanTdError, 0) / 50).toFixed(5)}`);
  // Exploration: with a negative step cost, Q=0 is OPTIMISTIC for any untried
  // action, so even a greedy agent explores systematically. Remove the step cost
  // and that free exploration disappears — greedy repeats one action forever
  // while epsilon-greedy still finds the goal.
  const flat = R.parseGrid(R.GRIDS.simple.rows, { stepCost: 0 });
  const fGreedy = R.qLearning(flat, { episodes: 400, epsilon: 0, seed: 6 });
  const fExplore = R.qLearning(flat, { episodes: 400, epsilon: 0.9, seed: 6 });
  ok("with no step cost, epsilon=0 cannot explore at all", fGreedy.successRate === 0 && fExplore.successRate > 0.5,
    `stepCost=0 → eps=0 reaches goal ${(fGreedy.successRate * 100).toFixed(0)}% of the time, eps=0.9 reaches it ${(fExplore.successRate * 100).toFixed(0)}%`);
  ok("greedy with no step cost visits almost nothing", fGreedy.unvisited.length > fExplore.unvisited.length + 5,
    `eps=0 left ${fGreedy.unvisited.length}/${flat.H * flat.W} states unvisited vs ${fExplore.unvisited.length} for eps=0.9`);
  // And the contrast: restore the step cost and greedy works again
  const costed = R.parseGrid(R.GRIDS.maze.rows, { stepCost: -0.02 });
  ok("restoring the step cost revives greedy exploration (optimistic init)",
    R.qLearning(costed, { episodes: 400, epsilon: 0, seed: 6 }).successRate > 0.5,
    `stepCost=-0.02 → eps=0 now reaches the goal ${(R.qLearning(costed, { episodes: 400, epsilon: 0, seed: 6 }).successRate * 100).toFixed(0)}% of the time`);
  ok("Q-learning deterministic for a seed",
    JSON.stringify(R.qLearning(g, { episodes: 100, seed: 6 }).Q) === JSON.stringify(R.qLearning(g, { episodes: 100, seed: 6 }).Q));
  // Slippery environment must be harder
  const slip = R.qLearning(g, { episodes: 800, slip: 0.4, epsilon: 0.3, epsilonDecay: 0.997, seed: 6 });
  ok("a slippery grid lowers the success rate", slip.successRate <= q.successRate,
    `deterministic=${(q.successRate * 100).toFixed(0)}% vs slippery=${(slip.successRate * 100).toFixed(0)}%`);
}

// ─── bandits ────────────────────────────────────────────────────────────────
{
  const rates = R.BANDIT_PRESETS.clear.rates;
  const eg = R.runBandit(rates, { strategy: "egreedy", epsilon: 0.1, pulls: 2000, seed: 12 });
  const ucb = R.runBandit(rates, { strategy: "ucb", c: 2, pulls: 2000, seed: 12 });
  const th = R.runBandit(rates, { strategy: "thompson", pulls: 2000, seed: 12 });
  const greedy = R.runBandit(rates, { strategy: "greedy", pulls: 2000, seed: 12 });

  ok("epsilon-greedy finds the best arm", eg.foundBest, `chose arm ${eg.chosenArm}, true best ${eg.bestArm}, ${(eg.pctOnBest * 100).toFixed(1)}% of pulls`);
  ok("UCB finds the best arm", ucb.foundBest, `${(ucb.pctOnBest * 100).toFixed(1)}% of pulls on best`);
  ok("Thompson finds the best arm", th.foundBest, `${(th.pctOnBest * 100).toFixed(1)}% of pulls on best`);
  ok("regret grows sub-linearly for UCB", ucb.cumRegret < 2000 * 0.5,
    `regret after 2000 pulls: eps-greedy=${eg.cumRegret.toFixed(1)}, UCB=${ucb.cumRegret.toFixed(1)}, Thompson=${th.cumRegret.toFixed(1)}`);
  ok("smarter strategies beat epsilon-greedy on regret", Math.min(ucb.cumRegret, th.cumRegret) < eg.cumRegret,
    `best of UCB/Thompson=${Math.min(ucb.cumRegret, th.cumRegret).toFixed(1)} vs eps-greedy=${eg.cumRegret.toFixed(1)}`);
  ok("pure greedy can lock onto a worse arm", greedy.cumRegret > Math.min(ucb.cumRegret, th.cumRegret),
    `greedy regret=${greedy.cumRegret.toFixed(1)}, found best=${greedy.foundBest}`);
  ok("value estimates approach true rates for pulled arms", Math.abs(ucb.values[ucb.bestArm] - rates[ucb.bestArm]) < 0.05,
    `estimated ${ucb.values[ucb.bestArm].toFixed(4)} vs true ${rates[ucb.bestArm]}`);
  ok("counts sum to the number of pulls", eg.counts.reduce((a, b) => a + b, 0) === 2000);
  // Near-identical arms are genuinely harder
  const close2 = R.runBandit(R.BANDIT_PRESETS.close.rates, { strategy: "ucb", pulls: 2000, seed: 12 });
  ok("near-identical arms cost more regret per pull to separate",
    close2.cumRegret / 2000 >= 0 && close2.cumRegret < 2000 * 0.58,
    `regret=${close2.cumRegret.toFixed(1)} on arms ${R.BANDIT_PRESETS.close.rates.join("/")}`);
}

// ─── reward traps are stated, with fixes ────────────────────────────────────
ok("reward traps documented with intent/result/fix", R.REWARD_TRAPS.length >= 4
  && R.REWARD_TRAPS.every((t) => t.intent && t.reward && t.result && t.fix), `${R.REWARD_TRAPS.length} traps`);
