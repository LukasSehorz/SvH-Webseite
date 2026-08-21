# SVH Consulting — Website Nachbau von apex-consulting.ai/de

**Ziel:** Die Referenzseite https://apex-consulting.ai/de/ 1:1 nachbauen (Layout, Typografie,
Farben, Spacing, Scroll-/Hover-Animationen), aber unter der Marke **SVH Consulting** und mit
einer geänderten Dienstleistungs-Struktur (3 Säulen).

Referenz-Screenshots (Desktop 1440×900, Mobile 390×844):
`C:\Users\lukas\AppData\Local\Temp\claude\c--Users-lukas-OneDrive-Desktop-KI-Agentur-Webseite-Webseite-neu\383579b9-b888-4468-8f13-17178e3e3279\scratchpad\ref\*.png`
und `...\scratchpad\ref-mobile\*.png` — Dateiname `NN_y<scrollY>.png`.
Voller Referenz-Text: `...\scratchpad\apex_inner.txt`

---

## 1. Tech-Stack (bereits aufgesetzt, NICHT ändern)

- Next.js 16.2.7 (App Router), React 19.2.4, TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`, Config in `app/globals.css` mit `@theme`)
- framer-motion 12 für Scroll-/Hover-Animationen
- Dev-Server: `npm run dev` → http://localhost:3100
- Keine weiteren Dependencies installieren.

---

## 2. Design-Tokens (exakt aus der Referenz gemessen)

### Farben
| Token | Hex | Verwendung |
|---|---|---|
| `--ink` | `#001A23` | Überschriften, dunkler Text |
| `--ink-deep` | `#0A1015` | Buttons dunkel, Footer-Akzente |
| `--muted` | `#4B585D` | Fließtext, sekundär |
| `--brand` | `#0092D4` | Primär-Cyan (Zahlen, Links, Akzente) |
| `--brand-bright` | `#00BCFF` | helles Cyan (Glows, Gradienten) |
| `--brand-deep` | `#0074AB` | dunkleres Cyan (Labels) |
| `--tint-1` | `#B6EAFF` | helle Fläche |
| `--tint-2` | `#DEF4FF` | sehr helle Fläche |
| `--tint-3` | `#EFFAFF` | Sektions-Hintergrund |
| `--paper` | `#FCFEFF` | Seiten-Hintergrund |
| `--white` | `#FFFFFF` | Karten |

Wichtige Gradienten:
- Blaue Sektionsflächen: `linear-gradient(180deg, #00A6E8 0%, #0092D4 55%, #7ED4F5 100%)`
  (siehe `02_y1800.png`, `05_y4500.png`) — abgerundet `border-radius: 40px`, Inhalt-Breite 1280.
- Dunkler Primär-Button: `linear-gradient(160deg,#0A1015 0%,#001A23 45%,#0B3A4E 100%)`
  mit innerem Glow oben und `box-shadow: 0 10px 30px -12px rgba(0,146,212,.55)`.
- Heller Sekundär-Button: `linear-gradient(180deg,#FFFFFF 0%,#DEF4FF 100%)`, Rand `#B6EAFF`.
- CTA-Sektion unten: heller Cyan-Verlauf mit geometrischem Diamant-Muster.

