import { fuerWenB } from "@/app/copy-b";
import { Grad, Haken, Kreuz, stufe } from "./ui";

/* Für wen: ehrliche Ja/Nein-Liste vor den Fragen (Baulig: „Für wen ist das?“).
   Zwei helle Karten in der Kartenart ab der Lösung (feiner Rand, weicher Schatten):
   links grüne Haken, rechts ruhige graue Kreuze, damit das Nein nicht schreit. Am Handy untereinander. */
export default function FuerWen() {
  const { ja, nein } = fuerWenB;
  return (
    <section className="sb fw" id="fuer-wen" aria-labelledby="fw-titel">
      <div className="sb-wrap">
        <div className="b-kopf b-kopf--mitte" data-rv="">
          <p className="b-label">{fuerWenB.label}</p>
          <h2 className="b-h2" id="fw-titel">
            <Grad text={fuerWenB.titel} />
          </h2>
        </div>

        <div className="fw-grid">
          <div className="fw-kasten fw-kasten--ja" data-rv="">
            <h3 className="fw-kasten-titel">
              <span className="fw-marke fw-marke--ja" aria-hidden="true">
                <Haken size={18} farbe="#16a34a" />
              </span>
              {ja.titel}
            </h3>
            <ul className="fw-liste">
              {ja.punkte.map((p) => (
                <li key={p}>
                  <span className="fw-symbol fw-symbol--ja" aria-hidden="true">
                    <Haken size={22} farbe="#16a34a" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="fw-kasten fw-kasten--nein" data-rv="" style={stufe(1)}>
            <h3 className="fw-kasten-titel">
              <span className="fw-marke fw-marke--nein" aria-hidden="true">
                <Kreuz size={18} />
              </span>
              {nein.titel}
            </h3>
            <ul className="fw-liste">
              {nein.punkte.map((p) => (
                <li key={p}>
                  <span className="fw-symbol fw-symbol--nein" aria-hidden="true">
                    <Kreuz size={20} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
