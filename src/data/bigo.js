// ─── BIG-O & CONSTRAINTS REFERENCE ──────────────────────────────────────────

// Constraint size → intended complexity. Read the constraints FIRST:
// the problem setter is telling you which solution they expect.
export const CONSTRAINT_TABLE = [
  { n: "n ≤ 12", target: "O(n!)", hint: "Permutations, full brute force", algos: "Backtracking (permutations)" },
  { n: "n ≤ 25", target: "O(2ⁿ)", hint: "Try every subset", algos: "Backtracking, bitmask DP" },
  { n: "n ≤ 100", target: "O(n³)", hint: "Triple loop is fine", algos: "Floyd-Warshall, interval DP" },
  { n: "n ≤ 3,000", target: "O(n²)", hint: "Nested loops OK", algos: "Simple DP tables, brute-force pairs" },
  { n: "n ≤ 100,000", target: "O(n log n)", hint: "Must sort / heap / binary search", algos: "Sorting, heap, binary search, sweep" },
  { n: "n ≤ 10,000,000", target: "O(n)", hint: "One or two linear passes", algos: "HashMap, sliding window, two pointers, BFS/DFS" },
  { n: "n > 10⁸ or huge values", target: "O(log n) / O(1)", hint: "No touching every element", algos: "Binary search, math formula, digit tricks" },
];

// Python built-in operation costs — Google interviewers ASK these.
export const PYTHON_COSTS = [
  { op: "list.append(x) / list.pop()", cost: "O(1)", note: "amortized; end of list only" },
  { op: "list.insert(0, x) / list.pop(0)", cost: "O(n)", note: "shifts everything — use collections.deque instead" },
  { op: "x in list", cost: "O(n)", note: "linear scan — the classic hidden-cost bug" },
  { op: "x in set / x in dict", cost: "O(1) avg", note: "hashing; this is why sets exist" },
  { op: "dict[k] get/set/del", cost: "O(1) avg", note: "" },
  { op: "list[i] / list[i] = x", cost: "O(1)", note: "arrays have random access" },
  { op: "list slice a[i:j]", cost: "O(j−i)", note: "copies! slicing in a loop can hide O(n²)" },
  { op: "sorted(a) / a.sort()", cost: "O(n log n)", note: "Timsort; stable; O(n) on nearly-sorted data" },
  { op: "min(a) / max(a) / sum(a)", cost: "O(n)", note: "full scan every call — don't put in a loop" },
  { op: "heapq.heappush / heappop", cost: "O(log n)", note: "heapify(a) is O(n), not O(n log n)" },
  { op: "deque.appendleft / popleft", cost: "O(1)", note: "the BFS queue" },
  { op: "s + t (string concat)", cost: "O(len)", note: "in a loop → O(n²); collect parts, ''.join(parts)" },
  { op: "bisect.bisect_left(a, x)", cost: "O(log n)", note: "search only; insort is O(n) due to shifting" },
  { op: "Counter(iterable)", cost: "O(n)", note: "most_common(k) is O(n log k)" },
];

// Master complexity table for the Compare tab footer / quick scan.
export const COMPLEXITY_NOTES = [
  "Amortized O(1): occasionally expensive, cheap on average (list.append resizing).",
  "Hash O(1) is AVERAGE case — say 'average case' at Google and you earn a nod.",
  "Recursion costs stack space: DFS depth d ⇒ O(d) space even with no extra structures.",
  "log₂(1,000,000) ≈ 20 — binary search on a million items is ~20 probes. Say numbers like this.",
  "Reading input is already O(n) — you can't beat O(n) if you must look at everything once.",
];
