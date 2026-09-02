"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { kiPage } from "../../copy";
import { Reveal, useSafeReducedMotion } from "../system/ui";
import { markPaths, type MarkId } from "./Marks";
import { Ramp, useScenesActive } from "./Scenes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const POP: [number, number, number, number] = [0.34, 1.4, 0.5, 1];

/* ------------------------------------------------------------------ */
/*  Die gemeinsame Buehne der drei Schritte                            */
/* ------------------------------------------------------------------ */

/**
 * Alle drei Schritte zeigen dieselben acht Aufgaben aus dem Seitenkopf.
 * Schritt eins macht sie sichtbar, Schritt zwei waehlt drei davon aus,
 * Schritt drei baut genau diese drei ein. Weil die Knoten dieselben
 * bleiben und nur ihren Platz wechseln, sieht man, dass die Schritte
 * aufeinander aufbauen und nicht nebeneinander stehen.
 *
 * Der Zustand vor einem Schritt ist immer der Zustand des vorigen
 * Schritts. Wird eine Zeile aktiv, wandert die Buehne von dort in ihren
 * eigenen Zustand, und beim Zurueckscrollen denselben Weg zurueck.
 */
type Phase = -1 | 0 | 1 | 2;

const VIEW = { w: 560, h: 300 };
const NODE_W = 92;
const NODE_H = 64;
const HOME_X = [100, 220, 340, 460] as const;
const HOME_Y = [100, 205] as const;
const CENTER = { x: 280, y: 150 };

/** Die drei ausgewaehlten Hebel und ihre Plaetze in der Spalte. */
const PICKED = [0, 1, 4] as const;
const PICK_X = 280;
const PICK_Y = [62, 150, 238] as const;

const NODE_IDS: readonly MarkId[] = [
  "email",
  "chat",
  "agent",
  "calendar",
  "offer",
  "document",
  "crm",
  "report",
];

const HAIR = "rgba(244,244,246,.17)";
const PLATE = "rgba(244,244,246,.045)";

