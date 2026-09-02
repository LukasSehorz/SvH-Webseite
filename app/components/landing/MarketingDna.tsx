"use client";

/* ------------------------------------------------------------------
   BAUVERTRAG

   THESE. Marketing ist keine Liste von Leistungen, sondern drei
   Handwerke, die man arbeiten sehen muss, um sie zu verstehen.

   EIGENE WELT. Schwarzer Grund, blau bis lavendel, Haarlinien. Jeder
   Strang bekommt einen eigenen Ton aus dieser Reihe, und sein Licht
   klingt in den naechsten hinueber, damit drei Bloecke eine Sektion
   bleiben.

   GESCHICHTE. Drei Buehnen fuehren vor, was sie behaupten. Eine Seite
   scrollt und nimmt einen Termin an, ein Zaehler laeuft von null hoch,
   eine Tafel wechselt ihr Bild und faerbt das Licht davor mit.

   ERSTER BILDSCHIRM. Kopf, drei Ringe, darunter der erste Strang mit
   seinem laufenden Browserfenster ueber die volle nutzbare Breite.

   FORM. Oben, rechts, links. Die drei Buehnen stehen verschieden, damit
   niemand dreimal dasselbe liest. Text nur so viel, wie ein Kind
   braucht.
   ------------------------------------------------------------------ */

import { useRef } from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { marketingDna } from "../../copy";
import RingStat from "../marketing/RingStat";
import StrandStage from "../marketing/StrandStage";
import styles from "../marketing/marketing.module.css";
import {
  CircleLink,
  GradientWord,
  Reveal,
  SectionLabel,
} from "../system/ui";

/* ------------------------------------------------------------------ */
/*  S4v2 · Marketing-DNA                                               */
/*                                                                     */
/*  Im Grund liegt das Partikelband, davor stehen Kopf, drei           */
/*  Ring-Zaehler und die drei Leistungsstraenge.                       */
/*                                                                     */
/*  DIE BLOCKBEWEGUNG LIEGT JETZT IM BLATT UND NICHT MEHR IN           */
/*  FRAMER-MOTION. Vorher trug jede der achtzehn Marken und jedes der  */
/*  neun Kettenglieder eine eigene motion-Komponente. Seit die drei    */
/*  Buehnen laufende Szenen sind, gehoert der Hauptfaden der Struktur  */
/*  und den Szenen; die Einblendungen laufen deshalb ueber ein         */
/*  data-Merkmal am Strang und eine Verzoegerung je Glied.             */
/*                                                                     */
/*  Die Straenge stehen im Wechsel: das Schaustueck von 01 liegt oben  */
/*  ueber der ganzen Breite, das von 02 rechts neben den Marken, das   */
/*  von 03 links neben der Kette. Drei gleich gebaute Bloecke haben    */
/*  sich als dreimal dasselbe gelesen, und genau das war der Anlasz.   */
/* ------------------------------------------------------------------ */

/** Linien-Icons je Strang. Sie werden beim Eintritt der Zeile von links
 *  nach rechts aufgedeckt. Der Schnitt liegt auf clip-path und nicht auf
 *  der Strichlaenge, damit die Sektion nur Eigenschaften bewegt, die
 *  ohne Neuzeichnen auskommen. */
const ICONS: Record<string, readonly string[]> = {
  web: [
    "M5 6.5h18a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 20V8A1.5 1.5 0 0 1 5 6.5Z",
    "M3.5 11.4h21",
    "M6.2 8.9h1.4",
    "M9.4 8.9h1.4",
  ],
  social: [
    "M6.5 5.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8.4L9 21.6v-4.1H6.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z",
    "M14 14.6l-2.7-2.6a1.75 1.75 0 0 1 2.7-2.2 1.75 1.75 0 0 1 2.7 2.2L14 14.6Z",
  ],
  dooh: [
    "M4.5 5.5h19a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z",
    "M8.5 9.4h11",
    "M8.5 12.8h7",
    "M14 16.5v6",
    "M10 22.5h8",
  ],
};

