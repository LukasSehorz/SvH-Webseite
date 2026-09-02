/**
 * Screenshot mit ECHTER Grafikkarte (headless:false).
 *
 *   node _ref2/gpu-shot.mjs <outPrefix> [offsets...] [--w=1440] [--h=900]
 *
 * Springt hart ueber document.scrollingElement.scrollTop (Lenis faengt
 * window.scrollTo ab), wartet danach 3000 ms und schiesst den Viewport.
 * offset = Pixel relativ zur Oberkante von #marketing. "hero" = 0.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const rest = args.filter((a) => !a.startsWith('--'));
const prefix = rest[0] || '_ref2/tmp/gpu';
const offsets = (rest.slice(1).length ? rest.slice(1) : ['0']).map(Number);
const width = parseInt(flags.w || '1440', 10);
const height = parseInt(flags.h || '900', 10);
const wait = parseInt(flags.wait || '3000', 10);

fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 200));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);

// --bare blendet ALLES auszer der Struktur aus. Nur zum MESSEN: die
// Silhouette laesst sich sonst nicht von Ueberschriften und Ringen
// trennen. Aendert nichts am Projekt, nur an dieser einen Sitzung.
// Zwei Fehler, die hier jahrelang unbemerkt blieben und jede
// Formmessung verfaelscht haben.
//
// Erstens die Abfrage selbst. Ein Aufruf "--bare" ohne Gleichheitszeichen
// liefert aus Object.fromEntries den Wert undefined, die Pruefung auf
// "ungleich undefined" ist damit IMMER falsch und die Blende griff nie.
//
// Zweitens der Wahlschalter. Die Klasse dnaZoneContent steht gar nicht im
// Baum; der Inhalt der Sektion haengt an dnaInner. Wer nur nach
// dnaZoneContent sucht, laeszt Ueberschrift und Fliesztext stehen, und
// deren linke Kante wandert dann als vermeintliche Gewebekante in die
// Messung.
if ('bare' in flags) {
  await page.addStyleTag({
    content: `body > *:not(main) { visibility: hidden !important; }
              [class*="dnaInner"], [class*="dnaZoneContent"] { visibility: hidden !important; }
              [class*="dnaWash"] { display: none !important; }`,
  });
  await page.waitForTimeout(400);
}

const info = await page.evaluate(() => {
  const el = document.getElementById('marketing');
  const r = el ? el.getBoundingClientRect() : null;
  const se = document.scrollingElement;
  return {
    found: !!el,
    top: r ? Math.round(r.top + se.scrollTop) : 0,
    h: r ? Math.round(r.height) : 0,
    docH: se.scrollHeight,
  };
});

const out = [];
for (const off of offsets) {
  // Die Sektionshoehe verschiebt sich noch, waehrend Bilder nachladen.
  // Deshalb VOR jedem Bild neu messen und danach nachziehen.
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top
        + document.scrollingElement.scrollTop),
    );
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 600 : wait);
  }
  const f = `${prefix}-${off}.png`;
  await page.screenshot({ path: f });
  out.push(f);
}

// Horizontaler Ueberlauf?
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);

console.log(JSON.stringify({ marketing: info, out, overflow, errors }, null, 1));
await browser.close();
