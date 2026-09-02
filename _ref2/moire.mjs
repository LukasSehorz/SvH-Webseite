/**
 * Das MOIRE eines Gewebefensters, gemessen als langwellige Schwebung.
 *
 * Der Grund fuer dieses Werkzeug neben _ref2/gitter.mjs. Jenes sucht die
 * kuerzesten Gittervektoren und reicht nur bis zu einer Verschiebung von
 * 26 Bildpunkten; ein Moire ist aber gerade das, was VIEL langwelliger
 * ist als das Raster, naemlich die Schwebung zwischen dem Punktraster und
 * dem Bildpunktraster. Es steht im Bild als breites diagonales
 * Streifenmuster, waehrend das Raster selbst bei drei bis vier
 * Bildpunkten liegt.
 *
 * Gemessen wird deshalb in einem Bandpass. Abgezogen wird einmal eine
 * enge Glaettung, die das Punktraster selbst wegnimmt, und einmal eine
 * weite, die den echten Helligkeitsverlauf der Struktur wegnimmt. Was
 * dazwischen stehen bleibt, sind genau die Wellen von acht bis fuenfzig
 * Bildpunkten Laenge, und das ist der Bereich des Moires.
 *
 * Ausgegeben werden drei Zahlen.
 *
 *   welle    der quadratische Mittelwert des Bandpasses in Helligkeits-
 *            stufen. Er sagt, WIE STARK die Schwebung ist.
 *   richtung die Vorzugsrichtung und die Wellenlaenge des staerksten
 *            Nebenmaximums der Autokorrelation des Bandpasses.
 *   buendel  wie stark die Schwebung in EINER Richtung gebuendelt ist,
 *            also der Wert dieses Nebenmaximums. Ein Streifenmuster hat
 *            einen hohen Wert, gleichmaesziges Rauschen einen niedrigen.
 *
 * Die letzte Zahl ist die entscheidende. Rauschen stoert das Auge kaum,
 * ein gerichtetes Streifenmuster dagegen sehr.
 *
 *   node _ref2/moire.mjs <bild> <l> <t> <w> <h> [marke]
 */
import sharp from 'sharp';

const [file, l, t, w, h, label] = process.argv.slice(2);
const L = +l, T = +t, W = +w, H = +h;

const { data, info } = await sharp(file)
  .extract({ left: L, top: T, width: W, height: H })
  .raw().toBuffer({ resolveWithObject: true });
const C = info.channels;

const lum = new Float64Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.299 * data[i * C] + 0.587 * data[i * C + 1] + 0.114 * data[i * C + 2];

/* Trennbare Kastenglaettung, zweimal hintereinander angewandt. Zweimal
 * ergibt ein Dreiecksfenster und damit einen deutlich saubereren Abfall
 * im Frequenzbereich als ein einzelner Kasten, dessen Nebenzipfel sonst
 * selbst Streifen vortaeuschen koennten. */
const glatt = (src, R) => {
  let a = src;
  for (let durchgang = 0; durchgang < 2; durchgang++) {
    const zeile = new Float64Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const j = x + k; if (j >= 0 && j < W) { s += a[y * W + j]; n++; } }
      zeile[y * W + x] = s / n;
    }
    const b = new Float64Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const j = y + k; if (j >= 0 && j < H) { s += zeile[j * W + x]; n++; } }
      b[y * W + x] = s / n;
    }
    a = b;
  }
  return a;
};

/* Der enge Halbmesser von drei ergibt mit dem doppelten Durchgang ein
 * Fenster von dreizehn Bildpunkten und loescht damit das Punktraster von
 * drei bis vier Bildpunkten vollstaendig. Der weite von achtzehn laeszt
 * alles stehen, was laenger als etwa fuenfzig Bildpunkte ist, und das ist
 * der echte Verlauf der Struktur. */
const eng = glatt(lum, 3);
const weit = glatt(eng, 18);
const band = new Float64Array(W * H);
for (let i = 0; i < W * H; i++) band[i] = eng[i] - weit[i];

/* Der Rand ist unbrauchbar, weil die Glaettung dort ueber weniger
 * Nachbarn mittelt und deshalb einen kuenstlichen Saum erzeugt. */
const M = 40;
const IW = W - 2 * M, IH = H - 2 * M;
const inn = new Float64Array(IW * IH);
for (let y = 0; y < IH; y++) for (let x = 0; x < IW; x++)
  inn[y * IW + x] = band[(y + M) * W + (x + M)];

let s2 = 0;
for (let i = 0; i < IW * IH; i++) s2 += inn[i] * inn[i];
const welle = Math.sqrt(s2 / (IW * IH));

/* Normierte Autokorrelation des Bandpasses. Gesucht ist das staerkste
 * oertliche Hoechstmasz jenseits von sechs Bildpunkten; dort steht die
 * Wellenlaenge und die Richtung der Schwebung. */
const LAG = 34;
const AW = 2 * LAG + 1;
const ac = new Float64Array(AW * AW);
const at = (dx, dy) => ac[(dy + LAG) * AW + (dx + LAG)];
for (let dy = 0; dy <= LAG; dy++) {
  for (let dx = -LAG; dx <= LAG; dx++) {
    let s = 0, sa = 0, sb = 0, n = 0;
    const y0 = Math.max(0, -dy), y1 = Math.min(IH, IH - dy);
    const x0 = Math.max(0, -dx), x1 = Math.min(IW, IW - dx);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const a = inn[y * IW + x], b = inn[(y + dy) * IW + (x + dx)];
      s += a * b; sa += a * a; sb += b * b; n++;
    }
    const v = n > 0 && sa > 0 && sb > 0 ? s / Math.sqrt(sa * sb) : 0;
    ac[(dy + LAG) * AW + (dx + LAG)] = v;
    ac[(-dy + LAG) * AW + (-dx + LAG)] = v;
  }
}

let best = null;
for (let dy = -LAG + 1; dy <= LAG - 1; dy++) {
  for (let dx = -LAG + 1; dx <= LAG - 1; dx++) {
    const r = Math.hypot(dx, dy);
    if (r < 6 || r > LAG - 1) continue;
    if (dy < 0 || (dy === 0 && dx < 0)) continue;
    const v = at(dx, dy);
    let top = true;
    for (let jy = -1; jy <= 1 && top; jy++) for (let jx = -1; jx <= 1; jx++) {
      if (jx === 0 && jy === 0) continue;
      if (at(dx + jx, dy + jy) > v) { top = false; break; }
    }
    if (!top) continue;
    if (!best || v > best.v) best = { dx, dy, v, r };
  }
}

const grad = best ? (Math.atan2(-best.dy, best.dx) * 180 / Math.PI).toFixed(1) : '-';
console.log(`${(label || `${file} ${L},${T}`).padEnd(24)}`
  + ` welle=${welle.toFixed(2)} stufen`
  + `  buendel=${best ? best.v.toFixed(3) : '-'}`
  + `  richtung=${grad}deg laenge=${best ? (2 * best.r).toFixed(1) : '-'}px`
  + `  (nebenmax bei ${best ? `${best.dx},${best.dy}` : '-'})`);
