// Reinforcement learning core.
//
// Per the teaching spec, RL is a *process* concept — so these functions expose
// the agent's experience step by step (which action, what reward, how the value
// estimate moved) rather than only the converged answer.

import { rng, zeros, zeros2, mean } from "./mlmath.js";

// ─── GRIDWORLD ──────────────────────────────────────────────────────────────
// Layout uses plain characters so a lab can show the map as the map:
//   . = floor    # = wall    G = goal (+1)    T = trap (−1)    S = start

export const GRIDS = {
  simple: {
    label: "Open room",
    rows: ["....G", ".....", ".....", "S...."],
    note: "No obstacles. The shortest path is obvious to you — watch how many episodes it takes the agent to find it.",
  },
  trap: {
    label: "Trap beside the goal",
    rows: ["...TG", "..###", ".....", "S...."],
    note: "The trap sits next to the goal. Pure exploitation early on can lock the agent into avoiding the whole corner.",
  },
  maze: {
    label: "Corridor maze",
    rows: ["S.#....", "..#.##.", ".....#.", "###.#..", "......G"],
    note: "Long detour required. This is where the discount factor starts to matter — a distant reward has to survive being discounted back.",
  },
  cliff: {
    label: "Cliff walk",
    rows: [".....", ".....", "S TTTG"],
    note: "The fast route runs along the cliff edge. Compare what a greedy policy does versus a cautious one.",
  },
};

export const ACTIONS = [
  { name: "up", dr: -1, dc: 0, arrow: "↑" },
  { name: "right", dr: 0, dc: 1, arrow: "→" },
  { name: "down", dr: 1, dc: 0, arrow: "↓" },
  { name: "left", dr: 0, dc: -1, arrow: "←" },
];

// stepCost is worth exposing rather than hard-coding. It does two jobs:
//   1. A negative cost makes SHORTER paths preferred — without it, every route
//      that reaches the goal scores identically.
//   2. It silently drives exploration. Q starts at 0, so once an action has been
//      tried its value goes negative, and any untried action (still 0) now looks
//      better. That is "optimistic initialization", and it is why a greedy agent
//      with ε = 0 still explores. Set stepCost to 0 and greedy exploration
//      collapses — the agent repeats one action forever.
export function parseGrid(rows, { stepCost = -0.02 } = {}) {
  const H = rows.length, W = rows[0].length;
  const cells = [];
  let start = [H - 1, 0];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const ch = rows[r][c];
      if (ch === "S") start = [r, c];
      cells.push({ r, c, ch, wall: ch === "#", goal: ch === "G", trap: ch === "T" });
    }
  }
  return {
    H, W, cells, start, stepCost,
    at: (r, c) => cells[r * W + c],
    terminal: (r, c) => { const x = cells[r * W + c]; return x.goal || x.trap; },
    reward: (r, c) => { const x = cells[r * W + c]; return x.goal ? 1 : x.trap ? -1 : stepCost; },
  };
}

export function step(grid, r, c, action, { slip = 0, r0 = null } = {}) {
  let a = action;
  if (slip > 0 && r0 && r0() < slip) {
    // Stochastic environment: sometimes you go somewhere else. This is why the
    // agent must average over outcomes rather than memorize one trajectory.
    a = Math.floor(r0() * ACTIONS.length);
  }
  const { dr, dc } = ACTIONS[a];
  let nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= grid.H || nc < 0 || nc >= grid.W || grid.at(nr, nc).wall) { nr = r; nc = c; }
  return { r: nr, c: nc, reward: grid.reward(nr, nc), done: grid.terminal(nr, nc), actualAction: a, slipped: a !== action };
}

// ─── Q-LEARNING ─────────────────────────────────────────────────────────────
// Returns the Q table AND an episode log, so a lab can scrub through learning.
//
// A worked failure worth reproducing in the lab: decay epsilon too fast and the
// agent locks in a good-but-not-optimal action. On the open room over 2500
// episodes with epsilonDecay 0.999, state (0,2) ends with Q[down] = 0.800 —
// exactly its true value — while Q[right], whose true value is 0.93, stalls at
// 0.41. Right is only ever tried during exploration, and exploration faded
// before its estimate could climb past down's. The resulting policy is
// confidently wrong: it takes a 4-step route where 2 steps exist. Hold epsilon
// constant and both converge to 0.9300 and 0.8003 respectively.

