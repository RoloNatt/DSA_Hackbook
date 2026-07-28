// ─── CLASSIFICATION METRICS, BUILT FROM ZERO ────────────────────────────────
// Build in order. Do not skip to ROC.

export const METRICS_INTRO = {
  h: "First: what a classifier actually outputs",
  body: "This is the missing piece that makes ROC curves confusing.\n\nA classifier does NOT output \"spam\" or \"not spam\". It outputs a SCORE — usually a probability between 0 and 1.\n\n    model.predict_proba(X)[:, 1]\n    # array([0.95, 0.80, 0.60, 0.35, 0.70, 0.40, 0.30, 0.20, 0.15, 0.05])\n\nTo turn a score into a decision, you pick a THRESHOLD:\n\n    predictions = (scores >= 0.5).astype(int)\n\nThe threshold is a CHOICE YOU MAKE, not something the model decides. 0.5 is a default, not a law. And every metric that involves counting correct predictions depends on which threshold you chose.\n\nThat single fact is why ROC curves exist. Hold onto it.",
};

export const CONFUSION_MATRIX = {
  h: "The confusion matrix",
  diagram: `                     Model says YES        Model says NO
                    ┌───────────────────┬───────────────────┐
Actually YES        │  True Positive    │  False Negative   │
                    │      (TP)         │      (FN)         │  ← you MISSED it
                    ├───────────────────┼───────────────────┤
Actually NO         │  False Positive   │  True Negative    │
                    │      (FP)         │      (TN)         │
                    └───────────────────┴───────────────────┘
                       ↑ FALSE ALARM`,
  mnemonic: "How to read the names so you never mix them up:\n\n• The SECOND word is what the MODEL SAID. \"Positive\" = model said yes.\n• The FIRST word is whether the model was RIGHT. \"False\" = it was wrong.\n\nSo a False Positive = the model said positive, and that was false → a false alarm.\nA False Negative = the model said negative, and that was false → a miss.",
  code: `import numpy as np

def confusion(y_true, y_pred):
    TP = int(((y_pred == 1) & (y_true == 1)).sum())
    FP = int(((y_pred == 1) & (y_true == 0)).sum())
    FN = int(((y_pred == 0) & (y_true == 1)).sum())
    TN = int(((y_pred == 0) & (y_true == 0)).sum())
    return TP, FP, FN, TN

# or with sklearn (note the unpacking order):
from sklearn.metrics import confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()`,
};

export const RATES = {
  h: "The four rates — including TPR and FPR",
  intro: "Every classification metric is a ratio built from those four numbers. Here are all of them with every alias, because the alias soup is half the confusion.",
  headers: ["Rate", "Formula", "Plain English", "Also called"],
  rows: [
    ["TPR — True Positive Rate", "TP / (TP + FN)", "Of all the ACTUAL POSITIVES, what fraction did I catch?", "Recall, Sensitivity, Hit rate"],
    ["FPR — False Positive Rate", "FP / (FP + TN)", "Of all the ACTUAL NEGATIVES, what fraction did I wrongly flag?", "Fall-out, 1 − Specificity"],
    ["TNR — True Negative Rate", "TN / (TN + FP)", "Of all the actual negatives, what fraction did I correctly leave alone?", "Specificity"],
    ["FNR — False Negative Rate", "FN / (FN + TP)", "Of all the actual positives, what fraction did I miss?", "Miss rate, 1 − Recall"],
  ],
  critical: "THE CRITICAL STRUCTURAL POINT, and the reason TPR and FPR are paired in a ROC curve:\n\n• TPR looks ONLY at the positive row. Denominator = all actual positives.\n• FPR looks ONLY at the negative row. Denominator = all actual negatives.\n\nThey are computed on COMPLETELY SEPARATE POPULATIONS. That's deliberate. It means neither is affected by how many of each class you have — and that property is exactly what ROC curves depend on.\n\nPRECISION IS DIFFERENT, and this is where people get lost:\n\n    Precision = TP / (TP + FP)\n\nPrecision's denominator MIXES BOTH ROWS — TP from the positive row plus FP from the negative row. That's why precision is sensitive to class imbalance and TPR/FPR aren't. File that away; it becomes the whole ROC-vs-PR argument.",
  recallIsTPR: "Recall and TPR are the SAME NUMBER. Different names, same formula. \"Recall\" is used when pairing with precision; \"TPR\" is used when pairing with FPR. That naming collision trips up nearly everyone.",
};

