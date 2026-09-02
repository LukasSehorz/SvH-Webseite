"use client";

import { motion } from "framer-motion";
import {
  BAR,
  BAR_SOFT,
  Check,
  Defs,
  DEEP,
  EASE,
  Fog,
  GLYPH,
  GrowBar,
  HAIR,
  HAIR_SOFT,
  LIFT,
  PLATE,
  PLATE_DIM,
  POP,
  Stage,
  totalOf,
  useBeat,
  useSceneId,
} from "./kit";

/* ====================================================================
   Sechs Szenen, je eine Leistung.

   Alle teilen sich das Feld 480 mal 200. Der Rahmen schneidet je nach
   Breite unterschiedlich viel weg, deshalb liegt alles Wesentliche
   zwischen x 52 und x 428 sowie zwischen y 20 und y 180. Nebel, Raster
   und Schienen duerfen darueber hinauslaufen, denn sie sollen den Rand
   erreichen und die Flaeche auch auf einem sehr breiten Bildschirm
   fuellen.

   Jede Szene erzaehlt einen Weg von links nach rechts oder fuellt ein
   Raster, damit sie in einem breiten Rahmen nicht verloren wirkt.
   ==================================================================== */

const BOX = "0 0 480 200";

export type TileId =
  | "email"
  | "chat"
  | "invoice"
  | "calendar"
  | "leads"
  | "report";

type SceneProps = Readonly<{ playKey: number; reduced: boolean }>;

/* ---------------------------------------------------------- E-Mail */

/* Anfrage kommt links herein, geht durch die Pruefung und verlaesst die
   Kachel rechts als beantwortete Nachricht. */
const EMAIL_STEPS = [260, 660, 760, 560] as const;

const MAIL_LANES = [34, 82, 130] as const;
const MAIL_W = 150;
const MAIL_H = 36;
const MAIL_IN = 62;
const MAIL_OUT = 258;

function Envelope({ x, y }: Readonly<{ x: number; y: number }>) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={18}
        height={13}
        rx={2}
        stroke={GLYPH}
        strokeWidth={1.1}
      />
      <path
        d={`M${x} ${y}l9 6.6 9-6.6`}
        stroke={GLYPH}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </>
  );
}

function EmailScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(EMAIL_STEPS, playKey, reduced);
  const shown = stage >= 1;
  const passed = stage >= 2;
  const answered = stage >= 3;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={232} cy={100} rx={196} ry={124} on={passed} t={t} />

      {/* Die Bahnen laufen bis ueber beide Raender hinaus. */}
      {MAIL_LANES.map((lane) => (
        <path
          key={lane}
          d={`M0 ${lane + MAIL_H / 2}H480`}
          stroke={HAIR_SOFT}
          strokeDasharray="2 9"
        />
      ))}

      {/* Die Pruefstelle in der Mitte. */}
      <motion.g
        initial={false}
        animate={{ opacity: shown ? 1 : 0, scaleY: shown ? 1 : 0.7 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transition={t(0.6)}
      >
        <rect
          x={224}
          y={16}
          width={14}
          height={168}
          rx={7}
          fill="rgba(124,106,255,.1)"
        />
        <rect
          x={224}
          y={16}
          width={14}
          height={168}
          rx={7}
          stroke={`url(#${id})`}
          strokeWidth={1.1}
        />
      </motion.g>

      {/* Die Faecher, aus denen die Nachrichten kommen. Sie bleiben leer
          stehen, damit die linke Haelfte auch am Ende etwas traegt. */}
      {MAIL_LANES.map((lane, i) => (
        <motion.rect
          key={`fach-${lane}`}
          x={MAIL_IN}
          y={lane}
          width={MAIL_W}
          height={MAIL_H}
          rx={10}
          stroke={HAIR_SOFT}
          strokeDasharray="5 6"
          initial={false}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={t(0.5, EASE, i * 0.09)}
        />
      ))}

      {MAIL_LANES.map((lane, i) => (
        <motion.g
          key={lane}
          initial={false}
          animate={{
            x: passed ? MAIL_OUT : shown ? MAIL_IN : -200,
            opacity: shown ? 1 : 0,
          }}
          transition={t(passed ? 0.72 : 0.62, EASE, i * 0.09)}
        >
          <rect
            x={0}
            y={lane}
            width={MAIL_W}
            height={MAIL_H}
            rx={10}
            fill={PLATE}
            stroke={HAIR_SOFT}
          />
          <motion.rect
            x={0}
            y={lane}
            width={MAIL_W}
            height={MAIL_H}
            rx={10}
            stroke={`url(#${id})`}
            strokeWidth={1}
            initial={false}
            animate={{ opacity: answered ? 1 : 0 }}
            transition={t(0.45, EASE, i * 0.09)}
          />
          <Envelope x={14} y={lane + 11} />
          <rect
            x={42}
            y={lane + 11}
            width={62}
            height={5}
            rx={2.5}
            fill={BAR}
          />
          <rect
            x={42}
            y={lane + 21}
            width={40}
            height={5}
            rx={2.5}
            fill={BAR_SOFT}
          />
          <motion.g
            initial={false}
            animate={{
              scale: answered ? 1 : 0.35,
              opacity: answered ? 1 : 0,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            transition={t(0.5, POP, 0.12 + i * 0.09)}
          >
            <Check id={id} cx={128} cy={lane + 18} r={9} />
          </motion.g>
        </motion.g>
      ))}
    </Stage>
  );
}

/* ------------------------------------------------------------ Chat */

/* Frage, kurzes Ueberlegen, Antwort. Die Leiste am unteren Rand zeigt,
   dass das zu jeder Stunde des Tages gilt. */
const CHAT_STEPS = [260, 580, 720, 660, 720] as const;

const HOURS = Array.from({ length: 24 }, (_, i) => 44 + i * 17.05);

function ChatScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(CHAT_STEPS, playKey, reduced);
  const asked = stage >= 1;
  const typing = stage === 2;
  const answered = stage >= 3;
  const around = stage >= 4;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={306} cy={104} rx={190} ry={120} on={answered} t={t} />

      {/* Frage */}
      <motion.g
        initial={false}
        animate={{ opacity: asked ? 1 : 0, x: asked ? 0 : -26 }}
        transition={t(0.6)}
      >
        <rect
          x={46}
          y={22}
          width={196}
          height={50}
          rx={16}
          fill={PLATE}
          stroke={HAIR_SOFT}
        />
        {/* Die Spitze haengt buendig an der Unterkante der Blase, damit
            sie nicht als eigenes Dreieck danebensteht. */}
        <path d="M62 72h24l-38 12z" fill={PLATE} />
        <rect x={64} y={36} width={116} height={6} rx={3} fill={BAR} />
        <rect x={64} y={50} width={80} height={6} rx={3} fill={BAR_SOFT} />
      </motion.g>

      {/* Kurzes Ueberlegen */}
      <motion.g
        initial={false}
        animate={{ opacity: typing ? 1 : 0, scale: typing ? 1 : 0.88 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transition={t(0.34)}
      >
        <rect
          x={306}
          y={84}
          width={72}
          height={36}
          rx={15}
          fill={PLATE}
          stroke={HAIR_SOFT}
        />
        {[324, 342, 360].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={102}
            r={3.4}
            fill="rgba(244,244,246,.5)"
            initial={false}
            animate={typing ? { opacity: [0.22, 0.9, 0.22] } : { opacity: 0.4 }}
            transition={
              typing
                ? {
                    duration: 1.05,
                    repeat: Infinity,
                    delay: i * 0.16,
                    ease: "easeInOut",
                  }
                : { duration: 0.2 }
            }
          />
        ))}
      </motion.g>

      {/* Antwort */}
      <motion.g
        initial={false}
        animate={{ opacity: answered ? 1 : 0, scale: answered ? 1 : 0.92 }}
        style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}
        transition={t(0.55)}
      >
        <rect
          x={172}
          y={80}
          width={258}
          height={64}
          rx={16}
          fill="rgba(124,106,255,.1)"
          stroke={`url(#${id})`}
          strokeWidth={1}
        />
        {[
          { y: 96, w: 182, c: "rgba(244,244,246,.46)" },
          { y: 110, w: 138, c: "rgba(244,244,246,.3)" },
          { y: 124, w: 96, c: "rgba(244,244,246,.22)" },
        ].map((line, i) => (
          <GrowBar
            key={line.y}
            x={192}
            y={line.y}
            width={line.w}
            height={6}
            fill={line.c}
            on={answered}
            t={t}
            duration={0.5}
            delay={0.14 + i * 0.09}
          />
        ))}
      </motion.g>

      {/* Die vierundzwanzig Stunden des Tages. */}
      {HOURS.map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y={166}
          width={2}
          height={8}
          rx={1}
          fill={`url(#${id})`}
          initial={false}
          animate={{ opacity: around ? 0.8 : 0.12, scaleY: around ? 1 : 0.5 }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          transition={t(0.4, EASE, i * 0.018)}
        />
      ))}
    </Stage>
  );
}

