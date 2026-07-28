// ─── THE 10 CORE TOPICS GOOGLE NAMED ────────────────────────────────────────
// Fundamentals: supervised/unsupervised · bias-variance · overfitting · practical+theory
// Algorithms:   linear regression · logistic regression · decision trees · SVMs
// Deep learning: CNNs · RNNs
//
// Each topic: intuition → mechanics/math → code → when/why/vs → questions easy→hard.
// "Practical and theory" is not a topic — it's a warning that every concept can be
// asked both ways: explain it, and code it or apply it.

export const CORE_TOPICS = [

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "supervised",
    n: 1,
    group: "Fundamentals",
    emoji: "🏷️",
    title: "Supervised vs Unsupervised Learning",
    color: "#1A6BCC", bg: "#E8F1FB",
    oneLiner: "Supervised has an answer key. Unsupervised finds structure without one.",
    intuition: "Supervised learning: you have a teacher. Every training example comes with the correct answer attached, and the model learns by comparing its guess to the answer and correcting. Like studying with an answer key.\n\nUnsupervised learning: no teacher. You have data but no answers. The model finds structure on its own — groups, patterns, compressions. Like being handed a pile of photos and asked to sort them into piles without being told what the piles are.",
    mechanics: [
      { h: "Supervised — inputs X and labels y, learn f: X → y", body: "Classification — y is a category (spam/not-spam, digit 0–9). Output is discrete.\nRegression — y is a continuous number (price, temperature, ETA). Output is continuous." },
      { h: "Unsupervised — inputs X only", body: "Clustering — group similar points (k-means, DBSCAN, hierarchical).\nDimensionality reduction — compress many features into few (PCA, t-SNE, UMAP).\nAnomaly detection — find the points that don't fit.\nDensity estimation." },
      { h: "Two more you must be able to name", body: "Self-supervised — labels generated from the data itself. Hide a word and predict it; the sentence is its own label. This is how every modern LLM is pretrained. Technically supervised, but no human annotated anything.\nSemi-supervised — a small labelled set plus a large unlabelled set." },
      { h: "Transfer learning", body: "Take a model pretrained on a big generic task and adapt it to your small specific task. Almost all industrial deep learning works this way, because training from scratch costs millions." },
    ],
    code: `# SUPERVISED: fit takes BOTH X and y
from sklearn.linear_model import LogisticRegression
model = LogisticRegression().fit(X_train, y_train)   # y is required
predictions = model.predict(X_test)

# UNSUPERVISED: fit takes ONLY X — there is no y
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3).fit(X_train)           # no labels exist
cluster_ids = kmeans.predict(X_test)

# The cleanest tell: if there's a y, it's supervised.`,
    compare: {
      headers: ["", "Supervised", "Unsupervised"],
      rows: [
        ["You have", "Labelled data", "Unlabelled data"],
        ["Goal", "Predict the label for new data", "Discover structure"],
        ["Evaluation", "Easy — compare to known answers", "Hard — no ground truth to check against"],
        ["Examples", "Spam detection, price prediction, image classification", "Customer segmentation, anomaly detection, compression"],
        ["Main cost", "Labelling is expensive", "Results are hard to validate"],
      ],
    },
    keyInsight: "The practical asymmetry worth stating: supervised is easy to evaluate but expensive to set up (labelling). Unsupervised is cheap to set up but hard to evaluate — clustering ALWAYS returns clusters, so the real question is always whether they mean anything.",
    questions: [
      {
        level: "Easy", q: "What's the difference between supervised and unsupervised learning?",
        a: "Supervised learning has labelled data — every example comes with the correct answer, and the model learns to predict it. Unsupervised has no labels; it finds structure like clusters or lower-dimensional representations on its own. In code the tell is simple: supervised fit takes X and y, unsupervised takes only X.",
      },
      {
        level: "Medium", q: "Is a recommendation system supervised or unsupervised?",
        a: "It can be either, depending on framing. If I treat it as predicting a rating a user would give an item, it's supervised regression. If I treat it as finding users with similar taste with no explicit target, it's unsupervised. Modern systems are usually supervised — predicting click or watch probability — with unsupervised embeddings as components. The honest answer is that the framing is a design decision, not a property of the problem.",
      },
      {
        level: "Medium", q: "How do you evaluate an unsupervised model if there are no labels?",
        a: "That's the hard part. Options: internal metrics like silhouette score for clustering, which measure how tight and well-separated clusters are without needing labels; stability under resampling; or — most convincingly — a downstream task. If the clusters predict something I didn't cluster on, or the compressed features improve a supervised model, that's evidence the structure is real. Clustering always returns clusters, so the real question is always whether they mean anything.",
      },
      {
        level: "Hard", q: "Is GPT supervised or unsupervised?",
        a: "Self-supervised, which is the interesting middle. Mechanically it's supervised — it predicts the next token and is corrected against the true next token using a standard supervised loss. But the labels aren't human-annotated; they're generated for free from raw text by hiding what comes next. So it gets the scalability of unlabelled data with the clean training signal of supervised learning. That's why it can train on the entire internet — no human had to label any of it.",
      },
    ],
    sayOutLoud: "Supervised vs unsupervised — the definition, an example of each, and why unsupervised is harder to evaluate.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "biasvariance",
    n: 2,
    group: "Fundamentals",
    emoji: "🎯",
    title: "The Bias–Variance Tradeoff",
    color: "#C62828", bg: "#FDECEA",
    oneLiner: "Bias = prejudiced (too rigid). Variance = suggestible (too flexible).",
    flag: "Most-asked fundamentals question in any ML interview. Learn it cold.",
    intuition: "First, kill the confusion. \"Bias\" here does NOT mean the b in y = wx + b, and it does not mean prejudice toward the data. It means error from an oversimplified assumption.\n\nHigh bias = the model is committed to a belief that's too simple. A straight-line model insists reality is a straight line no matter what the data shows. It's prejudiced toward its own assumption. Wrong on training data, wrong on test data. Underfitting.\n\nHigh variance = the model has no strong belief and bends to fit whatever it sees, including the noise. Show it slightly different data and you get a wildly different model. It's suggestible. Perfect on training data, bad on test data. Overfitting.\n\nThe substitution to make: bias = prejudiced, variance = suggestible.",
    mechanics: [
      {
        h: "The thought experiment that makes it precise",
        body: "You cannot define these without this setup, and skipping it is why the concept stays fuzzy.\n\nImagine training your model 200 times, each on a different random sample of data. You now have 200 models. Pick ONE test point and look at all 200 predictions for it.\n\nBias = how far the AVERAGE of the 200 predictions is from the true answer. (Are we wrong on average?)\nVariance = how SPREAD OUT the 200 predictions are from each other. (Are we consistent?)",
      },
      {
        h: "The decomposition",
        body: "For squared-error problems the expected test error at a point breaks apart exactly:\n\n    E[(y − f̂(x))²]  =  Bias[f̂(x)]²  +  Var[f̂(x)]  +  σ²\n                          underfit        overfit      noise floor\n\nwhere Bias[f̂(x)] = E[f̂(x)] − f(x).\n\nBias² — wrong on average. Fix: a more flexible model.\nVariance — inconsistent. Fix: more data, or more constraint.\nIrreducible noise — randomness in the world. Unfixable by anything, ever. If two identical houses sold for different prices, no model can predict both.",
      },
      {
        h: "Why it's called a tradeoff",
        body: "Increasing model complexity LOWERS bias and RAISES variance. Decreasing it does the reverse. You cannot minimize both independently — pushing one down pushes the other up. The best model minimizes the sum, which sits in the middle.\n\nWhy the decomposition matters practically: the two problems have OPPOSITE fixes. Adding regularization to an underfitting model makes it worse. Adding capacity to an overfitting model makes it worse. Diagnosis before treatment.",
      },
    ],
    code: `import numpy as np
rng = np.random.default_rng(42)

def true_f(x):
    return np.sin(2 * np.pi * x)      # the real pattern (never seen in practice)

def make_dataset(n=30, noise=0.3):
    x = rng.uniform(0, 1, n)
    y = true_f(x) + rng.normal(0, noise, n)
    return x, y

x_test = np.linspace(0, 1, 100)
y_true_test = true_f(x_test)

for degree in [1, 2, 3, 5, 9]:
    preds = []
    for _ in range(200):                    # 200 different training sets
        x, y = make_dataset()
        coeffs = np.polyfit(x, y, degree)
        preds.append(np.polyval(coeffs, x_test))
    preds = np.array(preds)                 # (200 models, 100 points)

    bias_sq  = np.mean((preds.mean(axis=0) - y_true_test) ** 2)
    variance = np.mean(preds.var(axis=0))
    print(f"degree {degree}: bias²={bias_sq:.4f}  variance={variance:.4f}")

# Verified output:
# degree 1: bias²=0.2042  variance=0.0250      <- underfitting
# degree 2: bias²=0.2062  variance=0.0458
# degree 3: bias²=0.0048  variance=0.0172      <- sweet spot
# degree 5: bias²=0.0001  variance=0.0473
# degree 9: bias²=0.3656  variance=159.7369    <- overfitting, catastrophically`,
    codeNote: "Read the shape: as flexibility rises, bias falls and variance rises, and the total is minimized in the middle. A degree-1 line cannot be a sine wave (high bias) but every fitted line looks the same (low variance). A degree-9 polynomial through 30 noisy points swings wildly, and differently every time (variance 160). That's the tradeoff, watched numerically rather than read about.",
    diagnosisTable: {
      headers: ["Train score", "Val score", "Diagnosis", "Fix"],
      rows: [
        ["Low (60%)", "Low (58%)", "High bias / underfitting", "Bigger model, better features, train longer, LESS regularization"],
        ["High (99%)", "Low (70%)", "High variance / overfitting", "More data, regularization, dropout, simpler model, early stopping"],
        ["High (90%)", "High (88%)", "Good fit", "Ship it"],
        ["Low", "Higher than train", "Dropout/augmentation active, or a bug", "Normal if regularization is on — verify in eval mode. Otherwise check the split."],
      ],
    },
    keyInsight: "Two signals to internalize: BOTH scores bad → bias problem, the model isn't capable enough. BIG GAP between them → variance problem, the model isn't generalizing. The fixes are opposite, so diagnosing wrong makes it worse.",
    extra: {
      h: "Learning curves — the tool that answers \"would more data help?\"",
      body: "Plot training and validation score against how much training data you used.\n\n• Both curves flatten at a LOW score, converged together → high bias. More data will NOT help; you need a better model or better features.\n• Big persistent gap, validation still RISING at the end → high variance. More data will help — go get it.\n• Both high, small gap → good. Done.\n\nThis turns an expensive guess into a measurement, which is exactly why interviewers like the question.",
      code: `from sklearn.model_selection import learning_curve
sizes, train_scores, val_scores = learning_curve(
    model, X, y, train_sizes=np.linspace(0.1, 1.0, 10), cv=5, scoring='accuracy')
for n, tr, va in zip(sizes, train_scores.mean(1), val_scores.mean(1)):
    print(f"n={n:>5}  train={tr:.3f}  val={va:.3f}  gap={tr-va:.3f}")`,
    },
    doubleDescent: {
      h: "Double descent — the modern correction",
      body: "The classical story says test error follows a U-shape. Modern deep learning broke it. Very large models show a DOUBLE DESCENT curve:\n\n1. Classical regime — the familiar U. Error falls, then rises as the model starts overfitting.\n2. The interpolation threshold — the model has just enough capacity to fit the training data exactly. Test error SPIKES here, often to its worst point. There's exactly one way to fit the data and it's a terrible, contorted solution.\n3. The second descent — keep growing far past that point and test error falls again, often below the classical minimum.\n\nWhy: past the threshold there are infinitely many ways to fit the data perfectly, and gradient descent has an implicit bias toward simple, low-norm, smooth solutions. Among the infinite perfect fits it finds a smooth one, and smooth generalizes. At the threshold exactly there's only one solution available and no room to prefer a nice one — hence the spike.",
      say: "\"The classical U-curve isn't the full picture. Over-parameterized networks show double descent — test error peaks around the interpolation threshold, then falls again as you keep scaling. The tradeoff still exists, but 'more parameters means more overfitting' isn't reliably true past that point, which is part of why scaling works at all. The classical picture is still the right mental model for the tabular and small-data problems where I'd use trees or linear models.\"",
    },
    questions: [
      { level: "Easy", q: "Explain the bias-variance tradeoff.", a: "Bias is error from being too simple — the model is committed to an assumption reality doesn't match, so it's wrong on both training and test data (underfitting). Variance is sensitivity to which training data you happened to see — the model fits noise, so it's great on training and bad on test (overfitting). Expected error decomposes as bias² + variance + irreducible noise, and increasing complexity trades one for the other, so you aim for the middle." },
      { level: "Medium", q: "My model has 99% training accuracy and 72% validation. Diagnose it.", a: "High variance — overfitting. The model memorized the training data. In order I'd try: more data or augmentation, then regularization, then a simpler model, then early stopping. But FIRST I'd check for a train/validation distribution mismatch and for data leakage, because those masquerade as overfitting and the fixes are completely different." },
      { level: "Medium", q: "Training and validation are both 55%. Now what?", a: "High bias — underfitting. Regularization would make it worse. I'd increase capacity, add better features, train longer, and check the learning rate isn't so high it's failing to converge. I'd also sanity-check that the labels are even learnable — if the Bayes error is near 45%, no model can do better and I'm chasing noise." },
      { level: "Hard", q: "Does deep learning break the bias-variance tradeoff?", a: "The classical U-curve isn't the whole story for very large models. They show double descent: test error follows the usual U, spikes at the interpolation threshold where the model just barely fits the data, then falls again as you keep scaling past it. The reason is that beyond that threshold there are infinitely many ways to fit the data perfectly, and gradient descent implicitly picks a smooth, low-norm one, which generalizes. So 'more parameters means more overfitting' stops being reliable past that point. The classical picture is still correct for small-data and tabular problems." },
      { level: "Hard", q: "How would you know whether collecting more data would help?", a: "A learning curve — plot training and validation score against training-set size. If the validation curve is still rising when I run out of data, more data will help; that's a variance-limited regime. If both curves have flattened and converged at a poor score, that's bias — more data won't help at all, I need a better model or better features. It turns an expensive guess into a measurement." },
    ],
    sayOutLoud: "What high bias means and why it causes underfitting · what you'd OBSERVE for a variance problem vs a bias problem · what double descent is.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "overfitting",
    n: 3,
    group: "Fundamentals",
    emoji: "📚",
    title: "Overfitting (and the full toolbox against it)",
    color: "#B84A00", bg: "#FCEEE7",
    oneLiner: "Memorizing the examples instead of learning the concept.",
    intuition: "The student analogy — use this one, it's clear and it works. Three students prepare for an exam from a book of 100 practice questions.\n\n• Student A barely studied. 40% on practice, 40% on the real exam. → UNDERFITTING.\n• Student B memorized all 100 questions and answers word-for-word. 100% on practice, 45% on the real exam, because the real questions were worded differently. → OVERFITTING.\n• Student C understood the concepts. 88% practice, 85% real. → GOOD FIT.\n\nTraining data = the practice book. Test data = the real exam. The goal was never to score well on the practice book.",
    mechanics: [
      {
        h: "Why it happens",
        body: "Overfitting is the high-variance corner of the bias-variance picture. It happens when model capacity exceeds what the data can support:\n• Too many parameters relative to training examples\n• Training too long (the model keeps refining its fit to noise)\n• Features too granular (a memorized ID column)\n• Not enough data",
      },
      {
        h: "The signature",
        body: "Always the same: training score keeps improving while validation score plateaus and then gets WORSE. The gap between them is the amount of overfitting. The epoch where validation turns around is your early-stopping point.",
      },
    ],
    code: `# The signature, watched live
for epoch in range(100):
    train_one_epoch(model, train_loader)
    tr = evaluate(model, train_loader)
    va = evaluate(model, val_loader)
    print(f"epoch {epoch}: train={tr:.3f} val={va:.3f} gap={tr-va:.3f}")
# When 'val' starts DECREASING while 'train' keeps INCREASING -> overfitting begins there

# Force it, to see it: an unconstrained tree memorizes perfectly
from sklearn.tree import DecisionTreeClassifier
t = DecisionTreeClassifier(max_depth=None).fit(X_train, y_train)
print("train:", t.score(X_train, y_train))   # ~1.0 - memorized every point
print("val:  ", t.score(X_val,   y_val))     # much lower - didn't generalize`,
    toolbox: {
      headers: ["Technique", "How it works", "Use when", "Cost"],
      rows: [
        ["More data", "Harder to memorize a larger set", "ALWAYS first, if obtainable", "Time, money"],
        ["L2 / weight decay", "Penalizes large weights → smoother model", "Default for linear models and NNs", "One hyperparameter"],
        ["L1 / Lasso", "Drives some weights to exactly zero", "Many suspected-useless features", "Can discard useful correlated ones"],
        ["Dropout", "Randomly disables neurons each training step", "Neural networks specifically", "Slower convergence"],
        ["Early stopping", "Stop when validation stops improving", "Always — nearly free", "Needs a validation set"],
        ["Data augmentation", "Modified copies (flip/rotate/crop)", "Images, audio, text", "Must preserve the label"],
        ["Simpler model", "Fewer parameters / less depth", "Small data", "Risks swinging into bias"],
        ["Ensembling", "Average many models → cancel individual overfits", "When you can afford N models", "N× compute"],
        ["Batch norm", "Mild regularizing side-effect from batch noise", "Deep networks (mainly for optimization)", "Batch-size dependent"],
      ],
    },
    keyInsight: "EVERY one of these attacks variance. If your problem is bias, none of them help — you need more capacity or better features, not less. This is exactly why diagnosis comes before treatment.",
    l1l2: {
      h: "L1 vs L2 — the detail they probe",
      formula: "L2 (Ridge):  Loss + λ·Σ(wᵢ²)   → shrinks all weights toward 0, none reach it\nL1 (Lasso):  Loss + λ·Σ|wᵢ|    → drives some weights to EXACTLY 0",
      why: "Why L1 gives exact zeros and L2 doesn't — two equivalent explanations, know both:\n\nGradient view: L1's gradient is a constant ±λ regardless of how small the weight already is, so it keeps pushing until the weight hits zero and stops. L2's gradient is 2λw, which shrinks as w shrinks, so it approaches zero asymptotically without arriving.\n\nGeometric view: L1's constraint region is a diamond with corners ON the axes; the optimum tends to land on a corner, and a corner means a coordinate is exactly zero. L2's region is a sphere with no corners.\n\nBayesian view: L2 is a Gaussian prior on the weights, L1 is a Laplace prior. You're encoding a belief that small weights are more likely a priori, and letting the data overrule it only when evidence is strong.",
      table: {
        headers: ["", "L1 (Lasso)", "L2 (Ridge)"],
        rows: [
          ["Effect", "Some weights to exactly zero", "All weights shrink toward zero, none reach it"],
          ["Gives you", "A sparse model using fewer features", "A dense model with all weights smaller"],
          ["Use when", "Many features suspected useless; want automatic feature selection", "Features are correlated; you want stability"],
          ["Bonus", "Interpretability — you see which features survived", "Usually slightly better raw predictive performance"],
        ],
      },
      gotcha: "λ controls strength: bigger λ = more handicap = simpler model = more bias, less variance. In scikit-learn's LogisticRegression and SVC the knob is C = 1/λ, so SMALLER C means STRONGER regularization. That inversion catches people out constantly.",
    },
    questions: [
      { level: "Easy", q: "What is overfitting and how do you detect it?", a: "The model memorizes training data including its noise, so it scores high on training and low on new data. I detect it from the gap between training and validation scores — a large gap means overfitting." },
      { level: "Medium", q: "Name five ways to reduce overfitting.", a: "More data, regularization (L1/L2), dropout, early stopping, data augmentation. And I'd add that they all attack variance — so if the real problem is underfitting, none of them help." },
      { level: "Medium", q: "What's the difference between L1 and L2 regularization?", a: "L1 adds a penalty on absolute weight values and drives some weights to exactly zero, giving a sparse model and automatic feature selection. L2 penalizes squared weights and shrinks everything smoothly toward zero without reaching it, which handles correlated features better. Mechanically, L1's gradient is constant regardless of weight size so it pushes all the way to zero; L2's gradient shrinks proportionally so it only approaches zero." },
      { level: "Hard", q: "Dropout is on. Why is my validation accuracy HIGHER than training accuracy?", a: "Because dropout is active during training and off during validation. During training the model solves a harder task with a random fraction of its neurons disabled, so training accuracy is measured under a handicap. At validation all neurons are available. The gap is expected and not a problem — it's an artifact of measuring the two under different conditions. If I evaluated the training set in eval mode with dropout off, the gap would disappear. The classic related bug is forgetting model.eval() at inference, which makes results randomly worse and inconsistent between runs." },
      { level: "Hard", q: "You added regularization and the model got worse on BOTH train and validation. What happened?", a: "I was fighting the wrong problem. Regularization reduces variance, but if the model was already underfitting — high bias — then constraining it further just makes it more wrong. Both scores dropping together is the signature of too much bias. I'd remove the regularization and instead add capacity or better features. This is exactly why I diagnose bias vs variance before choosing a fix." },
    ],
    sayOutLoud: "Five ways to reduce overfitting, and the one situation where none of them help.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "practical",
    n: 4,
    group: "Fundamentals",
    emoji: "🔧",
    title: "\"Practical and Theory\" — the meta-topic",
    color: "#5B3DC8", bg: "#EEEAFC",
    oneLiner: "Not a concept — a warning that every topic gets asked from both sides.",
    intuition: "This isn't a subject to study. It's a signal about how they'll ask. Every topic gets probed two ways:\n\nTHEORY side — \"explain X\", \"why does X work\", \"derive the gradient\", \"what's the tradeoff\". Tests understanding.\n\nPRACTICAL side — \"code X from scratch\", \"your model does Y, debug it\", \"which would you use here and why\", \"how would you evaluate it\". Tests whether you've actually built things.",
    mechanics: [
      {
        h: "The difference, concretely",
        body: "Theory: \"What is regularization?\" → \"A penalty that constrains the model to prevent overfitting.\"\n\nPractical: \"Your model overfits. Walk me through what you'd do.\" → \"First confirm it's overfitting and not leakage, by checking the train/val gap and auditing the split. Then in order: more data, then L2, then reduce capacity, then early stopping — measuring the validation curve after each so I know which one actually moved it.\"\n\nSame knowledge. The practical version has a SEQUENCE, a CHECK, and a MEASUREMENT. That's what \"practical\" means.",
      },
      {
        h: "The universal practical answer shape",
        body: "\"It depends on ___. Here's how I'd decide: ___. The tradeoff is ___.\"\n\nAlmost every practical question fits that template. Practise the switch between theory-mode and practical-mode answers — it's exactly what this round tests.",
      },
      {
        h: "The reflexes that read as \"has actually done this\"",
        body: "• Asked for an approach → propose the simple baseline FIRST, then justify complexity.\n• Asked about a metric → ask about class balance and the cost of each error type.\n• Asked why a model fails → diagnose bias vs variance from the train/val gap BEFORE prescribing.\n• Asked to choose a model → \"it depends on ___; here's how I'd decide; the tradeoff is ___.\"\n• Given an accuracy number → ask for the baseline and the denominator.\n• Don't know something → \"I haven't used that directly. My understanding is X, I'd expect Y because Z. Is that right?\"",
      },
    ],
    keyInsight: "The practical questions are where applied experience helps and where memorized theory collapses. They can't be answered from a definition — they need a decision, a tradeoff, and ideally a number.",
    questions: [
      { level: "Practice", q: "Take any concept and give BOTH its theory answer and its practical answer.", a: "Example — cross-entropy. Theory: 'It's the negative log-likelihood under a Bernoulli model; it punishes confident wrong predictions toward infinity.' Practical: 'If my classifier's loss goes to NaN, I check for log(0) — I'd add an epsilon or use BCEWithLogitsLoss, which fuses the sigmoid and the loss for numerical stability rather than computing them separately.'" },
      { level: "Practice", q: "\"Your model does X, debug it\" — build the habit.", a: "Every debugging answer should be an ORDERED list with a reason for the order, usually by frequency: check the cheapest and most common cause first. 'Loss is NaN' → check the data for NaN/inf first (cheapest), then halve the learning rate (most common), then gradient clipping, then look for log(0) or division by zero in a custom loss." },
    ],
    sayOutLoud: "Take any concept and give me both its theory answer and its practical answer.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "linreg",
    n: 5,
    group: "Common algorithms",
    emoji: "📈",
    title: "Linear Regression",
    color: "#0F7A5A", bg: "#E2F5EF",
    oneLiner: "Fit w·x + b by minimizing squared error. The baseline you should always try first.",
    intuition: "You have dots on a graph — house size against price. You draw the straight line that best fits through them. New house? Read the price off the line.\n\nWith more features it's a plane or hyperplane instead of a line, but the idea is identical: find the flat surface closest to all the data points.",
    mechanics: [
      { h: "Model", body: "ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b, or compactly ŷ = w·x + b." },
      { h: "Loss — Mean Squared Error", body: "L = (1/n)·Σ(yᵢ − ŷᵢ)². Squaring makes errors positive and punishes big misses hard." },
      {
        h: "Two ways to solve it — know both",
        body: "1. NORMAL EQUATION (closed form): w = (XᵀX)⁻¹Xᵀy. Exact, one shot, no learning rate, no iterations. But inverting a d×d matrix costs O(d³), so it's impractical beyond a few thousand features, and it FAILS if XᵀX is singular (perfectly collinear features). Ridge fixes the singularity: (XᵀX + λI)⁻¹Xᵀy is always invertible.\n\n2. GRADIENT DESCENT: ∂L/∂w = −(2/n)·Σ(yᵢ − ŷᵢ)xᵢ, step downhill, repeat. Scales to huge data, works online and in mini-batches. This is what you'd actually use at scale.",
      },
      {
        h: "Assumptions (asked more often than you'd expect)",
        body: "Linearity of the relationship · independence of errors · homoscedasticity (constant error variance) · normally distributed errors (needed for confidence intervals, NOT for the point estimate) · no perfect multicollinearity.",
      },
      {
        h: "Multicollinearity — a favourite probe",
        body: "When features are correlated, individual coefficients become unstable and uninterpretable — the model can trade weight between them arbitrarily — even though PREDICTIONS stay fine. Symptom: huge coefficients that flip sign when you add data. Detect with VIF; fix with L2, PCA, or dropping features.",
      },
    ],
    code: `import numpy as np

# From scratch with gradient descent - learns y = 3x + 2
rng = np.random.default_rng(0)
X = rng.uniform(0, 10, 100)
y = 3 * X + 2 + rng.normal(0, 1, 100)

w, b, lr = 0.0, 0.0, 0.01
for _ in range(1000):
    y_pred = w * X + b
    error  = y_pred - y
    w -= lr * 2 * np.mean(error * X)     # gradient w.r.t. w
    b -= lr * 2 * np.mean(error)         # gradient w.r.t. b
print(f"learned: w={w:.2f} b={b:.2f}")   # ~ w=3, b=2

# Library
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X.reshape(-1,1), y)
print(model.coef_, model.intercept_)     # coefficient(s) and the bias TERM`,
    codeNote: "Interpretability is the whole selling point: coef_[0] = 3 means \"each extra unit of the feature adds 3 to the prediction, holding everything else constant.\" You can hand that to a business stakeholder — which is why linear models survive in regulated domains.",
    whenWhy: {
      use: "Predicting a number · the relationship is roughly linear · you want interpretability and a proper baseline.",
      dont: "The relationship is curved (though polynomial features extend it) · you're predicting a category (that's logistic regression).",
      vs: "Polynomial regression is STILL linear regression — ŷ = w₁x + w₂x² + w₃x³ + b is linear in the PARAMETERS w, which is what \"linear\" technically refers to. Common trick question.",
    },
    questions: [
      { level: "Easy", q: "How does linear regression work?", a: "It fits ŷ = w·x + b by minimizing mean squared error between predictions and targets. You can solve it exactly with the normal equation, or iteratively with gradient descent for large data." },
      { level: "Medium", q: "Why MSE and not mean absolute error?", a: "MSE is smooth and differentiable everywhere, which makes gradient descent clean, and it corresponds to maximum likelihood under Gaussian noise. Its downside is sensitivity to outliers, because squaring a large error makes it dominate. MAE is robust to outliers but has a constant gradient and is non-differentiable at zero. With heavy outliers I'd consider MAE or Huber loss, which is quadratic near zero and linear far out — the best of both." },
      { level: "Medium", q: "When would you use the normal equation vs gradient descent?", a: "Normal equation for small feature counts — it's exact and needs no tuning. Gradient descent for large feature counts or large data, because the matrix inversion is O(d³) and doesn't scale, and gradient descent works online and in mini-batches." },
      { level: "Hard", q: "Your linear regression has great training R² but the coefficients are huge and flip sign when you add data. What's wrong?", a: "Multicollinearity — correlated features. The model can trade weight between them freely, so individual coefficients are unstable, and huge magnitudes with sign flips is the classic symptom. Predictions may still be fine, but the coefficients are uninterpretable and the model is fragile. I'd add L2 regularization, which stabilizes coefficients by penalizing large weights, or reduce the correlated features with PCA or selection. I'd detect it with VIF." },
    ],
    sayOutLoud: "How linear regression works, why MSE, and the two ways to solve it.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "logreg",
    n: 6,
    group: "Common algorithms",
    emoji: "🎚️",
    title: "Logistic Regression",
    color: "#6A1B9A", bg: "#F3E5F5",
    oneLiner: "Linear model squashed through a sigmoid → a probability. It's a CLASSIFIER.",
    flag: "The single highest-value algorithm to know perfectly. It's everywhere in production and it's the bridge to neural networks.",
    intuition: "Take linear regression, but now you want a yes/no answer with a probability. Problem: w·x + b can output any number, and a probability must be between 0 and 1.\n\nSo you squash the output through an S-shaped curve — the sigmoid — that maps any real number into (0, 1). Now the output reads as \"87% likely spam.\" Pick a threshold (usually 0.5) to make the final call.\n\nDespite the name it is a CLASSIFIER, not a regression. Guaranteed trick question.",
    mechanics: [
      { h: "Model", body: "z = w·x + b, then ŷ = σ(z) = 1/(1 + e⁻ᶻ), read as P(y=1 | x).\nThe sigmoid squashes: large positive z → near 1, large negative z → near 0, z = 0 → exactly 0.5." },
      { h: "Loss — binary cross-entropy (log loss)", body: "L = −[y·log(ŷ) + (1−y)·log(1−ŷ)].\nIntuition: if the true label is 1, loss is −log(ŷ), which is ~0 when ŷ→1 and explodes toward ∞ when ŷ→0. It punishes confident wrong predictions brutally." },
      {
        h: "The gradient derivation — be able to do this on a whiteboard",
        body: "L = −[y log σ(z) + (1−y) log(1−σ(z))],   z = w·x + b\n\ndL/dŷ  = −y/ŷ + (1−y)/(1−ŷ)\ndŷ/dz  = σ(z)(1−σ(z)) = ŷ(1−ŷ)\ndL/dz  = [−y/ŷ + (1−y)/(1−ŷ)] · ŷ(1−ŷ)\n       = −y(1−ŷ) + (1−y)ŷ\n       = −y + yŷ + ŷ − yŷ\n       = ŷ − y                      ← everything cancels\ndz/dw  = x\n\n∴  dL/dw = (ŷ − y)·x    and    dL/db = (ŷ − y)\n\nThat cancellation is the reason cross-entropy pairs with sigmoid. Memorize both the result AND the fact that it cancels.",
      },
      { h: "Decision boundary", body: "w·x + b = 0 — a hyperplane. Logistic regression is a LINEAR classifier; it cannot separate XOR without engineered feature interactions." },
      { h: "Multi-class", body: "Softmax regression: p_i = e^{z_i} / Σ_j e^{z_j}, with categorical cross-entropy. The gradient is again (p − y_onehot)·x. Numerical stability trick: subtract max(z) before exponentiating." },
      { h: "Why is it called \"logistic\"?", body: "It models the LOG-ODDS as linear: log(p/(1−p)) = w·x + b. So a coefficient wⱼ means a one-unit increase in feature j multiplies the odds by e^{wⱼ}. That interpretability is why it's still everywhere in credit scoring, medicine and ad click prediction." },
    ],
    code: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))   # clip avoids overflow

