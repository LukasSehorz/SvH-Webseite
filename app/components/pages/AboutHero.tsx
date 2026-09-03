"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { aboutPage } from "../../copy";
import { GradientWord, useSafeReducedMotion } from "../system/ui";
import { StrandsFigure } from "./AboutStrands";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Erster Bildschirm                                     */
/*                                                                     */
/*  Links zwei kurze Zeilen, ein Satz, ein zweiter ruhiger Satz und    */
/*  ein Knopf. Rechts die Buehne mit den drei Straengen, die zu einem  */
/*  werden. Mehr steht hier nicht, weil die Seite in wenigen Sekunden  */
/*  verstanden werden soll.                                            */
/*                                                                     */
/*  Die Buehne stand bis zum 03.09.2026 in einer eigenen Sektion unter */
/*  dem Kopf. Der Pruefbericht hatte gemessen, dass der Kopf auf einem */
/*  breiten Schirm bei rund 35 Prozent endete und die Buehne darunter  */
/*  in den mittleren vierzig Prozent stand. Jetzt waechst sie mit der  */
/*  rechten Spalte und traegt den ersten Bildschirm mit.               */
/*                                                                     */
/*  Die Bewegung ist ein einmaliges Aufziehen beim Laden. Die beiden   */
/*  Zeilen kommen aus einer leichten Unschaerfe nach oben, danach      */
/*  folgen Satz und Knopf; die Buehne kommt ohne Unschaerfe, damit die */
/*  Zeichnung von Anfang an scharf steht. Bei reduzierter Bewegung     */
/*  steht alles sofort und unveraendert.                               */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AboutHero() {
  const reduced = useSafeReducedMotion();

  /*
   * Das Ziel der Bewegung ist immer dasselbe, nur die Dauer faellt bei
   * reduzierter Bewegung auf null. Die Einstellung ist erst nach dem
   * ersten Aufbau bekannt, und eine einmal begonnene Bewegung laeuft
   * weiter, auch wenn ihre Dauer danach auf null gesetzt wird. Deshalb
   * tragen Text und Buehne einen Schluessel, der mit der Einstellung
   * wechselt. Der Wechsel geschieht vor dem ersten Anstrich, die Teile
   * werden neu aufgebaut und stehen bei reduzierter Bewegung von Anfang
   * an scharf und an ihrem Platz. Gemessen an einem Browser mit
   * reduzierter Bewegung lief vorher das Aufziehen samt Unschaerfe noch
   * eine Sekunde lang.
   */
  const still = reduced ? "ruhig" : "bewegt";

  const rise = (delay: number) => ({
    initial: reduced
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : { opacity: 0, y: 26, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.95, delay, ease: EASE },
  });

  /* Dasselbe Aufziehen ohne Unschaerfe fuer die Buehne. Ein Weichzeichner
     ueber der ganzen Zeichnung kostete auf groszen Schirmen sichtbar
     Bilder, und die Bahnen sollen vom ersten Bild an scharf sein. */
  const lift = (delay: number) => ({
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { duration: 1.1, delay, ease: EASE },
  });

  return (
    <section className="subpage-head about-hero">
      <span className="hero-fog" aria-hidden="true" />

      <div className="shell about-hero-inner">
        <div className="about-hero-text" key={`text-${still}`}>
          <h1 className="t-display about-hero-title">
            <motion.span className="about-hero-line" {...rise(0.05)}>
              {aboutPage.hero.titleBefore}
            </motion.span>
            <motion.span className="about-hero-line" {...rise(0.16)}>
              <GradientWord>{aboutPage.hero.gradientWord}</GradientWord>{" "}
              {aboutPage.hero.titleAfter}
            </motion.span>
          </h1>

          <motion.p className="t-body-lg about-hero-lead" {...rise(0.3)}>
            {aboutPage.hero.lead}
          </motion.p>

          {/* Der Satz gehoerte zur frueheren Sektion mit der Buehne. Er
              erklaert, was die Buehne zeigt, und steht deshalb bei ihr. */}
          <motion.p className="t-body about-hero-more" {...rise(0.38)}>
            {aboutPage.strands.body}
          </motion.p>

          <motion.div className="about-hero-action" {...rise(0.46)}>
            <Link href={aboutPage.hero.cta.href} className="btn-solid">
              {aboutPage.hero.cta.label}
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="about-hero-figure"
          key={`buehne-${still}`}
          {...lift(0.24)}
        >
          <StrandsFigure className="about-hero-strands" />
        </motion.div>
      </div>

      <style jsx global>{`
        .about-hero {
          position: relative;
          overflow: hidden;
        }

        /* Ein einziger ruhiger Schleier, damit der erste Bildschirm nicht
           in flaches Schwarz kippt. Er liegt hinter der Ueberschrift. */
        .about-hero .hero-fog {
          position: absolute;
          left: 12%;
          top: -160px;
          width: min(900px, 96vw);
          height: 620px;
          border-radius: 9999px;
          background: radial-gradient(
            ellipse at 50% 50%,
            var(--acc-violet) 0%,
            var(--acc-blue) 46%,
            transparent 74%
          );
          opacity: 0.15;
          filter: blur(130px);
          pointer-events: none;
        }

        .about-hero .about-hero-inner {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          row-gap: clamp(44px, 7vw, 80px);
        }

        /* Die Hauptzeile steht in einer Spalte, die bei 1440 rund 560
           Bildpunkte breit ist. Mit der vollen Stufe von 7vw braeche dort
           die erste Zeile mitten im Satz, deshalb waechst sie hier
           langsamer und endet bei 96 statt 104. Auf dem Telefon gilt wie
           ueberall die Untergrenze von 44. */
        .about-hero .about-hero-title {
          max-width: 16ch;
          font-size: clamp(44px, 5.4vw, 96px);
        }

        .about-hero .about-hero-line {
          display: block;
        }

        .about-hero .about-hero-lead {
          max-width: var(--measure);
          margin-top: 34px;
        }

        .about-hero .about-hero-more {
          margin-top: 20px;
        }

        .about-hero .about-hero-action {
          display: flex;
          margin-top: 40px;
        }

        /* Unter 1024 Bildpunkten steht die Buehne unter dem Text in
           geringerer Hoehe. Die Buehne selbst richtet sich nach dem Kasten,
           den sie hier bekommt. */
        .about-hero .about-hero-strands {
          height: clamp(300px, 80vw, 440px);
        }

        /* Ab 1024 stehen Text und Buehne nebeneinander. Die Buehne bekommt
           die breitere Spalte und ein Verhaeltnis von vier zu drei, damit
           die Bahnen einen langen senkrechten Weg haben; bei 2560 ist sie
           damit rund 1160 Bildpunkte breit. Die Hoechsthoehe haelt sie auf
           hohen schmalen Schirmen im ersten Bildschirm. */
        @media (min-width: 1024px) {
          .about-hero .about-hero-inner {
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
            column-gap: clamp(40px, 5vw, 120px);
            align-items: center;
          }

          .about-hero .about-hero-strands {
            height: auto;
            aspect-ratio: 4 / 3;
            max-height: min(74vh, 900px);
          }
        }
      `}</style>
    </section>
  );
}
