// ─── ML FOUNDATIONS ─────────────────────────────────────────────────────────
// Vocabulary, the terminology trap, the math you actually need, gradient descent,
// loss functions, splits/CV/leakage, regularization, optimizers, normalization.

// ── The terminology trap: the same word means different things ──────────────
export const TERMINOLOGY_TRAP = {
  intro: "Most beginner confusion in ML is vocabulary, not concepts. Several words mean completely different things depending on context, and nobody flags the switch. Read this before anything else.",
  headers: ["Term", "Meaning 1", "Meaning 2", "Meaning 3"],
  rows: [
    ["Bias", "The b in y = wx + b — a number added to shift the output", "Error from oversimplified assumptions (the bias-variance sense)", "Unfairness toward a group of people"],
    ["Regression", "Predicting a continuous number", "…but \"logistic regression\" is a CLASSIFIER", "—"],
    ["Sample", "One data point / one row", "A subset of the data (\"sample the dataset\")", "—"],
    ["Variance", "The statistical spread of a variable", "How much the model changes if retrained on different data (bias-variance sense)", "—"],
    ["Normalization", "Rescaling features to a range", "Batch/Layer norm inside a network", "Making probabilities sum to 1"],
    ["Parameters", "Weights the model learns", "…but \"hyperparameters\" are settings you choose", "—"],
    ["Loss / Cost / Error", "Used interchangeably", "(Some texts: loss = one example, cost = averaged)", "—"],
    ["Validation set", "Used to tune during development", "…but \"cross-validation\" splits the training data", "—"],
    ["Model", "The algorithm type (\"a decision tree\")", "The trained artifact with specific weights", "—"],
  ],
  keyLine: "In bias-variance, BIAS means error from wrong or oversimplified assumptions. It has nothing to do with the b in y = wx + b.",
};

// ── Glossary ────────────────────────────────────────────────────────────────
export const GLOSSARY = [
  {
    group: "Data", items: [
      ["Sample / instance / row", "One thing you're predicting about"],
      ["Feature", "One input variable"],
      ["Feature vector", "All features of one sample, as a list of numbers"],
      ["Label / target / y", "The correct answer you want to predict"],
      ["Ground truth", "Verified correct labels"],
      ["Train / validation / test", "Fit / tune / final honest score"],
    ]
  },
  {
    group: "Model", items: [
      ["Parameters", "Numbers the model learns by itself (weights, biases)"],
      ["Hyperparameters", "Settings you choose before training (learning rate, depth, k)"],
      ["Weight", "How much an input matters, and in which direction"],
      ["Bias term", "The constant added at the end (b in wx + b)"],
      ["Inference", "Using a trained model to predict (as opposed to training it)"],
    ]
  },
  {
    group: "Training", items: [
      ["Loss / cost / error", "One number for how wrong the model currently is"],
      ["Loss function", "The specific formula that computes it"],
      ["Gradient", "Direction and steepness of increasing loss"],
      ["Gradient descent", "Repeatedly stepping downhill on the loss"],
      ["Learning rate", "Step size. The single most important hyperparameter"],
      ["Epoch", "One full pass through the training data"],
      ["Batch / mini-batch", "Group of samples processed before one weight update"],
      ["Iteration / step", "One weight update"],
      ["Convergence", "The loss has stopped improving"],
      ["Backpropagation", "Computing gradients backward through a network via the chain rule"],
    ]
  },
  {
    group: "Generalization", items: [
      ["Overfitting", "Memorized training data; big train/val gap"],
      ["Underfitting", "Too simple; both scores bad"],
      ["Bias (bias-variance)", "Error from oversimplified assumptions → underfitting"],
      ["Variance (bias-variance)", "Sensitivity to which training data you saw → overfitting"],
      ["Irreducible error", "Noise in the world; unfixable"],
      ["Regularization", "Deliberately constraining the model to prevent memorization"],
      ["Double descent", "Test error falls, spikes at the interpolation threshold, then falls again"],
      ["Data leakage", "Test or future information reaching training"],
      ["Curse of dimensionality", "As dimensions grow, data becomes sparse and all points roughly equidistant"],
    ]
  },
  {
    group: "Metrics", items: [
      ["TP / FP / FN / TN", "The four confusion-matrix cells"],
      ["TPR", "TP/(TP+FN). Also called recall, sensitivity, hit rate"],
      ["FPR", "FP/(FP+TN). Also called fall-out, 1 − specificity"],
      ["Precision", "TP/(TP+FP). Of what I flagged, how much was right"],
      ["Specificity (TNR)", "TN/(TN+FP)"],
      ["F1", "Harmonic mean of precision and recall"],
      ["Threshold", "The score cutoff converting a probability into a decision"],
      ["ROC curve", "TPR vs FPR across all thresholds"],
      ["AUC", "Area under ROC; probability a random positive scores above a random negative"],
      ["PR curve", "Precision vs recall; preferred under heavy imbalance"],
      ["Calibration", "Whether a predicted 0.7 actually happens 70% of the time"],
    ]
  },
  {
    group: "Neural networks", items: [
      ["Neuron", "Multiply inputs by weights, sum, apply an activation"],
      ["Activation function", "The non-linear bend (ReLU, sigmoid, tanh, GELU)"],
      ["ReLU", "max(0, x). The default hidden-layer activation"],
      ["Softmax", "Turns a list of scores into probabilities summing to 1"],
      ["Hidden layer", "Any layer between input and output"],
      ["Deep learning", "A neural network with several hidden layers"],
      ["Vanishing gradient", "The learning signal shrinks to nothing in early layers"],
      ["Dropout", "Randomly disable neurons during training"],
      ["Batch norm / layer norm", "Rescale activations to keep them in a healthy range"],
      ["Residual / skip connection", "Add the input to the output so gradients flow freely"],
    ]
  },
];

