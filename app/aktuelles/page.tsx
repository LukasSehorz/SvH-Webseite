import type { Metadata } from "next";
import { aktuelles } from "@/app/copy";
import { company } from "@/app/content";
import PageHead from "@/components/pages/PageHead";
import Videos from "@/components/pages/Videos";
import Naechster from "@/components/b/Naechster";
import JsonLd from "@/components/system/JsonLd";
import { pageMeta } from "@/components/pages/meta";

/*
 * /aktuelles: Kopf, neuestes Video groß, übrige als Raster, Hinweis und
 * Kanal-Link, zum Schluss derselbe Kasten „Überzeuge dich selbst“ wie auf der
 * Startseite (der Knopf öffnet die Anmeldung im Fenster).
 * Nichts wird eingebettet, erst ein Klick öffnet YouTube.
 */

const title = `${aktuelles.meta.title} | ${company.name}`;

export const metadata: Metadata = pageMeta({ title: aktuelles.meta.title, description: aktuelles.meta.description, path: "/aktuelles" });

/**
 * Veröffentlichungsdatum als ISO 8601 mit Uhrzeit und Zeitzone (Empfehlung von Google).
 * Die genaue Uhrzeit steht nicht in der Liste; 12 Uhr deutscher Zeit hält den Tag
 * in allen Zeitzonen stabil. Sommer- und Winterzeit werden je Datum berechnet.
 */
function uploadDate(isoDay: string): string {
  const noonUtc = new Date(`${isoDay}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", timeZoneName: "longOffset" })
    .formatToParts(noonUtc)
    .find((p) => p.type === "timeZoneName")?.value; // z. B. "GMT+02:00"
  const offset = name && name !== "GMT" ? name.replace("GMT", "") : "+00:00";
  return `${isoDay}T12:00:00${offset}`;
}

// Strukturierte Daten: Liste der Videos (nur Angaben, die auch sichtbar sind)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  url: `${company.url}/aktuelles`,
  inLanguage: "de-DE",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: aktuelles.videos.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoObject",
        name: v.titel,
        description: v.body,
        uploadDate: uploadDate(v.datumIso),
        thumbnailUrl: `${company.url}${v.bild}`,
        url: v.href,
      },
    })),
  },
};

export default function AktuellesPage() {
  return (
    <main id="inhalt" className="ak-seite">
      <JsonLd data={jsonLd} />
      <PageHead label={aktuelles.label} title={aktuelles.title} lead={aktuelles.text} center />
      <Videos />
      <Naechster />
    </main>
  );
}
