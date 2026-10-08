"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};

/**
 * Topic filter for the article list. The cards are server-rendered with data-topic; this only
 * shows and hides them, and keeps the choice in ?topic= so a filtered list can be shared.
 * Without script every article is listed.
 */
export function ArticleFilter({ topics, all, label, empty, children }: { topics: { key: string; t: string; n: number }[]; all: string; label: string; empty: string; children: ReactNode }) {
  /* the topic in the address wins until the reader picks one */
  const fromUrl = useSyncExternalStore(noop, () => new URLSearchParams(location.search).get("topic"), () => null);
  const [picked, setTopic] = useState<string | null | undefined>(undefined);
  const topic = picked !== undefined ? picked : topics.some((x) => x.key === fromUrl) ? fromUrl : null;
  const ref = useRef<HTMLDivElement>(null);
  const none = !!topic && (topics.find((x) => x.key === topic)?.n ?? 0) === 0;

  useEffect(() => {
    const cards = [...(ref.current?.querySelectorAll<HTMLElement>("[data-topic]") ?? [])];
    for (const c of cards) c.hidden = !!topic && c.dataset.topic !== topic;
    const url = new URL(location.href);
    if (topic) url.searchParams.set("topic", topic); else url.searchParams.delete("topic");
    history.replaceState(null, "", url);
  }, [topic]);

  const chip = "press inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors";
  return (
    <div ref={ref}>
      <div role="group" aria-label={label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <button type="button" aria-pressed={!topic} onClick={() => setTopic(null)} className={`${chip} ${!topic ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"}`}>{all}</button>
        {topics.map((x) => (
          <button key={x.key} type="button" aria-pressed={topic === x.key} onClick={() => setTopic(x.key)}
            className={`${chip} ${topic === x.key ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"}`}>
            {x.t}
            <span className={`tnum text-[12px] ${topic === x.key ? "text-bg/70" : "text-muted"}`}>{x.n}</span>
          </button>
        ))}
      </div>
      {children}
      {none && <p role="status" className="mt-10 rounded-3xl border border-dashed border-line p-10 text-center text-muted">{empty}</p>}
    </div>
  );
}
