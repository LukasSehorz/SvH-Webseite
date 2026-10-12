import Image from "next/image";
import { trustB } from "@/app/copy-b";
import { LOGOS } from "./logos";

/* Trust-Bar direkt unter dem Hero: vier Fakten im Markenverlauf (Lila früh im Verlauf).
   Steht ein Logo dabei, hängt das letzte Wort („bei“) fest am Logo: nie „bei“ allein in einer Zeile. */
export default function TrustBar() {
  return (
    <section className="tb" aria-label="Fakten über SvH Consulting">
      <ul className="tb-liste shell">
        {trustB.map((t) => {
          const logo = t.logo ? LOGOS[t.logo] : undefined;
          const worte = t.small.split(" ");
          const letztes = logo ? worte.pop() : undefined;
          return (
            <li key={t.big} className="tb-punkt">
              <span className="tb-big">{t.big}</span>
              <span className="tb-small">
                {worte.join(" ")}
                {logo ? (
                  <>
                    {" "}
                    <span className="tb-mit-logo">
                      {letztes}
                      <Image className="tb-logo" src={logo.src} alt="Estera GmbH" width={logo.w} height={logo.h} />
                    </span>
                  </>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
