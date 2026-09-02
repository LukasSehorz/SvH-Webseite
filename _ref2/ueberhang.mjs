// Findet die Elemente, die bei einer Breite ueber den rechten Rand ragen.
import { starten } from './browser.mjs';

const PORT = process.argv[2] || '3239';
const PFAD = process.argv[3] || '/marketing/werbetafeln';
const BREITE = Number(process.argv[4] || 390);

const { browser, aufraeumen } = await starten();
const page = await browser.newPage({
  viewport: { width: BREITE, height: 844 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}${PFAD}`, {
  waitUntil: 'domcontentloaded',
  timeout: 180000,
});
await page.waitForTimeout(4000);

// Einmal durchfahren, damit auch die Faecher offen sind.
await page.evaluate(async () => {
  const warten = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 400) {
    document.scrollingElement.scrollTop = y;
    await warten(120);
  }
});
await page.waitForTimeout(1500);

const funde = await page.evaluate((breite) => {
  const raus = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > breite + 1) {
      raus.push({
        tag: el.tagName,
        klasse: String(el.className).slice(0, 90),
        rechts: Math.round(r.right),
        links: Math.round(r.left),
      });
    }
  }
  return raus.slice(0, 40);
}, BREITE);

console.log(JSON.stringify(funde, null, 1));
console.log(
  JSON.stringify(
    await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      fenster: document.documentElement.clientWidth,
    })),
  ),
);
await page.close();
await aufraeumen();
