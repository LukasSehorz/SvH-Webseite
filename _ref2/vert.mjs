/** Helligkeitsverteilung in einem Fenster, als Perzentile.
 *  node _ref2/vert.mjs <bild> <l> <t> <w> <h> <label> */
import sharp from 'sharp';
const [f, l, t, w, h, lab] = process.argv.slice(2);
const { data, info } = await sharp(f).extract({ left: +l, top: +t, width: +w, height: +h })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels, N = info.width * info.height;
const lum = new Float32Array(N);
for (let i = 0; i < N; i++) lum[i] = 0.299*data[i*C] + 0.587*data[i*C+1] + 0.114*data[i*C+2];
const s = Float32Array.from(lum).sort();
const p = (q) => s[Math.min(N-1, Math.floor(q*N))].toFixed(1);
console.log(`${(lab||f).padEnd(16)} p02=${p(.02)} p05=${p(.05)} p10=${p(.10)} p25=${p(.25)} p50=${p(.50)} p75=${p(.75)} p90=${p(.90)} p99=${p(.99)}`);
