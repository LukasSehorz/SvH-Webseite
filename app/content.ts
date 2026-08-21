/**
 * Zentrale Inhalts-Datei für die SVH-Consulting-Website.
 *
 * Alles, was hier mit  ❗TODO  markiert ist, sind Platzhalter: es sind Angaben,
 * die für SVH Consulting noch nicht belegt sind (Kundenstimmen, Referenzen,
 * Kennzahlen). Bitte durch echte Daten ersetzen, bevor die Seite live geht.
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
  email: "kontakt@svh-consulting.de", // ❗TODO: finale Adresse eintragen
  hours: "Montag bis Sonntag, 8:00 – 21:00 Uhr",
  partners: ["Lukas Sehorz", "Jannik vom Hofe"],
};

/**
 * Hauptnavigation. Einträge ohne `items` sind einfache Links,
 * Einträge mit `items` öffnen ein Aufklappmenü (Titel + einzeiliger Hinweis).
 */
export type NavItem = {
  label: string;
  href: string;
  items?: { label: string; hint: string; href: string }[];
};

export const nav = {
  links: [
    {
      label: "Leistungen",
      href: "/leistungen",
      items: [
        {
          label: "KI-Automatisierung & Agenten",
          hint: "Abläufe, die von allein laufen.",
          href: "/leistungen/ki-automatisierung-agenten",
        },
        {
          label: "Marketing",
          hint: "Social Media und Werbe-Displays vor Ort.",
          href: "/leistungen/marketing",
        },
        {
          label: "Webseiten",
          hint: "Seiten, die Anfragen bringen.",
          href: "/leistungen/webseiten",
        },
        {
          label: "Alle Leistungen",
          hint: "Die drei Bereiche im Überblick.",
          href: "/leistungen",
        },
      ],
    },
    { label: "Fallstudien", href: "/ressourcen/fallstudien" },
    {
      label: "Ressourcen",
      href: "/ressourcen/blog",
      items: [
        {
          label: "Blog",
          hint: "Praktisches zu KI, Marketing und Web.",
          href: "/ressourcen/blog",
        },
        {
          label: "Fallstudien",
          hint: "Projekte im Detail.",
          href: "/ressourcen/fallstudien",
        },
      ],
    },
    {
      label: "Über uns",
      href: "/unternehmen/ueber-uns",
      items: [
        {
          label: "Unternehmen",
          hint: "Wer wir sind und wie wir arbeiten.",
          href: "/unternehmen/ueber-uns",
        },
        {
          label: "Kontakt",
          hint: "Direkt mit uns sprechen.",
          href: "/unternehmen/kontakt",
        },
      ],
    },
  ] satisfies NavItem[],
  cta: { label: "Kostenloses Strategiegespräch", href: "/unternehmen/kontakt" },
};

export const hero = {
  eyebrow: "Für lokale Betriebe, Agenturen & B2B-Unternehmen.",
  titleLine1: "Automatisieren, Optimieren",
  titleLine2: "& Skalieren – mit KI.",
  lead: "Wir nehmen Ihrem Team die Fleißarbeit ab: KI-Automatisierungen und Agenten übernehmen wiederkehrende Abläufe, Ihr Marketing läuft planbar und Ihre Webseite bringt Anfragen – ganz ohne zusätzliches Personal.",
  primary: { label: "Kostenloses Strategiegespräch", href: "/unternehmen/kontakt" },
  secondary: { label: "Unsere Leistungen", href: "#leistungen" },
  chips: [
    "Business-Automatisierung",
    "KI-Agenten für Support & Vertrieb",
    "CRM-Einrichtung & Anbindung",
    "Social-Media-Betreuung",
    "Digitale Werbe-Displays",
    "Webseiten, die Anfragen bringen",
    "Wissensdatenbank & Prozesse",
  ],
  trustLine: "Womit wir arbeiten.",
};

