"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./marketing.module.css";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Buehnen der drei Leistungsstraenge                                 */
/*                                                                     */
/*  Der Auftraggeber hat die drei Schaustuecke als zu gleich           */
/*  bezeichnet. Sie sollen im Stil zusammengehoeren, weil es eine       */
/*  Sektion ist, aber jedes soll sein Medium VORFUEHREN statt es nur    */
/*  anzudeuten. Aus drei stillen Geruesten sind deshalb drei kleine     */
/*  Szenen geworden, die von selbst laufen und bei Beruehrung neu       */
/*  beginnen.                                                          */
/*                                                                     */
/*  01 Webseite   Eine gezeichnete Seite scrollt im Fenster durch,      */
/*                bleibt am Kontaktformular stehen, der Knopf wird      */
/*                gedrueckt, eine Bestaetigung erscheint.               */
/*  02 Social     Ein Beitrag im Hochformat, davor ein Zaehler, der von */
/*                null hochlaeuft, aufsteigende Herzen und eine         */
/*                wachsende Reichweitenkurve.                           */
/*  03 Werbetafel Vier Spots laufen im Schirm einer gezeichneten Stele  */
/*                im Hochformat, deren Lichtschein sich beim Wechsel    */
/*                mitfaerbt.                                            */
/*                                                                     */
/*  ALLE BEWEGUNG LIEGT IM BLATT und wird nur ueber ein data-Merkmal    */
/*  umgeschaltet. Der Grund ist die Bildrate: die Sektion teilt sich    */
/*  den Schirm mit der WebGL-Struktur, und drei Zeitleisten in          */
/*  JavaScript haetten sich deren Hauptfaden geteilt. So bewegt der     */
/*  Setzer nur transform, opacity und clip-path.                        */
/*                                                                     */
/*  Die Buehnen sind undurchsichtig und duerfen deshalb weiter nach     */
/*  rechts reichen als die Schrift. Die Grenze bei 54 Prozent der       */
/*  Bildbreite gilt fuer LESBARKEIT ueber dem Gewebe, siehe die         */
/*  Herleitung bei --dna-eng. Ein Schaustueck mit eigenem Grund traegt  */
/*  seinen Inhalt selbst und ist davon nicht betroffen.                 */
/* ------------------------------------------------------------------ */

type Worte = Readonly<Record<string, string | undefined>>;

/** Meldet, ob das Element gerade im Bild steht. Die Szenen laufen nur
 *  dann. Drei Endlosschleifen ausserhalb des Bildes kosten Bildrate,
 *  waehrend die Struktur daneben ohnehin rechnet. */
function useImBild(ziel: React.RefObject<HTMLElement | null>): boolean {
  const [drin, setDrin] = useState(false);

  useEffect(() => {
    const feld = ziel.current;
    if (!feld) return;
    const beobachter = new IntersectionObserver(
      (eintraege) => setDrin(eintraege[0]?.isIntersecting ?? false),
      { rootMargin: "160px 0px" },
    );
    beobachter.observe(feld);
    return () => beobachter.disconnect();
  }, [ziel]);

  return drin;
}

/** Schaltet eine Szene ueber ihre Abschnitte und beginnt danach von vorn.
 *  Die Dauern stehen in Millisekunden und gehoeren zum jeweiligen
 *  Abschnitt, nicht zum Uebergang dorthin. Bei reduzierter Bewegung
 *  steht sofort der letzte Abschnitt, also der Endzustand. */
function usePhase(
  dauern: readonly number[],
  laeuft: boolean,
  neu: number,
  ruhig: boolean,
): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    if (ruhig) {
      setP(dauern.length - 1);
      return;
    }
    if (!laeuft) return;

    let stelle = 0;
    let id = 0;
    setP(0);

    const weiter = () => {
      id = window.setTimeout(() => {
        stelle = (stelle + 1) % dauern.length;
        setP(stelle);
        weiter();
      }, dauern[stelle]);
    };

    weiter();
    return () => window.clearTimeout(id);
  }, [dauern, laeuft, neu, ruhig]);

  return p;
}

/* ----------------------------------------------------- 01 Webseite */

