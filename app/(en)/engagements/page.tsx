import { EngagementsPage } from "@/components/pages/engagements";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("en", routes.engagements, getDictionary("en").pages.engagements.meta);

export default function Page() {
  return (
    <PageShell locale="en" path={routes.engagements}>
      <EngagementsPage locale="en" />
    </PageShell>
  );
}
