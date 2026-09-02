/** Rasterabstand: Autokorrelation in x und y ueber einen Gewebe-Ausschnitt.
 *   node _ref2/pitch.mjs <bild> --crop=l,t,w,h */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
for (const file of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const [l, t, w, h] = (flags.crop || '0,0,300,300').split(',').map(Number);
  const { data, info } = await sharp(file).extract({ left: l, top: t, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let mean = 0; for (let i = 0; i < data.length; i++) mean += data[i]; mean /= data.length;
  const ac = (dx, dy) => {
    let n = 0, a2 = 0, b2 = 0;
    for (let y = 0; y + dy < H; y++) for (let x = 0; x + dx < W; x++) {
      const a = data[y * W + x] - mean, b = data[(y + dy) * W + x + dx] - mean;
      n += a * b; a2 += a * a; b2 += b * b;
    }
    return +(n / Math.sqrt(a2 * b2 || 1)).toFixed(3);
  };
  const ax = [], ay = [];
  for (let d = 1; d <= 14; d++) { ax.push(ac(d, 0)); ay.push(ac(0, d)); }
  const peak = (arr) => { let bi = 0, bv = -2; for (let i = 1; i < arr.length; i++) if (arr[i] > arr[i - 1] && arr[i] >= (arr[i + 1] ?? -2) && arr[i] > bv) { bv = arr[i]; bi = i + 1; } return { lag: bi, v: bv }; };
  console.log(file.split(/[\\/]/).pop().padEnd(13), 'mean', mean.toFixed(1),
    '| x', JSON.stringify(ax), 'peakX', JSON.stringify(peak(ax)),
    '| y', JSON.stringify(ay), 'peakY', JSON.stringify(peak(ay)));
}
