import type { Metadata } from "next";
import { company } from "@/app/content";
import JsonLd from "@/components/system/JsonLd";
import Hero from "@/components/b/Hero";
import TrustBar from "@/components/b/TrustBar";
import KundenLogos from "@/components/b/KundenLogos";
import Problem from "@/components/b/Problem";
import Unendlich from "@/components/b/Unendlich";
import { Workshop } from "@/components/b/Leistungen";
import Loesungen from "@/components/b/Loesungen";
import Masterplan from "@/components/b/Masterplan";
import Zahnraeder from "@/components/b/Zahnraeder";
import Kunden from "@/components/b/Kunden";
import { Aktuelles, UeberUns } from "@/components/b/UeberUns";
import Naechster from "@/components/b/Naechster";
import Fragen from "@/components/b/Fragen";
import FuerWen from "@/components/b/FuerWen";
import Abschluss from "@/components/b/Abschluss";

// Kanonische Adresse nur für die Startseite (Unterseiten setzen ihre eigene)
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* Startseite. Aufbau nach der Struktur von andreasbaulig.de (roter Faden, Erklärung in app/copy-b.ts):
   Versprechen + Beweis → Problem → Lösung mit Gewinnen (Zahnräder) → Leistungen 0–4 → Lösungen →
   Kunden (Beweis) → Gründer → Masterplan → Ablauf mit Garantie → nächster Schritt → Für wen → Fragen → Videos → Abschluss.
   Die Videos (Aktuelles, führen zu YouTube) stehen seit Runde 3 hinter den Fragen: vor dem Angebot führt nichts von der Seite weg.
   Hintergründe wechseln ab: Lösungen weiß · Kunden getönt · Gründer getönt · Masterplan dunkles Band über die volle Breite ·
   Workshop getönt · nächster Schritt weiß (dunkler Kasten) · Für wen + Fragen weiß · Videos getönt · Abschluss weiß.
   Alle Knöpfe „Kostenlosen KI-Workshop sichern“ öffnen die Anmeldung im Fenster (FormDialog im Layout). */
export default function Home() {
  return (
    <main id="inhalt">
      {/* Strukturierte Daten: nur Angaben, die auch sichtbar auf der Seite stehen */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: company.name,
          legalName: company.legalName,
          url: `${company.url}/`,
          logo: `${company.url}/icon.png`,
          image: `${company.url}/og.png`,
          telephone: company.phoneHref,
          email: company.email,
          address: {
            "@type": "PostalAddress",
            ...(company.street ? { streetAddress: company.street } : {}),
            postalCode: company.zipCity.split(" ")[0],
            addressLocality: company.zipCity.split(" ").slice(1).join(" "),
            addressCountry: "DE",
          },
          founder: company.partners.map((name) => ({ "@type": "Person", name })),
          sameAs: [company.youtube],
          areaServed: "DE",
        }}
      />
      <Hero />
      <TrustBar />
      <KundenLogos />
      <Problem />
      <Zahnraeder />
      <Unendlich />
      <Loesungen />
      <Kunden />
      <UeberUns />
      <Masterplan />
      <Workshop />
      <Naechster />
      <FuerWen />
      <Fragen />
      <Aktuelles />
      <Abschluss />
    </main>
  );
}
