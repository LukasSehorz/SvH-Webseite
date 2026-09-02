/** Blockvergleich zweier Bilder in einem Fenster: welcher ganzzahlige
 *  Versatz macht sie am aehnlichsten?
 *  node _ref2/wandern.mjs <a.png> <b.png> <l> <t> <w> <h> [spanne] */
import sharp from 'sharp';
const [fa, fb, l, t, w, h, sp] = process.argv.slice(2);
const S = Number(sp || 6);
const hol = async (f) => {
  const { data, info } = await sharp(f)
    .extract({ left: +l - S, top: +t - S, width: +w + 2*S, height: +h + 2*S })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels, N = info.width * info.height;
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) lum[i] = 0.299*data[i*C]+0.587*data[i*C+1]+0.114*data[i*C+2];
  return { lum, W: info.width };
};
const A = await hol(fa), B = await hol(fb);
const W = +w, H = +h, BW = A.W;
let best = null;
for (let dy = -S; dy <= S; dy++) for (let dx = -S; dx <= S; dx++) {
  let sa = 0, sb = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    sa += A.lum[(y+S)*BW + (x+S)];
    sb += B.lum[(y+S+dy)*BW + (x+S+dx)]; n++;
  }
  const ma = sa/n, mb = sb/n;
  let num = 0, da = 0, db = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = A.lum[(y+S)*BW + (x+S)] - ma;
    const v = B.lum[(y+S+dy)*BW + (x+S+dx)] - mb;
    num += u*v; da += u*u; db += v*v;
  }
  const r = num / Math.sqrt(da*db || 1);
  if (!best || r > best.r) best = { dx, dy, r };
}
console.log(`${fa.split(/[\/]/).pop()} -> ${fb.split(/[\/]/).pop()}  dx=${best.dx} dy=${best.dy} r=${best.r.toFixed(3)}`);
