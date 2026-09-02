/**
 * Die linke und rechte Kante des Gewebes ueber die Bildhoehe, schriftfest.
 *
 * Gemessen wird nicht die Helligkeit, sondern die HOCHFREQUENZENERGIE. Das
 * Punktraster traegt sie ueber die ganze Flaeche, ein glatter Schriftzug
 * dagegen nur an seinen Kanten. Ausgewertet wird je Zelle von acht mal acht
 * Bildpunkten der mittlere Betrag der Abweichung vom Mittel der Zelle; eine
 * Zelle gilt als Gewebe, sobald dieser Wert eine Schranke ueberschreitet und
 * die Zelle nicht zugleich sehr hell ist, denn helle glatte Flaechen sind
 * immer Schrift.
 *
 *   node _ref2/silmess.mjs <bild> [x0 y0 x1 y1] [schranke]
 */
import sharp from 'sharp';

const datei = process.argv[2];
const x0 = Number(process.argv[3] ?? 0);
const y0 = Number(process.argv[4] ?? 0);
const x1 = Number(process.argv[5] ?? 0);
const y1 = Number(process.argv[6] ?? 0);
const SCHRANKE = Number(process.argv[7] ?? 6);

const img = sharp(datei).greyscale();
const meta = await img.metadata();
const X0 = x0, Y0 = y0;
const X1 = x1 || meta.width, Y1 = y1 || meta.height;
const { data, info } = await img
  .extract({ left: X0, top: Y0, width: X1 - X0, height: Y1 - Y0 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;

const C = 8;
const zx = Math.floor(W / C), zy = Math.floor(H / C);
const energie = new Float32Array(zx * zy);
const mittel = new Float32Array(zx * zy);
for (let cy = 0; cy < zy; cy += 1) {
  for (let cx = 0; cx < zx; cx += 1) {
    let s = 0;
    for (let j = 0; j < C; j += 1) for (let i = 0; i < C; i += 1) s += data[(cy * C + j) * W + cx * C + i];
    const m = s / (C * C);
    let e = 0;
    for (let j = 0; j < C; j += 1) for (let i = 0; i < C; i += 1) e += Math.abs(data[(cy * C + j) * W + cx * C + i] - m);
    energie[cy * zx + cx] = e / (C * C);
    mittel[cy * zx + cx] = m;
  }
}

const zeilen = [];
for (let cy = 0; cy < zy; cy += 1) {
  let lo = -1, hi = -1;
  for (let cx = 0; cx < zx; cx += 1) {
    const e = energie[cy * zx + cx];
    const m = mittel[cy * zx + cx];
    if (e > SCHRANKE && m < 130) { if (lo < 0) lo = cx; hi = cx; }
  }
  if (lo < 0) { zeilen.push(null); continue; }
  zeilen.push({
    y: Y0 + cy * C + C / 2,
    links: X0 + lo * C,
    rechts: X0 + (hi + 1) * C,
    linksP: ((X0 + lo * C) / meta.width) * 100,
    rechtsP: ((X0 + (hi + 1) * C) / meta.width) * 100,
  });
}

const schritt = Math.max(1, Math.round(zy / 26));
for (let k = 0; k < zeilen.length; k += schritt) {
  const z = zeilen[k];
  if (!z) { console.log(`y ${Y0 + k * C + 4}  -`); continue; }
  console.log(
    `y ${String(z.y).padStart(5)}  (${((z.y - Y0) / (Y1 - Y0) * 100).toFixed(1).padStart(5)}% des Fensters)  links ${z.linksP.toFixed(1).padStart(5)}%  rechts ${z.rechtsP.toFixed(1).padStart(5)}%  breite ${(z.rechtsP - z.linksP).toFixed(1)}%`,
  );
}
// engste Stelle
let eng = null;
for (const z of zeilen) if (z && (!eng || z.rechts - z.links < eng.rechts - eng.links)) eng = z;
if (eng) console.log(`\nengste Stelle bei y ${eng.y} (${(((eng.y - Y0) / (Y1 - Y0)) * 100).toFixed(1)}% des Fensters), Breite ${(eng.rechtsP - eng.linksP).toFixed(2)}% der Bildbreite, Mitte ${(((eng.linksP + eng.rechtsP) / 2)).toFixed(1)}%`);