// ── The math you actually need ──────────────────────────────────────────────
export const MATH = [
  {
    h: "Vectors, dot products, matrices",
    body: "A VECTOR is a list of numbers: x = [x₁, ..., xₙ]. One data point = one vector.\n\nDOT PRODUCT: w·x = w₁x₁ + ... + wₙxₙ. One number. It measures ALIGNMENT: large positive = same direction, zero = perpendicular, negative = opposite.\n\nEvery linear model in ML is a dot product. prediction = w·x + b. The whole of linear regression, logistic regression, and one neuron of a neural net is this.\n\nMATRIX MULTIPLICATION: (m×n)·(n×p) = (m×p). Inner dimensions must match. A layer taking a batch of 32 samples with 100 features into 64 units is (32×100)·(100×64) = (32×64).\n\nNORMS: L2 norm ||w||₂ = √(Σwᵢ²) = length. L1 norm ||w||₁ = Σ|wᵢ|. These two show up as regularizers.",
  },
  {
    h: "Derivatives and gradients — the engine of ML",
    body: "A DERIVATIVE df/dx answers: if I nudge x a tiny bit, how much does f change, and in which direction?\n\nA GRADIENT ∇f is the vector of derivatives with respect to every parameter: [∂f/∂w₁, ∂f/∂w₂, ...]. It points in the direction of STEEPEST INCREASE.\n\nTherefore gradient descent walks in the OPPOSITE direction:\n\n    w ← w − η·∇_w L        (η = eta = learning rate)\n\nCHAIN RULE — the single most important formula in deep learning: if y = f(g(x)) then dy/dx = f'(g(x))·g'(x). Backpropagation is nothing but the chain rule applied repeatedly, backward through the layers.",
    table: {
      headers: ["Function", "Derivative"],
      rows: [
        ["x²", "2x"],
        ["eˣ", "eˣ"],
        ["ln(x)", "1/x"],
        ["σ(x) = 1/(1+e⁻ˣ)", "σ(x)(1−σ(x))"],
        ["tanh(x)", "1 − tanh²(x)"],
        ["ReLU(x) = max(0,x)", "1 if x>0 else 0"],
      ],
    },
  },
  {
    h: "Probability",
    body: "CONDITIONAL: P(A|B) = P(A∩B)/P(B).\n\nBAYES' THEOREM: P(A|B) = P(B|A)·P(A) / P(B). Read as: posterior ∝ likelihood × prior. Underpins Naive Bayes and is a classic warm-up.\n\nEXPECTATION: E[X] = Σ xᵢ·P(xᵢ) — the long-run average.\nVARIANCE: Var(X) = E[(X − E[X])²] — how spread out.\nINDEPENDENCE: P(A∩B) = P(A)P(B).\n\nMAXIMUM LIKELIHOOD (MLE): pick the parameters that make the observed data most probable. Nearly every loss function in ML is a negative log-likelihood in disguise: MSE = MLE under Gaussian noise; cross-entropy = MLE under a Bernoulli/Categorical model. Say this when asked \"why this loss?\" — it scores.",
  },
  {
    h: "Why we use log",
    body: "Probabilities of many independent events MULTIPLY, and multiplying thousands of numbers < 1 underflows to zero. Taking a log turns products into SUMS, which are numerically stable and easy to differentiate. Hence log-likelihood, log-loss, log-softmax.",
  },
  {
    h: "The classic Bayes interview problem",
    body: "\"A test is 99% accurate; the disease affects 1 in 10,000. You test positive. What's the probability you have it?\"\n\n    P = (0.99 × 0.0001) / (0.99 × 0.0001 + 0.01 × 0.9999)\n      ≈ 0.0098  ≈ 1%\n\nThe BASE RATE dominates. With a rare condition, the false positives from the huge healthy population swamp the true positives. Practise saying this fast — it's the same intuition as why accuracy is a bad metric under imbalance.",
  },
];