def train_logistic(X, y, lr=0.1, epochs=1000):
    n, d = X.shape
    w, b = np.zeros(d), 0.0
    for _ in range(epochs):
        p  = sigmoid(X @ w + b)          # predicted probabilities
        dw = X.T @ (p - y) / n           # gradient = (pred - true) . x  <- the cancellation
        db = np.mean(p - y)
        w -= lr * dw
        b -= lr * db
    return w, b

# Library
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(C=1.0, max_iter=1000).fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]      # SCORES between 0 and 1
preds = (probs >= 0.5).astype(int)             # apply YOUR chosen threshold`,
    codeNote: "C = 1/λ — smaller C means STRONGER regularization. Inverted relative to Ridge's alpha, and a very common gotcha.",
    whenWhy: {
      use: "Binary (or multi-class) classification · you want calibrated probabilities · interpretability · a fast reliable baseline. Genuinely one of the most-used models in production.",
      dont: "The decision boundary is complex and non-linear — it can only draw a straight boundary.",
      vs: "vs LINEAR REGRESSION: same linear core, but sigmoid + cross-entropy for classification instead of raw output + MSE.\nvs SVM: both are linear classifiers; logistic gives probabilities and scales to millions of rows, SVM maximizes margin and can go non-linear via kernels but has no native probabilities.\nvs a NEURAL NETWORK: logistic regression IS a single neuron with a sigmoid activation. A network stacks them. Saying this shows you see the connection.",
    },
    whyNotMSE: {
      h: "\"Why cross-entropy and not MSE for classification?\" — top-5 most-asked. Give all THREE reasons.",
      points: [
        "CONVEXITY. With a sigmoid, MSE gives a non-convex loss surface in the parameters; log-loss is convex for logistic regression, so optimization is clean and has a unique optimum.",
        "VANISHING GRADIENT — the important one. With MSE+sigmoid the gradient contains a σ'(z) factor which is ≈0 when the model is confidently wrong, so learning STALLS exactly when it should be correcting hardest. With cross-entropy that factor cancels exactly, leaving (ŷ − y)x — the gradient is proportional to the error. Big error → big update.",
        "CORRECT LIKELIHOOD. MSE assumes Gaussian noise; a binary outcome is Bernoulli. Cross-entropy is the correct maximum-likelihood loss. (Nearly every loss in ML is a negative log-likelihood in disguise — MSE = MLE under Gaussian noise, cross-entropy = MLE under Bernoulli/Categorical. Saying this scores points.)",
      ],
    },
    questions: [
      { level: "Easy", q: "What is logistic regression?", a: "A linear model whose output is squashed through a sigmoid to produce a probability between 0 and 1, trained with cross-entropy loss, and thresholded to make a classification decision." },
      { level: "Medium", q: "Why is it called regression if it's a classifier?", a: "Because it regresses on the LOG-ODDS — it models log(p/(1−p)) as a linear function of the inputs. The output of that linear part is continuous; the classification comes from squashing it through the sigmoid and thresholding. So 'regression' refers to the linear model underneath, and the name is historical." },
      { level: "Medium", q: "Why cross-entropy and not MSE for classification?", a: "Three reasons. First, with sigmoid, MSE gives a non-convex loss surface while cross-entropy is convex, so optimization is cleaner. Second, and most important, with MSE the gradient contains a sigmoid-derivative term that vanishes when the model is confidently wrong, so learning stalls exactly when it should be correcting hardest — with cross-entropy that term cancels and the gradient is just (prediction − truth) times the input. Third, cross-entropy is the correct maximum-likelihood loss for a binary outcome, which is Bernoulli, not Gaussian." },
      { level: "Hard", q: "Derive the gradient of logistic regression.", a: "Start from L = −[y·log σ(z) + (1−y)·log(1−σ(z))] with z = w·x + b. Use dσ/dz = σ(1−σ). Then dL/dz = −y(1−ŷ) + (1−y)ŷ = ŷ − y, and dL/dw = (ŷ − y)·x. The key step is that the sigmoid derivative cancels the denominators from the log terms, leaving just prediction minus truth." },
      { level: "Hard", q: "Logistic regression can't solve XOR. Why, and what would you do?", a: "Because XOR isn't linearly separable — there's no single straight line separating the classes, and logistic regression can only draw a straight boundary. Options: engineer an interaction feature like x₁·x₂, which makes it separable in the expanded space; use a kernel method; or use a neural network with a hidden layer, which learns the non-linear boundary automatically. XOR is the canonical example of why hidden layers exist at all." },
      { level: "Hard", q: "Why would you use logistic regression when XGBoost exists?", a: "Interpretability — I can hand a regulator the coefficients and they mean something. Calibration — logistic regression produces well-calibrated probabilities out of the box, which matters when the probability feeds a downstream decision like a bid or a risk score, where 0.3 must actually mean 30%. Latency and simplicity — one dot product, trivially deployable. And as a baseline: if logistic regression gets within a point of XGBoost, the extra complexity isn't earning its keep. XGBoost isn't reliably calibrated by default, especially with heavy regularization — you'd need Platt scaling or isotonic regression on a held-out set." },
    ],
    sayOutLoud: "Why logistic regression is a classifier despite the name · why cross-entropy and not MSE, all three reasons · what the gradient is and why it cancels so cleanly.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "trees",
    n: 7,
    group: "Common algorithms",
    emoji: "🌳",
    title: "Decision Trees",
    color: "#33691E", bg: "#F1F8E9",
    oneLiner: "A flowchart of impurity-reducing yes/no splits. Readable, and high variance.",
    intuition: "A flowchart of yes/no questions, like Twenty Questions. \"Is income > 50k? → yes → Is age > 30? → yes → approve.\" Each question splits the data into purer groups until you can make a confident call. The tree LEARNS which questions to ask and in what order.",
    mechanics: [
      {
        h: "How a split is chosen",
        body: "The tree greedily picks, at each node, the single feature-and-threshold that most reduces impurity.\n\nGINI IMPURITY: G = 1 − Σpᵢ². The probability of misclassifying a random sample if you labelled it by the node's class distribution. 0 = pure, 0.5 = worst for binary.\n\nENTROPY: H = −Σpᵢ·log₂(pᵢ). Bits of uncertainty. 0 = pure, 1 = worst for binary.\n\nINFORMATION GAIN = H(parent) − weighted average of H(children). Pick the split that maximizes it.",
      },
      {
        h: "Worked example (verified — practise this)",
        body: "A node with 5 positive, 5 negative:\n  H(parent) = −(0.5·log₂0.5)·2 = 1.0\n\nSplit into left (4 pos, 1 neg) and right (1 pos, 4 neg):\n  H(child) = −(0.8·log₂0.8 + 0.2·log₂0.2) = 0.7219   (both children)\n  Weighted child entropy = 0.7219\n\n  Information gain = 1.0 − 0.7219 = 0.2781\n\nThe tree compares this against every other candidate split and takes the best.",
      },
      { h: "Gini vs entropy", body: "Nearly identical trees in practice. Gini is slightly cheaper (no logarithm); entropy slightly prefers balanced splits. Not worth agonizing over — say exactly that." },
      { h: "Regression trees", body: "Same idea, but splits minimize variance (MSE) within children, and leaves predict the mean of their samples." },
    ],
    code: `from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(
    criterion='gini',
    max_depth=4,           # THE main overfitting control
    min_samples_leaf=20    # don't make leaves from tiny noisy groups
).fit(X_train, y_train)

print(export_text(tree, feature_names=list(feature_names)))
# |--- income <= 50000.00
# |   |--- age <= 30.50
# |   |   |--- class: 0
# Readable flowchart - this interpretability is the tree's main selling point

# Demonstrating the overfitting problem:
deep = DecisionTreeClassifier(max_depth=None).fit(X_train, y_train)
print("train:", deep.score(X_train, y_train))   # ~1.0 - memorizes everything
print("val:  ", deep.score(X_val,   y_val))     # much lower - pure overfitting`,
    whenWhy: {
      use: "A human needs to read and audit the logic · mixed numeric/categorical features · non-linear relationships and interactions · you don't want to bother scaling features · fast inference.",
      dont: "You care primarily about accuracy — a single tree is unstable and overfits. Nobody uses one tree in practice; they use ensembles.",
      vs: "Cons in detail: HIGH VARIANCE — change a few training points and the whole tree structure flips. Overfits badly if unpruned. Axis-aligned splits only. Biased toward high-cardinality features.\n\nRegularize with: max_depth, min_samples_split, min_samples_leaf, max_features, cost-complexity pruning (α).",
    },
    keyInsight: "Trees don't need feature scaling because a tree only asks \"is this feature above or below a threshold?\", and that ordering is unchanged by any monotonic rescaling. Multiply a feature by a thousand and the split just moves to a thousand times the value; the partition is identical. But feature CONSTRUCTION still matters — a tree can only approximate a ratio a/b with many axis-aligned splits, so giving it the ratio directly usually helps a lot.",
    questions: [
      { level: "Easy", q: "How does a decision tree decide where to split?", a: "It picks the feature and threshold that most reduce impurity — measured by Gini or entropy, where impurity is how mixed the class labels are in a node. It greedily takes the best split at each node and recurses." },
      { level: "Medium", q: "Gini vs entropy — does it matter?", a: "Rarely. They produce nearly identical trees; entropy slightly favours more balanced splits and Gini is cheaper because it avoids the logarithm. I wouldn't spend tuning budget choosing between them." },
      { level: "Medium", q: "Why does a single decision tree overfit so easily?", a: "Because if you let it grow, it keeps splitting until every leaf is pure — effectively memorizing the training data including noise. It's a very high-variance model: change a few training points and the whole structure can flip. That's why we constrain depth and leaf size, and why in practice we use ensembles." },
      { level: "Hard", q: "How does a Random Forest fix the single-tree problem?", a: "It trains many trees, each on a bootstrap sample, and — crucially — considers only a random subset of features at each split. Then it averages or votes. The averaging reduces variance, but ONLY because the trees make different errors. That condition is the whole game. Bagging alone leaves trees quite correlated, because the same dominant feature gets chosen at the top of every tree. The random feature subsetting is what decorrelates them. If all trees were identical, averaging would achieve exactly nothing." },
      { level: "Hard", q: "Why do gradient-boosted trees still beat neural networks on tabular data?", a: "Because the inductive biases match the data. Tabular features are heterogeneous — different units, different scales, many irrelevant, often non-smooth relationships with thresholds and cliffs. Axis-aligned splits handle that natively: a tree learns 'income > 50k' as a hard boundary in one split, while a neural network has to approximate a step function with smooth activations. Neural networks are built to exploit structure — spatial locality in images, sequence in text — and tabular data has no such structure to exploit. Add that trees need almost no preprocessing and work at thousands of rows where NNs need far more." },
    ],
    sayOutLoud: "How a tree splits, why one tree overfits, and how a Random Forest fixes it — including why the randomness matters.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "svm",
    n: 8,
    group: "Common algorithms",
    emoji: "🛣️",
    title: "Support Vector Machines",
    color: "#00838F", bg: "#E0F7FA",
    oneLiner: "The boundary with the widest corridor. Kernels buy curves at the price of straight lines.",
    intuition: "You're separating two groups of points with a line. Many lines work. SVM picks the one with the WIDEST empty corridor on either side — the line as far as possible from the nearest points of both classes.\n\nThose nearest points, which touch the corridor edges, are the SUPPORT VECTORS. They alone define the boundary. Move any other point and nothing changes at all.\n\nWhy the widest corridor? A boundary that barely squeaks past your training points is fragile — new points near the edge get misclassified. Maximum breathing room generalizes best.",
    mechanics: [
      {
        h: "The margin",
        body: "With labels y ∈ {−1, +1}, the margin width is 2/||w||.\nMaximizing the margin ⟺ minimizing ½||w||² subject to yᵢ(w·xᵢ + b) ≥ 1 for all i.",
      },
      {
        h: "Soft margin — real data isn't separable",
        body: "Introduce slack ξᵢ ≥ 0:\n\n    minimize  ½||w||² + C·Σξᵢ    s.t.  yᵢ(w·xᵢ+b) ≥ 1 − ξᵢ\n\nEquivalently: minimize hinge loss Σ max(0, 1 − yᵢf(xᵢ)) + λ||w||².\n\nLarge C → heavily punish violations → narrow margin, fits training data hard → LOW bias, HIGH variance (overfits).\nSmall C → tolerate violations → wide, smooth margin → HIGHER bias, LOWER variance.\n\nSo C is inversely related to regularization strength.",
      },
      {
        h: "The kernel trick — the part they're testing",
        body: "Sometimes no straight line separates the data (imagine one class in a ring around the other). But if you lift the points into a higher dimension, a flat plane CAN separate them.\n\nThe mathematical reason it's free: the SVM's optimization, in its DUAL form, depends on the data ONLY through dot products between pairs of points — never through individual coordinates. A kernel is defined as the dot product in the mapped space: K(xᵢ,xⱼ) = φ(xᵢ)·φ(xⱼ). So anywhere the algorithm needs a dot product in the high-dimensional space, you substitute the kernel, which computes that value directly from the original points. You never need φ itself — which is what makes even an INFINITE-dimensional feature space computationally free.",
      },
      {
        h: "Kernels",
        body: "LINEAR: K = xᵢ·xⱼ. No lifting. Use for high-dimensional sparse data (text).\nPOLYNOMIAL: K = (xᵢ·xⱼ + c)^d.\nRBF / GAUSSIAN: K = exp(−γ||xᵢ−xⱼ||²). Effectively infinite dimensions. LARGE γ = each point's influence is very local = wiggly boundary = overfits. SMALL γ = smooth, nearly linear.\n\nThe pattern to remember: BOTH large C and large γ push toward overfitting.",
      },
    ],
    code: `import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import make_circles

# Concentric circles: NOT linearly separable
X, y = make_circles(n_samples=200, noise=0.1, factor=0.4, random_state=0)

linear = SVC(kernel='linear').fit(X, y)
rbf    = SVC(kernel='rbf', gamma=1.0).fit(X, y)

print("linear kernel accuracy:", linear.score(X, y))   # 0.625 - a line can't do it
print("rbf kernel accuracy   :", rbf.score(X, y))      # 1.000 - kernel handles the curve
print("support vectors:", rbf.n_support_.sum())        # 38 - only these define the boundary`,
    codeNote: "Verified output: linear 0.625, RBF 1.0. That's the kernel trick earning its keep on data a straight line literally cannot separate.",
    whenWhy: {
      use: "Small-to-medium data with MANY features — text classification is the classic case · when the number of features exceeds the number of samples · strong theoretical guarantees · memory-efficient (stores only support vectors).",
      dont: "Large datasets — training is O(n²) to O(n³), so millions of rows are impractical · you need probabilities natively (requires Platt scaling) · you don't want to tune kernel/C/γ.",
      vs: "vs LOGISTIC REGRESSION: both linear (with a linear kernel), but SVM maximizes margin and can go non-linear via kernels; logistic gives calibrated probabilities and scales far better. vs TREES/FORESTS: SVM shines in high-dimensional continuous spaces; trees shine on tabular, mixed-type, larger data. In modern practice SVM's niche has narrowed considerably — but the kernel trick is a beautiful, examinable idea, which is why it persists in interviews.",
    },
    questions: [
      { level: "Easy", q: "What does an SVM do?", a: "It finds the boundary that separates classes with the maximum margin — the widest gap to the nearest points of each class. Those nearest points are the support vectors and they alone define the boundary." },
      { level: "Medium", q: "What are support vectors?", a: "The training points on or inside the margin — the ones closest to the boundary. They're the only points that matter: the boundary is defined entirely by them, and moving any other point doesn't change it. That's also why SVMs are memory-efficient — you only store the support vectors." },
      { level: "Medium", q: "Explain the kernel trick like I'm not technical.", a: "Some data can't be split by a straight line. If you lift it into a higher dimension, a flat plane can split it — imagine points on a table you can't separate with a line, but if you lift some of them off the table you can slide a sheet of paper between. The kernel trick does that lifting implicitly, computing the result without ever actually calculating the higher-dimensional coordinates, which would be far too expensive. So you get a curved boundary at the price of a straight one." },
      { level: "Hard", q: "What do C and gamma control, and how do they relate to overfitting?", a: "C controls tolerance for margin violations: large C punishes violations hard, giving a narrow margin that fits training data tightly — low bias, high variance, risk of overfitting. Small C tolerates violations for a wider, smoother margin — more bias, less variance. Gamma, in the RBF kernel, controls how far each point's influence reaches: large gamma makes influence very local, producing a wiggly boundary that overfits; small gamma makes it smooth and nearly linear. So BOTH large C and large gamma push toward overfitting — that's the pattern to remember, and I'd tune them jointly with cross-validation." },
      { level: "Hard", q: "Why does the kernel trick work mathematically — why can you avoid the explicit mapping?", a: "Because the SVM's optimization, in its dual form, depends on the data only through dot products between pairs of points — never through the individual coordinates. A kernel function is defined as the dot product in the mapped space: K(xᵢ,xⱼ) = φ(xᵢ)·φ(xⱼ). So anywhere the algorithm needs a dot product in the high-dimensional space, you substitute the kernel, which computes that value directly from the original points. You never need φ itself, which is what makes even an infinite-dimensional feature space — like the RBF kernel's — computationally free." },
      { level: "Hard", q: "Why does maximizing the margin generalize better?", a: "Intuitively, a boundary that barely squeaks past your training points is fragile — small perturbations in new data push points across it. Maximum margin leaves the most room for error. Formally it relates to generalization bounds that depend on the margin rather than on the number of dimensions, which is why SVMs survive in high-dimensional settings where dimension-based bounds would be vacuous." },
    ],
    sayOutLoud: "What support vectors are · the kernel trick in plain words · how C and gamma each affect overfitting.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "cnn",
    n: 9,
    group: "Deep learning",
    emoji: "🖼️",
    title: "Convolutional Neural Networks",
    color: "#1565C0", bg: "#E3F2FD",
    oneLiner: "Slide small shared filters over a grid. Parameter sharing + locality + translation equivariance.",
    intuition: "A 224×224 colour image is ~150,000 numbers. Connecting all of them to even 1,000 neurons is 150 MILLION weights — for one layer. Impossible and wasteful.\n\nInstead, slide a small window (say 3×3) across the image, looking for one specific pattern — a vertical edge, say. The SAME small set of weights is reused at every position. That's parameter sharing, and it's why CNNs are efficient. It also encodes a true fact about images: a cat is still a cat whether it's top-left or bottom-right, so the same detector should work everywhere.",
    prereq: {
      h: "The neural network basics underneath",
      body: "A NEURON does three things: multiply each input by a weight, sum them (plus a bias), apply a non-linear activation. Steps 1–2 alone are exactly logistic regression.\n\nLAYERS stack neurons; each layer's output feeds the next.\n\nACTIVATION FUNCTIONS (ReLU = max(0,x) is the default) are MANDATORY: without a non-linearity, stacked layers collapse into a single linear layer with no more power than one. Proof: y = W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂) = W'x + b'. The bend is what lets networks learn curves.\n\nBACKPROPAGATION computes how much each weight contributed to the error, working backward via the chain rule; gradient descent then nudges each weight. Automated blame assignment.\n\n\"DEEP\" just means several hidden layers.",
    },
    mechanics: [
      {
        h: "The three ideas",
        body: "1. LOCAL CONNECTIVITY — a pixel relates most to nearby pixels, so a neuron looks at a small local window, not the whole image.\n2. PARAMETER SHARING — the same filter is slid across the entire image. One set of weights, reused everywhere. This is where the huge savings come from.\n3. TRANSLATION EQUIVARIANCE — because the filter is applied everywhere, a feature is detected wherever it appears. (Full translation INVARIANCE comes from pooling.)",
      },
      {
        h: "The arithmetic you WILL be asked to compute",
        body: "    Output size  = floor((W − K + 2P) / S) + 1\n    Params/layer = (K × K × C_in + 1) × C_out        (the +1 is the bias)\n\nwhere W = input width, K = kernel size, P = padding, S = stride, C_in/C_out = input/output channels.",
      },
      {
        h: "Worked examples (all verified — practise until instant)",
        body: "• Input 32×32, kernel 3×3, padding 1, stride 1 → (32−3+2)/1+1 = 32. Same size (\"same\" padding).\n• Input 32×32, kernel 3×3, padding 0, stride 1 → (32−3)/1+1 = 30. Shrinks.\n• Input 224, kernel 7×7, padding 3, stride 2 → (224−7+6)/2+1 = 112. Halved by the stride.\n• Params for 3×3, 3 input channels, 16 filters: (3·3·3+1)·16 = 448.\n  Compare a dense layer doing the same input→output: ~50 million. That's the point.",
      },
      {
        h: "The pieces",
        body: "PADDING = a border of zeros so the output doesn't shrink. \"Same\" padding = (K−1)/2 for stride 1.\nSTRIDE = how far the filter jumps each step. Stride 2 halves the output.\nPOOLING (max-pool 2×2, stride 2) = keep the strongest activation in each region, halving spatial size, ZERO parameters, adds small translation tolerance. Average pooling smooths.\nGLOBAL AVERAGE POOLING replaces the giant flatten+dense head with one number per channel — VGG's 7×7×512 → 4096 head was ~100M parameters, the majority of the model and where most overfitting lived. GAP also makes the network input-size agnostic.\nRECEPTIVE FIELD = the input region influencing one output unit. Grows with depth, stride and dilation.\n1×1 CONVOLUTION = mixes channels only. Cheap dimensionality reduction (bottlenecks in ResNet/Inception).\nDEPTHWISE SEPARABLE (MobileNet) = per-channel spatial conv then a 1×1 pointwise conv. ~8–9× cheaper for 3×3.",
      },
      {
        h: "Typical architecture",
        body: "[Conv → ReLU → Conv → ReLU → Pool] × several → Flatten (or Global Average Pool) → Dense → Softmax.\n\nEarly layers learn edges and colour patches; middle layers learn textures and parts; late layers learn objects. Nobody programmed an \"eye detector\" — it emerged because building one reduced the loss. The network learns the FEATURES itself, which is the best one-line answer to \"why deep learning?\"",
      },
    ],
    code: `# Verify output size by hand BEFORE writing the Linear layer:
def conv_out(W, K, P, S): return (W - K + 2*P)//S + 1

size = 32
size = conv_out(size, 3, 1, 1)   # 32 after conv1
size = size // 2                 # 16 after pool1
size = conv_out(size, 3, 1, 1)   # 16 after conv2
size = size // 2                 #  8 after pool2
print(size)                      # 8  -> Linear input is 32*8*8

import torch.nn as nn
cnn = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1),   # 3 in-channels -> 16 filters
    nn.ReLU(),
    nn.MaxPool2d(2),                              # halve spatial size
    nn.Conv2d(16, 32, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(32 * 8 * 8, 10)                     # 32x32 input -> 8x8 after two pools
)`,
    resnet: {
      h: "ResNet — the one architecture to know by name",
      body: "The innovation is the RESIDUAL (skip) connection: the input to a block is added directly to its output, y = F(x) + x. Two reasons it matters:\n\nBACKWARD: the derivative of F(x)+x with respect to x includes an additive +1 term, so the gradient has a direct path to earlier layers that isn't multiplied down by intermediate weights. That's the vanishing-gradient fix.\n\nFORWARD: the block only has to learn a residual CORRECTION, and \"change nothing\" (F=0) is easy to learn, whereas learning the identity through a stack of weight matrices is hard.\n\nName the problem precisely: ResNet solved the DEGRADATION problem — deeper plain networks had HIGHER TRAINING error, not just worse test error. That's not overfitting, it's an optimization failure. That distinction is the whole point of the paper. Before ResNet ~20 layers was the practical limit; after, 100+ became routine.",
    },
    architectures: [
      { name: "LeNet-5 (1998)", note: "Digits. The original." },
      { name: "AlexNet (2012)", note: "ReLU, dropout, GPUs. Started the deep learning era." },
      { name: "VGG-16", note: "Uniform 3×3 stacks. Simple, huge, slow." },
      { name: "Inception/GoogLeNet", note: "Parallel multi-scale branches, 1×1 bottlenecks." },
      { name: "ResNet", note: "Residual connections. THE most-asked CNN question." },
      { name: "DenseNet", note: "Every layer connects to all subsequent layers." },
      { name: "EfficientNet", note: "Compound scaling of depth/width/resolution." },
      { name: "U-Net", note: "Encoder-decoder with skip connections. Workhorse of segmentation and later diffusion models." },
      { name: "Vision Transformer (ViT)", note: "Image → 16×16 patches as tokens → Transformer. Weaker inductive bias, so needs more data or heavy pretraining, but scales better." },
    ],
    visionTasks: {
      h: "Vision tasks and their metrics",
      body: "CLASSIFICATION → one label per image.\nOBJECT DETECTION → boxes + classes. Two-stage: R-CNN → Fast → Faster R-CNN (Region Proposal Network). One-stage: YOLO, SSD, RetinaNet (introduced focal loss for the extreme background/foreground imbalance). DETR uses a Transformer with set prediction and no NMS.\nSEGMENTATION → semantic (label every pixel by class), instance (separate objects — Mask R-CNN adds RoIAlign + a mask head), panoptic (both).\n\nMETRICS: IoU = intersection/union of boxes. mAP = mean over classes of average precision, typically at IoU 0.5 or averaged over 0.5:0.95. NMS (non-max suppression) removes duplicate boxes: sort by confidence, keep the top box, drop everything overlapping it above an IoU threshold, repeat.\n\nVIDEO adds the time axis: 3D convs, two-stream (RGB + optical flow), or video Transformers.",
    },
    questions: [
      { level: "Easy", q: "Why use a CNN instead of a fully-connected network for images?", a: "Three reasons: parameter sharing, so the same filter is reused across the image instead of learning separate weights per pixel — massively fewer parameters; local connectivity, since nearby pixels are what matter; and translation equivariance, so a feature is detected wherever it appears. A dense layer on a 224×224 image would need hundreds of millions of weights and would have to relearn every pattern at every location." },
      { level: "Medium", q: "Compute the output size and parameter count. [32×32 input, 3×3 kernel, padding 1, stride 1, 16 filters]", a: "Output = (32 − 3 + 2·1)/1 + 1 = 32, so 32×32×16. Parameters = (3·3·3 + 1)·16 = 448. Formulas: (W − K + 2P)/S + 1 and (K·K·C_in + 1)·C_out." },
      { level: "Medium", q: "What does pooling do and why?", a: "Max pooling keeps the strongest activation in each small region, reducing spatial size and computation, and adding a little translation invariance — a feature shifted by one pixel still registers. It has no parameters. Global average pooling at the end replaces a huge flatten-plus-dense head with one value per channel, cutting parameters dramatically and making the network input-size agnostic." },
      { level: "Hard", q: "Why do residual connections let you train deeper networks?", a: "Two things. On the backward pass, the derivative of y = F(x) + x with respect to x includes an additive 1 term, so the gradient has a direct path to earlier layers that isn't multiplied down — that's the vanishing gradient fix. On the forward side, the block only has to learn a residual correction rather than a full transformation, and learning 'change nothing' is easy whereas learning the identity through a stack of weight matrices is hard. The problem ResNet actually solved is worth naming precisely: deeper plain networks had higher TRAINING error, not just worse test error — that's an optimization failure, not overfitting." },
      { level: "Hard", q: "Why stack two 3×3 convolutions instead of one 5×5?", a: "Same receptive field, fewer parameters, more non-linearity. Two 3×3 layers cover a 5×5 region. Parameters per channel pair: 2×9 = 18 versus 25, about 28% fewer, and the gap widens for larger kernels. And you get two activation functions instead of one, so the composed function is more expressive. That's the core insight of VGG and why 3×3 became the default. You'd use a larger kernel in the very first layer, where you want a large receptive field on raw pixels quickly and the channel count is low — ResNet uses 7×7 stride 2 at the stem." },
      { level: "Hard", q: "You're fine-tuning a pretrained CNN. Which layers do you freeze?", a: "It depends on data volume and domain distance. Early layers learn generic features — edges, textures, colours — which transfer almost universally; later layers learn task-specific compositions. Small dataset, similar domain: freeze almost everything, train only the head, or you'll overfit immediately. Large dataset, similar domain: fine-tune everything with a low learning rate. Small dataset, distant domain: freezing early layers still helps because edges are edges, but later layers are learning the wrong things — I'd unfreeze more and use a discriminative learning rate, smaller for early layers. And always train the head for a few epochs BEFORE unfreezing anything, because a randomly-initialized head sends large meaningless gradients into carefully-trained features." },
    ],
    sayOutLoud: "Why CNNs over dense nets — the three reasons · the output-size and parameter-count formulas applied to a made-up example · why residual connections work.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "rnn",
    n: 10,
    group: "Deep learning",
    emoji: "🔁",
    title: "Recurrent Neural Networks (and LSTM/GRU)",
    color: "#AD1457", bg: "#FCE4EC",
    oneLiner: "Carry a hidden state through a sequence. Vanishing gradients kill long-range memory; LSTM's additive cell state fixes it.",
    intuition: "CNNs are for grids. RNNs are for SEQUENCES, where order matters — text, speech, time series.\n\nThe idea: read one element at a time, and carry a MEMORY (hidden state) forward that summarizes everything seen so far. When you read the next word, you combine it with the memory of the previous words.\n\n\"The cat sat on the ___\" — to predict \"mat\" you need to have remembered \"cat\" and \"sat\". The hidden state is that running memory.",
    mechanics: [
      {
        h: "The recurrence",
        body: "h_t = tanh(W_hh·h_{t−1} + W_xh·x_t + b),   y_t = W_hy·h_t\n\nThe SAME weights (W_hh, W_xh) are reused at every timestep — parameter sharing across TIME, analogous to a CNN sharing filters across space. This lets an RNN handle variable-length sequences.",
      },
      {
        h: "Training — BPTT, and the fatal flaw",
        body: "Backpropagation Through Time: unroll the network across timesteps and backpropagate. Because the same W_hh is multiplied at every step, the gradient contains W_hh raised to a power.\n\nVANISHING/EXPLODING GRADIENTS. If the recurrent weight's influence is <1, repeated multiplication shrinks the gradient exponentially → early timesteps get no learning signal → the RNN can't learn dependencies beyond roughly 10–20 steps. If >1, gradients explode to NaN (fix: gradient clipping).\n\n\"I grew up in France… [40 words] … so I speak fluent ___.\" The answer is French, but by 40 words later the memory of France has decayed to nothing. Vanilla RNNs simply fail here.\n\nTruncated BPTT limits the unroll length to bound the cost.",
      },
      {
        h: "LSTM — the fix",
        body: "Adds a CELL STATE C_t — a memory conveyor belt running through the whole sequence with only ADDITIVE interactions, so gradients survive. Three gates, each a sigmoid producing values in (0,1) that act as soft switches:\n\n    f_t = σ(W_f·[h_{t−1}, x_t] + b_f)      forget gate:  what to erase from the cell\n    i_t = σ(W_i·[h_{t−1}, x_t] + b_i)      input gate:   how much new info to write\n    C̃_t = tanh(W_C·[h_{t−1}, x_t] + b_C)   candidate:    what the new info is\n    C_t = f_t ⊙ C_{t−1} + i_t ⊙ C̃_t        cell update   (⊙ = elementwise)\n    o_t = σ(W_o·[h_{t−1}, x_t] + b_o)      output gate\n    h_t = o_t ⊙ tanh(C_t)                  hidden state\n\nThe line to say: \"The cell state is updated additively and gated, so the gradient path through memory is multiplied by the FORGET GATE rather than by a weight matrix raised to a power — so it doesn't vanish exponentially.\"",
      },
      {
        h: "GRU",
        body: "A simplified LSTM: two gates instead of three, no separate cell state.\n\n    z_t = σ(W_z·[h_{t−1}, x_t])            update gate (merges forget+input)\n    r_t = σ(W_r·[h_{t−1}, x_t])            reset gate\n    h̃_t = tanh(W·[r_t ⊙ h_{t−1}, x_t])\n    h_t = (1 − z_t) ⊙ h_{t−1} + z_t ⊙ h̃_t\n\n~25% fewer parameters, trains faster, roughly comparable accuracy. Lean GRU on smaller data, LSTM on larger.",
      },
      {
        h: "Bidirectional RNN & seq2seq",
        body: "BIDIRECTIONAL: run one RNN forward and one backward, concatenate. Only valid when the WHOLE sequence is available up front — not for streaming or generation.\n\nSEQ2SEQ: an encoder RNN compresses the input into ONE fixed context vector; a decoder RNN generates from it. The bottleneck is obvious — one vector cannot hold a 50-word sentence.\n\nATTENTION (Bahdanau, 2014) was invented to fix exactly this: let the decoder look back at ALL encoder hidden states at each output step, weighted by relevance. That removed the bottleneck, gave interpretable alignment maps, and set up the Transformer.",
      },
    ],
    code: `import torch.nn as nn

class SeqModel(nn.Module):
    def __init__(self, vocab, embed=128, hidden=256, classes=2):
        super().__init__()
        self.embed = nn.Embedding(vocab, embed)
        self.lstm  = nn.LSTM(embed, hidden, batch_first=True)
        self.fc    = nn.Linear(hidden, classes)

    def forward(self, x):
        x = self.embed(x)
        out, (h_n, c_n) = self.lstm(x)   # h_n = final hidden state
        return self.fc(h_n[-1])          # classify from the last hidden state

# Swapping LSTM -> GRU is a one-line change:
# self.gru = nn.GRU(embed, hidden, batch_first=True)

# The classic RNN fix for EXPLODING gradients - gradient clipping:
loss.backward()
nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)   # cap the gradient
optimizer.step()`,
    whenWhy: {
      use: "Sequential data — historically text, speech, time series. Still reasonable for streaming/online settings and small sequential problems.",
      dont: "Most modern sequence work — reach for a Transformer.",
      vs: "Say this, because it shows you're current: RNNs have been LARGELY REPLACED by Transformers. Two reasons: (1) RNNs are inherently SEQUENTIAL — word 100 can't be processed until word 99 is done — so they can't parallelize across a sequence, making training slow and capping how much data you can train on. (2) Even LSTMs degrade over very long dependencies, while attention gives every position direct access to every other position regardless of distance. They still appear in interviews as fundamentals, and because the vanishing-gradient story is so instructive.",
    },
    compare: {
      headers: ["", "RNN / LSTM", "Transformer"],
      rows: [
        ["Processes sequence", "One step at a time (sequential)", "All at once (parallel)"],
        ["Long-range memory", "Weak (LSTM better, still limited)", "Excellent (direct attention)"],
        ["Training speed", "Slow — can't parallelize over time", "Fast — parallelizes across GPUs"],
        ["Complexity in length n", "O(n) sequential steps", "O(n²) attention, but parallel"],
        ["Status", "Largely superseded", "Dominant"],
      ],
    },
    questions: [
      { level: "Easy", q: "What is an RNN and what is it for?", a: "A neural network for sequences. It reads one element at a time and carries a hidden state — a running memory — forward, reusing the same weights at each step. That lets it handle variable-length sequences like text or time series." },
      { level: "Medium", q: "Why do vanilla RNNs struggle with long sequences?", a: "Vanishing gradients. Training backpropagates through time, and because the same recurrent weight matrix is multiplied at every step, the gradient either shrinks exponentially or explodes. When it shrinks, early timesteps receive almost no learning signal, so the network can't learn dependencies more than roughly ten to twenty steps apart. It literally forgets the beginning of a long sequence." },
      { level: "Medium", q: "How does an LSTM fix that?", a: "It adds a cell state — a memory path through the sequence with additive, gated updates. Because the memory is updated additively and controlled by a forget gate rather than passed through a weight matrix raised to a power, the gradient along it doesn't vanish exponentially. Three gates — forget, input, output — decide what to erase, write, and expose. That lets it retain information across much longer spans." },
      { level: "Hard", q: "LSTM vs GRU — when would you pick each?", a: "GRU has two gates instead of three and no separate cell state, so fewer parameters and faster training, with roughly comparable accuracy. I'd lean GRU on smaller datasets or when compute is tight, and LSTM on larger datasets where its extra expressiveness can pay off. Honestly, for most new sequence work I'd reach for a Transformer first — but between the two recurrent options, that's the tradeoff." },
      { level: "Hard", q: "Why did Transformers replace RNNs?", a: "Two reasons. First, RNNs are inherently sequential — each step depends on the previous hidden state — so you can't parallelize computation across the sequence, which makes training slow and caps how much data you can train on. Transformers process every position simultaneously, which is what made internet-scale training feasible. Second, even LSTMs degrade over very long dependencies, while attention gives every position direct access to every other position regardless of distance. So Transformers won on both speed and long-range modelling." },
    ],
    sayOutLoud: "Why vanilla RNNs fail on long sequences · how an LSTM's cell state fixes the gradient problem · why Transformers replaced RNNs.",
  },
];

