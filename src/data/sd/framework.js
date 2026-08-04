// ─── SYSTEM DESIGN — THE FRAMEWORK ──────────────────────────────────────────
// How to run the round, what's being scored, and the estimation muscle.

export const ROUND = {
  h: "What a system design round actually is",
  blurb: "45–60 minutes, deliberately open-ended. You're handed a vague problem and the interviewer watches how you turn it into a design. The problem is never the point — the reasoning is. Two candidates can produce the same final diagram and score very differently based on how they got there.",
  truths: [
    "There is NO single correct answer. There are defensible designs and indefensible ones.",
    "Silence is the worst failure mode. If you're thinking, narrate the thinking.",
    "The interviewer is a collaborator, not an examiner. Ask them things. Check in before going deep.",
    "You will NOT finish. Nobody finishes. Cover the breadth first, then go deep where they steer you.",
    "Every choice must come with a tradeoff. \"I'd use Kafka\" is weak. \"I'd use a log-based queue because I need replay and multiple consumers; the cost is operational complexity versus SQS\" is strong.",
  ],
  antipatterns: [
    { bad: "Jumping straight to a diagram", why: "You've designed for a problem nobody agreed on. Requirements first, always." },
    { bad: "Name-dropping technologies", why: "\"I'd use Redis, Kafka, Cassandra\" with no reasoning reads as pattern-matching, not thinking." },
    { bad: "Designing for Google scale unprompted", why: "If it's 1,000 users, a single Postgres box is the right answer. Over-engineering is a real negative signal." },
    { bad: "Ignoring the data model", why: "Most designs live or die on the schema and access patterns. Skipping it is skipping the hard part." },
    { bad: "Never mentioning failure", why: "Senior engineers think about what breaks. If everything in your design works perfectly, you haven't designed it." },
    { bad: "Not managing the clock", why: "Spending 25 minutes on requirements means no design. Watch the time and say what you're skipping." },
  ],
};