// ── Gradient descent & the learning rate ────────────────────────────────────
export const GRADIENT_DESCENT = {
  analogy: "You're standing on a hillside in thick fog. You want the lowest point in the valley. You can't see anything, but you can feel the slope under your feet. Feel which way is downhill, take a step that way, repeat.\n\nThat's gradient descent, completely.\n\n• The valley's height at your position = the LOSS\n• Your position = the current WEIGHTS\n• The slope you feel = the GRADIENT\n• Your step size = the LEARNING RATE\n• Reaching the bottom = CONVERGENCE",
  loop: [
    "Start with random weights (\"stand somewhere random on the hill\")",
    "Make predictions on a batch (\"look at where you are\")",
    "Compare to correct answers → compute LOSS (\"how high am I?\")",
    "Compute the GRADIENT (\"which way is downhill?\")",
    "Nudge every weight downhill: new_weight = old_weight − (learning_rate × gradient)",
    "Repeat millions of times",
  ],
  keyLine: "That one line in step 5 is the engine of essentially all modern AI. Every model you've ever used was trained with it. Everything else is variations on what the model is and what the loss is.",
  code: `import numpy as np
rng = np.random.default_rng(0)
X = rng.uniform(0, 10, 100)
y = 3 * X + 2 + rng.normal(0, 1, 100)      # true w=3, b=2, plus noise

w, b = 0.0, 0.0          # start with a guess
lr = 0.01                # THE LEARNING RATE

for epoch in range(100):
    y_pred = w * X + b                     # 1. predict
    error  = y_pred - y                    # 2. how wrong?
    loss   = np.mean(error ** 2)           # 3. one number: MSE
    dw = 2 * np.mean(error * X)            # 4. gradient w.r.t. w
    db = 2 * np.mean(error)                #    gradient w.r.t. b
    w -= lr * dw                           # 5. step downhill
    b -= lr * db
    if epoch % 20 == 0:
        print(f"epoch {epoch:3d}  loss={loss:8.3f}  w={w:.3f}  b={b:.3f}")

# Why -= ? The gradient points UPHILL (toward higher loss). You want to go
# down, so you subtract it.`,
  lrDemo: `for lr in [0.0001, 0.001, 0.01, 0.02, 0.1]:
    w, b = 0.0, 0.0
    for _ in range(100):
        error = (w * X + b) - y
        w -= lr * 2 * np.mean(error * X)
        b -= lr * 2 * np.mean(error)
    print(f"lr={lr:<8} learned w={w:.3f}  (true w = 3.0)")

# Verified output:
# lr=0.0001   w=      1.768   <- too slow, only got halfway in 100 epochs
# lr=0.001    w=      3.193   <- good
# lr=0.01     w=      3.124   <- good
# lr=0.02     w=      3.073   <- good
# lr=0.1      w=  -1.09e+85   <- DIVERGED. Overshot so hard it flew to infinity`,
  diagnosis: {
    headers: ["Symptom in the loss curve", "Cause", "Fix"],
    rows: [
      ["Decreasing very slowly, still falling at the end", "LR too small", "Increase by 3–10×"],
      ["Decreasing smoothly, then flattens", "Correct", "Nothing"],
      ["Bouncing up and down, no clear trend", "LR too high", "Decrease by 3–10×"],
      ["Shoots to infinity or NaN", "LR far too high, or exploding gradients", "Decrease by 10–100×; add gradient clipping"],
      ["Flat from the start, never moves", "LR ≈ 0, or a bug in the data/labels", "Check data and labels FIRST, then LR"],
    ],
  },
  theAnswer: "\"Your model won't train — what do you check first?\" → \"The learning rate, then whether the data and labels are actually correct.\" That's the right instinct and the honest real-world answer.",
  batchWords: {
    headers: ["Term", "Meaning", "Example: 10,000 samples, batch size 32"],
    rows: [
      ["Batch", "Group of samples processed before one weight update", "32 samples"],
      ["Iteration / step", "One weight update", "313 per epoch (10,000 ÷ 32)"],
      ["Epoch", "One full pass through all training data", "313 iterations"],
    ],
  },
  batchVariants: {
    headers: ["Variant", "Batch size", "Tradeoff"],
    rows: [
      ["Batch GD", "All data", "Stable, accurate gradient; slow, memory-heavy"],
      ["SGD", "1 sample", "Fast, noisy; the noise can escape shallow minima"],
      ["Mini-batch", "32–512", "The practical default — good gradient estimate, efficient on GPUs"],
    ],
  },
  batchSizeLR: "Batch size affects the learning rate you should use. A larger batch gives a less noisy gradient, so each step points more reliably downhill and you can afford bigger steps — the common heuristic is the LINEAR SCALING RULE (double the batch, double the LR), usually paired with warmup because large steps at initialization are destabilizing. The subtler point: gradient noise from small batches isn't purely a nuisance — it acts as an implicit regularizer and can help escape sharp minima, which is part of why very large batches sometimes generalize slightly worse. You use large batches for HARDWARE UTILIZATION — GPUs are throughput devices and small batches leave them idle. It's a wall-clock optimization more than a quality one.",
};

