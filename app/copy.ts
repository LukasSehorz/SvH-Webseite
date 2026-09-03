/**
 * Sämtliche sichtbaren Texte des dunklen Redesigns.
 *
 * Sprachregeln, verbindlich für jede Zeile.
 *   – Keine Doppelpunkte in Überschriften und Fließtext.
 *   – Keine Gedankenstriche als Einschub.
 *   – Keine abgehackten Kurzsatz-Ketten, besonders keine verneinenden.
 *   – Sie-Form, ruhig, präzise. Bindestriche in Komposita sind erlaubt.
 *
 * Alles mit ❗TODO braucht noch echte Angaben und darf nicht erfunden werden.
 * Firmendaten (Anschrift, Telefon, E-Mail) kommen weiter aus content.ts.
 */

export const meta = {
  home: {
    title: "SVH Consulting | KI, Webseiten und Marketing für Betriebe",
    description:
      "SVH Consulting macht Ihren Betrieb digital. Wir bauen KI, die Arbeit abnimmt, entwickeln Webseiten, die Kunden bringen, und betreuen Ihr Marketing.",
  },
  ki: {
    title: "KI-Automatisierung für Ihren Betrieb",
    /* Die alte Beschreibung versprach ein Corporate LLM, Voice Agents und
       ein Operating System, und davon steht seit dem Umbau der KI-Seite
       nichts mehr auf ihr. Eine Suchmaschinenbeschreibung darf nur
       tragen, was die Seite auch zeigt. */
    description:
      "Wir automatisieren die Arbeit, die sich in Ihrem Betrieb jeden Tag wiederholt. Der erste Schritt ist ein kostenloses Gespräch von zwanzig Minuten.",
  },
  marketing: {
    /* Die Werbetafeln sind seit dem 03.09.2026 auf Wunsch des Auftraggebers
       vorerst aus dem Angebot genommen. Titel und Beschreibung nennen
       deshalb nur noch die beiden Wege, die die Seite auch zeigt. */
    title: "Marketing mit Webseiten und Social Media",
    description:
      "Zwei Wege, damit man Sie sieht. Eine Webseite, die Anfragen bringt, und Ihre Kanäle auf Instagram und TikTok.",
  },
  about: {
    title: "Über uns",
    /* Die alte Beschreibung nannte SVH eine kleine Agentur, und das
       widerspricht der Positionierung als Partner fuer den ganzen
       digitalen Auftritt, die die Seite seit dem 02.09.2026 traegt. */
    description:
      "SVH Consulting ist Ihr Partner für alles Digitale. Webseite, Social Media und KI aus einer Hand, damit Ihr Betrieb mehr Anfragen bekommt und weniger Arbeit hat. Aus Zangberg, für Betriebe in der Region.",
  },
  contact: {
    title: "Kontakt",
    description:
      "Ein erstes Gespräch dauert zwanzig Minuten, kostet nichts und zeigt Ihnen, wo sich KI, Webseiten und Marketing bei Ihnen zuerst lohnen.",
  },
};

/* ------------------------------------------------------------------ */
/*  Navigation und Footer                                              */
/* ------------------------------------------------------------------ */

/* Ein Eintrag der Hauptnavigation. `items` traegt das Aufklappmenue und
   bleibt bei allen anderen Eintraegen leer, damit die Leiste eine einzige
   Datenform kennt und die Komponente keine Sonderfaelle braucht. */
export type NavEntry = {
  label: string;
  href: string;
  items?: ReadonlyArray<{ label: string; href: string; note: string }>;
};

export const nav: {
  links: ReadonlyArray<NavEntry>;
  contact: NavEntry;
  cta: { label: string; href: string };
  submenu: { open: string; close: string; overview: string };
} = {
  links: [
    { label: "KI", href: "/ki" },
    {
      label: "Marketing",
      href: "/marketing",
      items: [
        {
          label: "Webseiten",
          href: "/marketing/webseiten",
          note: "Auftritte, die Besucher zu Kunden machen",
        },
        {
          label: "Social Media",
          href: "/marketing/social-media",
          note: "Sichtbar auf Instagram und TikTok",
        },
        /* Der dritte Eintrag Werbetafeln ist am 03.09.2026 auf Wunsch des
           Auftraggebers herausgenommen worden, denn die Tafeln werden
           vorerst nicht angeboten. Die Seite /marketing/werbetafeln bleibt
           gebaut und erreichbar, es fuehrt nur kein Verweis mehr dorthin. */
      ],
    },
    { label: "Über uns", href: "/ueber-uns" },
  ],
  contact: { label: "Kontakt", href: "/kontakt" },
  /* Die eine Handlung heiszt ueberall gleich. In der Leiste stand ein
     kuerzeres Wort, und wer von der Startseite kam, las dort drei
     verschiedene Beschriftungen fuer denselben Termin. */
  cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  submenu: {
    open: "Untermenü öffnen",
    close: "Untermenü schließen",
    overview: "Marketing im Überblick",
  },
};

