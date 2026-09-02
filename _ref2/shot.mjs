/**
 * Gezielter Sektions-Screenshot für den Prüf-Agenten.
 *
 *   node _ref2/shot.mjs <selector> <outFile> [breite] [hoehe] [mode]
 *
 * mode: "element" (Standard, schießt das Element) | "viewport" (Viewport an
 *       der Oberkante des Elements) | "top" (Viewport ganz oben)
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const selector = process.argv[2] || '.hero';
const outFile = process.argv[3] || '_ref2/shots/tmp.png';
const width = parseInt(process.argv[4] || '1440', 10);
const height = parseInt(process.argv[5] || '900', 10);
const mode = process.argv[6] || 'element';

fs.mkdirSync(path.dirname(outFile), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 240));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 240)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2200);

// Einmal durchscrollen, damit alle Reveals ausgelöst sind
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 500) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(110);
}
await page.waitForTimeout(1400);

const el = await page.$(selector);
if (!el) {
  console.log(JSON.stringify({ error: 'Selektor nicht gefunden: ' + selector, errors }));
  await browser.close();
  process.exit(1);
}

if (mode === 'top') {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: outFile });
} else if (mode === 'viewport') {
  const box = await el.boundingBox();
  await page.evaluate((v) => window.scrollTo(0, v), Math.max(0, Math.round(box.y)));
  await page.waitForTimeout(900);
  await page.screenshot({ path: outFile });
} else {
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await el.screenshot({ path: outFile });
}

const box = await el.boundingBox();
console.log(JSON.stringify({ out: outFile, box: box && { w: Math.round(box.width), h: Math.round(box.height) }, errors }));
await browser.close();
