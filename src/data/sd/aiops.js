// ─── PRODUCTION AI SYSTEMS, INTEGRATIONS & RELIABILITY ──────────────────────
// The territory where "I've built demos" and "I've operated this" diverge.

export const AI_INTRO = {
  h: "Designing AI systems that survive contact with production",
  body: "The gap between an agent demo and an agent product is almost entirely engineering, not model quality. A demo is one trajectory that worked. A product is a distribution of trajectories, most of which you never anticipated, running against systems you don't control, for users who will do things you didn't imagine.\n\nThe design principles that follow from that:\n\n1. NON-DETERMINISM IS THE DEFAULT. The same input can produce different output. Every guarantee you want must be enforced OUTSIDE the model — schema validation, deterministic checks, human gates.\n2. RELIABILITY COMPOUNDS DOWNWARD. 95% per step over 10 steps is 60% end-to-end. Fewer steps beats better steps.\n3. THE MODEL IS THE SLOWEST AND MOST EXPENSIVE COMPONENT by three orders of magnitude. Architecture decisions that would be premature optimization elsewhere are load-bearing here.\n4. FAILURE IS SILENT AND FLUENT. A broken retrieval index still returns confident answers. Conventional monitoring sees a healthy system.\n5. THE INTERESTING WORK IS AT THE BOUNDARIES — integration, validation, fallback, escalation. Not the prompt.",
};

export const AGENT_ARCH = {
  h: "Production agent architecture",
  layers: [
    {
      name: "1. Ingress & intent",
      color: "#1A73E8",
      body: "Where work enters: a user message, a webhook, a scheduled job, an event. FIRST decision is routing — does this even need an agent?\n\nA classifier or router in front is almost always worth it. Most requests fall into a handful of known intents that a deterministic handler serves faster, cheaper and more reliably. Reserve the agent for the genuinely open-ended tail.\n\nThis is the highest-leverage architectural decision in most AI systems and the one most often skipped.",
    },
    {
      name: "2. Context assembly",
      color: "#6A1B9A",
      body: "Gathering what the model needs: retrieved documents, prior conversation, user/tenant profile, available tools, and current system state.\n\nDesign concerns: a strict TOKEN BUDGET with explicit priority (system instructions > current request > retrieved context > history); retrieval with per-tenant access filtering applied AT QUERY TIME, not after; and conversation compaction for long sessions.\n\nThe security-critical point: everything assembled here that came from outside is UNTRUSTED INPUT. Retrieved documents, tool outputs, and user messages all occupy the same token stream as your instructions.",
    },
    {
      name: "3. The control loop",
      color: "#B84A00",
      body: "Plan → act → observe → repeat, until done or budget-exhausted.\n\nNon-negotiable bounds: a maximum step count, a maximum wall-clock time, a maximum token/cost budget, and loop detection on repeated identical actions. These are circuit breakers, not features.\n\nCheckpoint state after each step so a failure at step 8 doesn't discard steps 1–7. This also makes the run resumable and debuggable.\n\nPrefer a WORKFLOW over an agent wherever the step sequence is knowable in advance. Workflows are testable, cheaper, faster and debuggable. Reach for a true agent only when the sequence genuinely depends on what you discover mid-run.",
    },
    {
      name: "4. Tool execution",
      color: "#0F7A5A",
      body: "The model REQUESTS a tool call; your code EXECUTES it. That boundary is where all your safety controls live.\n\nEvery tool call passes through: schema validation of arguments, an authorization check against the acting user's permissions (not the service's), a rate limit, an idempotency key for anything mutating, a timeout, and an audit log entry.\n\nSide-effecting and irreversible actions get a human gate or a hard value cap. Read-only actions can run autonomously.",
    },
    {
      name: "5. Output validation",
      color: "#C62828",
      body: "Never return model output directly to a system of record. Between generation and effect: schema validation, business-rule checks (do the line items sum to the total? is this date plausible? is this ID in our system?), groundedness verification against the retrieved sources, and a confidence assessment.\n\nDeterministic checks catch a large fraction of model errors for almost no cost. This layer is what makes an AI system trustworthy, and it's the part most demos skip.",
    },
    {
      name: "6. Escalation & fallback",
      color: "#37474F",
      body: "Design the unhappy path explicitly. When confidence is low, validation fails, the step budget is exhausted, or the model refuses — what happens?\n\nOptions in order of preference: retry with error feedback in context (the model self-corrects surprisingly often), fall back to a deterministic path, route to human review with the full trace attached, or fail gracefully with a clear message.\n\nNever silently return a low-confidence answer as if it were high-confidence. The human-review queue is a feature, not an admission of defeat — and the corrections it produces are your best evaluation data.",
    },
    {
      name: "7. Observability & feedback",
      color: "#827717",
      body: "Full TRACE capture per run: every prompt, every tool call and result, every model response, token counts, latency per step, and the final outcome. You cannot debug an agent from the final output alone.\n\nBeyond traces: outcome metrics (task success rate), efficiency metrics (steps, tokens, cost, latency), safety metrics (rate of blocked or escalated actions), and a continuously sampled quality evaluation on live traffic.\n\nThe feedback loop closes when human corrections and production failures flow back into the evaluation set automatically.",
    },
  ],
};

