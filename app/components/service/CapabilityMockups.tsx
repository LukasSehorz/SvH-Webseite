"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { EASE, loop, useSafeReducedMotion } from "../ui";

/* -------------------------------------------------------------------------- */
/*  Werkzeuge                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Zählt im Takt `ms` von 0 bis `count-1` und wieder von vorn.
 * `phase` (Sekunden) verzögert den Start, damit benachbarte Mockups nicht
 * im Gleichtakt laufen.
 */
function useStep(count: number, ms: number, reduce: boolean, phase = 0): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) {
      setI(count - 1);
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => setI((v) => (v + 1) % count), ms);
    }, Math.max(0, phase * 1000));
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [count, ms, reduce, phase]);
  return i;
}

/** Zählt weich auf `target` hoch, sobald `run` wahr wird. */
function useCounter(target: number, run: boolean, reduce: boolean, ms = 1100): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduce) {
      setV(target);
      return;
    }
    if (!run) return; // Wert stehen lassen, statt sichtbar auf 0 zu springen
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduce, ms]);
  return v;
}

/** Gemeinsame Requisiten aller Mockups. `phase` ist der Startversatz in Sekunden. */
type MockProps = { reduce: boolean; phase: number };

const INK = "#001A23";
const MUTED = "#4B585D";
const BRAND = "#0092D4";
const BRIGHT = "#00BCFF";
const TINT1 = "#B6EAFF";
const TINT2 = "#DEF4FF";

const panel: CSSProperties = {
  background: "#fff",
  overflow: "hidden",
  minHeight: 0,
  borderRadius: 14,
  border: "1px solid rgba(0,146,212,.14)",
  boxShadow: "0 12px 28px -22px rgba(0,26,35,.5)",
};

/** Grauer Platzhalterstrich für „Text“. */
function Bar({
  w,
  h = 6,
  tone = "grey",
  style,
}: {
  w: number | string;
  h?: number;
  tone?: "grey" | "brand" | "light";
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "block",
        width: w,
        height: h,
        borderRadius: 999,
        background:
          tone === "brand" ? BRAND : tone === "light" ? "rgba(0,26,35,.07)" : "rgba(0,26,35,.14)",
        ...style,
      }}
    />
  );
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ padding: 16 }}>
      {children}
    </div>
  );
}

