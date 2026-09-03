"use client";

import { useEffect, useRef } from "react";
import { aboutPage } from "../../copy";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Drei Straenge werden zu einem                         */
/*                                                                     */
/*  Die Aussage der Buehne lautet, dass Webseite, Social Media und     */
/*  KI bei SVH an einer Stelle zusammenlaufen statt bei drei           */
/*  Anbietern. Die Bewegung sagt genau das und braucht dafuer keinen   */
/*  erklaerenden Satz. Zuerst stehen drei getrennte Bahnen, dann       */
/*  biegen sie zueinander und enden in einem einzigen hellen Punkt.    */
/*                                                                     */
/*  Seit dem 03.09.2026 steht die Buehne im ersten Bildschirm der      */
/*  Seite und nicht mehr in einer eigenen Sektion darunter. Dort war   */
/*  sie an einen Scroll-Scrub gebunden; im Kopf ist sie sofort im Bild */
/*  und ein Scrub haette nichts zu fuehren. Deshalb laeuft das         */
/*  Zusammenfuehren jetzt einmal zeitgesteuert nach dem Laden ab und   */
/*  bleibt danach verbunden. Bei Beruehrung der Buehne loesen sich die */
/*  Bahnen noch einmal und laufen erneut zusammen.                     */
/*                                                                     */
/*  Die Zeichnung selbst, also Bahnen, Farben, Punkte und Sammelring,  */
/*  ist abgenommen und unveraendert. Geaendert sind nur Ort und        */
/*  Antrieb.                                                           */
/* ------------------------------------------------------------------ */

/** Waagerechte Startlage der drei Straenge, als Anteil der Buehnenbreite. */
const SOURCES = [0.15, 0.5, 0.85] as const;

/**
 * Senkrechte Marken der Bahn, als Anteil der Hoehe. Zwischen Kopf und
 * Naht schwingt der Strang seitlich ein, zwischen Naht und Fusz laeuft er
 * senkrecht weiter. Bei vollem Verbindungsgrad liegen alle drei
 * Fuszstuecke uebereinander, und aus den drei Bahnen wird sichtbar ein
 * einziger heller Strang. Genau das ist die Aussage der Buehne.
 */
const Y_TOP = 0.2;
const Y_JOIN = 0.66;
const Y_FOOT = 0.84;

/** Anteil der Bahn, der auf das seitliche Einschwingen entfaellt. */
const JOIN_AT = 0.74;

/** Die Rampe des Systems, je ein Ton pro Strang. */
const COLORS = [
  [0x5b, 0x8c, 0xff],
  [0x7c, 0x6a, 0xff],
  [0xb9, 0xa5, 0xff],
] as const;

/** Laufende Punkte je Strang und Umlaufdauer eines Punktes. */
const DOTS_PER_STRAND = 7;
const TRAVEL_MS = 3400;

/**
 * Zeitplan des Zusammenlaufens in Millisekunden.
 *
 * Nach dem Laden halten die drei Bahnen erst eine gute Sekunde getrennt,
 * damit der Ausgangszustand ueberhaupt gesehen wird, bevor er sich
 * veraendert. Dann laufen sie in knapp zwei Sekunden zusammen. Beim
 * erneuten Anlaufen durch Beruehrung loesen sich die Bahnen zuerst
 * wieder, stehen kurz getrennt und laufen dann noch einmal zusammen;
 * ein harter Sprung zurueck auf drei Bahnen saehe wie ein Fehler aus.
 */
const HOLD_MS = 1200;
const MERGE_MS = 1800;
const RELEASE_MS = 500;
const REHOLD_MS = 800;

type Phase = "hold" | "merge" | "done" | "release";

