// ─── INTERACTIVE DECISION TREE ──────────────────────────────────────────────
// options: { label, next } → another step, or { label, result } → RESULTS key.

export const DECISION_STEPS = [
  {
    id: "start",
    q: "Step 1: What does the problem fundamentally deal with?",
    options: [
      { label: "Graph / grid / cities / network / dependencies", next: "graph_kind" },
      { label: "Array or string", next: "arraystring" },
      { label: "Tree (nodes with children)", next: "tree" },
      { label: "Linked list", next: "linkedlist" },
      { label: "\"Design a data structure with operations X in O(1)…\"", result: "design" },
      { label: "Pure numbers / math", next: "math" },
    ],
  },

  // ── GRAPH BRANCH ──
  {
    id: "graph_kind",
    q: "Step 2: What kind of graph question is it?",
    options: [
      { label: "Find a path / distance between nodes", next: "graph_weighted" },
      { label: "Ordering with prerequisites (A before B)", result: "toposort" },
      { label: "Groups / components / 'are these connected?' as edges get added", result: "unionfind" },
      { label: "Connect ALL nodes with minimum total cost", result: "mst" },
      { label: "2D grid: regions, islands, spreading", next: "grid" },
    ],
  },
  {
    id: "graph_weighted",
    q: "Step 3: Do the connections have weights (cost, distance, time)?",
    options: [
      { label: "Yes — each edge has a cost", result: "dijkstra" },
      { label: "No — every hop counts the same", next: "graph_unweighted" },
    ],
  },
  {
    id: "graph_unweighted",
    q: "Step 4: What's the goal?",
    options: [
      { label: "SHORTEST path / fewest steps", result: "bfs" },
      { label: "ANY path / ALL paths / does one exist?", result: "dfs" },
      { label: "Detect cycles / count connected pieces", result: "dfs" },
    ],
  },
  {
    id: "grid",
    q: "Step 3: What happens on the grid?",
    options: [
      { label: "Count/measure regions (islands, areas)", result: "griddfs" },
      { label: "Something spreads / shortest route through maze", result: "gridbfs" },
      { label: "Find a WORD/path by trying and undoing", result: "backtracking" },
      { label: "Cells have costs, minimize path cost", result: "dijkstra" },
    ],
  },

  // ── ARRAY / STRING BRANCH ──
  {
    id: "arraystring",
    q: "Step 2: What's the task?",
    options: [
      { label: "Find pairs / duplicates / frequencies", next: "lookup" },
      { label: "Best CONTIGUOUS chunk (subarray/substring)", next: "contiguous" },
      { label: "It's sorted (or 'minimize the max…')", next: "sorted" },
      { label: "Generate ALL / count ways / optimal choices", next: "choices" },
      { label: "K-th largest / top-K / merge K sorted", result: "heap" },
      { label: "Intervals, meetings, bookings", result: "intervals" },
      { label: "Nested brackets / expression parsing / next-greater", result: "stack" },
      { label: "Prefixes, autocomplete, many-word search", result: "trie" },
    ],
  },
  {
    id: "lookup",
    q: "Step 3: What exactly are you finding?",
    options: [
      { label: "Two numbers summing to target (unsorted, need indices)", result: "hashmap" },
      { label: "Duplicates / 'seen before' / counts / grouping", result: "hashmap" },
      { label: "Pair in a SORTED array / rearrange in-place", result: "twopointer" },
      { label: "Missing / single odd-one-out number", result: "math" },
    ],
  },
  {
    id: "contiguous",
    q: "Step 3: What about the contiguous chunk?",
    options: [
      { label: "Longest/shortest satisfying a constraint (positives)", result: "sliding" },
      { label: "How many subarrays sum to exactly K (negatives possible)", result: "prefixsum" },
      { label: "Range-sum queries asked repeatedly", result: "prefixsum" },
      { label: "Longest SUBSEQUENCE (can skip elements)", result: "dp" },
    ],
  },
  {
    id: "sorted",
    q: "Step 3: Which flavor of 'sorted'?",
    options: [
      { label: "Data itself is sorted — find element/boundary", result: "binarysearch" },
      { label: "Rotated sorted array", result: "binarysearch" },
      { label: "'Min speed/capacity/days so that X works'", result: "binaryanswer" },
      { label: "Sorted + find a pair", result: "twopointer" },
    ],
  },
  {
    id: "choices",
    q: "Step 3: Enumerate, count, or optimize?",
    options: [
      { label: "LIST every permutation/subset/combination", result: "backtracking" },
      { label: "COUNT the ways (number only)", result: "dp" },
      { label: "MIN/MAX value with a choice at each step", result: "dp" },
      { label: "Local best obviously safe (schedule by earliest finish…)", result: "greedy" },
    ],
  },

  // ── TREE BRANCH ──
  {
    id: "tree",
    q: "Step 2: What about the tree?",
    options: [
      { label: "Depth / paths / compare subtrees / LCA", result: "treedfs" },
      { label: "Level-by-level (level order, right view)", result: "treebfs" },
      { label: "It's a BST (k-th smallest, validate, closest)", result: "bst" },
      { label: "Serialize / rebuild from traversal", result: "treedfs" },
    ],
  },

  // ── LINKED LIST BRANCH ──
  {
    id: "linkedlist",
    q: "Step 2: What about the linked list?",
    options: [
      { label: "Reverse it (fully or in groups)", result: "linkedlist_rev" },
      { label: "Cycle? Middle? K-th from end?", result: "fastslow" },
      { label: "Merge two sorted lists", result: "linkedlist_rev" },
      { label: "Merge K sorted lists", result: "heap" },
    ],
  },

  // ── MATH BRANCH ──
  {
    id: "math",
    q: "Step 2: What kind of number problem?",
    options: [
      { label: "Missing / duplicate number in a range", result: "math" },
      { label: "Divisibility / digits / FizzBuzz-style", result: "loop" },
      { label: "Count ways / reach a number with operations", result: "dp" },
    ],
  },
];

