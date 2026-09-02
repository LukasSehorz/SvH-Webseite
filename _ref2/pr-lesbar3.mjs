/**
 * Lesbarkeit aus dem Bildpaar t (Schrift unsichtbar) und c (Leinwand aus).
 *
 *   node _ref2/pr-lesbar3.mjs <ordner> <versatz> [...]
 *
 * Je Textzeile in der rechten Bildhaelfte werden ausgewiesen
 *   grund      Mittelwert des Grundes im Kasten, Gewebe eingeschlossen
 *   streuung   Standardabweichung des Grundes, Ziel hoechstens 3 Stufen
 *   grundMax   hellster Grundbildpunkt, Ziel hoechstens 120
 *   grundP999  99,9. Perzentil des Grundes
 *   schriftMax hellster Bildpunkt der Schrift ohne Gewebe
 *   wcag       Kontrast der Schrift gegen den mittleren Grund
 */
import sharp from 'sharp';
import fs from 'fs';

const ordner = process.argv[2];
const versaetze = process.argv.slice(3).map(Number);
const alles = JSON.parse(fs.readFileSync(`${ordner}/fein.json`, 'utf8'));

const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

const hole = async (f) => {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  return { data, C: info.channels, W: info.width, H: info.height };
};

for (const off of versaetze) {
  const e = alles.find((a) => a.off === off);
  if (!e) { console.log(`Versatz ${off}: nichts`); continue; }
  const name = String(off).replace('-', 'm');
  const G = await hole(`${ordner}/t${name}.png`);
  const S = await hole(`${ordner}/c${name}.png`);

  console.log('');
  console.log(`===== Versatz ${off} =====`);
  console.log('  Text'.padEnd(46) + ' px  grund streu grundMax p999 schriftMax  wcag  Urteil');
  let verletzt = 0, gezaehlt = 0;
  for (const roh of e.kaesten) {
    /* Mit der Umgebungsvariablen ZEILE wird der Kasten der SCHRIFT
       genommen statt der des Elementes. Eine Aufzaehlungszeile fuellt
       naemlich die ganze Inhaltsspalte von 590 Bildpunkten, waehrend die
       Buchstaben nur ueber die ersten 270 bis 350 reichen. Der Rest liegt
       im dichten Gewebe rechts der Achse und traegt zur Lesbarkeit nichts
       bei, hebt den gemessenen Hoechstwert aber auf 255. */
    const k = process.env.ZEILE && roh.zeile ? { ...roh.zeile, text: roh.text, groesze: roh.groesze } : roh;
    /* Nur Kaesten, die in die rechte Bildhaelfte hineinreichen. */
    if (k.rechts < G.W * 0.46) continue;
    const l = Math.max(0, k.l), t = Math.max(0, k.t);
    const w = Math.min(k.w - (l - k.l), G.W - l - 1), h = Math.min(k.h, G.H - t - 1);
    if (w < 8 || h < 5) continue;
    gezaehlt += 1;

    const werte = []; let gmax = 0, sr = 0, sg = 0, sb = 0;
    let smax = 0;
    for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
      const i = (y * G.W + x) * G.C;
      const L = 0.299 * G.data[i] + 0.587 * G.data[i + 1] + 0.114 * G.data[i + 2];
      werte.push(L); if (L > gmax) gmax = L;
      sr += G.data[i]; sg += G.data[i + 1]; sb += G.data[i + 2];
      const j = (y * S.W + x) * S.C;
      const M = 0.299 * S.data[j] + 0.587 * S.data[j + 1] + 0.114 * S.data[j + 2];
      if (M > smax) smax = M;
    }
    const n = w * h;
    const m = werte.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(werte.reduce((a, b) => a + (b - m) ** 2, 0) / n);
    const so = werte.slice().sort((a, b) => a - b);
    const p999 = so[Math.min(n - 1, Math.floor(0.999 * n))];

    /* Die Schriftfarbe aus dem Bild ohne Gewebe, ueber die hellsten
       Bildpunkte des Kastens gemittelt, damit Kantenglaettung nicht
       verfaelscht. */
    const hell = [];
    for (let y = t; y < t + h; y++) for (let x = l; x < l + w; x++) {
      const j = (y * S.W + x) * S.C;
      const M = 0.299 * S.data[j] + 0.587 * S.data[j + 1] + 0.114 * S.data[j + 2];
      if (M > smax - 12) hell.push([S.data[j], S.data[j + 1], S.data[j + 2]]);
    }
    const hm = hell.length ? hell.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]).map((v) => v / hell.length) : [255, 255, 255];
    const Ys = relLum(hm[0], hm[1], hm[2]);
    const Yg = relLum(sr / n, sg / n, sb / n);
    const wcag = (Math.max(Ys, Yg) + 0.05) / (Math.min(Ys, Yg) + 0.05);

    const marken = [];
    if (sd > 3) marken.push('STREUUNG');
    if (gmax > 120) marken.push('GRUNDMAX');
    if (gmax > smax) marken.push('GRUND>SCHRIFT');
    if (wcag < 4.5) marken.push('WCAG');
    if (marken.length) verletzt += 1;
    console.log(`  ${k.text.slice(0, 42).padEnd(44)}${String(k.groesze).replace('px', '').padStart(4)}`
      + `${m.toFixed(1).padStart(7)}${sd.toFixed(1).padStart(6)}${gmax.toFixed(0).padStart(9)}`
      + `${p999.toFixed(0).padStart(6)}${smax.toFixed(0).padStart(10)}${wcag.toFixed(1).padStart(7)}  ${marken.join(' ')}`);
  }
  console.log(`  verletzt: ${verletzt} von ${gezaehlt} Zeilen im rechten Feld`);
}