// ── Loss functions ──────────────────────────────────────────────────────────
export const LOSSES = {
  headers: ["Task", "Loss", "Formula", "Why this one"],
  rows: [
    ["Regression", "MSE", "(1/n)Σ(y−ŷ)²", "MLE under Gaussian noise; smooth; heavily punishes outliers"],
    ["Regression, robust", "MAE", "(1/n)Σ|y−ŷ|", "Treats a miss of 10 as exactly twice as bad as 5; robust to outliers"],
    ["Regression, both", "Huber", "quadratic near 0, linear far", "Best of both — smooth gradient near zero, outlier-robust far out"],
    ["Binary classification", "Binary cross-entropy", "−[y·log ŷ + (1−y)·log(1−ŷ)]", "MLE under Bernoulli; punishes confident wrong predictions toward ∞"],
    ["Multi-class", "Categorical cross-entropy", "−Σ yᵢ log ŷᵢ", "MLE under Categorical"],
    ["SVM", "Hinge", "max(0, 1 − y·f(x))", "Maximizes margin; zero loss once correctly classified with margin"],
    ["Imbalanced detection", "Focal loss", "−(1−ŷ)^γ log ŷ", "Down-weights easy examples so hard ones dominate the gradient"],
    ["Retrieval / embeddings", "Contrastive / Triplet / InfoNCE", "pull positives close, push negatives away", "Metric learning — the objective behind embedding models"],
  ],
  crossEntropyNote: "\"Why not MSE for classification?\" is a top-5 most-asked question. Three reasons: (1) convexity — MSE+sigmoid gives a non-convex surface, log-loss is convex; (2) vanishing gradient — MSE+sigmoid's gradient contains a σ'(z) factor that is ≈0 when confidently wrong, so learning stalls exactly when it should correct hardest, whereas with cross-entropy that factor CANCELS leaving (ŷ−y)x; (3) MSE assumes Gaussian noise but a binary outcome is Bernoulli, so cross-entropy is the correct MLE.",
};

