"use client";

import { company } from "../../content";
import { contactPage } from "../../copy";
import { RevealGroup, RevealItem } from "../system/ui";

const { detailLabels } = contactPage;

/**
 * Ruhige Kontaktdaten-Zeile unter dem Formular. Die Angaben stammen aus
 * content.ts, die Beschriftungen aus copy.ts, damit beides jeweils nur an
 * einer Stelle gepflegt wird.
 */
export default function ContactDetails() {
  return (
    <section className="contact-details">
      <div className="shell">
        <hr className="hairline" />

        <RevealGroup as="ul" className="details-grid">
          <RevealItem as="li">
            <p className="t-label">{detailLabels.phone}</p>
            <p className="details-value">
              <a href={`tel:${company.phoneHref}`} className="details-link">
                {company.phone}
              </a>
            </p>
            <p className="t-label details-note-label">{detailLabels.hours}</p>
            <p className="t-body details-note">{company.hours}</p>
          </RevealItem>

          <RevealItem as="li">
            <p className="t-label">{detailLabels.email}</p>
            <p className="details-value">
              <a href={`mailto:${company.email}`} className="details-link">
                {company.email}
              </a>
            </p>
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
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

        .contact-details .details-link {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: transparent;
          transition: text-decoration-color 0.3s var(--ease-out-expo);
        }

        .contact-details .details-link:hover {
          text-decoration-color: var(--line);
        }

        /* Die Erreichbarkeit gehört zur Telefonnummer und steht deshalb
           als eigene, leise beschriftete Zeile in derselben Spalte. */
        .contact-details .details-note-label {
          margin-top: 22px;
        }

        .contact-details .details-note {
          margin-top: 8px;
          color: var(--ink-2);
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
