"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { finalCta } from "../content";
import { ButtonLink, EASE, useSafeReducedMotion } from "./ui";

export default function FinalCta() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="kontakt" className="section" aria-labelledby="cta-titel">
      <div className="shell">
        <div
          ref={ref}
          className="relative flex items-center justify-center overflow-hidden"
          style={{ borderRadius: 40, minHeight: 620, padding: "clamp(32px,4vw,64px)" }}
        >
          <Image
            src="/img/cta-pattern.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1232px"
            style={{ objectFit: "cover" }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.70) 0%, rgba(255,255,255,.40) 42%, rgba(255,255,255,.58) 100%)",
            }}
            aria-hidden
          />

          <motion.div
            className="relative w-full"
            style={{ maxWidth: 1000, y: reduce ? 0 : y }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div
              className="text-center"
              style={{
                background: "rgba(255,255,255,.35)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: 28,
                padding: "clamp(28px,3.4vw,48px)",
              }}
            >
              <h2
                id="cta-titel"
                className="t-h2"
                style={{ fontSize: "clamp(34px,4.45vw,64px)", lineHeight: 1.08 }}
              >
                <span style={{ color: "var(--color-ink)" }}>{finalCta.titleLine1}</span>{" "}
                <span style={{ color: "var(--color-brand)" }}>{finalCta.titleLine2}</span>
              </h2>

              <p className="t-lead mx-auto mt-6" style={{ maxWidth: 960 }}>
                {finalCta.body}
              </p>

              <div className="mt-9 flex justify-center">
                <ButtonLink href={finalCta.cta.href}>{finalCta.cta.label}</ButtonLink>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
