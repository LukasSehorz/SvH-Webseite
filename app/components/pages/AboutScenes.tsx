"use client";

import { useCallback, useEffect, useRef } from "react";
import { aboutPage } from "../../copy";
import { Reveal, RevealGroup, RevealItem, SplitHeadline, useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Drei kleine Szenen                                    */
/*                                                                     */
/*  Jede Szene zeigt eine Mechanik und keine Kennzahl, weil auszer den */
/*  35 umgesetzten Projekten nichts belegt ist. Gezeigt wird also, was */
/*  wegfaellt, was dazukommt und wie sich Arbeit verschiebt.           */
/*                                                                     */
/*  Eine Szene laeuft einmal an, sobald sie im Bild steht, und laeuft  */
/*  bei Beruehrung erneut an. Bei reduzierter Bewegung steht sofort    */
/*  das Endbild, in dem die Aussage ebenso zu lesen ist.               */
/* ------------------------------------------------------------------ */

const DURATION = 2400;

const MUTED = "rgba(244,244,246,0.24)";
const FAINT = "rgba(244,244,246,0.1)";

type SceneKind = "auto" | "reach" | "time";

/** Exponentielles Ausklingen, das ueberall in diesem Block gilt. */
function ease(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - c, 3);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Verlauf der Rampe ueber eine waagerechte Strecke. */
function ramp(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  alpha: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
  gradient.addColorStop(0, `rgba(91,140,255,${alpha})`);
  gradient.addColorStop(0.5, `rgba(124,106,255,${alpha})`);
  gradient.addColorStop(1, `rgba(185,165,255,${alpha})`);
  return gradient;
}

/** Weicher Farbnebel als Gewicht hinter einer Stelle der Szene. */
function fog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
) {
  if (alpha <= 0.002 || radius <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(124,106,255,${alpha})`);
  gradient.addColorStop(0.5, `rgba(91,140,255,${alpha * 0.34})`);
  gradient.addColorStop(1, "rgba(91,140,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/*  Szene 1 · Wiederkehrende Arbeit laeuft von selbst                  */
/*                                                                     */
/*  Vier Zeilenpaare stehen fuer denselben Vorgang an vier Tagen. Oben */
/*  liegt jeweils der kurze, stumpfe Balken der Arbeit von Hand, unten */
/*  die Bahn, die von selbst durchlaeuft. Ein Lichtzug wandert nach    */
/*  unten, und jede Zeile, die er beruehrt, laeuft in einem Zug durch. */
/*  Der Balken von Hand bleibt als blasse Spur stehen, damit auch das  */
/*  Standbild noch zeigt, was vorher war.                              */
/* ------------------------------------------------------------------ */

const ROWS = 4;
const MANUAL = [0.42, 0.63, 0.35, 0.56];

function drawAuto(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const span = x1 - x0;
  const top = h * 0.18;
  const step = (h * 0.62) / (ROWS - 1);

  for (let i = 0; i < ROWS; i += 1) {
    const row = top + step * i;
    const yHand = row - 8;
    const yAuto = row + 7;
    const done = ease(clamp01((p - (0.1 + i * 0.15)) / 0.26));

    /* Spur der durchlaufenden Bahn */
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, yAuto);
    ctx.lineTo(x1, yAuto);
    ctx.stroke();

    /* Arbeit von Hand. Sie verblasst, bleibt aber als Spur sichtbar. */
    const handEnd = x0 + span * MANUAL[i];
    ctx.strokeStyle = `rgba(244,244,246,${0.28 - 0.16 * done})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, yHand);
    ctx.lineTo(handEnd, yHand);
    ctx.stroke();

    if (done < 1) {
      ctx.fillStyle = `rgba(244,244,246,${0.42 * (1 - done)})`;
      ctx.fillRect(handEnd - 3, yHand - 5, 6, 10);
    }

    /* Die Bahn, die von selbst durchlaeuft */
    if (done > 0) {
      const end = x0 + span * done;
      ctx.strokeStyle = ramp(ctx, x0, x1, 0.16);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x0, yAuto);
      ctx.lineTo(end, yAuto);
      ctx.stroke();

      ctx.strokeStyle = ramp(ctx, x0, x1, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, yAuto);
      ctx.lineTo(end, yAuto);
      ctx.stroke();

      if (done < 1) fog(ctx, end, yAuto, 26, 0.3);
    }
  }

  /* Lichtzug, der die Zeilen der Reihe nach anstoeszt */
  const sweep = clamp01((p - 0.06) / 0.72);
  if (sweep > 0 && sweep < 1) {
    const y = top - step * 0.6 + step * (ROWS + 0.2) * sweep;
    ctx.strokeStyle = "rgba(185,165,255,0.34)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 - 8, y);
    ctx.lineTo(x1 + 8, y);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/*  Szene 2 · Anfragen kommen an, weil man gefunden wird               */
/*                                                                     */
/*  Ueber der Flaeche liegt ein Feld ruhender Punkte. Das ist das      */
/*  Umfeld eines Betriebs. Nach und nach loesen sich einzelne Punkte   */
/*  und finden den Weg zum Ring in der Mitte unten. Mit jedem          */
/*  Ankommenden wird der Ring heller.                                  */
/* ------------------------------------------------------------------ */

type FieldDot = { x: number; y: number; size: number; mover: boolean; bow: number };

function buildField(): FieldDot[] {
  let seed = 20260902;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const dots: FieldDot[] = [];
  for (let i = 0; i < 38; i += 1) {
    dots.push({
      x: 0.07 + rand() * 0.86,
      y: 0.12 + rand() * 0.44,
      size: 1.2 + rand() * 1.4,
      mover: false,
      bow: rand() * 2 - 1,
    });
  }
  /* Neun Punkte machen sich auf den Weg, gleichmaeszig verteilt. */
  for (let i = 0; i < 9; i += 1) dots[Math.floor((i * 38) / 9) + 1].mover = true;
  return dots;
}

const FIELD = buildField();

function drawReach(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const cx = w * 0.5;
  const cy = h * 0.82;

  let arrived = 0;
  let moverIndex = 0;

  for (const dot of FIELD) {
    const px = dot.x * w;
    const py = dot.y * h;

    if (!dot.mover) {
      ctx.fillStyle = "rgba(244,244,246,0.28)";
      ctx.beginPath();
      ctx.arc(px, py, dot.size, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    const start = 0.08 + moverIndex * 0.07;
    moverIndex += 1;
    const t = ease(clamp01((p - start) / 0.38));

    if (t >= 1) arrived += 1;

    /* Bogen vom Punkt zum Ring, damit die Wege sich nicht decken */
    const mx = (px + cx) / 2 + dot.bow * w * 0.12;
    const my = (py + cy) / 2 - h * 0.06;
    const u = 1 - t;
    const x = u * u * px + 2 * u * t * mx + t * t * cx;
    const y = u * u * py + 2 * u * t * my + t * t * cy;

    /* Der zurueckgelegte Weg bleibt als blasse Spur stehen. Dadurch
       zeigt auch das Standbild neun Wege, die auf einen Punkt zulaufen. */
    if (t > 0) {
      ctx.strokeStyle = t < 1 ? "rgba(124,106,255,0.24)" : "rgba(124,106,255,0.13)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let k = 1; k <= 16; k += 1) {
        const s = (k / 16) * t;
        const v = 1 - s;
        ctx.lineTo(
          v * v * px + 2 * v * s * mx + s * s * cx,
          v * v * py + 2 * v * s * my + s * s * cy,
        );
      }
      ctx.stroke();
    }

    const alpha = t >= 1 ? 0 : 0.5 + t * 0.5;
    if (alpha > 0) {
      ctx.fillStyle = `rgba(185,165,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, dot.size + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Der Ring in der Mitte. Er waechst mit dem, was ankommt. */
  const gain = arrived / 9;
  fog(ctx, cx, cy, 26 + gain * 54, 0.1 + gain * 0.24);

  ctx.strokeStyle = `rgba(185,165,255,${0.4 + gain * 0.5})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 11 + gain * 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `rgba(244,244,246,${0.5 + gain * 0.45})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/*  Szene 3 · Der Tag verschiebt sich                                  */
/*                                                                     */
/*  Ein Balken steht fuer einen Arbeitstag. Links liegt die            */
/*  Verwaltung, rechts die Arbeit, mit der ein Betrieb sein Geld       */
/*  verdient. Die Trennkante wandert nach links, der helle Teil        */
/*  waechst. Es steht keine Zahl daran, nur die Verschiebung.          */
/* ------------------------------------------------------------------ */

function drawTime(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const span = x1 - x0;
  const y = h * 0.54;
  const bar = 26;
  const radius = bar / 2;

  /* Stundenmarken als Haarlinien ueber dem Balken */
  ctx.strokeStyle = FAINT;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i += 1) {
    const x = x0 + (span * i) / 8;
    ctx.beginPath();
    ctx.moveTo(x, y - bar / 2 - 16);
    ctx.lineTo(x, y - bar / 2 - 8);
    ctx.stroke();
  }

  const cut = x0 + span * (0.7 - 0.42 * ease(p));

  /* Verwaltung, der Teil der schrumpft */
  ctx.fillStyle = MUTED;
  ctx.beginPath();
  ctx.roundRect(x0, y - bar / 2, Math.max(radius * 2, cut - x0), bar, radius);
  ctx.fill();

  /* Die eigentliche Arbeit, der Teil der waechst */
  fog(ctx, (cut + x1) / 2, y, span * 0.34, 0.08 + 0.16 * ease(p));

  ctx.fillStyle = ramp(ctx, cut, x1, 0.9);
  ctx.beginPath();
  ctx.roundRect(cut, y - bar / 2, Math.max(radius * 2, x1 - cut), bar, radius);
  ctx.fill();

  /* Die wandernde Kante */
  ctx.strokeStyle = "rgba(5,5,7,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cut, y - bar / 2 - 1);
  ctx.lineTo(cut, y + bar / 2 + 1);
  ctx.stroke();

  ctx.strokeStyle = "rgba(244,244,246,0.26)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cut, y - bar / 2 - 12);
  ctx.lineTo(cut, y + bar / 2 + 12);
  ctx.stroke();
}

const PAINTERS: Record<
  SceneKind,
  (ctx: CanvasRenderingContext2D, w: number, h: number, p: number) => void
> = { auto: drawAuto, reach: drawReach, time: drawTime };

/* ------------------------------------------------------------------ */

function Scene({
  kind,
  alt,
  line,
  reduced,
}: Readonly<{ kind: SceneKind; alt: string; line: string; reduced: boolean }>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const replayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let progress = reduced ? 1 : 0;

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      PAINTERS[kind](ctx, width, height, progress);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };

    if (reduced) {
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      replayRef.current = null;
      return () => observer.disconnect();
    }

    let raf = 0;
    let started = 0;

    const frame = (now: number) => {
      const elapsed = now - started;
      progress = clamp01(elapsed / DURATION);
      paint();
      if (progress < 1) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const run = () => {
      cancelAnimationFrame(raf);
      started = performance.now();
      progress = 0;
      raf = requestAnimationFrame(frame);
    };

    replayRef.current = run;

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    /* Der erste Lauf startet, sobald die Szene im Bild steht. */
    const viewObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        viewObserver.disconnect();
        run();
      },
      { threshold: 0.45 },
    );
    viewObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      replayRef.current = null;
    };
  }, [kind, reduced]);

  const replay = useCallback(() => replayRef.current?.(), []);

  return (
    <RevealItem as="li" className="scene">
      <div
        className="scene-stage"
        role="img"
        aria-label={alt}
        onPointerEnter={replay}
      >
        <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />
      </div>
      <p className="t-body-lg scene-line">{line}</p>
    </RevealItem>
  );
}

/* ------------------------------------------------------------------ */

export default function AboutScenes() {
  const reduced = useSafeReducedMotion();

  return (
    <section className="section about-scenes" id="wirkung">
      <div className="shell">
        <Reveal>
          <SplitHeadline
            className="t-h1 scenes-title"
            before={aboutPage.change.titleBefore}
            word={aboutPage.change.gradientWord}
            after={aboutPage.change.titleAfter}
          />
        </Reveal>

        <RevealGroup as="ul" className="scenes-grid">
          {aboutPage.change.scenes.map((scene) => (
            <Scene
              key={scene.id}
              kind={scene.id as SceneKind}
              alt={scene.alt}
              line={scene.line}
              reduced={reduced}
            />
          ))}
        </RevealGroup>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.about-scenes` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `RevealGroup` weiterreicht.
      */}
      <style jsx global>{`
        .about-scenes .scenes-title {
          max-width: 16ch;
          margin-bottom: clamp(44px, 5vw, 72px);
        }

        /* Getrennt wird ueber Haarlinien und Luft, nicht ueber Kaesten.
           Die Szene selbst traegt die Sektion, ein Rahmen um sie herum
           wuerde nur eine zweite Kante dazustellen. */
        .about-scenes .scenes-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0 clamp(24px, 3vw, 52px);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .about-scenes .scene {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--line);
          padding-top: 26px;
        }

        .about-scenes .scene-stage {
          position: relative;
          width: 100%;
          height: clamp(180px, 15vw, 220px);
        }

        .about-scenes .scene-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .about-scenes .scene-line {
          margin-top: 26px;
          max-width: 34ch;
          font-size: 17px;
        }

        @media (max-width: 900px) {
          .about-scenes .scenes-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 40px;
          }

          .about-scenes .scene-stage {
            height: 190px;
          }

          .about-scenes .scene-line {
            margin-top: 20px;
            max-width: var(--measure);
          }
        }
      `}</style>
    </section>
  );
}
