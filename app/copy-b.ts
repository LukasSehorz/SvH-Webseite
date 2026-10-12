/*
 * Texte der Startseite (ehemals „Variante B“, seit 06.10.2026 die einzige Seite).
 * Gemeinsame Texte (Knopf, Leiste, Aktuelles, Rechtsseiten, 404, Formular-Mail) stehen in app/copy.ts.
 * Leitlinie: so einfach, dass es ein 12-Jähriger und ein 55-jähriger Geschäftsführer verstehen.
 * Aufbau seit 06.10.2026 nach der Struktur von andreasbaulig.de (nur Aufbau und Psychologie, keine Inhalte):
 *   Versprechen + Beweis (Zielgruppe, Google, Logos) → Problem „nicht deine Schuld“ →
 *   Lösung mit den Gewinnen (Zahnräder) → System (Leistungen 0–4) → Beweis (Ergebnisse, Bewertungen) →
 *   konkrete Lösungen (Bento) → Gründer → Programm (Masterplan, mit Preisanker) → Fahrplan mit Garantie (Workshop) →
 *   „Überzeuge dich selbst“ → Für wen → Fragen → Videos (Aktuelles) → Abschluss.
 *   (Runde 3, 06.10.2026: die Videos führen zu YouTube und stehen deshalb erst hinter den Fragen, nicht vor dem Angebot)
 * Jede Überschrift greift den Abschnitt davor auf (roter Faden), die kleinen Labels darüber zeigen das Kapitel.
 * Auszeichnung in Überschriften: _Wort_ = Verlaufswort.
 *
 * Fakten stammen aus der früheren Variante A (Projekte, Kunden, Workshop, Masterplan, Team, Videos),
 * aus zwei geprüften Studien (Quellen bei problemB) und aus Angaben von Jannik (04.10.2026).
 * Alles, was noch bestätigt oder geliefert werden muss, ist mit „OFFEN“ markiert.
 */

// Seitentitel und Beschreibung der Startseite (Suchmaschinen, geteilte Links)
export const metaB = {
  title: "KI-Automatisierung für den Mittelstand | SvH Consulting",
  description: "Die KI-Automatisierungen, die deinem Unternehmen fehlen, um jeden Monat Zeit zu sparen. Starte mit dem kostenlosen KI-Workshop.",
};

export type SubLink = { label: string; text: string; href: string };
export type NavLink = { label: string; href: string; id: string; sub?: SubLink[]; foot?: { label: string; href: string } };

// Google-Profil (5,0 Sterne, 6 Bewertungen, Stand 07.10.2026): Hero und Kunden verlinken dorthin
const GOOGLE_PROFIL =
  "https://www.google.com/maps/place/SvH+Consulting/@48.3285982,11.8226616,10z/data=!4m6!3m5!1s0x8eafb3c841f9a22f:0xc493185e015a3928!8m2!3d48.3285982!4d11.8226616!16s%2Fg%2F11nvctpln1";

// Reihenfolge wie auf der Seite (Runde 2): Leistungen → Kunden → Lösungen → Über uns → Ablauf
export const navB: { links: NavLink[] } = {
  links: [
    { label: "Leistungen", href: "#leistungen", id: "leistungen" },
    { label: "Kunden", href: "#kunden", id: "kunden" },
    { label: "Lösungen", href: "#loesungen", id: "loesungen" },
    {
      label: "Über uns",
      href: "#ueber-uns",
      id: "ueber-uns",
      sub: [
        { label: "Über uns", text: "Die Gründer hinter SvH Consulting", href: "#ueber-uns" },
        { label: "Aktuelles", text: "Neue Videos rund um KI im Betrieb", href: "#aktuelles" },
      ],
    },
    {
      label: "Ablauf",
      href: "#masterplan",
      id: "masterplan",
      sub: [
        { label: "KI-Masterplan", text: "Was du nach dem Workshop in der Hand hältst", href: "#masterplan" },
        { label: "KI-Workshop", text: "Drei Schritte und unsere Garantie", href: "#workshop" },
      ],
    },
  ],
};

export const heroB = {
  // Zeile für die Zielgruppe über der Überschrift (Baulig: „Für Agenturen, Berater …“)
  zielgruppe: "Für mittelständische Unternehmen im DACH-Raum",
  h1: "Die _KI-Automatisierungen_, die deinem Unternehmen fehlen, um jede Woche Zeit zu sparen",
  // „12 Wochen“ am 06.10.2026 entfernt (war unbestätigt)
  sub: "Wie du Angebote, E-Mails und Anfragen mit KI automatisierst – ohne neue Mitarbeiter einzustellen und ohne selbst Technik-Experte zu werden.",
  // Jeder Haken beantwortet eine eigene Frage: Wie nutze ich KI? Wo verliere ich Zeit? Was bekomme ich? Warum klappt es bisher nicht?
  punkte: [
    "Erhalte Klarheit darüber, wie du KI richtig nutzt und in deinem Unternehmen einsetzt",
    "Finde im kostenlosen KI-Workshop heraus, welche Aufgaben in deinem Betrieb am meisten Zeit fressen",
    "Bekomme einen fertigen Plan mit den 3 Automatisierungen, die sich für dich am meisten lohnen",
    "Verstehe, warum KI in deinem Unternehmen noch nicht richtig funktioniert – und wie sich das ändert",
  ],
  video: {
    titel: "Kurz erklärt: So gewinnst du Zeit mit KI",
    platzhalter: "Video folgt",
  },
  // Google-Sterne unter der Unterzeile (echte Werte, Link aufs Profil).
  // label beginnt mit dem sichtbaren Text, damit Sprachsteuerung den Link findet.
  google: {
    schnitt: "5,0",
    text: "bei Google",
    anzahl: "6 Bewertungen",
    href: GOOGLE_PROFIL,
    label: "5,0 bei Google · 6 Bewertungen, Profil öffnen, neues Fenster",
  },
  // OFFEN: Foto von Jannik und Lukas, z. B. "/b/gruender.jpg". Leer = kein Hintergrundbild.
  hintergrund: "",
};

