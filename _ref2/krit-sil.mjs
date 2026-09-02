/**
 * KRITIKER: Silhouette + Taillen-Profil.
 *
 *   node _ref2/krit-sil.mjs <bild> <cropX> <cropY> <cropW> <cropH> [label]
 *
 * Fuer jede von 34 Zeilen: linke und rechte Gewebekante in Prozent der
 * Cropbreite, sowie die Breite. Kante = erster/letzter Pixel, dessen
 * geglaettete Helligkeit den Hintergrundsockel um SCHWELLE uebersteigt.
 */
import sharp from 'sharp';

const [file, cx, cy, cw, ch, label] = process.argv.slice(2);
const box = { left: +cx, top: +cy, width: +cw, height: +ch };

const { data, info } = await sharp(file)
  .extract(box)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;

// Hintergrundsockel: 20. Perzentil des ganzen Crops
const all = [...data].sort((a, b) => a - b);
const floor = all[Math.floor(all.length * 0.20)];
const p999 = all[Math.floor(all.length * 0.999)];
const THR = 14; // ueber Sockel

const rows = 34;
const out = [];
for (let ri = 0; ri < rows; ri++) {
  const y0 = Math.floor((ri / rows) * H);
  const y1 = Math.max(y0 + 1, Math.floor(((ri + 1) / rows) * H));
  // Spaltenmittel ueber das Zeilenband
  const col = new Float64Array(W);
  for (let y = y0; y < y1; y++)
    for (let x = 0; x < W; x++) col[x] += data[y * W + x];
  const n = y1 - y0;
  for (let x = 0; x < W; x++) col[x] /= n;
  // glaetten (Box 9)
  const sm = new Float64Array(W);
  for (let x = 0; x < W; x++) {
    let s = 0, c = 0;
    for (let k = -4; k <= 4; k++) { const j = x + k; if (j >= 0 && j < W) { s += col[j]; c++; } }
    sm[x] = s / c;
  }
  let l = -1, r = -1, peak = 0, peakX = 0;
  for (let x = 0; x < W; x++) {
    if (sm[x] > floor + THR) { if (l < 0) l = x; r = x; }
    if (sm[x] > peak) { peak = sm[x]; peakX = x; }
  }
  out.push({
    yPct: +(((y0 + y1) / 2 / H) * 100).toFixed(1),
    l: l < 0 ? null : +((l / W) * 100).toFixed(1),
    r: r < 0 ? null : +((r / W) * 100).toFixed(1),
    w: l < 0 ? 0 : +(((r - l) / W) * 100).toFixed(1),
    peakX: +((peakX / W) * 100).toFixed(1),
    peak: Math.round(peak - floor),
  });
}
console.log(`# ${label || file}  crop ${cw}x${ch}  floor=${floor} p99.9=${p999}`);
console.log('yPct  left%  right%  width%  peakX%  peak');
for (const o of out)
  console.log(
    String(o.yPct).padStart(5),
    String(o.l ?? '-').padStart(6),
    String(o.r ?? '-').padStart(7),
    String(o.w).padStart(7),
    String(o.peakX).padStart(7),
    String(o.peak).padStart(5),
  );
