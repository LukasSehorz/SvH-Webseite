"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useInView } from "framer-motion";
import { kiStack } from "../../copy";
import {
  Reveal,
  SectionLabel,
  SplitHeadline,
  useSafeReducedMotion,
} from "../system/ui";
import { useScenesActive } from "./Scenes";

/* ------------------------------------------------------------------ */
/*  /ki · Der Aufbau                                                   */
/*                                                                     */
/*  Unten liegt das Fundament Corporate LLM, darueber stehen drei      */
/*  Felder. Beim Eintritt gleitet das Fundament von unten ein, dann    */
/*  fallen die drei Felder gestaffelt von oben, und zuletzt steigen    */
/*  Lichtpunkte aus dem Fundament in die drei Felder auf. Sie          */
/*  fliessen danach langsam weiter, solange die Sektion im Bild und    */
/*  der Tab sichtbar ist. Bei reduzierter Bewegung steht das fertige   */
/*  Bild mit drei ruhigen Faeden.                                      */
/*                                                                     */
/*  Der Auftraggeber hat genau dieses Bild zurueckverlangt, seine      */
/*  Worte stehen in copy.ts ueber kiStack.                             */
/* ------------------------------------------------------------------ */

/* ---------------------------------------------------------- Zeichen */

/**
 * Die drei Linien-Icons der Felder, auf dem Raster von 24 mit
 * Strichstaerke 1.4, so wie die acht Zeichen in Marks.tsx.
 */
const ICONS: Record<string, React.ReactNode> = {
  /* Zwei Pfeile, die einen Kreis schliessen. Arbeit, die von allein
     weiterlaeuft. */
  automation: (
    <>
      <path d="M4.4 12A7.6 7.6 0 0 1 17.4 6.6" />
      <path d="M14 6.3 17.4 6.6 17.1 3.2" />
      <path d="M19.6 12A7.6 7.6 0 0 1 6.6 17.4" />
      <path d="M10 17.7 6.6 17.4 6.9 20.8" />
    </>
  ),

  /* Sprechblase mit einer Tonspur darin. Telefon und Chat, die selbst
     antworten. */
  agents: (
    <>
      <path d="M5 4.6h14a2.4 2.4 0 0 1 2.4 2.4v7.2a2.4 2.4 0 0 1-2.4 2.4h-8.2L6.4 20v-3.4H5a2.4 2.4 0 0 1-2.4-2.4V7a2.4 2.4 0 0 1 2.4-2.4Z" />
      <path d="M8.6 9.4v2.6" />
      <path d="M12 8v5.4" />
      <path d="M15.4 9.4v2.6" />
    </>
  ),

  /* Ein Bildschirm mit drei Feldern. Der ganze Betrieb auf einem
     Bildschirm. */
  os: (
    <>
      <rect x="3" y="4.4" width="18" height="12.6" rx="2.2" />
      <path d="M3 9.2h18" />
      <path d="M10 9.2v7.8" />
      <path d="M12 17v3" />
      <path d="M8.6 20h6.8" />
    </>
  ),
};

function StackIcon({ id }: Readonly<{ id: string }>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[id] ?? ICONS.automation}
    </svg>
  );
}

/** Eindeutige, fuer `url(#…)` taugliche Kennung je Instanz. */
function useLocalId(): string {
  const raw = useId();
  return useMemo(() => `k${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`, [raw]);
}

/**
 * Das Ring-Emblem im Fundament. Ein duenner Kreis mit Verlaufsstrich,
 * der ruhig atmet, dazu ein stehender innerer Ring und ein heller Kern.
 */
function Emblem() {
  const id = useLocalId();
  return (
    <span className="ki-stack-emblem" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5B8CFF" />
            <stop offset="50%" stopColor="#7C6AFF" />
            <stop offset="100%" stopColor="#B9A5FF" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="19" stroke="var(--line)" strokeWidth="1" />
        <circle
          className="ki-stack-emblem-pulse"
          cx="32"
          cy="32"
          r="27"
          stroke={`url(#${id})`}
          strokeWidth="1.5"
        />
      </svg>
      <span className="ki-stack-emblem-core" />
    </span>
  );
}

/* --------------------------------------------------------- Partikel */

