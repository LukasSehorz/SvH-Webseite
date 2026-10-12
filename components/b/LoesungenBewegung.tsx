"use client";

import { useEffect } from "react";

/* Startet die kleinen Endlos-Animationen der Lösungs-Karten erst, wenn eine Karte im Bild ist,
   und hält sie an, sobald sie wieder herausscrollt. Ohne JavaScript oder bei „Bewegung reduzieren“
   bleibt der fertige Endzustand stehen (er steht schon so im HTML und CSS). */
export default function LoesungenBewegung() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bilder = document.querySelectorAll<HTMLElement>("#loesungen .lo-bild");
    const io = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.add("lo-an");
            el.classList.remove("lo-pause");
          } else if (el.classList.contains("lo-an")) {
            el.classList.add("lo-pause");
          }
        }
      },
      { threshold: 0.2 },
    );
    bilder.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);
  return null;
}
