/**
 * Legt zwei Bilder nebeneinander in eine Datei, damit sie in einem Blick
 * verglichen werden können.
 *
 *   node _ref2/side-by-side.mjs <linksPng> <rechtsPng> <outPng> [linksTitel] [rechtsTitel]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const [, , leftPath, rightPath, outPath, leftTitle = 'unsere Seite', rightTitle = 'Referenz'] =
  process.argv;

const toUri = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#1b1b1b;font:600 13px/1.4 system-ui,sans-serif;color:#ddd}
  .row{display:flex;gap:2px}
  .col{flex:1;min-width:0}
  .cap{padding:8px 10px;background:#111}
  img{display:block;width:100%;height:auto}
</style></head><body>
  <div class="row">
    <div class="col"><div class="cap">${leftTitle}</div><img src="${toUri(leftPath)}"></div>
    <div class="col"><div class="cap">${rightTitle}</div><img src="${toUri(rightPath)}"></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.setContent(html);
await page.waitForTimeout(400);
await page.locator('.row').screenshot({ path: outPath });
await browser.close();
console.log(outPath);
