// ─── SIGNAL → ALGORITHM RULES (Identify tab) ────────────────────────────────
// google: true marks rules that map to high-frequency Google territory.

export const PATTERNS = [
  {
    category: "🗺️ Graph / Grid / Network problems",
    color: "#1A6BCC", bg: "#E8F1FB",
    rules: [
      {
        signal: "\"shortest path\" or \"minimum steps\" — NO cost/weight on edges",
        algo: "BFS", google: true,
        why: "BFS explores in rings, so first arrival = fewest edges. All edges cost '1 step'.",
        example: "Min steps to change 'hit' into 'cog', one letter at a time (Word Ladder)",
      },
      {
        signal: "2D grid + spreading / regions / reachability",
        algo: "Grid BFS/DFS", google: true,
        why: "Cells are nodes, 4 directions are edges. Flood-fill regions with DFS; spread with (multi-source) BFS.",
        example: "Number of Islands, Rotting Oranges — Google's most-reported family",
      },
      {
        signal: "\"shortest/cheapest path\" + edges have weight/cost/time",
        algo: "Dijkstra's", google: true,
        why: "Weights break BFS. Dijkstra pops the cheapest frontier node from a min-heap.",
        example: "Cheapest flight route; path minimizing max effort",
      },
      {
        signal: "\"prerequisites\" / \"must be done before\" / \"build order\"",
        algo: "Topological Sort", google: true,
        why: "Dependencies form a DAG. Kahn's: repeatedly take anything with no pending prereqs. Can't finish ⇒ cycle.",
        example: "Course Schedule: can you finish all courses, and in what order?",
      },
      {
        signal: "\"are these connected?\" asked repeatedly while edges get ADDED / \"merge groups\"",
        algo: "Union-Find", google: true,
        why: "DSU merges sets and answers same-group queries in near-O(1) — no re-traversal per query.",
        example: "Accounts Merge; Redundant Connection; number of provinces",
      },
      {
        signal: "\"connect ALL cities/nodes\" + minimize total cost",
        algo: "MST (Kruskal's/Prim's)",
        why: "Not a path — a cheapest connected network. n nodes, n−1 edges, no cycles.",
        example: "Min cost to connect all points with wires/roads",
      },
      {
        signal: "\"find ANY path\" / \"does a path exist\" / \"count connected components\"",
        algo: "DFS",
        why: "DFS commits deep and backtracks — perfect for existence and grouping questions.",
        example: "Is there any route between A and B?",
      },
    ],
  },
  {
    category: "📋 Array problems",
    color: "#0F7A5A", bg: "#E2F5EF",
    rules: [
      {
        signal: "\"two numbers that add to X\" / \"seen before?\" / \"count frequency\"",
        algo: "HashMap / Set", google: true,
        why: "Store what you've seen once; look it up in O(1). Converts O(n²) scans to O(n).",
        example: "Two Sum; find duplicates; most common element",
      },
      {
        signal: "SORTED array + find element / boundary / insertion point",
        algo: "Binary Search", google: true,
        why: "Sorted means half the array is discardable per comparison — O(log n).",
        example: "First and last position of target; search in rotated array",
      },
      {
        signal: "\"minimize the maximum…\" / \"min speed/capacity/days to finish\"",
        algo: "Binary Search on Answer", google: true,
        why: "If 'does X work?' flips from NO to YES exactly once, binary search X itself.",
        example: "Koko Eating Bananas; Split Array Largest Sum — Google loves these",
      },
      {
        signal: "\"longest/shortest CONTIGUOUS subarray satisfying …\"",
        algo: "Sliding Window", google: true,
        why: "Expand right, shrink left when invalid. Each element enters/leaves once → O(n).",
        example: "Longest subarray with at most K distinct values",
      },
      {
        signal: "\"sum between i and j\" many times / \"how many subarrays sum to K\"",
        algo: "Prefix Sum (+ HashMap)", google: true,
        why: "Range sum = difference of running totals. Counting: 'have I seen running−K before?'",
        example: "Subarray Sum Equals K (works with negatives — window doesn't)",
      },
      {
        signal: "\"K largest / K closest / K most frequent / merge K sorted\"",
        algo: "Heap", google: true,
        why: "A size-k min-heap keeps the best k in O(n log k) — beats full sorting.",
        example: "Top K Frequent Elements; Kth Largest in a stream",
      },
      {
        signal: "sorted array + \"find pair\" / \"in-place rearrange / remove\"",
        algo: "Two Pointers",
        why: "Converging pointers for pairs; read/write pointers for in-place edits. O(1) space.",
        example: "Move zeros to end preserving order",
      },
      {
        signal: "meetings / bookings / ranges with starts and ends",
        algo: "Intervals (sort + merge/heap)", google: true,
        why: "Sort by start — overlaps become neighbors. Rooms count = heap of end-times.",
        example: "Merge Intervals; Meeting Rooms II",
      },
      {
        signal: "\"next greater element\" / \"days until warmer\"",
        algo: "Monotonic Stack",
        why: "Keep a decreasing stack; a bigger newcomer resolves everyone it beats. O(n) total.",
        example: "Daily Temperatures; Largest Rectangle in Histogram",
      },
      {
        signal: "\"missing number\" / \"single number\" in a range",
        algo: "Math / XOR",
        why: "Expected sum n(n+1)/2 minus actual sum; or XOR everything — pairs cancel.",
        example: "Numbers 0–9 with one missing — which?",
      },
    ],
  },
  {
    category: "📝 String problems",
    color: "#6B3FCC", bg: "#F0EDFB",
    rules: [
      {
        signal: "\"longest substring\" without repeats / with at most K distinct",
        algo: "Sliding Window", google: true,
        why: "Substring = contiguous → window. Track chars with a set/Counter.",
        example: "Longest Substring Without Repeating Characters — Google perennial",
      },
      {
        signal: "\"smallest window containing all of …\"",
        algo: "Sliding Window (min variant)", google: true,
        why: "Expand until valid, then shrink while still valid, recording the best.",
        example: "Minimum Window Substring",
      },
      {
        signal: "\"anagram\" / \"same letters, different order\"",
        algo: "Counter / Sort",
        why: "Counter(s1) == Counter(s2), or compare sorted strings.",
        example: "'listen' vs 'silent'",
      },
      {
        signal: "\"palindrome\"",
        algo: "Two Pointers / DP",
        why: "Check: two pointers inward. Longest palindromic substring: expand around centers.",
        example: "Valid Palindrome; Longest Palindromic Substring",
      },
      {
        signal: "\"valid parentheses\" / nested structures / \"decode 3[ab]\"",
        algo: "Stack", google: true,
        why: "Most recent unfinished thing resolves first — that's LIFO.",
        example: "Valid Parentheses; Decode String; Basic Calculator",
      },
      {
        signal: "\"autocomplete\" / \"starts with\" / search MANY words at once",
        algo: "Trie", google: true,
        why: "Shared prefixes share paths; queries cost O(word length), not O(dictionary size).",
        example: "Design Search Autocomplete; Word Search II",
      },
      {
        signal: "\"can this string be segmented / formed from dictionary words\"",
        algo: "DP", google: true,
        why: "can(i) depends on can(j) for smaller j — overlapping subproblems.",
        example: "Word Break",
      },
      {
        signal: "\"minimum edits to transform A into B\" / \"longest common subsequence\"",
        algo: "2D DP", google: true,
        why: "Two sequences compared position by position → dp[i][j] table.",
        example: "Edit Distance (Google: relates to spell-correction)",
      },
    ],
  },
  {
    category: "🌳 Tree problems",
    color: "#33691E", bg: "#F1F8E9",
    rules: [
      {
        signal: "depth / path sum / symmetric / invert / diameter",
        algo: "Tree DFS (recursion)", google: true,
        why: "Ask both children, combine with the current node, return upward.",
        example: "Maximum Depth; Binary Tree Maximum Path Sum",
      },
      {
        signal: "\"level by level\" / \"level order\" / \"right side view\" / \"zigzag\"",
        algo: "Tree BFS (queue)", google: true,
        why: "Process one level per queue pass: for _ in range(len(queue)).",
        example: "Level Order Traversal; Right Side View",
      },
      {
        signal: "BST + \"k-th smallest\" / \"validate\" / \"closest value\"",
        algo: "BST property + Inorder", google: true,
        why: "Inorder traversal of a BST visits values in sorted order. Validate with (lo, hi) bounds.",
        example: "Validate BST; Kth Smallest in BST",
      },
      {
        signal: "\"lowest common ancestor\"",
        algo: "LCA recursion", google: true,
        why: "If p and q land in different subtrees, the current node is the answer.",
        example: "LCA of a Binary Tree — Google classic",
      },
      {
        signal: "\"serialize / save / send / reconstruct\" a tree",
        algo: "Preorder + null markers", google: true,
        why: "Preorder with 'N' for nulls uniquely encodes the tree; rebuild with an iterator.",
        example: "Serialize and Deserialize Binary Tree",
      },
    ],
  },
  {
    category: "🧠 Optimization / Counting / Enumeration",
    color: "#6A1B9A", bg: "#F3E5F5",
    rules: [
      {
        signal: "\"how MANY ways to …\"",
        algo: "DP", google: true,
        why: "Count(state) = sum of counts of predecessor states. Cache — don't recount.",
        example: "Climbing Stairs; Unique Paths; Decode Ways",
      },
      {
        signal: "\"MIN/MAX cost/value to reach …\" with a choice at every step",
        algo: "DP", google: true,
        why: "Best(state) = best over last-choice options. If greedy has a counter-example → DP.",
        example: "Coin Change ([1,3,4], target 6 breaks greedy!); House Robber",
      },
      {
        signal: "\"LIST ALL permutations/subsets/combinations/placements\"",
        algo: "Backtracking", google: true,
        why: "Enumeration (not counting!) needs the full decision tree: choose → explore → un-choose.",
        example: "Generate Parentheses; Letter Combinations of a Phone Number",
      },
      {
        signal: "\"maximum non-overlapping…\" / \"minimum number to cover…\" + sorting helps",
        algo: "Greedy",
        why: "When an exchange argument works (earliest finish first), commit and never look back.",
        example: "Non-overlapping Intervals; Jump Game",
      },
      {
        signal: "n ≤ 20 in the constraints",
        algo: "Backtracking / Bitmask",
        why: "Tiny n is the setter TELLING you exponential is intended.",
        example: "Partition to K Equal Sum Subsets",
      },
      {
        signal: "\"subsequence\" (not substring!) + longest/count",
        algo: "DP", google: true,
        why: "Subsequences skip elements — windows can't. dp over prefixes handles skipping.",
        example: "Longest Increasing Subsequence (mention the O(n log n) version!)",
      },
    ],
  },
  {
    category: "🏗️ Design & Linked List",
    color: "#827717", bg: "#F9FBE7",
    rules: [
      {
        signal: "\"design a class with get/put/insert/delete in O(1)\"",
        algo: "Compose: HashMap + List/Heap", google: true,
        why: "No single structure does it all — combine one for lookup, one for order/rank.",
        example: "LRU Cache; Insert Delete GetRandom O(1); Time-Based KV Store",
      },
      {
        signal: "\"reverse a linked list\" / \"in groups of k\"",
        algo: "Pointer reversal", google: true,
        why: "prev/curr/next three-pointer walk; save next BEFORE rewiring.",
        example: "Reverse Linked List (know it cold — it's a building block)",
      },
      {
        signal: "\"detect cycle\" / \"find middle\" / \"k-th from end\" in a list",
        algo: "Fast & Slow Pointers",
        why: "Fast moves 2, slow moves 1: meeting ⇒ cycle; fast at end ⇒ slow at middle.",
        example: "Linked List Cycle II (find where the cycle starts)",
      },
      {
        signal: "\"merge k sorted lists/streams\"",
        algo: "Heap of heads", google: true,
        why: "Pop the smallest head, push its successor — O(N log k).",
        example: "Merge k Sorted Lists",
      },
    ],
  },
];
