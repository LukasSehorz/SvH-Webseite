"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Reduced Motion — hydrationssicher                                          */
/* -------------------------------------------------------------------------- */

/**
 * Wie `useReducedMotion()`, liefert aber beim Server-Rendern und beim ersten
 * Client-Render immer `false`. Erst nach dem Mounten wird auf die echte
 * Systemeinstellung umgeschaltet. Verhindert Hydration-Mismatches, wenn eine
 * Komponente je nach Einstellung anderes Markup ausgibt.
 */
export function useSafeReducedMotion(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!reduce;
}

/**
 * Requisiten für eine Endlos-Schleife, die bei reduzierter Bewegung wirklich
 * anhält.
 *
 * `animate={undefined}` reicht dafür nicht: die Einstellung steht erst nach dem
 * Mounten fest, die Schleife läuft bis dahin schon — und ein `undefined` stoppt
 * eine bereits laufende Animation nicht. Deshalb bekommt Framer stattdessen ein
 * konkretes Standbild und eine Dauer von 0; damit endet die Schleife messbar.
 */
export function loop<T extends object>(
  reduce: boolean,
  moving: T,
  still: T,
  transition: Transition
): { animate: T; transition: Transition } {
  return reduce
    ? { animate: still, transition: { duration: 0 } }
    : { animate: moving, transition };
}

/* -------------------------------------------------------------------------- */
/*  Hintergrund der blauen Sektionsflächen                                     */
/* -------------------------------------------------------------------------- */

/**
 * Sehr blasse Riesen-Wortmarke + Chevron-Geometrie im Hintergrund einer
 * `.slab`-Fläche — wandert beim Scrollen minimal mit (Parallax).
 * Entspricht der „APEX“-Wortmarke der Referenz.
 */
export function SlabMark({
  label = "SVH",
  markOpacity = 0.07,
}: {
  label?: string;
  markOpacity?: number;
}) {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGeo = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [34, -34]);
  const yWord = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [56, -56]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Wortmarke */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ y: yWord }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: "clamp(150px, 23vw, 360px)",
            lineHeight: 0.8,
            letterSpacing: "0.06em",
            color: "#fff",
            opacity: markOpacity,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {label}
        </span>
      </motion.div>

      {/* Chevron-Geometrie */}
      <motion.svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.13, y: yGeo }}
        fill="none"
      >
        <path d="M110 470 L400 90 L690 470" stroke="#fff" strokeWidth="2" />
        <path d="M180 470 L400 180 L620 470" stroke="#fff" strokeWidth="2" />
        <path d="M250 470 L400 270 L550 470" stroke="#fff" strokeWidth="2" />
        <path d="M400 130 L640 340 L400 550 L160 340 Z" stroke="#fff" strokeWidth="1.4" />
        <path d="M400 240 L520 345 L400 450 L280 345 Z" fill="#fff" opacity="0.05" />
      </motion.svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scroll-Reveal                                                             */
/* -------------------------------------------------------------------------- */

export const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Hüllt Inhalt in ein einmaliges Fade-Up beim Scrollen. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduce = useSafeReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Container, dessen direkte Kinder (mit `variants={revealChild}`) gestaffelt erscheinen. */
export function RevealGroup({
  children,
  className,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={revealParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Zähler                                                                    */
/* -------------------------------------------------------------------------- */

/** Zählt beim Sichtbarwerden von 0 auf `value` hoch. */
export function CountUp({
  value,
  duration = 1.6,
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useSafeReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Bei reduzierter Bewegung sofort den Endwert zeigen.
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("de-DE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/** Weich nachziehende Zahl für den ROI-Rechner. */
export function SmoothNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce = useSafeReducedMotion();
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 180, damping: 26 });
  const [out, setOut] = useState(format(value));

  useEffect(() => {
    if (reduce) {
      setOut(format(value));
      return;
    }
    mv.set(value);
  }, [value, mv, reduce, format]);

  useEffect(() => {
    if (reduce) return;
    return spring.on("change", (v) => setOut(format(v)));
  }, [spring, format, reduce]);

  return <span className={className}>{out}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                   */
/* -------------------------------------------------------------------------- */

export function ButtonLink({
  href,
  children,
  variant = "dark",
  size = "md",
  className = "",
  withArrow = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light";
  size?: "md" | "sm";
  className?: string;
  withArrow?: boolean;
}) {
  return (
    <a
      href={href}
      className={`btn ${variant === "dark" ? "btn-dark" : "btn-light"} ${
        size === "sm" ? "btn-sm" : ""
      } ${className}`}
    >
      {children}
      {withArrow && <ArrowUpRight />}
    </a>
  );
}

export function ArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5 11.5 4.5M11.5 4.5H5.75M11.5 4.5v5.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path
        d="m6.2 10.2 2.5 2.4 5-5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sektions-Kopf                                                             */
/* -------------------------------------------------------------------------- */

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "onBlue";
  className?: string;
}) {
  const isCenter = align === "center";
  return (
    <Reveal className={`${isCenter ? "text-center mx-auto" : ""} ${className}`}>
      {eyebrow && (
        <p
          className="t-eyebrow mb-4"
          style={{ color: tone === "onBlue" ? "rgba(255,255,255,.82)" : "var(--color-brand-deep)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="t-h2" style={tone === "onBlue" ? { color: "#fff" } : undefined}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={`t-lead mt-5 ${isCenter ? "mx-auto" : ""}`}
          style={{
            maxWidth: 720,
            color: tone === "onBlue" ? "rgba(255,255,255,.9)" : undefined,
          }}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
