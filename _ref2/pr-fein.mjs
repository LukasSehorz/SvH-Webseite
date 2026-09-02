/**
 * Drei Bilder je Scrollstelle, damit sich Schrift, Grund und Gewebe
 * sauber trennen lassen.
 *
 *   node _ref2/pr-fein.mjs [port] [breite] [hoehe]
 *
 *   t<versatz>.png  Schrift unsichtbar, Gewebe da   -> Grund hinter Schrift
 *   c<versatz>.png  Leinwand aus, Schrift da        -> Helligkeit der Schrift
 *   n<versatz>.png  Zoneninhalt aus                 -> Gewebe allein
 *
 * Ausgeblendet wird ueber visibility, das aendert die Anordnung nicht.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const BR = Number(process.argv[3] || 1440);
const HO = Number(process.argv[4] || 900);
const OUT = BR === 1440 ? '_ref2/tmp/pr' : `_ref2/tmp/pr${BR}`;
fs.mkdirSync(OUT, { recursive: true });

/* Die Stellen lassen sich ab dem vierten Argument einzeln vorgeben, damit
   eine Zwischenmessung nicht alle elf abfahren muss. Ohne Vorgabe bleibt
   es bei der vollen Reihe. */
const VORGABE = process.argv.slice(5).map(Number).filter((v) => !Number.isNaN(v));
const STELLEN = VORGABE.length ? VORGABE : (BR < 700
  ? [0, 390, 800, 1400, 2000]
  : [0, 240, 420, 600, 840, 1080, 1200, 1440, 1680, 1900, 2050]);

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: BR, height: HO }, deviceScaleFactor: 1 });
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

/* Blattelemente mit Text im Bild einsammeln und ihnen eine Kennung geben. */
const sammle = () => page.evaluate(() => {
  const raus = [];
  let k = 0;
  for (const el of document.querySelectorAll('main *, header *')) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (t.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 6) continue;
    if (r.bottom < 4 || r.top > window.innerHeight - 4) continue;
    el.setAttribute('data-pr', String(k));
    /* Der Kasten des Elementes ist NICHT der Kasten der Schrift. Eine
       Aufzaehlungszeile fuellt die ganze Inhaltsspalte, also 590
       Bildpunkte, waehrend die Buchstaben nur ueber die ersten 270 bis
       350 reichen; die uebrigen 240 Bildpunkte liegen im dichten Gewebe
       und haben mit der Lesbarkeit nichts zu tun. Ueber einen Bereich
       ueber den Textknoten liefert der Browser die wirklichen Zeilenkaesten. */
    let zeile = null;
    try {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const rects = [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
      if (rects.length) {
        const li = Math.min(...rects.map((q) => q.left));
        const to = Math.min(...rects.map((q) => q.top));
        const re = Math.max(...rects.map((q) => q.right));
        const bo = Math.max(...rects.map((q) => q.bottom));
        zeile = { l: Math.round(li), t: Math.round(to), w: Math.round(re - li), h: Math.round(bo - to), rechts: Math.round(re) };
      }
    } catch { zeile = null; }
    raus.push({
      id: k, text: t.slice(0, 55),
      l: Math.round(r.left), t: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      rechts: Math.round(r.right),
      zeile,
      groesze: getComputedStyle(el).fontSize,
    });
    k += 1;
  }
  return raus;
});

const setze = (css) => page.evaluate((c) => {
  let s = document.getElementById('prStil');
  if (!s) { s = document.createElement('style'); s.id = 'prStil'; document.head.appendChild(s); }
  s.textContent = c;
}, css);

const daten = [];
for (const off of STELLEN) {
  await springe(off);
  const name = String(off).replace('-', 'm');
  const kaesten = await sammle();

  await setze('[data-pr] { visibility: hidden !important; }');
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/t${name}.png` });

  await setze('canvas[aria-hidden="true"] { display: none !important; }');
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/c${name}.png` });

  await setze(`[class*="dnaZoneContent"], header, footer { visibility: hidden !important; }`);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/n${name}.png` });

  await setze('');
  await page.waitForTimeout(350);
  daten.push({ off, kaesten });
  console.log(`${off} fertig, ${kaesten.length} Kaesten`);
}

fs.writeFileSync(`${OUT}/fein.json`, JSON.stringify(daten, null, 1));
await browser.close();
