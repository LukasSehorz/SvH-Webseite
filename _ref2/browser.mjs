/**
 * Ein Browser, der KEINE fremden Fenster anfaszt.
 *
 *   import { starten } from './browser.mjs';
 *   const { browser, aufraeumen } = await starten();
 *   ...
 *   await aufraeumen();
 *
 * DIESE DATEI BEENDET KEINEN EINZIGEN PROZESS UEBER TASKKILL, UND DAS
 * IST EINE BEWUSSTE ENTSCHEIDUNG.
 *
 * Der Auftraggeber hat ausdruecklich verlangt, dass seine eigenen
 * Chrome-Tabs offen bleiben. Aufgeraeumt wurde vorher mit
 * `taskkill /F /IM chrome.exe`, und der Aufruf trifft jeden Chrome auf
 * dem Rechner.
 *
 * VIER WEGE ZUR UNTERSCHEIDUNG SIND GEPRUEFT UND ALLE GESCHEITERT.
 * Sie stehen hier, damit sie nicht noch einmal probiert werden.
 *
 * Erstens der Dateipfad. Weder Get-Process noch Win32_Process geben ihn
 * auf dieser Maschine heraus, und Playwright nennt seinen Prozess
 * ohnehin ebenfalls chrome.exe.
 *
 * Zweitens browser.process(). Die hier verwendete Fassung von Playwright
 * kennt die Methode nicht, der Aufruf endet mit einem TypeError.
 *
 * Drittens der Vergleich der Prozessliste vor und nach dem Lauf. Er
 * beendet alles, was seit dem Start neu ist, und das sind eben auch die
 * Tabs, die der Auftraggeber waehrenddessen selbst oeffnet. Gemessen
 * kostete das elf seiner Prozesse in einem Durchgang.
 *
 * Viertens die Abstammung, also alle chrome.exe, deren Elternkette bis
 * zu dieser Node-Nummer hinauffuehrt. Das klang schluessig und half
 * nicht: im Versuch fehlten hinterher zwoelf zuvor laufende Prozesse.
 * Chromium haengt seine Unterprozesse offenbar um, und verwaiste
 * Prozesse landen unter einer fremden Wurzel.
 *
 * ES BLEIBT DESHALB BEI browser.close() UND SONST NICHTS. Damit koennen
 * einzelne Unterprozesse liegenbleiben, und das ist der geringere
 * Schaden. Wer nach vielen Laeufen Speicher braucht, fragt den
 * Auftraggeber, statt auf gut Glueck zu beenden.
 */
import { chromium } from 'playwright';
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * DIE FENSTER OEFFNEN AUF DEM NEBENSCHIRM, WENN ES EINEN GIBT.
 *
 * Auf dem Mac des Auftraggebers liegt ein groszer Schirm ueber dem
 * Laptop. Jedes Chromium-Fenster, das auf dem Laptop-Schirm aufging,
 * hat ihn bei der Arbeit unterbrochen, und das hat er am 03.09.2026
 * ausdruecklich beanstandet. Liegt neben dieser Datei eine fenster.json
 * mit x und y (erzeugt von _ref2/fenster.mjs), bekommt der Browser
 * seine Fensterlage von dort. Die Datei ist in git ignoriert, weil die
 * Anordnung der Schirme zur Maschine gehoert und nicht zum Projekt.
 */
function fensterLage() {
  try {
    const hier = path.dirname(fileURLToPath(import.meta.url));
    const datei = path.join(hier, 'fenster.json');
    if (!existsSync(datei)) return null;
    const lage = JSON.parse(readFileSync(datei, 'utf8'));
    if (typeof lage.x !== 'number' || typeof lage.y !== 'number') return null;
    return lage;
  } catch {
    return null;
  }
}

/*
 * DER TASTATURFOKUS BLEIBT BEIM AUFTRAGGEBER.
 *
 * macOS holt ein neu gestartetes Chromium nach vorn, auch wenn sein
 * Fenster auf dem anderen Schirm liegt, und nimmt der App, in der gerade
 * getippt wird, den Fokus. Deshalb merkt sich starten() die vorher
 * vorderste App und holt sie nach dem Start und nach jedem neuen Fenster
 * wieder nach vorn. lsappinfo und open brauchen dafuer keine Freigabe,
 * AppleScript ueber System Events haette eine verlangt.
 */
function vordersteApp() {
  if (process.platform !== 'darwin') return null;
  try {
    const asn = execFileSync('lsappinfo', ['front'], { encoding: 'utf8' }).trim();
    const info = execFileSync('lsappinfo', ['info', '-only', 'name', asn], {
      encoding: 'utf8',
    });
    const treffer = /"LSDisplayName"="(.+)"/.exec(info);
    return treffer ? treffer[1] : null;
  } catch {
    return null;
  }
}

function nachVorn(name) {
  if (!name || process.platform !== 'darwin') return;
  execFile('open', ['-a', name], () => {});
}

export async function starten(optionen = {}) {
  const lage = fensterLage();
  const args = [...(optionen.args || [])];
  if (lage) {
    args.push(`--window-position=${lage.x},${lage.y}`);
    if (typeof lage.w === 'number' && typeof lage.h === 'number') {
      args.push(`--window-size=${lage.w},${lage.h}`);
    }
  }
  const vorher = vordersteApp();
  const browser = await chromium.launch({ headless: false, ...optionen, args });

  // Zweimal, denn das erste Fenster erscheint erst kurz nach dem Start.
  nachVorn(vorher);
  setTimeout(() => nachVorn(vorher), 900);

  // Auch jedes weitere Fenster holt Chromium nach vorn. Die beiden Wege,
  // ueber die ein Skript Fenster oeffnet, holen deshalb den Fokus zurueck.
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (...a) => {
    const seite = await newPage(...a);
    setTimeout(() => nachVorn(vorher), 250);
    return seite;
  };
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...a) => {
    const kontext = await newContext(...a);
    const kontextNewPage = kontext.newPage.bind(kontext);
    kontext.newPage = async (...b) => {
      const seite = await kontextNewPage(...b);
      setTimeout(() => nachVorn(vorher), 250);
      return seite;
    };
    return kontext;
  };

  const aufraeumen = async () => {
    try {
      await browser.close();
    } catch {
      // Ein bereits abgestuerzter Browser soll den Lauf nicht mit einem
      // Fehler beenden, denn die Messung davor ist ja schon geschrieben.
    }
  };

  return { browser, aufraeumen };
}
