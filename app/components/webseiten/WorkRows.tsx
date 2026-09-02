/* M5 zusammen mit M6. Die sechs Leistungen.
   Links Name und ein Satz, in der Mitte ein gezeichnetes Fenster mit
   Farbnebel, rechts eine rechtsbuendige Liste in drei bis fuenf
   Woertern. Darueber liegt eine Haarlinie mit der Nummer.

   Der Nebel wandert ueber die sechs Reihen von #5b8cff nach #b9a5ff und
   wieder zurueck. Damit bekommt die Seite eine Farbdramaturgie, ohne die
   Palette zu verlassen. */
import Fade from "./Fade";
import { Art, Window } from "./Mockups";
import s from "./webseiten.module.css";

type Reihe = {
  art: string;
  head: string;
  body: string;
  points: readonly string[];
};

/* Hin und zurueck durch die Palette, je Reihe ein Paar aus Kern und
   Rand des Nebels. */
const NEBEL: readonly [string, string][] = [
  ["#5b8cff", "#5b8cff"],
  ["#5b8cff", "#7c6aff"],
  ["#7c6aff", "#7c6aff"],
  ["#b9a5ff", "#b9a5ff"],
  ["#7c6aff", "#b9a5ff"],
  ["#5b8cff", "#7c6aff"],
];

function Nummer({ i }: Readonly<{ i: number }>) {
  return (
    <div className={s.rowRule}>
      <span className={s.rowNum}>{String(i + 1).padStart(2, "0")}</span>
    </div>
  );
}

export default function WorkRows({
  rows,
  vollAnzahl,
}: Readonly<{ rows: readonly Reihe[]; vollAnzahl: number }>) {
  const voll = rows.slice(0, vollAnzahl);
  const kompakt = rows.slice(vollAnzahl);

  return (
    <div>
      {voll.map((r, i) => (
        <div key={r.head}>
          <Nummer i={i} />
          <Fade className={s.row}>
            <div className={s.rowText}>
              <h3 className={s.rowHead}>{r.head}</h3>
              <p className={s.rowBody}>{r.body}</p>
            </div>

            <div className={s.rowStage}>
              <Window mist={NEBEL[i][0]} mist2={NEBEL[i][1]}>
                <Art name={r.art} />
              </Window>
            </div>

            <ul className={s.rowList}>
              {r.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Fade>
        </div>
      ))}

      {/* Die letzten Punkte stehen zusammengezogen als Dreierreihe, wenn
          die Seite sonst zu lang wird. Der Auftrag sieht genau das vor. */}
      {kompakt.length > 0 ? (
        <div className={s.trio}>
          {kompakt.map((r, k) => {
            const i = vollAnzahl + k;
            return (
              /* Kopf und Satz stehen ueber dem Fenster, nicht darunter.
                 Die drei gezeichneten Oberflaechen sind verschieden hoch,
                 und mit dem Fenster oben standen die drei Ueberschriften
                 auf drei verschiedenen Hoehen. */
              <Fade className={s.trioCell} key={r.head} versatz={k * -0.02}>
                <Nummer i={i} />
                <div>
                  <h3 className={s.rowHead}>{r.head}</h3>
                  <p className={s.rowBody}>{r.body}</p>
                </div>
                <Window mist={NEBEL[i][0]} mist2={NEBEL[i][1]} width={360}>
                  <Art name={r.art} />
                </Window>
                <ul className={s.trioList}>
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Fade>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
