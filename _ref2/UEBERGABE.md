# Übergabe an den nächsten Agenten

> **STAND 27. AUGUST 2026, GEOMETRIE NEU.** Die Fläche ist jetzt eine **verdrehte Ebene**,
> also ein Helikoid. Jede Höhe trägt EINE offene gerade Strecke durch die Achse, von
> minus `RADIUS` bis plus `RADIUS`, für jede Höhe gleich lang. Der Winkel wächst linear
> mit der Weltlage.
>
> ```glsl
> float th = PHASE0 + DRALL * ph * uSpann;
> float u  = sc * RADIUS;
> return vec3(u * cos(th), platz * uSpann, u * sin(th));
> ```
>
> Die scheinbare Verengung entsteht **allein aus der Projektion**. Steht eine Strecke der
> Kamera frontal, misst sie ihre volle Breite; dreht sie sich in die Blickrichtung, fällt
> ihre projizierte Breite gegen null. Weil der Winkel linear läuft, steht immer nur EINE
> Höhe kantig zur Kamera, und die Kreuzung bleibt örtlich.
>
> **Zwei Irrwege liegen dahinter, beide vom Auftraggeber verworfen.** Der erste zog die
> Strecke über eine Glocke zusammen und bündelte die Verdrehung in der Mitte; daraus
> entstand die harte Sanduhr mit langem Hals. Der zweite legte die Erzeugenden als Sehnen
> an der Achse vorbei, also ein einschaliges Hyperboloid; daraus entstanden sichtbare
> elliptische Ringe und ein Röhren-Look. **Beides kommt nicht zurück.**
>
> **Maßstab und Verdrehung hängen zusammen und müssen gemeinsam gerechnet werden.** Die
> sichtbare Bildhöhe entspricht einer bestimmten Zahl von Welteinheiten, und für genau eine
> Kreuzung muss die Verdrehung darüber gerade PI betragen. Bei `unit` gleich 151 (aus
> `min(height*0.17, width*0.105)` bei 1440 mal 900) sind die 900 Bildpunkte des Fensters
> 6,13 Welteinheiten, daraus folgt `DRALL` gleich 0,512. Wer den Maßstab ändert, muss
> `DRALL` mitrechnen, sonst wandert die Kreuzung aus dem Bild.
>
> **`PHASE0` legt fest, WO im Bild die Kreuzung steht**, und ist am Bild eingegabelt statt
> hergeleitet, weil die Bildhöhe entgegen der Weltachse läuft und der Mitlauf zusätzlich
> zu Buche schlägt. Gemessen über die Bedeckung je Zeile (`_ref2/taille.mjs`, Spalte
> `bedZeilen`, die Kreuzung ist das Minimum): 1,2 ergibt 61 Prozent Bildhöhe, 1,9 ergibt 34,
> 2,26 ergibt 9, 3,07 ergibt 99. Eingestellt ist 1,25.
>
> Verboten sind ab jetzt: jede Funktion, die die reale Breite einer Reihe von der Höhe
> abhängig macht (`width(y)`, `pinch`, `radius(y)`, `waist`), geschlossene Ringe je
> Höhenschicht, und jede Sonderbehandlung der Mitte.
>
> **Der Ausgleich der Häufung an der Kreuzung war zu stark.** Wo eine Strecke der Kamera
> die Kante zudreht, drängen sich dieselben Punkte auf immer weniger Bildpunkte. Der
> Ausgleich `squeeze = clamp(enge / 0.55, BODEN, 1.0)` nimmt das zurück, und mit einem
> Boden von 0,14 nahm er zu viel zurück, sodass der helle Knoten der Referenz fehlte.
> Gemessen im Fenster (620,100,420,420) gegen die Referenz bei (620,152,420,420):
>
> | Boden | p99 | p99,9 | Max | Bedeckung | geklemmt |
> |---|---|---|---|---|---|
> | 0,14 | 139 | 170 | 246 | 52,4 % | — |
> | 0,52 | 148 | 184 | 255 | 52,5 % | 0,00 % |
> | 0,70 | 155 | 200 | 251 | 53,1 % | 0,00 % |
> | **0,85** | **172** | **226** | **255** | **53,1 %** | **0,00 %** |
> | Referenz | 170 | 218 | 255 | 49,3 % | — |
>
> Der Grundfaktor in `vLit` steht bei 13,6. Er musste nach dem Umbau von 3,55 herauf,
> weil sich dieselbe Lichtmenge auf mehr Bildfläche verteilt.
>
> Sicherung des guten Standes: `_ref2/DnaBand.knoten-ok.bak`.
> Referenzbilder klein gerechnet: `_ref2/vid27/klein-waist004.jpg`, `klein-c004.jpg`,
> `klein-c020.jpg`. Eigener Stand: `_ref2/tmp/heli-e.png`.


Stand 26. August 2026. Dieses Dokument ersetzt das Gedächtnis der bisherigen Sitzung.
Lies es vollständig, bevor du etwas änderst. Danach `_ref2/SPEC-DARK.md` für die
verbindliche Bau-Spezifikation.

---

## 1. Das Projekt

Website für **SVH Consulting**, eine KI- und Marketing-Agentur. Verzeichnis
`c:\Users\lukas\OneDrive\Desktop\KI-Agentur\Webseite\Webseite neu`.
Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (`@theme` in `globals.css`),
GSAP mit ScrollTrigger, Lenis für weiches Scrollen, framer-motion, three.js.

Drei Leistungssäulen, mehr nicht: **KI-Automatisierung und Agenten**, **Marketing**
(Social Media und digitale Werbedisplays für lokale Betriebe), **Webseiten**.

Die Seite wurde einmal komplett neu gebaut. Phase eins war ein Nachbau von
apex-consulting.ai in Cyan, der vollständig verworfen wurde. Phase zwei ist die
aktuelle dunkle Fassung. Die Inhalte wurden dabei eins zu eins übernommen.

### Referenzseiten und ihre Rolle

| Seite | wofür |
|---|---|
| valohealth.com, styles.refero.design | Farbwelt (schwarze Basis, Akzente ins Blauviolett) und Typografie |
| antimetal.com | Aufbau und Animationen der Landingpage, nur dort |
| ada.cx/platform | KI-Sektion, Corporate LLM und KI-Wissensmanagement an der Position der Reasoning Engine |
| dnacapital.com | Marketing-Sektion samt der DNA-Struktur, um die es gerade geht |

