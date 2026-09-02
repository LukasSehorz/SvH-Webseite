/**
 * Bildserie ueber die ganze Zone, dazu je Stelle ein zweites Bild ohne
 * Schrift. Aus dem Paar folgt die Streuung des Grundes hinter der
 * Schrift, der hellste Grundbildpunkt und der Kontrast.
 *
 *   node _ref2/pr-bild.mjs [port]
 *
 * Die Schrift wird ueber visibility ausgeblendet, das aendert die
 * Anordnung nicht. Der Sprung laeuft ueber document.scrollingElement,
 * weil Lenis window.scrollTo abfaengt, und er wird zweimal gesetzt.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const OUT = '_ref2/tmp/pr';
fs.mkdirSync(OUT, { recursive: true });

const STELLEN = [-200, -100, 0, 120, 240, 360, 420, 480, 600, 720, 840, 960,
  1080, 1200, 1320, 1440, 1560, 1680, 1800, 1900, 2000, 2100];
const MIT_TEXTMESSUNG = [0, 420, 840, 1200, 1440, 1900];

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 300)); });
page.on('pageerror', (e) => fehler.push('PAGEERROR: ' + String(e).slice(0, 300)));

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

/* Alle sichtbaren Textzeilen im rechten Feld einsammeln. */
const textkaesten = () => page.evaluate(() => {
  const raus = [];
  const alles = document.querySelectorAll('main *');
  for (const el of alles) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (t.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 6) continue;
    if (r.bottom < 4 || r.top > window.innerHeight - 4) continue;
    /* Nur was in die rechte Bildhaelfte hineinreicht. */
    if (r.right < window.innerWidth * 0.46) continue;
    const cs = getComputedStyle(el);
    raus.push({
      text: t.slice(0, 60),
      l: Math.round(r.left), t: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      farbe: cs.color, groesze: cs.fontSize, gewicht: cs.fontWeight,
    });
  }
  return raus;
});

const daten = [];
for (const off of STELLEN) {
  await springe(off);
  const name = String(off).replace('-', 'm');
  await page.screenshot({ path: `${OUT}/s${name}.png` });
  const eintrag = { off, kaesten: null };
  if (MIT_TEXTMESSUNG.includes(off)) {
    eintrag.kaesten = await textkaesten();
    await page.addStyleTag({
      content: `main, main *, header, header * { color: transparent !important; }
                main svg, header svg { visibility: hidden !important; }`,
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/g${name}.png` });
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('style')].pop();
      if (s && s.textContent.includes('color: transparent')) s.remove();
    });
    await page.waitForTimeout(400);
  }
  daten.push(eintrag);
}

fs.writeFileSync(`${OUT}/kaesten.json`, JSON.stringify(daten, null, 1));
console.log('Stellen: ' + STELLEN.join(','));
console.log('Konsolenmeldungen: ' + (fehler.length ? fehler.join(' | ') : 'keine'));
await browser.close();
