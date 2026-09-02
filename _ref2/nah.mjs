/**
 * Kennzahlen einer Nahaufnahme, gebaut fuer den Vergleich unseres Standes
 * mit _ref2/vid28/v040.jpg.
 *
 *   node _ref2/nah.mjs <bild.jpg|png> <l> <t> <w> <h> [marke]
 *
 * Ausgegeben werden die Perzentilleiter ueber dem Sockel, der Anteil
 * weiszer und gesaettigter Bildpunkte, die Verteilung der Farbtoene in
 * Toepfen von dreiszig Grad, sowie die Punktgroesze und der Reihenabstand
 * aus der Autokorrelation. Die Punktgroesze kommt aus der mittleren Flaeche
 * zusammenhaengender Gebiete oberhalb des halben Gipfels.
 */
import sharp from 'sharp';

const F = process.argv[2];
const L = Number(process.argv[3] || 0);
const T = Number(process.argv[4] || 0);
const W = Number(process.argv[5] || 300);
const H = Number(process.argv[6] || 300);
const MARKE = process.argv[7] || F;

const { data, info } = await sharp(F).raw().toBuffer({ resolveWithObject: true });
const C = info.channels;

const w = Math.min(W, info.width - L);
const h = Math.min(H, info.height - T);
const N = w * h;

const lum = new Float64Array(N);
const px = [];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = ((y + T) * info.width + (x + L)) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    lum[y * w + x] = 0.299 * r + 0.587 * g + 0.114 * b;
    px.push([r, g, b]);
  }
}

const sort = Float64Array.from(lum).sort();
const P = (q) => sort[Math.min(N - 1, Math.floor(q * N))];
const sockel = P(0.05);
const leiter = [0.05, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]
  .map((q) => `p${String(q * 100).replace('.', ',')}=${(P(q) - sockel).toFixed(1)}`)
  .join(' ');

// Farbton und Saettigung nur der LEUCHTENDEN Bildpunkte, also derer, die
// mindestens zwoelf Stufen ueber dem Sockel stehen. Darunter liegt Grund.
const toepfe = new Array(12).fill(0);
let leucht = 0, weisz = 0, satSum = 0;
for (let k = 0; k < N; k++) {
  if (lum[k] - sockel < 12) continue;
  const [r, g, b] = px[k];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const s = mx === 0 ? 0 : (mx - mn) / mx;
  leucht += 1; satSum += s;
  if (s < 0.12) weisz += 1;
  let hgr = 0;
  const d = mx - mn;
  if (d > 0) {
    if (mx === r) hgr = 60 * (((g - b) / d) % 6);
    else if (mx === g) hgr = 60 * ((b - r) / d + 2);
    else hgr = 60 * ((r - g) / d + 4);
  }
  if (hgr < 0) hgr += 360;
  toepfe[Math.floor(hgr / 30) % 12] += 1;
}

// Punktgroesze aus der Flaeche zusammenhaengender heller Gebiete. Die
// Schwelle liegt auf der Mitte zwischen Sockel und dem 99. Perzentil,
// damit sie unabhaengig von der Gesamthelligkeit dieselbe Stelle der
// Punktflanke trifft.
const schwelle = sockel + 0.5 * (P(0.99) - sockel);
const mark = new Int32Array(N).fill(-1);
let gebiete = 0, flaeche = 0;
const stapel = [];
for (let k = 0; k < N; k++) {
  if (lum[k] < schwelle || mark[k] >= 0) continue;
  let gr = 0;
  stapel.push(k); mark[k] = gebiete;
  while (stapel.length) {
    const c = stapel.pop(); gr += 1;
    const cx = c % w, cy = (c / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const nk = ny * w + nx;
      if (mark[nk] >= 0 || lum[nk] < schwelle) continue;
      mark[nk] = gebiete; stapel.push(nk);
    }
  }
  gebiete += 1; flaeche += gr;
}

// Reihenabstand aus der Autokorrelation der Helligkeit laengs beider
// Achsen. Gesucht ist der erste Gipfel jenseits von zwei Bildpunkten.
const korr = (achse) => {
  const mit = sort.reduce((a, b) => a + b, 0) / N;
  const best = [];
  for (let d = 2; d < 40; d++) {
    let s = 0, n = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = achse === 0 ? x + d : x, ny = achse === 0 ? y : y + d;
      if (nx >= w || ny >= h) continue;
      s += (lum[y * w + x] - mit) * (lum[ny * w + nx] - mit); n += 1;
    }
    best.push([d, s / n]);
  }
  for (let i = 1; i < best.length - 1; i++) {
    if (best[i][1] > best[i - 1][1] && best[i][1] >= best[i + 1][1] && best[i][1] > 0) return best[i][0];
  }
  return 0;
};

console.log(`### ${MARKE}  fenster ${L},${T},${w},${h}`);
console.log(`  sockel      ${sockel.toFixed(1)}   mittel ${(sort.reduce((a, b) => a + b, 0) / N).toFixed(1)}   max ${sort[N - 1].toFixed(1)}`);
console.log(`  leiter      ${leiter}`);
console.log(`  leuchtend   ${((leucht / N) * 100).toFixed(1)}% der flaeche   weisz ${leucht ? ((weisz / leucht) * 100).toFixed(2) : '0'}% davon   saettigung ${leucht ? (satSum / leucht).toFixed(3) : '0'}`);
console.log(`  punkte      ${gebiete} gebiete   mittlere flaeche ${gebiete ? (flaeche / gebiete).toFixed(2) : 0} px   bedeckung ${((flaeche / N) * 100).toFixed(2)}%`);
console.log(`  abstand     waagerecht ${korr(0)} px   senkrecht ${korr(1)} px`);
const namen = ['0-30 rot', '30-60', '60-90', '90-120 gruen', '120-150', '150-180', '180-210 cyan', '210-240 blau', '240-270 blauviolett', '270-300 violett', '300-330 magenta', '330-360'];
const zeile = toepfe.map((v, i) => (v / Math.max(1, leucht)) * 100)
  .map((v, i) => (v >= 0.5 ? `${namen[i]}=${v.toFixed(1)}%` : null))
  .filter(Boolean).join('  ');
console.log(`  farbtoene   ${zeile}`);
