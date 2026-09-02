/**
 * Die sechs Bewegungspunkte des Auftrags, jeder einzeln gemessen.
 *
 *   node _ref2/pr-bewegung.mjs [port]
 *
 * Gelesen wird ueber den Entwicklungshaken window.__dna, zusaetzlich
 * werden Bilder verglichen. Der Sprung laeuft ueber
 * document.scrollingElement, weil Lenis window.scrollTo abfaengt, und er
 * wird zweimal gesetzt, weil die erste Zuweisung von der Traegheit
 * ueberschrieben wird.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const OUT = '_ref2/tmp/bew';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 300)); });
page.on('pageerror', (e) => fehler.push('PAGEERROR: ' + String(e).slice(0, 300)));

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const dna = () => page.evaluate(() => (window.__dna ? { ...window.__dna(), t: performance.now() } : null));

const springe = async (off) => {
  for (let pass = 0; pass < 2; pass++) {
    const top = await page.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top
      + document.scrollingElement.scrollTop));
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
    await page.waitForTimeout(pass === 0 ? 800 : 2600);
  }
};

const zeig = (o) => JSON.stringify(o);
const log = [];
const sag = (s) => { console.log(s); log.push(s); };

/* --------------------------------------------------------------- */
sag('=== Geometrie der Zone ===');
const geo = await page.evaluate(() => {
  const se = document.scrollingElement;
  const mk = document.getElementById('marketing');
  const cv = document.querySelector('canvas[aria-hidden="true"]');
  const sticky = cv ? cv.parentElement : null;
  const bg = sticky ? sticky.parentElement : null;
  const zone = bg ? bg.parentElement : null;
  const b = (el) => (el ? {
    top: Math.round(el.getBoundingClientRect().top + se.scrollTop),
    h: Math.round(el.getBoundingClientRect().height),
  } : null);
  return { doc: se.scrollHeight, vp: window.innerHeight, marketing: b(mk), zone: b(zone), bg: b(bg), sticky: b(sticky) };
});
sag(zeig(geo));

/* --------------------------------------------------------------- */
sag('');
sag('=== Punkt 1: Ruhetempo ueber 40 Sekunden ===');
await springe(400);
const r0 = await dna();
await page.waitForTimeout(40000);
const r1 = await dna();
let df = r1.flow - r0.flow;
while (df < 0) df += 1;
const dtR = (r1.t - r0.t) / 1000;
const ruhe = (df * r0.periodePx) / dtR;
sag(`periodePx=${r0.periodePx.toFixed(1)} unit=${r0.unit.toFixed(2)} spann=${r0.spann.toFixed(4)} stride=${zeig(r0.stride)}`);
sag(`flow ${r0.flow.toFixed(7)} -> ${r1.flow.toFixed(7)} ueber ${dtR.toFixed(1)} s`);
sag(`Ruhetempo = ${ruhe.toFixed(3)} px/s   boost am Ende = ${r1.boost.toFixed(8)}`);
sag(`travel in Ruhe: ${r0.travel.toFixed(6)} -> ${r1.travel.toFixed(6)} (Aenderung ${((r1.travel - r0.travel) * r0.periodePx).toFixed(3)} px)`);

/* --------------------------------------------------------------- */
sag('');
sag('=== Punkt 2: Tempo beim Scrollen ===');
/* Langsames Rad, damit Lenis eine echte Geste sieht. */
const s0 = await dna();
let boostMax = 0;
for (let i = 0; i < 60; i++) {
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(45);
  if (i % 6 === 0) { const d = await dna(); if (d.boost > boostMax) boostMax = d.boost; }
}
const s1 = await dna();
let df2 = s1.flow - s0.flow;
while (df2 < 0) df2 += 1;
const dtS = (s1.t - s0.t) / 1000;
const beiScroll = (df2 * s0.periodePx) / dtS;
sag(`Flusztempo beim Scrollen = ${beiScroll.toFixed(3)} px/s ueber ${dtS.toFixed(1)} s`);
sag(`hoechster boost = ${boostMax.toFixed(7)}   Verhaeltnis zum Ruhetempo = ${(beiScroll / ruhe).toFixed(2)}`);
const wandertPx = Math.abs(s1.travel - s0.travel) * s0.periodePx;
const wegDelta = Math.abs(s1.weg - s0.weg);
sag(`Weltversatz waehrend derselben Geste = ${wandertPx.toFixed(1)} px bei ${wegDelta.toFixed(0)} px Scrollweg`);
sag(`Gesamttempo der Struktur im Bild = ${((wandertPx + df2 * s0.periodePx) / dtS).toFixed(1)} px/s`);

