import Image from "next/image";
import { media } from "@/content/media";
import type { ArticleBlock } from "@/content/types";

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

/**
 * Long-form text from structured blocks (articles and policies). Typography lives here, in one
 * place: a 68ch measure, generous leading, quiet tables, and pictures in the site's frame.
 */
export function Prose({ blocks, className = "" }: { blocks: ArticleBlock[]; className?: string }) {
  const ids = headingIds(blocks);
  let h = 0;
  return (
    <div className={`prose-setuk ${className}`}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} id={ids[h++].id}>{b.x}</h2>;
          case "h3":
            return <h3 key={i}>{b.x}</h3>;
          case "p":
            return <p key={i}>{b.x}</p>;
          case "quote":
            return <blockquote key={i}>{b.x}</blockquote>;
          case "ul":
            return <ul key={i}>{b.items.map((x, k) => <li key={k}>{x}</li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((x, k) => <li key={k}>{x}</li>)}</ol>;
          case "table": {
            const [head, ...rows] = b.rows;
            return (
              <div key={i} className="prose-table">
                <table>
                  <thead><tr>{head.map((c, k) => <th key={k} scope="col">{c}</th>)}</tr></thead>
                  <tbody>{rows.map((r, k) => <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
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
