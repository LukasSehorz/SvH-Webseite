# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inhaber und Entscheider kleiner und mittlerer Betriebe, ueberwiegend regional. Sie kommen ueber Empfehlung, Social Media oder eine Werbetafel auf die Seite und wollen in wenigen Sekunden verstehen, was SVH Consulting fuer sie tut. Sie sind keine Techniker. Massstab des Auftraggebers, woertlich: die Seite soll so verstaendlich sein, dass auch ein Kind begreift, worum es geht.

## Product Purpose

SVH Consulting digitalisiert Betriebe. Drei Leistungssaeulen: KI-Automatisierung und Agenten, Marketing (Webseiten, Social Media, digitale Werbetafeln) und Webentwicklung. Ziel je Kunde: Prozesse automatisieren, Kosten senken, Umsatz steigern. Erfolg der Seite: der Besucher versteht das Angebot sofort und bucht ein kostenloses Strategiegespraech.

## Positioning

Transformationspartner fuer das digitale und das KI-Zeitalter, nicht eine Agentur fuer eine einzelne Leistung. Von Social Media ueber Webseite bis KI aus einer Hand, damit der ganze digitale Auftritt eines Betriebs zusammenpasst. Der Auftraggeber nennt als Werte: Qualitaet, schnelle Arbeit, Zuverlaessigkeit.

## Operating Context

- Ein Erstgespraech dauert rund zwanzig Minuten, kostet nichts und ist die Handlung, auf die jede Seite hinfuehrt.
- KI-Ablauf in drei Schritten: kostenlose Potenzialanalyse, die drei groessten Hebel identifizieren, gemeinsam im Projekt umsetzen. Die Schritte bauen aufeinander auf und laufen nicht gleichzeitig.
- Werbetafeln: SVH stellt moderne digitale Displays an gut besuchten lokalen Orten auf (Gyms, Restaurants, Clubs, Events). Betriebe lassen sich dort eintragen und werden angezeigt. SVH erstellt auch die Inhalte (Video, Bild, Text) und schneidet sie fuer die Tafel zusammen.
- Social Media: Fokus auf Instagram und TikTok. Markenaufbau, hohe Aufrufzahlen, Sichtbarkeit.
- Webseiten: modernes Design, mobil optimiert, schnell, fuer Google und fuer KI-Suchmaschinen optimiert, darauf ausgerichtet, Besucher in zahlende Kunden zu wandeln.