function FlowStage({
  phase,
  live,
  gradId,
}: Readonly<{ phase: Phase; live: boolean; gradId: string }>) {
  const chosen = phase >= 1;
  const built = phase === 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <Ramp id={gradId} />
      <defs>
        <linearGradient id={`${gradId}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C6AFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#7C6AFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C6AFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Die Spange, die in Schritt drei von beiden Seiten zugeht. Links
          steht der Betrieb, rechts stehen wir. */}
      <motion.path
        d="M198 24v252M198 24h20M198 276h20"
        stroke={HAIR}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ x: built ? 0 : -44, opacity: built ? 1 : 0 }}
        transition={{ duration: 0.85, ease: EASE }}
      />
      <motion.path
        d="M362 24v252M362 24h-20M362 276h-20"
        stroke={`url(#${gradId})`}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ x: built ? 0 : 44, opacity: built ? 1 : 0 }}
        transition={{ duration: 0.85, ease: EASE }}
      />

      {/* Rueckgrat zwischen den drei eingebauten Aufgaben. */}
      <motion.path
        d={`M${PICK_X} ${PICK_Y[0]}V${PICK_Y[2]}`}
        stroke={`url(#${gradId}-up)`}
        strokeWidth={1.4}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: built ? 1 : 0, opacity: built ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: built ? 0.2 : 0 }}
      />

      {NODE_IDS.map((id, i) => {
        const cx = HOME_X[i % 4];
        const cy = HOME_Y[Math.floor(i / 4)];
        const pick = PICKED.indexOf(i as (typeof PICKED)[number]);
        const isPick = pick >= 0;

        let dx = 0;
        let dy = 0;
        let scale = 1;
        let opacity = 1;

        if (phase < 0) {
          opacity = 0.14;
          scale = 0.94;
        } else if (chosen) {
          if (isPick) {
            dx = PICK_X - cx;
            dy = PICK_Y[pick] - cy;
            scale = 1.04;
          } else {
            /* Was nicht gewaehlt wurde, tritt zurueck an den Rand. */
            dx = (cx - CENTER.x) * 0.26;
            dy = (cy - CENTER.y) * 0.3;
            scale = 0.74;
            opacity = built ? 0.1 : 0.16;
          }
        }

        const lit = chosen && isPick;

        return (
          <motion.g
            key={id}
            initial={false}
            animate={{ x: dx, y: dy, scale, opacity }}
            transition={{
              duration: 0.95,
              ease: EASE,
              delay: i * 0.045,
            }}
          >
            <rect
              x={cx - NODE_W / 2}
              y={cy - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={13}
              fill={lit ? "rgba(124,106,255,.12)" : PLATE}
              stroke={lit ? `url(#${gradId})` : HAIR}
              strokeWidth={1.2}
            />
            <g
              transform={`translate(${cx - 14} ${cy - 14}) scale(1.1667)`}
              stroke={
                lit ? "rgba(244,244,246,.86)" : "rgba(244,244,246,.42)"
              }
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              {markPaths[id]}
            </g>
          </motion.g>
        );
      })}

      {/* Haken an den drei eingebauten Aufgaben, einer nach dem anderen. */}
      {PICK_Y.map((y, k) => (
        <motion.g
          key={y}
          initial={false}
          animate={{ scale: built ? 1 : 0.3, opacity: built ? 1 : 0 }}
          transition={{
            duration: 0.55,
            ease: POP,
            delay: built ? 0.55 + k * 0.13 : 0,
          }}
        >
          <circle cx={324} cy={y - 24} r={11} fill="#0B0B10" />
          <circle
            cx={324}
            cy={y - 24}
            r={11}
            stroke={`url(#${gradId})`}
            strokeWidth={1.2}
          />
          <path
            d={`M318.6 ${y - 23.6}l3.4 3.4 6.6-7.2`}
            stroke={`url(#${gradId})`}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      ))}

      {/* Der Blick ueber den Betrieb. Er laeuft nur im ersten Schritt. */}
      <motion.g
        initial={false}
        animate={
          live && phase === 0
            ? { x: [-80, VIEW.w + 80], opacity: 1 }
            : { x: -80, opacity: 0 }
        }
        transition={
          live && phase === 0
            ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.35, ease: EASE }
        }
      >
        <rect
          x={0}
          y={0}
          width={80}
          height={VIEW.h}
          fill={`url(#${gradId}-band)`}
        />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Die drei Schritte                                                  */
/* ------------------------------------------------------------------ */

function FlowStep({
  index,
  step,
  on,
  live,
  onEnter,
  onHover,
  onLeave,
}: Readonly<{
  index: number;
  step: { n: string; title: string; body: string };
  on: boolean;
  live: boolean;
  onEnter: (index: number) => void;
  onHover: (index: number) => void;
  onLeave: () => void;
}>) {
  const ref = useRef<HTMLLIElement>(null);
  /* Ein schmales Band in der Bildmitte entscheidet, welcher Schritt
     steht. Weil es ein reiner Sichtbarkeitstest ist, gilt er in beide
     Scrollrichtungen ohne weitere Rechnung. */
  const inView = useInView(ref, { margin: "-46% 0px -46% 0px" });
  const gradId = `f${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  const phase = (on ? index : index - 1) as Phase;

  return (
    <li
      ref={ref}
      className="ki-flow-step"
      data-on={on ? "true" : "false"}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={onLeave}
    >
      <span className="ki-flow-n" aria-hidden="true">
        {step.n}
      </span>

      <div className="ki-flow-text">
        <h3 className="t-h2 ki-flow-step-title">{step.title}</h3>
        <p className="t-body-lg ki-flow-step-body">{step.body}</p>
      </div>

      <div className="ki-flow-stage">
        <span className="ki-flow-mist" aria-hidden="true" />
        <FlowStage phase={phase} live={live} gradId={gradId} />
      </div>
    </li>
  );
}

export default function KiFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useScenesActive(sectionRef);
  const reduced = useSafeReducedMotion();

  const [scrolled, setScrolled] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const onEnter = useCallback((index: number) => {
    setScrolled(index);
    /* Ein neuer Schritt durch Scrollen hebt eine alte Zeigerwahl auf,
       sonst bliebe die Seite an der zuletzt beruehrten Zeile haengen. */
    setHovered(null);
  }, []);

  const onHover = useCallback((index: number) => setHovered(index), []);
  const onLeave = useCallback(() => setHovered(null), []);

  const active = hovered ?? scrolled;

  /* Bei reduzierter Bewegung steht jeder Schritt fuer sich vollstaendig
     da. Nichts ist ausgegraut, nichts laeuft, alles bleibt lesbar. */
  const isOn = useCallback(
    (index: number) => reduced || index === active,
    [reduced, active]
  );

  const fill = useMemo(
    () => (reduced ? 1 : (active + 1) / kiPage.flow.steps.length),
    [reduced, active]
  );

  return (
    <section className="section ki-flow" id="ablauf" ref={sectionRef}>
      <div className="shell">
        <Reveal>
          <div className="ki-flow-head">
            <h2 className="t-h1 ki-flow-title">{kiPage.flow.title}</h2>
            <p className="t-body-lg ki-flow-intro">{kiPage.flow.intro}</p>
          </div>
        </Reveal>

        <div className="ki-flow-body">
          <span className="ki-flow-rail" aria-hidden="true">
            <span
              className="ki-flow-rail-fill"
              style={{ transform: `scaleY(${fill})` }}
            />
          </span>

          <ol className="ki-flow-list">
            {kiPage.flow.steps.map((step, index) => (
              <FlowStep
                key={step.n}
                index={index}
                step={step}
                on={isOn(index)}
                live={visible && !reduced && isOn(index)}
                onEnter={onEnter}
                onHover={onHover}
                onLeave={onLeave}
              />
            ))}
          </ol>
        </div>
      </div>

      <style jsx global>{`
        .ki-flow .ki-flow-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px 64px;
          align-items: start;
          margin-bottom: clamp(36px, 4.5vw, 64px);
        }

        .ki-flow .ki-flow-title {
          max-width: 15ch;
          text-wrap: balance;
        }

        .ki-flow .ki-flow-intro {
          padding-top: 8px;
        }

        .ki-flow .ki-flow-body {
          position: relative;
        }

        /* Die Schiene laeuft durch die Ziffernspalte und fuellt sich mit
           jedem erreichten Schritt. Sie zeigt, dass die drei Schritte eine
           Reihe sind und keine Auswahl. */
        /* Die Schiene stand auf einem Bildpunkt Breite. Gemessen war der
           gefuellte Teil zwar da, auf dem Schirm aber nicht als Farbe zu
           erkennen. Zwei Bildpunkte und ein leiser Schein machen den
           Fortschritt sichtbar, ohne dass die Linie laut wird. */
        .ki-flow .ki-flow-rail {
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 0;
          width: 2px;
          border-radius: 2px;
          background: var(--line);
          overflow: hidden;
        }

        .ki-flow .ki-flow-rail-fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #5b8cff, #7c6aff 52%, #b9a5ff);
          box-shadow: 0 0 12px rgba(124, 106, 255, 0.6);
          transform-origin: top center;
          transition: transform 0.9s var(--ease-out-expo);
        }

        .ki-flow .ki-flow-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ki-flow .ki-flow-step {
          position: relative;
          display: grid;
          grid-template-columns: 52px minmax(0, 0.82fr) minmax(0, 1fr);
          gap: 0 clamp(28px, 4vw, 72px);
          align-items: center;
          padding-block: clamp(34px, 4.5vw, 60px);
        }

        .ki-flow .ki-flow-n {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 9999px;
          border: 1px solid var(--line);
          background: var(--bg);
          font-family: var(--font-display);
          font-size: 19px;
          font-weight: 400;
          line-height: 1;
          color: var(--ink-3);
          transition:
            border-color 0.7s var(--ease-out-expo),
            color 0.7s var(--ease-out-expo),
            transform 0.7s var(--ease-out-expo);
        }

        .ki-flow .ki-flow-step[data-on="true"] .ki-flow-n {
          border-color: rgba(124, 106, 255, 0.85);
          color: var(--ink);
          transform: scale(1.08);
        }

        .ki-flow .ki-flow-step-title {
          transition: opacity 0.7s var(--ease-out-expo);
          opacity: 0.5;
        }

        .ki-flow .ki-flow-step-body {
          margin-top: 14px;
          transition: opacity 0.7s var(--ease-out-expo);
          /* Der ruhende Schritt tritt zurueck, bleibt aber lesbar. Unter
             0,74 faellt der Fliesztext unter die Kontrastmarke. */
          opacity: 0.74;
        }

        .ki-flow .ki-flow-step[data-on="true"] .ki-flow-step-title,
        .ki-flow .ki-flow-step[data-on="true"] .ki-flow-step-body {
          opacity: 1;
        }

        .ki-flow .ki-flow-stage {
          position: relative;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 560 / 300;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--bg-raise);
          opacity: 0.34;
          transition:
            opacity 0.7s var(--ease-out-expo),
            border-color 0.7s var(--ease-out-expo);
        }

        .ki-flow .ki-flow-step[data-on="true"] .ki-flow-stage {
          opacity: 1;
          border-color: rgba(244, 244, 246, 0.2);
        }

        .ki-flow .ki-flow-stage svg {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
        }

        /* Wie bei den Kacheln sitzt der helle Kern des Verlaufs innerhalb
           der beschnittenen Flaeche, sonst bleibt vom Farbnebel nichts
           uebrig. */
        .ki-flow .ki-flow-mist {
          position: absolute;
          inset: -16% -10% -20%;
          border-radius: 9999px;
          background: radial-gradient(
            48% 44% at 50% 50%,
            rgba(124, 106, 255, 0.52),
            transparent 74%
          );
          filter: blur(44px);
          opacity: 0;
          transform: scale(0.94);
          transition:
            opacity 0.9s var(--ease-out-expo),
            transform 0.9s var(--ease-out-expo);
          pointer-events: none;
        }

        .ki-flow .ki-flow-step[data-on="true"] .ki-flow-mist {
          opacity: 1;
          transform: scale(1);
        }

        @media (max-width: 1023px) {
          .ki-flow .ki-flow-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .ki-flow .ki-flow-intro {
            padding-top: 0;
          }

          .ki-flow .ki-flow-rail {
            left: 21px;
          }

          .ki-flow .ki-flow-step {
            grid-template-columns: 44px minmax(0, 1fr);
            gap: 0 20px;
            align-items: start;
            padding-block: 28px;
          }

          .ki-flow .ki-flow-n {
            width: 42px;
            height: 42px;
            font-size: 16px;
          }

          .ki-flow .ki-flow-stage {
            grid-column: 2;
            margin-top: 22px;
            border-radius: 16px;
          }
        }

        /* Auf schmalen Geraeten nimmt die Buehne die volle Breite. In der
           eingerueckten Spalte waren die acht Knoten sonst so klein, dass
           man ihre Zeichen nicht mehr erkannt hat. */
        @media (max-width: 640px) {
          .ki-flow .ki-flow-stage {
            grid-column: 1 / -1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ki-flow .ki-flow-rail-fill,
          .ki-flow .ki-flow-n,
          .ki-flow .ki-flow-stage,
          .ki-flow .ki-flow-mist,
          .ki-flow .ki-flow-step-title,
          .ki-flow .ki-flow-step-body {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
