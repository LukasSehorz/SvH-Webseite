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
/*  01 Webseite   Eine Suche findet den Betrieb, Besucher laufen in    */
/*                das Fenster, die gezeichnete Seite scrollt durch,     */
/*                der Termin wird gebucht, und die Anfrage kommt auf     */
/*                dem Telefon des Betriebs an.                          */
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

/* ZWOELF ABSCHNITTE, UND SIE ERZAEHLEN IN EINER SCHLEIFE, WIE EINE
   WEBSEITE KUNDEN GEWINNT. Der Auftraggeber wollte in dieser Szene mehr
   Motive sehen als die Fahrt zum Formular. Die Geschichte laeuft deshalb
   in fuenf Bildern. Jemand sucht und findet den Betrieb, das Fenster
   tritt vor und Besucher laufen auf drei Wegen hinein, die Seite
   ueberzeugt beim Durchrollen mit Telefonzeile, Sternen und Karte, der
   Termin wird gebucht, und die Anfrage kommt auf dem Telefon des
   Betriebs an.
   Die Dauern stehen in Millisekunden und gehoeren zum jeweiligen
   Abschnitt, nicht zum Uebergang dorthin. Die Uebergangsdauern stehen
   im Blatt bei der jeweiligen Regel.
   Die 2600 im siebten Abschnitt sind zugleich die Dauer der Fahrt im
   Blatt. Wer eines von beiden aendert, aendert das andere mit, sonst
   haelt die Seite mitten in der Bewegung an. */
const WEB_TAKT = [
  900, // 0. Ruhe. Das Suchfeld steht leer vor dem gedimmten Fenster.
  1300, // 1. Das Suchwort tippt sich in das Feld.
  900, // 2. Die Trefferliste klappt auf, und der erste Treffer leuchtet.
  700, // 3. Der Zeiger faehrt auf den ersten Treffer.
  260, // 4. Der Druck auf den Treffer.
  900, // 5. Die Suche weicht, das Fenster tritt vor, die Gaeste laufen los.
  2600, // 6. Die Fahrt durch die Seite, die Sterne leuchten nacheinander auf.
  700, // 7. Halt am Formular, die Ortsmarke faellt auf die Karte.
  950, // 8. Der Zeiger faehrt zum Knopf.
  340, // 9. Der Druck auf den Knopf.
  1500, // 10. Der Termin ist bestaetigt.
  2400, // 11. Die Anfrage steht auf dem Telefon, und der Zaehler springt um eins.
] as const;

/** Der letzte Abschnitt ist der Endzustand. Bei reduzierter Bewegung
 *  steht die Szene sofort dort, mit Seite am Formular, Bestaetigung und
 *  Meldung auf dem Telefon. */
const WEB_ENDE = WEB_TAKT.length - 1;

/** Die drei Wege, auf denen Besucher zu einer Seite kommen. Suche, Anruf
 *  und Karte. Der Wert k ist die Lage in der Spalte links vom Fenster,
 *  oben, Mitte und unten, und damit zugleich die Richtung, aus der die
 *  Gaeste zum Fenster laufen. Die Zeichen sind gezeichnet und tragen
 *  dieselbe Strichstaerke wie die Marken unter der Buehne. */
const WEGE: readonly { id: string; k: number; d: readonly string[] }[] = [
  {
    id: "suche",
    k: -1,
    d: ["M3.2 7.2a4 4 0 1 0 8 0 4 4 0 0 0-8 0z", "M10.2 10.2l3.4 3.4"],
  },
  {
    id: "anruf",
    k: 0,
    d: [
      "M4.4 2.8h2.4l1.3 3.1-1.6 1.2a8 8 0 0 0 3.4 3.4l1.2-1.6 3.1 1.3v2.4a1.4 1.4 0 0 1-1.5 1.4A11.2 11.2 0 0 1 3 4.3a1.4 1.4 0 0 1 1.4-1.5z",
    ],
  },
  {
    id: "karte",
    k: 1,
    d: [
      "M8 14.2s4.4-4.3 4.4-7.4a4.4 4.4 0 1 0-8.8 0c0 3.1 4.4 7.4 4.4 7.4z",
      "M8 8.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z",
    ],
  },
];

/** Ein Gast, gezeichnet als Kopf und Schultern in einem Kreis. */
const GAST = [
  "M8 7.6a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z",
  "M3.8 13a4.2 4.2 0 0 1 8.4 0",
] as const;