export function qLearning(grid, {
  alpha = 0.15, gamma = 0.95, epsilon = 0.25, episodes = 300, maxSteps = 200,
  slip = 0, seed = 6, epsilonDecay = 1,
} = {}) {
  const r = rng(seed);
  const nS = grid.H * grid.W;
  const Q = zeros2(nS, 4);
  const log = [];
  const visits = zeros(nS);
  let eps = epsilon;

  for (let ep = 0; ep < episodes; ep++) {
    let [cr, cc] = grid.start;
    let total = 0, steps = 0;
    const path = [[cr, cc]];
    let tdSum = 0;

    while (steps < maxSteps) {
      const s = cr * grid.W + cc;
      visits[s]++;
      // ε-greedy: explore with probability ε, otherwise take the best known action
      const a = r() < eps ? Math.floor(r() * 4) : argmax(Q[s]);
      const res = step(grid, cr, cc, a, { slip, r0: r });
      const s2 = res.r * grid.W + res.c;
      const target = res.done ? res.reward : res.reward + gamma * Math.max(...Q[s2]);
      const td = target - Q[s][a];
      Q[s][a] += alpha * td;                      // the entire algorithm is this line
      tdSum += Math.abs(td);
      total += res.reward;
      cr = res.r; cc = res.c;
      path.push([cr, cc]);
      steps++;
      if (res.done) break;
    }

    log.push({ episode: ep + 1, reward: total, steps, epsilon: eps, path, meanTdError: tdSum / steps,
      reachedGoal: grid.terminal(cr, cc) && grid.at(cr, cc).goal });
    eps *= epsilonDecay;
  }

  return {
    Q, log, visits,
    policy: Q.map((row) => argmax(row)),
    values: Q.map((row) => Math.max(...row)),
    successRate: mean(log.slice(-50).map((l) => (l.reachedGoal ? 1 : 0))),
    // A state never visited has Q = 0 everywhere, so its "policy" is arbitrary —
    // worth surfacing rather than drawing a confident arrow.
    unvisited: visits.map((v, i) => ({ i, v })).filter(({ v }) => v === 0).map(({ i }) => i),
  };
}

const argmax = (arr) => {
  let bi = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[bi]) bi = i;
  return bi;
};

// ─── VALUE ITERATION (the model-based contrast) ──────────────────────────────
// Q-learning learns by trial and error with no map. Value iteration is handed
// the map and computes the answer directly. Comparing them is the lesson.

export function valueIteration(grid, { gamma = 0.95, iterations = 100, theta = 1e-6 } = {}) {
  const nS = grid.H * grid.W;
  let V = zeros(nS);
  const sweeps = [];

  for (let it = 0; it < iterations; it++) {
    const Vn = [...V];
    let delta = 0;
    for (let s = 0; s < nS; s++) {
      const r0 = Math.floor(s / grid.W), c0 = s % grid.W;
      if (grid.at(r0, c0).wall || grid.terminal(r0, c0)) { Vn[s] = grid.terminal(r0, c0) ? grid.reward(r0, c0) : 0; continue; }
      let best = -Infinity;
      for (let a = 0; a < 4; a++) {
        const res = step(grid, r0, c0, a);
        const q = res.reward + (res.done ? 0 : gamma * V[res.r * grid.W + res.c]);
        if (q > best) best = q;
      }
      Vn[s] = best;
      delta = Math.max(delta, Math.abs(best - V[s]));
    }
    V = Vn;
    sweeps.push({ iteration: it + 1, delta, V: [...V] });
    if (delta < theta) break;
  }

  const policy = V.map((_, s) => {
    const r0 = Math.floor(s / grid.W), c0 = s % grid.W;
    if (grid.at(r0, c0).wall || grid.terminal(r0, c0)) return null;
    let best = -Infinity, ba = 0;
    for (let a = 0; a < 4; a++) {
      const res = step(grid, r0, c0, a);
      const q = res.reward + (res.done ? 0 : gamma * V[res.r * grid.W + res.c]);
      if (q > best) { best = q; ba = a; }
    }
    return ba;
  });

  return { V, policy, sweeps, converged: sweeps.length < iterations, iterations: sweeps.length };
}

export function rolloutPolicy(grid, policy, { maxSteps = 200 } = {}) {
  let [r, c] = grid.start;
  const path = [[r, c]];
  let total = 0;
  for (let i = 0; i < maxSteps; i++) {
    const a = policy[r * grid.W + c];
    if (a == null) break;
    const res = step(grid, r, c, a);
    total += res.reward;
    r = res.r; c = res.c;
    path.push([r, c]);
    if (res.done) return { path, total, done: true, reachedGoal: grid.at(r, c).goal, steps: i + 1 };
  }
  return { path, total, done: false, reachedGoal: false, steps: maxSteps };
}