/* OFFEN: Estera 160 Std. – im Briefing „pro Woche“, in Esteras Google-Bewertung „im Monat“.
   Bis Lukas es bestätigt, steht überall „im Monat“ (Wortlaut des Kunden). */
export const trustB = [
  { big: "35+", small: "umgesetzte Projekte" },
  { big: "bis zu 160\u00a0Std.", small: "im Monat gespart bei", logo: "estera" },
  { big: "Geld-zurück-Garantie", small: "auf die Umsetzung" },
  { big: "0 €", small: "für Workshop und Masterplan" },
];

// Kunden-Logos (Dateien in public/kunden/). Anzahl weiterer Projekte = 35 − Logos.
export const logosB = {
  label: "Für diese Unternehmen haben wir schon gearbeitet",
  gesamt: 35,
  weitere: (n: number) => `+${n} weitere Projekte`,
  neuesFenster: "öffnet in neuem Fenster",
  firmen: [
    { id: "estera", name: "Estera GmbH", href: "https://estera.immobilien/" },
    { id: "fuchspools", name: "Fuchs Pools", href: "https://fuchspools.com/" },
    { id: "brandhuber", name: "Brandhuber GmbH", href: "https://brandhuber.gmbh/" },
    { id: "world-of-less", name: "World of Less Logistic Trading", href: "https://world-of-less.de/" },
    { id: "ke-fraestechnik", name: "KE Frästechnik", href: "https://ke-fraestechnik.de/" },
    { id: "innnatur", name: "InnNatur Heilpraktiker", href: "https://innnatur-heilpraktiker.de/" },
    { id: "physio-schediwy", name: "Physiotherapie Schediwy", href: "https://www.physio-schediwy.de/" },
  ],
};

// Problem → Folgen → SvH → Vorteile, als ein zusammenhängendes Schaubild
export const problemB = {
  label: "Das Problem",
  titel: "Es ist nicht deine _Schuld_.",
  text: "Jeder Anbieter verkauft dir sein eigenes Tool, aber keiner sorgt dafür, dass alles mit deinen Abläufen zusammenspielt. Deshalb probiert fast jeder Betrieb KI aus, aber kaum einer spart damit wirklich Zeit. Was fehlt, ist ein klarer Plan.",
  studie1: {
    balken: [
      { wert: 88, label: "nutzen KI", farbe: "rot" },
      { wert: 7, label: "richtig eingeführt", farbe: "gruen" },
    ],
    quelle: "McKinsey, The State of AI, 2025",
    href: "https://www.mckinsey.com/featured-insights/charts/ai-at-work-but-not-at-scale",
  },
  studie2: {
    // Atlassian: ein Viertel der Arbeitszeit geht fürs Suchen drauf, bei 40 Std. also rund 10 Std.
    titel: "10 Stunden pro Woche sucht jeder Mitarbeiter nach Informationen.",
    unter: "Das ist ein Viertel seiner Arbeitszeit.",
    fazit: "Bei vier Mitarbeitern ist das rechnerisch eine volle Stelle, nur fürs Suchen.",
    quelle: "Atlassian, State of Teams 2025",
    href: "https://www.atlassian.com/blog/state-of-teams-2025",
  },
  quelleLabel: "Quelle",
  folgen: {
    titel: "Was passiert, wenn du nichts änderst",
    punkte: [
      "Riesiger Zeitverlust, jeden Tag",
      "Anfragen bleiben liegen, Umsatz geht verloren",
      "Dein Team ist überlastet und macht Fehler",
      "Wettbewerber mit KI werden schneller und günstiger",
    ],
  },
  // Die Vorteile stehen seit Runde 2 in der Lösung (Zahnräder), Baulig: „Was du erwarten kannst“
  vorteileTitel: "Was du _gewinnst_",
  vorteile: [
    { titel: "Zeit sparen", text: "Die immer gleiche Arbeit erledigt sich von allein." },
    { titel: "Schneller antworten", text: "Angebote und Antworten in Minuten statt Tagen." },
    { titel: "Weniger Fehler", text: "Nichts wird falsch abgetippt oder vergessen." },
    { titel: "Immer erreichbar", text: "Telefon, E-Mail und Chat, auch nach Feierabend." },
    { titel: "Wachsen ohne neue Mitarbeiter", text: "Mehr Aufträge mit dem Team, das du hast." },
    { titel: "Umsatz steigern", text: "Keine Anfrage geht mehr verloren." },
  ],
};

/* Unsere Leistungen 0–4 (Lukas, 06.10.2026). Satzbau angelehnt an „Unsere Haupt-Angebote“ von Apex:
   „Wir tun X – damit du Y“. Eigene Worte, du-Form, Kinder-Test: jede Stufe hat einen „Einfach erklärt“-Satz.
   0 ist der Start (Workshop), 1–4 bauen aufeinander auf und laufen als Kreislauf im Unendlichkeitszeichen:
   Lage am Zeichen: 1 oben links, 2 unten rechts, 3 oben rechts, 4 unten links, 0 in der Mitte (Kreuzung).
   Unter dem Zeichen stehen die Karten in Lesereihenfolge 0 → 4; nur die 0 hat einen Link (zum Workshop-Ablauf). */