/** Die Rampe des Systems. */
const COLORS: readonly (readonly [number, number, number])[] = [
  [0x5b, 0x8c, 0xff],
  [0x7c, 0x6a, 0xff],
  [0xb9, 0xa5, 0xff],
];

/**
 * Anteile der drei Toene je Faden. Der Faden in das blaue Feld traegt
 * mehr Blau, der in das lavendelfarbene Feld mehr Lavendel. So bleibt
 * das Bild insgesamt lila, wie der Auftraggeber es beschrieben hat, und
 * die drei Faeden sind trotzdem zu unterscheiden.
 */
const TONES: readonly (readonly [number, number, number])[] = [
  [0.45, 0.4, 0.15],
  [0.15, 0.55, 0.3],
  [0.1, 0.35, 0.55],
];

/** Hoechstzahl der Punkte. Gezeichnet wird je nach Breite ein Teil davon. */
const MAX_DOTS = 150;

/** Umlaufdauer eines Punktes in Millisekunden, Unter- und Obergrenze. */
const TRAVEL_MIN = 2500;
const TRAVEL_SPAN = 2000;

/**
 * Bezugslaenge einer Bahn. Laengere Bahnen, wie auf dem Telefon, wo die
 * Felder uebereinander stehen, laufen mit der Wurzel des Verhaeltnisses
 * langsamer, damit die Punkte dort nicht rasen.
 */
const REF_LENGTH = 180;

/** Abstand vom Fundament bis zum Start des Flusses und Dauer des Einblendens. */
const FLOW_DELAY = 1400;
const FLOW_FADE = 1500;

/** Zahl der stehenden Punkte je Faden im ruhenden Bild. */
const STILL_DOTS = 10;

type Box = { x0: number; y0: number; x1: number; y1: number };

type Geo = {
  w: number;
  h: number;
  found: Box;
  cards: Box[];
  /* Auf schmalen Schirmen stehen die Felder uebereinander, und die
     Faeden steigen rechts neben ihnen in einer freien Spur auf. */
  stacked: boolean;
  /* Laengenfaktor je Faden fuer die Laufzeit. */
  scale: number[];
};

type Dot = {
  strand: number;
  t: number;
  dur: number;
  size: number;
  color: number;
  su: number;
  eu: number;
  c1: number;
  c2: number;
  amp: number;
  freq: number;
  phase: number;
};

/** Fester Zufall, damit die Buehne bei jedem Aufbau gleich beginnt. */
function makeRand(seedStart: number): () => number {
  let seed = seedStart;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function pickColor(strand: number, r: number): number {
  const tone = TONES[strand];
  if (r < tone[0]) return 0;
  if (r < tone[0] + tone[1]) return 1;
  return 2;
}

/** Wuerfelt die Bahn eines Punktes neu, beim Start wie bei jedem Neustart. */
function reroll(dot: Dot, rand: () => number): void {
  dot.su = rand();
  dot.eu = rand();
  /* Die Stuetzpunkte weichen hoechstens 28 Bildpunkte zur Seite aus. Mit
     35 lagen die Bahnen so weit auseinander, dass die drei Buendel wie
     Wolken und nicht wie Faeden gelesen wurden. */
  dot.c1 = (rand() - 0.5) * 56;
  dot.c2 = (rand() - 0.5) * 56;
  dot.amp = 1.5 + rand() * 4;
  dot.freq = 1.2 + rand() * 1.8;
  dot.phase = rand() * Math.PI * 2;
  dot.dur = TRAVEL_MIN + rand() * TRAVEL_SPAN;
  dot.size = 1.5 + rand();
  dot.color = pickColor(dot.strand, rand());
}

function makeDots(rand: () => number): Dot[] {
  return Array.from({ length: MAX_DOTS }, (unused, index) => {
    const dot: Dot = {
      strand: index % 3,
      /* Alle Punkte beginnen unter dem Fundament und tauchen nach und
         nach auf. So sieht man beim ersten Mal, wie die Faeden aus dem
         Fundament wachsen, statt dass sie fertig dastehen. */
      t: -rand(),
      dur: 0,
      size: 0,
      color: 0,
      su: 0,
      eu: 0,
      c1: 0,
      c2: 0,
      amp: 0,
      freq: 0,
      phase: 0,
    };
    reroll(dot, rand);
    return dot;
  });
}

/**
 * Ein weicher Lichtpunkt als Kachel. Ein Bild je Ton, beim Zeichnen nur
 * noch skaliert. Das ist um ein Vielfaches billiger als je Punkt zwei
 * Kreise mit Verlauf zu fuellen.
 */
function makeSprite(
  rgb: readonly [number, number, number],
  dpr: number,
): HTMLCanvasElement {
  const R = 16;
  const sprite = document.createElement("canvas");
  sprite.width = R * 2 * dpr;
  sprite.height = R * 2 * dpr;
  const g = sprite.getContext("2d");
  if (!g) return sprite;
  g.scale(dpr, dpr);
  const [r, gg, b] = rgb;
  const grad = g.createRadialGradient(R, R, 0, R, R, R);
  grad.addColorStop(0, `rgba(${r},${gg},${b},1)`);
  grad.addColorStop(0.28, `rgba(${r},${gg},${b},0.82)`);
  grad.addColorStop(0.5, `rgba(${r},${gg},${b},0.2)`);
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, R * 2, R * 2);
  return sprite;
}

