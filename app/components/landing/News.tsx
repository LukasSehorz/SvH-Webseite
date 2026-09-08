"use client";

/* ------------------------------------------------------------------
   BAUVERTRAG

   THESE. Eine Agentur, die vom KI-Zeitalter spricht, musz zeigen, dass
   sie mittendrin steht. Diese Sektion belegt das mit dem, was gerade
   veroeffentlicht wurde, statt es zu behaupten.

   EIGENE WELT. Dieselbe dunkle Flaeche wie die uebrige Startseite,
   Haarlinien als Taktstriche, ein Farbnebel in der Rampe hinter dem
   ersten Vorschaubild. Neu ist allein das Abspielzeichen, und das ist
   ein Kreis mit einem Dreieck, gezeichnet wie alle anderen Zeichen der
   Seite mit der Strichstaerke der Marke.

   GESCHICHTE. Der neueste Beitrag steht grosz und quer, die aelteren
   folgen als Reihe darunter. So liest die Sektion wie eine Redaktion und
   nicht wie ein Raster gleicher Kacheln.

   FORM. Ein breiter Block, darunter zwei schmale. Ab tausend Bildpunkten
   steht der grosze Block zweispaltig mit Bild links und Text rechts,
   darunter stapelt alles.

   ES WIRD NICHTS EINGEBETTET, und das ist eine Entscheidung ueber
   Datenschutz und nicht ueber Gestaltung. Ein Abspielfenster von YouTube
   holt beim ersten Aufruf Kennungen von Google, ohne dass der Besucher
   etwas angeklickt haette. Gezeigt wird deshalb das Vorschaubild aus
   public/aktuelles, und erst der Klick fuehrt zu YouTube.
   ------------------------------------------------------------------ */

import { useRef } from "react";
import { useInView } from "framer-motion";
import { aktuelles } from "../../copy";
import { CircleLink, GradientWord, Reveal, SectionLabel } from "../system/ui";

type Beitrag = (typeof aktuelles.beitraege)[number];

/** Kreis mit Dreieck. Er sagt ohne Wort, dass hinter dem Bild ein Video
 *  liegt, und traegt dieselbe Strichstaerke wie die uebrigen Zeichen. */
