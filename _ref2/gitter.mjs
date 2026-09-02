/**
 * Das GITTER eines Gewebefensters, gemessen ueber die zweidimensionale
 * Autokorrelation statt nur ueber die beiden Achsen.
 *
 * Der Grund fuer dieses Werkzeug. Eine Messung, die nur die Zeile dy = 0
 * und die Spalte dx = 0 der Autokorrelation absucht, kann ein achsparallel
 * stehendes Gitter nicht von einem stark gescherten unterscheiden. Ein
 * Gitter mit den Basisvektoren (15, 0) und (0, 5) und eines mit (15, 0)
 * und (3, 5) liefern beide waagerecht einen Gipfel bei 15 und senkrecht
 * einen Kamm bei 5, sehen im Bild aber voellig verschieden aus: das erste
 * als senkrechte Perlenschnuere mit breiten Gassen, das zweite als flach
 * diagonal laufendes dichtes Gewebe.
 *
 * Gesucht sind deshalb die beiden KUERZESTEN Gittervektoren in der vollen
 * Ebene der Verschiebungen. Der kuerzeste ist die Richtung, in der die
 * Punkte zu Ketten zusammenlaufen, der zweitkuerzeste die Richtung von
 * einer Kette zur naechsten.
 *
 *   node _ref2/gitter.mjs <bild> <l> <t> <w> <h> [label]
 */
import sharp from 'sharp';

const [file, l, t, w, h, label] = process.argv.slice(2);
const L = +l, T = +t, W = +w, H = +h;
const LAG = 26;

const { data, info } = await sharp(file)
  .extract({ left: L, top: T, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;

const lum = new Float64Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

/* Hochpass. Der Grund unter dem Gewebe hat einen weiten Verlauf und
 * wuerde die Autokorrelation sonst mit einem breiten Berg ueberdecken,
 * auf dem die Gitterspitzen kaum noch auffallen. Abgezogen wird ein
 * quadratischer Mittelwert ueber ein Fenster von 15 Bildpunkten, das ist
 * deutlich weiter als jede erwartete Rasterweite. */
const R = 7;
const glatt = new Float64Array(W * H);
{
  const zeile = new Float64Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let k = -R; k <= R; k++) { const j = x + k; if (j >= 0 && j < W) { s += lum[y * W + j]; n++; } }
    zeile[y * W + x] = s / n;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let k = -R; k <= R; k++) { const j = y + k; if (j >= 0 && j < H) { s += zeile[j * W + x]; n++; } }
    glatt[y * W + x] = s / n;
  }
}
const f = new Float64Array(W * H);
for (let i = 0; i < W * H; i++) f[i] = lum[i] - glatt[i];

/* Normierte Autokorrelation ueber alle Verschiebungen bis LAG. Es genuegt
 * die obere Haelfte, weil ac(-d) gleich ac(d) ist. */
const AW = 2 * LAG + 1;
const ac = new Float64Array(AW * AW);
const at = (dx, dy) => ac[(dy + LAG) * AW + (dx + LAG)];

for (let dy = 0; dy <= LAG; dy++) {
  for (let dx = -LAG; dx <= LAG; dx++) {
    let s = 0, sa = 0, sb = 0, n = 0;
    const y0 = Math.max(0, -dy), y1 = Math.min(H, H - dy);
    const x0 = Math.max(0, -dx), x1 = Math.min(W, W - dx);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const a = f[y * W + x], b = f[(y + dy) * W + (x + dx)];
        s += a * b; sa += a * a; sb += b * b; n++;
      }
    }
    const v = n > 0 && sa > 0 && sb > 0 ? s / Math.sqrt(sa * sb) : 0;
    ac[(dy + LAG) * AW + (dx + LAG)] = v;
    ac[(-dy + LAG) * AW + (-dx + LAG)] = v;
  }
}

/* Alle oertlichen Hoechstwerte der Autokorrelation auszerhalb eines
 * kleinen Kerns um den Ursprung. Der Kern muss weg, weil dort der Gipfel
 * der Selbstueberdeckung steht. */
