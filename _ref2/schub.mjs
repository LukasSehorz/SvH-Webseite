/**
 * Wie viel staerker bewegt sich das Gewebe beim Scrollen als in Ruhe?
 *
 * krit-drift taugt dafuer nicht. Unsere Rasterreihen sitzen auf fester
 * Bildhoehe, die Drehung verschiebt sie waagerecht statt senkrecht; die
 * Wanderung, die krit-drift beim Scrollen findet, ist der mitlaufende
 * Grund, nicht die Struktur. Der Beweis: sie bleibt bei 60 Bildpunkten
 * je Sekunde, egal ob BOOST_MAX auf 0,1 oder auf 0,045 steht.
 *
 * Hier bleibt deshalb NUR die klebende Leinwand stehen, Text, Schleier
 * und Grundverlauf sind ausgeblendet. Gemessen wird die mittlere
 * Bildaenderung ueber je 0,6 Sekunden, einmal in Ruhe und einmal
 * waehrend eines Scrolls von 600 Bildpunkten.
 *
 *   node _ref2/schub.mjs
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const OUT = '_ref2/tmp';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);
await page.addStyleTag({
  content: `[class*="dnaZoneContent"], header, nav, footer { visibility: hidden !important; }
            [class*="dnaWash"] { display: none !important; }
            [class*="dnaZoneBg"] { background: none !important; }`,
});

const jump = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 600 : 3000);
  }
};

const WIN = { left: 620, top: 60, width: 800, height: 800 };
const energie = async (fa, fb) => {
  const a = await sharp(fa).extract(WIN).greyscale().raw().toBuffer();
  const b = await sharp(fb).extract(WIN).greyscale().raw().toBuffer();
  let d = 0, e = 0, m = 0;
  for (let i = 0; i < a.length; i++) { d += Math.abs(a[i] - b[i]); m += a[i]; }
  d /= a.length; m /= a.length;
  for (let i = 0; i < a.length; i++) e += Math.abs(a[i] - m);
  e /= a.length;
  return { diff: +d.toFixed(3), eigenkontrast: +e.toFixed(2), norm: +(d / e).toFixed(4) };
};

await jump(0);
await page.screenshot({ path: `${OUT}/sb-r1.png` });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/sb-r2.png` });
const ruhe = await energie(`${OUT}/sb-r1.png`, `${OUT}/sb-r2.png`);

await jump(0);
await page.screenshot({ path: `${OUT}/sb-s1.png` });
await page.evaluate(async () => {
  const se = document.scrollingElement; const s0 = se.scrollTop; const t0 = performance.now();
  await new Promise((r) => { const st = () => { const p = Math.min(1, (performance.now() - t0) / 600);
    se.scrollTop = s0 + p * 600; if (p < 1) requestAnimationFrame(st); else r(); }; st(); });
});
await page.screenshot({ path: `${OUT}/sb-s2.png` });
const schub = await energie(`${OUT}/sb-s1.png`, `${OUT}/sb-s2.png`);

console.log(JSON.stringify({
  ruhe, schub, verhaeltnis: +(schub.norm / (ruhe.norm || 1e-9)).toFixed(2),
}, null, 1));
await browser.close();
