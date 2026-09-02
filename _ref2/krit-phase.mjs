/**
 * Bleibt die Sanduhr ueber die ganze Umdrehung stehen?
 * Sitzt bei Versatz 0 und schiesst 14 Bilder im Abstand von 9 s.
 * Bei IDLE_RATE 0,04 sind das 0,36 Bogenmasz je Bild, zusammen 4,7 —
 * also deutlich mehr als eine halbe Umdrehung des Bandes.
 */
import { chromium } from 'playwright';
import fs from 'fs';
fs.mkdirSync('_ref2/tmp/ph', { recursive: true });
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
const top = await page.evaluate(() => {
  const se = document.scrollingElement;
  return Math.round(document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop);
});
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
await page.waitForTimeout(1500);
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
await page.waitForTimeout(2500);
for (let i = 0; i < 14; i++) {
  await page.screenshot({ path: `_ref2/tmp/ph/p${String(i).padStart(2, '0')}.png` });
  await page.waitForTimeout(9000);
}
console.log('fertig');
await browser.close();
