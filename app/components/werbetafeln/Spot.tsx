"use client";

/* Der Spot. Er ist das, was SVH herstellt, und laeuft auf dem Schirm der
   Tafel. Der Grund ist ein erzeugtes Motiv aus public/tafeln, dessen
   unteres Drittel frei bleibt, und darueber setzt diese Seite Wort,
   Linie und Fusz. Kein Betrieb, kein Preis und kein Zeitraum steht
   darauf.

   Wo eine Videodatei vorliegt, laeuft im Hero das Video statt des
   Bildes. Das Bild ist dann sein Standbild, damit vor dem ersten
   Bildaufbau nichts Schwarzes steht. Bei ruhiger Bewegung bleibt es beim
   Bild.

   Die untere Flaeche steht in fast Weisz. Sie traegt die Worte und
   sorgt zugleich dafuer, dass der Schirm der hellste Punkt der Seite
   bleibt, denn das Motiv darueber ist dunkel gehalten. */

import Image from "next/image";
import type { CSSProperties } from "react";
import { useSafeReducedMotion } from "../system/ui";
import { Icon } from "./Icons";
import styles from "./werbetafeln.module.css";

export type SpotDaten = Readonly<{
  id: string;
  word: string;
  line: string;
  foot: string;
  bild: string;
  video: string;
  alt: string;
}>;

/* Jede Ortsart bekommt eine eigene Abstufung des Akzents, damit drei
   Spots nebeneinander erkennbar drei verschiedene Betriebe sind. */
const TOENE: Record<string, string> = {
  gym: "#5b8cff",
  event: "#6a7cff",
  restaurant: "#7c6aff",
  club: "#b9a5ff",
};

const ZEICHEN: Record<string, string> = {
  gym: "hantel",
  restaurant: "besteck",
  club: "note",
  event: "fahne",
};

export default function Spot({
  spot,
  bewegt = false,
  groesze = "300px",
}: Readonly<{ spot: SpotDaten; bewegt?: boolean; groesze?: string }>) {
  const reduced = useSafeReducedMotion();
  const zeigtVideo = bewegt && !reduced;

  return (
    <div
      className={styles.spot}
      style={{ "--tone": TOENE[spot.id] ?? "#7c6aff" } as CSSProperties}
      role="img"
      aria-label={spot.alt}
    >
      <span className={styles.spotGrund} aria-hidden="true">
        {zeigtVideo ? (
          <video
            className={styles.spotVideo}
            src={spot.video}
            poster={spot.bild}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <Image src={spot.bild} alt="" fill sizes={groesze} />
        )}
      </span>

      <span className={styles.spotBar} aria-hidden="true" />

      <span className={styles.spotZeichen} aria-hidden="true">
        <Icon name={ZEICHEN[spot.id] ?? "fahne"} />
      </span>

      <span className={styles.spotUnten}>
        <span className={styles.spotWord}>{spot.word}</span>
        <span className={styles.spotRule} aria-hidden="true" />
        <span className={styles.spotLine}>{spot.line}</span>
      </span>

      <span className={styles.spotFoot}>{spot.foot}</span>
    </div>
  );
}
