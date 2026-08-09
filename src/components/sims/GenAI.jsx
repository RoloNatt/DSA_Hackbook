import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Label, Heatmap, Bars, PixelGrid, Graph, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as T from "../../lib/textrec.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");
const pct = (v) => `${(v * 100).toFixed(1)}%`;

// ════════════════════════════════════════════════════════════════════════════
// 1. DECODING STRATEGIES
// ════════════════════════════════════════════════════════════════════════════

export function DecodingSim() {
  const [strategy, setStrategy] = useState("topp");
  const [temp, setTemp] = useState(1);
  const [k, setK] = useState(4);
  const [topP, setTopP] = useState(0.9);

  const nt = D.NEXT_TOKEN;
  const res = useMemo(() => T.decode(nt.candidates, { strategy, temperature: temp, k, p: topP }),
    [strategy, temp, k, topP]);
  const junk = ["purple", "table"];
  const junkKept = res.kept.filter((c) => junk.includes(c.token));

  return (
    <Sim
      n={1}
      title="How a Model Picks the Next Word"
      breadcrumb="Generative AI · Decoding"
      hook={<>The model has read <em>"{nt.prompt}"</em> and produced a probability for every word it knows. Here are the top ten. It now has to <strong>choose one</strong> — and that choice is not part of the model.</>}
      question="Which candidates should stay eligible, and which should be cut off entirely?"
      readout={
        <>
          <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{res.kept.length}</strong> of {nt.candidates.length} candidates survive
          {" "}({res.kept.map((c) => `"${c.token}"`).join(", ")}), the other
          {" "}<strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{res.dropped.length}</strong> are impossible.
          {strategy === "topp" && <> Cumulative probability reached <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(res.cumulative)}</strong>.</>}
          {" "}Best candidate ends at <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{pct(res.renormalized[0].p)}</strong> after renormalizing.
          {junkKept.length > 0
            ? <strong style={{ color: P.bad }}> Nonsense still eligible: {junkKept.map((c) => `"${c.token}"`).join(", ")}.</strong>
            : <strong style={{ color: P.good }}> Both nonsense words ("purple", "table") are cut off.</strong>}
        </>
      }
      notice={"Switch to top-k = 4 then to top-p = 0.9 and compare which tokens survive. On this fairly flat distribution they behave similarly.\n\nNow think about a case where the model is certain — say after \"the capital of France is\". Top-p keeps one token. Top-k = 4 still forces in three alternatives the model gave almost no probability to. A fixed count cannot adapt to confidence; a cumulative-probability cut can. That is the whole reason top-p is the usual default."}
      formalName="Greedy / temperature / top-k / nucleus (top-p) sampling"
      formalNote="Decoding is a separate choice from the model. Temperature reshapes the distribution; top-k truncates to a fixed count; top-p truncates to the smallest set reaching a cumulative mass. They compose — most APIs apply temperature then top-p."
    >
      <Controls>
        <Choice label="Strategy" value={strategy} set={setStrategy}
          options={[{ id: "greedy", label: "Greedy" }, { id: "temperature", label: "Temperature only" }, { id: "topk", label: "Top-k" }, { id: "topp", label: "Top-p (nucleus)" }]} />
        {strategy !== "greedy" && <Slider label="Temperature" value={temp} set={setTemp} min={0.1} max={2.5} step={0.05} fmt={f2} color={P.highlight}
          hint={temp < 0.5 ? "near-deterministic" : temp > 1.5 ? "chaotic" : "balanced"} />}
        {strategy === "topk" && <Slider label="k" value={k} set={setK} min={1} max={10} step={1} color={P.predict} />}
        {strategy === "topp" && <Slider label="p" value={topP} set={setTopP} min={0.1} max={1} step={0.05} fmt={f2} color={P.predict} />}
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The model's raw probabilities
          </div>
          <Bars width={350} height={190} horizontal
            items={nt.candidates.map((c) => ({ label: c.token, value: c.p }))}
            fmt={pct} maxValue={0.35}
            colorFor={(it) => (junk.includes(it.label) ? P.bad : P.faint)} />
          <Caption>Red are the two words that would make the sentence nonsense.</Caption>
        </Col>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            After {strategy === "greedy" ? "greedy selection" : strategy === "temperature" ? `temperature ${f2(temp)}` : strategy === "topk" ? `top-k = ${k}` : `top-p = ${f2(topP)}`}
          </div>
          <Bars width={350} height={190} horizontal
            items={[...res.renormalized, ...res.dropped.map((d) => ({ ...d, p: 0 }))].map((c) => ({ label: c.token, value: c.p }))}
            fmt={(v) => (v > 0.0005 ? pct(v) : "cut")} maxValue={Math.max(...res.renormalized.map((c) => c.p))}
            colorFor={(it) => {
              const kept = res.kept.some((c) => c.token === it.label);
              if (!kept) return P.grid;
              return junk.includes(it.label) ? P.bad : P.good;
            }} />
          <Caption>Grey bars are eliminated — zero chance of being chosen.</Caption>
        </Col>
      </Row>
      <Stats>
        <Stat label="Eligible" value={res.kept.length} color={P.good} big />
        <Stat label="Eliminated" value={res.dropped.length} color={P.bad} />
        <Stat label="Top after renorm" value={pct(res.renormalized[0].p)} color={P.highlight} />
        {strategy === "topp" && <Stat label="Cumulative" value={f3(res.cumulative)} color={P.predict} />}
      </Stats>
      <Verdict tone={junkKept.length ? "warn" : "good"}>{res.note}</Verdict>
      {strategy === "greedy" && (
        <Note>
          Greedy is fully deterministic, which sounds safe but causes the classic degenerate loop: if "nice" is the top
          choice in a context, and picking it recreates that context, the model says "nice" forever. Some randomness is
          what breaks the cycle.
        </Note>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. KV CACHE
// ════════════════════════════════════════════════════════════════════════════

export function KvCacheSim() {
  const [tokens, setTokens] = useState(2048);
  const [layers, setLayers] = useState(32);
  const [heads, setHeads] = useState(32);
  const [headDim, setHeadDim] = useState(128);
  const [bytes, setBytes] = useState(2);
  const [batch, setBatch] = useState(1);

  const kv = useMemo(() => T.kvCacheCost({ nTokens: Math.min(tokens, 512), nLayers: layers, nHeads: heads, headDim, bytesPerValue: bytes, batch }),
    [tokens, layers, heads, headDim, bytes, batch]);
  const totalGB = (kv.perToken * tokens * batch) / 1e9;
  const gb = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${(n / 1e3).toFixed(0)} KB`);

  const growth = Array.from({ length: 40 }, (_, i) => {
    const t = Math.round(((i + 1) / 40) * tokens);
    return { t, cache: kv.perToken * t * batch, noCache: t * t, withCache: t };
  });

  return (
    <Sim
      n={2}
      title="The KV Cache"
      breadcrumb="Generative AI · Why generation costs what it does"
      hook={<>Generating token 500 means attending to all 499 before it. Without a cache you would recompute every one of their keys and values at every single step. With a cache you compute each once and keep it.</>}
      question="What does that cache cost in memory, and what does it save in compute?"
      readout={
        <>
          Each token costs <strong style={{ fontFamily: "Consolas, monospace" }}>2 × {heads} heads × {headDim} dim × {bytes} bytes = {(kv.perTokenPerLayer / 1024).toFixed(0)} KB</strong> per layer,
          {" "}so <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{gb(kv.perToken)}</strong> across all {layers} layers.
          {" "}A <strong style={{ fontFamily: "Consolas, monospace" }}>{tokens.toLocaleString()}</strong>-token context at batch {batch} needs
          {" "}<strong style={{ color: totalGB > 20 ? P.bad : P.predict, fontFamily: "Consolas, monospace", fontSize: 15 }}>{gb(kv.perToken * tokens * batch)}</strong> of cache.
          {" "}In exchange, attention compute drops from O(n²) to O(n) — a
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{((tokens + 1) / 2).toFixed(0)}×</strong> reduction at this length.
        </>
      }
      notice={"Push the batch size to 32 and watch the memory. The cache — not the model weights — becomes the thing that limits how many users you can serve concurrently. This is why serving throughput is a memory problem more than a compute problem.\n\nDrop bytes-per-value from 2 to 1 (FP8 cache quantization) and the requirement halves instantly. That is why KV-cache quantization, multi-query and grouped-query attention all exist: they attack this exact number. GQA shares keys and values across heads, so reducing the effective head count is the same lever."}
      formalName="Key-Value cache"
      formalNote="Stores each token's projected keys and values so they are computed once instead of once per subsequent step. Trades linear memory growth for turning quadratic recomputation into linear."
    >
      <Controls>
        <Slider label="Context length" value={tokens} set={setTokens} min={128} max={131072} step={128} color={P.highlight}
          fmt={(v) => (v >= 1024 ? `${(v / 1024).toFixed(0)}K` : String(v))} />
        <Slider label="Batch (concurrent users)" value={batch} set={setBatch} min={1} max={64} step={1} color={P.class1} />
        <Slider label="Bytes per value" value={bytes} set={setBytes} min={1} max={4} step={1} color={P.derived}
          hint={bytes === 1 ? "FP8" : bytes === 2 ? "FP16" : "FP32"} />
      </Controls>
      <Controls>
        <Slider label="Layers" value={layers} set={setLayers} min={4} max={96} step={4} color={P.predict} />
        <Slider label="Heads (KV)" value={heads} set={setHeads} min={1} max={64} step={1} color={P.predict}
          hint={heads < 8 ? "grouped/multi-query" : "full multi-head"} />
        <Slider label="Head dimension" value={headDim} set={setHeadDim} min={32} max={256} step={32} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Cache memory grows linearly with context
          </div>
          <Plot width={360} height={200} xMin={0} xMax={tokens} yMin={0} yMax={(kv.perToken * tokens * batch) / 1e9 * 1.1}
            xLabel="tokens generated" yLabel="cache (GB)" xTicks={3} yTicks={4}
            xFmt={(v) => (v >= 1024 ? `${(v / 1024).toFixed(0)}K` : v.toFixed(0))} yFmt={(v) => v.toFixed(1)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={growth.map((g) => [sx(g.t), sy(g.cache / 1e9)])} color={P.highlight} width={2.4} />
                {[8, 24, 80].map((lim, i) => (
                  (kv.perToken * tokens * batch) / 1e9 > lim * 0.4 && (
                    <g key={i}>
                      <line x1={sx(0)} y1={sy(lim)} x2={sx(tokens)} y2={sy(lim)} stroke={P.bad} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                      <Label x={sx(0) + 5} y={sy(lim) - 4} size={9} color={P.bad}>{lim} GB GPU</Label>
                    </g>
                  )
                ))}
              </g>
            )}
          </Plot>
          <Caption>Dashed lines are common GPU memory sizes — and the model weights have not even been counted yet.</Caption>
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Compute: with cache vs without
          </div>
          <Plot width={340} height={200} xMin={0} xMax={512} yMin={0} yMax={512 * 512 * 1.05}
            xLabel="tokens" yLabel="attention work" xTicks={3} yTicks={3} yFmt={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0))}>
            {({ sx, sy }) => (
              <g>
                <Line pts={Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 512; return [sx(t), sy(t * t)]; })} color={P.bad} width={2.2} />
                <Line pts={Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 512; return [sx(t), sy(t)]; })} color={P.good} width={2.2} />
                <Label x={sx(300)} y={sy(300 * 300) - 6} size={10} color={P.bad}>no cache: O(n²)</Label>
                <Label x={sx(300)} y={sy(300) - 8} size={10} color={P.good}>with cache: O(n)</Label>
              </g>
            )}
          </Plot>
          <Stats>
            <Stat label="Per token" value={gb(kv.perToken)} color={P.highlight} />
            <Stat label="Total cache" value={gb(kv.perToken * tokens * batch)} color={totalGB > 20 ? P.bad : P.predict} big />
          </Stats>
          <Stats>
            <Stat label="Compute saved" value={`${((tokens + 1) / 2).toFixed(0)}×`} color={P.good} />
            <Stat label="Per layer/token" value={`${(kv.perTokenPerLayer / 1024).toFixed(0)} KB`} color={P.derived} />
          </Stats>
          {totalGB > 24 && (
            <Verdict tone="bad">
              {gb(kv.perToken * tokens * batch)} of cache alone exceeds a single 24 GB GPU before the weights are loaded. Options: shorter context, smaller batch, quantized cache, or grouped-query attention.
            </Verdict>
          )}
          {heads <= 8 && (
            <Verdict tone="good">
              With only {heads} KV heads you are effectively modelling grouped-query attention — the standard fix, and it cuts cache proportionally.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. RAG
// ════════════════════════════════════════════════════════════════════════════

export function RagSim() {
  const [chunkSize, setChunkSize] = useState(90);
  const [overlap, setOverlap] = useState(20);
  const [topK, setTopK] = useState(2);
  const [qi, setQi] = useState(0);

  const QUESTIONS = [
    { q: "how many days do I have to get a refund", expect: "refund" },
    { q: "how long does shipping to europe take", expect: "shipping" },
    { q: "what are the password rules", expect: "password" },
    { q: "how many api calls on the free plan", expect: "api" },
    { q: "what is the meaning of life", expect: null },
  ];
  const corpus = D.SUPPORT_DOCS.join(" ");
  const chunks = useMemo(() => T.chunkText(corpus, { chunkSize, overlap }), [chunkSize, overlap]);
  const query = QUESTIONS[qi];
  const res = useMemo(() => T.retrieve(query.q, chunks, { topK }), [chunks, qi, topK]);
  const gotIt = query.expect ? res.kept.some((c) => c.text.toLowerCase().includes(query.expect)) : !res.anyMatch;

  return (
    <Sim
      n={3}
      title="Retrieval-Augmented Generation"
      breadcrumb="Generative AI · Grounding"
      hook={<>The model was never trained on your company's refund policy. So before answering, go and find the relevant paragraph and paste it into the prompt. That is all RAG is — and every failure lives in the "go and find" step.</>}
      question={`Someone asks: "${query.q}". Does retrieval actually surface the right text?`}
      readout={
        !res.anyMatch
          ? <><strong style={{ color: query.expect ? P.bad : P.good }}>Nothing matched at all</strong> — no word in the question appears in any chunk.
            {query.expect ? " The answer IS in the corpus, but keyword retrieval cannot see it. This is the failure that embeddings fix." : " Correct behaviour here: the corpus genuinely does not cover this, so an honest system should say so rather than invent an answer."}</>
          : <>
            Split into <strong style={{ fontFamily: "Consolas, monospace" }}>{chunks.length}</strong> chunks of {chunkSize} chars (overlap {overlap}).
            {" "}Top match scores <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f3(res.kept[0].score)}</strong>.
            {" "}The <strong>{topK}</strong> retrieved chunks total
            {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{res.contextTokens}</strong> tokens of context.
            {" "}<strong style={{ color: gotIt ? P.good : P.bad }}>{gotIt ? "The answer is in there." : "The right passage was NOT retrieved."}</strong>
          </>
      }
      notice={"Drop the chunk size to 40. Chunks get so small that the question's words and the answer's words land in different chunks — retrieval finds a chunk containing 'refund' that does not contain '30 days'. The answer is technically retrieved and still useless.\n\nRaise it to 200 and each chunk carries several unrelated facts, so the embedding is a blurry average and precision falls. Overlap exists precisely so an answer straddling a boundary appears whole in at least one chunk."}
      formalName="Retrieval-Augmented Generation"
      formalNote="Chunk, embed, index, retrieve top-k by similarity, then put those chunks in the prompt. This lab uses TF-IDF cosine rather than a neural embedding — which makes the lexical-gap failure mode unusually visible."
    >
      <Controls>
        <Choice label="Question" value={String(qi)} set={(v) => setQi(Number(v))}
          options={QUESTIONS.map((q, i) => ({ id: String(i), label: q.expect || "off-topic" }))} />
        <Slider label="Chunk size" value={chunkSize} set={setChunkSize} min={30} max={240} step={10} unit=" chars" color={P.highlight}
          hint={chunkSize < 60 ? "may split answers" : chunkSize > 180 ? "blurry" : "reasonable"} />
        <Slider label="Overlap" value={overlap} set={setOverlap} min={0} max={60} step={5} unit=" chars" color={P.derived} />
        <Slider label="Retrieve top" value={topK} set={setTopK} min={1} max={5} step={1} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 420px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            All {chunks.length} chunks, scored against the question
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
            {res.ranked.map((c) => {
              const kept = res.kept.some((k) => k.id === c.id);
              return (
                <div key={c.id} style={{
                  padding: "7px 10px", marginBottom: 4, borderRadius: 7,
                  background: kept ? `${P.good}14` : P.panel,
                  border: `1px solid ${kept ? P.good : P.grid}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: kept ? P.good : P.faint, fontFamily: "Consolas, monospace" }}>
                      {kept ? "✓ RETRIEVED" : "not used"} · chunk {c.id} · {c.tokens} tok
                    </span>
                    <span style={{ fontSize: 10.5, color: c.score > 0.05 ? P.highlight : P.faint, fontFamily: "Consolas, monospace" }}>
                      score {f3(c.score)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: kept ? P.text : P.dim, lineHeight: 1.5, fontFamily: "Consolas, monospace" }}>
                    {c.text.trim()}
                  </div>
                </div>
              );
            })}
          </div>
        </Col>
        <Col flex="1 1 280px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Retrieval scores
          </div>
          <Bars width={290} height={150} horizontal
            items={res.ranked.slice(0, 8).map((c) => ({ label: `chunk ${c.id}`, value: c.score }))}
            fmt={f3} maxValue={Math.max(0.05, res.ranked[0].score)}
            colorFor={(it, i) => (i < topK ? P.good : P.faint)} />
          <Stats>
            <Stat label="Chunks" value={chunks.length} color={P.derived} />
            <Stat label="Context tokens" value={res.contextTokens} color={P.highlight} />
          </Stats>
          <Stats>
            <Stat label="Top score" value={f3(res.kept[0].score)} color={res.kept[0].score > 0.1 ? P.good : P.bad} big />
          </Stats>
          <Verdict tone={gotIt ? "good" : "bad"}>
            {gotIt
              ? query.expect ? "The chunk containing the answer was retrieved. The model can now answer from evidence rather than memory." : "Correctly found nothing — the honest response is to say the documents do not cover this."
              : "The answer exists in the corpus but was not retrieved. The model will now answer from its own memory, confidently and possibly wrongly. This is the number one cause of RAG hallucination, and no amount of prompt engineering fixes it."}
          </Verdict>
          <Note>
            Retrieval quality caps everything downstream. If the right chunk is not in the top-k, the generator has no
            path to a correct answer — so measure recall@k before you tune any prompt.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. DIFFUSION
