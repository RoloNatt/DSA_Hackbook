// Time and space complexity for every function in the Python templates.
//
// Kept separate from snippets.js so the template code itself stays untouched and
// copy-paste clean. Each entry is written against the ACTUAL implementation in
// snippets.js — e.g. union-find here has both path halving and union by rank,
// the DP templates roll their arrays where they can, and word_break slices.
//
// Space means EXTRA space, excluding the input, unless noted.

export const SNIPPET_COMPLEXITY = {
  hashmap: [
    { fn: "two_sum", time: "O(n)", space: "O(n)", why: "One pass; each dict lookup/insert is O(1) average. The dict can hold all n values." },
    { fn: "most_common", time: "O(n)", space: "O(u)", why: "Counter is one pass; most_common(1) scans the u distinct values (u ≤ n)." },
    { fn: "group_anagrams", time: "O(n·k log k)", space: "O(n·k)", why: "Sorting each of n words of length ≤ k costs k log k. Using a 26-letter count as the key instead makes it O(n·k)." },
  ],
  two_pointer: [
    { fn: "two_sum_sorted", time: "O(n)", space: "O(1)", why: "Every step moves one pointer inward; they meet after at most n steps." },
    { fn: "move_zeros", time: "O(n)", space: "O(1)", why: "Two linear passes, rewriting in place." },
  ],
  sliding_window: [
    { fn: "longest_unique_substring", time: "O(n)", space: "O(min(n, σ))", why: "Amortized: each character is added once and removed at most once, so the inner while runs ≤ n times in TOTAL. σ = alphabet size." },
    { fn: "max_sum_window", time: "O(n)", space: "O(k)", why: "O(k) for the first window, then O(1) per slide. The O(k) space is the nums[:k] slice — sum(nums[i] for i in range(k)) makes it O(1)." },
  ],
  prefix_sum: [
    { fn: "build_prefix", time: "O(n)", space: "O(n)", why: "One pass to build; afterwards any range sum is an O(1) subtraction." },
    { fn: "subarray_sum_equals_k", time: "O(n)", space: "O(n)", why: "One pass; the dict stores up to n+1 distinct prefix sums." },
  ],
  intervals: [
    { fn: "merge_intervals", time: "O(n log n)", space: "O(n)", why: "The sort dominates; the merge pass is O(n). The output (and the intervals[1:] slice) can hold n items." },
    { fn: "min_meeting_rooms", time: "O(n log n)", space: "O(n)", why: "Sort + n heap operations at O(log n) each. The heap can hold one end time per meeting." },
  ],
  binary_search: [
    { fn: "binary_search", time: "O(log n)", space: "O(1)", why: "Halves the range every step: at most ⌊log₂n⌋ + 1 probes." },
    { fn: "left_bound", time: "O(log n)", space: "O(1)", why: "Same halving over [lo, hi)." },
    { fn: "min_eating_speed", time: "O(n log M)", space: "O(1)", why: "log M probes over speeds 1..M (M = largest pile), each probe sums all n piles. The generator inside sum() keeps it O(1) space." },
  ],
  stack: [
    { fn: "is_valid", time: "O(n)", space: "O(n)", why: "Each bracket is pushed and popped at most once; an all-opening string fills the stack." },
    { fn: "decode_string", time: "O(L·d)", space: "O(L)", why: "Cost follows the OUTPUT length L, not the input: '10[10[10[a]]]' is 13 characters in and 1,000 out. Each character can be re-copied once per enclosing bracket level (depth d)." },
  ],
  monotonic_stack: [
    { fn: "daily_temperatures", time: "O(n)", space: "O(n)", why: "Amortized: each index is pushed once and popped at most once, so the inner while totals ≤ n." },
    { fn: "largest_rectangle", time: "O(n)", space: "O(n)", why: "Same push-once/pop-once argument. heights + [0] also makes an O(n) copy." },
  ],
  heap_topk: [
    { fn: "kth_largest", time: "O(n log k)", space: "O(k)", why: "n pushes onto a heap that never exceeds k+1 items. Beats sorting (n log n) when k is small." },
    { fn: "top_k_frequent", time: "O(n + u log k)", space: "O(u)", why: "Counter is O(n); most_common(k) takes the top k of the u distinct values with a size-k heap." },
    { fn: "max_heap_demo", time: "O(n)", space: "O(n)", why: "Negating copies n values; heapify is O(n) — NOT O(n log n); one pop is O(log n)." },
  ],
  linked_list: [
    { fn: "reverse_list", time: "O(n)", space: "O(1)", why: "Each node is relinked once, in place." },
    { fn: "has_cycle", time: "O(n)", space: "O(1)", why: "The fast pointer catches the slow one within one lap of the cycle. No visited set needed — that's the point of Floyd's." },
    { fn: "merge_two", time: "O(n + m)", space: "O(1)", why: "Relinks the existing nodes; only the dummy head is new." },
  ],
  trees: [
    { fn: "max_depth", time: "O(n)", space: "O(h)", why: "Visits every node once. The stack holds one root-to-leaf path: h = log n if balanced, n if skewed." },
    { fn: "level_order", time: "O(n)", space: "O(n)", why: "The queue holds at most one level (up to ~n/2 nodes in a full tree), plus the O(n) output." },
    { fn: "is_valid_bst", time: "O(n)", space: "O(h)", why: "Every node checked once against its (lo, hi) bounds." },
    { fn: "lca", time: "O(n)", space: "O(h)", why: "General binary tree: may search both subtrees. (In a BST you can go one way each step → O(h) time.)" },
  ],
  trie: [
    { fn: "insert", time: "O(L)", space: "O(L)", why: "L = word length; creates at most L new nodes." },
    { fn: "search / starts_with", time: "O(L)", space: "O(1)", why: "One step per character. Independent of how many words are stored." },
    { fn: "whole trie", time: "—", space: "O(total chars)", why: "Worst case, no shared prefixes: one node per inserted character." },
  ],
  bfs: [
    { fn: "bfs", time: "O(V + E)", space: "O(V)", why: "Marked on ENQUEUE, so each node enters the queue once; each edge is examined once." },
  ],
  dfs: [
    { fn: "count_components", time: "O(V + E)", space: "O(V)", why: "Visited set + recursion depth up to V on a path-shaped graph — past ~1,000 Python raises RecursionError." },
    { fn: "dfs_iterative", time: "O(V + E)", space: "O(V + E)", why: "Visited is re-checked at POP, so an unvisited node can be pushed once per incoming edge — the stack can hold O(E) entries." },
  ],
  grid_islands: [
    { fn: "num_islands", time: "O(R·C)", space: "O(R·C)", why: "Every cell is sunk once. The flood-fill recursion can go R·C deep on a snake-shaped island — past ~1,000 cells use BFS or an explicit stack." },
  ],
  topo_sort: [
    { fn: "find_order", time: "O(V + E)", space: "O(V + E)", why: "Building the graph is O(E); each node is dequeued once and each edge decrements one in-degree." },
  ],
  union_find: [
    { fn: "find / union", time: "O(α(n)) amortized", space: "O(n)", why: "Path halving + union by rank. α is the inverse Ackermann function: ≤ 4 for any realistic n, so effectively O(1)." },
  ],
  dijkstra: [
    { fn: "dijkstra", time: "O((V + E) log V)", space: "O(V + E)", why: "Each edge can push one heap entry; stale entries are skipped on pop. The heap can hold up to E entries, and log E = O(log V)." },
  ],
  prims: [
    { fn: "prims", time: "O(E log V)", space: "O(V + E)", why: "Lazy heap: every edge can be pushed, each push/pop is O(log E) = O(log V)." },
  ],
  kruskal: [
    { fn: "kruskal", time: "O(E log E)", space: "O(V)", why: "Sorting the edges dominates; path-compressed finds are near-constant. The parent array is O(V) (plus the sort's scratch space)." },
  ],
  dp_1d: [
    { fn: "climb_stairs", time: "O(n)", space: "O(1)", why: "Only the last two values are kept — the DP table rolled into two variables." },
    { fn: "rob", time: "O(n)", space: "O(1)", why: "Same rolling trick: take/skip." },
    { fn: "coin_change", time: "O(A·c)", space: "O(A)", why: "A = amount, c = number of coins. Pseudo-polynomial: grows with the VALUE of amount, not the input length." },
    { fn: "word_break", time: "O(n³)", space: "O(n)", why: "n memoized states × up to n end positions × O(n) to build and hash the slice s[i:j]. Most people say O(n²) and forget the slice." },
  ],
  dp_2d: [
    { fn: "edit_distance", time: "O(m·n)", space: "O(m·n)", why: "Each cell filled once from three neighbours. Keeping only two rows cuts space to O(min(m, n))." },
    { fn: "unique_paths", time: "O(m·n)", space: "O(n)", why: "One rolling row instead of the full grid." },
    { fn: "lis", time: "O(n log n)", space: "O(n)", why: "One binary search per element into tails, which never exceeds n." },
  ],
  backtracking: [
    { fn: "subsets", time: "O(n·2ⁿ)", space: "O(n)", why: "2ⁿ subsets, each copied in O(n). Space excludes the output: n stack frames + the path." },
    { fn: "permutations", time: "O(n·n!)", space: "O(n)", why: "n! permutations, each copied in O(n); each level loops over all n candidates." },
    { fn: "combination_sum", time: "O(N^(T/m + 1))", space: "O(T/m)", why: "N candidates, target T, smallest candidate m: the recursion is at most T/m deep with ≤ N branches. Exponential; pruning helps in practice." },
  ],
  lru_design: [
    { fn: "get / put", time: "O(1)", space: "O(capacity)", why: "OrderedDict = hash map + doubly linked list: lookup, move_to_end and popitem(last=False) are all O(1)." },
  ],
  python_toolkit: [
    { fn: "sort / sorted", time: "O(n log n)", space: "O(n) for sorted()", why: "Timsort. sorted() returns a new list; .sort() reuses the original." },
    { fn: "heapq.nlargest(k, …)", time: "O(n log k)", space: "O(k)", why: "With k = 3 that is effectively O(n) — cheaper than a full sort." },
    { fn: "Counter / defaultdict", time: "O(n)", space: "O(u)", why: "One pass; u distinct keys." },
    { fn: "deque append/pop (either end)", time: "O(1)", space: "—", why: "The reason to use deque over list for queues: list.pop(0) is O(n)." },
    { fn: "bisect.insort", time: "O(n)", space: "—", why: "Finding the spot is O(log n), but inserting shifts every later element — O(n) overall." },
    { fn: "bisect_left", time: "O(log n)", space: "O(1)", why: "Binary search on an already-sorted list — only finds the position, never moves anything." },
    { fn: "s[::-1], ''.join(…)", time: "O(n)", space: "O(n)", why: "Both build a new string of length n." },
    { fn: "zip(*grid)", time: "O(R·C)", space: "O(R·C)", why: "Touches and copies every cell." },
    { fn: "fib with @lru_cache", time: "O(n)", space: "O(n)", why: "Without the cache it is O(φⁿ) ≈ 1.618ⁿ: fib(30) makes 2,692,537 calls vs 59. See the Complexity Lab." },
  ],
};

// A compact comment block, prepended to the displayed and copied code so the
// complexity travels with the template.
export function complexityHeader(id) {
  const rows = SNIPPET_COMPLEXITY[id];
  if (!rows) return "";
  const w = Math.max(...rows.map((r) => r.fn.length));
  const tw = Math.max(...rows.map((r) => r.time.length));
  const lines = rows.map((r) => `#   ${r.fn.padEnd(w)}   time ${r.time.padEnd(tw)}   space ${r.space}`);
  return ["# ── Complexity " + "─".repeat(40), ...lines, "# " + "─".repeat(54), ""].join("\n");
}
