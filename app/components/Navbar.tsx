"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { nav, type NavItem } from "../content";
import { ArrowUpRight, EASE } from "./ui";

/* -------------------------------------------------------------------------- */

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.24, ease: EASE }}
      style={{ marginTop: 1 }}
    >
      <path
        d="M1 1.5 5 5.5 9 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/** Ein Punkt der Desktop-Navigation, wahlweise mit Aufklappmenü. */
function DesktopItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => cancelClose(), []);

  /* Escape schließt, Klick außerhalb schließt */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  if (!item.items) {
    return (
      <Link href={item.href} className="nav-item relative text-[16px]">
        <span className="nav-link-inner">{item.label}</span>
      </Link>
    );
  }

  const panelId = `nav-panel-${item.label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="nav-item flex items-center gap-1.5 text-[16px]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="nav-link-inner">{item.label}</span>
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="absolute left-1/2 top-full z-50"
            style={{ paddingTop: 18, transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <div
              style={{
                minWidth: 330,
                borderRadius: 20,
                padding: 10,
                background: "rgba(255,255,255,.94)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(0,26,35,.07)",
                boxShadow:
                  "0 2px 6px rgba(0,26,35,.05), 0 30px 60px -28px rgba(0,26,35,.32)",
              }}
            >
              {item.items.map((sub) => (
                <Link
                  key={sub.href + sub.label}
                  href={sub.href}
                  className="nav-sub block"
                  style={{ borderRadius: 13, padding: "12px 14px" }}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className="nav-sub-title block"
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}
                  >
                    {sub.label}
                  </span>
                  <span
                    className="block"
                    style={{ fontSize: 13.5, color: "var(--color-muted)", marginTop: 3 }}
                  >
                    {sub.hint}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Hintergrund der Leiste ab 24px Scroll einblenden */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Body-Scroll sperren + Escape schließt das Overlay */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeMobile = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: scrolled ? "rgba(255,255,255,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          boxShadow: scrolled
            ? "0 1px 0 rgba(0,26,35,.05), 0 12px 34px -22px rgba(0,26,35,.28)"
            : "none",
          transition:
            "background 240ms var(--ease-out-expo), box-shadow 240ms var(--ease-out-expo), backdrop-filter 240ms var(--ease-out-expo)",
        }}
      >
        <div className="shell flex items-center justify-between" style={{ height: 88 }}>
          <Link href="/" aria-label="SVH Consulting — zur Startseite" className="shrink-0">
            <Logo height={28} />
          </Link>

          {/* Desktop-Navigation */}
          <nav aria-label="Hauptnavigation" className="hidden lg:flex items-center gap-9">
            {nav.links.map((l) => (
              <DesktopItem key={l.label} item={l} />
            ))}
          </nav>

          <div className="hidden lg:block shrink-0">
            <Link href={nav.cta.href} className="btn btn-dark btn-sm">
              {nav.cta.label}
            </Link>
          </div>

          {/* Burger */}
          <button
            type="button"
            className="lg:hidden inline-flex flex-col items-end justify-center gap-[6px] p-2 -mr-2"
            data-menu-toggle
            data-menu-close={open ? "" : undefined}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? closeMobile() : setOpen(true))}
          >
            <motion.span
              animate={open ? { rotate: 45, y: 8, width: 26 } : { rotate: 0, y: 0, width: 26 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ height: 2, background: "var(--color-ink)", borderRadius: 2, display: "block" }}
            />
            <motion.span
              animate={open ? { opacity: 0, width: 18 } : { opacity: 1, width: 18 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{ height: 2, background: "var(--color-ink)", borderRadius: 2, display: "block" }}
            />
            <motion.span
              animate={open ? { rotate: -45, y: -8, width: 26 } : { rotate: 0, y: 0, width: 26 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ height: 2, background: "var(--color-ink)", borderRadius: 2, display: "block" }}
            />
          </button>
        </div>
      </header>

      {/* Vollbild-Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 lg:hidden overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              background:
                "linear-gradient(180deg,#FFFFFF 0%,var(--color-tint-3) 62%,var(--color-tint-2) 100%)",
            }}
          >
            <nav
              aria-label="Mobile Navigation"
              className="flex min-h-full flex-col justify-center gap-1 px-6 pb-12"
              style={{ paddingTop: 112 }}
            >
              {nav.links.map((l, i) => {
                const isOpen = expanded === l.label;
                return (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.06 + i * 0.06 }}
                    className="border-b"
                    style={{ borderColor: "rgba(0,26,35,.08)" }}
                  >
                    {l.items ? (
                      <>
                        <button
                          type="button"
                          className="t-h3 flex w-full items-center justify-between py-5 text-left"
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : l.label)}
                        >
                          {l.label}
                          <span style={{ color: "var(--color-brand)" }}>
                            <Chevron open={isOpen} />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: EASE }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="flex flex-col gap-1 pb-5">
                                {l.items.map((sub) => (
                                  <Link
                                    key={sub.href + sub.label}
                                    href={sub.href}
                                    onClick={closeMobile}
                                    className="flex items-center justify-between rounded-xl px-4 py-3"
                                    style={{ background: "rgba(255,255,255,.66)" }}
                                  >
                                    <span>
                                      <span
                                        className="block"
                                        style={{ fontSize: 16, fontWeight: 600 }}
                                      >
                                        {sub.label}
                                      </span>
                                      <span
                                        className="block"
                                        style={{ fontSize: 13.5, color: "var(--color-muted)" }}
                                      >
                                        {sub.hint}
                                      </span>
                                    </span>
                                    <span style={{ color: "var(--color-brand)" }}>
                                      <ArrowUpRight size={18} />
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={l.href}
                        onClick={closeMobile}
                        className="t-h3 flex items-center justify-between py-5"
                      >
                        {l.label}
                        <span style={{ color: "var(--color-brand)" }}>
                          <ArrowUpRight size={20} />
                        </span>
                      </Link>
                    )}
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.06 + nav.links.length * 0.06,
                }}
              >
                <Link href={nav.cta.href} onClick={closeMobile} className="btn btn-dark mt-8 w-full">
                  {nav.cta.label}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .nav-item {
          color: var(--color-ink);
        }
        .nav-link-inner {
          position: relative;
          display: inline-block;
          transition: color 0.24s var(--ease-out-expo);
        }
        .nav-link-inner::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 1.5px;
          background: var(--color-brand);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.28s var(--ease-out-expo);
        }
        .nav-item:hover .nav-link-inner,
        .nav-item[aria-expanded="true"] .nav-link-inner {
          color: var(--color-brand);
        }
        .nav-item:hover .nav-link-inner::after,
        .nav-item[aria-expanded="true"] .nav-link-inner::after {
          transform: scaleX(1);
        }
        .nav-sub {
          transition: background 0.2s var(--ease-out-expo);
        }
        .nav-sub:hover {
          background: var(--color-tint-3);
        }
        .nav-sub:hover .nav-sub-title {
          color: var(--color-brand);
        }
      `}</style>
    </>
  );
}
