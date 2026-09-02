/** Senkrechte Verschiebung zwischen zwei Bildern (Kreuzkorrelation).
 *   node _ref2/shift.mjs <a> <b> --crop=l,t,w,h --max=200 */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const [fa, fb] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [l, t, w, h] = (flags.crop || '0,0,400,600').split(',').map(Number);
const maxd = parseInt(flags.max || '200', 10);
const load = async (f) => {
  const { data, info } = await sharp(f).extract({ left: l, top: t, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  // Zeilenmittel als Signatur
  const sig = new Float64Array(info.height);
  for (let y = 0; y < info.height; y++) {
    let s = 0; for (let x = 0; x < info.width; x++) s += data[y * info.width + x];
    sig[y] = s / info.width;
  }
  const m = sig.reduce((a, b) => a + b, 0) / sig.length;
  for (let i = 0; i < sig.length; i++) sig[i] -= m;
  return sig;
};
const A = await load(fa), B = await load(fb);
let best = 0, bv = -2;
for (let d = -maxd; d <= maxd; d++) {
  let n = 0, a2 = 0, b2 = 0, c = 0;
  for (let y = 0; y < A.length; y++) {
    const yb = y + d;
    if (yb < 0 || yb >= B.length) continue;
    n += A[y] * B[yb]; a2 += A[y] * A[y]; b2 += B[yb] * B[yb]; c++;
  }
  if (c < A.length * 0.6) continue;
  const r = n / Math.sqrt(a2 * b2 || 1);
  if (r > bv) { bv = r; best = d; }
}
console.log(JSON.stringify({ a: fa.split(/[\\/]/).pop(), b: fb.split(/[\\/]/).pop(), shiftY: best, corr: +bv.toFixed(3) }));
