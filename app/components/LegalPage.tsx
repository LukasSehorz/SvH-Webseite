import type { ReactNode } from "react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";

const LEGAL_CSS = `
.svh-legal h2{
  font-family:var(--font-serif);
  font-size:28px;line-height:1.2;font-weight:500;
  color:var(--color-ink);
  margin-top:48px;margin-bottom:16px;
}
.svh-legal h3{
  font-family:var(--font-sans);
  font-size:18px;font-weight:600;line-height:1.4;
  color:var(--color-ink);
  margin-top:28px;margin-bottom:10px;
}
/* Zeilenlänge auf ein gut lesbares Maß begrenzen (~70 Zeichen) */
.svh-legal p{
  color:var(--color-muted);font-size:16px;line-height:1.7;
  margin-bottom:16px;max-width:70ch;
}
.svh-legal ul{
  margin:0 0 16px;padding-left:22px;max-width:70ch;
  list-style:disc;
  color:var(--color-muted);font-size:16px;line-height:1.7;
}
.svh-legal li::marker{color:var(--color-brand)}
.svh-legal li{margin-bottom:8px}
.svh-legal a{color:var(--color-brand-deep)}
.svh-legal a:hover{text-decoration:underline}
.svh-legal strong{color:var(--color-ink);font-weight:600}
`;

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <style>{LEGAL_CSS}</style>
      <Navbar />
      <main className="section">
        <div className="shell">
          <div style={{ maxWidth: 800, marginInline: "auto" }}>
            <h1 className="t-h2">{title}</h1>

            <div
              className="mt-8"
              style={{
                background: "var(--color-tint-3)",
                border: "1px solid var(--color-tint-1)",
                borderRadius: 16,
                padding: "18px 22px",
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--color-ink)",
              }}
            >
              Dieser Text ist ein sorgfältig vorbereiteter Entwurf und ersetzt keine Rechtsberatung.
              Bitte vor dem Livegang anwaltlich prüfen lassen.
            </div>

            <div className="svh-legal mt-6">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
