/* Markdown to article blocks. Only the subset Prose can draw: ## and ### headings, paragraphs,
   > quotes (a last "> — Name" line credits them), > [!NOTE] / [!TIP] / [!WARNING] callouts,
   - and 1. lists, ::: steps fences, | tables (first row is the header), ![alt](mediaKey) pictures,
   @[title](YouTube URL) videos and [^id]: citations. Inside text, [links](...), **bold** and [^id]
   markers stay as typed in the string; Prose draws them. Kept free of path aliases so tools can load it. */
import type { ArticleBlock, CalloutKind } from "../types";

export type FrontMatter = Record<string, string | number>;

/** Splits `---` front matter (one `key: value` per line) from the body */
export function splitFrontMatter(src: string): { data: FrontMatter; body: string } {
  const text = src.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data: FrontMatter = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i < 0) throw new Error(`front matter line has no "key:": ${line}`);
    const key = line.slice(0, i).trim();
    let raw = line.slice(i + 1).trim();
    if (raw.startsWith('"')) raw = JSON.parse(raw);
    else if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1).replace(/''/g, "'");
    data[key] = /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
  }
  return { data, body: text.slice(m[0].length) };
}

const ul = /^\s*[-*+]\s+(.*)$/;
const ol = /^\s*\d+[.)]\s+(.*)$/;
const img = /^!\[([^\]]*)\]\(\s*([^)\s]+)\s*\)$/;
const video = /^@\[([^\]]+)\]\(\s*([^)\s]+)\s*\)$/;
const note = /^\[\^([\w-]+)\]:\s+(.*)$/;
const fence = /^:::\s*(\w*)\s*$/;
const callout = /^\[!(note|tip|warning)\]\s*(.*)$/i;
const credit = /^(?:—|--)\s*(.+)$/;
const stepHead = /^\*\*(.+?)\*\*[.:]?\s*(.*)$/;
const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isRule = (line: string) => cells(line).every((c) => /^:?-{2,}:?$/.test(c));

/** Inline markup Prose understands: [^id] citations, **bold** and [text](href) links */
export const inline = /\[\^([\w-]+)\]|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Text with the inline markup taken out, for descriptions and search snippets */
export const plain = (x: string) => x.replace(inline, (_, _id, b, t) => b ?? t ?? "").replace(/\s+([.,;:])/g, "$1").trim();

/** The video id from a youtube.com/watch, youtu.be, /embed or /shorts address */
function youtubeId(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m)\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com" ? (u.searchParams.get("v") ?? /^\/(?:embed|shorts)\/([^/]+)/.exec(u.pathname)?.[1])
      : undefined;
    if (id && /^[\w-]{11}$/.test(id)) return id;
  } catch {}
  throw new Error(`"${url}" is not a YouTube video address`);
}

