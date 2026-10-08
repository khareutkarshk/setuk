import { ArticlesPage } from "@/components/pages/articles";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("en", routes.articles, getDictionary("en").pages.articles.meta);

export default function Page() {
  return (
    <PageShell locale="en" path={routes.articles}>
      <ArticlesPage locale="en" />
    </PageShell>
  );
}
