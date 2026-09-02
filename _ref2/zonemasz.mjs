/**
 * Die Masze der DNA-Zone im gebauten Stand, unmittelbar aus dem Baum.
 *
 *   node _ref2/zonemasz.mjs <port>
 *
 * Gebraucht wird daraus der Scrollweg, ueber den die Struktur ueberhaupt
 * zu sehen ist, denn nur ueber diesen Weg zaehlen die Kreuzungen.
 */
import { chromium } from 'playwright';

const PORT = process.argv[2] || '3210';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('canvas[data-engine]', { state: 'attached', timeout: 240000 });
await page.waitForTimeout(9000);

const out = await page.evaluate(() => {
  const se = document.scrollingElement;
  const sek = document.getElementById('marketing');
  const leinwaende = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect();
    const p = c.parentElement;
    const pr = p.getBoundingClientRect();
    const gp = p.parentElement;
    const gr = gp.getBoundingClientRect();
    return {
      klasse: c.className,
      engine: c.dataset.engine || null,
      w: Math.round(r.width), h: Math.round(r.height),
      top: Math.round(r.top + se.scrollTop),
      eltern: p.className,
      elternTop: Math.round(pr.top + se.scrollTop),
      elternHoehe: Math.round(pr.height),
      grosz: gp.className,
      groszTop: Math.round(gr.top + se.scrollTop),
      groszHoehe: Math.round(gr.height),
    };
  });
  return {
    sektionTop: Math.round(sek.getBoundingClientRect().top + se.scrollTop),
    sektionHoehe: Math.round(sek.getBoundingClientRect().height),
    fenster: window.innerHeight,
    leinwaende,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
