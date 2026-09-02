"use client";

/* M1. Das Feld aus schwebenden Oberflaechen hinter der Ueberschrift.
   Es besteht aus den Startbildern der vier echten Kundenseiten, jedes
   mehrfach und jedes Mal mit einem anderen Ausschnitt.

   Der Kern der Sache ist die Deckkraft. Auf hellem Grund darf ein Feld
   aus hellen Kacheln stehen, auf #050507 nicht. Inn Natur ist fast
   weisz und wuerde die Ueberschrift ueberstrahlen, Taxi IZI ist fast
   schwarz und wuerde im Grund verschwinden. Deshalb traegt jede Kachel
   eine eigene Grunddeckkraft, die aus der Helligkeit ihres Bildes
   kommt, und jede Kachel hat einen Schein dahinter, damit auch die
   dunklen als Fenster lesbar bleiben. */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import s from "./webseiten.module.css";

type Tile = {
  bild: string;
  /* Lage in Prozent der Feldbreite und Feldhoehe. */
  x: number;
  y: number;
  /* Breite in Bildpunkten, mitwachsend begrenzt. */
  w: number;
  /* Tiefe eins liegt vorn und wandert am schnellsten. */
  tiefe: 1 | 2 | 3;
  /* Grunddeckkraft, aus der Helligkeit des Bildes abgeleitet. */
  deckkraft: number;
  dreh: number;
  /* Ausschnitt, damit dasselbe Bild zweimal nicht gleich aussieht. */
  pos: string;
  schein: string;
  /* Auf schmalen Schirmen ausgeblendet. */
  klein?: boolean;
};

/* Gemessene Grunddeckkraft je Kundenseite. Inn Natur steht am tiefsten,
   Taxi IZI am hoechsten, weil das Bild selbst fast schwarz ist. */
const TILES: readonly Tile[] = [
  // Tiefe 3, klein, langsam, am blassesten.
  { bild: "brandhuber", x: 1, y: 7, w: 196, tiefe: 3, deckkraft: 0.17, dreh: -5, pos: "30% 40%", schein: "#5b8cff", klein: true },
  { bild: "innnatur", x: 85, y: 11, w: 188, tiefe: 3, deckkraft: 0.12, dreh: 4, pos: "70% 30%", schein: "#b9a5ff", klein: true },
  { bild: "taxi-izi", x: 7, y: 73, w: 178, tiefe: 3, deckkraft: 0.24, dreh: 5, pos: "20% 60%", schein: "#7c6aff", klein: true },
  { bild: "world-of-less", x: 79, y: 76, w: 206, tiefe: 3, deckkraft: 0.16, dreh: -4, pos: "80% 70%", schein: "#5b8cff", klein: true },

  // Tiefe 2, mittel.
  { bild: "world-of-less", x: 12, y: 22, w: 248, tiefe: 2, deckkraft: 0.19, dreh: 3, pos: "40% 20%", schein: "#5b8cff" },
  { bild: "taxi-izi", x: 67, y: 18, w: 262, tiefe: 2, deckkraft: 0.28, dreh: -3, pos: "60% 50%", schein: "#7c6aff" },
  { bild: "innnatur", x: 18, y: 61, w: 236, tiefe: 2, deckkraft: 0.13, dreh: -6, pos: "20% 80%", schein: "#b9a5ff", klein: true },
  { bild: "brandhuber", x: 61, y: 64, w: 252, tiefe: 2, deckkraft: 0.2, dreh: 4, pos: "70% 60%", schein: "#7c6aff" },

  // Tiefe 1, grosz, schnell, am hellsten von den dunklen Bildern.
  { bild: "taxi-izi", x: 33, y: 1, w: 296, tiefe: 1, deckkraft: 0.3, dreh: 2, pos: "50% 30%", schein: "#5b8cff" },
  { bild: "brandhuber", x: -4, y: 38, w: 282, tiefe: 1, deckkraft: 0.22, dreh: -3, pos: "60% 70%", schein: "#7c6aff", klein: true },
  { bild: "world-of-less", x: 81, y: 40, w: 298, tiefe: 1, deckkraft: 0.19, dreh: 3, pos: "30% 50%", schein: "#5b8cff", klein: true },
];

export default function HeroField() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useSafeReducedMotion();

  /* Die Kopplung laeuft vom Beginn der Sektion bis zu dem Punkt, an dem
     ihr unteres Ende die Oberkante des Schirms erreicht. Sie gilt in
     beide Richtungen, weil sie nur eine Umrechnung ist und kein Ablauf. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -168]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -104]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -54]);
  const wegblenden = useTransform(scrollYProgress, [0, 0.9], [1, 0.25]);

  const stufen = { 1: y1, 2: y2, 3: y3 } as const;

  return (
    <motion.div
      ref={ref}
      className={s.heroField}
      style={{ opacity: reduced ? 1 : wegblenden }}
      /* Das Feld wiederholt, was weiter unten mit Alternativtext steht.
         Ein Vorleseprogramm soll hier nicht elf Bilder ansagen. */
      aria-hidden="true"
    >
      {TILES.map((t, i) => (
        <motion.div
          key={`${t.bild}-${i}`}
          className={`${s.tile} ${t.klein ? s.tileSmallHide : ""}`}
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `min(${t.w}px, ${((t.w / 1440) * 200).toFixed(1)}vw)`,
            aspectRatio: "16 / 10",
            opacity: t.deckkraft,
            rotate: t.dreh,
            y: reduced ? 0 : stufen[t.tiefe],
          }}
        >
          <span
            className={s.tileGlow}
            style={{
              inset: "-26%",
              background: t.schein,
              opacity: t.tiefe === 1 ? 0.5 : 0.36,
            }}
          />
          <span className={s.tileClip}>
            <img
              src={`/referenzen/${t.bild}-hero.webp`}
              alt=""
              width={1200}
              height={750}
              loading="eager"
              decoding="async"
              style={{ objectPosition: t.pos }}
            />
          </span>
          <span className={s.tileEdge} />
        </motion.div>
      ))}
    </motion.div>
  );
}
