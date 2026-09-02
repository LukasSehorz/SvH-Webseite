"use client";

import { useId, useState } from "react";
import { faqLanding } from "../../copy";
import { SectionLabel } from "../system/ui";

export type FaqItem = { q: string; a: string };

/** Wird auch von den Unterseiten mit eigenen Fragen verwendet. */
export function FaqAccordion({ items }: Readonly<{ items: readonly FaqItem[] }>) {
  const base = useId().replace(/:/g, "");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${base}-panel-${index}`;
        const buttonId = `${base}-button-${index}`;

        return (
          <div key={item.q} className="faq-row">
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={buttonId}
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="t-h3 faq-question-text">{item.q}</span>
                <span className="acc-plus faq-plus" data-open={isOpen} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2.4v11.2M2.4 8h11.2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              className="acc-panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={isOpen}
            >
              <div>
                <p className="t-body faq-answer">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Faq() {
  return (
    <section className="section" id="fragen">
      <div className="shell">
        <SectionLabel>{faqLanding.label}</SectionLabel>

        <div className="faq-head">
          <h2 className="t-h1 faq-title">{faqLanding.title}</h2>
          <p className="t-body-lg faq-intro">{faqLanding.intro}</p>
        </div>

        <FaqAccordion items={faqLanding.items} />
      </div>
    </section>
  );
}
