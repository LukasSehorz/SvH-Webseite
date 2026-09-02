// Sichtung von Referenzseiten. Ganzseitiger Screenshot bei 1440 Breite.
// Der Browser kommt aus _ref2/browser.mjs, damit keine fremden Prozesse
// beendet werden.
import { starten } from '../_ref2/browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ZIEL = process.argv[2];
const LISTE = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

fs.mkdirSync(ZIEL, { recursive: true });

const { browser, aufraeumen } = await starten();

for (const eintrag of LISTE) {
  const { name, url } = eintrag;
  const datei = path.join(ZIEL, `${name}-voll.png`);
  if (fs.existsSync(datei)) {
    console.log(`schon da  ${name}`);
    continue;
  }
  let kontext;
  try {
    kontext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });
    const seite = await kontext.newPage();
    await seite.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try {
      await seite.waitForLoadState('networkidle', { timeout: 25000 });
    } catch {
      // Manche Seiten halten dauerhaft offene Verbindungen, das ist kein Fehler.
    }
    await seite.waitForTimeout(6000);

    // Cookie-Hinweise wegklicken, soweit die ueblichen Beschriftungen greifen.
    const knoepfe = [
      'button:has-text("Accept")',
      'button:has-text("Akzeptieren")',
      'button:has-text("Alle akzeptieren")',
      'button:has-text("Allow all")',
      'button:has-text("Got it")',
      'button:has-text("I agree")',
      'button:has-text("Zustimmen")',
      '[id*="accept" i]',
    ];
    for (const wahl of knoepfe) {
      try {
        const el = seite.locator(wahl).first();
        if (await el.isVisible({ timeout: 700 })) {
          await el.click({ timeout: 1500 });
          await seite.waitForTimeout(900);
          break;
        }
      } catch {
        // Kein Banner vorhanden.
      }
    }

    // Langsam durchscrollen, damit Eintrittsanimationen ausgeloest sind.
    await seite.evaluate(async () => {
      const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
      let y = 0;
      for (let i = 0; i < 90; i++) {
        y += window.innerHeight * 0.55;
        window.scrollTo({ top: y, behavior: 'instant' });
        await schlaf(220);
        if (y > document.body.scrollHeight + window.innerHeight) break;
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await schlaf(1200);
    });
    await seite.waitForTimeout(2500);

    const hoehe = await seite.evaluate(() => document.body.scrollHeight);
    console.log(`${name}  hoehe ${hoehe}`);
    await seite.screenshot({
      path: datei,
      fullPage: hoehe < 30000,
      timeout: 90000,
    });
    console.log(`ok        ${name}`);
    await kontext.close();
  } catch (fehler) {
    console.log(`FEHLER    ${name}  ${String(fehler).slice(0, 180)}`);
    try {
      await kontext?.close();
    } catch {
      // egal
    }
  }
}

await aufraeumen();
