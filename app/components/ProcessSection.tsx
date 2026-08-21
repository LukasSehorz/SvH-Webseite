"use client";

import { motion } from "framer-motion";
import { process } from "../content";
import {
  EASE,
  Reveal,
  RevealGroup,
  SlabMark,
  loop,
  revealChild,
  useSafeReducedMotion,
} from "./ui";

/* -------------------------------------------------------------------------- */
/*  Mockup 1 — Radar-Scan                                                     */
/* -------------------------------------------------------------------------- */

function RadarMockup() {
  const reduce = useSafeReducedMotion();
  const blips = [
    { cx: 74, cy: 40, delay: 0 },
    { cx: 38, cy: 66, delay: 0.8 },
    { cx: 92, cy: 78, delay: 1.6 },
    { cx: 58, cy: 92, delay: 2.4 },
  ];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 148,
        borderRadius: 14,
        background: "linear-gradient(180deg,#F2FBFF 0%,#DEF4FF 100%)",
        border: "1px solid rgba(0,146,212,.12)",
      }}
    >
      <svg viewBox="0 0 130 148" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform="translate(65 74)">
          {[24, 42, 60].map((r) => (
            <circle
              key={r}
              r={r}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1"
              opacity="0.22"
            />
          ))}
          <line x1="-60" y1="0" x2="60" y2="0" stroke="var(--color-brand)" strokeWidth="1" opacity="0.14" />
          <line x1="0" y1="-60" x2="0" y2="60" stroke="var(--color-brand)" strokeWidth="1" opacity="0.14" />

          {/* rotierender Strahl */}
          <motion.g
            {...loop(reduce, { rotate: 360 }, { rotate: 0 }, {
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            })}
            style={{ originX: 0, originY: 0 }}
          >
            <defs>
              <linearGradient id="svh-radar-beam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00BCFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#00BCFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 0 L60 -18 A62 62 0 0 1 60 18 Z" fill="url(#svh-radar-beam)" />
            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--color-brand-bright)" strokeWidth="1.6" />
          </motion.g>

          <circle r="3.5" fill="var(--color-brand)" />
        </g>

        {blips.map((b) => (
          <motion.circle
            key={`${b.cx}-${b.cy}`}
            cx={b.cx}
            cy={b.cy}
            r="3.4"
            fill="var(--color-brand-bright)"
            initial={{ opacity: reduce ? 0.9 : 0 }}
            {...loop(reduce, { opacity: [0, 1, 0.15, 0] }, { opacity: 0.9 }, {
              duration: 4.5,
              repeat: Infinity,
              delay: b.delay,
              ease: "easeOut",
            })}
          />
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mockup 2 — sich verbindende Knoten                                        */
/* -------------------------------------------------------------------------- */

const NODES = [
  { x: 24, y: 40 },
  { x: 66, y: 22 },
  { x: 108, y: 52 },
  { x: 46, y: 96 },
  { x: 96, y: 110 },
];
const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [4, 2],
];

function NodesMockup() {
  const reduce = useSafeReducedMotion();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 148,
        borderRadius: 14,
        background: "linear-gradient(180deg,#F2FBFF 0%,#DEF4FF 100%)",
        border: "1px solid rgba(0,146,212,.12)",
      }}
    >
      <svg viewBox="0 0 132 148" className="absolute inset-0 h-full w-full" aria-hidden>
        {EDGES.map(([a, b], i) => (
          <motion.line
            key={`${a}-${b}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="var(--color-brand)"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.5 : 0 }}
            {...loop(
              reduce,
              { pathLength: [0, 1, 1, 0], opacity: [0, 0.75, 0.75, 0] },
              { pathLength: 1, opacity: 0.5 },
              {
                duration: 5,
                times: [0, 0.28, 0.85, 1],
                repeat: Infinity,
                delay: i * 0.45,
                ease: EASE,
              }
            )}
          />
        ))}

        {NODES.map((n, i) => (
          <motion.g
            key={`${n.x}-${n.y}`}
            initial={{ opacity: reduce ? 1 : 0.35 }}
            {...loop(reduce, { opacity: [0.35, 1, 1, 0.35] }, { opacity: 1 }, {
              duration: 5,
              times: [0, 0.25, 0.85, 1],
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            })}
          >
            <circle cx={n.x} cy={n.y} r="9" fill="#fff" opacity="0.85" />
            <circle cx={n.x} cy={n.y} r="6.5" fill="var(--color-brand-bright)" />
            <circle cx={n.x} cy={n.y} r="6.5" fill="none" stroke="var(--color-brand)" strokeWidth="1" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mockup 3 — Mini-Dashboard                                                 */
/* -------------------------------------------------------------------------- */

const BARS = [34, 52, 44, 70, 86, 100];

function DashboardMockup() {
  const reduce = useSafeReducedMotion();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 148,
        borderRadius: 14,
        background: "#fff",
        border: "1px solid rgba(0,146,212,.16)",
        boxShadow: "0 8px 24px -18px rgba(0,26,35,.4)",
      }}
    >
      {/* Titelleiste */}
      <div
        className="flex items-center gap-1.5 px-3"
        style={{ height: 26, background: "#F2FBFF", borderBottom: "1px solid rgba(0,146,212,.12)" }}
      >
        <span className="block h-2 w-2 rounded-full" style={{ background: "#FF6058" }} />
        <span className="block h-2 w-2 rounded-full" style={{ background: "#FFBD2E" }} />
        <span className="block h-2 w-2 rounded-full" style={{ background: "#28C840" }} />
        <motion.span
          className="ml-auto rounded-full px-2 py-[2px] text-[9px] font-semibold tracking-[0.08em]"
          style={{ background: "rgba(0,188,255,.14)", color: "var(--color-brand-deep)" }}
          {...loop(reduce, { opacity: [1, 0.45, 1] }, { opacity: 1 }, {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          })}
        >
          LIVE
        </motion.span>
      </div>

      {/* Balken */}
      <div className="flex h-[122px] items-end gap-2 px-3 pb-4 pt-3">
        {BARS.map((h, i) => (
          <motion.span
            key={h}
            className="block flex-1 rounded-t-[3px]"
            style={{
              background: `linear-gradient(180deg,#00BCFF 0%,#0092D4 100%)`,
              transformOrigin: "bottom",
            }}
            initial={{ height: `${h}%`, scaleY: reduce ? 1 : 0.15 }}
            whileInView={reduce ? undefined : { scaleY: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: EASE }}
          />
        ))}
      </div>
    </div>
  );
}

