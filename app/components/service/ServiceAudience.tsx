"use client";

import { motion } from "framer-motion";
import type { ServicePage } from "../../content-pages";
import { Reveal, RevealGroup, SectionHead, revealChild } from "../ui";

export default function ServiceAudience({ audience }: { audience: ServicePage["audience"] }) {
  return (
    <section className="section" aria-labelledby="zielgruppe-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <SectionHead align="left" title={<span id="zielgruppe-titel">{audience.title}</span>} />
          <Reveal delay={0.08}>
            <p className="t-lead">{audience.body}</p>
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" amount={0.1}>
          {audience.items.map((item) => (
            <motion.article
              key={item.title}
              variants={revealChild}
              className="card card-hover"
              style={{ padding: "clamp(24px,2.4vw,32px)" }}
            >
              <h3 className="t-h3" style={{ fontSize: "clamp(22px,1.8vw,26px)" }}>
                {item.title}
              </h3>
              <p className="t-body" style={{ marginTop: 14 }}>
                {item.body}
              </p>
            </motion.article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
