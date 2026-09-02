/**
 * Breite der Engstelle, gemessen an der HELLIGKEIT statt an einer
 * Hochfrequenzmaske.
 *
 * kante.mjs und hals.mjs suchen das Gewebe ueber die Zahl der
 * Nulldurchgaenge in einer Zelle von acht mal acht Bildpunkten. Das trug,
 * solange die Bahnen des Gewebes 4,8 Bildpunkte auseinanderstanden, denn
 * dann kreuzte jede Zeile einer Zelle mehrfach. Seit die Bahnen 17
 * Bildpunkte auseinanderstehen, enthaelt eine Zelle hoechstens eine Bahn,
 * die Zahl der Kreuzungen faellt unter die Schwelle und der untere Lappen
 * verschwindet aus der Messung. Genau das ist passiert: kante.mjs meldete
 * fuer die linke Gewebekante unten gar keinen Wert mehr.
 *
 * Hier wird stattdessen geglaettet und gegen den Grund geschwellt. Das
 * gilt fuer beide Bilder gleich und haengt nicht an der Rasterdichte.
 *
 * Die Schrift steht in beiden Bildern LINKS des Gewebes, deshalb beginnt
 * das Messfeld bei 45 Prozent der Seitenbreite.
 *
 *   node _ref2/taille.mjs <bild> <t> <h> <label>
 */
import sharp from 'sharp';

const [file, ty, hy, label] = process.argv.slice(2);
const T = Number(ty), H = Number(hy);
const meta = await sharp(file).metadata();
const PAGE = meta.width === 1100 ? 1085 : meta.width;
const X0 = Math.round(PAGE * 0.45);
const W = PAGE - X0;

const { data, info } = await sharp(file)
  .extract({ left: X0, top: T, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

/* Der Grund ist das 5. Perzentil des ganzen Feldes. */
const sortiert = Float32Array.from(lum).sort();
const grund = sortiert[Math.floor(0.05 * sortiert.length)];
const schwelle = grund + 10;

const BANDS = 40;
const zeilen = [];
for (let bi = 0; bi < BANDS; bi++) {
  const y0 = Math.floor((bi / BANDS) * H), y1 = Math.max(y0 + 1, Math.floor(((bi + 1) / BANDS) * H));
  const col = new Float64Array(W);
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) col[x] += lum[y * W + x];
  for (let x = 0; x < W; x++) col[x] /= (y1 - y0);
  /* Glaetten, damit die Luecken zwischen den Bahnen nicht als Rand zaehlen. */
  const g = new Float64Array(W);
  for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let k = -10; k <= 10; k++) { const j = x + k; if (j >= 0 && j < W) { s += col[j]; n++; } }
    g[x] = s / n;
  }
  let l = -1, r = -1, an = 0;
  for (let x = 0; x < W; x++) if (g[x] > schwelle) { if (l < 0) l = x; r = x; an++; }
  zeilen.push({
    y: ((y0 + y1) / 2 / H) * 100,
    links: l < 0 ? null : ((X0 + l) / PAGE) * 100,
    rechts: r < 0 ? null : ((X0 + r) / PAGE) * 100,
    breite: l < 0 ? null : ((r - l + 1) / PAGE) * 100,
    bed: (an / W) * 100,
  });
}

const mitBreite = zeilen.filter((z) => z.breite != null && z.y > 15 && z.y < 85);
let eng = mitBreite[0];
for (const z of mitBreite) if (z.breite < eng.breite) eng = z;

const f1 = (v) => (v == null ? '-' : v.toFixed(1));
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const im = (lo, hi, k) => med(zeilen.filter((z) => z.y >= lo && z.y < hi && z[k] != null).map((z) => z[k]));

console.log(`${(label || file).padEnd(18)} grund=${f1(grund)}`
  + ` | engstelle y=${f1(eng.y)}% breite=${f1(eng.breite)}% bed=${f1(eng.bed)}%`
  + ` | linksOben=${f1(im(5, 25, 'links'))} linksUnten=${f1(im(75, 95, 'links'))}`
  + ` rechtsUnten=${f1(im(75, 95, 'rechts'))}`
  + ` | bedOben=${f1(im(5, 25, 'bed'))} bedUnten=${f1(im(75, 95, 'bed'))}`);
console.log('  bedZeilen ' + zeilen.filter((z, i) => i % 2 === 1)
  .map((z) => `${z.y.toFixed(0)}:${z.bed.toFixed(0)}`).join(' '));
