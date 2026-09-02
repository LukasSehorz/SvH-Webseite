"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Der verdrehte Streifen                                             */
/*                                                                     */
/*  Das Bild, das die Struktur zeigen soll: man nimmt einen langen,     */
/*  flachen, elastischen Streifen aus lauter schmalen Bahnen, haelt ihn */
/*  an beiden Enden hoch und verdreht ihn EINMAL. Oben faechert er      */
/*  breit auf, in der Mitte schnuert ihn die Verdrehung zu einer Taille */
/*  zusammen, unten faechert er wieder auf.                            */
/*                                                                     */
/*  Ein Irrweg, damit ihn niemand wiederholt: die gleichmaeszige Wendel */
/*  mit 1,9 Windungen. Dabei stehen ueber die Bandlaenge fast vier      */
/*  Einschnuerungen, mehrere davon gleichzeitig im Bild. Das liest als  */
/*  fortlaufende Spirale, nicht als einmal verdrehter Streifen.        */
/*                                                                     */
/*  Was traegt: eine in der Bandmitte GEBUENDELTE Verdrehung, dazu eine */
/*  davon unabhaengige elastische Verjuengung an derselben Stelle. Die  */
/*  Begruendung samt Messung steht unten bei TWIST_KNOT.               */
/*                                                                     */
/*  Aufbau. Ein Punkt sitzt bei (u, s): u laeuft die Achse hinauf und   */
/*  bestimmt den Windungswinkel, s laeuft quer ueber den Streifen von   */
/*  Kante zu Kante. Gezeichnet auf der Grafikkarte, weil das Gewebe     */
/*  Zehntausende Punkte braucht, um dicht zu bleiben.                   */
/*                                                                     */
/*  DAS BAND IST ENDLOS, DAS BILD IST EIN FENSTER DARIN.               */
/*                                                                     */
/*  Das ist der tragende Satz der jetzigen Fassung. Die Struktur ist    */
/*  ein periodisches Gewebe mit einer Taille je Periode, und das Bild   */
/*  faehrt beim Scrollen durch dieses Gewebe hindurch. Die Punkte       */
/*  wickeln sich laufend ins Fenster zurueck und verlassen es deshalb   */
/*  nie. Die Rechnung dazu steht im Vertex-Shader bei platz und ph.     */
/*                                                                     */
/*  Der Auftraggeber hat den Grund dafuer selbst benannt. Die Struktur  */
/*  sasz bis dahin fest im Layout, weil jede Verschiebung des Flusses   */
/*  die Flaeche exakt auf sich selbst abbildete; man kam beim Scrollen  */
/*  nicht weiter herunter. Die Referenz macht es anders, siehe          */
/*  _ref2/ref26/f007.png in Ruhe gegen f030.png beim Scrollen, wo die   */
/*  Taille oben aus dem Bild gewandert ist und nur noch der untere      */
/*  Faecher steht.                                                     */
/*                                                                     */
/*  IN RUHE STEHT DIE GEOMETRIE TROTZDEM STILL, DIE TEXTUR FLIESZT.    */
/*                                                                     */
/*  Das ist der tragende Satz dieser Fassung und er ist gemessen. Ueber */
/*  sieben Ruhebilder der Referenz (_ref2/ref26/f006 bis f012) liegt    */
/*  die Taille sechsmal bei 52,0 Prozent der Bildhoehe, die Halslaenge  */
/*  fuenfmal bei 26 Bildpunkten und die Oeffnungswinkel bei 58 bis 65   */
/*  Grad oben und 67 bis 71 Grad unten. Die Silhouette der Referenz     */
/*  aendert sich ueber Sekunden also nicht. Bewegt wird allein die      */
/*  feine Punkttextur INNERHALB des Gewebes.                           */
/*                                                                     */
/*  EINE WARNUNG ZU DIESEN DREI ZAHLEN, damit sie niemand fuer bare     */
/*  Muenze nimmt. Die Ueberschrift der Referenz steht mitten im         */
/*  Meszfenster und ueberlappt das Gewebe unmittelbar oberhalb der      */
/*  Taille. hals.mjs bildet die Streuung aller Maskenzellen einer Zeile */
/*  um deren Schwerpunkt, und weisze Schrift auf dunklem Grund faellt   */
/*  in dieselbe Hochfrequenzmaske wie das Punktraster. Uebermalt man in */
/*  den Referenzbildern nur den Schriftblock schwarz, springt dieselbe  */
/*  Messung von 52,0 auf 44,6 bis 54,5 Prozent, die Halslaenge von      */
/*  26 auf 9 bis 44 Bildpunkte und der obere Oeffnungswinkel von 58 bis */
/*  65 auf 5 bis 54 Grad. Die drei Zahlen beschreiben also zu einem     */
/*  guten Teil die Schrift der Referenz und nicht ihr Gewebe.          */
/*                                                                     */
/*  Belastbar ist kante.mjs, weil es Zeilen verwirft, deren linke Kante */
/*  links von 45 Prozent liegt, und damit die Schrift ausschlieszt. Die */
/*  linke Gewebekante der Referenz steht dort oben bei 55,6 und unten   */
/*  bei 54,1 Prozent, die Achse oben bei 73,8. Gegen DIESE Zahlen ist   */
/*  die Form hier eingestellt.                                         */
/*                                                                     */
/*  Wer stattdessen die ganze Flaeche dreht, bekommt zwangslaeufig eine */
/*  atmende Silhouette. Die Materialtaille sitzt fest bei u = 0,5, die  */
/*  Blickwinkel-Taille steht dort, wo das Band dem Betrachter die Kante */
/*  zudreht. Laeuft eine Drehlage mit, wandern die beiden mit Drehrate  */
/*  durch TWIST laengs der Bandkoordinate auseinander. Nachgemessen an  */
/*  der vorigen Fassung ueber zwoelf Sekunden ohne Scroll: die Taille   */
/*  stieg von 42,2 auf 20,0 Prozent der Bildhoehe, die Halslaenge fiel  */
/*  von 192 auf 52 Bildpunkte, der obere Oeffnungswinkel von 16 auf 7   */
/*  Grad und die linke Gewebekante lief oben von 64,4 auf 73,3 Prozent  */
/*  davon, waehrend sie unten von 53,3 auf 46,7 zurueckging. Die Form   */
/*  war also nicht eingestellt, sondern unterwegs.                     */
/*                                                                     */
/*  Deshalb ist die Drehlage jetzt FEST. Die Ruhebewegung entsteht      */
/*  dadurch, dass die Punkte LAENGS des Bandes ueber die stehende       */
/*  Flaeche wandern. Weil die Menge ihrer Bandkoordinaten eine ganze    */
/*  Periode zu jedem Zeitpunkt lueckenlos und ohne Ueberschneidung      */
/*  ueberdeckt, bleibt die Flaeche als Ganzes stehen, waehrend die      */
/*  einzelnen Punkte samt Farbe und Helligkeit ueber sie hinweglaufen.  */
/*                                                                     */
/*  Genau diese Eigenschaft hiesz frueher, die Struktur lasse sich      */
/*  durch kein Nachstellen von Zahlen zum Wandern bringen. Das ist mit  */
/*  dem endlosen Band aufgeloest, und zwar ohne die Ruhe aufzugeben.    */
/*  Der Flusz bewegt die Punkte durch das Muster und laeszt die Form    */
/*  stehen, der Weltversatz bewegt das Muster durch das Fenster und     */
/*  laeszt die Punkte im Bild. Beides sind verschiedene Groeszen, und   */
/*  in Ruhe laeuft allein die erste.                                    */
/* ------------------------------------------------------------------ */

/** Sprossen laengs der Achse und Punkte je Sprosse.
 *
 *  Das Verhaeltnis der beiden Zahlen entscheidet ueber das RASTER, denn
 *  der Abstand der Reihen ist die Bandlaenge geteilt durch N_U und der
 *  Abstand der Spalten die Bandbreite geteilt durch N_S. Beide Zahlen
 *  muessen deshalb mitwandern, sobald sich der Maszstab uUnit aendert.
 *
 *  Die Sprossen liegen bei i geteilt durch N_U und NICHT bei i geteilt
 *  durch N_U minus eins. Der Unterschied ist winzig und trotzdem
 *  entscheidend, seit die Bandkoordinate umlaeuft. Mit dem alten Nenner
 *  faellt die letzte Sprosse bei u gleich eins nach dem Umlauf genau auf
 *  die erste bei u gleich null; diese eine Reihe wuerde doppelt
 *  gezeichnet und liefe als heller Strich durch das ganze Gewebe. Mit
 *  dem neuen Nenner liegen alle N_U Sprossen nach dem Umlauf wieder auf
 *  einem gleichmaeszigen Raster und keine faellt mit einer anderen
 *  zusammen. */
/*  Die Zahlen standen bei 216 und 25 und stuetzten sich auf eine Messung,
 *  die nur die ZEILE dy gleich null und die SPALTE dx gleich null der
 *  Autokorrelation abgesucht hat. Diese Messung meldete fuer die Referenz
 *  senkrecht eine Periode von 5,1 und waagerecht einen Buckel bei 16, und
 *  genau darauf sind 216 und 25 eingestellt worden. Nachgemessen trifft
 *  unser Gewebe diese beiden Achsenwerte auch, naemlich mit dx gleich 15
 *  und dy gleich 5 im Fenster 620,100,420,420.
 *
 *  Die beiden Achsenwerte sagen ueber ein Gitter fast nichts aus. Ein
 *  Gitter mit den Basisvektoren (15, 0) und (0, 5) und eines mit (15, 0)
 *  und (3, 5) liefern dieselbe Zeile und dieselbe Spalte, sehen im Bild
 *  aber vollkommen verschieden aus. Das erste liest als senkrecht
 *  haengende Perlenschnuere mit breiten dunklen Gassen, das zweite als
 *  flach diagonal laufendes dichtes Gewebe. Unseres war das erste, die
 *  Referenz ist das zweite.
 *
 *  Deshalb ist mit _ref2/gitter.mjs die volle Ebene der Verschiebungen
 *  abgesucht und daraus das Paar der beiden kuerzesten Gittervektoren
 *  bestimmt worden. Gemessen an vier Stellen der Referenz f006, alle in
 *  deren eigenen Bildpunkten, mit dy nach unten positiv.
 *      oberer Lappen 700,152    b1 = (-3,09; 1,01)  b2 = (-0,37; 5,64)
 *      oberer Lappen 820,200    b1 = (-3,70; 1,23)  b2 = ( 1,55; 4,94)
 *      unter der Taille 700,440 b1 = (-2,69; 1,09)  b2 = ( 1,50; 4,86)
 *      unterer Lappen 640,540   b1 = (-4,05; 1,05)  b2 = ( 2,53; 4,05)
 *  Der kurze Vektor b1 ist die dichte Kette, er misst 2,9 bis 4,2
 *  Bildpunkte und steigt nach rechts um 14 bis 22 Grad an. Der zweite
 *  Vektor traegt den Abstand von einer Kette zur naechsten und steht mit
 *  4,8 bis 5,7 Bildpunkten fast senkrecht. Die Masche des Gitters misst
 *  damit 14,7 bis 20,2 Quadratbildpunkte, im Mittel 17,8.
 *
 *  Dieselbe Messung an unserem Stand ergab b1 gleich (0; 4,5) senkrecht
 *  und b2 gleich (-15,4; 4,4) waagerecht, also eine Masche von 52 bis 70
 *  und im Mittel 61,9 Quadratbildpunkten. Wir waren damit um den Faktor
 *  3,5 zu duenn, nicht um die vierzig Prozent, die eine Zaehlung ueber
 *  oertliche Hoechstwerte nahelegt. Diese Zaehlung unterschaetzt die
 *  Referenz, weil deren Punkte nur 3,1 Bildpunkte auseinanderstehen und
 *  in einer Umgebung von drei mal drei Bildpunkten zusammenfallen. Am
 *  Bild nachgezaehlt stehen in einem Ausschnitt von 44 mal 44
 *  Bildpunkten der Referenz rund 112 Punkte und bei uns rund 30.
 *
 *  Aus den beiden Perioden folgten zuerst 192 und 100. Dieser Stand ist
 *  nachgemessen worden, und zwar an denselben vier Stellen der Referenz
 *  und an den entsprechenden Stellen unserer eigenen Aufnahme, beide auf
 *  Referenzmaszstab. Die Masche traf damit bereits: die Referenz liegt
 *  ueber ihre vier Stellen bei 17,8 / 20,1 / 15,4 / 19,4 und im Mittel
 *  bei 18,2 Quadratbildpunkten, wir lagen bei 19,9 / 18,3 / 14,2 / 18,4
 *  und im Mittel bei 17,7. Was NICHT traf, war die Aufteilung dieser
 *  Masche auf ihre beiden Seiten. Der kurze Kettenvektor b1 misst bei der
 *  Referenz 3,28 / 3,86 / 2,92 / 4,24 und im Mittel 3,58 Bildpunkte, bei
 *  uns dagegen 4,00 / 4,14 / 3,74 / 4,18 und im Mittel 4,02. Der
 *  senkrechte Sprossenvektor b2 misst bei der Referenz 5,47 / 5,24 /
 *  5,28 / 4,77 und im Mittel 5,19, bei uns 5,13 / 5,13 / 5,06 / 5,42.
 *  Das Verhaeltnis der beiden Seiten steht bei der Referenz auf 1,45 und
 *  stand bei uns auf 1,12. Ihr Gewebe ist also deutlich staerker
 *  gestreckt als unseres, und genau daran haengt der sichtbare
 *  Unterschied: bei der Referenz beruehren sich die Punkte LAENGS der
 *  Kette und bilden kurze Striche, waehrend zwischen den Ketten eine
 *  dunkle Gasse frei bleibt. Bei uns standen sie in beiden Richtungen
 *  gleich weit auseinander und lasen deshalb als quadratisches Punktgitter.
 *
 *  Die neuen Zahlen folgen daraus unmittelbar. Der Sprossenvektor haengt
 *  allein an N_U und muss um den Faktor 5,47 / 5,13 = 1,066 laenger
 *  werden, also N_U = 192 / 1,066 = 180. Der Kettenvektor muss um den
 *  Faktor 3,28 / 4,00 = 0,82 kuerzer werden; nachgerechnet mit
 *  _ref2/schermodell.mjs liefert N_S = 120 bei N_U = 180 an der Stelle
 *  u = 0,28 einen Kettenvektor von 3,51 Bildpunkten unter 17 Grad und
 *  eine Masche von 18,1. Das Modell liegt gegenueber der Messung an der
 *  fertigen Seite durchgaengig fuenf Prozent hoch, die erwartete Messung
 *  lautet also 3,33 Bildpunkte und Masche 17,7 gegen die 3,28 und 17,8
 *  der Referenz.
 *
 *  EINE ZAEHLUNG UEBER OERTLICHE HOECHSTWERTE TAUGT HIER NICHT, und das
 *  ist teuer nachgewiesen. Sie meldet im Fenster 880,98,120,120 fuer uns
 *  637 Punkte und fuer die Referenz nur 306, legt also nahe, wir seien
 *  doppelt so dicht. Probeweise auf N_U = 133 und N_S = 69 gesetzt trifft
 *  unsere Zaehlung die Referenz mit 305 gegen 306 Punkten und einem
 *  mittleren Abstand von 6,87 gegen 6,86 Bildpunkten praktisch exakt.
 *  Dieselbe Aufnahme zeigt dann aber eine Masche von 40,3 gegen die 17,8
 *  der Referenz, die Autokorrelation bei Versatz zwoelf faellt von 0,38
 *  auf minus 0,05 gegen 0,59 der Referenz, und in der
 *  Zwoelffachvergroeszerung stehen einzelne Punkte mit breiten leeren
 *  Feldern dazwischen statt eines Gewebes. Die Zaehlung unterschaetzt die
 *  Referenz, weil deren Punkte laengs der Kette ineinanderlaufen und in
 *  einer Umgebung von drei mal drei Bildpunkten nur einen Hoechstwert
 *  hinterlassen. Verbindlich ist deshalb die Masche aus der
 *  zweidimensionalen Autokorrelation, und die ist am Bild nachgezaehlt
 *  bestaetigt.
 *
 *  Die Punktzahl steigt damit von 19 200 auf 21 600. Die Helligkeit je
 *  Punkt geht im Gegenzug zurueck, siehe den Grundfaktor in vLit.
 *
 *  Die Teilung geht ein zweites Mal hoch, von 180 mal 120 auf 240 mal 160
 *  und damit von 21 600 auf 38 400 Punkte. Der Anlasz ist die
 *  Nahaufnahme _ref2/vid28/v040.jpg, auf der viele feine Reihen dicht
 *  beieinander stehen, waehrend unser Stand vom 27. August in derselben
 *  Vergroeszerung wenige fette Reihen mit breiten leeren Gassen zeigte.
 *  Gemessen lag der Reihenabstand im Fenster 620,100,420,420 bei uns bei
 *  15 Bildpunkten und faellt mit der neuen Teilung auf 11,3.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) ist dabei mit Bedacht erhalten
 *  geblieben. An ihm haengt die Richtung der diagonalen Ketten, und die
 *  ist eine gewachsene Eigenschaft des Musters, die mit der Dichte nicht
 *  wandern darf. Vorher stand es bei 119 / 360 gleich 0,3306, jetzt bei
 *  159 / 480 gleich 0,3313.
 *
 *  Die Rechenzeit bleibt stehen, weil die Scheibe im selben Zug von 20
 *  auf 14 Bildpunkte zurueckgeht. Die Zahl der Fragmente ist das Produkt
 *  aus Punktzahl und Scheibenflaeche und faellt damit von 6,8 auf 5,9
 *  Millionen.
 *
 *  Die Teilung geht ein drittes Mal hoch, auf 300 mal 200 und damit auf
 *  60 000 Punkte. Der Anlasz ist die Gegenueberstellung unserer
 *  Nahaufnahme mit _ref2/vid28/v040.jpg: bei 240 mal 160 las das Gewebe
 *  noch als eine Folge einzelner Boegen mit dunklen Gassen dazwischen,
 *  waehrend die Referenz ein durchgehendes feines Netz zeigt, in dem die
 *  einzelnen Punkte trotzdem zu erkennen bleiben. Der Reihenabstand faellt
 *  damit von 11 auf 9 Bildpunkte im Fenster 620,100,420,420.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) bleibt auch hier erhalten und
 *  steht bei 199 / 600 gleich 0,3317 gegen die 0,3306 des Ursprungs, die
 *  Richtung der diagonalen Ketten wandert also nicht.
 *
 *  Die Bildrate traegt das. Gemessen am Bau mit 38 400 Punkten lag sie bei
 *  p50 gleich 16,7 und p95 gleich 16,8 Millisekunden, also am Anschlag der
 *  Bildwiederholung, und alle fuenf Ausreiszer lagen in der ersten Sekunde
 *  und stammen vom Uebersetzen der Schattierer. Die Fragmentlast bleibt
 *  zudem stehen, weil die Scheibe im selben Zug von 14 auf 12 Bildpunkte
 *  zurueckgeht: 60 000 mal der Flaeche einer Scheibe von sechs Bildpunkten
 *  Halbmesser sind 6,8 Millionen und damit genau so viele wie im
 *  Ausgangsstand.
 *
 *  DIE TEILUNG GEHT JETZT WIEDER HERUNTER, UND ZWAR DEUTLICH, VON 300 MAL
 *  200 AUF 134 MAL 90. Das ist die Umkehrung der drei vorangegangenen
 *  Erhoehungen, und der Grund dafuer ist eine Messung an einer LIVE
 *  aufgenommenen Referenz statt an Videobildern. Die Videobilder haben
 *  eingefrorene Abschnitte und taugen fuer diese Frage nicht.
 *
 *  Im Fenster 1050,160,180,180 bei 1440 mal 900 zaehlt die Referenz 143
 *  Punkte je 100 mal 100 bei einem mittleren Punktabstand von 8,36
 *  Bildpunkten, wir zaehlten dort 240 bei 6,45. Der Befund liegt tiefer
 *  als diese beiden Zahlen. Bei 300 mal 200 stehen unsere Spalten nur
 *  2,95 Bildpunkte auseinander, und das liegt unter der Grenze, bis zu
 *  der ein Auge auf Armlaenge zwei Punkte noch trennen kann. Die
 *  Referenz liest deshalb als Gitter aus einzeln erkennbaren Punkten in
 *  klaren Reihen, unser Stand dagegen als Sprenkelfeld ohne Ordnung.
 *
 *  Mit 134 mal 90 stehen die Sprossen 10,7 und die Spalten 6,55
 *  Bildpunkte auseinander, beides also weit oberhalb der Trennschwelle.
 *  Die Punktzahl faellt von 60 000 auf 12 060.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) bleibt auch bei dieser Umkehr
 *  erhalten und steht mit 89 / 268 gleich 0,3321 gegen die 0,3317 des
 *  vorigen Standes. An ihm haengt die Richtung der diagonalen Ketten,
 *  und die darf mit der Dichte nicht wandern.
 *
 *  NACHGEMESSEN GEHT DIE TEILUNG ZU WEIT HERUNTER, und sie steht deshalb
 *  am Ende bei 182 mal 122 und nicht bei 134 mal 90. Die Vorgabe von 134
 *  mal 90 stammt aus einer Gipfelzaehlung, und die unterschaetzt die
 *  Referenz, weil deren Punkte laengs der Kette ineinanderlaufen und in
 *  einer Umgebung von drei mal drei Bildpunkten nur einen gemeinsamen
 *  Hoechstwert hinterlassen. Genau davor warnt der Absatz weiter oben
 *  schon einmal.
 *
 *  Zwei voneinander unabhaengige Messungen stimmen darin ueberein. Die
 *  Autokorrelation liefert fuer die Referenz im Fenster 1050,160,180,180
 *  eine Zellflaeche von 38,0 Bildpunkten im Quadrat und damit einen
 *  mittleren Punktabstand von 6,16; bei 134 mal 90 masz unsere Zelle 189
 *  und der Abstand 13,75, also das Fuenffache der Flaeche. Die
 *  Gipfelzaehlung von _ref2/mess/gipfelprofil.mjs liefert fuer die
 *  Referenz 143,2 Punkte je 100 mal 100 und fuer uns nur 77,8. Beide
 *  verlangen rund 22 000 Punkte statt der 12 060.
 *
 *  Ein Zwischenstand mit 182 mal 122 gleich 22 204 Punkten traf mit 176,9
 *  Punkten je 100 mal 100 dann ueber das Ziel hinaus, denn mit dem
 *  breiteren Kern und dem flachen Wuerfel kommen mehr schwache Punkte
 *  ueber die Nachweisschwelle als vorher. Am Ende stehen deshalb 167 mal
 *  112 gleich 18 704 Punkte, gemessen 173,1 je 100 mal 100 bei einem
 *  mittleren Abstand von 7,60 gegen die 8,36 der Referenz.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) bleibt mit 111 / 334 gleich
 *  0,3323 erhalten.
 *
 *  BEIDE ZAHLEN GEHEN AUF 153 UND 103 ZURUECK, und der Anlasz ist eine
 *  Rueckmeldung des Auftraggebers: ein paar Punkte weniger und etwas mehr
 *  Luft zwischen den Punkten einer Reihe.
 *
 *  Gerechnet ist das ueber die Flaeche. Die Punkte verteilen sich immer auf
 *  dieselbe Bildflaeche, ihre Dichte haengt also allein am Produkt N_U mal
 *  N_S und ihr Abstand am Kehrwert der Wurzel daraus. Fuer 145 statt 173
 *  Punkte je 100 mal 100 braucht es den Faktor 0,838 auf das Produkt und
 *  daraus folgt ein Abstand von 7,60 mal der Wurzel aus 1,194 gleich 8,30,
 *  also genau die geforderten 8,3.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) haelt die Kaemmrichtung fest und
 *  bleibt deshalb erhalten. Aus N_S minus eins gleich 0,664 mal N_U und dem
 *  Produkt 15 674 folgt N_U gleich 152,9 und N_S gleich 102,6, gerundet 153
 *  und 103. Das Verhaeltnis steht damit bei 102 durch 306 gleich 0,3333
 *  gegen die 0,3323 zuvor, das Produkt bei 15 759 gegen 18 704, also beim
 *  0,8425-fachen.
 *
 *  Die Ausduennung auf schmalen Schirmen bleibt davon unberuehrt. Ihre
 *  beiden Schritte sind BEZUG_REIHE geteilt durch den Reihenabstand und
 *  BEZUG_SPALTE geteilt durch den Spaltenabstand, und in beiden Bruechen
 *  kuerzt sich N_U beziehungsweise N_S vollstaendig heraus. Beide stehen bei
 *  1440 mal 900 auf 0,848 und runden zu eins, mit den alten wie mit den
 *  neuen Zahlen.
 *
 *  Zur Warnung: die Zahl 77,8 Punkte je 100 mal 100 fuer 134 mal 90 weiter
 *  oben ist mit derselben Gipfelzaehlung entstanden, die auch die 173,1
 *  geliefert hat, und sie passt trotzdem nicht zum Flaechengesetz. Der
 *  Grund ist, dass die Zaehlung oertliche Gipfel sucht und benachbarte
 *  Punkte, die zu einer Spur verschmelzen, als EINEN Gipfel zaehlt. Sie
 *  misst also nicht die Punktzahl, sondern die Zahl der noch getrennt
 *  stehenden Punkte, und die haengt auszer an der Punktzahl auch an der
 *  Kerngroesze und an der Helligkeit. Nachgemessen wird deshalb, und zwar
 *  in Fenstern mit gleichem Abstand von der Kreuzung. */
/*  DIE BEIDEN ZAHLEN GEHEN VON 153 UND 103 AUF 132 UND 89 ZURUECK.
 *
 *  Der Auftraggeber will die Punkte einen Ticken groeszer, dafuer weniger
 *  davon in der Geraden und einen groeszeren Abstand zwischen den Linien.
 *  Er sagt ausdruecklich, es solle nicht viel sein, man solle den
 *  Unterschied aber merken.
 *
 *  Gemessen standen wir bei 144 Punkten je 100 mal 100 Bildpunkten und
 *  einem Abstand von 8,3 Bildpunkten. Die Dichte haengt allein am PRODUKT
 *  der beiden Zahlen, der Abstand am Kehrwert seiner Wurzel; beide
 *  Rasterzahlen muessen deshalb gemeinsam zurueck. Fuer die Vorgabe von
 *  105 bis 115 Punkten und 9,5 bis 10 Bildpunkten Abstand folgt ein
 *  Produkt von rund 11 800 gegen die bisherigen 15 759.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) haelt die Kaemmrichtung fest und
 *  bleibt deshalb erhalten. Aus 88 geteilt durch 264 gleich 0,3333 gegen
 *  die bisherigen 102 geteilt durch 306 gleich 0,3333 ist es auf vier
 *  Stellen dasselbe.
 *
 *  Gerechnet liegen 132 mal 89 gleich 11 748 Punkte bei 107 Punkten je
 *  100 mal 100 und einem Abstand von 9,6 Bildpunkten, beides in der
 *  Vorgabe. Die naheliegende Rundung 135 und 91 traf die Dichte zwar
 *  ebenfalls, blieb beim Abstand mit 9,4 Bildpunkten aber knapp unter der
 *  Vorgabe.
 *
 *  Weniger Punkte tragen weniger Licht. Der Grundfaktor in vLit geht
 *  deshalb mit, und zwar zusammen mit dem breiteren Kern; siehe die
 *  Rechnung dort. */
/** DIE BEIDEN ZAHLEN GEHEN VON 132 UND 89 AUF 114 UND 77.
 *
 *  Der Auftraggeber will weniger Kugeln, die weiter auseinander stehen, und
 *  auch die einzelnen Linien sollen nach oben und unten mehr Abstand haben.
 *  Beides haengt an derselben Groesze, denn die Punkte verteilen sich immer
 *  auf dieselbe Bildflaeche und ihr Abstand folgt dem Kehrwert der Wurzel
 *  aus dem Produkt N_U mal N_S.
 *
 *  Die Vorgabe lautet auf einen Punktabstand von 11,5 bis 12 Bildpunkten
 *  gegen die bisherigen 10,2. Aus 11,75 geteilt durch 10,2 gleich 1,152
 *  folgt fuer das Dichteverhaeltnis der Kehrwert des Quadrates, also 0,754.
 *
 *  Das Verhaeltnis (N_S - 1) / (2 * N_U) haelt die Kaemmrichtung fest und
 *  bleibt deshalb erhalten. Mit 114 und 77 steht es bei 76 geteilt durch
 *  228 gleich 0,33333 und damit auf denselben fuenf Stellen wie 88 geteilt
 *  durch 264. Die Dichte faellt auf 8778 geteilt durch 11748 gleich 0,747
 *  und der Abstand steigt damit gerechnet auf 11,8 Bildpunkte.
 *
 *  Ein Viertel weniger Punkte tragen ein Viertel weniger Licht, und der
 *  Grundfaktor in vLit geht deshalb mit; die Rechnung dazu steht dort. Die
 *  Bildrate profitiert im selben Zug, denn es sind 8778 statt 11748 Punkte
 *  je Reihe zu zeichnen. */
/** N_U GEHT VON 114 AUF 84 UND N_S VON 77 AUF 56, UND DAS IST DER GANZE
 *  RAEUMLICHE EINDRUCK, DEN DER AUFTRAGGEBER VERLANGT.
 *
 *  Er hat zwei Dinge genannt, die zusammen den 3D-Eindruck tragen. Die
 *  Linien sollen in der Hoehe weiter auseinanderstehen, und sie sollen von
 *  Linie zu Linie seitlich staerker versetzt sein.
 *
 *  BEIDE HAENGEN AN N_U UND SONST AN NICHTS. Der Abstand zweier Sprossen im
 *  Bild ist die Periodenlaenge geteilt durch N_U und steigt von 13,0 auf
 *  17,8 Bildpunkte. Der seitliche Versatz von Sprosse zu Sprosse folgt aus
 *  dem Zuwachs des Drehwinkels je Sprosse, und der betraegt
 *  DRALL mal SPANN geteilt durch N_U; er steigt von 0,01837 auf 0,02493
 *  Bogenmasz und damit am Rand des Bandes von 5,5 auf 7,4 Bildpunkte.
 *
 *  DER ANDERE ANGEBOTENE WEG, NAEMLICH DRALL ZU HEBEN UND SPANN IM KEHRWERT
 *  ZU SENKEN, LEISTET FUER DEN SEITLICHEN VERSATZ NICHTS. Der Versatz je
 *  Sprosse ist DRALL mal SPANN geteilt durch N_U, und das Produkt DRALL mal
 *  SPANN steht unter Bestandsschutz bei 2,0944. Wie man es auf die beiden
 *  Zahlen aufteilt, aendert am Versatz je Sprosse also nichts. Schlimmer
 *  noch, ein kleineres SPANN verkuerzt die Periode und schiebt die Sprossen
 *  im selben Verhaeltnis ZUSAMMEN, weil sich die N_U mal N_S Punkte stets auf
 *  genau eine Periodenlaenge verteilen. Der Weg wirkt also gegen die erste
 *  der beiden Forderungen und fuer die zweite gar nicht. Die Zahlen bleiben
 *  deshalb bei DRALL gleich 0,182121 und SPANN gleich 11,5.
 *
 *  N_S FOLGT AUS ZWEI BEDINGUNGEN ZUGLEICH. Der Auftraggeber verlangt fuer
 *  die Schaerfe ausdruecklich weniger Punkte je Linie bei groeszeren Punkten,
 *  und die Kaemmrichtung verlangt, dass das Verhaeltnis der beiden
 *  Rasterschritte erhalten bleibt. Dieses Verhaeltnis heiszt seit dieser
 *  Runde N_S geteilt durch (2 mal N_U) und nicht mehr (N_S - 1) geteilt durch
 *  (2 mal N_U), denn die Querkoordinate wird jetzt ueber N_S statt ueber
 *  N_S - 1 gebildet; die Begruendung dafuer steht bei der Erzeugung des
 *  Attributes aS und haengt an der neuen Querbewegung. Aus 56 geteilt durch
 *  168 gleich 0,33333 ist es auf denselben fuenf Stellen dasselbe wie zuvor
 *  76 geteilt durch 228.
 *
 *  Der Spaltenabstand steigt damit von 7,77 auf 10,68 Bildpunkte, die
 *  Punktzahl faellt von 8778 auf 4704 und damit auf das 0,536-fache. Der
 *  Grundfaktor in vLit und der Punktkern gehen im selben Zug mit; die
 *  Rechnungen stehen dort. */
/** N_U GEHT VON 84 AUF 152 UND N_S VON 56 AUF 32, UND DAMIT WECHSELT DAS
 *  BILD VON DER KEGELFORM ZUR GESCHWUNGENEN HELIX.
 *
 *  Der Auftraggeber hat den Fehler genau benannt. Bei der Referenz haben die
 *  Linien einen Bogen, sie werden seitlich zu einer S-Form und daraus
 *  entsteht der raeumliche Eindruck; bei uns standen nur gerade Linien, die
 *  sich drehen, und das las als Kegel.
 *
 *  AUF DER FLAECHE LIEGEN ZWEI SCHAREN, UND WIR HABEN DIE FALSCHE GEZEIGT.
 *  Eine Sprosse hat feste Hoehe und laufende Querkoordinate; sie ist eine
 *  gerade Strecke durch die Achse und bleibt unter jeder Abbildung eine
 *  Gerade. Eine Saeule hat feste Querkoordinate und laufende Hoehe; dort
 *  laeuft ein Punkt auf x gleich sc mal RADIUS mal cos(th) und z gleich sc
 *  mal RADIUS mal sin(th), waehrend th linear mit der Hoehe waechst. Im Bild
 *  ist das eine Sinuskurve, deren Ausschlag mit der Verjuengung des Bandes
 *  atmet, also genau die S-Form mit Bogen, die der Auftraggeber beschreibt.
 *
 *  WELCHE SCHAR DAS AUGE ALS LINIE LIEST, ENTSCHEIDET ALLEIN DER
 *  PUNKTABSTAND, denn das Auge verbindet die naeher beieinander liegenden
 *  Punkte. Der Abstand laengs einer Saeule ist der Sprossenabstand
 *  SPANN mal cos(TILT) mal uUnit geteilt durch N_U, der Abstand laengs einer
 *  Sprosse ist der Spaltenabstand 2 mal RADIUS mal uUnit geteilt durch N_S.
 *  Mit 84 und 56 standen sie bei 17,5 gegen 10,5 Bildpunkten; die Punkte
 *  einer Sprosse lagen also enger, und deshalb las das Auge Geraden. In der
 *  Achtfachvergroeszerung war das nicht zu uebersehen, die Punkte einer
 *  Sprosse beruehrten einander beinahe und bildeten durchgezogene Ketten,
 *  waehrend zwischen zwei Sprossen eine breite Luecke stand.
 *
 *  MIT 152 UND 32 KEHRT SICH DAS VERHAELTNIS UM. Der Sprossenabstand faellt
 *  auf 9,69 und der Spaltenabstand steigt auf 18,44 Bildpunkte; laengs der
 *  Schraubenlinie liegen die Punkte jetzt 1,90-mal enger als quer zu ihr.
 *  Das Auge folgt damit der Saeule, und die Saeule ist die geschwungene
 *  Schar.
 *
 *  DIE ALTE REGEL, N_S GETEILT DURCH ZWEIMAL N_U SOLLE EIN DRITTEL BLEIBEN,
 *  IST DAMIT AUSDRUECKLICH AUFGEHOBEN. Sie stammt aus der Zeit der Scherung
 *  und sollte deren Kaemmrichtung halten. Seit SHEAR_M auf null steht, gibt
 *  es keine Kaemmrichtung mehr, die zu halten waere; das Verhaeltnis ist
 *  seither frei und traegt statt dessen die Entscheidung darueber, welche
 *  der beiden Scharen sichtbar wird.
 *
 *  AN DER REFERENZ NACHGEMESSEN steht ihr Gitter nahezu quadratisch. Mit
 *  _ref2/raum/scharen.mjs ueber die Selbstaehnlichkeit gemessen liefert
 *  roll05 an vier Stellen Verhaeltnisse von 1 zu 1,00 / 1,00 / 1,25 / 1,10,
 *  roll11 an drei Stellen 1 zu 1,00 / 0,97 / 1,31 und die Nahaufnahmen n004,
 *  n068 und n108 zwischen 1 zu 0,55 und 1 zu 1,35. Die Referenz bevorzugt
 *  also KEINE der beiden Scharen, waehrend wir mit 1 zu 1,66 klar die
 *  Sprosse bevorzugten. Wir gehen bewusst ueber die Referenz hinaus auf 1 zu
 *  1,90, weil ein quadratisches Gitter die Wahl der Schar dem Zufall
 *  ueberlaeszt und wir die geschwungene Schar sicher gewinnen lassen wollen.
 *
 *  DIE PUNKTZAHL BLEIBT DABEI STEHEN. 152 mal 32 ergibt 4864 gegen zuvor 84
 *  mal 56 gleich 4704, also das 1,034-fache. Bildrate und Gesamtlicht
 *  wandern dadurch nicht davon, und der Grundfaktor in vLit braucht aus
 *  diesem Grund keinen Ausgleich.
 *
 *  Der groeszere Spaltenabstand erfuellt zugleich die zweite Forderung
 *  dieser Runde, naemlich weniger Punkte je Linie mit mehr Abstand. Er geht
 *  von 10,68 auf 18,44 Bildpunkte. */
/** N_S GEHT IM ZWEITEN ZUG DERSELBEN RUNDE VON 32 AUF 36, WEIL DER FAECHER
 *  MIT 32 ZU LUECKIG STAND.
 *
 *  Der Schwung war mit 152 und 32 da, der Faecher an der Kreuzung aber
 *  duenn. Nachgemessen mit _ref2/eng/verlauf.mjs trug das Ringmittel um die
 *  Kreuzung bei einem Halbmesser von 55 Bildpunkten 11,4 gegen 15,3 im Stand
 *  vor dieser Runde und gegen 39,4 der Referenz. Der Rueckgang gegen den
 *  eigenen Vorstand stammt allein aus N_S: die Saeulen des Faechers stehen
 *  bei 32 volle 18,44 Bildpunkte auseinander, das Ringmittel mittelt also zu
 *  einem groeszeren Teil ueber leeren Grund.
 *
 *  Mit 36 faellt der Spaltenabstand auf 16,39 Bildpunkte. Das Verhaeltnis
 *  laengs zu quer steht damit bei 1 zu 1,69 und liegt in der Mitte des vom
 *  Auftrag genannten Bandes von 1 zu 1,5 bis 1 zu 2; die Saeule bleibt also
 *  klar die Schar, der das Auge folgt.
 *
 *  Gegen den Stand VOR dieser Runde ist der Spaltenabstand damit immer noch
 *  von 10,68 auf 16,39 Bildpunkte gestiegen, die Forderung nach mehr Abstand
 *  je Linie bleibt also erfuellt.
 *
 *  Die Punktzahl steigt auf 152 mal 36 gleich 5472 und damit auf das
 *  1,163-fache des Standes vor der Runde. Die Bildrate ist daran
 *  nachzumessen und war mit 4864 Punkten bei p50 gleich 16,7 ms. */
/** MEHR PUNKTE AUF DER LINIE UND ENGER ZUSAMMEN, AUF ANSAGE DES
 *  AUFTRAGGEBERS. Er hat verlangt, die Punkte etwas enger zu setzen und
 *  drei bis vier je Linie zu ergaenzen.
 *
 *  N_U zaehlt die Sprossen und bestimmt damit den Abstand LAENGS der
 *  sichtbaren Schraubenlinie, denn auf jede Sprosse faellt dort ein
 *  Punkt. Von 152 auf 168 sind das 16 Sprossen mehr, der Abstand geht
 *  von 9,69 auf 8,77 Bildpunkte zurueck, und auf die im Bild sichtbare
 *  Strecke fallen rund vier Punkte mehr. Genau das war die Ansage.
 *
 *  N_S bleibt bei 36, damit das Verhaeltnis der beiden Scharen
 *  zugunsten der Schraubenlinie erhalten bleibt. Es geht von 1 zu 1,69
 *  auf 1 zu 1,87 und wird also sogar deutlicher. Ein Zwischenstand mit
 *  einem nahezu quadratischen Gitter hat den Schwung gekostet, denn
 *  dann entscheidet der Zufall, welcher Schar das Auge folgt.
 *
 *  Die Punktzahl steigt von 5472 auf 6048, also auf das 1,105-fache.
 *  Die Bildrate ist daran nachzumessen und lag mit 5472 Punkten bei
 *  p50 gleich 16,7 ms. */
const N_U = 168;
const N_S = 36;

/** Der Teiler des Punktkerns im Fragment-Teil.
 *
 *  Die Punktscheibe hat den Halbmesser uPointSize geteilt durch zwei, und
 *  der Kern nimmt davon den Bruchteil 1 geteilt durch KERN_TEILER ein. Aus
 *  dem Profil (1 - r * KERN_TEILER) hoch vier folgt die gerechnete
 *  Halbwertsbreite 1,909 geteilt durch KERN_TEILER Bildpunkte bei einer
 *  Scheibe von zwoelf.
 *
 *  Er gehoert mit N_U und N_S zusammen und steht deshalb neben ihnen. Der
 *  Kern muss so breit sein, dass ein Punkt als Punkt liest, und so schmal,
 *  dass zwei Nachbarn laengs des kurzen Gittervektors von 6,55 Bildpunkten
 *  noch getrennt bleiben. Bei 0,67 lief das zusammen, bei 4,0 stand ein
 *  Sprenkelfeld.
 *
 *  Gesucht ist die gemessene Halbwertsbreite der Referenz von 2,55
 *  Bildpunkten im Fenster 1050,160,180,180. Ueber den gemessenen
 *  Zusammenhang gemessen gleich 1,42 mal gerechnet plus 1,20 folgt eine
 *  gerechnete Breite von 0,95 und damit ein Teiler von 1,9.
 *
 *  Nachgemessen fiel die Breite damit auf 2,07 Bildpunkte und blieb
 *  hinter der Referenz zurueck, weil der Zusammenhang bei kleinerem Kern
 *  flacher verlaeuft als die Gerade. Der Teiler steht deshalb am Ende bei
 *  1,5. Mit _ref2/mess/gipfelprofil.mjs gemessen traegt das fertige Bild
 *  im Fenster 1050,160,180,180 damit 2,94 Bildpunkte waagerecht und 2,80
 *  senkrecht gegen die 3,25 und 2,73 der Referenz, waehrend der
 *  Ausgangsstand dort bei 1,66 und 1,58 lag.
 *
 *  DER TEILER GEHT VON 1,5 AUF 1,24 UND GEHOERT ZUR AUSDUENNUNG DES
 *  RASTERS. Der Auftraggeber will die Punkte einen Ticken groeszer haben,
 *  und die Vorgabe lautet auf eine gemessene Halbwertsbreite von 3,4 bis
 *  3,6 Bildpunkten gegen die bisherigen 2,9.
 *
 *  Der Teiler ist der einzige Hebel, der dafuer in Frage kommt. Die Scheibe
 *  ueber uPointSize zu vergroeszern verbietet sich, weil dann der Hof im
 *  selben Masz mitwaechst und der Schleier zwischen den Punkten zu einer
 *  Flaeche zulaeuft; die Rechnung dazu steht im Fragment-Teil.
 *
 *  Die Breite ist dem Teiler umgekehrt proportional, solange der Kern die
 *  Form traegt, also folgt aus 2,9 mal 1,5 geteilt durch 3,5 der Wert 1,24.
 *  Der Hof traegt an der Halbwertsbreite mit, weshalb die Rechnung eher zu
 *  wenig als zu viel liefert; nachgemessen wird deshalb.
 *
 *  Nachgemessen mit _ref2/final/korngroesse.mjs im Fenster
 *  1050,160,180,180 trug 1,24 eine Punktbreite von 3,35 Bildpunkten quer
 *  zu den Straengen gegen die 3,01 des Ausgangsstandes und blieb damit
 *  knapp unter der Vorgabe von 3,4 bis 3,6. Der Teiler geht deshalb ein
 *  letztes Stueck auf 1,19; aus 3,35 mal 1,24 geteilt durch 1,19 folgen
 *  3,49 Bildpunkte.
 *
 *  Gemessen wird ueber die AUTOKORRELATION und nicht mehr ueber die
 *  Gipfelsuche, und der Auftrag verlangt das ausdruecklich. Im dichten
 *  Fenster liefert die Gipfelsuche fuer die waagerechte Halbwertsbreite
 *  ueberhaupt keinen Wert mehr, weil das Profil zwischen zwei Punkten
 *  laengs eines Stranges gar nicht mehr auf die halbe Hoehe faellt.
 *  Gemessen wird deshalb QUER zu den Straengen, denn nur dort stehen die
 *  Punkte getrennt.
 *
 *  Die neue Gitterteilung gibt dem breiteren Kern erst den Platz. Die
 *  Punkte stehen jetzt 9,5 statt 8,4 Bildpunkte auseinander, ein Kern von
 *  3,5 Bildpunkten Halbwertsbreite deckt davon also denselben Bruchteil ab
 *  wie zuvor einer von 3,1. Genau deshalb sind die beiden Aenderungen
 *  zusammen vorgenommen worden und duerfen nicht einzeln zurueckgedreht
 *  werden. */
/** DER TEILER GEHT VON 1,19 AUF 2,10, WEIL DER AUFTRAGGEBER DIE PUNKTE
 *  SCHAERFER HABEN WILL.
 *
 *  Er beanstandet, das Bild fuehle sich unscharf an, und zwar am staerksten
 *  an der Kreuzung, wo es hell wird. Die Referenz sei dort deutlich
 *  schaerfer. Nachgemessen mit _ref2/final/korngroesse.mjs ueber die
 *  Autokorrelation traegt die Referenz im Fenster 820,180,300,300 von
 *  roll06 eine Punktbreite von 2,18 Bildpunkten waagerecht und 1,80
 *  senkrecht, waehrend unser Ausgangsstand ueber drei Fenster gemittelt bei
 *  rund 4,3 waagerecht und 5,2 senkrecht lag. Unsere Punkte waren also gut
 *  doppelt so breit, senkrecht beinahe dreimal.
 *
 *  Der Teiler traegt den KERN. Die Breite ist ihm umgekehrt proportional,
 *  solange der Kern die Form traegt, und aus 4,3 mal 1,19 geteilt durch 2,4
 *  folgt rund 2,1. Die GEMESSENE Breite folgt dieser Rechnung nur zum Teil,
 *  weil der Hof mit seiner Reichweite daran mittraegt; der eigentliche
 *  Griff an der gemessenen Breite steht deshalb bei der Potenz des Hofes im
 *  Fragment-Teil, und beide gehoeren zusammen.
 *
 *  Nachgemessen ueber die drei Fenster 1150,280,260,280 und
 *  1100,350,300,300 und 1200,250,220,260 traegt der Endstand 3,97 / 3,84 /
 *  3,82 Bildpunkte waagerecht und 3,55 / 3,53 / 3,63 senkrecht gegen die
 *  4,35 / 4,87 / 3,65 und 4,65 / 4,09 / 6,88 des Ausgangsstandes. Der Punkt
 *  ist damit nicht nur schmaler, sondern auch RUND geworden und ueber die
 *  Fenster hinweg gleich; vorher schwankte er je nach Blickwinkel zwischen
 *  3,7 und 6,9 Bildpunkten.
 *
 *  Die Referenz bleibt mit 2,18 schaerfer, und der Rest des Abstandes ist
 *  nicht ueber den Kern zu holen. Er liegt in der Gitterteilung selbst; die
 *  Begruendung steht bei N_U und N_S.
 *
 *  Die groeszere Gitterteilung gibt dem schmaleren Kern erst seinen Sinn.
 *  Ein Kern, der einen kleineren Bruchteil der Teilung abdeckt, laeszt
 *  zwischen zwei Punkten wieder Grund stehen, und genau das ist die
 *  verlangte Schaerfe. */
/** KERN_TEILER GEHT VON 2,10 AUF 1,55, DER PUNKTKERN WIRD ALSO GROESZER.
 *
 *  Der Auftraggeber verlangt woertlich weniger Punkte auf den Linien, dafuer
 *  groeszere, damit man die einzelnen Punkte sieht statt einer verschwommenen
 *  Flaeche. Der Kern nimmt den Bruchteil eins geteilt durch KERN_TEILER der
 *  Scheibe ein, sein Halbmesser waechst damit von 2,86 auf 3,87 Bildpunkte.
 *  Nach der gemessenen Umrechnung, gemessen gleich 1,42 mal gerechnet plus
 *  1,20 Bildpunkte, waechst die Halbwertsbreite von 2,49 auf 2,95
 *  Bildpunkte.
 *
 *  DER WERT STEHT AM ENDE BEI 2,00 UND NICHT BEI 1,55, DENN SEINE BEDEUTUNG
 *  HAT SICH GEAENDERT. Er gibt jetzt nicht mehr die Steilheit einer Spitze
 *  an, sondern den Halbmesser einer SCHEIBE mit weicher Kante. Eins geteilt
 *  durch KERN_TEILER ist der Halbmesser, an dem die Scheibe auf null
 *  angekommen ist, und 0,68 geteilt durch KERN_TEILER der, bis zu dem sie
 *  volles Licht traegt. Bei einer Punktscheibe von zwoelf Bildpunkten sind
 *  das ein gleichmaesziger Kern von 2,04 und eine Kante bis 3,00
 *  Bildpunkten. Die Begruendung samt der Messung, die das alte Profil
 *  widerlegt, steht im Fragment-Teil bei kern.
 *
 *  Der Platz dafuer ist da. Der Spaltenabstand steigt mit N_S gleich 56 von
 *  7,77 auf 10,68 Bildpunkte und der Sprossenabstand mit N_U gleich 84 von
 *  13,0 auf 17,8; ein Kern von 3,87 Bildpunkten Halbmesser laeszt zwischen
 *  zwei Nachbarn also immer noch knapp drei Bildpunkte dunklen Grund. Der
 *  frueher gescheiterte Versuch mit einem Teiler von 0,67 stand bei einem
 *  Gittervektor von 6,55 Bildpunkten und musste die Punkte deshalb paarweise
 *  zusammenlaufen lassen. */
const KERN_TEILER = 2.0;

/** Die Scherung des Abtastrasters.
 *
 *  Sie ist der eine Hebel, der die Kaemmrichtung der Referenz herstellt.
 *  Ein Punkt sitzt nicht mehr bei (u, s), sondern bei (u + SHEAR * s, s).
 *  Jede Bahn ist damit gegen ihre Nachbarbahn um einen FESTEN Bruchteil
 *  einer Sprossenweite laengs des Bandes versetzt, und die Punkte einer
 *  Sprosse laufen im Bild nicht mehr waagerecht, sondern schraeg.
 *
 *  Die Silhouette bleibt davon unberuehrt, und das ist nachrechenbar. Die
 *  Menge der abgetasteten u-Werte einer Bahn ist nach der Verschiebung
 *  wieder ein gleichmaesziges Raster ueber den ganzen Umlauf, die Flaeche
 *  wird also genauso lueckenlos und genauso dicht belegt wie zuvor. Es
 *  aendert sich allein, WELCHER Punkt an welcher Stelle sitzt. Alles, was
 *  die Form traegt, naemlich kehleAt, drallAt und der Ausklang, haengt
 *  nach wie vor an der geometrischen Bandkoordinate und sieht die
 *  Scherung gar nicht.
 *
 *  Die Groesze folgt aus der Messung. Der senkrechte Anteil des kurzen
 *  Gittervektors der Referenz betraegt an allen vier Meszstellen 1,01 /
 *  1,23 / 1,09 / 1,05 Bildpunkte, im Mittel 1,095, und er ist damit
 *  KONSTANT, waehrend der waagerechte Anteil von 4,05 im unteren Lappen
 *  auf 2,69 an der Taille schwankt. Genau das leistet eine Scherung in
 *  Materialkoordinaten und nichts anderes. Der waagerechte Anteil geht
 *  mit der projizierten Bandbreite zurueck, weil das Band sich dort dem
 *  Betrachter zudreht, der senkrechte haengt dagegen allein an der
 *  Bandlaenge und die aendert sich nicht. Ein fester Winkel im Bild
 *  wuerde stattdessen an der Taille denselben Winkel zeigen wie in den
 *  Lappen und damit die Messung verfehlen.
 *
 *  Die Groesze ist mit _ref2/schermodell.mjs bestimmt worden. Das Modell
 *  rechnet dieselbe Kette wie der Vertex-Shader, also Flaeche, Kippung,
 *  Fluchtung, Neigung und Maszstab, und liefert daraus die beiden
 *  Gittervektoren im Bild. Nachgerechnet trifft es die Messung an der
 *  fertigen Seite auf zwei Grad genau, deshalb ist die Anpassung am
 *  Modell und nicht ueber Aufnahmen gemacht.
 *
 *  ZWEI Zahlen sind noetig und nicht eine, und der Grund ist die
 *  Verdrehung. Ohne jede Scherung steigt die Sprosse im Bild im OBEREN
 *  Lappen um 18 Grad nach rechts ab und im UNTEREN um 2 Grad an. Diese
 *  Unsymmetrie ist unvermeidlich, denn die Kippung neigt die Sprosse um
 *  den Betrag arctan(sin(TILT) / |tan w|), und dieser Beitrag wechselt
 *  sein Vorzeichen an der Taille, weil das Band dort dem Betrachter die
 *  Kante zudreht und anschlieszend die andere Seite zeigt. Eine einzige
 *  feste Scherung kann deshalb hoechstens einen der beiden Lappen
 *  treffen. Nachgerechnet liefert 0,120 im oberen Lappen die gesuchten
 *  18 Grad und im unteren minus 38, waehrend 0,190 im unteren 15 bis 20
 *  Grad liefert und im oberen minus 28 bis minus 44.
 *
 *  Warum eine Differenz von nur 0,07 genuegt, obwohl die Sprosse selbst
 *  um vierzig Grad kippt, liegt am Gitter. Sichtbar ist nicht die
 *  Sprosse, sondern der KUERZESTE Gittervektor, und der aendert sich
 *  nicht, wenn man einen ganzen Sprossenschritt hinzufuegt. Die Scherung
 *  wirkt deshalb nur modulo einer Sprossenweite je Bahnschritt, und das
 *  sind (1 / N_U) / (2 / (N_S - 1)) = (N_S - 1) / (2 * N_U). Mit den
 *  Zahlen 180 und 120 ergibt das 0,3306; vor der neuen Gitterteilung
 *  waren es bei 192 und 100 noch 0,2578. Von den 0,120 des oberen
 *  Lappens zu den 0,190 des unteren ist der kuerzeste Weg 0,070.
 *
 *  Der Uebergang laeuft ueber einen vollen Sinus in der Bandkoordinate.
 *  Er muss PERIODISCH sein, denn nur dann gilt shear(0) gleich shear(1),
 *  und nur dann belegt jede Bahn den Umlauf genau einmal. Waere er es
 *  nicht, wuerde eine Bahn den Umlauf gestreckt oder gestaucht ueberdecken
 *  und an einem Bandende eine Luecke hinterlassen; bei 390 Bildpunkten
 *  Schirmbreite liegen beide Bandenden im Bild und die Luecke waere als
 *  einseitig abgeschnittene Kante zu sehen.
 *
 *  Angepasst ist gegen die vier Meszstellen der Referenz. Mit 0,150 und
 *  0,035 rechnet das Modell ueber die Bandkoordinaten 0,20 / 0,28 / 0,34 /
 *  0,42 / 0,58 / 0,67 / 0,75 / 0,82 die Winkel 18 / 17 / 19 / 27 / 35 /
 *  22 / 17 / 17 Grad. Die beiden Werte um dreiszig Grad stehen unmittelbar
 *  neben der Taille, wo das Band nur wenige Bildpunkte breit ist und die
 *  Kaemmrichtung ohnehin nicht mehr abzulesen ist.
 *
 *  Nach der neuen Gitterteilung sind beide Zahlen nachgerechnet worden und
 *  beide BLEIBEN. Der obere Lappen, der das meiste Licht traegt, kommt bei
 *  180 und 120 auf dieselben 18 / 17 / 19 Grad wie zuvor und trifft damit
 *  die 17,7 und 19,2 Grad der Referenz. Unterhalb der Taille rechnet das
 *  Modell dagegen 40 bis 45 Grad, und dieser Wert laeszt sich ueber die
 *  Scherung nicht einfangen: abgesucht ist der Bereich von 0,15 bis 0,21
 *  fuer den Grundwert und von 0,030 bis 0,115 fuer den Ausschlag, und
 *  ueber die ganze Flaeche bleibt die Stelle u gleich 0,58 zwischen 36 und
 *  45 Grad, waehrend der obere Lappen dabei auf null bis fuenf Grad
 *  abfaellt. Der Grund ist, dass dort zwei fast gleich lange
 *  Gittervektoren miteinander konkurrieren und der kuerzeste zwischen
 *  ihnen springt. Ein Ausschlag, der beide Lappen zugleich traefe, muesste
 *  bei 0,116 liegen und wuerde den Jacobi-Faktor von 0,78 auf 0,27
 *  druecken, also die Punktdichte laengs des Bandes um mehr als das
 *  Dreifache schwanken lassen. Diese Stelle liegt zudem hinter dem
 *  Ausklang: bei u gleich 0,58 steht das Gewebe auf dreiszig Prozent
 *  Helligkeit und bei 0,685 ist es erloschen. */
/** DIE SCHERUNG WIRD JETZT HERGELEITET UND NICHT MEHR ANGEPASST.
 *
 *  Die beiden alten Zahlen 0,150 und 0,035 sind an zwei Meszstellen des
 *  OBEREN Lappens angepasst worden und haben dort auch getroffen; unter
 *  der Taille lief die Kaemmrichtung dagegen weg. Gemessen mit
 *  _ref2/gitter.mjs zeigte der kuerzeste Gittervektor an den vier
 *  Meszstellen minus 164,7 / minus 158,0 / minus 137,7 / minus 103,3 Grad,
 *  waehrend die Referenz an denselben Stellen einheitlich minus 162,1 /
 *  minus 160,2 / minus 161,0 / minus 166,0 Grad liefert. An zwoelf
 *  weiteren Stellen ueber das ganze Bild der Referenz steht dieselbe
 *  Richtung zwischen minus 160 und minus 175 Grad. Ihre Kaemmrichtung ist
 *  also ueber die ganze Flaeche gleich, unsere war es nur oben.
 *
 *  Die Herleitung. Der Reihenvektor im Bild ist R gleich ds mal
 *  (G plus scher mal E), wobei G die Ableitung der Flaeche QUER und E die
 *  Ableitung LAENGS des Bandes ist. Verlangt man ein festes Verhaeltnis
 *  m gleich R_y durch R_x, so folgt die Scherung unmittelbar:
 *
 *      scher(ph) = RADIUS / (SPANN cos TILT)
 *                  * kehle(ph) * (m sin(drall) + sin(TILT) cos(drall))
 *
 *  Der Vorfaktor ist 2,3 geteilt durch 11,17 gleich 0,2059.
 *
 *  EINE SCHRANKE, DIE MAN KENNEN MUSZ. Beide Summanden sind
 *  ANTIPERIODISCH, denn die Verdrehung legt je Periode genau PI zu und
 *  damit wechseln sin und cos ihr Vorzeichen. Die Scherung selbst musz
 *  aber PERIODISCH sein, sonst belegt eine Bahn den Umlauf nicht mehr
 *  genau einmal und es bleibt eine Luecke oder ein doppelt belegter
 *  Streifen stehen. Daraus folgt, dass eine ueber die ganze Flaeche exakt
 *  einheitliche Kaemmrichtung mit dieser Abtastung gar nicht erreichbar
 *  ist. Erreichbar ist die beste periodische Naeherung, und genau die
 *  steht hier.
 *
 *  Der antiperiodische Anteil kehle mal sin(drall) wird durch seine beste
 *  periodische Naeherung ersetzt, und das ist ein Sinus in der
 *  Bandkoordinate. Sein Vorfaktor ist die Projektion des einen auf den
 *  anderen ueber eine volle Periode und betraegt numerisch gerechnet
 *  1,102. Der zweite Anteil kehle mal cos(drall) wird unveraendert
 *  uebernommen; er verschwindet an der Periodenkante von selbst, weil dort
 *  der Kosinus null ist, und bleibt deshalb stetig.
 *
 *  DIE VERJUENGUNG WIRD IN DER SCHERUNG GEGLAETTET. Die echte Kehle faellt
 *  ueber NECK_SPAN gleich 0,048 von eins auf 0,08 und ihre Ableitung
 *  erreicht dabei 27 je Einheit der Bandkoordinate. In die Scherung
 *  eingesetzt triebe das den Jacobi-Faktor unter null, das Abtastraster
 *  schlueg also unmittelbar neben der Taille eine Falte. Mit SCHER_SPAN
 *  gleich 0,20 bleibt der Jacobi-Faktor bei 0,359 und die Kaemmrichtung
 *  weicht dafuer nur in den 80 Bildpunkten unmittelbar ueber der Taille
 *  ab, wo das Gitter ohnehin entartet.
 *
 *  Nachgerechnet mit _ref2/scherfit.mjs ueber die Bandkoordinaten minus
 *  0,30 bis plus 0,30 liefert das die Winkel minus 166 / minus 164 /
 *  minus 164 / minus 168 / minus 174 ueber der Taille und minus 161 /
 *  minus 164 / minus 164 / minus 163 / minus 163 / minus 164 darunter.
 *  Der Wert m gleich minus 0,40 ist dabei nicht der Tangens der 15 Grad
 *  der Referenz, sondern der Wert, der nach der Neigung LEAN und der
 *  Fluchtung im BILD auf diese 15 Grad fuehrt. */
/** SHEAR_M GEHT VON MINUS 0,40 AUF NULL, UND DAS IST ERZWUNGEN UND NICHT
 *  GEWAEHLT. Die Kaemmrichtung, die dieser Wert herstellt und die oben ueber
 *  viele Absaetze an der Referenz angepasst worden ist, geht damit
 *  verloren. Der Auftraggeber hat das ausdruecklich in Kauf genommen.
 *
 *  DER WIDERSPRUCH IM EINZELNEN. Die Scherung lautet
 *
 *      scher(ph) = SCHER_SWING mal sin(2 PI mal ph)
 *
 *  und verschiebt einen Punkt um scher mal aS laengs des Bandes. Aus dieser
 *  Form folgen zwei Dinge zugleich, und sie vertragen sich nicht.
 *
 *  Erstens musz scher an jeder Kreuzung sein Vorzeichen wechseln, sonst
 *  sehen die beiden Kreuzungen verschieden aus. Die Begruendung steht bei
 *  DRALL: aufeinanderfolgende Kreuzungen zeigen dieselbe Gerade von der
 *  anderen Seite, die Flaeche bildet aS dort auf minus aS ab, und nur wenn
 *  scher mitwechselt, bleibt das Produkt scher mal aS gleich. Genau dafuer
 *  steht DRALL auf PI geteilt durch (1,5 mal uSpann).
 *
 *  Zweitens laeuft die Weltlage ph beim Scrollen mit MITLAUF durch. Mit
 *  MITLAUF gleich 1,00 sind das ueber die klebende Strecke 2,38 Perioden,
 *  die Scherung durchlaeuft also 2,38 volle Schwingungen und allein ueber
 *  die flache Phase von 600 bis 2400 Bildpunkten eine ganze. Die
 *  Kaemmrichtung kippt darin von einer Seite auf die andere.
 *
 *  Der Auftraggeber hat genau das beanstandet: es gehe einmal von rechts
 *  nach links und einmal von links nach rechts, und es muesse einheitlich
 *  sein. Belegt ist es an der Bildreihe unter _ref2/zwei/Eflach, als Streifen
 *  in _ref2/zwei/FLACH-strip.png.
 *
 *  Eine Funktion, die ihr Vorzeichen alle 1,5 Perioden wechselt, MUSZ
 *  zwischendurch durch null gehen und die Richtung umkehren. Beide
 *  Forderungen sind deshalb nicht zugleich zu erfuellen, solange die
 *  Scherung ueberhaupt von null verschieden ist. Der einzige Wert, der die
 *  Kreuzungen gleich laeszt UND die Richtung nicht umkehrt, ist null.
 *
 *  Mit dem alten MITLAUF von 0,30 stellte sich die Frage nicht, denn dort
 *  lief ph nur 0,71 Perioden durch und die Scherung blieb ueber den ganzen
 *  Scrollweg auf einem Vorzeichen. Die Kaemmrichtung ist also nicht an
 *  sich unvertraeglich mit der Flaeche, sondern mit der ZWEITEN KREUZUNG,
 *  die den groeszeren Mitlauf verlangt.
 *
 *  Was bleibt. Der Jacobi-Faktor wird damit durchweg eins und das
 *  Abtastraster gleichmaeszig; die Straenge stehen als gerade Linien statt
 *  als gekaemmte. Nachgemessen sehen die beiden Kreuzungen einander
 *  daraufhin nicht mehr zu unterscheiden aehnlich, siehe
 *  _ref2/zwei/U-A.png gegen U-B.png. */
const SHEAR_M = 0.0;
const SHEAR_SPAN = 0.2;

/** Radius des Bandes und Laenge EINER PERIODE laengs der Achse.
 *
 *  Das Band ist seit dem Umbau zum wandernden Band kein Stueck mehr,
 *  sondern ein endloses periodisches Gewebe, durch das das Bild wie ein
 *  Fenster faehrt. SPANN ist deshalb die Weltlaenge einer Periode und
 *  nicht mehr die Laenge des ganzen Bandes. Der ZAHLENWERT bleibt
 *  trotzdem bei 11,5, und das ist eine bewusste Entscheidung.
 *
 *  Der erste Versuch hat die Periode auf 9,4685 verkuerzt, damit die alte
 *  Verdrehungskurve unveraendert stehenbleiben konnte. Er ist verworfen,
 *  und die Messung, die ihn widerlegt, ist die Punktdichte. Die
 *  Bandkoordinate laeuft ueber fract stets ueber genau eine Periode,
 *  N_U mal N_S Punkte verteilen sich also immer auf eine Periodenlaenge.
 *  Wird diese kuerzer, so ruecken die Sprossen im selben Verhaeltnis
 *  zusammen. Nachgemessen fiel der Sprossenabstand von 8,04 auf 6,62
 *  Bildpunkte, die Zahl der Gipfel im Fenster 620,100,420,420 stieg von
 *  4228 auf 4781, das absolute 99. Perzentil von 161,1 auf 171,1 und das
 *  99,9. von 209,8 auf 221,4. Die Bedeckung der Zeile bei 74 Prozent der
 *  Bildhoehe sprang von 40 auf 55 Prozent. Mit der Periode waeren
 *  auszerdem N_U, N_S und beide Scherungszahlen mitzuziehen gewesen, und
 *  genau diese vier Zahlen sind gemessen und stehen unter Bestandsschutz.
 *
 *  Die Periode bleibt deshalb bei der alten Bandlaenge und stattdessen
 *  wird die VERDREHUNG neu eingepasst. Sie ist die einzige Groesze, die
 *  sich aendern musz, und sie aendert sich nur um elf Prozent. Die
 *  Begruendung samt Rechnung steht bei TWIST_FAR.
 *
 *  Bei 1440 mal 900 misst eine Periode SPANN mal cos(TILT) mal uUnit
 *  gleich 11,5 mal 0,97134 mal 128,25 gleich 1432,6 Bildpunkte gegen 900
 *  Bildpunkte Fensterhoehe. Die Wickelstelle sitzt damit 266 Bildpunkte
 *  ober- und unterhalb des Fensters. */
const RADIUS = 2.3;
const SPANN = 11.5;

/** Die Verdrehung, und zwar UNGLEICHMAESZIG.
 *
 *  Bisher war die Verdrehung gleichmaeszig ueber die Bandlaenge verteilt,
 *  TURNS volle Umdrehungen von Ende zu Ende. Das kann die Silhouette der
 *  Referenz nicht liefern, und der Grund laeszt sich ausrechnen.
 *
 *  Die abgebildete Bandbreite geht mit dem Betrag des Sinus von Delta,
 *  wobei Delta der Windungswinkel gemessen ab der Kantenlage in der
 *  Bandmitte ist. Die Referenz oeffnet sich unmittelbar an der Taille
 *  sehr steil: nachgemessen waechst die halbe Gewebebreite dort um 251
 *  Bildpunkte auf einer Strecke von 87 Bildpunkten, das Gewebe erreicht
 *  also schon 73 Prozent seiner vollen Breite, wenn es 87 Bildpunkte von
 *  der Taille entfernt ist. Bei gleichmaesziger Verdrehung braeuchte es
 *  dafuer eine Verdrehungsrate von 13,6 je Einheit der Bandkoordinate.
 *  Dieselbe Rate ueber die ganze sichtbare Bandlaenge gerechnet ergaebe
 *  bei 0,231 der Bandlaenge einen ZWEITEN Nulldurchgang, also eine zweite
 *  Taille 334 Bildpunkte ueber und unter der ersten und damit beide im
 *  Bild. Steile Oeffnung und nur eine Taille schlieszen sich bei
 *  gleichmaesziger Verdrehung also gegenseitig aus.
 *
 *  Deshalb sitzt die Verdrehung jetzt zum groeszten Teil in der Mitte.
 *  Delta setzt sich aus einem gleichmaeszigen Anteil TWIST_FAR und einem
 *  in der Mitte gebuendelten Anteil TWIST_KNOT zusammen, der ueber die
 *  Laenge KNOT_SPAN einlaeuft. Der Streifen macht damit von Ende zu Ende
 *  nur noch 2 * 1,46 = 2,92 Bogenmasz, also knapp eine halbe Umdrehung,
 *  und ist damit genau der einmal verdrehte Gummistreifen des Bildes.
 *
 *  Der Einwand des Vorgaengers gegen eine gebuendelte Verdrehung ist mit
 *  der stehenden Form entfallen. Er lautete, die Bandenden seien dann
 *  flache Bahnen mit festem Winkel und koennten bei ungluecklicher
 *  Drehlage hochkant stehen, sodass die Struktur auf eine schmale Saeule
 *  zusammenfaellt. Das setzte eine WANDERNDE Drehlage voraus. Sie steht
 *  jetzt, und der feste Winkel an den Enden ist ein Wert, den wir
 *  waehlen: bei 0,315 der Bandlaenge von der Mitte, also am Bildrand,
 *  betraegt Delta 1,34 Bogenmasz und der Sinus davon 0,97. Die Enden
 *  stehen dem Betrachter damit praktisch voll zugewandt, nicht hochkant.
 *
 *  Die Schranke lautet, dass Delta ueber die ganze Periode unter einem
 *  rechten Winkel bleiben muss, sonst schnuert das Gewebe ein zweites Mal
 *  ein und es stehen zwei Taillen im Bild. Genau an dieser Schranke sitzt
 *  die Periode jetzt, denn Delta erreicht an der Periodenkante exakt pi
 *  halbe. Die abgebildete Bandbreite geht mit dem Betrag des Sinus von
 *  Delta, und dieser hat ueber eine Periode genau eine Nullstelle, naemlich
 *  die Taille, und erreicht an beiden Periodenkanten seinen Hoechstwert.
 *  Das Band steht der Naht also voll zugewandt und mit voller Breite
 *  gegenueber, und das ist die Stelle, an der ein Anschlusz am wenigsten
 *  auffaellt.
 *
 *  Die beiden ersten Zahlen sind neu eingepasst, KNOT_SPAN bleibt.
 *
 *  Gefordert sind zwei Dinge zugleich. Die Kurve musz an der
 *  Periodenkante bei 0,5 genau pi halbe erreichen, sonst schlieszt das
 *  Band nicht an sich selbst an. Und ihre Steigung in der Taille musz bei
 *  den bisherigen 15,6 Bogenmasz je Bandkoordinate bleiben, denn an ihr
 *  haengt die Enge der Taille, und die ist abgenommen.
 *
 *  Das sind zwei Gleichungen fuer zwei Unbekannte und die Loesung ist
 *  eindeutig. Aus 0,5 mal TWIST_FAR plus 0,995037 mal TWIST_KNOT gleich
 *  1,570796 und TWIST_FAR plus 20 mal TWIST_KNOT gleich 15,6 folgt
 *  TWIST_KNOT gleich 0,691754 und TWIST_FAR gleich 1,764920.
 *
 *  Die Verdrehung von Periodenkante zu Periodenkante geht damit von
 *  3,5333 auf 3,1416 Bogenmasz zurueck, also um elf Prozent. Was sich im
 *  Bild aendert, ist allein die Breite der Faecher weit auszerhalb der
 *  Taille, und zwar nachgerechnet um hoechstens drei Prozent. Bei der
 *  Bandkoordinate 0,05 liegt die abgebildete Breite bei 99,1 Prozent des
 *  alten Wertes, bei 0,1 bei 97,7, bei 0,2 bei 96,6 und an der untersten
 *  Bildzeile bei 0,315 bei 96,8. In der Taille selbst aendert sich nichts,
 *  weil die Steigung dort festgehalten worden ist. */
const TWIST_FAR = 1.76492;
const TWIST_KNOT = 0.691754;
const KNOT_SPAN = 0.05;

/** Elastische Verjuengung — die eigentliche Sanduhr.
 *
 *  Ein echter Gummistreifen zieht sich dort, wo man ihn zwirbelt,
 *  zusammen: das Material wird an der Verdrehung schmaler. Genau das
 *  fehlte. Bisher blieb der Streifen ueberall gleich breit; die Taille
 *  entstand allein daraus, dass das Band dem Betrachter die Kante
 *  zudreht — eine reine Blickwinkel-Taille, die mit der Drehung durchs
 *  Bild WANDERTE und zeitweise gar nicht zu sehen war.
 *
 *  Die Verjuengung haengt jetzt allein an der Bandkoordinate, nicht am
 *  Blickwinkel. Sie sitzt fest in der Mitte des Streifens und bleibt
 *  dort, egal wie weit sich das Band gedreht hat. Damit steht die
 *  Sanduhr IMMER, und zwar auf halber Bildhoehe — so wie in der
 *  Referenz, wo die Taille ueber Sekunden nicht von der Stelle geht.
 *
 *  Ein Zwischenschritt, der nicht taugte: die Verdrehung selbst in der
 *  Mitte zu buendeln (tanh-Kurve). Dann sind die Enden flache Bahnen
 *  mit FESTEM Winkel — bei ungluecklicher Drehlage stehen sie hochkant
 *  und die ganze Struktur schrumpft auf eine schmale Saeule. Verdrehung
 *  gleichmaeszig, Verjuengung als feste Glocke: beide Anforderungen
 *  ohne diesen Nebeneffekt.
 *
 *  NECK_MIN UND NECK_SPAN SIND ERSATZLOS ENTFALLEN. Sie beschrieben die
 *  Restbreite in der kuenstlichen Taille und die Laenge, ueber die der
 *  Streifen wieder auffaecherte. Diese kuenstliche Einschnuerung ist beim
 *  Uebergang auf die verdrehte Ebene entfallen, denn dort entsteht die
 *  Engstelle allein daraus, dass die Reihen sich dem Betrachter zudrehen.
 *  Beide Zahlen wurden danach zwar noch deklariert und in den Schattierer
 *  eingesetzt, dort aber von keiner Zeile mehr gelesen. Wer an ihnen dreht,
 *  aendert nichts und sucht den Fehler anschlieszend woanders. */

/** Kehlradius und Verwindung des Hyperboloids.
 *
 *  Das vorige Modell setzte alle Punkte einer Hoehe auf eine Strecke, die
 *  DURCH die Achse geht. Ein so gebautes verdrehtes Band hat von Natur aus
 *  gar keine Taille, denn jede Erzeugende trifft die Achse. Deshalb musste
 *  die Einschnuerung ueber eine Glocke erzwungen werden, und genau daraus
 *  entstanden die harte Sanduhr, die scheinbar gekruemmten Faeden und die
 *  Verdrehung, die ueber lange Strecken fast nichts tut und dann kurz vor
 *  der Mitte ausschlaegt.
 *
 *  Beim Hyperboloid laufen die Geraden AN der Achse vorbei. Ihr kleinster
 *  Abstand ist KEHLE, und die Taille entsteht daraus von selbst.
 *
 *  DRALL ist so gewaehlt, dass der Abstand von der Achse am Rand des
 *  Sichtfensters wieder den frueheren Bandradius erreicht. Bei einer halben
 *  Spannweite von 5,75 und einem Zielradius von 2,3 folgt aus
 *  sqrt(KEHLE^2 + (DRALL*5,75)^2) = 2,3 der Wert 0,396.
 *
 *  KEHLE STAND AUF 0,3 UND STEHT JETZT BEI 0,05, und die Zahl ist am
 *  Knoten der Referenz gemessen statt geschaetzt. In der Nahaufnahme
 *  _ref2/vid27/v004.jpg misst der helle Knoten an der Engstelle rund 20
 *  ihrer Bildpunkte in der Breite und rund 32 in der Hoehe. Auf unseren
 *  Maszstab umgerechnet, also mit dem Faktor 1425 geteilt durch 2462, sind
 *  das 12 mal 18 unserer Bildpunkte.
 *
 *  Aus der Breite folgt die Kehle unmittelbar, denn alle Erzeugenden laufen
 *  durch den Kehlkreis und dieser bildet sich als Strecke der Laenge
 *  2 mal KEHLE mal uUnit ab. Aus 12 gleich 2 mal KEHLE mal 129,6 folgt
 *  KEHLE gleich 0,046. Die Hoehe bestaetigt denselben Wert, denn der
 *  Abstand von der Achse verdoppelt sich nach oben und unten jeweils nach
 *  KEHLE geteilt durch DRALL, und 2 mal 0,05 geteilt durch 0,62 mal 0,9713
 *  mal 129,6 ergibt 20 Bildpunkte.
 *
 *  Mit 0,3 war die Engstelle dagegen 78 Bildpunkte breit und 120 hoch. Das
 *  war keine Kreuzung der Erzeugenden mehr, sondern ein Schlauch, der sich
 *  auf ein Drittel verjuengt und wieder oeffnet, und genau so hat er auch
 *  gelesen. Die Faecher selbst bleiben von der Aenderung unberuehrt, denn
 *  schon eine halbe Welteinheit ueber der Engstelle traegt der Summand
 *  KEHLE zum Quadrat weniger als ein Prozent zum Abstand bei. */
/** KEHLE stammt aus dem Hyperboloid-Versuch und wird von der verdrehten
 *  Ebene nicht mehr gebraucht. Der Wert bleibt nur stehen, weil ihn noch
 *  eine Erlaeuterung im Fragment-Teil erwaehnt. */
const KEHLE = 0.05;

/** Verdrehung je Weltlaengeneinheit.
 *
 *  Der Wert ist gerechnet und nicht geraten. Eine Kreuzung entsteht immer
 *  dann, wenn eine Strecke der Kamera die Kante zudreht, also alle PI. Damit
 *  genau EINE Kreuzung im Bild steht und die Faecher an den Bildraendern
 *  ihre volle Breite erreichen, musz die Verdrehung ueber die SICHTBARE
 *  Strecke gerade PI betragen.
 *
 *  Die sichtbare Strecke folgt aus dem Maszstab. Bei 1440 mal 900 misst
 *  unit 180, eine Welteinheit bildet also auf cos(TILT) mal 180 gleich 174,8
 *  Bildpunkte ab, und die 900 des Fensters entsprechen 5,15 Welteinheiten.
 *  Daraus folgt PI geteilt durch 5,15 gleich 0,61.
 *
 *  Zwei verworfene Werte zur Warnung. Bei 0,62 und dem alten Maszstab liefen
 *  253 Grad durch das Fenster, also anderthalb Kreuzungen, und die zweite
 *  drueckte die erste an den Bildrand. Bei 0,44 und dem neuen Maszstab waren
 *  es nur 130 Grad, und die Kreuzung wanderte ganz aus dem Bild. Wer den
 *  Maszstab aendert, musz diesen Wert mitrechnen.
 *
 *  DER WERT BLEIBT BEI 0,512. Ein Versuch mit 0,2735 ist gebaut und wieder
 *  ausgebaut worden; er gehoerte zur ebenfalls verworfenen Anhebung von
 *  TILT auf 0,24 und hielt ueber die Beziehung
 *
 *      Engstelle = RADIUS zum Quadrat mal uUnit mal DRALL mal tan(TILT)
 *
 *  die Engstelle fest, waehrend die staerkere Kippung sie sonst um den
 *  Faktor 1,872 aufgerissen haette. Gemessen hat er das auch geleistet, die
 *  Engstelle stand vorher wie nachher bei 10 Bildpunkten.
 *
 *  Er hat dafuer aber die Kreuzung gekostet. Mit der halbierten Verdrehung
 *  laeuft ueber die sichtbare Strecke nur noch PI halbe statt PI, und aus
 *  dem Kreuzungspunkt wurde eine ueber dreihundert Bildzeilen lange
 *  senkrechte Kehle, die zudem von 53,9 auf 42,7 Prozent der Bildhoehe nach
 *  oben rutschte. Die Begruendung im Ganzen steht bei TILT. */
/** DER WERT GEHT VON 0,512 AUF 0,30, UND DAS IST DIE GROESZTE AENDERUNG AN
 *  DER FORM SEIT DEM UMBAU AUF DIE VERDREHTE EBENE.
 *
 *  Der Auftraggeber hat beanstandet, bei uns schneide sich das Gewebe
 *  oefter hintereinander als bei der Referenz. Bei ihm laufe eine Kreuzung
 *  unmittelbar in die naechste, waehrend die Referenz dazwischen eine Lage
 *  zeigt, in der die Flaeche wie eine Wand vollstaendig frontal
 *  gegenuebersteht. Die Beanstandung trifft zu und sie ist nachrechenbar.
 *
 *  Eine Kreuzung entsteht immer dann, wenn eine Reihe der Kamera die Kante
 *  zudreht, und das geschieht alle PI der Verdrehung. Ueber die sichtbare
 *  Bildhoehe lief die Verdrehung mit dem alten Wert gerade einmal ganz
 *  herum. Bei 1440 mal 900 steht uUnit auf 149,6, eine Welteinheit bildet
 *  also auf cos(TILT) mal 149,6 gleich 145,4 Bildpunkte ab, und die 900 des
 *  Fensters entsprechen 6,19 Welteinheiten. Mit 0,512 sind das 3,17
 *  Bogenmasz und damit 1,01 mal PI. Es stand also zu jedem Zeitpunkt
 *  praktisch genau eine Kreuzung im Bild, und beim Weiterdrehen ging die
 *  eine unmittelbar in die naechste ueber. Die flache Lage dazwischen, in
 *  der die Flaeche dem Betrachter frontal gegenuebersteht, kam nie
 *  zustande, weil sie in dem Augenblick, in dem sie in der Bildmitte
 *  entstanden waere, an beiden Bildraendern schon von der vorigen und der
 *  naechsten Kreuzung eingeklammert war.
 *
 *  Mit 0,30 laufen ueber dieselbe sichtbare Hoehe 1,86 Bogenmasz und damit
 *  0,59 mal PI. Auf eine Kreuzung folgt damit ein Abschnitt von 0,41 mal
 *  PI, in dem keine Kreuzung im Bild steht, und genau das ist die flache
 *  Lage, die der Auftraggeber beschreibt. Ueber den Umlauf gerechnet steht
 *  in 59 Prozent der Drehlagen eine Kreuzung im Bild und in 41 Prozent
 *  keine.
 *
 *  ZWEI NEBENWIRKUNGEN, BEIDE ERWUENSCHT UND BEIDE NACHGERECHNET.
 *
 *  Die Engstelle folgt der Beziehung RADIUS zum Quadrat mal uUnit mal DRALL
 *  mal tan(TILT), sie ist der Verdrehung also unmittelbar proportional. Mit
 *  5,29 mal 149,6 mal 0,512 mal 0,1307 stand sie gerechnet bei 53,0
 *  Bildpunkten und faellt mit 0,30 auf 31,1. Die kleinere Verdrehung
 *  verengt die Taille also um 41 Prozent, und die Referenz haelt mit
 *  demselben Verfahren gemessen 10 Bildpunkte. Wir kommen ihr damit naeher,
 *  ohne an TILT zu ruehren, was nach der Messung des Vorgaengers ohnehin
 *  nur 1,1 Grad am sichtbaren Achswinkel braechte.
 *
 *  Und die Faecher oeffnen sich ueber die Bildhoehe weniger stark, denn die
 *  abgebildete Bandbreite geht mit dem Betrag des Sinus des Windungswinkels
 *  und dieser Winkel legt ueber dieselbe Strecke jetzt nur noch 59 statt
 *  101 Prozent von PI zu. Auch das trifft die Referenz besser, deren Faecher
 *  ueber die ganze Bildhoehe deutlich flacher stehen als unsere.
 *
 *  PHASE0 MUSZ MITGEHEN. Die Weltlage der Kreuzung folgt aus der Bedingung
 *  fuer den rechten Winkel als ph gleich (PI halbe minus PHASE0) geteilt
 *  durch (DRALL mal uSpann). Der Nenner faellt auf das 0,586-fache, also
 *  musz der Zaehler im selben Verhaeltnis schrumpfen, sonst wandert die
 *  Kreuzung aus dem Bild. Die Rechnung steht bei PHASE0. */
/** DRALL GEHT VON 0,30 AUF 0,182121, UND DIESER WERT IST DIE LOESUNG FUER
 *  ZWEI GLEICHE KREUZUNGEN. Er ist nicht gewaehlt, sondern ausgerechnet.
 *
 *  DAS PROBLEM. Zwei aufeinanderfolgende Kreuzungen liegen PI der
 *  Verdrehung auseinander und zeigen DIESELBE Gerade, nur von der anderen
 *  Seite her durchlaufen; die Flaeche bildet die Bandkoordinate aS dort
 *  also auf ihr Negatives ab. Alles, was GERADE in aS ist, sieht an beiden
 *  Kreuzungen gleich aus. Die Scherung ist es nicht: sie verschiebt einen
 *  Punkt um scher mal aS laengs des Bandes und ist damit UNGERADE. An der
 *  einen Kreuzung laeuft der Kamm deshalb mit dem Schwung des Faechers und
 *  die Taille liest als weiche Sanduhr, an der naechsten laeuft er dagegen
 *  und die Taille liest als harte Spitze mit auseinanderlaufenden Speichen.
 *
 *  Zur Gegenprobe ist SHEAR_M auf null gesetzt worden. Die beiden
 *  Kreuzungen unter _ref2/zwei/A-s0.png und B-s0.png sind daraufhin nicht
 *  mehr zu unterscheiden, waehrend eine Senkung von TILT auf 0,025 nichts
 *  gebracht hat. Damit ist die Scherung als Ursache belegt und der Kipp aus
 *  TILT ausgeschlossen; die Rechnung dazu steht bei TILT.
 *
 *  DIE LOESUNG. Die Scherung braucht nicht zu verschwinden, sie musz ihr
 *  Vorzeichen nur GEMEINSAM mit der Bandkoordinate wechseln. Dann ist das
 *  Produkt scher mal aS an beiden Kreuzungen dasselbe und beide sehen
 *  gleich aus, ohne dass der Kamm verlorengeht. Die Scherung lautet
 *
 *      scher(ph) = SCHER_SWING mal sin(2 PI mal ph)
 *
 *  und hat damit die Periode eins in der Weltlage. Sie wechselt ihr
 *  Vorzeichen genau dann, wenn zwei Kreuzungen eine HALBZAHLIGE Zahl von
 *  Perioden auseinanderliegen. Der Abstand zweier Kreuzungen betraegt
 *  PI geteilt durch (DRALL mal uSpann) Perioden, und die Forderung
 *
 *      PI geteilt durch (DRALL mal uSpann) gleich 1,5
 *
 *  liefert DRALL gleich PI geteilt durch (1,5 mal 11,5) gleich 0,182121.
 *  Die naechstkleinere Loesung waere 0,5 statt 1,5 und damit DRALL gleich
 *  0,5464; sie scheidet aus, weil die Verdrehung ueber das Fenster dann
 *  1,115 PI betruege und die flache Phase vollstaendig verschwaende.
 *
 *  WAS DER WERT SONST BEWIRKT. Die Verdrehung ueber die sichtbare
 *  Fensterhoehe betraegt H mal DRALL geteilt durch (cos(TILT) mal uUnit)
 *  und faellt von 0,573 PI auf 0,348 PI; die flache Phase zwischen zwei
 *  Kreuzungen waechst damit von 0,427 PI auf 0,652 PI. Der Auftraggeber hat
 *  die flache Phase ausdruecklich gelobt, sie wird hier also nicht bezahlt,
 *  sondern laenger.
 *
 *  Die Engstelle folgt RADIUS zum Quadrat mal uUnit mal DRALL mal tan(TILT)
 *  und faellt mit der kleineren Verdrehung von 31,4 auf 19,0 Bildpunkte.
 *  Das ist der Preis dieses Wertes; die Taille wird enger, bleibt mit rund
 *  1,3 Kornteilungen aber aufgeloest.
 *
 *  PHASE0 haengt ueber (PI halbe minus PHASE0) geteilt durch DRALL an
 *  diesem Wert und MITLAUF ueber die Zahl der Kreuzungen; beide sind
 *  mitgezogen worden, siehe dort. */
const DRALL = 0.182121;

/** Die FESTE Drehlage der Flaeche. Sie laeuft nicht mehr, sie steht.
 *
 *  Ein Viertelkreis dreht dem Betrachter genau in der Bandmitte die
 *  Kante zu. Der Windungswinkel lautet PHASE0 + drallAt(ph), also
 *  wird er an jeder Taille zum rechten Winkel und die abgebildete
 *  Bandbreite geht dort gegen null. Genau dort sitzt auch die
 *  Materialtaille. Blickwinkel-Taille und Materialtaille fallen damit
 *  DAUERHAFT aufeinander, statt wie bisher mit der Drehlage
 *  auseinanderzulaufen. Das ist der eine Grund, warum die Silhouette
 *  jetzt stillsteht. */
/** Die Anfangsphase legt fest, WO im Bild die Kreuzung steht.
 *
 *  Sie sitzt dort, wo der Winkel zum rechten wird, also bei
 *  DRALL * ph * uSpann gleich PI halbe minus PHASE0. Bei PI halbe war das
 *  die Weltlage null, und die stand bei Versatz null nur 200 Bildpunkte
 *  unter dem oberen Rand, weil der Mitlauf an dieser Stelle bereits 0,12
 *  Perioden betraegt. Der Auftraggeber will die Kreuzung bei 50 bis 60
 *  Prozent der Bildhoehe.
 *
 *  Die Richtung ist am Bild bestimmt und nicht hergeleitet, denn die
 *  Bildhoehe laeuft entgegen der Weltachse und der Mitlauf schlaegt an
 *  dieser Stelle zusaetzlich zu Buche. Eine KLEINERE Phase hebt die
 *  Kreuzung, eine groeszere senkt sie.
 *
 *  Zwei Messpunkte spannen die Gerade auf. Bei PI halbe steht die Kreuzung
 *  auf 200 Bildpunkten, bei 3,07 auf 850. Eine Aenderung um 1,50 Bogenmasz
 *  verschiebt sie also um 650 Bildpunkte. Fuer die vom Auftraggeber
 *  geforderten 500 fehlen von 200 aus 300 Bildpunkte, das sind 0,69
 *  Bogenmasz.
 *
 *  Ein Versuch mit 1,399 ist gebaut und wieder ausgebaut worden; er war die
 *  gerechnete Nachfuehrung zum ebenfalls verworfenen DRALL von 0,2735. Die
 *  Weltlage der Kreuzung folgt aus der Bedingung fuer den rechten Winkel als
 *
 *      ph = (PI halbe minus PHASE0) geteilt durch (DRALL mal uSpann),
 *
 *  und damit sie beim halbierten DRALL stehenbleibt, musz der Zaehler im
 *  selben Verhaeltnis schrumpfen. Wer DRALL je wieder anfaeszt, musz diese
 *  Zahl mitrechnen, sonst rutscht die Kreuzung aus dem Bild.
 *
 *  DER WERT GEHT VON 1,25 AUF 1,03 UND HOLT ZURUECK, WAS DIE ANHEBUNG VON
 *  LEAN AN DER HOEHE DER KREUZUNG GEKOSTET HAT. Eine Drehung in der
 *  Bildebene laeszt die Kreuzung nicht stehen, sondern fuehrt sie auf einem
 *  Kreisbogen um die Bildmitte mit; nachgemessen stieg sie dabei von 53,9
 *  auf 46,2 Prozent der Bildhoehe, waehrend die Vorgabe auf rund 60 Prozent
 *  lautet. Die Bildmitte uCenterPx dafuer zu verschieben waere der falsche
 *  Weg, denn an ihr haengt zugleich die Lage des Ausklangs am unteren
 *  Bildrand.
 *
 *  DIE OBEN AUS ZWEI MESSPUNKTEN AUFGESPANNTE RICHTUNG STIMMT NICHT MEHR.
 *  Sie stammt aus der Zeit vor dem Umbau auf die verdrehte Ebene und sagt,
 *  eine groeszere Phase senke die Kreuzung. Am heutigen Stand nachgemessen
 *  ist es umgekehrt: mit 1,40 statt 1,25 stieg die Kreuzung von 46,2 auf
 *  41,0 Prozent der Bildhoehe. Aus diesen beiden Messpunkten folgt eine
 *  Steigung von 34,7 Prozentpunkten je Bogenmasz nach OBEN, und fuer die
 *  fehlenden 7,7 Prozentpunkte nach unten damit 1,25 minus 0,22 gleich
 *  1,03. */
/** DER WERT GEHT VON 1,03 AUF 1,254 UND IST DIE NACHFUEHRUNG ZUR KLEINEREN
 *  VERDREHUNG.
 *
 *  Die Weltlage der Kreuzung ist ph gleich (PI halbe minus PHASE0) geteilt
 *  durch (DRALL mal uSpann). Damit sie an derselben Stelle im Bild
 *  stehenbleibt, waehrend DRALL von 0,512 auf 0,30 faellt, musz der Zaehler
 *  im selben Verhaeltnis schrumpfen. Aus PI halbe minus 1,03 gleich 0,5408
 *  mal 0,30 geteilt durch 0,512 gleich 0,3169 folgt PHASE0 gleich 1,5708
 *  minus 0,3169 gleich 1,254.
 *
 *  Die gemessene Steigung von 34,7 Prozentpunkten der Bildhoehe je
 *  Bogenmasz gilt ab jetzt NICHT MEHR. Sie ist der Betrag von
 *  d(Bildhoehe)/d(PHASE0) und dieser haengt ueber den Nenner an DRALL; mit
 *  der kleineren Verdrehung wird er um den Faktor 0,512 geteilt durch 0,30
 *  gleich 1,71 groeszer und liegt damit bei rund 59 Prozentpunkten je
 *  Bogenmasz. Wer die Kreuzung nachstellt, rechnet mit dieser Zahl und
 *  misst anschlieszend nach.
 *
 *  DIE RECHNUNG HAELT DIE WELTLAGE FEST, ABER NICHT DIE BILDLAGE, und der
 *  Wert steht deshalb am Ende bei 1,118 und nicht bei 1,254. Nachgemessen
 *  mit _ref2/lichtleiter.mjs stand die Kreuzung mit 1,254 bei 50,9 bis 53,8
 *  Prozent der Bildhoehe und damit rund acht Prozentpunkte ueber der
 *  Vorgabe. Der Grund ist, dass mit der kleineren Verdrehung auch die FORM
 *  der Engstelle flacher geworden ist; die hellste Stelle des Gewebes faellt
 *  deshalb nicht mehr genau mit der gerechneten Kantenlage zusammen.
 *
 *  Aus acht Prozentpunkten und der oben hergeleiteten Steigung von 59
 *  Prozentpunkten je Bogenmasz folgt 1,254 minus 0,136 gleich 1,118.
 *
 *  Nachgemessen steht die Kreuzung damit auf der Oberkante der Sektion bei
 *  58,4 Prozent der Bildhoehe und 72,4 Prozent der Breite gegen die Vorgabe
 *  von rund 60 Prozent der Hoehe und 70 bis 75 Prozent der Breite. */
/** DER WERT BLEIBT BEI 1,118, UND ZWAR AUCH NACH DER RUECKNAHME VON LEAN.
 *
 *  LEAN dreht das Bild um uCenterPx, und die Kreuzung steht nur rund 140
 *  Bildpunkte unter diesem Drehpunkt. Eine Aenderung von LEAN um 0,16
 *  Bogenmasz verschiebt sie deshalb vor allem waagerecht, naemlich um rund
 *  zweiundzwanzig Bildpunkte nach rechts, und senkrecht so gut wie gar
 *  nicht. Nachgemessen steht die Kreuzung nach der Rueckname von LEAN
 *  weiterhin dort, wo die Vorgabe sie haben will.
 *
 *  Fuer den Fall, dass MITLAUF je wieder angefaszt wird, steht hier die
 *  Nachfuehrung. Die Bildlage haengt am Platz im Fenster, und dieser ist
 *  platz gleich ph minus uTravel mit ph gleich (PI halbe minus PHASE0)
 *  geteilt durch (DRALL mal uSpann). Auf der Oberkante der Sektion steht
 *  der gemessene Weg bei 150 Bildpunkten und die Periode bei 1706,3
 *  Bildpunkten, uTravel betraegt dort also MITLAUF mal 150 geteilt durch
 *  1706,3. Damit platz stehenbleibt, musz ph um denselben Betrag wachsen,
 *  und mit DRALL mal uSpann gleich 3,45 folgt daraus die Aenderung von
 *  PHASE0 als minus 3,45 mal der Aenderung von uTravel. */
/** DER WERT GEHT VON 1,118 AUF 1,296 UND IST DIE NACHFUEHRUNG ZUM KLEINEREN
 *  DRALL. Die Weltlage der Kreuzung folgt aus der Bedingung fuer den rechten
 *  Winkel als ph gleich (PI halbe minus PHASE0) geteilt durch (DRALL mal
 *  uSpann); damit sie stehenbleibt, waehrend DRALL von 0,30 auf 0,182121
 *  faellt, musz der Zaehler im selben Verhaeltnis schrumpfen. Aus PI halbe
 *  minus 1,118 gleich 0,4528 mal 0,182121 geteilt durch 0,30 gleich 0,2749
 *  folgt PHASE0 gleich 1,5708 minus 0,2749 gleich 1,2959, gerundet 1,296.
 *
 *  Nachgemessen mit _ref2/kreuzreihe.mjs steht die Kreuzung damit auf der
 *  Oberkante der Sektion bei 60,4 Prozent der Bildhoehe und 72,6 Prozent
 *  der Breite gegen die Vorgabe von rund 60 Prozent der Hoehe und 70 bis 75
 *  Prozent der Breite. */
/** PHASE0 GEHT VON 1,296 AUF 1,359 UND HEBT DIE KREUZUNG AUF DIE VERLANGTEN
 *  SECHZIG PROZENT DER BILDHOEHE.
 *
 *  Nachgemessen sasz der hellste Kern bei ruhender Seite auf der Oberkante
 *  der Sektion bei 584 von 900 Bildpunkten und damit bei 64,9 Prozent, die
 *  Vorgabe lautet rund 60 Prozent. Die Weltlage der Kreuzung folgt aus der
 *  Bedingung fuer den rechten Winkel als ph gleich
 *  (PI halbe minus PHASE0) geteilt durch (DRALL mal uSpann), ihre Bildhoehe
 *  aendert sich mit PHASE0 also um die Periodenlaenge geteilt durch
 *  DRALL mal uSpann, das sind 1493 geteilt durch 2,0944 gleich 713
 *  Bildpunkte je Einheit. Fuer die verlangten 45 Bildpunkte folgt daraus
 *  0,063.
 *
 *  Die Breite stimmt bereits ohne Eingriff. Der Kern steht bei 1042 von 1440
 *  Bildpunkten und damit bei 72,4 Prozent, die Vorgabe lautet 70 bis 75
 *  Prozent; uCenterPx bleibt deshalb unberuehrt. */
const PHASE0 = 1.359;

/** Leichte Kippung, damit man die Windung raeumlich sieht.
 *
 *  CAMERA lag bei 4,6 — nur doppelt so weit weg wie das Band breit ist.
 *  Die Fluchtung war dadurch so stark, dass die zugewandte Bandhaelfte
 *  fast dreimal so weit ausgriff wie die abgewandte; die Sanduhr stand
 *  sichtbar schief statt symmetrisch um ihre Achse. Bei 6,5 blieb die
 *  raeumliche Tiefe erhalten und die grobe Schieflage fiel weg.
 *
 *  Auf 11 gehoben, weil das Verhaeltnis der Fluchtung zwischen dem
 *  zugewandten und dem abgewandten Bandende damit von 1,53 auf 1,28
 *  sinkt. Gemessen am Bedeckungsverhaeltnis der beiden Lappen bringt das
 *  allerdings nur wenig, naemlich 1,92 statt 2,17, und die linke
 *  Gewebekante blieb dabei unveraendert. Die eigentliche Ursache der
 *  Trompete lag woanders, siehe LEAN und den Seitenfaktor im
 *  Vertex-Shader.
 *
 *  TILT wurde versuchsweise auf 0,12 gesenkt. Die linke Gewebekante ging
 *  dabei oben nur von 70,4 auf 68,9 Prozent zurueck, das
 *  Bedeckungsverhaeltnis schwankte je nach Drehlage zwischen 1,05 und
 *  2,63. Der Weg misst also nicht und kostet raeumliche Tiefe, deshalb
 *  bleibt es bei 0,24.
 *
 *  TILT GEHT VON 0,24 AUF 0,13 UND IST DIE STELLSCHRAUBE DER ENGSTELLE.
 *  CAMERA BLEIBT BEI 11 UND HAT MIT IHR NICHTS ZU TUN.
 *
 *  Die Vermutung des Vorgaengers, die Engstelle sei die projizierte Laenge
 *  EINER Reihe und betrage deshalb Versatz mal Fluchtungsunterschied, also
 *  345,6 mal 0,424 gleich 146 Bildpunkte, ist gebaut und am Bild widerlegt.
 *  Sie uebersieht, dass die kantig stehende Reihe im Bild nicht waagerecht
 *  liegt, sondern STEIL: die Kippung bildet ihre beiden Enden 165
 *  Bildpunkte untereinander ab. Eine steile Strecke traegt in einer
 *  einzelnen Bildzeile aber gar keine Breite, sondern nur einen Punkt. Die
 *  sichtbare Engstelle entsteht deshalb nicht aus einer Reihe, sondern aus
 *  der Schar der Reihen um die Kantenlage, und ihre Breite laeszt sich
 *  ausrechnen.
 *
 *  Eine Reihe, deren Winkel um d von der Kantenlage abweicht, sitzt um
 *  A mal d hoeher im Bild, mit A gleich uUnit mal cos(TILT) geteilt durch
 *  DRALL. Ihre Punkte liegen auf einer Geraden, die je Bildzeile um
 *  d geteilt durch sin(TILT) zur Seite laeuft. In der Bildzeile der
 *  Kreuzung steht sie damit um A mal d zum Quadrat geteilt durch sin(TILT)
 *  neben der Achse. Weit reicht sie nur, solange sie diese Bildzeile
 *  ueberhaupt erreicht, also solange A mal d unter ihrer eigenen
 *  senkrechten Halbhoehe RADIUS mal sin(TILT) mal uUnit bleibt. Beides
 *  zusammen ergibt
 *
 *      Engstelle = RADIUS zum Quadrat mal uUnit mal DRALL mal tan(TILT).
 *
 *  CAMERA kommt darin ueberhaupt nicht vor, und genau das zeigt die
 *  Messung. Mit CAMERA gleich 30 statt 11 fiel die gemessene Engstelle von
 *  46 auf 38 Bildpunkte, und die 38 gehen restlos auf die im selben Zug
 *  vorgenommene Senkung von TILT auf 0,20 zurueck: das Modell sagt fuer
 *  0,24 genau 45,9 und fuer 0,20 genau 38,0 voraus. Von der Kamera bleibt
 *  nichts uebrig. Sie ist deshalb auf 11 zurueckgesetzt, denn eine weit
 *  zurueckgezogene Kamera loescht die Fluchtung und damit den Schwenk der
 *  zugewandten Haelfte nach auszen, ohne dafuer etwas zu liefern.
 *
 *  Der Auftraggeber hat mit seiner Vermutung recht behalten. Eine
 *  aufrechtere Stellung verengt die Taille, und zwar linear im Tangens der
 *  Kippung: 0,24 gibt 46 Bildpunkte, 0,20 gibt 38, 0,16 gibt 30, 0,13 gibt
 *  24 und 0,10 gibt 19.
 *
 *  Gewaehlt waren 0,13. Damit halbierte sich die Engstelle gegen den
 *  Ausgangsstand. Die Referenz haelt mit demselben Verfahren gemessen 10
 *  Bildpunkte; dorthin kaeme nur eine Kippung um 0,05, und bei der stehen
 *  die Reihen im Bild praktisch waagerecht, die Struktur verliert ihre
 *  raeumliche Lesart und wird zum Scherenschnitt.
 *
 *  DER VERSUCH, TILT AUF 0,24 ZU HEBEN, IST GEBAUT, GEMESSEN UND WIEDER
 *  AUSGEBAUT WORDEN. Wer ihn noch einmal erwaegt, findet hier die Zahlen.
 *
 *  Der Anlasz war eine Beanstandung des Auftraggebers: die Struktur stehe
 *  komplett senkrecht zum Boden und richte sich gerade nach oben, waehrend
 *  die Referenz schraeg liege. Die Beanstandung trifft zu. Nachgemessen mit
 *  _ref2/final/achse.mjs ueber den Lichtschwerpunkt je Bildzeile liegt die
 *  Achse des unteren Lappens der Referenz in allen Bildern, in denen die
 *  Kreuzung sicher gefunden wird und mittig im Bild steht, bei minus 28,7 /
 *  minus 27,6 / minus 29,9 Grad gegen die Senkrechte, faellt also von rechts
 *  oben nach links unten; unsere liegt bei plus 23,4 Grad und faellt nach
 *  rechts unten.
 *
 *  TILT ist dafuer aber NICHT die Stellschraube, und das ist am Bild
 *  entschieden. Mit TILT gleich 0,24 und dem passend nachgezogenen DRALL
 *  gleich 0,2735 wanderte dieselbe gemessene Achse von plus 23,4 auf plus
 *  22,3 Grad, also um ganze 1,1 Grad, waehrend der Abstand zur Referenz
 *  ueber fuenfzig Grad betraegt.
 *
 *  Der Grund dafuer ist nachrechenbar und haette auffallen muessen. TILT
 *  kippt die Achse in die TIEFE, ueber q.y und q.z, und nicht in der
 *  Bildebene. Eine in der Tiefe gekippte Gerade bildet sich weiterhin als
 *  Gerade durch den Fluchtpunkt ab; schraeg im Bild wird sie nur ueber die
 *  seitliche Verschiebung der Struktur aus der Bildmitte, und dieser
 *  Beitrag betraegt bei einem Achsversatz von 346 Bildpunkten und CAMERA
 *  gleich 11 nur arctan(346 mal sin(TILT) geteilt durch 11 geteilt durch
 *  uUnit), also rund drei Grad. Die Neigung in der BILDEBENE steht
 *  stattdessen in LEAN im Vertex-Teil.
 *
 *  Bezahlt haette der Versuch mit dem, was den Auftrag traegt. DRALL musz
 *  im Verhaeltnis der Tangenten auf 0,2735 zurueck, damit die Engstelle
 *  stehenbleibt, und ueber die sichtbare Strecke laeuft die Verdrehung dann
 *  nur noch PI halbe. Die Kreuzung war damit keine Kreuzung mehr, sondern
 *  eine ueber dreihundert Bildzeilen lange senkrechte Kehle, und sie
 *  rutschte von 53,9 auf 42,7 Prozent der Bildhoehe, also von der Vorgabe
 *  weg statt auf sie zu.
 *
 *  ES BLEIBT DESHALB BEI 0,13, UND DER REST DES ABSTANDES ZUR REFERENZ
 *  LIEGT IN DER FLAECHE SELBST. Ihre Silhouette besteht aus zwei GERADEN,
 *  die sich in einem Punkt kreuzen, unsere aus einer glatten Kehle, in der
 *  beide Faecher nach RECHTS aufgehen. Eine Drehung in der Bildebene kann
 *  das nicht ausgleichen, denn sie dreht beide Lappen gleich weit und
 *  laeszt ihren Oeffnungssinn unberuehrt. */
/** ES BLEIBT BEI 0,13, UND DIE BEHAUPTUNG, TILT SEI DER GRUND FUER DIE
 *  UNGLEICHEN KREUZUNGEN, IST GEMESSEN UND WIDERLEGT.
 *
 *  Ein Vorgaenger hat bei MITLAUF hergeleitet, die zweite Kreuzung sei die
 *  gespiegelte, weil die Sprosse dort um plus oder minus
 *  RADIUS mal sin(TILT) mal uUnit gleich 44,6 Bildpunkte gegen die
 *  Waagerechte kippe und dieses Vorzeichen mit jeder Kreuzung wechsle. Er
 *  hat daraus geschlossen, nur TILT gleich null koenne zwei gleiche
 *  Kreuzungen liefern.
 *
 *  DIE RECHNUNG UEBERSIEHT, DASS DIE BANDKOORDINATE MITKIPPT. Die Bildhoehe
 *  eines Punktes lautet platz mal uSpann mal cos(TILT) minus u mal sin(th)
 *  mal sin(TILT) mit u gleich aS mal RADIUS. An der Kreuzung ist
 *  th gleich PI halbe plus n mal PI, also sin(th) gleich minus eins hoch n.
 *  Zwei aufeinanderfolgende Kreuzungen zeigen aber DIESELBE Gerade, nur von
 *  der anderen Seite her durchlaufen, die Flaeche bildet dort also aS auf
 *  minus eins hoch n mal aS ab. Im Produkt heben sich beide Vorzeichen
 *  heraus und der Kippterm ist von n UNABHAENGIG.
 *
 *  Am Bild bestaetigt. Mit TILT gleich 0,025 faellt der gerechnete Kipp von
 *  45,1 auf 8,1 Bildpunkte und damit weit unter eine Kornteilung von 14,5;
 *  die beiden Kreuzungen unter _ref2/zwei/A-t025.png und B-t025.png sehen
 *  einander trotzdem so unaehnlich wie zuvor. Der Kipp ist also nicht der
 *  Grund.
 *
 *  DER GRUND IST DIE SCHERUNG, und sie steht bei SHEAR_M. Zur Gegenprobe
 *  ist SHEAR_M auf null gesetzt worden; die beiden Kreuzungen unter
 *  _ref2/zwei/A-s0.png und B-s0.png sind daraufhin nicht mehr zu
 *  unterscheiden. Die Loesung steht deshalb bei DRALL und nicht hier.
 *
 *  TILT bleibt bei 0,13 und behaelt damit die raeumliche Tiefe und die
 *  Engstelle, die eine Senkung beide gekostet haette. */
/** TILT GEHT VON 0,13 AUF 0,05, WEIL DER AUFTRAGGEBER FRONTAL AUF DIE MITTE
 *  DER STRUKTUR SEHEN WILL UND NICHT LEICHT VON OBEN HERAB.
 *
 *  Seine Beanstandung lautet, der Effekt sei nicht stark, aber er sei da.
 *  Genau das ist TILT. Der Wert kippt die Struktur ueber
 *  q.y gleich p.y mal cos(TILT) minus p.z mal sin(TILT) in die Tiefe, und
 *  eine Kippung um die Bildwaagerechte liest als erhoehter Standpunkt.
 *
 *  DER WERT IST AM BILD GESUCHT UND NICHT AN EINER ZAHL, und die Grenze nach
 *  unten ist die Plastik. Bei TILT gleich null bildet eine Sprosse auf eine
 *  waagerechte Strecke ab, ihre senkrechte Ausdehnung im Bild betraegt
 *  RADIUS mal sin(TILT) mal uUnit und geht mit dem Winkel gegen null. An der
 *  Kreuzung, wo cos(th) verschwindet, faellt die ganze Sprosse dann auf einen
 *  einzigen Bildpunkt zusammen und die Punktdichte waechst ueber jede Grenze.
 *  Bei 0,05 misst diese senkrechte Ausdehnung noch 14,9 Bildpunkte gegen 38,7
 *  bei 0,13, die Sprosse bleibt also eine Strecke und kein Punkt.
 *
 *  DIE ENGSTELLE GEWINNT DABEI. Sie folgt der Beziehung
 *  RADIUS zum Quadrat mal uUnit mal DRALL mal tan(TILT) und faellt auf das
 *  Verhaeltnis tan(0,05) geteilt durch tan(0,13) gleich 0,383. Der
 *  Auftraggeber hat eine duennere Taille ausdruecklich verlangt, sie kommt
 *  hier also umsonst mit.
 *
 *  DIE GLEICHEN KREUZUNGEN SIND NICHT IN GEFAHR. Ein Vorgaenger hat TILT
 *  gleich 0,025 gebaut und gemessen und dabei nachgewiesen, dass die
 *  Ungleichheit nicht am Kippterm hing, sondern an der Scherung; die beiden
 *  Aufnahmen liegen als _ref2/zwei/A-t025.png und B-t025.png. Die Bedingung
 *  DRALL mal SPANN gleich 2,0944 traegt die Gleichheit und kommt ohne TILT
 *  aus.
 *
 *  DIE HAEUFUNG AN DER KREUZUNG WAECHST UM DEN KEHRWERT DIESES VERHAELTNISSES,
 *  also um das 2,6-fache, denn dieselbe Zahl von Punkten draengt sich auf
 *  eine 2,6-fach kuerzere Strecke. Der Bodenwert des Ausgleichs squeeze geht
 *  deshalb von 0,95 auf 0,36 zurueck; die Rechnung steht dort. */
const TILT = 0.05;
/** DIE KAMERA GEHT VON 11,0 AUF 30,0 UND NIMMT DAS SEITLICHE SCHWANKEN AUS
 *  DER FLACHEN PHASE.
 *
 *  Der Auftraggeber hat die zwei Kreuzungen abgenommen und danach die
 *  gerade Wand dazwischen beanstandet. Sie schwanke beim Scrollen von links
 *  nach rechts, das fuehle sich seekrank an, obwohl dort alles senkrecht
 *  stehen solle.
 *
 *  DIE URSACHE STEHT EINE ZEILE WEITER UNTEN IM VERTEX-TEIL. Dort lautet
 *  die Bildlage px gleich optik plus (flat2 mal uUnit plus versatz) mal
 *  persp, und versatz ist der Abstand der Struktur von der Bildmitte, rund
 *  346 Bildpunkte. Dieser feste Abstand wird also mit der Fluchtung
 *  MULTIPLIZIERT. Die Fluchtung selbst lautet CAM geteilt durch (CAM minus
 *  q.z), und q.z haengt ueber u mal sin(th) an der Drehlage; sie schwankt
 *  deshalb im Takt der Drehung und traegt diesen Takt auf den ganzen
 *  Versatz. Gerechnet lief die Fluchtung bei CAM gleich 11 zwischen 0,828
 *  und 1,262, der Versatz also zwischen 287 und 436 Bildpunkten.
 *
 *  Gemessen mit _ref2/zwei/seite.mjs ueber die Bildreihe der flachen Phase,
 *  alle 150 Bildpunkte im Fenster 780,130,650,730, wanderte der
 *  Lichtschwerpunkt in x um 71,6 Bildpunkte.
 *
 *  Nachgemessen faellt dieser Ausschlag auf 42,5 Bildpunkte bei CAM gleich
 *  30 und auf 39,8 bei CAM gleich 60. Der zweite Schritt bringt also nur
 *  noch 2,7 Bildpunkte, und daran ist die GRENZE abzulesen: rund vierzig
 *  Bildpunkte stammen nicht aus der Fluchtung, sondern daraus, dass der
 *  Faecher sich beim Drehen oeffnet und schlieszt und dabei seine Form
 *  aendert. Dieser Rest ist mit der Kamera nicht zu holen.
 *
 *  DER WERT STEHT DESHALB BEI 30 UND NICHT HOEHER. Er nimmt praktisch den
 *  ganzen Anteil der Fluchtung mit, waehrend groeszere Werte die Abbildung
 *  gegen die Parallelprojektion treiben und der Struktur ihre Plastik
 *  nehmen. Am Bild verglichen, _ref2/zwei/P-cam11.png gegen P-cam30.png und
 *  P-cam60.png, traegt 30 den Tiefenverlauf des Rasters noch sichtbar.
 *
 *  Die Engstelle bleibt unberuehrt. Sie lautet RADIUS zum Quadrat mal uUnit
 *  mal DRALL mal tan(TILT) und enthaelt CAM nicht; an der Engstelle ist die
 *  Tiefe null und die Fluchtung damit eins, gleich welches CAM dort steht.
 *
 *  Die seitliche Unsymmetrie der Silhouette, die die Referenz trifft und
 *  die weiter unten hergeleitet ist, wird dabei SCHWAECHER, weil sie
 *  ebenfalls aus versatz mal persp stammt. Nachgemessen steht die linke
 *  Gewebekante weiterhin bei 63 bis 73 Prozent der Bildbreite, die
 *  Struktur bleibt also in der rechten Bildhaelfte. */
/** DIE KAMERA GEHT VON 30,0 AUF 7,0 ZURUECK, UND DAMIT KOMMT DIE RAEUMLICHE
 *  TIEFE WIEDER, DIE DER SCHRITT AUF 30 GEKOSTET HAT.
 *
 *  Der Auftraggeber hat beanstandet, die Struktur fuehle sich flach an und
 *  nicht wie ein Koerper, der den Raum ausfuellt. Die Ursache steht in der
 *  Zahl selbst. Die Fluchtung lautet CAM geteilt durch (CAM minus q.z), und
 *  q.z laeuft zwischen minus 2,285 und plus 2,285; das ist an der frueher
 *  gerechneten Spanne von 0,828 bis 1,262 bei CAM gleich 11 abzulesen. Das
 *  Verhaeltnis, in dem der naechste und der fernste Teil des Bandes
 *  abgebildet werden, betraegt damit (CAM plus 2,285) geteilt durch (CAM
 *  minus 2,285). Bei CAM gleich 30 sind das 1,165, der ganze Koerper wird
 *  also ueber seine gesamte Tiefe nur um sechzehn Prozent verjuengt. Das
 *  liest kein Auge als Tiefe. Bei 7,0 sind es 1,969, nahe und ferne Teile
 *  werden also fast im Verhaeltnis zwei zu eins abgebildet.
 *
 *  DAS SCHWANKEN, DAS DEN SCHRITT AUF 30 AUSGELOEST HAT, WIRD AN SEINER
 *  WURZEL BESEITIGT UND NICHT MEHR MIT DER KAMERA ERKAUFT. Es stammte
 *  daraus, dass der feste Achsversatz von rund 346 Bildpunkten mit der
 *  Fluchtung MULTIPLIZIERT wurde und deren Takt damit auf die ganze Struktur
 *  trug. Dieser Anteil laeuft jetzt ueber VERSATZ_FLUCHT und ist dort auf
 *  genau den Betrag gedaempft, den er bei CAM gleich 30 hatte; die Rechnung
 *  steht dort. Der Formanteil des Schwankens von rund vierzig Bildpunkten
 *  bleibt unberuehrt, denn er stammt aus dem Oeffnen und Schlieszen des
 *  Faechers und war mit der Kamera ohnehin nie zu holen.
 *
 *  Was die kleinere Kamera GEWINNT, ist der Formanteil der Fluchtung, und
 *  der ist genau das Gesuchte. Laengs einer Sprosse wird das nahe Ende um
 *  achtundvierzig Prozent gedehnt und das ferne um fuenfundzwanzig Prozent
 *  gestaucht; der Punktabstand ueber eine Sprosse hinweg ist damit nicht
 *  mehr gleichmaeszig, sondern traegt ein Gefaelle. Genau dieses Gefaelle
 *  zeigen die Nahaufnahmen der Referenz, siehe _ref2/ref-nah/n068.jpg und
 *  n108.jpg, wo das Gitter zum Saum hin dicht steht und nach der
 *  Gegenseite hin weit aufgeht.
 *
 *  Der Punktdurchmesser traegt dieselbe Auskunft ein zweites Mal. Er lautet
 *  weiter unten uPointSize mal (0,75 plus 0,45 mal persp) und lief bei CAM
 *  gleich 30 nur zwischen dem 1,166- und dem 1,241-fachen, also ueber sechs
 *  Prozent. Bei 7,0 laeuft er zwischen 1,089 und 1,418 und damit ueber
 *  dreiszig Prozent; nahe Punkte sind jetzt sichtbar groeszer als ferne.
 *  Der MITTELWERT wandert dabei kaum, denn ueber ein gleichverteiltes q.z
 *  gemittelt betraegt die Fluchtung 1,038 statt 1,001, der mittlere
 *  Punktdurchmesser also das 1,217-fache statt des 1,200-fachen. Helligkeit
 *  und Bedeckung bleiben davon unberuehrt.
 *
 *  Die Schattierung ist von diesem Schritt nicht betroffen, denn sie rechnet
 *  seit dem letzten Kameraschritt mit der eigenen Kamera SCHAU, siehe die
 *  Begruendung dort. Die Engstelle ist es ebenfalls nicht, denn dort ist die
 *  Tiefe null und die Fluchtung damit eins, gleich welches CAM dort steht.
 *
 *  NACHGEMESSEN KOSTET DIESER SCHRITT KEIN SCHWANKEN, SONDERN NIMMT WELCHES
 *  WEG, UND DAS WIDERLEGT DIE ANNAHME, MIT DER DIE KAMERA AUF 30 GESETZT
 *  WORDEN WAR. Gemessen wurde mit _ref2/raum/schwanken.mjs die Wanderung des
 *  Lichtschwerpunktes in x im Fenster 780,130,650,730 ueber acht Aufnahmen
 *  der flachen Phase von 1000 bis 2400 Bildpunkten Scrollweg, und zwar auf
 *  dem weichgezeichneten Bild, damit die Huelle gemessen wird und nicht das
 *  Hinein- und Hinauslaufen einzelner Saeulen am Fensterrand.
 *
 *  Der Stand vor dieser Runde trug dort 52,5 Bildpunkte. Derselbe Stand wie
 *  jetzt, aber mit CAMERA gleich 30 gebaut, traegt 101,0 Bildpunkte, und der
 *  fertige Stand mit CAMERA gleich 7,0 traegt 87,0. Die kleinere Kamera
 *  senkt den Ausschlag also um vierzehn Bildpunkte, statt ihn zu heben.
 *
 *  Der Zuwachs von 52,5 auf rund neunzig Bildpunkte stammt vollstaendig aus
 *  der neuen Rasterteilung, siehe N_U und N_S. Das Auge liest seither die
 *  Saeulen, und eine Saeule ist eine Schraubenlinie, deren Bogen beim Drehen
 *  seitlich ausschlaegt. Der groeszere Ausschlag IST der vom Auftraggeber
 *  verlangte Schwung, an derselben Zahl ein zweites Mal gemessen; er laeszt
 *  sich nicht abstellen, ohne den Schwung mit abzustellen. */
const CAMERA = 7.0;

/** Die halbe Tiefe des Bandes in Welteinheiten.
 *
 *  Sie ist nicht geraten, sondern aus der frueher gerechneten Spanne der
 *  Fluchtung bei CAM gleich 11 zurueckgerechnet. Aus persp gleich 0,828
 *  folgt q.z gleich 11 minus 11 geteilt durch 0,828 gleich minus 2,285, aus
 *  1,262 ebenso plus 2,284. Der Wert entspricht RADIUS mal cos(TILT) und
 *  wandert deshalb mit RADIUS mit, falls dieser je bewegt wird. */
const Z_HALB = RADIUS * Math.cos(TILT);

/** WIEVIEL DER ACHSVERSATZ VON DER FLUCHTUNG MITBEKOMMT.
 *
 *  Die Bildlage lautet weiter unten optik plus flat2 mal uUnit mal persp
 *  plus versatz mal perspV. Der erste Summand ist die FORM der Struktur, der
 *  zweite ihr fester Abstand von der Bildmitte, rund 346 Bildpunkte.
 *
 *  DIE BEIDEN TRAGEN VOELLIG VERSCHIEDENE DINGE, und genau deshalb duerfen
 *  sie nicht dieselbe Fluchtung bekommen. Am Formanteil haengt die
 *  raeumliche Tiefe, denn er verjuengt ferne Teile des Koerpers gegen nahe.
 *  Am Versatzanteil haengt zweierlei: die seitliche Unsymmetrie der
 *  Silhouette, die die Referenz trifft, und das seitliche SCHWANKEN beim
 *  Scrollen, das der Auftraggeber als seekrank beanstandet hat. Der Versatz
 *  ist eine feste Zahl, seine Fluchtung verschiebt also die ganze Struktur
 *  als Block, und weil q.z im Takt der Drehung wandert, wandert der Block
 *  mit. Gemessen wanderte der Lichtschwerpunkt in x um 71,6 Bildpunkte bei
 *  CAM gleich 11 und um 43,9 bei CAM gleich 30, wovon rund vierzig aus der
 *  Formaenderung des Faechers stammen.
 *
 *  Solange beide Summanden dieselbe Fluchtung teilten, war jede Tiefe mit
 *  Schwanken zu bezahlen und jede Ruhe mit Flachheit. Getrennt ist die Wahl
 *  frei, und die Trennung ist auch keine Willkuer, sondern der Objektivzug
 *  einer Fachkamera: die Blickachse bleibt auf der Struktur, waehrend das
 *  Bild seitlich versetzt wird.
 *
 *  DER WERT IST SO GEWAEHLT, DASS DER VERSATZANTEIL GENAU DEN BETRAG BEHAELT,
 *  DEN ER BEI DER ABGENOMMENEN KAMERA VON 30 HATTE. Bei CAM gleich 30 trug
 *  er versatz mal (persp minus eins) mit persp bis 1,0824, also bis zu 28,5
 *  Bildpunkte. Bei CAM gleich 7,0 laeuft persp bis 1,4846, der ungedaempfte
 *  Anteil betruege also bis zu 167,7 Bildpunkte. Der Faktor ist das
 *  Verhaeltnis dieser beiden Ueberschuesse und wird deshalb gerechnet und
 *  nicht gesetzt; er bleibt damit richtig, falls CAMERA noch einmal bewegt
 *  wird. Bei 7,0 betraegt er 0,170.
 *
 *  Die Unsymmetrie der Silhouette und die Lage der linken Gewebekante
 *  bleiben damit genau dort, wo sie abgenommen worden sind, und der
 *  Versatzanteil des Schwankens ebenso. */
const VERSATZ_CAM_BEZUG = 30.0;
const VERSATZ_FLUCHT =
  (VERSATZ_CAM_BEZUG / (VERSATZ_CAM_BEZUG - Z_HALB) - 1) / (CAMERA / (CAMERA - Z_HALB) - 1);

/** Die Kamera der SCHATTIERUNG, getrennt von der Kamera der Abbildung.
 *
 *  Die Tiefenabschwaechung im Vertex-Teil haengt an der Fluchtung und ist
 *  mit den Stuetzstellen 0,78 und 0,44 auf deren Wertebereich bei CAMERA
 *  gleich 11 eingestellt. Dieser Bereich haengt an CAMERA: bei 11 laeuft
 *  die Fluchtung von 0,83 bis 1,26, bei 30 nur noch von 0,93 bis 1,08. Wer
 *  CAMERA anfaeszt und die Abschwaechung an der wirklichen Fluchtung laeszt,
 *  legt alle Punkte in dasselbe schmale Band, die abgewandte Haelfte wird
 *  nicht mehr dunkler und das ganze raeumliche Gefaelle ist mit einem
 *  Schlag weg. Genau das ist beim Versuch mit CAMERA gleich 30 passiert.
 *
 *  Die Schattierung rechnet deshalb mit einer eigenen, festen Kamera. Sie
 *  ist eine Gestaltungsentscheidung ueber das Gefaelle zwischen der
 *  zugewandten und der abgewandten Haelfte und hat mit der Staerke der
 *  Fluchtung nichts zu tun. Der Zahlenwert ist der von CAMERA, solange
 *  CAMERA bei 11 steht; die Trennung kostet nichts und faengt den naechsten
 *  Versuch mit der Kamera ab. */
const SCHAU = 11.0;

/** Die Bezugsabstaende des Rasters, gemessen bei 1440 mal 900.
 *
 *  Dort ist die Leinwand 1425 Bildpunkte breit, weil rechts die
 *  Bildlaufleiste steht, und der Maszstab steht deshalb auf 128,25 und
 *  nicht auf 129,6. Die Periode misst SPANN mal cos(TILT) mal 128,25
 *  gleich 1432,6 Bildpunkte und die Bandbreite 2 mal RADIUS mal 128,25
 *  gleich 589,9. Auf diesen Zustand ist das ganze Material eingestellt,
 *  also stehen die Sprossen 7,96 und die Spalten 4,92 Bildpunkte
 *  auseinander. Der Rasterschritt haelt diese beiden
 *  Abstaende auf jedem Schirm ein und wird deshalb aus ihnen gerechnet
 *  statt aus dem Maszstab allein. */
const BEZUG_UNIT = 128.25;
const BEZUG_REIHE = (SPANN * Math.cos(TILT) * BEZUG_UNIT) / N_U;
const BEZUG_SPALTE = (2 * RADIUS * BEZUG_UNIT) / N_S;

/** Der Flusz der Punkte laengs des Bandes. Ruhe langsam, Scroll gibt
 *  Schub.
 *
 *  Die Einheit hat sich mit dem Umbau vollstaendig geaendert und die
 *  alten Zahlen sind deshalb NICHT uebertragbar. Frueher war es eine
 *  Winkelgeschwindigkeit im Bogenmasz je Sekunde, jetzt ist es ein
 *  Anteil der Bandlaenge je Sekunde.
 *
 *  Umrechnung in sichtbares Tempo. Eine Periode misst
 *  SPANN*cos(TILT)*uUnit = 9,4685 * 0,9713 * 129,6 = 1191,5 Bildpunkte
 *  bei 1440 mal 900. Ein Punkt legt je Sekunde IDLE_FLOW mal diese
 *  Strecke zurueck.
 *
 *  Der Rechenwert entscheidet hier ausnahmsweise, und zwar weil das
 *  Meszwerkzeug an dieser Stelle nicht traegt. _ref2/flow.mjs sucht die
 *  Verschiebung ueber einen Blockvergleich mit ganzzahligem Versatz. Das
 *  Gewebe ist aber ein regelmaesziges Raster mit 4,8 Bildpunkten
 *  Reihenabstand, und der Blockvergleich rastet auf der NAECHSTEN Reihe
 *  ein statt auf der wirklichen Verschiebung. Nachgemessen im Fenster
 *  1120,620,260,240 ueber je zwei Sekunden meldete das Werkzeug bei
 *  0,00178 einen Wert von 0,5 Bildpunkten je Sekunde und bei 0,00185 wie
 *  bei 0,00193 uebereinstimmend 3,5 — eine Rate um acht Prozent
 *  auseinander, ein Messwert um das Siebenfache. Ueber sechs Sekunden
 *  gemessen kehrt sich die Reihenfolge sogar um, 2,6 gegen 2,2 und 2,3.
 *  Die Zahlen 2,3, 2,8 und 3,0 des Vorgaengers liegen samt und sonders
 *  innerhalb dieses Rauschens.
 *
 *  Belastbar ist dagegen die geschlossene Formel, denn der Flusz ist eine
 *  reine Verschiebung laengs des Bandes ohne jeden freien Parameter.
 *
 *  ZUR RICHTUNG stand hier, der Blockvergleich ueber die Zeitreihe der
 *  Referenz melde eine senkrechte Verschiebung von minus eins bis minus
 *  vier Bildpunkten, ihr Gewebe steige also. Das ist WIDERLEGT. Die
 *  Bildreihe, auf die sich die Aussage stuetzte, gehoert nicht zu ref26.
 *  Nachgemessen mit _ref2/wandern.mjs ueber alle sechs Bildpaare von f006
 *  bis f012 im Fenster 760,150,150,150 liefert der Blockvergleich
 *  durchgaengig dx gleich minus eins und dy gleich NULL, bei einer
 *  Uebereinstimmung von 0,82 bis 0,86. Das Gewebe der Referenz wandert
 *  also waagerecht nach links und steigt nicht.
 *
 *  Unser Gewebe kann diese Richtung nicht annehmen, ohne die Geometrie
 *  anzufassen, und die steht unter Bestandsschutz. Der Flusz laeuft laengs
 *  der Bandkoordinate, und die Bahnen des Bandes stehen im oberen Lappen
 *  steil; gemessen wandert unser Gewebe dort mit dx gleich plus zwei und
 *  dy gleich minus acht je drei Sekunden. Der Betrag von 2,75 Bildpunkten
 *  je Sekunde stimmt mit der Rechnung ueberein, die Richtung nicht.
 *  Das ist ein offener Punkt und keine geloeste Aufgabe.
 *
 *  CLIMB ist ERSATZLOS entfallen und bleibt es. Der Term hing die
 *  Verdrehung direkt an der Scrollhoehe; beim Hochscrollen lief die
 *  Animation dadurch rueckwaerts und das fuehlte sich wie ein Widerstand
 *  an. Der Flusz laeuft immer in dieselbe Richtung, Scrollen gibt ihm
 *  nur einen richtungsunabhaengigen Schub ueber den BETRAG der
 *  Scrollgeschwindigkeit.
 *
 *  BOOST_MAX steht beim 1,12-fachen von IDLE_FLOW. Die Begruendung dafuer
 *  war, _ref2/schub.mjs habe genau dieses Verhaeltnis gemessen. Sie
 *  TRAEGT NICHT. schub.mjs bildet die auf den Eigenkontrast normierte
 *  Bildaenderung, und deren Grundwert lag bei 0,78; so nahe an der Eins
 *  ist das Masz gesaettigt und kann ein Verhaeltnis von 1,12 gar nicht
 *  von einem von 1,5 unterscheiden. Die Zahl ist also nicht gemessen,
 *  sondern eine gewaehlte Zurueckhaltung: der Schub soll das Gewebe
 *  beleben und nicht zum Rasen bringen. Wer sie aendern will, braucht
 *  zuerst ein Masz, das nicht saettigt.
 *
 *  Achtung bei der Messung. Der Blockvergleich ueber einen senkrechten
 *  Streifen (_ref2/krit-drift.mjs) misst waehrend eines Scrolls den
 *  mitlaufenden GRUND der Sektion und meldet vor wie nach jeder Aenderung
 *  dieselben 60 Bildpunkte je Sekunde. Fuer die Ruhegeschwindigkeit ist
 *  _ref2/flow.mjs das richtige Werkzeug. */
/** Die beiden Zahlen sind zweimal umgerechnet worden, und zwar aus zwei
 *  ganz verschiedenen Gruenden.
 *
 *  Der Grund ist die ausdrueckliche Ansage des Auftraggebers, die
 *  Struktur solle sich in Ruhe ganz, ganz langsam bewegen. Das Ruhetempo
 *  geht deshalb von 3,0 auf 1,75 Bildpunkte je Sekunde zurueck, und daraus
 *  folgt IDLE_FLOW gleich 1,75 geteilt durch 1447,7 gleich 0,001209. Am
 *  fertigen Bild gemessen ergibt das 1,73 Bildpunkte je Sekunde, denn die
 *  Leinwand ist mit 1425 etwas schmaler als das Fenster.
 *
 *  Der Schub bleibt dagegen unveraendert bei seinen 3,36 Bildpunkten je
 *  Sekunde, BOOST_MAX steht also weiter auf 0,00232. Er macht
 *  damit das Zweifache des Ruhetempos aus statt wie zuvor das
 *  1,12-fache, und beim Scrollen laeuft das Gewebe mit 5,1 statt 1,75
 *  Bildpunkten je Sekunde. Genau das verlangt der zweite Punkt des
 *  Auftrags, naemlich dass die Bewegung beim Scrollen schneller wird.
 *  Die Zurueckhaltung, die frueher hinter der Zahl 1,12 stand, ist damit
 *  aufgegeben, und sie war ohnehin nie gemessen.
 *
 *  BEIDE ZAHLEN GEHEN JETZT UM DAS 2,75-FACHE HOCH, und der Anlasz ist
 *  wieder eine ausdrueckliche Rueckmeldung des Auftraggebers, diesmal in
 *  die andere Richtung. Die Ruhe war zu langsam.
 *
 *  Die Referenz dreht ihr Netz starr um die senkrechte Achse, im Klartext
 *  ihres Bundles steht rotation.y gleich time mal minus 1e-5 mal 3,53,
 *  also minus 0,0353 Bogenmasz je Sekunde; eine volle Umdrehung dauert
 *  178 Sekunden. Sichtbar sind daraus 9,2 bis 9,7 Bildpunkte je Sekunde im
 *  breiten zugewandten Teil, 2,2 bis 3,7 im mittleren Bereich und 0,5 bis
 *  3,2 nahe der Engstelle.
 *
 *  Ihr Hoechstwert von 9,6 waere hier die falsche Zahl. Unsere Bewegung
 *  laeuft ueberall gleich schnell, waehrend die Referenz nur an ihrer
 *  breitesten Stelle so schnell ist; wir muessen also ihren MITTLEREN
 *  Eindruck treffen und nicht ihre Spitze. Gewaehlt sind 4,8 Bildpunkte je
 *  Sekunde, woraus IDLE_FLOW gleich 4,8 geteilt durch 1443,6 gleich
 *  0,003325 folgt.
 *
 *  BOOST_MAX steht unveraendert beim 1,92-fachen von IDLE_FLOW und ist im
 *  selben Verhaeltnis mitgezogen worden. Das Gefaelle zwischen Ruhe und
 *  Schub bleibt damit genau erhalten.
 *
 *  DIE OBEN GERECHNETEN 4,8 BILDPUNKTE JE SEKUNDE SIND VERALTET UND WAREN
 *  NIE AM BILD NACHGEMESSEN. Sie stammen aus der Zeit, als uUnit bei 129,6
 *  stand und eine Periode 1443,6 Bildpunkte masz; heute steht uUnit bei
 *  151,2 und eine Periode bei 1688,8 Bildpunkten. Auszerdem ist die
 *  Rechnung unvollstaendig, denn sie nimmt nur die Verschiebung LAENGS der
 *  Achse. Ein Punkt dreht sich mit dem Flusz zugleich um die Achse, und die
 *  Fluchtung vergroeszert die zugewandte Haelfte noch einmal um bis zu
 *  einem Viertel.
 *
 *  Nachgemessen wird jetzt am laufenden Bild statt gerechnet. Der Screencast
 *  des Browsers liefert dreiszig Bilder je Sekunde, und der normierte
 *  Blockvergleich ueber ein Raster von Bloecken gibt daraus das
 *  Geschwindigkeitsfeld, siehe _ref2/vier/film.mjs und _ref2/vier/feld.mjs.
 *  Der kleine Zeitschritt ist dabei nicht Bequemlichkeit, sondern
 *  Notwendigkeit: bei einer Gitterteilung von acht Bildpunkten und knapp
 *  zehn Bildpunkten Weg je Sekunde verschiebt eine Aufnahme alle sieben
 *  Zehntelsekunden das Muster um fast genau eine Masche, und dann laeszt
 *  sich vorwaerts von rueckwaerts nicht mehr unterscheiden. Genau in diese
 *  Falle sind die frueheren Richtungsmessungen gelaufen.
 *
 *  Gemessen traegt unser Stand mit IDLE_FLOW gleich 0,003325 ein nach
 *  Belegung gewichtetes Mittel von 6,85 Bildpunkten je Sekunde, mit p50
 *  gleich 6,7 und p90 gleich 10,4. Die Referenz traegt in denselben
 *  Bloecken ihres Faechers 2,4 / 8,1 / 11,3 / 12,0 / 21,6, im Mittel also
 *  rund 9,8. Wir laufen damit um den Faktor 1,43 zu langsam, und genau das
 *  ist die Rueckmeldung des Auftraggebers.
 *
 *  IDLE_FLOW geht deshalb von 0,003325 auf 0,00482, also um den Faktor
 *  1,45. Das gewichtete Mittel steht damit bei rund 9,9 Bildpunkten je
 *  Sekunde und trifft die Referenz.
 *
 *  Eine Gewichtung des Flusses mit der oertlichen Zuwendung der Flaeche ist
 *  geprueft und VERWORFEN. Sie waere der sauberere Weg, wenn sie sich ohne
 *  Bruch einbauen liesze, aber sie laeszt sich hier nicht bauen. Der Flusz
 *  greift an der Materialkoordinate an, und ein Flusz, dessen Rate vom Ort
 *  des Punktes abhaengt, ist ein Geschwindigkeitsfeld mit Quellen und
 *  Senken: die Punkte laufen ueber der Zeit zusammen und das Gitter reiszt
 *  auf. Die Referenz braucht keine Gewichtung, weil ihre Bewegung eine
 *  starre Drehung ist und die Verteilung dort von selbst entsteht. Unsere
 *  Flaeche ist eine verdrehte Ebene, auf der eine Drehung um die Achse
 *  dasselbe ist wie eine Verschiebung laengs der Achse; die einzige starre
 *  Bewegung ist deshalb die Schraubung, und die traegt einen ueberall
 *  gleichen Anteil laengs der Achse plus einen mit dem Achsabstand
 *  wachsenden Anteil quer dazu. Gemessen laeuft unser Feld dadurch von 4,1
 *  am Rand des Faechers bis 11,5 auszen, hat also durchaus ein Gefaelle,
 *  nur ein flacheres als die Referenz.
 *
 *  DER GEDAEMPFTE SCHUB AN DER SCROLLGESCHWINDIGKEIT IST ERSATZLOS
 *  ENTFALLEN UND DURCH DIE ANKOPPLUNG AN DEN SCROLLWEG ERSETZT, siehe
 *  SCROLL_DREH gleich hier unten. Der Auftraggeber hat am laufenden Bild
 *  festgestellt, dass sich beim Scrollen nichts schneller dreht, und die
 *  Ursache lag in der Bauart des Schubes selbst. Er hing am BETRAG der
 *  Scrollgeschwindigkeit, erreichte auch bei zuegigem Scrollen nur das
 *  Fuenffache des Ruhetempos und lief dabei ueber eine Zeitkonstante von
 *  vier Zehntelsekunden an, sodass ein kurzer Wisch von drei
 *  Zehntelsekunden nur gut die Haelfte davon abrief. Wer kurz wischt, sah
 *  davon so gut wie nichts. */
const IDLE_FLOW = 0.00482;

/** Der Umlauf der Spalten quer ueber das Band, in Umlaeufen je Sekunde.
 *
 *  Diese Bewegung traegt die SICHTBARE Drehrichtung, und ihr Vorzeichen ist
 *  im Vertex-Teil an das Vorzeichen von cos(th) gekoppelt, damit sie ueber den
 *  ganzen Scrollweg dieselbe bleibt. Die vollstaendige Herleitung samt der
 *  Messung, die den Fehler gezeigt hat, steht dort bei drehSinn.
 *
 *  Der Zahlenwert folgt aus der gemessenen Wanderung, die er ersetzen soll.
 *  Die waagerechte Bildgeschwindigkeit betraegt zwei mal RADIUS mal uUnit mal
 *  dieser Rate, bei 1440 mal 900 also 598 mal die Rate in Bildpunkten je
 *  Sekunde. Die alte, wechselnde Wanderung lag bei hoechstens drei
 *  Bildpunkten je Sekunde; damit die neue sie sicher ueberlagert und nicht
 *  nur ausgleicht, steht sie mit 7,0 Bildpunkten je Sekunde beim
 *  2,3-fachen davon, und daraus folgt 0,0117. Ein Punkt braucht damit 85
 *  Sekunden fuer einen vollen Umlauf ueber das Band und rueckt alle 1,5
 *  Sekunden um eine Spalte weiter. Das ist derselbe Groeszenbereich wie beim
 *  Flusz laengs des Bandes, der einen Punkt alle 2,5 Sekunden um eine Sprosse
 *  weiterschiebt. */
const SPIN_RATE = 0.0117;

/** Die Ankopplung des Flusses an den SCROLLWEG, in Perioden je
 *  Bildpunkt Scrollweg.
 *
 *  Das ist der Nachbau der Referenz und keine eigene Erfindung. In ihrem
 *  Quelltext steht die Drehung um die senkrechte Achse als
 *
 *      rotation.y = 1.36 + scrollY * -0.001
 *      rotation.y += time * -3.53e-5
 *
 *  Der Scrollweg treibt dort also DIESELBE Groesze wie die Zeit, mit
 *  demselben Vorzeichen und mit einem festen Faktor. Beides zusammen
 *  ergibt genau das Verhalten, das der Auftraggeber beschreibt: die
 *  Struktur dreht sich in Ruhe langsam weiter und einen Ticken schneller,
 *  solange man scrollt.
 *
 *  Die Umrechnung auf unsere Groeszen laeuft ueber das VERHAELTNIS der
 *  beiden Terme der Referenz und nicht ueber ihre Zahlenwerte, denn sie
 *  rechnet in Bogenmasz und wir in Perioden. Ihr Ruhetempo betraegt
 *  3,53e-5 Bogenmasz je Millisekunde, also 0,0353 je Sekunde; ein
 *  gescrollter Bildpunkt traegt 0,001 Bogenmasz und ist damit
 *  0,001 / 0,0353 = 0,02833 Sekunden Ruhedrehung wert. Mit unserem
 *  IDLE_FLOW von 0,00482 Perioden je Sekunde folgt daraus
 *
 *      SCROLL_DREH = 0,02833 * 0,00482 = 1,366e-4 Perioden je Bildpunkt.
 *
 *  Damit steht unser Verhaeltnis von Scroll zu Ruhe genau auf dem der
 *  Referenz. Ein Scroll von 120 Bildpunkten dauert rund eine
 *  Viertelsekunde und traegt 0,01639 Perioden, waehrend die Ruhe in
 *  derselben Zeit 0,001205 Perioden schafft; das Muster bewegt sich beim
 *  Scrollen also DREIZEHNEINHALBMAL so weit wie in Ruhe. Die Vorgabe
 *  lautet mindestens zehnmal. Bei zuegigem Scrollen von tausend
 *  Bildpunkten je Sekunde ergibt dieselbe Rechnung das Achtundzwanzigfache.
 *
 *  Der Term ist eine REINE FUNKTION DES SCROLLSTANDES und wird nicht
 *  aufsummiert, genau wie der Weltversatz weiter unten. Daraus folgt
 *  unmittelbar, dass die Struktur beim Zurueckscrollen denselben Weg
 *  zurueckgeht und an derselben Stelle wieder ankommt; es gibt nichts,
 *  was sich verlaufen oder aufstauen koennte.
 *
 *  DIE DREHUNG KEHRT SICH BEIM HOCHSCROLLEN DAMIT UM, und das ist
 *  beabsichtigt, denn die Referenz tut dasselbe. Der frueher bemaengelte
 *  Widerstand beim Hochscrollen stammte aus einer anderen Lage: damals
 *  hing die Verdrehung an der Scrollrichtung, waehrend die Parallaxe
 *  ungerichtet weiterlief, und die beiden liefen deshalb gegeneinander.
 *  Heute haengen BEIDE am vorzeichenbehafteten Scrollweg und kehren sich
 *  gemeinsam um, sodass die ganze Geste zurueckgespult wirkt statt zu
 *  haken.
 *
 *  Der Rueckwaertsanteil ist ungedaempft gelassen. Wer ihn doch daempfen
 *  will, darf das nicht ueber eine Fallunterscheidung nach der
 *  Scrollrichtung tun, denn die zerstoert die reine Funktion des
 *  Scrollstandes und laeszt die Drehlage bei jedem Hin und Her
 *  davonlaufen. Der einzige saubere Weg ist eine ungerade, monoton
 *  steigende Kennlinie ueber dem Scrollweg selbst. */
/** DER WERT BLEIBT BEI 1,366e-4, UND DAS IST DIE FOLGE DAVON, DASS MITLAUF
 *  BEI 0,30 BLEIBT.
 *
 *  Zuerst ist festzuhalten, was dieser Wert TUT und was er NICHT tut, denn
 *  daran ist in diesem Durchgang eine Erwartung gescheitert. Der Flusz geht
 *  als w gleich aU plus uFlow in den Vertex-Teil, dort wird platz gleich
 *  fract(w plus Scherung minus uTravel) minus 0,5 gebildet und ph gleich
 *  platz plus uTravel. In ph kuerzt sich uFlow damit VOLLSTAENDIG heraus.
 *  Der Drehwinkel th gleich PHASE0 plus DRALL mal ph mal uSpann haengt
 *  allein an uTravel, und die Kreuzung steht deshalb dort, wo uTravel sie
 *  hinstellt. SCROLL_DREH laeszt die PUNKTE durch das Muster laufen und
 *  bewegt die Kreuzung nicht um einen einzigen Bildpunkt. Wer die Zahl der
 *  Kreuzungen ueber den Scrollweg aendern will, musz an MITLAUF und nicht
 *  hier drehen; die vollstaendige Rechnung steht dort.
 *
 *  Der Wert haelt das Verhaeltnis zwischen dem Lauf der Punkte und dem Lauf
 *  des Musters fest. Beide verschieben denselben Ausdruck, der eine ueber
 *  uFlow und der andere ueber uTravel, und ihr Verhaeltnis betraegt
 *  1,366e-4 geteilt durch 0,30 geteilt durch 1706,3 gleich 0,777. Wer
 *  MITLAUF je aendert, musz diesen Wert im selben Verhaeltnis mitziehen,
 *  sonst laeuft das Korn gegen die Struktur davon.
 *
 *  Im Versuch mit MITLAUF gleich 0,62 hat er entsprechend bei 2,823e-4
 *  gestanden und ist zusammen mit jenem Versuch zurueckgenommen worden. */
/** DER WERT GEHT VON 1,366e-4 AUF 4,553e-4 UND FOLGT MITLAUF.
 *
 *  Der Vorgaenger hat oben festgehalten, dass dieser Wert im selben
 *  Verhaeltnis mitzuziehen ist, sobald MITLAUF sich aendert, damit die
 *  Punkte gegenueber dem Muster ihre Geschwindigkeit behalten. Aus 1,366e-4
 *  mal 1,00 geteilt durch 0,30 folgt 4,553e-4. */
const SCROLL_DREH = 4.553e-4;

/** Der Mitlauf, also wieviel die Struktur vom Scrollweg der Seite
 *  uebernimmt.
 *
 *  Die Ankopplung haengt am SCROLLWEG und nicht an der
 *  Scrollgeschwindigkeit. Nur so folgt die Struktur unmittelbar der Geste
 *  und kehrt beim Zurueckscrollen sauber und ohne jede Traegheit um. Eine
 *  Verschiebung, die sich beim Zurueckscrollen umkehrt, ist genau das
 *  Verhalten jeder Parallaxe und darf nicht mit dem entfallenen Term CLIMB
 *  verwechselt werden. Der hing die VERDREHUNG an die Scrollrichtung,
 *  sodass sich die Drehung umkehrte und das Hochscrollen sich wie ein
 *  Widerstand anfuehlte. Die Drehung folgt hier weiterhin allein dem
 *  Betrag der Scrollgeschwindigkeit, nur die Verschiebung traegt ein
 *  Vorzeichen.
 *
 *  Die Groesze folgt aus der gemessenen Geometrie der Zone. Bei 1440 mal
 *  900 steht die Marketing-Sektion bei 6703 Bildpunkten und ist 1972 hoch,
 *  der Grund der Zone beginnt 150 darueber und ist 2122 hoch, die klebende
 *  Leinwand haelt also ueber 1222 Bildpunkte Scrollweg still. Sichtbar ist
 *  die Struktur ueber die Maske vom Scrollstand 6553 bis 8241, also ueber
 *  1688 Bildpunkte.
 *
 *  Mit 0,35 laeuft die Struktur ueber diese 1688 Bildpunkte um 591
 *  Bildpunkte und damit um 0,412 Perioden. Es laeuft also nicht einmal
 *  eine halbe Periode durch, waehrend das Fenster mit 900 Bildpunkten
 *  gegen 1432,6 nur 0,628 einer Periode zeigt. Zwei Taillen koennen unter
 *  diesen Bedingungen gar nicht zugleich ins Bild kommen, und eine
 *  Wiederholung schon gar nicht.
 *
 *  Waehrend der klebenden Strecke allein, also ueber 1072 Bildpunkte
 *  Scrollweg, wandert die Taille von der Bildzeile 444 auf 69. Am
 *  fertigen Stand nachgemessen liefert ein Scrollweg von 600 Bildpunkten
 *  genau 210,0 Bildpunkte Versatz, und zwar an jeder gepruefen Stelle
 *  auf vier Nachkommastellen gleich. Das ist die
 *  Strecke, auf der der Betrachter ein stehendes Fenster sieht und die
 *  Bewegung der Struktur darin unmittelbar wahrnimmt.
 *
 *  Der Wert geht von 0,35 auf 0,30 zurueck. Die Referenz koppelt ihre
 *  Drehung mit rotation.y gleich 1,36 plus scrollY mal minus 0,001 und
 *  hebt den Koerper zusaetzlich mit position.y gleich scrollY mal 9e-4;
 *  daraus folgt eine Mitnahme von 0,17 bis 0,33 Bildpunkten je
 *  Scrollpunkt. Mit 0,35 lagen wir am oberen Rand dieses Bandes, 0,30
 *  trifft seine Mitte.
 *
 *  Das ist der kleinste Hebel dieses Durchgangs und ausdruecklich ERST
 *  NACH dem Ruhetempo angefasst worden. Der Unterschied im Gefuehl kam
 *  nicht vom Scrollen, sondern von der zu langsamen Ruhe: bei der Referenz
 *  stehen Ruhe und Scroll im Verhaeltnis 35,3, bei uns lagen sie bei rund
 *  200 und stehen nach der Anhebung von IDLE_FLOW bei 72. */
/** DER WERT BLEIBT BEI 0,30, UND ZWEI KREUZUNGEN UEBER DEN SCROLLWEG SIND
 *  MIT DIESER FLAECHE NICHT ZU HABEN. Die Untersuchung dazu ist gebaut,
 *  gemessen und wieder zurueckgenommen worden; sie steht hier vollstaendig,
 *  damit sie niemand ein zweites Mal fuehrt.
 *
 *  Der Auftraggeber hat die erste Haelfte der Sektion gelobt und die zweite
 *  beanstandet, in der nach der einen Kreuzung nur noch der offene Faecher
 *  steht. MITLAUF ist der EINZIGE Hebel, der die Zahl der Kreuzungen ueber
 *  den Scrollweg aendert, und das folgt unmittelbar aus dem Vertex-Teil.
 *  Dort ist ph gleich platz plus uTravel und th gleich PHASE0 plus DRALL
 *  mal ph mal uSpann; der Flusz uFlow kuerzt sich aus ph heraus und traegt
 *  zur Drehlage nichts bei. Die Zahl der Kreuzungen ueber eine Strecke S
 *  des Scrollweges lautet damit
 *
 *      MITLAUF mal S mal DRALL geteilt durch (PI mal cos(TILT) mal uUnit),
 *
 *  denn die Periodenlaenge kuerzt uSpann vollstaendig heraus. Von den vier
 *  uebrigen Groeszen stehen DRALL, TILT und uUnit unter Bestandsschutz.
 *
 *  Die Zahlen der Zone bei 1440 mal 900. Der Grund der Zone steht bei 6553
 *  und ist 5004 Bildpunkte hoch, die klebende Leinwand haelt also ueber
 *  4104 Bildpunkte Scrollweg still; die Sektion selbst beginnt 150
 *  Bildpunkte darunter. Die Periode misst 1706,3 Bildpunkte und die
 *  Verdrehung je Periode betraegt DRALL mal uSpann gleich 3,45 Bogenmasz.
 *  Eine Kreuzung entsteht alle PI der Verdrehung, zwei Kreuzungen liegen
 *  also PI geteilt durch 3,45 gleich 0,9106 Perioden auseinander, und ueber
 *  die sichtbare Fensterhoehe laufen 0,573 PI, was 0,5218 Perioden
 *  entspricht. Die flache Phase zwischen zwei Kreuzungen traegt damit
 *  0,9106 minus 0,5218 gleich 0,3888 Perioden.
 *
 *  Mit 0,30 laeuft uTravel ueber die klebende Strecke um 0,30 mal 4104
 *  geteilt durch 1706,3 gleich 0,722 Perioden. Das reicht fuer die eine
 *  Kreuzung, mit der die Sektion beginnt, und danach bleibt die flache
 *  Phase bis zum Ende stehen. Gemessen an der Bildreihe unter
 *  _ref2/ruhig/basis verlaeszt die Kreuzung das Bild bei einem Versatz von
 *  rund 1800 Bildpunkten und es folgen ueber zweitausend Bildpunkte ohne
 *  jede Kreuzung.
 *
 *  Gebaut und aufgenommen worden ist der Stand mit 0,62. Er liefert
 *  tatsaechlich zwei Kreuzungen, gemessen mit _ref2/kreuzreihe.mjs bei den
 *  Versaetzen 0 bis 800 und 2400 bis 3400, mit einer flachen Phase davor,
 *  dazwischen und danach. Die Bildreihe dazu liegt unter _ref2/ruhig/r2.
 *
 *  ZURUECKGENOMMEN IST ER, WEIL DIE ZWEITE KREUZUNG DIE GESPIEGELTE IST.
 *  Zwei aufeinanderfolgende Kreuzungen liegen PI auseinander, und bei PI
 *  ist die Flaeche in sich gespiegelt. Sichtbar wird das ueber TILT. Ein
 *  Punkt der Flaeche steht bei (u cos th, platz mal uSpann, u sin th), und
 *  die Kippung um die Bildwaagerechte macht daraus die Bildhoehe
 *  platz mal uSpann mal cos(TILT) minus u mal sin(th) mal sin(TILT). An der
 *  Kreuzung ist sin(th) gleich plus oder minus eins, die Sprosse steht dort
 *  also um plus oder minus RADIUS mal sin(TILT) mal uUnit gleich 44,6
 *  Bildpunkte gegen die Waagerechte gekippt, und dieses Vorzeichen wechselt
 *  mit jeder Kreuzung. Einmal laeuft die Kippung mit dem Schwung des
 *  Faechers und die Taille liest als weiche Sanduhr, das andere Mal laeuft
 *  sie dagegen und die Taille liest als harte Spitze mit auseinanderlaufenden
 *  Speichen. Der Vergleich der beiden Aufnahmen bei gleicher Taillenhoehe,
 *  _ref2/ruhig/r2/v00200 gegen v02600, zeigt das unmittelbar.
 *
 *  ZWEI GLEICHE KREUZUNGEN LIEGEN ZWEI PI AUSEINANDER, UND DIE GESPIEGELTE
 *  DAZWISCHEN LAESZT SICH NICHT UMGEHEN. Das ist kein Einstellungsproblem,
 *  sondern folgt aus der Stetigkeit. Das Fenster zeigt ein
 *  zusammenhaengendes Band des Platzes von 0,5218 Perioden Breite, und der
 *  Platz jeder einzelnen Kreuzung faellt mit wachsendem uTravel streng
 *  monoton durch dieses Band hindurch. Eine Kreuzung kann das Fenster
 *  deshalb nicht ueberspringen. Wer zwei gleiche will, bekommt zwangslaeufig
 *  drei Kreuzungen zu sehen, davon eine gespiegelte.
 *
 *  Der einzige Weg zu zwei gleichen waere TILT gleich null, denn allein die
 *  Kippung bricht die Spiegelsymmetrie. Das ist ein Eingriff in die
 *  Geometrie, den der Auftraggeber ausgeschlossen hat, und es naehme der
 *  Struktur zugleich ihre Raeumlichkeit.
 *
 *  Der Auftrag lautete fuer diesen Fall, lieber EINE Kreuzung sauber zu
 *  zeigen als zwei ungleiche. Der Wert bleibt deshalb bei 0,30 und trifft
 *  damit weiterhin die Mitte des Bandes von 0,17 bis 0,33, mit dem die
 *  Referenz ihre Mitnahme koppelt.
 *
 *  DIE FALTUNG DES VERSATZES BLEIBT TROTZDEM AUF SECHZEHN PERIODEN, denn
 *  die alte Faltung auf zwei war auch bei 0,30 nur knapp unbedenklich. Die
 *  Begruendung steht bei versatzSetzen. */
/** MITLAUF GEHT VON 0,30 AUF 1,00, WEIL DIE ZWEITE KREUZUNG JETZT ZU HABEN
 *  IST. Die oben stehende Untersuchung bleibt in ihren Messungen richtig und
 *  in ihrem Schlusz falsch, und beides gehoert festgehalten.
 *
 *  Richtig bleibt, dass MITLAUF der einzige Hebel fuer die ZAHL der
 *  Kreuzungen ist und dass die zweite Kreuzung mit dem damaligen Stand die
 *  gespiegelte war. Falsch ist der Schlusz, das sei nur mit TILT gleich null
 *  zu heilen. Die Spiegelung sasz in der Scherung und ist ueber DRALL
 *  geloest; die vollstaendige Rechnung steht dort und die Widerlegung des
 *  Kippterms bei TILT.
 *
 *  Der Wert folgt aus der Zahl der Kreuzungen. Zwei Kreuzungen liegen jetzt
 *  1,5 Perioden auseinander, die Periode misst 1724,1 Bildpunkte und die
 *  klebende Leinwand haelt ueber 4104 Bildpunkte still; aus
 *  MITLAUF mal 4104 geteilt durch 1724,1 geteilt durch 1,5 gleich 1,59
 *  folgt MITLAUF gleich 1,00. Das reicht fuer zwei sichtbare Kreuzungen mit
 *  einer flachen Phase davor, dazwischen und danach.
 *
 *  Der Wert verlaeszt damit das Band von 0,17 bis 0,33, mit dem die Referenz
 *  ihre Mitnahme koppelt, und das ist die eigentliche Kroete dieses
 *  Durchgangs. Die Struktur wandert beim Scrollen rund dreimal so schnell
 *  durchs Bild wie zuvor. Der Auftraggeber hat die zweite Kreuzung
 *  ausdruecklich verlangt, und ohne diesen Weg ist sie nicht zu haben, denn
 *  die kleinere Verdrehung aus DRALL legt die Kreuzungen weiter auseinander
 *  und musz ueber den Mitlauf wieder eingeholt werden.
 *
 *  SCROLL_DREH ist im selben Verhaeltnis mitgezogen worden, siehe dort. */
/** MITLAUF GEHT VON 1,00 AUF 0,860 UND ZIEHT ALLEIN DEN KLEINEREN MASZSTAB
 *  NACH. Die abgenommene Abfolge der Kreuzungen wird dabei nicht angetastet,
 *  und zwar nicht ungefaehr, sondern rechnerisch genau.
 *
 *  Der Weltversatz lautet MITLAUF mal Scrollweg geteilt durch die
 *  Periodenlaenge in Bildpunkten, und diese Periodenlaenge ist
 *  SPANN mal cos(TILT) mal uUnit und damit dem Maszstab proportional. Faellt
 *  uUnit auf das 0,860-fache und faellt MITLAUF im selben Verhaeltnis mit, so
 *  kuerzt sich der Faktor heraus und der Weltversatz nimmt an jeder Stelle
 *  des Scrollweges denselben Wert an wie zuvor. Die beiden Kreuzungen stehen
 *  deshalb bei denselben Scrollstaenden wie im abgenommenen Stand, ihr
 *  Abstand betraegt weiterhin 1,5 Perioden und die flache Phase dazwischen
 *  bleibt mit 0,652 PI unveraendert.
 *
 *  Die Zahl der sichtbaren Kreuzungen steigt dabei ganz leicht und bleibt
 *  gerundet dieselbe. Eine Periode misst jetzt 1482,5 statt 1724,1
 *  Bildpunkte, zwei Kreuzungen liegen im BILD also 2224 statt 2587
 *  Bildpunkte auseinander, waehrend das Muster ueber die 4104 Bildpunkte der
 *  klebenden Strecke nur noch 3529 statt 4104 Bildpunkte weit durchlaeuft.
 *  Aus 3529 plus 900 Bildpunkten Fensterhoehe geteilt durch 2224 folgen 1,99
 *  Abstaende gegen zuvor 1,93, und das sind in beiden Faellen genau zwei
 *  Kreuzungen mit einer flachen Phase davor, dazwischen und danach.
 *
 *  SCROLL_DREH bleibt bei 4,553e-4 und wird ausnahmsweise NICHT mitgezogen.
 *  Der dort festgehaltene Erhaltungswert ist SCROLL_DREH mal Periodenlaenge
 *  geteilt durch MITLAUF und steht bei 0,785. Periodenlaenge und MITLAUF
 *  fallen hier um denselben Faktor 0,860, der Quotient bleibt also stehen und
 *  mit ihm das Verhaeltnis zwischen dem Lauf der Punkte und dem Lauf des
 *  Musters. Wer spaeter MITLAUF ohne den Maszstab anfaeszt, musz SCROLL_DREH
 *  dagegen sehr wohl mitziehen.
 *
 *  Der Wert naehert sich nebenbei wieder dem Band von 0,17 bis 0,33, mit dem
 *  die Referenz ihre Mitnahme koppelt, ohne es zu erreichen. Das ist ein
 *  Nebengewinn und war nicht der Anlasz. */
const MITLAUF = 0.86;

/** Der Sicherheitsabstand zwischen Periodenlaenge und Fensterhoehe.
 *
 *  Die Punkte werden ueber fract laufend ins Fenster zurueckgewickelt und
 *  fuellen deshalb IMMER genau eine Periodenlaenge um die Bildmitte. Ist
 *  die Periode kuerzer als das Fenster, so bleibt oben und unten ein
 *  vollstaendig leerer Streifen stehen, und das ist ein harter Fehler.
 *  Bei 1440 mal 900 traegt die Periode 1432,6 gegen 900 Bildpunkte
 *  Fensterhoehe, der Abstand betraegt also 266,3 Bildpunkte auf jeder
 *  Seite und die Vorgabe greift nicht.
 *
 *  Auf kurzen und schmalen Schirmen greift sie sehr wohl. Bei 390 mal 844
 *  steht der Maszstab auf 63,3 und die ungestreckte Periode misst nur 707
 *  gegen 844 Bildpunkte Fensterhoehe. Dort wird die Weltlaenge einer
 *  Periode auf das 1,53-fache gestreckt, bis die Vorgabe wieder
 *  eingehalten ist. Das Band wird dadurch schlanker, was auf einem
 *  Telefon ohnehin besser liest, und der Rasterschritt faengt die
 *  geaenderte Punktdichte ab. */
const RAND = 120;

/** Der Ausklang des unteren Lappens.
 *
 *  Die Referenz laeszt ihr Gewebe nach unten verloeschen. Gemessen mit
 *  _ref2/taille.mjs faellt ihre Bedeckung ueber die Zeilen 81,2 / 83,6 /
 *  86,2 Prozent der Bildhoehe von 15,1 ueber 4,0 auf 0,0 Prozent; unsere
 *  stand ueber dieselben Zeilen bei 74,4 / 71,9 / 73,5 und stieg zum
 *  unteren Bildrand hin sogar auf 92. Unser unterer Lappen war ein voll
 *  ausgeleuchteter Block, wo die Referenz einen verloeschenden Schleier
 *  zeigt.
 *
 *  Der Pruefbericht schlug vor, das ueber die Fluchtung persp zu machen.
 *  Das geht bei dieser Geometrie nicht, und zwar nachrechenbar. Die
 *  Kippung mischt y und z ueber q.z = p.y * sin(TILT) + p.z * cos(TILT).
 *  Bei u gleich eins ist p.y gleich 5,75 und der erste Summand damit
 *  plus 1,37, bei u gleich null minus 1,37. Das untere Bandende steht
 *  also NAEHER an der Kamera als das obere, persp ist unten mit 0,93 bis
 *  1,49 groeszer als oben mit 0,75 bis 1,09. Eine Abschwaechung ueber
 *  persp wuerde den unteren Lappen deshalb noch heller machen.
 *
 *  Der Ausklang haengt deshalb an einer eigenen Groesze, und seit dem
 *  Umbau ist das der PLATZ IM FENSTER. Er wandert also NICHT mit der
 *  Struktur, sondern bleibt am unteren Bildrand stehen, waehrend das
 *  Gewebe dahinter durchlaeuft. Die ausfuehrliche Begruendung samt der
 *  verworfenen Gegenfassung steht im Vertex-Shader unmittelbar ueber der
 *  Rechnung.
 *
 *  Die drei Zahlen sind jetzt auf die BILDMITTE bezogen statt auf das
 *  untere Bandende, ihr Zahlenwert ist deshalb um eine halbe Periode
 *  verschoben. Aus 0,58 und 0,685 werden 0,08 und 0,185, aus der ersten
 *  Stufe von 0,50 bis 0,60 wird eine von 0 bis 0,10. Bei ruhender Seite
 *  faellt die Bildmitte mit der Taille zusammen, in Bildpunkten steht
 *  also alles genau dort, wo es zuvor stand.
 *
 *  Die drei Zahlen sind ein zweites Mal nachgezogen worden, und zwar weil
 *  der Ausklang zu frueh fertig war. Bei FERN_BIS gleich 0,185 endet er
 *  265 Bildpunkte unterhalb der Bildmitte und damit bei y gleich 709 von
 *  900. Nachgemessen ueber elf Versaetze trug das untere Fuenftel des
 *  Bildes dadurch in den Zeilen 710 und 810 glatt null Prozent Bedeckung.
 *  Im Bild las das nicht als Aufloesung, sondern als schraeg
 *  abgeschnittene Kante quer durch den unteren Faecher, am deutlichsten
 *  bei Versatz 1080.
 *
 *  Die Referenz macht es anders. In Ruhe faellt ihre Bedeckung ueber 82,
 *  86, 90, 94 und 97 Prozent der Seitenhoehe von 17,4 ueber 9,6, 5,0 und
 *  1,6 auf 0,5 Prozent, im gescrollten Zustand von f030 traegt sie bis 94
 *  Prozent der Hoehe noch 5 bis 11 Prozent. Ihr Gewebe hoert also nirgends
 *  auf, es wird nur immer duenner.
 *
 *  Mit 0,13 und 0,30 setzt der Ausklang 186 Bildpunkte unter der Bildmitte
 *  ein und ist erst bei 430 fertig, also bei y gleich 874 und damit
 *  praktisch am unteren Bildrand. Die Tiefe der zweiten Stufe geht von
 *  0,98 auf 0,90 zurueck, damit unten ein Rest stehen bleibt statt einer
 *  Kante. */
/** Der Lichtverlauf zur Kreuzung hin, siehe die Herleitung im Vertex-Teil
 *  bei dKreuz. HOF_VON und HOF_BIS sind Abstaende von der Kreuzung in
 *  Welteinheiten; eine Welteinheit misst bei 1440 mal 900 rund 151
 *  Bildpunkte. HOF_BODEN ist das Licht, das in weiter Entfernung
 *  uebrigbleibt.
 *
 *  DER VERLAUF WIRD ZURUECKGENOMMEN, und der Anlasz ist eine Nachmessung
 *  der Ringmittel um die Kreuzung. Gemessen wird an _ref2/vier/rN/a3000.png
 *  mit _ref2/mess/kreuzung.mjs im Suchfeld 900..1260 mal 300..800, jeweils
 *  ueber dem Grund von 33. Die Referenz traegt in _ref2/vier/reffilm/f000
 *  bei den Halbmessern 6, 16, 30, 55, 100 und 190 Bildpunkten die Werte
 *  154,5 / 113,4 / 81,3 / 49,3 / 26,0 / 11,5, wir standen mit dem steilen
 *  Verlauf bei 161,3 / 84,1 / 56,5 / 17,9 / 7,8 / 3,1. Von fuenfundfuenfzig
 *  Bildpunkten an fehlte uns also das Zwei- bis Vierfache ihres Lichtes.
 *
 *  Der Auftrag, der zu dem Verlauf gefuehrt hat, lautete, das Licht solle
 *  zur Kreuzung hin zunehmen. Er stuetzte sich auf eine Messung, bei der
 *  unsere fernen Ringe bereits auf den Werten der Referenz lagen, und war
 *  insofern gegenstandslos; der Verlauf hat danach genau das Licht
 *  weggenommen, das der untere Faecher braucht, um als eigener Faecher
 *  gelesen zu werden.
 *
 *  HOF_BODEN geht deshalb von 0,45 auf 0,90 und die beiden Stuetzstellen
 *  von 0,35 und 1,20 auf 0,60 und 1,70. Der Verlauf bleibt damit als
 *  Gedanke erhalten, greift aber erst jenseits von neunzig Bildpunkten
 *  ueberhaupt und nimmt in der groeszten im Fenster vorkommenden
 *  Entfernung hoechstens ein Zehntel weg. */
/** DER VERLAUF WIRD WIEDER AUFGEZOGEN, UND ZWAR BREITER UND TIEFER ALS JE
 *  ZUVOR. HOF_BODEN geht von 0,90 auf 0,38, HOF_VON von 0,60 auf 0,35 und
 *  HOF_BIS von 1,70 auf 4,00. Der Grundfaktor in vLit geht im selben Zug von
 *  1,42 auf 2,38 und faengt auf, was der Boden der Flaeche nimmt.
 *
 *  Der Auftraggeber beschreibt, was er sehen will, als einen Wechsel entlang
 *  der Struktur. Das Dunkle beginnt, es wird immer heller, es wird wieder
 *  dunkel und dann wieder heller zur Kreuzung hin. Genau diese Form hat der
 *  Verlauf, sobald er ueber den ganzen Abstand zwischen zwei Kreuzungen
 *  laeuft statt nur ueber dessen innerstes Fuenftel.
 *
 *  Die Reichweite folgt aus der Geometrie. dKreuz misst den Abstand zur
 *  eigenen Kreuzung laengs der Achse in Welteinheiten und erreicht hoechstens
 *  PI halbe geteilt durch DRALL gleich 8,63, denn jenseits davon liegt die
 *  naechste Kreuzung naeher. Mit HOF_BIS gleich 1,70 war der Verlauf schon
 *  bei einem Fuenftel dieser Strecke fertig und die ganze flache Phase lag
 *  gleichmaeszig auf dem Boden. Mit 4,00 laeuft er ueber knapp die halbe
 *  Strecke und die flache Phase traegt ein sichtbares Gefaelle zur Kreuzung
 *  hin. Bei einem Maszstab von 130,0 sind das 516 Bildpunkte statt 219.
 *
 *  Der Boden ist mit dem Grundfaktor zusammen zu lesen und nicht fuer sich.
 *  Beide wirken multiplikativ auf dieselben Punkte, und ihr Produkt ist das,
 *  was die flache Phase traegt. Es stand bei 1,42 mal 0,90 gleich 1,278 und
 *  steht jetzt bei 2,38 mal 0,38 gleich 0,904, faellt also auf das
 *  0,707-fache. Genau dieser Faktor ist gerechnet und nicht geraten. Der
 *  kleinere Maszstab aus Punkt eins hat die Punkte im Fenster dichter
 *  gestellt, und der Anteil leuchtender Flaeche im Fenster 1080,200,300,300
 *  war dadurch von 28,8 bis 32,6 auf 37,7 bis 41,2 Prozent gestiegen. Aus der
 *  Perzentilleiter dieses Fensters, p50 gleich 8,0 und p75 gleich 19,8 ueber
 *  dem Sockel, folgt, dass die Schwelle von zwoelf Stufen beim 0,707-fachen
 *  Licht wieder auf das 69. Perzentil faellt. Der Anteil kommt damit auf die
 *  abgenommenen rund 31 Prozent zurueck.
 *
 *  An der Kreuzung selbst steht hof auf eins, dort wirkt also der ganze
 *  Grundfaktor. Sie wird damit um das 1,68-fache heller, waehrend die Flaeche
 *  insgesamt dunkler wird, und genau diese beiden Forderungen stehen
 *  nebeneinander im Auftrag.
 *
 *  Eine Welteinheit misst bei 1440 mal 900 seit Punkt eins rund 130 statt
 *  151 Bildpunkte. Die drei Zahlen sind Welteinheiten und wandern deshalb im
 *  Bild von selbst mit dem Maszstab mit. */
/** DER VERLAUF WIRD EIN ZWEITES MAL NACHGEZOGEN, UND ZWAR AM RING VON
 *  FUENFZIG BIS ZWEIHUNDERT BILDPUNKTEN UM DIE KREUZUNG. HOF_VON geht von
 *  0,35 auf 1,10, HOF_BIS von 4,00 auf 4,60, HOF_BODEN von 0,38 auf 0,329 und
 *  der Grundfaktor in vLit von 2,38 auf 2,75.
 *
 *  Der Anlasz ist die Zieltabelle der Ringmittel. Nach dem ersten Zug stand
 *  die Kreuzung bei 104,5 / 46,9 / 14,0 / 7,8 / 4,8 ueber dem Grund bei den
 *  Halbmessern 6, 16, 55, 100 und 190 Bildpunkten, waehrend die Referenz
 *  156,5 / 103,0 / 50,6 / 25,3 / 13,5 traegt. Der Kern selbst war damit auf
 *  zwei Drittel heran, der RING um ihn herum blieb dagegen bei knapp einem
 *  Drittel zurueck.
 *
 *  HOF_VON ist der Hebel dafuer und der Grundfaktor allein ist es nicht. Der
 *  Verlauf hielt bisher nur die innersten 45 Bildpunkte auf vollem Licht und
 *  nahm danach sofort zurueck. Mit 1,10 steht die volle Helligkeit ueber 142
 *  Bildpunkte und damit ueber genau den Bereich, den die Zieltabelle
 *  abfragt; erst dahinter setzt die Stufe ein und ist bei 4,60 und damit 593
 *  Bildpunkten fertig. Der Ring bei 200 Bildpunkten traegt danach das
 *  1,38-fache und der bei 300 das 1,47-fache seines bisherigen Lichtes.
 *
 *  Das Produkt aus Grundfaktor und Boden bleibt dabei genau erhalten, denn
 *  2,75 mal 0,329 ergibt wieder 0,904. Die flache Phase zwischen den
 *  Kreuzungen liegt jenseits von 4,60 Welteinheiten vollstaendig auf dem
 *  Boden und aendert sich deshalb um keinen Bildpunkt; der Anteil leuchtender
 *  Flaeche im Fenster 1080,200,300,300 bleibt damit bei den gemessenen 27 bis
 *  32 Prozent.
 *
 *  DIE ZIELTABELLE IST MIT DIESEN HEBELN NICHT ZU ERREICHEN, und das gehoert
 *  festgehalten, damit es niemand ein drittes Mal versucht. Der Rest des
 *  Abstandes sitzt nicht im Licht, sondern in der FLAECHE. Links und rechts
 *  der Taille stehen bei uns zwei leere Keile, waehrend die Referenz dort
 *  durchgehendes Gewebe traegt, siehe _ref2/refscroll/roll11.png gegen
 *  _ref2/eng/p2paar/v00000.png. Das Ringmittel bei 55 bis 200 Bildpunkten
 *  mittelt bei uns also ueber leeren Grund, und kein Faktor auf das Licht der
 *  vorhandenen Punkte fuellt diese Keile. Belegt ist das daran, dass das
 *  Mittel ueber den halben Ring rechts der Kreuzung mit 13,7 gegen 14,0
 *  praktisch dasselbe liefert wie ueber den ganzen; es handelt sich also
 *  nicht um eine Schieflage nach einer Seite, sondern um wirklich leere
 *  Flaeche. Wer die Keile fuellen will, musz an den Oeffnungswinkel des
 *  Faechers und damit an TILT, RADIUS oder die Verdrehungskurve, und diese
 *  drei stehen unter Bestandsschutz. */
/** DER BODEN GEHT VON 0,329 AUF 0,155, UND DAMIT WIRD DER ABFALL ZUR
 *  KREUZUNG HIN DOPPELT SO STEIL.
 *
 *  Der Auftraggeber verlangt, dass wirklich nur der Schnittpunkt aufleuchtet
 *  und es umso dunkler wird, je weiter man sich von ihm entfernt; der
 *  jetzige Stand sei abseits der Kreuzung zu hell.
 *
 *  DER BODEN IST DER EINZIGE HEBEL, DER GENAU DAS TUT UND SONST NICHTS. An
 *  der Kreuzung steht hof auf eins, dort aendert er nichts. Jenseits von
 *  HOF_BIS gleich 4,60 Welteinheiten, also jenseits von rund 590
 *  Bildpunkten, steht hof auf dem Boden, dort wirkt er voll. Die ganze
 *  flache Phase zwischen zwei Kreuzungen liegt in diesem Bereich und faellt
 *  damit auf das 0,471-fache ihres bisherigen Lichtes, waehrend die Kreuzung
 *  selbst und ihr Ring bis 142 Bildpunkte um keinen Bildpunkt dunkler
 *  werden. Genau das ist der verlangte steilere Verlauf und nicht ein
 *  gleichmaesziges Abdunkeln.
 *
 *  DAS PRODUKT MIT DEM GRUNDFAKTOR WIRD DIESMAL BEWUSST NICHT GEHALTEN. In
 *  den beiden Zuegen zuvor war es die Aufgabe, es bei 0,904 stehen zu lassen,
 *  weil dort der Anteil leuchtender Flaeche der flachen Phase abgenommen
 *  worden war. Jetzt ist gerade dieser Anteil zu hoch, und das Produkt geht
 *  deshalb von 3,90 mal 0,329 gleich 1,283 auf 3,90 mal 0,155 gleich 0,605
 *  zurueck.
 *
 *  Die Lesbarkeit gewinnt dabei, denn die Textspalten stehen samt und
 *  sonders in der flachen Phase und nicht an der Kreuzung. Der
 *  Grundhoechstwert hinter den Zeilen kann durch diesen Schritt nur fallen.
 *
 *  Die Ringmittel um die Kreuzung bei den Halbmessern 6, 16, 55, 100 und 190
 *  Bildpunkten sind davon fast unberuehrt, denn 6 bis 142 Bildpunkte liegen
 *  vor HOF_VON und tragen weiterhin volles Licht; allein der Ring bei 190
 *  Bildpunkten liegt in der Flanke und gibt einen Teil ab. */
const HOF_BODEN = 0.155;
const HOF_VON = 1.1;
const HOF_BIS = 4.6;

const FERN_VON = 0.13;
/** FERN_BIS geht von 0,30 auf 0,40. Der Ausklang laeuft damit ueber einen
 *  laengeren Weg aus und erreicht seinen Bodenwert erst tiefer im Bild;
 *  zusammen mit der flacheren zweiten Stufe traegt der untere Bildrand
 *  danach ein schwaches Gewebe statt eines Abbruchs. Siehe die
 *  Begruendung bei ausklang im Vertex-Teil. */
const FERN_BIS = 0.40;
/** Die erste Stufe des Ausklangs setzt jetzt spaeter ein und laeuft laenger.
 *  Sie stand von 0,0 bis 0,1, war also schon 172 Bildpunkte unter der
 *  Bildmitte auf ihrem Bodenwert von 0,155 angekommen. Die Kreuzung selbst
 *  steht je nach Scrollstand zwischen 86 Bildpunkten ueber und 101 unter
 *  der Bildmitte, die Stufe hat den unteren Faecher also unmittelbar hinter
 *  seinem Ansatz erloschen lassen.
 *
 *  Nachgemessen an a3000 mit _ref2/vier/hofmess.mjs trug die untere
 *  Halbkreishaelfte des Ringes bei einem Halbmesser von 55 Bildpunkten 13,0
 *  gegen die 23,0 der oberen und bei 100 Bildpunkten 2,8 gegen 12,7,
 *  waehrend die Referenz an derselben Stelle 45,9 gegen 52,7 und 19,1 gegen
 *  32,9 haelt. Ihr unterer Faecher ist also fast so hell wie ihr oberer,
 *  unserer war ein Viertel davon.
 *
 *  Mit 0,07 bis 0,20 liegt die Stufe zwischen 120 und 344 Bildpunkten unter
 *  der Bildmitte. Der Bodenwert am unteren Bildrand bleibt unveraendert bei
 *  0,155, denn dort ist die Stufe in beiden Faellen fertig; der untere
 *  Abschlusz und die Bedeckung der untersten Bildzeile aendern sich dadurch
 *  nicht. */
const STUFE1_VON = 0.07;
const STUFE1_BIS = 0.2;

const VERT = /* glsl */ `
  uniform float uFlow;
  // Der Umlauf der Spalten QUER ueber das Band, in Umlaeufen. Er traegt die
  // sichtbare Drehrichtung; die vollstaendige Begruendung steht im
  // Hauptprogramm bei drehSinn.
  uniform float uSpin;
  uniform float uTravel;
  uniform float uSpann;
  uniform vec2  uSize;
  uniform vec2  uCenterPx;
  uniform float uUnit;
  uniform float uPointSize;
  // Die Halbweite des Streuversatzes, in derselben Einheit wie px, also
  // in Seitenbildpunkten. Sie wird aus der Bildpunktdichte gerechnet und
  // betraegt eine halbe GERAETE-Bildpunktbreite, denn die Schwebung
  // entsteht am Raster der Geraetebildpunkte und nicht am Seitenraster.
  uniform float uJitter;
  uniform vec2  uStride;
  uniform vec2  uGrob;
  uniform float uRelief;

  attribute float aU;
  attribute float aS;
  attribute float aTone;
  attribute float aGain;
  // Die Sprossennummer als eigenes Attribut. Sie wurde bisher aus aU
  // zurueckgerechnet, und diese Rueckrechnung setzte voraus, dass der
  // feste Versatz eines Punktes gegen sein Rasterfeld unter einer halben
  // Rasterweite bleibt. Genau diese Schranke hielt das Gewebe auf einem
  // strengen Gitter fest, auf dem die Ruhebewegung unsichtbar blieb.
  attribute float aRow;
  // Zwei gleichverteilte Zufallszahlen je Punkt, in eine einzige Zahl
  // gepackt. Der ganzzahlige Teil traegt von 0 bis 1023 die eine, der
  // gebrochene die andere. Eine Gleitkommazahl einfacher Genauigkeit hat
  // 24 Stellen im Mantissenteil, von denen zehn auf den ganzzahligen Teil
  // entfallen; die verbleibenden vierzehn loesen den gebrochenen auf
  // sechs Zehntausendstel genau auf und das ist fuer einen Versatz von
  // einer halben Bildpunktbreite mehr als genug.
  //
  // Zwei getrennte Attribute waeren sauberer zu lesen, kosten aber bei
  // 60 000 Punkten einen zweiten Puffer, und ein im Schattierer
  // gerechneter Streuwert aus aU und aS waere von der Genauigkeit der
  // Grafikeinheit abhaengig. Gerade dieser Wert muss ueber alle Geraete
  // gleich gut streuen, denn er ist die ganze Abhilfe gegen das Moire.
  attribute float aJit;

  varying float vLit;
  varying float vTone;

  const float RADIUS = ${RADIUS.toFixed(3)};
  const float TILT   = ${TILT.toFixed(4)};
  const float CAM    = ${CAMERA.toFixed(3)};
  const float SCHAU  = ${SCHAU.toFixed(3)};
  // Wieviel der feste Achsversatz von der Fluchtung mitbekommt. Die
  // ausfuehrliche Begruendung steht oben bei VERSATZ_FLUCHT.
  const float VERS_FL = ${VERSATZ_FLUCHT.toFixed(5)};
  // KEHLE ist der kleinste Abstand einer Erzeugenden von der Achse und
  // legt damit die Taillenweite fest. DRALL ist die Verwindung je
  // Hoeheneinheit. Beide zusammen beschreiben ein einschaliges
  // Hyperboloid, siehe die Herleitung bei surf.
  const float KEHLE = ${KEHLE.toFixed(4)};
  const float DRALL = ${DRALL.toFixed(4)};
  const float PHASE0     = ${PHASE0.toFixed(6)};
  const float HOF_BODEN  = ${HOF_BODEN.toFixed(4)};
  const float HOF_VON    = ${HOF_VON.toFixed(4)};
  const float HOF_BIS    = ${HOF_BIS.toFixed(4)};
  const float FERN_VON   = ${FERN_VON.toFixed(6)};
  const float FERN_BIS   = ${FERN_BIS.toFixed(6)};
  const float STUFE1_VON = ${STUFE1_VON.toFixed(6)};
  const float STUFE1_BIS = ${STUFE1_BIS.toFixed(6)};
  const float TWIST_FAR  = ${TWIST_FAR.toFixed(4)};
  const float TWIST_KNOT = ${TWIST_KNOT.toFixed(4)};
  const float KNOT_SPAN  = ${KNOT_SPAN.toFixed(6)};
  const float SCHER_KEHLE = ${((RADIUS / (SPANN * Math.cos(TILT))) * Math.sin(TILT)).toFixed(6)};
  const float SCHER_SWING = ${((RADIUS / (SPANN * Math.cos(TILT))) * SHEAR_M * 1.102).toFixed(6)};
  const float SCHER_SPAN  = ${SHEAR_SPAN.toFixed(4)};
  const float ZWEIPI      = 6.2831853;
  const float PI          = 3.14159265;

  // Eine Weltlage auf die Strecke von minus einer halben bis plus einer
  // halben Periode zurueckholen. Alles, was zum MUSTER gehoert, haengt an
  // diesem gewickelten Wert und ist damit von selbst periodisch.
  float wickel(float ph) {
    return ph - floor(ph + 0.5);
  }

  // Restbreite des Materials. Feste Glocke um die Taille, voellig
  // unabhaengig von der Drehlage. Sie sitzt jetzt einmal je Periode und
  // wandert mit dem Muster durchs Bild.
  // ENTFALLEN. Die Restbreite war die kuenstliche Einschnuerung. Die Kehle
  // des Hyperboloids entsteht jetzt aus der Lage der Erzeugenden, siehe
  // die Herleitung bei surf.

  // Der Windungswinkel, gemessen ab der Kantenlage in der Taille.
  // Ein gleichmaesziger Anteil traegt die weiten Lappen, ein in der Mitte
  // gebuendelter Anteil den steilen Kneifpunkt.
  //
  // Die weiche Stufe ist x geteilt durch die Wurzel aus eins plus x zum
  // Quadrat. Sie ist ungerade, hat bei null die Steigung eins und laeuft
  // gegen eins. Der Tangens hyperbolicus taete dasselbe, steht aber in
  // GLSL ES 1.00 nicht zur Verfuegung und muesste ueber die
  // Exponentialfunktion nachgebaut werden, die fuer grosze Argumente
  // ueberlaeuft.
  //
  // Der Summand PI mal der Periodennummer ist der Kern des endlosen
  // Bandes. Die Kurve innerhalb einer Periode laeuft von minus pi halbe
  // bis plus pi halbe, jede Periode legt also genau eine halbe Umdrehung
  // zu. Nachgerechnet stimmen die beiden Seiten der Nahtstelle exakt
  // ueberein, denn bei der gewickelten Lage plus 0,5 der Periode n steht
  // der Winkel bei PI mal n plus pi halbe und bei der gewickelten Lage
  // minus 0,5 der Periode n plus eins bei PI mal n plus PI minus pi halbe.
  // Der Winkel ist also stetig und die Flaeche hat keinen Knick.
  // ENTFALLEN. Der gebuendelte Anteil war die Ursache dafuer, dass die
  // Verdrehung ueber lange Strecken fast nichts tat und dann kurz vor der
  // Mitte ausschlug. Beim Hyperboloid steckt die Verwindung in der einen
  // Konstanten DRALL und verteilt sich damit von selbst gleichmaeszig.

  // Ein Punkt der Flaeche. Die Bildhoehe haengt allein am PLATZ IM FENSTER
  // und das Muster allein an der WELTLAGE. Genau diese Trennung erlaubt
  // es, die Struktur wandern zu lassen, ohne dass ein Punkt jemals das
  // Bild verlaeszt.
  // DIE SCHERUNG DES ABTASTRASTERS, hergeleitet statt angepasst. Die
  // ausfuehrliche Rechnung steht oben bei SHEAR_M.
  //
  // Beide Anteile haengen an der GEWICKELTEN Bandkoordinate und sind
  // damit periodisch. Ohne das Wickeln truege drallAt den Summanden PI mal
  // der Periodennummer, der Kosinus wechselte je Periode sein Vorzeichen,
  // und eine Bahn belegte den Umlauf nicht mehr genau einmal.
  // Die Scherung verschiebt einen Punkt LAENGS seines Fadens. Weil ein
  // Faden jetzt eine Gerade ist, bleibt der Punkt dabei auf seiner eigenen
  // Geraden, die Flaeche bleibt also unberuehrt. Der frueher hier stehende
  // Anteil aus Kehle und Verdrehung ist entfallen, denn er hing an den
  // beiden Funktionen, die die kuenstliche Taille erzeugten.
  float scherAt(float ph) {
    return SCHER_SWING * sin(ZWEIPI * wickel(ph));
  }

  // Ein Punkt der Flaeche. Die Flaeche ist eine VERDREHTE EBENE, also ein
  // Helikoid, und ausdruecklich keine Roehre.
  //
  // Jede Hoehe traegt EINE offene gerade Strecke, die durch die Achse geht
  // und von minus RADIUS bis plus RADIUS reicht. Ihre Laenge ist damit fuer
  // jede Hoehe dieselbe. Der Winkel th waechst LINEAR mit der Weltlage, die
  // ganze Strecke wird also nur gedreht und niemals gestaucht.
  //
  // Zwei Irrwege liegen hinter dieser Zeile, damit sie niemand wiederholt.
  // Der erste zog die Strecke ueber eine Glocke in der Bandmitte zusammen
  // und buendelte die Verdrehung dort; daraus entstand die harte Sanduhr mit
  // dem langen Hals. Der zweite legte die Erzeugenden als Sehnen AN der
  // Achse vorbei, also ein einschaliges Hyperboloid; daraus entstanden
  // sichtbare elliptische Ringe und der Eindruck eines Zylinders.
  //
  // Die scheinbare Verengung entsteht allein aus der Projektion. Steht eine
  // Strecke der Kamera frontal, misst sie ihre volle Breite; dreht sie sich
  // in die Blickrichtung, faellt ihre projizierte Breite gegen null. Weil
  // der Winkel linear laeuft, steht immer nur EINE Hoehe kantig zur Kamera,
  // und die Kreuzung bleibt deshalb oertlich statt zu einer langen Taille zu
  // werden.
  //
  // Die BILDHOEHE haengt am Platz im Fenster, der Winkel an der WELTLAGE.
  // Beide unterscheiden sich zu jedem Zeitpunkt nur um denselben festen
  // Betrag, die Struktur wandert also beim Scrollen durchs Bild, ohne dass
  // ein Punkt es verlaeszt.
  vec3 surf(float platz, float ph, float sc) {
    float th = PHASE0 + DRALL * ph * uSpann;
    float u  = sc * RADIUS;
    return vec3(u * cos(th), platz * uSpann, u * sin(th));
  }

  void main() {
    // Ausduennung auf schmalen Schirmen. Dort schrumpft uUnit, das
    // Gewebe deckt weniger Flaeche ab, die Punktzahl bleibt aber
    // gleich — auf einem 390er Schirm lagen die Reihen nur noch eineinhalb
    // Bildpunkte auseinander und das additive Licht brannte die
    // Struktur zu einem weiszen Fleck aus. Der Schritt laesst nur jede
    // n-te Reihe und Spalte stehen und haelt den Rasterabstand konstant.
    // Der Rasterschritt greift an der URSPRUENGLICHEN Sprossennummer an,
    // nicht an der umlaufenden. Die stehenbleibenden Sprossen bilden
    // dadurch auch nach dem Umlauf ein gleichmaesziges Raster, das sich
    // als Ganzes mitverschiebt; wer stattdessen die umlaufende Nummer
    // nimmt, laeszt das Raster bei jedem Umlauf neu wuerfeln.
    float rowI = floor(aRow + 0.5);
    float colI = floor((aS * 0.5 + 0.5) * ${N_S.toFixed(1)} + 0.5);
    // Die HARTE Ausduennung fuer schmale Schirme. Sie haengt allein am
    // Maszstab und wird nie geblendet.
    if (mod(rowI, uStride.x) > 0.5 || mod(colI, uStride.y) > 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    // Die WEICHE zweite Stufe des Reglers. Sie ist eine Blende und kein
    // Sprung. Frueher verschwand jede zweite Reihe und Spalte von einem
    // Bild auf das naechste; gemessen fiel das Licht des Gewebes dabei um
    // 81 Prozent, und weil der Regler auf einer voellig ruhenden Seite
    // ausloeste, sah ein Nutzer das Gewebe ausgehen und elf Sekunden
    // spaeter wiederkommen.
    // Der Vergleich laeuft gegen ein EIGENES grobes Raster und nicht
    // gegen ein vervielfachtes uStride. Nur so laeszt sich die Blende in
    // beide Richtungen fahren: bei uRelief gleich eins stehen alle Punkte
    // voll da, bei null bleibt genau das grobe Raster uebrig.
    float weg = (mod(rowI, uGrob.x) > 0.5 || mod(colI, uGrob.y) > 0.5) ? 1.0 : 0.0;
    if (weg > 0.5 && uRelief < 0.002) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    float reliefGain = mix(1.0, uRelief, weg);

    // DAS BAUPRINZIP DES WANDERNDEN BANDES.
    //
    // Ein Punkt traegt drei Koordinaten, und die Trennung zwischen ihnen
    // ist der ganze Trick.
    //
    // w ist die MATERIALKOORDINATE. Sie laeuft mit dem Flusz und bestimmt
    // allein, welche Stelle des Musters der Punkt gerade traegt. aTone und
    // aGain reisen mit dem Punkt, sonst waere der Flusz unsichtbar.
    //
    // platz ist der PLATZ IM FENSTER. fract holt jeden Punkt laufend auf die
    // Strecke von minus einer halben bis plus einer halben Periode zurueck,
    // deshalb verlaeszt kein Punkt jemals das Bild, egal wie weit die
    // Struktur gewandert ist.
    //
    // ph ist die WELTLAGE in Perioden. An ihr haengt das Muster, also
    // Verdrehung, Verjuengung und Ausklang.
    //
    // Die drei Eigenschaften, die daraus folgen, tragen den ganzen
    // Auftrag.
    //   In Ruhe laeuft nur uFlow. Jeder Punkt wandert dann durch ein
    //   stehendes Muster, die Form steht und die Textur flieszt. Das ist
    //   genau das bisherige Verhalten und die Silhouette bleibt still.
    //   Beim Scrollen waechst uTravel. Dann sinkt platz um denselben
    //   Betrag, waehrend ph fuer denselben Punkt gleich bleibt. Der Punkt
    //   behaelt also seine Stelle im Muster und wandert im Bild nach oben.
    //   Waechst uTravel um genau eins, so ist platz wieder derselbe und ph um
    //   eins groeszer. Weil das Muster periodisch ist und die Verdrehung je
    //   Periode genau PI zulegt, zeigt das Bild dieselbe Flaeche. Das Band
    //   laeuft damit in beide Richtungen endlos und ohne Naht.
    //
    // Der Flusz wird ABGEZOGEN, damit das Gewebe zum oberen Bandende hin
    // wandert. Ein groeszeres ph liegt weiter unten im Bild.
    // Die frueher hier stehende Begruendung, die Referenz steige, ist an
    // ref26 nachgemessen falsch; siehe die Erlaeuterung bei IDLE_FLOW.
    //
    // DER FLUSZ WIRD JETZT AUFGESCHLAGEN STATT ABGEZOGEN, und das ist die
    // Umkehr der Drehrichtung, die der Auftraggeber an der laufenden Seite
    // verlangt hat.
    //
    // Beide Seiten sind mit demselben Verfahren gegeneinander gemessen
    // worden, naemlich mit dem normierten Blockvergleich ueber ein Raster
    // von Bloecken auf einem Screencast mit dreiszig Bildern je Sekunde.
    // Der waagerechte Anteil der Bewegung ist dabei die Groesze, an der
    // sich die Drehrichtung ablesen laeszt, denn eine starre Drehung um die
    // senkrechte Achse bewegt die zugewandte Haelfte des Koerpers rein
    // waagerecht.
    //
    // Die Referenz laeuft in ihrem Faecher mit minus 2,1 / minus 8,0 /
    // minus 10,9 / minus 12,0 / minus 21,6 Bildpunkten je Sekunde, also
    // durchweg nach LINKS, bei einem senkrechten Anteil um null. Unser
    // Stand lief in jedem einzelnen Block seines Faechers nach RECHTS,
    // naemlich mit plus 1,7 / plus 2,5 / plus 2,7 / plus 3,7 / plus 4,5 /
    // plus 4,6 / plus 5,4 / plus 6,7, im gewichteten Mittel mit plus 1,69.
    // Die waagerechte Richtung war also genau entgegengesetzt.
    //
    // Der Vorgaenger hat fuer BEIDE Seiten ein negatives dx gemeldet. Fuer
    // die Referenz stimmt das, fuer uns nicht. Seine Reihe stand mit einer
    // Sekunde Abstand zwischen den Bildern, und bei acht bis zehn
    // Bildpunkten Weg je Sekunde gegen eine Gitterteilung von sechs bis
    // zehn Bildpunkten verschiebt sich das Muster dabei um fast genau eine
    // Masche. Eine Phasenmessung kann eine solche Verschiebung nicht mehr
    // von einer kleinen Verschiebung in die GEGENRICHTUNG unterscheiden.
    // Der Auftraggeber, der die Seite vor sich hatte, hat recht behalten.
    //
    // DER SENKRECHTE ANTEIL DER RUHEBEWEGUNG BLEIBT, UND ZWAR ZWANGSLAEUFIG.
    // Der Weg, ihn loszuwerden, ist gebaut, gemessen und wieder ausgebaut
    // worden; wer ihn noch einmal versucht, findet hier die Zahlen.
    //
    // Der Gedanke war, es der Referenz gleichzutun. Sie dreht ihr Netz starr
    // um die senkrechte Achse, im Quelltext mesh.rotation.y gleich der Zeit
    // mal minus 3,53 hoch minus fuenf, und ein Punkt laeuft dabei auf einem
    // WAAGERECHTEN Kreis um die Achse. Seine Bildbewegung hat deshalb keinen
    // senkrechten Anteil. Nachgebaut wird das durch einen zusaetzlichen
    // Summanden im Drehwinkel bei fester Hoehe, also durch th gleich PHASE0
    // plus DRALL mal ph mal uSpann PLUS uSpin, waehrend die Hoehe bei platz
    // mal uSpann stehenbleibt und der Materialflusz entfaellt.
    //
    // Gemessen an einer Bildschirmaufzeichnung mit dreiszig Bildern je
    // Sekunde und ausgewertet mit _ref2/vier/feld.mjs tut das genau, was es
    // soll: der senkrechte Anteil faellt von plus 8,49 auf plus 0,57
    // Bildpunkte je Sekunde.
    //
    // Es verschiebt den Fehler aber nur, statt ihn zu beheben, und der Grund
    // ist die SCHRAUBENSYMMETRIE der Flaeche. Auf dieser Flaeche gilt th
    // gleich PHASE0 plus DRALL mal der Welthoehe. Eine Drehung um den Winkel
    // alpha fuehrt die Flaeche deshalb in sich selbst ueber, um minus alpha
    // geteilt durch DRALL in der Hoehe verschoben. Die PUNKTE laufen dabei
    // auf waagerechten Kreisen, die FLAECHE aber wandert senkrecht, und mit
    // ihr die Silhouette und die Kreuzung.
    //
    // Die beiden Groeszen sind sogar dieselbe Zahl. Der Punkt legt heute je
    // Sekunde IDLE_FLOW mal die Periodenlaenge zurueck, also 0,00482 mal
    // 1720 gleich 8,29 Bildpunkte in der Senkrechten. Die Flaeche wandert
    // beim Drehen um omega gleich DRALL mal uSpann mal IDLE_FLOW je Sekunde
    // um omega geteilt durch DRALL mal uSpann mal die Periodenlaenge, also um
    // dieselben 8,29 Bildpunkte. Was der eine Weg an den Punkten spart, gibt
    // er an der Form wieder aus.
    //
    // Nachgemessen mit _ref2/vier/ruhereihe.mjs und _ref2/vier/stillstand.mjs
    // ueber sieben Aufnahmen in achtundvierzig Sekunden wanderte die linke
    // Gewebekante eines Zeilenbandes dabei um 14,5 Prozentpunkte der
    // Bildbreite, also um 209 Bildpunkte; die Taille lief mit rund sieben
    // Bildpunkten je Sekunde durch das Bild nach oben. Die Vorgabe erlaubt
    // 1,5 Prozentpunkte. Der Stillstand der Silhouette wiegt schwerer als
    // ein senkrechter Anteil von acht Bildpunkten je Sekunde in der Textur,
    // und deshalb bleibt es beim Materialflusz.
    //
    // Der Referenz gelingt beides, weil ihre Flaeche eine ANDERE ist. Eine
    // Drehung laeszt die Silhouette nur dann stehen, wenn die Flaeche um ihre
    // Achse drehsymmetrisch ist, also bei einem einschaligen Hyperboloid. Wir
    // sind von dieser Flaeche mit Bedacht abgeruckt, weil bei ihr zwischen
    // den beiden Silhouetten zwei Lagen des Gewebes uebereinanderstehen und
    // ihre Raster zu einem Fleckenmuster gegeneinander schweben; siehe die
    // Herleitung bei surf. Wer den senkrechten Anteil wirklich loswerden
    // will, musz zuerst dieses Problem loesen und nicht den Flusz umbauen.
    float w = aU + uFlow;

    // Die Scherung des Abtastrasters, siehe die Herleitung oben bei
    // SHEAR_M. Sie verschiebt jede Bahn gegen ihre Nachbarn laengs des
    // Bandes und legt damit die Kaemmrichtung fest.
    //
    // Sie wird an der UNGESCHERTEN Weltlage aufgehaengt und nicht mehr an
    // w minus einer halben Periode. Der frueher hier stehende Kurzweg war
    // zulaessig, solange die Scherung ein reiner Sinus in der
    // Bandkoordinate war, denn ein Sinus ueber eine ganze Periode sieht
    // ein ganzes Vielfaches der Periode nicht. Die hergeleitete Scherung
    // traegt jetzt auch den Kosinus der Verdrehung, und der aendert sich
    // ueber die Bandkoordinate deutlich schneller. Zwei zusaetzliche
    // Rechenschritte sind billiger als der Fehler.
    float platz0 = fract(w - uTravel) - 0.5;
    float ph0 = platz0 + uTravel;
    float scher = scherAt(ph0);

    // Der Versatz der Scherung wird VOR dem Zurueckwickeln aufgeschlagen,
    // denn er verschiebt den Punkt laengs des Bandes und damit im Fenster
    // und im Muster gleichermaszen.
    float platz = fract(w + scher * aS - uTravel) - 0.5;
    float ph = platz + uTravel;

    // Der Jacobi-Faktor der Scherung. Weil die Scherung ueber die
    // Bandkoordinate zu- und abnimmt, stehen die Sprossen einer Bahn nach
    // der Verschiebung nicht mehr ueberall gleich dicht. Die Flaeche
    // bleibt dabei lueckenlos belegt, weil der Faktor nirgends unter 0,359
    // faellt und die Abbildung damit umkehrbar bleibt, aber die Helligkeit
    // je Flaeche wuerde ohne Ausgleich mitwandern und als heller Streifen
    // laengs einer Bandkante stehen. Das Licht je Punkt wird deshalb mit
    // genau diesem Faktor multipliziert, denn Punktdichte mal Licht je
    // Punkt ist dann wieder konstant.
    //
    // Die Ableitung wird GENAEHERT statt hergeleitet, denn die Scherung
    // traegt jetzt die Kehle und die Verdrehung ineinander und eine von
    // Hand gerechnete Ableitung waere die naechste Fehlerquelle. Die
    // Schranke nach unten faengt die Periodenkante ab, wo die beiden
    // einseitigen Ableitungen verschieden sind.
    float dscher = (scherAt(ph0 + 0.004) - scherAt(ph0 - 0.004)) * 125.0;
    float jacobi = max(0.12, 1.0 + aS * dscher);

    // Der Drehwinkel der Strecke, auf der dieser Punkt sitzt. Er wird hier
    // noch einmal gebraucht, weil sich die Tangente laengs der Strecke und
    // das Masz der Verkuerzung von Hand daraus herleiten lassen.
    float thM = PHASE0 + DRALL * ph * uSpann;

    // DIE SICHTBARE DREHRICHTUNG, UND ZWAR EINE, DIE UEBER DEN GANZEN
    // SCROLLWEG DIESELBE BLEIBT.
    //
    // DER FEHLER, DEN DIESE ZEILEN BEHEBEN. Der Auftraggeber hat berichtet,
    // die Struktur drehe sich beim Ankommen auf der Sektion von rechts nach
    // links und kehre die Richtung um, sobald die erste Kreuzung vorbei sei.
    // Nachgemessen mit _ref2/eng/drehfilm.mjs und _ref2/eng/richtung.mjs im
    // Fenster 1150,180,240,240 stimmt das und es ist sogar schlimmer, denn
    // die Richtung kehrt sich VIERMAL je Periode um. Gemessen wanderte das
    // Muster bei den Scrollstaenden 0 / 600 / 1300 / 2000 / 3300 um
    // dx gleich minus 2 / plus 2 / null / minus 1 / plus 2 Bildpunkte je
    // zwanzig Bildern.
    //
    // DIE URSACHE IST GERECHNET UND NICHT GERATEN. Der Flusz schiebt einen
    // Punkt laengs der Bandkoordinate, also laengs seines Stranges. Der Strang
    // ist eine Schraubenlinie, und seine waagerechte Ableitung im Bild
    // betraegt aS mal RADIUS mal sin(th) mal DRALL mal uSpann. An einer festen
    // Stelle rechts der Achse liegt aS fest, naemlich bei minus dem Vorzeichen
    // von cos(th), denn der Bildort ist minus aS mal RADIUS mal cos(th). Das
    // Vorzeichen der Wanderung ist damit minus dem Vorzeichen von
    // sin(th) mal cos(th), also minus dem Vorzeichen von sin(2 th), und das
    // wechselt alle Viertelumdrehung. Die Kreuzungen liegen bei cos(th) gleich
    // null und die flache Phase bei sin(th) gleich null; genau dort liegen die
    // gemessenen vier Wechsel.
    //
    // WAS NICHT HILFT. Eine starre Drehung um die Achse traegt dasselbe
    // Vorzeichen, denn auch bei ihr betraegt die waagerechte Ableitung
    // aS mal RADIUS mal sin(th). Sie ist auszerdem zweimal gebaut und
    // verworfen worden, siehe die Rechnung weiter oben. Das Vorzeichen des
    // Flusses an sin(2 th) zu koppeln beseitigt den Wechsel zwar rechnerisch,
    // zerreiszt das Gewebe aber an vier waagerechten Nahtstellen je Periode,
    // weil die Bereiche beiderseits einer Nahtstelle dann dauerhaft
    // gegeneinander laufen.
    //
    // WAS HILFT. Eine zweite Bewegung QUER zur Sprosse. Ein Punkt, der laengs
    // seiner Sprosse wandert, hat die waagerechte Ableitung
    // minus RADIUS mal cos(th), und die haengt NICHT von aS ab, gilt also fuer
    // alle Punkte einer Sprosse gleich. Koppelt man ihre Richtung an das
    // Vorzeichen von cos(th), so bleibt minus RADIUS mal dem BETRAG von
    // cos(th) stehen, und das ist ueberall und zu jeder Zeit negativ. Die
    // Struktur wandert damit durchgehend von rechts nach links, so wie der
    // Auftraggeber es beim Ankommen gesehen und als richtig bezeichnet hat.
    //
    // DIE NAHTSTELLE DIESER KOPPLUNG LIEGT AN DER KREUZUNG, und genau dort
    // faellt sie nicht auf. Bei cos(th) gleich null ist die waagerechte
    // Ausdehnung der Sprosse null, die Querbewegung erzeugt dort also
    // ueberhaupt keine sichtbare Verschiebung; der Vorzeichenwechsel geschieht
    // im Stillstand. Ober- und unterhalb der Kreuzung stehen die Spalten
    // danach um bis zu eine halbe Spaltenweite gegeneinander versetzt, und das
    // sind fuenf Bildpunkte zwischen zwei ohnehin getrennten Faechern.
    //
    // DER UMLAUF IST SAUBER, weil die Querkoordinate seit dieser Runde ueber
    // N_S statt ueber N_S minus eins gebildet wird. Die N_S Spalten liegen
    // damit gleichabstaendig auf einem Umlauf, ein Umlauf bildet das Raster
    // also genau auf sich selbst ab und es gibt weder eine Luecke noch eine
    // doppelt gezeichnete Spalte. Die Begruendung steht bei der Erzeugung des
    // Attributes aS.
    //
    // DER SENKRECHTE ANTEIL DER RUHEBEWEGUNG BLEIBT UNBERUEHRT. Diese
    // Bewegung kommt zum Flusz laengs des Bandes HINZU und ersetzt ihn nicht.
    // Ihr eigener senkrechter Anteil ist RADIUS mal sin(th) mal sin(TILT) und
    // damit bei TILT gleich 0,05 hoechstens ein Zwanzigstel ihres waagerechten.
    float drehSinn = cos(thM) >= 0.0 ? 1.0 : -1.0;
    float aSp = fract((aS * 0.5 + 0.5) + uSpin * drehSinn) * 2.0 - 1.0;

    vec3 p = surf(platz, ph, aSp);

    // Tangenten der Flaeche, daraus die Normale. Sie entscheidet ueber
    // die Helligkeit: steht das Band auf der Kante, ruecken die
    // Rasterpunkte im Bild zusammen und ihr Licht addiert sich zur
    // leuchtenden Falte. Genau das zeigt die Referenz.
    //
    // Laengs der Achse wird die Ableitung GENAEHERT statt hergeleitet.
    // Mit der Verjuengung haengt der Radius ueber eine smoothstep-Kurve
    // an der Weltlage; zwei zusaetzliche Auswertungen der Flaeche sind
    // billiger und sicherer als die von Hand hergeleitete Ableitung.
    //
    // Der Schritt wird auf BEIDE Koordinaten gelegt, denn laengs des
    // Bandes waechst der Platz im Fenster genau so schnell wie die
    // Weltlage.
    float e  = 0.004;
    vec3 tu  = (surf(platz + e, ph + e, aSp) - surf(platz - e, ph - e, aSp)) / (2.0 * e);
    // Die Tangente LAENGS der Strecke. Sie ist die Ableitung der Flaeche
    // nach sc und zeigt damit in die Richtung der gedrehten Geraden.
    vec3 ts  = vec3(RADIUS * cos(thM), 0.0, RADIUS * sin(thM));
    vec3 n   = normalize(cross(tu, ts));

    // Die Referenz stellt ihre Achse nicht senkrecht, sondern neigt sie
    // in der Bildebene. Die Drehung kommt deshalb nach der Kippung dazu.
    //
    // Bei 0,175 wanderte der Gewebeschwerpunkt vom oberen zum unteren
    // Bildrand um 12,2 Prozentpunkte der Bildbreite, die Referenz legt
    // ueber dieselbe Strecke nur 4,0 zurueck. Weil die Fluchtung die
    // Neigung zusaetzlich streckt, muss der Winkel staerker zurueck als
    // das Verhaeltnis der beiden Zahlen vermuten laesst.
    //
    // DER WERT GEHT VON 0,07 AUF 0,26, UND DAS IST DIE ANTWORT AUF DIE
    // BEANSTANDUNG, DIE STRUKTUR STEHE ZU AUFRECHT. Der Auftrag hat dafuer
    // auf TILT gezeigt; nachgemessen bewegt TILT die Achse im Bild aber
    // ueber seinen ganzen Bereich nur um gut einen Grad, weil es in die
    // TIEFE kippt und nicht in der Bildebene. Die ausfuehrliche Rechnung
    // samt der verworfenen Fassung steht oben bei TILT. LEAN ist der eine
    // Hebel, der die Achse im BILD dreht, und deshalb greift die Aenderung
    // hier an.
    //
    // Die Richtung stimmt mit der Referenz ueberein. Ein Punkt auf der
    // Achse steht bei flat2 gleich (0, t) und geht nach der Drehung auf
    // (minus t mal sin(LEAN), t mal cos(LEAN)); ein groeszeres LEAN schickt
    // das untere Ende also nach LINKS und das obere nach rechts, genau so
    // wie das Band der Referenz von rechts oben nach links unten faellt.
    //
    // Die Groesze ist an der Vorgabe fuer die linke Gewebekante bemessen
    // und nicht am Winkel der Referenz. Deren Achse liegt bei minus 29 Grad
    // und unsere bei plus 23; die Luecke von ueber fuenfzig Grad ist mit
    // einer Drehung gar nicht zu schlieszen, weil die beiden Faecher bei
    // uns BEIDE nach rechts aufgehen und bei der Referenz nach oben rechts
    // und unten links. Eine Drehung dreht beide Lappen gleich weit und
    // aendert an diesem Oeffnungssinn nichts. Gedreht wird deshalb nur so
    // weit, wie die Struktur dabei in der rechten Bildhaelfte bleibt, und
    // das ist der Punkt, an dem die Kehle im Bild sichtbar aus der
    // Senkrechten geht. Der frueher hier stehende Grund fuer die Senkung
    // auf 0,07, der Seitwaertsweg des Gewebeschwerpunktes, ist damit
    // ausdruecklich zurueckgestellt: er ist an der Referenz gemessen
    // worden, deren Faecher an beiden Bildraendern beschnitten sind, und
    // ein beschnittener Faecher haelt seinen Schwerpunkt von selbst fest.
    // DER WERT GEHT VON 0,26 AUF 0,10 ZURUECK, UND DAMIT IST DIE ERHOEHUNG
    // AUF 0,26 ALS FEHLGRIFF ZURUECKGENOMMEN.
    //
    // Der Auftraggeber hat zuletzt beanstandet, die Struktur stehe nicht
    // gerade zum Boden. Das ist kein Widerspruch zu der Beanstandung, die
    // 0,26 ausgeloest hat, sondern deren Aufloesung. Gewuenscht war die
    // schraege Anmutung der Referenz, bei der die beiden Faecher in
    // VERSCHIEDENE Richtungen aufgehen; LEAN dreht dagegen das ganze
    // Gebilde in der Bildebene wie ein Bild an der Wand und liefert damit
    // ein umgefallenes Ganzes statt eines verdrehten.
    //
    // Gemessen mit _ref2/final/achse.mjs lag die Achsneigung des unteren
    // Lappens bei 0,26 zwischen minus 56,3 und minus 57,5 Grad, waehrend
    // die Referenz in _ref2/refscroll/roll11 minus 29,9 und in
    // _ref2/mess/live/ruhe00 minus 24,0 Grad traegt. Wir kippten also um
    // gut dreiszig Grad weiter als die Referenz.
    //
    // Der neue Wert ist am BILD gesucht und nicht an dieser Zahl, denn die
    // Zahl misst den Lichtschwerpunkt des unteren Lappens und damit
    // ueberwiegend die Oeffnungsrichtung des Faechers; sie kann den Rest
    // der Neigung gar nicht abbilden. Massgeblich ist, ob die Sanduhr im
    // Bild aufrecht auf dem Boden zu stehen scheint.
    const float LEAN = 0.10;
    float ct = cos(TILT), st = sin(TILT);
    vec3 q = vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
    vec3 m = vec3(n.x, n.y * ct - n.z * st, n.y * st + n.z * ct);

    float depth = CAM - q.z;
    if (depth < 0.35) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    float persp = CAM / depth;

    vec3 view = normalize(vec3(-q.x, -q.y, depth));
    float dp = dot(m, view);
    float facing = abs(dp);
    // Die abgewandte Seite tritt zurueck, das gibt der Falte Tiefe.
    //
    // Bei 0,5 war der Rueckgang viel zu hart. Das Vorzeichen von dp
    // wechselt naemlich nicht quer ueber den Streifen, sondern LAENGS
    // der Achse an der Taille — der halbe Faktor traf deshalb immer
    // einen ganzen Lappen und liesz ihn auf halber Helligkeit stehen.
    // Gemessen deckte der obere Lappen dadurch 21,9 Prozent des
    // Zeilenbandes ab, der untere 47,4, Verhaeltnis 2,17; die Referenz
    // liegt bei 0,85 bis 0,90. Weil die Drehung den Wechsel alle 78
    // Sekunden umkehrt, tauschten die beiden Lappen ihre Helligkeit
    // dabei auch noch hin und her. Bei 0,82 bleibt die Tiefe der Falte
    // erhalten, ohne dass ein halbes Bild wegbricht.
    // Der Wert stand auf 0,82 und ist auf 0,62 zurueck. Er war 2017 aus
    // Vorsicht hoch gesetzt worden, weil der Vorzeichenwechsel mit der
    // wandernden Drehlage alle 78 Sekunden umsprang und dann abwechselnd
    // den einen oder den anderen Lappen traf. Seit die Drehlage steht,
    // trifft er dauerhaft denselben Lappen und darf tiefer greifen.
    // Nachgemessen faellt die Bedeckung der Referenz ueber die Zeilen
    // 84,6 / 94,4 / 98,1 von 30,6 ueber 23,7 auf 13,6 Prozent, unsere
    // STIEG ueber dieselben Zeilen von 39,8 ueber 42,5 auf 43,2. Der
    // untere Lappen war ein voll ausgeleuchteter dichter Block, wo die
    // Referenz einen verloeschenden Schleier zeigt.
    // Der Wert BLEIBT bei 0,62, und der Versuch, ihn zu senken, ist
    // gebaut und wieder verworfen worden. Er sollte den unteren Lappen
    // daempfen, denn dort traegt die Referenz im Fenster 620,480,420,180
    // ein 99. Perzentil von 72,0 bei 29,8 Prozent Bedeckung und wir 94,7
    // bei 61,3 Prozent, waehrend die beiden OBEREN Lappen mit 171,8 gegen
    // 168,9 uebereinstimmen. Nachgemessen trifft das Vorzeichen aber
    // genau den anderen Lappen: mit 0,52 fiel das 99. Perzentil des OBEREN
    // Lappens von 168,9 auf 154,8, waehrend der untere mit 96,9 unberuehrt
    // blieb. Der abgewandte Lappen ist bei dieser Drehlage der obere.
    // DER WERT STEHT JETZT BEI 0,12, und das ist die wichtigste Aenderung
    // fuer die Frage, ob man einer Reihe ueber den ganzen Ausschnitt folgen
    // kann.
    //
    // Seit die Flaeche ein geschlossenes Hyperboloid ist, laeuft sc ueber
    // volle zwei PI und die Flaeche umschlieszt die Achse. Zwischen den
    // beiden Silhouetten liegen deshalb ZWEI Lagen des Gewebes
    // uebereinander, naemlich die zugewandte und die abgewandte Haelfte des
    // Schlauches. Ihre Raster stehen unter verschiedenen Winkeln und
    // schweben gegeneinander, und was im Bild ankommt, ist keine Schar von
    // Reihen mehr, sondern ein Fleckenmuster aus Schwebungsknoten. Genau
    // das zeigt die Zwoelffachvergroeszerung unseres Standes: dicht an der
    // Silhouette, wo nur eine Lage steht, laufen saubere Reihen, und in der
    // Mitte des Faechers, wo beide Lagen stehen, loest sich jede Ordnung
    // auf.
    //
    // Die Referenz zeigt an derselben Stelle ein einziges sauberes
    // Rautengitter, siehe die Nahaufnahme aus _ref2/vid27/v004.jpg um
    // 1760,420. Ihre beiden Gitterrichtungen sind die Erzeugende und die
    // Sprosse EINER Lage und nicht zwei Lagen. Mit 0,12 traegt die
    // abgewandte Haelfte noch so viel Licht, dass die Silhouette nicht
    // abreiszt, steht dem Gitter der zugewandten Haelfte aber nicht mehr
    // im Weg.
    //
    // DER WERT STEHT JETZT BEI 0,50, UND ER IST DIE URSACHE DAFUER, DASS
    // UNSERE ENGSTELLE UEBERHAUPT KEINE KREUZUNG ZEIGTE.
    //
    // Die Begruendung von 0,12 stammt aus der Zeit des geschlossenen
    // Hyperboloids, bei dem zwischen den beiden Silhouetten wirklich zwei
    // Lagen des Schlauches uebereinanderstanden und ihre Raster
    // gegeneinander schwebten. Seit die Flaeche eine verdrehte Ebene ist,
    // liegt an keiner Stelle mehr als EINE Lage vor dem Auge, und das
    // Vorzeichen von dp wechselt nicht quer ueber den Streifen, sondern
    // LAENGS der Achse genau an der Engstelle. Der Faktor traf damit nicht
    // eine stoerende zweite Lage, sondern den gesamten unteren Faecher.
    //
    // Zusammen mit dem Bodenwert von tiefe blieben von ihm 0,12 mal 0,22
    // gleich 2,6 Prozent uebrig. Gemessen im Fenster 850,150,450,700 des
    // Standes a2800 fiel die Bedeckung unterhalb der Engstelle von 6,9 auf
    // 1,3 Prozent und der Hoechstwert je Zeile auf 36, also auf den blanken
    // Seitengrund; oberhalb standen 15 bis 40 Prozent bei Hoechstwerten um
    // 200. Die Referenz traegt im selben Abstand unter ihrer Engstelle noch
    // 7,6 bis 13,2 Prozent bei Hoechstwerten von 147 bis 211. Wir zeigten
    // eine einzige Schar, die Referenz zeigt zwei.
    //
    // Mit 0,50 traegt die abgewandte Haelfte die halbe Helligkeit der
    // zugewandten. Das Gefaelle bleibt damit deutlich genug, um die Tiefe
    // der Falte zu tragen, und die zweite Schar wird als eigene Schar
    // lesbar. Der Bereich von 0,4 bis 0,65 ist am Bild abgesucht worden.
    //
    // Der Wert steht am Ende bei 0,62, also am oberen Rand dieses Bereiches.
    // Bei 0,50 war die zweite Schar zwar da, las aber immer noch als
    // Schleier hinter der ersten und nicht als eigene Schar; gemessen trug
    // der untere Faecher im Fenster 880,500,320,200 Hoechstwerte je Zeile
    // von 43 bis 57 gegen die 107 bis 254 des oberen. Die Referenz haelt an
    // derselben Stelle 147 bis 211 gegen 233 bis 255, also ein Verhaeltnis
    // von rund 0,7 statt unserer 0,3.
    //
    // DER WERT GEHT VON 0,62 AUF 0,85, und der Anlasz ist zum ersten Mal die
    // Referenz selbst und nicht unser eigenes Bild.
    //
    // Getrennt nach oberer und unterer Halbkreishaelfte gemessen, mit
    // _ref2/vier/hofmess.mjs an _ref2/vier/reffilm/f000.png, traegt die
    // Referenz bei einem Halbmesser von 55 Bildpunkten 52,7 oben gegen 45,9
    // unten und bei 30 Bildpunkten 94,5 gegen 68,3. Ihre beiden Faecher
    // unterscheiden sich also um dreizehn bis siebenundzwanzig Prozent. Wir
    // standen mit side gleich 0,62 bei 70,2 gegen 26,6 und 67,2 gegen 83,3,
    // also je nach Scrollstand bei einem Verhaeltnis von 0,38.
    //
    // Der Ausklang war daran nicht mehr schuld, denn er greift 55
    // Bildpunkte unter der Kreuzung noch gar nicht. Uebrig bleibt dieser
    // Faktor, und mit 0,85 steht das Verhaeltnis der beiden Faecher dort,
    // wo die Referenz es haelt. Die Tiefe der Falte traegt weiterhin der
    // Faktor tiefe weiter unten, der zwischen 0,36 und 1,0 laeuft und
    // anders als dieser hier an der wirklichen Entfernung haengt.
    float side = dp < 0.0 ? 0.85 : 1.0;

    // Grundhelligkeit traegt das GEWEBE, der zweite Summand nur die
    // Falte. Zu niedrig gesetzt liest die Struktur als einzelne
    // Kurvenlinien mit Luecken statt als gefuellte Flaeche — genau das
    // war der sichtbare Unterschied zur Referenz.
    // Hier stand core = smoothstep(0.0, 0.22, abs(aS)) mit der
    // Begruendung, zur Achse hin liefen alle Punkte einer Sprosse
    // zusammen und muessten gedaempft werden. Die Begruendung ist falsch,
    // und der Faktor war der schwerste sichtbare Fehler des Gewebes.
    //
    // Die Punkte einer Sprosse sitzen bei gleichmaeszig verteiltem s, und
    // ihr Bildort haengt LINEAR von s ab, naemlich ueber
    // r = RADIUS * kehleAt(ph) * s. Eine lineare Abbildung eines
    // gleichmaeszigen Rasters ist wieder gleichmaeszig; zur Achse hin
    // laeuft also gar nichts zusammen und es gibt nichts auszugleichen.
    // Was der Faktor stattdessen tat, war die mittleren 22 Prozent der
    // Bandbreite auszuloeschen. Weil die Bandmitte ueber die GESAMTE
    // Bildhoehe auf die Achse bei 74 Prozent der Seitenbreite faellt,
    // stand dort ein durchgehender dunkler Risz mit hellen Graten
    // daneben. Gemessen zeigten neun von zehn waagerechten Streifen eine
    // Kerbe ueber vier Stufen, die tiefste 33,4; die Referenz hat drei
    // von zehn und die liegen alle in der Taille.
    //
    // Die wirkliche Haeufung sitzt an der TAILLE, und zwar aus zwei
    // Gruenden, die beide schon abgefangen sind: die Verjuengung nimmt
    // ueber squeeze zurueck, und die Kantenlage ueber den Faktor facing.

    // Die Verjuengung schiebt die Querpunkte an der Taille auf ein
    // Drittel des Abstands zusammen. Ohne Gegengewicht brennt genau
    // dort ein weisser Fleck aus. Der Faktor nimmt die eingeschnuerte
    // Stelle so weit zurueck, wie sie dichter wird.
    // Der Bodenwert stand auf 0,58 und steht jetzt bei 0,17. Er ist NICHT
    // fuer sich geaendert worden, sondern haelt zusammen mit dem
    // Kantenfaktor weiter unten die Engstelle genau so hell wie zuvor:
    // 0,06 mal 0,58 gleich 0,0348 und 0,27 mal 0,125 gleich 0,0338. Nur die
    // UMGEBUNG der Engstelle wird heller, und zwar genau die, siehe die
    // Begruendung beim Kantenfaktor.
    // Der Bodenwert geht ein zweites Mal zurueck, von 0,125 auf 0,0708, und
    // er tut es wieder nicht fuer sich allein. Der Kantenfaktor weiter
    // unten hebt seinen eigenen Bodenwert im selben Zug von 0,27 auf 0,48,
    // das Produkt an der Engstelle bleibt mit 0,034 gegen zuvor 0,0338
    // also praktisch gleich. Verschoben wird allein das Licht zwischen den
    // Lappen und dem Hof um die Engstelle.
    // Das Masz der Einschnuerung ist jetzt der Abstand des Punktes von der
    // Achse, auf den weitesten Abstand bezogen. An der Kehle steht es bei
    // KEHLE durch RADIUS, am Rand des Sichtfensters bei eins. Es tritt an
    // die Stelle der frueheren Restbreite, die zur kuenstlichen Taille
    // gehoerte und mit ihr entfallen ist.
    // DER AUSGLEICH IST JETZT AUF DEN KNOTEN HIN EINGESTELLT UND NICHT MEHR
    // GEGEN IHN.
    //
    // Die Referenz traegt an der Engstelle einen kompakten hellen Knoten,
    // siehe _ref2/vid27/klein-waist004.jpg. Er entsteht ohne jedes Zutun,
    // denn alle Erzeugenden laufen durch den Kehlkreis, und dessen Bild ist
    // eine Strecke von zwoelf Bildpunkten Laenge. Die Punktdichte waechst
    // dort mit dem Kehrwert des Achsabstandes, also um den Faktor RADIUS
    // geteilt durch KEHLE gleich 46.
    //
    // Der alte Ausgleich nahm genau diesen Faktor wieder heraus und noch
    // etwas mehr: sein Bodenwert von 0,0708 daempfte die Engstelle um das
    // Vierzehnfache. Er stammt aus der Zeit der kuenstlichen Verjuengung,
    // die das Material an der Taille auf ein Zwoelftel zusammenschob und
    // dort einen weiszen Fleck von der Groesze einer halben Bildhoehe
    // ausbrannte. Beim Hyperboloid ist die Haeufung dagegen auf eine
    // Strecke von zwoelf mal achtzehn Bildpunkten beschraenkt, und genau
    // diese Strecke soll leuchten.
    //
    // Der Bodenwert steht deshalb bei 0,30 und die Stuetzstelle bei 0,55
    // statt bei KEHLE geteilt durch RADIUS. Der Ausgleich greift damit
    // nicht mehr an der Engstelle selbst, sondern ueber die 250
    // Bildpunkte darueber und darunter, wo das Gewebe sich zusammenzieht
    // und ohne Gegengewicht als heller Trichter stehen wuerde.
    // Der Ausgleich ist LINEAR im Achsabstand und nicht mehr eine weiche
    // Stufe, denn nur dann hebt er die Haeufung genau auf. Die Punktdichte
    // laengs einer Sprosse waechst mit dem Kehrwert des Achsabstandes, ein
    // Ausgleich, der selbst mit dem Achsabstand waechst, haelt das Produkt
    // aus beiden also konstant. Zwischen dem Achsabstand 0,11 und 0,55 von
    // RADIUS steht das Gewebe damit ueberall gleich hell, und erst unter
    // 0,11, also innerhalb von 51 Bildpunkten um die Engstelle, greift der
    // Bodenwert und laeszt die Haeufung durch. Am Kehlkreis selbst traegt
    // sie das 9,2-fache und brennt dort zum Knoten aus.
    // Das Masz ist jetzt die VERKUERZUNG DURCH DIE PROJEKTION und nicht mehr
    // ein Achsabstand. Eine Strecke, die der Kamera frontal steht, misst
    // ihre volle Breite; dreht sie sich in die Blickrichtung, faellt ihre
    // projizierte Breite mit dem Kosinus gegen null, und dieselbe Zahl von
    // Punkten draengt sich auf immer weniger Bildpunkte. Der Ausgleich ist
    // linear in dieser Groesze, denn die Dichte waechst mit ihrem Kehrwert;
    // das Produkt aus beiden bleibt damit konstant. Der Bodenwert laeszt die
    // Haeufung erst unmittelbar an der Kreuzung durch, wo sie zum hellen
    // Knoten ausbrennen soll.
    float enge = abs(cos(thM));
    // Der Bodenwert stand auf 0,85 und der Nenner auf 0,55. Beide Zahlen
    // aendern sich, und beide aus demselben Bild.
    //
    // Der Bodenwert von 0,85 lieszt an der Kreuzung fuenfzehn Prozent der
    // Haeufung durch, und weil sich dort Dutzende Reihen auf wenige
    // Bildpunkte draengen, brannte sie zu einer massiven weiszen Flaeche
    // aus. Mit 0,42 traegt die Kreuzung noch die Haelfte davon; sie bleibt
    // die hellste Stelle der Struktur, so wie bei der Referenz, wird aber
    // kompakter und laeuft feiner aus.
    //
    // Der Nenner entscheidet ueber die LAENGE der Schweife. Er gibt an,
    // bis zu welcher Verkuerzung der Ausgleich noch greift, und bei 0,55
    // reichte er weit in die ruhige Flaeche hinein, sodass aus der
    // Kreuzung lange helle Baender herausliefen. Mit 0,38 endet der
    // Ausgleich frueher, und die Reihen sind schon kurz hinter der
    // Kreuzung wieder als einzelne feine Punktreihen lesbar.
    //
    // Der Bodenwert geht von 0,42 auf 0,62, und der Anlasz ist der fehlende
    // helle Kern. Gemessen traegt die Referenz an ihrer Engstelle einen
    // Rohwert von 255, also volle Saettigung, und ein Ringmittel ueber ihrem
    // Grund von 156,5 bei einem Halbmesser von sechs Bildpunkten. Wir lagen
    // bei 136 und 60,1. Das Ausbleichen nach Weisz ist im Fragment-Teil
    // gebaut und wurde nur nicht erreicht, weil der Bodenwert die Haeufung
    // an der Kreuzung auf 42 Prozent zurueckhielt.
    //
    // Der Bodenwert geht im zweiten Anlauf auf 0,85 weiter, also zurueck auf
    // den Stand vor der Ausbrennrunde. Die damalige Begruendung gilt nicht
    // mehr, denn sie stammt aus der Zeit des Grundfaktors 13,6; heute steht
    // er bei 2,3 und die Kreuzung erreicht selbst mit vollem Durchgriff
    // keine geschlossene weisze Flaeche. Nachgemessen ist die hellste Stelle
    // unseres Bildes nicht die Kreuzung, sondern die obere Silhouette, und
    // genau das dreht dieser Wert um: die Silhouette traegt squeeze gleich
    // eins, die Kreuzung trug bisher nur 0,42 und damit weniger als ihre
    // eigene Umgebung.
    //
    // Der Bodenwert steht am Ende bei 0,95, die Daempfung an der Kreuzung ist
    // also fast ganz aufgehoben. Sie bleibt nur als kleiner Rest stehen,
    // damit die Groesze weiterhin greift, wenn der Grundfaktor spaeter
    // einmal steigt. Gemessen traegt die Kreuzung damit ein Ringmittel ueber
    // dem Grund von rund 140 bei einem Halbmesser von sechs Bildpunkten
    // gegen die 157 der Referenz, und ihr Kern laeuft in die Saettigung.
    //
    // Der Bodenwert geht von 0,95 auf 0,36, und er wird NICHT fuer sich
    // geaendert, sondern folgt der Senkung von TILT. Die senkrechte
    // Ausdehnung einer Sprosse im Bild betraegt RADIUS mal sin(TILT) mal
    // uUnit und faellt mit TILT von 0,13 auf 0,05 von 38,7 auf 14,9
    // Bildpunkte. Dieselbe Zahl von Punkten draengt sich an der Kreuzung
    // damit auf eine 2,6-fach kuerzere Strecke, und der Bodenwert nimmt genau
    // diesen Faktor wieder heraus. Aus 0,95 geteilt durch 2,6 folgt 0,36.
    float squeeze = clamp(enge / 0.38, 0.36, 1.0);

    // DER LICHTVERLAUF ZUR KREUZUNG HIN.
    //
    // Der Auftraggeber verlangt, dass die Punkte auszerhalb der Kreuzung
    // dunkler werden und es zur Kreuzung hin wirklich heller wird. Die
    // Messung gibt ihm recht, und zwar deutlich. Verglichen werden dazu
    // Fenster von 120 mal 120 Bildpunkten in gleichem Abstand von der
    // Kreuzung, laengs der Mittellinie des offenen Faechers, und zwar ueber
    // die Streuung im Fenster, die von jeder Schwelle unabhaengig ist.
    //
    // Die Referenz traegt an ihrer Kreuzung 26,3 und in 150, 250 und 350
    // Bildpunkten Abstand nur noch 13,3 / 11,9 / 9,6, faellt also auf gut
    // ein Drittel. Wir trugen 32,1 an der Kreuzung und 41,1 / 34,1 / 30,4
    // auszen, standen also weiter drauszen HELLER als in der Mitte. An der
    // Kreuzung selbst treffen wir die Referenz auf 22 Prozent genau, im
    // Faecher tragen wir das Dreifache ihres Lichtes.
    //
    // Der Abstand von der Kreuzung laeszt sich aus der Bandkoordinate
    // gewinnen, ohne den Bildort der Kreuzung ueberhaupt zu kennen. Die
    // Kreuzung liegt dort, wo die Reihe dem Betrachter die Kante zudreht,
    // wo also der Kosinus des Windungswinkels verschwindet; enge traegt
    // genau diese Auskunft und ist schon gerechnet. Der Arkussinus von enge
    // ist der Winkelabstand von der Kantenlage, und geteilt durch DRALL ist
    // das der Abstand LAENGS der Achse in Welteinheiten. Der Arkussinus
    // wickelt dabei von selbst richtig, denn die Flaeche traegt alle halbe
    // Umdrehung eine neue Kreuzung und jeder Punkt bekommt den Abstand zu
    // SEINER.
    //
    // Quer dazu liegt der Punkt um aS mal RADIUS neben der Achse, und die
    // Projektion verkuerzt diesen Abstand mit demselben Kosinus. Beide
    // Anteile stehen damit in derselben Einheit und lassen sich nach
    // Pythagoras zusammenfassen. Eine Welteinheit ist uUnit gleich 130,0
    // Bildpunkte gross, der Wert 1,0 entspricht also rund 129 Bildpunkten
    // im Bild.
    //
    // Der Verlauf ist eine weiche Stufe und keine Exponentialkurve. Eine
    // Exponentialkurve haette bei der noetigen Steilheit schon die
    // Ringmittel um den Kern mitgenommen, und die sitzen mit 145 / 82,7 /
    // 52,5 bei sechs, sechzehn und fuenfundfuenfzig Bildpunkten Halbmesser
    // bereits auf den Werten der Referenz.
    //
    // Die Stufe setzt bei HOF_VON gleich 1,10 und damit rund 142 Bildpunkten
    // ein und ist bei HOF_BIS gleich 4,60 und damit 593 Bildpunkten fertig.
    // Sie deckt damit knapp die halbe Strecke zwischen zwei Kreuzungen ab,
    // denn dKreuz erreicht hoechstens PI halbe geteilt durch DRALL gleich
    // 8,63. Genau darin liegt der Unterschied zum frueheren Stand mit 0,60
    // und 1,70, der nur das innerste Fuenftel erfasste und die ganze flache
    // Phase gleichmaeszig auf dem Boden liegen liesz. Die Begruendung samt
    // Rechnung steht bei HOF_BODEN.
    float dLaengs = asin(clamp(enge, 0.0, 1.0)) / DRALL;
    float dQuer   = aSp * RADIUS * enge;
    float dKreuz  = sqrt(dLaengs * dLaengs + dQuer * dQuer);
    // DIE KREUZUNG STEHT HELLER ALS DER REST, AUF ANSAGE DES
    // AUFTRAGGEBERS. Der erste Wert war 1,0, die Kreuzung trug also
    // genau das Grundlicht und hob sich allein dadurch ab, dass alles
    // andere gedaempft wurde. Mit 1,32 bekommt sie einen eigenen
    // Zuschlag. Der Bodenwert bleibt unberuehrt, die flache Phase wird
    // also nicht mit heller, und genau darum ging es.
    float hof = mix(1.32, HOF_BODEN, smoothstep(HOF_VON, HOF_BIS, dKreuz));
    // Der zweite Summand hiesz frueher 0,03 * 1/(facing + 0,16) und hob
    // die Helligkeit genau dort an, wo das Band auf der Kante steht.
    // Dort laufen aber ohnehin Dutzende Rasterreihen auf dieselben Pixel;
    // die zusaetzliche Aufhellung klemmte den Saum auf Weisz. Gemessen im
    // 420er Fenster lag das 99,9. Perzentil bei 240 ueber dem Sockel
    // gegen 186 der Referenz, der Hoechstwert bei 242 gegen 222. Das
    // Vorzeichen war schlicht falsch herum, deshalb DAEMPFT der Faktor
    // die Kantenlage jetzt, statt sie zu verstaerken.
    // Der Daempfungsanteil steht bei 0,88 statt 0,65, weil die
    // Aufhellung an der Engstelle NICHT aus der Schattierung kommt,
    // sondern daraus, dass die 112 Querpunkte einer Sprosse auf der
    // Kante auf einen kurzen Bildabschnitt zusammenfallen. Ihre Dichte
    // waechst mit 1 durch facing, also muss der Ausgleich fast linear in
    // facing sein. Mit 0,35 und 0,65 blieb das 99,9. Perzentil bei 242
    // ueber dem Sockel gegen 186 der Referenz. Der Grundfaktor darf im
    // Gegenzug wieder hoeher stehen, sonst faellt das ganze Gewebe zu
    // dunkel aus; gemessen lag sein 99. Perzentil bei 101 gegen 139.
    // Die frueher hier stehende Blende an der Naht des Umlaufs ist
    // ERSATZLOS entfallen, und der Grund ist, dass es keine Naht mehr gibt.
    // Sie nahm die aeuszersten drei Prozent der Bandlaenge zurueck, damit
    // ein Punkt beim Sprung vom einen Bandende zum anderen nicht sichtbar
    // aufblitzt. Seit die Verdrehung je Periode genau PI zulegt und
    // Verjuengung wie Ausklang periodisch sind, ist das Muster an der
    // Wickelstelle stetig, und ein Punkt, der unten aus dem Band laeuft und
    // oben wieder hereinkommt, findet dort genau die Umgebung vor, die zu
    // ihm passt. Eine Blende wuerde jetzt umgekehrt einen dunklen Streifen
    // erzeugen, wo vorher nichts zu sehen war.
    //
    // Die Tiefenabschwaechung. Die Referenz laeszt ihren abgewandten
    // Lappen nach unten hin ausklingen: ihre Bedeckung faellt ueber die
    // Zeilen 84,6 / 94,4 / 98,1 von 30,6 ueber 23,7 auf 13,6 Prozent,
    // unsere STIEG ueber dieselben Zeilen von 39,8 auf 43,2. persp ist
    // klein fuer weit entfernte Teile des Bandes und traegt damit genau
    // die Tiefeninformation, die dem unteren Lappen fehlte.
    //
    // Die Abschwaechung greift jetzt deutlich tiefer. Sie stand auf
    // 0,55 plus 0,45 mal dem Ueberschusz mit einem Bodenwert von 0,50, der
    // abgewandte Teil trug also immer noch die halbe Helligkeit des
    // zugewandten. Im Bild las die Struktur dadurch als ein Koerper mit
    // gleichmaesziger Oberflaeche und nicht als eine Flaeche, die sich in
    // den Raum hinein verliert. Mit 0,30 plus 0,70 mal dem Ueberschusz und
    // einem Bodenwert von 0,22 faellt die abgewandte Seite auf gut ein
    // Fuenftel, wird also dunkler, weicher und kontraestaermer, waehrend
    // die zugewandte unveraendert steht. Genau dieses Gefaelle traegt die
    // Raeumlichkeit, die der Referenz ihre Tiefe gibt.
    //
    // Der Bodenwert geht von 0,22 auf 0,36, und er wird zusammen mit dem
    // Seitenfaktor betrachtet, weil beide multiplikativ auf dieselben
    // Punkte wirken. Von der abgewandten Haelfte blieben zuvor 0,12 mal
    // 0,22 gleich 2,6 Prozent uebrig; das ist weniger als das Rauschen des
    // Leerfeldes und damit unsichtbar. Mit 0,50 mal 0,36 stehen jetzt 18
    // Prozent, und das ist genau der Abstand, den die Referenz zwischen
    // ihren beiden Faechern haelt: gemessen traegt ihr unterer Faecher im
    // Fenster 950,300,250,200 Hoechstwerte von 147 bis 211 gegen die 233
    // bis 255 ihres oberen.
    // Gerechnet wird mit der Kamera der SCHATTIERUNG und nicht mit der der
    // Abbildung, siehe die Begruendung bei SCHAU. Die beiden Stuetzstellen
    // 0,78 und 0,44 sind an einer Fluchtung von 0,83 bis 1,26 eingestellt
    // und haetten mit der zurueckgesetzten Kamera nur noch einen Bruchteil
    // ihres Weges bekommen. Der Zahlenwert dieser Zeile ist gegen den Stand
    // vor der Kameraaenderung unveraendert.
    float schau = SCHAU / (SCHAU - q.z);
    float tiefe = clamp(0.30 + 0.70 * (schau - 0.78) / 0.44, 0.36, 1.0);

    // Der Grundfaktor stand auf 11,2 und ist auf 2,0 zurueck. Der Grund
    // ist allein der breitere Kern. Das Licht eines Kerns waechst mit dem
    // Quadrat seines Halbmessers, und der ist mit dem Teiler von 10,2 auf
    // 4,0 um den Faktor 2,55 gewachsen, das Licht je Punkt also um 6,5.
    // Zusammen mit den 12,5 Prozent mehr Punkten aus der neuen
    // Gitterteilung traegt das Fenster ohne Gegengewicht das 7,3-fache
    // Licht. Eingestellt ist der Wert gegen das absolute 99. Perzentil auf
    // der ECHTEN Seite, siehe den Bericht.
    // Der Ausklang des unteren Lappens, siehe FERN_VON weiter oben. Er
    // hat ZWEI Stufen, weil die Referenz zwei verschiedene Dinge tut.
    //
    // Die erste Stufe nimmt gleich unterhalb der Taille um gut vierzig
    // Prozent zurueck und haelt den Lappen dann flach. Ohne sie STIEG
    // unsere Bedeckung ueber die Zeilen 59 / 64 / 69 / 74 Prozent der
    // Bildhoehe von 38 ueber 53 und 60 auf 65, weil das Band nach unten
    // hin breiter wird und die Kippung es zugleich naeher an die Kamera
    // bringt. Die Referenz bleibt ueber dieselben Zeilen mit 30 / 34 /
    // 39 / 34 flach.
    //
    // Die zweite Stufe ist das eigentliche Verloeschen. Sie laeuft ueber
    // FERN_VON bis FERN_BIS und nimmt bis auf zwei Prozent zurueck, damit
    // das Bandende nicht mit einer sichtbaren Kante aufhoert, sondern im
    // Grund verschwindet. Bei der Referenz faellt die Bedeckung ueber die
    // Zeilen 79 / 84 / 89 von 21 ueber 4 auf 0.
    //
    // BEIDE STUFEN HAENGEN AM PLATZ IM FENSTER UND NICHT AN DER WELTLAGE.
    // Das ist die einzige Stelle des Umbaus, an der eine Entscheidung nach
    // dem BILD getroffen worden ist und nicht nach einer Rechnung, und
    // beide Fassungen sind dafuer gebaut und nebeneinander angesehen
    // worden.
    //
    // An der Weltlage haengend wandert das erloschene Bandende mit der
    // Struktur nach oben. Weil die Huelle dann periodisch sein musz, steht
    // je Periode eine dunkle Wanne im Gewebe, und die lief bei einem
    // Scrollweg von 857 Bildpunkten als 230 Bildpunkte breiter dunkler
    // Streifen quer durch die Bildmitte, mit dem naechsten Faecher darunter.
    // Das ist genau die Wiederholung, die nach Punkt vier des Auftrags
    // niemals auffallen darf.
    //
    // Am Platz im Fenster haengend bleibt das Verloeschen dort, wo es
    // hingehoert, naemlich am unteren Bildrand. Die Struktur wandert
    // dahinter durch, der Faecher fuellt beim Scrollen das ganze Bild und
    // loest sich nach unten im Grund auf. Genau das zeigt die Referenz in
    // _ref2/ref26/f030.png, wo die Taille oben aus dem Bild gewandert ist
    // und der untere Faecher bis an den unteren Rand traegt. Eine
    // Wiederholung kann so gar nicht sichtbar werden, denn es gibt im
    // Gewebe selbst nichts mehr, was sich wiederholte.
    //
    // Am ruhenden Bild aendert die Wahl NICHTS, denn bei ruhender Seite
    // sind Platz im Fenster und Weltlage dasselbe. Alle abgenommenen
    // Materialwerte bleiben deshalb unberuehrt.
    // Die Tiefe der zweiten Stufe stand auf 0,98 und steht jetzt bei 0,90.
    // Zusammen mit den weiter aufgezogenen Grenzen bleibt am unteren
    // Bildrand ein Rest von zehn Prozent stehen, und genau daran haengt der
    // Unterschied zwischen einer Aufloesung und einer Kante.
    // Beide Stufen greifen jetzt staerker. Die erste geht von 0,70 auf
    // 0,80, weil der untere Lappen auch nach der Tiefenabschwaechung noch
    // als eigener heller Koerper stand statt sich in den Grund zu legen.
    // Die zweite geht von 0,90 auf 0,96 und laeszt am unteren Bildrand
    // damit vier statt zehn Prozent stehen. Der Rest ist zu wenig, um als
    // Kante gelesen zu werden, und zu viel, um als Abbruch zu wirken;
    // genau daran haengt der Unterschied zwischen einem Verloeschen im
    // Raum und einer sichtbaren Auszenkontur.
    // DIE ZWEITE STUFE NIMMT WENIGER WEG UND LAEUFT LAENGER, und der
    // Anlasz ist eine ausdrueckliche Rueckmeldung des Auftraggebers. Die
    // Struktur soll bis 05 Referenzen reichen und erst dort aufhoeren;
    // gemessen endete unsere unterste Spur 363 Bildpunkte oberhalb der
    // Sektionsgrenze, und schon 1400 Bildpunkte frueher war sie auf ein
    // Viertel ihrer Staerke gefallen.
    //
    // Die Tiefe geht von 0,96 auf 0,85 und FERN_BIS von 0,30 auf 0,40.
    // Unterhalb von FERN_BIS bleiben damit 0,20 mal 0,15 gleich 0,030
    // statt 0,20 mal 0,04 gleich 0,008 stehen, also knapp das Vierfache.
    // FERN_VON bleibt bei 0,13, der Ausklang beginnt also an derselben
    // Stelle und laeuft nur weiter aus.
    //
    // Die Referenz maskiert ihre Struktur ueberhaupt nicht. Sie laeuft
    // durch und verlaeszt das Bild, weil sich der Koerper selbst
    // herausdreht. Wir koennen das nicht nachbauen, ohne die Lesbarkeit
    // der Textspalte zu verlieren, halten den Rest aber so hoch, dass am
    // unteren Bildrand ein Gewebe steht und keine Kante.
    //
    // DIE ERSTE STUFE GEHT VON 0,80 AUF 0,93, und der Anlasz ist der
    // Seitenfaktor weiter unten. Die erste Stufe und der Seitenfaktor
    // treffen naemlich dasselbe Material, denn das Vorzeichen von dp
    // wechselt an der Engstelle und der ganze untere Faecher liegt auf der
    // abgewandten Seite. Solange side bei 0,12 stand, trugen beide zusammen
    // 0,20 mal 0,12 gleich 2,4 Prozent, und die unterste Bildzeile lag mit
    // 0,9 bis 2,1 Prozent Bedeckung sogar UNTER der Vorgabe von zwei bis
    // fuenf Prozent. Mit side gleich 0,62 stieg sie auf 10,8 bis 14,1
    // Prozent und damit weit darueber.
    //
    // Die tiefere erste Stufe nimmt genau diesen Zuwachs wieder heraus. Sie
    // greift erst unterhalb von STUFE1_BIS voll, also rund 145 Bildpunkte
    // unter der Bildmitte, und laeszt die Kreuzung selbst samt der ersten
    // hundert Bildpunkte darunter unberuehrt; dort steht die zweite
    // Reihenschar, um die es in diesem Durchgang geht. Am unteren Bildrand
    // bleiben 0,07 mal 0,15 mal 0,62 gleich 0,65 Prozent stehen gegen die
    // 0,36 Prozent des Ausgangsstandes, das Bandende loest sich also
    // weiterhin auf, statt mit einer Kante aufzuhoeren.
    //
    // DIE ERSTE STUFE GEHT VON 0,93 AUF 0,845 ZURUECK, UND ZWAR NICHT FUER
    // SICH. Der Lichtverlauf zur Kreuzung hin, siehe hof weiter oben, greift
    // am unteren Bildrand mit seinem Bodenwert von 0,45, und beide Faktoren
    // treffen dort dasselbe Material. Ohne Ausgleich blieben von der
    // untersten Bildzeile 0,07 mal 0,45 gleich 0,0315 statt der 0,07 stehen,
    // und nachgemessen fiel ihre Bedeckung damit von 2,0 bis 2,6 auf 0,4 bis
    // 0,7 Prozent, also unter die Vorgabe von zwei bis fuenf Prozent. Mit
    // 0,845 stehen dort 0,155 mal 0,45 gleich 0,0698 und damit genau
    // soviel wie zuvor. Das Bandende loest sich also weiterhin auf, statt
    // mit einer Kante aufzuhoeren, und der Lichtverlauf wirkt sich auf den
    // unteren Abschlusz im Ergebnis nicht aus.
    //
    // DIE ERSTE STUFE SETZT SPAETER EIN UND LAEUFT LAENGER, siehe die
    // Begruendung bei STUFE1_VON. Verschoben wird die Strecke, ueber die sie
    // greift, und der untere Faecher bekommt damit sein Licht zurueck.
    //
    // Ihre Tiefe geht dabei von 0,845 auf 0,937, also der Rest am unteren
    // Bildrand von 0,155 auf 0,063. Das ist der Ausgleich fuer zwei andere
    // Aenderungen, die dasselbe Material treffen: der groeszere Hofanteil im
    // Fragment-Teil hellt das Gewebe ueberall um rund die Haelfte auf, und
    // der hoehere Seitenfaktor hebt den unteren Faecher noch einmal um ein
    // Drittel. Ohne Ausgleich stiege die Bedeckung der untersten Bildzeile
    // von 2,8 bis 5,4 auf ueber sieben Prozent und damit ueber die Vorgabe
    // von zwei bis sechs; nachgemessen ueber drei Scrollstaende und je drei
    // Zeilen lag sie mit 0,93 bei 2,9 bis 6,1 Prozent und damit am oberen
    // Rand. Die Strecke zwischen STUFE1_VON und STUFE1_BIS, auf der der
    // untere Faecher steht, aendert sich dadurch kaum, denn auf halber Stufe
    // fallen 0,578 auf 0,532.
    float ausklang = (1.0 - 0.937 * smoothstep(STUFE1_VON, STUFE1_BIS, platz))
                   * (1.0 - 0.85 * smoothstep(FERN_VON, FERN_BIS, platz));

    // Der Kantenfaktor stand auf 0,06 plus 0,94 mal facing und steht jetzt
    // auf 0,27 plus 0,73 mal facing. Er entscheidet darueber, wieviel
    // Licht das Band dort traegt, wo es dem Betrachter die Kante zudreht.
    //
    // Der Grund ist eine Ortsmessung der hellsten Bildpunkte. Teilt man
    // das Fenster 620,152,420,420 der Referenz in vier mal vier Felder und
    // fragt, wo ihre Bildpunkte zwischen dem 99. und dem 99,9. Perzentil
    // liegen, so sitzen 98 Prozent davon in den beiden mittleren Zeilen
    // und den beiden linken Spalten, also in einem breiten Keil rings um
    // die Engstelle. Bei uns waren es in denselben Feldern nur 58 Prozent,
    // der Rest verteilte sich ueber den oberen Lappen und den Bereich
    // unter der Taille.
    //
    // Die Zahlen dazu. Im Fenster 620,352,420,120 um die Engstelle liegt
    // die Referenz beim 99. Perzentil ueber ihrem Sockel bei 157,6 und
    // beim 99,5. bei 165,4, wir lagen bei 111,3 und 133,7. Der SPITZENWERT
    // stimmt dagegen ueberein, naemlich 221,0 gegen 219,8. Die Referenz
    // hat um ihre Engstelle also keinen helleren Kern als wir, sondern
    // einen viel BREITEREN Hof aus hellen Bildpunkten. Genau dort steht
    // das Band auf der Kante, dort laufen die Sprossen im Bild zusammen,
    // und genau dort hat der alte Faktor mit seinem Bodenwert von 0,06 am
    // haertesten gedaempft.
    //
    // Ein blosses Anheben des Grundfaktors kann das nicht leisten, und das
    // ist nachgerechnet. Das 99,9. Perzentil steht mit 225 bereits ueber
    // der Grenze von 220, jede gleichmaeszige Anhebung traegt es weiter
    // hinaus, und das 99. Perzentil muesste dafuer um mehr als die Haelfte
    // steigen. Es hilft nur, das Licht innerhalb des Bildes umzuverteilen,
    // und zwar aus den flach zugewandten Lappen in den Keil an der
    // Engstelle. Genau das leistet der hoehere Bodenwert: bei voll
    // zugewandtem Band bleibt der Faktor eins, bei einem facing von 0,3
    // steigt er von 0,342 auf 0,489 und bei 0,15 von 0,201 auf 0,380.
    // Die Engstelle selbst bleibt unveraendert, weil squeeze im selben
    // Zug von 0,58 auf 0,125 zurueckgeht.
    // Der Bildort wird JETZT SCHON gerechnet, obwohl er erst ganz unten
    // gebraucht wird. Der Grund ist der Saumfaktor unmittelbar darunter:
    // er haengt an der Spalte, in der ein Punkt im Bild landet, und muss
    // deshalb vor der Helligkeit bekannt sein.
    //
    // Waagerecht gespiegelt, damit das Band wie in der Referenz von
    // oben rechts nach unten links faellt.
    // Achsneigung in der Bildebene.
    float cl = cos(LEAN), sl = sin(LEAN);
    vec2 flat2 = vec2(-q.x, q.y);
    flat2 = vec2(flat2.x * cl - flat2.y * sl, flat2.x * sl + flat2.y * cl);
    // DIE FLUCHTUNG LAEUFT JETZT UM DIE BILDMITTE UND NICHT MEHR UM DIE
    // ACHSE DER STRUKTUR.
    //
    // Bisher stand hier uCenterPx plus flat2 mal persp mal uUnit. Das
    // entspricht einer Kamera, deren Blickachse mitten durch die Struktur
    // geht, und eine solche Kamera bildet einen Kreis um diese Achse immer
    // SYMMETRISCH ab. Nachgerechnet liegen die beiden Silhouetten eines
    // Kreises vom Halbmesser R dabei bei plus und minus CAM mal R geteilt
    // durch der Wurzel aus CAM zum Quadrat minus R zum Quadrat, also
    // spiegelbildlich zur Achse. Genau deshalb sah unsere Sanduhr flach
    // und mittig aus, egal wie klein CAM gesetzt wurde.
    //
    // Die Referenz macht es anders, und das ist an ihr abgemessen. Ihre
    // Engstelle sitzt bei 71 Prozent der Fensterbreite, die linke
    // Gewebekante am oberen Fensterrand bei 39 Prozent und die rechte
    // liegt jenseits des Fensterrandes. Die linke Haelfte misst damit
    // hoechstens 160 und die rechte mindestens 260 ihrer Bildpunkte. Eine
    // achsensymmetrische Abbildung kann dieses Verhaeltnis von 1,6 gar
    // nicht erzeugen; es entsteht allein daraus, dass die Struktur NEBEN
    // der Blickachse steht und ihre zugewandte Seite deshalb nach auszen
    // schwenkt.
    //
    // Die Rechnung dazu ist eine Zeile. Der Versatz der Struktur gegen die
    // Bildmitte wird wie jede andere Weltkoordinate mit der Fluchtung
    // multipliziert. Nahe Teile ruecken damit von der Bildmitte weg und
    // treten ueber den rechten Bildrand hinaus, ferne ruecken zur Mitte
    // hin. Die Engstelle selbst bleibt genau dort stehen, wo sie stand,
    // denn dort ist die Tiefe null und die Fluchtung damit eins.
    //
    // DIE BEIDEN SUMMANDEN BEKOMMEN SEIT DER KAMERAAENDERUNG VERSCHIEDENE
    // FLUCHTUNGEN. Der Formanteil flat2 mal uUnit traegt die raeumliche
    // Tiefe und bekommt die volle Fluchtung der nahen Kamera. Der feste
    // Achsversatz traegt dagegen die Unsymmetrie der Silhouette UND das
    // seitliche Schwanken; er bekommt nur den Anteil VERS_FL und behaelt
    // damit genau den Betrag, den er bei der abgenommenen Kamera von 30
    // hatte. Die vollstaendige Rechnung steht oben bei VERSATZ_FLUCHT.
    vec2 optik = uSize * 0.5;
    vec2 versatz = uCenterPx - optik;
    float perspV = 1.0 + (persp - 1.0) * VERS_FL;
    vec2 px = optik + flat2 * uUnit * persp + versatz * perspV;

    // DER SAUM UEBER DER TEXTSPALTE.
    //
    // Er ist die eine Groesze, die das Gewebe hinter der Schrift
    // erloeschen laeszt, und er haengt allein an der BILDLAGE.
    //
    // Der Anlasz ist gemessen. Bei Versatz 840 lag der hellste Grundpunkt
    // hinter allen sechs Zeilen der Leistungsstraenge zwischen 216 und 255
    // bei einer Streuung von 26 bis 46 Stufen, waehrend die Schrift selbst
    // nur 168 bis 179 Stufen erreicht. In sechs von sechs Zeilen war der
    // Grund also HELLER als die Schrift, das Auge las die Punkte als
    // Vordergrund und die Buchstaben als Untergrund.
    //
    // Die waagerechte Maske allein kann das nicht leisten, und das ist
    // zweimal teuer nachgewiesen. Sie deckt eine ganze Spalte gleich
    // stark ab, die Textspalte laeuft aber von 50,7 bis 74 Prozent der
    // Breite und damit bis an die Achse des Gewebes heran. Wer die Maske
    // so weit nach rechts zieht, dass sie dort noch traegt, loescht
    // zugleich die linke Flanke des Faechers und halbiert die Sanduhr.
    // Genau dieser Zwischenstand ist einmal gebaut und verworfen worden,
    // siehe den Kommentar bei der Maske in marketing.module.css.
    //
    // Der Saum greift stattdessen im Shader an und wirkt deshalb auf die
    // EINZELNEN PUNKTE statt auf eine fertige Flaeche. Das ist der
    // entscheidende Unterschied: die Maske nimmt am Ende Deckkraft weg
    // und laeszt einen zu Weisz geklemmten Punkt hell, waehrend der
    // Saumfaktor die Helligkeit VOR der Begrenzung nimmt und einen
    // ausgebrannten Punkt damit wieder in den geregelten Bereich holt.
    // Die Maske darf im Gegenzug links wieder mehr durchlassen, sodass die
    // Flanke des Faechers stehenbleibt.
    //
    // Die beiden Stuetzstellen haengen an der ACHSE und nicht an festen
    // Anteilen der Breite. Auf breiten Schirmen steht die Achse bei 74
    // Prozent, auf einem Telefon bei 86, und der Saum wandert damit von
    // selbst mit. Sonst muesste er in der Medienabfrage ein zweites Mal
    // eingestellt werden und liefe irgendwann auseinander.
    //
    // Der Bodenwert steht bei 0,138 und die obere Stuetzstelle bei der
    // Achse plus zehn Prozent der Breite. Beide Zahlen haengen am
    // Grundfaktor weiter unten fest, denn was ueber der Textspalte ankommt,
    // ist das PRODUKT der beiden, naemlich 0,138 mal 2,72 gleich 0,375.
    // Wer den einen Wert anfasst, musz den anderen im Kehrwert mitziehen.
    //
    // Der Grund fuer diese Kopplung ist ein Zielkonflikt. Das obere
    // Perzentil des Gewebes gehoert im kanonischen Fenster auf 168 bis 175
    // und sasz nach dem ersten Ansatz des Saums bei 148. Eine blosze
    // Anhebung des Grundfaktors haette es zurueckgeholt und dabei das
    // Gewebe ueber der Schrift im selben Verhaeltnis wieder aufgehellt.
    // Ueber das Paar aus Bodenwert und Grundfaktor laeuft die Anhebung
    // dagegen NUR rechts der Achse, und genau dort sitzt das obere
    // Perzentil.
    // Der Bodenwert steht jetzt bei 0,1172 statt bei 0,138, und er ist
    // NICHT fuer sich geaendert worden. Der Grundfaktor weiter unten geht
    // im selben Zug von 2,72 auf 3,20, das Produkt bleibt also mit 0,375
    // genau dort, wo es seit der Lesbarkeitsrunde steht. Ueber der
    // Textspalte kommt damit unveraendert dasselbe Licht an.
    float achse = uCenterPx.x / uSize.x;
    // Der Bodenwert steht jetzt bei 0,1056 statt bei 0,1172, und er ist
    // wieder NICHT fuer sich geaendert worden. Der Grundfaktor weiter unten
    // geht im selben Zug von 3,20 auf 3,55, das Produkt bleibt also mit
    // 0,375 genau dort, wo es seit der Lesbarkeitsrunde steht.
    // Der Bodenwert geht von 0,1056 auf 0,0836, und er wird zum vierten Mal
    // im Kehrwert des Grundfaktors gefuehrt. Dieser steigt im selben Zug von
    // 1,9 auf 2,4, das Produkt bleibt also mit 0,2006 unveraendert und ueber
    // der Textspalte kommt dasselbe Licht an wie zuvor. Auf die Engstelle
    // wirkt sich der niedrigere Bodenwert kaum aus, denn sie liegt bei 72
    // Prozent der Breite und damit schon weit im ansteigenden Ast der
    // Stufe; nachgerechnet faellt der Saum dort von 0,648 auf 0,640,
    // waehrend der Grundfaktor um ein Viertel zulegt.
    // Der Bodenwert steht am Ende bei 0,1000 und ist damit das erste Mal
    // NICHT im Kehrwert des Grundfaktors gefuehrt worden. Zusammen mit dem
    // Grundfaktor 2,3 traegt die Textspalte jetzt 0,230 statt der 0,2006,
    // die seit der Lesbarkeitsrunde galten, also fuenfzehn Prozent mehr
    // Licht. Der Spielraum dafuer ist gemessen: hinter den Textzeilen der
    // Leistungsstraenge lag der Grundhoechstwert bei 30 bis 43 und die
    // Streuung bei 0,4 bis 1,6, waehrend die Vorgabe 120 und 3,0 lautet.
    //
    // Gebraucht wird er im Fenster 900,60,500,700, dessen linkes Drittel
    // links der Stufe liegt und dort nur ein Fuenftel bis die Haelfte des
    // Lichtes trug. Genau dieses Drittel ist der Grund, aus dem unser 50.
    // Perzentil hinter dem der Referenz zurueckblieb.
    // Der Bodenwert geht von 0,1000 auf 0,0640 zurueck, und er wird damit
    // wieder im Kehrwert der beiden Faktoren gefuehrt, die in diesem
    // Durchgang gestiegen sind. Der Grundfaktor weiter unten legt von 1,50
    // auf 1,70 zu und der Hofanteil im Fragment-Teil hebt das mittlere Licht
    // eines Punktes um das 1,38-fache; zusammen kommt links der Achse das
    // 1,57-fache an. Der niedrigere Bodenwert nimmt genau diesen Zuwachs
    // wieder heraus, denn 0,1000 geteilt durch 1,57 ist 0,0637.
    //
    // Auf die Kreuzung und ihren Hof wirkt sich das kaum aus, und das ist
    // nachgerechnet. Die Kreuzung steht bei 73 Prozent der Breite, ein Ring
    // von 55 Bildpunkten Halbmesser um sie reicht von 70 bis 77 Prozent, und
    // dort liegt der Saum schon im ansteigenden Ast der Stufe: an seinem
    // linken Rand faellt er von 0,532 auf 0,505 und an seinem rechten von
    // 0,855 auf 0,849.
    float saum = mix(0.0640, 1.0,
      smoothstep(achse - 0.18, achse + 0.10, px.x / uSize.x));

    // Der Kantenfaktor geht ein zweites Mal hoch, von 0,27 auf 0,48. Sein
    // Bodenwert und sein Ausschlag ergaenzen sich weiterhin zu eins, bei
    // voll zugewandtem Band aendert sich also nichts; heller wird allein
    // der Uebergang, wo das Band sich dem Betrachter zudreht, und das ist
    // genau der Keil um die Engstelle. Der Anlasz ist eine
    // Ortsmessung des Lichtes. Im oberen Lappen lagen 9,4 Prozent der
    // Bildpunkte ueber dem Sockel plus siebzig, die Referenz haelt dort
    // 2,6 Prozent, und ihr Hoechstwert steht bei 212 gegen unsere 245.
    // Am Hof um die Engstelle war es umgekehrt: dort liegt ihr 99.
    // Perzentil ueber dem Sockel bei 157,6 und unseres bei 127,3.
    // Wir tragen also zu viel Licht in den flach zugewandten Lappen und zu
    // wenig in dem Keil, in dem das Band auf der Kante steht.
    //
    // Genau dieses ueberschuessige Licht in den Lappen ist zugleich die
    // zweite Wurzel des Lesbarkeitsmangels, denn beim Scrollen faellt der
    // obere Lappen auf die Textspalte. Die beiden Maengel haben dieselbe
    // Ursache und werden deshalb mit demselben Griff behandelt.
    // Der Grundfaktor steht auf 3,20 statt auf 2,72, und der Grund ist
    // allein die neue, enge Verteilung der Einzelhelligkeit. Ihr
    // MITTELWERT ist mit 0,98 unveraendert, ihr HOECHSTWERT aber von 3,05
    // auf 1,36 gefallen. Das obere Perzentil des Fensters hing zu einem
    // guten Teil an den wenigen sehr hell gewuerfelten Einzelpunkten und
    // fiel deshalb von 169,2 auf 146,7, waehrend Bedeckung und Mittelfeld
    // unveraendert blieben. Der Grundfaktor holt es zurueck, und weil er
    // gleichmaeszig wirkt, verschiebt er die Verteilung als Ganzes statt
    // wieder einzelne Punkte herauszureiszen.
    //
    // Der Saumfaktor weiter oben geht im Kehrwert mit, siehe den Kommentar
    // dort und Punkt 8 des Bestandsschutzes.
    // DER KANTENFAKTOR GEHT AUF 0,20 ZURUECK, und diesmal ist der Anlasz
    // die neue Flaeche und nicht mehr eine Umverteilung des Lichtes.
    //
    // Beim Hyperboloid ist die Silhouette eine lange, ueber die ganze
    // Bildhoehe durchlaufende Kante, an der die Flaeche dem Betrachter
    // buchstaeblich auf der Schneide steht. Die abgebildete Flaeche eines
    // Rasterfeldes geht dort mit facing gegen null, das Licht je Bildpunkt
    // waechst also mit dessen Kehrwert. Ein Bodenwert von 0,48 laeszt davon
    // bei einem facing von 0,1 noch das 4,8-fache stehen, und genau das war
    // im Bild als weisz ausgebrannter Saum laengs der ganzen linken Kante zu
    // sehen. Gemessen stieg der Weiszanteil der leuchtenden Punkte dadurch
    // auf 6,3 Prozent gegen 1,1 der Referenz und das 99,9. Perzentil auf
    // 252,2 gegen 218,5.
    //
    // Mit 0,20 bleibt bei einem facing von 0,1 noch das 2,6-fache stehen.
    // Die Kante bleibt damit die hellste Stelle des Faechers, so wie bei der
    // Referenz, brennt aber nicht mehr aus.
    vLit  = aGain * side * squeeze * tiefe * ausklang * reliefGain
          // Der Grundfaktor stand auf 3,55. Nach dem Umbau auf die verdrehte
          // Ebene und dem groeszeren Maszstab verteilt sich dieselbe
          // Lichtmenge auf mehr Bildflaeche; gemessen fiel das 99. Perzentil
          // im Fenster (620,100,420,420) auf 62, waehrend die Referenz im
          // deckungsgleichen Fenster bei 170 liegt. Der Faktor 2,74 holt
          // genau diesen Abstand auf.
          //
          // Der Grundfaktor faellt von 13,6 auf 6,0, und die alte Vorgabe,
          // das 99. Perzentil im Fenster 620,100,420,420 auf 172 zu ziehen,
          // ist damit ausdruecklich aufgehoben. Sie stammte von einem
          // Referenzbild, bei dem die Kreuzung mitten im Meszfenster lag,
          // also an der hellsten Stelle der ganzen Struktur, und war fuer
          // den Gesamteindruck nicht vertretend.
          //
          // Nachgemessen an v012 der frischen Aufnahme, im selben Fenster
          // und auf Referenzmaszstab, traegt die Referenz p50 gleich 1,9 /
          // p75 gleich 3,9 / p90 gleich 11,1 / p95 gleich 25,5 / p99 gleich
          // 96,7 ueber ihrem Sockel, waehrend wir bei 8,9 / 20,2 / 37,0 /
          // 79,4 / 167,1 standen. Im Mittelfeld trugen wir also das Vier-
          // bis Fuenffache ihres Lichtes. Die Struktur der Referenz ist
          // ueberwiegend erloschen und traegt ihr Licht in wenigen Punkten,
          // und genau das ist gemeint, wenn sie aus der Dunkelheit heraus
          // entsteht statt ueberall zu leuchten.
          //
          // Der Faktor 6,0 ist aus dem Lichthaushalt gerechnet und nicht
          // geraten. Das Licht eines Kerns waechst mit dem Quadrat seines
          // Halbmessers, und der faellt von 2,5 auf 1,4 Bildpunkte, also
          // auf 0,31. Die Punktzahl steigt zugleich auf das 1,78-fache.
          // Beides zusammen laeszt 0,55 des alten Lichtes stehen, und der
          // Faktor 6,0 gegen 13,6 nimmt davon weitere 0,44, sodass im
          // Mittelfeld rund ein Viertel uebrigbleibt.
          //
          // Der Grundfaktor faellt ein zweites Mal, von 6,0 auf 4,2. Der
          // Grund ist die dichtere Gitterteilung: 60 000 statt 38 400
          // Punkte tragen das 1,56-fache Licht, waehrend die kleinere
          // Scheibe mit einem Kernhalbmesser von 1,2 statt 1,4
          // Bildpunkten davon nur 0,73 zuruecknimmt. Ohne Gegengewicht
          // stuende das Gewebe damit um 15 Prozent heller als im ersten
          // Durchgang, und die schiefere Verteilung des Wuerfels legte
          // oben noch einmal zu. Gemessen lag das 99. Perzentil im Fenster
          // 620,100,420,420 bei 132,7 gegen die 96,7 der Referenz, und der
          // Faktor 0,70 holt genau diesen Abstand zurueck.
          //
          // Der Grundfaktor steigt von 4,2 auf 5,0, und diesmal geht er
          // ausnahmsweise HOCH. Er gleicht aus, was die steilere
          // Kernflanke an Licht genommen hat, und zwar an den Spitzen, wo
          // es gebraucht wird. Am Modell des ruhigen dichten Feldes traegt
          // die Kombination aus Potenz 2,9, dem neuen Wuerfel und diesem
          // Faktor p50 gleich 2,6 / p75 gleich 5,7 / p90 gleich 15,9 /
          // p95 gleich 30,1 bei einer leuchtenden Flaeche von 12,6
          // Prozent, waehrend die heutigen Einstellungen dort bei 3,8 /
          // 10,6 / 24,1 / 34,5 und 22,3 Prozent stehen.
          //
          // Nach der Nachmessung steht er bei 4,8 statt bei 5,0. Er geht
          // ein kleines Stueck zurueck, weil die schiefere Streuung der
          // Einzelhelligkeit das obere Ende der Leiter von sich aus
          // anhebt und der Faktor sonst die leuchtende Flaeche wieder
          // ueber die Vorgabe truebe.
          //
          // Im dritten Durchgang steht er bei 4,4. Der weitere Kern
          // traegt bei gleicher Spitze mehr Licht, und der Faktor nimmt
          // genau diesen Zuwachs wieder zurueck, damit die leuchtende
          // Flaeche in der Vorgabe von 9 bis 13 Prozent bleibt.
          //
          // Der Grundfaktor faellt von 4,4 auf 2,3, und der Anlasz ist die
          // Umkehr der Gitterteilung zusammen mit dem breiteren Kern. Die
          // Punktzahl faellt zwar von 60 000 auf 12 060, das Licht eines
          // einzelnen Punktes waechst mit der Kernflaeche aber um mehr als
          // das Vierfache, sodass das Fenster ohne Gegengewicht heller
          // stuende als vorher. Gemessen lag das 99,9. Perzentil im Fenster
          // 1050,160,180,180 bei 225 gegen die 157 der Referenz und das
          // 99. bei 159 gegen 132, beides bei einem Sockel von 38.
          //
          // Der Weg dorthin ist zweimal ueberschritten worden. Mit 0,55
          // fiel das 99,9. Perzentil auf 70 und die ganze Struktur stand
          // zu dunkel, weil der flache Wuerfel den mittleren Punkt zugleich
          // um das Sechsfache aufgehellt und die Spitzen um das Fuenffache
          // gesenkt hatte. Der Faktor steht am Ende bei 1,9.
          //
          // Gemessen traegt das Fenster damit einen Sockel von 40,5, ein
          // 99. Perzentil von 120 gegen die 132 der Referenz und ein 99,9.
          // von 155 gegen 157. Der Ausgangsstand lag dort bei 148 und 190.
          //
          // Der Grundfaktor steigt von 1,9 auf 2,4, und der Anlasz ist die
          // Perzentilleiter im Fenster 900,60,500,700, jeweils ueber dem
          // eigenen Sockel gerechnet. Die Referenz traegt dort p50 gleich
          // 7,1 / p75 gleich 21,9 / p90 gleich 37,7 / p99 gleich 120,3 /
          // p99,9 gleich 195,8, wir standen bei 4,2 / 10,4 / 20,8 / rund 79
          // / rund 140. Vom Mittelfeld aufwaerts fehlte durchgehend das
          // Anderthalb- bis Zweifache, und im Bild lag die Struktur nur noch
          // als sehr schwacher Schleier in der rechten Bildhaelfte.
          //
          // Der Faktor traegt die Spitzen, der Hofanteil im Fragment-Teil
          // traegt das Mittelfeld. Beide sind zusammen eingestellt, weil der
          // Schleier am Produkt aus beiden haengt. Der Saumfaktor weiter oben
          // geht im Kehrwert mit, damit ueber der Textspalte nichts heller
          // wird.
          //
          // Nach der ersten Messung geht er von 2,4 auf 2,3 zurueck. Mit 2,4
          // trafen das 90. und das 99. Perzentil im Fenster 900,60,500,700
          // mit 36,9 gegen 37,7 und 120,1 gegen 120,3 bereits genau, und der
          // hoehere Hofanteil sowie der hoehere Bodenwert des Saums legen
          // beide noch einmal zu. Der kleine Rueckgang haelt das obere Ende
          // der Leiter dort, wo es schon sasz.
          //
          // Er steht am Ende bei 1,75. Die Zahl darf nicht fuer sich gelesen
          // werden, denn sie ist nur der eine von zwei Faktoren, die das
          // Licht eines Punktes tragen. Der andere ist der Hofanteil im
          // Fragment-Teil, und der ist im selben Durchgang von 0,24 auf 0,62
          // gestiegen. Gegen den Ausgangsstand traegt ein Punktgipfel damit
          // das 1,21-fache und der Schleier zwischen den Punkten das
          // 3,8-fache; die Struktur ist also deutlich heller geworden,
          // obwohl der Grundfaktor kleiner aussieht als zuvor.
          //
          // Er steht endgueltig bei 1,50. Der Anlasz ist eine Nachmessung der
          // REFERENZ ueber alle zwoelf Ruhebilder statt nur ueber das erste.
          // Ihre Leiter im Fenster 900,60,500,700 schwankt naemlich
          // betraechtlich, sie laeuft ueber p50 gleich 4,9 bis 7,1 / p75
          // gleich 15,1 bis 21,9 / p90 gleich 37,7 bis 42,9 / p99 gleich
          // 120,3 bis 147,9 / p99,9 gleich 191,9 bis 203,4. Mit 1,75 lagen
          // wir bei 6,6 / 26,2 / 61,4 / 161,1 / 212,5 und damit im
          // Mittelfeld deutlich ueber dem gesamten Band der Referenz.
          //
          // DER GRUNDFAKTOR GEHT VON 1,50 AUF 1,70 UND DER BODENWERT DES
          // KANTENFAKTORS IM SELBEN ZUG VON 0,20 AUF 0,16. Die beiden Zahlen
          // gehoeren zusammen und duerfen nicht einzeln gelesen werden, denn
          // was sie miteinander tun, ist ueberwiegend keine Aufhellung,
          // sondern eine UMVERTEILUNG des Lichtes von der Kreuzung in ihren
          // Hof.
          //
          // Die Rechnung dahinter ist der Ausgleich der Verkuerzung. Steht
          // das Band dem Betrachter fast auf der Kante, so faellt die
          // abgebildete Flaeche eines Rasterfeldes mit facing, die Zahl der
          // Punkte je Bildpunkt waechst also mit dem Kehrwert von facing. Ein
          // Kantenfaktor, der selbst linear in facing ist, haelt das Produkt
          // aus beiden konstant; sein BODENWERT ist genau der Anteil der
          // Haeufung, der ungeglichen durchkommt. Mit 0,20 kam an der
          // Kreuzung, wo facing bei 0,02 liegt, das Zehnfache der Umgebung an,
          // und die Kreuzung stand deshalb als harte helle Kante da, waehrend
          // ihr Hof leer blieb.
          //
          // Gemessen an a3000 mit _ref2/mess/kreuzung.mjs traegt die Referenz
          // um ihre Kreuzung die Ringmittel 154,5 / 113,4 / 81,3 / 49,3 / 26,0
          // / 11,5 bei den Halbmessern 6, 16, 30, 55, 100 und 190. Wir standen
          // nach der Ruecknahme des Lichtverlaufs bei 183 / 95 / 60 / 38 / 16
          // / 9, hatten also einen zu hellen Kern und einen zu duennen Hof.
          //
          // Der Weg dorthin ist einmal ueberschritten worden. Mit einem
          // Bodenwert von 0,08 und einem Grundfaktor von 2,85 lagen die
          // Ringmittel zwar richtig, die Fensterstreuung im Faecher stieg
          // dabei aber von 12,8 auf 48,5 gegen die 13,2 der Referenz, und die
          // unterste Bildzeile trug 11 statt 5 Prozent Bedeckung. Der Stand
          // hier haelt die Umverteilung fest und laeszt die Gesamtmenge fast
          // stehen; das fehlende Mittelfeld traegt stattdessen der groeszere
          // Hofanteil im Fragment-Teil, denn der hebt das MITTEL eines
          // Punktes staerker als seinen Gipfel und trifft damit genau die
          // Groesze, um die es geht.
          //
          // Der Saumfaktor weiter oben geht NICHT im Kehrwert mit, denn er
          // schuetzt die Textspalte gegen den ABSOLUTEN Grundhoechstwert, und
          // der lag zuletzt bei 29 bis 32 gegen eine Vorgabe von 120.
          //
          // DER GRUNDFAKTOR GEHT VON 1,70 AUF 1,60 UND GEHOERT ZUR
          // AUSDUENNUNG DES RASTERS. Er ist aus dem Lichthaushalt
          // gerechnet und danach nachgemessen. Die Punktzahl faellt von
          // 15 759 auf 11 748 je Periode, also auf 0,745, waehrend die
          // Halbwertsbreite eines Punktes von 2,9 auf 3,5 Bildpunkte
          // steigt und sein Licht mit dem Quadrat davon auf das
          // 1,457-fache waechst. Das Produkt der beiden steht bei 1,086,
          // ohne Gegengewicht stuende das Gewebe also gut acht Prozent
          // heller als zuvor, und der Faktor nimmt genau diesen Zuwachs
          // zurueck.
          //
          // DER GRUNDFAKTOR GEHT VON 1,60 AUF 1,30, weil der Auftraggeber
          // beanstandet hat, unsere Punkte leuchteten staerker als die der
          // Referenz. Die Beanstandung ist nachgemessen, und zwar in einem
          // Fenster von 170 mal 170 Bildpunkten, das 300 Bildpunkte ueber
          // der Kreuzung und 30 rechts von ihr mitwandert. Ein ortsfestes
          // Fenster taugt fuer diesen Vergleich nicht, denn die Kreuzung
          // wandert beim Scrollen durch das Bild, und dieselbe Referenz
          // liegt je nachdem, ob die Kreuzung im Fenster steht, einmal bei
          // tausend und einmal bei sechstausend hellen Bildpunkten.
          //
          // Ueber ihrem eigenen Sockel gemessen trug die Referenz in den
          // Bildern, in denen ihre Kreuzung wie bei uns zwischen 45 und 68
          // Prozent der Bildhoehe steht, p50 gleich 32 / p75 gleich 57 /
          // p90 gleich 97 / p99 gleich 189 und 3900 Bildpunkte oberhalb von
          // 150. Wir standen bei 45 / 95 / 140 / 207 und 6108, trugen im
          // Mittelfeld also das 1,4- bis 1,7-fache ihres Lichtes und an der
          // Spitze noch das 1,1-fache.
          //
          // Der Faktor traegt davon nur einen Teil. Die neue Tonleiter im
          // Fragment-Teil senkt die mittlere Leuchtdichte eines Punktes von
          // sich aus auf das 0,831-fache, weil drei der vier Toene nicht
          // mehr auf vollem Blaukanal stehen. Beide zusammen lassen 0,675
          // des bisherigen Lichtes stehen und treffen damit die Mitte des
          // gemessenen Abstandes.
          //
          // DER GRUNDFAKTOR GEHT VON 1,30 AUF 1,16, WEIL DIE STRUKTUR IN
          // DEN HINTERGRUND TRETEN SOLL. Der Auftraggeber hat beanstandet,
          // sie stehe im Mittelpunkt, waehrend dort der Inhalt stehen
          // soll, und hat die Referenz als deutlich dezenter bezeichnet.
          //
          // Der Befund ist nachgemessen, und zwar im Fenster
          // 900,60,500,780, das bei beiden Seiten dieselbe Bildstelle
          // trifft und die Kreuzung enthaelt. Auf der Oberkante der Sektion
          // trugen wir dort 27,4 Prozent leuchtende Flaeche gegen die 28,3
          // bis 35,4 Prozent der Referenz und lagen damit sogar darunter.
          // In der FLACHEN PHASE, also bei einem Versatz von 2400 bis 3200
          // Bildpunkten, stiegen wir dagegen auf 42,2 bis 42,4 Prozent,
          // waehrend die Referenz ueber alle ihre Ruhebilder zwischen 28
          // und 35 Prozent bleibt. Die Leiter zeigt dasselbe Bild. Dort lag
          // unser p50 bei 9,0 gegen ihre 4,8 bis 6,1 und unser p75 bei 23,3
          // gegen ihre 14,7 bis 20,2, waehrend die Spitze mit p99 gleich
          // 112,7 gegen ihre 115 bis 143 zurueckblieb.
          //
          // Zu viel traegt also nicht die Spitze, sondern das MITTELFELD in
          // der flachen Phase, und der Griff ist deshalb doppelt gefuehrt.
          // Der Grundfaktor hier nimmt alles gleichmaeszig um ein Neuntel
          // zurueck, und der Hofanteil im Fragment-Teil geht von 0,90 auf
          // 0,68 und trifft damit den Schleier zwischen den Punkten. Beide
          // zusammen lassen vom Gipfel eines Punktes 0,79 stehen und vom
          // Schleier nur 0,67.
          //
          // Weiter herunter darf es nicht. Der Auftraggeber hat vor einigen
          // Runden einen zu blassen Stand beanstandet, und dessen Leiter lag
          // im Fenster 900,60,500,700 bei p50 gleich 4,2 und p75 gleich
          // 10,4; die Untergrenze ist damit gemessen und nicht geschaetzt.
          // DER GRUNDFAKTOR GEHT VON 1,16 AUF 1,42 UND FAENGT AUF, WAS DIE
          // AUSDUENNUNG UND DER ENGERE HOF AN LICHT GENOMMEN HABEN. Die
          // Punktzahl faellt mit N_U und N_S auf 0,747 und das Gesamtlicht
          // des Hofes ueber seine Potenz von 0,214 auf 0,141; beides
          // zusammen nimmt der Flaeche mehr Licht, als der Auftrag will,
          // denn er verlangt schaerfere Punkte und keine dunklere Sektion.
          //
          // Der Faktor ist mit Bedacht der Hebel und nicht der Hof. Er
          // hebt Gipfel und Mittelfeld gleichmaeszig, waehrend der Hof das
          // Mittelfeld staerker hebt als den Gipfel; nur so bleibt das
          // Licht erhalten, ohne die Unschaerfe zurueckzuholen.
          //
          // Nach oben deckelt ihn der Blaukanal. Alle gesetzten Toene sind
          // blau bis violett, und sobald die additive Summe dort die Eins
          // erreicht, heben weitere Beitraege nur noch Rot und Gruen und
          // der Farbton wandert ins Gelbe. Im Ausgangsstand standen 0,15
          // Prozent der Bildpunkte an dieser Grenze und keiner davon war
          // gelb; nachgemessen mit _ref2/farbe2.mjs steht der Endstand bei
          // 0,05 Prozent und ebenfalls ohne einen einzigen gelben Punkt.
          //
          // DER GRUNDFAKTOR GEHT VON 1,42 AUF 2,38, UND ER TUT ES NICHT FUER
          // SICH ALLEIN. Er gehoert zu HOF_BODEN, der im selben Zug von 0,90
          // auf 0,38 faellt, und nur das PRODUKT der beiden ist die Groesze,
          // die man an der flachen Phase misst. Es geht von 1,278 auf 0,904
          // zurueck und holt damit den Anteil leuchtender Flaeche ein, den der
          // kleinere Maszstab aus Punkt eins hatte anwachsen lassen. An der
          // Kreuzung dagegen steht hof auf eins, dort wirkt der Faktor
          // ungedaempft und die Kreuzung wird um das 1,68-fache heller. Die
          // vollstaendige Rechnung steht bei HOF_BODEN.
          //
          // Der Deckel des Blaukanals traegt diesen Schritt, und zwar weil
          // der Zuwachs allein die Umgebung der Kreuzung betrifft. Dort
          // begrenzt der farbtonerhaltende Weichanschlag im Fragment-Teil die
          // Spitzen und laeszt sie nach Weisz ausbleichen statt ins Gelbe
          // wandern; die Begruendung steht dort. In der flachen Phase, wo die
          // meisten Bildpunkte liegen, faellt das Licht sogar, der Anteil an
          // der Grenze kann dort also gar nicht wachsen.
          //
          // Der Faktor geht im zweiten Zug von 2,38 auf 2,75, und HOF_BODEN
          // faellt dabei von 0,38 auf 0,329. Das Produkt bleibt mit 0,904
          // genau stehen, die flache Phase aendert sich also wieder um
          // nichts, waehrend der Ring um die Kreuzung noch einmal zulegt. Die
          // Begruendung samt Rechnung steht bei HOF_BODEN.
          //
          // Der Faktor geht von 2,75 auf 4,20, und der Anlasz sind die
          // groeszeren und schaerferen Punkte. Die Punktzahl faellt mit N_U
          // gleich 84 und N_S gleich 56 auf das 0,536-fache, und das Licht je
          // Punkt faellt auf das 0,50-fache, denn der Hof gibt ueber die
          // steilere Potenz und den kleineren Anteil mehr ab, als der
          // groeszere Kern zurueckholt. Beides zusammen ergibt 0,268, der
          // Ausgleich waere also 3,73. So weit geht der Faktor NICHT, denn der
          // Anteil leuchtender Flaeche haengt nicht am Gesamtlicht, sondern
          // daran, wieviel Flaeche ueber der Schwelle liegt, und die traegt
          // jetzt der Kern. Sein Halbmesser waechst von 2,86 auf 3,87
          // Bildpunkte, seine Flaeche also auf das 1,83-fache, was die
          // kleinere Punktzahl fast ausgleicht. Der Wert 4,20 ist ein erster
          // Ansatz und am Anteil leuchtender Flaeche nachzumessen.
          //
          // NACHGEMESSEN WAR ER ZU KLEIN UND ZUGLEICH AM FALSCHEN HEBEL. Mit
          // 4,20 und der alten Kernspitze trug das Fenster 1080,200,300,300
          // nur 9,6 bis 10,0 Prozent leuchtender Flaeche, waehrend dieselbe
          // Messung an der Referenz 15,7 bis 24,8 Prozent liefert. Der Kern
          // ist deshalb auf eine Scheibe mit weicher Kante umgestellt worden,
          // die ihre Flaeche wirklich traegt; die Rechnung steht dort. Der
          // Faktor geht im selben Zug auf 5,30, damit der Gipfel eines Punktes
          // bei rund 110 Stufen ueber dem Sockel bleibt, also dort, wo er vor
          // dieser Runde stand.
          //
          // Der Faktor geht von 5,30 auf 3,90 zurueck, und der Anlasz ist der
          // Blaukanal. Mit 5,30 standen 2,50 Prozent der Bildpunkte des
          // Fensters 1050,160,300,300 an seiner Grenze gegen 0,02 Prozent im
          // abgenommenen Stand, und 214 davon trugen Rot oder Gruen ueber 200.
          // Der Anteil leuchtender Flaeche leidet darunter nicht, und das ist
          // der Verdienst des scheibenfoermigen Kerns. Sein Rand faellt so
          // steil, dass die Stelle, an der ein Punkt die Schwelle von zwoelf
          // Stufen unterschreitet, sich zwischen den beiden Faktoren nur von
          // 0,475 auf 0,468 des Scheibenhalbmessers verschiebt. Bei einer
          // Spitze waere derselbe Schritt unmittelbar auf die Flaeche
          // durchgeschlagen.
          // DER BODENWERT DER KANTENDAEMPFUNG GEHT VON 0,16 AUF 0,34, UND
          // DAMIT KOMMT DER HELLE SAUM AN DER SILHOUETTE ZURUECK.
          //
          // Der Faktor gleicht die Dichte aus, mit der die Querpunkte einer
          // Sprosse im Bild zusammenfallen, wenn das Band auf der Kante
          // steht. Diese Dichte waechst mit eins durch facing, der Ausgleich
          // musz deshalb fast linear in facing sein; die Herleitung steht
          // oben bei der Kantenlage.
          //
          // SEINE EICHUNG IST DURCH DIESE RUNDE ABGELAUFEN. Sie ist
          // ausdruecklich an den 112 QUERPUNKTEN EINER SPROSSE gerechnet, so
          // steht es dort woertlich. N_S liegt seit dieser Runde bei 36, die
          // Haeufung an der Kante ist also nur noch gut ein Drittel so
          // stark, waehrend die Daempfung unveraendert dagegenhielt. Wir
          // haben den hellen Saum damit selbst geloescht.
          //
          // AN DER REFERENZ IST ER DAS TRAGENDE MERKMAL DES RAEUMLICHEN
          // EINDRUCKS. In _ref2/ref-nah/n044.jpg und n068.jpg laeuft an der
          // Stelle, an der die Flaeche sich wegdreht, ein scharfer heller
          // Bogen, hinter dem unmittelbar der leere Grund steht; erst dieser
          // Bogen macht aus der Flaeche einen Koerper mit Vorder- und
          // Rueckseite. Bei uns lief das Gewebe dort stattdessen aus.
          //
          // Der neue Wert hebt genau die Kantenlage und laeszt die
          // zugewandte Flaeche unberuehrt, denn bei facing gleich eins steht
          // der Faktor in beiden Faellen auf eins. Bei facing gleich 0,1
          // steigt er von 0,244 auf 0,406 und damit auf das 1,66-fache, bei
          // 0,5 von 0,58 auf 0,67 und damit nur noch auf das 1,16-fache.
          //
          // Die Grenze nach oben ist das Klemmen, an dem die alte Eichung
          // gescheitert war. Dort stand das 99,9. Perzentil bei 240 und der
          // Hoechstwert bei 242 ueber dem Sockel gegen 186 und 222 der
          // Referenz. Vor diesem Schritt lagen wir bei 187 bis 210 und 206
          // bis 212, es ist also Luft, aber nicht viel; der Wert ist am
          // Klemmen nachzumessen und nicht weiter zu treiben.
          * jacobi * saum * 3.90 * hof
          * (0.34 + 0.66 * facing);
    vTone = aTone;

    // DER VERSATZ GEGEN DAS MOIRE.
    //
    // Im dichten Feld stand ein schwaches diagonales Streifenmuster, das
    // die Referenz nicht hat. Es ist eine Schwebung zwischen dem sehr
    // regelmaeszigen Punktraster und dem Bildpunktraster. Gemessen am
    // Rohbild von 1440 stehen die beiden kuerzesten Gittervektoren bei
    // 3,13 und 5,28 Bildpunkten, das Raster liegt also dicht an der
    // Grenze dessen, was ein Bildpunktraster ueberhaupt aufloesen kann,
    // und dort entsteht eine solche Schwebung zwangslaeufig.
    //
    // Der Grund der Schwebung ist die LAGE eines Punktes INNERHALB seines
    // Bildpunktes. Faellt ein Punktmittelpunkt genau auf die Mitte eines
    // Bildpunktes, so sammelt sich sein Licht dort; faellt er auf eine
    // Ecke, so verteilt es sich auf vier. Die Gesamtmenge bleibt gleich,
    // die SPITZE aber nicht, und weil diese Lage ueber das Bild langsam
    // durchlaeuft, entstehen breite helle und dunkle Baender.
    //
    // Der Versatz ist deshalb genau eine halbe Bildpunktbreite gross,
    // gleichverteilt und je Punkt fest. Diese Zahl ist nicht geraten,
    // sondern die einzige, die den Fehler VOLLSTAENDIG loescht. Wird die
    // Lage innerhalb des Bildpunktes um einen gleichverteilten Betrag der
    // Halbweite h verschoben, so faellt die Staerke der Schwebung um den
    // Faktor sin(2 pi h) geteilt durch 2 pi h. Bei h gleich einer halben
    // Bildpunktbreite ist das sin(pi) geteilt durch pi, also NULL. Bei
    // einem Viertel blieben noch 64 Prozent stehen, bei 0,35 noch 37.
    //
    // Zugleich ist es der kleinstmoegliche Eingriff. Die Reihen stehen
    // 3,13 Bildpunkte auseinander, der Versatz betraegt also hoechstens
    // sechzehn Prozent einer Rasterweite. Die Projektgeschichte kennt
    // einen Fehlschlag mit plus minus 0,4 Rasterweiten, der das Gewebe zu
    // Rauschen machte; das ist das Zweieinhalbfache dieses Wertes.
    //
    // Der Versatz greift ERST HIER, also nach aller Beleuchtung. Saum,
    // Kantenfaktor und Ausklang lesen weiterhin die ungestoerte Lage, und
    // die Helligkeit eines Punktes aendert sich durch ihn nicht.
    vec2 streu = uJitter * (2.0 * vec2(floor(aJit) / 1023.0, fract(aJit)) - 1.0);

    gl_Position = vec4(
      (px.x + streu.x) / uSize.x * 2.0 - 1.0,
      1.0 - (px.y + streu.y) / uSize.y * 2.0,
      0.0, 1.0);
    gl_PointSize = uPointSize * (0.75 + 0.45 * persp);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying float vLit;
  varying float vTone;
  uniform float uOpacity;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d) * 2.0;
    if (r > 1.0) discard;
    // Der Punkt besteht aus einem scharfen KERN und einem weiten, sehr
    // schwachen HOF. Vorher war es ein einziger linearer Abfall ueber die
    // ganze Scheibe.
    //
    // Der Grund steht in der Helligkeitsverteilung des Meszfensters
    // 620,100,420,420 auf Referenzmaszstab. Die Referenz liegt dort bei
    // p05 gleich 32,9 / p50 gleich 43,5 / p75 gleich 54,4 / p90 gleich
    // 72,7, wir lagen bei 34,2 / 37,3 / 38,5 / 40,5. Sockel und unteres
    // Viertel stimmten also, aber von der Mitte der Verteilung an aufwaerts
    // fehlte uns alles. Die Referenz traegt zwischen ihren Punkten einen
    // weichen Schleier, wir hatten flachen Grund und einzelne harte
    // Punkte darauf. Genau diesen Schleier macht der Hof.
    //
    // Wie weit der Hof reichen muss, ist nicht geschaetzt, sondern aus
    // einem waagerechten Schnitt durch das Gewebe der Referenz gerechnet.
    // In Zeile 300 zwischen x gleich 700 und 770 steht dort zwischen den
    // Bahnen kein Grund von 33, sondern von 55 bis 58, waehrend die
    // Spitzen 190 bis 200 erreichen. Die Referenz traegt unter ihrem
    // Punktraster also einen flaechigen Schleier von rund 23 Stufen. Bei
    // uns stand an derselben Stelle 36 bis 37, also blanker Seitengrund.
    //
    // Aus den 23 Stufen folgt die Reichweite. Auf eine Rasterzelle von
    // 22 mal 6,7 gleich 147 Bildpunkten Flaeche entfaellt ein Punkt, der
    // Schleier muss also 23 mal 147 gleich 3381 Stufen mal Bildpunkte
    // beitragen. Ein Hof der Form (1 - r) hoch 1,8 ueber einer Scheibe
    // vom Radius R traegt das Integral 0,59 mal A mal R zum Quadrat.
    // Mit R gleich 15,6 folgt A gleich 25 Stufen, und das sind bei einer
    // Spitze von rund 160 Stufen 0,16 davon.
    // Ein Hof von nur fuenf Bildpunkten Radius, wie ihn ein Zwischenstand
    // hatte, haette dafuer die neunfache Amplitude gebraucht und damit
    // heller sein muessen als der Kern.
    // Die Groesze ist ueber die DELLE im Radialprofil mitgeprueft und
    // nicht nur nach Augenmasz. Die Delle entsteht dadurch, dass zwei
    // Bildpunkte neben einem Punktmittelpunkt die Luecke zwischen den
    // Punkten liegt, waehrend der Ring bei sechs Bildpunkten laengst
    // ueber die Nachbarpunkte hinweglaeuft. Sie darf hoechstens sechs
    // Stufen betragen, die Referenz liegt bei 3,3. Mit dem breiten Kern
    // steht sie bei 5,6, mit dem alten schmalen lag sie bei 6,1.
    //
    // Der Teiler stand auf 10,2 und steht jetzt bei 4,0. Er gibt an,
    // welchen Bruchteil der Scheibe der Kern einnimmt, der Kernhalbmesser
    // ist also R geteilt durch den Teiler.
    //
    // Der Grund ist das Radialprofil der Referenz, und zwar gemessen gegen
    // den oertlichen Boden zwischen den Punkten und nicht gegen den
    // Sockel. Die Referenz liegt im Fenster 620,152,420,420 auf den
    // Ringen null bis vier bei 102,1 / 81,1 / 67,3 / 64,8 / 64,2, ihr
    // Boden ist also 64,2 und ihr Korn traegt darueber 37,9 / 16,9 / 3,1 /
    // 0,6 / 0,0. Ein Punkt der Referenz steht einen Bildpunkt neben seiner
    // Mitte noch bei 45 Prozent seiner Spitze und zwei Bildpunkte daneben
    // bei 8 Prozent. Unser Korn lag ueber demselben Boden bei 56,0 / 10,5
    // / 0,0, stand also einen Bildpunkt neben der Mitte nur noch bei 19
    // Prozent. Es war ein Korn von einem einzigen Bildpunkt, wo die
    // Referenz ein Korn von zweien traegt.
    //
    // Aus dem Wert 0,45 bei einem Bildpunkt folgt der Halbmesser
    // unmittelbar. Die Kurve lautet (1 - d / rc) hoch 1,5, aus 0,45 folgt
    // rc gleich 2,29 Bildpunkte der Referenz, und bei einer Scheibe von
    // 9,14 solchen Bildpunkten Halbmesser ist das der Teiler 4,0.
    // Nachgerechnet steht die Kurve damit bei zwei Bildpunkten auf 4,9
    // Prozent gegen die 8 der Referenz.
    //
    // DAS IST DER EIGENTLICHE UNTERSCHIED ZWISCHEN DEN BEIDEN GEWEBEN.
    // Der kurze Kettenvektor misst 3,3 Bildpunkte, ein Kern von 2,29
    // Bildpunkten Halbmesser laeuft also mit seinen Nachbarn LAENGS der
    // Kette zusammen, waehrend die Gasse quer dazu mit 5,4 Bildpunkten
    // frei bleibt. Genau so liest die Referenz in der
    // Zwoelffachvergroeszerung, naemlich als kurze Striche laengs flach
    // diagonaler Ketten. Unser Kern von 0,90 Bildpunkten beruehrte
    // niemanden und las deshalb als quadratisches Punktgitter.
    // Der Teiler geht von 4,0 auf 5,0 und der Kernhalbmesser damit von
    // 2,5 auf 1,4 Bildpunkte, denn die Scheibe misst nur noch 14 statt 20.
    // Zusammen ist das Korn linear auf 56 Prozent zurueck. Der Grund ist
    // die Nahaufnahme der Referenz, deren Punkte bei zweieinhalbfacher
    // Vergroeszerung eine mittlere Flaeche von 9,9 Bildpunkten tragen und
    // damit auf Seitenmaszstab gut einen Bildpunkt Halbmesser haben,
    // waehrend unser Kern dort zweieinhalb masz und als Perlenkette las.
    // Die Potenz geht von 1,5 auf 2,9, waehrend der Teiler bei fuenf
    // bleibt. Der Kern behaelt damit seine Ausdehnung und verliert allein
    // seine FLANKE, und genau darauf zielt die Aenderung.
    //
    // Der Anlasz ist eine Zerlegung des Meszfensters 620,100,420,420 auf
    // Referenzmaszstab in den flaechigen Schleier und die Struktur
    // darueber. Der Schleier ist dabei der oertliche Boden ueber einem
    // Quadrat von neun Bildpunkten, also das, was zwischen den Punkten
    // stehen bleibt. Er lag bei uns auf allen Stufen der Leiter zwischen
    // 2,0 und 2,3 Stufen ueber dem Sockel und bei der Referenz zwischen
    // 1,1 und 4,1; unser Schleier trifft also bereits. Der gesamte
    // Ueberschusz sasz in der Struktur, naemlich bei p50 auf 2,7 gegen
    // ihre 0,7, bei p75 auf 8,5 gegen 2,1 und bei p90 auf 21,8 gegen 6,8.
    //
    // Daraus folgt, dass der Hofanteil NICHT der Hebel ist. Er traegt den
    // Schleier, und der Schleier stimmt. Zu hell ist die Flanke des
    // Kerns, und die haengt allein an dieser Potenz.
    //
    // Die Zahl selbst ist an einem Modell des ruhigen dichten Feldes
    // gesucht worden, das das gemessene Gitter mit den Basisvektoren
    // (-2,37 | 2,05) und (4,01 | 3,43), die Scheibe von 13,6 Bildpunkten,
    // das Punktprofil, die weiche Begrenzung des Fragment-Shaders und die
    // Verkleinerung auf den Referenzmaszstab nachbildet. Auf die heutigen
    // Einstellungen geeicht trifft es die gemessene Leiter von p50 bis p95
    // und die leuchtende Flaeche auf wenige Prozent genau.
    //
    // Entscheidend ist, was das Modell ueber die LEUCHTENDE FLAECHE sagt.
    // Sie stand bei 22,6 Prozent gegen 9,3 der Referenz, und sie haengt
    // fast allein an dieser Potenz: eine steilere Streuung der
    // Einzelhelligkeit bringt sie nur von 22,9 auf 19,6 Prozent, diese
    // Potenz dagegen von 22,9 auf 10,6. Der Grund ist, dass die Kerne bei
    // der heutigen Gitterteilung die Ebene beinahe kacheln. Eine Zelle
    // misst 16,4 Bildpunkte, der Kern selbst 5,8, und oberhalb der
    // Schwelle von zwoelf Stufen stand er mit 3,5 Bildpunkten.
    // Die Potenz steht nach der Nachmessung bei 3,3 statt bei 2,9. Mit
    // 2,9 fiel die leuchtende Flaeche im Fenster 620,100,420,420 von 22,6
    // auf 14,6 Prozent, die Vorgabe liegt bei 9 bis 13. Der Rest des
    // Weges kostet genau diese vier Zehntel, denn die leuchtende Flaeche
    // ist die Zahl der Punkte mal der Flaeche, die ein Punkt oberhalb von
    // zwoelf Stufen ueber dem Sockel bedeckt, und die haengt allein an
    // dieser Potenz. Gerechnet muss diese Flaeche von 2,4 auf 1,53
    // Bildpunkte je Punkt zurueck, was einem Halbmesser von achtzig
    // Prozent des heutigen entspricht.
    //
    // Der TEILER geht im dritten Durchgang von 5,0 auf 4,0 und die Potenz
    // im selben Zug von 3,3 auf 4,0. Der Kern wird also WEITER und
    // zugleich haerter berandet, sein Halbmesser waechst von 1,36 auf
    // 1,70 Bildpunkte des Rohbildes.
    //
    // Der Anlasz ist die Gestalt der hellen Gebiete. Die Referenz traegt
    // im Fenster 620,100,420,420 nur 177 zusammenhaengende helle Gebiete,
    // diese aber mit im Mittel 27,4 Bildpunkten; wir hatten 1565 Gebiete
    // von 3,38 Bildpunkten. Ein Gebiet von drei Bildpunkten ist eine
    // einzelne Spitze, die beim Verkleinern auf den Referenzmaszstab mit
    // ihren dunklen Nachbarn gemittelt wird und dabei den groeszten Teil
    // ihrer Hoehe verliert. Ein Gebiet von 27 Bildpunkten hat dagegen
    // eine Hochflaeche, die das Verkleinern uebersteht. Genau daran hing
    // das 99. Perzentil, das bei uns trotz aller Streuung nicht ueber
    // 62 Stufen kam, waehrend die Referenz dort 96,7 traegt.
    //
    // Die hoehere Potenz haelt dabei die leuchtende Flaeche fest. Ein
    // weiterer Kern bedeckt mehr Flaeche oberhalb der Schwelle, die
    // steilere Flanke nimmt genau das wieder zurueck, und gemessen am
    // Modell bleibt die leuchtende Flaeche mit 11,2 Prozent stehen,
    // waehrend das 99,9. Perzentil von 121,9 auf 144,9 steigt.
    // DER TEILER GEHT VON 4,0 AUF 0,67, der Kern nimmt damit fast die
    // ganze Scheibe ein. Das ist die groeszte Einzelaenderung dieses
    // Durchgangs und gehoert zur Umkehr der Gitterteilung.
    //
    // Gemessen traegt die Referenz im Fenster 1050,160,180,180 eine
    // Halbwertsbreite von 3,25 Bildpunkten waagerecht und 2,73 senkrecht,
    // waehrend wir dort bei 1,66 und 1,58 standen. Unsere Punkte waren also
    // halb so breit wie ihre und standen zugleich dichter; genau daraus
    // entsteht der Eindruck eines Sprenkelfeldes statt eines Gitters.
    //
    // Der Weg ueber uPointSize allein taugt dafuer nicht, und das ist
    // nachgerechnet. Unsere Halbwertsbreite betraegt 0,0398 mal uPointSize;
    // fuer 2,85 Bildpunkte muesste der Wert von 12 auf 72 steigen, und dann
    // reichte der Hof 36 Bildpunkte weit. Die Scheibe bleibt deshalb bei
    // 12 mal dpr, und allein der Anteil, den der Kern davon einnimmt,
    // waechst. Gerechnet ergibt der Teiler 0,67 eine Halbwertsbreite von
    // 2,85 Bildpunkten gegen die 0,48 des vorigen Standes.
    //
    // NACHGEMESSEN IST DIESE RECHNUNG ZU GROSZZUEGIG, und deshalb steht
    // der Teiler jetzt in KERN_TEILER und nicht mehr als Zahl im Text.
    // Bei 0,67 zaehlt die Gipfelsuche im Fenster 1050,160,180,180 nur
    // noch 68,5 Punkte je 100 mal 100 gegen die 154 der Referenz, also
    // knapp die Haelfte. Die Punkte laufen laengs des kurzen
    // Gittervektors von 6,55 Bildpunkten paarweise zusammen und
    // hinterlassen nur noch einen gemeinsamen Gipfel. Gemessen lag ihre
    // Halbwertsbreite dabei bei 5,25 Bildpunkten gegen die 2,55 der
    // Referenz.
    //
    // Der Grund fuer den Fehlschlusz ist, dass die gerechnete
    // Halbwertsbreite des Profils nicht die gemessene ist. Ein Kern von
    // 0,48 gerechneten Bildpunkten misst sich als 1,88, weil das
    // Bildpunktraster ihn verbreitert und der Hof mittraegt. Zwischen den
    // beiden gepruften Staenden verlaeuft der Zusammenhang linear mit
    // gemessen gleich 1,42 mal gerechnet plus 1,20 Bildpunkte.
    // DER KERN IST JETZT EINE SCHEIBE MIT WEICHER KANTE UND KEINE SPITZE
    // MEHR, UND DAS IST DER EIGENTLICHE GRIFF AN DER FORDERUNG DES
    // AUFTRAGGEBERS.
    //
    // Er verlangt weniger Punkte, dafuer groeszere, und dass man die
    // einzelnen Punkte klar sieht statt einer verschwommenen Flaeche. Das
    // alte Profil (1 - r mal KERN_TEILER) hoch vier leistet das nicht, und
    // zwar aus einem Grund, der sich nachrechnen laeszt. Es faellt schon bei
    // einem Zehntel des Scheibenhalbmessers auf die Haelfte, ein Punkt hat
    // damit gar keine Flaeche, sondern nur eine Spitze mit einem langen
    // Ausklang. Genau ein solcher Ausklang liest als Unschaerfe.
    //
    // Nachgemessen ist das an der leuchtenden Flaeche. Mit dem alten Profil,
    // dem groeszeren Kern und der steileren Hofpotenz trug das Fenster
    // 1080,200,300,300 nur noch 9,6 bis 10,0 Prozent gegen die 15,7 bis 24,8
    // Prozent, die dieselbe Messung an der Referenz liefert. Die Punkte waren
    // also nicht zu grosz, sondern zu klein, und trotzdem nicht scharf.
    //
    // Die Scheibe traegt ueber ihren ganzen Halbmesser von 0,68 geteilt durch
    // KERN_TEILER volles Licht und faellt dann ueber ein Drittel dieses
    // Halbmessers auf null. Bei KERN_TEILER gleich 2,00 und einer
    // Punktscheibe von zwoelf Bildpunkten sind das ein gleichmaesziger Kern
    // von 2,04 und eine Kante bis 3,00 Bildpunkten Halbmesser. Der Punkt
    // misst damit rund fuenf Bildpunkte im Durchmesser bei einem
    // Spaltenabstand von 10,7 und einem Sprossenabstand von 17,8; zwischen
    // zwei Nachbarn bleibt also mehr als eine Punktbreite dunkler Grund.
    float kern = 1.0 - smoothstep(
      ${(0.68 / KERN_TEILER).toFixed(4)},
      ${(1.0 / KERN_TEILER).toFixed(4)},
      r);
    // Der Abfall des Hofes wird von der 1,8. auf die 2,4. Potenz steiler.
    // Er soll den flaechigen Schleier weiter tragen, den die Referenz
    // nachweislich hat, aber die Nachbarpunkte nicht mehr zu einer
    // durchgehenden Flaeche verschmelzen. Mit dem steileren Abfall traegt
    // der Hof auf halbem Weg zum Scheibenrand nur noch 19 statt 29
    // Prozent seines Scheitels.
    //
    // Die Potenz geht von 2,4 auf 2,0 zurueck, und der Anlasz ist die FORM
    // der Perzentilleiter und nicht ihre Hoehe. Im Fenster 900,60,500,700
    // treffen unser 90. und 99. Perzentil die Referenz mit 36,9 gegen 37,7
    // und 120,1 gegen 120,3 bereits, waehrend das 50. mit 3,1 gegen 7,1 und
    // das 75. mit 13,4 gegen 21,9 zurueckliegen. Es fehlt also allein der
    // flaechige Schleier zwischen den Punkten und nicht das Licht der
    // Punkte selbst.
    //
    // Ein flacherer Abfall traegt genau dorthin. Das Gesamtlicht des Hofes
    // waechst mit 2 geteilt durch das Produkt aus Potenz plus eins und
    // Potenz plus zwei, also von 0,134 auf 0,167, und es verteilt sich
    // zugleich weiter nach auszen. Der Gipfel eines Punktes bleibt davon
    // unberuehrt, denn dort steht der Hof ohnehin auf eins.
    //
    // Die Potenz geht im dritten Anlauf auf 1,6 weiter. Mit 2,0 stand die
    // Leiter bei p50 gleich 4,9 / p75 gleich 19,6 / p90 gleich 50,3 / p99
    // gleich 146,3 gegen die 7,1 / 21,9 / 37,7 / 120,3 der Referenz; das
    // untere Ende lag also immer noch zu tief und das obere schon zu hoch.
    // Beides zusammen ist kein Helligkeitsfehler, sondern eine Frage der
    // Verteilung, und der einzige Griff, der sie dreht, ist die Reichweite
    // des Hofes. Sein Gesamtlicht steigt damit auf 0,214, waehrend der
    // Grundfaktor im Vertex-Teil im Gegenzug zurueckgeht.
    // DIE POTENZ GEHT VON 1,6 AUF 3,0, UND DAS IST DER EIGENTLICHE GRIFF AN
    // DER SCHAERFE. Der Anteil des Hofes allein reicht nicht, denn er senkt
    // den Hof UEBERALL gleich und laeszt seine REICHWEITE stehen; genau die
    // Reichweite ist aber das, was den Punkt breit macht. Der Hof faellt bei
    // einer Potenz von 1,6 erst bei r gleich 0,35 auf die Haelfte, was bei
    // einer Scheibe von zwoelf Bildpunkten einer vollen Breite von 4,2
    // Bildpunkten entspricht; mit einer Potenz von 3,0 geschieht das schon
    // bei r gleich 0,206 und damit bei 2,5 Bildpunkten. Der Gipfel bleibt
    // davon unberuehrt, denn dort steht der Hof ohnehin auf eins.
    //
    // Die Potenz steht am Ende bei 2,4 und nicht bei 3,0, und dazwischen
    // liegt der Zielkonflikt dieses Durchganges. Mit 3,0 fiel die
    // Punktbreite auf 3,28 Bildpunkte, die leuchtende Flaeche aber im
    // Fenster 1080,200,300,300 auf 20,9 Prozent und damit unter die
    // Untergrenze, die ein frueher beanstandeter blasser Stand gesetzt hat.
    // Mit 2,4 traegt die Flaeche 30,6 Prozent gegen die 29,5 des
    // Ausgangsstandes, und die Punktbreite liegt bei rund 3,9.
    //
    // Das Gesamtlicht des Hofes faellt mit 2,4 von 0,214 auf 0,141. Der
    // Anteil unten geht dafuer von 0,68 auf 0,85 hoch und der Grundfaktor
    // im Vertex-Teil von 1,16 auf 1,42; beide heben die HELLIGKEIT des
    // Hofes, ohne seine REICHWEITE zurueckzuholen, und genau darauf kommt
    // es an.
    //
    // DIE POTENZ GEHT VON 2,4 AUF 4,0, UND DIESMAL BEKOMMT DIE SCHAERFE DEN
    // VORRANG VOR DER FLAECHE. Der Auftraggeber hat den letzten Schaerfeschritt
    // gesehen und sagt, die Punkte seien immer noch viel zu unschaerf,
    // besonders in der flachen Phase, wo man frontal auf die Wand schaut.
    //
    // Die Potenz bestimmt die REICHWEITE des Hofes und damit die Unschaerfe.
    // Der Hof faellt bei einer Potenz von 2,4 erst bei r gleich 0,251 auf die
    // Haelfte, was bei einer Scheibe von zwoelf Bildpunkten einer vollen
    // Breite von 3,0 Bildpunkten entspricht; mit 4,0 geschieht das schon bei
    // r gleich 0,159 und damit bei 1,9 Bildpunkten. Der Gipfel bleibt davon
    // unberuehrt, denn dort steht der Hof auf eins.
    //
    // Der frueher hier festgehaltene Zielkonflikt gilt nicht mehr. Er lautete,
    // eine Potenz von 3,0 druecke die leuchtende Flaeche unter die
    // Untergrenze. Das galt bei einem Kern, der nur den 2,10. Teil der
    // Scheibe einnahm; mit dem groeszeren Kern aus KERN_TEILER gleich 1,55
    // traegt der Punkt seine Flaeche jetzt im KERN statt im Hof, und genau das
    // ist der Unterschied zwischen einem groszen scharfen Punkt und einem
    // verschmierten.
    float hof = pow(max(0.0, 1.0 - r), 4.0);
    // Der Anteil des Hofes ist auf den SCHLEIER eingestellt und nicht auf
    // den Punkt. Der Schleier haengt am Produkt aus Anteil,
    // Scheibenflaeche, Punktdichte und Grundfaktor, und von diesen vier
    // Groeszen hat sich der Grundfaktor mit dem breiteren Kern von 11,2
    // auf 2,0 geaendert. Damit der Schleier gleich bleibt, muss der Anteil
    // im selben Verhaeltnis hoch, also von 0,021 auf 0,021 mal 11,2
    // geteilt durch 2,0 geteilt durch 1,125 gleich 0,105; der letzte
    // Faktor ist der Zuwachs der Punktzahl von 19 200 auf 21 600.
    // Gemessen liegt der Schleier der Referenz 34,6 Stufen ueber ihrem
    // Sockel und unserer lag bei 29,8.
    // Der Anteil geht von 0,062 auf 0,072. Der Anlasz ist das Radialprofil
    // um die Punktmittelpunkte, seit die Einzelhelligkeit nicht mehr
    // gewuerfelt wird. Die Referenz traegt auf den Ringen null bis sechs
    // 80,0 / 65,0 / 57,2 / 56,8 / 57,3 / 60,3 / 60,5 und damit eine Delle
    // von 3,7 Stufen, wir lagen bei 123,9 / 94,9 / 76,2 / 73,6 / 69,0 /
    // 74,0 / 78,0 und damit bei 9,0. Die Delle sitzt zwischen zwei
    // Nachbarketten, wo der Kern nicht mehr hinreicht und allein der Hof
    // traegt. Der Hof hebt genau diesen Boden an, ohne den Gipfel
    // mitzunehmen: er waechst um 16 Prozent, die Spitze eines Punktes
    // dagegen nur um 1,2 Prozent.
    // Der Anteil geht von 0,072 auf 0,115. Das klingt nach mehr Schein und
    // ist in Wahrheit weniger, denn der Schleier haengt am Produkt aus
    // Anteil, Scheibenflaeche und Punktdichte, und die Scheibe ist von 20
    // auf 14 Bildpunkte zurueck. Ihre Flaeche traegt damit nur noch 0,49,
    // waehrend die Punktzahl auf das 1,78-fache steigt und der steilere
    // Abfall weitere 0,72 nimmt; zusammen bleiben 0,63, und der hoehere
    // Anteil holt genau diesen Rueckstand auf.
    //
    // Der Schein wird damit KLEINER, aber nicht schwaecher. Der Hof reicht
    // nur noch sieben statt zehn Bildpunkte weit, benachbarte Punkte
    // verschmelzen deshalb nicht mehr zu hellen Flecken, und der flaechige
    // Schleier zwischen den Punkten bleibt trotzdem stehen. Die Referenz
    // hat einen solchen Schleier nachweislich, gemessen liegt er in ihrer
    // Nahaufnahme mit p50 gleich 3,3 Stufen ueber dem Sockel.
    //
    // Der Anteil faellt von 0,115 auf 0,040, und der Anlasz ist ein
    // Fehlschlag. Mit der Gitterteilung 300 mal 200 stehen die Reihen nur
    // noch fuenf Bildpunkte auseinander, waehrend der Hof sechs weit
    // reicht; jeder Bildpunkt bekommt damit Hofanteile von zwanzig und
    // mehr Nachbarn, und die Summe fuellt die Luecken vollstaendig aus.
    // Gemessen stieg die leuchtende Flaeche im Fenster 620,100,420,420
    // dadurch auf 54,2 Prozent gegen 9,3 der Referenz, und im Bild stand
    // eine geschlossene leuchtende Flaeche mit Punkten darauf statt
    // einzelner Punkte im Dunkeln. Genau davor warnt der Auftrag.
    //
    // Der Schleier haengt am Produkt aus Anteil, Scheibenflaeche und
    // Punktdichte. Gegen den ersten Durchgang traegt die dichtere Teilung
    // das 1,56-fache und die kleinere Scheibe 0,73, zusammen also 1,14.
    // Der Anteil von 0,040 gegen 0,115 nimmt davon 0,35, sodass vom
    // Schleier des ersten Durchgangs 0,40 stehen bleiben. Dessen p50 lag
    // bei 4,2 Stufen ueber dem Sockel, gerechnet bleiben 1,7 und die
    // Referenz liegt bei 1,9.
    //
    // Der Anteil geht ein letztes Mal zurueck, von 0,040 auf 0,025. Nach
    // dem vorigen Schritt trafen die Spitzen bereits: das 99. Perzentil
    // lag bei 86,4 gegen 96,7 der Referenz und das 99,9. bei 132,4 gegen
    // 137,9. Das MITTELFELD stand dagegen noch beim Dreifachen, naemlich
    // p50 gleich 5,9 gegen 1,9 und p75 gleich 13,0 gegen 3,9, und die
    // leuchtende Flaeche bei 27,3 Prozent gegen 9,3.
    //
    // Ein niedrigerer Grundfaktor haette beides zugleich genommen und die
    // gerade erst sitzenden Spitzen mit heruntergezogen. Der Hof ist der
    // einzige Hebel, der allein auf das Mittelfeld wirkt, denn er traegt
    // den flaechigen Schleier zwischen den Punkten, waehrend die Spitzen
    // aus den Kernen kommen. Gerechnet faellt p50 damit auf rund 3,8 und
    // das 99. Perzentil nur auf 84.
    //
    // Weiter herunter darf er nicht. Die Referenz HAT einen Schleier,
    // gemessen liegt ihr p50 in der Nahaufnahme 3,3 Stufen ueber dem
    // Sockel, und ohne ihn saeszen die Punkte auf blankem Grund statt in
    // einer Atmosphaere.
    // DER HOFANTEIL GEHT VON 0,025 AUF 0,20, also um das Achtfache, und
    // das ist die zweitgroeszte Aenderung dieses Durchgangs.
    //
    // Der Anlasz ist die Perzentilleiter im Fenster 900,60,500,700, jeweils
    // ueber dem eigenen Sockel gerechnet. Die Referenz traegt dort p50
    // gleich 7,1 / p75 gleich 21,9 / p90 gleich 37,7, wir standen bei 1,7 /
    // 2,7 / 6,2. Vom Mittelwert aufwaerts fehlte uns durchgehend das Vier-
    // bis Achtfache. Der leuchtende Flaechenanteil ist mit 7,2 gegen 7,4
    // Prozent dabei fast gleich, die Fenster sind also vergleichbar und der
    // Unterschied ist echt.
    //
    // Die Referenz bekommt diesen Schleier aus einem UnrealBloomPass mit
    // Staerke 0,6, Radius 0,87 und Schwelle 0,23, abgelesen aus ihren
    // Bundles. Wir haben keinen solchen Durchgang, bei uns muss der Hof des
    // Einzelpunktes den Schleier allein tragen.
    //
    // Der Achtfachschritt ist gerechnet und nicht geraten. Der Schleier
    // haengt am Produkt aus Hofanteil, Grundfaktor und Punktdichte. Die
    // Punktdichte faellt in diesem Durchgang auf ein Fuenftel und der
    // Grundfaktor auf 0,52; allein um den vorigen Schleier zu halten,
    // muesste der Anteil deshalb schon auf das Vierfache. Die fehlenden
    // vier Zehntel des Weges kommen aus dem gemessenen Rueckstand von 1,7
    // auf 7,1 Stufen.
    //
    // Der Anteil steht am Ende bei 0,24 und nicht bei 0,30. Er ist ein
    // Stueck zurueckgenommen worden, weil der Grundfaktor im selben Zug
    // von 0,55 auf 1,9 gestiegen ist und der Schleier an beiden zugleich
    // haengt. Gemessen traegt die Leiter im Fenster 900,60,500,700 damit
    // p50 gleich 4,2 / p75 gleich 10,4 / p90 gleich 20,8 Stufen ueber dem
    // Sockel gegen die 7,1 / 21,9 / 37,7 der Referenz, waehrend der
    // Ausgangsstand dort bei 2,9 / 6,8 / 14,7 lag. Der Rueckstand ist also
    // halbiert und nicht getilgt; der Rest sitzt an der Kreuzung, die wir
    // nach wie vor nicht haben.
    //
    // Der Anteil geht von 0,24 auf 0,32. Er wird gemeinsam mit dem
    // Grundfaktor im Vertex-Teil eingestellt, der im selben Zug von 1,9 auf
    // 2,4 steigt, denn der Schleier haengt am Produkt aus beiden. Die
    // Aufteilung folgt daraus, dass der Kern die Spitzen traegt und der Hof
    // das Mittelfeld: der Gipfel eines Punktes waechst von 1,24 auf 1,32,
    // also um sechs Prozent, waehrend der Schleier zwischen den Punkten um
    // ein Drittel zulegt. Die Leiter der Referenz braucht am unteren Ende
    // das Doppelte und am oberen nur das Anderthalbfache, und genau dieses
    // Gefaelle stellt der Hofanteil her.
    //
    // Der Anteil geht im zweiten Anlauf von 0,32 auf 0,42 weiter, zusammen
    // mit der flacheren Potenz eine Zeile darueber. Beide wirken auf
    // dasselbe, naemlich auf den Schleier, und beide sind noetig, weil der
    // Rueckstand am unteren Ende der Leiter mit dem Faktor 2,3 der groeszte
    // des ganzen Fensters ist. Der Gipfel eines Punktes waechst dabei nur
    // von 1,32 auf 1,42, das obere Ende der Leiter bleibt also, wo es sitzt.
    //
    // Der Anteil steht am Ende bei 0,62. Er traegt zusammen mit der Potenz
    // 1,6 ein Hoflicht von 0,132 gegen die 0,032 des Ausgangsstandes, also
    // gut das Vierfache, waehrend der Gipfel eines Punktes nur um ein
    // Drittel zulegt. Genau dieses Verhaeltnis braucht die Leiter: ihr
    // unteres Ende soll sich verdoppeln und ihr oberes stehenbleiben.
    //
    // DER ANTEIL GEHT VON 0,62 AUF 0,90, und der Anlasz ist ein Widerspruch
    // zwischen zwei Messungen, den nur dieser Hebel aufloesen kann.
    //
    // Gemessen an a3000 fehlte uns bei einem Halbmesser von 140 Bildpunkten
    // um die Kreuzung das Ringmittel, naemlich 12,4 gegen die 16,2 der
    // Referenz. Zugleich lag die Fensterstreuung im Hochpass in einem
    // Fenster von 120 mal 120 Bildpunkten an derselben Stelle mit 26,8
    // ueber den 13,2 der Referenz. Unser Gewebe traegt dort also WENIGER
    // Licht und MEHR Zeichnung; sein Korn ist spitzer als das der Referenz.
    //
    // Jeder Faktor im Vertex-Teil hebt beide Groeszen im gleichen
    // Verhaeltnis und kann den Widerspruch deshalb nicht aufloesen. Der
    // Hofanteil kann es, denn er hebt das MITTEL eines Punktes staerker als
    // seinen GIPFEL: mit 0,90 statt 0,62 waechst das Licht eines ganzen
    // Punktes um die Haelfte, sein Gipfel aber nur um siebzehn Prozent.
    //
    // DER ANTEIL GEHT VON 0,90 AUF 0,68 ZURUECK, damit die Struktur in den
    // Hintergrund tritt. Dieselbe Eigenschaft, die ihn oben zum richtigen
    // Hebel gemacht hat, macht ihn auch hier dazu, nur in der anderen
    // Richtung. Zu viel traegt naemlich das Mittelfeld und nicht die Spitze,
    // und die vollstaendige Messung dazu steht beim Grundfaktor im
    // Vertex-Teil. Der Gipfel eines Punktes faellt mit diesem Schritt von
    // 1,90 auf 1,68, also um zwoelf Prozent, waehrend der Schleier zwischen
    // den Punkten auf 0,76 zurueckgeht.
    //
    // Er darf nicht viel weiter herunter. Die Referenz HAT einen Schleier,
    // sie bekommt ihn aus einem UnrealBloomPass und wir haben keinen
    // solchen Durchgang; ohne den Hof saeszen die Punkte auf blankem Grund
    // statt in einer Atmosphaere, und die Delle im Radialprofil zwischen
    // zwei Nachbarketten liefe wieder auf.
    // DER ANTEIL GEHT VON 0,68 AUF 0,85, UND DAS IST KEIN WIDERSPRUCH ZUR
    // VERLANGTEN SCHAERFE. Scharf wird der Punkt ueber die REICHWEITE des
    // Hofes, und die steht in seiner Potenz eine Ebene weiter oben; sie ist
    // dort von 1,6 auf 2,4 gegangen und hat das Gesamtlicht des Hofes von
    // 0,214 auf 0,141 gesenkt. Dieser Anteil hier hebt nur die HELLIGKEIT
    // des verbliebenen, engeren Hofes und holt damit zurueck, was die
    // Ausduennung des Rasters und die kuerzere Reichweite an Licht
    // genommen haben. Ein Versuch mit 0,42 ist gebaut und wieder ausgebaut
    // worden, weil die leuchtende Flaeche damit auf 16,9 Prozent fiel.
    //
    // Der Auftraggeber vermisst die Schaerfe an der Kreuzung am meisten,
    // und genau dort ist der Hof auch der Schuldige gewesen. Ein Punkt
    // besteht aus Kern und Hof, und
    // an der Kreuzung schiebt die Flaeche viele Punkte auf wenige
    // Bildpunkte zusammen; die Kerne bleiben dabei getrennt, die Hoefe aber
    // liegen uebereinander und summieren sich zu einer geschlossenen
    // hellen Flaeche, in der kein einzelnes Korn mehr zu sehen ist. Das ist
    // der Brei, den er beschreibt.
    //
    // DER ZIELKONFLIKT IST BEKANNT UND WIRD ZUGUNSTEN DER SCHAERFE
    // ENTSCHIEDEN. Der Hof traegt zugleich den Schleier zwischen den
    // Punkten, und die Referenz bekommt diesen Schleier aus einem
    // UnrealBloomPass, den wir nicht haben. Weniger Hof heiszt deshalb
    // nicht nur schaerfere Punkte, sondern auch eine leerere Flaeche
    // zwischen ihnen. Aufgeloest ist der Konflikt darueber, dass Reichweite
    // und Helligkeit des Hofes GETRENNT eingestellt werden: die Potenz
    // nimmt die Reichweite und macht den Punkt scharf, dieser Anteil und
    // der Grundfaktor geben die Helligkeit zurueck und halten die Flaeche.
    // Nachgemessen traegt der Endstand 30,6 Prozent leuchtende Flaeche
    // gegen die 29,5 des Ausgangsstandes, die Flaeche ist also NICHT
    // leerer geworden, waehrend die Punktbreite von rund 4,3 auf 3,9
    // gefallen und von 5,2 auf 3,6 senkrecht zusammengegangen ist.
    // DER ANTEIL DES HOFES GEHT VON 0,85 AUF 0,55, UND ER FOLGT DAMIT DER
    // ENTSCHEIDUNG FUER DIE SCHAERFE. Der Hof ist der Traeger des Schleiers
    // zwischen den Punkten und damit der Traeger der Unschaerfe, die der
    // Auftraggeber beanstandet. Sein Gesamtlicht faellt ueber die steilere
    // Potenz ohnehin von 0,0668 auf 0,0333 der Scheibenflaeche; der kleinere
    // Anteil nimmt davon noch einmal ein Drittel. Was der Punkt dabei
    // verliert, holt der groeszere Kern zurueck, dessen Gesamtlicht von
    // 0,00756 auf 0,01388 steigt. Der Punkt traegt sein Licht danach zu 43
    // statt zu 12 Prozent im Kern, und genau das ist der Unterschied zwischen
    // einer sichtbaren Perle und einem Fleck.
    float a = kern + 0.45 * hof;

    // Die fuenf Toene der Referenz, aus ihrem Farbton zurueckgerechnet.
    // Sie liegen bei 240, 257, 222, 271 und 310 Grad. Die tiefen Kanaele
    // stehen hoch, weil das die Saettigung nimmt, ohne den Farbton zu
    // drehen; gemessen liegt sie im Bild bei 0,39 gegen 0,46 der
    // Referenz.
    // DIE TOENE SIND AUS DEM QUELLTEXT DER REFERENZ ZURUECKGERECHNET und
    // nicht mehr aus einem Videobild geschaetzt. Ihre Bundles nennen die
    // Farben im Klartext: die Punkte laufen zu je einem Drittel in
    // #612574, #293583 und #1954ec, dazu kommen fuenfhundert
    // Flusz-Partikel in #d2d2d4, #d4548f und #0699cf.
    //
    // Umgerechnet liegen diese sechs bei 285,6 / 232,0 / 223,2 Grad sowie
    // bei nahezu grau, 332,3 und 196,1 Grad. Die rosa und cyanfarbenen
    // Punkte, die in den Nahaufnahmen auffallen, sind also keine
    // Zufallsprodukte des Mischens, sondern eigene Partikel.
    //
    // Alle Toene stehen bei einer Saettigung von 0,56 mit vollem groeszten
    // Kanal. Die Referenz misst 0,470 im fertigen Bild, wir lagen bei
    // 0,449; der weiche Hof entsaettigt von sich aus.
    // DIE VIER TOENE BEKOMMEN VERSCHIEDENE HELLIGKEIT UND VERSCHIEDENE
    // SAETTIGUNG, UND BEIDES STAMMT AUS DEN DREI PUNKTFARBEN DER REFERENZ.
    //
    // Bisher stand jeder Ton auf vollem Blaukanal und auf derselben
    // Saettigung von 0,56. Jeder Punkt des Gewebes trug damit dieselbe
    // Leuchtdichte, und genau das ist die Ursache der Beanstandung, unsere
    // Punkte leuchteten zu stark. Die Referenz macht es anders. Ihre drei
    // Punktfarben #1954ec, #293583 und #612574 liegen bei den Hellwerten
    // 0,925, 0,514 und 0,455; zwei Drittel ihrer Punkte stehen also nur
    // halb so hell wie das eine helle Drittel.
    //
    // Diese Aufteilung ist am Bild nachweisbar und nicht nur aus dem
    // Quelltext abgelesen. Im Faecherfenster 1050,160,180,180 liegen die
    // hellsten fuenf Zehntausendstel der Bildpunkte der Referenz zu 100
    // Prozent zwischen 210 und 240 Grad bei einer Saettigung von 0,745,
    // waehrend unsere dort zu 50 Prozent im blauen und zu 44 Prozent im
    // blauvioletten Topf lagen und nur 0,373 Saettigung trugen. Bei der
    // Referenz sind die hellsten Punkte also durchweg das gesaettigte Blau
    // #1954ec, bei uns war der hellste Punkt eine Frage des Zufalls.
    //
    // c222 traegt deshalb die Rolle von #1954ec und behaelt vollen
    // Blaukanal bei der hoechsten Saettigung der vier. Die drei uebrigen
    // gehen im Hellwert zurueck, und zwar in dem Verhaeltnis, in dem die
    // Referenz ihre dunklen Toene fuehrt.
    //
    // DIE SAETTIGUNG WIRD GEGEN DAS GERENDERTE BILD EINGESTELLT UND NICHT
    // GEGEN DIE GESETZTEN WERTE DER REFERENZ. Diese liegen mit 0,894, 0,687
    // und 0,681 weit ueber unseren, gemessen rendert die Referenz aber nur
    // 0,37 bis 0,41, waehrend wir bei 0,473 lagen. Der Grund ist ihr
    // Weichzeichner, ein UnrealBloomPass mit Staerke 0,6, der einen breiten
    // blassen Schleier ueber die ganze Flaeche legt und jeden schwachen
    // Bildpunkt entsaettigt. Wir haben keinen solchen Durchgang, bei uns
    // traegt jeder Bildpunkt die Saettigung seines Tones fast unveraendert
    // ins Bild. Wer hier die gesetzten Werte der Referenz uebernaehme,
    // truebe die gemessene Saettigung auf ueber 0,55 und damit weiter von
    // ihr weg statt auf sie zu.
    //
    // Gemessen betraegt die Uebertragung von der lichtgewichteten
    // Saettigung der Tonleiter auf die im Bild gemessene 0,473 geteilt
    // durch 0,546 gleich 0,866. Fuer die Vorgabe von 0,38 bis 0,40 folgt
    // daraus eine lichtgewichtete Saettigung von 0,44 bis 0,46, und die
    // vier Werte unten liefern 0,452.
    //
    // Die mittlere Leuchtdichte der ganzen Leiter faellt damit von 0,530
    // auf 0,441, also auf das 0,831-fache. Der Grundfaktor im Vertex-Teil
    // geht im selben Zug von 1,60 auf 1,30 zurueck; zusammen bleiben 0,675
    // des bisherigen Lichtes stehen, und genau diesen Abstand hatte die
    // Messung gegen die Referenz ergeben.
    //
    // c222 IST DER EINE TON, DER GEGEN DIE ALLGEMEINE ENTSAETTIGUNG STEIGT,
    // und zwar von 0,56 auf 0,72. Er vertritt #1954ec, und dieses ist mit
    // einer Saettigung von 0,894 das mit Abstand gesaettigste der drei
    // Punktfarben der Referenz. Nachgemessen liegt die Saettigung der
    // hellsten fuenf Zehntausendstel im Faecherfenster bei der Referenz bei
    // 0,745 und lag bei uns nach der ersten Runde erst bei 0,504.
    //
    // Der Schritt kostet nichts. Der Ton traegt zehn Prozent der Punkte,
    // seine Leuchtdichte faellt dabei von 0,601 auf 0,465, die mittlere
    // Leuchtdichte der ganzen Leiter also um drei Prozent, und die
    // lichtgewichtete Saettigung steigt um weniger als 0,003. An der im
    // Bild gemessenen mittleren Saettigung aendert sich damit nichts, denn
    // diese wird von den vielen schwachen Bildpunkten getragen, waehrend
    // die Spitze an den wenigen hellen haengt.
    // DIE PALETTE IST ENG ZUSAMMENGEZOGEN, weil der Auftraggeber im Feld
    // weiterhin gruene, rote und gelbliche Einzelpunkte gesehen hat.
    //
    // Die Ursache ist an den Farbtonwinkeln der Toene selbst abzulesen. Aus
    // den gesetzten Werten zurueckgerechnet lagen sie bei 222, 232, 250,
    // 286, 318 und 194 Grad. Die beiden letzten, also der magentafarbene
    // und der cyanfarbene Ton, standen damit als einzige auszerhalb des
    // Bandes von 200 bis 300 Grad und trugen zusammen 5,1 Prozent der
    // Punkte. In der Sechsfachvergroeszerung von _ref2/ruhig/basis/v02400
    // stehen genau sie als leuchtend gruene und als kraeftig rote Punkte
    // zwischen den blauen; die Zaehlung ueber alle leuchtenden Bildpunkte
    // hatte das nicht gezeigt, weil sie von den vielen schwachen beherrscht
    // wird, waehrend das Auge den wenigen hellen folgt. Ueber der Schwelle
    // 150 gemessen lagen deshalb 2,3 bis 6,0 Prozent der hellen Bildpunkte
    // auszerhalb von 200 bis 300 Grad, waehrend die lebende Referenz dort
    // nur 1,4 bis 2,1 Prozent traegt.
    //
    // Alle sechs Toene liegen jetzt zwischen 215 und 292 Grad. Der vierte
    // heiszt nicht mehr c286, sondern c278, denn er ist um acht Grad
    // zurueckgenommen und faellt damit vollstaendig in den Topf von 210 bis
    // 280 Grad, den die Vorgabe nennt.
    vec3 c222 = vec3(0.280, 0.496, 1.0);
    vec3 c232 = vec3(0.335, 0.373, 0.620);
    vec3 c250 = vec3(0.455, 0.406, 0.700);
    vec3 c278 = vec3(0.453, 0.286, 0.550);
    // Der warme Ton steht jetzt bei 292 statt bei 318 Grad und traegt
    // zugleich weniger Licht. Er bleibt als der eine Akzent erhalten, den
    // die Referenz mit ihrem lachsfarbenen Sprenkel ebenfalls hat, liest
    // sich aber als Violett und nicht mehr als Rot. Sein voller Rotkanal
    // von 0,80 ist der Grund gewesen, aus dem er heller stand als seine
    // blauen Nachbarn und einzeln ins Auge fiel; mit 0,576 steht er auf der
    // Hoehe von c278.
    vec3 cMag = vec3(0.576, 0.290, 0.620);
    // Der kalte Ton steht jetzt bei 215 statt bei 194 Grad. Bei 194 lag er
    // jenseits des Blaus im Cyan, und weil sein Gruenkanal mit 0,68 ueber
    // dem Rotkanal von 0,28 lag, las ein solcher Punkt im blauvioletten Feld
    // als gruen. Mit 215 Grad steht er im selben Band wie c222 und traegt
    // nur noch eine leichte kuehle Abweichung.
    vec3 cCyn = vec3(0.350, 0.538, 0.800);
    vec3 cWht = vec3(1.0, 1.0, 1.0);

    vec3 col =
    // Die Schwellen sind neu verteilt. Gemessen im Fenster
    // 620,152,420,420 der Referenz und 620,100,420,420 bei uns, beide auf
    // Referenzmaszstab, lag die Referenz bei 50,7 Prozent zwischen 210 und
    // 240 Grad und 40,4 zwischen 240 und 270; wir lagen bei 12,2 und 77,7.
    // Der Ton c225 ist der einzige, der in den ersten Topf faellt, und er
    // hatte nur zwoelf Prozent des Budgets. Er bekommt jetzt die Haelfte.
    //
    // Die Aufteilung traegt auch nach dem breiten Kern, obwohl benachbarte
    // Punkte sich jetzt laengs ihrer Kette ueberlagern und additives
    // Mischen den gerenderten Farbton grundsaetzlich zum Blau ziehen kann.
    // Nachgemessen liegen wir im Fenster 620,100,420,420 bei 51,1 Prozent
    // zwischen 210 und 240 Grad gegen 50,7 der Referenz und bei 45,1
    // zwischen 240 und 270 gegen 40,4. Offen bleibt der Topf zwischen 270
    // und 300 Grad, wo die Referenz 7,4 Prozent traegt und wir 3,0.
    //
    // Hinfaellig ist der Vorschlag, die tiefen Kanaele um 0,05 anzuheben.
    // Er sollte die Saettigung von 0,53 auf 0,46 bringen; gemessen liegt
    // sie bei 0,46 gegen 0,46 der Referenz, weil der weiche Hof die Farben
    // von sich aus entsaettigt.
    // Die Schwellen sind ein zweites Mal verschoben, und zwar seit die
    // Einzelhelligkeit nicht mehr gewuerfelt wird. Vorher trug ein einzelner
    // sehr hell gewuerfelter Punkt seinen Farbton gegen seine Nachbarn
    // durch; jetzt sind alle Punkte gleich hell, das additive Mischen
    // zieht die gerenderten Farbtoene deshalb staerker zur Mitte der
    // Verteilung und die aeuszeren Toepfe leeren sich. Nachgemessen fiel
    // der Topf zwischen 270 und 300 Grad dabei von 4,1 auf 3,1 Prozent,
    // waehrend die Referenz dort 7,4 bis 8,6 Prozent traegt. Der Ton c270
    // bekommt deshalb 18,4 statt 7,5 Prozent der Punkte, zu Lasten von
    // c255, der im ohnehin gut gefuellten Topf zwischen 240 und 270 Grad
    // sitzt.
    //
    // Der WEISZE Ton geht von 1,2 auf 0,25 Prozent zurueck. Er war die
    // zweite Folge derselben Aenderung. Solange die Punkte verschieden
    // hell waren, ging ein weiszer Punkt in der Streuung unter; bei
    // gleicher Helligkeit steht er als heller Fleck im Gewebe, und in der
    // Achtfachvergroeszerung des oberen Lappens waren vier davon zu sehen,
    // wo die Referenz an derselben Stelle keinen einzigen zeigt. Ihre
    // weiszen Bildpunkte entstehen nicht aus einem weiszen Ton, sondern
    // aus der Begrenzung dort, wo sich viele Punkte ueberlagern, also am
    // Saum der Engstelle.
        // Die erste Schwelle stand auf 0,44 und gab dem blauen Ton c225
        // damit 44 Prozent der Punkte. Am gerenderten Bild gemessen trug der
        // Topf zwischen 210 und 240 Grad dadurch 36 Prozent, waehrend die
        // Referenz dort 20 traegt; der Topf zwischen 240 und 270 kam auf 62
        // gegen ihre 76. Bei 0,25 wandern rund sechzehn Prozentpunkte vom
        // blauen in den blauvioletten Topf.
        // Die Rampe ist ein drittes Mal verschoben, und zwar gegen die
        // frische Nahaufnahme _ref2/vid28/v040.jpg. Dort traegt die
        // Referenz in einer ruhigen Flaeche 8,7 Prozent ihrer leuchtenden
        // Bildpunkte zwischen 210 und 240 Grad, 84,2 zwischen 240 und 270,
        // 6,1 zwischen 270 und 300 und 0,8 im Magenta, waehrend wir im
        // Fenster 620,100,420,420 bei 21,7 / 74,7 / 3,3 / 0,0 standen. Der
        // blaue Ton c225 hatte also mehr als das Doppelte seines Anteils
        // und geht deshalb von 25 auf 14 Prozent zurueck; was er abgibt,
        // faellt an die blauvioletten Toene c240 und c255, die den Kern
        // der Verteilung bilden.
        //
        // Der MAGENTA-Ton bleibt, wird aber vom Nebenton zum Akzent. Sein
        // Anteil faellt von 2,25 auf 1,12 Prozent, denn in der
        // Dreifachvergroeszerung unseres Standes las das Gewebe deutlich
        // pink, obwohl die gemessene Farbtonverteilung nahe an der
        // Referenz lag. Der Grund ist, dass die Zaehlung von den vielen
        // schwachen Bildpunkten beherrscht wird, waehrend das Auge den
        // wenigen hellen folgt, und hell waren bei uns gerade die
        // magentafarbenen.
        //
        // Der WEISZE Ton geht von 0,25 auf 0,08 Prozent zurueck. Die
        // Referenz zeigt in ihrer Nahaufnahme keinen einzigen weiszen
        // Punkt; ihre weiszen Bildpunkte entstehen ausschlieszlich dort,
        // wo sich an der Kreuzung viele Punkte ueberlagern und die
        // Begrenzung im Fragment-Shader greift. Weisz gehoert damit allein
        // an die staerksten Lichter und nicht in die Flaeche.
        // Die dritte Schwelle geht von 0,80 auf 0,88. Der violette Ton
        // c270 traegt damit 10,8 statt 18,8 Prozent der Punkte, und was er
        // abgibt, faellt an den blauvioletten c255. Der Anlasz ist die
        // Gegenueberstellung der Nahaufnahmen: bei uns wechselten laengs
        // jeder Kette blaue und violette Punkte einander ab und erzeugten
        // einen deutlich lesbaren Farbrhythmus, waehrend die Referenz
        // ueberwiegend einen einzigen blauvioletten Ton traegt und die
        // warmen Sprenkel darin vereinzelt stehen. Gemessen liegt die
        // Referenz zwischen 270 und 300 Grad bei 6,1 Prozent.
        // Die erste und die dritte Schwelle gehen ein Stueck zurueck, von
        // 0,14 auf 0,21 und von 0,88 auf 0,855. Der Anlasz ist eine
        // Uebersteuerung im vorigen Durchgang. Am fertigen Bild gemessen
        // lagen wir bei 11,8 Prozent zwischen 210 und 240 Grad, 87,9
        // zwischen 240 und 270 und 0,2 zwischen 270 und 300, waehrend die
        // Referenz 20,2 / 76,0 / 2,7 traegt. Wir hatten also alles in den
        // mittleren Topf geraeumt und dabei genau das tiefe Blau und das
        // Violett verloren, das der Auftrag ausdruecklich verlangt.
        //
        // Der blaue Ton c225 bekommt damit 21 Prozent der Punkte und
        // trifft den Anteil der Referenz, der violette c270 kommt auf 13,3
        // Prozent. Der magentafarbene Akzent und der weisze Ton bleiben
        // unberuehrt bei 1,12 und 0,08 Prozent.
        // DIE LEITER IST GEGEN DIE LIVE-AUFNAHME NEU EINGESTELLT, und
        // alles darueber Stehende ist damit hinfaellig. Es ist gegen
        // VIDEOBILDER abgenommen worden, und deren Kompression zieht
        // gesaettigte Toene zusammen; die Rampe ist dadurch dreimal in
        // eine Richtung verschoben worden, die die Live-Messung nicht
        // stuetzt.
        //
        // Gemessen im Fenster 900,60,500,700 traegt die Referenz 1,9
        // Prozent ihrer leuchtenden Bildpunkte zwischen 180 und 210 Grad,
        // 62,2 zwischen 210 und 240, 22,8 zwischen 240 und 270, 6,0
        // zwischen 270 und 300, 4,2 zwischen 300 und 330 und 2,0 zwischen
        // 330 und 360. Wir standen bei 0,0 / 22,8 / 63,6 / 12,9 / 0,7 /
        // 0,0 und sazen damit genau einen Topf zu weit im Violetten,
        // waehrend der rote bis magentafarbene Auslaeufer von zusammen 6,9
        // Prozent fast ganz fehlte.
        //
        // Weil die Punkte seit dem flachen Wuerfel einander kaum noch
        // ueberlagern, verschiebt das additive Mischen die Toepfe nicht
        // mehr nennenswert. Nachgerechnet trug c225 mit 21 Prozent der
        // Punkte 22,8 Prozent des Topfes und c270 mit 13,3 Prozent 12,9;
        // die Anteile lassen sich deshalb unmittelbar auf die Zielwerte
        // setzen.
        // KORREKTUR. Die vorigen Schwellen 0,31 und 0,62 gaben den beiden
        // blauen Toenen zusammen 62 Prozent der Punkte. Gemessen an den
        // LIVE-Aufnahmen unter _ref2/mess/live/ liegt die Referenz im Topf
        // 210 bis 240 Grad aber nur bei 22,6 bis 23,5 Prozent und im Topf
        // 240 bis 270 Grad bei 71,3 bis 72,4. Wir lagen mit 59,0 gegen 33,8
        // also genau umgekehrt.
        //
        // Die Zahl, auf die jene Einstellung sich stuetzte, war vertauscht.
        // Sie nannte fuer die Referenz 62,2 Prozent im blauen und 22,8 im
        // blauvioletten Topf; zwei unabhaengige Nachmessungen an denselben
        // Live-Bildern ergeben das Gegenteil. Vor jener Aenderung stand
        // unser Stand bei 22,6 gegen 65,2 und war damit nahezu richtig.
        //
        // c222 und c232 tragen jetzt zusammen 22 Prozent, c250 traegt 66.
        //
        // DIE BEIDEN BLAUEN TOENE GEHEN AUF ZUSAMMEN 26,7 PROZENT, und das
        // ist die Nachfuehrung zum Lichtverlauf und zur kleineren Punktzahl.
        // Beide machen das Gewebe auszerhalb der Kreuzung schwaecher, und
        // ein schwacher Punkt mischt sich staerker mit dem Grund der Zone,
        // der selbst blauviolett ist. Der gerenderte Farbton wandert dadurch
        // in den mittleren Topf, ohne dass sich an der Zuteilung etwas
        // geaendert haette.
        //
        // Gemessen gegen _ref2/mess/live/ruhe00.png im Faecherfenster und
        // mit der Schwelle v gleich 70 traegt die Referenz 18,7 Prozent
        // zwischen 210 und 240 Grad und 75,5 zwischen 240 und 270 bei einer
        // Saettigung von 0,40. Wir standen nach dem Lichtverlauf bei 15,5
        // und 80,4 bei 0,42, also gut drei Punkte zu weit im Violetten.
        // Zwei Zehntel der Zuteilung wirken sich dabei zu rund sieben
        // Zehnteln auf den gemessenen Topf aus, aus 22 Prozent der Punkte
        // wurden 15,5 Prozent des Topfes; fuer die 18,7 der Referenz
        // braucht es deshalb 26,7 Prozent der Punkte.
        // DER WEISZE TON IST DIE QUELLE DER GELBEN PUNKTE, UND SEIN ANTEIL
        // FAELLT DESHALB VON 1,50 AUF 0,20 PROZENT.
        //
        // Der Auftraggeber hat beanstandet, unser Gewebe trage gelbe
        // Punkte, wo die Referenz keine habe. Im Farbtonraum ist davon
        // nichts zu finden. Ueber das ganze Bild abgesucht liegt bei uns
        // KEIN EINZIGER Bildpunkt zwischen 30 und 120 Grad, weder oberhalb
        // einer Helligkeit von 60 noch von 150, und die Referenz traegt
        // dort nur vier Bildpunkte im ganzen Bild.
        //
        // Der naheliegende Verdacht, die Summe klemme im Blaukanal und
        // hebe danach nur noch Rot und Gruen, traegt ebenfalls nicht. Er
        // ist an den hellsten Bildpunkten geprueft. Im Faecherfenster
        // stehen 346 Bildpunkte mit einem Blaukanal ab 250, und nur sieben
        // von ihnen tragen in Rot oder Gruen mehr als im Blau. Die weiche
        // Begrenzung weiter unten faengt das ab, denn sie bleicht einen
        // ueberlaufenden Punkt farbtonerhaltend nach Weisz aus, statt Rot
        // und Gruen allein weiterlaufen zu lassen.
        //
        // Was er sieht, sind FARBLOSE Punkte in einem blauvioletten Feld.
        // Das Auge liest einen unbunten Fleck vor buntem Grund im
        // Gegenfarbton, und der Gegenfarbton zu Blauviolett ist Gelb. In
        // der Sechsfachvergroeszerung des oberen Faechers stehen diese
        // Punkte als blasse gelbliche Flecken zwischen den blauen, obwohl
        // ihre Bildpunkte mit Werten wie 224, 223, 228 gemessen nahezu
        // neutral sind und eine Saettigung von 0,02 tragen.
        //
        // Gezaehlt mit _ref2/farblos.mjs trug der obere Faecher bei uns 196
        // farblose helle Bildpunkte gleich 0,71 Prozent aller hellen,
        // waehrend die Referenz dort 24 bis 28 gleich 0,13 bis 0,29 Prozent
        // traegt. An der Kreuzung bleichen beide aus, und das bleibt so;
        // dort ist es das gewollte Verhalten von additivem Licht und die
        // Referenz zeigt es ebenso.
        //
        // Die 196 Bildpunkte entsprechen bei 11 748 Punkten je Periode und
        // 1,50 Prozent Anteil genau den 176 weiszen Punkten der Leiter. Der
        // Ton selbst ist also die Quelle und nicht das Klemmen.
        //
        // Der neue Anteil ist aus der Referenz gerechnet und nicht
        // geschaetzt. Sie laeszt fuenfhundert Flusz-Partikel laufen, davon
        // ein Drittel im nahezu grauen #d2d2d4, und setzt sie gegen ein
        // Gewebe, das im Fenster 143 Punkte je 100 mal 100 Bildpunkten
        // traegt. Ein Sechstel Prozent trifft dieses Verhaeltnis; mit 0,20
        // Prozent bleiben bei uns rund 23 solcher Punkte je Periode stehen
        // und damit dieselbe Groeszenordnung wie die 24 bis 28 der
        // gemessenen Referenz.
        //
        // DER CYANFARBENE TON GEHT VON 2,30 AUF 0,90 PROZENT. Gemessen im
        // Faecherfenster trug der Topf zwischen 195 und 210 Grad bei uns
        // 1,1 Prozent der leuchtenden Bildpunkte, die Referenz dort 0,1.
        // Ihr Ton #0699cf ist zwar sehr gesaettigt, gehoert aber ebenfalls
        // zu den fuenfhundert Flusz-Partikeln und steht deshalb sehr viel
        // seltener als bei uns.
        //
        // DER MAGENTAFARBENE TON GEHT VON 3,70 AUF 4,20 PROZENT, und das
        // ist die einzige Richtung, in der wir zu WENIG hatten. Im
        // Faecherfenster traegt die Referenz zwischen 285 und 345 Grad
        // zusammen 5,5 Prozent, wir lagen dort bei 0,8. Ihr Ton #d4548f
        // steht bei 332 Grad und ist in der Nahaufnahme als lachsfarbener
        // Sprenkel zwischen den blauen Punkten deutlich zu sehen.
        //
        // DIE BEIDEN BLAUEN TOENE GEHEN VON ZUSAMMEN 26,70 AUF 20,00
        // PROZENT. Gemessen im Faecherfenster lagen wir bei 27,3 Prozent
        // zwischen 210 und 240 Grad, die Referenz haelt ueber ihre zwoelf
        // Ruhebilder 14,2 bis 22,9 Prozent bei einem Mittel von 19,7. Die
        // Zuteilung bildet sich fast eins zu eins auf den gemessenen Topf
        // ab, weil die Punkte seit dem flachen Wuerfel einander kaum noch
        // ueberlagern; aus 26,7 Prozent der Punkte wurden 27,3 Prozent des
        // Topfes.
        // DIE ANTEILE DER BEIDEN BUNTEN TOENE GEHEN DEUTLICH ZURUECK, und
        // das ist der zweite Griff neben der Verschiebung der Farbtoene
        // selbst. Der magentafarbene Ton faellt von 4,20 auf 1,20 Prozent
        // und der cyanfarbene von 0,90 auf 0,40 Prozent; zusammen tragen
        // sie damit 1,6 statt 5,1 Prozent der Punkte. Was sie abgeben,
        // faellt an c250 und an c278, also an den Kern der Verteilung.
        //
        // Der Griff ist bewuszt doppelt gefuehrt. Die Farbtonverschiebung
        // allein haette die Punkte in den richtigen Topf geraeumt, sie
        // stuenden aber weiterhin als einzelne auffaellige Perlen im Feld,
        // weil sie gesaettigter sind als ihre Nachbarn. Der kleinere Anteil
        // nimmt genau diese Auffaelligkeit heraus.
        //
        // Der weisze Ton bleibt bei 0,20 Prozent. Er ist im vorigen
        // Durchgang von 1,50 auf diesen Wert zurueckgegangen und war damit
        // die Quelle der gelben Punkte; nachgemessen mit _ref2/farblos.mjs
        // liegt der Anteil farbloser heller Bildpunkte im Faecher seither
        // in der Groeszenordnung der Referenz.
        //
        // Die Zuteilung lautet damit 10,0 Prozent c222, 10,0 Prozent c232,
        // 71,2 Prozent c250, 7,0 Prozent c278, 1,2 Prozent cMag, 0,4
        // Prozent cCyn und 0,2 Prozent cWht. Von diesen liegen 98,6 Prozent
        // im Band von 210 bis 280 Grad und 1,2 Prozent zwischen 280 und
        // 300; auszerhalb von 200 bis 300 Grad steht kein Ton mehr.
        vTone < 0.10   ? c222
      : vTone < 0.20   ? c232
      : vTone < 0.912  ? c250
      : vTone < 0.982  ? c278
      : vTone < 0.994  ? cMag
      : vTone < 0.998  ? cCyn
      : cWht;

    // Der Alphakanal traegt die HELLIGKEIT des Punktes, nicht die feste
    // Eins. Das ist kein Feinschliff, sondern die Behebung eines Fehlers,
    // der das ganze Gewebe dunkler machte als den Grund daneben.
    //
    // Der Weg dorthin. Die Leinwand liegt in .dnaSticky, und eine klebende
    // Schachtel bildet einen eigenen Stapelzusammenhang. Die Leinwand ist
    // darin das einzige Kind und hat keinen Grund hinter sich, gegen den
    // sie sich mischen koennte; mix-blend-mode: screen laeuft deshalb ins
    // Leere und die Gruppe wird anschlieszend ganz gewoehnlich ueber den
    // Grund gelegt. Nachgewiesen ist das daran, dass screen und ein
    // erzwungenes normal im Fenster 1160,150,120,120 dasselbe 5. Perzentil
    // liefern, naemlich 23,3 gegen 23,2.
    //
    // Bei fester Eins im Alphakanal ist damit JEDER Bildpunkt der
    // Punktscheibe deckend, auch der Rand, wo die Farbe gegen null geht.
    // Ein deckend schwarzer Rand malt den Grund weg. Gemessen lag das
    // 5. Perzentil im Gewebe deshalb bei 23,3, ohne Gewebe aber bei 31,2,
    // und das Radialprofil um die Punktmitte fiel um 19 Stufen ein,
    // waehrend die Referenz nur 5 Stufen zeigt.
    //
    // Mit der Helligkeit als Alpha ist die Leinwand vormultipliziert:
    // ein dunkler Rand ist ein fast durchsichtiger Bildpunkt. Das
    // gewoehnliche Uebereinanderlegen rechnet dann rgb + (1 - a) * Grund
    // und wirkt damit von selbst additiv, ganz ohne Mischmodus im CSS.
    vec3 rgb = col * vLit * a * uOpacity;

    // Weiche Begrenzung der Spitzen, und zwar FARBTONERHALTEND.
    //
    // Alle fuenf Toene haben ihren vollen Wert im Blaukanal. Ohne
    // Begrenzung laeuft deshalb bei einem hellen Punkt immer zuerst das
    // Blau ueber, waehrend Rot und Gruen weiterwachsen, und der Farbton
    // wandert. Nachgemessen kippten dadurch 16,4 Prozent der leuchtenden
    // Punkte nach Cyan zwischen 180 und 210 Grad, wo die Referenz 0,9
    // Prozent hat, und der Anteil zwischen 270 und 300 Grad stieg von 7,4
    // auf 10,7. Der Grund liegt in der Rechnung: der Ton c225 traegt den
    // Helligkeitsanteil 0,603, sein Blaukanal ist also schon bei einer
    // Leuchtdichte von 154 am Anschlag, lange bevor der Punkt selbst die
    // Grenze erreicht.
    //
    // Ein ueberlaufender Punkt BLEICHT deshalb nach Weisz aus, statt
    // heruntergeregelt zu werden. Das ist zugleich das Verhalten der
    // Referenz, deren hellste Punkte weisz sind, und das Verhalten von
    // additivem Licht ueberhaupt.
    //
    // Ein blosses Herunterskalieren aller drei Kanaele haelt zwar auch den
    // Farbton, deckelt aber die Leuchtdichte. Der Ton c225 traegt den
    // Helligkeitsanteil 0,603, ein solcher Punkt kaeme also nie ueber
    // 0,603 mal 255 plus Sockel gleich 189 hinaus; gemessen blieb das
    // 99. Perzentil dadurch bei 152,8 gegen die 170,8 der Referenz.
    //
    // Das Ausbleichen haelt den Farbton EXAKT, und zwar nachrechenbar:
    // nach dem Mischen ist der groeszte Kanal eins und der kleinste
    // r' = r/m + t(1 - r/m), also (r' - g') / (1 - r') = (r - g) / (m - r)
    // wie zuvor, weil sich der Faktor (1 - t) herauskuerzt. Der Farbton
    // haengt nur an diesem Verhaeltnis, die Saettigung dagegen faellt mit
    // wachsender Helligkeit.
    float m = max(max(rgb.r, rgb.g), rgb.b);
    if (m > 1.0) {
      float t = 1.0 - 1.0 / m;
      rgb = mix(rgb / m, vec3(1.0), t);
    }

    gl_FragColor = vec4(rgb, max(max(rgb.r, rgb.g), rgb.b));
  }
`;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DnaBand({
  className,
  opacity = 1,
}: Readonly<{ className?: string; opacity?: number }>) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useSafeReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const count = N_U * N_S;
    const aU = new Float32Array(count);
    const aS = new Float32Array(count);
    const aTone = new Float32Array(count);
    const aGain = new Float32Array(count);
    const aRow = new Float32Array(count);
    const aJit = new Float32Array(count);
    {
      const rand = mulberry32(20826);
      // Hier stand eine ZUFAELLIGE feste Phase je Bahn, die jede Bahn um
      // bis zu eine volle Sprossenweite gegen ihre Nachbarn verschob. Sie
      // sollte das zweidimensionale Gitter aufloesen, damit eine
      // Verschiebung laengs des Bandes das Gewebe nicht deckungsgleich auf
      // sich selbst abbildet.
      //
      // Sie war zugleich die Ursache des auffaelligsten Unterschieds zur
      // Referenz. Ein zufaelliger Versatz von bis zu einer Sprossenweite
      // zerstoert jede Ausrichtung zwischen benachbarten Bahnen, und ohne
      // diese Ausrichtung gibt es keine Kette quer ueber die Bahnen. Was
      // dann uebrig bleibt, ist genau das, was unser Gewebe gezeigt hat,
      // naemlich einzeln haengende senkrechte Perlenschnuere mit breiten
      // dunklen Gassen dazwischen.
      //
      // An ihre Stelle tritt der FESTE Versatz aus SHEAR. Er leistet
      // dasselbe fuer die Periodizitaet, denn auch er verschiebt jede Bahn
      // gegen ihre Nachbarn, tut es aber mit einem gleichmaeszigen Schritt
      // von 0,205 Sprossenweiten statt mit einer Zufallszahl. Damit
      // entsteht die diagonale Kette der Referenz. Die Sichtbarkeit der
      // Ruhebewegung haengt ohnehin nicht am Gitter, sondern daran, dass
      // aTone und aGain mit dem Punkt reisen und das Farbmuster deshalb
      // auch ueber einem stehenden Raster wandert.
      let k = 0;
      for (let i = 0; i < N_U; i += 1) {
        // Nenner N_U statt N_U - 1, siehe die Begruendung oben bei den
        // Sprossenzahlen: sonst faellt die letzte Sprosse nach dem Umlauf
        // auf die erste und laeuft als doppelt gezeichneter heller Strich
        // durchs Gewebe.
        const u = i / N_U;
        // DER VERSATZ GEGEN DAS RASTER WIRD JE REIHE GEZOGEN.
        //
        // Er stand bis hierher je PUNKT und war damit die zweite Ursache
        // dafuer, dass unser Gewebe als Rauschen las statt als Schar von
        // Faeden. Eine Reihe ist die Kette, entlang der die Punkte
        // zusammenlaufen; ein eigener Wurf je Punkt verbiegt genau diese
        // Kette und loest sie auf, noch bevor die Scherung sie bilden kann.
        // Gemessen zeigte der kuerzeste Gittervektor unseres Standes an
        // vier Meszstellen die Richtungen minus 91,7 / minus 61,1 / minus
        // 138,4 / minus 85,7 Grad bei einer Autokorrelation von 0,12 bis
        // 0,22, waehrend die Referenz an denselben Stellen einheitlich
        // minus 162,1 / minus 160,2 / minus 161,0 / minus 166,0 Grad bei
        // 0,44 bis 0,54 liefert.
        //
        // Der BETRAG bleibt derselbe wie zuvor, naemlich hoechstens ein
        // Zehntel einer Sprossenweite. Er verhindert weiterhin, dass das
        // Raster gegen das Bildschirmraster zu einem Karomuster
        // ausschlaegt, verschiebt jetzt aber die ganze Reihe als Einheit
        // und laeszt die Kette dabei gerade.
        const jU = (rand() - 0.5) * 0.2;
        // Das langwellige Helligkeitsfeld, siehe die ausfuehrliche
        // Begruendung unten bei aGain. Der Anteil der Reihe wird hier
        // einmal gerechnet, damit alle Punkte einer Reihe denselben
        // Untergrund tragen.
        const feldU = 2 * Math.PI * u;
        for (let j = 0; j < N_S; j += 1) {
          // Quer zur Sprosse. Die Verteilung draengt sich zu den
          // Straengen hin, dort sitzt in der Referenz das meiste Licht.
          // DER NENNER IST N_S UND NICHT MEHR N_S MINUS EINS, UND DAS IST DIE
          // VORAUSSETZUNG DER QUERBEWEGUNG. Mit dem alten Nenner lief die
          // Spaltennummer von minus eins BIS EINSCHLIESZLICH plus eins, die
          // erste und die letzte Spalte lagen also auf denselben beiden Enden
          // derselben Sprosse. Solange die Querkoordinate feststand, war das
          // richtig, denn beide Enden gehoeren zur Flaeche. Sobald die Spalten
          // aber quer ueber das Band wandern und dabei umlaufen, faellt die
          // letzte Spalte nach dem Umlauf genau auf die erste und liefe als
          // doppelt gezeichnete helle Kante mit. Es ist derselbe Grund, aus
          // dem die Sprossen weiter oben ueber N_U statt ueber N_U minus eins
          // gebildet werden.
          //
          // Der Spaltenabstand bleibt dabei genau derselbe, naemlich zwei
          // geteilt durch N_S minus eins beim alten Nenner mit N_S gleich 77
          // und zwei geteilt durch N_S beim neuen mit N_S gleich 56. Der
          // Zahlenwert der Teilung ist mit dem neuen N_S eingestellt.
          const raw = j / N_S - 0.5;
          const s = raw * 2;
          // DER VERSATZ QUER ZUR REIHE IST ERSATZLOS ENTFALLEN.
          //
          // Er stand bei hoechstens 0,15 Spaltenweiten, also 0,37
          // Bildpunkten unseres Maszstabs, und verschob jeden Punkt einer
          // Reihe einzeln laengs der Reihe. Die Referenz haelt den Abstand
          // zweier Punkte laengs derselben Reihe dagegen ueberall gleich;
          // in der Achtfachvergroeszerung ihres oberen Lappens stehen die
          // Perlen einer Kette wie aufgefaedelt, waehrend bei uns an
          // derselben Stelle jeder Punkt fuer sich sasz.
          //
          // Der Zweck des Versatzes, naemlich das Karomuster gegen das
          // Bildschirmraster zu brechen, wird vom Reihenversatz weiter
          // oben allein getragen. Er genuegt dafuer, weil die Schwebung
          // zwischen Rasterweite und Bildschirmraster eine Frage der
          // Regelmaeszigkeit des Reihenabstands ist und nicht der Lage der
          // einzelnen Perle auf ihrer Reihe.
          // Die Scherung selbst steht NICHT hier, sondern im Shader. Sie
          // haengt an der geometrischen Bandkoordinate und muss deshalb
          // an der Stelle greifen, an der ein Punkt gerade steht, und
          // nicht an der, an der er losgelaufen ist. Stuende sie im
          // Attribut, wuerde die Kaemmrichtung des oberen Lappens mit dem
          // Flusz nach unten wandern und dort nach einigen Minuten die des
          // unteren ersetzen.
          aU[k] = u + jU / N_U;
          aS[k] = s;
          aTone[k] = rand();
          // DIE EINZELHELLIGKEIT WIRD NICHT MEHR JE PUNKT GEWUERFELT.
          //
          // Das ist die wichtigste Aenderung dieser Runde und der Grund
          // dafuer, dass das Gewebe ueberhaupt als Schar von Faeden liest.
          // Der Auftraggeber hat seine Nahaufnahme der Referenz neben
          // unseren Stand gelegt und drei Dinge festgestellt, die sich
          // allesamt nachmessen lassen: bei der Referenz sind alle Punkte
          // gleich grosz, alle Punkte ungefaehr gleich hell, und was sich
          // aendert, ist allein die FARBE, naemlich Blau und Rosa im
          // Wechsel auf derselben Reihe.
          //
          // Bei uns stand hier 0,15 plus 2,9 mal einer Zufallszahl in der
          // zweieinhalbten Potenz, also ein Wert zwischen 0,15 und 3,05,
          // unabhaengig fuer jeden Punkt gezogen. Zwei benachbarte Perlen
          // derselben Kette konnten damit um den Faktor zwanzig
          // auseinanderliegen. Weil ein heller Punkt seinen Kern ueber
          // einen groeszeren Halbmesser bis an die Begrenzung treibt,
          // erscheint er zugleich GROESZER, und so entstand aus einer
          // Streuung der Helligkeit auch noch eine Streuung der Groesze.
          //
          // Gemessen ist der Schaden am kuerzesten Gittervektor. An vier
          // Meszstellen zeigte er bei uns in die Richtungen minus 91,7 /
          // minus 61,1 / minus 138,4 / minus 85,7 Grad, streute also ueber
          // 77 Grad, bei einer Autokorrelation von nur 0,12 bis 0,22. Die
          // Referenz liefert an denselben Stellen einheitlich minus 162,1 /
          // minus 160,2 / minus 161,0 / minus 166,0 Grad bei 0,44 bis 0,54.
          // Unser Gitter war also nicht etwa falsch ausgerichtet, es war
          // ueberhaupt nicht mehr messbar, weil unabhaengig gewuerfelte
          // Einzelhelligkeiten jede Fernkorrelation ausloeschen.
          //
          // An die Stelle des Wurfes tritt ein GLATTES LANGWELLIGES FELD
          // ueber die Flaeche. Es haengt an der Bandkoordinate der Reihe
          // und an der Querkoordinate, benachbarte Perlen derselben Reihe
          // tragen also fast denselben Wert und die Kette bleibt als Kette
          // sichtbar. Drei Sinusanteile genuegen; sie sind in der
          // Bandkoordinate periodisch, weil das Band endlos ist und ein
          // nicht periodisches Feld an der Wickelstelle einen sichtbaren
          // Sprung erzeugen wuerde.
          //
          // Der MITTELWERT bleibt bei 0,98 und damit genau dort, wo er
          // seit drei Runden steht. An ihm haengt die Engstelle, wo
          // Dutzende Punkte uebereinanderliegen und ihre Summe dem
          // Mittelwert folgt und nicht der Streuung. Die Standardabweichung
          // faellt von 0,86 auf 0,16, die Spanne von 0,15 bis 3,05 auf
          // 0,60 bis 1,36.
          //
          // Es folgt der frueher hier stehende Text, damit niemand die
          // damalige Begruendung fuer noch gueltig haelt.
          // Die Streuung der Einzelhelligkeit war gleichmaeszig von 0,50
          // bis 1,46 verteilt und ist jetzt quadratisch von 0,20 bis 2,55.
          // Der MITTELWERT bleibt dabei mit 0,983 gegen 0,980 praktisch
          // gleich, die Verteilung wird allein breiter.
          //
          // Der Grund steht in der Perzentilleiter des oberen Lappens,
          // gemessen im Fenster 620,152,420,180 der Referenz und
          // 620,100,420,180 bei uns, beide ueber dem jeweiligen Sockel.
          // Die Referenz steht bei p50 gleich 14,1 / p75 gleich 23,1 /
          // p90 gleich 37,9 / p99 gleich 136,9 und erreicht 177,4, wir
          // standen bei 27,5 / 41,9 / 57,8 / 87,1 und erreichten 174,6.
          // Unser hoechster Wert traf also, unsere Mitte lag beim Doppelten
          // und unser oberes Prozent bei zwei Dritteln. Das Gewebe der
          // Referenz ist ueberwiegend fast erloschen und traegt sein Licht
          // in wenigen sehr hellen Punkten, unseres war durchgehend
          // mittelhell.
          //
          // Der Mittelwert darf sich dabei nicht aendern, denn an ihm
          // haengt die Engstelle. Dort liegen Dutzende Punkte
          // uebereinander, ihre Summe folgt dem Mittelwert und nicht der
          // Streuung, und das 99,9. Perzentil steht dort bereits an der
          // Grenze von 220.
          // Die Streuung ist ein zweites Mal steiler geworden, naemlich von
          // der zweiten auf die zweieinhalbte Potenz, und der MITTELWERT
          // bleibt dabei wieder erhalten: 0,15 plus 2,90 geteilt durch 3,5
          // ergibt 0,979 gegen die 0,983 der quadratischen Fassung. An dem
          // Mittelwert haengt die Engstelle, wo Dutzende Punkte
          // uebereinanderliegen und ihre Summe dem Mittelwert folgt.
          //
          // Die dritte Potenz ist gebaut und wieder verworfen worden. Sie
          // traf die Perzentilleiter besser, trieb den hoechsten Wert je
          // Punkt aber auf 3,65 und damit so viele Punkte ueber die
          // Begrenzung im Fragment-Shader, dass der Weiszanteil der
          // leuchtenden Punkte von 1,0 auf 1,8 Prozent stieg und die
          // Saettigung von 0,46 auf 0,43 fiel. Beide Zahlen stehen unter
          // Bestandsschutz. Mit der zweieinhalbten Potenz liegt der
          // hoechste Wert bei 3,05 und beide Zahlen bleiben stehen.
          //
          // Der Grund steht in der Perzentilleiter des oberen Lappens,
          // gemessen im Fenster 620,100,420,180 bei uns und 620,152,420,180
          // an f008, beide ueber dem jeweiligen Sockel. Die Referenz steht
          // bei p50 gleich 14,1 / p75 gleich 23,2 / p90 gleich 38,7 /
          // p95 gleich 53,6 / p99 gleich 137,1, wir standen bei 17,9 /
          // 33,7 / 61,2 / 84,3 / 128,9. Vom Mittelfeld bis ins obere
          // Zwanzigstel trugen wir also anderthalbmal so viel Licht wie
          // die Referenz, im obersten Prozent dagegen weniger. Ihr Gewebe
          // hat einen viel schaerferen Knick: zwischen p95 und p99 springt
          // es um den Faktor 2,6, unseres nur um 1,5.
          //
          // Genau dieser Ueberschusz im Mittelfeld ist es, der beim
          // Scrollen als flaechige Aufhellung auf die Textspalte faellt.
          // Die kubische Streuung nimmt ihn zurueck und gibt dasselbe
          // Licht den wenigen sehr hellen Punkten, wo die Referenz es
          // ebenfalls traegt.
          // Die drei Wellenlaengen sind bewusst ungleich und teilerfremd
          // gewaehlt, damit sich das Feld ueber die Periode nicht sichtbar
          // wiederholt. Der Anteil quer ueber das Band bleibt klein, denn
          // eine halbe Welle ueber die ganze Bandbreite ist bereits so
          // langsam, dass zwei benachbarte Perlen sich um weniger als ein
          // Prozent unterscheiden.
          // Ein Wuerfel je Punkt kommt zu dem glatten Feld hinzu. Er war
          // frueher da, ist entfernt worden und kehrt auf Wunsch des
          // Auftraggebers zurueck, weil ohne ihn jede Reihe genau dieselbe
          // Helligkeit traegt und das Gewebe deshalb zu gleichmaeszig und
          // zu technisch liest. Die Referenz zeigt in der Nahaufnahme
          // benachbarte Punkte von deutlich verschiedener Staerke.
          //
          // Die Form ist so gewaehlt, dass sie den MITTELWERT genau
          // erhaelt, denn an ihm haengt die Kreuzung, wo Dutzende Punkte
          // uebereinanderliegen und ihre Summe dem Mittelwert folgt und
          // nicht der Streuung. Der Mittelwert von r hoch 1,6 ueber dem
          // Einheitsintervall ist 1 geteilt durch 2,6 gleich 0,3846, also
          // ergibt 0,515 plus 1,26 mal 0,3846 genau 1,000.
          //
          // Die Potenz 1,6 macht die Verteilung zugleich SCHIEF, und das
          // ist der zweite Zweck. Die Referenz hat zwischen ihrem 95. und
          // ihrem 99. Perzentil einen Sprung um den Faktor 3,8, unser
          // Stand nur um 2,1; ihr Gewebe ist ueberwiegend schwach und
          // traegt sein Licht in wenigen hellen Punkten. Mit der Potenz
          // liegen zwei Drittel der Punkte unter dem Mittelwert und die
          // Spitze bei 1,775, ohne dass einzelne Ausreiszer die Begrenzung
          // im Fragment-Shader treiben und dort weisz ausbleichen.
          //
          // Die Potenz geht von 1,6 auf 2,6 und der Bodenwert von 0,515
          // auf 0,30. Der Anlasz ist die Perzentilleiter des ersten
          // Durchgangs, gemessen im Fenster 620,100,420,420 auf
          // Referenzmaszstab und jeweils ueber dem eigenen Sockel. Wir
          // standen bei p50 gleich 4,2 / p95 gleich 21,9 / p99 gleich
          // 68,6, die Referenz bei 1,9 / 25,5 / 96,7. Unsere Mitte lag
          // also beim Doppelten und unser oberes Prozent bei zwei
          // Dritteln; es fehlte nicht Licht, sondern GEFAELLE.
          //
          // Der Mittelwert bleibt dabei wieder genau erhalten, denn an ihm
          // haengt die Kreuzung. Der Mittelwert von r hoch 2,6 ueber dem
          // Einheitsintervall ist 1 geteilt durch 3,6 gleich 0,2778, also
          // ergibt 0,30 plus 2,52 mal 0,2778 genau 1,000. Der Mittelwert
          // der Verteilung faellt damit von 0,93 auf 0,72, waehrend die
          // Spitze von 1,78 auf 2,82 steigt.
          // Der Bodenwert geht von 0,30 auf 0,12 und die Potenz von 2,6
          // auf 5,6. Der Mittelwert bleibt dabei wieder genau erhalten,
          // denn an ihm haengt die Kreuzung: der Mittelwert von r hoch 5,6
          // ueber dem Einheitsintervall ist 1 geteilt durch 6,6, also
          // ergibt 0,12 plus 5,808 mal 0,15152 genau 1,000.
          //
          // Der Anlasz ist das obere Ende der Perzentilleiter. Die
          // steilere Kernflanke nimmt der Struktur ihr Mittelfeld, sie
          // nimmt ihr aber auch die Spitzen, weil ein Bildpunkt des
          // Referenzmaszstabes ueber 1,77 Bildpunkte des Rohbildes
          // mittelt und ein schmalerer Kern dabei mehr verliert. Am
          // Modell fiel das 99. Perzentil durch die Potenz allein von 54,7
          // auf 31,1 Stufen, waehrend die Vorgabe zwischen 85 und 100
          // liegt.
          //
          // Der BODENWERT ist dabei der eigentliche Griff und nicht die
          // Potenz. Er sorgte dafuer, dass auch der schwaechste Punkt noch
          // dreiszig Prozent des Mittels trug, und weil das Gitter mit
          // einer Zellflaeche von 16,4 Bildpunkten sehr fein steht, hielt
          // dieser Boden das ganze Feld auf einer gleichmaeszigen
          // Grundhelligkeit. Die Referenz macht es umgekehrt: sie traegt
          // ihr Licht bei einer Zellflaeche von 90 Bildpunkten in wenigen
          // hellen Punkten, gemessen in 177 Gebieten von im Mittel 27,4
          // Bildpunkten, waehrend wir 3163 Gebiete von 2,53 Bildpunkten
          // hatten. Bei fuenfeinhalbfacher Punktdichte laeszt sich ihre
          // Verteilung nur nachbilden, wenn die meisten Punkte beinahe
          // erloschen sind und wenige sehr hell stehen.
          //
          // Der Bodenwert steht jetzt bei 0,08 und die Potenz bei 12, und
          // beide sind an einer MESSUNG DER REFERENZ gesetzt und nicht
          // mehr am Modell. Gesucht wurde die Verteilung der
          // Punkthelligkeit selbst, gewonnen aus den oertlichen
          // Hoechstwerten eines Gewebefensters ueber dessen Sockel.
          //
          // Die Referenz traegt in v012 auf Seitenmaszstab p10 gleich 2,0
          // / p50 gleich 3,7 / p90 gleich 12,7 / p99 gleich 130,0 und als
          // Hoechstwert 152,8 Stufen. Ihr hellster Punkt steht also beim
          // 41-fachen ihres mittleren. Wir standen vor dieser Runde bei
          // 20,4 / 54,1 / 113,2 / 143,2 / 189,4 und damit beim 3,5-fachen,
          // nach dem ersten Schritt beim 6,2-fachen. Die Referenz traegt
          // ihr Licht in wenigen Punkten, waehrend bei uns beinahe jeder
          // Punkt gleich hell stand; genau das ist mit dem staerkeren
          // Buendeln gemeint.
          //
          // Der Mittelwert bleibt auch hier genau erhalten, denn an ihm
          // haengt die Kreuzung. Der Mittelwert von r hoch 12 ueber dem
          // Einheitsintervall ist 1 geteilt durch 13, also ergibt 0,08
          // plus 11,96 mal 0,076923 genau 1,000.
          //
          // Der BODENWERT von 0,08 ist dabei die Schranke nach unten und
          // sorgt dafuer, dass auch der schwaechste Punkt seine Reihe noch
          // mittraegt. Ohne ihn zerfiele das Gewebe in einzelne Funken,
          // und der Auftrag verlangt ausdruecklich saubere Reihen. Die
          // Referenz haelt dieselbe Schranke, ihr zehntes Perzentil liegt
          // mit 2,0 Stufen deutlich ueber null.
          //
          // Die Potenz steht am Ende bei 8 und der Bodenwert bei 0,12, und
          // dieser Wert ist gegen einen Fehlschlag abgegrenzt, der am
          // Bild und nicht an den Zahlen sichtbar wurde.
          //
          // Zwei Zwischenstaende gingen deutlich weiter, naemlich auf die
          // Potenz 12 und auf die Potenz 16 bei einem Bodenwert von 0,08.
          // Sie trafen die Perzentilvorgabe besser als jeder andere
          // Stand, fuenf von sieben Zielwerten lagen bei der Potenz 16 im
          // Fenster. Am gerenderten Bild aber war das Gewebe kein Gewebe
          // mehr: die Reihen loesten sich in einzelne helle Funken auf,
          // weil die Haelfte aller Punkte unter die Sichtbarkeit fiel.
          // Der Auftrag verlangt ausdruecklich saubere Reihen.
          //
          // Nachweisbar ist der Fehlschlag an der Streuung der
          // Punkthelligkeit selbst, gemessen ueber die oertlichen
          // Hoechstwerte eines Gewebefensters. Die Referenz traegt dort
          // ein Verhaeltnis des 90. zum 50. Perzentil von 3,70. Wir lagen
          // vor dieser Runde bei 2,12, mit der Potenz 5,6 bei 3,95, mit
          // der Potenz 12 bei 11,87 und mit der Potenz 16 bei 21,11. Die
          // beiden letzten Staende streuen also das Fuenf- bis
          // Sechsfache der Referenz, und genau das sieht man als
          // Aufloesung der Reihen. Die Potenz 8 haelt dieses Verhaeltnis
          // in der Naehe der Referenz und nimmt dafuer in Kauf, dass das
          // 99. Perzentil des Fensters unter seiner Vorgabe bleibt.
          //
          // Der Mittelwert bleibt genau erhalten. Der Mittelwert von r
          // hoch 8 ist 1 geteilt durch 9, also ergibt 0,12 plus 7,92 mal
          // 0,11111 genau 1,000. Der Mittelwert der Verteilung faellt
          // damit von 0,72 auf 0,151 und die Spitze steigt von 2,82 auf
          // 8,04.
          // DIE STREUUNG DER EINZELHELLIGKEIT WIRD FLACH, und das ist die
          // wichtigste Aenderung dieses Durchgangs ueberhaupt.
          //
          // Alles oben Stehende ist an VIDEOBILDERN abgenommen worden, und
          // das Video taugt dafuer nicht. Seine Kompression zieht ruhige
          // Flaechen zusammen und laeszt einzelne helle Punkte stehen; eine
          // daraus abgelesene Streuung faellt zwangslaeufig zu grosz aus.
          // Genau derselbe Fehler ist fuer die Farbe schon einmal gemacht
          // worden.
          //
          // An der LIVE aufgenommenen Referenz gemessen, mit
          // _ref2/mess/gipfelprofil.mjs im Fenster 1050,160,180,180, liegt
          // ihr mittlerer Einzelgipfel bei 31,3 Stufen und ihr 90.
          // Perzentil bei 52,2. Das Verhaeltnis betraegt also 1,67 und
          // nicht die 3,70, gegen die hier eingestellt worden ist. Unser
          // Stand lag mit derselben Messung bei 13,8 gegen 138,0 und damit
          // bei 10,0.
          //
          // Im Bild ist der Unterschied nicht zu uebersehen. Bei
          // zwoelffacher Vergroeszerung zeigt die Referenz viele kleine
          // Punkte gleicher Groesze und Helligkeit in sauberen Reihen,
          // waehrend bei uns eine Handvoll riesiger weiszer Klumpen ueber
          // einem kaum sichtbaren feinen Gitter stand. Die Potenz acht
          // laeszt den hellsten Punkt beim 67-fachen des schwaechsten
          // stehen; das sind diese Klumpen, und sie sind der eigentliche
          // Grund dafuer, dass unser Gewebe als Sprenkelfeld liest.
          //
          // Die neue Verteilung ist auf das Verhaeltnis 1,60 gerechnet.
          // Mit 0,67 plus 0,98 mal dem Quadrat einer Gleichverteilung
          // liegt der Mittelwert bei 0,67 plus 0,98 geteilt durch drei
          // gleich 1,00, das 50. Perzentil bei 0,92 und das 90. bei 1,47.
          // DER MITTELWERT BLEIBT ALSO WEITERHIN GENAU EINS, an ihm haengt
          // die Kreuzung, und der Bestandsschutz dieser Groesze gilt
          // unveraendert.
          const wuerfel = 0.67 + 0.98 * Math.pow(rand(), 2.0);
          aGain[k] =
            0.98 *
            wuerfel *
            (1 +
              0.16 * Math.sin(3 * feldU + 1.13) +
              0.13 * Math.sin(2 * feldU + 2.3 * s + 0.41) +
              0.1 * Math.sin(feldU + 1.7 * s + 5.02));
          aRow[k] = i;
          // Die beiden Streuwerte gegen das Moire. Sie werden EINMAL beim
          // Bau des Gitters gewuerfelt und reisen danach mit dem Punkt,
          // stehen also ueber die Zeit fest. Ein je Bild neu gewuerfelter
          // Versatz waere ein Flimmern und wuerde den Nachweis des
          // Stillstands in Ruhe zerstoeren.
          aJit[k] = Math.floor(rand() * 1024) + Math.min(0.999, rand());

          k += 1;
        }
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    geom.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
    geom.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
    geom.setAttribute("aTone", new THREE.BufferAttribute(aTone, 1));
    geom.setAttribute("aGain", new THREE.BufferAttribute(aGain, 1));
    geom.setAttribute("aRow", new THREE.BufferAttribute(aRow, 1));
    geom.setAttribute("aJit", new THREE.BufferAttribute(aJit, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      // Eins zu eins in BEIDEN Kanaelen. THREE.AdditiveBlending nimmt fuer
      // die Farbe das Quellalpha als Faktor; da der Fragment-Shader schon
      // vormultipliziert ausgibt, wuerde die Helligkeit dabei ein zweites
      // Mal mit sich selbst multipliziert und das Gewebe fiele quadratisch
      // dunkel aus. Und der Alphakanal muss ebenso aufsummiert werden,
      // sonst traegt eine Stelle mit zwei uebereinanderliegenden Punkten
      // zwar doppelte Farbe, aber nur einfache Deckung.
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
      uniforms: {
        uFlow: { value: 0 },
        uSpin: { value: 0 },
        uTravel: { value: 0 },
        uSpann: { value: SPANN },
        uSize: { value: new THREE.Vector2(1, 1) },
        uCenterPx: { value: new THREE.Vector2(0, 0) },
        uUnit: { value: 300 },
        uPointSize: { value: 3 },
        uJitter: { value: 0.5 },
        uStride: { value: new THREE.Vector2(1, 1) },
        uGrob: { value: new THREE.Vector2(2, 2) },
        uRelief: { value: 1 },
        uOpacity: { value: opacity },
      },
    });

    const points = new THREE.Points(geom, material);
    scene.add(points);

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    // Der Flusz zerfaellt in zwei Summanden, weil er an zwei ganz
    // verschiedenen Groeszen haengt. zeitFlow sammelt die verstrichene Zeit
    // auf und traegt die Eigendrehung in Ruhe; wegFlow ist eine reine
    // Funktion des Scrollstandes und traegt die Drehung, die der Nutzer mit
    // der Scrollgeste selbst erzeugt. Zusammengezaehlt ergeben sie das
    // Uniform uFlow, und diese Aufteilung ist genau die der Referenz, die
    // ihre rotation.y ebenfalls aus einem Zeitanteil und einem
    // Scrollanteil zusammensetzt.
    let zeitFlow = 0;
    // Der Umlauf quer ueber das Band. Er laeuft allein mit der Zeit und nicht
    // mit dem Scrollweg, denn er soll die Drehung tragen, die der Betrachter
    // bei ruhender Seite sieht.
    let spin = 0;
    let wegFlow = 0;
    let travel = 0;
    // Die Periodenlaenge in Bildpunkten. Sie ist der Umrechnungsfaktor
    // zwischen dem Scrollweg der Seite und dem Weltversatz der Struktur
    // und wird bei jeder Groeszenaenderung neu bestimmt.
    let periodePx = 1;
    let lastNow = performance.now();

    // Die Zone traegt den Bezugspunkt des Mitlaufs. Ihre Oberkante ist
    // zugleich die Oberkante der Marketing-Sektion, und genau auf diese
    // Stelle setzen sich alle Meszskripte. Beim Scrollstand der Oberkante
    // steht der Weltversatz deshalb auf null und das Bild zeigt die
    // abgenommene Ruhelage.
    const zone = host.parentElement?.parentElement ?? null;

    // Der Scrollweg wird bei JEDEM Bild aus der lebenden Lage der Zone
    // gelesen und nicht aus einem gemerkten Dokumentversatz. Waehrend die
    // Bilder oberhalb der Sektion nachladen, waechst der Inhalt ueber ihr
    // und schiebt sie im Dokument nach unten; ein gemerkter Wert wuerde
    // dabei veralten und die Struktur um mehr als hundert Bildpunkte
    // springen lassen.
    const wegMessen = () => {
      if (!zone) return window.scrollY || document.documentElement.scrollTop;
      return -zone.getBoundingClientRect().top;
    };

    // Der Weltversatz in Perioden. Er haengt am SCROLLWEG und traegt
    // deshalb ein Vorzeichen, kehrt sich beim Zurueckscrollen also um.
    //
    // Gefaltet wird auf zwei Perioden und nicht auf eine. Das Bild ist
    // naemlich erst nach ZWEI Perioden wieder Bildpunkt fuer Bildpunkt
    // dasselbe. Nach einer Periode stimmt die Flaeche zwar ueberein, weil
    // ein um PI verdrehter Streifen mit sich selbst zusammenfaellt, die
    // Normale zeigt dabei aber in die Gegenrichtung und der Faktor fuer
    // die abgewandte Seite tauscht die beiden Lappen. Nach zwei Perioden
    // legt die Verdrehung volle 2 PI zu und alles stimmt wieder exakt.
    // Die Faltung haelt den Winkel klein genug, dass die einfache
    // Genauigkeit der Grafikkarte ihn auf einer beliebig langen Seite
    // sauber traegt.
    //
    // Gerundet wird zur NAECHSTEN geraden Zahl und nicht abgerundet. Der
    // Unterschied entscheidet darueber, WO die Faltstelle liegt. Beim
    // Abrunden liegt sie beim Weltversatz null und damit genau am
    // Scrollstand der Sektionsoberkante, also mitten in der Zone; beim
    // Runden liegt sie bei plus und minus einer Periode und damit 4093
    // Bildpunkte Scrollweg von der Oberkante entfernt. Die Struktur ist
    // hoechstens ueber 1688 Bildpunkte Scrollweg zu sehen, die Faltstelle
    // liegt also mit groszem Abstand auszerhalb.
    //
    // Rechnerisch ist die Faltung an beiden Stellen unsichtbar, denn das
    // Bild wiederholt sich exakt. Sie ist trotzdem hinausgelegt, weil sie
    // die einzige Stelle im ganzen Aufbau ist, an der ein spaeterer
    // Eingriff einen sichtbaren Sprung erzeugen koennte. Wer den Ausklang
    // wieder an die Weltlage haengt oder die Verdrehung je Periode von PI
    // wegnimmt, bricht die Zweiperiodizitaet, und dann faellt es lieber
    // weit auszerhalb der Zone auf als in ihrer Mitte.
    //
    // GEFALTET WIRD AUF SECHZEHN PERIODEN UND NICHT MEHR AUF ZWEI, denn die
    // Annahme, das Bild wiederhole sich nach zwei Perioden exakt, TRIFFT
    // NICHT. Sie setzt eine Verdrehung von PI je Periode voraus; unsere
    // betraegt DRALL mal uSpann gleich 3,45 Bogenmasz, zwei Perioden tragen
    // also 6,90 statt 6,283 und die Faltstelle ist ein Sprung von 0,617
    // Bogenmasz, was einem Versatz der Kreuzung um rund dreihundert
    // Bildpunkte entspricht. Eine Faltbreite, die sauber trifft, gibt es
    // nicht, denn PI geteilt durch 3,45 ist 0,9106 und kein Bruch aus
    // kleinen ganzen Zahlen; die Faltstelle musz deshalb weit aus der Zone
    // hinaus.
    //
    // Mit zwei Perioden lag sie bei einem Rohwert von eins und damit bei
    // 1706,3 geteilt durch 0,30 gleich 5688 Bildpunkten Scrollweg. Der Weg
    // erreicht am Fuszende des Dokumentes 9176 Bildpunkte, die Faltstelle
    // lag also im erreichbaren Bereich und nur knapp jenseits der Zone, die
    // bei 5004 endet. Sechzehn Perioden legen sie auf einen Rohwert von acht
    // und damit auf 45 500 Bildpunkte, und damit ist sie unerreichbar.
    //
    // Der Genauigkeit schadet die groeszere Faltbreite nicht. Der Betrag
    // des Versatzes bleibt unter acht, die einfache Genauigkeit der
    // Grafikkarte loest davon noch 5e-7 einer Periode auf, und das sind
    // weniger als ein Tausendstel Bildpunkt.
    const versatzSetzen = () => {
      const weg = wegMessen();
      const roh = (MITLAUF * weg) / periodePx;
      travel = roh - 16 * Math.round(roh / 16);
      // Der Scrollanteil der Drehung haengt am SELBEN gemessenen Weg wie
      // die Parallaxe und wird deshalb hier gleich mitgesetzt. Beide
      // kehren sich damit gemeinsam um, sobald der Nutzer zurueckscrollt,
      // und die Geste wirkt zurueckgespult statt hakelig.
      //
      // Gefaltet wird auf eine Periode, denn im Flusz steckt keine
      // Verdrehung; das Muster wiederholt sich hier bereits nach einer
      // Periode exakt. Die Faltung haelt die Zahl klein genug, dass die
      // einfache Genauigkeit der Grafikkarte sie auf einer beliebig langen
      // Seite sauber traegt.
      const drall = SCROLL_DREH * weg;
      wegFlow = drall - Math.round(drall);
    };

    const draw = () => {
      // Der Flusz laeszt die Punkte durch das Muster laufen, der
      // Weltversatz schiebt das Muster durch das Fenster. Beide tragen
      // jetzt ein Vorzeichen, denn beide haengen am Scrollweg.
      material.uniforms.uFlow.value = zeitFlow + wegFlow;
      material.uniforms.uTravel.value = travel;
      renderer.render(scene, camera);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      material.uniforms.uSize.value.set(width, height);
      // Die Struktur steht in der RECHTEN Bildhaelfte und laeuft oben
      // und unten hinaus. Nachgemessen an der Referenz sitzt die Achse
      // bei 74 Prozent der Bildbreite; das Gewebe beginnt bei knapp 52
      // Prozent, links davon liegt nur noch der Schleier der Maske.
      // Die Hoehe stand auf 0,47. Gemessen sasz die Engstelle damit bei
      // 45,8 Prozent der Bildhoehe und rutschte mit der Drehlage bis auf
      // 41,8; die Referenz haelt sie ueber alle Ruhebilder hinweg bei
      // 52,6 bis 53,2.
      //
      // Der Wert stand auf 0,54 und das war eine reine Gegenrechnung: die
      // Blickwinkel-Taille wanderte mit der Drehlage nach oben vom festen
      // Materialkneifpunkt weg, deshalb musste der Kneifpunkt tiefer
      // sitzen, damit die WANDERNDE Taille im abgenommenen Fenster blieb.
      // Seit die Drehlage feststeht, fallen beide Taillen dauerhaft
      // aufeinander und der Wert laeszt sich direkt ausrechnen.
      //
      // Die Vorgabe lautet 52 Prozent, gemessen von hals.mjs im Fenster
      // 440,0,660,650 auf dem auf Referenzmaszstab gebrachten Bild. 52
      // Prozent von 650 sind 338 Bildpunkte unter der Oberkante; geteilt
      // durch den Maszstabsfaktor 1085/1425 = 0,7614 sind das 444 unserer
      // eigenen Bildpunkte, bei 900 Bildpunkten Fensterhoehe also 0,493.
      // Auf dem Telefon rueckt die Achse von 74 auf 86 Prozent der Breite.
      // Der Grund ist eine Messung bei 390 mal 844. Dort steht die
      // Textspalte ueber die volle Breite, und der Grund hinter dem
      // Einleitungsabsatz erreichte schon bei Versatz null einen
      // Hoechstwert von 241 bei einer Streuung von 25,5, bei Versatz 1400
      // trugen sechs Zeilen Hoechstwerte von 244 bis 255. Das Gewebe
      // reichte dabei bis auf 45 Prozent der Breite herein.
      // Auf einem breiten Schirm laeuft die Textspalte nur bis zur Achse
      // und links davon ist Platz; auf einem schmalen gibt es diesen Platz
      // nicht, also musz die Struktur selbst an den Rand ruecken. Der
      // Saumfaktor im Vertex-Shader haengt an dieser Achse und wandert
      // deshalb von selbst mit, er braucht keine eigene Fallunterscheidung.
      // ES BLEIBT BEI 74 PROZENT. Ein Zwischenstand hatte die Achse auf
      // 80 Prozent geschoben, weil die Struktur zu weit in den Text zu
      // reichen schien. Der Auftraggeber hat das zurueckgenommen; der
      // Eindruck stammte aus einer Ansicht in einem anderen Format.
      const achseX = width <= 640 ? 0.86 : 0.74;
      material.uniforms.uCenterPx.value.set(width * achseX, height * 0.493);
      // Der Maszstab war an die HOEHE gebunden. Auf breiten Schirmen zog
      // die Struktur dadurch ueber die ganze Bildbreite. Die Breite ist
      // hier die bindende Groesze: RADIUS * uUnit ist die halbe
      // Bandbreite in Bildpunkten. Nach unten haelt die Hoehe dagegen —
      // auf einem Telefon waere die Struktur sonst eine Briefmarke am
      // rechten Rand.
      //
      // Der Breitenanteil lag bei 0,105 und ist auf 0,090 zurueck. Bei
      // 0,105 stand uUnit auf 151,2 und die halbe Bandbreite erreichte
      // ueber die Fluchtung bis zu 1,17 * RADIUS * uUnit = 407
      // Bildpunkte; von der Achse bei 0,74 * 1440 = 1066 aus reicht das
      // bis 1473 und damit ueber die 1425 Bildpunkte Seitenbreite hinaus.
      // Nachgemessen stand die rechte Gewebekante deshalb in JEDER
      // Zellzeile bei 97,6 Prozent des Meszfensters, also am Bildrand. Ein
      // am Rand abgeschnittenes Gewebe hat kein auswertbares Breitenprofil
      // mehr: hals.mjs und kante.mjs fanden ihre Taille daraufhin bei 43
      // bis 48 Prozent statt an der wirklichen Engstelle bei 54, und die
      // Oeffnungswinkel kamen mit 9 bis 19 Grad heraus. Mit 0,090 steht
      // uUnit auf 129,6, die aeuszerste Kante bei 1066 + 349 = 1415 und
      // bleibt damit knapp innerhalb der Seite — so wie in der Referenz,
      // deren Gewebe oben bis 96 Prozent der Seitenbreite reicht.
      // Die UNTERGRENZE stand bei 0,11 der Hoehe und war auf einem
      // Telefon der Fehler. Bei 390 mal 844 liefert width * 0,09 nur 35,1,
      // die Untergrenze greift also und setzt uUnit auf 92,8. Die halbe
      // Bandbreite ist RADIUS * uUnit gleich 213 Bildpunkte, die volle
      // damit 426 auf einem 390 Bildpunkte breiten Schirm. Sichtbar wurde
      // das daran, dass der Ring mit der Kennzahl 1 von einer harten
      // hellen Kante halbiert wurde und wie eine angebissene Scheibe
      // aussah.
      // Mit 0,075 steht uUnit auf 63,3, die halbe Bandbreite bei 145,6 und
      // die volle bei 291 und bleibt damit innerhalb der 390.
      const unit = Math.max(
        // Der Auftraggeber will die Kamera deutlich naeher an der Struktur,
        // sodass sie ueber den Bildrand hinausreicht und man einen Ausschnitt
        // eines groszen Koerpers sieht statt eines vollstaendig sichtbaren
        // Objektes. Die beiden Deckel standen bei 0,145 und 0,09 und liefen
        // bei 1440 mal 900 auf 129,6 hinaus, was die Struktur als
        // freistehendes Gebilde in der rechten Bildhaelfte zeigte.
        height * 0.075,
        // DIE BEIDEN DECKEL GEHEN VON 0,17 UND 0,105 AUF 0,146 UND 0,0903,
        // UND DAMIT WIRD DER PREIS DOCH FAELLIG, DEN DER AUFTRAGGEBER SCHON
        // EINMAL ANGEBOTEN HAT. Er zahlt ihn jetzt nicht mehr fuer zwei
        // gleiche Kreuzungen, denn die stehen und bleiben stehen, sondern
        // fuer die Dichte des Bildes. Seine Beanstandung lautet, die Struktur
        // sehe sehr weit auseinandergezogen aus und solle einen Ticken mehr
        // zusammengedrueckt werden, und die Engstelle solle dabei duenner
        // werden.
        //
        // Der Maszstab ist dafuer der sichere Hebel. Bei 1440 mal 900 bindet
        // die Breite, uUnit faellt damit von 151,2 auf 130,0 und das Fenster
        // zeigt statt 0,522 Perioden deren 0,607, bringt also ein Sechstel
        // mehr Welthoehe ins Bild. Die Engstelle folgt der Beziehung
        // RADIUS zum Quadrat mal uUnit mal DRALL mal tan(TILT) und faellt im
        // selben Verhaeltnis auf das 0,860-fache. Beide Wuensche des
        // Auftraggebers haengen damit an derselben Zahl und ziehen in
        // dieselbe Richtung.
        //
        // Der zweite angebotene Weg ist gerechnet und verworfen worden. Er
        // haette DRALL gehoben und SPANN im Kehrwert gesenkt, haette also das
        // Produkt DRALL mal SPANN gehalten und die Kreuzungen im Bild naeher
        // zusammengerueckt. Er scheitert an zwei Stellen. Die Engstelle waere
        // um denselben Faktor BREITER geworden, mit dem DRALL steigt, und
        // genau das Gegenteil ist verlangt. Und eine kuerzere Periode schiebt
        // die Sprossen zusammen, weil sich die N_U mal N_S Punkte stets auf
        // genau eine Periodenlaenge verteilen; derselbe Versuch ist schon
        // einmal an der gemessenen Punktdichte gescheitert, die Begruendung
        // steht bei SPANN.
        //
        // Der frueher hier stehende Vermerk, die Deckel blieben bei 0,17 und
        // 0,105, ist damit ueberholt. Richtig bleibt an ihm, dass die
        // Ungleichheit der beiden Kreuzungen in der Scherung sasz und ueber
        // DRALL geloest ist. Der Maszstab hat damit nichts zu tun und ruehrt
        // deshalb auch jetzt nicht daran, denn er kuerzt sich aus der
        // Bedingung DRALL mal uSpann gleich PI geteilt durch 1,5 vollstaendig
        // heraus. Der aeltere Versuch mit 0,158 und 0,0976 blieb ohne
        // Wirkung, weil er die falsche Frage beantworten sollte.
        //
        // Die Untergrenze von 0,075 der Hoehe bleibt unberuehrt. Auf einem
        // Telefon mit 390 mal 844 liefert width mal 0,0903 nur 35,2, die
        // Untergrenze greift dort also ohnehin und setzt uUnit unveraendert
        // auf 63,3.
        Math.min(height * 0.146, width * 0.0903),
      );
      material.uniforms.uUnit.value = unit;
      // Bei 3,3 lagen zwischen den Punkten schwarze Luecken. Die
      // Autokorrelation im 420er Fenster fiel bei Versatz drei bis vier
      // Bildpunkten sogar unter null und lag bei Versatz zwoelf bei
      // 0,21 gegen 0,57 der Referenz; das las als Halbton, nicht als
      // Gewebe. Bei 4,7 beruehren sich die Punkte. Der Grundfaktor in
      // vLit geht im selben Zug zurueck, damit die Gesamtenergie nicht
      // mitwaechst.
      // Der Wert stand auf 5,5 und ist auf 3,2 zurueck. Er war an den
      // alten Reihenabstand von 4,8 Bildpunkten gebunden, mit der
      // Begruendung, die Scheiben sollten sich leicht ueberdecken. Genau
      // dieses Ueberdecken war der Fehler: die Referenz zeigt einzeln
      // stehende feine Punkte auf dunklem Grund, keine geschlossene
      // Flaeche. In der Fuenffachvergroeszerung misst ein Punkt der
      // Referenz rund zwei ihrer Bildpunkte, bei uns also gut zweieinhalb.
      // Die Scheibe ist der TRAEGER des Punktes, nicht der Punkt selbst.
      // Der Fragment-Shader zeichnet darauf einen scharfen Kern und einen
      // schwachen Hof, die Scheibe gibt also die Reichweite des Hofes vor.
      //
      // Der Wert stand auf 26, ist versuchsweise auf 10 zurueckgegangen
      // und steht jetzt bei 20. Die Zwischenstufe war ein Fehlschlusz und
      // die Messung, die ihn widerlegt, steht im Radialprofil.
      //
      // Der Gedanke bei 10 war, die Scheibe muesse mit der Masche
      // schrumpfen, weil sich sonst zu viele Hoefe uebereinanderlegen.
      // Genau dieses Uebereinanderlegen ist aber der ZWECK des Hofes. Der
      // Hof traegt den flaechigen Schleier zwischen den Punkten, und ein
      // Schleier ist nur dann gleichmaeszig, wenn er aus so vielen
      // Beitraegen besteht, dass die einzelne Punktlage darin verschwindet.
      // Mit einer Scheibe von 4,6 Bildpunkten Halbmesser deckte ein Hof
      // nur drei Maschen ab; der Schleier folgte damit dem Gitter statt es
      // zu ueberdecken, und im Radialprofil stand zwei Bildpunkte neben
      // jedem Punkt ein Loch. Gemessen fiel die Delle dadurch auf 8,1,
      // waehrend die Referenz bei 3,4 liegt und die Grenze bei 6.
      //
      // Mit 20 steht die Scheibe bei 24 eigenen und damit 18 Bildpunkten
      // der Referenz im Durchmesser. Der Hof deckt damit rund dreizehn
      // Maschen ab und mittelt sich zu einer glatten Flaeche. Der Kern
      // bleibt davon unberuehrt, weil der Teiler im Fragment-Shader
      // mitwaechst; bei 4,0 misst der Kernhalbmesser 3,0 eigene und damit
      // 2,29 Bildpunkte der Referenz. Damit laeuft ein Punkt laengs seiner
      // Kette mit dem Nachbarn zusammen, denn der Kettenvektor misst nur
      // 3,3 Bildpunkte, waehrend die Gasse quer dazu mit 5,5 Bildpunkten
      // frei bleibt. Genau so liest die Referenz.
      //
      // Die Scheibe geht von 20 auf 14 zurueck, und der Anlasz ist die
      // Nahaufnahme _ref2/vid28/v040.jpg. Dort stehen sehr kleine feine
      // Punkte auf ueberwiegend dunklem Grund, waehrend unsere
      // Dreifachvergroeszerung des Standes vom 27. August fette, weit
      // auseinanderliegende Leuchtperlen mit groszem Hof zeigte, die als
      // gestrichelte Neonlinien lasen. Gemessen trug unser Fenster
      // 620,100,420,420 dabei 42,1 Prozent leuchtende Flaeche gegen 9,3
      // der Referenz im deckungsgleichen Fenster von v012.
      //
      // Die Rechnung dahinter haelt die Zahl der Hofbeitraege konstant.
      // Der Hof soll nach wie vor viele Maschen ueberdecken, damit der
      // Schleier glatt bleibt; weil die Masche mit der neuen Gitterteilung
      // aber selbst um den Faktor 0,69 schrumpft, deckt eine Scheibe von
      // 14 Bildpunkten wieder rund dieselben dreizehn Maschen ab wie
      // vorher eine von 20. Die Fragmentlast bleibt dabei ebenfalls
      // stehen, denn die Scheibenflaeche faellt auf 0,49 und die Punktzahl
      // steigt auf das 1,78-fache.
      //
      // Mit der dritten Erhoehung der Gitterteilung auf 300 mal 200 geht
      // die Scheibe ein zweites Mal zurueck, von 14 auf 12 Bildpunkte. Sie
      // haelt damit die Fragmentlast bei 6,8 Millionen, also genau auf dem
      // Wert des Ausgangsstandes, und der Hof deckt bei einer Masche von
      // neun Bildpunkten weiterhin genug Nachbarn ab, um sich zu einem
      // glatten Schleier zu mitteln.
      material.uniforms.uPointSize.value = 12.0 * dpr;

      // Die Halbweite des Streuversatzes gegen das Moire. Sie soll eine
      // halbe GERAETE-Bildpunktbreite betragen, denn die Schwebung
      // entsteht am Raster der Geraetebildpunkte. Der Schattierer rechnet
      // dagegen in Seitenbildpunkten, und ein Geraetebildpunkt ist
      // 1 geteilt durch dpr davon breit; deshalb steht hier der Kehrwert.
      material.uniforms.uJitter.value = 0.5 / dpr;

      // Die Weltlaenge einer Periode. Sie steht normalerweise auf SPANN,
      // wird aber gestreckt, sobald die Periode sonst kuerzer als das
      // Fenster plus Sicherheitsabstand ausfiele. Ohne diese Streckung
      // blieben oben und unten leere Streifen stehen, denn die Punkte
      // fuellen ueber fract immer genau eine Periodenlaenge und keinen
      // Bildpunkt mehr.
      //
      // Nachgerechnet greift die Streckung auf keinem der geprueften
      // breiten Schirme. Bei 1920 mal 1080 verlangt sie 8,68, bei 1600 mal
      // 900 verlangt sie 8,99, bei 1440 mal 900 verlangt sie 9,06 und bei
      // 1280 mal 800 verlangt sie 9,29, waehrend SPANN bei 11,5 steht.
      // Bei 390 mal 844 verlangt sie dagegen 17,63 und streckt das Band
      // damit auf das 1,53-fache.
      const spann = Math.max(SPANN, (height + 2 * RAND) / (Math.cos(TILT) * unit));
      material.uniforms.uSpann.value = spann;
      periodePx = spann * Math.cos(TILT) * unit;

      // Rasterabstand konstant halten, und zwar in beiden Richtungen
      // GETRENNT. Der gemeinsame Schritt taugte nicht mehr, seit die
      // Periode auf schmalen Schirmen gestreckt wird. Die Streckung haelt
      // den Sprossenabstand naemlich von selbst nahezu konstant, waehrend
      // der Abstand quer ueber das Band allein am Maszstab haengt und dort
      // auf die Haelfte faellt. Nachgerechnet stehen die Sprossen bei 390
      // mal 844 mit der Streckung 6,02 Bildpunkte auseinander gegen 8,04
      // bei 1440 mal 900, die Spalten dagegen nur 2,43 gegen 4,97. Der
      // Schritt bleibt laengs deshalb bei eins und geht quer auf zwei,
      // waehrend der gemeinsame Schritt zuvor beide auf zwei setzte und
      // die Sprossen damit auf 7,86 Bildpunkte zog.
      const reiheSp = periodePx / N_U;
      const spalteSp = (2 * RADIUS * unit) / N_S;
      strideU = Math.min(4, Math.max(1, Math.round(BEZUG_REIHE / reiheSp)));
      strideS = Math.min(4, Math.max(1, Math.round(BEZUG_SPALTE / spalteSp)));
      applyStride();
      if (!reduced) versatzSetzen();
      draw();
    };

    // Selbstregelung der Punktzahl.
    //
    // Sie lief frueher ueber setDrawRange. Das war aus zwei Gruenden
    // falsch. Der Puffer ist zeilenweise nach u gefuellt, eine gekuerzte
    // Zeichenreichweite behaelt also das eine ENDE des Bandes und
    // amputiert den ganzen unteren Faecher samt Taille. Und der Regler
    // kannte nur den Weg nach unten, ein einziger Ruckler beim
    // Tabwechsel kappte dauerhaft — nach einer halben Minute stand nur
    // noch ein Zipfel oben rechts.
    //
    // Jetzt greift der Regler an uStride an. Dort faellt gleichmaeszig
    // jede zweite Reihe und Spalte weg, die Form bleibt vollstaendig.
    //
    // Die Ausloeseschwelle stand bei 32 ms und die Erholung bei 90 guten
    // Bildern. Gemessen ueber 66 Sekunden auf einer voellig ruhenden
    // Seite fiel das Licht des Gewebes damit von 17,0 auf 3,3 Prozent
    // Bedeckung, blieb elf Sekunden dort und kam erst dann zurueck,
    // obwohl die Bildrate mit p50 gleich 16,7 und p95 gleich 16,9 ms gar
    // keinen Anlasz gab. Der Grund ist der Mittelwert selbst: bei einem
    // Glaettungsanteil von 0,08 hebt ein einziger Aussetzer knapp unter
    // der Ausreiszergrenze von 200 ms den Mittelwert von 16,7 auf 31,3
    // und zwei davon reichten fuer die alte Schwelle.
    // Mit 45 ms braucht es drei aufeinanderfolgende Aussetzer dieser
    // Groesze, und das ist kein Ausreiszer mehr, sondern echte Last. Die
    // Erholung steht bei 25 guten Bildern statt bei 90.
    let strideU = 1;
    let strideS = 1;
    let relief = 1;
    let avg = 16;
    let settle = 0;
    let good = 0;
    // Die Blende zwischen den Stufen. Sie laeuft zur Stufe hin nach null
    // und zurueck nach eins, damit die weggelassenen Punkte ausgehen
    // statt zu verschwinden.
    let reliefFade = 1;

    const applyStride = () => {
      material.uniforms.uStride.value.set(strideU, strideS);
      material.uniforms.uGrob.value.set(
        Math.min(4, strideU * 2),
        Math.min(4, strideS * 2),
      );
    };

    const govern = (ms: number, dt: number) => {
      // Einzelne Ausreiszer sind kein Lastsignal. Ein Tabwechsel oder
      // ein Nachladen liefert Bildzeiten im Sekundenbereich; wer die
      // mitmittelt, drosselt eine Seite, die in Wahrheit 60 Bilder
      // schafft.
      const ziel = relief > 1 ? 0 : 1;
      if (reliefFade !== ziel) {
        const schritt = dt / 0.45;
        reliefFade = ziel > reliefFade
          ? Math.min(1, reliefFade + schritt)
          : Math.max(0, reliefFade - schritt);
        material.uniforms.uRelief.value = reliefFade;
      }
      if (ms > 200) return;
      avg += (ms - avg) * 0.08;
      settle += 1;
      if (settle < 45) return;
      if (avg > 45 && relief < 2) {
        relief = 2;
        settle = 0;
        good = 0;
        return;
      }
      if (avg < 20 && relief > 1) {
        good += 1;
        if (good > 25) {
          relief = 1;
          settle = 0;
          good = 0;
        }
      } else {
        good = 0;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      govern(now - lastNow || 16, dt);
      lastNow = now;

      // WELTVERSATZ UND SCROLLDREHUNG haengen beide am Scrollweg samt
      // Vorzeichen. Sie werden direkt gesetzt und nicht aufsummiert, sind
      // also reine Funktionen des Scrollstands. Daraus folgt unmittelbar,
      // dass die Struktur beim Zurueckscrollen genau denselben Weg
      // zurueckgeht und an derselben Stelle wieder ankommt. Es gibt nichts,
      // was sich verlaufen oder aufstauen koennte.
      //
      // Der frueher hier stehende gedaempfte Schub an der
      // Scrollgeschwindigkeit ist entfallen. Er hat das Versprechen nie
      // eingeloest, weil er selbst bei zuegigem Scrollen nur das Fuenffache
      // des Ruhetempos erreichte und ueber vier Zehntelsekunden anlief;
      // die Begruendung steht ausfuehrlich bei SCROLL_DREH.
      versatzSetzen();

      // Der Umlauf wird schon hier auf den Bereich zwischen null und eins
      // zurueckgeholt. fract im Shader ist zwar periodisch, rechnet aber
      // nur mit einfacher Genauigkeit; nach einer Viertelstunde Laufzeit
      // waere von den Nachkommastellen eines unbegrenzt wachsenden Wertes
      // nicht mehr genug uebrig und das Raster wuerde stufig.
      zeitFlow = (zeitFlow + IDLE_FLOW * dt) % 1;
      // Auch dieser Umlauf wird schon hier auf den Bereich zwischen null und
      // eins zurueckgeholt, und zwar aus demselben Grund wie der Flusz. Ein
      // unbegrenzt wachsender Wert verliert in einfacher Genauigkeit nach
      // einer Viertelstunde Laufzeit die Nachkommastellen, die das Raster
      // braucht.
      spin = (spin + SPIN_RATE * dt) % 1;
      material.uniforms.uSpin.value = spin;

      draw();
      frame = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      lastNow = performance.now();
      // Ein gemerkter Scrollstand wird beim Wiederanlauf nicht mehr
      // gebraucht. Der frueher hier aufgefrischte Wert diente allein der
      // gerechneten Scrollgeschwindigkeit, und die gibt es nicht mehr;
      // Weltversatz und Scrolldrehung lesen den Scrollstand in jedem Bild
      // unmittelbar und koennen deshalb ueber eine Pause hinweg keinen
      // Sprung ansammeln.
      frame = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();

    // Ein Messfenster fuer die Entwicklung, und zwar NUR dort. Die
    // Ankopplung an den Scrollweg laeszt sich am Bild nur schlecht
    // nachmessen, weil die Silhouette an der Taille von der Huelle
    // ueberlagert wird und ein Blockvergleich auf dem Punktraster
    // einrastet. Ueber diesen Haken liest ein Meszskript die Groeszen
    // unmittelbar aus, statt sie aus Bildern zu schaetzen.
    //
    // Im gebauten Stand wird der Zweig entfernt, denn die Bedingung ist
    // beim Uebersetzen bereits entschieden.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __dna?: unknown }).__dna = () => ({
        travel,
        // Die beiden Summanden des Flusses werden EINZELN herausgegeben.
        // Nur so laeszt sich die Ankopplung an den Scrollweg pruefen, ohne
        // sie aus Bildern schaetzen zu muessen: zwei Ablesungen bei
        // verschiedenen Scrollstaenden liefern die Perioden je Bildpunkt
        // unmittelbar, und der mitlaufende Zeitanteil stoert dabei nicht,
        // weil er getrennt danebensteht.
        zeitFlow,
        wegFlow,
        flow: zeitFlow + wegFlow,
        periodePx,
        spann: material.uniforms.uSpann.value,
        unit: material.uniforms.uUnit.value,
        stride: [strideU, strideS],
        weg: wegMessen(),
        mitte: material.uniforms.uCenterPx.value.y,
      });
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: "160px" },
    );
    io.observe(host);

    return () => {
      stopLoop();
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __dna?: unknown }).__dna;
      }
      observer.disconnect();
      io.disconnect();
      geom.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [reduced, opacity]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
