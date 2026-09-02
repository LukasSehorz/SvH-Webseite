/**
 * Zeitreihe an EINER Scrollposition, echte Grafikkarte.
 *   node _ref2/gpu-series.mjs <outPrefix> --off=350 --n=6 --gap=2000 [--w --h]
 * Danach optional Scroll-Schub messen: --burst=1200 springt einmal um
 * diesen Betrag und schiesst die Erholung.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const prefix = process.argv.slice(2).find((a) => !a.startsWith('--')) || '_ref2/tmp/s';
const off = parseInt(flags.off || '350', 10);
const n = parseInt(flags.n || '6', 10);
const gap = parseInt(flags.gap || '2000', 10);
const width = parseInt(flags.w || '1440', 10);
const height = parseInt(flags.h || '900', 10);

fs.mkdirSync(path.dirname(prefix), { recursive: true });
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
const top = await page.evaluate(() => {
  const el = document.getElementById('marketing');
  return Math.round(el.getBoundingClientRect().top + document.scrollingElement.scrollTop);
});
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + off);
await page.waitForTimeout(3000);

// Bildzeiten messen
await page.evaluate(() => {
  window.__ft = [];
  let last = performance.now();
  const tick = (t) => { window.__ft.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});

// Der Auslöser braucht selbst Zeit. Ohne Zeitstempel misst man den
// Abstand der ANFRAGEN, nicht den der Bilder — und rechnet sich das
// Tempo schoen. Deshalb die Uhr der Seite mitschreiben.
const out = [];
const stamps = [];
for (let i = 0; i < n; i++) {
  const f = `${prefix}-t${i}.png`;
  const t0 = await page.evaluate(() => performance.now());
  await page.screenshot({ path: f });
  const t1 = await page.evaluate(() => performance.now());
  stamps.push(+((t0 + t1) / 2).toFixed(0));
  out.push(f);
  if (i < n - 1) await page.waitForTimeout(gap);
}
const gaps = stamps.slice(1).map((v, i) => v - stamps[i]);

const ft = await page.evaluate(() => {
  const a = window.__ft.slice(5).sort((x, y) => x - y);
  return { n: a.length, p50: +a[Math.floor(a.length * 0.5)].toFixed(2), p95: +a[Math.floor(a.length * 0.95)].toFixed(2) };
});

console.log(JSON.stringify({ out, gapsMs: gaps, frameTimes: ft, errors }, null, 1));
await browser.close();
