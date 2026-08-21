"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { pillars, servicesIntro, type Pillar } from "../content";
import PillarMockup from "./AMockups";
import { ArrowUpRight, CheckIcon, EASE, SectionHead } from "./ui";

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  // Säule 1 & 3: Mockup rechts. Säule 2: Mockup links.
  const mockupLeft = index % 2 === 1;

  return (
    <motion.article
      className="card card-hover overflow-hidden"
      style={{ padding: "clamp(24px, 3vw, 40px)" }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      <div className={`pillar-grid${mockupLeft ? " mockup-left" : ""}`}>
        {/* Textspalte — im DOM immer zuerst */}
        <div className="pillar-text flex flex-col justify-center">
          <p className="t-eyebrow" style={{ fontSize: 13, color: "var(--color-brand-deep)" }}>
            {pillar.eyebrow}
          </p>

          <h3 className="t-h3 mt-4">{pillar.title}</h3>

          <p className="t-body mt-4" style={{ fontSize: 17, lineHeight: 1.6 }}>
            {pillar.body}
          </p>

          <ul className="mt-7 flex flex-col gap-3.5">
            {pillar.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0" style={{ color: "var(--color-brand)" }}>
                  <CheckIcon size={20} />
                </span>
                <span style={{ fontSize: 16, color: "var(--color-muted)" }}>{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href={pillar.href}
            className="pillar-link mt-8 inline-flex items-center gap-2 self-start"
            style={{ fontSize: 16, fontWeight: 600, color: "var(--color-brand-deep)" }}
          >
            Mehr über {pillar.title}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Mockup-Spalte */}
        <div className="pillar-mock">
          <PillarMockup id={pillar.id} />
        </div>
      </div>

      <style jsx>{`
        .pillar-link {
          transition: gap 0.24s var(--ease-out-expo);
        }
        .pillar-link:hover {
          gap: 12px;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .pillar-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 900px) {
          .pillar-grid {
            grid-template-columns: 1fr 1fr;
            gap: 44px;
            align-items: center;
          }
          .pillar-grid.mockup-left .pillar-text {
            order: 2;
          }
          .pillar-grid.mockup-left .pillar-mock {
            order: 1;
          }
        }
      `}</style>
    </motion.article>
  );
}

export default function ServicesSection() {
  return (
    <section id="leistungen" className="section" aria-labelledby="leistungen-title">
      <div className="shell">
        <SectionHead
          title={<span id="leistungen-title">{servicesIntro.title}</span>}
          subtitle={servicesIntro.subtitle}
          align="center"
          className="max-w-[820px]"
        />

        <div className="mt-14 flex flex-col gap-8">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
