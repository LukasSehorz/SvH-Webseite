/**
 * Faehrt einzelne Sektionen an und wartet, bis die scrollgetriebenen
 * Bewegungen zur Ruhe gekommen sind. Nur so zeigt die Aufnahme das
 * Raster und nicht einen Zwischenstand der Animation.
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/breite';
fs.mkdirSync(ZIEL, { recursive: true });

const BASIS = 'http://localhost:3210';
const BREITEN = process.argv[2]
  ? process.argv[2].split(',').map(Number)
  : [1440, 2560];
const ANKER = ['problem', 'ki', 'kacheln', 'marketing', 'referenzen', 'ablauf', 'fragen'];

const { browser, aufraeumen } = await starten();

for (const breite of BREITEN) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 1000 } });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(900);

  for (const anker of ANKER) {
    const gefunden = await seite.evaluate((id) => {
      const knoten = id === 'kacheln' ? document.getElementById('ki-tiles-titel')?.closest('section') : document.getElementById(id);
      if (!knoten) return false;
      window.scrollTo(0, window.scrollY + knoten.getBoundingClientRect().top - 40);
      return true;
    }, anker);
    if (!gefunden) {
      console.log('fehlt', anker);
      continue;
    }
    await seite.waitForTimeout(2600);
    await seite.screenshot({ path: `${ZIEL}/sek-${anker}-${breite}.png` });
  }

  // Der Seitenfusz am Ende.
  await seite.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await seite.waitForTimeout(2200);
  await seite.screenshot({ path: `${ZIEL}/sek-fusz-${breite}.png` });

  await seite.close();
}

console.log('fertig');
await aufraeumen();
