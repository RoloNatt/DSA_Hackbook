// Minimal pseudocode shapes → complexity.
//
// Each card is ONLY the shape: no function headers, no base cases, no bodies
// beyond the line that matters. A line ends in ":" only if something is nested
// under it.
//
// Every shape carries two functions:
//   steps(n, m)    — the exact count, cheap to compute, shown on the card
//   simulate(n, m) — the pseudocode written out as real loops, used by the
//                    tests to prove `steps` is right
// and `fit`, the class the tests expect when the count is fitted against n
// (with m = n for two-variable shapes). src/lib/__tests__/loopShapes.test.mjs.

const lg = Math.log2;
const floorLog = (n) => (n <= 1 ? 0 : Math.floor(lg(n)));
const ceilLog = (n) => (n <= 1 ? 0 : Math.ceil(lg(n)));
const fibN = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };

// ─── TIME ───────────────────────────────────────────────────────────────────

export const TIME_SHAPES = [
  // ── Basics
  {
    id: "t-const", group: "Basics",
    code: `x = a[0]`,
    answer: "O(1)", why: "No loop. One step at any size.",
    steps: () => 1, simulate: () => 1, fit: "O(1)",
  },
  {
    id: "t-one", group: "Basics",
    code: `for i in n`,
    answer: "O(n)", why: "n iterations.",
    steps: (n) => n, simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) c++; return c; }, fit: "O(n)",
  },
  {
    id: "t-seq", group: "Basics",
    code: `for i in n
for j in n`,
    answer: "O(n)", why: "One after the other: n + n = 2n. Constants drop.",
    steps: (n) => 2 * n,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) c++; for (let j = 0; j < n; j++) c++; return c; }, fit: "O(n)",
  },
  {
    id: "t-seq-nm", group: "Basics",
    code: `for i in n
for j in m`,
    answer: "O(n + m)", why: "Sequential, different inputs: add them.",
    steps: (n, m) => n + m,
    simulate: (n, m) => { let c = 0; for (let i = 0; i < n; i++) c++; for (let j = 0; j < m; j++) c++; return c; }, fit: "O(n)",
  },

  // ── Nested loops
  {
    id: "t-nested", group: "Nested loops",
    code: `for i in n:
    for j in n`,
    answer: "O(n²)", why: "n × n.",
    steps: (n) => n * n,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c++; return c; }, fit: "O(n²)",
  },
  {
    id: "t-nm", group: "Nested loops",
    code: `for i in n:
    for j in m`,
    answer: "O(n·m)", why: "n × m. Different inputs get different letters — not n².",
    steps: (n, m) => n * m,
    simulate: (n, m) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) c++; return c; }, fit: "O(n²)",
  },
  {
    id: "t-tri", group: "Nested loops",
    code: `for i in n:
    for j in range(i, n)`,
    answer: "O(n²)", why: "n + (n−1) + … + 1 = n(n+1)/2. Starting at i halves the work, not the class.",
    steps: (n) => (n * (n + 1)) / 2,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = i; j < n; j++) c++; return c; }, fit: "O(n²)",
  },
  {
    id: "t-tri-m", group: "Nested loops",
    code: `for i in n:
    for j in range(i, m)`,
    answer: "O(n·m)", why: "Row i does m − i steps. For n ≤ m that is n·m − n(n−1)/2: still O(n·m). If n = m it's O(n²).",
    steps: (n, m) => { let s = 0; for (let i = 0; i < n; i++) s += Math.max(0, m - i); return s; },
    simulate: (n, m) => { let c = 0; for (let i = 0; i < n; i++) for (let j = i; j < m; j++) c++; return c; }, fit: "O(n²)",
  },
  {
    id: "t-pairs", group: "Nested loops",
    code: `for i in n:
    for j in range(i + 1, n)`,
    answer: "O(n²)", why: "Every pair once: n(n−1)/2.",
    steps: (n) => (n * (n - 1)) / 2,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) c++; return c; }, fit: "O(n²)",
  },
  {
    id: "t-const-inner", group: "Nested loops",
    code: `for i in n:
    for j in 4`,
    answer: "O(n)", why: "The inner loop never grows: n × 4.",
    steps: (n) => 4 * n,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) c++; return c; }, fit: "O(n)",
  },
  {
    id: "t-cube", group: "Nested loops",
    code: `for i in n:
    for j in n:
        for k in n`,
    answer: "O(n³)", why: "n × n × n.",
    steps: (n) => n ** 3,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) c++; return c; }, fit: "O(n³)",
  },
  {
    id: "t-cube-tri", group: "Nested loops",
    code: `for i in n:
    for j in range(i):
        for k in range(j)`,
    answer: "O(n³)", why: "Every triple once: n(n−1)(n−2)/6. Still cubic.",
    steps: (n) => (n * (n - 1) * (n - 2)) / 6,
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) for (let k = 0; k < j; k++) c++; return c; }, fit: "O(n³)",
  },

  // ── Logs and roots
  {
    id: "t-halve", group: "Logs and roots",
    code: `while n > 1:
    n = n / 2`,
    answer: "O(log n)", why: "Halve until 1: log₂ n steps.",
    steps: (n) => floorLog(n),
    simulate: (n) => { let c = 0; while (n > 1) { n = Math.floor(n / 2); c++; } return c; }, fit: "O(log n)",
  },
  {
    id: "t-double", group: "Logs and roots",
    code: `i = 1
while i < n:
    i = i * 2`,
    answer: "O(log n)", why: "Double until n: log₂ n steps.",
    steps: (n) => ceilLog(n),
    simulate: (n) => { let c = 0, i = 1; while (i < n) { i *= 2; c++; } return c; }, fit: "O(log n)",
  },
  {
    id: "t-sqrt", group: "Logs and roots",
    code: `i = 1
while i * i <= n:
    i = i + 1`,
    answer: "O(√n)", why: "Stops when i reaches √n.",
    steps: (n) => Math.floor(Math.sqrt(n)),
    simulate: (n) => { let c = 0, i = 1; while (i * i <= n) { i++; c++; } return c; }, fit: "O(√n)",
  },
  {
    id: "t-nlogn", group: "Logs and roots",
    code: `for i in n:
    j = n
    while j > 1:
        j = j / 2`,
    answer: "O(n log n)", why: "n × log n.",
    steps: (n) => n * floorLog(n),
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) { let j = n; while (j > 1) { j = Math.floor(j / 2); c++; } } return c; }, fit: "O(n log n)",
  },
  {
    id: "t-sumlog", group: "Logs and roots",
    code: `for i in n:
    j = 1
    while j < i:
        j = j * 2`,
    answer: "O(n log n)", why: "log 1 + log 2 + … + log n = log(n!) ≈ n log n.",
    steps: (n) => { let s = 0; for (let i = 0; i < n; i++) s += ceilLog(i); return s; },
    simulate: (n) => { let c = 0; for (let i = 0; i < n; i++) { let j = 1; while (j < i) { j *= 2; c++; } } return c; }, fit: "O(n log n)",
  },

  // ── Traps: looks one way, is another
  {
    id: "t-geo", group: "Traps",
    code: `i = n
while i > 0:
    for j in i
    i = i / 2`,
    answer: "O(n)", why: "Looks like n log n. But n + n/2 + n/4 + … < 2n.",
    steps: (n) => { let s = 0; for (let i = n; i > 0; i = Math.floor(i / 2)) s += i; return s; },
    simulate: (n) => { let c = 0, i = n; while (i > 0) { for (let j = 0; j < i; j++) c++; i = Math.floor(i / 2); } return c; }, fit: "O(n)",
  },
  {
    id: "t-harm", group: "Traps",
    code: `for i in 1..n:
    for j in range(0, n, i)`,
    answer: "O(n log n)", why: "Inner runs n/i times: n/1 + n/2 + … + n/n = n × (1 + ½ + … + 1/n) ≈ n ln n.",
    steps: (n) => { let s = 0; for (let i = 1; i <= n; i++) s += Math.ceil(n / i); return s; },
    simulate: (n) => { let c = 0; for (let i = 1; i <= n; i++) for (let j = 0; j < n; j += i) c++; return c; }, fit: "O(n log n)",
  },
  {
    id: "t-twoptr", group: "Traps",
    code: `j = 0
for i in n:
    while j < n and ok(i, j):
        j = j + 1`,
    answer: "O(n)", why: "j never resets, so the while runs at most n times IN TOTAL: n + n.",
    steps: (n) => 2 * n,
    simulate: (n) => { let c = 0, j = 0; for (let i = 0; i < n; i++) { c++; while (j < n) { j++; c++; } } return c; }, fit: "O(n)",
  },
  {
    id: "t-inlist", group: "Traps",
    code: `for i in n:
    x in list`,
    answer: "O(n²)", why: "`in` on a list of n items is a hidden loop. With a set it's O(1) → O(n).",
    steps: (n) => n * n,
    simulate: (n) => { let c = 0; const list = Array.from({ length: n }, (_, k) => k); for (let i = 0; i < n; i++) { for (const y of list) { c++; if (y === -1) break; } } return c; }, fit: "O(n²)",
  },
  {
    id: "t-slice", group: "Traps",
    code: `for i in n:
    b = a[0 : i]`,
    answer: "O(n²)", why: "A slice copies i items: 0 + 1 + … + (n−1).",
    steps: (n) => (n * (n - 1)) / 2,
    simulate: (n) => { let c = 0; const a = new Array(n).fill(0); for (let i = 0; i < n; i++) c += a.slice(0, i).length; return c; }, fit: "O(n²)",
  },
  {
    id: "t-insert0", group: "Traps",
    code: `for i in n:
    list.insert(0, x)`,
    answer: "O(n²)", why: "Inserting at the front shifts every item already there. Use a deque.",
    steps: (n) => (n * (n - 1)) / 2,
    simulate: (n) => { let c = 0; const list = []; for (let i = 0; i < n; i++) { c += list.length; list.unshift(i); } return c; }, fit: "O(n²)",
  },

  // ── Library calls
  {
    id: "t-sort", group: "Library calls",
    code: `sort(a)
for i in n`,
    answer: "O(n log n)", why: "n log n + n. The sort dominates.",
    steps: (n) => Math.round(n * lg(n)) + n, simulate: null, fit: "O(n log n)",
  },
  {
    id: "t-bsearch", group: "Library calls",
    code: `for i in n:
    binary_search(a, x)`,
    answer: "O(n log n)", why: "n searches × log n each.",
    steps: (n) => n * (floorLog(n) + 1),
    simulate: (n) => {
      let c = 0; const a = Array.from({ length: n }, (_, k) => k);
      for (let i = 0; i < n; i++) { let lo = 0, hi = n - 1; while (lo <= hi) { c++; const mid = (lo + hi) >> 1; if (a[mid] < n) lo = mid + 1; else hi = mid - 1; } }
      return c;
    }, fit: "O(n log n)",
  },
  {
    id: "t-heap", group: "Library calls",
    code: `for i in n:
    heap.push(x)`,
    answer: "O(n log n)", why: "Each push is log(heap size), and the heap grows to n.",
    steps: (n) => { let s = 0; for (let i = 1; i <= n; i++) s += floorLog(i) + 1; return s; }, simulate: null, fit: "O(n log n)",
  },
  {
    id: "t-heapk", group: "Library calls",
    code: `for i in n:
    heap.push(x)
    if size > k: heap.pop()`,
    answer: "O(n log k)", why: "The heap never exceeds k, so each operation is log k.",
    steps: (n, m, k = 10) => n * (floorLog(k + 1) + 1), simulate: null, fit: null,
  },

  // ── Recursion (base cases left out on purpose)
  {
    id: "r-lin", group: "Recursion",
    code: `f(n):
    f(n - 1)`,
    answer: "O(n)", why: "One call per level, n levels.",
    steps: (n) => n,
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k > 1) f(k - 1); }; f(n); return c; }, fit: "O(n)",
  },
  {
    id: "r-half", group: "Recursion",
    code: `f(n):
    f(n / 2)`,
    answer: "O(log n)", why: "One call per level, log n levels.",
    steps: (n) => floorLog(n) + 1,
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k > 1) f(Math.floor(k / 2)); }; f(n); return c; }, fit: "O(log n)",
  },
  {
    id: "r-two", group: "Recursion",
    code: `f(n):
    f(n - 1)
    f(n - 1)`,
    answer: "O(2ⁿ)", why: "Two calls per level, n levels: 2ⁿ − 1 calls.",
    steps: (n) => 2 ** n - 1,
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k > 1) { f(k - 1); f(k - 1); } }; f(n); return c; }, fit: "O(2ⁿ)", exp: true,
  },
  {
    id: "r-three", group: "Recursion",
    code: `f(n):
    f(n - 1)
    f(n - 1)
    f(n - 1)`,
    answer: "O(3ⁿ)", why: "Three calls per level: (3ⁿ − 1)/2 calls.",
    steps: (n) => (3 ** n - 1) / 2,
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k > 1) { f(k - 1); f(k - 1); f(k - 1); } }; f(n); return c; }, fit: "O(3ⁿ)", exp: true,
  },
  {
    id: "r-fib", group: "Recursion",
    code: `f(n):
    f(n - 1)
    f(n - 2)`,
    answer: "O(2ⁿ)", why: "Branches in two; strictly φⁿ ≈ 1.618ⁿ because one branch is shorter.",
    steps: (n) => 2 * fibN(n + 1) - 1,
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k >= 2) { f(k - 1); f(k - 2); } }; f(n); return c; }, fit: "O(2ⁿ)", exp: true,
  },
  {
    id: "r-two-half", group: "Recursion",
    code: `f(n):
    f(n / 2)
    f(n / 2)`,
    answer: "O(n)", why: "Looks exponential, isn't: 1 + 2 + 4 + … + n ≈ 2n calls.",
    steps: (n) => { const f = (k) => (k > 1 ? 1 + 2 * f(Math.floor(k / 2)) : 1); return f(n); },
    simulate: (n) => { let c = 0; const f = (k) => { c++; if (k > 1) { f(Math.floor(k / 2)); f(Math.floor(k / 2)); } }; f(n); return c; }, fit: "O(n)",
  },
  {
    id: "r-lin-loop", group: "Recursion",
    code: `f(n):
    for i in n
    f(n - 1)`,
    answer: "O(n²)", why: "n + (n−1) + … + 1.",
    steps: (n) => (n * (n + 1)) / 2,
    simulate: (n) => { let c = 0; const f = (k) => { for (let i = 0; i < k; i++) c++; if (k > 1) f(k - 1); }; f(n); return c; }, fit: "O(n²)",
  },
  {
    id: "r-half-loop", group: "Recursion",
    code: `f(n):
    for i in n
    f(n / 2)`,
    answer: "O(n)", why: "n + n/2 + n/4 + … < 2n.",
    steps: (n) => { let s = 0; for (let k = n; k >= 1; k = Math.floor(k / 2)) { s += k; if (k === 1) break; } return s; },
    simulate: (n) => { let c = 0; const f = (k) => { for (let i = 0; i < k; i++) c++; if (k > 1) f(Math.floor(k / 2)); }; f(n); return c; }, fit: "O(n)",
  },
  {
    id: "r-merge", group: "Recursion",
    code: `f(n):
    for i in n
    f(n / 2)
    f(n / 2)`,
    answer: "O(n log n)", why: "n work on each of log n levels. This is merge sort.",
    steps: (n) => { const f = (k) => (k > 1 ? k + 2 * f(Math.floor(k / 2)) : 1); return f(n); },
    simulate: (n) => { let c = 0; const f = (k) => { if (k <= 1) { c++; return; } for (let i = 0; i < k; i++) c++; f(Math.floor(k / 2)); f(Math.floor(k / 2)); }; f(n); return c; }, fit: "O(n log n)",
  },
  {
    id: "r-memo", group: "Recursion",
    code: `memo f(n):
    f(n - 1)
    f(n - 2)`,
    answer: "O(n)", why: "The cache means each n is computed once: n + 1 states.",
    steps: (n) => (n < 2 ? 1 : n + 1),
    simulate: (n) => { let c = 0; const memo = new Map(); const f = (k) => { if (memo.has(k)) return; c++; memo.set(k, true); if (k >= 2) { f(k - 1); f(k - 2); } }; f(n); return c; }, fit: "O(n)",
  },
  {
    id: "r-memo2d", group: "Recursion",
    code: `memo f(i, j):
    f(i - 1, j)
    f(i, j - 1)`,
    answer: "O(n·m)", why: "i in n, j in m: n·m states, each computed once.",
    steps: (n, m) => n * m,
    simulate: (n, m) => {
      let c = 0; const memo = new Set();
      const f = (i, j) => { const key = i * 100000 + j; if (memo.has(key)) return; memo.add(key); c++; if (i > 0) f(i - 1, j); if (j > 0) f(i, j - 1); };
      f(n - 1, m - 1); return c;
    }, fit: "O(n²)",
  },
];

