/** Senkrechtes Helligkeitsprofil einer schmalen Saeule ganz links.
 *  node _ref2/saeule.mjs <bild> [x] [breite] */
import sharp from 'sharp';
const [file, xs, bs] = process.argv.slice(2);
const X = Number(xs ?? 24), BW = Number(bs ?? 66);
const meta = await sharp(file).metadata();
const { data, info } = await sharp(file)
  .extract({ left: X, top: 0, width: BW, height: meta.height })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const out = [];
for (let y = 0; y < info.height; y += 25) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let yy = y; yy < Math.min(y + 25, info.height); yy++)
    for (let x = 0; x < info.width; x++) {
      const i = (yy * info.width + x) * C; r += data[i]; g += data[i+1]; b += data[i+2]; n++;
    }
  out.push(`${String(y).padStart(4)}:${(r/n).toFixed(0)}/${(g/n).toFixed(0)}/${(b/n).toFixed(0)}`);
}
console.log(out.join('  '));
