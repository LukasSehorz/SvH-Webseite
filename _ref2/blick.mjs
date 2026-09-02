/**
 * Eine schlichte Aufnahme zum Ansehen, ohne jede Auswertung.
 *
 *   node _ref2/blick.mjs <port> <ziel.png> [versatz]
 *
 * Ohne Versatz sitzt sie auf der Oberkante der Marketing-Sektion. Der
 * Sprung laeuft ueber document.scrollingElement, weil Lenis window.scrollTo
 * abfaengt, und er wird zweimal gesetzt, weil die erste Zuweisung von der
 * Traegheit ueberschrieben wird.
 */
import { starten } from './browser.mjs';

const PORT = process.argv[2] || '3100';
const OUT = process.argv[3] || '_ref2/tmp/blick.png';
const OFF = Number(process.argv[4] || 0);

const { browser, aufraeumen } = await starten();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});
// Auf die Leinwand warten und nicht auf die Uhr. Seit three.js nachgeladen
// wird, steht sie im gebauten Stand erst nach dem Hydrieren im Baum, und
// auf dieser Maschine dauert das lange. Vier Aufnahmen sind daran verloren
// gegangen, alle sahen aus wie eine leere Sektion.
await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
await page.waitForTimeout(9000);
// Die Sektion wandert waehrend des Ladens noch, weil Schriften nachkommen
// und der Entwicklungsserver zwischendurch neu uebersetzt. Ein einmaliger
// Sprung landet deshalb gelegentlich in den Referenzen. Die Schleife misst
// nach jedem Sprung nach und wiederholt ihn, bis die Oberkante sitzt.
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
await page.screenshot({ path: OUT });
console.log(OUT);
await aufraeumen();
