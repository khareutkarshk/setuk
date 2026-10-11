import { notFound } from "next/navigation";
import { PageShell } from "@/components/pages/page-shell";
import { VoterListPage, areaVars, fill } from "@/components/pages/voter-list";
import { getDictionary } from "@/content";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/paths";
import { getVoterListView } from "@/lib/voter-list/api";

/* /voter-list-excel, then /[state], /[state]/[district] and /[state]/[district]/[ac]; the data
   comes from lib/voter-list/api.ts, so unknown areas 404 */
type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props) {
  const slugs = (await params).slug ?? [];
  const view = await getVoterListView(slugs);
  const p = getDictionary("hi").pages.voterList;
  if (!view) return {};
  const area = view.trail.ac ?? view.trail.district ?? view.trail.state;
  const meta = area ? p.metaArea[area.level] : p.meta;
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
