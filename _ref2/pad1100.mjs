/**
 * Unser auf 1085 gebrachtes Bild auf die Bildbreite der Referenz bringen.
 *
 * to1085.mjs schneidet die Bildlaufleiste weg und liefert 1085 Bildpunkte
 * Breite. Die Referenzbilder sind dagegen 1100 breit, weil ihre
 * Bildlaufleiste mit im Bild steht. hals.mjs rechnet seine Laengen ueber
 * 1440 geteilt durch die Fensterbreite auf den Maszstab 1440 um, deshalb
 * muessen beide Seiten dasselbe Fenster bekommen.
 *
 * Die fehlenden 15 Bildpunkte werden NICHT schwarz aufgefuellt. Ein
 * schwarzer Streifen neben dem hellen Seitenrand ist eine harte Kante,
 * und die Gewebemaske von hals.mjs und krit-tex.mjs sucht genau nach
 * harten Kanten: nachgemessen meldete daraufhin jede einzelne Zellzeile
 * eine rechte Gewebekante bei 97,6 Prozent des Fensters, also am Bildrand,
 * obwohl das Gewebe dort laengst zu Ende war. Diese Scheinspalte zieht den
 * Schwerpunkt jeder Zeile nach rechts und die Streuung nach oben, womit
 * das Breitenprofil unbrauchbar wird. Stattdessen wird die letzte Spalte
 * verbreitert; sie setzt den Rand glatt fort und erzeugt keine Kante.
 *
 *   node _ref2/pad1100.mjs <ein.png> <aus.png>
 */
import sharp from 'sharp';
const [src, dst] = process.argv.slice(2);
const meta = await sharp(src).metadata();
const need = Math.max(0, 1100 - meta.width);
if (need === 0) {
  await sharp(src).png().toFile(dst);
} else {
  const strip = await sharp(src)
    .extract({ left: meta.width - 1, top: 0, width: 1, height: meta.height })
    .resize({ width: need, height: meta.height, kernel: 'nearest' })
    .png()
    .toBuffer();
  await sharp(src)
    .extend({ right: need, background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .composite([{ input: strip, left: meta.width, top: 0 }])
    .png()
    .toFile(dst);
}
console.log(JSON.stringify({ src, dst, from: meta.width, to: 1100, h: meta.height }));
