# SVH Consulting — Dark Redesign · Bau-Spezifikation

Diese Datei ist die einzige Wahrheit für alle Bau- und Prüf-Agenten.
Referenz-Screenshots liegen unter
`C:\Users\lukas\AppData\Local\Temp\claude\c--Users-lukas-OneDrive-Desktop-KI-Agentur-Webseite-Webseite-neu\383579b9-b888-4468-8f13-17178e3e3279\scratchpad\ref2\`
in den Ordnern `valo/`, `antimetal/`, `ada/`, `dna/`, `dna-ourdna/`, `refero/`.

## 0 · Frame-Archiv der Referenz-Animationen (PFLICHT vor jedem Animationsbau)

Unter `...\ref2\frames\` liegen dichte Bildserien, die zeigen, WIE sich die Referenzen bewegen.
Wer eine Animation baut oder prüft, sieht sich die zugehörige Serie Bild für Bild an (Read),
notiert Timing, Reihenfolge und Easing-Gefühl und gleicht das eigene Ergebnis dagegen ab.

| Ordner | Inhalt | Für |
|---|---|---|
| `antimetal-hero-time/` | 12 Frames à 500ms, Hero-Konstellation in Bewegung | Hero |
| `antimetal-stack-scrub/` | 23 Scroll-Schritte durch den Stack-Aufbau | KI-Stack-Dramaturgie, Scroll-Szenen |
| `dna-kugeln-time/` | 18 Frames à 400ms der großen Partikel-Kugel (Seite /dna, y850) | Marketing-Kugeln |
| `dna-kugeln-scrub/` | 17 Scroll-Schritte über die Kugel-Sektion | Marketing-Kugeln |
| `dna-hero-time/` | 16 Frames à 500ms des Hero-Partikelbands | Sternfeld, Partikelästhetik |
| `dna-wave-time/` | 14 Frames à 500ms der Partikelwelle | Partikelästhetik |
| `dna-deep-scrub/` | 21 Scroll-Schritte durch Ringe und Sternfeld | Ringe, Zähler, Footer-Stimmung |
| `valo-foot-time/` | 10 Frames des Valo-Seitenfußes | FinalCta-Nebel, Footer-Wash |
| `ada-stack-entry*/` | GEBLOCKT (Cloudflare-Fehlerseiten, ignorieren) | — |

Zu Ada existiert nur der statische Volltreffer `ref2\ada\02_y1700.png` plus die Choreografie in §3 S2.
Die Referenz-Kugel von DNA (dna-kugeln-time) zum Nachschlagen. Eine große Kugel aus vielen
hundert weich leuchtenden Punkten unterschiedlicher Größe (additiv, unscharf kanten-los), dazu
eine kleinere Begleitkugel versetzt daneben, einzelne Punkte flackern, das Ganze dreht sehr
langsam. Unsere Umsetzung übernimmt Dichte, Weichheit und Ruhe, aber NUR die blau-lila Rampe
(kein Pink-Magenta der Referenz).

Rollenverteilung der Referenzen. Verwechsle das nicht.

| Referenz | Liefert | Liefert NICHT |
|---|---|---|
| valohealth.com + refero-Schema | Farbwelt, Typografie-Haltung, Flächenlogik | Struktur, Inhalte |
| antimetal.com | Struktur, Anordnung, Animationsdramaturgie der Landing Page | Farben (die Seite ist beige), Schrift (Serif entfällt) |
| ada.cx/platform | Aufbau + Animation der KI-Stack-Sektion | alles andere |
| dnacapital.com | Stimmung + Partikelästhetik + Kugeln der Marketing-Sektion | Layoutraster der übrigen Seite |

## 1 · Design-Tokens (globals.css, @theme + :root)

Farben. Basis ist Schwarz, Akzent ist ein blau-lila Verlauf. Keine weiteren Buntfarben.

```css
--bg:        #050507;   /* Seitengrund, fast schwarz mit violettem Hauch */
--bg-raise:  #0B0B10;   /* angehobene Flächen, Karten im Stack */
--ink:       #F4F4F6;   /* Primärtext */
--ink-2:     rgba(244,244,246,.64);  /* Sekundärtext */
--ink-3:     rgba(244,244,246,.40);  /* Tertiärtext, Labels */
--line:      rgba(244,244,246,.12);  /* Haarlinien, 1px, nie dicker */
--line-2:    rgba(244,244,246,.06);  /* noch leisere Trennungen */
--acc-blue:  #5B8CFF;
--acc-violet:#7C6AFF;
--acc-lav:   #B9A5FF;
--grad: linear-gradient(92deg,#5B8CFF 0%,#7C6AFF 48%,#B9A5FF 100%);
--glow: 0 0 80px rgba(124,106,255,.35);
```

Verlaufs-Disziplin (aus dem Valo-Schema, strikt einhalten):
- Der Verlauf erscheint pro Sektion höchstens EINMAL. Erlaubte Rollen. Ein Wort in einer Überschrift (background-clip: text). Dünne Ringe/Linien/Partikel. Der Nebelschleier der Abschluss-Sektion und des Footers.
- NIE als Button-Füllung, nie als Kartenhintergrund, nie großflächig.
- Karten bleiben flach. Keine Schlagschatten zur Tiefe, Tiefe entsteht über Typo-Skala und Haarlinien. Ein weicher violetter Glow ist nur hinter Drei-D-Visuals und dem Stack erlaubt.

Typografie. EINE Familie, leichtes Gewicht trägt alles.
- `next/font/google`. Display und Fließtext **Inter Tight** (300, 400) für alles Große, **Inter** (300, 400, 600) für UI, Labels, Body. Beide mit `display: swap`.
- Display-Stufen (fluid):
  - `t-display` clamp(52px, 7vw, 104px) · Gewicht 300 · line-height 1.02 · letter-spacing -0.027em
  - `t-h1` clamp(40px, 4.6vw, 64px) · 300 · 1.05 · -0.02em
  - `t-h2` clamp(30px, 3vw, 44px) · 300 · 1.1 · -0.015em
  - `t-h3` 24px · 400 · 1.3
  - `t-body-lg` 19px · 300 · 1.55 · Farbe --ink-2
  - `t-body` 15.5px · 400 · 1.55 · Farbe --ink-2
  - `t-label` 11px · 600 · letter-spacing 0.1em · uppercase · Farbe --ink-3
- Gewicht 600/700 NUR für Mikro-Labels und Buttons, nie für Fließtext.
- Fließtext linksbündig. Zentrierung nur für die Abschluss-Sektion und Zwischenmomente.

Buttons und Interaktion.
- Radius 9999 für ALLES Interaktive.
- `btn-solid`  weißer Grund, Text #050507, Höhe 52. Hover hebt 1px und hellt auf 96 Prozent.
- `btn-line`   transparenter Grund, 1px --line, Text --ink. Hover Rand --ink-2.
- `btn-dash`   wie btn-line, aber `border-style: dashed` (Antimetal-Sekundärknopf).
- Kreisrunde Pfeil-Buttons (44px, Haarlinie, ↗) als Listen- und Kartenabschluss.
- Fokusringe sichtbar. `--acc-violet` als outline.

Raster und Rhythmus.
- Inhaltsbreite 1200px, Rand 24px (Mobil 16px). `.shell` wie gehabt.
- Sektionsabstand 140 bis 180px Desktop, 88px mobil.
- Jede Sektion beginnt mit Nummern-Label im Stil `01 · PROBLEM` (t-label, Punkt als Mitteltrenner) plus optionaler Haarlinie darüber.

Motion-Sprache.
- **Lenis** für sanftes Scrollen (lerp ≈ 0.1), in `components/system/SmoothScroll.tsx` als Client-Provider, mit GSAP ScrollTrigger über `lenis.on('scroll', ScrollTrigger.update)` verbunden.
- **GSAP + ScrollTrigger** für szenische Abläufe (Stack-Aufbau, Showcase-Fahrt, Pin-Sektionen).
- **framer-motion** für Mikro-Reveals (Fade-up 24px, 0.7s, ease [0.22,1,0.36,1], Stagger 80ms).
- **Three.js über @react-three/fiber** für Hero-Konstellation und Marketing-Kugeln. Immer per `next/dynamic` mit `ssr: false` laden, DPR auf [1, 2] begrenzen, `frameloop="always"` nur wenn sichtbar (IntersectionObserver, sonst `never`).
- `prefers-reduced-motion` respektiert JEDE Komponente. Endzustand statisch, keine Endlosschleifen, Canvas zeigt ein ruhendes Bild.
- Nichts animiert `width/height/top/left`. Nur transform und opacity.

## 2 · Seitenarchitektur

```
/            Landing (Aufbau unten)
/ki          Tiefe zu KI
/marketing   Tiefe zu Marketing (Social Media, Werbetafeln, Webdesign incl. Showcase)
/ueber-uns   Team und Arbeitsweise
/kontakt     Kontakt mit Formular
/impressum /datenschutz /agb   Rechtstexte im neuen Stil
```

Navigation (alle Seiten). Antimetal-Muster in dunkel. Drei schwebende Pillen mit `backdrop-filter: blur(16px)`, Grund rgba(5,5,7,.55), Haarlinie. Links Pille mit „KI · Marketing · Über uns". Mitte Pille mit Wortmarke „SVH". Rechts Pille mit Link „Kontakt" und btn-solid „Strategiegespräch". Ab unter 1024px Burger mit Vollbild-Overlay (dunkel, gestaffelte Links). Beim Scrollen bleibt die Leiste fixiert, Pillen verdichten sich leicht (Scale 0.98, mehr Blur).

Footer (alle Seiten). Oben Haarlinie, vier Spalten (Leistungen, Unternehmen, Rechtliches, Kontaktdaten aus `content.ts` `company`), darunter riesige Wortmarke „SVH CONSULTING" in --line-2 als Wasserzeichen, ganz unten Zeile mit © und Rechtslinks. Im Grund liegt der violette Nebelschleier (radialer Verlauf --grad bei 8 Prozent Deckkraft, blur 120px).

## 3 · Landing-Sektionen (Reihenfolge fix, Struktur je Antimetal)

Alle Texte kommen aus `app/copy.ts`. KEIN Text wird in Komponenten hart geschrieben.

**S0 Hero** (`landing/Hero.tsx` + `landing/HeroField.tsx`)
Antimetal-Split. Links ab Oberkante etwa 30vh. `t-label` Zeile, dann `t-display` mit GENAU EINEM Wort im Verlauf (`copy.hero.gradientWord` markiert das Wort), dann `t-body-lg` (max 46ch), dann zwei Buttons (btn-solid + btn-dash) nebeneinander. Rechts füllt eine Drei-D-Konstellation die Hälfte. Punktwolke aus ~140 Knoten in Blau-Lila-Tönen, verbunden mit Haarlinien zu den 4 nächsten Nachbarn, ganz langsame Rotation (0.02 rad/s), Maus-Parallax (±40px, gedämpft), einzelne Knoten pulsieren. Unter dem Hero eine gepunktete Haarlinie über die volle Breite (wie Antimetal).

**S1 Manifest** `01 · PROBLEM` (`landing/Manifesto.tsx`)
Editorial-Zweispalter. Links das SVG-Diagramm im Stil des Antimetal-Charts. Achsen in --line, zwei Kurven. Die rote Antimetal-Kurve wird bei uns der Verlauf (Aufwand wächst), die grüne wird --ink-3 (was ein Team schafft). Zwei kleine Kastenlabels an den Kurvenenden (t-label mit 1px Rand). Kurven zeichnen sich per ScrollTrigger über `stroke-dashoffset`. Rechts drei Absätze `t-body-lg` aus copy.manifesto, gestaffelt einfahrend.

**S2 KI-Stack** `02 · KI` (`landing/KiStack.tsx`) — Ada-Nachbau, PAAR B
Abgerundeter Container (Radius 24, Grund --bg-raise, Haarlinie) auf voller Shell-Breite. Oben drei Modulkarten nebeneinander. „Automatisierungen", „Voice und Chat Agenten", „Operating System". Jede Karte trägt ein kleines Linien-Icon, den Titel in t-h3 und darunter Pill-Tags (Haarlinien-Pillen, 13px) aus copy. Karten unterscheiden sich nur über einen HAUCH Tönung im Grund (blau 4 Prozent, violett 4 Prozent, lavendel 4 Prozent). Darunter, volle Breite, die Fundament-Karte „Corporate LLM" mit Untertitel „KI Wissensmanagement" und eigenen Pill-Tags, im Zentrum ein kleines pulsierendes Ring-Emblem (Verlauf als Ringstrich).
Animation beim Scrollen (GSAP, einmalig). Erst gleitet die Fundament-Karte von unten ein, dann fallen die drei Modulkarten gestaffelt von oben ein, dann steigen Partikelfäden (Canvas, 2px Punkte im Verlauf) aus dem Fundament in die drei Karten. Die Fäden fließen danach dauerhaft langsam (reduced-motion friert ein). Unter dem Container ein Satz `t-body-lg` plus Kreis-Pfeil-Link auf /ki.

**S3 Marketing** `03 · MARKETING` (`landing/MarketingOrbs.tsx`) — DNA-Stimmung, PAAR C
Volle Breite, Grund öffnet sich in ein Sternfeld (200 winzige Punkte, einzelne in Akzentfarben, sehr langsames Funkeln). Überschrift t-h1 links mit einem Verlaufs-Wort. Darunter DREI leuchtende Partikel-Kugeln nebeneinander (Three.js Punktwolken à ~2600 Punkte auf Kugeloberfläche, Farben entlang der Rampe, leichtes Atmen über Sinus, Rotation 0.05 rad/s, Maus-Parallax). Unter jeder Kugel t-h3 Titel und ein Satz. Social Media Marketing, Werbetafeln, Webdesign. Hover hebt die Kugel (Scale 1.06) und verdichtet die Punkte (Größe +30 Prozent). Abschlusszeile mit Kreis-Pfeil-Link auf /marketing. Mobil stapeln die Kugeln untereinander (kleinere Canvas je 260px hoch).

**S4 Showcase** `04 · REFERENZEN` (`landing/Showcase.tsx`) — PAAR C
Die Edel-Sektion für Webdesign-Referenzen. Sticky-Bühne. Die Sektion ist 300vh hoch, der Inhalt pinnt. Große Browser-Rahmen (Radius 16, Haarlinie, obere Leiste mit drei Punkten in --ink-3) fahren beim Scrollen horizontal durch, GSAP scrubbed. Jeder Rahmen zeigt einen echten Screenshot aus `public/portfolio/` (Dateien: svh-cyan-home.png, svh-cyan-marketing.png, svh-cyan-kontakt.png, krotzer-eisele-home.png). Bild im Rahmen scrollt beim Durchfahren minimal nach oben (Parallax im Rahmen). Unter jedem Rahmen Projektname in t-label plus ein Satz aus copy. Der aktive Rahmen bekommt den violetten Glow. Mobil wird daraus ein horizontaler Snap-Scroller ohne Pin.

**S5 Ablauf** `05 · ABLAUF` (`landing/Process.tsx`)
Drei Blöcke im Antimetal-Stil mit GESTRICHELTEN Eckwinkeln (nur Ecken gezeichnet, wie beim Antimetal-Sekundärknopf). Nummern 01 02 03 als t-label, Titel t-h2, zwei Sätze t-body. Blöcke fahren gestaffelt ein, die Eckwinkel zeichnen sich zuerst.

**S6 FAQ** `06 · FRAGEN` (`landing/Faq.tsx`)
Antimetal-FAQ in dunkel. Links t-h1 plus ein Satz. Rechts Akkordeon aus Haarlinien-Zeilen, Frage t-h3 Gewicht 400, Plus-Zeichen rotiert zu ×, Höhe animiert über grid-template-rows (0fr zu 1fr). aria-expanded und aria-controls korrekt.

**S7 Abschluss** (`landing/FinalCta.tsx`)
Dunkles Band volle Breite mit Nebelschleier (zwei radiale Verläufe der Rampe, 10 und 6 Prozent, blur 140px, dazu feines Rausch-Overlay über eine 128px-Noise-Kachel als data-URI bei 4 Prozent). Mittig `t-display` mit einem Verlaufs-Wort, ein Satz, zwei Buttons (btn-solid + btn-line). Direkt darunter der Footer.

## 4 · Unterseiten

**/ki** (PAAR B). Hero-Kopf mit t-h1 und einem Verlaufs-Wort plus zwei Sätzen. Danach der KI-Stack in einer ruhigeren Variante (gleiches Bauteil, Prop `compact`). Danach Fähigkeiten-Raster aus copy.ki.capabilities (2×3 Haarlinien-Karten mit Linien-Icons, KEINE bunten Mockups). Danach drei Schritte (copy.ki.steps) als nummerierte Liste im Editorial-Stil. Danach FAQ (copy.ki.faq) im selben Akkordeon. Abschlussband wie Landing (gleiches Bauteil).

**/marketing** (PAAR C). Hero-Kopf gleicher Bauart. Danach drei Leistungsblöcke (Social Media, Werbetafeln, Webdesign) je als Zweispalter mit Text links und einem stillen Visual rechts (Social ein reduziertes Feed-Gerüst aus Haarlinien-Kacheln, Werbetafeln eine Displaysilhouette mit wechselndem Verlaufs-Schimmer, Webdesign ein Browser-Gerüst). Danach der VOLLE Showcase (gleiches Bauteil wie Landing S4). Danach FAQ aus copy.marketing.faq. Abschlussband.

**/ueber-uns** (PAAR D). Frei gestaltet im Systemstil. Kopf, Absätze zur Arbeitsweise (copy.about), vier Prinzip-Karten, Team-Block mit zwei Initialen-Feldern (KEINE erfundenen Biografien, ❗TODO-Texte aus copy übernehmen), Abschlussband.

**/kontakt** (PAAR D). Kopf linksbündig. Zwei Wege-Karten plus Fakten-Spalte (copy.contact). Formular als Haarlinien-Karte. Felder mit dunklem Grund --bg-raise, 1px --line, Fokus --acc-violet plus Ring. Pflichtfelder Name, E-Mail, Nachricht. Absenden ohne Versand, Erfolgsmeldung inline. `// ❗TODO Versand anbinden` im Code. Darunter Kontaktdaten aus content.ts `company`.

**Rechtsseiten** (PAAR D). `LegalPage` dunkel umbauen. max 70ch, Haarlinien-Trenner, t-label-Überschriften.

## 5 · Sprache (STRIKT, gilt für jede sichtbare Zeile)

- Deutsch, Sie-Form, ruhig und präzise.
- VERBOTEN. Doppelpunkte im Fließtext und in Überschriften. Gedankenstriche und Bindestrich-Einschübe (– oder —) im Satz. Abgehackte Kurzsatz-Ketten, besonders verneinende („Kein X. Kein Y.").
- Bindestriche in Komposita (KI-Agenten, E-Mail) sind selbstverständlich erlaubt.
- Alle Texte stehen in `app/copy.ts`. Wer eine Textänderung braucht, ändert sie dort.
- ❗TODO-Platzhalter niemals mit erfundenen Zahlen, Kunden oder Zitaten füllen.

## 6 · Qualität und Abnahme

- `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich.
- Kein horizontaler Überlauf bei 390 / 768 / 1024 / 1440 / 1920. Prüfwerkzeuge unter `_ref/` (shoot.mjs, overflow-check.mjs) weiterverwenden, Vergleich gegen `ref2`-Screenshots.
- Konsole leer. Lighthouse-Gefühl. Canvas pausiert außerhalb des Viewports, DPR gedeckelt, keine Layout-Shifts beim Laden der Drei-D-Teile (feste Containerhöhen + dezenter statischer Fallback bis zum Mount).
- Genau ein h1 pro Seite. Alt-Texte. Labels an Feldern. Kontrast. --ink-2 auf --bg ergibt über 7 zu 1, --ink-3 nur für Nebenlabels ab 11px mit 0.1em Tracking.
- reduced-motion. keine Endlosschleifen, Canvas-Standbilder, Reveals werden Fades.
- „APEX" und Cyan-Reste (#0092d4 usw.) dürfen nirgends mehr auftauchen.

---

## 7 · Umbau v2 nach Nutzerfeedback (gilt vor §3, wo es §3 widerspricht)

Grundsatz. Die LANDING nutzt eigene Animationen, die Unterseiten ihre eigenen.
Die Ada-Stack-Sektion (§3 S2) lebt NUR noch auf /ki. Die Kugeln leben NUR noch auf /marketing.

Neue Landing-Reihenfolge (page.tsx ist bereits so verdrahtet, Platzhalter existieren):
Hero → Manifesto (01) → KiLayers (02) → KiTiles → ProcessPanel (03) → MarketingDna (04) → Showcase (05) → Faq (06) → FinalCta.

Neue Frame-Archive unter `...\ref2\frames\`:
| Ordner | Inhalt |
|---|---|
| `antimetal-hero-morph/` | 30 Frames à 600ms. Die Hero-Konstellation wechselt zyklisch zwischen ZWEI Zuständen. Verstreutes Chaos (lose Punkte, wenige Linien) und geordneter radialer Kreis (Nabe mit Speichen, Punkte auf Ring). Übergänge gleiten über etwa 3 bis 4 Sekunden. |
| `dna-struktur-hero/` | 24 Frames à 350ms der DNA-Struktur auf der dnacapital-Startseite (y0). Die verdrehte Partikel-Bahn mit Taille. PFLICHT für die MarketingDna-Sektion. Drehrichtung, Tempo und Dichte hier ablesen. |
| `dna-struktur-mitte/` | 16 Frames à 400ms derselben Struktur weiter unten (y2600), andere Perspektive. |
| `dna-ringe-eintritt/` | 14 Scroll-Schritte in die Ring-Zähler-Sektion hinein. Zeigt, wie sich die Ringe beim Eintritt ZEICHNEN und die Werte erscheinen. PFLICHT für RingStat. |
| `dna-seite-verteilung/` | 21 Scroll-Schritte über die /dna-Unterseite. Kugeln auf JEDER Sektion, oft am Viewport-Rand angeschnitten (Halbkugeln), abgewandte Seite transparenter. PFLICHT für die Kugel-Verteilung auf /marketing. |
| `dna-text-entry/` | 16 Frames à 350ms des Hero-Texteintritts auf /dna. Wortweise Platten-Enthüllung (helle Platten mit geschlitzten Kanten erscheinen gestaffelt und lösen sich auf). PFLICHT für WordReveal. |
| `dna-kugel-atmen/` | 24 Frames à 500ms der großen Kugel. Dichte-Atmen. Partikel schwellen zwischen dünnem Ring-/Schalenzustand und voll erblühter dichter Kugel an und ab, Zyklus ~8 bis 12s. PFLICHT für das Kugel-Atmen. |
| `antimetal-stack-dense/` | 35 Scroll-Schritte durch den Ebenen-Aufbau. Reihenfolge dort. Erst stehen zwei gestrichelte isometrische Ebenen weit auseinander (oben „Your Team", unten „Production"), beim Scrollen schieben sich ZWEI neue Ebenen dazwischen (Agents, World Model), dann erscheint eine Reihe Integrations-Icons als gestrichelte Kacheln, rechts steht ein kleines Logo-Feld. Links wandern klebende Karten (dunkle Vision-Karte, gestrichelte Karte) mit. |

**S0v2 Hero-Feld Morph** (`landing/HeroField.tsx` umbauen)
Dieselbe Punktwolke morpht endlos zwischen zwei Ziel-Layouts. Zustand A „Chaos": Punkte zufällig verstreut (Rauschen, ungleiche Dichte), nur zufällige kurze Linien, leichtes Zittern. Zustand B „Ordnung": eine Nabe mittig, Punkte auf einem klaren Ring plus Speichenlinien zur Nabe (wie das zweite Referenzbild). Ablauf. 4s in A halten, 2.5s weich nach B (Punkte gleiten auf ihre Zielplätze, Linien blenden um), 4s in B halten, 2.5s zurück. Easing weich (power2.inOut je Punkt mit kleinem Versatz). Die Bedeutung. Ohne uns Chaos, mit uns Struktur. Dazu wechselt eine kleine Bildunterschrift am Feldrand (t-label, aus `copy.heroField.states`, Crossfade synchron zum Zustand). Bei reduced-motion steht dauerhaft Zustand B mit Unterschrift „Mit System".

**S2v2 KiLayers** (`landing/KiLayers.tsx` ersetzt Ada-Stack auf der Landing)
Isometrischer Ebenen-Aufbau nach `antimetal-stack-dense`, Inhalte aus `copy.kiLayers`. Rechts die Bühne. Vier isometrische Ebenen-Platten (CSS-3D oder SVG-Isometrie, gestrichelte Haarlinien-Rahmen, Titel + Unterzeile je Platte). Beim Scrollen (scrub über ~180vh, Sektion pinnt) Ablauf wie die Referenz. Start mit „Ihr Team" oben und „Ihre Systeme" unten weit auseinander, dann gleiten „SVH Agenten und Automatisierungen" und „Corporate LLM" nacheinander dazwischen, danach erscheint die Integrations-Reihe (gestrichelte Kacheln mit den Wortmarken aus kiLayers.integrations.tools plus „und viele weitere") zwischen LLM und Systemen, zum Schluss leuchtet ein dezenter Verlaufs-Schimmer über die verbundene Säule. Links klebend die dunkle Vision-Karte (kiLayers.vision, Grund --bg-raise, Haarlinie) und darüber Sektionskopf (label, title, intro). Die eingefügten Ebenen (role "added") tragen einen HAUCH Verlaufs-Ton (4 bis 6 Prozent) und unterscheiden sich so von den gegebenen (role "given"). Mobil. Kein Pin, die Ebenen stapeln als flache Karten mit Einfüge-Animation beim Reveal. reduced-motion. Endzustand steht.

**S2bv2 KiTiles** (`landing/KiTiles.tsx`)
Raster 3×2 (mobil 1-spaltig) animierter Mini-Mockups im Stil der Apex-Schwebekacheln, aber in UNSERER Farbwelt (Haarlinien-Karten auf --bg-raise, Details in der Rampe, KEINE Cyan-Flächen). Inhalte aus `copy.kiTiles`. Je Kachel oben eine kleine lebende Vignette (Canvas nur wo nötig, sonst DOM/SVG + framer-motion), darunter Titel (t-h3 klein) und ein Satz. Vignetten. email → Briefumschläge gleiten in ein Fach und erhalten Häkchen. chat → Drei-Punkte-Tippen, dann Antwortblase. invoice → Dokument mit wachsenden Zeilen, Stempel „Bezahlt"-Häkchen. calendar → Kalenderblatt, ein Slot füllt sich per Häkchen. leads → Visitenkarten-Chips rutschen in eine CRM-Zeile. report → Mini-Balken wachsen zyklisch. Alle Loops 4 bis 7s, gestaffelt versetzt (index*0.7s), pausieren außerhalb des Viewports, stehen bei reduced-motion.

**S3v2 ProcessPanel** (`landing/ProcessPanel.tsx` ersetzt die gestrichelten Blöcke)
Große Panel-Fläche (Radius 28) mit tiefem Violett-Verlauf (von #14122B über #1B1740 nach #121026, damit die Fläche bis in die Ecken trägt; dazu ein radialer Rampen-Schimmer oben links bei 18 Prozent) statt hellem Cyan der Alt-Referenz. Im Panel oben `process.title` als t-h1 weiß plus ein Satz, darunter DREI Karten (Grund rgba(255,255,255,.04), Haarlinie, Radius 18). Je Karte Nummern-Pille (01 02 03, Verlaufs-Ringstrich), Titel t-h3, zwei Sätze t-body. Beim Eintritt hebt sich das Panel (Scale 0.97→1, Fade), die Karten folgen gestaffelt, die Nummern-Ringe zeichnen sich (stroke-dashoffset). In jeder Karte unten eine ruhige Mini-Vignette (kleine Prozess-Illustration im Stil von S2b, je 3 bis 4s Loop). reduced-motion. alles steht.

**S4v2 MarketingDna** (`landing/MarketingDna.tsx`)
Stil der DNA-STARTSEITE (Screenshots 6 bis 8 des Nutzers, Frames `dna-hero-time`, `dna-deep-scrub`). Volle dunkle Bühne mit Partikelband im Hintergrund (Canvas, gebogenes Band aus feinen Punktreihen in der Rampe, sehr langsame Wellenbewegung, wie unsere Referenzframes), Sternpunkte dünn gestreut. Kopf. label, dann t-h1 mit Verlaufs-Wort aus `copy.marketingDna`, dann intro (max 52ch). Darunter DREI Ring-Zähler nebeneinander (je 210px, dünner Ringstrich). Die Ringe ZEICHNEN sich beim Eintritt (stroke-dashoffset über 1.2s, gestaffelt), dann zählt der Wert hoch (35+ zählt 0→35, „1" und „3" blenden ein), Beschriftung darunter t-body. Werte aus marketingDna.rings, KEINE weiteren Zahlen erfinden. Darunter die drei Stränge (marketingDna.strands) als Zeilen im Stil „Early Stage / Late Stage" der Referenz. Links großer Titel (t-h2), daneben ein kleines Linien-Icon je Strang (web → Browserfenster, social → Sprechblase mit Herz, dooh → Werbetafel auf Standfuß, Stroke 1.5), rechts die drei Punkte als ruhige Liste mit Haarlinien-Trennern. Zeilen faden gestaffelt, Icon zeichnet sich (pathLength). Unten CircleLink auf /marketing. reduced-motion. Band steht, Ringe voll, Werte stehen.

**/ki v2 Dashboard** (`components/ki/Dashboard.tsx`, auf /ki DIREKT NACH dem Ada-Stack)
Dunkles Bühnenband (volle Breite, Sternfeld dezent) mit einem großen Browser-artigen Dashboard-Rahmen mittig (Radius 16, Haarlinie, Kopfleiste mit Punkten), Inhalt aus `copy.kiDashboard.ui`. Links Begrüßung + vier KPI-Karten (Wert groß in Inter Tight 300, CountUp beim Eintritt, Trendzeile t-label), darunter Liste „Zuletzt erledigt" (Zeilen faden nacheinander ein, vor jeder ein Verlaufs-Punkt). Rechts schmale Spalte „Fragen Sie Ihr System" mit drei Beispielfragen als Haarlinien-Karten, in die ein Tipp-Cursor nacheinander die Fragen „tippt" (Zeichen für Zeichen, Schleife). Sektionstitel + Intro darüber aus copy. Die Oberfläche ist ausdrücklich illustrativ, KEINE Kundenkennzahlen behaupten. Alles pausiert außerhalb des Viewports, steht bei reduced-motion.

**/marketing v2 Kugel-Bühne** (Umbau von `app/marketing/page.tsx` oben)
Nach dem Seitenkopf folgt eine Bühne im Stil der DNA-UNTERSEITE (`dna-ourdna\01_y850.png`). EINE große Partikel-Kugel links (OrbsCanvas-Technik wiederverwenden, eine Hauptkugel ~520px plus kleine Begleiterin oben links), rechts Text aus `copy.marketingSphere` (t-h2 + t-body-lg). Danach die drei bestehenden Leistungsblöcke, wobei je Block eine KLEINE Kugel (~200px, Farbe des Blocks) das stille Visual ERSETZEN darf oder ergänzt. Showcase, FAQ, FinalCta bleiben.
