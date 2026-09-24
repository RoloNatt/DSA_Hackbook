// Time & space complexity: what it means, how to work it out, and practice.
//
// Ordered the way it should be learned: the idea first (one concrete story),
// then the procedure for time, then for space, then worked examples, then a
// quiz. The numbers quoted here are checked by src/lib/__tests__/complexity.test.mjs.

// ─── 1. WHAT BIG-O MEANS ────────────────────────────────────────────────────

export const INTRO = {
  hook:
    "You have a list of customer phone numbers and want to know whether any number appears twice. Two ways to do it: compare every pair, or walk through once putting each number into a set and stop if it's already there.",
  table: {
    headers: ["Phone numbers", "Compare every pair", "Use a set"],
    rows: [
      ["1,000", "~500,000 checks → 0.005 s", "1,000 steps → instant"],
      ["100,000", "~5,000,000,000 checks → ~50 s", "100,000 steps → 0.001 s"],
    ],
  },
  readout:
    "Both approaches got 100× more data. The set did 100× more work. Comparing pairs did about 10,000× more work. At 1,000 numbers you would never notice the difference; at 100,000 one of them is unusable.",
  formal:
    "Big-O describes how the work GROWS as the input grows. Comparing pairs is O(n²); the set is O(n). Constants are dropped — the pair method is really n²/2 checks, but it is still O(n²), because at large sizes only the shape of the growth matters.",
  ladder: {
    headers: ["Big-O", "Name", "Work at n = 100,000", "Where it comes from"],
    rows: [
      ["O(1)", "constant", "1", "array index, dict/set lookup"],
      ["O(log n)", "logarithmic", "~17", "halving: binary search, balanced tree height"],
      ["O(n)", "linear", "100,000", "one pass over the data"],
      ["O(n log n)", "linearithmic", "~1,700,000", "sorting; n items × a halving step each"],
      ["O(n²)", "quadratic", "10,000,000,000", "a loop over n inside a loop over n"],
      ["O(2ⁿ)", "exponential", "more than the atoms in the universe", "trying every subset; branching recursion"],
      ["O(n!)", "factorial", "unthinkable", "trying every ordering"],
    ],
  },
  cases: [
    { h: "Worst, average, best", body: "Big-O usually means the WORST case, and that is what interviewers want unless they say otherwise. When average and worst genuinely differ, say both: \"hash lookup is O(1) on average, O(n) worst case if everything collides\"; \"quicksort is O(n log n) average, O(n²) worst\"." },
    { h: "Amortized", body: "Occasionally expensive, cheap on average across many operations. list.append is O(1) amortized: once in a while the list doubles its storage (O(n)), but spread over all the appends that averages to O(1) each. The sliding window's inner while loop is the same idea — see the Worked Examples." },
    { h: "Big-O vs Θ and Ω", body: "Strictly, O is an upper bound, Ω a lower bound and Θ a tight bound. In interviews \"Big-O\" is used to mean the tight worst case. You do not need to correct anyone — just give the tightest bound you can justify." },
  ],
};

// ─── 2. WORKING OUT TIME ────────────────────────────────────────────────────

export const TIME_METHOD = [
  { step: "Name your variables", body: "Say what n is: \"n is the length of nums\". Two different inputs get two letters — n and m — never both called n." },
  { step: "Find every loop and every recursive call", body: "Those are the only places work multiplies. Straight-line code with no loops is O(1)." },
  { step: "For each loop, ask how many times it ACTUALLY runs", body: "Not \"is it nested?\" but \"how many iterations, as a function of n?\". A loop over 4 directions is O(1). A loop that halves is O(log n). An inner loop whose pointer only ever moves forward runs O(n) times in TOTAL, not per outer iteration." },
  { step: "Nested multiplies, sequential adds", body: "A loop inside a loop: multiply their counts. One loop after another: add them. Then keep only the biggest term." },
  { step: "Look inside the loop body for hidden costs", body: "sort() is O(n log n). `x in list` is O(n). A slice a[i:j] copies j−i items. list.insert(0, x) shifts everything. A call to your own helper costs whatever that helper costs." },
  { step: "For recursion: calls × work per call", body: "Without memoization, calls ≈ branches^depth — two branches, depth n → O(2ⁿ). With memoization, calls ≈ number of DISTINCT states — so O(states × work per state)." },
  { step: "Drop constants and smaller terms", body: "3n² + 5n + 100 → O(n²). 2n → O(n). n + log n → O(n)." },
  { step: "Sanity-check against the constraints", body: "If your answer is O(n²) and n can be 10⁵, it will not pass. Go back to step 3." },
];

