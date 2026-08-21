import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import SubpageHero from "../../components/SubpageHero";
import AboutStory from "../../components/company/AboutStory";
import AboutValues from "../../components/company/AboutValues";
import AboutTeam from "../../components/company/AboutTeam";
import { ButtonLink, Reveal } from "../../components/ui";
import { aboutPage } from "../../content-pages";
import { company } from "../../content";

export const metadata: Metadata = {
  title: `${aboutPage.metaTitle} – ${company.name}`,
  description: aboutPage.metaDescription,
};

export default function UeberUnsPage() {
  return (
    <PageShell>
      <SubpageHero
        eyebrow={aboutPage.hero.eyebrow}
        titleDark={aboutPage.hero.titleDark}
        titleBrand={aboutPage.hero.titleBrand}
        lead={aboutPage.hero.lead}
      />

      <AboutStory title={aboutPage.story.title} paragraphs={aboutPage.story.paragraphs} />

      <AboutValues title={aboutPage.values.title} items={aboutPage.values.items} />

      <AboutTeam title={aboutPage.team.title} members={aboutPage.team.members} />

      {/* Kontakt-Abschluss */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="about-cta-title">
        <div className="shell">
          <Reveal>
            <div
              style={{
                borderRadius: 40,
                background: "var(--color-tint-3)",
                padding: "clamp(40px, 6vw, 72px) clamp(20px, 5vw, 72px)",
                textAlign: "center",
              }}
            >
              <h2 className="t-h2" id="about-cta-title">
                Lernen wir uns kennen.
              </h2>
              <p className="t-lead mx-auto" style={{ marginTop: 18, maxWidth: 560 }}>
                Ein erstes Gespräch dauert etwa 20 Minuten, kostet nichts und verpflichtet zu
                nichts.
              </p>
              <div style={{ marginTop: 36 }}>
                <ButtonLink href="/unternehmen/kontakt" variant="dark">
                  Kontakt aufnehmen
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
