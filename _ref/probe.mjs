/**
 * Liest berechnete Stile / Masse von Elementen der laufenden Seite.
 *   node _ref/probe.mjs <url> <breite> "<selektor>" [weitere selektoren...]
 */
import { chromium } from 'playwright';

const [url, width, ...sel] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width) || 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);

for (const s of sel) {
  const out = await page.$$eval(s, (els) =>
    els.slice(0, 12).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 60),
        text: (el.textContent || '').trim().slice(0, 40),
        x: Math.round(r.left),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        fs: cs.fontSize,
        lh: cs.lineHeight,
        fw: cs.fontWeight,
        ls: cs.letterSpacing,
        color: cs.color,
        pad: cs.padding,
        minH: cs.minHeight,
      };
    })
  ).catch((e) => 'ERR ' + e.message);
  console.log('### ' + s);
  console.log(JSON.stringify(out, null, 1));
}
await browser.close();
