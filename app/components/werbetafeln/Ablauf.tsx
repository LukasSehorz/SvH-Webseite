"use client";

/* S5 So laeuft es ab. Drei Schritte untereinander, jeder mit groszer
   Ziffer in Inter Tight im Verlauf und einem Satz.

   Links laeuft eine duenne senkrechte Linie mit, die sich am Scrollstand
   von oben nach unten fuellt. Jeder Schritt hellt auf, sobald die Linie
   ihn erreicht, und es leuchtet immer nur einer, weil die Schritte
   aufeinander aufbauen. Der Fliesztext bleibt dabei durchgehend hell
   genug zum Lesen, gedaempft werden nur Ziffer, Ueberschrift und Punkt.

   An der Tafel dieser Sektion sitzen die Beschriftungsfahnen nach M6.
   Sie sagen in Alltagsworten, was die Tafel ist und wer sie befuellt, und
   sie nennen nur Angaben, die belegt sind.

   Hier steht keine Dauer in Tagen, kein Preis und kein Zeitraum. */

import { useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import Rise from "./Rise";
import Stele from "./Stele";
import { Icon } from "./Icons";
import type { SpotDaten } from "./Spot";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export default function Ablauf({ spot }: Readonly<{ spot: SpotDaten }>) {
  const reduced = useSafeReducedMotion();
  const listeRef = useRef<HTMLOListElement>(null);
  const [aktiv, setAktiv] = useState(-1);

  const lauf = useScroll({
    target: listeRef,
    offset: ["start 0.78", "end 0.62"],
  });
  const fuellung = useTransform(lauf.scrollYProgress, [0, 1], [0, 1]);

  const anzahl = t.ablauf.steps.length;

  useMotionValueEvent(fuellung, "change", (wert) => {
    setAktiv(wert <= 0 ? -1 : Math.min(anzahl - 1, Math.floor(wert * anzahl)));
  });

  return (
    <section className={styles.ablauf} id="ablauf" aria-labelledby="werbetafeln-ablauf">
      <div className="shell">
        <div className={styles.sectionHead}>
          <Rise>
            <h2 id="werbetafeln-ablauf" className={styles.sectionTitle}>
              {t.ablauf.titleBefore}{" "}
              <span className="grad-word">{t.ablauf.titleWord}</span>{" "}
              {t.ablauf.titleAfter}
            </h2>
          </Rise>
        </div>

        <div className={styles.ablaufGrid}>
          <div className={styles.stepsWrap}>
            {/* Die Linie steht neben der Liste und nicht in ihr, weil in
                eine Liste nur Listenpunkte gehoeren. */}
            <span className={styles.stepsRail} aria-hidden="true">
              <motion.span
                className={styles.stepsFill}
                style={{ "--fill": reduced ? 1 : fuellung } as CSSProperties}
              />
            </span>

            <ol ref={listeRef} className={styles.steps}>
              {t.ablauf.steps.map((step, index) => (
                <li
                  key={step.head}
                  className={styles.step}
                  data-on={reduced || index === aktiv ? "true" : undefined}
                >
                  <span className={styles.stepDot} aria-hidden="true" />
                  <div>
                    <span className={styles.stepNum} aria-hidden="true">
                      <span className="grad-word">{index + 1}</span>
                    </span>
                    <h3 className={styles.stepHead}>{step.head}</h3>
                    <p className={`t-body ${styles.stepBody}`}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.ablaufStage}>
            <Stele
              spot={spot}
              className={styles.ablaufStele}
              bloom={70}
              neigung={5}
            />

            <span className={styles.flags}>
              {t.ablauf.flags.map((flag, index) => (
                <span
                  key={flag.icon}
                  className={`${styles.flag} ${styles[`flag${index}`]}`}
                >
                  <Icon name={flag.icon} />
                  {flag.text}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
