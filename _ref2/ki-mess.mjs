/**
 * Kurze Messung an /ki. Sie liest die berechneten Werte der Schiene und
 * der Farbnebel aus, damit nicht geraten werden muss, warum etwas nicht
 * zu sehen ist.
 */
import { starten } from './browser.mjs';

const PORT = process.env.PORT || 3232;
const { browser, aufraeumen } = await starten();

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/ki`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const werte = await page.evaluate(() => {
    const lies = (el, felder) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const out = { breite: r.width, hoehe: r.height };
      for (const f of felder) out[f] = s.getPropertyValue(f);
      return out;
    };

    return {
      schiene: lies(document.querySelector('.ki-flow-rail'), [
        'width',
        'background-color',
        'overflow',
        'position',
      ]),
      fuellung: lies(document.querySelector('.ki-flow-rail-fill'), [
        'background-image',
        'transform',
        'transform-origin',
        'opacity',
        'position',
        'inset',
      ]),
      nebelKachel: lies(document.querySelector('.ki-tile-mist'), [
        'background-image',
        'opacity',
        'filter',
        'position',
        'inset-block-end',
      ]),
      nebelSchritt: lies(document.querySelector('.ki-flow-mist'), [
        'background-image',
        'opacity',
        'filter',
      ]),
    };
  });

  console.log(JSON.stringify(werte, null, 2));
} finally {
  await aufraeumen();
}
