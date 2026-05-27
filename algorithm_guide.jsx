import { useState } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────────

const ALGOS = [
  {
    id: "bfs", emoji: "🌊", label: "BFS",
    fullName: "Breadth-First Search",
    color: "#1A6BCC", bg: "#E8F1FB",
    family: "Graph Traversal",
    tagline: "Explore level by level — like ripples in water",
    analogy: "Drop a stone in a pond. Ripples spread outward ring by ring — nearest first, then the next ring, then the next.\n\nBFS works identically. Start at a node, visit ALL immediate neighbors first. Then ALL of their neighbors. Never go deeper until the entire current level is done.",
    memHook: "🏢 Building floors: finish every room on floor 1 before stepping onto floor 2.",
    steps: [
      { l: "Start", t: "Put starting node in a Queue. Mark it visited." },
      { l: "Process", t: "Pop from front of queue. Visit all its unvisited neighbors." },
      { l: "Enqueue", t: "Add those neighbors to the BACK of the queue." },
      { l: "Repeat", t: "Keep going until queue is empty or target found." },
    ],
    when: "• 'Shortest path?' (unweighted graph)\n• 'Minimum steps/hops?'\n• 'Are A and B connected?'\n• 'Closest node to X?'",
    notWhen: "• Need the cheapest path (use Dijkstra — BFS ignores weights)\n• Need ALL possible paths (use DFS)\n• Memory is tight (BFS holds entire level in memory)",
    keywords: ["shortest path", "minimum steps", "minimum moves", "minimum hops", "level order", "nearest", "connected", "reachable", "fewest edges"],
  },
  {
    id: "dfs", emoji: "🌀", label: "DFS",
    fullName: "Depth-First Search",
    color: "#6B3FCC", bg: "#F0EDFB",
    family: "Graph Traversal",
    tagline: "Go as deep as possible, then backtrack",
    analogy: "Exploring a cave system. Pick a tunnel and keep going deeper until you hit a dead end. Backtrack to the last fork. Try the next tunnel. Repeat.\n\nDFS commits fully to one direction before trying alternatives. Great when you need to explore everything or find if any path exists.",
    memHook: "🗺️ Cave explorer: always go deeper. Only turn back when truly stuck.",
    steps: [
      { l: "Start", t: "Push starting node onto a Stack (or use recursion)." },
      { l: "Process", t: "Pop from stack. Visit it. Push ALL its unvisited neighbors." },
      { l: "Go Deep", t: "The last neighbor pushed gets processed next (LIFO — goes deep)." },
      { l: "Backtrack", t: "When stuck, the stack naturally goes back to the last fork." },
    ],
    when: "• 'Find ANY path' (not necessarily shortest)\n• 'Find ALL possible paths'\n• 'Detect a cycle'\n• 'Connected components'\n• Maze solving, puzzle solving\n• Backtracking problems",
    notWhen: "• Need SHORTEST path (use BFS)\n• Very deep graph — risks stack overflow",
    keywords: ["all paths", "any path", "exists", "detect cycle", "connected components", "maze", "backtrack", "permutations", "combinations", "flood fill"],
  },
  {
    id: "dijkstra", emoji: "🗺️", label: "Dijkstra's",
    fullName: "Dijkstra's Shortest Path",
    color: "#0F7A5A", bg: "#E2F5EF",
    family: "Shortest Path",
    tagline: "Cheapest path from A to B — exactly like GPS",
    analogy: "You're driving city A → city Z. Every road has a travel time. GPS keeps a running tab: 'cheapest cost to reach each city so far.' It always processes the cheapest unvisited city next. When it finds a cheaper route to a neighbor, it updates the tab.\n\nBFS with weights. Same idea, but instead of a queue, use a min-heap (priority queue).",
    memHook: "🚗 GPS: always take the cheapest next road. Update your estimate when you find a better route.",
    steps: [
      { l: "Init", t: "Cost[start] = 0. Cost[all others] = ∞. Use a min-heap." },
      { l: "Process", t: "Pop the node with LOWEST cost from heap." },
      { l: "Update", t: "For each neighbor: if current_cost + edge < neighbor_cost → update." },
      { l: "Repeat", t: "Until target is popped or heap is empty." },
    ],
    when: "• 'Cheapest/shortest path from A to B' (weighted graph)\n• 'Minimum cost route'\n• All edge weights are POSITIVE",
    notWhen: "• No weights on edges (BFS is simpler and sufficient)\n• Negative edge weights (use Bellman-Ford)\n• Need to connect ALL nodes (use MST instead)",
    keywords: ["cheapest path", "shortest path weighted", "minimum cost route", "minimum time", "minimum distance", "weighted graph", "travel time", "road cost"],
  },
  {
    id: "mst", emoji: "🌲", label: "MST",
    fullName: "Minimum Spanning Tree",
    color: "#9B6400", bg: "#FBF0DC",
    family: "Concept",
    tagline: "Connect ALL cities with minimum total road cost",
    analogy: "You're a minister building roads. 10 cities. Every city must be reachable from every other. Roads cost money — minimize total cost.\n\nYou don't need a road between EVERY pair — just enough to keep everything connected. That cheapest set of connections is the MST.\n\nMST is the GOAL. Prim's and Kruskal's are two methods to find it.",
    memHook: "🏙️ Power grid: connect every house with minimum total wire. No redundant wires.",
    steps: [
      { l: "Rule 1", t: "n cities → exactly n-1 edges in the MST" },
      { l: "Rule 2", t: "Every city must be reachable from every other" },
      { l: "Rule 3", t: "No cycles — adding a redundant edge wastes cost" },
      { l: "Find it", t: "Use Prim's (grow from one city) or Kruskal's (sort all edges)" },
    ],
    when: "• 'Connect ALL nodes with minimum total cost'\n• 'Minimum network/grid/infrastructure'\n• 'Cheapest way to link every city'",
    notWhen: "• Shortest path between two specific cities (Dijkstra)\n• Visiting all cities in a route (different — that's TSP/Greedy)",
    keywords: ["connect all", "minimum network", "minimum spanning", "minimum total cost", "link all cities", "minimum infrastructure", "minimum cable", "minimum wire"],
  },
  {
    id: "prims", emoji: "🌱", label: "Prim's",
    fullName: "Prim's Algorithm (finds MST)",
    color: "#B84A00", bg: "#FCEEE7",
    family: "MST Method",
    tagline: "Grow from one city — always grab cheapest nearby edge",
    analogy: "Start at city A. You have a 'safe zone' of connected cities. Look at all edges leading OUT of your safe zone. Pick the cheapest one. Add that city. Repeat until all cities are inside.\n\nLike a spreading bubble that always expands to the nearest outside city.",
    memHook: "🫧 Expanding bubble: always absorb the cheapest neighboring city.",
    steps: [
      { l: "Start", t: "Pick any city. Add to safe zone. Add its edges to min-heap." },
      { l: "Pick", t: "Pop cheapest edge from heap. Does it go to an unvisited city?" },
      { l: "Add", t: "Yes → add that city to safe zone. Add its edges to heap." },
      { l: "Skip", t: "No (both ends already visited) → skip, pop next." },
    ],
    when: "• Dense graph (many edges)\n• Starting from a specific node matters\n• Growing outward from a point is natural",
    notWhen: "Kruskal's is often easier to code in interviews. Use Prim's when the graph is dense.",
    keywords: ["same as mst", "dense graph", "grow from source"],
  },
  {
    id: "kruskal", emoji: "🔗", label: "Kruskal's",
    fullName: "Kruskal's Algorithm (finds MST)",
    color: "#2E7D32", bg: "#E8F5E9",
    family: "MST Method",
    tagline: "Sort all edges cheapest first, add if no loop created",
    analogy: "Look at ALL roads on the entire map. Sort them cheapest to most expensive. Go through them in order:\n• If this road connects two currently disconnected parts → add it\n• If both ends are already connected → SKIP (would create a loop)\n\nBargain hunter: buy cheapest roads first, never buy a redundant one.",
    memHook: "🛒 Bargain hunt: sorted roads on sale. Buy cheapest. Skip duplicates.",
    steps: [
      { l: "Sort", t: "Sort ALL edges by weight, cheapest first." },
      { l: "Check", t: "For each edge: do the two endpoints belong to different groups?" },
      { l: "Add", t: "Yes → add this edge. Merge the two groups (Union-Find)." },
      { l: "Skip", t: "No → skip it (would create a cycle). Move to next edge." },
    ],
    when: "• Sparse graph (few edges)\n• 'Sort first, then decide' approach\n• Interview setting — very intuitive to explain",
    notWhen: "If starting from a specific node matters, Prim's is more natural.",
    keywords: ["same as mst", "sparse graph", "sort edges"],
  },
  {
    id: "greedy", emoji: "🎯", label: "Greedy",
    fullName: "Greedy Strategy",
    color: "#5B3DC8", bg: "#EEEAFC",
    family: "Strategy",
    tagline: "Always make the locally best choice — never look back",
    analogy: "Not one algorithm — a strategy. At every step, make the best possible choice right now without reconsidering past decisions.\n\nLike picking the biggest coin every time. Fast and simple. Works perfectly for many problems. Prim's, Kruskal's, Dijkstra's, and nearest-neighbor are all greedy algorithms.",
    memHook: "💰 Coin machine: always dispense biggest coin that fits. No second-guessing.",
    steps: [
      { l: "At each step", t: "Evaluate all available options." },
      { l: "Pick", t: "Choose the locally best option (cheapest, nearest, highest value)." },
      { l: "Commit", t: "Never undo this choice." },
      { l: "Repeat", t: "Until done. Hope local best = global best (it often does)." },
    ],
    when: "• Nearest city problem (always go to closest next)\n• Coin change (standard denominations)\n• Activity scheduling (pick earliest-finishing)\n• When local-best = global-best is provable",
    notWhen: "• Complex dependencies between choices\n• Need to explore all options (use DFS/backtracking)\n• Local best ≠ global best for this problem",
    keywords: ["nearest", "always pick", "minimum number of", "maximum profit", "interval scheduling", "activity selection", "locally optimal"],
  },
];

