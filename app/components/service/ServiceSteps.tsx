"use client";

import { motion } from "framer-motion";
import type { ServicePage } from "../../content-pages";
import { EASE, Reveal, SlabMark, useSafeReducedMotion } from "../ui";

export default function ServiceSteps({ steps }: { steps: ServicePage["steps"] }) {
  const reduce = useSafeReducedMotion();

  return (
    <section className="section" aria-labelledby="ablauf-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div className="slab" style={{ padding: "clamp(32px,4.6vw,72px)" }}>
          <SlabMark />

          <div className="relative">
            <Reveal>
              <h2
                id="ablauf-titel"
                className="t-slab"
                style={{ color: "#fff", maxWidth: 900, fontSize: "clamp(36px,4.4vw,64px)" }}
              >
                {steps.title}
              </h2>
              <p
                style={{
                  marginTop: 20,
                  maxWidth: 760,
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(19px,1.95vw,28px)",
                  lineHeight: 1.35,
                  color: "rgba(255,255,255,.9)",
                }}
              >
                {steps.subtitle}
              </p>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.items.map((item, i) => (
                <motion.article
                  key={item.n}
                  initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.65, ease: EASE, delay: i * 0.12 }}
                  style={{
                    background: "#fff",
                    borderRadius: 24,
                    padding: "clamp(24px,2.4vw,32px)",
                    boxShadow: "0 24px 60px -34px rgba(0,26,35,.5)",
                  }}
                >
                  <motion.span
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--color-tint-2)",
                      color: "var(--color-brand-deep)",
                      fontFamily: "var(--font-serif)",
                      fontSize: 20,
                      fontWeight: 500,
                    }}
                    initial={{ scale: reduce ? 1 : 0.4 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 300, damping: 18, delay: 0.15 + i * 0.12 }
                    }
                    aria-hidden
                  >
                    {item.n}
                  </motion.span>

                  <h3
                    className="t-h3"
                    style={{
                      marginTop: 22,
                      fontSize: "clamp(22px,1.8vw,26px)",
                      color: "var(--color-ink)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p className="t-body" style={{ marginTop: 12 }}>
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
