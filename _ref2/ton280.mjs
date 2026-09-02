/**
 * Die Farbtonverteilung mit der Einteilung, die der Auftrag nennt.
 *
 *   node _ref2/ton280.mjs <bild> <x,y,b,h> [marke]
 *
 * Die Vorgabe lautet, mindestens 95 Prozent der leuchtenden Bildpunkte
 * sollen zwischen 210 und 280 Grad liegen und auszerhalb von 200 bis 300
 * Grad soll praktisch nichts stehen. Die Toepfe von _ref2/vier/farbe.mjs
 * schneiden bei 270 und treffen diese Grenze deshalb nicht.
 *
 * Gemessen wird ausschlieszlich gegen die LEBENDEN Aufnahmen unter
 * _ref2/mess/live und _ref2/refscroll, niemals gegen Videobilder.
 */
import sharp from 'sharp';

const F = process.argv[2];
const [X, Y, B, H] = (process.argv[3] || '900,60,500,780').split(',').map(Number);
const MARKE = process.argv[4] || F;
const SCHWELLE = Number(process.env.V || 70);

const hsv = (r, g, b) => {
  const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m;
  let h = 0;
  if (d) {
    if (M === r) h = 60 * (((g - b) / d) % 6);
    else if (M === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, M ? d / M : 0, M];
};

const { data, info } = await sharp(F).extract({ left: X, top: Y, width: B, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
// Die Schwelle laeszt sich auch als ANTEIL der hellsten Bildpunkte setzen.
// Das ist der Blick, dem das Auge folgt: der Betrachter sieht die wenigen
// hellen Punkte und nicht die vielen schwachen, und eine Verteilung kann
// deshalb rechnerisch stimmen und trotzdem bunt aussehen.
const ANTEIL = Number(process.env.ANTEIL || 0);
let SCHW = SCHWELLE;
if (ANTEIL > 0) {
  const vs = [];
  for (let i = 0; i < info.width * info.height; i++) {
    vs.push(Math.max(data[i * C], data[i * C + 1], data[i * C + 2]));
  }
  vs.sort((a, z) => z - a);
  SCHW = vs[Math.min(vs.length - 1, Math.floor(vs.length * ANTEIL))];
}
let n = 0, kern = 0, rand = 0, weit = 0, gruen = 0, rot = 0, gelb = 0, unbunt = 0;
const sats = [];
for (let i = 0; i < info.width * info.height; i++) {
  const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
  const [h, s, v] = hsv(r, g, b);
  if (v < SCHW) continue;
  n++; sats.push(s);
  // Ein nahezu unbunter Bildpunkt hat keinen aussagekraeftigen Farbton und
  // wird deshalb getrennt gezaehlt, sonst wuerfelt das Rauschen ihn in
  // einen beliebigen Topf.
  if (s < 0.10) { unbunt++; continue; }
  if (h >= 210 && h < 280) kern++;
  else if ((h >= 200 && h < 210) || (h >= 280 && h < 300)) rand++;
  else {
    weit++;
    if (h >= 90 && h < 200) gruen++;
    else if (h >= 30 && h < 90) gelb++;
    else rot++;
  }
}
sats.sort((a, z) => a - z);
const pc = (x) => (n ? ((x / n) * 100).toFixed(2) : '0.00').padStart(6) + '%';
console.log(`${MARKE.padEnd(18)} schwelle ${String(SCHW).padStart(3)}   leuchtend ${String(n).padStart(7)} (${((100 * n) / (B * H)).toFixed(1)}% des fensters)`);
console.log(
  `   210-280 ${pc(kern)}   200-210/280-300 ${pc(rand)}   auszerhalb 200-300 ${pc(weit)}` +
  `   [gruen 90-200 ${pc(gruen)}  gelb 30-90 ${pc(gelb)}  rot/magenta ${pc(rot)}]` +
  `   unbunt ${pc(unbunt)}   saettigung median ${n ? sats[Math.floor(sats.length / 2)].toFixed(2) : '-'}`,
);
