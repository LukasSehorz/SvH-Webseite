// Legt Aufnahmen nebeneinander: node scripts/strip.mjs <ordner> <ziel.jpg> <breite je Bild> 00 01 02 ...
import sharp from "sharp";
const [, , dir, out, wArg, ...names] = process.argv;
const w = +wArg;
const imgs = await Promise.all(names.map((n) => sharp(`${dir}/${n}.png`).resize({ width: w }).toBuffer({ resolveWithObject: true })));
const h = Math.max(...imgs.map((i) => i.info.height));
await sharp({ create: { width: w * imgs.length + 8 * (imgs.length - 1), height: h, channels: 3, background: "#ff00ff" } })
  .composite(imgs.map((i, k) => ({ input: i.data, left: k * (w + 8), top: 0 })))
  .jpeg({ quality: 82 })
  .toFile(out);
