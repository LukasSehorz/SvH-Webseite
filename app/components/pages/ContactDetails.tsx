"use client";

import { company } from "../../content";
import { contactPage } from "../../copy";
import { RevealGroup, RevealItem } from "../system/ui";

const { detailLabels } = contactPage;

/**
 * Ruhige Zeile unter den beiden Wegen. Die Angaben stammen aus content.ts,
 * die Beschriftungen aus copy.ts, damit beides jeweils nur an einer Stelle
 * gepflegt wird.
 *
 * Telefon und E-Mail standen hier bis zum 02.09.2026 ebenfalls. Seit an
 * ihrer Stelle die Komponente ContactDirect steht, waeren sie zweimal
 * innerhalb einer Bildhoehe zu lesen gewesen. Hier bleibt, was dort nicht
 * steht.
 */
export default function ContactDetails() {
  return (
    <section className="contact-details">
      <div className="shell">
        <hr className="hairline" />

        <RevealGroup as="ul" className="details-grid">
          <RevealItem as="li">
            <p className="t-label">{detailLabels.hours}</p>
            <p className="details-value">{company.hours}</p>
          </RevealItem>

          <RevealItem as="li">
            <p className="t-label">{detailLabels.address}</p>
            <p className="details-value">
              {company.street}
              <br />
              {company.zipCity}
            </p>
          </RevealItem>
        </RevealGroup>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-details` gehängt.
        Nötig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie RevealGroup weiterreicht.
      */}
      <style jsx global>{`
        .contact-details {
          padding-bottom: var(--section-y);
        }

        .contact-details .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 44px 0 0;
        }

        .contact-details .details-value {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 300;
          line-height: 1.35;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin: 14px 0 0;
          overflow-wrap: anywhere;
        }

        @media (max-width: 720px) {
          .contact-details .details-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 26px;
            padding-top: 32px;
          }

          .contact-details .details-value {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
