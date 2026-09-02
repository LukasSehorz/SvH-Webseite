/**
 * Silhouette ueber die BEWEGUNG, nicht ueber die Textur.
 *
 * Der Grund und die Schrift stehen zwischen zwei Ruhebildern still, das
 * Gewebe fliesst. Wer also die groesste Helligkeitsaenderung ueber eine
 * Reihe von Ruhebildern nimmt, bekommt eine Gewebemaske, in der die
 * Schrift gar nicht erst vorkommt. Damit entfaellt die ganze Falle, die
 * hals.mjs und kante.mjs plagt.
 *
 *   node _ref2/dyn.mjs <l> <t> <w> <h> <label> <bild...>
 *
 * Ausgabe: linke und rechte Gewebekante sowie Achse in Prozent des
 * Fensters, Taillenhoehe, halbe Taillenbreite, Halslaenge und die
 * Oeffnungswinkel der beiden Faecher.
 */
import sharp from 'sharp';

const [cx, cy, cw, chh, label, ...files] = process.argv.slice(2);
const L = +cx, T = +cy, W = +cw, H = +chh;

const bufs = [];
for (const f of files) {
  const { data, info } = await sharp(f)
    .extract({ left: L, top: T, width: W, height: H })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++)
    lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];
  bufs.push(lum);
}

// Spannweite je Bildpunkt ueber alle Bilder.
const span = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  let lo = Infinity, hi = -Infinity;
  for (const b of bufs) { if (b[i] < lo) lo = b[i]; if (b[i] > hi) hi = b[i]; }
  span[i] = hi - lo;
}

// Zellweise mitteln, damit einzelne Punkte nicht entscheiden.
const CS = 4;
const gw = Math.floor(W / CS), gh = Math.floor(H / CS);
const cell = new Float32Array(gw * gh);
for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
  let s = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++)
    for (let x = gx * CS; x < gx * CS + CS; x++) s += span[y * W + x];
  cell[gy * gw + gx] = s / (CS * CS);
}

// Schwelle aus der Verteilung: der Grund rauscht kaum, das Gewebe stark.
const sorted = Float32Array.from(cell).slice().sort();
const q50 = sorted[Math.floor(sorted.length * 0.5)];
const q995 = sorted[Math.floor(sorted.length * 0.995)];
const THR = q50 + 0.16 * (q995 - q50);
const mask = new Uint8Array(gw * gh);
for (let i = 0; i < gw * gh; i++) mask[i] = cell[i] > THR ? 1 : 0;

// Halbe Breite, Achse, linke und rechte Kante je Zellzeile.
const half = new Float64Array(gh).fill(NaN);
const axis = new Float64Array(gh).fill(NaN);
const lft = new Float64Array(gh).fill(NaN);
const rgt = new Float64Array(gh).fill(NaN);
const cov = new Float64Array(gh);
for (let gy = 0; gy < gh; gy++) {
  let tot = 0, ws = 0;
  for (let x = 0; x < gw; x++) { tot += mask[gy * gw + x]; ws += mask[gy * gw + x] * x; }
  cov[gy] = tot / gw;
  if (tot < 3) continue;
  const ax = ws / tot;
  let v = 0;
  for (let x = 0; x < gw; x++) v += mask[gy * gw + x] * (x - ax) ** 2;
  half[gy] = Math.sqrt(v / tot) * CS;
  axis[gy] = ax * CS;
  let l = -1, r = -1;
  for (let x = 0; x < gw; x++) if (mask[gy * gw + x]) { if (l < 0) l = x; r = x; }
  lft[gy] = l * CS; rgt[gy] = (r + 1) * CS;
}

const sm = new Float64Array(gh).fill(NaN);
for (let gy = 0; gy < gh; gy++) {
  let a = 0, n = 0;
  for (let k = -1; k <= 1; k++) {
    const j = gy + k;
    if (j >= 0 && j < gh && !Number.isNaN(half[j])) { a += half[j]; n++; }
  }
  if (n) sm[gy] = a / n;
}