export const leistungenB = {
  label: "Unsere Leistungen",
  titel: "So bauen wir dein _System_ auf: in fünf Stufen.",
  text: "Die Stufen bauen aufeinander auf. Jedes Projekt startet bei 0, und jede weitere Stufe spart dir mehr Zeit.",
  einfachLabel: "Einfach erklärt",
  start: "Start",
  startLink: { text: "So läuft der Workshop", href: "#workshop" },
  teile: [
    {
      nr: 0,
      kurz: "KI-Workshop",
      titel: "KI-Workshop",
      text: "Wir finden in 45 Minuten deine größten Zeitfresser – damit du weißt, wo sich KI für dich lohnt.",
      einfach: "Wir schauen zusammen, wo bei dir die Zeit verloren geht. Kostenlos.",
    },
    {
      nr: 1,
      kurz: "Wissen",
      titel: "KI-Wissensmanagement",
      text: "Wir bündeln das Wissen aus Köpfen, Ordnern und Postfächern an einem Ort – damit dein Team in Sekunden Antworten findet, statt Stunden zu suchen.",
      einfach: "Eine KI, die alles über deinen Betrieb weiß und sofort antwortet.",
    },
    {
      nr: 2,
      kurz: "Prozesse",
      titel: "Digitale Prozesse",
      text: "Wir ersetzen Zettel, Excel-Listen und doppeltes Abtippen durch klare digitale Abläufe – damit jede Info von allein dort landet, wo sie gebraucht wird.",
      einfach: "Schluss mit Zettelwirtschaft.",
    },
    {
      nr: 3,
      kurz: "Automatisierung",
      titel: "KI-Automatisierungen",
      text: "Wir bauen Automatisierungen für Angebote, Rechnungen, Anfragen und Berichte – damit dein Team die immer gleiche Arbeit los ist.",
      einfach: "Wie ein Fließband für deine Büroarbeit.",
    },
    {
      nr: 4,
      kurz: "Agenten",
      titel: "KI-Agenten",
      text: "Wir bauen digitale Kollegen, die ans Telefon gehen, E-Mails, Chats und WhatsApp beantworten und Termine eintragen – damit keine Anfrage mehr liegen bleibt, rund um die Uhr.",
      einfach: "Ein Kollege, der nie Feierabend macht.",
    },
  ],
};

// Workshop als Ablauf von oben nach unten (Angaben von Jannik, 04.10.2026)
export const workshopB = {
  label: "So startest du",
  titel: "Der kostenlose _KI-Workshop_",
  text: "Dein erster Schritt kostet nichts. Bevor wir irgendetwas bauen, verstehen wir deinen Betrieb. So läuft es ab, Schritt für Schritt.",
  schritte: [
    {
      titel: "KI-Workshop",
      wann: "Dein Termin",
      tag: "45 Minuten",
      text: "Das passiert im Workshop:",
      punkte: [
        "Du erzählst, wie dein Betrieb arbeitet.",
        "Gemeinsam finden wir deine 5 bis 10 größten Zeitfresser.",
        "Wir schauen uns an, was bei dir gut läuft, was nicht und ob wir dir überhaupt helfen können.",
      ],
      preis: "0 €",
    },
    {
      titel: "KI-Masterplan",
      wann: "Nach 48 Std.",
      tag: "", // die Zeitmarke steht schon im Badge (wann)
      text: "Deine 3 besten Automatisierungen, schwarz auf weiß. Dann besprechen wir den Plan gemeinsam.",
      punkte: [] as string[],
      preis: "0 €",
    },
    {
      titel: "Umsetzung",
      wann: "Danach",
      tag: "Zeit gewinnen",
      text: "Wir bauen und testen die Helfer und zeigen deinem Team, wie alles funktioniert. Ab dann gewinnst du jede Woche Zeit.",
      punkte: [] as string[],
      preis: "",
    },
  ],
  hinweis: "Bis zur Umsetzung zahlst du nichts. Den Masterplan behältst du so oder so.",
  // Geld-zurück-Garantie auf die Umsetzung (Wortlaut aus Variante A, Lukas 29.09.2026: seriös, mit Siegel und drei Schritten)
  garantie: {
    label: "Unsere Garantie",
    titel: "Keine Zeit gespart? _Geld zurück._",
    text: "Für die Umsetzung gilt: Spart dir unsere Automatisierung nicht die vereinbarte Zeit oder das vereinbarte Geld, bekommst du dein Geld zurück. Das Risiko tragen wir, nicht du.",
    siegel: "Geld-zurück-Garantie · schriftlich vereinbart · ",
    schritte: [
      { titel: "Ziel festlegen", text: "Vor dem Start schreiben wir gemeinsam auf, wie viel Zeit oder Geld die Automatisierung sparen soll." },
      { titel: "Umsetzen und messen", text: "Wir bauen die Lösung und messen das Ergebnis gemeinsam mit dir." },
      { titel: "Ziel verfehlt?", text: "Dann bekommst du dein Geld zurück. So steht es in deinem Angebot." },
    ],
  },
  // OFFEN: großes Bild rechts (z. B. Foto aus einem Workshop), "/b/workshop.jpg"
  bild: "",
  bildFolgt: "Bild folgt",
  // Preisanker „1.099 € → 0 €“: seit Runde 3 im Masterplan (masterplanB.preis)
};

/* Lösungen (Bento wie „Intelligente Automations“ bei Apex, Lukas 06.10.2026): Stil und Bewegung als Vorbild,
   Texte und Abbildungen eigen. Die sieben Lösungen stammen aus Lukas' Pyramide, jede gehört zu einer Stufe (1–4);
   sie stehen nach Stufe sortiert (1, 2, 2, 3, 4, 4, 4).
   Inhalte in den kleinen Abbildungen sind erfundene Beispiele (nur Bild, für Screenreader ausgeblendet). */