/** Der Stern der Bewertungszeile. Fuenf davon stehen in der Seite, und
 *  eine Zahl steht bewusst nicht daneben. */
const STERN =
  "M8 1.7l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11.7l-3.9 2.1.8-4.4L1.7 6.3l4.4-.6z";

/** Der Zeiger, den beide Klicks der Szene benutzen. Einer sitzt in der
 *  Trefferliste, der andere im Formular, damit jeder mit seinem Blatt
 *  mitfaehrt und sein Weg eine kurze Strecke bleibt. */
function Zeiger({ className }: Readonly<{ className: string }>) {
  return (
    <span className={className} aria-hidden="true">
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
  );
}

/** Ein gezeichnetes Zeichen aus einer Pfadliste, Strichstaerke 1,4. */
function Zeichen({
  d,
  className,
}: Readonly<{ d: readonly string[]; className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {d.map((pfad) => (
        <path
          key={pfad}
          d={pfad}
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

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
  const [anfragen, setAnfragen] = useState(0);

  /* Der Zaehler springt, sobald die Meldung auf dem Telefon steht, und
     zaehlt ueber die Runden hinweg weiter. Er ist eine Vorfuehrung und
     keine Kennzahl, deshalb beginnt er bei null und hat kein Ziel. Bei
     reduzierter Bewegung steht statt einer Zahl ein Haken, denn dort
     gibt es keine Runde, in der er springen koennte. */
  useEffect(() => {
    if (ruhig || p !== WEB_ENDE) return;
    setAnfragen((n) => n + 1);
  }, [p, ruhig]);

  return (
    <div
      className={styles.wbWrap}
      ref={feld}
      data-p={p}
      aria-hidden="true"
      onPointerEnter={() => setNeu((n) => n + 1)}
    >
      <div className={styles.wbBuehne}>
        {/* Die drei Wege links vom Fenster. Aus jedem laufen zwei Gaeste
            an gepunkteten Leitlinien entlang zur Mitte der linken
            Fensterkante und verschwinden dort hinein. Das zeigt ohne ein
            Wort, dass Besucher aus der Suche, vom Telefon und von der
            Karte auf derselben Seite ankommen. */}
        <div className={styles.wbQuellen}>
          <svg
            className={styles.wbPfade}
            viewBox="0 0 100 400"
            preserveAspectRatio="none"
            fill="none"
          >
            {["M36 45C72 45 66 200 104 200", "M42 200H104", "M36 355C72 355 66 200 104 200"].map(
              (d) => (
                <path
                  key={d}
                  d={d}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="1.5 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ),
            )}
          </svg>
          {WEGE.map((weg, i) => (
            <span
              className={styles.wbQuelle}
              key={weg.id}
              data-weg={weg.id}
              style={{ "--k": weg.k } as React.CSSProperties}
            >
              <Zeichen d={weg.d} />
              {[0, 1].map((n) => (
                <span
                  className={styles.wbGast}
                  key={n}
                  style={{ "--i": i + n * 3 } as React.CSSProperties}
                >
                  <Zeichen d={GAST} />
                </span>
              ))}
            </span>
          ))}
        </div>

        <div className={styles.wbFenster}>
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
                    {/* Die Telefonzeile im Kopf. Sie leuchtet kurz auf,
                        sobald das Fenster vorgetreten ist, denn die
                        Nummer ist das Erste, was ein Besucher sucht. */}
                    <span className={styles.wbTel}>
                      <span className={styles.wbTelLicht} />
                      <Zeichen d={WEGE[1].d} />
                      <Zeile breite="max(24px, 2.92cqw)" />
                    </span>
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

                {/* Bildschirm 2. Drei Leistungen als Karten, darueber die
                    Bewertungszeile mit fuenf Sternen, die beim
                    Vorbeirollen nacheinander aufleuchten. */}
                <div className={styles.wbSchirm}>
                  <div className={styles.wbKopfzeile}>
                    <Zeile breite="34%" stark gross />
                    <span className={styles.wbSterne}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <svg
                          className={styles.wbStern}
                          key={i}
                          viewBox="0 0 16 16"
                          style={{ "--i": i } as React.CSSProperties}
                        >
                          <path
                            d={STERN}
                            fill="currentColor"
                            fillOpacity={0.35}
                            stroke="currentColor"
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                          />
                        </svg>
                      ))}
                      <Zeile breite="max(22px, 2.68cqw)" />
                    </span>
                  </div>
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
                    links die Anrede, drei Wege zum Betrieb und der
                    Kartenausschnitt, rechts das Formular. Eine einzelne
                    Formularsaeule ueber die ganze Breite hat als graue
                    Flaeche gelesen. */}
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
                      {/* Der Kartenausschnitt. Zwei Wege als Linien und
                          eine Ortsmarke, die faellt, sobald die Fahrt am
                          Formular haelt. */}
                      <span className={styles.wbOrt}>
                        <svg viewBox="0 0 100 56" preserveAspectRatio="none" fill="none">
                          <path
                            d="M0 33C28 30 44 44 100 25"
                            stroke="currentColor"
                            strokeWidth={1.4}
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d="M36 0C42 18 30 40 46 56"
                            stroke="currentColor"
                            strokeWidth={1.4}
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        <span className={styles.wbOrtHof} />
                        <svg className={styles.wbOrtMarke} viewBox="0 0 16 16" fill="none">
                          <path
                            d={WEGE[2].d[0]}
                            fill="currentColor"
                            fillOpacity={0.3}
                            stroke="currentColor"
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                          />
                          <path d={WEGE[2].d[1]} stroke="currentColor" strokeWidth={1.4} />
                        </svg>
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
                      <Zeiger className={styles.wbZeiger} />
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

            {/* Der Schleier ueber dem Fenster, solange die Suche davor
                steht. Er hebt sich, sobald der Treffer geklickt ist. */}
            <span className={styles.wbScrim} />
          </div>

          {/* Die Suche vor dem Fenster. Ein Feld, in das sich das Suchwort
              tippt, darunter drei Treffer, deren erster die Adresse des
              Betriebs traegt und hervorgehoben wird. Der Zeiger klickt
              ihn, und das Fenster tritt vor. */}
          <div className={styles.wbSuche}>
            <div className={styles.wbSuchFeld}>
              <Zeichen d={WEGE[0].d} />
              <span className={styles.wbSuchWort}>
                {worte.suche}
                <span className={styles.wbSuchStrich} />
              </span>
            </div>
            <div className={styles.wbTreffer}>
              <span
                className={styles.wbTrefferZeile}
                data-erster=""
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <span className={styles.wbTrefferLicht} />
                <span className={styles.wbTrefferMarke} />
                <span className={styles.wbTrefferText}>
                  <span className={styles.wbTrefferAdresse}>{worte.adresse}</span>
                  <Zeile breite="64%" />
                </span>
              </span>
              {[1, 2].map((i) => (
                <span
                  className={styles.wbTrefferZeile}
                  key={i}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className={styles.wbTrefferMarke} />
                  <span className={styles.wbTrefferText}>
                    <Zeile breite={i === 1 ? "38%" : "46%"} />
                    <Zeile breite={i === 1 ? "72%" : "58%"} />
                  </span>
                </span>
              ))}
            </div>
            <Zeiger className={styles.wbSuchZeiger} />
          </div>

          <span className={styles.wbSchein} aria-hidden="true" />
        </div>

        {/* Rechts vom Fenster der Zaehler und das Telefon des Betriebs.
            Beide ragen ein Stueck vor das Fenster, so wie der Zaehler der
            Social-Buehne vor dem Beitrag liegt. Auf dem Telefon leuchtet
            am Ende jeder Runde die Meldung auf, und der Zaehler springt
            um eins. */}
        <div className={styles.wbZiel}>
          <div className={styles.wbZaehler}>
            <span
              className={styles.wbZaehlerWert}
              key={ruhig ? "haken" : anfragen}
            >
              {ruhig ? (
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4.6 10.4 8.4 14l7-8"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                anfragen
              )}
            </span>
            <span className={styles.wbZaehlerMarke}>
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M1.8 3.2h8.4v5.8H1.8zM1.8 3.4 6 6.7l4.2-3.3"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {worte.zaehler}
            </span>
          </div>

          <div className={styles.wbHandy}>
            <span className={styles.wbHandyKerbe} />
            <span className={styles.wbHandyLicht} />
            <span className={styles.wbMeldung}>
              <Zeichen
                d={[
                  "M4.2 11.2V7.6a3.8 3.8 0 0 1 7.6 0v3.6l1 1.4H3.2z",
                  "M6.6 13.6a1.4 1.4 0 0 0 2.8 0",
                ]}
              />
              {worte.anfrage}
            </span>
            <span className={styles.wbHandyZeilen}>
              <Zeile breite="82%" />
              <Zeile breite="54%" />
            </span>
          </div>
        </div>
      </div>
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