/** Laufband unter dem Hero — zwei gegenläufige Reihen. */
export const marquee = {
  rowA: [
    "KI-Automatisierung",
    "WhatsApp-Kundensupport",
    "Voice- & Chat-Agenten",
    "CRM-Einrichtung",
    "Wissensdatenbank",
    "Angebots-Automatisierung",
  ],
  rowB: [
    "Social-Media-Marketing",
    "Digitale Werbe-Displays",
    "Meta- & TikTok-Kampagnen",
    "Content-Produktion",
    "Webseiten & Landingpages",
    "SEO-Grundlagen",
  ],
};

export const introStatement =
  "Wir bauen maßgeschneiderte KI-Automationen und Agenten, die Ihrem Team die Fleißarbeit abnehmen und Ihre Prozesse auf Autopilot laufen lassen. Dazu übernehmen wir Ihr Social-Media-Marketing, stellen digitale Werbe-Displays für lokale Betriebe auf und bauen Webseiten, die messbar Anfragen bringen. Hands-on umgesetzt, mit Ergebnissen in Wochen, nicht Quartalen.";

/** „Womit wir arbeiten" — echte Werkzeuge, keine erfundenen Kundenlogos. */
export const toolLogos = [
  "n8n",
  "Make",
  "OpenAI",
  "HubSpot",
  "Meta",
  "Google",
  "Anthropic",
  "Zapier",
];

