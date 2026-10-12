"use client";

import { useEffect, useState } from "react";

type Item = { id: string; num?: string; title: string };

/**
 * Inhaltsverzeichnis der Rechtsseiten (breite Bildschirme, klebt links mit).
 * Markiert den Abschnitt, der gerade gelesen wird. Ohne JavaScript bleibt es
 * eine normale Linkliste.
 */
export default function LegalToc({ items, label }: Readonly<{ items: Item[]; label: string }>) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    let raf = 0;
    // Aktiv ist der letzte Abschnitt, dessen Kopf über 30 % der Fensterhöhe liegt.
    // Am Seitenende gewinnt der angesprungene Abschnitt (kurze letzte Abschnitte).
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const hash = window.location.hash.slice(1);
      const hashEl = atEnd && hash ? els.find((e) => e.id === hash) : undefined;
      if (hashEl && hashEl.getBoundingClientRect().top < window.innerHeight) cur = hash;
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav className="lg-toc" aria-label={label}>
      <p className="lg-toc-title">{label}</p>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} data-active={active === i.id ? "true" : undefined} aria-current={active === i.id ? "location" : undefined}>
              {i.num ? <span className="lg-toc-num">{i.num}</span> : null}
              {i.num ? " " : null}
              <span>{i.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
