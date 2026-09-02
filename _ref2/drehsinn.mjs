/**
 * Der DREHSINN, in dem die Sprossen im Bild umlaufen.
 *
 *   node _ref2/drehsinn.mjs <ordner> <x,y,b,h>
 *
 * Gemessen wird die vorherrschende Richtung der Streifen ueber den
 * Strukturtensor, also ueber die Ableitungen des Bildes. Der Winkel wird in
 * Grad gegen die Waagerechte gegeben, mit der Bildachse y nach UNTEN; ein
 * wachsender Winkel bedeutet damit eine Drehung IM UHRZEIGERSINN, so wie
 * der Betrachter sie sieht.
 *
 * Das Fenster gehoert in den offenen Faecher und nicht auf die Kreuzung,
 * denn an der Kreuzung laufen die Sprossen zusammen und tragen keine
 * eindeutige Richtung mehr.
 */
import fs from 'fs';
import { grau, hochpass } from './mess/lib.mjs';

const DIR = process.argv[2];
const [X, Y, B, H] = (process.argv[3] || '1150,300,200,200').split(',').map(Number);

const dateien = fs.statSync(DIR).isDirectory()
  ? fs.readdirSync(DIR).filter((n) => /\.png$/.test(n)).sort().map((n) => `${DIR}/${n}`)
  : [DIR];

console.log('bild                          streifenwinkel   (grad gegen die waagerechte, y nach unten)');
for (const pfad of dateien) {
  const { g, b, h } = await grau(pfad);
  const hp = hochpass(g, b, h, 5);
  let jxx = 0, jyy = 0, jxy = 0;
  for (let y = Y + 1; y < Y + H - 1; y++) {
    for (let x = X + 1; x < X + B - 1; x++) {
      const gx = (hp[y * b + x + 1] - hp[y * b + x - 1]) * 0.5;
      const gy = (hp[(y + 1) * b + x] - hp[(y - 1) * b + x]) * 0.5;
      jxx += gx * gx; jyy += gy * gy; jxy += gx * gy;
    }
  }
  // Die Richtung der GERINGSTEN Aenderung ist die Richtung der Streifen.
  // Sie steht senkrecht auf dem groeszten Eigenvektor des Tensors.
  const winkelGradient = 0.5 * Math.atan2(2 * jxy, jxx - jyy);
  let streifen = ((winkelGradient + Math.PI / 2) * 180) / Math.PI;
  while (streifen > 90) streifen -= 180;
  while (streifen <= -90) streifen += 180;
  const staerke = Math.sqrt((jxx - jyy) ** 2 + 4 * jxy * jxy) / Math.max(1e-6, jxx + jyy);
  console.log(`${pfad.padEnd(30)} ${streifen.toFixed(1).padStart(7)}   guete ${staerke.toFixed(2)}`);
}