// ── Splits, cross-validation, leakage ───────────────────────────────────────
export const SPLITS = {
  purpose: {
    headers: ["Split", "Purpose", "How often you touch it"],
    rows: [
      ["Train (~70%)", "Fit the model's parameters", "Constantly"],
      ["Validation (~15%)", "Choose hyperparameters, model type, threshold, when to stop", "Constantly"],
      ["Test (~15%)", "One honest estimate of real-world performance", "ONCE, at the very end"],
    ],
  },
  whyThree: "Why not just two? Because every decision you make based on validation fits you to it a little. After fifty decisions — model choice, alpha, threshold, features — the validation score is optimistic in exactly the way an overfitted model is. The test set is the one you haven't optimized against, which is the only thing that makes it honest. And that's why it should be touched once. If you look at the test score and go back to fix things, it has become a validation set and you've burned your honest estimate.",
  code: `from sklearn.model_selection import train_test_split

# First split off the test set and LEAVE IT ALONE
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y)

# Then split the rest into train and validation
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.18, random_state=42, stratify=y_temp)

# stratify=y preserves the class ratio in every split. Without it, a random
# split on 1%-positive data can produce a validation set with almost no
# positives, making your metrics meaningless.`,
  cv: {
    h: "Cross-validation — what it's for",
    body: "Use it when your dataset is small enough that a single validation split is unreliable. With 200 rows, a 30-row validation set gives a score with enormous error bars — you'd be making decisions based on noise.\n\nk-fold splits the training data into k parts, trains k times each holding out a different part, and averages the k scores.\n\n    Fold 1:  [TEST][train][train][train][train]\n    Fold 2:  [train][TEST][train][train][train]\n    Fold 3:  [train][train][TEST][train][train]\n    Fold 4:  [train][train][train][TEST][train]\n    Fold 5:  [train][train][train][train][TEST]\n                                            → average the 5 scores",
    code: `from sklearn.model_selection import cross_val_score, StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='roc_auc')
print(f"AUC: {scores.mean():.3f} ± {scores.std():.3f}")`,
    stdNote: "Report the STANDARD DEVIATION, not just the mean. 0.82 ± 0.01 is a solid estimate. 0.82 ± 0.09 means you can't distinguish this model from one scoring 0.75, and any conclusion you draw is noise. Mentioning this signals real statistical care.",
    variants: {
      headers: ["Variant", "When to use", "Why"],
      rows: [
        ["KFold", "Balanced classes, no structure", "The default"],
        ["StratifiedKFold", "Classification, especially imbalanced", "Preserves class ratio in every fold"],
        ["GroupKFold", "Multiple rows per entity (user, patient, document)", "Keeps all of an entity's rows in one fold — otherwise you leak"],
        ["TimeSeriesSplit", "Anything with time order", "Never trains on the future; expanding window"],
        ["LeaveOneOut", "Very small datasets (<100 rows)", "Maximum training data; expensive and high variance"],
      ],
    },
  },
  leakage: {
    h: "Data leakage — the failure that makes everything else meaningless",
    body: "Leakage = information from the test set, or from the future, reaching the model during training. It produces spectacular offline scores and total production failure, and it's the most common serious mistake in applied ML.",
    four: [
      { name: "Scaling/imputing before splitting", detail: "Fitting a scaler or imputer on the FULL dataset means the test set's statistics leak into training.", fix: "Fit on train only, apply to val/test. Better: wrap preprocessing in a Pipeline so the transform is refit inside each CV fold." },
      { name: "Random-splitting time-ordered data", detail: "You train on the future and predict the past, which never happens in production.", fix: "Chronological split / TimeSeriesSplit." },
      { name: "Splitting rows when the same entity appears in both", detail: "The model memorizes the entity, not the pattern.", fix: "GroupKFold — split by entity." },
      { name: "A feature only populated after the outcome", detail: "e.g. 'number of support tickets' when predicting churn — the tickets happen BECAUSE they're churning. The sneakiest one; it requires understanding the data, not just the code.", fix: "Audit each feature: was this value available at prediction time?" },
    ],
    code: `# BAD: scaler sees ALL data including test
scaler = StandardScaler().fit(X)
X_scaled = scaler.transform(X)
X_train, X_test = train_test_split(X_scaled)   # test statistics already leaked

# CORRECT
X_train, X_test = train_test_split(X)
scaler = StandardScaler().fit(X_train)         # fit on train ONLY
X_train = scaler.transform(X_train)
X_test  = scaler.transform(X_test)             # apply the same transform

# BEST: a Pipeline makes leakage structurally impossible
from sklearn.pipeline import Pipeline
pipe = Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())])
scores = cross_val_score(pipe, X_train, y_train, cv=5)
# Inside cross_val_score the scaler is refit on each fold's training portion only`,
    say: "\"I wrap preprocessing in a Pipeline so the transform is fit inside each CV fold\" is a concrete, credible thing to say in an interview.",
  },
};

