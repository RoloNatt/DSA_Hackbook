// ─── BUILDING BLOCKS, DATA & DISTRIBUTED SYSTEMS ────────────────────────────

export const COMPONENTS = [
  {
    id: "lb", emoji: "⚖️", name: "Load Balancer", color: "#1A73E8", bg: "#E8F0FE",
    what: "Distributes incoming requests across a pool of servers, and removes unhealthy ones from rotation.",
    why: "Horizontal scale and availability. Without it, one machine is both your ceiling and your single point of failure.",
    detail: "L4 (transport) balances on IP/port — fast, protocol-agnostic, no visibility into the request. L7 (application) reads the HTTP request, so it can route by path or header, terminate TLS, and retry idempotent requests — at higher cost.\n\nAlgorithms: round-robin (simple, ignores load), least-connections (better with variable request cost), consistent hashing (sticky routing, essential for cache locality), weighted (heterogeneous machines).\n\nHealth checks are the part people forget: passive (mark down after N failures) plus active (periodic probe). Aggressive health checks can amplify an outage by ejecting the whole fleet — bound the maximum ejection percentage.",
    tradeoff: "Adds a hop (~1ms) and becomes a critical dependency. It must itself be redundant, usually via DNS or an anycast VIP.",
    ask: "Do I need sticky sessions? If yes, my app is stateful and I should ask whether that's fixable instead.",
  },
  {
    id: "cache", emoji: "⚡", name: "Cache", color: "#B84A00", bg: "#FCEEE7",
    what: "A fast key-value store holding a subset of data closer to the reader.",
    why: "Reads are usually 10–100× more frequent than writes, and most reads hit a small hot subset. Caching turns a 10ms DB query into a 0.5ms lookup.",
    detail: "WHERE: client → CDN → API gateway → application (in-process) → distributed cache (Redis/Memcached) → database buffer pool. Each layer catches a different miss.\n\nSTRATEGIES:\n• Cache-aside (lazy) — app checks cache, on miss reads DB and populates. Most common. Risk: thundering herd on a cold key.\n• Read-through — cache library owns the DB read. Cleaner app code, less control.\n• Write-through — write to cache and DB together. Consistent, slower writes.\n• Write-behind — write to cache, flush to DB async. Fast, risks data loss.\n• Refresh-ahead — proactively refresh hot keys before expiry.\n\nEVICTION: LRU (default, good), LFU (better for skewed access), TTL (simple, bounds staleness), FIFO (rarely right).",
    tradeoff: "Cache invalidation is genuinely hard. Every cache adds a consistency window and a new failure mode. A cache that goes down can take your database with it — the sudden 100% miss rate is a self-inflicted DDoS.",
    ask: "What's my acceptable staleness? That single answer picks the strategy and the TTL.",
    pitfalls: "• THUNDERING HERD — a hot key expires, 10,000 requests all miss and hit the DB simultaneously. Fix: request coalescing (single-flight), staggered TTLs with jitter, or a lock on repopulation.\n• CACHE PENETRATION — repeated lookups for keys that don't exist bypass the cache entirely. Fix: cache the negative result, or a bloom filter.\n• CACHE STAMPEDE ON RESTART — a cold cache after deploy. Fix: warm it, or roll gradually.\n• Hot-key skew — one celebrity key saturates one node. Fix: replicate that key across nodes with a random suffix.",
  },
  {
    id: "queue", emoji: "📬", name: "Message Queue / Log", color: "#6A1B9A", bg: "#F3E5F5",
    what: "A durable buffer that decouples producers from consumers in time.",
    why: "Absorbs traffic spikes, lets slow work happen asynchronously, isolates failure, and enables retries without blocking the user.",
    detail: "TWO FAMILIES, and conflating them is a common mistake:\n\n• QUEUE (SQS, RabbitMQ) — a message is consumed and deleted. Work distribution. Competing consumers each take different messages. Simple, no replay.\n• LOG (Kafka, Kinesis, Pulsar) — an append-only ordered log with consumer offsets. Messages persist after reading. Multiple independent consumer groups can each read everything, and you can REPLAY from any offset. Ordered within a partition only.\n\nChoose a log when you need replay, multiple consumers of the same stream, event sourcing, or ordering. Choose a queue when you just need to hand off work.\n\nDELIVERY GUARANTEES: at-most-once (fire and forget, can lose), at-least-once (the practical default, can duplicate), exactly-once (only achievable end-to-end with idempotency or transactional writes — treat vendor claims skeptically).",
    tradeoff: "Async makes the system harder to reason about and debug. You now need dead-letter queues, poison-message handling, backlog monitoring, and consumer-lag alerts. The user-facing UX also changes — you're now returning \"accepted\" not \"done.\"",
    ask: "Do I need replay or multiple consumers? That's the whole queue-vs-log decision.",
  },
  {
    id: "db", emoji: "🗄️", name: "Database", color: "#0F7A5A", bg: "#E2F5EF",
    what: "Durable, queryable storage. The heart of most designs.",
    why: "Everything else is an optimization around getting data in and out of here correctly.",
    detail: "Start with a relational database unless you can articulate why not. Postgres handles far more than people assume: JSON documents, full-text search, geospatial, time-series extensions, and vector search via pgvector. Choosing three specialized stores when one Postgres would do is a classic over-engineering signal.\n\nGo non-relational when you have a specific, articulable reason: massive write throughput with simple access patterns (Cassandra), a document model with genuinely variable schema (MongoDB), graph traversal as the primary query (Neo4j), or extreme low-latency key-value (DynamoDB, Redis).",
    tradeoff: "The database is usually the hardest thing to change later and the first thing to become a bottleneck. Get the access patterns and the primary key right.",
    ask: "What are the top 3 queries by volume? Design the schema for those.",
  },
  {
    id: "cdn", emoji: "🌍", name: "CDN", color: "#00838F", bg: "#E0F7FA",
    what: "Geographically distributed edge caches for static and cacheable content.",
    why: "Cross-continent latency is ~150ms and no backend optimization fixes it. Serving from an edge node 20ms away does.",
    detail: "Push CDN: you upload content proactively. Good for small, stable asset sets. Pull CDN: the edge fetches from origin on first miss and caches it. Good for large or changing catalogs — the default.\n\nModern CDNs also do edge compute, TLS termination, DDoS absorption, and image transformation.\n\nCache-control headers are the actual interface: max-age, s-maxage, stale-while-revalidate. Use content-hashed filenames for immutable assets so you can cache forever and invalidate by changing the URL.",
    tradeoff: "Invalidation is slow and sometimes costly. Design for immutable URLs instead of purging.",
    ask: "What fraction of my bytes are static? If it's most of them, a CDN is the single highest-leverage change.",
  },
  {
    id: "gateway", emoji: "🚪", name: "API Gateway", color: "#AD1457", bg: "#FCE4EC",
    what: "A single entry point handling cross-cutting concerns before requests reach services.",
    why: "Auth, rate limiting, routing, request validation, and observability belong in one place rather than duplicated in every service.",
    detail: "Responsibilities: authentication and token validation, rate limiting and quota enforcement, routing and versioning, request/response transformation, TLS termination, logging and tracing injection, and sometimes response aggregation.\n\nIn a multi-tenant product this is also where per-tenant quotas and isolation are enforced, which makes it security-critical.",
    tradeoff: "Another hop and another critical dependency. Resist putting business logic here — gateways that accumulate logic become an untestable monolith at the edge.",
    ask: "Is this cross-cutting, or is it business logic? Only the former belongs here.",
  },
  {
    id: "search", emoji: "🔎", name: "Search Index", color: "#827717", bg: "#F9FBE7",
    what: "An inverted index optimized for text and faceted retrieval (Elasticsearch, OpenSearch, Typesense).",
    why: "Relational LIKE '%term%' cannot use an index and degrades linearly. Real search needs tokenization, stemming, relevance ranking, and facets.",
    detail: "Fed asynchronously from the source of truth, usually via change data capture or an event stream. It is a DERIVED store — never the system of record. That means it can be rebuilt, which is your recovery strategy.\n\nFor AI-era systems, this is also where hybrid retrieval lives: BM25 lexical scoring alongside dense vector similarity, fused by reciprocal rank fusion.",
    tradeoff: "Eventually consistent with the primary store. Reindexing large corpora is slow. It's a stateful system with real operational weight.",
    ask: "Can I get away with Postgres full-text search? Under a few million documents with simple ranking needs, often yes.",
  },
  {
    id: "objstore", emoji: "🪣", name: "Object Storage", color: "#37474F", bg: "#ECEFF1",
    what: "Cheap, effectively infinite blob storage (S3, GCS, Azure Blob).",
    why: "Files do not belong in a database. Storing blobs in Postgres bloats backups, slows replication, and wastes expensive storage.",
    detail: "The pattern: store the BYTES in object storage, store the METADATA and the key in your database. Serve reads via pre-signed URLs so traffic bypasses your application servers entirely. Accept uploads the same way — pre-signed PUT directly from the client.\n\nLifecycle policies tier cold data to cheaper classes automatically. Versioning gives you undelete.",
    tradeoff: "Higher latency than a local disk (tens of ms). Eventually consistent for some operations historically, though major providers are now strongly consistent for reads-after-write.",
    ask: "Am I proxying file bytes through my API servers? If so, use pre-signed URLs and delete that code.",
  },
];

