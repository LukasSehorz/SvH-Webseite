import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import SubpageHero from "../../components/SubpageHero";
import EmptyState, { ResourceGrid } from "../../components/company/EmptyState";
import { casesPage } from "../../content-pages";
import { company } from "../../content";

export const metadata: Metadata = {
  title: `${casesPage.metaTitle} – ${company.name}`,
  description: casesPage.metaDescription,
};

export default function FallstudienPage() {
  const cases = casesPage.cases;

  return (
    <PageShell>
      <SubpageHero
        eyebrow={casesPage.hero.eyebrow}
        titleDark={casesPage.hero.titleDark}
        titleBrand={casesPage.hero.titleBrand}
        lead={casesPage.hero.lead}
      />

      {cases.length > 0 ? (
        <ResourceGrid
          items={cases.map((c) => ({
            title: c.client,
            badge: c.industry,
            excerpt: c.summary,
            href: c.href,
            image: c.image,
          }))}
        />
      ) : (
        <EmptyState
          title={casesPage.empty.title}
          body={casesPage.empty.body}
          cta={casesPage.empty.cta}
        />
      )}
    </PageShell>
  );
}
