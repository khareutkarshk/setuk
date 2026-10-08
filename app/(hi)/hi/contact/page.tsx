import { ContactPage } from "@/components/pages/contact";
import { PageShell } from "@/components/pages/page-shell";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";

export const metadata = buildMetadata("hi", routes.contact, getDictionary("hi").pages.contact.meta);

export default function Page() {
  return (
    <PageShell locale="hi" path={routes.contact} cta={false}>
      <ContactPage locale="hi" />
    </PageShell>
  );
}