export const loesungenB = {
  label: "Was wir bauen",
  titel: "Intelligente _Automatisierungen_. Gebaut für deinen Betrieb.",
  text: "Aus den fünf Stufen entstehen konkrete Helfer, verbunden mit den Programmen, die du schon hast.",
  ctaZeile: "Welche davon lohnt sich bei dir? Das finden wir im Workshop heraus.",
  ctaText: "Im kostenlosen Workshop sitzt du direkt mit uns beiden zusammen. Wir schauen uns deinen Betrieb an und sagen dir ehrlich, welche Helfer sich für dich lohnen.",
  // OFFEN: Foto von Lukas und Jannik (Querformat, z. B. im Gespräch am Tisch), "/b/gruender-loesungen.jpg"
  foto: "",
  fotoAlt: "Lukas Sehorz und Jannik vom Hofe im Gespräch",
  fotoFolgt: "Foto folgt",
  // Schild je Karte: „Stufe 1 · Wissen“ (Kurzname wie im Unendlichkeitszeichen darüber)
  stufe: (nr: number) => `Stufe ${nr} · ${leistungenB.teile.find((t) => t.nr === nr)?.kurz ?? ""}`,
  karten: [
    {
      id: "wissen",
      stufe: 1,
      titel: "KI-Wissensdatenbank",
      text: "Frag einfach: Die KI antwortet sofort aus deinen Unterlagen und nennt die Quelle.",
      ui: {
        frage: "Wie lange gilt die Garantie auf Terrassendächer?",
        antwort: "5 Jahre auf die Konstruktion, 2 Jahre auf Markisen.",
        quelle: "Garantiebedingungen, S. 2",
        ki: "KI-Antwort",
      },
    },
    {
      id: "crm",
      stufe: 2,
      titel: "CRM-Einrichtung & Automatisierungen",
      text: "Wir verbinden deine Kundenliste mit E-Mail und Kalender. Nichts geht verloren.",
      ui: { mitte: "CRM", programme: ["E-Mail", "Kalender", "Webseite", "Telefon", "Buchhaltung", "Tabellen"] },
    },
    {
      id: "fulfilment",
      stufe: 2,
      titel: "Fulfilment-Systeme",
      text: "Vom Auftrag bis zur Lieferung läuft alles wie am Fließband. Nichts bleibt liegen.",
      ui: {
        auftrag: "Auftrag #2417",
        schritte: ["Auftrag da", "Eingeplant", "In Arbeit", "Geliefert"],
        hinweis: "Kunde automatisch informiert",
      },
    },
    {
      id: "business",
      stufe: 3,
      titel: "Business-Automatisierung",
      text: "Angebote, Rechnungen und Berichte laufen von allein. Du gibst nur noch frei.",
      ui: { aufgaben: ["Angebot erstellt", "Rechnung verschickt", "Zahlung erinnert", "Bericht für Montag"] },
    },
    {
      id: "agenten",
      stufe: 4,
      titel: "Personalisierte KI-Agenten",
      text: "Ein digitaler Kollege, der deine Preise kennt und nur tut, was du freigibst.",
      ui: {
        name: "Dein Vertriebs-Agent",
        aktiv: "Aktiv",
        regeln: ["Kennt deine Preise und Produkte", "Antwortet in deinem Ton", "Trägt Termine ein", "Fragt bei Unklarem nach"],
      },
    },
    {
      id: "voice",
      stufe: 4,
      titel: "Voice- & Chat-Agenten",
      text: "Der Agent nimmt Anrufe und Chats an und bucht Termine, rund um die Uhr.",
      ui: {
        anruf: "Anruf um 21:14 Uhr",
        agent: "KI-Agent am Telefon",
        status: ["Anruf angenommen", "Frage beantwortet", "Termin eingetragen"],
      },
    },
    {
      id: "whatsapp",
      stufe: 4,
      titel: "KI-WhatsApp-Kundenservice",
      text: "Die KI antwortet sofort, auch nachts. Schwierige Fälle gehen an dein Team.",
      ui: {
        kopf: "WhatsApp",
        nachrichten: [
          { von: "kunde", text: "Habt ihr am Samstag offen?" },
          { von: "ki", text: "Ja, von 9 bis 13 Uhr. Soll ich dir einen Termin eintragen?" },
          { von: "kunde", text: "Gerne, um 10 Uhr." },
        ],
      },
    },
  ],
};

/* Kunden: echte Google-Bewertungen (Profil „SvH Consulting“, 5,0 Sterne, Stand 04.10.2026), wortgetreu.
   Zuordnung laut Jannik (04.10.2026). 
   Bei Izzet Tüymen fehlt bewusst der Schlusssatz „Vielen Dank für deine Unterstützung! 🙌“ (klingt nach unserer Antwort). */
export type Bewertung = { name: string; firma: string; logo: string; href: string; sterne: number; datum: string; text: string; umgesetzt: string };

