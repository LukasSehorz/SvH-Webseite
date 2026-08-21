"use client";

import { motion } from "framer-motion";
import { problems } from "../content";
import { ProblemIcon } from "./BIcons";
import { Reveal, RevealGroup, revealChild } from "./ui";

export default function ProblemsSection() {
  return (
    <section className="section" aria-labelledby="probleme-titel">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          {/* Linke Spalte — klebt beim Scrollen */}
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <h2 id="probleme-titel" className="t-h2">
                {problems.title}
              </h2>
              <p className="t-h2 mt-1" style={{ color: "var(--color-muted)" }}>
                {problems.subtitle}
              </p>
            </div>
          </Reveal>

          {/* Rechtes Raster */}
          <RevealGroup className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2" amount={0.1}>
            {problems.items.map((item) => (
              <motion.article key={item.title} variants={revealChild} className="group">
                <span className="block" style={{ color: "var(--color-brand)" }}>
                  <ProblemIcon name={item.icon} size={24} />
                </span>
                <h3
                  className="mt-4"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "var(--color-ink)",
                    transition: "color .28s var(--ease-out-expo)",
                  }}
                >
                  <span className="transition-colors group-hover:text-[var(--color-brand)]">
                    {item.title}
                  </span>
                </h3>
                {/* Referenz setzt den Fließtext der Problem-Blöcke in Cyan.
                    Für 4.5:1 auf Weiß der etwas tiefere Markenton. */}
                <p
                  className="mt-3"
                  style={{ fontSize: 16, lineHeight: 1.5, color: "var(--color-brand-deep)" }}
                >
                  {item.body}
                </p>
              </motion.article>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