/** Every href written inside text, so the loader can check the internal ones */
export function linksIn(blocks: ArticleBlock[]) {
  return JSON.stringify(blocks).match(/\]\(([^)\s"]+)\)/g)?.map((m) => m.slice(2, -1)) ?? [];
}

/** Parses the body; `h1` is the first `# ` heading, if any (used as the title fallback) */
export function parseMarkdown(body: string): { h1?: string; blocks: ArticleBlock[] } {
  const lines = body.split("\n");
  const blocks: ArticleBlock[] = [];
  let h1: string | undefined;
  let i = 0;
  const more = (test: (l: string) => boolean) => i < lines.length && lines[i].trim() !== "" && test(lines[i]);

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    const h = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line);
    if (h) {
      i++;
      if (h[1].length === 1) { if (h1 === undefined) h1 = h[2]; else blocks.push({ t: "h2", x: h[2] }); }
      else blocks.push({ t: h[1].length === 2 ? "h2" : "h3", x: h[2] });
      continue;
    }

    const pic = img.exec(line);
    if (pic) {
      blocks.push({ t: "img", img: pic[2] as Extract<ArticleBlock, { t: "img" }>["img"], alt: pic[1] });
      i++;
      continue;
    }

    const vid = video.exec(line);
    if (vid) {
      blocks.push({ t: "video", title: vid[1], youtube: youtubeId(vid[2]) });
      i++;
      continue;
    }

    const open = fence.exec(line);
    if (open) {
      if (open[1] !== "steps") throw new Error(`unknown block "::: ${open[1]}", only "::: steps" is supported`);
      const start = i++;
      const items: { title: string; x: string }[] = [];
      for (; i < lines.length && !fence.test(lines[i].trim()); i++) {
        const l = lines[i].trim();
        if (!l) continue;
        const m = ol.exec(l);
        if (!m) { if (!items.length) throw new Error(`step ${start + 1}: start each step with "1. **Title**"`); items[items.length - 1].x += " " + l; continue; }
        const head = stepHead.exec(m[1].trim());
        if (!head) throw new Error(`line ${i + 1}: a step needs a bold title, as in "1. **Title** what to do"`);
        items.push({ title: head[1].replace(/[.:]$/, ""), x: head[2] });
      }
      if (i >= lines.length) throw new Error(`line ${start + 1}: "::: steps" is never closed with ":::"`);
      i++;
      blocks.push({ t: "steps", items: items.map((s) => ({ ...s, x: s.x.trim() })) });
      continue;
    }

    if (note.test(line)) {
      const items: { id: string; x: string }[] = [];
      while (more((l) => note.test(l.trim()) || /^\s/.test(l))) {
        const m = note.exec(lines[i].trim());
        if (m) items.push({ id: m[1], x: m[2].trim() });
        else items[items.length - 1].x += " " + lines[i].trim();
        i++;
      }
      blocks.push({ t: "refs", items });
      continue;
    }

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (more((l) => l.trim().startsWith(">"))) parts.push(lines[i++].trim().replace(/^>\s?/, ""));
      const box = callout.exec(parts[0]);
      if (box) {
        const x = parts.slice(1).join(" ").trim();
        blocks.push({ t: "callout", kind: box[1].toLowerCase() as CalloutKind, ...(box[2] && { title: box[2] }), x });
        continue;
      }
      const by = parts.length > 1 ? credit.exec(parts[parts.length - 1]) : null;
      blocks.push({ t: "quote", x: (by ? parts.slice(0, -1) : parts).join(" ").trim(), ...(by && { by: by[1] }) });
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (more((l) => l.trim().startsWith("|"))) {
        const l = lines[i++];
        if (!isRule(l)) rows.push(cells(l));
      }
      blocks.push({ t: "table", rows });
      continue;
    }

    const list = ul.test(line) ? ul : ol.test(line) ? ol : null;
    if (list) {
      const items: string[] = [];
      while (more((l) => list.test(l) || /^\s/.test(l))) {
        const m = list.exec(lines[i]);
        if (m) items.push(m[1].trim());
        else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      blocks.push({ t: list === ul ? "ul" : "ol", items });
      continue;
    }

    const parts = [lines[i++].trim()];
    while (more((l) => !/^\s*(#{1,6}\s|>|\||!\[|@\[|:::|\[\^[\w-]+\]:)/.test(l) && !ul.test(l) && !ol.test(l))) parts.push(lines[i++].trim());
    blocks.push({ t: "p", x: parts.join(" ") });
  }

  const defined = blocks.flatMap((b) => (b.t === "refs" ? b.items.map((r) => r.id) : []));
  const dupe = defined.find((id, k) => defined.indexOf(id) !== k);
  if (dupe) throw new Error(`citation [^${dupe}] is defined twice`);
  for (const [, id] of JSON.stringify(blocks.filter((b) => b.t !== "refs")).matchAll(/\[\^([\w-]+)\]/g))
    if (!defined.includes(id)) throw new Error(`citation [^${id}] has no "[^${id}]: source" line`);
  return { h1, blocks };
}