export const kundenB = {
  label: "Ergebnisse",
  titel: "Was unsere Kunden _sagen_",
  text: "Klingt gut? Hier siehst du, was es anderen Betrieben gebracht hat. Darunter echte Bewertungen von Google.",
  // Ergebnisse mit Zahl über dem Karussell (OFFEN: Estera Monat oder Woche, siehe trustB; dritter Kunde ohne Namen)
  ergebnisse: [
    { firma: "Estera GmbH", logo: "estera", zahl: "bis zu 160 Std.", einheit: "im Monat gespart", gebaut: "Kundenverwaltung (CRM), Automatisierungen und neue Webseite" },
    { firma: "Fuchs Pools", logo: "fuchspools", zahl: "15 Std.", einheit: "pro Woche gespart", gebaut: "Automatische Angebote, automatisiertes Marketing und neue Webseite" },
    { firma: "KE Frästechnik", logo: "ke-fraestechnik", zahl: "1 Tag → 30 Min.", einheit: "pro Angebot", gebaut: "Automatische Angebote mit einem KI\u2011Wissensspeicher" }, // geschützter Bindestrich: nie „KI- / Wissensspeicher“
  ],
  gebaut: "Was wir gebaut haben",
  // Pfeil in „1 Tag → 30 Min.“ für Screenreader
  pfeil: "auf",
  ctaZeile: "Das will ich für meinen Betrieb auch.",
  schnitt: "5,0",
  anzahl: "6 Google-Bewertungen",
  profil: GOOGLE_PROFIL,
  // Karussell: eine Reihe, Pfeile drehen endlos weiter
  zurueck: "Vorherige Bewertung",
  vor: "Nächste Bewertung",
  bereich: "Google-Bewertungen",
  position: (i: number, n: number) => `Bewertung ${i} von ${n}`,
  profilLink: "Alle Bewertungen auf Google",
  google: "Google-Bewertung",
  // leeres „umgesetzt“ bei einer Bewertung: der Block entfällt ganz
  umgesetzt: "Was wir umgesetzt haben",
  weiter: "Weiterlesen",
  weniger: "Weniger anzeigen",
  bewertungen: [
    {
      // neu seit 06.10.2026, wortgetreu von Google (Zeichensetzung wie im Original); Firma laut Jannik
      name: "BandyBoe Böhme",
      firma: "InnNatur Heilpraktiker",
      logo: "innnatur",
      href: "https://innnatur-heilpraktiker.de/",
      sterne: 5,
      datum: "Oktober 2026",
      text: "Super Beratung, Schnelle Umsetzung .Auf alle Wünsche eingegangen. Jeder Zeit wieder. Absolute Empfehlung Danke",
      umgesetzt: "Automatische Terminerinnerungen und eine automatische Beantwortung von Kundenanfragen.",
    },
    {
      name: "Orfe",
      firma: "Estera GmbH",
      logo: "estera",
      href: "https://estera.immobilien/",
      sterne: 5,
      datum: "September 2026",
      text: "Wir waren mega zufrieden mit der Zusammenarbeit! Die Jungs waren immer zuverlässig, haben sehr gute Qualität schnell geliefert und Anderungswünsche direkt umgesetzt. Durch die Automatisierungen konnten wir bis zu 160 Stunden im Monat einsparen. Können die Jungs nur weiterempfehlen!",
      umgesetzt: "Digitale Kundenverwaltung (CRM), Automatisierungen und eine neue Webseite.",
    },
    {
      name: "oliver fuchs",
      firma: "Fuchs Pools",
      logo: "fuchspools",
      href: "https://fuchspools.com/",
      sterne: 5,
      datum: "September 2026",
      text: "Ich war mit der Zusammenarbeit und dem Ergebnis rundum zufrieden! Die Firma hat von Anfang an zuverlässig und professionell gearbeitet. Meine Fragen wurden schnell beantwortet und Änderungswünsche unkompliziert umgesetzt. Besonders gefallen hat mir, dass meine Vorstellungen ernst genommen wurden und ich immer einen Ansprechpartner hatte. Die Arbeit wurde zügig erledigt und die Qualität hat mich überzeugt. Ich würde die Firma jederzeit wieder beauftragen und kann sie auf jeden Fall weiterempfehlen!",
      umgesetzt: "Automatische Angebotserstellung, automatisiertes Marketing und eine neue Webseite.",
    },
    {
      name: "Izzet Tüymen",
      firma: "Taxi Izi",
      logo: "taxiizi",
      href: "https://taxi-izi.de/",
      sterne: 5,
      datum: "Oktober 2026",
      text: "Für mich zählt am Ende vor allem das Ergebnis, und das ist hier wirklich erstklassig. Man sieht an jedem Detail, dass die Jungs sauber und mit hohem Anspruch gearbeitet haben. Nichts wirkt halbfertig oder schnell zusammengeschustert, im Gegenteil: Sie haben an Dinge gedacht, die mir selbst gar nicht aufgefallen wären. Auch aus meinem Umfeld habe ich dazu schon mehrfach positives Feedback bekommen. Die Zusammenarbeit war dabei angenehm und unkompliziert. Wer Wert auf Qualität legt, ist bei Jannik & Lukas genau richtig.",
      // laut Jannik (07.10.2026)
      umgesetzt: "Ein KI-WhatsApp-Kundenservice, der Kundenanfragen sofort beantwortet, rund um die Uhr.",
    },
    {
      name: "Max TV",
      firma: "Betthupferl",
      logo: "betthupferl",
      href: "https://betthupferl-traunstein.de/",
      sterne: 5,
      datum: "Oktober 2026",
      text: "Absolut zuverlässig. Was abgemacht wurde, wurde auch eingehalten!",
      // laut Jannik (07.10.2026)
      umgesetzt: "Automatisierte Buchhaltung.",
    },
    {
      name: "zGraniT RxyaL",
      // Firma laut Jannik (07.10.2026)
      firma: "Brandmaier & Rauscher GbR",
      logo: "brandmaier-rauscher",
      href: "",
      sterne: 5,
      datum: "September 2026",
      text: "Absolute Empfehlung! Ich habe mich bei SvH Consulting von Anfang an sehr gut aufgehoben gefühlt. Die Beratung war professionell, kompetent und gleichzeitig angenehm persönlich. Auf meine Fragen wurde individuell eingegangen und alles verständlich und transparent erklärt. Besonders positiv fand ich die schnelle und unkomplizierte Kommunikation sowie die zuverlässige Betreuung. Man merkt, dass hier wirklich Wert auf die Bedürfnisse des Kunden gelegt wird. Vielen Dank für die tolle Zusammenarbeit, ich kann SvH Consulting uneingeschränkt weiterempfehlen!",
      umgesetzt: "Automatisierte Buchhaltung und automatisierte E-Mails.",
    },
  ] as Bewertung[],
};

