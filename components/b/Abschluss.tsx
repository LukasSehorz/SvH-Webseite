import { cta } from "@/app/copy";
import { abschlussB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Grad, Haken } from "./ui";

/* Abschluss: der letzte Aufruf vor der Fußzeile (Baulig: letzter Aufruf). Bewusst das Gegenstück
   zum schwarzen Kasten „Überzeuge dich selbst“: hell, zentriert, ruhig, in der Kartenart ab der Lösung.
   Markenverlauf nur im Verlaufswort und im Knopf; die Haken grün wie bei „Für wen“.
   Der Knopf öffnet die Anmeldung (#termin). */
export default function Abschluss() {
  return (
    <section className="ab" id="abschluss" aria-labelledby="ab-titel">
      <div className="ab-kasten" data-rv="">
        <p className="b-label">{abschlussB.label}</p>
        <h2 className="b-h2 ab-titel" id="ab-titel">
          <Grad text={abschlussB.titel} />
        </h2>
        <p className="b-lead ab-text">{abschlussB.text}</p>
        <ul className="ab-punkte">
          {abschlussB.punkte.map((p) => (
            <li key={p}>
              <Haken size={22} farbe="#16a34a" />
              {p}
            </li>
          ))}
        </ul>
        <Cta href="#termin" className="ab-cta">
          {cta.main}
        </Cta>
      </div>
    </section>
  );
}
