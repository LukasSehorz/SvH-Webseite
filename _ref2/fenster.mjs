/**
 * Ermittelt auf dem Mac den groszen Nebenschirm und schreibt seine Lage
 * nach _ref2/fenster.json, damit browser.mjs jedes Chromium-Fenster dort
 * oeffnet statt auf dem Schirm, an dem der Auftraggeber gerade arbeitet.
 *
 *   node _ref2/fenster.mjs
 *
 * Die Lage kommt aus CoreGraphics ueber ein kleines Swift-Skript, denn
 * weder system_profiler noch das mitgelieferte Python kennen die
 * Anordnung der Schirme. Gewaehlt wird der groeszte Schirm, der nicht der
 * Hauptschirm ist; gibt es keinen, bleibt die Datei weg und die Fenster
 * oeffnen wie bisher. Die json liegt in git ignoriert, weil sie zur
 * Maschine gehoert und nicht zum Projekt.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'darwin') {
  console.log('Nur fuer macOS gedacht, nichts geschrieben.');
  process.exit(0);
}

const swift = `import CoreGraphics
var count: UInt32 = 0
var ids = [CGDirectDisplayID](repeating: 0, count: 8)
CGGetActiveDisplayList(8, &ids, &count)
let main = CGMainDisplayID()
for i in 0..<Int(count) {
  let b = CGDisplayBounds(ids[i])
  print("\\(Int(b.origin.x)) \\(Int(b.origin.y)) \\(Int(b.size.width)) \\(Int(b.size.height)) \\(ids[i] == main ? 1 : 0)")
}
`;
const ordner = mkdtempSync(path.join(tmpdir(), 'schirme-'));
const datei = path.join(ordner, 'schirme.swift');
writeFileSync(datei, swift);
const zeilen = execFileSync('swift', [datei], { encoding: 'utf8' }).trim().split('\n');
unlinkSync(datei);

const schirme = zeilen.map((z) => {
  const [x, y, w, h, main] = z.trim().split(/\s+/).map(Number);
  return { x, y, w, h, main: main === 1 };
});
for (const s of schirme) console.log(`${s.main ? 'Haupt ' : 'Neben '} x=${s.x} y=${s.y} ${s.w}x${s.h}`);

const neben = schirme.filter((s) => !s.main).sort((a, b) => b.w * b.h - a.w * a.h)[0];
const ziel = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fenster.json');
if (!neben) {
  console.log('Kein Nebenschirm, fenster.json bleibt weg.');
  process.exit(0);
}
// Vierzig Bildpunkte Rand, damit das Fenster nicht an der Kante klebt, und
// eine Groesze, die auch bei einem Fenster mit Rahmen auf den Schirm passt.
const lage = {
  x: neben.x + 40,
  y: neben.y + 40,
  w: Math.min(1600, neben.w - 80),
  h: Math.min(1000, neben.h - 120),
};
writeFileSync(ziel, JSON.stringify(lage, null, 2) + '\n');
console.log('geschrieben', ziel, JSON.stringify(lage));
