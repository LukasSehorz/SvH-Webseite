"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { aboutPage } from "../../copy";
import { GradientWord, useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Erster Bildschirm                                     */
/*                                                                     */
/*  Zwei kurze Zeilen, ein Satz, ein Knopf. Mehr steht hier nicht,     */
/*  weil die Seite in wenigen Sekunden verstanden werden soll.         */
/*                                                                     */
/*  Die Bewegung ist ein einmaliges Aufziehen beim Laden. Die beiden   */
/*  Zeilen kommen aus einer leichten Unschaerfe nach oben, danach      */
/*  folgen Satz und Knopf. Bei reduzierter Bewegung steht alles        */
/*  sofort und unveraendert.                                          */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AboutHero() {
  const reduced = useSafeReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 26, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.95, delay, ease: EASE },
        };

  return (
    <section className="subpage-head about-hero">
      <span className="hero-fog" aria-hidden="true" />

      <div className="shell about-hero-inner">
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

        <motion.div className="about-hero-action" {...rise(0.4)}>
          <Link href={aboutPage.hero.cta.href} className="btn-solid">
            {aboutPage.hero.cta.label}
          </Link>
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
        }

        .about-hero .about-hero-title {
          max-width: 16ch;
        }

        .about-hero .about-hero-line {
          display: block;
        }

        .about-hero .about-hero-lead {
          max-width: var(--measure);
          margin-top: 34px;
        }

        .about-hero .about-hero-action {
          display: flex;
          margin-top: 42px;
        }
      `}</style>
    </section>
  );
}
