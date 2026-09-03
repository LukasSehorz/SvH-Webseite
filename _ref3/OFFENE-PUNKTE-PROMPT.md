# Auftrag: Offene Punkte der SVH-Consulting-Website nach dem Livegang-Feinschliff

Du arbeitest an der Website von SVH Consulting im Verzeichnis
`c:\Users\lukas\OneDrive\Desktop\KI-Agentur\Webseite\Webseite neu`
(Next.js 16, React 19, TypeScript, Tailwind v4, GSAP, framer-motion,
three.js). Repo `https://github.com/LukasSehorz/SvH-Webseite.git`,
Branch `main`, letzter Stand Commit `c5266ae`.

Lies zuerst `PRODUCT.md` (Produktakte), dann `_ref2/UEBERGABE.md`
(Uebergabe eines frueheren Agenten), dann den Gesamtpruefbericht unter
`_ref2/mess/pruef-gesamt/` samt Aufnahmen. Jede Seite traegt als ersten
Kommentar ihrer `page.tsx` einen Bauvertrag; die Designauftraege der
Unterseiten liegen unter `_ref3/brief-webseiten.md` und
`_ref3/brief-werbetafeln.md`. Alle sichtbaren Texte stehen in
`app/copy.ts`.

## Feste Regeln dieses Projekts

- Sichtbarer Text und Kommentare auf Deutsch. Keine
  Doppelpunkt-Konstruktionen, keine Bindestrich-Einschuebe, keine
  abgehackten Kurzsaetze mit Verneinungen. Kommentare ohne Umlaute
  (ae, oe, ue, sz), in ganzen Saetzen, die festhalten, warum ein Wert so
  steht und welche Messung ihn traegt.
- Massstab des Auftraggebers, woertlich: die Seite muss so verstaendlich
  sein, dass ein Kind begreift, worum es geht, und zugleich auf
  Awwwards-Niveau stehen. Lieber kuerzen als erklaeren.
- Keine erfundenen Angaben. Belegt sind allein 35+ umgesetzte Projekte,
  die zwanzig Minuten des Erstgespraechs, die Gruender Lukas Sehorz und
  Jannik vom Hofe, der Sitz Zangberg, die vier Referenzprojekte. Alles
  mit `❗TODO` in copy.ts ist eine bewusste Luecke und darf nirgends
  gerendert werden.
- Die DNA-Partikelstruktur hinter der Marketing-Sektion
  (`app/components/marketing/DnaBand.tsx`, `DnaZone.tsx`) ist abgenommen
  und bleibt in Muster, Bewegung, Lage und Helligkeit unangetastet.
- Hoechstens drei Bauagenten gleichzeitig, besser einer. Jeder baut mit
  eigenem `NEXT_DIST_DIR` und eigenem Port, niemals `next dev`, und
  beendet seinen Server am Ende ueber die Prozessnummer. Der Prozess ist
  bei mehr gleichzeitigen Builds dreimal abgestuerzt.
- Screenshots ausschliesslich ueber `_ref2/browser.mjs` (`starten()` und
  `aufraeumen()`). Niemals `taskkill` auf einen Namen, niemals
  `chrome.exe` beenden, der Auftraggeber arbeitet im selben Chrome.
- Arbeitsweise: ein Builder baut, ein Pruefer macht Screenshots bei 1440,
  2560 und 390, sieht sie an und liefert eine Maengelliste, der Builder
  behebt, so lange, bis nichts Wesentliches mehr uebrig ist. Vor jedem
  Abschluss `npx tsc --noEmit`, Build, kein waagerechter Ueberlauf,
  `node C:\Users\lukas\.claude\skills\impeccable\scripts\detect.mjs --json app`.

## Teil A. Angaben, die nur der Auftraggeber liefern kann

Frag ihn zu Beginn in einer einzigen Runde nach allem und bau erst
danach. Nichts davon erfinden, nichts als Platzhalter sichtbar machen.

