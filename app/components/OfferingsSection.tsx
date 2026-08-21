"use client";

import { motion } from "framer-motion";
import { offerings, pillars } from "../content";
import { ButtonLink, EASE, Reveal, loop, useSafeReducedMotion } from "./ui";

/** Kürzt einen Text an der letzten Wortgrenze vor `max` Zeichen. */
function shorten(text: string, max = 200) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s,;–-]+$/, "")} …`;
}

const STAGE_CSS = `
.svh-stage{position:relative}
.svh-stage-card{position:relative;width:100%}
.svh-stage-card + .svh-stage-card{margin-top:20px}
.svh-stage-title{
  position:relative;text-align:center;margin-bottom:32px;
}
.svh-stage-arcs{display:none}
.svh-stage-glyph{display:none}

@media (min-width:900px){
  .svh-stage{height:800px}
  .svh-stage-card{position:absolute;margin-top:0;z-index:2}
  .svh-stage-card + .svh-stage-card{margin-top:0}
  .svh-stage-card--a{left:2%;top:170px;width:33%}
  .svh-stage-card--b{right:2%;top:170px;width:33%}
  .svh-stage-card--c{left:33%;top:470px;width:34%}
  .svh-stage-title{
    position:absolute;left:0;right:0;top:396px;margin:0;z-index:1;pointer-events:none;
  }
  .svh-stage-arcs{display:block;position:absolute;inset:0;z-index:1;pointer-events:none}
  .svh-stage-glyph{display:block;position:absolute;inset:0;z-index:0;pointer-events:none}
}
`;

const ARCS = [
  "M222 190 C 400 46, 800 46, 978 190",
  "M222 420 C 222 486, 300 470, 420 470",
  "M978 420 C 978 486, 900 470, 780 470",
];

const DOTS = [
  [222, 190],
  [978, 190],
  [222, 420],
  [978, 420],
  [420, 470],
  [780, 470],
] as const;

export default function OfferingsSection() {
  const reduce = useSafeReducedMotion();
  const slots = ["a", "b", "c"] as const;

  return (
    <section className="section" aria-labelledby="angebote-titel">
      <style>{STAGE_CSS}</style>

      <div className="shell">
        <Reveal>
          <div className="svh-stage">
            {/* Zentrale Chevron-Geometrie */}
            <div className="svh-stage-glyph" aria-hidden>
              <motion.svg
                viewBox="0 0 1200 800"
                preserveAspectRatio="none"
                className="h-full w-full"
                {...loop(
                  reduce,
                  { opacity: [0.75, 1, 0.75], scale: [1, 1.025, 1] },
                  { opacity: 1, scale: 1 },
                  { duration: 9, repeat: Infinity, ease: "easeInOut" }
                )}
                style={{ transformOrigin: "50% 45%" }}
              >
                <defs>
                  <linearGradient id="svh-glyph-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00BCFF" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#00BCFF" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M600 200 900 560H300L600 200Z" fill="url(#svh-glyph-grad)" />
                <path d="M600 320 780 560H420L600 320Z" fill="url(#svh-glyph-grad)" />
                <path d="M600 420 700 560H500L600 420Z" fill="url(#svh-glyph-grad)" />
              </motion.svg>
            </div>

            {/* Verbindungsbögen */}
            <svg
              className="svh-stage-arcs"
              viewBox="0 0 1200 800"
              preserveAspectRatio="none"
              aria-hidden
            >
              {ARCS.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="var(--color-brand-bright)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.8 : 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.8 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, delay: 0.25 + i * 0.18, ease: EASE }}
                />
              ))}
              {DOTS.map(([cx, cy], i) => (
                <motion.circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="7"
                  fill="var(--color-brand-bright)"
                  initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.3 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: EASE }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              ))}
            </svg>

            {/* Titel — auf dem Desktop hinter den Karten */}
            <h2 id="angebote-titel" className="t-h2 svh-stage-title">
              {offerings.title}
            </h2>

            {/* Karten */}
            {pillars.map((pillar, i) => (
              <motion.article
                key={pillar.id}
                className={`svh-stage-card svh-stage-card--${slots[i]}`}
                initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: 24,
                    padding: 32,
                    background: "rgba(255,255,255,.72)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,.8)",
                    boxShadow: "0 20px 50px -30px rgba(0,26,35,.28)",
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                      height: 120,
                      background: "linear-gradient(180deg, rgba(0,188,255,0) 0%, rgba(0,188,255,.35) 100%)",
                    }}
                    aria-hidden
                  />
                  <div className="relative">
                    <h3 className="t-h3 text-center">{pillar.title}</h3>
                    <p className="t-body mt-4 text-center">{shorten(pillar.body)}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 flex justify-center min-[900px]:mt-16">
          <ButtonLink href={offerings.cta.href}>{offerings.cta.label}</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
