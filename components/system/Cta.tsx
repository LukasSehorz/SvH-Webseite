"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { Arrow } from "./Icons";

/**
 * Der eine Knopf-Stil der Seite. Primär: Verlaufs-Pille mit Glow,
 * magnetisch zum Zeiger, Pfeil gleitet. Sekundär: Haarlinien-Pille.
 */
export default function Cta({
  href,
  children,
  variant = "primary",
  size,
  className = "",
  onClick,
  arrow = true,
  inline = true,
}: Readonly<{
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "sm";
  className?: string;
  onClick?: () => void;
  arrow?: boolean;
  /** Knopf im Seiteninhalt (nicht Leiste/feste CTA): die feste CTA-Leiste weicht ihm aus */
  inline?: boolean;
}>) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    el.style.setProperty("--mx", `${(x * 6).toFixed(2)}px`);
    el.style.setProperty("--my", `${(y * 4).toFixed(2)}px`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--mx", "0px");
    ref.current?.style.setProperty("--my", "0px");
  };

  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  const props = {
    className: cls,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    onClick,
    "data-cta-inline": inline && variant === "primary" ? "" : undefined,
  };
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <span className="btn-arrow" aria-hidden="true">
          <Arrow />
          <Arrow />
        </span>
      ) : null}
    </>
  );
  // Reine Anker (#termin) als normales <a>: kein unnötiger Prefetch der eigenen Seite
  if (href.startsWith("#"))
    return (
      <a ref={ref} href={href} {...props}>
        {inner}
      </a>
    );
  return (
    <Link ref={ref} href={href} prefetch={href.includes("#") ? false : undefined} {...props}>
      {inner}
    </Link>
  );
}
