import * as C from "../complexity.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);
const A = Object.fromEntries(C.ALGORITHMS.map((a) => [a.id, a]));
const run = (id, n) => A[id].run(n);
const fibN = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
const choose3 = (n) => (n * (n - 1) * (n - 2)) / 6;

// ─── Every count against its closed-form formula ────────────────────────────
// These are derived by hand, independently of the instrumented code.

ok("first item: exactly 1 op at any n", [16, 1024, 65536].every((n) => run("first", n).ops === 1));

ok("binary search (absent target): floor(log2 n) + 1 probes",
  [16, 1000, 1024, 65536].every((n) => run("binary", n).ops === Math.floor(Math.log2(n)) + 1),
  [16, 1000, 1024, 65536].map((n) => `n=${n}→${run("binary", n).ops}`).join(" "));
ok("binary search on a million items is ~20 probes (the claim in the Big-O notes)",
  run("binary", 1_000_000).ops === 20, `${run("binary", 1_000_000).ops}`);

ok("find max: exactly n", [16, 4096].every((n) => run("linear", n).ops === n));

ok("set duplicate check: n ops, n space (no duplicates = worst case)",
  [16, 4096].every((n) => run("hashdup", n).ops === n && run("hashdup", n).space === n));

{
  const r = [256, 4096, 65536].map((n) => ({ n, ...run("window", n) }));
  ok("sliding window: between n and 2n ops despite the nested while",
    r.every((x) => x.ops >= x.n && x.ops <= 2 * x.n),
    r.map((x) => `n=${x.n}→${x.ops} (${(x.ops / x.n).toFixed(3)}n)`).join(" "));
  ok("sliding window: space capped at 26 by the alphabet", r.every((x) => x.space <= 26), r.map((x) => x.space).join(","));
}

ok("halving loop: exactly n·log2(n) for powers of two",
  [16, 1024, 65536].every((n) => run("halvingloop", n).ops === n * Math.log2(n)));

{
  const r = [16, 1024, 65536].map((n) => ({ n, ...run("mergesort", n) }));
  ok("merge sort: comparisons between (n/2)·log2 n and n·log2 n",
    r.every((x) => x.ops >= (x.n / 2) * Math.log2(x.n) && x.ops <= x.n * Math.log2(x.n)),
    r.map((x) => `n=${x.n}→${x.ops} (${(x.ops / (x.n * Math.log2(x.n))).toFixed(3)}·n log n)`).join(" "));
  ok("merge sort: space = n (merge buffer) + log2 n (recursion)",
    r.every((x) => x.space === x.n + Math.log2(x.n)), r.map((x) => x.space).join(","));
}

ok("all pairs: exactly n(n-1)/2", [16, 1000, 4096].every((n) => run("pairs", n).ops === (n * (n - 1)) / 2));
ok("x in list: exactly n(n-1)/2 — same as all pairs", [16, 4096].every((n) => run("inlist", n).ops === (n * (n - 1)) / 2));
ok("x in list: holds n items", [16, 4096].every((n) => run("inlist", n).space === n));
ok("slice in loop: exactly n(n-1)/2 items copied", [16, 4096].every((n) => run("slice", n).ops === (n * (n - 1)) / 2));
ok("slice in loop: largest slice is n-1", [16, 4096].every((n) => run("slice", n).space === n - 1));
ok("triple loop: exactly C(n,3)", [8, 100, 256].every((n) => run("triple", n).ops === choose3(n)));

ok("naive fib: exactly 2·F(n+1) − 1 calls",
  [4, 10, 20, 24].every((n) => run("fibnaive", n).ops === 2 * fibN(n + 1) - 1),
  [4, 10, 20, 24].map((n) => `fib(${n})→${run("fibnaive", n).ops} calls`).join(" "));
ok("naive fib: recursion depth n", [4, 10, 20].every((n) => run("fibnaive", n).space === n));
ok("memo fib: exactly 2n − 1 calls (cache hits counted, as lru_cache does)",
  [16, 256, 2048].every((n) => run("fibmemo", n).ops === 2 * n - 1),
  [16, 256, 2048].map((n) => `fib(${n})→${run("fibmemo", n).ops}`).join(" "));
