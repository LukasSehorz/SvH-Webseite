/**
 * Die Scherung gegen eine VORGEGEBENE Kaemmrichtung anpassen.
 *
 * schermodell.mjs rechnet dieselbe Kette, trug aber noch die
 * Verdrehungszahlen eines Standes, den es nicht mehr gibt, und es kann nur
 * vorwaerts rechnen. Gebraucht wird die Umkehrung: zu jeder Bandkoordinate
 * die Scherung, die den kuerzesten Gittervektor auf die Richtung der
 * Referenz legt.
 *
 * Der Grund fuer die Umkehrung ist eine Messung. Die Referenz zeigt an
 * vier Meszstellen einheitlich minus 162,1 / minus 160,2 / minus 161,0 /
 * minus 166,0 Grad, unser Stand mit der bisherigen Scherung dagegen minus
 * 164,7 / minus 158,0 / minus 137,7 / minus 103,3. Der obere Lappen trifft
 * also, unterhalb der Taille laeuft es weg. Von Hand ist das nicht zu
 * finden, weil die Richtung sprunghaft umschlaegt, sobald zwei fast gleich
 * lange Gittervektoren miteinander konkurrieren.
 *
 *   node _ref2/scherfit.mjs [N_U] [N_S] [zielwinkel]
 */
const RADIUS = 2.3, SPANN = 11.5, TILT = 0.24, CAM = 11.0;
const NECK_MIN = 0.08, NECK_SPAN = 0.048;
const TWIST_FAR = 1.76492, TWIST_KNOT = 0.691754, KNOT_SPAN = 0.05;
const PHASE0 = Math.PI / 2, LEAN = 0.07;

const N_U = Number(process.argv[2] ?? 180);
const N_S = Number(process.argv[3] ?? 120);
const ZIEL = Number(process.argv[4] ?? -161);

/* Maszstab und Achse wie im Browser bei 1440 mal 900, danach auf
 * Referenzmaszstab gebracht, damit die Winkel unmittelbar gegen die
 * Messung an der Referenz stehen. */
const uUnit = Math.max(900 * 0.075, Math.min(900 * 0.145, 1440 * 0.09));
const K = 1085 / 1425;
const CX = 1440 * 0.74 * K;
const CY = 900 * 0.493 * K;

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const kehleAt = (ph) => NECK_MIN + (1 - NECK_MIN) * smoothstep(0, NECK_SPAN, Math.abs(ph));
const drallAt = (ph) => {
  const x = ph / KNOT_SPAN;
  return TWIST_FAR * ph + (TWIST_KNOT * x) / Math.sqrt(1 + x * x);
};

/** Ein Punkt der Flaeche im Bild, in Bildpunkten auf Referenzmaszstab. */
function bild(ph, s) {
  const phi = PHASE0 + drallAt(ph);
  const r = RADIUS * kehleAt(ph) * s;
  const p = [r * Math.cos(phi), ph * SPANN, r * Math.sin(phi)];
  const ct = Math.cos(TILT), st = Math.sin(TILT);
  const q = [p[0], p[1] * ct - p[2] * st, p[1] * st + p[2] * ct];
  const persp = CAM / (CAM - q[2]);
  const cl = Math.cos(LEAN), sl = Math.sin(LEAN);
  let fx = -q[0], fy = q[1];
  [fx, fy] = [fx * cl - fy * sl, fx * sl + fy * cl];
  return [CX + fx * persp * uUnit * K, CY + fy * persp * uUnit * K];
}

/** Die beiden kuerzesten Gittervektoren an (ph, s) bei der Scherung sig. */
function gitter(ph, s, sig) {
  const du = 1 / N_U, ds = 2 / (N_S - 1);
  const o = bild(ph, s);
  const T = bild(ph + du, s).map((v, i) => v - o[i]);
  const R = bild(ph + sig * ds, s + ds).map((v, i) => v - o[i]);
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
  /* Die Vorzeichenregel von gitter.mjs, damit die Winkel vergleichbar
   * sind: gezaehlt wird die obere Halbebene. */
  const norm = (v) => (v[1] > 0.2 || (Math.abs(v[1]) <= 0.2 && v[0] > 0) ? v : [-v[0], -v[1]]);
  a = norm(a); b = norm(b);
  const win = (v) => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;
  return {
    w1: win(a), w2: win(b), l1: Math.hypot(a[0], a[1]), l2: Math.hypot(b[0], b[1]),
    flaeche: Math.abs(a[0] * b[1] - a[1] * b[0]),
  };
}

