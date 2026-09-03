import Navbar from "./components/system/Navbar";
import Footer from "./components/system/Footer";
import Hero from "./components/landing/Hero";
import Manifesto from "./components/landing/Manifesto";
import KiLayers from "./components/landing/KiLayers";
import KiTiles from "./components/landing/KiTiles";
import ProcessPanel from "./components/landing/ProcessPanel";
import MarketingDna from "./components/landing/MarketingDna";
import Showcase from "./components/landing/Showcase";
import DnaZone from "./components/marketing/DnaZone";
import Faq from "./components/landing/Faq";
import FinalCta from "./components/landing/FinalCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Manifesto />
        <KiLayers />
        <KiTiles />
        <ProcessPanel />
        {/* Die DNA-Struktur liegt NUR hinter der Marketing-Sektion und
            endet vor den Referenzen. */}
        <DnaZone>
          <MarketingDna />
        </DnaZone>
        {/* Die Referenzen standen am 03.09.2026 fuer kurze Zeit direkt
            hinter dem Kopf; der Auftraggeber hat sie noch am selben Tag
            wieder hierher zurueckverlangt. Der zweite Knopf im Kopf
            springt weiterhin hierher. */}
        <Showcase />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
