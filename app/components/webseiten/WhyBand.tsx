"use client";

/* M7. Das Band aus vier Spalten mit senkrechten Haarlinien.
   Bei der Referenz stehen dort Prozentwerte. Bei uns ist nur eine
   einzige Zahl belegt, die 35+ umgesetzten Projekte, und die steht in
   Feld 04. Die drei anderen Felder tragen kurze Aussagen. Sobald der
   Auftraggeber echte Kennzahlen liefert, wird daraus ohne Umbau ein
   Zahlenband, weil die obere Zeile schon die Groesze einer Zahl hat.

   Jede Spalte blendet nach M6 einzeln und leicht versetzt auf, und seit
   dem 03.09.2026 baut sie sich beim ersten Eintritt auch auf: Kopf, Satz
   und Nummer kommen nacheinander, ein leiser Lichthof geht in der Ecke
   auf, und eine Zahl im Kopf zaehlt von null hoch. Der Auftraggeber
   wollte die Vorteile schoener und animiert sehen. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import Fade from "./Fade";
import s from "./webseiten.module.css";

type Feld = { head: string; body: string };

/** Zaehlt eine fuehrende Zahl im Kopf von null hoch, der Rest bleibt. */
function Zahl({ text }: Readonly<{ text: string }>) {
  /* Einmal zerlegt und gemerkt. Stuende der Treffer als frisches Feld in
     jedem Anstrich, liefe der Effekt unten bei jedem Zaehlschritt neu an,
     und die Zahl bliebe bei zwei stehen; genau so war es beim ersten
     Bau. */
  const treffer = useMemo(() => /^(\d+)(.*)$/.exec(text.trim()), [text]);
  const ref = useRef<HTMLSpanElement>(null);
  const drin = useInView(ref, { once: true, margin: "0px 0px -14% 0px" });
  const reduced = useSafeReducedMotion();
  const ziel = treffer ? Number(treffer[1]) : 0;
  const [stand, setStand] = useState(0);

  useEffect(() => {
    if (!treffer) return;
    if (reduced) {
      setStand(ziel);
      return;
    }
    if (!drin) return;
    const start = performance.now();
    const dauer = 1100;
    let raf = 0;
    const schritt = (now: number) => {
      const q = Math.min(1, (now - start) / dauer);
      /* Ausklingen zum Ende hin, damit die letzten Ziffern ruhig stehen. */
      setStand(Math.round(ziel * (1 - Math.pow(1 - q, 3))));
      if (q < 1) raf = requestAnimationFrame(schritt);
    };
    raf = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(raf);
  }, [drin, reduced, ziel, treffer]);

  if (!treffer) return <span ref={ref}>{text}</span>;
  return (
    <span ref={ref}>
      {stand}
      {treffer[2]}
    </span>
  );
}

export default function WhyBand({ fields }: Readonly<{ fields: readonly Feld[] }>) {
  return (
    <div className={s.whyGrid}>
      {fields.map((feld, i) => (
        <Fade
          key={feld.head}
          className={s.whyCell}
          /* Der Versatz waechst nach rechts, damit die vier Spalten
             nacheinander und nicht im Gleichschritt aufgehen. */
          versatz={i * -0.018}
          style={{ "--k": i } as React.CSSProperties}
        >
          <span className={s.whyGlow} aria-hidden="true" />
          <p className={s.whyHead}>
            <Zahl text={feld.head} />
          </p>
          <p className={s.whyBody}>{feld.body}</p>
          <span className={s.whyNum}>{String(i + 1).padStart(2, "0")}</span>
        </Fade>
      ))}
    </div>
  );
}
