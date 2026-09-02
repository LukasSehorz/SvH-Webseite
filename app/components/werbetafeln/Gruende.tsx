"use client";

/* S2 Warum lokale Praesenz wirkt. Drei Gedanken, jeder in einem Satz,
   jeder sehr grosz nach M5. Der Grund wechselt auf die zweite dunkle
   Ebene nach M15. Keine Karten, keine Rahmen.

   Hier stehen keine Reichweiten und keine Prozentzahlen, weil nichts
   davon belegt ist. Statt einer Zahl steht rechts ein ruhiges Zeichen. */

import Rise from "./Rise";
import { Icon } from "./Icons";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export default function Gruende() {
  return (
    <section className={styles.gruende} aria-labelledby="werbetafeln-gruende">
      <div className="shell">
        {/* Die Sektion traegt drei gleichrangige Saetze und keine
            Ueberschrift ueber ihnen, damit genau eine Aussage stehen
            bleibt. Fuer die Gliederung steht sie unsichtbar da. */}
        <h2 id="werbetafeln-gruende" className={styles.srOnly}>
          {t.gruende.srTitle}
        </h2>

        <ul className={styles.gruendeList}>
          {t.gruende.lines.map((line, index) => (
            <Rise
              as="li"
              key={line.icon}
              delay={index * 0.12}
              className={styles.gruendeRow}
            >
              <p className={styles.gruendeText}>{line.text}</p>
              <span className={styles.gruendeMark} aria-hidden="true">
                <Icon name={line.icon} />
              </span>
            </Rise>
          ))}
        </ul>
      </div>
    </section>
  );
}
