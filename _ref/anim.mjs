/**
 * Prueft die Animationen und interaktiven Bausteine der Seite aktiv im Browser.
 *   node _ref/anim.mjs [url]
 * Gibt je Punkt OK / FEHLER samt Messwert aus.
 */
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3100';
const results = [];
const log = (name, ok, info = '') => {
  results.push({ name, ok, info });
  console.log(`${ok ? 'OK  ' : 'FEHL'} | ${name}${info ? ' | ' + info : ''}`);
};

const browser = await chromium.launch();

/* ----------------------------- Desktop 1440 ----------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });

  /* --- Navbar transparent oben, weiss/unscharf nach dem Scrollen --- */
  const navSel = 'header';
  const readNav = () =>
    page.$eval(navSel, (e) => {
      const c = getComputedStyle(e);
      return { bg: c.backgroundColor, blur: c.backdropFilter };
    });
  const navTop = await readNav();
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(700);
  const navScrolled = await readNav();
  log(
    'Navbar: oben transparent, nach Scroll weiss + unscharf',
    /rgba\(0, 0, 0, 0\)|transparent/.test(navTop.bg) &&
      /255, 255, 255/.test(navScrolled.bg) &&
      /blur/.test(navScrolled.blur),
    `oben=${navTop.bg} / gescrollt=${navScrolled.bg} ${navScrolled.blur}`
  );

  /* --- Laufband bewegt sich, pausiert bei Hover --- */
  const track = await page.$('.svh-marquee-track');
  if (track) {
    const docY = await track.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - 400), docY);
    await page.waitForTimeout(500);
  }
  if (!track) {
    log('Laufband vorhanden', false, 'kein [data-marquee-track] gefunden');
  } else {
    const read = () => track.evaluate((e) => e.getBoundingClientRect().x);
    const a = await read();
    await page.waitForTimeout(1000);
    const b = await read();
    log('Laufband bewegt sich', Math.abs(a - b) > 2, `dx=${(b - a).toFixed(1)}px/s`);
    // Kein hover(): Playwright wartet sonst darauf, dass das laufende Band
    // stillsteht. Der Zeiger wird direkt auf die Bandmitte gesetzt.
    const box = await track.boundingBox();
    await page.mouse.move(720, box.y + box.height / 2);
    await page.waitForTimeout(400);
    const c = await read();
    await page.waitForTimeout(900);
    const d = await read();
    log('Laufband pausiert bei Hover', Math.abs(c - d) < 1.5, `dx=${(d - c).toFixed(1)}px`);
    await page.mouse.move(720, 860);
  }

  /* --- Hero-Chips schweben --- */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const chip = await page.$('.svh-hero-chips span');
  if (!chip) log('Hero-Chips schweben', false, 'keine Chips gefunden');
  else {
    const y = () => chip.evaluate((e) => e.getBoundingClientRect().y);
    const p1 = await y();
    await page.waitForTimeout(1300);
    const p2 = await y();
    log('Hero-Chips schweben', Math.abs(p1 - p2) > 0.5, `dy=${(p2 - p1).toFixed(2)}px`);
  }

  /* --- Wort-fuer-Wort-Einfaerbung im Intro --- */
  const introSel = '[data-intro-word]';
  const hasIntro = await page.$(introSel);
  if (!hasIntro) log('Intro: Wort-fuer-Wort-Einfaerbung', false, 'kein [data-intro-word]');
  else {
    const colors = async () =>
      page.$$eval(introSel, (els) => els.map((e) => getComputedStyle(e).color).join('|'));
    const sec = await page.$eval(introSel, (e) => {
      const s = e.closest('section');
      return s.getBoundingClientRect().top + window.scrollY;
    });
    await page.evaluate((y) => window.scrollTo(0, y - 700), sec);
    await page.waitForTimeout(600);
    const c1 = await colors();
    await page.evaluate((y) => window.scrollTo(0, y - 100), sec);
    await page.waitForTimeout(700);
    const c2 = await colors();
    log('Intro: Wort-fuer-Wort-Einfaerbung reagiert auf Scroll', c1 !== c2);
  }

  /* --- Zaehler in der Impact-Sektion --- */
  const numSel = '[data-impact-num]';
  const numY = await page.$eval(numSel, (e) => e.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - 1200), numY);
  await page.waitForTimeout(500);
  await page.evaluate((y) => window.scrollTo(0, y - 500), numY);
  const n1 = await page.$eval(numSel, (e) => e.textContent.trim());
  await page.waitForTimeout(2200);
  const n2 = await page.$eval(numSel, (e) => e.textContent.trim());
  log('Impact-Zaehler zaehlt hoch', n1 !== n2 && n2 === '65', `"${n1}" -> "${n2}"`);

  /* --- Leistungs-Mockups bewegen sich --- */
  const mock = await page.$$('[data-mockup]');
  if (mock.length < 3) log('Drei Leistungs-Mockups animiert', false, `${mock.length} gefunden`);
  else {
    for (let i = 0; i < 3; i++) {
      const y = await mock[i].evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
      await page.evaluate((v) => window.scrollTo(0, v - 400), y);
      await page.waitForTimeout(700);
      const snap = () => mock[i].evaluate((e) => e.innerHTML.length + '|' + [...e.querySelectorAll('*')].map((k) => Math.round(k.getBoundingClientRect().x * 10) + ',' + Math.round(k.getBoundingClientRect().y * 10) + ',' + getComputedStyle(k).opacity).join(''));
      // Das Browser-Mockup wechselt nur alle 3s — das Fenster muss laenger sein.
      const s1 = await snap();
      let moved = false;
      for (let t = 0; t < 8 && !moved; t++) {
        await page.waitForTimeout(500);
        moved = (await snap()) !== s1;
      }
      log(`Mockup ${i + 1} bewegt sich`, moved);
    }
  }

  /* --- ROI-Rechner --- */
  const sliders = await page.$$('input[type=range]');
  if (sliders.length < 3) log('ROI-Rechner: 3 Slider', false, `${sliders.length} gefunden`);
  else {
    const y = await sliders[0].evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((v) => window.scrollTo(0, v - 300), y);
    await page.waitForTimeout(400);
    const setAll = async (a, b, c) => {
      for (const [s, v] of [[sliders[0], a], [sliders[1], b], [sliders[2], c]]) {
        await s.evaluate((el, val) => {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(el, String(val));
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }, v);
      }
      // Die Ergebniszahlen laufen weich hoch — erst nach dem Auslaufen ablesen.
      await page.waitForTimeout(1800);
      return page.$eval('#rechner [aria-live="polite"]', (e) =>
        e.textContent.replace(/\s+/g, ' ').trim()
      );
    };
    const outA = await setAll(10, 10, 50);
    const outB = await setAll(20, 10, 50);
    const hours = 10 * 10 * 4.33;
    const cost = hours * 50;
    const okA =
      outA.includes(Math.round(hours).toLocaleString('de-DE')) &&
      outA.includes(Math.round(cost).toLocaleString('de-DE')) &&
      outA.includes(Math.round(cost * 0.8).toLocaleString('de-DE'));
    log('ROI-Rechner rechnet (Team x Std x 4,33; Kosten; 80 %)', okA, outA);
    log('ROI-Rechner reagiert auf Slider', outA !== outB);
  }

  /* --- FAQ-Accordion --- */
  const faq = await page.$('#faq button[aria-expanded]');
  if (!faq) log('FAQ-Accordion', false, 'kein button[aria-expanded]');
  else {
    const y = await faq.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((v) => window.scrollTo(0, v - 300), y);
    await page.waitForTimeout(300);
    const e0 = await faq.getAttribute('aria-expanded');
    await faq.click();
    await page.waitForTimeout(600);
    const e1 = await faq.getAttribute('aria-expanded');
    await faq.click();
    await page.waitForTimeout(600);
    const e2 = await faq.getAttribute('aria-expanded');
    log('FAQ-Accordion oeffnet und schliesst, aria-expanded wechselt', e0 === 'false' && e1 === 'true' && e2 === 'false', `${e0} -> ${e1} -> ${e2}`);
  }

  /* --- Testimonial-Pfeile bei nur einem Eintrag deaktiviert --- */
  const arrows = await page.$$('#referenzen button[aria-disabled]');
  if (!arrows.length) log('Testimonial-Pfeile deaktiviert', false, 'keine Pfeil-Buttons gefunden');
  else {
    const dis = await Promise.all(arrows.map((a) => a.evaluate((e) => e.disabled === true)));
    log('Testimonial-Pfeile bei einem Eintrag deaktiviert', dis.every(Boolean), `${dis.length} Pfeile`);
  }

  /* --- Newsletter- und Footer-Formular ohne Reload --- */
  for (const [label, sel] of [
    ['Newsletter-Formular', '#newsletter form'],
    ['Footer-Formular', 'footer form'],
  ]) {
    const form = await page.$(sel);
    if (!form) { log(label + ': Bestaetigung ohne Reload', false, `${sel} fehlt`); continue; }
    const y = await form.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((v) => window.scrollTo(0, v - 300), y);
    await page.waitForTimeout(300);
    await page.evaluate(() => { window.__stay = true; });
    await form.$eval('input[type=email]', (e) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(e, 'test@example.com');
      e.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await (await form.$('button[type=submit], button')).click();
    await page.waitForTimeout(700);
    const stayed = await page.evaluate(() => window.__stay === true);
    const msg = await form.evaluate((e) =>
      (e.closest('section') || e.closest('footer') || e.parentElement).textContent.includes('Danke')
    );
    log(label + ': Bestaetigung ohne Reload', stayed && msg, `kein Reload=${stayed}, Meldung=${msg}`);
  }

  log('Keine Konsolenfehler (Desktop)', errors.length === 0, errors.slice(0, 3).join(' // '));
  await ctx.close();
}

