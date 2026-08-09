import * as S from "../signal.js";

const ok = (n, c, e = "") => console.log(`${c ? "PASS" : "FAIL"}  ${n}${e ? "  " + e : ""}`);
const close = (a, b, t = 1e-6) => Math.abs(a - b) < t;

// ── FFT must agree with the direct DFT definition ───────────────────────────
{
  const sig = S.tone(500, { sampleRate: 4096, duration: 256 / 4096 });
  const a = S.dft(sig), b = S.fft(sig);
  let worst = 0;
  for (let k = 0; k < sig.length; k++) worst = Math.max(worst, Math.hypot(a.re[k] - b.re[k], a.im[k] - b.im[k]));
  ok("fft == dft", worst < 1e-8, `max complex err=${worst.toExponential(2)} over N=${sig.length}`);
}

// ── a pure tone must peak at its own frequency ───────────────────────────────
{
  const sr = 8000, N = 512;
  for (const f of [250, 500, 1000, 1875]) {
    const sig = S.tone(f, { sampleRate: sr, duration: N / sr });
    const sp = S.spectrum(sig, sr, { window: "hann" });
    ok(`${f} Hz tone peaks at ${f} Hz`, Math.abs(sp.peak.hz - f) <= sp.binWidth,
      `peak=${sp.peak.hz.toFixed(1)} Hz (bin width ${sp.binWidth.toFixed(1)} Hz)`);
  }
}

// ── two tones must give two peaks ───────────────────────────────────────────
{
  const sr = 8000, N = 1024;
  const sig = S.mix(S.tone(400, { sampleRate: sr, duration: N / sr }), S.tone(1200, { sampleRate: sr, duration: N / sr }));
  const sp = S.spectrum(sig, sr);
  const peaks = sp.bins.filter((b, i) => i > 0 && i < sp.bins.length - 1 && b.mag > sp.bins[i - 1].mag && b.mag > sp.bins[i + 1].mag && b.mag > sp.peak.mag * 0.3);
  ok("400+1200 Hz mix shows both peaks", peaks.length === 2 && Math.abs(peaks[0].hz - 400) < 20 && Math.abs(peaks[1].hz - 1200) < 20,
    `peaks at ${peaks.map((p) => p.hz.toFixed(0) + " Hz").join(", ")}`);
}

// ── Parseval-ish: DC signal → all energy in bin 0 ────────────────────────────
{
  const dc = Array(64).fill(1);
  const sp = S.spectrum(dc, 1000, { window: "rect" });
  ok("constant signal → all energy at 0 Hz", sp.peak.k === 0 && close(sp.bins[0].mag, 1, 1e-9),
    `bin0 mag=${sp.bins[0].mag.toFixed(6)}, next=${sp.bins[1].mag.toExponential(2)}`);
}

// ── window shapes ───────────────────────────────────────────────────────────
{
  ok("rect window is flat", S.applyWindow([1, 1, 1, 1], "rect").every((v) => v === 1));
  const h = S.applyWindow(Array(9).fill(1), "hann");
  ok("hann tapers to 0 at both ends", close(h[0], 0, 1e-12) && close(h[8], 0, 1e-12) && close(h[4], 1, 1e-12),
    `[${h.map((v) => v.toFixed(3)).join(", ")}]`);
  const hm = S.applyWindow(Array(9).fill(1), "hamming");
  ok("hamming does NOT reach 0", hm[0] > 0.05, `edge=${hm[0].toFixed(4)}`);
  // Leakage: a tone between bins leaks less with Hann than with rect
  const sr = 8000, N = 256;
  const off = S.tone(1000 + sr / N / 2, { sampleRate: sr, duration: N / sr });   // exactly between bins
  const leak = (w) => { const sp = S.spectrum(off, sr, { window: w }); const p = sp.peak; return sp.bins.filter((b) => Math.abs(b.hz - p.hz) > 4 * sp.binWidth).reduce((s, b) => s + b.mag, 0); };
  ok("hann leaks less than rect", leak("hann") < leak("rect"), `rect=${leak("rect").toExponential(2)} hann=${leak("hann").toExponential(2)}`);
  ok("blackman leaks least", leak("blackman") < leak("hann"), `hann=${leak("hann").toExponential(2)} blackman=${leak("blackman").toExponential(2)}`);
}

