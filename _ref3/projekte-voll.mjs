// Nimmt die vier Referenzseiten ganzseitig neu auf.
//
// Grund: die erste Aufnahme entstand ohne Durchlauf, deshalb hatten die
// Kundenseiten ihre Einblendungen nie ausgeloest und mehr als die Haelfte
// der Aufnahme blieb strukturlos.
//
// Es entstehen zwei Fassungen je Seite. Fassung a faehrt nur langsam
// durch, Fassung b zwingt zusaetzlich alle noch unsichtbaren Elemente im
// Textflusz auf sichtbar. Fassung b bleibt der Rueckfall, weil das
// Erzwingen auch Elemente zeigen kann, die absichtlich verborgen sind.
import { starten } from '../_ref2/browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ZIEL = '_ref3/webseiten/projekte';
fs.mkdirSync(ZIEL, { recursive: true });

const SEITEN = [
  { name: 'brandhuber', url: 'https://brandhuber.gmbh/' },
  { name: 'world-of-less', url: 'https://world-of-less.de/' },
  { name: 'taxi-izi', url: 'https://taxi-izi.de/' },
  { name: 'innnatur', url: 'https://innnatur-heilpraktiker.de/' },
];

const BANNER = [
  'button:has-text("Alle akzeptieren")',
  'button:has-text("Alles akzeptieren")',
  'button:has-text("Akzeptieren")',
  'button:has-text("Zustimmen")',
  'button:has-text("Einverstanden")',
  'button:has-text("Accept all")',
  'button:has-text("Accept")',
  'a:has-text("Alle akzeptieren")',
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '.cmplz-accept',
  '#cn-accept-cookie',
  '[data-testid="uc-accept-all-button"]',
  '.brlbs-btn-accept-all',
];

async function durchlauf(seite) {
  // Langsam bis ganz nach unten, damit jede Einblendung ihren Ausloeser
  // wirklich erreicht, danach ebenso langsam zurueck nach oben.
  await seite.evaluate(async () => {
    const warten = (ms) => new Promise((r) => setTimeout(r, ms));
    const hoehe = () => document.documentElement.scrollHeight;
    for (let y = 0; y < hoehe(); y += 380) {
      window.scrollTo(0, y);
      await warten(150);
    }
    window.scrollTo(0, hoehe());
    await warten(900);
    for (let y = hoehe(); y > 0; y -= 700) {
      window.scrollTo(0, y);
      await warten(90);
    }
    window.scrollTo(0, 0);
  });
  await seite.waitForTimeout(3000);
}

async function erzwingen(seite) {
  await seite.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      // Feste und klebende Elemente bleiben unangetastet, sonst tauchen
      // Aufklappmenues und Schaltflaechen mitten im Bild auf.
      if (s.position === 'fixed' || s.position === 'sticky') continue;
      const versteckt =
        parseFloat(s.opacity) < 1 || (s.transform && s.transform !== 'none') || s.visibility === 'hidden';
      if (!versteckt) continue;
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('clip-path', 'none', 'important');
    }
  });
  await seite.waitForTimeout(1200);
}

const { browser, aufraeumen } = await starten();

for (const s of SEITEN) {
  let kontext;
  try {
    kontext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      locale: 'de-DE',
    });
    const seite = await kontext.newPage();
    await seite.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try {
      await seite.waitForLoadState('networkidle', { timeout: 25000 });
    } catch {
      // Dauerverbindungen sind kein Fehler.
    }
    await seite.waitForTimeout(3500);

    for (const wahl of BANNER) {
      try {
        const el = seite.locator(wahl).first();
        if (await el.isVisible({ timeout: 500 })) {
          await el.click({ timeout: 2000 });
          await seite.waitForTimeout(1200);
          break;
        }
      } catch {
        // Weiter zum naechsten Muster.
      }
    }
    await seite.evaluate(() => {
      const muster =
        '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="borlabs" i],[id*="usercentrics" i],[class*="cmplz" i]';
      document.querySelectorAll(muster).forEach((el) => el.remove());
    });
    await seite.addStyleTag({
      content:
        'html{scrollbar-width:none !important;}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0 !important;height:0 !important;display:none !important;}',
    });

    await durchlauf(seite);
    await seite.screenshot({
      path: path.join(ZIEL, `${s.name}-voll-a.png`),
      fullPage: true,
      timeout: 120000,
    });

    await erzwingen(seite);
    await durchlauf(seite);
    await seite.screenshot({
      path: path.join(ZIEL, `${s.name}-voll-b.png`),
      fullPage: true,
      timeout: 120000,
    });

    const hoehe = await seite.evaluate(() => document.documentElement.scrollHeight);
    console.log(`ok ${s.name}  hoehe ${hoehe}`);
    await kontext.close();
  } catch (fehler) {
    console.log(`FEHLER ${s.name} ${String(fehler).slice(0, 300)}`);
    try {
      await kontext?.close();
    } catch {
      // egal
    }
  }
}

await aufraeumen();