export const TIME_RULES = {
  headers: ["If the code looks like…", "Time", "Why"],
  rows: [
    ["one loop over n", "O(n)", "n iterations of constant work"],
    ["two loops, one after the other", "O(n)", "n + n = 2n; constants drop"],
    ["a loop over n inside a loop over n", "O(n²)", "n × n"],
    ["an inner loop over a CONSTANT (4 directions, 26 letters)", "O(n)", "n × 4 is still linear"],
    ["loop over a, nested loop over b", "O(a·b)", "different inputs → different letters, not n²"],
    ["loop over a, then separately over b", "O(a + b)", "sequential adds"],
    ["i doubles (or n halves) each step", "O(log n)", "you can halve n only log₂n times"],
    ["loop n times, halving inside", "O(n log n)", "n × log n"],
    ["sort, then one pass", "O(n log n)", "n log n + n; the sort dominates"],
    ["two pointers / sliding window, pointers only move forward", "O(n) amortized", "each pointer moves at most n times in total"],
    ["recursion: b branches, depth d", "O(bᵈ)", "the call tree has about bᵈ leaves"],
    ["memoized recursion", "O(states × work per state)", "each distinct input is computed once"],
    ["BFS / DFS on a graph", "O(V + E)", "each node and each edge handled once"],
    ["BFS / DFS on an R × C grid", "O(R·C)", "each cell visited once, 4 neighbours each"],
    ["heap of size k, n pushes/pops", "O(n log k)", "log k per heap operation"],
    ["you must OUTPUT X items", "at least O(X)", "you cannot produce an answer faster than you can write it"],
  ],
};

// ─── 3. WORKING OUT SPACE ───────────────────────────────────────────────────

export const SPACE_METHOD = [
  { step: "Count only what YOU allocate", body: "This is auxiliary space. The input usually does not count against you. Say which convention you are using: \"O(1) extra space, not counting the input\"." },
  { step: "For each structure you create, ask how big it can get", body: "A few variables: O(1). A set, dict or list that might hold every item: O(n). An m × n DP table: O(m·n). A heap capped at k: O(k)." },
  { step: "Recursion is space too", body: "Every active call is a stack frame. Space is at least the MAXIMUM recursion depth — not the total number of calls. Naive Fibonacci makes 2ⁿ calls but only ever has n of them open at once, so its space is O(n)." },
  { step: "Copies count", body: "Slices (a[i:j]), sorted(a), s[::-1], list comprehensions and string building all allocate new memory. a.sort() does not create a second list; sorted(a) does." },
  { step: "Decide about the output", body: "If the task is to return every subset, the output is O(n·2ⁿ) no matter what. Usually you state space EXCLUDING the required output: \"O(n) extra, plus the output\"." },
  { step: "Remember Python's recursion limit", body: "Python stops at about 1,000 nested calls by default. O(n) recursion depth with n = 10⁵ does not run slowly — it crashes with RecursionError. For deep trees, long linked lists or big grids, use an explicit stack or BFS." },
];