function Check({ size = 12, color = BRAND }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="m2.5 6.2 2.3 2.3 4.7-5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  1 — chat                                                                  */
/* -------------------------------------------------------------------------- */

function ChatMock({ reduce, phase }: MockProps) {
  const s = useStep(4, 1500, reduce, phase);

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#3ECF8E" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>KI-Assistent</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end gap-3">
          <motion.div
            animate={{ opacity: s >= 1 ? 1 : 0, y: s >= 1 ? 0 : 8 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            style={{
              alignSelf: "flex-start",
              maxWidth: "78%",
              background: "rgba(0,26,35,.06)",
              borderRadius: "12px 12px 12px 4px",
              padding: "9px 12px",
              fontSize: 11.5,
              lineHeight: 1.35,
              color: INK,
            }}
          >
            Haben Sie am Freitag noch einen Termin frei?
          </motion.div>

          <div style={{ position: "relative", minHeight: 42 }}>
            <AnimatePresence initial={false}>
              {s === 2 && !reduce && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    gap: 4,
                    background: TINT2,
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      style={{ width: 5, height: 5, borderRadius: 999, background: BRAND }}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.16 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              animate={{ opacity: s >= 3 ? 1 : 0, y: s >= 3 ? 0 : 8 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
              style={{
                marginLeft: "auto",
                maxWidth: "82%",
                background: `linear-gradient(160deg, ${BRIGHT}, ${BRAND})`,
                borderRadius: "12px 12px 4px 12px",
                padding: "9px 12px",
                fontSize: 11.5,
                lineHeight: 1.35,
                color: "#fff",
              }}
            >
              Ja — Freitag 14:30 Uhr. Ich habe den Termin eingetragen.
            </motion.div>
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          style={{
            background: "rgba(0,26,35,.04)",
            borderRadius: 999,
            padding: "7px 12px",
          }}
        >
          <Bar w={90} h={5} tone="light" />
          <span style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: 999, background: BRAND }} />
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  2 — workflow                                                              */
/* -------------------------------------------------------------------------- */

function WorkflowMock({ reduce, phase }: MockProps) {
  const s = useStep(4, 1200, reduce, phase);
  const rows = ["Angebot erstellt", "Rechnung versendet", "Erinnerung geplant"];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 16, display: "grid", gap: 10, alignContent: "center" }}>
        {rows.map((label, i) => {
          const done = s > i;
          const active = s === i;
          return (
            <div
              key={label}
              className="flex items-center gap-3"
              style={{
                background: done ? "rgba(0,146,212,.07)" : "rgba(0,26,35,.035)",
                borderRadius: 10,
                padding: "11px 12px",
                transition: "background .3s",
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  border: `1.5px solid ${done ? BRAND : "rgba(0,26,35,.2)"}`,
                  background: done ? "#fff" : "transparent",
                }}
              >
                {done ? (
                  <Check />
                ) : active && !reduce ? (
                  <motion.span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      border: `2px solid ${TINT1}`,
                      borderTopColor: BRAND,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                ) : null}
              </span>
              <span style={{ fontSize: 12, color: done ? INK : MUTED }}>{label}</span>
              {done && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: BRAND }}>
                  fertig
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  3 — crm                                                                   */
/* -------------------------------------------------------------------------- */

function CrmMock({ reduce, phase }: MockProps) {
  const s = useStep(3, 1800, reduce, phase);
  const rows = [
    { name: "Meier GmbH", dupe: false },
    { name: "Bauer & Sohn", dupe: true },
    { name: "Bauer und Sohn", dupe: true },
    { name: "Zech Elektro", dupe: false },
  ];
  const clean = s !== 0;

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14, overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>Kontakte</span>
          <motion.span
            animate={{ opacity: clean ? 1 : 0.35 }}
            style={{ fontSize: 10, fontWeight: 600, color: clean ? BRAND : MUTED }}
          >
            {clean ? "bereinigt" : "1 Dublette"}
          </motion.span>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          {rows.map((r, i) => {
            const hide = clean && i === 2;
            return (
              <motion.div
                key={r.name}
                layout={!reduce}
                animate={{
                  opacity: hide ? 0 : 1,
                  height: hide ? 0 : 30,
                  marginBottom: hide ? -6 : 0,
                }}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                className="flex items-center gap-3 overflow-hidden"
                style={{
                  borderRadius: 9,
                  background:
                    r.dupe && !clean ? "rgba(255,140,120,.10)" : "rgba(0,26,35,.035)",
                  padding: "0 10px",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: `linear-gradient(160deg, ${TINT1}, ${BRAND})`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11.5, color: INK, whiteSpace: "nowrap" }}>{r.name}</span>
                <span style={{ marginLeft: "auto" }}>
                  <Bar w={clean ? 44 : 26} h={5} tone={clean ? "brand" : "light"} />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  4 — knowledge                                                             */
/* -------------------------------------------------------------------------- */

function KnowledgeMock({ reduce, phase }: MockProps) {
  const s = useStep(5, 800, reduce, phase);
  const visible = [1, 2, 3, 3, 3][s];
  const hits = ["Ablauf Reklamation", "Vorlage Angebot", "Preisliste 2026"];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14 }}>
        <div
          className="flex items-center gap-2"
          style={{ background: "rgba(0,26,35,.04)", borderRadius: 999, padding: "8px 12px" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="4.2" stroke={MUTED} strokeWidth="1.4" />
            <path d="m9.3 9.3 3 3" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 11.5, color: INK }}>Reklamation</span>
          {!reduce && (
            <motion.span
              style={{ width: 1.5, height: 12, background: BRAND }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        <div style={{ display: "grid", gap: 7, marginTop: 12 }}>
          {hits.map((h, i) => (
            <motion.div
              key={h}
              animate={{
                opacity: visible > i ? 1 : 0,
                x: visible > i ? 0 : -10,
              }}
              transition={{ duration: reduce ? 0 : 0.38, ease: EASE }}
              className="flex items-center gap-2"
              style={{
                background: "rgba(0,146,212,.07)",
                borderRadius: 9,
                padding: "9px 10px",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: "#fff",
                  border: `1px solid ${TINT1}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11.5, color: INK }}>{h}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: BRAND, fontWeight: 600 }}>
                {90 - i * 12} %
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  5 — report                                                                */
/* -------------------------------------------------------------------------- */

function ReportMock({ reduce, phase }: MockProps) {
  const s = useStep(8, 800, reduce, phase);
  const grown = s !== 0;
  const value = useCounter(128, grown, reduce, 900);
  const heights = [30, 52, 40, 68, 86];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14, display: "flex", flexDirection: "column" }}>
        <div className="flex items-end justify-between">
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: MUTED }}>Anfragen im Monat</p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                lineHeight: 1.1,
                color: INK,
                marginTop: 2,
              }}
            >
              {value}
            </p>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: BRAND,
              background: TINT2,
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            +24 %
          </span>
        </div>

        <div className="mt-auto flex items-end gap-3" style={{ height: 84 }}>
          {heights.map((h, i) => (
            <motion.span
              key={i}
              style={{
                flex: 1,
                borderRadius: "6px 6px 3px 3px",
                background:
                  i === heights.length - 1
                    ? `linear-gradient(180deg, ${BRIGHT}, ${BRAND})`
                    : "rgba(0,146,212,.22)",
                transformOrigin: "bottom",
              }}
              animate={{ height: grown ? h : 8 }}
              transition={{ duration: reduce ? 0 : 0.75, ease: EASE, delay: reduce ? 0 : i * 0.07 }}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  6 — handover                                                              */
/* -------------------------------------------------------------------------- */

function HandoverMock({ reduce, phase }: MockProps) {
  const node = (label: string) => (
    <div className="flex flex-col items-center gap-2" style={{ width: 76 }}>
      <span
        className="flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: "#fff",
          border: `1.5px solid ${TINT1}`,
          boxShadow: "0 10px 22px -16px rgba(0,26,35,.6)",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 5,
            background: `linear-gradient(160deg, ${BRIGHT}, ${BRAND})`,
          }}
        />
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED }}>{label}</span>
    </div>
  );

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 16, display: "flex", alignItems: "center" }}>
        <div className="relative flex w-full items-center justify-between">
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              top: 21,
              height: 2,
              borderRadius: 999,
              background: `repeating-linear-gradient(90deg, ${TINT1} 0 6px, transparent 6px 12px)`,
            }}
          />
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              width: 24,
              height: 24,
              borderRadius: 7,
              background: "#fff",
              border: `1.5px solid ${BRAND}`,
              boxShadow: `0 0 0 4px rgba(0,188,255,.14)`,
            }}
            {...loop(
              reduce,
              { left: ["18%", "70%"], opacity: [0, 1, 1, 0] },
              { left: "70%", opacity: 1 },
              { delay: phase, duration: 3.2, repeat: Infinity, ease: EASE, times: [0, 0.15, 0.85, 1] }
            )}
          />
          {node("Vertrieb")}
          {node("Projekt")}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  7 — feed                                                                  */
/* -------------------------------------------------------------------------- */

function FeedMock({ reduce, phase }: MockProps) {
  const cards = [0, 1, 2, 3];
  const item = (i: number) => (
    <div
      key={i}
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid rgba(0,146,212,.14)",
        padding: 8,
        display: "grid",
        gap: 6,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: `linear-gradient(160deg, ${TINT1}, ${BRAND})`,
          }}
        />
        <Bar w={44} h={4} tone="light" />
      </div>
      <span
        style={{
          display: "block",
          height: 34,
          borderRadius: 6,
          background: `linear-gradient(140deg, ${TINT2}, ${TINT1})`,
        }}
      />
      <Bar w={i % 2 ? 52 : 68} h={4} tone="light" />
    </div>
  );

  return (
    <Stage>
      <div className="flex h-full items-center justify-center">
        <div
          className="relative overflow-hidden"
          style={{
            width: 122,
            height: 180,
            borderRadius: 18,
            background: "#fff",
            border: `2px solid ${INK}`,
            padding: 8,
            boxShadow: "0 18px 34px -24px rgba(0,26,35,.7)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 34,
              height: 4,
              borderRadius: 999,
              background: "rgba(0,26,35,.25)",
            }}
          />
          <motion.div
            style={{ display: "grid", gap: 8, marginTop: 8 }}
            {...loop(reduce, { y: ["0%", "-50%"] }, { y: "0%" }, {
              duration: 7,
              repeat: Infinity,
              delay: phase,
              ease: "linear",
            })}
          >
            {cards.map(item)}
            {cards.map((i) => item(i + 10))}
          </motion.div>
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  8 — camera                                                                */
/* -------------------------------------------------------------------------- */

function CameraMock({ reduce, phase }: MockProps) {
  const s = useStep(4, 1500, reduce, phase);
  const shots = 3;

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          className="relative flex-1 overflow-hidden"
          style={{
            borderRadius: 10,
            background: `linear-gradient(150deg, #0B3A4E 0%, ${BRAND} 60%, ${TINT1} 100%)`,
          }}
        >
          {/* Ecken des Suchers */}
          {(
            [
              { top: 8, left: 8, borderTop: true, borderLeft: true },
              { top: 8, right: 8, borderTop: true, borderRight: true },
              { bottom: 8, left: 8, borderBottom: true, borderLeft: true },
              { bottom: 8, right: 8, borderBottom: true, borderRight: true },
            ] as const
          ).map((c, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                borderRadius: 3,
                top: "top" in c ? c.top : undefined,
                bottom: "bottom" in c ? c.bottom : undefined,
                left: "left" in c ? c.left : undefined,
                right: "right" in c ? c.right : undefined,
                borderTop: "borderTop" in c ? "2px solid #fff" : undefined,
                borderBottom: "borderBottom" in c ? "2px solid #fff" : undefined,
                borderLeft: "borderLeft" in c ? "2px solid #fff" : undefined,
                borderRight: "borderRight" in c ? "2px solid #fff" : undefined,
              }}
            />
          ))}

          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: "26% 32%",
              border: `1.5px solid #fff`,
              borderRadius: 6,
            }}
            {...loop(reduce, { scale: [1, 0.86, 1], opacity: [0.7, 1, 0.7] }, { scale: 1, opacity: 1 }, {
              duration: 3,
              repeat: Infinity,
              delay: phase,
              ease: "easeInOut",
            })}
          />

          {/* Auslöser-Blitz */}
          <AnimatePresence>
            {s === 3 && !reduce && (
              <motion.span
                key="flash"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: "absolute", inset: 0, background: "#fff" }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: shots }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ opacity: s > i ? 1 : 0.15, scale: s > i ? 1 : 0.85 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              style={{
                width: 30,
                height: 24,
                borderRadius: 5,
                background: `linear-gradient(150deg, ${TINT1}, ${BRAND})`,
              }}
            />
          ))}
          <span
            className="ml-auto flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              border: `2px solid ${INK}`,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 999, background: INK }} />
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  9 — ads                                                                   */
/* -------------------------------------------------------------------------- */

function AdsMock({ reduce, phase }: MockProps) {
  const s = useStep(3, 2000, reduce, phase);
  const variants = ["Motiv A", "Motiv B", "Motiv C"];
  const scores = [42, 88, 61];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14, display: "grid", gap: 8, alignContent: "center" }}>
        {variants.map((v, i) => {
          const win = s === i;
          return (
            <motion.div
              key={v}
              animate={{
                borderColor: win ? BRAND : "rgba(0,26,35,.08)",
                backgroundColor: win ? "rgba(0,146,212,.07)" : "rgba(0,26,35,.025)",
              }}
              transition={{ duration: reduce ? 0 : 0.4 }}
              style={{
                border: "1px solid rgba(0,26,35,.08)",
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  background: `linear-gradient(150deg, ${TINT1}, ${BRAND})`,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11.5, color: INK, width: 52, flexShrink: 0 }}>{v}</span>
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(0,26,35,.08)",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  style={{ display: "block", height: "100%", borderRadius: 999, background: BRAND }}
                  animate={{ width: `${win ? scores[i] : 18}%` }}
                  transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
                />
              </span>
              <motion.span
                animate={{ opacity: win ? 1 : 0 }}
                style={{ fontSize: 10, fontWeight: 700, color: BRAND, width: 26, textAlign: "right" }}
              >
                Top
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  10 — display                                                              */
/* -------------------------------------------------------------------------- */

function DisplayMock({ reduce, phase }: MockProps) {
  const s = useStep(3, 2500, reduce, phase);
  const motifs = [
    { text: "Aktion diese Woche", bg: `linear-gradient(150deg, ${BRIGHT}, ${BRAND})` },
    { text: "Wir stellen ein", bg: `linear-gradient(150deg, ${INK}, #0B3A4E)` },
    { text: "Heute bis 20 Uhr", bg: `linear-gradient(150deg, ${TINT1}, ${BRAND})` },
  ];

  return (
    <Stage>
      <div className="flex h-full flex-col items-center justify-center">
        <div
          className="relative overflow-hidden"
          style={{
            width: 178,
            height: 108,
            borderRadius: 10,
            border: `3px solid ${INK}`,
            background: "#fff",
          }}
        >
          {/* Fläche blendet weich über — deckende Verläufe dürfen sich überlagern. */}
          <AnimatePresence initial={false}>
            <motion.span
              key={s}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
              className="absolute inset-0"
              style={{ background: motifs[s].bg }}
            />
          </AnimatePresence>

          {/* Beschriftung wartet: erst geht die alte ganz weg, dann kommt die neue. */}
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={s}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                color: "#fff",
                textAlign: "center",
                padding: "0 12px",
                lineHeight: 1.15,
              }}
            >
              {motifs[s].text}
            </motion.span>
          </AnimatePresence>
        </div>
        <span style={{ width: 10, height: 34, background: INK }} />
        <span style={{ width: 76, height: 8, borderRadius: 4, background: INK }} />
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  11 — local                                                                */
/* -------------------------------------------------------------------------- */

function LocalMock({ reduce, phase }: MockProps) {
  const s = useStep(7, 500, reduce, phase);

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 0, overflow: "hidden", position: "relative" }}>
        {/* Kartenausschnitt */}
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <rect width="320" height="180" fill="#F2FAFE" />
          <g stroke={TINT1} strokeWidth="8" strokeLinecap="round">
            <path d="M-10 60 H330" />
            <path d="M-10 130 H330" />
            <path d="M90 -10 V190" />
            <path d="M225 -10 V190" />
          </g>
          <g fill="rgba(0,146,212,.10)">
            <rect x="18" y="12" width="52" height="34" rx="4" />
            <rect x="110" y="14" width="90" height="32" rx="4" />
            <rect x="245" y="76" width="58" height="40" rx="4" />
            <rect x="20" y="146" width="56" height="28" rx="4" />
          </g>
        </svg>

        {/* Pin */}
        <div className="absolute" style={{ left: "50%", top: "44%", transform: "translate(-50%,-50%)" }}>
          <motion.span
            aria-hidden
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: 46,
              height: 46,
              marginLeft: -23,
              marginTop: -23,
              borderRadius: 999,
              background: "rgba(0,146,212,.22)",
            }}
            {...loop(reduce, { scale: [0.5, 1.5], opacity: [0.6, 0] }, { scale: 1, opacity: 0.25 }, {
              duration: 2.2,
              repeat: Infinity,
              delay: phase,
              ease: "easeOut",
            })}
          />
          <svg width="26" height="32" viewBox="0 0 26 32" fill="none" aria-hidden className="relative">
            <path
              d="M13 31C13 31 24 20.5 24 13A11 11 0 1 0 2 13c0 7.5 11 18 11 18Z"
              fill={BRAND}
              stroke="#fff"
              strokeWidth="2"
            />
            <circle cx="13" cy="13" r="4" fill="#fff" />
          </svg>
        </div>

        {/* Bewertung */}
        <div
          className="absolute flex items-center gap-1"
          style={{
            left: 12,
            bottom: 12,
            background: "#fff",
            borderRadius: 999,
            padding: "6px 10px",
            boxShadow: "0 10px 22px -16px rgba(0,26,35,.7)",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.svg
              key={i}
              width="11"
              height="11"
              viewBox="0 0 12 12"
              animate={{ opacity: s > i ? 1 : 0.2 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              aria-hidden
            >
              <path
                d="M6 .8 7.5 4.2l3.7.4-2.8 2.5.8 3.6L6 8.9 2.8 10.7l.8-3.6L.8 4.6l3.7-.4z"
                fill="#F5B301"
              />
            </motion.svg>
          ))}
          <span style={{ fontSize: 10.5, fontWeight: 600, color: INK, marginLeft: 4 }}>4,9</span>
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  12 — design                                                               */
/* -------------------------------------------------------------------------- */

function DesignMock({ reduce, phase }: MockProps) {
  const s = useStep(3, 2400, reduce, phase);
  const layouts: { grow: number; h: number }[][] = [
    [
      { grow: 2, h: 112 },
      { grow: 1, h: 112 },
      { grow: 1, h: 54 },
    ],
    [
      { grow: 1, h: 70 },
      { grow: 2, h: 112 },
      { grow: 1, h: 112 },
    ],
    [
      { grow: 1, h: 112 },
      { grow: 1, h: 80 },
      { grow: 2, h: 112 },
    ],
  ];
  const swatches = [
    [BRAND, TINT1, INK],
    [BRIGHT, "#0B3A4E", TINT2],
    [TINT1, BRAND, "#0074AB"],
  ];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="flex items-center gap-2">
          <Bar w={54} h={7} tone="grey" />
          <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {swatches[s].map((c, i) => (
              <motion.span
                key={i}
                animate={{ backgroundColor: c }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                style={{ width: 13, height: 13, borderRadius: 999 }}
              />
            ))}
          </span>
        </div>

        <div className="flex flex-1 items-end gap-2.5">
          {layouts[s].map((b, i) => (
            <motion.span
              key={i}
              animate={{ flexGrow: b.grow, height: b.h }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
              style={{
                flexBasis: 0,
                borderRadius: 8,
                border: `1.5px solid ${TINT1}`,
                background: i === 1 ? `linear-gradient(160deg, ${TINT2}, ${TINT1})` : "rgba(0,146,212,.06)",
              }}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  13 — speed                                                                */
/* -------------------------------------------------------------------------- */

function SpeedMock({ reduce, phase }: MockProps) {
  const s = useStep(8, 800, reduce, phase);
  const full = s !== 0;
  const score = useCounter(98, full, reduce, 900);

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div className="relative" style={{ width: 150, height: 78 }}>
          <svg viewBox="0 0 150 80" className="h-full w-full" fill="none" aria-hidden>
            <path
              d="M12 72a63 63 0 0 1 126 0"
              stroke="rgba(0,26,35,.10)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <motion.path
              d="M12 72a63 63 0 0 1 126 0"
              stroke={BRAND}
              strokeWidth="10"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: full ? 0.96 : 0.08 }}
              transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
            />
          </svg>
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: 8,
              width: 2,
              height: 42,
              background: INK,
              borderRadius: 999,
              transformOrigin: "bottom center",
            }}
            animate={{ rotate: full ? 82 : -82 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: 4,
              width: 10,
              height: 10,
              marginLeft: -5,
              borderRadius: 999,
              background: INK,
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            lineHeight: 1,
            color: INK,
          }}
        >
          {score}
          <span style={{ fontSize: 13, color: MUTED }}>/100</span>
        </p>

        <span
          style={{
            width: "76%",
            height: 6,
            borderRadius: 999,
            background: "rgba(0,26,35,.08)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "38%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${TINT1}, ${BRAND})`,
            }}
            {...loop(reduce, { left: ["-40%", "102%"] }, { left: "62%" }, {
              duration: 1.8,
              repeat: Infinity,
              delay: phase,
              ease: "easeInOut",
            })}
          />
        </span>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  14 — seo                                                                  */
/* -------------------------------------------------------------------------- */

function SeoMock({ reduce, phase }: MockProps) {
  const s = useStep(3, 1900, reduce, phase);
  const others = ["r1", "r2", "r3"];
  const order = s === 0 ? [...others, "ziel"] : ["ziel", ...others];

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>Suchergebnisse</span>
          <motion.span
            animate={{ color: s === 0 ? MUTED : BRAND }}
            style={{ fontSize: 10, fontWeight: 700 }}
          >
            {s === 0 ? "Platz 7" : "Platz 1"}
          </motion.span>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          {order.map((id) => {
            const target = id === "ziel";
            return (
              <motion.div
                key={id}
                layout={!reduce}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                className="flex items-center gap-3"
                style={{
                  borderRadius: 9,
                  padding: "7px 10px",
                  background: target ? "rgba(0,146,212,.10)" : "rgba(0,26,35,.035)",
                  border: target ? `1px solid ${TINT1}` : "1px solid transparent",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: target ? BRAND : "rgba(0,26,35,.12)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ display: "grid", gap: 4, flex: 1 }}>
                  <Bar w={target ? "72%" : "58%"} h={5} tone={target ? "brand" : "grey"} />
                  <Bar w="88%" h={4} tone="light" />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  15 — form                                                                 */
/* -------------------------------------------------------------------------- */

function FormMock({ reduce, phase }: MockProps) {
  const s = useStep(6, 850, reduce, phase);
  const fields = ["Name", "E-Mail", "Anliegen"];
  const filled = Math.min(s, 3);
  const sent = s >= 5;

  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 14, display: "grid", gap: 9, alignContent: "center" }}>
        {fields.map((f, i) => (
          <div
            key={f}
            className="flex items-center gap-2"
            style={{
              borderRadius: 9,
              border: `1px solid ${filled > i ? TINT1 : "rgba(0,26,35,.10)"}`,
              background: filled > i ? "rgba(0,146,212,.05)" : "#fff",
              padding: "9px 11px",
              transition: "background .3s, border-color .3s",
            }}
          >
            <span style={{ fontSize: 10.5, color: MUTED, width: 52, flexShrink: 0 }}>{f}</span>
            <span style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(0,26,35,.07)" }}>
              <motion.span
                style={{ display: "block", height: "100%", borderRadius: 999, background: BRAND }}
                animate={{ width: filled > i ? `${58 + i * 12}%` : "0%" }}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              />
            </span>
          </div>
        ))}

        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{
            boxShadow: s >= 4 ? "0 0 0 5px rgba(0,188,255,.18)" : "0 0 0 0 rgba(0,188,255,0)",
          }}
          transition={{ duration: reduce ? 0 : 0.4 }}
          style={{
            marginTop: 2,
            borderRadius: 999,
            background: `linear-gradient(160deg, ${INK}, #0B3A4E)`,
            color: "#fff",
            padding: "9px 14px",
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          {sent ? (
            <>
              <Check size={12} color="#7EE7B4" />
              <span>Anfrage im CRM</span>
            </>
          ) : (
            <span>Absenden</span>
          )}
        </motion.div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  16 — cms                                                                  */
/* -------------------------------------------------------------------------- */

const CMS_TEXT = "Neue Öffnungszeiten";

function CmsMock({ reduce, phase }: MockProps) {
  const total = CMS_TEXT.length + 10;
  const s = useStep(total, 150, reduce, phase);
  const typed = CMS_TEXT.slice(0, reduce ? CMS_TEXT.length : Math.min(Math.max(s, 3), CMS_TEXT.length));

  return (
    <Stage>
      <div className="flex h-full gap-2.5">
        {/* Editor */}
        <div style={{ ...panel, flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>Bearbeiten</span>
          <div
            style={{
              borderRadius: 8,
              border: `1px solid ${TINT1}`,
              padding: "8px 9px",
              minHeight: 44,
              fontSize: 11.5,
              color: INK,
              lineHeight: 1.3,
            }}
          >
            {typed}
            {!reduce && (
              <motion.span
                style={{
                  display: "inline-block",
                  width: 1.5,
                  height: 12,
                  background: BRAND,
                  verticalAlign: "-2px",
                  marginLeft: 1,
                }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            )}
          </div>
          <Bar w="82%" h={5} tone="light" />
          <Bar w="64%" h={5} tone="light" />
        </div>

        {/* Vorschau */}
        <div style={{ ...panel, flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: BRAND }}>Vorschau</span>
          <span
            style={{
              display: "block",
              height: 30,
              borderRadius: 6,
              background: `linear-gradient(140deg, ${TINT2}, ${TINT1})`,
            }}
          />
          <motion.p
            key={typed}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: INK, lineHeight: 1.2 }}
          >
            {typed || "…"}
          </motion.p>
          <Bar w="90%" h={4} tone="light" />
          <Bar w="70%" h={4} tone="light" />
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  17 — care                                                                 */
/* -------------------------------------------------------------------------- */

function CareMock({ reduce, phase }: MockProps) {
  return (
    <Stage>
      <div style={{ ...panel, height: "100%", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="flex items-center gap-2">
          <motion.span
            style={{ width: 9, height: 9, borderRadius: 999, background: "#2FBF71" }}
            {...loop(reduce, { opacity: [1, 0.3, 1] }, { opacity: 1 }, {
              duration: 2,
              repeat: Infinity,
              delay: phase,
              ease: "easeInOut",
            })}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: INK }}>Alles läuft</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED }}>99,98 %</span>
        </div>

        <div className="relative flex-1 overflow-hidden" style={{ borderRadius: 10, background: "rgba(0,146,212,.06)" }}>
          <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="h-full w-full" fill="none" aria-hidden>
            <motion.path
              d="M0 46h44l10-22 12 44 12-30 10 8h38l10-20 12 40 12-28 10 8h40l10-18 12 36 12-26 10 8h46"
              stroke={BRAND}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              {...loop(
                reduce,
                { pathLength: [0, 1], opacity: [0.2, 1] },
                { pathLength: 1, opacity: 1 },
                { delay: phase, duration: 4, repeat: Infinity, ease: "linear" }
              )}
            />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <motion.span
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: TINT2,
              color: BRAND,
            }}
            {...loop(reduce, { rotate: 360 }, { rotate: 0 }, {
              duration: 3.5,
              repeat: Infinity,
              delay: phase,
              ease: "linear",
            })}
            aria-hidden
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path
                d="M12 7a5 5 0 1 1-1.6-3.7M12 1.5V4H9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
          <span style={{ fontSize: 11, color: MUTED }}>Sicherung läuft</span>
          <span style={{ marginLeft: "auto" }}>
            <Check size={13} />
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------------------- */
/*  Verteiler                                                                 */
/* -------------------------------------------------------------------------- */

const MOCKUPS: Record<string, React.ComponentType<MockProps>> = {
  chat: ChatMock,
  workflow: WorkflowMock,
  crm: CrmMock,
  knowledge: KnowledgeMock,
  report: ReportMock,
  handover: HandoverMock,
  feed: FeedMock,
  camera: CameraMock,
  ads: AdsMock,
  display: DisplayMock,
  local: LocalMock,
  design: DesignMock,
  speed: SpeedMock,
  seo: SeoMock,
  form: FormMock,
  cms: CmsMock,
  care: CareMock,
};

/**
 * Rendert das zur Kennung passende animierte Mockup.
 * Bei reduzierter Bewegung zeigt jedes Mockup seinen Endzustand ohne Schleife.
 * `index` erzeugt den Phasenversatz, damit die Karten im Raster nicht im
 * Gleichtakt pulsieren.
 */
export default function CapabilityMockup({
  id,
  label,
  index = 0,
}: {
  id: string;
  label: string;
  index?: number;
}) {
  const reduce = useSafeReducedMotion();
  const Mock = MOCKUPS[id];
  if (!Mock) return null;

  return (
    <div className="absolute inset-0" role="img" aria-label={label}>
      <Mock reduce={reduce} phase={reduce ? 0 : (index % 6) * 0.6} />
    </div>
  );
}
