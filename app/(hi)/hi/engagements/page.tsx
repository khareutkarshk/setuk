import { EngagementsPage } from "@/components/pages/engagements";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("hi", routes.engagements, getDictionary("hi").pages.engagements.meta);

export default function Page() {
  return (
    <PageShell locale="hi" path={routes.engagements}>
      <EngagementsPage locale="hi" />
    </PageShell>
  );
}
