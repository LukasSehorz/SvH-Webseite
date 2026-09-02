// Hero-Sektionen der vier echten Referenzprojekte, sauber und ohne Banner.
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
    await seite.waitForTimeout(4000);

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
    // Reste von Bannern und Einblendungen entfernen.
    await seite.evaluate(() => {
      const muster =
        '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="borlabs" i],[id*="usercentrics" i],[class*="cmplz" i]';
      document.querySelectorAll(muster).forEach((el) => el.remove());
    });

    // Bildlaufleiste ausblenden, damit das Bild als Material taugt.
    await seite.addStyleTag({
      content:
        'html{scrollbar-width:none !important;}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0 !important;height:0 !important;display:none !important;}',
    });

    // Kurz anscrollen und zurueck, damit Eintrittsanimationen laufen.
    await seite.evaluate(() => window.scrollTo(0, 600));
    await seite.waitForTimeout(1400);
    await seite.evaluate(() => window.scrollTo(0, 0));
    await seite.waitForTimeout(2600);

    await seite.screenshot({ path: path.join(ZIEL, `${s.name}-hero.png`) });
    const hoehe = await seite.evaluate(() => document.body.scrollHeight);
    if (hoehe > 900 && hoehe < 25000) {
      await seite.screenshot({
        path: path.join(ZIEL, `${s.name}-voll.png`),
        fullPage: true,
        timeout: 90000,
      });
    }
    console.log(`ok ${s.name}  hoehe ${hoehe}`);
    await kontext.close();
  } catch (fehler) {
    console.log(`FEHLER ${s.name} ${String(fehler).slice(0, 200)}`);
    try {
      await kontext?.close();
    } catch {
      // egal
    }
  }
}

await aufraeumen();
