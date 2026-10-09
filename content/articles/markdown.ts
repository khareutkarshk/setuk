/* Markdown to article blocks. Only the subset Prose can draw: ## and ### headings, paragraphs,
   > quotes, - and 1. lists, | tables (first row is the header) and ![alt](mediaKey) pictures.
   Text is plain: no inline bold, italics or links. Kept free of path aliases so tools can load it. */
import type { ArticleBlock } from "../types";

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
const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isRule = (line: string) => cells(line).every((c) => /^:?-{2,}:?$/.test(c));

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

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (more((l) => l.trim().startsWith(">"))) parts.push(lines[i++].trim().replace(/^>\s?/, ""));
      blocks.push({ t: "quote", x: parts.join(" ").trim() });
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
    while (more((l) => !/^\s*(#{1,6}\s|>|\||!\[)/.test(l) && !ul.test(l) && !ol.test(l))) parts.push(lines[i++].trim());
    blocks.push({ t: "p", x: parts.join(" ") });
  }
  return { h1, blocks };
}
