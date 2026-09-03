/*
 * BAUVERTRAG /ueber-uns
 *
 * THESE. SVH ist der eine Partner fuer den ganzen digitalen Auftritt und
 * keine Agentur fuer eine einzelne Leistung.
 *
 * EIGENE WELT. Schwarzer Grund, ein blau-lila Verlauf, Haarlinien und
 * Farbnebel. Aussagen entstehen aus Formen und Bewegung, nicht aus Zahlen.
 * Belegt ist allein die Zahl 35, und nur sie steht auf der Seite.
 *
 * GESCHICHTE. Im ersten Bildschirm laufen drei getrennte Straenge zu einem
 * zusammen. Danach zeigen drei kleine Szenen, was sich dadurch im Betrieb
 * aendert. Danach das ruhige Feld mit den umgesetzten Projekten, die drei
 * Werte und die beiden Namen dahinter.
 *
 * ERSTER BILDSCHIRM. Links zwei kurze Zeilen, ein Satz, ein zweiter
 * ruhiger Satz und der Knopf zum Strategiegespraech. Rechts die drei
 * Straenge fuer Webseite, Social Media und KI, die nach dem Laden zu
 * einem werden und dann verbunden bleiben.
 *
 * FORM. Der Kopf ist ab 1024 Bildpunkten zweispaltig, die Buehne waechst
 * mit der rechten Spalte. Darunter eine Spalte auf der Schale, Sektionen
 * durch Haarlinien getrennt, je Sektion genau eine gestaltete Bewegung aus
 * sichtbarem Zustand.
 */

import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import AboutHero from "../components/pages/AboutHero";
import AboutScenes from "../components/pages/AboutScenes";
import AboutProof from "../components/pages/AboutProof";
import AboutValues from "../components/pages/AboutValues";
import TeamBlock from "../components/pages/TeamBlock";
import { meta } from "../copy";

export const metadata: Metadata = {
  title: meta.about.title,
  description: meta.about.description,
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Die Buehne mit den drei Straengen steht seit dem 03.09.2026 im
            Kopf. Die fruehere eigene Sektion darunter ist damit entfallen,
            ihr Absatz steht jetzt als zweiter Satz im Kopf. */}
        <AboutHero />

        <AboutScenes />

        <AboutProof />

        <AboutValues />

        <TeamBlock />

        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
