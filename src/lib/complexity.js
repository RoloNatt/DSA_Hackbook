// Complexity, measured rather than asserted.
//
// Each algorithm below is instrumented: it counts its basic operation and tracks
// the peak extra memory it holds, including recursion depth. Running it across a
// range of input sizes and fitting the counts recovers the Big-O class
// empirically, so the lab can show the class emerging from the data instead of
// stating it.
//
// All inputs are seeded, so every count is reproducible.

import { rng } from "./mlmath.js";

const distinct = (n) => Array.from({ length: n }, (_, i) => i * 7 + 3);
const randomInts = (n, seed = 5) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.floor(r() * n * 4));
};
const randomLetters = (n, seed = 9) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => String.fromCharCode(97 + Math.floor(r() * 26)));
};

// Doubling grid for polynomial/log algorithms; linear grid for exponential ones.
const doubling = (from, to) => {
  const out = [];
  for (let n = from; n <= to; n *= 2) out.push(n);
  return out;
};
const linear = (from, to, step = 1) => {
  const out = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
};

// ─── THE ALGORITHMS ─────────────────────────────────────────────────────────
// Each returns { ops, space } where
//   ops   = how many times the marked line ran
//   space = peak EXTRA memory in "slots" (items held + stack frames)

export const ALGORITHMS = [
  {
    id: "first", group: "The baseline", label: "Read the first item",
    time: "O(1)", space: "O(1)", ns: doubling(16, 65536),
    code: `def first(nums):
    return nums[0]          # ← counted`,
    lesson: "Work does not depend on n at all. A million items or ten — one step.",
    run: (n) => { const a = distinct(n); let ops = 0; ops++; void a[0]; return { ops, space: 1 }; },
  },
  {
    id: "binary", group: "Halving", label: "Binary search",
    time: "O(log n)", space: "O(1)", ns: doubling(16, 65536),
    code: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2  # ← counted
        if nums[mid] == target: return mid
        if nums[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
    lesson: "Every step throws away half of what is left. Doubling n adds ONE more step.",
    run: (n) => {
      const a = Array.from({ length: n }, (_, i) => i);
      const target = n;                              // absent: the worst case
      let lo = 0, hi = n - 1, ops = 0;
      while (lo <= hi) {
        ops++;
        const mid = (lo + hi) >> 1;
        if (a[mid] === target) break;
        if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
      }
      return { ops, space: 1 };
    },
  },
  {
    id: "linear", group: "One pass", label: "Find the maximum",
    time: "O(n)", space: "O(1)", ns: doubling(16, 65536),
    code: `def find_max(nums):
    best = nums[0]
    for x in nums:
        best = max(best, x)   # ← counted
    return best`,
    lesson: "Touch every item once. Double the input, double the work.",
    run: (n) => {
      const a = randomInts(n);
      let best = a[0], ops = 0;
      for (const x of a) { ops++; if (x > best) best = x; }
      return { ops, space: 1 };
    },
  },
  {
    id: "hashdup", group: "One pass", label: "Duplicate check with a set",
    time: "O(n)", space: "O(n)", ns: doubling(16, 65536),
    code: `def has_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:         # ← counted (O(1) average)
            return True
        seen.add(x)
    return False`,
    lesson: "Fast because the set lookup is O(1) — paid for with O(n) memory. The classic time-for-space trade.",
    run: (n) => {
      const a = distinct(n);                         // no duplicates: worst case
      const seen = new Set();
      let ops = 0, peak = 0;
      for (const x of a) {
        ops++;
        if (seen.has(x)) break;
        seen.add(x);
        peak = Math.max(peak, seen.size);
      }
      return { ops, space: peak };
    },
  },
  {
    id: "window", group: "Looks nested, isn't", label: "Sliding window (while inside for)",
    time: "O(n)", space: "O(1)", ns: doubling(64, 65536),
    code: `def longest_unique(s):
    seen, left, best = set(), 0, 0
    for right in range(len(s)):
        while s[right] in seen:     # ← counted
            seen.remove(s[left]); left += 1
        seen.add(s[right])          # ← counted
        best = max(best, right - left + 1)
    return best`,
    lesson: "A loop inside a loop, yet linear: each character enters the window once and leaves at most once. Count total moves, not nesting depth.",
    run: (n) => {
      const s = randomLetters(n);
      const seen = new Set();
      let left = 0, ops = 0, peak = 0;
      for (let right = 0; right < n; right++) {
        while (seen.has(s[right])) { ops++; seen.delete(s[left]); left++; }
        ops++;
        seen.add(s[right]);
        peak = Math.max(peak, seen.size);
      }
      return { ops, space: peak };
    },
  },
  {
    id: "halvingloop", group: "Halving", label: "Halving loop inside a loop",
    time: "O(n log n)", space: "O(1)", ns: doubling(16, 65536),
    code: `def count(n):
    total = 0
    for i in range(n):
        j = n
        while j > 1:
            j //= 2           # ← counted
            total += 1
    return total`,
    lesson: "n outer iterations × log n halvings each. Multiply nested loops — but only by how many times each ACTUALLY runs.",
    run: (n) => {
      let ops = 0;
      for (let i = 0; i < n; i++) { let j = n; while (j > 1) { j = Math.floor(j / 2); ops++; } }
      return { ops, space: 1 };
    },
  },
  {
    id: "mergesort", group: "Halving", label: "Merge sort",
    time: "O(n log n)", space: "O(n)", ns: doubling(16, 65536),
    code: `def merge_sort(a):
    if len(a) <= 1: return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:     # ← counted
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]`,
    lesson: "log n levels of splitting, n work to merge each level. Needs an extra array to merge into, so O(n) space.",
    run: (n) => {
      const a = randomInts(n);
      const aux = new Array(n);
      let ops = 0, depth = 0, maxDepth = 0;
      const sort = (lo, hi) => {                     // [lo, hi)
        if (hi - lo <= 1) return;
        depth++; maxDepth = Math.max(maxDepth, depth);
        const mid = (lo + hi) >> 1;
        sort(lo, mid); sort(mid, hi);
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) { ops++; aux[k++] = a[i] <= a[j] ? a[i++] : a[j++]; }
        while (i < mid) aux[k++] = a[i++];
        while (j < hi) aux[k++] = a[j++];
        for (let t = lo; t < hi; t++) a[t] = aux[t];
        depth--;
      };
      sort(0, n);
      return { ops, space: n + maxDepth };
    },
  },
  {
    id: "pairs", group: "Nested loops", label: "Compare every pair",
    time: "O(n²)", space: "O(1)", ns: doubling(16, 4096),
    code: `def has_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:  # ← counted
                return True
    return False`,
    lesson: "n(n−1)/2 comparisons. The /2 disappears in Big-O, but the n² is why this falls over at 100,000 items.",
    run: (n) => {
      const a = distinct(n);
      let ops = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { ops++; if (a[i] === a[j]) return { ops, space: 1 }; }
      return { ops, space: 1 };
    },
  },
  {
    id: "inlist", group: "Hidden costs", label: "Duplicate check with a LIST",
    time: "O(n²)", space: "O(n)", ns: doubling(16, 4096),
    code: `def has_duplicate(nums):
    seen = []                 # list, not set!
    for x in nums:
        if x in seen:         # ← counted per item scanned
            return True
        seen.append(x)
    return False`,
    lesson: "Identical to the set version except one word — and it is now quadratic. `x in list` scans the whole list every time.",
    run: (n) => {
      const a = distinct(n);
      const seen = [];
      let ops = 0;
      for (const x of a) {
        for (const y of seen) { ops++; if (y === x) return { ops, space: seen.length }; }
        seen.push(x);
      }
      return { ops, space: seen.length };
    },
  },
  {
    id: "slice", group: "Hidden costs", label: "Slicing inside a loop",
    time: "O(n²)", space: "O(n)", ns: doubling(16, 4096),
    code: `def prefixes(nums):
    total = 0
    for i in range(len(nums)):
        prefix = nums[:i]     # ← counted per item COPIED
        total += len(prefix)
    return total`,
    lesson: "One loop, but each slice copies up to n items. Slices are not free — they are O(k) copies.",
    run: (n) => {
      const a = randomInts(n);
      let ops = 0, peak = 0;
      for (let i = 0; i < n; i++) { const p = a.slice(0, i); ops += p.length; peak = Math.max(peak, p.length); }
      return { ops, space: peak };
    },
  },
  {
    id: "triple", group: "Nested loops", label: "Every triple",
    time: "O(n³)", space: "O(1)", ns: doubling(8, 256),
    code: `def count_triples(nums):
    count = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            for k in range(j + 1, len(nums)):
                count += 1    # ← counted
    return count`,
    lesson: "Three nested loops over n. Only viable for n in the low hundreds.",
    run: (n) => {
      let ops = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) ops++;
      return { ops, space: 1 };
    },
  },
  {
    id: "fibnaive", group: "Recursion", label: "Fibonacci, naive recursion",
    time: "O(2ⁿ)", space: "O(n)", ns: linear(4, 24, 2),
    code: `def fib(n):                 # ← counted per call
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)`,
    lesson: "Two branches per call, depth n: the call tree roughly doubles each level. But space is only the depth of ONE path — O(n).",
    run: (n) => {
      let ops = 0, depth = 0, maxDepth = 0;
      const fib = (k) => {
        ops++; depth++; maxDepth = Math.max(maxDepth, depth);
        const v = k < 2 ? k : fib(k - 1) + fib(k - 2);
        depth--;
        return v;
      };
      fib(n);
      return { ops, space: maxDepth };
    },
  },
  {
    id: "fibmemo", group: "Recursion", label: "Fibonacci, memoized",
    time: "O(n)", space: "O(n)", ns: doubling(16, 2048),
    code: `@lru_cache(None)
def fib(n):                 # ← counted per call
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)`,
    lesson: "Same code plus a cache. Each value is computed once, so exponential becomes linear — paid for with O(n) memory.",
    run: (n) => {
      // A real memoized recursion. Cache hits still count as calls, exactly as
      // they do with lru_cache: the wrapper runs, the body does not.
      const memo = new Map();
      let ops = 0, depth = 0, peak = 0;
      // Peak = frames open + values cached AT THE SAME MOMENT. The cache fills
      // as the stack unwinds, so the two never both reach n: the peak is n.
      const note = () => { peak = Math.max(peak, depth + memo.size); };
      const fib = (k) => {
        ops++; depth++; note();
        let v;
        if (k < 2) v = k;
        else if (memo.has(k)) v = memo.get(k);
        else { v = (fib(k - 1) + fib(k - 2)) % 1e9; memo.set(k, v); note(); }
        depth--;
        return v;
      };
      fib(n);
      return { ops, space: peak };
    },
  },
  {
    id: "subsets", group: "Recursion", label: "All subsets (backtracking)",
    time: "O(2ⁿ)", space: "O(n)", ns: linear(4, 20, 2),
    code: `def subsets(nums):
    out, path = [], []
    def bt(i):                  # ← counted per call
        if i == len(nums):
            out.append(path[:]); return
        bt(i + 1)                       # skip
        path.append(nums[i]); bt(i + 1) # take
        path.pop()
    bt(0)
    return out`,
    lesson: "2ⁿ subsets exist, so no algorithm can list them faster. Output-bound: the answer's size sets the floor.",
    run: (n) => {
      let ops = 0, depth = 0, maxDepth = 0;
      const bt = (i) => {
        ops++; depth++; maxDepth = Math.max(maxDepth, depth);
        if (i < n) { bt(i + 1); bt(i + 1); }
        depth--;
      };
      bt(0);
      return { ops, space: maxDepth + n };           // stack frames + the path list
    },
  },
  {
    id: "treebal", group: "Recursion", label: "Tree depth — balanced tree",
    time: "O(n)", space: "O(log n)", ns: doubling(16, 65536),
    code: `def max_depth(node):           # ← counted per call
    if not node: return 0
    return 1 + max(max_depth(node.left),
                   max_depth(node.right))`,
    lesson: "Visits every node once: O(n) time. The stack only ever holds one root-to-leaf path: O(log n) when balanced.",
    run: (n) => {
      let ops = 0, depth = 0, maxDepth = 0;
      const visit = (count) => {                     // a subtree of `count` nodes
        if (count === 0) return;
        ops++; depth++; maxDepth = Math.max(maxDepth, depth);
        const left = (count - 1) >> 1;
        visit(left); visit(count - 1 - left);
        depth--;
      };
      visit(n);
      return { ops, space: maxDepth };
    },
  },
  {
    id: "treeskew", group: "Recursion", label: "Tree depth — skewed tree (a chain)",
    time: "O(n)", space: "O(n)", ns: doubling(16, 65536),
    code: `# Same function, but every node has only a right child:
#   1 → 2 → 3 → 4 → … → n
def max_depth(node):           # ← counted per call
    if not node: return 0
    return 1 + max(max_depth(node.left),
                   max_depth(node.right))`,
    lesson: "Same code, same O(n) time — but the recursion now goes n deep. Space depends on SHAPE, not just size. In Python this crashes past ~1,000 nodes.",
    run: (n) => {
      // Simulated rather than truly recursive, so large n cannot blow the JS stack.
      let ops = 0, maxDepth = 0;
      for (let d = 1; d <= n; d++) { ops++; maxDepth = d; }
      return { ops, space: maxDepth };
    },
  },
];

