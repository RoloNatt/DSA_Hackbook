// ─── THE ALGORITHM ZOO ──────────────────────────────────────────────────────
// Everything beyond the four algorithms Google named explicitly. These come up
// as follow-ups ("what else would you try?") and in the ensembles question.

export const ALGO_ZOO = [
  {
    id: "rf",
    emoji: "🌲",
    name: "Random Forest",
    family: "Ensemble — bagging",
    color: "#2E7D32", bg: "#E8F5E9",
    oneLiner: "Ask 500 doctors instead of one, and make sure they saw different patients.",
    analogy: "Instead of asking one doctor, ask 500 and take the majority vote. Each doctor saw a slightly different set of patients and was allowed to consider only a random subset of symptoms — so they make DIFFERENT mistakes, and the mistakes cancel out.",
    how: "Bagging (Bootstrap Aggregating): train M trees on M bootstrap samples (sample WITH replacement), and average/vote their predictions. Random Forest adds the crucial extra: at EACH SPLIT, consider only a random subset of features (typically √d for classification).",
    keyInsight: "The randomness IS the mechanism, not a detail. Averaging reduces variance ONLY IF the models make different errors. Bagging alone leaves trees correlated, because the same dominant feature gets chosen at the top of every tree. The random feature subsetting is what DECORRELATES them. If all the trees were identical, averaging would achieve exactly nothing.",
    extras: "OOB (out-of-bag) error gives a FREE validation estimate from the ~37% of samples each tree never saw. Why 37%? (1−1/n)ⁿ → 1/e ≈ 0.368.\n\nNumber of trees is monotonic — more never hurts accuracy, it just costs compute. Gains flatten by a few hundred. Unlike boosting, you CANNOT overfit by adding trees, which is why RF is more forgiving.",
    use: "Tabular data · want strong accuracy with minimal tuning · noisy labels · you want to parallelize training · you want free OOB validation.",
    dont: "You need to explain a single prediction precisely · very low-latency inference with a huge forest · data is images/text/audio.",
    code: `from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(
    n_estimators=300,      # more never hurts accuracy
    max_features='sqrt',   # <- THE key parameter: random feature subset per split
    n_jobs=-1,
    random_state=42
).fit(X_train, y_train)

importances = sorted(zip(feature_names, rf.feature_importances_),
                     key=lambda t: -t[1])`,
    codeNote: "max_features='sqrt' is what makes it a Random Forest rather than just bagged trees.",
  },
  {
    id: "boosting",
    emoji: "🚀",
    name: "Gradient Boosting (XGBoost / LightGBM / CatBoost)",
    family: "Ensemble — boosting",
    color: "#B84A00", bg: "#FCEEE7",
    oneLiner: "Each new tree is trained specifically on what the ensemble still gets wrong.",
    analogy: "A student takes a practice test. You look at what they got wrong and build the next lesson entirely around those mistakes. Then test again and build the next lesson around the remaining mistakes. Each round targets what's still broken.",
    how: "Train trees SEQUENTIALLY, each one fitting the NEGATIVE GRADIENT of the loss with respect to the current predictions (for MSE, that's just the residual).\n\n    F_m(x) = F_{m−1}(x) + η·h_m(x)\n\nAdaBoost is the older variant: reweight misclassified samples higher each round.",
    keyInsight: "Boosting attacks BIAS (primarily); bagging attacks VARIANCE. That's the cleanest one-line distinction, and it explains everything else about them: boosting uses shallow weak learners and chases errors (so it chases label noise too); bagging uses deep strong learners and averages them (so it's robust to noise).",
    extras: "XGBoost adds second-order (Newton) optimization plus explicit regularization on leaf weights and tree complexity. LightGBM uses histogram binning and leaf-wise growth — much faster on large data. CatBoost handles categoricals natively with ordered target statistics.\n\nIF IT'S OVERFITTING: lower the learning rate and use early stopping — that pair has the most leverage. Then reduce max_depth, then increase min_child_weight, then subsample rows and columns. Resist just cutting the tree count; with a low LR and early stopping the count takes care of itself.",
    use: "Tabular data and you want maximum accuracy · you can afford tuning time · labels are clean.",
    dont: "Labels are noisy (it will diligently learn the noise) · you need fast training with little tuning · data is images/text.",
    code: `from sklearn.ensemble import HistGradientBoostingClassifier
gb = HistGradientBoostingClassifier(
    learning_rate=0.05,       # smaller = more trees needed, better generalization
    max_iter=500,
    max_depth=6,
    early_stopping=True,      # <- use this, it tunes the tree count for you
    validation_fraction=0.15
).fit(X_train, y_train)`,
  },
  {
    id: "knn",
    emoji: "👥",
    name: "k-Nearest Neighbours",
    family: "Instance-based",
    color: "#00838F", bg: "#E0F7FA",
    oneLiner: "No training at all. To classify a point, ask its k closest neighbours.",
    analogy: "Want to know if a restaurant is good? Ask the 5 people who live closest to it.",
    how: "A \"lazy learner\": store the data. At prediction time, find the k closest stored points and take the majority vote (classification) or average (regression).",
    keyInsight: "Small k → low bias, high variance, noise-sensitive. Large k → smoother, higher bias. k=1 gives ZERO training error and usually overfits badly.\n\nDirect relevance to modern systems: VECTOR SEARCH in a RAG pipeline is kNN. FAISS, Qdrant and Pinecone are all doing APPROXIMATE k-nearest-neighbours over embeddings. Saying that connects classical ML to modern retrieval and lands well.",
    extras: "MUST scale features, or a feature measured in thousands drowns out one measured in decimals.\n\nPrediction cost is O(n·d) — mitigate with KD-trees (low dimensions) or ANN indexes: HNSW, IVF, PQ.\n\nSuffers badly from the CURSE OF DIMENSIONALITY: in high dimensions everything is roughly equidistant from everything else, and \"nearest\" stops meaning anything.",
    use: "A dead-simple baseline · small data · \"similar\" is genuinely meaningful for the problem (recommendations, retrieval).",
    dont: "Lots of data (every prediction scans everything) · lots of features (curse of dimensionality) · low-latency requirements.",
    code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Scaling is MANDATORY - wrap it in a pipeline so it's fit per fold
knn = Pipeline([
    ('scale', StandardScaler()),
    ('knn', KNeighborsClassifier(n_neighbors=5))
]).fit(X_train, y_train)`,
  },
  {
    id: "kmeans",
    emoji: "🎯",
    name: "k-Means Clustering",
    family: "Unsupervised — clustering",
    color: "#6A1B9A", bg: "#F3E5F5",
    oneLiner: "Assign to nearest centroid, move centroids to the middle, repeat until stable.",
    analogy: "You have 10,000 customers and no labels — nobody told you what type each customer is. You want to discover natural groupings. Maybe there are budget shoppers, luxury shoppers, and bulk buyers. You don't know in advance. That's clustering.",
    how: "Five plain sentences:\n1. Choose k. Place k centroids (use k-means++ — pick initial centroids far apart — to avoid bad local minima).\n2. Assign every point to its nearest centroid. Now you have k groups.\n3. Move each centroid to the exact mean of the points assigned to it.\n4. Some points are now closer to a different centroid — reassign everything.\n5. Repeat 3–4 until nothing moves.\n\nMinimizes within-cluster sum of squares (inertia).",
    keyInsight: "Guaranteed to converge, but only to a LOCAL optimum — which is why different random starts give different final answers. Run multiple restarts (n_init) and keep the lowest inertia. If results are WILDLY unstable across runs, that's usually telling you the cluster structure isn't real: the data doesn't actually have k well-separated groups.",
    extras: "CHOOSING k: the elbow method (plot inertia against k and find the bend) · silhouette score ((b−a)/max(a,b), range −1 to 1) · gap statistic · or, best, downstream task performance.\n\nWEAKNESSES: you must pick k; it assumes spherical, similar-sized, similar-density clusters; outliers drag centroids around; it's sensitive to scale.\n\nALTERNATIVES: Gaussian Mixture Models (soft assignments via EM, elliptical clusters), hierarchical/agglomerative (gives a dendrogram).",
    use: "Unlabelled data, want to discover groups · clusters are roughly round and similar in size · you have a reasonable guess at k.",
    dont: "You don't know k and can't estimate it · clusters are irregularly shaped · outliers matter and shouldn't be forced into a group.",
    code: `import numpy as np

def kmeans(X, k, iters=100, seed=0):
    rng = np.random.default_rng(seed)
    centroids = X[rng.choice(len(X), k, replace=False)]
    for _ in range(iters):
        d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(-1)   # (n,k)
        labels = d.argmin(1)
        new = np.array([X[labels == j].mean(0) if np.any(labels == j)
                        else centroids[j] for j in range(k)])
        if np.allclose(new, centroids):
            break
        centroids = new
    return centroids, labels

# Edge cases to MENTION ALOUD: empty clusters, k > n, convergence to local
# minima -> multiple restarts. Complexity O(iters * n * k * d).`,
  },
  {
    id: "dbscan",
    emoji: "🌌",
    name: "DBSCAN",
    family: "Unsupervised — density clustering",
    color: "#37474F", bg: "#ECEFF1",
    oneLiner: "Groups by density, not distance-to-a-centre. Finds k itself and labels outliers as noise.",
    how: "Points in dense neighbourhoods form clusters; points in sparse regions are labelled NOISE. Two parameters: ε (the neighbourhood radius) and minPts (how many neighbours make a region \"dense\").",
    keyInsight: "The reason to reach for it over k-means: you don't know how many clusters there are, the clusters aren't spherical, or you NEED outliers identified rather than forced into a group. Anomaly detection is the obvious case — k-means has to assign every point somewhere, so outliers drag centroids around and get hidden. DBSCAN labels them as noise, which is often the answer you actually wanted.",
    extras: "Cost: ε and minPts need tuning, and it struggles when clusters have very different densities.\n\nHOW TO PICK ε: the k-distance plot — sort every point by its distance to its k-th nearest neighbour and look for the elbow. Same visual logic as the elbow method, and like it, somewhat subjective.",
    use: "Unknown number of clusters · arbitrary cluster shapes · you want outliers identified.",
    dont: "Clusters have very different densities · very high dimensions (distance degrades).",
    compare: {
      headers: ["", "k-Means", "DBSCAN"],
      rows: [
        ["Need to specify k?", "Yes", "No"],
        ["Cluster shapes", "Round blobs only", "Any shape"],
        ["Outliers", "Forced into a cluster", "Labelled as noise"],
        ["Speed", "Fast", "Slower"],
        ["Main knobs", "k", "ε (radius) + minPts"],
      ],
    },
  },
  {
    id: "pca",
    emoji: "📐",
    name: "PCA — Principal Component Analysis",
    family: "Unsupervised — dimensionality reduction",
    color: "#1565C0", bg: "#E3F2FD",
    oneLiner: "Project onto the orthogonal directions of maximum variance.",
    analogy: "You have a 3D object and want to photograph it from the single angle that shows the most detail. Photographing a pencil end-on gives you a dot — useless. Photographing it side-on shows its full length. PCA finds the \"side-on\" angle.",
    how: "Centre the data → compute the covariance matrix → take its eigenvectors/eigenvalues (or use SVD directly, which is more numerically stable) → the eigenvectors are the COMPONENTS, the eigenvalues are the VARIANCE EXPLAINED → keep enough components to reach e.g. 95% explained variance.",
    keyInsight: "PCA doesn't DROP features, it RECOMBINES them — it finds directions of maximum variance that may be blends of many correlated features, keeping the information while reducing the dimension count. Dropping features throws away whatever signal they carried.\n\nBUT: maximum variance is NOT the same as maximum usefulness. A low-variance direction can be exactly the discriminative one. A near-constant feature that perfectly separates two rare classes will get discarded by PCA and would have been your best predictor. If interpretability matters, do proper feature selection instead. (LDA optimizes for discrimination rather than variance.)",
    extras: "MUST standardize first if features have different units, otherwise the largest-scale feature dominates automatically.\n\nUSES: compression, noise reduction, visualization, decorrelation, speeding up training, and fixing multicollinearity.\n\nCONTRAST with t-SNE/UMAP: those are NON-LINEAR, for VISUALIZATION ONLY, preserve local neighbourhoods but not global distances, are non-deterministic, and you should NOT feed their output into a downstream model.",
    use: "Too many features · visualize high-dimensional data in 2D · speed up training · remove noise and redundancy.",
    dont: "You need interpretable features · the important structure is non-linear · variance and signal are misaligned.",
  },
  {
    id: "nb",
    emoji: "📧",
    name: "Naive Bayes",
    family: "Probabilistic",
    color: "#9B6400", bg: "#FBF0DC",
    oneLiner: "Multiply per-feature likelihoods under a (false) independence assumption. Works anyway.",
    analogy: "A spam filter that counts words. It's seen \"viagra\" in 900 spam emails and 3 real ones, so seeing it pushes the probability toward spam. It multiplies these little pieces of evidence together.",
    how: "Apply Bayes' rule with the \"naive\" assumption that features are CONDITIONALLY INDEPENDENT given the class:\n\n    P(y|x) ∝ P(y) · Π P(xᵢ|y)",
    keyInsight: "\"Naive\" because it pretends every word is independent of every other, which is obviously false (\"New York\" is not two unrelated words). It works surprisingly well anyway, because for CLASSIFICATION you only need the RANKING of probabilities to be right, not the probabilities themselves. The probabilities it outputs are badly calibrated; the argmax is usually fine.",
    extras: "VARIANTS: Multinomial (word counts), Bernoulli (binary presence), Gaussian (continuous features).\n\nLaplace/additive smoothing (+α) prevents a single unseen word from zeroing out the entire product.\n\nExtremely fast — a great baseline.",
    use: "Text classification · very fast baselines · small data · real-time requirements.",
    dont: "Feature interactions genuinely matter · you need well-calibrated probability values.",
  },
];

