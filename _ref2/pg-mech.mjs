/**
 * Mechanische Pruefung aller Routen bei drei Breiten.
 * Ueberlauf, Konsolenfehler, fehlgeschlagene Anfragen, Seitenlaenge,
 * interne Verweise, Ankerziele.
 *
 *   node _ref2/pg-mech.mjs
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
fs.mkdirSync(ZIEL, { recursive: true });
const BASIS = 'http://localhost:3210';

const ROUTEN = ['/', '/ki', '/marketing', '/marketing/webseiten', '/marketing/social-media',
  '/marketing/werbetafeln', '/ueber-uns', '/kontakt', '/impressum'];
const BREITEN = [1440, 2560, 390];
const HOEHEN = { 1440: 900, 2560: 1440, 390: 844 };

const erg = {};
const sichern = () => fs.writeFileSync(`${ZIEL}/mech.json`, JSON.stringify(erg, null, 1));

const { browser, aufraeumen } = await starten();

for (const breite of BREITEN) {
  const hoehe = HOEHEN[breite];
  for (const route of ROUTEN) {
    const schl = `${breite}${route.replace(/\//g, '_')}`;
    const seite = await browser.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1 });
    const fehler = [];
    const netz = [];
    seite.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 200)); });
    seite.on('pageerror', (e) => fehler.push('PAGEERROR ' + String(e).slice(0, 200)));
    seite.on('requestfailed', (r) => netz.push('FAILED ' + r.url().slice(0, 160) + ' ' + (r.failure()?.errorText || '')));
    seite.on('response', (r) => { if (r.status() >= 400) netz.push(r.status() + ' ' + r.url().slice(0, 160)); });

    try {
      await seite.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await seite.waitForTimeout(2500);

      // Langsamer Durchlauf, damit Eintritte ausgeloest werden.
      const gesamt = await seite.evaluate(() => document.scrollingElement.scrollHeight);
      const schritt = Math.round(hoehe * 0.6);
      for (let y = 0; y < gesamt; y += schritt) {
        await seite.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
        await seite.waitForTimeout(280);
      }
      await seite.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight; });
      await seite.waitForTimeout(1500);
      await seite.evaluate(() => { document.scrollingElement.scrollTop = 0; });
      await seite.waitForTimeout(1200);

      const m = await seite.evaluate(() => {
        const de = document.documentElement;
        const se = document.scrollingElement;
        // Welche Elemente ragen ueber die Fensterbreite hinaus?
        const breit = [];
        if (de.scrollWidth > de.clientWidth) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > de.clientWidth + 1 || r.left < -1) {
              breit.push({
                tag: el.tagName.toLowerCase(),
                cls: String(el.className).slice(0, 70),
                links: Math.round(r.left), rechts: Math.round(r.right), b: Math.round(r.width),
              });
            }
          }
        }
        const links = [...document.querySelectorAll('a[href]')].map((a) => ({
          href: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 40),
        }));
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
        // Unsichtbare Elemente mit Text: haengende Einblendung
        const unsichtbar = [];
        for (const el of document.querySelectorAll('h1,h2,h3,p,li,button,a,section,article')) {
          const t = (el.textContent || '').trim();
          if (t.length < 8) continue;
          const cs = getComputedStyle(el);
          const op = parseFloat(cs.opacity);
          const r = el.getBoundingClientRect();
          if (op < 0.06 && r.height > 0) unsichtbar.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 50), op, t: t.slice(0, 50) });
        }
        return {
          scrollW: de.scrollWidth, clientW: de.clientWidth, innerW: window.innerWidth,
          bodyScrollW: document.body.scrollWidth,
          docH: se.scrollHeight, breit: breit.slice(0, 25),
          links, ids, unsichtbar: unsichtbar.slice(0, 25),
          titel: document.title,
          h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 80)),
        };
      });

      erg[schl] = {
        ueberlauf: m.scrollW - m.clientW,
        scrollW: m.scrollW, clientW: m.clientW,
        docH: m.docH, bildhoehen: +(m.docH / hoehe).toFixed(1),
        titel: m.titel, h1: m.h1,
        breiteElemente: m.breit,
        unsichtbar: m.unsichtbar,
        fehler, netz: [...new Set(netz)].slice(0, 20),
        links: breite === 1440 ? m.links : undefined,
        ids: breite === 1440 ? m.ids : undefined,
      };
    } catch (e) {
      erg[schl] = { FEHLER: String(e).slice(0, 300), fehler, netz };
    }
    sichern();
    console.log(schl, erg[schl].ueberlauf !== undefined ? `ueberlauf=${erg[schl].ueberlauf} h=${erg[schl].bildhoehen}` : 'FEHLER');
    await seite.close();
  }
}

sichern();
await aufraeumen();
console.log('fertig');
