"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { manifesto } from "../../copy";
import { RevealGroup, RevealItem, SectionLabel, useSafeReducedMotion } from "../system/ui";

/** Teilstriche der Zeitachse. Sie zeigen einen Verlauf ohne Zahlen. */
const TICKS = Array.from({ length: 15 }, (_, i) => 60 + i * 27);

/** Bricht ein Kastenlabel an der Wortgrenze nahe der Mitte in zwei Zeilen. */
function splitLabel(text: string): [string, string] {
  const words = text.split(" ");
  const middle = text.length / 2;
  let best = 1;
  let bestGap = Number.POSITIVE_INFINITY;

  for (let i = 1; i < words.length; i += 1) {
    const gap = Math.abs(words.slice(0, i).join(" ").length - middle);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }

  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Die flache Kurve: ein Team, das ohne KI arbeitet. */
const PATH_COOL = "M60 393 C 180 389, 300 384, 440 376";
/** Die steigende Kurve: dasselbe Team, das KI richtig nutzt. */
const PATH_HOT =
  "M60 393 C 196 387, 300 356, 364 269 C 412 201, 434 133, 440 65";
/** Die Fläche dazwischen. Steigende Kurve hin, flache Kurve zurück. */
const PATH_GAP = `${PATH_HOT} L440 376 C 300 384, 180 389, 60 393 Z`;

/** Ein Kastenlabel am rechten Rand mit kurzer Zuleitung. */
function BoxLabel({
  y,
  text,
  tint,
}: Readonly<{ y: number; text: string; tint: string }>) {
  return (
    <>
      <line x1="444" y1={y} x2="462" y2={y} stroke="var(--line)" strokeWidth="1" />
      <rect
        x="462"
        y={y - 21}
        width="164"
        height="42"
        rx="4"
        fill="none"
        stroke="var(--line)"
        strokeWidth="1"
      />
      <text
        x="475"
        y={y - 4}
        fill={tint}
        fontSize="10.5"
        letterSpacing="0.07em"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        {splitLabel(text).map((line, i) => (
          <tspan key={line} x="475" dy={i === 0 ? 0 : 15}>
            {line.toUpperCase()}
          </tspan>
        ))}
      </text>
    </>
  );
}

export default function Manifesto() {
  const reduced = useSafeReducedMotion();
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const paths = Array.from(root.querySelectorAll<SVGPathElement>("[data-curve]"));
    const marks = Array.from(root.querySelectorAll<SVGGElement>("[data-mark]"));
    const wipe = root.querySelector<SVGRectElement>("[data-wipe]");

    // Ohne Bewegung steht das fertige Bild sofort da. Beide Kurven sind
    // gezeichnet, die Fläche liegt offen, alle Beschriftungen sind lesbar.
    if (reduced) {
      paths.forEach((path) => {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      });
      marks.forEach((mark) => {
        mark.style.opacity = "1";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      // Alle Anfangswerte stehen in fromTo mit immediateRender. Ein einmaliges
      // gsap.set wuerde ScrollTrigger beim Neuvermessen zuruecknehmen, und die
      // Grafik stuende danach schon fertig da.
      const START = { immediateRender: true } as const;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 84%",
          end: "center 52%",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // 1 · Beide Kurven zeichnen sich gleichzeitig aus demselben Startpunkt.
      //     So ist zu sehen, dass die Wege im selben Betrieb beginnen.
      paths.forEach((path) => {
        const length = path.getTotalLength();
        tl.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { ...START, strokeDashoffset: 0, duration: 1, ease: "none" },
          0,
        );
      });

      // 2 · Danach füllt sich die Fläche dazwischen von links nach rechts.
      if (wipe) {
        tl.fromTo(
          wipe,
          { scaleX: 0, svgOrigin: "60 400" },
          {
            ...START,
            scaleX: 1,
            svgOrigin: "60 400",
            duration: 0.85,
            ease: "power2.out",
          },
          1,
        );
      }

      // 3 · Zum Schluss treten die Beschriftungen nacheinander hinzu.
      tl.fromTo(
        marks,
        { autoAlpha: 0 },
        { ...START, autoAlpha: 1, duration: 0.4, stagger: 0.16 },
        1.15,
      );

      return () => {
        tl.kill();
      };
    }, root);

    return () => context.revert();
  }, [reduced]);

  return (
    <section className="section" id="problem">
      <div className="shell">
        <SectionLabel>{manifesto.label}</SectionLabel>

        <div className="manifesto-grid" ref={scope}>
          <div className="manifesto-chart">
            <svg
              viewBox="0 0 632 470"
              role="img"
              aria-label={`Diagramm mit den Achsen ${manifesto.chart.axisX} und ${manifesto.chart.axisY}. Die Kurve für ein Team, das mit KI arbeitet, steigt steil an, die Kurve ohne KI bleibt flach. Dazwischen liegt der Unterschied.`}
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="curve-hot" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5b8cff" />
                  <stop offset="48%" stopColor="#7c6aff" />
                  <stop offset="100%" stopColor="#b9a5ff" />
                </linearGradient>

                {/* Die Fläche ist unten kaum zu sehen und wird nach oben
                    kräftiger, genau dort, wo der Unterschied groß wird. */}
                <linearGradient id="gap-fill" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#5b8cff" stopOpacity="0.03" />
                  <stop offset="55%" stopColor="#7c6aff" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#b9a5ff" stopOpacity="0.26" />
                </linearGradient>

                <clipPath id="gap-clip" clipPathUnits="userSpaceOnUse">
                  <rect data-wipe x="56" y="30" width="392" height="372" />
                </clipPath>
              </defs>

              {/* Achsen */}
              <line x1="56" y1="34" x2="56" y2="410" stroke="var(--line)" strokeWidth="1" />
              <line x1="56" y1="410" x2="456" y2="410" stroke="var(--line)" strokeWidth="1" />

              {TICKS.map((x, i) => (
                <line
                  key={x}
                  x1={x}
                  y1="410"
                  x2={x}
                  y2={i % 4 === 0 ? 420 : 415}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
              ))}

              {/* Der Unterschied als Fläche zwischen den beiden Wegen */}
              <path
                d={PATH_GAP}
                fill="url(#gap-fill)"
                clipPath="url(#gap-clip)"
                stroke="none"
              />

              {/* Ein Team, das ohne KI arbeitet */}
              <path
                data-curve="cool"
                d={PATH_COOL}
                fill="none"
                stroke="rgba(244,244,246,.5)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Dasselbe Team, das KI richtig nutzt */}
              <path
                data-curve="hot"
                d={PATH_HOT}
                fill="none"
                stroke="url(#curve-hot)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Das Maß des Unterschieds am Ende des Zeitraums */}
              <g data-mark opacity="0">
                <line
                  x1="440"
                  y1="65"
                  x2="440"
                  y2="376"
                  stroke="rgba(185,165,255,.5)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
                <BoxLabel
                  y={220}
                  text={manifesto.chart.gap}
                  tint="rgba(214,219,255,.82)"
                />
              </g>

              {/* Endpunkte und Kastenlabels der beiden Kurven */}
              <g data-mark opacity="0">
                <circle cx="440" cy="65" r="3.4" fill="#b9a5ff" />
                <BoxLabel
                  y={65}
                  text={manifesto.chart.curveHot}
                  tint="var(--ink-2)"
                />
              </g>

              <g data-mark opacity="0">
                <circle cx="440" cy="376" r="3.4" fill="rgba(244,244,246,.5)" />
                <BoxLabel
                  y={376}
                  text={manifesto.chart.curveCool}
                  tint="var(--ink-3)"
                />
              </g>

              {/* Achsenbeschriftung. Zahlen stehen bewusst nirgends. */}
              <text
                x="256"
                y="444"
                textAnchor="middle"
                fill="var(--ink-3)"
                fontSize="10.5"
                letterSpacing="0.11em"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                {manifesto.chart.axisX.toUpperCase()}
              </text>
              <text
                x="-222"
                y="40"
                transform="rotate(-90)"
                textAnchor="middle"
                fill="var(--ink-3)"
                fontSize="10.5"
                letterSpacing="0.11em"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                {manifesto.chart.axisY.toUpperCase()}
              </text>
            </svg>
          </div>

          <div className="manifesto-text">
            <h2 className="t-h1">{manifesto.title}</h2>
            <RevealGroup className="manifesto-paragraphs">
              {manifesto.paragraphs.map((paragraph) => (
                <RevealItem key={paragraph.slice(0, 24)} as="p" className="t-body-lg">
                  {paragraph}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
