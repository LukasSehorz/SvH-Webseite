/*
 * BAUVERTRAG
 *
 * THESE. Ein Betrieb ohne System zerfaellt in Einzelteile. SVH Consulting
 * fuegt ihn zu einem Ganzen zusammen, das von allein arbeitet.
 *
 * EIGENE WELT. Dunkler Grund, eine Wolke aus Lichtpunkten, die Markenrampe
 * von Blau nach Flieder. Keine Kacheln, kein Rahmen, nur Schrift und Feld.
 *
 * GESCHICHTE. Die Wolke treibt ungeordnet, sammelt sich um einen Kern zu
 * einer Struktur und faellt wieder auseinander. Die Unterschrift wechselt
 * dabei zwischen ohne und mit uns und nennt im geordneten Zustand die drei
 * Werte, fuer die wir stehen.
 *
 * ERSTER BILDSCHIRM. Links die Aussage in zwei Zeilen, der Absatz darunter
 * und zwei Wege ins Gespraech. Rechts das Feld mit dem Wechsel.
 *
 * FORM. Zwei Spalten, links Text bis 860 Bildpunkte, rechts das Feld ueber
 * die volle Hoehe. Unter 1024 stehen beide untereinander.
 */

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { hero, heroField } from "../../copy";
import { GradientWord, useSafeReducedMotion } from "../system/ui";
import type { FieldState } from "./HeroField";

const HeroField = dynamic(() => import("./HeroField"), {
  ssr: false,
  loading: () => <div className="hero-field" aria-hidden="true" />,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const STATES: readonly FieldState[] = ["chaos", "order"];

export default function Hero() {
  const reduced = useSafeReducedMotion();
  const [fieldState, setFieldState] = useState<FieldState>("chaos");
  const onFieldState = useCallback((next: FieldState) => setFieldState(next), []);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 26 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.3 : 0.85,
      delay: reduced ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <section className="hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <motion.h1 className="t-display hero-title" {...rise(0.08)}>
            {hero.titleBefore}{" "}
            <GradientWord>{hero.gradientWord}</GradientWord>
            {hero.titleAfter ? <> {hero.titleAfter}</> : null}
          </motion.h1>

          <motion.p className="t-body-lg hero-lead" {...rise(0.2)}>
            {hero.lead}
          </motion.p>

          <motion.div className="hero-actions" {...rise(0.3)}>
            <Link href={hero.primary.href} className="btn-solid">
              {hero.primary.label}
            </Link>
            <Link href={hero.secondary.href} className="btn-dash">
              {hero.secondary.label}
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.3 : 1.4, delay: 0.1, ease: EASE }}
        >
          <span className="hero-glow" aria-hidden="true" />
          <HeroField onState={onFieldState} />

          {/* Unterschrift am Feldrand. Sie wechselt synchron zur Konstellation
              und nennt im geordneten Zustand unsere drei Werte. */}
          <div className="hero-state">
            <p className="hero-state-names" aria-hidden="true">
              {STATES.map((key) => (
                <span
                  key={key}
                  className="t-label hero-state-line"
                  data-on={fieldState === key ? "true" : "false"}
                  data-key={key}
                >
                  <span className="hero-state-dot" />
                  {heroField.states[key]}
                </span>
              ))}
            </p>

            <ul
              className="hero-values"
              data-on={fieldState === "order" ? "true" : "false"}
            >
              {heroField.values.map((value, index) => (
                <li
                  key={value}
                  className="t-label hero-value"
                  style={
                    { "--d": `${0.5 + index * 0.08}s` } as React.CSSProperties
                  }
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>


      <style jsx global>{`
        .hero-state {
          position: absolute;
          right: 4px;
          bottom: 2px;
          z-index: 2;
          text-align: right;
          pointer-events: none;
        }

        .hero-state-names {
          display: grid;
          margin: 0;
        }

        /* Kein echter Crossfade, sondern ein Staffellauf. Die abgehende Zeile
           blendet in 0.34s vollständig aus, erst danach kommt die neue. So
           liegen nie zwei lesbare Zeilen übereinander. */
        .hero-state-line {
          grid-area: 1 / 1;
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.34s ease-in 0s;
        }

        .hero-state-line[data-on="true"] {
          opacity: 1;
          transition: opacity 0.34s ease-out 0.36s;
        }

        .hero-state-line[data-key="order"] {
          color: rgba(226, 230, 255, 0.78);
        }

        .hero-state-dot {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.55;
        }

        .hero-state-line[data-key="order"] .hero-state-dot {
          background: var(--acc-lav);
          opacity: 1;
        }

        /* Die Werte sind der Gewinn des geordneten Zustands. Sie steigen
           nacheinander auf und gehen gemeinsam wieder.

           Sie standen als t-label auf elf Bildpunkten in einem Ton, der
           gemessen 3,2 zu eins erreichte, und waren damit das leiseste
           Element des ersten Bildschirms. Drei Woerter, die unsere Arbeit
           beschreiben, duerfen nicht leiser stehen als die Bildunterschrift
           darueber. Sie tragen jetzt dreizehn Bildpunkte in der zweiten
           Tonstufe. */
        .hero-values {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 4px 12px;
          margin: 9px 0 0;
          padding: 0;
          list-style: none;
        }

        .hero-value {
          font-size: 13px;
          letter-spacing: 0.08em;
          color: var(--ink-2);
          opacity: 0;
          transform: translateY(5px);
          transition:
            opacity 0.3s ease-in,
            transform 0.3s ease-in;
        }

        .hero-value + .hero-value::before {
          content: "·";
          margin-right: 12px;
          color: rgba(244, 244, 246, 0.26);
        }

        .hero-values[data-on="true"] .hero-value {
          opacity: 1;
          transform: none;
          transition:
            opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--d),
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--d);
        }

        @media (max-width: 1023px) {
          .hero-state {
            right: 0;
            bottom: 0;
          }
        }

        @media (max-width: 640px) {
          .hero-value {
            font-size: 11.5px;
            letter-spacing: 0.07em;
          }

          .hero-values {
            gap: 4px 9px;
          }

          .hero-value + .hero-value::before {
            margin-right: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-state-line,
          .hero-value {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
