/**
 * Kurzfassung von krit-tex: linke Gewebekante oben und unten, Achse und
 * Bedeckung. Dieselbe Hochfrequenzmaske wie krit-tex, nur verdichtet,
 * damit ein Durchlauf in drei Zeilen passt.
 *
 * Der weisze Text der Referenz hat ebenfalls harte Kanten und faellt in
 * die Maske. Er steht aber immer LINKS des Gewebes, deshalb bleiben nur
 * Zeilen stehen, deren linke Kante rechts von 45 Prozent liegt.
 *
 *   node _ref2/kante.mjs <bild> <l> <t> <w> <h> [label]
 */
import sharp from 'sharp';
const [file, cx, cy, cw, chh, label] = process.argv.slice(2);
const { data, info } = await sharp(file)
  .extract({ left: +cx, top: +cy, width: +cw, height: +chh })
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

const CS = 8;
const gw = Math.floor(W / CS), gh = Math.floor(H / CS);
const mask = new Uint8Array(gw * gh);
for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
  let s = 0, n = 0, mx = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) for (let x = gx * CS; x < gx * CS + CS; x++) {
    const v = lum[y * W + x]; s += v; n++; if (v > mx) mx = v;
  }
  const m = s / n;
  let cross = 0;
  for (let y = gy * CS; y < gy * CS + CS; y++) {
    let prev = lum[y * W + gx * CS] > m;
    for (let x = gx * CS + 1; x < gx * CS + CS; x++) { const c = lum[y * W + x] > m; if (c !== prev) cross++; prev = c; }
  }
  mask[gy * gw + gx] = (cross >= 8 && mx - m > 4) ? 1 : 0;
}

const rows = 40;
const prof = [];
for (let ri = 0; ri < rows; ri++) {
  const y0 = Math.floor((ri / rows) * gh), y1 = Math.max(y0 + 1, Math.floor(((ri + 1) / rows) * gh));
  const cnt = new Float64Array(gw);
  for (let y = y0; y < y1; y++) for (let x = 0; x < gw; x++) cnt[x] += mask[y * gw + x];
  let tot = 0, ws = 0;
  for (let x = 0; x < gw; x++) { tot += cnt[x]; ws += cnt[x] * x; }
  const need = (y1 - y0) * 0.35;
  let l = -1, r = -1;
  for (let x = 0; x < gw; x++) if (cnt[x] >= need) { if (l < 0) l = x; r = x; }
  let v = 0; const axis = tot > 0 ? ws / tot : -1;
  for (let x = 0; x < gw; x++) v += cnt[x] * (x - axis) ** 2;
  prof.push({
    y: ((y0 + y1) / 2 / gh) * 100,
    l: l < 0 ? null : (l / gw) * 100,
    axis: axis < 0 ? null : (axis / gw) * 100,
    sd: tot > 0 ? (Math.sqrt(v / tot) / gw) * 100 : 0,
    cov: (tot / (gw * (y1 - y0))) * 100,
  });
}
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const band = (lo, hi, key, filt) => med(prof.filter((p) => p.y >= lo && p.y < hi && p[key] != null && (!filt || p.l > 45)).map((p) => p[key]));
const f2 = (v) => (v == null ? '-' : v.toFixed(1));

// Taille: tiefstes Minimum der Streuung
let wi = 0; for (let i = 1; i < prof.length - 1; i++) if (prof[i].sd > 0 && prof[i].sd < prof[wi].sd) wi = i;
const mins = [];
for (let i = 2; i < prof.length - 2; i++)
  if (prof[i].sd > 0 && prof[i].sd <= prof[i - 1].sd && prof[i].sd <= prof[i + 1].sd
      && prof[i].sd < prof[i - 2].sd && prof[i].sd < prof[i + 2].sd)
    mins.push(`${prof[i].y.toFixed(0)}%/${prof[i].sd.toFixed(1)}`);

console.log(`${(label || file).padEnd(22)} linksOben=${f2(band(4, 22, 'l', 1))} linksUnten=${f2(band(74, 93, 'l', 1))}`
  + ` | achseOben=${f2(band(4, 22, 'axis', 1))} achseUnten=${f2(band(74, 93, 'axis', 1))}`
  + ` | bedOben=${f2(band(4, 22, 'cov'))} bedUnten=${f2(band(74, 93, 'cov'))}`
  + ` verh=${(band(74, 93, 'cov') / band(4, 22, 'cov')).toFixed(2)}`
  + ` | taille y=${prof[wi].y.toFixed(1)}% streu=${prof[wi].sd.toFixed(1)}% achse=${f2(prof[wi].axis)}`
  + ` | minima=[${mins.join(' ')}]`);
