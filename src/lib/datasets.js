// Sample datasets for the labs.
//
// Deliberately named in plain English — "Hours Studied" and "Exam Score", never
// x and y. Beat 2 of the teaching spec: pin the concept to something concrete
// before any notation appears.
//
// All generated data is seeded, so the numbers on screen are stable.

import { rng, gauss } from "./mlmath.js";

// ─── 1D REGRESSION ──────────────────────────────────────────────────────────

// Hand-authored so the numbers are memorable and the fitted line is checkable.
export const STUDY_HOURS = {
  id: "study",
  xLabel: "Hours Studied", yLabel: "Exam Score",
  xUnit: "h", yUnit: "%",
  question: "If someone studies for 6 hours, what score should we expect?",
  points: [
    { x: 1, y: 42 }, { x: 2, y: 48 }, { x: 3, y: 55 }, { x: 4, y: 57 },
    { x: 5, y: 66 }, { x: 6, y: 69 }, { x: 7, y: 76 }, { x: 8, y: 79 },
    { x: 9, y: 85 }, { x: 10, y: 92 },
  ],
  note: "Ten students. Each dot is one person: how long they studied, and what they scored.",
};

export const HOUSE_PRICE = {
  id: "house",
  xLabel: "Size", yLabel: "Price",
  xUnit: "100 sq ft", yUnit: "$1000s",
  question: "A 1,500 sq ft house comes on the market. What is it worth?",
  points: [
    { x: 6, y: 145 }, { x: 8, y: 170 }, { x: 9, y: 210 }, { x: 11, y: 225 },
    { x: 12, y: 260 }, { x: 14, y: 268 }, { x: 15, y: 310 }, { x: 17, y: 330 },
    { x: 19, y: 340 }, { x: 20, y: 395 },
  ],
  note: "Ten recent sales. Notice the spread — two houses of the same size do not sell for the same price.",
};

// A curve, so polynomial degree and overfitting have something to bite on.
export const TEMPERATURE_DAY = (() => {
  const r = rng(21);
  const points = Array.from({ length: 14 }, (_, i) => {
    const hour = 6 + i;
    const trueTemp = 12 + 13 * Math.sin(((hour - 6) / 16) * Math.PI);
    return { x: hour, y: Math.round((trueTemp + gauss(r) * 1.4) * 10) / 10 };
  });
  return {
    id: "temp",
    xLabel: "Hour of Day", yLabel: "Temperature", xUnit: "h", yUnit: "°C",
    question: "Temperature rises then falls. A straight line cannot capture that — how curvy should the fit be?",
    points,
    note: "Readings from 6am to 7pm. The underlying shape is a smooth arc; the wobble is measurement noise.",
    trueFn: (h) => 12 + 13 * Math.sin(((h - 6) / 16) * Math.PI),
  };
})();

export const REGRESSION_SETS = [STUDY_HOURS, HOUSE_PRICE, TEMPERATURE_DAY];

// ─── 2D CLASSIFICATION ──────────────────────────────────────────────────────
// Two classes throughout, and the colour convention never changes:
// class 0 = blue, class 1 = red.

function labelled(points, labels, meta) {
  return { ...meta, X: points, y: labels, n: points.length };
}

export const EMAIL_SPAM = (() => {
  const r = rng(31);
  const X = [], y = [];
  // Real emails: few links, few capitals. Spam: many links, many capitals.
  for (let i = 0; i < 30; i++) {
    X.push([Math.max(0, 1.5 + gauss(r) * 1.1), Math.max(0, 8 + gauss(r) * 4)]);
    y.push(0);
  }
  for (let i = 0; i < 24; i++) {
    X.push([Math.max(0, 7 + gauss(r) * 1.6), Math.max(0, 34 + gauss(r) * 8)]);
    y.push(1);
  }
  return labelled(X, y, {
    id: "spam",
    xLabel: "Links in Email", yLabel: "% Capital Letters",
    class0: "Real email", class1: "Spam",
    question: "A new email arrives with 5 links and 22% capitals. Spam or not?",
    note: "Two clean clusters with a gap. Almost any method separates this — which is why it is the right place to start.",
    separable: true,
  });
})();

