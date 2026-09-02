"use client";

/* S4 Was auf der Tafel laeuft. Zwei Teile untereinander.

   Oben der Faecher nach M7. Die vier Inhaltsarten gehen am Scrollstand
   auf, jede Karte in einer eigenen Abstufung des Akzents. Die Bewegung
   haengt am Scrollstand nach M4 und steht still, wenn der Besucher steht.

   Unten die Tafel grosz vor der unscharfen Wand aus vielen kleinen
   Ausschnitten nach M8. Die Wand ist das Rohmaterial, der scharfe Schirm
   davor ist das fertige Ergebnis. Daneben liegt die helle Textkarte, die
   die dunkle Medienkarte um wenige Bildpunkte ueberlappt, nach M12. Sie
   ist zugleich das einzige helle Band der ganzen Seite nach M15.

   Die Wand traegt die zweite der drei Schleifen. Sie wandert langsam in
   einer eigenen Schleife und bekommt zusaetzlich eine Verschiebung gegen
   die Scrollrichtung, hoechstens vierzig Bildpunkte auf einer ganzen
   Bildschirmhoehe. Beide Verschiebungen liegen ueber der Unschaerfe,
   damit die unscharfe Ebene einmal gerechnet und danach nur noch
   zusammengesetzt wird. */

import { useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import Rise from "./Rise";
import Stele from "./Stele";
import { Icon } from "./Icons";
import type { SpotDaten } from "./Spot";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

/* Der Winkel jeder Faecherkarte im geoeffneten Zustand. */
const WINKEL = [-40, -13.5, 13.5, 40];
/* Der Ruhewinkel. Geschlossen liegen die Karten als Stapel und nicht
   deckungsgleich uebereinander. */
const WINKEL_RUHE = [-7, -2.4, 2.4, 7];
const TOENE = ["#5b8cff", "#6a7cff", "#7c6aff", "#b9a5ff"];

/* Die Ausschnitte der Wand. Die Werte sind aus dem Zaehlindex gerechnet
   und nicht gewuerfelt, damit Server und Browser dasselbe Bild bauen. */
const KACHELN = 112;

function streu(n: number): number {
  const wert = Math.sin(n * 127.1) * 43758.5453;
  return wert - Math.floor(wert);
}

export default function Inhalte({ spots }: Readonly<{ spots: readonly SpotDaten[] }>) {
  const reduced = useSafeReducedMotion();

  const fanRef = useRef<HTMLDivElement>(null);
  const wandRef = useRef<HTMLDivElement>(null);
  const [zweiter, setZweiter] = useState(false);

  const fanLauf = useScroll({
    target: fanRef,
    offset: ["start 0.95", "start 0.42"],
  });
  const fan = useTransform(fanLauf.scrollYProgress, [0, 1], [0, 1]);

  const wandLauf = useScroll({
    target: wandRef,
    offset: ["start end", "end start"],
  });
  const wy = useTransform(wandLauf.scrollYProgress, [0, 1], ["-20px", "20px"]);

  /* Auf dem Schirm wechselt der Inhalt genau einmal, wenn die Sektion die
     Mitte des Fensters erreicht. */
  useMotionValueEvent(wandLauf.scrollYProgress, "change", (wert) => {
    setZweiter(wert > 0.5);
  });

  const kacheln = Array.from({ length: KACHELN }, (_, i) => {
    const a = streu(i + 1);
    const b = streu(i + 91);
    const c = streu(i + 311);
    const von = TOENE[Math.floor(a * TOENE.length)];
    const bis = TOENE[Math.floor(b * TOENE.length)];
    return {
      key: i,
      style: {
        background: `linear-gradient(${Math.round(c * 320)}deg, ${von} 0%, ${bis} 100%)`,
        opacity: 0.22 + a * 0.68,
        gridRow: b > 0.82 ? "span 2" : undefined,
      } as CSSProperties,
    };
  });

  return (
    <section className={styles.inhalte} aria-labelledby="werbetafeln-inhalte">
      <div className="shell">
        <div className={styles.sectionHead}>
          <Rise>
            <h2 id="werbetafeln-inhalte" className={styles.sectionTitle}>
              {t.inhalte.titleBefore}{" "}
              <span className="grad-word">{t.inhalte.titleWord}</span>
            </h2>
          </Rise>
          <Rise delay={0.1}>
            <p className={`t-body-lg ${styles.sectionLead}`}>{t.inhalte.lead}</p>
          </Rise>
        </div>

        <motion.div
          ref={fanRef}
          className={styles.fanWrap}
          style={{ "--fan": reduced ? 1 : fan } as CSSProperties}
        >
          {t.inhalte.faecher.map((karte, index) => (
            <div
              key={karte.icon}
              className={styles.fanCard}
              style={
                {
                  "--a": WINKEL[index],
                  "--a0": WINKEL_RUHE[index],
                  "--tone": TOENE[index],
                  zIndex: index,
                } as CSSProperties
              }
            >
              <span className={styles.fanIcon}>
                <Icon name={karte.icon} />
              </span>
              <span className={styles.fanWord}>{karte.wort}</span>
            </div>
          ))}
        </motion.div>

        <Rise>
          <p className={styles.fanNote}>{t.inhalte.faecherNote}</p>
        </Rise>

        <div className={styles.inhalteStage}>
          <Rise className={styles.lichtKarte}>
            <h3 className={styles.lichtTitle}>{t.inhalte.karte.title}</h3>
            <p className={styles.lichtBody}>{t.inhalte.karte.body}</p>
          </Rise>

          <div
            ref={wandRef}
            className={styles.wandKarte}
            role="img"
            aria-label={t.inhalte.wandLabel}
          >
            <div className={styles.wandDrift}>
              <motion.div
                className={styles.wandShift}
                style={{ "--wy": reduced ? "0px" : wy } as CSSProperties}
              >
                <div className={styles.wandGrid}>
                  {kacheln.map((kachel) => (
                    <span
                      key={kachel.key}
                      className={styles.wandTile}
                      style={kachel.style}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <span className={styles.wandVignette} aria-hidden="true" />

            <Stele
              spot={spots[zweiter ? 1 : 0]}
              className={styles.wandStele}
              bloom={74}
              neigung={4}
              mitTeppich={false}
              mitFusz={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