---

## 2. Arbeitsweise, vom Auftraggeber ausdrücklich vorgegeben

Der Orchestrator plant, bewertet Screenshots gegen die Referenz und gibt Rückmeldung.
**Gebaut wird ausschließlich von Unteragenten.** Pro Abschnitt ein Agent, der baut, und
ein Agent, der pingelig kontrolliert. Es werden beliebig viele Rückkopplungsschleifen
gefahren, bis das Ergebnis wirklich der Referenz entspricht.

Wörtlich: *„Gerne auch viel Feedbackschleifen. Das soll wirklich so lange funktionieren,
so lange gebaut werden, bis das funktioniert."*

Vor jedem Animationsbau werden dichte Bildserien der Referenz aufgenommen, damit der
bauende Agent Bild für Bild weiß, wie die Animation funktioniert.

### Sprachregeln, wörtliche Vorgabe des Auftraggebers

> „Höchste Qualität, kein AI-Slop. Keine Doppelpunkt-Konstruktionen, keine
> Bindestrich-Einschübe, keine abgehackten Kurzsätze mit Verneinungen."

Gilt für sichtbare Texte auf der Seite **und** für Kommentare im Quelltext. Kommentare
auf Deutsch ohne Umlaute, das Projekt schreibt `ae`, `oe`, `ue`, `sz`. Ein Kommentar hält
fest, **warum** ein Wert so steht und welche Messung ihn stützt.

---

## 3. Wo die Arbeit gerade steht

Aktive Aufgabe ist die **DNA-Struktur hinter der Marketing-Sektion**,
`app/components/marketing/DnaBand.tsx`. Sie soll das Gewebe von dnacapital.com
nachbilden.

### Stand nach der Lesbarkeitsrunde, 26. August 2026 abends

Ein Prüfer hat den vorigen Stand mit 6 von 10 bewertet. Fünf der sechs
Bewegungspunkte waren bestanden, die Note drückte die **Lesbarkeit**. Diese Runde
hat vier Mängel behandelt.

**Mangel 1, Schrift im Gewebe.** Gelöst über einen **Saumfaktor im Vertex-Shader**,
der an der Bildlage hängt und links der Achse auf 0,138 dämpft. Er greift an der
Helligkeit der einzelnen Punkte an und damit **vor** der Begrenzung im
Fragment-Shader; eine Maske nimmt am Ende nur Deckkraft weg und lässt einen zu Weiß
geklemmten Punkt hell. Die Maske in `marketing.module.css` durfte im Gegenzug
links wieder mehr durchlassen, damit die Flanke des Fächers stehen bleibt.

**Mangel 2, das untere Fünftel trug nie Gewebe.** `FERN_VON` und `FERN_BIS` von
0,08 / 0,185 auf 0,13 / 0,30, Tiefe der zweiten Stufe von 0,98 auf 0,90.

**Mangel 4, Licht in den Lappen statt an der Engstelle.** Kantenfaktor,
`squeeze`-Bodenwert, Grundfaktor und vor allem die **Streuung der Einzelhelligkeit**
(`aGain`, jetzt zweieinhalbte statt zweite Potenz) neu eingestellt.

**Mangel 5, Telefon.** Achse bei Breiten bis 640 von 0,74 auf 0,86, Maske
entsprechend.

**Mangel 6 und 10.** Deckkraft der Navigationspille auf 0,86 beziehungsweise 0,94,
und `app/icon.svg` angelegt. Die Konsole ist damit fehlerfrei.

**Was NICHT erreicht ist und warum.** Drei Zielzahlen sind nicht erreichbar, ohne
die Gitterteilung anzufassen, und die ist Mangel 3 und ausdrücklich eine eigene
Runde. Wir tragen im kanonischen Fenster 3439 Gipfel gegen 2857 der Referenz, also
vierzig Prozent mehr und entsprechend schwächere Punkte. Daraus folgt unmittelbar,
dass der **Anteil über Sockel plus 70** nicht von 8,3 auf die geforderten 3,0 bis
4,5 Prozent kommt, solange das 99. Perzentil bei 170 stehen bleiben soll. Beide
Zahlen hängen an derselben Verteilung, und die hängt an der Punktzahl.

**Eine Messfalle ist dabei gefunden worden**, siehe Abschnitt 7 Punkt 16. Der
Kasten eines Textelementes ist nicht der Kasten der Schrift. Eine Aufzählungszeile
füllt die ganze Inhaltsspalte von 590 Bildpunkten, die Buchstaben reichen aber nur
über die ersten 270 bis 350. `pr-lesbar3.mjs` kennt dafür jetzt die
Umgebungsvariable `ZEILE`.

### Stand nach der Spaltenrunde, 26. August 2026 nachts

Die Lesbarkeitsrunde hat über die **Helligkeit** gearbeitet, über Masken und über
den Saumfaktor im Vertex-Shader. Beides hat geholfen und nicht gereicht, und der
Grund dafür ist geometrisch: die Textspalte reichte bis 74 Prozent der Breite und
damit bis an die Achse der Struktur. Ein Saum, der dort dämpft, müsste erst
jenseits des rechten Bildrandes voll öffnen und würde das ganze Gewebe verdunkeln.
Die Referenz umgeht das nicht durch Dämpfung, sondern durch **Platzierung**: ihre
Kleinschrift steht links auf dem erloschenen Ausläufer, das Gewebe bleibt rechts.

Diese Runde hat deshalb **kein einziges Grafikteil angefasst**. Geändert wurde
allein `app/components/marketing/marketing.module.css`; `MarketingDna.tsx` und
`RingStat.tsx` blieben unberührt, obwohl sie freigegeben waren.

**Der eine Hebel** ist eine gemeinsame Einrückung `--dna-frei` auf `.dnaInner`:

```
breit:  --dna-frei: max(0px, 50% - 12vw)    ->  Text endet bei 62 % der Bildbreite
<=900:  --dna-frei: max(0px, 50% - 24vw)    ->  Text endet bei 74 % der Bildbreite
```

