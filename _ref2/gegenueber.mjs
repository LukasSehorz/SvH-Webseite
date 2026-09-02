/**
 * Unsere Nahaufnahme und die der Referenz nebeneinander in EIN Bild.
 *
 *   node _ref2/gegenueber.mjs <unser.png> <ziel.png>
 *
 * Links steht ein Ausschnitt aus _ref2/vid28/v040.jpg, rechts derselbe
 * Ausschnitt unseres Standes, beide mit nearest vergroeszert, damit die
 * einzelnen Punkte als Bloecke stehen bleiben und die Glaettung nichts
 * verschmiert. Dazwischen laeuft ein schmaler Trennstreifen.
 *
 * Der Maszstab ist NICHT identisch, denn v040 ist eine im Browser
 * vergroeszerte Aufnahme und unser Bild steht auf Seitenmaszstab. Der
 * Vergleich taugt deshalb fuer den CHARAKTER des Gewebes, also fuer
 * Korngroesze im Verhaeltnis zum Reihenabstand, fuer Farbe, fuer die
 * Streuung zwischen benachbarten Punkten und fuer die Frage, ob die
 * Struktur einen Rand hat oder sich im Grund verliert.
 */
import sharp from 'sharp';

const UNSER = process.argv[2];
const ZIEL = process.argv[3] || '_ref2/tmp/gegenueber.png';

const H = 620;
const B = 520;

const links = await sharp('_ref2/vid28/v040.jpg')
  .extract({ left: 700, top: 0, width: 400, height: 476 })
  .resize({ width: B, height: H, kernel: 'nearest' })
  .toBuffer();

const meta = await sharp(UNSER).metadata();
const rechts = await sharp(UNSER)
  .extract({
    left: Math.max(0, Math.min(880, meta.width - 400)),
    top: Math.max(0, Math.min(90, meta.height - 476)),
    width: Math.min(400, meta.width),
    height: Math.min(476, meta.height),
  })
  .resize({ width: B, height: H, kernel: 'nearest' })
  .toBuffer();

await sharp({
  create: {
    width: B * 2 + 12,
    height: H,
    channels: 3,
    background: { r: 90, g: 90, b: 96 },
  },
})
  .composite([
    { input: links, left: 0, top: 0 },
    { input: rechts, left: B + 12, top: 0 },
  ])
  .png()
  .toFile(ZIEL);

console.log(`${ZIEL}   links Referenz v040, rechts unser Stand`);
