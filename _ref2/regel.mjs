/**
 * Modell der Regelflaeche, damit sich die Geometrie ohne Browser einstellen laeszt.
 *
 * Es rechnet dieselbe Kette wie der Vertex-Shader von DnaBand.tsx, also
 * Ringe, gerade Erzeugende, Kippung, Fluchtung, Neigung und Maszstab, und
 * malt das Ergebnis als einfaches Punktbild. Dazu liefert es die beiden
 * rechnerischen Zusicherungen, naemlich die Fadenlaengen und den Abstand
 * jedes Zwischenpunktes von der Verbindungsgeraden seiner Endpunkte.
 *
 *   node _ref2/regel.mjs [schluessel=wert ...] --out datei.png
 *
 * Der Aufruf ohne Argumente nimmt die Werte, die in DnaBand.tsx stehen.
 */
import sharp from 'sharp';

const P = {
  W: 1425, H: 900,
  cx: 0.74, cy: 0.493,
  R: 7.0,            // Ringhalbmesser in Welteinheiten
  HALB: 9.4,         // halber Ringabstand laengs der Achse
  TWIST: 2.95,       // Gesamtverdrehung zwischen den beiden Ringen im Bogenmasz
  NF: 260,           // Zahl der Faeden
  NP: 620,           // Punkte je Faden
  tilt: 0.20,
  lean: 0.07,
  cam: 16.0,
  unit: 128.25,
  spin: 0.0,
  shift: 0.0,        // Weltversatz laengs der Achse, positiv schiebt nach unten
  splat: 1.6,
  gain: 1.0,
  out: '_ref2/tmp/rf/modell.png',
};

for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^-?-?([A-Za-z_]+)=(.+)$/);
  if (!m) continue;
  const k = m[1];
  P[k] = k === 'out' ? m[2] : Number(m[2]);
}

const alpha = P.TWIST / 2;

function welt(i, t) {
  const th = (i / P.NF) * 2 * Math.PI + P.spin;
  const a0 = th - alpha;
  const a1 = th + alpha;
  const ax = P.R * Math.cos(a0), az = P.R * Math.sin(a0);
  const bx = P.R * Math.cos(a1), bz = P.R * Math.sin(a1);
  return {
    x: ax + t * (bx - ax),
    y: -P.HALB + t * (2 * P.HALB) + P.shift,
    z: az + t * (bz - az),
  };
}

const ct = Math.cos(P.tilt), st = Math.sin(P.tilt);
const cl = Math.cos(P.lean), sl = Math.sin(P.lean);
const CX = P.cx * P.W, CY = P.cy * P.H;

function bild(p) {
  const qy = p.y * ct - p.z * st;
  const qz = p.y * st + p.z * ct;
  const tiefe = P.cam - qz;
  if (tiefe < 0.35) return null;
  const persp = P.cam / tiefe;
  const fx = -p.x, fy = qy;
  const rx = fx * cl - fy * sl, ry = fx * sl + fy * cl;
  return { x: CX + rx * persp * P.unit, y: CY + ry * persp * P.unit, persp };
}

/* ---- Zusicherung eins: alle Faeden gleich lang ---------------------- */
let lmin = Infinity, lmax = -Infinity;
for (let i = 0; i < P.NF; i += 1) {
  const a = welt(i, 0), b = welt(i, 1);
  const l = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  lmin = Math.min(lmin, l); lmax = Math.max(lmax, l);
}

/* ---- Zusicherung zwei: alle Punkte eines Fadens auf einer Geraden ---- */
let kollMax = 0;
for (let i = 0; i < P.NF; i += 4) {
  const a = welt(i, 0), b = welt(i, 1);
  const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const dl = Math.hypot(d.x, d.y, d.z);
  for (let j = 1; j < P.NP - 1; j += 1) {
    const t = j / (P.NP - 1);
    const p = welt(i, t);
    const v = { x: p.x - a.x, y: p.y - a.y, z: p.z - a.z };
    const c = {
      x: v.y * d.z - v.z * d.y,
      y: v.z * d.x - v.x * d.z,
      z: v.x * d.y - v.y * d.x,
    };
    kollMax = Math.max(kollMax, Math.hypot(c.x, c.y, c.z) / dl);
  }
}

