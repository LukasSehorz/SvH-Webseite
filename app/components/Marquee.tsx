"use client";


import { marquee } from "../content";
import { useSafeReducedMotion } from "./ui";

function Pill({ label }: { label: string }) {
  return (
    <span
      className="whitespace-nowrap"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 999,
        padding: "12px 24px",
        background: "linear-gradient(180deg,#FFFFFF 0%,var(--color-tint-2) 100%)",
        border: "1px solid var(--color-tint-1)",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--color-ink)",
        boxShadow: "0 8px 22px -18px rgba(0,146,212,.6)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--color-brand)",
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

function Row({
  items,
  direction,
  reduce,
}: {
  items: string[];
  direction: "left" | "right";
  reduce: boolean;
}) {
  // Zwei identische Gruppen → nahtlose Schleife über translateX(-50%)
  return (
    <div className="mask-fade-x overflow-hidden">
      <div
        className="svh-marquee-track flex w-max items-center"
        data-marquee-row={direction}
        style={{
          animationName: reduce ? "none" : direction === "left" ? "svh-mq-left" : "svh-mq-right",
        }}
      >
        {[0, 1].map((group) => (
          <div key={group} className="flex items-center gap-4 pr-4" aria-hidden={group === 1}>
            {items.map((label) => (
              <Pill key={`${group}-${label}`} label={label} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const reduce = !!useSafeReducedMotion();

  return (
    <section aria-label="Unsere Leistungen im Überblick" className="relative overflow-hidden py-4">
      <div className="svh-marquee-wrap flex flex-col gap-4">
        <Row items={marquee.rowA} direction="left" reduce={reduce} />
        <Row items={marquee.rowB} direction="right" reduce={reduce} />
      </div>

      <style jsx global>{`
        .svh-marquee-track {
          animation-duration: 40s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .svh-marquee-wrap:hover .svh-marquee-track {
          animation-play-state: paused;
        }
        @keyframes svh-mq-left {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes svh-mq-right {
          from {
            transform: translate3d(-50%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
