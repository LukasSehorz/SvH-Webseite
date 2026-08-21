"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { impact } from "../content";
import { CountUp, RevealGroup, SlabMark, revealChild } from "./ui";

/* -------------------------------------------------------------------------- */

function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: "5px 11px",
        border: "1px solid var(--color-tint-1)",
        background: "#fff",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--color-brand-deep)",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        style={{ flex: "none" }}
      >
        <path
          d="M6 10V2m0 0L2.6 5.4M6 2l3.4 3.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

type ImpactCard = {
  body: string;
  badge: string;
  label?: string;
  value?: number;
  suffix?: string;
  note?: string;
  headline?: string;
};

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: "clamp(20px, 2.25vw, 32px)",
  minHeight: 360,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 40,
};

/**
 * Zahl + Einheit dicht beieinander, gemeinsam auf der Grundlinie.
 *
 * `line-height: 0.75` laesst die Ziffern oben wie unten aus ihrer Zeilenbox
 * herausragen (oben 0.097em, unten 0.137em). Die Randwerte rechnen das heraus,
 * damit die sichtbare Tinte — nicht die Zeilenbox — den Abstand bestimmt:
 * 16px unter dem Element darueber, Grundlinie 32px ueber der Kartenkante.
 *
 * Die Zahlengroesse laeuft als Variable `--num` mit: `em` waere hier falsch,
 * weil eine eigene `font-size` auf der Zeile den Strut vergroessern und die
 * Zeilenbox damit erneut verschieben wuerde.
 */
function numRow(num: string): React.CSSProperties {
  return {
    ["--num" as string]: num,
    display: "flex",
    alignItems: "baseline",
    gap: 0,
    color: "var(--color-brand)",
    marginTop: "calc(16px + 0.097 * var(--num))",
    marginBottom: "calc(-0.137 * var(--num))",
  } as React.CSSProperties;
}

/* -------------------------------------------------------------------------- */

export default function ImpactSection() {
  const [c1, c2, c3] = impact.cards as ImpactCard[];
  /*
   * Referenzmasse: bei 1440px "65" 175px, "%" 114px, "25h" 108px — bei 390px
   * bleiben die Zahlen mit 155/101/85px fast genauso gross. Die Untergrenzen
   * sind so gewaehlt, dass Zahl + Einheit + Zusatz noch in die Karte passen.
   */
  const numBig = "clamp(155px, 12.15vw, 175px)";
  const unitBig = "clamp(101px, 7.9vw, 114px)";
  const numSmall = "clamp(85px, 7.5vw, 108px)";

  return (
    <section className="section pt-0" aria-labelledby="impact-title">
      <div className="shell">
        <div className="slab" style={{ padding: "clamp(28px, 4vw, 56px)" }}>
          {/* blasse Wortmarke + Chevron-Geometrie im Hintergrund */}
          <SlabMark />

          <div className="relative">
            <h2 id="impact-title" className="t-slab" style={{ color: "#fff" }}>
              <span className="block">{impact.titleLine1}</span>
              <span className="block">{impact.titleLine2}</span>
            </h2>

            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(20px, 2.8vw, 40px)",
                lineHeight: 1.25,
                color: "rgba(255,255,255,.9)",
              }}
            >
              {impact.subtitle}
            </p>

            <RevealGroup
              className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              amount={0.15}
            >
              {/* ---- Karte 1 ---- */}
              <motion.article variants={revealChild} className="card" style={cardStyle}>
                <p className="t-body">{c1.body}</p>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 600, color: "var(--color-brand-deep)" }}>
                    {c1.label}
                  </p>
                  <div style={numRow(numBig)}>
                    {/* Pill sitzt rechts NEBEN der Zahl, auf Höhe der Zahlen-Oberkante */}
                    <span style={{ position: "relative", display: "inline-block" }}>
                      <span className="t-num" data-impact-num style={{ fontSize: numBig }}>
                        <CountUp value={c1.value ?? 0} />
                      </span>
                      <span
                        style={{
                          position: "absolute",
                          left: "100%",
                          top: "calc(-0.074 * var(--num))",
                          marginLeft: 0,
                        }}
                      >
                        <Badge>{c1.badge}</Badge>
                      </span>
                    </span>
                    <span
                      className="t-num"
                      style={{ fontSize: unitBig, marginLeft: "-0.02em" }}
                    >
                      {c1.suffix}
                    </span>
                  </div>
                </div>
              </motion.article>

              {/* ---- Karte 2 ---- */}
              <motion.article variants={revealChild} className="card" style={cardStyle}>
                <p className="t-body">{c2.body}</p>
                <div>
                  {/* Pill über der Zahl */}
                  <Badge>{c2.badge}</Badge>
                  <div style={numRow(numSmall)}>
                    <span className="t-num" style={{ fontSize: numSmall }}>
                      <CountUp value={c2.value ?? 0} />
                    </span>
                    <span
                      className="t-num"
                      style={{ fontSize: numSmall, marginLeft: "-0.02em" }}
                    >
                      {c2.suffix}
                    </span>
                    <span
                      style={{
                        marginLeft: 18,
                        fontSize: 18,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color: "var(--color-brand-deep)",
                      }}
                    >
                      {c2.note}
                    </span>
                  </div>
                </div>
              </motion.article>

              {/* ---- Karte 3 ---- */}
              <motion.article
                variants={revealChild}
                className="card md:col-span-2 lg:col-span-1"
                style={cardStyle}
              >
                <p className="t-body">{c3.body}</p>
                <div>
                  <Badge>{c3.badge}</Badge>
                  <h3
                    style={{
                      marginTop: 38,
                      fontFamily: "var(--font-serif)",
                      fontWeight: 500,
                      fontSize: "clamp(32px, 3.55vw, 51px)",
                      lineHeight: 0.92,
                      letterSpacing: "-0.01em",
                      color: "var(--color-brand)",
                    }}
                  >
                    {c3.headline}
                  </h3>
                  <p
                    className="mt-3"
                    style={{ fontSize: 16, fontWeight: 700, color: "var(--color-brand-deep)" }}
                  >
                    {c3.note}
                  </p>
                </div>
              </motion.article>
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