export const SPACE_RULES = {
  headers: ["If the code creates…", "Space", "Note"],
  rows: [
    ["a fixed number of variables", "O(1)", "counters, pointers, a running sum"],
    ["a set / dict / list that can hold every item", "O(n)", "the usual price of O(1) lookups"],
    ["an m × n DP table", "O(m·n)", "often reducible to O(n) by keeping only the previous row"],
    ["recursion of depth d", "O(d)", "one frame per open call"],
    ["recursion on a balanced tree", "O(log n)", "depth is the height"],
    ["recursion on a skewed tree / linked list", "O(n)", "height equals n — and crashes Python past ~1,000"],
    ["a BFS queue", "O(width)", "up to the widest level; O(R·C) worst case on a grid"],
    ["a heap capped at size k", "O(k)", "top-k patterns"],
    ["a memo over s distinct states", "O(s)", "the cost of turning exponential into polynomial"],
    ["a slice or copy of k items", "O(k)", "while it is alive"],
    ["sorted(a)", "O(n)", "a new list; a.sort() avoids the copy (Timsort may still use up to n/2 scratch)"],
  ],
};

// ─── 4. WORKED EXAMPLES ─────────────────────────────────────────────────────
// Each one is annotated line by line, then the answer is derived — not stated.

export const WORKED = [
  {
    id: "twosum", title: "Two Sum with a dictionary", rule: "One loop, O(1) work inside",
    code: `def two_sum(nums, target):
    seen = {}                          # O(1) to create
    for i, x in enumerate(nums):       # runs n times
        if target - x in seen:         # O(1) average (hash lookup)
            return [seen[target - x], i]
        seen[x] = i                    # O(1) average; dict grows by 1
    return []`,
    steps: [
      "n = len(nums).",
      "One loop, n iterations.",
      "Inside: a dict lookup and a dict insert, both O(1) on average.",
      "Time: n × O(1) = O(n).",
      "Space: the dict can end up holding all n numbers → O(n).",
    ],
    time: "O(n)", space: "O(n)",
    lesson: "The brute force (next example) is O(n²) time, O(1) space. This version trades memory for speed — say that trade out loud.",
  },
  {
    id: "pairs", title: "Two Sum by checking every pair", rule: "Nested loops multiply",
    code: `def two_sum(nums, target):
    for i in range(len(nums)):              # n times
        for j in range(i + 1, len(nums)):   # n−1, n−2, …, 1 times
            if nums[i] + nums[j] == target: # O(1)
                return [i, j]
    return []`,
    steps: [
      "The inner loop runs (n−1) + (n−2) + … + 1 = n(n−1)/2 times in total.",
      "n(n−1)/2 = n²/2 − n/2. Drop the constant ½ and the smaller n term.",
      "Time: O(n²).",
      "Space: two loop variables, nothing else → O(1).",
    ],
    time: "O(n²)", space: "O(1)",
    lesson: "The inner loop getting shorter does NOT make this faster than O(n²). Halving n² still leaves n².",
  },
  {
    id: "binary", title: "Binary search", rule: "Halving → log n",
    code: `def binary_search(nums, target):   # nums is sorted
    lo, hi = 0, len(nums) - 1
    while lo <= hi:                    # how many times?
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        if nums[mid] < target: lo = mid + 1   # discard left half
        else: hi = mid - 1                    # discard right half
    return -1`,
    steps: [
      "Each iteration throws away half of the remaining range.",
      "Start with n. After 1 step: n/2. After 2: n/4. After k steps: n/2ᵏ.",
      "The loop stops when n/2ᵏ reaches 1, i.e. k = log₂ n.",
      "n = 1,000,000 → about 20 iterations. n = 1,000,000,000 → about 30.",
      "Time: O(log n). Space: three integers → O(1).",
    ],
    time: "O(log n)", space: "O(1)",
    lesson: "Whenever the problem size is DIVIDED each step (not reduced by one), think log n.",
  },
  {
    id: "window", title: "Sliding window — a nested loop that is still O(n)", rule: "Amortized: count total pointer moves",
    code: `def longest_unique(s):
    seen, left, best = set(), 0, 0
    for right in range(len(s)):          # n times
        while s[right] in seen:          # how many times in TOTAL?
            seen.remove(s[left])
            left += 1                    # left only ever moves forward
        seen.add(s[right])
        best = max(best, right - left + 1)
    return best`,
    steps: [
      "The tempting answer is O(n²): a while loop inside a for loop.",
      "But look at what the while loop does: it moves `left` forward. `left` starts at 0 and can never exceed n.",
      "So across the ENTIRE run, the while body executes at most n times — not n times per outer iteration.",
      "Total work: n (the for loop) + at most n (all while iterations combined) = at most 2n.",
      "Time: O(n). Space: the set holds at most one of each distinct character → O(min(n, alphabet size)).",
    ],
    time: "O(n)", space: "O(min(n, σ))",
    lesson: "Ask how many times the inner loop runs in TOTAL, not how deeply it is nested. The Complexity Lab measures this: at most 2n operations every time.",
  },
  {
    id: "merge", title: "Merge intervals", rule: "Sequential steps add; the biggest wins",
    code: `def merge(intervals):
    intervals.sort()                         # O(n log n)
    out = [intervals[0]]
    for start, end in intervals[1:]:         # O(n) — and the slice copies n−1 items
        if start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out`,
    steps: [
      "Step 1, sort: O(n log n).",
      "Step 2, one pass: O(n). The slice intervals[1:] is another O(n) copy.",
      "Add them: O(n log n) + O(n) + O(n).",
      "Keep the biggest term. Time: O(n log n).",
      "Space: the output can hold n intervals, and the slice is a copy → O(n).",
    ],
    time: "O(n log n)", space: "O(n)",
    lesson: "When a problem says \"sort first\", the sort usually sets the complexity. Everything after it is often just O(n).",
  },
  {
    id: "grid", title: "BFS over a grid", rule: "Graph traversal = nodes + edges",
    code: `def shortest(grid, start, goal):          # grid is R × C
    q, seen = deque([(start, 0)]), {start}
    while q:                                 # each cell dequeued at most once
        (r, c), d = q.popleft()
        if (r, c) == goal: return d
        for dr, dc in DIRS:                  # 4 neighbours: constant
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))           # marked on enqueue → enqueued once
                q.append(((nr, nc), d + 1))
    return -1`,
    steps: [
      "Each cell is added to `seen` before it is queued, so it enters the queue at most once.",
      "There are R·C cells. For each, the inner loop checks 4 neighbours — a constant.",
      "Time: R·C × 4 = O(R·C). As a graph: V = R·C nodes, E ≈ 4·R·C edges → O(V + E).",
      "Space: `seen` and the queue can each hold every cell → O(R·C).",
    ],
    time: "O(R·C)", space: "O(R·C)",
    lesson: "For graphs, don't count loops — count how many times each node and each edge is touched.",
  },
  {
    id: "fib", title: "Fibonacci — naive vs memoized", rule: "Recursion: calls × work; memo counts states",
    code: `def fib(n):                               # naive
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)           # 2 branches per call

@lru_cache(None)
def fib_memo(n):                          # memoized
    if n < 2: return n
    return fib_memo(n - 1) + fib_memo(n - 2)`,
    steps: [
      "Naive: every call makes two more calls, and the tree is about n levels deep → up to 2ⁿ calls. fib(30) makes 2,692,537 calls.",
      "(Precisely it grows as φⁿ ≈ 1.618ⁿ, because the n−2 branch is shorter. Say O(2ⁿ) as the upper bound.)",
      "Naive space: only one root-to-leaf chain is ever open at once → O(n) depth, NOT O(2ⁿ).",
      "Memoized: there are only n+1 distinct inputs, each computed once with O(1) work → O(n) time. fib_memo(30) makes 59 calls.",
      "Memoized space: the cache holds n values, plus O(n) recursion depth → O(n).",
    ],
    time: "O(2ⁿ) → O(n)", space: "O(n) both",
    lesson: "Memoization turns \"number of paths\" into \"number of states\". That single idea is all of dynamic programming.",
  },
  {
    id: "wordbreak", title: "Word Break — the hidden slice", rule: "Hidden costs inside the loop body",
    code: `def word_break(s, words):                   # n = len(s)
    words = set(words)
    @lru_cache(None)
    def can(i):                                # n+1 distinct states
        if i == len(s): return True
        return any(s[i:j] in words and can(j)  # j loops up to n times
                   for j in range(i + 1, len(s) + 1))
    return can(0)`,
    steps: [
      "States: i from 0 to n → n+1 states, each computed once thanks to the cache.",
      "Work per state: j runs up to n times.",
      "Inside that loop, s[i:j] builds a NEW string of length j−i (up to n), then hashes it — O(n).",
      "Total: n states × n choices × O(n) per slice = O(n³).",
      "Most people answer O(n²) because they forget the slice. Space: O(n) memo + O(n) recursion depth.",
    ],
    time: "O(n³)", space: "O(n)",
    lesson: "This is the Word Break template in your Python Code tab. The fix, if pressed: only try j up to i + (longest word length), which caps the inner work.",
  },
  {
    id: "subsets", title: "All subsets", rule: "Output-bound: the answer's size is a floor",
    code: `def subsets(nums):
    out, path = [], []
    def bt(i):
        if i == len(nums):
            out.append(path[:])      # copy: O(n)
            return
        bt(i + 1)                    # skip nums[i]
        path.append(nums[i])
        bt(i + 1)                    # take nums[i]
        path.pop()
    bt(0)
    return out`,
    steps: [
      "Each element is either in or out → 2ⁿ subsets.",
      "Each finished subset is copied, which costs up to n.",
      "Time: O(n · 2ⁿ). No algorithm can do better — the output itself has that many items.",
      "Space excluding the output: recursion depth n + the path list of length n → O(n).",
      "Space including the output: O(n · 2ⁿ).",
    ],
    time: "O(n·2ⁿ)", space: "O(n) + output",
    lesson: "When n ≤ 20 in the constraints, exponential is expected. 2²⁰ ≈ 1,000,000 is fine; 2³⁰ ≈ 1,000,000,000 is not.",
  },
  {
    id: "coins", title: "Coin change — pseudo-polynomial", rule: "Complexity can depend on a VALUE, not a length",
    code: `def coin_change(coins, amount):              # c = len(coins), A = amount
    dp = [0] + [float('inf')] * amount          # A + 1 slots
    for a in range(1, amount + 1):              # A times
        for coin in coins:                      # c times
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
    steps: [
      "Outer loop: A iterations. Inner loop: c iterations. Nested → multiply.",
      "Time: O(A · c). Space: the dp array has A + 1 slots → O(A).",
      "Notice A is a NUMBER in the input, not a length. amount = 10⁹ is a single integer, yet this would need a billion-slot array.",
      "That is called pseudo-polynomial: polynomial in the value, exponential in the number of digits.",
    ],
    time: "O(A·c)", space: "O(A)",
    lesson: "If a constraint says amount ≤ 10⁴, this is fine. If it says ≤ 10⁹, the DP table is the wrong approach.",
  },
];

// ─── 5. PRACTICE QUIZ ───────────────────────────────────────────────────────

const OPT = {
  c: "O(1)", log: "O(log n)", n: "O(n)", nlog: "O(n log n)", n2: "O(n²)", n3: "O(n³)",
  exp: "O(2ⁿ)", h: "O(h)", k: "O(k)", nlogk: "O(n log k)", ab: "O(a·b)", apb: "O(a + b)",
  mn: "O(m·n)", mpn: "O(m + n)", exp2: "O(2^(m+n))",
};

export const QUIZ = [
  {
    id: "q1",
    code: `def f(nums):
    total = 0
    for x in nums:
        total += x
    for x in nums:
        total -= x
    return total`,
    time: { options: [OPT.n, OPT.n2, OPT.nlog, OPT.c], answer: OPT.n },
    space: { options: [OPT.c, OPT.n], answer: OPT.c },
    explain: "Two loops one AFTER the other: n + n = 2n → O(n). Not nested, so not n². Only one variable → O(1) space.",
  },
  {
    id: "q2",
    code: `def f(nums):
    s = sorted(nums)
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            return True
    return False`,
    time: { options: [OPT.n, OPT.nlog, OPT.n2, OPT.log], answer: OPT.nlog },
    space: { options: [OPT.c, OPT.log, OPT.n], answer: OPT.n },
    explain: "Sort is O(n log n), the scan is O(n); the bigger term wins → O(n log n). sorted() returns a NEW list → O(n) space. (nums.sort() would avoid the copy.)",
  },
  {
    id: "q3",
    code: `def f(n):
    count, i = 0, 1
    while i < n:
        i *= 2
        count += 1
    return count`,
    time: { options: [OPT.n, OPT.log, OPT.c, OPT.nlog], answer: OPT.log },
    space: { options: [OPT.c, OPT.log], answer: OPT.c },
    explain: "i doubles each step: 1, 2, 4, 8 … reaches n after log₂ n steps → O(log n). Two integers → O(1).",
  },
  {
    id: "q4",
    code: `def f(a, b):
    for x in a:
        for y in b:
            print(x, y)`,
    time: { options: [OPT.n2, OPT.ab, OPT.apb, OPT.n], answer: OPT.ab },
    space: { options: [OPT.c, OPT.apb], answer: OPT.c },
    explain: "Two DIFFERENT inputs, nested → O(a·b). Calling it O(n²) is a common mistake — if b has 3 items it is effectively linear in a.",
  },
  {
    id: "q5",
    code: `def f(nums):
    seen = []
    for x in nums:
        if x not in seen:
            seen.append(x)
    return seen`,
    time: { options: [OPT.n, OPT.n2, OPT.nlog, OPT.log], answer: OPT.n2 },
    space: { options: [OPT.c, OPT.n], answer: OPT.n },
    explain: "Looks like one loop, but `x not in seen` scans a LIST — O(n) each time → O(n²). Change `seen` to a set and it becomes O(n). The Complexity Lab measures both side by side.",
  },
  {
    id: "q6",
    code: `def f(nums):          # nums are all ≥ 0
    left = total = best = 0
    for right in range(len(nums)):
        total += nums[right]
        while total > 10:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
    time: { options: [OPT.n2, OPT.n, OPT.nlog, OPT.log], answer: OPT.n },
    space: { options: [OPT.c, OPT.n], answer: OPT.c },
    explain: "A while inside a for, but `left` only moves forward and can never pass n. The inner loop runs at most n times IN TOTAL → O(n) amortized. A few integers → O(1).",
  },
  {
    id: "q7",
    code: `def f(n):
    if n <= 1:
        return 1
    return f(n - 1) + f(n - 1)`,
    time: { options: [OPT.n, OPT.n2, OPT.exp, OPT.log], answer: OPT.exp },
    space: { options: [OPT.n, OPT.exp, OPT.c], answer: OPT.n },
    explain: "Two branches per call, depth n → 2ⁿ calls. But only one chain of calls is open at once, so the stack is n deep → O(n) space, NOT O(2ⁿ).",
  },
  {
    id: "q8",
    code: `def f(n):
    if n <= 1:
        return 0
    return f(n // 2) + 1`,
    time: { options: [OPT.n, OPT.log, OPT.c, OPT.nlog], answer: OPT.log },
    space: { options: [OPT.c, OPT.log, OPT.n], answer: OPT.log },
    explain: "One branch, and n halves each call → log n calls → O(log n) time. Each of those calls is open at once → O(log n) stack space.",
  },
  {
    id: "q9",
    code: `def f(node):         # a binary tree with n nodes
    if not node:
        return 0
    return node.val + f(node.left) + f(node.right)`,
    time: { options: [OPT.n, OPT.log, OPT.h, OPT.n2], answer: OPT.n },
    space: { options: [OPT.c, OPT.log, OPT.h, OPT.n], answer: OPT.h },
    explain: "Visits every node once → O(n). Stack depth is the tree's height h: log n if balanced, n if it's a chain. \"O(h)\" is the precise answer; say both extremes.",
  },
  {
    id: "q10",
    code: `def f(nums):
    out = []
    for x in nums:
        out.insert(0, x)
    return out`,
    time: { options: [OPT.n, OPT.n2, OPT.nlog, OPT.c], answer: OPT.n2 },
    space: { options: [OPT.c, OPT.n], answer: OPT.n },
    explain: "insert(0, x) shifts every existing element right: 0 + 1 + … + (n−1) = n²/2 moves → O(n²). Use collections.deque.appendleft for O(1), or append then reverse once.",
  },
  {
    id: "q11",
    code: `def f(matrix):       # an n × n grid
    total = 0
    for row in matrix:
        for x in row:
            total += x
    return total`,
    time: { options: [OPT.n, OPT.n2, OPT.nlog, OPT.n3], answer: OPT.n2 },
    space: { options: [OPT.c, OPT.n], answer: OPT.c },
    explain: "n rows × n columns → O(n²) where n is the side length. But it is O(N) if N means the number of cells — same work, different n. This is why step 1 is always \"say what n is\".",
  },
  {
    id: "q12",
    code: `@lru_cache(None)
def f(i, j):         # 0 ≤ i < m, 0 ≤ j < n
    if i == 0 or j == 0:
        return 1
    return f(i - 1, j) + f(i, j - 1)`,
    time: { options: [OPT.exp2, OPT.mn, OPT.mpn, OPT.n2], answer: OPT.mn },
    space: { options: [OPT.mpn, OPT.mn, OPT.c], answer: OPT.mn },
    explain: "Without the cache, this would be exponential. With it, there are m·n distinct (i, j) states, each doing O(1) work → O(m·n). The cache stores all m·n states → O(m·n) space (recursion depth is only m + n, which is smaller).",
  },
  {
    id: "q13",
    code: `def f(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    time: { options: [OPT.nlog, OPT.nlogk, OPT.n, OPT.k], answer: OPT.nlogk },
    space: { options: [OPT.n, OPT.k, OPT.c], answer: OPT.k },
    explain: "n pushes, each on a heap never bigger than k+1 → O(n log k). The heap is capped at k → O(k) space. This beats sorting (O(n log n)) when k is small.",
  },
  {
    id: "q14",
    code: `def f(nums):
    for x in nums:
        for d in range(4):     # four directions
            print(x + d)`,
    time: { options: [OPT.n, OPT.n2, OPT.c, OPT.nlog], answer: OPT.n },
    space: { options: [OPT.c, OPT.n], answer: OPT.c },
    explain: "Nested — but the inner loop always runs exactly 4 times, no matter how big n gets. n × 4 → O(n). Nesting only multiplies by what actually GROWS.",
  },
];

// ─── THINGS TO SAY OUT LOUD ─────────────────────────────────────────────────

export const SAY_IT = [
  "\"Let n be the length of nums and m the length of words.\" — define before you analyse.",
  "\"This is O(n): the while loop looks nested, but left only moves forward, so it runs at most n times in total.\"",
  "\"Hash lookups are O(1) on average, O(n) in the worst case if everything collides.\"",
  "\"That's O(n) extra space for the set. If memory were tight I could sort in place instead — O(n log n) time, O(1) extra.\"",
  "\"Excluding the output, space is O(n) for the recursion stack.\"",
  "\"Recursion depth is O(h) — log n if the tree is balanced, n if it's skewed. For n around 10⁵ in Python I'd switch to an explicit stack.\"",
  "\"The slice inside the loop is an O(k) copy, so this is actually O(n²), not O(n).\"",
];
