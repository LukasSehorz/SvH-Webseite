import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import ContactCards, { ContactGrid } from "../components/pages/ContactCards";
import ContactForm from "../components/pages/ContactForm";
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
            ordnet das Raster um und stellt das Formular links neben Wege
            und Angaben, damit ein breiter Schirm nicht halb leer bleibt.

            Das Formular ist seit dem 03.09.2026 wieder eingehaengt, denn
            der Empfaenger steht fest. Telefon und E-Mail stehen bei den
            Angaben, damit beide Wege auch ohne Formular sichtbar bleiben. */}
        <ContactGrid>
          <ContactCards />
          <ContactForm />
          <ContactDetails />
        </ContactGrid>
      </main>

      {/* Kein Abschlussband. Diese Seite ist bereits das Ziel. */}
      <Footer />
    </>
  );
}
