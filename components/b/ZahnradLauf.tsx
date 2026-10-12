"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Die Zahnräder drehen sich nur, solange sie im Bild sind (data-lauf="an").
   Außerhalb pausieren sie an der Stelle, an der sie stehen. Bei „Bewegung reduzieren“
   bleibt alles still (zusätzlich per CSS abgesichert). */
export default function ZahnradLauf({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      el.dataset.lauf = e.isIntersecting ? "an" : "aus";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="zr-lauf">
      {children}
    </div>
  );
}
