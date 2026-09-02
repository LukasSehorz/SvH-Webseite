/** Bewegungsenergie zwischen zwei Bildern, auf den Eigenkontrast des
 *  Gewebes normiert. Unabhaengig von Helligkeit und Maszstab.
 *   node _ref2/motion.mjs <a> <b> --crop=l,t,w,h */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [l, t, w, h] = (flags.crop || '0,0,400,600').split(',').map(Number);
const load = async (f) =>
  (await sharp(f).extract({ left: l, top: t, width: w, height: h }).greyscale()
    .raw().toBuffer({ resolveWithObject: true })).data;
for (let i = 0; i + 1 < files.length; i += 1) {
  const A = await load(files[i]), B = await load(files[i + 1]);
  let mad = 0, sd = 0, mean = 0;
  for (let k = 0; k < A.length; k++) mean += A[k];
  mean /= A.length;
  for (let k = 0; k < A.length; k++) { mad += Math.abs(A[k] - B[k]); sd += (A[k] - mean) ** 2; }
  mad /= A.length; sd = Math.sqrt(sd / A.length);
  console.log(
    files[i].split(/[\\/]/).pop().padEnd(12), '->', files[i + 1].split(/[\\/]/).pop().padEnd(12),
    JSON.stringify({ mad: +mad.toFixed(2), contrast: +sd.toFixed(2), motion: +(mad / (sd || 1)).toFixed(3) }),
  );
}
