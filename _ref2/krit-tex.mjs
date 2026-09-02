/**
 * Gewebemaske ueber die HOCHFREQUENZ des Rasters. Text und Kreise sind
 * glatt und fallen heraus; das Punktraster nicht.
 *   node _ref2/krit-tex.mjs <bild> <l> <t> <w> <h> [label]
 */
import sharp from 'sharp';
const [file, cx, cy, cw, chh, label] = process.argv.slice(2);
const { data, info } = await sharp(file)
  .extract({ left: +cx, top: +cy, width: +cw, height: +chh })
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

// Zellweise (8x8) Textur-Energie: Anzahl der Vorzeichenwechsel gegen den
// lokalen Mittelwert plus Streuung. Raster -> hoch, Text/Flaeche -> tief.
const CS = 8;
const gw = Math.floor(W / CS), gh = Math.floor(H / CS);
const tex = new Float32Array(gw * gh);
const bright = new Float32Array(gw * gh);
for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
  let s = 0, n = 0, mx = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) for (let x = gx * CS; x < gx * CS + CS; x++) { const v = lum[y * W + x]; s += v; n++; if (v > mx) mx = v; }
  const m = s / n;
  let cross = 0, sd = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) {
    let prev = lum[y * W + gx * CS] > m;
    for (let x = gx * CS + 1; x < gx * CS + CS; x++) { const c = lum[y * W + x] > m; if (c !== prev) cross++; prev = c; sd += (lum[y * W + x] - m) ** 2; }
  }
  tex[gy * gw + gx] = cross;      // 0..~28
  bright[gy * gw + gx] = mx - m;
}
const mask = new Uint8Array(gw * gh);
for (let i = 0; i < gw * gh; i++) mask[i] = (tex[i] >= 8 && bright[i] > 4) ? 1 : 0;

const rows = 30;
console.log(`# ${label || file}  ${W}x${H}`);
console.log('yPct  links%  achse%  rechts%  breite%  streu%  bedeckung%');
const prof = [];
for (let ri = 0; ri < rows; ri++) {
  const y0 = Math.floor((ri / rows) * gh), y1 = Math.max(y0 + 1, Math.floor(((ri + 1) / rows) * gh));
  const cnt = new Float64Array(gw);
  for (let y = y0; y < y1; y++) for (let x = 0; x < gw; x++) cnt[x] += mask[y * gw + x];
  let tot = 0, ws = 0;
  for (let x = 0; x < gw; x++) { tot += cnt[x]; ws += cnt[x] * x; }
  const axis = tot > 0 ? ws / tot : -1;
  let v = 0; for (let x = 0; x < gw; x++) v += cnt[x] * (x - axis) ** 2;
  const sd = tot > 0 ? Math.sqrt(v / tot) : 0;
  const need = (y1 - y0) * 0.35;
  let l = -1, r = -1;
  for (let x = 0; x < gw; x++) if (cnt[x] >= need) { if (l < 0) l = x; r = x; }
  prof.push({ y: (y0 + y1) / 2 / gh, sd, w: l < 0 ? 0 : r - l });
  console.log(
    (((y0 + y1) / 2 / gh) * 100).toFixed(1).padStart(5),
    (l < 0 ? '-' : ((l / gw) * 100).toFixed(1)).padStart(6),
    (axis < 0 ? '-' : ((axis / gw) * 100).toFixed(1)).padStart(7),
    (r < 0 ? '-' : ((r / gw) * 100).toFixed(1)).padStart(8),
    (l < 0 ? '0' : (((r - l) / gw) * 100).toFixed(1)).padStart(8),
    ((sd / gw) * 100).toFixed(1).padStart(7),
    ((tot / (gw * (y1 - y0))) * 100).toFixed(1).padStart(11),
  );
}
const mins = [];
for (let i = 1; i < prof.length - 1; i++)
  if (prof[i].w > 0 && prof[i].w <= prof[i - 1].w && prof[i].w <= prof[i + 1].w)
    mins.push({ yPct: +(prof[i].y * 100).toFixed(1), breite: +((prof[i].w / gw) * 100).toFixed(1) });
console.log('EINSCHNUERUNGEN:', JSON.stringify(mins));