// Worked threshold sweep — 4 actual positives, 6 actual negatives.
// This exact data drives the interactive Metrics Lab.
export const SWEEP_DATA = {
  yTrue: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  yScores: [0.95, 0.80, 0.60, 0.35, 0.70, 0.40, 0.30, 0.20, 0.15, 0.05],
  P: 4,
  N: 6,
  thresholds: [1.01, 0.90, 0.75, 0.65, 0.50, 0.32, 0.25, 0.10, 0.0],
  table: {
    headers: ["Threshold", "TP", "FP", "FN", "TN", "TPR", "FPR", ""],
    rows: [
      ["1.01", 0, 0, 4, 6, "0.00", "0.00", "flag nothing"],
      ["0.90", 1, 0, 3, 6, "0.25", "0.00", ""],
      ["0.75", 2, 0, 2, 6, "0.50", "0.00", ""],
      ["0.65", 2, 1, 2, 5, "0.50", "0.17", "first false alarm"],
      ["0.50", 3, 1, 1, 5, "0.75", "0.17", ""],
      ["0.32", 4, 2, 0, 4, "1.00", "0.33", "caught them all"],
      ["0.25", 4, 3, 0, 3, "1.00", "0.50", ""],
      ["0.10", 4, 5, 0, 1, "1.00", "0.83", ""],
      ["0.00", 4, 6, 0, 0, "1.00", "1.00", "flag everything"],
    ],
  },
  reading: "Read down the table. As you LOWER the threshold you flag more things, so:\n\n• TPR only goes UP (you catch more real positives)\n• FPR only goes UP (you also raise more false alarms)\n\nYou cannot increase one without increasing the other. That's the fundamental tradeoff, and the two endpoints are the degenerate cases: flag nothing (0,0) and flag everything (1,1).",
  code: `P = (y_true == 1).sum()   # 4 actual positives
N = (y_true == 0).sum()   # 6 actual negatives

for t in [1.01, 0.90, 0.75, 0.65, 0.50, 0.32, 0.25, 0.10, 0.0]:
    pred = (y_scores >= t).astype(int)
    TP = ((pred == 1) & (y_true == 1)).sum()
    FP = ((pred == 1) & (y_true == 0)).sum()
    print(f"thresh={t:.2f}  TPR={TP/P:.2f}  FPR={FP/N:.2f}")`,
};

export const ROC = {
  h: "The ROC curve is that table, plotted",
  body: "ROC stands for Receiver Operating Characteristic — a name from WWII radar operators deciding how sensitive to set their equipment. The name tells you nothing useful; ignore it.\n\nThe ROC curve is just: plot FPR on the x-axis, TPR on the y-axis, ONE POINT PER THRESHOLD.\n\nEvery point on that curve is THE SAME MODEL at a different threshold. The curve doesn't compare models — it shows one model's full range of possible operating points.",
  reading: [
    "TOP-LEFT corner (0, 1) = perfect. High TPR, zero FPR. Catch everything, never false-alarm.",
    "The DIAGONAL = random guessing. If you flag 30% of things at random, you catch 30% of positives and 30% of negatives — TPR = FPR.",
    "ABOVE the diagonal = better than random. BELOW = worse than random (and means you should flip your predictions).",
    "The closer the curve hugs the top-left, the better the model.",
  ],
  code: `from sklearn.metrics import roc_curve, roc_auc_score
fpr, tpr, thresholds = roc_curve(y_true, y_scores)
# fpr and tpr are exactly the columns from the sweep table above
print(roc_auc_score(y_true, y_scores))   # 0.875`,
  auc: {
    h: "AUC — collapsing the curve to one number",
    body: "AUC = Area Under the Curve. Literally the area under the ROC curve, between 0 and 1.\n\n• 1.0 = perfect\n• 0.5 = random guessing (the area under the diagonal is half the unit square)\n• Below 0.5 = worse than random\n\nTHE INTERPRETATION WORTH MEMORIZING, because it's a common interview question and it sounds impressive:\n\n    AUC is the probability that a randomly chosen POSITIVE example gets a\n    HIGHER SCORE than a randomly chosen NEGATIVE example.\n\nSo AUC = 0.875 means: pick one real positive and one real negative at random, and 87.5% of the time the model scores the positive higher.",
    forAndAgainst: "WHAT AUC IS FOR: comparing models INDEPENDENTLY of the threshold. It answers \"does this model rank positives above negatives?\" without committing to an operating point. Genuinely useful during model development.\n\nWHAT AUC IS NOT FOR: deciding your actual operating point. AUC summarizes the WHOLE curve, including regions you'd never operate in. A model with great AUC might be useless at the specific FPR your business can tolerate. In production you pick a POINT on the curve, not the area under it.",
  },
};

