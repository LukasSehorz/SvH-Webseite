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

/* Vier Sekunden je Spot. Kuerzer wirkt hektisch, laenger liest sich wie
   ein Standbild. */
const TAKT = 4000;

export default function Hero({ spots }: Readonly<{ spots: readonly SpotDaten[] }>) {
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
                <Link href={t.hero.link.href} className={styles.quiet}>
                  <span>{t.hero.link.label}</span>
                  <IconPfeil />
                </Link>
              </div>
            </Rise>
          </div>

          <div className={styles.heroStage}>
            <Stele
              spot={spots[i]}
              className={styles.heroStele}
              bloom={88}
              neigung={7}
              label={t.hero.steleLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
