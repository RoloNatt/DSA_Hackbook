// ─── ML DOMAIN ROUND — STUDY PLAN & SELF-TEST ───────────────────────────────

export const PLAN_RULE = {
  h: "The one rule that determines whether any of this works",
  body: "After each topic, CLOSE THE DOCUMENT AND SAY THE ANSWER OUT LOUD. In full sentences, as if someone is listening.\n\nReading an explanation, nodding, and feeling it click is RECOGNITION. The interview tests RECALL under pressure, and the gap between the two is enormous — it's the single most common reason people who \"studied a lot\" still fail.\n\nThe wrong loop: read → get confused → look it up → move on.\nThe right loop: read → close everything → say it out loud → check → re-drill the ones you couldn't say.\n\nEverything else in this section exists only to make the say-it-out-loud step answerable.",
  metric: "The honest readiness test is not documents read. It's how many of the self-test questions you can answer aloud, cold, without notes.",
};

export const ALLOCATION = {
  h: "Where to spend your time",
  body: "The stated topic list leads with fundamentals — supervised/unsupervised, bias-variance, overfitting, linear and logistic regression, decision trees, SVMs, CNNs, RNNs. The specialization is ONE column of the table, not the whole round.\n\nA realistic 45-minute split:\n• ~50–60% general ML fundamentals\n• ~25–35% depth on your stated experience\n• ~10–20% coding or applied design\n\nSo: roughly 60% of study time on fundamentals, 40% on your specialization. If you spend the whole week on your specialization and can't explain overfitting or precision vs recall, you fail on the fundamentals half regardless of how well you explain reranking.",
};

export const DAYS = [
  {
    day: 1,
    title: "Foundations & the vocabulary trap",
    color: "#1A6BCC", bg: "#E8F1FB",
    morning: "Read Foundations end to end: the terminology trap, the math you actually need (dot products, gradients, chain rule, Bayes), gradient descent and the learning rate, and loss functions. Then Core Topic 1 (supervised vs unsupervised).",
    evening: "Say out loud, without notes: what a weight is · what a learning rate is · what the three symptoms of a wrong learning rate look like · why we use log. Redraw the fog/valley picture from memory.",
    drill: "Run the gradient-descent code and the learning-rate sweep. Change the numbers. Watch lr=0.1 diverge to 1e+85 with your own eyes.",
  },
  {
    day: 2,
    title: "Bias-variance & overfitting — the highest-yield day",
    color: "#C62828", bg: "#FDECEA",
    morning: "Core Topics 2 and 3 in full. The dartboard, the thought experiment (200 models, one test point), the decomposition, the diagnosis table, learning curves, double descent. Then the full regularization toolbox and L1 vs L2.",
    evening: "Say out loud: what high bias means and why it causes underfitting · what you'd OBSERVE for a variance problem vs a bias problem · how you'd know whether more data would help · what double descent is · five ways to reduce overfitting and the one situation where none of them help.",
    drill: "Run the bias-variance decomposition demo. Watch degree 9's variance explode to 160. Then write the diagnosis table from memory.",
  },
  {
    day: 3,
    title: "Metrics, built from zero",
    color: "#00838F", bg: "#E0F7FA",
    morning: "The Metrics Lab, in order and without skipping to ROC: what a classifier actually outputs → threshold → confusion matrix → the four rates → the threshold sweep → the ROC curve → AUC → ROC vs PR. Then precision/recall tradeoffs and threshold selection.",
    evening: "Say out loud: what a classifier actually outputs and what a threshold is · define TPR and FPR INCLUDING what's in each denominator and why that matters · what's on each axis of a ROC curve and what one point represents · what AUC means in probability terms · why ROC-AUC is misleading on imbalanced data, with the MECHANISM · how you'd actually choose a threshold in production.",
    drill: "Use the interactive threshold slider until the relationship between threshold, TPR, FPR and precision is automatic. Then code precision/recall/F1 and a ROC curve from scratch.",
  },
  {
    day: 4,
    title: "The classical algorithms",
    color: "#0F7A5A", bg: "#E2F5EF",
    morning: "Core Topics 5–8: linear regression, logistic regression, decision trees, SVMs. Then the Algorithm Zoo: Random Forest, boosting, kNN, k-means, DBSCAN, PCA, Naive Bayes, and the comparison tables.",
    evening: "Derive the logistic regression gradient on paper THREE times until the cancellation is automatic. Say out loud: why cross-entropy and not MSE (all three reasons) · why logistic regression is a classifier despite the name · how a tree chooses splits · why one tree overfits and how Random Forest fixes it INCLUDING why the randomness matters · what support vectors are · the kernel trick in plain words · how C and gamma each affect overfitting.",
    drill: "Write the Random Forest vs boosting table from memory. Then code logistic regression and k-means from a blank file.",
  },
  {
    day: 5,
    title: "Deep learning: networks, CNNs, RNNs",
    color: "#1565C0", bg: "#E3F2FD",
    morning: "Deep Learning section: neuron → network, why activations are mandatory (with the algebraic proof), the activation table, backprop worked by hand, vanishing/exploding gradients, initialization, normalization layers. Then Core Topics 9 and 10: CNNs and RNNs/LSTM.",
    evening: "Say out loud: why activations are mandatory — and PROVE it algebraically, don't just assert · what backprop does, with the restaurant analogy · why you can't initialize weights to zero · why CNNs over dense nets (three reasons) · why residual connections work and what the DEGRADATION problem was · why vanilla RNNs fail on long sequences · how an LSTM's cell state fixes it.",
    drill: "Compute conv output sizes and parameter counts for FIVE made-up configurations using the calculator. Then write the 2-layer NN forward and backward from a blank file.",
  },
  {
    day: 6,
    title: "Transformers + your specialization",
    color: "#6A1B9A", bg: "#F3E5F5",
    morning: "The Transformer section: attention, Q/K/V, the formula, √d_k, multi-head, causal masking, positional encodings, pre-norm, complexity, the model families. Then go deep on your chosen specialization track.",
    evening: "Write the attention equation from memory FIVE times. Say out loud: why divide by √d_k and what breaks without it · why √d_k specifically and not d_k · why multi-head instead of one wide head · why Transformers replaced RNNs · BERT vs GPT and when you'd use each. Then the three core answers from your specialization.",
    drill: "Code scaled dot-product attention with a causal mask, from memory. If your specialization is GenAI: draw the full RAG pipeline from memory until it's automatic.",
  },
  {
    day: 7,
    title: "Production, judgement, and full rehearsal",
    color: "#827717", bg: "#F9FBE7",
    morning: "The Playbook: round shape, rubric, answer shapes, red-flag vs green-flag, the ML system design framework. Then the Production & Evaluation questions: drift, skew, silent degradation, A/B testing, golden sets, when NOT to use ML.",
    evening: "Run the FULL self-test out loud, twice. Then rehearse your project answers: for each system, what it does, the key decision and its alternative, the metric and how it was measured, and what broke. Rehearse the failure story to 90 seconds.",
    drill: "Two ML system design questions, out loud and timed, using the framework. Then stop and sleep properly — a rested brain outperforms a crammed one on ambiguous questions.",
  },
];

