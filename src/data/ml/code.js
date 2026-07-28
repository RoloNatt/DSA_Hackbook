// ─── ML CODING — IMPLEMENT UNTIL THESE ARE MUSCLE MEMORY ────────────────────
// The ML coding round is usually "implement X from scratch in NumPy" or a
// data-manipulation problem, NOT LeetCode Hard. Write clean code, state
// complexity, handle edge cases, and TALK WHILE CODING.

export const CODE_INTRO = {
  h: "What the ML coding round actually asks",
  body: "Expect one of:\n• \"Implement X from scratch in NumPy\" — softmax, logistic regression, k-means, attention, a metric\n• A data-manipulation problem — grouping, joining, windowing over a dataset\n• Occasionally a standard LeetCode-medium (top-k frequent, merge intervals, sliding window)\n\nWHAT'S BEING SCORED: clean code, correct complexity stated unprompted, edge cases named out loud, and narration while you type. The algorithm itself is usually not hard — the signal is in how you work.",
  drill: "The single most common \"from scratch\" ask is a minimal 2-layer neural network forward + backward in NumPy. If you drill one thing, drill that.",
};

export const ML_SNIPPETS = [
  {
    id: "softmax",
    category: "Core",
    emoji: "🎲",
    label: "Softmax + Cross-Entropy",
    color: "#6A1B9A", bg: "#F3E5F5",
    description: "Numerically stable softmax and cross-entropy. Be ready to explain the max-subtraction AND the epsilon — both get asked.",
    code: `import numpy as np

def softmax(z):
    """z: (n, k) logits -> (n, k) probabilities."""
    z = z - np.max(z, axis=1, keepdims=True)   # STABILITY: prevents exp overflow.
                                               # Subtracting a constant leaves the
                                               # result mathematically identical.
    e = np.exp(z)
    return e / np.sum(e, axis=1, keepdims=True)

def cross_entropy(probs, y):
    """probs: (n, k); y: (n,) integer labels."""
    n = y.shape[0]
    eps = 1e-12                                # prevents log(0) -> -inf -> NaN
    return -np.mean(np.log(probs[np.arange(n), y] + eps))

# Example
logits = np.array([[2.0, 1.0, 0.1], [0.5, 2.5, 0.3]])
p = softmax(logits)
print(p.sum(axis=1))                 # [1. 1.]
print(cross_entropy(p, np.array([0, 1])))

# Complexity: O(n*k) time and space.
# Say out loud: "In practice I'd use log-softmax and combine it with NLL, or
# BCEWithLogitsLoss in PyTorch, because computing them together is more stable
# than computing softmax then taking a log."`,
  },
  {
    id: "logreg",
    category: "Core",
    emoji: "🎚️",
    label: "Logistic Regression",
    color: "#0F7A5A", bg: "#E2F5EF",
    description: "Full gradient descent training loop. The gradient is (p − y)·x — state that the sigmoid derivative cancels.",
    code: `import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))   # clip avoids overflow

def train_logreg(X, y, lr=0.1, epochs=1000, l2=0.0):
    """X: (n, d), y: (n,) in {0,1}."""
    n, d = X.shape
    w, b = np.zeros(d), 0.0
    for _ in range(epochs):
        p  = sigmoid(X @ w + b)
        dw = (X.T @ (p - y)) / n + l2 * w    # gradient is just (p - y) @ X
        db = np.mean(p - y)
        w -= lr * dw
        b -= lr * db
    return w, b

def predict(X, w, b, threshold=0.5):
    return (sigmoid(X @ w + b) >= threshold).astype(int)

# Complexity: O(epochs * n * d).
# Edge cases to MENTION: unscaled features slow convergence badly; perfectly
# separable data drives weights to infinity without regularization; the
# threshold is a choice, not fixed at 0.5.`,
  },
  {
    id: "nn",
    category: "Core",
    emoji: "🧠",
    label: "2-Layer NN (forward + backward)",
    color: "#1565C0", bg: "#E3F2FD",
    description: "THE most common 'from scratch' ask. Three details in here answer three separate interview questions.",
    code: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

def train_nn(X, y, hidden=16, lr=0.1, epochs=1000, seed=0):
    rng = np.random.default_rng(seed)
    n, d = X.shape

    # He init - scaled for ReLU. NEVER all zeros: every neuron would compute the
    # same thing and receive the same gradient forever; symmetry never breaks.
    W1 = rng.normal(0, np.sqrt(2 / d), (d, hidden));      b1 = np.zeros(hidden)
    W2 = rng.normal(0, np.sqrt(2 / hidden), (hidden, 1)); b2 = np.zeros(1)

    for epoch in range(epochs):
        # -------- FORWARD --------
        z1 = X @ W1 + b1
        a1 = np.maximum(0, z1)          # ReLU. Remove it and the whole network
                                        # collapses to a single linear layer.
        z2 = a1 @ W2 + b2
        a2 = sigmoid(z2).ravel()
        loss = -np.mean(y*np.log(a2+1e-9) + (1-y)*np.log(1-a2+1e-9))

        # -------- BACKWARD (chain rule, layer by layer) --------
        dz2 = (a2 - y).reshape(-1, 1) / n   # sigmoid + BCE => (pred - true).
                                            # All the messy terms cancel.
        dW2 = a1.T @ dz2;  db2 = dz2.sum(0)
        da1 = dz2 @ W2.T
        dz1 = da1 * (z1 > 0)                # ReLU derivative: 1 if z>0 else 0
        dW1 = X.T @ dz1;   db1 = dz1.sum(0)

        # -------- UPDATE --------
        W2 -= lr * dW2;  b2 -= lr * db2
        W1 -= lr * dW1;  b1 -= lr * db1

        if epoch % 200 == 0:
            print(f"epoch {epoch:4d}  loss={loss:.4f}")
    return W1, b1, W2, b2

# Complexity: O(epochs * n * d * hidden).`,
  },
  {
    id: "kmeans",
    category: "Core",
    emoji: "🎯",
    label: "k-Means",
    color: "#B84A00", bg: "#FCEEE7",
    description: "Assign, recentre, repeat. Name the edge cases out loud — that's most of the score here.",
    code: `import numpy as np

def kmeans(X, k, iters=100, seed=0):
    rng = np.random.default_rng(seed)
    centroids = X[rng.choice(len(X), k, replace=False)]

    for _ in range(iters):
        # (n, k) squared distances from every point to every centroid
        d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(-1)
        labels = d.argmin(1)

        new = np.array([X[labels == j].mean(0) if np.any(labels == j)
                        else centroids[j]           # EMPTY CLUSTER: keep the old
                        for j in range(k)])         # centroid rather than NaN

        if np.allclose(new, centroids):             # converged
            break
        centroids = new
    return centroids, labels

# Complexity: O(iters * n * k * d).
# EDGE CASES TO SAY ALOUD:
#   - empty clusters (handled above)
#   - k > n
#   - converges to a LOCAL optimum -> run multiple restarts, keep lowest inertia
#   - k-means++ init spreads starting centroids and reduces bad local minima
#   - features MUST be scaled - it's distance-based`,
  },
  {
    id: "attention",
    category: "Deep learning",
    emoji: "👁️",
    label: "Scaled Dot-Product Attention",
    color: "#AD1457", bg: "#FCE4EC",
    description: "Write this from memory five times. The √d_k question follows immediately.",
    code: `import numpy as np

def softmax_lastdim(x):
    x = x - x.max(axis=-1, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=-1, keepdims=True)

def attention(Q, K, V, mask=None):
    """Q, K, V: (batch, seq_len, d_k). mask: (seq, seq) boolean, True = keep."""
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)   # (b, n, n)
    #  ^ /sqrt(d_k): dot products of d_k-dim vectors have variance ~d_k.
    #    Large logits saturate softmax into near one-hot, where the gradient
    #    is ~0 and learning stalls. This normalizes variance back to ~1.
    if mask is not None:
        scores = np.where(mask, scores, -1e9)          # causal / padding mask
    weights = softmax_lastdim(scores)
    return weights @ V, weights

# Causal mask for a decoder: position i may only attend to j <= i
def causal_mask(n):
    return np.tril(np.ones((n, n), dtype=bool))

# Complexity: O(n^2 * d) time, O(n^2) memory - the reason long context is
# expensive, and why FlashAttention / GQA / paged attention exist.`,
  },
  {
    id: "metrics",
    category: "Metrics",
    emoji: "📊",
    label: "Precision / Recall / F1 / Confusion",
    color: "#C62828", bg: "#FDECEA",
    description: "Trivial code, but the zero-division guards are the whole point.",
    code: `def confusion(y_true, y_pred):
    TP = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    FP = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    FN = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    TN = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    return TP, FP, FN, TN

def precision_recall_f1(y_true, y_pred):
    TP, FP, FN, _ = confusion(y_true, y_pred)
    prec = TP / (TP + FP) if TP + FP else 0.0      # guard: predicted nothing
    rec  = TP / (TP + FN) if TP + FN else 0.0      # guard: no actual positives
    f1   = 2*prec*rec/(prec+rec) if prec + rec else 0.0
    return prec, rec, f1

# Say aloud: precision has no TN in its denominator, which is why it's
# sensitive to class imbalance while TPR and FPR are not.`,
  },
  {
    id: "roc",
    category: "Metrics",
    emoji: "📈",
    label: "ROC curve + AUC from scratch",
    color: "#00838F", bg: "#E0F7FA",
    description: "Sweep the threshold, collect (FPR, TPR), integrate with the trapezoid rule.",
    code: `import numpy as np

def roc_curve_manual(y_true, y_scores):
    """Returns fpr, tpr arrays, one point per distinct threshold."""
    y_true = np.asarray(y_true); y_scores = np.asarray(y_scores)
    P = (y_true == 1).sum()
    N = (y_true == 0).sum()

    order = np.argsort(-y_scores)          # descending score
    y_sorted = y_true[order]

    tps = np.cumsum(y_sorted == 1)         # true positives at each cutoff
    fps = np.cumsum(y_sorted == 0)

    tpr = np.concatenate([[0], tps / P])
    fpr = np.concatenate([[0], fps / N])
    return fpr, tpr

def auc_trapezoid(fpr, tpr):
    return np.trapezoid(tpr, fpr) if hasattr(np, "trapezoid") else np.trapz(tpr, fpr)

y = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
s = np.array([0.95, 0.80, 0.60, 0.35, 0.70, 0.40, 0.30, 0.20, 0.15, 0.05])
fpr, tpr = roc_curve_manual(y, s)
print(round(auc_trapezoid(fpr, tpr), 3))    # 0.875

# AUC interpretation to state: the probability that a randomly chosen positive
# scores higher than a randomly chosen negative.`,
  },
  {
    id: "iou",
    category: "Vision",
    emoji: "🖼️",
    label: "IoU + Non-Max Suppression",
    color: "#1565C0", bg: "#E3F2FD",
    description: "Standard computer-vision coding ask. Watch the max(0, ...) on the intersection.",
    code: `def iou(a, b):
    """boxes as (x1, y1, x2, y2)"""
    xx1, yy1 = max(a[0], b[0]), max(a[1], b[1])
    xx2, yy2 = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0, xx2 - xx1) * max(0, yy2 - yy1)   # max(0,..): no overlap case
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0

def nms(boxes, scores, thresh=0.5):
    """Keep the highest-scoring box, drop everything overlapping it."""
    order = sorted(range(len(boxes)), key=lambda i: -scores[i])
    keep = []
    while order:
        i = order.pop(0)
        keep.append(i)
        order = [j for j in order if iou(boxes[i], boxes[j]) <= thresh]
    return keep

# Complexity: O(n^2) worst case. Mention that production uses a vectorized
# or GPU implementation, and that class-wise NMS is usually what you want.`,
  },
  {
    id: "cosine",
    category: "Retrieval",
    emoji: "🔍",
    label: "Cosine similarity + top-k retrieval",
    color: "#827717", bg: "#F9FBE7",
    description: "The argpartition trick shows you think about complexity — mention it.",
    code: `import numpy as np

def top_k_similar(query, matrix, k=5):
    """query: (d,), matrix: (n, d). Returns indices of the k most similar rows."""
    q = query / (np.linalg.norm(query) + 1e-12)
    m = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-12)
    sims = m @ q                                 # cosine, since both normalized

    idx = np.argpartition(-sims, k)[:k]          # O(n) instead of O(n log n)
    return idx[np.argsort(-sims[idx])], sims     # then sort just the k

# Complexity: O(n*d) for the dot products + O(n) for the partition.
# Say aloud: this is exact kNN. At millions of vectors you'd use an ANN index
# (HNSW / IVF-PQ) and trade a little recall for orders-of-magnitude speed.`,
  },
  {
    id: "ndcg",
    category: "Retrieval",
    emoji: "🏆",
    label: "NDCG@k",
    color: "#D84315", bg: "#FBE9E7",
    description: "Know the formula: DCG = Σ (2^rel − 1)/log₂(i+1), normalized by the ideal ordering.",
    code: `import numpy as np

def dcg_at_k(relevances, k):
    rel = np.asarray(relevances)[:k]
    discounts = np.log2(np.arange(2, len(rel) + 2))   # i starts at 1 -> log2(i+1)
    return float(np.sum((2 ** rel - 1) / discounts))

def ndcg_at_k(relevances, k):
    """relevances: graded relevance in the order the system returned them."""
    actual = dcg_at_k(relevances, k)
    ideal  = dcg_at_k(sorted(relevances, reverse=True), k)   # perfect ordering
    return actual / ideal if ideal > 0 else 0.0

print(round(ndcg_at_k([3, 2, 3, 0, 1, 2], k=6), 4))

# Why normalize? So scores are comparable across queries that have different
# numbers of relevant documents. Why 2^rel - 1? It rewards highly-relevant
# items disproportionately. Why the log discount? Position matters, but with
# diminishing severity.`,
  },
  {
    id: "biasvar",
    category: "Diagnostics",
    emoji: "🎯",
    label: "Bias-variance decomposition demo",
    color: "#C62828", bg: "#FDECEA",
    description: "Run this and change the numbers. Watching degree 9 explode teaches more than reading about it.",
    code: `import numpy as np
rng = np.random.default_rng(42)

def true_f(x):
    return np.sin(2 * np.pi * x)          # the real pattern; never seen in practice

def make_dataset(n=30, noise=0.3):
    x = rng.uniform(0, 1, n)
    return x, true_f(x) + rng.normal(0, noise, n)

x_test = np.linspace(0, 1, 100)
y_true_test = true_f(x_test)

for degree in [1, 2, 3, 5, 9]:
    preds = []
    for _ in range(200):                       # 200 different training sets
        x, y = make_dataset()
        preds.append(np.polyval(np.polyfit(x, y, degree), x_test))
    preds = np.array(preds)                    # (200 models, 100 points)

    bias_sq  = np.mean((preds.mean(axis=0) - y_true_test) ** 2)
    variance = np.mean(preds.var(axis=0))
    print(f"degree {degree}: bias^2={bias_sq:8.4f}  variance={variance:10.4f}")

# Verified output:
# degree 1: bias^2=  0.2042  variance=    0.0250   <- underfitting
# degree 2: bias^2=  0.2062  variance=    0.0458
# degree 3: bias^2=  0.0048  variance=    0.0172   <- sweet spot
# degree 5: bias^2=  0.0001  variance=    0.0473
# degree 9: bias^2=  0.3656  variance=  159.7369   <- overfitting, catastrophically`,
  },
  {
    id: "splits",
    category: "Diagnostics",
    emoji: "✂️",
    label: "Stratified split + leakage-safe pipeline",
    color: "#2E7D32", bg: "#E8F5E9",
    description: "The Pipeline pattern makes an entire class of leakage bug structurally impossible.",
    code: `from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# 1. Split off TEST first and leave it alone
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y)

# 2. Split the rest into train/validation
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.18, random_state=42, stratify=y_temp)

# stratify=y preserves the class ratio. Without it, a random split on
# 1%-positive data can produce a validation set with almost no positives.

# 3. Pipeline: the scaler is refit on each fold's TRAINING portion only,
#    so test statistics can never leak in.
pipe = Pipeline([('scaler', StandardScaler()),
                 ('model',  LogisticRegression(max_iter=1000))])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='roc_auc')
print(f"AUC: {scores.mean():.3f} +/- {scores.std():.3f}")
# Report the STD. 0.82 +/- 0.09 means you can't distinguish this from 0.75.`,
  },
  {
    id: "convshape",
    category: "Diagnostics",
    emoji: "📐",
    label: "Conv shape & parameter calculator",
    color: "#37474F", bg: "#ECEFF1",
    description: "Verify shapes by hand BEFORE writing the Linear layer. Practise on five made-up configs.",
    code: `def conv_out(W, K, P, S):
    """Output spatial size of a conv layer."""
    return (W - K + 2*P) // S + 1

def conv_params(K, C_in, C_out):
    """Parameter count of a conv layer (+1 for the bias per filter)."""
    return (K * K * C_in + 1) * C_out

# Worked examples (all verified):
print(conv_out(32, 3, 1, 1))        # 32  - "same" padding preserves size
print(conv_out(32, 3, 0, 1))        # 30  - no padding shrinks
print(conv_out(224, 7, 3, 2))       # 112 - stride 2 halves it
print(conv_params(3, 3, 16))        # 448 - vs ~50 MILLION for an equivalent dense layer

# Tracing a whole small CNN:
size = 32
size = conv_out(size, 3, 1, 1)   # 32 after conv1
size = size // 2                 # 16 after pool1
size = conv_out(size, 3, 1, 1)   # 16 after conv2
size = size // 2                 #  8 after pool2
print(f"Linear input = 32 * {size} * {size} = {32*size*size}")   # 2048`,
  },
  {
    id: "pytorch",
    category: "Frameworks",
    emoji: "🔥",
    label: "PyTorch training loop",
    color: "#B84A00", bg: "#FCEEE7",
    description: "The zero_grad() line is the most common PyTorch bug and a classic question.",
    code: `import torch, torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

model = nn.Sequential(
    nn.Linear(d, 64), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(64, 1)
)
criterion = nn.BCEWithLogitsLoss()     # fuses sigmoid + BCE: numerically stable
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)

loader = DataLoader(TensorDataset(X_t, y_t), batch_size=64, shuffle=True)

for epoch in range(50):
    model.train()                      # dropout ACTIVE
    for xb, yb in loader:
        optimizer.zero_grad()          # <- forget this and gradients ACCUMULATE
        loss = criterion(model(xb).squeeze(), yb)
        loss.backward()                # backprop
        nn.utils.clip_grad_norm_(model.parameters(), 5.0)   # exploding-gradient guard
        optimizer.step()

    model.eval()                       # dropout DISABLED, batchnorm uses running stats
    with torch.no_grad():
        val_loss = criterion(model(X_val_t).squeeze(), y_val_t)

# Three bugs worth naming aloud:
#   1. missing optimizer.zero_grad() -> gradients pile up across batches
#   2. missing model.eval() -> dropout active at inference, random worse results
#   3. missing torch.no_grad() at eval -> wasted memory building a graph`,
  },
];

export const ML_CODE_CATEGORIES = ["Core", "Deep learning", "Metrics", "Vision", "Retrieval", "Diagnostics", "Frameworks"];

export const ALSO_DRILL = [
  "A minimal 2-layer NN forward + backward in NumPy — the single most common 'from scratch' ask",
  "Train/val split with stratification, by hand",
  "Batching a dataset / a simple Dataset + DataLoader loop in PyTorch",
  "Standard LeetCode-medium arrays/hashmaps/heaps — top-k frequent, merge intervals, sliding window",
  "Writing the attention equation from memory, five times",
  "Conv output size and parameter count on five made-up configurations",
];
