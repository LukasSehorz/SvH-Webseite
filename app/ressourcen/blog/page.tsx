import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import SubpageHero from "../../components/SubpageHero";
import EmptyState, { ResourceGrid } from "../../components/company/EmptyState";
import { blogPage } from "../../content-pages";
import { company } from "../../content";

export const metadata: Metadata = {
  title: `${blogPage.metaTitle} – ${company.name}`,
  description: blogPage.metaDescription,
};

export default function BlogPage() {
  const posts = blogPage.posts;

  return (
    <PageShell>
      <SubpageHero
        eyebrow={blogPage.hero.eyebrow}
        titleDark={blogPage.hero.titleDark}
        titleBrand={blogPage.hero.titleBrand}
        lead={blogPage.hero.lead}
      />

      {posts.length > 0 ? (
        <ResourceGrid
          items={posts.map((p) => ({
            title: p.title,
            badge: p.date,
            excerpt: p.excerpt,
            href: p.href,
            image: p.image,
          }))}
        />
      ) : (
        <EmptyState
          title={blogPage.empty.title}
          body={blogPage.empty.body}
          cta={blogPage.empty.cta}
        />
      )}
    </PageShell>
  );
}
