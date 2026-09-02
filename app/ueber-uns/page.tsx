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
 * GESCHICHTE. Drei getrennte Straenge laufen zu einem zusammen. Danach
 * zeigen drei kleine Szenen, was sich dadurch im Betrieb aendert. Danach
 * das ruhige Feld mit den umgesetzten Projekten, die drei Werte und die
 * beiden Namen dahinter.
 *
 * ERSTER BILDSCHIRM. Zwei kurze Zeilen, ein Satz, ein Knopf zum
 * Strategiegespraech.
 *
 * FORM. Eine Spalte auf der Schale, Sektionen durch Haarlinien getrennt,
 * je Sektion genau eine gestaltete Bewegung aus sichtbarem Zustand.
 */

import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import AboutHero from "../components/pages/AboutHero";
import AboutStrands from "../components/pages/AboutStrands";
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
        <AboutHero />

        <AboutStrands />

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
