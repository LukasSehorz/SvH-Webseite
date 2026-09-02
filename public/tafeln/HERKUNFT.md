# Herkunft der Bilder und Videos unter public/tafeln

Erzeugt am 02.09.2026 ueber kie.ai im Auftrag des Auftraggebers (Lukas
Sehorz), mit dem Skript `_ref3/tafeln-bilder.mjs`. Der Schluessel kommt
aus der Umgebungsvariablen `KIE_KEY` und steht in keiner Datei.

## Bilder

Modell `gpt-image-2-text-to-image`, Aufloesung 2K, danach mit sharp auf
1600 (Orte) beziehungsweise 900 (Spots) Bildpunkte Breite verkleinert und
als WebP mit Qualitaet 82 gespeichert. Die Roh-PNGs sind verworfen.

| Datei | Verhaeltnis | Motiv |
| --- | --- | --- |
| `ort-gym.webp` | 16:9 | Stele in Personengroesze in einem Gym bei Nacht |
| `ort-restaurant.webp` | 16:9 | Stele am Eingang eines Restaurants am Abend |
| `ort-club.webp` | 16:9 | Stele in der Lounge eines Clubs |
| `ort-event.webp` | 16:9 | Stele im Foyer einer Abendveranstaltung |
| `spot-gym.webp` | 9:16 | Inhalt fuer den Schirm, Kettlebell und Kreidestaub |
| `spot-restaurant.webp` | 9:16 | Inhalt fuer den Schirm, angerichteter Teller |
| `spot-club.webp` | 9:16 | Inhalt fuer den Schirm, Lichtkegel und Menge |
| `spot-event.webp` | 9:16 | Inhalt fuer den Schirm, Lichterkette ueber einer Buehne |

Alle Bilder sind synthetisch. Sie zeigen keinen echten Betrieb, keinen
echten Standort und keine echte SVH-Tafel. Der Bildschirm der Stele traegt
absichtlich keine Schrift, damit die Seite ihren gezeichneten Spot darueber
legt. Die Spots lassen das untere Drittel frei, dort setzt die Seite ihre
Worte.

Die genauen Prompts, die Aufgabenkennungen bei kie.ai und die
Ergebnisadressen stehen in `manifest.json` neben den Dateien.

## Videos

Modell `veo3_fast` ueber `POST /api/v1/veo/generate`, Bild zu Video aus
dem jeweiligen Spot, 9:16, sechs Sekunden, geliefert in 720x1280 h264
mit 0,7 bis 2,9 MB je Datei. Zweck: eine ruhige Schleife auf dem Schirm
der Tafel, der auf der Seite rund 300 Bildpunkte breit steht.

Fuer die Auslieferung mit ffmpeg auf 540x960 verkleinert, libx264 mit
crf 27 und faststart, ohne Tonspur. Ergebnis 155 bis 364 kB je Datei.
Die gelieferten Rohfassungen liegen unter `_ref3/tafeln-roh/` und sind
nicht versioniert; Pruefbilder aus jedem Video bei drei und fuenfeinhalb
Sekunden unter `_ref3/tafeln-pruef/`. Alle vier sind angesehen: keine
Schrift, keine Gesichter, Bewegung ruhig wie beauftragt.

| Datei | Groesze | Bewegung |
| --- | --- | --- |
| `spot-gym.mp4` | 352 kB | Kreidestaub treibt durch das Licht |
| `spot-restaurant.mp4` | 364 kB | Dampf steigt vom Teller |
| `spot-club.mp4` | 264 kB | Lichtkegel wandern durch den Dunst |
| `spot-event.mp4` | 155 kB | Lichterkette schwingt leicht |

Einbau: stumm, autoplay, loop, playsInline, `poster` auf die WebP, bei
`prefers-reduced-motion` nur das Bild. Prompts und Kennungen in
`manifest.json`.

## Was diese Bilder ersetzen

Die drei Stockfotos unter `public/stock/dooh-1..3.webp` trugen bisher
Hero, Ortskarten und Band der Unterseite zugleich. Der Designauftrag
`_ref3/brief-werbetafeln.md` nennt diese Wiederholung als groesztes
sichtbares Risiko der Seite. Die vier Ortsbilder und vier Spots hier
loesen das auf. Die Stockfotos bleiben liegen, bis der Werbetafel-Strang
der Landingpage ebenfalls umgestellt ist.

## Kleine Fassungen fuer die Startseite

Am 02.09.2026 mit ffmpeg aus den Spots abgeleitet, Breite 560, Qualitaet
82, gleiches Motiv und gleicher Bildausschnitt.

| Datei | Aus | Zweck |
| --- | --- | --- |
| `spot-gym-560.webp` | `spot-gym.webp` | Stele im Marketing-Strang der Startseite |
| `spot-restaurant-560.webp` | `spot-restaurant.webp` | dieselbe Stele |
| `spot-club-560.webp` | `spot-club.webp` | dieselbe Stele |
| `spot-event-560.webp` | `spot-event.webp` | dieselbe Stele |

Der Grund ist die Bildrate. Der Schirm der Stele ist dort 240 bis 300
Bildpunkte breit; bei doppelter Punktdichte reichen 560. Mit den vollen
Dateien kostete jeder Bildwechsel gemessen ein Bild von 50
Millisekunden, und die Sektion teilt sich den Hauptfaden mit der
WebGL-Struktur. Ein Verkleinern durch next/image half nicht, weil die
Seite auf `images.unoptimized` steht.

Fuer die Unterseite Werbetafeln, wo die Spots grosz stehen, bleiben die
Fassungen mit 900 Bildpunkten die richtigen.
