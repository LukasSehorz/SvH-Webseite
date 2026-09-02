/**
 * Steht die Form still?
 *
 * Setzt sich bei Versatz 0 auf die Marketing-Sektion, ruehrt den Scroll
 * danach NICHT mehr an und schieszt N Bilder im festen Abstand. Genau so
 * sind die Ruhebilder der Referenz entstanden, deshalb sind die Zahlen
 * unmittelbar vergleichbar.
 *
 * --bare blendet Ueberschriften, Kopfzeile und den Schleier aus, weil sich
 * die Silhouette sonst nicht vom Text trennen laeszt. Aendert nur diese
 * eine Sitzung, nicht das Projekt.
 *
 *   node _ref2/steh.mjs <prefix> [anzahl] [abstandMs] [--bare] [--w=1440] [--h=900] [--off=0]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const rest = args.filter((a) => !a.startsWith('--'));
const prefix = rest[0] || '_ref2/tmp/steh/s';
const n = Number(rest[1] || 4);
const gap = Number(rest[2] || 4000);
const width = parseInt(flags.w || '1440', 10);
const height = parseInt(flags.h || '900', 10);
const off = parseInt(flags.off || '0', 10);

fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(2500);

// Achtung, hier steckt in gpu-shot.mjs ein Fehler, der uebernommen
// werden koennte. Ein Aufruf ohne Gleichheitszeichen liefert aus
// Object.fromEntries den Wert undefined, deshalb ist die Pruefung
// "flags.bare !== undefined" IMMER falsch und die Blende griff nie.
if ('bare' in flags) {
  await page.addStyleTag({
    // Die Klassennamen der CSS-Module sind gehasht, deshalb der
    // Teilstring-Vergleich. dnaZoneContent steht NICHT im Baum, der
    // Inhalt haengt an dnaInner; wer nur nach dnaZoneContent sucht,
    // misst die Ueberschrift mit und bekommt eine Taille, die in
    // Wahrheit der linke Rand des Fliesztextes ist.
    content: `body > *:not(main) { visibility: hidden !important; }
              [class*="dnaInner"], [class*="dnaZoneContent"] { visibility: hidden !important; }
              [class*="dnaWash"] { display: none !important; }`,
  });
  await page.waitForTimeout(400);
}

// Lenis faengt window.scrollTo ab, deshalb der harte Sprung — zweimal,
// weil die erste Zuweisung noch von der Traegheit ueberschrieben wird.
for (let pass = 0; pass < 2; pass++) {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
  await page.waitForTimeout(pass === 0 ? 900 : 3000);
}

// Vor jedem Bild wird die Dokumentstelle NEU angesteuert. Das ist kein
// Scrollen im Sinne der Aufgabe, sondern eine Korrektur: waehrend die
// Bilder oberhalb der Sektion nachladen, waechst der Inhalt ueber ihr und
// schiebt sie im Fenster nach unten, obwohl der Scrollwert steht. Ohne
// die Korrektur wandert die Struktur zwischen zwei Aufnahmen um mehr als
// hundert Bildpunkte und die Messung sagt nichts mehr ueber die Form.
// Auf die Silhouette wirkt der Sprung nicht, weil der Schub seit dem
// Umbau nur noch den Flusz der Punkte antreibt und nicht die Drehlage.
const anchor = async () => {
  const top = await page.evaluate(() => Math.round(
    document.getElementById('marketing').getBoundingClientRect().top
    + document.scrollingElement.scrollTop));
  await page.evaluate((v) => { document.scrollingElement.scrollTop = v; }, Math.max(0, top + off));
  await page.waitForTimeout(1500);
};

// Mit --frei bleibt die Verankerung aus. Das ist fuer die Messung der
// Ruhegeschwindigkeit noetig, denn ein Sprung auf dieselbe Stelle sieht
// fuer die Seite trotzdem wie ein Scroll aus und gibt dem Flusz einen
// Schub. Der Abstand zwischen zwei Bildern ist dann genau gap.
const frei = 'frei' in flags;

const out = [];
for (let i = 0; i < n; i++) {
  if (i > 0 && !frei) await anchor();
  const f = `${prefix}${String(i).padStart(2, '0')}.png`;
  await page.screenshot({ path: f });
  out.push(f);
  if (i < n - 1) await page.waitForTimeout(frei ? gap : Math.max(0, gap - 1500));
}

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
console.log(JSON.stringify({ out, overflow, errors }, null, 1));
await browser.close();