export const PHASES = [
  {
    n: 1,
    name: "Clarify & scope",
    time: "5–8 min",
    color: "#1A73E8",
    goal: "Convert an ambiguous prompt into an agreed, bounded problem.",
    doThis: [
      "Restate the problem in one sentence and get agreement.",
      "Ask WHO the users are and WHAT the core journey is.",
      "Separate FUNCTIONAL requirements (what it does) from NON-FUNCTIONAL (how well).",
      "Explicitly declare what is OUT of scope — \"I'll assume auth exists and not design it, agreed?\"",
      "Ask for scale numbers. If they say \"you tell me,\" state an assumption and move on.",
    ],
    questions: [
      "Who uses this, and what's the single most important thing they do?",
      "How many users / requests / items? Read-heavy or write-heavy?",
      "What's the latency expectation — interactive (sub-second) or batch (minutes)?",
      "How consistent does this need to be? Is stale data by a few seconds acceptable?",
      "What's the cost of the system being down for an hour? For a day?",
      "Is this greenfield, or does it integrate with existing systems?",
      "Are there compliance, residency, or tenancy constraints?",
    ],
    output: "A short written list on the board: 3–5 functional requirements, 3–4 non-functional targets, and an explicit out-of-scope line.",
  },
  {
    n: 2,
    name: "Estimate",
    time: "3–5 min",
    color: "#0F7A5A",
    goal: "Size the problem so your design decisions have a reason.",
    doThis: [
      "Compute QPS: daily actions ÷ 86,400, then peak = 2–5× average.",
      "Compute storage: bytes per record × records per day × retention.",
      "Compute bandwidth if media is involved.",
      "Round aggressively. 86,400 is ~100k. Nobody wants precision.",
      "State the SO WHAT: \"That's ~1,200 QPS peak, which one well-tuned Postgres can't serve for reads, so I'll need caching.\"",
    ],
    questions: [],
    output: "Three numbers — peak QPS, storage/year, and the single constraint they imply.",
    warning: "The estimate is only worth doing if you USE it. An unused calculation is wasted minutes. Every number should justify a later decision.",
  },
  {
    n: 3,
    name: "API & data model",
    time: "5–8 min",
    color: "#6A1B9A",
    goal: "Pin down the contract and the schema before drawing boxes.",
    doThis: [
      "Sketch 3–5 core endpoints with their inputs and outputs. This forces the interface to be concrete.",
      "Define the main entities and their relationships.",
      "State the ACCESS PATTERNS — how is this data read? That drives the storage choice, not the other way around.",
      "Call out the primary key / partition key and why.",
    ],
    questions: [],
    output: "A handful of endpoints and a small schema. This is where most weak designs are exposed — vague schemas mean vague thinking.",
  },
  {
    n: 4,
    name: "High-level design",
    time: "10–15 min",
    color: "#B84A00",
    goal: "Draw the boxes and arrows for the happy path, end to end.",
    doThis: [
      "Start with the simplest thing that satisfies the requirements. Client → API → DB.",
      "Trace ONE request all the way through, out loud.",
      "Add components only when you can name the requirement that forces them.",
      "Keep it to 6–10 boxes. A cluttered diagram signals unclear thinking.",
      "Check in: \"That's the core flow — want me to go deeper anywhere, or keep building out?\"",
    ],
    questions: [],
    output: "A clean diagram plus a narrated request trace.",
  },
  {
    n: 5,
    name: "Deep dive",
    time: "10–15 min",
    color: "#C62828",
    goal: "Go three levels down on whichever component matters most.",
    doThis: [
      "Let the interviewer steer. If they don't, pick the component with the most interesting tradeoff.",
      "Common deep-dive targets: the data partitioning scheme, the write path under contention, the cache invalidation strategy, the queue's delivery guarantees.",
      "Show the algorithm or the state machine, not just the box.",
      "This is where seniority shows. Breadth gets you to the bar; one genuine depth dive gets you past it.",
    ],
    questions: [],
    output: "A concrete mechanism — the actual sharding key, the actual retry policy, the actual consistency guarantee.",
  },
  {
    n: 6,
    name: "Bottlenecks, failure & scale",
    time: "5–8 min",
    color: "#37474F",
    goal: "Prove you've thought about what happens when it breaks.",
    doThis: [
      "Name the single points of failure and how you'd remove them.",
      "Walk through what happens when each dependency is slow, then when it's down.",
      "Describe the degraded mode — what still works when the fancy part fails?",
      "Say how you'd know: the specific metrics and alerts.",
      "Then scale it: \"If traffic 10×'d tomorrow, the first thing to break is X, and I'd fix it by Y.\"",
    ],
    questions: [],
    output: "A short list of failure modes with mitigations, and the observability story.",
  },
  {
    n: 7,
    name: "Wrap",
    time: "2–3 min",
    color: "#827717",
    goal: "Land it. Do not just trail off.",
    doThis: [
      "Summarize the design in three sentences.",
      "Name the two biggest tradeoffs you made and what you'd revisit.",
      "State what you'd build FIRST if you had two weeks — the MVP slice.",
      "Name what you deliberately didn't cover, so they know it was a choice not an oversight.",
    ],
    questions: [],
    output: "A crisp summary that shows you know where the bodies are buried.",
  },
];

export const REQUIREMENTS_CHECKLIST = {
  h: "Requirements — the two lists to always write down",
  functional: {
    label: "Functional (what it does)",
    color: "#0F7A5A",
    items: [
      "The 3–5 core user actions. Verbs: post, search, upload, notify, approve.",
      "Who initiates each one — user, admin, another system, a schedule?",
      "What the system produces as output — a record, a message, a file, a decision?",
      "What is explicitly NOT in scope.",
    ],
  },
  nonFunctional: {
    label: "Non-functional (how well)",
    color: "#C62828",
    items: [
      "SCALE — users, QPS, data volume, growth rate.",
      "LATENCY — p50 and p99 targets. \"Fast\" is not a target; \"p99 under 300ms\" is.",
      "AVAILABILITY — three nines (8.7h/yr down) vs four (52min) vs five (5min). Each nine costs real money.",
      "CONSISTENCY — can a user read stale data? For how long? Which operations must be strongly consistent?",
      "DURABILITY — is losing a record acceptable? Ever?",
      "SECURITY & TENANCY — multi-tenant isolation, PII, audit, data residency.",
      "COST — is this a cost-sensitive workload? That changes the architecture.",
    ],
  },
  tip: "State the non-functional requirements as NUMBERS and get agreement. They are what justify every subsequent decision. If you never establish a latency target, you can't defend adding a cache.",
};

// ─── ESTIMATION ─────────────────────────────────────────────────────────────

