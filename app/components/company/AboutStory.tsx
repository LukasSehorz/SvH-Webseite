"use client";

import { motion } from "framer-motion";
import { EASE, useSafeReducedMotion } from "../ui";

/**
 * „Warum es uns gibt" — zweispaltig: links die klebende Überschrift,
 * rechts die Absätze, die beim Scrollen gestaffelt erscheinen.
 */
export default function AboutStory({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  const reduce = useSafeReducedMotion();

  return (
    <section className="section" aria-labelledby="story-title">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <motion.h2
              id="story-title"
              className="t-h2 lg:sticky"
              style={{ top: 128 }}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {title}
            </motion.h2>
          </div>

          <div className="flex flex-col" style={{ gap: 24 }}>
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                className="t-lead"
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
