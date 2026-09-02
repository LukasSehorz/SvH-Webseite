/**
 * Nahaufnahmen der Seite /ki auf einem schmalen Geraet. Der Ablauf und
 * das Kachelfeld werden einzeln aufgenommen, weil sie in der ganzen
 * Seite zu klein sind, um sie zu beurteilen.
 */
import { starten } from './browser.mjs';
import path from 'node:path';
import fs from 'node:fs';

const PORT = process.env.PORT || 3232;
const ZIEL = path.resolve('.impeccable/review/ki');
fs.mkdirSync(ZIEL, { recursive: true });
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

const { browser, aufraeumen } = await starten();

try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/ki`, { waitUntil: 'networkidle' });
  await warte(1000);

  const feld = await page.$('.ki-hero-field');
  await feld.scrollIntoViewIfNeeded();
  await warte(1600);
  await feld.screenshot({ path: path.join(ZIEL, 'mobil-kacheln.png') });
  console.log('-> mobil-kacheln.png');

  const schritte = await page.$$('.ki-flow-step');
  for (const [i, li] of schritte.entries()) {
    await li.scrollIntoViewIfNeeded();
    await warte(1700);
    await li.screenshot({ path: path.join(ZIEL, `mobil-schritt-${i + 1}.png`) });
    console.log('->', `mobil-schritt-${i + 1}.png`);
  }
} finally {
  await aufraeumen();
}