export const LOAN_DEFAULT = (() => {
  const r = rng(37);
  const X = [], y = [];
  // Deliberately overlapping: no boundary can be perfect. That is the point.
  for (let i = 0; i < 34; i++) { X.push([620 + gauss(r) * 55, 28 + gauss(r) * 9]); y.push(0); }
  for (let i = 0; i < 26; i++) { X.push([560 + gauss(r) * 55, 41 + gauss(r) * 9]); y.push(1); }
  return labelled(X, y, {
    id: "loan",
    xLabel: "Credit Score", yLabel: "Debt-to-Income", xUnit: "", yUnit: "%",
    class0: "Repaid", class1: "Defaulted",
    question: "These two groups overlap. Where do you draw the line, and what does each mistake cost?",
    note: "Real data looks like this. Some borrowers with good scores default anyway — no model can fix that.",
    separable: false,
  });
})();

export const CIRCLES = (() => {
  const r = rng(41);
  const X = [], y = [];
  for (let i = 0; i < 34; i++) {
    const a = r() * 2 * Math.PI, rad = 0.9 + gauss(r) * 0.28;
    X.push([rad * Math.cos(a), rad * Math.sin(a)]); y.push(0);
  }
  for (let i = 0; i < 34; i++) {
    const a = r() * 2 * Math.PI, rad = 3.1 + gauss(r) * 0.32;
    X.push([rad * Math.cos(a), rad * Math.sin(a)]); y.push(1);
  }
  return labelled(X, y, {
    id: "circles",
    xLabel: "Sensor A", yLabel: "Sensor B",
    class0: "Normal", class1: "Faulty",
    question: "One group sits inside a ring of the other. No straight line can split them — now what?",
    note: "A ring inside a ring. This is the standard example where linear methods hit a wall.",
    separable: false, needsNonlinear: true,
  });
})();

export const XOR_QUADRANTS = (() => {
  const r = rng(43);
  const X = [], y = [];
  for (let q = 0; q < 4; q++) {
    const cx = q % 2 === 0 ? -1.6 : 1.6, cy = q < 2 ? 1.6 : -1.6;
    for (let i = 0; i < 16; i++) {
      X.push([cx + gauss(r) * 0.55, cy + gauss(r) * 0.55]);
      y.push(cx * cy > 0 ? 1 : 0);
    }
  }
  return labelled(X, y, {
    id: "xor",
    xLabel: "Feature A", yLabel: "Feature B",
    class0: "Class blue", class1: "Class red",
    question: "Diagonal corners share a class. Neither feature alone tells you anything — can a model still learn it?",
    note: "The XOR pattern. Each feature on its own is 50/50 useless; only the combination carries the answer.",
    separable: false, needsNonlinear: true,
  });
})();

export const SPIRAL = (() => {
  const r = rng(47);
  const X = [], y = [];
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * 3.2 + gauss(r) * 0.06;
      const a = t * 2.2 + c * Math.PI;
      X.push([t * Math.cos(a) + gauss(r) * 0.1, t * Math.sin(a) + gauss(r) * 0.1]);
      y.push(c);
    }
  }
  return labelled(X, y, {
    id: "spiral",
    xLabel: "Feature A", yLabel: "Feature B",
    class0: "Class blue", class1: "Class red",
    question: "Two interlocking spirals. How much model capacity does this actually need?",
    note: "The hardest of these shapes. A small network underfits it badly — useful for seeing capacity matter.",
    separable: false, needsNonlinear: true,
  });
})();

export const MOONS = (() => {
  const r = rng(53);
  const X = [], y = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI;
    X.push([Math.cos(a) * 2 + gauss(r) * 0.18, Math.sin(a) * 2 + gauss(r) * 0.18]); y.push(0);
  }
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI;
    X.push([1 + Math.cos(a) * 2 + gauss(r) * 0.18, 0.6 - Math.sin(a) * 2 + gauss(r) * 0.18]); y.push(1);
  }
  return labelled(X, y, {
    id: "moons",
    xLabel: "Feature A", yLabel: "Feature B",
    class0: "Class blue", class1: "Class red",
    question: "Two interleaved crescents. A curve separates them cleanly — a line does not.",
    note: "Mildly non-linear. A good middle case: RBF handles it easily, a line gets most but not all.",
    separable: false, needsNonlinear: true,
  });
})();