/* --------------------------------------------------------- Rechnung */

/* Angebot, Rechnung, Erinnerung. Drei Blaetter, die eine Kette bilden,
   und jedes wird fertig, bevor die Schiene zum naechsten zeichnet. */
const INVOICE_STEPS = [260, 520, 440, 520, 440, 520, 440] as const;

const PAPERS = [60, 192, 324] as const;
const PAPER_W = 96;
const PAPER_LINES = [
  { y: 78, w: 62 },
  { y: 93, w: 50 },
  { y: 108, w: 36 },
] as const;

function InvoiceScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(INVOICE_STEPS, playKey, reduced);

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={240} cy={100} rx={214} ry={118} on={stage >= 4} t={t} />

      <path d="M0 99H480" stroke={HAIR_SOFT} strokeDasharray="2 9" />

      {PAPERS.map((x, i) => {
        const here = stage >= 1 + i * 2;
        const stamped = stage >= 2 + i * 2;
        return (
          <g key={x}>
            <motion.g
              initial={false}
              animate={{ opacity: here ? 1 : 0, y: here ? 0 : 12 }}
              transition={t(0.55)}
            >
              <rect
                x={x}
                y={40}
                width={PAPER_W}
                height={118}
                rx={10}
                fill={PLATE_DIM}
                stroke={HAIR}
              />
              <rect
                x={x + 14}
                y={58}
                width={44}
                height={7}
                rx={3.5}
                fill={GLYPH}
              />
            </motion.g>

            {PAPER_LINES.map((line, k) => (
              <GrowBar
                key={line.y}
                x={x + 14}
                y={line.y}
                width={line.w}
                height={5}
                fill={k === 0 ? BAR : BAR_SOFT}
                on={here}
                t={t}
                duration={0.42}
                delay={0.16 + k * 0.1}
              />
            ))}

            <motion.g
              initial={false}
              animate={{ scale: stamped ? 1 : 0.3, opacity: stamped ? 1 : 0 }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              transition={t(0.55, POP)}
            >
              <Check id={id} cx={x + 70} cy={134} r={15} />
            </motion.g>

            {/* Schiene zum naechsten Blatt. */}
            {i < PAPERS.length - 1 ? (
              <motion.g
                initial={false}
                animate={{ opacity: stamped ? 1 : 0 }}
                transition={t(0.4)}
              >
                <motion.path
                  d={`M${x + PAPER_W + 2} 99H${x + PAPER_W + 30}`}
                  stroke={`url(#${id})`}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: stamped ? 1 : 0 }}
                  transition={t(0.5)}
                />
                <path
                  d={`M${x + PAPER_W + 26} 94.5l4.5 4.5-4.5 4.5`}
                  stroke={`url(#${id})`}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            ) : null}
          </g>
        );
      })}
    </Stage>
  );
}

/* --------------------------------------------------------- Kalender */

