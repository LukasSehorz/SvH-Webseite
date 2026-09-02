"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import type { MarkId } from "./Marks";

/* =====================================================================
   Acht kleine Szenen, je eine Dienstleistung.

   Jede Szene ist reines SVG und laeuft in einer eigenen Schleife aus
   Haarlinien, Balken und einem Strich im Verlauf. Der Aufbau folgt dem
   Muster der Startseite und ist hier eigenstaendig ausgebaut, weil die
   Szenen groesser sind und der Zeiger sie neu starten koennen muss.

   Aufbau einer Schleife.
     Etappe 0            Ruecksprung. Alles steht auf Deckkraft null und
                         gleitet unsichtbar an seinen Startplatz zurueck.
     Etappe 1 bis n-2    Die Geschichte.
     Etappe n-2          Ruhe. Genau dieser Zustand steht still, wenn der
                         Besucher weniger Bewegung eingestellt hat.
     Etappe n-1          Ausblenden.

   Ausserhalb des Blickfelds und bei verborgenem Tab steht der Takt.
   ===================================================================== */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const POP: [number, number, number, number] = [0.34, 1.4, 0.5, 1];
const LIFT: [number, number, number, number] = [0.2, 0.9, 0.3, 1];

/** Dauer der Etappe 0. Der Ruecksprung muss darin fertig werden. */
const RESET_MS = 260;
const RESET_S = 0.2;

/* Etwas kraeftiger als die Haarlinien der Seite, weil die Flaechen klein
   sind und sonst im Grund der Kachel verschwinden. */
const HAIR = "rgba(244,244,246,.17)";
const HAIR_SOFT = "rgba(244,244,246,.12)";
const PLATE = "rgba(244,244,246,.055)";
const PLATE_DIM = "rgba(244,244,246,.03)";
const BAR = "rgba(244,244,246,.32)";
const BAR_SOFT = "rgba(244,244,246,.18)";
const GLYPH = "rgba(244,244,246,.4)";

/* ------------------------------------------------------------------ */
/*  Takt                                                               */
/* ------------------------------------------------------------------ */

type SceneSpec = Readonly<{
  /** Dauer jeder Etappe in Millisekunden. Etappe 0 ist der Ruecksprung. */
  steps: readonly number[];
  /** Etappe, die bei reduzierter Bewegung dauerhaft steht. */
  rest: number;
}>;

type Beat = Readonly<{ stage: number; cycle: number }>;

/**
 * Etappentakt einer Szene.
 *
 * Der Takt laeuft ueber verkettete Timer statt ueber requestAnimationFrame,
 * weil zwischen zwei Etappen mehrere hundert Millisekunden nichts zu
 * rechnen ist. `offset` verschiebt den Einstieg, damit benachbarte
 * Kacheln nie im Gleichtakt laufen. Steigt `replay`, faengt die Schleife
 * wieder ganz vorn an; so laeuft die Geschichte unter dem Zeiger noch
 * einmal vollstaendig ab.
 */
function useScene(
  spec: SceneSpec,
  offset: number,
  active: boolean,
  reduced: boolean,
  replay: number
): Beat {
  const [beat, setBeat] = useState<Beat>({ stage: 0, cycle: 0 });

  useEffect(() => {
    if (reduced || !active) return;

    const steps = spec.steps;
    const total = steps.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const now = performance.now();
    const origin = replay > 0 ? now : now - (offset % total);

    const tick = () => {
      const elapsed = Math.max(0, performance.now() - origin);
      const cycle = Math.floor(elapsed / total);
      const inCycle = elapsed - cycle * total;

      let bound = 0;
      let stage = steps.length - 1;
      for (let i = 0; i < steps.length; i += 1) {
        bound += steps[i];
        if (inCycle < bound) {
          stage = i;
          break;
        }
      }

      setBeat((prev) =>
        prev.stage === stage && prev.cycle === cycle ? prev : { stage, cycle }
      );

      timer = setTimeout(tick, Math.max(16, bound - inCycle));
    };

    tick();
    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [spec, offset, active, reduced, replay]);

  if (reduced) return { stage: spec.rest, cycle: 0 };
  return beat;
}

/**
 * Meldet, ob eine Flaeche im Blickfeld liegt und der Tab sichtbar ist.
 * Alle Szenen einer Sektion haengen an einem einzigen Beobachter.
 */
export function useScenesActive(ref: RefObject<Element | null>): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let inView = false;
    const sync = () => setActive(inView && !document.hidden);

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);

  return active;
}

