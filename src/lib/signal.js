// Audio/DSP core. Real DFT, real mel filterbank, real aliasing — so the
// spectrogram a lab draws is computed from the waveform above it, and moving a
// slider genuinely recomputes the transform.

import { rng, gauss, zeros, zeros2 } from "./mlmath.js";

// ─── SIGNAL SYNTHESIS ───────────────────────────────────────────────────────
// Named in plain English: "a 440 Hz tone", not "sinusoid with ω = 2765 rad/s".

export function tone(freq, { sampleRate = 8000, duration = 0.25, amplitude = 1, phase = 0 } = {}) {
  const n = Math.round(sampleRate * duration);
  return Array.from({ length: n }, (_, i) => amplitude * Math.sin(2 * Math.PI * freq * (i / sampleRate) + phase));
}

export function mix(...signals) {
  const n = Math.max(...signals.map((s) => s.length));
  return Array.from({ length: n }, (_, i) => signals.reduce((s, sig) => s + (sig[i] || 0), 0));
}

// A chirp sweeps frequency over time — the clearest way to see that a
// spectrogram has a time axis at all.
export function chirp(f0, f1, { sampleRate = 8000, duration = 0.5 } = {}) {
  const n = Math.round(sampleRate * duration);
  return Array.from({ length: n }, (_, i) => {
    const t = i / sampleRate;
    const f = f0 + ((f1 - f0) * t) / duration;
    return Math.sin(2 * Math.PI * (f0 * t + ((f1 - f0) * t * t) / (2 * duration)));
  });
}

// Vowels are a buzzing source shaped by resonances (formants). These formant
// values are the standard published averages for adult male speech.
export const VOWELS = {
  ee: { label: "\"ee\" as in beet", formants: [270, 2290, 3010] },
  ah: { label: "\"ah\" as in father", formants: [730, 1090, 2440] },
  oo: { label: "\"oo\" as in boot", formants: [300, 870, 2240] },
  eh: { label: "\"eh\" as in bet", formants: [530, 1840, 2480] },
};

export function vowel(which, { sampleRate = 8000, duration = 0.25, f0 = 120 } = {}) {
  const { formants } = VOWELS[which];
  const n = Math.round(sampleRate * duration);
  const out = zeros(n);
  // Buzzy glottal source: a harmonic stack with 1/k rolloff.
  for (let k = 1; k * f0 < sampleRate / 2; k++) {
    const f = k * f0;
    // Boost harmonics landing near a formant — that's what makes a vowel a vowel.
    let gain = 1 / k;
    for (const F of formants) gain += 0.9 / (1 + ((f - F) / 90) ** 2);
    for (let i = 0; i < n; i++) out[i] += (gain * Math.sin(2 * Math.PI * f * (i / sampleRate))) / 6;
  }
  return out;
}

export function addNoise(signal, level, seed = 4) {
  const r = rng(seed);
  return signal.map((v) => v + gauss(r) * level);
}

// ─── WINDOWS ────────────────────────────────────────────────────────────────

export const WINDOWS = {
  rect: { label: "Rectangular (none)", fn: () => 1, note: "No taper. Cheapest, but the abrupt edges create spectral leakage — energy smears across neighbouring bins." },
  hann: { label: "Hann", fn: (i, N) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1))), note: "The default. Tapers to zero at both ends, so the analysed chunk looks periodic and leakage drops sharply." },
  hamming: { label: "Hamming", fn: (i, N) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)), note: "Similar to Hann but does not quite reach zero. Slightly narrower main lobe, slightly worse far-off leakage." },
  blackman: { label: "Blackman", fn: (i, N) => 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (N - 1)), note: "Strongest leakage suppression, widest main lobe — best when you need to see a weak tone next to a loud one." },
};

export const applyWindow = (frame, which = "hann") => {
  const w = WINDOWS[which] || WINDOWS.hann;
  return frame.map((v, i) => v * w.fn(i, frame.length));
};

// ─── DFT ────────────────────────────────────────────────────────────────────
// Direct O(N²) transform. N is small in these labs (≤1024), so clarity wins;
// the definition is visible rather than buried in a butterfly recursion.

export function dft(frame) {
  const N = frame.length;
  const re = zeros(N), im = zeros(N);
  for (let k = 0; k < N; k++) {
    let sr = 0, si = 0;
    for (let n = 0; n < N; n++) {
      const a = (-2 * Math.PI * k * n) / N;
      sr += frame[n] * Math.cos(a);
      si += frame[n] * Math.sin(a);
    }
    re[k] = sr; im[k] = si;
  }
  return { re, im };
}

// Iterative radix-2 FFT for when N is a power of two — used so the STFT of a
// few hundred frames stays interactive.
export function fft(frame) {
  const N = frame.length;
  if ((N & (N - 1)) !== 0) return dft(frame);
  const re = frame.slice(), im = zeros(N);
  // bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  return { re, im };
}