### Typografie
- **Display-Serif** (ersetzt „Gestura Headline" der Referenz): **Newsreader** (Google Fonts),
  Gewichte 400/500/600, `font-optical-sizing: auto`.
  → h1 Hero: `70px / 1.25 / -0.04em`, weight 500
  → h1 auf blauen Sektionen: `87px / 1.25 / -0.04em`, weight 600
  → h2 Sektionen: `54px / 1.0 / -0.02em`, weight 400
  → Karten-Titel: `28–32px / 1.15`, weight 400
  → Riesen-Zahlen (65 / 25h): `120–172px`, weight 500
- **Sans**: **Inter** (Google Fonts, variable), Gewichte 400/500/600/700
  → Fließtext: `16px / 1.5`, Farbe `--muted`
  → Hero-Subline: `20px / 1.55`
  → Eyebrow-Labels: `16px / 1.1`, weight 700, `text-transform: uppercase`
  → Nav-Links: `16px`, weight 400/500
  → Buttons: `16px`, weight 600

Beide via `next/font/google` laden (`Newsreader`, `Inter`), als CSS-Variablen
`--font-serif` / `--font-sans` an `<html>` hängen.

### Layout
- Content-Container: `max-width: 1280px`, `padding-inline: 24px`, zentriert.
- Sektions-Abstand vertikal: `120px` desktop / `72px` mobile.
- Karten-Radius: `20px` (klein), `28px` (Karten), `40px` (große Sektionsflächen).
- Karten-Schatten: `0 1px 2px rgba(0,26,35,.04), 0 12px 32px -16px rgba(0,26,35,.12)`.
- Breakpoints: `<768px` mobile, `768–1023` tablet, `≥1024` desktop.

---

## 3. Animationen (wichtig — die Referenz lebt davon)

Alle mit framer-motion. Grundregeln:

1. **Scroll-Reveal** für jede Sektion: `initial={{opacity:0, y:28}}`,
   `whileInView={{opacity:1, y:0}}`, `viewport={{once:true, amount:0.25}}`,
   `transition={{duration:.7, ease:[0.22,1,0.36,1]}}`. Karten-Gruppen mit
   `staggerChildren: 0.08`.
2. **Hero-Chips** (rechts, die Pill-Labels wie „Business Automatisierung"): schweben
   dauerhaft leicht (`y: [0,-8,0]`, 5–8s, `repeat: Infinity`, versetzte Delays),
   erscheinen beim Load nacheinander mit Scale-In.
3. **Hero-Hintergrund**: geometrische Cyan-Formen, langsam pulsierender Glow
   (`opacity/scale` Loop 8–12s) + leichter Parallax bei Scroll (`useScroll` + `useTransform`,
   max. 60px Verschiebung).
4. **Marquee** (Buzzword-Laufband „KI WhatsApp-Customer Support · Chat & Voice AI · …"):
   zwei Reihen, gegenläufig, endlos, `duration: 40s` linear, Pause bei Hover.
   Randbereiche mit Mask-Fade.
5. **Zähler-Animation**: Zahlen (65 %, 25 h, 8+, 1.000.000+, …) zählen beim Sichtbarwerden
   von 0 hoch (`useMotionValue` + `animate`, 1.6s, ease-out).
6. **Karten-Hover**: `translateY(-6px)`, Schatten verstärken, Rand → `--tint-1`,
   Transition `280ms cubic-bezier(.22,1,.36,1)`. Innere Mockups reagieren zusätzlich
   (z.B. Zeilen leuchten auf, Icons rotieren leicht).
7. **Button-Hover**: dunkler Button → Glow verstärkt + `scale(1.02)`;
   heller Button → Rand cyan, leichte Aufhellung.
8. **Sticky-Navbar**: transparent oben; ab `scrollY > 24` weißer, unscharfer
   (`backdrop-blur(18px)`) Balken mit Schatten, animiert über 240ms.
   Bei Scroll nach unten NICHT ausblenden (Referenz blendet nicht aus).
9. **FAQ-Accordion**: Höhe animiert (`height: auto` via framer-motion), Plus-Icon
   rotiert 45° zu ×, 320ms.
10. **Testimonial-Slider**: horizontal, Pfeil-Buttons links/rechts oben, Slide-Transition
    mit Spring (`stiffness: 220, damping: 30`), Drag auf Touch.
11. **Prozess-Schritte 1/2/3**: beim Scrollen erscheinen die Karten versetzt,
    die Nummer-Badges skalieren mit leichtem Overshoot (`spring`).
12. **ROI-Rechner-Slider**: Werte live, Ergebnis-Zahl animiert (Tween 300ms) beim Ändern.
13. `prefers-reduced-motion: reduce` respektieren → alle Loops/Parallax abschalten,
    Reveals auf simples Fade reduzieren.

---

## 4. Seitenstruktur (Reihenfolge exakt wie Referenz)

Jede Sektion = eine Datei in `app/components/`. Texte kommen aus `app/content.ts`.

| # | Komponente | Referenz-Screenshot | Inhalt |
|---|---|---|---|
| 0 | `Navbar.tsx` | 00 | Logo links, Links mittig, Sprach-Umschalter, dunkler CTA-Button rechts. Mobile: Burger → Full-Screen-Overlay |
| 1 | `Hero.tsx` | 00 | Eyebrow, Serif-H1 (2. Zeile in `--brand`), Subline, 2 Buttons, „Marktführende…"-Zeile + Partner-Logos, rechts geometrische Grafik mit schwebenden Chips |
| 2 | `Marquee.tsx` | 00 | 2 gegenläufige Laufbänder mit Leistungs-Pills |
| 3 | `IntroStatement.tsx` | 01 | Ein großer, zentrierter grauer Absatz (32px), Wörter werden beim Scrollen von grau zu `--ink` eingefärbt (Wort-für-Wort-Reveal) |
| 4 | `PressLogos.tsx` | 01 | „Bekannt aus" + Logo-Reihe (Graustufen, Hover → Farbe) |
| 5 | `ImpactSection.tsx` | 02 | Blaue Gradient-Fläche, riesige Serif-H1 weiß, 3 weiße Karten mit Zählern (65 %, 25 h, „Nachhaltiges Wachstum") |
| 6 | `ShowcaseVideo.tsx` | 03 | Breites 16:9-Media-Panel mit Play-Overlay, Radius 28px |
| 7 | `ServicesSection.tsx` | 04 | **UMGEBAUT — siehe §5** |
| 8 | `ProcessSection.tsx` | 05, 06 | Blaue Gradient-Fläche, „Digitalisieren in 3 einfachen Schritten", 3 Karten mit Nummern-Badges + animierten Mockups |
| 9 | `ProblemsSection.tsx` | 06, 07 | Links Serif-H2 „Häufige Probleme / Vor SVH", rechts 2-spaltiges Raster mit 5 Problem-Blöcken (Icon + Titel + Text) |
| 10 | `RoiCalculator.tsx` | 07, 08 | Eyebrow „DEIN KI-RENDITE-RECHNER", zentrierte Serif-H2, graue Box mit 3 Slidern + Ergebnistext + dunklem CTA-Button. **Deutsch beschriften** |
| 11 | `OfferingsSection.tsx` | 08, 09 | 3 Karten im Bogen um eine zentrale Grafik, verbunden durch gebogene Linien, Titel „Unsere Haupt-Angebote", darunter zentrierter dunkler Button |
| 12 | `Testimonials.tsx` | 09, 10 | „Erfolgsgeschichten von Kunden", großer Slider (Logo + Zitat + Person + Media) + 3 kleine Zitat-Karten darunter |
| 13 | `StatsBanner.tsx` | 12 | Blaue Gradient-Fläche, 4 Serif-Zahlen mit Labels, darunter Satz + heller CTA-Button |
| 14 | `AudienceSection.tsx` | 12, 13 | Cyan-Fläche mit Lichtstrahlen-Hintergrund, „Mit wem wir zusammenarbeiten", Absatz, 3 weiße Karten (versetzt in der Höhe) mit Icon + Titel + „Kontakt aufnehmen ↗" |
| 15 | `ResourcesSection.tsx` | 14 | „Hervorgehobene Ressourcen": 1 großes Feature-Panel (blau) + 3 Karten mit Bild, Badge, Serif-Titel |
| 16 | `NewsletterSection.tsx` | 15 | Cyan-Panel, Serif-H2 links, Text, E-Mail-Feld + runder Senden-Button, rechts Buch-Mockup |
| 17 | `FaqSection.tsx` | 15, 16 | Sehr helle Fläche, links Serif-H2 + Button, rechts Text; darunter 2-spaltiges Accordion-Raster |
| 18 | `FinalCta.tsx` | 17 | Große Cyan-Fläche mit Diamant-Muster, zentrierte Serif-H2 (2-farbig), Absatz, dunkler Button |
| 19 | `SiteFooter.tsx` | 18 | Logo + Beschreibung + Newsletter-Feld links; 3 Link-Spalten rechts; Trennlinie in `--brand`; Claim + Rechts-Links unten |

Zusätzlich: `app/impressum/page.tsx`, `app/datenschutz/page.tsx`, `app/agb/page.tsx`
(einfache Rechtsseiten, gleicher Header/Footer, Serif-H1, gut lesbarer Fließtext).

---

## 5. Dienstleistungen — die EINE strukturelle Änderung

Statt der 5 Bento-Karten der Referenz gibt es **genau drei Säulen, vertikal untereinander**:

1. **KI-Automatisierung & Agenten**
2. **Marketing**
3. **Webseiten**

Layout je Säule: volle Container-Breite, weiße Karte (Radius 28px), zweispaltig —
auf einer Seite ein **animiertes UI-Mockup** (wie in der Referenz: kleine Fensterchen,
Chips, Icons, Codezeilen in Cyan/Weiß auf hellem Cyan-Verlauf), auf der anderen Seite
Serif-Titel + `--muted`-Fließtext + eine Liste von 3–4 Leistungspunkten mit Häkchen-Icon.
Seiten alternieren (Säule 1: Mockup rechts, Säule 2: Mockup links, Säule 3: Mockup rechts).
Sektions-Kopf darüber wie Referenz: Serif-H2 + grauer Untertitel, zentriert.

Dieselben drei Säulen erscheinen auch in `OfferingsSection` (Sektion 11) als die 3 Karten
und in Navigation + Footer.

**Inhalte** (in `app/content.ts` pflegen):

### Säule 1 — KI-Automatisierung & Agenten (Inhalt aus der Referenz übernommen)
> Titel: `KI-Automatisierung & Agenten`
> Text: „Wir erstellen Workflows, die wirklich funktionieren – wir richten CRM-, Marketing-
> und Verkaufssysteme ein, bereinigen und verbinden sie zu einem reibungslosen,
> automatisierten System. Dazu bauen wir KI-Agenten, die Kundensupport, Marketing und
> Vertrieb wie ein Teammitglied übernehmen."
> Punkte:
> - Maßgeschneiderte Automationen, die Ihre Tools verbinden
> - KI-Agenten für Support, Vertrieb und Backoffice — rund um die Uhr
> - CRM-Einrichtung, Datenbereinigung und saubere Schnittstellen
> - Wissensdatenbank & digitale Prozesse statt Wissen im Kopf
> Mockup: Workflow-Karten („Kostenmanagement", „Zahlungserinnerung", „Mitarbeiter-
> verfolgung") die nacheinander abgehakt werden + rotierende Tool-Icons.

### Säule 2 — Marketing (eigener Inhalt)
> Titel: `Marketing`
> Text: „Wir machen Unternehmen dort sichtbar, wo ihre Kunden wirklich sind: auf Social
> Media und direkt vor Ort. Wir übernehmen Content, Redaktionsplan und Anzeigen — und
> stellen für lokale Betriebe digitale Werbe-Displays an frequenzstarken Standorten auf."
> Punkte:
> - Social-Media-Betreuung: Strategie, Content-Produktion und Redaktionsplan
> - Performance-Kampagnen auf Meta, Instagram und TikTok
> - Digitale Werbe-Displays für lokale Betriebe an frequenzstarken Standorten
> - Monatliches Reporting mit klaren Zahlen statt Bauchgefühl
> Mockup: Handy-Rahmen mit Social-Feed-Karten die durchlaufen, daneben ein
> Werbe-Display-Ständer, auf dem Anzeigen wechseln (Crossfade alle 2.5s).

### Säule 3 — Webseiten (eigener Inhalt)
> Titel: `Webseiten`
> Text: „Wir bauen Webseiten, die nicht nur gut aussehen, sondern Anfragen bringen.
> Individuell entwickelt statt Baukasten, schnell, für Suchmaschinen aufbereitet und
> von Anfang an mit Ihren Automatisierungen verbunden."
> Punkte:
> - Individuelles Design und Entwicklung — kein Template-Baukasten
> - Technisch schnell, mobil optimiert und für Google aufbereitet
> - Anfrageformulare, die direkt in Ihr CRM und Ihre Automationen laufen
> - Pflege, Hosting und Weiterentwicklung aus einer Hand
> Mockup: Browser-Fenster, in dem sich eine Seite aufbaut (Skeleton → Inhalt),
> daneben ein Lighthouse-artiger Score-Ring der auf 98 hochzählt.

---

## 6. Marke: SVH Consulting

- Firmenname überall: **SVH Consulting** (nie „APEX", nie „Flowstate").
- Logo: `app/components/Logo.tsx` — Inline-SVG-Wortmarke „SVH" in `--ink`, links davor
  eine geometrische Marke aus drei aufsteigenden Balken/Winkeln in `--brand`.
  Zwei Varianten: `dark` (für hellen Grund) und `light` (für blauen Grund).
- Claim im Footer: „SVH Consulting. Wachstum, das planbar ist."
- Kontaktdaten (aus dem Impressum, unverändert übernehmen):
  Sehorz Lukas, vom Hofe Jannik GbR · Am Anger 3 · 84539 Zangberg · Deutschland
  Telefon 0172 3465896 · Erreichbarkeit Mo–So 8:00–21:00 Uhr
  E-Mail: **kontakt@svh-consulting.de** (Platzhalter, siehe `content.ts`)

## 7. Inhalte, die NICHT erfunden werden dürfen

Referenz-Testimonials, Kundenlogos, Presselogos und Kennzahlen gehören APEX und sind
für SVH nicht belegt. Daher:

- Alle Kundenstimmen, Namen, Firmen, Logos und Kennzahlen kommen aus `app/content.ts`
  und sind dort mit `// TODO: echte Daten eintragen` markiert.
- Als Platzhalter neutrale Werte verwenden (z.B. „Kundenname", „Branche", generische
  Zitat-Blindtexte, Kennzahlen als `—`). Layout und Animation bleiben voll funktionsfähig.
- Presselogos-Sektion: statt erfundener Presse „Womit wir arbeiten" mit echten
  Tool-Wortmarken (n8n, Make, OpenAI, HubSpot, Meta, Google) als schlichte SVG-Textmarken.

## 8. Bilder

Liegen unter `public/img/`. Namen und Zweck stehen in `_ref/ASSETS.md`.
Nur diese Dateien verwenden, keine externen URLs, keine Fremd-Logos einbetten.

## 9. Qualitätskriterien

- `npm run build` läuft ohne Fehler und ohne TypeScript-Fehler.
- Keine horizontalen Scrollbalken bei 390 / 768 / 1024 / 1440 / 1920 px.
- Alle Sektionen in derselben Reihenfolge und mit derselben visuellen Gewichtung wie
  die Referenz-Screenshots.
- Semantisches HTML (`header`/`nav`/`main`/`section`/`footer`), `alt`-Texte, Buttons als
  `<button>`, Links als `<a>`, Accordion mit `aria-expanded`.
- Fokus-Ringe sichtbar (`outline: 2px solid var(--brand)`).
