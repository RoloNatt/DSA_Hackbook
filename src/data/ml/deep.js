// ─── DEEP LEARNING ──────────────────────────────────────────────────────────
// Neuron → network → backprop → the three architectures.

export const NEURON = {
  h: "From a neuron to a network",
  body: "ONE NEURON does exactly three things:\n1. Multiplies each input by a weight\n2. Adds them all up (plus a bias)\n3. Passes the result through an ACTIVATION FUNCTION\n\n    inputs → (×weights, sum, +bias) → activation → output\n\nSteps 1 and 2 together are EXACTLY logistic regression. A neural network is a large grid of these stacked in layers, where each layer's outputs are the next layer's inputs.\n\nA LAYER: a = g(Wx + b) with W a matrix.\n\nINPUT LAYER — your features. Not really a layer, just where data enters.\nHIDDEN LAYERS — the middle. \"Hidden\" only means you don't directly observe them.\nOUTPUT LAYER — 1 neuron for a number or a yes/no; N neurons for N categories.\n\n\"DEEP\" learning literally means a network with several hidden layers. That's all the word means.",
  whyNonlinear: {
    h: "Why activation functions are non-negotiable — prove it, don't assert it",
    body: "Take two linear layers:\n\n    y = W₂(W₁x + b₁) + b₂\n\nExpand it:\n\n    y = W₂W₁x + W₂b₁ + b₂\n\nDefine W' = W₂W₁ and b' = W₂b₁ + b₂ and you have y = W'x + b' — a SINGLE linear layer. This holds for any depth.\n\nSo without a non-linearity, a hundred-layer network has EXACTLY the expressive power of one linear layer, and you've spent a hundred times the compute for nothing. The bend is what makes depth mean anything.",
  },
  whatLayersLearn: "WHAT THE LAYERS ACTUALLY LEARN (the useful mental picture, for an image network):\n\n• Layer 1 learns edges and colour patches\n• Layer 2 combines edges into corners, curves, textures\n• Layer 3 combines those into shapes — an eye, a wheel, a leaf\n• Layer 4 combines those into objects — a face, a car, a tree\n\nNobody programmed an \"eye detector.\" It EMERGED because building one was useful for reducing the loss. Deep learning's superpower is that it learns the FEATURES itself instead of you hand-engineering them. That single sentence is the best one-line answer to \"why deep learning?\"",
  universalApprox: "UNIVERSAL APPROXIMATION THEOREM: a network with one hidden layer and enough units can approximate any continuous function on a compact set. It says NOTHING about how many units you'd need or whether you can FIND those weights. Depth is what makes it practical, because deep nets compose features hierarchically and can represent some functions exponentially more compactly than shallow ones.",
};

export const ACTIVATIONS = {
  headers: ["Name", "Formula", "Range", "Notes"],
  rows: [
    ["Sigmoid", "1/(1+e⁻ˣ)", "(0,1)", "Saturates → vanishing gradients; not zero-centered. Use ONLY for binary output."],
    ["Tanh", "(eˣ−e⁻ˣ)/(eˣ+e⁻ˣ)", "(−1,1)", "Zero-centered, still saturates. Older networks, some RNNs."],
    ["ReLU", "max(0,x)", "[0,∞)", "THE default for hidden layers. Cheap (a comparison, not an exponential), gradient exactly 1 for x>0 so it doesn't attenuate the backward signal, sparse activations."],
    ["Leaky ReLU", "max(αx, x), α≈0.01", "ℝ", "Fixes dying ReLU."],
    ["ELU / SELU", "exponential for x<0", "ℝ", "Smoother; SELU is self-normalizing."],
    ["GELU", "x·Φ(x)", "ℝ", "The default inside Transformers (BERT, GPT). Smooth, probabilistic gating."],
    ["SwiGLU", "gated variant", "ℝ", "Used in LLaMA-class LLMs; usually best empirically."],
    ["Softmax", "e^{zᵢ}/Σe^{zⱼ}", "(0,1), sums to 1", "Output layer for MULTI-CLASS only."],
  ],
  dyingRelu: "DYING ReLU: a neuron that always receives negative input outputs 0 forever, and its gradient is 0, so it never recovers. Leaky ReLU or GELU addresses that. Being able to name this specific failure is a good signal.",
  whyRelu: "\"Why ReLU rather than something smoother?\" → It's cheap — a comparison, not an exponential. Its gradient is exactly 1 for positive inputs, so it doesn't attenuate the signal on the backward pass, which is the main cure for vanishing gradients. And it produces sparse activations. The cost is dying ReLU.",
};

