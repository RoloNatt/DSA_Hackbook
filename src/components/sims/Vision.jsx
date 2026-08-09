import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Label, Heatmap, Bars, PixelGrid, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as M from "../../lib/mlmath.js";
import * as N from "../../lib/nn.js";
import * as D from "../../lib/datasets.js";

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "—");

// ════════════════════════════════════════════════════════════════════════════
// 1. CONVOLUTION, ONE CELL AT A TIME
// ════════════════════════════════════════════════════════════════════════════

export function ConvolutionSim() {
  const [imgId, setImgId] = useState("digitSeven");
  const [kernelId, setKernelId] = useState("sobelX");
  const [cell, setCell] = useState(0);
  const [custom, setCustom] = useState(null);

  const img = D.IMAGES[imgId];
  const kernel = custom || N.KERNELS[kernelId].k;
  const out = useMemo(() => N.conv2d(img.px, kernel, { padding: 0 }), [imgId, kernelId, custom]);
  const outH = out.length, outW = out[0].length;
  const oy = Math.floor(cell / outW) % outH, ox = cell % outW;
  const detail = N.convCellDetail(img.px, kernel, oy, ox, { padding: 0 });

  const editKernel = (r, c, delta) => {
    const k = (custom || kernel).map((row) => [...row]);
    k[r][c] = Math.round((k[r][c] + delta) * 10) / 10;
    setCustom(k);
  };

  const flat = out.flat();
  const kSum = kernel.flat().reduce((a, b) => a + b, 0);

  return (
    <Sim
      n={1}
      title="Convolution"
      breadcrumb="Computer vision · The core operation"
      hook={<>An 8×8 patch of a hand-drawn digit, brightness 0–9 per pixel. A small 3×3 stencil slides across it. At each stop it multiplies the nine pixels it covers by nine weights and adds them up. That single number goes into the output.</>}
      question={`The stencil is currently at output cell (${oy}, ${ox}). What number does it produce?`}
      readout={
        <>
          Covering pixels <strong style={{ fontFamily: "Consolas, monospace" }}>[{detail.terms.map((t) => t.px).join(", ")}]</strong>
          {" "}with weights <strong style={{ fontFamily: "Consolas, monospace" }}>[{detail.terms.map((t) => t.k).join(", ")}]</strong>:
          {" "}the products sum to <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f1(detail.sum)}</strong>.
          {" "}Across the whole image this kernel ranges <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(Math.min(...flat))} to {f1(Math.max(...flat))}</strong>.
          {" "}Its weights sum to <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(kSum)}</strong>
          {Math.abs(kSum) < 0.01 && <span style={{ color: P.predict }}> — zero, so flat areas output nothing and only changes survive.</span>}
          {Math.abs(kSum - 1) < 0.01 && <span style={{ color: P.predict }}> — one, so overall brightness is preserved.</span>}
        </>
      }
      notice={"Step the stencil along a row and watch the output. Over the flat black background it produces 0. The moment it straddles the edge of a stroke, it spikes. A convolution is a change detector, and the kernel decides which kind of change.\n\nEdit the weights yourself (click + / − on the kernel). Make the left column negative and the right column positive and you have built a vertical-edge detector from scratch. Nobody designed that for you — this is exactly the pattern a CNN learns on its own in its first layer."}
      formalName="2D cross-correlation (what every framework calls convolution)"
      formalNote="Multiply the receptive field elementwise by the kernel and sum. The same weights are reused at every position — that weight sharing is what makes CNNs tractable and translation-equivariant."
    >
      <Controls>
        <Choice label="Image" value={imgId} set={(v) => { setImgId(v); setCell(0); }}
          options={Object.entries(D.IMAGES).map(([id, im]) => ({ id, label: im.label }))} />
        <Choice label="Kernel" value={kernelId} set={(v) => { setKernelId(v); setCustom(null); }}
          options={Object.entries(N.KERNELS).map(([id, k]) => ({ id, label: k.label }))} />
      </Controls>
      <StepPlayer step={cell} setStep={setCell} max={outH * outW - 1} speed={260} autoLabel="Slide the stencil"
        labels={Array.from({ length: outH * outW }, (_, i) => {
          const y = Math.floor(i / outW), x = i % outW;
          const d = N.convCellDetail(img.px, kernel, y, x, { padding: 0 });
          return `Output (${y}, ${x}) = ${f1(d.sum)}`;
        })} />

      <Row>
        <Col flex="0 1 250px" min={230}>
          <PixelGrid px={img.px} cell={27} max={9} label="Input (8×8, brightness 0–9)"
            highlight={(r, c) => detail.terms.some((t) => t.y === r && t.x === c)} />
          <Caption>{img.note}</Caption>
        </Col>
        <Col flex="0 1 170px" min={160}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Kernel (editable)
          </div>
          <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
            <tbody>
              {kernel.map((row, r) => (
                <tr key={r}>
                  {row.map((v, c) => (
                    <td key={c} style={{ padding: 2 }}>
                      <div style={{
                        width: 44, background: v > 0 ? `rgba(74,158,255,${0.12 + Math.min(0.6, Math.abs(v) / 4)})` : v < 0 ? `rgba(255,92,92,${0.12 + Math.min(0.6, Math.abs(v) / 4)})` : P.panel,
                        border: `1px solid ${P.grid}`, borderRadius: 5, textAlign: "center", padding: "3px 0",
                      }}>
                        <div style={{ fontSize: 11.5, color: P.text, fontFamily: "Consolas, monospace", fontWeight: 700 }}>{Number.isInteger(v) ? v : v.toFixed(2)}</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 1 }}>
                          <button onClick={() => editKernel(r, c, -0.5)} style={{ fontSize: 9, lineHeight: 1, padding: "1px 4px", cursor: "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: P.dim, borderRadius: 3 }}>−</button>
                          <button onClick={() => editKernel(r, c, 0.5)} style={{ fontSize: 9, lineHeight: 1, padding: "1px 4px", cursor: "pointer", border: `1px solid ${P.grid}`, background: "transparent", color: P.dim, borderRadius: 3 }}>+</button>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {custom && (
            <button onClick={() => setCustom(null)} style={{
              display: "block", margin: "8px auto 0", padding: "4px 10px", fontSize: 11, cursor: "pointer",
              border: `1px solid ${P.grid}`, background: "transparent", color: P.dim, borderRadius: 6,
            }}>↺ Reset kernel</button>
          )}
          <Note>{custom ? "Your own kernel." : N.KERNELS[kernelId].note}</Note>
        </Col>
        <Col flex="0 1 250px" min={230}>
          <PixelGrid px={out} cell={30} min={Math.min(...flat)} max={Math.max(...flat)} diverging
            label={`Output (${outH}×${outW})`} highlight={(r, c) => r === oy && c === ox} />
          <Caption>Blue positive, red negative. Amber box is the cell being computed.</Caption>
        </Col>
      </Row>

      <div style={{ marginTop: 14, padding: "11px 13px", background: P.panel, borderRadius: 9, border: `1px solid ${P.grid}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          The arithmetic for cell ({oy}, {ox})
        </div>
        <div style={{ fontSize: 12.5, color: P.text, fontFamily: "Consolas, monospace", lineHeight: 1.9 }}>
          {detail.terms.map((t, i) => (
            <span key={i}>
              <span style={{ color: t.px === 0 ? P.faint : P.class0 }}>{t.px}</span>
              <span style={{ color: P.faint }}>×</span>
              <span style={{ color: t.k > 0 ? P.class0 : t.k < 0 ? P.class1 : P.faint }}>{t.k}</span>
              {i < detail.terms.length - 1 ? <span style={{ color: P.faint }}> + </span> : null}
            </span>
          ))}
          <span style={{ color: P.faint }}> = </span>
          <span style={{ color: P.highlight, fontWeight: 700, fontSize: 14 }}>{f1(detail.sum)}</span>
        </div>
      </div>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. STRIDE, PADDING & SHAPES
// ════════════════════════════════════════════════════════════════════════════

export function ConvShapeSim() {
  const [inSize, setInSize] = useState(224);
  const [k, setK] = useState(7);
  const [stride, setStride] = useState(2);
  const [pad, setPad] = useState(3);
  const [inCh, setInCh] = useState(3);
  const [outCh, setOutCh] = useState(64);
  const [dilation, setDilation] = useState(1);

  const s = N.convShape({ inSize, kernel: k, stride, padding: pad, inCh, outCh, dilation });
  const chain = useMemo(() => {
    let sz = inSize;
    const out = [{ label: "input", size: sz }];
    for (let i = 0; i < 5 && sz > 1; i++) {
      const st = N.convShape({ inSize: sz, kernel: 3, stride: 1, padding: 1 });
      sz = st.out;
      out.push({ label: `conv3 →`, size: sz });
      if (sz >= 2) { sz = Math.floor(sz / 2); out.push({ label: "pool2 →", size: sz }); }
    }
    return out;
  }, [inSize]);

  return (
    <Sim
      n={2}
      title="Stride, Padding & Output Size"
      breadcrumb="Computer vision · The arithmetic they ask for"
      hook={<>A colour photo comes in at <strong style={{ fontFamily: "Consolas, monospace" }}>{inSize}×{inSize}</strong> with {inCh} channels. The first layer of ResNet uses a {k}×{k} kernel, stride {stride}, padding {pad}. What comes out the other side?</>}
      question="Compute the output size and the parameter count — these are asked directly and they are free marks."
      readout={
        <>
          <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace", fontSize: 14 }}>{s.formula}</strong>
          {" "}→ output is <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{s.out}×{s.out}×{outCh}</strong>.
          {" "}Parameters: <strong style={{ fontFamily: "Consolas, monospace" }}>{k}×{k}×{inCh}×{outCh} + {outCh} = {s.params.toLocaleString()}</strong>.
          {" "}A dense layer doing the same job would need <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{s.denseEquivalent.toLocaleString()}</strong> —
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{Math.round(s.denseEquivalent / s.params).toLocaleString()}×</strong> more.
        </>
      }
      notice={"That parameter comparison is the entire argument for convolution. The same 9,472 weights are reused at all 112×112 positions; a dense layer would need a separate weight for every input-output pixel pair.\n\nSet stride to 1 and padding to (k−1)/2 — the output size matches the input exactly. That is 'same' padding, and it is why almost every modern architecture uses 3×3 kernels with padding 1: you can stack them forever without the image shrinking away."}
      formalName="The convolution output-size formula"
      formalNote="⌊(W + 2P − K) / S⌋ + 1 per spatial dimension, where dilation replaces K with d(K−1)+1. Parameters are K·K·C_in·C_out + C_out and do not depend on image size at all."
    >
      <Controls>
        <Slider label="Input size" value={inSize} set={setInSize} min={8} max={512} step={8} unit="px" color={P.class0} />
        <Slider label="Kernel size" value={k} set={setK} min={1} max={11} step={1} color={P.highlight} />
        <Slider label="Stride" value={stride} set={setStride} min={1} max={4} step={1} color={P.highlight} />
        <Slider label="Padding" value={pad} set={setPad} min={0} max={6} step={1} color={P.derived} />
      </Controls>
      <Controls>
        <Slider label="In channels" value={inCh} set={setInCh} min={1} max={512} step={1} color={P.class0} />
        <Slider label="Out channels" value={outCh} set={setOutCh} min={1} max={512} step={1} color={P.predict} />
        <Slider label="Dilation" value={dilation} set={setDilation} min={1} max={4} step={1} color={P.derived}
          hint={`receptive field ${s.receptiveField}`} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Spatial size through a typical stack
          </div>
          <Bars width={320} height={170} items={chain.map((c) => ({ label: String(c.size), value: c.size }))}
            fmt={(v) => String(v)} colorFor={(it, i) => (i === 0 ? P.class0 : i % 2 ? P.predict : P.derived)} />
          <Caption>Repeated conv3/pool2. Each halving is why deep layers see a large area of the original image.</Caption>
        </Col>
        <Col flex="1 1 280px">
          <Stats>
            <Stat label="Output" value={`${s.out}×${s.out}`} color={s.valid ? P.predict : P.bad} big
              hint={s.valid ? `×${outCh} channels` : "invalid"} />
            <Stat label="Parameters" value={s.params.toLocaleString()} color={P.highlight} />
          </Stats>
          <Stats>
            <Stat label="Weights" value={s.weights.toLocaleString()} color={P.derived} />
            <Stat label="Biases" value={s.biases} color={P.faint} />
            <Stat label="Receptive field" value={`${s.receptiveField}px`} color={P.class0} />
          </Stats>
          <Stats>
            <Stat label="Dense equivalent" value={s.denseEquivalent.toLocaleString()} color={P.bad} hint="what you saved" />
          </Stats>
          {pad === s.samePadding && stride === 1 && (
            <Verdict tone="good">Padding {pad} with stride 1 is 'same' padding for a {k}×{k} kernel: {inSize} in, {s.out} out. Size preserved.</Verdict>
          )}
          {!s.valid && <Verdict tone="bad">Invalid: the kernel is larger than the padded input. Increase padding or shrink the kernel.</Verdict>}
          <Note>Parameter count is completely independent of image size. A 3×3×3×16 conv is 448 weights whether the input is 32×32 or 4000×4000.</Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. POOLING
// ════════════════════════════════════════════════════════════════════════════

export function PoolingSim() {
  const [imgId, setImgId] = useState("digitSeven");
  const [size, setSize] = useState(2);
  const [kind, setKind] = useState("max");
  const [shift, setShift] = useState(1);

  const base = D.IMAGES[imgId].px;
  // Shift the image right by `shift` pixels to test translation invariance.
  const px = useMemo(() => base.map((row) => {
    const r = new Array(row.length).fill(0);
    for (let c = 0; c < row.length; c++) if (c + shift < row.length) r[c + shift] = row[c];
    return r;
  }), [imgId, shift]);

  const pooled = kind === "max" ? N.maxPool2d(px, size, size).out : N.avgPool2d(px, size, size);
  const pooled0 = kind === "max" ? N.maxPool2d(base, size, size).out : N.avgPool2d(base, size, size);
  const changed = pooled.flat().filter((v, i) => Math.abs(v - pooled0.flat()[i]) > 0.01).length;
  const inputChanged = px.flat().filter((v, i) => Math.abs(v - base.flat()[i]) > 0.01).length;

  return (
    <Sim
      n={3}
      title="Pooling"
      breadcrumb="Computer vision · Shrinking and stabilising"
      hook={<>The feature map is {px.length}×{px[0].length}. Pooling divides it into {size}×{size} blocks and replaces each block with a single number — the {kind === "max" ? "brightest pixel" : "average"}.</>}
      question="Nudge the digit sideways. How much does the input change, and how much does the pooled output change?"
      readout={
        <>
          Shifting the image right by <strong>{shift}</strong> {shift === 1 ? "pixel" : "pixels"} changed
          {" "}<strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{inputChanged}</strong> of {px.flat().length} input pixels
          {" "}but only <strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{changed}</strong> of {pooled.flat().length} pooled values.
          {" "}Size went from <strong style={{ fontFamily: "Consolas, monospace" }}>{px.length}×{px[0].length}</strong> to
          {" "}<strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{pooled.length}×{pooled[0].length}</strong> —
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{Math.round((1 - (pooled.length * pooled[0].length) / (px.length * px[0].length)) * 100)}%</strong> fewer numbers to carry forward.
        </>
      }
      notice={"That asymmetry is the point. Max pooling keeps the answer to 'is there a bright thing in this neighbourhood?' and throws away 'exactly where'. Small shifts stop mattering, which is what you want when classifying a cat regardless of where it sits in the frame.\n\nSwitch to average pooling on the checkerboard image: it nearly erases the texture, because averaging a bright and dark pixel gives the middle. Max pooling keeps the bright one. That is why max is the default for detecting features and average is used at the very end for summarising them."}
      formalName="Max pooling / Average pooling"
      formalNote="A fixed downsampling operation with no learnable parameters. It buys local translation invariance and cuts spatial size, at the cost of positional precision — which is why segmentation architectures avoid aggressive pooling."
    >
      <Controls>
        <Choice label="Image" value={imgId} set={setImgId} options={Object.entries(D.IMAGES).map(([id, im]) => ({ id, label: im.label }))} />
        <Choice label="Type" value={kind} set={setKind} options={[{ id: "max", label: "Max" }, { id: "avg", label: "Average" }]} />
        <Slider label="Window" value={size} set={setSize} min={2} max={4} step={1} fmt={(v) => `${v}×${v}`} color={P.highlight} />
        <Slider label="Shift image right" value={shift} set={setShift} min={0} max={3} step={1} unit="px" color={P.class1} />
      </Controls>

      <Row>
        <Col flex="0 1 250px" min={230}>
          <PixelGrid px={px} cell={27} max={9} label={`Input ${px.length}×${px[0].length}`} />
        </Col>
        <Col flex="0 1 220px" min={200}>
          <PixelGrid px={pooled} cell={Math.min(44, 200 / pooled.length)} max={9}
            label={`${kind === "max" ? "Max" : "Avg"} pooled ${pooled.length}×${pooled[0].length}`} />
          <Caption>Each cell summarises a {size}×{size} block.</Caption>
        </Col>
        <Col flex="1 1 240px">
          <Stats>
            <Stat label="Input pixels changed" value={inputChanged} color={P.bad} />
            <Stat label="Pooled changed" value={changed} color={P.good} big />
          </Stats>
          <Stats>
            <Stat label="Values before" value={px.length * px[0].length} color={P.faint} />
            <Stat label="Values after" value={pooled.length * pooled[0].length} color={P.predict} />
          </Stats>
          {shift > 0 && changed < inputChanged && (
            <Verdict tone="good">
              {inputChanged} pixels moved but only {changed} pooled values noticed. The representation became more stable than the input — that is translation invariance, earned rather than programmed.
            </Verdict>
          )}
          <Note>Set the image to Checkerboard and compare Max against Average. Average destroys the texture; max preserves the peaks.</Note>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. EDGE DETECTION PIPELINE
// ════════════════════════════════════════════════════════════════════════════

export function EdgePipelineSim() {
  const [imgId, setImgId] = useState("digitZero");
  const [stage, setStage] = useState(0);
  const [smooth, setSmooth] = useState(true);

  const base = D.IMAGES[imgId].px;
  const blurred = useMemo(() => (smooth ? N.conv2d(base, N.KERNELS.gaussian.k, { padding: 1, mode: "replicate" }) : base), [imgId, smooth]);
  const gx = useMemo(() => N.conv2d(blurred, N.KERNELS.sobelX.k, { padding: 1, mode: "replicate" }), [blurred]);
  const gy = useMemo(() => N.conv2d(blurred, N.KERNELS.sobelY.k, { padding: 1, mode: "replicate" }), [blurred]);
  const mag = useMemo(() => gx.map((row, r) => row.map((v, c) => Math.hypot(v, gy[r][c]))), [gx, gy]);
  const maxMag = Math.max(...mag.flat());

  const STAGES = [
    "The raw image.",
    smooth ? "Gaussian blur first — derivatives amplify noise, so smooth before differentiating." : "No smoothing (toggle it on to compare).",
    "Sobel X: responds only to horizontal brightness change, so it finds vertical edges.",
    "Sobel Y: the same operator rotated, finding horizontal edges.",
    "Combine both with √(gx² + gy²) — now edges at every orientation appear.",
  ];
  const shown = [base, blurred, gx, gy, mag][stage];
  const flat = shown.flat();

  return (
    <Sim
      n={4}
      title="Edge Detection, Stage by Stage"
      breadcrumb="Computer vision · Classical features"
      hook={<>Before CNNs learned their own filters, edge detection was hand-built as a short pipeline. It is worth walking because a trained CNN's first layer reinvents almost exactly this.</>}
      question="One detector finds vertical edges and another finds horizontal. How do you get all orientations?"
      readout={
        stage === 0 ? <>Raw {base.length}×{base[0].length} image, brightness 0–9. No processing yet.</>
          : stage === 1 ? <>{smooth ? <>Blurred. The sharp 0→9 jumps are now gradual, so the derivative that follows will not fire on single-pixel noise.</> : <>Smoothing skipped — the derivative will be noisier.</>}</>
            : stage === 2 ? <>Sobel X ranges <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(Math.min(...flat))} to {f1(Math.max(...flat))}</strong>. Strong response on the left and right sides of the shape; near zero on top and bottom.</>
              : stage === 3 ? <>Sobel Y ranges <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(Math.min(...flat))} to {f1(Math.max(...flat))}</strong> — and now it is the top and bottom that light up instead.</>
                : <>Gradient magnitude peaks at <strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{f1(maxMag)}</strong>.
                  {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{mag.flat().filter((v) => v > maxMag * 0.4).length}</strong> of {mag.flat().length} pixels
                  {" "}exceed 40% of the peak — those are the edge pixels, at every orientation.</>
      }
      notice={"Compare Sobel X and Sobel Y on the vertical-edge image: one fires strongly, the other outputs essentially zero in the interior. A single filter is orientation-blind, which is why a CNN layer has dozens of filters rather than one.\n\nToggle the blur off and step to the final stage. The edges get thicker and noisier. 'Smooth, then differentiate' is not optional — differentiation amplifies exactly the high frequencies that noise lives in."}
      formalName="The Sobel operator and gradient magnitude"
      formalNote="Sobel approximates the image's partial derivatives. Magnitude gives edge strength, atan2(gy, gx) gives orientation. Canny adds non-maximum suppression and hysteresis thresholding on top of this."
    >
      <Controls>
        <Choice label="Image" value={imgId} set={setImgId} options={Object.entries(D.IMAGES).map(([id, im]) => ({ id, label: im.label }))} />
        <Toggle label="Blur first" on={smooth} set={setSmooth} color={P.predict} />
      </Controls>
      <StepPlayer step={stage} setStep={setStage} max={4} speed={1500} autoLabel="Run pipeline" labels={STAGES} />

      <Row>
        <Col flex="0 1 260px" min={240}>
          <PixelGrid px={shown} cell={28} min={Math.min(...flat)} max={Math.max(...flat)}
            diverging={stage >= 2 && stage <= 3}
            label={["Raw", smooth ? "Blurred" : "Unblurred", "Sobel X (vertical edges)", "Sobel Y (horizontal edges)", "Gradient magnitude"][stage]} />
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            All five stages
          </div>
          <Row gap={8}>
            {[["Raw", base, false], [smooth ? "Blur" : "—", blurred, false], ["Sobel X", gx, true], ["Sobel Y", gy, true], ["Magnitude", mag, false]].map(([lab, m, div], i) => (
              <div key={i} style={{ flex: "0 0 90px", opacity: stage >= i ? 1 : 0.25, transition: "opacity 0.3s" }}>
                <PixelGrid px={m} cell={10} min={Math.min(...m.flat())} max={Math.max(...m.flat())} diverging={div} showValues={false} label={lab} />
              </div>
            ))}
          </Row>
          <Caption>The pipeline at a glance. Stages appear as you step through.</Caption>
          {stage >= 4 && (
            <Stats>
              <Stat label="Peak edge strength" value={f1(maxMag)} color={P.highlight} />
              <Stat label="Edge pixels" value={mag.flat().filter((v) => v > maxMag * 0.4).length} color={P.predict} hint=">40% of peak" />
            </Stats>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. IoU AND NON-MAX SUPPRESSION
// ════════════════════════════════════════════════════════════════════════════

const iou = (a, b) => {
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return { iou: union === 0 ? 0 : inter / union, inter, union };
};

function nms(boxes, thr) {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept = [], dropped = [];
  for (const b of sorted) {
    const clash = kept.find((k) => iou(k, b).iou > thr);
    if (clash) dropped.push({ ...b, becauseOf: clash.label, overlap: iou(clash, b).iou });
    else kept.push(b);
  }
  return { kept, dropped };
}

export function IouNmsSim() {
  const [thr, setThr] = useState(0.5);
  const [ax, setAx] = useState(34);
  const [ay, setAy] = useState(33);

  const gt = D.DETECTION_BOXES.groundTruth;
  const boxes = useMemo(() => D.DETECTION_BOXES.predictions.map((b, i) => (i === 0 ? { ...b, x: ax, y: ay } : b)), [ax, ay]);
  const res = nms(boxes, thr);
  const withGt = iou(gt, boxes[0]);

  const W = 260, H = 170;
  const scale = 1.05;

  return (
    <Sim
      n={5}
      title="IoU and Non-Max Suppression"
      breadcrumb="Computer vision · Object detection"
      hook={<>A detector never returns one clean box per object — it returns a pile of overlapping guesses with confidence scores. Here five boxes cover two objects.</>}
      question="How do you measure whether two boxes are 'the same detection', and how do you thin the pile down?"
      readout={
        <>
          Box A overlaps the ground truth with IoU <strong style={{ color: withGt.iou > 0.5 ? P.good : P.bad, fontFamily: "Consolas, monospace", fontSize: 15 }}>{withGt.iou.toFixed(3)}</strong>
          {" "}(<strong style={{ fontFamily: "Consolas, monospace" }}>{Math.round(withGt.inter).toLocaleString()}</strong> px² shared ÷
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{Math.round(withGt.union).toLocaleString()}</strong> px² combined)
          {" "}— {withGt.iou >= 0.5 ? <strong style={{ color: P.good }}>counts as a hit at the standard 0.5 threshold.</strong> : <strong style={{ color: P.bad }}>a miss at the standard 0.5 threshold.</strong>}
          {" "}NMS at <strong style={{ fontFamily: "Consolas, monospace" }}>{thr.toFixed(2)}</strong> keeps
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{res.kept.length}</strong> of {boxes.length} boxes
          {" "}and drops <strong style={{ color: P.bad, fontFamily: "Consolas, monospace" }}>{res.dropped.length}</strong>.
        </>
      }
      notice={"Drag the NMS threshold to 0.9. Almost nothing is suppressed and you get three boxes on one object — duplicate detections. Drag it to 0.15 and it becomes too aggressive: two genuinely separate objects standing close together get merged into one.\n\nThat is the real tension. NMS has no idea what an object is; it only knows overlap. Crowded scenes are exactly where it breaks, which is why DETR's set prediction — no NMS at all — was considered a big deal."}
      formalName="Intersection over Union · Non-Maximum Suppression"
      formalNote="IoU = shared area / combined area, so it is scale-invariant and always in [0,1]. NMS sorts by confidence, keeps the top box, discards everything overlapping it above the threshold, and repeats. Both are common coding asks."
    >
      <Controls>
        <Slider label="NMS threshold" value={thr} set={setThr} min={0.1} max={0.95} step={0.05} fmt={f2} color={P.highlight}
          hint={thr > 0.8 ? "too permissive — duplicates" : thr < 0.25 ? "too aggressive — merges objects" : "typical"} />
        <Slider label="Move box A ←→" value={ax} set={setAx} min={0} max={200} step={2} color={P.predict} />
        <Slider label="Move box A ↑↓" value={ay} set={setAy} min={0} max={110} step={2} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 300px">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, height: "auto", display: "block", background: P.panel, borderRadius: 8, border: `1px solid ${P.grid}` }}>
            {/* ground truth */}
            <rect x={gt.x / scale} y={gt.y / scale} width={gt.w / scale} height={gt.h / scale}
              fill="none" stroke={P.good} strokeWidth="2" strokeDasharray="5 3" />
            <text x={gt.x / scale} y={gt.y / scale - 4} fill={P.good} fontSize="8" fontFamily="var(--font-sans)">ground truth</text>
            {/* intersection with box A */}
            {(() => {
              const a = boxes[0];
              const x1 = Math.max(gt.x, a.x), y1 = Math.max(gt.y, a.y);
              const x2 = Math.min(gt.x + gt.w, a.x + a.w), y2 = Math.min(gt.y + gt.h, a.y + a.h);
              return x2 > x1 && y2 > y1
                ? <rect x={x1 / scale} y={y1 / scale} width={(x2 - x1) / scale} height={(y2 - y1) / scale} fill={P.highlight} opacity="0.3" />
                : null;
            })()}
            {boxes.map((b) => {
              const isKept = res.kept.some((k) => k.label === b.label);
              return (
                <g key={b.label}>
                  <rect x={b.x / scale} y={b.y / scale} width={b.w / scale} height={b.h / scale}
                    fill="none" stroke={isKept ? P.predict : P.class1} strokeWidth={isKept ? 2 : 1}
                    strokeDasharray={isKept ? undefined : "2 2"} opacity={isKept ? 1 : 0.5} />
                  <text x={b.x / scale + 2} y={b.y / scale + 9} fill={isKept ? P.predict : P.class1} fontSize="8" fontFamily="Consolas, monospace">
                    {b.label} {b.score.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
          <Key items={[{ color: P.good, label: "ground truth", dash: true }, { color: P.predict, label: "kept by NMS", line: true },
            { color: P.class1, label: "suppressed", dash: true }, { color: P.highlight, label: "overlap area" }]} />
        </Col>
        <Col flex="1 1 280px">
          <Stats>
            <Stat label="IoU (A vs truth)" value={withGt.iou.toFixed(3)} color={withGt.iou > 0.5 ? P.good : P.bad} big
              hint={withGt.iou > 0.5 ? "hit" : "miss"} />
          </Stats>
          <Stats>
            <Stat label="Shared area" value={Math.round(withGt.inter).toLocaleString()} unit="px²" color={P.highlight} />
            <Stat label="Combined area" value={Math.round(withGt.union).toLocaleString()} unit="px²" color={P.derived} />
          </Stats>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What NMS decided
          </div>
          {res.kept.map((b) => (
            <div key={b.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 8px", borderRadius: 5, background: `${P.good}18`, marginBottom: 3 }}>
              <span style={{ color: P.good, fontWeight: 700 }}>✓ keep {b.label}</span>
              <span style={{ color: P.dim, fontFamily: "Consolas, monospace" }}>score {b.score.toFixed(2)}</span>
            </div>
          ))}
          {res.dropped.map((b) => (
            <div key={b.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 8px", borderRadius: 5, background: `${P.bad}14`, marginBottom: 3 }}>
              <span style={{ color: P.bad }}>✗ drop {b.label}</span>
              <span style={{ color: P.dim, fontFamily: "Consolas, monospace" }}>IoU {b.overlap.toFixed(2)} with {b.becauseOf}</span>
            </div>
          ))}
          {res.kept.length > 2 && <Verdict tone="warn">{res.kept.length} boxes for 2 objects — the threshold is too permissive, so duplicates survived.</Verdict>}
          {res.kept.length < 2 && <Verdict tone="bad">Only {res.kept.length} box kept for 2 separate objects. The threshold is so aggressive it merged distinct objects.</Verdict>}
          {res.kept.length === 2 && <Verdict tone="good">Exactly one box per object. This is what NMS is supposed to do.</Verdict>}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. VIDEO: MOTION FROM FRAME DIFFERENCES
// ════════════════════════════════════════════════════════════════════════════

export function MotionSim() {
  const [frame, setFrame] = useState(3);
  const [speed, setSpeed] = useState(1);
  const [threshold, setThreshold] = useState(3);

  const cur = useMemo(() => D.movingSquare(frame, { speed }), [frame, speed]);
  const prev = useMemo(() => D.movingSquare(Math.max(0, frame - 1), { speed }), [frame, speed]);
  const diff = useMemo(() => cur.px.map((row, r) => row.map((v, c) => v - prev.px[r][c])), [cur, prev]);
  const motionMask = diff.map((row) => row.map((v) => (Math.abs(v) >= threshold ? 9 : 0)));
  const energy = diff.flat().reduce((s, v) => s + Math.abs(v), 0);
  const movedPx = motionMask.flat().filter((v) => v > 0).length;

  // Centroid shift = a crude optical-flow estimate
  const centroid = (px) => {
    let sx = 0, sy = 0, tot = 0;
    px.forEach((row, r) => row.forEach((v, c) => { sx += c * v; sy += r * v; tot += v; }));
    return tot === 0 ? null : [sx / tot, sy / tot];
  };
  const c1 = centroid(prev.px), c2 = centroid(cur.px);
  const dx = c1 && c2 ? c2[0] - c1[0] : 0, dy = c1 && c2 ? c2[1] - c1[1] : 0;

  return (
    <Sim
      n={6}
      title="Motion in Video"
      breadcrumb="Computer vision · The time axis"
      hook={<>A bright block moves across a {cur.px.length}×{cur.px[0].length} sensor. A single frame tells you where it is. Two consecutive frames tell you where it is <em>going</em>.</>}
      question="Subtract the previous frame from the current one. What survives, and what does that tell you?"
      readout={
        <>
          Frame <strong>{frame}</strong> minus frame <strong>{frame - 1}</strong> leaves
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{movedPx}</strong> pixels above the threshold
          {" "}out of {motionMask.flat().length} — everything static cancelled to exactly zero.
          {" "}Total motion energy <strong style={{ fontFamily: "Consolas, monospace" }}>{energy}</strong>.
          {" "}The bright centre moved <strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>({dx >= 0 ? "+" : ""}{f2(dx)}, {dy >= 0 ? "+" : ""}{f2(dy)})</strong> pixels,
          {" "}so its speed is <strong style={{ fontFamily: "Consolas, monospace" }}>{f2(Math.hypot(dx, dy))}</strong> px/frame heading {Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up")}.
        </>
      }
      notice={"The difference image has a bright edge where the block arrived and a dark edge where it left. That signed pair is the direction of travel, and it is why frame differencing gives you motion for almost no compute.\n\nRaise the speed to 3 and the two edges separate completely — the algorithm can no longer tell whether one object moved far or two objects appeared. That ambiguity is the correspondence problem, and it is the entire reason real optical flow is harder than subtraction."}
      formalName="Frame differencing · a first step toward optical flow"
      formalNote="Real optical flow (Lucas–Kanade, Farnebäck) solves for a per-pixel motion vector under a brightness-constancy assumption. Two-stream and 3D-conv video networks consume exactly this kind of temporal signal alongside RGB."
    >
      <Controls>
        <Slider label="Speed" value={speed} set={setSpeed} min={1} max={4} step={1} unit=" px/frame" color={P.class1} />
        <Slider label="Motion threshold" value={threshold} set={setThreshold} min={1} max={9} step={1} color={P.highlight} />
      </Controls>
      <StepPlayer step={frame} setStep={setFrame} max={10} speed={420} autoLabel="Play video"
        labels={Array.from({ length: 11 }, (_, i) => `Frame ${i}${i === 0 ? " — nothing to compare against yet." : ""}`)} />

      <Row>
        <Col flex="0 1 190px" min={175}>
          <PixelGrid px={prev.px} cell={15} max={9} showValues={false} label={`Frame ${Math.max(0, frame - 1)}`} />
        </Col>
        <Col flex="0 1 190px" min={175}>
          <PixelGrid px={cur.px} cell={15} max={9} showValues={false} label={`Frame ${frame}`} />
        </Col>
        <Col flex="0 1 190px" min={175}>
          <PixelGrid px={diff} cell={15} min={-9} max={9} diverging showValues={false} label="Difference" />
          <Caption>Blue = arrived, red = left</Caption>
        </Col>
        <Col flex="0 1 190px" min={175}>
          <PixelGrid px={motionMask} cell={15} max={9} showValues={false} label="Motion mask" />
          <Caption>Above threshold {threshold}</Caption>
        </Col>
      </Row>
      <Stats>
        <Stat label="Moving pixels" value={movedPx} color={P.highlight} />
        <Stat label="Motion energy" value={energy} color={P.derived} />
        <Stat label="Velocity" value={f2(Math.hypot(dx, dy))} unit=" px/f" color={P.predict} big />
        <Stat label="Direction" value={`${dx >= 0 ? "+" : ""}${f1(dx)}, ${dy >= 0 ? "+" : ""}${f1(dy)}`} color={P.predict} />
      </Stats>
      {speed >= 3 && (
        <Verdict tone="warn">
          At {speed} px/frame the arrival and departure edges no longer touch. Frame differencing cannot tell that they belong to the same object — this is where naive motion detection fails and real optical flow is needed.
        </Verdict>
      )}
    </Sim>
  );
}

export const VISION_SIMS = [
  { id: "conv", label: "Convolution", Comp: ConvolutionSim },
  { id: "convshape", label: "Stride, Padding & Shapes", Comp: ConvShapeSim },
  { id: "pooling", label: "Pooling", Comp: PoolingSim },
  { id: "edges", label: "Edge Detection", Comp: EdgePipelineSim },
  { id: "iou", label: "IoU & NMS", Comp: IouNmsSim },
  { id: "motion", label: "Motion in Video", Comp: MotionSim },
];
