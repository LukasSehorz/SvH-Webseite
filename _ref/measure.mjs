/**
 * Misst die Bounding-Box "markanter" Pixel (z. B. Markenblau) in einem Ausschnitt.
 *   node _ref/measure.mjs <in.png> <x> <y> <w> <h> [r,g,b] [tol]
 */
import sharp from 'sharp';
const [inp, x, y, w, h, rgb = '31,143,216', tol = '70'] = process.argv.slice(2);
const [tr, tg, tb] = rgb.split(',').map(Number);
const t = Number(tol);
const { data, info } = await sharp(inp)
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .raw()
  .toBuffer({ resolveWithObject: true });
const ch = info.channels;
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0;
const cols = new Array(info.width).fill(0);
const rows = new Array(info.height).fill(0);
for (let yy = 0; yy < info.height; yy++) {
  for (let xx = 0; xx < info.width; xx++) {
    const i = (yy * info.width + xx) * ch;
    const hit =
      rgb === 'blue'
        ? data[i + 2] - data[i] > t
        : Math.abs(data[i] - tr) + Math.abs(data[i + 1] - tg) + Math.abs(data[i + 2] - tb) < t;
    if (hit) {
      n++; cols[xx]++; rows[yy]++;
      if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
      if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
    }
  }
}
console.log(JSON.stringify({
  count: n,
  box: n ? { x: +x + minX, y: +y + minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null,
  rowProfile: rows.map((v, i) => (v ? `${i}:${v}` : null)).filter(Boolean).join(' '),
}, null, 1));