// ─── DATA & STORAGE ─────────────────────────────────────────────────────────

export const SQL_VS_NOSQL = {
  h: "SQL vs NoSQL — the decision, not the religion",
  table: {
    headers: ["", "Relational (Postgres, MySQL)", "Document (MongoDB)", "Wide-column (Cassandra, DynamoDB)", "Key-value (Redis)"],
    rows: [
      ["Model", "Tables, rows, enforced schema", "JSON-ish documents", "Partition key + clustering columns", "Opaque value by key"],
      ["Queries", "Arbitrary — joins, aggregates, ad-hoc", "Rich within a document, weak across", "Only by partition key. No joins", "Get / set by key"],
      ["Transactions", "Full ACID, multi-row", "Single-document; multi-doc available", "Row-level; limited beyond", "Single-key ops"],
      ["Scaling", "Vertical first, then read replicas, then shard", "Horizontal sharding", "Horizontal, linear, built-in", "Horizontal via cluster"],
      ["Consistency", "Strong by default", "Tunable", "Tunable (quorum)", "Strong per node"],
      ["Best when", "Relationships matter, queries evolve, correctness is critical", "Genuinely variable schema, document-shaped access", "Huge write volume, known access pattern", "Hot data, sessions, counters, rate limits"],
    ],
  },
  guidance: "Default to relational. It is the boring, correct answer far more often than architecture blog posts suggest, and modern Postgres absorbs a great deal of what people reach for NoSQL to solve.\n\nThe honest reasons to go non-relational: write volume beyond what a single primary can absorb (roughly >10k sustained writes/sec), a genuinely unbounded and heterogeneous schema, or a hard requirement for linear horizontal scale with a simple, fixed access pattern.\n\nThe DISHONEST reasons: \"it's web scale,\" \"schemas are rigid\" (migrations are a solved problem), \"joins are slow\" (they're fast when indexed correctly).",
  keyPoint: "The critical difference is that in a relational database you model the DATA and then write queries; in a wide-column store you model the QUERIES and then shape the data to fit. Cassandra with the wrong partition key is unfixable without a full migration. Say this and it lands.",
};