## Capabilities and Constraints

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, three.js, GSAP mit ScrollTrigger, Lenis, framer-motion. Alle sichtbaren Texte in `app/copy.ts`.
- Seitenstruktur, vom Auftraggeber festgelegt: KI ist eine einzelne Seite ohne Unterseiten. Marketing bekommt drei Unterseiten (Webseiten, Social Media, Werbetafeln). Dazu Ueber uns, Kontakt, Rechtliches.
- Sprache: Deutsch. Sichtbarer Text und Kommentare: keine Doppelpunkt-Konstruktionen, keine Bindestrich-Einschuebe, keine abgehackten Kurzsaetze mit Verneinungen. Kommentare ohne Umlaute.
- Alles mit `❗TODO` in copy.ts ist eine bewusste Luecke und darf nicht mit erfundenen Angaben gefuellt werden.
- Bestaetigt am 31.08.2026: 35+ umgesetzte Projekte ist die richtige Zahl.
- Entscheidung vom 03.09.2026: Anfragen aus dem Kontaktformular gehen an lukas.sehorz@svhconsult.de (app/content.ts, beim Hoster ueber ANFRAGE_EMPFAENGER uebersteuerbar; die zuerst genannte Domain schconsult.de hat keinen Mailserver). Der Versand laeuft ueber app/api/anfrage mit Resend als "SVH Consulting <resend@svhconsult.de>", der Schluessel RESEND_API_KEY liegt nur beim Hoster oder lokal in .env.local (Vorlage .env.example). Ohne Schluessel oeffnet das Formular das E-Mail-Programm des Besuchers mit der fertigen Nachricht.
- Offen (vom Auftraggeber zu liefern): Kurzprofile der beiden Gruender; Resend-Konto und geprüfte Absenderdomain fuer den Versand; Standorte, Buchungszeitraeume und Preise der Werbetafeln; Reichweiten und Kennzahlen. Entscheidung fuer den Livegang: diese Stellen werden so gebaut, dass sie ohne die Angaben sauber wirken, und die Luecken bleiben in copy.ts markiert. Kein sichtbarer Platzhalter auf der Seite.
- Navigation, entschieden: Marketing oeffnet ein Aufklappmenue mit Webseiten, Social Media und Werbetafeln (Routen /marketing/webseiten, /marketing/social-media, /marketing/werbetafeln). KI, Ueber uns und Kontakt sind direkte Links.
- Entscheidung vom 03.09.2026: Werbetafeln werden vorerst nicht angeboten. Die Seite /marketing/werbetafeln bleibt gebaut und erreichbar, ist aber aus Aufklappmenue, Fusszeile, Marketing-Uebersicht, Startseite (dritter Strang der Marketing-Sektion) und Sitemap genommen und traegt noindex. Sobald die Tafeln zurueckkommen, sind genau diese fuenf Stellen wieder einzuhaengen; die Texte dazu liegen weiter unter werbetafelnPage in copy.ts.
- Entscheidung vom 03.09.2026: Der Slogan der Startseite lautet "Wir bringen Ihren Betrieb ins KI-Zeitalter." Die Fassung "Wir machen Ihren Betrieb digital." war dem Auftraggeber zu allgemein.
- Entscheidung vom 03.09.2026: Auf /ki steht als zweite Sektion der Aufbau aus dem Fundament Corporate LLM und den drei Ebenen Automatisierungen, Voice Agents und Operating System, so wie der Auftraggeber ihn zurueckverlangt hat. Die vier Namen sind gesetzt, jede Ebene traegt dazu eine Zeile in einfacher Sprache.

## Brand Commitments

- Name: SVH Consulting. Gruender: Lukas Sehorz und Jannik vom Hofe. Sitz Zangberg.
- Bestehende Bildwelt, vom Auftraggeber abgenommen: dunkler Grund `#050507`, Akzent blau bis blauviolett (`#5b8cff`, `#7c6aff`, `#b9a5ff`), Inter und Inter Tight, Verlaufswort in Ueberschriften. Die DNA-Partikelstruktur hinter der Marketing-Sektion ist in Muster und Bewegung abgenommen und bleibt.
- Fuer die Unterseiten: Social Media uebernimmt die bestehende Kugel-Welt. Webseiten und Werbetafeln bekommen je eine eigene, neue Designwelt, hergeleitet aus Referenzseiten auf Awwwards-Niveau, angepasst an die Palette.
- Der Anspruch des Auftraggebers: die Seite selbst muss die Qualitaet belegen, fuer die SVH steht. Kein Fehler.

## Evidence on Hand

- Webseiten-Referenzen, echt und freigegeben: brandhuber.gmbh, world-of-less.de, taxi-izi.de, innnatur-heilpraktiker.de. Deren Hero-Sektionen werden gezeigt und verlinkt.
- Aeltere Portfolio-Bilder unter `public/portfolio/`.
- Stockfotos kleiner digitaler Displays unter `public/stock/dooh-1.webp` bis `dooh-3.webp`, Herkunft in `public/stock/HERKUNFT.md`.
- Keine Testimonials, keine Fallstudien mit Zahlen, keine belegten Kennzahlen. Nichts davon erfinden.

## Product Principles

1. Verstaendlichkeit vor Vollstaendigkeit. Lieber kuerzen als erklaeren.
2. Zeigen statt behaupten. Jede Leistung wird durch ein bewegtes, interaktives Schaustueck sichtbar gemacht.
3. Eine Handschrift ueber alle Seiten, aber jede Leistung mit eigenem Gesicht.
4. Der Weg zum Strategiegespraech ist auf jeder Seite kurz und sichtbar.
5. Was wir nicht belegen koennen, steht nicht auf der Seite.
