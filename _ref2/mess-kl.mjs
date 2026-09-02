/* Misst die Luecke zwischen der Textspalte und der Buehne in der
   KI-Sektion der Startseite. */
import { starten } from './browser.mjs';
const { browser, aufraeumen } = await starten();
for (const breite of [1440, 2560]) {
  const seite = await browser.newPage({ viewport: { width: breite, height: 1000 } });
  await seite.goto('http://localhost:3210/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(700);
  const w = await seite.evaluate(() => {
    const karte = document.querySelector('.kl-card');
    const buehne = document.querySelector('.kl-sticky');
    const k = karte.getBoundingClientRect();
    const b = buehne.getBoundingClientRect();
    return {
      lay: document.documentElement.clientWidth,
      karteRechts: Math.round(k.right),
      buehneLinks: Math.round(b.left),
      buehneRechts: Math.round(b.right),
      luecke: Math.round(b.left - k.right),
    };
  });
  console.log(breite, JSON.stringify(w));
  await seite.close();
}
await aufraeumen();
