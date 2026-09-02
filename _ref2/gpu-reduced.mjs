/** prefers-reduced-motion: friert die Struktur ein?
 *  Und welche Ressource fehlt (404)?
 *   node _ref2/gpu-reduced.mjs */
import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('_ref2/tmp', { recursive: true });
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const errors = [];
const failed = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 120)}`); });

// Der Port ist angebbar, damit derselbe Lauf gegen den Meszserver auf 3210
// geht und nicht nur gegen den Entwicklungsserver.
await page.goto(`http://localhost:${process.argv[2] || '3100'}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
const top = await page.evaluate(
  () => Math.round(document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + 600);
await page.waitForTimeout(3000);
await page.screenshot({ path: '_ref2/tmp/red-a.png' });
await page.waitForTimeout(6000);
await page.screenshot({ path: '_ref2/tmp/red-b.png' });

const canvasOk = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  return c ? { w: c.width, h: c.height, hidden: c.getAttribute('aria-hidden') } : null;
});
console.log(JSON.stringify({ canvasOk, errors, failed: [...new Set(failed)] }, null, 1));
await browser.close();
