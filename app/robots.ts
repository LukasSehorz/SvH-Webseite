import type { MetadataRoute } from "next";

const BASE = "https://svh-consulting.de"; // ❗TODO: finale Domain eintragen

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
