"use client";

/* ------------------------------------------------------------------
   BAUVERTRAG

   THESE. Vier echte Seiten sagen mehr ueber unsere Arbeit als jeder
   Satz darueber. Also zeigen wir sie und verlinken sie.

   EIGENE WELT. Schwarzer Grund, Haarlinien, lavendelfarbenes Licht. Die
   Aufnahmen bleiben unveraendert und bringen ihre eigenen Farben mit;
   nur der Rahmen gehoert uns.

   GESCHICHTE. Vier Fenster fahren am Auge vorbei. Das mittlere kommt
   nach vorn, bekommt sein Licht und seinen Namen, die anderen treten in
   die Tiefe zurueck. Ein Klick oeffnet die laufende Seite.

   ERSTER BILDSCHIRM. Ueberschrift, ein Satz, darunter das erste Fenster
   schon mittig und hell.

   FORM. Eine gepinnte Buehne ueber die ganze Breite. Kein Raster, keine
   Karten. Adresse, Name und Branche in einem Wort.
   ------------------------------------------------------------------ */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { showcase } from "../../copy";
import styles from "../marketing/marketing.module.css";
import { SectionLabel } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  S5 · Referenzen                                                    */
/*                                                                     */
/*  Gepinnte Buehne, durch die vier Browserfenster waagerecht fahren.   */
/*  Der Lauf haengt am Scrollweg und gilt deshalb in beide Richtungen.  */
/*  Unter 900 Bildpunkten und bei reduzierter Bewegung wird daraus eine */
/*  ruhige Reihe mit Einrastpunkten und Scrollbalken.                   */
/*                                                                     */
/*  DIE VIER PROJEKTE SIND ECHT UND FREIGEGEBEN. Gezeigt wird der       */
/*  Kopfbereich der laufenden Seite, aufgenommen bei 1440 Bildpunkten   */
/*  in doppelter Dichte. Die Aufnahme bleibt unveraendert und wird      */
/*  nicht eingefaerbt; nur die Fenster neben der Mitte treten ueber     */
/*  Groesze und Deckkraft zurueck, damit erkennbar bleibt, welches      */
/*  gerade dran ist.                                                    */
/*                                                                     */
/*  Der Rahmen ist hier eigens gebaut und nicht der gemeinsame          */
/*  BrowserFrame. Er traegt die ECHTE ADRESSE in seiner Kopfleiste,     */
/*  und genau das macht aus einer Abbildung einen Beleg. Der            */
/*  gemeinsame Rahmen bleibt unberuehrt, weil die stillen Visuals der   */
/*  Unterseiten an ihm haengen.                                         */
/* ------------------------------------------------------------------ */