export const ROC_VS_PR = {
  h: "ROC vs Precision-Recall — the highest-value metric question",
  setup: "Take a realistic imbalanced problem: 10,000 transactions, 100 of them fraud (1%). Same model, same predictions, two metrics.",
  code: `import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(7)
n = 10000
y = np.zeros(n, int); y[:100] = 1          # 1% positive
rng.shuffle(y)
scores = rng.normal(0, 1, n) + y * 1.8     # a mediocre model

print("ROC-AUC:", round(roc_auc_score(y, scores), 3))
print("PR-AUC :", round(average_precision_score(y, scores), 3))
print("Accuracy of always predicting negative:", round((y == 0).mean(), 4))

# Verified output:
# ROC-AUC: 0.894
# PR-AUC : 0.189
# Accuracy of 'always predict negative': 0.99`,
  punchline: "Stop and look at that. SAME model, SAME data. ROC-AUC says 0.894 — that looks like a good model. PR-AUC says 0.189 — that looks like a nearly useless one. And a model that does nothing at all scores 99% accuracy.",
  mechanism: "WHY does ROC-AUC look so flattering? Because FPR is FP/(FP+TN), and with 9,900 negatives, TN is enormous. You can rack up HUNDREDS of false positives and FPR barely moves — 300 false positives out of 9,900 negatives is an FPR of only 0.03, which looks excellent on the chart. But from the user's perspective, if you flagged 300 things to catch 50 frauds, your PRECISION is 14% and your review team is drowning.\n\nPrecision has NO TN in its denominator (TP/(TP+FP)), so it can't hide behind the huge negative class. It tells you the truth about how much of your alarm volume is noise.",
  rule: {
    headers: ["Situation", "Use", "Why"],
    rows: [
      ["Classes roughly balanced", "ROC-AUC", "Threshold-independent, symmetric, easy to interpret"],
      ["Heavily imbalanced, care about the rare class", "PR-AUC", "ROC-AUC is misleadingly optimistic because TN dominates FPR"],
      ["Comparing models during development", "Either AUC", "You haven't picked a threshold yet"],
      ["Choosing your production threshold", "Neither — use the PR curve or a cost analysis", "AUC summarizes points you'd never operate at"],
      ["Probabilities feed a downstream decision", "Log loss + calibration", "You need the VALUE to be right, not just the ranking"],
    ],
  },
  theAnswer: "\"With heavy imbalance I'd use PR-AUC rather than ROC-AUC, because FPR's denominator includes all the true negatives — with 99% negatives you can generate hundreds of false positives and barely move FPR, so ROC looks good while precision is terrible. Precision has no TN term, so it reflects what the user actually experiences.\"\n\nThat answer, WITH the reason attached, is a strong signal.",
};

export const PRECISION_RECALL = {
  h: "Precision, recall, F1 — and picking a threshold on purpose",
  formulas: "Precision = TP / (TP + FP)   # of what I FLAGGED, how much was right\nRecall    = TP / (TP + FN)   # of what was REAL, how much did I catch   [= TPR]\nF1        = 2·P·R / (P + R)",
  keepStraight: "How to keep them straight: PRECISION is about the QUALITY of your alarms. RECALL is about the COVERAGE of your catching.",
  f1Note: "Why F1 uses a HARMONIC mean rather than a normal average: the harmonic mean punishes imbalance. Precision 1.0 and recall 0.0 gives an arithmetic mean of 0.5 (looks fine!) but an F1 of 0.0 (correctly says: useless).",
  accuracyTrap: "WHY ACCURACY CAN BE A LIE — the example to give:\n\n\"1 in 1,000 transactions is fraud. I build a model that says 'not fraud' every single time. It has 99.9% accuracy and catches zero fraud. It is completely worthless. That's why I never evaluate imbalanced problems on accuracy.\"\n\nDelivered cleanly, that's a strong answer.",
  whichToOptimize: {
    headers: ["Situation", "Optimize", "Why"],
    rows: [
      ["Cancer screening", "Recall", "Missing a real cancer is catastrophic. A false alarm just means another test"],
      ["Spam filter", "Precision", "Sending a real job offer to spam is much worse than letting one spam through"],
      ["Fraud detection", "Recall (usually)", "Missing fraud costs money directly. False alarms cost a review"],
      ["Search results", "Precision", "Users only look at the top few. They must be right"],
      ["Legal document discovery", "Recall", "Missing a relevant document is a legal failure"],
      ["Recommending videos", "Precision", "A bad recommendation wastes a slot and annoys the user"],
    ],
  },
  generalRule: "THE SENTENCE TO MEMORIZE VERBATIM: \"It depends entirely on the relative cost of a false positive versus a false negative. I'd ask the business what each mistake costs before choosing.\" That answers a whole family of questions.",
  tradeoff: "The precision/recall tradeoff: they pull against each other. Flag everything as fraud → recall 100%, precision terrible. Flag only the one case you're certain about → precision 100%, recall terrible. You control the balance by moving the THRESHOLD.",
  notJustF1: "\"Why not just optimize F1 for everything?\" Because F1 assumes precision and recall matter EQUALLY, and they almost never do. In fraud, a missed fraud costs the transaction value and a false positive costs a few minutes of review — those aren't equal. F1 also ignores true negatives entirely and is threshold-dependent. I'd rather express the actual cost asymmetry: optimize recall subject to a precision floor set by review capacity, or build an explicit cost matrix. F1 is a reasonable default only when you genuinely have no information about relative costs, which is rare once you talk to the business.\n\nIf they can't tell you the costs: present the precision-recall curve and let them pick the operating point by seeing the tradeoff concretely — \"at this threshold you catch 80% of fraud and review 400 cases a day; at this one you catch 90% and review 1,200.\" People can answer that even when they can't produce a cost number.",
  thresholdCode: `from sklearn.metrics import precision_recall_curve
import numpy as np

precision, recall, thresholds = precision_recall_curve(y_true, y_scores)

# Option A: maximize F1
f1 = 2 * precision * recall / (precision + recall + 1e-12)
best = np.argmax(f1[:-1])
print(f"Best F1 threshold: {thresholds[best]:.3f}")

# Option B: highest recall subject to a PRECISION FLOOR
#           (usually the REAL production requirement)
MIN_PRECISION = 0.90
ok = precision[:-1] >= MIN_PRECISION
if ok.any():
    idx = np.argmax(recall[:-1] * ok)
    print(f"Threshold at precision>={MIN_PRECISION}: {thresholds[idx]:.3f}, "
          f"recall={recall[idx]:.3f}")`,
  productionNote: "Option B is what real systems do. The business says \"we can review 500 cases a day\" or \"we can't tolerate more than 10% false alarms,\" and that constraint fixes your precision floor. Then you maximize recall under it. Saying this out loud reads as production experience.",
};

