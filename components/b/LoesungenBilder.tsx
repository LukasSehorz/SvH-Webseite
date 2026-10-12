import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";

/* Kleine, selbst gezeichnete Oberflächen für die Lösungs-Karten (nur Dekoration, aria-hidden am Rahmen).
   Ohne Bewegung zeigen alle den fertigen Endzustand; die Abläufe stehen in app/styles/loesungen.css. */

const v = (o: Record<string, string | number>) => o as CSSProperties;

/* ------------------------------------------------------------ Linien-Symbole (eigene) */

const PFADE: Record<string, ReactNode> = {
  dokument: (
    <>
      <path d="M6.5 3.5h7.5l4 4v13h-11.5z" />
      <path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" />
    </>
  ),
  senden: (
    <>
      <path d="M20.5 3.5L3.5 10.5l7 3 3 7z" />
      <path d="M20.5 3.5l-10 10" />
    </>
  ),
  glocke: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  bericht: (
    <>
      <path d="M4 20h16" />
      <path d="M7.5 16.5v-5M12 16.5V7M16.5 16.5v-8" />
    </>
  ),
  laeuft: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" />
      <path d="M19.5 4v4.5H15" />
    </>
  ),
  haken: <path d="M5 12.5l4.3 4.3L19 7.2" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  kalender: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  webseite: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9h17M6.5 7h.01M9 7h.01" />
    </>
  ),
  telefon: <path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 6a2 2 0 0 1 2-2z" />,
  beleg: (
    <>
      <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
    </>
  ),
  tabelle: (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16M4 14.5h16M10 4.5v15" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M3 18.5h18" />
    </>
  ),
  suche: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5L20 20" />
    </>
  ),
  funke: <path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z" />,
  paket: (
    <>
      <path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5l8.5 4 8.5-4M12 11.5v9" />
    </>
  ),
  zurueck: <path d="M14.5 5.5L8 12l6.5 6.5" />,
};

function Ico({ n, s = 16, w = 1.8 }: { n: string; s?: number; w?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PFADE[n]}
    </svg>
  );
}

/** Kreis, der sich abhakt (Status, Schritte) */
function Abhaken({ nr, klasse }: { nr: number; klasse: string }) {
  return (
    <span className={`lo-kreis ${klasse}`}>
      <span className={`lo-kreis-ok lo-ok-${nr}`}>
        <Ico n="haken" s={11} w={2.6} />
      </span>
    </span>
  );
}

/* ------------------------------------------------------------ 1 · Business-Automatisierung */

const AUFGABEN_SYMBOLE = ["dokument", "senden", "glocke", "bericht"];

