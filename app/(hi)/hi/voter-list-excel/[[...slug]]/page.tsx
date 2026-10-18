import { notFound } from "next/navigation";
import { PageShell } from "@/components/pages/page-shell";
import { VoterListPage, areaVars, fill } from "@/components/pages/voter-list";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";
import { getVoterListView } from "@/lib/voter-list/api";

/* /voter-list-excel, then /[state], its lists (/[state]/all-districts, all-assembly-constituencies,
   all-parliamentary-constituencies), /[state]/[pc], /[state]/[district] and /[state]/[district]/[ac],
   as on the live site; the data comes from lib/voter-list/api.ts, so unknown areas 404 */
type Props = { params: Promise<{ slug?: string[] }> };

/* Static on first visit: no paths at build time (thousands of areas), each one rendered when first
   asked for and then served as a static page, so a CDN can cache it. Without this every visit was
   rendered afresh with Cache-Control: no-store. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const slugs = (await params).slug ?? [];
  const view = await getVoterListView(slugs);
  const p = getDictionary("hi").pages.voterList;
  if (!view) return { title: `${getDictionary("hi").notFound.title} | Setuk` };
  const meta = view.level === "all" ? p.meta : p.metaArea[view.level];
  const vars = areaVars(view);
  return buildMetadata("hi", routes.voterListArea(slugs), { title: fill(meta.title, vars), description: fill(meta.description, vars) });
}

export default async function Page({ params }: Props) {
  const slugs = (await params).slug ?? [];
  const view = await getVoterListView(slugs);
  if (!view) notFound();
  return (
    <PageShell locale="hi" path={routes.voterListArea(slugs)} cta={false}>
      <VoterListPage locale="hi" view={view} />
    </PageShell>
  );
}
