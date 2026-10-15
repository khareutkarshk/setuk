import { getDictionary, type Locale } from "@/content";
import type { RoleKey } from "@/content/types";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";
import { PageShell } from "../page-shell";
import { ConsultantsPage } from "./consultants-page";
import { OfficeRolePage } from "./office-page";

/** Metadata for a role page, in either language */
export function roleMetadata(locale: Locale, role: RoleKey) {
  return buildMetadata(locale, routes.roles[role], getDictionary(locale).pages.roles[role].meta);
}

/**
 * A role page in its shell: the page's own closing call to action, and its questions as FAQPage
 * structured data. The app routes (app/(en)/for-*, app/(hi)/hi/for-*) only name the role and locale.
 */
export function RoleRoute({ locale, role }: { locale: Locale; role: RoleKey }) {
  const r = getDictionary(locale).pages.roles[role];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "hi" ? "hi-IN" : "en-IN",
    mainEntity: r.faq.items.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } }))
  };
  return (
    <PageShell locale={locale} path={routes.roles[role]} cta={{ ...r.cta, primary: r.primary }} jsonLd={jsonLd}>
      {role === "consultants" ? <ConsultantsPage locale={locale} /> : <OfficeRolePage role={role} locale={locale} />}
    </PageShell>
  );
}
