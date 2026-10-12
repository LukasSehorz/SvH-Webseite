/* Logo-Dateien der Kunden (public/kunden/). Breite/Höhe = natürliches Seitenverhältnis.
   Estera: Schriftzug aus dem Signet der Seite zugeschnitten (keine eigene Logo-Datei vorhanden).
   KE Frästechnik: Bildmarke aus dem Footer, Schrift nachgebaut. Beide besser durch Originale ersetzen. */
export const LOGOS: Record<string, { src: string; w: number; h: number }> = {
  estera: { src: "/kunden/estera.svg", w: 340, h: 67 },
  fuchspools: { src: "/kunden/fuchspools.png", w: 622, h: 298 },
  brandhuber: { src: "/kunden/brandhuber.png", w: 900, h: 106 },
  "world-of-less": { src: "/kunden/world-of-less-dunkel.png", w: 747, h: 765 },
  innnatur: { src: "/kunden/innnatur.png", w: 959, h: 267 },
  "physio-schediwy": { src: "/kunden/physio-schediwy-dunkel.png", w: 1145, h: 850 },
  "ke-fraestechnik": { src: "/kunden/ke-fraestechnik.svg", w: 278.5, h: 46 },
  // Taxi Izi: Logo aus dem Webdesign-Projekt (auf Schwarz, deshalb auf dunkler Fläche zeigen)
  taxiizi: { src: "/kunden/taxiizi.webp", w: 1142, h: 447 },
  // Brandmaier & Rauscher GbR (Einlagen): Logo von Jannik geliefert (07.10.2026)
  "brandmaier-rauscher": { src: "/kunden/brandmaier-rauscher.webp", w: 1882, h: 739 },
};
