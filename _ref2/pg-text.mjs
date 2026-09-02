/**
 * Sichtbarer Text jeder Seite, danach die Suche nach Resten.
 *
 *   node _ref2/pg-text.mjs
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
const BASIS = 'http://localhost:3210';
const ROUTEN = ['/', '/ki', '/marketing', '/marketing/webseiten', '/marketing/social-media',
  '/marketing/werbetafeln', '/ueber-uns', '/kontakt', '/impressum', '/datenschutz', '/agb'];

const { browser, aufraeumen } = await starten();
const s = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const alles = {};

for (const route of ROUTEN) {
  await s.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await s.waitForTimeout(2000);
  const gesamt = await s.evaluate(() => document.scrollingElement.scrollHeight);
  for (let y = 0; y < gesamt; y += 700) {
    await s.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
    await s.waitForTimeout(200);
  }
  await s.waitForTimeout(800);
  alles[route] = await s.evaluate(() => document.body.innerText);
}
await s.close();
await aufraeumen();

fs.writeFileSync(`${ZIEL}/text.json`, JSON.stringify(alles, null, 1));

const muster = [
  ['TODO', /TODO/gi],
  ['Ausrufemarke', /❗/g],
  ['Lorem', /lorem|ipsum|dolor sit/gi],
  ['Platzhalter', /platzhalter|placeholder|dummy|xxx|tbd/gi],
  ['doppeltes Leerzeichen', / {2,}/g],
  ['Trennstrich im Satz', /\s[-–—]\s/g],
  ['Doppelpunkt in Ueberschrift oder Satz', /[a-zäöüß]:\s/g],
  ['undefined oder NaN', /\bundefined\b|\bNaN\b|\[object /g],
];

/* Ein knapper Wortschatz, der in deutschem Fliesztext nichts zu suchen
   hat. Markennamen wie Instagram oder HubSpot bleiben auszen vor. */
const englisch = /\b(the|your|and|with|please|learn more|read more|get started|contact us|about us|our services|home|submit|loading|error|coming soon|click here)\b/gi;

const bericht = {};
for (const route of ROUTEN) {
  const t = alles[route] || '';
  const treffer = {};
  for (const [name, re] of muster) {
    const m = t.match(re);
    if (m && m.length) treffer[name] = [...new Set(m)].slice(0, 8).map((x) => JSON.stringify(x));
  }
  const e = t.match(englisch);
  if (e && e.length) treffer.englisch = [...new Set(e)].slice(0, 10);
  if (Object.keys(treffer).length) bericht[route] = treffer;
}
console.log(JSON.stringify(bericht, null, 1));
fs.writeFileSync(`${ZIEL}/textreste.json`, JSON.stringify(bericht, null, 1));