export const AI_DESIGN_DECISIONS = {
  h: "The decisions you'll be pushed on",
  items: [
    {
      q: "Sync or async?",
      a: "An LLM call is ~1–10 seconds. A synchronous HTTP request holding a connection for that long limits your concurrency badly and times out through most proxies.\n\nFor interactive work: STREAM the response so perceived latency drops even though total latency doesn't.\n\nFor anything multi-step: accept the request, return a job ID immediately, process on a worker pool, and push results via webhook, SSE, or polling. This also gives you retries, backpressure and rate-limit handling for free.\n\nThe sizing intuition: if each request occupies a worker for 5 seconds, 100 concurrent workers serve 20 requests/second. That number surprises people who are used to CRUD services.",
    },
    {
      q: "How do you control cost?",
      a: "In rough order of leverage:\n1. DON'T CALL THE MODEL — route deterministic intents to deterministic handlers.\n2. Cache aggressively — exact-match caching for repeated queries, semantic caching for near-duplicates (with staleness risk acknowledged), and provider prompt caching for stable prefixes (50–90% savings when the long part comes first).\n3. Model routing — a small model for classification and simple tasks, a large one for the hard tail, with a quality-monitoring loop.\n4. Shorten context — retrieve 5 good chunks, not 50 mediocre ones. Cost is dominated by context length, and context length is downstream of retrieval quality.\n5. Cap output tokens — output is typically 3–5× the price of input.\n6. Distil — fine-tune a small model on the large model's outputs once volume on a stable task justifies it.\n\nThe structural insight worth stating: in a retrieval-backed system, cost, latency and accuracy are all downstream of retrieval quality. Better retrieval fixes all three simultaneously, and most teams optimize the model when they should optimize retrieval.",
    },
    {
      q: "How do you handle multi-tenancy?",
      a: "Isolation has to be enforced at every layer, and the retrieval layer is where it's most often broken.\n\n• DATA — tenant scoping in every query. Row-level security if the database supports it, so a missing WHERE clause fails closed rather than leaking.\n• RETRIEVAL — filter by tenant IN the vector query, not after. Post-filtering leaks existence through result counts and destroys your top-k budget.\n• QUOTAS — per-tenant rate limits and cost caps, so one tenant can't starve others or run up an unbounded bill.\n• NOISY NEIGHBOUR — separate queues or worker pools per tier, so a whale tenant's batch job doesn't block interactive traffic.\n• PROMPTS & CONFIG — per-tenant customization versioned like code, with an evaluation set per tenant.\n• AUDIT — every action attributable to a tenant and a user.\n\nFor enterprise deployments, also expect questions about single-tenant or VPC-isolated deployment options, and what that costs you operationally.",
    },
    {
      q: "How do you keep prompt injection from becoming a breach?",
      a: "Assume injection will sometimes succeed and design so that success is contained. Instructions and data share one channel — there's no parameterized-query equivalent — so prevention alone is not a strategy.\n\nThe load-bearing principle: NEVER GRANT AN AGENT A CAPABILITY YOU WOULDN'T GRANT AN ANONYMOUS INTERNET USER, because retrieved content may effectively be controlling it.\n\nLayered controls: least-privilege tool scopes bound to the acting USER's permissions; a deterministic authorization layer between the model's request and execution; human confirmation on irreversible or high-value actions; egress allowlists so exfiltration has nowhere to go; clear delimiting of untrusted content; injection classifiers on input; and full audit logging.\n\nThe combination to specifically avoid: broad data access plus broad outbound capability in the same agent without a gate. That's the exfiltration path.",
    },
    {
      q: "How do you evaluate a non-deterministic system?",
      a: "You don't unit-test it end to end. You decompose:\n\n• TOOLS get ordinary deterministic unit tests.\n• RETRIEVAL gets its own metrics against labelled query-document pairs: recall@k, MRR, NDCG. Recall@k is the ceiling on everything downstream.\n• GENERATION gets faithfulness/groundedness, answer relevance, and correctness against reference answers.\n• END-TO-END gets a task suite run repeatedly, tracking a SUCCESS RATE, not pass/fail. Regression is on the rate.\n\nThe golden set: 150–300 real cases, built BEFORE optimizing anything, deliberately including hard cases — ambiguous, out-of-scope (where the right answer is \"I don't know\"), adversarial, and exact-identifier lookups. Every production failure becomes a permanent test case.\n\nOn statistical honesty: distinguishing an 85% success rate from 80% needs a few hundred runs. Teams routinely run 20 and over-interpret noise. Saying that is a real signal.\n\nAnd track ABSTENTION — how often it correctly declines. A system that always answers scores well on relevance and is dangerous.",
    },
    {
      q: "What does 'reliable' even mean for an agent?",
      a: "Reliability compounds: 0.95 per step over 10 steps is 0.60 end to end. The engineering responses follow directly from the arithmetic:\n\n1. REDUCE STEP COUNT — this attacks the exponent. Ten steps to four takes you from 60% to 81% with no component improvement. Collapse steps, or replace them with deterministic code.\n2. MAKE STEPS DETERMINISTIC where possible, so they're 100% not 95%.\n3. VERIFY AT EACH STEP rather than only at the end, so errors don't propagate.\n4. CHECKPOINT, so a late failure doesn't discard everything.\n5. RETURN ERRORS AS ACTIONABLE TEXT the model can self-correct from (\"Date must be YYYY-MM-DD, got '15th March'\") rather than raising. This single practice dramatically improves reliability.",
    },
  ],
};