export const teamB = {
  label: "Wer dahintersteckt",
  titel: "Wer das für dich _baut_",
  people: [
    // OFFEN: Fotos ("/b/lukas.jpg", "/b/jannik.jpg"); Texte sind Entwürfe, bitte prüfen und ergänzen
    {
      name: "Lukas Sehorz",
      rolle: "Gründer · Digitalisierung und Prozessoptimierung",
      initials: "LS",
      foto: "",
      linkedin: "https://www.linkedin.com/in/lukas-sehorz-324870242/",
      text: [
        "Lukas hat Digitalisierung und Prozessoptimierung studiert. Er findet die Stellen, an denen in deinem Betrieb jeden Tag Zeit verloren geht, und macht daraus Abläufe, die wie von selbst laufen.",
      ],
    },
    {
      name: "Jannik vom Hofe",
      rolle: "Gründer · KI und Kommunikation",
      initials: "JvH",
      foto: "",
      linkedin: "https://www.linkedin.com/in/jannik-vom-hofe-b525b53b4/",
      text: [
        "Jannik verfolgt jeden Tag, was sich bei KI tut, und zeigt auf YouTube, was davon für Betriebe wirklich zählt. Er übersetzt Technik in Alltagssprache, damit dein ganzes Team mitkommt.",
      ],
    },
  ],
  fotoFolgt: "Foto folgt",
  // LinkedIn-Profile stehen in den Gründer-Karten (vorher als eigene Zeile unter den Videos)
  linkedin: "LinkedIn",
  linkedinLabel: (name: string) => `${name} auf LinkedIn (neues Fenster)`,
};

export const aktuellesB = {
  label: "Aktuelles",
  title: "Was KI gerade für Betriebe _bedeutet_",
  // Beleg zum Gründer-Text von Jannik (der Kanal ist seiner: company.youtube). Steht seit Runde 3 weit hinter
  // den Gründern, deshalb „Mitgründer“ dazu, damit der Satz auch allein verständlich ist.
  text: "Mitgründer Jannik zeigt auf seinem YouTube-Kanal, was in der KI gerade passiert und was davon für deinen Betrieb wirklich zählt.",
  ansehen: "Video ansehen",
  alle: "Alle Videos auf YouTube",
  neuesFenster: " (YouTube, neues Fenster)",
  neuesFensterKurz: " (neues Fenster)",
};

// Nächster Schritt: schwarzer Kasten mit Bild-Logo links (Vorbild: andreasbaulig.de „Überzeuge dich selbst“)
// Runde 3: persönlich statt Wiederholung des Ablaufs, mit direktem Draht zu den Gründern
export const naechsterB = {
  titel: ["Überzeuge dich selbst.", "Ganz unverbindlich."],
  absaetze: [
    "Um uns kennenzulernen, musst du nichts kaufen. Im kostenlosen Workshop siehst du in 45 Minuten, wie wir arbeiten und ob wir zu deinem Betrieb passen.",
    "Wir sind Lukas und Jannik. Du sprichst bei uns immer direkt mit den Gründern, vom ersten Gespräch bis zur fertigen Automatisierung.",
  ],
  telefon: "Lieber erst kurz sprechen? Ruf uns direkt an:",
  schluss: "Mach noch heute den ersten Schritt.",
  // OFFEN: Foto von Lukas und Jannik zusammen (Hochformat), z. B. "/b/gruender-naechster.jpg"
  foto: "",
  fotoAlt: "Lukas Sehorz und Jannik vom Hofe, die Gründer von SvH Consulting",
  fotoFolgt: "Foto folgt",
};

/* Zahnräder: das Lösungsprinzip direkt nach dem Problem (Baulig: „Was dich erwartet“).
   Brücke: Problem „kein klarer Plan, lauter Einzel-Tools“ → Lösung „ein System“ → Leistungen 0–4 „so bauen wir es“. */
export const zahnradB = {
  label: "Die Lösung",
  titel: "Spare dir _systematisch_ Zeit, statt noch ein Tool zu kaufen.",
  text: "Wir machen es andersrum: KI kommt als Motor in die Mitte deines Betriebs. Dreht sich das große Rad, drehen alle Bereiche mit, und nichts wird doppelt gemacht.",
  // Darunter die sechs Gewinne aus problemB.vorteile (Titel: problemB.vorteileTitel)
  weiter: "Wie das genau abläuft",
  weiterHref: "#leistungen",
  mitte: "KI",
  // lang = Desktop, kurz = Handy (größere Schrift, deshalb mit Trennung)
  bereiche: [
    { lang: "Vertrieb", kurz: "Vertrieb" },
    { lang: "Marketing", kurz: "Marke-\nting" },
    { lang: "Buchhaltung", kurz: "Buch-\nhaltung" },
    { lang: "Kunden-\nservice", kurz: "Kunden-\nservice" },
    { lang: "Einkauf\n& Lager", kurz: "Einkauf\n& Lager" },
  ],
};