// Magnitude spectrum over the useful half (0 … Nyquist), with real Hz labels.
export function spectrum(frame, sampleRate, { window = "hann", useFft = true } = {}) {
  const w = applyWindow(frame, window);
  const { re, im } = useFft ? fft(w) : dft(w);
  const N = frame.length;
  const half = Math.floor(N / 2);
  const bins = [];
  for (let k = 0; k <= half; k++) {
    const mag = Math.hypot(re[k], im[k]) / N;
    bins.push({
      k, hz: (k * sampleRate) / N, mag,
      db: 20 * Math.log10(Math.max(1e-10, mag)),
      phase: Math.atan2(im[k], re[k]),
    });
  }
  return {
    bins,
    binWidth: sampleRate / N,
    nyquist: sampleRate / 2,
    // Frequency resolution is set by WINDOW LENGTH, not by sample rate. This is
    // the time/frequency tradeoff, as a number.
    resolutionHz: sampleRate / N,
    durationMs: (N / sampleRate) * 1000,
    peak: bins.reduce((b, c) => (c.mag > b.mag ? c : b), bins[0]),
  };
}

// ─── STFT / SPECTROGRAM ─────────────────────────────────────────────────────

export function stft(signal, sampleRate, { frameSize = 256, hop = 128, window = "hann" } = {}) {
  const frames = [];
  for (let start = 0; start + frameSize <= signal.length; start += hop) {
    const frame = signal.slice(start, start + frameSize);
    const s = spectrum(frame, sampleRate, { window });
    frames.push({ tSec: start / sampleRate, bins: s.bins });
  }
  const maxDb = Math.max(...frames.flatMap((f) => f.bins.map((b) => b.db)));
  return {
    frames, frameSize, hop, sampleRate, maxDb,
    nFrames: frames.length,
    nBins: frames[0]?.bins.length || 0,
    timeResolutionMs: (hop / sampleRate) * 1000,
    freqResolutionHz: sampleRate / frameSize,
    overlapPct: Math.round((1 - hop / frameSize) * 100),
  };
}

// ─── MEL SCALE ──────────────────────────────────────────────────────────────
// Pitch perception is roughly logarithmic: the gap 100→200 Hz sounds like the
// gap 1000→2000 Hz, not like 1000→1100 Hz. Mel encodes that.

export const hzToMel = (hz) => 2595 * Math.log10(1 + hz / 700);
export const melToHz = (mel) => 700 * (10 ** (mel / 2595) - 1);

export function melFilterbank({ nFilters = 12, nBins = 129, sampleRate = 8000, fMin = 0, fMax = null } = {}) {
  const top = fMax || sampleRate / 2;
  const melMin = hzToMel(fMin), melMax = hzToMel(top);
  // nFilters + 2 equally spaced points in MEL space become unequal in Hz.
  const points = Array.from({ length: nFilters + 2 }, (_, i) => melToHz(melMin + ((melMax - melMin) * i) / (nFilters + 1)));
  const binOf = (hz) => Math.round((hz * 2 * (nBins - 1)) / sampleRate);
  const filters = [];
  for (let m = 1; m <= nFilters; m++) {
    const lo = binOf(points[m - 1]), mid = binOf(points[m]), hi = binOf(points[m + 1]);
    const weights = zeros(nBins);
    for (let k = lo; k <= hi && k < nBins; k++) {
      if (k < mid && mid > lo) weights[k] = (k - lo) / (mid - lo);
      else if (k >= mid && hi > mid) weights[k] = (hi - k) / (hi - mid);
      else if (k === mid) weights[k] = 1;
    }
    filters.push({ m, loHz: points[m - 1], centerHz: points[m], hiHz: points[m + 1], lo, mid, hi, weights,
      widthHz: points[m + 1] - points[m - 1] });
  }
  return { filters, points, nFilters, sampleRate };
}

export function applyMel(bins, bank) {
  return bank.filters.map((f) => {
    let e = 0;
    for (let k = 0; k < f.weights.length; k++) if (f.weights[k] > 0) e += f.weights[k] * (bins[k]?.mag || 0) ** 2;
    return { m: f.m, centerHz: f.centerHz, energy: e, db: 10 * Math.log10(Math.max(1e-12, e)) };
  });
}

// DCT-II of the log-mel energies. Decorrelates the bands; the low coefficients
// carry the spectral envelope, which is what identifies a phoneme.
export function dct(x, nKeep = null) {
  const N = x.length;
  const out = [];
  const K = nKeep || N;
  for (let k = 0; k < K; k++) {
    let s = 0;
    for (let n = 0; n < N; n++) s += x[n] * Math.cos((Math.PI * k * (n + 0.5)) / N);
    out.push(s * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)));
  }
  return out;
}

export function mfcc(frame, sampleRate, { nFilters = 20, nCoeffs = 13, window = "hann" } = {}) {
  const s = spectrum(frame, sampleRate, { window });
  const bank = melFilterbank({ nFilters, nBins: s.bins.length, sampleRate });
  const mel = applyMel(s.bins, bank);
  const logMel = mel.map((m) => Math.log(Math.max(1e-12, m.energy)));
  return { spectrum: s, bank, mel, logMel, coeffs: dct(logMel, nCoeffs) };
}

