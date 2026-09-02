/* SOCIAL-AUSBAU

   Diese Fassung ersetzt die schlanke Platzhalterseite. Wer sie erneut
   ueberschreibt, nimmt der Seite ihre Sektionen; der Ausbau ist gewollt
   und abgestimmt.

   BAUVERTRAG

   THESE. Social Media wirkt, wenn regelmaeszig etwas erscheint und die
   Zahl der Menschen waechst, die zusehen. Wir zeigen dieses Wachsen,
   statt es zu behaupten.

   EIGENE WELT. Die Kugel-Welt der frueheren Marketingseite. Eine
   leuchtende Partikelkugel, Haarlinien, Blau bis Lavendel auf Schwarz.
   Sie gehoert jetzt allein dieser Leistung.

   GESCHICHTE. Wo Ihre Marke zu Hause ist, was passiert, wenn es laeuft,
   was dazugehoert, wie es ablaeuft, und dann das Gespraech.

   ERSTER BILDSCHIRM. Die Kugel links, rechts eine Ueberschrift in zwei
   Zeilen mit einem Verlaufswort, ein Satz und der Knopf zum
   Strategiegespraech.

   FORM. Eine Spalte durch die ganze Seite, breite Schale, das
   Zeichenmasz sitzt am Absatz. Je Sektion eine gestaltete Bewegung. */
import type { Metadata } from "next";
import Navbar from "../../components/system/Navbar";
import Footer from "../../components/system/Footer";
import FinalCta from "../../components/landing/FinalCta";
import SocialHero from "../../components/social/SocialHero";
import Platforms from "../../components/social/Platforms";
import GrowthScene from "../../components/social/GrowthScene";
import ScopeMarks from "../../components/social/ScopeMarks";
import StepChain from "../../components/social/StepChain";
import { socialPage } from "../../copy";

export const metadata: Metadata = {
  title: socialPage.meta.title,
  description: socialPage.meta.description,
};

export default function SocialMediaPage() {
  return (
    <>
      <Navbar />

      <main>
        <SocialHero />
        <Platforms />
        <GrowthScene />
        <ScopeMarks />
        <StepChain />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
