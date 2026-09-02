/* Alle Zeichen dieser Seite sind hier gezeichnet, in einem Raster von 24
   und mit einer Strichstaerke von 1,5. Eine gemeinsame Quelle sorgt
   dafuer, dass die Zeichen in Sektion 2, im Faecher und an den
   Beschriftungsfahnen dieselbe Handschrift haben. */
import type { ReactElement } from "react";

type IconProps = { readonly strich?: number };

function Rahmen({
  children,
  strich = 1.5,
}: Readonly<{ children: React.ReactNode; strich?: number }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strich}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* Sektion 2. Die Leute sind schon da. */
export function IconLeute({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <circle cx="8.5" cy="8" r="2.6" />
      <circle cx="16" cy="9.2" r="2.1" />
      <path d="M3.6 18.4c0-2.7 2.2-4.5 4.9-4.5s4.9 1.8 4.9 4.5" />
      <path d="M15.2 14.2c2.5.1 5.2 1.4 5.2 4.2" />
    </Rahmen>
  );
}

/* Sektion 2. Sie haben Zeit und schauen hin. */
export function IconBlick({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M2.4 12s3.6-5.6 9.6-5.6S21.6 12 21.6 12s-3.6 5.6-9.6 5.6S2.4 12 2.4 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </Rahmen>
  );
}

/* Sektion 2. Sie wohnen um die Ecke. */
export function IconNaehe({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M12 21c3.6-4 5.6-7 5.6-9.6A5.6 5.6 0 0 0 6.4 11.4C6.4 14 8.4 17 12 21Z" />
      <circle cx="12" cy="11.2" r="2.1" />
    </Rahmen>
  );
}

/* Faecher. Video, Bild, Text, Angebot. */
export function IconVideo({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <rect x="2.6" y="6" width="12.6" height="12" rx="2.4" />
      <path d="M15.2 10.6 21.4 7.6v8.8l-6.2-3z" />
    </Rahmen>
  );
}

export function IconBild({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <rect x="3" y="4.6" width="18" height="14.8" rx="2.4" />
      <circle cx="8.6" cy="9.8" r="1.5" />
      <path d="m3.6 16.8 4.6-4.2 3.6 3.2 3.2-2.8 5 4.6" />
    </Rahmen>
  );
}

export function IconText({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M4.4 6.6h15.2M4.4 11h15.2M4.4 15.4h10.4M4.4 19.8h6.6" />
    </Rahmen>
  );
}

export function IconAngebot({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M12.6 3.4H20a.6.6 0 0 1 .6.6v7.4a1 1 0 0 1-.3.7l-8.5 8.5a1 1 0 0 1-1.4 0l-7.1-7.1a1 1 0 0 1 0-1.4l8.6-8.4a1 1 0 0 1 .7-.3Z" />
      <circle cx="16.6" cy="7.4" r="1.5" />
    </Rahmen>
  );
}

/* Beschriftungsfahnen an der Tafel. */
export function IconMasz({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M4.6 4.4h14.8M4.6 19.6h14.8M12 7v10" />
      <path d="m9.4 9.6 2.6-2.6 2.6 2.6M9.4 14.4l2.6 2.6 2.6-2.6" />
    </Rahmen>
  );
}

export function IconOrt({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="M12 3.4v17.2" />
      <path d="M12 5.6h6.4l1.6 2.2-1.6 2.2H12z" />
      <path d="M12 12.4H5.6L4 14.6l1.6 2.2H12" />
    </Rahmen>
  );
}

export function IconHand({ strich }: IconProps) {
  return (
    <Rahmen strich={strich}>
      <path d="m16.4 3.8 3.8 3.8-10 10-4.8 1 1-4.8z" />
      <path d="M13.8 6.4 17.6 10" />
      <path d="M4 21h16" />
    </Rahmen>
  );
}

/* Pfeil hinter den leisen Verweisen. */
export function IconPfeil() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.6 7.5h9.8M8.6 3.7l3.8 3.8-3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const KARTE: Record<string, (props: IconProps) => ReactElement> = {
  leute: IconLeute,
  blick: IconBlick,
  naehe: IconNaehe,
  video: IconVideo,
  bild: IconBild,
  text: IconText,
  angebot: IconAngebot,
  masz: IconMasz,
  ort: IconOrt,
  hand: IconHand,
};

/** Waehlt ein Zeichen ueber seinen Namen aus copy.ts. */
export function Icon({ name }: Readonly<{ name: string }>) {
  const Gewaehlt = KARTE[name];
  return Gewaehlt ? Gewaehlt({}) : null;
}
