/**
 * Zeitreihe eines Elements. Schießt N Bilder im festen Abstand, OHNE dabei zu
 * scrollen, und meldet die Bewegung zwischen den Bildern als mittlere
 * Pixeldifferenz.
 *
 *   node _ref2/timeseries.mjs <selector> <outDir> [anzahl] [abstandMs] [scrollY]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const selector = process.argv[2] || '.hero-field';
const outDir = process.argv[3] || '_ref2/shots/chk/time-hero';
const count = parseInt(process.argv[4] || '8', 10);
const gap = parseInt(process.argv[5] || '500', 10);
const scrollY = parseInt(process.argv[6] || '0', 10);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 160)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2600);
if (scrollY) {
  await page.evaluate((v) => window.scrollTo(0, v), scrollY);
  await page.waitForTimeout(1600);
}

const box = await (await page.$(selector)).boundingBox();
const clip = {
  x: Math.max(0, Math.round(box.x)),
  y: Math.max(0, Math.round(box.y)),
  width: Math.min(1440 - Math.max(0, Math.round(box.x)), Math.round(box.width)),
  height: Math.min(900 - Math.max(0, Math.round(box.y)), Math.round(box.height)),
};

const files = [];
for (let i = 0; i < count; i += 1) {
  const f = path.join(outDir, `t${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: f, clip });
  files.push(f);
  if (i < count - 1) await page.waitForTimeout(gap);
}

/* Bewegung zwischen aufeinanderfolgenden Bildern messen */
const diffs = [];
for (let i = 1; i < files.length; i += 1) {
  const d = await page.evaluate(
    async ([a, b]) => {
      const load = async (uri) => {
        const img = new Image();
        img.src = uri;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        return g.getImageData(0, 0, c.width, c.height).data;
      };
      const [x, y] = await Promise.all([load(a), load(b)]);
      let sum = 0;
      let changed = 0;
      let maxd = 0;
      const n = x.length / 4;
      for (let i = 0; i < x.length; i += 4) {
        const dd =
          Math.abs(x[i] - y[i]) + Math.abs(x[i + 1] - y[i + 1]) + Math.abs(x[i + 2] - y[i + 2]);
        sum += dd;
        if (dd > 24) changed += 1;
        if (dd > maxd) maxd = dd;
      }
      return { mean: sum / n / 3, changedPct: (changed / n) * 100, max: maxd };
    },
    [
      'data:image/png;base64,' + fs.readFileSync(files[i - 1]).toString('base64'),
      'data:image/png;base64,' + fs.readFileSync(files[i]).toString('base64'),
    ],
  );
  diffs.push(d);
}

await browser.close();

console.log(`${selector}  ${count} Bilder à ${gap}ms  Ausschnitt ${clip.width}x${clip.height}`);
diffs.forEach((d, i) =>
  console.log(
    `  t${String(i).padStart(2, '0')}→t${String(i + 1).padStart(2, '0')}  ` +
      `mittlere Differenz ${d.mean.toFixed(2)}  bewegte Fläche ${d.changedPct.toFixed(2)}%  Spitze ${d.max}`,
  ),
);
const means = diffs.map((d) => d.mean);
const avg = means.reduce((a, b) => a + b, 0) / means.length;
const sd = Math.sqrt(means.reduce((a, b) => a + (b - avg) ** 2, 0) / means.length);
console.log(
  `  Schnitt ${avg.toFixed(2)}, Streuung ${sd.toFixed(2)}  ` +
    `(gleichmäßig wenn Streuung klein gegen Schnitt)`,
);
if (errors.length) console.log('  Konsole: ' + errors.join(' | '));
