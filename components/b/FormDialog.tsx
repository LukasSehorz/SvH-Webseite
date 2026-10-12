"use client";

import { useEffect, useRef } from "react";
import { company } from "@/app/content";
import { terminB } from "@/app/copy-b";
import Formular from "./Formular";
import { Grad, Symbol } from "./ui";

/* Anmeldung im Fenster: Jeder Link auf „#termin“ (alle Knöpfe „Kostenlosen KI-Workshop sichern“)
   öffnet dieses Fenster statt zu scrollen. Escape oder Klick daneben schließt es. */
export default function FormDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const oeffnen = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !a.getAttribute("href")?.endsWith("#termin")) return;
      e.preventDefault();
      if (!d.open) d.showModal();
    };
    const zu = () => document.documentElement.removeAttribute("data-dialog-offen");
    const auf = () => document.documentElement.setAttribute("data-dialog-offen", "");
    const daneben = (e: MouseEvent) => {
      if (e.target === d) d.close(); // Klick auf den Hintergrund
    };
    // Wer direkt mit #termin auf die Seite kommt, sieht gleich die Anmeldung
    if (window.location.hash === "#termin") d.showModal();
    document.addEventListener("click", oeffnen, true);
    d.addEventListener("close", zu);
    d.addEventListener("click", daneben);
    const beobachter = new MutationObserver(() => (d.open ? auf() : zu()));
    beobachter.observe(d, { attributes: true, attributeFilter: ["open"] });
    return () => {
      document.removeEventListener("click", oeffnen, true);
      d.removeEventListener("close", zu);
      d.removeEventListener("click", daneben);
      beobachter.disconnect();
    };
  }, []);

  return (
    <dialog ref={ref} className="fd" aria-labelledby="fd-titel">
      <div className="fd-inhalt">
        <button type="button" className="fd-zu" aria-label={terminB.schliessen} onClick={() => ref.current?.close()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="b-label">{terminB.label}</p>
        <h2 className="fd-titel" id="fd-titel">
          <Grad text={terminB.title} />
        </h2>
        <p className="fd-text">{terminB.text}</p>
        <Formular />
        <p className="fd-direkt">
          {terminB.direkt}{" "}
          <a href={`tel:${company.phoneHref}`}>
            <Symbol name="telefon" size={16} />
            {company.phone}
          </a>
        </p>
      </div>
    </dialog>
  );
}
