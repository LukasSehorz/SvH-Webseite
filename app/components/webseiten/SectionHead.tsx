/* M2. Der Taktgeber der Seite.
   Die Ueberschrift steht linksbuendig und sehr grosz, auf gleicher Hoehe
   weit rechts ein einziger Satz in gedaempftem Grau, dazwischen Leere.
   Genau ein Wort je Sektion traegt den Verlauf. */
import { GradientWord } from "../system/ui";
import s from "./webseiten.module.css";

export default function SectionHead({
  before,
  word,
  after,
  aside,
  id,
}: Readonly<{
  before: string;
  word: string;
  after?: string;
  aside: string;
  id?: string;
}>) {
  return (
    <div className={s.head}>
      <h2 className={s.headTitle} id={id}>
        {before} <GradientWord>{word}</GradientWord>
        {after ? ` ${after}` : null}
      </h2>
      <p className={s.headAside}>{aside}</p>
    </div>
  );
}
