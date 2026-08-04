// ─── SCOPING AMBIGUITY, CUSTOMER WORK & BEHAVIOURAL ─────────────────────────
// For roles where you own a problem end to end, in front of the people who have it.

export const DISCOVERY_INTRO = {
  h: "Turning an ambiguous problem into a shippable one",
  body: "In a role where you work directly with the people who have the problem, the hardest part is rarely the code. It's that the stated problem is usually not the real problem, the stated success criteria are usually not measurable, and the constraints that will kill the project are usually undiscovered until week six.\n\nInterviews for this kind of work probe that directly. Expect prompts like \"a customer says their team spends 20 hours a week on X — what do you do?\" The wrong answer starts designing. The right answer starts asking, and demonstrates a repeatable method for getting from a vague complaint to a bounded, measurable, technically-grounded scope.",
};

export const DISCOVERY_FRAMEWORK = [
  {
    n: 1,
    phase: "Understand the workflow as it actually is",
    color: "#1A73E8",
    goal: "Get to the real process, not the documented one.",
    questions: [
      "Walk me through the last time you did this, step by step. What did you actually click?",
      "Who else touches this? What do they do with it afterwards?",
      "How long does each step take? Where does it get stuck or wait?",
      "What happens when it goes wrong? How often is that?",
      "What are the exceptions — the cases where the normal process doesn't apply?",
      "What did you try before, and why didn't it work?",
    ],
    watchFor: "The documented process and the real process are almost always different. People route around broken systems with spreadsheets, side channels and tribal knowledge. Those workarounds ARE the requirements — they encode constraints nobody wrote down. Ask to watch someone do the work rather than only hearing it described.",
  },
  {
    n: 2,
    phase: "Find the actual pain and quantify it",
    color: "#C62828",
    goal: "Separate what's annoying from what's expensive.",
    questions: [
      "Of those steps, which one would you most want to disappear?",
      "What does this cost today — hours, headcount, error rate, delayed revenue, penalties?",
      "What happens if we do nothing for another year?",
      "Is the pain the TIME it takes, the ERRORS it produces, or the DELAY before it happens?",
      "Who feels this pain most — and are they the person I'm talking to?",
    ],
    watchFor: "People describe pain in terms of effort, but organizations fund based on cost. Convert to a number. \"20 hours a week\" becomes \"one FTE\" becomes a budget. And distinguish the person with the pain from the person with the budget — they're often different, which changes who you need to convince.",
  },
  {
    n: 3,
    phase: "Define measurable success up front",
    color: "#0F7A5A",
    goal: "Agree what \"working\" means BEFORE building, in numbers.",
    questions: [
      "If this works perfectly, what number changes, and by how much?",
      "What's the minimum improvement that would be worth the effort?",
      "How is that measured today? If it isn't, we need a baseline before we start.",
      "What would make you turn it off?",
      "What accuracy is good enough? What happens when it's wrong?",
    ],
    watchFor: "The two failure modes: no criteria at all (\"make it better\"), or criteria that can't be measured (\"improve the customer experience\"). Both guarantee an unwinnable project. Insist on a baseline measurement before building — without it you can't demonstrate impact, and demonstrating impact is the job.\n\nAlso pin down the error tolerance explicitly. \"It has to be right\" is not a requirement; \"95% field-level accuracy with the rest routed to review\" is.",
  },
  {
    n: 4,
    phase: "Map the technical reality",
    color: "#6A1B9A",
    goal: "Find the integration landmines before committing to a timeline.",
    questions: [
      "What systems hold this data? Do they have APIs — and has anyone actually used them?",
      "Who owns access, and how long does approval take?",
      "Is there a test or sandbox environment, or is production the only environment?",
      "How much historical data exists, and can I see a real sample — not a sanitized one?",
      "What are the security, compliance and data-residency constraints?",
      "What's the deployment environment — our cloud, their cloud, or on-prem?",
    ],
    watchFor: "This is where timelines die. Access provisioning in a large organization can take weeks. \"We have an API\" often means an undocumented internal endpoint one person maintains. Ask for a REAL data sample early — the messiness of actual data is the single most common source of schedule overrun.\n\nAlso ask what happens in the environment you'll deploy into. On-prem or VPC deployment changes the architecture fundamentally and is easy to discover too late.",
  },
  {
    n: 5,
    phase: "Scope to the smallest valuable slice",
    color: "#B84A00",
    goal: "Find the thin end-to-end path that proves value fast.",
    questions: [
      "What's the highest-volume, lowest-variance subset of this problem?",
      "Can we do one workflow, one team, one document type first?",
      "What can we defer without invalidating the result?",
      "What's the fastest thing that produces a number we can show?",
    ],
    watchFor: "Slice VERTICALLY, not horizontally. A thin end-to-end path that handles 30% of cases completely beats a beautiful component that handles 100% of one step and delivers nothing usable. The vertical slice surfaces integration problems immediately — which is precisely where the risk lives.\n\nThe head of the distribution is your friend: in most enterprise workflows, a small number of case types cover the majority of volume. Automate those first and route the tail to humans.",
  },
  {
    n: 6,
    phase: "Plan the path to production from day one",
    color: "#37474F",
    goal: "Avoid the pilot that impresses everyone and never ships.",
    questions: [
      "Who has to approve this going live, and what do they need to see?",
      "What's the security review process, and how long does it take?",
      "Who operates this after launch — us, them, or shared?",
      "What does the rollback plan look like?",
      "How do the people doing this work today feel about it changing?",
    ],
    watchFor: "The graveyard of enterprise projects is full of successful pilots. A pilot that can't pass security review, has no operational owner, or threatens the people who must adopt it will not reach production regardless of its metrics.\n\nRaise the change-management question early. If the system makes someone's job redundant, they will find reasons it doesn't work — and they'll usually be right, because they know the edge cases you don't. Bringing them in as the source of ground truth converts an opponent into your best evaluator.",
  },
];

