/**
 * Wanderung des Gewebes laengs der Achse. Robuster als Blockvergleich,
 * weil ueber einen breiten Streifen gemittelt und ueber +-70 Bildpunkte
 * gesucht wird.
 *   node _ref2/krit-drift.mjs <l>,<t>,<w>,<h> <dtSek> <bildA> <bildB> ...
 * Alle weiteren Bilder werden gegen das erste verglichen.
 */
import sharp from 'sharp';
const [cropArg, dtArg, ...files] = process.argv.slice(2);
const [l, t, w, h] = cropArg.split(',').map(Number);
const dt = +dtArg;

const prof = async (f) => {
  const { data, info } = await sharp(f)
    .extract({ left: l, top: t, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const p = new Float64Array(H);
  for (let y = 0; y < H; y++) { let s = 0; for (let x = 0; x < W; x++) s += data[y * W + x]; p[y] = s / W; }
  // Hochpass, damit der Grundverlauf nicht dominiert
  const out = new Float64Array(H);
  for (let y = 0; y < H; y++) {
    let s = 0, n = 0;
    for (let k = -14; k <= 14; k++) { const j = y + k; if (j >= 0 && j < H) { s += p[j]; n++; } }
    out[y] = p[y] - s / n;
  }
  return out;
};

const P = [];
for (const f of files) P.push(await prof(f));
const H = P[0].length;
const corr = (a, b, d) => {
  let n = 0, sa = 0, sb = 0, ca = 0, cb = 0, cnt = 0;
  for (let y = 0; y < H; y++) { const j = y + d; if (j < 0 || j >= H) continue; sa += a[y]; sb += b[j]; cnt++; }
  sa /= cnt; sb /= cnt;
  for (let y = 0; y < H; y++) { const j = y + d; if (j < 0 || j >= H) continue; const u = a[y] - sa, v = b[j] - sb; n += u * v; ca += u * u; cb += v * v; }
  return n / Math.sqrt(ca * cb || 1);
};
console.log(`# Streifen ${w}x${h}@${l},${t}   Abstand ${dt}s`);
for (let i = 1; i < P.length; i++) {
  let best = -2, bd = 0;
  for (let d = -70; d <= 70; d++) { const c = corr(P[0], P[i], d); if (c > best) { best = c; bd = d; } }
  console.log(
    files[i].split(/[\\/]/).pop().padEnd(12),
    `Versatz ${String(bd).padStart(4)} px  (r=${best.toFixed(3)})  ->  ${(bd / (dt * i)).toFixed(2)} px/s`,
  );
}
