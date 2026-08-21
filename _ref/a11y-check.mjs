/**
 * Stichprobenartige Zugänglichkeits- und Markenprüfung über alle Seiten.
 *   node _ref/a11y-check.mjs [basis-url]
 *
 *  - genau ein <h1> je Seite
 *  - Überschriftenhierarchie ohne Sprünge
 *  - jedes <img> hat alt, jedes Formularfeld ein <label> (oder aria-label)
 *  - sichtbarer Fokusring auf Links/Buttons
 *  - Kontrast des grauen Fließtextes auf hellem Grund ≥ 4.5:1
 *  - „APEX" taucht nirgends im gerenderten HTML auf
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3100';
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

const bad = [];
const info = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  const r = await page.evaluate(() => {
    const res = { h1: 0, headingJumps: [], imgNoAlt: [], fieldsNoLabel: [], lowContrast: [] };

    res.h1 = document.querySelectorAll('h1').length;

    // Überschriftenhierarchie
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(
      (h) => h.offsetParent !== null || h.className.includes('sr-only')
    );
    let prev = 0;
    for (const h of hs) {
      const lvl = +h.tagName[1];
      if (prev && lvl > prev + 1) res.headingJumps.push(`h${prev}→h${lvl}: ${h.textContent.trim().slice(0, 40)}`);
      prev = lvl;
    }

    // Bilder
    for (const img of document.querySelectorAll('img')) {
      if (img.getAttribute('alt') === null) res.imgNoAlt.push(img.getAttribute('src') || '(ohne src)');
    }

    // Formularfelder
    for (const f of document.querySelectorAll('input, textarea, select')) {
      if (f.type === 'hidden') continue;
      const byId = f.id && document.querySelector(`label[for="${CSS.escape(f.id)}"]`);
      const wrapped = f.closest('label');
      const aria = f.getAttribute('aria-label') || f.getAttribute('aria-labelledby');
      if (!byId && !wrapped && !aria) res.fieldsNoLabel.push(f.name || f.id || f.tagName);
    }

    // Kontrast: alle sichtbaren Textknoten mit grauer Schrift
    const lum = (c) => {
      const f = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
    };
    const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
    // Liefert die Hintergrundfarbe — oder null, wenn ein Verlauf/Bild im Spiel
    // ist und sich der Wert nicht zuverlässig bestimmen lässt.
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
        const c = cs.backgroundColor;
        const a = (c.match(/[\d.]+/g) || [])[3];
        if (c && c !== 'rgba(0, 0, 0, 0)' && (a === undefined || +a > 0.9)) return rgb(c);
        n = n.parentElement;
      }
      return [255, 255, 255];
    };
    const seen = new Set();
    for (const el of document.querySelectorAll('p, span, li, a, dd, dt, td, th, label, figcaption')) {
      if (!el.textContent.trim()) continue;
      if ([...el.children].some((c) => c.textContent.trim())) continue; // nur Blattknoten
      // Mockups sind dekorativ (role="img" mit aria-label) — kein Fließtext.
      if (el.closest('[role="img"]')) continue;
      const r0 = el.getBoundingClientRect();
      if (r0.width < 2 || r0.height < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity < 0.5) continue;
      const fg = rgb(cs.color);
      const bg = bgOf(el);
      if (!bg) continue; // Verlauf/Bild — nicht rechnerisch prüfbar
      const l1 = lum(fg), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = +cs.fontWeight >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if (ratio < need) {
        const key = cs.color + '|' + bg.join(',') + '|' + px;
        if (seen.has(key)) continue;
        seen.add(key);
        res.lowContrast.push(
          `${ratio.toFixed(2)}:1 (nötig ${need}) ${cs.color} auf rgb(${bg}) ${px}px — „${el.textContent.trim().slice(0, 40)}"`
        );
      }
    }
    return res;
  });

  if (r.h1 !== 1) bad.push(`${p}: ${r.h1} <h1>`);
  if (r.headingJumps.length) bad.push(`${p}: Überschriftensprünge — ${r.headingJumps.join(' ; ')}`);
  if (r.imgNoAlt.length) bad.push(`${p}: <img> ohne alt — ${r.imgNoAlt.join(', ')}`);
  if (r.fieldsNoLabel.length) bad.push(`${p}: Feld ohne Label — ${r.fieldsNoLabel.join(', ')}`);
  if (r.lowContrast.length) bad.push(`${p}: Kontrast\n     ${r.lowContrast.join('\n     ')}`);

  // Marke
  const html = await page.content();
  if (/apex/i.test(html)) bad.push(`${p}: „APEX" im Ausgabe-HTML gefunden`);

  // Fokusring: erstes Nav-Element und erster Button
  const focus = await page.evaluate(() => {
    const el = document.querySelector('header a, header button');
    el.focus();
    const cs = getComputedStyle(el);
    return { outline: cs.outlineWidth + ' ' + cs.outlineStyle, shadow: cs.boxShadow };
  });
  const hasRing =
    (parseFloat(focus.outline) > 0 && !/none/.test(focus.outline)) || /rgb/.test(focus.shadow);
  if (!hasRing) bad.push(`${p}: kein sichtbarer Fokusring (${focus.outline} / ${focus.shadow})`);

  info.push(`${p}: h1=${r.h1}, Bilder ohne alt=${r.imgNoAlt.length}, Felder ohne Label=${r.fieldsNoLabel.length}, Kontrastmängel=${r.lowContrast.length}`);
}

await browser.close();
console.log('--- Übersicht ---');
info.forEach((l) => console.log('  ' + l));
console.log('--- FEHLER ---');
bad.length ? bad.forEach((l) => console.log('  ' + l)) : console.log('  keine');
process.exit(bad.length ? 1 : 0);
