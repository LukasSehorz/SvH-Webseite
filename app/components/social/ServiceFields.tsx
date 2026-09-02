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
/*  Die drei Leistungen auf der Uebersicht                             */
/*                                                                     */
/*  Jedes Feld traegt ein kleines bewegtes Sinnbild aus der Welt, in    */
/*  die es fuehrt. Ein Browserfenster fuer die Webseiten, ein Beitrag   */
/*  im Hochformat fuer Social Media, ein Display auf Standfusz fuer die */
/*  Werbetafeln. Bei Beruehrung laeuft das Sinnbild erneut an, damit    */
/*  der Unterschied zwischen den drei Welten spuerbar wird, bevor man   */
/*  klickt.                                                            */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Browserfenster. Die Zeilen der Seite bauen sich von oben auf. */
function WebSigil({ playing }: Readonly<{ playing: boolean }>) {
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
function SocialSigil({ playing }: Readonly<{ playing: boolean }>) {
  return (
    <motion.div
      className={styles.sigPost}
      initial={playing ? { opacity: 0, scale: 0.92, y: 16 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
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
          transition={{ duration: 1.6, delay: 0.4, ease: EASE }}
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
        transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
      >
        <IconHeart />
      </motion.span>
    </motion.div>
  );
}

/** Display auf Standfusz. Ein Streifen wandert einmal ueber den Schirm. */
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

function Field({
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
      initial={{ opacity: 0, y: reduced ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.3 : 0.8,
        delay: reduced ? 0 : index * 0.09,
        ease: EASE,
      }}
      style={{ display: "flex" }}
    >
      <Link
        href={service.href}
        className={styles.field}
        ref={host}
        onPointerEnter={replay}
        onFocus={replay}
        style={{ flex: "1 1 auto" }}
      >
        <div className={styles.sigil} aria-hidden="true">
          <div key={run}>
            <Sigil playing={playing} />
          </div>
        </div>

        <h2 className={`t-h2 ${styles.fieldName}`}>{service.name}</h2>
        <p className={`t-body ${styles.fieldBody}`}>{service.body}</p>

        <span className={styles.fieldGo}>
          <span>{service.cta}</span>
          <IconArrow />
        </span>
      </Link>
    </motion.div>
  );
}

export default function ServiceFields() {
  return (
    <section className="section" data-shot="leistungen">
      <div className={`shell ${styles.fields}`}>
        {marketingPage.services.map((service, index) => (
          <Field key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
}
