/**
 * Scroll-Schub messen, echte Grafikkarte.
 * Faehrt in kleinen Schritten RUNTER, dann wieder HOCH und schiesst
 * jeweils zwei Bilder im Abstand von 1/3 s. Damit laesst sich pruefen,
 * ob der Schub in beide Richtungen gleich wirkt.
 *   node _ref2/gpu-burst.mjs <prefix> --off=900
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const prefix = process.argv.slice(2).find((a) => !a.startsWith('--')) || '_ref2/tmp/b';
const off = parseInt(flags.off || '900', 10);
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

// Gleichmaessig scrollen: 40 Schritte a 15 px je Bild -> ~900 px/s.
// Start und Ziel liegen beide INNERHALB der Marketing-Sektion, damit in
// allen Bildern dieselbe Stelle im Blick ist.
const glide = async (dir) => {
  const start = off + (dir > 0 ? 0 : 600);
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + start);
  await page.waitForTimeout(2600);
  await page.evaluate(async ({ base, d }) => {
    for (let i = 0; i < 40; i++) {
      document.scrollingElement.scrollTop = base + d * i * 15;
      await new Promise((r) => requestAnimationFrame(r));
    }
  }, { base: top + start, d: dir });
};

const shots = {};
const gaps = {};
// Der Auslöser braucht selbst 300 bis 1500 ms. Ohne Zeitstempel misst
// man den Abstand der ANFRAGEN, nicht den der Bilder.
const pair = async (name) => {
  const a = `${prefix}-${name}-a.png`;
  const b = `${prefix}-${name}-b.png`;
  const t0 = await page.evaluate(() => performance.now());
  await page.screenshot({ path: a });
  const t1 = await page.evaluate(() => performance.now());
  await page.screenshot({ path: b });
  const t2 = await page.evaluate(() => performance.now());
  shots[name] = [a, b];
  gaps[name] = Math.round((t1 + t2) / 2 - (t0 + t1) / 2);
};

for (const [name, dir] of [['down', 1], ['up', -1]]) {
  await glide(dir);
  await pair(name);
  await page.waitForTimeout(4000);
}
// Ruhe zum Vergleich
await pair('idle');

console.log(JSON.stringify({ shots, gaps, errors }, null, 1));
await browser.close();