// ─── MULTI-ARMED BANDIT ─────────────────────────────────────────────────────
// The cleanest possible explore/exploit setup: several slot machines, unknown
// payout rates, limited pulls.

export const BANDIT_PRESETS = {
  clear: { label: "One clear winner", rates: [0.2, 0.3, 0.75, 0.25] },
  close: { label: "Two near-identical best arms", rates: [0.55, 0.58, 0.3, 0.2] },
  many: { label: "Ten arms, one good", rates: [0.1, 0.1, 0.12, 0.1, 0.65, 0.11, 0.09, 0.1, 0.13, 0.1] },
};

export function runBandit(rates, { strategy = "egreedy", epsilon = 0.1, c = 2, pulls = 500, seed = 12 } = {}) {
  const r = rng(seed);
  const k = rates.length;
  const counts = zeros(k), values = zeros(k);
  const alphaB = new Array(k).fill(1), betaB = new Array(k).fill(1);   // Thompson
  const best = Math.max(...rates);
  const log = [];
  let cumReward = 0, cumRegret = 0;

  for (let t = 1; t <= pulls; t++) {
    let arm;
    if (strategy === "egreedy") {
      arm = r() < epsilon ? Math.floor(r() * k) : argmax(values);
    } else if (strategy === "ucb") {
      // Untried arms first, then value + an uncertainty bonus that shrinks with
      // use. "Optimism in the face of uncertainty" as an actual formula.
      const untried = counts.findIndex((n) => n === 0);
      arm = untried >= 0 ? untried : argmax(values.map((v, i) => v + c * Math.sqrt(Math.log(t) / counts[i])));
    } else if (strategy === "thompson") {
      arm = argmax(Array.from({ length: k }, (_, i) => sampleBeta(alphaB[i], betaB[i], r)));
    } else {
      arm = argmax(values);   // pure greedy
    }

    const reward = r() < rates[arm] ? 1 : 0;
    counts[arm]++;
    values[arm] += (reward - values[arm]) / counts[arm];   // running mean
    if (reward === 1) alphaB[arm]++; else betaB[arm]++;
    cumReward += reward;
    cumRegret += best - rates[arm];
    log.push({ t, arm, reward, cumReward, cumRegret, estimate: values[arm] });
  }

  return {
    counts, values, log, cumReward, cumRegret,
    bestArm: rates.indexOf(best),
    chosenArm: argmax(values),
    foundBest: argmax(values) === rates.indexOf(best),
    pctOnBest: counts[rates.indexOf(best)] / pulls,
  };
}

// Beta sample via two gammas (Marsaglia–Tsang), needed for Thompson sampling.
function sampleBeta(a, b, r) {
  const ga = sampleGamma(a, r), gb = sampleGamma(b, r);
  return ga / (ga + gb);
}

function sampleGamma(shape, r) {
  if (shape < 1) return sampleGamma(shape + 1, r) * Math.pow(r() || 1e-12, 1 / shape);
  const d = shape - 1 / 3, cc = 1 / Math.sqrt(9 * d);
  for (let i = 0; i < 200; i++) {
    let x, v;
    do { x = gaussFrom(r); v = 1 + cc * x; } while (v <= 0);
    v = v * v * v;
    const u = r();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
  return d;
}

function gaussFrom(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ─── THE REWARD-SHAPING TRAP ────────────────────────────────────────────────
// A concrete demonstration that agents optimize what you MEASURE, not what you
// mean — the practical heart of RL and of RLHF.

export const REWARD_TRAPS = [
  { intent: "Finish the level fast", reward: "+1 per second survived",
    result: "The agent learns to stand still. Surviving is rewarded; finishing is not.", fix: "Reward progress toward the exit, and give a bonus for finishing." },
  { intent: "Clean the room", reward: "+1 per piece of litter collected",
    result: "The agent knocks over the bin to create more litter to collect.", fix: "Reward the END STATE (room is clean), not the action count." },
  { intent: "Be helpful in chat", reward: "+1 per thumbs-up from a human",
    result: "The model learns flattery and confident-sounding answers, because both get thumbs-up.", fix: "Score correctness separately from satisfaction, and penalize confident errors." },
  { intent: "Win the boat race", reward: "+points for hitting checkpoints",
    result: "The boat spins in a circle re-hitting one respawning checkpoint forever. This actually happened in OpenAI's CoastRunners.", fix: "Reward lap completion and final position, not intermediate pickups." },
];
