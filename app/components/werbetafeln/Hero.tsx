"use client";

/* S1 Hero nach M10. Links steht das Versprechen in Worten, rechts steht
   die Tafel auf ihrem Lichtteppich nach M2. Der Schirm ist der hellste
   Punkt der ganzen Seite nach M1.

   Die erste der drei Schleifen der Seite laeuft hier. Der Inhalt des
   Schirms wechselt alle vier Sekunden mit einem harten Schnitt, so wie
   eine echte Tafel ihre Spots durchlaeuft. Bei ruhiger Bewegung bleibt
   der erste Spot stehen. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSafeReducedMotion } from "../system/ui";
import Rise from "./Rise";
import Stele from "./Stele";
import { IconPfeil } from "./Icons";
import type { SpotDaten } from "./Spot";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

/* Sechs Sekunden je Spot. Der Auftrag nennt vier, die Videoschleifen auf
   dem Schirm sind aber sechs Sekunden lang, und ein Schnitt nach vier
   haette jede Bewegung mitten im Lauf abgeschnitten. Der harte Schnitt
   selbst bleibt, wie ihn eine echte Tafel macht. */
const TAKT = 6000;

export default function Hero({
  spots,
  bewegt,
}: Readonly<{ spots: readonly SpotDaten[]; bewegt: boolean }>) {
  const reduced = useSafeReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const uhr = window.setInterval(() => {
      setI((wert) => (wert + 1) % spots.length);
    }, TAKT);
    return () => window.clearInterval(uhr);
  }, [reduced, spots.length]);

  return (
    <section className={styles.hero} aria-labelledby="werbetafeln-titel">
      <div className="shell">
        <div className={styles.heroGrid}>
          <div>
            <Rise>
              <h1 id="werbetafeln-titel" className={styles.heroTitle}>
                {t.hero.titleBefore}{" "}
                <span className="grad-word">{t.hero.titleWord}</span>
                {t.hero.titleAfter}
              </h1>
            </Rise>

            <Rise delay={0.12}>
              <p className={`t-body-lg ${styles.heroLead}`}>{t.hero.lead}</p>
            </Rise>

            <Rise delay={0.22}>
              <div className={styles.heroAction}>
                {/* Der Verweis fuehrt ins Erstgespraech und ist damit die
                    Haupthandlung der Seite. Er traegt deshalb dieselbe Form
                    wie auf jeder anderen Seite und nicht mehr die leise
                    Schrift mit Unterstrich. Der leise Verweis .quiet bleibt
                    fuer die Stellen im Lauf der Seite, wo kein Knopf stehen
                    soll. */}
                <Link href={t.hero.link.href} className="btn-solid">
                  {t.hero.link.label}
                  <IconPfeil />
                </Link>
              </div>
            </Rise>
          </div>

          <div className={styles.heroStage}>
            <Stele
              key={spots[i].id}
              spot={spots[i]}
              className={styles.heroStele}
              bloom={88}
              neigung={7}
              bewegt={bewegt}
              groesze="(max-width: 1023px) 46vw, 268px"
              label={t.hero.steleLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
