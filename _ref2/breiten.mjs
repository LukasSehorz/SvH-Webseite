/**
 * Waagerechter Ueberlauf und Gewebeanteil ueber alle gepruefen Breiten.
 *   node _ref2/breiten.mjs [port]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
const PORT = process.argv[2] || '3100';
const MASZE = [[1920, 1080], [1600, 900], [1440, 900], [1280, 800], [390, 844]];
const browser = await chromium.launch({ headless: false });
for (const [w, h] of MASZE) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2500);
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
    await page.waitForTimeout(pass === 0 ? 900 : 2600);
  }
  const info = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    dna: window.__dna ? window.__dna() : null,
  }));
  const f = `_ref2/tmp/wandern/br-${w}x${h}.png`;
  await page.screenshot({ path: f });
  const { data } = await sharp(f).extract({ left: Math.round(w * 0.5), top: 0, width: Math.round(w * 0.45), height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  let lit = 0;
  for (let i = 0; i < data.length; i++) if (data[i] > 60) lit++;
  const d = info.dna;
  console.log(`${w}x${h}  ueberlauf=${info.scrollW > info.innerW + 1}`
    + ` (scrollW ${info.scrollW} innerW ${info.innerW})  gewebe=${(100 * lit / data.length).toFixed(1)}%`
    + (d ? `  unit=${d.unit.toFixed(1)} spann=${d.spann.toFixed(3)} periodePx=${d.periodePx.toFixed(0)}`
      + ` rand=${((d.periodePx - h) / 2).toFixed(0)} stride=${JSON.stringify(d.stride)}` : ''));
  await page.close();
}
await browser.close();
