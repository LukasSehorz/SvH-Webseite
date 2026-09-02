/* WERBETAFELN-AUSBAU

   BAUVERTRAG

   THESE. Eine Tafel an einem vollen Ort wirkt, weil die Leute dort schon
   stehen, Zeit haben und aus der Naehe kommen.

   EIGENE WELT. Die Tafel im Dunkeln. Eine schmale Stele in
   Personengroesze mit einem feinen hellen Saum am Gehaeuse, einem
   Lichtteppich darunter und einem Schirm, der die einzige wirklich helle
   Flaeche der ganzen Seite ist.

   GESCHICHTE. Ihr Betrieb laeuft auf einem Bildschirm. Warum das wirkt.
   Wo die Tafeln stehen. Was darauf laeuft. Wie es ablaeuft. Ein
   Gespraech.

   ERSTER BILDSCHIRM. Links ein Satz in sehr leichter Schrift, rechts die
   Tafel auf ihrem Licht, und auf dem Schirm wechseln drei gezeichnete
   Spots im harten Schnitt.

   FORM. Flache Geometrie in CSS mit perspective statt einer zweiten
   WebGL-Szene, Bewegung am Scrollstand, drei Schleifen und sonst
   Stillstand. Grundlage ist _ref3/brief-werbetafeln.md. */

import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Navbar from "../../components/system/Navbar";
import Footer from "../../components/system/Footer";
import Hero from "../../components/werbetafeln/Hero";
import Gruende from "../../components/werbetafeln/Gruende";
import Orte from "../../components/werbetafeln/Orte";
import Band from "../../components/werbetafeln/Band";
import Inhalte from "../../components/werbetafeln/Inhalte";
import Ablauf from "../../components/werbetafeln/Ablauf";
import Abschluss from "../../components/werbetafeln/Abschluss";
import styles from "../../components/werbetafeln/werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

/* Die Videos auf dem Schirm entstehen ausserhalb dieses Baus und liegen
   nicht immer vollstaendig vor. Geprueft wird deshalb beim Bauen, welche
   Dateien wirklich da sind. Fehlt eine, bleibt es beim Standbild und die
   Seite fordert nie eine Adresse an, die es nicht gibt. */
function videosVorhanden(): boolean {
  const ordner = path.join(process.cwd(), "public");
  return t.spots
    .slice(0, 3)
    .every((spot) => existsSync(path.join(ordner, spot.video)));
}

export default function WerbetafelnPage() {
  const spots = t.spots;
  const bewegt = videosVorhanden();

  /* Jede Tafel der Seite zeigt einen anderen Spot nach M3, damit ohne
     einen Satz Erklaerung klar ist, dass hier wechselnde Betriebe
     laufen. Der Hero durchlaeuft die ersten drei. */
  return (
    <>
      <Navbar />

      {/* Die Palette dieser Welt haengt an einer Klasse und nicht an
          :root, damit sie keine andere Seite beruehrt. */}
      <main className={styles.page}>
        <Hero spots={spots.slice(0, 3)} bewegt={bewegt} />
        <Gruende />
        <Orte />
        <Band />
        <Inhalte spots={[spots[3], spots[0]]} />
        <Ablauf spot={spots[1]} />
        <Abschluss spot={spots[2]} />
      </main>

      <Footer />
    </>
  );
}
