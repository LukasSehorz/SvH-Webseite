import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicePages } from "../../content-pages";
import PageShell from "../../components/PageShell";
import ServicePageView from "../../components/service/ServicePageView";

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
  };
}

export default async function LeistungDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <PageShell>
      <ServicePageView page={page} />
    </PageShell>
  );
}
