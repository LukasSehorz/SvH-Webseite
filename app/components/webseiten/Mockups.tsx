/* Die gezeichneten Oberflaechen dieser Seite.
   Jede besteht aus Haarlinien, Balken und einem Farbnebel dahinter. Es
   ist kein einziges Bildschirmfoto eines fremden Produktes dabei und
   kein fremdes Zeichen. Die beiden Oberflaechen, die eine Antwort einer
   KI und ein Suchergebnis zeigen, tragen genau ein Wort, damit man sie
   als das erkennt, was sie sind.

   Die Oberflaechen sind Anschauung und kein Inhalt. Der Inhalt steht als
   Ueberschrift und Satz daneben, deshalb sind sie fuer Vorleseprogramme
   ausgeblendet. */
import s from "./webseiten.module.css";
import { CheckIcon, GlobeIcon, LockIcon, SearchIcon, SparkIcon } from "./Icons";

/* ------------------------------------------------------------ Bausteine */

function Bar({
  w,
  tone = "mid",
  h,
}: Readonly<{ w: string | number; tone?: "strong" | "mid" | "soft"; h?: number }>) {
  const cls =
    tone === "strong"
      ? `${s.bar} ${s.barStrong}`
      : tone === "soft"
        ? `${s.bar} ${s.barSoft}`
        : s.bar;
  return <span className={cls} style={{ width: w, height: h }} />;
}

/* Der Rahmen einer gezeichneten Seite, mit angedeuteter Adressleiste. */
function Chrome({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className={s.artBar}>
        <span className={s.artDot} />
        <span className={s.artDot} />
        <span className={s.artDot} />
        <span className={s.artAddr} />
      </div>
      {children}
    </>
  );
}

/**
 * Das Fenster nach M3. Der Nebel liegt dahinter und leuchtet ueber die
 * Kanten hinaus, die Farbe kommt je Reihe von auszen.
 */
