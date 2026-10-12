import { cta } from "@/app/copy";
import { masterplanB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import MasterplanDokument from "./MasterplanDokument";
import { Grad, Haken, stufe } from "./ui";

/* KI-Masterplan (neu seit 06.10.2026, Lukas: „muss deutlich hochwertiger aussehen“).
   Dunkle Bühne über die volle Breite mit weichem Licht von oben, Kopf mittig, darunter der Plan als gezeichnetes
   Druckstück (MasterplanDokument: Deckblatt mit Siegel, drei Seiten aufgefächert). Die drei Punkte sind echter Text:
   am Desktop Anmerkungen links und rechts mit feiner Linie auf die Nummer im Dokument, sonst eine nummerierte Liste
   unter dem Dokument. Darunter Wert (1.099 € → 0 €), Knopf und Mikrozeile.
   Bewegung einmalig beim Erscheinen (styles/masterplan.css): Seiten fächern auf, Balken wachsen, Linien zeichnen sich.
   Ohne JavaScript und bei „Bewegung reduzieren“ steht der fertige Zustand da. */
export default function Masterplan() {
  const d = masterplanB;
  return (
    <section className="mp" id="masterplan" aria-labelledby="mp-titel">
      <div className="mp-wrap">
        <header className="mp-kopf" data-rv="">
          <p className="b-label mp-label">{d.label}</p>
          <h2 className="mp-titel" id="mp-titel">
            <Grad text={d.titel} />
          </h2>
          <p className="mp-unter">{d.unter}</p>
          <p className="mp-intro">{d.intro}</p>
        </header>

        {/* Reihenfolge auf einen Blick: jede Stufe hat ihre Farbe, dieselbe wie auf ihrer Seite im Dokument */}
        <ol className="mp-reihe" data-rv="" aria-label="Die drei Teile deines Masterplans der Reihe nach">
          {d.punkte.map((p, i) => (
            <li key={p.titel} className={`mp-reihe-schritt mp-farbe--${i + 1}`}>
              <span className="mp-reihe-nr" aria-hidden="true">
                {i + 1}
              </span>
              <span className="mp-reihe-titel">
                <span className="mp-reihe-wann">{d.reihe[i]}</span>
                {p.titel}
              </span>
              {i < d.punkte.length - 1 ? (
                <svg className="mp-reihe-pfeil" viewBox="0 0 40 16" width="40" height="16" aria-hidden="true">
                  <path d="M2 8h33M29 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mp-buehne" data-rv="">
          <figure className="mp-figur">
            <MasterplanDokument />
            <figcaption className="mp-beispiel">{d.beispiel}</figcaption>
          </figure>
          <ol className="mp-punkte">
            {d.punkte.map((p, i) => (
              <li key={p.titel} className={`mp-punkt mp-punkt--${i + 1} mp-farbe--${i + 1}`} style={stufe(i)}>
                <div className="mp-punkt-text">
                  <p className="mp-punkt-titel">
                    <span className="mp-punkt-nr" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{p.titel}</span>
                  </p>
                  <p className="mp-punkt-satz">{p.text}</p>
                </div>
                <span className="mp-punkt-linie" aria-hidden="true">
                  <span className="mp-punkt-ziel" />
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mp-wert" data-rv="">
          <p className="mp-wert-label">{d.preis.label}</p>
          <p className="mp-wert-zeile">
            <del className="mp-wert-alt">
              <span className="sr-only">statt </span>
              {d.preis.alt}
            </del>
            <span className="mp-wert-neu">{d.preis.neu}</span>
          </p>
          <p className="mp-wert-text">{d.preis.text}</p>
          <Cta href="#termin" className="mp-cta">
            {cta.main}
          </Cta>
          <ul className="mp-mikro">
            {d.mikro.map((m) => (
              <li key={m}>
                <Haken size={16} farbe="#a99cff" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
