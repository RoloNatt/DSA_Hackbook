// ─── GOOGLE INTERVIEW INTEL ─────────────────────────────────────────────────
// Compiled from candidate reports (LeetCode Discuss, interview-experience
// aggregators, 250+ report analyses) for SWE III / L4, 2024–2026.

export const GOOGLE_FORMAT = {
  headline: "What a Google SWE III (L4) loop looks like",
  rounds: [
    { icon: "💻", name: "DSA Coding ×2 (your case)", detail: "45 min each: ~5 min intro, ~35 min on one problem + follow-ups, ~5 min your questions. Shared editor or Google Doc — NO autocomplete, NO running code. Medium→hard difficulty; a working brute force upgraded to optimal beats a broken optimal." },
    { icon: "🤖", name: "AI/ML Domain (your 3rd round)", detail: "Conversational deep-dive: ML fundamentals, trade-off reasoning, and YOUR past projects. Expect 'why that model?', 'what metric and why?', 'what failed?'. 2025–26 loops increasingly probe LLM-era topics (RAG, fine-tuning, serving)." },
    { icon: "🤝", name: "Googleyness & Leadership", detail: "Behavioral: conflict resolution, disagreeing respectfully, ambiguity, helping others. Prepare 4–5 STAR stories with concrete outcomes. This carries real weight (~30% of committee feedback)." },
  ],
  facts: [
    "One weak coding round can sink an L4 packet — consistency matters more than one brilliant round.",
    "Interviewers submit written feedback on 4 axes; a Hiring Committee (not the interviewer) decides.",
    "Rejection → typically a 1-year cooldown, so treat this week seriously.",
    "Team matching happens AFTER the hiring committee approves you.",
    "You may briefly look up syntax? No — assume no. Practice writing Python in a plain doc.",
  ],
};

export const GOOGLE_RUBRIC = [
  { axis: "Problem solving / Algorithms", weight: "≈40%", what: "Did you explore the space (brute force → better), pick correct data structures, and reason about complexity unprompted?", tell: "Say big-O of every approach BEFORE coding. Compare 2 approaches out loud." },
  { axis: "Coding", weight: "≈25%", what: "Clean, idiomatic, runnable-looking Python. Good names, small helpers, no hand-waving.", tell: "Write real code, not pseudocode. Handle the edge cases you listed." },
  { axis: "Communication", weight: "≈20%", what: "Thinking out loud, clarifying before diving in, incorporating hints gracefully.", tell: "If stuck 2+ min silently, you're losing points — narrate your dead end instead; hints taken well are a POSITIVE signal." },
  { axis: "Testing / Verification", weight: "≈15%", what: "Do you test your own code without being told? Walk through an example, probe edges.", tell: "After coding, immediately say: 'Let me trace through example X…' then test empty/single/duplicate/extreme inputs." },
];

// Topic frequency across ~250 Google SWE interview reports.
export const GOOGLE_TOPIC_FREQ = [
  { topic: "Arrays & Strings (hashing, windows, two pointers)", pct: 35, note: "Warm-ups AND hard finishes live here. Sliding window + hashmap = your bread and butter.", algoIds: ["hashmap", "sliding", "twopointer", "prefixsum", "stack"] },
  { topic: "Trees & Graphs (BFS/DFS, grids, topo, BST)", pct: 25, note: "Grid BFS/DFS (islands!) is the single most-reported family. Trees: LCA, validate BST, serialize.", algoIds: ["bfs", "dfs", "trees", "toposort", "unionfind", "trie"] },
  { topic: "Dynamic Programming", pct: 15, note: "Word Break, Coin Change, LIS (know O(n log n)!), Edit Distance, Unique Paths.", algoIds: ["dp"] },
  { topic: "Linked Lists", pct: 12, note: "Usually as a component — reversal, fast/slow, and inside LRU Cache.", algoIds: ["linkedlist"] },
  { topic: "Search & Sort (binary search, intervals)", pct: 8, note: "Binary-search-on-answer is a Google signature. Merge Intervals / Meeting Rooms II recur.", algoIds: ["binarysearch", "intervals"] },
  { topic: "Hash Tables & Heaps as the MAIN trick", pct: 5, note: "Top-K, merge-k-sorted, stream median, design problems (LRU, rate limiter).", algoIds: ["heap", "design"] },
];

