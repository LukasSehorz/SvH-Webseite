/**
 * Der ANTEIL LEUCHTENDER FLAECHE und die Perzentilleiter in einem Fenster.
 *
 *   node _ref2/flaeche.mjs <bild> <x,y,b,h> [marke]
 *
 * Der Sockel wird aus dem Bild selbst genommen, naemlich als 5. Perzentil
 * des Fensters; damit haengt die Messung nicht am Grundton der jeweiligen
 * Seite. Als leuchtend zaehlt, was mehr als zwoelf Stufen ueber dem Sockel
 * liegt, denn das ist rund das Dreifache des Rauschens beider Seiten.
 *
 * Ausgegeben werden zusaetzlich die Perzentile ueber dem Sockel, denn der
 * Eindruck der Praesenz haengt am MITTELFELD und nicht am Spitzenwert.
 */
import { grau, fenster, perzentil, mittel } from './mess/lib.mjs';

const F = process.argv[2];
const [X, Y, B, H] = (process.argv[3] || '900,60,500,780').split(',').map(Number);
const MARKE = process.argv[4] || F;
const UEBER = Number(process.env.UEBER || 12);

const { g, b, h } = await grau(F);
const w = fenster(g, b, h, X, Y, B, H);
const sockel = perzentil(w, 5);
let leucht = 0;
for (let i = 0; i < w.length; i++) if (w[i] - sockel > UEBER) leucht++;
const p = (q) => (perzentil(w, q) - sockel).toFixed(1).padStart(6);
console.log(
  `${MARKE.padEnd(18)} sockel ${sockel.toFixed(1).padStart(5)}   ` +
  `leuchtende flaeche ${((100 * leucht) / w.length).toFixed(1).padStart(5)}%   ` +
  `mittel ueber sockel ${(mittel(w) - sockel).toFixed(1).padStart(5)}   ` +
  `p50 ${p(50)}  p75 ${p(75)}  p90 ${p(90)}  p99 ${p(99)}  p99.9 ${p(99.9)}`,
);
