/* BAUVERTRAG

   THESE. Marketing ist bei uns dreierlei, und der Besucher soll in einem
   Blick sehen, welches der drei er braucht. Diese Seite waehlt aus und
   erklaert nicht.

   EIGENE WELT. Ruhiger Sternenhimmel ueber schwarzem Grund, Haarlinien,
   drei Felder mit je einem Sinnbild aus der Welt, in die sie fuehren.
   Die Kugeln gehoeren jetzt der Unterseite Social Media.

   GESCHICHTE. Eine Ueberschrift, ein Satz, die drei Wege, die Fragen,
   die fuer alle drei gelten, und dann das Gespraech.

   ERSTER BILDSCHIRM. Ueberschrift mit Verlaufswort, ein Satz darunter,
   und die Oberkante der drei Felder ist bereits angeschnitten.

   FORM. Drei gleichwertige Felder nebeneinander, ab tausendeinhundert
   Bildpunkten untereinander. Breite Schale, Zeichenmasz am Absatz. */
import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import { FaqAccordion } from "../components/landing/Faq";
import Starfield from "../components/marketing/Starfield";
import ServiceFields from "../components/social/ServiceFields";
import styles from "../components/social/social.module.css";
import { marketingPage, meta } from "../copy";
import { Reveal, SplitHeadline } from "../components/system/ui";

export const metadata: Metadata = {
  title: meta.marketing.title,
  description: meta.marketing.description,
};

export default function MarketingPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className={styles.head} data-shot="kopf">
          {/* Ein sehr ruhiges Funkeln hinter dem Kopf. Es traegt keine
              Aussage und ersetzt die Kugeln nicht, es nimmt der Flaeche
              nur das voellig Leere. */}
          <div className={styles.headStars} aria-hidden="true">
            <Starfield />
          </div>

          <div className={`shell ${styles.headInner}`}>
            <Reveal>
              <SplitHeadline
                as="h1"
                className={`t-h1 ${styles.headTitle}`}
                before={marketingPage.hero.titleBefore}
                word={marketingPage.hero.gradientWord}
                after={marketingPage.hero.titleAfter}
              />
            </Reveal>

            <Reveal delay={0.1}>
              <p className={`t-body-lg ${styles.headLead}`}>
                {marketingPage.hero.lead}
              </p>
            </Reveal>
          </div>
        </section>

        <ServiceFields />

        <section className="section" id="fragen" data-shot="fragen">
          <div className="shell">
            <div className="faq-head">
              <Reveal>
                <h2 className="t-h1 faq-title">{marketingPage.faqTitle}</h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="t-body-lg faq-intro">{marketingPage.faqIntro}</p>
              </Reveal>
            </div>

            <FaqAccordion items={marketingPage.faq} />
          </div>
        </section>

        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
