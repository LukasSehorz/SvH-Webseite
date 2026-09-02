/**
 * Zwei Bilder mit demselben Gitter uebereinander, damit sich Formen
 * unmittelbar vergleichen lassen.
 *
 *   node _ref2/gegen.mjs <oben.png> <unten.png> <ziel.png> [breite]
 *
 * Beide Bilder werden auf dieselbe Breite gebracht und mit einem Gitter von
 * hundert zu hundert Bildpunkten versehen.
 */
import sharp from 'sharp';

const A = process.argv[2];
const B = process.argv[3];
const OUT = process.argv[4] || '_ref2/tmp/rf/gegen.png';
const W = Number(process.argv[5] || 1200);

function gitter(w, h) {
  let s = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;
  for (let x = 0; x < w; x += 100) {
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#00ff66" stroke-width="1" opacity="0.4"/>`;
    s += `<text x="${x + 3}" y="13" fill="#00ff66" font-size="12" font-family="monospace">${x}</text>`;
  }
  for (let y = 0; y < h; y += 100) {
    s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#00ff66" stroke-width="1" opacity="0.4"/>`;
    s += `<text x="3" y="${y + 13}" fill="#00ff66" font-size="12" font-family="monospace">${y}</text>`;
  }
  return Buffer.from(s + '</svg>');
}

async function auf(datei) {
  const b = await sharp(datei).resize(W).toBuffer();
  const m = await sharp(b).metadata();
  return { buf: await sharp(b).composite([{ input: gitter(W, m.height) }]).toBuffer(), h: m.height };
}

const a = await auf(A);
const b = await auf(B);
await sharp({ create: { width: W, height: a.h + b.h + 6, channels: 3, background: { r: 20, g: 20, b: 24 } } })
  .composite([{ input: a.buf, left: 0, top: 0 }, { input: b.buf, left: 0, top: a.h + 6 }])
  .png()
  .toFile(OUT);
console.log(OUT);
