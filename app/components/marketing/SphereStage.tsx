"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { marketingSphere } from "../../copy";
import type { OrbLayout } from "./OrbsCanvas";
import { PALETTE_FULL } from "./OrbsCanvas";
import styles from "./marketing.module.css";
import WordReveal from "./WordReveal";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Kugel-Buehne der Unterseite /marketing                             */
/*                                                                     */
/*  Vorbild ist `dna-ourdna\01_y850.png`. EINE grosse Partikel-Kugel    */
/*  links, die kleine Begleiterin oben links versetzt, rechts daneben   */
/*  der Text. Die Technik kommt unveraendert aus OrbsCanvas, nur die    */
/*  Punktzahl und die Palette werden fuer die Einzelkugel gesetzt.      */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Punkte der grossen Kugel. Sie steht allein und darf dichter sein. */
const MAIN_COUNT = 3200;

/** Koernung der Buehnenkugel. Die Referenz `dna-ourdna\01_y850.png` zeigt
    bei rund 240px Radius viele klar getrennte kleine Punkte und nur
    vereinzelt groessere Baelle. Mit dem Standardbereich der Landing-Kugeln
    verschmelzen die Baelle hier zu Wolken, deshalb der feinere Bereich. */
const SIZE_RANGE = [0.0055, 0.052] as const;

/** Kugelradius aus der Zone. Auf schmalen Spalten begrenzt die Breite.
    Die Referenz zeigt eine Kugel von rund 240px Radius auf 1440px Breite. */
const ORB_OF_WIDTH = 0.38;
const ORB_MAX = 240;

/** Lage der Begleiterin in Kugelradien, oben links versetzt. Die Werte
    treffen die Referenzlage von `dna-ourdna\01_y850.png`. */
const MOON = { dx: -0.795, dy: 0.606, z: 0.2, r: 0.31 } as const;

/** Abstand zwischen Kugeloberflaeche und Begleiterin, in Kugelradien. */
const MOON_GAP = 0.28;

const OrbsCanvas = dynamic(() => import("./OrbsCanvas"), { ssr: false });

export default function SphereStage() {
  const reduced = useSafeReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<OrbLayout[]>([]);
  const [visible, setVisible] = useState(false);

  // Die Lage der Kugel kommt aus der gemessenen DOM-Zone, damit Kugel und
  // Text auf jeder Breite zueinander stehen.
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

  // Ausserhalb des Sichtfelds ruht die Szene.
  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  const still = reduced || !visible;

  return (
    <section className={styles.sphereStage} ref={stage} data-shot="sphere">
      <div className={`shell ${styles.sphereGrid}`}>
        <div className={styles.sphereCanvas} ref={field} aria-hidden="true">
          <motion.div
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: reduced ? 0.3 : 1.1, ease: EASE }}
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

        <div className={styles.sphereZone} ref={zone} aria-hidden="true" />

        <motion.div
          className={styles.sphereText}
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: reduced ? 0.3 : 0.8, delay: 0.24, ease: EASE }}
        >
          <WordReveal as="h2" className="t-h2" text={marketingSphere.title} />
          <p className={`t-body-lg ${styles.sphereBody}`}>
            {marketingSphere.body}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
