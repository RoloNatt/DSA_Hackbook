import { C } from "./MLWidgets.jsx";

// Shared two-level navigation primitives.
//
// Every track exposes its sections as an ordered *path* grouped into stages, so
// the answer to "what do I read first, and what next?" is visible on screen
// instead of implied by tab order.

const BLUE = "#1A73E8";

export function flatten(stages) {
  return stages.flatMap((s) => s.items.map((it) => ({ ...it, stage: s.stage })));
}

// ─── STAGE NAV ──────────────────────────────────────────────────────────────
// stages: [{ stage, hint, items: [{ id, label, why }] }]

export function StageNav({ stages, tab, setTab, accent = BLUE }) {
  const flat = flatten(stages);
  const pos = flat.findIndex((i) => i.id === tab);
  const current = flat[pos];
  let n = 0;

  return (
    <div style={{
      border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden",
      marginBottom: "1.4rem", background: C.bg,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12,
        flexWrap: "wrap", padding: "9px 14px", borderBottom: `0.5px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.sub }}>
          Reading path — follow it in order, or jump to what you need
        </div>
        {current && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: accent, whiteSpace: "nowrap" }}>
            Step {pos + 1} of {flat.length}
          </div>
        )}
      </div>

      {stages.map((s, si) => (
        <div key={s.stage} style={{
          display: "grid", gridTemplateColumns: "minmax(120px, 158px) 1fr", gap: 12,
          padding: "10px 14px",
          borderTop: si === 0 ? "none" : `0.5px dashed ${C.border}`,
          alignItems: "start",
        }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.text, letterSpacing: "0.02em" }}>
              {"①②③④⑤⑥"[si]} {s.stage}
            </div>
            {s.hint && (
              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.45, marginTop: 2 }}>{s.hint}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {s.items.map((it) => {
              n += 1;
              const on = tab === it.id;
              return (
                <button key={it.id} onClick={() => setTab(it.id)} title={it.why || ""} style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "6px 12px 6px 7px", borderRadius: 100, cursor: "pointer",
                  fontSize: 12.5, fontFamily: "var(--font-sans)", fontWeight: on ? 700 : 400,
                  border: `1.5px solid ${on ? accent : C.border2}`,
                  background: on ? "#E8F0FE" : "var(--color-background-primary)",
                  color: on ? accent : C.sub, whiteSpace: "nowrap", transition: "all 0.13s",
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10.5, fontWeight: 800,
                    background: on ? accent : C.bg, color: on ? "#fff" : C.sub,
                    border: on ? "none" : `0.5px solid ${C.border2}`,
                  }}>{n}</span>
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {current?.why && (
        <div style={{
          padding: "9px 14px", borderTop: `0.5px solid ${C.border}`, background: "#E8F0FE",
          fontSize: 12.5, color: C.text, lineHeight: 1.6,
        }}>
          <strong style={{ color: accent }}>You're reading #{pos + 1} {current.label} — </strong>
          {current.why}
        </div>
      )}
    </div>
  );
}

// ─── PATH FOOTER ────────────────────────────────────────────────────────────

export function PathFooter({ stages, tab, setTab, accent = BLUE }) {
  const flat = flatten(stages);
  const pos = flat.findIndex((i) => i.id === tab);
  if (pos < 0) return null;
  const prev = flat[pos - 1];
  const next = flat[pos + 1];

  const btn = (item, dir) => (
    <button onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
      flex: "1 1 240px", textAlign: dir === "prev" ? "left" : "right", cursor: "pointer",
      padding: "11px 15px", borderRadius: 10, border: `0.5px solid ${C.border2}`,
      background: C.bg, fontFamily: "var(--font-sans)",
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.sub }}>
        {dir === "prev" ? "← Previous" : "Next up →"}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: accent, marginTop: 2 }}>{item.label}</div>
      {item.why && <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.45, marginTop: 2 }}>{item.why}</div>}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: `0.5px solid ${C.border}` }}>
      {prev ? btn(prev, "prev") : <div style={{ flex: "1 1 240px" }} />}
      {next
        ? btn(next, "next")
        : (
          <div style={{
            flex: "1 1 240px", textAlign: "right", padding: "11px 15px", borderRadius: 10,
            border: `0.5px solid ${C.border2}`, background: C.bg, fontSize: 12.5, color: C.sub, lineHeight: 1.5,
          }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: accent }}>End of this track ✓</div>
            Loop back to step 1 and re-test yourself out loud.
          </div>
        )}
    </div>
  );
}
