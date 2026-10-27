/*
 * Gemeinsame Texte, wortgetreu aus TEXTE.md: Knopf, Leiste (Bedienhinweise), Aktuelles,
 * Rechtsseiten, 404 und die Felder/Mail des Formulars (abschluss, genutzt von /api/anfrage).
 * Die Texte der Startseite stehen in app/copy-b.ts. Die Abschnitte der früheren Variante A
 * (hero, chaos, schalter, loesungen, geschenk, spielzug, garantie, team, fragen, einwilligung)
 * sind am 06.10.2026 entfernt worden; sie liegen in der Git-Historie (Commit eac09df).
 * Auszeichnung in Überschriften: _Wort_ = Verlaufswort.
 *
 * Texte, die NICHT in TEXTE.md stehen, sind mit „// ZUSATZ“ markiert
 * (Bedienhinweise, Fehlermeldungen und 404 von der alten Seite).
 */

export const meta = {
  title: "KI-Automatisierung für den Mittelstand | SvH Consulting",
  description:
    "Wir bauen digitale Helfer, die die immer gleiche Arbeit in deinem Betrieb übernehmen. Starte mit einem kostenlosen KI-Workshop und deinem persönlichen KI-Masterplan.",
  ogAlt: "Wir stellen die KI auf, du gewinnst die Zeit.",
};

export const cta = {
  main: "Kostenlosen KI-Workshop sichern",
  nav: "Kostenloser KI-Workshop",
};

export const nav = {
  links: [
    { label: "Lösungen", href: "#loesungen", id: "loesungen" }, // ZUSATZ (30.09.2026)
    { label: "So läuft es ab", href: "#fahrplan", id: "fahrplan" },
    { label: "Ergebnisse", href: "#ergebnisse", id: "ergebnisse" },
    { label: "Masterplan", href: "#masterplan", id: "masterplan" },
    { label: "Fragen", href: "#fragen", id: "fragen" },
  ],
  aktuelles: "Aktuelles",
  panelTitle: "Neu auf dem Kanal",
  allVideos: "Alle Videos ansehen",
  channel: "YouTube-Kanal",
  menuOpen: "Menü öffnen", // ZUSATZ (Bedienhinweis für Screenreader)
  menuClose: "Menü schließen", // ZUSATZ
  home: "SvH Consulting, zur Startseite", // ZUSATZ
  skip: "Zum Inhalt springen", // ZUSATZ
};

export const ergebnisse = {
  label: "Ergebnisse",
  big: "35+",
  bigLabel: "umgesetzte Projekte",
  title: "Stunden, die unsere\u00a0Kunden _zurückbekommen_\u00a0haben.",
  builtLabel: "Was wir gebaut haben", // Beschriftung laut TEXTE.md
  cases: [
    {
      id: "estera",
      name: "Estera GmbH",
      branche: "Kapitalanlageimmobilien, München",
      built: "Eine neue Webseite, eine digitale Kundenverwaltung (CRM) und smarte Automatisierungen dahinter.",
      resultPrefix: "bis zu ",
      resultNumber: 160,
      resultSuffix: " Std.",
      resultText: "bis zu 160 Std.",
      resultSub: "pro Woche gespart",
      translated: "So viel Arbeit wie vier Vollzeitstellen.",
      link: { label: "estera.immobilien", href: "https://estera.immobilien" },
      image: "/referenzen/estera-1600.webp",
      alt: "Startseite von estera.immobilien", // ZUSATZ (Alt-Text)
    },
    {
      id: "fuchs",
      name: "Fuchs Pools",
      branche: "Poolbau aus Niederbayern",
      built: "Eine neue Webseite, automatische Angebotserstellung und automatisiertes Marketing.",
      resultPrefix: "+",
      resultNumber: 15,
      resultSuffix: " Std.",
      resultText: "+15 Std.",
      resultSub: "pro Woche gespart",
      translated: "Fast zwei volle Arbeitstage, jede Woche.",
      link: { label: "fuchspools.com", href: "https://fuchspools.com" },
      image: "/referenzen/fuchs-1600.webp",
      alt: "Startseite von fuchspools.com", // ZUSATZ (Alt-Text)
    },
    {
      // TODO Referenz folgt: Name, Branche, Screenshot und Link nachtragen
      id: "platzhalter",
      name: "Referenz folgt",
      branche: "",
      built: "Automatische Angebotserstellung mit einem KI-Wissensspeicher.",
      resultPrefix: "",
      resultNumber: 0,
      resultSuffix: "",
      resultText: "1 Tag → 30 Min.",
      resultSub: "pro Angebot",
      translated: "Sechzehnmal schneller als vorher.",
      link: null,
      image: null,
      alt: "",
    },
  ],
  ctaLine: "Was ist bei dir möglich? Das finden wir gemeinsam heraus.",
  newWindow: "öffnet in neuem Fenster", // ZUSATZ (Screenreader)
};

