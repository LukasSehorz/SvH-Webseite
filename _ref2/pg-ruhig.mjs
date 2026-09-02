/**
 * Bleibt bei reduzierter Bewegung etwas unsichtbar? Diesmal mit
 * ausreichend Wartezeit an jeder Stelle, damit ein spaeter Auftritt
 * nicht faelschlich als haengengeblieben zaehlt.
 *
 *   node _ref2/pg-ruhig.mjs
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
const BASIS = 'http://localhost:3210';
const { browser, aufraeumen } = await starten();
const erg = {};

for (const ruhig of [true, false]) {
  const s = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: ruhig ? 'reduce' : 'no-preference',
  });
  for (const route of ['/', '/marketing/social-media']) {
    await s.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await s.waitForTimeout(2500);
    const gesamt = await s.evaluate(() => document.scrollingElement.scrollHeight);
    const blind = [];
    for (let y = 0; y < gesamt; y += 600) {
      await s.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
      await s.waitForTimeout(1600);
      const b = await s.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('.kt-card, .pp-card, [class*="scopeItem"], [class*="bdBild"], .faq-row, [class*="strandWrap"]')) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 40 || r.top > window.innerHeight - 40) continue;
          const op = parseFloat(getComputedStyle(el).opacity);
          if (op < 0.5) out.push({ cls: String(el.className).slice(0, 40), op, t: (el.textContent || '').trim().slice(0, 34) });
        }
        return out;
      });
      blind.push(...b);
    }
    const s1 = new Set();
    erg[(ruhig ? 'ruhig' : 'normal') + ' ' + route] = blind.filter((x) => { const k = x.t + x.cls; if (s1.has(k)) return false; s1.add(k); return true; });
    // Bild der Ablauf-Sektion
    if (route === '/') {
      await s.evaluate(() => { const e = document.getElementById('ablauf'); document.scrollingElement.scrollTop += e.getBoundingClientRect().top - 40; });
      await s.waitForTimeout(2500);
      await s.screenshot({ path: `${ZIEL}/y-ablauf-${ruhig ? 'ruhig' : 'normal'}.png` });
      await s.evaluate(() => { const e = document.getElementById('ki-tiles-titel'); document.scrollingElement.scrollTop += e.getBoundingClientRect().top - 40; });
      await s.waitForTimeout(2500);
      await s.screenshot({ path: `${ZIEL}/y-kacheln-${ruhig ? 'ruhig' : 'normal'}.png` });
    }
  }
  await s.close();
}

fs.writeFileSync(`${ZIEL}/ruhig.json`, JSON.stringify(erg, null, 1));
for (const k of Object.keys(erg)) console.log(k, erg[k].length, JSON.stringify(erg[k].slice(0, 6)));
await aufraeumen();
