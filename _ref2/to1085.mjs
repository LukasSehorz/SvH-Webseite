/**
 * Unser 1440er Bild auf den Maszstab der Referenz bringen.
 *
 * Die Referenz ist 1100 Bildpunkte breit, ihre SEITE aber nur 1085, weil
 * rechts die Bildlaufleiste steht. Bei uns ist es genauso: 1440 Fenster,
 * 1425 Seite. Erst wenn beide auf dieselbe Seitenbreite gebracht sind,
 * sind Helligkeits- und Rasterwerte vergleichbar.
 *
 *   node _ref2/to1085.mjs <ein.png> <aus.png>
 */
import sharp from 'sharp';
const [src, dst] = process.argv.slice(2);
const meta = await sharp(src).metadata();
const pageW = meta.width - 15;
const scale = 1085 / pageW;
await sharp(src)
  .extract({ left: 0, top: 0, width: pageW, height: meta.height })
  .resize({ width: 1085, height: Math.round(meta.height * scale), kernel: 'lanczos3' })
  .png()
  .toFile(dst);
console.log(JSON.stringify({ src, dst, pageW, out: `1085x${Math.round(meta.height * scale)}` }));
