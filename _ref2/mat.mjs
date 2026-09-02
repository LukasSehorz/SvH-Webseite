/**
 * Materialmessung. Alles, was der Pruefbericht zum Gewebe erhebt, in
 * einem Durchlauf, damit nach jedem Bauschritt dieselben Zahlen auf
 * demselben Weg entstehen.
 *
 *   node _ref2/mat.mjs <bild.png> <l> <t> <w> <h> [label]
 *
 * Ausgegeben werden
 *   sockel   das 5. Perzentil im Fenster, also der Grund unter dem Gewebe
 *   p99 p999 die beiden oberen Perzentile, absolut und ueber dem Sockel
 *   bed      Bedeckung ueber Sockel plus 8
 *   viel     Anteil ueber Sockel plus 70
 *   dx dy    Punktabstand waagerecht und senkrecht aus der Autokorrelation
 *   ak1 ak12 Autokorrelation bei Versatz 1 und 12
 *   ringe    Radialprofil um die Punktmittelpunkte, Abstand 0 bis 6
 *   toene    Farbtonverteilung der leuchtenden Punkte
 */
import sharp from 'sharp';

const [file, cx, cy, cw, chh, label] = process.argv.slice(2);
const L = +cx, T = +cy, W = +cw, H = +chh;
const { data, info } = await sharp(file)
  .extract({ left: L, top: T, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;

const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const sorted = Float32Array.from(lum).sort();
const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const sockel = pct(0.05);
const p99 = pct(0.99), p999 = pct(0.999);
const maxV = sorted[sorted.length - 1];
let bed = 0, viel = 0;
for (let i = 0; i < lum.length; i++) {
  if (lum[i] > sockel + 8) bed++;
  if (lum[i] > sockel + 70) viel++;
}

/* Autokorrelation der um ihren Mittelwert bereinigten Helligkeit. */
let mean = 0;
for (let i = 0; i < lum.length; i++) mean += lum[i];
mean /= lum.length;
const dev = new Float32Array(W * H);
for (let i = 0; i < lum.length; i++) dev[i] = lum[i] - mean;
const ac = (ox, oy) => {
  let s = 0, a = 0, b = 0;
  for (let y = 0; y < H - oy; y++) for (let x = 0; x < W - ox; x++) {
    const u = dev[y * W + x], v = dev[(y + oy) * W + (x + ox)];
    s += u * v; a += u * u; b += v * v;
  }
  return s / Math.sqrt(a * b || 1);
};
const acH = [], acV = [];
for (let k = 0; k <= 24; k++) { acH.push(ac(k, 0)); acV.push(ac(0, k)); }
/* Der Rasterabstand ist der ERSTE Nebengipfel nach der ersten Talsohle,
 * nicht der hoechste ueberhaupt. Bei einem Gewebe mit zwei Perioden
 * liegt der hoechste Wert sonst auf einem Vielfachen der feinen Periode
 * und die Zahl beschreibt gar nichts. */
const peak = (arr) => {
  let k = 1;
  while (k < arr.length - 1 && arr[k + 1] < arr[k]) k++;
  for (; k < arr.length - 1; k++)
    if (arr[k] > arr[k - 1] && arr[k] >= arr[k + 1]) return k;
  return -1;
};

/* Punktmittelpunkte: oertliche Hoechstwerte deutlich ueber dem Sockel.
 * Die Schwelle haengt am Kontrast des Fensters, sonst zaehlt ein flaches
 * Feld sein eigenes Rauschen als Gewebe mit. */
const schwelle = sockel + Math.max(6, 0.22 * (p99 - sockel));
const peaks = [];
for (let y = 7; y < H - 7; y++) for (let x = 7; x < W - 7; x++) {
  const v = lum[y * W + x];
  if (v < schwelle) continue;
  let top = true;
  for (let dy = -1; dy <= 1 && top; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    if (lum[(y + dy) * W + (x + dx)] > v) { top = false; break; }
  }
  if (top) peaks.push([x, y]);
}
/* Radialprofil: Mittel je ganzzahligem Abstand um die Gipfel. */
const rs = new Float64Array(7), rn = new Float64Array(7);
for (const [px, py] of peaks) {
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const r = Math.round(Math.hypot(dx, dy));
    if (r > 6) continue;
    rs[r] += lum[(py + dy) * W + (px + dx)]; rn[r]++;
  }
}
const ring = [];
for (let r = 0; r <= 6; r++) ring.push(rn[r] ? rs[r] / rn[r] : 0);
/* Die Delle ist der Abstand vom Randniveau zum tiefsten Ringwert. */
let dell = 0;
for (let r = 1; r <= 4; r++) dell = Math.max(dell, ring[6] - ring[r]);

/* Mittlerer Punktabstand nach der Zaehldefinition des Pruefberichts:
 * die Wurzel aus Fensterflaeche geteilt durch Punktzahl. Sie ist von der
 * Richtung unabhaengig und damit die einzige Groesze, die sich zwischen
 * zwei verschieden gedrehten Gewebeausschnitten vergleichen laeszt. */
const mittl = peaks.length ? Math.sqrt((W * H) / peaks.length) : 0;

/* Farbton der leuchtenden Punkte. */
const toepfe = new Array(6).fill(0);
let sat = 0, satN = 0, weiss = 0;
for (const [px, py] of peaks) {
  const i = (py * W + px) * C;
  const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const d = mx - mn;
  if (mx <= 0) continue;
  const s = d / mx;
  sat += s; satN++;
  if (s < 0.12) weiss++;
  if (d <= 0) continue;
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  if (h >= 180 && h < 210) toepfe[0]++;
  else if (h >= 210 && h < 240) toepfe[1]++;
  else if (h >= 240 && h < 270) toepfe[2]++;
  else if (h >= 270 && h < 300) toepfe[3]++;
  else if (h >= 300 && h < 330) toepfe[4]++;
  else toepfe[5]++;
}
const tSum = toepfe.reduce((a, b) => a + b, 0) || 1;

const f1 = (v) => v.toFixed(1);
console.log(`# ${label || file}  Fenster ${L},${T},${W},${H}  Gipfel ${peaks.length}`);
console.log(`sockel=${f1(sockel)} p99=${f1(p99)} p999=${f1(p999)} max=${f1(maxV)}`
  + ` | ueberSockel p99=${f1(p99 - sockel)} p999=${f1(p999 - sockel)}`
  + ` | bed(+8)=${f1((bed / lum.length) * 100)}% viel(+70)=${f1((viel / lum.length) * 100)}%`);
console.log(`raster dx=${peak(acH)} dy=${peak(acV)} ak1=${acH[1].toFixed(3)}/${acV[1].toFixed(3)}`
  + ` ak12=${acH[12].toFixed(3)}/${acV[12].toFixed(3)}`
  + ` | punkte=${peaks.length} mittlAbstand=${mittl.toFixed(2)}`);
if (process.env.AK) {
  console.log('akH ' + acH.map((v) => v.toFixed(2)).join(' '));
  console.log('akV ' + acV.map((v) => v.toFixed(2)).join(' '));
}
console.log(`ringe ${ring.map(f1).join('  ')}   delle=${f1(dell)}`);
console.log(`toene 180-210=${f1((toepfe[0] / tSum) * 100)} 210-240=${f1((toepfe[1] / tSum) * 100)}`
  + ` 240-270=${f1((toepfe[2] / tSum) * 100)} 270-300=${f1((toepfe[3] / tSum) * 100)}`
  + ` 300-330=${f1((toepfe[4] / tSum) * 100)} rest=${f1((toepfe[5] / tSum) * 100)}`
  + ` | saett=${satN ? (sat / satN).toFixed(2) : '-'} weiss=${f1((weiss / (peaks.length || 1)) * 100)}%`);
