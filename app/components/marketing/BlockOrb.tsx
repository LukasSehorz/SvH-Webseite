"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { OrbLayout } from "./OrbsCanvas";
import styles from "./marketing.module.css";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Kugel-Praesenz je Leistungsblock                                   */
/*                                                                     */
/*  Vorbild ist die Verteilung ueber die Referenzseite                  */
/*  (dna-seite-verteilung). Dort steht auf fast jeder Sektion eine      */
/*  Kugel, meist am Viewport-Rand angeschnitten, die randabgewandte     */
/*  Haelfte deutlich transparenter. Die Kugel liegt hinter dem Text,    */
/*  die Lesbarkeit hat Vorrang.                                        */
/* ------------------------------------------------------------------ */

const OrbsCanvas = dynamic(() => import("./OrbsCanvas"), { ssr: false });

/** Punkte je Blockkugel. Deutlich sparsamer als die Buehne. */
const COUNT = 1400;

/** Koernung wie auf der Buehne, damit die Kugeln der Seite zusammen
    gehoeren. Etwas groeber, weil die Blockkugeln kleiner erscheinen. */
const SIZE_RANGE = [0.007, 0.058] as const;

export type OrbSide = "left" | "right";

export default function BlockOrb({
  side,
  size,
  palette,
  offsetY = 0.5,
}: Readonly<{
  side: OrbSide;
  /** Kugelradius als Anteil der Zonenbreite. */
  size: number;
  palette: number;
  /** Senkrechte Lage in der Zone, 0 oben bis 1 unten. */
  offsetY?: number;
}>) {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<OrbLayout[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    let previous = "";
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;

      const radius = rect.width * size;
      // Die Kugel wird am Rand angeschnitten. Ihre Mitte liegt knapp
      // ausserhalb der Zone, sodass nur die zugewandte Haelfte steht.
      const x = side === "left" ? -0.06 : 1.06;

      const next: OrbLayout[] = [
        {
          x,
          y: offsetY,
          r: radius / rect.height,
          moon: { x: 0, y: 0, z: 0, r: 0 },
        },
      ];

      const signature = `${x}:${offsetY}:${next[0].r.toFixed(4)}`;
      if (signature === previous) return;
      previous = signature;
      setLayout(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [side, size, offsetY]);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={host}
      className={`${styles.blockOrb} ${side === "left" ? styles.blockOrbLeft : styles.blockOrbRight}`}
      aria-hidden="true"
    >
      <OrbsCanvas
        layout={layout}
        hovered={null}
        still={reduced || !visible}
        mainCount={COUNT}
        palette={palette}
        sizeRange={SIZE_RANGE}
      />
    </div>
  );
}
