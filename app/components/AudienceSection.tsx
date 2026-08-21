"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { audience } from "../content";
import { ChevronMark } from "./BIcons";
import { ArrowUpRight, Reveal, RevealGroup, revealChild } from "./ui";

/** Vertikaler Versatz der Karten (Desktop) – wie in der Referenz. */
const OFFSETS = ["min-[900px]:mt-0", "min-[900px]:mt-10", "min-[900px]:mt-10"];

export default function AudienceSection() {
  return (
    <section className="section" aria-labelledby="zielgruppen-titel">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden" style={{ borderRadius: 40 }}>
            <Image
              src="/img/audience-bg.png"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1232px"
              style={{ objectFit: "cover", filter: "saturate(0.72) brightness(1.13)" }}
              aria-hidden
            />
            {/* Die Referenzfläche ist durchgehend blasses Cyan. Unser Bild läuft
                nach rechts unten ins tiefe Blau — dort liegt der weiße Schleier
                am dichtesten. */}
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background: [
                  "radial-gradient(85% 85% at 100% 100%, rgba(255,255,255,.62) 0%, rgba(255,255,255,.18) 55%, rgba(255,255,255,0) 82%)",
                  "linear-gradient(180deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.3) 100%)",
                ].join(", "),
              }}
              aria-hidden
            />

            <div className="relative" style={{ padding: "clamp(28px,4vw,56px)" }}>
              <h2 id="zielgruppen-titel" className="t-h2" style={{ maxWidth: 620 }}>
                {audience.title}
              </h2>
              <p className="t-body mt-6" style={{ maxWidth: 620 }}>
                {audience.body}
              </p>

              <RevealGroup
                className="mt-14 grid grid-cols-1 items-start gap-6 min-[900px]:grid-cols-3"
                amount={0.15}
              >
                {audience.cards.map((card, i) => (
                  <motion.article
                    key={card.title}
                    variants={revealChild}
                    className={`card card-hover flex flex-col items-center text-center ${
                      OFFSETS[i] ?? ""
                    }`}
                    style={{ borderRadius: 24, padding: "40px 32px", minHeight: 210 }}
                  >
                    <span className="block" style={{ color: "var(--color-ink)" }}>
                      <ChevronMark size={28} />
                    </span>
                    <h3
                      className="mt-5"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 28,
                        fontWeight: 500,
                        lineHeight: 1.15,
                        letterSpacing: "-0.01em",
                        color: "var(--color-ink)",
                      }}
                    >
                      {card.title}
                    </h3>
                    <a
                      href={card.href}
                      className="mt-6 inline-flex items-center gap-2 font-semibold hover:underline"
                      style={{ color: "var(--color-brand-deep)" }}
                    >
                      {audience.ctaLabel}
                      <ArrowUpRight />
                    </a>
                  </motion.article>
                ))}
              </RevealGroup>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
