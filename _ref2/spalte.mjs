/**
 * Lesbarkeit der Marketing-Sektion, Kasten des Elementes UND Kasten der
 * Schrift nebeneinander.
 *
 *   node _ref2/spalte.mjs <port> <breite> <hoehe> <marke> <versatz...>
 *   node _ref2/spalte.mjs 3100 1440 900 vorher 0 420 840 1200 1440
 *
 * Je Scrollstelle entstehen zwei Aufnahmen. In der einen ist die Schrift
 * unsichtbar, sie liefert den Grund samt Gewebe. In der anderen ist die
 * Leinwand abgeschaltet, sie liefert die wirkliche Helligkeit der Schrift.
 * Die Helligkeit darf niemals aus dem Stilblatt kommen, dort steht 244 und
 * gerendert wird mit 168 bis 179; genau dieser Fehler hat eine Runde
 * gekostet.
 *
 * Gemessen wird ausschlieszlich innerhalb von #marketing, also der
 * Marketing-Sektion. Anders als pr-lesbar3.mjs wird NICHT nach der Lage im
 * Bild gefiltert, denn nach dem Umbau wandern Zeilen aus der rechten
 * Bildhaelfte heraus und wuerden sonst aus der Tabelle fallen. Der
 * Vergleich vorher gegen nachher braucht aber dieselben Zeilen.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const BR = Number(process.argv[3] || 1440);
const HO = Number(process.argv[4] || 900);
const MARKE = process.argv[5] || 'lauf';
const STELLEN = process.argv.slice(6).map(Number).filter((v) => !Number.isNaN(v));

const OUT = `_ref2/tmp/sp-${MARKE}-${BR}`;
fs.mkdirSync(OUT, { recursive: true });

const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/* sharp.stats() ignoriert .extract(); Fensterwerte werden deshalb aus dem
   rohen Puffer selbst gerechnet. */
const hole = async (f) => {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  return { data, C: info.channels, W: info.width, H: info.height };
};

const messe = (G, S, k) => {
  const l = Math.max(0, k.l), t = Math.max(0, k.t);
  const w = Math.min(k.w - (l - k.l), G.W - l - 1), h = Math.min(k.h, G.H - t - 1);
  if (w < 6 || h < 4) return null;
  const werte = []; let gmax = 0, sr = 0, sg = 0, sb = 0, smax = 0;
  for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
    const i = (y * G.W + x) * G.C;
    const L = 0.299 * G.data[i] + 0.587 * G.data[i + 1] + 0.114 * G.data[i + 2];
    werte.push(L); if (L > gmax) gmax = L;
    sr += G.data[i]; sg += G.data[i + 1]; sb += G.data[i + 2];
    const j = (y * S.W + x) * S.C;
    const M = 0.299 * S.data[j] + 0.587 * S.data[j + 1] + 0.114 * S.data[j + 2];
    if (M > smax) smax = M;
  }
  const n = w * h;
  const m = werte.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(werte.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  /* Die Schriftfarbe aus dem Bild ohne Gewebe, gemittelt ueber die
     hellsten Bildpunkte, damit die Kantenglaettung sie nicht verfaelscht. */
  const hell = [];
  for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
    const j = (y * S.W + x) * S.C;
    const M = 0.299 * S.data[j] + 0.587 * S.data[j + 1] + 0.114 * S.data[j + 2];
    if (M > smax - 12) hell.push([S.data[j], S.data[j + 1], S.data[j + 2]]);
  }
  const hm = hell.length
    ? hell.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]).map((v) => v / hell.length)
    : [255, 255, 255];
  const Ys = relLum(hm[0], hm[1], hm[2]);
  const Yg = relLum(sr / n, sg / n, sb / n);
  const wcag = (Math.max(Ys, Yg) + 0.05) / (Math.min(Ys, Yg) + 0.05);
  return { m, sd, gmax, smax, wcag, rechts: l + w };
};

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: BR, height: HO }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3500);

/* Lenis faengt window.scrollTo ab. Hart ueber scrollingElement springen und
   zweimal setzen, weil die erste Zuweisung von der Traegheit ueberschrieben
   wird. */