export const SCOPING_ANSWERS = {
  h: "Answers to the questions you'll actually be asked",
  items: [
    {
      q: "A customer says their team spends 20 hours a week on a manual process. How do you approach it?",
      a: "First I'd watch someone do it rather than only hearing it described — the real process and the documented process differ, and the workarounds encode constraints nobody wrote down.\n\nThen I'd break the 20 hours into steps and find where it actually goes. Usually it's concentrated: 80% of the time is in two or three steps, and often the expensive step isn't the one people complain about. I'd want to know whether the cost is time, error rate, or delay, because those imply different solutions.\n\nThen success criteria in numbers, with a baseline measured before I build anything — otherwise I can't demonstrate impact, and demonstrating impact is the point.\n\nThen the technical reality: what systems hold the data, do they have usable APIs, how long does access take, and can I see a real data sample. That last one matters more than it sounds; real data messiness is the most common source of overrun.\n\nAnd I'd scope to a vertical slice — one workflow, end to end, covering the highest-volume case type. That proves the integration path works, which is where the risk actually is.",
    },
    {
      q: "The customer asks for X, but you think they need Y. What do you do?",
      a: "I'd assume first that they might be right and I'm missing context — they know their domain and their constraints better than I do, and \"the customer is confused\" is usually the lazy read.\n\nSo I'd dig into WHY they want X. Usually the request is a solution they've already designed to an underlying problem they haven't stated. If I can get to the problem, we can evaluate both options against it rather than arguing about preferences.\n\nIf after that I still think Y is better, I'd present both with the tradeoffs made concrete: what each costs, what each delivers, what each rules out later. Not an opinion — a comparison they can decide against.\n\nAnd sometimes the right call is to build X anyway. If X is what gets funded, gets adopted, or gets us a foothold to demonstrate value, building the technically-inferior thing that ships beats the superior thing that doesn't. I'd want that tradeoff to be explicit and documented rather than silently conceded.",
    },
    {
      q: "How do you handle a customer who keeps expanding scope?",
      a: "Scope growth usually means one of three things, and they need different responses: we mis-scoped originally, they've learned something new that genuinely changes the problem, or there's an unstated stakeholder whose requirements are arriving late.\n\nMy first move is to make the tradeoff visible rather than saying no. New requests go on the list, and the list is prioritized against the original success criteria — the ones we agreed and are measuring. \"We can add this; here's what it displaces and what it does to the date.\" That reframes it from a negotiation into a shared decision.\n\nI'd also protect the first delivery hard. Shipping something that produces a measurable number changes the conversation completely — after that, expansion is funded by demonstrated value rather than debated on speculation.\n\nIf the underlying problem is a stakeholder we didn't include, the fix isn't process, it's getting them in the room.",
    },
    {
      q: "How do you decide between building something custom and using an existing tool?",
      a: "I'd start from the assumption that we buy or use what exists, and require a specific reason to build. Custom software has a permanent cost — someone maintains it forever — and that cost is systematically underestimated at the decision point.\n\nReasons that justify building: the workflow is genuinely differentiated and it's the customer's actual competitive advantage; integration constraints make existing tools unworkable; the data can't leave their environment; or the total cost of the tool at their scale exceeds the build.\n\nReasons that don't: the existing tool is 80% right and we want the last 20%; it's more interesting to build; or nobody evaluated the alternatives properly.\n\nThe pragmatic middle is common and often correct: use the existing tool for the bulk of the workflow and build a thin custom layer for the genuinely specific part.",
    },
    {
      q: "You're three weeks in and discover the core assumption was wrong. What now?",
      a: "Say so immediately. The cost of a wrong assumption grows with every week it goes unstated, and the credibility damage from a late surprise is far worse than from an early correction.\n\nBefore raising it I'd want to be precise about what specifically is wrong, what's still valid, what the options now are with rough costs, and what I'd recommend. Bringing a problem is fine; bringing a problem with three options and a recommendation is the job.\n\nI'd also want to understand why we didn't catch it earlier, because that usually points at a process gap — we didn't look at real data soon enough, or we didn't validate access before designing around it. That's the more valuable finding.\n\nAnd I'd be honest about sunk cost. Three weeks of work that's now irrelevant is three weeks gone; continuing because we've already spent it is how three weeks becomes three months.",
    },
    {
      q: "How do you make sure what you build actually gets used?",
      a: "Mostly by involving the people who'll use it from the start, as the source of ground truth rather than as recipients of a finished thing. They know the edge cases, and they're the ones who'll find the failure modes.\n\nPractically: pick a workflow with an enthusiastic owner for the first slice, get it into real hands early even when it's rough, and measure ADOPTION as a first-class metric alongside accuracy. A system with excellent metrics and no usage has failed.\n\nI'd also want to know honestly whether this changes someone's job in a way that threatens them. If it does, that has to be addressed directly rather than hoped past — usually by being clear about what the system does and doesn't take over, and by making the human role the higher-judgement part rather than the residue.\n\nAnd I'd make the failure path good. People abandon automation the first time it's confidently wrong with no recourse. A clear escalation path and visible confidence build the trust that adoption depends on.",
    },
  ],
};

