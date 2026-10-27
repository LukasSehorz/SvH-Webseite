import type { CSSProperties, ReactNode } from "react";
import { cta } from "@/app/copy";
import { problemB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Grad, stufe } from "./ui";

/* Problem als ruhiger Befund (Runde 4, 27.10.2026, nach Lukas: „hochwertig und seriös, kein Comic“).
   Zwei Studien-Karten nebeneinander, darunter die Folgen über die volle Breite, dann der Knopf.
   Beide Studien sprechen dieselbe Bildsprache: Einheiten statt Säulen.
   - McKinsey: 100 Punkte, 1 Punkt = 1 % der befragten Unternehmen (88 grau-blau, davon 7 in Markenblau)
   - Atlassian: eine 40-Stunden-Woche als 40 Striche, die letzten 10 Stunden gedämpft rot
   Gedämpftes Rot steht für Verlust, Markenblau für „richtig gemacht“. Stile: styles/problem.css */

const s1 = problemB.studie1;
const s2 = problemB.studie2;

type Ton = "blau" | "grau" | "rot";

/** Große Zahl mit kleiner Einheit, darunter die Beschriftung (mit Farbmarke = Legende zum Schaubild) */
function Wert({ wert, einheit, label, ton, marke }: { wert: number; einheit: string; label: string; ton?: Ton; marke?: Ton }) {
  return (
    <p className={`pb-wert${ton ? ` pb-wert--${ton}` : ""}`}>
      {/* Tabellenziffern: eine einzelne Ziffer hat rechts Luft, die Einheit rückt dann etwas näher */}
      <span className={`pb-zahl${wert < 10 ? " pb-zahl--einstellig" : ""}`}>
        {wert}
        <span className="pb-einheit">{einheit}</span>
      </span>
      <span className="pb-wert-label">
        {marke ? <span className={`pb-marke pb-marke--${marke}`} /> : null}
        {label}
      </span>
    </p>
  );
}

/** 100 Punkte, spaltenweise gefüllt (liest sich von links nach rechts wie ein Balken): Handy 5 × 20, ab Tablet 4 × 25 */
function Punkte() {
  return (
    <div
      className="pb-schaubild"
      role="img"
      aria-label={`Von 100 befragten Unternehmen nutzen ${s1.nutzen.wert} KI. Nur ${s1.richtig.wert} haben sie richtig eingeführt.`}
    >
      <div className="pb-schaubild-kopf" aria-hidden="true">
        <span>{s1.raster}</span>
      </div>
      <div className="pb-punkte" aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => {
          const art = i < s1.richtig.wert ? " pb-p--blau" : i < s1.nutzen.wert ? " pb-p--grau" : "";
          return <span key={i} className={`pb-p${art}`} style={{ "--i": i } as CSSProperties} />;
        })}
      </div>
    </div>
  );
}

/** Arbeitswoche: 5 Tage × 8 Striche, je Strich eine Stunde. Die letzten 10 Stunden sind Suchen. */
function Woche() {
  const suchenAb = 40 - s2.stunden.wert;
  return (
    <div className="pb-schaubild" role="img" aria-label={`Von einer 40-Stunden-Woche gehen ${s2.stunden.wert} Stunden fürs Suchen drauf.`}>
      <div className="pb-schaubild-kopf" aria-hidden="true">
        <span>{s2.woche}</span>
        <span className="pb-schaubild-rot">{s2.suchen}</span>
      </div>
      <div className="pb-tage" aria-hidden="true">
        {s2.tage.map((tag, t) => (
          <div key={tag} className="pb-tag">
            <div className="pb-stunden">
              {Array.from({ length: 8 }, (_, h) => {
                const n = t * 8 + h;
                const suchen = n >= suchenAb;
                return (
                  <span
                    key={h}
                    className={`pb-h${suchen ? " pb-h--suchen" : ""}`}
                    style={suchen ? ({ "--c": n - suchenAb } as CSSProperties) : undefined}
                  />
                );
              })}
            </div>
            <span className="pb-tag-name">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quelle({ name, href }: { name: string; href: string }) {
  return (
    <p className="pb-quelle">
      <span className="pb-quelle-label">{problemB.quelleLabel}:</span>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {name}
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M5.5 4.5h6v6M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only"> (öffnet in neuem Fenster)</span>
      </a>
    </p>
  );
}

/* feine Linien-Symbole für die Folgen */
const SYMBOLE: Record<string, ReactNode> = {
  uhr: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  eingang: (
    <>
      <path d="M4 13.5h4.2l1.4 2.5h4.8l1.4-2.5H20" />
      <path d="M6.2 5.5h11.6L20 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-4.5z" />
    </>
  ),
  warnung: (
    <>
      <path d="M10.3 4.9a2 2 0 0 1 3.4 0l6.6 11.5a2 2 0 0 1-1.7 3H5.4a2 2 0 0 1-1.7-3z" />
      <path d="M12 9.5v3.8M12 16.4v.1" />
    </>
  ),
  trend: (
    <>
      <path d="M4 17l5.5-5.5 4 4L20 9" />
      <path d="M15 9h5v5" />
    </>
  ),
};

export default function Problem() {
  return (
    <section className="sb pb" id="problem" aria-labelledby="pb-titel">
      <div className="pb-wrap">
        <div className="pb-kopf" data-rv="">
          <p className="b-label">{problemB.label}</p>
          <h2 className="b-h2" id="pb-titel">
            <Grad text={problemB.titel} />
          </h2>
          <p className="b-lead">{problemB.text}</p>
        </div>

        <div className="pb-raster">
          <article className="pb-karte" data-rv="">
            <h3 className="sr-only">{s1.titel}</h3>
            <div className="pb-werte" aria-hidden="true">
              <Wert wert={s1.nutzen.wert} einheit="%" label={s1.nutzen.label} marke="grau" />
              <Wert wert={s1.richtig.wert} einheit="%" label={s1.richtig.label} ton="blau" marke="blau" />
            </div>
            <Punkte />
            <p className="pb-fazit pb-fazit--blau pb-ab-tablet">{s1.fazit}</p>
            <Quelle name={s1.quelle} href={s1.href} />
          </article>

          <article className="pb-karte pb-karte--woche" data-rv="" style={stufe(1)}>
            <h3 className="sr-only">{s2.titel}</h3>
            <div className="pb-werte" aria-hidden="true">
              <Wert wert={s2.stunden.wert} einheit={s2.stunden.einheit} label={s2.stunden.label} ton="rot" marke="rot" />
              <Wert wert={s2.anteil.wert} einheit={s2.anteil.einheit} label={s2.anteil.label} />
            </div>
            <Woche />
            <p className="pb-fazit">{s2.fazit}</p>
            <Quelle name={s2.quelle} href={s2.href} />
          </article>

          <div className="pb-folgen" data-rv="" style={stufe(2)}>
            <h3 className="pb-folgen-titel">{problemB.folgen.titel}</h3>
            <ul className="pb-folgen-liste">
              {problemB.folgen.punkte.map((p) => (
                <li key={p.text}>
                  <span className="pb-symbol" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {SYMBOLE[p.symbol]}
                    </svg>
                  </span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pb-cta" data-rv="" style={stufe(3)}>
          <Cta href="#termin">{cta.main}</Cta>
        </div>
      </div>
    </section>
  );
}
