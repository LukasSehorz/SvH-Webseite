/**
 * Das vierte Bild je Stelle: Schrift unsichtbar UND Leinwand aus.
 * Aus t minus b folgt das Gewebe allein, ohne jeden Grund.
 *
 *   node _ref2/pr-grund.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const OUT = '_ref2/tmp/pr';
const STELLEN = [0, 240, 420, 600, 840, 1080, 1200, 1440, 1680, 1900, 2050];

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const springe = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 800 : 2600);
  }
};

const setze = (css) => page.evaluate((c) => {
  let s = document.getElementById('prStil');
  if (!s) { s = document.createElement('style'); s.id = 'prStil'; document.head.appendChild(s); }
  s.textContent = c;
}, css);

for (const off of STELLEN) {
  await springe(off);
  await page.evaluate(() => {
    let k = 0;
    for (const el of document.querySelectorAll('main *, header *')) {
      if (el.children.length) continue;
      const t = (el.textContent || '').trim();
      if (t.length < 3) continue;
      el.setAttribute('data-pr', String(k)); k += 1;
    }
  });
  await setze('[data-pr] { visibility: hidden !important; } canvas[aria-hidden="true"] { display: none !important; }');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/b${String(off).replace('-', 'm')}.png` });
  await setze('');
  await page.waitForTimeout(300);
  console.log(`${off} fertig`);
}
await browser.close();
