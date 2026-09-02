/**
 * Wandert die Struktur mit dem Scrollweg?
 *
 * Faehrt eine Liste von Scrollstellen relativ zur Oberkante der
 * Marketing-Sektion ab, schieszt an jeder ein Bild, faehrt dieselbe Liste
 * anschlieszend RUECKWAERTS ab und schieszt noch einmal. Aus dem Vergleich
 * der beiden Durchgaenge folgt, ob sich die Bewegung sauber umkehrt.
 *
 * Der Sprung laeuft ueber document.scrollingElement, weil Lenis
 * window.scrollTo abfaengt, und er wird zweimal gesetzt, weil die erste
 * Zuweisung von der Traegheit ueberschrieben wird.
 *
 *   node _ref2/wandersicht.mjs <prefix> [--bare] [--w=1440] [--h=900]
 *                              [--stellen=-150,0,214,...] [--rueck]
 *                              [--extrem]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const rest = args.filter((a) => !a.startsWith('--'));
const prefix = rest[0] || '_ref2/tmp/wandern/w';
const width = parseInt(flags.w || '1440', 10);
const height = parseInt(flags.h || '900', 10);
const stellen = (flags.stellen || '-150,0,214,429,643,857,1072')
  .split(',').map((v) => parseInt(v, 10));

fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);

if ('bare' in flags) {
  await page.addStyleTag({
    content: `body > *:not(main) { visibility: hidden !important; }
              [class*="dnaInner"], [class*="dnaZoneContent"] { visibility: hidden !important; }
              [class*="dnaWash"] { display: none !important; }`,
  });
  await page.waitForTimeout(400);
}

const springe = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 900 : 3000);
  }
};

const out = [];
const schiesz = async (name, off) => {
  await springe(off);
  const f = `${prefix}${name}.png`;
  await page.screenshot({ path: f });
  out.push({ f, off });
};

/* Hin. */
for (const off of stellen) await schiesz(`h${String(off).replace('-', 'm')}`, off);

/* Die Extremfaelle. Ganz nach unten durchscrollen und wieder zurueck,
   damit sich zeigt, ob irgendwo etwas haengenbleibt. */
if ('extrem' in flags) {
  await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight; });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
  await page.waitForTimeout(2500);
}

/* Zurueck. */
if ('rueck' in flags) {
  for (const off of [...stellen].reverse()) await schiesz(`r${String(off).replace('-', 'm')}`, off);
}

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
console.log(JSON.stringify({ out, overflow, errors }, null, 1));
await browser.close();
