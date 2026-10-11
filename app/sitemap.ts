import type { MetadataRoute } from "next";
import { getArticles } from "@/content/articles";
import { legalDocs } from "@/content/legal";
import { site } from "@/content/site";
import { href, routes } from "@/lib/paths";
import { getVoterListPaths } from "@/lib/voter-list/api";

/** Every page in both languages, each listing its other-language version */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    routes.home, routes.how, routes.engagements, routes.about, routes.articles, routes.faqs, routes.contact, routes.legal,
    ...getArticles().map((a) => routes.article(a.slug)),
    ...legalDocs.map((d) => routes.legalDoc(d.slug)),
    ...(await getVoterListPaths()).map(routes.voterListArea)
  ];
  return paths.flatMap((p) => (["en", "hi"] as const).map((l) => ({
    url: site.url + href(l, p),
    alternates: { languages: { "en-IN": site.url + href("en", p), "hi-IN": site.url + href("hi", p) } }
  })));
}