Die Herleitung steht im Kommentar. Die linke Kante des Inhalts liegt bei jeder
Breite bei `50vw - 50%`, gleich ob die Schale ihre Höchstbreite erreicht oder am
Gitter klebt; nutzbar sind also `50% + Pvw - 50vw`, und übrig bleibt `50% - (P-50)vw`.
Benutzt wird die Einrückung von `.dnaRings`, `.strand` und `.dnaIntro`.

Sie sitzt als **Innenabstand** und nicht als Höchstbreite, damit die Trennlinien
über die volle Schalenbreite stehen bleiben. Das freie Feld rechts bekommt dadurch
seinen Halt, und die Sektion liest als Rahmen mit Gewebe darin statt als
eingerückter Block. Nur `.dnaIntro` bekommt stattdessen `max-width: min(52ch, 100%
- var(--dna-frei))`, denn das Blatt rechnet mit `border-box`, wo eine Höchstbreite
den Auszenkasten begrenzt und ein Innenabstand noch einmal abgezogen würde. Genau
so ist der Absatz einmal auf 183 Bildpunkte zusammengefallen.

Dazu zwei Folgeänderungen: `.ringDisc` von 210 auf 190 Bildpunkte, weil eine
Ringspalte auf dem freien Grund nur noch 236 statt 379 misst, und `.ringLabel` von
26ch auf 24ch.

**Gemessen, Kasten der Buchstaben, fünf Versätze:**

| | 1440 vorher | 1440 nachher | 390 vorher | 390 nachher |
|---|---|---|---|---|
| Grundhöchstwert | 30 bis 253 | 30 bis 117 | 26 bis 241 | 23 bis 65 |
| Streuung | 0,4 bis 44,7 | 0,4 bis 6,5 | 0,4 bis 25,5 | 0,4 bis 3,7 |
| Zeilenende längste Zeile | 74,4 % | 60,1 % | 91,8 % | 72,1 % |
| Kennzahl „3", Beschriftung | 86,0 % · 253 · 44,7 | 61,3 % · 47 · 1,7 | 77,7 % · 138 · 9,0 | 67,9 % · 41 · 2,6 |

Die Sektion ist dabei um genau **20 Bildpunkte kürzer** geworden, von 1972 auf
1952, allein durch den kleineren Ring. Alle neun Nachprüfungen sind gelaufen und
bestanden, siehe Abschnitt 5.

**Was nicht erreicht ist.** Zwei Punkte, beide nicht über das Layout erreichbar.

1. **WCAG 7,0 ist eine Frage der Schriftfarbe, nicht der Lage.** Auf vollkommen
   freiem Grund misst eine Aufzählungszeile 6,4, eine Strangüberschrift 6,8. Der
   Grund liegt bei 29,2, und `--ink-2` gleich `rgba(244,244,246,0.64)` rendert über
   diesem Grund mit 167. Für 7,0 zu eins wären 169,5 nötig, also eine Deckkraft von
   0,652 statt 0,640. Das ist **eine Zahl in `globals.css`** und betrifft die ganze
   Seite, deshalb wurde sie nicht angetastet. Die Überschrift `.dnaTitle` mit
   `--ink` steht bei 7,3 und besteht.
2. **Drei Zeilen halten die Streuung 3,0 nicht.** Bei 1440 und den Versätzen 1200
   und 1440 stehen die Zeilen des dritten Stranges auf 3,9 bis 6,5. Ursache ist die
   **schwache äuszere Flanke des unteren Fächers**, die bei diesen Versätzen nach
   links wandert. Ein waagerechtes Profil über diese Zeilen zeigt den Grund bis
   x gleich 770, also 53,5 Prozent, flach bei einem Höchstwert von 32; ab dort
   steigt er auf 57 bis 99. Für Streuung 3,0 müsste der Text also bei 54 Prozent
   enden, nicht bei 62. Die linke Spalte hätte dann 253 Bildpunkte und die
   Strangüberschriften brächen um. Das ist eine Grafikfrage und keine Layoutfrage,
   und die Flanke steht unter Bestandsschutz Punkt 11.

**Das Bild, um das es geht.** Ein langes, flaches, elastisches Band aus schmalen Bahnen.
Man hält es an beiden Enden hoch und verdreht es einmal. Oben fächert es breit auf, in der
Mitte schnürt die Verdrehung es zu einer Taille zusammen, unten fächert es wieder auf.
Der Auftraggeber hat das so beschrieben: *„etwas Langes ausgerollt, besteht aus Streifen,
glatt wie ein Blatt Papier. Dann ziehst du es mit zwei Händen hoch und drehst es dann."*

### Der letzte Lauf wurde vom Wochenlimit abgebrochen

Der bauende Agent kam bis zur Scherung des Abtastrasters und wurde dann gestoppt. Seine
letzte Notiz lautete sinngemäß, der Handel zwischen der Delle im Radialprofil und dem
99. Perzentil sei bei dieser Gitterteilung zäh, er wolle das Gitter auf die exakte
Referenzteilung zusammenziehen und die Scherung danach neu einpassen. **Genau dort geht
es weiter.**

### Gemessener Ist-Zustand

Alle Zahlen auf der echten Seite bei 1440 mal 900, Versatz null, danach über
`_ref2/to1085.mjs` auf Referenzmaßstab gebracht. Kanonisches Fenster: unseres
(620, 100, 420, 420), Referenz (620, 152, 420, 420).

| Größe | Referenz | Stand jetzt | Ziel |
|---|---|---|---|
| Punkte je 120er Fenster | 477 | **985** | 477, also mittlerer Abstand 5,5 statt 3,82 |
| absolutes 99. Perzentil | 170 | **139** | 168 bis 175 |
| p99,9 | 218 | 210 | unter 220 |
| Bedeckung über Sockel plus 8 | 49,3 % | 55,3 % | 52 bis 60 % |
| Grund links Mitte | rgb(33,4 · 31,7 · 38,6) | rgb(30,0 · 28,3 · 36,3) | flach, Blau minus Rot 4 bis 8 |
| Grund links oben | rgb(29,9 · 28,1 · 35,1) | rgb(43,5 · 41,9 · 49,1) | rund 14 Stufen zu hell |

### Die beiden nächsten Schritte

1. **Gitterteilung auf die Referenz zusammenziehen.** Wir sind mit 985 Punkten doppelt so
   dicht wie die Referenz mit 477. Der mittlere Abstand muss von 3,82 auf 5,5 Bildpunkte.
