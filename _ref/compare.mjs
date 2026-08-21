/**
 * Erzeugt Seite-an-Seite-Vergleiche: links die Referenz (apex-consulting.ai),
 * rechts der Nachbau. So lässt sich in einem Bild prüfen, ob Layout, Typo-Größen,
 * Abstände und Farben stimmen.
 *
 *   node _ref/compare.mjs <refDir> <ourDir> <outDir>
 *
 * Beispiel:
 *   node _ref/compare.mjs "C:/…/scratchpad/ref" _ref/shots/desktop _ref/shots/diff-desktop
 *
 * Gepaart wird nach der laufenden Nummer im Dateinamen (00_, 01_, …), nicht nach
 * dem Scroll-Wert — die Seiten sind unterschiedlich hoch.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const [refDir, ourDir, outDir] = process.argv.slice(2);
if (!refDir || !ourDir || !outDir) {
  console.error('Aufruf: node _ref/compare.mjs <refDir> <ourDir> <outDir>');
  process.exit(1);
}
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const strips = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => /^\d\d_y\d+\.png$/.test(f))
    .sort();

const refs = strips(refDir);
const ours = strips(ourDir);
const GAP = 16;
const LABEL = 34;

for (let i = 0; i < Math.max(refs.length, ours.length); i++) {
  const a = refs[i] ? path.join(refDir, refs[i]) : null;
  const b = ours[i] ? path.join(ourDir, ours[i]) : null;
  if (!a && !b) continue;

  const metaA = a ? await sharp(a).metadata() : { width: 0, height: 0 };
  const metaB = b ? await sharp(b).metadata() : { width: 0, height: 0 };
  const h = Math.max(metaA.height || 0, metaB.height || 0);
  const w = (metaA.width || 0) + GAP + (metaB.width || 0);

  const layers = [];
  if (a) layers.push({ input: await sharp(a).toBuffer(), left: 0, top: LABEL });
  if (b) layers.push({ input: await sharp(b).toBuffer(), left: (metaA.width || 0) + GAP, top: LABEL });

  const labelSvg = Buffer.from(
    `<svg width="${w}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
       <rect width="${w}" height="${LABEL}" fill="#101820"/>
       <text x="12" y="23" font-family="Arial" font-size="15" fill="#7CE0FF">REFERENZ — apex-consulting.ai  ·  Streifen ${i}</text>
       <text x="${(metaA.width || 0) + GAP + 12}" y="23" font-family="Arial" font-size="15" fill="#8CFFB0">NACHBAU — SVH Consulting  ·  Streifen ${i}</text>
     </svg>`
  );
  layers.unshift({ input: labelSvg, left: 0, top: 0 });

  await sharp({
    create: { width: w, height: h + LABEL, channels: 3, background: '#1b232a' },
  })
    .composite(layers)
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outDir, `cmp-${String(i).padStart(2, '0')}.png`));
}

console.log('Vergleiche erzeugt:', fs.readdirSync(outDir).length, '->', outDir);