export const BACKPROP = {
  h: "Backpropagation — worked by hand",
  intuition: "FORWARD PASS: data goes in, flows through the layers, a prediction comes out, you compute how wrong it was.\n\nBACKWARD PASS: you work backwards figuring out how much each individual weight contributed to that error, then nudge each one in the direction that would have reduced it.\n\nTHE ANALOGY: a restaurant gets a bad review for a dish. The manager traces it backwards — how much was the chef, the ingredients, the supplier? Each is assigned a share of the blame and adjusts proportionally. Backprop is AUTOMATED BLAME ASSIGNMENT, run millions of times.\n\nMechanically it's the chain rule + dynamic programming (cache intermediate results instead of recomputing).",
  worked: {
    h: "A tiny network, all the way through",
    setup: "z₁ = w₁x + b₁,  a₁ = ReLU(z₁),  z₂ = w₂a₁ + b₂,  ŷ = σ(z₂),  L = BCE\n\nForward with x=2, w₁=0.5, b₁=0, w₂=1.0, b₂=0, y=1:",
    forward: `z₁ = 0.5·2 + 0 = 1.0
a₁ = ReLU(1.0)  = 1.0
z₂ = 1.0·1.0 + 0 = 1.0
ŷ  = σ(1.0)     = 0.731
L  = −log(0.731) = 0.313`,
    backward: `∂L/∂z₂ = ŷ − y = 0.731 − 1 = −0.269
∂L/∂w₂ = ∂L/∂z₂ · a₁       = −0.269 · 1.0 = −0.269
∂L/∂b₂ = ∂L/∂z₂             = −0.269
∂L/∂a₁ = ∂L/∂z₂ · w₂        = −0.269 · 1.0 = −0.269
∂L/∂z₁ = ∂L/∂a₁ · ReLU'(z₁) = −0.269 · 1   = −0.269
∂L/∂w₁ = ∂L/∂z₁ · x         = −0.269 · 2   = −0.538
∂L/∂b₁ = −0.269`,
    update: "Then update: w₁ ← 0.5 − 0.1·(−0.538) = 0.554.\n\nNegative gradient → weight INCREASES → ŷ moves toward 1. Correct.",
    say: "\"Backprop computes ∂L/∂θ for every parameter by propagating the error signal δ backwards, where each layer's local gradient multiplies the incoming upstream gradient. Cost is roughly the same as one forward pass; memory is O(activations) because we must cache them.\"",
  },
  vanishing: {
    h: "Vanishing and exploding gradients",
    body: "In a deep network the gradient at early layers is a PRODUCT of many terms. If those terms are <1 the product shrinks exponentially — multiply by 0.1 twenty times and you get 1e-20, effectively zero. The early layers receive NO learning signal and never improve. If the terms are >1 it blows up to NaN.\n\nThis is why deep networks were stuck for decades.",
    fixes: [
      "ReLU-family activations — derivative exactly 1 for x>0, so the signal isn't attenuated",
      "Careful initialization (He/Xavier)",
      "RESIDUAL / SKIP CONNECTIONS — the gradient flows through the identity path unchanged. This is why ResNets can go 100+ layers, and it's the single most important fix",
      "Batch / layer normalization — keeps values in a healthy range",
      "Gradient clipping — for EXPLODING gradients; standard in RNNs and LLM training",
      "LSTM/GRU gates — the sequence-specific version of the same idea",
    ],
    say: "\"Vanishing gradients, solved by ReLU and skip connections\" covers a very common question in one sentence.",
  },
  init: {
    h: "Weight initialization",
    body: "ALL ZEROS → every neuron in a layer computes the identical thing and receives identical gradients FOREVER. Symmetry never breaks. This is a real interview question and the answer is mechanical: never do it.\n\nTOO LARGE → saturation/explosion. TOO SMALL → vanishing signal.\n\nXAVIER/GLOROT: Var(W) = 2/(fan_in + fan_out) — for tanh/sigmoid.\nHE/KAIMING: Var(W) = 2/fan_in — for ReLU. The factor 2 compensates for ReLU killing half the activations. The default for modern CNNs.\n\nBiases initialize to 0 — that's fine, symmetry is already broken by the weights.",
  },
  scratchCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

def train_nn(X, y, hidden=16, lr=0.1, epochs=1000, seed=0):
    rng = np.random.default_rng(seed)
    n, d = X.shape
    # He initialization - scaled for ReLU. NEVER initialize to all zeros:
    # every neuron would compute the same thing and get the same gradient forever.
    W1 = rng.normal(0, np.sqrt(2 / d), (d, hidden));  b1 = np.zeros(hidden)
    W2 = rng.normal(0, np.sqrt(2 / hidden), (hidden, 1)); b2 = np.zeros(1)

    for epoch in range(epochs):
        # ---------- FORWARD ----------
        z1 = X @ W1 + b1
        a1 = np.maximum(0, z1)    # ReLU <- the non-linearity. Without it,
                                  #   two linear layers collapse into one.
        z2 = a1 @ W2 + b2
        a2 = sigmoid(z2).ravel()
        loss = -np.mean(y*np.log(a2+1e-9) + (1-y)*np.log(1-a2+1e-9))

        # ---------- BACKWARD (chain rule, layer by layer) ----------
        dz2 = (a2 - y).reshape(-1, 1) / n   # sigmoid + BCE -> (pred - true)
        dW2 = a1.T @ dz2;  db2 = dz2.sum(0)
        da1 = dz2 @ W2.T
        dz1 = da1 * (z1 > 0)                # ReLU derivative: 1 if z>0 else 0
        dW1 = X.T @ dz1;   db1 = dz1.sum(0)

        # ---------- UPDATE ----------
        W2 -= lr * dW2;  b2 -= lr * db2
        W1 -= lr * dW1;  b1 -= lr * db1
    return W1, b1, W2, b2`,
  scratchNotes: [
    "np.maximum(0, z1) — the ReLU. Remove it and the network becomes X @ W1 @ W2, mathematically identical to a single linear layer. That's why activations are mandatory, and now you can say it as something you've SEEN.",
    "dz2 = (a2 − y). With sigmoid output and cross-entropy loss, all the messy derivative terms cancel and you're left with just prediction − truth. That's why those two are always paired.",
    "W1 = rng.normal(...) not np.zeros(...). With zero init every neuron in a layer computes the same value and gets the same gradient forever — symmetry never breaks.",
  ],
  pytorchNote: `import torch.nn as nn, torch
model = nn.Sequential(nn.Linear(d, 16), nn.ReLU(), nn.Linear(16, 1))
criterion = nn.BCEWithLogitsLoss()   # fuses sigmoid + BCE - numerically stable
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(1000):
    optimizer.zero_grad()      # <- forget this and gradients ACCUMULATE. Classic bug.
    out  = model(X_tensor).squeeze()
    loss = criterion(out, y_tensor)
    loss.backward()            # backprop - computes all gradients
    optimizer.step()           # applies the update`,
  pytorchGotcha: "optimizer.zero_grad() — PyTorch accumulates gradients by default. Omit it and gradients from every previous batch pile up, and training silently degrades. The most common PyTorch bug and worth being able to name.",
};