export const abschluss = {
  label: "Dein nächster Schritt",
  title: "Hol dir deine Zeit *zurück*.",
  text: "Sichere dir deinen kostenlosen KI-Workshop. 48 Stunden danach hältst du deinen KI-Masterplan in der Hand.",
  // ZUSATZ (Zeile neben dem Masterplan-Deckblatt am Formular)
  gift: { title: "Dein KI-Masterplan", when: "48 Stunden nach dem Workshop", price: "0 €" },
  stepOf: (n: number) => `Schritt ${n} von 3`,
  step1: {
    title: "Was frisst bei dir am meisten Zeit?",
    hint: "Mehrfachauswahl",
    vorgemerkt: "Aus dem Schalter vorgemerkt", // ZUSATZ (Hinweis, wenn Kacheln im Schalter vorgemerkt wurden)
    tiles: [
      "Angebote schreiben",
      "E-Mails beantworten",
      "Daten abtippen",
      "Rechnungen und Belege",
      "Termine koordinieren",
      "Kunden nachfassen",
      "Wissen suchen",
      "Berichte erstellen",
      "Bewerbungen sichten",
      "Etwas anderes",
    ],
    slider: "Wie viele Stunden pro Woche kostet das dein Team ungefähr?",
    calc: (h: number) => {
      const year = h * 52;
      const weeks = Math.round(year / 40);
      return { year, weeks };
    },
    calcBefore: "Grob gerechnet sind das ",
    calcMid: " Stunden im Jahr. So viel wie ",
    calcAfter: " volle Arbeitswochen.",
    unit: "Std. pro Woche", // ZUSATZ (Einheit am Regler)
  },
  step2: {
    title: "Erzähl kurz von deinem Betrieb",
    question: "Wie viele Mitarbeiter hat dein Betrieb?",
    sizes: ["1 bis 9", "10 bis 29", "30 bis 80", "mehr als 80"],
    industry: "Branche",
  },
  step3: {
    title: "Wohin dürfen wir uns melden?",
    name: "Dein Name",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    message: "Möchtest du uns noch etwas sagen?",
    consentBefore: "Ich bin einverstanden, dass SvH Consulting meine Angaben zur Bearbeitung der Anfrage verwendet. Mehr dazu in der ",
    consentLink: "Datenschutzerklärung",
    consentAfter: ".",
  },
  optional: "optional",
  next: "Weiter",
  back: "Zurück",
  submit: "Kostenlosen KI-Workshop sichern",
  sending: "Wird gesendet", // ZUSATZ (alte Seite)
  below: "Kostenlos · unverbindlich · deine Angaben bleiben bei uns",
  success: (first: string) => (first ? `Danke, ${first}! Deine Anfrage ist bei uns.` : "Danke! Deine Anfrage ist bei uns."),
  // Seit Runde 5 nicht mehr angezeigt: Schritt 1 von „danach“ sagt dasselbe (sonst doppelt)
  successText: "Wir melden uns persönlich bei dir, um einen Termin für deinen KI-Workshop zu finden.",
  // ZUSATZ: nächste Schritte unter der Erfolgsmeldung
  danach: {
    title: "So geht es weiter",
    steps: [
      "Wir melden uns persönlich, um einen Termin zu finden.",
      "Im kostenlosen Workshop finden wir deine größten Zeitfresser.",
      "48 Stunden danach hältst du deinen KI-Masterplan in der Hand.",
    ],
  },
  errorBefore: "Das hat leider nicht geklappt. Ruf uns gern direkt an unter ",
  errorMid: " oder schreib an ",
  errorAfter: ".",
  // ZUSATZ: Hinweis ohne JavaScript (danach Telefon, errorMid, E-Mail, errorAfter)
  noscriptBefore: "Das Formular lässt sich ohne JavaScript nicht absenden. Ruf uns gern direkt an unter ",
  // ZUSATZ (alte Seite): erscheint, wenn der Versand über die Seite noch nicht eingerichtet ist
  fallback: "Dein E-Mail-Programm öffnet sich mit deiner Nachricht an uns. Du musst sie nur noch abschicken.",
  errors: {
    // ZUSATZ: freundliche Hinweise der Formularprüfung
    tasks: "Bitte wähle mindestens eine Aufgabe aus.",
    size: "Bitte wähle die Größe deines Betriebs.",
    name: "Bitte gib deinen Namen an.",
    company: "Bitte gib deine Firma an.",
    email: "Bitte gib deine E-Mail-Adresse an.",
    emailInvalid: "Diese E-Mail-Adresse sieht unvollständig aus.",
    consent: "Bitte bestätige kurz dein Einverständnis.",
  },
  direct: {
    title: "Lieber direkt sprechen?",
    hours: "Montag bis Sonntag von 8 bis 21 Uhr",
  },
  mail: {
    brand: "SvH Consulting",
    title: "Neue Anfrage für den KI-Workshop",
    subject: "KI-Workshop-Anfrage von",
    none: "keine Angabe",
    replyNote: "Antworte einfach auf diese E-Mail, die Antwort geht an",
    // ZUSATZ (nur in der Mail an uns): Hochrechnung und Nachweis der Einwilligung
    yearValue: (year: string, weeks: string) => `${year} Stunden, so viel wie ${weeks} volle Arbeitswochen`,
    consentLine: "Einwilligung zur Bearbeitung der Anfrage erteilt am",
    labels: {
      tasks: "Zeitfresser",
      hours: "Stunden pro Woche",
      year: "Hochgerechnet im Jahr",
      employees: "Mitarbeiter",
      industry: "Branche",
      name: "Name",
      company: "Firma",
      email: "E-Mail",
      phone: "Telefon",
      message: "Nachricht",
    },
  },
};