// ─── THE FORMULAS TO HAVE MEMORIZED ─────────────────────────────────────────
export const FORMULA_SHEET = [
  { name: "Sigmoid", f: "σ(z) = 1/(1+e⁻ᶻ)" },
  { name: "Sigmoid derivative", f: "σ'(z) = σ(z)(1−σ(z))" },
  { name: "Logistic gradient", f: "∂L/∂w = (ŷ − y)·x" },
  { name: "Gradient descent", f: "w ← w − η·∇L" },
  { name: "Bias-variance", f: "Error = Bias² + Variance + Irreducible noise" },
  { name: "Entropy", f: "H = −Σ pᵢ·log₂(pᵢ)" },
  { name: "Gini impurity", f: "G = 1 − Σ pᵢ²" },
  { name: "Information gain", f: "H(parent) − weighted Σ H(children)" },
  { name: "SVM margin", f: "maximize 2/||w||  ⟺  minimize ½||w||²" },
  { name: "Conv output size", f: "(W − K + 2P)/S + 1" },
  { name: "Conv params", f: "(K·K·C_in + 1)·C_out" },
  { name: "Precision", f: "TP/(TP+FP)" },
  { name: "Recall (= TPR)", f: "TP/(TP+FN)" },
  { name: "FPR", f: "FP/(FP+TN)" },
  { name: "F1", f: "2·P·R/(P+R)" },
  { name: "Attention", f: "softmax(QKᵀ/√d_k)·V" },
  { name: "Binary cross-entropy", f: "−[y·log ŷ + (1−y)·log(1−ŷ)]" },
  { name: "MSE", f: "(1/n)·Σ(y − ŷ)²" },
];