export const COMPRESSED = {
  h: "If you have three days, not seven",
  body: "Day 1: Bias-variance + overfitting + the full metrics chain. These are the most-probed fundamentals by a wide margin.\nDay 2: Logistic regression (derive the gradient), decision trees and ensembles, CNNs (the arithmetic), RNN/LSTM (the vanishing-gradient story).\nDay 3: Transformers/attention, your specialization, the question bank out loud, and your project answers.\n\nSkip if short of time: reinforcement learning details, VAE/GAN/diffusion internals, optimizer internals beyond \"Adam is the default\", the mathematics of PCA. Know each in one line and move on.",
};

// ── The readiness self-test ─────────────────────────────────────────────────
export const SELF_TEST = [
  {
    group: "Bias, variance, overfitting",
    items: [
      "What does 'bias' mean in the bias-variance sense, and why does high bias cause underfitting?",
      "What does variance mean, and what would you OBSERVE in your scores?",
      "Give me the bias-variance decomposition formula and say what each term means.",
      "I have 60% train and 58% validation accuracy. Diagnose and prescribe.",
      "I have 99% train and 70% validation. Diagnose and prescribe.",
      "How do you know whether collecting more data would help?",
      "What is double descent, and what does it change?",
      "What is overfitting and how do you detect it?",
      "Five ways to reduce overfitting — and the one situation where none of them help.",
      "L1 vs L2: what's different, and why does L1 give exact zeros?",
      "What does regularization do, and when would applying it be the WRONG move?",
    ],
  },
  {
    group: "Metrics",
    items: [
      "What does a classifier actually output, and what is a threshold?",
      "Define TPR and FPR, including what's in each denominator and why that matters.",
      "What's on each axis of a ROC curve, and what does one point represent?",
      "What does AUC mean in probability terms?",
      "Why is ROC-AUC misleading on imbalanced data? Give the mechanism, not just the fact.",
      "When would you optimize precision, and when recall? Give an example of each.",
      "How would you actually choose a decision threshold in production?",
      "Why not just optimize F1 for everything?",
      "Your model has 99% accuracy. Are you happy?",
    ],
  },
  {
    group: "Training",
    items: [
      "What is a learning rate? What happens if it's too high? Too low?",
      "My loss became NaN. What do you check, in what order, and why that order?",
      "Why can't you initialize all weights to zero?",
      "Why are activation functions mandatory? Prove it.",
      "SGD vs Adam vs AdamW — when each, and what does decoupled weight decay mean?",
      "What does batch size affect?",
    ],
  },
  {
    group: "Algorithms",
    items: [
      "How does linear regression work? Why MSE? What are the two ways to solve it?",
      "Why is logistic regression a classifier despite the name?",
      "Why cross-entropy and not MSE for classification — all three reasons.",
      "Derive the logistic regression gradient.",
      "How does a decision tree choose splits?",
      "Why does one tree overfit, and how does Random Forest fix it — including why randomness matters?",
      "Random Forest vs gradient boosting — when each?",
      "What are support vectors?",
      "Explain the kernel trick in plain words, and why it avoids the explicit mapping.",
      "How do C and gamma relate to overfitting?",
      "Why do trees not need feature scaling?",
      "When would you NOT use machine learning at all?",
    ],
  },
  {
    group: "Deep learning",
    items: [
      "Why CNNs over dense nets — the three reasons.",
      "Compute output size and parameters for a conv layer (make up numbers).",
      "What does pooling do and why? What is a receptive field?",
      "Why do residual connections let you train deeper networks? What problem did ResNet actually solve?",
      "Why stack two 3×3 convolutions instead of one 5×5?",
      "Why do vanilla RNNs fail on long sequences?",
      "How does an LSTM's cell state fix the gradient problem?",
      "Why did Transformers replace RNNs?",
      "Why divide by √d_k in attention? Why √d_k and not d_k?",
      "Why multi-head attention instead of one wider head?",
      "Why do Transformers use LayerNorm rather than BatchNorm?",
    ],
  },
  {
    group: "Practice & production",
    items: [
      "Name three kinds of data leakage and how to prevent each.",
      "When would you use StratifiedKFold, GroupKFold, TimeSeriesSplit?",
      "What is training–serving skew and how do you detect it?",
      "Data drift vs concept drift — and does the distinction matter operationally?",
      "Your model does well offline and badly online. Debug it, in order.",
      "Your model silently degraded over three months. Why didn't you notice?",
      "Why A/B test if the offline metrics improved?",
      "Why build a golden evaluation set before optimizing anything? How big?",
    ],
  },
];

