"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ====================================================================
   Werkzeugkasten der kleinen Szenen.

   Eine Szene ist eine Folge von Etappen. Sie laeuft einmal an, bleibt
   danach in ihrem letzten Bild stehen und startet erst wieder, wenn der
   Besucher die Kachel beruehrt oder sie mit der Tastatur ansteuert. Nach
   dem Eintritt ist die Sektion deshalb ruhig, und jede Bewegung hat
   einen Anlass.

   Etappe 0 ist immer der Ruecksprung. Bei einem erneuten Anlauf faellt
   die Szene darin in ihren Anfang zurueck, und weil dafuer eine sehr
   kurze Dauer gilt, wirkt das wie ein Zuruecknehmen und nicht wie ein
   rueckwaerts abgespieltes Band.
   ==================================================================== */

/** Exponentiell ausklingend. Der Grundton aller Uebergaenge. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/**
 * Einrasten fuer Haken, Stempel und Bausteine.
 *
 * Der Wert schwingt bewusst nur wenig ueber. Ein kraeftiger Rueckprall
 * wirkt nach Spielzeug, ein knappes Anhalten dagegen nach Mechanik, die
 * sitzt. Alles andere klingt exponentiell aus.
 */
export const POP: [number, number, number, number] = [0.3, 1.26, 0.48, 1];
/** Traeges Anheben fuer wachsende Balken. */
export const LIFT: [number, number, number, number] = [0.16, 0.86, 0.26, 1];

/** Dauer des Ruecksprungs. Etappe 0 muss laenger sein als dieser Wert. */
const BACK_S = 0.17;

/* ------------------------------------------------------------------ */
/*  Farben                                                             */
/* ------------------------------------------------------------------ */

/* Kacheln stehen auf dem dunklen Grund der Seite. */
export const HAIR = "rgba(244,244,246,.16)";
export const HAIR_SOFT = "rgba(244,244,246,.10)";
export const PLATE = "rgba(244,244,246,.055)";
export const PLATE_DIM = "rgba(244,244,246,.028)";
export const BAR = "rgba(244,244,246,.34)";
export const BAR_SOFT = "rgba(244,244,246,.19)";
export const GLYPH = "rgba(244,244,246,.44)";
export const DEEP = "#0B0B10";

/* Die Schritte stehen auf der violetten Flaeche des Ablauf-Feldes. */
export const P_HAIR = "rgba(255,255,255,.22)";
export const P_HAIR_SOFT = "rgba(255,255,255,.12)";
export const P_PLATE = "rgba(255,255,255,.06)";
export const P_BAR = "rgba(255,255,255,.28)";
export const P_BAR_SOFT = "rgba(255,255,255,.16)";
export const P_DEEP = "#171334";

/* ------------------------------------------------------------------ */
/*  Takt                                                               */
/* ------------------------------------------------------------------ */

/**
 * Fuehrt eine Szene einmal durch ihre Etappen und laesst sie danach
 * stehen. Ein neuer `playKey` setzt sie auf Etappe 0 zurueck und startet
 * sie erneut. Bei reduzierter Bewegung steht sofort das letzte Bild.
 *
 * Der Takt haengt an verketteten Zeitgebern statt an einem Bildtakt,
 * weil zwischen zwei Etappen mehrere hundert Millisekunden lang nichts
 * zu rechnen ist.
 */
