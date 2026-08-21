"use client";

import { motion } from "framer-motion";
import { RevealGroup, SectionHead, revealChild } from "../ui";

/**
 * Initialen einer Person: „Lukas Sehorz" → „LS", „Jannik vom Hofe" → „JH".
 * Namenszusätze wie „vom", „von" oder „de" werden übersprungen.
 */
function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => /^[A-ZÄÖÜ]/.test(w));
  if (words.length === 0) return name.slice(0, 1).toUpperCase();
  if (words.length === 1) return words[0]!.slice(0, 1).toUpperCase();
  return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}

/**
 * „Wer dahintersteht" — Karten mit Platzhalterfläche (noch keine Fotos),
 * Name, Rolle und Kurzprofil.
 */
export default function AboutTeam({
  title,
  members,
}: {
  title: string;
  members: { name: string; role: string; body: string }[];
}) {
  return (
    <section className="section" aria-labelledby="team-title">
      <div className="shell">
        <SectionHead title={<span id="team-title">{title}</span>} align="center" />

        {/* Bei wenigen Personen bleibt das Raster mittig und nicht übermäßig breit. */}
        <div className="mx-auto" style={{ maxWidth: members.length <= 2 ? 700 : undefined }}>
        <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2">
          {members.map((m) => (
            <motion.article key={m.name} variants={revealChild} className="card card-hover" style={{ padding: 20 }}>
              {/* Platzhalter statt Foto: ❗TODO — echte Portraits ergänzen. */}
              <div
                role="img"
                aria-label={`Platzhalter statt Portrait von ${m.name}`}
                style={{
                  aspectRatio: "4 / 5",
                  borderRadius: 20,
                  background:
                    "linear-gradient(150deg, #7ed4f5 0%, #00bcff 45%, #0092d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 500,
                    fontSize: "clamp(56px, 8vw, 96px)",
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    color: "#fff",
                    textShadow: "0 8px 30px rgba(0,26,35,.22)",
                  }}
                >
                  {initials(m.name)}
                </span>
              </div>

              <div style={{ padding: "24px 12px 8px" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 600 }}>
                  {m.name}
                </p>
                <p style={{ color: "var(--color-brand-deep)", fontSize: 15, marginTop: 4 }}>{m.role}</p>
                <p className="t-body" style={{ marginTop: 14 }}>
                  {m.body}
                </p>
              </div>
            </motion.article>
          ))}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}
