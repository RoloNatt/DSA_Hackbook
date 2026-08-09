import { useState, useMemo } from "react";
import {
  P, Sim, Slider, Choice, Toggle, Controls, StepPlayer, Stat, Stats, Verdict,
  Plot, Dot, Line, Label, Heatmap, Bars, Row, Col, Caption, Note, Key,
} from "../SimKit.jsx";
import * as S from "../../lib/signal.js";

const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "—");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "—");

const SR = 8000;

// ════════════════════════════════════════════════════════════════════════════
// 1. WAVEFORM TO SPECTROGRAM
// ════════════════════════════════════════════════════════════════════════════

export function SpectrogramSim() {
  const [source, setSource] = useState("chirp");
  const [frameSize, setFrameSize] = useState(256);
  const [window, setWindow] = useState("hann");
  const [noise, setNoise] = useState(0);

  const signal = useMemo(() => {
    let sig;
    if (source === "chirp") sig = S.chirp(300, 3200, { sampleRate: SR, duration: 0.4 });
    else if (source === "twotone") sig = S.mix(S.tone(500, { sampleRate: SR, duration: 0.4 }), S.tone(1500, { sampleRate: SR, duration: 0.4 }));
    else if (source === "single") sig = S.tone(1000, { sampleRate: SR, duration: 0.4 });
    else sig = S.vowel(source, { sampleRate: SR, duration: 0.4, f0: 120 });
    return noise > 0 ? S.addNoise(sig, noise, 5) : sig;
  }, [source, noise]);

  const stft = useMemo(() => S.stft(signal, SR, { frameSize, hop: Math.floor(frameSize / 2), window }), [signal, frameSize, window]);
  const spec = useMemo(() => S.spectrum(signal.slice(0, frameSize), SR, { window }), [signal, frameSize, window]);

  // Spectrogram as a matrix: rows = frequency (high at top), cols = time
  const grid = useMemo(() => {
    const nB = Math.min(48, stft.nBins);
    const step = stft.nBins / nB;
    return Array.from({ length: nB }, (_, ri) => {
      const b = Math.floor((nB - 1 - ri) * step);
      return stft.frames.map((f) => f.bins[b].db);
    });
  }, [stft]);
  const flat = grid.flat();
  const dbMax = Math.max(...flat), dbMin = dbMax - 55;

  return (
    <Sim
      n={1}
      title="From Waveform to Spectrogram"
      breadcrumb="Speech & audio · The core representation"
      hook={<>A microphone gives you one number per instant — air pressure. That tells you nothing about <em>pitch</em>. To hear frequency you have to take a short slice and ask "which repeating rates are present in here?"</>}
      question="What frequencies is this sound actually made of, and how do they change over time?"
      readout={
        <>
          The first {frameSize}-sample slice ({f1(spec.durationMs)} ms) peaks at
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f1(spec.peak.hz)} Hz</strong>.
          {" "}Frequency resolution is <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(spec.resolutionHz)} Hz</strong> per bin
          {" "}({SR} Hz ÷ {frameSize} samples), and the highest measurable frequency is
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{spec.nyquist} Hz</strong>.
          {" "}The full spectrogram is <strong style={{ fontFamily: "Consolas, monospace" }}>{stft.nFrames}</strong> slices at
          {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{f1(stft.timeResolutionMs)} ms</strong> apart.
        </>
      }
      notice={"Drag the window size. At 64 samples you get sharp timing (8 ms) but coarse frequency (125 Hz per bin) — the chirp looks like a smear. At 1024 you get fine frequency (7.8 Hz) but each slice covers 128 ms, so fast changes blur together.\n\nYou cannot have both. That is not an implementation limit, it is the time–frequency uncertainty principle, and choosing the window length is the single most consequential decision in audio processing."}
      formalName="Short-Time Fourier Transform"
      formalNote="Slice, window, transform, repeat. Resolution is sampleRate/N in frequency and hop/sampleRate in time — improving one always worsens the other. Nearly every speech model consumes some version of this rather than raw audio."
    >
      <Controls>
        <Choice label="Sound" value={source} set={setSource} options={[
          { id: "chirp", label: "Rising sweep" }, { id: "single", label: "1 kHz tone" }, { id: "twotone", label: "Two tones" },
          { id: "ah", label: "Vowel \"ah\"" }, { id: "ee", label: "Vowel \"ee\"" }, { id: "oo", label: "Vowel \"oo\"" },
        ]} />
        <Slider label="Window size" value={frameSize} set={setFrameSize} min={64} max={1024} step={64} unit=" samples" color={P.highlight}
          hint={`${f1((frameSize / SR) * 1000)} ms · ${f1(SR / frameSize)} Hz/bin`} />
        <Choice label="Window shape" value={window} set={setWindow} options={Object.entries(S.WINDOWS).map(([id, w]) => ({ id, label: w.label.split(" ")[0] }))} />
        <Slider label="Noise" value={noise} set={setNoise} min={0} max={0.5} step={0.05} fmt={f2} color={P.bad} />
      </Controls>

      <Row>
        <Col flex="1 1 340px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The waveform — first 400 samples
          </div>
          <Plot width={350} height={110} xMin={0} xMax={400} yMin={-Math.max(...signal.slice(0, 400).map(Math.abs)) * 1.1} yMax={Math.max(...signal.slice(0, 400).map(Math.abs)) * 1.1}
            xLabel="sample" yLabel="pressure" xTicks={3} yTicks={3} yFmt={f1}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(0)} y1={sy(0)} x2={sx(400)} y2={sy(0)} stroke={P.grid} strokeWidth="1" />
                <Line pts={signal.slice(0, 400).map((v, i) => [sx(i), sy(v)])} color={P.class0} width={1.2} />
                <rect x={sx(0)} y={sy(Math.max(...signal.slice(0, 400).map(Math.abs)) * 1.1)}
                  width={Math.abs(sx(frameSize) - sx(0))} height={Math.abs(sy(0) - sy(Math.max(...signal.slice(0, 400).map(Math.abs)) * 1.1)) * 2}
                  fill={P.highlight} opacity="0.12" />
              </g>
            )}
          </Plot>
          <Caption>Amber shading is the analysis window. This alone cannot tell you the pitch.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            One slice, transformed
          </div>
          <Plot width={350} height={150} xMin={0} xMax={spec.nyquist} yMin={0} yMax={Math.max(...spec.bins.map((b) => b.mag)) * 1.1}
            xLabel="frequency (Hz)" yLabel="magnitude" xTicks={4} yTicks={3} yFmt={(v) => v.toFixed(2)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={spec.bins.map((b) => [sx(b.hz), sy(b.mag)])} color={P.predict} width={1.8} />
                <Dot cx={sx(spec.peak.hz)} cy={sy(spec.peak.mag)} color={P.highlight} r={5} halo={P.highlight} />
                <Label x={sx(spec.peak.hz) + 8} y={sy(spec.peak.mag) - 6} size={10.5} color={P.highlight}>{f1(spec.peak.hz)} Hz</Label>
              </g>
            )}
          </Plot>
        </Col>
        <Col flex="1 1 330px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Spectrogram — frequency up, time across
          </div>
          <Heatmap data={grid} cell={Math.max(4, Math.floor(300 / stft.nFrames))} min={dbMin} max={dbMax}
            showValues={false} fmt={() => ""}
            colorFor={(v) => {
              const t = Math.max(0, Math.min(1, (v - dbMin) / (dbMax - dbMin)));
              return `rgba(${Math.round(20 + t * 235)}, ${Math.round(30 + t * 190)}, ${Math.round(80 + t * 60)}, ${0.15 + t * 0.85})`;
            }} />
          <Caption>
            {source === "chirp" ? "The bright ridge climbing left-to-right IS the rising pitch." :
              source.length === 2 ? "Horizontal bands are the formants — the resonances that make this vowel identifiable." :
                "Horizontal lines mean steady frequencies."}
          </Caption>
          <Stats>
            <Stat label="Freq resolution" value={`${f1(stft.freqResolutionHz)} Hz`} color={P.predict} />
            <Stat label="Time resolution" value={`${f1(stft.timeResolutionMs)} ms`} color={P.derived} />
          </Stats>
          <Stats>
            <Stat label="Peak" value={`${f1(spec.peak.hz)} Hz`} color={P.highlight} big />
            <Stat label="Nyquist limit" value={`${spec.nyquist} Hz`} color={P.faint} />
          </Stats>
          <Note>{S.WINDOWS[window].note}</Note>
        </Col>
      </Row>
      {frameSize <= 128 && (
        <Verdict tone="warn">
          At {frameSize} samples each bin is {f1(SR / frameSize)} Hz wide — too coarse to separate two nearby tones, though timing is sharp at {f1((frameSize / SR) * 1000)} ms.
        </Verdict>
      )}
      {frameSize >= 768 && (
        <Verdict tone="warn">
          At {frameSize} samples frequency is precise ({f1(SR / frameSize)} Hz) but each slice spans {f1((frameSize / SR) * 1000)} ms — long enough to smear a consonant.
        </Verdict>
      )}
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. THE MEL SCALE
// ════════════════════════════════════════════════════════════════════════════

