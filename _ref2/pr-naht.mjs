/* Waagerechte Naht im reinen Gewebe. Sucht den groeszten Sprung des
   Zeilenmittels ueber sechs Zeilen, nur rechts der Mitte und ohne die
   obersten und untersten Bildzeilen, damit Leiste und Fuszzeile
   herausfallen.  node _ref2/pr-naht.mjs <ordner> <versatz> [...] */
import sharp from 'sharp';
const ordner = process.argv[2];
const hole = async (f) => { const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true }); return { data, C: info.channels, W: info.width, H: info.height }; };
for (const off of process.argv.slice(3).map(Number)) {
  const n = String(off).replace('-', 'm');
  const A = await hole(`${ordner}/t${n}.png`); const B = await hole(`${ordner}/b${n}.png`);
  const W = A.W, H = A.H, X0 = Math.round(W * 0.5), X1 = W - 15;
  const zeile = new Float64Array(H);
  for (let y = 0; y < H; y++) { let s = 0; for (let x = X0; x < X1; x++) { const i = (y * W + x); const a = 0.299 * A.data[i * A.C] + 0.587 * A.data[i * A.C + 1] + 0.114 * A.data[i * A.C + 2]; const b = 0.299 * B.data[i * B.C] + 0.587 * B.data[i * B.C + 1] + 0.114 * B.data[i * B.C + 2]; s += Math.max(0, a - b); } zeile[y] = s / (X1 - X0); }
  let best = { d: 0, y: 0 };
  for (let y = 90; y < H - 96; y++) { const d = Math.abs(zeile[y + 6] - zeile[y]); if (d > best.d) best = { d: +d.toFixed(2), y }; }
  /* Groeszte Steigung ueber 30 Zeilen, also eine breitere Kante. */
  let best30 = { d: 0, y: 0 };
  for (let y = 90; y < H - 120; y++) { const d = Math.abs(zeile[y + 30] - zeile[y]); if (d > best30.d) best30 = { d: +d.toFixed(2), y }; }
  console.log(`versatz ${String(off).padStart(5)}  groeszter Sprung ueber 6 Zeilen = ${best.d} Stufen bei y=${best.y}`
    + `   ueber 30 Zeilen = ${best30.d} bei y=${best30.y}   Mittel des Gewebes = ${(zeile.reduce((a, b) => a + b, 0) / H).toFixed(1)}`);
}
