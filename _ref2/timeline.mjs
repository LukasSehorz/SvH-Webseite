/**
 * Zeitserie eines Elements. Fuer bewegte Szenen, bei denen ein einzelnes
 * Bild nichts ueber Tempo und Ruhe aussagt.
 *
 *   node _ref2/timeline.mjs <url> <outDir> <selector> [frames] [intervalMs] [breite] [hoehe]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3100';
const outDir = process.argv[3] || '_ref2/shots/timeline';
const selector = process.argv[4] || '[data-shot="orbs"]';
const frames = parseInt(process.argv[5] || '9', 10);
const interval = parseInt(process.argv[6] || '400', 10);
const width = parseInt(process.argv[7] || '1440', 10);
const height = parseInt(process.argv[8] || '900', 10);

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
await page.waitForTimeout(2000);

await page.waitForSelector(selector, { timeout: 20000 });

// Element mittig in den Viewport holen. Ein Element-Screenshot wuerde das
// WebGL-Bild verlieren, deshalb wird ein Ausschnitt des Viewports geschossen.
await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  window.scrollTo(0, window.scrollY + rect.top - (window.innerHeight - rect.height) / 2);
}, selector);
await page.waitForTimeout(3000);

// Optional eine Spalte anfahren, um den Hover-Zustand zu pruefen.
if (process.env.HOVER) {
  const hover = await page.$(process.env.HOVER);
  if (hover) {
    await hover.hover();
    await page.waitForTimeout(900);
  }
}

const measure = () =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const w = Math.min(Math.round(rect.width), window.innerWidth);
    const h = Math.min(Math.round(rect.height), window.innerHeight);
    return {
      x: Math.max(0, Math.min(Math.round(rect.left), window.innerWidth - w)),
      y: Math.max(0, Math.min(Math.round(rect.top), window.innerHeight - h)),
      width: w,
      height: h,
    };
  }, selector);

// Ein Screenshot mit clip verliert in Chromium den WebGL-Inhalt. Deshalb
// wird der volle Viewport geschossen und danach mit sharp beschnitten.
for (let i = 0; i < frames; i += 1) {
  const clip = await measure();
  const buffer = await page.screenshot();
  const file = path.join(outDir, `t${String(i).padStart(2, '0')}.png`);
  if (clip) {
    await sharp(buffer)
      .extract({ left: clip.x, top: clip.y, width: clip.width, height: clip.height })
      .toFile(file);
  } else {
    fs.writeFileSync(file, buffer);
  }
  if (i < frames - 1) await page.waitForTimeout(interval);
}

fs.writeFileSync(
  path.join(outDir, 'report.json'),
  JSON.stringify({ url, selector, frames, interval, width, height, errors }, null, 2),
);

console.log(JSON.stringify({ frames, errors }));
await browser.close();
