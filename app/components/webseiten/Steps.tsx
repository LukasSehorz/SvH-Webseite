"use client";

/* M10. Die Kapitelliste mit genau einem hellen Eintrag.
   Links stehen die vier Schritte, der aktive in Weisz mit einem Punkt in
   #7c6aff, die uebrigen gedaempft. Rechts steht das Fenster, das den
   aktiven Schritt zeigt.

   Der Wechsel haengt an der Scrollposition und gilt in beide Richtungen.
   Auf schmalen Schirmen wird daraus eine Stapelung aus vier Bloecken
   ohne Umschalten, denn ein klebender Bereich waere dort nur im Weg. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Art, Window } from "./Mockups";
import s from "./webseiten.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Der Nebel wandert ueber die vier Schritte von Blau nach Lavendel. */
const NEBEL: readonly [string, string][] = [
  ["#5b8cff", "#5b8cff"],
  ["#5b8cff", "#7c6aff"],
  ["#7c6aff", "#7c6aff"],
  ["#7c6aff", "#b9a5ff"],
];

type Schritt = { art: string; head: string; body: string };

export default function Steps({ items }: Readonly<{ items: readonly Schritt[] }>) {
  const wrap = useRef<HTMLDivElement>(null);
  const [schmal, setSchmal] = useState(false);
  const [aktiv, setAktiv] = useState(0);

  useIsoLayoutEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    setSchmal(m.matches);
    const auf = (e: MediaQueryListEvent) => setSchmal(e.matches);
    m.addEventListener("change", auf);
    return () => m.removeEventListener("change", auf);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length)));
    setAktiv(n);
  });

  if (schmal) {
    return (
      <div className={s.stepStack}>
        {items.map((it, i) => (
          <div className={s.stepStackItem} key={it.head}>
            <div style={{ position: "relative", paddingLeft: 34 }}>
              <span className={s.stepDot} style={{ transform: "scale(1)", top: 10 }} />
              <span className={s.stepNum} style={{ top: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={s.stepHead}>{it.head}</h3>
              <p className={s.stepBody}>{it.body}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Window mist={NEBEL[i][0]} mist2={NEBEL[i][1]} width={360}>
                <Art name={it.art} />
              </Window>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={s.stepWrap} ref={wrap}>
      <div className={s.stepSticky}>
        <div className={s.stepGrid}>
          <ol className={s.stepList}>
            {items.map((it, i) => (
              <li
                key={it.head}
                className={`${s.stepItem} ${i === aktiv ? s.stepItemOn : ""}`}
                style={{ opacity: i === aktiv ? 1 : 0.34 }}
                aria-current={i === aktiv ? "step" : undefined}
              >
                <span className={s.stepDot} />
                <span className={s.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.stepHead}>{it.head}</h3>
                <p className={s.stepBody}>{it.body}</p>
              </li>
            ))}
          </ol>

          <div className={s.stepStage}>
            {items.map((it, i) => (
              <motion.div
                className={s.stepPanel}
                key={it.head}
                animate={{
                  opacity: i === aktiv ? 1 : 0,
                  /* Aus einem bereits sichtbaren Zustand heraus. Es
                     fliegt nichts herein, es wird nur heller. */
                  scale: i === aktiv ? 1 : 0.985,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ pointerEvents: i === aktiv ? "auto" : "none" }}
                aria-hidden={i === aktiv ? undefined : "true"}
              >
                <Window mist={NEBEL[i][0]} mist2={NEBEL[i][1]} width={392}>
                  <Art name={it.art} />
                </Window>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
