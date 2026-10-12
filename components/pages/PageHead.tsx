import type { ReactNode } from "react";
import { Grad } from "@/components/b/ui";

/**
 * Kopf der Unterseiten (Rechtliches, Aktuelles, 404) im hellen Stil der Startseite:
 * Beschriftung in Akzentfarbe, große Überschrift (H1, _Wort_ = Verlaufswort), Einleitung.
 * Ohne Bewegung: steht sofort da, kein Einblenden beim Laden.
 */
export default function PageHead({
  label,
  title,
  lead,
  center = false,
  className = "",
  children,
}: Readonly<{ label: string; title: string; lead?: string; center?: boolean; className?: string; children?: ReactNode }>) {
  return (
    <header className={`sk${center ? " sk--mitte" : ""}${className ? ` ${className}` : ""}`}>
      <div className="sb-wrap">
        <div className="sk-inhalt">
          <p className="b-label">{label}</p>
          <h1 className="sk-h1">
            <Grad text={title} />
          </h1>
          {lead ? <p className="sk-lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}