export const RESULTS = {
  bfs:            { algoId: "bfs", label: "BFS 🌊", color: "#1A6BCC", bg: "#E8F1FB", tip: "deque, mark visited on enqueue, level-by-level loop for distances." },
  gridbfs:        { algoId: "bfs", label: "Grid BFS 🌊", color: "#1A6BCC", bg: "#E8F1FB", tip: "Cells = nodes. Multi-source? Seed the queue with all starting cells at distance 0." },
  dfs:            { algoId: "dfs", label: "DFS 🌀", color: "#6B3FCC", bg: "#F0EDFB", tip: "Recursion or explicit stack. Visited set. Mind Python's ~1000 recursion limit." },
  griddfs:        { algoId: "dfs", label: "Grid DFS (Flood Fill) 🏝️", color: "#0277BD", bg: "#E1F5FE", tip: "Sink visited cells in place. Count each flood-fill launch = one island." },
  dijkstra:       { algoId: "dijkstra", label: "Dijkstra's 🗺️", color: "#0F7A5A", bg: "#E2F5EF", tip: "Min-heap of (cost, node); skip stale entries; positive weights only." },
  toposort:       { algoId: "toposort", label: "Topological Sort 🧩", color: "#37474F", bg: "#ECEFF1", tip: "Kahn's: in-degrees, queue of zeros, decrement dependents. Short order ⇒ cycle." },
  unionfind:      { algoId: "unionfind", label: "Union-Find 🤝", color: "#00838F", bg: "#E0F7FA", tip: "parent[] + path compression + union by rank. union() returning False ⇒ cycle." },
  mst:            { algoId: "mst", label: "MST — Kruskal's or Prim's 🌲", color: "#9B6400", bg: "#FBF0DC", tip: "Kruskal's: sort edges + DSU. Prim's: heap-grow from any node." },
  hashmap:        { algoId: "hashmap", label: "HashMap / Set 🗂️", color: "#1A6BCC", bg: "#E8F1FB", tip: "dict/set/Counter. Store complements, counts, or seen-flags for O(1) lookups." },
  twopointer:     { algoId: "twopointer", label: "Two Pointers 👆", color: "#0F7A5A", bg: "#E2F5EF", tip: "Converging on sorted data; read/write for in-place. O(1) space." },
  sliding:        { algoId: "sliding", label: "Sliding Window 🪟", color: "#6B3FCC", bg: "#F0EDFB", tip: "Expand right; while invalid shrink left; record answer when valid." },
  prefixsum:      { algoId: "prefixsum", label: "Prefix Sum ➕", color: "#00695C", bg: "#E0F2F1", tip: "prefix[r+1]−prefix[l]. Counting exact sums: hashmap of prefixes, seed {0:1}." },
  binarysearch:   { algoId: "binarysearch", label: "Binary Search 🎯", color: "#C62828", bg: "#FDECEA", tip: "lo/hi invariants; bisect_left for boundaries. O(log n)." },
  binaryanswer:   { algoId: "binarysearch", label: "Binary Search on the Answer 🎯", color: "#C62828", bg: "#FDECEA", tip: "Write can(x) (monotonic yes/no), then binary search x over its range." },
  heap:           { algoId: "heap", label: "Heap ⛰️", color: "#B84A00", bg: "#FCEEE7", tip: "heapq is a min-heap; negate for max. Top-K: keep heap size at k." },
  intervals:      { algoId: "intervals", label: "Intervals 📅", color: "#AD1457", bg: "#FCE4EC", tip: "Sort by start, merge neighbors. Rooms: min-heap of end times." },
  stack:          { algoId: "stack", label: "Stack / Monotonic 📚", color: "#2E7D32", bg: "#E8F5E9", tip: "Push pending, resolve newest first. Next-greater: keep stack decreasing." },
  trie:           { algoId: "trie", label: "Trie 🔤", color: "#283593", bg: "#E8EAF6", tip: "Nested dicts + end-of-word marker. O(word length) per operation." },
  backtracking:   { algoId: "backtracking", label: "Backtracking 🧭", color: "#D84315", bg: "#FBE9E7", tip: "choose → explore → un-choose. Append copies (path[:]). Prune hard." },
  dp:             { algoId: "dp", label: "Dynamic Programming 🧠", color: "#6A1B9A", bg: "#F3E5F5", tip: "Say the state in words, write the transition, nail dp[0]. @lru_cache is legal." },
  greedy:         { algoId: "greedy", label: "Greedy 🎯", color: "#5B3DC8", bg: "#EEEAFC", tip: "Sort by the right key, take locally best, justify with an exchange argument." },
  design:         { algoId: "design", label: "Design a Data Structure 🏗️", color: "#827717", bg: "#F9FBE7", tip: "Write the ops + complexities first, then compose hashmap/list/heap to cover them." },
  treedfs:        { algoId: "trees", label: "Tree DFS (recursion) 🌳", color: "#33691E", bg: "#F1F8E9", tip: "solve(node) = combine(solve(left), solve(right), node). None → identity." },
  treebfs:        { algoId: "trees", label: "Tree BFS (level order) 🌳", color: "#33691E", bg: "#F1F8E9", tip: "Queue; for _ in range(len(queue)) processes exactly one level." },
  bst:            { algoId: "trees", label: "BST Property 🌳", color: "#33691E", bg: "#F1F8E9", tip: "Inorder = sorted. Validate with (lo, hi) bounds passed down." },
  linkedlist_rev: { algoId: "linkedlist", label: "Linked List Surgery 🔗", color: "#5D4037", bg: "#EFEBE9", tip: "Dummy head kills edge cases. prev/curr/next reversal — save next first." },
  fastslow:       { algoId: "linkedlist", label: "Fast & Slow Pointers 🐢🐇", color: "#5D4037", bg: "#EFEBE9", tip: "fast 2 steps, slow 1. Meet ⇒ cycle. Fast at end ⇒ slow at middle." },
  math:           { algoId: "hashmap", label: "Math / XOR ➕", color: "#9B6400", bg: "#FBF0DC", tip: "Sum formula n(n+1)/2, or XOR everything — duplicates cancel out." },
  loop:           { algoId: "hashmap", label: "Simple Loop 🔄", color: "#5B3DC8", bg: "#EEEAFC", tip: "Don't overthink — a clean loop with modulo/condition checks wins." },
};
