/**
 * Lesbarkeit, gemessen am PAAR aus Bild mit und ohne Schrift.
 *
 *   node _ref2/pr-lesbar2.mjs <versatz> [...]
 *
 * Erwartet _ref2/tmp/pr/s<versatz>.png mit Schrift, _ref2/tmp/pr/g<versatz>.png
 * ohne Schrift und _ref2/tmp/pr/kaesten.json mit den Kaesten.
 *
 * Ausgegeben werden je Textzeile
 *   grund     Mittelwert des Grundes im Kasten
 *   streuung  Standardabweichung des Grundes, Ziel hoechstens 3 Stufen
 *   grundMax  hellster Grundbildpunkt, Ziel hoechstens 120
 *   schrift   Helligkeit der Schriftfarbe aus dem Stilblatt
 *   wcag      Kontrastverhaeltnis Schrift gegen mittleren Grund
 */
import sharp from 'sharp';
import fs from 'fs';

const OUT = '_ref2/tmp/pr';
const alles = JSON.parse(fs.readFileSync(`${OUT}/kaesten.json`, 'utf8'));
const versaetze = process.argv.slice(2).map(Number);

const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

for (const off of versaetze) {
  const eintrag = alles.find((a) => a.off === off);
  if (!eintrag || !eintrag.kaesten) { console.log(`Versatz ${off}: keine Kaesten`); continue; }
  const name = String(off).replace('-', 'm');
  const grundBild = `${OUT}/g${name}.png`;
  const { data, info } = await sharp(grundBild).raw().toBuffer({ resolveWithObject: true });
  const C = info.channels, BW = info.width;

  console.log('');
  console.log(`===== Versatz ${off} =====`);
  console.log('  Text'.padEnd(46) + 'grund streu grundMax  p999  schrift  wcag');
  const schlimm = [];
  for (const k of eintrag.kaesten) {
    /* Nur der Teil des Kastens, der in der rechten Bildhaelfte liegt.
       Links davon steht kein Gewebe und der Wert waere geschoenter. */
    const l = Math.max(k.l, 0), t = Math.max(k.t, 0);
    const w = Math.min(k.w - (l - k.l), BW - l), h = Math.min(k.h, info.height - t);
    if (w < 8 || h < 5) continue;
    const werte = [];
    let mx = 0;
    for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
      const i = (y * BW + x) * C;
      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      werte.push(L);
      if (L > mx) mx = L;
    }
    const m = werte.reduce((a, b) => a + b, 0) / werte.length;
    const sd = Math.sqrt(werte.reduce((a, b) => a + (b - m) ** 2, 0) / werte.length);
    const sortiert = werte.slice().sort((a, b) => a - b);
    const p999 = sortiert[Math.min(sortiert.length - 1, Math.floor(0.999 * sortiert.length))];

    /* Der Grund als Farbe fuer WCAG. */
    let sr = 0, sg = 0, sb = 0;
    for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
      const i = (y * BW + x) * C; sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
    }
    const n = w * h;
    const Yg = relLum(sr / n, sg / n, sb / n);
    const mm = /rgba?\(([^)]+)\)/.exec(k.farbe);
    const [fr, fg, fb] = mm ? mm[1].split(',').map((v) => parseFloat(v)) : [255, 255, 255];
    const Ys = relLum(fr, fg, fb);
    const schriftL = 0.299 * fr + 0.587 * fg + 0.114 * fb;
    const wcag = (Math.max(Ys, Yg) + 0.05) / (Math.min(Ys, Yg) + 0.05);

    const zeile = `  ${k.text.slice(0, 42).padEnd(44)}${m.toFixed(1).padStart(5)}`
      + `${sd.toFixed(1).padStart(6)}${mx.toFixed(0).padStart(9)}${p999.toFixed(0).padStart(6)}`
      + `${schriftL.toFixed(0).padStart(9)}${wcag.toFixed(1).padStart(6)}`
      + (mx > schriftL ? '  GRUND HELLER ALS SCHRIFT' : '')
      + (sd > 3 ? '  STREUUNG' : '') + (mx > 120 ? '  GRUNDMAX' : '');
    console.log(zeile);
    if (mx > 120 || sd > 3) schlimm.push({ text: k.text.slice(0, 40), sd: +sd.toFixed(1), mx: Math.round(mx) });
  }
  console.log(`  verletzt: ${schlimm.length} von ${eintrag.kaesten.length} Zeilen`);
}
