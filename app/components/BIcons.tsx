/**
 * Schlichte Linien-Icons (24px-Raster) für die Problem-Sektion und
 * kleinere Helfer-Icons (Chevron, Pfeile, Plus, Papierflieger, Brief).
 * Alle Icons erben die Farbe über `currentColor`.
 */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

/** Nadelöhr: Trichter, in dem sich alles staut. */
export function IconBottleneck({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 3h16l-6 7v9l-4 2v-11L4 3Z" />
      <path d="M9 6h6" />
    </svg>
  );
}

/** Marge: fallende Kurve. */
export function IconMargin({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 6l6 7 4-3 8 8" />
      <path d="M21 13v5h-5" />
      <path d="M3 21h18" />
    </svg>
  );
}

/** Wissen in einem Kopf. */
export function IconKnowledge({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3a5 5 0 0 0-5 5c0 1.7.8 2.9 1.7 4 .7.9 1.3 1.6 1.3 2.6V16h4v-1.4c0-1 .6-1.7 1.3-2.6.9-1.1 1.7-2.3 1.7-4a5 5 0 0 0-5-5Z" />
      <path d="M10 19h4" />
      <path d="M10.5 21.5h3" />
    </svg>
  );
}

/** Wiederholung: Kreislauf mit Ausrufezeichen. */
export function IconRepeat({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20 12a8 8 0 1 0-2.7 6" />
      <path d="M20 6v5h-5" />
      <path d="M12 8v4" />
      <path d="M12 15.5h.01" />
    </svg>
  );
}

/** Leck: Tropfen, der aus einem Gefäß rinnt. */
export function IconLeak({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 4h13a3 3 0 0 1 3 3v3h-3" />
      <path d="M4 4v7a3 3 0 0 0 3 3h6" />
      <path d="M17 14.5c1.2 1.4 2 2.4 2 3.4a2 2 0 1 1-4 0c0-1 .8-2 2-3.4Z" />
    </svg>
  );
}

/** Unsichtbar: durchgestrichenes Auge. */
export function IconInvisible({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 12s3.5-6 9-6c1.4 0 2.6.4 3.7 1" />
      <path d="M20.4 8.6c.4.5.6 1 .6 1 s-3.5 6-9 6c-1 0-2-.2-2.8-.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3.5 3.5l17 17" />
    </svg>
  );
}

const problemIcons: Record<string, (p: IconProps) => React.ReactElement> = {
  bottleneck: IconBottleneck,
  margin: IconMargin,
  knowledge: IconKnowledge,
  repeat: IconRepeat,
  leak: IconLeak,
  invisible: IconInvisible,
};

/** Wählt anhand des Schlüssels aus `content.ts` das passende Problem-Icon. */
export function ProblemIcon({ name, size = 24, className }: IconProps & { name: string }) {
  const Cmp = problemIcons[name] ?? IconRepeat;
  return <Cmp size={size} className={className} />;
}

/* -------------------------------------------------------------------------- */
/*  Helfer-Icons                                                              */
/* -------------------------------------------------------------------------- */

/** Marken-Chevron aus drei aufsteigenden Winkeln (wie im Logo). */
export function ChevronMark({ size = 28, className }: IconProps) {
  return (
    <svg
      width={size}
      height={(size * 20) / 28}
      viewBox="0 0 28 20"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2 18 14 4l12 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <path
        d="M6.5 13.5 14 4.5l7.5 9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d="M10 9 14 4l4 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M9.5 3.5 5 8l4.5 4.5M5 8h6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M6.5 3.5 11 8l-4.5 4.5M11 8H4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function PaperPlaneIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m4.5 8 6.4 4.4a2 2 0 0 0 2.2 0L19.5 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlayIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}
