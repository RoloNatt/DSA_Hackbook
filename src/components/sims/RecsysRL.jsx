import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Label, Heatmap, Bars, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as T from "../../lib/textrec.js";
import * as R from "../../lib/rl.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");

// ════════════════════════════════════════════════════════════════════════════
// 1. COLLABORATIVE FILTERING
// ════════════════════════════════════════════════════════════════════════════

export function CollaborativeFilteringSim() {
  const [user, setUser] = useState(0);
  const [item, setItem] = useState(3);
  const [k, setK] = useState(2);
  const [mode, setMode] = useState("user");

  const { users, items, R: R0 } = D.MOVIE_RATINGS;
  const [ratings, setRatings] = useState(R0);
  const S = useMemo(() => (mode === "user" ? T.userSimilarity(ratings) : T.itemSimilarity(ratings)), [ratings, mode]);
  const pred = useMemo(() => T.cfPredict(ratings, T.userSimilarity(ratings), user, item, { k }), [ratings, user, item, k]);
  const known = ratings[user][item] != null;

  const bump = (u, i, d) => {
    const next = ratings.map((row) => [...row]);
    const cur = next[u][i];
    next[u][i] = cur == null ? 3 : Math.max(1, Math.min(5, cur + d));
    setRatings(next);
  };

  return (
    <Sim
      n={1}
      title="Collaborative Filtering"
      breadcrumb="Recommenders · Guessing the blanks"
      hook={<>Five people rated four films out of 5. Some cells are blank. <strong>{users[user]}</strong> has not rated <strong>{items[item]}</strong> — but {users[1]} has, and {users[user]} and {users[1]} agree about everything else.</>}
      question={`Should we recommend ${items[item]} to ${users[user]}?`}
      readout={
        known
          ? <>{users[user]} already rated {items[item]} <strong style={{ fontFamily: "Consolas, monospace" }}>{ratings[user][item]}/5</strong>. Pick a blank cell to see a prediction.</>
          : pred.fellBackToMean
            ? <><strong style={{ color: P.bad }}>No usable neighbours</strong> — nobody similar to {users[user]} has rated {items[item]}, so the best guess is just their average, <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(pred.userMean)}</strong>. This is the cold-start problem.</>
            : <>
              Predicted rating for {users[user]} → {items[item]}:
              {" "}<strong style={{ color: pred.prediction >= 3.5 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 16 }}>{f2(pred.prediction)}/5</strong>.
              {" "}Built from <strong>{pred.neighbours.length}</strong> similar {pred.neighbours.length === 1 ? "person" : "people"}:
              {" "}{pred.neighbours.map((n) => `${users[n.u]} (similarity ${f2(n.sim)}, rated ${n.rating})`).join(", ")}.
              {" "}{users[user]}'s own average is <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(pred.userMean)}</strong>, so this is
              {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{pred.prediction > pred.userMean ? "+" : ""}{f2(pred.prediction - pred.userMean)}</strong> against it.
              {" "}<strong>{pred.prediction >= 3.5 ? "Recommend it." : "Do not recommend it."}</strong>
            </>
      }
      notice={"Click the +/− buttons to change someone's ratings and watch the similarity matrix and the prediction both move. Make Cara agree with Ana and Cara suddenly becomes a useful neighbour.\n\nNotice the prediction is built as \"the user's own average, plus a similarity-weighted correction\". That centring matters: some people rate everything 4–5 and others 1–3, so raw ratings are not comparable across people. Subtracting each person's mean is what makes them comparable."}
      formalName="User-based / item-based collaborative filtering"
      formalNote="Similarity is Pearson correlation over co-rated items only — otherwise missing data would look like agreement. Item-based is usually preferred in production: items are more stable than users and the matrix can be precomputed."
    >
      <Controls>
        <Choice label="Predict for" value={String(user)} set={(v) => setUser(Number(v))} options={users.map((u, i) => ({ id: String(i), label: u }))} />
        <Choice label="Film" value={String(item)} set={(v) => setItem(Number(v))} options={items.map((it, i) => ({ id: String(i), label: it }))} />
        <Slider label="Neighbours (k)" value={k} set={setK} min={1} max={4} step={1} color={P.highlight} />
        <Choice label="Similarity over" value={mode} set={setMode} options={[{ id: "user", label: "Users" }, { id: "item", label: "Items" }]} />
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ratings (click +/− to edit)
          </div>
          <table style={{ borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr>
                <th />
                {items.map((it) => (
                  <th key={it} style={{ padding: "3px 5px", color: P.dim, fontSize: 9.5, fontWeight: 600, maxWidth: 62, lineHeight: 1.2 }}>{it}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ratings.map((row, u) => (
                <tr key={u}>
                  <td style={{ padding: "3px 7px 3px 0", color: u === user ? P.highlight : P.dim, fontWeight: u === user ? 700 : 400, textAlign: "right" }}>{users[u]}</td>
                  {row.map((v, i) => {
                    const target = u === user && i === item;
                    return (
                      <td key={i} style={{ padding: 2 }}>
                        <div style={{
                          width: 52, borderRadius: 5, textAlign: "center", padding: "3px 0",
                          background: v == null ? (target ? `${P.highlight}22` : P.panel) : `rgba(61,217,196,${0.08 + (v / 5) * 0.5})`,
                          border: `1px solid ${target ? P.highlight : P.grid}`,
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: v == null ? (target ? P.highlight : P.faint) : P.text, fontFamily: "Consolas, monospace" }}>
                            {v == null ? (target && !known ? f2(pred.prediction) : "—") : v}
                          </div>
                          <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <button onClick={() => bump(u, i, -1)} style={{ fontSize: 8, lineHeight: 1, padding: "0 3px", cursor: "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: P.faint, borderRadius: 2 }}>−</button>
                            <button onClick={() => bump(u, i, 1)} style={{ fontSize: 8, lineHeight: 1, padding: "0 3px", cursor: "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: P.faint, borderRadius: 2 }}>+</button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <Caption>Amber cell is the one being predicted. Dashes are unrated.</Caption>
          {ratings !== R0 && (
            <button onClick={() => setRatings(R0)} style={{
              marginTop: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer",
              border: `1px solid ${P.grid}`, background: "transparent", color: P.dim, borderRadius: 6,
            }}>↺ Reset ratings</button>
          )}
        </Col>
        <Col flex="1 1 300px">
          <Heatmap title={`${mode === "user" ? "User" : "Item"} similarity (Pearson)`}
            data={S} rowLabels={mode === "user" ? users : items.map((i) => i.split(" ")[0])}
            colLabels={mode === "user" ? users.map((u) => u.slice(0, 3)) : items.map((i) => i.slice(0, 3))}
            cell={44} fmt={f2} min={-1} max={1}
            highlight={(i, j) => mode === "user" && i === user}
            colorFor={(v) => (v >= 0 ? `rgba(74,222,128,${0.08 + Math.abs(v) * 0.7})` : `rgba(255,92,92,${0.08 + Math.abs(v) * 0.7})`)} />
          <Caption>+1 = identical taste, −1 = opposite taste, 0 = unrelated.</Caption>
          {!known && !pred.fellBackToMean && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Who contributed
              </div>
              <Bars width={300} height={80} horizontal
                items={pred.neighbours.map((n) => ({ label: `${users[n.u]} → ${n.rating}`, value: n.sim }))}
                fmt={f2} maxValue={1} colorFor={() => P.good} />
            </>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. MATRIX FACTORIZATION
// ════════════════════════════════════════════════════════════════════════════

export function MatrixFactorizationSim() {
  const [dim, setDim] = useState(2);
  const [epochs, setEpochs] = useState(400);
  const { users, items, R: R0 } = D.MOVIE_RATINGS;

  const mf = useMemo(() => T.matrixFactorize(R0, { dim, epochs, lr: 0.03, reg: 0.02, seed: 8 }), [dim, epochs]);
  const observed = R0.flat().filter((v) => v != null).length;
  const totalCells = R0.length * R0[0].length;

  return (
    <Sim
      n={2}
      title="Matrix Factorization"
      breadcrumb="Recommenders · Learning hidden taste"
      hook={<>Instead of comparing people directly, invent <strong>{dim}</strong> hidden taste dimensions. Give every person a score on each, give every film a score on each, and predict a rating by multiplying them.</>}
      question={`Can ${mf.nParams} learned numbers reproduce ${observed} known ratings — and fill in the ${totalCells - observed} blanks?`}
      readout={
        <>
          After <strong style={{ fontFamily: "Consolas, monospace" }}>{epochs}</strong> passes with
          {" "}<strong>{dim}</strong> hidden {dim === 1 ? "dimension" : "dimensions"}, error on the known ratings is
          {" "}<strong style={{ color: mf.rmse < 0.3 ? P.good : P.highlight, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(mf.rmse)}</strong>
          {" "}(started at <span style={{ fontFamily: "Consolas, monospace" }}>{f3(mf.history[0].rmse)}</span>).
          {" "}Every blank now has a prediction — Ana → Costume Drama comes out at
          {" "}<strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{f2(mf.full[0][3])}</strong>.
          {" "}Uses <strong style={{ fontFamily: "Consolas, monospace" }}>{mf.nParams}</strong> parameters for {totalCells} cells.
        </>
      }
      notice={"Look at the learned user and item factors. Dimension 1 usually separates the action fans from the drama fans — nobody labelled that, it emerged from the ratings alone. That is what 'latent' means here.\n\nPush the dimensions up to 4 with only 17 known ratings. Training error keeps falling, but you now have more parameters than data, so it is memorizing. This is why production systems use regularization and pick dimensions by held-out error, never by training error."}
      formalName="Matrix factorization (the core of the Netflix Prize solutions)"
      formalNote="R ≈ global mean + user bias + item bias + P·Qᵀ, fitted by SGD on observed cells only with L2 regularization. Biases matter more than people expect — they capture 'this person rates everything highly' and 'this film is generally liked'."
    >
      <Controls>
        <Slider label="Hidden dimensions" value={dim} set={setDim} min={1} max={4} step={1} color={P.highlight}
          hint={dim * (users.length + items.length) > observed ? "more params than data" : "reasonable"} />
        <Slider label="Training passes" value={epochs} set={setEpochs} min={20} max={800} step={20} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 250px">
          <Heatmap title="Known ratings (blanks = unrated)"
            data={R0.map((row) => row.map((v) => (v == null ? NaN : v)))}
            rowLabels={users} colLabels={items.map((i) => i.slice(0, 3))} cell={40} fmt={(v) => (Number.isFinite(v) ? String(v) : "")}
            min={1} max={5} colorFor={(v) => (Number.isFinite(v) ? `rgba(61,217,196,${0.08 + (v / 5) * 0.55})` : "rgba(90,100,120,0.12)")} />
        </Col>
        <Col flex="1 1 250px">
          <Heatmap title="Reconstructed — every cell filled"
            data={mf.full} rowLabels={users} colLabels={items.map((i) => i.slice(0, 3))} cell={40} fmt={f2}
            min={1} max={5}
            highlight={(i, j) => R0[i][j] == null}
            colorFor={(v) => `rgba(185,140,255,${0.08 + (Math.max(0, Math.min(5, v)) / 5) * 0.55})`} />
          <Caption>Amber outlines are the predictions — cells nobody rated.</Caption>
        </Col>
        <Col flex="1 1 290px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Error over training
          </div>
          <Plot width={300} height={140} xMin={0} xMax={epochs} yMin={0} yMax={Math.max(...mf.history.map((h) => h.rmse)) * 1.1}
            xLabel="passes" yLabel="RMSE" xTicks={3} yTicks={3} yFmt={f2}>
            {({ sx, sy }) => (
              <g><Line pts={mf.history.map((h) => [sx(h.epoch), sy(h.rmse)])} color={P.good} width={2.2} /></g>
            )}
          </Plot>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Learned taste factors
          </div>
          <Heatmap data={mf.P} rowLabels={users} colLabels={Array.from({ length: dim }, (_, i) => `t${i + 1}`)} cell={32} fmt={f2}
            colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.1 + Math.min(0.8, Math.abs(v) / 2)})` : `rgba(255,92,92,${0.1 + Math.min(0.8, Math.abs(v) / 2)})`)} />
          <Heatmap data={mf.Q} rowLabels={items.map((i) => i.split(" ")[0])} colLabels={Array.from({ length: dim }, (_, i) => `t${i + 1}`)} cell={32} fmt={f2}
            colorFor={(v) => (v >= 0 ? `rgba(74,158,255,${0.1 + Math.min(0.8, Math.abs(v) / 2)})` : `rgba(255,92,92,${0.1 + Math.min(0.8, Math.abs(v) / 2)})`)} />
          <Caption>Nobody named these dimensions. They emerged from the ratings.</Caption>
        </Col>
      </Row>
      <Stats>
        <Stat label="RMSE" value={f3(mf.rmse)} color={mf.rmse < 0.3 ? P.good : P.highlight} big />
        <Stat label="Parameters" value={mf.nParams} color={P.derived} />
        <Stat label="Known ratings" value={observed} color={P.faint} />
        <Stat label="Blanks filled" value={totalCells - observed} color={P.predict} />
      </Stats>
      {mf.nParams > observed && (
        <Verdict tone="warn">
          {mf.nParams} parameters against {observed} known ratings. Training error will keep falling while genuine
          predictive quality falls — the classic recommender overfit. Choose dimensions on held-out data.
        </Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. RANKING METRICS
// ════════════════════════════════════════════════════════════════════════════

export function RankingMetricsSim() {
  const [order, setOrder] = useState(D.SEARCH_RESULTS.results.map((_, i) => i));
  const [k, setK] = useState(5);

  const results = order.map((i) => D.SEARCH_RESULTS.results[i]);
  const rel = results.map((r) => r.relevance);
  const rep = T.rankingReport(rel, k);
  const ideal = [...rel].sort((a, b) => b - a);

  const move = (pos, d) => {
    const next = [...order];
    const t = pos + d;
    if (t < 0 || t >= next.length) return;
    [next[pos], next[t]] = [next[t], next[pos]];
    setOrder(next);
  };

  return (
    <Sim
      n={3}
      title="Ranking Metrics"
      breadcrumb="Recommenders · Measuring order"
      hook={<>Someone searched <em>"{D.SEARCH_RESULTS.query}"</em>. A human graded all eight results: {D.SEARCH_RESULTS.scale}. The <strong>set</strong> of results is fixed — only the <strong>order</strong> changes.</>}
      question="Move a good result down the list. Which metrics notice, and which do not care at all?"
      readout={
        <>
          Precision@{k} <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(rep.precisionAtK)}</strong>,
          {" "}MRR <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(rep.mrr)}</strong>,
          {" "}MAP <strong style={{ fontFamily: "Consolas, monospace" }}>{f3(rep.ap)}</strong>,
          {" "}DCG@{k} <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(rep.dcg)}</strong> against an ideal of
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(rep.idealDcg)}</strong>, giving
          {" "}NDCG@{k} = <strong style={{ color: rep.ndcg > 0.9 ? P.good : rep.ndcg > 0.7 ? P.highlight : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f3(rep.ndcg)}</strong>.
          {rep.ndcg > 0.999 && <strong style={{ color: P.good }}> This is the perfect ordering.</strong>}
        </>
      }
      notice={"Swap the top two results. Precision@5 does not move at all — the same items are still in the top 5, and precision only cares about membership. NDCG drops immediately, because it discounts by position.\n\nNow move the one graded-3 result from rank 1 to rank 8. MRR collapses if nothing relevant remains at the top. That is the metric to use when there is only one right answer (a lookup); NDCG is the one to use when there are degrees of relevance (a browse)."}
      formalName="Precision@k · MRR · MAP · NDCG"
      formalNote="DCG sums (2^rel − 1)/log₂(rank+1), so gains are exponential in relevance and discounts logarithmic in position. NDCG divides by the ideal ordering's DCG, which makes it comparable across queries with different amounts of relevant content."
    >
      <Controls>
        <Slider label="Cut-off k" value={k} set={setK} min={1} max={8} step={1} color={P.highlight} />
        <button onClick={() => setOrder(D.SEARCH_RESULTS.results.map((_, i) => i).sort((a, b) => D.SEARCH_RESULTS.results[b].relevance - D.SEARCH_RESULTS.results[a].relevance))}
          style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${P.good}`, background: `${P.good}18`, color: P.good }}>
          Sort perfectly
        </button>
        <button onClick={() => setOrder(D.SEARCH_RESULTS.results.map((_, i) => i))}
          style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${P.grid}`, background: "transparent", color: P.dim }}>
          ↺ Reset
        </button>
      </Controls>

      <Row>
        <Col flex="1 1 400px">
          {results.map((r, pos) => (
            <div key={r.title} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 3, borderRadius: 7,
              background: pos < k ? P.panel : "transparent",
              border: `1px solid ${pos < k ? P.grid : "transparent"}`,
              opacity: pos < k ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 10.5, color: P.faint, width: 16, fontFamily: "Consolas, monospace" }}>{pos + 1}</span>
              <span style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 10.5, fontWeight: 700, fontFamily: "Consolas, monospace",
                background: r.relevance === 0 ? P.grid : `rgba(74,222,128,${0.15 + (r.relevance / 3) * 0.6})`,
                color: r.relevance === 0 ? P.faint : P.text,
              }}>{r.relevance}</span>
              <span style={{ fontSize: 12, color: P.text, flex: 1, lineHeight: 1.35 }}>{r.title}</span>
              <span style={{ fontSize: 10, color: P.faint, fontFamily: "Consolas, monospace", whiteSpace: "nowrap" }}>
                gain {((2 ** r.relevance - 1) / Math.log2(pos + 2)).toFixed(2)}
              </span>
              <span style={{ display: "flex", gap: 2 }}>
                <button onClick={() => move(pos, -1)} disabled={pos === 0} style={{ fontSize: 10, padding: "1px 5px", cursor: pos === 0 ? "default" : "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: pos === 0 ? P.grid : P.dim, borderRadius: 3 }}>↑</button>
                <button onClick={() => move(pos, 1)} disabled={pos === results.length - 1} style={{ fontSize: 10, padding: "1px 5px", cursor: pos === results.length - 1 ? "default" : "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: pos === results.length - 1 ? P.grid : P.dim, borderRadius: 3 }}>↓</button>
              </span>
            </div>
          ))}
          <Caption>Green squares are the human's relevance grade. "Gain" is that result's contribution to DCG at its current position.</Caption>
        </Col>
        <Col flex="1 1 280px">
          <Stats>
            <Stat label={`NDCG@${k}`} value={f3(rep.ndcg)} color={rep.ndcg > 0.9 ? P.good : rep.ndcg > 0.7 ? P.highlight : P.bad} big
              hint="position-aware" />
          </Stats>
          <Stats>
            <Stat label={`P@${k}`} value={f2(rep.precisionAtK)} color={P.predict} hint="ignores order" />
            <Stat label="MRR" value={f2(rep.mrr)} color={P.derived} hint="first hit only" />
          </Stats>
          <Stats>
            <Stat label="MAP" value={f3(rep.ap)} color={P.predict} />
            <Stat label={`Recall@${k}`} value={f2(rep.recallAtK)} color={P.faint} />
          </Stats>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Your order vs the ideal
          </div>
          <Bars width={290} height={110} items={rel.map((r, i) => ({ label: String(i + 1), value: r }))}
            fmt={(v) => String(v)} maxValue={3} colorFor={(it, i) => (i < k ? (rel[i] === ideal[i] ? P.good : P.highlight) : P.grid)} />
          <Caption>Green bars are already in their ideal position.</Caption>
          <Note>
            Which metric to optimize is a product decision, not a maths one. One right answer → MRR. Graded relevance
            and a scrollable list → NDCG. A fixed slate of k slots → precision@k.
          </Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. GRIDWORLD Q-LEARNING
// ════════════════════════════════════════════════════════════════════════════

export function QLearningSim() {
  const [gridId, setGridId] = useState("simple");
  const [alpha, setAlpha] = useState(0.2);
  const [gamma, setGamma] = useState(0.95);
  const [epsilon, setEpsilon] = useState(0.3);
  const [episodes, setEpisodes] = useState(600);
  const [stepCost, setStepCost] = useState(-0.02);
  const [slip, setSlip] = useState(0);
  const [showEp, setShowEp] = useState(600);

  const grid = useMemo(() => R.parseGrid(R.GRIDS[gridId].rows, { stepCost }), [gridId, stepCost]);
  const q = useMemo(() => R.qLearning(grid, { alpha, gamma, epsilon, episodes, slip, seed: 6 }), [grid, alpha, gamma, epsilon, episodes, slip]);
  const vi = useMemo(() => R.valueIteration(grid, { gamma }), [grid, gamma]);
  const ep = Math.min(showEp, q.log.length) - 1;
  const roll = useMemo(() => R.rolloutPolicy(grid, q.policy), [grid, q]);
  const viRoll = useMemo(() => R.rolloutPolicy(grid, vi.policy), [grid, vi]);

  const cell = 40;
  const maxV = Math.max(...q.values.filter(Number.isFinite), 0.01);
  const path = q.log[ep]?.path || [];

  return (
    <Sim
      n={4}
      title="Q-Learning"
      breadcrumb="Reinforcement learning · Learning by trial and error"
      hook={<>An agent is dropped in a grid with no map and no instructions. It only discovers that the goal is worth +1 by stumbling into it. Every move costs {stepCost}, so dawdling is punished.</>}
      question="With no model of the world, can repeated trial and error find the optimal route?"
      readout={
        <>
          After <strong style={{ fontFamily: "Consolas, monospace" }}>{episodes}</strong> episodes the agent reaches the goal in
          {" "}<strong style={{ color: roll.reachedGoal ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{roll.reachedGoal ? `${roll.steps} steps` : "never"}</strong>
          {roll.reachedGoal && <>, versus <strong style={{ fontFamily: "Consolas, monospace" }}>{viRoll.steps}</strong> for the optimal policy computed with full knowledge of the map</>}.
          {" "}Recent success rate <strong style={{ color: q.successRate > 0.9 ? P.good : P.highlight, fontFamily: "Consolas, monospace" }}>{(q.successRate * 100).toFixed(0)}%</strong>.
          {" "}Episode {ep + 1} took <strong style={{ fontFamily: "Consolas, monospace" }}>{q.log[ep]?.steps}</strong> steps for reward
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f2(q.log[ep]?.reward)}</strong>.
          {q.unvisited.length > 0 && <> <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{q.unvisited.length}</strong> squares were never visited at all.</>}
        </>
      }
      notice={"Set the step cost to 0 and epsilon to 0. Success collapses to 0% and most squares are never visited — because with all Q-values at 0 and no penalty, the agent picks the same action forever. The negative step cost was quietly doing the exploring: any untried action (still worth 0) looks better than one already tried (now negative). That is optimistic initialization.\n\nNow drop gamma to 0.5 on the maze. The distant goal gets discounted so heavily it barely registers, and the agent stops finding it. Gamma is not a tuning knob; it sets how far ahead the agent can see at all."}
      formalName="Q-learning (off-policy temporal-difference control)"
      formalNote="Q(s,a) ← Q(s,a) + α[r + γ·max Q(s′,·) − Q(s,a)]. That single line is the whole algorithm. It converges to the optimal policy without ever learning a model of the environment."
    >
      <Controls>
        <Choice label="Map" value={gridId} set={setGridId} options={Object.entries(R.GRIDS).map(([id, g]) => ({ id, label: g.label }))} />
        <Slider label="Episodes" value={episodes} set={(v) => { setEpisodes(v); setShowEp(v); }} min={20} max={2000} step={20} color={P.predict} />
      </Controls>
      <Controls>
        <Slider label="α learning rate" value={alpha} set={setAlpha} min={0.02} max={0.9} step={0.02} fmt={f2} color={P.highlight} />
        <Slider label="γ discount" value={gamma} set={setGamma} min={0.3} max={0.99} step={0.01} fmt={f2} color={P.derived}
          hint={gamma < 0.7 ? "short-sighted" : "far-sighted"} />
        <Slider label="ε exploration" value={epsilon} set={setEpsilon} min={0} max={1} step={0.05} fmt={f2} color={P.class1}
          hint={epsilon === 0 ? "no exploration" : ""} />
      </Controls>
      <Controls>
        <Slider label="Step cost" value={stepCost} set={setStepCost} min={-0.2} max={0} step={0.01} fmt={f2} color={P.class1}
          hint={stepCost === 0 ? "kills free exploration" : "prefers short paths"} />
        <Slider label="Slip chance" value={slip} set={setSlip} min={0} max={0.6} step={0.05} fmt={f2} color={P.bad}
          hint={slip > 0 ? "stochastic world" : "deterministic"} />
        <Slider label="Replay episode" value={showEp} set={setShowEp} min={1} max={episodes} step={1} color={P.good} />
      </Controls>

      <Row>
        <Col flex="0 1 250px" min={230}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Learned value + policy
          </div>
          <svg viewBox={`0 0 ${grid.W * cell + 2} ${grid.H * cell + 2}`} style={{ width: "100%", maxWidth: grid.W * cell + 2, height: "auto", display: "block" }}>
            {grid.cells.map((c) => {
              const s = c.r * grid.W + c.c;
              const v = q.values[s];
              const fill = c.wall ? P.grid : c.goal ? `${P.good}66` : c.trap ? `${P.bad}66`
                : `rgba(61,217,196,${Math.max(0, v / maxV) * 0.55 + 0.03})`;
              const onPath = path.some(([pr, pc]) => pr === c.r && pc === c.c);
              return (
                <g key={s}>
                  <rect x={c.c * cell + 1} y={c.r * cell + 1} width={cell - 2} height={cell - 2} rx="4"
                    fill={fill} stroke={onPath ? P.highlight : P.grid} strokeWidth={onPath ? 2 : 0.5} />
                  {!c.wall && !grid.terminal(c.r, c.c) && q.visits[s] > 0 && (
                    <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={P.text} fontSize="15" textAnchor="middle">
                      {R.ACTIONS[q.policy[s]].arrow}
                    </text>
                  )}
                  {c.goal && <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={P.good} fontSize="13" textAnchor="middle" fontWeight="700">+1</text>}
                  {c.trap && <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={P.bad} fontSize="13" textAnchor="middle" fontWeight="700">−1</text>}
                  {!c.wall && !grid.terminal(c.r, c.c) && (
                    <text x={c.c * cell + 3} y={c.r * cell + 10} fill={P.faint} fontSize="7" fontFamily="Consolas, monospace">{v.toFixed(2)}</text>
                  )}
                </g>
              );
            })}
          </svg>
          <Caption>Brighter = higher value. Amber outline traces episode {ep + 1}. Corner numbers are max Q.</Caption>
        </Col>
        <Col flex="0 1 250px" min={230}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Optimal, computed with the map
          </div>
          <svg viewBox={`0 0 ${grid.W * cell + 2} ${grid.H * cell + 2}`} style={{ width: "100%", maxWidth: grid.W * cell + 2, height: "auto", display: "block" }}>
            {grid.cells.map((c) => {
              const s = c.r * grid.W + c.c;
              const v = vi.V[s];
              const mx = Math.max(...vi.V.filter(Number.isFinite));
              const fill = c.wall ? P.grid : c.goal ? `${P.good}66` : c.trap ? `${P.bad}66`
                : `rgba(185,140,255,${Math.max(0, v / mx) * 0.55 + 0.03})`;
              const agree = !c.wall && !grid.terminal(c.r, c.c) && q.policy[s] === vi.policy[s];
              return (
                <g key={s}>
                  <rect x={c.c * cell + 1} y={c.r * cell + 1} width={cell - 2} height={cell - 2} rx="4" fill={fill} stroke={P.grid} strokeWidth="0.5" />
                  {vi.policy[s] != null && (
                    <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={agree ? P.good : P.highlight} fontSize="15" textAnchor="middle">
                      {R.ACTIONS[vi.policy[s]].arrow}
                    </text>
                  )}
                  {c.goal && <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={P.good} fontSize="13" textAnchor="middle" fontWeight="700">+1</text>}
                  {c.trap && <text x={c.c * cell + cell / 2} y={c.r * cell + cell / 2 + 5} fill={P.bad} fontSize="13" textAnchor="middle" fontWeight="700">−1</text>}
                </g>
              );
            })}
          </svg>
          <Caption>Green arrows are where the trial-and-error agent agrees; amber are where it differs.</Caption>
        </Col>
        <Col flex="1 1 290px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Steps per episode
          </div>
          <Plot width={300} height={150} xMin={1} xMax={q.log.length} yMin={0} yMax={Math.max(...q.log.map((l) => l.steps)) * 1.05}
            xLabel="episode" yLabel="steps to goal" xTicks={3} yTicks={3} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={q.log.map((l, i) => [sx(i + 1), sy(l.steps)])} color={P.predict} width={1} opacity={0.45} />
                {/* 20-episode moving average, so the trend is readable */}
                <Line pts={q.log.map((l, i) => {
                  const w = q.log.slice(Math.max(0, i - 19), i + 1);
                  return [sx(i + 1), sy(w.reduce((s, x) => s + x.steps, 0) / w.length)];
                })} color={P.good} width={2.2} />
                <Dot cx={sx(ep + 1)} cy={sy(q.log[ep].steps)} color={P.highlight} r={4.5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Caption>Faint = each episode, green = 20-episode average.</Caption>
          <Stats>
            <Stat label="Learned route" value={roll.reachedGoal ? `${roll.steps} steps` : "fails"} color={roll.reachedGoal ? P.good : P.bad} big />
            <Stat label="Optimal" value={`${viRoll.steps} steps`} color={P.derived} />
          </Stats>
          <Stats>
            <Stat label="Success rate" value={`${(q.successRate * 100).toFixed(0)}%`} color={q.successRate > 0.9 ? P.good : P.bad} />
            <Stat label="Unvisited" value={q.unvisited.length} color={q.unvisited.length ? P.bad : P.good} />
          </Stats>
          {roll.reachedGoal && roll.steps === viRoll.steps && (
            <Verdict tone="good">Matched the optimal policy without ever being shown the map — purely from reward feedback.</Verdict>
          )}
          {!roll.reachedGoal && (
            <Verdict tone="bad">
              The learned policy never reaches the goal. {epsilon === 0 && stepCost === 0 ? "With ε = 0 and no step cost there is no exploration pressure at all." : gamma < 0.7 ? "γ is so low the distant reward is discounted into irrelevance." : "Try more episodes or more exploration."}
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. EXPLORE VS EXPLOIT
// ════════════════════════════════════════════════════════════════════════════

export function BanditSim() {
  const [preset, setPreset] = useState("clear");
  const [pulls, setPulls] = useState(500);
  const [eps, setEps] = useState(0.1);

  const rates = R.BANDIT_PRESETS[preset].rates;
  const runs = useMemo(() => ({
    greedy: R.runBandit(rates, { strategy: "greedy", pulls, seed: 12 }),
    egreedy: R.runBandit(rates, { strategy: "egreedy", epsilon: eps, pulls, seed: 12 }),
    ucb: R.runBandit(rates, { strategy: "ucb", c: 2, pulls, seed: 12 }),
    thompson: R.runBandit(rates, { strategy: "thompson", pulls, seed: 12 }),
  }), [preset, pulls, eps]);

  const names = { greedy: "Pure greedy", egreedy: `ε-greedy (${f2(eps)})`, ucb: "UCB", thompson: "Thompson" };
  const cols = { greedy: P.bad, egreedy: P.highlight, ucb: P.predict, thompson: P.good };
  const best = Object.entries(runs).sort((a, b) => a[1].cumRegret - b[1].cumRegret)[0];
  const maxRegret = Math.max(...Object.values(runs).map((r) => r.cumRegret));

  return (
    <Sim
      n={5}
      title="Explore vs Exploit"
      breadcrumb="Reinforcement learning · The core tension"
      hook={<>{rates.length} slot machines with unknown payout rates. You get {pulls} pulls. Every pull spent testing a machine is a pull not spent on the best one — but you cannot know which is best without testing.</>}
      question="How much should you explore before committing?"
      readout={
        <>
          <strong style={{ color: cols[best[0]] }}>{names[best[0]]}</strong> wins with total regret
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace", fontSize: 15 }}>{best[1].cumRegret.toFixed(1)}</strong>
          {" "}— it spent <strong style={{ fontFamily: "Consolas, monospace" }}>{(best[1].pctOnBest * 100).toFixed(1)}%</strong> of pulls on the truly best machine.
          {" "}Pure greedy accumulated <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{runs.greedy.cumRegret.toFixed(1)}</strong> regret
          {" "}and {runs.greedy.foundBest ? "did find" : <strong style={{ color: P.bad }}>never found</strong>} the best arm.
          {" "}True best is machine <strong style={{ fontFamily: "Consolas, monospace" }}>{runs.ucb.bestArm + 1}</strong> at {(rates[runs.ucb.bestArm] * 100).toFixed(0)}%.
        </>
      }
      notice={"Pure greedy is the cautionary tale. It tries a machine, gets lucky or unlucky once, and then commits forever on almost no evidence. Watch its regret line grow perfectly straight — it never re-examines its decision.\n\nSwitch to the 'two near-identical best arms' preset. Every strategy's regret rises, because distinguishing 55% from 58% takes far more samples than distinguishing 20% from 75%. Regret is not just about the strategy; it is about how hard the problem is."}
      formalName="Multi-armed bandit · ε-greedy, UCB, Thompson sampling"
      formalNote="Regret is cumulative loss against always playing the best arm. ε-greedy explores at a fixed rate forever; UCB adds an uncertainty bonus that shrinks with use; Thompson samples from a posterior. The last two achieve logarithmic regret, ε-greedy only linear."
    >
      <Controls>
        <Choice label="Problem" value={preset} set={setPreset} options={Object.entries(R.BANDIT_PRESETS).map(([id, p]) => ({ id, label: p.label }))} />
        <Slider label="Pulls" value={pulls} set={setPulls} min={50} max={2000} step={50} color={P.predict} />
        <Slider label="ε for ε-greedy" value={eps} set={setEps} min={0.01} max={0.5} step={0.01} fmt={f2} color={P.highlight} />
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Cumulative regret — lower is better
          </div>
          <Plot width={350} height={210} xMin={0} xMax={pulls} yMin={0} yMax={maxRegret * 1.08}
            xLabel="pulls" yLabel="regret" xTicks={3} yTicks={4} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                {Object.entries(runs).map(([kk, r]) => (
                  <Line key={kk} pts={r.log.filter((_, i) => i % Math.max(1, Math.floor(pulls / 120)) === 0).map((l) => [sx(l.t), sy(l.cumRegret)])}
                    color={cols[kk]} width={2} />
                ))}
              </g>
            )}
          </Plot>
          <Key items={Object.keys(runs).map((kk) => ({ color: cols[kk], label: names[kk], line: true }))} />
          <Caption>A straight line means the strategy is losing at a constant rate — it has stopped learning.</Caption>
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            True payout rates
          </div>
          <Bars width={330} height={110} items={rates.map((r, i) => ({ label: `#${i + 1}`, value: r }))}
            fmt={(v) => `${(v * 100).toFixed(0)}%`} maxValue={1}
            colorFor={(it, i) => (i === runs.ucb.bestArm ? P.good : P.faint)} />
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Where each strategy spent its pulls
          </div>
          {Object.entries(runs).map(([kk, r]) => (
            <div key={kk} style={{ marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: cols[kk], fontWeight: 600 }}>{names[kk]}</span>
                <span style={{ color: P.dim, fontFamily: "Consolas, monospace" }}>
                  regret {r.cumRegret.toFixed(1)} · {(r.pctOnBest * 100).toFixed(0)}% on best
                </span>
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                {r.counts.map((c, i) => (
                  <div key={i} style={{
                    flex: c + 1, height: 10, borderRadius: 2,
                    background: i === r.bestArm ? P.good : P.grid,
                  }} title={`arm ${i + 1}: ${c} pulls`} />
                ))}
              </div>
            </div>
          ))}
          <Caption>Bar width is share of pulls; green is the truly best arm.</Caption>
          {!runs.greedy.foundBest && (
            <Verdict tone="bad">
              Pure greedy locked onto the wrong machine and never revisited the decision. With zero exploration, one
              unlucky early sample is permanent.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. REWARD DESIGN
// ════════════════════════════════════════════════════════════════════════════

export function RewardDesignSim() {
  const [which, setWhich] = useState(0);
  const trap = R.REWARD_TRAPS[which];

  return (
    <Sim
      n={6}
      title="Reward Design"
      breadcrumb="Reinforcement learning · Where it goes wrong"
      hook={<>An RL agent does not do what you want. It does what you <strong>measure</strong>. Those are the same thing only if you were extremely careful — and usually you were not.</>}
      question={`You want: "${trap.intent}". You wrote the reward as: "${trap.reward}". What does the agent actually learn?`}
      readout={
        <>
          <strong style={{ color: P.bad }}>{trap.result}</strong>
          {" "}The agent is not malfunctioning — it is maximizing exactly what you specified, perfectly.
          {" "}<strong style={{ color: P.good }}>Fix: {trap.fix}</strong>
        </>
      }
      notice={"This is not a toy concern. The boat-race case is a real documented result from OpenAI, and the thumbs-up case is the central difficulty in RLHF: human approval and correctness are correlated but not identical, so optimizing approval produces confident, agreeable, sometimes wrong answers.\n\nThe general pattern: reward the END STATE you actually want, not the intermediate actions you imagine will lead there. Every one of these traps rewards a proxy."}
      formalName="Reward hacking / specification gaming"
      formalNote="The agent optimizes the reward function you wrote, not the intention behind it. Goodhart's law applied to RL: once a measure becomes the target, it stops being a good measure."
    >
      <Controls>
        <Choice label="Case" value={String(which)} set={(v) => setWhich(Number(v))}
          options={R.REWARD_TRAPS.map((t, i) => ({ id: String(i), label: t.intent.length > 24 ? t.intent.slice(0, 22) + "…" : t.intent }))} />
      </Controls>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "What you wanted", body: trap.intent, color: P.good, icon: "🎯" },
          { label: "What you wrote down", body: trap.reward, color: P.highlight, icon: "✍️" },
          { label: "What the agent did", body: trap.result, color: P.bad, icon: "🤖" },
          { label: "The fix", body: trap.fix, color: P.predict, icon: "🔧" },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "11px 14px", borderRadius: 9,
            background: P.panel, borderLeft: `3px solid ${row.color}`,
          }}>
            <span style={{ fontSize: 18 }}>{row.icon}</span>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: row.color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 13, color: P.text, lineHeight: 1.6 }}>{row.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          All {R.REWARD_TRAPS.length} cases
        </div>
        {R.REWARD_TRAPS.map((t, i) => (
          <button key={i} onClick={() => setWhich(i)} style={{
            display: "block", width: "100%", textAlign: "left", padding: "7px 11px", marginBottom: 4, borderRadius: 7,
            cursor: "pointer", fontFamily: "var(--font-sans)",
            border: `1px solid ${i === which ? P.highlight : P.grid}`,
            background: i === which ? `${P.highlight}12` : "transparent",
          }}>
            <span style={{ fontSize: 12, color: i === which ? P.highlight : P.text, fontWeight: i === which ? 700 : 400 }}>{t.intent}</span>
            <span style={{ fontSize: 11.5, color: P.faint }}> → {t.result.slice(0, 60)}…</span>
          </button>
        ))}
      </div>
    </Sim>
  );
}

export const RECSYS_SIMS = [
  { id: "cf", label: "Collaborative Filtering", Comp: CollaborativeFilteringSim },
  { id: "mf", label: "Matrix Factorization", Comp: MatrixFactorizationSim },
  { id: "ranking", label: "Ranking Metrics", Comp: RankingMetricsSim },
];

export const RL_SIMS = [
  { id: "qlearn", label: "Q-Learning", Comp: QLearningSim },
  { id: "bandit", label: "Explore vs Exploit", Comp: BanditSim },
  { id: "reward", label: "Reward Design", Comp: RewardDesignSim },
];
