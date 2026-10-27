"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/* Janniks Videos als Karussell in einer Reihe (Abschnitt Aktuelles).
   Anders als die Bewertungen (KundenKarussell.tsx) nicht endlos: Es hält am ersten und am letzten Video an,
   der Pfeil in diese Richtung wird dann grau. Die Reihe ist ein echter waagerechter Scrollbereich mit
   Einrasten (scroll-snap). Dadurch wischt der Finger am Handy nativ mit Schwung, das Trackpad scrollt
   waagerecht, und ohne JavaScript bleibt alles erreichbar (noscript-Regel in UeberUns.tsx).
   Die Pfeile und Pfeiltasten gleiten weich um eine Karte (eigene Kurve wie bei den Bewertungen); während
   des Gleitens ist das Einrasten kurz aus, sonst würde es jedes Bild auf die nächste Karte ziehen.
   Bei „Bewegung reduzieren“ springt die Reihe ohne Gleiten.
   Unten zeigt ein schmaler Balken, welcher Teil der Reihe gerade zu sehen ist (folgt auch dem Finger). */

const DAUER = 520; // ms je Bewegung, wie bei den Bewertungen
const sanft = (t: number) => 1 - Math.pow(1 - t, 4); // weich auslaufen

type Mass = { schritt: number; sichtbar: number; max: number };
export type KarussellVideo = { id: string; titel: string; datum: string; datumIso: string; href: string; bild: string };

