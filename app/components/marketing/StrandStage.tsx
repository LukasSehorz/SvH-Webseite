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
/*  03 Werbetafel Die drei Fotos laufen in einer gezeichneten Stele,    */
/*                deren Lichtschein sich beim Bildwechsel mitfaerbt.    */
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

/** Eine Zeile im gezeichneten Seiteninhalt. */
function Zeile({
  breite,
  stark,
  hoch,
}: Readonly<{ breite: string; stark?: boolean; hoch?: number }>) {
  return (
    <span
      className={stark ? styles.wbZeile : styles.wbZeileLeise}
      style={{ width: breite, ...(hoch ? { height: hoch } : null) }}
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
                <Zeile breite="26px" />
                <Zeile breite="26px" />
                <Zeile breite="26px" />
                <span className={styles.wbNavKnopf} />
              </div>
              <div className={styles.wbHero}>
                <div className={styles.wbHeroText}>
                  <Zeile breite="82%" stark hoch={13} />
                  <Zeile breite="58%" stark hoch={13} />
                  <Zeile breite="70%" />
                  <Zeile breite="48%" />
                  <span className={styles.wbHeroKnopf} />
                </div>
                <span className={styles.wbHeroBild} />
              </div>
            </div>

            {/* Bildschirm 2. Drei Leistungen als Karten. */}
            <div className={styles.wbSchirm}>
              <Zeile breite="34%" stark hoch={11} />
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

            {/* Bildschirm 3. Das Kontaktformular, an dem die Fahrt endet. */}
            <div className={styles.wbSchirm}>
              <Zeile breite="46%" stark hoch={11} />
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
function useZaehler(laeuft: boolean, neu: number, ruhig: boolean): number {
  const [wert, setWert] = useState(0);

  useEffect(() => {
    if (ruhig) {
      setWert(1840);
      return;
    }
    if (!laeuft) return;

    const start = performance.now();
    setWert(0);
    const takt = window.setInterval(() => {
      const t = (performance.now() - start) % (LAUF + RUECK);
      if (t > LAUF) return;
      const q = t / LAUF;
      setWert(Math.round(2640 * (1 - Math.pow(1 - q, 2.2))));
    }, 100);

    return () => window.clearInterval(takt);
  }, [laeuft, neu, ruhig]);

  return wert;
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
  const wert = useZaehler(drin, neu, ruhig);

  return (
    <div
      className={styles.soWrap}
      ref={feld}
      data-lauf={drin && !ruhig ? "" : undefined}
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
            {wert.toLocaleString("de-DE")}
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
   ueberzeugend andeuten, eine leuchtende Flaeche im Straszenraum aber
   nicht, denn deren ganze Wirkung liegt in der Umgebung.

   ES SIND MEHRERE BILDER IM RUNDLAUF UND NICHT MEHR EINES. Die erste
   Fassung zeigte eine riesige LED-Fassade an einem Gebaeude. Der
   Auftraggeber hat sie zurueckgewiesen, weil sie sein Angebot falsch
   darstellt: er stellt kleine Displays auf, wie sie in einem Restaurant,
   einem Ladenlokal oder einer Fuszgaengerzone stehen.

   NEU IST DIE STELE. Die Fotos hingen bisher in einem Rahmen, der im
   Nichts stand, und der Auftraggeber wollte die Tafel glaubhafter
   sehen. Sie steht jetzt auf einem gezeichneten Hals mit Fusz, wirft
   Licht auf den Boden davor und laesst darauf einen Schein liegen, der
   die Farbe des laufenden Bildes annimmt. Die drei Toene sind an den
   hellsten Feldern der drei Aufnahmen abgenommen und liegen dadurch
   im Blau bis Lavendel der Marke.

   Faellt ein Bild aus, bleibt die Stele mit ihrem Schimmer stehen und
   die Aussage geht nicht verloren. */
const TAFELN: readonly { src: string; alt: string; ton: string }[] = [
  {
    src: "/stock/dooh-1.webp",
    alt: "Ein leuchtender Werbebildschirm mit dem Wort Sale im Schaufenster eines Ladens.",
    ton: "138, 99, 255",
  },
  {
    src: "/stock/dooh-2.webp",
    alt: "Digitale Menuetafeln ueber der Theke eines Cafes.",
    ton: "111, 155, 255",
  },
  {
    src: "/stock/dooh-3.webp",
    alt: "Zwei digitale Speisekarten im Fenster eines Imbisses, von der Strasse aus gesehen.",
    ton: "185, 165, 255",
  },
];

const TAKT = 4200;

function BoardStage() {
  const feld = useRef<HTMLDivElement>(null);
  const ruhig = useSafeReducedMotion();
  const drin = useImBild(feld);
  const [i, setI] = useState(0);
  // Ein Griff des Besuchers haelt den Rundlauf an. Wer selbst blaettert,
  // will nicht drei Sekunden spaeter weitergeschoben werden.
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
        <div className={styles.bdScreen}>
          {TAFELN.map((t, n) => (
            <img
              key={t.src}
              className={styles.bdBild}
              data-an={n === i ? "" : undefined}
              src={t.src}
              alt={t.alt}
              width={1400}
              height={788}
              loading={n === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
          <span className={styles.bdRaster} />
          <span className={styles.bdGlanz} />
          <span className={styles.bdSaum} />
        </div>

        {/* Hals, Fusz und der Schatten darunter. Erst sie machen aus der
            Flaeche ein Geraet, das irgendwo steht. */}
        <span className={styles.bdHals} />
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
