"use client";

import { motion } from "framer-motion";
import { RevealGroup, SectionHead, revealChild } from "../ui";

/** Kleine Chevron-Marke über jedem Wert. */
function ChevronMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M5 24 L16 8 L27 24"
        stroke="var(--color-brand)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 24 L16 16.5 L21 24"
        stroke="var(--color-brand-bright)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** „Wie wir arbeiten" — 2x2-Raster aus Wertekarten. */
export default function AboutValues({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="section" style={{ background: "var(--color-tint-3)" }} aria-labelledby="values-title">
      <div className="shell">
        <SectionHead title={<span id="values-title">{title}</span>} align="center" />

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <motion.article
              key={item.title}
              variants={revealChild}
              className="card card-hover"
              style={{ padding: 32 }}
            >
              <ChevronMark />
              <h3 className="t-h3" style={{ marginTop: 20 }}>
                {item.title}
              </h3>
              <p className="t-body" style={{ marginTop: 12 }}>
                {item.body}
              </p>
            </motion.article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
