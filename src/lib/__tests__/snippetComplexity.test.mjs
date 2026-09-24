import { CODE_SNIPPETS } from "../../data/snippets.js";
import { SNIPPET_COMPLEXITY, complexityHeader } from "../../data/snippetComplexity.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);

// Inner helpers that are part of another function's cost, not separate entries.
const HELPERS = new Set(["__init__", "_walk", "can_finish", "dfs", "sink", "bt", "find", "can", "fib"]);

ok("every template has a complexity entry",
  CODE_SNIPPETS.every((s) => SNIPPET_COMPLEXITY[s.id]?.length > 0),
  CODE_SNIPPETS.filter((s) => !SNIPPET_COMPLEXITY[s.id]).map((s) => s.id).join(",") || "all 25");

ok("no complexity entry for a template that doesn't exist",
  Object.keys(SNIPPET_COMPLEXITY).every((id) => CODE_SNIPPETS.some((s) => s.id === id)));

for (const s of CODE_SNIPPETS) {
  if (s.id === "python_toolkit") continue;      // operations, not functions
  const defs = [...s.code.matchAll(/^\s*def\s+(\w+)/gm)].map((m) => m[1]).filter((d) => !HELPERS.has(d));
  const covered = SNIPPET_COMPLEXITY[s.id].map((r) => r.fn).join(" | ");
  const missing = defs.filter((d) => !covered.includes(d));
  // union_find / lru_design use "find / union" and "get / put" style combined labels
  ok(`${s.id.padEnd(16)} every public function annotated`, missing.length === 0,
    missing.length ? `missing: ${missing.join(", ")}` : defs.join(", "));
}

ok("every entry has time, space and a reason",
  Object.values(SNIPPET_COMPLEXITY).flat().every((r) => r.fn && r.time && r.space && r.why && r.why.length > 20));

{
  const h = complexityHeader("hashmap");
  ok("header is a valid block of Python comments", h.split("\n").filter(Boolean).every((l) => l.startsWith("#")), `\n${h}`);
}
