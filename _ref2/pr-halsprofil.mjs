/* Breitenprofil um die Engstelle. node _ref2/pr-halsprofil.mjs <t> <b|-> <y0> <y1> <seite> <label> */
import sharp from 'sharp';
const [fa, fb, y0a, y1a, seiteArg, label] = process.argv.slice(2);
const hole = async (f) => { const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true }); return { data, C: info.channels, W: info.width, H: info.height }; };
const A = await hole(fa); const B = fb === '-' ? null : await hole(fb);
const W = A.W, H = A.H, SEITE = Number(seiteArg);
const X0 = Math.round(SEITE * 0.45);
const d = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const a = 0.299 * A.data[i * A.C] + 0.587 * A.data[i * A.C + 1] + 0.114 * A.data[i * A.C + 2];
  const b = B ? 0.299 * B.data[i * B.C] + 0.587 * B.data[i * B.C + 1] + 0.114 * B.data[i * B.C + 2] : 0;
  d[i] = Math.max(0, a - b);
}
/* Ohne Grundbild wird der Sockel aus dem linken Feld genommen. */
let sockel = 0;
if (!B) { const v = []; for (let y = 60; y < H; y += 3) for (let x = 20; x < 300; x += 3) v.push(d[y * W + x]); v.sort((p, q) => p - q); sockel = v[Math.floor(0.5 * v.length)]; }
const BAND = 6; const aus = [];
for (let y = Number(y0a); y + BAND <= Number(y1a); y += BAND) {
  const col = new Float64Array(SEITE);
  for (let yy = y; yy < y + BAND; yy++) for (let x = X0; x < SEITE; x++) col[x] += Math.max(0, d[yy * W + x] - sockel);
  for (let x = X0; x < SEITE; x++) col[x] /= BAND;
  const g = new Float64Array(SEITE);
  for (let x = X0; x < SEITE; x++) { let s = 0, n = 0; for (let k = -4; k <= 4; k++) { const j = x + k; if (j >= X0 && j < SEITE) { s += col[j]; n++; } } g[x] = s / n; }
  let l = -1, r = -1; for (let x = X0; x < SEITE; x++) if (g[x] > 18) { if (l < 0) l = x; r = x; }
  aus.push(`${y + 3}:${l < 0 ? '-' : (100 * (r - l + 1) / SEITE).toFixed(1)}`);
}
console.log(`${label.padEnd(12)} sockel=${sockel.toFixed(1)} Breite in Prozent der Seite je Zeile: ${aus.join(' ')}`);
