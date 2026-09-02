/** Tatsaechliche Punktverschiebung zwischen zwei Bildern.
 *  Blockvergleich ueber ein Gitter, Ausgabe in Bildpunkten.
 *   node _ref2/flow.mjs <a> <b> --crop=l,t,w,h [--max=10] [--dt=333] */
import sharp from 'sharp';
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const [fa, fb] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [l, t, w, h] = (flags.crop || '0,0,400,600').split(',').map(Number);
const M = parseInt(flags.max || '10', 10);
const dt = parseFloat(flags.dt || '333');
const load = async (f) =>
  (await sharp(f).extract({ left: l, top: t, width: w, height: h }).greyscale()
    .raw().toBuffer({ resolveWithObject: true }));
const A = await load(fa), B = await load(fb);
const W = A.info.width, H = A.info.height;
const a = A.data, b = B.data;
const BS = 32;
const res = [];
const sx = [];
const sy = [];
for (let by = M; by + BS + M < H; by += BS) {
  for (let bx = M; bx + BS + M < W; bx += BS) {
    // Nur Bloecke mit Struktur
    let mn = 255, mx = 0;
    for (let y = by; y < by + BS; y += 2) for (let x = bx; x < bx + BS; x += 2) {
      const v = a[y * W + x]; if (v < mn) mn = v; if (v > mx) mx = v;
    }
    if (mx - mn < 25) continue;
    let bd = 1e18, bdx = 0, bdy = 0;
    for (let dy = -M; dy <= M; dy++) for (let dx = -M; dx <= M; dx++) {
      let s = 0;
      for (let y = by; y < by + BS; y += 2) for (let x = bx; x < bx + BS; x += 2)
        s += Math.abs(a[y * W + x] - b[(y + dy) * W + x + dx]);
      if (s < bd) { bd = s; bdx = dx; bdy = dy; }
    }
    res.push(Math.hypot(bdx, bdy));
    // Zusaetzlich die VORZEICHENBEHAFTETE Verschiebung. Der Betrag allein
    // sagt nichts darueber, wohin das Gewebe wandert; fuer den Vergleich
    // mit der Referenz braucht es aber die Richtung.
    sx.push(bdx);
    sy.push(bdy);
  }
}
res.sort((x, y) => x - y);
sx.sort((x, y) => x - y);
sy.sort((x, y) => x - y);
const med = res.length ? res[Math.floor(res.length / 2)] : 0;
const p75 = res.length ? res[Math.floor(res.length * 0.75)] : 0;
const mdx = sx.length ? sx[Math.floor(sx.length / 2)] : 0;
const mdy = sy.length ? sy[Math.floor(sy.length / 2)] : 0;
console.log(JSON.stringify({
  a: fa.split(/[\\/]/).pop(), b: fb.split(/[\\/]/).pop(), blocks: res.length,
  medianPx: +med.toFixed(2), p75Px: +p75.toFixed(2),
  pxPerSec: +((med / dt) * 1000).toFixed(1),
  medDx: mdx, medDy: mdy,
}));
