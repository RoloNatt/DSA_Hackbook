// ─── AI/ML DOMAIN ROUND — THE PLAYBOOK ──────────────────────────────────────
// How the round works, how answers are scored, and the answer shapes that score.

export const ROUND_SHAPE = {
  headline: "What the AI/ML domain round actually is",
  blurb: "45 minutes. Not a coding round — a conversation designed to find the edge of your knowledge. The interviewer asks, you answer, and then they ask a harder version of the same question. That laddering is the design, not a sign things are going badly.",
  timeline: [
    { span: "~5 min", label: "Intro & background", detail: "A short walk through your experience. The interviewer is picking which claims to probe later — expect them to return to whatever sounded most impressive." },
    { span: "~15–25 min", label: "Conceptual grilling on fundamentals", detail: "Bias-variance, overfitting, metrics, loss functions, the classical algorithms, CNN/RNN mechanics. This is the bulk of the score and the most predictable part." },
    { span: "~15–20 min", label: "Applied: code or design", detail: "Either 'implement X in NumPy' (softmax, logistic regression, k-means, attention, a metric) or an open 'how would you build X' discussion." },
    { span: "~5 min", label: "Your questions", detail: "Scored. Ask about evaluation practice, bottlenecks, and what distinguishes levels on the team." },
  ],
  split: [
    { pct: 55, label: "General ML fundamentals", note: "The stated topic list — this is where rounds are usually won or lost." },
    { pct: 30, label: "Depth on your stated experience", note: "Claim probing. Every number on a résumé is a question waiting to be asked." },
    { pct: 15, label: "Coding or applied design", note: "Clean NumPy, or a structured system-design walkthrough." },
  ],
  warning: "The most common failure mode for candidates with strong applied/product backgrounds is answering fundamentals questions in product language. 'We used a RAG pipeline with a reranker' is a tools answer. 'Bi-encoder retrieval is O(1) per document because embeddings precompute; a cross-encoder is O(N) per query but sees the pair jointly, so I use it only on the top 50' is an ML answer. The round tests the layer underneath the tools.",
};

export const RUBRIC = [
  { axis: "Depth of ML knowledge", weight: "≈35%", what: "Can you explain the mechanism, not just the definition? Do you know why cross-entropy and not MSE, why √d_k, why L1 gives exact zeros?", tell: "For every concept, know one level below the definition. The follow-up is always 'why?'" },
  { axis: "Reasoning under follow-ups", weight: "≈30%", what: "When pushed past what you know, do you reason forward or bluff? Do you incorporate hints?", tell: "Hitting your limit is expected. What you do there is the actual measurement." },
  { axis: "Communication & structure", weight: "≈20%", what: "Do you lead with the one-sentence answer and then add depth? Do you name tradeoffs unprompted?", tell: "Structure out loud: 'There are three reasons — let me take them in order.'" },
  { axis: "Practical judgement", weight: "≈15%", what: "Baseline first? Evaluation mentioned unprompted? Do you know when NOT to use ML?", tell: "Always propose the simple thing first and say what would justify complexity." },
];

// The universal answer template — almost every ML question fits it.
export const ANSWER_SHAPES = [
  {
    name: "The universal practical answer",
    template: "\"It depends on ___. Here's how I'd decide: ___. The tradeoff is ___.\"",
    why: "Almost every applied ML question is a decision under constraints, not a fact lookup. Delivering a decision procedure instead of a definition is the single biggest scoring difference.",
    example: "\"Which model would you use?\" → \"It depends on data volume and whether we need interpretability. I'd start with logistic regression as a baseline, and move to gradient boosting if there are real feature interactions. The tradeoff is that boosting buys accuracy and costs calibration and explainability.\"",
  },
  {
    name: "Lead simple, then deepen",
    template: "One sentence → then the mechanism → then the tradeoff → then the edge case.",
    why: "Dumping everything at once reads as rehearsed and buries the answer. Let the interviewer pull you deeper — that's what the follow-ups are for.",
    example: "\"What's attention?\" → Start with: \"It lets each token look at every other token and weight them by relevance.\" Stop. If they push: Q/K/V, then the formula, then √d_k, then O(n²).",
  },
  {
    name: "The honest-edge script",
    template: "\"I haven't worked with that directly. My understanding is [X]. I'd expect [Y] because [Z]. Is that roughly right?\"",
    why: "Interviewers deliberately probe until you hit a limit. A calm, reasoned 'I don't know, but here's how I'd think about it' scores far higher than confident nonsense — and bluffing, once caught, retroactively devalues everything else you said.",
    example: "Delivered without apology or hedging. It often gets you the answer handed back, and the conversation continues productively.",
  },
  {
    name: "Numbers with denominators",
    template: "The metric + what it's measured over + the sample size + the baseline it beat.",
    why: "Any accuracy figure invites 'accuracy on what?'. A number without a denominator and a baseline is an unsupported claim.",
    example: "Not '95% accuracy' but 'field-level accuracy across 12 extracted fields, on a 500-document labelled set, versus a rules baseline at 78%.'",
  },
];

