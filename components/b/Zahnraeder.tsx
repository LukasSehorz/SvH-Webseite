import { problemB, zahnradB } from "@/app/copy-b";
import { Grad, Haken, stufe } from "./ui";
import ZahnradLauf from "./ZahnradLauf";

/* Zahnräder = „Die Lösung“ direkt nach dem Problem (Baulig: „Was du erwarten kannst“).
   Oben Label, Überschrift und Text, darunter links die Räder, rechts die sechs Gewinne
   („Was du gewinnst“, Haken in zwei Spalten, am Handy eine), am Ende der Link zu den Leistungen.
   Stil: Das Problem ist schwarz-weiß, die Lösung bringt Farbe. Großes Rad „KI“ in der Mitte im
   Markenverlauf Blau → Lila, fünf helle Räder (Weiß → Hellblau) mit feinem blauem Rand greifen
   außen herum ein. Weiche Schatten als ruhende, weich auslaufende Scheiben unter jedem Rad
   (kein Filter, der jedes Bild neu rechnen müsste). Echte Verzahnung (gleiches Modul).
   Bewegung: Sobald die Grafik im Bild ist, dreht sich das große Rad langsam im Uhrzeigersinn,
   die kleinen gegenläufig und doppelt so schnell (24 zu 12 Zähne), so greifen die Zähne sichtbar
   ineinander; außerhalb des Bildes pausieren sie (ZahnradLauf). Gedreht werden nur die Radformen
   (Umriss und Schnittform); Farbverlauf, Licht, Naben und Beschriftungen stehen still. Die Formen
   sind schon an ihrer Stelle und im Anfangswinkel berechnet, damit CSS um die Mitte der eigenen
   Form drehen kann (transform-box: fill-box). */

const M = 13; // Modul
const Z1 = 24; // Zähne großes Rad
const Z2 = 12; // Zähne kleine Räder
const R1 = (M * Z1) / 2; // Teilkreis 156
const R2 = (M * Z2) / 2; // Teilkreis 78
const ABSTAND = R1 + R2;
const RAND = 30;
const GROESSE = 2 * (ABSTAND + R2 + M) + 2 * RAND;
const C = GROESSE / 2;
const LINIE = 2; // feiner Rand
const SCHATTEN_Y = 14; // weicher Schatten fällt nach unten (oben bleibt er unter dem Rad verborgen)
const SCHATTEN_R = 4; // so weit läuft er über das Rad hinaus aus

const grad = (r: number) => (r * Math.PI) / 180;

