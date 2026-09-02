"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import WordReveal from "../marketing/WordReveal";
import { Reveal, useSafeReducedMotion } from "../system/ui";
import { socialPage } from "../../copy";
import { IconComment, IconHeart, IconReplay } from "./Icons";
import { useScenePlay } from "./usePlay";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  Was passiert, wenn es laeuft                                       */
/*                                                                     */
/*  Die Szene, die der Auftraggeber ausdruecklich wollte. Eine Zahl     */
/*  laeuft von null hoch, kleine Zeichen kommen herein, ein Beitrag     */
/*  erscheint und bekommt Reichweite.                                   */
/*                                                                     */
/*  Sie nennt bewusst keine Endzahl. Waehrend des Laufs sind die        */
/*  Ziffern zu sehen, am Ende loesen sie sich nach oben auf und an      */
/*  ihrer Stelle steht wieder das Wort aus copy.ts. So zeigt die Szene  */
/*  Wachstum, ohne dass eine Zahl stehen bleibt, die als Versprechen    */
/*  gelesen werden koennte. Belegt ist allein die Zahl der umgesetzten  */
/*  Projekte, und die steht als ruhige Zeile darunter.                  */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Dauer des Hochzaehlens. Sie ist laenger als der Abschnitt, in dem die
    Ziffern scharf stehen. Dadurch bricht das Zaehlwerk mitten in der
    Bewegung ab, statt kurz auf einem festen Wert zu ruhen, den jemand
    als zugesagte Zahl lesen koennte. */
const COUNT_TIME = 3.2;

/** Ab hier loesen sich die Ziffern auf. */
const FADE_AT = 2.5;

/** Obergrenze des Laufs. Der Wert wird nie zu Ende gelesen, weil die
    Ziffern vorher verschwinden. Er bestimmt allein, wie schnell die
    Stellen wechseln. */
const COUNT_TO = 1840;

/* Lage, Art und Einsatz der kleinen Zeichen, die hereinkommen.

   Die Bahnen liegen bewusst nur an den beiden Raendern der Buehne. In der
   Mitte steht der Beitrag, und ein Zeichen, das darueber haengt, wuerde
   ihn verdecken. `drift` ist die Hoehe, auf die das Zeichen steigt; dort
   bleibt es danach auch liegen. Ein Zeichen, das am Ende verschwindet,
   liesze die Buehne nach dem Lauf leerer zurueck als davor. */
const MARKS: readonly {
  left: string;
  drift: number;
  delay: number;
  kind: "heart" | "comment";
}[] = [
  { left: "4%", drift: -100, delay: 0.7, kind: "heart" },
  { left: "80%", drift: -130, delay: 1.05, kind: "heart" },
  { left: "14%", drift: -160, delay: 1.4, kind: "comment" },
  { left: "88%", drift: -190, delay: 1.85, kind: "heart" },
  { left: "6%", drift: -220, delay: 2.25, kind: "comment" },
  { left: "82%", drift: -230, delay: 2.7, kind: "heart" },
];

/** Zaehlwerk mit deutschen Tausenderpunkten. */
function Counter({ playing }: Readonly<{ playing: boolean }>) {
  const value = useMotionValue(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const controls = animate(value, COUNT_TO, {
      duration: COUNT_TIME,
      // Eine flache Kurve. Die Ziffern laufen bis zuletzt sichtbar
      // weiter, statt sich fruehzeitig an einen Wert anzulegen.
      ease: [0.16, 0.6, 0.4, 1],
      onUpdate: (current) => setShown(Math.round(current)),
    });
    return () => controls.stop();
  }, [playing, value]);

  if (!playing) {
    return (
      <p className={styles.counterRest}>{socialPage.growth.counterRest}</p>
    );
  }

  return (
    <>
      <motion.p
        className={styles.counterValue}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [10, 0, 0, -22],
          filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(10px)"],
        }}
        /* Je Abschnitt eine eigene Kurve. Eine einzige Kurve ueber alle
           Abschnitte verzerrt die Zeitpunkte, weil sie zuerst auf den
           Gesamtfortschritt wirkt; gemessen war die Zahl dadurch schon
           nach 0,9 Sekunden am Verblassen, statt zwei Sekunden lang
           ruhig zu laufen. */
        transition={{
          duration: FADE_AT + 0.8,
          ease: [EASE, "linear", EASE],
          times: [0, 0.16, 0.78, 1],
        }}
      >
        {shown.toLocaleString("de-DE")}
      </motion.p>

      <motion.p
        className={styles.counterRest}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: FADE_AT + 0.5, ease: EASE }}
      >
        {socialPage.growth.counterRest}
      </motion.p>
    </>
  );
}