const kandidaten = [];
for (let dy = -LAG + 1; dy <= LAG - 1; dy++) {
  for (let dx = -LAG + 1; dx <= LAG - 1; dx++) {
    const r = Math.hypot(dx, dy);
    if (r < 2.5 || r > LAG - 1) continue;
    const v = at(dx, dy);
    if (v < 0.06) continue;
    let top = true;
    for (let jy = -1; jy <= 1 && top; jy++) for (let jx = -1; jx <= 1; jx++) {
      if (jx === 0 && jy === 0) continue;
      if (at(dx + jx, dy + jy) > v) { top = false; break; }
    }
    if (!top) continue;
    /* Feinlage ueber eine Parabel durch die drei Werte je Achse. */
    const px = at(dx + 1, dy) - at(dx - 1, dy);
    const qx = 2 * v - at(dx + 1, dy) - at(dx - 1, dy);
    const py = at(dx, dy + 1) - at(dx, dy - 1);
    const qy = 2 * v - at(dx, dy + 1) - at(dx, dy - 1);
    const fx = dx + (qx > 1e-9 ? 0.5 * px / qx : 0);
    const fy = dy + (qy > 1e-9 ? 0.5 * py / qy : 0);
    kandidaten.push({ dx: fx, dy: fy, v, r: Math.hypot(fx, fy) });
  }
}
kandidaten.sort((a, b) => a.r - b.r);

/* Der erste Basisvektor ist der kuerzeste Gipfel in der oberen Halbebene,
 * damit nicht beide Vorzeichen desselben Vektors gezaehlt werden. */
const halb = kandidaten.filter((k) => k.dy > 0.2 || (Math.abs(k.dy) <= 0.2 && k.dx > 0));
const b1 = halb[0];
/* Der zweite ist der kuerzeste, der nicht fast parallel zum ersten liegt.
 * Gemessen wird der Flaecheninhalt des aufgespannten Parallelogramms; er
 * muss mindestens ein Drittel des Produkts der Laengen erreichen, sonst
 * ist es nur ein weiterer Punkt derselben Kette. */
let b2 = null;
if (b1) {
  for (const k of halb.slice(1)) {
    const kreuz = Math.abs(b1.dx * k.dy - b1.dy * k.dx);
    if (kreuz > 0.33 * b1.r * k.r) { b2 = k; break; }
  }
}

/* Punktdichte ueber oertliche Hoechstwerte der geglaetteten Helligkeit. */
const s3 = new Float64Array(W * H);
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  let s = 0;
  for (let jy = -1; jy <= 1; jy++) for (let jx = -1; jx <= 1; jx++) s += lum[(y + jy) * W + (x + jx)];
  s3[y * W + x] = s / 9;
}
const sortiert = Float64Array.from(lum).sort();
const grund = sortiert[Math.floor(0.10 * sortiert.length)];
const spitzen = [];
for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
  const v = s3[y * W + x];
  if (v < grund + 6) continue;
  let top = true;
  for (let jy = -1; jy <= 1 && top; jy++) for (let jx = -1; jx <= 1; jx++) {
    if (jx === 0 && jy === 0) continue;
    if (s3[(y + jy) * W + (x + jx)] > v) { top = false; break; }
  }
  if (top) spitzen.push([x, y]);
}
/* Mittlerer Abstand zum naechsten Nachbarn. */
let sumNN = 0;
for (const [x, y] of spitzen) {
  let best = 1e9;
  for (const [x2, y2] of spitzen) {
    if (x2 === x && y2 === y) continue;
    const d = (x2 - x) ** 2 + (y2 - y) ** 2;
    if (d < best) best = d;
  }
  if (best < 1e9) sumNN += Math.sqrt(best);
}

const grad = (v) => (Math.atan2(-v.dy, v.dx) * 180 / Math.PI).toFixed(1);
const zeig = (v) => v
  ? `(${v.dx.toFixed(2)},${v.dy.toFixed(2)}) |${v.r.toFixed(2)}| ${grad(v)}deg ac=${v.v.toFixed(3)}`
  : '-';

console.log(`${(label || `${file} ${L},${T}`).padEnd(26)}`
  + ` b1=${zeig(b1)}  b2=${zeig(b2)}`
  + `  zellflaeche=${b1 && b2 ? Math.abs(b1.dx * b2.dy - b1.dy * b2.dx).toFixed(1) : '-'}`
  + `  spitzen=${spitzen.length} nnAbst=${(sumNN / Math.max(1, spitzen.length)).toFixed(2)}`);
console.log('  weitere gipfel: ' + halb.slice(0, 8).map(zeig).join(' | '));
