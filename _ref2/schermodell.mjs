/**
 * Modell des Abtastgitters im Bild, ohne die Seite aufzurufen.
 *
 * Es rechnet dieselbe Kette wie der Vertex-Shader, naemlich Flaeche,
 * Kippung, Fluchtung, Neigung und Maszstab, und liefert daraus die beiden
 * Gittervektoren im BILD. Damit laeszt sich eine Scherung anpassen, ohne
 * fuer jeden Versuch eine Aufnahme zu machen.
 *
 *   node _ref2/schermodell.mjs [A] [C] [N_U] [N_S]
 *
 * Die Sprossenzahlen sind Aufrufwerte, weil das Modell sonst nach jeder
 * Aenderung an DnaBand.tsx stillschweigend falsche Gitter liefert. Sie
 * standen einmal fest auf 184 und 124 und gehoerten damit zu einem Stand,
 * den es nicht mehr gibt.
 */
const RADIUS = 2.3, HEIGHT = 11.5, TILT = 0.24, CAM = 11.0;
const NECK_MIN = 0.08, NECK_SPAN = 0.048;
const TWIST_FAR = 2.2, TWIST_KNOT = 0.67, KNOT_SPAN = 0.05;
const PHASE0 = Math.PI / 2, LEAN = 0.07;
const N_U = Number(process.argv[4] ?? 192);
const N_S = Number(process.argv[5] ?? 100);
/* Maszstab und Mittelpunkt wie im Browser bei 1440 mal 900, danach auf
 * Referenzmaszstab gebracht. */
const uUnit = Math.max(900 * 0.075, Math.min(900 * 0.145, 1440 * 0.09));
const K1085 = 1085 / 1425;

const A = Number(process.argv[2] ?? -0.0827);
const C = Number(process.argv[3] ?? 0.0441);
/* Die Scherung ist PERIODISCH in der Bandkoordinate. Nur dann belegt
 * jede Bahn den Umlauf genau einmal und die Flaeche bleibt lueckenlos. */
const shear = (u) => A + C * Math.sin(2 * Math.PI * (u - 0.5));

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const neckAt = (u) => NECK_MIN + (1 - NECK_MIN) * smoothstep(0, NECK_SPAN, Math.abs(u - 0.5));
const twistAt = (d) => {
  const x = d / KNOT_SPAN;
  return TWIST_FAR * d + TWIST_KNOT * x / Math.sqrt(1 + x * x);
};

/* Ein Punkt der Flaeche im BILD, in Bildpunkten der Referenzseite. */
function bild(u, s) {
  const ug = u + shear(u) * s;
  const phi = PHASE0 + twistAt(ug - 0.5);
  const r = RADIUS * neckAt(ug) * s;
  const p = [r * Math.cos(phi), (ug - 0.5) * HEIGHT, r * Math.sin(phi)];
  const ct = Math.cos(TILT), st = Math.sin(TILT);
  const q = [p[0], p[1] * ct - p[2] * st, p[1] * st + p[2] * ct];
  const persp = CAM / (CAM - q[2]);
  const cl = Math.cos(LEAN), sl = Math.sin(LEAN);
  let fx = -q[0], fy = q[1];
  [fx, fy] = [fx * cl - fy * sl, fx * sl + fy * cl];
  return [fx * persp * uUnit * K1085, fy * persp * uUnit * K1085];
}

/* Die beiden Gittervektoren an der Stelle (u, s) ueber die Differenz zum
 * Nachbarpunkt in Sprossen- und in Bahnrichtung. */
function gitter(u, s) {
  const du = 1 / N_U, ds = 2 / (N_S - 1);
  const o = bild(u, s);
  const T = bild(u + du, s).map((v, i) => v - o[i]);
  const R = bild(u, s + ds).map((v, i) => v - o[i]);
  /* Auf das kuerzeste Paar reduzieren, denn im Bild sieht man die Kette
   * der naechsten Nachbarn und nicht die Erzeuger, mit denen gerechnet
   * wurde. Gesucht wird vollstaendig ueber alle kleinen ganzzahligen
   * Kombinationen, weil die Gauss-Reduktion bei fast gleich langen
   * Vektoren zwischen zwei Loesungen springt. */
  const kand = [];
  for (let m = -5; m <= 5; m++) for (let n = -5; n <= 5; n++) {
    if (m === 0 && n === 0) continue;
    const v = [m * R[0] + n * T[0], m * R[1] + n * T[1]];
    kand.push({ v, l: Math.hypot(v[0], v[1]) });
  }
  kand.sort((p, q) => p.l - q.l);
  let a = kand[0].v, b = null;
  for (const k of kand) {
    if (Math.abs(a[0] * k.v[1] - a[1] * k.v[0]) > 0.33 * kand[0].l * k.l) { b = k.v; break; }
  }
  if (!b) b = T.slice();
  const norm = (v) => (v[0] < 0 ? [-v[0], -v[1]] : v);
  a = norm(a); b = norm(b);
  const win = (v) => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;
  const len = (v) => Math.hypot(v[0], v[1]);
  return {
    b1: a, b2: b, w1: win(a), w2: win(b), l1: len(a), l2: len(b),
    flaeche: Math.abs(a[0] * b[1] - a[1] * b[0]),
  };
}

/* Die Bildhoehe, an der eine Bandkoordinate im Fenster steht, damit sich
 * die Zeilen mit den Meszfenstern der Referenz vergleichen lassen. */
const yVon = (u) => bild(u, 0)[1] + 900 * 0.493 * K1085;

console.log(`A=${A} C=${C} N_U=${N_U} N_S=${N_S}`
  + `   Ziel  b1 rund 3,6 Bildpunkte bei plus 15 bis 21 Grad,`
  + ` b2 rund 5,2 senkrecht, Flaeche rund 18,2`);
console.log('  u      y     s=-0.7                       s=0.0                        s=+0.7');
for (const u of [0.20, 0.28, 0.34, 0.42, 0.50, 0.58, 0.67, 0.75, 0.82]) {
  const teile = [-0.7, 0.0, 0.7].map((s) => {
    const g = gitter(u, s);
    return `${g.l1.toFixed(2)}/${g.w1.toFixed(0)}deg F${g.flaeche.toFixed(1)}`.padEnd(24);
  });
  console.log(`${u.toFixed(2)}  ${yVon(u).toFixed(0).padStart(4)}   ${teile.join(' ')}`);
}
/* Der Jacobi-Faktor der Scherung. Er sagt, um wieviel die Sprossen einer
 * Bahn dichter oder duenner stehen als ohne Scherung, und er muss ueber
 * die Helligkeit ausgeglichen werden. */
let jmin = 9, jmax = 0;
for (let i = 0; i <= 200; i++) {
  const u = i / 200;
  const d = (shear(u + 1e-4) - shear(u - 1e-4)) / 2e-4;
  jmin = Math.min(jmin, 1 - Math.abs(d)); jmax = Math.max(jmax, 1 + Math.abs(d));
}
console.log(`Jacobi zwischen ${jmin.toFixed(3)} und ${jmax.toFixed(3)}`
  + `  (unter null waere eine Falte)`);
