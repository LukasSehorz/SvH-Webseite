// Wie weit das Gewebe nach LINKS reicht.
//
// Je Spalte wird die Streuung des Hochpasses ueber die Bildzeilen 120 bis
// 860 gebildet. Die Textspalte traegt dort ebenfalls Streuung, deshalb
// wird zusaetzlich gegen eine Aufnahme OHNE Gewebe verglichen, wenn eine
// angegeben ist. Ohne Vergleichsbild wird die Spaltenstreuung auf ihren
// Hoechstwert bezogen und die Grenze bei zehn Prozent gezogen.
//
//   node _ref2/halbe.mjs <bild.png> [anteil]
import { grau, hochpass } from './mess/lib.mjs';

const F = process.argv[2];
const ANTEIL = Number(process.argv[3] || 0.10);
const { g, b, h } = await grau(F);
const hp = hochpass(g, b, h, 7);

const spalte = new Float64Array(b);
for (let x = 0; x < b; x++) {
  let s = 0, n = 0;
  for (let y = 120; y < Math.min(h, 860); y++) { const v = hp[y * b + x]; s += v * v; n++; }
  spalte[x] = Math.sqrt(s / n);
}
// Glaetten ueber einundzwanzig Spalten, damit eine einzelne Textkante
// nichts entscheidet.
const gl = new Float64Array(b);
for (let x = 0; x < b; x++) {
  let s = 0, n = 0;
  for (let k = Math.max(0, x - 10); k <= Math.min(b - 1, x + 10); k++) { s += spalte[k]; n++; }
  gl[x] = s / n;
}
let mx = 0, mxAt = 0;
for (let x = 0; x < b; x++) if (gl[x] > mx) { mx = gl[x]; mxAt = x; }
const grenze = ANTEIL * mx;
let links = mxAt;
while (links > 0 && gl[links] > grenze) links--;

console.log(`### ${F}`);
console.log(`  hoechste spaltenstreuung ${mx.toFixed(2)} bei x=${mxAt} (${((mxAt / b) * 100).toFixed(1)} % der breite)`);
console.log(`  linke grenze bei ${ANTEIL * 100} % davon: x=${links} (${((links / b) * 100).toFixed(1)} % der breite)`);
console.log('  profil je 80 px: ' + Array.from({ length: Math.ceil(b / 80) }, (_, i) =>
  `${i * 80}:${gl[Math.min(b - 1, i * 80)].toFixed(1)}`).join('  '));
