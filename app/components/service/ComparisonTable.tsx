"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import type { ServicePage } from "../../content-pages";
import { CheckIcon, Reveal, RevealGroup, revealChild } from "../ui";

const LINE = "1px solid rgba(0,26,35,.08)";

function Mark({ tone }: { tone: "a" | "b" }) {
  return (
    <span
      className="mt-[1px] flex shrink-0 items-center justify-center"
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: `1.5px solid ${tone === "b" ? "var(--color-brand)" : "rgba(0,26,35,.55)"}`,
        color: tone === "b" ? "var(--color-brand)" : "var(--color-ink)",
        background: tone === "b" ? "#fff" : "transparent",
      }}
      aria-hidden
    >
      {tone === "b" ? (
        <CheckIcon size={18} />
      ) : (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
          <path
            d="m4.5 4.5 7 7M11.5 4.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.4,
  color: "var(--color-ink)",
};

export default function ComparisonTable({ table }: { table: ServicePage["table"] }) {
  const last = table.rows.length - 1;

  return (
    <section className="section" aria-labelledby="tabelle-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <Reveal className="mx-auto text-center">
          <h2 id="tabelle-titel" className="t-h2" style={{ maxWidth: 1000, margin: "0 auto" }}>
            {table.title}
          </h2>
        </Reveal>

        {/* ---------- Desktop: echte drei Spalten ---------- */}
        <RevealGroup className="mt-16 hidden min-[900px]:block" amount={0.05}>
          <div
            className="relative"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,0.95fr) minmax(0,1.25fr) minmax(0,1.35fr)",
              columnGap: 28,
            }}
          >
            {/* Durchgehende helle Karte hinter Spalte 3.
                Sie beginnt oberhalb der ersten Zeile; ihr Schein reicht bis in die
                Kopfzeile hinauf und fasst die Spaltenüberschrift optisch mit ein. */}
            <motion.div
              variants={revealChild}
              aria-hidden
              style={{
                gridColumn: 3,
                gridRow: `2 / ${table.rows.length + 2}`,
                marginTop: -18,
                borderRadius: 24,
                background: "linear-gradient(180deg,#F7FDFF,#EDF9FF)",
                border: "1px solid var(--color-tint-1)",
                boxShadow:
                  "0 0 0 4px rgba(0,188,255,.10), 0 -26px 46px -18px rgba(0,146,212,.30), 0 30px 60px -30px rgba(0,146,212,.45)",
              }}
            />

            {/* Kopfzeile */}
            <div style={{ gridColumn: 1, gridRow: 1 }} />
            <motion.h3
              variants={revealChild}
              className="t-h3"
              style={{ gridColumn: 2, gridRow: 1, alignSelf: "end", paddingBottom: 46 }}
            >
              {table.colA}
            </motion.h3>
            <motion.h3
              variants={revealChild}
              className="t-h3"
              style={{
                gridColumn: 3,
                gridRow: 1,
                alignSelf: "end",
                paddingBottom: 46,
                paddingInline: 28,
              }}
            >
              {table.colB}
            </motion.h3>

            {/* Zeilen */}
            {table.rows.map((row, i) => (
              <Fragment key={row.label}>
                <motion.div
                  variants={revealChild}
                  className="relative"
                  style={{
                    gridColumn: 1,
                    gridRow: i + 2,
                    padding: "26px 0",
                    borderBottom: i === last ? "none" : LINE,
                  }}
                >
                  <p style={labelStyle}>{row.label}</p>
                </motion.div>

                <motion.div
                  variants={revealChild}
                  className="relative flex items-start gap-4"
                  style={{
                    gridColumn: 2,
                    gridRow: i + 2,
                    padding: "26px 0",
                    borderBottom: i === last ? "none" : LINE,
                  }}
                >
                  <Mark tone="a" />
                  <p className="t-body">{row.a}</p>
                </motion.div>

                <motion.div
                  variants={revealChild}
                  className="relative flex items-start gap-4"
                  style={{
                    gridColumn: 3,
                    gridRow: i + 2,
                    padding: "26px 28px",
                    borderBottom: i === last ? "none" : LINE,
                  }}
                >
                  <Mark tone="b" />
                  <p className="t-body" style={{ color: "var(--color-ink)" }}>
                    {row.b}
                  </p>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </RevealGroup>

        {/* ---------- Mobil: eine Karte je Zeile ---------- */}
        <RevealGroup className="mt-10 grid grid-cols-1 gap-5 min-[900px]:hidden" amount={0.05}>
          {table.rows.map((row) => (
            <motion.div
              key={row.label}
              variants={revealChild}
              className="card"
              style={{ borderRadius: 20, padding: 24 }}
            >
              <p style={labelStyle}>{row.label}</p>

              <div style={{ marginTop: 18 }}>
                <p
                  className="t-eyebrow"
                  style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}
                >
                  {table.colA}
                </p>
                <div className="flex items-start gap-3">
                  <Mark tone="a" />
                  <p className="t-body">{row.a}</p>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: LINE,
                }}
              >
                <p
                  className="t-eyebrow"
                  style={{ fontSize: 12, color: "var(--color-brand-deep)", marginBottom: 10 }}
                >
                  {table.colB}
                </p>
                <div className="flex items-start gap-3">
                  <Mark tone="b" />
                  <p className="t-body" style={{ color: "var(--color-ink)" }}>
                    {row.b}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
