/**
 * Bewegungsprobe. Acht Bilder im Sekundentakt, dazwischen nichts.
 * Zusaetzlich wird direkt in der Seite gezaehlt, wie oft das Bild neu
 * gezeichnet wird und wie weit die Phase laeuft.
 */
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = '_ref2/tmp';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const se = document.scrollingElement;
  const el = document.getElementById('marketing');
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top + se.scrollTop) };
});
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, info.top);
await page.waitForTimeout(3000);

// laeuft ueberhaupt eine Schleife?
const rafRate = await page.evaluate(() => new Promise((res) => {
  let n = 0; const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else res(n); };
  requestAnimationFrame(tick);
}));

// Zustand der Leinwaende
const canvases = await page.evaluate(() => Array.from(document.querySelectorAll('canvas')).map((c) => {
  const r = c.getBoundingClientRect();
  const cs = getComputedStyle(c);
  return { w: c.width, h: c.height, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
    cls: c.className, op: cs.opacity, vis: cs.visibility, mask: (cs.maskImage || cs.webkitMaskImage || '').slice(0, 120),
    parentCls: c.parentElement ? c.parentElement.className : '', display: cs.display };
}));

const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);

for (let i = 0; i < 8; i++) {
  await page.screenshot({ path: `${OUT}/mo${i}.png` });
  await page.waitForTimeout(1000);
}
console.log(JSON.stringify({ rafRate, reduced, canvases }, null, 1));
await browser.close();
