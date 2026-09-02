/**
 * Aufnahmereihe fuer den Durchgang "eins".
 *
 *   node _ref2/eins-shot.mjs <port> <zielordner> <versatz,versatz,...>
 *
 * Der Anker sitzt auf der Oberkante von #marketing und wird nach jedem
 * Sprung nachgemessen, weil Lenis die erste Zuweisung verschluckt. Es
 * wird auf die Leinwand gewartet und nicht auf die Uhr; das ist der
 * Grund, aus dem frueher leere Sektionen aufgenommen worden sind.
 *
 * Zusaetzlich schreibt der Lauf die tatsaechliche Hoehe der DNA-Zone in
 * Bildpunkten nach <zielordner>/zone.json. Ohne diese Zahl lassen sich
 * die Prozentangaben der senkrechten Maske nicht nachrechnen.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const DIR = process.argv[3] || '_ref2/eins/v0';
const OFFS = (process.argv[4] || '1400').split(',').map(Number);

fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('#marketing', { state: 'attached', timeout: 120000 });
await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
// Auf ein wirklich gezeichnetes Bild warten und nicht auf die Uhr: die
// Leinwand steht im Baum, bevor der erste Rahmen darauf liegt.
await page.waitForFunction(() => {
  const c = document.querySelector('canvas[data-engine]');
  return c && c.width > 100 && c.height > 100;
}, { timeout: 120000 });
await page.waitForTimeout(6000);

// Die Geometrie der Zone, einmal am Anfang.
const geo = await page.evaluate(() => {
  const se = document.scrollingElement;
  const sec = document.getElementById('marketing');
  const alle = [...document.querySelectorAll('*')];
  const treffer = (teil) => alle.filter(e => [...e.classList].some(c => c.includes(teil)));
  const rect = (e) => {
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top + se.scrollTop), h: Math.round(r.height), w: Math.round(r.width) };
  };
  const out = { docH: se.scrollHeight, innerH: window.innerHeight, sektion: rect(sec) };
  for (const teil of ['dnaZone', 'dnaZoneBg', 'dnaSticky', 'dnaBand']) {
    const t = treffer(teil);
    if (t.length) out[teil] = t.map(rect);
  }
  // Die Ueberschriften der Sektionen, damit sich "bis 05 Referenzen"
  // in Bildpunkten ausdruecken laeszt.
  out.marken = [...document.querySelectorAll('section[id]')].map(s => ({
    id: s.id, top: rect(s).top, h: rect(s).h,
  }));
  return out;
});
fs.writeFileSync(`${DIR}/zone.json`, JSON.stringify(geo, null, 1));
console.log(JSON.stringify(geo.sektion), 'docH', geo.docH);
if (geo.dnaZone) console.log('dnaZone', JSON.stringify(geo.dnaZone));
if (geo.dnaZoneBg) console.log('dnaZoneBg', JSON.stringify(geo.dnaZoneBg));

for (const off of OFFS) {
  let ist = null;
  for (let i = 0; i < 8; i++) {
    const top = await page.evaluate(() => {
      const se = document.scrollingElement;
      return Math.round(document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop);
    });
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + off);
    await page.waitForTimeout(700);
    ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
    );
    if (Math.abs(ist + off) <= 6) break;
  }
  if (ist === null || Math.abs(ist + off) > 6) {
    console.error(`WARNUNG versatz ${off}: oberkante bei ${ist} statt ${-off}`);
  }
  // Die Traegheit muss zur Ruhe kommen, sonst misst die Aufnahme den
  // Nachlauf des Scrollens statt des Ruhezustandes.
  await page.waitForTimeout(2600);
  const name = `${DIR}/a${String(off).padStart(4, '0')}.png`;
  await page.screenshot({ path: name });
  console.log(name);
}
await browser.close();
process.exit(0);
