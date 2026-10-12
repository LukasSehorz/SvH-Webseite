"use client";

import { useEffect } from "react";

/* Leichte Bewegung für Variante B: Elemente mit data-rv blenden beim ersten Erscheinen sanft ein,
   Zahlen mit data-zahl zählen einmal hoch. Ohne JavaScript oder bei „Bewegung reduzieren“
   steht alles sofort da (die Ausgangswerte stehen schon im HTML). */

function zaehle(el: HTMLElement) {
  const ziel = Number(el.dataset.zahl);
  if (!Number.isFinite(ziel)) return;
  const dauer = 1100;
  const start = performance.now();
  const schritt = (jetzt: number) => {
    const t = Math.min(1, (jetzt - start) / dauer);
    const sanft = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(ziel * sanft));
    if (t < 1) requestAnimationFrame(schritt);
  };
  el.textContent = "0";
  requestAnimationFrame(schritt);
}

export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.dataset.rv = "in";
          el.querySelectorAll<HTMLElement>("[data-zahl]").forEach(zaehle);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    // Was beim Laden schon im Bild ist, bleibt einfach stehen (kein Aufblitzen)
    const hoehe = window.innerHeight;
    document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
      if (el.getBoundingClientRect().top < hoehe * 0.92) el.dataset.rv = "in";
      else io.observe(el);
    });
    html.classList.add("rv-an");
    return () => {
      io.disconnect();
      html.classList.remove("rv-an");
    };
  }, []);
  return null;
}
