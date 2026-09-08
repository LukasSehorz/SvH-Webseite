"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Ruhe zwischen zwei Durchlaeufen auf einem Beruehrgeraet. */
const RUHE_MS = 2800;

/* ------------------------------------------------------------------ */
/*  Abspielsteuerung der gezeichneten Szenen                           */
/*                                                                     */
/*  Die Szenen dieser Welt sollen sich wiederholen lassen. Statt jede   */
/*  einzelne Bewegung zurueckzusetzen, zaehlt dieser Haken einen Lauf   */
/*  hoch. Die Szene haengt diesen Wert an ihren Schluessel, React baut  */
/*  den Teilbaum daraufhin neu auf und alle Bewegungen beginnen von     */
/*  vorn.                                                              */
/*                                                                     */
/*  Der Lauf null ist der Ruhezustand. Dort steht die Szene fertig und  */
/*  ohne Bewegung, damit auch bei reduzierter Bewegung und vor dem      */
/*  Eintritt ins Bild alles lesbar ist.                                */
/* ------------------------------------------------------------------ */

export function useScenePlay(
  host: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [run, setRun] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = host.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        setRun((value) => value + 1);
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [host, enabled]);

  const replay = useCallback(() => {
    if (!enabled) return;
    startedRef.current = true;
    setRun((value) => value + 1);
  }, [enabled]);

  /* AUF DEM TELEFON WIEDERHOLT SICH DIE SZENE VON SELBST.
     Am Schreibtisch startet ein Besucher sie neu, indem er mit dem Zeiger
     darueberfaehrt. Auf einem Geraet ohne Zeiger gibt es das nicht, und
     die Szene lief dort genau einmal und stand danach still. Der
     Auftraggeber hat das am 08.09.2026 beanstandet. Solange die Szene im
     Bild steht und der Tab sichtbar ist, laeuft sie deshalb weiter. */
  useEffect(() => {
    const node = host.current;
    if (!node || !enabled) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: none)").matches) return;

    let takt: ReturnType<typeof setInterval> | undefined;
    const anhalten = () => {
      if (takt !== undefined) {
        clearInterval(takt);
        takt = undefined;
      }
    };
    const anlaufen = () => {
      if (takt === undefined) {
        takt = setInterval(() => setRun((value) => value + 1), RUHE_MS + 2400);
      }
    };

    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting && !document.hidden) anlaufen();
        else anhalten();
      },
      { threshold: 0.3 },
    );
    beobachter.observe(node);

    const beiSicht = () => {
      if (document.hidden) anhalten();
    };
    document.addEventListener("visibilitychange", beiSicht);

    return () => {
      anhalten();
      beobachter.disconnect();
      document.removeEventListener("visibilitychange", beiSicht);
    };
  }, [host, enabled]);

  return { run, playing: enabled && run > 0, replay };
}