/* Sechs Abschnitte. Die Seite steht oben, rollt durch, haelt am
   Formular, der Zeiger faehrt heran, drueckt, und die Bestaetigung
   steht. Danach spult die Szene zurueck.
   Die 2600 im zweiten Abschnitt sind zugleich die Dauer der Fahrt im
   Blatt. Wer eines von beiden aendert, aendert das andere mit, sonst
   haelt die Seite mitten in der Bewegung an. */
const WEB_TAKT = [1500, 2600, 700, 950, 340, 2500] as const;

/** Eine Zeile im gezeichneten Seiteninhalt. Die Hoehe kommt aus dem
 *  Blatt und nicht mehr als Bildpunktwert von hier, denn sie waechst mit
 *  der Breite des Rahmens. Uebrig bleibt die Breite in Prozent, und die
 *  gehoert zum Inhalt und nicht zur Gestaltung. */
function Zeile({
  breite,
  stark,
  gross,
}: Readonly<{ breite: string; stark?: boolean; gross?: boolean }>) {
  return (
    <span
      className={stark ? styles.wbZeile : styles.wbZeileLeise}
      data-gross={gross ? "" : undefined}
      style={{ width: breite }}
    />
  );
}

function WebStage({ worte }: Readonly<{ worte: Worte }>) {
  const feld = useRef<HTMLDivElement>(null);
  const ruhig = useSafeReducedMotion();
  const drin = useImBild(feld);
  const [neu, setNeu] = useState(0);
  const p = usePhase(WEB_TAKT, drin, neu, ruhig);

  return (
    <div
      className={styles.wbWrap}
      ref={feld}
      data-p={p}
      aria-hidden="true"
      onPointerEnter={() => setNeu((n) => n + 1)}
    >
      <div className={styles.wbFrame}>
        <div className={styles.wbChrome}>
          <span className={styles.wbAmpel} />
          <span className={styles.wbAmpel} />
          <span className={styles.wbAmpel} />
          <span className={styles.wbAddr}>
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M3.4 5.4V4.1a2.6 2.6 0 0 1 5.2 0v1.3M2.9 5.4h6.2v4.2H2.9z"
                stroke="currentColor"
                strokeWidth={1}
                strokeLinejoin="round"
              />
            </svg>
            {worte.adresse}
          </span>
        </div>

        <div className={styles.wbView}>
          <div className={styles.wbPage}>
            {/* Bildschirm 1. Kopfbereich mit Zeile, Unterzeile und Knopf. */}
            <div className={styles.wbSchirm}>
              <div className={styles.wbNav}>
                <span className={styles.wbMarke} />
                <span className={styles.wbNavLuft} />
                <Zeile breite="max(26px, 3.16cqw)" />
                <Zeile breite="max(26px, 3.16cqw)" />
                <Zeile breite="max(26px, 3.16cqw)" />
                <span className={styles.wbNavKnopf} />
              </div>
              <div className={styles.wbHero}>
                <div className={styles.wbHeroText}>
                  <Zeile breite="82%" stark gross />
                  <Zeile breite="58%" stark gross />
                  <Zeile breite="70%" />
                  <Zeile breite="48%" />
                  <span className={styles.wbHeroKnopf} />
                </div>
                <span className={styles.wbHeroBild} />
              </div>
            </div>

            {/* Bildschirm 2. Drei Leistungen als Karten. */}
            <div className={styles.wbSchirm}>
              <Zeile breite="34%" stark gross />
              <div className={styles.wbKarten}>
                {[0, 1, 2].map((i) => (
                  <span className={styles.wbKarte} key={i}>
                    <span className={styles.wbKarteZeichen} />
                    <Zeile breite="72%" />
                    <Zeile breite="92%" />
                    <Zeile breite="64%" />
                  </span>
                ))}
              </div>
            </div>

            {/* Bildschirm 3. Der Kontaktbereich, an dem die Fahrt endet.
                Er steht zweispaltig wie ein gebauter Kontaktabschnitt:
                links die Anrede und drei Wege zum Betrieb, rechts das
                Formular. Eine einzelne Formularsaeule ueber die ganze
                Breite hat als graue Flaeche gelesen. */}
            <div className={styles.wbSchirm} data-mitte="">
              <Zeile breite="40%" stark gross />
              <div className={styles.wbKontakt}>
                <div className={styles.wbKontaktText}>
                  <Zeile breite="88%" />
                  <Zeile breite="66%" />
                  <span className={styles.wbWege}>
                    {["72%", "58%", "64%"].map((w) => (
                      <span className={styles.wbWeg} key={w}>
                        <span className={styles.wbWegZeichen} />
                        <Zeile breite={w} />
                      </span>
                    ))}
                  </span>
                </div>

                <div className={styles.wbForm}>
                  <span className={styles.wbFeld} />
                  <span className={styles.wbFeld} />
                  <span className={styles.wbFeld} data-gross="" />
                  <span className={styles.wbKnopf}>
                    {worte.knopf}
                    <span className={styles.wbWelle} aria-hidden="true" />
                  </span>
                  <span className={styles.wbZeiger} aria-hidden="true">
                    <svg viewBox="0 0 16 18" fill="none">
                      <path
                        d="M1.6 1.4 14 9.1l-5.3 1.1-2 5z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Die Bestaetigung liegt ueber der Seite und nicht in ihr,
              damit sie beim Zuruecklaufen nicht mitwandert. */}
          <span className={styles.wbOk}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4.6 10.4 8.4 14l7-8"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {worte.bestaetigt}
          </span>
        </div>
      </div>

      <span className={styles.wbSchein} aria-hidden="true" />
    </div>
  );
}