/* Freie Zeiten werden vorgeschlagen, eine wird bestaetigt, die naechste
   folgt. Das Raster reicht ueber beide Raender hinaus. */
const CALENDAR_STEPS = [260, 620, 640, 620, 620] as const;

const COLS = [65, 137, 209, 281, 353] as const;
const ROWS = [58, 100, 142] as const;
const CELL_W = 62;
const CELL_H = 34;

/* Erst der Vorschlag, dann die Bestaetigung. Zwei Plaetze, damit die
   Kachel nicht nach einem Einzelfall aussieht. */
const PICKS = [
  { x: COLS[1], y: ROWS[0] },
  { x: COLS[3], y: ROWS[2] },
] as const;

function CalendarScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(CALENDAR_STEPS, playKey, reduced);
  const grid = stage >= 1;
  const offered = stage >= 2;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={244} cy={104} rx={206} ry={116} on={stage >= 3} t={t} />

      {[58, 100, 142, 176].map((y) => (
        <path
          key={y}
          d={`M0 ${y}H480`}
          stroke={HAIR_SOFT}
          strokeDasharray="2 9"
        />
      ))}

      {COLS.map((x, i) => (
        <motion.rect
          key={x}
          x={x + 18}
          y={36}
          width={26}
          height={5}
          rx={2.5}
          fill={BAR_SOFT}
          initial={false}
          animate={{ opacity: grid ? 1 : 0 }}
          transition={t(0.4, EASE, i * 0.05)}
        />
      ))}

      {ROWS.map((y, r) =>
        COLS.map((x, c) => (
          <motion.rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={CELL_W}
            height={CELL_H}
            rx={7}
            stroke={HAIR_SOFT}
            initial={false}
            animate={{ opacity: grid ? 1 : 0, scale: grid ? 1 : 0.86 }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            transition={t(0.45, EASE, (r * COLS.length + c) * 0.026)}
          />
        ))
      )}

      {PICKS.map((pick, i) => {
        const booked = stage >= 3 + i;
        return (
          <g key={`${pick.x}-${pick.y}`}>
            <motion.rect
              x={pick.x}
              y={pick.y}
              width={CELL_W}
              height={CELL_H}
              rx={7}
              stroke={`url(#${id})`}
              strokeWidth={1.2}
              strokeDasharray="5 5"
              initial={false}
              animate={{ opacity: offered && !booked ? 1 : 0 }}
              transition={t(0.4, EASE, i * 0.12)}
            />
            <motion.g
              initial={false}
              animate={{ opacity: booked ? 1 : 0, scale: booked ? 1 : 0.82 }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              transition={t(0.5, POP)}
            >
              <rect
                x={pick.x}
                y={pick.y}
                width={CELL_W}
                height={CELL_H}
                rx={7}
                fill="rgba(124,106,255,.2)"
              />
              <rect
                x={pick.x}
                y={pick.y}
                width={CELL_W}
                height={CELL_H}
                rx={7}
                stroke={`url(#${id})`}
                strokeWidth={1.2}
              />
              <motion.path
                d={`M${pick.x + 23} ${pick.y + 17}l4.6 4.6 9.2-10`}
                stroke={`url(#${id})`}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: booked ? 1 : 0 }}
                transition={t(0.45, EASE, 0.14)}
              />
            </motion.g>
          </g>
        );
      })}
    </Stage>
  );
}

/* ------------------------------------------------------------ Leads */

/* Jede Anfrage kommt von links geflogen und rastet in der Kundenliste
   auf ihrer Zeile ein. */
const LEADS_STEPS = [260, 540, 580, 540, 540] as const;

const LEAD_ROWS = [74, 106, 138] as const;
const LEAD_X = 206;
const LEAD_W = 208;

function LeadsScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(LEADS_STEPS, playKey, reduced);
  const list = stage >= 1;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={150} cy={104} rx={190} ry={120} on={stage >= 2} t={t} />

      {/* Die Wege, auf denen die Anfragen hereinkommen, und die Stellen,
          von denen sie kommen. Formular, Anruf, Nachricht. */}
      {LEAD_ROWS.map((y) => (
        <path
          key={y}
          d={`M0 ${y + 12}H${LEAD_X}`}
          stroke={HAIR_SOFT}
          strokeDasharray="2 9"
        />
      ))}

      {LEAD_ROWS.map((y, i) => (
        <motion.g
          key={`quelle-${y}`}
          initial={false}
          animate={{ opacity: list ? 1 : 0 }}
          transition={t(0.45, EASE, i * 0.07)}
        >
          <rect
            x={54}
            y={y - 1}
            width={38}
            height={26}
            rx={7}
            fill={PLATE_DIM}
            stroke={HAIR_SOFT}
          />
          <rect x={63} y={y + 6} width={20} height={4} rx={2} fill={BAR_SOFT} />
          <rect x={63} y={y + 14} width={13} height={4} rx={2} fill={BAR_SOFT} />
        </motion.g>
      ))}

      <motion.g
        initial={false}
        animate={{ opacity: list ? 1 : 0, y: list ? 0 : 10 }}
        transition={t(0.55)}
      >
        <rect
          x={190}
          y={30}
          width={240}
          height={140}
          rx={12}
          fill={PLATE_DIM}
          stroke={HAIR}
        />
        {[
          { x: 206, w: 40 },
          { x: 262, w: 54 },
          { x: 344, w: 34 },
        ].map((head) => (
          <rect
            key={head.x}
            x={head.x}
            y={46}
            width={head.w}
            height={5}
            rx={2.5}
            fill={BAR_SOFT}
          />
        ))}
        <path d="M190 62H430" stroke={HAIR_SOFT} />
        {LEAD_ROWS.map((y) => (
          <rect
            key={y}
            x={LEAD_X}
            y={y}
            width={LEAD_W}
            height={24}
            rx={7}
            stroke={HAIR_SOFT}
            strokeDasharray="4 5"
          />
        ))}
      </motion.g>

      {LEAD_ROWS.map((y, i) => {
        const landed = stage >= 2 + i;
        return (
          <g key={y}>
            <motion.rect
              x={LEAD_X}
              y={y}
              width={LEAD_W}
              height={24}
              rx={7}
              stroke={`url(#${id})`}
              strokeWidth={1}
              initial={false}
              animate={{ opacity: landed ? 1 : 0 }}
              transition={t(0.4, EASE, 0.2)}
            />
            <motion.g
              initial={false}
              animate={{
                x: landed ? 0 : -250,
                y: landed ? 0 : -46,
                opacity: landed ? 1 : 0,
              }}
              transition={
                stage === 0
                  ? t(0)
                  : {
                      x: { duration: 0.62, ease: EASE },
                      y: { type: "spring", stiffness: 260, damping: 20, mass: 0.7 },
                      opacity: { duration: 0.3, ease: EASE },
                    }
              }
            >
              <rect
                x={LEAD_X}
                y={y}
                width={LEAD_W}
                height={24}
                rx={7}
                fill="rgba(244,244,246,.08)"
                stroke="rgba(244,244,246,.2)"
              />
              <circle
                cx={LEAD_X + 15}
                cy={y + 12}
                r={6}
                stroke={`url(#${id})`}
                strokeWidth={1.2}
              />
              <rect
                x={LEAD_X + 30}
                y={y + 6}
                width={92}
                height={4.5}
                rx={2.25}
                fill="rgba(244,244,246,.34)"
              />
              <rect
                x={LEAD_X + 30}
                y={y + 14}
                width={62}
                height={4}
                rx={2}
                fill={BAR_SOFT}
              />
              <rect
                x={LEAD_X + 152}
                y={y + 9}
                width={40}
                height={6}
                rx={3}
                fill="rgba(124,106,255,.4)"
              />
            </motion.g>
          </g>
        );
      })}
    </Stage>
  );
}

/* ----------------------------------------------------------- Bericht */

/* Die Zahlen wachsen von allein zusammen, die Linie darueber zeigt die
   Richtung, und am Ende steht der fertige Bericht. */