/**
 * Die vier Stuetzpunkte der Bahn eines Punktes, geschrieben in `out`.
 *
 * Stehen die Felder nebeneinander, beginnt die Bahn auf der Oberkante des
 * Fundaments, leicht zur Mitte hin gezogen, und endet in der Unterkante
 * des Feldes. Stehen die Felder uebereinander, wird das unterste Feld wie
 * oben von unten erreicht, die beiden oberen ueber die freie Spur rechts,
 * und der Punkt biegt auf Hoehe des Feldes nach links hinein.
 */
function pathOf(
  strand: number,
  su: number,
  eu: number,
  c1: number,
  c2: number,
  geo: Geo,
  out: Float64Array,
): void {
  const card = geo.cards[strand];
  const found = geo.found;
  const foundCx = (found.x0 + found.x1) / 2;
  const sy = found.y0 + 14;

  const side =
    geo.stacked && card.y1 < geo.cards[geo.cards.length - 1].y0;

  if (!side) {
    const cardW = card.x1 - card.x0;
    const cardCx = (card.x0 + card.x1) / 2;
    /* Start ueber gut zwei Drittel der Feldbreite, leicht zur Mitte des
       Fundaments gezogen, Ziel ueber siebzig Prozent der Feldbreite. So
       bleibt jedes Buendel als ein Faden lesbar und faechert erst im Feld
       auf. */
    let sx = cardCx + (foundCx - cardCx) * 0.28 + (su - 0.5) * cardW * 0.66;
    sx = Math.min(found.x1 - 16, Math.max(found.x0 + 16, sx));
    const ex = card.x0 + cardW * (0.15 + eu * 0.7);
    const ey = card.y1 - 16;
    out[0] = sx;
    out[1] = sy;
    out[2] = sx + c1;
    out[3] = sy + (ey - sy) * 0.38;
    out[4] = ex + c2;
    out[5] = sy + (ey - sy) * 0.66;
    out[6] = ex;
    out[7] = ey;
    return;
  }

  const lowest = geo.cards[geo.cards.length - 1];
  const laneX0 = lowest.x1 + 6;
  const laneX1 = found.x1 - 10;
  const laneCx = (laneX0 + laneX1) / 2;
  let sx = laneX0 - 28 + (laneX1 - laneX0 + 28) * su;
  sx = Math.min(found.x1 - 12, Math.max(found.x0 + 12, sx));
  const cardH = card.y1 - card.y0;
  const ex = card.x1 - 16;
  const ey = card.y0 + cardH * (0.2 + eu * 0.6);
  out[0] = sx;
  out[1] = sy;
  out[2] = laneCx + c1 * 0.3;
  out[3] = sy + (ey - sy) * 0.55;
  out[4] = laneCx + 6 + c2 * 0.25;
  out[5] = ey;
  out[6] = ex;
  out[7] = ey;
}