function bezier(a: number, b: number, c: number, d: number, t: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/**
 * Die Ausklingkurve des Zusammenlaufens. Sie ist dieselbe, die die Buehne
 * schon am Scrub hatte, damit die abgenommene Bewegung gleich bleibt.
 */
function easeOut(progress: number): number {
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  return 1 - Math.pow(1 - clamped, 3);
}

/** Deckkraft des Namens am Fusz aus dem Verbindungsgrad. */
function targetOpacity(merge: number): number {
  return Math.min(1, Math.max(0, (merge - 0.6) / 0.35));
}

/**
 * Die Buehne mit den drei Straengen. Sie fuellt die Breite und Hoehe, die
 * ihr Elternteil vorgibt, und bringt Beschriftungen und Namen mit. Der
 * Hero stellt sie ab 1024 Bildpunkten rechts neben den Text.
 */
export function StrandsFigure({ className }: Readonly<{ className?: string }>) {
  const reduced = useSafeReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLParagraphElement>(null);

  /* Der Verbindungsgrad. Null heiszt drei getrennte Bahnen, eins heiszt
     ein gemeinsamer Endpunkt. Die Zeichenschleife liest den Wert, der
     Zeitplan schreibt ihn. */
  const mergeRef = useRef(reduced ? 1 : 0);

  /* Das erneute Anlaufen wird von der Zeichenschleife bereitgestellt,
     weil nur sie den Zeitplan kennt. Ohne laufende Schleife bleibt der
     Aufruf ohne Wirkung. */
  const replayRef = useRef<(() => void) | null>(null);

  /* ------------------------------------------------------ Zeichnen */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* Fester Zufall, damit die Buehne bei jedem Aufbau gleich aussieht. */
    let seed = 20260901;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const dots = SOURCES.map((_, strand) =>
      Array.from({ length: DOTS_PER_STRAND }, (unused, index) => ({
        strand,
        t: index / DOTS_PER_STRAND + rand() * 0.03,
        speed: 0.9 + rand() * 0.2,
        size: 1.4 + rand() * 0.9,
      })),
    ).flat();

    /** Endlage eines Stranges. Bei vollem Verbindungsgrad liegt sie mittig. */
    const endX = (strand: number, merge: number) =>
      SOURCES[strand] + (0.5 - SOURCES[strand]) * merge;

    const pointAt = (strand: number, merge: number, t: number) => {
      const x0 = SOURCES[strand] * width;
      const x3 = endX(strand, merge) * width;
      const y0 = Y_TOP * height;
      const yJoin = Y_JOIN * height;
      const yFoot = Y_FOOT * height;

      if (t <= JOIN_AT) {
        const local = t / JOIN_AT;
        const span = yJoin - y0;
        return [
          bezier(x0, x0, x3, x3, local),
          bezier(y0, y0 + span * 0.42, yJoin - span * 0.42, yJoin, local),
        ] as const;
      }

      const local = (t - JOIN_AT) / (1 - JOIN_AT);
      return [x3, yJoin + (yFoot - yJoin) * local] as const;
    };

    const SAMPLES = 72;

    const draw = () => {
      /* Der Wert kommt bereits fertig gerechnet aus dem Zeitplan. */
      const merge = mergeRef.current;

      ctx.clearRect(0, 0, width, height);

      const cx = 0.5 * width;
      const cy = Y_FOOT * height;

      /* Farbnebel am Sammelpunkt. Er waechst mit dem Verbindungsgrad und
         gibt dem Ende der Bewegung ein Gewicht. */
      if (merge > 0.02) {
        const radius = Math.max(40, width * 0.3);
        const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        fog.addColorStop(0, `rgba(124,106,255,${0.26 * merge})`);
        fog.addColorStop(0.45, `rgba(91,140,255,${0.09 * merge})`);
        fog.addColorStop(1, "rgba(91,140,255,0)");
        ctx.fillStyle = fog;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let strand = 0; strand < SOURCES.length; strand += 1) {
        const [r, g, b] = COLORS[strand];

        ctx.beginPath();
        for (let i = 0; i <= SAMPLES; i += 1) {
          const [x, y] = pointAt(strand, merge, i / SAMPLES);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        /* Drei Zuege uebereinander ergeben einen Kern mit Hof. Weil die
           Zeichenart additiv ist, wird die Ueberlagerung der drei Straenge
           am gemeinsamen Ende von selbst zu einer einzigen hellen Bahn. */
        ctx.strokeStyle = `rgba(${r},${g},${b},0.08)`;
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${g},${b},0.16)`;
        ctx.lineWidth = 3.4;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${g},${b},0.72)`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        /* Anfangsknoten */
        const sx = SOURCES[strand] * width;
        const sy = Y_TOP * height;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.75)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.9, 0, Math.PI * 2);
        ctx.fill();

        /* Endknoten. Die drei Ringe wandern zusammen und liegen am Ende
           uebereinander, dadurch entsteht ein einzelner heller Ring. */
        const ex = endX(strand, merge) * width;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.8)`;
        ctx.beginPath();
        ctx.arc(ex, cy, 5 + merge * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* Sammelring, der erst mit dem Zusammenlaufen erscheint. */
      if (merge > 0.02) {
        ctx.strokeStyle = `rgba(185,165,255,${0.34 * merge})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 16 + merge * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* Laufende Punkte auf den Bahnen */
      for (const dot of dots) {
        const [r, g, b] = COLORS[dot.strand];
        const t = dot.t;
        const alpha = t < 0.08 ? t / 0.08 : t > 0.94 ? (1 - t) / 0.06 : 1;
        if (alpha <= 0.01) continue;

        const [x, y] = pointAt(dot.strand, merge, t);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.14})`;
        ctx.beginPath();
        ctx.arc(x, y, dot.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(x, y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    /* ------------------------------------------------- ruhendes Bild */

    if (reduced) {
      /* Der Verbindungsgrad wird hier gesetzt und nicht erst im Zeitplan.
         Das ruhende Bild zeigt sofort den verbundenen Zustand, denn das
         ist der Zustand, der die Aussage traegt. */
      mergeRef.current = 1;
      if (targetRef.current) targetRef.current.style.opacity = "1";

      const paint = () => {
        resize();
        draw();
      };
      paint();
      const observer = new ResizeObserver(paint);
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    /* ------------------------------------------------ laufendes Bild */

    /* Der Zeitplan zaehlt mit den Bildabstaenden und nicht mit der Uhr.
       Ist die Buehne aus dem Bild oder das Fenster verdeckt, steht die
       Schleife, und beim Zurueckkommen laeuft die Bewegung dort weiter,
       wo sie stand, statt ein Stueck zu ueberspringen. */
    let phase: Phase = "hold";
    let clock = 0;
    let holdFor = HOLD_MS;
    let releaseFrom = 0;

    const advance = (delta: number) => {
      clock += delta;

      if (phase === "release") {
        mergeRef.current = releaseFrom * (1 - easeOut(clock / RELEASE_MS));
        if (clock >= RELEASE_MS) {
          phase = "hold";
          clock = 0;
          holdFor = REHOLD_MS;
          mergeRef.current = 0;
        }
      } else if (phase === "hold") {
        mergeRef.current = 0;
        if (clock >= holdFor) {
          phase = "merge";
          clock = 0;
        }
      } else if (phase === "merge") {
        mergeRef.current = easeOut(clock / MERGE_MS);
        if (clock >= MERGE_MS) {
          phase = "done";
          mergeRef.current = 1;
        }
      }

      /* Der Name am Fusz erscheint erst, wenn dort auch etwas
         zusammenlaeuft, und steht voll, sobald der Strang einer ist. */
      const target = targetRef.current;
      if (target) target.style.opacity = String(targetOpacity(mergeRef.current));
    };

    replayRef.current = () => {
      /* Waehrend eines laufenden Vorgangs bleibt die Beruehrung ohne
         Wirkung, sonst zuckte die Buehne bei jeder Mausbewegung. */
      if (phase !== "done") return;
      phase = "release";
      releaseFrom = mergeRef.current;
      clock = 0;
    };

    let raf = 0;
    let last = 0;
    let running = false;
    let inView = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const delta = last ? Math.min(now - last, 64) : 16;
      last = now;

      for (const dot of dots) {
        dot.t += (delta / TRAVEL_MS) * dot.speed;
        if (dot.t > 1) dot.t -= 1;
      }

      advance(delta);
      draw();
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const sync = () => {
      if (inView && !document.hidden) start();
      else stop();
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    resizeObserver.observe(canvas);

    const viewObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "140px 0px" },
    );
    viewObserver.observe(canvas);

    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      replayRef.current = null;
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced]);

  return (
    <div
      className={`strands-figure${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={aboutPage.strands.figureAlt}
      onPointerEnter={() => replayRef.current?.()}
    >
      <canvas ref={canvasRef} className="strands-canvas" aria-hidden="true" />

      {aboutPage.strands.sources.map((label, index) => (
        <p
          key={label}
          className="t-label strands-cap"
          style={{ left: `${SOURCES[index] * 100}%` }}
        >
          {label}
        </p>
      ))}

      <p
        ref={targetRef}
        className="strands-target"
        style={{ opacity: reduced ? 1 : 0 }}
      >
        {aboutPage.strands.target}
      </p>

      {/*
        Global deklariert, aber durchgehend unter `.strands-figure` gehaengt.
        Breite und Hoehe gibt das Elternteil vor, hier stehen nur die Lagen
        von Zeichnung, Beschriftungen und Name.
      */}
      <style jsx global>{`
        .strands-figure {
          position: relative;
          width: 100%;
        }

        .strands-figure .strands-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .strands-figure .strands-cap {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          margin: 0;
          white-space: nowrap;
          color: var(--ink-2);
        }

        .strands-figure .strands-target {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          margin: 0;
          white-space: nowrap;
          font-family: var(--font-display);
          font-size: clamp(17px, 1.6vw, 26px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        @media (max-width: 560px) {
          .strands-figure .strands-cap {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .strands-figure .strands-target {
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StrandsFigure;
