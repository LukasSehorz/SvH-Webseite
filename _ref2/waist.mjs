/**
 * Findet die Taille (hellster kompakter Fleck) und misst die Silhouette.
 *   node _ref2/waist.mjs <bild...> [--crop=l,t,w,h]
 * Ausgabe: Taillenposition in Prozent, halbe Bandbreite in mehreren
 * Abstaenden ueber/unter der Taille -> Oeffnungswinkel.
 */
import sharp from 'sharp';

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));

for (const file of files) {
  let img = sharp(file);
  let ox = 0, oy = 0;
  if (flags.crop) {
    const [l, t, w, h] = flags.crop.split(',').map(Number);
    img = img.extract({ left: l, top: t, width: w, height: h });
    ox = l; oy = t;
  }
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++)
    lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];
  const s = Float32Array.from(lum).sort();
  const floor = s[Math.floor(s.length * 0.10)];
  const thr = floor + 14;

  // Zeilenweise: Schwerpunkt + Ausdehnung der Punkte ueber Schwelle
  const rows = [];
  for (let y = 0; y < H; y++) {
    let n = 0, sx = 0, lo = 1e9, hi = -1;
    for (let x = 0; x < W; x++) {
      if (lum[y * W + x] > thr) { n++; sx += x; if (x < lo) lo = x; if (x > hi) hi = x; }
    }
    rows.push({ y, n, cx: n ? sx / n : NaN, lo, hi, w: n ? hi - lo : 0 });
  }
  // Taille: Zeile mit dem hellsten Maximum
  let by = 0, bv = -1;
  for (let y = 4; y < H - 4; y++) {
    let mx = 0;
    for (let x = 0; x < W; x++) mx = Math.max(mx, lum[y * W + x]);
    // glaetten ueber 5 Zeilen
    if (mx > bv) { bv = mx; by = y; }
  }
  // Silhouettenbreite in Abstaenden von der Taille
  const probe = (dy) => {
    const y = by + dy;
    if (y < 0 || y >= H) return null;
    let acc = 0, cnt = 0;
    for (let k = -3; k <= 3; k++) {
      const r = rows[y + k];
      if (r && r.n > 3) { acc += r.w; cnt++; }
    }
    return cnt ? Math.round(acc / cnt) : 0;
  };
  // Gesamtausdehnung
  let gLo = 1e9, gHi = -1;
  for (const r of rows) if (r.n > 3) { gLo = Math.min(gLo, r.lo); gHi = Math.max(gHi, r.hi); }

  console.log(
    file.split(/[\\/]/).pop().padEnd(12),
    JSON.stringify({
      waist: { xPct: +(((rows[by].cx) / W) * 100).toFixed(1), yPct: +((by / H) * 100).toFixed(1), px: `${Math.round(ox + (rows[by].cx || 0))},${oy + by}` },
      extent: { loPct: +((gLo / W) * 100).toFixed(1), hiPct: +((gHi / W) * 100).toFixed(1) },
      widthAt: { m200: probe(-200), m100: probe(-100), m40: probe(-40), w0: probe(0), p40: probe(40), p100: probe(100), p200: probe(200) },
    }),
  );
}