// ─── MEASURE ────────────────────────────────────────────────────────────────

export function measure(algo, ns = algo.ns) {
  return ns.map((n) => ({ n, ...algo.run(n) }));
}

// ─── FIT A CLASS TO MEASUREMENTS ────────────────────────────────────────────
// For each candidate f(n), look at ops / f(n) across all sizes. If the candidate
// is right, that ratio settles to a constant — so the winner is the candidate
// whose ratio varies least (smallest coefficient of variation) over the larger
// half of the data, where lower-order terms have faded.
//
// Exponentials are tested separately: they are straight lines in log(ops) vs n.

export const CLASSES = [
  { id: "1", label: "O(1)", f: () => 1 },
  { id: "logn", label: "O(log n)", f: (n) => Math.log2(Math.max(2, n)) },
  { id: "sqrt", label: "O(√n)", f: (n) => Math.sqrt(n) },
  { id: "n", label: "O(n)", f: (n) => n },
  { id: "nlogn", label: "O(n log n)", f: (n) => n * Math.log2(Math.max(2, n)) },
  { id: "n2", label: "O(n²)", f: (n) => n * n },
  { id: "n3", label: "O(n³)", f: (n) => n * n * n },
];

const cv = (vals) => {
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (m === 0) return Infinity;
  const sd = Math.sqrt(vals.reduce((a, v) => a + (v - m) ** 2, 0) / vals.length);
  return sd / m;
};