// ── Regularization toolbox ──────────────────────────────────────────────────
export const REGULARIZATION = {
  definition: "Regularization = deliberately handicapping the model so it can't memorize. It is the treatment for a VARIANCE problem. Applying it to a bias problem makes things worse.",
  formulas: "L2 (Ridge):  Loss = MSE + λ · Σ(wᵢ²)      ← squares of the weights\nL1 (Lasso):  Loss = MSE + λ · Σ|wᵢ|       ← absolute values of the weights\n\nλ (lambda) controls the strength. Bigger λ = more handicap = simpler model = more bias, less variance.",
  code: `from sklearn.linear_model import Ridge, Lasso, ElasticNet
import numpy as np

ridge = Ridge(alpha=1.0).fit(X_train, y_train)   # alpha IS lambda in sklearn
lasso = Lasso(alpha=0.1).fit(X_train, y_train)

print("Ridge - weights near zero:", np.sum(np.abs(ridge.coef_) < 1e-6))   # ~0
print("Lasso - weights EXACTLY zero:", np.sum(lasso.coef_ == 0))          # many

en = ElasticNet(alpha=0.1, l1_ratio=0.5).fit(X_train, y_train)  # both penalties

# Watch the effect of lambda directly:
for alpha in [0.001, 0.01, 0.1, 1, 10, 100]:
    m = Ridge(alpha=alpha).fit(X_train, y_train)
    tr, va = m.score(X_train, y_train), m.score(X_val, y_val)
    print(f"alpha={alpha:>7}  train={tr:.3f}  val={va:.3f}  gap={tr-va:.3f}")`,
  codeNote: "The gap shrinks as alpha rises (less overfitting) while both scores eventually fall (too much bias). The BEST alpha is where the VALIDATION score peaks — not where the gap is smallest. Zero gap with terrible scores is just underfitting.",
  dropout: {
    h: "Dropout",
    body: "Randomly switches off a fraction of neurons during each training step — different neurons each time. This forces the network to build redundant representations rather than depending on any single unit. It acts like training an exponential ensemble of sub-networks and prevents co-adaptation.\n\nStandard implementation is INVERTED DROPOUT: divide by (1−p) during training so test time needs no change.\n\nTHE CLASSIC BUG: forgetting model.eval(). Inference results become randomly worse and inconsistent between runs, and it's baffling until you find it. Being able to name this as a real bug you'd check for is a genuine practitioner signal.\n\nWhy validation accuracy can EXCEED training accuracy: during training dropout is on, so the model solves a harder task with neurons missing. At validation it's off. That gap is expected.",
    code: `import torch.nn as nn
model = nn.Sequential(
    nn.Linear(100, 64), nn.ReLU(), nn.Dropout(0.5),   # drop 50% during training
    nn.Linear(64, 32),  nn.ReLU(), nn.Dropout(0.5),
    nn.Linear(32, 1)
)
model.train()   # dropout ACTIVE
# ... training loop ...
model.eval()    # dropout DISABLED - uses all neurons
# ... evaluation / inference ...`,
  },
  earlyStopping: {
    h: "Early stopping — the cheapest regularizer",
    code: `best_val, patience, wait = float('inf'), 5, 0
for epoch in range(200):
    train_one_epoch(model, train_loader)
    val_loss = evaluate(model, val_loader)
    if val_loss < best_val:
        best_val = val_loss
        wait = 0
        torch.save(model.state_dict(), 'best.pt')    # keep the BEST, not the last
    else:
        wait += 1
        if wait >= patience:
            print(f"Stopping at epoch {epoch}; best val loss {best_val:.4f}")
            break
model.load_state_dict(torch.load('best.pt', weights_only=True))  # restore best
# weights_only=True: torch.load unpickles arbitrary objects by default, which
# is arbitrary code execution on an untrusted checkpoint. Always pass it.`,
    note: "patience exists because validation loss is noisy — one bad epoch doesn't mean you've peaked. Wait a few epochs before concluding.",
  },
  toolbox: {
    headers: ["Technique", "Attacks", "Use when", "Cost"],
    rows: [
      ["More data", "Variance", "Always first, if obtainable", "Time, money"],
      ["L2 / weight decay", "Variance", "Default for linear models and NNs", "One hyperparameter"],
      ["L1", "Variance", "Many suspected-useless features", "Can discard useful correlated ones"],
      ["Dropout", "Variance", "Neural networks specifically", "Slower convergence"],
      ["Early stopping", "Variance", "Always — nearly free", "Needs a validation set"],
      ["Data augmentation", "Variance", "Images, audio, text", "Must preserve labels"],
      ["Simpler model", "Variance", "Small data", "Risks swinging into bias"],
      ["Ensembling", "Variance", "When you can afford N models", "N× compute"],
      ["Batch norm", "Mild", "Deep networks (mainly for optimization)", "Batch-size dependent"],
    ],
  },
  keyLine: "Every single one of these attacks VARIANCE. If your problem is bias, none of them help — you need a bigger model or better features. That's why diagnosis comes first.",
  augWarning: "Data augmentation is not free. An augmentation must PRESERVE THE LABEL. Horizontal flips are fine for cats, catastrophic for digit recognition or text — a flipped '2' isn't a '2'. Aggressive colour jitter destroys tasks where colour is the signal (medical staining, defect detection). Rotation breaks anything with a canonical orientation. The other failure mode: augmentation that pushes training data AWAY from the real test distribution. Model augmentations on the actual variation you'll see in production, not on what's available in the library.",
};

