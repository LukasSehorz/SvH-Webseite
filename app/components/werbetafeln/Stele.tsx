"use client";

/* Die Tafel. Eine flache Form aus Licht und Schatten, keine WebGL-Szene.
   Die Landingpage traegt bereits eine Struktur in three.js, eine zweite
   Szene kostet Bildrate, und die Kamerafahrt nach M4 laeuft hier ueber
   eine leichte Drehung in transform mit perspective.

   Die Drehung haengt am Scrollstand und nicht an einer Uhr. Wer
   stehenbleibt, sieht ein stehendes Bild. */

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import Spot, { type SpotDaten } from "./Spot";
import styles from "./werbetafeln.module.css";

export default function Stele({
  spot,
  className,
  bloom = 62,
  neigung = 6,
  mitTeppich = true,
  mitFusz = true,
  bewegt = false,
  groesze = "300px",
  label,
}: Readonly<{
  spot: SpotDaten;
  className?: string;
  bloom?: number;
  neigung?: number;
  mitTeppich?: boolean;
  mitFusz?: boolean;
  bewegt?: boolean;
  groesze?: string;
  label?: string;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useSafeReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const ry = useTransform(scrollYProgress, [0, 1], [`${neigung}deg`, `${-neigung}deg`]);
  const rx = useTransform(scrollYProgress, [0, 0.5, 1], ["-2.2deg", "0.4deg", "2.2deg"]);

  return (
    <div
      ref={ref}
      className={`${styles.stele} ${className ?? ""}`}
      style={{ "--bloom": `${bloom}px` } as CSSProperties}
      aria-label={label}
      role={label ? "group" : undefined}
    >
      {mitTeppich ? <span className={styles.carpet} aria-hidden="true" /> : null}

      <motion.div
        className={styles.steleBody}
        style={
          {
            "--ry": reduced ? "0deg" : ry,
            "--rx": reduced ? "0deg" : rx,
          } as CSSProperties
        }
      >
        <div className={styles.case}>
          <div className={styles.screen}>
            <Spot spot={spot} bewegt={bewegt} groesze={groesze} />
          </div>
          <span className={styles.caseMark} aria-hidden="true" />
        </div>

        {mitFusz ? (
          <>
            <span className={styles.stem} aria-hidden="true" />
            <span className={styles.base} aria-hidden="true" />
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