export default function GrowthScene() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLElement>(null);
  const { run, playing, replay } = useScenePlay(host, !reduced);

  return (
    <section className="section" ref={host} data-shot="wachstum">
      <div className={`shell ${styles.growthGrid}`}>
        <div>
          <WordReveal as="h2" className="t-h2" text={socialPage.growth.title} />

          <Reveal delay={0.1}>
            <p className={`t-body-lg ${styles.growthBody}`}>
              {socialPage.growth.body}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div>
              <button type="button" className={styles.replay} onClick={replay}>
                <IconReplay />
                <span>{socialPage.growth.replay}</span>
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <p className={styles.growthProof}>{socialPage.growth.proof}</p>
          </Reveal>
        </div>

        <div
          className={styles.stage}
          onPointerEnter={replay}
          data-shot="wachstum-buehne"
        >
          <span className={styles.stageGlow} aria-hidden="true" />

          {/* Der ganze Inhalt der Buehne haengt am Schluessel des Laufs.
              Ein neuer Lauf baut ihn neu auf, damit jede Bewegung von
              vorn beginnt, statt aus ihrem Endzustand weiterzulaufen. */}
          <div key={run}>
            <div className={styles.stageInner} aria-hidden="true">
              <p className={styles.counterLabel}>
                {socialPage.growth.counterLabel}
              </p>
              <div className={styles.counterSlot}>
                <Counter playing={playing} />
              </div>

              <motion.div
                className={styles.stagePost}
                initial={playing ? { opacity: 0, scale: 0.9, y: 18 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.55, ease: EASE }}
              >
                <motion.span
                  className={styles.reach}
                  initial={playing ? { scale: 0.45, opacity: 0 } : false}
                  animate={{ scale: [0.45, 1.9], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2.4, delay: 1.2, ease: EASE }}
                />

                <div className={styles.postHead}>
                  <span className={styles.postAvatar} />
                  <span className={styles.postBars}>
                    <span className={styles.bar} style={{ width: "56%" }} />
                    <span className={styles.barSoft} style={{ width: "34%" }} />
                  </span>
                </div>

                <div className={styles.postMedia} />

                <div className={styles.postActions}>
                  <IconHeart />
                  <IconComment />
                </div>
              </motion.div>

              <motion.p
                className={styles.stagePostCaption}
                initial={playing ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
              >
                {socialPage.growth.postCaption}
              </motion.p>
            </div>

            <div className={styles.marks} aria-hidden="true">
              {MARKS.map((mark, index) => (
                <motion.span
                  key={index}
                  className={styles.mark}
                  style={{ left: mark.left }}
                  initial={playing ? { opacity: 0, y: 26, scale: 0.6 } : false}
                  animate={{
                    opacity: playing ? [0, 1, 1] : 1,
                    y: playing ? [26, 0, mark.drift] : mark.drift,
                    scale: playing ? [0.6, 1, 1] : 1,
                  }}
                  transition={{
                    duration: 2.4,
                    delay: mark.delay,
                    ease: [EASE, EASE],
                    times: [0, 0.2, 1],
                  }}
                >
                  {mark.kind === "heart" ? <IconHeart /> : <IconComment />}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
