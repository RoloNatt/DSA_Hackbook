import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Guide, Label, Heatmap, Bars, Graph, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as N from "../../lib/nn.js";
import * as T from "../../lib/textrec.js";
import * as D from "../../lib/datasets.js";
import { RNN_DEPTH } from "../../data/labDepth.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");

// ════════════════════════════════════════════════════════════════════════════
// 1. TOKENIZATION (BPE)
// ════════════════════════════════════════════════════════════════════════════

export function TokenizationSim() {
  const [merges, setMerges] = useState(4);
  const [testWord, setTestWord] = useState("lowest");
  const corpus = D.BPE_CORPUS;

  const trained = useMemo(() => T.bpeTrain(corpus, 12), []);
  const active = trained.merges.slice(0, merges);
  const enc = useMemo(() => T.bpeEncode(testWord, active), [testWord, merges]);
  const charCount = testWord.length + 1;

  const WORDS = ["lowest", "lower", "newest", "widest", "slowly", "unknowable"];

  return (
    <Sim
      n={1}
      title="Tokenization"
      breadcrumb="NLP · Turning text into numbers"
      hook={<>A model cannot read letters. It needs a fixed list of symbols. Words are too many (and new ones always appear); letters are too few (and carry almost no meaning). The compromise: start from letters and repeatedly <strong>glue together the most common adjacent pair</strong>.</>}
      question={`After ${merges} merges, how does the tokenizer split "${testWord}"?`}
      readout={
        <>
          "{testWord}" becomes <strong style={{ color: P.predict, fontFamily: "Consolas, monospace", fontSize: 14 }}>{enc.tokens.join(" · ")}</strong>
          {" "}— <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{enc.nTokens}</strong> tokens instead of
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{charCount}</strong> characters.
          {" "}Vocabulary is now <strong style={{ fontFamily: "Consolas, monospace" }}>{trained.alphabet.length + merges + 1}</strong> symbols
          {" "}({trained.alphabet.length} letters + {merges} merged pieces + end-of-word).
          {merges > 0 && <> Latest merge: <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>"{active[merges - 1]?.pair.join("" + "")}" </strong>seen {active[merges - 1]?.count} times.</>}
        </>
      }
      notice={"Try \"unknowable\" — a word that never appears in the training corpus. It still tokenizes, because worst case it falls back to individual letters. That is the whole point of subwords: there is no such thing as an unknown word.\n\nDrag merges up and watch the token count for a common word fall while the vocabulary grows. That trade is the only real tokenizer decision: a bigger vocabulary means shorter sequences (cheaper attention) but more embedding parameters."}
      formalName="Byte-Pair Encoding"
      formalNote="Repeatedly merge the most frequent adjacent symbol pair. WordPiece merges by likelihood gain instead of raw count; SentencePiece works on raw bytes so it needs no pre-tokenization and is language-agnostic."
    >
      <Controls>
        <Slider label="Merges learned" value={merges} set={setMerges} min={0} max={12} step={1} color={P.highlight} />
        <Choice label="Tokenize" value={testWord} set={setTestWord} options={WORDS.map((w) => ({ id: w, label: w }))} />
      </Controls>

      <div style={{ padding: "9px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, marginBottom: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Training corpus</div>
        <div style={{ fontSize: 12.5, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.6 }}>{corpus}</div>
      </div>

      <Row>
        <Col flex="1 1 330px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Merges, in the order learned
          </div>
          {trained.merges.slice(0, 12).map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "4px 9px", borderRadius: 6, marginBottom: 3,
              background: i < merges ? `${P.good}14` : "transparent", opacity: i < merges ? 1 : 0.35,
              border: `1px solid ${i === merges - 1 ? P.good : "transparent"}`,
            }}>
              <span style={{ fontSize: 10, color: P.faint, width: 14, fontFamily: "Consolas, monospace" }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.class0 }}>{m.pair[0]}</span>
              <span style={{ fontSize: 11, color: P.faint }}>+</span>
              <span style={{ fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.class0 }}>{m.pair[1]}</span>
              <span style={{ fontSize: 11, color: P.faint }}>→</span>
              <span style={{ fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.good, fontWeight: 700 }}>{m.merged}</span>
              <span style={{ fontSize: 10.5, color: P.dim, marginLeft: "auto", fontFamily: "Consolas, monospace" }}>×{m.count}</span>
            </div>
          ))}
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Encoding "{testWord}" step by step
          </div>
          <div style={{ padding: "9px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: P.faint, marginBottom: 3 }}>start: characters</div>
            <div style={{ fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.dim }}>
              {testWord.split("").join(" · ")} · &lt;/w&gt;
            </div>
          </div>
          {enc.applied.map((a, i) => (
            <div key={i} style={{ padding: "7px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, marginBottom: 6 }}>
              <div style={{ fontSize: 10.5, color: P.faint, marginBottom: 3 }}>
                apply merge {a.step}: {a.pair.join(" + ")} → {a.merged}
              </div>
              <div style={{ fontSize: 12.5, fontFamily: "Consolas, monospace", color: P.text }}>{a.result.join(" · ")}</div>
            </div>
          ))}
          <Stats>
            <Stat label="Tokens" value={enc.nTokens} color={P.predict} big />
            <Stat label="Characters" value={charCount} color={P.faint} />
            <Stat label="Vocab size" value={trained.alphabet.length + merges + 1} color={P.derived} />
          </Stats>
          <Note>
            English averages about 0.75 words per token. Non-English text often costs 2–4× more tokens for the same
            meaning, which is a real cost and fairness issue.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. TF-IDF
// ════════════════════════════════════════════════════════════════════════════

export function TfidfSim() {
  const [queryIdx, setQueryIdx] = useState(0);
  const docs = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "the cat chased the dog",
    "quantum entanglement of distant particles",
  ];
  const labels = ["cat/mat", "dog/log", "cat/dog", "physics"];
  const model = useMemo(() => T.tfidf(docs), []);
  const sims = docs.map((_, j) => T.cosine(model.matrix[queryIdx], model.matrix[j]));
  const best = sims.map((s, j) => ({ s, j })).filter(({ j }) => j !== queryIdx).sort((a, b) => b.s - a.s)[0];

  return (
    <Sim
      n={2}
      title="TF-IDF"
      breadcrumb="NLP · Classical retrieval"
      hook={<>Four short documents. To find which are similar, count words — but "the" appears in nearly all of them and tells you nothing, while "quantum" appears once and tells you everything.</>}
      question="How do you count words so that common ones stop dominating?"
      readout={
        <>
          "{docs[queryIdx]}" is most similar to <strong style={{ color: P.good }}>"{docs[best.j]}"</strong>
          {" "}at cosine <strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(best.s)}</strong>.
          {" "}The word <strong style={{ fontFamily: "Consolas, monospace" }}>"the"</strong> appears in
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{model.df[model.vocab.indexOf("the")]}</strong> of 4 documents so its weight is only
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(model.idf[model.vocab.indexOf("the")])}</strong>,
          {" "}while <strong style={{ fontFamily: "Consolas, monospace" }}>"{model.mostDistinctive[0].term}"</strong> appears in just
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{model.mostDistinctive[0].df}</strong> and scores
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f2(model.mostDistinctive[0].idf)}</strong>.
        </>
      }
      notice={"Look at the physics document's similarity to the others: essentially zero. It shares no words at all, so cosine similarity has nothing to work with.\n\nThat is the exact failure of lexical retrieval, and the reason embeddings exist. Ask this system for \"feline on a rug\" and it returns nothing, even though document 1 is a perfect match — no shared words means no score."}
      formalName="Term Frequency – Inverse Document Frequency"
      formalNote="TF is how often a term appears in this document; IDF is log((1+N)/(1+df)) + 1, penalizing terms that appear everywhere. Rows are L2-normalized so cosine similarity is just a dot product."
    >
      <Controls>
        <Choice label="Compare from" value={String(queryIdx)} set={(v) => setQueryIdx(Number(v))}
          options={docs.map((d, i) => ({ id: String(i), label: labels[i] }))} />
      </Controls>

      <Row>
        <Col flex="1 1 400px">
          <Heatmap title="TF-IDF weights (documents × terms)"
            data={model.matrix} rowLabels={labels} colLabels={model.vocab.map((v) => (v.length > 5 ? v.slice(0, 5) : v))}
            cell={30} fmt={(v) => (v > 0.001 ? v.toFixed(2).slice(1) : "")}
            highlight={(i) => i === queryIdx} />
          <Caption>Blank cells are words the document does not contain. Brighter = more distinctive here.</Caption>
        </Col>
        <Col flex="1 1 270px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Word weight by rarity
          </div>
          <Bars width={280} height={150} horizontal
            items={model.mostDistinctive.slice(0, 7).map((m) => ({ label: `${m.term} (${m.df}/4)`, value: m.idf }))}
            fmt={f2} colorFor={(it, i) => (i < 3 ? P.highlight : P.faint)} />
          <Caption>Appears in fewer documents → higher weight.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Similarity to "{labels[queryIdx]}"
          </div>
          <Bars width={280} height={120} horizontal
            items={docs.map((d, j) => ({ label: labels[j], value: sims[j] }))}
            fmt={f3} maxValue={1} colorFor={(it, j) => (j === queryIdx ? P.faint : sims[j] > 0.2 ? P.good : P.class1)} />
          {sims[3] < 0.01 && queryIdx !== 3 && (
            <Verdict tone="bad">The physics document scores {sims[3].toExponential(1)} — no shared words means no similarity, however related the meaning might be.</Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. WORD EMBEDDINGS
// ════════════════════════════════════════════════════════════════════════════

export function EmbeddingSim() {
  const [a, setA] = useState("man");
  const [b, setB] = useState("king");
  const [c, setC] = useState("woman");

  const V = D.WORD_VECTORS;
  const words = Object.keys(V);
  const res = useMemo(() => T.analogy(V, a, b, c, { topN: 3 }), [a, b, c]);
  const target = res.target;

  return (
    <Sim
      n={3}
      title="Word Embeddings"
      breadcrumb="NLP · Meaning as geometry"
      hook={<>Every word gets a position in space. These are laid out on two readable axes: how <strong style={{ color: P.class0 }}>royal</strong> a word is (rightward) and its <strong style={{ color: P.class1 }}>gender</strong> (up = male, down = female).</>}
      question={`If ${a} is to ${b}, what is ${c} to?`}
      readout={
        <>
          Compute <strong style={{ fontFamily: "Consolas, monospace" }}>{b} − {a} + {c}</strong> =
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>[{target.map(f2).join(", ")}]</strong>.
          {" "}The nearest real word to that point is
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{res.results[0].word}</strong>
          {" "}at cosine <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(res.results[0].sim)}</strong>,
          {" "}ahead of {res.results[1].word} ({f3(res.results[1].sim)}).
        </>
      }
      notice={"Notice what the subtraction did. king − man isolates the 'royalty' direction with gender cancelled out; adding woman puts gender back the other way. Direction in this space carries meaning, which is why the arithmetic works at all.\n\nReal embeddings have hundreds of dimensions and no human-labelled axes — the directions emerge from co-occurrence statistics. But the mechanism is exactly this."}
      formalName="Distributed word representations (word2vec / GloVe)"
      formalNote="Trained so that words appearing in similar contexts land in similar positions. Modern contextual embeddings go further: the same word gets a different vector depending on the sentence around it."
    >
      <Controls>
        <Choice label="A" value={a} set={setA} options={words.map((w) => ({ id: w, label: w }))} />
        <Choice label="is to B" value={b} set={setB} options={words.map((w) => ({ id: w, label: w }))} />
        <Choice label="as C" value={c} set={setC} options={words.map((w) => ({ id: w, label: w }))} />
      </Controls>

      <Row>
        <Col flex="1 1 350px">
          <Plot width={370} height={300} xMin={-1.5} xMax={1.5} yMin={-1.5} yMax={1.5}
            xLabel="how royal →" yLabel="gender (up = male)" xTicks={4} yTicks={4}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(-1.5)} y1={sy(0)} x2={sx(1.5)} y2={sy(0)} stroke={P.grid} strokeWidth="1" />
                <line x1={sx(0)} y1={sy(-1.5)} x2={sx(0)} y2={sy(1.5)} stroke={P.grid} strokeWidth="1" />
                {/* the vector arithmetic, drawn */}
                <line x1={sx(V[a][0])} y1={sy(V[a][1])} x2={sx(V[b][0])} y2={sy(V[b][1])} stroke={P.highlight} strokeWidth="1.8" strokeDasharray="4 3" />
                <line x1={sx(V[c][0])} y1={sy(V[c][1])} x2={sx(target[0])} y2={sy(target[1])} stroke={P.good} strokeWidth="1.8" strokeDasharray="4 3" />
                {words.map((w) => (
                  <g key={w}>
                    <Dot cx={sx(V[w][0])} cy={sy(V[w][1])} color={[a, b, c].includes(w) ? P.highlight : w === res.results[0].word ? P.good : P.class0}
                      r={[a, b, c].includes(w) ? 5.5 : 4} halo={w === res.results[0].word ? P.good : null} />
                    <Label x={sx(V[w][0]) + 8} y={sy(V[w][1]) + 3.5} size={10.5}
                      color={[a, b, c].includes(w) ? P.highlight : w === res.results[0].word ? P.good : P.dim}>{w}</Label>
                  </g>
                ))}
                <Dot cx={sx(target[0])} cy={sy(target[1])} color={P.derived} r={6} halo={P.derived} />
                <Label x={sx(target[0]) + 9} y={sy(target[1]) - 7} size={10.5} color={P.derived}>result</Label>
              </g>
            )}
          </Plot>
          <Key items={[{ color: P.highlight, label: "your three words" }, { color: P.derived, label: "computed point" },
            { color: P.good, label: "nearest real word" }]} />
        </Col>
        <Col flex="1 1 260px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Nearest words to the result
          </div>
          <Bars width={270} height={110} horizontal items={res.results.map((r) => ({ label: r.word, value: r.sim }))}
            fmt={f3} maxValue={1} colorFor={(it, i) => (i === 0 ? P.good : P.faint)} />
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The arithmetic
          </div>
          <div style={{ padding: "9px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, fontSize: 12, fontFamily: "Consolas, monospace", color: P.text, lineHeight: 1.85 }}>
            <div>{b} = [{V[b].map(f2).join(", ")}]</div>
            <div style={{ color: P.class1 }}>− {a} = [{V[a].map(f2).join(", ")}]</div>
            <div style={{ color: P.class0 }}>+ {c} = [{V[c].map(f2).join(", ")}]</div>
            <div style={{ borderTop: `1px solid ${P.grid}`, marginTop: 4, paddingTop: 4, color: P.highlight }}>= [{target.map(f2).join(", ")}]</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Nearest neighbours of "{b}"
          </div>
          {T.nearest(V, b, { topN: 4 }).map((n) => (
            <div key={n.word} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "2.5px 8px", borderRadius: 5, background: P.panel, marginBottom: 2 }}>
              <span style={{ color: P.text }}>{n.word}</span>
              <span style={{ color: P.dim, fontFamily: "Consolas, monospace" }}>{f3(n.sim)}</span>
            </div>
          ))}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. RNN HIDDEN STATE
// ════════════════════════════════════════════════════════════════════════════

export function RnnSim() {
  const [step, setStep] = useState(0);
  const [wRec, setWRec] = useState(0.6);
  const [wIn, setWIn] = useState(1);

  const inputs = [1, 0, 0, 1, 0, 0, 0, 0];
  const H = 3;
  const params = useMemo(() => ({
    Wxh: Array.from({ length: H }, (_, i) => [wIn * (1 - i * 0.3)]),
    Whh: Array.from({ length: H }, (_, i) => Array.from({ length: H }, (_, j) => (i === j ? wRec : wRec * 0.2))),
    bh: new Array(H).fill(0),
  }), [wRec, wIn]);
  const run = useMemo(() => N.rnnRun(inputs, params), [params]);

  const shownStates = run.states.slice(0, step + 1);
  const memory = run.states.map((s) => Math.hypot(...s));
  const decay = memory[3] > 0 ? memory[7] / memory[3] : 0;

  return (
    <Sim
      n={4}
      title="Recurrent Networks"
      breadcrumb="NLP · Sequences"
      hook={<>A sequence arrives one item at a time: <strong style={{ fontFamily: "Consolas, monospace" }}>{inputs.join(" ")}</strong> — think of the 1s as important words and the 0s as filler. The network keeps a small memory of {H} numbers and updates it at every step.</>}
      question="A signal arrives at step 1. How long does the memory hold on to it?"
      readout={
        step === 0
          ? <>Memory starts at <strong style={{ fontFamily: "Consolas, monospace" }}>[0, 0, 0]</strong>. Nothing has been read yet.</>
          : <>
            After reading <strong>{step}</strong> {step === 1 ? "item" : "items"}, memory is
            {" "}<strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>[{run.states[step].map(f2).join(", ")}]</strong>,
            {" "}strength <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f3(memory[step])}</strong>.
            {" "}The signal from step 1 has faded to <strong style={{ fontFamily: "Consolas, monospace" }}>{f2((memory[step] / Math.max(1e-9, memory[1])) * 100)}%</strong> of its original strength.
          </>
      }
      notice={"Set the recurrence weight to 0.3 and step through. The memory of that first 1 is essentially gone by step 4 — the network physically cannot connect step 1 to step 8.\n\nNow set it to 1.1. The memory persists, but it also grows without bound and saturates tanh, so everything blurs together. There is no setting of a single number that both remembers selectively and stays stable. That impossibility is precisely what gates were invented for."}
      formalName="Recurrent Neural Network (Elman network)"
      formalNote="hₜ = tanh(Wₓ xₜ + Wₕ hₜ₋₁ + b). The same weights are applied at every timestep, so the network handles any sequence length — and the same weight gets multiplied in repeatedly, which is where its problems come from."
      simple={RNN_DEPTH.simple}
      deep={RNN_DEPTH.deep}
    >
      <Controls>
        <Slider label="Recurrence weight" value={wRec} set={setWRec} min={0.1} max={1.2} step={0.05} fmt={f2} color={P.highlight}
          hint={wRec < 0.5 ? "forgets fast" : wRec > 1 ? "saturates" : "balanced"} />
        <Slider label="Input weight" value={wIn} set={setWIn} min={0.2} max={3} step={0.1} fmt={f2} color={P.class0} />
      </Controls>
      <StepPlayer step={step} setStep={setStep} max={inputs.length} speed={700} autoLabel="Read the sequence"
        labels={["Memory empty.", ...inputs.map((x, i) => `Step ${i + 1}: read ${x}. Memory strength now ${f3(memory[i + 1])}.`)]} />

      <Row>
        <Col flex="1 1 360px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Memory contents at every step
          </div>
          <Heatmap
            data={run.states[0].map((_, h) => run.states.map((s) => s[h]))}
            rowLabels={Array.from({ length: H }, (_, i) => `mem ${i + 1}`)}
            colLabels={["t0", ...inputs.map((_, i) => `t${i + 1}`)]}
            cell={36} fmt={f2} min={-1} max={1}
            highlight={(r, c) => c === step}
            colorFor={(v) => (v >= 0 ? `rgba(61,217,196,${0.1 + Math.min(0.85, Math.abs(v))})` : `rgba(255,92,92,${0.1 + Math.min(0.85, Math.abs(v))})`)} />
          <Caption>Each column is one timestep. Amber outline is where you are. Grey columns are the future.</Caption>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {inputs.map((x, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 5, fontSize: 12, fontFamily: "Consolas, monospace",
                background: i < step ? (x ? `${P.class0}33` : P.panel) : "transparent",
                border: `1px solid ${i === step - 1 ? P.highlight : P.grid}`,
                color: i < step ? P.text : P.faint, fontWeight: x ? 700 : 400,
              }}>{x}</div>
            ))}
          </div>
          <Caption>The input sequence. Highlighted box is the item just read.</Caption>
        </Col>
        <Col flex="1 1 280px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Memory strength over time
          </div>
          <Plot width={290} height={170} xMin={0} xMax={inputs.length} yMin={0} yMax={Math.max(...memory) * 1.15}
            xLabel="timestep" yLabel="‖memory‖" xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g>
                <Line pts={memory.map((m, i) => [sx(i), sy(m)])} color={P.predict} width={2.2} />
                {memory.map((m, i) => <Dot key={i} cx={sx(i)} cy={sy(m)} color={i <= step ? P.predict : P.grid} r={3.2} />)}
                {step > 0 && <Dot cx={sx(step)} cy={sy(memory[step])} color={P.highlight} r={5.5} halo={P.highlight} />}
              </g>
            )}
          </Plot>
          <Stats>
            <Stat label="Strength now" value={f3(memory[step])} color={P.highlight} />
            <Stat label="Retained t3→t7" value={`${(decay * 100).toFixed(0)}%`} color={decay < 0.15 ? P.bad : P.good} big />
          </Stats>
          {wRec < 0.5 && (
            <Verdict tone="bad">
              At {f2(wRec)} the memory retains only {(decay * 100).toFixed(0)}% across four steps. Any dependency longer than that is unlearnable.
            </Verdict>
          )}
          {wRec > 1.0 && (
            <Verdict tone="warn">
              Above 1.0 the state grows until tanh saturates. Memory persists but stops discriminating — everything reads as ±1.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. VANISHING GRADIENTS THROUGH TIME
// ════════════════════════════════════════════════════════════════════════════

export function BpttSim() {
  const [w, setW] = useState(0.8);
  const [act, setAct] = useState("tanh");
  const T_ = 40;

  const r = useMemo(() => N.bpttMagnitude({ T: T_, w, activation: act }), [w, act]);
  const logs = r.perStep.map((p) => Math.log10(Math.max(1e-30, p.magnitude)));

  return (
    <Sim
      n={5}
      title="Why RNNs Forget"
      breadcrumb="NLP · The problem gates solve"
      hook={<>To learn that word 40 depends on word 1, the error has to travel 40 steps backwards. At every step it gets multiplied by the same recurrent weight and the same activation slope.</>}
      question="Multiply by the same number 40 times. What survives?"
      readout={
        <>
          With weight <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(w)}</strong> and {N.ACTIVATIONS[act].label},
          {" "}the gradient after <strong>{T_}</strong> steps is <strong style={{ color: r.verdict === "usable" ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{r.final.toExponential(2)}</strong>
          {" "}of its original size. It halves after <strong style={{ fontFamily: "Consolas, monospace" }}>{r.halfLife || "—"}</strong> steps
          {" "}and becomes unusable (below 1e−3) after <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{r.usableRange}</strong> steps.
          {" "}Verdict: <strong style={{ color: r.verdict === "usable" ? P.good : P.bad }}>{r.verdict}</strong>.
        </>
      }
      notice={`At weight ${f2(w)} the practical memory limit is about ${r.usableRange} timesteps. That is not a training issue you can fix with more epochs — it is multiplication.\n\nAn LSTM's answer is the cell state, which is ADDED to rather than multiplied. Addition does not decay, so gradients can flow across hundreds of steps. Attention's answer is more radical: skip the chain entirely and let step 40 look directly at step 1 in one hop.`}
      formalName="Backpropagation Through Time, and the vanishing gradient"
      formalNote="The gradient across T steps contains a factor of (w · f′)^T. Below 1 it vanishes geometrically; above 1 it explodes. LSTM/GRU replace the multiplicative path with an additive one; transformers replace it with a direct connection."
    >
      <Controls>
        <Slider label="Recurrent weight" value={w} set={setW} min={0.3} max={2.5} step={0.05} fmt={f2} color={P.highlight} />
        <Choice label="Activation" value={act} set={setAct} options={[{ id: "tanh", label: "tanh" }, { id: "sigmoid", label: "sigmoid" }, { id: "relu", label: "ReLU" }, { id: "leaky", label: "Leaky ReLU" }]} />
      </Controls>

      <Row>
        <Col flex="1 1 400px">
          <Plot width={420} height={250} xMin={1} xMax={T_} yMin={Math.min(...logs) - 0.5} yMax={Math.max(0.5, Math.max(...logs) + 0.5)}
            xLabel="timesteps back" yLabel="gradient magnitude" yTicks={5} yFmt={(v) => `1e${v.toFixed(0)}`}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(1)} y1={sy(0)} x2={sx(T_)} y2={sy(0)} stroke={P.faint} strokeWidth="1" strokeDasharray="4 3" />
                <line x1={sx(1)} y1={sy(-3)} x2={sx(T_)} y2={sy(-3)} stroke={P.bad} strokeWidth="1" strokeDasharray="3 4" />
                <Label x={sx(T_) - 60} y={sy(-3) - 4} size={9.5} color={P.bad}>unusable below here</Label>
                <Line pts={logs.map((v, i) => [sx(i + 1), sy(v)])}
                  color={r.verdict === "usable" ? P.good : r.verdict === "exploded" ? P.bad : P.highlight} width={2.4} />
                {r.usableRange < T_ && (
                  <line x1={sx(r.usableRange)} y1={sy(Math.min(...logs) - 0.5)} x2={sx(r.usableRange)} y2={sy(Math.max(0.5, Math.max(...logs) + 0.5))}
                    stroke={P.highlight} strokeWidth="1.5" strokeDasharray="4 3" />
                )}
              </g>
            )}
          </Plot>
          <Caption>Logarithmic axis, so a straight line means constant decay. The amber line is where the signal becomes unusable.</Caption>
        </Col>
        <Col flex="1 1 250px">
          <Stats>
            <Stat label="Usable range" value={`${r.usableRange} steps`} color={r.usableRange > 20 ? P.good : P.bad} big />
          </Stats>
          <Stats>
            <Stat label="Half-life" value={`${r.halfLife || "—"} steps`} color={P.highlight} />
            <Stat label="After 40 steps" value={r.final.toExponential(1)} color={r.verdict === "usable" ? P.good : P.bad} />
          </Stats>
          <div style={{ marginTop: 12, padding: "10px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.derived, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>The three answers</div>
            <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.75 }}>
              <div><strong style={{ color: P.text }}>LSTM/GRU:</strong> make the memory path additive instead of multiplicative.</div>
              <div style={{ marginTop: 4 }}><strong style={{ color: P.text }}>Gradient clipping:</strong> caps explosions, does nothing for vanishing.</div>
              <div style={{ marginTop: 4 }}><strong style={{ color: P.text }}>Attention:</strong> delete the chain. Every position reaches every other in one step.</div>
            </div>
          </div>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. ATTENTION
// ════════════════════════════════════════════════════════════════════════════

export function AttentionSim() {
  const [stage, setStage] = useState(4);
  const [scale, setScale] = useState(true);
  const [temp, setTemp] = useState(1);
  const [causal, setCausal] = useState(false);
  const [focusRow, setFocusRow] = useState(7);

  // "The animal didn't cross the street because it was tired"
  const tokens = ["The", "animal", "didn't", "cross", "the", "street", "because", "it"];
  // Hand-built 4-dim embeddings: [animate, place, action, referring]
  const E = useMemo(() => [
    [0.1, 0.1, 0.0, 0.2],   // The
    [0.9, 0.1, 0.1, 0.1],   // animal
    [0.1, 0.0, 0.7, 0.1],   // didn't
    [0.1, 0.2, 0.9, 0.0],   // cross
    [0.1, 0.1, 0.0, 0.2],   // the
    [0.1, 0.9, 0.1, 0.1],   // street
    [0.0, 0.0, 0.3, 0.3],   // because
    [0.6, 0.3, 0.0, 0.9],   // it
  ], []);

  const att = useMemo(() => N.attention(E, E, E, { scale, temperature: temp, mask: causal ? N.causalMask : null }), [scale, temp, causal]);
  const row = att.weights[focusRow];
  const topJ = row.map((v, j) => ({ v, j })).sort((a, b) => b.v - a.v)[0];

  const STAGES = [
    "Eight tokens, each already a vector. Nothing compared yet.",
    "Every token is compared with every other by dot product — raw similarity scores.",
    `Scores divided by √d (${att.sqrtDk.toFixed(2)}) to stop large dimensions saturating the softmax.`,
    causal ? "Future positions masked to −∞ so a token cannot see ahead." : "No mask: every token can see every other.",
    "Softmax per row turns the scores into weights that sum to 1.",
  ];

  return (
    <Sim
      n={6}
      title="Attention"
      breadcrumb="NLP · The transformer's core"
      hook={<>The sentence is <em>"The animal didn't cross the street because <strong style={{ color: P.highlight }}>it</strong> was tired."</em> What does "it" refer to — the animal or the street? You know instantly. The model has to compute it.</>}
      question={`Which words does "${tokens[focusRow]}" pay attention to?`}
      readout={
        stage < 4
          ? <>{STAGES[stage]}{stage >= 1 && <> Raw score between "{tokens[focusRow]}" and "{tokens[topJ.j]}" is <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(att.scores[focusRow][topJ.j])}</strong>.</>}</>
          : <>
            "{tokens[focusRow]}" puts <strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{(topJ.v * 100).toFixed(1)}%</strong>
            {" "}of its attention on <strong style={{ color: P.good }}>"{tokens[topJ.j]}"</strong>.
            {" "}Its row sums to <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(row.reduce((s, v) => s + v, 0))}</strong>.
            {focusRow === 7 && <> Attention on "animal" is <strong style={{ color: P.class0, fontFamily: "Consolas, monospace" }}>{(row[1] * 100).toFixed(1)}%</strong> versus "street" at <strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{(row[5] * 100).toFixed(1)}%</strong> — the pronoun resolved correctly.</>}
          </>
      }
      notice={"Turn the √d scaling off. The attention becomes almost one-hot — a single token gets ~100% and everything else ~0%. A saturated softmax has near-zero gradient, so the model stops learning. That division is not cosmetic.\n\nTurn on the causal mask and look at row 1: it can only see itself. That is what makes generation possible — during training every position predicts the next token without being able to peek at the answer."}
      formalName="Scaled Dot-Product Attention"
      formalNote="softmax(QKᵀ/√d)·V. Every position reaches every other in one step, so there is no distance-based decay at all — the fix for the RNN problem. The cost is O(n²) in sequence length."
    >
      <Controls>
        <Slider label="Focus on token" value={focusRow} set={setFocusRow} min={0} max={7} step={1} fmt={(v) => tokens[v]} color={P.highlight} />
        <Toggle label="Divide by √d" on={scale} set={setScale} color={P.predict} />
        <Toggle label="Causal mask" on={causal} set={setCausal} color={P.derived} />
        <Slider label="Temperature" value={temp} set={setTemp} min={0.2} max={3} step={0.1} fmt={f2} color={P.class1} />
      </Controls>
      <StepPlayer step={stage} setStep={setStage} max={4} speed={1400} autoLabel="Build it up" labels={STAGES} />

      <Row>
        <Col flex="1 1 380px">
          <Heatmap
            title={stage === 0 ? "Nothing computed yet" : stage === 1 ? "Raw dot-product scores" : stage === 2 ? "Scaled by 1/√d" : stage === 3 && causal ? "Masked" : "Attention weights (each row sums to 1)"}
            data={stage === 0 ? E.map((r) => r.map(() => 0)) : stage === 1 ? att.scores : stage === 2 ? att.scaled : stage === 3 ? att.scaled.map((r, i) => r.map((v, j) => (causal && j > i ? -9 : v))) : att.weights}
            rowLabels={tokens} colLabels={tokens.map((t) => (t.length > 5 ? t.slice(0, 4) : t))}
            cell={38} fmt={stage >= 4 ? (v) => (v > 0.005 ? v.toFixed(2).slice(1) : "") : f2}
            highlight={(i) => i === focusRow}
            colorFor={(v, i, j) => (stage === 0 ? P.panel
              : stage === 3 && causal && j > i ? "rgba(90,100,120,0.25)"
                : `rgba(61,217,196,${0.06 + Math.min(0.9, Math.abs(v) / (stage >= 4 ? 1 : 1.5))})`)} />
          <Caption>Row = the token doing the looking, column = the token being looked at.</Caption>
        </Col>
        <Col flex="1 1 280px">
          {stage >= 4 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Where "{tokens[focusRow]}" looks
              </div>
              <Bars width={290} height={175} horizontal
                items={tokens.map((t, j) => ({ label: t, value: row[j] }))}
                fmt={(v) => (v * 100).toFixed(1) + "%"} maxValue={Math.max(...row)}
                colorFor={(it, j) => (j === topJ.j ? P.good : j === focusRow ? P.derived : P.faint)} />
              <Caption>Green is the strongest link; purple is the token itself.</Caption>
            </>
          )}
          <Stats>
            <Stat label="√d divisor" value={scale ? att.sqrtDk.toFixed(2) : "off"} color={scale ? P.predict : P.bad} />
            <Stat label="Peak weight" value={`${(Math.max(...row) * 100).toFixed(1)}%`} color={Math.max(...row) > 0.95 ? P.bad : P.good} />
          </Stats>
          {!scale && Math.max(...row) > 0.9 && (
            <Verdict tone="bad">
              Without the √d division one token takes {(Math.max(...row) * 100).toFixed(1)}% of the attention. The softmax is saturated, so its gradient is near zero and nothing learns.
            </Verdict>
          )}
          {focusRow === 7 && stage >= 4 && row[1] > row[5] && (
            <Verdict tone="good">
              "it" attends more to "animal" ({(row[1] * 100).toFixed(1)}%) than to "street" ({(row[5] * 100).toFixed(1)}%). The pronoun is resolved by a weighted lookup — no grammar rules involved.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. LANGUAGE MODEL PREDICTION
// ════════════════════════════════════════════════════════════════════════════

export function NgramSim() {
  const [n, setN] = useState(2);
  const [ctx, setCtx] = useState("the");
  const corpus = D.TINY_CORPUS;

  const model = useMemo(() => T.ngramTrain(corpus, n), [n]);
  const contexts = useMemo(() => [...model.table.keys()].sort(), [model]);
  const dist = T.ngramDistribution(model, ctx.split(" "));

  return (
    <Sim
      n={7}
      title="Predicting the Next Word"
      breadcrumb="NLP · Language modelling"
      hook={<>Read a short corpus, then count: every time you saw "{ctx}", what came next? Those counts, turned into fractions, are a language model.</>}
      question={`After "${ctx}", what word comes next — and how confident can you be?`}
      readout={
        dist.backoff
          ? <><strong style={{ color: P.bad }}>Never seen "{ctx}" in the corpus</strong> — so the model has nothing to say at all. Zero probability for every word. This is the sparsity problem, and it gets worse with every extra word of context.</>
          : <>
            Seen <strong style={{ fontFamily: "Consolas, monospace" }}>{dist.total}</strong> times. Most likely next word is
            {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>"{dist.candidates[0].token}"</strong>
            {" "}at <strong style={{ fontFamily: "Consolas, monospace" }}>{dist.candidates[0].count}/{dist.total} = {(dist.candidates[0].p * 100).toFixed(1)}%</strong>.
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{dist.candidates.length}</strong> different {dist.candidates.length === 1 ? "word has" : "words have"} followed it.
          </>
      }
      notice={"Switch to n=3. Predictions get sharper — often a single certain answer — but the number of distinct contexts explodes and most give 'never seen'. That is the bias-variance trade-off appearing in language modelling.\n\nThis is also the precise limitation neural models fix. An n-gram model has no idea that 'cat' and 'dog' are similar, so what it learns about one transfers nothing to the other. Embeddings exist to fix exactly that."}
      formalName="n-gram language model with maximum-likelihood estimation"
      formalNote="P(next | previous n−1 words) estimated by counting. Real systems add smoothing and backoff. Modern LMs replace counting with a learned function so similar contexts share statistical strength."
    >
      <Controls>
        <Slider label="Context length (n)" value={n} set={(v) => { setN(v); setCtx(v === 2 ? "the" : "sat on"); }} min={2} max={3} step={1}
          fmt={(v) => `${v}-gram`} color={P.highlight} />
        <Choice label="Context" value={ctx} set={setCtx} options={contexts.slice(0, 12).map((c) => ({ id: c, label: c }))} />
      </Controls>

      <div style={{ padding: "9px 12px", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}`, marginBottom: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: P.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Corpus</div>
        <div style={{ fontSize: 12.5, color: P.text, lineHeight: 1.7 }}>
          {corpus.split(" ").map((w, i) => (
            <span key={i} style={{
              padding: "1px 3px", borderRadius: 3, marginRight: 2,
              background: ctx.split(" ").includes(w) ? `${P.highlight}33` : "transparent",
              color: ctx.split(" ").includes(w) ? P.highlight : P.text,
            }}>{w}</span>
          ))}
        </div>
      </div>

      <Row>
        <Col flex="1 1 330px">
          {dist.candidates.length > 0 ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                What followed "{ctx}"
              </div>
              <Bars width={340} height={150} horizontal
                items={dist.candidates.map((c) => ({ label: `${c.token} (${c.count})`, value: c.p }))}
                fmt={(v) => (v * 100).toFixed(1) + "%"} maxValue={1}
                colorFor={(it, i) => (i === 0 ? P.good : P.predict)} />
              <Caption>Counts divided by the total. That is the whole model.</Caption>
            </>
          ) : (
            <Verdict tone="bad">No data for this context — the model cannot predict anything.</Verdict>
          )}
        </Col>
        <Col flex="1 1 260px">
          <Stats>
            <Stat label="Distinct contexts" value={contexts.length} color={P.derived} big />
            <Stat label="Vocabulary" value={model.vocab.length} color={P.faint} />
          </Stats>
          <Stats>
            <Stat label="Times seen" value={dist.total || 0} color={dist.total ? P.good : P.bad} />
            <Stat label="Possible next" value={dist.candidates.length} color={P.predict} />
          </Stats>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Coverage as n grows
          </div>
          <Bars width={270} height={110} items={[2, 3].map((nn) => {
            const m = T.ngramTrain(corpus, nn);
            return { label: `${nn}-gram`, value: [...m.table.keys()].length };
          })} fmt={(v) => String(v)} colorFor={(it, i) => (i + 2 === n ? P.highlight : P.faint)} />
          <Caption>More context means more distinct patterns to store, each seen fewer times.</Caption>
        </Col>
      </Row>
    </Sim>
  );
}

export const LANGUAGE_SIMS = [
  { id: "tokens", label: "Tokenization", Comp: TokenizationSim },
  { id: "tfidf", label: "TF-IDF", Comp: TfidfSim },
  { id: "embed", label: "Word Embeddings", Comp: EmbeddingSim },
  { id: "rnn", label: "Recurrent Networks", Comp: RnnSim },
  { id: "bptt", label: "Why RNNs Forget", Comp: BpttSim },
  { id: "attention", label: "Attention", Comp: AttentionSim },
  { id: "ngram", label: "Predicting the Next Word", Comp: NgramSim },
];
