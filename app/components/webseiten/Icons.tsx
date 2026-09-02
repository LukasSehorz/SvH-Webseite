/* Gezeichnete Zeichen fuer die Unterseite Webseiten.
   Alle in einem Kasten von 24 mal 24, alle mit derselben Strichstaerke
   von 1,25 und runden Enden. Es steht kein einziges Unicode-Zeichen und
   kein Emoji als Zeichen auf dieser Seite. */

type IconProps = Readonly<{ size?: number }>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({ size = 20, children }: Readonly<{ size?: number; children: React.ReactNode }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...base}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------- Zeichen des Bausteinbands */

export const bandIcons: Record<string, (p: IconProps) => React.ReactElement> = {
  home: ({ size }) => (
    <Frame size={size}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5h4v5" />
    </Frame>
  ),
  list: ({ size }) => (
    <Frame size={size}>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M4.6 7h.01M4.6 12h.01M4.6 17h.01" />
    </Frame>
  ),
  form: ({ size }) => (
    <Frame size={size}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M7 9.5h6M7 13.5h10" />
      <path d="M7 17h4" />
    </Frame>
  ),
  pin: ({ size }) => (
    <Frame size={size}>
      <path d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.4" />
    </Frame>
  ),
  image: ({ size }) => (
    <Frame size={size}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4.4 16.6 9.3 12l3.4 3.1 2.6-2.2 4.3 3.7" />
    </Frame>
  ),
  bolt: ({ size }) => (
    <Frame size={size}>
      <path d="M13.2 3 5.5 13.4h5.6L10.8 21l7.7-10.4h-5.6L13.2 3Z" />
    </Frame>
  ),
  phone: ({ size }) => (
    <Frame size={size}>
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.6" />
      <path d="M10.6 5.4h2.8" />
      <path d="M11 18.4h2" />
    </Frame>
  ),
  clock: ({ size }) => (
    <Frame size={size}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3.2 2" />
    </Frame>
  ),
  route: ({ size }) => (
    <Frame size={size}>
      <circle cx="6" cy="6.4" r="2.4" />
      <circle cx="18" cy="17.6" r="2.4" />
      <path d="M8.4 6.4H14a3.2 3.2 0 0 1 0 6.4h-4a3.2 3.2 0 0 0 0 4.8h5.6" />
    </Frame>
  ),
  star: ({ size }) => (
    <Frame size={size}>
      <path d="m12 4 2.44 4.94 5.46.8-3.95 3.85.93 5.43L12 16.46l-4.88 2.56.93-5.43L4.1 9.74l5.46-.8L12 4Z" />
    </Frame>
  ),
  text: ({ size }) => (
    <Frame size={size}>
      <path d="M5 6h14M5 10.5h14M5 15h9" />
      <path d="M5 19.4h5" />
    </Frame>
  ),
  shield: ({ size }) => (
    <Frame size={size}>
      <path d="M12 3.2 5 6v6c0 4.2 2.9 7.5 7 8.8 4.1-1.3 7-4.6 7-8.8V6l-7-2.8Z" />
      <path d="m9.3 12 1.9 1.9 3.6-3.7" />
    </Frame>
  ),
};

/* ------------------------------------------------- Zeichen im Fliesztext */

export function ArrowIcon({ size = 15 }: IconProps) {
  return (
    <Frame size={size}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </Frame>
  );
}

export function ExternalIcon({ size = 14 }: IconProps) {
  return (
    <Frame size={size}>
      <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" />
      <path d="M14 4h6v6" />
      <path d="m20 4-8.5 8.5" />
    </Frame>
  );
}

export function LockIcon({ size = 13 }: IconProps) {
  return (
    <Frame size={size}>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </Frame>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <Frame size={size}>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m15.8 15.8 4 4" />
    </Frame>
  );
}

export function CheckIcon({ size = 13 }: IconProps) {
  return (
    <Frame size={size}>
      <path d="m5 12.6 4.6 4.6L19 7.4" />
    </Frame>
  );
}

/* Der Stern der KI-Antwort. Vier Strahlen, keine fremde Marke. */
export function SparkIcon({ size = 13 }: IconProps) {
  return (
    <Frame size={size}>
      <path d="M12 3.5c0 4.2 1.6 6.4 5.8 6.4-4.2 0-5.8 2.2-5.8 6.4 0-4.2-1.6-6.4-5.8-6.4 4.2 0 5.8-2.2 5.8-6.4Z" />
      <path d="M18.4 15.2c0 2-.8 3-2.8 3 2 0 2.8 1 2.8 3 0-2 .8-3 2.8-3-2 0-2.8-1-2.8-3Z" />
    </Frame>
  );
}

export function GlobeIcon({ size = 13 }: IconProps) {
  return (
    <Frame size={size}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.6 12h16.8" />
      <path d="M12 3.6c2.1 2.3 3.2 5.2 3.2 8.4s-1.1 6.1-3.2 8.4c-2.1-2.3-3.2-5.2-3.2-8.4S9.9 5.9 12 3.6Z" />
    </Frame>
  );
}
