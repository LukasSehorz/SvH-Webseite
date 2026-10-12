"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cta, nav } from "@/app/copy";
import { navB, type NavLink } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Arrow, Caret } from "@/components/system/Icons";

/* Leiste: ursprünglich eine Kopie der Leiste aus der früheren Variante A. Menü in der Reihenfolge
   der Seite (Runde 2): Leistungen, Kunden, Lösungen, Über uns (Gründer, Aktuelles),
   Ablauf (KI-Masterplan, KI-Workshop). Problem und Lösung (Zahnräder) davor haben keinen Menüpunkt.
   Die Leiste bleibt immer sichtbar, auch am Handy (dort gibt es keine CTA-Leiste unten).
   Lukas' Regel „nie zwei gleiche Knöpfe gleichzeitig im Bild“: Steht ein Knopf aus dem Inhalt sichtbar
   im Fenster unter der Leiste, weicht der Leisten-Knopf (Runde 3: nur dann, sonst gab es Bildschirme
   ganz ohne Knopf).
   Auf der Startseite springen die Punkte zu den Abschnitten, auf Unterseiten zurück zur Startseite. */

const HOME = "/";

// Abschnitt → Menüpunkt (Unterpunkte markieren ihren Oberpunkt als aktiv)
const ABSCHNITT_ZU_PUNKT = new Map<string, string>();
navB.links.forEach((l) => {
  ABSCHNITT_ZU_PUNKT.set(l.id, l.id);
  l.sub?.forEach((s) => ABSCHNITT_ZU_PUNKT.set(s.href.slice(1), l.id));
});
// Dunkle Bühnen über die volle Breite: liegt eine davon unter der Leiste, ist der Auslauf Navy statt Weiß
const DUNKLE_BUEHNEN = "#leistungen, #masterplan, footer.fb";

// Abschnitte ohne Menüpunkt nach „Ablauf“ (Überzeuge dich selbst, Für wen, Fragen, Abschluss):
// beenden die Markierung. Vor „Leistungen“ (Hero, Problem, Lösung) ist ohnehin nichts markiert.
const OHNE_PUNKT = ["termin", "fuer-wen"];

