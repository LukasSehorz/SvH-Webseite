// Waagerechter Ueberlauf auf allen Seiten und Breiten, gemessen NACH einem
// vollstaendigen Durchlauf. Ohne den Durchlauf stehen die Szenen, die am
// Scrollstand haengen, noch in ihrem Ruhezustand und ein Ueberhang, den
// erst die Bewegung erzeugt, bleibt unentdeckt.
import { starten } from './browser.mjs';

const PORT = process.argv[2] || '3239';

const PFADE = [
  '/',
  '/ki',
  '/marketing',
  '/marketing/webseiten',
  '/marketing/social-media',
  '/marketing/werbetafeln',
  '/ueber-uns',
  '/kontakt',
  '/impressum',
];
const BREITEN = [390, 768, 1440, 2560];

const { browser, aufraeumen } = await starten();

for (const breite of BREITEN) {
  for (const pfad of PFADE) {
    const page = await browser.newPage({
      viewport: { width: breite, height: breite < 500 ? 844 : 900 },
      deviceScaleFactor: 1,
    });
    try {
      await page.goto(`http://localhost:${PORT}${pfad}`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      });
      await page.waitForTimeout(3200);
      await page.evaluate(async () => {
        const warten = (ms) => new Promise((r) => setTimeout(r, ms));
        const h = () => document.documentElement.scrollHeight;
        for (let y = 0; y < h(); y += 360) {
          document.scrollingElement.scrollTop = y;
          await warten(110);
        }
        document.scrollingElement.scrollTop = 0;
      });
      await page.waitForTimeout(1400);
      const m = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        fenster: document.documentElement.clientWidth,
      }));
      const ueber = m.doc - m.fenster;
      console.log(`${breite}\t${pfad}\t${ueber > 0 ? `UEBERLAUF ${ueber}` : 'ok'}`);
    } catch (fehler) {
      console.log(`${breite}\t${pfad}\tFEHLER ${String(fehler).slice(0, 120)}`);
    }
    await page.close();
  }
}

await aufraeumen();
