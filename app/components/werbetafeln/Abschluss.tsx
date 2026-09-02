/* S6 Abschluss mit Strategiegespraech. Zurueck auf den Grund der Seite.

   Davor steht die Naheinstellung nach M9, also die Tafel grosz und an der
   Unterkante angeschnitten, damit die Groeszenordnung im Gedaechtnis
   bleibt. Dahinter atmet der Schein sehr langsam, acht Sekunden je
   Zyklus und acht Prozent Unterschied in der Helligkeit. Das ist die
   dritte und letzte Schleife der Seite.

   Der Knopf ist der einzige gefuellte Knopf der ganzen Seite und traegt
   den Verlauf nach M16. Beim Zeigen bekommt er einen weichen Schein. */

import Link from "next/link";
import Stele from "./Stele";
import Rise from "./Rise";
import type { SpotDaten } from "./Spot";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export default function Abschluss({ spot }: Readonly<{ spot: SpotDaten }>) {
  return (
    <section className={styles.abschluss} aria-labelledby="werbetafeln-abschluss">
      <span className={styles.abschlussGlow} aria-hidden="true" />

      <div className="shell">
        <div className={styles.abschlussInner}>
          <Rise>
            <h2 id="werbetafeln-abschluss" className={styles.abschlussTitle}>
              {t.abschluss.titleBefore}{" "}
              <span className="grad-word">{t.abschluss.titleWord}</span>
            </h2>
          </Rise>

          <Rise delay={0.1}>
            <p className={`t-body-lg ${styles.abschlussLead}`}>{t.abschluss.lead}</p>
          </Rise>

          <Rise delay={0.18}>
            <Link href={t.abschluss.cta.href} className={`btn-solid ${styles.ctaAbstand}`}>
              {t.abschluss.cta.label}
            </Link>
          </Rise>

          <Rise delay={0.24}>
            <p className={styles.abschlussNote}>{t.abschluss.note}</p>
          </Rise>
        </div>
      </div>

      <div className={styles.nah}>
        <Stele
          spot={spot}
          className={styles.nahStele}
          bloom={96}
          neigung={3}
          mitTeppich={false}
          mitFusz={false}
        />
      </div>
    </section>
  );
}
