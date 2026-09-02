import type { ReactNode } from "react";
import Navbar from "../system/Navbar";
import Footer from "../system/Footer";

/**
 * Hülle für die Rechtsseiten im dunklen System. Eine schmale Textspalte,
 * Haarlinien als einzige Gliederung und Überschriften in der t-label-Haltung.
 * Die Rechtstexte selbst kommen unverändert aus den jeweiligen Seiten.
 *
 * Als reines Style-Element gehalten, damit die Seiten Server-Komponenten
 * bleiben und ohne zusätzliches JavaScript ausgeliefert werden.
 */
const LEGAL_CSS = `
.legal-dark{
  padding-top:clamp(132px,17vh,192px);
  padding-bottom:var(--section-y);
}
.legal-dark .legal-title{margin-top:20px;max-width:20ch;hyphens:auto}
.legal-dark .legal-note{
  max-width:70ch;margin:34px 0 0;
  border:1px solid var(--line);border-radius:14px;
  padding:16px 20px;
  font-size:14px;line-height:1.6;color:var(--ink-2);
}
.legal-dark .legal-body{max-width:70ch;margin-top:52px}

/* Abschnittsüberschriften stehen in Satzschreibung. Versalien mit weitem
   Sperrsatz lassen sich bei Zeilen wie „Verantwortlich für den Inhalt nach
   § 18 Abs. 2 MStV" nicht überfliegen. Die Haarlinie darüber übernimmt
   weiterhin die Trennung zwischen den Abschnitten. */
.legal-dark .legal-body h2{
  font-family:var(--font-sans);
  font-size:16px;font-weight:600;line-height:1.4;
  letter-spacing:-.005em;
  color:var(--ink);
  text-wrap:balance;
  margin:0;padding-top:34px;
  border-top:1px solid var(--line);
}
.legal-dark .legal-body h2:first-child{padding-top:0;border-top:0}
.legal-dark .legal-body h3{
  font-family:var(--font-sans);
  font-size:15.5px;font-weight:600;line-height:1.5;
  color:var(--ink);
  margin:30px 0 0;
}
.legal-dark .legal-body p{
  font-family:var(--font-sans);
  font-size:15.5px;font-weight:400;line-height:1.72;
  color:var(--ink-2);
  margin:16px 0 0;
}
.legal-dark .legal-body h2 + p,
.legal-dark .legal-body h3 + p{margin-top:14px}
.legal-dark .legal-body ul{
  margin:16px 0 0;padding-left:20px;list-style:disc;
  font-size:15.5px;line-height:1.72;color:var(--ink-2);
}
.legal-dark .legal-body li{margin-top:6px}
.legal-dark .legal-body li::marker{color:var(--ink-3)}
.legal-dark .legal-body strong{color:var(--ink);font-weight:600}

/* Angabe und Wert stehen nebeneinander statt durch einen Doppelpunkt
   getrennt. Unter 520px rutscht der Wert unter seine Beschriftung. */
.legal-dark .legal-body .legal-dl{
  display:grid;grid-template-columns:max-content minmax(0,1fr);
  gap:10px 28px;margin:16px 0 0;
}
.legal-dark .legal-body h2 + .legal-dl{margin-top:14px}
.legal-dark .legal-body .legal-dl dt{
  font-family:var(--font-sans);
  font-size:11px;font-weight:600;line-height:1.6;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-3);
  padding-top:3px;
}
.legal-dark .legal-body .legal-dl dd{
  margin:0;
  font-size:15.5px;font-weight:400;line-height:1.6;
  color:var(--ink-2);
  overflow-wrap:anywhere;
}

@media (max-width:520px){
  .legal-dark .legal-body .legal-dl{grid-template-columns:minmax(0,1fr);gap:2px}
  .legal-dark .legal-body .legal-dl dt{padding-top:12px}
  .legal-dark .legal-body .legal-dl dt:first-child{padding-top:0}
}

/* Links stehen in --ink und bekommen beim Überfahren die volle
   Unterstreichung. Die leise Grundlinie hält sie trotzdem auffindbar. */
.legal-dark .legal-body a{
  color:var(--ink);
  text-decoration:underline;
  text-underline-offset:3px;
  text-decoration-color:var(--line);
  overflow-wrap:anywhere;
  transition:text-decoration-color .3s var(--ease-out-expo);
}
.legal-dark .legal-body a:hover{text-decoration-color:currentColor}

/* Der Abstand zwischen zwei Abschnitten entsteht über die Haarlinie. */
.legal-dark .legal-body > * + h2{margin-top:44px}

@media (max-width:640px){
  /* „Allgemeine Geschäftsbedingungen" passt in der t-h1-Stufe nicht mehr
     in eine schmale Spalte. Eine Stufe kleiner bricht der Titel sauber um. */
  .legal-dark .legal-title{font-size:34px}
  .legal-dark .legal-note{margin-top:26px;padding:14px 16px}
  .legal-dark .legal-body{margin-top:38px}
  .legal-dark .legal-body > * + h2{margin-top:34px}
}
`;

/**
 * Beschriftung über dem Titel. Steht als Vorgabewert hier, weil sie auf
 * allen drei Rechtsseiten dieselbe ist und sich über die Prop überschreiben
 * lässt.
 */
const DEFAULT_LABEL = "Rechtliches";

/**
 * Hinweis über dem Rechtstext. ❗TODO Entfällt, sobald die Texte
 * anwaltlich geprüft sind.
 */
const DEFAULT_NOTE =
  "Dieser Text ist ein sorgfältig vorbereiteter Entwurf und ersetzt keine Rechtsberatung. Er wird vor dem Livegang anwaltlich geprüft.";

export default function DarkLegalPage({
  title,
  label = DEFAULT_LABEL,
  note = DEFAULT_NOTE,
  children,
}: Readonly<{ title: string; label?: string; note?: string; children: ReactNode }>) {
  return (
    <>
      <style>{LEGAL_CSS}</style>
      <Navbar />

      <main className="legal-dark">
        <div className="shell">
          <p className="t-label">{label}</p>
          <h1 className="t-h1 legal-title">{title}</h1>

          {note ? <p className="legal-note">{note}</p> : null}

          <div className="legal-body">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