export function Window({
  mist,
  mist2,
  width,
  children,
}: Readonly<{
  mist: string;
  mist2: string;
  width?: number;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={s.win}
      style={
        {
          "--mist": mist,
          "--mist-2": mist2,
          maxWidth: width,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <span className={s.winMist} />
      <div className={s.winBody}>{children}</div>
    </div>
  );
}

/* ------------------------------------------- 01 Modernes Design */

function ArtDesign() {
  return (
    <Chrome>
      <div className={s.artPad}>
        <Bar w="66%" tone="strong" />
        <Bar w="42%" />
        <span className={s.block} style={{ height: 78, marginTop: 6 }} />
        <div className={s.rowFlex} style={{ marginTop: 4, alignItems: "flex-start" }}>
          {[0, 1, 2].map((i) => (
            <div className={s.colFlex} key={i}>
              <span className={s.block} style={{ height: 30 }} />
              <Bar w="82%" />
              <Bar w="58%" tone="soft" />
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

/* ------------------------------------------- 02 Mobil optimiert */

function ArtMobil() {
  return (
    <div className={s.artPad} style={{ paddingTop: 26, paddingBottom: 26 }}>
      <div className={s.rowFlex} style={{ alignItems: "flex-end", gap: 0 }}>
        {/* Dieselbe Seite auf dem groszen Schirm, gedaempft, damit das
            Telefon davor die Hauptsache bleibt. */}
        <div
          className={s.block}
          style={{ flex: "1 1 auto", height: 156, padding: 12, opacity: 0.55 }}
        >
          <div className={s.colFlex}>
            <Bar w="70%" tone="strong" />
            <Bar w="46%" tone="soft" />
            <span className={s.block} style={{ height: 44, marginTop: 4 }} />
            <div className={s.rowFlex}>
              <Bar w="30%" tone="soft" />
              <Bar w="30%" tone="soft" />
            </div>
          </div>
        </div>

        <div style={{ position: "relative", marginLeft: -34, flex: "0 0 auto" }}>
          <div className={s.phone}>
            <span className={s.phoneNotch} />
            <Bar w="78%" tone="strong" />
            <Bar w="52%" tone="soft" />
            <span className={s.block} style={{ height: 40 }} />
            <Bar w="92%" />
            <Bar w="64%" tone="soft" />
            <span
              className={s.formSend}
              style={{ height: 26, marginTop: 4 }}
            >
              <span className={s.formSendBar} style={{ width: 44, height: 6 }} />
            </span>
          </div>
          {/* Der Ring zeigt, wie grosz ein Daumen wirklich ist. */}
          <span className={s.tapRing} style={{ right: -14, bottom: 6 }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------- 03 Schnelle Ladezeiten */

function ArtTempo() {
  return (
    <Chrome>
      <div className={s.artPad} style={{ gap: 14 }}>
        {/* Die Anzeige steht voll, denn die Seite ist schon da. Es steht
            bewusst keine Sekundenzahl daran, weil keine belegt ist. */}
        <div className={s.rowFlex}>
          <span className={s.loadTrack} style={{ flex: "1 1 auto" }}>
            <span className={s.loadFill} />
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 9999,
              border: "1px solid rgba(244,244,246,0.28)",
              color: "var(--ink)",
              flex: "0 0 22px",
            }}
          >
            <CheckIcon size={12} />
          </span>
        </div>

        {/* Die Seite steht vollstaendig, jeder Balken ist gesetzt. Ein
            zweiter, halb geladener Vergleich stand hier einmal darunter
            und war auf dem fertigen Schirm so blass, dass das Fenster
            unten leer aussah. */}
        <div className={s.colFlex} style={{ gap: 10 }}>
          <Bar w="60%" tone="strong" />
          <span className={s.block} style={{ height: 62 }} />
          <Bar w="88%" />
          <Bar w="70%" />
          <div className={s.rowFlex} style={{ marginTop: 4, alignItems: "stretch" }}>
            <span className={s.block} style={{ height: 34, flex: "1 1 0" }} />
            <span className={s.block} style={{ height: 34, flex: "1 1 0" }} />
            <span className={s.block} style={{ height: 34, flex: "1 1 0" }} />
          </div>
        </div>
      </div>
    </Chrome>
  );
}

/* ------------------------------------------- 04 Bei Google gefunden */

function ArtSuche() {
  return (
    <div className={s.artPad} style={{ gap: 14 }}>
      <span className={s.searchField}>
        <SearchIcon size={14} />
        <Bar w="52%" tone="soft" h={7} />
      </span>

      {/* Der erste Treffer ist Ihr Betrieb. Er steht hell und in einem
          eigenen Kasten, die beiden darunter stehen blass. */}
      <div className={`${s.hit} ${s.hitLead}`}>
        <div className={s.rowFlex} style={{ gap: 7, color: "var(--ink-3)" }}>
          <LockIcon size={12} />
          <Bar w="38%" tone="soft" h={6} />
        </div>
        <Bar w="76%" tone="strong" />
        <Bar w="94%" />
        <Bar w="62%" />
      </div>

      {[0, 1].map((i) => (
        <div className={s.hit} key={i} style={{ opacity: 0.42, paddingBlock: 6 }}>
          <Bar w={i === 0 ? "54%" : "48%"} tone="soft" h={6} />
          <Bar w={i === 0 ? "70%" : "64%"} />
          <Bar w="86%" tone="soft" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------- 05 Von KI gelesen */

function ArtKi() {
  return (
    <div className={s.artPad} style={{ gap: 16 }}>
      {/* Die Frage steht rechts, so wie in einem Verlauf. */}
      <span
        style={{
          alignSelf: "flex-end",
          display: "inline-flex",
          alignItems: "center",
          padding: "9px 14px",
          borderRadius: 9999,
          background: "rgba(244,244,246,0.07)",
          maxWidth: "72%",
          width: "62%",
        }}
      >
        <Bar w="100%" tone="soft" h={7} />
      </span>

      <div className={s.answer}>
        <span className={s.answerMark}>
          <SparkIcon size={13} />
        </span>
        <div className={s.colFlex} style={{ gap: 9 }}>
          <Bar w="96%" />
          <Bar w="88%" />
          <Bar w="93%" />
          <Bar w="54%" />
        </div>
      </div>

      {/* Die Quellenangabe macht die Antwort als Antwort einer KI
          lesbar. Der Kreis mit den Laengengraden steht fuer eine
          Webseite und zeigt kein fremdes Zeichen. */}
      <span className={s.sourceChip}>
        <GlobeIcon size={13} />
        Quelle
        <Bar w={54} tone="soft" h={6} />
      </span>
    </div>
  );
}

/* ------------------------------------------- 06 Aus Besuchern Kunden */

function ArtKunden() {
  return (
    <div className={s.artPad} style={{ gap: 12 }}>
      <Bar w="46%" tone="strong" />
      {[0, 1].map((i) => (
        <span className={s.formField} key={i}>
          <span style={{ color: "var(--ink-2)", display: "inline-flex" }}>
            <CheckIcon size={12} />
          </span>
          <Bar w={i === 0 ? "48%" : "62%"} h={7} />
        </span>
      ))}
      <span
        className={s.formField}
        style={{ height: 62, alignItems: "flex-start", paddingTop: 11 }}
      >
        <span style={{ color: "var(--ink-2)", display: "inline-flex", marginTop: 1 }}>
          <CheckIcon size={12} />
        </span>
        <span className={s.colFlex} style={{ gap: 7 }}>
          <Bar w="90%" h={7} />
          <Bar w="66%" h={7} />
        </span>
      </span>
      <span className={s.formSend} style={{ marginTop: 4 }}>
        <span className={s.formSendBar} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------ Schritte S6 */

function ArtGespraech() {
  return (
    <div className={s.artPad} style={{ gap: 14, minHeight: 214 }}>
      <span
        style={{
          alignSelf: "flex-start",
          width: "66%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid var(--line-2)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Bar w="86%" />
        <Bar w="58%" tone="soft" />
      </span>
      <span
        style={{
          alignSelf: "flex-end",
          width: "58%",
          padding: "12px 14px",
          borderRadius: 14,
          background: "rgba(244,244,246,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Bar w="92%" tone="soft" />
        <Bar w="44%" tone="soft" />
      </span>
      <span
        style={{
          alignSelf: "flex-start",
          width: "48%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid var(--line-2)",
        }}
      >
        <Bar w="72%" />
      </span>
    </div>
  );
}

function ArtEntwurf() {
  const dashed: React.CSSProperties = {
    borderStyle: "dashed",
    borderColor: "rgba(244,244,246,0.16)",
  };
  return (
    <div className={s.artPad} style={{ gap: 10, minHeight: 214 }}>
      <span className={s.block} style={{ ...dashed, height: 26 }} />
      <span className={s.block} style={{ ...dashed, height: 76 }} />
      <div className={s.rowFlex} style={{ alignItems: "stretch" }}>
        <span className={s.block} style={{ ...dashed, height: 44, flex: "1 1 0" }} />
        <span className={s.block} style={{ ...dashed, height: 44, flex: "1 1 0" }} />
        <span className={s.block} style={{ ...dashed, height: 44, flex: "1 1 0" }} />
      </div>
      <span className={s.block} style={{ ...dashed, height: 22 }} />
    </div>
  );
}

function ArtBau() {
  return (
    <div className={s.artPad} style={{ gap: 10, minHeight: 214 }}>
      <div className={s.colFlex} style={{ gap: 8 }}>
        <Bar w="58%" tone="strong" />
        <Bar w="38%" tone="soft" />
      </div>
      <span className={s.block} style={{ height: 68, background: "rgba(244,244,246,0.06)" }} />
      <div className={s.rowFlex} style={{ alignItems: "stretch" }}>
        <span
          className={s.block}
          style={{ height: 40, flex: "1 1 0", background: "rgba(244,244,246,0.05)" }}
        />
        <span
          className={s.block}
          style={{ height: 40, flex: "1 1 0", background: "rgba(244,244,246,0.035)" }}
        />
        <span
          className={s.block}
          style={{
            height: 40,
            flex: "1 1 0",
            borderStyle: "dashed",
            borderColor: "rgba(244,244,246,0.16)",
          }}
        />
      </div>
      <span className={s.loadTrack} style={{ marginTop: 4 }}>
        <span className={s.loadFill} style={{ width: "72%" }} />
      </span>
    </div>
  );
}

function ArtLive() {
  return (
    <>
      <div className={s.artBar}>
        <span className={s.artDot} />
        <span className={s.artDot} />
        <span className={s.artDot} />
        <span
          className={s.artAddr}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingInline: 10,
            color: "var(--ink-3)",
            background: "rgba(244,244,246,0.05)",
          }}
        >
          <GlobeIcon size={12} />
          <Bar w="46%" tone="soft" h={6} />
        </span>
      </div>
      <div className={s.artPad} style={{ gap: 10, minHeight: 174 }}>
        <Bar w="64%" tone="strong" />
        <Bar w="42%" tone="soft" />
        <span className={s.block} style={{ height: 62, background: "rgba(244,244,246,0.06)" }} />
        <div className={s.rowFlex}>
          <span className={s.formSend} style={{ height: 26, width: 92 }}>
            <span className={s.formSendBar} style={{ width: 40, height: 6 }} />
          </span>
          <Bar w="34%" tone="soft" />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ Auswahl */

const arts: Record<string, () => React.ReactElement> = {
  design: ArtDesign,
  mobil: ArtMobil,
  tempo: ArtTempo,
  suche: ArtSuche,
  ki: ArtKi,
  kunden: ArtKunden,
  gespraech: ArtGespraech,
  entwurf: ArtEntwurf,
  bau: ArtBau,
  live: ArtLive,
};

export function Art({ name }: Readonly<{ name: string }>) {
  const Chosen = arts[name] ?? ArtDesign;
  return <Chosen />;
}
