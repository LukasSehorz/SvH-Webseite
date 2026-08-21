"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { introStatement } from "../content";
import { useSafeReducedMotion } from "./ui";

/**
 * Ausgangston der Wörter, bevor sie beim Scrollen auf Tinte laufen.
 * Bewusst so dunkel gewählt, dass der Zwischenzustand auf Weiß noch 3:1
 * erreicht (große Schrift) — die Abstufung zur Tinte bleibt deutlich sichtbar.
 */
const DIM = "#808E94";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Jedes Wort bekommt ein eigenes, leicht überlappendes Fenster.
  const start = index / total;
  const end = Math.min(1, (index + 1.8) / total);
  const color = useTransform(progress, [start, end], [DIM, "#001A23"]);

  return (
    <motion.span style={{ color }} className="inline" data-intro-word>
      {word}{" "}
    </motion.span>
  );
}

export default function IntroStatement() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = introStatement.split(" ");

  return (
    <section className="section" aria-label="Was wir tun">
      <div className="shell">
        <div ref={ref}>
          <p
            className="mx-auto text-center"
            data-intro-statement
            style={{
              maxWidth: 1120,
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(22px, 2.5vw, 36px)",
              lineHeight: 1.28,
              letterSpacing: "-0.01em",
              fontWeight: 400,
              textWrap: "balance",
              color: reduce ? "var(--color-ink)" : undefined,
            }}
          >
            {reduce
              ? introStatement
              : words.map((w, i) => (
                  <Word
                    key={`${w}-${i}`}
                    word={w}
                    index={i}
                    total={words.length}
                    progress={scrollYProgress}
                  />
                ))}
          </p>
        </div>
      </div>
    </section>
  );
}
