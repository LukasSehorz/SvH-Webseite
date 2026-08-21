"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { resources } from "../content";
import { ChevronRightIcon } from "./BIcons";
import { Reveal, RevealGroup, revealChild } from "./ui";

function BadgePill({ children, tone = "onBlue" }: { children: string; tone?: "onBlue" | "onCard" }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 14,
        fontWeight: 500,
        ...(tone === "onBlue"
          ? { background: "rgba(255,255,255,.24)", color: "#fff" }
          : {
              background: "rgba(255,255,255,.9)",
              color: "var(--color-brand-deep)",
              border: "1px solid var(--color-tint-1)",
            }),
      }}
    >
      {children}
    </span>
  );
}

export default function ResourcesSection() {
  const f = resources.feature;

  return (
    <section className="section" aria-labelledby="ressourcen-titel">
      <div className="shell">
        <Reveal>
          <h2 id="ressourcen-titel" className="t-h2">
            {resources.title}
          </h2>
        </Reveal>

        {/* Feature-Panel */}
        <Reveal delay={0.08}>
          <div
            className="slab mt-10"
            style={{
              background: "linear-gradient(160deg,#38C3F2 0%,#0092D4 55%,#0C63A8 100%)",
              padding: "clamp(24px,3vw,40px)",
            }}
          >
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div
                className="relative overflow-hidden"
                style={{ borderRadius: 20, aspectRatio: "16 / 9", background: "rgba(255,255,255,.15)" }}
              >
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div>
                <BadgePill>{f.badge}</BadgePill>
                <h3
                  className="mt-5"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(26px,2.6vw,34px)",
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: "#fff",
                  }}
                >
                  {f.title}
                </h3>
                <p className="mt-4" style={{ color: "rgba(255,255,255,.85)", lineHeight: 1.55 }}>
                  {f.body}
                </p>
                <a
                  href={f.href}
                  className="mt-6 inline-flex items-center gap-2 font-medium hover:underline"
                  style={{ color: "#fff" }}
                >
                  Erfahren Sie mehr
                  <ChevronRightIcon size={16} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Karten */}
        <RevealGroup className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3" amount={0.15}>
          {resources.items.map((item) => (
            <motion.article
              key={item.title}
              variants={revealChild}
              className="card card-hover group"
              style={{ borderRadius: 20, overflow: "hidden" }}
            >
              <div className="relative" style={{ aspectRatio: "16 / 9", overflow: "hidden" }}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="transition-transform duration-[600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
                  style={{ objectFit: "cover" }}
                />
                <span className="absolute bottom-3 left-3">
                  <BadgePill tone="onCard">{item.badge}</BadgePill>
                </span>
              </div>

              <div style={{ padding: 24 }}>
                <h3 className="t-h3" style={{ fontSize: 22 }}>
                  {item.title}
                </h3>
                <a
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 font-semibold hover:underline"
                  style={{ color: "var(--color-brand-deep)" }}
                >
                  Erfahren Sie mehr
                  <ChevronRightIcon size={15} />
                </a>
              </div>
            </motion.article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
