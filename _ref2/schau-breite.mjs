/**
 * Nimmt die Seiten in den vier Pruefbreiten auf und legt die Bilder unter
 * _ref2/mess/breite ab. Zusaetzlich die Leiste mit offenem Aufklappmenue
 * und das Overlay auf dem Telefon.
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/breite';
fs.mkdirSync(ZIEL, { recursive: true });

const BASIS = 'http://localhost:3210';
const BREITEN = [1440, 1920, 2560, 390];
const SEITEN = [
  { name: 'start', pfad: '/' },
  { name: 'ki', pfad: '/ki' },
  { name: 'marketing', pfad: '/marketing' },
  { name: 'webseiten', pfad: '/marketing/webseiten' },
];

const { browser, aufraeumen } = await starten();
const bericht = [];

for (const breite of BREITEN) {
  for (const seiteDef of SEITEN) {
    const seite = await browser.newPage({
      viewport: { width: breite, height: breite === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
    });
    await seite.goto(BASIS + seiteDef.pfad, { waitUntil: 'networkidle' });
    await seite.waitForTimeout(900);
    await seite.screenshot({
      path: `${ZIEL}/${seiteDef.name}-${breite}-oben.png`,
    });

    const ueberlauf = await seite.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      innen: document.documentElement.clientWidth,
    }));
    bericht.push({ seite: seiteDef.name, breite, ueberlauf });

    // Zweiter Blick weiter unten, damit auch Kacheln und Referenzen
    // in der Aufnahme landen.
    await seite.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
    await seite.waitForTimeout(1400);
    await seite.screenshot({
      path: `${ZIEL}/${seiteDef.name}-${breite}-mitte.png`,
    });

    await seite.close();
  }
}

// Die Leiste mit offenem Aufklappmenue.
for (const breite of [1440, 2560]) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 700 } });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(700);
  await seite.hover('.nav-link[aria-haspopup="true"]');
  await seite.waitForTimeout(900);
  await seite.screenshot({ path: `${ZIEL}/menue-${breite}.png` });
  await seite.close();
}

// Das Overlay auf dem Telefon, mit aufgeklappter Gruppe.
{
  const seite = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(700);
  await seite.click('.nav-burger');
  await seite.waitForTimeout(800);
  await seite.screenshot({ path: `${ZIEL}/overlay-390-zu.png` });
  await seite.click('.nav-overlay-toggle');
  await seite.waitForTimeout(800);
  await seite.screenshot({ path: `${ZIEL}/overlay-390-auf.png` });
  await seite.close();
}

console.log(JSON.stringify(bericht, null, 1));
await aufraeumen();
