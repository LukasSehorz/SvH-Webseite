# Herkunft: werbetafel.webp

## Quelle

- Plattform: Pexels
- Foto-Seite: https://www.pexels.com/photo/screens-in-city-at-night-18187188/
- Direkter Download-Link (verwendete Originaldatei): https://images.pexels.com/photos/18187188/pexels-photo-18187188.jpeg?cs=srgb&dl=pexels-asia-culture-center-3116378-18187188.jpg&fm=jpg
- Foto-ID: 18187188
- Titel/Beschreibung auf Pexels: "Screens in City at Night" ("Nighttime view of a dynamic urban plaza with a vibrant digital billboard and blurred motion of people walking.")
- Motiv: der beleuchtete LED-Screen-Wuerfel des Asia Culture Center (ACC) in Gwangju, Suedkorea, bei Nacht auf einem oeffentlichen Platz.

## Urheber

- Pexels-Konto: Asia Culture Center
- Profil: https://www.pexels.com/@asia-culture-center-3116378/

## Lizenz

Pexels-Lizenz, abgerufen am 31.08.2026 von https://www.pexels.com/license/:

- "All photos and videos on Pexels are free to use."
- "Attribution is not required. Giving credit to the photographer or Pexels is not necessary but always appreciated."
- Kommerzielle Nutzung ohne Genehmigung erlaubt. Einschraenkungen betreffen nur den unveraenderten Weiterverkauf als Poster/Druck, die Weiterverteilung auf anderen Stockplattformen und die Nutzung, die eine Empfehlung durch abgebildete Personen oder Marken suggeriert. Keine dieser Einschraenkungen betrifft die hier vorliegende, stark bearbeitete Verwendung als Hintergrundbild.

## Abrufdatum

31.08.2026

## Dateien

- `werbetafel-original.jpg` — unbearbeitetes Ausgangsbild wie von Pexels heruntergeladen, 4853 x 3235 px, JPG, ca. 1,7 MB.
- `werbetafel.webp` — aufbereitete Version fuer die Website, 1600 x 900 px (16:9), WebP, ca. 68 KB.

## Aufbereitung (ffmpeg)

Zuschnitt auf den Bildschirm-Wuerfel mit reichlich dunklem Nachthimmel darueber, Skalierung auf 1600 Breite, Entsaettigung, Abdunklung/Kontrast, und Farbstich Richtung Blauviolett in einem Aufruf:

```
ffmpeg -y -i werbetafel-original.jpg -vf "crop=2415:1359:1213:830,scale=1600:900,hue=s=0.34,eq=brightness=-0.10:contrast=1.14:saturation=1.0,colorbalance=rs=-0.08:gs=-0.05:bs=0.18:rm=-0.06:gm=-0.05:bm=0.16:rh=-0.04:gh=-0.03:bh=0.10" -c:v libwebp -q:v 82 werbetafel.webp
```

Erlaeuterung der Filterkette:

- `crop=3864:2174:500:0` — Ausschnitt im Seitenverhaeltnis 16:9 um den leuchtenden Screen-Wuerfel, mit viel dunklem Himmel darueber und ohne die unscharfe Person im Vordergrund unten im Originalbild.
- `scale=1600:900` — Zielgroesse.
- `hue=s=0.45` — Saettigung auf 45 Prozent des Originals reduziert.
- `eq=brightness=-0.10:contrast=1.12:saturation=1.0` — Abdunklung bei gleichzeitig leicht angehobenem Kontrast, damit der Screen als hellster Punkt erhalten bleibt.
- `colorbalance=...` — Farbstich in Schatten, Mitten und Lichtern Richtung Blau/Violett, angelehnt an den Seitenakzent #7c6aff.
- `-c:v libwebp -q:v 82` — WebP-Kodierung mit Qualitaet 82.


## Nachtraegliche Korrektur am 31.08.2026

Der erste Zuschnitt liesz mehr als die halbe Flaeche leeren Nachthimmel stehen, und die Tafel selbst sasz klein im unteren Drittel. Der Ausschnitt ist deshalb auf die Tafel umgerechnet worden, sodass sie rund die Haelfte der Bildbreite traegt. Der engere Ausschnitt schneidet zugleich die Fassadenschrift des Nachbargebaeudes am rechten Rand weg, die zuvor schwach zu lesen war.

Dazu ist die Saettigung von 0,45 auf 0,34 und der Blaustich von 0,14 auf 0,18 gegangen, weil das Bild neben der sehr dunklen, blauviolett gestimmten Sektion noch zu warm stand.