// ── Bagging vs boosting — the table they want ───────────────────────────────
export const BAGGING_VS_BOOSTING = {
  headers: ["", "Bagging / Random Forest", "Boosting"],
  rows: [
    ["How trees are built", "All at once, independently", "One at a time, each fixing the last's errors"],
    ["Parallelizable?", "Yes, easily", "No — inherently sequential"],
    ["Primarily reduces", "VARIANCE (instability, overfitting)", "BIAS (not being accurate enough)"],
    ["Base learners", "Deep, low-bias, high-variance trees", "Shallow, high-bias \"weak\" stumps"],
    ["Sensitive to noisy labels?", "No, quite robust", "YES — it will diligently chase the noise"],
    ["Overfit by adding models?", "No — monotonic", "Yes — needs early stopping"],
    ["Tuning effort", "Low — works out of the box", "High — learning rate, depth, rounds"],
    ["Typical accuracy", "Very good", "Usually better, IF tuned properly"],
    ["Choose when", "You want reliable results fast, or labels are noisy", "You want maximum accuracy and can invest tuning time"],
  ],
  stacking: "STACKING is the third option: train a meta-model on the OUT-OF-FOLD predictions of several base models. More powerful, more complex, and easy to leak with if you use in-fold predictions.",
};

// ── Which algorithm for which problem ───────────────────────────────────────
export const ALGO_SELECTOR = {
  headers: ["Your situation", "Use this", "Why"],
  rows: [
    ["Predicting a number, simple relationship", "Linear regression", "Simple, fast, explainable, a proper baseline"],
    ["Yes/no answer, need probabilities + explainability", "Logistic regression", "The standard baseline; still everywhere in production"],
    ["Spreadsheet-shaped data, want maximum accuracy", "XGBoost / LightGBM", "Beats everything else on tabular data"],
    ["Spreadsheet data, minimal tuning budget", "Random Forest", "Reliable out of the box, hard to break"],
    ["A human must read and audit the logic", "Decision tree", "It's literally a flowchart"],
    ["Small data, many features (e.g. text)", "SVM", "Works well when features outnumber samples"],
    ["Text classification, need speed", "Naive Bayes", "Extremely fast, strong baseline"],
    ["Images / video", "CNN (or Vision Transformer)", "Built for spatial data"],
    ["Text, generation, chat", "Transformer / LLM", "Nothing else is close"],
    ["No labels, want to find groups", "k-Means or DBSCAN", "Clustering — pick by whether you know k and cluster shape"],
    ["Too many features", "PCA", "Compress while retaining variance"],
    ["Finding similar items", "kNN / vector search", "This is exactly what RAG retrieval is"],
    ["Sequential decisions with delayed rewards", "Reinforcement learning", "Only when actions have long-term consequences"],
  ],
};

