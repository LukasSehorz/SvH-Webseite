/** Schneller Überlauf- und Konsolen-Check über mehrere Breiten und Seiten. */
import { chromium } from 'playwright';

const paths = [
  '/',
  '/leistungen',
  '/leistungen/ki-automatisierung-agenten',
  '/leistungen/marketing',
  '/leistungen/webseiten',
  '/unternehmen/ueber-uns',
  '/unternehmen/kontakt',
  '/ressourcen/blog',
  '/ressourcen/fallstudien',
  '/impressum',
  '/datenschutz',
  '/agb',
];
const widths = [390, 768, 1024, 1440, 1920];
const base = process.argv[2] || 'http://localhost:3100';

const browser = await chromium.launch();
const out = [];

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));
  for (const p of paths) {
    errors.length = 0;
    await page.goto(base + p, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(600);
    const ov = await page.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      if (de.scrollWidth > de.clientWidth + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2))
            bad.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 50));
          if (bad.length >= 5) break;
        }
      }
      return { sw: de.scrollWidth, cw: de.clientWidth, bad };
    });
    out.push({ w, p, overflow: ov.sw > ov.cw + 1 ? ov : 'ok', errors: [...errors] });
  }
  await page.close();
}

console.log(JSON.stringify(out.filter((r) => r.overflow !== 'ok' || r.errors.length), null, 2) || '[]');
console.log('geprueft:', out.length, 'Kombinationen');
await browser.close();
