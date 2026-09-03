"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { kiLayers } from "../../copy";
import { CircleLink, SectionLabel } from "../system/ui";
import IsoStage, { LAYOUT } from "../ki-landing/IsoStage";
import FlatStack from "../ki-landing/FlatStack";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Unter 900px läuft die Sektion ohne Klebe-Bühne als flacher Stapel. */
function useCompact(): boolean {
  const [compact, setCompact] = useState(false);

  useIsoLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");
    setCompact(media.matches);
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return compact;
}

/**
 * S2 · KI als Ebenen-Aufbau nach dem Referenz-Muster.
 *
 * Rechts klebt die Bühne über die ganze Sektionshöhe. Links wandern DREI
 * Karten vorbei. Die Karte in Bildmitte ist dunkel und massiv, die anderen
 * stehen als gestrichelte Kontur. Der Scroll-Fortschritt der Sektion treibt
 * den Aufbau der Bühne.
 *   Karte 1  Ihre zwei Ebenen stehen weit auseinander.
 *   Karte 2  Agenten und Corporate LLM gleiten seitlich dazwischen, das
 *            Logo-Feld erscheint.
 *   Karte 3  Die Integrations-Reihe poppt, der Schimmer läuft, alles steht.
 */
export default function KiLayers() {
  const compact = useCompact();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);

  // Aktive Karte über die Lage zur Bildmitte.
  useEffect(() => {
    if (compact) return;
    const railEl = rail.current;
    if (!railEl) return;
    const cards = Array.from(
      railEl.querySelectorAll<HTMLElement>("[data-card]"),
    );
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.dataset.active = entry.isIntersecting ? "true" : "false";
        }
      },
      // Ein schmales Band um die Bildmitte entscheidet, wer aktiv ist.
      { rootMargin: "-38% 0px -38% 0px" },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [compact]);

  useEffect(() => {
    if (compact) return;

    gsap.registerPlugin(ScrollTrigger);

    const sectionEl = section.current;
    const stageEl = stage.current;
    const footEl = foot.current;
    if (!sectionEl || !stageEl || !footEl) return;

    const media = gsap.matchMedia();

    media.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        const q = gsap.utils.selector(stageEl);
        const agents = q('[data-plate="agents"]');
        const llm = q('[data-plate="llm"]');
        // Die Beschriftungen der beiden einfahrenden Platten laufen eigene
        // Wege, siehe unten bei Schritt 3 und 4.
        const agentsText = q('[data-plate="agents"] .kl-text');
        const llmText = q('[data-plate="llm"] .kl-text');
        const systems = q('[data-plate="systems"]');
        const tiles = q("[data-tiles]");
        const tile = q("[data-tile]");
        const shine = q("[data-shine]");
        const badge = stageEl.querySelector<HTMLElement>("[data-badge]");
        const iso = stageEl.querySelector<HTMLElement>(".kl-stage");

        if (badge) badge.dataset.hidden = "true";

        // Das Startbild steht in den fromTo-Anfangswerten der Zeitleiste, NICHT
        // in einem gsap.set. ScrollTrigger nimmt beim Neuvermessen alle
        // Kontext-Stile zurück; ein einmaliges set wäre danach weg und die
        // Bühne stünde schon aufgebaut da. fromTo mit immediateRender setzt
        // den Anfang bei jedem Refresh neu.
        const START = { immediateRender: true } as const;

        /* Der Anfang steht zusaetzlich als fester Satz, bevor die
           Zeitleiste entsteht. Die eingezogenen Ebenen, die Kachelreihe und
           das Logo-Feld sind damit ab dem ersten Skriptlauf unsichtbar,
           auch wenn ScrollTrigger die Leiste erst nach dem Vermessen
           anlegt. Das Blatt haelt sie ausserdem ueber eine eigene Regel
           unsichtbar, siehe IsoStage. */
        gsap.set([agents, llm, tiles, tile], { autoAlpha: 0 });
        if (badge) gsap.set(badge, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: sectionEl,
            // Erst kleben, dann bauen. In der Referenz steht die Bühne schon
            // fest im Bild, wenn die erste Platte kippt — der Vorlauf ist
            // genau der obere Innenabstand der Sektion.
            start: () => {
              const lead =
                stageEl.getBoundingClientRect().top -
                sectionEl.getBoundingClientRect().top;
              return `top top-=${Math.max(0, Math.round(lead))}`;
            },
            end: "bottom bottom",
            /* Etwas traeger als zuvor, damit die Kacheln beim Einfahren
               ruhig nachziehen statt am Scrollrad zu kleben. */
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Die Punkt-Marke poppt über CSS-Übergänge, gestaffelt je Punkt.
              if (badge) {
                badge.dataset.hidden = self.progress > 0.36 ? "false" : "true";
              }
            },
          },
        });

        // Die Zeiten sind aus antimetal-stack-40 abgelesen. Anteile am
        // Gesamtweg der Referenz (s00 bis s30, 1875px):
        //   Kippen 0.00–0.07 · Ruhe bis 0.17 · Agenten 0.17–0.24
        //   Corporate LLM 0.24–0.31 · LANGE Ruhe bis 0.61
        //   Kacheln 0.61–0.77 · Aufrichten 0.80–0.96.

        // 1 · Team und Systeme stehen zu Beginn frontal und dicht beieinander
        //     — zwei flache Rechtecke mit schmalem Spalt. Beim ersten Scroll
        //     fahren sie auseinander, gleichzeitig kippt die Säule.
        tl.fromTo(
          iso,
          { "--iso": 0 },
          { ...START, "--iso": 1, duration: 1.1, ease: "power2.inOut" },
          0,
        );
        tl.fromTo(
          systems,
          { "--y": LAYOUT.slots.agents },
          {
            ...START,
            "--y": LAYOUT.systemsStart,
            duration: 1.5,
            ease: "power2.inOut",
          },
          0,
        );

        // 2 · Ruhe. Karte 1 erzählt die Idee, die offene Säule wartet.
        tl.to({}, { duration: 0.9 }, 1.5);

        // 3 · Die Agenten fahren aus der Tiefe nach vorn in ihren Slot.
        tl.fromTo(
          agents,
          {
            "--x": LAYOUT.slideX,
            "--y": LAYOUT.slots.agents + LAYOUT.slideY,
            autoAlpha: 0,
          },
          {
            ...START,
            "--x": 0,
            "--y": LAYOUT.slots.agents,
            autoAlpha: 1,
            duration: 1.4,
          },
          2.2,
        );
        tl.to(systems, { "--y": LAYOUT.systemsStart + 3, duration: 1.4 }, 2.2);

        // DIE BESCHRIFTUNG KOMMT ERST, WENN DIE PLATTE STEHT. Sie sitzt in
        // der Mitte ihrer Platte, und solange die Platte noch 14,6 Einheiten
        // hoeher steht als ihr Platz, liegt die Schrift ueber der Platte
        // darueber. Gemessen liefen so zwei Zeilen ineinander. Der Weg der
        // Platte dauert 1.4, deshalb beginnt die Schrift bei 3.6.
        tl.fromTo(
          agentsText,
          { autoAlpha: 0 },
          { ...START, autoAlpha: 1, duration: 0.45 },
          3.6,
        );

        // 4 · Corporate LLM folgt aus derselben Tiefe, das Logo-Feld erscheint.
        tl.fromTo(
          llm,
          {
            "--x": LAYOUT.slideX,
            "--y": LAYOUT.slots.llm + LAYOUT.slideY,
            autoAlpha: 0,
          },
          {
            ...START,
            "--x": 0,
            "--y": LAYOUT.slots.llm,
            autoAlpha: 1,
            duration: 1.4,
          },
          3.4,
        );
        tl.to(systems, { "--y": LAYOUT.systemsStart + 6, duration: 1.4 }, 3.4);
        tl.fromTo(
          llmText,
          { autoAlpha: 0 },
          { ...START, autoAlpha: 1, duration: 0.45 },
          4.8,
        );
        if (badge) {
          tl.fromTo(
            badge,
            { autoAlpha: 0 },
            { ...START, autoAlpha: 1, duration: 0.8 },
            4.2,
          );
        }

        // 5 · Lange Ruhe. Der Aufbau steht, die zweite Karte hat Zeit.
        tl.to({}, { duration: 2.6 }, 4.8);

        // 6 · Die Ebenen rücken nach oben zusammen, dann fahren die Kacheln
        //     auf derselben Tiefenachse gestaffelt nach vorn in die Lücke.
        tl.to(
          systems,
          { "--y": LAYOUT.slots.systems, duration: 1.3, ease: "power2.inOut" },
          7.4,
        );
        tl.fromTo(
          tiles,
          { autoAlpha: 0 },
          { ...START, autoAlpha: 1, duration: 0.25 },
          7.9,
        );
        /* Die Kacheln fahren langsamer ein als zuvor (0.9 und 0.2). Der
           Auftraggeber will sehen, wie sie nacheinander nach vorn kommen,
           und bei 0.9 waren sie bei zuegigem Scrollen schon da. */
        tl.fromTo(
          tile,
          { "--x": LAYOUT.slideX, "--y": LAYOUT.slideY, autoAlpha: 0 },
          {
            ...START,
            "--x": 0,
            "--y": 0,
            autoAlpha: 1,
            duration: 1.3,
            stagger: 0.26,
            ease: "power2.out",
          },
          8.0,
        );

        // 7 · Der Schimmer läuft einmal durch die verbundene Säule.
        tl.fromTo(
          shine,
          { autoAlpha: 0, y: -110 },
          { ...START, autoAlpha: 1, duration: 0.4 },
          9.9,
        );
        tl.to(shine, { y: 560, duration: 1.6, ease: "none" }, 9.9);
        tl.to(shine, { autoAlpha: 0, duration: 0.5 }, 11.0);

        tl.fromTo(
          footEl,
          { autoAlpha: 0, y: 14 },
          { ...START, autoAlpha: 1, y: 0, duration: 0.8 },
          10.0,
        );

        // 8 · Zum Schluss richtet sich alles wieder frontal auf. Platten,
        //     Kacheln und Logo-Feld stehen als sauberes flaches Schema da.
        tl.to(iso, { "--iso": 0, duration: 1.6, ease: "power2.inOut" }, 10.2);
        tl.to({}, { duration: 0.4 }, 12.3);

        return () => {
          tl.kill();
        };
      },
    );

    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(footEl, { autoAlpha: 1, y: 0 });
      const badge = stageEl.querySelector<HTMLElement>("[data-badge]");
      if (badge) badge.dataset.hidden = "false";
    });

    return () => media.revert();
  }, [compact]);

  const head = (
    <div className="kl-head">
      <SectionLabel>{kiLayers.label}</SectionLabel>
      <h2 className="t-h2 kl-title">{kiLayers.title}</h2>
      <p className="t-body-lg kl-intro">{kiLayers.intro}</p>
    </div>
  );

  const cards = kiLayers.cards.map((card, index) => (
    <article
      key={card.tag}
      className="kl-card"
      data-card
      data-active={index === 0 ? "true" : "false"}
    >
      <p className="t-label kl-card-tag">{card.tag}</p>
      <p className="t-h3 kl-card-title">{card.title}</p>
      <p className="t-body kl-card-body">{card.body}</p>
    </article>
  ));

  if (compact) {
    return (
      <section className="section kl-section kl-compact" id="ki">
        <div className="shell">
          {head}
          <div className="kl-cards-compact">{cards}</div>
          <FlatStack />
          <div className="kl-foot kl-foot-static">
            <p className="t-body kl-note">{kiLayers.integrations.note}</p>
            <CircleLink href={kiLayers.link.href} label={kiLayers.link.label} />
          </div>
        </div>
        <Styles />
      </section>
    );
  }

  return (
    <section className="kl-section" id="ki" ref={section}>
      <div className="shell">
        <div className="kl-grid">
          {/* Links. Kopf und die drei wandernden Karten. */}
          <div className="kl-rail" ref={rail}>
            {head}
            <div className="kl-card-slot kl-card-slot-first">{cards[0]}</div>
            <div className="kl-card-slot">{cards[1]}</div>
            <div className="kl-card-slot">{cards[2]}</div>
          </div>

          {/* Rechts. Die Bühne klebt über die ganze Sektionshöhe. */}
          <div className="kl-right">
            <div className="kl-sticky" ref={stage}>
              <IsoStage />
              <div className="kl-foot" ref={foot}>
                <p className="t-body kl-note">{kiLayers.integrations.note}</p>
                <CircleLink
                  href={kiLayers.link.href}
                  label={kiLayers.link.label}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Styles />
    </section>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .kl-section {
        position: relative;
        padding: 120px 0 40px;
      }

      .kl-section.kl-compact {
        padding: 0;
      }

      /* Die linke Spalte waechst mit der Breite, aber nur bis 32rem. Als
         Anteil gerechnet wurde sie auf breiten Schirmen 838 Bildpunkte weit,
         waehrend die Karte bei ihrem Zeichenmasz stehen blieb; dazwischen
         klaffte eine leere Bahn. Jetzt fuellt die Karte ihre Spalte, und der
         gewonnene Platz geht an die Buehne. */
      .kl-grid {
        display: grid;
        grid-template-columns: minmax(0, clamp(18rem, 34vw, 32rem)) minmax(0, 1fr);
        gap: 56px;
        align-items: start;
      }

      .kl-title {
        margin: 0;
        max-width: 15ch;
      }

      .kl-intro {
        margin: 20px 0 0;
        max-width: 44ch;
      }

      /* Jede Karte bekommt ihren eigenen hohen Abschnitt, so wandert sie an
         der klebenden Bühne vorbei. */
      .kl-card-slot {
        min-height: 96vh;
        display: flex;
        align-items: center;
      }

      .kl-card-slot-first {
        min-height: 62vh;
      }

      .kl-card {
        border-radius: 16px;
        padding: 26px 28px 28px;
        max-width: min(100%, 60ch);
        border: 1px dashed var(--line);
        background: transparent;
        transition:
          background 0.45s ease,
          border-color 0.45s ease;
      }

      /* Die Karte in Bildmitte ist die aktive. Sie wird dunkel und massiv,
         wie in der Referenz. */
      .kl-card[data-active="true"] {
        background: var(--bg-raise);
        border: 1px solid var(--line);
      }

      .kl-card-tag {
        margin: 0;
      }

      .kl-card-title {
        margin: 14px 0 0;
        color: var(--ink);
      }

      .kl-card-body {
        margin: 12px 0 0;
      }

      .kl-cards-compact {
        display: grid;
        gap: 16px;
        margin: 36px 0 44px;
      }

      .kl-cards-compact .kl-card {
        max-width: none;
        background: var(--bg-raise);
        border-style: solid;
      }

      .kl-right {
        position: relative;
        min-width: 0;
        align-self: stretch;
      }

      /* Die Bühne steht mittig im Bild, so wie in der Referenz. Der Fußzeile
         darunter wird kein Platz aus der Mitte genommen — sie hängt am
         unteren Rand der klebenden Fläche. */
      .kl-sticky {
        position: sticky;
        top: 0;
        min-height: 100vh;
        display: grid;
        align-content: center;
        padding: 0 0 20px;
      }

      @media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
        .kl-sticky > .kl-foot {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 26px;
          margin-top: 0;
        }
      }

      .kl-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 30px;
        padding-top: 22px;
        border-top: 1px solid var(--line-2);
      }

      .kl-foot-static {
        margin-top: 46px;
      }

      .kl-note {
        margin: 0;
        max-width: 52ch;
      }

      /* Ohne Bewegung zeigt die Sektion den Endzustand in normaler Höhe. */
      @media (prefers-reduced-motion: reduce) {
        .kl-card-slot,
        .kl-card-slot-first {
          min-height: 0;
          margin-top: 28px;
        }

        .kl-sticky {
          position: relative;
          min-height: 0;
        }

        .kl-card {
          background: var(--bg-raise);
          border-style: solid;
        }
      }

      @media (max-width: 1099px) {
        .kl-grid {
          gap: 32px;
        }
      }

      @media (max-width: 899px) {
        .kl-head {
          max-width: none;
        }

        .kl-foot-static {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `}</style>
  );
}