// ─── PYTHON CODE SNIPPETS ─────────────────────────────────────────────────

const CODE_SNIPPETS = [
  {
    id: "bfs",
    emoji: "🌊",
    label: "BFS",
    color: "#1A6BCC",
    bg: "#E8F1FB",
    description: "Shortest path in an unweighted graph. Uses a queue — visits level by level.",
    code: `from collections import deque

def bfs(graph, start, target):
    visited = set()
    queue = deque([(start, [start])])  # (node, path_so_far)
    visited.add(start)

    while queue:
        node, path = queue.popleft()

        if node == target:
            return path  # shortest path found

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))

    return None  # no path exists

# Example usage
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B'],
    'F': ['C'],
}
print(bfs(graph, 'A', 'F'))  # ['A', 'C', 'F']`,
  },
  {
    id: "dfs",
    emoji: "🌀",
    label: "DFS",
    color: "#6B3FCC",
    bg: "#F0EDFB",
    description: "Explore all paths, detect cycles, find connected components. Uses a stack or recursion.",
    code: `# ── Recursive DFS (find any path) ──
def dfs(graph, node, target, visited=None, path=None):
    if visited is None:
        visited = set()
    if path is None:
        path = []

    visited.add(node)
    path = path + [node]

    if node == target:
        return path

    for neighbor in graph[node]:
        if neighbor not in visited:
            result = dfs(graph, neighbor, target, visited, path)
            if result:
                return result

    return None

# ── Iterative DFS (all connected nodes) ──
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)

    return visited

# Example usage
graph = {'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}
print(dfs(graph, 'A', 'D'))         # ['A', 'B', 'D']
print(dfs_iterative(graph, 'A'))    # {'A', 'B', 'C', 'D'}`,
  },
  {
    id: "dijkstra",
    emoji: "🗺️",
    label: "Dijkstra's",
    color: "#0F7A5A",
    bg: "#E2F5EF",
    description: "Cheapest path from source to all nodes in a weighted graph. Uses a min-heap.",
    code: `import heapq

def dijkstra(graph, start):
    # graph = {node: [(cost, neighbor), ...]}
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]  # (cost, node)

    while heap:
        cost, node = heapq.heappop(heap)

        if cost > dist[node]:  # stale entry — skip
            continue

        for edge_cost, neighbor in graph[node]:
            new_cost = cost + edge_cost
            if new_cost < dist[neighbor]:
                dist[neighbor] = new_cost
                heapq.heappush(heap, (new_cost, neighbor))

    return dist

# Example usage
graph = {
    'A': [(1, 'B'), (4, 'C')],
    'B': [(2, 'C'), (6, 'D')],
    'C': [(3, 'D')],
    'D': [],
}
print(dijkstra(graph, 'A'))  # {'A': 0, 'B': 1, 'C': 3, 'D': 6}`,
  },
  {
    id: "prims",
    emoji: "🌱",
    label: "Prim's (MST)",
    color: "#B84A00",
    bg: "#FCEEE7",
    description: "Find minimum spanning tree by growing from one start node. Uses a min-heap.",
    code: `import heapq

def prims(graph, start):
    # graph = {node: [(cost, neighbor), ...]}
    visited = set()
    mst_cost = 0
    mst_edges = []
    heap = [(0, start, None)]  # (cost, node, from_node)

    while heap:
        cost, node, parent = heapq.heappop(heap)

        if node in visited:
            continue

        visited.add(node)
        mst_cost += cost
        if parent is not None:
            mst_edges.append((parent, node, cost))

        for edge_cost, neighbor in graph[node]:
            if neighbor not in visited:
                heapq.heappush(heap, (edge_cost, neighbor, node))

    return mst_cost, mst_edges

# Example usage
graph = {
    'A': [(1, 'B'), (3, 'C')],
    'B': [(1, 'A'), (2, 'C'), (4, 'D')],
    'C': [(3, 'A'), (2, 'B'), (5, 'D')],
    'D': [(4, 'B'), (5, 'C')],
}
cost, edges = prims(graph, 'A')
print(f"MST cost: {cost}")   # MST cost: 7
print(f"MST edges: {edges}") # [('A','B',1), ('B','C',2), ('B','D',4)]`,
  },
  {
    id: "kruskal",
    emoji: "🔗",
    label: "Kruskal's (MST)",
    color: "#2E7D32",
    bg: "#E8F5E9",
    description: "Find MST by sorting all edges and adding them if they don't create a cycle. Uses Union-Find.",
    code: `def kruskal(nodes, edges):
    # edges = [(cost, u, v), ...]
    edges.sort()  # sort by cost cheapest first

    # Union-Find helpers
    parent = {n: n for n in nodes}
    rank   = {n: 0 for n in nodes}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  # path compression
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False  # same group — would create a cycle
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]:
            rank[px] += 1
        return True

    mst_cost = 0
    mst_edges = []
    for cost, u, v in edges:
        if union(u, v):
            mst_cost += cost
            mst_edges.append((u, v, cost))

    return mst_cost, mst_edges

# Example usage
nodes = ['A', 'B', 'C', 'D']
edges = [(1,'A','B'), (2,'B','C'), (3,'A','C'), (4,'B','D'), (5,'C','D')]
cost, mst = kruskal(nodes, edges)
print(f"MST cost: {cost}")   # MST cost: 7
print(f"MST edges: {mst}")   # [('A','B',1), ('B','C',2), ('B','D',4)]`,
  },
  {
    id: "greedy_nearest",
    emoji: "🎯",
    label: "Greedy Nearest Neighbor",
    color: "#5B3DC8",
    bg: "#EEEAFC",
    description: "Visit all cities by always travelling to the closest unvisited city next.",
    code: `def greedy_nearest_neighbor(dist, start):
    # dist = {(u, v): cost, ...}  (or a 2D matrix)
    cities = list(set(u for u, v in dist))
    visited = [start]
    current = start
    total_cost = 0

    while len(visited) < len(cities):
        unvisited = [c for c in cities if c not in visited]
        # pick the nearest unvisited city
        nearest = min(unvisited, key=lambda c: dist.get((current, c), float('inf')))
        total_cost += dist[(current, nearest)]
        visited.append(nearest)
        current = nearest

    return visited, total_cost

# Example usage
dist = {
    ('A','B'): 2, ('A','C'): 9, ('A','D'): 10,
    ('B','A'): 2, ('B','C'): 6, ('B','D'): 4,
    ('C','A'): 9, ('C','B'): 6, ('C','D'): 3,
    ('D','A'):10, ('D','B'): 4, ('D','C'): 3,
}
route, cost = greedy_nearest_neighbor(dist, 'A')
print(f"Route: {route}")      # ['A', 'B', 'D', 'C']
print(f"Total cost: {cost}")  # 9`,
  },
  {
    id: "sliding_window",
    emoji: "🪟",
    label: "Sliding Window",
    color: "#6B3FCC",
    bg: "#F0EDFB",
    description: "Find longest/best subarray or substring satisfying a constraint. Two pointers on same array.",
    code: `# Longest substring without repeating characters
def longest_unique_substring(s):
    char_set = set()
    left = 0
    max_len = 0

    for right in range(len(s)):
        while s[right] in char_set:  # shrink window from left
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])       # expand window to right
        max_len = max(max_len, right - left + 1)

    return max_len

# Fixed-size window — max sum of k consecutive elements
def max_sum_window(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]  # slide: add right, drop left
        max_sum = max(max_sum, window_sum)

    return max_sum

# Example usage
print(longest_unique_substring('abcabcbb'))  # 3  ('abc')
print(max_sum_window([2, 1, 5, 1, 3, 2], 3)) # 9  (5+1+3)`,
  },
  {
    id: "two_pointer",
    emoji: "👆",
    label: "Two Pointer",
    color: "#0F7A5A",
    bg: "#E2F5EF",
    description: "Find pairs, partition arrays, or reverse in-place. One or two pointers moving toward each other.",
    code: `# ── Two Sum (sorted array) — find pair with target sum ──
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return (left, right)
        elif s < target:
            left += 1
        else:
            right -= 1
    return None

# ── Move zeros to end (in-place) ──
def move_zeros(nums):
    write = 0  # write pointer
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    while write < len(nums):
        nums[write] = 0
        write += 1
    return nums

# Example usage
print(two_sum_sorted([1, 3, 4, 6, 9], 10))  # (1, 4)  → nums[1]+nums[4]=3+9
print(move_zeros([0, 1, 0, 3, 12]))         # [1, 3, 12, 0, 0]`,
  },
  {
    id: "hashmap",
    emoji: "🗂️",
    label: "HashMap / Counter",
    color: "#1A6BCC",
    bg: "#E8F1FB",
    description: "Count frequencies, find duplicates, or look up complements in O(1).",
    code: `from collections import Counter, defaultdict

# ── Two Sum — find indices of two numbers that add to target ──
def two_sum(nums, target):
    seen = {}  # value → index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# ── Most common element ──
def most_common(nums):
    count = Counter(nums)
    return count.most_common(1)[0][0]

# ── Group anagrams together ──
def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = tuple(sorted(word))  # anagrams share the same sorted key
        groups[key].append(word)
    return list(groups.values())

# Example usage
print(two_sum([2, 7, 11, 15], 9))          # [0, 1]
print(most_common([1, 2, 2, 3, 2]))        # 2
print(group_anagrams(['eat','tea','tan','ate','nat','bat']))
# [['eat','tea','ate'], ['tan','nat'], ['bat']]`,
  },
  {
    id: "stack",
    emoji: "📚",
    label: "Stack",
    color: "#2E7D32",
    bg: "#E8F5E9",
    description: "Valid parentheses, nested structures, undo operations. LIFO — last in, first out.",
    code: `# ── Valid parentheses / balanced brackets ──
def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}

    for ch in s:
        if ch in '({[':          # opener — push
            stack.append(ch)
        elif ch in ')}]':        # closer — check match
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()

    return len(stack) == 0       # valid only if nothing left

# ── Evaluate expressions / next greater element ──
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []  # stores indices

    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            result[idx] = num   # num is the next greater for idx
        stack.append(i)

    return result

# Example usage
print(is_valid('{[()]}'))     # True
print(is_valid('([)]'))       # False
print(next_greater([2,1,2,4,3]))  # [4, 2, 4, -1, -1]`,
  },
];