/** Die Scherung, die an (ph, s) am naechsten an den Zielwinkel kommt. */
function passe(ph, s) {
  let best = null;
  for (let i = -900; i <= 900; i++) {
    const sig = i / 2000;
    const g = gitter(ph, s, sig);
    let d = Math.abs(g.w1 - ZIEL);
    if (d > 180) d = 360 - d;
    if (d > 90) d = 180 - d;
    if (!best || d < best.d) best = { sig, d, g };
  }
  return best;
}

console.log(`N_U=${N_U} N_S=${N_S} ziel=${ZIEL}deg  (Bildpunkte auf Referenzmaszstab)`);
console.log('  ph     y     s      noetige scherung   b1        b2        flaeche');
const zeilen = [];
for (const ph of [-0.30, -0.24, -0.18, -0.12, -0.06, -0.02, 0.02, 0.06, 0.12, 0.18, 0.24, 0.30]) {
  for (const s of [-0.5, 0.0, 0.5]) {
    const b = passe(ph, s);
    const y = bild(ph, s)[1];
    if (s === 0) zeilen.push({ ph, sig: b.sig });
    console.log(`${ph.toFixed(2).padStart(6)} ${y.toFixed(0).padStart(5)} ${s.toFixed(1).padStart(5)}`
      + `   ${b.sig.toFixed(4).padStart(8)} (rest ${b.d.toFixed(1)}deg)`
      + `   ${b.g.l1.toFixed(2)}/${b.g.w1.toFixed(0)}`
      + `   ${b.g.l2.toFixed(2)}/${b.g.w2.toFixed(0)}`
      + `   ${b.g.flaeche.toFixed(1)}`);
  }
}

/* Die Anpassung laeuft NICHT ueber einen Ausgleich der einzelnen
 * Loesungen, und der Grund steht in der Tabelle darueber. Die Scherung ist
 * nur MODULO einer Sprossenweite je Bahnschritt bestimmt, also modulo
 * (N_S - 1) / (2 * N_U); die Einzelloesungen springen deshalb zwischen
 * Zweigen hin und her und ein Ausgleich ueber sie mittelt Zweige
 * gegeneinander. Gesucht wird stattdessen unmittelbar das Paar aus Basis
 * und Ausschlag, das ueber die ganze sichtbare Bandlaenge den kleinsten
 * Fehler laeszt. */
const QUANT = (N_S - 1) / (2 * N_U);
console.log(`\nZweigweite der Scherung ${QUANT.toFixed(4)}`);

/* Nur der Bereich, in dem das Gewebe wirklich Licht traegt. Unterhalb von
 * ph gleich 0,30 ist es ueber den Ausklang erloschen, und innerhalb von
 * 0,04 um die Taille entartet das Gitter, dort misst niemand etwas. */
const stellen = [];
for (const ph of [-0.30, -0.26, -0.22, -0.18, -0.14, -0.10, -0.06, 0.06, 0.10, 0.14, 0.18, 0.22]) {
  for (const s of [-0.6, -0.2, 0.2, 0.6]) stellen.push({ ph, s });
}

const scherAt = (ph, a0, a1, a2) =>
  a0 + a1 * Math.sin(2 * Math.PI * ph) + a2 * Math.sin(4 * Math.PI * ph);

/* Bewertet wird die STREUUNG der Richtung und nicht der Abstand zum
 * Zielwinkel. Der Auftrag verlangt eine einheitliche Kaemmrichtung; ein
 * gleichmaesziger Versatz gegen die Referenz faellt am Bild nicht auf, ein
 * Umschlagen von Lappen zu Lappen dagegen sofort. Der Abstand zum Ziel
 * geht nur mit kleinem Gewicht ein, damit unter mehreren gleich
 * einheitlichen Loesungen die naechste an der Referenz gewinnt. */
