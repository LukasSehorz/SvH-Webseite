/**
 * Wie unruhig ist der Grund der REFERENZ dort, wo sie kleine Schrift auf
 * ihr Gewebe stellt?
 *
 *   node _ref2/pr-refgrund.mjs <bild> <l>,<t>,<w>,<h> <label> [...]
 *
 * Gemessen wird in Baendern ZWISCHEN den Zeilen und unmittelbar darueber
 * und darunter, denn die Schrift der Referenz laeszt sich nicht
 * ausblenden. Ausgegeben werden Mittelwert, Streuung, hellster Bildpunkt
 * und das 99,9. Perzentil, also dieselben Groeszen wie bei uns.
 */
import sharp from 'sharp';

const args = process.argv.slice(2);
for (let i = 0; i + 2 < args.length + 1; i += 3) {
  const file = args[i];
  const [l, t, w, h] = args[i + 1].split(',').map(Number);
  const label = args[i + 2];
  const { data, info } = await sharp(file)
    .extract({ left: l, top: t, width: w, height: h })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const werte = [];
  let mx = 0;
  for (let k = 0; k < w * h; k++) {
    const L = 0.299 * data[k * C] + 0.587 * data[k * C + 1] + 0.114 * data[k * C + 2];
    werte.push(L); if (L > mx) mx = L;
  }
  const m = werte.reduce((a, b) => a + b, 0) / werte.length;
  const sd = Math.sqrt(werte.reduce((a, b) => a + (b - m) ** 2, 0) / werte.length);
  const so = werte.slice().sort((a, b) => a - b);
  const p999 = so[Math.min(so.length - 1, Math.floor(0.999 * so.length))];
  console.log(`${label.padEnd(30)} grund=${m.toFixed(1).padStart(6)} streuung=${sd.toFixed(1).padStart(5)}`
    + ` max=${mx.toFixed(0).padStart(4)} p999=${p999.toFixed(0).padStart(4)}`
    + (sd > 3 ? '  STREUUNG' : '') + (mx > 120 ? '  GRUNDMAX' : ''));
}