// ─── ALGORITHM ONE-LINERS (integrated cheat sheet) ──────────────────────────
export const ALGO_ONELINERS = {
  headers: ["Algorithm", "One sentence", "Use when", "Key weakness"],
  rows: [
    ["Linear regression", "Fits w·x+b to minimize squared error", "Predicting a number, want interpretability", "Only linear relationships"],
    ["Logistic regression", "Linear model + sigmoid → probability, for classification", "Binary classification, want probabilities + interpretability", "Only linear boundaries"],
    ["Decision tree", "Flowchart of impurity-reducing splits", "Need readable, auditable logic", "One tree overfits badly"],
    ["Random Forest", "Many decorrelated trees averaged", "Tabular data, reliable accuracy, low tuning", "Less interpretable"],
    ["Gradient boosting", "Sequential trees each fixing prior errors", "Tabular data, maximum accuracy", "Sensitive to noise, needs tuning"],
    ["SVM", "Maximum-margin boundary; kernels for non-linearity", "Small data, many features", "Doesn't scale past ~100k rows"],
    ["kNN", "Vote among the k closest stored points", "Simple baseline; similarity is meaningful", "Slow at predict time; curse of dimensionality"],
    ["k-means", "Assign to nearest centroid, recentre, repeat", "Unlabelled data, want groups", "Must pick k; spherical clusters only"],
    ["PCA", "Project onto directions of maximum variance", "Too many features; visualization", "Linear only; components uninterpretable"],
    ["Naive Bayes", "Multiply per-feature likelihoods under an independence assumption", "Text classification, need speed", "Independence assumption; poor calibration"],
    ["CNN", "Shared filters detect local patterns", "Images, grid data", "Needs lots of data"],
    ["RNN / LSTM", "Carries memory across a sequence", "Sequential data", "Slow, weak long-range; superseded by Transformers"],
    ["Transformer", "Every position attends to every position, in parallel", "Text, generation, and increasingly everything", "O(n²) in sequence length"],
  ],
};

