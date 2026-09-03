/*
  BAUVERTRAG

  THESE. Eine Leistung erklaert man nicht, man zeigt sie einmal in
  Bewegung.

  EIGENE WELT. Dunkler Grund, Haarlinien, Weisstoene. Die blau bis
  violette Rampe traegt nur Striche und einen weichen Nebel, nie eine
  grosze Flaeche. Kein Bild, kein fremdes Zeichen.

  GESCHICHTE. Sechs Bausteine, jeder mit einem Namen, einem Satz und
  einer kleinen Szene. Die Szene laeuft beim Eintritt einmal an, bleibt
  in ihrem Endbild stehen und beginnt von vorn, sobald der Zeiger die
  Kachel beruehrt oder die Tastatur sie ansteuert.

  ERSTER BILDSCHIRM. Ueberschrift links, ein Satz rechts, darunter das
  Raster. Die obere Reihe laeuft an, sobald sie sichtbar wird.

  FORM. Drei Spalten, dann zwei, dann eine. Jede Szene fuellt ihren
  Rahmen bis an den Rand. Bewegt werden nur transform, opacity und
  filter.
*/

"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { kiTiles } from "../../copy";
import { Reveal, RevealGroup, useSafeReducedMotion } from "../system/ui";
import { TileScene, tileTotal, useReplay, type TileId } from "./tiles/Vignettes";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Der eigene Auftritt der Kachel. Das Raster stammt aus RevealGroup und
   staffelt die Kinder, die Kachel braucht dafuer nur ihre zwei Zustaende. */
const CARD_IN: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const CARD_IN_STILL: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.3, ease: EASE } },
};

type Tile = Readonly<{ id: string; title: string; body: string }>;

/**
 * Eine Kachel.
 *
 * Sie haelt ihren eigenen Zaehler fuer Anlaeufe. Der erste Anlauf kommt
 * vom Eintritt ins Bild, jeder weitere vom Zeiger oder von der Tastatur.
 * Ein Anlauf waehrend einer laufenden Szene wird verworfen, damit ein
 * schneller Zeiger ueber dem Raster keine Kette aus Neustarts ausloest.
 */
function TileCard({ tile, reduced }: Readonly<{ tile: Tile; reduced: boolean }>) {
  const id = tile.id as TileId;
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const { playKey, play } = useReplay(tileTotal(id));

  useEffect(() => {
    if (inView) play();
  }, [inView, play]);

  return (
    <motion.li
      ref={ref}
      className="kt-card"
      variants={reduced ? CARD_IN_STILL : CARD_IN}
      tabIndex={0}
      onPointerEnter={play}
      onFocus={play}
    >
      <div className="kt-stage">
        <span className="kt-glow" aria-hidden="true" />
        <span className="kt-edge" aria-hidden="true" />
        <TileScene id={id} playKey={playKey} reduced={reduced} />
      </div>
      <h3 className="kt-card-title">{tile.title}</h3>
      <p className="t-body kt-card-body">{tile.body}</p>
    </motion.li>
  );
}

