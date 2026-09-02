// Wie stark das Gewebe in den untersten Bildzeilen noch traegt.
//
// Ausgegeben wird je Bild der Mittelwert des Hochpasses ueber die rechte
// Bildhaelfte, und zwar in Zehnerschritten ueber die letzten 200 Zeilen.
// Damit laeszt sich unterscheiden, ob dort nichts MEHR ist oder ob nur die
// Schwelle einer Bedeckungsmessung nicht erreicht wird.
//
//   node _ref2/unterkante.mjs <ordner>
import { grau, hochpass } from './mess/lib.mjs';
import { leerfeld } from './mess/punkte.mjs';
import fs from 'fs';

const DIR = process.argv[2];
const X0 = Number(process.argv[3] || 850), X1 = Number(process.argv[4] || 1420);
const dateien = fs.readdirSync(DIR).filter(n => /\.png$/.test(n)).sort();

console.log('bild\tsigma\t' + [700, 750, 800, 830, 860, 880, 895].map(y => `z${y}`).join('\t'));
for (const f of dateien) {
  const { g, b, h } = await grau(`${DIR}/${f}`);
  const leer = await leerfeld(g, b, h);
  const hp = hochpass(g, b, h, 7);
  const werte = [];
  for (const y of [700, 750, 800, 830, 860, 880, 895]) {
    let s = 0, n = 0, ueber = 0;
    const schwelle = 3.5 * Math.max(0.45, leer.sigma);
    for (let yy = Math.max(0, y - 4); yy <= Math.min(h - 1, y + 4); yy++) {
      for (let x = X0; x < X1; x++) {
        const v = hp[yy * b + x];
        s += Math.abs(v); n++;
        if (v > schwelle) ueber++;
      }
    }
    werte.push(`${(s / n).toFixed(2)}|${((ueber / n) * 100).toFixed(1)}%`);
  }
  console.log(`${f}\t${leer.sigma.toFixed(2)}\t` + werte.join('\t'));
}
