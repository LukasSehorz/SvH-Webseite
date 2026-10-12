import type { Metadata } from "next";
import { meta } from "@/app/copy";
import { company } from "@/app/content";

/**
 * Metadaten einer Unterseite: eigener Titel, Beschreibung, kanonische Adresse
 * und passende Vorschau (OG/Twitter). Ohne das erben Unterseiten Titel und
 * Adresse der Startseite aus layout.tsx.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = `${title} | ${company.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: company.name,
      title: full,
      description,
      url: `${company.url}${path}`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: full, description, images: ["/og.png"] },
  };
}
