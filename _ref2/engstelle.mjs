/**
 * Die ENGSTELLE, also die Bildzeile mit der schmalsten Gewebebreite.
 *
 *   node _ref2/engstelle.mjs <ordner|bild> [x0] [x1] [y0] [y1]
 *
 * Diese Messung haengt an der FORM und nicht an der Helligkeit. Sie ist
 * deshalb der richtige Weg, um die Lage der Kreuzung zwischen zwei
 * Staenden zu vergleichen, die verschieden hell gerendert sind; die Suche
 * nach dem hellsten Knoten verschiebt sich in einem solchen Vergleich mit
 * dem Lichthaushalt und nicht mit der Geometrie.
 *
 * Die Zeilengrenzen lassen den oberen und den unteren Saum der Maske
 * ausdruecklich auszen vor, denn dort laeuft das Gewebe aus und die
 * Breitenmessung rastet auf einzelnen Punkten ein.
 */
import fs from 'fs';
import { grau, fenster, hochpass, stdabw } from './mess/lib.mjs';

const ZIEL = process.argv[2];
const X0 = Number(process.argv[3] || 840);
const X1 = Number(process.argv[4] || 1420);
const Y0 = Number(process.argv[5] || 130);
const Y1 = Number(process.argv[6] || 810);

const dateien = fs.statSync(ZIEL).isDirectory()
  ? fs.readdirSync(ZIEL).filter((n) => /\.png$/.test(n)).sort().map((n) => `${ZIEL}/${n}`)
  : [ZIEL];

console.log('bild                          engste zeile   hoehe%   breite   mitte-x   breite%');
for (const pfad of dateien) {
  const { g, b, h } = await grau(pfad);
  const hp = hochpass(g, b, h, 7);
  let rausch = Infinity;
  for (let y = 40; y + 120 <= h; y += 60) {
    for (let x = 40; x + 120 <= b; x += 60) {
      const s = stdabw(fenster(hp, b, h, x, y, 120, 120));
      if (s < rausch) rausch = s;
    }
  }
  const schranke = 4 * rausch;
  let beste = Infinity, by = -1, bl = 0, br = 0;
  for (let y = Y0; y < Y1; y++) {
    let l = -1, r = -1, n = 0;
    for (let x = X0; x < X1; x++) {
      if (hp[y * b + x] > schranke) { n++; if (l < 0) l = x; r = x; }
    }
    // Eine Zeile, die kaum Gewebe traegt, taugt nicht als Engstelle.
    if (n < 20) continue;
    const w = r - l;
    if (w < beste) { beste = w; by = y; bl = l; br = r; }
  }
  const mx = (bl + br) / 2;
  console.log(
    `${pfad.padEnd(30)} ${String(by).padStart(4)}       ` +
    `${((100 * by) / h).toFixed(1).padStart(5)}    ${String(beste).padStart(4)}    ` +
    `${mx.toFixed(0).padStart(5)}    ${((100 * mx) / b).toFixed(1).padStart(5)}`,
  );
}