/* ------------------------------------------------------------------ */
/*  Bausteine                                                          */
/* ------------------------------------------------------------------ */

/** Eindeutige, fuer `url(#…)` taugliche Kennung je Instanz. */
function useLocalId(): string {
  const raw = useId();
  return useMemo(() => `s${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`, [raw]);
}

/** Die Rampe einmal waagerecht und einmal senkrecht. */
export function Ramp({ id }: Readonly<{ id: string }>) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#5B8CFF" />
        <stop offset="48%" stopColor="#7C6AFF" />
        <stop offset="100%" stopColor="#B9A5FF" />
      </linearGradient>
      <linearGradient id={`${id}-up`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#5B8CFF" />
        <stop offset="55%" stopColor="#7C6AFF" />
        <stop offset="100%" stopColor="#B9A5FF" />
      </linearGradient>
    </defs>
  );
}

function Canvas({
  viewBox,
  children,
}: Readonly<{ viewBox: string; children: React.ReactNode }>) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
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

/**
 * Uebergang eines Teils der Szene.
 *
 * Waehrend des Ruecksprungs gilt fuer alles dieselbe kurze Dauer. Weil in
 * dieser Etappe nichts sichtbar ist, faellt die Rueckreise nicht auf. Eine
 * Dauer von null wird bewusst vermieden, weil eine laufende Blende dabei
 * stehen bleiben kann.
 */
function step(
  resetting: boolean,
  duration: number,
  ease: [number, number, number, number] = EASE
) {
  return resetting ? { duration: RESET_S, ease: EASE } : { duration, ease };
}

type SceneProps = Readonly<{
  active: boolean;
  reduced: boolean;
  /** Versatz in Millisekunden, damit Nachbarn nie gleich laufen. */
  offset: number;
  /** Steigt bei Beruehrung mit dem Zeiger und startet die Szene neu. */
  replay: number;
}>;

const BOX = "0 0 200 108";

/* ------------------------------------------------------------------ */
/*  E-Mail                                                             */
/* ------------------------------------------------------------------ */

const EMAIL: SceneSpec = {
  steps: [RESET_MS, 620, 520, 620, 520, 1250, 520],
  rest: 5,
};

function MailRow({
  gradId,
  top,
  shown,
  checked,
  resetting,
}: Readonly<{
  gradId: string;
  top: number;
  shown: boolean;
  checked: boolean;
  resetting: boolean;
}>) {
  const mid = top + 16;

  return (
    <motion.g
      initial={false}
      animate={{ x: shown ? 0 : -186, opacity: shown ? 1 : 0 }}
      transition={step(resetting, 0.6)}
    >
      <rect
        x={14}
        y={top}
        width={172}
        height={32}
        rx={9}
        fill={PLATE}
        stroke={HAIR_SOFT}
      />
      <rect
        x={26}
        y={mid - 6}
        width={17}
        height={12.5}
        rx={2}
        stroke={GLYPH}
        strokeWidth={1.1}
      />
      <path
        d={`M26.6 ${mid - 5.4}l7.9 6 7.9-6`}
        stroke={GLYPH}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <rect x={52} y={mid - 8} width={62} height={5} rx={2.5} fill={BAR} />
      <rect x={52} y={mid + 2} width={40} height={5} rx={2.5} fill={BAR_SOFT} />

      <motion.g
        initial={false}
        animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
        transition={step(resetting, 0.5, POP)}
      >
        <circle
          cx={166}
          cy={mid}
          r={10}
          stroke={`url(#${gradId})`}
          strokeWidth={1.2}
        />
        <path
          d={`M161.4 ${mid}l3.2 3.2 5.6-6`}
          stroke={`url(#${gradId})`}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.g>
  );
}

function EmailScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(EMAIL, offset, active, reduced, replay);
  const resetting = stage === 0;
  const visible = stage >= 1 && stage <= 5;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />
      <clipPath id={`${uid}-clip`}>
        <rect x={10} y={8} width={182} height={94} />
      </clipPath>

      <motion.g
        clipPath={`url(#${uid}-clip)`}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={step(resetting, 0.5)}
      >
        <MailRow
          gradId={uid}
          top={16}
          shown={stage >= 1}
          checked={stage >= 2}
          resetting={resetting}
        />
        <MailRow
          gradId={uid}
          top={60}
          shown={stage >= 3}
          checked={stage >= 4}
          resetting={resetting}
        />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat                                                               */
/* ------------------------------------------------------------------ */

