import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import ContactCards, { ContactGrid } from "../components/pages/ContactCards";
import ContactDirect from "../components/pages/ContactDirect";
import ContactDetails from "../components/pages/ContactDetails";
import { contactPage, meta } from "../copy";
import { SplitHeadline } from "../components/system/ui";

export const metadata: Metadata = {
  title: meta.contact.title,
  description: meta.contact.description,
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="subpage-head" style={{ paddingBottom: "clamp(56px, 7vw, 96px)" }}>
          <div className="shell">
            <p className="t-label">{contactPage.hero.label}</p>

            <SplitHeadline
              as="h1"
              className="t-h1 subpage-title"
              before={contactPage.hero.titleBefore}
              word={contactPage.hero.gradientWord}
              after={contactPage.hero.titleAfter}
            />

            <p className="t-body-lg subpage-lead">{contactPage.hero.lead}</p>
          </div>
        </section>

        {/* Die Reihenfolge im Blatt gilt unter 1280 Bildpunkten. Ab 1280
            ordnet das Raster um und stellt den Block Direkt links neben
            Wege und Angaben, damit ein breiter Schirm nicht halb leer
            bleibt.

            Statt des Formulars stehen im Block Direkt Telefon und E-Mail.
            Die Komponente ContactForm bleibt gebaut und ungerendert, weil
            der Empfaenger noch nicht feststeht und eine Erfolgsmeldung
            ohne Versand eine Luege waere. Sobald der Versand angebunden
            ist, wird ContactDirect wieder gegen ContactForm getauscht. */}
        <ContactGrid>
          <ContactCards />
          <ContactDirect />
          <ContactDetails />
        </ContactGrid>
      </main>

      {/* Kein Abschlussband. Diese Seite ist bereits das Ziel. */}
      <Footer />
    </>
  );
}