// ─── BEHAVIOURAL ────────────────────────────────────────────────────────────

export const STAR = {
  h: "Structuring a behavioural answer",
  body: "SITUATION — the context, in two sentences. Enough to make the stakes legible, no more.\nTASK — what you specifically owned. Be precise about your scope versus the team's.\nACTION — what YOU did, and critically, WHY you chose that over the alternative. This is where the signal is, and where most answers are thinnest.\nRESULT — what happened, with a number where one exists, plus what you'd do differently.\n\nTIMING: aim for 90 seconds to two minutes. Longer and you lose them; shorter and there's no substance. Front-load the outcome if the story is complex — \"we cut processing time by 60%, and the interesting part was that our first approach failed\" — so they know where it's going.\n\nTHE MOST COMMON MISTAKE: describing what the team did rather than what you did. Interviewers are assessing YOU. Use \"I\" for your decisions and \"we\" for collective outcomes, deliberately.\n\nTHE SECOND MOST COMMON: no failure, no learning, no tradeoff. A story where everything went well and you were right throughout is not credible and carries no information.",
};

export const STORIES = {
  h: "The stories to have prepared",
  intro: "Prepare five or six real stories and know which ones flex to cover multiple questions. Each needs a number and a thing you got wrong.",
  items: [
    {
      theme: "Ownership end to end",
      probes: ["Tell me about something you owned from problem to production.", "When have you gone beyond your defined role?"],
      shape: "Pick something where you touched the whole path — problem definition, design, build, launch, iteration. Emphasize the decisions at the boundaries: what you chose NOT to build, how you knew it was working, what you changed after launch based on real usage.\n\nWhat they're checking: whether you think in terms of outcomes or tasks.",
    },
    {
      theme: "Navigating ambiguity",
      probes: ["Tell me about the vaguest problem you've been handed.", "How do you start when the requirements don't exist?"],
      shape: "Show a METHOD, not just persistence. How you decomposed it, what you did to reduce uncertainty early, what you deliberately deferred, and how you got to a bounded first deliverable.\n\nThe strongest version includes a decision you made under uncertainty that turned out wrong, and how you caught it.\n\nWhat they're checking: do you freeze, thrash, or systematically converge.",
    },
    {
      theme: "Working with the people who have the problem",
      probes: ["Tell me about a difficult stakeholder.", "When did a customer disagree with your approach?"],
      shape: "Avoid framing them as the obstacle. The strong version is one where you were partly wrong, or where understanding their constraint changed your design. Show that you sought the reason behind the position rather than arguing the position.\n\nWhat they're checking: whether you can be trusted in front of someone important without becoming either a pushover or a source of friction.",
    },
    {
      theme: "Something you shipped that failed",
      probes: ["Tell me about a project that didn't work.", "What's your biggest professional mistake?"],
      shape: "This is the highest-value story and the one most people prepare worst. Pick a real failure with real consequences. Be specific about YOUR contribution to it — not \"requirements changed\" but \"I didn't validate the data assumption before designing around it.\"\n\nThen the systemic lesson and the concrete thing you now do differently. If you can point at a later situation where the changed behaviour paid off, that's the strongest possible close.\n\nWhat they're checking: self-awareness, and whether failure produces learning or excuses.",
    },
    {
      theme: "Choosing the simpler thing",
      probes: ["When did you choose a less sophisticated solution?", "Tell me about a time you argued against building something."],
      shape: "Engineering judgement is largely about restraint. A story where you talked a team out of a complex approach, or shipped the boring version and it was correct, signals seniority strongly.\n\nInclude the counterfactual: what the complex version would have cost, and how you knew the simple one was sufficient.\n\nWhat they're checking: whether you optimize for the interesting problem or the actual one.",
    },
    {
      theme: "Influence without authority",
      probes: ["How did you get a team to change direction?", "Tell me about convincing someone senior."],
      shape: "The mechanism matters: data, a prototype, a small reversible experiment. \"I built a two-day spike showing the alternative and the numbers made the argument\" is far stronger than \"I explained why I was right.\"\n\nWhat they're checking: whether you can move things you don't control.",
    },
    {
      theme: "Operating something in production",
      probes: ["Tell me about an incident you handled.", "How have you improved a system's reliability?"],
      shape: "Show the ordering: mitigate first, diagnose second. Then the systemic fix, not just the patch. The best version includes what you changed about DETECTION — how you made sure the next occurrence is caught faster.\n\nWhat they're checking: whether you've actually carried a pager, or only built things others operate.",
    },
  ],
};

