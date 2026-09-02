/**
 * Der Grund im freien linken Feld, an drei Stuetzstellen senkrecht.
 *
 * Gemessen wird der MITTELWERT je Kanal in einem schmalen Fenster ganz
 * links, wo weder Gewebe noch Schrift steht. Die Referenz traegt dort an
 * allen drei Stellen dieselbe Farbe; unsere Flaeche schwankte stark, und
 * genau diese Schwankung ist der Mangel.
 *
 *   node _ref2/grund.mjs <bild.png> <label> [xLinks] [breite]
 */
import sharp from 'sharp';

const [file, label, xl, bw] = process.argv.slice(2);
const X = Number(xl ?? 24);
const BW = Number(bw ?? 66);
const meta = await sharp(file).metadata();
const H = meta.height;

/* Die Referenzbilder tragen oben die Browserleiste, deshalb beginnt das
 * Feld erst bei 52 Bildpunkten. Erkannt wird das an der Bildbreite: die
 * Referenz ist 1100 breit, unsere Aufnahmen 1440. */
const top = meta.width === 1100 ? 52 : 0;
const nutz = H - top;

const stellen = [
  ['oben', top + Math.round(nutz * 0.10)],
  ['mitte', top + Math.round(nutz * 0.50)],
  ['unten', top + Math.round(nutz * 0.88)],
];

const out = [];
const bmr = [];
for (const [name, y] of stellen) {
  const { data, info } = await sharp(file)
    .extract({ left: X, top: Math.min(y, H - 40), width: BW, height: 34 })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  let r = 0, g = 0, b = 0;
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) { r += data[i * C]; g += data[i * C + 1]; b += data[i * C + 2]; }
  r /= n; g /= n; b /= n;
  out.push(`${name}=${r.toFixed(1)}/${g.toFixed(1)}/${b.toFixed(1)} b-r=${(b - r).toFixed(1)}`);
  bmr.push(r);
}
const spanne = Math.max(...bmr) - Math.min(...bmr);
console.log(`${(label || file).padEnd(20)} ${out.join('  |  ')}  ||  senkrechteSchwankungRot=${spanne.toFixed(1)}`);
