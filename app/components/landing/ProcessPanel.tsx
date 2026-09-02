"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { process as processCopy } from "../../copy";
import { useSafeReducedMotion } from "../system/ui";
import { StepScene, stepTotal, STEP_IDS, useReplay } from "./tiles/Vignettes";

/**
 * Der Ablauf als Folge von drei Schritten.
 *
 * Immer genau ein Schritt ist wach. Er steht in voller Staerke, die
 * beiden anderen sind ausgegraut, und das Licht im Feld liegt hinter dem
 * wachen Schritt. Beim Scrollen wandert die Aufmerksamkeit von eins nach
 * drei und beim Zurueckscrollen wieder zurueck, mit dem Zeiger springt
 * sie auf den Schritt, auf den gerade gezeigt wird.
 *
 * Die drei Szenen teilen sich einen Faden. Der Balken, den Schritt eins
 * als groeszten Hebel findet, liegt in Schritt zwei ueber den Bausteinen
 * und faehrt in Schritt drei als Teil des fertigen Moduls hinueber. So
 * ist zu sehen, dass die Schritte aufeinander aufbauen statt nebeneinander
 * zu laufen.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Ab hier stehen die Schritte gestapelt statt nebeneinander. */
const STACK_QUERY = "(max-width: 1023px)";

/* ------------------------------------------------------------------ */
/*  Wer ist wach                                                       */
/* ------------------------------------------------------------------ */

/** Meldet, ob die Schritte gestapelt stehen. */
function useStacked(): boolean {
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(STACK_QUERY);
    setStacked(media.matches);
    const onChange = (event: MediaQueryListEvent) => setStacked(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return stacked;
}

/**
 * Weckt beim Scrollen einen Schritt nach dem anderen.
 *
 * Der Fortschritt laeuft in beide Richtungen, deshalb wandert die
 * Aufmerksamkeit beim Zurueckscrollen von selbst wieder nach vorn.
 */
function useScrollStep(
  ref: React.RefObject<HTMLElement | null>,
  count: number,
  enabled: boolean
): number {
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.86", "end 0.52"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!enabled) return;
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setIndex((prev) => (prev === next ? prev : next));
  });

  return index;
}

/* ------------------------------------------------------------------ */
/*  Schiene zwischen zwei Schritten                                    */
/* ------------------------------------------------------------------ */