1. **E-Mail-Adresse.** `kontakt@svh-consulting.de` steht auf jeder Seite
   und im Impressum (`app/content.ts` Zeile 15). Der Auftraggeber hat
   gesagt, das sei nicht die richtige Adresse, aber keine genannt.
2. **Domain.** `https://svh-consulting.de` in `app/robots.ts`,
   `app/sitemap.ts`, `app/layout.tsx` (metadataBase). Vorerst nicht
   wichtig laut Auftraggeber, vor der Indexierung aber zu bestaetigen.
3. **Kontaktformular.** `app/components/pages/ContactForm.tsx` ist
   fertig gebaut, aber ohne Empfaenger und deshalb nicht gerendert; an
   seiner Stelle zeigt `ContactDirect.tsx` Telefon und E-Mail. Sobald
   ein Versandweg feststeht (Resend mit `RESEND_API_KEY` als
   Umgebungsvariable beim Hoster, oder ein anderer), einen Route Handler
   bauen und das Formular wieder einhaengen. Kein Schluessel im Code.
4. **Kurzprofile und Portraets** von Lukas Sehorz und Jannik vom Hofe.
   In `app/copy.ts` unter `aboutPage` stehen zwei Zeilen
   `❗TODO Kurzprofil ergaenzen`; `TeamBlock.tsx` blendet Zeilen aus,
   die mit `❗` beginnen. Texte eintragen, Bilder unter `public/team/`
   als WebP, Initialenmarke durch Portraet ersetzen.
5. **Rechtstexte.** Impressum, Datenschutz und AGB sind Entwuerfe und
   tragen den Hinweis "Dieser Text ersetzt keine Rechtsberatung"
   (`app/components/pages/DarkLegalPage.tsx`). Nach anwaltlicher
   Pruefung den Hinweis entfernen.
6. **Werbetafeln.** Standorte, Buchungszeitraeume, Preisrahmen fehlen
   (`❗TODO` in `marketingDna` und `werbetafelnPage` in copy.ts). Sobald
   sie vorliegen, auf `/marketing/werbetafeln` eine Sektion "Wo die
   Tafeln stehen" mit echten Orten bauen; bis dahin bleibt die Seite mit
   Ortsarten (Gym, Restaurant, Club, Event) vollstaendig.
7. **Kennzahlen.** Reichweiten, Klickpreise, Beispielergebnisse,
   Kundenstimmen gibt es nicht. Die Sektion "Warum eine gute Webseite"
   auf `/marketing/webseiten` und die Ringe der Marketing-Sektion sind
   so gebaut, dass sie ohne Umbau zu Zahlenbaendern werden, sobald
   belegte Werte vorliegen.

## Teil B. Feinschliff aus dem Gesamtpruefbericht, bewusst offen gelassen

Reihenfolge nach Wirkung. Zu jedem Punkt liegt eine Aufnahme unter
`_ref2/mess/pruef-gesamt/`.

1. **`/marketing` wirkt als Vorlage** (Punkt 7 des Berichts, Aufnahmen
   `2560-marketing-00.png`, `1440-marketing-01.png`). Bei 2560 fuellen
   Ueberschrift und Absatz das linke Viertel, der Rest ist schwarz, im
   ersten Bildschirm steht kein Weg ins Gespraech, darunter drei gleiche
   Karten. Vorschlag: ein Schaustueck oder wenigstens den Knopf in den
   Hero, die drei Karten in drei unterschiedlich gebaute Bloecke
   aufloesen, so wie die drei Straenge auf der Startseite es vormachen.
2. **Leere Haelften auf weiten Schirmen** (Punkt 8, Aufnahmen
   `2560-ueber-uns-00.png`, `2560-kontakt-01.png`). `/kontakt` legt bei
   2560 das Feld in die linken 37 Prozent; `/ueber-uns` endet bei rund
   35 Prozent; die Straenge-Grafik steht in den mittleren vierzig
   Prozent. Vorschlag: auf `/kontakt` Kontaktdaten und Karten neben den
   Block statt darunter; auf `/ueber-uns` die Straenge-Grafik in den
   Hero holen und mit der Schale mitwachsen lassen.
