import type { MetadataRoute } from "next";

const BASE = "https://svh-consulting.de"; // ❗TODO: finale Domain eintragen

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: "/", priority: 1 },
    { path: "/ki", priority: 0.9 },
    { path: "/marketing", priority: 0.9 },
    { path: "/marketing/webseiten", priority: 0.8 },
    { path: "/marketing/social-media", priority: 0.8 },
    /* /marketing/werbetafeln fehlt hier seit dem 03.09.2026 mit Absicht.
       Die Tafeln werden vorerst nicht angeboten, die Seite ist aus allen
       Verweisen genommen und traegt selbst die Anweisung noindex. */
    { path: "/ueber-uns", priority: 0.7 },
    { path: "/kontakt", priority: 0.8 },
    { path: "/impressum", priority: 0.2 },
    { path: "/datenschutz", priority: 0.2 },
    { path: "/agb", priority: 0.2 },
  ];

  const lastModified = new Date();

  return paths.map(({ path, priority }) => ({
    url: BASE + path,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
