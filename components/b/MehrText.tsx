"use client";

import { useEffect, useId, useRef, useState } from "react";

/* Langer Bewertungstext: zeigt anfangs nur ein paar Zeilen, „Weiterlesen“ klappt ihn auf.
   Der Knopf erscheint nur, wenn der Text wirklich länger ist. Ohne JavaScript steht der ganze Text da (noscript-Regel in Kunden.tsx). */
export default function MehrText({ text, weiter, weniger }: { text: string; weiter: string; weniger: string }) {
  const id = useId();
  const ref = useRef<HTMLQuoteElement>(null);
  const [offen, setOffen] = useState(false);
  const [lang, setLang] = useState(false);

  // meldet sich beim Beobachten sofort einmal und danach bei jeder Größenänderung
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLang(el.scrollHeight > el.clientHeight + 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <blockquote ref={ref} id={id} className="kd-text" data-zu={offen ? undefined : ""}>
        „{text}“
      </blockquote>
      {lang || offen ? (
        <button type="button" className="kd-mehr" aria-expanded={offen} aria-controls={id} onClick={() => setOffen((o) => !o)}>
          {offen ? weniger : weiter}
        </button>
      ) : null}
    </>
  );
}
