/**
 * Reihe C: Nahaufnahmen. Aus a0, a1400, a2800 je einen 400x400-Ausschnitt
 * aus dem dichtesten Gewebebereich schneiden und auf 1100x1100 mit
 * kernel:'nearest' vergroeszern.
 *
 * Dichte = mittlere Helligkeit einer 200x200-Kachel, rechts der Bildmitte.
 * Der 400x400-Ausschnitt liegt zentriert auf der dichtesten Kachel,
 * geklemmt auf die Bildgrenzen.
 *
 *   node _ref2/naharbeit.mjs
 */
import sharp from 'sharp';

const QUELLEN = [
  ['a0', '_ref2/unser/a0.png', '_ref2/unser/c0.png'],
  ['a1400', '_ref2/unser/a1400.png', '_ref2/unser/c1400.png'],
  ['a2800', '_ref2/unser/a2800.png', '_ref2/unser/c2800.png'],
];

const TILE = 200;
const CROP = 400;
const ZIEL = 1100;

for (const [tag, src, dst] of QUELLEN) {
  const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const cols = Math.floor(width / TILE);
  const rows = Math.floor(height / TILE);
  const midX = width / 2;

  let beste = null;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const x0 = cx * TILE;
      const y0 = cy * TILE;
      const centerX = x0 + TILE / 2;
      if (centerX <= midX) continue; // nur rechts der Bildmitte
      let sum = 0;
      for (let y = y0; y < y0 + TILE; y++) {
        for (let x = x0; x < x0 + TILE; x++) {
          sum += data[y * width + x];
        }
      }
      const mean = sum / (TILE * TILE);
      if (!beste || mean > beste.mean) {
        beste = { cx, cy, x0, y0, centerX, centerY: y0 + TILE / 2, mean };
      }
    }
  }

  const left = Math.min(Math.max(Math.round(beste.centerX - CROP / 2), 0), width - CROP);
  const top = Math.min(Math.max(Math.round(beste.centerY - CROP / 2), 0), height - CROP);

  await sharp(src)
    .extract({ left, top, width: CROP, height: CROP })
    .resize(ZIEL, ZIEL, { kernel: 'nearest' })
    .toFile(dst);

  console.log(
    `${tag}: Kachel col=${beste.cx} row=${beste.cy} (x ${beste.x0}-${beste.x0 + TILE}, y ${beste.y0}-${beste.y0 + TILE}), ` +
    `mittlere Helligkeit ${beste.mean.toFixed(1)} -> Ausschnitt left=${left} top=${top} ${CROP}x${CROP} -> ${dst}`,
  );
}
