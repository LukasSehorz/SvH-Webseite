"use client";

import { motion } from "framer-motion";
import { EASE, useSafeReducedMotion } from "./ui";
import { ButtonLink } from "./ui";

/**
 * Kopfbereich der Unterseiten — entspricht dem Muster der Referenz:
 * vollflächiger Cyan-Verlauf, zentrierte Pill-Überzeile, riesige zweifarbige
 * Serif-Überschrift, zentrierter Fließtext, dunkler Button.
 *
 * `align="left"` liefert die Variante der Kontaktseite (linksbündig, ohne Pill).
 */
export default function SubpageHero({
  eyebrow,
  titleDark,
  titleBrand,
  lead,
  cta,
  ctaHref = "/unternehmen/kontakt",
  align = "center",
  tone = "cyan",
  titleTone = "split",
  size = "md",
}: {
  eyebrow?: string;
  titleDark: string;
  titleBrand: string;
  lead: string;
  cta?: string;
  ctaHref?: string;
  align?: "center" | "left";
  tone?: "cyan" | "light";
  /** "split" = erste Zeile dunkel, zweite in Markenfarbe. "brand" = alles in Markenfarbe. */
  titleTone?: "split" | "brand";
  /** "lg" für Seiten mit sehr kurzer Überschrift (z. B. Kontakt). */
  size?: "md" | "lg";
}) {
  const reduce = useSafeReducedMotion();
  const isCenter = align === "center";
  const allBrand = titleTone === "brand";

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background:
          tone === "cyan"
            ? "radial-gradient(120% 100% at 50% 0%, #BDE9FF 0%, #E8F8FF 42%, #FCFEFF 78%)"
            : "linear-gradient(180deg, #FFFFFF 0%, var(--color-tint-3) 100%)",
        paddingTop: eyebrow ? 176 : 152,
        paddingBottom: 96,
      }}
    >
      {/* Chevron-Geometrie im Hintergrund */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1440 760"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <motion.g
          stroke="#fff"
          strokeWidth="2"
          animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M300 740 L720 120 L1140 740" />
          <path d="M430 740 L720 300 L1010 740" />
          <path d="M560 740 L720 480 L880 740" />
        </motion.g>
        <path
          d="M720 200 L1080 470 L720 740 L360 470 Z"
          stroke="#fff"
          strokeWidth="1.6"
          opacity="0.75"
        />
      </motion.svg>

      <div className="shell relative">
        <div
          className={isCenter ? "mx-auto text-center" : ""}
          style={{ maxWidth: isCenter ? 1080 : 900 }}
        >
          {eyebrow && (
            <motion.p
              className={isCenter ? "mx-auto" : ""}
              style={{
                display: "inline-block",
                borderRadius: 999,
                padding: "10px 24px",
                background: "rgba(255,255,255,.72)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,.9)",
                boxShadow: "0 6px 20px -12px rgba(0,26,35,.3)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "var(--color-brand-deep)",
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            className="t-hero"
            style={{
              marginTop: eyebrow ? 28 : 0,
              ...(size === "lg"
                ? { fontSize: "clamp(46px, 6.6vw, 95px)", lineHeight: 1.08 }
                : null),
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
          >
            <span style={{ color: allBrand ? "var(--color-brand)" : "var(--color-ink)" }}>
              {titleDark}{" "}
            </span>
            <span style={{ color: "var(--color-brand)" }}>{titleBrand}</span>
          </motion.h1>

          <motion.p
            className={`t-lead ${isCenter ? "mx-auto" : ""}`}
            style={{ marginTop: 28, maxWidth: 860 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.18 }}
          >
            {lead}
          </motion.p>

          {cta && (
            <motion.div
              style={{ marginTop: 40 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
            >
              <ButtonLink href={ctaHref} variant="dark">
                {cta}
              </ButtonLink>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
