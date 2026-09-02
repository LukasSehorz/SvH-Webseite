/**
 * Woher kommt die waagerechte Naht an der Oberkante der Zone?
 *
 * Eine Sitzung, echte Grafikkarte. Der Sprung wird dreimal geschossen:
 * einmal vollstaendig, einmal ohne den Schleier .dnaWash und einmal ohne
 * den Grund .dnaZoneBg. Wer den Sprung malt, verraet sich daran, dass er
 * beim Ausblenden verschwindet.
 *
 *   node _ref2/naht.mjs
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const OUT = '_ref2/tmp';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);

// Oberkante von #marketing auf Bildzeile 350 legen.
for (let pass = 0; pass < 2; pass++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top - 350));
  await page.waitForTimeout(pass === 0 ? 600 : 3000);
}

const varianten = [
  ['voll', ''],
  ['ohneWash', '[class*="dnaWash"] { display: none !important; }'],
  ['ohneZoneBg', '[class*="dnaZoneBg"] { background: none !important; }'],
  ['ohneBeide', '[class*="dnaWash"] { display: none !important; } [class*="dnaZoneBg"] { background: none !important; }'],
];

const profil = async (f) => {
  const { data, info } = await sharp(f)
    .extract({ left: 1150, top: 320, width: 250, height: 80 })
    .raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const rows = [];
  for (let y = 0; y < info.height; y++) {
    let r = 0, g = 0, b = 0;
    for (let x = 0; x < info.width; x++) {
      r += data[(y * info.width + x) * C];
      g += data[(y * info.width + x) * C + 1];
      b += data[(y * info.width + x) * C + 2];
    }
    rows.push([r / info.width, g / info.width, b / info.width]);
  }
  return rows; // Index 0 entspricht Bildzeile 320
};

const erg = {};
for (const [name, css] of varianten) {
  const handle = css ? await page.addStyleTag({ content: css }) : null;
  await page.waitForTimeout(500);
  const f = `${OUT}/naht-${name}.png`;
  await page.screenshot({ path: f });
  const rows = await profil(f);
  // Groeszter Sprung des Blaukanals ueber acht Zeilen im Fenster 330..390
  let best = { dy: 0, y: 0 };
  for (let i = 10; i < rows.length - 8; i++) {
    const d = rows[i + 8][2] - rows[i][2];
    if (d > best.dy) best = { dy: +d.toFixed(1), y: 320 + i };
  }
  erg[name] = {
    sprungBlau: best.dy, beiZeile: best.y,
    y340: rows[20].map((v) => +v.toFixed(1)),
    y356: rows[36].map((v) => +v.toFixed(1)),
    y380: rows[60].map((v) => +v.toFixed(1)),
  };
  if (handle) await page.evaluate((el) => el.remove(), handle);
  await page.waitForTimeout(300);
}
console.log(JSON.stringify(erg, null, 1));
await browser.close();