function StrandIcon({ id }: Readonly<{ id: string }>) {
  const paths = ICONS[id] ?? ICONS.web;

  return (
    <svg
      className={styles.strandIcon}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

type Strang = (typeof marketingDna.strands)[number];

/* Die Zeichen zu den Leistungsmarken.
 *
 *  Der Auftraggeber hat die Sektion mehrfach als zu textlastig
 *  bezeichnet und zuletzt ausdruecklich verlangt, je Punkt nur noch zwei
 *  bis drei Woerter zu schreiben und dafuer mit Zeichen und Formen zu
 *  arbeiten. Der volle Wortlaut steht weiterhin in copy.ts unter lang
 *  und wandert in das Titelattribut, damit er weder verloren geht noch
 *  der Vorlesesoftware fehlt.
 *
 *  Gezeichnet und nicht aus einer Schriftart geholt, damit alle
 *  dieselbe Strichstaerke tragen wie die Strangzeichen darueber. */
const MARK: Record<string, readonly string[]> = {
  design: ["M3.2 3.2h9v9h-9z", "M7.8 7.8h9v9h-9z"],
  pen: ["M3.4 16.6l3.4-1 8.4-8.4-2.4-2.4-8.4 8.4-1 3.4z", "M12.2 5.6l2.4 2.4"],
  gauge: ["M3.2 14.6a6.8 6.8 0 0 1 13.6 0", "M10 14.6l3.4-3.6"],
  search: ["M4.2 9a4.8 4.8 0 1 0 9.6 0 4.8 4.8 0 0 0-9.6 0z", "M13.4 13.4l3.4 3.4"],
  form: ["M4 3.2h12v13.6H4z", "M7 7.2h6", "M7 10.2h6", "M7 13.2h3.4"],
  cycle: ["M16.4 10a6.4 6.4 0 1 1-2-4.6", "M16.6 3.4v3.6h-3.6"],
  calendar: ["M3.2 5.2h13.6v11.6H3.2z", "M3.2 9h13.6", "M6.8 3.2v3.6", "M13.2 3.2v3.6"],
  camera: [
    "M3.2 6.4h3l1.5-2.2h4.6l1.5 2.2h3v10.2H3.2z",
    "M10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ],
  scissors: [
    "M4.6 16.4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M15.4 16.4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M5.6 12.8L15 3.4",
    "M14.4 12.8L5 3.4",
  ],
  megaphone: ["M3.6 8.2v3.6h3l6 3.8V4.4l-6 3.8h-3z", "M15.4 8a3 3 0 0 1 0 4"],
  chat: ["M3.2 4h13.6v9.2H8.4l-4 3.8v-3.8H3.2z"],
  chart: ["M3.6 16.8V9.4", "M7.8 16.8V3.8", "M12.2 16.8v-5.6", "M16.4 16.8V7"],
  pin: [
    "M10 17.6s5.8-5.6 5.8-9.6a5.8 5.8 0 1 0-11.6 0c0 4 5.8 9.6 5.8 9.6z",
    "M10 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z",
  ],
  palette: [
    "M10 3.2a6.8 6.8 0 1 0 0 13.6c1 0 1.6-.6 1.6-1.4 0-.8-.6-1.2-.6-1.8 0-.5.4-1 1-1h1a3.8 3.8 0 0 0 3.8-3.8c0-3.2-3-5.6-6.8-5.6z",
    "M6.6 9.4h.02",
    "M9.4 6.8h.02",
  ],
  remote: ["M6.2 12.8a5.4 5.4 0 0 1 7.6 0", "M3.6 9.8a9 9 0 0 1 12.8 0", "M10 16.2h.02"],
  clock: ["M10 3.6a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8z", "M10 6.6v3.8l2.6 1.8"],
  link: [
    "M8.4 11.6a3.2 3.2 0 0 0 4.5 0l2.4-2.4a3.2 3.2 0 0 0-4.5-4.5l-1 1",
    "M11.6 8.4a3.2 3.2 0 0 0-4.5 0l-2.4 2.4a3.2 3.2 0 0 0 4.5 4.5l1-1",
  ],
  todo: ["M10 3.4v8.4", "M10 15.6h.02", "M10 2.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z"],
};

function Mark({ id }: Readonly<{ id: string }>) {
  const paths = MARK[id] ?? MARK.design;
  return (
    <svg className={styles.markGlyph} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* Umfang und Ablauf stehen als eigene Bausteine da, weil die drei
   Straenge sie an verschiedenen Stellen und in verschiedener Richtung
   einsetzen. Ohne diese Trennung stuende dasselbe Geruest dreimal im
   Quelltext und liefe beim naechsten Eingriff auseinander. */
function Points({
  strand,
  spalten,
}: Readonly<{ strand: Strang; spalten: number }>) {
  return (
    <section className={styles.strandBlock}>
      <h4 className={`t-label ${styles.strandBlockLabel}`}>
        {strand.pointsTitle}
      </h4>
      <ul className={styles.markGrid} data-spalten={spalten}>
        {strand.points.map((point, i) => (
          <li
            className={styles.markChip}
            key={point.text}
            style={{ "--i": i } as React.CSSProperties}
          >
            <Mark id={point.icon} />
            <span className={styles.markText}>{point.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Steps({
  strand,
  fluss,
}: Readonly<{ strand: Strang; fluss: "quer" | "senkrecht" }>) {
  return (
    <section className={styles.strandBlock}>
      <h4 className={`t-label ${styles.strandBlockLabel}`}>
        {strand.stepsTitle}
      </h4>
      {/* DER ABLAUF TRAEGT NUR NOCH SEINE DREI TITEL. Die erklaerenden
          Saetze stehen weiterhin in copy.ts, gezeigt wird aber allein die
          Folge. Als Kette gelesen sagt sie ohnehin mehr als die Saetze. */}
      <ol className={styles.stepTrack} data-fluss={fluss}>
        {strand.steps.map((step, i) => (
          <li
            className={styles.stepChip}
            key={step.n}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.stepDot} aria-hidden="true" />
            <span className={styles.stepNum} aria-hidden="true">
              {step.n}
            </span>
            <span className={styles.stepTitle}>{step.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Der stille Verweis auf die Unterseite. Ein Link ohne Rahmen, dessen
 *  Pfeil beim Zeigen ein Stueck weiterrueckt. Er steht am Ende des
 *  Stranges, weil er dort das Weiterlesen anbietet und nicht davon
 *  ablenkt. */
function StillerLink({ label, href }: Readonly<{ label: string; href: string }>) {
  return (
    <Link className={styles.strandLink} href={href}>
      {label}
      <svg viewBox="0 0 20 12" fill="none" aria-hidden="true">
        <path
          d="M1 6h17M13.4 1.2 18.2 6l-4.8 4.8"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

/** Die Lage des Schaustuecks je Strang. Sie steht hier und nicht in
 *  copy.ts, denn sie ist eine Entscheidung ueber die Form und keine
 *  Aussage ueber das Angebot. */
const LAGE: Record<string, "oben" | "rechts" | "links"> = {
  web: "oben",
  social: "rechts",
  dooh: "links",
};

/** Der Ton je Strang. Er faerbt Zeichen, Kettenpunkte und den
 *  Lichtschein, der in den naechsten Strang ausklingt. Die drei Werte
 *  sind die Akzente der Marke, von Blau ueber Blauviolett nach
 *  Lavendel. */
const TON: Record<string, string> = {
  web: "91, 140, 255",
  social: "124, 106, 255",
  dooh: "185, 165, 255",
};

/* Jeder Strang hoert auf seinen eigenen Eintritt und nicht mehr auf den
   der ganzen Liste. Vorher trug ein einziger Beobachter alle drei, was bei
   einer Liste von 570 Bildpunkten Hoehe noch aufging. Nach dem Ausbau misst
   sie ein Vielfaches, und die unteren zwei Straenge waeren damit
   fertig eingeblendet, lange bevor sie ueberhaupt im Bild stehen. */
function Strand({ strand }: Readonly<{ strand: Strang }>) {
  const box = useRef<HTMLElement>(null);
  const drin = useInView(box, { once: true, margin: "0px 0px -18% 0px" });
  const lage = LAGE[strand.id] ?? "oben";

  const buehne = (
    <StrandStage id={strand.id} active={drin} worte={strand.szene} />
  );

  return (
    <article
      ref={box}
      className={styles.strand}
      data-strand={strand.id}
      data-lage={lage}
      data-drin={drin ? "" : undefined}
      style={{ "--st-ton": TON[strand.id] ?? TON.web } as React.CSSProperties}
    >
      <header className={styles.strandHead}>
        <span className={styles.strandNum} aria-hidden="true">
          {strand.n}
        </span>
        <StrandIcon id={strand.id} />
        <span className={styles.strandRegel} aria-hidden="true" />
      </header>

      <div className={styles.strandNaming}>
        <h3 className={`t-h2 ${styles.strandTitle}`}>{strand.title}</h3>
        <p className={`t-h3 ${styles.strandKicker}`}>{strand.kicker}</p>
      </div>

      {/* DIE DREI STRAENGE STEHEN VERSCHIEDEN, UND ZWAR ABSICHTLICH.
          01 traegt sein Fenster quer ueber die ganze nutzbare Breite,
          denn ein Browser ist quer. 02 stellt den Beitrag im Hochformat
          rechts neben die Marken, denn quer daneben bleibt Platz. 03
          stellt die Stele links und laeszt die Kette senkrecht daneben
          laufen, denn eine Stele ist hoch. */}
      {lage === "oben" ? (
        <div className={styles.strandBody}>
          {buehne}
          <div className={styles.strandTeil}>
            <Points strand={strand} spalten={3} />
          </div>
          <div className={styles.strandTeil}>
            <Steps strand={strand} fluss="quer" />
          </div>
        </div>
      ) : lage === "rechts" ? (
        <div className={styles.strandBody}>
          <div className={styles.strandPaar}>
            <Points strand={strand} spalten={1} />
            {buehne}
          </div>
          <div className={styles.strandTeil}>
            <Steps strand={strand} fluss="quer" />
          </div>
        </div>
      ) : (
        <div className={styles.strandBody}>
          <div className={styles.strandPaar}>
            {buehne}
            <Steps strand={strand} fluss="senkrecht" />
          </div>
          {/* Zwei Spalten und nicht drei. Dieser Strang traegt fuenf
              Marken, und in einem Dreierraster stand die letzte Reihe mit
              zwei Kacheln neben einer leeren dritten Spalte. */}
          <div className={styles.strandTeil}>
            <Points strand={strand} spalten={2} />
          </div>
        </div>
      )}

      <div className={styles.strandFoot}>
        <StillerLink label={strand.link.label} href={strand.link.href} />
      </div>

      {/* Der Lichtschein am Fusz. Er traegt den Ton des Stranges und
          reicht in den naechsten hinein, damit die drei Bloecke
          ineinander uebergehen statt aneinanderzustoszen. */}
      <span className={styles.strandAura} aria-hidden="true" />
    </article>
  );
}

export default function MarketingDna() {
  const rings = useRef<HTMLDivElement>(null);
  const ringsIn = useInView(rings, { once: true, margin: "0px 0px -18% 0px" });

  return (
    <section
      className={`${styles.dnaSection} section`}
      id="marketing"
      data-shot="dna"
    >
      {/* Die Struktur liegt in der DnaZone hinter dieser und der
          folgenden Sektion. Hier bleibt nur der leise Hof. */}
      <div className={styles.dnaWash} aria-hidden="true" />

      <div className={`shell ${styles.dnaInner}`}>
        <SectionLabel>{marketingDna.label}</SectionLabel>

        <Reveal>
          <h2 className={`t-h1 ${styles.dnaTitle}`}>
            {marketingDna.titleBefore}{" "}
            <GradientWord>{marketingDna.gradientWord}</GradientWord>
            {marketingDna.titleAfter ? <> {marketingDna.titleAfter}</> : null}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className={`t-body-lg ${styles.dnaIntro}`}>{marketingDna.intro}</p>
        </Reveal>

        <Reveal delay={0.16}>
          <p className={`t-body ${styles.dnaIntroMore}`}>
            {marketingDna.introMore}
          </p>
        </Reveal>

        <div className={styles.dnaRings} ref={rings} data-shot="dna-rings">
          {marketingDna.rings.map((entry, index) => (
            <RingStat
              key={entry.label}
              value={entry.value}
              label={entry.label}
              index={index}
              active={ringsIn}
            />
          ))}
        </div>

        <div className={styles.dnaStrands} data-shot="dna-strands">
          <p className={`t-label ${styles.dnaStrandsLabel}`}>
            {marketingDna.strandsLabel}
          </p>

          {marketingDna.strands.map((strand) => (
            <Strand key={strand.id} strand={strand} />
          ))}
        </div>

        <Reveal>
          <div className={styles.dnaClosing}>
            <p className={`t-label ${styles.dnaClosingLabel}`}>
              {marketingDna.closingLabel}
            </p>
            <p className={`t-body-lg ${styles.dnaClosingBody}`}>
              {marketingDna.closing}
            </p>
          </div>
        </Reveal>

        <div className={styles.dnaFoot}>
          <CircleLink
            href={marketingDna.link.href}
            label={marketingDna.link.label}
          />
        </div>
      </div>
    </section>
  );
}
