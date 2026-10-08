import { notFound } from "next/navigation";
import { ArticlePage, findArticle } from "@/components/pages/articles";
import { PageShell } from "@/components/pages/page-shell";
import { articles } from "@/content/articles";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";
import { href, routes } from "@/lib/paths";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const a = findArticle((await params).slug);
  if (!a) return {};
  return buildMetadata("hi", routes.article(a.slug), { title: `${a.title} | Setuk`, description: a.description, type: "article", image: media[a.cover].src });
}

export default async function Page({ params }: Props) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    inLanguage: "en-IN",
    image: site.url + media[a.cover].src,
    author: { "@type": "Organization", name: site.legalName, url: site.url },
    publisher: { "@type": "Organization", name: site.legalName, logo: { "@type": "ImageObject", url: `${site.url}/icon.png` } },
    mainEntityOfPage: site.url + href("hi", routes.article(a.slug))
  };
  return (
    <PageShell locale="hi" path={routes.article(a.slug)} jsonLd={jsonLd}>
      <ArticlePage locale="hi" article={a} />
    </PageShell>
  );
}
