/* WEBSEITEN-AUSBAU
 *
 * THESE. Diese Seite verweigert das Raster gleich groszer Karten. Ihre
 * eine Idee heiszt Fenster im Dunkeln. Jede Aussage ist ein leuchtendes
 * Rechteck auf Schwarz, und sein Licht faerbt den Raum um es herum.
 *
 * EIGENE WELT. Grund #050507. Nebel in #5b8cff, #7c6aff und #b9a5ff,
 * gestreut hinter jedem Fenster. Bausteine sind der gerundete Rahmen mit
 * Haarlinie und sehr dunklem Innerem, die Haarlinie mit zweistelliger
 * Nummer, die gezeichnete Oberflaeche aus Balken und die Browserleiste
 * mit drei Punkten und echter Adresse. Blau steht nur auf Knoepfen.
 *
 * GESCHICHTE. Der Besucher versteht, dass eine Webseite Arbeit fuer ihn
 * erledigt. Er glaubt es, weil vier echte Kundenseiten vor ihm
 * durchlaufen. Er bucht das kostenlose Gespraech.
 *
 * ERSTER BILDSCHIRM. Elf gedaempfte Kacheln echter Kundenseiten in drei
 * Tiefen um eine zentrierte Ueberschrift von bis zu 108 Bildpunkten,
 * darunter ein Satz, darunter mittig der blaue Knopf.
 *
 * FORM. Sanduhr aus Deck und Lightspark, M1 bis M12 nach dem Auftrag
 * _ref3/brief-webseiten.md.
 */

import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "../../components/system/Navbar";
import Footer from "../../components/system/Footer";
import { GradientWord } from "../../components/system/ui";

import Band from "../../components/webseiten/Band";
import Fade from "../../components/webseiten/Fade";
import HeroField from "../../components/webseiten/HeroField";
import Refs from "../../components/webseiten/Refs";
import SectionHead from "../../components/webseiten/SectionHead";
import Steps from "../../components/webseiten/Steps";
import WhyBand from "../../components/webseiten/WhyBand";
import WorkRows from "../../components/webseiten/WorkRows";
import { ArrowIcon } from "../../components/webseiten/Icons";
import s from "../../components/webseiten/webseiten.module.css";

import { webseitenPage as c } from "../../copy";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

/* Wie viele der sechs Leistungen als volle Reihe stehen. Der Rest steht
   als kompakte Dreierreihe.

   Der Wert ist gemessen und nicht geschaetzt. Mit sechs vollen Reihen
   stand die Sektion bei 1440 mal 900 auf 3444 Bildpunkten und die ganze
   Seite auf 14,71 Bildhoehen, deutlich ueber der Marke von rund elf.
   Abschnitt 7 des Auftrags sieht fuer genau diesen Fall vor, die letzten
   drei Punkte zu einer kompakten Dreierreihe zusammenzuziehen und die
   drei staerksten vorn stehen zu lassen. Das sind modernes Design, mobil
   optimiert und schnelle Ladezeiten. */
const VOLLE_REIHEN = 3;

export default function WebseitenPage() {
  return (
    <>
      <Navbar />

      <main className={s.page}>
        {/* S1 Hero, M1 */}
        <section className={s.hero} aria-labelledby="webseiten-titel">
          <HeroField />

          <div className="shell">
            <div className={s.heroCore}>
              <span className={s.heroHalo} aria-hidden="true" />

              <h1 className={s.heroTitle} id="webseiten-titel">
                <span className={s.heroLine}>{c.hero.line1}</span>
                <span className={s.heroLine}>
                  {c.hero.line2Before}
                  <GradientWord>{c.hero.line2Word}</GradientWord>
                  {c.hero.line2After}
                </span>
              </h1>

              <p className={s.heroLead}>{c.hero.lead}</p>

              <div className={s.heroActions}>
                {/* Eine Hauptform fuer die eine Handlung. Die Farbe dieser
                    Seite kommt aus den Knopfvariablen an .page. */}
                <Link className="btn-solid" href={c.hero.cta.href}>
                  {c.hero.cta.label}
                  <ArrowIcon size={15} />
                </Link>
                <a className="btn-dash" href={c.hero.secondary.href}>
                  {c.hero.secondary.label}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* S2 Bausteinband, M9 */}
        <section aria-labelledby="webseiten-bausteine" style={{ paddingBottom: 24 }}>
          <h2 className={s.srOnly} id="webseiten-bausteine">
            Woraus eine Webseite besteht
          </h2>
          <div className="shell">
            <Band note={c.band.note} itemsA={c.band.itemsA} itemsB={c.band.itemsB} />
          </div>
        </section>

        {/* S3 Warum eine gute Webseite, M7 mit M6 */}
        <section className="section" aria-labelledby="webseiten-warum">
          <div className="shell">
            <SectionHead
              id="webseiten-warum"
              before={c.why.titleBefore}
              word={c.why.titleWord}
              after={c.why.titleAfter}
              aside={c.why.aside}
            />
            <WhyBand fields={c.why.fields} />
          </div>
        </section>

        {/* S4 Was wir tun, M5 mit M6 */}
        <section className="section" aria-labelledby="webseiten-leistungen">
          <div className="shell">
            <SectionHead
              id="webseiten-leistungen"
              before={c.work.titleBefore}
              word={c.work.titleWord}
              after={c.work.titleAfter}
              aside={c.work.aside}
            />
            <WorkRows rows={c.work.rows} vollAnzahl={VOLLE_REIHEN} />
          </div>
        </section>

        {/* S5 Die vier Referenzprojekte, M8 dann M2 mit M3 und M4 */}
        <section className="section" id="referenzen" aria-labelledby="webseiten-referenzen">
          <div className="shell">
            <SectionHead
              id="webseiten-referenzen"
              before={c.refs.titleBefore}
              word={c.refs.titleWord}
              after={c.refs.titleAfter}
              aside={c.refs.aside}
            />
            <Refs
              items={c.refs.items}
              overviewNote={c.refs.overviewNote}
              runNote={c.refs.runNote}
            />
          </div>
        </section>

        {/* S6 Ablauf, M10 */}
        <section className="section" aria-labelledby="webseiten-ablauf">
          <div className="shell">
            <SectionHead
              id="webseiten-ablauf"
              before={c.steps.titleBefore}
              word={c.steps.titleWord}
              after={c.steps.titleAfter}
              aside={c.steps.aside}
            />
          </div>
          <div className="shell">
            <Steps items={c.steps.items} />
          </div>
        </section>

        {/* S7 Abschluss, M11. Der ruhigste Punkt der Seite. */}
        <section className={s.close} aria-labelledby="webseiten-abschluss">
          <span className={s.closeMist} aria-hidden="true" />
          <div className="shell">
            <Fade className={s.closeInner} boden={0.55}>
              <h2 className={s.closeTitle} id="webseiten-abschluss">
                {c.close.titleBefore} <GradientWord>{c.close.titleWord}</GradientWord>{" "}
                {c.close.titleAfter}
              </h2>
              <p className={s.closeLead}>{c.close.lead}</p>
              <div className={s.closeActions}>
                <Link className="btn-solid" href={c.close.cta.href}>
                  {c.close.cta.label}
                  <ArrowIcon size={15} />
                </Link>
                <Link className="btn-dash" href={c.close.secondary.href}>
                  {c.close.secondary.label}
                </Link>
              </div>
            </Fade>
          </div>
        </section>
      </main>

      {/* S8 Fusz mit der Wortmarke nach M11 */}
      <Footer />
    </>
  );
}
