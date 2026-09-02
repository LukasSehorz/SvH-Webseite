"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { OrbLayout } from "../marketing/OrbsCanvas";
import { PALETTE_FULL } from "../marketing/OrbsCanvas";
import { GradientWord, Reveal, useSafeReducedMotion } from "../system/ui";
import { socialPage } from "../../copy";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  Seitenkopf mit der Partikelkugel                                   */
/*                                                                     */
/*  Die Kugel-Welt der frueheren Marketingseite gehoert jetzt zu Social */
/*  Media und traegt hier den ersten Bildschirm. Technik und Koernung   */
/*  kommen unveraendert aus OrbsCanvas, nur die Lage wird aus dem DOM   */
/*  gemessen, damit Kugel und Ueberschrift auf jeder Bildbreite         */
/*  zueinander stehen.                                                 */
/*                                                                     */
/*  Auf der ganzen Seite laeuft genau diese eine Leinwand. WebGL ist    */
/*  teuer, und eine zweite Instanz wuerde auf schwachen Geraeten die    */
/*  Bildrate der uebrigen Szenen kosten.                               */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Punkte der Kugel. Sie steht allein und darf dicht sein. */
const MAIN_COUNT = 3200;

/** Koernung der Buehnenkugel, uebernommen aus der bisherigen Kugelbuehne. */
const SIZE_RANGE = [0.0055, 0.052] as const;

/** Kugelradius aus der gemessenen Zone. Auf schmalen Spalten begrenzt
    die Breite, auf breiten die Obergrenze. */
const ORB_OF_WIDTH = 0.38;
const ORB_MAX = 240;

/** Lage der Begleiterin in Kugelradien, oben links versetzt. */
const MOON = { dx: -0.795, dy: 0.606, z: 0.2, r: 0.31 } as const;

/** Abstand zwischen Kugeloberflaeche und Begleiterin, in Kugelradien. */
const MOON_GAP = 0.28;

const OrbsCanvas = dynamic(() => import("../marketing/OrbsCanvas"), {
  ssr: false,
});

export default function SocialHero() {
  const reduced = useSafeReducedMotion();
  const section = useRef<HTMLElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<OrbLayout[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = field.current;
    const target = zone.current;
    if (!host || !target) return;

    let previous = "";

    const measure = () => {
      const base = host.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      if (base.width < 2 || base.height < 2) return;

      const cx = rect.left - base.left + rect.width / 2;
      const cy = rect.top - base.top + rect.height / 2;
      const radius = Math.min(rect.width * ORB_OF_WIDTH, ORB_MAX);
      const away = 1 + MOON.r + MOON_GAP;

      const next: OrbLayout[] = [
        {
          x: cx / base.width,
          y: cy / base.height,
          r: radius / base.height,
          moon: {
            x: MOON.dx * away,
            y: MOON.dy * away,
            z: MOON.z,
            r: MOON.r,
          },
        },
      ];

      const signature = `${next[0].x.toFixed(4)}:${next[0].y.toFixed(4)}:${next[0].r.toFixed(4)}`;
      if (signature === previous) return;
      previous = signature;
      setLayout(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Ausserhalb des Sichtfelds ruht die Leinwand und verbraucht nichts.
  useEffect(() => {
    const host = section.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const still = reduced || !visible;

  return (
    <section className={styles.hero} ref={section} data-shot="hero">
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCanvas} ref={field} aria-hidden="true">
          <motion.div
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 1.2, ease: EASE }}
          >
            <OrbsCanvas
              layout={layout}
              hovered={null}
              still={still}
              mainCount={MAIN_COUNT}
              palette={PALETTE_FULL}
              sizeRange={SIZE_RANGE}
            />
          </motion.div>
        </div>

        <div className={styles.heroZone} ref={zone} aria-hidden="true" />

        <div className={styles.heroText}>
          <Reveal>
            {/* Zwei Zeilen als eigene Bloecke. So faellt der Umbruch auf
                jeder Bildbreite an derselben Stelle, statt sich mit der
                Spaltenbreite zu verschieben. */}
            <h1 className={`t-h1 ${styles.heroTitle}`}>
              <span className={styles.heroLine}>
                {socialPage.hero.titleLine1}
              </span>
              <span className={styles.heroLine}>
                {socialPage.hero.titleLine2}{" "}
                <GradientWord>{socialPage.hero.gradientWord}</GradientWord>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className={`t-body-lg ${styles.heroLead}`}>
              {socialPage.hero.lead}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className={styles.heroActions}>
              <Link href={socialPage.hero.cta.href} className="btn-solid">
                {socialPage.hero.cta.label}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
