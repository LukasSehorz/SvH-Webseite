"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  return { run, playing: enabled && run > 0, replay };
}
