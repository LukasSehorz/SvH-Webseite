import Image from "next/image";
import { cta } from "@/app/copy";
import { workshopB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import Garantie from "./Garantie";
import { Grad, Haken, stufe } from "./ui";

/* Fahrplan mit Garantie (nach dem Masterplan, vor „Überzeuge dich selbst“):
   drei helle Schritt-Karten mit Zeitmarke statt Ziffer (Dein Termin / Nach 48 Std. / Danach; die Ziffern 0–4
   gehören in den Leistungen zu den Stufen), daneben das Bild (der Preisanker steht seit Runde 3 im Masterplan),
   darunter die Geld-zurück-Garantie (Garantie.tsx), dann Hinweis und Knopf als lautestes Element.
   Reihenfolge am Handy wie im HTML: Kopf, Schritte, Bild, Garantie, Knopf.
   Die früheren Detail-Abschnitte (Automatisierung, Assistenten, Wissen) ersetzt seit 06.10.2026 Loesungen.tsx. */

/** Pfeil nach unten zwischen zwei Schritten */
function PfeilRunter() {
  return (
    <span className="wf-pfeil" aria-hidden="true">
      <svg viewBox="0 0 24 34" width="16" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v27M6 24l6 6 6-6" />
      </svg>
    </span>
  );
}

export function Workshop() {
  return (
    <section className="sb sb--workshop" id="workshop" aria-labelledby="workshop-titel">
      <div className="sb-wrap ws-grid">
        <div className="ws-links">
          <div className="b-kopf" data-rv="">
            <p className="b-label">{workshopB.label}</p>
            <h2 className="b-h2" id="workshop-titel">
              <Grad text={workshopB.titel} />
            </h2>
            <p className="b-lead">{workshopB.text}</p>
          </div>

          <ol className="wf">
            {workshopB.schritte.map((s, i) => (
              <li key={s.titel} className="wf-schritt" data-rv="">
                {i > 0 ? <PfeilRunter /> : null}
                <div className={`wf-karte${i === 0 ? " wf-karte--haupt" : ""}`}>
                  <div className="wf-kopf">
                    <span className="wf-wann">{s.wann}</span>
                    {s.tag ? <span className="wf-tag">{s.tag}</span> : null}
                    {s.preis ? <span className="wf-preis">{s.preis}</span> : null}
                  </div>
                  <h3 className="wf-titel">{s.titel}</h3>
                  <p className="wf-text">{s.text}</p>
                  {s.punkte.length ? (
                    <ul className="wf-punkte">
                      {s.punkte.map((p) => (
                        <li key={p}>
                          <Haken size={18} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="ws-bild" data-rv="" style={stufe(1)}>
          {workshopB.bild ? (
            <Image src={workshopB.bild} alt="" fill sizes="(max-width: 999px) 100vw, 560px" />
          ) : (
            <div className="ws-bild-platzhalter" aria-hidden="true">
              <Image src="/logo/svh-bild-480.webp" alt="" width={96} height={156} />
              <span>{workshopB.bildFolgt}</span>
            </div>
          )}
        </div>

        <Garantie />

        <div className="wf-ende" data-rv="">
          <p>{workshopB.hinweis}</p>
          <Cta href="#termin">{cta.main}</Cta>
        </div>
      </div>
    </section>
  );
}