// ── the time/frequency tradeoff, as numbers ─────────────────────────────────
{
  const sr = 8000;
  const short = S.spectrum(S.tone(1000, { sampleRate: sr, duration: 128 / sr }), sr);
  const long = S.spectrum(S.tone(1000, { sampleRate: sr, duration: 1024 / sr }), sr);
  ok("longer window → finer frequency resolution", long.resolutionHz < short.resolutionHz,
    `128 samples: ${short.resolutionHz.toFixed(1)} Hz / ${short.durationMs.toFixed(1)} ms; 1024: ${long.resolutionHz.toFixed(1)} Hz / ${long.durationMs.toFixed(1)} ms`);
  ok("...at the cost of time resolution", long.durationMs > short.durationMs);
  ok("resolution == sampleRate / N", close(long.resolutionHz, sr / 1024, 1e-9));
}

// ── STFT on a chirp: peak frequency must RISE over time ──────────────────────
{
  const sr = 8000;
  const c = S.chirp(300, 3000, { sampleRate: sr, duration: 0.5 });
  const st = S.stft(c, sr, { frameSize: 256, hop: 128 });
  const peaks = st.frames.map((f) => f.bins.reduce((b, x) => (x.mag > b.mag ? x : b), f.bins[0]).hz);
  const firstQ = peaks.slice(0, 5), lastQ = peaks.slice(-5);
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  ok("chirp peak frequency rises across frames", avg(lastQ) > avg(firstQ) * 3,
    `start≈${avg(firstQ).toFixed(0)} Hz → end≈${avg(lastQ).toFixed(0)} Hz over ${st.nFrames} frames`);
  ok("stft reports overlap correctly", st.overlapPct === 50, `${st.overlapPct}%`);
  ok("stft frame count is right", st.nFrames === Math.floor((c.length - 256) / 128) + 1, `${st.nFrames}`);
  const monotone = peaks.filter((p, i) => i === 0 || p >= peaks[i - 1] - 200).length;
  ok("chirp peaks are near-monotonic", monotone / peaks.length > 0.9, `${monotone}/${peaks.length} frames non-decreasing`);
}

// ── mel scale ───────────────────────────────────────────────────────────────
{
  ok("hzToMel(0) = 0", close(S.hzToMel(0), 0, 1e-12));
  ok("mel round-trips", close(S.melToHz(S.hzToMel(1000)), 1000, 1e-6), S.melToHz(S.hzToMel(1000)).toFixed(6));
  ok("mel is monotonic", S.hzToMel(100) < S.hzToMel(1000) && S.hzToMel(1000) < S.hzToMel(4000));
  // The core perceptual claim: equal mel gaps are unequal in Hz, widening up top
  const gapLow = S.melToHz(500) - S.melToHz(400);
  const gapHigh = S.melToHz(2000) - S.melToHz(1900);
  ok("equal mel steps widen in Hz (log-like pitch)", gapHigh > gapLow * 3,
    `mel 400→500 spans ${gapLow.toFixed(0)} Hz; mel 1900→2000 spans ${gapHigh.toFixed(0)} Hz`);
  ok("1000 Hz ≈ 1000 mel by construction", Math.abs(S.hzToMel(1000) - 1000) < 40, S.hzToMel(1000).toFixed(1));
}

