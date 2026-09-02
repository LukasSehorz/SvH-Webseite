"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Bewegungseinstellung des Systems                                   */
/* ------------------------------------------------------------------ */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Liest `prefers-reduced-motion` ohne Hydrations-Sprung.
 * Server und erster Client-Durchlauf liefern `false`, direkt vor dem
 * ersten Anstrich wird der echte Wert nachgezogen.
 */
export function useSafeReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useIsoLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/*  Textbausteine                                                      */
/* ------------------------------------------------------------------ */

/** Nummern-Label im Stil `01 · PROBLEM`, optional mit Haarlinie darüber. */
export function SectionLabel({
  children,
  rule = true,
}: Readonly<{ children: React.ReactNode; rule?: boolean }>) {
  return (
    <div style={{ marginBottom: 28 }}>
      {rule ? <hr className="hairline" style={{ marginBottom: 18 }} /> : null}
      <p className="t-label">{children}</p>
    </div>
  );
}

/** Genau EIN Wort pro Sektion trägt den Verlauf. */
export function GradientWord({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <span className="grad-word">{children}</span>;
}

/**
 * Überschrift aus copy.ts, bei der `word` den Verlauf trägt.
 * Leere Teile werden weggelassen, damit keine doppelten Leerzeichen entstehen.
 */
export function SplitHeadline({
  before,
  word,
  after,
  className = "t-display",
  as: Tag = "h2",
}: Readonly<{
  before?: string;
  word: string;
  after?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}>) {
  return (
    <Tag className={className}>
      {before ? <>{before} </> : null}
      <GradientWord>{word}</GradientWord>
      {after ? <> {after}</> : null}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Kreisrunder Pfeil                                                  */
/* ------------------------------------------------------------------ */

export function CircleArrow({ size = 44 }: Readonly<{ size?: number }>) {
  return (
    <span
      className="circle-arrow"
      aria-hidden="true"
      style={{ width: size, height: size, flexBasis: size }}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path
          d="M4 11L11 4M11 4H5.2M11 4V9.8"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Textlink mit rundem Pfeil als Abschluss einer Sektion. */
export function CircleLink({
  href,
  label,
}: Readonly<{ href: string; label: string }>) {
  return (
    <Link
      href={href}
      className="circle-link"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        color: "var(--ink)",
        fontSize: 15.5,
      }}
    >
      <span>{label}</span>
      <CircleArrow />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Mikro-Reveals                                                      */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade-up über 24px. Bei reduzierter Bewegung bleibt ein reiner Fade. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  style,
  as = "div",
}: Readonly<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "span";
}>) {
  const reduced = useSafeReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.3 : 0.7,
        delay: reduced ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </Tag>
  );
}

const groupVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const itemVariantsReduced: Variants = {
  hidden: { opacity: 0, y: 0 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

/** Container für gestaffelte Kinder. Nutzt `RevealItem` als Kind. */
export function RevealGroup({
  children,
  className,
  style,
  as = "div",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "ul" | "ol";
}>) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      variants={groupVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  style,
  as = "div",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "p";
}>) {
  const reduced = useSafeReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      variants={reduced ? itemVariantsReduced : itemVariants}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Gestrichelte Eckwinkel                                             */
/* ------------------------------------------------------------------ */

/** Vier gestrichelte Winkel für `.corner-box`. */
export function Corners() {
  return (
    <>
      <span className="corner corner-tl" aria-hidden="true" />
      <span className="corner corner-tr" aria-hidden="true" />
      <span className="corner corner-bl" aria-hidden="true" />
      <span className="corner corner-br" aria-hidden="true" />
    </>
  );
}
