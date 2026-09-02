/**
 * Leiste mit offenem Menue, Overlay bei 390, und je eine Szene in zwei
 * Phasen. Dazu Tastaturfokus und die Farbfrage an den Fragen.
 *
 *   node _ref2/pg-phasen.mjs
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
const BASIS = 'http://localhost:3210';
fs.mkdirSync(ZIEL, { recursive: true });
const notiz = {};
const sichern = () => fs.writeFileSync(`${ZIEL}/phasen.json`, JSON.stringify(notiz, null, 1));

const { browser, aufraeumen } = await starten();

const anfahren = async (seite, wahl, versatz = -80) => seite.evaluate(({ w, v }) => {
  const el = document.querySelector(w);
  if (!el) return false;
  document.scrollingElement.scrollTop += el.getBoundingClientRect().top + v;
  return true;
}, { w: wahl, v: versatz });

/* -------------------------------------------------- Leiste und Menue */
{
  const s = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await s.goto(BASIS + '/', { waitUntil: 'domcontentloaded' });
  await s.waitForTimeout(2500);
  await s.screenshot({ path: `${ZIEL}/x-leiste-zu.png`, clip: { x: 0, y: 0, width: 1440, height: 140 } });
  await s.hover('.nav-link[aria-haspopup="true"]');
  await s.waitForTimeout(900);
  await s.screenshot({ path: `${ZIEL}/x-leiste-offen.png`, clip: { x: 0, y: 0, width: 1440, height: 400 } });

  // Tastaturfokus: die ersten Stationen
  await s.evaluate(() => document.activeElement && document.activeElement.blur());
  const fokus = [];
  for (let i = 0; i < 8; i++) {
    await s.keyboard.press('Tab');
    await s.waitForTimeout(180);
    fokus.push(await s.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), t: (el.textContent || '').trim().slice(0, 30),
        outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, schatten: cs.boxShadow.slice(0, 60) };
    }));
  }
  notiz.fokus = fokus;
  await s.screenshot({ path: `${ZIEL}/x-fokus.png`, clip: { x: 0, y: 0, width: 1440, height: 140 } });

  /* Warum steht eine Frage in Flieder? Farbe im Ruhezustand messen. */
  await anfahren(s, '#fragen', -60);
  await s.mouse.move(20, 20);
  await s.waitForTimeout(1400);
  notiz.fragenFarben = await s.evaluate(() => [...document.querySelectorAll('.faq-question-text')]
    .map((e) => ({ t: e.textContent.slice(0, 34), farbe: getComputedStyle(e).color })));
  await s.screenshot({ path: `${ZIEL}/x-fragen-ruhe.png` });
  await s.close();
}

/* -------------------------------------------------- Overlay bei 390 */
{
  const s = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await s.goto(BASIS + '/', { waitUntil: 'domcontentloaded' });
  await s.waitForTimeout(2500);
  await s.click('.nav-burger');
  await s.waitForTimeout(1000);
  await s.screenshot({ path: `${ZIEL}/x-overlay-390.png` });
  await s.click('.nav-overlay-toggle');
  await s.waitForTimeout(900);
  await s.screenshot({ path: `${ZIEL}/x-overlay-390-auf.png` });
  await s.close();
}