export function MelSim() {
  const [nFilters, setNFilters] = useState(12);
  const [vowel, setVowel] = useState("ah");

  const sig = useMemo(() => S.vowel(vowel, { sampleRate: SR, duration: 256 / SR, f0: 120 }), [vowel]);
  const spec = useMemo(() => S.spectrum(sig, SR), [sig]);
  const bank = useMemo(() => S.melFilterbank({ nFilters, nBins: spec.bins.length, sampleRate: SR }), [nFilters, spec]);
  const energies = useMemo(() => S.applyMel(spec.bins, bank), [spec, bank]);
  const mfccs = useMemo(() => S.mfcc(sig, SR, { nFilters: 20, nCoeffs: 13 }), [sig]);
  const hottest = energies.reduce((a, b) => (b.energy > a.energy ? b : a));

  const lowGap = S.melToHz(500) - S.melToHz(400);
  const highGap = S.melToHz(2000) - S.melToHz(1900);

  return (
    <Sim
      n={2}
      title="The Mel Scale"
      breadcrumb="Speech & audio · Hearing like an ear"
      hook={<>To your ear, 100 Hz → 200 Hz is a big jump but 5000 Hz → 5100 Hz is nothing, even though both are +100 Hz. Pitch perception is roughly logarithmic, so a spectrogram with evenly-spaced frequency bins wastes most of its resolution up high where you cannot hear the difference.</>}
      question="How do you space frequency bands so each one matters equally to a listener?"
      readout={
        <>
          Equal steps in mel are unequal in Hz: mel 400→500 spans
          {" "}<strong style={{ color: P.class0, fontFamily: "Consolas, monospace" }}>{f1(lowGap)} Hz</strong>, but mel 1900→2000 spans
          {" "}<strong style={{ color: P.class1, fontFamily: "Consolas, monospace" }}>{f1(highGap)} Hz</strong> —
          {" "}<strong style={{ color: P.highlight, fontFamily: "Consolas, monospace" }}>{(highGap / lowGap).toFixed(1)}×</strong> wider.
          {" "}{nFilters} filters compress {spec.bins.length} bins down to {nFilters} numbers.
          {" "}For "{vowel}" the hottest band is centred at
          {" "}<strong style={{ color: P.good, fontFamily: "Consolas, monospace" }}>{f1(hottest.centerHz)} Hz</strong>
          {" "}— close to its published first formant of {S.VOWELS[vowel].formants[0]} Hz.
        </>
      }
      notice={"Look at the triangle widths. The low filters are narrow and the high ones are wide, because that matches how finely you can actually discriminate pitch at each frequency. Below the filterbank, the same information becomes 13 MFCC coefficients — a 10× compression that keeps the vowel identity.\n\nSwitch between vowels and watch which bands light up. \"ee\" and \"oo\" differ mainly in their first two formants, and that is exactly what the mel bands and the MFCCs capture."}
      formalName="Mel filterbank and MFCCs"
      formalNote="mel = 2595·log₁₀(1 + Hz/700). Triangular filters equally spaced in mel space are applied to the power spectrum, log-compressed, then decorrelated with a DCT. MFCCs dominated speech recognition for decades and remain a strong baseline."
    >
      <Controls>
        <Choice label="Vowel" value={vowel} set={setVowel} options={Object.entries(S.VOWELS).map(([id, v]) => ({ id, label: v.label }))} />
        <Slider label="Mel filters" value={nFilters} set={setNFilters} min={4} max={26} step={1} color={P.highlight} />
      </Controls>

      <Row>
        <Col flex="1 1 350px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Triangular filters — narrow low, wide high
          </div>
          <Plot width={360} height={170} xMin={0} xMax={SR / 2} yMin={0} yMax={1.1}
            xLabel="frequency (Hz)" yLabel="filter weight" xTicks={4} yTicks={3} yFmt={f1}>
            {({ sx, sy }) => (
              <g>
                {bank.filters.map((f, i) => (
                  <Line key={i} pts={[[sx(f.loHz), sy(0)], [sx(f.centerHz), sy(1)], [sx(f.hiHz), sy(0)]]}
                    color={f.m === hottest.m ? P.good : i % 2 ? P.predict : P.derived}
                    width={f.m === hottest.m ? 2.4 : 1.2} opacity={f.m === hottest.m ? 1 : 0.6} />
                ))}
              </g>
            )}
          </Plot>
          <Caption>Green is the band with the most energy for this vowel.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Hz vs mel — the mapping
          </div>
          <Plot width={360} height={140} xMin={0} xMax={SR / 2} yMin={0} yMax={S.hzToMel(SR / 2)}
            xLabel="frequency (Hz)" yLabel="mel" xTicks={4} yTicks={3} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={Array.from({ length: 80 }, (_, i) => { const hz = (i / 79) * (SR / 2); return [sx(hz), sy(S.hzToMel(hz))]; })} color={P.highlight} width={2.2} />
                <Line pts={[[sx(0), sy(0)], [sx(SR / 2), sy(S.hzToMel(SR / 2))]]} color={P.faint} width={1} dash="4 3" />
              </g>
            )}
          </Plot>
          <Caption>Curved, not straight — that curvature is the whole point.</Caption>
        </Col>
        <Col flex="1 1 320px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Spectrum for "{vowel}" ({spec.bins.length} bins)
          </div>
          <Plot width={330} height={130} xMin={0} xMax={SR / 2} yMin={0} yMax={Math.max(...spec.bins.map((b) => b.mag)) * 1.1}
            xLabel="frequency (Hz)" yLabel="magnitude" xTicks={4} yTicks={3} yFmt={(v) => v.toFixed(2)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={spec.bins.map((b) => [sx(b.hz), sy(b.mag)])} color={P.class0} width={1.4} />
                {S.VOWELS[vowel].formants.map((fr, i) => (
                  <line key={i} x1={sx(fr)} y1={sy(0)} x2={sx(fr)} y2={sy(Math.max(...spec.bins.map((b) => b.mag)) * 1.1)}
                    stroke={P.highlight} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                ))}
              </g>
            )}
          </Plot>
          <Caption>Dashed lines are this vowel's published formants: {S.VOWELS[vowel].formants.join(", ")} Hz.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Compressed to {nFilters} mel energies
          </div>
          <Bars width={330} height={110} items={energies.map((e) => ({ label: f1(e.centerHz / 1000), value: e.energy }))}
            fmt={() => ""} showValues={false} colorFor={(it, i) => (energies[i].m === hottest.m ? P.good : P.predict)} />
          <Caption>x-axis is band centre in kHz.</Caption>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Then to 13 MFCCs
          </div>
          <Bars width={330} height={95} items={mfccs.coeffs.map((c, i) => ({ label: `c${i}`, value: c }))}
            fmt={() => ""} showValues={false}
            colorFor={(it) => (it.value >= 0 ? P.derived : P.class1)} />
          <Caption>{spec.bins.length} numbers → {nFilters} → 13. The low coefficients carry the vowel's identity.</Caption>
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. ALIASING
// ════════════════════════════════════════════════════════════════════════════

