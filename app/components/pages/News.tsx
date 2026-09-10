"use client";

/* ------------------------------------------------------------------
   Die Liste der Beitraege auf der Seite /aktuelles.

   THESE. Eine Agentur, die vom KI-Zeitalter spricht, musz zeigen, dass
   sie mittendrin steht. Diese Liste belegt das mit dem, was gerade
   veroeffentlicht wurde, statt es zu behaupten.

   FORM. Jeder Beitrag steht in einer eigenen Zeile, alle gleich grosz,
   eine unter der anderen. Links das Vorschaubild, rechts Datum, Titel,
   ein Satz und der Verweis. Darueber eine Haarlinie mit der Nummer, wie
   die Leistungsreihen der Unterseite Webseiten sie tragen.

   Der erste Entwurf zeigte den neuesten Beitrag grosz und die aelteren
   klein darunter. Der Auftraggeber hat am 08.09.2026 verlangt, dass alle
   Beitraege dieselbe Groesze tragen, denn ein aelteres Video ist deshalb
   nicht weniger wert.

   ES WIRD NICHTS EINGEBETTET, und das ist eine Entscheidung ueber
   Datenschutz und nicht ueber Gestaltung. Ein Abspielfenster von YouTube
   holt beim ersten Aufruf Kennungen von Google, ohne dass der Besucher
   etwas angeklickt haette. Gezeigt wird deshalb das Vorschaubild aus
   public/aktuelles, und erst der Klick fuehrt zu YouTube.
   ------------------------------------------------------------------ */

import { useRef } from "react";
import { useInView } from "framer-motion";
import { aktuelles } from "../../copy";
import { CircleLink } from "../system/ui";

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