let mi = -1;
for (let gy = Math.floor(gh * 0.2); gy < Math.floor(gh * 0.8); gy++)
  if (!Number.isNaN(sm[gy]) && (mi < 0 || sm[gy] < sm[mi])) mi = gy;

const TO1440 = 1440 / W;
const farRows = [];
for (let d = Math.round(60 / TO1440 / CS); d <= Math.round(120 / TO1440 / CS); d++)
  for (const j of [mi - d, mi + d])
    if (j >= 0 && j < gh && !Number.isNaN(sm[j])) farRows.push(sm[j]);
farRows.sort((x, y) => x - y);
const hFar = farRows[Math.floor(farRows.length / 2)] || sm[mi] * 4;
const lim = sm[mi] + 0.2 * (hFar - sm[mi]);
let a = mi, b = mi;
while (a > 0 && !Number.isNaN(sm[a - 1]) && sm[a - 1] <= lim) a--;
while (b < gh - 1 && !Number.isNaN(sm[b + 1]) && sm[b + 1] <= lim) b++;
const halsPx = (b - a + 1) * CS * TO1440;

const span90 = Math.round(90 / TO1440 / CS);
const ang = (from, dir) => {
  const to = from + dir * span90;
  if (to < 0 || to >= gh || Number.isNaN(sm[to]) || Number.isNaN(sm[from])) return NaN;
  return (Math.atan2(sm[to] - sm[from], span90 * CS) * 180) / Math.PI;
};

const med = (arr) => {
  const s = arr.filter((v) => !Number.isNaN(v)).sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};
const bandVal = (arr, lo, hi) => {
  const out = [];
  for (let gy = Math.floor(gh * lo); gy < Math.floor(gh * hi); gy++) out.push(arr[gy]);
  return med(out);
};
const pc = (v) => (Number.isNaN(v) ? '   -' : ((v / W) * 100).toFixed(1));

// Bedeckung der beiden Lappen
const covBand = (lo, hi) => {
  let s = 0, n = 0;
  for (let gy = Math.floor(gh * lo); gy < Math.floor(gh * hi); gy++) { s += cov[gy]; n++; }
  return (s / n) * 100;
};
const cOb = covBand(0.04, 0.22), cUn = covBand(0.74, 0.93);

if (process.env.PROF) {
  console.log(`# ${label} profil  yPct  halbBreite%  links%  rechts%  achse%  bed%`);
  for (let gy = 0; gy < gh; gy += 4) {
    console.log(
      (((gy * CS) / H) * 100).toFixed(1).padStart(6),
      pc(sm[gy]).padStart(7), pc(lft[gy]).padStart(7),
      pc(rgt[gy]).padStart(7), pc(axis[gy]).padStart(7),
      (cov[gy] * 100).toFixed(1).padStart(6),
    );
  }
}
console.log(`${label.padEnd(16)} taille y=${(((mi * CS + CS / 2) / H) * 100).toFixed(1)}%`
  + ` halb=${pc(sm[mi])}% voll=${((sm[mi] * 2 / W) * 100).toFixed(2)}%`
  + ` hals=${halsPx.toFixed(0)}px@1440`
  + ` winkOben=${ang(a, -1).toFixed(0)}gr winkUnten=${ang(b, +1).toFixed(0)}gr`);
console.log(`${''.padEnd(16)} linksOben=${pc(bandVal(lft, 0.04, 0.22))} linksUnten=${pc(bandVal(lft, 0.74, 0.93))}`
  + ` rechtsOben=${pc(bandVal(rgt, 0.04, 0.22))} rechtsUnten=${pc(bandVal(rgt, 0.74, 0.93))}`
  + ` achseOben=${pc(bandVal(axis, 0.04, 0.22))} achseUnten=${pc(bandVal(axis, 0.74, 0.93))}`
  + ` achseTaille=${pc(axis[mi])}`
  + ` bedOben=${cOb.toFixed(1)} bedUnten=${cUn.toFixed(1)} verh=${(cUn / cOb).toFixed(2)}`);