export const ESTIMATION = {
  h: "Back-of-envelope estimation",
  intro: "The point is not precision. The point is knowing whether you need one machine or a thousand, because that changes the entire design. Round hard and move fast.",
  rounding: [
    "Seconds in a day ≈ 86,400 → call it 100,000 (10⁵).",
    "Seconds in a month ≈ 2.5 million. In a year ≈ 31.5 million (3×10⁷).",
    "1 million writes/day ≈ 12 writes/sec. 1 billion/day ≈ 12,000/sec.",
    "Peak is typically 2–5× average. Use 3× unless told otherwise.",
    "Read:write ratios: social feeds ~100:1, e-commerce ~10:1, logging ~1:100.",
  ],
  dataSizes: {
    headers: ["Item", "Rough size"],
    rows: [
      ["char / boolean", "1 byte"],
      ["int / float", "4 bytes"],
      ["long / double / timestamp", "8 bytes"],
      ["UUID", "16 bytes"],
      ["A short text row (id, fk, timestamps, small strings)", "~100 bytes – 1 KB"],
      ["A typical JSON API response", "1–10 KB"],
      ["A web page (HTML only)", "~100 KB"],
      ["A compressed photo", "~200 KB – 2 MB"],
      ["1 minute of 1080p video", "~50 MB"],
      ["An embedding vector (768 dims, float32)", "~3 KB"],
      ["An LLM token", "~4 characters ≈ 4 bytes"],
    ],
  },
  powers: {
    headers: ["Power", "Approx", "Name", "Feels like"],
    rows: [
      ["2¹⁰", "1 thousand", "KB", "a paragraph"],
      ["2²⁰", "1 million", "MB", "a photo"],
      ["2³⁰", "1 billion", "GB", "a movie"],
      ["2⁴⁰", "1 trillion", "TB", "a small company's database"],
      ["2⁵⁰", "1 quadrillion", "PB", "a large company's data lake"],
    ],
  },
  worked: {
    h: "A worked example — sizing a write-heavy service",
    body: "\"10 million daily active users, each performing 5 write actions a day. Each record is ~1 KB. Retain for 3 years.\"\n\nWRITES\n  10M users × 5 actions = 50M writes/day\n  50M ÷ 100,000 sec ≈ 500 writes/sec average\n  Peak at 3× ≈ 1,500 writes/sec\n\nSTORAGE\n  50M × 1 KB = 50 GB/day\n  50 GB × 365 × 3 ≈ 55 TB over 3 years\n  With replication factor 3 ≈ 165 TB raw\n\nREADS (assume 20:1 read:write)\n  ~10,000 reads/sec average, ~30,000 peak\n\nSO WHAT — and this is the part that matters:\n  • 1,500 writes/sec is comfortably within one well-tuned Postgres primary. I do NOT need to shard on day one.\n  • 30,000 reads/sec is NOT. I need read replicas plus a cache layer.\n  • 55 TB will not fit on one box, so I need a partitioning plan before year two, or cold-storage tiering.\n  • The cache is sized for the hot set, not the whole dataset — if 10% of records are 90% of reads, I need ~5 GB of cache, which is one Redis node.\n\nThat last block is the whole reason to estimate. The numbers pick the architecture.",
  },
  serverMath: {
    h: "How much can one machine actually do?",
    rows: [
      ["A single modern server, simple request handling", "~10,000–50,000 QPS"],
      ["One well-tuned Postgres, simple indexed reads", "~5,000–20,000 QPS"],
      ["One Postgres, writes with fsync", "~1,000–5,000 TPS"],
      ["One Redis node", "~100,000+ ops/sec"],
      ["One Kafka broker", "~100,000+ messages/sec"],
      ["Nginx as a reverse proxy", "~50,000+ RPS"],
      ["An LLM call (large model, streaming)", "~1 request per second per concurrent slot"],
    ],
    note: "Notice the last row. AI-heavy systems are 3–4 orders of magnitude slower per operation than conventional ones. A design that comfortably handles 10,000 QPS of CRUD will fall over at 50 QPS of LLM calls. This is the single most important sizing intuition for AI-backed products, and it drives everything: batching, caching, model routing, async processing.",
  },
};

