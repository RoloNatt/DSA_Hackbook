// The single source of truth for navigation: which tracks exist, which sections
// live inside each one, what order to read them in, and why each step is there.
//
// Adding a section = adding one entry here plus its render block. Nothing else
// needs to know about ordering.

export const TRACKS = [
  { id: "start", label: "Start Here", icon: "🏁", accent: "#5C6BC0",
    tagline: "What this is and the order to work through it" },
  { id: "dsa", label: "DSA", icon: "🧩", accent: "#1A73E8",
    tagline: "Recognize the pattern, understand it, cost it, write it" },
  { id: "ml", label: "AI/ML", icon: "🤖", accent: "#7C4DFF",
    tagline: "The domain round — fundamentals, algorithms, deep learning" },
  { id: "labs", label: "Interactive Labs", icon: "🔬", accent: "#E91E8C",
    tagline: "Run the models yourself — turn the knobs, watch everything move" },
  { id: "sd", label: "System Design", icon: "🏗️", accent: "#00897B",
    tagline: "Turn a vague problem into a defensible architecture" },
  { id: "loop", label: "Interview Loop", icon: "🎯", accent: "#E8710A",
    tagline: "Round formats, scoring, and the week-long schedule" },
];

// ─── DSA ────────────────────────────────────────────────────────────────────

export const DSA_STAGES = [
  {
    stage: "Recognize",
    hint: "Given a problem, name the pattern",
    items: [
      { id: "identify", label: "🔍 Identify",
        why: "Signal phrases in the problem statement, each mapped to the pattern it implies. This is the skill that unblocks everything else — you cannot apply an algorithm you did not think of." },
      { id: "decision", label: "🌳 Decision Tree",
        why: "When the signal phrases are ambiguous, answer questions about the problem's shape and get funnelled to one pattern. Use this while practising, until the routing is automatic." },
    ],
  },
  {
    stage: "Understand",
    hint: "Know how each one actually works",
    items: [
      { id: "learn", label: "📖 Learn",
        why: "One deep card per pattern: analogy, mechanics step by step, when to use it, when not to, and the specific traps interviewers watch for." },
      { id: "compare", label: "📊 Compare",
        why: "All patterns in one table so you can see the trade-offs side by side. Read this after Learn — it is a consolidation pass, not an introduction." },
    ],
  },
  {
    stage: "Cost it",
    hint: "Predict complexity before coding",
    items: [
      { id: "bigo", label: "⚖️ Big-O & Constraints",
        why: "Read the intended solution off the input constraints, and know what each Python built-in really costs. Do this before you write code, out loud." },
    ],
  },
  {
    stage: "Write it",
    hint: "Type it from memory",
    items: [
      { id: "code", label: "🐍 Python Code",
        why: "Reference implementations for every pattern. The goal is not to read them — it is to reproduce them in a blank editor with no autocomplete." },
    ],
  },
];

// ─── AI/ML ──────────────────────────────────────────────────────────────────

export const ML_STAGES = [
  {
    stage: "Orient",
    hint: "Know the target before studying",
    items: [
      { id: "playbook", label: "📋 Round Playbook",
        why: "How the round is run, how answers are scored, and the shape of a strong answer. Read this first — it changes how you study everything after it." },
      { id: "core", label: "🎯 The Core 10",
        why: "The ten topics that are near-guaranteed to come up, each with the answer you should be able to give unprompted. Treat this as the syllabus." },
      { id: "plan", label: "🗓️ Study Plan",
        why: "Day-by-day allocation across the sections below, plus a compressed version if you have less time. Skim it now, then follow it." },
    ],
  },
  {
    stage: "Fundamentals",
    hint: "The theory everything rests on",
    items: [
      { id: "foundations", label: "🧱 Foundations",
        why: "Vocabulary, the maths you are expected to hold, gradient descent, losses, splits, regularization, optimizers, normalization, features. The base layer." },
      { id: "biasvar", label: "🎯 Bias–Variance Lab",
        why: "Overfitting and underfitting, made visual — fit polynomials of rising degree and watch train error fall while test error turns back up. The single most-asked concept." },
      { id: "metrics", label: "📊 Metrics Lab",
        why: "Accuracy, precision, recall, F1, ROC-AUC, PR-AUC — and which one to argue for given the business problem. Drag the threshold and watch the confusion matrix move." },
    ],
  },
  {
    stage: "Algorithms",
    hint: "The named methods, and why each",
    items: [
      { id: "zoo", label: "🗂️ Algorithm Zoo",
        why: "Linear and logistic regression, trees, ensembles, SVMs, clustering, dimensionality reduction — each with assumptions, cost, and the reason to pick it over the neighbour." },
      { id: "deep", label: "🧠 Deep Learning",
        why: "Neurons, activations, backprop, CNNs, RNNs and LSTMs, transformers and attention, generative families. Build on Foundations — this assumes gradient descent is solid." },
    ],
  },
  {
    stage: "Specialize",
    hint: "Pick one and go deep",
    items: [
      { id: "spec", label: "🚀 Specializations",
        why: "The optional depth tracks. Choose one, learn it properly, and be able to defend the trade-offs — breadth here is worth less than one genuinely deep area." },
    ],
  },
  {
    stage: "Practice",
    hint: "Now produce answers under pressure",
    items: [
      { id: "code", label: "💻 ML Coding",
        why: "The implement-it-from-scratch asks: softmax, a training loop, metrics by hand, a small attention block. Write them, do not read them." },
      { id: "bank", label: "❓ Question Bank",
        why: "Filterable questions with model answers and the follow-up you will get if you answer well. Do this last — it is the exam, not the lesson." },
    ],
  },
];

// ─── SYSTEM DESIGN ──────────────────────────────────────────────────────────

