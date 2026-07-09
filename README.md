# DSA Hackbook — Google SWE III Interview Prep

A comprehensive, interactive algorithm & data structure reference built for **1-week crash preparation** for Google Software Engineer III (L4) interviews. 23 patterns, 45 Google problems, AI/ML domain coverage, and a 7-day study plan.

**🚀 Live:** [https://rolonatt.github.io/DSA_Hackbook/](https://rolonatt.github.io/DSA_Hackbook/)

## 8 Core Tabs

### 🔍 **Identify the Algorithm**
Pattern-recognition rules: scan problem statements for signal keywords, map to the right algorithm. Every rule tagged with Google frequency (⭐⭐⭐ = core, ⭐⭐ = common, ⭐ = occasional).

### 🌳 **Decision Tree**
Interactive 5-step flow: answer questions about your problem type, and the tree guides you to the algorithm name + a one-line action tip.

### 📖 **Learn Each Algorithm**
Deep-dive on 23 patterns (all by Google frequency):
- **Array & Hashing** (7): HashMap, Two Pointers, Sliding Window, Prefix Sum, Intervals, Binary Search, Heap
- **Graphs** (7): BFS, DFS, Topological Sort, Union-Find, Dijkstra's, MST, Trie
- **Trees** (2): Trees & BST, Tree Traversals
- **Linked Lists** (1): Reversal, Fast/Slow, Merge
- **DP & Backtracking** (2): Dynamic Programming, Backtracking
- **Design & Strategies** (3): Design-a-DS, Greedy

Each includes: **analogy** (intuitive story), **step-by-step** (how it works), **complexity** (time/space), **when to use**, **pitfalls**, **Google-specific note** (why this matters at Google).

### 📊 **Compare**
Side-by-side table of all 23 algorithms: family, complexity, keywords. Click any row to jump to its Learn card. Sortable by Google frequency.

### 🐍 **Python Code Templates**
26 self-contained, copy-paste-ready implementations organized by category:
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

### ⚖️ **Big-O & Constraints**
- **Constraint → Complexity** table: read n from the problem, know the intended complexity
- **Python built-in costs**: what `list.insert(0)`, `x in list`, `sorted()`, etc. actually cost
- **Interview phrases**: log₂(1M) ≈ 20, amortized O(1), average-case hashing

### 🎯 **Google Prep** (4 sub-sections)
**Format & Rubric:**
- Interview loop: 2 DSA rounds (45 min each, medium→hard) + 1 AI/ML domain round
- 4-axis evaluation rubric (problem-solving 40%, coding 25%, communication 20%, testing 15%)
- 45-minute protocol: clarify (5 min) → plan (7 min) → code (18 min) → verify (10 min) → questions (5 min)
- Topic frequency: Arrays/Strings 35%, Trees/Graphs 25%, DP 15%, Linked Lists 12%, Search/Sort 8%, Hash/Heap 5%

**How Google Asks:**
- Deliberately ambiguous prompts (YOU derive the real problem)
- Follow-up scaling (solve it, then "what if it's a stream?")
- Classics in disguise (product stories hiding tree/graph patterns)
- You run the tests (no compiler; trace by hand)

**Most-Asked Problems:**
45 problems tagged by pattern: Number of Islands, Merge Intervals, Course Schedule, Word Break, LRU Cache, etc. Click a pattern chip to learn it.

**AI/ML Domain Round:**
- ML fundamentals: bias-variance, regularization, cross-entropy, gradient descent, metrics
- Deep learning: backprop, CNNs, RNNs → LSTMs → Transformers, attention, batch norm
- LLM-era topics: RAG vs fine-tuning (LoRA/PEFT), hallucination & mitigation, inference optimization, context windows, agents & tool use, evals
- Your project deep-dive: structured interview + follow-up patterns

### 🗓️ **7-Day Plan**
Day-by-day study schedule (1 week until interview):
- Each day: ~1h concepts (read Learn cards here), ~3h problems (LeetCode), ~30 min evening recall
- Day 1: Arrays/Hashing (7 problems)
- Day 2: Trees & BST (8 problems)
- Day 3: Graphs & Grids (8 problems)
- Day 4: DP & Backtracking (10 problems)
- Day 5: Binary Search, Heap, Intervals, Linked Lists, Design (10 problems)
- Day 6: Mock interview day (3 full 45-min rounds, unseen problems)
- Day 7: ML domain review + light practice + rest
- **Checkboxes save automatically** to localStorage

## Key Features

✅ **Google-centric:** Every algorithm tagged with frequency (⭐⭐⭐ most common at Google)  
✅ **Pattern-first:** Learn to NAME the pattern before coding  
✅ **Analogy-driven:** Intuitive stories before formulas  
✅ **Copy-paste Python:** All 26 templates work standalone, no boilerplate  
✅ **Interactive:** Decision tree, tab navigation, localStorage persistence  
✅ **One-week ready:** Structured 7-day plan with specific problems  
✅ **No external deps:** React 18 + Vite, pure inline CSS — instant load  

## Tech Stack

- **React 18** — component state, hooks
- **Vite 5** — blazing fast dev/build
- **No external UI libraries** — all inline styles for zero bloat
- **localStorage** — persists 7-day plan progress
- **Modular data** — `src/data/*.js` (algos, snippets, google intel, plan, etc.)

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

1. **You have a coding problem?** → **Identify tab** (scan for signal words)
2. **Or use the Decision Tree** (5-step flow)
3. **Pick the algorithm** → **Learn tab** (read the analogy + steps + pitfalls)
4. **See the Python code** → **Python Code tab** (copy-paste, adapt)
5. **Study this week?** → **7-Day Plan tab** (check off problems as you go)
6. **Interview is AI/ML focused?** → **Google Prep tab → AI/ML domain round** (study fundamentals, your project)
7. **Need Big-O intuition?** → **Big-O & Constraints tab** (know what Python ops cost)

## For Google L4 Interviews Specifically

- Read **Google Prep** section completely (format, rubric, protocol, top 45 problems)
- Focus on high-Google-frequency algorithms (filter by ⭐⭐⭐ in Learn tab)
- Study the **7-Day Plan** — it's built around Google's actual problem distribution
- Practice the **45-minute protocol** on day 6 (mock interviews with unseen problems)
- For the AI/ML domain round: dive into **Google Prep → AI/ML domain round**, prep 2 project stories

## Feedback & Improvements

This guide is based on 250+ Google interview reports (candidate write-ups, LeetCode Discuss, interview platforms). If you spot missing patterns, incorrect complexity notes, or problem updates — feedback welcome.

**Good luck on the interview! 🚀**