export const WHY_THIS_NOT_THAT = [
  { pair: "Linear vs logistic regression", answer: "Same linear core; logistic adds a sigmoid + cross-entropy for classification." },
  { pair: "Logistic regression vs SVM", answer: "Logistic gives calibrated probabilities and scales to millions of rows; SVM maximizes margin and kernels for non-linearity but is O(n²)–O(n³) to train." },
  { pair: "Logistic regression vs neural net", answer: "Logistic regression IS one sigmoid neuron; a network stacks them with non-linearities between." },
  { pair: "Single tree vs Random Forest", answer: "One tree is high-variance; the forest averages DECORRELATED trees to cut variance. The decorrelation (random feature subsets) is the mechanism, not a detail." },
  { pair: "Random Forest vs boosting", answer: "RF = parallel, independent, reduces VARIANCE, robust to noisy labels. Boosting = sequential, error-correcting, reduces BIAS, chases label noise, needs tuning." },
  { pair: "Trees vs deep learning on tabular", answer: "Trees win — heterogeneous, non-smooth features with hard thresholds suit axis-aligned splits; deep learning needs structure (spatial/sequential) to exploit." },
  { pair: "CNN vs dense net", answer: "CNN shares parameters and assumes locality — far fewer weights and the correct inductive bias for images." },
  { pair: "RNN vs Transformer", answer: "RNN is sequential and forgetful; Transformer is parallel and long-range. Transformer wins on both speed and quality." },
  { pair: "Bagging vs boosting", answer: "Bagging trains strong learners independently in parallel and averages (variance ↓). Boosting trains weak learners sequentially, each fixing the last's errors (bias ↓)." },
  { pair: "k-means vs DBSCAN", answer: "k-means needs k and assumes spherical clusters; DBSCAN is density-based, finds arbitrary shapes, needs no k, and labels outliers as noise — but needs ε and minPts tuned." },
  { pair: "PCA vs feature selection", answer: "PCA recombines features into variance-maximizing directions, keeping information but destroying interpretability. Selection keeps original features. Max variance ≠ max usefulness — a low-variance feature can be the discriminative one." },
];
