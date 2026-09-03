"use client";

/* M6. Die Deckkraft haengt dauerhaft an der Scrollposition und nicht an
   einem einmaligen Eintritt. Wer zurueckscrollt, sieht dasselbe Bild
   wie beim Hinweg.

   Die Untergrenze steht bei 0,35, wie im Auftrag verlangt. Sie gilt fuer
   den Rand des Schirms und nicht fuer den Lesebereich, und genau dort
   ist diese Mechanik auf Schwarz gefaehrlich. Weiszer Text auf #050507
   erreicht bei einer Deckkraft von 0,729 noch 4,5 zu eins, darunter
   nicht mehr. Eine Reihe darf also nur dann unter diesen Wert fallen,
   wenn sie ohnehin halb abgeschnitten am Rand steht.

   Die Stuetzstellen sind daraus gerechnet. Eine Reihe von 476
   Bildpunkten auf einem Schirm von 900 laeuft ueber 1376 Bildpunkte
   Fortschritt und steht zwischen 0,346 und 0,654 vollstaendig im Bild.
   Die hoechste Zelle der Seite ist die Dreierreihe mit rund 530
   Bildpunkten, sie steht zwischen 0,371 und 0,629 vollstaendig im Bild.
   Das Plateau voller Deckkraft liegt deshalb bei 0,24 bis 0,76 und
   umschlieszt beide Bereiche mit Abstand. Der erste Versuch stand bei
   0,33 bis 0,67 und lieferte gemessen 0,725 als geringsten Wert einer
   vollstaendig sichtbaren Reihe, also 4,46 zu eins und damit knapp unter
   der Marke.

   Unterhalb von 1024 Bildpunkten ist die Kopplung ganz abgeschaltet.
   Dort stapelt sich die Seite, eine Reihe wird hoeher als der Schirm und
   steht nie vollstaendig im Bild. Die Kopplung koennte dann Text
   ausblenden, den jemand gerade liest. Den Rhythmus, den sie auf dem
   groszen Schirm traegt, uebernimmt dort der Abstand zwischen den
   Bloecken.

   DAZU KOMMT SEIT DEM 03.09.2026 DER AUFBAU BEIM EINTRITT. Der
   Auftraggeber wollte, dass die Vorteile animiert erscheinen. Beim ersten
   Eintritt ins Bild bekommt der Block das Merkmal data-in, und alles
   darin, was das Blatt unter data-build kennt (Balken, Bloecke, Felder,
   Listenpunkte), baut sich gestaffelt auf. Die Reihenfolge kommt aus dem
   Blatt selbst: jedes dieser Teile bekommt hier seine Nummer im Block als
   Variable --n, und die Verzoegerung im Blatt rechnet daraus. So braucht
   keine gezeichnete Oberflaeche eigene Zeitleisten.

   Bei prefers-reduced-motion steht alles sofort bei voller Deckkraft und
   fertig aufgebaut. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import s from "./webseiten.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Alles, was beim Eintritt nacheinander aufgebaut wird, in der Reihenfolge
   des Blattes. Die Klassen kommen aus dem Modul, damit die Liste mit dem
   Blatt zusammen bleibt. */
const BAUTEILE = [
  s.artBar,
  s.bar,
  s.block,
  s.formField,
  s.searchField,
  s.hit,
  s.answer,
  s.sourceChip,
  s.formSend,
  s.loadTrack,
  s.phone,
  s.artLabel,
  s.tapRing,
]
  .map((klasse) => `.${klasse}`)
  .concat([`.${s.rowList} > li`, `.${s.trioList} > li`])
  .join(", ");

export default function Fade({
  children,
  className,
  style,
  versatz = 0,
  boden = 0.35,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /* Verschiebt das Fenster leicht, damit vier Spalten nebeneinander
     nicht im Gleichschritt aufblenden. */
  versatz?: number;
  boden?: number;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useSafeReducedMotion();
  const [breit, setBreit] = useState(true);
  const drin = useInView(ref, { once: true, margin: "0px 0px -14% 0px" });
  const gebaut = drin || reduced;

  useIsoLayoutEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    setBreit(m.matches);
    const auf = (e: MediaQueryListEvent) => setBreit(e.matches);
    m.addEventListener("change", auf);
    return () => m.removeEventListener("change", auf);
  }, []);

  /* Die Nummern werden vor dem ersten Anstrich gesetzt, sonst liefe die
     erste Verzoegerung mit Null und alle Teile kaemen auf einmal. */
  useIsoLayoutEffect(() => {
    const wurzel = ref.current;
    if (!wurzel) return;
    const teile = wurzel.querySelectorAll<HTMLElement>(BAUTEILE);
    teile.forEach((teil, i) => teil.style.setProperty("--n", String(i)));
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const v = versatz;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12 + v, 0.24 + v, 0.76 + v, 0.88 + v, 1],
    [boden, 0.8, 1, 1, 0.8, boden],
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, opacity: reduced || !breit ? 1 : opacity }}
      data-build=""
      data-in={gebaut ? "" : undefined}
    >
      {children}
    </motion.div>
  );
}