const MOCKUPS = [RadarMockup, NodesMockup, DashboardMockup];

/* -------------------------------------------------------------------------- */

export default function ProcessSection() {
  const reduce = useSafeReducedMotion();

  return (
    <section id="ablauf" className="section">
      <div className="shell">
        <Reveal>
          <div className="slab" style={{ padding: "clamp(28px,4vw,56px)" }}>
            {/* blasse Wortmarke + Chevron-Geometrie im Hintergrund */}
            <SlabMark />

            <div className="relative">
              <h2 className="t-slab" style={{ maxWidth: 940 }}>
                {process.title}
              </h2>
              <p
                className="mt-4"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(20px,2.2vw,32px)",
                  lineHeight: 1.3,
                  color: "rgba(255,255,255,.9)",
                  maxWidth: 900,
                }}
              >
                {process.subtitle}
              </p>

              <RevealGroup
                className="mt-10 grid grid-cols-1 gap-6 min-[900px]:grid-cols-3"
                amount={0.15}
              >
                {process.steps.map((step, i) => {
                  const Mockup = MOCKUPS[i] ?? RadarMockup;
                  return (
                    <motion.article
                      key={step.title}
                      variants={revealChild}
                      className="card card-hover flex flex-col"
                      style={{ borderRadius: 20, padding: 28 }}
                    >
                      <motion.span
                        className="flex items-center justify-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: "var(--color-brand-bright)",
                          color: "#fff",
                          fontFamily: "var(--font-serif)",
                          fontSize: 20,
                          fontWeight: 600,
                        }}
                        initial={{ scale: reduce ? 1 : 0.4, opacity: reduce ? 1 : 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={
                          reduce
                            ? { duration: 0.2 }
                            : { type: "spring", stiffness: 300, damping: 18, delay: 0.15 + i * 0.1 }
                        }
                      >
                        {step.n}
                      </motion.span>

                      <h3 className="t-h3 mt-5" style={{ fontSize: 24 }}>
                        {step.title}
                      </h3>
                      <p className="t-body mt-3">{step.body}</p>

                      <div className="mt-6">
                        <Mockup />
                      </div>
                    </motion.article>
                  );
                })}
              </RevealGroup>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
