/** Silhouette um eine bekannte Achse und Taille.
 *   node _ref2/silhouette.mjs <bild> --axis=1066 --waist=419 [--thr=7]
 *  Gibt je Abstand von der Taille die linke und rechte Kante des
 *  Gewebes an, gemessen an einem ueber 15 Punkte laufenden Mittel. */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const axis = parseInt(flags.axis, 10);
const waist = parseInt(flags.waist, 10);
const thr = parseFloat(flags.thr || '7');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const { data, info } = await sharp(f).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const rows = {};
  for (const dy of [-300, -200, -120, -60, 0, 60, 120, 200, 300]) {
    const y0 = waist + dy - 6, y1 = waist + dy + 6;
    if (y0 < 0 || y1 >= H) { rows[dy] = null; continue; }
    // Spaltenmittel ueber das Zeilenband, dann ueber 15 Spalten glaetten
    const col = new Float64Array(W);
    for (let x = 0; x < W; x++) {
      let s = 0; for (let y = y0; y <= y1; y++) s += data[y * W + x];
      col[x] = s / (y1 - y0 + 1);
    }
    const sm = new Float64Array(W);
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -7; k <= 7; k++) { const j = x + k; if (j >= 0 && j < W) { s += col[j]; n++; } }
      sm[x] = s / n;
    }
    const sorted = Float64Array.from(sm).sort();
    const base = sorted[Math.floor(W * 0.15)];
    let lo = -1, hi = -1;
    for (let x = 0; x < W; x++) if (sm[x] > base + thr) { lo = x; break; }
    for (let x = W - 1; x >= 0; x--) if (sm[x] > base + thr) { hi = x; break; }
    rows[dy] = lo < 0 ? null : { lo, hi, leftPct: +((lo / W) * 100).toFixed(1), halfL: axis - lo, halfR: hi - axis };
  }
  console.log(f.split(/[\\/]/).pop());
  for (const [k, v] of Object.entries(rows)) console.log('  dy', k.padStart(5), v ? JSON.stringify(v) : '-');
}