/** Zahnrad-Umriss um (cx, cy), um „dreh“ Grad gedreht: breite, runde Zeichentrick-Zähne */
function umriss(z: number, rp: number, cx: number, cy: number, dreh: number) {
  const ra = rp + M;
  const rf = rp - 1.1 * M;
  const p = (2 * Math.PI) / z;
  const d = grad(dreh);
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a + d)).toFixed(2)} ${(cy + r * Math.sin(a + d)).toFixed(2)}`;
  const teile: string[] = [];
  for (let k = 0; k < z; k++) {
    const a = k * p;
    teile.push(pt(rf, a - 0.29 * p), pt(ra, a - 0.17 * p), pt(ra, a + 0.17 * p), pt(rf, a + 0.29 * p));
  }
  return `M${teile.join("L")}Z`;
}

const kreis = (x: number, y: number, r: number) => `M${(x + r).toFixed(2)} ${y.toFixed(2)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0Z`;

const RF1 = R1 - 1.1 * M;
/** großes Rad mit sechs Aussparungen (punktsymmetrisch, die Mitte der Form ist die Radmitte) */
const gross = (x: number, y: number) =>
  umriss(Z1, R1, x, y, 0) + Array.from({ length: 6 }, (_, i) => kreis(x + Math.cos(grad(i * 60 + 30)) * RF1 * 0.6, y + Math.sin(grad(i * 60 + 30)) * RF1 * 0.6, RF1 * 0.15)).join("");

/* Lage der kleinen Räder und Anfangswinkel, damit Zahn in Lücke greift */
const P1 = 360 / Z1;
const P2 = 360 / Z2;
const RAEDER = zahnradB.bereiche.map((b, i) => {
  const theta = -90 + i * 72;
  const phase = theta + 180 - P2 * (0.5 - theta / P1);
  const dreh = ((phase % P2) + P2) % P2;
  return { ...b, x: C + ABSTAND * Math.cos(grad(theta)), y: C + ABSTAND * Math.sin(grad(theta)), form: (x: number, y: number) => umriss(Z2, R2, x, y, dreh) };
});

/* Bildausschnitt eng um die Räder samt Schatten: auf dem Handy wird alles größer */
const AUSSEN = R2 + M + LINIE / 2;
const XS = RAEDER.map((r) => r.x);
const YS = RAEDER.map((r) => r.y);
const LUFT = 6;
const BOX = {
  x: Math.min(...XS) - AUSSEN - LUFT,
  y: Math.min(...YS) - AUSSEN - LUFT,
  r: Math.max(...XS) + AUSSEN + LUFT,
  u: Math.max(...YS) + AUSSEN + SCHATTEN_Y + SCHATTEN_R - 4 + LUFT,
};
const VIEWBOX = `${BOX.x.toFixed(1)} ${BOX.y.toFixed(1)} ${(BOX.r - BOX.x).toFixed(1)} ${(BOX.u - BOX.y).toFixed(1)}`;

/** Farben und Licht: einmal pro Grafik, stehen still (nur die Formen drehen sich darüber) */
function Farben() {
  return (
    <defs>
      {/* Markenverlauf für das große Rad und das Wort „KI“ */}
      <linearGradient id="zr-marke" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#3f74ff" />
        <stop offset="0.55" stopColor="#6a55ff" />
        <stop offset="1" stopColor="#8c6dff" />
      </linearGradient>
      {/* weiches Licht von links oben */}
      <radialGradient id="zr-licht" cx="0.3" cy="0.22" r="0.75">
        <stop stopColor="#fff" stopOpacity="0.34" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      {/* kleine Räder: Weiß oben, Hellblau unten */}
      <linearGradient id="zr-hell" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#f7f9ff" />
        <stop offset="1" stopColor="#dbe5ff" />
      </linearGradient>
      {/* weicher Schatten: dicht unter dem Rad, nach außen auslaufend */}
      <radialGradient id="zr-schatten">
        <stop offset="0.45" stopColor="#1a2a6c" stopOpacity="0.2" />
        <stop offset="1" stopColor="#1a2a6c" stopOpacity="0" />
      </radialGradient>
      {/* großes Rad: nur als Ring, damit die Aussparungen hell bleiben und nicht grau wirken */}
      <radialGradient id="zr-schatten-ring">
        <stop offset="0.62" stopColor="#1a2a6c" stopOpacity="0" />
        <stop offset="0.8" stopColor="#1a2a6c" stopOpacity="0.2" />
        <stop offset="1" stopColor="#1a2a6c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="zr-nabe-schatten">
        <stop offset="0.78" stopColor="#1c1460" stopOpacity="0.28" />
        <stop offset="1" stopColor="#1c1460" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Weicher Schatten unter einem Rad (ruht, dreht nicht mit) */
function Schatten({ x, y, r, ring = false }: { x: number; y: number; r: number; ring?: boolean }) {
  return <circle cx={x} cy={y + SCHATTEN_Y} r={r + SCHATTEN_R} fill={ring ? "url(#zr-schatten-ring)" : "url(#zr-schatten)"} />;
}

/** Ein Rad: Fläche (ruhender Verlauf in der drehenden Form) und feiner Rand. „klein“ dreht gegenläufig und doppelt so schnell. */
function Rad({ id, form, x, y, r, klein = false }: { id: string; form: (x: number, y: number) => string; x: number; y: number; r: number; klein?: boolean }) {
  const pfad = form(x, y);
  const dreht = klein ? "zr-dreh zr-dreh--klein" : "zr-dreh";
  const flaeche = { x: x - r - 4, y: y - r - 4, width: 2 * r + 8, height: 2 * r + 8 };
  return (
    <g>
      <clipPath id={id}>
        <path className={dreht} d={pfad} clipRule="evenodd" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {klein ? (
          <rect {...flaeche} fill="url(#zr-hell)" />
        ) : (
          <>
            <rect {...flaeche} fill="url(#zr-marke)" />
            <rect {...flaeche} fill="url(#zr-licht)" />
          </>
        )}
      </g>
      <path
        className={dreht}
        d={pfad}
        fill="none"
        fillRule="evenodd"
        stroke={klein ? "#3f74ff" : "#4a3fd6"}
        strokeOpacity={klein ? 0.55 : 0.35}
        strokeWidth={LINIE}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Beschriftung({ x, y, text, klasse, zeile }: { x: number; y: number; text: string; klasse: string; zeile: number }) {
  const zeilen = text.split("\n");
  return (
    <text x={x} y={y} textAnchor="middle" className={klasse}>
      {zeilen.map((z, i) => (
        <tspan key={z} x={x} dy={i === 0 ? (zeilen.length === 1 ? zeile * 0.35 : -zeile * 0.18) : zeile}>
          {z}
        </tspan>
      ))}
    </text>
  );
}

function Grafik() {
  const aussenKlein = R2 + M;
  const aussenGross = R1 + M;
  return (
    <svg className="zr-svg" viewBox={VIEWBOX} role="img" aria-label={`Zahnräder: KI in der Mitte treibt ${zahnradB.bereiche.map((b) => b.lang.replace("-\n", "").replace("\n", " ")).join(", ")} an.`}>
      <Farben />
      {/* Schatten zuerst: liegen unter allen Rädern */}
      {RAEDER.map((r) => (
        <Schatten key={`s-${r.lang}`} x={r.x} y={r.y} r={aussenKlein} />
      ))}
      <Schatten x={C} y={C} r={aussenGross} ring />

      {RAEDER.map((r, i) => (
        <Rad key={r.lang} id={`zr-k${i}`} form={r.form} x={r.x} y={r.y} r={aussenKlein} klein />
      ))}
      <Rad id="zr-g" form={gross} x={C} y={C} r={aussenGross} />
      {/* feiner heller Ring um die Aussparungen */}
      <circle cx={C} cy={C} r={RF1 - 22} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />

      {/* Naben mit Beschriftung: stehen still */}
      <circle cx={C} cy={C + 5} r="72" fill="url(#zr-nabe-schatten)" />
      <circle cx={C} cy={C} r="64" fill="#fff" />
      <text x={C} y={C} dy="21" textAnchor="middle" className="zr-ki" fill="url(#zr-marke)">
        {zahnradB.mitte}
      </text>
      {RAEDER.map((r) => (
        <g key={`n-${r.lang}`}>
          <circle cx={r.x} cy={r.y} r="56" fill="#fff" stroke="#3f74ff" strokeOpacity="0.22" strokeWidth={LINIE} />
          <Beschriftung x={r.x} y={r.y} text={r.lang} klasse="zr-label zr-label--lang" zeile={19} />
          <Beschriftung x={r.x} y={r.y} text={r.kurz} klasse="zr-label zr-label--kurz" zeile={25} />
        </g>
      ))}
    </svg>
  );
}

/** Pfeil nach unten am Textlink */
function Runter() {
  return (
    <svg className="zr-weiter-pfeil" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Der Pfeil hängt am letzten Wort, damit er beim Umbruch nie allein am Rand steht
const weiterWorte = zahnradB.weiter.split(" ");
const weiterEnde = weiterWorte.pop();
const weiterAnfang = weiterWorte.join(" ");

export default function Zahnraeder() {
  return (
    <section className="sb zr" id="vorteile" aria-labelledby="zr-titel">
      {/* gestrichelte Linie vom Problem herüber: schwarz oben, Markenfarbe unten (aus Grau wird Farbe) */}
      <div className="zr-faden" aria-hidden="true">
        <svg viewBox="0 0 40 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="zr-faden-farbe" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0b0b0e" />
              <stop offset="1" stopColor="#6a55ff" />
            </linearGradient>
          </defs>
          <path d="M20 0 C 2 30, 38 60, 20 92" stroke="url(#zr-faden-farbe)" />
        </svg>
        <span className="zr-faden-spitze" />
      </div>
      <div className="sb-wrap">
        <div className="b-kopf b-kopf--mitte zr-kopf" data-rv="">
          <p className="b-label">{zahnradB.label}</p>
          <h2 className="b-h2" id="zr-titel">
            <Grad text={zahnradB.titel} />
          </h2>
          <p className="b-lead">{zahnradB.text}</p>
        </div>
        <div className="zr-grid">
          <div className="zr-bild" data-rv="">
            <ZahnradLauf>
              <Grafik />
            </ZahnradLauf>
          </div>
          <div className="zr-gewinne" data-rv="" style={stufe(1)}>
            <h3 className="zr-gewinne-titel">
              <Grad text={problemB.vorteileTitel} />
            </h3>
            <ul className="zr-liste">
              {problemB.vorteile.map((v) => (
                <li key={v.titel}>
                  <Haken size={22} />
                  <span>
                    <span className="zr-v-titel">{v.titel}</span>
                    <span className="zr-v-text">{v.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <a className="zr-weiter" href={zahnradB.weiterHref}>
              {weiterAnfang}{" "}
              <span className="zr-weiter-ende">
                {weiterEnde}
                <Runter />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
