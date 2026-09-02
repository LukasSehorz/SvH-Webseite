/** Waagerechter Helligkeitsschnitt, ueber wenige Zeilen gemittelt.
 *  node _ref2/schnitt.mjs <bild> <l> <t> <w> <zeilen> <label> */
import sharp from 'sharp';
const [f, l, t, w, zs, lab] = process.argv.slice(2);
const Z = Number(zs || 3);
const { data, info } = await sharp(f).extract({ left: +l, top: +t, width: +w, height: Z })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const out = [];
for (let x = 0; x < info.width; x++) {
  let s = 0;
  for (let y = 0; y < Z; y++) { const i = (y*info.width+x)*C; s += 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]; }
  out.push((s/Z).toFixed(0).padStart(3));
}
console.log(`${lab}\n${out.join(' ')}`);
