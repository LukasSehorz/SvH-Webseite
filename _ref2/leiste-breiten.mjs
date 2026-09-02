// Hoehe des Abschlussknopfs in der Leiste ueber mehrere Breiten. Bricht die
// Beschriftung um, waechst der Knopf ueber seine 40 Bildpunkte hinaus.
import { starten } from './browser.mjs';
const PORT = process.argv[2] || '3239';
const { browser, aufraeumen } = await starten();
for (const breite of [768, 900, 1024, 1200, 1280, 1440, 1920, 2560]) {
  const page = await browser.newPage({ viewport: { width: breite, height: 900 } });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const el = document.querySelector('.nav-actions .btn-solid');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height), w: Math.round(r.width), sichtbar: r.width > 0 };
  });
  console.log(`${breite}\t${m ? JSON.stringify(m) : 'kein Knopf sichtbar'}`);
  await page.close();
}
await aufraeumen();