// ─── PROBLEM PATTERNS ──────────────────────────────────────────────────────

const PATTERNS = [
  {
    category: "🗺️ Graph / City / Network problems",
    color: "#1A6BCC", bg: "#E8F1FB",
    rules: [
      {
        signal: "\"shortest path\" or \"minimum steps\" — NO mention of cost/distance on edges",
        algo: "BFS",
        why: "BFS naturally finds shortest path in unweighted graphs — all edges cost '1 step'",
        example: "Find min steps to go from word 'hit' to word 'cog' changing one letter at a time"
      },
      {
        signal: "\"shortest/cheapest path\" + each edge has a weight/distance/cost",
        algo: "Dijkstra's",
        why: "When edges have different costs, BFS fails — Dijkstra handles weights correctly",
        example: "Find cheapest flight route from Delhi to New York"
      },
      {
        signal: "\"connect ALL cities/nodes\" + minimize total cost",
        algo: "MST (Prim's or Kruskal's)",
        why: "MST finds the minimum cost to connect every node — not a path, a network",
        example: "Lay minimum cable to connect all offices in a building"
      },
      {
        signal: "\"visit ALL cities\" + greedy/nearest choice allowed",
        algo: "Greedy Nearest Neighbor",
        why: "No BFS/DFS — just always travel to the closest unvisited city next",
        example: "A salesman must visit every city — find a good (not optimal) route"
      },
      {
        signal: "\"find ANY path\" or \"does a path exist\" or \"all possible paths\"",
        algo: "DFS",
        why: "DFS explores deeply, finds any path, and can enumerate all paths via backtracking",
        example: "Find if there's any route between city A and city B"
      },
      {
        signal: "\"connected components\" or \"detect cycle\" or \"is this graph connected\"",
        algo: "DFS",
        why: "DFS naturally groups nodes and detects back-edges (cycles)",
        example: "How many separate islands exist in this grid?"
      },
    ]
  },
  {
    category: "📋 Array / List problems",
    color: "#0F7A5A", bg: "#E2F5EF",
    rules: [
      {
        signal: "\"two numbers that add to X\" — return indices",
        algo: "HashMap (Two Sum)",
        why: "Store complement in a dict as you go — O(n) instead of O(n²) brute force",
        example: "Find indices of two numbers in array that sum to target"
      },
      {
        signal: "\"find pair with sum K\" — sorted array, return values",
        algo: "Two Pointer",
        why: "Left and right pointers move toward each other — no extra space needed",
        example: "Find all pairs in sorted array [1,3,4,6,9] that sum to 10"
      },
      {
        signal: "\"duplicates\" or \"frequency\" or \"most common element\"",
        algo: "HashMap / Counter",
        why: "Count occurrences in a dict. O(1) lookup per element",
        example: "Find which number appears most in this list"
      },
      {
        signal: "\"move zeros\" or \"partition array\" or \"rearrange in-place\"",
        algo: "Two Pointer",
        why: "One pointer to read, one to write — processes in-place without extra space",
        example: "Move all zeros to end while preserving order of non-zeros"
      },
      {
        signal: "\"rotate\" or \"shift\" array by K positions",
        algo: "Slicing / Math",
        why: "nums[-k:] + nums[:-k] — Python slice does this in one line. Use k % n first.",
        example: "Rotate [1,2,3,4,5] to the right by 2 → [4,5,1,2,3]"
      },
      {
        signal: "\"missing number\" in range 0 to n",
        algo: "Math Formula",
        why: "Expected sum = n*(n+1)/2. Subtract actual sum. Difference = missing number.",
        example: "List has numbers 0–9 with one missing. Which one?"
      },
    ]
  },
  {
    category: "📝 String problems",
    color: "#6B3FCC", bg: "#F0EDFB",
    rules: [
      {
        signal: "\"longest substring\" without repeating / with at most K distinct chars",
        algo: "Sliding Window",
        why: "Expand right, shrink left when constraint violated. Track window with a set/dict.",
        example: "Find longest substring of 'abcabcbb' with no repeated chars"
      },
      {
        signal: "\"anagram\" check or \"same characters different order\"",
        algo: "Sort or Counter",
        why: "sorted(s1) == sorted(s2). Or Counter(s1) == Counter(s2).",
        example: "'listen' and 'silent' — are they anagrams?"
      },
      {
        signal: "\"palindrome\" — reads same forwards and backwards",
        algo: "Two Pointer or Reverse",
        why: "s == s[::-1] for simple case. Two pointers (left, right) for in-place.",
        example: "Is 'racecar' a palindrome?"
      },
      {
        signal: "\"compress\" string or \"run-length encoding\"",
        algo: "Loop + Counter",
        why: "Track current char and count. When char changes, append char+count to result.",
        example: "'aabcccccaaa' → 'a2b1c5a3'"
      },
      {
        signal: "\"valid parentheses\" or \"balanced brackets\" or \"nested\"",
        algo: "Stack",
        why: "Push openers. When you see a closer, pop and check if it matches.",
        example: "Is '{[()]}' valid? What about '([)]'?"
      },
      {
        signal: "\"reverse\" a string or array",
        algo: "Slice / Two Pointer",
        why: "s[::-1] in Python. Or swap with two pointers from both ends.",
        example: "'hello' → 'olleh'"
      },
    ]
  },
  {
    category: "🔢 Number / Math problems",
    color: "#9B6400", bg: "#FBF0DC",
    rules: [
      {
        signal: "\"divisible by 3\" or \"divisible by 5\" or modulo patterns",
        algo: "Modulo (%) operator",
        why: "n % 3 == 0 means divisible by 3. Check most-specific condition first.",
        example: "FizzBuzz — print Fizz/Buzz/FizzBuzz based on divisibility"
      },
      {
        signal: "\"second largest\" or \"kth largest\" element",
        algo: "Sort or One-Pass",
        why: "sorted(set(nums), reverse=True)[k-1]. Or maintain k variables in one pass.",
        example: "Find second largest number in [3,1,4,1,5,9,2,6]"
      },
      {
        signal: "\"count\" something — vowels, specific chars, occurrences",
        algo: "Loop + Counter variable",
        why: "Simple loop with if-condition. Or sum(1 for x in arr if condition).",
        example: "Count vowels in 'hello world'"
      },
    ]
  },
];

