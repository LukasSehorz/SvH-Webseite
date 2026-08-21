/**
 * Ausschnitt aus einem Screenshot vergroessern, um Typo-Groessen zu messen.
 *   node _ref/crop.mjs <in.png> <x> <y> <w> <h> <out.png> [scale]
 */
import sharp from 'sharp';
const [inp, x, y, w, h, out, scale = '2'] = process.argv.slice(2);
const s = Number(scale);
await sharp(inp)
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize({ width: Math.round(+w * s), kernel: 'nearest' })
  .toFile(out);
console.log('ok', out);