function fehler(a0, a1, a2) {
  const winkel = [];
  for (const st of stellen) {
    const g = gitter(st.ph, st.s, scherAt(st.ph, a0, a1, a2));
    /* Auf einen Zweig von 180 Grad um das Ziel herum zurueckholen, denn
     * eine Richtung und ihre Gegenrichtung sind dieselbe Kette. */
    let w = g.w1;
    while (w - ZIEL > 90) w -= 180;
    while (w - ZIEL < -90) w += 180;
    winkel.push(w);
  }
  const min = Math.min(...winkel), max = Math.max(...winkel);
  let s = 0;
  for (const w of winkel) s += (w - ZIEL) ** 2;
  return { spanne: max - min, rms: Math.sqrt(s / winkel.length), min, max };
}

/* Die Schranke am Ausschlag ist der Jacobi-Faktor. Er ist
 * 1 minus aS mal der Ableitung der Scherung, und faellt er unter etwa ein
 * Halb, so schwankt die Punktdichte laengs des Bandes um mehr als das
 * Doppelte und das Gewebe traegt sichtbare Streifen. */
const jacobi = (a1, a2) => 1 - (Math.abs(a1) * 2 * Math.PI + Math.abs(a2) * 4 * Math.PI);

let best = null;
for (let bi = -66; bi <= 66; bi++) {
  const a0 = bi / 200;
  for (let ai = -16; ai <= 16; ai++) {
    const a1 = ai / 200;
    for (let ci = -8; ci <= 8; ci++) {
      const a2 = ci / 200;
      if (jacobi(a1, a2) < 0.5) continue;
      const f = fehler(a0, a1, a2);
      const wert = f.spanne + 0.35 * f.rms;
      if (!best || wert < best.wert) best = { a0, a1, a2, wert, ...f };
    }
  }
}
console.log(`bester Wurf  scher(ph) = ${best.a0.toFixed(4)}`
  + ` + ${best.a1.toFixed(4)} * sin(2 pi ph)`
  + ` + ${best.a2.toFixed(4)} * sin(4 pi ph)`);
console.log(`  Spanne ${best.spanne.toFixed(1)}deg von ${best.min.toFixed(0)} bis ${best.max.toFixed(0)}`
  + `, Abstand zum Ziel rms ${best.rms.toFixed(1)}deg`
  + `, Jacobi mindestens ${jacobi(best.a1, best.a2).toFixed(3)}`);
console.log('  ph      s     winkel   b1     b2     flaeche');
for (const st of stellen) {
  if (st.s !== -0.2) continue;
  const g = gitter(st.ph, st.s, scherAt(st.ph, best.a0, best.a1, best.a2));
  console.log(`${st.ph.toFixed(2).padStart(6)} ${st.s.toFixed(1).padStart(6)}`
    + `  ${g.w1.toFixed(0).padStart(6)}   ${g.l1.toFixed(2)}   ${g.l2.toFixed(2)}   ${g.flaeche.toFixed(1)}`);
}

/* Nachschau fuer eine vorgegebene Scherung, damit sich das Modell gegen
 * eine Messung an der fertigen Seite pruefen laeszt.
 *   PROBE="a0,a1,a2" node _ref2/scherfit.mjs
 */
if (process.env.PROBE) {
  const [p0, p1, p2] = process.env.PROBE.split(',').map(Number);
  console.log(`\nProbe scher(ph) = ${p0} + ${p1} * sin(2 pi ph) + ${p2 || 0} * sin(4 pi ph)`);
  console.log('  ph      s   scher     winkel   b1     b2    flaeche');
  for (const ph of [-0.30, -0.24, -0.18, -0.14, -0.10, -0.06, 0.06, 0.10, 0.14, 0.18, 0.24]) {
    for (const s of [-0.6, -0.2, 0.2, 0.6]) {
      const sig = scherAt(ph, p0, p1, p2 || 0);
      const g = gitter(ph, s, sig);
      console.log(`${ph.toFixed(2).padStart(6)} ${s.toFixed(1).padStart(5)} ${sig.toFixed(4).padStart(8)}`
        + `  ${g.w1.toFixed(0).padStart(6)}   ${g.l1.toFixed(2)}   ${g.l2.toFixed(2)}   ${g.flaeche.toFixed(1)}`);
    }
  }
}

