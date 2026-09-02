"use client";

import Link from "next/link";
import { finalCta } from "../../copy";
import Noise from "../system/Noise";
import { GradientWord, Reveal } from "../system/ui";

export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="veil" aria-hidden="true">
        <span className="veil-a" />
        <span className="veil-b" />
      </div>
      <Noise opacity={0.05} />

      <div className="shell final-cta-inner">
        <Reveal>
          <h2 className="t-display final-cta-title">
            {finalCta.titleBefore}{" "}
            <GradientWord>{finalCta.gradientWord}</GradientWord>
            {finalCta.titleAfter ? <> {finalCta.titleAfter}</> : null}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="t-body-lg final-cta-lead">{finalCta.lead}</p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="final-cta-actions">
            <Link href={finalCta.primary.href} className="btn-solid">
              {finalCta.primary.label}
            </Link>
            <Link href={finalCta.secondary.href} className="btn-line">
              {finalCta.secondary.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