/* ------------------------------------------------ Hero in zwei Phasen */
{
  const s = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await s.goto(BASIS + '/', { waitUntil: 'domcontentloaded' });
  await s.waitForTimeout(2000);
  const reihe = [];
  for (let i = 0; i < 16; i++) {
    const z = await s.evaluate(() => {
      const an = [...document.querySelectorAll('.hero-state-line')].find((e) => e.dataset.on === 'true');
      return an ? an.dataset.key : null;
    });
    reihe.push(z);
    if (z === 'chaos' && !fs.existsSync(`${ZIEL}/x-hero-chaos.png`)) await s.screenshot({ path: `${ZIEL}/x-hero-chaos.png` });
    if (z === 'order' && !fs.existsSync(`${ZIEL}/x-hero-order.png`)) await s.screenshot({ path: `${ZIEL}/x-hero-order.png` });
    await s.waitForTimeout(1500);
  }
  notiz.heroFolge = reihe;

  /* Kacheln bei Beruehrung */
  await anfahren(s, '#ki-tiles-titel', -60);
  await s.waitForTimeout(2200);
  await s.screenshot({ path: `${ZIEL}/x-kacheln-ruhe.png` });
  const kachel = await s.$('.kt-card');
  if (kachel) {
    await kachel.hover();
    await s.waitForTimeout(420);
    await s.screenshot({ path: `${ZIEL}/x-kacheln-lauf.png` });
    await s.waitForTimeout(1400);
    await s.screenshot({ path: `${ZIEL}/x-kacheln-lauf2.png` });
  }

  /* Ablauf mit Schritt zwei wach */
  await anfahren(s, '#ablauf', -40);
  await s.waitForTimeout(2200);
  const karten = await s.$$('.pp-card');
  if (karten[1]) {
    await karten[1].hover();
    await s.waitForTimeout(1200);
    await s.screenshot({ path: `${ZIEL}/x-ablauf-2.png` });
    notiz.ablaufZustaende = await s.evaluate(() => [...document.querySelectorAll('.pp-card')].map((e) => e.dataset.state));
  }

  /* Webseiten-Strang beim Buchen. Die Szene hat sechs Abschnitte, der
     mit der Bestaetigung ist der letzte. */
  await anfahren(s, '#marketing', -40);
  await s.waitForTimeout(1500);
  await s.evaluate(() => {
    const el = document.querySelector('[class*="wbWrap"]');
    if (el) document.scrollingElement.scrollTop += el.getBoundingClientRect().top - 200;
  });
  await s.waitForTimeout(2000);
  const phasen = [];
  for (let i = 0; i < 14; i++) {
    const p = await s.evaluate(() => document.querySelector('[class*="wbWrap"]')?.dataset.p ?? null);
    phasen.push(p);
    if (p === '0' && !fs.existsSync(`${ZIEL}/x-web-start.png`)) await s.screenshot({ path: `${ZIEL}/x-web-start.png` });
    if (p === '5' && !fs.existsSync(`${ZIEL}/x-web-bestaetigt.png`)) await s.screenshot({ path: `${ZIEL}/x-web-bestaetigt.png` });
    await s.waitForTimeout(700);
  }
  notiz.webPhasen = phasen;
  await s.close();
  sichern();
}

/* --------------------------------- Werbetafel-Video im Hero der Seite */
{
  const s = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await s.goto(BASIS + '/marketing/werbetafeln', { waitUntil: 'domcontentloaded' });
  await s.waitForTimeout(3000);
  notiz.tafelVideo = await s.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({
    src: v.currentSrc || v.getAttribute('src'), paused: v.paused, t: +v.currentTime.toFixed(2),
    w: v.videoWidth, h: v.videoHeight, bereit: v.readyState,
  })));
  await s.screenshot({ path: `${ZIEL}/x-tafel-a.png` });
  await s.waitForTimeout(2500);
  await s.screenshot({ path: `${ZIEL}/x-tafel-b.png` });
  await s.waitForTimeout(4500);
  await s.screenshot({ path: `${ZIEL}/x-tafel-c.png` });
  notiz.tafelVideo2 = await s.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ t: +v.currentTime.toFixed(2), paused: v.paused })));
  await s.close();
}

/* ----------------------------------------- Reduzierte Bewegung, Bild */
{
  const s = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  for (const [r, n] of [['/', 'start'], ['/ki', 'ki'], ['/marketing/webseiten', 'web'], ['/marketing/werbetafeln', 'tafeln']]) {
    await s.goto(BASIS + r, { waitUntil: 'domcontentloaded' });
    await s.waitForTimeout(2600);
    await s.screenshot({ path: `${ZIEL}/x-red-${n}-0.png` });
    await s.evaluate(() => { document.scrollingElement.scrollTop = 1800; });
    await s.waitForTimeout(1600);
    await s.screenshot({ path: `${ZIEL}/x-red-${n}-1.png` });
  }
  await s.close();
}

sichern();
await aufraeumen();
console.log('fertig');
