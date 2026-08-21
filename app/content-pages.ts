/**
 * Inhalte der Unterseiten.
 *
 * Struktur entspricht der Referenz (apex-consulting.ai):
 *   /leistungen                              Übersicht
 *   /leistungen/ki-automatisierung-agenten   Detailseite
 *   /leistungen/marketing                    Detailseite
 *   /leistungen/webseiten                    Detailseite
 *   /unternehmen/ueber-uns
 *   /unternehmen/kontakt
 *   /ressourcen/blog
 *   /ressourcen/fallstudien
 *
 * Alles mit ❗TODO ist ein Platzhalter, der noch echte Angaben braucht.
 */

export type ServicePage = {
  slug: string;
  /** Kurzform für Navigation und Karten */
  navLabel: string;
  navHint: string;
  metaTitle: string;
  metaDescription: string;

  hero: {
    eyebrow: string;
    /** Zeile 1 dunkel, Zeile 2 in Markenfarbe */
    titleDark: string;
    titleBrand: string;
    lead: string;
    cta: string;
  };

  /** „Ist Ihr Unternehmen …?" — links Frage, rechts Einordnung */
  problem: {
    title: string;
    body: string;
    without: { title: string; intro: string; points: string[] };
    with: { title: string; intro: string; points: string[] };
  };

  /** Vergleichstabelle „Selbst machen oder abgeben?" */
  table: {
    title: string;
    colA: string;
    colB: string;
    rows: { label: string; a: string; b: string }[];
  };

  /** Leistungsbausteine — Bento-Raster mit animierten Mockups */
  capabilities: {
    title: string;
    subtitle: string;
    items: { mockup: string; title: string; body: string }[];
  };

  /** Ablauf in Schritten */
  steps: { title: string; subtitle: string; items: { n: string; title: string; body: string }[] };

  /** Für wen */
  audience: { title: string; body: string; items: { title: string; body: string }[] };

  faq: { q: string; a: string }[];
};

/* -------------------------------------------------------------------------- */
/*  1 — KI-Automatisierung & Agenten                                          */
/*      Inhalt weitgehend von der Referenzseite übernommen.                   */
/* -------------------------------------------------------------------------- */

