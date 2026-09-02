"use client";

import { company } from "../../content";
import { contactPage } from "../../copy";
import { Reveal } from "../system/ui";

const { direct } = contactPage;

/**
 * Steht unter dem Anker `#anfrage` an der Stelle, an der bis zum
 * 02.09.2026 das Kontaktformular stand. Der Auftraggeber hat entschieden,
 * das Formular vorerst nicht zu zeigen, weil kein Empfaenger feststeht.
 * Hier stehen deshalb die beiden Wege, die sicher ankommen, gross genug,
 * um vom Knopf der Wege-Karte darueber ohne Suchen erreicht zu werden.
 */
export default function ContactDirect() {
  return (
    <section className="section contact-direct" id="anfrage">
      <div className="shell">
        <Reveal>
          <div className="direct-card">
            <h2 className="t-h2">{direct.title}</h2>
            <p className="t-body-lg direct-body">{direct.body}</p>

            <div className="direct-ways">
              <a href={`tel:${company.phoneHref}`} className="direct-way">
                <span className="t-label">{contactPage.detailLabels.phone}</span>
                <span className="direct-value">{company.phone}</span>
              </a>

              <a href={`mailto:${company.email}`} className="direct-way">
                <span className="t-label">{contactPage.detailLabels.email}</span>
                <span className="direct-value">{company.email}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-direct` gehängt.
        Nötig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie Reveal weiterreicht.
      */}
      <style jsx global>{`
        .contact-direct .direct-card {
          max-width: 940px;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px;
        }

        .contact-direct .direct-body {
          margin-top: 14px;
          max-width: 52ch;
        }

        .contact-direct .direct-ways {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        /* Beide Wege sind je eine ganze Flaeche zum Antippen und nicht nur
           die Zeile mit der Nummer. Auf dem Telefon ist das der Unterschied
           zwischen einem Treffer und drei Versuchen. */
        .contact-direct .direct-way {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 26px 28px 28px;
          border: 1px solid var(--line);
          border-radius: 16px;
          transition:
            border-color 0.4s var(--ease-out-expo),
            background-color 0.4s var(--ease-out-expo);
        }

        .contact-direct .direct-way:hover {
          border-color: var(--ink-2);
          background: rgba(244, 244, 246, 0.02);
        }

        .contact-direct .direct-value {
          font-family: var(--font-display);
          /* Die Adresse ist mit 25 Zeichen die laengste Angabe. Bei 34
             Bildpunkten brach sie im Kaesten mitten im Wort um, deshalb
             steht die Obergrenze bei 28. */
          font-size: clamp(22px, 2vw, 28px);
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: var(--ink);
          overflow-wrap: anywhere;
        }

        @media (max-width: 720px) {
          .contact-direct .direct-card {
            padding: 28px 22px 32px;
          }

          .contact-direct .direct-ways {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
            margin-top: 30px;
          }

          .contact-direct .direct-way {
            padding: 22px 22px 24px;
          }
        }
      `}</style>
    </section>
  );
}
