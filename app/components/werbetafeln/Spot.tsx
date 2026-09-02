/* Der gezeichnete Spot. Er ist das, was SVH herstellt, und laeuft auf dem
   Schirm der Tafel. Es gibt keine echten Aufnahmen von SVH-Tafeln, und
   ein Foto auf dem Schirm wuerde nur eines der drei Stockbilder ein
   viertes Mal zeigen. Der gezeichnete Spot zeigt stattdessen Arbeit, und
   er nennt weder einen Betrieb noch einen Preis noch einen Zeitraum. */
import type { CSSProperties } from "react";
import styles from "./werbetafeln.module.css";

export type SpotDaten = Readonly<{
  id: string;
  word: string;
  line: string;
  foot: string;
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

export default function Spot({ spot }: Readonly<{ spot: SpotDaten }>) {
  return (
    <div
      className={styles.spot}
      style={{ "--tone": TOENE[spot.id] ?? "#7c6aff" } as CSSProperties}
      role="img"
      aria-label={spot.alt}
    >
      <span className={styles.spotBar} aria-hidden="true" />
      <span className={styles.spotMid}>
        <span className={styles.spotWord}>{spot.word}</span>
        <span className={styles.spotRule} aria-hidden="true" />
        <span className={styles.spotLine}>{spot.line}</span>
      </span>
      <span className={styles.spotFoot}>{spot.foot}</span>
    </div>
  );
}
