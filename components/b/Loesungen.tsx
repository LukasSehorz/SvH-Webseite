import type { CSSProperties, ReactNode } from "react";
import { cta } from "@/app/copy";
import { loesungenB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Grad, stufe } from "@/components/b/ui";
import LoesungenBewegung from "@/components/b/LoesungenBewegung";
import { BildAgenten, BildAuftrag, BildBusiness, BildCrm, BildFulfilment, BildSendung, BildVoice, BildWhatsapp, BildWissen } from "@/components/b/LoesungenBilder";
import { STUFEN_FARBEN } from "@/components/b/Unendlich";
import FotoFenster from "./FotoFenster";

/* Lösungen als Bento-Raster (Vorbild: Aufbau und Bewegung der Apex-Sektion „Intelligente Automations“;
   Texte, Symbole und Abbildungen sind eigen). Sieben Karten aus Lukas' Pyramide, nach Stufe sortiert
   (1, 2, 2, 3, 4, 4, 4). Das Schild „Stufe 1 · Wissen“ trägt den Punkt in der Farbe der Stufe aus dem
   Unendlichkeitszeichen darüber. Jede Karte hat eine kleine, ruhige Endlos-Animation, die nur läuft,
   solange die Karte im Bild ist (LoesungenBewegung).
   Darunter zwei Beispiele aus der Logistik (27.10.2026): kleiner Zwischentitel, zwei gleiche Karten nebeneinander,
   damit Speditionen sich wiederfinden, ohne dass die Seite zur Logistik-Seite wird.
   Unter dem Raster eine kurze Zeile und der Knopf (wie am Ende der Kunden): am Handy sonst eine lange Strecke ohne Knopf. */

type Karte = (typeof loesungenB.karten)[number];
type UiAlle = {
  aufgaben?: string[];
  mitte?: string;
  programme?: string[];
  frage?: string;
  antwort?: string;
  quelle?: string;
  ki?: string;
  name?: string;
  aktiv?: string;
  regeln?: string[];
  auftrag?: string;
  schritte?: string[];
  hinweis?: string;
  kopf?: string;
  nachrichten?: { von: string; text: string }[];
  anruf?: string;
  agent?: string;
  status?: string[];
};

function Bild({ karte }: { karte: Karte }): ReactNode {
  const ui = karte.ui as UiAlle;
  switch (karte.id) {
    case "business":
      return <BildBusiness aufgaben={ui.aufgaben ?? []} />;
    case "crm":
      return <BildCrm mitte={ui.mitte ?? ""} programme={ui.programme ?? []} />;
    case "wissen":
      return <BildWissen frage={ui.frage ?? ""} antwort={ui.antwort ?? ""} quelle={ui.quelle ?? ""} ki={ui.ki ?? ""} />;
    case "agenten":
      return <BildAgenten name={ui.name ?? ""} aktiv={ui.aktiv ?? ""} regeln={ui.regeln ?? []} />;
    case "fulfilment":
      return <BildFulfilment auftrag={ui.auftrag ?? ""} schritte={ui.schritte ?? []} hinweis={ui.hinweis ?? ""} />;
    case "whatsapp":
      return <BildWhatsapp kopf={ui.kopf ?? ""} nachrichten={ui.nachrichten ?? []} />;
    case "voice":
      return <BildVoice anruf={ui.anruf ?? ""} agent={ui.agent ?? ""} status={ui.status ?? []} />;
    default:
      return null;
  }
}

type LgKarte = (typeof loesungenB.logistik.karten)[number];
type UiLogistik = {
  mail?: string;
  datei?: string;
  kopf?: string;
  felder?: { name: string; wert: string }[];
  fertig?: string;
  frage?: string;
  antwort?: string;
  schritte?: string[];
  belegArt?: string;
  belegKurz?: string;
  zugeordnet?: string;
  belegSchritte?: string[];
};

