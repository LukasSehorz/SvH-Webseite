"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { testimonials } from "../content";
import { ArrowLeftIcon, ArrowRightIcon, PlayIcon } from "./BIcons";
import { ArrowUpRight, CheckIcon, Reveal, RevealGroup, revealChild, SectionHead, useSafeReducedMotion } from "./ui";

export default function Testimonials() {
  const slides = testimonials.featured;
  const count = slides.length;
  const canSlide = count > 1;
  const reduce = useSafeReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const go = (delta: number) => {
    if (!canSlide) return;
    setState(([i]) => [(i + delta + count) % count, delta]);
  };

  const slide = slides[index];

  const spring = reduce
    ? { duration: 0.2 }
    : ({ type: "spring", stiffness: 220, damping: 30 } as const);

  return (
    <section id="referenzen" className="section" aria-label={testimonials.title}>
      <div className="shell">
        <SectionHead title={testimonials.title} subtitle={testimonials.subtitle} />

        <Reveal delay={0.1}>
          <div
            className="relative mt-12 overflow-hidden"
            style={{
              borderRadius: 40,
              background: "linear-gradient(180deg,#F3FBFF,#E7F6FF)",
              padding: "clamp(24px,3.6vw,48px)",
            }}
          >
            {/* Pfeile */}
            <div className="mb-6 flex justify-end gap-3">
              {[
                { dir: -1, label: "Vorherige Kundenstimme", Icon: ArrowLeftIcon },
                { dir: 1, label: "Nächste Kundenstimme", Icon: ArrowRightIcon },
              ].map(({ dir, label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  data-testimonial-arrow
                  onClick={() => go(dir)}
                  disabled={!canSlide}
                  aria-disabled={!canSlide}
                  aria-label={label}
                  className="flex items-center justify-center transition-[background-color,opacity,transform] duration-200"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: "1px solid var(--color-brand)",
                    color: "var(--color-brand)",
                    opacity: canSlide ? 1 : 0.4,
                    cursor: canSlide ? "pointer" : "not-allowed",
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <div className="relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: reduce ? 0 : direction >= 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduce ? 0 : direction >= 0 ? -60 : 60 }}
                  transition={spring}
                  drag={canSlide && !reduce ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14"
                >
                  {/* Links: Zitat */}
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(32px,3.4vw,44px)",
                        lineHeight: 1.05,
                        color: "var(--color-muted)",
                      }}
                    >
                      {slide.brand}
                    </p>
                    <p
                      className="mt-2"
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--color-brand-deep)",
                      }}
                    >
                      {slide.industry}
                    </p>

                    <blockquote
                      className="mt-8"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "clamp(19px,1.9vw,24px)",
                        lineHeight: 1.45,
                        color: "var(--color-ink)",
                      }}
                    >
                      „{slide.quote}“
                    </blockquote>

                    <p className="mt-8" style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink)" }}>
                      {slide.person}
                    </p>
                    <p style={{ fontSize: 16, color: "var(--color-muted)" }}>{slide.role}</p>

                    <a
                      href="#kontakt"
                      className="mt-7 inline-flex items-center gap-2 font-semibold hover:underline"
                      style={{ color: "var(--color-brand-deep)" }}
                    >
                      Jetzt Fallstudie lesen
                      <ArrowUpRight />
                    </a>
                  </div>

                  {/* Rechts: Medien + Highlights */}
                  <div>
                    <div
                      className="relative overflow-hidden"
                      style={{ borderRadius: 20, aspectRatio: "16 / 9", background: "#DEF4FF" }}
                    >
                      <Image
                        src={slide.media}
                        alt={`Projektbild – ${slide.brand}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 560px"
                        style={{ objectFit: "cover" }}
                        draggable={false}
                      />
                      <span
                        className="absolute left-1/2 top-1/2 flex items-center justify-center"
                        style={{
                          width: 62,
                          height: 62,
                          marginLeft: -31,
                          marginTop: -31,
                          borderRadius: 999,
                          background: "rgba(255,255,255,.82)",
                          backdropFilter: "blur(6px)",
                          color: "var(--color-brand)",
                        }}
                        aria-hidden
                      >
                        <PlayIcon size={22} />
                      </span>
                    </div>

                    <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {slide.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex gap-3"
                          style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 18,
                            boxShadow: "0 10px 28px -22px rgba(0,26,35,.4)",
                          }}
                        >
                          <span className="mt-[2px] shrink-0" style={{ color: "var(--color-brand)" }}>
                            <CheckIcon size={20} />
                          </span>
                          <span className="t-body">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        {/* Kurz-Zitate */}
        <RevealGroup className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3" amount={0.15}>
          {testimonials.short.map((s, i) => (
            <motion.figure
              key={`${s.person}-${i}`}
              variants={revealChild}
              className="card card-hover"
              style={{ padding: 28 }}
            >
              <blockquote className="t-body" style={{ fontSize: 16 }}>
                „{s.quote}“
              </blockquote>
              <figcaption className="mt-5">
                <span className="block" style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink)" }}>
                  {s.person}
                </span>
                <span className="block" style={{ fontSize: 15, color: "var(--color-muted)" }}>
                  {s.role}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