function PlayMark() {
  return (
    <span className="nw-play" aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="21" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M18 15.4 29 22l-11 6.6z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Ein Beitrag. Die ganze Flaeche ist der Verweis, denn wer auf ein
 * Vorschaubild zeigt, will das Video sehen und nicht erst eine Zeile
 * darunter suchen.
 *
 * `gross` steht fuer den neuesten Beitrag. Er traegt ein breiteres Bild,
 * eine groeszere Zeile und den Farbnebel.
 */
function Karte({
  beitrag,
  gross,
  index,
}: Readonly<{ beitrag: Beitrag; gross?: boolean; index: number }>) {
  const box = useRef<HTMLElement>(null);
  const drin = useInView(box, { once: true, margin: "0px 0px -14% 0px" });

  return (
    <article
      ref={box}
      className="nw-card"
      data-gross={gross ? "" : undefined}
      data-in={drin ? "" : undefined}
      style={{ "--k": index } as React.CSSProperties}
    >
      <a
        className="nw-link"
        href={beitrag.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="nw-shot">
          {gross ? <span className="nw-mist" aria-hidden="true" /> : null}
          <img
            src={beitrag.bild}
            alt={beitrag.alt}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
          />
          <span className="nw-veil" aria-hidden="true" />
          <PlayMark />
        </span>

        <span className="nw-text">
          <time className="t-label nw-date" dateTime={beitrag.datumIso}>
            {beitrag.datum}
          </time>
          <span className="nw-title">{beitrag.titel}</span>
          <span className="t-body nw-body">{beitrag.body}</span>
        </span>
      </a>
    </article>
  );
}

export default function News() {
  const [neuester, ...weitere] = aktuelles.beitraege;

  return (
    <section className="section news" id="aktuelles">
      <div className="shell">
        <SectionLabel>{aktuelles.label}</SectionLabel>

        <div className="nw-head">
          <Reveal>
            <h2 className="t-h1 nw-title-main">
              {aktuelles.titleBefore}{" "}
              <GradientWord>{aktuelles.gradientWord}</GradientWord>
              {aktuelles.titleAfter ? <> {aktuelles.titleAfter}</> : null}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="t-body-lg nw-intro">{aktuelles.intro}</p>
          </Reveal>
        </div>

        <div className="nw-lead">
          <Karte beitrag={neuester} gross index={0} />
        </div>

        <div className="nw-rest">
          {weitere.map((beitrag, i) => (
            <Karte key={beitrag.id} beitrag={beitrag} index={i + 1} />
          ))}
        </div>

        <div className="nw-foot">
          <p className="nw-note">{aktuelles.hinweis}</p>
          <CircleLink href={aktuelles.kanal.href} label={aktuelles.kanal.label} />
        </div>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.news` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `Reveal` weiterreicht.
      */}
      <style jsx global>{`
        .news .nw-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px 64px;
          align-items: start;
          margin-bottom: clamp(40px, 5vw, 68px);
        }

        .news .nw-title-main {
          max-width: 14ch;
          text-wrap: balance;
        }

        .news .nw-intro {
          padding-top: 8px;
          max-width: var(--measure);
        }

        /* Der neueste Beitrag steht quer ueber die ganze Schale, die
           beiden aelteren darunter nebeneinander. Drei gleich grosze
           Kacheln haetten sich als Raster gelesen, und die Startseite
           vermeidet das an jeder Stelle. */
        .news .nw-rest {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(22px, 2.4vw, 40px);
          margin-top: clamp(22px, 2.4vw, 40px);
        }

        .news .nw-card {
          position: relative;
        }

        .news .nw-link {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 20px;
          color: var(--ink);
        }

        .news .nw-card[data-gross] .nw-link {
          gap: clamp(24px, 3vw, 48px);
        }

        @media (min-width: 1000px) {
          .news .nw-card[data-gross] .nw-link {
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
            align-items: center;
          }
        }

        /* Das Vorschaubild. Der Rahmen traegt eine Haarlinie und beschneidet
           das Bild, damit alle drei dasselbe Verhaeltnis zeigen. */
        .news .nw-shot {
          position: relative;
          display: block;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--bg-raise);
          aspect-ratio: 16 / 9;
          transform: translateZ(0);
          transition:
            border-color 0.5s var(--ease-out-expo),
            transform 0.5s var(--ease-out-expo);
        }

        .news .nw-shot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* Die Vorschaubilder sind von YouTube und tragen ihre eigene
             Bildsprache. Etwas zurueckgenommen ordnen sie sich dem dunklen
             Grund unter, ohne unkenntlich zu werden. */
          opacity: 0.86;
          transition:
            opacity 0.5s var(--ease-out-expo),
            transform 0.7s var(--ease-out-expo);
        }

        /* Ein Schleier von unten, damit das Abspielzeichen auf jedem Bild
           steht, auch auf einem hellen. */
        .news .nw-veil {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(5, 5, 7, 0.1) 0%,
            rgba(5, 5, 7, 0) 42%,
            rgba(5, 5, 7, 0.42) 100%
          );
        }

        /* Der Farbnebel hinter dem groszen Bild. Er liegt hinter dem
           Rahmen und leuchtet ueber seine Kanten hinaus. */
        .news .nw-mist {
          position: absolute;
          inset: -14% -8%;
          z-index: -1;
          border-radius: 9999px;
          background: radial-gradient(
            ellipse at 50% 50%,
            var(--acc-violet) 0%,
            var(--acc-blue) 46%,
            transparent 72%
          );
          opacity: 0.18;
          filter: blur(56px);
          pointer-events: none;
        }

        .news .nw-play {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(48px, 5vw, 64px);
          height: clamp(48px, 5vw, 64px);
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          border-radius: 9999px;
          color: var(--ink);
          background: rgba(5, 5, 7, 0.42);
          backdrop-filter: blur(6px);
          transition:
            background-color 0.5s var(--ease-out-expo),
            transform 0.5s var(--ease-out-expo);
        }

        .news .nw-play svg {
          width: 62%;
          height: 62%;
        }

        .news .nw-text {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .news .nw-date {
          color: var(--ink-3);
        }

        /* Die Titel kommen unveraendert vom Kanal und tragen dort Versalien
           und drei Punkte am Ende. Sie stehen deshalb in der Sansschrift
           und nicht in der Displayschrift; gesetzt in Inter Tight wirkten
           sie wie eine Ueberschrift dieser Seite, und das sind sie nicht. */
        .news .nw-title {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 500;
          line-height: 1.35;
          letter-spacing: -0.008em;
          color: var(--ink);
          transition: color 0.4s var(--ease-out-expo);
        }

        .news .nw-card[data-gross] .nw-title {
          font-family: var(--font-display);
          font-size: clamp(24px, 2.3vw, 34px);
          font-weight: 300;
          line-height: 1.16;
          letter-spacing: -0.018em;
        }

        .news .nw-body {
          color: var(--ink-2);
          max-width: 46ch;
        }

        /* Beim Eintritt steigt jede Karte einmal auf. Der Versatz je Karte
           haelt die Reihe im Takt der uebrigen Sektionen. */
        .news .nw-card {
          opacity: 0;
          transform: translate3d(0, 22px, 0);
          transition:
            opacity 0.8s var(--ease-out-expo),
            transform 0.8s var(--ease-out-expo);
          transition-delay: calc(var(--k, 0) * 110ms);
        }

        .news .nw-card[data-in] {
          opacity: 1;
          transform: none;
        }

        @media (hover: hover) and (pointer: fine) {
          .news .nw-link:hover .nw-shot {
            border-color: rgba(244, 244, 246, 0.28);
            transform: translateY(-3px);
          }

          .news .nw-link:hover .nw-shot img {
            opacity: 1;
            transform: scale(1.03);
          }

          .news .nw-link:hover .nw-play {
            background: rgba(124, 106, 255, 0.72);
            transform: translate(-50%, -50%) scale(1.06);
          }

          .news .nw-link:hover .nw-title {
            color: var(--acc-lav);
          }
        }

        .news .nw-link:focus-visible .nw-shot {
          outline: 2px solid var(--acc-violet);
          outline-offset: 3px;
        }

        .news .nw-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: clamp(34px, 4vw, 56px);
          padding-top: 24px;
          border-top: 1px solid var(--line-2);
        }

        .news .nw-note {
          margin: 0;
          font-size: 13.5px;
          color: var(--ink-3);
        }

        @media (max-width: 900px) {
          .news .nw-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .news .nw-intro {
            padding-top: 0;
          }

          /* Auf dem Telefon stehen die beiden aelteren Beitraege
             untereinander. Nebeneinander waere jedes Vorschaubild rund 170
             Bildpunkte breit, und darauf ist von der Aufnahme nichts mehr
             zu erkennen. */
          .news .nw-rest {
            grid-template-columns: minmax(0, 1fr);
          }

          .news .nw-title {
            font-size: 16.5px;
          }

          /* Die Zeile mit dem Datum steht in der Beschriftungsstufe und
             folgt deren Anhebung auf dem Telefon. */
          .news .nw-note {
            font-size: 13px;
          }

          .news .nw-foot {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .news .nw-card,
          .news .nw-shot,
          .news .nw-shot img,
          .news .nw-play,
          .news .nw-title {
            transition: none;
          }

          .news .nw-card {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
