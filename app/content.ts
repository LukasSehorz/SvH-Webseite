/**
 * Firmendaten für Footer, Kontakt und Rechtsseiten.
 * Alle übrigen Texte des dunklen Redesigns liegen in app/copy.ts.
 */

export const company = {
  name: "SVH Consulting",
  legalName: "Sehorz Lukas, vom Hofe Jannik GbR",
  claim: "SVH Consulting. Wachstum, das planbar ist.",
  street: "Am Anger 3",
  zipCity: "84539 Zangberg",
  country: "Deutschland",
  phone: "0172 3465896",
  phoneHref: "+491723465896",
  /* An diese Adresse gehen die Anfragen aus dem Formular, und sie steht
     auf der Kontaktseite, in der Fusszeile und in den Rechtstexten. Der
     Auftraggeber hatte am 03.09.2026 zuerst schconsult.de geschrieben;
     diese Domain hat laut DNS keinen Mailserver, svhconsult.de dagegen
     einen bei Google, und der Versand soll ueber resend@svhconsult.de
     laufen. Deshalb steht hier svhconsult.de. */
  email: "lukas.sehorz@svhconsult.de",
  hours: "Montag bis Sonntag von 8 bis 21 Uhr",
  partners: ["Lukas Sehorz", "Jannik vom Hofe"],
};
