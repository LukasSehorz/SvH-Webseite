"use client";

import { contactPage } from "../../copy";
import { company } from "../../content";
import { Reveal, RevealGroup, RevealItem } from "../system/ui";

/**
 * Der Koerper der Kontaktseite unter dem Kopf. Er nimmt die drei Bloecke
 * Wege, Direkt und Angaben als Kinder auf und ordnet sie nach der
 * Bildbreite.
 *
 * Unter 1280 Bildpunkten stehen sie untereinander in der Reihenfolge, in
 * der sie im Blatt stehen, also Wege, Direkt, Angaben. Ab 1280 steht der
 * Block Direkt links und die Wege mit den Angaben rechts, getrennt durch
 * eine senkrechte Haarlinie, die beide Spalten zu einem Rahmen bindet. Der
 * Pruefbericht vom 03.09.2026 hatte gemessen, dass die Seite auf einem
 * Schirm von 2560 Bildpunkten nur die linken 37 Prozent nutzte.
 *
 * Der linke Block bleibt beim Scrollen stehen, solange die rechte Spalte
 * laenger ist als der Schirm. Telefon und E-Mail sind das Ziel der Seite
 * und sollen deshalb nie aus dem Bild laufen.
 */
export function ContactGrid({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="contact-grid">
      <div className="shell">
        <div className="contact-grid-inner">{children}</div>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-grid` gehaengt.
        Die drei Bloecke tragen ihre Lage im Raster ueber ihre eigene
        Wurzelklasse, damit das Raster hier an einer Stelle steht.
      */}
      <style jsx global>{`
        .contact-grid {
          padding-bottom: var(--section-y);
        }

        .contact-grid .contact-grid-inner {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          row-gap: clamp(64px, 8vw, 112px);
        }

        @media (min-width: 1280px) {
          .contact-grid .contact-grid-inner {
            grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
            grid-template-areas:
              "direct line ways"
              "direct line details";
            column-gap: clamp(40px, 4vw, 96px);
            row-gap: clamp(40px, 4vw, 64px);
            align-items: start;
          }

          /* Die senkrechte Haarlinie zwischen den Spalten. Sie laeuft ueber
             beide Zeilen, damit die Angaben unten rechts noch am selben
             Rahmen haengen wie die Karten oben. */
          .contact-grid .contact-grid-inner::before {
            content: "";
            grid-area: line;
            align-self: stretch;
            background: var(--line);
          }

          .contact-grid .contact-direct {
            grid-area: direct;
            position: sticky;
            top: calc(var(--nav-h) + 28px);
          }

          .contact-grid .contact-ways {
            grid-area: ways;
          }

          .contact-grid .contact-details {
            grid-area: details;
          }

          /* Die Fakten enden mit einer Linie, und die Angaben begannen mit
             einer zweiten. Zwei Linien mit nichts dazwischen lasen sich wie
             ein Fehler, deshalb faellt die zweite im Raster weg. */
          .contact-grid .contact-details .hairline {
            display: none;
          }

          .contact-grid .contact-details .details-grid {
            padding-top: 0;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * Zwei Wege-Karten und die Fakten zum Erstgespraech.
 * Die erste Karte springt zum Block Direkt, die zweite oeffnet das
 * Mailprogramm mit der Adresse aus content.ts.
 */
export default function ContactCards() {
  const [project, running] = contactPage.cards;

  return (
    <div className="contact-ways">
      <div className="ways-grid">
        <RevealGroup className="ways-cards">
          <RevealItem className="way-card">
            <h2 className="t-h3">{project.title}</h2>
            <p className="t-body way-body">{project.body}</p>
            <a href="#anfrage" className="btn-solid way-cta">
              {project.cta}
            </a>
          </RevealItem>

          <RevealItem className="way-card">
            <h2 className="t-h3">{running.title}</h2>
            <p className="t-body way-body">{running.body}</p>
            <a href={`mailto:${company.email}`} className="btn-line way-cta">
              {running.cta}
            </a>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.12}>
          <ul className="ways-facts">
            {contactPage.facts.map((fact) => (
              <li key={fact.label} className="fact">
                <p className="t-label">{fact.label}</p>
                <p className="fact-value">{fact.value}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-ways` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie RevealGroup weiterreicht.
      */}
      <style jsx global>{`
        .contact-ways .ways-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 288px;
          gap: 20px 64px;
          align-items: start;
        }

        .contact-ways .ways-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .contact-ways .way-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 34px 32px 36px;
          transition: border-color 0.4s var(--ease-out-expo);
        }

        .contact-ways .way-card:hover {
          border-color: var(--ink-2);
        }

        .contact-ways .way-body {
          margin: 14px 0 30px;
          max-width: 42ch;
        }

        /* Die Knoepfe stehen auf gleicher Hoehe, auch wenn ein Text
           eine Zeile kuerzer ausfaellt. */
        .contact-ways .way-cta {
          margin-top: auto;
        }

        .contact-ways .ways-facts {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--line);
        }

        .contact-ways .fact {
          padding-block: 22px;
          border-bottom: 1px solid var(--line);
        }

        .contact-ways .fact-value {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: var(--ink);
          margin: 10px 0 0;
        }

        /* In der rechten Spalte des zweispaltigen Rasters stehen die
           Karten untereinander, und die Fakten werden zu Zeilen mit der
           Beschriftung links und dem Wert rechts. So brauchen sie keine
           eigene Spalte mehr neben den Karten. */
        @media (min-width: 1280px) {
          .contact-ways .ways-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: clamp(36px, 3vw, 56px);
          }

          .contact-ways .ways-cards {
            grid-template-columns: minmax(0, 1fr);
          }

          .contact-ways .fact {
            display: grid;
            grid-template-columns: minmax(150px, 0.34fr) minmax(0, 1fr);
            column-gap: 24px;
            align-items: baseline;
            padding-block: 18px;
          }

          .contact-ways .fact-value {
            margin: 0;
            font-size: 24px;
          }
        }

        /* Auf sehr breiten Schirmen ist die rechte Spalte breiter als
           eine ganze Karte von 1440. Die Karte wird dann zur Zeile mit
           Titel, Satz und Knopf nebeneinander, statt als hohe Kiste mit
           leerer rechter Haelfte zu stehen. */
        @media (min-width: 1800px) {
          .contact-ways .way-card {
            display: grid;
            grid-template-columns: minmax(0, 0.55fr) minmax(0, 1.45fr) auto;
            align-items: center;
            column-gap: clamp(32px, 3vw, 64px);
            padding: 34px 36px;
          }

          .contact-ways .way-body {
            margin: 0;
          }

          .contact-ways .way-cta {
            margin-top: 0;
          }
        }

        @media (max-width: 1023px) {
          .contact-ways .ways-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 32px;
          }
        }

        @media (max-width: 720px) {
          .contact-ways .ways-cards {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .contact-ways .way-card {
            padding: 28px 24px 30px;
          }

          .contact-ways .way-body + .way-cta {
            margin-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
