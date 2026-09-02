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

Alle acht Dateien zusammen wiegen rund 1,0 Megabyte statt der rund 50
Megabyte der Rohaufnahmen. Die vier ganzseitigen Aufnahmen werden
auszerdem erst geholt, wenn die Sektion in die Naehe kommt, und auf
Schirmen unter 860 Bildpunkten Breite gar nicht, dort steht nur der
Kopfbereich.
