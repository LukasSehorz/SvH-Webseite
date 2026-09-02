/**
 * Wo im Bild stehen gelbe Bildpunkte?
 *
 *   node _ref2/gelbjagd.mjs <bild> [marke]
 *
 * Gesucht sind Bildpunkte mit einem Farbton zwischen 30 und 90 Grad, die
 * hell genug sind, um im Gewebe aufzufallen. Ausgegeben werden ihre Zahl,
 * ihre Lage als Schwerpunkt und Streuung sowie eine grobe Karte ueber
 * Kacheln von hundert mal hundert Bildpunkten. Nur so laeszt sich pruefen,
 * ob das Gelb wie vermutet an der Kreuzung sitzt, wo sich die meisten
 * Punkte ueberlagern.
 */
import sharp from 'sharp';

const F = process.argv[2];
const MARKE = process.argv[3] || F;
const VMIN = Number(process.env.V || 120);

const hsv = (r, g, b) => {
  const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m;
  let h = 0;
  if (d) {
    if (M === r) h = 60 * (((g - b) / d) % 6);
    else if (M === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, M ? d / M : 0, M];
};

const { data, info } = await sharp(F).raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width, Ht = info.height;
const KACHEL = 100;
const kx = Math.ceil(W / KACHEL), ky = Math.ceil(Ht / KACHEL);
const karte = new Array(kx * ky).fill(0);
let n = 0, sx = 0, sy = 0;
const proben = [];
for (let y = 0; y < Ht; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const [h, s, v] = hsv(r, g, b);
    if (v < VMIN) continue;
    if (h < 30 || h >= 90) continue;
    // Ein nahezu grauer Bildpunkt traegt keinen sichtbaren Farbton.
    if (s < 0.12) continue;
    n++; sx += x; sy += y;
    karte[Math.floor(y / KACHEL) * kx + Math.floor(x / KACHEL)]++;
    if (proben.length < 12) proben.push([x, y, r, g, b, Math.round(h), s.toFixed(2), v]);
  }
}
console.log(`\n== ${MARKE}  ${W}x${Ht}  v>=${VMIN}  s>=0.12 ==`);
console.log(`gelbe bildpunkte 30-90 grad: ${n} (${((100 * n) / (W * Ht)).toFixed(4)}% des bildes)`);
if (n) {
  console.log(`schwerpunkt x=${Math.round(sx / n)} y=${Math.round(sy / n)}`);
  console.log('proben x,y,r,g,b,h,s,v:');
  for (const p of proben) console.log('   ' + p.join(', '));
  console.log('karte je 100x100, nur kacheln mit treffern:');
  for (let j = 0; j < ky; j++) {
    let z = '';
    for (let i = 0; i < kx; i++) {
      const c = karte[j * kx + i];
      z += (c ? String(c) : '.').padStart(6);
    }
    if (/\d/.test(z)) console.log(`  y=${String(j * KACHEL).padStart(4)} ${z}`);
  }
}