export const OTHER_METRICS = {
  h: "The rest of the metric zoo",
  groups: [
    {
      name: "Calibration",
      body: "Log loss for calibrated probabilities. Brier score = MSE on probabilities. Calibration matters when the probability itself is CONSUMED downstream (ad bidding, risk scoring) — a predicted 0.7 should actually happen 70% of the time. Fix miscalibration with Platt scaling or isotonic regression on a held-out set. Note that gradient-boosted trees are NOT reliably calibrated by default, especially with heavy regularization — they tend to be over-confident toward the extremes.",
    },
    {
      name: "Regression",
      body: "MSE · RMSE (same units as the target — easy to explain to a stakeholder) · MAE (less affected by outliers) · R² (fraction of variance explained; 1.0 perfect, 0 means no better than always guessing the mean, and it CAN go negative) · MAPE (breaks when y ≈ 0).",
    },
    {
      name: "Ranking / retrieval",
      body: "Precision@k · Recall@k · MAP · MRR = mean of 1/(rank of first relevant result) · NDCG@k = DCG@k / IDCG@k where DCG = Σ (2^relᵢ − 1)/log₂(i+1). NDCG rewards putting highly relevant items at the top and is normalized so scores compare across queries. Know the formula.",
    },
    {
      name: "Generation (NLP)",
      body: "BLEU (n-gram precision + brevity penalty, translation) · ROUGE (n-gram recall, summarization) · METEOR · Perplexity = exp(average cross-entropy) — how \"surprised\" the model is, lower is better · BERTScore (embedding similarity, correlates better with humans) · LLM-as-judge for open generation.",
    },
  ],
};

export const METRIC_DECISION = {
  headers: ["Situation", "Metric", "Why"],
  rows: [
    ["Balanced classification", "Accuracy, ROC-AUC", "Simple and meaningful"],
    ["Imbalanced classification", "PR-AUC, recall at fixed precision", "ROC-AUC is optimistic when TN dominates"],
    ["False alarms are expensive", "Precision", "Spam filter deleting real mail"],
    ["Misses are expensive", "Recall", "Cancer screening, fraud"],
    ["Need one number, both matter", "F1", "Harmonic mean punishes imbalance"],
    ["Probabilities feed a decision", "Log loss + calibration", "The value must be right, not just the ranking"],
    ["Regression", "RMSE (same units), MAE (robust), R²", "Choose by outlier sensitivity"],
    ["Ranking / retrieval", "NDCG, MRR, recall@k", "Position matters"],
  ],
};

export const METRIC_FOLLOWUP = "THE FOLLOW-UP YOU MUST NAIL: \"Your model has 99% accuracy. Are you happy?\"\n\n\"Not until I know the class balance, the baseline — both majority-class and whatever system exists today — the per-class recall, the cost asymmetry of FP vs FN, and how the offline metric maps to the business metric. If 99% of my data is one class, a model that always predicts that class gets 99% and is worthless. A model that doesn't beat the existing rules isn't worth deploying.\"";