/* ------------------------------ Mobile 390 ------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const burger = await page.$('[data-menu-toggle]');
  if (!burger) log('Mobile-Menue', false, 'kein [data-menu-toggle]');
  else {
    await burger.click();
    await page.waitForTimeout(500);
    const open = await page.$eval('body', (b) => getComputedStyle(b).overflow);
    const visible = await page.isVisible('#mobile-menu');
    log('Mobile-Menue oeffnet und sperrt den Seiten-Scroll', visible && open === 'hidden', `sichtbar=${visible}, body.overflow=${open}`);
    // Der Burger ist im offenen Zustand das x — erkennbar an [data-menu-close].
    const isX = (await page.$('[data-menu-close]')) !== null;
    await page.click('[data-menu-toggle]');
    await page.waitForTimeout(900);
    const afterX = await page.isVisible('#mobile-menu');
    log('Mobile-Menue schliesst ueber x', isX && !afterX, `Burger zeigt x=${isX}`);
    await page.click('[data-menu-toggle]');
    await page.waitForTimeout(600);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(900);
    const afterEsc = await page.isVisible('#mobile-menu');
    const restored = await page.$eval('body', (b) => getComputedStyle(b).overflow);
    log('Mobile-Menue schliesst ueber Escape und gibt den Scroll frei', !afterEsc && restored !== 'hidden', `body.overflow=${restored}`);
  }
  await ctx.close();
}

/* ------------------------- reduzierte Bewegung -------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  // Erst die einmaligen Einblend-Animationen auslaufen lassen.
  await page.waitForTimeout(2500);
  const snap = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.svh-hero-chips span, [data-marquee-track], [data-mockup] *')]
        .map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.x) + ',' + Math.round(r.y); })
        .join('|')
    );
  const s1 = await snap();
  await page.waitForTimeout(1800);
  const s2 = await snap();
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length);
  const readable = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return !!h1 && getComputedStyle(h1).opacity === '1' && h1.getBoundingClientRect().height > 20;
  });
  log('Reduzierte Bewegung: keine Endlos-Animationen', s1 === s2 && running === 0, `Endlos-Animationen=${running}`);
  log('Reduzierte Bewegung: Seite bleibt lesbar', readable);
  await ctx.close();
}

await browser.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} ok`);
if (bad.length) console.log('OFFEN: ' + bad.map((b) => b.name).join('; '));
