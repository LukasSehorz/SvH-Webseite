# Herkunft der Bilder unter public/referenzen

Bildschirmaufnahmen der vier laufenden Kundenseiten, die der Auftraggeber
am 01.09.2026 als Referenz freigegeben hat. Aufgenommen bei 1440
Bildpunkten Breite in doppelter Dichte, danach nach WebP gewandelt.

Die Rohaufnahmen als PNG liegen unter `_ref3/webseiten/projekte/`.

| Datei | Seite | Branche |
| --- | --- | --- |
| `brandhuber-hero.webp` | brandhuber.gmbh | Sonnenschutz |
| `world-of-less-hero.webp` | world-of-less.de | Logistik |
| `taxi-izi-hero.webp` | taxi-izi.de | Taxi |
| `innnatur-hero.webp` | innnatur-heilpraktiker.de | Heilpraktik |

Die Dateien mit der Endung `-hero` zeigen den Kopfbereich und werden in
der Sektion Referenzen der Startseite gezeigt. Die Dateien mit der
Endung `-voll` zeigen die ganze Seite und sind fuer die Unterseite
Webseiten gedacht.

Die Aufnahmen werden UNVERAENDERT gezeigt, also weder eingefaerbt noch
zugeschnitten; im Rahmen steht nur die echte Adresse der Seite daneben,
und ein Klick fuehrt dorthin.

Die Rechte an den abgebildeten Seiten liegen bei den jeweiligen
Betrieben. Die Freigabe zur Nennung als Referenz liegt beim
Auftraggeber.

## Wandlung nach WebP, ausgefuehrt am 02.09.2026

Die Rohaufnahmen stehen alle auf 2880 Bildpunkten Breite. Die
ganzseitigen Aufnahmen sind zwischen 14112 und 18646 Bildpunkten hoch und
wiegen als PNG zwischen 5,7 und 10,9 Megabyte. Die Unterseite Webseiten
laeszt alle vier in einem Browserfenster durchlaufen und verspricht auf
derselben Seite schnelle Ladezeiten. Vier Aufnahmen dieser Groesze waeren
der peinlichste denkbare Widerspruch, deshalb die Wandlung.

Der Kopfbereich geht auf 1200 Bildpunkte Breite, weil er nur klein
gezeigt wird, im Kachelfeld des Hero und in der Uebersicht der vier
Projekte. Die ganze Seite geht auf 1400 Bildpunkte, wie im Designauftrag
`_ref3/brief-webseiten.md` unter Abschnitt 7 verlangt.

Je Projekt, mit `<name>` aus brandhuber, world-of-less, taxi-izi und
innnatur:

```
ffmpeg -nostdin -y -i _ref3/webseiten/projekte/<name>-hero.png \
  -vf "scale=1200:-2:flags=lanczos" \
  -c:v libwebp -quality 82 -compression_level 6 \
  public/referenzen/<name>-hero.webp

ffmpeg -nostdin -y -i _ref3/webseiten/projekte/<name>-voll.png \
  -vf "scale=1400:-2:flags=lanczos" \
  -c:v libwebp -quality 76 -compression_level 6 \
  public/referenzen/<name>-voll.webp
```

Erlaeuterung. `scale=...:-2` haelt das Seitenverhaeltnis und rundet die
Hoehe auf eine gerade Zahl. `flags=lanczos` ist beim Verkleinern um mehr
als die Haelfte deutlich schaerfer als der Vorgabefilter, und die
Schrift auf den Kundenseiten muss lesbar bleiben. Die Qualitaet steht
beim Kopfbereich auf 82 und bei der ganzen Seite auf 76, weil die ganze
Seite im Durchlauf immer in Bewegung ist und dort niemand ein Korn
sieht. Es wird nichts eingefaerbt, nichts abgedunkelt und nichts
zugeschnitten, denn die Arbeit soll so aussehen, wie sie ist.

Ergebnis, gemessen:

| Datei | Groesze in Bildpunkten | Dateigroesze |
| --- | --- | --- |
| `brandhuber-hero.webp` | 1200 x 750 | 75 KB |
| `brandhuber-voll.webp` | 1400 x 9064 | 205 KB |
| `world-of-less-hero.webp` | 1200 x 750 | 106 KB |
| `world-of-less-voll.webp` | 1400 x 8674 | 206 KB |
| `taxi-izi-hero.webp` | 1200 x 750 | 84 KB |
| `taxi-izi-voll.webp` | 1400 x 8128 | 158 KB |
| `innnatur-hero.webp` | 1200 x 750 | 58 KB |
| `innnatur-voll.webp` | 1400 x 6860 | 127 KB |

