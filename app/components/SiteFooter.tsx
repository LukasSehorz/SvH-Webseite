"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { company, footer, newsletter } from "../content";
import { MailIcon } from "./BIcons";
import Logo from "./Logo";
import { EASE, useSafeReducedMotion } from "./ui";

const FOOTER_CSS = `
.svh-footer-link{
  font-size:16px;color:var(--color-muted);
  transition:color .2s var(--ease-out-expo);
}
.svh-footer-link:hover{color:var(--color-brand-deep);text-decoration:underline}
`;

const LEGAL = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
];

function FooterSubscribe() {
  const reduce = useSafeReducedMotion();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="mt-8">
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          E-Mail-Adresse für den Newsletter
        </label>
        <div
          className="flex min-w-0 flex-1 items-center gap-3"
          style={{
            height: 52,
            maxWidth: 320,
            background: "#fff",
            border: "1px solid var(--color-tint-1)",
            borderRadius: 999,
            padding: "0 18px",
          }}
        >
          <span style={{ color: "var(--color-brand)" }} aria-hidden>
            <MailIcon size={18} />
          </span>
          <input
            id={inputId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ihre E-Mail-Adresse"
            className="min-w-0 flex-1 bg-transparent"
            style={{ fontSize: 15, color: "var(--color-ink)", border: 0, outline: "none" }}
          />
        </div>
        <button type="submit" className="btn btn-dark btn-sm shrink-0">
          Abonnieren
        </button>
      </form>

      <div aria-live="polite" className="mt-3 min-h-[20px]">
        <AnimatePresence>
          {sent && (
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)" }}
            >
              Danke! Wir melden uns.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-1" style={{ fontSize: 13, color: "var(--color-muted)" }}>
        {newsletter.consent}
      </p>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ paddingBottom: 56 }}>
      <style>{FOOTER_CSS}</style>

      {/* sehr blasse Riesen-Wortmarke im Hintergrund (wie in der Referenz) */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          left: "-2%",
          bottom: "-14%",
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: "clamp(150px, 22vw, 330px)",
          lineHeight: 0.8,
          letterSpacing: "0.06em",
          color: "var(--color-brand)",
          opacity: 0.06,
          whiteSpace: "nowrap",
        }}
      >
        SVH
      </span>

      <div className="shell relative">
        <div style={{ height: 1, background: "var(--color-brand)" }} />

        <div className="grid grid-cols-1 gap-12 pt-14 md:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
          {/* Spalte 1 */}
          <div>
            <Logo height={38} />
            <p className="t-body mt-6" style={{ maxWidth: 480 }}>
              {footer.about}
            </p>
            <FooterSubscribe />
          </div>

          {/* Spalten 2–4 */}
          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink)" }}>{col.title}</p>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    <a href={link.href} className="svh-footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Abschlusszeile */}
        <div
          className="mt-14 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid rgba(0,26,35,.08)" }}
        >
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink)" }}>{company.claim}</p>
          <ul className="flex flex-wrap gap-6">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:underline" style={{ color: "var(--color-brand-deep)" }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4" style={{ fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>
          {company.legalName} · {company.street} · {company.zipCity} · {company.country} ·{" "}
          <a href={`tel:${company.phoneHref}`} className="hover:underline" style={{ color: "var(--color-brand-deep)" }}>
            {company.phone}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${company.email}`} className="hover:underline" style={{ color: "var(--color-brand-deep)" }}>
            {company.email}
          </a>
        </p>
      </div>
    </footer>
  );
}
