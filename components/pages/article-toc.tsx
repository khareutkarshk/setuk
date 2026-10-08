"use client";

import { useEffect, useState } from "react";

/**
 * The article's table of contents. It marks the section being read, so a long guide always shows
 * where you are in it. Plain anchor links underneath, so it works before hydration too.
 */
export function ArticleToc({ items, label }: { items: { id: string; text: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    /* the current section is the last heading that has passed a line a third of the way down */
    const io = new IntersectionObserver(() => {
      const line = innerHeight * 0.33;
      let cur = els[0]?.id;
      for (const e of els) if (e.getBoundingClientRect().top < line) cur = e.id;
      setActive(cur);
    }, { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] });
    els.forEach((e) => io.observe(e));
    const onScroll = () => {
      const line = innerHeight * 0.33;
      let cur = els[0]?.id;
      for (const e of els) if (e.getBoundingClientRect().top < line) cur = e.id;
      setActive((a) => (a === cur ? a : cur));
    };
    addEventListener("scrollend", onScroll);
    return () => { io.disconnect(); removeEventListener("scrollend", onScroll); };
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "location" : undefined}
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[14px] leading-snug text-muted transition-colors hover:text-ink aria-[current]:border-accent aria-[current]:font-medium aria-[current]:text-ink">
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