/* Masterplan (Lukas 06.10.2026: „muss nach einem geilen Masterplan aussehen, den man geschenkt bekommt“):
   dunkle Bühne, der Plan als gezeichnetes Druckstück mit Deckblatt, Siegel und drei Seiten, Anmerkungen ① ② ③.
   Fakten: 48 Std. nach dem Workshop, kostenlos, 5–10 Zeitfresser, Top 3, Lösungsweg mit Werkzeugen,
   gemeinsame Besprechung, gehört dir, Wert 1.099 € (Jannik, 05.10.2026).
   Alles unter „doc“ sind erfundene Beispiele (nur Abbildung, für Screenreader ausgeblendet, sichtbar als „Beispiel“ markiert). */
export const masterplanB = {
  label: "Das bekommst du",
  titel: "Dein _KI-Masterplan_.",
  unter: "Der Fahrplan, mit dem dein Betrieb jede Woche Zeit gewinnt.",
  intro: "48 Stunden nach dem Workshop liegt er fertig bei dir. Kostenlos.",
  punkte: [
    { titel: "Deine Zeitfresser", text: "Die 5\u00a0bis\u00a010 größten Zeitfresser, schwarz auf weiß." },
    { titel: "Deine Top 3 Automatisierungen", text: "Wo du mit wenig Aufwand am meisten Zeit oder Geld sparst." },
    { titel: "So setzt du es um", text: "Welche Werkzeuge es braucht und wie du vorgehst. Danach gehen wir alles gemeinsam durch." },
  ],
  beispiel: "Beispiel. Dein Plan entsteht für deinen Betrieb.",
  // Kennzeichnung über den drei Teilen (Reihenfolge)
  reihe: ["Zuerst", "Dann", "Zum Schluss"],
  preis: { label: "Wert des Masterplans", alt: "1.099\u00a0€", neu: "0\u00a0€", text: "Er gehört dir. Umsetzen kannst du ihn mit uns oder mit deinem eigenen Team." },
  mikro: ["45\u00a0Minuten", "unverbindlich", "Plan nach 48\u00a0Std."],
  doc: {
    titel: "KI-Masterplan",
    fuer: "für deinen Betrieb",
    von: "erstellt von SvH Consulting",
    // Siegel auf dem Deckblatt: nur der Wert, die Auflösung „0 €“ steht erst im Preisblock
    siegel: { ring: "KI-Masterplan · für deinen Betrieb", wert: "Wert", betrag: "1.099 €" },
    fuss: "SvH Consulting",
    beispiel: "Beispiel",
    zeitfresser: {
      kicker: "Analyse",
      titel: "Deine Zeitfresser",
      einheit: "Stunden pro Woche",
      zeilen: [
        { name: "Angebote schreiben", std: 9 },
        { name: "E-Mails sortieren", std: 7 },
        { name: "Daten abtippen", std: 6 },
        { name: "Infos suchen", std: 5 },
        { name: "Kunden nachfassen", std: 4 },
        { name: "Termine abstimmen", std: 3 },
      ],
      summe: "Zusammen",
      summeWert: "34 Std./Woche",
    },
    top3: {
      kicker: "Empfehlung",
      titel: "Deine Top 3",
      aufwand: "Aufwand",
      zeilen: [
        { titel: "Angebote automatisch erstellen", spart: "spart ca. 7 Std./Woche", aufwand: "gering", stufe: 1, werkzeuge: ["CRM", "KI-Assistent"] },
        { titel: "E-Mail-Assistent", spart: "spart ca. 5 Std./Woche", aufwand: "gering", stufe: 1, werkzeuge: ["Postfach", "KI"] },
        { titel: "Wissensspeicher", spart: "spart ca. 4 Std./Woche", aufwand: "mittel", stufe: 2, werkzeuge: ["Ablage", "KI-Suche"] },
      ],
    },
    fahrplan: {
      kicker: "Fahrplan",
      titel: "So setzt du es um",
      werkzeugeTitel: "Deine Werkzeuge",
      schritte: [
        { wann: "Start", was: "Plan gemeinsam besprechen", wie: "mit SvH Consulting" },
        { wann: "Schritt 1", was: "Angebote automatisieren", wie: "CRM + KI-Assistent" },
        { wann: "Schritt 2", was: "E-Mail-Assistent einrichten", wie: "Postfach + KI" },
        { wann: "Schritt 3", was: "Wissensspeicher aufbauen", wie: "Ablage + KI-Suche" },
      ],
    },
  },
};

// Auswahl aus den Fragen von Variante A
export const fragenB = {
  label: "Fragen",
  title: "Was Unternehmer uns vorher fragen.",
  nochFragen: "Deine Frage ist nicht dabei? Ruf uns einfach an:",
  items: [
    { q: "Was kostet mich der Workshop?", a: "Nichts. Der Workshop, der KI-Masterplan und die Besprechung sind kostenlos, und du gehst dabei keine Verpflichtung ein." },
    { q: "Und was kostet die Umsetzung?", a: "Das hängt davon ab, was wir bauen. Nach dem Masterplan bekommst du ein Angebot mit einem klaren Preis. Erst dann entscheidest du, und für die Umsetzung gilt unsere Geld-zurück-Garantie." },
    { q: "Wo ist der Haken?", a: "Es gibt keinen. Wir verdienen erst dann Geld, wenn du dich entscheidest, den Plan mit uns umzusetzen. Wenn nicht, hast du trotzdem einen fertigen Plan in der Hand." },
    { q: "Wir kennen uns mit KI gar nicht aus. Ist das ein Problem?", a: "Im Gegenteil, genau dafür sind wir da. Wir erklären alles in normaler Sprache und zeigen deinem Team Schritt für Schritt, wie die Helfer funktionieren." },
    { q: "Lohnt sich das auch für kleinere Betriebe?", a: "Ja. Gerade dort fällt jede gewonnene Stunde auf. Im Workshop sehen wir gemeinsam, ob und wo es sich für dich rechnet." },
    { q: "Was passiert mit unseren Daten?", a: "Das besprechen wir offen im Workshop. Wir wählen Werkzeuge, die zu deinen Anforderungen an den Datenschutz passen, und bauen nur, was du verstehst und freigibst." },
    { q: "Wie funktioniert die Geld-zurück-Garantie?", a: "Vor dem Start legen wir gemeinsam schriftlich fest, wie viel Zeit oder Geld die Umsetzung sparen soll. Wird das Ziel verfehlt, bekommst du dein Geld zurück. Die genauen Bedingungen stehen in deinem Angebot." },
    { q: "Sind wir danach von euch abhängig?", a: "Nein. Alles, was wir bauen, schreiben wir auf und übergeben es an dein Team. Du kannst jederzeit selbst weitermachen." },
  ],
};

