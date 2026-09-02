import type { NextConfig } from "next";

/* Das Ausgabeverzeichnis laeszt sich ueber die Umgebung umlenken. Ein
   Probebau wuerde sonst das Verzeichnis .next ueberschreiben, aus dem der
   laufende Entwicklungsserver auf Port 3100 gerade seine Seiten liefert,
   und der Server bricht dabei ab. Ohne die Variable bleibt alles beim
   Vorgabewert. */
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
export default nextConfig;
