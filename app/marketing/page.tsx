/* BAUVERTRAG

   THESE. Marketing ist bei uns zweierlei, und der Besucher soll in einem
   Blick sehen, welchen der zwei Wege er braucht. Diese Seite waehlt aus
   und erklaert nicht.

   EIGENE WELT. Ruhiger Sternenhimmel ueber schwarzem Grund, Haarlinien,
   zwei Bloecke mit je einem Sinnbild aus der Welt, in die sie fuehren.
   Die Kugeln gehoeren der Unterseite Social Media.

   GESCHICHTE. Eine Ueberschrift, ein Satz, der Knopf ins Gespraech, die
   zwei Wege, die Fragen, die fuer beide gelten, und dann das Gespraech.

   ERSTER BILDSCHIRM. Ueberschrift mit Verlaufswort, ein Satz, der Knopf
   zum Strategiegespraech, und ab 1024 Bildpunkten rechts daneben das
   Schaustueck aus Browserfenster und Beitrag, das einmal anlaeuft.

   FORM. Zwei verschieden gebaute Bloecke untereinander statt gleicher
   Felder. Webseiten fuehrt das Fenster links und den Text rechts, Social
   Media den Text links und den Beitrag rechts, dazwischen eine
   Haarlinie, je Block ein Ton aus der Rampe. Breite Schale, Zeichenmasz
   am Absatz, unter 1024 Bildpunkten Sinnbild und Text untereinander. */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import { FaqAccordion } from "../components/landing/Faq";
import Starfield from "../components/marketing/Starfield";
import ServiceFields, { HeroShow } from "../components/social/ServiceFields";
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
            <div className={styles.headText}>
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

              {/* Der Weg ins Gespraech steht im ersten Bildschirm. Der
                  Pruefbericht hatte bemaengelt, dass er hier fehlte. */}
              <Reveal delay={0.2}>
                <div className={styles.headAction}>
                  <Link href={marketingPage.hero.cta.href} className="btn-solid">
                    {marketingPage.hero.cta.label}
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.24} className={styles.headSlot}>
              <HeroShow />
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
