"use client";

/* M6. Die Deckkraft haengt dauerhaft an der Scrollposition und nicht an
   einem einmaligen Eintritt. Wer zurueckscrollt, sieht dasselbe Bild
   wie beim Hinweg.

   Die Untergrenze steht bei 0,35, wie im Auftrag verlangt. Sie ist eine
   Grenze fuer den Rand des Schirms und nicht fuer den Lesebereich, und
   das ist der Punkt, an dem diese Mechanik auf Schwarz gefaehrlich
   wird. Gerechnet fuer eine Reihe von 470 Bildpunkten auf einem Schirm
   von 900 laeuft der Fortschritt von 0 bis 1 ueber 1370 Bildpunkte. Die
   Reihe steht genau dann vollstaendig im Bild, wenn der Fortschritt
   zwischen 0,343 und 0,657 liegt. Die Stuetzstellen bei 0,33 und 0,67
   sind deshalb so gesetzt, dass die volle Deckkraft schon erreicht ist,
   bevor die letzte Zeile der Reihe ueberhaupt sichtbar wird. Blasser
   Text steht damit immer nur dann auf dem Schirm, wenn er halb
   abgeschnitten ist.

   Bei prefers-reduced-motion steht alles bei voller Deckkraft. */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";

export default function Fade({
  children,
  className,
  style,
  versatz = 0,
  boden = 0.35,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /* Verschiebt das Fenster leicht, damit vier Spalten nebeneinander
     nicht im Gleichschritt aufblenden. */
  versatz?: number;
  boden?: number;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useSafeReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const v = versatz;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2 + v, 0.33 + v, 0.67 + v, 0.8 + v, 1],
    [boden, 0.75, 1, 1, 0.75, boden],
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, opacity: reduced ? 1 : opacity }}
    >
      {children}
    </motion.div>
  );
}
