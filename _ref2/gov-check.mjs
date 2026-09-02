/**
 * Haelt die Struktur ueber die Zeit durch?
 *
 * Der Regler hat frueher ueber setDrawRange gekuerzt und nie
 * zurueckgegeben; nach gut einer halben Minute stand nur noch ein
 * Zipfel oben rechts. Dieses Skript sitzt bei Versatz 0 auf der
 * Marketing-Sektion, ruehrt den Scroll nicht mehr an und misst alle
 * 12 s den Gewebeanteil in der rechten Bildhaelfte.
 *
 * Erwartung nach der Reparatur: der Anteil schwankt mit der Drehlage,
 * faellt aber nicht dauerhaft ab.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3100';
const SHOTS = Number(process.argv[3] || 9);
const GAP = Number(process.argv[4] || 12000);
fs.mkdirSync('_ref2/tmp/gov', { recursive: true });

// Anteil hinreichend heller Punkte im rechten Bildbereich.
const tissue = async (file) => {
  const { data, info } = await sharp(file)
    .extract({ left: 720, top: 0, width: 720, height: 900 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let lit = 0;
  for (let i = 0; i < data.length; i++) if (data[i] > 42) lit++;
  return (lit / (info.width * info.height)) * 100;
};

// Schwerpunkt der Helligkeit in der Hoehe, damit ein amputiertes Band
// auffaellt, auch wenn der Anteil zufaellig stimmt.
const centroid = async (file) => {
  const { data, info } = await sharp(file)
    .extract({ left: 720, top: 0, width: 720, height: 900 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  let wsum = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const v = data[y * info.width + x];
      if (v > 42) {
        sum += v;
        wsum += v * y;
      }
    }
  }
  return sum > 0 ? (wsum / sum / info.height) * 100 : NaN;
};

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});
await page.waitForTimeout(2500);
const top = await page.evaluate(() => {
  const se = document.scrollingElement;
  const el = document.getElementById('marketing');
  return Math.round(el.getBoundingClientRect().top + se.scrollTop);
});
// Lenis faengt window.scrollTo ab, deshalb der harte Sprung — zweimal,
// weil die erste Zuweisung noch von der Traegheit ueberschrieben wird.
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
await page.waitForTimeout(1500);
await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
await page.waitForTimeout(3000);

const rows = [];
for (let i = 0; i < SHOTS; i++) {
  const f = `_ref2/tmp/gov/g${String(i).padStart(2, '0')}.png`;
  await page.screenshot({ path: f });
  const t = await tissue(f);
  const c = await centroid(f);
  rows.push({ s: i * (GAP / 1000), t, c });
  console.log(
    `t=${String(i * (GAP / 1000)).padStart(3)}s  Gewebe ${t.toFixed(2)} %  Schwerpunkt y=${c.toFixed(1)} %`,
  );
  if (i < SHOTS - 1) await page.waitForTimeout(GAP);
}

const first = rows[0].t;
const tail = rows.slice(-3).reduce((a, r) => a + r.t, 0) / 3;
console.log('');
console.log(`Start ${first.toFixed(2)} %  ·  Mittel der letzten drei ${tail.toFixed(2)} %`);
console.log(tail > first * 0.6 ? 'BESTANDEN — kein dauerhafter Abfall' : 'DURCHGEFALLEN — die Struktur zerfaellt');
await browser.close();