export function AliasingSim() {
  const [freq, setFreq] = useState(300);
  const [sampleRate, setSampleRate] = useState(1000);

  const sh = useMemo(() => S.sampleAndHold(freq, { sampleRate, duration: 0.02 }), [freq, sampleRate]);

  return (
    <Sim
      n={3}
      title="Aliasing and the Nyquist Limit"
      breadcrumb="Speech & audio · Why sample rate matters"
      hook={<>Sampling means measuring the wave only at fixed instants. If the wave wiggles faster than you look, you miss the wiggles — and what you record is not a degraded version of the truth. It is a <strong>different, lower tone entirely</strong>.</>}
      question={`A ${freq} Hz tone is sampled ${sampleRate} times per second. What do you actually record?`}
      readout={
        sh.aliased
          ? <>
            <strong style={{ color: P.bad }}>Aliased.</strong> The true tone is
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{freq} Hz</strong>, above the Nyquist limit of
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{sampleRate / 2} Hz</strong>. Your samples are indistinguishable from a
            {" "}<strong style={{ color: P.class1, fontFamily: "Consolas, monospace", fontSize: 15 }}>{f1(sh.apparent)} Hz</strong> tone —
            {" "}and once recorded, <strong>no amount of processing can tell them apart</strong>.
          </>
          : <>
            <strong style={{ color: P.good }}>Safe.</strong> {freq} Hz is below the Nyquist limit of
            {" "}<strong style={{ fontFamily: "Consolas, monospace" }}>{sampleRate / 2} Hz</strong>, so the samples uniquely determine the wave.
            {" "}You have <strong style={{ fontFamily: "Consolas, monospace" }}>{f1(sampleRate / freq)}</strong> samples per cycle
            {" "}(the theoretical minimum is 2).
          </>
      }
      notice={"Push the frequency just past half the sample rate and watch the recorded tone start coming back DOWN. Keep going and it folds around repeatedly. This is why every ADC has an analogue low-pass filter in front of it — you must remove the too-fast content before sampling, because afterwards it is permanently disguised as legitimate low-frequency signal.\n\nIt also explains sample-rate choices. Speech lives below 4 kHz, so 8 kHz telephony works. Music reaches 20 kHz, so CDs use 44.1 kHz — just over double."}
      formalName="The Nyquist–Shannon sampling theorem"
      formalNote="A signal is perfectly reconstructable only if sampled at more than twice its highest frequency. Above that, content at f appears at |f − k·fs| — it folds into the measurable band and becomes inseparable from real signal there."
    >
      <Controls>
        <Slider label="Tone frequency" value={freq} set={setFreq} min={50} max={1900} step={10} unit=" Hz" color={P.class0} />
        <Slider label="Sample rate" value={sampleRate} set={setSampleRate} min={400} max={2000} step={100} unit=" Hz" color={P.predict}
          hint={`Nyquist = ${sampleRate / 2} Hz`} />
      </Controls>

      <Row>
        <Col flex="1 1 400px">
          <Plot width={420} height={220} xMin={0} xMax={0.02} yMin={-1.3} yMax={1.3}
            xLabel="time (seconds)" yLabel="amplitude" xTicks={3} yTicks={3} yFmt={f1}
            xFmt={(v) => (v * 1000).toFixed(0) + "ms"}>
            {({ sx, sy }) => (
              <g>
                <line x1={sx(0)} y1={sy(0)} x2={sx(0.02)} y2={sy(0)} stroke={P.grid} strokeWidth="1" />
                {/* the true wave */}
                <Line pts={sh.trueWave.map((p) => [sx(p.t), sy(p.v)])} color={P.class0} width={1.4} opacity={0.85} />
                {/* the wave you would infer from the samples */}
                {sh.aliased && <Line pts={sh.apparentWave.map((p) => [sx(p.t), sy(-p.v)])} color={P.class1} width={2.2} dash="6 3" />}
                {/* the samples themselves */}
                {sh.samples.map((p, i) => (
                  <g key={i}>
                    <line x1={sx(p.t)} y1={sy(0)} x2={sx(p.t)} y2={sy(p.v)} stroke={P.highlight} strokeWidth="1" opacity="0.5" />
                    <Dot cx={sx(p.t)} cy={sy(p.v)} color={P.highlight} r={3.6} />
                  </g>
                ))}
              </g>
            )}
          </Plot>
          <Key items={[
            { color: P.class0, label: `true ${freq} Hz wave`, line: true },
            { color: P.highlight, label: "your samples" },
            ...(sh.aliased ? [{ color: P.class1, label: `what it looks like (${f1(sh.apparent)} Hz)`, dash: true }] : []),
          ]} />
          <Caption>
            {sh.aliased
              ? "Every amber dot sits on BOTH curves. From the samples alone, the two are identical."
              : "Enough samples per cycle that only one wave fits them."}
          </Caption>
        </Col>
        <Col flex="1 1 280px">
          <Stats>
            <Stat label="You recorded" value={`${f1(sh.apparent)} Hz`} color={sh.aliased ? P.bad : P.good} big
              hint={sh.aliased ? "wrong!" : "correct"} />
          </Stats>
          <Stats>
            <Stat label="True frequency" value={`${freq} Hz`} color={P.class0} />
            <Stat label="Nyquist limit" value={`${sampleRate / 2} Hz`} color={P.derived} />
            <Stat label="Samples/cycle" value={f2(sampleRate / freq)} color={sampleRate / freq < 2 ? P.bad : P.good} />
          </Stats>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recorded frequency vs true frequency
          </div>
          <Plot width={290} height={160} xMin={0} xMax={2000} yMin={0} yMax={sampleRate / 2 * 1.1}
            xLabel="true frequency (Hz)" yLabel="recorded (Hz)" xTicks={3} yTicks={3} yFmt={(v) => v.toFixed(0)}>
            {({ sx, sy }) => (
              <g>
                <Line pts={Array.from({ length: 100 }, (_, i) => {
                  const f = (i / 99) * 2000;
                  return [sx(f), sy(S.aliasedFrequency(f, sampleRate).apparent)];
                })} color={P.class1} width={2.2} />
                <line x1={sx(sampleRate / 2)} y1={sy(0)} x2={sx(sampleRate / 2)} y2={sy(sampleRate / 2 * 1.1)}
                  stroke={P.good} strokeWidth="1.4" strokeDasharray="4 3" />
                <Label x={sx(sampleRate / 2) + 5} y={sy(sampleRate / 2)} size={9.5} color={P.good}>Nyquist</Label>
                <Dot cx={sx(freq)} cy={sy(sh.apparent)} color={P.highlight} r={5} halo={P.highlight} />
              </g>
            )}
          </Plot>
          <Caption>Left of the green line it is a straight identity. Right of it, the signal folds back down.</Caption>
          {sh.aliased && (
            <Verdict tone="bad">
              Irreversible. Fix it by low-pass filtering BEFORE the converter, or by sampling above {freq * 2} Hz.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CTC ALIGNMENT
// ════════════════════════════════════════════════════════════════════════════

export function CtcSim() {
  const [path, setPath] = useState("__cc_aa__tt");
  const [target, setTarget] = useState("cat");
  const [T_, setT_] = useState(4);

  const collapsed = useMemo(() => S.ctcCollapse(path), [path]);
  const enumerated = useMemo(() => S.ctcPaths(target, T_), [target, T_]);
  const alphabet = ["_", ...new Set(target.split(""))];

  const PRESETS = ["__cc_aa__tt", "ccaatt", "c_a_t", "cccaaattt", "_c_a_t_"];

  return (
    <Sim
      n={4}
      title="CTC Alignment"
      breadcrumb="Speech & audio · Recognition without labels"
      hook={<>A one-second recording of someone saying "cat" is maybe 100 audio frames, but the answer is 3 letters. Nobody labelled which frames are the "c". Handing a model that alignment for every training clip is infeasible.</>}
      question="Can a model output one letter per frame and still produce the right 3-letter word?"
      readout={
        <>
          The frame sequence <strong style={{ fontFamily: "Consolas, monospace", color: P.class0 }}>{path}</strong> collapses to
          {" "}<strong style={{ color: collapsed.output === target ? P.good : P.highlight, fontFamily: "Consolas, monospace", fontSize: 16 }}>"{collapsed.output}"</strong>
          {" "}— repeats merged, blanks dropped.
          {" "}For a length-{T_} sequence there are
          {" "}<strong style={{ color: P.predict, fontFamily: "Consolas, monospace" }}>{enumerated.count}</strong> different frame paths
          {" "}(out of {enumerated.searchSpace} possible) that all collapse to "{target}".
          {" "}CTC sums the probability of <strong>every one of them</strong> instead of picking one.
        </>
      }
      notice={"The blank symbol is doing something subtle. Compare \"ccaatt\" with \"cc_c\": collapsing merges adjacent duplicates, so writing a genuine double letter requires a blank between them. Without blanks, \"hello\" could never be spelled.\n\nThe count matters too. Because many paths map to the same answer, the model does not need to commit to one alignment — it just needs the total probability across all valid ones to be high. That is what removes the need for frame-level labels."}
      formalName="Connectionist Temporal Classification"
      formalNote="Sums probability over all alignments collapsing to the target, computed efficiently by the forward-backward algorithm. Assumes outputs are conditionally independent given the input, so an external language model usually helps. RNN-T fixes that and is streaming-capable, which is why it dominates on-device ASR."
    >
      <Controls>
        <Choice label="Frame sequence" value={path} set={setPath} options={PRESETS.map((p) => ({ id: p, label: p }))} />
        <Choice label="Target word" value={target} set={(v) => { setTarget(v); setT_(Math.max(T_, v.length + 1)); }}
          options={[{ id: "cat", label: "cat" }, { id: "ab", label: "ab" }, { id: "aa", label: "aa (double letter)" }]} />
        <Slider label="Sequence length T" value={T_} set={setT_} min={2} max={6} step={1} color={P.predict} />
      </Controls>

      <Row>
        <Col flex="1 1 380px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Collapsing, frame by frame
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10 }}>
            {collapsed.steps.map((s, i) => {
              const emitted = s.action.startsWith("emit");
              return (
                <div key={i} style={{
                  flex: "0 0 auto", textAlign: "center", padding: "5px 7px", borderRadius: 6,
                  background: emitted ? `${P.good}1F` : P.panel,
                  border: `1px solid ${emitted ? P.good : P.grid}`, minWidth: 34,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.c === "_" ? P.faint : emitted ? P.good : P.dim, fontFamily: "Consolas, monospace" }}>
                    {s.c === "_" ? "␣" : s.c}
                  </div>
                  <div style={{ fontSize: 8, color: P.faint, marginTop: 2, lineHeight: 1.1 }}>
                    {emitted ? "keep" : s.action.includes("blank") ? "blank" : "dup"}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "10px 13px", background: `${P.good}12`, borderRadius: 8, border: `1px solid ${P.good}` }}>
            <span style={{ fontSize: 11, color: P.dim }}>Result: </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: P.good, fontFamily: "Consolas, monospace" }}>"{collapsed.output}"</span>
            <span style={{ fontSize: 11.5, color: P.dim, marginLeft: 8 }}>
              from {collapsed.steps.length} frames → {collapsed.output.length} characters
            </span>
          </div>
          <Note>
            Two rules only: drop a symbol if it repeats the previous one, and drop every blank. Everything else survives
            in order.
          </Note>
        </Col>
        <Col flex="1 1 300px">
          <div style={{ fontSize: 11, fontWeight: 700, color: P.dim, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            All length-{T_} paths that give "{target}"
          </div>
          {enumerated.count === 0 ? (
            <Verdict tone="bad">
              No length-{T_} path can produce "{target}". {target === "aa" && T_ < 3 ? "A double letter needs a blank between the two copies, so it needs at least 3 frames." : `The word is ${target.length} characters, so T must be at least ${target.length}${new Set(target).size < target.length ? " + 1 for the blank between repeats" : ""}.`}
            </Verdict>
          ) : (
            <>
              <div style={{ maxHeight: 190, overflowY: "auto" }}>
                {enumerated.paths.slice(0, 40).map((p) => (
                  <div key={p} style={{
                    fontSize: 12.5, fontFamily: "Consolas, monospace", padding: "3px 9px", marginBottom: 2, borderRadius: 5,
                    background: p === path ? `${P.highlight}22` : P.panel,
                    color: p === path ? P.highlight : P.text,
                    border: `1px solid ${p === path ? P.highlight : "transparent"}`,
                  }}>{p.replace(/_/g, "␣")}</div>
                ))}
              </div>
              {enumerated.count > 40 && <Caption>…and {enumerated.count - 40} more</Caption>}
            </>
          )}
          <Stats>
            <Stat label="Valid paths" value={enumerated.count} color={P.predict} big />
            <Stat label="Total possible" value={enumerated.searchSpace} color={P.faint} />
          </Stats>
          <Stats>
            <Stat label="Alphabet" value={alphabet.join(" ")} color={P.derived} hint="incl. blank" />
          </Stats>
          {enumerated.count > 1 && (
            <Verdict tone="good">
              {enumerated.count} alignments all give the right answer. The model never has to know which frames are the
              "{target[0]}" — it only has to make the total across all of them high.
            </Verdict>
          )}
        </Col>
      </Row>
    </Sim>
  );
}

export const SPEECH_SIMS = [
  { id: "spectrogram", label: "Waveform to Spectrogram", Comp: SpectrogramSim },
  { id: "mel", label: "The Mel Scale", Comp: MelSim },
  { id: "aliasing", label: "Aliasing & Nyquist", Comp: AliasingSim },
  { id: "ctc", label: "CTC Alignment", Comp: CtcSim },
];
