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

/** Der Schluessel, unter dem die Entscheidung im Browser liegt. */
export const CONSENT_KEY = "svh-einwilligung";

/** Die beiden moeglichen Entscheidungen. */
export type Einwilligung = "alle" | "notwendig";
