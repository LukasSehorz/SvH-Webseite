/**
 * Misst die Zeilenenden der Marketing-Sektion getrennt nach den beiden
 * Marken. Alles in der Sektion haelt 62 Prozent der Bildbreite, der
 * Fliesztext der Straenge haelt 54 Prozent. Verglichen wird auszerdem mit
 * der Achse der Struktur bei 74 Prozent.
 */
import { starten } from './browser.mjs';

const { browser, aufraeumen } = await starten();

for (const breite of [1440, 1920, 2560]) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 900 } });
  await seite.goto('http://localhost:3210/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(600);

  const werte = await seite.evaluate(() => {
    const enden = (wurzel) => {
      const liste = [];
      const lauf = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT);
      let knoten;
      while ((knoten = lauf.nextNode())) {
        if (!knoten.nodeValue || !knoten.nodeValue.trim()) continue;
        const bereich = document.createRange();
        bereich.selectNodeContents(knoten);
        for (const kasten of bereich.getClientRects()) {
          if (kasten.width < 2 || kasten.height < 2) continue;
          liste.push({
            rechts: Math.round(kasten.right),
            text: knoten.nodeValue.trim().slice(0, 46),
          });
        }
      }
      return liste.sort((a, b) => b.rechts - a.rechts);
    };

    const sektion = document.querySelector('#marketing');
    const straenge = sektion.querySelector('[class*="dnaStrands"]');
    const lay = document.documentElement.clientWidth;

    return {
      lay,
      sektion: enden(sektion).slice(0, 3),
      straenge: straenge ? enden(straenge).slice(0, 3) : null,
    };
  });

  const p = (x) => ((x / werte.lay) * 100).toFixed(1) + '%';
  console.log('--- Bildbreite', breite, 'Layoutbreite', werte.lay);
  console.log(
    '  Marke 62% =',
    Math.round(werte.lay * 0.62),
    '  Marke 54% =',
    Math.round(werte.lay * 0.54),
    '  Achse 74% =',
    Math.round(werte.lay * 0.74),
  );
  for (const z of werte.sektion) {
    console.log('  Sektion  ', z.rechts, p(z.rechts), '|', z.text);
  }
  for (const z of werte.straenge || []) {
    console.log('  Straenge ', z.rechts, p(z.rechts), '|', z.text);
  }
  await seite.close();
}

await aufraeumen();
