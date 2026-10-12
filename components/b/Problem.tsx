import { cta } from "@/app/copy";
import { problemB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Grad, Kreuz, stufe } from "./ui";

/* Problem als Schaubild, von oben nach unten (auch am Desktop, damit es mittig und ausgewogen steht):
   zwei Studien-Kästen nebeneinander → geschwungene Linien laufen zusammen → „Was passiert, wenn du
   nichts änderst“ → Knopf. Die Lösung mit den Gewinnen folgt in der nächsten Sektion (Zahnräder).
   Bewusst schwarz-weiß im Comic-Stil („die graue Welt“): der einzige Abschnitt der Seite mit dicken
   schwarzen Rahmen, gemalten Pfeilen und Strichmännchen. Farbe nur bei den Säulen (rot/grün) und den roten X. */

const s1 = problemB.studie1;
const s2 = problemB.studie2;
const [nutzen, richtig] = s1.balken;

/** Zwei Säulen, die von unten nach oben wachsen */
function Saeulen() {
  return (
    <div className="pv-chart" role="img" aria-label={`${nutzen.wert} Prozent ${nutzen.label}, aber nur ${richtig.wert} Prozent ${richtig.label}.`}>
      <p className="pv-vergleich" aria-hidden="true">
        <span className="pv-vergleich-rot">{nutzen.wert}&#8239;%</span>
        <span className="pv-vergleich-zeichen">≠</span>
        <span className="pv-vergleich-gruen">{richtig.wert}&#8239;%</span>
      </p>
      <div className="pv-chart-saeulen" aria-hidden="true">
        {s1.balken.map((b, i) => (
          <div key={b.label} className="pv-saeule-spalte">
            <div className={`pv-saeule pv-saeule--${b.farbe}`} style={{ "--h": `${b.wert}%`, "--d": i } as React.CSSProperties} />
            <span className="pv-saeule-label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ein Männchen im Comic-Stil, schwarz-weiß */
function Figur({ weg = false }: { weg?: boolean }) {
  return (
    <span className={`pv-figur${weg ? " pv-figur--weg" : ""}`}>
      <svg viewBox="0 0 60 84" width="60" height="84" aria-hidden="true">
        <circle cx="30" cy="20" r="13" fill="#fff" stroke="#1b1640" strokeWidth="3" />
        <path d="M25 18.5h.01M35 18.5h.01" stroke="#1b1640" strokeWidth="4" strokeLinecap="round" />
        <path d={weg ? "M25 27q5-4 10 0" : "M25 24.5q5 5 10 0"} fill="none" stroke="#1b1640" strokeWidth="2.6" strokeLinecap="round" />
        {/* Körper in den Markenfarben (Verlauf aus SvgDefsB), der durchgestrichene bleibt hell */}
        <path d="M10 80c0-17 9-27 20-27s20 10 20 27z" fill={weg ? "#fff" : "url(#b-verlauf)"} stroke="#1b1640" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      {weg ? (
        <svg className="pv-figur-x" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
          <path d="M10 10l40 40M50 10L10 50" stroke="#e5262f" strokeWidth="7" strokeLinecap="round" />
        </svg>
      ) : null}
    </span>
  );
}

/** Zwei geschwungene Linien laufen von den beiden Studien zusammen und zeigen auf die Folgen */
function Zusammenfuehrung() {
  return (
    <div className="pv-verbinder" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M25 0 C 25 60, 50 40, 50 92" />
        <path d="M75 0 C 75 60, 50 40, 50 92" />
      </svg>
      <span className="pv-pfeilspitze" />
    </div>
  );
}

export default function Problem() {
  return (
    <section className="sb pv" id="problem" aria-labelledby="pv-titel">
      <div className="pv-wrap">
        <div className="pv-kopf" data-rv="">
          <p className="b-label">{problemB.label}</p>
          <h2 className="b-h2" id="pv-titel">
            <Grad text={problemB.titel} />
          </h2>
          <p className="b-lead">{problemB.text}</p>
        </div>

        <div className="pv-grid">
          <div className="pv-boxen">
            <article className="pv-box" data-rv="">
              <Saeulen />
              <p className="pv-quelle">
                {problemB.quelleLabel}:{" "}
                <a href={s1.href} target="_blank" rel="noopener noreferrer">
                  {s1.quelle}
                </a>
              </p>
            </article>

            <article className="pv-box" data-rv="" style={stufe(1)}>
              <h3 className="pv-box-titel">{s2.titel}</h3>
              <p className="pv-box-unter">{s2.unter}</p>
              <div className="pv-figuren" role="img" aria-label="Von vier Mitarbeitern ist einer durchgestrichen.">
                <Figur />
                <Figur />
                <Figur />
                <Figur weg />
              </div>
              <p className="pv-box-fazit">{s2.fazit}</p>
              <p className="pv-quelle">
                {problemB.quelleLabel}:{" "}
                <a href={s2.href} target="_blank" rel="noopener noreferrer">
                  {s2.quelle}
                </a>
              </p>
            </article>
          </div>

          <Zusammenfuehrung />

          <div className="pv-folgen pv-kasten" data-rv="" style={stufe(2)}>
            <h3 className="pv-kasten-titel">{problemB.folgen.titel}</h3>
            <ul>
              {problemB.folgen.punkte.map((p) => (
                <li key={p}>
                  <span className="pv-folgen-x">
                    <Kreuz size={22} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pv-cta" data-rv="" style={stufe(3)}>
          <Cta href="#termin">{cta.main}</Cta>
        </div>
      </div>
    </section>
  );
}
