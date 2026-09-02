/**
 * KRITIKER-Durchlauf. Eine Sitzung, echte Grafikkarte.
 *  - bare-Bilder (Text ausgeblendet) zur Formmessung
 *  - normale Bilder zur Lesbarkeit
 *  - Ruhebewegung: zwei Bilder im Abstand von 2 s
 *  - Scrollverhalten runter und hoch
 *  - Bildrate, Konsolenfehler, Ueberlauf
 */
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = '_ref2/tmp';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const geo = await page.evaluate(() => {
  const se = document.scrollingElement;
  const g = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + se.scrollTop), h: Math.round(r.height) };
  };
  return { marketing: g('marketing'), referenzen: g('referenzen'), docH: se.scrollHeight };
});

const jump = async (y) => {
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, Math.round(y)));
  await page.waitForTimeout(3200);
};

const M = geo.marketing.top;
const R = geo.referenzen ? geo.referenzen.top : M + geo.marketing.h;

// ---------- 1. normale Bilder ueber die ganze Zone ----------
const offs = [-700, -350, 0, 500, 1000, 1500, 1900];
for (const o of offs) { await jump(M + o); await page.screenshot({ path: `${OUT}/k-n${o}.png` }); }

// Referenzen-Sektion Oberkante im Blick
await jump(R - 200); await page.screenshot({ path: `${OUT}/k-ref-200.png` });
await jump(R);       await page.screenshot({ path: `${OUT}/k-ref0.png` });

// ---------- 2. Ruhebewegung bei offset 0 ----------
await jump(M);
await page.screenshot({ path: `${OUT}/k-mo-a.png` });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/k-mo-b.png` });
await page.waitForTimeout(333);
await page.screenshot({ path: `${OUT}/k-mo-c.png` });

// ---------- 3. Bildrate ----------
const fps = await page.evaluate(() => new Promise((res) => {
  const ts = []; let n = 0; let last = performance.now();
  const tick = (t) => { ts.push(t - last); last = t; if (++n < 150) requestAnimationFrame(tick); else {
    const s = ts.slice(20).sort((a, b) => a - b);
    res({ p50: +s[Math.floor(s.length * 0.5)].toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1) });
  } };
  requestAnimationFrame(tick);
}));

// ---------- 4. Scroll runter und hoch: Bewegung waehrend des Scrollens ----------
await jump(M);
await page.screenshot({ path: `${OUT}/k-sc-pre.png` });
// weich runter ueber 600 ms
await page.evaluate(async () => {
  const se = document.scrollingElement; const s0 = se.scrollTop;
  const t0 = performance.now();
  await new Promise((r) => { const st = () => { const p = Math.min(1, (performance.now() - t0) / 600);
    se.scrollTop = s0 + p * 600; if (p < 1) requestAnimationFrame(st); else r(); }; st(); });
});
await page.screenshot({ path: `${OUT}/k-sc-down.png` });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/k-sc-down-rest.png` });
// weich hoch
await page.evaluate(async () => {
  const se = document.scrollingElement; const s0 = se.scrollTop;
  const t0 = performance.now();
  await new Promise((r) => { const st = () => { const p = Math.min(1, (performance.now() - t0) / 600);
    se.scrollTop = s0 - p * 600; if (p < 1) requestAnimationFrame(st); else r(); }; st(); });
});
await page.screenshot({ path: `${OUT}/k-sc-up.png` });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/k-sc-up-rest.png` });

// ---------- 5. bare (Text weg) zur Formmessung ----------
await page.addStyleTag({
  content: `[class*="dnaZoneContent"], [class*="Content"], header, nav, footer, h1,h2,h3,p,a,button,svg { visibility: hidden !important; }
            [class*="dnaWash"] { display: none !important; }`,
});
await page.waitForTimeout(600);
for (const o of [-350, 0, 500, 1000, 1500]) { await jump(M + o); await page.screenshot({ path: `${OUT}/k-b${o}.png` }); }
await jump(R - 200); await page.screenshot({ path: `${OUT}/k-b-ref-200.png` });
await jump(R);       await page.screenshot({ path: `${OUT}/k-b-ref0.png` });

// ---------- 6. Ueberlauf bei mehreren Breiten ----------
const over = {};
for (const [w, h] of [[1920, 1080], [1600, 900], [1280, 800], [390, 844]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(900);
  await jump(M);
  over[w] = await page.evaluate(() => ({
    of: document.documentElement.scrollWidth > window.innerWidth + 1,
    sw: document.documentElement.scrollWidth, iw: window.innerWidth,
  }));
  await page.screenshot({ path: `${OUT}/k-w${w}.png` });
}

console.log(JSON.stringify({ geo, fps, over, errors: [...new Set(errors)] }, null, 1));
await browser.close();
