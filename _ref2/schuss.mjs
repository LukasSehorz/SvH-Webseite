/**
 * Aufnahme auf der ECHTEN Seite, mit Wartezeiten, die auch einem kalten
 * Entwicklungsserver reichen.
 *
 * Der Vorgaenger hat sich hier eine Runde geholt: blick.mjs wartet nach
 * domcontentloaded nur 2500 ms, und wenn der Server die Seite in dem
 * Moment erst uebersetzt, steht auf dem Bild weder Text noch Gewebe. Die
 * Aufnahme sieht dann harmlos aus und alle Zahlen daraus sind wertlos.
 * Deshalb wird hier auf das erste gezeichnete Bild der Leinwand gewartet
 * und erst danach geschossen.
 *
 *   node _ref2/schuss.mjs <ziel.png> [versatz] [--w=1440] [--h=900] [--warte=3500]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const rest = args.filter((a) => !a.startsWith('--'));
const out = rest[0] || '_ref2/tmp/mat/schuss.png';
const off = Number(rest[1] || 0);
const width = parseInt(flags.w || '1440', 10);
const height = parseInt(flags.h || '900', 10);
const warte = parseInt(flags.warte || '3500', 10);

fs.mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce' in flags ? 'reduce' : 'no-preference',
});
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 180000 });

// Auf die fertige Seite warten, nicht auf eine feste Frist. Erst wenn die
// Leinwand im Baum steht und die Ueberschrift der Sektion sichtbar ist,
// hat der Server uebersetzt und die Einblendung ist durch.
await page.waitForSelector('#marketing', { timeout: 180000 });
await page.waitForFunction(() => {
  const c = document.querySelector('#marketing, [class*="dnaZone"]')
    && document.querySelector('canvas[aria-hidden="true"]');
  return !!c;
}, null, { timeout: 180000 });
await page.waitForTimeout(2000);

for (let pass = 0; pass < 2; pass++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = Math.max(0, v); }, top + off);
  await page.waitForTimeout(pass === 0 ? 1200 : warte);
}

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
await page.screenshot({ path: out });
console.log(JSON.stringify({ out, off, width, height, overflow, errors }));
await browser.close();
