/**
 * Dichte Aufnahmereihe der Referenz beim Scrollen.
 *
 * Zwei Reihen. Erst RUHE, also ohne jede Scrollbewegung, um zu sehen wie
 * schnell sich die Struktur von allein dreht. Dann SCROLL in kleinen
 * Schritten, um die Reaktion auf die Bewegung zu messen.
 *
 * Gemessen wird die Verschiebung des Musters ueber einen normierten
 * Blockvergleich. Der Block liegt im offenen Faecher, wo die Referenz ihre
 * schnellste Bildbewegung zeigt.
 */
import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('_ref2/refscroll', { recursive: true });
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://dnacapital.com/', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForTimeout(12000);

// Reihe A, Ruhe. Zwoelf Bilder im Abstand von 400 ms, kein Scrollen.
for (let i = 0; i < 12; i++) {
  await page.screenshot({ path: `_ref2/refscroll/ruhe${String(i).padStart(2, '0')}.png` });
  await page.waitForTimeout(400);
}

// Reihe B, Scrollen in Schritten von 120 Bildpunkten, nach jedem Schritt
// sofort ein Bild. So laeszt sich die Verschiebung je Scrollpunkt bestimmen.
for (let i = 0; i < 16; i++) {
  await page.evaluate((d) => window.scrollBy(0, d), 120);
  await page.waitForTimeout(260);
  await page.screenshot({ path: `_ref2/refscroll/roll${String(i).padStart(2, '0')}.png` });
}
console.log('fertig, scrollY =', await page.evaluate(() => Math.round(window.scrollY)));
await browser.close();