export const INDEXING = {
  h: "Indexes — the highest-leverage thing most people underuse",
  body: "An index is a sorted data structure (usually a B-tree) that lets the database find rows without scanning the table. Without one, a lookup is O(n); with one, O(log n).\n\nWHAT TO KNOW:\n• A composite index on (a, b, c) can serve queries filtering on a, on (a,b), and on (a,b,c) — a LEFT PREFIX. It cannot serve a query on b alone. Column order is a design decision.\n• A covering index includes all columns the query needs, so the database never touches the table itself. Dramatic speedup for hot queries.\n• Every index makes writes slower and consumes space. Indexes are not free; unused ones are pure cost.\n• Low-cardinality columns (a boolean, a status with 3 values) index poorly on their own — the index doesn't narrow enough to beat a scan.\n• Partial indexes (WHERE status = 'active') are excellent when most rows are irrelevant to your hot query.\n\nThe interview move: when you present a schema, name the indexes and tie each one to a specific query you listed earlier.",
};

export const SHARDING = {
  h: "Partitioning & sharding",
  intro: "Splitting data across machines because one machine can no longer hold it or serve it. This is a significant complexity increase — do it when the numbers force you, not before.",
  strategies: {
    headers: ["Strategy", "How", "Good", "Bad"],
    rows: [
      ["Range", "Split by key ranges (A–M, N–Z; or by date)", "Range scans are efficient; easy to reason about", "HOTSPOTS — sequential keys or recent dates all land on one shard"],
      ["Hash", "shard = hash(key) % N", "Even distribution", "Range queries hit every shard; RESHARDING moves nearly all data"],
      ["Consistent hashing", "Keys and nodes on a ring; key goes to next node clockwise", "Adding/removing a node moves only ~1/N of keys", "More complex; needs virtual nodes to avoid imbalance"],
      ["Directory / lookup", "An explicit map from key to shard", "Total flexibility; easy rebalancing", "The lookup service is a new critical dependency and SPOF"],
      ["Geographic", "Shard by user region", "Data residency compliance; lower latency", "Cross-region queries are painful; uneven region sizes"],
    ],
  },
  choosingKey: "CHOOSING THE SHARD KEY is the decision you cannot easily undo. Requirements:\n• High cardinality — enough distinct values to spread across shards.\n• Even distribution — no single value that dominates traffic.\n• Present in most queries — otherwise every read becomes a scatter-gather across all shards.\n\nClassic mistake: sharding a multi-tenant system by tenant_id when one tenant is 40% of your volume. You've built a system with a permanent hotspot. Mitigation: composite key (tenant_id, sub_key), or dedicated shards for whale tenants.",
  pain: "WHAT SHARDING COSTS YOU: cross-shard joins (gone), distributed transactions (painful — usually saga or two-phase commit), global secondary indexes (hard), rebalancing (an operational project), and unique constraints across shards (need a separate coordination mechanism).\n\nThe senior answer: \"I'd avoid sharding as long as possible. Vertical scaling, read replicas, and archiving cold data buy you a lot of runway. I'd shard when the write volume on the primary exceeds what one machine can absorb — and I'd pick the key based on the access pattern, not the data model.\"",
};