2. **Helligkeit je Punkt nachziehen.** Weil sich dasselbe Licht auf doppelt so viele Punkte
   verteilt, ist das absolute 99. Perzentil von 172,6 auf 139 gefallen. Nach Schritt eins
   muss es zurück ins Band von 168 bis 175.

Danach den Grund oben um rund 14 Stufen absenken und einen Prüfagenten drüberschicken.

---

## 4. Der aktuelle Quelltext in Zahlen

`app/components/marketing/DnaBand.tsx`, Stand beim Abbruch:

```
N_U = 180             N_S = 120
SHEAR_BASE = 0.15     SHEAR_SWING = 0.035
RADIUS = 2.3          SPANN = 11.5   (Weltlaenge EINER Periode)
TWIST_FAR = 1.76492   TWIST_KNOT = 0.691754   KNOT_SPAN = 0.05
NECK_MIN = 0.08       NECK_SPAN = 0.048
TILT = 0.24           CAMERA = 11.0
IDLE_FLOW = 0.001209  BOOST_MAX = 0.00232  BOOST_FULL = 1500  BOOST_EASE = 1.5
MITLAUF = 0.35        RAND = 120
FERN_VON = 0.13       FERN_BIS = 0.30      STUFE1_BIS = 0.1
Ausklang zweite Stufe: Tiefe 0.90
uCenterPx = (width * 0.74, height * 0.493), auf Breiten bis 640 width * 0.86
Saum       = mix(0.138, 1.0, smoothstep(achse - 0.18, achse + 0.10, px.x / breite))
squeeze    = mix(0.0708, 1.0, smoothstep(NECK_MIN, 1.0, nk))
Kantenfaktor = 0.48 + 0.52 * facing        Grundfaktor = 2.72
aGain      = 0.15 + 2.9 * zufall^2.5       (Mittelwert 0.979, Hoechstwert 3.05)
blending: CustomBlending, blendSrc/blendDst/blendSrcAlpha/blendDstAlpha = OneFactor
```

Maske `.dnaBand` in `marketing.module.css`, Stuetzstellen der Deckkraft:

```
breit:  0 bei 0 %, 0.18 bei 30 %, 0.45 bei 44 %, 0.72 bei 55 %, 0.90 bei 64 %, 1.0 bei 78 %
<=640:  0 bei 0 %, 0.06 bei 50 %, 0.22 bei 70 %,                              1.0 bei 95 %
```

`.nav-pill` in `globals.css`: Deckkraft 0.86, gescrollt 0.94. Die Unschaerfe ist
dort **kein** Hebel, das ist gemessen und steht im Kommentar.

`next.config.ts` kennt jetzt `distDir: process.env.NEXT_DIST_DIR`. Ein Probebau
laeuft damit ueber `NEXT_DIST_DIR=.next-pruef npx next build` und laeszt den
Entwicklungsserver in Ruhe. **Next traegt dabei zwei Zeilen in `tsconfig.json`
nach**, die hinterher wieder zu entfernen sind.

Seit dem Umbau zum **wandernden Band** (26. August 2026) gilt zusaetzlich:

- Die Struktur ist ein endloses periodisches Gewebe, das Bild ein Fenster darin.
  `platz = fract(w + scher*aS - uTravel) - 0.5` gibt den Platz im Fenster,
  `ph = platz + uTravel` die Weltlage. Die Bildhoehe haengt allein an `platz`,
  das Muster allein an `ph`.
- Die Verdrehung legt je Periode **genau pi** zu. Daraus folgen `TWIST_FAR` und
  `TWIST_KNOT`; sie duerfen nur zusammen und nur unter dieser Bedingung geaendert
  werden, sonst steht an der Nahtstelle ein Knick.
- `uTravel = MITLAUF * (scrollY - Zonenoberkante) / Periodenlaenge`, gefaltet auf
  zwei Perioden ueber `roh - 2*Math.round(roh/2)`. Die Faltstelle liegt damit 4093
  Bildpunkte Scrollweg auszerhalb der Zone.
- Der **Ausklang haengt am Platz im Fenster**, nicht an der Weltlage. Die
  Gegenfassung ist gebaut und verworfen worden, siehe den Kommentar im
  Vertex-Shader.
- Der Entwicklungshaken `window.__dna()` liefert travel, flow, boost, periodePx,
  spann, unit, stride und weg. Er steht nur ausserhalb des gebauten Standes.
- Neue Werkzeuge: `wandersicht.mjs`, `taillenlage.mjs`, `ankopplung.mjs`,
  `ruhetempo.mjs`, `breiten.mjs`, `faltprobe.mjs`, `zone.mjs`, `fehler.mjs`.

---

## 5. Was unter Bestandsschutz steht

Diese Punkte sind erkämpft, gemessen und teils vom Auftraggeber abgenommen. Wer sie
antastet, wirft das Projekt zurück.

1. **Die Silhouette steht IN RUHE still.** Über sieben Aufnahmen in sechzig Sekunden
   ohne Scroll ändert sich die Umrisslinie nicht. Das ist die zentrale Errungenschaft.
   Sie beruht darauf, dass die Punkte über eine stehende Fläche wandern statt sie zu
   drehen. **Das bleibt.** Zuletzt gemessen: Taille in allen sieben Aufnahmen bei
   y = 428 bzw. 436 (eine Bandbreite Messrauschen), linke Kante 1043, vorher wie
   nachher identisch.
   Beim **Scrollen** wandert die Struktur dagegen ausdrücklich, um ein Viertel bis ein
   Drittel des Scrollwegs. Das ist seit dem 26. August 2026 gefordert und gebaut.
2. **`CLIMB` ist ersatzlos entfallen und bleibt es.** Der Term hing die **Verdrehung** an
   die Scrollrichtung, beim Hochscrollen lief sie rückwärts, und das fühlte sich für den
   Auftraggeber wie ein Widerstand an. Der Schub läuft nur noch über den **Betrag** der
   Scrollgeschwindigkeit, ist also richtungsunabhängig.
   Davon streng zu trennen ist die **Verschiebung** über `uTravel`. Sie trägt ein
   Vorzeichen und kehrt sich beim Zurückscrollen um, denn genau so verhält sich jede
   Parallaxe. Der Auftraggeber hat sie am 26. August 2026 ausdrücklich verlangt.
