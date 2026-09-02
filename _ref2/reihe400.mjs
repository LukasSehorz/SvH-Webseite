/**
 * Eine Bildreihe ueber den GANZEN Scrollweg der Marketing-Sektion, im
 * festen Abstand von 400 Bildpunkten.
 *
 *   node _ref2/reihe400.mjs <port> <ordner> [schritt] [von] [bis]
 *
 * Der Nullpunkt ist die Oberkante der Sektion, also derselbe Anker, den
 * _ref2/blick.mjs benutzt. Jedes Bild traegt seinen Versatz im Namen, und
 * die Sektionsmasze werden am Anfang einmal ausgelesen und mitgeschrieben,
 * damit sich die Zahl der Kreuzungen spaeter nachrechnen laeszt.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const DIR = process.argv[3] || '_ref2/tmp/reihe';
const SCHRITT = Number(process.argv[4] || 400);
const VON = Number(process.argv[5] || 0);
const BIS = Number(process.argv[6] || 4800);

fs.mkdirSync(DIR, { recursive: true });
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
await page.waitForTimeout(9000);

const masze = await page.evaluate(() => {
  const se = document.scrollingElement;
  const sek = document.getElementById('marketing');
  const cv = document.querySelector('canvas[data-engine]');
  const zone = cv ? cv.closest('[class*="dnaZone"], [class*="Zone"], section, div') : null;
  const r = sek.getBoundingClientRect();
  const cr = cv ? cv.getBoundingClientRect() : null;
  return {
    sektionTop: Math.round(r.top + se.scrollTop),
    sektionHoehe: Math.round(r.height),
    dokument: se.scrollHeight,
    fenster: window.innerHeight,
    canvas: cr ? { w: Math.round(cr.width), h: Math.round(cr.height) } : null,
    zoneKlasse: zone ? zone.className : null,
  };
});
console.log('masze', JSON.stringify(masze));
fs.writeFileSync(`${DIR}/masze.json`, JSON.stringify(masze, null, 1));

const setzen = async (off) => {
  for (let i = 0; i < 8; i++) {
    const top = await page.evaluate(() => {
      const se = document.scrollingElement;
      const el = document.getElementById('marketing');
      return Math.round(el.getBoundingClientRect().top + se.scrollTop);
    });
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + off);
    await page.waitForTimeout(700);
    const ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
    );
    if (Math.abs(ist + off) <= 6) return ist;
  }
  return null;
};

for (let off = VON; off <= BIS; off += SCHRITT) {
  const ist = await setzen(off);
  if (ist === null) console.error(`WARNUNG versatz ${off} sitzt nicht`);
  await page.waitForTimeout(1800);
  const name = `${DIR}/v${String(off).padStart(5, '0')}.png`;
  await page.screenshot({ path: name });
  console.log(name);
}
await browser.close();