// ─── TRANSFORMERS ───────────────────────────────────────────────────────────
export const TRANSFORMER = {
  h: "Transformers & Attention",
  flag: "The most important architecture in AI today, and the highest-yield deep-learning topic in current interviews.",
  coreIdea: {
    h: "The core idea: attention",
    body: "Consider: \"The animal didn't cross the street because it was too tired.\"\n\nWhat does \"it\" refer to — the animal or the street? Obviously the animal. But how does a model know?\n\nAttention lets EVERY word look at EVERY other word and decide how relevant each one is. When processing \"it\", the model computes a relevance score against every other word, finds \"animal\" highly relevant and \"street\" not, and builds its understanding of \"it\" mostly out of \"animal\".",
    qkv: "QUERY, KEY, VALUE — the library analogy. Every token produces three vectors via learned projections:\n\n• QUERY = \"here's what I'm looking for\" (your search request)\n• KEY = \"here's what I'm about\" (a book's label on the shelf)\n• VALUE = \"here's my actual content\" (what's inside the book)\n\nYou compare your Query against every Key to see which books are relevant, then take a BLEND of the Values from the relevant ones, weighted by relevance. That's attention.",
  },
  formula: "Q = XW_Q,   K = XW_K,   V = XW_V\n\n    Attention(Q, K, V) = softmax( QKᵀ / √d_k ) · V",
  steps: [
    { n: 1, label: "QKᵀ", body: "Every query dotted with every key → an n×n matrix of raw relevance scores." },
    { n: 2, label: "/ √d_k — the scaling", body: "Dot products of d_k-dimensional vectors have variance proportional to d_k. Large logits push softmax into a near one-hot distribution, where its gradient is nearly zero and learning stalls — and the attention becomes HARD rather than soft, losing the ability to blend information. Dividing by √d_k normalizes the variance back to ~1. THIS GETS ASKED CONSTANTLY." },
    { n: 3, label: "softmax", body: "Row-wise → each token's attention weights sum to 1." },
    { n: 4, label: "· V", body: "Each output is a relevance-weighted blend of all value vectors." },
  ],
  whySqrt: "\"Why √d_k specifically and not d_k?\" → Because variance scales WITH d_k, and dividing the values by √d_k divides the variance by d_k, bringing it back to unit scale. Dividing by d_k itself would over-correct and make the distribution too flat.",
  multiHead: {
    h: "Multi-head attention",
    body: "Run attention h times in parallel with different learned projections of dimension d_k = d_model/h, concatenate, then project through W_O.\n\nWHY, not just \"because the paper says so\": a single softmax attention produces ONE weighted average — one \"opinion\" about what's relevant. But a token often has SEVERAL distinct relationships simultaneously: its syntactic head, its coreferent, its adjacent tokens. One attention distribution has to blend all of those into one set of weights, and averaging them loses the structure. Multiple heads let different subspaces specialize.\n\nAnd it's essentially free — heads have dimension d_model/h, so total compute is the same as one full-width head.\n\nHONEST NUANCE worth adding: interpretability work does show heads that clearly track syntactic dependencies or positional offsets. But other work shows a large fraction of heads can be pruned with little loss, suggesting substantial redundancy. So specialization is real but the picture is messier than the clean narrative.",
  },
  masking: "CAUSAL / MASKED SELF-ATTENTION: in a decoder, scores for FUTURE positions are set to −∞ before the softmax, so a token can only attend to itself and the past. Without this, next-token prediction would be trivially cheating.\n\nCROSS-ATTENTION: Q comes from the decoder, K and V from the encoder. This is how a translation decoder reads the source sentence.",
  positional: "POSITIONAL ENCODING: attention is PERMUTATION-INVARIANT — without position information \"dog bites man\" and \"man bites dog\" are identical.\n\n• Sinusoidal (original) — fixed, added to input embeddings\n• Learned absolute (BERT)\n• RoPE (rotary) — rotates Q and K by an angle proportional to position, so their dot product depends on the DIFFERENCE in positions. Relative position falls out of the mechanism rather than being learned; extrapolates better; applied at every layer rather than injected once at the input. Used in LLaMA and most modern LLMs.\n• ALiBi — a linear distance penalty added to attention scores.\n\nWHY RoPE OVER SINUSOIDAL: sinusoidal and learned-absolute encodings are ADDED to input embeddings, so position information must survive through every layer, and they encode ABSOLUTE position. What actually matters for language is usually RELATIVE position — \"three tokens back\" matters more than \"position 847\".\n\nDoes RoPE extrapolate perfectly? No — naive RoPE degrades past the trained context length too. That's why position interpolation and NTK-aware scaling exist, rescaling the rotation frequencies to stretch the effective context. Works reasonably but usually needs some fine-tuning at the longer length.",
  block: "THE REST OF THE BLOCK:\n\nFEED-FORWARD NETWORK (FFN): applied per position, FFN(x) = W₂·GELU(W₁x + b₁) + b₂, typically expanding to 4× d_model and back. MOST PARAMETERS LIVE HERE, and there's reasonable evidence most factual knowledge is stored here rather than in attention.\n\nRESIDUAL CONNECTIONS + LAYERNORM around both sub-layers.\n\nPRE-NORM vs POST-NORM: modern models use PRE-norm — x + Sublayer(LN(x)). The original paper was post-norm and needed careful LR warmup to train at all, because the residual path passes through the normalization. Pre-norm keeps a clean identity path for gradients and trains much more stably at depth. Nearly every modern model is pre-norm.\n\nFULL BLOCK: x → LN → MHA → +residual → LN → FFN → +residual",
  complexity: "COMPLEXITY: O(n²·d) time and O(n²) memory in sequence length — the reason long context is expensive. Doubling the input QUADRUPLES the attention cost.\n\nMITIGATIONS: FlashAttention (IO-aware exact attention that avoids materializing the n×n matrix in slow memory — same output, dramatically less memory and time) · sparse/local/sliding-window attention · linear attention · Multi-Query / Grouped-Query Attention (share K/V across heads to shrink the KV cache) · state-space models (Mamba).",
  families: {
    headers: ["", "Architecture", "Objective", "Good for"],
    rows: [
      ["BERT", "Encoder-only, bidirectional", "Masked LM (predict masked tokens) + NSP", "Classification, NER, embeddings, retrieval"],
      ["GPT", "Decoder-only, causal", "Next-token prediction", "Generation, chat, few-shot, everything"],
      ["T5 / BART", "Encoder–decoder", "Span corruption / denoising", "Translation, summarization, seq2seq"],
    ],
    why: "WHY DECODER-ONLY WON: next-token prediction is a UNIVERSAL objective that turns every task into the same task. Encoder-decoder models need paired input-output data for their objective to be natural; decoder-only models train on raw text, which exists in effectively unlimited quantity. That means better scaling. Once translation, summarization, classification and QA are all framed as \"continue this text\", architectural specialization stops earning its keep.\n\nBUT: encoder-only models like BERT are still the RIGHT choice for embeddings and classification, which is why RAG retrieval uses them rather than a decoder. Causal masking means a token can only see backwards, so the representation of the whole sequence is weaker than a bidirectional encoder's.",
  },
  bertVsGpt: {
    headers: ["", "BERT", "GPT"],
    rows: [
      ["Reads text", "Both directions at once", "Left to right only"],
      ["Trained by", "Hiding random words and predicting them", "Predicting the next word"],
      ["Good at", "Understanding — classification, search, extraction", "Generating — writing, chat, answering"],
      ["Can it write text?", "Not really", "Yes, that's the whole point"],
      ["Where you'd use it", "Embeddings for search/RAG, sentiment classification", "Anything ChatGPT-like"],
    ],
  },
  whyWon: "WHY TRANSFORMERS WON over RNNs: all positions are processed AT ONCE instead of one at a time, so training parallelizes across thousands of GPUs. That's what made training on the entire internet feasible, and that's what produced modern LLMs. Plus attention gives every position DIRECT access to every other position regardless of distance, so long-range dependencies don't decay.",
};

