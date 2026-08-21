"use client";

import { motion } from "framer-motion";
import type { ServicePage } from "../../content-pages";
import { RevealGroup, SectionHead, revealChild } from "../ui";
import CapabilityMockup from "./CapabilityMockups";

export default function CapabilityGrid({
  capabilities,
}: {
  capabilities: ServicePage["capabilities"];
}) {
  return (
    <section className="section" aria-labelledby="bausteine-titel" style={{ paddingTop: 0 }}>
      <div className="shell">
        <SectionHead
          align="center"
          title={<span id="bausteine-titel">{capabilities.title}</span>}
          subtitle={capabilities.subtitle}
        />

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          amount={0.05}
        >
          {capabilities.items.map((item, i) => (
            <motion.article
              key={item.title}
              variants={revealChild}
              className="card card-hover"
              style={{ overflow: "hidden" }}
            >
              <div
                className="relative"
                style={{
                  height: 220,
                  background: "linear-gradient(160deg,#F4FCFF,#DEF4FF)",
                  borderBottom: "1px solid rgba(0,146,212,.12)",
                }}
              >
                <CapabilityMockup id={item.mockup} label={item.title} index={i} />
              </div>

              <div style={{ padding: 28 }}>
                <h3 className="t-h3" style={{ fontSize: "clamp(21px,1.7vw,24px)" }}>
                  {item.title}
                </h3>
                <p className="t-body" style={{ marginTop: 12 }}>
                  {item.body}
                </p>
              </div>
            </motion.article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
