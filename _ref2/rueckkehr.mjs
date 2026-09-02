/**
 * Mitlauf und Rueckkehr, am GEBAUTEN Stand und ohne den Haken __dna.
 *
 *   node _ref2/rueckkehr.mjs [port] [versatz] [schritt]
 *
 * _ref2/ankopplung.mjs liest die Groeszen unmittelbar aus window.__dna
 * aus. Dieser Haken haengt an process.env.NODE_ENV und wird im
 * Produktionsbau entfernt, das Skript laeuft dort also ins Leere. Weil auf
 * dieser Maschine nur der Produktionsbau schnell genug ist, misst dieses
 * Skript dasselbe aus den BILDERN.
 *
 * Zwei Fragen werden beantwortet.
 *
 * Der MITLAUF. Aufgenommen wird bei zwei Scrollstellen, die um den Schritt
 * auseinanderliegen. Die senkrechte Verschiebung des Gewebes zwischen
 * beiden Bildern kommt aus der Kreuzkorrelation eines Streifens der
 * rechten Bildhaelfte. Der Mitlauf ist diese Verschiebung geteilt durch
 * den Schritt und soll bei 0,35 liegen.
 *
 * Die RUECKKEHR. Danach faehrt die Seite ganz nach unten und wieder ganz
 * nach oben und kehrt an die erste Stelle zurueck. Stimmt das Bild dort
 * mit dem ersten ueberein, ist die Rueckkehr genau.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const OFF = Number(process.argv[3] || 840);
const SCHRITT = Number(process.argv[4] || 400);

const DIR = '_ref2/tmp/rueck';
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForTimeout(2500);
await page.waitForSelector('#marketing', { state: 'attached', timeout: 120000 });

const springe = async (off) => {
  let ist = null;
  for (let i = 0; i < 8; i++) {
    const top = await page.evaluate(() => {
      const se = document.scrollingElement;
      const el = document.getElementById('marketing');
      return Math.round(el.getBoundingClientRect().top + se.scrollTop);
    });
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(900);
    ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
    );
    if (Math.abs(ist + off) <= 6) break;
  }
  return ist;
};

// Erst springen, dann warten, dann noch einmal springen. Waehrend der
// langen Ruhe laedt oberhalb der Sektion Inhalt nach und schiebt sie nach
// unten; ohne den zweiten Sprung sitzt die Aufnahme woanders.
const stelle = async (off, name, ruhe) => {
  await springe(off);
  await page.waitForTimeout(ruhe);
  const ist = await springe(off);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${DIR}/${name}.png` });
  return ist;
};

await stelle(OFF, 'a', 20000);
await stelle(OFF + SCHRITT, 'b', 5000);

// Ganz nach unten, ganz nach oben, zurueck an die erste Stelle.
await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight; });
await page.waitForTimeout(3000);
await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
await page.waitForTimeout(3000);
await stelle(OFF, 'c', 5000);

await browser.close();

const hole = async (f) => {
  const { data, info } = await sharp(`${DIR}/${f}.png`).raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
};

// Ein Streifen der rechten Bildhaelfte, in dem das Gewebe steht.
const streifen = (G, x0, x1) => {
  const z = new Float64Array(G.H);
  for (let y = 0; y < G.H; y++) {
    let s = 0;
    for (let x = x0; x < x1; x++) {
      const k = (y * G.W + x) * G.C;
      s += 0.299 * G.data[k] + 0.587 * G.data[k + 1] + 0.114 * G.data[k + 2];
    }
    z[y] = s / (x1 - x0);
  }
  const m = z.reduce((a, b) => a + b, 0) / G.H;
  for (let y = 0; y < G.H; y++) z[y] -= m;
  return z;
};

const A = await hole('a');
const B = await hole('b');
const C = await hole('c');

const za = streifen(A, 1000, 1400);
const zb = streifen(B, 1000, 1400);

let best = 0;
let bestWert = -Infinity;
for (let d = 0; d <= SCHRITT; d++) {
  let s = 0;
  let n = 0;
  for (let y = 0; y + d < A.H; y++) { s += za[y + d] * zb[y]; n += 1; }
  const wert = s / n;
  if (wert > bestWert) { bestWert = wert; best = d; }
}

// Die Rueckkehr. Verglichen wird die rechte Bildhaelfte Bildpunkt fuer
// Bildpunkt.
let summe = 0;
let anzahl = 0;
let groeszte = 0;
for (let y = 0; y < A.H; y++) {
  for (let x = Math.floor(A.W / 2); x < A.W - 20; x++) {
    const k = (y * A.W + x) * A.C;
    const d = Math.abs(A.data[k] - C.data[k]);
    summe += d; anzahl += 1; if (d > groeszte) groeszte = d;
  }
}

console.log(`Versatz ${OFF} gegen ${OFF + SCHRITT}, Schritt ${SCHRITT}`);
console.log(`  senkrechte Verschiebung des Gewebes: ${best} Bildpunkte`);
console.log(`  Mitlauf: ${(best / SCHRITT).toFixed(3)}   Soll 0,35`);
console.log('');
console.log('Rueckkehr an dieselbe Stelle nach ganz unten und ganz oben');
console.log(`  mittlere Abweichung rechte Bildhaelfte: ${(summe / anzahl).toFixed(3)} Stufen`);
console.log(`  groeszte Abweichung: ${groeszte} Stufen`);
console.log(`  ${summe / anzahl < 1.0 ? 'RUECKKEHR GENAU' : 'RUECKKEHR NICHT GENAU'}`);
