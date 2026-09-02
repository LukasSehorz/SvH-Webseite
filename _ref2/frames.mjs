/**
 * Bilderserie durch eine einzelne Sektion.
 *
 *   node _ref2/frames.mjs <url> <outDir> <selector> [anzahl] [breite] [hoehe]
 *
 * Faehrt in gleichmaessigen Schritten durch den Scrollbereich der Sektion
 * und schiesst dabei Viewport-Bilder. Gedacht fuer gepinnte Buehnen, bei
 * denen ein einzelner Seitenstreifen nichts aussagt.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3100';
const outDir = process.argv[3] || '_ref2/shots/frames';
const selector = process.argv[4] || '#referenzen';
const steps = parseInt(process.argv[5] || '6', 10);
const width = parseInt(process.argv[6] || '1440', 10);
const height = parseInt(process.argv[7] || '900', 10);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference',
});

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 300));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 300)));

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2200);

// Einmal komplett durchfahren, damit alle Reveals ausgeloest sind.
const full = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < full; y += 500) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(110);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);

const box = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { top: rect.top + window.scrollY, height: rect.height };
}, selector);

if (!box) {
  console.log(JSON.stringify({ error: 'selector not found', selector }));
  await browser.close();
  process.exit(1);
}

const span = Math.max(1, box.height - height);
for (let i = 0; i < steps; i += 1) {
  const y = Math.round(box.top + (span * i) / Math.max(1, steps - 1));
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, `${String(i).padStart(2, '0')}_y${y}.png`) });
}

fs.writeFileSync(
  path.join(outDir, 'report.json'),
  JSON.stringify({ url, selector, box, steps, width, height, errors }, null, 2),
);

console.log(JSON.stringify({ selectorTop: Math.round(box.top), selectorHeight: Math.round(box.height), errors }));
await browser.close();