// ─── SPACE ──────────────────────────────────────────────────────────────────
// `steps` here is PEAK extra memory: items held + stack frames open at once.

export const SPACE_SHAPES = [
  // ── Variables and structures
  {
    id: "s-const", group: "Variables and structures",
    code: `total = 0
for i in n:
    total = total + a[i]`,
    answer: "O(1)", why: "One variable, however big a is.",
    steps: () => 1, simulate: () => 1, fit: "O(1)",
  },
  {
    id: "s-set", group: "Variables and structures",
    code: `seen = set()
for i in n:
    seen.add(a[i])`,
    answer: "O(n)", why: "Can end up holding all n items.",
    steps: (n) => n, simulate: (n) => { const s = new Set(); for (let i = 0; i < n; i++) s.add(i); return s.size; }, fit: "O(n)",
  },
  {
    id: "s-grid", group: "Variables and structures",
    code: `grid = [n][m]`,
    answer: "O(n·m)", why: "n rows × m columns.",
    steps: (n, m) => n * m, simulate: (n, m) => Array.from({ length: n }, () => new Array(m).fill(0)).reduce((s, r) => s + r.length, 0), fit: "O(n²)",
  },
  {
    id: "s-row", group: "Variables and structures",
    code: `row = [m]
for i in n:
    update row`,
    answer: "O(m)", why: "Only one row kept — the rolling-array trick. Time is still O(n·m).",
    steps: (n, m) => m, simulate: (n, m) => new Array(m).fill(0).length, fit: "O(n)",
  },
  {
    id: "s-heapk", group: "Variables and structures",
    code: `for i in n:
    heap.push(x)
    if size > k: heap.pop()`,
    answer: "O(k)", why: "Capped at k, however large n gets.",
    steps: (n, m, k = 10) => Math.min(n, k), simulate: null, fit: "O(1)",
  },
  {
    id: "s-bfs", group: "Variables and structures",
    code: `visited = {start}
queue = [start]
while queue:
    push unvisited neighbours`,
    answer: "O(n)", why: "visited can hold every one of the n nodes.",
    steps: (n) => n, simulate: null, fit: "O(n)",
  },
  {
    id: "s-swap", group: "Variables and structures",
    code: `for i in n / 2:
    swap(a[i], a[n - 1 - i])`,
    answer: "O(1)", why: "In place. Changing the input doesn't cost extra memory.",
    steps: () => 1, simulate: () => 1, fit: "O(1)",
  },

  // ── Copies
  {
    id: "s-tmpcopy", group: "Copies",
    code: `for i in n:
    tmp = copy(a)`,
    answer: "O(n)", why: "Only one copy alive at a time — each replaces the last. (Time is O(n²).)",
    steps: (n) => n, simulate: (n) => { let peak = 0; for (let i = 0; i < n; i++) { const tmp = new Array(n).fill(0); peak = Math.max(peak, tmp.length); } return peak; }, fit: "O(n)",
  },
  {
    id: "s-keepcopies", group: "Copies",
    code: `out = []
for i in n:
    out.append(copy(a))`,
    answer: "O(n²)", why: "Every copy is kept: n copies of n items.",
    steps: (n) => n * n, simulate: (n) => { const out = []; for (let i = 0; i < n; i++) out.push(new Array(n).fill(0)); return out.reduce((s, r) => s + r.length, 0); }, fit: "O(n²)",
  },
  {
    id: "s-sorted", group: "Copies",
    code: `b = sorted(a)`,
    answer: "O(n)", why: "A new list. a.sort() reorders in place instead.",
    steps: (n) => n, simulate: (n) => Array.from({ length: n }, (_, k) => n - k).slice().sort((x, y) => x - y).length, fit: "O(n)",
  },

  // ── Recursion depth
  {
    id: "s-rec-lin", group: "Recursion depth",
    code: `f(n):
    f(n - 1)`,
    answer: "O(n)", why: "n calls open at once. Python stops at ~1,000.",
    steps: (n) => n,
    simulate: (n) => { let d = 0, peak = 0; const f = (k) => { d++; peak = Math.max(peak, d); if (k > 1) f(k - 1); d--; }; f(n); return peak; }, fit: "O(n)",
  },
  {
    id: "s-rec-half", group: "Recursion depth",
    code: `f(n):
    f(n / 2)`,
    answer: "O(log n)", why: "Only log n calls deep.",
    steps: (n) => floorLog(n) + 1,
    simulate: (n) => { let d = 0, peak = 0; const f = (k) => { d++; peak = Math.max(peak, d); if (k > 1) f(Math.floor(k / 2)); d--; }; f(n); return peak; }, fit: "O(log n)",
  },
  {
    id: "s-rec-two", group: "Recursion depth",
    code: `f(n):
    f(n - 1)
    f(n - 1)`,
    answer: "O(n)", why: "2ⁿ calls in total, but only one chain of n is open at a time.",
    steps: (n) => n,
    simulate: (n) => { let d = 0, peak = 0; const f = (k) => { d++; peak = Math.max(peak, d); if (k > 1) { f(k - 1); f(k - 1); } d--; }; f(n); return peak; }, fit: "O(n)", small: true,
  },
  {
    id: "s-rec-two-half", group: "Recursion depth",
    code: `f(n):
    f(n / 2)
    f(n / 2)`,
    answer: "O(log n)", why: "Depth is what matters, and it's log n.",
    steps: (n) => floorLog(n) + 1,
    simulate: (n) => { let d = 0, peak = 0; const f = (k) => { d++; peak = Math.max(peak, d); if (k > 1) { f(Math.floor(k / 2)); f(Math.floor(k / 2)); } d--; }; f(n); return peak; }, fit: "O(log n)",
  },
  {
    id: "s-rec-index", group: "Recursion depth",
    code: `f(a, i):
    f(a, i + 1)`,
    answer: "O(n)", why: "n frames, each holding just an index.",
    steps: (n) => n,
    simulate: (n) => { let d = 0, peak = 0; const f = (i) => { d++; peak = Math.max(peak, d); if (i < n - 1) f(i + 1); d--; }; f(0); return peak; }, fit: "O(n)",
  },
  {
    id: "s-rec-slice", group: "Recursion depth",
    code: `f(a):
    f(a[1:])`,
    answer: "O(n²)", why: "Every open frame keeps its own slice: n + (n−1) + … + 1.",
    steps: (n) => (n * (n + 1)) / 2,
    simulate: (n) => { let live = 0, peak = 0; const f = (a) => { live += a.length; peak = Math.max(peak, live); if (a.length > 1) f(a.slice(1)); live -= a.length; }; f(new Array(n).fill(0)); return peak; }, fit: "O(n²)",
  },
  {
    id: "s-memo", group: "Recursion depth",
    code: `memo f(n):
    f(n - 1)
    f(n - 2)`,
    answer: "O(n)", why: "n frames on the way down; the cache fills as they unwind, so the peak is about n.",
    steps: (n) => n,
    simulate: (n) => { let d = 0, peak = 0; const memo = new Set(); const f = (k) => { d++; peak = Math.max(peak, d + memo.size); if (k >= 2 && !memo.has(k)) { f(k - 1); f(k - 2); memo.add(k); } d--; }; f(n); return Math.max(peak, memo.size); }, fit: "O(n)",
  },

  // ── Output
  {
    id: "s-output", group: "Output",
    code: `out = all subsets of a`,
    answer: "O(n·2ⁿ)", why: "2ⁿ subsets of up to n items each. Usually quoted as \"O(n) extra, plus the output\".",
    steps: (n) => n * 2 ** (n - 1), simulate: null, fit: null, exp: true,
  },
];

// Size each card reports at. Exponential shapes use a small n so the number
// is still readable.
export const DISPLAY = { n: 1000, m: 2000, k: 10, nExp: 20 };
