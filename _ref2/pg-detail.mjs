/**
 * Was die grobe Pruefung nicht sieht.
 *
 * body traegt overflow-x: hidden, deshalb meldet scrollWidth nie einen
 * Ueberlauf. Hier wird jedes Element gegen die Fensterbreite gemessen.
 * Dazu Kontrast von Fliesztext, Verweise mit Status, Ankerziele und die
 * Lage bei reduzierter Bewegung.
 *
 *   node _ref2/pg-detail.mjs
 */
import fs from 'node:fs';
import { starten } from './browser.mjs';

const ZIEL = '_ref2/mess/pruef-gesamt';
const BASIS = 'http://localhost:3210';
const ROUTEN = ['/', '/ki', '/marketing', '/marketing/webseiten', '/marketing/social-media',
  '/marketing/werbetafeln', '/ueber-uns', '/kontakt', '/impressum', '/datenschutz', '/agb'];
const BREITEN = [[1440, 900], [2560, 1440], [390, 844]];

const erg = {};
const sichern = () => fs.writeFileSync(`${ZIEL}/detail.json`, JSON.stringify(erg, null, 1));

const MESS = () => {
  const W = window.innerWidth;
  const raus = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    if (r.right > W + 1.5 || r.left < -1.5) {
      // Nur der aeuszerste Uebeltaeter zaehlt, Kinder erben den Ueberhang.
      raus.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 60),
        l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.width),
        ov: cs.overflowX,
        eltern: el.parentElement ? String(el.parentElement.className).slice(0, 40) : '',
      });
    }
  }
  return raus;
};

/* Kontrast von Fliesztext gegen den tatsaechlich gemalten Grund. */
const KONTRAST = () => {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = (r, g, b) => 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const grund = (el) => {
    let n = el;
    let acc = null;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.02) { acc = c; if (c.a >= 0.99) break; }
      n = n.parentElement;
    }
    return acc || { r: 5, g: 5, b: 7, a: 1 };
  };
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('p, li, dd, .t-body, .t-body-lg, .t-label, figcaption, label, small, span')) {
    const t = (el.textContent || '').trim();
    if (t.length < 20) continue;
    if (el.querySelector('p, li, div')) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 20 || r.height < 6) continue;
    if (cs.visibility === 'hidden') continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = grund(el);
    const mix = {
      r: fg.a * fg.r + (1 - fg.a) * bg.r,
      g: fg.a * fg.g + (1 - fg.a) * bg.g,
      b: fg.a * fg.b + (1 - fg.a) * bg.b,
    };
    const l1 = lum(mix.r, mix.g, mix.b);
    const l2 = lum(bg.r, bg.g, bg.b);
    const v = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const grosz = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    const marke = grosz ? 3 : 4.5;
    const key = t.slice(0, 30) + px;
    if (seen.has(key)) continue;
    seen.add(key);
    if (v < marke) {
      out.push({ v: +v.toFixed(2), px: +px.toFixed(1), farbe: cs.color, grund: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, cls: String(el.className).slice(0, 46), t: t.slice(0, 54) });
    }
  }
  return out;
};

const { browser, aufraeumen } = await starten();

/* ---------------------------------------------------- Ueberlauf, Kontrast */
for (const [w, h] of BREITEN) {
  const seite = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  for (const route of ROUTEN) {
    try {
      await seite.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await seite.waitForTimeout(2200);
      const gesamt = await seite.evaluate(() => document.scrollingElement.scrollHeight);
      const alle = { raus: [], kontrast: [] };
      for (let y = 0; y < gesamt; y += Math.round(h * 0.8)) {
        await seite.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
        await seite.waitForTimeout(420);
        const r = await seite.evaluate(MESS);
        const k = await seite.evaluate(KONTRAST);
        alle.raus.push(...r);
        alle.kontrast.push(...k);
      }
      const uniq = (arr, f) => { const s = new Set(); return arr.filter((x) => { const k = f(x); if (s.has(k)) return false; s.add(k); return true; }); };
      erg[`${w}${route}`] = {
        raus: uniq(alle.raus, (x) => x.tag + x.cls + x.r).slice(0, 18),
        kontrast: uniq(alle.kontrast, (x) => x.t).slice(0, 18),
      };
    } catch (e) { erg[`${w}${route}`] = { FEHLER: String(e).slice(0, 200) }; }
    sichern();
    const e = erg[`${w}${route}`];
    console.log(w, route, 'raus', (e.raus || []).length, 'kontrast', (e.kontrast || []).length);
  }
  await seite.close();
}

/* ------------------------------------------------------------ Verweise */
const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const gesehen = new Map();
const anker = {};
for (const route of ROUTEN) {
  await seite.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await seite.waitForTimeout(1200);
  const d = await seite.evaluate(() => ({
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), t: (a.textContent || '').trim().slice(0, 34) })),
    ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
  }));
  anker[route] = d.ids;
  for (const l of d.links) {
    const k = route + ' -> ' + l.href;
    if (!gesehen.has(k)) gesehen.set(k, l.t);
  }
}
const verweise = [];
for (const [k, t] of gesehen) {
  const [von, href] = k.split(' -> ');
  if (/^(https?:|mailto:|tel:)/.test(href)) { verweise.push({ von, href, t, art: 'extern' }); continue; }
  const [pfad, frag] = href.split('#');
  const ziel = pfad === '' ? von : pfad;
  let status = null;
  try {
    const antwort = await seite.request.get(BASIS + ziel);
    status = antwort.status();
  } catch { status = 'FEHLER'; }
  let ankerOk = null;
  if (frag) {
    if (!anker[ziel]) {
      await seite.goto(BASIS + ziel, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await seite.waitForTimeout(900);
      anker[ziel] = await seite.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
    }
    ankerOk = anker[ziel].includes(frag);
  }
  verweise.push({ von, href, t, status, anker: frag || null, ankerOk });
}
erg.verweise = verweise;
sichern();
console.log('verweise fertig');
await seite.close();

/* ------------------------------------------- Reduzierte Bewegung */
const rp = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const red = {};
for (const route of ROUTEN) {
  const fehler = [];
  rp.once('pageerror', (e) => fehler.push(String(e).slice(0, 160)));
  await rp.goto(BASIS + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await rp.waitForTimeout(2200);
  const gesamt = await rp.evaluate(() => document.scrollingElement.scrollHeight);
  const blind = [];
  for (let y = 0; y < gesamt; y += 700) {
    await rp.evaluate((v) => { document.scrollingElement.scrollTop = v; }, y);
    await rp.waitForTimeout(320);
    const b = await rp.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('h1,h2,h3,p,li,figure,article,section,img,svg,video')) {
        const t = (el.textContent || '').trim();
        const bild = /^(IMG|SVG|VIDEO)$/.test(el.tagName);
        if (!bild && t.length < 10) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        if (r.width < 4 || r.height < 4) continue;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.08 || cs.visibility === 'hidden') {
          out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 44), op: cs.opacity, t: t.slice(0, 44) });
        }
      }
      return out;
    });
    blind.push(...b);
  }
  const s = new Set();
  red[route] = { blind: blind.filter((x) => { const k = x.tag + x.t + x.cls; if (s.has(k)) return false; s.add(k); return true; }).slice(0, 14), fehler };
  console.log('reduziert', route, red[route].blind.length);
}
erg.reduziert = red;
sichern();
await rp.close();
await aufraeumen();
console.log('fertig');
