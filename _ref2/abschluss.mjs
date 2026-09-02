/**
 * Farbe und Stillstand in einem Durchgang.
 *
 * Auf dieser Maschine kostet jede Aufnahme mehrere Minuten, weil der
 * Arbeitsspeicher knapp ist. Zwei getrennte Laeufe waeren deshalb teuer.
 * Dieses Skript oeffnet die Seite einmal, nimmt sieben Bilder ueber sechzig
 * Sekunden auf und wertet daraus beides aus.
 *
 *   node _ref2/abschluss.mjs [port]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
fs.mkdirSync('_ref2/tmp/ab', { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 180000,
});
// Auf dieser Maschine ist der Arbeitsspeicher knapp und eine feste
// Wartezeit reicht nicht. Ein fruehes Skript griff deshalb auf ein Element
// zu, das noch nicht da war. Jetzt wird ausdruecklich darauf gewartet.
// Auf VORHANDEN warten und nicht auf SICHTBAR. Die Sektion blendet sich
// erst ein, wenn ihr Eintrittsbeobachter ausloest, und der loest erst aus,
// wenn wir hingescrollt haben. Ein Warten auf Sichtbarkeit liefe deshalb
// zwangslaeufig in die Zeitueberschreitung.
await page.waitForSelector('#marketing', { state: 'attached', timeout: 240000 });
await page.waitForTimeout(20000);

for (let i = 0; i < 8; i++) {
  const top = await page.evaluate(() => {
    const se = document.scrollingElement;
    return Math.round(
      document.getElementById('marketing').getBoundingClientRect().top + se.scrollTop,
    );
  });
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top);
  await page.waitForTimeout(900);
  const ist = await page.evaluate(
    () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
  );
  if (Math.abs(ist) <= 6) break;
}
await page.waitForTimeout(3000);

const bilder = [];
for (let i = 0; i < 7; i++) {
  const f = `_ref2/tmp/ab/a${i}.png`;
  await page.screenshot({ path: f });
  bilder.push(f);
  if (i < 6) await page.waitForTimeout(10000);
}
await browser.close();

// ---- Stillstand. Die Silhouette darf sich ueber sechzig Sekunden nicht
// aendern. Gemessen wird die linke Gewebekante je Zeilenband und die Lage
// der Engstelle, beides ueber die Helligkeit.
const profil = async (f) => {
  const { data, info } = await sharp(f)
    .extract({ left: 620, top: 0, width: 806, height: 896 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const zeilen = [];
  for (let b = 0; b < 16; b++) {
    const y0 = Math.floor((b * info.height) / 16);
    const y1 = Math.floor(((b + 1) * info.height) / 16);
    let links = info.width;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < info.width; x++) {
        if (data[y * info.width + x] > 60) { if (x < links) links = x; break; }
      }
    }
    zeilen.push(links === info.width ? -1 : Math.round(((620 + links) / 1426) * 1000) / 10);
  }
  return zeilen;
};

const p = [];
for (const f of bilder) p.push(await profil(f));
console.log('Linke Gewebekante je Zeilenband, in Prozent der Bildbreite:');
p.forEach((z, i) => console.log(`  t=${String(i * 10).padStart(2)}s  ${z.join(' ')}`));

let groesst = 0;
for (let b = 0; b < 16; b++) {
  const w = p.map((z) => z[b]).filter((v) => v >= 0);
  if (w.length < 2) continue;
  const d = Math.max(...w) - Math.min(...w);
  if (d > groesst) groesst = d;
}
console.log('');
console.log(`groeszte Wanderung eines Bandes ueber 60 s: ${groesst.toFixed(1)} Prozentpunkte`);
console.log(groesst <= 1.5 ? 'STILLSTAND BESTANDEN' : 'STILLSTAND NICHT BESTANDEN');

// ---- Farbe, gegen die Referenz im deckungsgleichen Fenster.
const hsv = (r, g, b) => {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const d = M - m;
  let h = 0;
  if (d) {
    if (M === r) h = 60 * (((g - b) / d) % 6);
    else if (M === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, M ? d / M : 0, M];
};

const farbe = async (f, box, tag) => {
  const { data, info } = await sharp(f).extract(box).raw().toBuffer({ resolveWithObject: true });
  const C = info.channels;
  const t = [0, 0, 0, 0, 0];
  let n = 0;
  const sats = [];
  for (let i = 0; i < info.width * info.height; i++) {
    const [h, s, v] = hsv(data[i * C], data[i * C + 1], data[i * C + 2]);
    if (v < 70) continue;
    n++;
    sats.push(s);
    if (v > 235 && s < 0.25) { t[4]++; continue; }
    if (h >= 210 && h < 240) t[1]++;
    else if (h >= 240 && h < 270) t[2]++;
    else if (h >= 270 && h < 300) t[3]++;
  }
  sats.sort((a, b) => a - b);
  const pc = (x) => ((x / n) * 100).toFixed(1) + '%';
  console.log(
    `${tag} 210-240 ${pc(t[1])}  240-270 ${pc(t[2])}  270-300 ${pc(t[3])}  weisz ${pc(t[4])}  Saett ${sats[Math.floor(sats.length / 2)].toFixed(2)}`,
  );
};

const skal = '_ref2/tmp/ab/a0-1085.png';
const meta = await sharp(bilder[0]).metadata();
await sharp(bilder[0])
  .extract({ left: 0, top: 0, width: 1426, height: meta.height })
  .resize(1085)
  .toFile(skal);
console.log('');
await farbe('_ref2/ref26/f007.png', { left: 620, top: 152, width: 420, height: 420 }, 'REFERENZ');
await farbe(skal, { left: 620, top: 100, width: 420, height: 420 }, 'WIR     ');