/* -------------------------------------------------- 02 Social Media */

/* Der Zaehler laeuft ueber diese Spanne und faengt danach wieder bei
   null an. EINE ENDZAHL WIRD BEWUSST NICHT VERSPROCHEN: belegt ist
   allein die Zahl der umgesetzten Projekte, und was ein Kanal an
   Followern bringt, haengt am Betrieb. Die Schleife zeigt deshalb das
   Wachstum und nie ein Ergebnis. */
const LAUF = 6400;
const RUECK = 900;

/** Die Ziffern des Zaehlers. Sie laufen ueber einen Takt von hundert
 *  Millisekunden und nicht ueber requestAnimationFrame, denn der
 *  Hauptfaden gehoert in dieser Sektion der Struktur. Zehn Schritte in
 *  der Sekunde reichen fuer eine Zahl, die ohnehin gerundet steht. */
function useZaehler(
  laeuft: boolean,
  neu: number,
  ruhig: boolean,
): Readonly<{ wert: number; pause: boolean }> {
  const [stand, setStand] = useState({ wert: 0, pause: false });

  useEffect(() => {
    if (ruhig) {
      setStand({ wert: 1840, pause: false });
      return;
    }
    if (!laeuft) return;

    const start = performance.now();
    setStand({ wert: 0, pause: false });
    const takt = window.setInterval(() => {
      const t = (performance.now() - start) % (LAUF + RUECK);
      // Die Pause am Ende jeder Runde blendet die Ziffern aus. Ohne sie
      // sprang die Zahl vom Hoechststand sichtbar auf null zurueck, und
      // dieser Sprung las sich als Fehler statt als neue Runde.
      if (t > LAUF) {
        setStand((s) => (s.pause ? s : { ...s, pause: true }));
        return;
      }
      const q = t / LAUF;
      setStand({
        wert: Math.round(2640 * (1 - Math.pow(1 - q, 2.2))),
        pause: false,
      });
    }, 100);

    return () => window.clearInterval(takt);
  }, [laeuft, neu, ruhig]);

  return stand;
}

/** Die Zeichen, die aus dem Beitrag aufsteigen. Gezeichnet und nicht aus
 *  einer Schrift geholt, damit sie dieselbe Strichstaerke tragen wie die
 *  Marken darunter. */
