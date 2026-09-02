/**
 * Anpassung der Regelflaeche an die am Referenzbild abgelesenen Punkte.
 *
 * Gesucht sind fuenf Groeszen, alle in Bildpunkten des Referenzvideos:
 * die Kameraentfernung Cp, der halbe Ringabstand Hp, der Ringhalbmesser Rp,
 * die Kippung der Achse und die Gesamtverdrehung. Die Ablesungen stammen
 * aus v004, wo die Engstelle bei (1748, 860) sitzt.
 *
 * Zwei Arten von Ablesung gehen ein. Die eine ist der PROJIZIERTE ENDRING
 * oben rechts, dessen hoechster Punkt genau auf der Achse liegt und dessen
 * rechtester Punkt tiefer sitzt. Die andere ist die SILHOUETTE der Flaeche,
 * also die Beruehrlinie des Blickes am Kreis der jeweiligen Hoehe.
 */

const ZIELE = {
  ringOben: -732,            // Bildhoehe des hoechsten Ringpunktes
  ringRechtsX: 613,          // seitlicher Abstand des rechtesten Ringpunktes
  ringRechtsY: -340,
  // Silhouette: [Bildhoehe, halbe Breite]
  sil: [
    [-224, 219],
    [-504, 340],
    [-672, 404],
    [480, 450],
  ],
};

function modell(p) {
  const { Cp, Hp, Rp, tilt, twist } = p;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const alpha = twist / 2;
  const ca = Math.abs(Math.cos(alpha)), sa = Math.abs(Math.sin(alpha));

  // Der Endring oben, also Welthoehe minus Hp.
  const ringPunkt = (phi) => {
    const c = Math.cos(phi), s = Math.sin(phi);
    const qy = -Hp * ct - Rp * s * st;
    const qz = -Hp * st + Rp * s * ct;
    const d = Cp - qz;
    if (d < 1) return null;
    const persp = Cp / d;
    return { x: -Rp * c * persp, y: qy * persp };
  };
  let oben = null, rechts = null;
  for (let k = 0; k < 2000; k += 1) {
    const q = ringPunkt((k / 2000) * 2 * Math.PI);
    if (!q) continue;
    if (!oben || q.y < oben.y) oben = q;
    if (!rechts || q.x > rechts.x) rechts = q;
  }

  // Silhouette: zu einer gegebenen Bildhoehe die halbe Breite.
  const silBei = (ziely) => {
    // Welthoehe suchen, deren Achsenpunkt auf ziely abbildet
    let lo = -4 * Hp, hi = 4 * Hp;
    for (let k = 0; k < 60; k += 1) {
      const mid = (lo + hi) / 2;
      const d = Cp - mid * st;
      const y = d > 1 ? (Cp * mid * ct) / d : 1e9;
      if (y < ziely) lo = mid; else hi = mid;
    }
    const yp = (lo + hi) / 2;
    const rp = Rp * Math.sqrt(ca * ca + (yp / Hp) ** 2 * sa * sa);
    const Dp = Cp - yp * st;
    if (Dp <= rp) return 1e6;
    return (rp * Dp) / Math.sqrt(Dp * Dp - rp * rp);
  };

  return { oben, rechts, silBei };
}

function fehler(p) {
  const m = modell(p);
  if (!m.oben || !m.rechts) return 1e12;
  let e = 0;
  e += ((m.oben.y - ZIELE.ringOben) / 60) ** 2;
  e += ((m.rechts.x - ZIELE.ringRechtsX) / 60) ** 2;
  e += ((m.rechts.y - ZIELE.ringRechtsY) / 60) ** 2;
  for (const [y, w] of ZIELE.sil) e += ((m.silBei(y) - w) / 40) ** 2;
  return e;
}

let best = { Cp: 2400, Hp: 2000, Rp: 1500, tilt: 0.2, twist: 3.05 };
let bestE = fehler(best);
let schritt = { Cp: 400, Hp: 400, Rp: 300, tilt: 0.08, twist: 0.06 };
const rand = (() => { let a = 12345; return () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; })();
for (let runde = 0; runde < 40000; runde += 1) {
  const k = 1 - runde / 40000;
  const kand = {
    Cp: best.Cp + (rand() - 0.5) * schritt.Cp * k,
    Hp: best.Hp + (rand() - 0.5) * schritt.Hp * k,
    Rp: best.Rp + (rand() - 0.5) * schritt.Rp * k,
    tilt: best.tilt + (rand() - 0.5) * schritt.tilt * k,
    twist: best.twist + (rand() - 0.5) * schritt.twist * k,
  };
  if (kand.Cp < 300 || kand.Hp < 300 || kand.Rp < 100) continue;
  if (kand.twist > Math.PI) kand.twist = Math.PI - 1e-4;
  if (kand.twist < 2.4) kand.twist = 2.4;
  if (kand.tilt < 0) kand.tilt = 0;
  if (kand.tilt > 0.6) kand.tilt = 0.6;
  const e = fehler(kand);
  if (e < bestE) { bestE = e; best = kand; }
}

const m = modell(best);
console.log('Restfehler', bestE.toFixed(3));
console.log('Cp', best.Cp.toFixed(0), 'Hp', best.Hp.toFixed(0), 'Rp', best.Rp.toFixed(0),
  'tilt', best.tilt.toFixed(4), 'twist', best.twist.toFixed(4),
  '=> Taille', (best.Rp * Math.abs(Math.cos(best.twist / 2))).toFixed(1), 'px');
console.log('Ring oben  Modell', m.oben.y.toFixed(0), ' Ziel', ZIELE.ringOben);
console.log('Ring rechts Modell', m.rechts.x.toFixed(0), '/', m.rechts.y.toFixed(0), ' Ziel', ZIELE.ringRechtsX, '/', ZIELE.ringRechtsY);
for (const [y, w] of ZIELE.sil) console.log(`Silhouette y ${y}: Modell ${m.silBei(y).toFixed(0)}  Ziel ${w}`);
console.log('Kegelhalbwinkel', ((Math.atan((best.Rp * Math.sin(best.twist / 2)) / best.Hp) * 180) / Math.PI).toFixed(1), 'Grad');
console.log('Verhaeltnis Cp/Rp', (best.Cp / best.Rp).toFixed(2));

// Umrechnung auf unsere Seite: Referenzvideo 2462 breit, unsere Seite 1425.
const f = 1425 / 2462;
console.log('\nAuf unsere Bildpunkte (Faktor', f.toFixed(4), '):');
console.log('  Cp', (best.Cp * f).toFixed(0), ' Hp', (best.Hp * f).toFixed(0), ' Rp', (best.Rp * f).toFixed(0),
  ' Taille', (best.Rp * Math.abs(Math.cos(best.twist / 2)) * f).toFixed(1));