export const BEHAVIOURAL_QUESTIONS = [
  { q: "Tell me about a time you had to learn something unfamiliar quickly.", look: "Method over heroics. How you found the shortest path to competence, what you skipped deliberately, how you validated understanding rather than assuming it." },
  { q: "Describe a technical decision you'd make differently now.", look: "Genuine reflection with a specific alternative. Vague regret reads as rehearsed; \"I'd have validated the data volume before choosing the storage engine\" reads as real." },
  { q: "How do you prioritize when everything is urgent?", look: "An actual method — impact versus effort, reversibility, what unblocks others. And evidence you've said no to something and communicated why." },
  { q: "Tell me about disagreeing with a colleague on a technical approach.", look: "Whether you can disagree without it becoming personal, and whether you'd commit to a decision that went against you. \"Disagree and commit\" is worth demonstrating rather than naming." },
  { q: "When have you had to deliver bad news?", look: "Early, direct, with options. The failure mode is delaying in hope — and interviewers probe for it." },
  { q: "What's something you believe about engineering that others disagree with?", look: "That you have considered opinions at all, and can defend one without being dogmatic. Have a real one — deflecting reads as having no views." },
  { q: "How do you handle work you find tedious?", look: "Honesty plus professionalism. Everyone has unglamorous work; the signal is whether you do it properly and whether you look for ways to remove it for the next person." },
  { q: "Tell me about a time you were wrong about something technical.", look: "Speed of updating. How you found out, how quickly you changed course, whether you told people." },
];

export const YOUR_QUESTIONS = {
  h: "Questions worth asking them",
  intro: "Asking well is scored. Aim for questions whose answers would genuinely change how you'd work there.",
  items: [
    { q: "What does the first 90 days look like for someone in this role?", why: "Surfaces whether the role is defined, and how quickly you're expected to own something." },
    { q: "How do problems get chosen — who decides what's worth building?", why: "Tells you whether you'd be shaping problems or receiving specifications." },
    { q: "What happens when something you build doesn't produce the expected result?", why: "Reveals the real culture around failure, and whether measurement actually happens." },
    { q: "How is success measured for this role at six months?", why: "If they can't answer, the role is under-defined and that's important to know." },
    { q: "What's the biggest current bottleneck for the team — is it problems, people, or platform?", why: "Systems thinking, and genuinely useful to you." },
    { q: "How much of the work is greenfield versus integrating with what already exists?", why: "Sets realistic expectations, and shows you know integration is where the difficulty lives." },
    { q: "What separates someone doing well in this role from someone struggling?", why: "The most directly useful question you can ask, and the answers are usually candid." },
  ],
  avoid: "Avoid asking things answerable from the careers page, and avoid leading with compensation, leave policy or working hours in a technical round — those belong in the recruiter conversation.",
};
