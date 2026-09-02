/**
 * Misst die Flächenhelligkeit eines Bildes in einem Raster.
 * Zusätzlich die lokale Streuung als Maß für sichtbares Korn.
 *
 *   node _ref2/surface.mjs <png> [cols] [rows]
 */
import { chromium } from 'playwright';
import fs from 'fs';

const file = process.argv[2];
const cols = parseInt(process.argv[3] || '4', 10);
const rows = parseInt(process.argv[4] || '3', 10);
const uri = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();
const grid = await page.evaluate(
  async ([uri, cols, rows]) => {
    const img = new Image();
    img.src = uri;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const out = [];
    for (let r = 0; r < rows; r += 1) {
      const line = [];
      for (let k = 0; k < cols; k += 1) {
        const x = Math.floor((k * c.width) / cols);
        const y = Math.floor((r * c.height) / rows);
        const w = Math.floor(c.width / cols);
        const h = Math.floor(c.height / rows);
        const d = g.getImageData(x, y, w, h).data;
        let sr = 0, sg = 0, sb = 0, n = 0;
        const lums = [];
        for (let i = 0; i < d.length; i += 16) {
          const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          if (lum > 90) continue; // Text und Knöpfe ausklammern
          sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n += 1;
          lums.push(lum);
        }
        const mean = lums.reduce((a, b) => a + b, 0) / (lums.length || 1);
        const sd = Math.sqrt(lums.reduce((a, b) => a + (b - mean) ** 2, 0) / (lums.length || 1));
        line.push({
          rgb: [Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)],
          korn: Number(sd.toFixed(2)),
        });
      }
      out.push(line);
    }
    return { w: c.width, h: c.height, out };
  },
  [uri, cols, rows],
);
await browser.close();

console.log(`${file}  ${grid.w}x${grid.h}`);
for (const line of grid.out) {
  console.log(
    '  ' + line.map((c) => `rgb(${c.rgb.join(',')}) korn ${String(c.korn).padStart(5)}`).join('  |  '),
  );
}
