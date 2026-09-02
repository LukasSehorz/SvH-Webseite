/**
 * Wie schnell laeuft das Gewebe in Ruhe, und wieviel gibt der Scroll dazu?
 *
 * Gelesen wird ueber den Entwicklungshaken window.__dna. Der Flusz ist ein
 * Anteil der Periode, mit der Periodenlaenge in Bildpunkten wird daraus
 * unmittelbar das sichtbare Tempo. Ein Blockvergleich am Bild taugt hier
 * nicht, weil er auf dem Punktraster einrastet; das ist in der Uebergabe
 * unter Falle zehn festgehalten.
 *
 *   node _ref2/ruhetempo.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

for (let pass = 0; pass < 2; pass++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
  await page.waitForTimeout(pass === 0 ? 900 : 3500);
}

const lies = () => page.evaluate(() => {
  const d = window.__dna();
  return { t: performance.now(), flow: d.flow, boost: d.boost, periodePx: d.periodePx };
});

/* Ruhe. Der Flusz laeuft nur um, deshalb wird die Umwicklung mitgezaehlt. */
const a = await lies();
await page.waitForTimeout(20000);
const b = await lies();
let df = b.flow - a.flow;
while (df < 0) df += 1;
const ruhe = (df * a.periodePx) / ((b.t - a.t) / 1000);

/* Scrollen. Das Rad wird in kleinen Schritten gedreht, damit Lenis eine
   echte Geste sieht und nicht einen Sprung. */
const c = await lies();
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(50);
}
const d = await lies();
let df2 = d.flow - c.flow;
while (df2 < 0) df2 += 1;
const beiScroll = (df2 * c.periodePx) / ((d.t - c.t) / 1000);

console.log(`periodePx=${a.periodePx.toFixed(1)}`);
console.log(`Ruhe          ${ruhe.toFixed(2)} px/s   (ueber ${((b.t - a.t) / 1000).toFixed(1)} s)`);
console.log(`beim Scrollen ${beiScroll.toFixed(2)} px/s  (ueber ${((d.t - c.t) / 1000).toFixed(1)} s, boost am Ende ${d.boost.toFixed(6)})`);
console.log(`Verhaeltnis   ${(beiScroll / ruhe).toFixed(2)}`);
await browser.close();