export const RED_GREEN = [
  { q: "Why this model?", red: "\"It's state of the art.\"", green: "\"It was the simplest thing that cleared the accuracy bar — here's what I'd have moved to if it hadn't.\"" },
  { q: "How did you evaluate?", red: "\"It worked well.\"", green: "\"Golden set of N cases, these metrics, this baseline, this result.\"" },
  { q: "Why this chunk size?", red: "\"It's the standard.\"", green: "\"Started at X, tested against the eval set, landed at Y — but the bigger win was parent-document retrieval.\"" },
  { q: "What went wrong?", red: "\"Nothing major.\"", green: "A specific failure, the wrong first hypothesis, the fix, and what the number did." },
  { q: "Do you know X?", red: "Vague partial bluffing.", green: "\"I haven't used it. My understanding is A. I'd expect B because C. Is that right?\"" },
  { q: "Why not use an agent?", red: "\"Agents are the future.\"", green: "\"A pipeline was sufficient and it's testable. An agent earns its cost only when the step sequence is genuinely unknowable in advance.\"" },
  { q: "How do you handle hallucination?", red: "\"We use a good prompt.\"", green: "\"Grounding, mandatory citations, schema validation, and a groundedness metric on the eval set — plus accepting it can't be eliminated, so the design contains the damage.\"" },
  { q: "What's your accuracy?", red: "A number with no context.", green: "The number, the denominator, the sample size, and the baseline." },
];

export const RED_GREEN_PATTERN = "Green-flag answers have a before, a decision, a tradeoff, and a number. Red-flag answers have an adjective.";

// ─── ML SYSTEM DESIGN FRAMEWORK ─────────────────────────────────────────────
export const DESIGN_FRAMEWORK = [
  {
    step: "1. Clarify & frame",
    time: "2–3 min — never skip",
    points: [
      "What's the business objective, and what ML objective proxies it?",
      "Scale: users, QPS, item count, data volume? Latency budget? Online or batch?",
      "What does a false positive cost versus a false negative?",
      "What exists today — what's the baseline we must beat?",
      "What data do we have, and who labelled it?",
    ],
  },
  {
    step: "2. Formulate as an ML problem",
    time: "",
    points: [
      "Classification, regression, ranking, generation, or clustering?",
      "What is ONE training example — what's the label, and where does it come from (explicit, implicit, weak supervision, human annotation)?",
      "Propose a non-ML baseline FIRST: rules, heuristics, popularity. Interviewers weight this heavily.",
    ],
  },
  {
    step: "3. Data",
    time: "",
    points: [
      "Sources, volume, labelling strategy, class balance, privacy/PII, sampling.",
      "Split by TIME and by ENTITY, not randomly, wherever leakage is possible.",
      "Name the leakage risks explicitly — it signals production experience.",
    ],
  },
  {
    step: "4. Features",
    time: "",
    points: [
      "User / item / context / interaction / temporal features. Aggregations over windows.",
      "Feature store for train/serve consistency — name training–serving skew as an explicit risk.",
    ],
  },
  {
    step: "5. Model",
    time: "",
    points: [
      "Start simple (logistic regression / GBDT) and say why; then state what would justify going deep.",
      "Loss, regularization, class-imbalance handling, hyperparameter search.",
    ],
  },
  {
    step: "6. Evaluation",
    time: "",
    points: [
      "Offline metrics WITH justification for the choice.",
      "Slice-level metrics (per country, per segment, per device) — aggregate metrics hide failures.",
      "Online: A/B design, primary metric, guardrail metrics, minimum detectable effect, duration/power.",
    ],
  },
  {
    step: "7. Serving",
    time: "",
    points: [
      "Batch vs real-time, latency budget, model size, caching, ANN indexes, canary/shadow deployment.",
    ],
  },
  {
    step: "8. Monitoring & iteration",
    time: "",
    points: [
      "Data drift (P(x) shifts) vs concept drift (P(y|x) shifts). PSI/KL on feature distributions; watch the prediction distribution.",
      "Retraining cadence and triggers, rollback, alerting.",
      "Name silent degradation: ML systems fail fluently, with no exception and no error rate spike.",
    ],
  },
  {
    step: "9. Responsible ML",
    time: "brief, but don't omit",
    points: [
      "Fairness across slices, feedback loops, explainability (SHAP/LIME), adversarial robustness, privacy.",
      "Omitting this entirely reads as junior.",
    ],
  },
];

