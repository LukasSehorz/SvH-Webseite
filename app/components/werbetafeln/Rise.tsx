"use client";

/* Der einzige Eintritt dieser Seite. Der Inhalt kommt um sechzehn
   Bildpunkte von unten herein und blendet auf, ausgeloest vom
   Scrollstand. Bei ruhiger Bewegung bleibt eine reine Aufblendung. */

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "../system/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Rise({
  children,
  delay = 0,
  className,
  as = "div",
}: Readonly<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p";
}>) {
  const reduced = useSafeReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduced ? 0.3 : 0.72,
        delay: reduced ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </Tag>
  );
}
