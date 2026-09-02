"use client";

import { contactPage } from "../../copy";
import { company } from "../../content";
import { Reveal, RevealGroup, RevealItem } from "../system/ui";

/**
 * Zwei Wege-Karten und daneben die schmale Fakten-Spalte.
 * Die erste Karte springt zum Formular weiter unten, die zweite öffnet
 * das Mailprogramm mit der Adresse aus content.ts.
 */
export default function ContactCards() {
  const [project, running] = contactPage.cards;

  return (
    <section className="contact-ways">
      <div className="shell">
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
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-ways` gehängt.
        Nötig, weil styled-jsx seine Scope-Klasse nicht an eigene
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

        /* Die Knöpfe stehen auf gleicher Höhe, auch wenn ein Text
           eine Zeile kürzer ausfällt. */
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
    </section>
  );
}
