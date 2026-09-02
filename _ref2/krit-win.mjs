/**
 * Feste, selbst gewaehlte Messfenster ueber dem Gewebe.
 *   node _ref2/krit-win.mjs <bild> <l>,<t>,<w>,<h> [label]
 * Liefert Sockel, Spitzenwert, Anteil leuchtender Punkte (>Sockel+70 wie
 * in der Vorgabe), Punktabstand waagerecht/senkrecht (Autokorrelation)
 * und die Farbtonverteilung der leuchtenden Punkte.
 */
import sharp from 'sharp';
const [file, cropArg, label] = process.argv.slice(2);
const [l, t, w, h] = cropArg.split(',').map(Number);
const { data, info } = await sharp(file)
  .extract({ left: l, top: t, width: w, height: h })
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];
const s = Float32Array.from(lum).sort();
const floor = s[Math.floor(s.length * 0.05)];
const med = s[Math.floor(s.length * 0.5)];
const p99 = s[Math.floor(s.length * 0.99)];
const p999 = s[Math.floor(s.length * 0.999)];
const mx = s[s.length - 1];
const mean = lum.reduce((a, b) => a + b, 0) / lum.length;

const litThr = floor + 70;
let lit = 0; for (let i = 0; i < lum.length; i++) if (lum[i] > litThr) lit++;
let cov8 = 0; for (let i = 0; i < lum.length; i++) if (lum[i] > floor + 8) cov8++;

// Autokorrelation je Richtung
const acf = (dir) => {
  const out = [];
  const m = mean;
  for (let d = 1; d <= 16; d++) {
    let num = 0, da = 0, db = 0;
    for (let y = 0; y < H - (dir === 'y' ? d : 0); y++)
      for (let x = 0; x < W - (dir === 'x' ? d : 0); x++) {
        const a = lum[y * W + x] - m;
        const b = lum[dir === 'x' ? y * W + x + d : (y + d) * W + x] - m;
        num += a * b; da += a * a; db += b * b;
      }
    out.push(+(num / Math.sqrt(da * db || 1)).toFixed(3));
  }
  return out;
};
const ax = acf('x'), ay = acf('y');
const firstPeak = (a) => {
  for (let i = 1; i < a.length - 1; i++) if (a[i] > a[i - 1] && a[i] >= a[i + 1] && a[i] > 0.05) return i + 1;
  return null;
};

// Farbton der leuchtenden Punkte
const hues = new Array(12).fill(0);
let white = 0, litN = 0;
const satSum = [];
for (let i = 0; i < W * H; i++) {
  if (lum[i] < floor + 35) continue;
  litN++;
  const r = data[i * C] / 255, g = data[i * C + 1] / 255, b = data[i * C + 2] / 255;
  const M = Math.max(r, g, b), mn = Math.min(r, g, b), d = M - mn;
  satSum.push(M > 0 ? d / M : 0);
  if (d < 0.10) { white++; continue; }
  let hu; if (M === r) hu = ((g - b) / d) % 6; else if (M === g) hu = (b - r) / d + 2; else hu = (r - g) / d + 4;
  hu = ((hu * 60) + 360) % 360;
  hues[Math.floor(hu / 30)]++;
}
satSum.sort((a, b) => a - b);
console.log(JSON.stringify({
  label: label || file, win: `${w}x${h}@${l},${t}`,
  floor: +floor.toFixed(1), median: +med.toFixed(1), mean: +mean.toFixed(1),
  peakOverFloor_p99: +(p99 - floor).toFixed(0),
  peakOverFloor_p999: +(p999 - floor).toFixed(0),
  maxOverFloor: +(mx - floor).toFixed(0),
  litPct_gt70: +((lit / lum.length) * 100).toFixed(1),
  coverage_gt8: +((cov8 / lum.length) * 100).toFixed(1),
  pitchX: firstPeak(ax), pitchY: firstPeak(ay),
  acfX: ax.slice(0, 12), acfY: ay.slice(0, 12),
  medSat: +(satSum[Math.floor(satSum.length / 2)] || 0).toFixed(2),
  whitePctOfLit: +((white / (litN || 1)) * 100).toFixed(1),
  hue30: hues.map((v) => +((v / (litN || 1)) * 100).toFixed(1)),
}));
