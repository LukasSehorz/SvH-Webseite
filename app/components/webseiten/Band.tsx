/* M9. Das waagerechte Laufband unter dem Hero.
   Zwei Reihen laufen gegenlaeufig, die Raender sind nach #050507
   ausmaskiert. Das Band beantwortet die Frage, was ueberhaupt alles zu
   einer Webseite gehoert, bevor die Seite es einzeln erklaert.

   Das Bauteil braucht kein "use client", weil die Bewegung eine reine
   Blattanimation ist. Bei prefers-reduced-motion steht sie still, das
   regelt die Regel im globalen Blatt. */
import s from "./webseiten.module.css";
import { bandIcons } from "./Icons";

type Item = { icon: string; label: string };

function Reihe({
  items,
  rueckwaerts,
}: Readonly<{ items: readonly Item[]; rueckwaerts?: boolean }>) {
  /* Der Inhalt steht zweimal, damit die Runde nahtlos schlieszt. Die
     zweite Haelfte ist eine Wiederholung und darf nicht mitgelesen
     werden. */
  return (
    <div className={`${s.bandRow} ${rueckwaerts ? s.bandRowBack : ""}`}>
      {[0, 1].map((durchgang) => (
        <div
          key={durchgang}
          style={{ display: "flex", gap: 12 }}
          aria-hidden={durchgang === 1 ? "true" : undefined}
        >
          {items.map((item) => {
            const Zeichen = bandIcons[item.icon];
            return (
              <span className={s.chip} key={`${durchgang}-${item.label}`}>
                <span className={s.chipIcon}>{Zeichen ? <Zeichen size={18} /> : null}</span>
                {item.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Band({
  note,
  itemsA,
  itemsB,
}: Readonly<{ note: string; itemsA: readonly Item[]; itemsB: readonly Item[] }>) {
  return (
    <div className={s.band}>
      <p className={s.bandNote}>{note}</p>
      <div className={s.bandRows}>
        <Reihe items={itemsA} />
        <Reihe items={itemsB} rueckwaerts />
      </div>
    </div>
  );
}
