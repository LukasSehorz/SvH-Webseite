/**
 * Nur die Bildrate, damit sich zwei Codestaende unter denselben
 * Bedingungen unmittelbar hintereinander vergleichen lassen.
 *
 *   node _ref2/rate.mjs [port] [label]
 *
 * Gemessen wird genau so wie in pruef-rest.mjs, also ueber die Abstaende
 * zwischen den Bildanforderungen, mit den ersten zwoelf Werten verworfen.
 * Der Sprung laeuft ueber document.scrollingElement, weil Lenis
 * window.scrollTo abfaengt, und er wird zweimal gesetzt.
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const LABEL = process.argv[3] || 'stand';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

for (let pass = 0; pass < 2; pass++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
  await page.waitForTimeout(pass === 0 ? 800 : 2600);
}

await page.evaluate(() => {
  window.__ft = []; let last = performance.now();
  const t = (n) => { window.__ft.push(n - last); last = n; requestAnimationFrame(t); };
  requestAnimationFrame(t);
});
await page.waitForTimeout(8000);
const ft = (await page.evaluate(() => window.__ft.slice(12))).sort((a, b) => a - b);
const p = (q) => ft[Math.floor(ft.length * q)].toFixed(1);
console.log(`${LABEL.padEnd(14)} n=${ft.length}  p50=${p(0.5)}  p95=${p(0.95)}  max=${ft[ft.length - 1].toFixed(1)}`);
await browser.close();
