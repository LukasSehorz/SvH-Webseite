/**
 * Taillen-Profil ueber die HELLEN Gewebepunkte (weisser Text faellt durch
 * die Blaeue-Bedingung heraus).
 *   node _ref2/krit-blue.mjs <bild> <l> <t> <w> <h> [label] [thr]
 * Je Zeilenband: linke/rechte Kante der hellen Punkte, Schwerpunkt,
 * Streuung (das eigentliche Taillenmasz) und Flaechenanteil.
 */
import sharp from 'sharp';
const [file, cx, cy, cw, chh, label, thrArg] = process.argv.slice(2);
const { data, info } = await sharp(file)
  .extract({ left: +cx, top: +cy, width: +cw, height: +chh })
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const THR = +(thrArg || 26);

const lum = new Float32Array(W * H), blu = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
  lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  blu[i] = b - Math.max(r, g);
}
const s = Float32Array.from(lum).sort();
const floor = s[Math.floor(s.length * 0.2)];
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) mask[i] = (blu[i] > 9 && lum[i] > floor + THR) ? 1 : 0;

const rows = 30;
console.log(`# ${label || file}  ${W}x${H} floor=${floor.toFixed(0)} thr=+${THR}`);
console.log('yPct  links%  achse%  rechts%  breite%  streu%  flaeche%');
const prof = [];
for (let ri = 0; ri < rows; ri++) {
  const y0 = Math.floor((ri / rows) * H), y1 = Math.max(y0 + 1, Math.floor(((ri + 1) / rows) * H));
  const cnt = new Float64Array(W);
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) cnt[x] += mask[y * W + x];
  const sm = new Float64Array(W);
  for (let x = 0; x < W; x++) { let a = 0, n = 0; for (let k = -10; k <= 10; k++) { const j = x + k; if (j >= 0 && j < W) { a += cnt[j]; n++; } } sm[x] = a / n; }
  const rowsN = y1 - y0;
  let tot = 0, wsum = 0, peak = 0;
  for (let x = 0; x < W; x++) { tot += cnt[x]; wsum += cnt[x] * x; if (sm[x] > peak) peak = sm[x]; }
  const axis = tot > 0 ? wsum / tot : -1;
  let v = 0; for (let x = 0; x < W; x++) v += cnt[x] * (x - axis) ** 2;
  const sd = tot > 0 ? Math.sqrt(v / tot) : 0;
  const thr2 = peak * 0.20;
  let l = -1, r = -1;
  for (let x = 0; x < W; x++) if (sm[x] > thr2) { if (l < 0) l = x; r = x; }
  prof.push({ y: (y0 + y1) / 2 / H, l, r, w: l < 0 ? 0 : r - l, sd, area: tot / (W * rowsN) });
  console.log(
    (((y0 + y1) / 2 / H) * 100).toFixed(1).padStart(5),
    (l < 0 ? '-' : ((l / W) * 100).toFixed(1)).padStart(6),
    (axis < 0 ? '-' : ((axis / W) * 100).toFixed(1)).padStart(7),
    (r < 0 ? '-' : ((r / W) * 100).toFixed(1)).padStart(8),
    (l < 0 ? '0' : (((r - l) / W) * 100).toFixed(1)).padStart(8),
    ((sd / W) * 100).toFixed(1).padStart(7),
    ((tot / (W * rowsN)) * 100).toFixed(2).padStart(9),
  );
}
const mins = [];
for (let i = 1; i < prof.length - 1; i++)
  if (prof[i].sd > 0 && prof[i].sd <= prof[i - 1].sd && prof[i].sd <= prof[i + 1].sd)
    mins.push({ yPct: +(prof[i].y * 100).toFixed(1), streu: +((prof[i].sd / W) * 100).toFixed(1) });
console.log('EINSCHNUERUNGEN (Minima der Streuung):', JSON.stringify(mins));