export function useScene(
  steps: readonly number[],
  playKey: number,
  reduced: boolean,
  idleAtRest: boolean
): number {
  const last = steps.length;
  const [stage, setStage] = useState(idleAtRest ? steps.length : 0);

  useEffect(() => {
    if (reduced) {
      setStage(last);
      return;
    }
    if (playKey === 0) {
      setStage(idleAtRest ? last : 0);
      return;
    }

    setStage(0);
    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const advance = () => {
      index += 1;
      setStage(index);
      if (index < last) timer = setTimeout(advance, steps[index]);
    };
    timer = setTimeout(advance, steps[0]);

    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [steps, playKey, reduced, last, idleAtRest]);

  return stage;
}

/** Gesamtdauer einer Szene samt Nachlauf der letzten Blende. */
export function totalOf(steps: readonly number[]): number {
  return steps.reduce((sum, value) => sum + value, 0) + 520;
}

/**
 * Zaehler fuer erneute Anlaeufe. Ein Anlauf waehrend einer laufenden
 * Szene wird verworfen, damit ein schneller Zeiger ueber dem Raster
 * keine abgehackte Kette aus Neustarts ausloest.
 */
export function useReplay(total: number) {
  const [playKey, setPlayKey] = useState(0);
  const lastRun = useRef(Number.NEGATIVE_INFINITY);

  const play = useCallback(() => {
    const now =
      typeof performance === "undefined" ? Date.now() : performance.now();
    if (now - lastRun.current < total) return;
    lastRun.current = now;
    setPlayKey((key) => key + 1);
  }, [total]);

  return { playKey, play };
}

export type Tween = Readonly<{
  duration: number;
  ease: [number, number, number, number];
  delay?: number;
}>;

/**
 * Uebergang einer Szene. Waehrend des Ruecksprungs gilt fuer alles die
 * gleiche kurze Dauer ohne Verzoegerung, sonst der eigene Wert.
 *
 * `idleAtRest` entscheidet, was vor dem ersten Anlauf zu sehen ist. Eine
 * Kachel startet leer, weil ihre Szene beim Eintritt sofort anlaeuft.
 * Ein Schritt des Ablaufs steht dagegen im Endbild, denn er wartet
 * moeglicherweise lange darauf, wach zu werden, und ein leerer Rahmen
 * saehe in dieser Zeit kaputt aus.
 */
export function useBeat(
  steps: readonly number[],
  playKey: number,
  reduced: boolean,
  idleAtRest = false
) {
  const stage = useScene(steps, playKey, reduced, idleAtRest);
  const back = stage === 0;

  const t = (
    duration: number,
    ease: [number, number, number, number] = EASE,
    delay = 0
  ): Tween =>
    back ? { duration: BACK_S, ease: EASE } : { duration, ease, delay };

  return { stage, back, t };
}

/* ------------------------------------------------------------------ */
/*  Bausteine                                                          */
/* ------------------------------------------------------------------ */

/** Eindeutige, fuer `url(#…)` taugliche Kennung je Instanz. */
export function useSceneId(): string {
  const raw = useId();
  return useMemo(() => `s${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`, [raw]);
}

/**
 * Rampe waagerecht, Rampe aufwaerts und der weiche Farbnebel.
 *
 * Die beiden Rampen spannen sich ueber das ganze Feld statt ueber jedes
 * einzelne Teil. Das hat zwei Gruende. Ein waagerechter Strich hat keine
 * Hoehe, und ein Verlauf, der sich nach dem Teil richtet, faellt dort in
 * sich zusammen und wird grau. Und ueber das Feld gespannt wirkt die
 * Rampe wie ein Licht, das von links nach rechts durch die ganze Szene
 * faellt, statt wie ein Muster, das jedes Teil fuer sich wiederholt.
 */
export function Defs({
  id,
  w,
  h,
}: Readonly<{ id: string; w: number; h: number }>) {
  return (
    <defs>
      <linearGradient
        id={id}
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={0}
        x2={w}
        y2={0}
      >
        <stop offset="0%" stopColor="#5B8CFF" />
        <stop offset="48%" stopColor="#7C6AFF" />
        <stop offset="100%" stopColor="#B9A5FF" />
      </linearGradient>
      <linearGradient
        id={`${id}-up`}
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={h}
        x2={0}
        y2={0}
      >
        <stop offset="0%" stopColor="#5B8CFF" />
        <stop offset="55%" stopColor="#7C6AFF" />
        <stop offset="100%" stopColor="#B9A5FF" />
      </linearGradient>
      <radialGradient id={`${id}-fog`}>
        <stop offset="0%" stopColor="#7C6AFF" stopOpacity="0.5" />
        <stop offset="42%" stopColor="#5B8CFF" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/**
 * Zeichenflaeche einer Szene.
 *
 * `slice` statt `meet`, damit die Szene den Rahmen bei jeder Breite
 * fuellt. Alles Wesentliche liegt deshalb in der Mitte, und nur Nebel,
 * Raster und Schienen laufen bis ueber den Rand hinaus.
 */
export function Stage({
  viewBox,
  children,
}: Readonly<{ viewBox: string; children: React.ReactNode }>) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Farbnebel der Szene. Er kommt spaet und bleibt leise. */
export function Fog({
  id,
  cx,
  cy,
  rx,
  ry,
  on,
  strength = 1,
  t,
}: Readonly<{
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  on: boolean;
  strength?: number;
  t: (d: number, e?: [number, number, number, number], delay?: number) => Tween;
}>) {
  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={`url(#${id}-fog)`}
      initial={false}
      animate={{ opacity: on ? strength : 0 }}
      transition={t(1.2)}
    />
  );
}

/** Ring mit Haken in der Rampe. Der Abschluss vieler Szenen. */
export function Check({
  id,
  cx,
  cy,
  r,
  plate = DEEP,
}: Readonly<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  plate?: string;
}>) {
  const s = r * 0.46;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={plate} />
      <circle cx={cx} cy={cy} r={r} stroke={`url(#${id})`} strokeWidth={1.2} />
      <path
        d={`M${cx - s} ${cy + 0.1}l${s * 0.72} ${s * 0.72} ${s * 1.28} -${
          s * 1.5
        }`}
        stroke={`url(#${id})`}
        strokeWidth={r * 0.17 + 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Balken, der von links waechst statt aus seiner Mitte. */
export function GrowBar({
  x,
  y,
  width,
  height,
  fill,
  on,
  t,
  duration = 0.5,
  delay = 0,
}: Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  on: boolean;
  t: (d: number, e?: [number, number, number, number], delay?: number) => Tween;
  duration?: number;
  delay?: number;
}>) {
  return (
    <motion.rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={height / 2}
      fill={fill}
      initial={false}
      style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
      animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={t(duration, EASE, delay)}
    />
  );
}
