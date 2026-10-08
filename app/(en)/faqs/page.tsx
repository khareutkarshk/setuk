import { FaqsPage } from "@/components/pages/faqs";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("en", routes.faqs, getDictionary("en").pages.faqs.meta);

export default function Page() {
  return (
    <PageShell locale="en" path={routes.faqs}>
      <FaqsPage locale="en" />
    </PageShell>
  );
}
