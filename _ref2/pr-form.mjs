/**
 * Silhouette und Bedeckung eines Bildes, Zeilenband fuer Zeilenband.
 *
 *   node _ref2/pr-form.mjs <bild.png> [label] [seitenbreite]
 *
 * Gemessen wird an der HELLIGKEIT gegen den Sockel des Bildes, und zwar
 * erst ab 40 Prozent der Seitenbreite, weil links davon die Textspalte
 * steht. Die linke Gewebekante ist die erste Spalte, in der das
 * geglaettete Zeilenmittel den Sockel um zehn Stufen uebersteigt.
 */
import sharp from 'sharp';

const [file, label, seiteArg] = process.argv.slice(2);
const meta = await sharp(file).metadata();
const SEITE = Number(seiteArg || meta.width - 15);
const X0 = Math.round(SEITE * 0.30);
const W = SEITE - X0;
const H = meta.height;

const { data, info } = await sharp(file)
  .extract({ left: X0, top: 0, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const sortiert = Float32Array.from(lum).sort();
const sockel = sortiert[Math.floor(0.05 * sortiert.length)];
const schwelle = sockel + 10;

const BAND = 25;
const zeilen = [];
for (let y0 = 0; y0 + BAND <= H; y0 += BAND) {
  const col = new Float64Array(W);
  for (let y = y0; y < y0 + BAND; y++) for (let x = 0; x < W; x++) col[x] += lum[y * W + x];
  for (let x = 0; x < W; x++) col[x] /= BAND;
  /* Glaettung ueber 21 Bildpunkte, damit einzelne Rasterluecken nicht
     durchschlagen. */
  const g = new Float64Array(W);
  for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let k = -10; k <= 10; k++) { const j = x + k; if (j >= 0 && j < W) { s += col[j]; n++; } }
    g[x] = s / n;
  }
  let l = -1, r = -1, an = 0;
  for (let x = 0; x < W; x++) if (g[x] > schwelle) { if (l < 0) l = x; r = x; an++; }
  let hell = 0;
  for (let y = y0; y < y0 + BAND; y++) for (let x = 0; x < W; x++)
    if (lum[y * W + x] > sockel + 8) hell++;
  zeilen.push({
    y: y0 + Math.round(BAND / 2),
    links: l < 0 ? null : (100 * (X0 + l)) / SEITE,
    rechts: r < 0 ? null : (100 * (X0 + r)) / SEITE,
    bed: (100 * hell) / (W * BAND),
  });
}

const f = (v, k = 1) => (v == null ? ' -- ' : v.toFixed(k));
console.log(`${(label || file).padEnd(16)} sockel=${sockel.toFixed(1)} seite=${SEITE}`);
console.log('  y    linksProz rechtsProz bedProz');
for (const z of zeilen)
  console.log(`  ${String(z.y).padStart(4)}  ${f(z.links).padStart(6)}    ${f(z.rechts).padStart(6)}   ${f(z.bed).padStart(5)}`);

/* Kleinste linke Kante ueber alle Zeilen, also der weiteste Ausgriff nach
   links. */
const kanten = zeilen.filter((z) => z.links != null && z.bed > 4).map((z) => z.links);
const bed = zeilen.map((z) => z.bed);
console.log(`  weitester Ausgriff nach links = ${f(Math.min(...kanten))} Prozent der Seitenbreite`);
console.log(`  Bedeckung gesamt = ${(bed.reduce((a, b) => a + b, 0) / bed.length).toFixed(1)} Prozent`);

/* Dunkle Wanne: ein Zeilenband, dessen Bedeckung deutlich unter beiden
   Nachbarn ueber je fuenf Baendern liegt. */
let wanne = null;
for (let i = 5; i < zeilen.length - 5; i++) {
  const o = Math.max(...bed.slice(i - 5, i));
  const u = Math.max(...bed.slice(i + 1, i + 6));
  const tief = Math.min(o, u) - bed[i];
  if (bed[i] < 25 && tief > 12 && (!wanne || tief > wanne.tief))
    wanne = { y: zeilen[i].y, bed: bed[i], oben: o, unten: u, tief };
}
console.log('  Wanne: ' + (wanne ? JSON.stringify(wanne) : 'keine'));
