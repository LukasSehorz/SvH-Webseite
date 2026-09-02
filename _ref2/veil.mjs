/**
 * Eine Aufnahme des Gewebes samt Nahaufnahme, in einem einzigen
 * Seitenaufruf. Jeder Seitenaufruf kostet auf dieser Maschine bis zu zwei
 * Minuten, deshalb faellt hier alles zusammen an, was fuer eine Runde
 * gebraucht wird.
 *
 *   node _ref2/veil.mjs <port> <marke> [versatz]
 *
 * Der Sprung auf die Oberkante der Marketing-Sektion ist Zeile fuer Zeile
 * aus _ref2/blick.mjs uebernommen, weil der dortige Nachmessvorgang der
 * einzige ist, der zuverlaeszig sitzt. Neu ist allein die Wartezeit von
 * zwanzig Sekunden vor der Aufnahme, denn das Gewebe braucht so lange, bis
 * seine Einblendung steht.
 *
 * Es entstehen drei Dateien. Die volle Aufnahme, dieselbe auf den
 * Referenzmaszstab von 1085 gebracht, und eine dreifach vergroeszerte
 * Nahaufnahme zum Vergleich mit _ref2/vid28/v040.jpg.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';

const PORT = process.argv[2] || '3210';
const MARKE = process.argv[3] || 'lauf';
const STELLEN = process.argv.slice(4).map(Number).filter((v) => !Number.isNaN(v));
const OFFS = STELLEN.length ? STELLEN : [0];

const DIR = '_ref2/tmp';
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(`http://localhost:${PORT}/`, {
  waitUntil: 'domcontentloaded',
  timeout: 180000,
});
await page.waitForTimeout(2500);
await page.waitForSelector('#marketing', { state: 'attached', timeout: 120000 });

// Erst nach dem Laden zwanzig Sekunden Ruhe, danach genuegt vor jeder
// weiteren Aufnahme die kurze Beruhigung nach dem Sprung. Die Einblendung
// des Gewebes laeuft ueber einen Beobachter am Fensterrand und ist vorher
// nicht auf ihrem Endwert.
let erste = true;
const ergebnis = [];

// Der Sprung selbst, Zeile fuer Zeile aus _ref2/blick.mjs.
const springe = async (OFF) => {
  let ist = null;
  for (let i = 0; i < 8; i++) {
    const top = await page.evaluate(() => {
      const se = document.scrollingElement;
      const el = document.getElementById('marketing');
      return Math.round(el.getBoundingClientRect().top + se.scrollTop);
    });
    await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, top + OFF);
    await page.waitForTimeout(900);
    ist = await page.evaluate(
      () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
    );
    if (Math.abs(ist + OFF) <= 6) break;
  }
  return ist;
};

for (const OFF of OFFS) {
  await springe(OFF);

  // Erst warten, DANN ein zweites Mal springen. Der Grund ist ein
  // Fehlschlag: in einem Durchgang stand die Oberkante nach dem Sprung
  // sauber bei minus 840, waehrend der zwanzig Sekunden Ruhe davor aber
  // noch Inhalt oberhalb der Sektion nachlud und sie um mehrere hundert
  // Bildpunkte nach unten schob. Die Aufnahme zeigte deshalb einen ganz
  // anderen Abschnitt der Seite als die Aufnahme davor, und die
  // Messwerte waren nicht vergleichbar, ohne dass die Zahlen selbst das
  // verraten haetten. Der zweite Sprung sitzt auf einer Seite, die sich
  // nicht mehr bewegt.
  await page.waitForTimeout(erste ? 20000 : 5000);
  erste = false;
  let ist = await springe(OFF);
  await page.waitForTimeout(2500);
  ist = await page.evaluate(
    () => Math.round(document.getElementById('marketing').getBoundingClientRect().top),
  );
  if (ist === null || Math.abs(ist + OFF) > 6) {
    console.error(`WARNUNG: Oberkante sitzt bei ${ist} statt bei ${-OFF}`);
  }

  const VOLL = `${DIR}/veil-${MARKE}-${OFF}.png`;
  const REF = `${DIR}/veil-${MARKE}-${OFF}-1085.png`;
  const NAH = `${DIR}/veil-${MARKE}-${OFF}-nah.png`;
  await page.screenshot({ path: VOLL });

  const meta = await sharp(VOLL).metadata();
  const pageW = meta.width - 15;
  await sharp(VOLL)
    .extract({ left: 0, top: 0, width: pageW, height: meta.height })
    .resize({ width: 1085, kernel: 'lanczos3' })
    .png()
    .toFile(REF);

  // Die Nahaufnahme. Ausschnitt aus dem Gewebe der rechten Bildhaelfte,
  // dreifach vergroeszert mit nearest, damit die einzelnen Punkte als
  // Bloecke sichtbar bleiben und nicht von der Glaettung verschmiert
  // werden.
  await sharp(VOLL)
    .extract({ left: 830, top: 120, width: 360, height: 300 })
    .resize({ width: 1080, height: 900, kernel: 'nearest' })
    .png()
    .toFile(NAH);

  ergebnis.push({ OFF, VOLL, REF, NAH, oberkante: ist });
}

await browser.close();
console.log(JSON.stringify(ergebnis, null, 1));
