/**
 * Wo steht die Taille, in eigenen Bildpunkten?
 *
 * taille.mjs rechnet in Prozent eines uebergebenen Fensters und sucht nur
 * zwischen 15 und 85 Prozent. Fuer die Frage, wie weit die Struktur beim
 * Scrollen gewandert ist, braucht es dagegen die Bildzeile selbst und den
 * ganzen Bildbereich, denn die Taille laeuft ausdruecklich oben aus dem
 * Bild heraus.
 *
 * Gemessen wird an der HELLIGKEIT und nicht an einer Hochfrequenzmaske,
 * genau wie in taille.mjs, und erst ab 45 Prozent der Bildbreite, weil
 * links davon die Textspalte steht.
 *
 *   node _ref2/taillenlage.mjs <bild.png> [label]
 */
import sharp from 'sharp';

const [file, label] = process.argv.slice(2);
const meta = await sharp(file).metadata();
const X0 = Math.round(meta.width * 0.45);
const W = meta.width - X0;
const H = meta.height;

const { data, info } = await sharp(file)
  .extract({ left: X0, top: 0, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const sortiert = Float32Array.from(lum).sort();
const grund = sortiert[Math.floor(0.05 * sortiert.length)];
const schwelle = grund + 10;

/* Zeilenbaender von acht Bildpunkten, damit einzelne Rasterluecken nicht
   durchschlagen. */
const BAND = 8;
const zeilen = [];
for (let y0 = 0; y0 + BAND <= H; y0 += BAND) {
  const col = new Float64Array(W);
  for (let y = y0; y < y0 + BAND; y++) for (let x = 0; x < W; x++) col[x] += lum[y * W + x];
  for (let x = 0; x < W; x++) col[x] /= BAND;
  const g = new Float64Array(W);
  for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let k = -10; k <= 10; k++) { const j = x + k; if (j >= 0 && j < W) { s += col[j]; n++; } }
    g[x] = s / n;
  }
  let l = -1, r = -1, an = 0;
  for (let x = 0; x < W; x++) if (g[x] > schwelle) { if (l < 0) l = x; r = x; an++; }
  zeilen.push({
    y: y0 + BAND / 2,
    links: l < 0 ? null : X0 + l,
    rechts: r < 0 ? null : X0 + r,
    breite: l < 0 ? null : r - l + 1,
    bed: (an / W) * 100,
  });
}

/* Die Taille ist die schmalste Stelle, an der ueber und unter ihr noch
   Gewebe steht. Ohne diese Bedingung findet die Suche das erloschene
   Bandende. */
let eng = null;
for (let i = 3; i < zeilen.length - 3; i++) {
  const z = zeilen[i];
  if (z.breite == null || z.bed < 3) continue;
  const oben = zeilen.slice(Math.max(0, i - 6), i).some((q) => q.bed > 12);
  const unten = zeilen.slice(i + 1, i + 7).some((q) => q.bed > 12);
  if (!oben || !unten) continue;
  if (!eng || z.breite < eng.breite) eng = z;
}

const f1 = (v) => (v == null ? '-' : (typeof v === 'number' ? v.toFixed(1) : v));
console.log(`${(label || file).padEnd(22)} grund=${f1(grund)}`
  + (eng
    ? ` | taille y=${eng.y} breite=${eng.breite}px links=${eng.links} bed=${f1(eng.bed)}%`
    : ' | KEINE Taille im Bild'));
console.log('  bed ' + zeilen.filter((z, i) => i % 4 === 0)
  .map((z) => `${z.y}:${z.bed.toFixed(0)}`).join(' '));
