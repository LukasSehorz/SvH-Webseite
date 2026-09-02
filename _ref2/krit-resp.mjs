/**
 * Breiten einzeln pruefen, jeweils frisch geladen, damit der
 * Punktzahl-Regler nicht schon zugeschlagen hat.
 */
import { chromium } from 'playwright';
import fs from 'fs';
fs.mkdirSync('_ref2/tmp/resp', { recursive: true });
const sizes = [[1920, 1080], [1600, 900], [1440, 900], [1280, 800], [390, 844]];
const res = [];
for (const [w, h] of sizes) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 120)));
  await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2500);
  for (let p = 0; p < 2; p++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
    await page.waitForTimeout(p === 0 ? 700 : 3000);
  }
  await page.screenshot({ path: `_ref2/tmp/resp/r${w}.png` });
  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    canvas: (() => { const c = document.querySelector('canvas.marketing-module__Pq1DSG__dnaBand') || Array.from(document.querySelectorAll('canvas')).pop();
      return c ? { w: c.width, h: c.height } : null; })(),
  }));
  res.push({ size: `${w}x${h}`, ...info, errors: [...new Set(errs)] });
  await browser.close();
}
console.log(JSON.stringify(res, null, 1));
