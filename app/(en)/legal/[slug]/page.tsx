import { notFound } from "next/navigation";
import { findLegalDoc, LegalDocPage } from "@/components/pages/legal";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { legalDocs } from "@/content/legal";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const d = findLegalDoc((await params).slug);
  if (!d) return {};
  const t = getDictionary("en");
  return buildMetadata("en", routes.legalDoc(d.slug), { title: `${t.pages.legal.docs[d.slug].t} | ${t.brand.name}`, description: d.description });
}

export default async function Page({ params }: Props) {
  const d = findLegalDoc((await params).slug);
  if (!d) notFound();
  return (
    <PageShell locale="en" path={routes.legalDoc(d.slug)} cta={false}>
      <LegalDocPage locale="en" doc={d} />
    </PageShell>
  );
}
