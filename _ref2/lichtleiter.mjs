/**
 * Helligkeit und Farbe in einem Fenster mit FESTEM ABSTAND VON DER
 * KREUZUNG.
 *
 *   node _ref2/lichtleiter.mjs <bild> [marke]
 *
 * Ein ortsfestes Fenster taugt fuer den Vergleich nicht. Die Kreuzung
 * wandert beim Scrollen durch das Bild, und je nachdem, ob sie im Fenster
 * steht, liegt dieselbe Referenz einmal bei tausend und einmal bei
 * sechstausend hellen Bildpunkten. Gemessen wird deshalb in einem Fenster,
 * das oberhalb der Kreuzung mitwandert, denn dort steht bei beiden Seiten
 * dasselbe: der offene obere Faecher.
 *
 * Die Kreuzung wird als hellste Stelle eines ueber neun Bildpunkte
 * geglaetteten Grauwertes gesucht, damit ein einzelner heller Punkt sie
 * nicht verschiebt.
 */
import sharp from 'sharp';

const F = process.argv[2];
const MARKE = process.argv[3] || F;

const { data, info } = await sharp(F).raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width, H = info.height;

const val = (x, y) => {
  const i = (y * W + x) * C;
  return Math.max(data[i], data[i + 1], data[i + 2]);
};

// Die Kreuzung, gesucht allein im Gewebe und unterhalb der Kopfzeile.
let best = -1, bx = 0, by = 0;
for (let y = 120; y < 840; y += 2) {
  for (let x = 860; x < 1400; x += 2) {
    let s = 0;
    for (let jy = -6; jy <= 6; jy += 3) for (let jx = -6; jx <= 6; jx += 3) s += val(x + jx, y + jy);
    if (s > best) { best = s; bx = x; by = y; }
  }
}

// Das Meszfenster steht 260 Bildpunkte ueber der Kreuzung und 30 rechts
// davon, also mitten im oberen Faecher.
const X = Math.min(W - 200, Math.max(0, bx + 30));
const Y = Math.max(0, by - 300);
const B = 170, Ht = 170;

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

const vs = [];
const t = [0, 0, 0, 0];
const sats = [];
let n = 0, farblos = 0;
for (let y = Y; y < Y + Ht; y++) {
  for (let x = X; x < X + B; x++) {
    const i = (y * W + x) * C;
    const [h, s, v] = hsv(data[i], data[i + 1], data[i + 2]);
    vs.push(v);
    if (v < 70) continue;
    n++; sats.push(s);
    if (h >= 210 && h < 240) t[0]++;
    else if (h >= 240 && h < 270) t[1]++;
    else if (h >= 270 && h < 300) t[2]++;
    else t[3]++;
    if (v >= 150 && s < 0.10) farblos++;
  }
}
vs.sort((a, b) => a - b);
sats.sort((a, b) => a - b);
const q = (p) => vs[Math.floor(vs.length * p)];
const so = q(0.02);
const pc = (x) => ((100 * x) / (n || 1)).toFixed(1);
console.log(
  `${MARKE.padEnd(20)} kreuzung ${bx},${by} (${((100 * by) / H).toFixed(1)}% hoehe, ${((100 * bx) / 1425).toFixed(1)}% breite)  fenster ${X},${Y}\n` +
  `    sockel ${so}  p50 ${q(0.5) - so}  p75 ${q(0.75) - so}  p90 ${q(0.9) - so}  p99 ${q(0.99) - so}  ` +
  `v>=150 ${vs.filter((v) => v >= 150).length}  leuchtend ${n} (${((100 * n) / (B * Ht)).toFixed(1)}%)\n` +
  `    210-240 ${pc(t[0])}%  240-270 ${pc(t[1])}%  270-300 ${pc(t[2])}%  sonst ${pc(t[3])}%  ` +
  `sat ${(sats[Math.floor(sats.length / 2)] || 0).toFixed(3)}  farblos ${farblos}`,
);
