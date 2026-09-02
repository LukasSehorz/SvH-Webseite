/**
 * Kurzpruefung fuer die eigenen Sektionen.
 * Ueberlauf, Konsolenfehler und Anzahl der h1 je Breite.
 *
 *   node _ref2/audit.mjs [basis] [pfad,pfad,...]
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3100';
const paths = (process.argv[3] || '/,/marketing').split(',');
const widths = [390, 768, 1024, 1440, 1920];

const browser = await chromium.launch();
const out = [];

for (const path of paths) {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 200));
    });
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

    await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(1800);

    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(600);

    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      if (de.scrollWidth > de.clientWidth + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
            bad.push(
              el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 50),
            );
            if (bad.length >= 6) break;
          }
        }
      }
      return {
        scrollWidth: de.scrollWidth,
        clientWidth: de.clientWidth,
        offenders: bad,
        h1: document.querySelectorAll('h1').length,
        alts: [...document.querySelectorAll('img')].filter((i) => !i.alt).length,
      };
    });

    out.push({ path, width, ...info, errors });
    await page.close();
  }
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
