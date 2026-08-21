import type { Metadata } from "next";
import { servicePages, servicesOverview } from "../content-pages";
import PageShell from "../components/PageShell";
import SubpageHero from "../components/SubpageHero";
import ServiceCta from "../components/service/ServiceCta";
import PillarMockup from "../components/AMockups";
import { ArrowUpRight, CheckIcon, Reveal } from "../components/ui";

export const metadata: Metadata = {
  title: servicesOverview.metaTitle,
  description: servicesOverview.metaDescription,
};

/** Ordnet jeder Leistungsseite das Mockup der passenden Säule zu. */
const PILLAR_ID: Record<string, "ki" | "marketing" | "web"> = {
  "ki-automatisierung-agenten": "ki",
  marketing: "marketing",
  webseiten: "web",
};

export default function LeistungenUebersicht() {
  return (
    <PageShell>
      <SubpageHero
        eyebrow={servicesOverview.hero.eyebrow}
        titleDark={servicesOverview.hero.titleDark}
        titleBrand={servicesOverview.hero.titleBrand}
        lead={servicesOverview.hero.lead}
        cta={servicesOverview.hero.cta}
        ctaHref="/unternehmen/kontakt"
      />

      <section className="section" aria-labelledby="leistungen-titel">
        <div className="shell">
          <h2 id="leistungen-titel" className="sr-only">
            Unsere Leistungen im Überblick
          </h2>

          <div className="grid grid-cols-1 gap-8">
            {servicePages.map((page, i) => {
              // Mockup abwechselnd rechts / links — wie die Säulen der Startseite.
              const mockupLeft = i % 2 === 1;
              return (
                <Reveal key={page.slug} delay={i * 0.06}>
                  <article
                    className="card card-hover overflow-hidden"
                    style={{ padding: "clamp(28px,3.4vw,48px)" }}
                  >
                    <div className="overview-grid">
                      <div className="overview-text flex flex-col justify-center">
                        <p
                          className="t-eyebrow"
                          style={{ color: "var(--color-brand-deep)", fontSize: 13 }}
                        >
                          {String(i + 1).padStart(2, "0")} — {page.navHint.replace(/\.$/, "")}
                        </p>
                        <h3
                          className="t-h2"
                          style={{ marginTop: 14, fontSize: "clamp(28px,2.9vw,42px)" }}
                        >
                          {page.navLabel}
                        </h3>
                        <p className="t-lead" style={{ marginTop: 16, maxWidth: 520 }}>
                          {page.hero.lead}
                        </p>

                        <ul
                          style={{
                            listStyle: "none",
                            margin: "24px 0 0",
                            padding: 0,
                            display: "grid",
                            gap: 12,
                          }}
                        >
                          {page.capabilities.items.slice(0, 3).map((item) => (
                            <li key={item.title} className="flex items-start gap-3">
                              <span
                                className="mt-[2px] shrink-0"
                                style={{ color: "var(--color-brand)" }}
                              >
                                <CheckIcon size={20} />
                              </span>
                              <span
                                style={{ fontSize: 16, lineHeight: 1.5, color: "var(--color-muted)" }}
                              >
                                {item.title}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <a
                          href={`/leistungen/${page.slug}`}
                          className="btn btn-dark btn-sm self-start"
                          style={{ marginTop: 30 }}
                        >
                          Mehr erfahren
                          <ArrowUpRight />
                        </a>
                      </div>

                      <div className={`overview-mock${mockupLeft ? " is-left" : ""}`}>
                        <PillarMockup id={PILLAR_ID[page.slug] ?? "ki"} />
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <ServiceCta />
    </PageShell>
  );
}
