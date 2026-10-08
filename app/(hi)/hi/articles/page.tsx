import { ArticlesPage } from "@/components/pages/articles";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("hi", routes.articles, getDictionary("hi").pages.articles.meta);

export default function Page() {
  return (
    <PageShell locale="hi" path={routes.articles}>
      <ArticlesPage locale="hi" />
    </PageShell>
  );
}
