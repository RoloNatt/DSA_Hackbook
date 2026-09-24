import { TIME_SHAPES, SPACE_SHAPES, DISPLAY } from "../../data/loopShapes.js";
import { fitClass } from "../complexity.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);

const doubling = (from, to) => { const o = []; for (let n = from; n <= to; n *= 2) o.push(n); return o; };
const linear = (from, to, step) => { const o = []; for (let n = from; n <= to; n += step) o.push(n); return o; };
const isCubic = (s) => /³/.test(s.answer) || s.id === "t-cube-tri";
const isExpSim = (s) => s.exp || s.id === "s-rec-two";

// ─── 1. Each card's displayed count equals a literal run of its pseudocode ───

for (const [kind, list] of [["time", TIME_SHAPES], ["space", SPACE_SHAPES]]) {
  for (const s of list) {
    if (!s.simulate) continue;
    const ns = isExpSim(s) ? [1, 2, 3, 5, 8, 11] : isCubic(s) ? [1, 2, 3, 7, 16, 31] : [1, 2, 3, 7, 16, 33, 100, 257];
    const bad = [];
    for (const n of ns) {
      for (const m of [n, 2 * n + 1, Math.max(1, Math.floor(n / 2))]) {
        const a = s.simulate(n, m), b = s.steps(n, m);
        if (a !== b) bad.push(`n=${n},m=${m}: simulated ${a} vs card ${b}`);
      }
    }
    ok(`${kind.padEnd(5)} ${s.id.padEnd(16)} card count == literal loops`, bad.length === 0, bad.slice(0, 2).join("; "));
  }
}

// ─── 2. Fitting the count against n recovers the stated class ───────────────
// Two-variable shapes are fitted with m = n, so O(n·m) is expected to read O(n²).

for (const [kind, list] of [["time", TIME_SHAPES], ["space", SPACE_SHAPES]]) {
  for (const s of list) {
    if (!s.fit) continue;
    const ns = s.exp ? linear(4, 22, 2) : doubling(16, 65536);
    const pts = ns.map((n) => ({ n, ops: s.steps(n, n) }));
    const f = fitClass(pts, "ops");
    ok(`${kind.padEnd(5)} ${s.id.padEnd(16)} fits ${f.label.padEnd(10)}`, f.label === s.fit,
      `card says ${s.answer}${f.exponential ? `; measured base ${f.base.toFixed(3)}` : ""}`);
  }
}

// ─── 3. The numbers quoted in the explanations ───────────────────────────────

const T = Object.fromEntries(TIME_SHAPES.map((s) => [s.id, s]));
const S = Object.fromEntries(SPACE_SHAPES.map((s) => [s.id, s]));
const at = (s) => s.steps(s.exp ? DISPLAY.nExp : DISPLAY.n, DISPLAY.m, DISPLAY.k);

ok("for i in n / for j in range(i, n) at n=1,000 → 500,500", at(T["t-tri"]) === 500500, `${at(T["t-tri"])}`);
ok("for i in n / for j in range(i, m) at n=1,000, m=2,000 → 1,500,500 = n·m − n(n−1)/2",
  at(T["t-tri-m"]) === 1000 * 2000 - (1000 * 999) / 2 && at(T["t-tri-m"]) === 1500500, `${at(T["t-tri-m"])}`);
ok("range(i, m) when m < n: only the first m rows do any work",
  T["t-tri-m"].steps(1000, 10) === (10 * 11) / 2, `n=1000, m=10 → ${T["t-tri-m"].steps(1000, 10)}`);
ok("pairs at 1,000 → 499,500", at(T["t-pairs"]) === 499500);
ok("halving 1,000 → 9 steps; doubling to 1,000 → 10", at(T["t-halve"]) === 9 && at(T["t-double"]) === 10,
  `${at(T["t-halve"])} / ${at(T["t-double"])}`);
ok("√1000 → 31 steps", at(T["t-sqrt"]) === 31);
ok("geometric trap at 1,000 → 1,994, under 2n", at(T["t-geo"]) === 1994 && at(T["t-geo"]) < 2000, `${at(T["t-geo"])}`);
ok("f(n/2) twice at 1,000 → under 2n calls (not exponential)", at(T["r-two-half"]) < 2000, `${at(T["r-two-half"])}`);
ok("f(n-1) twice at n=20 → 1,048,575 calls = 2²⁰ − 1", at(T["r-two"]) === 2 ** 20 - 1, `${at(T["r-two"])}`);
ok("naive fib shape at n=20 → 21,891 calls", at(T["r-fib"]) === 21891, `${at(T["r-fib"])}`);
ok("space: f(n-1) twice is only n deep, not 2ⁿ", S["s-rec-two"].simulate(12) === 12, `depth ${S["s-rec-two"].simulate(12)} at n=12 (4,095 calls)`);
ok("space: f(a[1:]) at 1,000 → 500,500 items alive", at(S["s-rec-slice"]) === 500500);
ok("space: memoised recursion peaks at n, not 2n", [5, 20, 60].every((n) => S["s-memo"].simulate(n) === n),
  [5, 20, 60].map((n) => `n=${n}→${S["s-memo"].simulate(n)}`).join(" "));
ok("space: temp copy each iteration is O(n), keeping them is O(n²)",
  S["s-tmpcopy"].simulate(300) === 300 && S["s-keepcopies"].simulate(300) === 90000);

// ─── 4. The cards really are minimal ────────────────────────────────────────

const all = [...TIME_SHAPES, ...SPACE_SHAPES];
ok("no card is longer than 4 lines of pseudocode", all.every((s) => s.code.split("\n").length <= 4),
  all.filter((s) => s.code.split("\n").length > 4).map((s) => s.id).join(",") || `${all.length} cards`);
ok("no blank lines, no comments, no 'def', no 'return'",
  all.every((s) => !/\n\s*\n/.test(s.code) && !/#/.test(s.code) && !/\bdef\b|\breturn\b/.test(s.code)));
ok("a line ends in ':' only if something is nested under it",
  all.every((s) => {
    const lines = s.code.split("\n");
    return lines.every((l, i) => {
      const indent = (x) => x.match(/^\s*/)[0].length;
      const hasChild = i + 1 < lines.length && indent(lines[i + 1]) > indent(l);
      return l.trimEnd().endsWith(":") === hasChild || /if size > k: heap.pop\(\)/.test(l);
    });
  }),
  all.filter((s) => { const L = s.code.split("\n"); return L.some((l, i) => l.trimEnd().endsWith(":") !== (i + 1 < L.length && L[i + 1].search(/\S/) > l.search(/\S/)) && !/if size > k/.test(l)); }).map((s) => s.id).join(",") || "all consistent");
ok("every card has an answer and a one-line reason", all.every((s) => s.answer && s.why && !s.why.includes("\n")));
ok("ids are unique", new Set(all.map((s) => s.id)).size === all.length, `${TIME_SHAPES.length} time + ${SPACE_SHAPES.length} space`);
