import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/content";
import { inline } from "@/content/articles/markdown";
import { media } from "@/content/media";
import type { ArticleBlock, CalloutKind, Pages } from "@/content/types";
import * as I from "@/components/icons";
import { href } from "@/lib/paths";

type Labels = Pages["common"]["prose"];

/** Anchor ids for the h2s, unique within one text; the table of contents uses the same ones */
export function headingIds(blocks: ArticleBlock[]) {
  const seen = new Map<string, number>();
  const out: { id: string; text: string }[] = [];
  for (const b of blocks) {
    if (b.t !== "h2") continue;
    const base = b.x.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? `${base}-${n + 1}` : base, text: b.x });
  }
  return out;
}

const CALLOUT_ICON: Record<CalloutKind, typeof I.Info> = { note: I.Info, tip: I.Lightbulb, warning: I.WarningCircle };

type Ctx = { locale: Locale; labels: Labels; refs: Map<string, number>; cited: Set<string> };

/**
 * Draws one string's inline markup: site links stay in the reader's locale, others open in a new
 * tab. A plain call, not a component, so citations are met in reading order (see `cited`).
 */
function text(x: string, ctx: Ctx): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of x.matchAll(inline)) {
    const [whole, id, bold, text, to] = m;
    out.push(x.slice(last, m.index));
    const k = m.index;
    if (id) {
      const n = ctx.refs.get(id)!;
      // the first mention carries the id the source list links back to
      const first = !ctx.cited.has(id);
      ctx.cited.add(id);
      out.push(<sup key={k} className="prose-cite"><a href={`#ref-${id}`} id={first ? `cite-${id}` : undefined} aria-label={ctx.labels.cite.replace("{n}", String(n))}>{n}</a></sup>);
    } else if (bold) out.push(<strong key={k}>{bold}</strong>);
    else if (to.startsWith("/")) out.push(<Link key={k} href={href(ctx.locale, to)}>{text}</Link>);
    else if (to.startsWith("#")) out.push(<a key={k} href={to}>{text}</a>);
    else {
      // the arrow stays with the last word rather than wrapping onto a line of its own
      const cut = text.lastIndexOf(" ") + 1;
      out.push(<a key={k} href={to} target="_blank" rel="noopener noreferrer">{text.slice(0, cut)}<span className="whitespace-nowrap">{text.slice(cut)}<I.ArrowUpRight className="prose-ext" aria-hidden /></span><span className="sr-only"> {ctx.labels.external}</span></a>);
    }
    last = k + whole.length;
  }
  out.push(x.slice(last));
  return out;
}

/**
 * Long-form text from structured blocks (articles and policies). Typography lives here, in one
 * place: a 68ch measure, generous leading, quiet tables, and pictures in the site's frame.
 */
export function Prose({ blocks, locale, labels, className = "" }: { blocks: ArticleBlock[]; locale: Locale; labels: Labels; className?: string }) {
  const ids = headingIds(blocks);
  let h = 0;
  // citations are numbered in the order their sources are listed
  const refs = new Map(blocks.flatMap((b) => (b.t === "refs" ? b.items.map((r) => r.id) : [])).map((id, k) => [id, k + 1]));
  const ctx = { locale, labels, refs, cited: new Set<string>() };
  const t = (x: string) => text(x, ctx);
  return (
    <div className={`prose-setuk ${className}`}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} id={ids[h++].id}>{b.x}</h2>;
          case "h3":
            return <h3 key={i}>{b.x}</h3>;
          case "p":
            return <p key={i}>{t(b.x)}</p>;
          case "quote":
            return (
              <figure key={i} className="prose-quote">
                <blockquote>{t(b.x)}</blockquote>
                {b.by && <figcaption>{b.by}</figcaption>}
              </figure>
            );
          case "callout": {
            const Icon = CALLOUT_ICON[b.kind];
            return (
              <aside key={i} className="prose-callout" data-kind={b.kind}>
                <Icon className="prose-callout-icon" weight="duotone" aria-hidden />
                <div>
                  <p className="prose-callout-title">{b.title ?? labels[b.kind]}</p>
                  {b.x && <p>{t(b.x)}</p>}
                </div>
              </aside>
            );
          }
          case "ul":
            return <ul key={i}>{b.items.map((x, k) => <li key={k}>{t(x)}</li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((x, k) => <li key={k}>{t(x)}</li>)}</ol>;
          case "steps":
            return (
              <ol key={i} className="prose-steps">
                {b.items.map((s, k) => (
                  <li key={k}>
                    <span className="prose-step-n" aria-hidden>{k + 1}</span>
                    <p className="prose-step-title">{s.title}</p>
                    {s.x && <p>{t(s.x)}</p>}
                  </li>
                ))}
              </ol>
            );
          case "video":
            return (
              <figure key={i} className="prose-video">
                <div>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${b.youtube}?rel=0`}
                    title={`${labels.video}: ${b.title}`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <figcaption>{b.title}</figcaption>
              </figure>
            );
          case "refs":
            return (
              <ol key={i} className="prose-refs">
                {b.items.map((r) => (
                  <li key={r.id} id={`ref-${r.id}`}>
                    {t(r.x)}{" "}
                    {ctx.cited.has(r.id) && <a href={`#cite-${r.id}`} className="prose-back" aria-label={labels.back}>↩</a>}
                  </li>
                ))}
              </ol>
            );
          case "table": {
            const [head, ...rows] = b.rows;
            return (
              <div key={i} className="prose-table">
                <table>
                  <thead><tr>{head.map((c, k) => <th key={k} scope="col">{t(c)}</th>)}</tr></thead>
                  <tbody>{rows.map((r, k) => <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{t(c)}</th> : <td key={j}>{t(c)}</td>))}</tr>)}</tbody>
                </table>
              </div>
            );
          }
          case "img":
            return (
              <figure key={i} className="illo">
                <Image src={media[b.img]} alt={b.alt} sizes="(min-width: 1024px) 720px, 100vw" placeholder="blur" className="h-auto w-full" />
              </figure>
            );
        }
      })}
    </div>
  );
}
