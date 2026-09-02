"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutPage } from "../../copy";
import { Reveal, SplitHeadline, useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Drei Straenge werden zu einem                         */
/*                                                                     */
/*  Die Aussage der Sektion lautet, dass Webseite, Social Media und    */
/*  KI bei SVH an einer Stelle zusammenlaufen statt bei drei           */
/*  Anbietern. Die Bewegung sagt genau das und braucht dafuer keinen   */
/*  erklaerenden Satz: beim Hineinscrollen stehen drei getrennte       */
/*  Bahnen, beim Weiterscrollen biegen sie zueinander und enden in     */
/*  einem einzigen hellen Punkt.                                       */
/*                                                                     */
/*  Gefuehrt wird das ueber einen Scrub, damit derselbe Weg beim       */
/*  Zurueckscrollen rueckwaerts laeuft. Der Ausgangszustand ist voll   */
/*  sichtbar, es wird also nichts eingeblendet, sondern verformt.      */
/* ------------------------------------------------------------------ */

/** Waagerechte Startlage der drei Straenge, als Anteil der Buehnenbreite. */
const SOURCES = [0.15, 0.5, 0.85] as const;

/**
 * Senkrechte Marken der Bahn, als Anteil der Hoehe. Zwischen Kopf und
 * Naht schwingt der Strang seitlich ein, zwischen Naht und Fusz laeuft er
 * senkrecht weiter. Bei vollem Verbindungsgrad liegen alle drei
 * Fuszstuecke uebereinander, und aus den drei Bahnen wird sichtbar ein
 * einziger heller Strang. Genau das ist die Aussage der Sektion.
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

function bezier(a: number, b: number, c: number, d: number, t: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/**
 * Verbindungsgrad aus dem Fortschritt des Scrubs.
 *
 * Die ersten 42 Hundertstel des Weges halten die drei Bahnen getrennt.
 * Der Wert ist gemessen und nicht geschaetzt: bei einem Schirm von 900
 * Bildpunkten Hoehe steht die Buehne genau dann zum ersten Mal
 * vollstaendig im Bild, und erst ab da beginnt das Zusammenlaufen. Ohne
 * diese Ruhe waere der Ausgangszustand nur zu sehen, solange die Buehne
 * noch halb unter der Bildkante steht, denn ein reines exponentielles
 * Ausklingen nimmt gleich zu Beginn die meiste Strecke.
 *
 * Danach klingt die Bewegung aus, und zwar in beide Scrollrichtungen
 * gleich, weil der Wert allein am Fortschritt haengt.
 */
const HOLD = 0.42;

function mergeOf(progress: number): number {
  const raw = (progress - HOLD) / (1 - HOLD);
  const clamped = raw < 0 ? 0 : raw > 1 ? 1 : raw;
  return 1 - Math.pow(1 - clamped, 3);
}

export default function AboutStrands() {
  const reduced = useSafeReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLParagraphElement>(null);

  /* Der Verbindungsgrad. Null heiszt drei getrennte Bahnen, eins heiszt
     ein gemeinsamer Endpunkt. Die Zeichenschleife liest den Wert, der
     Scrub schreibt ihn. */
  const mergeRef = useRef(reduced ? 1 : 0);

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
      /* Der Wert kommt bereits fertig gerechnet aus dem Scrub. */
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
      /* Der Verbindungsgrad wird hier gesetzt und nicht erst im Scrub.
         Beide Effekte haengen an derselben Einstellung, und dieser hier
         laeuft zuerst; ohne die Zeile zeichnete das ruhende Bild die drei
         getrennten Bahnen und bekaeme danach keinen zweiten Anstrich. */
      mergeRef.current = 1;

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
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced]);

  /* ----------------------------------------------- Scrub der Bewegung */

  useEffect(() => {
    const stage = stageRef.current;
    const target = targetRef.current;
    if (!stage) return;

    if (reduced) {
      mergeRef.current = 1;
      if (target) target.style.opacity = "1";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top 90%",
      end: "bottom 60%",
      scrub: 0.5,
      onUpdate: (self) => {
        const merge = mergeOf(self.progress);
        mergeRef.current = merge;
        /* Der Name am Fusz erscheint erst, wenn dort auch etwas
           zusammenlaeuft, und steht voll, sobald der Strang einer ist. */
        if (target) {
          target.style.opacity = String(
            Math.min(1, Math.max(0, (merge - 0.6) / 0.35)),
          );
        }
      },
    });

    return () => trigger.kill();
  }, [reduced]);

  return (
    <section className="section about-strands" id="bereiche">
      <div className="shell">
        <div className="strands-head">
          <Reveal>
            <SplitHeadline
              className="t-h1 strands-title"
              before={aboutPage.strands.titleBefore}
              word={aboutPage.strands.gradientWord}
              after={aboutPage.strands.titleAfter}
            />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-body-lg strands-body">{aboutPage.strands.body}</p>
          </Reveal>
        </div>

        <Reveal delay={0.14}>
          <div
            ref={stageRef}
            className="strands-stage"
            role="img"
            aria-label={aboutPage.strands.figureAlt}
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
          </div>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.about-strands` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `Reveal` weiterreicht.
      */}
      <style jsx global>{`
        .about-strands .strands-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 32px 72px;
          align-items: end;
        }

        .about-strands .strands-title {
          max-width: 14ch;
          text-wrap: balance;
        }

        .about-strands .strands-body {
          max-width: var(--measure);
        }

        /* Die Buehne waechst mit der verbreiterten Schale mit. Bei 1080
           Bildpunkten stand sie auf einem Schirm von 2560 als kleine
           Insel in viel schwarzer Flaeche. */
        .about-strands .strands-stage {
          position: relative;
          width: 100%;
          max-width: 1360px;
          margin: clamp(48px, 6vw, 84px) auto 0;
          height: clamp(340px, 26vw, 520px);
        }

        .about-strands .strands-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .about-strands .strands-cap {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          margin: 0;
          white-space: nowrap;
          color: var(--ink-2);
        }

        .about-strands .strands-target {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          margin: 0;
          white-space: nowrap;
          font-family: var(--font-display);
          font-size: clamp(17px, 1.7vw, 22px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--ink);
          transition: opacity 0.5s var(--ease-out-expo);
        }

        @media (max-width: 1023px) {
          .about-strands .strands-head {
            grid-template-columns: minmax(0, 1fr);
            gap: 22px;
            align-items: start;
          }

          .about-strands .strands-title {
            max-width: 16ch;
          }

          .about-strands .strands-stage {
            height: clamp(320px, 78vw, 400px);
          }
        }

        @media (max-width: 560px) {
          .about-strands .strands-cap {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-strands .strands-target {
            opacity: 1 !important;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
