/**
 * Die FARBLOSEN hellen Bildpunkte im Gewebe.
 *
 *   node _ref2/farblos.mjs <bild> [marke]
 *
 * Das ist die Messung zum Befund des Auftraggebers, unser Gewebe trage
 * gelbe Punkte. Im Farbtonraum ist davon nichts zu finden, denn ueber das
 * ganze Bild liegt kein einziger Bildpunkt zwischen 30 und 120 Grad. Was
 * er sieht, sind FARBLOSE Punkte in einem blauvioletten Feld; das Auge
 * liest einen unbunten Fleck vor buntem Grund im Gegenfarbton, und der
 * Gegenfarbton zu Blauviolett ist Gelb.
 *
 * Gezaehlt wird deshalb, wie viele helle Bildpunkte kaum Saettigung
 * tragen. Getrennt nach Faecher und Kreuzung, denn an der Kreuzung
 * bleicht auch die Referenz aus, im Faecher dagegen nicht.
 *
 * Der Bereich ist bewusst eng gefaszt. Die Bildlaufleiste am rechten Rand
 * und die Kopfzeile mit ihren weiszen Schaltflaechen sind selbst unbunt
 * und wuerden die Zaehlung sonst beherrschen.
 */
import sharp from 'sharp';

const F = process.argv[2];
const MARKE = process.argv[3] || F;
const VMIN = Number(process.env.V || 150);
const SMAX = Number(process.env.S || 0.10);

const { data, info } = await sharp(F).raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width;

// Das Gewebe steht rechts, die Bildlaufleiste beginnt bei 1425.
const X0 = 830, X1 = 1420, Y0 = 100, Y1 = 880;
// Die Kreuzung wird getrennt gezaehlt. Dort bleicht auch die Referenz aus,
// und das ist gewollt.
const KX = Number(process.argv[4] || 1035), KY = Number(process.argv[5] || 509), KR = 90;

let hell = 0, farblos = 0, farblosFaecher = 0, farblosKreuz = 0;
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const M = Math.max(r, g, b), m = Math.min(r, g, b);
    if (M < VMIN) continue;
    hell++;
    if ((M - m) / M >= SMAX) continue;
    farblos++;
    if (Math.hypot(x - KX, y - KY) <= KR) farblosKreuz++; else farblosFaecher++;
  }
}
console.log(
  `${MARKE.padEnd(16)} helle bildpunkte ${String(hell).padStart(6)}   ` +
  `farblos gesamt ${String(farblos).padStart(5)} (${((100 * farblos) / hell).toFixed(2)}%)   ` +
  `davon kreuzung ${String(farblosKreuz).padStart(5)}   ` +
  `FAECHER ${String(farblosFaecher).padStart(5)} (${((100 * farblosFaecher) / hell).toFixed(2)}% der hellen)`,
);
