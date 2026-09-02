/**
 * Die Faltstelle des Weltversatzes.
 *
 * uTravel wird auf zwei Perioden gefaltet, und die Faltstelle liegt genau
 * beim Scrollstand der Sektionsoberkante, also mitten in der Zone. Das
 * Bild musz dort stetig bleiben, denn nach zwei Perioden legt die
 * Verdrehung volle 2 PI zu und die Flaeche stimmt Punkt fuer Punkt wieder
 * ueberein. Diese Probe weist das am fertigen Bild nach.
 *
 *   node _ref2/faltprobe.mjs [port]
 */
import { chromium } from 'playwright';
const PORT = process.argv[2] || '3100';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);
const lies = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 700 : 2200);
  }
  const d = await page.evaluate(() => window.__dna());
  await page.screenshot({ path: `_ref2/tmp/wandern/falt${String(off).replace('-', 'm')}.png` });
  return d;
};
for (const off of [-40, -20, -1, 0, 1, 20, 40]) {
  const d = await lies(off);
  console.log(`off=${String(off).padStart(4)}  travel=${d.travel.toFixed(6)}`
    + `  gleichwertig=${(d.travel > 1 ? d.travel - 2 : d.travel).toFixed(6)}`
    + `  erwarteterVersatzPx=${(((d.travel > 1 ? d.travel - 2 : d.travel)) * d.periodePx).toFixed(1)}`);
}
await browser.close();
