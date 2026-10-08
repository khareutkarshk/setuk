import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { media, type MediaKey } from "@/content/media";
import * as I from "@/components/icons";

/*
 * Shared pieces for the inner pages. One shape system everywhere: pictures and cards 24px
 * (rounded-3xl), small tiles and inputs 12px (rounded-xl), every button a full pill.
 */

export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-page px-5 md:px-8 ${className}`}>{children}</div>;
}

export function H1({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display-tight text-balance text-[clamp(36px,5vw,60px)] leading-[1.03] ${className}`}>{children}</h1>;
}

export function H2({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  return <h2 id={id} className={`font-display-tight text-balance text-[clamp(28px,3.4vw,42px)] leading-[1.06] ${className}`}>{children}</h2>;
}

export function Lead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`max-w-[58ch] text-pretty text-[17px] leading-relaxed text-muted md:text-[19px] ${className}`}>{children}</p>;
}

/**
 * One of Setuk's illustrations in a frame. They are drawn on white, so dark mode dims them a little
 * (.illo in globals.css) instead of letting them glare.
 */
export function Figure({ img, alt, sizes, className = "", priority = false, ratio }: { img: MediaKey; alt: string; sizes: string; className?: string; priority?: boolean; ratio?: string }) {
  return (
    <div className={`illo relative overflow-hidden rounded-3xl border border-line bg-surface ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {ratio
        ? <Image src={media[img]} alt={alt} sizes={sizes} priority={priority} placeholder="blur" fill className="object-cover" />
        : <Image src={media[img]} alt={alt} sizes={sizes} priority={priority} placeholder="blur" className="h-auto w-full" />}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
      {children}
      <I.ArrowRight weight="bold" aria-hidden />
    </Link>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex min-h-11 items-center gap-2 font-semibold text-accent ${className}`}>
      <span className="underline decoration-accent/30 underline-offset-4 transition-colors group-hover:decoration-accent">{children}</span>
      <I.ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** Breadcrumbs: Home / section / (current, not linked) */
export function Crumbs({ items, label }: { items: { t: string; href?: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="text-[14px] text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.t} className="flex items-center gap-2">
            {i > 0 && <I.CaretRight size={12} aria-hidden />}
            {c.href ? <Link href={c.href} className="hover:text-ink">{c.t}</Link> : <span aria-current="page" className="line-clamp-1 text-ink">{c.t}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
