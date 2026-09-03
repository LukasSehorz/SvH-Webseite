"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { nav, type NavEntry } from "../../copy";
import { useSafeReducedMotion } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Der Zeiger muss eine kurze Absicht zeigen, bevor das Menue aufgeht,
   sonst flackert es beim blossen Ueberstreichen der Leiste. Beim
   Schliessen ist die Wartezeit laenger, weil der Zeiger den Weg vom
   Ausloeser zum Menue braucht. */
const ABSICHT_AUF_MS = 110;
const ABSICHT_ZU_MS = 220;

const PANEL_ID = "nav-marketing-menue";

/** Der Winkel am Ausloeser des Aufklappmenues. */
function Caret() {
  return (
    <svg
      className="nav-caret"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 2.6L4 5.6L7 2.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Das Kreuz am Umschalter der Gruppe im Overlay. */
function Plus() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M6.5 1V12M1 6.5H12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const reduced = useSafeReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const planen = useCallback(
    (naechster: boolean, verzoegerung: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setMenuOpen(naechster);
      }, verzoegerung);
    },
    [clearTimer],
  );

  const sofort = useCallback(
    (naechster: boolean) => {
      clearTimer();
      setMenuOpen(naechster);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Beim Seitenwechsel gehen Overlay und Aufklappmenue zu.
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Solange das Overlay offen ist, ruht der Seitenlauf.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const fokus = (index: number) => {
    const ziel = itemRefs.current[index];
    if (ziel) ziel.focus();
  };

  /* Der Ausloeser ist ein Verweis und bleibt es, denn der Eintrag
     Marketing fuehrt auf die Uebersicht. Pfeil nach unten und Leertaste
     oeffnen das Menue. Die Eingabetaste oeffnet es, solange es zu ist, und
     folgt dem Verweis, sobald es offen steht; so bleibt die Uebersicht
     ueber die Tastatur erreichbar, ohne dass eine zweite Schaltflaeche
     neben dem Eintrag noetig wird. */
  const onTriggerKey = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      sofort(true);
      window.requestAnimationFrame(() => fokus(0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!menuOpen) {
        sofort(true);
        window.requestAnimationFrame(() => fokus(itemRefs.current.length - 1));
      } else {
        sofort(false);
      }
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      sofort(!menuOpen);
      return;
    }
    if (event.key === "Enter" && !menuOpen) {
      event.preventDefault();
      sofort(true);
      return;
    }
    if (event.key === "Escape") {
      sofort(false);
    }
  };

  const onPanelKey = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    index: number,
    anzahl: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      fokus((index + 1) % anzahl);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      fokus((index - 1 + anzahl) % anzahl);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      fokus(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      fokus(anzahl - 1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      sofort(false);
      triggerRef.current?.focus();
    }
  };

  /* Die eine gestaltete Bewegung. Das Menue faehrt aus der bereits
     sichtbaren Leiste heraus nach unten und klingt exponentiell aus.
     Dieselbe Kurve traegt die Gruppe im Overlay. */
  const aufklappen = {
    initial: { opacity: 0, y: reduced ? 0 : -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -8 },
    transition: { duration: reduced ? 0.16 : 0.42, ease: EASE },
  };

  const renderCenter = (entry: NavEntry) => {
    if (!entry.items) {
      return (
        <li className="nav-item" key={entry.href}>
          <Link
            href={entry.href}
            className="nav-link"
            data-active={isActive(entry.href)}
          >
            {entry.label}
          </Link>
        </li>
      );
    }

    const items = entry.items;

    return (
      <li
        className="nav-item"
        key={entry.href}
        onMouseEnter={() => planen(true, ABSICHT_AUF_MS)}
        onMouseLeave={() => planen(false, ABSICHT_ZU_MS)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            sofort(false);
          }
        }}
      >
        <Link
          ref={triggerRef}
          href={entry.href}
          className="nav-link"
          data-active={isActive(entry.href)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-controls={PANEL_ID}
          onKeyDown={onTriggerKey}
        >
          {entry.label}
          <Caret />
        </Link>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id={PANEL_ID}
              className="nav-panel"
              {...aufklappen}
              onMouseEnter={clearTimer}
              onMouseLeave={() => planen(false, ABSICHT_ZU_MS)}
            >
              <ul className="nav-panel-list">
                {items.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-panel-link"
                      data-active={isActive(item.href)}
                      ref={(element) => {
                        itemRefs.current[index] = element;
                      }}
                      onKeyDown={(event) =>
                        onPanelKey(event, index, items.length)
                      }
                    >
                      <span className="nav-panel-label">{item.label}</span>
                      <span className="nav-panel-note">{item.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="nav-panel-foot">
                <Link href={entry.href} className="nav-panel-overview">
                  {nav.submenu.overview}
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <>
      <header
        className={scrolled ? "site-nav nav-scrolled" : "site-nav"}
        data-open={open}
      >
        <div className="nav-bar">
          {/* Links das Logo. Seit dem 03.09.2026 steht hier die Wortmarke
              des Auftraggebers statt der gesetzten Wortmarke. Das Monogramm
              stand kurz daneben und ist auf seinen Wunsch wieder entfallen;
              es traegt das Tab-Symbol und das Logo-Feld im Ebenen-Aufbau. */}
          <Link
            href="/"
            className="nav-mark"
            aria-label="SVH Consulting, zur Startseite"
          >
            <img
              className="nav-mark-wort"
              src="/logo/svh-wort-96.webp"
              alt=""
              width={737}
              height={96}
              decoding="async"
            />
          </Link>

          {/* Mitte · Bereiche */}
          <nav aria-label="Hauptmenü">
            <ul className="nav-center-list">{nav.links.map(renderCenter)}</ul>
          </nav>

          {/* Rechts · Kontakt, Abschluss und auf dem Telefon der Umschalter */}
          <div className="nav-end">
            <div className="nav-actions">
              <Link
                href={nav.contact.href}
                className="nav-link"
                data-active={isActive(nav.contact.href)}
              >
                {nav.contact.label}
              </Link>
              <Link href={nav.cta.href} className="btn-solid btn-sm">
                {nav.cta.label}
              </Link>
            </div>

            <button
              type="button"
              className="nav-burger"
              aria-expanded={open}
              aria-controls="nav-overlay"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="burger-bar" data-open={open} />
              <span className="burger-bar" data-open={open} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="nav-overlay"
            className="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
          >
            <nav aria-label="Alle Seiten">
              <ul className="nav-overlay-list">
                {[...nav.links, nav.contact].map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: reduced ? 0 : 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduced ? 0.2 : 0.55,
                      delay: reduced ? 0 : 0.06 + index * 0.07,
                      ease: EASE,
                    }}
                  >
                    <div className="nav-overlay-row">
                      <Link href={link.href} className="t-h2 nav-overlay-link">
                        {link.label}
                      </Link>

                      {link.items ? (
                        <button
                          type="button"
                          className="nav-overlay-toggle"
                          aria-expanded={groupOpen}
                          aria-controls="nav-overlay-marketing"
                          aria-label={
                            groupOpen ? nav.submenu.close : nav.submenu.open
                          }
                          onClick={() => setGroupOpen((value) => !value)}
                        >
                          <Plus />
                        </button>
                      ) : null}
                    </div>

                    <AnimatePresence initial={false}>
                      {link.items && groupOpen ? (
                        <motion.ul
                          id="nav-overlay-marketing"
                          className="nav-overlay-sub"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            duration: reduced ? 0.16 : 0.42,
                            ease: EASE,
                          }}
                        >
                          {link.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="nav-overlay-sub-link"
                              >
                                {item.label}
                                <span className="nav-overlay-sub-note">
                                  {item.note}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              className="nav-overlay-foot"
              initial={{ opacity: 0, y: reduced ? 0 : 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0.2 : 0.55,
                delay: reduced ? 0 : 0.34,
                ease: EASE,
              }}
            >
              <Link href={nav.cta.href} className="btn-solid">
                {nav.cta.label}
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
