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

export async function starten(optionen = {}) {
  const browser = await chromium.launch({ headless: false, ...optionen });

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
