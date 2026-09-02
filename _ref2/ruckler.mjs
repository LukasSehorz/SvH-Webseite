/**
 * Sucht Ruckler und sagt, WANN sie auftreten.
 *
 * Der Sammeltest meldete einen Ausreiszer von 208 ms bei 441 Messungen,
 * nannte aber nicht den Zeitpunkt. Ein Ruckler in den ersten Sekunden ist
 * das Uebersetzen der Schattierer und faellt einem Besucher kaum auf; einer
 * mitten im Lauf ist ein echter Mangel.
 *
 * Gemessen wird ueber requestAnimationFrame auf der Seite selbst, weil
 * jede Messung von auszen die Zeiten verfaelscht.
 *
 *   node _ref2/ruckler.mjs [port] [sekunden]
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3100';
const SEK = Number(process.argv[3] || 40);

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});
await page.waitForTimeout(2500);

// Auf die Marketing-Sektion, damit das Gewebe wirklich zeichnet.
for (let i = 0; i < 6; i++) {
  const top = await page.evaluate(() => {
    const se = document.scrollingElement;
    return Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop,
    );
  });
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
  await page.waitForTimeout(800);
  const ist = await page.evaluate(
    () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
  );
  if (Math.abs(ist) <= 6) break;
}

await page.evaluate((sek) => {
  window.__ruck = { t: [], start: performance.now() };
  let last = performance.now();
  const tick = (now) => {
    window.__ruck.t.push([now - window.__ruck.start, now - last]);
    last = now;
    if (now - window.__ruck.start < sek * 1000) requestAnimationFrame(tick);
    else window.__ruck.fertig = true;
  };
  requestAnimationFrame(tick);
}, SEK);

await page.waitForTimeout(SEK * 1000 + 2500);

const erg = await page.evaluate(() => {
  const t = window.__ruck.t.slice(1);
  const d = t.map((x) => x[1]).sort((a, b) => a - b);
  const p = (q) => d[Math.min(d.length - 1, Math.floor(q * d.length))];
  const lang = t.filter((x) => x[1] > 33).map((x) => [Math.round(x[0]), Math.round(x[1])]);
  return {
    n: t.length,
    p50: +p(0.5).toFixed(1),
    p95: +p(0.95).toFixed(1),
    p99: +p(0.99).toFixed(1),
    max: +d[d.length - 1].toFixed(1),
    lang,
  };
});

console.log(`Bilder ${erg.n}  p50 ${erg.p50}  p95 ${erg.p95}  p99 ${erg.p99}  max ${erg.max}`);
if (erg.lang.length === 0) {
  console.log('kein Bild ueber 33 ms');
} else {
  console.log(`${erg.lang.length} Bilder ueber 33 ms, als [ms seit Start, Dauer]:`);
  console.log(JSON.stringify(erg.lang));
}
await browser.close();
