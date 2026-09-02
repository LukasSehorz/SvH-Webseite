// Zwei Ausschnitte nebeneinander, vergroeszert, ohne jede Bearbeitung.
//
//   node _ref2/lupe2.mjs <a.png> <b.png> <x> <y> <b> <h> <faktor> <ziel.png>
import sharp from 'sharp';

const [A, B, X, Y, BB, HH, F, OUT] = [
  process.argv[2], process.argv[3],
  +process.argv[4], +process.argv[5], +process.argv[6], +process.argv[7],
  +(process.argv[8] || 4), process.argv[9] || '_ref2/tmp/lupe2.png',
];

async function teil(f) {
  return sharp(f)
    .extract({ left: X, top: Y, width: BB, height: HH })
    .resize(BB * F, HH * F, { kernel: 'nearest' })
    .png().toBuffer();
}
const a = await teil(A), b = await teil(B);
const W = BB * F, H = HH * F, LUECKE = 16;
await sharp({
  create: { width: W * 2 + LUECKE, height: H, channels: 3, background: { r: 120, g: 0, b: 0 } },
})
  .composite([{ input: a, left: 0, top: 0 }, { input: b, left: W + LUECKE, top: 0 }])
  .png().toFile(OUT);
console.log(`${OUT}   links ${A}   rechts ${B}   ausschnitt ${X},${Y},${BB},${HH} mal ${F}`);
