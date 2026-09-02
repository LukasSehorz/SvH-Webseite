"use client";

/* M3 und M4. Das Browserfenster mit der echten Kundenseite darin.

   Der Rahmen steht still, das Bild darin wandert an der Scrollposition.
   Der Besucher sieht die fremde Seite von oben bis unten durchlaufen,
   ohne unsere Seite zu verlassen. Das ist das staerkste Argument dieser
   Unterseite und braucht keinen einzigen Satz Erklaerung.

   Drei Dinge sind an diesem Bauteil gemessen und nicht geschaetzt.

   Erstens die Datenmenge. Eine ganzseitige Aufnahme ist bis zu 18646
   Bildpunkte hoch. Sie liegt hier auf 1400 Bildpunkten Breite als WebP
   und wiegt damit zwischen 130 und 211 Kilobyte statt mehrerer Megabyte.
   Die Seite verspricht selbst schnelle Ladezeiten, ein Widerspruch an
   dieser Stelle waere der peinlichste denkbare.

   Zweitens der Zeitpunkt. Die ganze Seite wird erst geholt, wenn die
   Sektion in die Naehe kommt. Bis dahin steht im Fenster nichts.

   Drittens das Telefon. Dort laeuft nichts durch, dort steht nur der
   Startausschnitt. Ein Durchlauf ueber 8000 Bildpunkte kostet auf einem
   Telefon Leistung und bringt nichts, weil der Ausschnitt zu klein ist,
   um etwas zu erkennen. */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";
import { ExternalIcon, LockIcon } from "./Icons";
import s from "./webseiten.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function RefWindow({
  id,
  host,
  url,
  heroAlt,
  fullAlt,
  mist,
  mist2,
  note,
}: Readonly<{
  id: string;
  host: string;
  url: string;
  heroAlt: string;
  fullAlt: string;
  mist: string;
  mist2: string;
  note: string;
}>) {
  const wrap = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const bild = useRef<HTMLImageElement>(null);
  const reduced = useSafeReducedMotion();

  const [nah, setNah] = useState(false);
  const [schmal, setSchmal] = useState(false);
  const [strecke, setStrecke] = useState(0);

  /* Schmale Schirme bekommen den Startausschnitt und keinen Durchlauf. */
  useIsoLayoutEffect(() => {
    const m = window.matchMedia("(max-width: 860px)");
    setSchmal(m.matches);
    const auf = (e: MediaQueryListEvent) => setSchmal(e.matches);
    m.addEventListener("change", auf);
    return () => m.removeEventListener("change", auf);
  }, []);

  /* Erst laden, wenn die Sektion in die Naehe kommt. Der Rand von einer
     halben Bildhoehe reicht, damit das Bild da ist, bevor man es sieht. */
  useEffect(() => {
    const el = wrap.current;
    if (!el || nah) return;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) setNah(true);
      },
      { rootMargin: "60% 0px 60% 0px" },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [nah]);

  const messen = useCallback(() => {
    const v = view.current;
    const b = bild.current;
    if (!v || !b) return;
    setStrecke(Math.max(0, b.offsetHeight - v.clientHeight));
  }, []);

  useEffect(() => {
    if (!nah || schmal) return;
    messen();
    const ro = new ResizeObserver(messen);
    if (view.current) ro.observe(view.current);
    return () => ro.disconnect();
  }, [nah, schmal, messen]);

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start end", "end start"],
  });

  /* Der Durchlauf beginnt erst, wenn das Fenster ganz im Bild steht, und
     endet, bevor es wieder hinauslaeuft. Sonst rennt das Bild in den
     Randbereichen, in denen niemand hinsieht. */
  const y = useTransform(scrollYProgress, [0.14, 0.86], [0, -strecke]);

  const laeuft = nah && !schmal && !reduced;

  return (
    <div className={s.frameWrap} ref={wrap}>
      <span className={s.frameMist} style={{ ["--mist" as string]: mist, ["--mist-2" as string]: mist2 }} />

      <div className={s.frame}>
        <div className={s.frameBar}>
          <span className={s.frameDot} />
          <span className={s.frameDot} />
          <span className={s.frameDot} />
          {/* Die Adresse ist zugleich der Verweis. So sieht ein
              Betriebsinhaber sofort, dass er auf eine echte Webseite
              blickt. */}
          <a
            className={s.frameAddr}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LockIcon size={12} />
            {host}
            <ExternalIcon size={12} />
          </a>
        </div>

        <div className={s.frameView} ref={view}>
          {schmal || !nah ? (
            <img
              className={s.frameStill}
              src={`/referenzen/${id}-hero.webp`}
              alt={heroAlt}
              width={1200}
              height={750}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <motion.img
              ref={bild}
              className={s.frameRun}
              src={`/referenzen/${id}-voll.webp`}
              alt={fullAlt}
              loading="lazy"
              decoding="async"
              onLoad={messen}
              style={{ y: laeuft ? y : 0 }}
            />
          )}
          <span className={s.frameShade} />
        </div>
      </div>

      {laeuft && note ? <p className={s.frameNote}>{note}</p> : null}
    </div>
  );
}