// ── Optimizers ──────────────────────────────────────────────────────────────
export const OPTIMIZERS = {
  code: `import torch.optim as optim
optim.SGD(model.parameters(), lr=0.01)                        # plain
optim.SGD(model.parameters(), lr=0.01, momentum=0.9)          # + momentum
optim.Adam(model.parameters(), lr=0.001)                      # adaptive
optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)  # transformers`,
  table: {
    headers: ["Optimizer", "What it adds", "Analogy / use when"],
    rows: [
      ["Batch GD", "Full dataset per step", "Stable, slow, memory-heavy"],
      ["SGD", "One sample per step", "Noisy, fast; noise can escape shallow minima"],
      ["Mini-batch SGD", "32–512 samples", "The practical default; hardware-efficient"],
      ["Momentum", "v ← βv + ∇L; w ← w − ηv (β≈0.9)", "A ball rolling downhill — dampens oscillation across ravines, accelerates along consistent directions"],
      ["Nesterov", "Look ahead before computing the gradient", "Slightly better than plain momentum"],
      ["AdaGrad", "Per-parameter LR ÷ √(sum of past squared gradients)", "Great for sparse features, but the LR monotonically decays to zero"],
      ["RMSProp", "Same idea with an exponential moving average", "Doesn't die like AdaGrad"],
      ["Adam", "Momentum + RMSProp + bias correction", "THE default. Fast, forgiving about LR"],
      ["AdamW", "Adam with DECOUPLED weight decay", "Transformers and LLMs"],
    ],
  },
  adam: "Adam in full:\n\n    m ← β₁m + (1−β₁)g          (1st moment, mean)\n    v ← β₂v + (1−β₂)g²         (2nd moment, uncentered variance)\n    m̂ = m/(1−β₁ᵗ),  v̂ = v/(1−β₂ᵗ)   (bias correction — without it early steps are biased toward 0)\n    w ← w − η·m̂/(√v̂ + ε)\n\nDefaults β₁=0.9, β₂=0.999, ε=1e−8.",
  adamW: "What \"decoupled weight decay\" actually means: in Adam, L2 regularization added to the loss gets divided by the same adaptive denominator as the gradient, so parameters with large historical gradients receive effectively LESS regularization — which isn't what you intended. AdamW applies the decay directly to the weights, outside the adaptive scaling, so it's uniform.",
  defaultAnswer: "\"Adam, because it adapts the step size per parameter and needs far less LR tuning. AdamW for transformers, because the original Adam's weight decay interacts badly with the adaptive scaling.\" The counterpoint worth adding: well-tuned SGD with momentum often generalizes slightly better in vision, and there's evidence Adam finds sharper minima.",
  schedules: "LEARNING RATE SCHEDULES: step decay, cosine annealing, WARMUP (crucial for Transformers — early steps have unreliable second-moment estimates), ReduceLROnPlateau, one-cycle. Large early steps to move fast, small later steps to converge rather than bounce around the minimum.",
};

// ── Normalization & scaling ─────────────────────────────────────────────────
export const NORMALIZATION = {
  layers: {
    h: "Normalization layers inside a network",
    body: "BATCH NORM: normalize each FEATURE across the BATCH dimension to mean 0 / var 1, then apply learnable scale γ and shift β. Speeds up training, allows higher LRs, mildly regularizes via batch noise.\nGotchas: depends on batch size (bad for batch 1–8), and behaves DIFFERENTLY at train vs inference (inference uses running averages — a classic bug source). Not suited to variable-length sequences.\n\nLAYER NORM: normalize across the FEATURE dimension within a SINGLE sample. Batch-size independent, identical at train and test → the standard in Transformers/NLP.\n\nAlso: Group Norm, Instance Norm (style transfer), RMSNorm (LayerNorm without mean subtraction, used in LLaMA).\n\nWHY BATCHNORM HELPS: the original claim was reducing internal covariate shift, but later work argued the real benefit is SMOOTHING THE LOSS LANDSCAPE, which permits higher learning rates. Knowing the original explanation is contested is itself a signal.\n\nWHY TRANSFORMERS USE LAYERNORM: BatchNorm has two disqualifying problems for sequences — it depends on the batch (noisy statistics with small batches, and train/test divergence), and sequences have variable length so normalizing across the batch mixes padded and real positions.\n\nONE-LINE ANSWER: \"BatchNorm normalizes across the batch per feature; LayerNorm normalizes across features per sample. Use LayerNorm for sequences and small batches.\"",
  },
  scaling: {
    h: "Do I need to scale my features?",
    headers: ["Model", "Scale?", "Why"],
    rows: [
      ["Linear / logistic regression", "Yes", "Gradient descent converges much better"],
      ["Neural networks", "Yes", "Same, plus stability"],
      ["kNN, k-means, SVM", "Yes, CRITICAL", "Distance-based — unscaled large-range features dominate"],
      ["PCA", "Yes", "It follows variance; scale distorts everything"],
      ["Decision tree, Random Forest, boosting", "No", "Splits are thresholds; monotonic rescaling changes nothing"],
    ],
    say: "\"Trees don't need scaling; distance-based and gradient-based models do.\" An easy way to sound like you've actually done this. The mechanism: a tree only asks 'above or below a threshold?', and that ordering is unchanged by monotonic rescaling.",
    normVsStd: "NORMALIZATION (min-max to [0,1]) vs STANDARDIZATION (z-score, mean 0 std 1). Standardization is the usual default; min-max when you need a bounded range (e.g. image pixels, or some neural net inputs).",
  },
};

