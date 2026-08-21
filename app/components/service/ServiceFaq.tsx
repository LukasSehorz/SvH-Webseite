"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { EASE, Reveal, RevealGroup, revealChild, revealParent, useSafeReducedMotion } from "../ui";

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FaqItem({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useSafeReducedMotion();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

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
              textWrap: "balance",
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

export default function ServiceFaq({ items }: { items: { q: string; a: string }[] }) {
  const uid = useId().replace(/:/g, "");
  const indexed = items.map((item, i) => ({ item, i }));
  const half = Math.ceil(indexed.length / 2);
  const columns = [indexed.slice(0, half), indexed.slice(half)].filter((c) => c.length > 0);

  return (
    <section className="section" aria-labelledby="service-faq-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div
          style={{
            borderRadius: 40,
            background: "var(--color-tint-3)",
            padding: "clamp(28px,4vw,56px)",
          }}
        >
          <Reveal>
            <h2 id="service-faq-titel" className="t-h2" style={{ maxWidth: 620 }}>
              Häufige Fragen
            </h2>
          </Reveal>

          {/* Spaltenweise verteilt: erste Hälfte links, zweite Hälfte rechts.
              Zeilenweises Füllen ließe bei ungerader Anzahl unten rechts eine Lücke. */}
          <RevealGroup
            className="mt-12 grid grid-cols-1 items-start gap-5 md:grid-cols-2"
            amount={0.05}
          >
            {columns.map((column, c) => (
              <motion.div
                key={c}
                variants={revealParent}
                className="grid grid-cols-1 gap-5"
              >
                {column.map(({ item, i }) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} id={`${uid}-${i}`} />
                ))}
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