export const footer = {
  claim: "Systeme, die für Sie arbeiten.",
  columns: [
    {
      title: "Leistungen",
      links: [
        { label: "KI-Automatisierung", href: "/ki" },
        /* Seit dem 02.09.2026 hat Marketing eigene Unterseiten, und die
           Fusszeile fuehrt direkt dorthin statt auf die Uebersicht. Die
           Werbetafeln stehen seit dem 03.09.2026 nicht mehr darunter.
           Die Beschriftungen sind dieselben wie im Aufklappmenue der
           Leiste, damit ueberall dasselbe Wort fuer dieselbe Leistung
           steht. */
        { label: "Webseiten", href: "/marketing/webseiten" },
        { label: "Social Media", href: "/marketing/social-media" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { label: "Über uns", href: "/ueber-uns" },
        { label: "Kontakt", href: "/kontakt" },
        /* Der Anker lag auf /marketing, wo die Referenzen seit dem Umbau
           zur Uebersicht nicht mehr stehen. Die vier Projekte tragen auf
           der Webseiten-Unterseite den Abschnitt mit dieser Kennung. */
        { label: "Unsere Arbeiten", href: "/marketing/webseiten#referenzen" },
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
  watermark: "SVH CONSULTING",
};

/* ------------------------------------------------------------------ */
/*  Landing · S0 Hero                                                  */
/* ------------------------------------------------------------------ */

export const hero = {
  /** Die Überschrift wird um `gradientWord` herum gesetzt, das Wort trägt den Verlauf. */
  /* Die Zeile hiesz bis zum 03.09.2026 "Wir machen Ihren Betrieb digital."
     Der Auftraggeber fand sie zu allgemein, denn digital macht jede
     Agentur. SVH steht laut Produktakte fuer den Weg ins KI-Zeitalter, und
     genau das sagt die Zeile jetzt. Der Absatz darunter nennt die drei
     Leistungen und ihren Nutzen, damit in einem Blick klar ist, was SVH
     ist und wofuer es steht. */
  titleBefore: "Wir bringen Ihren Betrieb ins",
  gradientWord: "KI-Zeitalter.",
  titleAfter: "",
  lead: "Wir bauen KI, die Ihnen die tägliche Arbeit abnimmt, Webseiten, die Kunden bringen, und Marketing, das Ihren Namen in der Region bekannt macht. Alles aus einer Hand, damit am Ende alles zusammenpasst.",
  primary: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  secondary: { label: "Unsere Arbeiten ansehen", href: "#referenzen" },
};

/* ------------------------------------------------------------------ */
/*  Landing · S1 Manifest                                              */
/* ------------------------------------------------------------------ */

export const manifesto = {
  label: "02 · Warum jetzt",
  title: "Mit KI schafft Ihr Team mehr.",
  paragraphs: [
    "Ein Team ohne KI kommt voran, aber langsam. Ein Team, das KI richtig nutzt, schafft in derselben Zeit deutlich mehr.",
    "Diesen Abstand schließen wir mit Ihnen und setzen die Projekte gemeinsam um.",
  ],
  chart: {
    axisX: "Zeit",
    axisY: "Was Ihr Betrieb schafft",
    curveHot: "Team, das mit KI arbeitet",
    curveCool: "Team, das ohne KI arbeitet",
    /** Beschriftung der Fläche zwischen den beiden Kurven. */
    gap: "Der Unterschied",
  },
};

/* ------------------------------------------------------------------ */
/*  Landing · S2 KI-Stack (Ada-Muster)                                 */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Landing · S3 Marketing (DNA-Stimmung)                              */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Landing · S4 Showcase (Webdesign-Referenzen)                       */
/* ------------------------------------------------------------------ */

export const showcase = {
  /* Die Arbeiten stehen seit dem 03.09.2026 direkt hinter dem Kopf der
     Startseite. Der Auftraggeber will, dass Besucher die Referenzen
     sofort sehen, statt erst nach vier Sektionen. */
  label: "01 · Arbeiten",
  title: "Arbeit, die man ansehen kann.",
  intro:
    "Vier Seiten, die wir gebaut haben. Jede ist einzeln entwickelt, lädt schnell und ist darauf ausgelegt, Anfragen zu bringen. Ein Klick öffnet die Seite.",
  /** Kopfbereiche der vier freigegebenen Kundenseiten, aufgenommen bei 1440
      Bildpunkten in doppelter Dichte. Die Bilder liegen unter
      /referenzen/, die Adressen führen auf die laufenden Seiten.
      Branche jeweils in einem Wort, so wie es der Auftraggeber verlangt hat. */
  projects: [
    {
      image: "/referenzen/brandhuber-hero.webp",
      name: "Brandhuber",
      kind: "Sonnenschutz",
      host: "brandhuber.gmbh",
      url: "https://brandhuber.gmbh",
    },
    {
      image: "/referenzen/world-of-less-hero.webp",
      name: "World of Less",
      kind: "Logistik",
      host: "world-of-less.de",
      url: "https://world-of-less.de",
    },
    {
      image: "/referenzen/taxi-izi-hero.webp",
      name: "Taxi IZI",
      kind: "Taxi",
      host: "taxi-izi.de",
      url: "https://taxi-izi.de",
    },
    {
      image: "/referenzen/innnatur-hero.webp",
      name: "INN Natur",
      kind: "Heilpraktik",
      host: "innnatur-heilpraktiker.de",
      url: "https://innnatur-heilpraktiker.de",
    },
  ],
  /** Der Hinweis unter der Bühne. Er sagt, was ein Klick tut. */
  hint: "Jede Aufnahme führt auf die laufende Seite.",
};

/* ------------------------------------------------------------------ */
/*  Landing · S5 Ablauf                                                */
/* ------------------------------------------------------------------ */

export const process = {
  label: "04 · Ablauf",
  title: "Vom Gespräch zum laufenden System.",
  /** Sagt vorweg, dass die drei Schritte nacheinander laufen. */
  intro:
    "Drei Schritte, die aufeinander aufbauen. Jeder beginnt erst, wenn der davor steht.",
  steps: [
    {
      n: "01",
      title: "Verstehen",
      body: "Wir schauen uns Ihre Abläufe an und messen, wo Zeit und Geld verloren gehen. Am Ende wissen Sie, womit wir anfangen.",
    },
    {
      n: "02",
      title: "Bauen",
      body: "Wir bauen den ersten Baustein und lassen ihn mit echten Fällen laufen. Sie sehen früh, was er bringt.",
    },
    {
      n: "03",
      title: "Übergeben",
      body: "Sie bekommen eine Anleitung, kurze Videos und eine Einweisung für Ihr Team. Auf Wunsch kümmern wir uns weiter darum.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Landing · S6 FAQ                                                   */
/* ------------------------------------------------------------------ */

export const faqLanding = {
  label: "06 · Fragen",
  title: "Was Betriebe uns zuerst fragen.",
  intro: "Die Antworten aus vielen Erstgesprächen, offen aufgeschrieben.",
  items: [
    {
      q: "Wie schnell sehen wir erste Ergebnisse?",
      a: "Wir fangen mit der Aufgabe an, die Ihnen sofort am meisten Zeit zurückgibt. So sehen Sie früh etwas laufen, statt lange auf einen großen Wurf zu warten.",
    },
    {
      q: "Müssen wir unsere Programme wechseln?",
      a: "Meistens bleiben Ihre Programme so, wie sie sind, und wir verbinden sie miteinander. Wo sich ein Wechsel wirklich lohnt, sagen wir es offen und begründen es.",
    },
    {
      q: "Wie gehen Sie mit Datenschutz um?",
      a: "Wir schließen mit Ihnen einen Vertrag über die Verarbeitung Ihrer Daten und wählen wo möglich Anbieter, die in der EU arbeiten. Ihr Wissen bleibt Ihr Eigentum.",
    },
    {
      q: "Was kostet die Zusammenarbeit?",
      a: "Nach dem ersten Gespräch erhalten Sie ein Angebot mit festem Umfang, festem Preis und einem Zeitplan. Sie wissen also vorher, woran Sie sind.",
    },
    {
      q: "Sind wir danach von Ihnen abhängig?",
      a: "Alles, was wir bauen, schreiben wir auf und übergeben es an Ihr Team. Sie können jederzeit selbst weitermachen, und viele Kunden bleiben trotzdem bei uns.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Landing · S7 Abschluss                                             */
/* ------------------------------------------------------------------ */

export const finalCta = {
  titleBefore: "Ihr Betrieb kann",
  gradientWord: "mehr.",
  titleAfter: "",
  lead: "In zwanzig Minuten wissen Sie, wo KI, Webseiten und Marketing bei Ihnen am meisten bewirken.",
  primary: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  secondary: { label: "Schreiben Sie uns", href: "/kontakt#anfrage" },
};

/* ------------------------------------------------------------------ */
/*  Unterseite /ki                                                     */
/* ------------------------------------------------------------------ */

export const kiPage = {
  hero: {
    titleLead: "Ihr Partner im",
    gradientWord: "KI-Zeitalter.",
    lead: "Wir übernehmen die Arbeit, die sich jeden Tag wiederholt, damit Ihre Kosten sinken und Ihr Team Zeit für die Kunden hat.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  },

  /* Die Reihenfolge gilt fuer die Kacheln im Kopf. Die Liste darunter ist
     am 03.09.2026 entfallen, weil sie dieselben acht Aufgaben ein zweites
     Mal zeigte und der Pruefbericht das als Wiederholung vermerkt hat. Der
     Satz je Aufgabe steht seither in der Kachel selbst. `id` waehlt
     zugleich das Zeichen und die bewegte Szene. `title` und `intro` stehen
     als Zeile ueber dem Kachelfeld. */
  services: {
    title: "Was wir automatisieren.",
    intro:
      "Acht Aufgaben, die in fast jedem Betrieb jeden Tag anfallen. Wir bringen sie dazu, von allein zu laufen.",
    items: [
      {
        id: "email",
        name: "E-Mail",
        body: "Anfragen werden gelesen, beantwortet und richtig einsortiert.",
      },
      {
        id: "chat",
        name: "Chat auf der Webseite",
        body: "Ein Chat antwortet Tag und Nacht und gibt schwierige Fälle an Ihr Team weiter.",
      },
      {
        id: "agent",
        name: "Assistent für Ihr Team",
        body: "Ein Assistent arbeitet in Ihren Programmen und erledigt Aufgaben von Anfang bis Ende.",
      },
      {
        id: "calendar",
        name: "Termine",
        body: "Kunden buchen selbst, und Ihr Kalender bleibt sauber.",
      },
      {
        id: "offer",
        name: "Angebote und Rechnungen",
        body: "Aus einer Anfrage entsteht in Minuten ein fertiges Angebot, die Rechnung folgt von allein.",
      },
      {
        id: "document",
        name: "Dokumente",
        body: "Lieferscheine, Formulare und Belege werden ausgelesen und abgelegt.",
      },
      {
        id: "crm",
        name: "Kundendaten",
        body: "Alle Kunden stehen an einem Ort, ohne doppelte Einträge.",
      },
      {
        id: "report",
        name: "Zahlen",
        body: "Ihre Zahlen stellen sich von allein zu einem fertigen Bericht zusammen.",
      },
    ],
  },

  /* Drei Schritte, die aufeinander aufbauen. Sie laufen nacheinander und
     nie gleichzeitig, so hat es der Auftraggeber festgelegt. */
  flow: {
    title: "So fangen wir an.",
    intro:
      "Drei Schritte, einer nach dem anderen. Der erste kostet Sie nichts außer zwanzig Minuten.",
    steps: [
      {
        n: "1",
        title: "Wir sehen uns Ihren Betrieb an.",
        body: "In einem kostenlosen Gespräch gehen wir Ihre Abläufe durch und halten fest, wo täglich Zeit verloren geht.",
      },
      {
        n: "2",
        title: "Wir wählen die drei größten Hebel.",
        body: "Aus allem, was möglich wäre, bleiben die drei Aufgaben, die Ihnen am meisten bringen.",
      },
      {
        n: "3",
        title: "Wir bauen es gemeinsam ein.",
        body: "Wir setzen um, weisen Ihr Team ein und bleiben danach ansprechbar.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Unterseite /ki · Der Aufbau, Fundament und drei Ebenen darueber    */
/* ------------------------------------------------------------------ */

/* Die zweite Sektion der KI-Seite. Der Auftraggeber hat sie am 03.09.2026
   ausdruecklich zurueckverlangt: unten das Fundament Corporate LLM, darueber
   drei Felder, in die Lichtpunkte aus dem Fundament aufsteigen. Die vier
   Namen sind seine Worte. Damit auch ein Kind versteht, was dahinter
   steckt, traegt jedes Feld eine Zeile in einfacher Sprache. Zahlen,
   Preise und Zeitraeume stehen hier bewusst nicht. */
export const kiStack = {
  label: "Der Aufbau",
  titleBefore: "Alles wächst aus einem",
  gradientWord: "Fundament.",
  titleAfter: "",
  intro:
    "Unten liegt das Wissen Ihres Betriebs. Daraus speist sich alles, was darüber für Sie arbeitet, und jede Ebene lässt sich einzeln einführen.",
  modules: [
    {
      id: "automation",
      title: "Automatisierungen",
      line: "Arbeit, die von allein läuft.",
      tags: ["E-Mail", "Angebote und Rechnungen", "Kundendaten", "Übergaben im Team"],
    },
    {
      id: "agents",
      title: "Voice Agents",
      line: "Telefon und Chat, die selbst antworten.",
      tags: ["Telefon", "WhatsApp", "Chat auf der Webseite", "Terminbuchung"],
    },
    {
      id: "os",
      title: "Operating System",
      line: "Ihr ganzer Betrieb auf einem Bildschirm.",
      tags: ["Übersicht", "Wissen", "Abläufe", "Berichte"],
    },
  ],
  foundation: {
    title: "Corporate LLM",
    subtitle: "Das Wissen Ihres Betriebs an einem Ort",
    tags: [
      "Firmenwissen gebündelt",
      "Antworten mit Quelle",
      "Rechte und Rollen",
      "Verbunden mit Ihren Programmen",
    ],
  },
  closing:
    "Wir beginnen mit dem Baustein, der Ihnen sofort Zeit zurückgibt, und bauen von dort weiter.",
  figureAlt:
    "Ein Fundament mit der Aufschrift Corporate LLM. Aus ihm steigen Lichtpunkte in drei Felder darüber auf, Automatisierungen, Voice Agents und Operating System.",
};

/* ------------------------------------------------------------------ */
/*  Unterseite /marketing                                              */
/* ------------------------------------------------------------------ */

/* Seit der Aufteilung in Unterseiten ist /marketing nur noch die
   Uebersicht. Die ausfuehrlichen Texte je Leistung stehen bei der
   jeweiligen Unterseite, hier steht zu jeder Leistung genau ein Satz. */
export const marketingPage = {
  hero: {
    titleBefore: "Zwei Wege, damit man Sie",
    gradientWord: "sieht.",
    titleAfter: "",
    lead: "Eine eigene Webseite und Ihre Kanäle im Netz. Jede Leistung wirkt für sich, und zusammen ergeben sie einen Auftritt, der zusammenpasst.",
    /* Der Knopf stand bis zum 03.09.2026 nicht im Kopf. Der Pruefbericht
       hat bemaengelt, dass der erste Bildschirm keinen Weg ins Gespraech
       kannte. */
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  },
  services: [
    {
      id: "web",
      name: "Webseiten",
      body: "Eine Seite, die schnell lädt, auf dem Handy gut aussieht und aus Besuchern Anfragen macht.",
      href: "/marketing/webseiten",
      cta: "Webseiten ansehen",
    },
    {
      id: "social",
      name: "Social Media",
      body: "Instagram und TikTok, von der Idee über den Dreh bis zur Veröffentlichung. Ihre Marke wächst, während Sie arbeiten.",
      href: "/marketing/social-media",
      cta: "Social Media ansehen",
    },
    /* Das dritte Feld Werbetafeln ist am 03.09.2026 auf Wunsch des
       Auftraggebers entfallen. Die Texte der Unterseite stehen weiter
       unter werbetafelnPage. */
  ],
  faqTitle: "Fragen zum Marketing.",
  faqIntro: "Die Punkte, die für beide Leistungen gelten.",
  faq: [
    {
      q: "Kann ich einzelne Leistungen buchen?",
      a: "Ja. Webseite und Social Media funktionieren einzeln. Zusammen entfalten sie die größte Wirkung, weil überall dieselbe Handschrift sichtbar wird.",
    },
    {
      q: "Wer kümmert sich um die Inhalte?",
      a: "Das übernehmen wir. Wir fotografieren, filmen, schneiden und schreiben die Texte, und Sie geben vor der Veröffentlichung frei.",
    },
    {
      q: "Was kostet die Zusammenarbeit?",
      a: "Nach dem ersten Gespräch erhalten Sie ein Angebot mit festem Umfang, festem Preis und einem Zeitplan. Sie wissen also vorher, woran Sie sind.",
    },
    {
      q: "Wie schnell geht es los?",
      a: "Im Gespräch legen wir fest, womit wir anfangen. Danach beginnen wir mit dem Schritt, der bei Ihnen am meisten bewirkt.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Unterseite /marketing/social-media                                 */
/*  Die Seite uebernimmt die Kugel-Welt der frueheren Marketingseite.  */
/*  Zahlen sind hier bewusst keine genannt. Belegt ist allein die vom  */
/*  Auftraggeber bestaetigte Angabe von 35 und mehr Projekten.         */
/* ------------------------------------------------------------------ */

export const socialPage = {
  meta: {
    title: "Social Media auf Instagram und TikTok",
    description:
      "SVH Consulting baut Ihre Marke auf Instagram und TikTok auf. Plan, Dreh im Betrieb, Schnitt, Werbeanzeigen und ein Bericht jeden Monat.",
  },
  hero: {
    /* Die Ueberschrift steht in zwei festen Zeilen. Der Umbruch nach dem
       Wort TikTok ist gesetzt und nicht der Spaltenbreite ueberlassen,
       damit die Zeile auf jedem Schirm gleich faellt. */
    titleLine1: "Auf Instagram und TikTok",
    titleLine2: "werden Sie",
    gradientWord: "gesehen.",
    lead: "Wir bauen Ihre Marke auf, sorgen für viele Aufrufe und machen Ihren Betrieb für die Menschen in Ihrer Region sichtbar.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  },
  platforms: {
    title: "Hier ist Ihre Marke zu Hause.",
    lead: "Zwei Orte, an denen Ihre Kunden jeden Tag unterwegs sind. Wir bespielen beide.",
    items: [
      {
        id: "instagram",
        name: "Instagram",
        body: "Beiträge und kurze Videos zeigen Ihre Arbeit, Ihr Team und Ihre Ergebnisse. So merken sich Menschen Ihren Namen.",
      },
      {
        id: "tiktok",
        name: "TikTok",
        body: "Kurze Videos, die man bis zum Ende schaut. So erreichen Sie auch die Menschen, die Sie noch gar nicht kennen.",
      },
    ],
  },
  growth: {
    title: "Was passiert, wenn es läuft.",
    body: "Mehr Menschen folgen Ihnen, mehr Menschen reagieren, und jeder neue Beitrag erreicht mehr als der davor.",
    counterLabel: "Menschen, die Ihnen folgen",
    /** ❗TODO Wird seit dem 02.09.2026 nicht gezeigt. Das Wort stand im
        Zaehlerfeld in der Groesze des Zaehlwerks und blieb nach dem Lauf
        dort stehen, wodurch die Szene wie ein haengengebliebener Zaehler
        aussah. Im Ruhezustand steht jetzt ein steigender Pfeil neben der
        Beschriftung. Der Merkposten bleibt, falls das Feld spaeter wieder
        eine grosze Zeile bekommt. */
    counterRest: "werden mehr",
    postCaption: "Ein neuer Beitrag ist online",
    replay: "Noch einmal ansehen",
    proof: "35+ umgesetzte Projekte",
  },
  scope: {
    title: "Was dazugehört.",
    items: [
      { id: "plan", label: "Plan für den Monat" },
      { id: "shoot", label: "Dreh vor Ort" },
      { id: "cut", label: "Schnitt und Texte" },
      { id: "ads", label: "Werbeanzeigen" },
      { id: "care", label: "Laufende Betreuung" },
      { id: "report", label: "Bericht jeden Monat" },
    ],
  },
  steps: {
    title: "So läuft es ab.",
    items: [
      {
        n: "01",
        title: "Themen festlegen",
        body: "Wir legen zusammen fest, was im nächsten Monat gezeigt wird, und schreiben es in einen Plan.",
      },
      {
        n: "02",
        title: "Drehtag im Betrieb",
        body: "Wir kommen zu Ihnen und filmen Ihre Arbeit. Wenn Sie lieber nicht vor die Kamera möchten, zeigen wir Ihr Handwerk und Ihre Ergebnisse.",
      },
      {
        n: "03",
        title: "Veröffentlichen und nachsteuern",
        body: "Wir schneiden, schreiben die Texte und veröffentlichen. Was gut läuft, machen wir öfter.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Unterseite /ueber-uns                                              */
/* ------------------------------------------------------------------ */

export const aboutPage = {
  hero: {
    titleBefore: "Ein Partner für",
    gradientWord: "alles",
    titleAfter: "Digitale.",
    lead: "Wir bringen Webseite, Social Media und KI in Ihrem Betrieb zusammen, damit mehr Anfragen hereinkommen und weniger Zeit verloren geht.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  },

  strands: {
    titleBefore: "Drei Bereiche,",
    gradientWord: "ein",
    titleAfter: "Partner.",
    body: "Viele Betriebe haben für die Webseite eine Firma, für Social Media eine zweite und für KI eine dritte. Bei uns läuft alles an einer Stelle zusammen, und deshalb passt am Ende auch alles zueinander.",
    sources: ["Webseite", "Social Media", "KI"],
    target: "SVH Consulting",
    figureAlt:
      "Drei getrennte Stränge für Webseite, Social Media und KI laufen nach unten und verbinden sich dort zu einem einzigen Strang.",
  },

  change: {
    titleBefore: "Was das im",
    gradientWord: "Betrieb",
    titleAfter: "ändert.",
    scenes: [
      {
        id: "auto",
        line: "Arbeit, die sich jeden Tag wiederholt, läuft ab jetzt von selbst.",
        alt: "Mehrere Arbeitsschritte werden einzeln von Hand erledigt und laufen danach als gleichmäßige Linien durch.",
      },
      {
        id: "reach",
        line: "Sie werden im Netz gefunden, und die Anfragen kommen von allein.",
        alt: "Punkte im Umfeld finden nach und nach den Weg zu einem hellen Punkt in der Mitte.",
      },
      {
        id: "time",
        line: "Am Ende bleibt mehr Zeit für die Arbeit, mit der Sie Ihr Geld verdienen.",
        alt: "Ein Balken für einen Arbeitstag. Der Anteil für Verwaltung wird kleiner, der Anteil für die eigentliche Arbeit wächst.",
      },
    ],
  },

  proof: {
    count: 35,
    plus: "+",
    label: "umgesetzte Projekte",
    intro: "Diese Projekte verteilen sich auf drei Bereiche.",
    areas: ["Webseiten", "Social Media", "KI"],
  },

  values: {
    titleBefore: "Worauf Sie sich",
    gradientWord: "verlassen",
    titleAfter: "können.",
    items: [
      {
        title: "Qualität",
        body: "Ihr Auftritt wirkt wie der einer großen Firma und funktioniert auf jedem Gerät genauso zuverlässig.",
      },
      {
        title: "Schnelle Arbeit",
        body: "Wir fangen zügig an, und Sie sehen früh ein erstes Ergebnis, das schon für Sie arbeitet.",
      },
      {
        title: "Zuverlässigkeit",
        body: "Sie bekommen eine Antwort, und was wir zusagen, steht am vereinbarten Tag.",
      },
    ],
  },

  team: {
    titleBefore: "Die Menschen",
    gradientWord: "dahinter.",
    titleAfter: "",
    note: "Unser Sitz ist Zangberg. Bei jedem Projekt sprechen Sie direkt mit uns beiden.",
    members: [
      {
        name: "Lukas Sehorz",
        role: "Gesellschafter",
        // Solange das Kurzprofil mit der Markierung beginnt, zeigt der
        // Teamblock die Zeile gar nicht an. Kein Platzhalter auf der Seite.
        body: "❗TODO Kurzprofil ergänzen. Schwerpunkt, Hintergrund und wofür Kunden ihn ansprechen.",
      },
      {
        name: "Jannik vom Hofe",
        role: "Gesellschafter",
        body: "❗TODO Kurzprofil ergänzen. Schwerpunkt, Hintergrund und wofür Kunden ihn ansprechen.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Unterseite /kontakt                                                */
/* ------------------------------------------------------------------ */

export const contactPage = {
  hero: {
    label: "Kontakt",
    titleBefore: "Sprechen wir über Ihren",
    gradientWord: "Betrieb.",
    titleAfter: "",
    lead: "Ein erstes Gespräch dauert etwa zwanzig Minuten, kostet nichts und verpflichtet zu nichts. Danach wissen Sie, ob und wo sich etwas für Sie lohnt.",
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
  /* Eine Antwortzeit stand hier bis zum 02.09.2026 als Zusage. Belegt ist
     sie nicht, also steht jetzt an ihrer Stelle, was belegt ist. */
  facts: [
    { label: "Erstgespräch", value: "Kostenlos" },
    { label: "Dauer", value: "Rund zwanzig Minuten" },
    { label: "Ansprechpartner", value: "Die beiden Gründer" },
  ],
  /* Stand bis zum 03.09.2026 unter dem Anker anfrage anstelle des
     Formulars. Seit der Empfaenger feststeht, ist das Formular wieder
     eingehaengt; die beiden Zeilen bleiben als Merkposten, falls der
     Block einmal zurueckkommt. */
  direct: {
    title: "Direkt zu uns",
    body: "Ein Anruf oder eine Mail genügt. Das Erstgespräch dauert rund zwanzig Minuten und kostet nichts.",
  },
  /* Das Formular ist seit dem 03.09.2026 wieder eingehaengt. Der Versand
     laeuft ueber app/api/anfrage an die Adresse aus content.ts; ohne
     Schluessel beim Hoster oeffnet sich stattdessen das E-Mail-Programm
     des Besuchers mit der fertigen Nachricht. */
  form: {
    title: "Allgemeine Anfrage",
    body: "Schreiben Sie uns kurz, worum es geht. Je konkreter Ihre Nachricht, desto besser können wir uns vorbereiten.",
    fields: {
      name: "Ihr Name",
      company: "Unternehmen",
      /* Branche und Mitarbeiterzahl hat der Auftraggeber am 03.09.2026
         dazu verlangt, damit er vor dem Gespraech weisz, mit wem er es zu
         tun hat. Beide sind freiwillig, damit die Huerde niedrig bleibt. */
      industry: "Branche",
      employees: "Zahl der Mitarbeiter",
      email: "E-Mail-Adresse",
      phone: "Telefon (optional)",
      topic: "Worum geht es?",
      message: "Ihre Nachricht",
    },
    employeeOptions: ["1 bis 5", "6 bis 20", "21 bis 50", "51 bis 200", "Mehr als 200"],
    /* Dieselben Worte wie in Leiste und Fusszeile, damit der Besucher
       seine Leistung im Auswahlfeld sofort wiederfindet. */
    topics: [
      "KI-Automatisierung",
      "Webseiten",
      "Social Media",
      "Etwas anderes",
    ],
    consent:
      "Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden. Einzelheiten stehen in der Datenschutzerklärung.",
    submit: "Anfrage senden",
    sending: "Wird gesendet",
    success: "Danke, Ihre Anfrage ist angekommen. Wir melden uns bei Ihnen.",
    /* Erscheint, wenn der Versand ueber die Seite gerade nicht eingerichtet
       ist. Die Nachricht wandert dann in das E-Mail-Programm des
       Besuchers, und dieser Satz sagt ihm, was er noch tun muss. */
    fallback:
      "Ihr E-Mail-Programm öffnet sich mit Ihrer Nachricht an uns. Sie müssen sie nur noch abschicken.",
    /* Erscheint, wenn der Versand mit einem Fehler endet. Die Adresse
       haengt die Komponente aus content.ts an. */
    failure:
      "Die Nachricht konnte gerade nicht gesendet werden. Rufen Sie uns an oder schreiben Sie direkt an",
    selectPlaceholder: "Bitte wählen",
    errors: {
      name: "Bitte geben Sie Ihren Namen an.",
      email: "Bitte geben Sie Ihre E-Mail-Adresse an.",
      emailInvalid: "Diese E-Mail-Adresse sieht unvollständig aus.",
      message: "Bitte schreiben Sie uns kurz Ihr Anliegen.",
    },
  },
  detailLabels: {
    phone: "Telefon",
    email: "E-Mail",
    address: "Anschrift",
    hours: "Erreichbarkeit",
  },
  /* Die Worte in der E-Mail, die das Formular an den Auftraggeber
     schickt. Sie stehen hier, damit die Mail dieselbe Sprache spricht wie
     die Seite und an einer Stelle gepflegt wird. */
  mail: {
    brand: "SVH Consulting",
    title: "Neue Anfrage über die Webseite",
    subject: "Anfrage über die Webseite von",
    none: "keine Angabe",
    replyNote: "Antworten Sie einfach auf diese E-Mail, die Antwort geht an",
    labels: {
      name: "Name",
      company: "Unternehmen",
      industry: "Branche",
      employees: "Mitarbeiter",
      email: "E-Mail",
      phone: "Telefon",
      topic: "Thema",
      message: "Nachricht",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Landing v2 · Hero-Feld (Morph zwischen Chaos und Ordnung)          */
/* ------------------------------------------------------------------ */

export const heroField = {
  /** Kleine Bildunterschriften, die mit dem Zustand der Konstellation wechseln. */
  states: {
    chaos: "Ohne SVH Consulting",
    order: "Mit SVH Consulting",
  },
  /** Unsere drei Werte. Sie erscheinen, sobald die Wolke ein System bildet. */
  values: ["Qualität", "Schnelle Arbeit", "Zuverlässigkeit"],
};

/* ------------------------------------------------------------------ */
/*  Landing v2 · S2 KI als Ebenen-Aufbau (isometrisch)                 */
/* ------------------------------------------------------------------ */

export const kiLayers = {
  label: "03 · KI",
  title: "Eine neue Ebene in Ihrem Betrieb.",
  intro:
    "Zwischen Ihrem Team und Ihren Programmen entsteht eine neue Ebene. Sie kennt Ihren Betrieb, erledigt die tägliche Fleißarbeit und lernt dabei dazu.",
  /** Drei Karten wandern links an der Bühne vorbei. Die aktive ist dunkel. */
  cards: [
    {
      tag: "Die Idee",
      title: "Ihr Betrieb läuft von allein.",
      body: "Ihr Team gibt die Richtung vor und entscheidet. Alles, was sich wiederholt, übernehmen Systeme, die rund um die Uhr arbeiten.",
    },
    {
      tag: "Das Fundament",
      title: "Eine Ebene, die Ihren Betrieb kennt.",
      body: "Im Kern liegt das Wissen Ihres Betriebs, geordnet und immer aktuell. Darauf arbeitet die KI und erledigt damit Ihre täglichen Aufgaben.",
    },
    {
      tag: "Der Unterschied",
      title: "Eine KI, die selbst handelt.",
      body: "Viele Werkzeuge schlagen Ihnen etwas vor. Unsere Ebene erledigt die Arbeit selbst und wird dabei besser, während Ihr Team die Richtung vorgibt.",
    },
  ],
  layers: [
    {
      id: "team",
      role: "given",
      title: "Ihr Team",
      body: "Gibt Richtung vor, entscheidet und gibt frei.",
    },
    {
      id: "agents",
      role: "added",
      title: "KI, die mitarbeitet",
      body: "Übernimmt die Arbeit, die sich jeden Tag wiederholt.",
    },
    {
      id: "llm",
      role: "added",
      title: "Wissen über Ihren Betrieb",
      body: "Alles, was Ihr Betrieb weiß, an einem Ort und immer aktuell.",
    },
    {
      id: "systems",
      role: "given",
      title: "Ihre Programme",
      body: "Kundenliste, E-Mail, Kalender, Buchhaltung und alles darum herum.",
    },
  ],
  integrations: {
    note: "Verbunden mit den Werkzeugen, die Sie schon nutzen",
    tools: ["n8n", "Make", "OpenAI", "HubSpot", "Meta", "Google", "Anthropic", "Zapier"],
    more: "viele weitere",
  },
  link: { label: "KI im Detail", href: "/ki" },
};

/* ------------------------------------------------------------------ */
/*  Landing v2 · S2b Mikro-Animationen der KI-Leistungen               */
/* ------------------------------------------------------------------ */

export const kiTiles = {
  title: "Was diese Ebene für Sie erledigt",
  intro:
    "Jede Kachel ist ein Baustein, den wir einzeln bei Ihnen einbauen. Zusammen ergeben sie einen Betrieb, in dem nichts mehr liegen bleibt.",
  hint: "Zeigen Sie auf eine Kachel, dann läuft sie noch einmal.",
  tiles: [
    {
      id: "email",
      title: "E-Mail beantworten",
      body: "Eine Anfrage kommt herein und die Antwort geht sofort wieder hinaus.",
    },
    {
      id: "chat",
      title: "Fragen im Chat",
      body: "Ihre Kunden fragen zu jeder Stunde und bekommen sofort eine Antwort.",
    },
    {
      id: "invoice",
      title: "Angebot und Rechnung",
      body: "Angebot, Rechnung und Erinnerung laufen von allein durch.",
    },
    {
      id: "calendar",
      title: "Termine buchen",
      body: "Freie Zeiten werden vorgeschlagen und gleich fest eingetragen.",
    },
    {
      id: "leads",
      title: "Anfragen erfassen",
      body: "Jede Anfrage landet sofort sauber in Ihrer Kundenliste.",
    },
    {
      id: "report",
      title: "Zahlen auswerten",
      body: "Die Zahlen sammeln sich von allein zu einem fertigen Bericht.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Landing v2 · S4 Marketing-DNA (Stil der DNA-Startseite)            */
/* ------------------------------------------------------------------ */

/* Der Abschnitt traegt auszer dem einen Ring bewusst keine Zahl. Jede
   Aussage beschreibt, WAS die Leistung ist, WIE sie ablaeuft und WAS der
   Kunde davon hat. Keine nennt einen Preis, eine Laufzeit, einen Standort,
   eine Reichweite oder eine Zusage, denn nichts davon liegt uns belegt vor.
   ❗TODO Reichweiten, Kontaktzahlen, Klickpreise und Beispielergebnisse
   ergaenzen, sobald sie belegbar sind. Bis dahin bleibt der Abschnitt ohne
   Zahlen, statt geschaetzte einzusetzen. */
export const marketingDna = {
  label: "05 · Marketing",
  titleBefore: "Wir bauen Ihre",
  gradientWord: "Marketing-DNA.",
  titleAfter: "",
  intro:
    "Wir bringen Ihren Betrieb im Netz nach vorn. Mehr Menschen finden Sie, und aus Ihrem Namen wird eine Marke, die in Ihrer Region hängen bleibt.",
  /* Der zweite Absatz fuehrt die drei Straenge ein, bevor sie einzeln
     aufgeschlagen werden. Er gibt dem Leser das Bild, das die Sektion
     danach ausbuchstabiert. */
  introMore:
    "Dahinter stehen zwei Stränge in derselben Handschrift. Ihre Webseite macht aus Interesse eine Anfrage, und Social Media hält Sie im Gespräch, auch wenn gerade niemand sucht.",
  /* Nur noch EIN Ring. Der Pruefbericht hat festgehalten, dass die Ringe
     mit 1 und 3 die eigene Gliederung zaehlten und keine Aussage trugen.
     Belegt ist allein die Zahl der Projekte, und nur sie steht grosz. Die
     beiden anderen Aussagen stehen als Saetze daneben. */
  rings: [{ value: "35+", label: "Umgesetzte Projekte" }],
  ringNotes: [
    "Ein Ansprechpartner aus der Region für alles.",
    "Zwei Stränge, die zusammen Ihre Marketing-DNA ergeben.",
  ],
  strandsLabel: "Die zwei Stränge",
  /* Jeder Strang traegt Kopf, EINEN Satz, sechs Marken, den Ablauf in drei
     Schritten und einen stillen Verweis auf seine Unterseite.
     DER ERKLAERENDE ABSATZ IST ENTFALLEN. Der Auftraggeber hat die Sektion
     dreimal als zu textlastig bezeichnet und zuletzt je Punkt zwei bis drei
     Woerter verlangt. Der Merksatz traegt jetzt die ganze Aussage des
     Stranges und ist dafuer neu geschrieben, also einfacher und ohne Bild.
     Die alten Absaetze sind nicht geparkt, sondern weg; was von ihnen
     gebraucht wird, steht auf den drei Unterseiten. */
  /* Die Felder `lang` an den Marken und `body` an den Schritten werden
     seit dem 02.09.2026 nicht mehr gezeigt. Sie standen im Titelattribut
     der Kacheln, und ein Titelattribut erscheint erst nach Sekunden, nur
     mit einer Maus und nie auf dem Telefon. Es war damit an genau der
     Stelle die einzige Erklaerung, an der ein Besucher sie brauchen
     wuerde. Die Saetze bleiben hier als Merkposten stehen, denn sie sind
     der Stoff fuer eine sichtbare Fassung, sobald die Sektion Platz
     dafuer bekommt. */
  strands: [
    {
      n: "01",
      id: "web",
      title: "Webseite",
      kicker: "Ihre Webseite ist der Ort, an dem aus Interesse eine Anfrage wird.",
      pointsTitle: "Was dazugehört",
      points: [
        { icon: "design", text: "Individuelles Design", lang: "Individuell entwickeltes Design ohne Baukasten" },
        { icon: "pen", text: "Texte und Bilder", lang: "Aufbau, Texte und Bildsprache aus einer Hand" },
        { icon: "gauge", text: "Kurze Ladezeiten", lang: "Kurze Ladezeiten am Schreibtisch wie am Telefon" },
        { icon: "search", text: "Sichtbar bei Google", lang: "Saubere technische Grundlagen für die Google-Suche" },
        { icon: "form", text: "Anfragen kommen an", lang: "Formulare, die jede Anfrage direkt zu Ihnen bringen" },
        { icon: "cycle", text: "Pflege danach", lang: "Pflege und Weiterentwicklung nach dem Start" },
      ],
      stepsTitle: "So läuft es ab",
      steps: [
        {
          n: "01",
          title: "Zuhören",
          body: "Wir klären, wen Sie erreichen wollen und welche Anfragen sich lohnen.",
        },
        {
          n: "02",
          title: "Entwerfen",
          body: "Sie sehen Aufbau und Gestaltung, bevor die Entwicklung beginnt.",
        },
        {
          n: "03",
          title: "Bauen und begleiten",
          body: "Wir setzen um, verbinden Ihre Systeme und bleiben ansprechbar.",
        },
      ],
      note: "Von Ihnen brauchen wir ein Gespräch über Ihr Angebot, den Zugang zu Ihrer Domain und Bilder, die Ihren Betrieb ehrlich zeigen.",
      /* Der stille Verweis. Er steht am Ende des Stranges, ist ein Link und
         keine Schaltflaeche, und bekommt deshalb keinen Rahmen. */
      link: { label: "Mehr zu Webseiten", href: "/marketing/webseiten" },
      /* Die wenigen Woerter, die im Schaustueck selbst zu lesen sind. Sie
         gehoeren nach copy.ts wie jeder andere sichtbare Text. */
      szene: {
        adresse: "ihr-betrieb.de",
        knopf: "Termin buchen",
        bestaetigt: "Termin bestätigt",
        /* Das Suchwort, das sich zu Beginn der Szene in das Suchfeld
           tippt. Es nennt eine Branche und keinen Betrieb, denn welcher
           Betrieb auf der Seite steht, wissen wir nicht. */
        suche: "Handwerker in der Nähe",
        /* Die Meldung, die am Ende der Szene auf dem Telefon des Betriebs
           aufleuchtet, nachdem der Termin bestaetigt ist. */
        anfrage: "Neue Anfrage",
        /* Die Beschriftung am kleinen Zaehler neben dem Fenster. Er
           springt in jeder Runde um eins hoch und bleibt damit erkennbar
           eine Vorfuehrung, denn eine belegte Endzahl gibt es dafuer
           nicht. */
        zaehler: "Anfragen",
      },
    },
    {
      n: "02",
      id: "social",
      title: "Social Media",
      kicker: "Ihre Kundschaft sieht Sie auch dann, wenn sie gerade nichts sucht.",
      pointsTitle: "Was dazugehört",
      points: [
        { icon: "calendar", text: "Ein fester Plan", lang: "Ein fester Plan, was wann veröffentlicht wird" },
        { icon: "camera", text: "Produktion vor Ort", lang: "Foto- und Videoproduktion bei Ihnen vor Ort" },
        { icon: "scissors", text: "Schnitt und Texte", lang: "Schnitt, Texte und Veröffentlichung übernehmen wir" },
        { icon: "megaphone", text: "Meta, Instagram, TikTok", lang: "Werbeanzeigen auf Meta, Instagram und TikTok" },
        { icon: "chat", text: "Kommentare betreut", lang: "Betreuung von Kommentaren und Nachrichten nach Absprache" },
        { icon: "chart", text: "Monatlicher Bericht", lang: "Monatlicher Bericht in verständlicher Sprache" },
      ],
      stepsTitle: "So läuft es ab",
      steps: [
        {
          n: "01",
          title: "Themen festlegen",
          body: "Wir stimmen ab, worüber gesprochen wird und wie oft.",
        },
        {
          n: "02",
          title: "Drehtag im Betrieb",
          body: "An einem Termin entsteht das Material für den ganzen Zeitraum.",
        },
        {
          n: "03",
          title: "Veröffentlichen und nachsteuern",
          body: "Was gut ankommt, verstärken wir mit Anzeigenbudget.",
        },
      ],
      note: "Von Ihnen brauchen wir den Zugang zu Ihren Kanälen und einen Termin, an dem wir bei Ihnen drehen dürfen.",
      link: { label: "Mehr zu Social Media", href: "/marketing/social-media" },
      /* Die beiden Beschriftungen am Zaehler und an der Kurve. Eine Endzahl
         steht bewusst nirgends, denn belegt ist sie nicht. Der Zaehler
         laeuft von null hoch und beginnt danach wieder von vorn. */
      szene: { zaehler: "Wer Ihnen folgt", kurve: "Aufrufe" },
    },
    /* Der dritte Strang Werbetafeln ist am 03.09.2026 auf Wunsch des
       Auftraggebers aus der Sektion genommen, vorerst. Seine Buehne, die
       Stele mit den vier Spots, bleibt in StrandStage.tsx erhalten und
       laesst sich mit einem Eintrag an dieser Stelle wieder einhaengen. */
  ],
  closingLabel: "Zusammenspiel",
  closing:
    "Erst zusammen ergeben die zwei Stränge eine DNA. Wer Sie auf Instagram gesehen hat, erkennt Sie auf Ihrer Webseite wieder, und die spricht dieselbe Sprache. Deshalb betreuen wir beide aus einer Hand.",
  link: { label: "Marketing im Detail", href: "/marketing" },
};

/* ------------------------------------------------------------------ */
/*  /marketing v2 · Kugel-Bühne im Stil der DNA-Unterseite             */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  /marketing/webseiten · Welt "Fenster im Dunkeln"                    */
/*                                                                      */
/*  Jede Zeile ist so geschrieben, dass ein Kind sie versteht und man    */
/*  sie laut vorlesen kann, ohne dass jemand nachfragt. Es steht keine   */
/*  einzige Zahl auf dieser Seite auszer den 35+ umgesetzten Projekten,  */
/*  weil alles andere unbelegt waere.                                    */
/* ------------------------------------------------------------------ */

export const webseitenPage = {
  meta: {
    title: "Webseiten, die Kunden bringen",
    description:
      "SVH Consulting baut Webseiten für Betriebe. Modern, schnell, auf dem Handy sauber, bei Google und in KI-Antworten zu finden und darauf gebaut, dass aus Besuchern Kunden werden.",
  },

  /* S1 Hero. Die Ueberschrift steht in zwei Zeilen, damit sie auf jedem
     Schirm dieselbe Silhouette behaelt. */
  hero: {
    line1: "Eine Webseite,",
    line2Before: "die ",
    line2Word: "Kunden",
    line2After: " bringt",
    lead: "Wir bauen Ihnen einen Auftritt, den Ihre Kunden sofort verstehen und der Tag und Nacht neue Anfragen für Sie sammelt.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
    secondary: { label: "Unsere Arbeiten ansehen", href: "#referenzen" },
    fieldAlt:
      "Ausschnitte aus vier Webseiten, die wir gebaut haben, als leuchtende Fenster im Dunkeln",
  },

  /* S2 Bausteinband. Zwei Woerter je Karte, mehr traegt eine laufende
     Karte nicht. Die Symbolnamen zeigen auf BandIcons.tsx. */
  band: {
    note: "Das alles gehört zu einer Webseite, die wirklich arbeitet.",
    itemsA: [
      { icon: "home", label: "Startseite" },
      { icon: "list", label: "Leistungen" },
      { icon: "form", label: "Kontaktformular" },
      { icon: "pin", label: "Google-Eintrag" },
      { icon: "image", label: "Bilder" },
      { icon: "bolt", label: "Ladezeit" },
    ],
    itemsB: [
      { icon: "phone", label: "Handy-Ansicht" },
      { icon: "clock", label: "Öffnungszeiten" },
      { icon: "route", label: "Anfahrt" },
      { icon: "star", label: "Bewertungen" },
      { icon: "text", label: "Texte" },
      { icon: "shield", label: "Rechtliches" },
    ],
  },

  /* S3 Warum. Vier Felder mit Haarlinien dazwischen. Feld 04 traegt die
     einzige bestaetigte Zahl der Seite. */
  why: {
    titleBefore: "Was Ihnen eine",
    titleWord: "gute",
    titleAfter: "Webseite bringt",
    aside:
      "Sie arbeitet auch dann für Sie, wenn Sie gerade auf der Baustelle stehen oder längst Feierabend haben.",
    fields: [
      {
        head: "Immer offen",
        body: "Ihre Webseite nimmt Anfragen entgegen, nachts, am Wochenende und im Urlaub.",
      },
      {
        head: "Der erste Eindruck",
        body: "Die meisten Kunden sehen Ihre Webseite, bevor sie zum ersten Mal mit Ihnen sprechen.",
      },
      {
        head: "Zuerst am Handy",
        body: "Gesucht wird unterwegs am Telefon. Dort muss Ihre Seite genauso gut aussehen wie am Rechner.",
      },
      {
        head: "35+",
        body: "Projekte haben wir für Betriebe umgesetzt, Webseiten gehören dazu.",
      },
    ],
  },

  /* S4 Was wir tun. Reihenfolge vom Auftraggeber festgelegt. Der
     Schluessel `art` waehlt die gezeichnete Oberflaeche in Mockups.tsx. */
  work: {
    titleBefore: "Was wir für Ihre",
    titleWord: "Webseite",
    titleAfter: "tun",
    aside:
      "Sechs Dinge machen den Unterschied zwischen einer Seite, die nur da ist, und einer, die Ihnen Arbeit abnimmt.",
    rows: [
      {
        art: "design",
        head: "Modernes Design",
        body: "Ihre Seite sieht so aus, wie Ihr Betrieb heute arbeitet, aufgeräumt und klar.",
        points: ["Klare Ordnung", "Ruhige Farben", "Ihre eigenen Bilder"],
      },
      {
        art: "mobil",
        head: "Mobil optimiert",
        body: "Auf dem Handy sitzt jede Zeile und jeder Knopf genau da, wo der Daumen ihn braucht.",
        points: ["Jeder Bildschirm", "Große Knöpfe", "Anrufen mit einem Tipp"],
      },
      {
        art: "tempo",
        head: "Schnelle Ladezeiten",
        body: "Die Seite steht da, bevor jemand ungeduldig wird und weiterklickt.",
        points: ["Leichte Bilder", "Schlanker Aufbau", "Kein Ballast"],
      },
      {
        art: "suche",
        head: "Bei Google gefunden",
        body: "Wer in Ihrer Gegend nach Ihrer Leistung sucht, findet Sie und nicht nur die anderen.",
        points: ["Passende Titel", "Ort und Umgebung", "Gepflegter Eintrag"],
      },
      {
        art: "ki",
        head: "Von KI-Suchmaschinen gelesen",
        body: "Immer mehr Leute fragen eine KI um Rat. Ihre Seite ist so gebaut, dass eine KI sie versteht und Sie nennen kann.",
        points: ["Klarer Aufbau", "Klare Antworten", "Als Quelle lesbar"],
      },
      {
        art: "kunden",
        head: "Aus Besuchern werden Kunden",
        body: "Jede Seite führt zu einem Punkt, an dem der Besucher Sie ohne Umweg erreicht.",
        points: ["Kurzes Formular", "Nummer immer sichtbar", "Ein klarer Schritt"],
      },
    ],
  },

  /* S5 Referenzen. Vier echte Seiten, alle vier am 01.09.2026 erreichbar.
     Die Bilder liegen unter public/referenzen und sind unveraendert. */
  refs: {
    titleBefore: "Sehen Sie sich unsere",
    titleWord: "Arbeit",
    titleAfter: "an",
    aside:
      "Das sind vier Webseiten von uns. Ein Klick auf den Namen öffnet die echte Seite in einem neuen Fenster.",
    overviewNote: "Zu diesem Projekt springen",
    linkNote: "Öffnet die Seite in einem neuen Fenster",
    runNote: "Die ganze Seite läuft im Fenster mit, während Sie scrollen.",
    items: [
      {
        id: "brandhuber",
        name: "Brandhuber GmbH",
        field: "Sonnenschutz",
        url: "https://brandhuber.gmbh",
        host: "brandhuber.gmbh",
        body: "Ein großes Bild, ein einziges Wort und ein kurzer Weg zum Angebot. Wer Sonnenschutz sucht, sieht sofort, worum es geht.",
        heroAlt: "Startbild der Webseite der Brandhuber GmbH mit einer Terrasse unter einer Markise",
        fullAlt: "Die ganze Webseite der Brandhuber GmbH von oben bis unten",
      },
      {
        id: "world-of-less",
        name: "World of Less",
        field: "Logistik",
        url: "https://world-of-less.de",
        host: "world-of-less.de",
        body: "Die Telefonnummer steht ganz oben, die Leistungen direkt darunter. Ein Anruf ist immer nur einen Tipp entfernt.",
        heroAlt: "Startbild der Webseite von World of Less mit einem Lastwagen auf der Landstraße",
        fullAlt: "Die ganze Webseite von World of Less von oben bis unten",
      },
      {
        id: "taxi-izi",
        name: "Taxi IZI",
        field: "Taxi",
        url: "https://taxi-izi.de",
        host: "taxi-izi.de",
        body: "Dunkel, ruhig und mit einem einzigen Knopf. Wer eine Fahrt braucht, fragt sie in wenigen Sekunden an.",
        heroAlt: "Startbild der Webseite von Taxi IZI mit einem beleuchteten Taxischild bei Nacht",
        fullAlt: "Die ganze Webseite von Taxi IZI von oben bis unten",
      },
      {
        id: "innnatur",
        name: "Inn Natur",
        field: "Heilpraktik",
        url: "https://innnatur-heilpraktiker.de",
        host: "innnatur-heilpraktiker.de",
        body: "Ruhige Farben und vier klare Leistungen. Die Praxis wirkt auf der Seite so freundlich wie im echten Leben.",
        heroAlt: "Startbild der Webseite von Inn Natur mit einer Behandlung in hellen Räumen",
        fullAlt: "Die ganze Webseite von Inn Natur von oben bis unten",
      },
    ],
  },

  /* S6 Ablauf. Keine Wochenangaben, solange der Auftraggeber keine
     bestaetigt hat. ❗TODO Zeitraeume je Schritt ergaenzen, sobald belegt. */
  steps: {
    titleBefore: "In vier",
    titleWord: "Schritten",
    titleAfter: "zu Ihrer Seite",
    aside:
      "Sie müssen nichts vorbereiten. Wir fragen, was Sie brauchen, und den Rest übernehmen wir.",
    items: [
      {
        art: "gespraech",
        head: "Gespräch",
        body: "Wir hören zu, was Ihr Betrieb macht und wen Sie erreichen wollen.",
      },
      {
        art: "entwurf",
        head: "Entwurf",
        body: "Sie sehen Ihre Seite als Bild, bevor wir eine einzige Zeile bauen.",
      },
      {
        art: "bau",
        head: "Bau",
        body: "Wir bauen die Seite, schreiben die Texte und richten Ihre Bilder her.",
      },
      {
        art: "live",
        head: "Livegang",
        body: "Die Seite geht online. Danach bleiben wir für Sie erreichbar.",
      },
    ],
  },

  /* S7 Abschluss. Die zwanzig Minuten und der Preis von null stehen so
     in PRODUCT.md und sind vom Auftraggeber bestaetigt. */
  close: {
    titleBefore: "Ein",
    titleWord: "Gespräch",
    titleAfter: "kostet Sie nichts",
    lead: "Zwanzig Minuten am Telefon reichen, damit Sie wissen, was Ihre Webseite braucht und was sie kostet.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
    secondary: { label: "Alles zum Marketing", href: "/marketing" },
  },
};

/* =====================================================================
   /marketing/werbetafeln
   Alle sichtbaren Texte der Seite. Standorte, Preise, Buchungszeitraeume,
   Reichweiten und Bildschirmzahlen kommen hier bewusst nicht vor, weil es
   sie noch nicht gibt. Der Designauftrag _ref3/brief-werbetafeln.md
   beschreibt, wie jede Sektion ohne diese Angaben vollstaendig wirkt.
   ❗TODO Auftraggeber: sobald Standorte, Zeitraeume und Preise feststehen,
   bekommt diese Seite eine eigene Sektion dafuer.
   ===================================================================== */
export const werbetafelnPage = {
  meta: {
    title: "Digitale Werbetafeln",
    description:
      "SVH Consulting stellt kleine digitale Werbetafeln an gut besuchten Orten auf und macht die Inhalte gleich mit, damit Ihr Betrieb dort läuft, wo jeden Tag Leute vorbeikommen.",
  },

  /* Die vier Spots. Sie laufen auf dem Schirm der Tafel und zeigen, was
     SVH herstellt. Der Grund ist ein erzeugtes Motiv aus public/tafeln,
     die Worte darüber sind gesetzt. Kein Wort davon nennt einen echten
     Betrieb, einen Preis oder einen Zeitraum. Wo eine Videodatei neben
     dem Bild liegt, läuft im Hero das Video und das Bild ist sein
     Standbild. */
  spots: [
    {
      id: "gym",
      word: "Probetraining",
      line: "Neu im Kursplan",
      foot: "Komm vorbei",
      bild: "/tafeln/spot-gym.webp",
      video: "/tafeln/spot-gym.mp4",
      alt: "Spot für ein Gym mit dem Wort Probetraining über einer Kettlebell im blauen Licht",
    },
    {
      id: "restaurant",
      word: "Tageskarte",
      line: "Frisch gekocht",
      foot: "Guten Appetit",
      bild: "/tafeln/spot-restaurant.webp",
      video: "/tafeln/spot-restaurant.mp4",
      alt: "Spot für ein Restaurant mit dem Wort Tageskarte über einem angerichteten Teller",
    },
    {
      id: "event",
      word: "Straßenfest",
      line: "Für die ganze Familie",
      foot: "Alle sind da",
      bild: "/tafeln/spot-event.webp",
      video: "/tafeln/spot-event.mp4",
      alt: "Spot für ein Fest mit dem Wort Straßenfest über einer Lichterkette",
    },
    {
      id: "club",
      word: "Livemusik",
      line: "Bei uns auf der Bühne",
      foot: "Bühne frei",
      bild: "/tafeln/spot-club.webp",
      video: "/tafeln/spot-club.mp4",
      alt: "Spot für einen Club mit dem Wort Livemusik über einem Lichtkegel",
    },
  ],

  /* S1 Hero. Geteilter Bildschirm, links das Versprechen, rechts die
     Tafel auf ihrem Lichtteppich. */
  hero: {
    titleBefore: "Ihr Betrieb auf dem",
    titleWord: "Bildschirm",
    titleAfter: ", an dem alle vorbeigehen",
    lead: "Wir stellen kleine digitale Tafeln dort auf, wo jeden Tag Leute stehen und Zeit haben. Ihr Betrieb läuft dort mit, und die Inhalte machen wir.",
    link: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
    steleLabel: "Schlanke digitale Werbetafel, auf ihrem Schirm wechseln die Spots",
  },

  /* S2 Warum lokale Praesenz wirkt. Drei Gedanken, jeder in einem Satz.
     Keine Reichweite, keine Prozentzahl, weil nichts davon belegt ist. */
  gruende: {
    srTitle: "Warum eine Tafel an einem vollen Ort wirkt",
    lines: [
      { icon: "leute", text: "Die Leute sind schon da." },
      { icon: "blick", text: "Sie haben Zeit und schauen hin." },
      { icon: "naehe", text: "Sie wohnen um die Ecke und stehen morgen bei Ihnen." },
    ],
  },

  /* S3 Wo die Tafeln stehen. Ortsarten statt Adressen. Die vier Bilder
     unter public/tafeln zeigen je eine Stele in Personengröße an einem
     Ort dieser Art. Sie sind erzeugt, zeigen keinen echten Betrieb und
     lösen die Wiederholung der drei Stockfotos auf. */
  orte: {
    titleBefore: "Dort stehen die",
    titleWord: "Tafeln",
    lead: "Vier Arten von Orten, an denen Leute warten, sich unterhalten und zwischendurch aufschauen.",
    cards: [
      {
        id: "gym",
        wort: "Gym",
        text: "Zwischen zwei Sätzen schaut jeder kurz auf, und genau dann läuft Ihr Spot.",
        bild: "/tafeln/ort-gym.webp",
        alt: "Schlanke digitale Werbetafel in einem dunklen Trainingsraum, ihr Bildschirm leuchtet blauviolett",
      },
      {
        id: "restaurant",
        wort: "Restaurant",
        text: "Beim Warten auf das Essen bleibt der Blick an der Tafel hängen.",
        bild: "/tafeln/ort-restaurant.webp",
        alt: "Schlanke digitale Werbetafel am Eingang eines Restaurants am Abend",
      },
      {
        id: "club",
        wort: "Club",
        text: "Am Eingang und an der Bar stehen die Leute dicht beieinander und haben Zeit.",
        bild: "/tafeln/ort-club.webp",
        alt: "Schlanke digitale Werbetafel in einer dunklen Lounge neben der Bar",
      },
      {
        id: "event",
        wort: "Event",
        text: "Wo viele zusammenkommen, sieht Ihre Tafel jeder, der vorbeigeht.",
        bild: "/tafeln/ort-event.webp",
        alt: "Schlanke digitale Werbetafel im Foyer einer Abendveranstaltung",
      },
    ],
    link: { label: "Sagen Sie uns, welcher Ort zu Ihnen passt", href: "/kontakt" },
  },

  /* Das ziehbare Band zwischen S3 und S4. Die Ortsworte sind Kategorien
     und keine Adressen. Kein Betriebsname steht auf einer Kachel. Vier
     Kacheln zeigen den Ort, zwei zeigen den Spot aus der Nähe. */
  band: {
    srTitle: "Beispiele für Tafeln an verschiedenen Orten",
    hinweis: "Ziehen Sie das Band zur Seite.",
    /* Jede Kachel zeigt eine Tafel an einem echten Ort. Die dritte und
       die sechste trugen frueher statt eines Ortsfotos den gezeichneten
       Spot vor dunklem Grund und sprangen dadurch aus der Reihe. Es gibt
       vier Ortsfotos fuer sechs Kacheln, deshalb steht jedes zweimal,
       und die Reihenfolge haelt beide Paare drei Plaetze auseinander. */
    items: [
      {
        bild: "/tafeln/ort-gym.webp",
        alt: "Schlanke digitale Werbetafel in einem dunklen Trainingsraum",
        ort: "Gym",
        text: "Der Kursplan steht neben dem Eingang.",
      },
      {
        bild: "/tafeln/ort-restaurant.webp",
        alt: "Schlanke digitale Werbetafel am Eingang eines Restaurants",
        ort: "Restaurant",
        text: "Die Karte des Tages läuft neben der Theke.",
      },
      {
        bild: "/tafeln/ort-club.webp",
        alt: "Schlanke digitale Werbetafel in einer dunklen Lounge",
        ort: "Club",
        text: "An der Bar sieht jeder, wer heute auf der Bühne steht.",
      },
      {
        bild: "/tafeln/ort-event.webp",
        alt: "Schlanke digitale Werbetafel im Foyer einer Abendveranstaltung",
        ort: "Event",
        text: "Am Eingang leuchtet, worum es hier geht.",
      },
      {
        bild: "/tafeln/ort-restaurant.webp",
        alt: "Schlanke digitale Werbetafel am Eingang eines Restaurants",
        ort: "Restaurant",
        text: "Neben der Ausgabe steht, was frisch gekocht wird.",
      },
      {
        bild: "/tafeln/ort-club.webp",
        alt: "Schlanke digitale Werbetafel in einer dunklen Lounge",
        ort: "Club",
        text: "In der Lounge läuft Ihr Spot zwischen den Sets.",
      },
    ],
  },

  /* S4 Was auf der Tafel laeuft. Oben der Faecher, unten die Tafel vor
     der unscharfen Wand aus Rohmaterial. */
  inhalte: {
    titleBefore: "Aus Ihrem Material wird ein",
    titleWord: "Spot",
    lead: "Sie schicken uns ein paar Fotos, ein kurzes Video vom Handy und einen Satz zu Ihrem Angebot.",
    faecher: [
      { icon: "video", wort: "Video" },
      { icon: "bild", wort: "Bild" },
      { icon: "text", wort: "Text" },
      { icon: "angebot", wort: "Angebot" },
    ],
    faecherNote: "Vier Dinge reichen uns.",
    karte: {
      title: "Den Rest machen wir",
      body: "Wir schneiden Ihr Material zu einem kurzen Spot zusammen, setzen die Schrift groß genug für den Blick im Vorbeigehen und geben ihn auf die Tafel.",
    },
    wandLabel: "Viele kleine Ausschnitte aus Ihrem Material im Hintergrund und der fertige Spot auf der Tafel davor",
  },

  /* S5 So laeuft es ab. Drei Schritte, die aufeinander aufbauen. Keine
     Dauer in Tagen, kein Preis, kein Zeitraum. */
  ablauf: {
    titleBefore: "In drei",
    titleWord: "Schritten",
    titleAfter: "sind Sie dabei",
    steps: [
      {
        head: "Ein kurzes Gespräch",
        body: "Sie erzählen uns, was Ihr Betrieb macht und wen Sie erreichen wollen. Das kostet nichts.",
      },
      {
        head: "Wir machen die Inhalte",
        body: "Wir bauen aus Ihrem Material einen kurzen Spot, der auf der Tafel gut aussieht.",
      },
      {
        head: "Ihr Betrieb läuft",
        body: "Ihr Spot läuft auf den Tafeln, und Sie machen weiter Ihre Arbeit.",
      },
    ],
    flags: [
      { icon: "masz", text: "Kleiner als ein Mensch" },
      { icon: "ort", text: "Steht an einem vollen Ort" },
      { icon: "hand", text: "Die Inhalte kommen von uns" },
    ],
  },

  /* S6 Abschluss. Der einzige gefuellte Knopf der ganzen Seite. Die
     zwanzig Minuten und der Preis von null stehen so in PRODUCT.md. */
  abschluss: {
    titleBefore: "Reden wir kurz über Ihren",
    titleWord: "Betrieb",
    lead: "Sagen Sie uns, was Sie anbieten und wen Sie erreichen wollen. Den Rest zeigen wir Ihnen.",
    cta: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
    note: "Das Gespräch dauert rund zwanzig Minuten und kostet nichts.",
  },
};

/* ------------------------------------------------------------------ */
/*  Seite nicht gefunden                                                */
/* ------------------------------------------------------------------ */

/* Bis zum 03.09.2026 zeigte die Seite die nackte Vorgabe von Next. Der
   Pruefbericht hat das als offenen Punkt gefuehrt. Die Zeile sagt in
   einfachen Worten, was passiert ist, und bietet zwei Wege zurueck. */
export const notFoundPage = {
  meta: { title: "Seite nicht gefunden" },
  label: "404",
  titleBefore: "Diese Adresse führt ins",
  gradientWord: "Leere.",
  titleAfter: "",
  lead: "Vielleicht ist die Adresse falsch geschrieben, oder die Seite ist umgezogen. Von hier aus finden Sie zurück.",
  primary: { label: "Zur Startseite", href: "/" },
  secondary: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
};