const FLUG: readonly { d: string; voll: boolean }[] = [
  {
    d: "M9 3.5C7.6 2 5.2 2.1 3.9 3.7 2.7 5.2 2.9 7.5 4.3 8.8L9 13.2l4.7-4.4c1.4-1.3 1.6-3.6.4-5.1C12.8 2.1 10.4 2 9 3.5Z",
    voll: true,
  },
  { d: "M2.6 3h12.8v8.2H8.1L4.9 14v-2.8H2.6Z", voll: false },
  {
    d: "M9 3.5C7.6 2 5.2 2.1 3.9 3.7 2.7 5.2 2.9 7.5 4.3 8.8L9 13.2l4.7-4.4c1.4-1.3 1.6-3.6.4-5.1C12.8 2.1 10.4 2 9 3.5Z",
    voll: true,
  },
  { d: "M3 8.8 15 3l-4 11.8-2.4-4.6z", voll: false },
  {
    d: "M9 3.5C7.6 2 5.2 2.1 3.9 3.7 2.7 5.2 2.9 7.5 4.3 8.8L9 13.2l4.7-4.4c1.4-1.3 1.6-3.6.4-5.1C12.8 2.1 10.4 2 9 3.5Z",
    voll: true,
  },
  { d: "M2.6 3h12.8v8.2H8.1L4.9 14v-2.8H2.6Z", voll: false },
];

