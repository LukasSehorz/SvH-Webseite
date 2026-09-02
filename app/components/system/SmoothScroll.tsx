"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sanftes Scrollen mit Lenis, gekoppelt an GSAP ScrollTrigger.
 * Bei prefers-reduced-motion bleibt das native Scrollen unangetastet.
 */
export default function SmoothScroll({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      ScrollTrigger.refresh();
      return;
    }

    // Die Daempfung lag bei 0,1 und der Radfaktor bei 1. Zusammen ergab
    // das ein Scrollen, das sich zaeh anfuehlte: eine Radrastung trug nur
    // die Standardstrecke, und bis die Bewegung zur Ruhe kam, vergingen
    // rund 370 Millisekunden, weil bei 0,1 erst nach 22 Bildern neunzig
    // Prozent der Strecke zurueckgelegt sind.
    //
    // Bei 0,14 sind es 15 Bilder, also rund 250 Millisekunden. Das bleibt
    // weich, klebt aber nicht mehr nach. Der Radfaktor traegt ein Viertel
    // weiter, damit man mit derselben Geste sichtbar tiefer kommt.
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.25,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
