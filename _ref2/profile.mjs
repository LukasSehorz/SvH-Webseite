/**
 * Spalten-/Zeilenprofil und Farbanteile eines Bildes.
 *   node _ref2/profile.mjs <bild> [--crop=l,t,w,h] [--bins=20]
 */
import sharp from 'sharp';

const file = process.argv[2];
const flags = Object.fromEntries(
  process.argv.slice(3).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
let img = sharp(file);
if (flags.crop) {
  const [l, t, w, h] = flags.crop.split(',').map(Number);
  img = img.extract({ left: l, top: t, width: w, height: h });
}
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const bins = parseInt(flags.bins || '20', 10);

// Grundpegel = 5. Perzentil der Luminanz
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
  lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
}
const sorted = Float32Array.from(lum).sort();
const floor = sorted[Math.floor(sorted.length * 0.10)];
const p999 = sorted[Math.floor(sorted.length * 0.999)];
const maxv = sorted[sorted.length - 1];

// Spaltenprofil (Mittelwert ueber Grundpegel)
const col = [];
for (let bx = 0; bx < bins; bx++) {
  const x0 = Math.floor((bx * W) / bins), x1 = Math.floor(((bx + 1) * W) / bins);
  let s = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) { s += Math.max(0, lum[y * W + x] - floor); n++; }
  col.push(+(s / n).toFixed(2));
}
const row = [];
for (let by = 0; by < bins; by++) {
  const y0 = Math.floor((by * H) / bins), y1 = Math.floor(((by + 1) * H) / bins);
  let s = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) { s += Math.max(0, lum[y * W + x] - floor); n++; }
  row.push(+(s / n).toFixed(2));
}

// Farbton-Histogramm ueber Punkte deutlich ueber Grund
const hues = new Array(12).fill(0);
let lit = 0, white = 0;
for (let i = 0; i < W * H; i++) {
  if (lum[i] < floor + 22) continue;
  lit++;
  const r = data[i * C] / 255, g = data[i * C + 1] / 255, b = data[i * C + 2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 0.08) { white++; continue; }
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = ((h * 60) + 360) % 360;
  hues[Math.floor(h / 30)]++;
}

// Bedeckung wie in metric2: Anteil ueber Grundpegel + 8
const cov = (() => {
  const f5 = sorted[Math.floor(sorted.length * 0.05)];
  let n = 0; for (let i = 0; i < lum.length; i++) if (lum[i] > f5 + 8) n++;
  return +((n / lum.length) * 100).toFixed(1);
})();

console.log(JSON.stringify({
  size: `${W}x${H}`, coverage: cov,
  floor: +floor.toFixed(1), p999: +p999.toFixed(0), max: +maxv.toFixed(0),
  litPct: +((lit / (W * H)) * 100).toFixed(1),
  whiteOfLit: +((white / (lit || 1)) * 100).toFixed(1),
  colProfile: col,
  rowProfile: row,
  hue30: hues.map((v) => +((v / (lit || 1)) * 100).toFixed(1)),
}, null, 1));
