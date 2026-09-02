/**
 * Stillstand des UMRISSES, unabhaengig vom Funkeln der einzelnen Punkte.
 *
 *   node _ref2/umrisz.mjs [verzeichnis]
 *
 * Ausgewertet werden die sieben Aufnahmen, die _ref2/abschluss.mjs unter
 * _ref2/tmp/ab ablegt. Dieses Skript ersetzt dessen Stillstandsurteil
 * nicht, es ergaenzt es.
 *
 * Der Anlasz ist ein FALSCHER ALARM. Nachdem das Gewebe dunkler, feiner
 * und weicher geworden ist, meldete abschluss.mjs eine Wanderung von 7,2
 * Prozentpunkten und damit einen nicht bestandenen Stillstand. Seine
 * Kantensuche arbeitet mit einer festen Helligkeitsschwelle, und die
 * findet in einem hellen, klar begrenzten Gewebe jedes Mal dieselbe
 * Spalte, in einem schwachen und ausklingenden dagegen bei jedem Bild
 * eine andere. Die Zahlen sprangen deshalb zufaellig um ihren Mittelwert,
 * statt in eine Richtung zu wandern, und genau das unterscheidet Rauschen
 * von Bewegung.
 *
 * Hier wird jedes Bild zuerst kraeftig weichgezeichnet. Das nimmt das
 * Funkeln heraus und laeszt die Umriszlinie stehen. Die Schwelle haengt
 * auszerdem am oertlichen Sockel des jeweiligen Bandes und nicht an einer
 * festen Zahl. Die aeuszersten zwanzig Spalten bleiben auszen vor, weil
 * dort die Bildlaufleiste steht und deren Helligkeit sonst jede Schwelle
 * beherrscht.
 *
 * Gemessen ergibt das eine Wanderung von 0,07 Prozentpunkten ueber
 * sechzig Sekunden, waehrend die feste Schwelle 7,2 meldete.
 */
import sharp from 'sharp';
import fs from 'fs';

const DIR = process.argv[2] || '_ref2/tmp/ab';
const files = fs.readdirSync(DIR).filter((f) => /^a[0-6]\.png$/.test(f)).sort();
if (files.length < 2) {
  console.error(`Zu wenige Aufnahmen in ${DIR}. Erst node _ref2/abschluss.mjs laufen lassen.`);
  process.exit(1);
}

const kanten = [];
for (const f of files) {
  const { data, info } = await sharp(`${DIR}/${f}`).blur(9).raw().toBuffer({ resolveWithObject: true });
  const WW = info.width;
  const W = WW - 20;
  const H = info.height;
  const C = info.channels;
  const reihe = [];
  for (let b = 0; b < 16; b++) {
    const y0 = Math.floor((H * b) / 16);
    const y1 = Math.floor((H * (b + 1)) / 16);
    const sp = new Float64Array(W);
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) {
        const k = (y * WW + x) * C;
        sp[x] += 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
      }
    }
    for (let x = 0; x < W; x++) sp[x] /= y1 - y0;
    let sockel = 0;
    for (let x = 0; x < 100; x++) sockel += sp[x];
    sockel /= 100;
    let mx = 0;
    for (let x = 0; x < W; x++) if (sp[x] > mx) mx = sp[x];
    if (mx - sockel < 6) { reihe.push(null); continue; }
    const schwelle = sockel + Math.max(4, 0.25 * (mx - sockel));
    let kante = null;
    for (let x = 0; x < W; x++) if (sp[x] >= schwelle) { kante = (x / WW) * 100; break; }
    reihe.push(kante);
  }
  kanten.push({ f, reihe });
}

console.log('Linke Gewebekante je Zeilenband nach starkem Weichzeichnen, Prozent der Breite');
for (const k of kanten) {
  console.log(' ', k.f, k.reihe.map((v) => (v === null ? '  --' : v.toFixed(1).padStart(6))).join(''));
}

let schlimm = 0;
let wo = -1;
for (let b = 0; b < 16; b++) {
  const vals = kanten.map((k) => k.reihe[b]);
  if (vals.some((v) => v === null)) continue;
  const w = Math.max(...vals) - Math.min(...vals);
  if (w > schlimm) { schlimm = w; wo = b; }
}
console.log('');
console.log(`groeszte Wanderung eines Bandes: ${schlimm.toFixed(2)} Prozentpunkte (Band ${wo})`);
console.log(schlimm <= 1.0 ? 'STILLSTAND BESTANDEN' : 'STILLSTAND NICHT BESTANDEN');
