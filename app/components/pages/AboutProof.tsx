"use client";

import { useEffect, useRef, useState } from "react";
import { aboutPage } from "../../copy";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Das ruhige Feld mit der einzigen belegten Zahl        */
/*                                                                     */
/*  Bestaetigt sind allein 35 umgesetzte Projekte. Deshalb steht hier  */
/*  genau diese eine Zahl, daneben die drei Bereiche und sonst nichts. */
/*  Die Bewegung ist ein Zaehler mit exponentiellem Ausklingen und     */
/*  eine Linie, die unter der Zahl aufzieht.                           */
/* ------------------------------------------------------------------ */

const COUNT_MS = 1500;

export default function AboutProof() {
  const reduced = useSafeReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [shown, setShown] = useState(0);

  const target = aboutPage.proof.count;

  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }

    const node = fieldRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setEntered(true);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!entered || reduced) return;

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [entered, reduced, target]);

  return (
    <section className="about-proof" id="projekte">
      <div className="shell">
        <div ref={fieldRef} className="proof-field" data-in={entered}>
          <span className="proof-fog" aria-hidden="true" />

          <div className="proof-count">
            <p className="proof-number">
              {reduced ? target : shown}
              <span className="proof-plus">{aboutPage.proof.plus}</span>
            </p>
            <span className="proof-rule" aria-hidden="true" />
            <p className="t-label proof-label">{aboutPage.proof.label}</p>
          </div>

          <div className="proof-areas">
            <p className="t-body proof-intro">{aboutPage.proof.intro}</p>
            <ul className="proof-list">
              {aboutPage.proof.areas.map((area, index) => (
                <li
                  className="proof-area"
                  key={area}
                  style={{ transitionDelay: `${0.34 + index * 0.11}s` }}
                >
                  <span className="proof-dot" aria-hidden="true" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .about-proof {
          padding-block: clamp(72px, 8vw, 112px);
        }

        .about-proof .proof-field {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 44px clamp(40px, 6vw, 96px);
          align-items: center;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding-block: clamp(48px, 5.5vw, 80px);
          overflow: hidden;
        }

        /* Ein einziger ruhiger Schimmer hinter der Zahl. */
        .about-proof .proof-fog {
          position: absolute;
          left: 4%;
          top: 50%;
          width: min(560px, 60%);
          height: 300px;
          transform: translateY(-50%);
          border-radius: 9999px;
          background: var(--grad);
          opacity: 0;
          filter: blur(110px);
          pointer-events: none;
          transition: opacity 1.1s var(--ease-out-expo);
        }

        .about-proof .proof-field[data-in="true"] .proof-fog {
          opacity: 0.13;
        }

        .about-proof .proof-count {
          position: relative;
        }

        .about-proof .proof-number {
          display: flex;
          align-items: baseline;
          font-family: var(--font-display);
          font-size: clamp(84px, 11vw, 168px);
          font-weight: 300;
          line-height: 0.94;
          letter-spacing: -0.035em;
          font-variant-numeric: tabular-nums;
          color: var(--ink);
          margin: 0;
        }

        .about-proof .proof-plus {
          font-size: 0.4em;
          letter-spacing: -0.01em;
          margin-left: 0.07em;
          color: var(--acc-lav);
        }

        /* Die Linie zieht unter der Zahl auf, sobald das Feld im Bild steht. */
        .about-proof .proof-rule {
          display: block;
          height: 1px;
          margin: 26px 0 18px;
          background: var(--grad);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.1s var(--ease-out-expo);
        }

        .about-proof .proof-field[data-in="true"] .proof-rule {
          transform: scaleX(1);
        }

        .about-proof .proof-label {
          color: var(--ink-2);
        }

        .about-proof .proof-areas {
          position: relative;
        }

        .about-proof .proof-intro {
          margin-bottom: 26px;
        }

        .about-proof .proof-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--line-2);
        }

        .about-proof .proof-area {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-block: 18px;
          border-bottom: 1px solid var(--line-2);
          font-family: var(--font-display);
          font-size: clamp(22px, 2.4vw, 32px);
          font-weight: 300;
          letter-spacing: -0.015em;
          color: var(--ink);
          opacity: 0;
          transform: translateX(-14px);
          transition:
            opacity 0.8s var(--ease-out-expo),
            transform 0.8s var(--ease-out-expo);
        }

        .about-proof .proof-field[data-in="true"] .proof-area {
          opacity: 1;
          transform: none;
        }

        .about-proof .proof-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 9999px;
          background: var(--grad);
        }

        @media (max-width: 1023px) {
          .about-proof .proof-field {
            grid-template-columns: minmax(0, 1fr);
            gap: 36px;
            align-items: start;
          }

          .about-proof .proof-fog {
            width: 80%;
            top: 26%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-proof .proof-rule {
            transform: scaleX(1);
            transition: none;
          }

          .about-proof .proof-area {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .about-proof .proof-fog {
            opacity: 0.13;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