export const SIMPLE_VS_COMPLEX = {
  headers: ["", "Simple (linear, logistic, small tree)", "Complex (deep nets, big ensembles)"],
  rows: [
    ["Data needed", "Little", "A lot"],
    ["Training cost", "Seconds", "Hours to months"],
    ["Explainable?", "Yes", "Barely"],
    ["Main risk", "Underfitting", "Overfitting"],
    ["Debugging", "Easy", "Hard"],
    ["When to use", "Baseline, small data, regulated domains, interpretability required", "Images, text, audio, huge data, complex patterns"],
  ],
  instinct: "THE SENIOR INSTINCT INTERVIEWERS LOOK FOR: always start simple, and only add complexity when you can SHOW the simple version isn't good enough. Saying \"I'd start with logistic regression as a baseline and only move to boosting or deep learning if it can't hit our target\" reads as experienced, not junior.",
};

export const CLASSICAL_VS_DEEP = {
  headers: ["", "Classical ML", "Deep Learning"],
  rows: [
    ["Data volume", "Hundreds to thousands of rows", "Tens of thousands+"],
    ["Feature engineering", "You design the features", "The model learns the features"],
    ["Hardware", "A laptop", "GPUs"],
    ["Best at", "Tabular / spreadsheet data", "Images, text, audio, video"],
    ["Interpretability", "Decent", "Poor"],
    ["Training time", "Seconds to minutes", "Hours to weeks"],
  ],
  theQuestion: "\"Why do trees still beat deep learning on tabular data?\" → \"Because tabular features are heterogeneous, at different scales, and often have hard thresholds rather than smooth relationships. Axis-aligned splits handle that natively — a tree learns 'income > 50k' as a hard boundary in one split, while a neural network has to approximate a step function with smooth activations. Neural networks are built to exploit STRUCTURE — spatial locality in images, sequence in text, relations in graphs — and tabular data has no such structure to exploit. Add that trees need almost no preprocessing and work at thousands of rows.\"\n\nFOLLOW-UP — when WOULD you use a neural network on tabular data? \"When there are high-cardinality categoricals I want to learn embeddings for; when I need to fuse tabular with text or image inputs in one model; when I want multi-task learning; or when I need online incremental learning. The multimodal fusion case is the most common real reason.\"",
};

export const GENERATIVE_VS_DISCRIMINATIVE = {
  h: "Generative vs discriminative — a common follow-up",
  body: "GENERATIVE models learn the joint distribution P(x, y) — they model how the data itself was produced, and can therefore generate new samples. Examples: Naive Bayes, GANs, VAEs, diffusion models, LLMs.\n\nDISCRIMINATIVE models learn P(y|x) directly — just the decision boundary. Examples: logistic regression, SVM, most neural classifiers.\n\nFor PURE CLASSIFICATION, discriminative models are usually better, because they spend all their capacity on the boundary rather than on modelling the full data distribution. Generative models win when you need to sample, handle missing features, or work with very little data (the extra structure acts as a prior).",
};

export const PARAMETRIC_VS_NON = {
  h: "Parametric vs non-parametric",
  body: "PARAMETRIC: a fixed number of parameters regardless of data size (linear regression, logistic regression, neural networks). Fast at inference, strong assumptions.\n\nNON-PARAMETRIC: the effective parameter count GROWS with the data (kNN, kernel SVM, decision trees). More flexible, but memory and inference cost scale with the dataset.\n\nThe name is misleading — non-parametric doesn't mean \"no parameters\", it means \"not a fixed number of them\".",
};
