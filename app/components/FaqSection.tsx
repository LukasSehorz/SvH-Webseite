"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { faq } from "../content";
import { PlusIcon } from "./BIcons";
import { ButtonLink, EASE, Reveal, RevealGroup, revealChild, useSafeReducedMotion } from "./ui";

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useSafeReducedMotion();
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div
      variants={revealChild}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(0,26,35,.05)",
        boxShadow: "0 10px 30px -24px rgba(0,26,35,.35)",
      }}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-4 text-left"
          style={{ padding: "24px 28px" }}
        >
          <span
            className="flex-1"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.4,
              color: "var(--color-ink)",
            }}
          >
            {q}
          </span>
          <motion.span
            className="mt-[2px] flex shrink-0 items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "var(--color-tint-3)",
              color: "var(--color-ink)",
            }}
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
            aria-hidden
          >
            <PlusIcon size={14} />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="t-body" style={{ padding: "0 28px 24px" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="section" aria-labelledby="faq-titel">
      <div className="shell">
        <Reveal>
          <div
            style={{
              borderRadius: 40,
              background: "var(--color-tint-3)",
              padding: "clamp(28px,4vw,56px)",
            }}
          >
            {/* Kopf */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 id="faq-titel" className="t-h2" style={{ maxWidth: 420 }}>
                  {faq.title}
                </h2>
                <div className="mt-8">
                  <ButtonLink href={faq.cta.href}>{faq.cta.label}</ButtonLink>
                </div>
              </div>
              <p className="t-lead lg:pt-2">{faq.intro}</p>
            </div>

            {/* Accordion-Raster */}
            <RevealGroup
              className="mt-14 grid grid-cols-1 items-start gap-5 md:grid-cols-2"
              amount={0.05}
            >
              {faq.items.map((item, i) => (
                <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
              ))}
            </RevealGroup>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