function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const r2 = sxx === 0 || syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { slope, r2 };
}

export function fitClass(points, key = "ops") {
  const pts = points.filter((p) => p[key] > 0);
  const tail = pts.slice(Math.floor(pts.length / 2));   // larger n only

  // Exponential check: straight line in log(value) against n, not log(n).
  const expFit = linreg(pts.map((p) => p.n), pts.map((p) => Math.log(p[key])));
  const polyFit = linreg(pts.map((p) => Math.log(p.n)), pts.map((p) => Math.log(p[key])));
  const base = Math.exp(expFit.slope);
  const isExp = base > 1.2 && expFit.r2 > 0.995 && expFit.r2 >= polyFit.r2;

  if (isExp) {
    return {
      // Anything growing slower than 2.5ⁿ is quoted as O(2ⁿ) (e.g. Fibonacci's
      // φⁿ); steeper growth is labelled by its measured base.
      id: "exp", label: base < 2.5 ? "O(2ⁿ)" : `O(${Math.round(base)}ⁿ)`, exponential: true, base,
      baseLabel: `≈ ${base.toFixed(3)}ⁿ`,
      logLogSlope: polyFit.slope,
      scores: [],
    };
  }

  const scores = CLASSES.map((c) => ({ ...c, cv: cv(tail.map((p) => p[key] / c.f(p.n))) }))
    .sort((a, b) => a.cv - b.cv);
  return {
    id: scores[0].id, label: scores[0].label, exponential: false,
    logLogSlope: polyFit.slope,
    scores: scores.map(({ id, label, cv: c }) => ({ id, label, cv: c })),
  };
}

// The doubling test, as a readable number: what happened when n doubled?
export function doublingRatio(points, key = "ops") {
  const out = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (b.n === 2 * a.n && a[key] > 0) out.push({ from: a.n, to: b.n, ratio: b[key] / a[key], added: b[key] - a[key] });
  }
  return out;
}

export function interpretRatio(r, added) {
  if (Math.abs(r - 1) < 0.02) return "unchanged → O(1)";
  if (added !== undefined && r < 1.3 && added <= 2) return `+${added} step → O(log n)`;
  if (r < 1.5) return "grew slowly → between O(1) and O(n)";
  if (r < 2.08) return "≈ doubled → O(n)";
  if (r < 2.6) return "a bit more than doubled → O(n log n)";
  if (r < 4.6) return "≈ ×4 → O(n²)";
  if (r < 9) return "≈ ×8 → O(n³)";
  return "exploded → exponential";
}