export const CLASSIFICATION_SETS = [EMAIL_SPAM, LOAN_DEFAULT, MOONS, CIRCLES, XOR_QUADRANTS, SPIRAL];

// ─── CLUSTERING (unlabelled — that is the point) ────────────────────────────

export const CUSTOMER_SEGMENTS = (() => {
  const r = rng(59);
  const centres = [[22, 15], [55, 70], [80, 30]];
  const X = [];
  centres.forEach((c) => {
    for (let i = 0; i < 22; i++) X.push([c[0] + gauss(r) * 8, c[1] + gauss(r) * 8]);
  });
  return {
    id: "customers", X,
    xLabel: "Annual Spend", yLabel: "Visits per Year",
    xUnit: "$100s", yUnit: "",
    question: "Nobody labelled these shoppers. Are there natural groups, and how many?",
    note: "66 shoppers, no labels at all. You can probably see the groups — the algorithm has to find them without being told.",
    trueK: 3,
  };
})();

export const UNEVEN_BLOBS = (() => {
  const r = rng(61);
  const X = [];
  for (let i = 0; i < 40; i++) X.push([20 + gauss(r) * 5, 20 + gauss(r) * 5]);
  for (let i = 0; i < 14; i++) X.push([70 + gauss(r) * 16, 60 + gauss(r) * 16]);
  return {
    id: "uneven", X,
    xLabel: "Feature A", yLabel: "Feature B",
    question: "One tight group, one loose group. k-means assumes they are the same size — what breaks?",
    note: "A dense cluster of 40 and a sparse cluster of 14. This is where k-means' equal-variance assumption shows.",
    trueK: 2,
  };
})();

export const CLUSTER_SETS = [CUSTOMER_SEGMENTS, UNEVEN_BLOBS];

// ─── CORRELATED CLOUD (for PCA) ─────────────────────────────────────────────

export const HEIGHT_WEIGHT = (() => {
  const r = rng(67);
  const X = Array.from({ length: 90 }, () => {
    const base = gauss(r);
    return [170 + base * 9 + gauss(r) * 1.6, 68 + base * 11 + gauss(r) * 2.4];
  });
  return {
    id: "heightweight", X,
    xLabel: "Height", yLabel: "Weight", xUnit: "cm", yUnit: "kg",
    question: "Height and weight move together. If you could keep only ONE number per person, what should it be?",
    note: "90 people. The cloud leans — that lean is the information, and it is not along either original axis.",
  };
})();

// ─── TINY IMAGES (for convolution) ──────────────────────────────────────────
// Hand-authored 8×8 grids, values 0–9, so every convolution output can be
// checked by hand against the pixels shown on screen.

