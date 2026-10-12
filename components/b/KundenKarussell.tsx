"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Google-Bewertungen als endloses Karussell in einer Reihe.
   Ohne Klone: Die fünf echten Karten werden über die CSS-Eigenschaft `order` im Kreis umsortiert,
   die Reihe verschiebt sich nur um den Bruchteil einer Karte. Nach der letzten kommt so nahtlos
   die erste, in beide Richtungen, beliebig oft. Kein Sprung, kein doppelter Inhalt für Screenreader.
   Bedienung: Pfeile, Wischen (Touch), Pfeiltasten, waagerechtes Wischen auf dem Trackpad.
   Kein automatisches Weiterlaufen. Ohne JavaScript: waagerecht scrollbar (noscript-Regel in Kunden.tsx). */

const DAUER = 520; // ms je Bewegung
const sanft = (t: number) => 1 - Math.pow(1 - t, 4); // weich auslaufen
const mod = (a: number, n: number) => ((a % n) + n) % n;

type Ziehen = { id: number; x0: number; y0: number; xa: number; aktiv: boolean; start: number; schritt: number; spur: { t: number; x: number }[] };

export default function KundenKarussell({
  karten,
  bereich,
  zurueck,
  vor,
  positionen,
}: {
  karten: ReactNode[];
  bereich: string;
  zurueck: string;
  vor: string;
  positionen: string[];
}) {
  const n = karten.length;
  const fensterRef = useRef<HTMLDivElement>(null);
  const spurRef = useRef<HTMLUListElement>(null);
  // x = Position in Karten (beliebig groß, auch negativ); ziel = wohin es gerade gleitet
  const z = useRef({ x: 0, ziel: 0, von: 0, t0: 0, raf: 0, basis: 0 });
  const ziehen = useRef<Ziehen | null>(null);
  const gezogen = useRef(false);
  const [aktiv, setAktiv] = useState(0);

  // stellt Position x dar: Reihenfolge der Karten ab floor(x), Verschiebung um den Rest
  function zeichne(x: number) {
    const spur = spurRef.current;
    if (!spur) return;
    const basis = Math.floor(x + 1e-6);
    const rest = Math.max(0, x - basis);
    if (basis !== z.current.basis) {
      z.current.basis = basis;
      Array.from(spur.children).forEach((el, i) => {
        (el as HTMLElement).style.order = String(mod(i - basis, n));
      });
    }
    spur.style.setProperty("--kd-f", rest < 1e-4 ? "0" : rest.toFixed(4));
  }

  function schritt() {
    const spur = spurRef.current;
    const karte = spur?.children[0] as HTMLElement | undefined;
    if (!spur || !karte) return 1;
    const gap = parseFloat(getComputedStyle(spur).columnGap) || 0;
    return karte.getBoundingClientRect().width + gap;
  }

  // nur während der Bewegung eine eigene Ebene (spart Speicher am Handy)
  function bewegt(an: boolean) {
    spurRef.current?.toggleAttribute("data-bewegt", an);
  }

  function bewegung(jetzt: number) {
    const s = z.current;
    const t = Math.min(1, (jetzt - s.t0) / DAUER);
    s.x = s.von + (s.ziel - s.von) * sanft(t);
    if (t >= 1) s.x = s.ziel;
    zeichne(s.x);
    s.raf = t < 1 ? requestAnimationFrame(bewegung) : 0;
    if (!s.raf) bewegt(false);
  }

  function gleite(ziel: number) {
    const s = z.current;
    s.ziel = ziel;
    setAktiv(mod(ziel, n));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.x = ziel;
      zeichne(ziel);
      bewegt(false);
      return;
    }
    bewegt(true);
    s.von = s.x;
    s.t0 = performance.now();
    if (!s.raf) s.raf = requestAnimationFrame(bewegung);
  }

  const gehe = (richtung: number) => gleite(Math.round(z.current.ziel) + richtung);

  // Wischen mit dem Finger (Maus bleibt beim Markieren und Klicken); senkrecht scrollt die Seite normal
  function runter(e: React.PointerEvent) {
    gezogen.current = false;
    if (e.pointerType === "mouse" || !e.isPrimary) return;
    ziehen.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, xa: e.clientX, aktiv: false, start: 0, schritt: 1, spur: [] };
  }
  function bewege(e: React.PointerEvent) {
    const d = ziehen.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.aktiv) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        ziehen.current = null;
        return;
      }
      if (Math.abs(dx) < 8) return;
      d.aktiv = true;
      d.xa = e.clientX; // ab hier folgt die Reihe dem Finger, ohne zu springen
      d.schritt = schritt();
      cancelAnimationFrame(z.current.raf);
      z.current.raf = 0;
      d.start = z.current.x;
      bewegt(true);
      fensterRef.current?.setPointerCapture(e.pointerId);
    }
    z.current.x = d.start - (e.clientX - d.xa) / d.schritt;
    zeichne(z.current.x);
    d.spur.push({ t: e.timeStamp, x: e.clientX });
    while (d.spur.length > 2 && e.timeStamp - d.spur[0].t > 100) d.spur.shift(); // Tempo der letzten 100 ms
  }
  function hoch(e: React.PointerEvent) {
    const d = ziehen.current;
    if (!d || e.pointerId !== d.id) return;
    ziehen.current = null;
    if (!d.aktiv) return;
    gezogen.current = true;
    const versatz = e.clientX - d.x0; // ganzer Weg seit dem Aufsetzen
    const a = d.spur[0];
    const b = d.spur[d.spur.length - 1];
    const tempo = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; // px/ms, negativ = nach links
    const schwelle = Math.min(d.schritt * 0.15, 48);
    const ref = Math.round(d.start);
    let ziel = Math.round(z.current.x);
    if (ziel === ref) {
      if (versatz < -schwelle || tempo < -0.3) ziel = ref + 1;
      else if (versatz > schwelle || tempo > 0.3) ziel = ref - 1;
    }
    gleite(ziel);
  }

  // Tastatur: Pfeiltasten im Karussell; Fokus auf einer verdeckten Karte holt sie ins Bild
  function taste(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") gehe(1);
    else if (e.key === "ArrowLeft") gehe(-1);
    else return;
    e.preventDefault();
  }
  function fokus(e: React.FocusEvent) {
    const fenster = fensterRef.current;
    const spur = spurRef.current;
    if (!fenster || !spur) return;
    fenster.scrollLeft = 0;
    const li = (e.target as HTMLElement).closest("li");
    const i = li ? Array.prototype.indexOf.call(spur.children, li) : -1;
    if (i < 0) return;
    const sichtbar = parseInt(getComputedStyle(fenster).getPropertyValue("--kd-sichtbar"), 10) || 1;
    const jetzt = Math.round(z.current.ziel);
    const platz = mod(i - jetzt, n); // 0 = ganz links
    if (platz < sichtbar) return;
    const vorwaerts = platz - sichtbar + 1;
    const rueckwaerts = n - platz;
    gleite(jetzt + (vorwaerts <= rueckwaerts ? vorwaerts : -rueckwaerts));
  }

  // Trackpad: ein waagerechtes Wischen = eine Karte (Nachschwingen wird abgewartet)
  useEffect(() => {
    const fenster = fensterRef.current;
    if (!fenster) return;
    let summe = 0;
    let gesperrt = false;
    let uhr = 0;
    const rad = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!gesperrt) {
        summe += e.deltaX;
        if (Math.abs(summe) > 30) {
          gleite(Math.round(z.current.ziel) + Math.sign(summe));
          gesperrt = true;
          summe = 0;
        }
      }
      window.clearTimeout(uhr);
      uhr = window.setTimeout(() => {
        gesperrt = false;
        summe = 0;
      }, 200);
    };
    fenster.addEventListener("wheel", rad, { passive: false });
    const s = z.current;
    return () => {
      fenster.removeEventListener("wheel", rad);
      window.clearTimeout(uhr);
      cancelAnimationFrame(s.raf);
    };
    // gleite nutzt nur Refs und den stabilen State-Setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="kd-karussell" role="region" aria-roledescription="carousel" aria-label={bereich} onKeyDown={taste} data-rv="">
      <div
        ref={fensterRef}
        className="kd-fenster"
        onPointerDown={runter}
        onPointerMove={bewege}
        onPointerUp={hoch}
        onPointerCancel={hoch}
        onClickCapture={(e) => {
          // nach dem Wischen kein versehentlicher Klick auf Logo oder „Weiterlesen“
          if (gezogen.current) {
            e.preventDefault();
            e.stopPropagation();
            gezogen.current = false;
          }
        }}
        onScroll={(e) => {
          // Fokus darf das Fenster nie verschieben (Sicherung für Browser ohne overflow: clip)
          if (e.currentTarget.scrollLeft) e.currentTarget.scrollLeft = 0;
        }}
      >
        <ul ref={spurRef} id="kd-spur" className="kd-karten" onFocus={fokus}>
          {karten.map((karte, i) => (
            <li key={i} className="kd-karte">
              {karte}
            </li>
          ))}
        </ul>
      </div>

      <div className="kd-steuerung">
        <button type="button" className="kd-pfeil" aria-label={zurueck} aria-controls="kd-spur" onClick={() => gehe(-1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="kd-punkte" aria-hidden="true">
          {karten.map((_, i) => (
            <span key={i} className="kd-punkt" data-an={i === aktiv ? "" : undefined} />
          ))}
        </div>
        <button type="button" className="kd-pfeil" aria-label={vor} aria-controls="kd-spur" onClick={() => gehe(1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {positionen[aktiv]}
        </p>
      </div>
    </div>
  );
}
