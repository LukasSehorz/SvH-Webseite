// Misst, wie viel einer ganzseitigen Aufnahme strukturlos ist.
// Das Bild wird auf 350 Bildpunkte Breite in Graustufen gebracht und in
// Baender von 16 Zeilen geteilt. Ein Band gilt als leer, wenn seine
// Standardabweichung unter acht liegt, denn dann steht dort kein Motiv,
// sondern nur Flaeche.
import { spawnSync } from 'node:child_process';

const BREITE = 350;
const BAND = 16;

export function leeranteil(datei) {
  const lauf = spawnSync(
    'ffmpeg',
    ['-nostdin', '-v', 'error', '-i', datei, '-vf', `scale=${BREITE}:-2,format=gray`, '-f', 'rawvideo', '-'],
    { maxBuffer: 1024 * 1024 * 512 },
  );
  if (lauf.status !== 0) throw new Error(`ffmpeg ${datei} ${lauf.stderr}`);
  const roh = lauf.stdout;
  const zeilen = Math.floor(roh.length / BREITE);
  const baender = Math.floor(zeilen / BAND);
  let leer = 0;
  // Die laengste zusammenhaengende leere Strecke unterscheidet den ruhigen
  // Abstand zwischen zwei Sektionen von einem echten Loch im Bild.
  let strecke = 0;
  let laengster = 0;
  for (let b = 0; b < baender; b += 1) {
    const von = b * BAND * BREITE;
    const bis = von + BAND * BREITE;
    let summe = 0;
    for (let i = von; i < bis; i += 1) summe += roh[i];
    const mittel = summe / (bis - von);
    let quad = 0;
    for (let i = von; i < bis; i += 1) quad += (roh[i] - mittel) ** 2;
    const abw = Math.sqrt(quad / (bis - von));
    if (abw < 8) {
      leer += 1;
      strecke += 1;
      if (strecke > laengster) laengster = strecke;
    } else {
      strecke = 0;
    }
  }
  return { anteil: baender ? leer / baender : 0, baender, zeilen, laengster };
}

if (process.argv[2]) {
  for (const datei of process.argv.slice(2)) {
    const m = leeranteil(datei);
    console.log(
      `${datei}  leer ${(m.anteil * 100).toFixed(1)} %  laengste leere Strecke ${m.laengster} Baender  (${m.baender} Baender, ${m.zeilen} Zeilen)`,
    );
  }
}
