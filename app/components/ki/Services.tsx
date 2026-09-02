"use client";

import { kiPage } from "../../copy";
import { Reveal, RevealGroup, RevealItem } from "../system/ui";
import { Mark, type MarkId } from "./Marks";

/**
 * Die acht Dienstleistungen als Liste, je eine Zeile in einfachen Worten.
 *
 * Jede Zeile traegt dasselbe Zeichen wie ihre Kachel im Seitenkopf. Damit
 * findet man von der bewegten Szene ohne Umweg zu ihrer Erklaerung.
 */
export default function KiServices() {
  return (
    <section className="section ki-services" id="leistungen">
      <div className="shell">
        <Reveal>
          <div className="ki-svc-head">
            <h2 className="t-h1 ki-svc-title">{kiPage.services.title}</h2>
            <p className="t-body-lg ki-svc-intro">{kiPage.services.intro}</p>
          </div>
        </Reveal>

        <RevealGroup as="ul" className="ki-svc-list">
          {kiPage.services.items.map((item) => (
            <RevealItem as="li" key={item.id} className="ki-svc-row">
              <span className="ki-svc-mark">
                <Mark id={item.id as MarkId} size={21} />
              </span>
              <div className="ki-svc-text">
                <h3 className="ki-svc-name">{item.name}</h3>
                <p className="t-body ki-svc-body">{item.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.ki-services` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie RevealGroup weiterreicht.
      */}
      <style jsx global>{`
        .ki-services .ki-svc-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px 64px;
          align-items: start;
          margin-bottom: clamp(40px, 5vw, 68px);
        }

        .ki-services .ki-svc-title {
          max-width: 14ch;
        }

        .ki-services .ki-svc-intro {
          padding-top: 8px;
        }

        /* Die Liste behaelt ihre Breite auch auf sehr breiten Schirmen.
           Zwei Spalten mit kurzen Zeilen lesen sich schneller als eine
           Spalte, die ueber die halbe Bildbreite laeuft. */
        .ki-services .ki-svc-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: clamp(48px, 6vw, 112px);
          max-width: 1500px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ki-services .ki-svc-row {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr);
          gap: 0 16px;
          align-items: start;
          padding-block: 22px;
          border-top: 1px solid var(--line);
        }

        .ki-services .ki-svc-mark {
          display: inline-flex;
          padding-top: 2px;
          color: var(--ink-3);
          transition: color 0.5s var(--ease-out-expo);
        }

        .ki-services .ki-svc-row:hover .ki-svc-mark {
          color: var(--acc-lav);
        }

        .ki-services .ki-svc-name {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: -0.006em;
          color: var(--ink);
          margin: 0;
        }

        .ki-services .ki-svc-body {
          margin-top: 8px;
        }

        @media (max-width: 899px) {
          .ki-services .ki-svc-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .ki-services .ki-svc-intro {
            padding-top: 0;
          }

          .ki-services .ki-svc-list {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ki-services .ki-svc-mark {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