// ════════════════════════════════════════════════════════════════════════════

export function DiffusionSim() {
  const [t, setT] = useState(0);
  const [schedule, setSchedule] = useState("cosine");
  const STEPS = 12;

  const clean = D.IMAGES.digitSeven.px;
  // Variance schedule: ᾱ_t is how much of the original signal remains.
  const alphaBar = (step) => {
    const frac = step / STEPS;
    if (schedule === "linear") return Math.max(0, 1 - frac);
    if (schedule === "cosine") return Math.cos((frac * Math.PI) / 2) ** 2;
    return Math.max(0, 1 - frac ** 2);   // "late" schedule
  };

  const noisy = useMemo(() => {
    const r = M.rng(7);
    const ab = alphaBar(t);
    const noise = clean.map((row) => row.map(() => M.gauss(r)));
    // x_t = sqrt(ᾱ)·x₀ + sqrt(1−ᾱ)·ε  — the exact forward diffusion equation
    return clean.map((row, i) => row.map((v, j) =>
      Math.sqrt(ab) * v + Math.sqrt(1 - ab) * noise[i][j] * 4.5));
  }, [t, schedule]);

  const ab = alphaBar(t);
  const snr = ab / Math.max(1e-9, 1 - ab);
  const curve = Array.from({ length: STEPS + 1 }, (_, i) => ({ t: i, ab: alphaBar(i) }));

  return (
    <Sim
      n={4}
      title="Diffusion"
      breadcrumb="Generative AI · Image generation"
      hook={<>Take a real image and add a little noise. Then a little more. After enough steps it is pure static, and you have thrown the picture away. Diffusion's insight: that destruction is <strong>easy and exactly known</strong>, so train a network to undo one step of it.</>}
      question="Add noise step by step. At what point is the image genuinely unrecoverable?"
      readout={
        <>
          Step <strong>{t}</strong> of {STEPS}: the image is
          {" "}<strong style={{ color: ab > 0.5 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{pct(ab)}</strong> original signal
          {" "}and <strong style={{ fontFamily: "Consolas, monospace" }}>{pct(1 - ab)}</strong> noise
          {" "}(<span style={{ fontFamily: "Consolas, monospace" }}>x_t = √{f2(ab)}·x₀ + √{f2(1 - ab)}·ε</span>).
          {" "}Signal-to-noise ratio <strong style={{ fontFamily: "Consolas, monospace" }}>{snr < 0.01 ? snr.toExponential(1) : f2(snr)}</strong>.
          {ab < 0.05 && <strong style={{ color: P.bad }}> Effectively pure noise — this is where generation starts.</strong>}
        </>
      }
      notice={"The key trick is in the equation. You never need to run the noising loop — any step t is reachable in ONE calculation from the clean image. So training samples a random t, corrupts the image directly, and asks the network to predict the noise it added. Supervision for free, no labels required.\n\nCompare schedules. Linear destroys the image early and spends most steps on near-pure noise, which wastes capacity. Cosine keeps signal around much longer, and that is why it replaced linear in practice."}
      formalName="Denoising Diffusion Probabilistic Model (forward process)"
      formalNote="x_t = √ᾱ_t·x₀ + √(1−ᾱ_t)·ε with ε ~ N(0, I). Generation reverses it: start from pure noise and repeatedly subtract the network's predicted noise. Latent diffusion runs this in a compressed space to make it affordable."
    >
      <Controls>
        <Choice label="Noise schedule" value={schedule} set={setSchedule}
          options={[{ id: "cosine", label: "Cosine (modern)" }, { id: "linear", label: "Linear (original)" }, { id: "late", label: "Late (slow start)" }]} />
      </Controls>
      <StepPlayer step={t} setStep={setT} max={STEPS} speed={480} autoLabel="Add noise"
        labels={Array.from({ length: STEPS + 1 }, (_, i) => `Step ${i} — ${pct(alphaBar(i))} of the original signal remains.`)} />

      <Row>
        <Col flex="0 1 220px" min={200}>
          <PixelGrid px={clean} cell={24} max={9} showValues={false} label="x₀ — the real image" />
        </Col>
        <Col flex="0 1 220px" min={200}>
          <PixelGrid px={noisy} cell={24} min={-6} max={12} showValues={false} label={`x_${t} — after ${t} steps`} />
          <Caption>{ab < 0.05 ? "Indistinguishable from static." : `${pct(ab)} signal remaining.`}</Caption>
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Signal remaining, by schedule
          </div>
          <Plot width={310} height={180} xMin={0} xMax={STEPS} yMin={0} yMax={1.05}
            xLabel="diffusion step" yLabel="signal (ᾱ)" xTicks={4} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                {["cosine", "linear", "late"].map((sch, si) => {
                  const f = (step) => {
                    const fr = step / STEPS;
                    if (sch === "linear") return Math.max(0, 1 - fr);
                    if (sch === "cosine") return Math.cos((fr * Math.PI) / 2) ** 2;
                    return Math.max(0, 1 - fr ** 2);
                  };
                  const cols = { cosine: P.good, linear: P.class1, late: P.derived };
                  return <Line key={si} pts={Array.from({ length: STEPS + 1 }, (_, i) => [sx(i), sy(f(i))])}
                    color={cols[sch]} width={sch === schedule ? 2.6 : 1.2} opacity={sch === schedule ? 1 : 0.4} />;
                })}
                <Dot cx={sx(t)} cy={sy(ab)} color={P.highlight} r={5.5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.good, label: "cosine", line: true }, { color: P.class1, label: "linear", line: true }, { color: P.derived, label: "late", line: true }]} />
          <Stats>
            <Stat label="Signal (ᾱ)" value={f3(ab)} color={ab > 0.5 ? P.good : P.bad} />
            <Stat label="Noise" value={f3(1 - ab)} color={P.class1} />
            <Stat label="SNR" value={snr < 0.01 ? snr.toExponential(1) : f2(snr)} color={P.derived} />
          </Stats>
        </Col>
      </Row>
      <Verdict tone="neutral">
        Training target: given x_{t} and the value of {t}, predict the exact noise ε that was added. That is a plain
        regression problem with a free label — which is why diffusion scales so well.
      </Verdict>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. LoRA
// ════════════════════════════════════════════════════════════════════════════

export function LoraSim() {
  const [rank, setRank] = useState(2);
  const [dim, setDim] = useState(12);

  // A weight-update matrix with genuinely low intrinsic rank plus a little noise,
  // which is exactly the empirical claim LoRA rests on.
  const W = useMemo(() => {
    const r = M.rng(23);
    const u1 = Array.from({ length: dim }, () => M.gauss(r));
    const v1 = Array.from({ length: dim }, () => M.gauss(r));
    const u2 = Array.from({ length: dim }, () => M.gauss(r));
    const v2 = Array.from({ length: dim }, () => M.gauss(r));
    return Array.from({ length: dim }, (_, i) =>
      Array.from({ length: dim }, (_, j) => 3 * u1[i] * v1[j] + 1.6 * u2[i] * v2[j] + M.gauss(r) * 0.25));
  }, [dim]);

  const svd = useMemo(() => M.truncatedSVD(W, Math.min(dim, 10)), [W]);
  const approx = useMemo(() => M.svdReconstruct(svd, dim, dim, rank), [svd, rank, dim]);
  const err = M.frobenius(W, approx);
  const fullNorm = M.frobenius(W, W.map((r) => r.map(() => 0)));

  const fullParams = dim * dim;
  const loraParams = 2 * dim * rank;
  const errCurve = Array.from({ length: Math.min(dim, 10) }, (_, i) => ({
    r: i + 1,
    err: M.frobenius(W, M.svdReconstruct(svd, dim, dim, i + 1)) / fullNorm,
    params: 2 * dim * (i + 1),
  }));

  return (
    <Sim
      n={5}
      title="LoRA"
      breadcrumb="Generative AI · Efficient fine-tuning"
      hook={<>Fine-tuning normally means updating every weight. For a {dim}×{dim} layer that is {fullParams} numbers. LoRA's bet: the <em>change</em> you need is far simpler than the weights themselves, so it can be written as two thin matrices multiplied together.</>}
      question={`Can rank ${rank} capture a ${dim}×${dim} update — and how many parameters does that save?`}
      readout={
        <>
          Rank <strong style={{ fontFamily: "Consolas, monospace" }}>{rank}</strong> reconstructs the update with
          {" "}<strong style={{ color: err / fullNorm < 0.2 ? P.good : P.highlight, fontFamily: "Consolas, monospace", fontSize: 15 }}>{pct(1 - err / fullNorm)}</strong> accuracy
          {" "}using <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{loraParams}</strong> parameters instead of
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{fullParams}</strong> —
          {" "}a <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{(fullParams / loraParams).toFixed(1)}×</strong> saving.
          {" "}Remaining error <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(err)}</strong>.
        </>
      }
      notice={"Look at the singular-value bar chart. The first two dwarf everything after them, because this update genuinely has rank-2 structure. Rank 2 therefore captures nearly all of it and ranks 3+ mostly chase noise.\n\nThat is LoRA's entire empirical claim: adaptation updates are low-rank in practice. When a task is far from what the base model knows, that stops being true — and rank 4 or 8 stops being enough. The bar chart is how you would diagnose it."}
      formalName="Low-Rank Adaptation"
      formalNote="Freeze W and learn ΔW = BA where B is d×r and A is r×d. At inference BA merges into W, so there is zero added latency. QLoRA additionally quantizes the frozen base to 4-bit."
    >
      <Controls>
        <Slider label="LoRA rank (r)" value={rank} set={setRank} min={1} max={Math.min(dim, 10)} step={1} color={P.highlight}
          hint={rank <= 2 ? "typical" : rank > 6 ? "diminishing returns" : "generous"} />
        <Slider label="Layer size (d)" value={dim} set={(v) => { setDim(v); setRank(Math.min(rank, v)); }} min={6} max={16} step={2}
          fmt={(v) => `${v}×${v}`} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="0 1 250px" min={230}>
          <Heatmap title="The full update ΔW" data={W} cell={Math.floor(220 / dim)} fmt={() => ""} showValues={false}
            colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.08 + Math.min(0.9, Math.abs(v) / 8)})` : `rgba(255,92,92,${0.08 + Math.min(0.9, Math.abs(v) / 8)})`)} />
          <Caption>{fullParams} parameters</Caption>
        </Col>
        <Col flex="0 1 250px" min={230}>
          <Heatmap title={`Rank-${rank} approximation BA`} data={approx} cell={Math.floor(220 / dim)} fmt={() => ""} showValues={false}
            colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.08 + Math.min(0.9, Math.abs(v) / 8)})` : `rgba(255,92,92,${0.08 + Math.min(0.9, Math.abs(v) / 8)})`)} />
          <Caption>{loraParams} parameters ({(fullParams / loraParams).toFixed(1)}× fewer)</Caption>
        </Col>
        <Col flex="1 1 290px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Singular values — how much each rank contributes
          </div>
          <Bars width={300} height={130} items={svd.map((s, i) => ({ label: `r${i + 1}`, value: s.s }))}
            fmt={(v) => v.toFixed(1)} colorFor={(it, i) => (i < rank ? P.good : P.grid)} />
          <Caption>Green ranks are kept. Grey are discarded.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Error vs rank
          </div>
          <Plot width={300} height={140} xMin={1} xMax={errCurve.length} yMin={0} yMax={Math.max(...errCurve.map((e) => e.err)) * 1.1}
            xLabel="rank" yLabel="relative error" xTicks={4} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <Line pts={errCurve.map((e) => [sx(e.r), sy(e.err)])} color={P.class1} width={2.2} />
                <Dot cx={sx(rank)} cy={sy(errCurve[rank - 1].err)} color={P.highlight} r={5.5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Stats>
            <Stat label="Accuracy" value={pct(1 - err / fullNorm)} color={err / fullNorm < 0.2 ? P.good : P.highlight} big />
            <Stat label="Params" value={`${loraParams} / ${fullParams}`} color={P.good} />
          </Stats>
        </Col>
      </Row>
      {rank >= 3 && errCurve[rank - 1].err > errCurve[1].err * 0.6 && (
        <Verdict tone="warn">
          Going past rank 2 buys little here — the remaining singular values are mostly noise. Extra rank costs
          parameters without capturing structure.
        </Verdict>
      )}
      {rank <= 2 && err / fullNorm < 0.25 && (
        <Verdict tone="good">
          Rank {rank} captures {pct(1 - err / fullNorm)} of a {dim}×{dim} update with {(fullParams / loraParams).toFixed(1)}× fewer parameters. Scaled to a 7B model, this is why fine-tuning fits on one consumer GPU.
        </Verdict>
      )}
    </Sim>
  );
}

export const GENAI_SIMS = [
  { id: "decoding", label: "Picking the Next Word", Comp: DecodingSim },
  { id: "kvcache", label: "The KV Cache", Comp: KvCacheSim },
  { id: "rag", label: "RAG", Comp: RagSim },
  { id: "diffusion", label: "Diffusion", Comp: DiffusionSim },
  { id: "lora", label: "LoRA", Comp: LoraSim },
];