export const REPLICATION = {
  h: "Replication",
  body: "SINGLE-LEADER (primary-replica): all writes to one node, reads from many. Simple, no write conflicts, the default. Replication lag means replicas serve stale reads — critical to say aloud. Failover requires leader election and risks split-brain and lost writes.\n\nMULTI-LEADER: writes accepted at multiple nodes, typically one per region. Better write latency and regional independence, but you must resolve CONFLICTS — last-write-wins (lossy), CRDTs (correct but constrained), or application-level merge.\n\nLEADERLESS (Dynamo-style): write to W nodes, read from R nodes, out of N replicas. If W + R > N you get quorum overlap and thus strong-ish consistency; tune W and R to trade write vs read availability.\n\nSYNC vs ASYNC: synchronous replication guarantees no data loss on failover but couples your write latency to the slowest replica. Asynchronous is fast but has a loss window. Semi-synchronous (wait for one replica) is the usual pragmatic compromise.\n\nThe question to ask: \"Is a few seconds of replication lag acceptable for reads?\" If yes, read replicas are a cheap 5–10× read scale-out. If a user must read their own write immediately, you need read-your-writes consistency — route that user's reads to the primary, or use a session token to wait for the replica to catch up.",
};

export const CAP = {
  h: "CAP, PACELC, and consistency models",
  cap: "CAP: during a network PARTITION, you must choose between CONSISTENCY and AVAILABILITY. That's it. It says nothing about normal operation, and the common framing of \"pick two of three\" is misleading — partitions are not optional, so you're really choosing CP or AP.\n\nCP (consistent, unavailable during partition): the minority side refuses requests rather than serve stale or divergent data. Financial ledgers, inventory, anything where being wrong is worse than being down.\n\nAP (available, inconsistent during partition): both sides keep serving and reconcile later. Social feeds, analytics, caches, anything where being down is worse than being slightly stale.",
  pacelc: "PACELC is the more useful version: if there's a Partition, choose Availability or Consistency; ELSE (normal operation), choose Latency or Consistency. This captures the everyday tradeoff that CAP ignores — even with no partition, strong consistency costs you latency because of coordination.",
  models: {
    headers: ["Model", "Guarantee", "Use when"],
    rows: [
      ["Strong / linearizable", "Every read sees the latest write; behaves like one machine", "Balances, inventory, locks, uniqueness"],
      ["Sequential", "All nodes see operations in the same order, possibly delayed", "Replicated state machines"],
      ["Causal", "Operations that are causally related appear in order to everyone", "Comments and replies, collaborative editing"],
      ["Read-your-writes", "A user always sees their own writes", "Profile edits, anything with a form the user just submitted"],
      ["Monotonic reads", "You never see time go backwards", "Anything paginated across replicas"],
      ["Eventual", "Given no new writes, replicas converge — eventually", "Feeds, counters, analytics, DNS"],
    ],
  },
  practical: "The practical interview move: do NOT declare one consistency model for the whole system. Different operations need different guarantees. \"Posting a message needs read-your-writes so the author sees it immediately; other users' feeds can be eventually consistent with a few seconds of lag.\" That per-operation reasoning is exactly what distinguishes a senior answer.",
};

