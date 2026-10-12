import { company } from "@/app/content";
import { fragenB } from "@/app/copy-b";
import { Kopf, Symbol } from "./ui";

/* Fragen: schlichte Aufklapper (details/summary), funktionieren auch ohne JavaScript. */
export default function Fragen() {
  return (
    <section className="sb" id="fragen" aria-labelledby="fragen-titel">
      <div className="sb-wrap fr-grid">
        <Kopf label={fragenB.label} title={fragenB.title} id="fragen-titel">
          <p className="fr-noch">{fragenB.nochFragen}</p>
          <a className="fr-tel" href={`tel:${company.phoneHref}`}>
            <Symbol name="telefon" size={20} />
            {company.phone}
          </a>
        </Kopf>
        <div className="fr-liste" data-rv="">
          {fragenB.items.map((f) => (
            <details key={f.q} className="fr-item">
              <summary className="fr-frage">
                {f.q}
                <span className="fr-plus" aria-hidden="true" />
              </summary>
              <p className="fr-antwort">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
