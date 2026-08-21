"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CountUp, EASE, loop, useSafeReducedMotion } from "./ui";

/* -------------------------------------------------------------------------- */
/*  Gemeinsame Bühne                                                          */
/* -------------------------------------------------------------------------- */

export function MockStage({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-mockup
      className="relative overflow-hidden"
      style={{
        borderRadius: 20,
        minHeight: 340,
        background: "linear-gradient(160deg,#F4FCFF,#DEF4FF)",
        border: "1px solid rgba(0,146,212,.12)",
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kleine SVG-Glyphen                                                        */
/* -------------------------------------------------------------------------- */

const GLYPHS: Record<string, React.ReactNode> = {
  chat: (
    <path
      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h-.5A1.5 1.5 0 0 1 4 14.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 6v6c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 12v6c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8v-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="m4.5 8 7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
};

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {GLYPHS[name]}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  1 — KI-Automatisierung                                                    */
/* -------------------------------------------------------------------------- */

const FLOWS = ["Angebot erstellen", "Zahlungserinnerung", "Kundenanfrage"];

const ORBITS: {
  icon: keyof typeof GLYPHS;
  top: string;
  left: string;
  r: number;
  dur: number;
  delay: number;
}[] = [
  { icon: "chat", top: "8%", left: "6%", r: 9, dur: 7, delay: 0 },
  { icon: "database", top: "13%", left: "76%", r: 11, dur: 8.5, delay: 0.8 },
  { icon: "calendar", top: "68%", left: "82%", r: 8, dur: 6.5, delay: 1.6 },
  { icon: "mail", top: "74%", left: "8%", r: 10, dur: 9, delay: 0.4 },
  { icon: "gear", top: "40%", left: "88%", r: 7, dur: 7.5, delay: 2.2 },
];

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.35)" strokeWidth="2" fill="none" />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="m3.5 9.4 3.4 3.3L14.5 5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function KiMockup() {
  const reduce = useSafeReducedMotion();
  const [done, setDone] = useState(reduce ? FLOWS.length : 0);

  useEffect(() => {
    if (reduce) {
      setDone(FLOWS.length);
      return;
    }
    const t = window.setInterval(() => {
      setDone((d) => (d >= FLOWS.length ? 0 : d + 1));
    }, 1400);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <MockStage label="Animiertes Schema: automatisierte Arbeitsabläufe werden nacheinander abgeschlossen">
      {/* schwebende Icon-Kacheln */}
      {ORBITS.map((o) => (
        <motion.div
          key={o.icon}
          aria-hidden
          className="absolute grid place-items-center"
          style={{
            top: o.top,
            left: o.left,
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "rgba(255,255,255,.75)",
            border: "1px solid rgba(0,146,212,.18)",
            boxShadow: "0 10px 24px -16px rgba(0,146,212,.7)",
            color: "var(--color-brand)",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, o.r, 0, -o.r, 0],
                  y: [0, -o.r, -o.r * 1.4, -o.r, 0],
                  rotate: [0, 4, 0, -4, 0],
                }
          }
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
        >
          <Glyph name={o.icon} />
        </motion.div>
      ))}

      {/* Workflow-Zeilen */}
      <div
        className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-8"
        style={{ maxWidth: 360 }}
      >
        {FLOWS.map((f, i) => {
          const isDone = i < done;
          const isActive = i === done;
          return (
            <motion.div
              key={f}
              className="mb-3 flex items-center justify-between last:mb-0"
              style={{
                borderRadius: 12,
                padding: "13px 16px",
                background: isDone
                  ? "linear-gradient(180deg,#00A6E8,#0092D4)"
                  : "linear-gradient(180deg,#4FC5F3,#2FADE4)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
              }}
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: isActive
                        ? "0 0 0 3px rgba(0,188,255,.35), 0 14px 30px -18px rgba(0,146,212,.9)"
                        : "0 8px 20px -16px rgba(0,146,212,.8)",
                      scale: isActive ? 1.025 : 1,
                    }
              }
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span>{f}</span>
              <span className="grid place-items-center" style={{ width: 18, height: 18 }}>
                {isDone ? (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="block"
                  >
                    <Check />
                  </motion.span>
                ) : (
                  <motion.span
                    className="block"
                    {...loop(reduce, { rotate: 360 }, { rotate: 0 }, {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear",
                    })}
                  >
                    <Spinner />
                  </motion.span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>
    </MockStage>
  );
}

/* -------------------------------------------------------------------------- */
/*  2 — Marketing                                                             */
/* -------------------------------------------------------------------------- */

const AD_MOTIFS = [
  "linear-gradient(135deg,#0092D4,#00BCFF)",
  "linear-gradient(135deg,#00BCFF,#B6EAFF)",
  "linear-gradient(135deg,#0074AB,#4FC5F3)",
];

function FeedCard() {
  return (
    <div
      style={{
        borderRadius: 10,
        background: "#fff",
        border: "1px solid rgba(0,146,212,.12)",
        padding: 8,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          height: 52,
          borderRadius: 7,
          background: "linear-gradient(135deg,#B6EAFF,#DEF4FF)",
        }}
      />
      <div style={{ height: 6, width: "78%", borderRadius: 999, background: "#E3E9EB", marginTop: 8 }} />
      <div style={{ height: 6, width: "52%", borderRadius: 999, background: "#EDF1F2", marginTop: 5 }} />
      <div className="mt-2 flex items-center gap-2" style={{ color: "var(--color-brand)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 20s-7-4.6-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.4 12 20 12 20"
            fill="currentColor"
          />
        </svg>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4z"
            fill="currentColor"
            opacity=".65"
          />
        </svg>
      </div>
    </div>
  );
}

function MarketingMockup() {
  const reduce = useSafeReducedMotion();
  const [ad, setAd] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setAd((a) => (a + 1) % AD_MOTIFS.length), 2500);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <MockStage label="Animiertes Schema: Social-Media-Feed auf einem Handy und ein digitales Werbe-Display">
      <div className="relative flex min-h-[340px] flex-wrap items-center justify-center gap-5 px-5 py-6">
        {/* Handy */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: 118,
            height: 226,
            borderRadius: 22,
            background: "#fff",
            border: "5px solid #fff",
            boxShadow: "0 1px 2px rgba(0,26,35,.06), 0 22px 44px -26px rgba(0,26,35,.5)",
          }}
        >
          <div
            className="absolute left-1/2 top-1 z-10 -translate-x-1/2"
            style={{ width: 34, height: 5, borderRadius: 999, background: "#E3E9EB" }}
          />
          <div className="h-full overflow-hidden px-2 pt-4">
            <motion.div
              {...loop(reduce, { y: ["0%", "-50%"] }, { y: "0%" }, {
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              })}
            >
              {[0, 1].map((g) => (
                <div key={g}>
                  <FeedCard />
                  <FeedCard />
                  <FeedCard />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Werbe-Display */}
        <div className="flex shrink-0 flex-col items-center">
          <div
            className="relative overflow-hidden"
            style={{
              width: 132,
              height: 92,
              borderRadius: 10,
              background: "#0A1015",
              padding: 5,
              boxShadow: "0 20px 40px -24px rgba(0,26,35,.65)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: 6 }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={ad}
                  className="absolute inset-0"
                  style={{ background: AD_MOTIFS[ad] }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 12,
                      height: 5,
                      width: "58%",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.85)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 24,
                      height: 8,
                      width: "38%",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.95)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* Ständer */}
          <div style={{ width: 7, height: 44, background: "#C6D2D6" }} />
          <div style={{ width: 54, height: 7, borderRadius: 4, background: "#B3C1C6" }} />

          {/* KPI-Chips */}
          <div className="mt-4 flex gap-2">
            {["Reichweite", "Anfragen"].map((k, i) => (
              <motion.span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 999,
                  padding: "5px 10px",
                  background: "#fff",
                  border: "1px solid rgba(0,146,212,.18)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-brand)",
                  whiteSpace: "nowrap",
                }}
                {...loop(
                  reduce,
                  { scale: [1, 1.06, 1], opacity: [0.82, 1, 0.82] },
                  { scale: 1, opacity: 1 },
                  { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }
                )}
              >
                {k} ↑
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </MockStage>
  );
}

/* -------------------------------------------------------------------------- */
/*  3 — Webseiten                                                             */
/* -------------------------------------------------------------------------- */

function WebMockup() {
  const reduce = useSafeReducedMotion();
  const [built, setBuilt] = useState(reduce ? true : false);

  useEffect(() => {
    if (reduce) {
      setBuilt(true);
      return;
    }
    const t = window.setInterval(() => setBuilt((b) => !b), 3000);
    const first = window.setTimeout(() => setBuilt(true), 700);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(first);
    };
  }, [reduce]);

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <MockStage label="Animiertes Schema: eine Webseite baut sich im Browser auf, daneben ein Leistungswert von 98">
      <div className="relative flex min-h-[340px] flex-wrap items-center justify-center gap-5 px-5 py-6">
        {/* Browser */}
        <div
          className="shrink-0 overflow-hidden"
          style={{
            width: 218,
            borderRadius: 12,
            background: "#fff",
            border: "1px solid rgba(0,26,35,.07)",
            boxShadow: "0 1px 2px rgba(0,26,35,.05), 0 24px 46px -28px rgba(0,26,35,.5)",
          }}
        >
          {/* Titelleiste */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderBottom: "1px solid rgba(0,26,35,.06)", background: "#F7FBFC" }}
          >
            {["#FF6058", "#FFBD2E", "#28CA41"].map((c) => (
              <span
                key={c}
                style={{ width: 7, height: 7, borderRadius: 999, background: c, opacity: 0.7 }}
              />
            ))}
            <span
              className="ml-2 block flex-1"
              style={{ height: 12, borderRadius: 999, background: "#E9EFF1" }}
            />
          </div>

          {/* Seiteninhalt */}
          <div className="p-3.5" style={{ minHeight: 152 }}>
            <motion.div
              animate={{
                background: built ? "var(--color-brand)" : "#E3E9EB",
                width: built ? "72%" : "48%",
              }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ height: 13, borderRadius: 999 }}
            />
            <motion.div
              animate={{ background: built ? "#C9D2D5" : "#EDF1F2", width: built ? "92%" : "62%" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
              style={{ height: 7, borderRadius: 999, marginTop: 11 }}
            />
            <motion.div
              animate={{ background: built ? "#C9D2D5" : "#EDF1F2", width: built ? "80%" : "40%" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              style={{ height: 7, borderRadius: 999, marginTop: 7 }}
            />
            <div className="mt-3 flex gap-2">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: built
                      ? "linear-gradient(135deg,#DEF4FF,#B6EAFF)"
                      : "linear-gradient(135deg,#EDF1F2,#EDF1F2)",
                  }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.28 + i * 0.08 }}
                  style={{ height: 38, flex: 1, borderRadius: 8 }}
                />
              ))}
            </div>
            <motion.div
              animate={{
                background: built ? "linear-gradient(160deg,#0A1015,#0B3A4E)" : "#EDF1F2",
                width: built ? 92 : 62,
              }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              style={{ height: 24, borderRadius: 999, marginTop: 12 }}
            />
          </div>
        </div>

        {/* Ring-Diagramm */}
        <div className="relative shrink-0 grid place-items-center" style={{ width: 78, height: 78 }}>
          <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden className="absolute inset-0">
            <circle cx="39" cy="39" r={R} stroke="rgba(0,146,212,.18)" strokeWidth="6" fill="none" />
            <motion.circle
              cx="39"
              cy="39"
              r={R}
              stroke="var(--color-brand)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 39 39)"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              whileInView={{ strokeDashoffset: C * (1 - 0.98) }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </svg>
          <span
            className="relative"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-brand)",
            }}
          >
            <CountUp value={98} />
          </span>
        </div>
      </div>
    </MockStage>
  );
}

/* -------------------------------------------------------------------------- */

export default function PillarMockup({ id }: { id: "ki" | "marketing" | "web" }) {
  if (id === "ki") return <KiMockup />;
  if (id === "marketing") return <MarketingMockup />;
  return <WebMockup />;
}
