import type { QA } from "@/content/types";
import * as I from "@/components/icons";

/**
 * Questions and answers as native disclosures: readable and keyboard-accessible without script.
 * `id` lets the FAQ page's search address each item.
 */
export function Faqs({ items, idPrefix }: { items: QA[]; idPrefix?: string }) {
  return (
    <div className="border-t border-line">
      {items.map((x, i) => (
        <details key={x.q} id={idPrefix ? `${idPrefix}-${i}` : undefined} data-faq className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
            <span data-q>{x.q}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-accent-ink">
              <I.Plus size={16} aria-hidden />
            </span>
          </summary>
          <p data-a className="max-w-[68ch] pb-6 leading-relaxed text-muted">{x.a}</p>
        </details>
      ))}
    </div>
  );
}
