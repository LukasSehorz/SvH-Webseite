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
    title: "SVH Consulting | KI, Marketing und Webdesign für wachsende Betriebe",
    description:
      "SVH Consulting baut KI-Automatisierungen und Agenten, betreut Social-Media-Marketing samt Werbetafeln und entwickelt Webseiten, die messbar Anfragen bringen.",
  },
  ki: {
    title: "KI-Automatisierung und Agenten",
    description:
      "Vom Corporate LLM als Fundament bis zu Automatisierungen, Voice Agents und einem Operating System für Ihren Betrieb. Umgesetzt in Wochen statt Quartalen.",
  },
  marketing: {
    title: "Marketing mit Social Media, Werbetafeln und Webdesign",
    description:
      "Sichtbarkeit dort, wo Ihre Kunden wirklich sind. Social-Media-Betreuung, digitale Werbetafeln an frequenzstarken Standorten und Webseiten, die verkaufen.",
  },
  about: {
    title: "Über uns",
    description:
      "SVH Consulting ist eine kleine Agentur aus Zangberg. Sie sprechen direkt mit den Leuten, die Ihre Systeme bauen und Ihre Kanäle betreuen.",
  },
  contact: {
    title: "Kontakt",
    description:
      "Ein erstes Gespräch dauert zwanzig Minuten, kostet nichts und zeigt Ihnen, wo sich KI, Marketing und Webdesign bei Ihnen zuerst lohnen.",
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
          note: "Reichweite auf Instagram und TikTok",
        },
        {
          label: "Werbetafeln",
          href: "/marketing/werbetafeln",
          note: "Digitale Displays an belebten Orten",
        },
      ],
    },
    { label: "Über uns", href: "/ueber-uns" },
  ],
  contact: { label: "Kontakt", href: "/kontakt" },
  cta: { label: "Strategiegespräch", href: "/kontakt" },
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
        { label: "KI-Automatisierung und Agenten", href: "/ki" },
        { label: "Social Media Marketing", href: "/marketing" },
        { label: "Digitale Werbetafeln", href: "/marketing" },
        { label: "Webdesign", href: "/marketing" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { label: "Über uns", href: "/ueber-uns" },
        { label: "Kontakt", href: "/kontakt" },
        { label: "Referenzen", href: "/marketing#referenzen" },
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
  titleBefore: "Wir machen Ihren Betrieb",
  gradientWord: "digital.",
  titleAfter: "",
  lead: "Wir bauen KI, die Arbeit abnimmt, betreuen Ihr Marketing und entwickeln Webseiten, die Kunden bringen. So sparen Sie Kosten, gewinnen Zeit und wachsen.",
  primary: { label: "Kostenloses Strategiegespräch", href: "/kontakt" },
  secondary: { label: "Referenzen ansehen", href: "#referenzen" },
};

/* ------------------------------------------------------------------ */
/*  Landing · S1 Manifest                                              */
/* ------------------------------------------------------------------ */

