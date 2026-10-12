import type { MetadataRoute } from "next";
import { aktuelles } from "./copy";

/* Adresse der veröffentlichten Seite (mit Bindestrich). Die Rechtsseiten waren
   auf der alten Seite nicht auf noindex gesetzt und stehen deshalb mit
   niedriger Priorität in der Liste.
   Feste Daten statt new Date(), damit nicht jeder Build alle Seiten als
   geändert meldet. Bei inhaltlicher Änderung einer Seite hier nachtragen. */
const BASE = "https://svh-consult.de";

const STAND = {
  start: "2026-10-06", // helle Landingpage (ehemals Variante B) ist die einzige Startseite
  recht: "2026-09-29", // Rechtstexte von der alten Seite übernommen
};

// /aktuelles gilt als geändert, sobald ein neues Video oben in der Liste steht
const neuestesVideo = aktuelles.videos.reduce((a, v) => (v.datumIso > a ? v.datumIso : a), "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: STAND.start, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/aktuelles`, lastModified: neuestesVideo || STAND.start, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/impressum`, lastModified: STAND.recht, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/datenschutz`, lastModified: STAND.recht, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/agb`, lastModified: STAND.recht, changeFrequency: "yearly", priority: 0.2 },
  ];
}