export default function VideoKarussell({
  videos,
  ansehen,
  neuesFenster,
  bereich,
  zurueck,
  vor,
  positionen,
  fuss,
}: {
  videos: KarussellVideo[];
  ansehen: string;
  neuesFenster: string;
  bereich: string;
  zurueck: string;
  vor: string;
  /** positionen[sichtbar - 1][index]: Ansage für Screenreader, je nach Zahl sichtbarer Karten */
  positionen: string[][];
  /** steht in der Zeile unter der Reihe (Link zum Kanal) */
  fuss?: ReactNode;
}) {
  const n = videos.length;
  const spurId = useId();
  const reiheRef = useRef<HTMLUListElement>(null);
  const daumenRef = useRef<HTMLSpanElement>(null);
  const bewegung = useRef({ raf: 0, ziel: -1 });
  const [lage, setLage] = useState({ i: 0, sichtbar: 1, letzte: Math.max(0, n - 1), angesagt: false });

  function miss(): Mass | null {
    const reihe = reiheRef.current;
    const erste = reihe?.children[0] as HTMLElement | undefined;
    if (!reihe || !erste) return null;
    const cs = getComputedStyle(reihe);
    const gap = parseFloat(cs.columnGap) || 0;
    const schritt = erste.getBoundingClientRect().width + gap;
    const innen = reihe.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const sichtbar = Math.max(1, Math.min(n, Math.floor((innen + gap + 2) / schritt)));
    return { schritt, sichtbar, max: Math.max(0, reihe.scrollWidth - reihe.clientWidth) };
  }

  // Index der ersten sichtbaren Karte aus der Scrollposition (am Ende immer die letzte Position)
  function indexAus(x: number, m: Mass) {
    const letzte = Math.max(0, n - m.sichtbar);
    if (m.max < 2) return 0;
    if (x >= m.max - 2) return letzte;
    return Math.max(0, Math.min(letzte, Math.round(x / m.schritt)));
  }

  // Balken, Pfeile und Ansage auf den Stand der Scrollposition bringen
  function aktualisiere(ansagen: boolean) {
    const reihe = reiheRef.current;
    const m = miss();
    if (!reihe || !m) return;
    const x = reihe.scrollLeft;
    const anteil = Math.min(1, m.sichtbar / n);
    const p = m.max > 0 ? Math.min(1, Math.max(0, x / m.max)) : 0;
    const daumen = daumenRef.current;
    if (daumen) {
      daumen.style.width = `${(anteil * 100).toFixed(3)}%`;
      daumen.style.transform = `translateX(${(p * (1 / anteil - 1) * 100).toFixed(3)}%)`;
    }
    const i = bewegung.current.raf ? bewegung.current.ziel : indexAus(x, m);
    const letzte = Math.max(0, n - m.sichtbar);
    setLage((alt) => {
      // angesagt wird erst, wenn sich die Position wirklich ändert (nicht schon beim Laden)
      const angesagt = alt.angesagt || (ansagen && alt.i !== i);
      return alt.i === i && alt.sichtbar === m.sichtbar && alt.letzte === letzte && alt.angesagt === angesagt
        ? alt
        : { i, sichtbar: m.sichtbar, letzte, angesagt };
    });
  }

  function halteAn() {
    const reihe = reiheRef.current;
    const b = bewegung.current;
    if (!b.raf) return;
    cancelAnimationFrame(b.raf);
    b.raf = 0;
    b.ziel = -1;
    if (reihe) reihe.style.scrollSnapType = "";
  }

  function gleite(zielIndex: number, m: Mass) {
    const reihe = reiheRef.current;
    if (!reihe) return;
    const ziel = Math.min(zielIndex * m.schritt, m.max);
    halteAn();
    setLage((alt) => ({ ...alt, i: zielIndex, angesagt: true }));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reihe.scrollLeft = ziel;
      return;
    }
    const b = bewegung.current;
    const von = reihe.scrollLeft;
    const t0 = performance.now();
    b.ziel = zielIndex;
    reihe.style.scrollSnapType = "none";
    const bild = (jetzt: number) => {
      const t = Math.min(1, (jetzt - t0) / DAUER);
      reihe.scrollLeft = von + (ziel - von) * sanft(t);
      if (t < 1) {
        b.raf = requestAnimationFrame(bild);
        return;
      }
      b.raf = 0;
      b.ziel = -1;
      reihe.style.scrollSnapType = "";
      aktualisiere(true);
    };
    b.raf = requestAnimationFrame(bild);
  }

  function gehe(richtung: number) {
    const reihe = reiheRef.current;
    const m = miss();
    if (!reihe || !m) return;
    const letzte = Math.max(0, n - m.sichtbar);
    const basis = bewegung.current.raf ? bewegung.current.ziel : indexAus(reihe.scrollLeft, m);
    const ziel = Math.max(0, Math.min(letzte, basis + richtung));
    if (ziel !== basis) gleite(ziel, m);
  }

  // Pfeiltasten im Karussell (auf einer Karte oder einem Pfeil): eine Karte weiter oder zurück
  function taste(e: React.KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") gehe(1);
    else if (e.key === "ArrowLeft") gehe(-1);
    else return;
    e.preventDefault();
  }

  useEffect(() => {
    const reihe = reiheRef.current;
    if (!reihe) return;
    let rafScroll = 0;
    const beimScrollen = () => {
      if (rafScroll) return;
      rafScroll = requestAnimationFrame(() => {
        rafScroll = 0;
        aktualisiere(true);
      });
    };
    // Finger, Maus oder Trackpad übernehmen sofort (keine Bewegung kämpft gegen die Hand)
    const eingriff = () => halteAn();
    reihe.addEventListener("scroll", beimScrollen, { passive: true });
    reihe.addEventListener("pointerdown", eingriff, { passive: true });
    reihe.addEventListener("touchstart", eingriff, { passive: true });
    reihe.addEventListener("wheel", eingriff, { passive: true });
    const ro = new ResizeObserver(() => aktualisiere(false));
    ro.observe(reihe);
    // Beim Laden immer ganz links (Position 1): kein vom Browser wiederhergestellter Scrollstand
    reihe.scrollLeft = 0;
    aktualisiere(false);
    const b = bewegung.current;
    return () => {
      reihe.removeEventListener("scroll", beimScrollen);
      reihe.removeEventListener("pointerdown", eingriff);
      reihe.removeEventListener("touchstart", eingriff);
      reihe.removeEventListener("wheel", eingriff);
      ro.disconnect();
      cancelAnimationFrame(rafScroll);
      cancelAnimationFrame(b.raf);
    };
    // aktualisiere und halteAn nutzen nur Refs und den stabilen State-Setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amAnfang = lage.i <= 0;
  const amEnde = lage.i >= lage.letzte;
  const ansage = lage.angesagt ? (positionen[lage.sichtbar - 1] ?? positionen[0])?.[lage.i] ?? "" : "";

  return (
    <div className="vk" role="region" aria-roledescription="carousel" aria-label={bereich} onKeyDown={taste}>
      <ul ref={reiheRef} id={spurId} className="vk-reihe">
        {videos.map((v) => (
          <li key={v.id} className="vk-karte">
            <a className="vk-link" href={v.href} target="_blank" rel="noopener noreferrer">
              <span className="ak-bild vk-bild">
                {/* alt leer: Titel und Datum stehen im selben Link, das Bild würde nur doppelt vorgelesen */}
                <Image src={v.bild} alt="" fill sizes="(max-width: 699px) 86vw, (max-width: 1099px) 46vw, 390px" draggable={false} />
                <span className="ak-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
              </span>
              <span className="vk-body">
                <time className="vk-datum" dateTime={v.datumIso}>
                  {v.datum}
                </time>
                <span className="vk-titel">{v.titel}</span>
                <span className="vk-mehr" aria-hidden="true">
                  {ansehen}
                </span>
                <span className="sr-only">{neuesFenster}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="vk-fuss">
        <div className="vk-steuerung">
          <button
            type="button"
            className="vk-pfeil"
            aria-label={zurueck}
            aria-controls={spurId}
            aria-disabled={amAnfang}
            onClick={() => gehe(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="vk-balken" aria-hidden="true">
            <span ref={daumenRef} className="vk-daumen" />
          </span>
          <button type="button" className="vk-pfeil" aria-label={vor} aria-controls={spurId} aria-disabled={amEnde} onClick={() => gehe(1)}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {ansage}
          </p>
        </div>
        {fuss}
      </div>
    </div>
  );
}
