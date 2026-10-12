import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,
  // Weiterleitungen: /b war die Vorschau-Adresse von Variante B. Die übrigen Pfade sind Unterseiten der
  // bisherigen Seite auf svh-consult.de (bis 12.10.2026), damit Links aus Google und von außen weiter ankommen.
  async redirects() {
    return [
      { source: "/b", destination: "/", permanent: false },
      { source: "/ki", destination: "/#leistungen", permanent: true },
      { source: "/kontakt", destination: "/#termin", permanent: true },
      { source: "/ueber-uns", destination: "/#ueber-uns", permanent: true },
      // Marketing und Webseiten bieten wir nicht mehr an
      { source: "/marketing", destination: "/", permanent: true },
      { source: "/marketing/:pfad*", destination: "/", permanent: true },
    ];
  },
  // Sicherheits-Header (HSTS setzt der Hoster)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 82, 85, 90],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
};

export default nextConfig;
