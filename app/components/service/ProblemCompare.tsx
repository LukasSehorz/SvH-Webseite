"use client";

import { motion } from "framer-motion";
import type { ServicePage } from "../../content-pages";
import { CheckIcon, Reveal, RevealGroup, revealChild } from "../ui";

/** ×-Kreis für die „ohne“-Spalte — Gegenstück zu `CheckIcon`. */
function CrossIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path
        d="m7 7 6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompareCard({
  variant,
  title,
  intro,
  points,
}: {
  variant: "without" | "with";
  title: string;
  intro: string;
  points: string[];
}) {
  const isWith = variant === "with";
  return (
    <motion.div
      variants={revealChild}
      style={
        isWith
          ? {
              background: "linear-gradient(180deg,#F4FCFF,#E7F7FF)",
              border: "1px solid var(--color-tint-1)",
              borderRadius: 24,
              padding: "clamp(24px,3vw,36px)",
              boxShadow:
                "0 0 0 4px rgba(0,188,255,.10), 0 30px 60px -30px rgba(0,146,212,.45)",
            }
          : {
              background: "#F5F7F8",
              border: "1px solid rgba(0,26,35,.05)",
              borderRadius: 24,
              padding: "clamp(24px,3vw,36px)",
            }
      }
    >
      <h3 className="t-h3" style={{ fontSize: "clamp(26px,2.4vw,34px)" }}>
        {title}
      </h3>
      <p className="t-body" style={{ marginTop: 14, maxWidth: 460 }}>
        {intro}
      </p>

      <ul style={{ listStyle: "none", margin: "28px 0 0", padding: 0, display: "grid", gap: 16 }}>
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <span
              className="mt-[2px] shrink-0"
              style={{ color: isWith ? "var(--color-brand)" : "var(--color-muted)" }}
            >
              {isWith ? <CheckIcon size={20} /> : <CrossIcon size={20} />}
            </span>
            <span
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: isWith ? "var(--color-ink)" : "var(--color-muted)",
              }}
            >
              {p}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function ProblemCompare({ problem }: { problem: ServicePage["problem"] }) {
  return (
    <section className="section" aria-labelledby="problem-titel">
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 id="problem-titel" className="t-h2" style={{ maxWidth: 560 }}>
              {problem.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="t-lead">{problem.body}</p>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-14 grid grid-cols-1 items-start gap-6 min-[900px]:grid-cols-2 min-[900px]:gap-8"
          amount={0.1}
        >
          <CompareCard
            variant="without"
            title={problem.without.title}
            intro={problem.without.intro}
            points={problem.without.points}
          />
          <CompareCard
            variant="with"
            title={problem.with.title}
            intro={problem.with.intro}
            points={problem.with.points}
          />
        </RevealGroup>
      </div>
    </section>
  );
}
