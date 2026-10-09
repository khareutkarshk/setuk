import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { media, type MediaKey } from "@/content/media";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { AshokaChakra, CornerPattern, Mandala, Pattern, type PatternKind } from "@/components/site/pattern";

/*
 * Shared pieces for the inner pages. One shape system everywhere: pictures and cards 24px
 * (rounded-3xl), small tiles and inputs 12px (rounded-xl), every button a full pill.
 */

export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-page px-5 md:px-8 ${className}`}>{children}</div>;
}

/*
 * Ornament, after the homepage. Each page carries the same few patterns at the same strengths:
 * a sadan wall and a half-hidden mandala behind the title (the story's splash), temple borders
 * hanging from the edges of feature bands, one corner pattern per plain band, and panels with the
 * FAQ panel's temple top edge. Patterns stay behind text and never above 0.18 opacity on a page tone.
 */

/** The top of an inner page. It runs up under the header so the pattern starts at the very top */
export function PageHero({ children, className = "", mandala = true }: { children: ReactNode; className?: string; mandala?: boolean }) {
  return (
    <section className="relative -mt-(--header-h) overflow-clip pt-(--header-h)">
      <CornerPattern kind="sadan" fx={100} fy={0} radius={640} cell={36} className="inset-0 text-accent opacity-[.08]" />
      {mandala && <Mandala className="absolute -top-[120px] -right-[260px] w-[440px] text-accent opacity-[.1] md:-top-[170px] md:-right-[180px] md:w-[520px]" />}
      <Wrap className={`relative ${className}`}>{children}</Wrap>
    </section>
  );
}

/** Kicker, title and lead, the way every homepage section opens. `inverse` for the ink band */
export function SectionHead({ kicker, title, id, lead, inverse = false, className = "" }: { kicker: string; title: ReactNode; id?: string; lead?: ReactNode; inverse?: boolean; className?: string }) {
  return (
    <div className={className}>
      <Kicker className={inverse ? "text-leaf-inverse" : "text-leaf"} ornament={inverse ? "text-accent-soft" : "text-accent"}>{kicker}</Kicker>
      <H2 id={id} className="mt-3">{title}</H2>
      {lead && <Lead className={`mt-4 ${inverse ? "text-bg/70!" : ""}`}>{lead}</Lead>}
    </div>
  );
}

type Tone = "surface" | "tint" | "ink";
const TONES: Record<Tone, string> = {
  surface: "border-t border-line bg-surface",
  tint: "bg-accent-soft",
  ink: "bg-ink text-bg"
};

/**
 * A full-width band. surface: a quiet temple edge and an optional corner pattern; tint: a sadan wall
 * between temple borders on the accent tint; ink: the dark band of Data and trust on the homepage.
 */
export function Band({ tone, corner, id, labelledBy, className = "", children }: { tone: Tone; corner?: { kind: PatternKind; fx: number; fy: number }; id?: string; labelledBy?: string; className?: string; children: ReactNode }) {
  const edge = tone === "ink" ? "text-accent-soft opacity-50" : tone === "tint" ? "text-accent opacity-[.22]" : "text-accent opacity-[.14]";
  return (
    <section id={id} aria-labelledby={labelledBy} className={`relative overflow-clip ${TONES[tone]} ${className}`}>
      {tone !== "surface" && <Pattern kind="sadan" className={`absolute inset-0 ${tone === "tint" ? "text-accent opacity-[.045]" : "opacity-[.07]"}`} style={{ ["--s" as string]: "56px" }} />}
      <Pattern kind="temple" className={`absolute inset-x-0 top-0 -scale-y-100 ${edge}`} />
      {tone !== "surface" && <Pattern kind="temple" className={`absolute inset-x-0 bottom-0 ${edge}`} />}
      {corner && <CornerPattern kind={corner.kind} fx={corner.fx} fy={corner.fy} radius={480} className="inset-0 text-accent opacity-[.1]" />}
      <Wrap className="relative py-20 md:py-28">{children}</Wrap>
    </section>
  );
}

/** The homepage FAQ panel: a card with a temple top edge and a pattern fading from one corner */
export function Panel({ children, className = "", corner = "buti", fx = 100, fy = 100, chakra = false }: { children: ReactNode; className?: string; corner?: PatternKind; fx?: number; fy?: number; chakra?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-line bg-surface ${className}`}>
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent" />
      <CornerPattern kind={corner} fx={fx} fy={fy} radius={360} className="inset-0 h-full w-full text-accent opacity-[.14]" />
      {/* the homepage's Ashoka Chakra (over Engagements), half off the top right corner */}
      {chakra && <AshokaChakra className="absolute -top-[90px] -right-[90px] w-[220px] text-accent opacity-[.12]" />}
      <div className="relative">{children}</div>
    </div>
  );
}

type Ico = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

/** An icon on a block-printed tile, as in Data and trust */
export function IconTile({ icon: Icon, leaf = false, className = "" }: { icon: Ico; leaf?: boolean; className?: string }) {
  return (
    <span className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl ${leaf ? "bg-leaf-soft text-leaf" : "bg-accent-soft text-accent"} ${className}`}>
      <Pattern kind="buti" className="absolute inset-0 opacity-[.18] [mask-size:24px_24px]" />
      <Icon size={20} className="relative" aria-hidden />
    </span>
  );
}

/** A top rule with the mark's green tick at its start, for items in a grid */
export const TICK = "relative border-t pt-5 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-leaf-mark";

const DEVA = "०१२३४५६७८९";
/** 1 → ०१, for the numeral watermarks */
export const deva = (n: number) => String(n).padStart(2, "0").replace(/\d/g, (d) => DEVA[Number(d)]);

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
