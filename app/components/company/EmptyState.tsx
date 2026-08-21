"use client";

import { motion } from "framer-motion";
import { ButtonLink, Reveal, loop, useSafeReducedMotion } from "../ui";

/**
 * Leerer Zustand für Blog und Fallstudien — bewusst leer, solange es keine
 * echten Beiträge gibt. Es wird nichts erfunden.
 */
export default function EmptyState({
  title,
  body,
  cta,
  ctaHref = "/unternehmen/kontakt",
}: {
  title: string;
  body: string;
  cta: string;
  ctaHref?: string;
}) {
  const reduce = useSafeReducedMotion();

  return (
    <section className="section" aria-labelledby="empty-title">
      <div className="shell">
        <Reveal>
          <div
            style={{
              borderRadius: 28,
              background: "var(--color-tint-3)",
              padding: "clamp(40px, 7vw, 72px) clamp(20px, 5vw, 72px)",
              textAlign: "center",
            }}
          >
            <motion.svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              aria-hidden
              className="mx-auto"
              {...loop(
                reduce,
                { opacity: [0.45, 1, 0.45], scale: [1, 1.04, 1] },
                { opacity: 1, scale: 1 },
                { duration: 6, repeat: Infinity, ease: "easeInOut" }
              )}
            >
              <path
                d="M10 54 L36 14 L62 54"
                stroke="var(--color-brand)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 54 L36 32 L50 54"
                stroke="var(--color-brand-bright)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.65"
              />
              <path
                d="M31 54 L36 46 L41 54"
                stroke="var(--color-brand-bright)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />
            </motion.svg>

            <h2 className="t-h3" id="empty-title" style={{ marginTop: 28 }}>
              {title}
            </h2>
            <p className="t-body mx-auto" style={{ marginTop: 14, maxWidth: 520 }}>
              {body}
            </p>

            <div style={{ marginTop: 32 }}>
              <ButtonLink href={ctaHref} variant="dark">
                {cta}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Kartenraster für Blog/Fallstudien, sobald Einträge vorhanden sind. */
export function ResourceGrid({
  items,
}: {
  items: { title: string; badge: string; excerpt: string; href: string; image: string }[];
}) {
  return (
    <section className="section" aria-label="Beiträge">
      <div className="shell">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Reveal as="article" key={it.href} className="card card-hover overflow-hidden">
              <img
                src={it.image}
                alt=""
                style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
              />
              <div style={{ padding: 28 }}>
                <p
                  className="t-eyebrow"
                  style={{ fontSize: 12, color: "var(--color-brand-deep)" }}
                >
                  {it.badge}
                </p>
                <h3 className="t-h3" style={{ marginTop: 12, fontSize: 24 }}>
                  {it.title}
                </h3>
                <p className="t-body" style={{ marginTop: 12 }}>
                  {it.excerpt}
                </p>
                <a
                  href={it.href}
                  style={{
                    display: "inline-block",
                    marginTop: 20,
                    color: "var(--color-brand-deep)",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Weiterlesen
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
