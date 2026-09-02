/**
 * Die Ankopplung an den Scrollweg, unmittelbar ausgelesen.
 *
 * Liest ueber den Entwicklungshaken window.__dna den Weltversatz der
 * Struktur an mehreren Scrollstellen aus und rechnet daraus die
 * Bildpunkte um, die die Struktur gegenueber der Seite zurueckgelegt hat.
 * Das ist genauer als jede Messung am Bild, denn die Silhouette wird an
 * der Taille von der Huelle ueberlagert und ein Blockvergleich rastet auf
 * dem Punktraster ein.
 *
 *   node _ref2/ankopplung.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const STELLEN = [0, 150, 300, 450, 600, 750, 900, 1050];

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

/* Wartet, bis der Scrollstand wirklich steht.
 *
 * Frueher stand hier eine feste Wartezeit von 700 und 2200 Millisekunden.
 * Lenis gleitet aber weiter, und seit die Sektion von 1950 auf 4850
 * Bildpunkte gewachsen ist und die Maschine am Speicherlimit laeuft,
 * reichte das nicht mehr. Das Skript las den Weltversatz dann mitten in der
 * Bewegung aus und meldete Mitlaufwerte zwischen minus 1,7 und 7,0, also
 * reinen Unsinn. */
const ruhe = async () => {
  let vorher = -1;
  for (let i = 0; i < 40; i++) {
    const jetzt = await page.evaluate(() => Math.round(document.scrollingElement.scrollTop));
    if (jetzt === vorher) return jetzt;
    vorher = jetzt;
    await page.waitForTimeout(400);
  }
  return vorher;
};

const lies = async (off) => {
  for (let pass = 0; pass < 3; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await ruhe();
    const ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
    );
    if (Math.abs(ist + off) <= 8) break;
  }
  await page.waitForTimeout(600);
  return page.evaluate(() => (window.__dna ? window.__dna() : null));
};

const zeilen = [];
for (const off of STELLEN) zeilen.push({ off, ...(await lies(off)) });

/* Ganz nach unten und wieder zurueck, danach dieselben Stellen erneut. */
await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight; });
await page.waitForTimeout(2500);
await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
await page.waitForTimeout(2500);
const rueck = [];
for (const off of [...STELLEN].reverse()) rueck.push({ off, ...(await lies(off)) });

const n0 = zeilen[0];
const zeig = (r) => r.map((z) => {
  const px = (z.travel - n0.travel) * z.periodePx;
  return `off=${String(z.off).padStart(5)} travel=${z.travel.toFixed(5)}`
    + ` weg=${Math.round(z.weg)} versatzPx=${px.toFixed(1)}`
    + ` mitlauf=${z.off ? (px / z.off).toFixed(4) : '-'}`;
}).join('\n');

console.log('periodePx=' + n0.periodePx.toFixed(1) + '  spann=' + n0.spann.toFixed(4)
  + '  unit=' + n0.unit.toFixed(1) + '  stride=' + JSON.stringify(n0.stride)
  + '  mitte=' + n0.mitte.toFixed(1));
console.log('--- hin ---');
console.log(zeig(zeilen));
console.log('--- zurueck, nach Durchlauf ganz nach unten und ganz nach oben ---');
console.log(zeig(rueck));
const abw = STELLEN.map((o) => {
  const a = zeilen.find((z) => z.off === o).travel;
  const b = rueck.find((z) => z.off === o).travel;
  return Math.abs(a - b) * n0.periodePx;
});
console.log('groeszte Abweichung hin gegen zurueck: ' + Math.max(...abw).toFixed(3) + ' px');
await browser.close();