function Rail({ id, lit }: Readonly<{ id: string; lit: boolean }>) {
  return (
    <div className="pp-rail" aria-hidden="true">
      <svg className="pp-rail-art" viewBox="0 0 56 12" fill="none">
        <path d="M6 6H44" stroke="rgba(255,255,255,.13)" />
        <path
          d="M40 1.6l4.4 4.4-4.4 4.4"
          stroke="rgba(255,255,255,.13)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M6 6H44"
          stroke={`url(#${id}-ramp)`}
          strokeWidth={1.4}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        <motion.path
          d="M40 1.6l4.4 4.4-4.4 4.4"
          stroke={`url(#${id}-ramp)`}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: lit ? 0.45 : 0 }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ein Schritt                                                        */
/* ------------------------------------------------------------------ */

type Step = Readonly<{ n: string; title: string; body: string }>;

function StepCard({
  step,
  index,
  uid,
  state,
  reduced,
  register,
  onWake,
}: Readonly<{
  step: Step;
  index: number;
  uid: string;
  state: "active" | "done" | "todo";
  reduced: boolean;
  register: (node: HTMLElement | null) => void;
  onWake: (index: number) => void;
}>) {
  const sceneId = STEP_IDS[index] ?? STEP_IDS[0];
  const { playKey, play } = useReplay(stepTotal(sceneId));
  const awake = state === "active";
  const reached = state !== "todo";

  /* Die Szene laeuft jedes Mal an, wenn ihr Schritt wach wird. */
  useEffect(() => {
    if (awake) play();
  }, [awake, play]);

  return (
    <motion.article
      ref={register}
      className="pp-card"
      data-state={state}
      tabIndex={0}
      onPointerEnter={() => onWake(index)}
      onFocus={() => onWake(index)}
      initial={{ opacity: 0, y: reduced ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.3 : 0.7,
        delay: reduced ? 0 : 0.24 + index * 0.11,
        ease: EASE,
      }}
    >
      <span className="pp-num" aria-hidden="true">
        <svg className="pp-ring" viewBox="0 0 44 44" width="44" height="44" fill="none">
          <circle
            cx={22}
            cy={22}
            r={21.3}
            stroke="rgba(255,255,255,.16)"
            strokeWidth={1.2}
          />
          <motion.circle
            cx={22}
            cy={22}
            r={21.3}
            stroke={`url(#${uid}-ramp)`}
            strokeWidth={1.4}
            strokeLinecap="round"
            initial={false}
            animate={{
              pathLength: reached ? 1 : 0,
              opacity: reached ? 1 : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
          />
        </svg>
        <span className="pp-num-text">{step.n}</span>
      </span>

      <h3 className="t-h3 pp-card-title">{step.title}</h3>
      <p className="t-body pp-card-body">{step.body}</p>

      <div className="pp-vignette">
        <StepScene id={sceneId} playKey={playKey} reduced={reduced} />
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Sektion                                                            */
/* ------------------------------------------------------------------ */

export default function ProcessPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const reduced = useSafeReducedMotion();
  const stacked = useStacked();
  const uid = `pp${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const count = processCopy.steps.length;
  const scrolled = useScrollStep(panelRef, count, !stacked && !reduced);
  const [passing, setPassing] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);

  /* Gestapelt entscheidet das mittlere Band des Bildschirms, welcher
     Schritt wach ist. Nebeneinander entscheidet der Scrollfortschritt. */
  useEffect(() => {
    if (!stacked || reduced) return;
    const nodes = cardsRef.current.filter(
      (node): node is HTMLElement => node !== null
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const found = nodes.indexOf(entry.target as HTMLElement);
          if (found >= 0) setPassing(found);
        }
      },
      { rootMargin: "-46% 0px -46% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stacked, reduced]);

  const wake = useCallback((index: number) => setPointed(index), []);
  const active = pointed ?? (stacked ? passing : scrolled);

  const stateOf = (index: number): "active" | "done" | "todo" => {
    if (reduced) return "active";
    if (index === active) return "active";
    return index < active ? "done" : "todo";
  };

  return (
    <section className="section process-panel" id="ablauf">
      <div className="shell">
        <motion.div
          ref={panelRef}
          className="pp-panel"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.975 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: reduced ? 0.3 : 0.9, ease: EASE }}
        >
          {/* Das Licht des Feldes steht hinter dem wachen Schritt. */}
          <motion.span
            className="pp-light"
            aria-hidden="true"
            data-stacked={stacked ? "ja" : "nein"}
            initial={false}
            animate={
              reduced
                ? { x: 0, y: 0, opacity: 0.5 }
                : stacked
                  ? { x: 0, y: `${active * 100}%`, opacity: 1 }
                  : { x: `${active * 100}%`, y: 0, opacity: 1 }
            }
            transition={{ duration: reduced ? 0 : 1.1, ease: EASE }}
          />

          {/* Die Rampe der Sektion, einmal deklariert. */}
          <svg className="pp-defs" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={`${uid}-ramp`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5B8CFF" />
                <stop offset="48%" stopColor="#7C6AFF" />
                <stop offset="100%" stopColor="#B9A5FF" />
              </linearGradient>
            </defs>
          </svg>

          <div className="pp-inner">
            <p className="t-label pp-label">{processCopy.label}</p>
            <h2 className="t-h1 pp-title">{processCopy.title}</h2>
            <p className="t-body-lg pp-intro">{processCopy.intro}</p>

            <div
              className="pp-cards"
              onPointerLeave={() => setPointed(null)}
              onBlur={(event) => {
                const next = event.relatedTarget as Node | null;
                if (!next || !event.currentTarget.contains(next)) {
                  setPointed(null);
                }
              }}
            >
              {processCopy.steps.map((step, index) => (
                <Fragment key={step.n}>
                  {index > 0 ? (
                    <Rail id={uid} lit={!reduced ? active >= index : true} />
                  ) : null}
                  <StepCard
                    step={step}
                    index={index}
                    uid={uid}
                    state={stateOf(index)}
                    reduced={reduced}
                    register={(node) => {
                      cardsRef.current[index] = node;
                    }}
                    onWake={wake}
                  />
                </Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .process-panel .pp-panel {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: linear-gradient(
            160deg,
            #14122b 0%,
            #1b1740 45%,
            #121026 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          transform-origin: 50% 60%;
        }

        /* Ein einziges wanderndes Licht statt eines festen Schimmers. */
        .process-panel .pp-light {
          position: absolute;
          left: 0;
          top: -10%;
          width: 33.333%;
          height: 120%;
          background: radial-gradient(
            50% 46% at 50% 50%,
            rgba(185, 165, 255, 0.2),
            rgba(124, 106, 255, 0.13) 46%,
            rgba(91, 140, 255, 0) 76%
          );
          filter: blur(60px);
          pointer-events: none;
        }

        .process-panel .pp-defs {
          position: absolute;
          width: 0;
          height: 0;
        }

        .process-panel .pp-inner {
          position: relative;
          padding: 64px 56px 56px;
        }

        .process-panel .pp-label {
          color: rgba(255, 255, 255, 0.56);
        }

        .process-panel .pp-title {
          color: #fff;
          margin-top: 20px;
          max-width: 17ch;
        }

        .process-panel .pp-intro {
          margin-top: 20px;
          max-width: 52ch;
          color: rgba(255, 255, 255, 0.7);
        }

        .process-panel .pp-cards {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 56px minmax(0, 1fr) 56px minmax(0, 1fr);
          align-items: stretch;
          margin-top: 52px;
        }

        .process-panel .pp-rail {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .process-panel .pp-rail-art {
          width: 56px;
          height: 12px;
          overflow: visible;
        }

        /* Ein Schritt hat drei Zustaende. Wach steht voll, erledigt bleibt
           erkennbar, und was noch kommt, tritt zurueck. Die Farbwerte des
           Textes bleiben dabei ueber der Lesbarkeitsgrenze, damit ein
           schlafender Schritt gedaempft und trotzdem lesbar ist. */
        .process-panel .pp-card {
          --pp-title: rgba(255, 255, 255, 0.56);
          --pp-body: rgba(255, 255, 255, 0.5);
          --pp-art: 0.3;
          --pp-num: rgba(255, 255, 255, 0.58);
          position: relative;
          display: flex;
          flex-direction: column;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 18px;
          padding: 28px;
          outline: none;
          transition:
            background-color 0.6s var(--ease-out-expo),
            border-color 0.6s var(--ease-out-expo),
            transform 0.6s var(--ease-out-expo),
            box-shadow 0.6s var(--ease-out-expo);
        }

        .process-panel .pp-card[data-state="done"] {
          --pp-title: rgba(255, 255, 255, 0.66);
          --pp-body: rgba(255, 255, 255, 0.54);
          --pp-art: 0.4;
          --pp-num: rgba(255, 255, 255, 0.68);
          border-color: rgba(255, 255, 255, 0.09);
        }

        .process-panel .pp-card[data-state="active"] {
          --pp-title: #fff;
          --pp-body: rgba(255, 255, 255, 0.82);
          --pp-art: 1;
          --pp-num: #fff;
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-4px);
          box-shadow: 0 24px 60px -32px rgba(10, 6, 40, 0.9);
        }

        .process-panel .pp-card:focus-visible {
          box-shadow:
            0 0 0 1px rgba(185, 165, 255, 0.7),
            0 0 0 5px rgba(124, 106, 255, 0.2);
        }

        .process-panel .pp-num {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          margin-bottom: 24px;
        }

        .process-panel .pp-ring {
          position: absolute;
          inset: 0;
          /* Der Ring zeichnet sich von oben statt von rechts. */
          transform: rotate(-90deg);
        }

        .process-panel .pp-num-text {
          position: relative;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--pp-num);
          transition: color 0.6s var(--ease-out-expo);
        }

        .process-panel .pp-card-title {
          color: var(--pp-title);
          transition: color 0.6s var(--ease-out-expo);
        }

        .process-panel .pp-card-body {
          margin-top: 12px;
          margin-bottom: 30px;
          color: var(--pp-body);
          transition: color 0.6s var(--ease-out-expo);
        }

        /* Die Szene sitzt in allen drei Karten auf gleicher Hoehe unten. */
        .process-panel .pp-vignette {
          position: relative;
          flex: 0 0 auto;
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          opacity: var(--pp-art);
          transition: opacity 0.6s var(--ease-out-expo);
        }

        .process-panel .pp-vignette svg {
          display: block;
          width: 100%;
          height: clamp(100px, 9vw, 210px);
        }

        @media (max-width: 1023px) {
          .process-panel .pp-inner {
            padding: 48px 36px 44px;
          }

          .process-panel .pp-cards {
            grid-template-columns: minmax(0, 1fr);
            margin-top: 40px;
          }

          .process-panel .pp-title {
            max-width: 22ch;
          }

          .process-panel .pp-light {
            left: 0;
            top: 0;
            width: 100%;
            height: 33.333%;
          }

          .process-panel .pp-rail {
            height: 44px;
          }

          /* Gestapelt zeigt die Schiene nach unten. */
          .process-panel .pp-rail-art {
            width: 44px;
            transform: rotate(90deg);
          }
        }

        @media (max-width: 640px) {
          .process-panel .pp-panel {
            border-radius: 22px;
          }

          .process-panel .pp-inner {
            padding: 36px 22px 32px;
          }

          .process-panel .pp-card {
            padding: 24px 20px;
          }

          .process-panel .pp-vignette {
            padding-top: 20px;
          }

          .process-panel .pp-vignette svg {
            height: 104px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .process-panel .pp-card[data-state="active"] {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
