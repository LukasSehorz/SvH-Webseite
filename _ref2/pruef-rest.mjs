/**
 * Restliche Pruefpunkte, jeder Block fuer sich abgesichert und sofort
 * geschrieben, damit ein Fehlschlag nicht alles mitnimmt.
 *
 *   node _ref2/pruef-rest.mjs
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const OUT = '_ref2/tmp/pruef';
fs.mkdirSync(OUT, { recursive: true });
const erg = {};
const sichern = () => fs.writeFileSync(`${OUT}/rest.json`, JSON.stringify(erg, null, 1));
const block = async (name, fn) => {
  try { erg[name] = await fn(); } catch (e) { erg[name] = { FEHLER: String(e).slice(0, 200) }; }
  sichern();
  console.log(name + ' fertig');
};

const gewebe = async (file, l, t, w, h) => {
  const { data, info } = await sharp(file).extract({ left: l, top: t, width: w, height: h })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  let lit = 0, sum = 0, mx = 0;
  for (let i = 0; i < data.length; i++) { if (data[i] > 60) lit++; sum += data[i]; if (data[i] > mx) mx = data[i]; }
  return { anteil: +((lit / (info.width * info.height)) * 100).toFixed(2), mittel: +(sum / data.length).toFixed(1), max: mx };
};

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(3000);

const springe = async (y) => {
  for (let p = 0; p < 2; p++) {
    await page.evaluate((v) => { document.scrollingElement.scrollTop = Math.max(0, v); }, y);
    await page.waitForTimeout(p === 0 ? 700 : 2400);
  }
};
const mtop = async () => page.evaluate(() => Math.round(
  document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));

await block('bildrate', async () => {
  await springe(await mtop());
  await page.evaluate(() => {
    window.__ft = []; let last = performance.now();
    const t = (n) => { window.__ft.push(n - last); last = n; requestAnimationFrame(t); };
    requestAnimationFrame(t);
  });
  await page.waitForTimeout(8000);
  const ft = (await page.evaluate(() => window.__ft.slice(12))).sort((a, b) => a - b);
  return { n: ft.length, p50: +ft[Math.floor(ft.length * 0.5)].toFixed(1),
    p95: +ft[Math.floor(ft.length * 0.95)].toFixed(1), max: +ft[ft.length - 1].toFixed(1) };
});

await block('regler', async () => {
  const reihe = [];
  for (let i = 0; i < 7; i++) {
    const f = `${OUT}/r-dicht${i}.png`;
    await page.screenshot({ path: f });
    reihe.push({ s: i * 11, ...(await gewebe(f, 1080, 60, 340, 340)) });
    if (i < 6) await page.waitForTimeout(11000);
  }
  return reihe;
});

// Wirkt mix-blend-mode: screen ueberhaupt? Wenn ja, muss das Erzwingen
// von normal das Gewebe deutlich dunkler machen. Wenn nicht, aendert
// sich nichts und der dunkle Ring um jeden Punkt ist erklaert.
await block('mischung', async () => {
  const messe = async (tag) => {
    const f = `${OUT}/misch-${tag}.png`;
    await page.screenshot({ path: f });
    const { data, info } = await sharp(f).extract({ left: 1160, top: 150, width: 120, height: 120 })
      .raw().toBuffer({ resolveWithObject: true });
    const C = info.channels; const v = [];
    for (let i = 0; i < info.width * info.height; i++)
      v.push(0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2]);
    v.sort((a, b) => a - b);
    const n = v.length;
    return { p05: +v[Math.floor(n * 0.05)].toFixed(1), med: +v[Math.floor(n * 0.5)].toFixed(1), p95: +v[Math.floor(n * 0.95)].toFixed(1) };
  };
  await springe(await mtop());
  const vorher = await messe('screen');
  const h1 = await page.addStyleTag({ content: '[class*="dnaBand"] { mix-blend-mode: normal !important; }' });
  await page.waitForTimeout(1200);
  const normal = await messe('normal');
  await page.evaluate((el) => el.remove(), h1);
  const h2 = await page.addStyleTag({ content: '[class*="dnaBand"] { display: none !important; }' });
  await page.waitForTimeout(1200);
  const ohne = await messe('ohne');
  await page.evaluate((el) => el.remove(), h2);
  return { screen: vorher, normal, ohneGewebe: ohne };
});

await block('zone', async () => {
  const m = await page.evaluate(() => {
    const se = document.scrollingElement;
    const el = document.getElementById('marketing');
    const zone = el.parentElement && /dnaZoneContent/.test(el.parentElement.className || '')
      ? el.parentElement.parentElement : el.parentElement;
    const r = (e) => ({ top: Math.round(e.getBoundingClientRect().top + se.scrollTop), h: Math.round(e.getBoundingClientRect().height) });
    const ref = document.getElementById('referenzen');
    return { marketing: r(el), zone: zone ? r(zone) : null, referenzenH: ref ? Math.round(ref.getBoundingClientRect().height) : null, docH: se.scrollHeight };
  });
  const zt = m.zone ? m.zone.top : m.marketing.top;
  const zh = m.zone ? m.zone.h : m.marketing.h;
  const lauf = [];
  for (const frac of [-0.15, -0.05, 0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1.05, 1.2, 1.4]) {
    const y = Math.round(zt + frac * zh);
    await springe(y);
    const f = `${OUT}/lauf${String(Math.round(frac * 100)).replace('-', 'm')}.png`;
    await page.screenshot({ path: f });
    const { data, info } = await sharp(f).extract({ left: 980, top: 0, width: 440, height: 900 })
      .raw().toBuffer({ resolveWithObject: true });
    const C = info.channels; const rows = [];
    for (let yy = 0; yy < info.height; yy++) {
      let b = 0; for (let x = 0; x < info.width; x++) b += data[(yy * info.width + x) * C + 2];
      rows.push(b / info.width);
    }
    let best = { d: 0, y: 0 };
    for (let i = 0; i < rows.length - 6; i++) { const d = Math.abs(rows[i + 6] - rows[i]); if (d > best.d) best = { d: +d.toFixed(1), y: i }; }
    lauf.push({ frac, scroll: y, sprung6z: best, ...(await gewebe(f, 980, 60, 440, 780)) });
  }
  return { masze: m, lauf };
});

erg.fehler = errors;
sichern();
await browser.close();

// 390 in eigener Sitzung
await block('mobil', async () => {
  const b = await chromium.launch({ headless: false });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const err = [];
  p.on('pageerror', (e) => err.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForTimeout(3000);
  const t = await p.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
  const shots = [];
  for (const off of [0, 500, 1000]) {
    for (let k = 0; k < 2; k++) {
      await p.evaluate((v) => { document.scrollingElement.scrollTop = Math.max(0, v); }, t + off);
      await p.waitForTimeout(k === 0 ? 700 : 2600);
    }
    const f = `${OUT}/mobil-${off}.png`;
    await p.screenshot({ path: f });
    shots.push({ off, ...(await gewebe(f, 200, 100, 180, 600)) });
  }
  const ov = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }));
  await b.close();
  return { shots, ueberlauf: ov, fehler: err };
});

// Reduzierte Bewegung
await block('reduziert', async () => {
  const b = await chromium.launch({ headless: false });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const err = [];
  p.on('pageerror', (e) => err.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForTimeout(3000);
  for (let k = 0; k < 2; k++) {
    const t = await p.evaluate(() => Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
    await p.evaluate((v) => { document.scrollingElement.scrollTop = v; }, t);
    await p.waitForTimeout(k === 0 ? 700 : 2600);
  }
  await p.screenshot({ path: `${OUT}/red-a.png` });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: `${OUT}/red-b.png` });
  await b.close();
  const win = { left: 1080, top: 60, width: 340, height: 340 };
  const A = await sharp(`${OUT}/red-a.png`).extract(win).greyscale().raw().toBuffer();
  const B = await sharp(`${OUT}/red-b.png`).extract(win).greyscale().raw().toBuffer();
  let d = 0; for (let i = 0; i < A.length; i++) d += Math.abs(A[i] - B[i]);
  return { a: await gewebe(`${OUT}/red-a.png`, 1080, 60, 340, 340),
    b: await gewebe(`${OUT}/red-b.png`, 1080, 60, 340, 340),
    mittlereAenderung: +(d / A.length).toFixed(3), fehler: err };
});

console.log('ALLES FERTIG -> ' + OUT + '/rest.json');