function SocialStage({ worte }: Readonly<{ worte: Worte }>) {
  const feld = useRef<HTMLDivElement>(null);
  const ruhig = useSafeReducedMotion();
  const drin = useImBild(feld);
  const [neu, setNeu] = useState(0);
  const zaehler = useZaehler(drin, neu, ruhig);

  return (
    <div
      className={styles.soWrap}
      ref={feld}
      data-lauf={drin && !ruhig ? "" : undefined}
      data-pause={zaehler.pause ? "" : undefined}
      aria-hidden="true"
      onPointerEnter={() => setNeu((n) => n + 1)}
    >
      {/* Der Schluessel setzt die Zeitleisten im Blatt zurueck. Ohne ihn
          liefen die Herzen nach einer Beruehrung mitten in ihrer
          Schleife weiter, waehrend der Zaehler von vorn beginnt. */}
      <div className={styles.soBuehne} key={neu}>
        <span className={styles.soBlatt} data-i="2" />
        <span className={styles.soBlatt} data-i="1" />

        <div className={styles.soPhone}>
          <span className={styles.soKerbe} />

          <div className={styles.soPost}>
            <div className={styles.soKopf}>
              <span className={styles.soAvatar} />
              <span className={styles.soKopfZeilen}>
                <span className={styles.wbZeile} style={{ width: "58%" }} />
                <span className={styles.wbZeileLeise} style={{ width: "36%" }} />
              </span>
            </div>

            <span className={styles.soMedia}>
              <span className={styles.soMediaLicht} />
            </span>

            <div className={styles.soAktionen}>
              <svg viewBox="0 0 18 18" fill="none" className={styles.soHerz}>
                <path
                  d={FLUG[0].d}
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              </svg>
              <svg viewBox="0 0 18 18" fill="none">
                <path
                  d={FLUG[1].d}
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              </svg>
              <svg viewBox="0 0 18 18" fill="none">
                <path
                  d={FLUG[3].d}
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className={styles.soUnter}>
              <span className={styles.wbZeileLeise} style={{ width: "88%" }} />
              <span className={styles.wbZeileLeise} style={{ width: "60%" }} />
            </span>
          </div>

          {/* Die Zeichen steigen an der rechten Kante auf. Sechs Stueck
              reichen; mehr wuerden sich im schmalen Streifen ueberlagern. */}
          <span className={styles.soFlug}>
            {FLUG.map((zeichen, i) => (
              <svg
                key={i}
                viewBox="0 0 18 18"
                fill="none"
                style={{ "--i": i } as React.CSSProperties}
              >
                <path
                  d={zeichen.d}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  fill={zeichen.voll ? "currentColor" : "none"}
                  fillOpacity={zeichen.voll ? 0.28 : 0}
                />
              </svg>
            ))}
          </span>
        </div>

        {/* Der Zaehler liegt vor dem Beitrag und nicht daneben. So bleibt
            die Buehne schmal genug fuer die Spalte, in der sie steht. */}
        <div className={styles.soZaehler}>
          <span className={styles.soZaehlerWert}>
            {zaehler.wert.toLocaleString("de-DE")}
          </span>
          <span className={styles.soZaehlerMarke}>
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M6 10V2.6M6 2.2 2.6 5.6M6 2.2l3.4 3.4"
                stroke="currentColor"
                strokeWidth={1.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {worte.zaehler}
          </span>
        </div>

        {/* Die Reichweite. Der Streifen wird von links nach rechts
            aufgedeckt, gezeichnet wird also nichts, es wird nur eine
            Maske bewegt. */}
        <div className={styles.soKurve}>
          <span className={styles.soKurveMarke}>{worte.kurve}</span>
          <span className={styles.soKurveFeld}>
            <svg viewBox="0 0 120 44" fill="none" preserveAspectRatio="none">
              <path
                className={styles.soKurveFlaeche}
                d="M0 42 12 38 26 34 40 30 54 22 68 20 82 13 96 10 110 4 120 2v42z"
              />
              <path
                className={styles.soKurveStrich}
                d="M0 42 12 38 26 34 40 30 54 22 68 20 82 13 96 10 110 4 120 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className={styles.soKurveKopf} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------- 03 Werbetafeln */

/* Die Werbetafel traegt als einzige Fotos, und der Grund dafuer ist eine
   Ansage des Auftraggebers: man soll bildlich sehen, worum es geht. Ein
   Geruest aus Haarlinien kann einen Browser und einen Beitrag
   ueberzeugend andeuten, eine leuchtende Flaeche im Raum aber nicht,
   denn deren ganze Wirkung liegt im Licht, das sie abgibt.

   DIE STELE STEHT IM HOCHFORMAT UND ZEIGT VIER SPOTS. Bis zuletzt lief
   hier ein Querformat mit drei Stockfotos, die ihrerseits Displays in
   Ladenlokalen zeigten, also ein Bild von einem Bildschirm. Der
   Auftraggeber hat dafuer eigene Spots erzeugen lassen, die genau das
   zeigen, was auf einer Tafel LAEUFT: Gym, Restaurant, Club und
   Veranstaltung. Sie sind 9 zu 16 und passen damit in den Schirm einer
   Stele, wie sie tatsaechlich aufgestellt wird.

   DAS UNTERE DRITTEL DER SPOTS IST FREI, und das ist Absicht. Dort legt
   die Seite ihre eigene Endkarte darueber, also eine Marke und zwei
   Zeilen als Formen. Sie behauptet keinen Betrieb und keinen Preis,
   zeigt aber, dass auf der Flaeche eine Anzeige laeuft.

   DIE VIDEOS BLEIBEN AUSSEN VOR. Zu drei der vier Spots liegt inzwischen
   eine mp4 daneben, zusammen rund sieben Megabyte. Der vierte fehlt noch,
   ein gemischter Rundlauf aus drei laufenden und einem stehenden Bild
   liest sich als Fehler, und die Sektion teilt sich den Schirm mit der
   WebGL-Struktur, deren Bildrate unter zwanzig Millisekunden bleiben
   muss. Auf der Unterseite Werbetafeln, wo nichts daneben rechnet,
   gehoeren die Videos hin.

   GEZEIGT WIRD DIE KLEINE FASSUNG MIT 560 BILDPUNKTEN BREITE. Die
   Vorlagen liegen mit 900 vor, der Schirm ist hier 240 bis 300 breit,
   und bei doppelter Punktdichte reichen 560. Mit der vollen Datei
   kostete jeder Bildwechsel gemessen ein Bild von 50 Millisekunden,
   weil der Setzer das Foto erst im Moment des Einblendens auspackte.
   Ein Verkleinern durch next/image half nicht, denn die Seite steht auf
   images.unoptimized. Die kleinen Fassungen liegen als eigene Dateien
   daneben und sind in public/tafeln/HERKUNFT.md vermerkt.

   Die vier Toene sind an den hellsten Feldern der vier Spots abgenommen
   und in das Blau bis Lavendel der Marke gezogen.

   Faellt ein Bild aus, bleibt die Stele mit ihrem Schimmer stehen und
   die Aussage geht nicht verloren. */
const TAFELN: readonly { src: string; alt: string; ton: string }[] = [
  {
    src: "/tafeln/spot-gym-560.webp",
    alt: "Eine Hand über einer Kettlebell, Kreidestaub im blauen Licht.",
    ton: "108, 122, 255",
  },
  {
    src: "/tafeln/spot-restaurant-560.webp",
    alt: "Ein angerichteter Teller auf dunklem Grund, darüber aufsteigender Dampf.",
    ton: "170, 152, 255",
  },
  {
    src: "/tafeln/spot-club-560.webp",
    alt: "Lichtkegel über einer Menge mit erhobenen Händen.",
    ton: "104, 140, 255",
  },
  {
    src: "/tafeln/spot-event-560.webp",
    alt: "Eine Lichterkette über einer Bühne am Abend.",
    ton: "124, 104, 255",
  },
];

const TAKT = 4200;

function BoardStage() {
  const feld = useRef<HTMLDivElement>(null);
  const ruhig = useSafeReducedMotion();
  const drin = useImBild(feld);
  const [i, setI] = useState(0);
  // Ein Griff des Besuchers haelt den Rundlauf an. Wer selbst blaettert,
  // will nicht vier Sekunden spaeter weitergeschoben werden.
  const [haende, setHaende] = useState(false);

  useEffect(() => {
    if (!drin || ruhig || haende) return;
    const t = window.setInterval(
      () => setI((n) => (n + 1) % TAFELN.length),
      TAKT,
    );
    return () => window.clearInterval(t);
  }, [drin, ruhig, haende]);

  return (
    <div className={styles.bdWrap} ref={feld}>
      <div className={styles.bdStele}>
        <div className={styles.bdKorpus}>
          <div className={styles.bdScreen}>
            {TAFELN.map((tafel, n) => (
              <img
                key={tafel.src}
                className={styles.bdBild}
                data-an={n === i ? "" : undefined}
                src={tafel.src}
                alt={tafel.alt}
                width={560}
                height={996}
                loading={n === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}

            {/* Die Endkarte im freien unteren Drittel. Eine Marke und
                zwei Zeilen als Formen, keine Worte, denn welcher Betrieb
                dort steht und was er anbietet, wissen wir nicht. */}
            <span className={styles.bdKarte} aria-hidden="true">
              <span className={styles.bdKarteMarke} />
              <span className={styles.bdKarteZeile} />
              <span className={styles.bdKarteZeile} data-kurz="" />
            </span>

            <span className={styles.bdRaster} />
            <span className={styles.bdGlanz} />
            <span className={styles.bdSaum} />
          </div>
        </div>

        {/* Der Fusz und der Schatten darunter. Erst sie machen aus der
            Flaeche ein Geraet, das irgendwo steht. */}
        <span className={styles.bdFuss} />
      </div>

      {/* Drei Lichtscheine uebereinander, je einer in der Farbe eines
          Bildes. Umgeblendet wird ueber die Deckkraft, denn eine
          Farbe laeszt sich nicht auf dem Setzer bewegen. */}
      <span className={styles.bdBoden}>
        {TAFELN.map((t, n) => (
          <span
            key={t.src}
            className={styles.bdSchein}
            data-an={n === i ? "" : undefined}
            style={{ "--ton": t.ton } as React.CSSProperties}
          />
        ))}
      </span>

      {/* Die Marken sind echte Schaltflaechen und keine Punkte zum
          Ansehen. Sie tragen einen Namen fuer die Vorlesesoftware und
          nehmen den Tastaturfokus. */}
      <div className={styles.bdMarken}>
        {TAFELN.map((t, n) => (
          <button
            key={t.src}
            type="button"
            className={styles.bdMarke}
            data-an={n === i ? "" : undefined}
            aria-label={`Aufnahme ${n + 1} von ${TAFELN.length}`}
            aria-current={n === i ? "true" : undefined}
            onClick={() => {
              setI(n);
              setHaende(true);
            }}
          >
            <span className={styles.bdMarkeFuell} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function StrandStage({
  id,
  active,
  worte,
}: Readonly<{ id: string; active: boolean; worte?: Worte }>) {
  const w: Worte = worte ?? {};

  return (
    <div
      className={styles.strandStage}
      data-stage={id}
      data-an={active ? "" : undefined}
    >
      {id === "social" ? (
        <SocialStage worte={w} />
      ) : id === "dooh" ? (
        <BoardStage />
      ) : (
        <WebStage worte={w} />
      )}
    </div>
  );
}