export const DISTRIBUTED = [
  {
    h: "Idempotency — the most practically important concept here",
    body: "An operation is idempotent if performing it twice has the same effect as once. In distributed systems, retries are unavoidable — timeouts don't tell you whether the operation succeeded — so every mutating endpoint needs an idempotency story.\n\nTHE PATTERN: the client generates a unique idempotency key per logical operation and sends it with the request. The server stores (key → result) atomically with the write. A repeat request with the same key returns the stored result instead of re-executing.\n\nDetails that matter: the key must be stored in the SAME transaction as the effect, or you have a race. Keys need a TTL. Concurrent duplicates need a lock or a unique constraint to serialize them.\n\nThis single mechanism is what makes at-least-once delivery safe, which is why \"exactly-once processing\" is achievable even though \"exactly-once delivery\" isn't.",
  },
  {
    h: "Exactly-once — what it really means",
    body: "Exactly-once DELIVERY over a network is impossible — the two-generals problem. What IS achievable is exactly-once PROCESSING, built from at-least-once delivery plus one of:\n• Idempotent operations (retrying is harmless)\n• Deduplication by message ID at the consumer\n• Transactional writes where the offset commit and the side effect land atomically\n\nWhen a vendor advertises exactly-once, they mean one of the above within their boundary. The moment your consumer calls an external system, you own the idempotency problem again. Saying this is a strong signal.",
  },
  {
    h: "Consensus & coordination",
    body: "Consensus protocols (Raft, Paxos) let a cluster agree on a value despite failures. Raft is the one to be able to describe: a leader is elected by majority vote, all writes go through the leader, entries are replicated to a majority before being committed, and a new leader can only be elected if it has all committed entries.\n\nYou need consensus for: leader election, distributed locks, configuration that must be globally consistent, and cluster membership. In practice you don't implement it — you use etcd, ZooKeeper, or Consul, or a database that embeds it.\n\nThe important practical point: consensus requires a MAJORITY, so a 3-node cluster tolerates 1 failure and a 5-node tolerates 2. Even-sized clusters are wasteful. And every consensus operation costs a round trip to a majority, so it's slow — never put it on a hot path.",
  },
  {
    h: "Distributed transactions & sagas",
    body: "Two-phase commit gives you atomicity across services but blocks on the coordinator and holds locks across the network — a liveness hazard. It's rare in modern architectures.\n\nThe SAGA pattern is the usual answer: model the transaction as a sequence of local transactions, each with a COMPENSATING action that semantically undoes it. Order created → payment charged → inventory reserved → shipping booked. If shipping fails, you run compensations backwards: release inventory, refund payment, cancel order.\n\nOrchestrated saga: a central coordinator drives the steps. Easier to reason about and debug. Choreographed saga: each service emits events others react to. More decoupled, much harder to trace.\n\nThe honest caveat: sagas give you eventual consistency, not isolation. Intermediate states are visible. You need to design for that — usually with explicit status fields the UI can render honestly.",
  },
  {
    h: "Rate limiting algorithms",
    body: "TOKEN BUCKET — a bucket refills at a fixed rate up to a capacity; each request consumes a token. Allows controlled bursts. The most common and usually the right choice.\n\nLEAKY BUCKET — requests queue and drain at a fixed rate. Smooths output completely, no bursts, adds latency.\n\nFIXED WINDOW — count per calendar window. Trivial to implement, but allows a 2× burst at the boundary (all of window N's budget at :59 plus window N+1's at :00).\n\nSLIDING WINDOW LOG — store timestamps, count those within the window. Exact, but memory grows with request volume.\n\nSLIDING WINDOW COUNTER — weighted blend of the current and previous fixed windows. Nearly as accurate as the log at a fraction of the memory. The usual production compromise.\n\nDISTRIBUTED implementation: centralize counters in Redis with atomic INCR plus expiry, or a Lua script for token bucket. The tradeoff is a network hop per request. For very high throughput, do approximate local rate limiting per node with periodic reconciliation, accepting some overshoot.",
  },
  {
    h: "Backpressure, retries & circuit breakers",
    body: "RETRY STORMS are a classic self-inflicted outage: a service slows, clients retry, load triples, the service dies. Every retry policy needs EXPONENTIAL BACKOFF WITH JITTER — without jitter, retries synchronize into waves.\n\nCIRCUIT BREAKER: after N consecutive failures, stop calling the dependency entirely and fail fast (open). After a cooldown, allow a trial request (half-open). If it succeeds, close. This protects both the caller (no thread pool exhaustion) and the callee (time to recover).\n\nBULKHEAD: isolate resources per dependency so one slow downstream can't consume every connection or thread.\n\nTIMEOUTS: every network call needs one, and it should be tighter than the caller's own budget. Untimed calls are how a single slow dependency cascades into total failure.\n\nLOAD SHEDDING: when overloaded, reject a fraction of requests immediately rather than degrading everything. Prioritize by request class — shed background work before user-facing.",
  },
];