export const GOOGLE_STYLE = [
  { icon: "🌫️", title: "Deliberately ambiguous prompts", body: "Google under-specifies on purpose: 'Given a log of user visits, find popular pages.' YOUR first move: ask about input size, format, duplicates, ties, memory limits. Deriving the real problem is 30% of the score. Never start coding inside the first 5 minutes." },
  { icon: "📈", title: "Follow-up scaling", body: "Solve it, and they twist: 'What if the input doesn't fit in memory?' 'What if it's a stream?' 'What if it's called a million times?' Design your first solution with clean seams (helper functions) so you can swap parts. Expect 2–3 escalations per 45 minutes." },
  { icon: "🎭", title: "Classics in disguise", body: "Google rarely asks Two Sum verbatim. They dress patterns in product stories: 'YouTube buffering segments' = Merge Intervals; 'Drive folder sync' = tree traversal; 'flight prices' = Dijkstra. Practice NAMING the underlying pattern from the story — that's exactly what the Identify tab trains." },
  { icon: "🧪", title: "You run the tests", body: "There's no compiler. After writing code, trace a small example line by line, out loud, fixing bugs as you find them (finding your own bug = strong positive signal). Then state: empty input, single element, all-duplicates, extremes." },
  { icon: "🐍", title: "Python-specific expectations", body: "Idiomatic Python is welcomed: Counter, defaultdict, deque, heapq, bisect, enumerate, zip. But know the costs — interviewers ask 'what's the complexity of that sort / in / slice?' (see Big-O tab)." },
];

// The 45-minute protocol — what to do minute by minute.
export const GOOGLE_PROTOCOL = [
  { phase: "0–5 min · Clarify", items: ["Repeat the problem back in one sentence.", "Ask: input size? value ranges? sorted? duplicates? empty input? expected output format?", "Work ONE small example by hand — confirm expected output with the interviewer.", "Constraints hint complexity: n ≤ 1e5 → need O(n log n); n ≤ 20 → exponential OK (see Big-O tab)."] },
  { phase: "5–12 min · Plan", items: ["State the brute force + its complexity in one breath ('naively O(n²) by checking all pairs').", "Name the pattern that improves it ('sorted + pair → two pointers', 'contiguous + constraint → window').", "Agree the plan with the interviewer BEFORE coding: 'I'll do X with Y structure, O(n log n) — sound good?'", "Announce complexity of the chosen plan (time AND space)."] },
  { phase: "12–30 min · Code", items: ["Narrate as you type — silence reads as being lost.", "Real Python, real names (left/right not i/j when meaning matters), small helper functions.", "Don't micro-optimize while writing; leave a TODO comment and mention it.", "If stuck: say what you're stuck on. A used hint scores BETTER than 10 silent minutes."] },
  { phase: "30–40 min · Verify", items: ["Trace your code on the example from minute 3, line by line, out loud.", "Test edges: empty, size 1, duplicates, negative numbers, max size.", "State final time & space complexity, and where the bottleneck is.", "Mention the follow-up you'd expect: 'if this had to stream, I'd …' — beat them to it."] },
  { phase: "40–45 min · Your questions", items: ["Ask about the team's problems, not perks.", "Good one: 'What does a typical design→code→launch cycle look like on your team?'"] },
];