export const IMAGES = {
  verticalEdge: {
    label: "Vertical edge",
    px: [
      [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9],
      [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9, 9],
    ],
    note: "Dark left half, bright right half. The simplest thing an edge detector should find.",
  },
  horizontalEdge: {
    label: "Horizontal edge",
    px: [
      [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
      [9, 9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9, 9, 9],
    ],
    note: "The same edge rotated. Watch how Sobel X goes blind while Sobel Y lights up.",
  },
  corner: {
    label: "Corner",
    px: [
      [0, 0, 0, 0, 0, 0, 0, 0], [0, 9, 9, 9, 9, 9, 0, 0], [0, 9, 9, 9, 9, 9, 0, 0], [0, 9, 9, 9, 9, 9, 0, 0],
      [0, 9, 9, 9, 9, 9, 0, 0], [0, 9, 9, 9, 9, 9, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    note: "A bright square. Its four corners respond to both edge detectors at once.",
  },
  digitSeven: {
    label: "Digit 7",
    px: [
      [0, 0, 0, 0, 0, 0, 0, 0], [0, 9, 9, 9, 9, 9, 9, 0], [0, 0, 0, 0, 0, 9, 9, 0], [0, 0, 0, 0, 9, 9, 0, 0],
      [0, 0, 0, 9, 9, 0, 0, 0], [0, 0, 9, 9, 0, 0, 0, 0], [0, 0, 9, 9, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    note: "A hand-drawn 7. A top horizontal stroke plus a diagonal — two different features a CNN would learn to spot.",
  },
  digitZero: {
    label: "Digit 0",
    px: [
      [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 9, 9, 9, 9, 0, 0], [0, 9, 9, 0, 0, 9, 9, 0], [0, 9, 9, 0, 0, 9, 9, 0],
      [0, 9, 9, 0, 0, 9, 9, 0], [0, 9, 9, 0, 0, 9, 9, 0], [0, 0, 9, 9, 9, 9, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    note: "A 0. All four edge orientations are present, which is why a single kernel is never enough.",
  },
  texture: {
    label: "Checkerboard",
    px: [
      [9, 0, 9, 0, 9, 0, 9, 0], [0, 9, 0, 9, 0, 9, 0, 9], [9, 0, 9, 0, 9, 0, 9, 0], [0, 9, 0, 9, 0, 9, 0, 9],
      [9, 0, 9, 0, 9, 0, 9, 0], [0, 9, 0, 9, 0, 9, 0, 9], [9, 0, 9, 0, 9, 0, 9, 0], [0, 9, 0, 9, 0, 9, 0, 9],
    ],
    note: "Maximum-frequency texture. A blur kernel nearly erases it — a good demonstration of what smoothing costs.",
  },
  gradient: {
    label: "Smooth ramp",
    px: Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => Math.round((c / 7) * 9))),
    note: "A gentle left-to-right ramp. There is no edge here, but a derivative filter still reports a constant slope.",
  },
};

// ─── MOVING OBJECT (for video / motion) ─────────────────────────────────────

export function movingSquare(frame, { size = 12, box = 3, speed = 1 } = {}) {
  const px = Array.from({ length: size }, () => new Array(size).fill(0));
  const cx = 2 + Math.round(frame * speed) % (size - box - 3);
  const cy = Math.round(size / 2 - box / 2 + Math.sin(frame * 0.6) * 2);
  for (let r = 0; r < box; r++) {
    for (let c = 0; c < box; c++) {
      const y = cy + r, x = cx + c;
      if (y >= 0 && y < size && x >= 0 && x < size) px[y][x] = 9;
    }
  }
  return { px, cx, cy };
}

// ─── DETECTION BOXES (for IoU / NMS) ────────────────────────────────────────

export const DETECTION_BOXES = {
  groundTruth: { x: 30, y: 30, w: 90, h: 70, label: "Ground truth" },
  predictions: [
    { x: 34, y: 33, w: 88, h: 68, score: 0.94, label: "A" },
    { x: 40, y: 38, w: 85, h: 66, score: 0.88, label: "B" },
    { x: 28, y: 26, w: 95, h: 76, score: 0.81, label: "C" },
    { x: 140, y: 60, w: 70, h: 60, score: 0.76, label: "D" },
    { x: 146, y: 66, w: 66, h: 56, score: 0.63, label: "E" },
  ],
  note: "One detector, five boxes. Three pile onto the same object and two onto another — NMS has to thin them out.",
};

// ─── TEXT CORPORA ───────────────────────────────────────────────────────────

export const SUPPORT_DOCS = [
  "Refunds are available within 30 days of purchase. Contact support with your order number to start a refund.",
  "Standard shipping to Europe takes 5 to 7 business days. Express shipping arrives in 2 days and costs extra.",
  "Passwords must be at least 12 characters long and contain one number and one symbol. Reset links expire after 1 hour.",
  "The free tier includes 100 API calls per day. Paid plans raise this to 100000 calls per day with priority support.",
  "To cancel a subscription, open account settings and choose cancel. Access continues until the end of the billing period.",
];

export const TINY_CORPUS =
  "the cat sat on the mat the cat ate the fish the dog sat on the log "
  + "the dog chased the cat the fish swam in the pond the mat was warm";

export const BPE_CORPUS = "low low low low low lower lower lowest newest newest newest widest widest";

// ─── HAND-BUILT WORD VECTORS ────────────────────────────────────────────────
// Two interpretable axes so analogy arithmetic can be checked by eye:
// axis 0 = how royal, axis 1 = gender (+1 male, −1 female).

export const WORD_VECTORS = {
  king: [1.0, 1.0], queen: [1.0, -1.0],
  prince: [0.75, 1.0], princess: [0.75, -1.0],
  man: [0.0, 1.0], woman: [0.0, -1.0],
  boy: [-0.1, 0.9], girl: [-0.1, -0.9],
  apple: [-1.0, 0.05], bread: [-1.0, -0.05],
};

export const VECTOR_AXES = { 0: "How royal →", 1: "Gender (up = male)" };

// ─── NEXT-TOKEN DISTRIBUTION (for decoding) ─────────────────────────────────
// A plausible distribution after "The weather today is really ___".

export const NEXT_TOKEN = {
  prompt: "The weather today is really ",
  candidates: [
    { token: "nice", p: 0.31 }, { token: "cold", p: 0.22 }, { token: "hot", p: 0.16 },
    { token: "bad", p: 0.10 }, { token: "weird", p: 0.07 }, { token: "humid", p: 0.05 },
    { token: "lovely", p: 0.04 }, { token: "grim", p: 0.03 }, { token: "purple", p: 0.015 },
    { token: "table", p: 0.005 },
  ],
  note: "Ten candidate next words with the probabilities a model assigned. \"purple\" and \"table\" are the ones you want cut off.",
};

// ─── RATINGS MATRIX ─────────────────────────────────────────────────────────
// Small enough to read at a glance; null = not yet rated.

export const MOVIE_RATINGS = {
  users: ["Ana", "Ben", "Cara", "Dan", "Eve"],
  items: ["Action Epic", "Space Sequel", "Rom-Com", "Costume Drama"],
  R: [
    [5, 4, 1, null],
    [4, 5, 1, 2],
    [1, 2, 5, 5],
    [null, 1, 4, 5],
    [5, 5, 2, 1],
  ],
  question: "Ana never rated Costume Drama. Should we recommend it to her?",
  note: "Five people, four films, and some blanks. Every recommender is really just a way of guessing the blanks.",
};

// ─── SEARCH RESULTS (for ranking metrics) ───────────────────────────────────

export const SEARCH_RESULTS = {
  query: "best running shoes for flat feet",
  results: [
    { title: "Top 10 stability shoes for flat feet", relevance: 3 },
    { title: "Running shoe buying guide", relevance: 2 },
    { title: "Best shoes for overpronation", relevance: 3 },
    { title: "Cheap sneakers on sale", relevance: 0 },
    { title: "How to treat plantar fasciitis", relevance: 1 },
    { title: "Trail running shoe review", relevance: 1 },
    { title: "Sock recommendations", relevance: 0 },
    { title: "Orthotic insoles explained", relevance: 2 },
  ],
  scale: "0 = irrelevant, 1 = slightly, 2 = relevant, 3 = exactly what they wanted",
  note: "Eight search results with a human's relevance grade for each. Drag them into a different order and watch which metrics notice.",
};

// ─── IMBALANCED SCORES (for metrics/threshold) ──────────────────────────────

export const FRAUD_SCORES = (() => {
  const r = rng(71);
  const rows = [];
  for (let i = 0; i < 190; i++) rows.push({ y: 0, score: Math.min(0.99, Math.max(0.01, 0.18 + gauss(r) * 0.13)) });
  for (let i = 0; i < 10; i++) rows.push({ y: 1, score: Math.min(0.99, Math.max(0.01, 0.68 + gauss(r) * 0.17)) });
  return {
    id: "fraud", rows,
    positiveLabel: "Fraud", negativeLabel: "Legitimate",
    question: "10 fraudulent transactions hide among 190 legitimate ones. A model that always says \"legitimate\" is 95% accurate — so why is it useless?",
    note: "200 transactions, 5% fraud. This is the imbalance that makes accuracy a liar.",
    prevalence: 0.05,
  };
})();

// A tiny, fully readable version where every cell can be counted by hand.
export const TINY_SCORES = {
  id: "tiny",
  rows: [
    { y: 1, score: 0.95 }, { y: 1, score: 0.80 }, { y: 1, score: 0.60 }, { y: 1, score: 0.30 },
    { y: 0, score: 0.70 }, { y: 0, score: 0.40 }, { y: 0, score: 0.35 },
    { y: 0, score: 0.20 }, { y: 0, score: 0.10 }, { y: 0, score: 0.05 },
  ],
  positiveLabel: "Has disease", negativeLabel: "Healthy",
  question: "Ten patients, four of them ill. Move the cut-off and watch who gets caught and who slips through.",
  note: "Small enough to count by hand: 4 positives, 6 negatives. At a 0.5 cut-off you should get TP=3, FP=1, FN=1, TN=5.",
};