## Zurueckweisung durch den Auftraggeber am 31.08.2026

`werbetafel.webp` ist vom Auftraggeber zurueckgewiesen worden. Das Motiv zeigt den beleuchteten LED-Screen-Wuerfel des Asia Culture Center in Gwangju, eine gebaeudegrosze Flaeche. Der Auftraggeber verkauft aber keine Groszflaechen an Hauswaenden, sondern kleine digitale Werbedisplays in der Groesze eines Menschen oder kleiner, etwa fuer ein Restaurant, ein Ladenlokal oder eine Fuszgaengerzone. Die Datei bleibt liegen, weil der Quelltext der Seite noch darauf zeigt, ist aber nicht mehr zur Verwendung vorgesehen.

Als Ersatz sind vier neue Motive gesucht worden, die den richtigen Maszstab zeigen. Drei davon lieszen sich mit einer frei lizenzierten Quelle und einem passenden Motiv belegen, das vierte nicht. Der Ablauf und alle Einzelheiten stehen unten.

# Herkunft: dooh-1.webp, dooh-2.webp, dooh-3.webp

## Leitgedanke bei der Auswahl

Gesucht waren Fotos von echten digitalen Werbebildschirmen in Menschengroesze oder kleiner, die erkennbar eine Werbebotschaft, eine Aktion oder ein Angebot eines Betriebs zeigen, keine Groszflaechen, keine Fahrgastinformation oder Bedienoberflaeche ohne Werbeinhalt, keine Menschen als Hauptmotiv und keine gut lesbaren fremden Markenlogos.

Ein erster Durchgang hatte zwei Bilder geliefert, die diesen Massstab verfehlten, ein Flughafen-Check-in-Terminal mit Fluglinienlogos (keine Werbung, sondern eine Bedienoberflaeche, dazu fremde Marken) und eine Fahrplananzeige an einer Mailaender Haltestelle (Fahrgastinformation, keine Werbung). Beide sind verworfen und durch die unten stehenden drei Motive ersetzt worden. Fuer die vierte gewuenschte Kategorie, ein weiteres Motiv aus der Reihe, liess sich trotz ausfuehrlicher Suche auf Pexels, Pixabay und Unsplash kein frei lizenziertes Foto finden, das einen echten Werbeinhalt auf einem freistehenden Straszen-Kiosk oder einer Stele zeigt. Die meisten Treffer zu diesem Motiv sind entweder Produktfotos der Hersteller ohne freie Lizenz, Mockup-Grafiken oder Aufnahmen gebaeudegroszer Fassaden. Es sind deshalb nur drei Bilder geliefert worden.

## dooh-1.webp — Werbebildschirm in einer Einkaufspassage

### Quelle

- Plattform: Pexels
- Foto-Seite: https://www.pexels.com/photo/exterior-of-an-illuminated-soda-store-at-night-9418047/ (Foto-ID 9418047)
- Direkter Download-Link (verwendete Originaldatei): https://images.pexels.com/photos/9418047/pexels-photo-9418047.jpeg
- Titel/Beschreibung auf Pexels: "Bright red sale sign in storefront display in Jakarta mall, Indonesia."
- Motiv: ein wandintegrierter digitaler Werbebildschirm mit der Aufschrift "SALE" in einer Einkaufspassage in Jakarta, Indonesien.

### Urheber

- Pexels-Konto: Danny Dharma
- Profil: https://www.pexels.com/@danny-dharma-2792599/

### Lizenz

Pexels-Lizenz, abgerufen am 31.08.2026 von https://www.pexels.com/license/. Gleicher Wortlaut wie oben bei werbetafel.webp dokumentiert, kommerzielle Nutzung frei, keine Namensnennung noetig.

### Abrufdatum

31.08.2026

### Dateien

- `dooh-1-original.jpg` — unbearbeitetes Ausgangsbild, 4000 x 2250 px, JPG.
- `dooh-1.webp` — aufbereitete Version, 1400 x 788 px (16:9), WebP.

### Aufbereitung (ffmpeg)

Das Original stand bereits im Seitenverhaeltnis 16:9, deshalb ohne Zuschnitt direkt skaliert und abgedunkelt:

