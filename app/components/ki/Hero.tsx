"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { kiPage } from "../../copy";
import { GradientWord, useSafeReducedMotion } from "../system/ui";
import { Mark, type MarkId } from "./Marks";
import { Scene, useScenesActive } from "./Scenes";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Der Farbnebel jeder Kachel. Drei Toene der Rampe im Wechsel, damit das
 * Feld Farbe traegt, ohne dass eine Kachel wie ein Fremdkoerper wirkt.
 */
const MIST = [
  "rgba(91,140,255,.5)",
  "rgba(124,106,255,.52)",
  "rgba(185,165,255,.4)",
] as const;

const TILES = kiPage.services.items;

/**
 * Der Seitenkopf von /ki.
 *
 * Links steht die Aussage in zwei kurzen Zeilen, rechts der Satz dazu und
 * der Knopf. Darunter liegt das Feld aus acht Kacheln, und jede Kachel
 * zeigt eine Dienstleistung als kleine bewegte Szene. Faehrt der Zeiger
 * ueber eine Kachel, laeuft ihre Szene noch einmal von vorn.
 */
export default function KiHero() {
  const fieldRef = useRef<HTMLUListElement>(null);
  const active = useScenesActive(fieldRef);
  const reduced = useSafeReducedMotion();

  /* Je Kachel ein eigener Zaehler. Steigt er, faengt die Szene neu an. */
  const [replays, setReplays] = useState<readonly number[]>(() =>
    TILES.map(() => 0)
  );

  const replay = useCallback((index: number) => {
    setReplays((prev) => {
      const next = prev.slice();
      next[index] += 1;
      return next;
    });
  }, []);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.3 : 0.85,
      delay: reduced ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <section className="ki-hero">
      <div className="shell">
        <div className="ki-hero-head">
          <motion.h1 className="ki-hero-title" {...rise(0.06)}>
            <span className="ki-hero-line">{kiPage.hero.titleLead}</span>
            <span className="ki-hero-line">
              <GradientWord>{kiPage.hero.gradientWord}</GradientWord>
            </span>
          </motion.h1>

          <div className="ki-hero-side">
            <motion.p className="t-body-lg ki-hero-lead" {...rise(0.18)}>
              {kiPage.hero.lead}
            </motion.p>

            <motion.div className="ki-hero-action" {...rise(0.28)}>
              <Link href={kiPage.hero.cta.href} className="btn-solid">
                {kiPage.hero.cta.label}
              </Link>
            </motion.div>
          </div>
        </div>

        <ul className="ki-hero-field" ref={fieldRef}>
          {TILES.map((tile, index) => (
            <motion.li
              key={tile.id}
              className="ki-tile"
              onPointerEnter={() => replay(index)}
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0.3 : 0.9,
                delay: reduced ? 0 : 0.34 + index * 0.06,
                ease: EASE,
              }}
            >
              <span
                className="ki-tile-mist"
                aria-hidden="true"
                style={
                  { "--mist": MIST[index % MIST.length] } as React.CSSProperties
                }
              />

              <span className="ki-tile-stage">
                <Scene
                  id={tile.id as MarkId}
                  active={active}
                  reduced={reduced}
                  offset={index * 640}
                  replay={replays[index]}
                />
              </span>

              <span className="ki-tile-foot">
                <span className="ki-tile-mark">
                  <Mark id={tile.id as MarkId} size={19} />
                </span>
                <span className="ki-tile-name">{tile.name}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <style jsx global>{`
        .ki-hero {
          padding-top: clamp(128px, 18vh, 200px);
          padding-bottom: clamp(72px, 9vw, 128px);
        }

        .ki-hero-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.88fr);
          gap: 40px 64px;
          align-items: end;
        }

        /* Die Ueberschrift steht bewusst kleiner als .t-display, weil sie
           in genau zwei Zeilen stehen muss und die zweite Spalte daneben
           ihren Platz behaelt. */
        .ki-hero-title {
          font-family: var(--font-display);
          font-size: clamp(46px, 5.6vw, 88px);
          font-weight: 300;
          line-height: 1.03;
          letter-spacing: -0.026em;
          color: var(--ink);
          margin: 0;
        }

        .ki-hero-line {
          display: block;
        }

        .ki-hero-side {
          padding-bottom: 6px;
        }

        .ki-hero-lead {
          max-width: var(--measure);
        }

        .ki-hero-action {
          margin-top: 30px;
        }

        .ki-hero-field {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          list-style: none;
          margin: clamp(56px, 6vw, 88px) 0 0;
          padding: 0;
        }

        .ki-tile {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
          padding: 14px 14px 16px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--bg-raise);
          transition:
            border-color 0.5s var(--ease-out-expo),
            transform 0.5s var(--ease-out-expo);
        }

        .ki-tile:hover {
          border-color: rgba(244, 244, 246, 0.24);
          transform: translateY(-2px);
        }

        /* Der Farbnebel liegt hinter der Szene und atmet unter dem Zeiger
           auf. Bewegt werden nur Deckkraft und Groesze.

           Der helle Kern des Verlaufs sitzt bei 46 Prozent der Hoehe und
           damit innerhalb der Kachel. Stand er am unteren Rand, schnitt
           ihn das Beschneiden der Kachel vollstaendig weg und es war
           ueberhaupt keine Farbe zu sehen. */
        .ki-tile-mist {
          position: absolute;
          inset: -22% -16% -26%;
          border-radius: 9999px;
          background: radial-gradient(
            50% 44% at 50% 46%,
            var(--mist),
            transparent 72%
          );
          filter: blur(26px);
          opacity: 0.62;
          transform: scale(0.96);
          transition:
            opacity 0.7s var(--ease-out-expo),
            transform 0.7s var(--ease-out-expo);
          pointer-events: none;
        }

        .ki-tile:hover .ki-tile-mist {
          opacity: 1;
          transform: scale(1.08);
        }

        .ki-tile-stage {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 200 / 108;
        }

        .ki-tile-stage svg {
          width: 100%;
          height: 100%;
        }

        .ki-tile-foot {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: auto;
        }

        .ki-tile-mark {
          display: inline-flex;
          flex: 0 0 auto;
          color: var(--ink-3);
          transition: color 0.5s var(--ease-out-expo);
        }

        .ki-tile:hover .ki-tile-mark {
          color: var(--acc-lav);
        }

        .ki-tile-name {
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 400;
          line-height: 1.32;
          letter-spacing: -0.004em;
          color: var(--ink);
        }

        @media (min-width: 1800px) {
          .ki-hero-field {
            grid-template-columns: repeat(8, minmax(0, 1fr));
          }
        }

        @media (max-width: 1023px) {
          .ki-hero {
            padding-top: 132px;
          }

          .ki-hero-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 26px;
            align-items: start;
          }

          .ki-hero-side {
            padding-bottom: 0;
          }

          .ki-hero-field {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .ki-tile {
            padding: 12px 12px 14px;
            border-radius: 14px;
          }

          .ki-tile-name {
            font-size: 12.5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ki-tile,
          .ki-tile-mist,
          .ki-tile-mark {
            transition: none;
          }

          .ki-tile:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
