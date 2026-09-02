/**
 * Ein Durchgang ueber alle Stellen, die der Fixlauf beruehrt hat.
 *
 *   node _ref2/pruef-fix.mjs <port> <zielverzeichnis>
 *
 * Aufgenommen wird bei 1440, die Startseite und die Werbetafeln
 * zusaetzlich bei 390 und 2560. Dazu die Leiste mit offenem Menue und
 * die Kontaktseite ganzseitig. Gemessen wird nebenbei, ob eine Seite
 * waagerecht ueberlaeuft.
 */
import { starten } from './browser.mjs';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.argv[2] || '3239';
const OUT = process.argv[3] || '.impeccable/review/fix';
fs.mkdirSync(OUT, { recursive: true });

const SEITEN = [
  { tag: 'start', pfad: '/', schuesse: 9 },
  { tag: 'ki', pfad: '/ki', schuesse: 5 },
  { tag: 'web', pfad: '/marketing/webseiten', schuesse: 8 },
  { tag: 'social', pfad: '/marketing/social-media', schuesse: 5 },
  { tag: 'tafeln', pfad: '/marketing/werbetafeln', schuesse: 8 },
  { tag: 'kontakt', pfad: '/kontakt', schuesse: 3 },
];

const BREITEN = [
  { tag: '1440', width: 1440, height: 900, seiten: null },
  { tag: '390', width: 390, height: 844, seiten: ['start', 'tafeln'] },
  { tag: '2560', width: 2560, height: 1440, seiten: ['start', 'tafeln'] },
];

const bericht = [];
const { browser, aufraeumen } = await starten();

for (const b of BREITEN) {
  for (const s of SEITEN) {
    if (b.seiten && !b.seiten.includes(s.tag)) continue;

    const page = await browser.newPage({
      viewport: { width: b.width, height: b.height },
      deviceScaleFactor: 1,
    });
    try {
      await page.goto(`http://localhost:${PORT}${s.pfad}`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      });
      await page.waitForTimeout(5200);

      // Waagerechter Ueberlauf. Gemessen wird am Blatt und nicht am Fenster,
      // denn der Rollbalken zaehlt nicht als Ueberlauf.
      const ueber = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        fenster: document.documentElement.clientWidth,
      }));
      bericht.push({
        seite: s.tag,
        breite: b.tag,
        ueberlauf: ueber.doc - ueber.fenster,
      });

      const hoehe = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      const schritt = Math.max(
        1,
        Math.floor((hoehe - b.height) / Math.max(1, s.schuesse - 1)),
      );

      for (let i = 0; i < s.schuesse; i += 1) {
        await page.evaluate((y) => {
          document.scrollingElement.scrollTop = y;
        }, i * schritt);
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(OUT, `${b.tag}-${s.tag}-${String(i).padStart(2, '0')}.png`),
        });
      }

      if (s.tag === 'kontakt' && b.tag === '1440') {
        await page.evaluate(() => {
          document.scrollingElement.scrollTop = 0;
        });
        await page.waitForTimeout(900);
        await page.screenshot({
          path: path.join(OUT, 'x-kontakt-voll.png'),
          fullPage: true,
        });
      }

      // Die Leiste mit offenem Aufklappmenue, nur einmal.
      if (s.tag === 'start' && b.tag === '1440') {
        await page.evaluate(() => {
          document.scrollingElement.scrollTop = 0;
        });
        await page.waitForTimeout(900);
        await page.hover('a[aria-haspopup="true"]');
        await page.waitForTimeout(1600);
        await page.screenshot({
          path: path.join(OUT, 'x-leiste-offen.png'),
          clip: { x: 0, y: 0, width: b.width, height: 460 },
        });
      }

      console.log(`ok ${b.tag} ${s.tag} hoehe ${hoehe} ueberlauf ${ueber.doc - ueber.fenster}`);
    } catch (fehler) {
      console.log(`FEHLER ${b.tag} ${s.tag} ${String(fehler).slice(0, 200)}`);
    }
    await page.close();
  }
}

fs.writeFileSync(path.join(OUT, 'ueberlauf.json'), JSON.stringify(bericht, null, 2));
await aufraeumen();
