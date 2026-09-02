"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import styles from "./marketing.module.css";

/* Die Struktur zieht three.js nach sich, und das schlaegt mit rund 708
   Kilobyte zu Buche, also mit dem groeszten Einzelposten der Erstlade-Menge
   von 1753. Sie steht aber erst weit unten auf der Seite und traegt nichts
   zum ersten Bild bei.
   Deshalb wird sie nachgeladen und nicht auf dem Server vorgerendert. Auf
   dem Server gaebe es ohnehin kein WebGL, das Vorrendern lieferte also nur
   eine leere Leinwand. */
const DnaBand = dynamic(() => import("./DnaBand"), { ssr: false });

/* ------------------------------------------------------------------ */
/*  DNA-Zone                                                           */
/*                                                                     */
/*  EINE durchgehende vertikale Struktur liegt hinter der Marketing-    */
/*  Sektion UND den Referenzen. Sie klebt als Viewport-Leinwand im      */
/*  Bild, dreht in Ruhe langsam um die senkrechte Achse und             */
/*  beschleunigt beim Scrollen, waehrend der Scrollweg die Torsion      */
/*  weiterschiebt. Ueber die Maske der Zone traegt sie oben die volle   */
/*  Staerke, wird hinter dem Showcase leiser und klingt am unteren      */
/*  Ende aus, sodass die FAQ auf ruhigem Grund beginnt.                 */
/*                                                                     */
/*  Der Hintergrund nimmt keine Zeigerereignisse an. Der Pin des        */
/*  Showcase bleibt unberuehrt, weil die Zone selbst keine Hoehe        */
/*  erzwingt und nicht transformiert wird.                              */
/* ------------------------------------------------------------------ */

export default function DnaZone({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.dnaZone}>
      <div className={styles.dnaZoneBg} aria-hidden="true">
        <div className={styles.dnaSticky}>
          <DnaBand className={styles.dnaBand} />
        </div>
      </div>

      <div className={styles.dnaZoneContent}>{children}</div>
    </div>
  );
}