const ki: ServicePage = {
  slug: "ki-automatisierung-agenten",
  navLabel: "KI-Automatisierung & Agenten",
  navHint: "Abläufe, die von allein laufen.",
  metaTitle: "KI-Automatisierung & Agenten",
  metaDescription:
    "Wir bauen maßgeschneiderte KI-Automatisierungen und Agenten: CRM-Einrichtung, Workflows, Kundensupport und Backoffice laufen künftig ohne manuelle Übergaben.",

  hero: {
    eyebrow: "Von Monaten zu Wochen — ohne zusätzliche Mitarbeiter.",
    titleDark: "Intelligente KI-Automatisierungen mit",
    titleBrand: "Präzision entwickelt",
    lead: "Unsere Automatisierungen sparen nicht nur Zeit, sie ordnen Ihre Prozesse von Anfang bis Ende. Von Vertrieb und Marketing über die Auftragsabwicklung bis zur Buchhaltung: Automationen und KI-Agenten übernehmen wiederkehrende Aufgaben mit vollem Kontext über Ihre Systeme hinweg — damit sich Ihr Team auf Wachstum konzentrieren kann.",
    cta: "Kostenlose KI-Analyse",
  },

  problem: {
    title: "Ist Ihr Unternehmen im KI-Zeitalter hinten dran?",
    body: "Unternehmen, die automatisieren und datenbasiert entscheiden, bewegen sich schneller, bedienen Kunden besser und gewinnen einen Vorsprung. Wer bei manuellen Prozessen und getrennten Systemen bleibt, verliert Umsatz und tut sich schwer, den Erwartungen an Tempo und Erreichbarkeit gerecht zu werden.",
    without: {
      title: "Ohne System",
      intro:
        "Es ist nicht Ihre Schuld: Niemand hat Ihnen gezeigt, wie sich Abläufe sauber verbinden lassen, ohne dass etwas kaputtgeht.",
      points: [
        "Automatisierungen werden aufgesetzt, ohne die fehlerhaften Prozesse dahinter zu beheben",
        "Vorlagen von der Stange, die nicht zu Ihrem Betrieb passen",
        "Sie sollen Werkzeuge selbst verbinden und dauerhaft pflegen",
        "Wissen bleibt bei einzelnen Personen statt im System",
      ],
    },
    with: {
      title: "Mit SVH Consulting",
      intro:
        "Wir schauen zuerst auf den Ablauf, dann auf die Technik — und übergeben ein System, das Ihr Team ohne uns bedienen kann.",
      points: [
        "Bestandsaufnahme Ihrer Abläufe, bevor irgendetwas automatisiert wird",
        "Werkzeuge, die zu Ihrem Fall passen — nicht zu unserer Gewohnheit",
        "Einrichtung, Anbindung und Übergabe erledigen wir",
        "Digitales Handbuch mit Videos, damit das Wissen bei Ihnen bleibt",
      ],
    },
  },

  table: {
    title: "Das Dilemma: selbst aufbauen oder abgeben?",
    colA: "Eigenes System aufbauen",
    colB: "Mit SVH Consulting",
    rows: [
      {
        label: "Einarbeitung, Schulung & Dokumentation",
        a: "Wenig bis keine Dokumentation, das Wissen bleibt bei Einzelpersonen.",
        b: "Strukturierte Einarbeitung, schriftliche Dokumentation und kurze Videoanleitungen, damit alle im Team das System nutzen können.",
      },
      {
        label: "Langfristige Wartbarkeit",
        a: "Aktualisierungen hängen an einzelnen Personen; fällt jemand aus, stehen Abläufe still.",
        b: "Modular aufgebaut, überwacht und regelmäßig aktualisiert. Abläufe entwickeln sich mit Ihrem Geschäft weiter.",
      },
      {
        label: "Werkzeuge & Fachwissen",
        a: "Begrenzter Zugang zu aktuellen Modellen und Orchestrierungswerkzeugen.",
        b: "Wir setzen Agenten, Anreicherungsmodule und Orchestrierung ein, die über einfache Chatbots hinausgehen.",
      },
      {
        label: "Zeit bis zum ersten Ergebnis",
        a: "Monate, weil parallel zum Tagesgeschäft gelernt und gebaut wird.",
        b: "Der erste produktive Ablauf steht in der Regel in zwei bis sechs Wochen.",
      },
      {
        label: "Datenschutz",
        a: "Oft ungeklärt, welche Daten wohin fließen.",
        b: "Auftragsverarbeitungsvertrag, Verarbeitung in der EU wo möglich, dokumentierte Datenflüsse.",
      },
    ],
  },

  capabilities: {
    title: "Was wir konkret bauen",
    subtitle:
      "Keine Vorlagen, kein Rätselraten. Jeder Baustein wird auf Ihre Abläufe zugeschnitten und mit Ihren bestehenden Systemen verbunden.",
    items: [
      {
        mockup: "chat",
        title: "Kundensupport über WhatsApp & Web",
        body: "Ein Agent, der Anfragen rund um die Uhr beantwortet, Termine einträgt und übergibt, sobald ein Mensch gefragt ist. Antwortzeiten sinken von Stunden auf Minuten.",
      },
      {
        mockup: "workflow",
        title: "Angebote, Rechnungen & Erinnerungen",
        body: "Vom Erstkontakt bis zur Zahlungserinnerung läuft die Kette automatisch. Nichts bleibt liegen, weil jemand vergessen hat nachzufassen.",
      },
      {
        mockup: "crm",
        title: "CRM-Einrichtung & Datenpflege",
        body: "Wir räumen auf, entfernen Dubletten, verbinden Ihre Systeme und sorgen dafür, dass Daten dorthin fließen, wo sie gebraucht werden.",
      },
      {
        mockup: "knowledge",
        title: "Wissensdatenbank",
        body: "Prozesse, Antworten und Vorlagen an einem Ort — durchsuchbar für Ihr Team und nutzbar durch Ihre Agenten.",
      },
      {
        mockup: "report",
        title: "Auswertungen ohne Handarbeit",
        body: "Zahlen kommen automatisch zusammen, statt am Monatsende mühsam aus fünf Systemen kopiert zu werden.",
      },
      {
        mockup: "handover",
        title: "Übergaben zwischen Abteilungen",
        body: "Wenn Vertrieb an Projekt übergibt, passiert das über einen definierten Ablauf statt über Zuruf und Notizzettel.",
      },
    ],
  },

  steps: {
    title: "So läuft ein Projekt ab",
    subtitle: "Vom ersten Gespräch bis zum System, das ohne Sie weiterläuft.",
    items: [
      {
        n: "1.",
        title: "Bestandsaufnahme",
        body: "Wir gehen Ihre Abläufe durch, messen wo Zeit verloren geht und priorisieren nach Wirkung — nicht nach technischer Machbarkeit.",
      },
      {
        n: "2.",
        title: "Aufbau",
        body: "Wir bauen den ersten Ablauf produktiv, testen ihn mit echten Fällen und erweitern von dort. Sie sehen früh Ergebnisse statt erst am Ende.",
      },
      {
        n: "3.",
        title: "Übergabe & Betrieb",
        body: "Sie bekommen Dokumentation, Videos und eine Einweisung. Auf Wunsch übernehmen wir Wartung und Weiterentwicklung.",
      },
    ],
  },

  audience: {
    title: "Für wen sich das lohnt",
    body: "Am meisten holen Betriebe heraus, bei denen viele gleichartige Vorgänge anfallen und Anfragen über verschiedene Kanäle hereinkommen.",
    items: [
      {
        title: "Handwerk & lokale Dienstleister",
        body: "Anfragen, Termine und Angebote laufen strukturiert, auch wenn niemand ans Telefon gehen kann.",
      },
      {
        title: "Agenturen",
        body: "Das Fulfillment folgt einem System statt Ihrem ständigen Eingreifen. Projekte laufen gleich ab, egal wer sie betreut.",
      },
      {
        title: "Mittelstand",
        body: "Getrennte Systeme werden verbunden, Übergaben zwischen Abteilungen laufen definiert statt über Zuruf.",
      },
    ],
  },

  faq: [
    {
      q: "Wie lange dauert es, bis der erste Ablauf produktiv ist?",
      a: "In der Regel zwei bis sechs Wochen. Wir starten bewusst mit dem Ablauf, der Ihnen sofort am meisten Zeit zurückgibt, statt monatelang an einem großen Wurf zu bauen.",
    },
    {
      q: "Muss ich meine bestehenden Programme wechseln?",
      a: "Meistens nicht. Wir bauen um Ihre bestehende Werkzeuglandschaft herum und verbinden sie. Wo sich ein Wechsel rechnet, sagen wir es offen und begründen es.",
    },
    {
      q: "Was passiert, wenn eine Automatisierung einen Fehler macht?",
      a: "Jeder Ablauf hat definierte Abbruchbedingungen und eine Benachrichtigung an einen Menschen. Kritische Schritte laufen nie ohne Freigabe.",
    },
    {
      q: "Wie ist das mit dem Datenschutz?",
      a: "Wir schließen mit Ihnen einen Auftragsverarbeitungsvertrag, wählen wo möglich Anbieter mit Verarbeitung in der EU und dokumentieren, welche Daten wohin fließen.",
    },
    {
      q: "Was kostet das?",
      a: "Das hängt vom Umfang ab. Nach der Bestandsaufnahme bekommen Sie ein Angebot mit festem Umfang, Preis und Zeitplan — keine offene Rechnung nach Aufwand.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  2 — Marketing                                                             */
/*      Eigener Inhalt: Social Media + digitale Werbe-Displays.               */
/*      ❗ Erster Aufschlag — bitte gegenlesen und korrigieren.                */
/* -------------------------------------------------------------------------- */

const marketing: ServicePage = {
  slug: "marketing",
  navLabel: "Marketing",
  navHint: "Social Media und Werbe-Displays vor Ort.",
  metaTitle: "Marketing — Social Media & digitale Werbe-Displays",
  metaDescription:
    "Wir übernehmen Social-Media-Betreuung, Content-Produktion und Kampagnen — und stellen für lokale Betriebe digitale Werbe-Displays an frequenzstarken Standorten auf.",

  hero: {
    eyebrow: "Sichtbar werden, wo Ihre Kunden wirklich sind.",
    titleDark: "Social Media und Werbeflächen,",
    titleBrand: "die Kunden bringen",
    lead: "Die meisten Betriebe sind genau für die Leute sichtbar, die sie ohnehin schon kennen. Wir ändern das an zwei Stellen gleichzeitig: online über Social Media und Anzeigen, offline über digitale Werbe-Displays an Standorten, an denen Ihre Kunden täglich vorbeikommen.",
    cta: "Kostenloses Strategiegespräch",
  },

  problem: {
    title: "Warum Werbung oft nichts bringt",
    body: "Nicht weil sie schlecht gemacht ist, sondern weil sie unregelmäßig läuft, an den falschen Stellen ausgespielt wird und niemand misst, was tatsächlich zu einer Anfrage geführt hat. Am Ende bleibt das Gefühl, Geld ausgegeben zu haben, ohne zu wissen wofür.",
    without: {
      title: "Wie es meistens läuft",
      intro:
        "Marketing passiert nebenbei, wenn gerade Zeit ist — und hört auf, sobald es im Tagesgeschäft eng wird.",
      points: [
        "Beiträge erscheinen unregelmäßig, mal drei in einer Woche, dann sechs Wochen nichts",
        "Anzeigen laufen ohne klare Zielgruppe und ohne Nachsteuern",
        "Niemand weiß, welcher Kanal die Anfragen tatsächlich gebracht hat",
        "Vor Ort nimmt niemand wahr, dass es Sie gibt",
      ],
    },
    with: {
      title: "Mit SVH Consulting",
      intro:
        "Wir übernehmen den ganzen Kreislauf: planen, produzieren, ausspielen, messen, nachsteuern.",
      points: [
        "Fester Redaktionsplan, an den wir uns halten — auch wenn es bei Ihnen eng wird",
        "Kampagnen mit klarer Zielgruppe, laufend nachgesteuert",
        "Digitale Werbe-Displays an Standorten mit echter Laufkundschaft",
        "Monatliches Reporting: was lief, was kam dabei heraus, was ändern wir",
      ],
    },
  },

  table: {
    title: "Selbst machen oder abgeben?",
    colA: "Intern nebenbei",
    colB: "Mit SVH Consulting",
    rows: [
      {
        label: "Regelmäßigkeit",
        a: "Beiträge entstehen, wenn gerade jemand Zeit hat. In stressigen Wochen passiert nichts.",
        b: "Fester Redaktionsplan mit festen Veröffentlichungsterminen. Die Frequenz bleibt gleich, egal wie voll Ihre Woche ist.",
      },
      {
        label: "Produktion",
        a: "Handyaufnahmen zwischen zwei Terminen, wechselnde Bildsprache, kein roter Faden.",
        b: "Geplante Aufnahmetermine, einheitliche Bildsprache, fertige Formate für Feed, Story und Reel.",
      },
      {
        label: "Anzeigen",
        a: "Beitrag bewerben drücken und hoffen. Kein Test, kein Nachsteuern.",
        b: "Kampagnenstruktur mit mehreren Motiven, laufende Auswertung, Budget wandert auf das, was funktioniert.",
      },
      {
        label: "Sichtbarkeit vor Ort",
        a: "Ein Schild an der Fassade, das seit Jahren dasselbe zeigt.",
        b: "Digitale Werbe-Displays an frequenzstarken Standorten, deren Inhalt wir jederzeit ändern können.",
      },
      {
        label: "Nachweis",
        a: "Gefühl. Am Jahresende weiß niemand, was gewirkt hat.",
        b: "Monatliches Reporting mit Reichweite, Anfragen und Kosten je Anfrage.",
      },
    ],
  },

  capabilities: {
    title: "Was wir für Sie übernehmen",
    subtitle:
      "Von der Strategie bis zum Display an der Straße — Sie müssen sich um nichts davon selbst kümmern.",
    items: [
      {
        mockup: "feed",
        title: "Social-Media-Betreuung",
        body: "Strategie, Redaktionsplan und laufende Betreuung Ihrer Kanäle. Wir schreiben, gestalten, veröffentlichen und antworten auf Kommentare und Nachrichten.",
      },
      {
        mockup: "camera",
        title: "Content-Produktion",
        body: "Foto- und Videoaufnahmen bei Ihnen vor Ort, geschnitten und aufbereitet für Feed, Story und Reel. Eine Bildsprache über alle Kanäle hinweg.",
      },
      {
        mockup: "ads",
        title: "Performance-Kampagnen",
        body: "Anzeigen auf Meta, Instagram und TikTok mit klarer Zielgruppe, mehreren Motiven im Test und laufender Nachsteuerung des Budgets.",
      },
      {
        mockup: "display",
        title: "Digitale Werbe-Displays",
        body: "Wir stellen Displays an frequenzstarken Standorten auf und bespielen sie. Aktionen, Öffnungszeiten oder offene Stellen ändern wir aus der Ferne, ohne dass jemand vorbeifahren muss.",
      },
      {
        mockup: "local",
        title: "Lokale Auffindbarkeit",
        body: "Google-Unternehmensprofil, Öffnungszeiten, Bilder und Bewertungen gepflegt — damit Sie gefunden werden, wenn jemand in Ihrer Nähe sucht.",
      },
      {
        mockup: "report",
        title: "Reporting",
        body: "Jeden Monat eine verständliche Übersicht: Reichweite, Anfragen, Kosten je Anfrage und was wir im nächsten Monat anders machen.",
      },
    ],
  },

  steps: {
    title: "So starten wir",
    subtitle: "Vom ersten Gespräch bis zur ersten Kampagne vergehen in der Regel drei bis vier Wochen.",
    items: [
      {
        n: "1.",
        title: "Positionierung klären",
        body: "Wir schauen uns an, wofür Sie stehen, wen Sie erreichen wollen und was Sie von den Betrieben in Ihrer Umgebung unterscheidet. Daraus entsteht die Linie für alles Weitere.",
      },
      {
        n: "2.",
        title: "Produzieren & aufstellen",
        body: "Wir kommen für die Aufnahmen zu Ihnen, bauen den Redaktionsplan und — wenn Displays Teil des Pakets sind — suchen Standorte aus, klären die Genehmigungen und stellen sie auf.",
      },
      {
        n: "3.",
        title: "Ausspielen & nachsteuern",
        body: "Kampagnen laufen, Displays laufen, Beiträge erscheinen. Wir messen mit, verschieben Budget auf das, was funktioniert, und berichten monatlich.",
      },
    ],
  },

  audience: {
    title: "Für wen das gedacht ist",
    body: "Vor allem für Betriebe mit einem Einzugsgebiet: Menschen entscheiden sich für Sie, weil Sie in der Nähe sind und weil sie Sie kennen.",
    items: [
      {
        title: "Handwerk & Bau",
        body: "Fachkräfte gewinnen und Aufträge in der Region sichtbar machen — Displays wirken hier besonders gut, weil sie täglich gesehen werden.",
      },
      {
        title: "Gastronomie & Einzelhandel",
        body: "Aktionen, Öffnungszeiten und Neuheiten kurzfristig ändern, ohne jedes Mal etwas drucken zu lassen.",
      },
      {
        title: "Praxen & Dienstleister",
        body: "Vertrauen aufbauen, bevor jemand anruft, und offene Stellen dort zeigen, wo die passenden Leute vorbeikommen.",
      },
    ],
  },

  faq: [
    {
      q: "Wo genau stehen die Werbe-Displays?",
      a: "An Standorten mit regelmäßiger Laufkundschaft in Ihrem Einzugsgebiet — je nach Verfügbarkeit etwa an Einkaufsstandorten, an gut frequentierten Durchfahrtsstraßen oder in Partnerbetrieben. Welche Standorte konkret infrage kommen, klären wir im Strategiegespräch für Ihren Ort.", // ❗TODO: konkrete Standorttypen ergänzen, sobald das Netz steht
    },
    {
      q: "Wie oft kann ich den Inhalt auf dem Display ändern?",
      a: "So oft Sie möchten. Die Displays werden aus der Ferne bespielt, eine Änderung ist in der Regel am selben Tag sichtbar. Kurzfristige Aktionen sind damit problemlos möglich.",
    },
    {
      q: "Was kostet ein Display?",
      a: "Das hängt von Standort, Laufzeit und Anzahl ab. Im Strategiegespräch rechnen wir Ihren konkreten Fall durch, inklusive der erwarteten Reichweite am jeweiligen Standort.", // ❗TODO: Preisrahmen ergänzen, sobald festgelegt
    },
    {
      q: "Muss ich selbst vor der Kamera stehen?",
      a: "Nein, aber es hilft. Menschen folgen Menschen, und Gesichter aus dem Betrieb wirken deutlich besser als Symbolbilder. Wenn Sie das nicht möchten, arbeiten wir mit Aufnahmen aus dem Arbeitsalltag, Ergebnissen und Kundenstimmen.",
    },
    {
      q: "Wie viel Aufwand habe ich damit?",
      a: "Nach dem Startgespräch etwa eine Stunde pro Monat für Abstimmung, dazu die Aufnahmetermine. Alles andere übernehmen wir.",
    },
    {
      q: "Kann ich nur Social Media buchen, ohne Displays?",
      a: "Ja. Beides lässt sich einzeln buchen. Zusammen wirkt es stärker, weil Menschen Sie online und offline sehen — nötig ist die Kombination aber nicht.",
    },
    {
      q: "Bin ich an eine lange Laufzeit gebunden?",
      a: "Die Betreuung läuft monatlich. Bei Displays hängt die Mindestlaufzeit vom Standort ab, weil dort Verträge mit den Standortgebern dahinterstehen — das sagen wir Ihnen vorher genau.", // ❗TODO: tatsächliche Konditionen eintragen
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  3 — Webseiten                                                             */
/*      Eigener Inhalt. ❗ Erster Aufschlag — bitte gegenlesen.                */
/* -------------------------------------------------------------------------- */

const web: ServicePage = {
  slug: "webseiten",
  navLabel: "Webseiten",
  navHint: "Seiten, die Anfragen bringen.",
  metaTitle: "Webseiten, die Anfragen bringen",
  metaDescription:
    "Individuell entwickelte Webseiten statt Baukasten: technisch schnell, für Suchmaschinen aufbereitet und direkt mit Ihrem CRM und Ihren Automatisierungen verbunden.",

  hero: {
    eyebrow: "Kein Baukasten. Kein Template von der Stange.",
    titleDark: "Eine Webseite, die nicht nur gut aussieht,",
    titleBrand: "sondern Anfragen bringt",
    lead: "Die meisten Betriebe haben eine Seite, die es einfach gibt. Sie ist langsam, auf dem Handy unbequem, taucht bei Google nicht auf und das Kontaktformular landet in einem Postfach, in das selten jemand schaut. Wir bauen stattdessen eine Seite, die für Ihre Kunden gemacht ist und die mit Ihren Abläufen verbunden ist.",
    cta: "Kostenloses Strategiegespräch",
  },

  problem: {
    title: "Woran die meisten Webseiten scheitern",
    body: "Nicht am Design. Sondern daran, dass Besucher nicht sofort erkennen, was angeboten wird, dass der Weg zur Anfrage zu lang ist und dass die Seite auf dem Handy — wo die meisten Besucher herkommen — spürbar langsamer ist als sie sein müsste.",
    without: {
      title: "Die typische Baukastenseite",
      intro:
        "Schnell zusammengeklickt, dann drei Jahre nicht mehr angefasst.",
      points: [
        "Lädt langsam, besonders auf dem Handy und im Mobilfunknetz",
        "Text erklärt das Unternehmen, statt die Frage des Besuchers zu beantworten",
        "Anfragen landen in einem Postfach und bleiben dort liegen",
        "Änderungen kosten jedes Mal Geld oder passieren gar nicht",
      ],
    },
    with: {
      title: "Mit SVH Consulting",
      intro:
        "Wir bauen die Seite um den Weg herum, den ein Besucher bis zur Anfrage geht.",
      points: [
        "Individuell entwickelt und technisch schnell — auch bei schlechtem Empfang",
        "Aufbau und Texte entlang der Fragen, die Ihre Kunden tatsächlich stellen",
        "Anfragen laufen direkt in Ihr CRM und lösen Ihre Automatisierungen aus",
        "Pflege, Hosting und Weiterentwicklung aus einer Hand",
      ],
    },
  },

  table: {
    title: "Baukasten oder individuell?",
    colA: "Baukasten",
    colB: "Mit SVH Consulting",
    rows: [
      {
        label: "Ladezeit",
        a: "Viele mitgelieferte Skripte, die niemand braucht. Auf dem Handy spürbar träge.",
        b: "Nur das, was die Seite wirklich benötigt. Bilder in passender Größe, Schriften lokal, messbar schnelle Ladezeit.",
      },
      {
        label: "Aufbau",
        a: "Vorgegebene Struktur, in die der Inhalt hineingepresst wird.",
        b: "Struktur folgt Ihrem Angebot und dem Weg des Besuchers bis zur Anfrage.",
      },
      {
        label: "Suchmaschinen",
        a: "Grundeinstellungen vorhanden, aber Titel, Struktur und Texte bleiben ungenutzt.",
        b: "Saubere Überschriftenstruktur, gepflegte Seitentitel, strukturierte Daten und lokale Signale für Ihr Einzugsgebiet.",
      },
      {
        label: "Anfragen",
        a: "Formular schickt eine E-Mail. Was danach passiert, liegt bei Ihnen.",
        b: "Anfrage landet im CRM, löst Bestätigung und Aufgabe aus, und meldet sich, wenn niemand reagiert hat.",
      },
      {
        label: "Weiterentwicklung",
        a: "Änderungen sind mühsam, also passieren sie nicht.",
        b: "Sie sagen Bescheid, wir setzen es um — oder Sie pflegen Inhalte selbst über eine einfache Oberfläche.",
      },
    ],
  },

  capabilities: {
    title: "Was dazugehört",
    subtitle:
      "Vom ersten Entwurf bis zum laufenden Betrieb. Sie brauchen dafür keine Agentur daneben und keinen Techniker im Haus.",
    items: [
      {
        mockup: "design",
        title: "Design & Entwicklung",
        body: "Ein Entwurf, der zu Ihrem Betrieb passt, und eine Umsetzung, die auf jedem Gerät gleich gut funktioniert — vom kleinen Handy bis zum großen Bildschirm.",
      },
      {
        mockup: "speed",
        title: "Geschwindigkeit",
        body: "Bilder in der richtigen Größe, Schriften lokal eingebunden, kein unnötiger Ballast. Das merkt der Besucher, und Google merkt es auch.",
      },
      {
        mockup: "seo",
        title: "Suchmaschinen-Grundlagen",
        body: "Saubere Struktur, gepflegte Seitentitel, strukturierte Daten und lokale Signale, damit Sie in Ihrem Einzugsgebiet gefunden werden.",
      },
      {
        mockup: "form",
        title: "Anfragen, die ankommen",
        body: "Formulare, Rückrufwunsch und Terminbuchung laufen direkt in Ihr CRM. Der Interessent bekommt sofort eine Bestätigung, Sie eine Aufgabe.",
      },
      {
        mockup: "cms",
        title: "Selbst pflegen, wenn Sie wollen",
        body: "Auf Wunsch bekommen Sie eine einfache Oberfläche für Texte, Bilder und Neuigkeiten — ohne dass Sie etwas kaputtmachen können.",
      },
      {
        mockup: "care",
        title: "Hosting & Pflege",
        body: "Betrieb, Sicherungen, Aktualisierungen und Überwachung übernehmen wir. Sie bekommen Bescheid, bevor etwas zum Problem wird.",
      },
    ],
  },

  steps: {
    title: "Von der Idee zur fertigen Seite",
    subtitle: "Eine typische Unternehmensseite steht in vier bis acht Wochen.",
    items: [
      {
        n: "1.",
        title: "Inhalte klären",
        body: "Wir gehen durch, was Sie anbieten, wen Sie erreichen wollen und welche Fragen Ihre Kunden vorher stellen. Daraus entsteht die Struktur der Seite — noch bevor jemand an Design denkt.",
      },
      {
        n: "2.",
        title: "Entwurf & Umsetzung",
        body: "Sie sehen zuerst einen Entwurf der Startseite und geben Rückmeldung. Danach bauen wir die Seite fertig, inklusive Texten, Bildern und der Anbindung an Ihre Systeme.",
      },
      {
        n: "3.",
        title: "Livegang & Betrieb",
        body: "Wir schalten um, prüfen Weiterleitungen und Messung und übernehmen auf Wunsch Hosting und Pflege. Sie bekommen eine kurze Einweisung, falls Sie selbst etwas ändern wollen.",
      },
    ],
  },

  audience: {
    title: "Für wen wir bauen",
    body: "Für Betriebe, bei denen die Webseite tatsächlich etwas leisten soll — Anfragen bringen, Bewerbungen bringen oder Termine bringen.",
    items: [
      {
        title: "Betriebe ohne eigene Webseite",
        body: "Der erste Auftritt, der von Anfang an richtig aufgebaut ist, statt später mühsam repariert zu werden.",
      },
      {
        title: "Veraltete Seiten",
        body: "Neuaufbau mit Umzug der Inhalte und sauberen Weiterleitungen, damit die bestehende Sichtbarkeit nicht verloren geht.",
      },
      {
        title: "Seiten ohne Wirkung",
        body: "Die Seite sieht ordentlich aus, bringt aber keine Anfragen. Wir schauen uns an, wo Besucher abspringen, und bauen den Weg zur Anfrage um.",
      },
    ],
  },

  faq: [
    {
      q: "Wie lange dauert eine Webseite?",
      a: "Eine typische Unternehmensseite steht in vier bis acht Wochen. Der längste Teil sind meistens nicht Design und Technik, sondern die Inhalte — dabei unterstützen wir.",
    },
    {
      q: "Schreiben Sie die Texte?",
      a: "Ja, auf Wunsch. Wir führen ein Gespräch mit Ihnen, schreiben den Entwurf und Sie korrigieren. So klingt es nach Ihnen und nicht nach einem Textbaukasten.",
    },
    {
      q: "Was ist mit meiner alten Seite und meiner Sichtbarkeit bei Google?",
      a: "Wir übernehmen die Inhalte, die sich lohnen, und richten Weiterleitungen von den alten auf die neuen Adressen ein. Dadurch bleibt die aufgebaute Sichtbarkeit erhalten.",
    },
    {
      q: "Kann ich Inhalte später selbst ändern?",
      a: "Ja, wenn Sie das möchten. Sie bekommen eine einfache Oberfläche für Texte, Bilder und Neuigkeiten. Wenn Sie das lieber abgeben, übernehmen wir es im Rahmen der Pflege.",
    },
    {
      q: "Was kostet eine Webseite?",
      a: "Das hängt vom Umfang ab. Nach dem ersten Gespräch bekommen Sie ein Angebot mit festem Preis und Zeitplan, keine offene Abrechnung nach Aufwand.", // ❗TODO: Preisrahmen ergänzen, sobald festgelegt
    },
    {
      q: "Brauche ich zusätzlich Marketing?",
      a: "Nicht zwingend. Eine gut gebaute Seite bringt über die Suche schon Anfragen. Wenn Sie schneller sichtbar werden wollen, ergänzen Social Media und Displays das sinnvoll.",
    },
  ],
};

export const servicePages: ServicePage[] = [ki, marketing, web];

export const servicesOverview = {
  metaTitle: "Leistungen",
  metaDescription:
    "KI-Automatisierung & Agenten, Marketing mit Social Media und digitalen Werbe-Displays sowie individuell entwickelte Webseiten — alles aus einer Hand.",
  hero: {
    eyebrow: "Unsere Leistungen",
    titleDark: "Drei Leistungen,",
    titleBrand: "die ineinandergreifen",
    lead: "Automatisierung nimmt Ihnen die Arbeit ab, Marketing bringt die Anfragen und die Webseite fängt sie auf. Jede Leistung funktioniert für sich — zusammen ergeben sie ein System, in dem nichts liegen bleibt.",
    cta: "Kostenloses Strategiegespräch",
  },
};

/* -------------------------------------------------------------------------- */
/*  Über uns                                                                  */
/* -------------------------------------------------------------------------- */

export const aboutPage = {
  metaTitle: "Über uns",
  metaDescription:
    "SVH Consulting ist eine kleine Agentur aus Zangberg für KI-Automatisierung, Marketing und Webseiten.",
  hero: {
    eyebrow: "Über uns",
    titleDark: "Nicht lauter.",
    titleBrand: "Sondern näher dran.",
    lead: "Wir sind eine kleine Agentur aus Zangberg. Sie sprechen bei uns nicht mit einem Projektbüro, sondern direkt mit den Leuten, die Ihre Systeme bauen und Ihre Kanäle betreuen.",
  },
  story: {
    title: "Warum es uns gibt",
    paragraphs: [
      "Die meisten Betriebe, mit denen wir sprechen, haben dasselbe Problem: Es funktioniert alles, aber es hängt an einzelnen Personen. Angebote schreibt der Chef abends, Anfragen beantwortet die Person, die gerade Zeit hat, und die Webseite steht seit fünf Jahren unverändert im Netz.",
      "Wir haben SVH Consulting gegründet, weil sich das mit heutigen Werkzeugen anders lösen lässt — ohne dass jemand dafür Informatik studieren muss und ohne dass eine Agentur monatelang etwas baut, das am Ende niemand bedienen kann.",
      "Deshalb arbeiten wir in kurzen Schritten, zeigen früh Ergebnisse und übergeben am Ende ein System, das Ihr Team auch ohne uns weiterführen kann.",
    ],
  },
  values: {
    title: "Wie wir arbeiten",
    items: [
      {
        title: "Erst der Ablauf, dann die Technik",
        body: "Wir automatisieren keinen Prozess, der kaputt ist. Zuerst schauen wir, ob der Ablauf überhaupt Sinn ergibt — oft ist die Hälfte der Arbeit danach überflüssig.",
      },
      {
        title: "Kleine Schritte statt großer Wurf",
        body: "Sie sehen nach wenigen Wochen das erste laufende Ergebnis. Das ist besser, als ein halbes Jahr auf etwas zu warten, das dann nicht passt.",
      },
      {
        title: "Sie sollen uns nicht brauchen",
        body: "Alles, was wir bauen, wird dokumentiert und übergeben. Dass viele Kunden bleiben, liegt daran, dass sie wollen — nicht daran, dass sie müssen.",
      },
      {
        title: "Ehrlich, auch wenn es gegen uns spricht",
        body: "Wenn eine Automatisierung sich für Ihre Größe nicht rechnet, sagen wir das. Ein Projekt, das keinen Nutzen bringt, hilft niemandem von uns beiden.",
      },
    ],
  },
  /** ❗TODO: Fotos und Kurzprofile ergänzen. */
  team: {
    title: "Wer dahintersteht",
    members: [
      {
        name: "Lukas Sehorz",
        role: "Gesellschafter", // ❗TODO: genaue Rolle eintragen
        body: "❗TODO: Kurzprofil ergänzen — Schwerpunkt, Hintergrund, wofür Kunden ihn ansprechen.",
      },
      {
        name: "Jannik vom Hofe",
        role: "Gesellschafter", // ❗TODO: genaue Rolle eintragen
        body: "❗TODO: Kurzprofil ergänzen — Schwerpunkt, Hintergrund, wofür Kunden ihn ansprechen.",
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Kontakt                                                                   */
/* -------------------------------------------------------------------------- */

export const contactPage = {
  metaTitle: "Kontakt",
  metaDescription:
    "Sprechen Sie mit SVH Consulting — kostenloses Strategiegespräch, telefonisch oder per E-Mail.",
  hero: {
    titleDark: "Sprechen Sie",
    titleBrand: "mit uns",
    lead: "Ein erstes Gespräch dauert etwa 20 Minuten, kostet nichts und verpflichtet zu nichts. Danach wissen Sie, ob und wo sich etwas für Sie lohnt.",
  },
  cards: [
    {
      title: "Neues Projekt",
      body: "Sie überlegen, Abläufe zu automatisieren, Ihr Marketing abzugeben oder eine neue Webseite zu bauen. Wir schauen gemeinsam, was zuerst Sinn ergibt.",
      cta: "Termin vereinbaren",
    },
    {
      title: "Laufende Betreuung",
      body: "Sie arbeiten bereits mit uns und haben eine Frage, einen Änderungswunsch oder eine Störung zu melden.",
      cta: "Kontakt aufnehmen",
    },
  ],
  facts: [
    { label: "Erreichbarkeit", value: "Mo–So, 8–21 Uhr" },
    { label: "Antwort in der Regel innerhalb von", value: "24 Stunden" },
    { label: "Erstgespräch", value: "Kostenlos" },
  ],
  form: {
    title: "Allgemeine Anfrage",
    body: "Schreiben Sie uns kurz, worum es geht. Je konkreter, desto besser können wir uns vorbereiten.",
    fields: {
      name: "Ihr Name",
      company: "Unternehmen",
      email: "E-Mail-Adresse",
      phone: "Telefon (optional)",
      topic: "Worum geht es?",
      message: "Ihre Nachricht",
    },
    topics: [
      "KI-Automatisierung & Agenten",
      "Marketing / Social Media",
      "Digitale Werbe-Displays",
      "Webseite",
      "Etwas anderes",
    ],
    consent:
      "Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden. Details in der Datenschutzerklärung.",
    submit: "Anfrage senden",
    success:
      "Danke, Ihre Anfrage ist angekommen. Wir melden uns in der Regel innerhalb von 24 Stunden.",
    /** ❗TODO: echten Empfänger/Endpunkt anbinden — aktuell nur Oberfläche ohne Versand. */
  },
};

/* -------------------------------------------------------------------------- */
/*  Ressourcen — Gerüst, noch ohne echte Beiträge                             */
/* -------------------------------------------------------------------------- */

export const blogPage = {
  metaTitle: "Blog",
  metaDescription: "Praktische Beiträge zu KI-Automatisierung, Marketing und Webseiten.",
  hero: {
    eyebrow: "Blog",
    titleDark: "Praktisches zu",
    titleBrand: "KI, Marketing und Web",
    lead: "Kurze, konkrete Beiträge aus unserer täglichen Arbeit — ohne Schlagworte und ohne Verkaufsgerede.",
  },
  /** ❗TODO: echte Beiträge ergänzen. Bis dahin bleibt der leere Zustand sichtbar. */
  posts: [] as { title: string; excerpt: string; href: string; image: string; date: string }[],
  empty: {
    title: "Hier entstehen gerade die ersten Beiträge",
    body: "Wir schreiben lieber wenige, brauchbare Texte als viele beliebige. Wenn Sie eine Frage haben, die wir aufgreifen sollen, schreiben Sie uns einfach.",
    cta: "Frage stellen",
  },
};

export const casesPage = {
  metaTitle: "Fallstudien",
  metaDescription: "Projekte von SVH Consulting im Detail.",
  hero: {
    eyebrow: "Fallstudien",
    titleDark: "Projekte,",
    titleBrand: "die wir umgesetzt haben",
    lead: "Ausgangslage, Vorgehen und Ergebnis — nachvollziehbar aufgeschrieben, mit den Zahlen, die wir belegen können.",
  },
  /** ❗TODO: echte Fallstudien ergänzen. Nichts erfinden. */
  cases: [] as { client: string; industry: string; summary: string; href: string; image: string }[],
  empty: {
    title: "Fallstudien folgen in Kürze",
    body: "Wir veröffentlichen erst dann eine Fallstudie, wenn wir Zahlen belegen können und der Kunde zugestimmt hat. Bis dahin zeigen wir Ihnen im Gespräch gerne konkrete Beispiele.",
    cta: "Beispiele im Gespräch ansehen",
  },
};