Die vier ganzseitigen Aufnahmen werden erst geholt, wenn die Sektion in
die Naehe kommt, und auf Schirmen unter 860 Bildpunkten Breite gar
nicht, dort steht nur der Kopfbereich.

## Neuaufnahme der ganzen Seiten am 02.09.2026

Die Gesamtpruefung vor dem Livegang hat die vier ganzseitigen Aufnahmen
beanstandet. Sie waren zu 65 bis 74 Prozent strukturlos, denn das erste
Skript hat nur 600 Bildpunkte weit angescrollt und wieder zurueck. Die
Kundenseiten blenden ihre Abschnitte beim Erreichen ein, und was nie
erreicht wurde, blieb unsichtbar. Im Referenzfenster der Unterseite
Webseiten lief deshalb ueber weite Strecken eine leere Flaeche durch.

Die Neuaufnahme steht in `_ref3/projekte-voll.mjs`. Sie faehrt in
Schritten von 380 Bildpunkten mit je 150 Millisekunden Pause bis ganz
nach unten, wartet dort, faehrt zurueck nach oben und wartet danach
noch drei Sekunden. Erst dann wird ausgeloest. Das Skript kann die
Einblendungen zusaetzlich per Stil erzwingen, und diese zweite Fassung
ist verworfen: bei brandhuber.gmbh stand danach das Aufklappmenue der
Kundenseite offen im Bild. Der Durchlauf allein genuegt.

Gemessen wird mit `_ref3/leeranteil.mjs`. Das Bild geht auf 350
Bildpunkte Breite in Graustufen und wird in Baender von 16 Zeilen
geteilt. Ein Band gilt als leer, wenn seine Standardabweichung unter
acht liegt. Der Leeranteil allein sagt wenig, denn Ruhe zwischen zwei
Abschnitten gehoert zum Entwurf der Kundenseite. Aussagekraeftig ist
die laengste zusammenhaengende leere Strecke.

| Datei | Leeranteil vorher | nachher | laengste leere Strecke vorher | nachher |
| --- | --- | --- | --- | --- |
| `brandhuber-voll.webp` | 70,2 % | 16,3 % | 65 Baender | 4 Baender |
| `world-of-less-voll.webp` | 65,2 % | 8,9 % | 35 Baender | 2 Baender |
| `taxi-izi-voll.webp` | 74,0 % | 24,4 % | 60 Baender | 5 Baender |
| `innnatur-voll.webp` | 67,3 % | 24,3 % | 35 Baender | 6 Baender |

taxi-izi.de und innnatur-heilpraktiker.de liegen ueber der Marke von 20
Prozent, und das ist kein Fehler der Aufnahme. Beide Seiten stehen auf
hellem Grund und arbeiten mit sehr groszem Abstand um ihre Abschnitte
herum. Die laengste leere Strecke betraegt dort fuenf beziehungsweise
sechs Baender, also rund 380 Bildpunkte einer ueber 8000 Bildpunkte
hohen Seite. Die Sichtpruefung der Aufnahmen zeigt durchgehend Inhalt.
Der Rueckfall mit stehendem Kopfbereich war deshalb nicht noetig, alle
vier Karten behalten den Durchlauf.

Die Wandlung nach WebP lief mit demselben Aufruf wie oben.

| Datei | Groesze in Bildpunkten | Dateigroesze vorher | nachher |
| --- | --- | --- | --- |
| `brandhuber-voll.webp` | 1400 x 9064 | 205 KB | 656 KB |
| `world-of-less-voll.webp` | 1400 x 8674 | 206 KB | 478 KB |
| `taxi-izi-voll.webp` | 1400 x 8128 | 158 KB | 488 KB |
| `innnatur-voll.webp` | 1400 x 6860 | 127 KB | 333 KB |

Die Dateien wiegen jetzt zusammen rund 1,9 statt 0,7 Megabyte. Der
Aufschlag ist der Inhalt, der vorher gefehlt hat, und er faellt erst
an, wenn die Sektion in die Naehe kommt.
