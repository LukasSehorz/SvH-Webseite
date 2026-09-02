/**
 * Prueft die Leiste auf Bedienbarkeit. Zeiger mit Absicht, Tastatur mit
 * Pfeilen, Leertaste, Eingabetaste und Escape, dazu die Meldungen an die
 * Vorlesehilfe.
 */
import { starten } from './browser.mjs';

const BASIS = 'http://localhost:3210';
const { browser, aufraeumen } = await starten();
const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await seite.goto(BASIS + '/', { waitUntil: 'networkidle' });
await seite.waitForTimeout(800);

const ausloeser = seite.locator('.nav-link[aria-haspopup="true"]');
const panel = seite.locator('.nav-panel');
const bericht = [];

const notiere = async (was, wert) => {
  bericht.push({ was, wert });
};

// Zeiger darueber, mit Absicht.
await ausloeser.hover();
await seite.waitForTimeout(60);
await notiere('nach 60 ms noch zu', (await panel.count()) === 0);
await seite.waitForTimeout(400);
await notiere('nach 460 ms offen', (await panel.count()) === 1);
await notiere('aria-expanded true', await ausloeser.getAttribute('aria-expanded'));
await notiere('aria-haspopup', await ausloeser.getAttribute('aria-haspopup'));

// Zeiger wandert in das Menue und es bleibt offen.
await panel.locator('.nav-panel-link').first().hover();
await seite.waitForTimeout(600);
await notiere('bleibt offen im Menue', (await panel.count()) === 1);

// Zeiger weg, es schlieszt.
await seite.mouse.move(20, 600);
await seite.waitForTimeout(1100);
await notiere('schlieszt nach Verlassen', (await panel.count()) === 0);

// Tastatur. Erst auf den Ausloeser, dann Pfeil nach unten.
await ausloeser.focus();
await seite.keyboard.press('ArrowDown');
await seite.waitForTimeout(300);
await notiere('Pfeil unten oeffnet', (await panel.count()) === 1);
await notiere(
  'Fokus auf erstem Eintrag',
  await seite.evaluate(() =>
    document.activeElement ? document.activeElement.getAttribute('href') : null,
  ),
);

await seite.keyboard.press('ArrowDown');
await notiere(
  'Pfeil unten wandert weiter',
  await seite.evaluate(() =>
    document.activeElement ? document.activeElement.getAttribute('href') : null,
  ),
);

await seite.keyboard.press('End');
await notiere(
  'Ende springt auf letzten',
  await seite.evaluate(() =>
    document.activeElement ? document.activeElement.getAttribute('href') : null,
  ),
);

await seite.keyboard.press('Escape');
await seite.waitForTimeout(900);
await notiere('Escape schlieszt', (await panel.count()) === 0);
await notiere(
  'Fokus zurueck am Ausloeser',
  await seite.evaluate(() =>
    document.activeElement
      ? document.activeElement.className + ' ' + document.activeElement.getAttribute('href')
      : null,
  ),
);

// Leertaste schaltet um.
await seite.keyboard.press(' ');
await seite.waitForTimeout(300);
await notiere('Leertaste oeffnet', (await panel.count()) === 1);
await seite.keyboard.press(' ');
await seite.waitForTimeout(900);
await notiere('Leertaste schlieszt', (await panel.count()) === 0);

// Eingabetaste oeffnet im geschlossenen Zustand und folgt danach dem Verweis.
await seite.keyboard.press('Enter');
await seite.waitForTimeout(300);
await notiere('Eingabe oeffnet', (await panel.count()) === 1);
await seite.keyboard.press('Enter');
await seite.waitForTimeout(1200);
await notiere('zweite Eingabe fuehrt auf', new URL(seite.url()).pathname);

console.log(JSON.stringify(bericht, null, 1));
await seite.close();
await aufraeumen();