/* ---- Bild --------------------------------------------------------- */
const acc = new Float32Array(P.W * P.H);
let sichtbar = 0;
const r = Math.ceil(P.splat * 2);
for (let i = 0; i < P.NF; i += 1) {
  for (let j = 0; j < P.NP; j += 1) {
    const t = j / (P.NP - 1);
    const b = bild(welt(i, t));
    if (!b) continue;
    if (b.x < -20 || b.x > P.W + 20 || b.y < -20 || b.y > P.H + 20) continue;
    sichtbar += 1;
    const x0 = Math.round(b.x), y0 = Math.round(b.y);
    for (let dy = -r; dy <= r; dy += 1) {
      const y = y0 + dy;
      if (y < 0 || y >= P.H) continue;
      for (let dx = -r; dx <= r; dx += 1) {
        const x = x0 + dx;
        if (x < 0 || x >= P.W) continue;
        const d2 = (x - b.x) ** 2 + (y - b.y) ** 2;
        acc[y * P.W + x] += P.gain * Math.exp(-d2 / (2 * P.splat * P.splat));
      }
    }
  }
}

const px = Buffer.alloc(P.W * P.H * 3);
for (let k = 0; k < P.W * P.H; k += 1) {
  const v = Math.min(255, Math.round(28 + acc[k] * 150));
  px[k * 3] = Math.min(255, Math.round(v * 0.82));
  px[k * 3 + 1] = Math.min(255, Math.round(v * 0.74));
  px[k * 3 + 2] = v;
}
await sharp(px, { raw: { width: P.W, height: P.H, channels: 3 } })
  .png()
  .toFile(P.out);

/* ---- Kennzahlen der Silhouette ------------------------------------- */
function kante(zeile) {
  let lo = Infinity, hi = -Infinity;
  for (let x = 0; x < P.W; x += 1) if (acc[zeile * P.W + x] > 0.05) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
  return [lo, hi];
}
const zeilen = [40, 200, 400, 450, 500, 700, 860];
const sil = zeilen.map((z) => {
  const [lo, hi] = kante(z);
  return `${z}: ${lo === Infinity ? '-' : ((lo / P.W) * 100).toFixed(1)} .. ${hi < 0 ? '-' : ((hi / P.W) * 100).toFixed(1)}`;
});

/* ---- Punktabstaende an drei Stellen -------------------------------- */
function abstaende(zielY) {
  // naechster Punkt laengs des Fadens und naechster Nachbarfaden
  let best = null;
  for (let i = 0; i < P.NF; i += 1) {
    for (let j = 0; j < P.NP; j += 1) {
      const t = j / (P.NP - 1);
      const b = bild(welt(i, t));
      if (!b) continue;
      if (Math.abs(b.y - zielY) > 4) continue;
      if (b.x < P.W * 0.62 || b.x > P.W * 0.80) continue;
      const b2 = bild(welt(i, (j + 1) / (P.NP - 1)));
      const b3 = bild(welt(i + 1 < P.NF ? i + 1 : 0, t));
      if (!b2 || !b3) continue;
      const laengs = Math.hypot(b2.x - b.x, b2.y - b.y);
      const quer = Math.hypot(b3.x - b.x, b3.y - b.y);
      if (!best) best = { laengs, quer, n: 1 };
      else { best.laengs += laengs; best.quer += quer; best.n += 1; }
    }
  }
  if (!best) return 'keine Punkte';
  return `laengs ${(best.laengs / best.n).toFixed(2)} px, quer ${(best.quer / best.n).toFixed(2)} px`;
}

console.log(JSON.stringify({
  punkte: P.NF * P.NP,
  sichtbar,
  fadenlaenge: { min: lmin.toFixed(9), max: lmax.toFixed(9), spanne: (lmax - lmin).toExponential(3) },
  kollinearitaet_max: kollMax.toExponential(3),
  taillenhalbmesser_welt: (P.R * Math.abs(Math.cos(alpha))).toFixed(4),
  ringhalbmesser_px: (P.R * P.unit).toFixed(1),
  halbe_bandlaenge_px: (P.HALB * Math.cos(P.tilt) * P.unit).toFixed(1),
  kegelwinkel_grad: ((Math.atan((P.R * Math.sin(alpha)) / P.HALB) * 180) / Math.PI).toFixed(1),
  silhouette: sil,
  abstand_oben: abstaende(200),
  abstand_unten: abstaende(700),
  out: P.out,
}, null, 1));
