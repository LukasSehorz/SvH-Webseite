/**
 * Laenge des Halses und Oeffnungswinkel der Faecher.
 *
 * Dieselbe Hochfrequenzmaske wie krit-tex, aber mit 4er-Zellen, damit die
 * Aufloesung laengs der Achse fuer eine Strecke von rund 50 Bildpunkten
 * ueberhaupt reicht. Je Zellzeile wird die halbe Gewebebreite bestimmt.
 * Der Hals ist die zusammenhaengende Strecke um das Minimum, auf der die
 * halbe Breite unter dem 1,6-fachen des Minimums bleibt. Alle Laengen
 * werden auf den Maszstab 1440 umgerechnet, weil die Vorgabe dort steht.
 *
 *   node _ref2/hals.mjs <bild> <l> <t> <w> <h> [label]
 */
import sharp from 'sharp';
const [file, cx, cy, cw, chh, label] = process.argv.slice(2);
const { data, info } = await sharp(file)
  .extract({ left: +cx, top: +cy, width: +cw, height: +chh })
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const CS = 4;
const gw = Math.floor(W / CS), gh = Math.floor(H / CS);
const mask = new Uint8Array(gw * gh);
for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
  let s = 0, n = 0, mx = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) for (let x = gx * CS; x < gx * CS + CS; x++) {
    const v = lum[y * W + x]; s += v; n++; if (v > mx) mx = v;
  }
  const m = s / n;
  let cross = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) {
    let prev = lum[y * W + gx * CS] > m;
    for (let x = gx * CS + 1; x < gx * CS + CS; x++) { const c = lum[y * W + x] > m; if (c !== prev) cross++; prev = c; }
  }
  mask[gy * gw + gx] = (cross >= 3 && mx - m > 4) ? 1 : 0;
}

// Halbe Breite je Zellzeile ueber die Streuung um den Schwerpunkt.
const half = new Float64Array(gh);
for (let gy = 0; gy < gh; gy++) {
  let tot = 0, ws = 0;
  for (let x = 0; x < gw; x++) { tot += mask[gy * gw + x]; ws += mask[gy * gw + x] * x; }
  if (tot < 2) { half[gy] = NaN; continue; }
  const ax = ws / tot;
  let v = 0;
  for (let x = 0; x < gw; x++) v += mask[gy * gw + x] * (x - ax) ** 2;
  half[gy] = Math.sqrt(v / tot) * CS; // in Bildpunkten des Eingangsbildes
}
// glaetten ueber drei Zellzeilen, damit einzelne Luecken nicht zaehlen
const sm = new Float64Array(gh);
for (let gy = 0; gy < gh; gy++) {
  let a = 0, n = 0;
  for (let k = -1; k <= 1; k++) { const j = gy + k; if (j >= 0 && j < gh && !Number.isNaN(half[j])) { a += half[j]; n++; } }
  sm[gy] = n ? a / n : NaN;
}

// Minimum nur im mittleren Drittel suchen, die Bildraender laufen leer.
let mi = -1;
for (let gy = Math.floor(gh * 0.2); gy < Math.floor(gh * 0.8); gy++)
  if (!Number.isNaN(sm[gy]) && (mi < 0 || sm[gy] < sm[mi])) mi = gy;

const TO1440 = 1440 / W;
// Die Schwelle haengt an der LAPPENBREITE, nicht am Minimum selbst.
// Sonst waechst die gemessene Halslaenge mit, sobald die Taille etwas
// weiter wird, und ein kuerzerer Hals liest faelschlich als laengerer.
const farRows = [];
for (let d = Math.round(60 / TO1440 / CS); d <= Math.round(120 / TO1440 / CS); d++) {
  for (const j of [mi - d, mi + d]) if (j >= 0 && j < gh && !Number.isNaN(sm[j])) farRows.push(sm[j]);
}
farRows.sort((x, y) => x - y);
const hFar = farRows[Math.floor(farRows.length / 2)] || sm[mi] * 4;
const lim = sm[mi] + 0.2 * (hFar - sm[mi]);
let a = mi, b = mi;
while (a > 0 && !Number.isNaN(sm[a - 1]) && sm[a - 1] <= lim) a--;
while (b < gh - 1 && !Number.isNaN(sm[b + 1]) && sm[b + 1] <= lim) b++;
const halsPx = (b - a + 1) * CS * TO1440;

// Oeffnungswinkel: ueber die naechsten 90 Bildpunkte (Maszstab 1440)
// oberhalb und unterhalb des Halses.
const span = Math.round(90 / TO1440 / CS);
const ang = (from, dir) => {
  const to = from + dir * span;
  if (to < 0 || to >= gh || Number.isNaN(sm[to]) || Number.isNaN(sm[from])) return NaN;
  return (Math.atan2(sm[to] - sm[from], span * CS) * 180) / Math.PI;
};

console.log(`${(label || file).padEnd(20)} taille y=${((mi * CS + CS / 2) / H * 100).toFixed(1)}%`
  + ` halbeBreite=${(sm[mi] / W * 100).toFixed(2)}% (${(sm[mi] * 2 / W * 100).toFixed(2)}% voll)`
  + ` hals=${halsPx.toFixed(0)}px@1440`
  + ` winkelOben=${ang(a, -1).toFixed(0)}gr winkelUnten=${ang(b, +1).toFixed(0)}gr`);
