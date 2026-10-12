import type { CSSProperties, ReactNode } from "react";

/* Gemeinsame Bausteine der Variante B (ohne Zustand, laufen auf dem Server). */

/** _Wort_ → Verlaufswort */
export function Grad({ text }: { text: string }) {
  return (
    <>
      {text.split(/(_[^_]+_)/).map((teil, i) =>
        teil.startsWith("_") && teil.endsWith("_") ? (
          <span key={i} className="b-grad">
            {teil.slice(1, -1)}
          </span>
        ) : (
          teil
        ),
      )}
    </>
  );
}

/** Kopf einer Sektion: Label, Überschrift, kurzer Text. */
export function Kopf({
  label,
  title,
  text,
  id,
  mitte = false,
  children,
}: {
  label: string;
  title: string;
  text?: string;
  id?: string;
  mitte?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`b-kopf${mitte ? " b-kopf--mitte" : ""}`} data-rv="">
      <p className="b-label">{label}</p>
      <h2 className="b-h2" id={id}>
        <Grad text={title} />
      </h2>
      {text ? <p className="b-lead">{text}</p> : null}
      {children}
    </div>
  );
}

/** Verzögerung für gestaffeltes Einblenden */
export const stufe = (i: number) => ({ "--d": i }) as CSSProperties;

/** Haken in Markenfarbe, ohne Kreis (Verlauf aus SvgDefsB) */
export function Haken({ size = 24, farbe }: { size?: number; farbe?: string }) {
  return (
    <svg className="b-haken" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4.5 12.8l4.6 4.6L19.5 7" fill="none" stroke={farbe ?? "url(#b-verlauf)"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Kreuz({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Pfeil({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Verläufe einmal pro Seite, für Haken und Symbole */
export function SvgDefsB() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="b-verlauf" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3f74ff" />
          <stop offset="0.55" stopColor="#6a55ff" />
          <stop offset="1" stopColor="#8c6dff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SYMBOLE: Record<string, ReactNode> = {
  uhr: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  blitz: <path d="M13 3L5.5 13.5H12L11 21l7.5-10.5H12z" />,
  haken: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 12.3l2.6 2.6 4.9-5.2" />
    </>
  ),
  mond: <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z" />,
  buch: (
    <>
      <path d="M4.5 5.5A2 2 0 0 1 6.5 4H19v14H6.5a2 2 0 0 0-2 2z" />
      <path d="M4.5 20V5.5M8.5 8h7" />
    </>
  ),
  pfeil: (
    <>
      <path d="M4 18l6-6 4 4 6-7" />
      <path d="M15 9h5v5" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5" />
    </>
  ),
  warnung: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  kopf: (
    <>
      <path d="M8 21v-3.5A7 7 0 1 1 18.5 11l1.5 3h-2v2.5a2 2 0 0 1-2 2H14V21" />
      <path d="M10.5 9.5a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5" />
    </>
  ),
  ordner: <path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />,
  laptop: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M3 18.5h18" />
    </>
  ),
  tabelle: (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16M4 14.5h16M10 4.5v15" />
    </>
  ),
  notiz: (
    <>
      <path d="M5 4.5h14v10l-5 5H5z" />
      <path d="M14 19.5v-5h5M8.5 9h7M8.5 12h4" />
    </>
  ),
  telefon: <path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 6a2 2 0 0 1 2-2z" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
};

/** Linien-Symbol mit Verlauf */
export function Symbol({ name, size = 26, farbe }: { name: string; size?: number; farbe?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke={farbe ?? "url(#b-verlauf)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {SYMBOLE[name]}
    </svg>
  );
}

/** Google-„G“ in den vier Markenfarben (Hero-Abzeichen und Kunden-Bewertungen) */
export function GoogleG({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

/** Fünf Sterne (gelb = vergeben). `deko`: nur Schmuck, die Zahl steht schon im Text oder im Link-Namen. */
export function Sterne({ n, size = 18, className = "kd-sterne", deko = false }: { n: number; size?: number; className?: string; deko?: boolean }) {
  const a11y = deko ? { "aria-hidden": true as const } : { role: "img", "aria-label": `${n} von 5 Sternen` };
  return (
    <span className={className} {...a11y}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
          <path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill={i < n ? "#fbbc04" : "#e2e2ea"} />
        </svg>
      ))}
    </span>
  );
}
