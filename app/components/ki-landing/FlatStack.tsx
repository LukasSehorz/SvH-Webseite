"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { kiLayers } from "../../copy";
import { useSafeReducedMotion } from "../system/ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const GIVEN = kiLayers.layers.filter((layer) => layer.role === "given");
const TOOLS = [...kiLayers.integrations.tools, kiLayers.integrations.more];

/**
 * Schmale Fassung ohne Pin. Zuerst stehen nur die gegebenen Ebenen da,
 * beim Eintritt schieben sich die beiden neuen sichtbar dazwischen und
 * die Integrations-Reihe klappt darunter auf.
 */
export default function FlatStack() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, { once: true, margin: "0px 0px -18% 0px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStep(2);
      return;
    }
    if (!inView) return;
    const a = window.setTimeout(() => setStep(1), 520);
    const b = window.setTimeout(() => setStep(2), 1420);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [inView, reduced]);

  const layers = step >= 1 ? kiLayers.layers : GIVEN;
  const move = reduced
    ? { duration: 0.25, ease: EASE }
    : { duration: 0.72, ease: EASE };

  return (
    <div className="kl-flat" ref={host}>
      <AnimatePresence initial={false}>
        {layers.map((layer) => (
          <motion.div
            key={layer.id}
            layout
            className="kl-flat-card"
            data-role={layer.role}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            transition={move}
          >
            <div className="kl-flat-inner">
              <p className="kl-flat-title">{layer.title}</p>
              <p className="t-body kl-flat-body">{layer.body}</p>
            </div>
          </motion.div>
        ))}

        {step >= 2 ? (
          <motion.div
            key="tiles"
            layout
            className="kl-flat-tiles"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            transition={move}
          >
            <div className="kl-flat-tiles-inner">
              {TOOLS.map((tool) => (
                <span key={tool} className="kl-flat-tile">
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style jsx global>{`
        .kl-flat {
          display: flex;
          flex-direction: column;
          margin-top: 34px;
        }

        .kl-flat-card,
        .kl-flat-tiles {
          overflow: hidden;
        }

        .kl-flat-inner {
          border: 1px dashed var(--line);
          border-radius: 10px;
          padding: 18px 18px 20px;
        }

        /* Was SVH einzieht, trägt dieselbe eine Markenfarbe wie in der
           Schrägsicht: getönte Fläche, farbiger Rahmen, weicher Schein. */
        .kl-flat {
          --tint: 124, 106, 255;
        }

        .kl-flat-card[data-role="added"] .kl-flat-inner {
          background: rgba(var(--tint), 0.2);
          border-color: rgba(var(--tint), 0.72);
          box-shadow: inset 0 0 40px rgba(var(--tint), 0.16);
        }

        .kl-flat-card[data-role="added"] .kl-flat-body {
          color: rgba(214, 219, 255, 0.66);
        }

        .kl-flat-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: 21px;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: var(--ink);
          margin: 0;
        }

        .kl-flat-body {
          margin: 8px 0 0;
          font-size: 14px;
          color: var(--ink-3);
        }

        .kl-flat-tiles-inner {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 4px 0;
        }

        .kl-flat-tile {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          border: 1px dashed rgba(var(--tint), 0.7);
          border-radius: 4px;
          background: rgba(var(--tint), 0.19);
          font-size: 11.5px;
          letter-spacing: 0.02em;
          color: rgba(230, 232, 255, 0.9);
          white-space: nowrap;
        }

        .kl-flat-tile:last-child {
          background: transparent;
          border-color: rgba(var(--tint), 0.3);
          border-style: dotted;
          color: rgba(206, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