// Anmeldung: Felder und Werte passend zu /api/anfrage (gleiche Liste wie Variante A)
// Anmeldung im Fenster (öffnet sich bei jedem Knopf „Kostenlosen KI-Workshop sichern“)
// Für wen: ehrliche Ja/Nein-Liste vor den Fragen (Baulig: „Für wen ist das?“)
export const fuerWenB = {
  label: "Passt das zu dir?",
  titel: "Für wen das _passt_, und für wen nicht.",
  ja: {
    titel: "Das passt, wenn …",
    punkte: [
      "dein Team jede Woche Stunden mit Abtippen, Angeboten oder E‑Mails verbringt", // geschützter Bindestrich: nie „E- / Mails“
      "du wachsen willst, ohne gleich neue Leute einzustellen",
      "ihr KI schon ausprobiert habt, es aber noch nicht richtig läuft",
      "du offen bist, Abläufe zu ändern, wenn es sich lohnt",
    ],
  },
  nein: {
    titel: "Das passt nicht, wenn …",
    punkte: [
      "du nur ein weiteres Tool-Abo suchst",
      "du eine Wunderlösung ohne jede Mitarbeit erwartest",
      "in deinem Betrieb alles bleiben soll, wie es ist",
    ],
  },
};

// Abschluss ganz unten (Baulig: letzter Aufruf), Satz wie das LinkedIn-Banner
export const abschlussB = {
  label: "Dein Start",
  titel: "Wir stellen die KI auf, _du gewinnst die Zeit_.",
  text: "Starte mit dem kostenlosen KI-Workshop. 45 Minuten, danach weißt du, wo dein Betrieb jede Woche Zeit verliert und was sich zuerst lohnt.",
  punkte: ["0 € für Workshop und Masterplan", "Der Plan gehört dir, egal wie du dich entscheidest", "Geld-zurück-Garantie auf die Umsetzung"],
};

export const terminB = {
  label: "Dein nächster Schritt",
  title: "Sichere dir deinen kostenlosen _KI\u2011Workshop_.", // geschützter Bindestrich: nie „KI- / Workshop“
  text: "Trag dich in zwei Minuten ein. Wir melden uns persönlich bei dir und finden einen Termin, der dir passt.",
  schliessen: "Schließen",
  danachTitel: "So geht es weiter",
  danach: [
    "Wir melden uns persönlich, um einen Termin zu finden.",
    "Im kostenlosen Workshop finden wir deine größten Zeitfresser.",
    "48 Stunden danach hältst du deinen KI-Masterplan in der Hand.",
  ],
  direkt: "Lieber direkt sprechen?",
  form: {
    tasks: "Was frisst bei dir am meisten Zeit?",
    tasksHint: "Mehrfachauswahl",
    hours: "Wie viele Stunden pro Woche kostet das dein Team ungefähr?",
    hoursUnit: "Std. pro Woche",
    hoursCalc: (h: number) => `Das sind rund ${h * 52} Stunden im Jahr.`,
    size: "Wie viele Mitarbeiter hat dein Betrieb?",
    name: "Dein Name",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    message: "Möchtest du uns noch etwas sagen?",
    optional: "optional",
    consentBefore: "Ich bin einverstanden, dass SvH Consulting meine Angaben zur Bearbeitung der Anfrage verwendet. Mehr dazu in der ",
    consentLink: "Datenschutzerklärung",
    consentAfter: ".",
    submit: "Kostenlosen KI-Workshop sichern",
    sending: "Wird gesendet",
    below: "Kostenlos · unverbindlich · deine Angaben bleiben bei uns",
    errors: {
      tasks: "Bitte wähle mindestens eine Aufgabe aus.",
      employees: "Bitte wähle die Größe deines Betriebs.",
      name: "Bitte gib deinen Namen an.",
      company: "Bitte gib deine Firma an.",
      email: "Bitte gib eine gültige E-Mail-Adresse an.",
      consent: "Bitte bestätige kurz dein Einverständnis.",
    },
    success: (first: string) => (first ? `Danke, ${first}! Deine Anfrage ist bei uns.` : "Danke! Deine Anfrage ist bei uns."),
    successText: "Wir melden uns persönlich bei dir, um einen Termin für deinen KI-Workshop zu finden.",
    fallback: "Dein E-Mail-Programm öffnet sich mit deiner Nachricht an uns. Du musst sie nur noch abschicken.",
    fallbackLink: "E-Mail-Programm erneut öffnen",
    failure: "Das hat leider nicht geklappt. Ruf uns gern direkt an oder schreib uns eine E-Mail:",
  },
};

export const footerB = {
  claim: "Wir machen KI so einfach, dass jeder sie versteht.",
  kontakt: "Kontakt",
  bereiche: "Auf dieser Seite",
  seiten: "Rechtliches",
  links: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
  ],
  copyright: "© 2026 SvH Consulting · Sehorz Lukas, vom Hofe Jannik GbR",
};