// ── Feature engineering & preprocessing ─────────────────────────────────────
export const FEATURES = [
  { h: "Categorical encoding", body: "One-hot (low cardinality) · label/ordinal (ONLY if truly ordered) · target/mean encoding (high cardinality — beware leakage, use out-of-fold) · hashing trick (huge vocab) · learned embeddings (deep models)." },
  { h: "Missing values", body: "Drop · mean/median impute · model-based impute · or add a \"was-missing\" INDICATOR column — often the missingness itself is signal. Impute using TRAINING statistics only." },
  { h: "Outliers", body: "Clip/winsorize · log-transform skewed features · or use robust models and robust losses (MAE, Huber)." },
  { h: "Curse of dimensionality", body: "As dimensions grow, data becomes sparse and all points become roughly equidistant, so distance-based methods degrade and you need exponentially more data. This is why kNN and k-means struggle in high dimensions and why dimensionality reduction exists." },
  { h: "Class imbalance", body: "Resampling (oversample minority, SMOTE synthesizes interpolated points, undersample majority) · class weights in the loss (class_weight='balanced', pos_weight in PyTorch BCE) · focal loss · THRESHOLD TUNING on validation (don't blindly use 0.5) · better metrics (PR-AUC, recall at fixed precision) · reframe as anomaly detection if the minority is <0.1%." },
  { h: "Trees and feature construction", body: "Scaling is irrelevant for trees, but CONSTRUCTING features still matters. A tree can't easily learn ratios or arithmetic interactions — it can only approximate a/b with many axis-aligned splits. If you know a ratio is meaningful, give it to the tree directly." },
];

// ── Fixing a broken model — the master diagnostic ────────────────────────────
export const DEBUG_TABLE = {
  headers: ["Symptom", "Diagnosis", "Fixes, in order"],
  rows: [
    ["Bad on train AND validation", "Underfitting (bias)", "Bigger model → better features → train longer → check the learning rate"],
    ["Great on train, bad on validation", "Overfitting (variance)", "More data → regularization → dropout → simpler model → early stopping"],
    ["Loss won't move at all", "LR ≈ 0, or a bug", "Check data and labels FIRST → then raise LR"],
    ["Loss becomes NaN", "LR far too high, or exploding gradients", "Lower LR 10–100× → gradient clipping → check for log(0) / divide-by-zero → check input data for NaN/inf"],
    ["Val score > train score", "Dropout/augmentation active in training", "Normal. Verify by evaluating train in eval mode"],
    ["99% accuracy but useless", "Class imbalance", "Switch to PR-AUC → class weights → tune the threshold"],
    ["Great offline, bad in production", "Train/serve skew, leakage, or drift", "Compare live vs training distributions → audit for leakage → check feature code matches"],
  ],
  productionOrder: "For \"great offline, bad in production\" specifically, check in this order because it's roughly the order of frequency:\n1. TRAINING–SERVING SKEW — are features computed identically in both paths? Different code, different libraries, different time windows. Most common and most boring.\n2. LEAKAGE in training that inflated the offline number in the first place.\n3. DISTRIBUTION SHIFT — compare live input distributions against training, feature by feature.\n4. METRIC MISMATCH — the offline metric doesn't proxy the business outcome.\n5. FEEDBACK LOOPS — the model changed user behaviour, which changed the data.\n6. OPERATIONAL — latency causing truncation, a stale model artifact, a version mismatch.\n\nHow to detect skew specifically: log the features actually used at serving time, score that logged data offline, and compare predictions to what was served. If they differ, it's skew. The structural fix is a feature store or shared transformation code so there's literally one implementation.",
  drift: "DATA DRIFT vs CONCEPT DRIFT — and yes, the distinction matters operationally. Data drift is P(x) changing: you can detect it WITHOUT labels by watching input distributions (PSI or KL divergence), and retraining on fresh data usually fixes it. Concept drift is P(y|x) changing — the relationship itself moved — and you CANNOT detect it from inputs at all, only from outcomes. Fraud is the canonical case: attackers adapt, so the same features now mean something different. Concept drift needs new labels, not just new data.",
  silentFailure: "The specific danger of ML systems: they fail SILENTLY and FLUENTLY. Ground truth arrives late or never, so accuracy isn't observable in real time, and the system keeps returning confident outputs with no exception and no error-rate spike. What you monitor instead are LEADING INDICATORS: input feature distributions vs training (PSI/KL), the model's own output distribution (a drifting predicted-positive rate means something changed), and a continuously-sampled human or LLM-judged quality check on a small fraction of live traffic. Plus proxy signals from users: thumbs down, escalation rate, re-query rate.",
};

// ── When NOT to use ML ──────────────────────────────────────────────────────
export const WHEN_NOT_ML = {
  h: "When would you NOT use machine learning?",
  why: "A senior-signal question that a lot of candidates fumble by treating ML as always-good.",
  body: "When RULES work. If the logic is expressible as a hundred if-statements, that's cheaper, faster, testable, debuggable and auditable.\n\nAlso: when you don't have data or a feedback loop to improve; when errors are unacceptable AND unverifiable; when you need deterministic, explainable decisions for legal or regulatory reasons; when latency or cost budgets are tight; and when the cost of building and MAINTAINING the system exceeds the value of being right more often.\n\nML has real ongoing costs — monitoring, retraining, drift — that people systematically underestimate at the proposal stage. Reaching for the smallest tool that works is the signal interviewers are looking for.",
};