const springe = async (off) => {
  /* Die erste Zuweisung wird von der Traegheit ueberschrieben, deshalb wird
     mehrfach gesetzt und am Ende nachgesehen, wo die Seite wirklich steht.
     Ohne diese Nachschau landete derselbe Versatz in zwei Durchlaeufen
     einmal auf den Kennzahlen und einmal auf den Straengen, und die Tabellen
     waren nicht mehr vergleichbar. */
  let ist = -1, soll = 0;
  for (let pass = 0; pass < 6; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    soll = Math.max(0, top + off);
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, soll);
    await page.waitForTimeout(pass === 0 ? 900 : 2600);
    ist = await page.evaluate(() => Math.round(document.scrollingElement.scrollTop));
    if (pass > 0 && Math.abs(ist - soll) < 3) break;
  }
  if (Math.abs(ist - soll) >= 3) console.log(`  ACHTUNG Versatz ${off}: steht auf ${ist} statt ${soll}`);
};

const sammle = () => page.evaluate(() => {
  const raus = [];
  let k = 0;
  const wurzel = document.getElementById('marketing');
  if (!wurzel) return raus;
  /* Die Navigationspille klebt oben im Bild und schiebt sich beim Scrollen
     ueber die Sektion, unten links steht eine schwebende Schaltflaeche.
     Beide sind deckend und hell, und eine Zeile, die gerade unter ihnen
     durchlaeuft, misst deshalb einen Grund von 244 statt der 30 des
     Gewebegrundes. Das ist kein Gewebeproblem und wird eigens markiert.
     Gesammelt wird ueber die Berechnungsart, nicht ueber Klassennamen, damit
     kein Aufleger uebersehen wird. */
  const nav = [];
  const nimm = (r) => {
    if (r.width > 4 && r.height > 4 && r.width < window.innerWidth * 0.8) nav.push(r);
  };
  /* Die Leiste selbst ist durchsichtig und ueber die volle Breite; deckend
     sind erst ihre Kinder, also die Pillen. */
  for (const e of document.querySelectorAll('header *, footer *')) {
    const cs = getComputedStyle(e);
    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.backgroundImage === 'none') continue;
    nimm(e.getBoundingClientRect());
  }
  /* Kleine schwebende Schaltflaechen. Die klebende Leinwand der Struktur
     faellt nicht darunter, sie ist so grosz wie das Bild. */
  for (const e of document.querySelectorAll('body *')) {
    if (wurzel.contains(e)) continue;
    if (getComputedStyle(e).position !== 'fixed') continue;
    const r = e.getBoundingClientRect();
    if (r.width < 200 && r.height < 200) nimm(r);
  }
  for (const el of wurzel.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (t.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 6) continue;
    if (r.bottom < 4 || r.top > window.innerHeight - 4) continue;
    el.setAttribute('data-sp', String(k));
    let zeile = null;
    try {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const rects = [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
      if (rects.length) {
        const li = Math.min(...rects.map((q) => q.left));
        const to = Math.min(...rects.map((q) => q.top));
        const re = Math.max(...rects.map((q) => q.right));
        const bo = Math.max(...rects.map((q) => q.bottom));
        zeile = { l: Math.round(li), t: Math.round(to), w: Math.round(re - li), h: Math.round(bo - to) };
      }
    } catch { zeile = null; }
    const q = zeile || { l: r.left, t: r.top, w: r.width, h: r.height };
    const unterNav = nav.some((n) => n.left < q.l + q.w && n.right > q.l
      && n.top < q.t + q.h && n.bottom > q.t);
    raus.push({
      id: k, text: t.slice(0, 46),
      l: Math.round(r.left), t: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      zeile, unterNav,
      groesze: getComputedStyle(el).fontSize,
    });
    k += 1;
  }
  return raus;
});

/* Der Entwicklungsserver blendet unten links seine eigene Anzeige ein. Sie
   steht in einem eigenen Schattenbaum, taucht also in keiner Abfrage nach
   festen Elementen auf, ist aber deckend hell und hat drei Zeilen einen
   Grundhoechstwert von 255 angehaengt. Im gebauten Stand gibt es sie nicht,
   fuer die Messung wird sie ausgeblendet. */
const setze = (css) => page.evaluate((c) => {
  let s = document.getElementById('spStil');
  if (!s) { s = document.createElement('style'); s.id = 'spStil'; document.head.appendChild(s); }
  s.textContent = `nextjs-portal { display: none !important; }\n${c}`;
}, css);

