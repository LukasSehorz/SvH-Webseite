/**
 * Aktive Animations-/Interaktionsprüfung mit Playwright.
 *
 *   node _ref/anim-check.mjs [url]
 *
 * Gibt eine Liste  PASS / FAIL  je geprüfter Animation aus.
 */
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3100';
const results = [];
const ok = (name, pass, info = '') => results.push({ name, pass, info });

const browser = await chromium.launch();

/* ------------------------------------------------------------------ */
/*  1) Desktop-Durchlauf                                               */
/* ------------------------------------------------------------------ */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)));
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + String(e).slice(0, 200)));

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

/* --- Navbar: transparent oben, weiß/unscharf beim Scrollen --------- */
{
  const header = page.locator('header').first();
  const top = await header.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('[data-navbar-bar]') || el);
    return { bg: cs.backgroundColor, blur: cs.backdropFilter, shadow: cs.boxShadow };
  });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(700);
  const scrolled = await header.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('[data-navbar-bar]') || el);
    return { bg: cs.backgroundColor, blur: cs.backdropFilter, shadow: cs.boxShadow };
  });
  const alpha = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return 0;
    const p = m[1].split(',').map((s) => parseFloat(s));
    return p.length > 3 ? p[3] : 1;
  };
  const pass = alpha(top.bg) < 0.15 && alpha(scrolled.bg) > 0.5 && /blur/.test(scrolled.blur);
  ok('Navbar wird beim Scrollen weiß/unscharf', pass, `oben=${top.bg} / blur=${top.blur} · gescrollt=${scrolled.bg} / blur=${scrolled.blur}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

/* --- Laufband bewegt sich, pausiert bei Hover ---------------------- */
{
  const row = page.locator('[data-marquee-row]').first();
  const exists = (await row.count()) > 0;
  if (!exists) {
    ok('Laufband bewegt sich', false, 'kein [data-marquee-row] gefunden');
  } else {
    const read = () => row.evaluate((el) => el.getBoundingClientRect().left);
    const a = await read();
    await page.waitForTimeout(1000);
    const b = await read();
    ok('Laufband bewegt sich', Math.abs(a - b) > 2, `Δ=${(b - a).toFixed(1)}px`);

    // Hover per Mauskoordinate (das Element bewegt sich, .hover() würde warten)
    await page.locator('.svh-marquee-wrap').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const box = await page.locator('.svh-marquee-wrap').first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(600);
    const c = await read();
    await page.waitForTimeout(900);
    const d = await read();
    ok('Laufband pausiert bei Hover', Math.abs(c - d) < 1.5, `Δ=${(d - c).toFixed(2)}px`);
    await page.mouse.move(0, 0);
  }
}

/* --- Hero-Chips schweben ------------------------------------------- */
{
  const chip = page.locator('.svh-hero-chips span').first();
  if ((await chip.count()) === 0) {
    ok('Hero-Chips schweben', false, 'keine Chips gefunden');
  } else {
    const read = () => chip.evaluate((el) => el.getBoundingClientRect().top);
    const vals = [];
    for (let i = 0; i < 8; i++) {
      vals.push(await read());
      await page.waitForTimeout(320);
    }
    const spread = Math.max(...vals) - Math.min(...vals);
    ok('Hero-Chips schweben', spread > 1.5, `Streuung=${spread.toFixed(2)}px`);
  }
}

/* --- Wort-für-Wort-Einfärbung im Intro-Statement -------------------- */
{
  const words = page.locator('[data-intro-word]');
  const n = await words.count();
  if (n === 0) {
    ok('Intro-Statement färbt Wort für Wort ein', false, 'keine [data-intro-word] gefunden');
  } else {
    const sample = words.nth(Math.floor(n * 0.7));
    const target = await page.locator('[data-intro-statement]').first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - 700), target);
    await page.waitForTimeout(700);
    const before = await sample.evaluate((el) => getComputedStyle(el).color);
    await page.evaluate((y) => window.scrollTo(0, y - 120), target);
    await page.waitForTimeout(700);
    const after = await sample.evaluate((el) => getComputedStyle(el).color);
    ok('Intro-Statement färbt Wort für Wort ein', before !== after, `${before} → ${after}`);
  }
}

/* --- Zähler in der Impact-Sektion ---------------------------------- */
{
  const target = await page.locator('#impact-title').first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - 200), target);
  await page.waitForTimeout(120);
  const first = await page.locator('[data-impact-num]').first().innerText().catch(() => '');
  await page.waitForTimeout(2200);
  const later = await page.locator('[data-impact-num]').first().innerText().catch(() => '');
  ok('Impact-Zähler zählen hoch', first !== later && later.trim() !== '', `"${first}" → "${later}"`);
}

/* --- FAQ-Accordion -------------------------------------------------- */
{
  const btn = page.locator('#faq button[aria-expanded]').first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const a = await btn.getAttribute('aria-expanded');
  await btn.click();
  await page.waitForTimeout(600);
  const b = await btn.getAttribute('aria-expanded');
  await btn.click();
  await page.waitForTimeout(600);
  const c = await btn.getAttribute('aria-expanded');
  ok('FAQ-Accordion öffnet und schließt (aria-expanded)', a === 'false' && b === 'true' && c === 'false', `${a} → ${b} → ${c}`);
}

/* --- ROI-Rechner ---------------------------------------------------- */
{
  const sliders = page.locator('#rechner input[type="range"]');
  const count = await sliders.count();
  if (count < 3) {
    ok('ROI-Rechner: Slider ändern die Zahlen', false, `nur ${count} Slider gefunden`);
  } else {
    await sliders.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const out = page.locator('#rechner [data-roi-result]');
    const before = await out.innerText();
    // Werte setzen: Team 10, Stunden 10, Satz 50
    const set = async (i, v) => {
      await sliders.nth(i).evaluate((el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, String(val));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, v);
    };
    await set(0, 10);
    await set(1, 10);
    await set(2, 50);
    await page.waitForTimeout(1200);
    const after = await out.innerText();
    // Erwartung: 10 × 10 × 4,33 = 433 Std/Monat; 433 × 50 = 21.650 €; 80 % = 17.320 €
    const hasHours = /433/.test(after.replace(/\s/g, ''));
    const hasCost = /21\.650/.test(after);
    const hasSave = /17\.320/.test(after);
    ok('ROI-Rechner rechnet plausibel (Team×Std×4,33 · ×Satz · 80 %)', hasHours && hasCost && hasSave, after.replace(/\s+/g, ' ').slice(0, 220));
    ok('ROI-Rechner: Slider verändern die Ausgabe', before !== after);
  }
}

/* --- Testimonial-Pfeile bei nur einem Eintrag deaktiviert ----------- */
{
  const arrows = page.locator('[data-testimonial-arrow]');
  const n = await arrows.count();
  if (n === 0) {
    ok('Testimonial-Pfeile deaktiviert (nur 1 Eintrag)', false, 'keine [data-testimonial-arrow] gefunden');
  } else {
    const disabled = await arrows.evaluateAll((els) => els.every((e) => e.disabled === true));
    ok('Testimonial-Pfeile deaktiviert (nur 1 Eintrag)', disabled, `${n} Pfeile`);
  }
}

/* --- Newsletter- und Footer-Formular ohne Reload -------------------- */
{
  for (const [name, sel] of [
    ['Newsletter-Formular', '#newsletter form'],
    ['Footer-Formular', 'footer form'],
  ]) {
    const form = page.locator(sel).first();
    if ((await form.count()) === 0) {
      ok(`${name} zeigt Bestätigung ohne Reload`, false, `${sel} nicht gefunden`);
      continue;
    }
    await form.scrollIntoViewIfNeeded();
    await page.evaluate(() => { window.__noReload = true; });
    await form.locator('input[type="email"]').fill('test@example.de');
    await form.locator('button[type="submit"], button').first().click();
    await page.waitForTimeout(700);
    const stillThere = await page.evaluate(() => window.__noReload === true);
    const text = await page.locator(sel).first().evaluate((el) => el.parentElement?.innerText || '');
    ok(`${name} zeigt Bestätigung ohne Reload`, stillThere && /danke|Danke|bestätig|Eintrag|angemeldet|E-Mail/i.test(text), text.replace(/\s+/g, ' ').slice(0, 120));
  }
}

ok('Keine Konsolenfehler (Desktop)', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 300));

await ctx.close();

/* ------------------------------------------------------------------ */
/*  2) Mobile-Menü                                                     */
/* ------------------------------------------------------------------ */
{
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const m = await mctx.newPage();
  await m.goto(url, { waitUntil: 'domcontentloaded' });
  await m.waitForTimeout(2000);

  const burger = m.locator('[data-menu-toggle]').first();
  if ((await burger.count()) === 0) {
    ok('Mobile-Menü öffnet über den Burger', false, 'kein [data-menu-toggle]');
  } else {
    await burger.click();
    await m.waitForTimeout(600);
    const open = await m.locator('#mobile-menu').isVisible().catch(() => false);
    const locked = await m.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
    ok('Mobile-Menü öffnet über den Burger', open);
    ok('Mobile-Menü sperrt den Seiten-Scroll', locked, `body.overflow=${await m.evaluate(() => getComputedStyle(document.body).overflow)}`);

    const closeBtn = m.locator('[data-menu-close]').first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
    } else {
      await burger.click();
    }
    await m.waitForTimeout(600);
    const closed = !(await m.locator('#mobile-menu').isVisible().catch(() => false));
    ok('Mobile-Menü schließt über ×', closed);

    await burger.click();
    await m.waitForTimeout(500);
    await m.keyboard.press('Escape');
    await m.waitForTimeout(600);
    const escClosed = !(await m.locator('#mobile-menu').isVisible().catch(() => false));
    const unlocked = await m.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
    ok('Mobile-Menü schließt über Escape', escClosed);
    ok('Seiten-Scroll wird wieder freigegeben', unlocked);
  }
  await mctx.close();
}

/* ------------------------------------------------------------------ */
/*  3) prefers-reduced-motion: reduce                                  */
/* ------------------------------------------------------------------ */
{
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const r = await rctx.newPage();
  const rErrors = [];
  r.on('pageerror', (e) => rErrors.push(String(e).slice(0, 200)));
  await r.goto(url, { waitUntil: 'domcontentloaded' });
  await r.waitForTimeout(2500);

  // Laufband darf sich nicht mehr endlos bewegen
  const row = r.locator('[data-marquee-row]').first();
  let marqueeStill = true;
  if ((await row.count()) > 0) {
    const a = await row.evaluate((el) => el.getBoundingClientRect().left);
    await r.waitForTimeout(1200);
    const b = await row.evaluate((el) => el.getBoundingClientRect().left);
    marqueeStill = Math.abs(a - b) < 1.5;
  }

  // Chips dürfen nicht mehr schweben
  const chip = r.locator('.svh-hero-chips span').first();
  let chipStill = true;
  if ((await chip.count()) > 0) {
    const vals = [];
    for (let i = 0; i < 5; i++) {
      vals.push(await chip.evaluate((el) => el.getBoundingClientRect().top));
      await r.waitForTimeout(350);
    }
    chipStill = Math.max(...vals) - Math.min(...vals) < 1.5;
  }

  // Seite muss vollständig lesbar sein (keine Elemente auf opacity 0 hängen)
  await r.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 60));
    }
    window.scrollTo(0, 0);
  });
  await r.waitForTimeout(1200);
  const invisible = await r.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main li, footer p, footer a')) {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.35 && el.getBoundingClientRect().height > 0) {
        bad.push(el.tagName + ':' + (el.textContent || '').slice(0, 30));
      }
    }
    return bad.slice(0, 6);
  });

  ok('reduced-motion: Laufband steht still', marqueeStill);
  ok('reduced-motion: Hero-Chips schweben nicht', chipStill);
  ok('reduced-motion: Seite vollständig lesbar', invisible.length === 0, invisible.join(' | '));
  ok('reduced-motion: keine Laufzeitfehler', rErrors.length === 0, rErrors.join(' | '));
  await rctx.close();
}

await browser.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? `   [${r.info}]` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} bestanden`);
