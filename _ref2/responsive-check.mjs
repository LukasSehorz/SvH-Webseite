/**
 * Überlauf- und Breitenprüfung für den Landing-Rahmen.
 *
 *   node _ref2/responsive-check.mjs
 *
 * Prüft 390 / 768 / 1024 / 1440 / 1920 auf horizontalen Überlauf und schießt
 * je Breite einen Hero- und einen Abschluss-Ausschnitt.
 */
import { chromium } from 'playwright';
import fs from 'fs';

// Der Port ist jetzt angebbar, damit derselbe Lauf gegen den schnellen
// Produktionsbau auf 3210 geht und nicht nur gegen 3100.
const URL = `http://localhost:${process.argv[2] || '3100'}/`;
const WIDTHS = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1024, h: 800 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

const out = '_ref2/shots/chk/responsive';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const summary = [];

for (const { w, h } of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 180)));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 180)));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2400);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += Math.round(h * 0.9)) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);

  /* Überlauf. Nur eigene Sektionen melden, die Nachbaragenten bauen parallel. */
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const bad = [];
    // Ein Element, das ein Vorfahr seitlich beschneidet, kann die Seite nicht
    // breiter machen. Solche Schmuckflächen (Nebelschleier) zählen nicht.
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') return true;
      }
      return false;
    };
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.position === 'fixed' || s.display === 'none' || s.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      if (clipped(el)) continue;
      if (r.right > de.clientWidth + 2 || r.left < -2) {
        const own = el.closest(
          '.hero, #problem, #ablauf, #fragen, .final-cta, .site-footer, .site-nav',
        );
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className).slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
          mine: !!own,
          where: own ? own.className.slice(0, 30) || own.id : 'fremd',
        });
      }
    }
    return {
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      offenders: bad.slice(0, 14),
      mineCount: bad.filter((b) => b.mine).length,
    };
  });

  /* Hero-Ausschnitt */
  await page.screenshot({ path: `${out}/${w}-hero.png` });

  /* Abschlussband */
  const cta = await page.$('.final-cta');
  if (cta) {
    await cta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await cta.screenshot({ path: `${out}/${w}-cta.png` });
  }

  /* Buttons nebeneinander nur wenn Platz */
  const heroBtns = await page.$$eval('.hero-actions > a', (els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), w: Math.round(r.width) };
    }),
  );
  const sideBySide = heroBtns.length === 2 && heroBtns[0].top === heroBtns[1].top;

  summary.push({
    width: w,
    scrollWidth: overflow.scrollWidth,
    clientWidth: overflow.clientWidth,
    ownOverflow: overflow.mineCount,
    foreignOverflow: overflow.offenders.length - overflow.mineCount,
    offenders: overflow.offenders,
    heroButtons: sideBySide ? 'nebeneinander' : 'untereinander',
    errors,
  });

  await ctx.close();
}

await browser.close();

for (const s of summary) {
  const state = s.ownOverflow === 0 && s.scrollWidth <= s.clientWidth + 1 ? '[ OK ]' : '[FEHL]';
  console.log(
    `${state} ${s.width}px  scrollWidth ${s.scrollWidth}/${s.clientWidth}  ` +
      `eigene Überläufe ${s.ownOverflow}, fremde ${s.foreignOverflow}  ` +
      `Hero-Knöpfe ${s.heroButtons}  Fehler ${s.errors.length}`,
  );
  for (const o of s.offenders) {
    console.log(`        ${o.mine ? 'EIGEN' : 'fremd'} ${o.tag}.${o.cls} [${o.left}..${o.right}] (${o.where})`);
  }
  for (const e of s.errors) console.log('        Konsole: ' + e);
}
fs.writeFileSync(`${out}/report.json`, JSON.stringify(summary, null, 2));