// Most-reported Google problems, tagged by pattern (algoId links into ALGOS).
export const GOOGLE_PROBLEMS = [
  { name: "Number of Islands", lc: 200, diff: "Med", algoId: "dfs", pattern: "Grid DFS/BFS", note: "THE Google problem. Variants: max area, distinct shapes, islands II (union-find)." },
  { name: "Rotting Oranges", lc: 994, diff: "Med", algoId: "bfs", pattern: "Multi-source BFS", note: "Seed queue with all rotten; level = 1 minute." },
  { name: "Word Ladder", lc: 127, diff: "Hard", algoId: "bfs", pattern: "BFS on implicit graph", note: "Words are nodes; precompute h*t wildcard buckets." },
  { name: "Course Schedule I / II", lc: 207, diff: "Med", algoId: "toposort", pattern: "Topological sort", note: "Kahn's + cycle check. II returns the order." },
  { name: "Evaluate Division", lc: 399, diff: "Med", algoId: "unionfind", pattern: "Union-Find / weighted graph", note: "a/b=2 as weighted edges; DFS or DSU with ratios." },
  { name: "Longest Substring Without Repeating Characters", lc: 3, diff: "Med", algoId: "sliding", pattern: "Sliding window", note: "The canonical window. Know the last-index-jump optimization." },
  { name: "Minimum Window Substring", lc: 76, diff: "Hard", algoId: "sliding", pattern: "Min window", note: "Expand→shrink-while-valid. Track have/need counts." },
  { name: "Trapping Rain Water", lc: 42, diff: "Hard", algoId: "twopointer", pattern: "Two pointers / stack", note: "Water[i] = min(maxL, maxR) − h[i]. Two-pointer O(1) space impresses." },
  { name: "Merge Intervals", lc: 56, diff: "Med", algoId: "intervals", pattern: "Sort + merge", note: "Sort by start; extend or push. Clarify touching endpoints." },
  { name: "Insert Interval", lc: 57, diff: "Med", algoId: "intervals", pattern: "Intervals", note: "Three phases: before / overlapping (merge) / after." },
  { name: "Meeting Rooms II", lc: 253, diff: "Med", algoId: "intervals", pattern: "Heap of end times", note: "Or +1/−1 sweep. Google asks this constantly." },
  { name: "Two Sum (then follow-ups)", lc: 1, diff: "Easy", algoId: "hashmap", pattern: "HashMap", note: "Warm-up; follow-ups go to 3Sum / sorted / streaming." },
  { name: "Subarray Sum Equals K", lc: 560, diff: "Med", algoId: "prefixsum", pattern: "Prefix sum + hashmap", note: "Seed {0:1}. Window FAILS here (negatives)." },
  { name: "Next Permutation", lc: 31, diff: "Med", algoId: "twopointer", pattern: "Array manipulation", note: "Find descent from right, swap, reverse suffix." },
  { name: "Text Justification", lc: 68, diff: "Hard", algoId: "stack", pattern: "Simulation / strings", note: "No algorithm — pure careful coding. Google loves it for exactly that." },
  { name: "Decode String", lc: 394, diff: "Med", algoId: "stack", pattern: "Stack parsing", note: "Stack of (prev_string, count) at each '['." },
  { name: "Basic Calculator II", lc: 227, diff: "Med", algoId: "stack", pattern: "Expression parsing", note: "Stack of signed terms; handle * / immediately." },
  { name: "Daily Temperatures", lc: 739, diff: "Med", algoId: "stack", pattern: "Monotonic stack", note: "Decreasing index stack; pop when warmer arrives." },
  { name: "Validate Binary Search Tree", lc: 98, diff: "Med", algoId: "trees", pattern: "Bounds recursion", note: "Pass (lo, hi) down — parent-only check is the trap." },
  { name: "Binary Tree Maximum Path Sum", lc: 124, diff: "Hard", algoId: "trees", pattern: "Tree DFS", note: "Return best one-arm; record best two-arm globally." },
  { name: "Lowest Common Ancestor", lc: 236, diff: "Med", algoId: "trees", pattern: "Tree recursion", note: "Left and right both found ⇒ current is LCA." },
  { name: "Serialize and Deserialize Binary Tree", lc: 297, diff: "Hard", algoId: "trees", pattern: "Preorder + nulls", note: "Google classic; iterator-based rebuild." },
  { name: "Binary Tree Level Order Traversal", lc: 102, diff: "Med", algoId: "trees", pattern: "Tree BFS", note: "for _ in range(len(queue)) = one level. Basis of right-side-view/zigzag." },
  { name: "Word Search II", lc: 212, diff: "Hard", algoId: "trie", pattern: "Trie + grid backtracking", note: "Trie of words, DFS the grid through it; prune found words." },
  { name: "Design Search Autocomplete", lc: 642, diff: "Hard", algoId: "trie", pattern: "Trie + ranking", note: "It's literally Google Search. Trie nodes cache top-3 completions." },
  { name: "Word Break", lc: 139, diff: "Med", algoId: "dp", pattern: "1D DP", note: "can(i) = any(s[i:j] in dict and can(j)). @lru_cache version is clean." },
  { name: "Coin Change", lc: 322, diff: "Med", algoId: "dp", pattern: "Unbounded knapsack", note: "State the greedy counter-example [1,3,4]→6 unprompted." },
  { name: "Longest Increasing Subsequence", lc: 300, diff: "Med", algoId: "dp", pattern: "DP / patience sort", note: "Give O(n²), then the O(n log n) tails+bisect — Google notices." },
  { name: "Edit Distance", lc: 72, diff: "Hard", algoId: "dp", pattern: "2D DP", note: "Spell-correction adjacent — very Google. Know the 3 transitions." },
  { name: "Unique Paths", lc: 62, diff: "Med", algoId: "dp", pattern: "Grid DP", note: "Rolling 1D row; mention the math (combinatorics) bonus answer." },
  { name: "Maximum Subarray", lc: 53, diff: "Med", algoId: "dp", pattern: "Kadane's", note: "best_ending_here = max(x, best+x). Explain WHY it works." },
  { name: "Jump Game", lc: 55, diff: "Med", algoId: "greedy", pattern: "Greedy reach", note: "Track farthest reachable index; one pass." },
  { name: "Gas Station", lc: 134, diff: "Med", algoId: "greedy", pattern: "Greedy reset", note: "Total ≥ 0 ⇒ answer exists; reset start at failure point." },
  { name: "Generate Parentheses", lc: 22, diff: "Med", algoId: "backtracking", pattern: "Backtracking", note: "open < n and close < open constraints prune everything invalid." },
  { name: "Letter Combinations of a Phone Number", lc: 17, diff: "Med", algoId: "backtracking", pattern: "Backtracking", note: "Classic warm-up; follow-up: iterator version (Google twist)." },
  { name: "Word Search", lc: 79, diff: "Med", algoId: "backtracking", pattern: "Grid backtracking", note: "Mark cell, recurse 4 ways, UNMARK. Prune by letter counts." },
  { name: "Robot Room Cleaner", lc: 489, diff: "Hard", algoId: "backtracking", pattern: "DFS w/ constrained API", note: "Famous Google question: DFS via move/turn API only, backtrack physically." },
  { name: "Median of Two Sorted Arrays", lc: 4, diff: "Hard", algoId: "binarysearch", pattern: "Binary search partition", note: "Partition smaller array; O(log min(m,n))." },
  { name: "Search in Rotated Sorted Array", lc: 33, diff: "Med", algoId: "binarysearch", pattern: "Modified binary search", note: "One half is always sorted — decide from that." },
  { name: "Find First and Last Position", lc: 34, diff: "Med", algoId: "binarysearch", pattern: "Boundary binary search", note: "bisect_left + bisect_right, or two hand-rolled bounds." },
  { name: "Koko Eating Bananas", lc: 875, diff: "Med", algoId: "binarysearch", pattern: "Binary search on answer", note: "can(speed) monotonic ⇒ search speed. Google signature move." },
  { name: "Split Array Largest Sum", lc: 410, diff: "Hard", algoId: "binarysearch", pattern: "Binary search on answer", note: "Search the max-subarray-sum; check greedily." },
  { name: "Kth Largest Element in an Array", lc: 215, diff: "Med", algoId: "heap", pattern: "Heap / quickselect", note: "Size-k min-heap O(n log k); mention quickselect avg O(n)." },
  { name: "Top K Frequent Elements", lc: 347, diff: "Med", algoId: "heap", pattern: "Counter + heap", note: "Counter + nlargest; bucket sort for O(n) follow-up." },
  { name: "Merge k Sorted Lists", lc: 23, diff: "Hard", algoId: "heap", pattern: "Heap of heads", note: "(val, i, node) tuples to break ties. O(N log k)." },
  { name: "Find Median from Data Stream", lc: 295, diff: "Hard", algoId: "heap", pattern: "Two heaps", note: "Max-heap low half + min-heap high half, rebalance to ±1." },
  { name: "LRU Cache", lc: 146, diff: "Med", algoId: "design", pattern: "HashMap + DLL", note: "Top-reported design question. OrderedDict OK; offer the DLL detail." },
  { name: "Insert Delete GetRandom O(1)", lc: 380, diff: "Med", algoId: "design", pattern: "Array + hashmap", note: "Delete = swap with last + pop. Explain why random needs an array." },
  { name: "Time Based Key-Value Store", lc: 981, diff: "Med", algoId: "design", pattern: "HashMap + binary search", note: "dict → sorted (timestamp, value) lists; bisect on get." },
  { name: "Logger Rate Limiter", lc: 359, diff: "Easy", algoId: "design", pattern: "HashMap timestamps", note: "Reported Google warm-up; follow-up: memory cleanup (queue)." },
  { name: "Snapshot Array", lc: 1146, diff: "Med", algoId: "design", pattern: "Versioned binary search", note: "Very Google-reported. Per-index (snap_id, val) lists + bisect." },
  { name: "Reverse Linked List (+ in k-groups)", lc: 206, diff: "Easy→Hard", algoId: "linkedlist", pattern: "Pointer reversal", note: "206 is the building block; 25 (k-groups) is the hard follow-up." },
  { name: "Linked List Cycle II", lc: 142, diff: "Med", algoId: "linkedlist", pattern: "Floyd fast/slow", note: "After meeting, reset one to head; they meet at cycle start." },
];

