/*
 * BAUVERTRAG /aktuelles
 *
 * THESE. Wer vom KI-Zeitalter spricht, musz zeigen, dass er mittendrin
 * steht. Diese Seite belegt das mit dem, was gerade veroeffentlicht
 * wurde, statt es zu behaupten.
 *
 * EIGENE WELT. Dieselbe dunkle Flaeche wie die uebrigen Seiten,
 * Haarlinien als Taktstriche, ein Farbnebel in der Rampe hinter dem
 * ersten Vorschaubild. Neu ist allein das Abspielzeichen, gezeichnet mit
 * der Strichstaerke der Marke.
 *
 * GESCHICHTE. Ein kurzer Kopf, danach der neueste Beitrag grosz und quer,
 * die aelteren als Reihe darunter, zuletzt das Gespraech.
 *
 * ERSTER BILDSCHIRM. Beschriftung, zwei Zeilen mit Verlaufswort, ein Satz
 * und die Oberkante des neuesten Beitrags.
 *
 * FORM. Ein breiter Block, darunter zwei schmale. Kein Raster gleicher
 * Kacheln, denn der neueste Beitrag traegt mehr Gewicht als die aelteren.
 *
 * ES WIRD NICHTS EINGEBETTET, und das ist eine Entscheidung ueber
 * Datenschutz. Ein Abspielfenster von YouTube holt beim ersten Aufruf
 * Kennungen von Google, ohne dass der Besucher etwas angeklickt haette.
 * Gezeigt wird deshalb das Vorschaubild aus public/aktuelles, und erst
 * der Klick fuehrt zu YouTube.
 */

import type { Metadata } from "next";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";
import FinalCta from "../components/landing/FinalCta";
import News from "../components/pages/News";
import { SplitHeadline } from "../components/system/ui";
import { aktuelles } from "../copy";

export const metadata: Metadata = {
  title: aktuelles.meta.title,
  description: aktuelles.meta.description,
};

export default function AktuellesPage() {
  return (
    <>
      <Navbar />

      <main>
        <section
          className="subpage-head"
          style={{ paddingBottom: "clamp(48px, 6vw, 84px)" }}
        >
          <div className="shell">
            <p className="t-label">{aktuelles.label}</p>

            <SplitHeadline
              as="h1"
              className="t-h1 subpage-title"
              before={aktuelles.titleBefore}
              word={aktuelles.gradientWord}
              after={aktuelles.titleAfter}
            />

            <p className="t-body-lg subpage-lead">{aktuelles.intro}</p>
          </div>
        </section>

        <News />

        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
