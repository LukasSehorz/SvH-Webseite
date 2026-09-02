"use client";

import { useEffect, useRef } from "react";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Sternfeld                                                          */
/*                                                                     */
/*  Canvas 2D, rund 200 winzige Punkte. Die meisten in --ink-3, wenige */
/*  in den Akzentfarben. Das Funkeln laeuft ueber eine sehr langsame    */
/*  Sinuswelle. Bei reduzierter Bewegung wird einmal gezeichnet.        */
/* ------------------------------------------------------------------ */

/* DIESE DATEI IST NICHT EINGEBUNDEN. Sie wird von keiner Seite und von
   keiner Sektion importiert; das einzige verwendete Sternenfeld liegt als
   oertliche Hilfsfunktion in app/components/ki/Dashboard.tsx.
   Ein Auftrag, die freien Einzelpartikel der Marketing-Sektion hier
   anzuheben, laeuft deshalb ins Leere. Die Zahlen stehen unveraendert. */
const STAR_COUNT = 200;
const ACCENT_COUNT = 15;
const ACCENTS = ["91,140,255", "124,106,255", "185,165,255"] as const;
const BASE = "244,244,246";

type Star = {
  x: number;
  y: number;
  r: number;
  rgb: string;
  alpha: number;
  speed: number;
  phase: number;
  halo: boolean;
};

/** Deterministische Zufallszahlen, damit das Feld stabil bleibt. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(): Star[] {
  const rand = mulberry32(70413);
  const stars: Star[] = [];

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const accent = i < ACCENT_COUNT;
    stars.push({
      x: rand(),
      y: rand(),
      r: 0.5 + rand() * 1,
      rgb: accent ? ACCENTS[Math.floor(rand() * ACCENTS.length)] : BASE,
      alpha: accent ? 0.42 + rand() * 0.4 : 0.16 + rand() * 0.34,
      speed: 0.12 + rand() * 0.34,
      phase: rand() * Math.PI * 2,
      halo: accent && rand() > 0.45,
    });
  }

  // Die Akzentpunkte liegen sonst gebuendelt am Anfang der Liste.
  return stars.sort((a, b) => a.x - b.x);
}

export default function Starfield({
  className,
}: Readonly<{ className?: string }>) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useSafeReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = buildStars();
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let start = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const draw = (now: number) => {
      const time = reduced ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = reduced
          ? 1
          : 0.55 + 0.45 * Math.sin(time * star.speed + star.phase);
        const alpha = star.alpha * twinkle;
        const x = star.x * width;
        const y = star.y * height;

        if (star.halo) {
          const halo = ctx.createRadialGradient(x, y, 0, x, y, star.r * 6);
          halo.addColorStop(0, `rgba(${star.rgb},${alpha * 0.5})`);
          halo.addColorStop(1, `rgba(${star.rgb},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${star.rgb},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Das Funkeln laeuft mit 0.12 bis 0.46 rad/s. Zwanzig Bilder je
    // Sekunde reichen dafuer voellig und halten den Hauptfaden frei
    // fuer die Kugeln daneben.
    const STEP = 50;
    let painted = 0;

    const loop = (now: number) => {
      if (now - painted >= STEP) {
        painted = now;
        draw(now);
      }
      frame = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    start = performance.now();
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: "160px" },
    );
    io.observe(host);

    return () => {
      stopLoop();
      observer.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