3. **Der Selbstregler darf niemals über `geom.setDrawRange` laufen.** Der Puffer ist
   zeilenweise gefüllt, eine gekürzte Zeichenreichweite amputiert ein ganzes Bandende samt
   Taille statt gleichmäßig auszudünnen. Der Regler greift am Rasterschritt im Shader an,
   ignoriert Ausreißer über 200 ms und hat einen Rückweg.
4. **Der Zuschnitt der Zone** in `app/page.tsx`. Die Struktur beginnt an der
   Marketing-Sektion und blendet vor `05 Referenzen` aus, mit weichem Ein- und
   Ausblenden. `<DnaZone><MarketingDna /></DnaZone>`, `<Showcase />` steht außerhalb.
5. **Kein `overflow: hidden`** auf `.dnaZoneBg`. Es macht den Vorfahren zum Bezugsrahmen
   für `position: sticky` darunter, und das Sticky-Element klebt dann nie. Geklippt wird
   über `mask-image`.
6. Die Struktur nimmt **nicht mehr als die rechte Bildhälfte** ein.
7. Bildrate p50 rund 16,7 ms. Kein waagerechter Überlauf bei 1920, 1600, 1440, 1280 und
   390. `prefers-reduced-motion` friert vollständig ein.
8. **Der Saumfaktor und der Grundfaktor gehören zusammen.** Der Bodenwert des Saums
   mal dem Grundfaktor ist die Helligkeit über der Textspalte, also 0,138 mal 2,72
   gleich 0,375. Wer den einen anfasst, muss den anderen im Kehrwert mitziehen,
   sonst wandert das Gewebe wieder in die Schrift oder das Gewebe verliert rechts
   der Achse sein oberes Perzentil.
9. **`squeeze`-Bodenwert und Kantenfaktor-Bodenwert gehören ebenso zusammen.** Ihr
   Produkt ist die Helligkeit in der Engstelle und steht seit drei Runden bei 0,034.
   Bodenwert und Ausschlag des Kantenfaktors ergänzen sich zu eins, damit ein voll
   zugewandtes Band unberührt bleibt.
10. **Der Mittelwert von `aGain` bleibt bei rund 0,98.** An ihm hängt die Engstelle,
    wo Dutzende Punkte übereinanderliegen und ihre Summe dem Mittelwert folgt, nicht
    der Streuung. Die dritte Potenz ist gebaut und verworfen worden: sie trieb den
    Weißanteil der leuchtenden Punkte von 1,0 auf 1,8 Prozent und die Sättigung von
    0,46 auf 0,43, und beides steht unter Punkt 6 der elf Prüfpunkte.
11. **Der Ausklang reicht bis an den unteren Bildrand.** In den Zeilen 760 und 850
    trägt das Gewebe 12,5 und 2,8 bis 4,0 Prozent Bedeckung. Wer `FERN_BIS` wieder
    verkürzt, bekommt die schräg abgeschnittene Kante zurück.
12. **Die Schrift der Marketing-Sektion endet bei 62 Prozent der Bildbreite**, auf
    Schirmen bis 900 Bildpunkten bei 74 Prozent. Der eine Hebel dafür ist
    `--dna-frei` auf `.dnaInner` in `marketing.module.css`. Wer die Einrückung
    zurücknimmt, holt sich das Gewebe sofort wieder in die Zeilenenden; gemessen
    stieg der Grundhöchstwert hinter der Schrift dabei von 117 auf 253 und die
    Streuung von 6,5 auf 44,7. Die Einrückung ist ein **Innenabstand**, damit die
    Trennlinien über die volle Schalenbreite stehen bleiben.

### Die neun Nachprüfungen der Spaltenrunde, alle bestanden

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Weltversatz in Ruhe über 40 s | eigener Haken `window.__dna()` | Spanne 0,000e+0 |
| Mitlauf über den Scrollweg | `ankopplung.mjs` | 0,3500 an jeder Stelle |
| Umkehrbarkeit nach vollem Durchlauf | `ankopplung.mjs` | grösste Abweichung 0,000 px |
| Stetigkeit an der Faltstelle | `faltprobe.mjs` | stetig über minus 40 bis plus 40 |
| Silhouette über fünf Ruhebilder | `steh.mjs` plus `taille.mjs` | Engstelle in allen fünf bei y 48,7 %, Breite 27,6 % |
| Verlöschen vor `05 Referenzen` | `zone.mjs` | Ausklang endet mit der Sektion bei 8655 |
| Waagerechter Überlauf | `breiten.mjs` | falsch bei 1920, 1600, 1440, 1280, 390 |
| Bildrate | `rate.mjs` | p50 16,7 ms, p95 16,8, n gleich 466 |
| Reduzierte Bewegung | eigene Probe | travel und flow über 12 s bei exakt null |

`npx tsc --noEmit` läuft sauber, `NEXT_DIST_DIR=.next-pruef npx next build` baut
ohne Warnung. Die Konsole trägt nur die Entwicklungsmeldungen von React und HMR
sowie die Verfallswarnung `THREE.Clock`, die aus `DnaBand.tsx` stammt und älter
ist als diese Runde.

---

## 6. Zielwerte der Referenz

Alle gegen dnacapital.com gemessen, alle belastbar, also ohne das Schriftartefakt aus
Abschnitt 7.

- Linke Gewebekante 55,6 Prozent der Bildbreite oben und 54,1 unten, Achse an der
  Engstelle 73,8 Prozent
- Taillenhöhe rund 52 Prozent, schmalste Stelle 2,2 Prozent der Seitenbreite,
  Bedeckung in der Engstelle 4 bis 6 Prozent
- Verhältnis der Bedeckung unten zu oben 0,92, unser Wert war zuletzt 1,08
- Das Gewebe ist **anisotrop und geschert**. Die Ketten laufen flach diagonal, rund 25 bis
  30 Grad unter der Waagerechten, Abstand 15 Bildpunkte quer und 5 längs. Ein
  achsparalleles quadratisches Gitter liest niemals wie die Referenz, egal wie fein es ist