ok("memo fib: TRUE simultaneous peak is n — the cache fills as the stack unwinds",
  [16, 256, 2048].every((n) => run("fibmemo", n).space === n), [16, 256, 2048].map((n) => `n=${n}→${run("fibmemo", n).space}`).join(" "));
ok("fib(30) naive vs memo: 2,692,537 calls vs 59",
  run("fibnaive", 30).ops === 2692537 && run("fibmemo", 30).ops === 59,
  `${run("fibnaive", 30).ops.toLocaleString()} vs ${run("fibmemo", 30).ops}`);

ok("subsets: exactly 2^(n+1) − 1 calls", [4, 10, 20].every((n) => run("subsets", n).ops === 2 ** (n + 1) - 1));
ok("subsets: space = (n+1) frames + n path = 2n+1", [4, 20].every((n) => run("subsets", n).space === 2 * n + 1));

ok("balanced tree: visits every node once", [16, 1000, 65536].every((n) => run("treebal", n).ops === n));
ok("balanced tree: depth = ceil(log2(n+1))",
  [15, 16, 1000, 65535, 65536].every((n) => run("treebal", n).space === Math.ceil(Math.log2(n + 1))),
  [15, 16, 1000, 65536].map((n) => `n=${n}→${run("treebal", n).space}`).join(" "));
ok("skewed tree: same n visits, but depth n", [16, 65536].every((n) => run("treeskew", n).ops === n && run("treeskew", n).space === n));

// ─── The fitter recovers the declared class from measurements alone ──────────

for (const a of C.ALGORITHMS) {
  const pts = C.measure(a);
  const t = C.fitClass(pts, "ops");
  ok(`fit TIME  ${a.id.padEnd(12)} → ${t.label}${t.exponential ? " " + t.baseLabel : ""}`, t.label === a.time,
    `declared ${a.time}${t.scores.length ? `; runner-up ${t.scores[1].label}` : ""}`);
}
for (const a of C.ALGORITHMS) {
  const pts = C.measure(a);
  const s = C.fitClass(pts, "space");
  ok(`fit SPACE ${a.id.padEnd(12)} → ${s.label}`, s.label === a.space, `declared ${a.space}`);
}

{
  const t = C.fitClass(C.measure(A.fibnaive), "ops");
  ok("naive fib's measured growth base is the golden ratio", Math.abs(t.base - 1.618) < 0.02, `base ${t.base.toFixed(4)}`);
  const s = C.fitClass(C.measure(A.subsets), "ops");
  ok("subsets' measured growth base is 2", Math.abs(s.base - 2) < 0.02, `base ${s.base.toFixed(4)}`);
}

// ─── The doubling test ──────────────────────────────────────────────────────

const lastRatio = (id) => { const d = C.doublingRatio(C.measure(A[id])); return d[d.length - 1]; };
{
  const cases = [
    ["first", /O\(1\)/], ["binary", /O\(log n\)/], ["linear", /O\(n\)$/], ["halvingloop", /O\(n log n\)/],
    ["mergesort", /O\(n log n\)/], ["pairs", /O\(n²\)/], ["triple", /O\(n³\)/], ["window", /O\(n\)$/],
  ];
  for (const [id, re] of cases) {
    const d = lastRatio(id);
    const txt = C.interpretRatio(d.ratio, d.added);
    ok(`doubling ${id.padEnd(12)} n ${d.from}→${d.to}: ×${d.ratio.toFixed(3)} reads "${txt}"`, re.test(txt));
  }
}

// ─── Determinism ────────────────────────────────────────────────────────────
ok("every algorithm is deterministic",
  C.ALGORITHMS.every((a) => JSON.stringify(a.run(a.ns[1])) === JSON.stringify(a.run(a.ns[1]))));
ok("every algorithm declares code, a lesson, and a time and space class",
  C.ALGORITHMS.every((a) => a.code && a.lesson && a.time && a.space && a.ns.length >= 5));
