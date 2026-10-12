import type { MetadataRoute } from "next";

/* Dieselbe Adresse wie in sitemap.ts (mit Bindestrich, so antwortet die Seite). */
const BASE = "https://svh-consult.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
