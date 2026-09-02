"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import WordReveal from "../marketing/WordReveal";
import { Reveal, useSafeReducedMotion } from "../system/ui";
import { socialPage } from "../../copy";
import { IconComment, IconHeart, IconPlay, IconShare } from "./Icons";
import { useScenePlay } from "./usePlay";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  Instagram und TikTok als Zuhause der Marke                         */
/*                                                                     */
/*  Beide Plattformen werden benannt und nicht bebildert. Fremde        */
/*  Zeichen duerfen wir nicht fuehren, und wir brauchen sie auch nicht. */
/*  Ein gezeichneter Beitrag im Hochformat und ein gezeichnetes kurzes  */
/*  Video sagen dasselbe und gehoeren zu unserer eigenen Handschrift.   */
/*                                                                     */
/*  Die gestaltete Bewegung dieser Sektion ist das Fertigwerden der     */
/*  beiden Entwuerfe. Der Streifen wandert einmal ueber das Bild, die    */
/*  Fortschrittslinie des Videos laeuft durch. Beruehrung spielt es     */
/*  erneut ab.                                                          */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Gezeichneter Beitrag im Hochformat. */
function PostSketch({ playing }: Readonly<{ playing: boolean }>) {
  return (
    <div className={styles.post}>
      <div className={styles.postHead}>
        <span className={styles.postAvatar} />
        <span className={styles.postBars}>
          <span className={styles.bar} style={{ width: "52%" }} />
          <span className={styles.barSoft} style={{ width: "30%" }} />
        </span>
      </div>

      <div className={styles.postMedia}>
        <motion.span
          className={styles.postSheen}
          initial={playing ? { x: "-70%", opacity: 0 } : false}
          animate={{ x: "70%", opacity: [0, 1, 0] }}
          transition={{ duration: 1.7, delay: 0.35, ease: EASE }}
        />
      </div>

      <div className={styles.postActions}>
        <motion.span
          initial={playing ? { scale: 0.6, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
          style={{ color: "var(--acc-lav)", display: "grid" }}
        >
          <IconHeart />
        </motion.span>
        <IconComment />
        <IconShare />
      </div>

      <div className={styles.postFoot}>
        <span className={styles.bar} style={{ width: "84%" }} />
        <span className={styles.barSoft} style={{ width: "56%" }} />
      </div>
    </div>
  );
}

/** Gezeichnetes kurzes Video im Hochformat. */
function ReelSketch({ playing }: Readonly<{ playing: boolean }>) {
  return (
    <div className={styles.reel}>
      <motion.span
        className={styles.reelPlay}
        initial={playing ? { scale: 0.82, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
      >
        <IconPlay />
      </motion.span>

      <span className={styles.reelRail}>
        <IconHeart />
        <IconComment />
        <IconShare />
      </span>

      <span className={styles.reelCaption}>
        <span className={styles.bar} style={{ width: "76%" }} />
        <span className={styles.barSoft} style={{ width: "48%" }} />
      </span>

      <span className={styles.reelTrack}>
        <motion.span
          className={styles.reelFill}
          initial={playing ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
    </div>
  );
}

const SKETCHES = [PostSketch, ReelSketch];

export default function Platforms() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLElement>(null);
  const { run, playing, replay } = useScenePlay(host, !reduced);

  return (
    <section className="section" ref={host} data-shot="plattformen">
      <div className="shell">
        <div className={styles.secHead}>
          <WordReveal as="h2" className="t-h2" text={socialPage.platforms.title} />
          <Reveal delay={0.1}>
            <p className={`t-body-lg ${styles.secLead}`}>
              {socialPage.platforms.lead}
            </p>
          </Reveal>
        </div>

        <div className={styles.platformGrid}>
          {socialPage.platforms.items.map((item, index) => {
            const Sketch = SKETCHES[index] ?? PostSketch;
            return (
              <Reveal
                key={item.id}
                delay={index * 0.08}
                className={styles.platform}
              >
                <div
                  className={styles.platformStage}
                  aria-hidden="true"
                  onPointerEnter={replay}
                >
                  <div key={run}>
                    <Sketch playing={playing} />
                  </div>
                </div>

                <div className={styles.platformText}>
                  <h3 className={`t-h3 ${styles.platformName}`}>{item.name}</h3>
                  <p className={`t-body ${styles.platformBody}`}>{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
