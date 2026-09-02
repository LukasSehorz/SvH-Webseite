/**
 * Dritter Durchgang. Er nimmt die Stellen auf, die nach dem zweiten Lauf
 * nachgebessert wurden, und die beiden Randbreiten.
 *
 *   node _ref2/pruef-fix3.mjs <port> <zielverzeichnis>
 */
import { starten } from './browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.argv[2] || '3239';
const OUT = process.argv[3] || '.impeccable/review/fix';
fs.mkdirSync(OUT, { recursive: true });

const { browser, aufraeumen } = await starten();

async function anfahren(page, sel, rand = 90) {
  for (let i = 0; i < 8; i += 1) {
    const oben = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      return Math.round(
        el.getBoundingClientRect().top + document.scrollingElement.scrollTop,
      );
    }, sel);
    if (oben === null) return false;
    await page.evaluate((v) => {
      document.scrollingElement.scrollTop = v;
    }, Math.max(0, oben - rand));
    await page.waitForTimeout(700);
    const ist = await page.evaluate((s) => {
      const el = document.querySelector(s);
      return el ? Math.round(el.getBoundingClientRect().top) : 9999;
    }, sel);
    if (Math.abs(ist - rand) <= 10) break;
  }
  return true;
}

async function neu(pfad, breite = 1440, hoehe = 900) {
  const page = await browser.newPage({
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:${PORT}${pfad}`, {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  });
  await page.waitForTimeout(4200);
  return page;
}

/* Kontakt. Die Seite wird einmal ganz durchgefahren, damit die
   Einblendungen ausloesen, danach die beiden Stellen einzeln. */
{
  const page = await neu('/kontakt');
  await page.evaluate(async () => {
    const warten = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) {
      document.scrollingElement.scrollTop = y;
      await warten(140);
    }
    document.scrollingElement.scrollTop = 0;
  });
  await page.waitForTimeout(1600);
  await anfahren(page, '#anfrage', 40);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'z-kontakt-anfrage.png') });
  await page.screenshot({ path: path.join(OUT, 'z-kontakt-voll.png'), fullPage: true });
  await page.close();
  console.log('ok kontakt');
}

/* Startseite. Naht vor dem Abschluss, Markenraster des Tafelstrangs. */
{
  const page = await neu('/');
  await anfahren(page, '.final-cta', 260);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, 'z-start-naht.png') });

  await anfahren(page, '[data-strand="dooh"]', 60);
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    document.scrollingElement.scrollTop += 760;
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, 'z-start-dooh-marken.png') });
  await page.close();
  console.log('ok start');
}

/* Werbetafeln. Hero mit Knopf, Naehte, und die beiden Randbreiten. */
for (const b of [
  { tag: '1440', width: 1440, height: 900 },
  { tag: '390', width: 390, height: 844 },
  { tag: '2560', width: 2560, height: 1440 },
]) {
  const page = await neu('/marketing/werbetafeln', b.width, b.height);
  await page.screenshot({ path: path.join(OUT, `z-${b.tag}-tafeln-00.png`) });
  await anfahren(page, '#werbetafeln-band', 40);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, `z-${b.tag}-tafeln-band.png`) });
  await anfahren(page, '#werbetafeln-inhalte', 60);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, `z-${b.tag}-tafeln-faecher.png`) });
  const ueber = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    fenster: document.documentElement.clientWidth,
  }));
  console.log(`ok tafeln ${b.tag} ueberlauf ${ueber.doc - ueber.fenster}`);
  await page.close();
}

/* Startseite auf den beiden Randbreiten, oben und am Karussell. */
for (const b of [
  { tag: '390', width: 390, height: 844 },
  { tag: '2560', width: 2560, height: 1440 },
]) {
  const page = await neu('/', b.width, b.height);
  await page.screenshot({ path: path.join(OUT, `z-${b.tag}-start-00.png`) });
  await anfahren(page, '#referenzen', 0);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, `z-${b.tag}-start-karussell.png`) });
  const ueber = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    fenster: document.documentElement.clientWidth,
  }));
  console.log(`ok start ${b.tag} ueberlauf ${ueber.doc - ueber.fenster}`);
  await page.close();
}

/* Webseiten. Hero und Abschluss mit der einen Knopfform. */
{
  const page = await neu('/marketing/webseiten');
  await anfahren(page, '#webseiten-abschluss', 220);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, 'z-web-abschluss.png') });
  await page.close();
  console.log('ok web');
}

await aufraeumen();