// ─── AI/ML DOMAIN ROUND ─────────────────────────────────────────────────────
export const ML_DOMAIN = {
  intro: "A 45-minute conversational deep-dive, not a coding round. Two halves: (1) fundamentals — can you explain and reason about core ML trade-offs; (2) your experience — a project deep-dive where 'why' matters more than 'what'. For 2025–26 Google loops, expect LLM-era questions too.",
  sections: [
    {
      title: "Core ML Fundamentals (must be airtight)",
      icon: "🎓",
      items: [
        { q: "Bias–variance tradeoff", a: "High bias = underfit (too simple, bad on train AND test). High variance = overfit (great on train, bad on test). Fixes for variance: more data, regularization, simpler model, ensembling. Fixes for bias: richer model, better features, train longer. Diagnose from train-vs-validation curves." },
        { q: "Overfitting & regularization", a: "L2 (ridge/weight decay) shrinks all weights smoothly; L1 (lasso) drives some to exactly zero → feature selection. Also: dropout (random neuron masking; acts as an ensemble), early stopping, data augmentation. Know WHY L1 gives sparsity (corner of the diamond constraint)." },
        { q: "Logistic regression + cross-entropy", a: "Sigmoid squashes a linear score to a probability; train by minimizing cross-entropy = negative log-likelihood. Why not MSE? Cross-entropy gives strong gradients when confidently wrong; MSE saturates through sigmoid (non-convex, slow learning)." },
        { q: "Gradient descent family", a: "Batch (all data, stable, slow), SGD (one sample, noisy, escapes shallow minima), mini-batch (the standard). Momentum accumulates velocity; Adam = momentum + per-parameter adaptive learning rates. Learning-rate too high → divergence; too low → stuck. Warmup + decay schedules." },
        { q: "Evaluation metrics", a: "Precision = of what I flagged, how much was right. Recall = of what was there, how much did I catch. F1 = harmonic mean. ROC-AUC = ranking quality across thresholds; PR-AUC better under heavy class imbalance. Pick using the COST of FP vs FN (spam: precision; cancer screening: recall). Never accuracy on imbalanced data." },
        { q: "Class imbalance", a: "Resample (over/under, SMOTE), class-weighted loss, threshold tuning, focal loss. Metric must change too (PR-AUC / F1, not accuracy)." },
        { q: "Data leakage & splits", a: "Leakage = training on information unavailable at prediction time (target leakage, test contamination, scaling fit on full data). Time-series → split by time, never randomly. Fit preprocessing on train only. This is a favorite 'spot the bug' question." },
        { q: "Feature engineering & embeddings", a: "One-hot for small cardinality; embeddings for large (learned dense vectors where similarity = closeness). Normalize numeric features for gradient methods. Hashing trick for huge vocab." },
      ],
    },
    {
      title: "Deep Learning",
      icon: "🧬",
      items: [
        { q: "Backpropagation", a: "Chain rule applied backward through the compute graph; each layer gets ∂Loss/∂params. Vanishing gradients: deep sigmoid/tanh nets multiply small derivatives → early layers stop learning. Fixes: ReLU, residual/skip connections, batch norm, careful init (He/Xavier)." },
        { q: "CNNs", a: "Convolutions = local receptive fields + weight sharing → translation equivariance, few params. Pooling downsamples. Know: padding/stride arithmetic, why 3×3 stacks beat one 7×7 (depth + nonlinearity, fewer params)." },
        { q: "RNN → LSTM → why Transformers won", a: "RNNs process sequentially (slow, vanishing gradients over long spans). LSTMs add gates to preserve memory. Transformers replace recurrence with self-attention: every token attends to every token in parallel → better long-range modeling + massively parallel training. Cost: O(n²) attention in sequence length." },
        { q: "Attention (be able to write it)", a: "Attention(Q,K,V) = softmax(QKᵀ/√d)·V. Queries ask, keys index, values carry content; √d keeps logits in softmax's sweet spot. Multi-head = several attention subspaces in parallel. Positional encodings restore order information." },
        { q: "Batch norm / layer norm", a: "Normalize activations to stabilize/speed training. BatchNorm normalizes across the batch (awkward for variable-length sequences / small batches); LayerNorm across features per token — that's why Transformers use LayerNorm." },
        { q: "Training practicalities", a: "Overfit a tiny batch first (sanity check), monitor train/val curves, gradient clipping for RNNs/Transformers, mixed precision for speed/memory." },
      ],
    },
    {
      title: "LLM Era (2025–26 loops increasingly probe these)",
      icon: "✨",
      items: [
        { q: "RAG vs fine-tuning — when which?", a: "RAG: knowledge changes often, need citations/freshness, per-tenant data isolation — retrieve (embeddings + vector search) and stuff context. Fine-tuning: change BEHAVIOR/style/format or teach a narrow task; LoRA/PEFT trains small adapter matrices instead of all weights (cheap, swappable). Often both: RAG for facts, small FT for tone/format." },
        { q: "Why do LLMs hallucinate; mitigations", a: "They model plausible text, not truth; decoding samples confident continuations even without grounding. Mitigate: RAG with citation-forcing, constrained decoding/tool calls for facts, lower temperature, self-consistency checks, evals that measure groundedness." },
        { q: "Inference optimization", a: "KV cache (reuse attention keys/values across steps — why long context costs memory), quantization (int8/int4 weights, minor quality loss, big memory/speed win), distillation (small student mimics large teacher), speculative decoding (draft model proposes, big model verifies), batching/paged attention for serving throughput." },
        { q: "Context windows & tokens", a: "Attention is O(n²) in tokens → long context is compute/memory expensive; 'lost in the middle' retrieval degradation. Chunking + retrieval usually beats maxing context." },
        { q: "Agents & tool use", a: "LLM in a loop: plan → call tools → observe → continue. Key risks: error compounding, infinite loops, injection via tool outputs. Guardrails: schema-validated tool calls, step budgets, human gates for irreversible actions." },
        { q: "Evals", a: "Static benchmarks drift from your task — build task-specific evals: golden sets, LLM-as-judge (with calibration!), online A/B with guardrail metrics. 'How would you evaluate it?' is a guaranteed follow-up to any ML answer you give." },
      ],
    },
    {
      title: "Your Project Deep-Dive (they WILL do this)",
      icon: "🔍",
      items: [
        { q: "Prepare 2 projects in this shape", a: "Problem & business metric → data (size, source, cleaning pain) → baseline FIRST → model choice + WHY over alternatives → metric choice + WHY → failure modes found → deployment/serving story → what you'd do differently. 90 seconds per project, then depth on demand." },
        { q: "Expected follow-ups", a: "'Why X and not simpler Y?' (always justify vs a baseline) · 'How did you know it worked?' (offline metric + online proxy) · 'Where did it fail?' (have a real failure story — perfection reads as shallow) · 'How would it scale 100×?' (data pipeline, serving latency, retraining cadence)." },
        { q: "Trade-off vocabulary to use naturally", a: "Precision↔recall at threshold; latency↔quality (model size); freshness↔stability (retrain cadence); explainability↔accuracy; offline metric ↔ online metric gap; train/serve skew." },
      ],
    },
  ],
};