// ─── DECISION TREE ─────────────────────────────────────────────────────────

const TREE = [
  {
    q: "Does the problem involve nodes connected by edges? (graph, grid, cities, network)",
    yes: "GRAPH →",
    no: "NOT A GRAPH →",
    yesId: "graph", noId: "nongraph"
  }
];

const DECISION_STEPS = [
  {
    id: "start",
    q: "Step 1: Is this a GRAPH problem? (cities, nodes, connections, grid, network)",
    options: [
      { label: "Yes — graph/cities/network", next: "graph_weighted" },
      { label: "No — arrays, strings, numbers", next: "nongraph" },
    ]
  },
  {
    id: "graph_weighted",
    q: "Step 2: Do the connections have WEIGHTS? (distance, cost, time between cities)",
    options: [
      { label: "Yes — each edge has a cost/distance", next: "graph_goal" },
      { label: "No — just connections, no weights", next: "graph_unweighted" },
    ]
  },
  {
    id: "graph_goal",
    q: "Step 3: What's the goal?",
    options: [
      { label: "Find cheapest path from A to B", result: "dijkstra" },
      { label: "Connect ALL nodes with min total cost", result: "mst" },
      { label: "Visit all nodes, always go to nearest", result: "greedy" },
    ]
  },
  {
    id: "graph_unweighted",
    q: "Step 3: What's the goal?",
    options: [
      { label: "Shortest path (fewest hops) A → B", result: "bfs" },
      { label: "Find ANY path or ALL paths", result: "dfs" },
      { label: "Detect cycles or connected groups", result: "dfs" },
    ]
  },
  {
    id: "nongraph",
    q: "Step 2: What kind of data?",
    options: [
      { label: "Array of numbers", next: "array" },
      { label: "String / characters", next: "string" },
    ]
  },
  {
    id: "array",
    q: "Step 3: What's the task?",
    options: [
      { label: "Find two numbers that sum to X", result: "hashmap" },
      { label: "Find duplicate / frequency / most common", result: "hashmap" },
      { label: "Move/partition elements in place", result: "twopointer" },
      { label: "Find missing number", result: "math" },
    ]
  },
  {
    id: "string",
    q: "Step 3: What's the task?",
    options: [
      { label: "Longest substring without repeat", result: "sliding" },
      { label: "Check anagram / palindrome", result: "sort_counter" },
      { label: "Valid parentheses / brackets", result: "stack" },
      { label: "Compress / reverse / transform", result: "loop" },
    ]
  },
];

