"use client";

/* S3 Wo die Tafeln stehen. Vier grosze Ortskarten nach M11, zwei
   nebeneinander auf breiten Fenstern und untereinander auf schmalen.

   Es steht keine Stadt, keine Adresse und kein Betriebsname auf dieser
   Seite. Die vier Ortsarten sind Kategorien und tragen die Sektion
   vollstaendig. Drei Karten tragen die vorhandenen Stockbilder, die
   vierte eine Flaeche in reinem Akzent, stark abgedunkelt, damit sich
   kein Motiv wiederholt.

   Beim Zeigen hebt sich das Bild um zwei Prozent und die kleine
   Tafelflaeche auf der Karte geht von gedaempft auf leuchtend, sodass
   sichtbar wird, dass genau dort ein Bildschirm haengt. Sonst steht die
   Sektion still. */

import Image from "next/image";
import Link from "next/link";
import Rise from "./Rise";
import { IconPfeil } from "./Icons";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export default function Orte() {
  return (
    <section className={styles.orte} id="orte" aria-labelledby="werbetafeln-orte">
      <div className="shell">
        <div className={styles.sectionHead}>
          <Rise>
            <h2 id="werbetafeln-orte" className={styles.sectionTitle}>
              {t.orte.titleBefore}{" "}
              <span className="grad-word">{t.orte.titleWord}</span>
            </h2>
          </Rise>
          <Rise delay={0.1}>
            <p className={`t-body-lg ${styles.sectionLead}`}>{t.orte.lead}</p>
          </Rise>
        </div>

        <div className={styles.orteGrid}>
          {t.orte.cards.map((card, index) => (
            <Rise key={card.id} delay={(index % 2) * 0.1}>
              <article className={styles.ortCard}>
                <div className={styles.ortMedia}>
                  {card.bild ? (
                    <Image
                      src={card.bild}
                      alt={card.alt ?? ""}
                      width={1400}
                      height={788}
                      sizes="(max-width: 1023px) 92vw, 46vw"
                    />
                  ) : (
                    <span className={styles.ortFlaeche} aria-hidden="true" />
                  )}
                  <span className={styles.ortShade} aria-hidden="true" />
                  <span className={styles.ortBoard} aria-hidden="true" />
                </div>

                <div className={styles.ortBody}>
                  <h3 className={styles.ortWord}>{card.wort}</h3>
                  <p className={`t-body ${styles.ortText}`}>{card.text}</p>
                </div>
              </article>
            </Rise>
          ))}
        </div>

        <Rise delay={0.1}>
          <div className={styles.orteFoot}>
            <Link href={t.orte.link.href} className={styles.quiet}>
              <span>{t.orte.link.label}</span>
              <IconPfeil />
            </Link>
          </div>
        </Rise>
      </div>
    </section>
  );
}
