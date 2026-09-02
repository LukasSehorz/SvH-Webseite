"use client";

/* Das waagerechte Band nach M14, zwischen Sektion 3 und Sektion 4. Jede
   Kachel zeigt eine Situation und darunter das Ortswort als Kategorie.
   Kein Betriebsname und keine Adresse steht auf einer Kachel.

   Das Band laeuft nicht von selbst. Es bewegt sich nur, wenn der
   Besucher es zieht, und zaehlt deshalb nicht gegen das Bewegungsbudget.
   Es ist mit der Maus und mit dem Finger ziehbar und mit der Tastatur
   erreichbar, weil die Spur ein gewoehnlicher Rollbereich mit Fokus
   ist. */

import Image from "next/image";
import { useRef, useState } from "react";
import Spot, { type SpotDaten } from "./Spot";
import Rise from "./Rise";
import styles from "./werbetafeln.module.css";
import { werbetafelnPage as t } from "../../copy";

export default function Band({ spots }: Readonly<{ spots: readonly SpotDaten[] }>) {
  const spur = useRef<HTMLDivElement>(null);
  const [zieht, setZieht] = useState(false);
  const start = useRef({ x: 0, links: 0 });

  const beginn = (event: React.PointerEvent<HTMLDivElement>) => {
    /* Der Finger bekommt das Ziehen vom Browser geschenkt. Nur der Zeiger
       braucht die eigene Behandlung, sonst faengt das Band jede
       Wischgeste ab und das Blaettern auf dem Telefon haengt. */
    if (event.pointerType !== "mouse" || !spur.current) return;
    setZieht(true);
    start.current = { x: event.clientX, links: spur.current.scrollLeft };
    spur.current.setPointerCapture(event.pointerId);
  };

  const bewegt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!zieht || !spur.current) return;
    spur.current.scrollLeft = start.current.links - (event.clientX - start.current.x);
  };

  const ende = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!zieht || !spur.current) return;
    setZieht(false);
    if (spur.current.hasPointerCapture(event.pointerId)) {
      spur.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className={styles.band} aria-labelledby="werbetafeln-band">
      <div className={styles.bandHead}>
        <h2 id="werbetafeln-band" className={styles.srOnly}>
          {t.band.srTitle}
        </h2>
        <p className={`t-label ${styles.bandHinweis}`}>{t.band.hinweis}</p>
      </div>

      <div
        ref={spur}
        className={styles.bandTrack}
        data-drag={zieht ? "true" : undefined}
        tabIndex={0}
        role="region"
        aria-label={t.band.srTitle}
        onPointerDown={beginn}
        onPointerMove={bewegt}
        onPointerUp={ende}
        onPointerCancel={ende}
        style={zieht ? { userSelect: "none" } : undefined}
      >
        {t.band.items.map((item, index) => {
          const spot = item.spot ? spots.find((s) => s.id === item.spot) : undefined;
          return (
            <Rise key={`${item.ort}-${index}`} delay={Math.min(index, 3) * 0.06} className={styles.bandItem}>
              <div className={styles.bandMedia}>
                {item.bild ? (
                  <>
                    <Image
                      src={item.bild}
                      alt={item.alt ?? ""}
                      width={1400}
                      height={788}
                      sizes="(max-width: 1023px) 70vw, 26vw"
                      draggable={false}
                    />
                    <span className={styles.bandShade} aria-hidden="true" />
                  </>
                ) : null}

                {spot ? (
                  <span className={styles.bandSpotWrap}>
                    <span className={styles.bandSpotScreen}>
                      <Spot spot={spot} groesze="128px" />
                    </span>
                  </span>
                ) : null}
              </div>

              <p className={`t-body ${styles.bandText}`}>{item.text}</p>
              <p className={styles.bandOrt}>{item.ort}</p>
            </Rise>
          );
        })}
      </div>
    </section>
  );
}