export const impact = {
  titleLine1: "Maximieren Sie Ihre Gewinne",
  titleLine2: "& Effizienz",
  subtitle: "mit intelligenten KI-Automatisierungen & Agenten",
  cards: [
    {
      body: "Das schaffen wir, indem wir unpraktische Abläufe ganz einfach automatisieren.",
      label: "Gewinne steigern",
      badge: "Bis zu",
      value: 65,
      suffix: "%",
    },
    {
      body: "Befreiung von alltäglichen, wiederkehrenden Aufgaben – Ihr Team gewinnt Zeit zurück.",
      badge: "Bis zu",
      value: 25,
      suffix: "h",
      note: "pro Woche",
    },
    {
      body: "Unser Rundum-sorglos-Service optimiert Ihre Abläufe und bringt Schwung in Ihre Effizienz.",
      badge: "Optimiert",
      headline: "Nachhaltiges Wachstum",
      note: "mit minimalem Aufwand für Sie.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Die drei Säulen — Leistungen                                              */
/* -------------------------------------------------------------------------- */

export type Pillar = {
  id: "ki" | "marketing" | "web";
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** Detailseite unter /leistungen/… */
  href: string;
};

export const servicesIntro = {
  title: "Drei Leistungen. Ein System.",
  subtitle:
    "Alles, was Sie brauchen, um mit Klarheit und Wirkung zu wachsen. Keine Vorlagen, kein Rätselraten – wir bauen maßgeschneiderte Lösungen, die Ihr Geschäft voranbringen.",
};

export const pillars: Pillar[] = [
  {
    id: "ki",
    href: "/leistungen/ki-automatisierung-agenten",
    eyebrow: "01 — Automatisierung",
    title: "KI-Automatisierung & Agenten",
    body: "Wir erstellen Workflows, die wirklich funktionieren – wir richten CRM-, Marketing- und Verkaufssysteme ein, bereinigen und verbinden sie zu einem reibungslosen, automatisierten System. Dazu bauen wir KI-Agenten, die Kundensupport, Marketing und Vertrieb wie ein Teammitglied übernehmen.",
    points: [
      "Maßgeschneiderte Automationen, die Ihre Werkzeuge miteinander verbinden",
      "KI-Agenten für Support, Vertrieb und Backoffice – rund um die Uhr",
      "CRM-Einrichtung, Datenbereinigung und saubere Schnittstellen",
      "Wissensdatenbank und digitale Prozesse statt Wissen in einem Kopf",
    ],
  },
  {
    id: "marketing",
    href: "/leistungen/marketing",
    eyebrow: "02 — Sichtbarkeit",
    title: "Marketing",
    body: "Wir machen Unternehmen dort sichtbar, wo ihre Kunden wirklich sind: auf Social Media und direkt vor Ort. Wir übernehmen Content, Redaktionsplan und Anzeigen – und stellen für lokale Betriebe digitale Werbe-Displays an frequenzstarken Standorten auf.",
    points: [
      "Social-Media-Betreuung: Strategie, Content-Produktion und Redaktionsplan",
      "Performance-Kampagnen auf Meta, Instagram und TikTok",
      "Digitale Werbe-Displays für lokale Betriebe an frequenzstarken Standorten",
      "Monatliches Reporting mit klaren Zahlen statt Bauchgefühl",
    ],
  },
  {
    id: "web",
    href: "/leistungen/webseiten",
    eyebrow: "03 — Fundament",
    title: "Webseiten",
    body: "Wir bauen Webseiten, die nicht nur gut aussehen, sondern Anfragen bringen. Individuell entwickelt statt Baukasten, technisch schnell, für Suchmaschinen aufbereitet und von Anfang an mit Ihren Automatisierungen verbunden.",
    points: [
      "Individuelles Design und Entwicklung – kein Template-Baukasten",
      "Technisch schnell, mobil optimiert und für Google aufbereitet",
      "Anfrageformulare, die direkt in Ihr CRM und Ihre Automationen laufen",
      "Pflege, Hosting und Weiterentwicklung aus einer Hand",
    ],
  },
];

export const process = {
  title: "Digitalisieren in 3 einfachen Schritten",
  subtitle: "Spürbare Erfolge erzielen – ganz einfach mit künstlicher Intelligenz.",
  steps: [
    {
      n: "1.",
      title: "Wir erkennen Ihr Potenzial",
      body: "In unserer Strategiesitzung erfassen wir Ihre Arbeitsabläufe, identifizieren, wo Zeit und Geld verloren gehen, und definieren die wirkungsvollsten Möglichkeiten für Automatisierung, Marketing und Web.",
    },
    {
      n: "2.",
      title: "Wir bauen Ihre Systeme",
      body: "Wir entwerfen und implementieren die Systeme, die Ihre Werkzeuge verbinden, Engpässe beseitigen und manuelle, mühsame Arbeit durch intelligente Abläufe ersetzen.",
    },
    {
      n: "3.",
      title: "Wir starten. Sie wachsen.",
      body: "Sie erhalten ein digitales Handbuch, das Ihnen vollständige Kontrolle, sofortige Transparenz und ein System bietet, das ohne zusätzliches Personal skaliert.",
    },
  ],
};

export const problems = {
  title: "Häufige Probleme",
  subtitle: "Vor SVH",
  items: [
    {
      icon: "bottleneck",
      title: "Wenn der Chef zum Nadelöhr wird",
      body: "Jedes Angebot, jede Entscheidung und jede Frage Ihrer Kunden landet direkt bei Ihnen. Sobald Sie kurz Pause machen, steht alles still. Das ist kein Business – das ist ein Job mit ein paar Extra-Schritten.",
    },
    {
      icon: "margin",
      title: "Geringe Gewinnmargen",
      body: "Sie stellen neue Leute ein, weil immer mehr Kunden kommen. Doch Ihre Zahlen hinken zwei Wochen hinterher, Rechnungen fehlen und Sie treffen wichtige Wachstumsentscheidungen im Blindflug.",
    },
    {
      icon: "knowledge",
      title: "Alles Wissen in einer Hand",
      body: "Wenn diese eine Person krank ist, im Urlaub oder weg, steht plötzlich alles still. Kein System, keine Anleitung, sondern nur großes Kopfzerbrechen.",
    },
    {
      icon: "repeat",
      title: "Dieselben Fehler, immer wieder",
      body: "Keine gemeinsame Wissensdatenbank, keine aufgeschriebenen Prozesse. Neue Teammitglieder machen dieselben Fehler noch einmal – weil niemand festgehalten hat, was funktioniert hat und was nicht.",
    },
    {
      icon: "leak",
      title: "Täglich gehen Ressourcen verloren",
      body: "Verlegte Dokumente, doppelte Arbeit, Aufgaben die untergehen. Sie verlieren Ihr Geld nicht auf einmal – es sickert jeden Tag ein kleines bisschen weg.",
    },
    {
      icon: "invisible",
      title: "Vor Ort kennt Sie kaum jemand",
      body: "Ihre Leistung ist gut, aber sichtbar sind Sie nur für die, die Sie ohnehin schon kennen. Ohne Social Media und ohne Präsenz an frequenzstarken Standorten bleibt Neukundengewinnung Zufall.",
    },
  ],
};

export const roi = {
  eyebrow: "Ihr KI-Rendite-Rechner",
  title: "Die Kosten fehlender Automatisierung quantifizieren",
  fields: {
    team: { label: "Teamgröße", min: 1, max: 100, step: 1, initial: 12 },
    hours: {
      label: "Stunden pro Woche",
      hint: "Wie viele Stunden pro Woche verbringt jedes Teammitglied mit manuellen Aufgaben (geschätzt)?",
      min: 1,
      max: 40,
      step: 1,
      initial: 12,
    },
    rate: {
      label: "Durchschnittliche Stundenkosten pro Teammitglied",
      min: 15,
      max: 150,
      step: 5,
      initial: 40,
    },
  },
  savingsRate: 0.8,
  cta: { label: "Holen Sie sich Ihren persönlichen KI-Fahrplan", href: "/unternehmen/kontakt" },
};

export const offerings = {
  title: "Unsere Haupt-Angebote",
  cta: { label: "Entdecken Sie unsere Methode", href: "#ablauf" },
};

/* -------------------------------------------------------------------------- */
/*  ❗TODO — Referenzen und Kennzahlen                                         */
/*  Diese Werte sind Platzhalter. Bitte durch echte, belegbare Angaben         */
/*  ersetzen oder die jeweilige Sektion vor dem Livegang entfernen.            */
/* -------------------------------------------------------------------------- */

export const testimonials = {
  title: "Erfolgsgeschichten von Kunden",
  subtitle:
    "Durch enge Zusammenarbeit helfen wir unseren Kunden, spürbare Veränderungen und Erfolge zu erzielen.",
  /** ❗TODO: echte Kundenstimmen eintragen. */
  featured: [
    {
      brand: "Kundenname", // ❗TODO
      industry: "Branche", // ❗TODO
      quote:
        "Hier steht später das Zitat Ihres Kunden. Bis dahin bleibt dieser Platz bewusst neutral, damit nichts Erfundenes auf der Seite steht.", // ❗TODO
      person: "Vorname Nachname", // ❗TODO
      role: "Position, Unternehmen", // ❗TODO
      highlights: [
        "Was im Projekt konkret umgesetzt wurde.", // ❗TODO
        "Welches Ergebnis der Kunde dadurch erreicht hat.", // ❗TODO
      ],
      media: "/img/testimonial-media.png",
    },
  ],
  /** ❗TODO: echte Kurz-Zitate eintragen. */
  short: [
    { quote: "Platz für eine Kundenstimme.", person: "Vorname Nachname", role: "Position" },
    { quote: "Platz für eine Kundenstimme.", person: "Vorname Nachname", role: "Position" },
    { quote: "Platz für eine Kundenstimme.", person: "Vorname Nachname", role: "Position" },
  ],
};

/** ❗TODO: echte Kennzahlen eintragen – aktuell bewusst ohne Zahlenwert. */
export const stats = {
  items: [
    { value: "—", label: "Jahre Erfahrung" },
    { value: "—", label: "€ an Betriebskosten eingespart" },
    { value: "—", label: "betreute Kanäle & Displays" },
    { value: "—", label: "umgesetzte Projekte" },
  ],
  line: "Schließen Sie die Lücken, in denen Zeit und Geld verloren gehen – mit KI, Marketing und einer Webseite, die arbeitet.",
  cta: { label: "Buchen Sie Ihren Strategie-Call", href: "/unternehmen/kontakt" },
};

export const audience = {
  title: "Mit wem wir zusammenarbeiten",
  body: "Egal, ob Sie als lokaler Betrieb endlich sichtbar werden möchten, als Agentur wachsen wollen oder als Unternehmen die komplette Automatisierung suchen – unsere Systeme sind maßgeschneiderte Lösungen, die Ihre Prozesse vereinfachen, die Effizienz steigern und Ihren Gewinn maximieren. Ganz ohne neues Personal.",
  cards: [
    { title: "Lokale Betriebe", href: "/unternehmen/kontakt" },
    { title: "Agenturen", href: "/unternehmen/kontakt" },
    { title: "Mittelstand", href: "/unternehmen/kontakt" },
  ],
  ctaLabel: "Kontakt aufnehmen",
};

export const resources = {
  title: "Hervorgehobene Ressourcen",
  /** ❗TODO: mit echten Beiträgen füllen oder Sektion entfernen. */
  feature: {
    badge: "Leitfaden",
    title: "Wo KI in kleinen und mittleren Betrieben wirklich Geld spart",
    body: "Ein praktischer Überblick: welche Abläufe sich zuerst lohnen zu automatisieren, was das typischerweise kostet und woran Projekte in der Praxis scheitern.",
    href: "/ressourcen/blog",
    image: "/img/resource-feature.png",
  },
  items: [
    {
      badge: "Beitrag",
      title: "Social Media für lokale Betriebe: Was wirklich zählt",
      href: "/ressourcen/blog",
      image: "/img/resource-1.png",
    },
    {
      badge: "Beitrag",
      title: "Digitale Werbe-Displays: Standort, Reichweite, Kosten",
      href: "/ressourcen/blog",
      image: "/img/resource-2.png",
    },
    {
      badge: "Beitrag",
      title: "Wie eine Webseite aus Besuchern Anfragen macht",
      href: "/ressourcen/blog",
      image: "/img/resource-3.png",
    },
  ],
};

export const newsletter = {
  title: "Abonnieren Sie unseren Newsletter",
  body: "Erhalten Sie regelmäßig praktische Tipps zu KI, Marketing und Web – direkt in Ihren Posteingang.",
  placeholder: "ihre@mail.de",
  consent: "Mit dem Abonnieren stimmen Sie unserer Datenschutzerklärung zu.",
};

export const faq = {
  title: "Häufig gestellte Fragen",
  intro:
    "Sie fragen sich, ob das etwas für Sie ist? Das sind die Fragen, die Unternehmen wie Ihres stellen, bevor sie mit uns zusammenarbeiten – damit sparen wir uns beide Zeit.",
  cta: { label: "Kostenloses Strategiegespräch", href: "/unternehmen/kontakt" },
  items: [
    {
      q: "Wie lange dauert es, bis die ersten Systeme laufen?",
      a: "Die meisten Automatisierungen sind in zwei bis sechs Wochen produktiv. Wir starten bewusst mit dem Ablauf, der Ihnen sofort die meiste Zeit zurückgibt, statt monatelang an einem großen Wurf zu bauen.",
    },
    {
      q: "Was ist, wenn mein Team Schwierigkeiten mit neuen Tools hat?",
      a: "Sie bekommen zu jedem System eine kurze Einweisung und ein digitales Handbuch mit Videos. Unser Ziel ist, dass Ihr Team die Systeme selbst bedienen kann – nicht, dass Sie dauerhaft von uns abhängig sind.",
    },
    {
      q: "Kann ich meine vorhandenen Tools weiterhin verwenden?",
      a: "In den allermeisten Fällen ja. Wir bauen um Ihre bestehende Werkzeuglandschaft herum und verbinden sie, statt alles auszutauschen. Wo ein Wechsel sich rechnet, sagen wir es offen.",
    },
    {
      q: "Welche Arten von Prozessen können Sie automatisieren?",
      a: "Alles, was regelmäßig und nach nachvollziehbaren Regeln passiert: Angebote und Rechnungen, Terminvereinbarung, Kundenanfragen über WhatsApp und E-Mail, Onboarding, Reporting, Datenpflege zwischen Systemen.",
    },
    {
      q: "Was ist mit der DSGVO und dem Datenschutz?",
      a: "Wir arbeiten mit Anbietern, die eine Verarbeitung in der EU ermöglichen, schließen mit Ihnen einen Auftragsverarbeitungsvertrag und dokumentieren, welche Daten wohin fließen. Personenbezogene Daten werden nur dort verarbeitet, wo es für den Ablauf nötig ist.",
    },
    {
      q: "Wie sieht die Zusammenarbeit normalerweise aus?",
      a: "Erst ein kostenloses Strategiegespräch, dann eine Bestandsaufnahme Ihrer Abläufe, danach ein konkretes Angebot mit Umfang, Preis und Zeitplan. Während der Umsetzung gibt es einen festen Ansprechpartner und regelmäßige kurze Abstimmungen.",
    },
    {
      q: "Welche Werkzeuge verwenden Sie zur Automatisierung?",
      a: "Je nach Fall n8n oder Make für die Abläufe, Modelle von OpenAI oder Anthropic für die KI-Anteile, dazu Ihr bestehendes CRM. Wir wählen nach Ihrem Bedarf aus, nicht nach Gewohnheit.",
    },
    {
      q: "Für wen sind Ihre Leistungen am besten geeignet?",
      a: "Für lokale Betriebe, die sichtbarer werden wollen, für Agenturen, die ihr Fulfillment entlasten müssen, und für mittelständische Unternehmen mit vielen manuellen Abläufen.",
    },
    {
      q: "Was kostet ein digitales Werbe-Display?",
      a: "Das hängt vom Standort, der Laufzeit und der Anzahl der Displays ab. Im Strategiegespräch rechnen wir Ihnen den konkreten Fall durch, inklusive erwarteter Reichweite am jeweiligen Standort.",
    },
    {
      q: "Brauche ich technisches Wissen?",
      a: "Nein. Sie beschreiben uns Ihre Abläufe, wir übersetzen das in Systeme. Für den laufenden Betrieb reicht es, wenn Sie E-Mails und Ihr CRM bedienen können.",
    },
    {
      q: "Bauen Sie auch nur eine Webseite, ohne alles andere?",
      a: "Ja. Die drei Leistungen greifen ineinander, lassen sich aber einzeln buchen. Viele starten mit der Webseite und ergänzen später Marketing oder Automatisierung.",
    },
    {
      q: "Bieten Sie laufende Betreuung an?",
      a: "Ja. Auf Wunsch übernehmen wir Wartung, Monitoring und Weiterentwicklung Ihrer Systeme sowie die laufende Betreuung von Social Media und Displays.",
    },
  ],
};

export const finalCta = {
  titleLine1: "Automatisierung, Marketing & Web",
  titleLine2: "komplett aus einer Hand.",
  body: "Die meisten Betriebe verlieren Zeit in manuellen Abläufen, sind vor Ort kaum sichtbar und haben eine Webseite, die keine Anfragen bringt. Wir bringen die drei Bereiche zusammen – damit Ihr Wachstum planbar wird, ohne zusätzliches Personal.",
  cta: { label: "Kostenloses Strategiegespräch", href: "/unternehmen/kontakt" },
};

export const footer = {
  about:
    "Wir helfen Unternehmen, KI, Marketing und Web in praxistaugliche Systeme zu übersetzen, die messbare Ergebnisse liefern – ohne Zeit, Budget oder Ressourcen zu verschwenden.",
  columns: [
    {
      title: "Leistungen",
      links: [
        { label: "KI-Automatisierung & Agenten", href: "/leistungen/ki-automatisierung-agenten" },
        { label: "Marketing", href: "/leistungen/marketing" },
        { label: "Webseiten", href: "/leistungen/webseiten" },
        { label: "Alle Leistungen", href: "/leistungen" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { label: "Über uns", href: "/unternehmen/ueber-uns" },
        { label: "Kontakt", href: "/unternehmen/kontakt" },
        { label: "Blog", href: "/ressourcen/blog" },
        { label: "Fallstudien", href: "/ressourcen/fallstudien" },
      ],
    },
    {
      title: "Rechtliches",
      links: [
        { label: "Impressum", href: "/impressum" },
        { label: "Datenschutz", href: "/datenschutz" },
        { label: "AGB", href: "/agb" },
      ],
    },
  ],
};
