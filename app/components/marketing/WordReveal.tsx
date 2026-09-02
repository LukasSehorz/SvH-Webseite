"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./marketing.module.css";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Wort-Enthuellung                                                   */
/*                                                                     */
/*  Nachbau des Texteintritts von dnacapital.com (dna-text-entry).      */
/*  Waehrend des Eintritts liegt ueber jedem WORT eine helle Platte in  */
/*  Lavendel-Weiss mit fein gerasterten Kanten. Die Platten erscheinen  */
/*  wortweise gestaffelt und loesen sich dann auf, darunter steht das   */
/*  fertige Wort. Die ganze Zeile braucht rund 1.2 bis 1.6 Sekunden.    */
/*                                                                     */
/*  Bei reduzierter Bewegung steht der Text sofort, ohne Platten.       */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Versatz zwischen zwei Woertern. Die Referenz staffelt deutlich, die
    Platten der letzten Woerter stehen noch, wenn die ersten schon weg sind. */
const STAGGER = 0.13;

/** Wie lange eine Platte voll steht, bevor sie sich aufloest. */
const HOLD = 0.42;

/** Dauer des Aufloesens. */
const FADE = 0.5;

export default function WordReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
}: Readonly<{
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}>) {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLElement>(null);
  const inView = useInView(host, { once: true, margin: "0px 0px -12% 0px" });

  const words = text.split(" ").filter(Boolean);

  if (reduced) {
    return (
      <Tag ref={host as never} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={host as never} className={className}>
      {words.map((word, index) => {
        const at = delay + index * STAGGER;
        return (
          <span className={styles.wrWord} key={`${word}-${index}`}>
            {/* Das Wort selbst. Es steht immer, auch wenn die Animation
                nie laeuft. Verdeckt wird es allein von der Platte, die
                sich darueber legt und wieder aufloest. */}
            <span className={styles.wrText}>{word}</span>

            {/* Die helle Platte. Sie faehrt auf und loest sich dann auf. */}
            <motion.span
              className={styles.wrPlate}
              aria-hidden="true"
              initial={{ opacity: 0, scaleX: 0.72 }}
              animate={
                inView
                  ? { opacity: [0, 1, 1, 0], scaleX: [0.72, 1, 1, 1] }
                  : { opacity: 0 }
              }
              transition={{
                duration: HOLD + FADE,
                delay: at,
                ease: EASE,
                times: [0, 0.24, 0.46, 1],
              }}
            />
            {index < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