export function BildBusiness({ aufgaben }: { aufgaben: string[] }) {
  return (
    <ul className="lo-bz">
      {aufgaben.map((t, i) => (
        <li key={t} className="lo-bz-chip lo-glas">
          <span className="lo-bz-ico">
            <Ico n={AUFGABEN_SYMBOLE[i % AUFGABEN_SYMBOLE.length]} s={15} />
          </span>
          <span className="lo-bz-name">{t}</span>
          <span className="lo-bz-status">
            <span className="lo-bz-lauf">
              <Ico n="laeuft" s={15} w={2} />
            </span>
            <span className={`lo-bz-ok lo-ok-${(i % 4) + 1}`}>
              <Ico n="haken" s={11} w={2.8} />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ 2 · CRM: Programme schweben um die Mitte */

/* x in Prozent der Bildbreite (cqw), y in px; s = schmale Karte, b = breite Karte,
   xm/ym = Handy (niedrigere Bildfläche: die drei Reihen rücken zusammen, die mittlere etwas nach außen) */
const CRM_ORTE = [
  { n: "mail", xs: -25, ys: -62, xm: -24, ym: -57, xb: -31, yb: -36 },
  { n: "kalender", xs: 25, ys: -62, xm: 24, ym: -57, xb: -16, yb: -66 },
  { n: "webseite", xs: -37, ys: 2, xm: -39, ym: 0, xb: -23, yb: 56 },
  { n: "telefon", xs: 37, ys: 2, xm: 39, ym: 0, xb: 16, yb: -62 },
  { n: "beleg", xs: -25, ys: 66, xm: -24, ym: 57, xb: 31, yb: -24 },
  { n: "tabelle", xs: 25, ys: 66, xm: 24, ym: 57, xb: 22, yb: 56 },
];

export function BildCrm({ mitte, programme }: { mitte: string; programme: string[] }) {
  return (
    <div className="lo-crm">
      <div className="lo-crm-buehne">
        {programme.map((p, i) => {
          const o = CRM_ORTE[i % CRM_ORTE.length];
          return (
            <div key={p} className="lo-crm-app" style={v({ "--xs": o.xs, "--ys": o.ys, "--xm": o.xm, "--ym": o.ym, "--xb": o.xb, "--yb": o.yb, "--i": i })}>
              <span className="lo-crm-linie">
                <span className="lo-crm-puls" />
              </span>
              <span className="lo-crm-schwebe">
                <span className="lo-crm-kachel lo-glas">
                  <Ico n={o.n} s={18} />
                </span>
                <span className="lo-crm-label">{p}</span>
              </span>
            </div>
          );
        })}
        <div className="lo-crm-mitte">
          <Ico n="laptop" s={24} w={1.7} />
          <span>{mitte}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 3 · Wissensdatenbank: Frage tippt sich ein */

function Tippen({ text }: { text: string }) {
  const woerter = text.split(" ");
  let n = 0;
  return (
    <>
      {woerter.map((w, wi) => {
        const wort = (
          <span className="lo-wi-wort">
            {Array.from(w).map((z) => {
              const i = n++;
              return (
                <span key={i} className="lo-wi-z" style={v({ "--i": i })}>
                  {z}
                </span>
              );
            })}
          </span>
        );
        n++; // das Leerzeichen braucht auch einen Anschlag
        return (
          <Fragment key={wi}>
            {wort}
            {wi < woerter.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
}

export function BildWissen({ frage, antwort, quelle, ki }: { frage: string; antwort: string; quelle: string; ki: string }) {
  // Anschlag in ms: höchstens 35, damit jede Frage in gut 1,6 s fertig getippt ist
  const takt = Math.min(35, Math.floor(1650 / Math.max(1, frage.length)));
  return (
    <div className="lo-wi">
      <div className="lo-wi-fenster lo-glas">
        <div className="lo-wi-feld">
          <span className="lo-wi-lupe">
            <Ico n="suche" s={15} w={2} />
          </span>
          <p className="lo-wi-frage" style={v({ "--t": takt })}>
            <Tippen text={frage} />
          </p>
        </div>
        <div className="lo-wi-platz">
          <span className="lo-wi-skelett">
            <i />
            <i />
            <i />
          </span>
          <span className="lo-wi-denkt">
            <i />
            <i />
            <i />
          </span>
          <div className="lo-wi-antwort">
            <p className="lo-wi-ki">
              <Ico n="funke" s={12} w={2} />
              {ki}
            </p>
            <p className="lo-wi-text">{antwort}</p>
            <p className="lo-wi-quelle">
              <Ico n="dokument" s={12} />
              {quelle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 4 · KI-Agent: Schalter gehen nacheinander an */

export function BildAgenten({ name, aktiv, regeln }: { name: string; aktiv: string; regeln: string[] }) {
  return (
    <div className="lo-ag">
      <div className="lo-ag-karte lo-fenster">
        <div className="lo-ag-kopf">
          <span className="lo-ag-avatar lo-glas">
            <Ico n="funke" s={15} w={2} />
          </span>
          <span className="lo-ag-name">{name}</span>
          <span className="lo-ag-aktiv">
            <i />
            {aktiv}
          </span>
        </div>
        <ul className="lo-ag-liste">
          {regeln.map((r, i) => (
            <li key={r} className="lo-ag-zeile">
              <span className="lo-ag-regel">{r}</span>
              <span className="lo-ag-schalter">
                <span className={`lo-ag-an lo-ein-${(i % 4) + 1}`} />
                <span className={`lo-ag-knopf lo-knopf-${(i % 4) + 1}`} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 5 · Fulfilment: ein Punkt läuft die Schritte ab */

export function BildFulfilment({ auftrag, schritte, hinweis }: { auftrag: string; schritte: string[]; hinweis: string }) {
  return (
    <div className="lo-fu">
      <div className="lo-fu-karte lo-fenster">
        <div className="lo-fu-kopf">
          <span className="lo-fu-ico lo-glas">
            <Ico n="paket" s={14} />
          </span>
          <span className="lo-fu-nr">{auftrag}</span>
        </div>
        <div className="lo-fu-strecke" style={v({ "--n": schritte.length })}>
          <span className="lo-fu-linie">
            <span className="lo-fu-fuell" />
          </span>
          <span className="lo-fu-laeufer">
            <span className="lo-fu-punkt" />
          </span>
          <ol className="lo-fu-schritte">
            {schritte.map((s, i) => (
              <li key={s} className="lo-fu-schritt">
                <span className="lo-kreis lo-fu-kreis">
                  <span className={`lo-kreis-ok lo-fu-${(i % 4) + 1}`}>
                    <Ico n="haken" s={11} w={2.6} />
                  </span>
                </span>
                <span className="lo-fu-name">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="lo-fu-hinweis">
          <Ico n="mail" s={13} />
          {hinweis}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 6 · WhatsApp: Chat mit Tipp-Anzeige */

export function BildWhatsapp({ kopf, nachrichten }: { kopf: string; nachrichten: { von: string; text: string }[] }) {
  return (
    <div className="lo-wa">
      <div className="lo-wa-handy">
        <div className="lo-wa-schirm">
          <span className="lo-wa-insel" />
          <div className="lo-wa-kopf">
            <Ico n="zurueck" s={14} w={2} />
            <span className="lo-wa-avatar lo-glas">
              <Ico n="funke" s={12} w={2} />
            </span>
            <span className="lo-wa-titel">{kopf}</span>
          </div>
          <div className="lo-wa-chat">
            {nachrichten.map((m, i) => (
              <div key={i} className={`lo-wa-zeile lo-wa-zeile--${m.von === "ki" ? "ki" : "kunde"}`}>
                {m.von === "ki" ? (
                  <span className="lo-wa-tippt">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
                <p className={`lo-wa-blase lo-wa-b${i + 1}`}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 7 · Voice: Anruf mit Wellenform */

const WELLE = [0.32, 0.5, 0.74, 0.46, 0.88, 0.62, 1, 0.7, 0.44, 0.92, 0.6, 0.38, 0.8, 0.54, 0.96, 0.68, 0.42, 0.86, 0.58, 0.36, 0.76, 0.5, 0.9, 0.6, 0.34, 0.56, 0.72, 0.4];

export function BildVoice({ anruf, agent, status }: { anruf: string; agent: string; status: string[] }) {
  return (
    <div className="lo-vo">
      <div className="lo-vo-anruf lo-glas">
        <div className="lo-vo-kopf">
          <span className="lo-vo-hoerer">
            <Ico n="telefon" s={15} w={1.9} />
          </span>
          <span className="lo-vo-txt">
            <b>{anruf}</b>
            <small>{agent}</small>
          </span>
        </div>
        <div className="lo-vo-welle">
          {WELLE.map((h, i) => (
            <i key={i} style={v({ "--h": h, "--i": i })} />
          ))}
        </div>
      </div>
      <ul className="lo-vo-status lo-fenster">
        {status.map((s, i) => (
          <li key={s}>
            <Abhaken nr={[1, 3, 4][i] ?? 4} klasse="lo-vo-kreis" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