function bez(a: number, b: number, c: number, d: number, t: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/* ------------------------------------------------------------ Bau */

export default function KiStack() {
  const reduced = useSafeReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foundRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  /* Sichtbarkeit und Tab entscheiden, ob gezeichnet wird. */
  const active = useScenesActive(frameRef);

  /* Die Aufbau-Choreografie laeuft genau einmal, sobald ein Viertel des
     Containers im Bild steht. */
  const seen = useInView(frameRef, { once: true, amount: 0.25 });
  const built = reduced || seen;

  const dotsRef = useRef<Dot[] | null>(null);
  const randRef = useRef<(() => number) | null>(null);
  const bornRef = useRef(0);

  /* Der Fluss beginnt, wenn die Karten gelandet sind. */
  useEffect(() => {
    if (!built || reduced || bornRef.current) return;
    bornRef.current = performance.now() + FLOW_DELAY;
  }, [built, reduced]);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const found = foundRef.current;
    if (!frame || !canvas || !found) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!randRef.current) randRef.current = makeRand(20260903);
    const rand = randRef.current;
    if (!dotsRef.current) dotsRef.current = makeDots(rand);
    const dots = dotsRef.current;

    let geo: Geo | null = null;
    let dpr = 0;
    let sprites: HTMLCanvasElement[] = [];
    let count = 0;
    const pts = new Float64Array(8);

    /** Lage eines Elements relativ zur Innenkante des Containers, ohne
        laufende Transformationen, deshalb ueber die Offset-Kette. */
    const boxOf = (el: HTMLElement): Box => {
      let x = 0;
      let y = 0;
      let node: HTMLElement | null = el;
      while (node && node !== frame) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return { x0: x, y0: y, x1: x + el.offsetWidth, y1: y + el.offsetHeight };
    };

    const measure = () => {
      const w = Math.max(1, frame.clientWidth);
      const h = Math.max(1, frame.clientHeight);
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextDpr !== dpr) {
        dpr = nextDpr;
        sprites = COLORS.map((rgb) => makeSprite(rgb, dpr));
      }
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cards = cardRefs.current
        .filter((el): el is HTMLLIElement => el !== null)
        .map(boxOf);
      if (cards.length < 3) {
        geo = null;
        return;
      }
      const foundBox = boxOf(found);
      const stacked = cards[1].y0 >= cards[0].y1 - 1;

      /* Mittlere Bahnlaenge je Faden fuer den Laufzeitfaktor. */
      const draft: Geo = { w, h, found: foundBox, cards, stacked, scale: [] };
      draft.scale = cards.map((unused, strand) => {
        pathOf(strand, 0.5, 0.5, 0, 0, draft, pts);
        const dx = pts[6] - pts[0];
        const dy = pts[7] - pts[1];
        const len = Math.sqrt(dx * dx + dy * dy) * 1.12;
        return Math.sqrt(Math.max(40, len) / REF_LENGTH);
      });
      geo = draft;

      /* Je breiter der Container, desto mehr Punkte, innerhalb der
         Grenzen von 90 und 150. */
      count = Math.round(Math.min(MAX_DOTS, Math.max(90, w / 11)));
    };

    const drawDot = (x: number, y: number, size: number, color: number, alpha: number) => {
      const s = size * 3.4;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprites[color], x - s, y - s, s * 2, s * 2);
    };

    const drawFlow = (birth: number) => {
      const g = geo;
      if (!g) return;
      ctx.clearRect(0, 0, g.w, g.h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < count; i += 1) {
        const dot = dots[i];
        const t = dot.t;
        if (t < 0 || t > 1) continue;
        const env = t < 0.14 ? t / 0.14 : t > 0.86 ? (1 - t) / 0.14 : 1;
        const alpha = env * birth * 0.9;
        if (alpha <= 0.01) continue;

        pathOf(dot.strand, dot.su, dot.eu, dot.c1, dot.c2, g, pts);
        const wob = Math.sin(dot.freq * t * Math.PI * 2 + dot.phase) * dot.amp * env;
        const x = bez(pts[0], pts[2], pts[4], pts[6], t) + wob;
        const y = bez(pts[1], pts[3], pts[5], pts[7], t);
        drawDot(x, y, dot.size, dot.color, alpha);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    /** Das ruhende Bild bei reduzierter Bewegung. Drei feine Faeden und
        einige stehende Punkte darauf, sonst nichts. */
    const drawStill = () => {
      const g = geo;
      if (!g) return;
      ctx.clearRect(0, 0, g.w, g.h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const SAMPLES = 40;

      for (let strand = 0; strand < 3; strand += 1) {
        const [r, gg, b] = COLORS[strand === 0 ? 0 : strand === 1 ? 1 : 2];
        pathOf(strand, 0.5, 0.5, 0, 0, g, pts);
        ctx.beginPath();
        for (let i = 0; i <= SAMPLES; i += 1) {
          const t = i / SAMPLES;
          const x = bez(pts[0], pts[2], pts[4], pts[6], t);
          const y = bez(pts[1], pts[3], pts[5], pts[7], t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(${r},${gg},${b},0.06)`;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${gg},${b},0.12)`;
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${gg},${b},0.4)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let k = 0; k < STILL_DOTS; k += 1) {
          const dot = dots[k * 3 + strand];
          const t = (k + 0.5) / STILL_DOTS;
          const spread = (dot.su - 0.5) * 22;
          const x = bez(pts[0], pts[2], pts[4], pts[6], t) + spread;
          const y = bez(pts[1], pts[3], pts[5], pts[7], t);
          drawDot(x, y, dot.size, dot.color, 0.85);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    /* --------------------------------------------- ruhendes Bild */

    if (reduced) {
      const paint = () => {
        measure();
        drawStill();
      };
      paint();
      const observer = new ResizeObserver(paint);
      observer.observe(frame);
      return () => observer.disconnect();
    }

    /* -------------------------------------------- laufendes Bild */

    let raf = 0;
    let last = 0;
    let running = false;

    const frameStep = (now: number) => {
      raf = requestAnimationFrame(frameStep);
      const delta = last ? Math.min(now - last, 64) : 16;
      last = now;

      const g = geo;
      if (!g) return;
      const born = bornRef.current;
      if (!born || now < born) return;
      const birth = Math.min(1, (now - born) / FLOW_FADE);

      for (let i = 0; i < count; i += 1) {
        const dot = dots[i];
        dot.t += delta / (dot.dur * g.scale[dot.strand]);
        if (dot.t > 1) {
          /* Neustart unter dem Fundament mit neuer Bahn, damit die Faeden
             lebendig bleiben und nicht als Schleife auffallen. */
          reroll(dot, rand);
          dot.t = -rand() * 0.25;
        }
      }

      drawFlow(birth);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frameStep);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
      if (!running && bornRef.current) drawFlow(1);
    });
    observer.observe(frame);

    if (built && active) start();

    return () => {
      stop();
      observer.disconnect();
    };
  }, [reduced, built, active]);

  return (
    <section className="section ki-stack" id="aufbau">
      <div className="shell">
        <Reveal>
          <div className="ki-stack-head">
            <SectionLabel>{kiStack.label}</SectionLabel>
            <div className="ki-stack-head-grid">
              <SplitHeadline
                as="h2"
                className="t-h1 ki-stack-title"
                before={kiStack.titleBefore}
                word={kiStack.gradientWord}
                after={kiStack.titleAfter}
              />
              <p className="t-body-lg ki-stack-intro">{kiStack.intro}</p>
            </div>
          </div>
        </Reveal>

        <div
          ref={frameRef}
          className="ki-stack-frame"
          data-built={built ? "true" : "false"}
          data-active={active ? "true" : "false"}
        >
          <canvas ref={canvasRef} className="ki-stack-canvas" aria-hidden="true" />

          <ul className="ki-stack-modules">
            {kiStack.modules.map((module, index) => (
              <li
                key={module.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="ki-stack-module"
                data-tone={module.id}
              >
                <span className="ki-stack-icon">
                  <StackIcon id={module.id} />
                </span>
                <h3 className="t-h3 ki-stack-module-title">{module.title}</h3>
                <p className="ki-stack-line">{module.line}</p>
                <ul className="ki-stack-tags">
                  {module.tags.map((tag) => (
                    <li key={tag} className="ki-stack-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div ref={foundRef} className="ki-stack-foundation">
            <div className="ki-stack-foundation-text">
              <h3 className="t-h3 ki-stack-foundation-title">
                {kiStack.foundation.title}
              </h3>
              <p className="ki-stack-line">{kiStack.foundation.subtitle}</p>
            </div>
            <Emblem />
            <ul className="ki-stack-tags ki-stack-foundation-tags">
              {kiStack.foundation.tags.map((tag) => (
                <li key={tag} className="ki-stack-tag">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Reveal>
          <p className="t-body-lg ki-stack-closing">{kiStack.closing}</p>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.ki-stack` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `Reveal` weiterreicht.
      */}
      <style jsx global>{`
        .ki-stack .ki-stack-head-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px 64px;
          align-items: start;
        }

        .ki-stack .ki-stack-title {
          max-width: 16ch;
          text-wrap: balance;
        }

        .ki-stack .ki-stack-intro {
          padding-top: 8px;
        }

        /* Der Container nimmt die Schale, bleibt auf sehr breiten Schirmen
           aber bei 1500 Bildpunkten stehen und steht mittig. Bei voller
           Breite von 2240 wuerden die drei Felder so breit, dass ihre
           kurzen Zeilen in leerer Flaeche stuenden. */
        .ki-stack .ki-stack-frame {
          position: relative;
          width: 100%;
          max-width: 1500px;
          margin: clamp(40px, 5vw, 72px) auto 0;
          padding: clamp(20px, 3vw, 48px);
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--bg-raise);
          overflow: hidden;
        }

        /* Die Punkte liegen zwischen dem Grund und den Karten. Weil die
           Karten deckend sind, verschwindet jeder Punkt genau an der
           Kante, an der er in sein Feld eintritt. */
        .ki-stack .ki-stack-canvas {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .ki-stack .ki-stack-modules {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* Vor dem Eintritt haengen die Felder etwas ueber ihrem Platz und
           sind unsichtbar. Sobald der Container gesehen wurde, fallen sie
           nacheinander ein, das erste zuerst. */
        .ki-stack .ki-stack-module {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 24px 24px 26px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--bg-raise);
          opacity: 0;
          transform: translateY(-28px);
          transition:
            opacity 0.6s var(--ease-out-expo),
            transform 0.6s var(--ease-out-expo);
        }

        .ki-stack .ki-stack-module:nth-child(1) {
          transition-delay: 0.7s;
        }

        .ki-stack .ki-stack-module:nth-child(2) {
          transition-delay: 0.82s;
        }

        .ki-stack .ki-stack-module:nth-child(3) {
          transition-delay: 0.94s;
        }

        /* Ein Hauch Toenung je Feld, gelegt ueber den deckenden Grund. Der
           Grund muss deckend sein, damit die Punkte hinter der Karte
           tatsaechlich verschwinden. */
        .ki-stack .ki-stack-module[data-tone="automation"] {
          background:
            linear-gradient(rgba(91, 140, 255, 0.05), rgba(91, 140, 255, 0.05)),
            var(--bg-raise);
        }

        .ki-stack .ki-stack-module[data-tone="agents"] {
          background:
            linear-gradient(rgba(124, 106, 255, 0.05), rgba(124, 106, 255, 0.05)),
            var(--bg-raise);
        }

        .ki-stack .ki-stack-module[data-tone="os"] {
          background:
            linear-gradient(rgba(185, 165, 255, 0.05), rgba(185, 165, 255, 0.05)),
            var(--bg-raise);
        }

        .ki-stack .ki-stack-icon {
          display: inline-flex;
          color: var(--ink-3);
        }

        /* Unter 1500 Bildpunkten Schalenbreite schrumpfen die Titel leicht,
           damit das laengste Wort in einem Feld von 270 Bildpunkten noch
           in eine Zeile passt. */
        .ki-stack .ki-stack-module-title {
          font-size: clamp(20px, 1.6vw, 24px);
        }

        .ki-stack .ki-stack-line {
          font-family: var(--font-sans);
          font-size: 15.5px;
          font-weight: 400;
          line-height: 1.5;
          color: var(--ink-2);
          margin: -6px 0 0;
        }

        .ki-stack .ki-stack-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          list-style: none;
          margin: 4px 0 0;
          padding: 0;
        }

        .ki-stack .ki-stack-tag {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border: 1px solid var(--line);
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.2;
          color: var(--ink-2);
        }

        /* Das Fundament traegt einen kraeftigeren Rahmen und einen leisen
           Schein an der Oberkante, denn aus dieser Kante steigen die
           Punkte auf. Der Zwischenraum darueber ist die Buehne der Faeden. */
        .ki-stack .ki-stack-foundation {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 20px 32px;
          margin-top: clamp(72px, 9vw, 150px);
          padding: 26px 28px;
          border: 1px solid rgba(124, 106, 255, 0.5);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(124, 106, 255, 0.16), rgba(124, 106, 255, 0) 46%),
            linear-gradient(rgba(124, 106, 255, 0.08), rgba(124, 106, 255, 0.08)),
            var(--bg-raise);
          box-shadow: inset 0 0 48px rgba(124, 106, 255, 0.1);
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.8s var(--ease-out-expo),
            transform 0.8s var(--ease-out-expo);
        }

        .ki-stack .ki-stack-frame[data-built="true"] .ki-stack-module,
        .ki-stack .ki-stack-frame[data-built="true"] .ki-stack-foundation {
          opacity: 1;
          transform: none;
        }

        .ki-stack .ki-stack-foundation-text {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ki-stack .ki-stack-foundation-tags {
          justify-content: flex-end;
          margin: 0;
        }

        .ki-stack .ki-stack-emblem {
          position: relative;
          display: inline-flex;
          flex: 0 0 auto;
          width: 64px;
          height: 64px;
        }

        .ki-stack .ki-stack-emblem::before {
          content: "";
          position: absolute;
          inset: -40%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(124, 106, 255, 0.3),
            rgba(124, 106, 255, 0) 68%
          );
        }

        .ki-stack .ki-stack-emblem svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* Der Ring atmet nur, solange die Sektion im Bild ist. */
        .ki-stack .ki-stack-emblem-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: ki-stack-pulse 3s ease-in-out infinite;
          animation-play-state: paused;
        }

        .ki-stack .ki-stack-frame[data-active="true"] .ki-stack-emblem-pulse {
          animation-play-state: running;
        }

        .ki-stack .ki-stack-emblem-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 7px;
          margin: -3.5px 0 0 -3.5px;
          border-radius: 50%;
          background: var(--acc-lav);
          box-shadow: 0 0 12px rgba(185, 165, 255, 0.8);
        }

        @keyframes ki-stack-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        .ki-stack .ki-stack-closing {
          margin-top: clamp(36px, 4vw, 56px);
        }

        @media (max-width: 1023px) {
          .ki-stack .ki-stack-head-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .ki-stack .ki-stack-intro {
            padding-top: 0;
          }

          /* Die Felder stehen untereinander, rechts bleibt eine freie Spur
             von 64 Bildpunkten. In ihr steigen die Faeden zu den oberen
             Feldern auf; das unterste Feld erreichen sie von unten. */
          .ki-stack .ki-stack-modules {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
            padding-right: 64px;
          }

          .ki-stack .ki-stack-module {
            padding: 20px 20px 22px;
            gap: 12px;
          }

          .ki-stack .ki-stack-module-title,
          .ki-stack .ki-stack-foundation-title {
            font-size: 21px;
          }

          .ki-stack .ki-stack-foundation {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 18px 20px;
            padding: 22px 20px 24px;
          }

          .ki-stack .ki-stack-foundation-tags {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }

          .ki-stack .ki-stack-emblem {
            width: 52px;
            height: 52px;
          }
        }

        /* Auf dem Telefon wird die Spur schmaler. Mit 64 Bildpunkten blieb
           jedem Feld nur rund 200 Bildpunkte Innenbreite, und jede Pille
           stand allein in ihrer Zeile. Fuer einen Faden aus Punkten von
           zwei Bildpunkten reichen 48. */
        @media (max-width: 639px) {
          .ki-stack .ki-stack-modules {
            padding-right: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ki-stack .ki-stack-module,
          .ki-stack .ki-stack-foundation {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .ki-stack .ki-stack-emblem-pulse {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
