/**
 * Interaktionsprüfung des Landing-Rahmens.
 *
 *   node _ref2/interact-check.mjs [url]
 *
 * Prüft Navigation, Mobil-Menü, FAQ, Lenis, Hero-Konstellation und
 * reduzierte Bewegung. Gibt am Ende eine Liste mit OK oder FEHLER aus.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.argv[2] || 'http://localhost:3100/';
const results = [];
const shots = '_ref2/shots/chk';
fs.mkdirSync(shots, { recursive: true });

const ok = (name, info = '') => results.push({ name, state: 'OK', info });
const bad = (name, info = '') => results.push({ name, state: 'FEHLER', info });
const check = (name, cond, info = '') => (cond ? ok(name, info) : bad(name, info));

const browser = await chromium.launch();

/* ------------------------------------------------ 1 · Desktop 1440 */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 200)));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2600);

  /* Navbar-Verdichtung */
  const navBefore = await page.$eval('header.site-nav', (el) => el.className);
  const pillBefore = await page.$eval('.nav-pill-left', (el) => getComputedStyle(el).transform);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1200);
  const navAfter = await page.$eval('header.site-nav', (el) => el.className);
  const pillAfter = await page.$eval('.nav-pill-left', (el) => getComputedStyle(el).transform);
  check(
    'Navbar verdichtet beim Scrollen',
    !navBefore.includes('nav-scrolled') && navAfter.includes('nav-scrolled') && pillBefore !== pillAfter,
    `${pillBefore} -> ${pillAfter}`,
  );

  /* Verlaufs-Punkt markiert die aktive Route */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const homeDots = await page.$$eval('.nav-link[data-active="true"]', (els) => els.length);
  check('Startseite markiert keinen Bereichslink', homeDots === 0, `aktive Links: ${homeDots}`);

  // Der Entwicklungsserver übersetzt die Unterseite beim ersten Aufruf neu.
  await page.goto(URL.replace(/\/$/, '') + '/ki', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  });
  await page.waitForTimeout(1600);
  const kiDot = await page.evaluate(() => {
    const el = document.querySelector('.nav-link[data-active="true"]');
    if (!el) return null;
    const after = getComputedStyle(el, '::after');
    return { label: el.textContent.trim(), bg: after.backgroundImage, w: after.width };
  });
  check(
    'Verlaufs-Punkt markiert /ki',
    kiDot && kiDot.label === 'KI' && kiDot.bg.includes('gradient'),
    JSON.stringify(kiDot),
  );

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2200);

  /* Lenis · weiches Scrollen. Ein echtes Mausrad-Ereignis über CDP, während
     ein rAF-Fühler den Verlauf von window.scrollY mitschreibt. */
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    window.__trace = [];
    const stop = Date.now() + 2000;
    const tick = () => {
      window.__trace.push(window.scrollY);
      if (Date.now() < stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(2100);
  const lenisTrace = await page.evaluate(() => window.__trace);
  const distinct = new Set(lenisTrace).size;
  const moved = Math.max(...lenisTrace) - Math.min(...lenisTrace);
  check(
    'Lenis scrollt weich (viele Zwischenwerte)',
    distinct > 8 && moved > 40,
    `Zwischenwerte ${distinct}, Weg ${moved}px`,
  );
  const lenisPresent = await page.evaluate(() =>
    document.documentElement.classList.contains('lenis') ||
    !!document.querySelector('html.lenis, html[class*="lenis"]'),
  );
  check('Lenis ist aktiv (html.lenis)', lenisPresent, String(lenisPresent));

  /* FAQ */
  await page.evaluate(() => document.querySelector('#fragen').scrollIntoView());
  await page.waitForTimeout(900);
  const btn = page.locator('.faq-question').first();
  const panelId = await btn.getAttribute('aria-controls');
  check('FAQ zu (aria-expanded=false)', (await btn.getAttribute('aria-expanded')) === 'false');
  await btn.click();
  await page.waitForTimeout(800);
  const openState = await btn.getAttribute('aria-expanded');
  const openRows = await page.evaluate(
    (id) => getComputedStyle(document.getElementById(id)).gridTemplateRows,
    panelId,
  );
  check(
    'FAQ öffnet (aria-expanded=true, Panel ausgefahren)',
    openState === 'true' && parseFloat(openRows) > 20,
    `rows ${openRows}`,
  );
  await btn.click();
  await page.waitForTimeout(800);
  const closedRows = await page.evaluate(
    (id) => getComputedStyle(document.getElementById(id)).gridTemplateRows,
    panelId,
  );
  check(
    'FAQ schließt wieder',
    (await btn.getAttribute('aria-expanded')) === 'false' && parseFloat(closedRows) < 3,
    `rows ${closedRows}`,
  );

  /* Hero-Konstellation bewegt sich */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForSelector('.hero-field canvas', { timeout: 60000 });
  await page.waitForTimeout(1400);
  const grab = () => page.locator('.hero-field canvas').screenshot();
  const f1 = await grab();
  await page.waitForTimeout(1400);
  const f2 = await grab();
  check('Hero-Konstellation bewegt sich', !f1.equals(f2), `${f1.length} vs ${f2.length} Byte`);

  /* Maus-Parallax */
  await page.mouse.move(100, 700);
  await page.waitForTimeout(900);
  const p1 = await grab();
  await page.mouse.move(1380, 120);
  await page.waitForTimeout(1100);
  const p2 = await grab();
  check('Maus-Parallax reagiert', !p1.equals(p2));

  /* Konstellation pausiert außerhalb des Sichtfelds.
     Gemessen an echten WebGL-Zeichenaufrufen, denn ein Screenshot würde das
     Element wieder ins Sichtfeld holen und die Schleife neu starten. */
  /* Zähler hängt am Kontext DIESES Canvas, sonst zählen die Canvas der
     Nachbarsektionen mit. */
  await page.evaluate(() => {
    window.__draws = 0;
    const canvas = document.querySelector('.hero-field canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    for (const m of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const orig = gl[m];
      if (typeof orig !== 'function') continue;
      gl[m] = function (...args) {
        window.__draws += 1;
        return orig.apply(this, args);
      };
    }
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  await page.evaluate(() => (window.__draws = 0));
  await page.waitForTimeout(1500);
  const drawsVisible = await page.evaluate(() => window.__draws);

  await page.evaluate(() => window.scrollTo(0, 4200));
  await page.waitForTimeout(3000); // Lenis ausrollen und Schleife einschlafen lassen
  const offscreen = await page.evaluate(
    () => document.querySelector('.hero-field').getBoundingClientRect().bottom < -100,
  );
  await page.evaluate(() => (window.__draws = 0));
  await page.waitForTimeout(2000);
  const drawsHidden = await page.evaluate(() => window.__draws);
  check(
    'Konstellation ruht außerhalb des Sichtfelds',
    offscreen && drawsVisible > 30 && drawsHidden === 0,
    `sichtbar ${drawsVisible} Zeichenaufrufe, verdeckt ${drawsHidden}`,
  );

  check('Keine Konsolenfehler (Desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------ 2 · Mobil 390 */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 200)));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2600);

  const burger = page.locator('.nav-burger');
  check('Burger sichtbar unter 1024', await burger.isVisible());
  check('Burger zu (aria-expanded=false)', (await burger.getAttribute('aria-expanded')) === 'false');

  /* Der Entwicklungsserver hydriert je nach Last verzögert. Deshalb wird der
     Klick wiederholt, bis die Schaltfläche wirklich reagiert. */
  const openMenu = async () => {
    for (let i = 0; i < 5; i += 1) {
      await burger.click();
      try {
        await page.waitForSelector('#nav-overlay', { state: 'visible', timeout: 3000 });
        return true;
      } catch {
        await page.waitForTimeout(1200);
      }
    }
    return false;
  };

  const opened = await openMenu();
  await page.waitForTimeout(500);
  check(
    'Menü öffnet über Burger',
    opened && (await burger.getAttribute('aria-expanded')) === 'true',
  );
  const locked = await page.evaluate(() => document.documentElement.style.overflow);
  check('Seitenlauf ruht bei offenem Menü', locked === 'hidden', locked);
  await page.screenshot({ path: shots + '/mobile-menu.png' });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  check(
    'Escape schließt das Menü',
    (await burger.getAttribute('aria-expanded')) === 'false' &&
      (await page.locator('#nav-overlay').count()) === 0,
  );

  const reopened = await openMenu();
  await burger.click();
  await page.waitForTimeout(800);
  check(
    'Burger schließt das Menü wieder',
    reopened && (await burger.getAttribute('aria-expanded')) === 'false',
  );

  await openMenu();
  await page.waitForTimeout(500);
  await page.locator('#nav-overlay a.nav-overlay-link').first().click();
  let navigated = true;
  try {
    // Großzügig, weil der Entwicklungsserver die Unterseite neu übersetzen kann.
    await page.waitForURL(/\/ki$/, { timeout: 60000 });
  } catch {
    navigated = false;
  }
  await page.waitForTimeout(900);
  check(
    'Link-Klick schließt das Menü und wechselt die Seite',
    navigated && (await page.locator('#nav-overlay').count()) === 0,
    page.url(),
  );

  check('Keine Konsolenfehler (Mobil)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------ 3 · reduced motion */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 200)));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);

  const noLenis = await page.evaluate(() => !document.documentElement.classList.contains('lenis'));
  check('reduced-motion · kein Lenis', noLenis);

  /* Steht die Konstellation wirklich still? Gemessen an WebGL-Zeichenaufrufen,
     ein Screenshot-Vergleich wäre wegen preserveDrawingBuffer unzuverlässig. */
  await page.waitForSelector('.hero-field canvas', { timeout: 60000 });
  await page.evaluate(() => {
    window.__draws = 0;
    const canvas = document.querySelector('.hero-field canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    for (const m of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const orig = gl[m];
      if (typeof orig !== 'function') continue;
      gl[m] = function (...args) {
        window.__draws += 1;
        return orig.apply(this, args);
      };
    }
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => (window.__draws = 0));
  await page.waitForTimeout(2200);
  const stillDraws = await page.evaluate(() => window.__draws);
  check('reduced-motion · Konstellation steht still', stillDraws === 0, `${stillDraws} Zeichenaufrufe`);

  /* Das ruhende Bild darf nicht leer sein. */
  await page.screenshot({ path: shots + '/reduced-hero.png' });
  const heroInk = await page.evaluate(async () => {
    const rect = document.querySelector('.hero-field').getBoundingClientRect();
    return { w: Math.round(rect.width), h: Math.round(rect.height) };
  });
  check('reduced-motion · Konstellation hat Fläche', heroInk.w > 200 && heroInk.h > 200, JSON.stringify(heroInk));

  /* Manifest-Kurven sofort vollständig gezeichnet */
  await page.evaluate(() => document.querySelector('#problem').scrollIntoView());
  await page.waitForTimeout(1200);
  const curves = await page.$$eval('#problem [data-curve]', (els) =>
    els.map((el) => ({
      dash: el.style.strokeDasharray || getComputedStyle(el).strokeDasharray,
      off: el.style.strokeDashoffset || getComputedStyle(el).strokeDashoffset,
    })),
  );
  check(
    'reduced-motion · Kurven sofort gezeichnet',
    curves.length === 2 && curves.every((c) => c.off === '0' || c.off === '0px' || c.dash === 'none'),
    JSON.stringify(curves),
  );
  const marks = await page.$$eval('#problem [data-mark]', (els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
  check('reduced-motion · Kurvenlabels sichtbar', marks.every((o) => parseFloat(o) > 0.9), JSON.stringify(marks));

  /* Alles lesbar: kein Element bleibt auf opacity 0 */
  const invisible = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main p, main h1, main h2, main h3, main li, footer a')) {
      const s = getComputedStyle(el);
      if (parseFloat(s.opacity) < 0.05 && el.textContent.trim()) {
        out.push(el.tagName + '.' + String(el.className).slice(0, 40));
      }
    }
    return out.slice(0, 10);
  });
  check('reduced-motion · Seite vollständig lesbar', invisible.length === 0, invisible.join(' | '));

  /* Endlosschleifen */
  const infinite = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.animationIterationCount && s.animationIterationCount.includes('infinite')) {
        out.push(el.tagName + '.' + String(el.className).slice(0, 40));
      }
    }
    return out.slice(0, 10);
  });
  check('reduced-motion · keine Endlosschleifen', infinite.length === 0, infinite.join(' | '));

  await page.evaluate(() => document.querySelector('.final-cta').scrollIntoView());
  await page.waitForTimeout(900);
  await page.screenshot({ path: shots + '/reduced-finalcta.png' });

  check('Keine Konsolenfehler (reduced-motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();

const fails = results.filter((r) => r.state === 'FEHLER');
for (const r of results) {
  console.log(`${r.state === 'OK' ? '[ OK ]' : '[FEHL]'} ${r.name}${r.info ? '  — ' + r.info : ''}`);
}
console.log(`\n${results.length - fails.length}/${results.length} Prüfungen grün.`);
process.exit(fails.length ? 1 : 0);
