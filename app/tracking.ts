/**
 * Die Kennung des Google Tag Manager, an genau EINER Stelle.
 *
 * Sie hat schon mehrfach nicht gestimmt, weil dieselbe Zeichenfolge an
 * mehreren Stellen im Quelltext stand und beim Aendern eine davon
 * stehenblieb. Deshalb steht sie ab dem 10.09.2026 nur noch hier, und
 * jede andere Stelle holt sie sich von hier. Wer die Kennung wechselt,
 * aendert diese eine Zeile und sonst nichts.
 *
 * Die Form ist GTM- gefolgt von sieben Zeichen aus Groszbuchstaben und
 * Ziffern. Die Pruefung darunter faellt beim Bauen auf, wenn jemand sich
 * vertippt, statt dass die Seite spaeter still nichts misst.
 */
export const GTM_ID = "GTM-M5C85RXB";

/** Wahr, wenn die Kennung die Form hat, die Google vergibt. */
export function istGueltigeGtmId(id: string): boolean {
  return /^GTM-[A-Z0-9]{6,8}$/.test(id);
}

/* Ein Fehler beim Bauen ist besser als eine Seite, die still nichts
   misst. Next fuehrt diese Datei beim Bauen aus, der Wurf schlaegt also
   sofort zu und nicht erst beim Besucher. */
if (!istGueltigeGtmId(GTM_ID)) {
  throw new Error(
    `Die Kennung des Tag Manager sieht falsch aus: "${GTM_ID}". Erwartet wird GTM- gefolgt von sechs bis acht Zeichen aus Groszbuchstaben und Ziffern.`,
  );
}

/**
 * Das Kennzeichen fuer die Google Search Console.
 *
 * Es beantwortet eine andere Frage als der Tag Manager. Der Tag Manager
 * misst Besucher und laeuft deshalb erst nach der Einwilligung. Dieses
 * Kennzeichen beweist Google nur, dass die Seite uns gehoert, damit wir
 * sehen, ueber welche Suchanfragen Kunden kommen. Es speichert nichts
 * auf dem Geraet und sendet nichts an Google, sondern steht still im
 * Kopf der Seite. Deshalb darf und musz es dauerhaft dort stehen, auch
 * ohne Zustimmung.
 *
 * Der Wert kommt aus der Search Console, wenn man dort die Seite
 * hinzufuegt und den Weg ueber den HTML-Tag waehlt. Google zeigt dann
 * eine Zeile wie
 *   <meta name="google-site-verification" content="abc123..." />
 * und hier gehoert allein der Inhalt von content hinein, ohne die
 * Anfuehrungszeichen und ohne den Rest der Zeile.
 *
 * Solange die Zeichenkette leer ist, setzt layout.tsx das Kennzeichen
 * gar nicht. Ein leeres Kennzeichen waere schlimmer als keines, denn
 * Google wertet es als falsche Angabe.
 */
export const SEARCH_CONSOLE_ID = "";

/** Der Schluessel, unter dem die Entscheidung im Browser liegt. */
export const CONSENT_KEY = "svh-einwilligung";

/** Die beiden moeglichen Entscheidungen. */
export type Einwilligung = "alle" | "notwendig";