const RESULTS = {
  bfs: { label: "BFS 🌊", color: "#1A6BCC", bg: "#E8F1FB", tip: "Use a queue. Visit level by level. Tracks visited set." },
  dfs: { label: "DFS 🌀", color: "#6B3FCC", bg: "#F0EDFB", tip: "Use a stack or recursion. Go deep, backtrack. Tracks visited set." },
  dijkstra: { label: "Dijkstra's 🗺️", color: "#0F7A5A", bg: "#E2F5EF", tip: "Use a min-heap (priority queue). Track cheapest cost to each node." },
  mst: { label: "MST — Prim's or Kruskal's 🌲", color: "#9B6400", bg: "#FBF0DC", tip: "Prim's: grow from one node. Kruskal's: sort all edges, add if no cycle." },
  greedy: { label: "Greedy Nearest Neighbor 🎯", color: "#5B3DC8", bg: "#EEEAFC", tip: "No BFS/DFS. Always pick closest unvisited node. Use visited set." },
  hashmap: { label: "HashMap / Counter 🗂️", color: "#1A6BCC", bg: "#E8F1FB", tip: "dict or collections.Counter. Lookup in O(1). Store complement or count." },
  twopointer: { label: "Two Pointer 👆👆", color: "#0F7A5A", bg: "#E2F5EF", tip: "left and right pointers. Move inward or use write-pointer for in-place." },
  math: { label: "Math Formula ➕", color: "#9B6400", bg: "#FBF0DC", tip: "Sum formula n*(n+1)//2. Subtract actual sum. Difference = answer." },
  sliding: { label: "Sliding Window 🪟", color: "#6B3FCC", bg: "#F0EDFB", tip: "left and right pointers. Expand right, shrink left when constraint violated." },
  sort_counter: { label: "Sort or Counter 🔢", color: "#B84A00", bg: "#FCEEE7", tip: "sorted(s1)==sorted(s2) for anagram. s==s[::-1] for palindrome." },
  stack: { label: "Stack 📚", color: "#2E7D32", bg: "#E8F5E9", tip: "Python list as stack. Push openers. Pop when you see a closer and verify match." },
  loop: { label: "Simple Loop 🔄", color: "#5B3DC8", bg: "#EEEAFC", tip: "Track current char + count. Append to result when char changes." },
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────

export default function App() {
  const [mainTab, setMainTab] = useState("identify");
  const [activeCode, setActiveCode] = useState("bfs");
  const [activeAlgo, setActiveAlgo] = useState("bfs");
  const [decisionStep, setDecisionStep] = useState("start");
  const [decisionResult, setDecisionResult] = useState(null);
  const [decisionHistory, setDecisionHistory] = useState([]);

  const algo = ALGOS.find(a => a.id === activeAlgo);
  const step = DECISION_STEPS.find(s => s.id === decisionStep);
  const result = decisionResult ? RESULTS[decisionResult] : null;

  function choose(option) {
    const newHistory = [...decisionHistory, { stepId: decisionStep, choice: option.label }];
    setDecisionHistory(newHistory);
    if (option.result) {
      setDecisionResult(option.result);
    } else if (option.next) {
      setDecisionStep(option.next);
    }
  }

  function resetDecision() {
    setDecisionStep("start");
    setDecisionResult(null);
    setDecisionHistory([]);
  }

  const tabStyle = (t) => ({
    padding: "10px 18px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: mainTab === t ? 600 : 400,
    color: mainTab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
    borderBottom: mainTab === t ? "2px solid var(--color-text-primary)" : "2px solid transparent",
    marginBottom: -1,
    fontFamily: "var(--font-sans)",
    transition: "all 0.15s",
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)", paddingBottom: "3rem" }}>

      {/* Main tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "1.5rem" }}>
        <button style={tabStyle("identify")} onClick={() => setMainTab("identify")}>🔍 Identify the Algorithm</button>
        <button style={tabStyle("decision")} onClick={() => setMainTab("decision")}>🌳 Decision Tree</button>
        <button style={tabStyle("learn")} onClick={() => setMainTab("learn")}>📖 Learn Each Algorithm</button>
        <button style={tabStyle("compare")} onClick={() => setMainTab("compare")}>📊 Quick Compare</button>
        <button style={tabStyle("code")} onClick={() => setMainTab("code")}>🐍 Python Code</button>
      </div>

      {/* ── TAB: IDENTIFY ── */}
      {mainTab === "identify" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text-primary)" }}>How to identify which algorithm to use</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              When you read a problem, scan for these signal words and patterns. Each one points to a specific algorithm.
            </p>
          </div>
          {PATTERNS.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `2px solid ${cat.color}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: cat.color }}>{cat.category}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cat.rules.map((rule, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                    {/* Signal */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 5 }}>If you see this in the problem</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55, fontStyle: "italic" }}>"{rule.signal}"</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>e.g. {rule.example}</div>
                    </div>
                    {/* Arrow */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: cat.color, fontSize: 20, padding: "0 4px" }}>→</div>
                    {/* Algorithm */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 5 }}>Use this</div>
                      <div style={{ display: "inline-block", fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: cat.bg, color: cat.color, marginBottom: 5 }}>{rule.algo}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>{rule.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: DECISION TREE ── */}
      {mainTab === "decision" && (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px" }}>Algorithm Decision Tree</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>Answer these questions about your problem to find the right algorithm.</p>
          </div>

          {/* History */}
          {decisionHistory.length > 0 && (
            <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
              {decisionHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0, color: "var(--color-text-secondary)", marginTop: 2 }}>{i + 1}</div>
                  <div style={{ flex: 1, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 13, color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>You chose: </span>{h.choice}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current question or result */}
          {!decisionResult ? (
            <div style={{ padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 12, border: "0.5px solid var(--color-border-secondary)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 10 }}>
                Question {decisionHistory.length + 1}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{step?.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {step?.options.map((opt, i) => (
                  <button key={i} onClick={() => choose(opt)} style={{
                    padding: "12px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                    background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14,
                    color: "var(--color-text-primary)", textAlign: "left", fontFamily: "var(--font-sans)",
                    transition: "all 0.12s",
                  }}
                    onMouseEnter={e => e.target.style.borderColor = "#1A6BCC"}
                    onMouseLeave={e => e.target.style.borderColor = "var(--color-border-secondary)"}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "1.5rem", background: result.bg, borderRadius: 12, border: `2px solid ${result.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: result.color, marginBottom: 10 }}>
                ✅ Algorithm identified
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: result.color, marginBottom: 10 }}>{result.label}</div>
              <div style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: "1.25rem" }}>{result.tip}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={resetDecision} style={{ padding: "10px 20px", borderRadius: 8, background: result.color, color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                  ↺ Try another problem
                </button>
                <button onClick={() => { setMainTab("learn"); setActiveAlgo(decisionResult in RESULTS && ALGOS.find(a=>a.id===decisionResult) ? decisionResult : "bfs"); resetDecision(); }} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", color: result.color, border: `1.5px solid ${result.color}`, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                  Learn this algorithm →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: LEARN ── */}
      {mainTab === "learn" && (
        <div>
          {/* Algo selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {ALGOS.map(a => (
              <button key={a.id} onClick={() => setActiveAlgo(a.id)} style={{
                padding: "8px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                background: activeAlgo === a.id ? a.color : "var(--color-background-secondary)",
                color: activeAlgo === a.id ? "white" : "var(--color-text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: activeAlgo === a.id ? 500 : 400,
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}>{a.emoji} {a.label}</button>
            ))}
          </div>

          {/* Algo card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <span style={{ fontSize: 36 }}>{algo.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>{algo.fullName}</h2>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: algo.bg, color: algo.color }}>{algo.family}</span>
                  </div>
                  <div style={{ fontSize: 14, color: algo.color, fontWeight: 500, marginTop: 3 }}>{algo.tagline}</div>
                </div>
              </div>

              <div style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: "1rem" }}>{algo.analogy}</div>

              <div style={{ padding: "12px 14px", background: algo.bg, borderRadius: 8, fontSize: 13, color: algo.color, fontWeight: 500 }}>{algo.memHook}</div>

              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 8 }}>Signal keywords (when you see these → use this)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {algo.keywords.map((kw, i) => (
                    <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 100, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 8 }}>How it works — step by step</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {algo.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: algo.bg, color: algo.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                      <div style={{ flex: 1, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: algo.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}: </span>
                        <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55 }}>{s.t}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "1rem", background: "#E2F5EF", borderRadius: 8, borderLeft: "3px solid #0F7A5A" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#0F7A5A", marginBottom: 6 }}>Use when</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{algo.when}</div>
                </div>
                <div style={{ padding: "1rem", background: "#FCEBEB", borderRadius: 8, borderLeft: "3px solid #CC2A2A" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#CC2A2A", marginBottom: 6 }}>Don't use when</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{algo.notWhen}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CODE ── */}
      {mainTab === "code" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: "var(--color-text-primary)" }}>Python Code Templates</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Clean, copy-paste ready implementations. Each snippet is self-contained with an example.
            </p>
          </div>

          {/* Selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {CODE_SNIPPETS.map(s => (
              <button key={s.id} onClick={() => setActiveCode(s.id)} style={{
                padding: "8px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                background: activeCode === s.id ? s.color : "var(--color-background-secondary)",
                color: activeCode === s.id ? "white" : "var(--color-text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: activeCode === s.id ? 500 : 400,
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}>{s.emoji} {s.label}</button>
            ))}
          </div>

          {/* Code card */}
          {(() => {
            const s = CODE_SNIPPETS.find(x => x.id === activeCode);
            if (!s) return null;
            return (
              <div style={{ borderRadius: 12, border: `1.5px solid ${s.color}`, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: s.bg, borderBottom: `1px solid ${s.color}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2, lineHeight: 1.5 }}>{s.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(s.code)}
                    style={{
                      padding: "7px 14px", borderRadius: 7, border: `1.5px solid ${s.color}`,
                      background: "transparent", color: s.color, cursor: "pointer",
                      fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                      transition: "all 0.15s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { e.target.style.background = s.color; e.target.style.color = "white"; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = s.color; }}
                  >
                    📋 Copy
                  </button>
                </div>
                {/* Code block */}
                <div style={{
                  background: "#1e1e2e",
                  padding: "1.25rem 1.5rem",
                  overflowX: "auto",
                  margin: 0,
                }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: "#cdd6f4",
                    whiteSpace: "pre",
                  }}>{s.code}</pre>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB: COMPARE ── */}
      {mainTab === "compare" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 1.25rem", color: "var(--color-text-primary)" }}>Algorithm Quick Reference</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  {["Algorithm", "What it does", "Needs weights?", "Data structure", "Output", "Keyword trigger"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { algo: ALGOS[0], what: "Visit nodes level-by-level", weights: "No", ds: "Queue", out: "Shortest path (hops)", kw: "\"shortest path\" / \"min steps\"" },
                  { algo: ALGOS[1], what: "Go deep, backtrack", weights: "No", ds: "Stack / recursion", out: "Any/all paths", kw: "\"all paths\" / \"detect cycle\"" },
                  { algo: ALGOS[2], what: "Cheapest path A → B", weights: "Yes", ds: "Min-heap", out: "Min cost path", kw: "\"cheapest/shortest route\"" },
                  { algo: ALGOS[3], what: "Connect ALL nodes cheaply", weights: "Yes", ds: "Concept", out: "Min cost network", kw: "\"connect all\" / \"min network\"" },
                  { algo: ALGOS[4], what: "Grow MST from one node", weights: "Yes", ds: "Min-heap", out: "MST edges", kw: "Dense graph + connect all" },
                  { algo: ALGOS[5], what: "Add cheapest edges, skip loops", weights: "Yes", ds: "Sort + Union-Find", out: "MST edges", kw: "Sparse graph + connect all" },
                  { algo: ALGOS[6], what: "Always pick locally best option", weights: "Optional", ds: "None (or heap)", out: "Good-enough solution", kw: "\"nearest\" / \"always pick best\"" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: row.algo.color }}>{row.algo.emoji} {row.algo.label}</span>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{row.algo.family}</div>
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-text-primary)", lineHeight: 1.5 }}>{row.what}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 12, background: row.weights === "Yes" ? "#E2F5EF" : "#FCEBEB", color: row.weights === "Yes" ? "#0F7A5A" : "#CC2A2A", fontWeight: 500 }}>{row.weights}</span>
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-text-secondary)", fontSize: 12 }}>{row.ds}</td>
                    <td style={{ padding: "12px", color: "var(--color-text-primary)", fontSize: 12, lineHeight: 1.5 }}>{row.out}</td>
                    <td style={{ padding: "12px", color: "var(--color-text-secondary)", fontSize: 12, fontStyle: "italic" }}>{row.kw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 12 }}>🧠 One-line memory hooks</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {ALGOS.map(a => (
                <div key={a.id} style={{ fontSize: 13, lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 600, color: a.color }}>{a.emoji} {a.label}: </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{a.tagline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
