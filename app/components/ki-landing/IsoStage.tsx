"use client";

import { kiLayers } from "../../copy";

/**
 * Bühne des Ebenen-Aufbaus.
 *
 * Aus den Referenzbildern abgemessen: Die Säule ist EIN Block, der als Ganzes
 * in die Schrägsicht kippt. Die Seitenkanten bleiben dabei senkrecht, nur
 * Ober- und Unterkante steigen nach rechts an — also eine reine Scherung in
 * y plus eine leichte Stauchung. Weil die Scherung auf dem Wrapper sitzt,
 * liegt ALLES in der Plattenebene: Rahmen, Eckwinkel, Titel und Unterzeile
 * neigen sich gemeinsam mit der Fläche.
 *
 * Werte der Referenz bei 553px Spaltenbreite:
 *   Platte 94px hoch, Lücke 7px, Kachelreihe 53px, Spalte 460px hoch.
 *   Kante steigt mit -0.173 (entspricht -9.8°), Fläche 0.928 × 0.894 gestaucht.
 *   Die eingefügten Ebenen enden bei 62.7% der Breite, rechts steht das
 *   Logo-Feld über 35.7%.
 * Alle Maße stehen darum als Anteil der Spaltenbreite (cqw) im Stylesheet.
 */

/** Anteile der Spaltenbreite in Prozent. */
export const LAYOUT = {
  /** Höhe einer Platte. 17% der Breite ergibt das Verhältnis 1 zu 5.9. */
  plate: 17,
  gap: 1.3,
  /** Höhe der Kachelreihe. 9.6% ≙ 53px bei 554px Spaltenbreite. */
  tile: 9.7,
  /** Breite der eingefügten Ebenen und des Logo-Felds. */
  main: 62.7,
  badge: 35.7,
  slots: { team: 0, agents: 18.3, llm: 36.5, tilesRow: 54.8, systems: 66 },
  /** Vor dem Aufbau steht „Ihre Systeme" tief. Gemessen: 160px Lücke bei
      82px Plattenhöhe in der Schrägsicht, also gut zwei leere Plätze. */
  systemsStart: 49.5,
  column: 83,
  /** Hereingleiten der eingefügten Ebenen. In der Referenz steigen sie
      knapp von unten auf und stehen dabei minimal weiter rechts. */
  slideX: 3.6,
  slideY: 14.6,
} as const;

/** Schrägsicht. matrix(a, b, 0, d) — senkrechte Kanten bleiben senkrecht.
    Der Ursprung liegt links außerhalb der Fläche und knapp über der
    Unterkante; genau so liegen flacher und schräger Zustand der Referenz
    übereinander (aus s16 gegen s30 zurückgerechnet). */
const ISO = { a: 0.928, b: -0.161, d: 0.894, ox: -10.3, oy: 93.3 } as const;

const TOOLS = kiLayers.integrations.tools;

/** Punkt-Marke des Logo-Felds. Ein aufsteigender Pfeil aus Punkten. */
const MARK: ReadonlyArray<readonly [number, number, number]> = [
  [50, 10, 10],
  [36, 26, 9],
  [64, 26, 9],
  [22, 44, 8],
  [50, 40, 8],
  [78, 44, 8],
  [8, 62, 7],
  [36, 58, 7],
  [64, 58, 7],
  [92, 62, 7],
];

