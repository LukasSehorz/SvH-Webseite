/**
 * Feines Rausch-Overlay über einer 128px-Kachel.
 * Die Kachel entsteht als SVG-Turbulenz und liegt als data-URI im Markup,
 * dadurch bleibt sie serverseitig identisch und kostet keinen Netzaufruf.
 *
 * Die Farbmatrix macht aus der bunten Turbulenz ein weißes Korn und legt den
 * Rotkanal in die Deckkraft. Ohne diesen Schritt bleibt das Rauschen auf
 * dunklem Grund praktisch unsichtbar.
 */

const TILE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>" +
      "<filter id='n' color-interpolation-filters='sRGB'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>" +
      "<feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0'/>" +
      "</filter>" +
      "<rect width='128' height='128' filter='url(#n)'/></svg>",
  );

export default function Noise({
  opacity = 0.045,
}: Readonly<{ opacity?: number }>) {
  return (
    <span
      className="noise"
      aria-hidden="true"
      style={{ opacity, backgroundImage: `url("${TILE}")` }}
    />
  );
}
