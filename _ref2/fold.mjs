/** Hoehe der hellen Falte (Kantenstellung des Bandes) im Bild.
 *  Sie ist der direkte Ablesewert fuer den Drehwinkel: die Falte wandert
 *  HEIGHT*cos(TILT)*uUnit/(TURNS*2pi) Bildpunkte je Bogenmasz.
 *   node _ref2/fold.mjs <bild...> --crop=l,t,w,h */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const [l, t, w, h] = (flags.crop || '940,80,480,800').split(',').map(Number);
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const { data, info } = await sharp(f).extract({ left: l, top: t, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // Je Zeile die Summe der 30 hellsten Punkte
  const raw = new Float64Array(H);
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) row.push(data[y * W + x]);
    row.sort((a, b) => b - a);
    let s = 0; for (let i = 0; i < 30; i++) s += row[i];
    raw[y] = s / 30;
  }
  // ueber 15 Zeilen glaetten
  const sm = new Float64Array(H);
  for (let y = 0; y < H; y++) {
    let s = 0, n = 0;
    for (let k = -7; k <= 7; k++) { const j = y + k; if (j >= 0 && j < H) { s += raw[j]; n++; } }
    sm[y] = s / n;
  }
  let by = 0, bv = -1;
  for (let y = 0; y < H; y++) if (sm[y] > bv) { bv = sm[y]; by = y; }
  console.log(f.split(/[\\/]/).pop().padEnd(20),
    JSON.stringify({ foldY: t + by, peak: +bv.toFixed(1) }));
}