const CHAT: SceneSpec = {
  steps: [RESET_MS, 640, 1250, 780, 1400, 540],
  rest: 4,
};

function ChatScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(CHAT, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 5;
  const asked = stage >= 1 && !out;
  const typing = stage === 2;
  const answered = stage >= 3 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      <motion.g
        initial={false}
        animate={{ opacity: asked ? 1 : 0, scale: asked ? 1 : 0.94 }}
        transition={step(resetting, 0.55)}
      >
        <rect
          x={12}
          y={12}
          width={106}
          height={34}
          rx={12}
          fill={PLATE}
          stroke={HAIR_SOFT}
        />
        <rect x={26} y={22} width={62} height={5} rx={2.5} fill={BAR} />
        <rect x={26} y={33} width={42} height={5} rx={2.5} fill={BAR_SOFT} />
      </motion.g>

      <motion.g
        initial={false}
        animate={{ opacity: typing ? 1 : 0, scale: typing ? 1 : 0.9 }}
        transition={step(resetting, 0.35)}
      >
        <rect
          x={136}
          y={56}
          width={52}
          height={28}
          rx={13}
          fill={PLATE}
          stroke={HAIR_SOFT}
        />
        {[150, 162, 174].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={70}
            r={3.2}
            fill="rgba(244,244,246,.5)"
            initial={false}
            animate={
              typing && active
                ? { opacity: [0.24, 0.9, 0.24] }
                : { opacity: 0.45 }
            }
            transition={
              typing && active
                ? {
                    duration: 1.15,
                    repeat: Infinity,
                    delay: i * 0.17,
                    ease: "easeInOut",
                  }
                : { duration: 0.2 }
            }
          />
        ))}
      </motion.g>

      <motion.g
        initial={false}
        animate={{ opacity: answered ? 1 : 0, scale: answered ? 1 : 0.92 }}
        transition={step(resetting, 0.5)}
      >
        <rect
          x={64}
          y={54}
          width={124}
          height={42}
          rx={13}
          fill="rgba(124,106,255,.1)"
          stroke={`url(#${uid})`}
          strokeWidth={1}
        />
        <rect
          x={80}
          y={65}
          width={84}
          height={5}
          rx={2.5}
          fill="rgba(244,244,246,.46)"
        />
        <rect
          x={80}
          y={77}
          width={58}
          height={5}
          rx={2.5}
          fill="rgba(244,244,246,.26)"
        />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Assistent                                                          */
/* ------------------------------------------------------------------ */

const AGENT: SceneSpec = {
  steps: [RESET_MS, 520, 460, 460, 460, 1300, 520],
  rest: 5,
};

/** Die vier Programme, in denen der Assistent arbeitet. */
const AGENT_SLOTS = [
  { x: 30, y: 22 },
  { x: 170, y: 22 },
  { x: 30, y: 86 },
  { x: 170, y: 86 },
] as const;

function AgentScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(AGENT, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 6;
  const core = stage >= 1 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      {AGENT_SLOTS.map((slot, i) => {
        const linked = stage >= 2 + i && !out;
        return (
          <g key={`${slot.x}-${slot.y}`}>
            <motion.path
              d={`M100 54L${slot.x} ${slot.y}`}
              stroke={`url(#${uid})`}
              strokeWidth={1.1}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: linked ? 1 : 0, opacity: linked ? 1 : 0 }}
              transition={step(resetting, 0.5)}
            />
            <motion.g
              initial={false}
              animate={{ opacity: linked ? 1 : 0.34, scale: linked ? 1 : 0.86 }}
              transition={step(resetting, 0.5, POP)}
            >
              <rect
                x={slot.x - 20}
                y={slot.y - 11}
                width={40}
                height={22}
                rx={7}
                fill={PLATE}
                stroke={linked ? `url(#${uid})` : HAIR_SOFT}
                strokeWidth={1.1}
              />
              <rect
                x={slot.x - 11}
                y={slot.y - 2.5}
                width={22}
                height={5}
                rx={2.5}
                fill={linked ? "rgba(244,244,246,.42)" : BAR_SOFT}
              />
            </motion.g>
          </g>
        );
      })}

      <motion.g
        initial={false}
        animate={{ opacity: core ? 1 : 0, scale: core ? 1 : 0.6 }}
        transition={step(resetting, 0.6, POP)}
      >
        <circle cx={100} cy={54} r={16} fill="#0B0B10" />
        <circle
          cx={100}
          cy={54}
          r={16}
          stroke={`url(#${uid})`}
          strokeWidth={1.3}
        />
        <circle cx={100} cy={54} r={6.4} fill="rgba(124,106,255,.55)" />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Termine                                                            */
