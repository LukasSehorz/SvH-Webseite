import type { MetadataRoute } from "next";
import { servicePages } from "./content-pages";

const BASE = "https://svh-consulting.de"; // ❗TODO: finale Domain eintragen

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    { path: "/", priority: 1 },
    { path: "/leistungen", priority: 0.9 },
    { path: "/unternehmen/ueber-uns", priority: 0.7 },
    { path: "/unternehmen/kontakt", priority: 0.8 },
    { path: "/ressourcen/blog", priority: 0.5 },
    { path: "/ressourcen/fallstudien", priority: 0.5 },
    { path: "/impressum", priority: 0.2 },
    { path: "/datenschutz", priority: 0.2 },
    { path: "/agb", priority: 0.2 },
  ];

  return [
    ...staticPaths.map(({ path, priority }) => ({
      url: BASE + path,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...servicePages.map((s) => ({
      url: `${BASE}/leistungen/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
