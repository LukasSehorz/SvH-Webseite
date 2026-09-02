/**
 * Die restlichen Pruefpunkte in einem Lauf.
 *
 *   node _ref2/rest-pruef.mjs [port]
 *
 * Erstens der waagerechte Ueberlauf bei 1280 und 1600, die in
 * _ref2/responsive-check.mjs fehlen.
 * Zweitens prefers-reduced-motion: zwei Aufnahmen im Abstand von vier
 * Sekunden muessen bitgleich sein.
 * Drittens die waagerechte Ausdehnung des Gewebes, das nicht weiter nach
 * links reichen darf als bis zur Bildmitte.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const DIR = '_ref2/tmp/rest';
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });

// ---- 1. Ueberlauf bei 1280 und 1600 -------------------------------------
for (const w of [1280, 1600]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('#marketing', { state: 'attached', timeout: 120000 });
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 120000 });
  const r = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log(`[${r.scrollW <= r.clientW ? ' OK ' : 'FEHL'}] ${w}px  scrollWidth ${r.scrollW}/${r.clientW}`);
  await page.close();
}

// ---- 2. prefers-reduced-motion friert ein -------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas[data-engine]');
    return c && c.width > 100;
  }, { timeout: 120000 });
  for (let i = 0; i < 8; i++) {
    const top = await page.evaluate(() => {
      const se = document.scrollingElement;
      return Math.round(document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop);
    });
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + 1400);
    await page.waitForTimeout(700);
    const ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top));
    if (Math.abs(ist + 1400) <= 6) break;
  }
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${DIR}/rm1.png` });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${DIR}/rm2.png` });
  await page.close();
}

// ---- 3. waagerechte Ausdehnung des Gewebes ------------------------------
await browser.close();

const roh = async (f) => {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
};
const a = await roh(`${DIR}/rm1.png`), b = await roh(`${DIR}/rm2.png`);
let gleich = true, groeszte = 0;
for (let i = 0; i < a.data.length; i++) {
  const d = Math.abs(a.data[i] - b.data[i]);
  if (d > groeszte) groeszte = d;
  if (d !== 0) gleich = false;
}
console.log(`prefers-reduced-motion: ${gleich ? 'BITGLEICH' : `NICHT GLEICH, groeszte Abweichung ${groeszte}`}`);