- Autokorrelation bei Versatz 12 rund 0,61
- Sättigung 0,46. Farbtopf 210 bis 240 Grad rund 50 Prozent, 240 bis 270 Grad rund 40,
  270 bis 300 Grad rund 2,9, Weißanteil der leuchtenden Punkte rund 2,4 Prozent
- Grund der Fläche flach rgb(30 · 28 · 35) bis rgb(33 · 32 · 39), der Blaukanal liegt nur
  5 bis 7 Punkte über Rot
- Der untere Lappen **verlöscht** nach unten, die Bedeckung fällt über die Zeilen 84,6 /
  94,4 / 98,1 von 30,6 über 23,7 auf 13,6 Prozent
- Die Referenz trägt in nur rund 52 Prozent ihres Fensters überhaupt Licht und in 3,8
  Prozent viel Licht. Sie reicht von fast erloschen bis blendend
- Ruhebewegung rund 3 Bildpunkte je Sekunde, Richtung waagerecht nach links
  (dx gleich minus eins, dy gleich null, über sechs Bildpaare mit Korrelation 0,82 bis 0,86)

### Zur Helligkeitsgrenze 175

Der Auftraggeber hat einmal einen zu grellen Stand abgelehnt, daher stammt die Zahl. Sie
bezieht sich auf das **absolute 99. Perzentil im Messfenster**, nicht auf den Maximalwert.
Die Referenz liegt dort bei 170,6 und 171,6, ihr Maximalwert dagegen bei 255. Wer 175 auf
den Maximalwert bezieht, baut eine viel zu dunkle Struktur.

---

## 7. Messfallen, die dieses Projekt bereits Runden gekostet haben

Diese Liste ist teuer bezahlt. Lies sie, bevor du misst.

1. **Die Schriftfalle.** Die weiße Überschrift von dnacapital.com liegt direkt über der
   Taille und fällt in dieselbe Hochfrequenzmaske wie das Punktraster. `hals.mjs` meldet
   auf f006 bis f011 deshalb eine scheinbar felsenfeste Taille bei 52,0 Prozent und eine
   Halslänge von 26 px. Übermalt man den Schriftblock, schwanken dieselben Bilder zwischen
   44,6 und 54,5 Prozent und zwischen 9 und 44 px. **Diese Zahlen sind keine Zielwerte.**
   Bereinigte Referenzbilder liegen als `_ref2/tmp/pruef/rein-f0*.png`.
2. **Immer auf der echten Seite messen, nie im nackten Zustand.** Der Unterschied betrug
   einmal 42 Prozent, ein Bericht meldete 122 statt der tatsächlichen 86.
3. **Screenshots nur mit `chromium.launch({ headless: false })`.** Headless nimmt den
   Software-Renderer, liefert ein falsches Bild und unbrauchbare Bildraten. Echte Karte
   ist eine Intel Arc 130V, p50 16,7 ms.
4. **Lenis fängt `window.scrollTo` ab.** Hart über `document.scrollingElement.scrollTop`
   springen, **zweimal** setzen, weil die erste Zuweisung von der Trägheit überschrieben
   wird, danach mindestens 3000 ms warten.
5. **`sharp.stats()` ignoriert `.extract()`.** Fensterwerte über
   `.extract().greyscale().raw().toBuffer()` selbst rechnen. Diese Falle hat einmal drei
   identische Messwerte über drei verschiedene Codestände erzeugt.
6. **Element-Screenshots verlieren WebGL-Inhalte** (`preserveDrawingBuffer` steht auf
   falsch). Viewport schießen und mit sharp beschneiden.
7. **Der Maßstab.** Die Referenzseite ist 1085 breit, unsere 1425. Ein in unseren
   Bildpunkten gerechneter Vorschlag liegt auf Referenzmaßstab um Faktor 1,31 daneben.
   Genau daran ist ein Vorschlag zu `N_S` gescheitert.
8. **Additives Mischen verschiebt den gerenderten Farbton zum Blau.** Farbschwellen immer
   am gerenderten Bild prüfen. Bei geringer Dichte gilt das allerdings kaum noch.
9. **`_ref2/metric2.mjs` sucht sich sein Fenster selbst** und landet bei uns auf dem
   Verlauf statt auf dem Gewebe. Seine Zahlen taugen für den Vergleich nicht.
10. **`krit-drift.mjs`** misst den mitlaufenden Grund statt der Drehung und meldet vor und
    nach einer Änderung dieselben Werte. **`flow.mjs`** kann Ratenunterschiede in der
    Größenordnung der Ruhebewegung nicht auflösen, sein Blockvergleich rastet auf der
    nächsten Rasterreihe ein. **`schub.mjs`** ist bei einem Grundwert von 0,78 im
    Sättigungsbereich.
11. **`kante.mjs` ist bei hoher Dichte untauglich**, weil die 8er-Zelle höchstens eine Bahn
    enthält. Für die Taille gibt es `_ref2/taille.mjs`.
12. **framer-motion überschreibt CSS-`transform-origin`** mit 50 Prozent. Über
    `style={{ originX, originY }}` setzen.
13. **Ein Übergang mit `duration: 0`** kann eine laufende Blende nahe null einfrieren, das
    Element bleibt dann unsichtbar.
14. **Agenten-Protokolldateien bleiben bis zum Abschluss 0 Bytes groß.** Das einzige
    verlässliche Lebenszeichen eines laufenden Agenten ist Dateiaktivität im Projekt.
15. **Zahlen können besser und Bilder gleichzeitig schlechter werden.** Das ist hier
    zweimal passiert, einmal durch Überhelligkeit, einmal durch eine Punktstreuung von
    plus minus 0,4 Rasterweiten, die das Gewebe zu Rauschen machte. **Nach jeder Änderung
    am Material das gerenderte Bild mit dem Read-Werkzeug ansehen**, nicht nur die Zahlen.
16. **Der Kasten eines Textelementes ist nicht der Kasten der Schrift.** Eine
    Aufzählungszeile der Leistungsstränge füllt die ganze Inhaltsspalte, also 590
    Bildpunkte von x gleich 722 bis 1312, während die Buchstaben nur über die
    ersten 270 bis 350 reichen. Die übrigen 240 Bildpunkte liegen im dichten Gewebe
    rechts der Achse und tragen zur Lesbarkeit nichts bei, heben den gemessenen
    Höchstwert aber auf 255 und die Streuung auf 47. Gemessen am Kasten der Schrift
    steht dieselbe Zeile bei Höchstwert 38 und Streuung 0,9. `pr-fein.mjs` schreibt
    den wirklichen Zeilenkasten jetzt als Feld `zeile` mit, `pr-lesbar3.mjs` nimmt
    ihn über die Umgebungsvariable `ZEILE`. **Beide Zahlen gehören in einen Bericht**,
    denn die eine überzeichnet und die andere unterschätzt, was ein Leser sieht.
