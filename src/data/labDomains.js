// Interactive labs, grouped by domain.
//
// Each domain is its own ordered path. These are separate fields in their own
// right, not sub-topics of one another — so each gets its own numbered sequence
// rather than being buried in one long list.

export const LAB_DOMAINS = [
  {
    id: "coreml", label: "Core ML", icon: "📈", accent: "#E91E8C",
    blurb: "The classical models, ordered so each reuses the previous one's picture. Start at Linear Regression even if you know it — everything after reuses that error surface.",
    stages: [
      {
        stage: "Predict a number", hint: "Fit a line, then learn how fitting works",
        items: [
          { id: "linreg", label: "📈 Linear Regression", why: "Ten students' revision hours against their exam scores. Drag the line and watch the error rise and fall — this is the picture every later model reuses." },
          { id: "gd", label: "⛰️ Gradient Descent", why: "The same line, found by small downhill steps instead of a formula. Turn the learning rate up until it diverges — the failure you will meet everywhere else." },
        ],
      },
      {
        stage: "Predict a class", hint: "Four different answers to one question",
        items: [
          { id: "logreg", label: "🎯 Logistic Regression", why: "A straight line that outputs a probability. Switch to the ring dataset to see exactly where linear models hit a wall." },
          { id: "nb", label: "🎲 Naive Bayes", why: "Ask which class better explains the data. Watch two likelihoods get multiplied — the 'naive' step that should not work but does." },
          { id: "knn", label: "📍 K-Nearest Neighbours", why: "No training at all: the closest examples vote. k is a bias-variance dial you can watch turn." },
          { id: "svm", label: "🛣️ Support Vector Machines", why: "The widest empty corridor between classes, decided by a handful of points. Then the kernel trick makes it curve." },
        ],
      },
      {
        stage: "Ask questions instead", hint: "Trees, and why one is never enough",
        items: [
          { id: "tree", label: "🌳 Decision Trees", why: "One yes/no question at a time. Every boundary is a step — a tree literally cannot draw a diagonal." },
          { id: "forest", label: "🌲 Random Forests", why: "One jagged boundary versus many averaged. Step through the individual trees to see why disagreement is useful." },
          { id: "boost", label: "🚀 Gradient Boosting", why: "Trees in sequence, each trained only on what the previous ones got wrong. Watch the residual bars flatten — that IS the algorithm." },
        ],
      },
      {
        stage: "No labels at all", hint: "Find structure nobody told you about",
        items: [
          { id: "kmeans", label: "🎪 K-Means Clustering", why: "Assign, move, repeat. Change the seed for a different answer from the same data — the local-optimum problem made visible." },
          { id: "pca", label: "📐 Principal Component Analysis", why: "Squash two numbers into one and see how much survives. Variance-kept and error-lost peak at the same angle." },
        ],
      },
    ],
  },

  {
    id: "dl", label: "Deep Learning", icon: "🧠", accent: "#7C4DFF",
    blurb: "From one neuron to a network training live in your browser. The Playground and Backpropagation labs are worth the most time.",
    stages: [
      {
        stage: "The unit", hint: "One neuron, then why depth needs a curve",
        items: [
          { id: "neuron", label: "⚪ A Single Neuron", why: "Two inputs, two weights, a bias and a squash. Push the sum past 5 and watch the slope collapse — saturation, which is why sigmoid fell out of favour." },
          { id: "nonlinear", label: "➰ Why Networks Need a Curve", why: "Train a linear-activation network on XOR as long as you like. It cannot beat 0.5, because stacked linear layers collapse into one matrix." },
        ],
      },
      {
        stage: "The network", hint: "Watch one actually train",
        items: [
          { id: "playground", label: "🎛️ Network Playground", why: "A real MLP training live, with its weights drawn as they change. Try the spiral with 3 neurons, then with 36." },
          { id: "backprop", label: "↩️ Backpropagation", why: "One tiny network, every number on screen. Step forward then backward and watch the gradient shrink between layers." },
        ],
      },
      {
        stage: "What breaks", hint: "And what fixes it",
        items: [
          { id: "gradflow", label: "📉 Vanishing Gradients", why: "How much learning signal reaches layer 1 of a deep stack. Sigmoid shrinks it 0.24× per layer — arithmetic, not bad luck." },
          { id: "normreg", label: "⚖️ Normalization & Dropout", why: "Two features 200× apart in scale, fixed in one step. Then why dropout scales survivors up instead of merely zeroing others." },
        ],
      },
    ],
  },

  {
    id: "cv", label: "Computer Vision", icon: "👁️", accent: "#1565C0",
    blurb: "Convolution built from arithmetic you can check by hand, then the operations real detectors are made of — including the time axis.",
    stages: [
      {
        stage: "The operation", hint: "Convolution, cell by cell",
        items: [
          { id: "conv", label: "🔲 Convolution", why: "A 3×3 stencil sliding over an 8×8 digit. Every multiply-and-add is shown, and you can edit the kernel weights yourself." },
          { id: "convshape", label: "📏 Stride, Padding & Shapes", why: "The output-size and parameter formulas asked for directly, plus the dense-equivalent comparison that justifies convolution at all." },
          { id: "pooling", label: "🔽 Pooling", why: "Shift the image one pixel and compare how much the input changed against how much the pooled output changed. That gap is translation invariance." },
        ],
      },
      {
        stage: "Real vision tasks", hint: "Edges, boxes, motion",
        items: [
          { id: "edges", label: "✒️ Edge Detection", why: "Blur, then two derivatives, then combine. A trained CNN's first layer reinvents almost exactly this pipeline." },
          { id: "iou", label: "📦 IoU & NMS", why: "Drag a box and watch IoU change. Set the NMS threshold too high and get duplicates, too low and separate objects merge." },
          { id: "motion", label: "🎬 Motion in Video", why: "Subtract consecutive frames. Static pixels cancel to zero; only movement survives. Raise the speed until it breaks." },
        ],
      },
    ],
  },

  {
    id: "nlp", label: "NLP", icon: "💬", accent: "#00897B",
    blurb: "Text to numbers, then sequences, then the mechanism that replaced them. The sequence labs build directly on each other.",
    stages: [
      {
        stage: "Text into numbers", hint: "Tokens, weights, geometry",
        items: [
          { id: "tokens", label: "🧩 Tokenization", why: "Watch BPE learn its merges one at a time, then tokenize a word the corpus never contained. There is no such thing as an unknown word." },
          { id: "tfidf", label: "📊 TF-IDF", why: "Counting words so the common ones stop dominating. Then watch it score zero on a document that means the same thing in different words." },
          { id: "embed", label: "🧭 Word Embeddings", why: "king − man + woman, computed and plotted. Direction in the space carries meaning, which is why the arithmetic works at all." },
        ],
      },
      {
        stage: "Sequences", hint: "Memory, and its limit",
        items: [
          { id: "rnn", label: "🔁 Recurrent Networks", why: "A signal arrives at step 1. Watch the memory of it fade, and find the weight where it neither vanishes nor saturates." },
          { id: "bptt", label: "⏳ Why RNNs Forget", why: "Multiply by the same number 40 times. The usable memory range becomes a number you can read off, not a vague limitation." },
        ],
      },
      {
        stage: "Attention", hint: "Delete the chain entirely",
        items: [
          { id: "attention", label: "👁️ Attention", why: "Resolve what 'it' refers to in a real sentence. Turn off the √d scaling and watch the softmax saturate into uselessness." },
          { id: "ngram", label: "🔮 Predicting the Next Word", why: "The simplest language model: count what followed what. Its sparsity failure is the motivation for everything after it." },
        ],
      },
    ],
  },

  {
    id: "genai", label: "Generative AI", icon: "✨", accent: "#F4511E",
    blurb: "What actually happens when a model generates text or images — and the numbers that decide what it costs to run.",
    stages: [
      {
        stage: "Generating text", hint: "Choosing tokens, and paying for context",
        items: [
          { id: "decoding", label: "🎲 Picking the Next Word", why: "Ten candidate words with real probabilities. Watch top-k force in nonsense that top-p correctly cuts off." },
          { id: "kvcache", label: "🗃️ The KV Cache", why: "Why long context costs memory rather than compute. Push the batch size up and watch the cache outgrow the GPU." },
        ],
      },
      {
        stage: "Grounding and adapting", hint: "Facts it never learned, tasks it never saw",
        items: [
          { id: "rag", label: "📚 RAG", why: "Chunk, retrieve, answer. Shrink the chunk size until the answer splits across a boundary and retrieval quietly fails." },
          { id: "lora", label: "🧩 LoRA", why: "A real truncated SVD showing how rank 2 captures most of a weight update at a fraction of the parameters." },
        ],
      },
      {
        stage: "Generating images", hint: "Destruction is easy; learn to reverse it",
        items: [
          { id: "diffusion", label: "🌫️ Diffusion", why: "Add noise step by step until the image is gone. The forward equation is exact, which is where the free training signal comes from." },
        ],
      },
    ],
  },

  {
    id: "recsys", label: "Recommenders", icon: "🎯", accent: "#5E35B1",
    blurb: "Five people, four films, and some blanks. Every recommender is a way of guessing the blanks — then a way of ordering what it guessed.",
    stages: [
      {
        stage: "Filling the blanks", hint: "Two approaches to the same matrix",
        items: [
          { id: "cf", label: "👥 Collaborative Filtering", why: "Find people with similar taste and borrow their opinion. Edit the ratings and watch the similarity matrix and the prediction both move." },
          { id: "mf", label: "🔢 Matrix Factorization", why: "Invent hidden taste dimensions and learn them. Nobody labels them — they emerge from the ratings alone." },
        ],
      },
      {
        stage: "Ordering the results", hint: "The metric is a product decision",
        items: [
          { id: "ranking", label: "📊 Ranking Metrics", why: "Reorder eight search results and watch which metrics notice. Precision@k ignores order entirely; NDCG does not." },
        ],
      },
    ],
  },

  {
    id: "rl", label: "Reinforcement Learning", icon: "🎮", accent: "#00838F",
    blurb: "A process concept, so these are built as experiences rather than equations: watch an agent stumble, learn, and then get gamed by its own reward function.",
    stages: [
      {
        stage: "Learning from reward", hint: "No map, no instructions",
        items: [
          { id: "qlearn", label: "🗺️ Q-Learning", why: "An agent with no map, learning purely by stumbling into a goal. Set the step cost to zero and watch exploration collapse entirely." },
          { id: "bandit", label: "🎰 Explore vs Exploit", why: "Four strategies on the same slot machines. Pure greedy commits on one lucky sample and never reconsiders." },
        ],
      },
      {
        stage: "Where it goes wrong", hint: "Agents optimize what you measure",
        items: [
          { id: "reward", label: "⚠️ Reward Design", why: "Real cases where the agent maximized the reward perfectly and did entirely the wrong thing — including the RLHF flattery problem." },
        ],
      },
    ],
  },

  {
    id: "speech", label: "Speech & Audio", icon: "🎙️", accent: "#C2185B",
    blurb: "Real DFTs on synthesized speech. The spectrogram you see is computed from the waveform above it, and every slider recomputes the transform.",
    stages: [
      {
        stage: "Seeing sound", hint: "Time, frequency, and the trade between them",
        items: [
          { id: "spectrogram", label: "📈 Waveform to Spectrogram", why: "Drag the window length and watch sharp timing trade against sharp frequency. You cannot have both — that is the uncertainty principle, not a bug." },
          { id: "mel", label: "👂 The Mel Scale", why: "Why frequency bands are spaced unevenly: the same 100-mel step spans 93 Hz down at 400 mel but 351 Hz up at 1900 — a 3.8× difference." },
          { id: "aliasing", label: "⚡ Aliasing & Nyquist", why: "Sample a tone too slowly and it returns as a different, lower tone — permanently indistinguishable from real signal." },
        ],
      },
      {
        stage: "Recognizing speech", hint: "Frames vastly outnumber letters",
        items: [
          { id: "ctc", label: "🔤 CTC Alignment", why: "A hundred audio frames, three letters, and nobody labelled the alignment. See how blanks and collapsing make that solvable." },
        ],
      },
    ],
  },

  {
    id: "applied", label: "Applied ML", icon: "🔧", accent: "#2E7D32",
    blurb: "The things that decide whether a model works in production. Almost every real failure lives here rather than in the choice of model.",
    stages: [
      {
        stage: "Will it generalize?", hint: "Fit, validate, trust",
        items: [
          { id: "overfit", label: "📉 Overfitting", why: "Training error only ever falls; held-out error turns back up. That turning point answers how complex the model should be." },
          { id: "crossval", label: "🔄 Cross-Validation", why: "Same model, same data, five different scores. The spread tells you which model comparisons are just noise." },
        ],
      },
      {
        stage: "Real-world data", hint: "Imbalance and scale",
        items: [
          { id: "imbalance", label: "⚖️ Imbalanced Data", why: "95% accuracy from a model that catches no fraud at all. Then set what a miss costs and let the threshold follow." },
          { id: "scaling", label: "📏 Feature Scaling", why: "Identical settings, one preprocessing line. Watch a stuck optimizer suddenly converge." },
        ],
      },
      {
        stage: "How you fool yourself", hint: "And what happens after you ship",
        items: [
          { id: "leakage", label: "🚨 Data Leakage", why: "Six ways information crosses from test into train, each with the symptom it produces. The reason 0.97 offline becomes 0.61 live." },
          { id: "drift", label: "📊 Data Drift", why: "The model is frozen but the world moves. Accuracy decays for twelve months and nothing raises an alarm." },
        ],
      },
    ],
  },
];

// Flattened path so the shell can deep-link to any lab by id.
export const LABS_STAGES = LAB_DOMAINS.flatMap((d) =>
  d.stages.map((st) => ({ ...st, stage: `${d.label} · ${st.stage}` })));

export const LAB_DOMAIN_OF = Object.fromEntries(
  LAB_DOMAINS.flatMap((d) => d.stages.flatMap((st) => st.items.map((it) => [it.id, d.id]))));

export const ALL_LAB_IDS = Object.keys(LAB_DOMAIN_OF);
