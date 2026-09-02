/* ------------------------------------------------------------------ */
/*  Gezeichnete Zeichen der Social-Welt                                */
/*                                                                     */
/*  Alle Zeichen liegen im selben Raster von vierundzwanzig Einheiten   */
/*  und tragen dieselbe Strichstaerke. Dadurch treten sie als eine      */
/*  Familie auf, statt wie eingesammelte Einzelstuecke zu wirken.       */
/*  Sie sind ausnahmslos schmueckend und deshalb vor Vorlesesoftware    */
/*  verborgen.                                                         */
/* ------------------------------------------------------------------ */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IconHeart() {
  return (
    <svg {...base}>
      <path d="M12 20.2c-1.5-1-7-4.6-7-9.1A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7 2.8c0 4.5-5.5 8.1-7 9.1Z" />
    </svg>
  );
}

export function IconComment() {
  return (
    <svg {...base}>
      <path d="M4.5 7A2.5 2.5 0 0 1 7 4.5h10A2.5 2.5 0 0 1 19.5 7v6.5A2.5 2.5 0 0 1 17 16H9.4L4.5 19.8V7Z" />
    </svg>
  );
}

export function IconShare() {
  return (
    <svg {...base}>
      <path d="M4.5 12.4 19.5 5.2 14.6 19.6l-2.7-5.7-7.4-1.5Z" />
    </svg>
  );
}

export function IconPlay() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      <path d="M9.4 6.9 17.6 12l-8.2 5.1V6.9Z" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg {...base}>
      <path d="M4.5 8.6A2.1 2.1 0 0 1 6.6 6.5h10.8a2.1 2.1 0 0 1 2.1 2.1v8.8a2.1 2.1 0 0 1-2.1 2.1H6.6a2.1 2.1 0 0 1-2.1-2.1V8.6Z" />
      <path d="M8.4 4.4v4M15.6 4.4v4M4.5 11.4h15" />
    </svg>
  );
}

export function IconCamera() {
  return (
    <svg {...base}>
      <path d="M4.5 9.8a2.1 2.1 0 0 1 2.1-2.1h1.6l1.3-2.1h5l1.3 2.1h1.6a2.1 2.1 0 0 1 2.1 2.1v6.6a2.1 2.1 0 0 1-2.1 2.1H6.6a2.1 2.1 0 0 1-2.1-2.1V9.8Z" />
      <circle cx="12" cy="13" r="3.1" />
    </svg>
  );
}

export function IconCut() {
  return (
    <svg {...base}>
      <circle cx="6.2" cy="6.8" r="2.3" />
      <circle cx="6.2" cy="17.2" r="2.3" />
      <path d="M8.2 8.1 19 17.4M19 6.6 8.2 15.9" />
    </svg>
  );
}

export function IconTarget() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="7.6" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLoop() {
  return (
    <svg {...base}>
      <path d="M19.6 12a7.6 7.6 0 1 1-2.5-5.6" />
      <path d="M19.6 4.6v4.2h-4.2" />
    </svg>
  );
}

export function IconChart() {
  return (
    <svg {...base}>
      <path d="M4.6 19.4h14.8" />
      <path d="M7.8 16.4v-3.9M12 16.4V7.6M16.2 16.4v-6.4" />
    </svg>
  );
}

export function IconReplay() {
  return (
    <svg {...base}>
      <path d="M4.4 12a7.6 7.6 0 1 0 2.5-5.6" />
      <path d="M4.4 4.6v4.2h4.2" />
    </svg>
  );
}

export function IconArrow() {
  return (
    <svg {...base}>
      <path d="M5.5 12h13M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}

/* Der steigende Pfeil steht im Ruhezustand der Wachstumsszene. Er sagt in
   einer Linie, wohin die Szene laeuft, ohne eine Zahl zu behaupten. */
export function IconRise() {
  return (
    <svg {...base}>
      <path d="M4.5 16.5 10 11l3.5 3.5L19.5 8" />
      <path d="M14.4 8h5.1v5.1" />
    </svg>
  );
}
