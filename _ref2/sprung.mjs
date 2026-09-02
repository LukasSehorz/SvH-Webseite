/** Groeszter Sprung des Zeilenmittels ueber acht Zeilen in einem
 *  Spaltenbereich. Die Oberkante der Sektion liegt bei Zeile 350.
 *  node _ref2/sprung.mjs <bild> <x0> <breite> <label> */
import sharp from 'sharp';
const [f, x0, bw, lab] = process.argv.slice(2);
const { data, info } = await sharp(f).extract({ left: +x0, top: 240, width: +bw, height: 280 })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const zeile = [];
for (let y = 0; y < info.height; y++) {
  let b = 0;
  for (let x = 0; x < info.width; x++) b += data[(y*info.width+x)*C+2];
  zeile.push(b / info.width);
}
let max = 0, wo = 0;
for (let y = 0; y + 8 < zeile.length; y++) {
  const d = Math.abs(zeile[y+8] - zeile[y]);
  if (d > max) { max = d; wo = 240 + y; }
}
console.log(`${lab.padEnd(30)} groesterSprungBlau8Zeilen=${max.toFixed(1)} beiZeile=${wo}`
  + `  profil ${[0,40,80,110,120,130,160,200,260].map(o=>zeile[o].toFixed(0)).join(' ')}`);