// ─── GENERIC PROJECT-DEFENSE ARCHETYPES ─────────────────────────────────────
// Prepare four things per project: what it does, the key decision and its
// alternative, the metric and how it was measured, and what broke.
export const PROJECT_DEFENSE = {
  intro: "The experience portion is claim probing: the interviewer picks the most impressive line and digs until they hit bedrock or bottom. Every project answer should contain a metric, a baseline, a failure mode, and a tradeoff. Below are the common system archetypes and the probes each attracts.",
  rule: "If a number was tracked operationally rather than with a formal labelled eval set, say exactly that, then say what you'd build now. That answer is safe and respected. A fabricated methodology is not — the next three questions are always about the methodology.",
  archetypes: [
    {
      name: "Document AI / extraction system",
      probes: [
        { q: "\"What does 95% extraction accuracy mean?\"", a: "Answer with the LEVEL (field-level vs document-level — these differ enormously: ten fields at 95% each is only ~60% correct end-to-end), which fields, the sample size, how ground truth was established, and the baseline it beat. Raising the compounding point yourself shows you understand what the number means." },
        { q: "\"Why an LLM instead of a trained layout model (LayoutLM/Donut)?\"", a: "Zero-shot coverage of unseen formats and iteration speed, traded against cost, latency and non-determinism. Then name the switch point: at high volume on stable formats, distil the LLM's outputs into a small specialist model or deterministic templates, and reserve the LLM for the long tail. The mature answer is hybrid." },
        { q: "\"How did you make LLM extraction reliable?\"", a: "Schema-constrained output (tool calling / constrained decoding, not regex on free text), a validation layer with deterministic checks (line items summing to the total catches a large fraction of errors for free), retry-with-error-feedback, temperature 0 for reproducible regression tests, and confidence-based routing of the uncertain tail to human review." },
        { q: "\"How did you evaluate?\"", a: "Golden set with per-field accuracy broken down by vendor format, regression run on every prompt change, and a cost-weighted error rate — a wrong total is far worse than a wrong address line." },
        { q: "\"What was the hardest failure?\"", a: "Real candidates: tables split across chunk or page boundaries; a vendor format that resembled an existing template and silently routed to the wrong extractor; currency/date-locale ambiguity; OCR quality degrading on a new scanner with no error surfaced; a prompt change that fixed one field and quietly broke another because there was no regression suite." },
      ],
    },
    {
      name: "RAG / semantic search system",
      probes: [
        { q: "\"Why cosine and not Euclidean?\"", a: "Cosine measures angle and ignores magnitude, which for text often tracks length rather than meaning. The footnote that scores: most embedding models return L2-normalized vectors, and on normalized vectors cosine, dot product and Euclidean give identical rankings — so it only matters if your vectors aren't normalized, or you're setting absolute thresholds." },
        { q: "\"Why that chunk size — did you test alternatives?\"", a: "The honest shape: started from a default, tested against an eval set, and found chunk size interacts with document structure more than any universal optimum. Structure-aware splitting beat fixed sizes; parent-document retrieval (embed small, return large) beat tuning size at all. If you genuinely didn't test it, say so and say what you'd do now." },
        { q: "\"Why hybrid search? Give a query where dense fails.\"", a: "Any query hinging on an exact string: an invoice number, a part code, a surname, an error code. The embedding of INV-2024-8871 sits right next to INV-2024-8872 — you need exactly one. BM25 treats it as a rare term and nails it. Conversely BM25 fails on 'stop my account being charged' → 'Cancelling a subscription', where lexical overlap is zero. Fuse with Reciprocal Rank Fusion, which uses ranks only so no score normalization is needed." },
        { q: "\"Retrieval recall@10 improved but answers didn't. What's happening?\"", a: "Retrieval is no longer the bottleneck. Isolate with oracle context — paste the known-correct chunk in directly. If the answer becomes right, it's retrieval; if not, it's generation, chunk quality, or prompt grounding. Other causes: the right chunk lands mid-context where attention is weakest; the chunk lacks the context to interpret it; conflicting sources; or recall@10 improved while recall@3 didn't and only 3 chunks reach the model." },
        { q: "\"Why did it work in the demo and fail on real documents?\"", a: "Scanned PDFs producing garbage text, multi-column layouts read out of order, tables flattened into token soup, near-duplicate versions competing, and — most underappreciated — corpus growth: a 20× larger corpus means the correct chunk now has thousands of plausible-looking competitors that didn't exist at demo scale." },
      ],
    },
    {
      name: "Agent / workflow automation system",
      probes: [
        { q: "\"Why an agent instead of a fixed pipeline?\"", a: "The senior answer is usually that you wouldn't. Pipelines are cheaper, faster, testable, debuggable and deterministic. An agent is warranted only when the sequence of steps genuinely can't be known ahead of time. If you can draw the flowchart in advance, build the flowchart. Being honest that a system was an orchestrated pipeline with LLM calls is respected far more than inflating it." },
        { q: "\"Your agent is 95% reliable per step. Why is that a problem?\"", a: "0.95^10 ≈ 0.60 — it fails four times in ten end-to-end while every component looks excellent. The engineering responses follow from the arithmetic: cut step count (it attacks the exponent), make steps deterministic so they're 100% not 95%, verify at each step, and checkpoint so a failure doesn't discard the run." },
        { q: "\"How would you unit test it?\"", a: "Decompose: tools get ordinary deterministic unit tests; tool selection gets fixed scenarios asserting on a SET of acceptable choices; end-to-end gets evaluated, not tested — a task suite run repeatedly, tracking a success RATE. Regression is on the rate. All of it needs full trajectory tracing, because when the rate drops you must see where it diverged." },
      ],
    },
  ],
  pocketStories: [
    "A time you shipped the simpler solution and why.",
    "A time something looked fine in testing and failed in reality — the most common senior-signal question.",
    "What you'd rebuild differently today, and what evidence changed your mind.",
  ],
};

