/**
 * Lesbarkeit der Schrift ueber dem Gewebe.
 *
 * Im Feld werden die hellsten Punkte als Schrift und die dunkelsten als
 * Grund genommen. Neben dem WCAG-Verhaeltnis wird die STREUUNG des
 * Grundes ausgewiesen, denn genau sie entscheidet, ob kleine Schrift vor
 * dem Punktraster noch ruhig steht.
 *
 *   node _ref2/lesbar.mjs <bild> <l>,<t>,<w>,<h> <label>
 */
import sharp from 'sharp';
const [file, cropArg, label] = process.argv.slice(2);
const [l, t, w, h] = cropArg.split(',').map(Number);
const { data, info } = await sharp(file)
  .extract({ left: l, top: t, width: w, height: h })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width, H = info.height;

const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

const px = [];
for (let i = 0; i < W * H; i++)
  px.push({ Y: relLum(data[i * C], data[i * C + 1], data[i * C + 2]), i });
px.sort((a, b) => a.Y - b.Y);

const schriftN = Math.max(1, Math.floor(px.length * 0.08));
const schrift = px.slice(-schriftN);
const grund = px.slice(0, Math.floor(px.length * 0.5));

const mean = (a) => a.reduce((s, p) => s + p.Y, 0) / a.length;
const Ys = mean(schrift), Yg = mean(grund);
const ratio = (Math.max(Ys, Yg) + 0.05) / (Math.min(Ys, Yg) + 0.05);

// Unruhe des Grundes: Streuung der Bildpunkt-Helligkeit in Stufen 0..255
let s = 0, n = 0;
for (const p of grund) { s += data[p.i * C] * 0.299 + data[p.i * C + 1] * 0.587 + data[p.i * C + 2] * 0.114; n++; }
const gm = s / n;
let v = 0;
for (const p of grund) {
  const L = data[p.i * C] * 0.299 + data[p.i * C + 1] * 0.587 + data[p.i * C + 2] * 0.114;
  v += (L - gm) ** 2;
}
const sd = Math.sqrt(v / n);

// Spannweite des Grundes ueber das ganze Feld (nicht nur die dunkle Haelfte)
let lo = 999, hi = -1;
for (let i = 0; i < W * H; i++) {
  const L = data[i * C] * 0.299 + data[i * C + 1] * 0.587 + data[i * C + 2] * 0.114;
  if (L < lo) lo = L; if (L > hi) hi = L;
}

console.log(`${label.padEnd(34)} WCAG=${ratio.toFixed(2)}:1  Grund=${gm.toFixed(1)} Streuung=${sd.toFixed(1)}`
  + `  Feldspanne=${lo.toFixed(0)}..${hi.toFixed(0)}`);
