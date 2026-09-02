/*
 * BAUVERTRAG /ki
 *
 * THESE. Wer KI einkauft, kauft kein Werkzeug, sondern einen Partner, der
 * den Betrieb umstellt. Die Seite zeigt deshalb Arbeit, die verschwindet.
 *
 * EIGENE WELT. Schwarzer Grund, Haarlinien, Balken und ein blau-violetter
 * Farbnebel. Acht Zeichen tragen die Seite, jedes gehoert zu genau einer
 * Aufgabe und kehrt in jeder Sektion wieder.
 *
 * GESCHICHTE. Erst die acht Aufgaben, die ab sofort von allein laufen.
 * Dann dieselben acht als Ablauf in drei Schritten, die aufeinander
 * aufbauen. Zuletzt das Gespraech, das nichts kostet.
 *
 * ERSTER BILDSCHIRM. Zwei kurze Zeilen, ein Satz, ein Knopf und darunter
 * die erste Reihe lebender Kacheln.
 *
 * FORM. Kein Raster gleicher Karten als Seitengeruest. Ziffern nur dort,
 * wo die Reihenfolge selbst die Aussage ist. Bewegt werden ausschliesslich
 * transform, opacity, filter und clip-path.
 */

import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import KiHero from "../components/ki/Hero";
import KiServices from "../components/ki/Services";
import KiFlow from "../components/ki/Flow";
import { meta } from "../copy";

export const metadata: Metadata = {
  title: meta.ki.title,
  description: meta.ki.description,
};

export default function KiPage() {
  return (
    <>
      <Navbar />

      <main>
        <KiHero />
        <KiServices />
        <KiFlow />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