/** Der Pfeil am stillen Verweis. Er rueckt beim Zeigen ein Stueck weiter. */
function ArrowMark() {
  return (
    <svg viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <path
        d="M1 6h17M13.4 1.2 18.2 6l-4.8 4.8"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ein Beitrag als Zeile. Die ganze Flaeche ist der Verweis, denn wer auf
 * ein Vorschaubild zeigt, will das Video sehen und nicht erst eine Zeile
 * darunter suchen.
 */
function Zeile({
  beitrag,
  nummer,
}: Readonly<{ beitrag: Beitrag; nummer: number }>) {
  const box = useRef<HTMLElement>(null);
  const drin = useInView(box, { once: true, margin: "0px 0px -14% 0px" });

  return (
    <article
      ref={box}
      className="nw-row"
      data-in={drin ? "" : undefined}
    >
      <div className="nw-rule" aria-hidden="true">
        <span className="nw-num">{String(nummer).padStart(2, "0")}</span>
      </div>

      <a
        className="nw-link"
        href={beitrag.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="nw-shot">
          <span className="nw-mist" aria-hidden="true" />
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
          <span className="nw-go">
            {aktuelles.ansehen}
            <ArrowMark />
          </span>
        </span>
      </a>
    </article>
  );
}

export default function News() {
  return (
    <section className="news" id="beitraege">
      <div className="shell">
        {aktuelles.beitraege.map((beitrag, i) => (
          <Zeile key={beitrag.id} beitrag={beitrag} nummer={i + 1} />
        ))}

        <div className="nw-foot">
          <p className="nw-note">{aktuelles.hinweis}</p>
          <CircleLink href={aktuelles.kanal.href} label={aktuelles.kanal.label} />
        </div>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.news` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `CircleLink` weiterreicht.
      */}
      <style jsx global>{`
        .news {
          /* Der Kopf der Seite bringt seinen eigenen Abstand mit, deshalb
             steht hier nur der Abstand nach unten. */
          padding-bottom: var(--section-y);
        }

        /* Die Haarlinie mit der Nummer ist der Taktstrich zwischen zwei
           Beitraegen, so wie auf der Unterseite Webseiten. */
        .news .nw-rule {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .news .nw-rule::after {
          content: "";
          flex: 1 1 auto;
          height: 1px;
          background: var(--line);
        }

        .news .nw-num {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ink-3);
          font-variant-numeric: tabular-nums;
        }

        /* ALLE BEITRAEGE TRAGEN DIESELBE GROESZE. Das Bild nimmt gut die
           Haelfte der Breite, der Text steht rechts daneben und ist
           mittig zu ihm ausgerichtet. */
        .news .nw-link {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
          align-items: center;
          gap: clamp(32px, 4vw, 72px);
          padding-block: clamp(30px, 3.4vw, 56px);
          color: var(--ink);
        }

        /* Das Vorschaubild. Der Rahmen traegt eine Haarlinie und
           beschneidet das Bild, damit alle dasselbe Verhaeltnis zeigen. */
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
          opacity: 0.88;
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

        /* Der Farbnebel liegt hinter dem Rahmen und leuchtet ueber seine
           Kanten hinaus. Jeder Beitrag traegt ihn, denn alle sind gleich
           viel wert. */
        .news .nw-mist {
          position: absolute;
          inset: -12% -7%;
          z-index: -1;
          border-radius: 9999px;
          background: radial-gradient(
            ellipse at 50% 50%,
            var(--acc-violet) 0%,
            var(--acc-blue) 46%,
            transparent 72%
          );
          opacity: 0.16;
          filter: blur(52px);
          pointer-events: none;
        }

        .news .nw-play {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(52px, 4.6vw, 68px);
          height: clamp(52px, 4.6vw, 68px);
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          border-radius: 9999px;
          color: var(--ink);
          background: rgba(5, 5, 7, 0.44);
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
          gap: 14px;
          max-width: 44ch;
        }

        .news .nw-date {
          color: var(--ink-3);
        }

        /* Die Titel kommen unveraendert vom Kanal und tragen dort Versalien
           und drei Punkte am Ende. Sie stehen trotzdem in der
           Displayschrift, denn auf dieser Seite sind sie die Ueberschrift
           ihres Beitrags. */
        .news .nw-title {
          font-family: var(--font-display);
          font-size: clamp(23px, 2vw, 32px);
          font-weight: 300;
          line-height: 1.18;
          letter-spacing: -0.018em;
          color: var(--ink);
          transition: color 0.4s var(--ease-out-expo);
        }

        .news .nw-body {
          color: var(--ink-2);
        }

        /* Der stille Verweis am Fusz der Zeile. Er ist kein Knopf und
           bekommt deshalb keinen Rahmen. */
        .news .nw-go {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
          font-size: 14.5px;
          font-weight: 500;
          color: var(--ink-2);
          transition: color 0.4s var(--ease-out-expo);
        }

        .news .nw-go svg {
          width: 20px;
          height: 12px;
          transition: transform 0.45s var(--ease-out-expo);
        }

        /* Beim Eintritt steigt jede Zeile einmal auf. */
        .news .nw-row {
          opacity: 0;
          transform: translate3d(0, 22px, 0);
          transition:
            opacity 0.8s var(--ease-out-expo),
            transform 0.8s var(--ease-out-expo);
        }

        .news .nw-row[data-in] {
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

          .news .nw-link:hover .nw-go {
            color: var(--ink);
          }

          .news .nw-link:hover .nw-go svg {
            transform: translateX(5px);
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
          margin-top: clamp(20px, 2.4vw, 36px);
          padding-top: 24px;
          border-top: 1px solid var(--line-2);
        }

        .news .nw-note {
          margin: 0;
          font-size: 13.5px;
          color: var(--ink-3);
        }

        @media (max-width: 900px) {
          /* Auf dem Telefon steht der Text unter dem Bild. Nebeneinander
             waere das Bild rund 170 Bildpunkte breit, und darauf ist von
             der Aufnahme nichts mehr zu erkennen. */
          .news .nw-link {
            grid-template-columns: minmax(0, 1fr);
            gap: 22px;
            padding-block: 24px 34px;
          }

          .news .nw-text {
            max-width: none;
          }

          .news .nw-num {
            font-size: 12.5px;
          }

          .news .nw-note {
            font-size: 13px;
          }

          .news .nw-go {
            min-height: 40px;
          }

          .news .nw-foot {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .news .nw-row,
          .news .nw-shot,
          .news .nw-shot img,
          .news .nw-play,
          .news .nw-title,
          .news .nw-go,
          .news .nw-go svg {
            transition: none;
          }

          .news .nw-row {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
