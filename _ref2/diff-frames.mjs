/**
 * Misst die Bewegung in einer vorhandenen Bildserie (z. B. den Referenz-Frames).
 *
 *   node _ref2/diff-frames.mjs <ordner> [x] [y] [w] [h]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const dir = process.argv[2];
const cx = parseInt(process.argv[3] || '0', 10);
const cy = parseInt(process.argv[4] || '0', 10);
const cw = parseInt(process.argv[5] || '0', 10);
const ch = parseInt(process.argv[6] || '0', 10);

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.png'))
  .sort()
  .map((f) => path.join(dir, f));

const browser = await chromium.launch();
const page = await browser.newPage();
const diffs = [];

for (let i = 1; i < files.length; i += 1) {
  const d = await page.evaluate(
    async ([a, b, cx, cy, cw, ch]) => {
      const load = async (uri) => {
        const img = new Image();
        img.src = uri;
        await img.decode();
        const w = cw || img.naturalWidth;
        const h = ch || img.naturalHeight;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, -cx, -cy);
        return g.getImageData(0, 0, w, h).data;
      };
      const [x, y] = await Promise.all([load(a), load(b)]);
      let sum = 0;
      let changed = 0;
      const n = x.length / 4;
      for (let i = 0; i < x.length; i += 4) {
        const dd =
          Math.abs(x[i] - y[i]) + Math.abs(x[i + 1] - y[i + 1]) + Math.abs(x[i + 2] - y[i + 2]);
        sum += dd;
        if (dd > 24) changed += 1;
      }
      return { mean: sum / n / 3, changedPct: (changed / n) * 100 };
    },
    [
      'data:image/png;base64,' + fs.readFileSync(files[i - 1]).toString('base64'),
      'data:image/png;base64,' + fs.readFileSync(files[i]).toString('base64'),
      cx,
      cy,
      cw,
      ch,
    ],
  );
  diffs.push(d);
}
await browser.close();

console.log(`${dir}  ${files.length} Bilder`);
diffs.forEach((d, i) =>
  console.log(
    `  t${String(i).padStart(2, '0')}→t${String(i + 1).padStart(2, '0')}  ` +
      `mittlere Differenz ${d.mean.toFixed(2)}  bewegte Fläche ${d.changedPct.toFixed(2)}%`,
  ),
);
const means = diffs.map((d) => d.mean);
const avg = means.reduce((a, b) => a + b, 0) / means.length;
const sd = Math.sqrt(means.reduce((a, b) => a + (b - avg) ** 2, 0) / means.length);
const areas = diffs.map((d) => d.changedPct);
const aavg = areas.reduce((a, b) => a + b, 0) / areas.length;
console.log(`  Schnitt ${avg.toFixed(2)}, Streuung ${sd.toFixed(2)}, bewegte Fläche ø ${aavg.toFixed(2)}%`);
