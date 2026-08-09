# DSA Hackbook — Interview Prep Reference

A comprehensive, interactive study reference for technical interviews — covering **DSA rounds**, an **AI/ML domain round**, and **system design**.

23 DSA patterns · a curated set of most-asked problems tagged by pattern · a full AI/ML domain curriculum with interactive labs · 7 specialization tracks · a system design curriculum with worked case studies · 130+ interview questions · structured study plans.

**🚀 Live:** [https://rolonatt.github.io/DSA_Hackbook/](https://rolonatt.github.io/DSA_Hackbook/)

## How it's organized

Content is grouped into **five tracks**, one per kind of round. Each track lays out its sections as a **numbered reading path** grouped into stages, so at any point you can see what you're reading, why it's there, and what comes next. A next-up button at the bottom of every section walks the path for you.

| Track | Stages | Sections |
|---|---|---|
| 🏁 **Start Here** | — | Orientation: which track to open, and the order inside it |
| 🧩 **DSA** | Recognize → Understand → Cost it → Write it | 6 |
| 🤖 **AI/ML** | Orient → Fundamentals → Algorithms → Specialize → Practice | 11 |
| 🏗️ **System Design** | Method → Toolkit → AI systems → Rehearse → The conversation | 10 |
| 🎯 **Interview Loop** | The target → The schedule | 2 |

The numbers are a recommendation, not a lock — every section is one click away at all times.

---

## 🧩 DSA track

### ① Recognize

**1. 🔍 Identify** — pattern-recognition rules: scan problem statements for signal keywords, map to the right algorithm. Every rule tagged with interview frequency (⭐⭐⭐ = core, ⭐⭐ = common, ⭐ = occasional).

**2. 🌳 Decision Tree** — interactive 5-step flow: answer questions about your problem type, and the tree guides you to the algorithm name + a one-line action tip.

### ② Understand

**3. 📖 Learn** — deep-dive on 23 patterns:
- **Array & Hashing** (7): HashMap, Two Pointers, Sliding Window, Prefix Sum, Intervals, Binary Search, Heap
- **Graphs** (7): BFS, DFS, Topological Sort, Union-Find, Dijkstra's, MST, Trie
- **Trees** (2): Trees & BST, Tree Traversals
- **Linked Lists** (1): Reversal, Fast/Slow, Merge
- **DP & Backtracking** (2): Dynamic Programming, Backtracking
- **Design & Strategies** (3): Design-a-DS, Greedy

Each includes: **analogy** (intuitive story), **step-by-step** (how it works), **complexity** (time/space), **when to use**, **pitfalls**, and a frequency note on why it matters.

**4. 📊 Compare** — side-by-side table of all 23 algorithms: family, complexity, keywords. Click any row to jump to its Learn card. Sortable by frequency.

### ③ Cost it

**5. ⚖️ Big-O & Constraints**
- **Constraint → Complexity** table: read n from the problem, know the intended complexity
- **Python built-in costs**: what `list.insert(0)`, `x in list`, `sorted()`, etc. actually cost
- **Interview phrases**: log₂(1M) ≈ 20, amortized O(1), average-case hashing

### ④ Write it

**6. 🐍 Python Code** — 26 self-contained, copy-paste-ready implementations organized by category:
- Arrays: HashMap, Two Pointers, Sliding Window, Prefix Sum, Intervals
- Stack & Heap: Stack, Monotonic Stack, Heap/Top-K
- Linked Lists: Reversal, Fast/Slow runners, Merge
- Trees: Inorder/BFS, Validate BST, LCA, Serialize
- Trie: Prefix tree insert/search
- Graphs: BFS, DFS, Grid problems, Topological Sort, Union-Find, Dijkstra's, MST
- DP: 1D (Climbing Stairs, Coin Change), 2D (Edit Distance, LIS O(n log n))
- Backtracking: Subsets, Permutations, Combination Sum
- Design: LRU Cache
- Python Toolkit: Counter, bisect, heapq, deque, slicing tricks

---

## 🤖 AI/ML track

A complete curriculum for the ML domain interview, with interactive labs.

### ① Orient

**1. 📋 Round Playbook** — what the 45 minutes actually contains, the 4-axis scoring rubric, the answer *shapes* that score (including the honest-edge script), a red-flag vs green-flag table, the 9-step ML system design framework, project-defense archetypes with their probe questions, and what to ask them.

**2. 🎯 The Core 10** — the exact topics named for the round, each with intuition → mechanics & math → runnable code → when/why/vs → questions laddered easy to hard:
supervised/unsupervised · bias-variance · overfitting · "practical and theory" · linear regression · logistic regression · decision trees · SVMs · CNNs · RNNs/LSTM

**3. 🗓️ Study Plan** — a 7-day ML schedule with morning/evening/drill splits, plus a **57-item self-test** with progress tracking that saves automatically.

### ② Fundamentals

**4. 🧱 Foundations** — the terminology trap (why "bias" means three different things), the math you actually need, gradient descent with a **learning-rate visualizer**, loss functions, splits/CV variants, the four kinds of data leakage, the regularization toolbox, optimizers, normalization, and the master debugging table.

**5. 🎯 Bias–Variance Lab** — the four-quadrant **dartboard diagram**, an **interactive polynomial-degree slider** driven by real measured bias²/variance numbers (watch degree 9 explode to variance 160), the complexity curve, learning curves, and double descent.

**6. 📊 Metrics Lab** — built from zero in the right order, with a fully **interactive threshold explorer**: drag the threshold and watch the confusion matrix, TPR/FPR/precision/F1, and the point on the ROC curve all move together. Then ROC vs PR-AUC on imbalanced data, with the mechanism.

### ③ Algorithms

**7. 🗂️ Algorithm Zoo** — Random Forest, boosting, kNN, k-means, DBSCAN, PCA, Naive Bayes, plus bagging-vs-boosting, algorithm selection, and classical-vs-deep comparison tables.

**8. 🧠 Deep Learning** — neuron → network (with the algebraic proof that activations are mandatory), **interactive activation-function plots**, backprop worked by hand with real numbers, vanishing gradients, initialization, an **attention formula walkthrough** you click through step by step, multi-head, positional encodings, and an **LSTM gate diagram**.

### ④ Specialize

**9. 🚀 Specializations** — all 7 tracks, pick one: Applied ML · Computer Vision · NLP · **Generative AI** (the deepest: LLM internals, KV cache, decoding, structured output, prompt injection, RAG in full with a **pipeline diagram**, the RAG failure-mode diagnostic table, evaluation, agents, MCP, production) · Recommendations/Ranking · Reinforcement Learning · Speech & Audio.

### ⑤ Practice

**10. 💻 ML Coding** — 14 NumPy/PyTorch implementations: softmax + cross-entropy, logistic regression, 2-layer NN forward+backward, k-means, scaled dot-product attention, metrics from scratch, ROC/AUC, IoU + NMS, cosine top-k, NDCG, the bias-variance demo, leakage-safe pipelines, and a **conv shape calculator**.

**11. ❓ Question Bank** — 130+ questions filterable by section and difficulty, in flashcard mode. Plus **depth probes** that show what the interviewer is *really* testing and the follow-up that comes next.

---

## 🏗️ System Design track

The open-ended round: you're handed a vague problem and scored on how you turn it into a design.

### ① Method

**1. 📐 The Framework** — the seven phases with timings (clarify → estimate → API/data → high-level → deep dive → failure → wrap), a functional/non-functional requirements checklist, the anti-patterns that cost you the round, and the scoring axes with the senior signals to say unprompted.

### ② Toolkit

**2. 🔢 Estimation** — an **interactive sizing calculator**: set users, actions, record size, retention and read:write ratio, and it computes QPS, storage and — crucially — the *decisions those numbers force* ("1.7K peak writes/sec fits one primary, don't shard yet"). Plus data sizes, powers of two, single-machine capacity, a **log-scale latency visualization** from L1 cache to cross-continent, and the availability/nines table.

**3. 🧱 Building Blocks** — load balancers, caches, queues vs logs, databases, CDNs, API gateways, search indexes, object storage. Each with the requirement that justifies it, how it works, what it costs you, and its failure modes (thundering herd, cache penetration, cold-cache stampede).

**4. 🗄️ Data & Distributed** — SQL vs NoSQL as a decision rather than a religion, indexing, sharding strategies and choosing a partition key, replication, CAP/PACELC and consistency models, plus idempotency, exactly-once, consensus, sagas, rate-limiting algorithms, and backpressure/circuit breakers.

### ③ AI systems

**5. 🤖 Production AI** — the seven-layer agent architecture (ingress/routing → context assembly → bounded control loop → tool execution → output validation → escalation → observability) and the design decisions you'll be pushed on: sync vs async, cost control, multi-tenancy, containing prompt injection, evaluating non-deterministic systems, and what "reliable" means when 0.95¹⁰ ≈ 0.60.

**6. 🔌 Integrations** — API/transport styles, push vs pull, batch vs streaming (CDC, outbox pattern), enterprise auth (OAuth, mTLS, SAML, SCIM), defensive integration with systems you don't control, and the legacy-system reality from documented APIs down to screen scraping.

**7. 🛡️ Reliability & Ops** — SLI/SLO/SLA and error budgets, the observability pillars plus high-cardinality events, the four golden signals, nine named failure modes with mitigations, graceful degradation, deployment strategies and expand-contract migrations, and incident response.

### ④ Rehearse

**8. 📋 Case Studies** — six fully worked designs following the same seven sections, mixing classic and AI-native: an agent that resolves support tickets, a document processing pipeline, a distributed rate limiter, a workflow orchestration engine, a notification system, and a multi-tenant AI platform. Each includes a genuine deep dive (the authorization boundary; why validation not the model is where reliability comes from; durable execution semantics).

### ⑤ The conversation

**9. 🎯 Scoping & Discovery** — turning an ambiguous real-world problem into something shippable: a six-phase discovery framework with the actual questions to ask and what to watch for, plus worked answers to "a team spends 20 hours a week on X — what do you do?" and "the customer asks for X but needs Y."

**10. 💬 Behavioural** — STAR structure and its two most common failure modes, the seven stories worth preparing (ownership, ambiguity, stakeholder conflict, a real failure, choosing the simpler thing, influence without authority, operating in production), what each question is actually testing, and questions worth asking back.

---

## 🎯 Interview Loop track

### ① The target

**1. 🎯 Interview Prep** — four sub-sections:

*Format & Rubric:*
- Interview loop: 2 DSA rounds (45 min each, medium→hard) + 1 AI/ML domain round
- 4-axis evaluation rubric (problem-solving 40%, coding 25%, communication 20%, testing 15%)
- 45-minute protocol: clarify (5 min) → plan (7 min) → code (18 min) → verify (10 min) → questions (5 min)
- Topic frequency: Arrays/Strings 35%, Trees/Graphs 25%, DP 15%, Linked Lists 12%, Search/Sort 8%, Hash/Heap 5%

*How Interviewers Ask:*
- Deliberately ambiguous prompts (YOU derive the real problem)
- Follow-up scaling (solve it, then "what if it's a stream?")
- Classics in disguise (product stories hiding tree/graph patterns)
- You run the tests (no compiler; trace by hand)

*Most-Asked Problems:* 45 problems tagged by pattern — Number of Islands, Merge Intervals, Course Schedule, Word Break, LRU Cache, etc. Click a pattern chip to jump straight to its Learn card in the DSA track.

*AI/ML Domain Round:* a condensed version of the domain round — ML fundamentals (bias-variance, regularization, cross-entropy, gradient descent, metrics), deep learning (backprop, CNNs, RNNs → LSTMs → Transformers, attention, batch norm), LLM-era topics (RAG vs fine-tuning with LoRA/PEFT, hallucination & mitigation, inference optimization, context windows, agents & tool use, evals), and project deep-dive structure.

### ② The schedule

**2. 🗓️ 7-Day Plan** — day-by-day study schedule:
- Each day: ~1h concepts (read Learn cards here), ~3h problems (LeetCode), ~30 min evening recall
- Day 1: Arrays/Hashing (7 problems)
- Day 2: Trees & BST (8 problems)
- Day 3: Graphs & Grids (8 problems)
- Day 4: DP & Backtracking (10 problems)
- Day 5: Binary Search, Heap, Intervals, Linked Lists, Design (10 problems)
- Day 6: Mock interview day (3 full 45-min rounds, unseen problems)
- Day 7: ML domain review + light practice + rest
- **Checkboxes save automatically** to localStorage

---

## Key Features

✅ **Ordered paths, not a tab soup:** every track is a numbered sequence with stage labels and next-up buttons — no guessing what to read first  
✅ **Frequency-ranked:** Every algorithm tagged with how often it actually shows up in interviews (⭐⭐⭐ = most common)  
✅ **Pattern-first:** Learn to NAME the pattern before coding  
✅ **Analogy-driven:** Intuitive stories before formulas  
✅ **Copy-paste Python:** All 26 templates work standalone, no boilerplate  
✅ **Interactive:** Decision tree, threshold explorer, bias-variance slider, conv calculator, attention walkthrough, system-sizing calculator, flashcards, progress tracking  
✅ **Say-it-out-loud prompts:** Every ML topic ends with what to rehearse aloud — recognition ≠ recall  
✅ **One-week ready:** Structured 7-day plans for both the DSA and ML halves  
✅ **No external deps:** React 18 + Vite, pure inline CSS — instant load  

## Tech Stack

- **React 18** — component state, hooks
- **Vite 5** — blazing fast dev/build
- **No external UI libraries** — all inline styles for zero bloat
- **localStorage** — persists 7-day plan progress and the ML self-test
- **Navigation as data** — `src/data/paths.js` is the single source of truth for tracks, stages, section order, and the "why read this" line for each step; `src/components/PathNav.jsx` renders it
- **Modular data** — `src/data/*.js` (DSA), `src/data/ml/*.js` (ML curriculum), `src/data/sd/*.js` (system design)
- **Custom SVG widgets** — `src/components/MLWidgets.jsx`, no charting library

## Quick Start

```bash
# Install
npm install

# Develop
npm run dev

# Build
npm run build

# GitHub Pages auto-deploys on git push to main (via GitHub Actions)
```

## How to Use (First Time)

Open **🏁 Start Here** — it names the right track for the round you have next and links straight to any numbered step. Then:

1. **Coding round next?** → **🧩 DSA**, steps 1 → 6 in order
2. **Domain round next?** → **🤖 AI/ML**, steps 1 → 3 (Orient) before any content
3. **Open-ended design round?** → **🏗️ System Design**, step 1 (The Framework) before anything else
4. **One week, multiple rounds?** → **🎯 Interview Loop** → 7-Day Plan, which sequences the other tracks day by day
5. **Mid-problem and stuck on which pattern?** → DSA step 1 (Identify) or step 2 (Decision Tree)

## For the DSA Rounds

- Read **Interview Loop → Interview Prep** completely (format, rubric, 45-minute protocol, top problems)
- Focus on high-frequency patterns (filter by ⭐⭐⭐ in the Learn section)
- Follow the **7-Day Plan** — it's built around real interview problem distribution
- Practice the 45-minute protocol on day 6 with unseen problems

## For the AI/ML Domain Round

1. **Round Playbook** first — know what's being scored before you study content
2. **The Core 10** — these are the exact topics named for the round. Bias-variance, overfitting and logistic regression are the most-probed
3. **Metrics Lab** — drag the threshold slider until precision/recall/TPR/FPR are automatic
4. **Pick ONE specialization** — where you can survive four layers of follow-ups, not what sounds impressive
5. **Question Bank** as a diagnostic — answer *before* revealing, and note which ones you couldn't produce
6. **Study Plan** — the 57-item self-test is the honest readiness measure

> The single rule that determines whether this works: after each topic, close the page and **say the answer out loud**. Reading and nodding is recognition. The interview tests recall, and the gap between the two is where prepared-feeling candidates fail.

## For the System Design Round

1. **The Framework** first — internalize the seven phases and their timings. Structure is most of the score
2. **Estimation** — play with the sizing calculator until the "so what" reasoning is automatic. An unused calculation is wasted minutes
3. **Building Blocks** — for each component, be able to name the requirement that justifies it and what it costs
4. **Read ONE case study end to end**, then take a different prompt and produce the same seven sections yourself, out loud, timed at 45 minutes
5. **Production AI** if the role involves shipping agents — it's where conventional system design and AI intersect, and where most candidates are thinnest
6. **Scoping & Discovery** if the role is customer-facing — turning a vague complaint into a bounded, measurable scope is a distinct skill that gets probed directly

## Sources

The DSA half draws on 250+ published interview reports (candidate write-ups, LeetCode Discuss, interview platforms). The ML half consolidates a full domain-round curriculum with verified code output — every numeric example (bias-variance decomposition, ROC sweep, conv arithmetic, ROC-AUC vs PR-AUC on imbalanced data) was run and checked.

If you spot missing patterns, incorrect complexity notes, or problem updates — feedback welcome.

**Good luck on the interview! 🚀**