export const QUESTIONS_TO_ASK = [
  { q: "How does the team evaluate model changes before shipping — is there a standard offline suite, or is it mostly online?", why: "Signals you think about evaluation, the thing most candidates neglect entirely." },
  { q: "What's the biggest current bottleneck — data, serving cost, evaluation, or model quality?", why: "Signals you think in systems rather than in models." },
  { q: "What separates a strong L4 from a strong L5 on this team?", why: "Signals you're thinking about growth, and the answer is genuinely useful." },
  { q: "What does the path from idea to shipped model look like here?", why: "Surfaces how much ownership the role actually carries." },
];

export const EXECUTION = {
  do: [
    "Think out loud continuously — silence reads as being stuck.",
    "Clarify before answering anything open-ended. Always.",
    "Structure: \"There are three things here — X, Y, Z. Let me take them in order.\"",
    "Give the tradeoff, not just the answer.",
    "Quantify. \"Cut p95 latency from 800ms to 210ms\" beats \"improved performance.\"",
    "When stuck: state what you know, state your assumption, propose a path, ask a question.",
  ],
  dont: [
    "Bluff. They will pull the thread, and once caught, everything else you said becomes suspect.",
    "Name-drop tools. \"We used LangChain\" says nothing about your understanding.",
    "Jump to the fanciest model. Baseline first, always.",
    "Forget evaluation and monitoring — the most common gap in candidates from product backgrounds.",
    "Dump everything you know at once. Lead with one sentence and let them pull.",
  ],
};
