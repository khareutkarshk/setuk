import { LegalPage } from "@/components/pages/legal";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("en", routes.legal, getDictionary("en").pages.legal.meta);

export default function Page() {
  return (
    <PageShell locale="en" path={routes.legal} cta={false}>
      <LegalPage locale="en" />
    </PageShell>
  );
}