17. **Die Bildrate schwankt mit fremder Last auf der Grafikkarte.** Ein Durchlauf von
    `pruef-rest.mjs` meldete p50 gleich 33,3 ms, also glatt die halbe Rate. Unmittelbar
    danach über `_ref2/rate.mjs` gemessen lagen der neue und der alte Codestand
    beide bei 16,7 ms. Auf demselben Rechner läuft ein Browser mit der Referenzseite,
    und die trägt selbst eine WebGL-Animation. **Eine Bildratenmessung ist nur als
    unmittelbarer Vergleich zweier Codestände hintereinander belastbar.**

---

## 8. Werkzeug

Der Entwicklungsserver soll auf **Port 3100** laufen. `_ref2/up.sh` prüft und startet ihn.
Er ist zuletzt zweimal von selbst ausgefallen, rechne damit.

Wichtigste Skripte unter `_ref2/`:

| Skript | wofür |
|---|---|
| `blick.mjs` | schlichte Aufnahme zum Ansehen, `node _ref2/blick.mjs 3100 ziel.png [versatz]` |
| `to1085.mjs` | unsere Aufnahme auf Referenzmaßstab bringen |
| `taille.mjs` | Taillenbreite und Engstelle, helligkeitsbasiert und schriftfest |
| `dyn.mjs` | schriftfreie Silhouette über das Bewegungsfeld |
| `saum.mjs` | Kerbe und Grat längs der Achse |
| `lesbar.mjs` | WCAG-Kontrast plus Unruhe des Grundes hinter Schrift |
| `gov-check.mjs` | Selbstregler über die Zeit, deckt Dichteflackern auf |
| `steh.mjs` | Ruhebilder mit Verankerung, prüft den Stillstand der Form |
| `pruef-rest.mjs` | Bildrate, Regler, Mischprobe, Zonendurchlauf, 390 px, reduzierte Bewegung |
| `kante.mjs`, `hals.mjs` | Form, aber Vorsicht wegen Falle 1 und 11 |
| `krit-*.mjs` | Skripte des ersten Prüfagenten, Raster, Farbe, Umriss, Bewegung |
| `pr-*.mjs` | Skripte des zweiten Prüfagenten, die Grundlage der Note 6 von 10 |
| `pille.mjs` | Grund streng innerhalb der Navigationspille, dazu alle Konsolenmeldungen |
| `rate.mjs` | nur die Bildrate, für den unmittelbaren Vergleich zweier Codestände |
| `spalte.mjs` | Lesbarkeit **beider** Kastenarten nebeneinander, nur innerhalb von `#marketing` |

`spalte.mjs` ist in der Spaltenrunde entstanden und beantwortet genau die Frage,
an der `pr-lesbar3.mjs` vorbeimisst. Aufruf
`node _ref2/spalte.mjs 3100 1440 900 <marke> 0 420 840 1200 1440`. Es weist je
Zeile Elementkasten und Schriftkasten nebeneinander aus, samt Lage des rechten
Randes in Prozent der Bildbreite, dazu Grundmittel, Grundhöchstwert, Streuung, die
**gerenderte** Schrifthelligkeit und den Kontrast. Drei Eigenschaften sind teuer
bezahlt und dürfen nicht verloren gehen:

1. Es filtert **nicht** nach der Lage im Bild, sondern nach der Sektion. Nach dem
   Umbau wandern Zeilen aus der rechten Bildhälfte heraus und würden bei
   `pr-lesbar3.mjs` aus der Tabelle fallen, womit sich vorher und nachher nicht
   mehr vergleichen liesze.
2. Es markiert Zeilen, die gerade unter der **Navigationspille** oder einer
   schwebenden Schaltfläche durchlaufen, und zählt sie nicht mit. Diese messen
   einen Grund von 244 statt 30, und das hat mit dem Gewebe nichts zu tun.
3. Es blendet die **Anzeige des Entwicklungsservers** aus, `nextjs-portal`. Sie
   steht unten links in einem eigenen Schattenbaum, taucht in keiner Abfrage nach
   festen Elementen auf und hat drei Zeilen einen Höchstwert von 255 angehängt.
   Im gebauten Stand gibt es sie nicht.

Der Sprung prüft auszerdem nach, wo die Seite wirklich steht, und wiederholt sich
sonst. Ohne diese Nachschau landete derselbe Versatz in zwei Durchläufen einmal auf
den Kennzahlen und einmal auf den Strängen.

`pr-fein.mjs` nimmt die Scrollstellen jetzt ab dem vierten Argument einzeln
entgegen, also `node _ref2/pr-fein.mjs 3100 1440 900 840 1200`. Ohne Vorgabe
bleibt es bei der vollen Reihe von elf Stellen. Für die Lesbarkeit gilt der
Doppelweg aus Falle 16: `node _ref2/pr-lesbar3.mjs …` misst am Elementkasten,
`ZEILE=1 node _ref2/pr-lesbar3.mjs …` am Kasten der Schrift.

Referenzbilder in `_ref2/ref26/`, 64 Bilder. Ruhezustände f006 bis f012, Scrollzustände
f026 bis f034. Bereinigte, von Schrift befreite Fassungen in `_ref2/tmp/pruef/`.
Ältere Serie in `_ref2/refframes/`.

Vergleichsbilder der Kämmrichtung liegen als `_ref2/tmp/z2-ref.png` (Referenz) und
`_ref2/tmp/z2-wir-c.png` (unser Stand), beide fünffach vergrößert.

### Sicherungen

Die wichtigsten Rückfallpunkte für `DnaBand.tsx`:

- `_ref2/DnaBand.pre-scherung.bak` — vor der Scherung. Hält alle Zahlen ein, sieht aber
  mit senkrechten Perlenschnüren erkennbar nach anderem Material aus