// ─── SAMPLING & ALIASING ────────────────────────────────────────────────────
// The Nyquist demo: a tone above half the sample rate does not just degrade,
// it comes back as a DIFFERENT, lower tone. That surprise is the lesson.

export function aliasedFrequency(freq, sampleRate) {
  const nyq = sampleRate / 2;
  let f = freq % sampleRate;
  if (f > nyq) f = sampleRate - f;
  return { apparent: f, aliased: freq > nyq, nyquist: nyq, foldedFrom: freq };
}

export function sampleAndHold(freq, { sampleRate = 1000, duration = 0.02, dense = 40 } = {}) {
  const nSamples = Math.round(sampleRate * duration);
  const samples = Array.from({ length: nSamples }, (_, i) => ({ t: i / sampleRate, v: Math.sin(2 * Math.PI * freq * (i / sampleRate)) }));
  const trueWave = Array.from({ length: nSamples * dense }, (_, i) => {
    const t = i / (sampleRate * dense);
    return { t, v: Math.sin(2 * Math.PI * freq * t) };
  });
  const { apparent, aliased } = aliasedFrequency(freq, sampleRate);
  const apparentWave = Array.from({ length: nSamples * dense }, (_, i) => {
    const t = i / (sampleRate * dense);
    return { t, v: Math.sin(2 * Math.PI * apparent * t) };
  });
  return { samples, trueWave, apparentWave, apparent, aliased, sampleRate, freq };
}

// ─── CTC ALIGNMENT ──────────────────────────────────────────────────────────
// Audio frames vastly outnumber output characters and nobody labels the
// alignment. CTC's answer: allow a blank, then sum over every frame-path that
// collapses to the target. This shows the collapse and counts the paths.

export const BLANK = "_";

export function ctcCollapse(path) {
  const steps = [];
  let out = "";
  let prev = null;
  for (const c of path) {
    if (c === prev) { steps.push({ c, action: "drop (repeat)" }); }
    else if (c === BLANK) { steps.push({ c, action: "drop (blank)" }); }
    else { out += c; steps.push({ c, action: `emit "${c}"` }); }
    prev = c;
  }
  return { output: out, steps };
}

// Enumerate every length-T path over the alphabet that collapses to target.
// Exponential, so keep T small — but seeing the count is the point.
export function ctcPaths(target, T, alphabet = null) {
  const alpha = alphabet || [BLANK, ...new Set(target.split(""))];
  const found = [];
  const walk = (path) => {
    if (path.length === T) {
      if (ctcCollapse(path).output === target) found.push(path.join(""));
      return;
    }
    for (const c of alpha) walk([...path, c]);
  };
  if (alpha.length ** T <= 200000) walk([]);
  return { paths: found, count: found.length, searchSpace: alpha.length ** T, alphabet: alpha };
}

// ─── SIMPLE FEATURE HELPERS ─────────────────────────────────────────────────

export const rms = (sig) => Math.sqrt(sig.reduce((s, v) => s + v * v, 0) / sig.length);

export function zeroCrossingRate(sig) {
  let c = 0;
  for (let i = 1; i < sig.length; i++) if ((sig[i - 1] < 0) !== (sig[i] < 0)) c++;
  return c / (sig.length - 1);
}

// Cheap pitch estimate by autocorrelation — shows why voiced sounds have a
// periodic peak and unvoiced ones do not.
export function autocorrPitch(sig, sampleRate, { minHz = 60, maxHz = 500 } = {}) {
  const minLag = Math.floor(sampleRate / maxHz), maxLag = Math.floor(sampleRate / minHz);
  const curve = [];
  let best = { lag: 0, r: -Infinity };
  for (let lag = minLag; lag <= Math.min(maxLag, sig.length - 1); lag++) {
    let r = 0;
    for (let i = 0; i + lag < sig.length; i++) r += sig[i] * sig[i + lag];
    // Divide by the FULL length, not by (length − lag). The unbiased-looking
    // version inflates long lags, so the peak at twice the true period wins and
    // the estimate lands an octave low. This taper is why real pitch trackers
    // use the biased estimator.
    r /= sig.length;
    curve.push({ lag, hz: sampleRate / lag, r });
    if (r > best.r) best = { lag, r, hz: sampleRate / lag };
  }
  // Octave guard: if a lag near half the winner scores almost as well, the true
  // period is the shorter one — the longer lag is just a multiple of it.
  const halfLag = Math.round(best.lag / 2);
  const halfPeak = curve.find((c) => Math.abs(c.lag - halfLag) <= 1);
  const corrected = halfPeak && halfPeak.r > best.r * 0.85 ? halfPeak : best;
  return { curve, best: corrected, rawBest: best, pitchHz: corrected.hz, octaveCorrected: corrected !== best };
}
