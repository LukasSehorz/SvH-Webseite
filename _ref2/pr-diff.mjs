/**
 * Das Gewebe allein, als Unterschied zwischen dem Bild mit Leinwand und
 * dem ohne. In beiden ist die Schrift unsichtbar, es bleibt also nur der
 * Beitrag des Gewebes.
 *
 *   node _ref2/pr-diff.mjs <ordner> <versatz> [...]
 *
 * Ausgegeben werden je Zeilenband die linke Gewebekante in Prozent der
 * Seitenbreite und die Bedeckung, dazu die Taillenzeile und eine Suche
 * nach einer dunklen Wanne quer durchs Bild.
 */
import sharp from 'sharp';

const ordner = process.argv[2];
const versaetze = process.argv.slice(3).map(Number);

const hole = async (f) => {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  return { data, C: info.channels, W: info.width, H: info.height };
};

console.log('versatz  ausgriff  taille_y  taille_breite  bed_gesamt  wanne  zeilen(bed je 50px)');
for (const off of versaetze) {
  const n = String(off).replace('-', 'm');
  const A = await hole(`${ordner}/t${n}.png`);
  const B = await hole(`${ordner}/b${n}.png`);
  const W = A.W, H = A.H, SEITE = W - 15;
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const a = 0.299 * A.data[i * A.C] + 0.587 * A.data[i * A.C + 1] + 0.114 * A.data[i * A.C + 2];
    const b = 0.299 * B.data[i * B.C] + 0.587 * B.data[i * B.C + 1] + 0.114 * B.data[i * B.C + 2];
    d[i] = Math.max(0, a - b);
  }
  const BAND = 20;
  const zeilen = [];
  for (let y0 = 0; y0 + BAND <= H; y0 += BAND) {
    const col = new Float64Array(SEITE);
    for (let y = y0; y < y0 + BAND; y++) for (let x = 0; x < SEITE; x++) col[x] += d[y * W + x];
    for (let x = 0; x < SEITE; x++) col[x] /= BAND;
    const g = new Float64Array(SEITE);
    for (let x = 0; x < SEITE; x++) {
      let s = 0, m = 0;
      for (let k = -10; k <= 10; k++) { const j = x + k; if (j >= 0 && j < SEITE) { s += col[j]; m++; } }
      g[x] = s / m;
    }
    let l = -1, r = -1, an = 0;
    for (let x = 0; x < SEITE; x++) if (g[x] > 3) { if (l < 0) l = x; r = x; }
    for (let y = y0; y < y0 + BAND; y++) for (let x = 0; x < SEITE; x++) if (d[y * W + x] > 6) an += 1;
    zeilen.push({
      y: y0 + BAND / 2,
      links: l < 0 ? null : (100 * l) / SEITE,
      breite: l < 0 ? null : r - l + 1,
      bed: (100 * an) / (SEITE * BAND),
    });
  }
  const mitGewebe = zeilen.filter((z) => z.links != null && z.bed > 3);
  const ausgriff = mitGewebe.length ? Math.min(...mitGewebe.map((z) => z.links)) : null;
  /* Taille: schmalste Stelle mit Gewebe darueber und darunter. */
  let eng = null;
  for (let i = 3; i < zeilen.length - 3; i++) {
    const z = zeilen[i];
    if (z.breite == null || z.bed < 2) continue;
    const o = zeilen.slice(Math.max(0, i - 8), i).some((q) => q.bed > 10);
    const u = zeilen.slice(i + 1, i + 9).some((q) => q.bed > 10);
    if (!o || !u) continue;
    if (!eng || z.breite < eng.breite) eng = z;
  }
  const bed = zeilen.map((z) => z.bed);
  let wanne = null;
  for (let i = 5; i < zeilen.length - 5; i++) {
    const o = Math.max(...bed.slice(i - 5, i));
    const u = Math.max(...bed.slice(i + 1, i + 6));
    const tief = Math.min(o, u) - bed[i];
    if (tief > 10 && (!wanne || tief > wanne.tief))
      wanne = { y: zeilen[i].y, bed: +bed[i].toFixed(1), tief: +tief.toFixed(1) };
  }
  const kurz = zeilen.filter((z, i) => i % 5 === 0).map((z) => `${z.y}:${z.bed.toFixed(0)}`).join(' ');
  console.log(`${String(off).padStart(5)}  ${ausgriff == null ? '  --  ' : ausgriff.toFixed(1).padStart(6)}`
    + `  ${eng ? String(eng.y).padStart(6) : '    --'}  ${eng ? String(eng.breite).padStart(10) : '        --'}`
    + `  ${(bed.reduce((a, b) => a + b, 0) / bed.length).toFixed(1).padStart(8)}`
    + `  ${wanne ? JSON.stringify(wanne) : 'keine'}`);
  console.log(`        ${kurz}`);
}
