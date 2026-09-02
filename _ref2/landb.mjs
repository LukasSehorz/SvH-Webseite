/**
 * Pruefrunde fuer die beiden Sektionen Kacheln und Ablauf.
 *
 * Nimmt beide Sektionen bei drei Breiten auf, dazu drei Kacheln in drei
 * Phasen ihrer Szene, eine Kachel bei Beruehrung und den Ablauf mit
 * jedem der drei Schritte wach. Beendet keinen fremden Prozess.
 */
import { starten } from './browser.mjs';
import { mkdir } from 'node:fs/promises';

const ZIEL = '.impeccable/review/landing-b';
const URL = 'http://127.0.0.1:3236/';

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

async function seite(browser, breite, hoehe) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await warte(600);
  return { ctx, page };
}

/** Rollt eine Sektion so, dass sie moeglichst ganz im Bild steht. */
async function zuSektion(page, wahl) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const box = el.getBoundingClientRect();
    const mitte = window.scrollY + box.top + box.height / 2;
    window.scrollTo(0, Math.max(0, mitte - window.innerHeight / 2));
  }, wahl);
  await warte(900);
}

async function schuss(page, name) {
  await page.screenshot({ path: `${ZIEL}/${name}.png` });
  console.log('  ', name);
}

/** Waagerechter Ueberlauf und Bildrate messen. */
async function messen(page) {
  const ueberlauf = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    fenster: window.innerWidth,
  }));
  return ueberlauf;
}

async function bildrate(page) {
  return page.evaluate(
    () =>
      new Promise((fertig) => {
        const zeiten = [];
        let vorher = performance.now();
        let n = 0;
        const takt = () => {
          const jetzt = performance.now();
          zeiten.push(jetzt - vorher);
          vorher = jetzt;
          n += 1;
          if (n < 150) requestAnimationFrame(takt);
          else {
            zeiten.sort((a, b) => a - b);
            fertig({
              p50: +zeiten[Math.floor(zeiten.length * 0.5)].toFixed(2),
              p95: +zeiten[Math.floor(zeiten.length * 0.95)].toFixed(2),
              max: +zeiten[zeiten.length - 1].toFixed(2),
            });
          }
        };
        requestAnimationFrame(takt);
      })
  );
}

const { browser, aufraeumen } = await starten();
await mkdir(ZIEL, { recursive: true });
const befund = {};

try {
  /* ---------------------------------------------------- Breiten */
  for (const [breite, hoehe] of [
    [1440, 1000],
    [2560, 1000],
    [390, 844],
  ]) {
    const { ctx, page } = await seite(browser, breite, hoehe);

    await zuSektion(page, '.ki-tiles');
    await warte(2600);
    await schuss(page, `kacheln-${breite}`);

    await zuSektion(page, '.process-panel');
    await warte(2400);
    await schuss(page, `ablauf-${breite}`);

    befund[`ueberlauf-${breite}`] = await messen(page);
    await ctx.close();
  }

  /* ------------------------------------ Kachelszenen in Phasen */
  {
    const { ctx, page } = await seite(browser, 1440, 1000);
    await zuSektion(page, '.ki-tiles');
    /* Der Eintritt startet alle sechs Szenen gleichzeitig. Drei
       Aufnahmen kurz hintereinander zeigen drei Phasen. */
    await page.evaluate(() => {
      document
        .querySelectorAll('.kt-card')
        .forEach((el) => el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true })));
    });
    await warte(420);
    await schuss(page, 'kacheln-phase-1');
    await warte(760);
    await schuss(page, 'kacheln-phase-2');
    await warte(2400);
    await schuss(page, 'kacheln-phase-3');

    befund.rate = await bildrate(page);
    await ctx.close();
  }

  /* ------------------------------------------ Kachel bei Beruehrung */
  {
    const { ctx, page } = await seite(browser, 1440, 1000);
    await zuSektion(page, '.ki-tiles');
    await warte(3400);
    const karte = page.locator('.kt-card').nth(2);
    await karte.hover();
    await warte(220);
    await schuss(page, 'kachel-beruehrt-start');
    await warte(1500);
    await schuss(page, 'kachel-beruehrt-mitte');
    befund.rateBeruehrt = await bildrate(page);
    await ctx.close();
  }

  /* --------------------------------------- Ablauf, jeder Schritt */
  {
    const { ctx, page } = await seite(browser, 1440, 1000);
    await zuSektion(page, '.process-panel');
    await warte(1600);
    for (let i = 0; i < 3; i += 1) {
      await page.locator('.pp-card').nth(i).hover();
      await warte(1500);
      await schuss(page, `ablauf-schritt-${i + 1}`);
    }
    befund.rateAblauf = await bildrate(page);
    await ctx.close();
  }

  /* -------------------------------------- Ablauf gestapelt, Telefon */
  {
    const { ctx, page } = await seite(browser, 390, 844);
    await zuSektion(page, '.process-panel');
    await warte(1400);
    for (let i = 0; i < 3; i += 1) {
      await page.evaluate((k) => {
        const el = document.querySelectorAll('.pp-card')[k];
        if (!el) return;
        const box = el.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + box.top + box.height / 2 - window.innerHeight / 2);
      }, i);
      await warte(1500);
      await schuss(page, `ablauf-390-schritt-${i + 1}`);
    }
    await ctx.close();
  }

  /* ------------------------------------------ Reduzierte Bewegung */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await warte(500);
    await zuSektion(page, '.ki-tiles');
    await warte(900);
    await schuss(page, 'kacheln-ruhe');
    await zuSektion(page, '.process-panel');
    await warte(900);
    await schuss(page, 'ablauf-ruhe');
    await ctx.close();
  }
} finally {
  console.log(JSON.stringify(befund, null, 2));
  await aufraeumen();
}
