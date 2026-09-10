import type { MetadataRoute } from "next";

/* Dieselbe Adresse wie in sitemap.ts, mit Bindestrich zwischen svh und
   consult. Weicht sie hier ab, fuehrt der Verweis auf die Sitemap ins
   Leere und die Suchmaschine findet die Seitenliste nicht. */
const BASE = "https://svh-consult.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
