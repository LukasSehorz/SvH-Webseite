/**
 * Serie von Aufnahmen desselben Elements im festen Takt — für Animationsprüfung.
 *   node _ref/burst.mjs <url> <cssSelector> <outDir> <anzahl> <abstandMs>
 */
import { chromium } from 'playwright';
import fs from 'fs';

const url = process.argv[2];
const sel = process.argv[3];
const outDir = process.argv[4];
const count = parseInt(process.argv[5] || '6', 10);
const gap = parseInt(process.argv[6] || '400', 10);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(1200);

const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 500) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(80);
}
const el = await page.$(sel);
if (!el) { console.log('NICHT GEFUNDEN ' + sel); await browser.close(); process.exit(1); }
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

for (let i = 0; i < count; i++) {
  await el.screenshot({ path: `${outDir}/${String(i).padStart(2, '0')}.png` });
  await page.waitForTimeout(gap);
}
console.log('ok ' + count + ' Bilder in ' + outDir);
await browser.close();