function LgBild({ karte }: { karte: LgKarte }): ReactNode {
  const ui = karte.ui as UiLogistik;
  switch (karte.id) {
    case "auftrag":
      return (
        <BildAuftrag
          mail={ui.mail ?? ""}
          datei={ui.datei ?? ""}
          kopf={ui.kopf ?? ""}
          felder={ui.felder ?? []}
          fertig={ui.fertig ?? ""}
        />
      );
    case "sendung":
      return (
        <BildSendung
          frage={ui.frage ?? ""}
          antwort={ui.antwort ?? ""}
          schritte={ui.schritte ?? []}
          datei={ui.datei ?? ""}
          belegArt={ui.belegArt ?? ""}
          belegKurz={ui.belegKurz ?? ""}
          zugeordnet={ui.zugeordnet ?? ""}
          belegSchritte={ui.belegSchritte ?? []}
        />
      );
    default:
      return null;
  }
}

/** Kurze Wörter mit Bindestrich (E-Mails) nicht am Bindestrich umbrechen */
function OhneTrennung({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S+-\S+)/).map((teil, i) =>
        i % 2 ? (
          <span key={i} className="lo-nw">
            {teil}
          </span>
        ) : (
          teil
        ),
      )}
    </>
  );
}

/* Einblende-Staffel je Reihe im Desktop-Raster (2 · 3 · 2 Karten: wissen crm · fulfilment business agenten · voice whatsapp) */
const STAFFEL = [0, 1, 0, 1, 2, 0, 1];

export default function Loesungen() {
  const t = loesungenB;
  const lg = t.logistik;
  return (
    <section className="sb lo" id="loesungen" aria-labelledby="loesungen-titel">
      <div className="sb-wrap">
        <div className="b-kopf b-kopf--mitte lo-kopf" data-rv="">
          <p className="b-label">{t.label}</p>
          <h2 className="b-h2" id="loesungen-titel">
            <Grad text={t.titel} />
          </h2>
          <p className="b-lead">{t.text}</p>
        </div>

        <ul className="lo-raster">
          {t.karten.map((k, i) => (
            <li key={k.id} className={`lo-karte lo-karte--${k.id}`} data-rv="" style={stufe(STAFFEL[i] ?? 0)}>
              <div className="lo-bild" aria-hidden="true">
                <Bild karte={k} />
              </div>
              <div className="lo-text">
                <span className="lo-stufe" style={{ "--stufe": STUFEN_FARBEN[k.stufe - 1] } as CSSProperties}>
                  {t.stufe(k.stufe)}
                </span>
                <h3 className="lo-titel">{k.titel}</h3>
                <p className="lo-p">
                  <OhneTrennung text={k.text} />
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Zwei Beispiele aus der Logistik: Zwischentitel, dann zwei Karten in derselben Machart */}
        <div className="lo-lg" role="group" aria-labelledby="loesungen-logistik">
          <div className="lo-lg-kopf" data-rv="">
            <h3 className="lo-lg-label" id="loesungen-logistik">
              {lg.label}
            </h3>
            <p className="lo-lg-text">{lg.text}</p>
          </div>
          <ul className="lo-lg-raster">
            {lg.karten.map((k, i) => (
              <li key={k.id} className={`lo-karte lo-karte--${k.id}`} data-rv="" style={stufe(i)}>
                <div className="lo-bild" aria-hidden="true">
                  <LgBild karte={k} />
                </div>
                <div className="lo-text">
                  <span className="lo-stufe" style={{ "--stufe": STUFEN_FARBEN[k.stufe - 1] } as CSSProperties}>
                    {t.stufe(k.stufe)}
                  </span>
                  <h4 className="lo-titel">{k.titel}</h4>
                  <p className="lo-p">
                    <OhneTrennung text={k.text} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Übergang zu den Ergebnissen: Foto der Gründer neben der Frage „Welche davon lohnt sich bei dir?“ */}
        <div className="lo-ende lo-ende--foto" data-rv="">
          <FotoFenster className="lo-foto" src={t.foto} alt={t.fotoAlt} sizes="(max-width: 899px) 100vw, 560px" />
          <div className="lo-ende-text">
            {/* genau zwei Zeilen: Frage, dann Antwort */}
            <p className="lo-ende-zeile">
              {t.ctaZeile.split(/(?<=\?) /).map((z) => (
                <span key={z} className="lo-ende-z">
                  {z}
                </span>
              ))}
            </p>
            <p className="lo-ende-satz">{t.ctaText}</p>
            <Cta href="#termin">{cta.main}</Cta>
          </div>
        </div>
      </div>
      <LoesungenBewegung />
    </section>
  );
}