export default function Showcase({
  label,
}: Readonly<{
  /** Abweichende Sektionsbeschriftung. Die Landing nutzt die laufende
      Nummer aus copy, Unterseiten ohne Nummernfolge geben eigene Texte. */
  label?: string;
}> = {}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLDivElement>(null);
  const tail = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sectionEl = section.current;
    const stageEl = stage.current;
    const viewEl = view.current;
    const trackEl = track.current;
    const leadEl = lead.current;
    const tailEl = tail.current;
    if (!sectionEl || !stageEl || !viewEl || !trackEl || !leadEl || !tailEl) return;

    const list = () => items.current.filter(Boolean) as HTMLElement[];
    const gapOf = () => {
      const value = parseFloat(getComputedStyle(trackEl).columnGap);
      return Number.isFinite(value) ? value : 0;
    };

    /** Setzt Naehe zur Mitte, Drehung und Bildversatz je Rahmen. */
    const paint = (shift: number, progress: number) => {
      const centre = viewEl.clientWidth / 2;
      const gap = gapOf();
      for (const item of list()) {
        const middle = item.offsetLeft + item.offsetWidth / 2 + shift;
        const away = (middle - centre) / (item.offsetWidth + gap);
        const near = Math.max(0, 1 - Math.abs(away));
        const drift = Math.max(-1.3, Math.min(1.3, away)) / 1.3;
        item.style.setProperty("--t", Math.pow(near, 1.35).toFixed(3));
        // Der Glow zieht deutlich schneller an, dadurch bleibt immer
        // erkennbar, welcher Rahmen gerade in der Mitte steht. Der
        // Exponent haelt den Vorsprung bei etwa zwei zu eins und laesst
        // den Schein zwischen zwei Rahmen nicht ganz erloeschen.
        item.style.setProperty("--g", Math.pow(near, 2.4).toFixed(3));
        // Der Abstand MIT Vorzeichen. Er dreht den Rahmen um die
        // Hochachse, und zwar zur Mitte hin. Erst dadurch liest sich die
        // Reihe als Tiefe und nicht als Bilderleiste.
        item.style.setProperty("--a", drift.toFixed(3));
        item.style.setProperty("--py", (drift * 18).toFixed(1));
      }
      stageEl.style.setProperty("--p", progress.toFixed(4));
    };

    /** Vorlauf und Nachlauf so setzen, dass Rahmen mittig stehen koennen. */
    const pad = () => {
      const first = list()[0];
      if (!first) return 0;
      const value = Math.max(
        0,
        (viewEl.clientWidth - first.offsetWidth) / 2 - gapOf(),
      );
      leadEl.style.width = `${value}px`;
      tailEl.style.width = `${value}px`;
      return value;
    };

    const media = gsap.matchMedia();

    // Gepinnte Buehne.
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const setX = gsap.quickSetter(trackEl, "x", "px");
      let span = 0;

      const measure = () => {
        pad();
        const all = list();
        const last = all[all.length - 1];
        span = last
          ? Math.max(
              0,
              last.offsetLeft + last.offsetWidth / 2 - viewEl.clientWidth / 2,
            )
          : 0;
      };

      const render = (progress: number) => {
        const shift = -span * progress;
        setX(shift);
        paint(shift, progress);
      };

      const trigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: "bottom bottom",
        pin: stageEl,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          render(self.progress);
        },
        onUpdate: (self) => render(self.progress),
      });

      measure();
      render(0);

      return () => {
        trigger.kill();
        gsap.set(trackEl, { clearProps: "transform" });
        leadEl.style.width = "";
        tailEl.style.width = "";
      };
    });

    // Ruhige Reihe mit Scrollbalken.
    media.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
      const update = () => {
        const span = viewEl.scrollWidth - viewEl.clientWidth;
        paint(-viewEl.scrollLeft, span > 0 ? viewEl.scrollLeft / span : 0);
      };

      const measure = () => {
        pad();
        update();
      };

      measure();
      viewEl.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", measure);

      return () => {
        viewEl.removeEventListener("scroll", update);
        window.removeEventListener("resize", measure);
        leadEl.style.width = "";
        tailEl.style.width = "";
      };
    });

    return () => media.revert();
  }, []);

  return (
    <section className={styles.showcase} id="referenzen" ref={section}>
      <div className={styles.scStage} ref={stage}>
        <div className="shell">
          <SectionLabel>{label ?? showcase.label}</SectionLabel>
          <div className={styles.scHeadRow}>
            <h2 className={`t-h1 ${styles.scTitle}`}>{showcase.title}</h2>
            <p className={`t-body-lg ${styles.scIntro}`}>{showcase.intro}</p>
          </div>
        </div>

        <div className={styles.scViewport} ref={view}>
          <div className={styles.scTrack} ref={track}>
            <div className={styles.scSpacer} ref={lead} aria-hidden="true" />

            {showcase.projects.map((project, index) => (
              <article
                key={project.image}
                className={styles.scItem}
                ref={(node) => {
                  items.current[index] = node;
                }}
              >
                {/* Das ganze Fenster ist der Link. Ein Besucher, der auf
                    eine Referenz zeigt, will sie sehen und nicht erst
                    eine Zeile darunter suchen. */}
                <a
                  className={styles.scLink}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.scFrame}>
                    <div className={styles.scBar} aria-hidden="true">
                      <span className={styles.scDot} />
                      <span className={styles.scDot} />
                      <span className={styles.scDot} />
                      <span className={styles.scAddr}>
                        <svg viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3.4 5.4V4.1a2.6 2.6 0 0 1 5.2 0v1.3M2.9 5.4h6.2v4.2H2.9z"
                            stroke="currentColor"
                            strokeWidth={1}
                            strokeLinejoin="round"
                          />
                        </svg>
                        {project.host}
                      </span>
                      <span className={styles.scOeffnen}>
                        <svg viewBox="0 0 14 14" fill="none">
                          <path
                            d="M5 9 9.4 4.6M5.6 4.4h4.2v4.2"
                            stroke="currentColor"
                            strokeWidth={1.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>

                    <div className={styles.scShot}>
                      <div className={styles.scShotInner}>
                        <Image
                          src={project.image}
                          alt={`Startseite von ${project.name}`}
                          fill
                          sizes="(max-width: 899px) 78vw, 60vw"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.scCaption}>
                    <span className={`t-label ${styles.scName}`}>
                      {project.name}
                    </span>
                    <span className={styles.scKind}>{project.kind}</span>
                  </div>
                </a>
              </article>
            ))}

            <div className={styles.scSpacer} ref={tail} aria-hidden="true" />
          </div>
        </div>

        <div className="shell">
          <div className={styles.scRail}>
            <span className={styles.scRailFill} />
          </div>
          <p className={`t-label ${styles.scHint}`}>{showcase.hint}</p>
        </div>
      </div>
    </section>
  );
}