3. **Team ohne Gesicht** (Punkt 11, `1440-ueber-uns-05.png`). Haengt an
   Teil A Punkt 4. Bis die Profile da sind, waere die ehrlichere Loesung,
   die leeren Initialenkacheln wegzulassen und nur die Namen unter dem
   Satz zu Zangberg zu zeigen.
4. **`/ki` zeigt die acht Aufgaben zweimal** (Punkt 15, `1440-ki-00.png`,
   `1440-ki-01.png`). Kacheln oben, dieselben acht als Liste darunter,
   der einzige Zuwachs ist ein Satz. Vorschlag: den Satz in die Kachel
   holen und die Liste streichen.
5. **Zwei der drei Ringe tragen keine Aussage** (Punkt 21,
   `1440-start-08.png`). "1 Regionaler Ansprechpartner" und "3 Bausteine"
   zaehlen die eigene Gliederung. Vorschlag: nur den belegten Ring 35+
   grosz, die beiden anderen Aussagen als Satz daneben.
6. **Vier Ortsaufnahmen zeigen dieselbe abstrakte Welle** auf dem Schirm
   (`x-red-tafeln-1.png`). Die Bilder unter `public/tafeln/ort-*.webp`
   sind bewusst mit leerem Schirm erzeugt. Vorschlag: den jeweiligen
   Spot (`public/tafeln/spot-*.webp`) per CSS auf die Schirmflaeche im
   Foto legen (Position je Bild von Hand messen), damit die Seite haelt,
   was sie sagt.
7. **Bildrate auf einem 60-Hz-Schirm nachmessen.** Der Pruefrechner
   taktet mit 30 Hz, deshalb war p50 ueberall 33,3 ms und nicht
   beurteilbar. `_ref2/rate.mjs` auf einer Maschine mit 60 Hz laufen
   lassen, Ziel p50 unter 20 ms auf der Startseite ueber der
   WebGL-Struktur.
8. **Sicherheit und Betrieb vor dem Livegang.** Hoster und
   Umgebungsvariablen anlegen (kein Schluessel im Repo, `.env` ist
   ignoriert), `next build` auf dem Hoster pruefen, `robots.ts` und
   `sitemap.ts` auf die endgueltige Domain, Open-Graph-Bild unter
   `public/` erzeugen und in `layout.tsx` eintragen (fehlt bisher),
   Favicon pruefen (`app/icon.svg` vorhanden), 404-Seite gestalten
   (`/_not-found` ist unverändert Standard).

## Was sitzt und nicht angetastet werden darf

Die DNA-Struktur; die Kugel im Hero von `/marketing/social-media`; die
sechs Kachelszenen der Startseite und die acht auf `/ki`; die
Ablauf-Sektion mit ihren drei Zustaenden; die Kurvengrafik in Sektion
01 samt mobiler Legende; das Referenzkarussell der Startseite; der Hero
von `/marketing/webseiten` mit der Fensterwand; die Stele und die
Ortsbilder auf `/marketing/werbetafeln`; die Straenge-Grafik auf
`/ueber-uns`; die Fusszeile mit Wortmarke; die gesamte Verweisstruktur
(175 Verweise, 23 Anker, alle geprueft); das Verhalten bei reduzierter
Bewegung; die Textfassung vom 02.09.2026 (Fachwoerter und unbelegte
Angaben sind bewusst entfernt und duerfen nicht zurueckkommen).

## Abschluss jeder Runde

`npx tsc --noEmit` sauber, `NEXT_DIST_DIR=.next-mess npx next build`
sauber, alle Routen mit Status 200, kein waagerechter Ueberlauf bei
390, 768, 1440, 2560, Screenshots angesehen, dann Commit auf `main`
mit deutscher Beschreibung, was und warum, und Push.
