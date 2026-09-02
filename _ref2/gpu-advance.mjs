/**
 * Wirkt der Scroll-Schub, und laeuft die Drehung beim Hochscrollen
 * weiter statt rueckwaerts?
 *
 * Beide Durchgaenge beginnen und enden an DERSELBEN Scrollposition und
 * dauern gleich lang. Der Unterschied im Bild ist also allein der
 * aufgelaufene Drehwinkel.
 *   a) Ruhe: 8 s stehen bleiben.
 *   b) Schub: 8 s hin und her scrollen (endet wieder am Ausgangspunkt).
 *   c) Nur hoch: erst 900 px runter springen, dann gleichmaeszig
 *      hochscrollen bis zum Ausgangspunkt.
 * Danach jeweils 2,5 s beruhigen und schieszen.
 *   node _ref2/gpu-advance.mjs <prefix> --off=400
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const prefix = process.argv.slice(2).find((a) => !a.startsWith('--')) || '_ref2/tmp/a';
const off = parseInt(flags.off || '400', 10);
fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
const top = await page.evaluate(
  () => Math.round(document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
const home = top + off;

const settle = async () => {
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, home);
  await page.waitForTimeout(2500);
};

const runs = {
  idle: async () => { await page.waitForTimeout(8000); },
  shake: async () => {
    await page.evaluate(async (base) => {
      const t0 = performance.now();
      while (performance.now() - t0 < 8000) {
        const p = ((performance.now() - t0) / 1000) % 2;
        const d = p < 1 ? p : 2 - p;
        document.scrollingElement.scrollTop = base + d * 500;
        await new Promise((r) => requestAnimationFrame(r));
      }
      document.scrollingElement.scrollTop = base;
    }, home);
  },
  upOnly: async () => {
    await page.evaluate(async (base) => {
      document.scrollingElement.scrollTop = base + 900;
      await new Promise((r) => setTimeout(r, 500));
      const t0 = performance.now();
      while (performance.now() - t0 < 7500) {
        const k = Math.min(1, (performance.now() - t0) / 7500);
        document.scrollingElement.scrollTop = base + 900 * (1 - k);
        await new Promise((r) => requestAnimationFrame(r));
      }
      document.scrollingElement.scrollTop = base;
    }, home);
  },
};

const out = {};
for (const [name, fn] of Object.entries(runs)) {
  await settle();
  const a = `${prefix}-${name}-a.png`;
  await page.screenshot({ path: a });
  const t0 = await page.evaluate(() => performance.now());
  await fn();
  await settle();
  const t1 = await page.evaluate(() => performance.now());
  const b = `${prefix}-${name}-b.png`;
  await page.screenshot({ path: b });
  out[name] = { a, b, elapsedMs: Math.round(t1 - t0) };
}

console.log(JSON.stringify({ out, errors }, null, 1));
await browser.close();