// ─── NLP FUNDAMENTALS ───────────────────────────────────────────────────────
export const NLP = {
  tokenization: {
    h: "Tokenization",
    body: "Models don't see words, they see TOKENS — chunks of text roughly 3–4 characters. \"unbelievable\" might become \"un\" + \"believ\" + \"able\". Common words are one token; rare words break into pieces. Everything is measured and billed in tokens.\n\nWHY SUBWORD AND NOT WORDS OR CHARACTERS?\n• Word-level: vocabulary explodes (millions), and any unseen word is an unrecoverable out-of-vocabulary token.\n• Character-level: tiny vocabulary, but sequences become ~5× longer, and since attention costs scale with the SQUARE of length that's brutal. Also each character carries little meaning.\n• SUBWORD is the compromise: a fixed vocabulary (~32k–200k), NO OOV problem ever (worst case you fall back to bytes), and common words stay single tokens.\n\nALGORITHMS: BPE (Byte-Pair Encoding) — start with characters, repeatedly find the most frequent adjacent pair and merge it, repeat to target vocab size. WordPiece (BERT) — similar but merges based on likelihood improvement rather than raw frequency. SentencePiece/Unigram — operates on raw bytes, language-agnostic, handles any script.",
    consequences: [
      "Non-English text often costs 2–4× more tokens for the same content, because tokenizers are trained mostly on English. Devanagari or Tamil text can fragment down to individual bytes. Three consequences: directly more expensive, consumes context window faster, and DEGRADES QUALITY because the model spends representational capacity reassembling characters rather than on meaning. A real fairness and cost issue for non-English products.",
      "Models are bad at character-level tasks (counting letters, reversing strings, rhyming) because they never see characters.",
      "Numbers tokenize inconsistently, which is part of why arithmetic is unreliable.",
      "Rough rule: 1 token ≈ 0.75 English words, so 1,000 tokens ≈ 750 words.",
    ],
    fix: "What can you do about the multilingual cost? Not much at the API level beyond choosing models with better multilingual tokenizers — some are notably better. If self-hosting, you can extend the tokenizer vocabulary with target-language tokens and continue pretraining, but that's a substantial project.",
  },
  embeddings: {
    h: "Embeddings",
    body: "Dense vectors where semantic similarity ≈ cosine similarity. An embedding model maps text into a fixed-dimensional vector (384, 768, 1024, 1536, 3072 are common), trained so semantically related texts have high cosine similarity — usually with a CONTRASTIVE objective: pull matching pairs together, push non-matching apart (InfoNCE / multiple-negatives ranking loss, using in-batch negatives).",
    static: "STATIC vs CONTEXTUAL:\n• Word2Vec / GloVe / FastText — ONE fixed vector per word forever. \"bank\" gets the same vector in \"river bank\" and \"bank loan\". Word2Vec's Skip-gram predicts context from a word; CBOW predicts the word from context (Skip-gram is better on rare words). Both trained efficiently with NEGATIVE SAMPLING instead of a full softmax over the vocabulary. GloVe factorizes a global co-occurrence matrix. FastText adds character n-grams → handles OOV and morphology.\n• BERT-family — the vector DEPENDS ON CONTEXT, so \"bank\" differs in each sentence. This was the leap.\n• SENTENCE EMBEDDINGS — naive mean-pooling of BERT tokens is surprisingly WEAK. Sentence-BERT fine-tunes with a siamese/triplet objective specifically for similarity. Modern strong options: E5, BGE, GTE, Voyage, OpenAI text-embedding-3, Cohere embed-v3.",
    selection: "PRACTICAL SELECTION CRITERIA for an embedding model (a real interview question): dimension (cost/quality tradeoff), max sequence length (does it TRUNCATE your chunks?), domain match, MTEB benchmark scores on RETRIEVAL specifically, multilingual support, cost, and whether it's self-hostable.\n\nCRITICAL CONSTRAINT: query and document must use the SAME model, and changing models requires RE-EMBEDDING THE ENTIRE CORPUS. That migration cost is why model choice matters more than it looks.\n\nASYMMETRIC SEARCH: queries are short questions; documents are long passages. Some models (E5, BGE) require prefixes like \"query: \" and \"passage: \" to handle this. Forgetting them SILENTLY degrades retrieval.",
  },
  tasks: "CLASSIC TASKS: classification · NER (BIO tagging) · POS tagging · QA (extractive: predict start/end spans) · summarization (extractive vs abstractive) · translation · coreference · semantic similarity (STS).",
  tfidf: "TF-IDF: tf(t,d) × log(N/df(t)). Still a strong sparse baseline and the basis of BM25, which you should use ALONGSIDE dense retrieval (hybrid search) — it nails exact keyword, ID and rare-term matches that embeddings miss.",
};

// ─── OTHER GENERATIVE MODEL FAMILIES ────────────────────────────────────────
export const GENERATIVE_FAMILIES = [
  { name: "VAE", body: "Encoder to a latent DISTRIBUTION + decoder. Loss = reconstruction + KL divergence. Trained with the reparameterization trick. Blurry samples, but a well-behaved latent space you can interpolate in." },
  { name: "GAN", body: "Generator vs discriminator in a minimax game. Sharp samples, but unstable training and mode collapse (the generator finds a few outputs that fool the discriminator and stops exploring)." },
  { name: "Diffusion", body: "Gradually add Gaussian noise (forward process), train a network to REVERSE it step by step. State of the art for images. Slower sampling, mitigated by DDIM and distillation. Text-to-image uses classifier-free guidance and a text encoder (CLIP/T5). Latent diffusion (Stable Diffusion) runs the process in a compressed latent space rather than pixel space." },
  { name: "CLIP", body: "Contrastive image–text pretraining → a SHARED embedding space for both modalities → zero-shot classification and multimodal retrieval." },
];