// ── mel filterbank ──────────────────────────────────────────────────────────
{
  const bank = S.melFilterbank({ nFilters: 10, nBins: 129, sampleRate: 8000 });
  ok("filterbank has requested filter count", bank.filters.length === 10);
  ok("triangles are ordered by centre frequency", bank.filters.every((f, i) => i === 0 || f.centerHz > bank.filters[i - 1].centerHz),
    bank.filters.map((f) => f.centerHz.toFixed(0)).join(" < "));
  ok("higher filters are WIDER in Hz", bank.filters[9].widthHz > bank.filters[0].widthHz * 2,
    `filter 1 spans ${bank.filters[0].widthHz.toFixed(0)} Hz, filter 10 spans ${bank.filters[9].widthHz.toFixed(0)} Hz`);
  ok("each triangle peaks at 1.0", bank.filters.every((f) => Math.abs(Math.max(...f.weights) - 1) < 1e-9));
  ok("weights are non-negative", bank.filters.every((f) => f.weights.every((w) => w >= 0)));
  // A 1000 Hz tone must light up the filter whose centre is nearest 1000 Hz
  const sr = 8000;
  const sp = S.spectrum(S.tone(1000, { sampleRate: sr, duration: 256 / sr }), sr);
  const energies = S.applyMel(sp.bins, S.melFilterbank({ nFilters: 10, nBins: sp.bins.length, sampleRate: sr }));
  const hottest = energies.reduce((a, b) => (b.energy > a.energy ? b : a));
  ok("1000 Hz tone lights the filter nearest 1000 Hz", Math.abs(hottest.centerHz - 1000) < 400,
    `hottest filter centre=${hottest.centerHz.toFixed(0)} Hz`);
}

// ── MFCC ────────────────────────────────────────────────────────────────────
{
  const sr = 8000;
  const m = S.mfcc(S.vowel("ee", { sampleRate: sr, duration: 256 / sr }), sr, { nFilters: 20, nCoeffs: 13 });
  ok("mfcc returns requested coefficient count", m.coeffs.length === 13);
  ok("mfcc coefficients are finite", m.coeffs.every((c) => Number.isFinite(c)), `c0..c3 = ${m.coeffs.slice(0, 4).map((c) => c.toFixed(3)).join(", ")}`);
  // Different vowels must give different MFCCs — that's the entire premise
  const a = S.mfcc(S.vowel("ee", { sampleRate: sr, duration: 256 / sr }), sr).coeffs;
  const b = S.mfcc(S.vowel("oo", { sampleRate: sr, duration: 256 / sr }), sr).coeffs;
  const dist = Math.hypot(...a.map((v, i) => v - b[i]));
  ok("different vowels → different MFCCs", dist > 1, `L2 distance ee vs oo = ${dist.toFixed(3)}`);
  const a2 = S.mfcc(S.vowel("ee", { sampleRate: sr, duration: 256 / sr }), sr).coeffs;
  ok("same vowel → identical MFCCs (deterministic)", Math.hypot(...a.map((v, i) => v - a2[i])) < 1e-12);
}
// DCT sanity: DCT of a constant vector puts everything in coefficient 0
{
  const d = S.dct([5, 5, 5, 5, 5, 5, 5, 5]);
  ok("dct of a constant → only c0", Math.abs(d[0]) > 1 && d.slice(1).every((v) => Math.abs(v) < 1e-9),
    `c0=${d[0].toFixed(4)}, rest max=${Math.max(...d.slice(1).map(Math.abs)).toExponential(1)}`);
}

// ── vowel formants really are where VOWELS says ─────────────────────────────
{
  const sr = 8000;
  const sig = S.vowel("ah", { sampleRate: sr, duration: 1024 / sr });
  const sp = S.spectrum(sig, sr);
  // F1 for "ah" is 730 Hz — there must be a strong local peak near it
  const near = sp.bins.filter((b) => Math.abs(b.hz - 730) < 120);
  const far = sp.bins.filter((b) => b.hz > 1300 && b.hz < 1700);
  const maxNear = Math.max(...near.map((b) => b.mag)), maxFar = Math.max(...far.map((b) => b.mag));
  ok("\"ah\" has energy at its F1 (730 Hz)", maxNear > maxFar,
    `mag near 730 Hz = ${maxNear.toExponential(2)} vs 1300–1700 Hz = ${maxFar.toExponential(2)}`);
}