/* GEOMETRISCHE SCHERUNG.
 *
 * Statt zwei Zahlen an Meszstellen anzupassen wird die Scherung
 * hergeleitet. Verlangt ist, dass der Reihenvektor R gleich
 * ds mal (G + sig mal E) im Bild unter einem festen Winkel steht, wobei G
 * die Ableitung der Flaeche quer und E laengs des Bandes ist. Aus
 * R_y / R_x gleich m folgt unmittelbar
 *     sig = RADIUS / (SPANN cos TILT) * kehle * (m sin drall + sin TILT cos drall)
 * Der zweite Summand ist PERIODISCH, der erste ANTIPERIODISCH. Der erste
 * wird deshalb durch seine beste periodische Naeherung ersetzt, und das
 * ist ein Sinus in der Bandkoordinate.
 *
 *   GEO="m,span" node _ref2/scherfit.mjs
 */
if (process.env.GEO) {
  const [m, span] = process.env.GEO.split(',').map(Number);
  const st = Math.sin(TILT), ct = Math.cos(TILT);
  const vor = RADIUS / (SPANN * ct);
  const cE = vor * st;
  /* Der Vorfaktor 1,102 ist die Projektion von kehle mal sin(drall) auf
   * sin(2 pi ph) ueber eine Periode, numerisch gerechnet. */
  const cS = vor * m * 1.102;
  const kehleW = (ph) => NECK_MIN + (1 - NECK_MIN) * smoothstep(0, span, Math.abs(ph));
  const sigAt = (ph) => cE * kehleW(ph) * Math.cos(drallAt(ph)) + cS * Math.sin(2 * Math.PI * ph);
  console.log(`\nGeometrisch  m=${m} span=${span}  cE=${cE.toFixed(4)} cS=${cS.toFixed(4)}`);
  let jmin = 9, jmax = 0, jph = 0;
  for (let i = -500; i <= 500; i++) {
    const ph = i / 1000;
    const d = (sigAt(ph + 1e-4) - sigAt(ph - 1e-4)) / 2e-4;
    if (1 - Math.abs(d) < jmin) { jmin = 1 - Math.abs(d); jph = ph; }
    jmax = Math.max(jmax, 1 + Math.abs(d));
  }
  console.log(`Jacobi zwischen ${jmin.toFixed(3)} (bei ph ${jph.toFixed(3)}) und ${jmax.toFixed(3)}`);
  console.log('  ph      s   scher     winkel   b1     b2    flaeche');
  const alle = [];
  for (const ph of [-0.30, -0.24, -0.18, -0.14, -0.10, -0.06, 0.06, 0.10, 0.14, 0.18, 0.24, 0.30]) {
    for (const s of [-0.6, -0.2, 0.2, 0.6]) {
      const sig = sigAt(ph);
      const g = gitter(ph, s, sig);
      let w = g.w1;
      while (w - ZIEL > 90) w -= 180;
      while (w - ZIEL < -90) w += 180;
      alle.push(w);
      if (s === -0.2 || s === 0.6) {
        console.log(`${ph.toFixed(2).padStart(6)} ${s.toFixed(1).padStart(5)} ${sig.toFixed(4).padStart(8)}`
          + `  ${w.toFixed(0).padStart(6)}   ${g.l1.toFixed(2)}   ${g.l2.toFixed(2)}   ${g.flaeche.toFixed(1)}`);
      }
    }
  }
  console.log(`Spanne ${(Math.max(...alle) - Math.min(...alle)).toFixed(1)}deg`
    + ` von ${Math.min(...alle).toFixed(0)} bis ${Math.max(...alle).toFixed(0)}`);
}