- `_ref2/DnaBand.pre-material.bak` — vor der Reparatur von Alphakanal, Achsenriss und Regler
- `_ref2/DnaBand.pre-stillstand.bak` — vor der Umstellung auf die stehende Form
- `_ref2/DnaBand.pre-lesbar.bak` — vor der Lesbarkeitsrunde, dazu
  `marketing.pre-lesbar.bak.css` und `globals.pre-lesbar.bak.css`
- Dazu `marketing.pre-material.bak.css` und `marketing.pre-fix10.bak.css`
- `_ref2/marketing.pre-spalte.bak.css` und `_ref2/MarketingDna.pre-spalte.bak` —
  vor der Spaltenrunde. Die Sicherung von `MarketingDna.tsx` ist deckungsgleich mit
  dem heutigen Stand, die Datei wurde nicht angefasst

---

## 9. Was zuvor schon gelöst wurde, damit es niemand zurückdreht

Diese Fehler sind gefunden und behoben. Sie tauchen in älteren Kommentaren teils noch als
offen auf.

1. **Der Regler amputierte das Band.** Er kürzte über `setDrawRange`, kannte keinen
   Rückweg, und ein einziger Ruckler beim Tabwechsel drosselte dauerhaft. Nach 36 Sekunden
   stand nur noch ein Zipfel oben rechts.
2. **Die Form atmete.** Die Materialtaille saß fest bei der Bandmitte, die
   Blickwinkel-Taille wanderte mit der Drehung davon. Die Halslänge wuchs in 3,6 Sekunden
   von 53 auf 106 Bildpunkte, die Taille lief in zwölf Sekunden von 42 auf 20 Prozent
   Bildhöhe. Gelöst durch die stehende Fläche.
3. **Das Gewebe zog Licht ab.** Der Alphakanal stand fest auf eins, auch am Rand jeder
   Punktscheibe, wo die Farbe gegen null geht. Jeder Punkt saß in einem dunklen Ring von
   19 Stufen Tiefe, die Referenz hat 3,3. Das Bild las als perforiertes Blech statt als
   feiner Faden. Nebenbei: `mix-blend-mode: screen` auf dem Canvas wirkte nachweislich
   überhaupt nicht.
4. **Ein dunkler Riss lief über die volle Bildhöhe** auf der Achse, aus einem Faktor, der
   die mittleren 22 Prozent der Bandbreite löschte.
5. **Der Regler flackerte auf einer ruhenden Seite**, der Gewebeanteil fiel zweimal von 17
   auf 3,3 Prozent und blieb elf Sekunden dort, obwohl die Bildrate keinen Anlass gab.
6. **Ein Aufnahmeskript maß still die Überschrift mit**, weil `flags.bare !== undefined`
   bei einem Schalter ohne Gleichheitszeichen immer falsch ist und der Selektor nicht im
   Baum stand.
7. **Vier falsche Geometrien** wurden durchprobiert und verworfen: Wendeltreppe,
   zusammenlaufendes Linienbündel, welliges Blatt ohne Taille, Hyperboloid. Auch eine
   Wendel mit 1,9 Windungen taugt nicht, sie zeigt mehrere Einschnürungen gleichzeitig.
   Ebenso wenig taugt es, die Verdrehung ganz in der Mitte zu bündeln, dann sind die Enden
   starre flache Bahnen und die Struktur legt sich bei ungünstiger Drehlage zu einer
   schmalen Säule zusammen.

---

## 10. Inhaltliche Lücken, die niemals erfunden werden dürfen

In `app/copy.ts` stehen `❗TODO`-Platzhalter. Sie sind **Absicht**. Der Auftraggeber muss
echte Daten liefern, und kein Agent darf sie durch Erfundenes ersetzen.

- Lebensläufe und Rollen für Lukas Sehorz und Jannik vom Hofe
- endgültige Domain und E-Mail-Adresse
- Empfängeradresse des Kontaktformulars
- Standorte, Preise und Mindestlaufzeiten der Werbedisplays
- Preise für Webseiten
- echte Kundenstimmen, Fallstudien und Blogbeiträge

`app/content.ts` enthält nur noch `company` mit Anschrift, Telefon, E-Mail und Zeiten.

---

## 11. Sonstiges

- **kie.ai** liefert Bilder über `gpt-image-2-text-to-image` und Videos über Veo 3.1. Der
  Schlüssel steht **nur** in der Umgebungsvariablen `KIE_KEY` und darf nicht im Quelltext
  landen. Er wurde einmal versehentlich in ein Skript geschrieben und vor dem Push wieder
  entfernt; ein Wechsel des Schlüssels ist empfohlen.
- Schriften der dunklen Fassung: Inter Tight in 300 und 400 für Display, Inter in 300, 400
  und 600 für die Oberfläche.
- Das Portfolio liegt als 1600 Pixel breite WebP-Dateien mit 60 bis 80 kB unter
  `public/portfolio/`.
- Git: Zweig `main`, letzter Commit `5fa6e44`. Die gesamte dunkle Fassung ist noch **nicht**
  eingecheckt, `git status` zeigt viele geänderte und neue Dateien.
- Merkdateien der bisherigen Sitzung liegen unter
  `C:\Users\lukas\.claude\projects\c--Users-lukas-OneDrive-Desktop-KI-Agentur-Webseite-Webseite-neu\memory\`
  und decken Marke und Umfang, offene Punkte, Werkzeuge sowie die DNA-Struktur ab.

---

## 12. Der erste Schritt für dich

1. `_ref2/up.sh` ausführen oder prüfen, dass Port 3100 antwortet.
2. `node _ref2/blick.mjs 3100 _ref2/tmp/start.png 0` und das Bild ansehen.
3. `_ref2/tmp/z2-ref.png` und `_ref2/tmp/z2-wir-c.png` nebeneinander ansehen. Du musst den
   Unterschied zwischen dem Gewebe der Referenz und unserem mit eigenen Augen gesehen
   haben, bevor du misst.
4. Einen bauenden Agenten mit den beiden Schritten aus Abschnitt 3 beauftragen, danach
   einen prüfenden. Die Grenzwerte aus Abschnitt 6 und den Bestandsschutz aus Abschnitt 5
   in den Auftrag schreiben, dazu die Fallen aus Abschnitt 7.
