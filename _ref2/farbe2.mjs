/**
 * Farbauswertung mit gesonderter Betrachtung der HELLSTEN Bildpunkte.
 *
 *   node _ref2/farbe2.mjs <bild> <x,y,b,h> [marke]
 *
 * Der Anlasz ist der Verdacht, dass die gelben Bildpunkte unseres Gewebes
 * aus dem KLEMMEN des Blaukanals stammen. Alle gesetzten Toene sind blau
 * bis violett und tragen ihren vollen Wert im Blaukanal; sobald die
 * additive Summe dort die Eins erreicht, heben weitere Beitraege nur noch
 * Rot und Gruen, und der Farbton wandert ueber Weisz hinaus ins Gelbe.
 * Sichtbar wird das ausschlieszlich in den hellsten Bildpunkten, eine
 * Zaehlung ueber alle leuchtenden Bildpunkte verdeckt es.
 *
 * Gemessen wird deshalb dreierlei. Erstens die Farbtoepfe ueber alle
 * Bildpunkte oberhalb der Schwelle, zweitens dieselben Toepfe allein ueber
 * das oberste Hundertstel und das oberste Tausendstel der Helligkeit,
 * drittens die Zahl der Bildpunkte, deren Blaukanal an der Grenze steht,
 * getrennt danach, ob Rot und Gruen dort ueber dem Blau liegen.
 */
import sharp from 'sharp';

const F = process.argv[2];
const [X, Y, B, H] = (process.argv[3] || '1050,160,180,180').split(',').map(Number);
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
const N = info.width * info.height;

const px = [];
for (let i = 0; i < N; i++) {
  const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
  px.push([r, g, b, Math.max(r, g, b)]);
}

const toepfe = (menge) => {
  // Zwoelf Toepfe zu je dreiszig Grad, dazu die Saettigung.
  const t = new Array(12).fill(0);
  const sats = [];
  for (const [r, g, b] of menge) {
    const [h, s] = hsv(r, g, b);
    t[Math.min(11, Math.floor(h / 30))]++;
    sats.push(s);
  }
  sats.sort((a, b) => a - b);
  return { t, n: menge.length, sat: menge.length ? sats[Math.floor(sats.length / 2)] : 0 };
};

const zeig = (name, m) => {
  const p = (k) => ((100 * m.t[k]) / (m.n || 1)).toFixed(1).padStart(5);
  // Der gelbe Bereich umfasst die Toepfe 30 bis 90 Grad, also 1 und 2.
  const gelb = ((100 * (m.t[1] + m.t[2])) / (m.n || 1)).toFixed(2);
  console.log(
    `${name.padEnd(22)} n=${String(m.n).padStart(7)}  ` +
    `180-210 ${p(6)}  210-240 ${p(7)}  240-270 ${p(8)}  270-300 ${p(9)}  ` +
    `300-330 ${p(10)}  330-360 ${p(11)}  0-30 ${p(0)}  30-90 ${gelb.padStart(5)}%  ` +
    `sat ${m.sat.toFixed(3)}`,
  );
};

console.log(`\n== ${MARKE}  fenster ${X},${Y},${B},${H} ==`);
const ueber = px.filter((q) => q[3] >= SCHWELLE);
zeig(`alle v>=${SCHWELLE}`, toepfe(ueber));

const sortiert = [...px].sort((a, b) => b[3] - a[3]);
for (const anteil of [0.01, 0.002, 0.0005]) {
  const k = Math.max(1, Math.round(N * anteil));
  const m = toepfe(sortiert.slice(0, k));
  zeig(`hellste ${(anteil * 100).toFixed(2)}%`, m);
}

// Die Helligkeitsleiter, jeweils ueber dem Sockel des Fensters.
const vs = px.map((q) => q[3]).sort((a, b) => a - b);
const q = (p) => vs[Math.min(vs.length - 1, Math.floor(vs.length * p))];
const sockel = q(0.02);
console.log(
  `   leiter ueber sockel ${sockel}:  p50 ${(q(0.5) - sockel).toFixed(1)}  ` +
  `p75 ${(q(0.75) - sockel).toFixed(1)}  p90 ${(q(0.9) - sockel).toFixed(1)}  ` +
  `p99 ${(q(0.99) - sockel).toFixed(1)}  p99.9 ${(q(0.999) - sockel).toFixed(1)}  ` +
  `max ${(vs[vs.length - 1] - sockel).toFixed(1)}`,
);

// Das Klemmen selbst. Gezaehlt wird, wie oft der Blaukanal am oberen Rand
// steht und wie oft Rot oder Gruen ihn dabei erreicht oder ueberholt hat.
let bMax = 0, bMaxUndRG = 0, rgUeberB = 0, weisz = 0;
for (const [r, g, b, v] of px) {
  if (b >= 250) {
    bMax++;
    if (r >= 200 || g >= 200) bMaxUndRG++;
  }
  if (v >= 200 && (r > b || g > b)) rgUeberB++;
  if (v >= 235 && Math.min(r, g, b) >= 200) weisz++;
}
console.log(
  `   blau>=250 ${bMax} (${((100 * bMax) / N).toFixed(2)}%), davon r|g>=200 ${bMaxUndRG}   ` +
  `hell mit r|g > b ${rgUeberB} (${((100 * rgUeberB) / N).toFixed(2)}%)   ` +
  `nahezu weisz ${weisz} (${((100 * weisz) / N).toFixed(2)}%)`,
);
