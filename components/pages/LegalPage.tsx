import type { ReactNode } from "react";
import { legal } from "@/app/copy";
import PageHead from "./PageHead";
import LegalToc from "./LegalToc";
import LegalAnchors from "./LegalAnchors";

export type LegalSection = { id: string; num?: string; title: string; body: ReactNode };

/**
 * Hülle der Rechtsseiten: heller Kopf mit Hinweis, Inhaltsverzeichnis
 * (breit: klebt links mit, schmal: aufklappbar über dem Text) und die Abschnitte
 * in Lesebreite. Die Rechtstexte selbst stehen unverändert in den Seiten.
 */
export default function LegalPage({ title, sections }: Readonly<{ title: string; sections: LegalSection[] }>) {
  const items = sections.map(({ id, num, title: t }) => ({ id, num, title: t }));
  return (
    <main id="inhalt" className="lg">
      <LegalAnchors />
      <PageHead label={legal.label} title={title}>
        <p className="sk-hinweis">{legal.note}</p>
      </PageHead>

      <div className="sb-wrap lg-grid">
        <aside className="lg-aside">
          <LegalToc items={items} label={legal.toc} />
        </aside>

        <div className="lg-main">
          <details className="lg-toc-m">
            <summary>
              <span>{legal.toc}</span>
              <svg viewBox="0 0 10 10" width="12" height="12" fill="none" aria-hidden="true">
                <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <ol>
              {items.map((i) => (
                <li key={i.id}>
                  <a href={`#${i.id}`}>
                    {i.num ? <span className="lg-toc-num">{i.num}</span> : null}
                    {i.num ? " " : null}
                    <span>{i.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="lg-body">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-t`}>
                <h2 className="lg-h2" id={`${s.id}-t`}>
                  {s.num ? <span className="lg-num">{s.num}</span> : null}
                  {s.num ? " " : null}
                  <span>{s.title}</span>
                </h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
