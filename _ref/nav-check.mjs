/**
 * Navigationsprüfung über alle Seiten.
 *   node _ref/nav-check.mjs [basis-url]
 *
 * Prüft:
 *  1. Jeder Link im Aufklappmenü und im Footer liefert 200 und zeigt genau ein <h1>.
 *  2. Kein Link zeigt auf einen Anker, den es auf der Zielseite nicht gibt.
 *  3. Aufklappmenü: Maus, Tastatur (ArrowDown), Escape, Klick daneben.
 *  4. Mobiles Menü: öffnen, Untermenü aufklappen, Unterpunkt schließt und navigiert.
 *  5. Logo führt auf /.
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3100';
const browser = await chromium.launch();
const ok = [];
const bad = [];
const note = (list, msg) => list.push(msg);

/* ---------------------------------------------------------------- 1 + 2 --- */

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);

// Alle Ziele einsammeln: Kopfnavigation (inkl. Aufklappmenüs) + Footer
const targets = new Set();
const menuButtons = await page.$$('header nav[aria-label="Hauptnavigation"] button[aria-haspopup="true"]');
for (const b of menuButtons) {
  await b.click();
  await page.waitForTimeout(320);
  const hrefs = await page.$$eval('header a[href]', (as) => as.map((a) => a.getAttribute('href')));
  hrefs.forEach((h) => targets.add(h));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}
const footerHrefs = await page.$$eval('footer a[href]', (as) => as.map((a) => a.getAttribute('href')));
footerHrefs.forEach((h) => targets.add(h));

const internal = [...targets].filter((h) => h && h.startsWith('/'));
note(ok, `Ziele gesammelt: ${internal.length} interne Links (Kopf + Fuß)`);

for (const href of internal.sort()) {
  const [path, hash] = href.split('#');
  const url = base + (path || '/');
  const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const status = res.status();
  const h1 = await page.$$eval('h1', (els) => els.map((e) => e.textContent.trim().slice(0, 60)));
  if (status !== 200) note(bad, `${href}: Status ${status}`);
  else if (h1.length !== 1) note(bad, `${href}: ${h1.length} <h1> gefunden (${h1.join(' | ')})`);
  else note(ok, `${href}: 200, h1 "${h1[0]}"`);

  if (hash) {
    const found = await page.$('#' + CSS.escape ? `#${hash}` : `#${hash}`);
    if (!found) note(bad, `${href}: Anker #${hash} existiert auf der Zielseite nicht`);
    else note(ok, `${href}: Anker #${hash} vorhanden`);
  }
}

// Tote Anker auf allen Seiten: Links wie "#kontakt" ohne Pfad
const allPaths = internal.map((h) => h.split('#')[0] || '/').filter((v, i, a) => a.indexOf(v) === i);
for (const p of allPaths) {
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h.length > 1 && !document.querySelector(h))
  );
  if (dead.length) note(bad, `${p}: tote Anker ${[...new Set(dead)].join(', ')}`);
}

/* -------------------------------------------------------------------- 3 --- */

await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
const btn = await page.$('header nav[aria-label="Hauptnavigation"] button[aria-haspopup="true"]');

// Maus (hover)
await btn.hover();
await page.waitForTimeout(350);
(await btn.getAttribute('aria-expanded')) === 'true'
  ? note(ok, 'Aufklappmenü öffnet per Maus')
  : note(bad, 'Aufklappmenü öffnet NICHT per Maus');
await page.mouse.move(10, 400);
await page.waitForTimeout(400);

// Tastatur ArrowDown
await btn.focus();
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(350);
(await btn.getAttribute('aria-expanded')) === 'true'
  ? note(ok, 'Aufklappmenü öffnet per ArrowDown')
  : note(bad, 'Aufklappmenü öffnet NICHT per ArrowDown');

// Escape
await page.keyboard.press('Escape');
await page.waitForTimeout(350);
(await btn.getAttribute('aria-expanded')) === 'false'
  ? note(ok, 'Aufklappmenü schließt per Escape')
  : note(bad, 'Aufklappmenü schließt NICHT per Escape');

// Klick daneben
await btn.click();
await page.waitForTimeout(300);
await page.mouse.click(30, 500);
await page.waitForTimeout(350);
(await btn.getAttribute('aria-expanded')) === 'false'
  ? note(ok, 'Aufklappmenü schließt per Klick daneben')
  : note(bad, 'Aufklappmenü schließt NICHT per Klick daneben');

// Logo
const logoHref = await page.getAttribute('header a[aria-label*="Startseite"]', 'href');
logoHref === '/' ? note(ok, 'Logo verweist auf /') : note(bad, `Logo verweist auf ${logoHref}`);

await page.close();

/* -------------------------------------------------------------------- 4 --- */

const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(base + '/', { waitUntil: 'domcontentloaded' });
await m.waitForTimeout(800);

await m.click('button[data-menu-toggle]');
await m.waitForTimeout(600);
(await m.$('#mobile-menu'))
  ? note(ok, 'Mobiles Menü öffnet')
  : note(bad, 'Mobiles Menü öffnet NICHT');

const subToggle = await m.$('#mobile-menu button[aria-expanded]');
await subToggle.click();
await m.waitForTimeout(500);
(await subToggle.getAttribute('aria-expanded')) === 'true'
  ? note(ok, 'Mobiles Untermenü klappt auf')
  : note(bad, 'Mobiles Untermenü klappt NICHT auf');

const subLink = await m.$('#mobile-menu a[href^="/leistungen/"]');
const subHref = await subLink.getAttribute('href');
await subLink.click();
await m.waitForTimeout(1200);
const nowPath = new URL(m.url()).pathname;
nowPath === subHref
  ? note(ok, `Mobiler Unterpunkt navigiert nach ${nowPath}`)
  : note(bad, `Mobiler Unterpunkt: erwartet ${subHref}, ist ${nowPath}`);
(await m.$('#mobile-menu'))
  ? note(bad, 'Mobiles Menü bleibt nach Klick offen')
  : note(ok, 'Mobiles Menü schließt nach Klick');

// Escape schließt
await m.waitForTimeout(1200); // Hydration der neuen Seite abwarten
await m.click('button[data-menu-toggle]');
await m.waitForTimeout(900);
await m.keyboard.press('Escape');
await m.waitForTimeout(1000);
(await m.$('#mobile-menu'))
  ? note(bad, 'Mobiles Menü schließt NICHT per Escape')
  : note(ok, 'Mobiles Menü schließt per Escape');

await m.close();
await browser.close();

console.log('--- OK ---');
ok.forEach((l) => console.log('  ' + l));
console.log('--- FEHLER ---');
bad.length ? bad.forEach((l) => console.log('  ' + l)) : console.log('  keine');
process.exit(bad.length ? 1 : 0);
