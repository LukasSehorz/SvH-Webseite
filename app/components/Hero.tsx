"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { hero, toolLogos } from "../content";
import { ButtonLink, EASE, loop, useSafeReducedMotion } from "./ui";

/**
 * Feste Streu-Positionen der Chips (in % des Chip-Bandes, das erst bei 52 % der
 * Viewport-Breite beginnt — so bleibt die Textspalte frei).
 */
const CHIP_POS = [
  { top: "13%", left: "40%", float: 6.4, delay: 0 },
  { top: "26%", left: "52%", float: 7.2, delay: 0.6 },
  { top: "22%", left: "5%", float: 5.6, delay: 1.1 },
  { top: "45%", left: "26%", float: 6.8, delay: 0.3 },
  { top: "54%", left: "55%", float: 7.8, delay: 0.9 },
  { top: "70%", left: "1%", float: 6.0, delay: 1.4 },
  { top: "78%", left: "41%", float: 7.4, delay: 0.45 },
];

export default function Hero() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate overflow-hidden"
      style={{
        minHeight: "min(100vh, 1000px)",
        background:
          "radial-gradient(120% 90% at 100% 100%, var(--color-tint-2) 0%, var(--color-tint-3) 38%, #FFFFFF 72%)",
      }}
    >
      <div
        className="relative flex items-center"
        style={{ minHeight: "min(100vh, 1000px)", paddingTop: 128, paddingBottom: 56 }}
      >
        {/* ---- Grafik rechts (ab lg absolut, darunter dezenter Hintergrund) ---- */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-0"
          style={{
            y: artY,
            width: "min(72vw, 1040px)",
            opacity: 1,
          }}
        >
          <div className="relative h-full w-full">
            {/* pulsierender Cyan-Glow */}
            <motion.div
              className="absolute"
              style={{
                right: "6%",
                top: "22%",
                width: "62%",
                aspectRatio: "1",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle, rgba(0,188,255,.16) 0%, rgba(0,146,212,.07) 45%, transparent 70%)",
                filter: "blur(14px)",
              }}
              {...loop(
                reduce,
                { opacity: [0.55, 0.95, 0.55], scale: [0.94, 1.06, 0.94] },
                { opacity: 0.75, scale: 1 },
                { duration: 10, repeat: Infinity, ease: "easeInOut" }
              )}
            />
            <Image
              src="/img/hero-geometry.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 72vw"
              className="svh-hero-art object-cover object-right-bottom"
            />
            {/* Verlauf nach links, damit der Text ruhig bleibt (Referenz: Grafik
                verblasst um x ≈ 700 px), plus Aufhellung von oben und aus der
                oberen rechten Ecke — dort liegen die Chips, und die Referenz ist
                in diesem Bereich fast weiss. */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "radial-gradient(70% 55% at 100% 0%, rgba(255,255,255,.92) 0%, rgba(255,255,255,.55) 45%, rgba(255,255,255,0) 78%)",
                  "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,.72) 16%, rgba(255,255,255,0) 46%)",
                  "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 30%, rgba(255,255,255,0) 60%)",
                ].join(", "),
              }}
            />
          </div>
        </motion.div>

        {/* ---- Textspalte ---- */}
        <div className="shell relative z-10 w-full">
          <div style={{ maxWidth: 880 }}>
            <motion.p
              className="t-eyebrow"
              style={{ color: "var(--color-ink)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            >
              {hero.eyebrow}
            </motion.p>

            <motion.h1
              className="t-hero mt-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
            >
              <span className="block">{hero.titleLine1}</span>
              <span className="block" style={{ color: "var(--color-brand)" }}>
                {hero.titleLine2}
              </span>
            </motion.h1>

            <motion.p
              className="t-lead mt-7"
              style={{ maxWidth: 640 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.22 }}
            >
              {hero.lead}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
            >
              <ButtonLink href={hero.primary.href} variant="dark">
                {hero.primary.label}
              </ButtonLink>
              <ButtonLink href={hero.secondary.href} variant="light">
                {hero.secondary.label}
              </ButtonLink>
            </motion.div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
            >
              <p style={{ fontSize: 16, fontWeight: 500, color: "var(--color-muted)" }}>
                {hero.trustLine}
              </p>

              {/* Partner-/Werkzeug-Wortmarken direkt darunter (wie in der Referenz) */}
              <ul className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 sm:gap-x-10">
                {toolLogos.map((name) => (
                  <li key={name}>
                    <span
                      className="svh-tool-mark"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 19,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        color: "var(--color-muted)",
                        opacity: 0.5,
                        transition:
                          "opacity .28s var(--ease-out-expo), color .28s var(--ease-out-expo)",
                      }}
                    >
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* ---- Schwebende Chips (nur Desktop) ---- */}
        <div
          aria-hidden
          className="svh-hero-chips pointer-events-none absolute inset-y-0 z-20"
          style={{ left: "52%", right: "var(--gutter)" }}
        >
          <div className="relative h-full w-full">
            {hero.chips.map((chip, i) => {
              const p = CHIP_POS[i % CHIP_POS.length];
              return (
                <motion.span
                  key={chip}
                  className="absolute whitespace-nowrap"
                  style={{
                    top: p.top,
                    left: p.left,
                    borderRadius: 999,
                    padding: "12px 22px",
                    background: "#fff",
                    border: "1px solid rgba(0,26,35,.06)",
                    boxShadow:
                      "0 1px 2px rgba(0,26,35,.05), 0 16px 34px -20px rgba(0,26,35,.28)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--color-muted)",
                    maxWidth: "100%",
                  }}
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 1, scale: 1, y: [0, -8, 0] }
                  }
                  transition={
                    reduce
                      ? { duration: 0.4 }
                      : {
                          opacity: { duration: 0.5, ease: EASE, delay: 0.5 + i * 0.09 },
                          scale: { duration: 0.5, ease: EASE, delay: 0.5 + i * 0.09 },
                          y: {
                            duration: p.float,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: p.delay,
                          },
                        }
                  }
                >
                  {chip}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .svh-hero-art {
          opacity: 0.22;
        }
        .svh-hero-chips {
          display: none;
        }
        .svh-tool-mark:hover {
          opacity: 1 !important;
          color: var(--color-ink) !important;
        }
        @media (min-width: 1024px) {
          .svh-hero-art {
            opacity: 0.55;
            filter: saturate(0.82);
          }
        }
        @media (min-width: 1280px) {
          .svh-hero-chips {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}
