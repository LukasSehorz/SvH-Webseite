/**
 * Screenshot-Werkzeug für die Qualitätsprüfung.
 *
 *   node _ref/shoot.mjs <url> <outDir> [breite] [hoehe]
 *
 * Beispiele:
 *   node _ref/shoot.mjs http://localhost:3100 _ref/shots/desktop 1440 900
 *   node _ref/shoot.mjs http://localhost:3100 _ref/shots/mobile   390 844
 *
 * Erzeugt:
 *   NN_y<scrollY>.png   — Viewport-Ausschnitte über die ganze Seite (wie die Referenz)
 *   sec-<id>.png        — je ein Bild pro <section id="..."> bzw. data-shot-Attribut
 *   report.json         — Seitenhöhe, gefundene Sektionen, Konsolenfehler, Overflow-Check
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3100';
const outDir = process.argv[3] || '_ref/shots/desktop';
const width = parseInt(process.argv[4] || '1440', 10);
const height = parseInt(process.argv[5] || '900', 10);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 300));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 300)));

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);

// Einmal langsam durchscrollen, damit alle Reveal-Animationen ausgelöst wurden
const first = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < first; y += 400) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(130);
}
await page.waitForTimeout(1800);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1400);

const pageHeight = await page.evaluate(() => document.body.scrollHeight);

// Horizontaler Überlauf?
const overflow = await page.evaluate(() => {
  const de = document.documentElement;
  const bad = [];
  if (de.scrollWidth > de.clientWidth + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
        if (bad.length >= 12) break;
      }
    }
  }
  return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders: bad };
});

// Viewport-Streifen
let i = 0;
for (let y = 0; y < pageHeight; y += height) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.join(outDir, `${String(i).padStart(2, '0')}_y${y}.png`) });
  i++;
}

// Einzelne Sektionen
const sections = await page.evaluate(() =>
  [...document.querySelectorAll('main > *, footer, header')].map((el, idx) => ({
    idx,
    id: el.id || el.getAttribute('data-shot') || el.tagName.toLowerCase() + '-' + idx,
  }))
);

const handles = await page.$$('main > *, footer, header');
for (let k = 0; k < handles.length; k++) {
  const name = (sections[k]?.id || 'sec-' + k).replace(/[^a-z0-9_-]/gi, '');
  try {
    await handles[k].scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await handles[k].screenshot({ path: path.join(outDir, `sec-${String(k).padStart(2, '0')}-${name}.png`) });
  } catch (e) {
    // Element evtl. 0px hoch — überspringen
  }
}

fs.writeFileSync(
  path.join(outDir, 'report.json'),
  JSON.stringify({ url, width, height, pageHeight, strips: i, sections, overflow, errors }, null, 2)
);

console.log(JSON.stringify({ pageHeight, strips: i, overflow: overflow.offenders.length, errors: errors.length }));
await browser.close();
