/* Breite der Engstelle am reinen Gewebe, mit hoher Schwelle, damit der
   Hof nicht mitzaehlt. node _ref2/pr-hals.mjs <t> <b> <label> <seite> */
import sharp from 'sharp';
const [fa, fb, label, seiteArg] = process.argv.slice(2);
const hole = async (f) => { const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true }); return { data, C: info.channels, W: info.width, H: info.height }; };
const A = await hole(fa);
const B = fb === '-' ? null : await hole(fb);
const W = A.W, H = A.H, SEITE = Number(seiteArg || W - 15);
const d = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const a = 0.299 * A.data[i * A.C] + 0.587 * A.data[i * A.C + 1] + 0.114 * A.data[i * A.C + 2];
  const b = B ? 0.299 * B.data[i * B.C] + 0.587 * B.data[i * B.C + 1] + 0.114 * B.data[i * B.C + 2] : 0;
  d[i] = Math.max(0, a - b);
}
const X0 = Math.round(SEITE * 0.45);
const BAND = 6;
const zeilen = [];
for (let y0 = 0; y0 + BAND <= H; y0 += BAND) {
  const col = new Float64Array(SEITE);
  for (let y = y0; y < y0 + BAND; y++) for (let x = X0; x < SEITE; x++) col[x] += d[y * W + x];
  for (let x = X0; x < SEITE; x++) col[x] /= BAND;
  const g = new Float64Array(SEITE);
  for (let x = X0; x < SEITE; x++) { let s = 0, n = 0; for (let k = -4; k <= 4; k++) { const j = x + k; if (j >= X0 && j < SEITE) { s += col[j]; n++; } } g[x] = s / n; }
  let l = -1, r = -1;
  for (let x = X0; x < SEITE; x++) if (g[x] > 18) { if (l < 0) l = x; r = x; }
  zeilen.push({ y: y0 + BAND / 2, l, r, br: l < 0 ? null : r - l + 1 });
}
let eng = null;
for (let i = 6; i < zeilen.length - 6; i++) {
  const z = zeilen[i]; if (z.br == null) continue;
  const o = zeilen.slice(i - 6, i).some((q) => q.br > 120);
  const u = zeilen.slice(i + 1, i + 7).some((q) => q.br > 120);
  if (!o || !u) continue;
  if (!eng || z.br < eng.br) eng = z;
}
console.log(`${label.padEnd(14)} ${eng ? `engstelle y=${eng.y} (${(100 * eng.y / H).toFixed(1)}% der Bildhoehe) breite=${eng.br}px (${(100 * eng.br / SEITE).toFixed(2)}% der Seitenbreite) achse=${((100 * (eng.l + eng.r)) / 2 / SEITE).toFixed(1)}%` : 'keine Engstelle gefunden'}`);