```
ffmpeg -y -i dooh-1-original.jpg -vf "scale=1400:788,hue=s=0.34,eq=brightness=-0.22:contrast=1.16:saturation=1.0,colorbalance=rs=-0.08:gs=-0.05:bs=0.18:rm=-0.06:gm=-0.05:bm=0.16:rh=-0.04:gh=-0.03:bh=0.10" -c:v libwebp -q:v 82 dooh-1.webp
```

Gegenueber der ersten Kette ist die Abdunklung von brightness=-0.10 auf -0.22 gegangen und der Kontrast von 1.14 auf 1.16, damit die Umgebung wirklich dunkel steht und nur der rote Bildschirm leuchtet.

### Einschaetzung

Der Bildschirm ist wandintegriert in einer Glasfront und nicht auf einem eigenen Standfusz montiert, insofern ist die Uebereinstimmung mit "freistehende Stele" nicht vollstaendig. Er steht aber in einer Einkaufspassage vor einem Laden, zeigt eine echte Werbebotschaft und ist deutlich kleiner als ein Mensch hoch mal breit etwa doppelt so grosz. Kein Markenlogo lesbar, nur eine schwache spiegelverkehrte Reflexion dreier Buchstaben im Glas rechts oben, die keiner erkennbaren Marke zuzuordnen ist.

## dooh-2.webp — Digitales Menueboard in einem Cafe

### Quelle

- Plattform: Pexels
- Foto-Seite: https://www.pexels.com/photo/baristas-preparing-drinks-in-coffee-shop-33890292/ (Foto-ID 33890292)
- Direkter Download-Link (verwendete Originaldatei): https://images.pexels.com/photos/33890292/pexels-photo-33890292.jpeg
- Titel/Beschreibung auf Pexels: "Baristas Preparing Drinks in Coffee Shop", "Two baristas prepare drinks in a modern coffee shop with digital menu screens."
- Motiv: digitale Menueboards ueber der Theke eines Cafes/Bubble-Tea-Ladens in Vietnam, mit Getraenken, Preisen und Aktionsflaeche.

### Urheber

- Pexels-Konto: Việt Anh Nguyễn
- Profil: https://www.pexels.com/@viet-anh-nguyen-2150409023/

### Lizenz

Pexels-Lizenz, abgerufen am 31.08.2026 von https://www.pexels.com/license/. Gleicher Wortlaut wie oben, kommerzielle Nutzung frei, keine Namensnennung noetig.

### Abrufdatum

31.08.2026

### Dateien

- `dooh-2-original.jpg` — unbearbeitetes Ausgangsbild, 6048 x 4032 px, JPG.
- `dooh-2.webp` — aufbereitete Version, 1400 x 788 px (16:9), WebP.

### Aufbereitung (ffmpeg)

```
ffmpeg -y -i dooh-2-original.jpg -vf "crop=5200:2925:400:0,scale=1400:788,hue=s=0.34,eq=brightness=-0.22:contrast=1.16:saturation=1.0,colorbalance=rs=-0.08:gs=-0.05:bs=0.18:rm=-0.06:gm=-0.05:bm=0.16:rh=-0.04:gh=-0.03:bh=0.10" -c:v libwebp -q:v 82 dooh-2.webp
```

Der Zuschnitt sitzt enger als im ersten Versuch, oben bei y=0 beginnend und bei y=2925 endend, damit die Baristas nur noch als Silhouette am unteren Rand stehen und nicht mehr als Hauptmotiv wirken. Abdunklung wie bei dooh-1 auf -0.22 verstaerkt.

### Einschaetzung

Der Bildschirm zeigt ein echtes Angebot, Getraenke, Preise und eine Aktionsflaeche, damit ist die Grundanforderung erfuellt. Zwei Einschraenkungen bleiben bestehen: die Beschriftung ist vietnamesisch und in der Naheinstellung gut lesbar, und eine Mitarbeiterin ist weiterhin im Vordergrund zu sehen, wenn auch nach dem engeren Zuschnitt deutlich kleiner und als Silhouette im Schatten statt als beleuchtete Hauptfigur. Eine Alternative ohne fremde Schrift und ganz ohne Person liess sich unter den frei lizenzierten Treffern nicht finden.

## dooh-3.webp — Schaufensterdisplay vor einem Imbiss

### Quelle

