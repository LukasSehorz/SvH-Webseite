/**
 * Reihe B: Ruhe ueber die Zeit. Eine Seite, ein Sprung auf Versatz 1400,
 * danach acht Bilder im Abstand von acht Sekunden. Nach dem Vorbild von
 * _ref2/abschluss.mjs, aber ohne Auswertung -- nur die Aufnahmen.
 *
 * Oeffnet den Browser EINMAL (die Maschine traegt keinen zweiten).
 *
 *   node _ref2/ruhe-serie.mjs [port]
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const OFF = 1400;
fs.mkdirSync('_ref2/unser', { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 180000,
});

// Auf die Leinwand warten und nicht auf die Uhr.
await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
await page.waitForTimeout(9000);
// Auf VORHANDEN warten, nicht auf SICHTBAR -- die Sektion blendet erst ein,
// wenn ihr Eintrittsbeobachter ausloest, und der loest erst nach dem Scrollen aus.
await page.waitForSelector('#marketing', { state: 'attached', timeout: 240000 });

// Sprung auf Versatz 1400, ueber scrollingElement (Lenis faengt window.scrollTo
// ab) und zweifach gesetzt, weil die erste Zuweisung von der Traegheit
// ueberschrieben wird. Schleife misst nach und wiederholt, bis die Oberkante sitzt.
let ist = null;
for (let i = 0; i < 8; i++) {
  const top = await page.evaluate(() => {
    const se = document.scrollingElement;
    const el = document.getElementById('marketing');
    return Math.round(el.getBoundingClientRect().top + se.scrollTop);
  });
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + OFF);
  await page.waitForTimeout(900);
  ist = await page.evaluate(
    () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
  );
  if (Math.abs(ist + OFF) <= 6) break;
}
if (ist === null || Math.abs(ist + OFF) > 6) {
  console.error(`WARNUNG: Oberkante sitzt bei ${ist} statt bei ${-OFF}`);
}
await page.waitForTimeout(3200);

for (let i = 0; i < 8; i++) {
  const f = `_ref2/unser/b${i}.png`;
  await page.screenshot({ path: f });
  console.log(f);
  if (i < 7) await page.waitForTimeout(8000);
}

await browser.close();
