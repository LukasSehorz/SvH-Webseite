/**
 * Bewegungsfeld unseres Gewebes in denselben Bereichen wie bei der
 * Referenz. Zwei Aufnahmen im festen Abstand, danach Blockvergleich.
 *
 *   node _ref2/felder.mjs [abstandMs]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const GAP = Number(process.argv[2] || 2000);
const OUT = '_ref2/tmp/pruef';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
await page.addStyleTag({
  content: `body > *:not(main) { visibility: hidden !important; }
            [class*="dnaInner"] { visibility: hidden !important; }
            [class*="dnaWash"] { display: none !important; }`,
});
for (let p = 0; p < 2; p++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top));
  await page.waitForTimeout(p === 0 ? 700 : 3200);
}

const shots = [];
for (let i = 0; i < 4; i++) {
  const f = `${OUT}/feld${i}.png`;
  await page.screenshot({ path: f });
  shots.push(f);
  if (i < 3) await page.waitForTimeout(GAP);
}
// Hochscrollen: kehrt sich die Richtung um?
await page.evaluate(async () => {
  const se = document.scrollingElement; const s0 = se.scrollTop; const t0 = performance.now();
  await new Promise((r) => {
    const st = () => {
      const p = Math.min(1, (performance.now() - t0) / 700);
      se.scrollTop = s0 - p * 500; if (p < 1) requestAnimationFrame(st); else r();
    }; st();
  });
});
await page.screenshot({ path: `${OUT}/feldHoch0.png` });
await page.waitForTimeout(GAP);
await page.screenshot({ path: `${OUT}/feldHoch1.png` });
await browser.close();

// Unsere Bilder sind 1440 breit, die Fenster der Referenz gelten fuer 1085.
const s = 1425 / 1085;
const wins = [
  ['oberer Lappen links', 640, 120 - 52, 200, 200],
  ['oberer Lappen rechts', 880, 120 - 52, 200, 200],
  ['unterer Lappen links', 620, 500 - 52, 200, 200],
  ['unterer Lappen rechts', 850, 470 - 52, 200, 200],
  ['nahe der Taille', 700, 290 - 52, 150, 150],
];
const match = async (fa, fb, win) => {
  const W = win.width, H = win.height;
  const a = await sharp(fa).extract(win).greyscale().raw().toBuffer();
  const b = await sharp(fb).extract(win).greyscale().raw().toBuffer();
  let best = null;
  for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) {
    let sum = 0, n = 0;
    for (let y = 16; y < H - 16; y++) for (let x = 16; x < W - 16; x++) {
      sum += Math.abs(a[y * W + x] - b[(y + dy) * W + x + dx]); n++;
    }
    const v = sum / n; if (!best || v < best.v) best = { v, dx, dy };
  }
  return best;
};
console.log(`UNSER STAND (dx/dy je Bildpaar, Abstand ${GAP} ms)`);
for (const [lab, l, t, w, h] of wins) {
  const win = { left: Math.round(l * s), top: Math.round(t * s), width: Math.round(w * s), height: Math.round(h * s) };
  const res = [];
  for (let k = 0; k < shots.length - 1; k++) {
    const m = await match(shots[k], shots[k + 1], win);
    res.push(`${m.dx}/${m.dy}`);
  }
  const hoch = await match(`${OUT}/feldHoch0.png`, `${OUT}/feldHoch1.png`, win);
  console.log(`  ${lab.padEnd(24)} ruhe: ${res.join('  ')}   nach Hochscroll: ${hoch.dx}/${hoch.dy}`);
}
