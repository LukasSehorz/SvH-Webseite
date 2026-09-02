"use client";

import { useEffect, useId, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import styles from "./marketing.module.css";

/* ------------------------------------------------------------------ */
/*  Ring-Zaehler                                                       */
/*                                                                     */
/*  Vorbild sind die Ringe der DNA-Startseite. Ein duenner Kreis mit    */
/*  Verlaufsstrich zeichnet sich beim Eintritt, danach erscheint der    */
/*  Wert und darunter die Beschriftung. Zahlen ab zehn zaehlen hoch,    */
/*  kleine Zahlen blenden mit leichtem Massstab ein.                    */
/*                                                                     */
/*  Die Werte kommen unveraendert aus copy.ts. Hier wird nur zerlegt,   */
/*  welcher Teil eine Zahl ist und welcher als Zusatz stehen bleibt.    */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Dauer der Ringzeichnung. */
const DRAW = 1.2;

/** Versatz zwischen den Ringen. */
const STAGGER = 0.2;

/** Der Wert setzt kurz vor dem Ende der Zeichnung ein. */
const VALUE_LEAD = 0.7;

/** Ab dieser Groesse lohnt das Hochzaehlen. */
const COUNT_FROM = 10;

function split(value: string): { number: number | null; suffix: string } {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return { number: null, suffix: value };
  return { number: Number(match[1]), suffix: match[2] };
}

/** Die drei Ringe variieren ueber die Rampe, wie die Referenz ihre Ringe
    unterschiedlich einfaerbt. Blau, Violett, Lavendel. */
const RING_COLORS = [
  ["var(--acc-blue)", "#7ba4ff"],
  ["var(--acc-violet)", "var(--acc-blue)"],
  ["var(--acc-lav)", "var(--acc-violet)"],
] as const;

export default function RingStat({
  value,
  label,
  index,
  active,
}: Readonly<{
  value: string;
  label: string;
  index: number;
  active: boolean;
}>) {
  const tone = RING_COLORS[index % RING_COLORS.length];
  const reduced = useSafeReducedMotion();
  const gradientId = useId();
  const parts = split(value);
  const counts = parts.number !== null && parts.number >= COUNT_FROM;

  const motionValue = useMotionValue(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!counts || parts.number === null) return;
    if (!active) return;
    if (reduced) {
      setShown(parts.number);
      return;
    }
    const controls = animate(motionValue, parts.number, {
      duration: DRAW,
      delay: index * STAGGER + VALUE_LEAD,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [active, counts, index, motionValue, parts.number, reduced]);

  const drawDelay = reduced ? 0 : index * STAGGER;
  const valueDelay = reduced ? 0 : index * STAGGER + VALUE_LEAD;

  return (
    <div className={styles.ring}>
      <div className={styles.ringDisc}>
        <svg
          className={styles.ringSvg}
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={tone[1]} />
              <stop offset="100%" stopColor={tone[0]} />
            </linearGradient>
          </defs>

          {/* Ruhender Grundring, damit die Stelle vor der Zeichnung nicht leer wirkt. */}
          <circle cx="50" cy="50" r="48" stroke="var(--line-2)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

          <motion.circle
            cx="50"
            cy="50"
            r="48"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: active ? 0 : 1 }}
            transition={{
              duration: reduced ? 0 : DRAW,
              delay: drawDelay,
              ease: EASE,
            }}
          />
        </svg>

        <motion.p
          className={styles.ringValue}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.86 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{
            duration: reduced ? 0.3 : 0.7,
            delay: valueDelay,
            ease: EASE,
          }}
        >
          {counts ? shown : parts.number ?? value}
          {parts.suffix ? (
            <span className={styles.ringSuffix}>{parts.suffix}</span>
          ) : null}
        </motion.p>
      </div>

      <motion.p
        className={`t-body ${styles.ringLabel}`}
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{
          duration: reduced ? 0.3 : 0.7,
          delay: valueDelay + 0.12,
          ease: EASE,
        }}
      >
        {label}
      </motion.p>
    </div>
  );
}
