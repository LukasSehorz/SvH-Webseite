"use client";

import { useEffect, useRef, useState } from "react";
import { aboutPage } from "../../copy";
import { Reveal, SplitHeadline, useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Die drei Werte                                        */
/*                                                                     */
/*  Qualitaet, schnelle Arbeit und Zuverlaessigkeit stehen als drei    */
/*  Zeilen und nicht als drei Karten. Karten wuerden nur einen Rahmen  */
/*  um wenige Worte legen, hier traegt die Haarlinie die Ordnung.      */
/*                                                                     */
/*  Die eine gestaltete Bewegung der Sektion ist ein Verlaufsstrich,   */
/*  der ueber die ruhende Haarlinie jeder Zeile aufzieht. Der          */
/*  Ausgangszustand ist also bereits vollstaendig lesbar.              */
/* ------------------------------------------------------------------ */

export default function AboutValues() {
  const reduced = useSafeReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }

    const node = listRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setEntered(true);
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section className="section about-values" id="werte">
      <div className="shell">
        <Reveal>
          <SplitHeadline
            className="t-h1 values-title"
            before={aboutPage.values.titleBefore}
            word={aboutPage.values.gradientWord}
            after={aboutPage.values.titleAfter}
          />
        </Reveal>

        <ul ref={listRef} className="values-list" data-in={entered}>
          {aboutPage.values.items.map((item, index) => (
            <li
              className="value-row"
              key={item.title}
              style={{ transitionDelay: `${index * 0.12}s` }}
            >
              <span
                className="value-rule"
                aria-hidden="true"
                style={{ transitionDelay: `${index * 0.12}s` }}
              />
              <h3 className="value-name">{item.title}</h3>
              <p className="t-body value-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.about-values` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `Reveal` weiterreicht.
      */}
      <style jsx global>{`
        .about-values .values-title {
          max-width: 15ch;
          text-wrap: balance;
          margin-bottom: clamp(44px, 5vw, 72px);
        }

        .about-values .values-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .about-values .value-row {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 20px clamp(40px, 6vw, 96px);
          align-items: baseline;
          padding-block: clamp(30px, 3.2vw, 44px);
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.8s var(--ease-out-expo),
            transform 0.8s var(--ease-out-expo);
        }

        .about-values .value-row:last-child {
          border-bottom: 1px solid var(--line);
        }

        .about-values .values-list[data-in="true"] .value-row {
          opacity: 1;
          transform: none;
        }

        /* Der Verlaufsstrich liegt genau auf der Haarlinie der Zeile. */
        .about-values .value-rule {
          position: absolute;
          left: 0;
          top: -1px;
          width: 100%;
          height: 1px;
          background: var(--grad);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.1s var(--ease-out-expo);
        }

        .about-values .values-list[data-in="true"] .value-rule {
          transform: scaleX(1);
        }

        .about-values .value-name {
          font-family: var(--font-display);
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -0.018em;
          color: var(--ink);
          margin: 0;
        }

        .about-values .value-body {
          font-size: 17px;
          max-width: 46ch;
        }

        @media (max-width: 860px) {
          .about-values .value-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .about-values .value-body {
            font-size: 16px;
            max-width: var(--measure);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-values .value-row {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .about-values .value-rule {
            transform: scaleX(1);
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
