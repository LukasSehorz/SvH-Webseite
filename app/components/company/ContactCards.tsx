"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, RevealGroup, revealChild } from "../ui";

type Card = { title: string; body: string; cta: string };
type Fact = { label: string; value: string };

/**
 * Zwei Einstiegskarten (neues Projekt / laufende Betreuung) und rechts daneben
 * eine schmale Spalte mit Kennzahlen — Aufbau wie in der Referenz.
 */
export default function ContactCards({
  cards,
  facts,
  email,
}: {
  cards: Card[];
  facts: Fact[];
  email: string;
}) {
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-label="Kontaktwege">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] lg:gap-12">
          <RevealGroup className="grid gap-6 sm:grid-cols-2">
            {cards.map((card, i) => {
              // Erste Karte springt zum Formular, zweite öffnet direkt eine E-Mail.
              const href = i === 0 ? "#anfrage" : `mailto:${email}`;
              return (
                <motion.article
                  key={card.title}
                  variants={revealChild}
                  className="card-hover flex flex-col"
                  style={{
                    borderRadius: 24,
                    padding: 36,
                    background: "linear-gradient(165deg, #F2FBFF 0%, #E3F5FF 100%)",
                    border: "1px solid rgba(0,146,212,.12)",
                  }}
                >
                  <h2 className="t-h3">{card.title}</h2>
                  <p className="t-body" style={{ marginTop: 14 }}>
                    {card.body}
                  </p>
                  <div style={{ marginTop: "auto", paddingTop: 32 }}>
                    <a href={href} className="btn btn-dark btn-sm">
                      {card.cta}
                      <ArrowUpRight />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </RevealGroup>

          <RevealGroup className="flex flex-col" amount={0.3}>
            {facts.map((f) => (
              <motion.div key={f.label} variants={revealChild} style={{ marginBottom: 32 }}>
                <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.4 }}>
                  {f.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 30,
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                  }}
                >
                  {f.value}
                </p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
