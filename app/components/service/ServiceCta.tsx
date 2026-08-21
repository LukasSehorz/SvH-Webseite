"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ButtonLink, EASE, useSafeReducedMotion } from "../ui";

/**
 * Abschluss-Fläche der Leistungsseiten — dieselbe Bildsprache wie der
 * Schluss-CTA der Startseite, aber mit eigenem Text.
 */
export default function ServiceCta({
  body = "Wir schauen uns Ihre Situation an und sagen Ihnen offen, ob und wo sich etwas für Sie lohnt. Kein Verkaufsgespräch, keine Präsentation.",
  cta = "Termin vereinbaren",
}: {
  body?: string;
  cta?: string;
}) {
  const reduce = useSafeReducedMotion();

  return (
    <section className="section" aria-labelledby="service-cta-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ borderRadius: 40, minHeight: 480, padding: "clamp(32px,4vw,64px)" }}
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
            className="relative w-full text-center"
            style={{ maxWidth: 900 }}
            initial={{ opacity: 0, y: reduce ? 0 : 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <h2
              id="service-cta-titel"
              className="t-h2"
              style={{ fontSize: "clamp(32px,4vw,58px)", lineHeight: 1.1 }}
            >
              <span style={{ color: "var(--color-ink)" }}>Lassen Sie uns kurz sprechen.</span>{" "}
              <span style={{ color: "var(--color-brand)" }}>
                Zwanzig Minuten, unverbindlich.
              </span>
            </h2>

            <p className="t-lead mx-auto mt-6" style={{ maxWidth: 680 }}>
              {body}
            </p>

            <div className="mt-9 flex justify-center">
              <ButtonLink href="/unternehmen/kontakt">{cta}</ButtonLink>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
