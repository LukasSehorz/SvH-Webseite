/**
 * Der Grund STRENG INNERHALB der Navigationspille.
 *
 *   node _ref2/pille.mjs [port] [ziel-praefix]
 *
 * Gemessen wird im Kasten der Pille, um drei Bildpunkte nach innen
 * gerueckt, damit weder Rahmen noch Kantenglaettung mitzaehlen. Die
 * Schrift wird zuvor unsichtbar geschaltet, sonst misst man sie statt des
 * Grundes. Ausgewiesen werden Mittelwert, Streuung und hellster
 * Bildpunkt; das Ziel lautet Streuung hoechstens 3 und Hoechstwert
 * hoechstens 40.
 *
 * Nebenbei werden alle Konsolenmeldungen der Seite gesammelt, denn der
 * fehlende Seitenkopf meldet sich genau dort.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const PRE = process.argv[3] || '_ref2/tmp/pille';
const STELLEN = [0, 420, 840, 1200, 1440];
fs.mkdirSync('_ref2/tmp', { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const meldungen = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') meldungen.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => meldungen.push('PAGEERROR: ' + String(e).slice(0, 200)));
page.on('requestfailed', (r) => meldungen.push('REQFAIL: ' + r.url().slice(0, 160)));
page.on('response', (r) => { if (r.status() >= 400) meldungen.push(`HTTP ${r.status()}: ${r.url().slice(0, 160)}`); });

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

const kasten = () => page.evaluate(() => {
  /* Die rechte Pille ist die, die den Verweis auf Kontakt traegt. Der
     helle Knopf fuer das Strategiegespraech sitzt im selben Kasten und
     wird abgeschnitten, sonst misst man ihn statt des durchscheinenden
     Grundes. */
  for (const el of document.querySelectorAll('header .nav-pill, .nav-pill')) {
    if (!/Kontakt/i.test(el.textContent || '')) continue;
    const r = el.getBoundingClientRect();
    let rechts = r.right;
    for (const k of el.querySelectorAll('a, button')) {
      const t = (k.textContent || '').trim();
      if (/Kontakt/i.test(t)) continue;
      const q = k.getBoundingClientRect();
      if (q.left > r.left && q.left < rechts) rechts = q.left;
    }
    return {
      l: Math.round(r.left), t: Math.round(r.top),
      w: Math.round(rechts - r.left), h: Math.round(r.height),
    };
  }
  return null;
});

console.log('versatz   kasten                mittel  streuung  max   Urteil');
for (const off of STELLEN) {
  await springe(off);
  const k = await kasten();
  if (!k) { console.log(`${off}: keine Pille gefunden`); continue; }
  await page.evaluate(() => {
    let s = document.getElementById('pilleStil');
    if (!s) { s = document.createElement('style'); s.id = 'pilleStil'; document.head.appendChild(s); }
    s.textContent = 'header *, main * { color: transparent !important; } header svg, main svg { visibility: hidden !important; }';
  });
  await page.waitForTimeout(450);
  const datei = `${PRE}-${off}.png`;
  await page.screenshot({ path: datei });
  await page.evaluate(() => { const s = document.getElementById('pilleStil'); if (s) s.textContent = ''; });
  await page.waitForTimeout(300);

  /* Die Pille ist voll abgerundet, ihre linke Kappe ist ein Halbkreis vom
     Halbmesser der halben Hoehe. Links wird deshalb um genau diesen
     Halbmesser eingerueckt, sonst liegen die Ecken des Meszkastens
     auszerhalb der Pille und melden den blanken Grund. */
  const kappe = Math.round(k.h / 2) + 1;
  const l = k.l + kappe, t = k.t + 4, w = k.w - kappe - 4, h = k.h - 8;
  const { data, info } = await sharp(datei)
    .extract({ left: l, top: t, width: w, height: h })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const n = info.width * info.height;
  let sum = 0, mx = 0;
  const werte = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const L = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];
    werte[i] = L; sum += L; if (L > mx) mx = L;
  }
  const m = sum / n;
  let v = 0;
  for (let i = 0; i < n; i++) v += (werte[i] - m) ** 2;
  const sd = Math.sqrt(v / n);
  const marken = [];
  if (sd > 3) marken.push('STREUUNG');
  if (mx > 40) marken.push('MAX');
  console.log(`${String(off).padStart(5)}   ${l},${t},${w},${h}`.padEnd(30)
    + `${m.toFixed(1).padStart(6)}${sd.toFixed(1).padStart(9)}${mx.toFixed(0).padStart(6)}   ${marken.join(' ')}`);
}

console.log('Konsole: ' + (meldungen.length ? [...new Set(meldungen)].join(' | ') : 'keine Meldung'));
await browser.close();
