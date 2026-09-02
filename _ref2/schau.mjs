/**
 * Ein Durchgang, der Schreibtisch und Telefon zusammen aufnimmt.
 *
 *   node _ref2/schau.mjs <port> <zielverzeichnis>
 *
 * Auf dieser Maschine kostet jeder Browserstart Minuten, weil der
 * Arbeitsspeicher knapp ist. Zwei getrennte Laeufe waeren deshalb teuer,
 * und die Pruefung soll ohnehin in einer Runde geschehen statt in einer
 * Schleife aus Einzelbildern.
 *
 * Die Stellen sind an den drei Straengen ausgerichtet und werden ueber
 * die Kennung des Blocks gesucht, nicht ueber feste Bildpunkte. Feste
 * Werte haben in diesem Projekt schon mehrfach ins Leere gemessen, weil
 * die Sektion zwischendurch gewachsen ist.
 */
import { starten } from './browser.mjs';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const OUT = process.argv[3] || '_ref2/tmp/schau';
fs.mkdirSync(OUT, { recursive: true });

const GERAETE = [
  { tag: 'desk', width: 1440, height: 900 },
  { tag: 'phone', width: 390, height: 844 },
];

const { browser, aufraeumen } = await starten();

for (const g of GERAETE) {
  const page = await browser.newPage({
    viewport: { width: g.width, height: g.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:${PORT}/`, {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  });
  // Auf die Sektion warten und nicht auf die Uhr. Sie haengt an einem
  // Eintrittsbeobachter, steht also im Baum, bevor sie sichtbar wird.
  await page.waitForSelector('#marketing', { state: 'attached', timeout: 240000 });
  await page.waitForTimeout(6000);

  const springe = async (sel) => {
    for (let i = 0; i < 8; i++) {
      const top = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        return Math.round(
          el.getBoundingClientRect().top + document.scrollingElement.scrollTop,
        );
      }, sel);
      if (top === null) return false;
      await page.evaluate((v) => {
        document.scrollingElement.scrollTop = v;
      }, Math.max(0, top - 60));
      await page.waitForTimeout(800);
      const ist = await page.evaluate((s) => {
        const el = document.querySelector(s);
        return el ? Math.round(el.getBoundingClientRect().top) : 9999;
      }, sel);
      if (Math.abs(ist - 60) <= 8) break;
    }
    return true;
  };

  const stellen = [
    ['kopf', '#marketing'],
    ['web', '[data-strand="web"]'],
    ['social', '[data-strand="social"]'],
    ['dooh', '[data-strand="dooh"]'],
  ];

  for (const [name, sel] of stellen) {
    const da = await springe(sel);
    if (!da) {
      console.log(`FEHLT: ${sel}`);
      continue;
    }
    // Die Blocke blenden beim Eintritt ein. Ohne diese Wartezeit nimmt
    // man die halbe Bewegung auf und haelt sie fuer das Ergebnis.
    await page.waitForTimeout(2200);
    const f = `${OUT}/${g.tag}-${name}.png`;
    await page.screenshot({ path: f });
    console.log(f);
  }

  // Waagerechter Ueberlauf ist auf dieser Seite schon einmal unbemerkt
  // geblieben, deshalb wird er hier gleich mitgemessen.
  const ueber = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(`${g.tag}: waagerechter Ueberlauf ${ueber} px`);

  await page.close();
}

await aufraeumen();
