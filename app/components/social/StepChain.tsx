"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import WordReveal from "../marketing/WordReveal";
import { useSafeReducedMotion } from "../system/ui";
import { socialPage } from "../../copy";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  So laeuft es ab                                                    */
/*                                                                     */
/*  Drei Schritte als Kette. Der Strang links fuellt sich mit dem       */
/*  Scrollen, und der Schritt, der gerade in der Mitte des Bildes       */
/*  steht, ist hell, waehrend die anderen zurueckgenommen sind. Beides  */
/*  gilt in beide Richtungen, weil es am Fortschritt und nicht an       */
/*  einem einmaligen Eintritt haengt.                                   */
/*                                                                     */
/*  Bei reduzierter Bewegung ist der Strang voll gezeichnet und alle    */
/*  drei Schritte stehen gleich hell, damit nichts zurueckgenommen      */
/*  bleibt, was gelesen werden soll.                                    */
/* ------------------------------------------------------------------ */

export default function StepChain() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: host,
    offset: ["start 78%", "end 55%"],
  });

  // Der Strang bewegt sich mit einer weichen Feder, sonst zappelt er bei
  // jeder kleinen Bewegung des Rades.
  const eased = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.5,
  });
  const fill = useTransform(eased, (value) => Math.min(1, Math.max(0.02, value)));

  // Aktiv ist der Schritt, der der Mitte des Bildes am naechsten steht.
  useEffect(() => {
    if (reduced) return;
    const node = host.current;
    if (!node) return;

    const rows = Array.from(
      node.querySelectorAll<HTMLElement>("[data-step]"),
    );
    if (rows.length === 0) return;

    let frame = 0;
    const pick = () => {
      frame = 0;
      const middle = window.innerHeight * 0.46;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      rows.forEach((row, index) => {
        const rect = row.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section className="section" data-shot="ablauf">
      <div className="shell">
        <div className={styles.secHead}>
          <WordReveal as="h2" className="t-h2" text={socialPage.steps.title} />
        </div>

        <div className={styles.chain} ref={host}>
          <span className={styles.rail} aria-hidden="true">
            <motion.span
              className={styles.railFill}
              style={{ scaleY: reduced ? 1 : fill }}
            />
          </span>

          {socialPage.steps.items.map((step, index) => (
            <div
              className={styles.step}
              data-step=""
              data-active={reduced ? true : index === active}
              key={step.n}
            >
              <span className={styles.stepNode} aria-hidden="true">
                {step.n}
              </span>
              <h3 className={`t-h3 ${styles.stepTitle}`}>{step.title}</h3>
              <p className={`t-body ${styles.stepBody}`}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
