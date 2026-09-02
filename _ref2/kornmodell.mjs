/**
 * Modell des Korns. Es legt die Punktscheibe des Fragment-Shaders auf das
 * gemessene Gitter und rechnet daraus dasselbe Radialprofil und dieselben
 * Perzentile, die mat.mjs am fertigen Bild erhebt.
 *
 * Der Zweck ist Zeit. Jede Aufnahme der echten Seite kostet ueber eine
 * Minute, und die Form des Korns hat vier Stellschrauben. Angepasst wird
 * deshalb hier und nur das Ergebnis wird an der Seite nachgeprueft.
 *
 *   node _ref2/kornmodell.mjs <teiler> <kernExp> <hof> <hofExp> <scheibeR> <G>
 *
 * Ziel ist die Referenz f006 im Fenster 620,152,420,420.
 *   ringe ueber Sockel  69,5  48,4  34,3  31,7  31,2  34,9  34,5
 *   p99 ueber Sockel    137,8      Bedeckung ueber Sockel plus 8  56,7 Prozent
 */
const [tl, ke, hf, he, sr, gg] = process.argv.slice(2);
const TEILER = Number(tl ?? 10.2), KERN_EXP = Number(ke ?? 1.5);
const HOF = Number(hf ?? 0.021), HOF_EXP = Number(he ?? 1.8);
/* Halbmesser der Scheibe in Referenzbildpunkten. Die Scheibe misst
 * uPointSize mal (0,75 plus 0,45 mal persp) eigene Bildpunkte, bei
 * uPointSize gleich 20 und persp rund eins also 24, und auf
 * Referenzmaszstab mit dem Faktor 1085 durch 1425 davon 18,3. Der
 * Halbmesser ist die Haelfte. Der frueher hier stehende Wert 4,57 gehoerte
 * zu einer Scheibe von uPointSize gleich 10 und war seit deren Verdopplung
 * falsch. */
const R = Number(sr ?? 9.14);
const G = Number(gg ?? 100);    /* Helligkeit eines Punktes mit Faktor eins */

/* Das Gitter im oberen Lappen, wie es die neue Teilung 180 und 120
 * liefert: kurzer Kettenvektor 3,33 Bildpunkte unter 17,7 Grad, langer
 * Sprossenvektor 5,4 Bildpunkte fast senkrecht. Die Referenz misst an
 * derselben Stelle 3,28 unter 17,7 Grad und 5,47 senkrecht. */
const B1 = [3.17, -1.01], B2 = [0.90, 5.40];

const a = (d) => {
  const r = d / R;
  if (r >= 1) return 0;
  const kern = Math.pow(Math.max(0, 1 - r * TEILER), KERN_EXP);
  const hof = Math.pow(Math.max(0, 1 - r), HOF_EXP);
  return kern + HOF * hof;
};

/* Ein Feld von 60 mal 60 Bildpunkten mit dem Gitter darauf. Die Streuung
 * der Einzelhelligkeit ist dieselbe wie im Aufbau, naemlich 0,80 bis
 * 1,16, denn sie entscheidet ueber das obere Perzentil. */
const W = 60, H = 60;
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const punkte = [];
for (let m = -14; m <= 14; m++) for (let n = -14; n <= 14; n++) {
  const x = W / 2 + m * B1[0] + n * B2[0];
  const y = H / 2 + m * B1[1] + n * B2[1];
  if (x < -R - 2 || x > W + R + 2 || y < -R - 2 || y > H + R + 2) continue;
  punkte.push([x, y, 0.8 + rnd() * 0.36, m === 0 && n === 0]);
}

const feld = new Float64Array(W * H);
for (const [px, py, gain] of punkte) {
  const x0 = Math.max(0, Math.floor(px - R)), x1 = Math.min(W - 1, Math.ceil(px + R));
  const y0 = Math.max(0, Math.floor(py - R)), y1 = Math.min(H - 1, Math.ceil(py + R));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    /* Vierfache Unterabtastung je Bildpunkt, sonst faellt der schmale
     * Kern zwischen die Stuetzstellen und das Profil wird zufaellig. */
    let s = 0;
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++)
      s += a(Math.hypot(x + 0.25 + sx * 0.5 - px, y + 0.25 + sy * 0.5 - py));
    feld[y * W + x] += G * gain * (s / 4);
  }
}

/* Radialprofil um die Punktmittelpunkte, genau wie in mat.mjs. */
const rs = new Float64Array(7), rn = new Float64Array(7);
for (const [px, py, , mitte] of punkte) {
  if (!mitte && (px < 12 || px > W - 12 || py < 12 || py > H - 12)) continue;
  const cx = Math.round(px), cy = Math.round(py);
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const r = Math.round(Math.hypot(dx, dy));
    if (r > 6) continue;
    const x = cx + dx, y = cy + dy;
    if (x < 0 || x >= W || y < 0 || y >= H) continue;
    rs[r] += feld[y * W + x]; rn[r]++;
  }
}
const ring = [];
for (let r = 0; r <= 6; r++) ring.push(rn[r] ? rs[r] / rn[r] : 0);

const innen = [];
for (let y = 10; y < H - 10; y++) for (let x = 10; x < W - 10; x++) innen.push(feld[y * W + x]);
innen.sort((p, q) => p - q);
const pct = (p) => innen[Math.floor(p * innen.length)];
const sockel = pct(0.05);
const bed = innen.filter((v) => v > sockel + 8).length / innen.length;
let mittel = 0; for (const v of innen) mittel += v; mittel /= innen.length;

const f1 = (v) => v.toFixed(1);
console.log(`teiler=${TEILER} kernExp=${KERN_EXP} hof=${HOF} hofExp=${HOF_EXP} R=${R} G=${G}`);
console.log(`  ringe ueber sockel  ${ring.map((v) => f1(v - sockel).padStart(5)).join(' ')}`
  + `   delle=${f1(Math.max(...[1, 2, 3, 4].map((r) => ring[6] - ring[r])))}`);
console.log(`  p99 ueber sockel ${f1(pct(0.99) - sockel)}  bed(+8) ${f1(bed * 100)}%`
  + `  mittel ueber sockel ${f1(mittel - sockel)}`);
console.log(`  ZIEL                 69.5  48.4  34.3  31.7  31.2  34.9  34.5   delle=3.4`);
console.log(`  ZIEL p99 137.8  bed 56.7%`);
