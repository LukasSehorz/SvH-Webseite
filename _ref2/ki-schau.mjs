/**
 * Pruefrunde fuer die Seite /ki.
 *
 * Ganzseitig bei 1440 und 390, jede Sektion einzeln bei 1440, zwei Phasen
 * der Schrittanimation und zwei Kacheln unter dem Zeiger. Die Aufnahmen
 * landen unter .impeccable/review/ki/.
 *
 * Der Browser kommt ausschliesslich aus browser.mjs, damit kein fremdes
 * Chrome-Fenster angefasst wird.
 */
import { starten } from './browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3232;
const URL = `http://localhost:${PORT}/ki`;
const ZIEL = path.resolve('.impeccable/review/ki');
fs.mkdirSync(ZIEL, { recursive: true });

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/** Laedt die Seite und laeuft einmal langsam durch, damit alles anspringt. */
async function vorbereiten(page) {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await warte(1200);
  const hoehe = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < hoehe; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await warte(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await warte(900);
  return hoehe;
}

async function schuss(page, name) {
  const datei = path.join(ZIEL, `${name}.png`);
  await page.screenshot({ path: datei });
  console.log('->', datei);
}

async function ueberlauf(page, marke) {
  const wert = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));
  console.log(
    `${marke}: scrollWidth ${wert.doc} bei innerWidth ${wert.win}`,
    wert.doc > wert.win + 1 ? 'WAAGERECHTER UEBERLAUF' : 'ok'
  );
}

const { browser, aufraeumen } = await starten();

try {
  /* ------------------------------------------------ 1440, ganzseitig */
  const gross = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const p = await gross.newPage();
  await vorbereiten(p);
  await ueberlauf(p, '1440');
  await p.screenshot({
    path: path.join(ZIEL, 'ganz-1440.png'),
    fullPage: true,
  });
  console.log('-> ganz-1440.png');

  /* ------------------------------------------------ Sektionen bei 1440 */
  const sektionen = [
    ['sektion-kopf', '.ki-hero'],
    ['sektion-leistungen', '.ki-services'],
    ['sektion-ablauf', '.ki-flow'],
    ['sektion-abschluss', '.final-cta'],
  ];
  for (const [name, wahl] of sektionen) {
    const el = await p.$(wahl);
    if (!el) {
      console.log('FEHLT:', wahl);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await warte(1400);
    await el.screenshot({ path: path.join(ZIEL, `${name}.png`) });
    console.log('->', `${name}.png`);
  }

  /* ------------------------------------------------ Kacheln unter dem Zeiger */
  await p.evaluate(() => window.scrollTo(0, 0));
  await warte(700);
  const kacheln = await p.$$('.ki-tile');
  for (const [i, nr] of [1, 4].entries()) {
    const kachel = kacheln[nr];
    if (!kachel) continue;
    await kachel.hover();
    await warte(900);
    await kachel.screenshot({ path: path.join(ZIEL, `kachel-beruehrt-${i + 1}.png`) });
    console.log('->', `kachel-beruehrt-${i + 1}.png`);
  }

  /* ------------------------------------------------ Phasen der Schritte */
  const schritte = await p.$$('.ki-flow-step');
  for (const [i, li] of schritte.entries()) {
    await li.scrollIntoViewIfNeeded();
    await warte(1800);
    await p.screenshot({ path: path.join(ZIEL, `schritt-${i + 1}.png`) });
    console.log('->', `schritt-${i + 1}.png`);
  }

  /* ------------------------------------------------ 390, ganzseitig */
  const klein = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const m = await klein.newPage();
  await vorbereiten(m);
  await ueberlauf(m, '390');
  await m.screenshot({ path: path.join(ZIEL, 'ganz-390.png'), fullPage: true });
  console.log('-> ganz-390.png');

  /* ------------------------------------------------ Ruhige Bewegung */
  const still = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const r = await still.newPage();
  await vorbereiten(r);
  await ueberlauf(r, '1440 ruhig');
  await r.screenshot({
    path: path.join(ZIEL, 'ganz-1440-ruhig.png'),
    fullPage: true,
  });
  console.log('-> ganz-1440-ruhig.png');
} finally {
  await aufraeumen();
}
