/**
 * Animationsprüfung der Unterseiten.
 *   node _ref/anim-sub.mjs [basis-url]
 *
 * Je Leistungsseite:
 *  - bewegen sich die Mockups im Bento-Raster wirklich? (Pixelvergleich über die Zeit)
 *  - laufen die Mockups versetzt statt im Gleichtakt?
 *  - öffnet und schließt das FAQ-Accordion (aria-expanded)?
 *  - läuft mit reducedMotion:'reduce' keine Endlos-Animation mehr?
 */
import { chromium } from 'playwright';
import crypto from 'crypto';

const base = process.argv[2] || 'http://localhost:3100';
const pages = [
  '/leistungen/ki-automatisierung-agenten',
  '/leistungen/marketing',
  '/leistungen/webseiten',
];

const out = [];
const log = (name, ok, info = '') => {
  out.push(ok);
  console.log(`${ok ? 'OK  ' : 'FEHL'} | ${name}${info ? ' | ' + info : ''}`);
};

const browser = await chromium.launch();

const hash = async (el) =>
  crypto.createHash('md5').update(await el.screenshot()).digest('hex').slice(0, 10);

/* ------------------------------ Bewegung -------------------------------- */

for (const p of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 140)));
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // durchscrollen, damit alle Reveals ausgelöst sind
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(70);
  }

  const grid = await page.$('section[aria-labelledby="bausteine-titel"]');
  await grid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const mocks = await page.$$('section[aria-labelledby="bausteine-titel"] div[role="img"]');
  // nur die im Sichtfeld liegenden prüfen
  const visible = [];
  for (const el of mocks) {
    const box = await el.boundingBox();
    if (box && box.y > -50 && box.y + box.height < 900) visible.push(el);
  }
  const probe = visible.slice(0, 4);

  // Zeitreihe von Prüfsummen je Mockup
  const series = probe.map(() => []);
  for (let t = 0; t < 8; t++) {
    for (let i = 0; i < probe.length; i++) series[i].push(await hash(probe[i]));
    await page.waitForTimeout(420);
  }

  const moving = series.filter((s) => new Set(s).size > 1).length;
  log(
    `${p} — Mockups bewegen sich`,
    probe.length > 0 && moving === probe.length,
    `${moving}/${probe.length} Kacheln ändern sich`
  );

  // Phasenversatz: die Wechselzeitpunkte dürfen nicht identisch sein
  const changePattern = series.map((s) =>
    s.slice(1).map((v, i) => (v === s[i] ? '0' : '1')).join('')
  );
  log(
    `${p} — Mockups laufen versetzt`,
    new Set(changePattern).size > 1,
    changePattern.join(' / ')
  );

  /* --------------------------- FAQ-Accordion --------------------------- */
  const faqBtn = await page.$('section[aria-labelledby="service-faq-titel"] button[aria-expanded]');
  await faqBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const a0 = await faqBtn.getAttribute('aria-expanded');
  await faqBtn.click();
  await page.waitForTimeout(600);
  const a1 = await faqBtn.getAttribute('aria-expanded');
  const panelVisible = await page.evaluate(() => {
    const b = document.querySelector('section[aria-labelledby="service-faq-titel"] button[aria-expanded="true"]');
    if (!b) return false;
    const panel = document.getElementById(b.getAttribute('aria-controls'));
    return !!panel && panel.getBoundingClientRect().height > 10;
  });
  await faqBtn.click();
  await page.waitForTimeout(600);
  const a2 = await faqBtn.getAttribute('aria-expanded');
  log(
    `${p} — FAQ öffnet und schließt`,
    a0 === 'false' && a1 === 'true' && panelVisible && a2 === 'false',
    `${a0} → ${a1} (Panel sichtbar: ${panelVisible}) → ${a2}`
  );

  log(`${p} — keine Konsolenfehler`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* -------------------------- reduzierte Bewegung ------------------------- */

for (const p of pages) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(70);
  }
  const grid = await page.$('section[aria-labelledby="bausteine-titel"]');
  await grid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000); // alles zur Ruhe kommen lassen

  const mocks = await page.$$('section[aria-labelledby="bausteine-titel"] div[role="img"]');
  const visible = [];
  for (const el of mocks) {
    const box = await el.boundingBox();
    if (box && box.y > -50 && box.y + box.height < 900) visible.push(el);
  }
  const probe = visible.slice(0, 4);
  const before = [];
  for (const el of probe) before.push(await hash(el));
  await page.waitForTimeout(2600);
  const after = [];
  for (const el of probe) after.push(await hash(el));
  const changed = before.filter((v, i) => v !== after[i]).length;
  log(
    `${p} — reducedMotion: keine Endlos-Animation`,
    probe.length > 0 && changed === 0,
    `${changed}/${probe.length} Kacheln ändern sich trotz reduce`
  );

  // laufende CSS/WAAPI-Animationen zählen
  const running = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running').length
  );
  log(`${p} — reducedMotion: keine laufenden Web-Animationen`, running === 0, `${running} aktiv`);
  await ctx.close();
}

await browser.close();
const fails = out.filter((v) => !v).length;
console.log(fails ? `\n${fails} Punkt(e) fehlerhaft` : '\nalles in Ordnung');
process.exit(fails ? 1 : 0);