// ── ALIASING: the Nyquist surprise ──────────────────────────────────────────
{
  ok("below Nyquist: no aliasing", !S.aliasedFrequency(300, 1000).aliased);
  const a = S.aliasedFrequency(700, 1000);
  ok("700 Hz at 1 kHz sample rate appears as 300 Hz", a.aliased && close(a.apparent, 300),
    `apparent=${a.apparent} Hz (Nyquist=${a.nyquist})`);
  const b = S.aliasedFrequency(1000, 1000);
  ok("sampling at exactly the signal frequency → 0 Hz (DC)", close(b.apparent, 0), `apparent=${b.apparent}`);
  ok("exactly Nyquist is the boundary", !S.aliasedFrequency(500, 1000).aliased);
  const sh = S.sampleAndHold(700, { sampleRate: 1000, duration: 0.02 });
  ok("sampleAndHold flags the alias and its apparent freq", sh.aliased && close(sh.apparent, 300),
    `true=${sh.freq} Hz → looks like ${sh.apparent} Hz`);
  // The samples of the true 700 Hz wave must coincide with a 300 Hz wave
  const worst = Math.max(...sh.samples.map((s, i) => Math.abs(s.v - (-Math.sin(2 * Math.PI * 300 * s.t)))));
  ok("samples of 700 Hz are indistinguishable from 300 Hz", worst < 1e-9,
    `max difference at sample points = ${worst.toExponential(2)}`);
}

// ── CTC collapse ────────────────────────────────────────────────────────────
{
  const c = S.ctcCollapse("__cc_aa__tt");
  ok("CTC collapses '__cc_aa__tt' → 'cat'", c.output === "cat", `got "${c.output}"`);
  ok("CTC keeps a doubled letter when separated by blank", S.ctcCollapse("cc_c").output === "cc",
    `"cc_c" → "${S.ctcCollapse("cc_c").output}"`);
  ok("CTC merges a doubled letter with NO blank", S.ctcCollapse("ccc").output === "c",
    `"ccc" → "${S.ctcCollapse("ccc").output}"`);
  ok("CTC step log covers every frame", c.steps.length === "__cc_aa__tt".length);
  const p = S.ctcPaths("ab", 4);
  ok("CTC path enumeration finds all length-4 paths for 'ab'", p.count > 1 && p.paths.every((x) => S.ctcCollapse(x).output === "ab"),
    `${p.count} valid paths out of ${p.searchSpace} total (alphabet ${p.alphabet.join("")})`);
  ok("CTC needs a blank to write 'aa'", S.ctcPaths("aa", 2).count === 0 && S.ctcPaths("aa", 3).count > 0,
    `T=2 → ${S.ctcPaths("aa", 2).count} paths, T=3 → ${S.ctcPaths("aa", 3).count} paths`);
}

// ── simple features ─────────────────────────────────────────────────────────
{
  ok("rms of a unit sine ≈ 0.707", close(S.rms(S.tone(100, { sampleRate: 8000, duration: 0.1 })), Math.SQRT1_2, 1e-3),
    S.rms(S.tone(100, { sampleRate: 8000, duration: 0.1 })).toFixed(6));
  const lowZ = S.zeroCrossingRate(S.tone(100, { sampleRate: 8000, duration: 0.1 }));
  const highZ = S.zeroCrossingRate(S.tone(3000, { sampleRate: 8000, duration: 0.1 }));
  ok("higher frequency → higher zero-crossing rate", highZ > lowZ * 5, `100 Hz: ${lowZ.toFixed(4)}, 3000 Hz: ${highZ.toFixed(4)}`);
  const noise = S.addNoise(Array(800).fill(0), 1, 3);
  ok("noise has a high zero-crossing rate (voiced/unvoiced cue)", S.zeroCrossingRate(noise) > 0.3,
    S.zeroCrossingRate(noise).toFixed(4));
  // Autocorrelation must recover the pitch of a synthetic vowel
  const sr = 8000;
  const v = S.vowel("ah", { sampleRate: sr, duration: 0.05, f0: 120 });
  const p = S.autocorrPitch(v, sr);
  ok("autocorrelation recovers f0 = 120 Hz", Math.abs(p.pitchHz - 120) < 8, `estimated ${p.pitchHz.toFixed(1)} Hz`);
}
