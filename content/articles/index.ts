/* Articles are the .md files in this folder; the file name is the slug. See README.md here for
   the format. Read at build time (every page that shows them is static). */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { en } from "../en";
import { legalDocs } from "../legal";
import { media, type MediaKey } from "../media";
import type { Article, TopicKey } from "../types";
import { linksIn, parseMarkdown, plain, splitFrontMatter } from "./markdown";

const dir = path.join(process.cwd(), "content", "articles");

/** Slugs from the file names alone; next.config uses the same rule without loading the files */
export const isArticleFile = (name: string) => name.endsWith(".md") && !name.startsWith("_") && name !== "README.md";

/** Locale-free paths a link inside an article may point at (lib/paths adds /hi when needed) */
function knownPaths(slugs: string[]) {
  const pages = ["/", "/how-we-work", "/engagements", "/about", "/articles", "/faqs", "/contact", "/legal"];
  return new Set([...pages, ...slugs.map((s) => `/articles/${s}`), ...legalDocs.map((d) => `/legal/${d.slug}`)]);
}

function load(): Article[] {
  const topics = Object.keys(en.pages.articles.topics);
  const files = readdirSync(dir).filter(isArticleFile);
  const paths = knownPaths(files.map((f) => f.slice(0, -3)));
  const list = files.map((file) => {
    const slug = file.slice(0, -3);
    const fail = (msg: string): never => { throw new Error(`content/articles/${file}: ${msg}`); };
    const { data, body } = splitFrontMatter(readFileSync(path.join(dir, file), "utf8"));
    const { h1, blocks } = (() => { try { return parseMarkdown(body); } catch (e) { return fail((e as Error).message); } })();

    const str = (k: string) => (data[k] === undefined ? undefined : String(data[k]));
    const title = str("title") ?? h1 ?? fail('needs a "title" (or a # heading)');
    const topic = str("topic") ?? fail(`needs a "topic", one of ${topics.join(", ")}`);
    if (!topics.includes(topic)) fail(`unknown topic "${topic}", use one of ${topics.join(", ")}`);
    const cover = str("cover") ?? fail('needs a "cover" picture (a key from content/media.ts)');
    for (const key of [cover, ...blocks.flatMap((b) => (b.t === "img" ? [b.img] : []))])
      if (!(key in media)) fail(`unknown picture "${key}", use a key from content/media.ts`);

    for (const link of linksIn(blocks)) {
      if (link.startsWith("/") && !paths.has(link.split("#")[0])) fail(`link to "${link}" goes nowhere; use a site path such as /how-we-work or /articles/<file name>`);
      if (!link.startsWith("/") && !/^(https?:|mailto:|#)/.test(link)) fail(`link "${link}" should start with /, https:// or mailto:`);
    }

    const firstP = blocks.find((b) => b.t === "p");
    const words = blocks.reduce((n, b) => n + JSON.stringify(b).split(/\s+/).length, 0);
    const article: Article = {
      slug,
      topic: topic as TopicKey,
      cover: cover as MediaKey,
      title,
      description: str("description") ?? (firstP && "x" in firstP ? plain(firstP.x) : title),
      minutes: Number(data.minutes) || Math.max(1, Math.round(words / 220)),
      blocks
    };
    return { article, order: Number(data.order ?? Infinity) };
  });
  // lowest "order" first (the first one is featured); files without one follow, by title
  return list.sort((a, b) => a.order - b.order || a.article.title.localeCompare(b.article.title)).map((x) => x.article);
}

let cached: Article[] | undefined;

/** All articles in display order. Re-read on every call in development, so edits show on reload */
export function getArticles(): Article[] {
  if (!cached || process.env.NODE_ENV === "development") cached = load();
  return cached;
}

export function findArticle(slug: string) {
  return getArticles().find((a) => a.slug === slug);
}
