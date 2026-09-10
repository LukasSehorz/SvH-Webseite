"use client";

/**
 * Der Widerruf der Einwilligung in der Fusszeile.
 *
 * Die Fusszeile selbst ist ein Server-Bauteil und kennt den Zustand des
 * Einwilligungsfeldes nicht. Consent.tsx legt deshalb beim Aufbau eine
 * Funktion am Fenster ab, und dieser Knopf ruft sie auf; das Feld
 * erscheint dann erneut mit beiden Moeglichkeiten.
 *
 * Solange die Funktion nicht steht, etwa weil JavaScript fehlt oder
 * Consent.tsx noch nicht aufgebaut ist, zeigt der Knopf sich gar nicht.
 * Ein Knopf, der nichts tut, waere schlimmer als keiner.
 */

import { useEffect, useState } from "react";

export default function ConsentWiderruf({ label }: Readonly<{ label: string }>) {
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    /* Consent.tsx legt die Funktion in seinem eigenen Effekt ab. Die
       Reihenfolge der Effekte ist nicht zugesichert, deshalb wird im
       naechsten Bild nachgesehen statt sofort. */
    const id = window.requestAnimationFrame(() => {
      setBereit(typeof window.svhEinwilligungAendern === "function");
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!bereit) return null;

  return (
    <button
      type="button"
      className="t-label footer-consent"
      style={{ textTransform: "none", letterSpacing: "0.02em" }}
      onClick={() => window.svhEinwilligungAendern?.()}
    >
      {label}
    </button>
  );
}
