/**
 * Screenshot einer einzelnen Sektion.
 *   node _ref/sec.mjs <url> <cssSelector> <outFile> [breite]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2];
const sel = process.argv[3];
const out = process.argv[4];
const width = parseInt(process.argv[5] || '1440', 10);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(1500);

const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 400) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(90);
}
await page.waitForTimeout(1200);

const el = await page.$(sel);
if (!el) {
  console.log('NICHT GEFUNDEN: ' + sel);
  await browser.close();
  process.exit(1);
}
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
fs.mkdirSync(path.dirname(out), { recursive: true });
await el.screenshot({ path: out });
console.log('ok ' + out);
await browser.close();
