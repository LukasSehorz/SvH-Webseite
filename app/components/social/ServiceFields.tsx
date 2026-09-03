"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import { marketingPage } from "../../copy";
import { IconArrow, IconHeart } from "./Icons";
import { useScenePlay } from "./usePlay";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  Die Leistungen auf der Uebersicht                                  */
/*                                                                     */
/*  Jede Leistung traegt ein kleines bewegtes Sinnbild aus der Welt,    */
/*  in die sie fuehrt. Ein Browserfenster fuer die Webseiten und ein    */
/*  Beitrag im Hochformat fuer Social Media. Bei Beruehrung laeuft das  */
/*  Sinnbild erneut an, damit der Unterschied zwischen den Welten       */
/*  spuerbar wird, bevor man klickt.                                   */
/*                                                                     */
/*  Seit dem 03.09.2026 stehen die Leistungen als zwei verschieden      */
/*  gebaute Bloecke untereinander und nicht mehr als gleiche Karten in  */
/*  einem Raster. Drei gleiche Karten hatten sich wie eine Vorlage      */
/*  gelesen, und nach dem Wegfall der Werbetafeln standen zwei davon in */
/*  einem Dreierraster. Der Block Webseiten fuehrt das Browserfenster   */
/*  links, der Block Social Media den Beitrag rechts, dazwischen eine   */
/*  Haarlinie, und jeder Block traegt seinen eigenen Ton aus der Rampe. */
/*                                                                     */
/*  Dieselben Sinnbilder stehen als Schaustueck im Kopf der Seite, und  */
/*  deshalb sind sie hier exportiert.                                  */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Browserfenster. Die Zeilen der Seite bauen sich von oben auf. */
export function WebSigil({ playing }: Readonly<{ playing: boolean }>) {
  const rows = [
    { width: "68%", height: 8, tone: "bar" as const },
    { width: "46%", height: 8, tone: "bar" as const },
    { width: "56%", height: 5, tone: "soft" as const },
  ];

  return (
    <div className={styles.sigWeb}>
      <div className={styles.sigWebBar}>
        <span className={styles.sigWebDot} />
        <span className={styles.sigWebDot} />
        <span className={styles.sigWebDot} />
        <span className={styles.sigWebAddr} />
      </div>

      <div className={styles.sigWebBody}>
        {rows.map((row, index) => (
          <motion.span
            key={index}
            className={row.tone === "bar" ? styles.bar : styles.barSoft}
            style={{ width: row.width, height: row.height }}
            initial={playing ? { opacity: 0, x: -14 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 + index * 0.1, ease: EASE }}
          />
        ))}

        <div className={styles.sigWebRow}>
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className={styles.sigWebCard}
              initial={playing ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.42 + index * 0.09,
                ease: EASE,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Beitrag im Hochformat. Er erscheint, dann kommt ein Herz dazu. */
export function SocialSigil({
  playing,
  delay = 0,
}: Readonly<{ playing: boolean; delay?: number }>) {
  return (
    <motion.div
      className={styles.sigPost}
      initial={playing ? { opacity: 0, scale: 0.92, y: 16 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      <div className={styles.postHead}>
        <span className={styles.postAvatar} />
        <span className={styles.postBars}>
          <span className={styles.bar} style={{ width: "54%" }} />
          <span className={styles.barSoft} style={{ width: "32%" }} />
        </span>
      </div>

      <div className={styles.postMedia}>
        <motion.span
          className={styles.postSheen}
          initial={playing ? { x: "-70%", opacity: 0 } : false}
          animate={{ x: "70%", opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, delay: delay + 0.4, ease: EASE }}
        />
      </div>

      <div className={styles.postFoot}>
        <span className={styles.bar} style={{ width: "80%" }} />
      </div>

      <motion.span
        className={styles.sigHeart}
        style={{ right: -14, top: 64 }}
        initial={playing ? { opacity: 0, scale: 0.5, y: 18 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay + 0.85, ease: EASE }}
      >
        <IconHeart />
      </motion.span>
    </motion.div>
  );
}

/**
 * Display auf Standfusz. Ein Streifen wandert einmal ueber den Schirm.
 * Die Werbetafeln sind seit dem 03.09.2026 nicht im Angebot, das
 * Sinnbild bleibt gebaut, damit es beim Wiedereinhaengen der Leistung
 * nur wieder in die Liste unten eingetragen werden muss.
 */
function BoardSigil({ playing }: Readonly<{ playing: boolean }>) {
  return (
    <div className={styles.sigBoard}>
      <div className={styles.sigBoardScreen}>
        <motion.span
          className={styles.sigBoardSheen}
          initial={playing ? { x: "-70%", opacity: 0 } : false}
          animate={{ x: "70%", opacity: [0, 1, 0] }}
          transition={{ duration: 1.9, delay: 0.25, ease: EASE }}
        />

        <span className={styles.sigBoardLines}>
          <motion.span
            className={styles.bar}
            style={{ width: "62%" }}
            initial={playing ? { opacity: 0, x: -12 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          />
          <motion.span
            className={styles.barSoft}
            style={{ width: "40%" }}
            initial={playing ? { opacity: 0, x: -12 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: EASE }}
          />
        </span>
      </div>

      <span className={styles.sigBoardPole} />
      <span className={styles.sigBoardFoot} />
    </div>
  );
}

const SIGILS: Record<
  string,
  (props: Readonly<{ playing: boolean }>) => React.ReactElement
> = {
  web: WebSigil,
  social: SocialSigil,
  dooh: BoardSigil,
};

/* ------------------------------------------------------------------ */
/*  Schaustueck im Kopf                                                */
/*                                                                     */
/*  Die beiden Sinnbilder stehen leicht versetzt uebereinander, das    */
/*  Fenster hinten links, der Beitrag vorn rechts. Sie laufen einmal   */
/*  beim Laden an und bei Beruehrung noch einmal. Das Schaustueck sagt */
/*  ohne ein Wort, welche zwei Wege die Seite meint.                   */
/* ------------------------------------------------------------------ */

export function HeroShow() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const { run, playing, replay } = useScenePlay(host, !reduced);

  return (
    <div
      ref={host}
      className={styles.headShow}
      onPointerEnter={replay}
      aria-hidden="true"
    >
      <span className={styles.headShowGlow} />

      <div className={styles.headShowZoom}>
        <div className={styles.headShowStage} key={run}>
          <div className={styles.headShowWeb}>
            <WebSigil playing={playing} />
          </div>
          <div className={styles.headShowPost}>
            <SocialSigil playing={playing} delay={0.55} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Die Bloecke der Uebersicht                                         */
/* ------------------------------------------------------------------ */

function Block({
  service,
  index,
}: Readonly<{
  service: (typeof marketingPage.services)[number];
  index: number;
}>) {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLAnchorElement>(null);
  const { run, playing, replay } = useScenePlay(host, !reduced);
  const Sigil = SIGILS[service.id] ?? WebSigil;

  return (
    <motion.div
      className={styles.block}
      data-tone={service.id}
      initial={{ opacity: 0, y: reduced ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.3 : 0.8,
        delay: reduced ? 0 : index * 0.06,
        ease: EASE,
      }}
    >
      <Link
        href={service.href}
        className={styles.blockLink}
        ref={host}
        onPointerEnter={replay}
        onFocus={replay}
      >
        <div className={styles.blockStage} aria-hidden="true">
          <span className={styles.blockGlow} />
          <div className={styles.blockZoom}>
            <div key={run}>
              <Sigil playing={playing} />
            </div>
          </div>
        </div>

        <div className={styles.blockText}>
          <h2 className={`t-h2 ${styles.blockName}`}>{service.name}</h2>
          <p className={`t-body-lg ${styles.blockBody}`}>{service.body}</p>

          <span className={styles.blockGo}>
            <span>{service.cta}</span>
            <IconArrow />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ServiceFields() {
  return (
    <section className={styles.fieldsSection} data-shot="leistungen">
      <div className={`shell ${styles.fields}`}>
        {marketingPage.services.map((service, index) => (
          <Block key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
}
