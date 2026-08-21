"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { newsletter } from "../content";
import { PaperPlaneIcon } from "./BIcons";
import { EASE, Reveal, loop, useSafeReducedMotion } from "./ui";

export default function NewsletterSection() {
  const reduce = useSafeReducedMotion();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="newsletter" className="section" aria-labelledby="newsletter-titel">
      <div className="shell">
        <Reveal>
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 40,
              background: "linear-gradient(100deg,#FFFFFF 0%,#8FDDFB 55%,#00BCFF 100%)",
              padding: "clamp(28px,4vw,56px)",
            }}
          >
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
              {/* Links */}
              <div>
                <h2 id="newsletter-titel" className="t-h2">
                  {newsletter.title}
                </h2>
                <p className="t-body mt-5" style={{ maxWidth: 420, color: "rgba(0,26,35,.8)" }}>
                  {newsletter.body}
                </p>

                <form
                  className="mt-8 flex flex-wrap items-center gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <label htmlFor={inputId} className="sr-only">
                    E-Mail-Adresse
                  </label>
                  <input
                    id={inputId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletter.placeholder}
                    className="min-w-0 flex-1"
                    style={{
                      height: 62,
                      background: "#fff",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,.9)",
                      padding: "0 20px",
                      fontSize: 16,
                      color: "var(--color-ink)",
                      maxWidth: 340,
                    }}
                  />
                  <button
                    type="submit"
                    aria-label="Newsletter abonnieren"
                    className="flex shrink-0 items-center justify-center transition-transform duration-200 hover:scale-105"
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 14,
                      background: "#fff",
                      color: "var(--color-brand)",
                      boxShadow: "0 10px 26px -16px rgba(0,26,35,.5)",
                    }}
                  >
                    <PaperPlaneIcon size={22} />
                  </button>
                </form>

                <div aria-live="polite" className="mt-3 min-h-[22px]">
                  <AnimatePresence>
                    {sent && (
                      <motion.p
                        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}
                      >
                        Danke! Wir melden uns.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <p className="mt-2" style={{ fontSize: 13, color: "rgba(0,26,35,.6)" }}>
                  {newsletter.consent}
                </p>
              </div>

              {/* Rechts: Buch */}
              <motion.div
                className="relative mx-auto w-full"
                style={{ maxWidth: 420, rotate: -8 }}
                {...loop(reduce, { y: [0, -10, 0] }, { y: 0 }, {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                })}
              >
                <Image
                  src="/img/newsletter-book.png"
                  alt="Leitfaden von SVH Consulting als gedrucktes Buch"
                  width={840}
                  height={1120}
                  style={{ width: "100%", height: "auto" }}
                />
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
