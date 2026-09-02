/* Zaehlt fuer jeden Absatz die Zeichen der laengsten gesetzten Zeile und
   meldet die zehn breitesten. Damit laesst sich pruefen, ob das
   Zeichenmasz von rund siebzig Zeichen ueberall haelt. */
import { starten } from './browser.mjs';
const { browser, aufraeumen } = await starten();
for (const breite of [1440, 1920, 2560]) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 900 } });
  await seite.goto('http://localhost:3210/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(700);
  const liste = await seite.evaluate(() => {
    const raus = [];
    for (const p of document.querySelectorAll('p, li')) {
      const text = (p.textContent || '').trim();
      if (text.length < 60) continue;
      const bereich = document.createRange();
      bereich.selectNodeContents(p);
      const kaesten = [...bereich.getClientRects()].filter((k) => k.width > 2 && k.height > 2);
      if (!kaesten.length) continue;
      const zeilen = new Set(kaesten.map((k) => Math.round(k.top))).size;
      raus.push({ zeichen: Math.round(text.length / zeilen), zeilen, text: text.slice(0, 40) });
    }
    return raus.sort((a, b) => b.zeichen - a.zeichen).slice(0, 6);
  });
  console.log('---', breite);
  for (const z of liste) console.log('  ', z.zeichen, 'Zeichen je Zeile,', z.zeilen, 'Zeilen |', z.text);
  await seite.close();
}
await aufraeumen();