export const SD_STAGES = [
  {
    stage: "Method",
    hint: "How to run the 45 minutes",
    items: [
      { id: "framework", label: "📐 The Framework",
        why: "The seven phases, with timings and what to produce in each. Read first — in this round the process is a large part of the score, not just the answer." },
    ],
  },
  {
    stage: "Toolkit",
    hint: "The pieces you design with",
    items: [
      { id: "estimate", label: "🔢 Estimation",
        why: "Sizing from first principles, and — more importantly — which design decision each number forces. An unused calculation is wasted minutes." },
      { id: "blocks", label: "🧱 Building Blocks",
        why: "Load balancers, caches, queues, CDNs, gateways, search, object stores. Each framed by the requirement that justifies it, and what it costs you." },
      { id: "data", label: "🗄️ Data & Distributed",
        why: "Storage choice, indexing, sharding, replication, CAP/PACELC, then idempotency, exactly-once, consensus, sagas, rate limiting, backpressure." },
    ],
  },
  {
    stage: "AI systems",
    hint: "What makes these designs different",
    items: [
      { id: "ai", label: "🤖 Production AI",
        why: "The layered architecture of a real agent system, and the six decisions you will be pushed hardest on. Read after Toolkit — it builds on queues and caches." },
      { id: "integrate", label: "🔌 Integrations",
        why: "Designing against systems you do not control: API styles, push vs pull, change capture, enterprise auth, defensive integration, legacy reality." },
      { id: "reliability", label: "🛡️ Reliability & Ops",
        why: "SLIs, SLOs and error budgets, observability, the failure modes worth naming, graceful degradation, deploy strategy, incident response." },
    ],
  },
  {
    stage: "Rehearse",
    hint: "Full designs end to end",
    items: [
      { id: "cases", label: "📋 Case Studies",
        why: "Worked designs following the same seven sections. Attempt each one on paper first, then read — reading them cold teaches recognition, not design." },
    ],
  },
  {
    stage: "The conversation",
    hint: "The half that is not architecture",
    items: [
      { id: "discovery", label: "🎯 Scoping & Discovery",
        why: "Turning a vague, real-world ask into a scoped problem: the questions to ask, in what order, and worked answers to open-ended prompts." },
      { id: "behavioural", label: "💬 Behavioural",
        why: "STAR structure, prepared stories per theme, what each question is really testing, and the questions worth asking back." },
    ],
  },
];

// ─── INTERVIEW LOOP ─────────────────────────────────────────────────────────

export const LOOP_STAGES = [
  {
    stage: "The target",
    hint: "What is actually asked",
    items: [
      { id: "google", label: "🎯 Google Prep",
        why: "Loop structure, topic frequencies, the evaluation axes, the 45-minute protocol, and the most-reported problems tagged by pattern." },
    ],
  },
  {
    stage: "The schedule",
    hint: "Turn it into daily work",
    items: [
      { id: "plan", label: "🗓️ 7-Day Plan",
        why: "A day-by-day week with specific problems and evening recall. Tick items off as you go — progress is saved in this browser." },
    ],
  },
];

// ─── INTERACTIVE LABS ──────────────────────────────────────────────
// Grouped by domain in labDomains.js — each field gets its own ordered path.

export { LAB_DOMAINS, LABS_STAGES, LAB_DOMAIN_OF, ALL_LAB_IDS } from "./labDomains.js";
import { LABS_STAGES as _LABS } from "./labDomains.js";

export const STAGES_BY_TRACK = {
  dsa: DSA_STAGES,
  ml: ML_STAGES,
  labs: _LABS,
  sd: SD_STAGES,
  loop: LOOP_STAGES,
};

// ─── START HERE ─────────────────────────────────────────────────────────────

export const START = {
  headline: "Four tracks, each with a reading order",
  blurb:
    "Everything here is grouped into tracks. Pick the track that matches the round you are preparing for, then work its numbered path from step 1. " +
    "Each track shows its stages up front, so you always know what you are reading, why, and what comes next.",

  order: [
    { t: "If your next round is a coding round", d: "DSA track, all four stages, then Interview Loop for the format and the week plan." },
    { t: "If your next round is a domain round", d: "AI/ML track. Orient first (three short sections), then Fundamentals — do not start at the Question Bank." },
    { t: "If your next round is open-ended design", d: "System Design track. Method, then Toolkit, then the AI systems stage, then attempt the case studies before reading them." },
    { t: "If you have one week and multiple rounds", d: "Interview Loop → 7-Day Plan. It sequences the other tracks for you day by day." },
  ],

  how: [
    { icon: "🔢", t: "The numbers are the order",
      d: "Every section in a track is numbered. Stage labels group them into phases — Recognize before Understand, Fundamentals before Algorithms, Method before Rehearse. Numbers are a recommendation, not a lock: jump anywhere." },
    { icon: "➡️", t: "Next-up buttons at the bottom",
      d: "Reach the end of a section and the next step is offered with a one-line reason. You can work a whole track without touching the nav." },
    { icon: "🗣️", t: "Say answers out loud",
      d: "Every round here is scored on explanation, not just the final answer. Reading silently produces recognition; speaking produces recall. Practise the version you will be graded on." },
    { icon: "✅", t: "Progress is saved locally",
      d: "Plan checkboxes and self-test ticks persist in this browser's local storage. Nothing is uploaded anywhere." },
  ],

  honesty: [
    "Coverage is deliberately wider than any single interview will reach. Depth on the numbered early steps beats skimming everything.",
    "Interactive labs exist where a number is easier to trust once you have moved it yourself — bias–variance, metric thresholds, convolution shapes, capacity estimates.",
    "Code templates are for reproducing from memory. If you can only recognize them, you have not finished the step.",
  ],
};
