/**
 * Die acht Zeichen der Seite /ki.
 *
 * Jede Dienstleistung hat genau ein Zeichen. Es steht auf der Kachel im
 * Seitenkopf, in der Liste darunter und noch einmal als Knoten in der
 * Ablauf-Grafik. Weil ueberall dasselbe Zeichen steht, erkennt man den
 * Bezug ohne zu lesen.
 *
 * Alle Zeichen sind auf dem gleichen Raster von 24 gezeichnet, mit
 * Strichstaerke 1.4 und runden Enden. Keine Flaechen, keine Buntfarben,
 * die Farbe kommt ueber `currentColor`.
 */

export type MarkId =
  | "email"
  | "chat"
  | "agent"
  | "calendar"
  | "offer"
  | "document"
  | "crm"
  | "report";

/** Die reinen Pfade, damit dieselben Zeichen auch in fremde SVG passen. */
export const markPaths: Record<MarkId, React.ReactNode> = {
  /* Briefumschlag. */
  email: (
    <>
      <rect x="3" y="5.8" width="18" height="12.4" rx="2.4" />
      <path d="M3.8 7.2 12 13.4l8.2-6.2" />
    </>
  ),

  /* Sprechblase mit drei Punkten. */
  chat: (
    <>
      <path d="M20.6 11.4c0 3.6-3.8 6.6-8.5 6.6-.9 0-1.8-.1-2.7-.3L4.6 19.3l1.3-3.3c-1.3-1.3-2-2.9-2-4.6C3.9 7.8 7.7 4.8 12.1 4.8s8.5 3 8.5 6.6Z" />
      <path d="M8.7 11.4h.01" />
      <path d="M12.1 11.4h.01" />
      <path d="M15.5 11.4h.01" />
    </>
  ),

  /* Kern mit drei angebundenen Knoten. Steht fuer den Assistenten, der in
     mehreren Programmen zugleich arbeitet. */
  agent: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="5.2" cy="6.2" r="2.1" />
      <circle cx="18.8" cy="7.4" r="2.1" />
      <circle cx="12" cy="20" r="2.1" />
      <path d="M6.8 7.5 9.7 10" />
      <path d="M17 8.7 14.4 10.4" />
      <path d="M12 15.2V17.9" />
    </>
  ),

  /* Kalenderblatt mit belegtem Tag. */
  calendar: (
    <>
      <rect x="3.2" y="5.2" width="17.6" height="15.2" rx="2.4" />
      <path d="M3.2 9.6h17.6" />
      <path d="M8 3.6v3.2" />
      <path d="M16 3.6v3.2" />
      <rect x="6.6" y="12.4" width="5" height="4.2" rx="1.4" />
    </>
  ),

  /* Blatt mit Knick und Haken. Steht fuer Angebot und Rechnung. */
  offer: (
    <>
      <path d="M5.6 3.4h7.8L18.8 8.8V17" />
      <path d="M5.6 3.4v17.2h13.2" />
      <path d="M13.4 3.4v5.4h5.4" />
      <path d="M8.8 12.4h5.4" />
      <path d="M8.8 16h3.2" />
    </>
  ),

  /* Blatt mit Lesebalken. Steht fuer das Auslesen von Dokumenten. */
  document: (
    <>
      <path d="M6 3.4h7.4L18 8v12.6H6z" />
      <path d="M13.4 3.4V8H18" />
      <path d="M3.6 13.8h16.8" />
    </>
  ),

  /* Karteikarte mit Person. Steht fuer gepflegte Kundendaten. */
  crm: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.4" />
      <circle cx="8.9" cy="10.6" r="2.2" />
      <path d="M5.6 15.8c.6-1.6 1.8-2.4 3.3-2.4s2.7.8 3.3 2.4" />
      <path d="M15.2 10.2h3.4" />
      <path d="M15.2 14h2" />
    </>
  ),

  /* Balken auf einer Achse. Steht fuer Zahlen und Berichte. */
  report: (
    <>
      <path d="M3.8 20.2h16.4" />
      <path d="M3.8 20.2V4" />
      <path d="M8.4 20.2v-5.6" />
      <path d="M12.8 20.2V9.4" />
      <path d="M17.2 20.2v-8" />
    </>
  ),
};

export function Mark({
  id,
  size = 22,
}: Readonly<{ id: MarkId; size?: number }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {markPaths[id]}
    </svg>
  );
}