export const footer = {
  claim: "Wir stellen die KI auf, du gewinnst die Zeit.",
  contactTitle: "Kontakt", // ZUSATZ (Spaltentitel)
  linksTitle: "Seiten", // ZUSATZ (Spaltentitel)
  links: [
    { label: "Aktuelles", href: "/aktuelles" },
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
  ],
  consent: "Cookie-Einstellungen",
  copyright: "© 2026 SvH Consulting · Sehorz Lukas, vom Hofe Jannik GbR",
  watermark: "CONSULTING",
};

export const aktuelles = {
  meta: {
    title: "Aktuelles",
    description:
      "Jannik zeigt auf seinem Kanal, was in der KI gerade passiert und was davon für einen Betrieb wirklich zählt. Die neuesten Videos stehen hier.",
  },
  label: "Aktuelles",
  title: "Was sich in der KI gerade _bewegt_.",
  text: "Jannik zeigt auf seinem Kanal, was in der KI gerade passiert und was davon für einen Betrieb wirklich zählt. Die neuesten Videos stehen hier.",
  hint: "Ein Klick öffnet das Video auf YouTube in einem neuen Fenster.",
  channel: { label: "Alle Videos auf YouTube", href: "https://www.youtube.com/@jannikvomhofe" },
  watch: "Video ansehen", // alte Seite
  latest: "Neuestes Video", // ZUSATZ (Beschriftung)
  // Alle normalen Videos des Kanals, neueste zuerst (Stand 27.10.2026: 11, keine Shorts). Titel und Datum wortgetreu
  // von der Videoseite (yt-dlp/oEmbed). Zwei Titel testet YouTube gerade im A/B-Test (S5vHUX64f-4, aE8OmUYeTKM):
  // in der Kanalliste wechselt die Fassung, hier steht der Haupttitel der Videoseite. body = kurze Inhaltsangabe nach
  // der Videobeschreibung (für /aktuelles und die strukturierten Daten). Die unteren vier stammen aus der alten Seite.
  videos: [
    {
      id: "ryUl59kvblo",
      titel: "In 5 Jahren sind alle Bürojobs weg...",
      datum: "25. Oktober 2026",
      datumIso: "2026-10-25",
      body: "KI-Forscher Marcus Hutter sagt, KI kann in zwei bis fünf Jahren alle Bürojobs ersetzen. Welche Berufe es zuerst trifft, warum das Handwerk gewinnt und was Firmen droht, die abwarten.",
      href: "https://www.youtube.com/watch?v=ryUl59kvblo",
      bild: "/aktuelles/ryUl59kvblo.webp",
      alt: "Vorschaubild des Videos darüber, ob KI alle Bürojobs ersetzt",
    },
    {
      id: "S5vHUX64f-4",
      titel: "Das sagt der CEO der wertvollsten Firma der Welt über Deutschland...",
      datum: "21. Oktober 2026",
      datumIso: "2026-10-21",
      body: "Nvidia-Chef Jensen Huang sieht Deutschland bei KI zurückfallen. Was der Berliner KI-Pakt bringt, was bei Tests mit KI-Agenten passiert ist und drei Regeln für den sicheren Einsatz im Unternehmen.",
      href: "https://www.youtube.com/watch?v=S5vHUX64f-4",
      bild: "/aktuelles/S5vHUX64f-4.webp",
      alt: "Vorschaubild des Videos über Nvidia-Chef Jensen Huang und Deutschland bei KI",
    },
    {
      id: "aE8OmUYeTKM",
      titel: "Dieses Open AI Update übersieht aktuell jeder",
      datum: "19. Oktober 2026",
      datumIso: "2026-10-19",
      body: "ChatGPT sitzt jetzt als Seitenleiste im Browser und füllt selbst Formulare aus. Vier Anwendungen, die jede Woche Stunden sparen, und drei Grenzen, die eine Firma kennen muss.",
      href: "https://www.youtube.com/watch?v=aE8OmUYeTKM",
      bild: "/aktuelles/aE8OmUYeTKM.webp",
      alt: "Vorschaubild des Videos über das neue ChatGPT-Update im Browser",
    },
    {
      id: "DDEN6fFHAO8",
      titel: "Dieses Tool beerdigt teure Software",
      datum: "15. Oktober 2026",
      datumIso: "2026-10-15",
      body: "Ein Entwickler hat Photoshop mit KI nachgebaut und verschenkt es. Was KI beim Nachbauen von Software wirklich kann und warum gratis für eine Firma teuer werden kann.",
      href: "https://www.youtube.com/watch?v=DDEN6fFHAO8",
      bild: "/aktuelles/DDEN6fFHAO8.webp",
      alt: "Vorschaubild des Videos über kostenlose KI-Nachbauten teurer Software",
    },
    {
      id: "-8sNdu4Zas0",
      titel: "Studieren lohnt sich nicht mehr? Die unbequeme Wahrheit",
      datum: "11. Oktober 2026",
      datumIso: "2026-10-11",
      body: "Über zwei Drittel weniger Stellenanzeigen für Berufseinsteiger als im Sommer 2022. Wo KI wirklich Einstiegsjobs kostet, wo sie nur als Ausrede dient, und vier Tipps für den Berufseinstieg.",
      href: "https://www.youtube.com/watch?v=-8sNdu4Zas0",
      bild: "/aktuelles/-8sNdu4Zas0.webp",
      alt: "Vorschaubild des Videos über Studium, Berufseinstieg und KI",
    },
    {
      id: "G7hMwDAlbwE",
      titel: "ES BEGINNT... Der Anfang vom Ende der Menschheit (KI bricht aus)",
      datum: "8. Oktober 2026",
      datumIso: "2026-10-08",
      body: "72 Stunden, in denen eine KI aus ihrem Käfig ausbricht. Das Szenario ist erfunden, aber nach jeder Szene zeigt Jannik, was davon dieses Jahr schon wirklich passiert ist.",
      href: "https://www.youtube.com/watch?v=G7hMwDAlbwE",
      bild: "/aktuelles/G7hMwDAlbwE.webp",
      alt: "Vorschaubild des Videos über ein Szenario, in dem KI-Agenten ausbrechen",
    },
    {
      id: "aLHvghLugok",
      titel: "Das ist AKTUELL das beste KI-Modell und es ist nicht mal knapp",
      datum: "29. September 2026",
      datumIso: "2026-09-29",
      body: "Fast jede Woche kommt ein neues KI-Modell. Ein Ranking, welche Modelle sich wirklich lohnen und welches für welche Aufgabe am besten passt.",
      href: "https://www.youtube.com/watch?v=aLHvghLugok",
      bild: "/aktuelles/aLHvghLugok.webp",
      alt: "Vorschaubild des Videos mit einem Ranking der KI-Modelle",
    },
    {
      id: "neS8seYIg10",
      titel: "Das einzige KI-Video, das DU als CEO sehen musst | Top 9 aktuelle Praxis-Use Cases",
      datum: "16. September 2026",
      datumIso: "2026-09-16",
      body: "Neun KI-Anwendungen aus echten Projekten, von der Buchhaltung bis zum Angebot. Welche davon bringt einem Betrieb am meisten?",
      href: "https://www.youtube.com/watch?v=neS8seYIg10",
      bild: "/aktuelles/neS8seYIg10.webp",
      alt: "Vorschaubild des Videos über neun KI-Anwendungen aus der Praxis",
    },
    {
      id: "FS5eb2cIzHE",
      titel: "Ohne DIESE KI-Anwendung hat dein Unternehmen keine ZUKUNFT...",
      datum: "2. September 2026",
      datumIso: "2026-09-02",
      body: "Was ein Corporate LLM ist, wie es das Wissen eines Betriebs an einen Ort holt und warum Betriebe ohne eigene KI-Strategie den Anschluss verlieren.",
      href: "https://www.youtube.com/watch?v=FS5eb2cIzHE",
      bild: "/aktuelles/FS5eb2cIzHE.webp",
      alt: "Vorschaubild des Videos über Corporate LLM",
    },
    {
      id: "ATlHA9p3zXc",
      titel: "Der TEUERSTE Fehler deutscher Firmen ...",
      datum: "27. August 2026",
      datumIso: "2026-08-27",
      body: "Warum die meisten KI-Vorhaben im Mittelstand nicht am Modell scheitern, sondern an etwas ganz anderem.",
      href: "https://www.youtube.com/watch?v=ATlHA9p3zXc",
      bild: "/aktuelles/ATlHA9p3zXc.webp",
      alt: "Vorschaubild des Videos über gescheiterte KI-Projekte",
    },
    {
      id: "e6zwbX6KXnU",
      titel: "A Week in the Life of a 23 year old AI Agency Owner",
      datum: "18. August 2026",
      datumIso: "2026-08-18",
      body: "Ein Blick hinter die Kulissen. Eine Woche im Alltag einer jungen KI-Agentur.",
      href: "https://www.youtube.com/watch?v=e6zwbX6KXnU",
      bild: "/aktuelles/e6zwbX6KXnU.webp",
      alt: "Vorschaubild des Videos über eine Arbeitswoche in der Agentur",
    },
  ],
};

// ZUSATZ: Seite nicht gefunden, Texte von der alten Seite
export const notFound = {
  label: "404",
  title: "Diese Adresse führt ins _Leere._",
  lead: "Vielleicht ist die Adresse falsch geschrieben, oder die Seite ist umgezogen. Von hier aus findest du zurück.",
  home: "Zur Startseite",
  metaTitle: "Seite nicht gefunden", // ZUSATZ (Seitentitel, alte Seite)
};

export const legal = {
  label: "Rechtliches",
  note: "Dieser Text ersetzt keine Rechtsberatung.",
  toc: "Inhalt", // ZUSATZ (Inhaltsverzeichnis der Rechtsseiten)
};
