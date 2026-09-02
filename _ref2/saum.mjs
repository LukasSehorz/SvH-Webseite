/**
 * Der Faltensaum laengs der Achse.
 *
 * Je waagerechtem Streifen wird das Spaltenmittel gebildet und stark
 * geglaettet, damit das Punktraster herausfaellt und nur der grosze
 * Verlauf ueber die Bandbreite stehen bleibt. Gesucht sind zwei Dinge:
 * die tiefste Kerbe (der dunkle Riss laengs der Achse) und der hoechste
 * Grat (der helle Saum) jeweils gegen den oertlichen Trend.
 *
 * Der Radius der Feinglaettung ist ein Parameter und war frueher fest auf
 * vier Bildpunkten. Das ist nur so lange richtig, wie die Bahnen des
 * Gewebes enger stehen als der Filter breit ist. Seit die Bahnen 16,7
 * Bildpunkte auseinanderstehen, laeszt ein Filter der Halbbreite vier die
 * Bahnenwelle stehen, und das Werkzeug meldet jede Luecke zwischen zwei
 * Bahnen als Kerbe. Fuer das Gewebe der neuen Dichte gehoert der Radius
 * auf neun, und zwar bei BEIDEN Bildern, sonst vergleicht man zwei
 * verschiedene Messungen.
 *
 *   node _ref2/saum.mjs <bild> <l> <t> <w> <h> <label> [radiusFein]
 */
import sharp from 'sharp';
const [file, cx, cy, cw, chh, label, rf] = process.argv.slice(2);
const RF = Number(rf ?? 4);
const L = +cx, T = +cy, W = +cw, H = +chh;
const { data, info } = await sharp(file)
  .extract({ left: L, top: T, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const BANDS = 10;
console.log(`# ${label}  ${W}x${H}`);
console.log('yPct   kerbeX%  kerbeTiefe  gratX%  gratHoehe   (jeweils Lumstufen gegen den Trend)');
let worstK = 0, worstG = 0, nK = 0, nG = 0;
for (let bi = 0; bi < BANDS; bi++) {
  const y0 = Math.floor((bi / BANDS) * H), y1 = Math.floor(((bi + 1) / BANDS) * H);
  const col = new Float64Array(W);
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) col[x] += lum[y * W + x];
  for (let x = 0; x < W; x++) col[x] /= (y1 - y0);
  // Feinglaetten (Raster raus), dann Grobglaetten (Trend).
  const fein = new Float64Array(W), grob = new Float64Array(W);
  const box = (src, dst, r) => {
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const j = x + k; if (j >= 0 && j < W) { s += src[j]; n++; } }
      dst[x] = s / n;
    }
  };
  box(col, fein, RF);
  box(fein, grob, 34);
  let kx = -1, kv = 0, gx = -1, gv = 0;
  for (let x = 40; x < W - 40; x++) {
    const d = fein[x] - grob[x];
    if (d < kv) { kv = d; kx = x; }
    if (d > gv) { gv = d; gx = x; }
  }
  if (-kv > worstK) worstK = -kv;
  if (gv > worstG) worstG = gv;
  if (-kv > 4) nK++;
  if (gv > 4) nG++;
  console.log(
    (((y0 + y1) / 2 / H) * 100).toFixed(1).padStart(5),
    ((kx / W) * 100).toFixed(1).padStart(9),
    (-kv).toFixed(1).padStart(11),
    ((gx / W) * 100).toFixed(1).padStart(8),
    gv.toFixed(1).padStart(11),
  );
}
console.log(`ERGEBNIS ${label}: tiefsteKerbe=${worstK.toFixed(1)} hoechsterGrat=${worstG.toFixed(1)}`
  + ` Streifen_mit_Kerbe>4=${nK}/${BANDS} Streifen_mit_Grat>4=${nG}/${BANDS}`);
