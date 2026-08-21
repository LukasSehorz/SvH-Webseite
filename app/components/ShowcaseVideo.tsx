"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { Reveal, useSafeReducedMotion } from "./ui";

/**
 * Breites Media-Panel unter der Impact-Sektion.
 * Zeigt einen leise laufenden Marken-Loop (ohne Ton). Solange das Video nicht
 * bereit ist — oder wenn der Nutzer reduzierte Bewegung eingestellt hat —
 * bleibt das Standbild stehen.
 */
export default function ShowcaseVideo() {
  const reduce = useSafeReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      setPlaying(false);
      return;
    }
    v.play().catch(() => setPlaying(false));
  }, [reduce]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="section pt-0" aria-label="Einblick in unsere Arbeit">
      <div className="shell">
        <Reveal>
          <div className="relative">
            {/* Cyan-Glow unter der Karte */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                inset: "8% 4% -4% 4%",
                borderRadius: 40,
                background:
                  "radial-gradient(60% 60% at 50% 60%, rgba(0,146,212,.32), transparent 70%)",
                filter: "blur(38px)",
              }}
            />

            <div
              className="showcase relative overflow-hidden"
              style={{
                aspectRatio: "16 / 9",
                borderRadius: 28,
                border: "1px solid rgba(0,26,35,.06)",
                boxShadow:
                  "0 1px 2px rgba(0,26,35,.04), 0 40px 80px -44px rgba(0,26,35,.45)",
                background: "var(--color-tint-3)",
              }}
            >
              {/* Standbild, bis das Video Daten hat */}
              <Image
                src="/img/showcase-poster.png"
                alt="Blick in ein modernes Büro mit einer schwebenden Chevron-Grafik"
                fill
                sizes="(max-width: 1280px) 100vw, 1232px"
                className="showcase-media object-cover"
                style={{ opacity: ready && !reduce ? 0 : 1, transition: "opacity .6s ease" }}
                priority={false}
              />

              <video
                ref={videoRef}
                className="showcase-media absolute inset-0 h-full w-full object-cover"
                style={{ opacity: ready && !reduce ? 1 : 0, transition: "opacity .6s ease" }}
                src="/video/showcase.mp4"
                poster="/img/showcase-poster.png"
                muted
                loop
                playsInline
                preload="metadata"
                onCanPlay={() => setReady(true)}
                aria-hidden
              />

              {/* weicher dunkler Verlauf von unten */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,26,35,0) 46%, rgba(0,26,35,.18) 74%, rgba(0,26,35,.48) 100%)",
                }}
              />

              {/* Pause/Play — klein unten rechts, damit das Panel ruhig bleibt */}
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Video pausieren" : "Video abspielen"}
                className="showcase-play absolute grid place-items-center"
                style={{
                  right: 20,
                  bottom: 20,
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "rgba(255,255,255,.92)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 24px -10px rgba(0,26,35,.5)",
                  transition: "transform .35s var(--ease-out-expo)",
                }}
              >
                {playing ? (
                  <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
                    <rect x="1" y="1" width="4" height="14" rx="1.2" fill="var(--color-brand)" />
                    <rect x="9" y="1" width="4" height="14" rx="1.2" fill="var(--color-brand)" />
                  </svg>
                ) : (
                  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
                    <path d="M2 1.6 15 9 2 16.4z" fill="var(--color-brand)" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .showcase :global(.showcase-media) {
          transition:
            transform 0.7s var(--ease-out-expo),
            opacity 0.6s ease;
        }
        .showcase:hover :global(.showcase-media) {
          transform: scale(1.03);
        }
        .showcase-play:hover {
          transform: scale(1.08);
        }
      `}</style>
    </section>
  );
}