export default function IsoStage() {
  return (
    <div className="kl-stage">
      <div className="kl-scale">
        <div className="kl-warp" data-warp>
          <div className="kl-col">
            {kiLayers.layers.map((layer) => (
              <div
                key={layer.id}
                className="kl-plate"
                data-plate={layer.id}
                data-role={layer.role}
              >
                <span className="kl-face" aria-hidden="true" />
                <span className="kl-mark" aria-hidden="true" />
                <span className="kl-trail kl-trail-a" aria-hidden="true" />
                <span className="kl-trail kl-trail-b" aria-hidden="true" />
                <span className="kl-trail kl-trail-c" aria-hidden="true" />
                <div className="kl-text">
                  <p className="kl-plate-title">{layer.title}</p>
                  <p className="kl-plate-body">{layer.body}</p>
                </div>
              </div>
            ))}

            {/* Quadratische Kacheln der angebundenen Werkzeuge. */}
            <div className="kl-tiles" data-tiles>
              {TOOLS.map((tool) => (
                <span key={tool} className="kl-tile-slot" data-tile>
                  <span className="kl-tile-face" aria-hidden="true" />
                  <span className="kl-mark kl-mark-sm" aria-hidden="true" />
                  <span className="kl-tile-text">{tool}</span>
                </span>
              ))}
              <span className="kl-tile-slot kl-tile-more" data-tile>
                <span className="kl-tile-face" aria-hidden="true" />
                <span className="kl-mark kl-mark-sm" aria-hidden="true" />
                <span className="kl-tile-text">{kiLayers.integrations.more}</span>
              </span>
            </div>

            {/* Das gestrichelte Logo-Feld rechts der eingefügten Ebenen. */}
            <div className="kl-badge" data-badge aria-hidden="true">
              <span className="kl-face" />
              <span className="kl-mark" />
              <span className="kl-trail kl-trail-a" />
              <span className="kl-trail kl-trail-b" />
              <span className="kl-badge-mark">
                {MARK.map(([x, y, s], k) => (
                  <span
                    key={`${x}-${y}`}
                    className="kl-dot"
                    data-dot
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${s}%`,
                      aspectRatio: "1",
                      transitionDelay: `${k * 34}ms`,
                    }}
                  />
                ))}
              </span>
            </div>

            <span className="kl-shine" data-shine aria-hidden="true" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .kl-stage {
          /* Grundzustand ist FLACH und frontal. So sieht die Bühne aus, bevor
             die Zeitleiste greift (erstes Referenzbild) und wieder, wenn sie
             durchgelaufen ist (letztes Referenzbild) — und ebenso ohne
             Bewegung. Die Schrägsicht ist nur der Weg dazwischen. */
          --iso: 0;
          --line: rgba(238, 240, 255, 0.36);
          --edge: rgba(238, 240, 255, 0.86);
          /* Alles, was SVH einzieht, trägt EINE Markenfarbe — das Violett des
             Verlaufs. Sie steht als RGB-Tripel, damit Rahmen, Füllung und
             Eckwinkel daraus abgeleitet werden und über alle Ebenen,
             Kacheln und das Logo-Feld gleich aussehen. Die gegebenen Ebenen
             „Ihr Team" und „Ihre Systeme" bleiben rein weiß. */
          --tint: 124, 106, 255;
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Die Buehne waechst mit der Spalte, bleibt aber an die Bildhoehe
           gebunden. Die Saeule ist 83 Prozent ihrer Breite hoch, dazu kommen
           rund 190 Bildpunkte fuer Fuszzeile und Luft; daraus folgt die
           groeszte Breite, die noch ohne Beschnitt in ein Bild passt. */
        .kl-scale {
          position: relative;
          width: min(
            100%,
            clamp(640px, 46vw, 1040px),
            calc((100vh - 190px) * 1.2)
          );
          container-type: inline-size;
          /* Ein Prozent der Spaltenbreite. Alle Maße hängen daran, so bleibt
             das Verhältnis der Referenz über jede Breite erhalten. */
          --u: 6.4px;
        }

        @supports (width: 1cqw) {
          .kl-scale {
            --u: 1cqw;
          }
        }

        /* Die Schrägsicht sitzt auf dem Wrapper. Damit neigt sich der ganze
           Inhalt mit, Schrift eingeschlossen. Der Ursprung liegt unten links,
           dort bleibt die Säule beim Kippen stehen. */
        .kl-warp {
          position: relative;
          width: 100%;
          height: calc(${LAYOUT.column} * var(--u));
          transform: matrix(
            calc(1 - ${1 - ISO.a} * var(--iso)),
            calc(${ISO.b} * var(--iso)),
            0,
            calc(1 - ${1 - ISO.d} * var(--iso)),
            0,
            0
          );
          transform-origin: ${ISO.ox}% ${ISO.oy}%;
          will-change: transform;
        }

        .kl-col {
          position: absolute;
          inset: 0;
        }

        /* ---------------------------------------------------------------- */
        /*  Platten                                                          */
        /* ---------------------------------------------------------------- */

        .kl-plate {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: calc(${LAYOUT.plate} * var(--u));
          --x: 0;
          transform: translate3d(
            calc(var(--x) * var(--u)),
            calc(var(--y) * var(--u)),
            0
          );
          will-change: transform, opacity;
        }

        .kl-plate[data-plate="team"] {
          --y: ${LAYOUT.slots.team};
        }
        .kl-plate[data-plate="agents"] {
          --y: ${LAYOUT.slots.agents};
        }
        .kl-plate[data-plate="llm"] {
          --y: ${LAYOUT.slots.llm};
        }
        .kl-plate[data-plate="systems"] {
          --y: ${LAYOUT.slots.systems};
        }

        /* Die eingefügten Ebenen lassen rechts Platz für das Logo-Feld. */
        .kl-plate[data-role="added"] {
          right: calc(${100 - LAYOUT.main} * var(--u));
        }

        .kl-face {
          position: absolute;
          inset: 0;
          border: 1px dotted var(--line);
        }

        /* Die gegebenen Ebenen bleiben eine reine Zeichnung. Die beiden
           Ebenen, die SVH einzieht, tragen die Markenfarbe: getönte Fläche,
           farbiger Rahmen und ein weicher Schein nach innen. So ist auf einen
           Blick zu sehen, was von uns kommt. */
        .kl-plate[data-role="added"] .kl-face {
          border-style: dashed;
          border-color: rgba(var(--tint), 0.72);
          background: rgba(var(--tint), 0.2);
          box-shadow: inset 0 0 calc(7 * var(--u)) rgba(var(--tint), 0.18);
        }

        .kl-plate[data-role="added"] .kl-mark {
          --c: rgb(var(--tint));
        }

        .kl-plate[data-role="added"] .kl-plate-body {
          color: rgba(214, 219, 255, 0.62);
        }

        /* Eckwinkel. Vier kurze Haken, die die Fläche fassen. In der
           Referenz sind sie kräftig und knapp 6px lang. */
        .kl-mark {
          --n: calc(1.15 * var(--u));
          --c: var(--edge);
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c)),
            linear-gradient(var(--c), var(--c));
          background-repeat: no-repeat;
          background-size:
            var(--n) 1px,
            1px var(--n),
            var(--n) 1px,
            1px var(--n),
            var(--n) 1px,
            1px var(--n),
            var(--n) 1px,
            1px var(--n);
          background-position:
            0 0,
            0 0,
            100% 0,
            100% 0,
            0 100%,
            0 100%,
            100% 100%,
            100% 100%;
        }

        .kl-mark-sm {
          --n: calc(0.95 * var(--u));
          --c: rgba(238, 240, 255, 0.6);
        }

        /* Tiefenlinien. In der Referenz laufen von den rechten Ecken jeder
           vollen Platte dünne Haarlinien nach rechts unten und verlaufen
           dabei ins Nichts — Winkel ~48°, sichtbare Länge ~14% der Breite. */
        .kl-trail {
          position: absolute;
          width: calc(16 * var(--u));
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(238, 240, 255, 0.3) 0%,
            rgba(238, 240, 255, 0.13) 34%,
            rgba(238, 240, 255, 0) 100%
          );
          transform-origin: 0 0;
          transform: rotate(48deg);
          opacity: calc(var(--iso) * 0.95);
          pointer-events: none;
        }

        /* Der Ursprung liegt exakt auf der Ecke, von dort läuft die Linie. */
        .kl-trail-a {
          left: 100%;
          top: 0;
        }
        .kl-trail-b {
          left: 100%;
          top: 100%;
        }
        .kl-trail-c {
          left: 0;
          top: 100%;
          opacity: 0;
        }

        /* Nur was die volle Breite erreicht, wirft Tiefenlinien — genau wie
           in der Referenz. Die unterste Platte zeigt zusätzlich links unten. */
        .kl-plate[data-role="added"] .kl-trail {
          opacity: 0;
        }
        .kl-plate[data-plate="systems"] .kl-trail-c {
          opacity: calc(var(--iso) * 0.7);
        }

        /* Der Textblock steht mittig in der Platte, links um 4.3% eingerückt
           — so sitzt er in der Referenz, flach wie schräg. */
        .kl-text {
          position: absolute;
          left: calc(4.3 * var(--u));
          top: 50%;
          right: calc(3 * var(--u));
          transform: translateY(-50%);
        }

        .kl-plate-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(14px, calc(2.7 * var(--u)), 22px);
          line-height: 1.1;
          letter-spacing: -0.012em;
          color: var(--ink);
          margin: 0;
        }

        .kl-plate-body {
          margin: calc(0.9 * var(--u)) 0 0;
          font-size: clamp(9px, calc(1.62 * var(--u)), 13px);
          line-height: 1.35;
          color: rgba(244, 244, 246, 0.44);
        }

        /* ---------------------------------------------------------------- */
        /*  Kachelreihe                                                      */
        /* ---------------------------------------------------------------- */

        .kl-tiles {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          --y: ${LAYOUT.slots.tilesRow};
          height: calc(${LAYOUT.tile} * var(--u));
          transform: translate3d(0, calc(var(--y) * var(--u)), 0);
          display: flex;
          gap: calc(1.2 * var(--u));
          will-change: transform, opacity;
        }

        /* Neun gleich große Quadrate füllen die Reihe genau aus — acht
           Wortmarken und der Abbinder, wie in der Referenz. */
        .kl-tile-slot {
          position: relative;
          flex: 1 1 0;
          min-width: 0;
          height: 100%;
          /* Die Kacheln fahren auf derselben Tiefenachse herein wie die
             Platten, darum tragen sie dieselben Stellgrößen. */
          --x: 0;
          --y: 0;
          transform: translate3d(
            calc(var(--x) * var(--u)),
            calc(var(--y) * var(--u)),
            0
          );
          will-change: transform, opacity;
        }

        .kl-tile-face {
          position: absolute;
          inset: 0;
          border: 1px dotted rgba(var(--tint), 0.7);
          background: rgba(var(--tint), 0.19);
        }

        .kl-tile-slot .kl-mark-sm {
          --c: rgba(var(--tint), 0.9);
        }

        .kl-tile-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 calc(0.5 * var(--u));
          text-align: center;
          font-size: clamp(8px, calc(1.42 * var(--u)), 11.5px);
          letter-spacing: 0.005em;
          line-height: 1.15;
          color: rgba(226, 230, 255, 0.86);
        }

        /* Der Abbinder bleibt der leise Schluss der Reihe. */
        .kl-tile-more .kl-tile-face {
          background: transparent;
          border-color: rgba(var(--tint), 0.3);
        }
        .kl-tile-more .kl-tile-text {
          color: rgba(206, 212, 255, 0.5);
          font-size: clamp(7.5px, calc(1.32 * var(--u)), 11px);
        }

        /* ---------------------------------------------------------------- */
        /*  Logo-Feld                                                        */
        /* ---------------------------------------------------------------- */

        .kl-badge {
          position: absolute;
          right: 0;
          width: calc(${LAYOUT.badge} * var(--u));
          top: calc(${LAYOUT.slots.agents} * var(--u));
          height: calc(
            ${LAYOUT.slots.llm - LAYOUT.slots.agents + LAYOUT.plate} * var(--u)
          );
          will-change: opacity;
        }

        /* Das Logo-Feld gehört ebenfalls zu dem, was SVH einzieht. */
        .kl-badge .kl-face {
          border-style: dashed;
          border-color: rgba(var(--tint), 0.72);
          background: rgba(var(--tint), 0.2);
          box-shadow: inset 0 0 calc(8 * var(--u)) rgba(var(--tint), 0.18);
        }

        .kl-badge .kl-mark {
          --c: rgb(var(--tint));
        }

        .kl-badge .kl-trail {
          background: linear-gradient(
            90deg,
            rgba(var(--tint), 0.5) 0%,
            rgba(var(--tint), 0.22) 34%,
            rgba(var(--tint), 0) 100%
          );
        }

        .kl-badge-mark {
          position: absolute;
          left: 27%;
          top: 29%;
          width: 54%;
          aspect-ratio: 1;
        }

        .kl-dot {
          position: absolute;
          border-radius: 999px;
          /* Helle Stufe derselben Markenfarbe, damit die Marke auf dem
             getönten Feld steht statt darin zu verschwinden. */
          background: #b9a5ff;
          opacity: 1;
          transform: translate(-50%, -50%);
          /* Exponentielles Ausklingen statt Nachfedern. Die Punkte kommen
             schnell heraus und legen sich ruhig hin. */
          transition:
            scale 0.46s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.3s ease;
        }

        /* GSAP setzt data-hidden auf dem Feld, die Punkte folgen gestaffelt. */
        .kl-badge[data-hidden="true"] .kl-dot {
          scale: 0;
          opacity: 0;
        }

        /* ---------------------------------------------------------------- */
        /*  Schimmer                                                         */
        /* ---------------------------------------------------------------- */

        .kl-shine {
          position: absolute;
          left: calc(-8 * var(--u));
          right: calc(-4 * var(--u));
          top: 0;
          height: calc(22 * var(--u));
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(
            180deg,
            rgba(91, 140, 255, 0) 0%,
            rgba(91, 140, 255, 0.12) 34%,
            rgba(185, 165, 255, 0.12) 62%,
            rgba(185, 165, 255, 0) 100%
          );
          will-change: transform, opacity;
        }

        /* Ohne Bewegung bleibt es beim flachen Grundzustand — dem fertigen
           Schema. Nichts weiter zu tun, --iso steht schon auf 0. */
      `}</style>
    </div>
  );
}