const REPORT_STEPS = [260, 760, 640, 560] as const;

const REPORT_BARS = [
  { x: 61, h: 38 },
  { x: 115, h: 56 },
  { x: 169, h: 46 },
  { x: 223, h: 74 },
  { x: 277, h: 62 },
  { x: 331, h: 92 },
  { x: 385, h: 110 },
] as const;

const BASE_Y = 164;
const TREND = REPORT_BARS.map((b) => `${b.x + 17},${BASE_Y - b.h}`).join(" ");

function ReportScene({ playKey, reduced }: SceneProps) {
  const id = useSceneId();
  const { stage, t } = useBeat(REPORT_STEPS, playKey, reduced);
  const grown = stage >= 1;
  const trend = stage >= 2;
  const summary = stage >= 3;

  return (
    <Stage viewBox={BOX}>
      <Defs id={id} w={480} h={200} />
      <Fog id={id} cx={330} cy={110} rx={196} ry={122} on={trend} t={t} />

      {[76, 120].map((y) => (
        <path
          key={y}
          d={`M0 ${y}H480`}
          stroke={HAIR_SOFT}
          strokeDasharray="2 9"
        />
      ))}
      <path d={`M0 ${BASE_Y}H480`} stroke={HAIR} />

      {REPORT_BARS.map((bar, i) => {
        const last = i === REPORT_BARS.length - 1;
        return (
          <motion.rect
            key={bar.x}
            x={bar.x + 0.6}
            y={BASE_Y + 0.6 - bar.h}
            width={33.8}
            height={bar.h - 1.2}
            rx={4}
            fill={last ? "rgba(124,106,255,.18)" : "none"}
            stroke={`url(#${id}-up)`}
            strokeWidth={1.2}
            initial={false}
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            animate={{ scaleY: grown ? 1 : 0, opacity: grown ? 1 : 0 }}
            transition={t(0.6, LIFT, i * 0.075)}
          />
        );
      })}

      <motion.polyline
        points={TREND}
        stroke={`url(#${id})`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: trend ? 1 : 0, opacity: trend ? 1 : 0 }}
        transition={t(0.85)}
      />
      <motion.circle
        cx={402}
        cy={BASE_Y - 110}
        r={4.4}
        fill={`url(#${id})`}
        initial={false}
        animate={{ scale: trend ? 1 : 0, opacity: trend ? 1 : 0 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transition={t(0.5, POP, 0.6)}
      />

      <motion.g
        initial={false}
        animate={{ opacity: summary ? 1 : 0, y: summary ? 0 : 8 }}
        transition={t(0.55)}
      >
        <rect
          x={52}
          y={24}
          width={132}
          height={44}
          rx={10}
          fill={DEEP}
          stroke={HAIR}
        />
        <rect x={68} y={38} width={58} height={7} rx={3.5} fill={GLYPH} />
        <rect x={68} y={52} width={86} height={5} rx={2.5} fill={BAR_SOFT} />
      </motion.g>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  Auswahl                                                            */
/* ------------------------------------------------------------------ */

const SCENES: Record<
  TileId,
  Readonly<{
    steps: readonly number[];
    render: (props: SceneProps) => React.ReactElement;
  }>
> = {
  email: { steps: EMAIL_STEPS, render: EmailScene },
  chat: { steps: CHAT_STEPS, render: ChatScene },
  invoice: { steps: INVOICE_STEPS, render: InvoiceScene },
  calendar: { steps: CALENDAR_STEPS, render: CalendarScene },
  leads: { steps: LEADS_STEPS, render: LeadsScene },
  report: { steps: REPORT_STEPS, render: ReportScene },
};

/** Dauer einer Kachelszene. Bremst zu schnelle erneute Anlaeufe. */
export function tileTotal(id: TileId): number {
  return totalOf(SCENES[id].steps);
}

export function TileScene({
  id,
  ...rest
}: SceneProps & Readonly<{ id: TileId }>) {
  const Component = SCENES[id].render;
  return <Component {...rest} />;
}