// ─── INTEGRATIONS ───────────────────────────────────────────────────────────

export const INTEGRATION = {
  h: "Integration & data-flow patterns",
  intro: "Most real-world systems fail at the seams, not in the core. Integration work is where designs meet other people's systems — legacy, undocumented, rate-limited, occasionally hostile — and it's disproportionately where projects actually get stuck.",
  apiStyles: {
    headers: ["Style", "Shape", "Good for", "Watch out"],
    rows: [
      ["REST", "Resources + HTTP verbs", "Public APIs, CRUD, broad compatibility", "Over/under-fetching; chatty for nested data"],
      ["GraphQL", "Client-specified queries", "Diverse clients, deeply nested reads", "Query-cost attacks (need depth/complexity limits); caching is harder; N+1 resolvers"],
      ["gRPC", "Binary RPC over HTTP/2", "Service-to-service, low latency, streaming", "Not browser-native without a proxy; harder to debug by hand"],
      ["Webhooks", "Server pushes to your endpoint", "Event notification without polling", "Delivery is at-least-once — you MUST verify signatures and be idempotent"],
      ["Polling", "Client asks repeatedly", "When the source offers nothing better", "Wasteful; latency bounded by interval; use conditional requests (ETag)"],
      ["File / SFTP batch", "Scheduled file drops", "Legacy enterprise systems — very common in practice", "Partial files, encoding surprises, no schema, silent failure"],
    ],
  },
  pull: {
    h: "Push vs pull — the decision",
    body: "PUSH (webhooks) gives low latency and no wasted calls, but you must handle at-least-once delivery, verify signatures, tolerate out-of-order arrival, and expose a public endpoint. The sender controls your load.\n\nPULL (polling) gives you control over rate and timing, works behind a firewall, and is trivially resumable — but wastes calls and bounds latency by the interval.\n\nThe robust production pattern is often BOTH: webhooks for low latency, plus a periodic reconciliation poll to catch anything dropped. Webhook deliveries do get lost; a nightly sweep that detects and repairs gaps is what makes the integration trustworthy.",
  },
  batchStream: {
    h: "Batch vs streaming",
    body: "BATCH — scheduled bulk processing. Simple, cheap, easy to reason about and re-run, naturally idempotent if you design it that way. Latency is the interval. Correct for reporting, reconciliation, bulk enrichment, and most enterprise data movement.\n\nSTREAMING — process events as they arrive. Low latency, smooth resource usage, but harder: you need windowing, late-arrival handling, exactly-once processing, and state management.\n\nCHANGE DATA CAPTURE (CDC) reads the database's replication log to emit a change event per row. This is how you keep a search index, cache or warehouse in sync without dual-writes — and dual-writes are the bug you're avoiding, because they can't be made atomic across two systems.\n\nThe OUTBOX PATTERN solves the same problem when you control the writer: write the business record and an outbox row in ONE local transaction, then a relay publishes from the outbox. Atomic, no distributed transaction, at-least-once delivery downstream.\n\nDefault to batch. Move to streaming when a stated latency requirement forces it — not because it sounds more modern.",
  },
  auth: {
    h: "Enterprise auth — what you'll actually meet",
    rows: [
      ["API keys", "Simple, static, coarse. Fine for server-to-server with rotation and scoping. Never in a browser."],
      ["OAuth 2.0 / OIDC", "Delegated access. Authorization Code + PKCE for user-facing; Client Credentials for machine-to-machine. Know the difference between an access token and an ID token."],
      ["mTLS", "Both sides present certificates. Common in financial and regulated environments. Operationally heavy — certificate rotation is the pain."],
      ["SAML / enterprise SSO", "The default for enterprise workforce identity. Expect it to be a hard requirement, and expect it to take longer than estimated."],
      ["SCIM", "Automated user provisioning and de-provisioning. The thing enterprises ask about that startups forget — offboarding must actually revoke access."],
      ["Service accounts & impersonation", "When your system acts on a user's behalf, the authorization check must use the USER's permissions, not the service's. Getting this wrong is a privilege-escalation bug."],
    ],
  },
  resilience: {
    h: "Integrating with systems you don't control",
    body: "Assumptions to hold: they will be slower than documented, they will rate-limit you without warning, their schema will change without notice, and their error responses will be inconsistent.\n\nDefensive design:\n• TIMEOUTS on every call, tighter than your own request budget.\n• RETRIES with exponential backoff AND jitter, only on idempotent operations or with an idempotency key.\n• CIRCUIT BREAKER so a dead dependency fails fast instead of exhausting your thread pool.\n• RATE LIMIT YOURSELF proactively — respect Retry-After, and track their quota rather than discovering it by getting blocked.\n• ANTI-CORRUPTION LAYER — translate their model into yours at the boundary, so their schema changes touch one adapter rather than your whole codebase.\n• SCHEMA VALIDATION on everything inbound; treat their response as untrusted.\n• REPLAYABLE INGESTION — persist the raw payload before processing, so you can reprocess without re-fetching when your parsing turns out to be wrong.\n• RECONCILIATION — a periodic job that compares your state to theirs and repairs drift. This is what turns a fragile integration into a dependable one.",
  },
  legacy: {
    h: "The legacy-system reality",
    body: "A large share of enterprise integration work involves systems with no usable API. What that looks like in practice, roughly in order of preference:\n\n1. A documented API, even a bad one.\n2. A database read replica with direct SQL access.\n3. Scheduled file exports over SFTP — extremely common, and workable if you handle partial files, encodings, and delimiter surprises.\n4. SOAP/XML endpoints — verbose but structured and usually stable.\n5. Screen scraping or RPA against a UI — brittle, breaks on any UI change, needs its own monitoring and a human fallback. Sometimes it is genuinely the only option, and saying so pragmatically (rather than dismissing it) reads as someone who has shipped into real environments.\n\nDesign rule regardless of mechanism: land the RAW extract first, unmodified, then transform. That separation means a parsing bug is recoverable by reprocessing rather than re-extracting — and with legacy systems, re-extracting is often impossible.",
  },
};