export const LATENCY_NUMBERS = {
  h: "Latency numbers to have in your head",
  note: "You don't need these exactly. You need the ORDERS OF MAGNITUDE, so you can say \"that's a network hop, so ~1ms, not ~1μs\" without hesitating.",
  rows: [
    { op: "L1 cache reference", ns: 1, human: "1 ns" },
    { op: "Branch mispredict", ns: 3, human: "3 ns" },
    { op: "L2 cache reference", ns: 4, human: "4 ns" },
    { op: "Mutex lock/unlock", ns: 17, human: "17 ns" },
    { op: "Main memory reference", ns: 100, human: "100 ns" },
    { op: "Compress 1 KB", ns: 2000, human: "2 μs" },
    { op: "Send 1 KB over 1 Gbps network", ns: 10000, human: "10 μs" },
    { op: "Read 4 KB randomly from SSD", ns: 150000, human: "150 μs" },
    { op: "Read 1 MB sequentially from memory", ns: 250000, human: "250 μs" },
    { op: "Round trip within same datacenter", ns: 500000, human: "500 μs" },
    { op: "Read 1 MB sequentially from SSD", ns: 1000000, human: "1 ms" },
    { op: "Disk seek (spinning)", ns: 10000000, human: "10 ms" },
    { op: "Read 1 MB sequentially from disk", ns: 20000000, human: "20 ms" },
    { op: "Round trip across continents", ns: 150000000, human: "150 ms" },
    { op: "LLM time-to-first-token (large model)", ns: 500000000, human: "~500 ms" },
    { op: "LLM full response (streaming, ~500 tokens)", ns: 5000000000, human: "~5 s" },
  ],
  takeaways: [
    "Memory is ~100× faster than SSD. SSD is ~100× faster than a spinning disk seek.",
    "A same-datacenter round trip (~0.5 ms) is ~5,000× slower than a memory reference. Network calls are the expensive thing in most designs.",
    "Cross-continent is ~150 ms. If your user is in another region, you cannot hide that with backend optimization — you need edge presence or async UX.",
    "An LLM call is ~1,000× slower than a database query. Any design that puts an LLM on a synchronous, high-QPS path is broken; you need queuing, caching, or a smaller model.",
    "Reading 1 MB sequentially from SSD (~1 ms) is comparable to a few network round trips. Sequential access is dramatically cheaper than random — this is why log-structured storage wins for writes.",
  ],
};

export const AVAILABILITY = {
  h: "Availability — what the nines actually cost you",
  headers: ["Availability", "Downtime / year", "Downtime / month", "What it takes"],
  rows: [
    ["99% (two nines)", "3.65 days", "7.2 hours", "A single server you restart when it breaks"],
    ["99.9% (three nines)", "8.76 hours", "43.8 minutes", "Redundancy, health checks, automated restarts"],
    ["99.95%", "4.38 hours", "21.9 minutes", "Multi-AZ, load balancing, fast failover"],
    ["99.99% (four nines)", "52.6 minutes", "4.4 minutes", "Multi-region-capable, no single points of failure, tested failover, on-call"],
    ["99.999% (five nines)", "5.26 minutes", "26 seconds", "Active-active multi-region, chaos-tested, very expensive"],
  ],
  note: "Each additional nine roughly multiplies cost and operational burden. The senior move is asking what the business actually needs rather than reflexively designing for five nines. Most internal enterprise tools are genuinely fine at three.\n\nAlso: dependencies MULTIPLY. A service calling five dependencies each at 99.9% has a theoretical ceiling of 99.5% (0.999⁵) unless you add fallbacks, caching, or graceful degradation. Saying this unprompted is a strong signal.",
};

export const SCORING = {
  h: "What's actually being scored",
  axes: [
    { axis: "Problem framing", weight: "high", what: "Do you convert ambiguity into a bounded, agreed problem — or do you start drawing immediately?" },
    { axis: "Structured thinking", weight: "high", what: "Can the interviewer follow your reasoning? Do you work top-down rather than jumping around?" },
    { axis: "Technical depth", weight: "high", what: "When pushed on one component, can you go three levels down with real mechanisms?" },
    { axis: "Tradeoff reasoning", weight: "high", what: "Every choice paired with its cost, and an articulated alternative you rejected and why." },
    { axis: "Practical judgement", weight: "medium", what: "Right-sizing. Not over-engineering. Knowing when boring technology is correct." },
    { axis: "Failure thinking", weight: "medium", what: "What breaks, how you'd detect it, what degraded mode looks like." },
    { axis: "Communication", weight: "medium", what: "Narrating continuously, checking in, being easy to collaborate with." },
  ],
  seniorSignals: [
    "Asking about the cost of downtime before choosing an availability target.",
    "Proposing the boring solution first and naming what would force something fancier.",
    "Saying \"I don't need to shard yet, and here's the number at which I would.\"",
    "Naming an operational burden: \"this adds a stateful system someone has to run at 3am.\"",
    "Explicitly designing the degraded mode, not just the happy path.",
    "Volunteering what you'd measure to know the design is working.",
    "Distinguishing what you'd build in week one from the eventual architecture.",
  ],
};