/** Aufklapper (Desktop): öffnet per Klick, Tastatur oder Zeiger. */
function Drop({
  link,
  pre,
  open,
  active,
  onOpen,
  onClose,
}: {
  link: NavLink & { sub: NonNullable<NavLink["sub"]> };
  pre: string;
  open: boolean;
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const panelId = useId();
  const timer = useRef(0);
  const halten = () => window.clearTimeout(timer.current);
  return (
    <li
      className="nav-drop"
      data-drop={link.id}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        halten();
        onOpen();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        timer.current = window.setTimeout(onClose, 160);
      }}
    >
      <button
        type="button"
        className="nav-link"
        aria-expanded={open}
        aria-controls={panelId}
        data-active={active ? "true" : "false"}
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onOpen();
            requestAnimationFrame(() => document.getElementById(panelId)?.querySelector<HTMLElement>("a")?.focus());
          }
        }}
      >
        {link.label}
        <Caret className="nav-caret" />
      </button>
      <div
        id={panelId}
        className="nav-panel navb-panel"
        data-open={open ? "true" : "false"}
        inert={!open}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) onClose();
        }}
      >
        <ul className="navb-sub">
          {link.sub.map((s) => (
            <li key={s.href}>
              <a className="navb-sub-link" href={`${pre}${s.href}`} onClick={onClose}>
                <span className="navb-sub-titel">{s.label}</span>
                <span className="navb-sub-text">{s.text}</span>
              </a>
            </li>
          ))}
        </ul>
        {link.foot ? (
          <div className="nav-panel-foot">
            <a href={`${pre}${link.foot.href}`} onClick={onClose}>
              {link.foot.label} <Arrow size={16} />
            </a>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const onHome = pathname === HOME;
  // Unterseiten: Anker auf die Startseite („/#vorteile“), dort nur „#vorteile“
  const pre = onHome ? "" : "/";
  const [down, setDown] = useState(false); // scrollt gerade nach unten (ab 900 px: kompakte Pille)
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null); // offener Aufklapper (Desktop)
  const [sheetSub, setSheetSub] = useState<string | null>(null); // offene Gruppe im Vollbild-Menü
  const burger = useRef<HTMLButtonElement>(null);
  const kopf = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetId = useId();

  // Richtung merken: ab 900 px wird die Leiste beim Runterscrollen zur kompakten Pille
  useEffect(() => {
    // erst im ersten Bild lesen: scrollY beim Einhängen erzwingt mitten in der Hydration ein Layout
    let lastY = -1;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (lastY < 0) lastY = y;
        setScrolled(y > 24);
        if (Math.abs(y - lastY) > 6) {
          setDown(y > lastY && y > 160);
          lastY = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Aktiver Abschnitt nach dem Leseweg: markiert ist der Menüpunkt des Abschnitts, der zuletzt
  // die Linie bei 40 % der Fensterhöhe passiert hat (Unterpunkte markieren ihren Oberpunkt:
  // Aktuelles → Über uns, Workshop → Ablauf). Bis „Leistungen“ (Hero, Problem, Lösung) und ab
  // „Überzeuge dich selbst“ (danach Für wen, Fragen, Abschluss) ist nichts markiert.
  useEffect(() => {
    if (!onHome) return;
    const ids = [...Array.from(ABSCHNITT_ZU_PUNKT.keys()), ...OHNE_PUNKT];
    let raf = 0;
    const pruefe = () => {
      raf = 0;
      const linie = window.innerHeight * 0.4;
      let zuletzt: string | null = null;
      let oben = -Infinity;
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= linie && top > oben) {
          oben = top;
          zuletzt = id;
        }
      }
      setActive(zuletzt ? (ABSCHNITT_ZU_PUNKT.get(zuletzt) ?? null) : null);
    };
    const anstossen = () => {
      if (!raf) raf = requestAnimationFrame(pruefe);
    };
    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", anstossen);
    anstossen();
    return () => {
      window.removeEventListener("scroll", anstossen);
      window.removeEventListener("resize", anstossen);
      cancelAnimationFrame(raf);
    };
  }, [onHome]);

  // Ab 900 px Menüpunkte und kompakte Pille, darunter Vollbild-Menü und eigene Knopf-Regel
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Steht ein Knopf aus dem Inhalt sichtbar im Fenster, faltet sich der Leisten-Knopf weg (nie zwei
  // gleiche Knöpfe gleichzeitig). Gezählt wird überall genau das, was man sieht: das Fenster unterhalb
  // der Leiste (was hinter ihr liegt, sieht man nicht). Kein Vorlauf über den Rand hinaus mehr: der ließ
  // den Leisten-Knopf schon weichen, wenn der Sektionsknopf noch 100–150 px außerhalb stand.
  // „Sichtbar“ heißt: mindestens zur Hälfte im Fenster. Ein Anschnitt von ein paar Pixeln am Rand ist
  // kein Knopf (sonst stünde der Bildschirm praktisch ohne Knopf da).
  const [kante, setKante] = useState(72);
  useEffect(() => {
    const messen = () => setKante(Math.round(kopf.current?.querySelector(".nav-bar")?.getBoundingClientRect().bottom ?? 72));
    messen();
    window.addEventListener("resize", messen);
    return () => window.removeEventListener("resize", messen);
  }, []);
  const [ctaImBild, setCtaImBild] = useState(false);
  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.5));
        setCtaImBild(Array.from(seen.values()).some(Boolean));
      },
      { rootMargin: `-${kante}px 0px 0px 0px`, threshold: [0, 0.5] },
    );
    const scan = () =>
      document.querySelectorAll("main [data-cta-inline]").forEach((el) => {
        if (seen.has(el)) return;
        seen.set(el, false);
        io.observe(el);
      });
    // später hydrierte Sektionen (Schalter, Formular) nachfassen
    scan();
    const t1 = window.setTimeout(scan, 1500);
    const t2 = window.setTimeout(scan, 4000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      io.disconnect();
      setCtaImBild(false);
    };
  }, [pathname, kante]);

  // Aufklapper schließen: Escape, Klick daneben
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document.querySelector<HTMLElement>(`[data-drop="${drop}"] > button`)?.focus();
      setDrop(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(`[data-drop="${drop}"]`)) setDrop(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [drop]);

  // Vollbild-Menü: Scrollen sperren, Escape, Fokus
  const closeSheet = useCallback((returnFocus = true) => {
    setSheetOpen(false);
    if (returnFocus) requestAnimationFrame(() => burger.current?.focus());
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!sheetOpen) {
      html.removeAttribute("data-menu-open");
      return;
    }
    html.setAttribute("data-menu-open", "");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => sheetRef.current?.querySelector<HTMLElement>("a,button")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
      if (e.key === "Tab" && sheetRef.current) {
        // Fokus im Menü halten (Leiste mit Knopf gehört dazu)
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(".nav-bar a, .nav-bar button, .nav-sheet a, .nav-sheet button"),
        ).filter((n) => n.offsetParent !== null);
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen, closeSheet]);

  // Menü bei Seitenwechsel schließen (Vergleich im Render statt Effekt)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSheetOpen(false);
    setDrop(null);
  }

  // Wege der kompakten Pille aus den echten Breiten (nav.css): Die Leiste behält ihre volle Breite,
  // Marke und Knopf rücken per transform zur Mitte, die schwarze Fläche wird per clip-path schmaler.
  // So entsteht beim Scrollen kein Layout-Sprung (vorher max-width/padding/gap: CLS 0,04 bei 1440 px).
  useEffect(() => {
    const nav = kopf.current;
    const bar = nav?.querySelector<HTMLElement>(".nav-bar");
    const mark = nav?.querySelector<HTMLElement>(".nav-mark");
    const end = nav?.querySelector<HTMLElement>(".nav-end");
    if (!nav || !bar || !mark || !end) return;
    const messen = () => {
      const w = bar.offsetWidth; // Layout-Breite, unabhängig von transform
      if (!w) return;
      const rand = parseFloat(getComputedStyle(bar).paddingLeft) || 0;
      // kompakt: Marke links, Knopf rechts (wie bisher höchstens 604 px)
      const kompakt = Math.min(w, 604);
      // Knopf weicht: nur die Marke (und das Menü, solange es zu sehen ist), gleichmäßig eingefasst
      const b = burger.current;
      const menue = b && b.offsetParent ? b.offsetWidth + (parseFloat(getComputedStyle(end).columnGap) || 0) : 0;
      const nurMarke = Math.min(w, 2 * rand + mark.offsetWidth + menue);
      nav.style.setProperty("--nav-dx", `${((w - kompakt) / 2).toFixed(1)}px`);
      nav.style.setProperty("--nav-dx2", `${((w - nurMarke) / 2).toFixed(1)}px`);
    };
    messen();
    const ro = new ResizeObserver(messen);
    [bar, mark, end].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, []);

  // Dunkle Bühne unter der Leiste? Gemessen wird knapp unter ihrer Unterkante (dort endet der deckende
  // Auslauf). Nur ein Attribut wechselt, die CSS blendet die Ausläufe über (kein Layout).
  const [dunkel, setDunkel] = useState(false);
  useEffect(() => {
    let raf = 0;
    const pruefe = () => {
      raf = 0;
      const linie = (kopf.current?.querySelector(".nav-bar")?.getBoundingClientRect().bottom ?? 72) + 12;
      let d = false;
      document.querySelectorAll(DUNKLE_BUEHNEN).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= linie && r.bottom > linie) d = true;
      });
      setDunkel(d);
    };
    const anstossen = () => {
      if (!raf) raf = requestAnimationFrame(pruefe);
    };
    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", anstossen);
    anstossen();
    return () => {
      window.removeEventListener("scroll", anstossen);
      window.removeEventListener("resize", anstossen);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Die Leiste blendet nie aus (am Handy sonst viele Bildschirme ohne Knopf).
  // Ab 900 px schrumpft sie beim Runterscrollen zur kompakten Pille.
  const menuActive = sheetOpen || drop !== null;
  const compact = wide && down && !menuActive;
  // Leisten-Knopf eingeklappt: nur, solange ein Sektionsknopf sichtbar im Fenster steht
  const btnWeicht = ctaImBild && !sheetOpen;

  return (
    <>
      <header
        ref={kopf}
        className="nav"
        data-compact={compact ? "true" : "false"}
        data-scrolled={scrolled ? "true" : "false"}
        data-dunkel={dunkel ? "true" : "false"}
        data-at-form={btnWeicht ? "true" : "false"}
      >
        <nav className="nav-bar" aria-label="Hauptmenü">
          <Link href={HOME} className="nav-mark" aria-label={nav.home}>
            <Image className="wort" src="/logo/svh-wort-96.webp" alt="" width={169} height={22} loading="eager" />
            <Image className="mono" src="/logo/svh-bild-160.webp" alt="" width={18} height={30} loading="eager" unoptimized />
          </Link>

          <ul className="nav-links">
            {navB.links.map((l) =>
              l.sub ? (
                <Drop
                  key={l.id}
                  link={{ ...l, sub: l.sub }}
                  pre={pre}
                  open={drop === l.id}
                  active={active === l.id}
                  onOpen={() => setDrop(l.id)}
                  onClose={() => setDrop((d) => (d === l.id ? null : d))}
                />
              ) : (
                <li key={l.id}>
                  <Link className="nav-link" href={`${pre}${l.href}`} data-active={active === l.id ? "true" : "false"} aria-current={active === l.id ? "location" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="nav-end">
            <Cta href={`${pre}#termin`} size="sm" inline={false} onClick={() => closeSheet(false)}>
              {/* ab 900 px derselbe Wortlaut wie in den Sektionen, darunter die kurze Fassung */}
              <span className="nav-cta-lang">{cta.main}</span>
              <span className="nav-cta-kurz">{cta.nav}</span>
            </Cta>
            <button
              ref={burger}
              type="button"
              className="nav-burger"
              aria-expanded={sheetOpen}
              aria-controls={sheetId}
              aria-label={sheetOpen ? nav.menuClose : nav.menuOpen}
              onClick={() => setSheetOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div
        id={sheetId}
        ref={sheetRef}
        className="nav-sheet"
        data-open={sheetOpen ? "true" : "false"}
        data-lenis-prevent=""
        inert={!sheetOpen}
        aria-hidden={!sheetOpen}
      >
        <nav aria-label="Menü">
          <ul className="nav-sheet-list">
            {navB.links.map((l, i) => (
              <li key={l.id} style={{ "--i": i } as React.CSSProperties}>
                {l.sub ? (
                  <>
                    <button
                      type="button"
                      className="nav-sheet-link"
                      aria-expanded={sheetSub === l.id}
                      aria-controls={`${sheetId}-${l.id}`}
                      onClick={() => setSheetSub((s) => (s === l.id ? null : l.id))}
                    >
                      {l.label}
                      <Caret />
                    </button>
                    <div className="nav-sheet-sub" id={`${sheetId}-${l.id}`} data-open={sheetSub === l.id ? "true" : "false"} inert={sheetSub !== l.id}>
                      <div className="nav-sheet-sub-inner">
                        {l.sub.map((s) => (
                          <a key={s.href} className="navb-sheet-sub-link" href={`${pre}${s.href}`} onClick={() => closeSheet(false)}>
                            <span className="navb-sub-titel">{s.label}</span>
                            <span className="navb-sub-text">{s.text}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link className="nav-sheet-link" href={`${pre}${l.href}`} onClick={() => closeSheet(false)}>
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-sheet-cta">
          <Cta href={`${pre}#termin`} inline={false} onClick={() => closeSheet(false)}>
            {cta.main}
          </Cta>
        </div>
      </div>
    </>
  );
}
