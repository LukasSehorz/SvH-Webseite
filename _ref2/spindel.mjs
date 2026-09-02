/**
 * Die SPINDEL, also der Winkel der Achse DICHT AN DER TAILLE.
 *
 *   node _ref2/spindel.mjs <bild> [halbband]
 *
 * _ref2/final/achse.mjs misst den Lichtschwerpunkt des ganzen unteren
 * Lappens und trifft damit ueberwiegend die Oeffnungsrichtung des
 * Faechers. Fuer die Frage, ob die Sanduhr aufrecht auf dem Boden steht,
 * ist das die falsche Groesze; entscheidend ist die Richtung der Achse
 * dort, wo die Flaeche eng ist.
 *
 * Gemessen wird deshalb die Mitte zwischen linker und rechter Kante des
 * Gewebes, und zwar nur in einem schmalen Band ober- und unterhalb der
 * Engstelle. Ueber diese Mitten laeuft eine Ausgleichsgerade, und ihr
 * Winkel gegen die Senkrechte ist die gesuchte Zahl. Ein positiver Winkel
 * heiszt, dass das untere Ende nach RECHTS steht.
 */
import { grau, fenster, hochpass, stdabw } from './mess/lib.mjs';

const F = process.argv[2];
const BAND = Number(process.argv[3] || 130);
const X0 = Number(process.argv[4] || 840);
const X1 = Number(process.argv[5] || 1420);

const { g, b, h } = await grau(F);
const hp = hochpass(g, b, h, 7);
let rausch = Infinity;
for (let y = 40; y + 120 <= h; y += 60) {
  for (let x = 40; x + 120 <= b; x += 60) {
    const s = stdabw(fenster(hp, b, h, x, y, 120, 120));
    if (s < rausch) rausch = s;
  }
}
const schranke = 4 * rausch;

// Die Engstelle suchen, mit denselben Zeilengrenzen wie _ref2/engstelle.mjs.
const kante = (y) => {
  let l = -1, r = -1, n = 0;
  for (let x = X0; x < X1; x++) {
    if (hp[y * b + x] > schranke) { n++; if (l < 0) l = x; r = x; }
  }
  return n >= 20 ? { l, r, w: r - l, m: (l + r) / 2 } : null;
};
let beste = Infinity, by = -1;
for (let y = 130; y < 810; y++) {
  const k = kante(y);
  if (k && k.w < beste) { beste = k.w; by = y; }
}

const punkte = [];
for (let y = Math.max(6, by - BAND); y <= Math.min(h - 7, by + BAND); y++) {
  const k = kante(y);
  if (k) punkte.push([y, k.m]);
}
let sy = 0, sx = 0;
for (const [y, x] of punkte) { sy += y; sx += x; }
const my = sy / punkte.length, mx = sx / punkte.length;
let szz = 0, szx = 0;
for (const [y, x] of punkte) { szz += (y - my) ** 2; szx += (y - my) * (x - mx); }
const st = szx / szz;
let rest = 0;
for (const [y, x] of punkte) rest += (x - (mx + st * (y - my))) ** 2;

console.log(
  `${F.padEnd(30)} taille zeile ${String(by).padStart(3)} (${((100 * by) / h).toFixed(1)}%)   ` +
  `breite ${String(beste).padStart(3)}   band ${String(punkte.length).padStart(3)} zeilen   ` +
  `SPINDELWINKEL ${((Math.atan(st) * 180) / Math.PI).toFixed(2).padStart(7)} grad gegen die senkrechte   ` +
  `reststreuung ${Math.sqrt(rest / punkte.length).toFixed(1)} px`,
);
