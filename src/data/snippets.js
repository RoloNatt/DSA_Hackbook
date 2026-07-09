// ─── PYTHON CODE TEMPLATES ──────────────────────────────────────────────────
// Grouped by category. Every snippet is self-contained and runnable.

export const CODE_SNIPPETS = [

  // ═══ ARRAYS & HASHING ══════════════════════════════════════════════════
  {
    id: "hashmap", category: "Arrays & Hashing", emoji: "🗂️", label: "HashMap / Counter",
    color: "#1A6BCC", bg: "#E8F1FB",
    description: "Count frequencies, find duplicates, or look up complements in O(1).",
    code: `from collections import Counter, defaultdict

# ── Two Sum — indices of two numbers that add to target ──
def two_sum(nums, target):
    seen = {}                        # value -> index
    for i, num in enumerate(nums):
        if target - num in seen:     # complement already seen?
            return [seen[target - num], i]
        seen[num] = i
    return []

# ── Most common element ──
def most_common(nums):
    return Counter(nums).most_common(1)[0][0]

# ── Group anagrams ──
def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        groups[tuple(sorted(word))].append(word)
    return list(groups.values())

print(two_sum([2, 7, 11, 15], 9))   # [0, 1]
print(most_common([1, 2, 2, 3, 2])) # 2
print(group_anagrams(['eat','tea','tan','ate','nat','bat']))
# [['eat','tea','ate'], ['tan','nat'], ['bat']]`,
  },
  {
    id: "two_pointer", category: "Arrays & Hashing", emoji: "👆", label: "Two Pointers",
    color: "#0F7A5A", bg: "#E2F5EF",
    description: "Converging pointers on sorted data, or read/write pointers for in-place edits.",
    code: `# ── Pair with target sum (sorted array) ──
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return (left, right)
        if s < target:
            left += 1        # need a bigger sum
        else:
            right -= 1       # need a smaller sum
    return None

# ── Move zeros to end, keep order (read/write pointers) ──
def move_zeros(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0
    return nums

# ── 3Sum sketch: sort, fix i, two-pointer the rest; skip duplicates ──

print(two_sum_sorted([1, 3, 4, 6, 9], 10))  # (1, 4)
print(move_zeros([0, 1, 0, 3, 12]))         # [1, 3, 12, 0, 0]`,
  },
  {
    id: "sliding_window", category: "Arrays & Hashing", emoji: "🪟", label: "Sliding Window",
    color: "#6B3FCC", bg: "#F0EDFB",
    description: "Best contiguous subarray/substring under a constraint. Expand right, shrink left.",
    code: `# ── Variable window: longest substring without repeats ──
def longest_unique_substring(s):
    seen = set()
    left = best = 0
    for right in range(len(s)):
        while s[right] in seen:       # invalid -> shrink from left
            seen.remove(s[left])
            left += 1
        seen.add(s[right])            # now valid -> extend
        best = max(best, right - left + 1)
    return best

# ── Fixed window: max sum of k consecutive elements ──
def max_sum_window(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]   # slide: add right, drop left
        best = max(best, window)
    return best

# ── Minimum window template: expand right, shrink left WHILE valid,
#    record best while shrinking (see LC 76 Minimum Window Substring)

print(longest_unique_substring('abcabcbb'))   # 3  ('abc')
print(max_sum_window([2, 1, 5, 1, 3, 2], 3))  # 9  (5+1+3)`,
  },
  {
    id: "prefix_sum", category: "Arrays & Hashing", emoji: "➕", label: "Prefix Sum",
    color: "#00695C", bg: "#E0F2F1",
    description: "O(1) range sums; count subarrays with exact sum (works with negatives).",
    code: `# ── Build once, query any range in O(1) ──
def build_prefix(nums):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix          # sum(l..r) = prefix[r+1] - prefix[l]

# ── Count subarrays summing to exactly k (LC 560) ──
def subarray_sum_equals_k(nums, k):
    from collections import defaultdict
    count = 0
    running = 0
    seen = defaultdict(int)
    seen[0] = 1                      # empty prefix — crucial seed!
    for x in nums:
        running += x
        count += seen[running - k]   # earlier prefix that closes a k-sum
        seen[running] += 1
    return count

prefix = build_prefix([2, 4, 1, 3])
print(prefix[4] - prefix[1])              # 8  -> sum of indices 1..3
print(subarray_sum_equals_k([1,1,1], 2))  # 2
print(subarray_sum_equals_k([1,-1,0], 0)) # 3  (negatives OK)`,
  },
  {
    id: "intervals", category: "Arrays & Hashing", emoji: "📅", label: "Intervals",
    color: "#AD1457", bg: "#FCE4EC",
    description: "Merge overlapping intervals; minimum meeting rooms with a heap.",
    code: `import heapq

# ── Merge overlapping intervals (LC 56) ──
def merge_intervals(intervals):
    intervals.sort()                       # sort by start
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:         # overlaps the last block
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

# ── Minimum meeting rooms (LC 253): min-heap of end times ──
def min_meeting_rooms(intervals):
    intervals.sort()
    ends = []                              # heap of room end-times
    for start, end in intervals:
        if ends and ends[0] <= start:      # earliest room free? reuse it
            heapq.heappop(ends)
        heapq.heappush(ends, end)
    return len(ends)

print(merge_intervals([[1,3],[2,6],[8,10],[15,18]]))
# [[1, 6], [8, 10], [15, 18]]
print(min_meeting_rooms([[0,30],[5,10],[15,20]]))  # 2`,
  },
  {
    id: "binary_search", category: "Arrays & Hashing", emoji: "🎯", label: "Binary Search ×3",
    color: "#C62828", bg: "#FDECEA",
    description: "Exact match, leftmost position, and binary-search-on-the-answer (Google favorite).",
    code: `# ── 1. Classic: exact match ──
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# ── 2. Leftmost position (== bisect_left) ──
def left_bound(nums, target):
    lo, hi = 0, len(nums)          # note: hi = n, search [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo    # first index with nums[i] >= target

# ── 3. Search ON THE ANSWER: min eating speed (LC 875) ──
def min_eating_speed(piles, hours):
    import math
    def can_finish(speed):                     # monotonic yes/no
        return sum(math.ceil(p / speed) for p in piles) <= hours

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_finish(mid):
            hi = mid                # works -> try slower
        else:
            lo = mid + 1            # too slow -> speed up
    return lo

print(binary_search([1,3,5,7,9], 7))        # 3
print(left_bound([1,2,2,2,5], 2))           # 1
print(min_eating_speed([3,6,7,11], 8))      # 4`,
  },

  // ═══ STACK & HEAP ══════════════════════════════════════════════════════
  {
    id: "stack", category: "Stack & Heap", emoji: "📚", label: "Stack",
    color: "#2E7D32", bg: "#E8F5E9",
    description: "Valid parentheses and nested-structure parsing. LIFO.",
    code: `# ── Valid parentheses (LC 20) ──
def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for ch in s:
        if ch in '({[':
            stack.append(ch)
        else:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return not stack

# ── Decode string (LC 394): '3[a2[c]]' -> 'accaccacc' ──
def decode_string(s):
    stack = []                 # holds (prev_string, repeat_count)
    curr, num = '', 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == '[':
            stack.append((curr, num))
            curr, num = '', 0
        elif ch == ']':
            prev, k = stack.pop()
            curr = prev + curr * k
        else:
            curr += ch
    return curr

print(is_valid('{[()]}'))          # True
print(decode_string('3[a2[c]]'))   # accaccacc`,
  },
  {
    id: "monotonic_stack", category: "Stack & Heap", emoji: "📉", label: "Monotonic Stack",
    color: "#455A64", bg: "#ECEFF1",
    description: "Next greater element / daily temperatures in O(n). Keep the stack sorted.",
    code: `# ── Daily temperatures (LC 739): days until a warmer day ──
def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                          # indices, temps decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()             # today is j's 'next warmer'
            answer[j] = i - j
        stack.append(i)
    return answer

# ── Largest rectangle in histogram (LC 84) ──
def largest_rectangle(heights):
    stack = []                          # indices, heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):   # sentinel flushes stack
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best

print(daily_temperatures([73,74,75,71,69,72,76,73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
print(largest_rectangle([2,1,5,6,2,3]))  # 10`,
  },
  {
    id: "heap_topk", category: "Stack & Heap", emoji: "⛰️", label: "Heap / Top-K",
    color: "#B84A00", bg: "#FCEEE7",
    description: "K largest with a size-k min-heap; k most frequent; max-heap via negation.",
    code: `import heapq
from collections import Counter

# ── Kth largest element: min-heap of size k ──
def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)     # evict the weakest
    return heap[0]                  # k-th largest sits on top

# ── Top k frequent elements (LC 347) ──
def top_k_frequent(nums, k):
    counts = Counter(nums)
    return [x for x, _ in counts.most_common(k)]
    # or: heapq.nlargest(k, counts, key=counts.get)

# ── Max-heap in Python: negate values ──
def max_heap_demo(nums):
    heap = [-x for x in nums]
    heapq.heapify(heap)             # O(n)
    return -heapq.heappop(heap)     # largest

print(kth_largest([3,2,1,5,6,4], 2))     # 5
print(top_k_frequent([1,1,1,2,2,3], 2))  # [1, 2]
print(max_heap_demo([4, 9, 2]))          # 9`,
  },

  // ═══ LINKED LIST ════════════════════════════════════════════════════════
  {
    id: "linked_list", category: "Linked List", emoji: "🔗", label: "Linked List Kit",
    color: "#5D4037", bg: "#EFEBE9",
    description: "Reverse, cycle detection (fast/slow), merge two sorted — the three core moves.",
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

# ── Reverse (LC 206): three pointers ──
def reverse_list(head):
    prev = None
    while head:
        nxt = head.next        # save the rest BEFORE rewiring
        head.next = prev       # flip the arrow
        prev, head = head, nxt
    return prev

# ── Cycle detection (LC 141): tortoise & hare ──
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

# ── Merge two sorted lists (LC 21): dummy head ──
def merge_two(l1, l2):
    dummy = tail = ListNode()
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2       # attach the leftover
    return dummy.next

# build 1->2->3, reverse, print
head = ListNode(1, ListNode(2, ListNode(3)))
r = reverse_list(head)
out = []
while r: out.append(r.val); r = r.next
print(out)   # [3, 2, 1]`,
  },

  // ═══ TREES ══════════════════════════════════════════════════════════════
  {
    id: "trees", category: "Trees", emoji: "🌳", label: "Tree Essentials",
    color: "#33691E", bg: "#F1F8E9",
    description: "Traversals, level order (BFS), validate BST with bounds, and LCA.",
    code: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

# ── Max depth: the canonical recursion shape ──
def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

# ── Level order traversal (LC 102): BFS ──
def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):        # exactly one level per pass
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result

# ── Validate BST (LC 98): pass DOWN (lo, hi) bounds ──
def is_valid_bst(node, lo=float('-inf'), hi=float('inf')):
    if not node:
        return True
    if not (lo < node.val < hi):           # parent-only check is WRONG
        return False
    return (is_valid_bst(node.left, lo, node.val) and
            is_valid_bst(node.right, node.val, hi))

# ── Lowest common ancestor (LC 236) ──
def lca(root, p, q):
    if not root or root is p or root is q:
        return root
    left  = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:      # p and q on different sides -> I'm the LCA
        return root
    return left or right

t = TreeNode(3, TreeNode(1), TreeNode(5, TreeNode(4)))
print(max_depth(t))        # 3
print(level_order(t))      # [[3], [1, 5], [4]]
print(is_valid_bst(t))     # True`,
  },
  {
    id: "trie", category: "Trees", emoji: "🔤", label: "Trie",
    color: "#283593", bg: "#E8EAF6",
    description: "Prefix tree: insert, search, startsWith — the autocomplete structure.",
    code: `class Trie:
    def __init__(self):
        self.root = {}                 # char -> child dict

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = True               # end-of-word marker

    def search(self, word):
        node = self._walk(word)
        return node is not None and '$' in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

t = Trie()
t.insert('apple')
print(t.search('apple'))      # True
print(t.search('app'))        # False (not a full word)
print(t.starts_with('app'))   # True`,
  },

  // ═══ GRAPHS ═════════════════════════════════════════════════════════════
  {
    id: "bfs", category: "Graphs", emoji: "🌊", label: "BFS",
    color: "#1A6BCC", bg: "#E8F1FB",
    description: "Shortest path in an unweighted graph. Queue; mark visited on enqueue.",
    code: `from collections import deque

def bfs(graph, start, target):
    visited = {start}                       # mark on ENQUEUE
    queue = deque([(start, 0)])             # (node, distance)
    while queue:
        node, dist = queue.popleft()
        if node == target:
            return dist                     # first arrival = shortest
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append((nb, dist + 1))
    return -1

# Need the actual path? Store parent = {start: None} while visiting,
# then walk parents back from target and reverse.

graph = {
    'A': ['B', 'C'], 'B': ['A', 'D', 'E'],
    'C': ['A', 'F'], 'D': ['B'], 'E': ['B'], 'F': ['C'],
}
print(bfs(graph, 'A', 'F'))  # 2  (A -> C -> F)`,
  },
  {
    id: "dfs", category: "Graphs", emoji: "🌀", label: "DFS",
    color: "#6B3FCC", bg: "#F0EDFB",
    description: "Explore everything, count components, detect cycles. Recursion or explicit stack.",
    code: `# ── Recursive DFS + connected components ──
def count_components(graph):
    visited = set()

    def dfs(node):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited:
                dfs(nb)

    components = 0
    for node in graph:
        if node not in visited:
            dfs(node)
            components += 1
    return components

# ── Iterative DFS (no recursion-limit worries) ──
def dfs_iterative(graph, start):
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        stack.extend(nb for nb in graph[node] if nb not in visited)
    return visited

graph = {'A': ['B'], 'B': ['A'], 'C': ['D'], 'D': ['C'], 'E': []}
print(count_components(graph))       # 3
print(dfs_iterative(graph, 'A'))     # {'A', 'B'}`,
  },
  {
    id: "grid_islands", category: "Graphs", emoji: "🏝️", label: "Grid DFS/BFS (Islands)",
    color: "#0277BD", bg: "#E1F5FE",
    description: "The Google staple: treat the grid as a graph, flood-fill each island.",
    code: `# ── Number of islands (LC 200) ──
def num_islands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):                        # DFS flood fill
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if grid[r][c] != '1':
            return
        grid[r][c] = '0'                   # mark visited by sinking
        sink(r+1, c); sink(r-1, c); sink(r, c+1); sink(r, c-1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1                 # found a new island
                sink(r, c)                 # erase all of it
    return count

# ── Multi-source BFS (Rotting Oranges, LC 994): seed the queue
#    with ALL rotten cells at distance 0, then spread level by level.

grid = [
    ['1','1','0','0'],
    ['1','0','0','1'],
    ['0','0','1','1'],
]
print(num_islands(grid))   # 3`,
  },
  {
    id: "topo_sort", category: "Graphs", emoji: "🧩", label: "Topological Sort",
    color: "#37474F", bg: "#ECEFF1",
    description: "Kahn's algorithm: order by prerequisites, detect cycles. Course Schedule.",
    code: `from collections import deque, defaultdict

# ── Course Schedule II (LC 210): valid order or [] if impossible ──
def find_order(num_courses, prerequisites):
    graph = defaultdict(list)          # prereq -> [courses it unlocks]
    in_degree = [0] * num_courses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque(c for c in range(num_courses) if in_degree[c] == 0)
    order = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for nxt in graph[c]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:    # all prereqs done -> unlocked
                queue.append(nxt)

    return order if len(order) == num_courses else []   # [] => cycle

print(find_order(4, [[1,0],[2,0],[3,1],[3,2]]))  # [0, 1, 2, 3]
print(find_order(2, [[0,1],[1,0]]))              # []  (deadlock)`,
  },
  {
    id: "union_find", category: "Graphs", emoji: "🤝", label: "Union-Find (DSU)",
    color: "#00838F", bg: "#E0F7FA",
    description: "Standalone disjoint-set template: near-O(1) merge and same-group queries.",
    code: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.groups = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # compress
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False            # already connected (cycle!)
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra        # smaller tree under bigger
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.groups -= 1
        return True

dsu = DSU(5)
dsu.union(0, 1)
dsu.union(3, 4)
print(dsu.find(1) == dsu.find(0))  # True  — same group
print(dsu.groups)                  # 3     — {0,1} {2} {3,4}
print(dsu.union(0, 1))             # False — would form a cycle`,
  },
  {
    id: "dijkstra", category: "Graphs", emoji: "🗺️", label: "Dijkstra's",
    color: "#0F7A5A", bg: "#E2F5EF",
    description: "Cheapest path with positive weights. Min-heap + stale-entry skip.",
    code: `import heapq

def dijkstra(graph, start):
    # graph = {node: [(cost, neighbor), ...]}
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]                 # (cost so far, node)

    while heap:
        cost, node = heapq.heappop(heap)
        if cost > dist[node]:           # stale entry — skip
            continue
        for edge_cost, nb in graph[node]:
            new_cost = cost + edge_cost
            if new_cost < dist[nb]:     # found a cheaper route
                dist[nb] = new_cost
                heapq.heappush(heap, (new_cost, nb))
    return dist

graph = {
    'A': [(1, 'B'), (4, 'C')],
    'B': [(2, 'C'), (6, 'D')],
    'C': [(3, 'D')],
    'D': [],
}
print(dijkstra(graph, 'A'))  # {'A': 0, 'B': 1, 'C': 3, 'D': 6}`,
  },
  {
    id: "prims", category: "Graphs", emoji: "🌱", label: "Prim's (MST)",
    color: "#B84A00", bg: "#FCEEE7",
    description: "Grow the MST from one node, always absorbing the cheapest frontier edge.",
    code: `import heapq

def prims(graph, start):
    # graph = {node: [(cost, neighbor), ...]}
    visited = set()
    mst_cost, mst_edges = 0, []
    heap = [(0, start, None)]           # (edge cost, node, from)

    while heap:
        cost, node, parent = heapq.heappop(heap)
        if node in visited:
            continue
        visited.add(node)
        mst_cost += cost
        if parent is not None:
            mst_edges.append((parent, node, cost))
        for edge_cost, nb in graph[node]:
            if nb not in visited:
                heapq.heappush(heap, (edge_cost, nb, node))

    return mst_cost, mst_edges

graph = {
    'A': [(1, 'B'), (3, 'C')],
    'B': [(1, 'A'), (2, 'C'), (4, 'D')],
    'C': [(3, 'A'), (2, 'B'), (5, 'D')],
    'D': [(4, 'B'), (5, 'C')],
}
cost, edges = prims(graph, 'A')
print(cost)    # 7
print(edges)   # [('A','B',1), ('B','C',2), ('B','D',4)]`,
  },
  {
    id: "kruskal", category: "Graphs", emoji: "🔗", label: "Kruskal's (MST)",
    color: "#2E7D32", bg: "#E8F5E9",
    description: "Sort all edges, add each unless it forms a cycle (Union-Find).",
    code: `def kruskal(n, edges):
    # nodes are 0..n-1, edges = [(cost, u, v), ...]
    edges.sort()                         # cheapest first
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    mst_cost, mst_edges = 0, []
    for cost, u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            continue                     # would create a cycle — skip
        parent[rv] = ru                  # merge groups
        mst_cost += cost
        mst_edges.append((u, v, cost))
        if len(mst_edges) == n - 1:      # MST complete — stop early
            break
    return mst_cost, mst_edges

edges = [(1,0,1), (2,1,2), (3,0,2), (4,1,3), (5,2,3)]
cost, mst = kruskal(4, edges)
print(cost)   # 7
print(mst)    # [(0,1,1), (1,2,2), (1,3,4)]`,
  },

  // ═══ DP & BACKTRACKING ══════════════════════════════════════════════════
  {
    id: "dp_1d", category: "DP & Backtracking", emoji: "🧠", label: "DP — 1D Classics",
    color: "#6A1B9A", bg: "#F3E5F5",
    description: "Climbing stairs, house robber, coin change — state, transition, base case.",
    code: `from functools import lru_cache

# ── Climbing stairs: dp[i] = ways to reach step i ──
def climb_stairs(n):
    a, b = 1, 1                    # dp[0], dp[1]
    for _ in range(2, n + 1):
        a, b = b, a + b            # dp[i] = dp[i-1] + dp[i-2]
    return b

# ── House robber: dp[i] = max loot from first i houses ──
def rob(nums):
    take, skip = 0, 0
    for x in nums:
        take, skip = skip + x, max(skip, take)
        # take = robbed this house (must have skipped previous)
    return max(take, skip)

# ── Coin change (LC 322): min coins for amount — UNBOUNDED knapsack ──
def coin_change(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount            # dp[a] = min coins for a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1

# ── Top-down template: write recursion, add @lru_cache ──
def word_break(s, words):
    words = set(words)
    @lru_cache(None)
    def can(i):                          # can s[i:] be segmented?
        if i == len(s):
            return True
        return any(s[i:j] in words and can(j)
                   for j in range(i + 1, len(s) + 1))
    return can(0)

print(climb_stairs(10))                        # 89
print(rob([2, 7, 9, 3, 1]))                    # 12
print(coin_change([1, 3, 4], 6))               # 2  (3+3 — greedy fails!)
print(word_break('leetcode', ['leet','code'])) # True`,
  },
  {
    id: "dp_2d", category: "DP & Backtracking", emoji: "🗄️", label: "DP — 2D & Strings",
    color: "#4527A0", bg: "#EDE7F6",
    description: "Two sequences or a grid: edit distance, LCS, unique paths, LIS in O(n log n).",
    code: `import bisect

# ── Edit distance (LC 72): dp[i][j] = ops to turn a[:i] into b[:j] ──
def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i        # delete everything
    for j in range(n + 1): dp[0][j] = j        # insert everything
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]        # free match
            else:
                dp[i][j] = 1 + min(dp[i-1][j],     # delete
                                   dp[i][j-1],     # insert
                                   dp[i-1][j-1])   # replace
    return dp[m][n]

# ── Unique paths (LC 62): grid DP with one rolling row ──
def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j-1]      # from top (old row[j]) + left
    return row[-1]

# ── Longest increasing subsequence in O(n log n) — say this at Google ──
def lis(nums):
    tails = []      # tails[k] = smallest tail of an increasing subseq of len k+1
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)

print(edit_distance('horse', 'ros'))       # 3
print(unique_paths(3, 7))                  # 28
print(lis([10, 9, 2, 5, 3, 7, 101, 18]))   # 4`,
  },
  {
    id: "backtracking", category: "DP & Backtracking", emoji: "🧭", label: "Backtracking",
    color: "#D84315", bg: "#FBE9E7",
    description: "Subsets, permutations, combination sum — choose, explore, un-choose.",
    code: `# ── Subsets (LC 78): include-or-skip each element ──
def subsets(nums):
    result, path = [], []
    def bt(i):
        if i == len(nums):
            result.append(path[:])     # copy! path keeps mutating
            return
        bt(i + 1)                      # skip nums[i]
        path.append(nums[i])           # choose
        bt(i + 1)                      # explore
        path.pop()                     # un-choose
    bt(0)
    return result

# ── Permutations (LC 46) ──
def permutations(nums):
    result, path, used = [], [], set()
    def bt():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for x in nums:
            if x in used: continue
            used.add(x); path.append(x)
            bt()
            path.pop(); used.remove(x)
    bt()
    return result

# ── Combination sum (LC 39): reuse allowed, prune when over ──
def combination_sum(candidates, target):
    result, path = [], []
    def bt(start, remaining):
        if remaining == 0:
            result.append(path[:]); return
        if remaining < 0:
            return                       # prune dead branch
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            bt(i, remaining - candidates[i])   # i, not i+1: reuse OK
            path.pop()
    bt(0, target)
    return result

print(len(subsets([1,2,3])))            # 8
print(len(permutations([1,2,3])))       # 6
print(combination_sum([2,3,5], 8))      # [[2,2,2,2],[2,3,3],[3,5]]`,
  },

  // ═══ DESIGN ═════════════════════════════════════════════════════════════
  {
    id: "lru_design", category: "Design", emoji: "🏗️", label: "LRU Cache",
    color: "#827717", bg: "#F9FBE7",
    description: "The classic design question: O(1) get/put via hashmap + ordering.",
    code: `from collections import OrderedDict

# ── Interview-legal short version ──
class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()       # insertion order = recency

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)      # freshly used -> most recent
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)   # evict least-recent

# If asked to go deeper: hashmap {key -> node} + doubly linked list;
# move_to_end == unlink node + append at tail, both O(1).

cache = LRUCache(2)
cache.put(1, 1); cache.put(2, 2)
print(cache.get(1))    # 1   (1 is now most recent)
cache.put(3, 3)        # evicts key 2
print(cache.get(2))    # -1`,
  },

  // ═══ PYTHON TOOLKIT ═════════════════════════════════════════════════════
  {
    id: "python_toolkit", category: "Python Toolkit", emoji: "🐍", label: "Interview Python Kit",
    color: "#1565C0", bg: "#E3F2FD",
    description: "The stdlib weapons that save you 10 minutes per problem. Know these cold.",
    code: `from collections import Counter, defaultdict, deque
import heapq, bisect, itertools, math
from functools import lru_cache

nums = [3, 1, 4, 1, 5, 9, 2, 6]
words = ['bb', 'a', 'ccc']

# ── Sorting with keys ──
words.sort(key=len)                      # by length
pairs = sorted(enumerate(nums), key=lambda p: p[1])   # keep indices
top3 = heapq.nlargest(3, nums)           # [9, 6, 5] without full sort

# ── Counter / defaultdict / deque ──
c = Counter('mississippi')               # {'i':4,'s':4,'p':2,'m':1}
g = defaultdict(list); g['key'].append(1)
q = deque([1, 2]); q.appendleft(0); q.popleft()   # O(1) both ends

# ── bisect on sorted lists ──
a = [10, 20, 30]
bisect.insort(a, 25)                     # a = [10, 20, 25, 30]
i = bisect.bisect_left(a, 20)            # 1

# ── Slices & strings ──
s = 'hello'
rev = s[::-1]                            # 'olleh'
out = ''.join(ch for ch in s if ch != 'l')   # NEVER += in a loop

# ── Grids ──
grid = [[1, 2], [3, 4]]
transposed = [list(row) for row in zip(*grid)]
DIRS = [(0,1), (0,-1), (1,0), (-1,0)]    # write this instantly

# ── Infinity, ceil-div, memoized recursion ──
INF = float('inf')
ceil_div = (7 + 3 - 1) // 3              # = ceil(7/3) without floats

@lru_cache(None)
def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)

print(top3, c.most_common(1), fib(30))   # [9,6,5] [('i',4)] 832040`,
  },
];

// Ordered category list for the UI
export const SNIPPET_CATEGORIES = [
  "Arrays & Hashing", "Stack & Heap", "Linked List", "Trees",
  "Graphs", "DP & Backtracking", "Design", "Python Toolkit",
];
