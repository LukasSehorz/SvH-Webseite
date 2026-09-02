/**
 * Fuenffachvergroeszerung eines Ausschnitts, mit nearest neighbour,
 * damit einzelne Bildpunkte als Bloecke sichtbar bleiben.
 *   node _ref2/lupe.mjs <ein.png> <aus.png> <l> <t> <b> <h> [faktor]
 */
import sharp from 'sharp';
const [src, dst, l, t, w, h, f] = process.argv.slice(2);
const k = Number(f || 5);
await sharp(src)
  .extract({ left: +l, top: +t, width: +w, height: +h })
  .resize({ width: +w * k, height: +h * k, kernel: 'nearest' })
  .png()
  .toFile(dst);
console.log(dst);