- Plattform: Pexels
- Foto-Seite: https://www.pexels.com/photo/night-view-of-shawarma-house-restaurant-front-33714379/ (Foto-ID 33714379)
- Direkter Download-Link (verwendete Originaldatei): https://images.pexels.com/photos/33714379/pexels-photo-33714379.jpeg
- Titel/Beschreibung auf Pexels: "Night View of Shawarma House Restaurant Front", "Nighttime exterior of Shawarma House with people visible inside."
- Motiv: zwei digitale Werbebildschirme im Eingangsbereich eines Imbiss, von der Strasze aus durch das Schaufenster gesehen, mit Speisekarte, Fotos und Preisen.

### Urheber

- Pexels-Konto: Lukas Kosc
- Profil: https://www.pexels.com/@lukas-kosc-525097851/

### Lizenz

Pexels-Lizenz, abgerufen am 31.08.2026 von https://www.pexels.com/license/. Gleicher Wortlaut wie oben, kommerzielle Nutzung frei, keine Namensnennung noetig.

### Abrufdatum

31.08.2026

### Dateien

- `dooh-3-original.jpg` — unbearbeitetes Ausgangsbild, 3334 x 5001 px, JPG.
- `dooh-3.webp` — aufbereitete Version, 1400 x 788 px (16:9), WebP.

### Aufbereitung (ffmpeg)

```
ffmpeg -y -i dooh-3-original.jpg -vf "crop=3334:1875:0:800,scale=1400:788,hue=s=0.34,eq=brightness=-0.22:contrast=1.16:saturation=1.0,colorbalance=rs=-0.08:gs=-0.05:bs=0.18:rm=-0.06:gm=-0.05:bm=0.16:rh=-0.04:gh=-0.03:bh=0.10" -c:v libwebp -q:v 82 dooh-3.webp
```

Das Originalbild steht im Hochformat. Der Zuschnitt waehlt einen breiten Streifen (volle Bildbreite, Hoehe 1875 ab y=800) so, dass der Schriftzug "HOUSE" ueber der Tuer und beide Bildschirme vollstaendig ins Bild kommen, waehrend die Koepfe der Personen im Eingang darunter auszen vor bleiben. Der obere Teil des Schriftzugs "SHAWERMA" faellt dabei weg.

### Einschaetzung

Beide Bildschirme zeigen eine echte Speisekarte mit Fotos und Preisen, das Motiv ist von der Strasze aus durch ein Schaufenster gesehen und passt damit gut zur Kategorie Schaufensterdisplay. Kein Mensch ist im gewaehlten Ausschnitt mehr zu sehen. Die Eigenmarke "Shawerma House" steht grosz auf der Fassade, das ist der Name des abgebildeten Betriebs selbst, keine fremde Marke.

## Nicht verwendete Kandidaten

- Pexels-Foto 34269878 ("Modern Airport Terminal with Self-Service Kiosks", Zagreb): zeigt eine Reihe freistehender Selbstbedienungsterminals in Menschengroesze, damit stimmte der Maszstab. Verworfen, weil die Bildschirme eine Check-in-Bedienoberflaeche zeigen statt einer Werbebotschaft, weil auf einem der Bildschirme mehrere Fluglinienlogos lesbar sind (Austrian, Turkish Airlines, Croatia Airlines, Lufthansa) und weil die Aufnahme bei Tageslicht insgesamt zu hell fuer die dunkle Bildsprache der Seite ist.
- Pexels-Foto 6772807 ("Bus Stop in Italy", Mailand): zeigt eine orangefarbene Punktmatrix-Anzeige an einer Haltestelle mit Abfahrtszeiten und dem Wort "SCIOPERO". Der Maszstab und die Dunkelheit passten gut, das Motiv ist aber eine Fahrgastinformation der Verkehrsbetriebe und keine Werbung.
- Mehrere Fotos von Drive-Thru-Menueboards (u. a. Pexels 12700809, 30151719, 12055031) zeigen zwar digitale Werbeinhalte, tragen aber erkennbare Kampagnen oder Produktnamen realer Fast-Food-Ketten (etwa eine "Camp Day"-Spendenaktion oder das McDonald's-Logo) und schieden deshalb wegen fremder Markenbotschaften aus.
- Fuer ein freistehendes digitales Werbedisplay auf einem Standfusz in einer Fuszgaengerzone (die urspruengliche erste Kategorie) liess sich trotz breiter Suche kein frei lizenziertes Foto finden. Reale Aufnahmen dieser Geraeteklasse im Straszenraum sind auf Pexels, Pixabay und Unsplash entweder Herstellerfotos ohne freie Lizenz, Mockup-Grafiken mit leerem Bildschirm oder zeigen gebaeudegrosze Fassaden statt kleiner Stelen.
