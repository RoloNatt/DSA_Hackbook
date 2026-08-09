// Two-level explanations for the four most-probed architectures.
//
// `simple` is one paragraph that would satisfy someone who just wants the idea.
// `deep` is what you need when the interviewer keeps pushing — the maths, the
// assumptions, the failure modes, and the follow-up question that comes next.
//
// Kept as data so the same content can be attached to a lab and re-used
// elsewhere without duplication.

// ════════════════════════════════════════════════════════════════════════════
// CONVOLUTIONAL NEURAL NETWORKS
// ════════════════════════════════════════════════════════════════════════════

export const CNN_DEPTH = {
  simple:
    "A photo has far too many pixels to hand to a plain network — and a plain network would have to learn what a cat looks like separately for every position in the frame. A convolution fixes both problems at once: slide one small window of weights over the whole image, and reuse those same weights everywhere. The window learns to fire on one specific local pattern — an edge, a corner, a texture. Stack layers, and later windows look at earlier windows' outputs, so simple patterns compose into complicated ones: edges become corners, corners become eyes, eyes become faces. Pooling shrinks the picture between layers so the later windows cover more of the original image while the number of weights stays small.",

  deep: [
    {
      h: "The three ideas, and what each one buys you",
      body:
        "LOCAL CONNECTIVITY — a unit looks at a small patch, not the whole image. Nearby pixels are correlated and distant ones usually are not, so most of a dense layer's connections would be learning noise.\n\nPARAMETER SHARING — the same kernel is applied at every position. This is where the parameter saving comes from, and it is also a statement about the world: a vertical edge is a vertical edge wherever it appears.\n\nTRANSLATION EQUIVARIANCE — shift the input and the feature map shifts identically. Note the precise word: convolution gives equivariance (the response moves with the object), and pooling is what converts some of that into invariance (the response stops caring exactly where).",
      math:
        "A 224×224×3 image into 64 filters of 7×7:\n  conv params  = 7·7·3·64 + 64            = 9,472\n  dense params = (224·224·3) · (112·112·64) ≈ 1.2 × 10¹²\n\nThe conv layer is roughly 100 million times smaller — and it is not merely\nsmaller, it encodes the correct prior about images.",
      ask: "\"So why do Vision Transformers work at all, if that prior is so valuable?\" — Because a prior is a bias-variance trade. ViT has a much weaker inductive bias, so it needs far more data or heavy augmentation to reach the same point, but above roughly 100M images it overtakes CNNs precisely because it is not constrained by assumptions a CNN cannot unlearn.",
    },
    {
      h: "The two formulas you must produce instantly",
      body:
        "Output size per spatial dimension, and parameter count. These get asked directly and are free marks — practise on five made-up configurations until it is reflex.",
      math:
        "out = ⌊(W + 2P − K) / S⌋ + 1          (per dimension)\nparams = (K · K · C_in + 1) · C_out     (the +1 is the bias)\n\nWith dilation d, replace K with d(K−1)+1.\n'Same' padding for stride 1 is P = (K−1)/2.\n\nWorked: 224, K=7, S=2, P=3 → ⌊(224+6−7)/2⌋+1 = ⌊111.5⌋+1 = 112\nWorked: 32,  K=3, S=1, P=1 → ⌊(32+2−3)/1⌋+1  = 32 (size preserved)",
    },
    {
      h: "Receptive field — why depth matters more than kernel size",
      body:
        "A unit's receptive field is how much of the ORIGINAL image influences it. Stacking small kernels grows it while using fewer parameters than one large kernel, and inserts non-linearities along the way.\n\nThis is the VGG argument, and it is a favourite follow-up: three stacked 3×3 layers see the same 7×7 region as one 7×7 layer, but use 55% fewer parameters and apply three activations instead of one.",
      math:
        "Three 3×3 layers (stride 1), C channels throughout:\n  receptive field = 7×7\n  params = 3 · (3·3·C·C) = 27C²\n\nOne 7×7 layer:\n  receptive field = 7×7\n  params = 7·7·C·C = 49C²\n\n27C² vs 49C² → 45% fewer, plus 2 extra non-linearities.",
      ask: "\"Then why did later architectures reintroduce large kernels?\" — ConvNeXt and similar found that with modern training recipes, depthwise 7×7 kernels are cheap (depthwise convolution costs K·K·C rather than K·K·C·C) and buy a large receptive field in one step, which helps match Transformer-style global context.",
    },
    {
      h: "Pooling, striding, and what gets thrown away",
      body:
        "Max pooling reports whether a feature is present in a neighbourhood and discards precisely where. That is exactly right for classification and exactly wrong for segmentation, which is why U-Net carries skip connections across the encoder-decoder gap — to restore the spatial detail pooling destroyed.\n\nStrided convolution is the learnable alternative: it downsamples too, but the reduction is part of the weights rather than a fixed rule. Most modern nets prefer it.\n\nGlobal average pooling at the end replaces flatten-plus-dense. In VGG that head was around 100 million parameters and where most of the overfitting lived; GAP reduces each channel to a single number with zero parameters, makes the network input-size agnostic, and turns each channel into a class-evidence score — which is what makes class activation maps possible.",
      table: {
        headers: ["Operation", "Learnable", "Keeps position?", "Typical use"],
        rows: [
          ["Max pool", "No", "No — reports presence only", "Classification backbones (older)"],
          ["Average pool", "No", "Partially — averages it away", "Smoothing, final summarisation"],
          ["Strided conv", "Yes", "Learns what to keep", "Modern downsampling"],
          ["Global avg pool", "No", "Discards all spatial info", "Final layer before the classifier"],
          ["No pooling + dilation", "Yes", "Fully preserved", "Segmentation, dense prediction"],
        ],
      },
    },
    {
      h: "Residual connections and the degradation problem",
      body:
        "The problem ResNet solved is routinely misremembered. Deeper plain networks had higher TRAINING error, not just worse test error — so it was not overfitting, it was an optimization failure. A 56-layer plain net could not even match a 20-layer one on data it had already seen.\n\nThe fix is y = F(x) + x. Two consequences: the gradient has an additive path back to early layers that is never multiplied down, and each block only has to learn a residual correction rather than an entire mapping. If the best thing a block can do is nothing, driving F to zero is easy — whereas learning the identity from scratch through a stack of non-linearities is hard.",
      math:
        "Plain:    ∂L/∂x = ∂L/∂y · ∂F/∂x            (multiplicative — can vanish)\nResidual: ∂L/∂x = ∂L/∂y · (∂F/∂x + 1)      (the +1 is a gradient highway)",
      ask: "\"Where do you put batch norm relative to the addition?\" — Original ResNet: conv → BN → ReLU → conv → BN → add → ReLU. Pre-activation ResNet (v2) moves normalization and activation before the convolutions, leaving the skip path completely clean, which trains better at extreme depth.",
    },
    {
      h: "What actually breaks in practice",
      body:
        "AUGMENTATION THAT DESTROYS THE LABEL. A horizontal flip is fine for cats and catastrophic for digits or text — a flipped '2' is not a '2'. Colour jitter destroys tasks where colour IS the signal (medical staining, defect detection). Rotation breaks anything with a canonical orientation.\n\nAUGMENTATION THAT MOVES YOU AWAY FROM THE TEST DISTRIBUTION. If production images are always upright and well-lit, training on wildly rotated dark ones spends capacity on a scenario that never occurs. Model your augmentations on the variation you will actually see, not on what the library offers.\n\nTRANSFER LEARNING ORDER. Always train the new head for a few epochs BEFORE unfreezing the backbone. A randomly-initialized head sends large, meaningless gradients into carefully pretrained features and wrecks them.",
      table: {
        headers: ["Situation", "What to freeze", "Why"],
        rows: [
          ["Small data, similar domain", "Everything but the head", "Fine-tuning would overfit immediately"],
          ["Large data, similar domain", "Nothing — low LR everywhere", "Enough signal to adapt safely"],
          ["Small data, distant domain", "Early layers only, discriminative LR", "Edges transfer; late semantic layers do not"],
          ["Large data, distant domain", "Nothing, or train from scratch", "The pretrained prior may not help"],
        ],
      },
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// DECISION TREES
// ════════════════════════════════════════════════════════════════════════════

export const TREE_DEPTH = {
  simple:
    "A decision tree is a game of twenty questions where the model gets to choose the questions. Start with all your data in one pile, then find the single yes/no question about one feature that best separates the classes — \"is income above 40k?\" Split the pile in two and repeat inside each half. Keep going until each pile is nearly all one class, then predict the majority. Because every question is about one feature at a time, the boundary it draws is always made of horizontal and vertical steps: a tree can never draw a diagonal, only approximate one with a staircase. That greedy question-picking makes trees fast and readable, but also unstable — change a few training rows and the first question can change, which reshapes the whole tree below it.",

  deep: [
    {
      h: "How a split is actually chosen",
      body:
        "For every feature, and every candidate threshold between consecutive sorted values, compute the impurity of the two children weighted by size, and pick the split with the largest impurity DECREASE. That is the entire training algorithm — there is no gradient and no iteration.",
      math:
        "Gini(t)    = 1 − Σ pᵢ²            range [0, 0.5] for two classes\nEntropy(t) = − Σ pᵢ log₂ pᵢ       range [0, 1] for two classes\n\nGain = I(parent) − [ (n_L/n)·I(L) + (n_R/n)·I(R) ]\n\nWorked, 50/50 parent split into a pure-left and 50/50-right child:\n  Gini(parent) = 1 − (0.5² + 0.5²) = 0.5\n  say L = 40 pure, R = 60 at 17/43\n  Gini(R) = 1 − (0.283² + 0.717²) = 0.406\n  Gain = 0.5 − [(40/100)(0) + (60/100)(0.406)] = 0.256",
    },
    {
      h: "Gini vs entropy — and why it rarely matters",
      body:
        "Both peak when classes are balanced and hit zero when a node is pure. Entropy penalizes impurity slightly more aggressively because of the logarithm, so it can prefer more balanced splits. In practice the trees they produce are nearly identical; Gini is the default in scikit-learn mostly because it avoids computing logarithms.\n\nThe honest answer to \"which is better\" is that it is not a meaningful tuning knob — depth, minimum samples per leaf, and ensembling dominate. Saying so is a stronger answer than inventing a preference.",
      table: {
        headers: ["Criterion", "Formula", "Max (2-class)", "Notes"],
        rows: [
          ["Gini", "1 − Σpᵢ²", "0.5", "Default; no logs, so slightly faster"],
          ["Entropy", "−Σpᵢ log₂ pᵢ", "1.0 bit", "Information gain; marginally more balanced splits"],
          ["Misclassification", "1 − max pᵢ", "0.5", "Too flat to guide growth; used for pruning only"],
          ["MSE / variance", "Σ(y−ȳ)²/n", "—", "Regression trees; leaf predicts the mean"],
        ],
      },
    },
    {
      h: "The zero-gain subtlety that decides whether XOR works",
      body:
        "On XOR, every possible first split has gain exactly zero — neither feature alone carries any information. If your implementation stops when gain is not positive, the tree becomes a stump and scores 50%.\n\nscikit-learn's min_impurity_decrease defaults to 0.0 and the condition is decrease ≥ threshold, so a zero-gain split IS taken. That single detail is the only reason a depth-2 tree reaches 100% on XOR. It is also a good illustration of greedy search's weakness: the split that unlocks everything looks worthless on its own.",
      ask: "\"So is greedy splitting optimal?\" — No. Finding the smallest tree consistent with the data is NP-hard, so every practical implementation is greedy and locally optimal. That is precisely why ensembles help so much: averaging many differently-flawed greedy trees recovers much of what any single one missed.",
    },
    {
      h: "Overfitting, and the two ways to stop it",
      body:
        "An unrestricted tree grows until every leaf is pure, which means one leaf per unique training row in the worst case — perfect training accuracy and no generalization. Look at the thin slivers a deep tree carves around individual points; each one is a memorized example.\n\nPRE-PRUNING (early stopping) — max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes, min_impurity_decrease. Cheap, but myopic: it can stop before a split that would have unlocked a good one below it.\n\nPOST-PRUNING (cost-complexity, ccp_alpha) — grow fully, then remove subtrees whose complexity cost exceeds their accuracy benefit. Better in principle because it can see what the subtree achieved before deciding.",
      math:
        "Cost-complexity pruning minimizes:\n  R_α(T) = R(T) + α · |leaves(T)|\n\nα = 0 keeps the full tree; increasing α prunes progressively harder.\nChoose α by cross-validation, not by eye.",
    },
    {
      h: "Feature importance, and why to distrust it",
      body:
        "The default importance is the total impurity decrease each feature contributed, weighted by the samples it affected. It has two well-known biases:\n\nIt inflates HIGH-CARDINALITY features. A continuous feature or an ID column offers many candidate thresholds, so by chance one of them will look good — an ID column can appear to be the most important feature in the model while carrying no signal at all.\n\nIt splits credit arbitrarily between CORRELATED features. If two columns carry the same information, whichever gets picked first absorbs the importance and the other looks useless.\n\nUse permutation importance (shuffle one column, measure the drop on held-out data) or SHAP values when the answer matters.",
      ask: "\"An ID column came out as your top feature. What happened?\" — Almost certainly high-cardinality bias plus leakage: with enough distinct values the tree can carve near-pure leaves by memorizing IDs. Drop it, then re-check with permutation importance on a held-out split.",
    },
    {
      h: "What trees are genuinely good and bad at",
      body:
        "GOOD: no feature scaling needed (splits compare within one feature, so units are irrelevant); handles mixed numeric and categorical types; captures interactions automatically without you specifying them; naturally handles missing values via surrogate splits or a default direction; genuinely interpretable at small depth.\n\nBAD: axis-aligned boundaries only, so a simple diagonal relationship needs a deep staircase; high variance — a small data change can flip the root split and rebuild everything; cannot extrapolate at all (a regression tree predicts a constant outside the training range, so trend forecasting is hopeless); biased toward features with more possible split points.\n\nThe variance problem is the whole reason random forests and boosting exist, and it is why a single tree is rarely the right final model.",
      table: {
        headers: ["", "Single tree", "Random forest", "Gradient boosting"],
        rows: [
          ["Built", "Once, greedily", "In parallel, on bootstrap samples", "Sequentially, on residuals"],
          ["Reduces", "—", "Variance", "Bias"],
          ["Tree depth", "Deep", "Deep (low bias each)", "Shallow (weak learners)"],
          ["Overfits by", "Growing too deep", "Barely — more trees is safe", "Adding too many stages"],
          ["Interpretable", "Yes", "Only via importances", "Only via importances/SHAP"],
        ],
      },
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// RECURRENT NEURAL NETWORKS
// ════════════════════════════════════════════════════════════════════════════

export const RNN_DEPTH = {
  simple:
    "A plain network needs a fixed-size input, but a sentence can be any length — and word order matters. An RNN handles that by reading one item at a time and keeping a small running summary, called the hidden state. At every step it combines the new word with what it already remembers to produce an updated memory. The same weights are used at every step, so it can process a sequence of any length. The catch is that the memory gets overwritten a little at each step: multiply by a number smaller than one enough times and the earliest words fade to nothing, so the network physically cannot connect word 40 back to word 1. LSTMs fix this by adding gates that decide what to keep, what to erase and what to output — turning memory from something that decays automatically into something the network controls deliberately.",

  deep: [
    {
      h: "The recurrence, and what makes it different",
      body:
        "One set of weights, applied at every timestep. That weight sharing is what lets a single model handle any sequence length — and it is also the source of every problem, because the same matrix gets multiplied in repeatedly.",
      math:
        "hₜ = tanh(W_x xₜ + W_h hₜ₋₁ + b)\nyₜ = W_y hₜ + b_y\n\nUnrolled over T steps this is a T-layer deep network that happens to share\nweights between layers. Everything you know about deep networks applies —\nincluding the gradient problems, amplified because it is the SAME matrix.",
    },
    {
      h: "Why the gradient dies, exactly",
      body:
        "Backpropagating from step T to step 1 multiplies by the recurrent Jacobian at every hop. The magnitude of that product is roughly (|w| · |f′|)^T. Below 1 it decays geometrically; above 1 it explodes.\n\nThe practical consequence is a hard horizon rather than a gentle decline. With w = 0.8 and tanh, the gradient reaching 40 steps back is about 1e−5 of the signal at the output — so the earliest timesteps receive effectively no learning signal, and long-range dependencies are not learned slowly, they are not learned at all.\n\nNote the asymmetry in the fixes: exploding gradients are easy to patch with clipping, because the direction is still correct and only the magnitude is wrong. Vanishing gradients cannot be clipped away — there is no signal left to rescale.",
      math:
        "∂h_T/∂h₁ = Π (W_hᵀ · diag(f′(z_t)))\n\ntanh′ ≤ 1 and sigmoid′ ≤ 0.25, so with modest weights the product shrinks.\nWith w = 0.8, tanh: 0.8⁴⁰ ≈ 1.3e−4  → unusable beyond ~30 steps.\nWith w = 1.5, leaky:  1.5⁴⁰ ≈ 1.1e+7  → NaN within a few updates.",
      ask: "\"Gradient clipping — before or after the optimizer, and by norm or by value?\" — Clip after computing gradients and before the optimizer step. Clip by global norm rather than per-value: value clipping distorts the gradient's direction, whereas norm clipping rescales the whole vector and preserves it.",
    },
    {
      h: "LSTM: the cell state is additive, and that is the entire point",
      body:
        "An LSTM keeps two things: a hidden state h (the output) and a cell state c (the long-term memory). The crucial design choice is that c is UPDATED BY ADDITION, not by matrix multiplication. Addition does not decay, so a gradient flowing back along the cell state passes through the forget gate rather than through a chain of matrix products.\n\nThat is the entire mechanism. If the forget gate stays near 1, information and gradient both survive hundreds of steps.\n\nThree gates, each a sigmoid producing values in (0,1) that act as soft switches:\n  FORGET — how much of the existing memory to keep\n  INPUT — how much of the new candidate to write\n  OUTPUT — how much of the memory to expose as this step's output",
      math:
        "fₜ = σ(W_f · [hₜ₋₁, xₜ] + b_f)        forget gate\niₜ = σ(W_i · [hₜ₋₁, xₜ] + b_i)        input gate\noₜ = σ(W_o · [hₜ₋₁, xₜ] + b_o)        output gate\ng̃ₜ = tanh(W_g · [hₜ₋₁, xₜ] + b_g)     candidate memory\n\ncₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ g̃ₜ              ← ADDITIVE. The gradient highway.\nhₜ = oₜ ⊙ tanh(cₜ)\n\n∂cₜ/∂cₜ₋₁ = fₜ    — so with fₜ ≈ 1 the gradient passes through unchanged.",
      ask: "\"Why is the forget-gate bias often initialized to 1?\" — So the gate starts near 1 (σ(1) ≈ 0.73) and the network defaults to REMEMBERING. Initialized at 0 it starts at σ(0) = 0.5, halving the memory every step, and it has to learn to remember before it can learn anything long-range at all.",
    },
    {
      h: "GRU, and when to prefer it",
      body:
        "A GRU merges the forget and input gates into one update gate and drops the separate cell state, so it has 3 weight matrices per unit instead of 4 — roughly 25% fewer parameters and correspondingly faster.\n\nEmpirically they perform comparably on most tasks. LSTMs sometimes edge ahead on very long sequences where the separate cell state helps; GRUs train faster and are the pragmatic choice with limited data. This is a genuine coin-flip and the honest answer is \"try both\", which is a better answer than a fabricated rule.",
      table: {
        headers: ["", "Vanilla RNN", "LSTM", "GRU"],
        rows: [
          ["Gates", "None", "3 (forget, input, output)", "2 (update, reset)"],
          ["States", "h", "h and c", "h only"],
          ["Weight matrices", "1", "4", "3"],
          ["Memory path", "Multiplicative", "Additive (cell state)", "Additive (interpolated)"],
          ["Usable range", "~10 steps", "Hundreds", "Hundreds"],
        ],
      },
    },
    {
      h: "The variants worth naming",
      body:
        "BIDIRECTIONAL — run one RNN forward and one backward, concatenate the states. Only valid when the whole sequence is available up front: never for streaming or for generation, since the backward pass would read the future.\n\nSEQ2SEQ — an encoder compresses the input into one fixed context vector and a decoder generates from it. The bottleneck is obvious once stated: a single vector cannot hold a fifty-word sentence.\n\nATTENTION was invented specifically to fix that bottleneck (Bahdanau, 2014): let the decoder look back at ALL encoder states at each output step, weighted by relevance. That removed the bottleneck, produced interpretable alignments, and set up the Transformer — which then asked why the recurrence was needed at all.",
    },
    {
      h: "Why transformers replaced them, and where RNNs still win",
      body:
        "The decisive advantage is not accuracy, it is PARALLELISM. An RNN must compute step t before step t+1, so training cannot be parallelized across the sequence. A transformer sees all positions at once, which is what made training on internet-scale data feasible.\n\nAttention also gives a constant path length between any two positions — one hop instead of T — so there is no distance-based decay at all.\n\nThe cost is O(n²) memory and compute in sequence length, against the RNN's O(n). So RNNs remain genuinely preferable for: very long or unbounded streams, strict low-latency streaming inference with constant memory per step, and small on-device models. RNN-T is still dominant in production on-device speech recognition for exactly these reasons.",
      table: {
        headers: ["", "RNN / LSTM", "Transformer"],
        rows: [
          ["Training parallelism", "None across time", "Full"],
          ["Path between positions", "O(distance)", "O(1)"],
          ["Compute in length n", "O(n)", "O(n²)"],
          ["Memory at inference", "Constant per step", "Grows with context (KV cache)"],
          ["Best at", "Streaming, unbounded input, on-device", "Anything you can batch and fit"],
        ],
      },
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// SUPPORT VECTOR MACHINES
// ════════════════════════════════════════════════════════════════════════════

export const SVM_DEPTH = {
  simple:
    "If two groups of points can be separated by a straight line, there are infinitely many lines that do it. An SVM picks a specific one: the line with the widest empty corridor on either side. The intuition is that a boundary crammed up against your data is fragile — nudge a point slightly and it misclassifies — whereas one sitting in the middle of the widest gap has the most room for error. Only the points touching the corridor edges matter; everything further away could be deleted without changing the answer, and those touching points are the \"support vectors\". When no straight line works, the kernel trick measures similarity as if the points had been lifted into a higher-dimensional space where a flat separator does exist — without ever computing those higher-dimensional coordinates.",

  deep: [
    {
      h: "What is being maximized, and how it becomes a minimization",
      body:
        "Fix the scale so the closest points sit exactly at |wᵀx + b| = 1. Then the margin width is 2/‖w‖, so maximizing the margin is the same as minimizing ‖w‖ — which is convex, and convexity is why an SVM has a single global optimum with no restarts and no seeds.",
      math:
        "Hard margin:\n  minimize   ½‖w‖²\n  subject to yᵢ(wᵀxᵢ + b) ≥ 1  for all i\n\nSoft margin (allows violations, penalized by C):\n  minimize   ½‖w‖² + C Σ ξᵢ\n  subject to yᵢ(wᵀxᵢ + b) ≥ 1 − ξᵢ,  ξᵢ ≥ 0\n\nEquivalently, unconstrained hinge-loss form:\n  minimize   ½‖w‖² + C Σ max(0, 1 − yᵢ(wᵀxᵢ + b))\n\nmargin width = 2/‖w‖",
    },
    {
      h: "C — the one hyperparameter that matters most",
      body:
        "C is the price of a mistake. It trades margin width against training violations, and it runs in the opposite direction from most regularization parameters, which trips people up.\n\nLARGE C — violations are expensive, so the corridor narrows to squeeze past every point. Low bias, high variance, and it will contort to fit noise.\n\nSMALL C — violations are cheap, so the corridor widens and swallows points. High bias, low variance, and more support vectors.\n\nThe useful mental note: C is inversely like λ in ridge regression. Large C means WEAK regularization.",
      math:
        "Pegasos-style equivalence: λ = 1/(C·n)\n\nso large C  → small λ → weak regularization → narrow margin\n   small C  → large λ → strong regularization → wide margin",
      ask: "\"Your SVM has 90% of the training points as support vectors. What does that tell you?\" — That it is memorizing rather than generalizing. It usually means gamma is far too high (each point only influences its own neighbourhood) or C is far too high, or that the classes genuinely overlap so heavily that most points sit inside the margin. Check the validation gap and reduce gamma first.",
    },
    {
      h: "The dual, and why it enables kernels",
      body:
        "Rewriting via Lagrange multipliers gives a form that depends on the data ONLY through dot products xᵢᵀxⱼ. That is the whole opening for kernels: replace every dot product with a similarity function K(xᵢ, xⱼ) and you have implicitly moved to whatever space that function corresponds to — without ever computing coordinates there.\n\nThe dual also explains sparsity. The KKT conditions force αᵢ = 0 for every point strictly outside the margin, so those points contribute nothing to the solution. Only support vectors have αᵢ > 0.",
      math:
        "Dual:  maximize  Σαᵢ − ½ ΣΣ αᵢαⱼ yᵢyⱼ (xᵢᵀxⱼ)\n       subject to 0 ≤ αᵢ ≤ C,  Σ αᵢyᵢ = 0\n\nRecover w = Σ αᵢ yᵢ xᵢ    (a sum over support vectors only)\nDecision: f(x) = Σ αᵢ yᵢ K(xᵢ, x) + b\n\nKKT tells you which is which:\n  αᵢ = 0        → outside the margin, irrelevant\n  0 < αᵢ < C    → exactly ON the margin\n  αᵢ = C        → inside the margin or misclassified",
    },
    {
      h: "Kernels, and what gamma actually controls",
      body:
        "A valid kernel is any function whose Gram matrix is positive semi-definite (Mercer's condition) — that guarantees it corresponds to an inner product in some space.\n\nThe RBF kernel maps into an INFINITE-dimensional space, which sounds alarming until you notice the regularization term ½‖w‖² is still bounding complexity. That is why an SVM in infinite dimensions does not automatically overfit.\n\nGamma sets how far a single training point's influence reaches. Small gamma means wide, smooth influence and a nearly linear boundary. Large gamma means each point only affects its immediate neighbourhood, so the boundary becomes a set of islands around individual points — memorization. Gamma and C interact, so they must be tuned together on a 2D grid, not one at a time.",
      table: {
        headers: ["Kernel", "K(x, z)", "Use when"],
        rows: [
          ["Linear", "xᵀz", "High-dimensional and already separable — text, genomics"],
          ["Polynomial", "(xᵀz + c)^d", "Feature interactions matter up to a known degree"],
          ["RBF / Gaussian", "exp(−γ‖x−z‖²)", "The default. Smooth, local, infinite-dimensional"],
          ["Sigmoid", "tanh(κxᵀz + c)", "Rarely — not always a valid kernel"],
        ],
      },
      ask: "\"When would you use a linear kernel over RBF?\" — When d is large relative to n. With more features than samples the data is usually already linearly separable, RBF adds variance for nothing, and linear scales far better: LinearSVC is O(n) while kernel SVM is between O(n²) and O(n³). Text classification with TF-IDF is the canonical case.",
    },
    {
      h: "Scaling and cost — the two practical traps",
      body:
        "SCALING IS MANDATORY, not optional. The RBF kernel depends on ‖x − z‖², so a feature measured in thousands dominates one measured in single digits entirely. An unscaled SVM can appear completely broken for this reason alone, and it is the single most common cause of \"my SVM does not work\".\n\nCOST. Training is roughly O(n²) to O(n³) in the number of samples because the kernel matrix is n×n — at 100,000 samples that matrix alone is about 80 GB in double precision. This is why SVMs largely lost to gradient boosting and neural networks on large datasets. They remain excellent below roughly 10,000 samples, especially with many features.",
      table: {
        headers: ["Concern", "Kernel SVM", "Linear SVM", "Practical limit"],
        rows: [
          ["Training cost", "O(n²)–O(n³)", "O(n·d)", "Kernel: ~10k samples"],
          ["Memory", "O(n²) kernel matrix", "O(d)", "100k samples ≈ 80 GB"],
          ["Prediction cost", "O(#SV · d)", "O(d)", "Slow if most points are SVs"],
          ["Needs scaling", "Critically", "Yes", "Always standardize"],
        ],
      },
    },
    {
      h: "Probabilities, multi-class, and the honest limitations",
      body:
        "NO NATIVE PROBABILITIES. An SVM outputs a signed distance, not a probability. scikit-learn's probability=True fits Platt scaling — a logistic regression on those distances via internal cross-validation — which makes fitting several times slower and gives probabilities that are often poorly calibrated anyway. If you need calibrated probabilities, logistic regression or a calibrated boosted model is usually the better starting point.\n\nNO NATIVE MULTI-CLASS. SVMs are inherently binary. libsvm uses one-vs-one, which trains K(K−1)/2 classifiers; one-vs-rest trains K but produces less comparable scores across classes.\n\nSENSITIVE TO OUTLIERS at high C, because a single mislabelled point can drag the boundary a long way when violations are expensive.",
      ask: "\"SVM or logistic regression?\" — Logistic regression when you need calibrated probabilities, interpretable coefficients, or you have a lot of data. SVM when n is modest, you want a maximum-margin boundary for robustness, or you need a non-linear boundary without designing features by hand. Both are linear-in-features and convex; the real difference is hinge loss with a margin versus log loss with probabilities.",
    },
  ],
};

export const DEPTH_BY_TOPIC = {
  cnn: CNN_DEPTH,
  tree: TREE_DEPTH,
  rnn: RNN_DEPTH,
  svm: SVM_DEPTH,
};