// ─── RELIABILITY & OPERATIONS ───────────────────────────────────────────────

export const RELIABILITY = {
  h: "Reliability & operations",
  slo: {
    h: "SLI, SLO, SLA and error budgets",
    body: "SLI — the measurement. \"Proportion of requests served under 300ms.\"\nSLO — your internal target for that SLI. \"99.5% of requests under 300ms over 30 days.\"\nSLA — the contractual promise to a customer, with financial consequences. Always looser than your SLO, so you have headroom before you owe anyone money.\n\nThe ERROR BUDGET is the useful part: a 99.9% SLO permits 0.1% failure. That budget is a resource you spend deliberately — on risky deploys, migrations, experiments. Budget exhausted means you stop shipping features and fix reliability. It converts an argument about \"should we ship or stabilize\" into a data question.\n\nChoose SLIs the USER experiences. Server CPU is not an SLI. Request success rate and latency at p99 are.\n\nAnd measure at the right percentile: p50 hides everything interesting. p99 is where the pain lives. p99.9 is where your worst customers live.",
  },
  observability: {
    h: "The three pillars, and what each is for",
    rows: [
      ["Metrics", "Numeric time series. Cheap, aggregatable, ideal for alerting and dashboards. Answers: is something wrong, and how bad?"],
      ["Logs", "Discrete events with context. Expensive at volume. Answers: what exactly happened in this specific case? Structure them as JSON — grep-able free text doesn't scale."],
      ["Traces", "A request's path across services with per-hop timing. Answers: WHERE is the latency, and what called what? Essential the moment you have more than two services."],
    ],
    note: "The fourth thing nobody lists: high-cardinality EVENTS. Being able to slice by tenant, endpoint, model version and user segment simultaneously is what turns \"latency is up\" into \"latency is up for one tenant on one endpoint since the deploy at 14:20.\" Metrics alone can't do that — cardinality explodes.\n\nFor AI systems specifically, add TRACE CAPTURE of full prompts, tool calls and outputs. You cannot debug a non-deterministic system from aggregate metrics.",
  },
  golden: {
    h: "The four golden signals",
    rows: [
      ["Latency", "Distribution, not average. And separate successful from failed requests — fast errors otherwise flatter your numbers."],
      ["Traffic", "Requests/sec, by endpoint and tenant. Needed to interpret everything else."],
      ["Errors", "Explicit (5xx) and implicit (200 with a wrong body — the dangerous kind, and the norm for AI systems)."],
      ["Saturation", "How full the constrained resource is — connections, queue depth, memory, worker pool. This is the leading indicator; the others are lagging."],
    ],
  },
  failures: {
    h: "Failure modes worth naming unprompted",
    rows: [
      ["Cascading failure", "One slow service exhausts callers' thread pools, which slow their callers. Fixes: timeouts, circuit breakers, bulkheads, load shedding."],
      ["Retry storm", "Failure triggers retries, tripling load, deepening the failure. Fixes: exponential backoff WITH jitter, retry budgets, circuit breakers."],
      ["Thundering herd", "A hot cache key expires and every request stampedes the origin. Fixes: single-flight coalescing, jittered TTLs, lock-on-repopulate."],
      ["Cold cache after deploy", "100% miss rate hits the database like a DDoS. Fixes: warm the cache, roll gradually, or keep the cache out of the deploy blast radius."],
      ["Poison message", "One malformed item blocks a queue forever as it redelivers. Fixes: max receive count, dead-letter queue, alert on DLQ depth."],
      ["Unbounded queue growth", "Producers outpace consumers silently until memory or disk runs out. Fixes: alert on queue DEPTH and consumer LAG, apply backpressure, shed load."],
      ["Silent data corruption", "A bad transform writes wrong data that looks fine. Fixes: validation at write, reconciliation jobs, and the ability to reprocess from raw."],
      ["Dependency SLA multiplication", "Five dependencies at 99.9% each cap you at 99.5%. Fixes: fallbacks, caching, graceful degradation, or removing the dependency from the critical path."],
      ["Silent AI degradation", "A stale index or changed model version still returns confident answers. No exception, no error-rate spike. Fixes: continuous sampled quality evaluation, retrieval-score distribution monitoring, output-distribution drift alerts."],
    ],
  },
  degradation: {
    h: "Graceful degradation — design the reduced mode explicitly",
    body: "For each dependency, answer: what still works when this is gone?\n\n• Recommendation service down → serve popular/default content rather than an error.\n• Search down → fall back to a simple database query with basic ranking.\n• Cache down → serve from the database with aggressive load shedding to protect it.\n• LLM provider down → fail over to a secondary provider, or fall back to a deterministic path, or queue for later with an honest \"we'll follow up\" message.\n• Enrichment service down → return the core record without the enrichment, flagged as partial.\n\nThe principle: a partial answer delivered reliably usually beats a complete answer delivered unreliably. Design the reduced experience deliberately instead of letting it be an unhandled exception.",
  },
  deploy: {
    h: "Deployment & change safety",
    rows: [
      ["Blue-green", "Two identical environments, flip traffic. Instant rollback. Costs 2× infrastructure during the transition."],
      ["Canary", "Route a small percentage to the new version, watch metrics, ramp gradually. The standard for risky changes."],
      ["Rolling", "Replace instances gradually. Cheap, but both versions run simultaneously — your API and schema must be compatible in both directions."],
      ["Feature flags", "Decouple deploy from release. Ship dark, enable per tenant, kill instantly without a deploy. Essential for customer-specific rollouts."],
      ["Shadow / mirror", "Send a copy of production traffic to the new version without serving its results. Catches performance and correctness issues with zero user risk. Ideal for validating a model or algorithm change."],
    ],
    schema: "SCHEMA MIGRATIONS need the expand-contract pattern: (1) add the new column, nullable; (2) deploy code that writes both old and new; (3) backfill; (4) deploy code that reads new; (5) drop the old column. Five steps, each independently reversible. Trying to do it in one is how you get an outage you can't roll back — because the code rolls back but the data doesn't.",
  },
  incident: {
    h: "Incident response",
    body: "MITIGATE FIRST, DIAGNOSE SECOND. Roll back, fail over, shed load, flip the flag. Understanding the root cause while users are down is the wrong ordering, and it's a common instinct to have to suppress.\n\nRoles matter once more than two people are involved: an incident commander who coordinates and decides, an operations lead who makes changes, and a communications lead who updates stakeholders. Without this, three people run three uncoordinated investigations.\n\nBLAMELESS POSTMORTEMS: timeline, contributing factors, what made detection slow, what made mitigation slow, and specific actions with owners. The goal is a systemic fix, not attribution — because in a blameful culture people stop reporting near-misses, and you lose the cheapest signal you have.\n\nThe questions worth asking every time: why didn't monitoring catch this sooner? What would have made mitigation a one-step action? What else shares this failure mode?",
  },
};
