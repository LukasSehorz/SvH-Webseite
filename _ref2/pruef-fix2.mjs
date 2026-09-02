/**
 * Zweiter Durchgang, gezielt auf die Stellen, die im ersten Durchgang
 * nicht im Bild standen oder mitten in einer Bewegung erwischt wurden.
 *
 *   node _ref2/pruef-fix2.mjs <port> <zielverzeichnis>
 *
 * Gesucht wird ueber Kennungen im Baum und nicht ueber feste Hoehen, denn
 * die Sektionen sind mit diesem Lauf kuerzer geworden.
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

async function seite(pfad, breite = 1440, hoehe = 900) {
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

/* Wachstumsszene auf Social. Die Szene laeuft rund fuenf Sekunden, danach
   steht der Ruhezustand mit Pfeil und Beschriftung. */
{
  const page = await seite('/marketing/social-media');
  await anfahren(page, '[data-shot="wachstum"]');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'y-social-wachstum-lauf.png') });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: path.join(OUT, 'y-social-wachstum-ruhe.png') });
  await page.close();
  console.log('ok social');
}

/* Werbetafeln. Faecher, Textkarte im Dunkeln und die Spotzeile im Band. */
{
  const page = await seite('/marketing/werbetafeln');
  await anfahren(page, '#werbetafeln-inhalte', 60);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, 'y-tafeln-inhalte-a.png') });
  await page.evaluate(() => {
    document.scrollingElement.scrollTop += 620;
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'y-tafeln-inhalte-b.png') });
  await page.close();
  console.log('ok tafeln');
}

/* Startseite. Karussell mit Maske, Werbetafelstrang im Zweierraster,
   Naht vor dem Abschluss und die Beschriftungen der KI-Buehne. */
{
  const page = await seite('/');
  await anfahren(page, '[data-strand="dooh"]', 60);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, 'y-start-dooh.png') });

  await anfahren(page, '#referenzen', 0);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, 'y-start-karussell-a.png') });
  await page.evaluate(() => {
    document.scrollingElement.scrollTop += 900;
  });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, 'y-start-karussell-b.png') });

  await anfahren(page, '.final-cta', 240);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, 'y-start-naht.png') });

  /* Die KI-Buehne baut sich am Scrollstand auf. Vier Stellen im Aufbau
     zeigen, ob eine Beschriftung ueber einer fahrenden Platte steht. */
  const oben = await page.evaluate(() => {
    const el = document.querySelector('.kl-section');
    return el
      ? Math.round(el.getBoundingClientRect().top + document.scrollingElement.scrollTop)
      : 0;
  });
  for (let i = 0; i < 5; i += 1) {
    await page.evaluate((y) => {
      document.scrollingElement.scrollTop = y;
    }, oben + 300 + i * 420);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(OUT, `y-start-ki-${i}.png`) });
  }
  await page.close();
  console.log('ok start');
}

/* KI-Seite. Ruhezustand der acht Kacheln, aufgenommen bevor die Schleifen
   losgelaufen sind. */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:${PORT}/ki`, {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'y-ki-kacheln-ruhe.png') });
  await page.waitForTimeout(4200);
  await page.screenshot({ path: path.join(OUT, 'y-ki-kacheln-lauf.png') });
  await page.close();
  console.log('ok ki');
}

/* Kontaktseite ganzseitig, nach dem Umbau auf Telefon und E-Mail. */
{
  const page = await seite('/kontakt');
  await page.screenshot({ path: path.join(OUT, 'x-kontakt-voll.png'), fullPage: true });
  await page.close();
  console.log('ok kontakt');
}

await aufraeumen();
