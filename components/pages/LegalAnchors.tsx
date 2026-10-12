"use client";

import { useEffect } from "react";

/**
 * Sprünge aus dem Inhaltsverzeichnis der Rechtsseiten. Der Abstand zur Oberkante
 * kommt aus dem CSS (`scroll-margin-top` der Abschnitte), damit die Überschrift immer
 * frei unter der Leiste steht. Das aufklappbare Verzeichnis (mobil) klappt vor dem
 * Messen zu, sonst verschöbe sich das Ziel. Ohne JavaScript greift der normale Anker.
 */
export default function LegalAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(".lg-toc a[href^='#'], .lg-toc-m a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const details = a.closest("details");
      if (details) details.open = false;

      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });

      history.replaceState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      // Fokus für Tastatur und Screenreader auf die Überschrift des Abschnitts
      const heading = target.querySelector<HTMLElement>("h2") ?? target;
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    };
    // Einfangphase: läuft vor anderen Klick-Handlern
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
