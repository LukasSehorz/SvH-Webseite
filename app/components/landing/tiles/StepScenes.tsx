"use client";

import { motion } from "framer-motion";
import {
  Check,
  Defs,
  EASE,
  P_BAR,
  P_BAR_SOFT,
  P_DEEP,
  P_HAIR,
  P_HAIR_SOFT,
  P_PLATE,
  POP,
  Stage,
  totalOf,
  useBeat,
  useSceneId,
} from "./kit";

/* ====================================================================
   Drei Szenen, ein Faden.

   Der Balken, den Schritt eins als groeszten Hebel findet, liegt in
   Schritt zwei ganz oben ueber den Bausteinen und faehrt in Schritt drei
   als Teil des fertigen Moduls in die Hand des Teams. Wer die drei
   nacheinander sieht, erkennt dasselbe Stueck wieder und begreift, dass
   die Schritte aufeinander aufbauen.

   Alle drei teilen sich das Feld 300 mal 110. Wesentliches liegt
   zwischen x 16 und x 284 sowie zwischen y 6 und y 104.
   ==================================================================== */

const BOX = "0 0 300 110";

export type StepId = "scan" | "build" | "handover";

type SceneProps = Readonly<{ playKey: number; reduced: boolean }>;

/** Der wiedererkennbare Hebel. Gleiche Breite und Hoehe in allen Szenen. */
const LEVER_W = 190;
const LEVER_H = 8;

/* ------------------------------------------------------------ Suchen */

const SCAN_STEPS = [240, 560, 760, 620] as const;

const FLOWS = [
  { y: 16, w: 150, fill: P_BAR_SOFT },
  { y: 40, w: 118, fill: P_BAR_SOFT },
  { y: 64, w: LEVER_W, fill: P_BAR },
  { y: 88, w: 96, fill: P_BAR_SOFT },
] as const;

function ScanScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(SCAN_STEPS, playKey, reduced);
  const listed = stage >= 1;
  const measuring = stage >= 2;
  const found = stage >= 3;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} />

      {FLOWS.map((flow, i) => (
        <motion.rect
          key={flow.y}
          x={20}
          y={flow.y}
          width={flow.w}
          height={LEVER_H}
          rx={LEVER_H / 2}
          fill={flow.fill}
          initial={false}
          style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
          animate={{ scaleX: listed ? 1 : 0, opacity: listed ? 1 : 0 }}
          transition={t(0.5, EASE, i * 0.08)}
        />
      ))}

      {/* Die Messlinie faehrt einmal von links nach rechts durch. */}
      <motion.g
        initial={false}
        animate={{ x: measuring ? 232 : 0, opacity: measuring ? 1 : 0 }}
        transition={t(0.9)}
      >
        <rect x={16} y={4} width={22} height={102} fill={`url(#${id}-fog)`} />
        <path d="M20 4V106" stroke={`url(#${id})`} strokeWidth={1.2} />
      </motion.g>

      {/* Der groeszte Hebel bekommt Farbe und eine Klammer. */}
      <motion.g
        initial={false}
        animate={{ opacity: found ? 1 : 0 }}
        transition={t(0.5)}
      >
        <rect
          x={20}
          y={64}
          width={LEVER_W}
          height={LEVER_H}
          rx={LEVER_H / 2}
          fill={`url(#${id})`}
        />
        <rect
          x={14}
          y={58}
          width={LEVER_W + 12}
          height={20}
          rx={10}
          stroke={`url(#${id})`}
          strokeWidth={1}
        />
        <motion.g
          initial={false}
          animate={{ scale: found ? 1 : 0.4, opacity: found ? 1 : 0 }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          transition={t(0.5, POP, 0.16)}
        >
          <circle cx={240} cy={68} r={9} fill={P_DEEP} />
          <circle cx={240} cy={68} r={9} stroke={`url(#${id})`} strokeWidth={1.1} />
          <circle cx={240} cy={68} r={3} fill={`url(#${id})`} />
        </motion.g>
      </motion.g>
    </Stage>
  );
}

/* ------------------------------------------------------------- Bauen */

const BUILD_STEPS = [240, 560, 740, 640, 560] as const;

const BLOCKS = [
  { x: 22, from: { x: -46, y: -26, r: -14 } },
  { x: 64, from: { x: -18, y: 30, r: 12 } },
  { x: 106, from: { x: 26, y: -30, r: 16 } },
  { x: 148, from: { x: 52, y: 26, r: -12 } },
] as const;

function BuildScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(BUILD_STEPS, playKey, reduced);
  const carried = stage >= 1;
  const wired = stage >= 3;
  const live = stage >= 4;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} />

      {/* Derselbe Hebel aus Schritt eins, jetzt als Vorgabe ganz oben. */}
      <motion.g
        initial={false}
        animate={{ opacity: carried ? 1 : 0, x: carried ? 0 : -60 }}
        transition={t(0.65)}
      >
        <rect
          x={22}
          y={12}
          width={LEVER_W}
          height={LEVER_H}
          rx={LEVER_H / 2}
          fill={`url(#${id})`}
        />
        <rect
          x={16}
          y={6}
          width={LEVER_W + 12}
          height={20}
          rx={10}
          stroke={`url(#${id})`}
          strokeWidth={1}
          opacity={0.45}
        />
      </motion.g>

      {/* Die Bausteine fliegen ein und rasten in einer Reihe ein. */}
      {BLOCKS.map((block, i) => {
        const set = stage >= 2;
        return (
          <motion.g
            key={block.x}
            initial={false}
            animate={{
              x: set ? 0 : block.from.x,
              y: set ? 0 : block.from.y,
              rotate: set ? 0 : block.from.r,
              opacity: set ? 1 : 0,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            transition={t(0.62, POP, i * 0.09)}
          >
            <rect
              x={block.x}
              y={38}
              width={32}
              height={32}
              rx={8}
              fill={P_PLATE}
              stroke={P_HAIR}
            />
            <rect
              x={block.x + 9}
              y={51}
              width={14}
              height={5}
              rx={2.5}
              fill="rgba(255,255,255,.3)"
            />
          </motion.g>
        );
      })}

      {/* Die Verbindung wird gelegt und einmal durchgeschickt. */}
      <path d="M22 92H222" stroke={P_HAIR_SOFT} />
      <motion.path
        d="M22 92H222"
        stroke={`url(#${id})`}
        strokeWidth={1.4}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: wired ? 1 : 0, opacity: wired ? 1 : 0 }}
        transition={t(0.7)}
      />
      <motion.circle
        cx={22}
        cy={92}
        r={3.6}
        fill={`url(#${id})`}
        initial={false}
        animate={{ x: live ? 200 : 0, opacity: live ? [0, 1, 1, 0] : 0 }}
        transition={t(0.8)}
      />
      <motion.g
        initial={false}
        animate={{ scale: live ? 1 : 0.4, opacity: live ? 1 : 0 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transition={t(0.5, POP, 0.42)}
      >
        <Check id={id} cx={240} cy={92} r={10} plate={P_DEEP} />
      </motion.g>
    </Stage>
  );
}

/* ---------------------------------------------------------- Uebergabe */

const HAND_STEPS = [240, 500, 660, 480, 540] as const;

function HandoverScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(HAND_STEPS, playKey, reduced);
  const built = stage >= 1;
  const moved = stage >= 2;
  const taken = stage >= 3;
  const papers = stage >= 4;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} />

      {/* Die offene Hand, die das Fertige aufnimmt. */}
      <path
        d="M150 8H278V80H150"
        stroke={P_HAIR_SOFT}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M124 44H144"
        stroke={P_HAIR_SOFT}
        strokeDasharray="3 5"
      />

      {/* Das fertige Modul, gebaut aus dem Hebel und den Bausteinen. */}
      <motion.g
        initial={false}
        animate={{ opacity: built ? 1 : 0, x: moved ? 138 : 0 }}
        transition={
          stage === 0
            ? t(0)
            : {
                x: { duration: 0.85, ease: EASE },
                opacity: { duration: 0.5, ease: EASE },
              }
        }
      >
        <rect
          x={20}
          y={14}
          width={104}
          height={60}
          rx={10}
          fill={P_PLATE}
          stroke={P_HAIR}
        />
        <rect
          x={32}
          y={26}
          width={80}
          height={6}
          rx={3}
          fill={`url(#${id})`}
        />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={32 + i * 21}
            y={40}
            width={15}
            height={15}
            rx={4}
            stroke={P_HAIR}
          />
        ))}
        <rect
          x={32}
          y={61}
          width={46}
          height={4}
          rx={2}
          fill={P_BAR_SOFT}
        />
      </motion.g>

      <motion.g
        initial={false}
        animate={{ scale: taken ? 1 : 0.4, opacity: taken ? 1 : 0 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transition={t(0.55, POP)}
      >
        <Check id={id} cx={268} cy={20} r={10} plate={P_DEEP} />
      </motion.g>

      {/* Anleitung und kurze Videos bleiben beim Team. */}
      {[158, 216].map((x, i) => (
        <motion.g
          key={x}
          initial={false}
          animate={{ opacity: papers ? 1 : 0, y: papers ? 0 : 10 }}
          transition={t(0.5, EASE, i * 0.1)}
        >
          <rect
            x={x}
            y={90}
            width={52}
            height={14}
            rx={5}
            fill={P_PLATE}
            stroke={P_HAIR_SOFT}
          />
          <rect
            x={x + 9}
            y={95}
            width={26}
            height={4}
            rx={2}
            fill={P_BAR_SOFT}
          />
        </motion.g>
      ))}
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  Auswahl                                                            */
/* ------------------------------------------------------------------ */

const SCENES: Record<
  StepId,
  Readonly<{
    steps: readonly number[];
    render: (props: SceneProps) => React.ReactElement;
  }>
> = {
  scan: { steps: SCAN_STEPS, render: ScanScene },
  build: { steps: BUILD_STEPS, render: BuildScene },
  handover: { steps: HAND_STEPS, render: HandoverScene },
};

/** Reihenfolge der Schritte. Sie ist hier die Aussage. */
export const STEP_IDS: readonly StepId[] = ["scan", "build", "handover"];

export function stepTotal(id: StepId): number {
  return totalOf(SCENES[id].steps);
}

export function StepScene({
  id,
  ...rest
}: SceneProps & Readonly<{ id: StepId }>) {
  const Component = SCENES[id].render;
  return <Component {...rest} />;
}