export const SELF_TEST_TARGET = "Target: at least 80% of these answered fluently, ALOUD, without notes. Below that, more reading won't fix it — targeted re-drilling of the ones you missed will. Track which bucket each question falls into: (1) can answer from experience, (2) understand but haven't verbalized, (3) genuine gap. Bucket 2 needs speaking practice. Bucket 3 needs study, or an honest plan to say 'I haven't worked with that — here's how I'd reason about it.'";

export const LAST_DAYS = {
  h: "How to spend the final days",
  rows: [
    { p: "1", what: "The self-test, out loud, every day", why: "Converts recognition into recall — the actual bottleneck" },
    { p: "2", what: "Bias-variance, overfitting, metrics, logistic regression until automatic", why: "The most-probed fundamentals by a wide margin" },
    { p: "3", what: "Run every code snippet and change the numbers", why: "Watching degree 9 explode teaches what reading can't" },
    { p: "4", what: "Conv output size and parameter count on five made-up inputs", why: "Free marks, and they ask it often" },
    { p: "5", what: "Read your own project code; know each system's key decision, metric and failure", why: "Defensible, entirely yours, and they WILL probe it" },
    { p: "6", what: "One real failure story, rehearsed to 90 seconds", why: "Can't be faked; interviewers weight it heavily" },
    { p: "7", what: "The reflexes: baseline first, ask about class balance, diagnose before prescribing", why: "They're what separate a product engineer who uses ML from an ML engineer" },
  ],
  dont: "What NOT to do in the last days: read new material. If the constraint is retrieval rather than coverage, a new document you've read once is worth less than re-drilling one you can nearly produce.",
};

export const THREE_THINGS = {
  h: "Three things to be able to do without notes",
  items: [
    "Explain bias-variance in 60 seconds, then in 5 minutes with the decomposition and the diagnosis table.",
    "Explain attention in 60 seconds, then in 5 minutes with the formula and why √d_k.",
    "Answer \"how would you evaluate this?\" completely for any system — offline metrics with justification, slice-level, online, and a golden set built before optimizing.",
  ],
  closing: "Those three cover a large share of what can be asked. Everything else is depth to survive follow-ups.\n\nThe measure of mastery here isn't recall — it's whether you can say \"it depends on X, and here's how I'd decide\" for any question in the area. That's judgement, and it's what this round is actually built to detect.",
};
