/**
 * Misst, wo der Inhalt je Schirmbreite beginnt und endet, und wo die
 * laengsten Zeilen der Marketing-Sektion aufhoeren. Der Wert fuer die
 * Zeilen kommt aus Range.getClientRects, damit nicht der Kasten des
 * Absatzes, sondern die tatsaechlich gesetzte Zeile gemessen wird.
 */
import { starten } from './browser.mjs';

const BREITEN = [1440, 1920, 2560];
const URL = process.argv[2] || 'http://localhost:3210/';

const { browser, aufraeumen } = await starten();

for (const breite of BREITEN) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 900 } });
  await seite.goto(URL, { waitUntil: 'networkidle' });
  await seite.evaluate(() => window.scrollTo(0, 0));
  await seite.waitForTimeout(600);

  const werte = await seite.evaluate(() => {
    const zeilenEnden = (wurzel) => {
      const enden = [];
      const lauf = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT);
      let knoten;
      while ((knoten = lauf.nextNode())) {
        if (!knoten.nodeValue || !knoten.nodeValue.trim()) continue;
        const bereich = document.createRange();
        bereich.selectNodeContents(knoten);
        for (const kasten of bereich.getClientRects()) {
          if (kasten.width < 2 || kasten.height < 2) continue;
          enden.push({
            rechts: Math.round(kasten.right),
            links: Math.round(kasten.left),
            text: (knoten.nodeValue || '').trim().slice(0, 40),
          });
        }
      }
      return enden;
    };

    const schale = document.querySelector('.shell');
    const schaleKasten = schale ? schale.getBoundingClientRect() : null;
    const stil = schale ? getComputedStyle(schale) : null;

    const marketing = document.querySelector('#marketing');
    let dna = null;
    if (marketing) {
      const enden = zeilenEnden(marketing).sort((a, b) => b.rechts - a.rechts);
      dna = {
        maxRechts: enden.length ? enden[0].rechts : null,
        top5: enden.slice(0, 5),
      };
    }

    const alleZeilen = zeilenEnden(document.body).sort((a, b) => b.rechts - a.rechts);

    return {
      vw: window.innerWidth,
      schale: schaleKasten
        ? {
            links: Math.round(schaleKasten.left),
            rechts: Math.round(schaleKasten.right),
            breite: Math.round(schaleKasten.width),
            padL: stil.paddingLeft,
            inhaltLinks: Math.round(schaleKasten.left + parseFloat(stil.paddingLeft)),
            inhaltRechts: Math.round(schaleKasten.right - parseFloat(stil.paddingRight)),
          }
        : null,
      dna,
      breitesteZeile: alleZeilen.length ? alleZeilen[0] : null,
      ueberlauf: {
        scrollBreite: document.documentElement.scrollWidth,
        innen: window.innerWidth,
      },
    };
  });

  console.log(JSON.stringify({ breite, ...werte }, null, 1));
  await seite.close();
}

await aufraeumen();
