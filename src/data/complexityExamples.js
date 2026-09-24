// Time and space complexity, explained through real Python.
//
// Each group introduces ONE rule. Each snippet is short, annotated with what
// each line costs, and ends in an explicit answer. Every number quoted here was
// produced by running the code (see the loopShapes and complexity tests).

// ─── TIME ───────────────────────────────────────────────────────────────────

export const TIME_EXAMPLES = [
  {
    h: "O(1) — no loop",
    items: [
      {
        code: `def first(nums):
    return nums[0]          # 1 step, whether nums has 10 items or 10 million

def lookup(d, key):
    return d[key]           # dict/set lookup: 1 step on average`,
        time: "O(1)",
        note: "Nothing repeats as n grows.",
      },
    ],
  },
  {
    h: "O(n) — one loop",
    items: [
      {
        code: `def total(nums):
    s = 0
    for x in nums:          # runs n times
        s += x              # 1 step each
    return s`,
        time: "O(n)",
        note: "n iterations × 1 step.",
      },
    ],
  },
  {
    h: "Loops one after another ADD",
    items: [
      {
        code: `def f(nums):
    for x in nums: print(x)     # n
    for x in nums: print(x)     # n`,
        time: "O(n)",
        note: "n + n = 2n, and constants drop. Not O(n²) — they are not nested.",
      },
    ],
  },
  {
    h: "Loops inside loops MULTIPLY",
    items: [
      {
        code: `def pairs(nums):
    for i in range(len(nums)):          # n times
        for j in range(len(nums)):      # n times, for EACH i
            print(nums[i], nums[j])`,
        time: "O(n²)",
        note: "At n = 1,000 the inner line runs 1,000,000 times.",
      },
      {
        code: `for i in range(n):
    for j in range(i + 1, n):     # inner loop shrinks: n−1, n−2, …, 1
        ...`,
        time: "O(n²)",
        note: "At n = 1,000 this is 499,500 runs — exactly n(n−1)/2. Halving n² still leaves n².",
      },
    ],
  },
  {
    h: "Only multiply by what actually GROWS",
    items: [
      {
        code: `def neighbours(grid_cells):
    for cell in grid_cells:                          # n times
        for dr, dc in [(0,1), (1,0), (0,-1), (-1,0)]:   # always 4
            ...`,
        time: "O(n)",
        note: "n × 4. The inner loop never grows, so it's a constant.",
      },
      {
        code: `def f(a, b):
    for x in a:             # len(a) times
        for y in b:         # len(b) times
            ...`,
        time: "O(a·b)",
        note: "Two different inputs get two different letters. Calling this O(n²) is a common mistake.",
      },
    ],
  },
  {
    h: "Halving → log n",
    items: [
      {
        code: `def halvings(n):
    steps = 0
    while n > 1:
        n //= 2             # throw away half every time
        steps += 1
    return steps`,
        time: "O(log n)",
        note: "From n = 1,000,000 this finishes in 19 steps. Binary search is the same shape.",
      },
      {
        code: `for i in range(n):          # n times
    j = n
    while j > 1:            # log n times each
        j //= 2`,
        time: "O(n log n)",
        note: "n × log n — the same as sorting. At n = 1,000,000 that's about 20 million steps, against 10¹² for O(n²).",
      },
    ],
  },
  {
    h: "Hidden costs — lines that look O(1) but aren't",
    items: [
      {
        code: `def dedupe(nums):
    seen = []
    for x in nums:              # n times
        if x not in seen:       # ← scans the whole list: O(n)
            seen.append(x)
    return seen`,
        time: "O(n²)",
        note: "One visible loop, but `in` on a list is a second, hidden loop. Change seen = [] to seen = set() and it becomes O(n).",
      },
      {
        code: `for i in range(n):
    prefix = nums[:i]           # ← a slice COPIES i items`,
        time: "O(n²)",
        note: "A slice looks like one step but copies every item it covers: 0 + 1 + … + (n−1).",
      },
    ],
  },
  {
    h: "The reverse trap — nested, but O(n)",
    items: [
      {
        code: `def longest_unique(s):
    seen, left, best = set(), 0, 0
    for right in range(len(s)):         # n times
        while s[right] in seen:         # nested… but left only moves FORWARD
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        best = max(best, right - left + 1)
    return best`,
        time: "O(n)",
        note: "left starts at 0 and can never pass n, so the inner loop runs at most n times IN TOTAL. Outer + inner ≤ 2n. Ask how many times the inner loop runs overall — not how deeply it's nested.",
      },
    ],
  },
  {
    h: "Recursion — calls × work per call",
    items: [
      {
        code: `def fib(n):
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)      # 2 new calls per call`,
        time: "O(2ⁿ)",
        note: "Every call branches in two, about n deep. fib(30) makes 2,692,537 calls.",
      },
      {
        code: `from functools import lru_cache

@lru_cache(None)
def fib(n):
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)`,
        time: "O(n)",
        note: "Same code plus a cache: each distinct n is computed once. The body now runs 31 times — once for each n from 0 to 30. Memoised cost = distinct states × work per state.",
      },
    ],
  },
];

