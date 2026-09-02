/**
 * Bildrate im Vergleich. Eine ruhige Seite als Masstab, damit sich ein
 * Taktproblem des Schirms von einer echten Last unterscheiden laesst.
 *
 *   node _ref2/pg-rate2.mjs
 */
import { starten } from './browser.mjs';

const BASIS = 'http://localhost:3210';
const { browser, aufraeumen } = await starten();

const messen = async (route, sprungZu) => {
  const s = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await s.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await s.waitForTimeout(3000);
  if (sprungZu) {
    for (let p = 0; p < 2; p++) {
      await s.evaluate((id) => {
        const el = document.getElementById(id);
        if (el) document.scrollingElement.scrollTop += el.getBoundingClientRect().top;
      }, sprungZu);
      await s.waitForTimeout(p === 0 ? 800 : 2600);
    }
  }
  await s.evaluate(() => {
    window.__ft = []; let last = performance.now();
    const t = (n) => { window.__ft.push(n - last); last = n; requestAnimationFrame(t); };
    requestAnimationFrame(t);
  });
  await s.waitForTimeout(7000);
  const ft = (await s.evaluate(() => window.__ft.slice(12))).sort((a, b) => a - b);
  await s.close();
  const p = (q) => ft[Math.floor(ft.length * q)].toFixed(1);
  return `${route} ${sprungZu || 'oben'}`.padEnd(30) + ` n=${ft.length} p50=${p(0.5)} p95=${p(0.95)} p99=${p(0.99)} max=${ft[ft.length - 1].toFixed(1)}`;
};

console.log(await messen('/impressum', null));
console.log(await messen('/', null));
console.log(await messen('/', 'marketing'));
console.log(await messen('/', 'ablauf'));
console.log(await messen('/marketing/social-media', null));
console.log(await messen('/marketing/werbetafeln', null));

await aufraeumen();
