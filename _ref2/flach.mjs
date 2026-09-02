/**
 * Steht in diesem Bild eine Kreuzung, oder ist es die flache Lage?
 *
 *   node _ref2/flach.mjs <bild> [marke]
 *
 * Der Auftraggeber hat verlangt, dass zwischen zwei Kreuzungen eine Lage
 * steht, in der die Flaeche dem Betrachter frontal gegenuebersteht wie eine
 * Wand. Eine Kreuzung ist daran zu erkennen, dass die BREITE des Gewebes in
 * einer Bildzeile auf wenige Bildpunkte zusammenlaeuft, waehrend sie
 * darueber und darunter ueber mehrere hundert Bildpunkte reicht. In der
 * flachen Lage fehlt diese Einschnuerung.
 *
 * Gemessen wird deshalb je Bildzeile die AUSDEHNUNG, also der Abstand
 * zwischen der linkesten und der rechtesten leuchtenden Stelle, und daraus
 * das Verhaeltnis der schmalsten Zeile zur breiten Ausdehnung des Bildes.
 * Die Bedeckung taugt dafuer nicht, denn sie faellt in den offenen Faechern
 * mit dem Lichtverlauf nach auszen ebenfalls ab und verwischt damit genau
 * den Unterschied, um den es geht.
 *
 * Eine Zeile zaehlt nur, wenn sie ueberhaupt Gewebe traegt; Zeilen ohne
 * Gewebe stehen ober- und unterhalb der Zone und sind keine Engstelle.
 */
import sharp from 'sharp';

const F = process.argv[2];
const MARKE = process.argv[3] || F;

const { data, info } = await sharp(F).raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width;
// Nur das Gewebe, ohne Kopfzeile und ohne Bildlaufleiste.
const X0 = 830, X1 = 1420, Y0 = 90, Y1 = 870;

const weite = [];
for (let y = Y0; y < Y1; y++) {
  let li = -1, re = -1, n = 0;
  for (let x = X0; x < X1; x++) {
    const i = (y * W + x) * C;
    if (Math.max(data[i], data[i + 1], data[i + 2]) < 95) continue;
    if (li < 0) li = x;
    re = x; n++;
  }
  // Mindestens zwanzig leuchtende Bildpunkte, sonst ist die Zeile leer.
  weite.push(n >= 20 ? re - li : -1);
}
const voll = weite.filter((v) => v > 0).sort((a, b) => a - b);
if (!voll.length) { console.log(`${MARKE}  kein gewebe im fenster`); process.exit(0); }
const breit = voll[Math.floor(voll.length * 0.75)];

// Die schmalste Stelle wird ueber sieben Zeilen geglaettet, damit eine
// einzelne dunkle Rasterreihe nicht als Engstelle durchgeht, und sie musz
// zwischen zwei getragenen Zeilen liegen.
let engY = -1, eng = Infinity;
for (let k = 3; k < weite.length - 3; k++) {
  if (weite[k] < 0) continue;
  let s = 0, m = 0;
  for (let j = k - 3; j <= k + 3; j++) if (weite[j] > 0) { s += weite[j]; m++; }
  if (m < 5) continue;
  const z = s / m;
  if (z < eng) { eng = z; engY = k + Y0; }
}
const q = eng / breit;
const kreuzung = q < 0.30;
console.log(
  `${MARKE.padEnd(10)} schmalste zeile bei y=${engY} (${((100 * engY) / info.height).toFixed(1)}% hoehe), ` +
  `weite ${eng.toFixed(0)} gegen die breite lage ${breit}, verhaeltnis ${q.toFixed(2)}   ` +
  `=> ${kreuzung ? 'KREUZUNG im bild' : 'FLACHE LAGE, keine kreuzung'}`,
);