// ─── SPACE ──────────────────────────────────────────────────────────────────

export const SPACE_EXAMPLES = [
  {
    h: "O(1) — a few variables",
    items: [
      {
        code: `def find_max(nums):
    best = nums[0]          # one variable, however big nums is
    for x in nums:
        best = max(best, x)
    return best`,
        space: "O(1)",
        note: "The input doesn't count — only what you create.",
      },
    ],
  },
  {
    h: "O(n) — a structure that can hold everything",
    items: [
      {
        code: `def has_duplicate(nums):
    seen = set()            # can end up holding all n items
    for x in nums:
        if x in seen: return True
        seen.add(x)
    return False`,
        space: "O(n)",
        note: "seen grows with the input.",
      },
    ],
  },
  {
    h: "O(m·n) — a 2D table, and how to shrink it",
    items: [
      {
        code: `def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]            # m × n cells
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[-1][-1]`,
        space: "O(m·n)",
        note: "The full table.",
      },
      {
        code: `def unique_paths(m, n):
    row = [1] * n                               # n cells only
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]`,
        space: "O(n)",
        time: "O(m·n)",
        note: "Each row only reads the row above it, so keep one row. Same time, far less memory — the \"rolling array\" follow-up.",
      },
    ],
  },
  {
    h: "Recursion uses space — even with no data structures",
    items: [
      {
        code: `def total(nums, i=0):
    if i == len(nums): return 0
    return nums[i] + total(nums, i + 1)     # each open call is a stack frame`,
        space: "O(n)",
        note: "No lists, no sets — but n calls are open at once. total([1] * 2000) raises RecursionError: Python stops at 1,000 frames by default.",
      },
      {
        code: `def fib(n):                                 # the naive one
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)`,
        time: "O(2ⁿ)",
        space: "O(n)",
        note: "Space is how many calls are open AT THE SAME TIME, not how many happen in total. Only one root-to-leaf chain is ever open.",
      },
      {
        code: `def max_depth(node):
    if not node: return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))`,
        space: "O(h)",
        note: "h is the tree's height: log n if balanced, n if it's a chain. Same code, different space.",
      },
    ],
  },
  {
    h: "Copies count",
    items: [
      {
        code: `def total(nums):
    if not nums: return 0
    return nums[0] + total(nums[1:])        # ← each call makes a new slice`,
        time: "O(n²)",
        space: "O(n²)",
        note: "Every open frame keeps its own slice alive. At n = 1,000 that's 500,500 items in memory at the deepest point. The index version above is O(n) for both.",
      },
    ],
  },
];

// ─── THE TRADE-OFF ──────────────────────────────────────────────────────────

export const TRADE_OFF = {
  h: "The trade-off you'll be asked about",
  items: [
    {
      code: `def two_sum(nums, target):                  # brute force
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`,
      time: "O(n²)", space: "O(1)",
      note: "No extra memory, quadratic time.",
    },
    {
      code: `def two_sum(nums, target):                  # hashmap
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i`,
      time: "O(n)", space: "O(n)",
      note: "Say it out loud: \"I'm trading O(n) memory for going from O(n²) to O(n) time.\" If the interviewer asks for less memory, that's usually a hint to trade back.",
    },
  ],
};

// ─── SUMMARY ────────────────────────────────────────────────────────────────

export const SUMMARY = {
  headers: ["Code shape", "Time", "Space"],
  rows: [
    ["no loop, dict/set lookup", "O(1)", "O(1)"],
    ["one loop", "O(n)", "O(1) unless you store things"],
    ["loop inside loop", "O(n²)", "O(1) unless you store things"],
    ["inner loop over a constant", "O(n)", "—"],
    ["halving each step", "O(log n)", "O(1) iterative, O(log n) recursive"],
    ["sort", "O(n log n)", "O(n) for sorted()"],
    ["`x in list` or a slice inside a loop", "O(n²)", "—"],
    ["pointer that only moves forward", "O(n) total", "—"],
    ["recursion, b branches, depth d", "O(bᵈ)", "O(d)"],
    ["memoised recursion", "O(states × work)", "O(states)"],
    ["set/dict of every item", "—", "O(n)"],
    ["m × n table", "O(m·n)", "O(m·n), or O(n) with a rolling row"],
  ],
};
