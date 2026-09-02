/**
 * Ein Ausschnitt in starker Vergroeszerung, zum ANSEHEN.
 *
 *   node _ref2/lupe6.mjs <bild> <x,y,b,h> <faktor> <ziel.png>
 *
 * Vergroeszert wird ohne Glaettung, damit jeder Bildpunkt als Quadrat
 * stehenbleibt und sich einzelne bunte Punkte im Feld erkennen lassen.
 * Die Zahlen allein reichen fuer diese Beurteilung nicht, denn eine
 * Verteilung kann rechnerisch stimmen und trotzdem einzelne auffaellige
 * Punkte enthalten.
 */
import sharp from 'sharp';

const F = process.argv[2];
const [X, Y, B, H] = (process.argv[3] || '1000,300,200,150').split(',').map(Number);
const K = Number(process.argv[4] || 6);
const AUS = process.argv[5] || '_ref2/tmp/lupe.png';

await sharp(F)
  .extract({ left: X, top: Y, width: B, height: H })
  .resize({ width: B * K, height: H * K, kernel: 'nearest' })
  .png()
  .toFile(AUS);
console.log(AUS);