/* --------------------------------------------------------------- */
sag('');
sag('=== Punkt 3: Mitlauf ueber die ganze Zone ===');
const STELLEN = [-200, -100, 0, 150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1700, 1900, 2100];
const hin = [];
for (const off of STELLEN) { await springe(off); const d = await dna(); hin.push({ off, ...d }); }
const basis = hin.find((z) => z.off === 0);
for (const z of hin) {
  const px = (z.travel - basis.travel) * z.periodePx;
  sag(`off=${String(z.off).padStart(5)} weg=${String(Math.round(z.weg)).padStart(6)}`
    + ` travel=${z.travel.toFixed(6)} versatzPx=${px.toFixed(1)}`
    + ` mitlauf=${z.off ? (px / z.off).toFixed(4) : '-'}`);
}

/* --------------------------------------------------------------- */
sag('');
sag('=== Punkt 5: Extremfaelle ===');
await springe(600);
const vorher = await dna();
await page.screenshot({ path: `${OUT}/vor-600.png` });

sag('-- ganz nach unten --');
await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight; });
await page.waitForTimeout(3000);
const unten = await dna();
sag(`unten: weg=${Math.round(unten.weg)} travel=${unten.travel.toFixed(6)} rohTravel=${((0.35 * unten.weg) / unten.periodePx).toFixed(4)}`);

sag('-- ganz nach oben --');
await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
await page.waitForTimeout(3000);
const oben = await dna();
sag(`oben: weg=${Math.round(oben.weg)} travel=${oben.travel.toFixed(6)} rohTravel=${((0.35 * oben.weg) / oben.periodePx).toFixed(4)}`);

sag('-- schnelles Rucken nach unten und oben, dreimal --');
for (let k = 0; k < 3; k++) {
  await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight * 0.55; });
  await page.waitForTimeout(120);
  await page.evaluate(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight * 0.20; });
  await page.waitForTimeout(120);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 600); }
  await page.waitForTimeout(200);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -600); }
  await page.waitForTimeout(200);
}
await page.waitForTimeout(2000);

await springe(600);
const nachher = await dna();
await page.screenshot({ path: `${OUT}/nach-600.png` });
sag(`travel bei off=600 vorher ${vorher.travel.toFixed(6)} nachher ${nachher.travel.toFixed(6)}`
  + `  Abweichung ${(Math.abs(vorher.travel - nachher.travel) * vorher.periodePx).toFixed(4)} px`);
sag(`weg vorher ${Math.round(vorher.weg)} nachher ${Math.round(nachher.weg)}`);

/* Ruecklauf ueber dieselben Stellen. */
sag('-- Ruecklauf ueber dieselben Stellen --');
const rueck = [];
for (const off of [...STELLEN].reverse()) { await springe(off); const d = await dna(); rueck.push({ off, ...d }); }
let maxAbw = 0;
for (const z of rueck) {
  const a = hin.find((q) => q.off === z.off);
  const abw = Math.abs(a.travel - z.travel) * z.periodePx;
  if (abw > maxAbw) maxAbw = abw;
  if (abw > 0.05) sag(`  off=${z.off} Abweichung ${abw.toFixed(3)} px (hin ${a.travel.toFixed(6)} zurueck ${z.travel.toFixed(6)})`);
}
sag(`groeszte Abweichung hin gegen zurueck = ${maxAbw.toFixed(4)} px`);

sag('');
sag('=== Konsolenmeldungen ===');
sag(fehler.length ? fehler.join('\n') : 'keine');

fs.writeFileSync(`${OUT}/bewegung.txt`, log.join('\n'));
await browser.close();
