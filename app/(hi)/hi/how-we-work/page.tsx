import { HowWeWorkPage } from "@/components/pages/how-we-work";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("hi", routes.how, getDictionary("hi").pages.how.meta);

export default function Page() {
  return (
    <PageShell locale="hi" path={routes.how}>
      <HowWeWorkPage locale="hi" />
    </PageShell>
  );
}
