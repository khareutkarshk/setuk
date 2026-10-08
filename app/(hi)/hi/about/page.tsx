import { AboutPage } from "@/components/pages/about";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("hi", routes.about, getDictionary("hi").pages.about.meta);

export default function Page() {
  return (
    <PageShell locale="hi" path={routes.about}>
      <AboutPage locale="hi" />
    </PageShell>
  );
}