/* ------------------------------------------------------------------ */

const CALENDAR: SceneSpec = {
  steps: [RESET_MS, 600, 560, 1600, 540],
  rest: 3,
};

/** Der belegte Platz wandert je Durchgang eine Stelle weiter. */
const SLOT_ORDER = [5, 2, 6, 1, 7, 3, 4, 0] as const;
const SLOT_X = [12, 60, 108, 156] as const;
const SLOT_Y = [36, 72] as const;

function CalendarScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage, cycle } = useScene(CALENDAR, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 4;
  const filled = stage >= 1 && !out;
  const checked = stage >= 2 && !out;

  const slot = SLOT_ORDER[cycle % SLOT_ORDER.length];
  const x = SLOT_X[slot % 4];
  const y = SLOT_Y[Math.floor(slot / 4)];
  const cx = x + 16;
  const cy = y + 14;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      {SLOT_X.map((sx) => (
        <rect
          key={sx}
          x={sx + 6}
          y={18}
          width={20}
          height={5}
          rx={2.5}
          fill={BAR_SOFT}
        />
      ))}

      {SLOT_Y.map((sy) =>
        SLOT_X.map((sx) => (
          <rect
            key={`${sx}-${sy}`}
            x={sx}
            y={sy}
            width={32}
            height={28}
            rx={7}
            fill={PLATE_DIM}
            stroke={HAIR_SOFT}
          />
        ))
      )}

      <motion.g
        key={slot}
        initial={false}
        animate={{ opacity: filled ? 1 : 0, scale: filled ? 1 : 0.8 }}
        transition={step(resetting, 0.5)}
      >
        <rect
          x={x}
          y={y}
          width={32}
          height={28}
          rx={7}
          fill="rgba(124,106,255,.18)"
          stroke={`url(#${uid})`}
          strokeWidth={1.1}
        />
        <motion.path
          d={`M${cx - 6} ${cy}l4.2 4.2 8-8.6`}
          stroke={`url(#${uid})`}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={step(resetting, 0.5)}
        />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Angebote und Rechnungen                                            */
/* ------------------------------------------------------------------ */

const OFFER: SceneSpec = {
  steps: [RESET_MS, 520, 440, 440, 620, 1150, 540],
  rest: 5,
};

const OFFER_LINES = [
  { y: 34, width: 60, fill: BAR },
  { y: 48, width: 46, fill: BAR_SOFT },
] as const;

function OfferScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(OFFER, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 6;
  const paper = stage >= 1 && !out;
  const sum = stage >= 4 && !out;
  const sent = stage >= 5 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      <motion.g
        initial={false}
        animate={{
          opacity: paper ? 1 : 0,
          y: paper ? 0 : 12,
          x: sent ? 26 : 0,
        }}
        transition={step(resetting, 0.62)}
      >
        <rect
          x={54}
          y={10}
          width={92}
          height={88}
          rx={9}
          fill="rgba(244,244,246,.05)"
          stroke={HAIR}
        />
        <rect x={68} y={22} width={38} height={6} rx={3} fill={GLYPH} />

        {OFFER_LINES.map((line, i) => {
          const grown = stage >= 2 + i && !out;
          return (
            <motion.rect
              key={line.y}
              x={68}
              y={line.y}
              width={line.width}
              height={5}
              rx={2.5}
              fill={line.fill}
              initial={false}
              /* Die Zeilen wachsen von links, nicht aus ihrer Mitte. */
              style={{ originX: 0 }}
              animate={{ scaleX: grown ? 1 : 0, opacity: grown ? 1 : 0 }}
              transition={step(resetting, 0.45)}
            />
          );
        })}

        <motion.g
          initial={false}
          animate={{ opacity: sum ? 1 : 0, y: sum ? 0 : 6 }}
          transition={step(resetting, 0.5, LIFT)}
        >
          <path d="M68 64h64" stroke={HAIR_SOFT} />
          <rect
            x={68}
            y={72}
            width={54}
            height={8}
            rx={4}
            fill={`url(#${uid})`}
            opacity={0.85}
          />
        </motion.g>
      </motion.g>

      <motion.g
        initial={false}
        animate={{ scale: sent ? 1 : 0.35, opacity: sent ? 1 : 0 }}
        transition={step(resetting, 0.6, POP)}
      >
        <circle cx={40} cy={80} r={15} fill="#0B0B10" />
        <circle
          cx={40}
          cy={80}
          r={15}
          stroke={`url(#${uid})`}
          strokeWidth={1.3}
        />
        <path
          d="M33 80.4l4.6 4.6 8.6-9.4"
          stroke={`url(#${uid})`}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Dokumente                                                          */
/* ------------------------------------------------------------------ */

const DOCUMENT: SceneSpec = {
  steps: [RESET_MS, 560, 1100, 620, 760, 1050, 520],
  rest: 5,
};

const DOC_CHIPS = [
  { y: 30, width: 40 },
  { y: 48, width: 30 },
  { y: 66, width: 36 },
] as const;

function DocumentScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(DOCUMENT, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 6;
  const paper = stage >= 1 && !out;
  const scanning = stage === 2;
  const marked = stage >= 3 && !out;
  const filed = stage >= 4 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />
      <clipPath id={`${uid}-sheet`}>
        <rect x={16} y={10} width={72} height={88} rx={8} />
      </clipPath>

      {/* Ablage rechts. Sie steht die ganze Zeit und nimmt am Ende auf. */}
      <rect
        x={122}
        y={26}
        width={62}
        height={56}
        rx={9}
        fill={PLATE_DIM}
        stroke={HAIR_SOFT}
        strokeDasharray="4 4"
      />

      <motion.g
        initial={false}
        animate={{ opacity: paper ? 1 : 0, y: paper ? 0 : 10 }}
        transition={step(resetting, 0.55)}
      >
        <rect
          x={16}
          y={10}
          width={72}
          height={88}
          rx={8}
          fill="rgba(244,244,246,.05)"
          stroke={HAIR}
        />
        <path d="M70 10v14h18" stroke={HAIR_SOFT} />

        <motion.g
          clipPath={`url(#${uid}-sheet)`}
          initial={false}
          animate={
            scanning && active
              ? { y: [0, 62], opacity: 1 }
              : { y: 0, opacity: 0 }
          }
          transition={
            scanning && active
              ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.24, ease: EASE }
          }
        >
          <rect
            x={16}
            y={26}
            width={72}
            height={5}
            fill={`url(#${uid})`}
            opacity={0.9}
          />
        </motion.g>
      </motion.g>

      {DOC_CHIPS.map((chip, i) => (
        <motion.g
          key={chip.y}
          initial={false}
          animate={{
            opacity: marked ? 1 : 0,
            x: filed ? 104 : 0,
            y: filed ? 6 : 0,
          }}
          transition={
            resetting
              ? { duration: RESET_S, ease: EASE }
              : { duration: 0.62, ease: EASE, delay: filed ? i * 0.09 : 0 }
          }
        >
          <rect
            x={28}
            y={chip.y}
            width={chip.width}
            height={12}
            rx={4}
            fill="rgba(124,106,255,.16)"
            stroke={`url(#${uid})`}
            strokeWidth={1}
          />
        </motion.g>
      ))}
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Kundendaten                                                        */
/* ------------------------------------------------------------------ */

const CRM: SceneSpec = {
  steps: [RESET_MS, 620, 700, 800, 1250, 520],
  rest: 4,
};

function CrmRow({
  y,
  width,
  strong,
}: Readonly<{ y: number; width: number; strong: boolean }>) {
  return (
    <>
      <rect
        x={16}
        y={y}
        width={168}
        height={26}
        rx={8}
        fill={PLATE}
        stroke={HAIR_SOFT}
      />
      <circle cx={32} cy={y + 13} r={6.5} stroke={GLYPH} strokeWidth={1.1} />
      <rect
        x={48}
        y={y + 7}
        width={width}
        height={5}
        rx={2.5}
        fill={strong ? BAR : BAR_SOFT}
      />
      <rect
        x={48}
        y={y + 16}
        width={width * 0.6}
        height={4}
        rx={2}
        fill={BAR_SOFT}
      />
    </>
  );
}

function CrmScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(CRM, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 5;
  const listed = stage >= 1 && !out;
  const flagged = stage >= 2 && !out;
  const merged = stage >= 3 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      <motion.g
        initial={false}
        animate={{ opacity: listed ? 1 : 0 }}
        transition={step(resetting, 0.5)}
      >
        <g>
          <CrmRow y={10} width={72} strong />
        </g>

        {/* Der doppelte Eintrag. Er wird markiert und wandert dann in den
            Eintrag darueber, die Liste schliesst die Luecke. */}
        <motion.g
          initial={false}
          animate={{
            y: merged ? -34 : 0,
            opacity: merged ? 0 : 1,
            scale: merged ? 0.94 : 1,
          }}
          transition={step(resetting, 0.7)}
        >
          <CrmRow y={44} width={72} strong={false} />
          <motion.rect
            x={16}
            y={44}
            width={168}
            height={26}
            rx={8}
            stroke={`url(#${uid})`}
            strokeWidth={1.2}
            initial={false}
            animate={{ opacity: flagged ? 1 : 0 }}
            transition={step(resetting, 0.4)}
          />
        </motion.g>

        <motion.g
          initial={false}
          animate={{ y: merged ? -34 : 0 }}
          transition={step(resetting, 0.7)}
        >
          <CrmRow y={78} width={56} strong={false} />
        </motion.g>
      </motion.g>

      <motion.g
        initial={false}
        animate={{ scale: merged ? 1 : 0.4, opacity: merged ? 1 : 0 }}
        transition={step(resetting, 0.55, POP)}
      >
        <circle cx={166} cy={70} r={12} fill="#0B0B10" />
        <circle
          cx={166}
          cy={70}
          r={12}
          stroke={`url(#${uid})`}
          strokeWidth={1.2}
        />
        <path
          d="M160.4 70.4l3.6 3.6 6.8-7.4"
          stroke={`url(#${uid})`}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Zahlen                                                             */
/* ------------------------------------------------------------------ */

const REPORT: SceneSpec = {
  steps: [RESET_MS, 440, 440, 440, 440, 1300, 540],
  rest: 5,
};

const REPORT_BARS = [
  { x: 30, height: 30 },
  { x: 74, height: 46 },
  { x: 118, height: 38 },
  { x: 162, height: 62 },
] as const;

function ReportScene({ active, reduced, offset, replay }: SceneProps) {
  const uid = useLocalId();
  const { stage } = useScene(REPORT, offset, active, reduced, replay);
  const resetting = stage === 0;
  const out = stage === 6;
  /* Die Aufwaertslinie zeichnet sich, sobald der letzte Balken steht. */
  const trend = stage >= 5 && !out;

  return (
    <Canvas viewBox={BOX}>
      <Ramp id={uid} />

      <motion.g
        initial={false}
        animate={{ opacity: resetting || out ? 0 : 1 }}
        transition={step(resetting, 0.5)}
      >
        <motion.path
          d="M22 34l14-9 12 7 15-13"
          stroke={`url(#${uid})`}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: trend ? 1 : 0, opacity: trend ? 1 : 0 }}
          transition={step(resetting, 0.7)}
        />
        <motion.path
          d="M55.5 18.5H64V27"
          stroke={`url(#${uid})`}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: trend ? 1 : 0 }}
          transition={
            resetting
              ? { duration: RESET_S, ease: EASE }
              : { duration: 0.35, ease: EASE, delay: trend ? 0.5 : 0 }
          }
        />

        <path d="M18 98h164" stroke={HAIR} />

        {REPORT_BARS.map((bar, i) => {
          const grown = stage >= 1 + i;
          const last = i === REPORT_BARS.length - 1;
          return (
            <motion.rect
              key={bar.x}
              /* Der Strich sitzt mittig auf der Kante, daher der halbe Versatz. */
              x={bar.x + 0.6}
              y={98.6 - bar.height}
              width={26.8}
              height={bar.height - 1.2}
              rx={3.4}
              fill={last ? "rgba(124,106,255,.16)" : "none"}
              stroke={`url(#${uid}-up)`}
              strokeWidth={1.2}
              initial={false}
              /* Die Balken wachsen von der Grundlinie nach oben. */
              style={{ originY: 1 }}
              animate={{ scaleY: grown ? 1 : 0, opacity: grown ? 1 : 0 }}
              transition={step(resetting, 0.55, LIFT)}
            />
          );
        })}
      </motion.g>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Auswahl                                                            */
/* ------------------------------------------------------------------ */

const SCENE_MAP: Record<MarkId, (props: SceneProps) => React.ReactElement> = {
  email: EmailScene,
  chat: ChatScene,
  agent: AgentScene,
  calendar: CalendarScene,
  offer: OfferScene,
  document: DocumentScene,
  crm: CrmScene,
  report: ReportScene,
};

export function Scene({
  id,
  ...rest
}: SceneProps & Readonly<{ id: MarkId }>) {
  const Component = SCENE_MAP[id];
  return <Component {...rest} />;
}
