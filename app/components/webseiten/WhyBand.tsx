/* M7. Das Band aus vier Spalten mit senkrechten Haarlinien.
   Bei der Referenz stehen dort Prozentwerte. Bei uns ist nur eine
   einzige Zahl belegt, die 35+ umgesetzten Projekte, und die steht in
   Feld 04. Die drei anderen Felder tragen kurze Aussagen. Sobald der
   Auftraggeber echte Kennzahlen liefert, wird daraus ohne Umbau ein
   Zahlenband, weil die obere Zeile schon die Groesze einer Zahl hat.

   Jede Spalte blendet nach M6 einzeln und leicht versetzt auf. */
import Fade from "./Fade";
import s from "./webseiten.module.css";

type Feld = { head: string; body: string };

export default function WhyBand({ fields }: Readonly<{ fields: readonly Feld[] }>) {
  return (
    <div className={s.whyGrid}>
      {fields.map((feld, i) => (
        <Fade
          key={feld.head}
          className={s.whyCell}
          /* Der Versatz waechst nach rechts, damit die vier Spalten
             nacheinander und nicht im Gleichschritt aufgehen. */
          versatz={i * -0.018}
        >
          <p className={s.whyHead}>{feld.head}</p>
          <p className={s.whyBody}>{feld.body}</p>
          <span className={s.whyNum}>{String(i + 1).padStart(2, "0")}</span>
        </Fade>
      ))}
    </div>
  );
}
