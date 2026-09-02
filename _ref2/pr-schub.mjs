/**
 * Punkt zwei des Auftrags: wird die Bewegung beim Scrollen schneller?
 *
 * Gemessen wird AUSSCHLIESZLICH innerhalb der Zone, denn auszerhalb
 * haelt der Sichtbarkeitswaechter die Schleife an und der Flusz friert
 * ein. Ein Lauf ueber die ganze Seite meldet deshalb ein zu kleines
 * Tempo.
 *
 *   node _ref2/pr-schub.mjs [port]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 200)); });
page.on('requestfailed', (r) => fehler.push('ANFRAGE: ' + r.url().slice(0, 160) + ' ' + (r.failure()?.errorText || '')));
page.on('response', (r) => { if (r.status() >= 400) fehler.push(`HTTP ${r.status()} ${r.url().slice(0, 160)}`); });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const dna = () => page.evaluate(() => ({ ...window.__dna(), t: performance.now() }));
const springe = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 800 : 2600);
  }
};

/* Ruhe als Bezug, innerhalb der Zone. */
await springe(300);
const a = await dna();
await page.waitForTimeout(15000);
const b = await dna();
let d1 = b.flow - a.flow; while (d1 < 0) d1 += 1;
const ruhe = (d1 * a.periodePx) / ((b.t - a.t) / 1000);
console.log(`Ruhe innerhalb der Zone: ${ruhe.toFixed(3)} px/s ueber ${((b.t - a.t) / 1000).toFixed(1)} s`);

/* Sanftes Scrollen, das die Zone nicht verlaeszt. */
for (const [name, schritt, pause] of [['sanft', 18, 60], ['zuegig', 45, 30], ['schnell', 90, 16]]) {
  await springe(200);
  const c = await dna();
  let bmax = 0, vmax = 0;
  const n = Math.max(6, Math.round(700 / schritt));
  for (let i = 0; i < n; i++) {
    await page.mouse.wheel(0, schritt);
    if (pause) await page.waitForTimeout(pause);
    const s = await dna();
    if (s.boost > bmax) bmax = s.boost;
  }
  const e = await dna();
  let d2 = e.flow - c.flow; while (d2 < 0) d2 += 1;
  const dt = (e.t - c.t) / 1000;
  const flusz = (d2 * c.periodePx) / dt;
  const versatz = Math.abs(e.travel - c.travel) * c.periodePx;
  const weg = Math.abs(e.weg - c.weg);
  console.log(`${name.padEnd(8)} Scrollweg ${weg.toFixed(0).padStart(5)} px in ${dt.toFixed(1)} s`
    + ` (${(weg / dt).toFixed(0)} px/s)  Flusz ${flusz.toFixed(2)} px/s`
    + `  boostMax ${bmax.toFixed(6)} (${(100 * bmax / 0.00232).toFixed(0)} Prozent von BOOST_MAX)`
    + `  Weltversatz ${versatz.toFixed(0)} px  Gesamttempo ${((versatz + d2 * c.periodePx) / dt).toFixed(0)} px/s`
    + `  Verhaeltnis Flusz zu Ruhe ${(flusz / ruhe).toFixed(2)}`);
}

/* Groeszenaenderung mitten in der Zone. */
await springe(600);
const v1 = await dna();
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(2500);
const v2 = await dna();
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(2500);
const v3 = await dna();
console.log(`Groeszenaenderung: travel ${v1.travel.toFixed(6)} -> ${v2.travel.toFixed(6)} -> ${v3.travel.toFixed(6)}`
  + `  periodePx ${v1.periodePx.toFixed(0)} -> ${v2.periodePx.toFixed(0)} -> ${v3.periodePx.toFixed(0)}`
  + `  stride ${JSON.stringify(v1.stride)} -> ${JSON.stringify(v2.stride)} -> ${JSON.stringify(v3.stride)}`);
console.log(`  zurueck auf denselben Wert: ${v1.travel === v3.travel ? 'ja' : 'NEIN, Abweichung ' + (Math.abs(v1.travel - v3.travel) * v1.periodePx).toFixed(3) + ' px'}`);

/* Reiter verlassen und wiederkommen. */
await springe(600);
const t1 = await dna();
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.waitForTimeout(2000);
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await page.waitForTimeout(2000);
const t2 = await dna();
console.log(`Reiterwechsel: travel ${t1.travel.toFixed(6)} -> ${t2.travel.toFixed(6)}  stride ${JSON.stringify(t2.stride)}  relief unveraendert=${JSON.stringify(t1.stride) === JSON.stringify(t2.stride)}`);

console.log('Meldungen: ' + (fehler.length ? [...new Set(fehler)].join('\n  ') : 'keine'));
await browser.close();