export const manifesto = {
  label: "01 · Problem",
  title: "Mit KI schafft Ihr Team mehr.",
  paragraphs: [
    "Ein Team ohne KI kommt voran, aber langsam. Ein Team, das KI richtig nutzt, schafft in der gleichen Zeit deutlich mehr.",
    "Diesen Abstand schließen wir als Partner und setzen die Projekte gemeinsam mit Ihnen um.",
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

export const kiStack = {
  label: "02 · KI",
  title: "Eine Plattform für Ihren Betrieb.",
  intro:
    "Im Fundament liegt Ihr Firmenwissen, darüber arbeiten die Werkzeuge. Jeder Baustein lässt sich einzeln einführen und wächst mit Ihnen mit.",
  modules: [
    {
      id: "automation",
      title: "Automatisierungen",
      tags: ["CRM und Datenpflege", "Angebote und Rechnungen", "E-Mail-Strecken", "Übergaben im Team"],
    },
    {
      id: "agents",
      title: "Voice und Chat Agenten",
      tags: ["Telefon", "WhatsApp", "Webchat", "Terminbuchung"],
    },
    {
      id: "os",
      title: "Operating System",
      tags: ["Dashboards", "Wissensdatenbank", "Prozesse", "Reporting"],
    },
  ],
  foundation: {
    title: "Corporate LLM",
    subtitle: "KI-Wissensmanagement als Fundament",
    tags: [
      "Firmenwissen gebündelt",
      "Antworten mit Quelle",
      "Rechte und Rollen",
      "DSGVO-konform",
      "Anbindung an Ihre Systeme",
    ],
  },
  closing:
    "Wir beginnen mit dem Baustein, der Ihnen sofort Zeit zurückgibt, und erweitern von dort.",
  link: { label: "KI im Detail", href: "/ki" },
};

/* ------------------------------------------------------------------ */
/*  Landing · S3 Marketing (DNA-Stimmung)                              */
/* ------------------------------------------------------------------ */

export const marketingOrbs = {
  label: "03 · Marketing",
  titleBefore: "Sichtbar, wo Ihre Kunden",
  gradientWord: "wirklich",
  titleAfter: "sind.",
  intro:
    "Drei Wege, die zusammen wirken. Online über Ihre Kanäle, vor Ort über Werbetafeln und auf Ihrer eigenen Webseite, auf der aus Aufmerksamkeit eine Anfrage wird.",
  orbs: [
    {
      id: "social",
      title: "Social Media Marketing",
      body: "Strategie, Inhalte und Anzeigen aus einer Hand. Ihre Kanäle laufen regelmäßig weiter, auch wenn bei Ihnen Hochbetrieb herrscht.",
    },
    {
      id: "dooh",
      title: "Werbetafeln",
      body: "Digitale Flächen an frequenzstarken Standorten in Ihrer Region. Inhalte ändern wir aus der Ferne am selben Tag.",
    },
    {
      id: "web",
      title: "Webdesign",
      body: "Individuell entwickelte Seiten statt Baukasten. Schnell, für Google aufbereitet und direkt mit Ihren Abläufen verbunden.",
    },
  ],
  link: { label: "Marketing im Detail", href: "/marketing" },
};

/* ------------------------------------------------------------------ */
/*  Landing · S4 Showcase (Webdesign-Referenzen)                       */
/* ------------------------------------------------------------------ */

export const showcase = {
  label: "05 · Referenzen",
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
  label: "03 · Ablauf",
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
      a: "Der erste produktive Baustein steht in der Regel nach zwei bis sechs Wochen. Wir beginnen bewusst mit dem Ablauf, der Ihnen sofort am meisten Zeit zurückgibt, statt monatelang an einem großen Wurf zu bauen.",
    },
    {
      q: "Müssen wir unsere Programme wechseln?",
      a: "Meistens bleibt Ihre Werkzeuglandschaft bestehen und wir verbinden sie. Wo sich ein Wechsel wirklich rechnet, sagen wir es offen und begründen es nachvollziehbar.",
    },
    {
      q: "Wie gehen Sie mit Datenschutz um?",
      a: "Wir schließen einen Auftragsverarbeitungsvertrag, wählen wo möglich Anbieter mit Verarbeitung in der EU und dokumentieren, welche Daten wohin fließen. Ihr Wissen bleibt Ihr Eigentum.",
    },
    {
      q: "Was kostet die Zusammenarbeit?",
      a: "Nach der Bestandsaufnahme erhalten Sie ein Angebot mit festem Umfang, festem Preis und einem Zeitplan. Offene Abrechnungen nach Aufwand vermeiden wir bewusst.",
    },
    {
      q: "Sind wir danach von Ihnen abhängig?",
      a: "Alles, was wir bauen, wird dokumentiert und an Ihr Team übergeben. Viele Kunden bleiben trotzdem, weil sie wollen und nicht weil sie müssen.",
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
  lead: "In zwanzig Minuten wissen Sie, wo KI, Marketing und Webdesign bei Ihnen am meisten bewirken.",
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

  /* Die Reihenfolge gilt fuer die Kacheln im Kopf und fuer die Liste
     darunter. Beide zeigen dasselbe Zeichen, damit man den Bezug sofort
     sieht. `id` waehlt zugleich das Zeichen und die bewegte Szene. */
  services: {
    title: "Was wir automatisieren.",
    intro:
      "Acht Aufgaben, die in fast jedem Betrieb jeden Tag anfallen und ab sofort von allein laufen.",
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
        body: "Ihre Auswertung stellt sich selbst zusammen, statt am Monatsende gesammelt zu werden.",
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
/*  Unterseite /marketing                                              */
/* ------------------------------------------------------------------ */

/* Seit der Aufteilung in drei Unterseiten ist /marketing nur noch die
   Uebersicht. Die ausfuehrlichen Texte je Leistung stehen bei der
   jeweiligen Unterseite, hier steht zu jeder Leistung genau ein Satz. */
export const marketingPage = {
  hero: {
    titleBefore: "Drei Wege, damit man Sie",
    gradientWord: "sieht.",
    titleAfter: "",
    lead: "Eine eigene Webseite, Ihre Kanäle im Netz und digitale Werbetafeln in Ihrer Region. Jede Leistung wirkt für sich, und zusammen ergeben sie einen Auftritt, der zusammenpasst.",
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
    {
      id: "dooh",
      name: "Werbetafeln",
      body: "Digitale Displays an gut besuchten Orten in Ihrer Nähe, samt der Inhalte, die darauf laufen.",
      href: "/marketing/werbetafeln",
      cta: "Werbetafeln ansehen",
    },
  ],
  faqTitle: "Fragen zum Marketing.",
  faqIntro: "Die Punkte, die für alle drei Leistungen gelten.",
  faq: [
    {
      q: "Kann ich einzelne Leistungen buchen?",
      a: "Ja. Webseiten, Social Media und Werbetafeln funktionieren einzeln. Zusammen entfalten sie die größte Wirkung, weil überall dieselbe Handschrift sichtbar wird.",
    },
    {
      q: "Wer kümmert sich um die Inhalte?",
      a: "Das übernehmen wir. Wir fotografieren, filmen, schneiden und schreiben die Texte, und Sie geben vor der Veröffentlichung frei.",
    },
    {
      q: "Was kostet die Zusammenarbeit?",
      a: "Nach dem ersten Gespräch erhalten Sie ein Angebot mit festem Umfang, festem Preis und einem Zeitplan. Offene Abrechnungen nach Aufwand vermeiden wir bewusst.",
    },
    {
      q: "Wie schnell geht es los?",
      a: "Im Gespräch legen wir fest, womit wir anfangen. In der Regel beginnen wir innerhalb weniger Wochen mit dem Schritt, der bei Ihnen am meisten bewirkt.",
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
      "SVH Consulting baut Ihre Marke auf Instagram und TikTok auf. Redaktionsplan, Dreh im Betrieb, Schnitt, Kampagnen und ein Bericht jeden Monat.",
  },
  hero: {
    titleBefore: "Auf Instagram und TikTok werden Sie",
    gradientWord: "gesehen.",
    titleAfter: "",
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
    /** Steht im Zaehlerfeld, solange die Szene ruht. Eine feste Endzahl
        stuende dort als Versprechen, und versprochen ist hier nichts. */
    counterRest: "werden mehr",
    postCaption: "Ein neuer Beitrag ist online",
    replay: "Noch einmal ansehen",
    proof: "35+ umgesetzte Projekte",
  },
  scope: {
    title: "Was dazugehört.",
    items: [
      { id: "plan", label: "Redaktionsplan" },
      { id: "shoot", label: "Dreh vor Ort" },
      { id: "cut", label: "Schnitt und Texte" },
      { id: "ads", label: "Kampagnen" },
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
    lead: "Wir bringen Webseite, Social Media und KI in Ihrem Betrieb zusammen, damit mehr hereinkommt und weniger Zeit verloren geht.",
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
        body: "Sie sehen schon nach wenigen Wochen ein erstes laufendes Ergebnis statt erst nach einem halben Jahr.",
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
  facts: [
    { label: "Ansprechpartner", value: "Regional und direkt" },
    { label: "Antwort in der Regel binnen", value: "24 Stunden" },
    { label: "Erstgespräch", value: "Kostenlos" },
  ],
  form: {
    title: "Allgemeine Anfrage",
    body: "Schreiben Sie uns kurz, worum es geht. Je konkreter Ihre Nachricht, desto besser können wir uns vorbereiten.",
    fields: {
      name: "Ihr Name",
      company: "Unternehmen",
      email: "E-Mail-Adresse",
      phone: "Telefon (optional)",
      topic: "Worum geht es?",
      message: "Ihre Nachricht",
    },
    topics: [
      "KI-Automatisierung und Agenten",
      "Social Media Marketing",
      "Digitale Werbetafeln",
      "Webdesign",
      "Etwas anderes",
    ],
    consent:
      "Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden. Einzelheiten stehen in der Datenschutzerklärung.",
    submit: "Anfrage senden",
    success: "Danke, Ihre Anfrage ist angekommen. Wir melden uns in der Regel innerhalb von 24 Stunden.",
    selectPlaceholder: "Bitte wählen",
    errors: {
      name: "Bitte geben Sie Ihren Namen an.",
      email: "Bitte geben Sie Ihre E-Mail-Adresse an.",
      emailInvalid: "Diese E-Mail-Adresse sieht unvollständig aus.",
      message: "Bitte schreiben Sie uns kurz Ihr Anliegen.",
    },
    /** ❗TODO Versand anbinden. Aktuell nur Oberfläche ohne Empfänger. */
  },
  detailLabels: {
    phone: "Telefon",
    email: "E-Mail",
    address: "Anschrift",
    hours: "Erreichbarkeit",
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
  label: "02 · KI",
  title: "Eine neue Ebene in Ihrem Betrieb.",
  intro:
    "Zwischen Ihrem Team und Ihren Systemen entsteht eine neue Ebene. Sie kennt Ihren Betrieb, erledigt die tägliche Fleißarbeit und lernt dabei dazu.",
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
      body: "Im Kern liegt der Corporate LLM, ein lebendes Abbild Ihres Betriebs mit seinem Wissen und seinen Abläufen. Darauf arbeiten Agenten, die verstehen und ausführen.",
    },
    {
      tag: "Die autonome Ebene",
      title: "Systeme, die selbst handeln.",
      body: "Die meisten Werkzeuge geben nur Empfehlungen. Unsere Ebene erledigt die Arbeit selbst und wird dabei besser, während Ihr Team die Richtung vorgibt.",
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
      title: "SVH Agenten und Automatisierungen",
      body: "Übernehmen wiederkehrende Arbeit auf allen Kanälen.",
    },
    {
      id: "llm",
      role: "added",
      title: "Corporate LLM",
      body: "Ihr Firmenwissen als lebendes Modell Ihres Betriebs.",
    },
    {
      id: "systems",
      role: "given",
      title: "Ihre Systeme",
      body: "CRM, E-Mail, Kalender, Buchhaltung und alles darum herum.",
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
  title: "Was diese Ebene konkret erledigt",
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

/* Der Abschnitt traegt auszer den drei Ringen bewusst keine Zahl. Jede
   Aussage beschreibt, WAS die Leistung ist, WIE sie ablaeuft und WAS der
   Kunde davon hat. Keine nennt einen Preis, eine Laufzeit, einen Standort,
   eine Reichweite oder eine Zusage, denn nichts davon liegt uns belegt vor.
   ❗TODO Reichweiten, Kontaktzahlen, Klickpreise und Beispielergebnisse
   ergaenzen, sobald sie belegbar sind. Bis dahin bleibt der Abschnitt ohne
   Zahlen, statt geschaetzte einzusetzen. */
export const marketingDna = {
  label: "04 · Marketing",
  titleBefore: "Wir bauen Ihre",
  gradientWord: "Marketing-DNA.",
  titleAfter: "",
  intro:
    "Wir optimieren Ihre digitale Präsenz und Ihren Internetauftritt, sorgen für planbar mehr Anfragen über den digitalen Weg und bauen mit Ihnen eine Marke auf, die in Ihrer Region hängen bleibt.",
  /* Der zweite Absatz fuehrt die drei Straenge ein, bevor sie einzeln
     aufgeschlagen werden. Er gibt dem Leser das Bild, das die Sektion
     danach ausbuchstabiert. */
  introMore:
    "Dahinter stehen drei Stränge, die derselben Handschrift folgen. Ihre Webseite ist der Ort, an dem aus Interesse eine Anfrage wird, Social Media hält Sie zwischen zwei Aufträgen im Gespräch, und die digitalen Werbetafeln bringen Ihren Namen dorthin, wo Ihre Kundschaft ohnehin unterwegs ist.",
  /** Ringe zeichnen sich beim Eintritt in die Sektion. Werte vom Auftraggeber genannt. */
  rings: [
    { value: "35+", label: "Umgesetzte Projekte" },
    { value: "1", label: "Regionaler Ansprechpartner für alles" },
    { value: "3", label: "Bausteine einer Marketing-DNA" },
  ],
  strandsLabel: "Die drei Stränge",
  /* Jeder Strang traegt Kopf, EINEN Satz, sechs Marken, den Ablauf in drei
     Schritten und einen stillen Verweis auf seine Unterseite.
     DER ERKLAERENDE ABSATZ IST ENTFALLEN. Der Auftraggeber hat die Sektion
     dreimal als zu textlastig bezeichnet und zuletzt je Punkt zwei bis drei
     Woerter verlangt. Der Merksatz traegt jetzt die ganze Aussage des
     Stranges und ist dafuer neu geschrieben, also einfacher und ohne Bild.
     Die alten Absaetze sind nicht geparkt, sondern weg; was von ihnen
     gebraucht wird, steht auf den drei Unterseiten. */
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
        { icon: "form", text: "Anfragen ins System", lang: "Formulare, die Anfragen direkt in Ihre Systeme geben" },
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
      },
    },
    {
      n: "02",
      id: "social",
      title: "Social Media",
      kicker: "Ihre Kundschaft sieht Sie auch dann, wenn sie gerade nichts sucht.",
      pointsTitle: "Was dazugehört",
      points: [
        { icon: "calendar", text: "Fester Redaktionsplan", lang: "Redaktionsplan mit festen Veröffentlichungen" },
        { icon: "camera", text: "Produktion vor Ort", lang: "Foto- und Videoproduktion bei Ihnen vor Ort" },
        { icon: "scissors", text: "Schnitt und Texte", lang: "Schnitt, Texte und Veröffentlichung übernehmen wir" },
        { icon: "megaphone", text: "Meta, Instagram, TikTok", lang: "Kampagnen auf Meta, Instagram und TikTok" },
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
      szene: { zaehler: "Follower", kurve: "Reichweite" },
    },
    {
      n: "03",
      id: "dooh",
      title: "Werbetafeln",
      kicker: "Ihr Name steht dort, wo Ihre Kundschaft täglich vorbeigeht.",
      pointsTitle: "Was dazugehört",
      /* Der letzte Punkt ist eine Luecke und keine Aussage.
         ❗TODO Buchbare Standorte, moegliche Zeitraeume und Preisrahmen
         ergaenzen. Solange die Angaben fehlen, bleibt die Zeile so stehen,
         denn jede Zahl an dieser Stelle waere erfunden. Dieselbe Luecke ist
         auf der Unterseite /marketing bereits vermerkt. */
      points: [
        { icon: "pin", text: "Standorte in der Region", lang: "Digitale Flächen an frequenzstarken Standorten Ihrer Region" },
        { icon: "palette", text: "Motive in Ihrem Stil", lang: "Gestaltung der Motive im Stil Ihrer Marke" },
        { icon: "remote", text: "Aus der Ferne bespielt", lang: "Inhalte werden aus der Ferne bespielt" },
        { icon: "clock", text: "Kurzfristig änderbar", lang: "Aktionen, Öffnungszeiten und offene Stellen kurzfristig anpassbar" },
        { icon: "link", text: "Verzahnt mit online", lang: "Abstimmung mit Ihren Kampagnen im Netz" },
        { icon: "todo", text: "❗TODO Standorte und Preise", lang: "❗TODO Verfügbare Standorte, Buchungszeiträume und Preisrahmen ergänzen" },
      ],
      stepsTitle: "So läuft es ab",
      steps: [
        {
          n: "01",
          title: "Standorte wählen",
          body: "Wir suchen die Flächen nach den Wegen Ihrer Kundschaft aus.",
        },
        {
          n: "02",
          title: "Motive gestalten",
          body: "Die Motive lesen sich im Vorbeigehen in wenigen Sekunden.",
        },
        {
          n: "03",
          title: "Bespielen und wechseln",
          body: "Inhalte ändern wir aus der Ferne, meist noch am selben Tag.",
        },
      ],
      note: "Von Ihnen brauchen wir Ihr Einzugsgebiet und die Aktionen, die Sie in den kommenden Monaten bewerben wollen.",
      link: { label: "Mehr zu Werbetafeln", href: "/marketing/werbetafeln" },
      /* Die Stele traegt bewusst keine Beschriftung. Die drei Aufnahmen
         zeigen echte Displays im Ladenlokal, und ein aufgesetztes Wort
         auf dem Gehaeuse laese sich als Platzhalter. */
      szene: {},
    },
  ],
  closingLabel: "Zusammenspiel",
  closing:
    "Erst zusammen ergeben die drei Stränge eine DNA. Wer Sie auf einer Tafel gesehen hat, erkennt Sie im Netz wieder, und wer Ihnen dort folgt, landet auf einer Seite, die dieselbe Sprache spricht. Deshalb betreuen wir alle drei aus einer Hand und stimmen jede Veröffentlichung auf die anderen beiden ab.",
  link: { label: "Marketing im Detail", href: "/marketing" },
};

/* ------------------------------------------------------------------ */
/*  /marketing v2 · Kugel-Bühne im Stil der DNA-Unterseite             */
/* ------------------------------------------------------------------ */

export const marketingSphere = {
  title: "Unsere DNA ist Sichtbarkeit.",
  body: "Aus Webseite, Social Media und Werbetafeln entsteht ein Auftritt, der zusammenpasst und zusammen wirkt. Jede Leistung funktioniert einzeln und entfaltet im Verbund die größte Kraft.",
};

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
        body: "Webseiten haben wir für Betriebe schon gebaut und betreuen sie bis heute weiter.",
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
        body: "Immer mehr Leute fragen eine KI. Ihre Seite ist so gebaut, dass die KI sie versteht und Sie nennt.",
        points: ["Saubere Struktur", "Klare Antworten", "Als Quelle genannt"],
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

  /* Die vier gezeichneten Spots. Sie laufen auf dem Schirm der Tafel und
     zeigen, was SVH herstellt. Kein Wort davon nennt einen echten Betrieb,
     einen Preis oder einen Zeitraum. */
  spots: [
    {
      id: "gym",
      word: "Probetraining",
      line: "Neu im Kursplan",
      foot: "Komm vorbei",
      alt: "Gezeichneter Spot für ein Gym mit dem Wort Probetraining",
    },
    {
      id: "restaurant",
      word: "Tageskarte",
      line: "Frisch gekocht",
      foot: "Guten Appetit",
      alt: "Gezeichneter Spot für ein Restaurant mit dem Wort Tageskarte",
    },
    {
      id: "event",
      word: "Straßenfest",
      line: "Für die ganze Familie",
      foot: "Alle sind da",
      alt: "Gezeichneter Spot für ein Fest mit dem Wort Straßenfest",
    },
    {
      id: "club",
      word: "Livemusik",
      line: "Bei uns auf der Bühne",
      foot: "Bühne frei",
      alt: "Gezeichneter Spot für einen Club mit dem Wort Livemusik",
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
    steleLabel: "Digitale Werbetafel in Personengröße, auf ihrem Schirm wechseln die Spots",
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

  /* S3 Wo die Tafeln stehen. Ortsarten statt Adressen. */
  orte: {
    titleBefore: "Dort stehen die",
    titleWord: "Tafeln",
    lead: "Vier Arten von Orten, an denen Leute warten, sich unterhalten und zwischendurch aufschauen.",
    cards: [
      {
        id: "gym",
        wort: "Gym",
        text: "Zwischen zwei Sätzen schaut jeder kurz auf, und genau dann läuft Ihr Spot.",
        bild: "/stock/dooh-1.webp",
        alt: "Leuchtender Werbebildschirm in einer Einkaufspassage bei Nacht",
      },
      {
        id: "restaurant",
        wort: "Restaurant",
        text: "Beim Warten auf das Essen bleibt der Blick an der Tafel hängen.",
        bild: "/stock/dooh-2.webp",
        alt: "Digitale Menütafeln über der Theke eines Cafés",
      },
      {
        id: "club",
        wort: "Club",
        text: "Am Eingang und an der Bar stehen die Leute dicht beieinander und haben Zeit.",
        bild: "/stock/dooh-3.webp",
        alt: "Zwei digitale Werbebildschirme im Eingang eines Imbiss, von der Straße aus gesehen",
      },
      {
        id: "event",
        wort: "Event",
        text: "Wo viele zusammenkommen, sieht Ihre Tafel jeder, der vorbeigeht.",
        bild: null,
        alt: null,
      },
    ],
    link: { label: "Sagen Sie uns, welcher Ort zu Ihnen passt", href: "/kontakt" },
  },

  /* Das ziehbare Band zwischen S3 und S4. Die Ortsworte sind Kategorien
     und keine Adressen. Kein Betriebsname steht auf einer Kachel. */
  band: {
    srTitle: "Beispiele für Tafeln an verschiedenen Orten",
    hinweis: "Ziehen Sie das Band zur Seite.",
    items: [
      {
        spot: "gym",
        bild: null,
        alt: null,
        ort: "Gym",
        text: "Der Kursplan steht neben dem Eingang.",
      },
      {
        spot: null,
        bild: "/stock/dooh-2.webp",
        alt: "Digitale Menütafeln über der Theke eines Cafés",
        ort: "Restaurant",
        text: "Die Karte des Tages läuft über der Theke.",
      },
      {
        spot: "club",
        bild: null,
        alt: null,
        ort: "Club",
        text: "An der Bar sieht jeder, wer heute auf der Bühne steht.",
      },
      {
        spot: null,
        bild: "/stock/dooh-1.webp",
        alt: "Leuchtender Werbebildschirm in einer Einkaufspassage bei Nacht",
        ort: "Event",
        text: "Am Eingang leuchtet, worum es hier geht.",
      },
      {
        spot: null,
        bild: "/stock/dooh-3.webp",
        alt: "Zwei digitale Werbebildschirme im Eingang eines Imbiss, von der Straße aus gesehen",
        ort: "Restaurant",
        text: "Von der Straße aus sieht man schon die Karte.",
      },
      {
        spot: "event",
        bild: null,
        alt: null,
        ort: "Event",
        text: "Vor dem Zelt läuft, was gleich beginnt.",
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
