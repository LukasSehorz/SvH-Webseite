"use client";

import { motion } from "framer-motion";
import { stats } from "../content";
import { ArrowUpRight, CountUp, Reveal, RevealGroup, SlabMark, revealChild } from "./ui";

/** Erkennt rein numerische Werte (auch mit deutschem Tausenderpunkt). */
function asNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{1,3}(\.\d{3})+$|^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed.replace(/\./g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function StatsBanner() {
  return (
    <section className="section" aria-label="Kennzahlen">
      <div className="shell">
        <Reveal>
          <div
            className="slab"
            style={{
              background: "linear-gradient(160deg,#2AB4EE 0%,#0092D4 50%,#0C63A8 100%)",
              padding: "clamp(28px,4vw,56px)",
            }}
          >
            {/* blasse Wortmarke + Chevron-Geometrie im Hintergrund */}
            <SlabMark />

            <div className="relative">
              <RevealGroup
                className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
                amount={0.2}
              >
                {stats.items.map((item) => {
                  const n = asNumber(item.value);
                  return (
                    <motion.div key={item.label} variants={revealChild}>
                      <p
                        className="t-num"
                        style={{ fontSize: "clamp(40px,4.4vw,64px)", color: "#fff" }}
                      >
                        {n === null ? item.value : <CountUp value={n} />}
                      </p>
                      <p
                        className="mt-4"
                        style={{ fontSize: 16, color: "rgba(255,255,255,.9)", lineHeight: 1.35 }}
                      >
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </RevealGroup>

              <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(20px,1.9vw,24px)",
                    lineHeight: 1.35,
                    color: "#fff",
                    maxWidth: 560,
                  }}
                >
                  {stats.line}
                </p>
                <a href={stats.cta.href} className="btn btn-dark self-start lg:self-auto">
                  {stats.cta.label}
                  <ArrowUpRight />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
