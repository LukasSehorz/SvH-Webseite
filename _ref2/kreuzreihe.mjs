/**
 * Sucht in jedem Bild einer Reihe die Kreuzung und meldet ihre Bildzeile.
 *
 *   node _ref2/kreuzreihe.mjs <ordner> [x0] [x1]
 *
 * Die Kreuzung ist der KNOTEN, also die Stelle, an der die Flaeche auf der
 * Kante steht und ihr Licht sich auf wenige Bildpunkte zusammenzieht. Sie
 * ist deshalb ueber ein geglaettetes Helligkeitsbild zu finden und nicht
 * ueber die Zeilenbreite; die Zeilenbreite rastet am unteren Saum der
 * Maske und an den Bildraendern ein und liefert dort falsche Treffer.
 *
 * Gemeldet werden der hoechste geglaettete Wert im Faecher und das 99.
 * Perzentil derselben Flaeche. Steht ein Knoten im Bild, so liegt der
 * Hoechstwert deutlich ueber dem Perzentil; in der FLACHEN PHASE, in der
 * keine Kreuzung im Bild steht, liegen beide dicht beieinander.
 */
import fs from 'fs';
import { grau } from './mess/lib.mjs';

const DIR = process.argv[2];
const X0 = Number(process.argv[3] || 840);
const X1 = Number(process.argv[4] || 1420);
const Y0 = Number(process.argv[5] || 30);
const Y1 = Number(process.argv[6] || 870);
const VERH = Number(process.env.VERH || 1.55);

// Kastenmittel ueber ein Quadrat von 2R+1, ueber ein Summenbild.
function glatt(g, b, h, R) {
  const int = new Float64Array((b + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let z = 0;
    for (let x = 0; x < b; x++) {
      z += g[y * b + x];
      int[(y + 1) * (b + 1) + (x + 1)] = int[y * (b + 1) + (x + 1)] + z;
    }
  }
  const out = new Float32Array(b * h);
  for (let y = 0; y < h; y++) {
    const ya = Math.max(0, y - R), yb = Math.min(h - 1, y + R);
    for (let x = 0; x < b; x++) {
      const xa = Math.max(0, x - R), xb = Math.min(b - 1, x + R);
      const s = int[(yb + 1) * (b + 1) + (xb + 1)] - int[ya * (b + 1) + (xb + 1)]
              - int[(yb + 1) * (b + 1) + xa] + int[ya * (b + 1) + xa];
      out[y * b + x] = s / ((yb - ya + 1) * (xb - xa + 1));
    }
  }
  return out;
}

const dateien = fs.readdirSync(DIR).filter((n) => /\.png$/.test(n)).sort();
console.log('bild          knoten x    y   hoehe%   breite%   spitze   p99    verhaeltnis   kreuzung');
for (const f of dateien) {
  const { g, b, h } = await grau(`${DIR}/${f}`);
  const s = glatt(g, b, h, 6);
  let best = -1, bx = 0, by = 0;
  const werte = [];
  for (let y = Y0; y < Y1; y++) {
    for (let x = X0; x < X1; x++) {
      const v = s[y * b + x];
      werte.push(v);
      if (v > best) { best = v; bx = x; by = y; }
    }
  }
  werte.sort((a, z) => a - z);
  const p99 = werte[Math.floor(werte.length * 0.99)];
  const q = best / Math.max(1e-6, p99);
  console.log(
    `${f.padEnd(13)} ${String(bx).padStart(5)} ${String(by).padStart(4)}   ` +
    `${((100 * by) / h).toFixed(1).padStart(5)}    ${((100 * bx) / b).toFixed(1).padStart(5)}   ` +
    `${best.toFixed(1).padStart(6)} ${p99.toFixed(1).padStart(6)}   ${q.toFixed(2).padStart(6)}       ` +
    `${q >= VERH ? 'JA' : 'nein'}`,
  );
}