const bericht = [];
for (const off of STELLEN) {
  await springe(off);
  // Ein zweiter Sprung nach kurzer Ruhe. Der Grund ist ein Fehlschlag:
  // beim Versatz 420 lud oberhalb der Sektion noch Inhalt nach und schob
  // sie waehrend der Messung nach unten. Die Kaesten stammten dann von
  // anderen Zeilen als die Aufnahmen, im Grundbild stand deshalb Schrift,
  // und der Grundhoechstwert meldete 244,2 — also genau die Helligkeit
  // aus dem Stilblatt — bei einer Streuung von 73. Elf Zeilen sahen so
  // aus wie ein schwerer Lesbarkeitsmangel und waren in Wahrheit ein
  // verrutschtes Meszfenster.
  await page.waitForTimeout(1500);
  await springe(off);
  const vorher = await page.evaluate(() => Math.round(document.scrollingElement.scrollTop));
  const name = String(off).replace('-', 'm');
  const kaesten = await sammle();

  await setze('[data-sp] { visibility: hidden !important; }');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/t${name}.png` });

  await setze('canvas[aria-hidden="true"] { display: none !important; }');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/c${name}.png` });

  await setze('');
  await page.waitForTimeout(400);

  // Nachweis, dass die Seite waehrend der beiden Aufnahmen stillstand.
  // Ohne ihn ist nicht zu unterscheiden, ob eine auffaellige Zeile einen
  // echten Mangel zeigt oder nur ein verrutschtes Fenster.
  const nachher = await page.evaluate(() => Math.round(document.scrollingElement.scrollTop));
  if (Math.abs(nachher - vorher) > 2) {
    console.error(`WARNUNG Versatz ${off}: Seite ist waehrend der Messung um ${nachher - vorher} Bildpunkte gewandert`);
  }

  const G = await hole(`${OUT}/t${name}.png`);
  const S = await hole(`${OUT}/c${name}.png`);

  console.log('');
  console.log(`===== ${MARKE} · ${BR} px · Versatz ${off} =====`);
  console.log('  Text'.padEnd(42)
    + '--- ELEMENTKASTEN ---------    --- SCHRIFTKASTEN --------------------');
  console.log(' '.padEnd(42)
    + 'rechts   %B  max streu wcag |  rechts   %B  max streu grund schr wcag  Urteil');
  let verletzt = 0, gezaehlt = 0;
  for (const roh of kaesten) {
    const e = messe(G, S, roh);
    const z = roh.zeile ? messe(G, S, { ...roh.zeile }) : null;
    if (!e) continue;
    const b = z || e;
    const marken = [];
    if (roh.unterNav) marken.push('NAV');
    else {
      gezaehlt += 1;
      if (b.sd > 3) marken.push('STREU');
      if (b.gmax > 120) marken.push('MAX');
      if (b.wcag < 7) marken.push('WCAG');
      if (marken.length) verletzt += 1;
    }
    const pE = (100 * e.rechts / BR).toFixed(1);
    const pZ = z ? (100 * z.rechts / BR).toFixed(1) : '  - ';
    console.log(`  ${roh.text.slice(0, 38).padEnd(40)}`
      + `${String(e.rechts).padStart(6)}${String(pE).padStart(6)}${e.gmax.toFixed(0).padStart(5)}`
      + `${e.sd.toFixed(1).padStart(6)}${e.wcag.toFixed(1).padStart(5)} |`
      + (z ? `${String(z.rechts).padStart(8)}${String(pZ).padStart(6)}${z.gmax.toFixed(0).padStart(5)}`
        + `${z.sd.toFixed(1).padStart(6)}${z.m.toFixed(1).padStart(6)}${z.smax.toFixed(0).padStart(5)}`
        + `${z.wcag.toFixed(1).padStart(5)}` : ' '.repeat(42))
      + `  ${marken.join(' ')}`);
    bericht.push({ off, text: roh.text, unterNav: roh.unterNav, element: e, schrift: z });
  }
  console.log(`  verletzt: ${verletzt} von ${gezaehlt} (Zeilen unter der Navigationspille nicht gezaehlt)`);
}

fs.writeFileSync(`${OUT}/spalte.json`, JSON.stringify(bericht, null, 1));
await browser.close();