export default function KiTiles() {
  const reduced = useSafeReducedMotion();

  return (
    <section className="ki-tiles" aria-labelledby="ki-tiles-titel">
      <div className="shell">
        <Reveal>
          <div className="kt-head">
            <h2 className="t-h2 kt-title" id="ki-tiles-titel">
              {kiTiles.title}
            </h2>
            <div className="kt-side">
              <p className="t-body-lg kt-intro">{kiTiles.intro}</p>
              <p className="t-label kt-hint">{kiTiles.hint}</p>
            </div>
          </div>
        </Reveal>

        <RevealGroup as="ul" className="kt-grid">
          {kiTiles.tiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} reduced={reduced} />
          ))}
        </RevealGroup>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.ki-tiles` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie RevealGroup weiterreicht.
      */}
      <style jsx global>{`
        .ki-tiles {
          padding-top: calc(var(--section-y) * 0.62);
          padding-bottom: var(--section-y);
        }

        .ki-tiles .kt-head {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
          gap: 24px 64px;
          align-items: start;
          margin-bottom: 56px;
        }

        .ki-tiles .kt-title {
          max-width: 18ch;
        }

        .ki-tiles .kt-intro {
          max-width: 60ch;
          padding-top: 6px;
        }

        /* Der Hinweis steht nur dort, wo es einen Zeiger gibt. */
        .ki-tiles .kt-hint {
          display: none;
          margin-top: 18px;
          color: var(--ink-3);
        }

        @media (hover: hover) and (pointer: fine) {
          .ki-tiles .kt-hint {
            display: block;
          }
        }

        .ki-tiles .kt-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ki-tiles .kt-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-raise);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 24px;
          outline: none;
          transition:
            border-color 0.5s var(--ease-out-expo),
            transform 0.5s var(--ease-out-expo),
            box-shadow 0.5s var(--ease-out-expo);
        }

        /* Unter dem Zeiger leuchtet die Kachel sichtbar auf. Rahmen und
           Schein in der Markenfarbe, damit man ohne Zweifel sieht, auf
           welcher Kachel man steht; die helle Rahmenfarbe allein war dem
           Auftraggeber zu leise. */
        .ki-tiles .kt-card:hover,
        .ki-tiles .kt-card:focus-visible {
          border-color: rgba(124, 106, 255, 0.55);
          background: #0e0d18;
          transform: translateY(-4px);
          box-shadow:
            0 0 0 1px rgba(124, 106, 255, 0.18),
            0 18px 60px rgba(124, 106, 255, 0.16),
            inset 0 0 48px rgba(124, 106, 255, 0.06);
        }

        .ki-tiles .kt-card:focus-visible {
          box-shadow:
            0 0 0 1px rgba(124, 106, 255, 0.6),
            0 0 0 5px rgba(124, 106, 255, 0.16);
        }

        .ki-tiles .kt-stage {
          position: relative;
          height: clamp(160px, 12vw, 240px);
          border-radius: 12px;
          background: linear-gradient(
            180deg,
            rgba(244, 244, 246, 0.035),
            rgba(244, 244, 246, 0.012)
          );
          box-shadow: inset 0 0 0 1px rgba(244, 244, 246, 0.045);
          overflow: hidden;
          margin-bottom: 22px;
        }

        .ki-tiles .kt-stage svg {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Der Farbnebel, der auf den Zeiger antwortet. */
        .ki-tiles .kt-glow {
          position: absolute;
          inset: -30% -10%;
          background: radial-gradient(
            58% 60% at 50% 52%,
            rgba(124, 106, 255, 0.22),
            rgba(91, 140, 255, 0.1) 46%,
            rgba(91, 140, 255, 0) 74%
          );
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.65s var(--ease-out-expo);
        }

        /* Eine Rampenlinie an der Oberkante, die aus der Mitte aufgeht. */
        .ki-tiles .kt-edge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--grad);
          opacity: 0;
          transform: scaleX(0.2);
          pointer-events: none;
          transition:
            opacity 0.5s var(--ease-out-expo),
            transform 0.7s var(--ease-out-expo);
        }

        .ki-tiles .kt-card:hover .kt-glow,
        .ki-tiles .kt-card:focus-visible .kt-glow {
          opacity: 1;
        }

        .ki-tiles .kt-card:hover .kt-edge,
        .ki-tiles .kt-card:focus-visible .kt-edge {
          opacity: 0.7;
          transform: scaleX(1);
        }

        .ki-tiles .kt-card-title {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 400;
          line-height: 1.35;
          letter-spacing: -0.005em;
          color: var(--ink);
          margin: 0;
        }

        .ki-tiles .kt-card-body {
          margin-top: 10px;
        }

        @media (max-width: 1023px) {
          .ki-tiles .kt-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
            margin-bottom: 40px;
          }

          .ki-tiles .kt-intro {
            padding-top: 0;
          }

          .ki-tiles .kt-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 700px) {
          .ki-tiles .kt-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .ki-tiles .kt-card {
            padding: 20px;
          }

          .ki-tiles .kt-stage {
            height: 158px;
            margin-bottom: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ki-tiles .kt-card:hover,
          .ki-tiles .kt-card:focus-visible {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
