/**
 * Ganzseitige Aufnahme in Bildschirmhoehe geschnitten.
 * Nach einem langsamen Durchlauf, damit die Eintritte ausgeloest sind.
 *
 *   node _ref2/pg-strips.mjs <breite> [routen...]
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
const BASIS = 'http://localhost:3210';
const BREITE = Number(process.argv[2] || 1440);
const HOEHEN = { 1440: 900, 2560: 1440, 390: 844 };
const HOEHE = HOEHEN[BREITE] || 900;
/** Auf diese Breite wird das gelesene Bild verkleinert. */
const LESE_BREITE = BREITE > 1500 ? 1400 : BREITE;

const ALLE = ['/', '/ki', '/marketing', '/marketing/webseiten', '/marketing/social-media',
  '/marketing/werbetafeln', '/ueber-uns', '/kontakt', '/impressum'];
const ROUTEN = process.argv.length > 3 ? process.argv.slice(3) : ALLE;

fs.mkdirSync(ZIEL, { recursive: true });
const { browser, aufraeumen } = await starten();

for (const route of ROUTEN) {
  const name = route === '/' ? 'start' : route.replace(/^\//, '').replace(/\//g, '-');
  const seite = await browser.newPage({ viewport: { width: BREITE, height: HOEHE }, deviceScaleFactor: 1 });
  try {
    await seite.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await seite.waitForTimeout(2600);

    // Langsamer Durchlauf: jeder Abschnitt kommt einmal ins Bild.
    const gesamt = await seite.evaluate(() => document.scrollingElement.scrollHeight);
    const schritt = Math.round(HOEHE * 0.55);
    for (let y = 0; y <= gesamt; y += schritt) {
      await seite.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
      await seite.waitForTimeout(260);
    }
    await seite.waitForTimeout(1200);

    // Jetzt Streifen fuer Streifen zurueck von oben, jeweils mit Ruhe.
    const neu = await seite.evaluate(() => document.scrollingElement.scrollHeight);
    const anzahl = Math.ceil(neu / HOEHE);
    for (let i = 0; i < anzahl; i++) {
      const y = Math.min(i * HOEHE, neu - HOEHE);
      await seite.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
      await seite.waitForTimeout(1500);
      const roh = `${ZIEL}/tmp-${name}.png`;
      await seite.screenshot({ path: roh });
      const ziel = `${ZIEL}/${BREITE}-${name}-${String(i).padStart(2, '0')}.png`;
      if (LESE_BREITE !== BREITE) await sharp(roh).resize(LESE_BREITE).toFile(ziel);
      else fs.copyFileSync(roh, ziel);
      fs.unlinkSync(roh);
    }
    console.log(name, anzahl, 'streifen');
  } catch (e) {
    console.log(name, 'FEHLER', String(e).slice(0, 160));
  }
  await seite.close();
}

await aufraeumen();
console.log('fertig');
