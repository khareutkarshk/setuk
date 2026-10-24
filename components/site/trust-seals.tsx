import type { CSSProperties } from "react";
import Image from "next/image";
import type { Dictionary } from "@/content";
import * as I from "@/components/icons";

/**
 * Trust seals: SSL, GDPR, the DPDP Act and Startup India, in the order of `seals.items`. Drawn as
 * Setuk's own tiles (icon and two lines), never as copies of anyone's mark, so they follow the theme.
 * Shown under Data and trust on the homepage, the product pages' data promise and the role pages'.
 *
 * Startup India is the one real mark: DPIIT's own #startupindia lockup (public/badges/v1, from
 * startupindia.gov.in), on a white plate in both themes since the file is drawn on white. Set
 * STARTUP_INDIA_LOGO to null to fall back to a rocket icon.
 */
const STARTUP_INDIA_LOGO: { src: string; width: number; height: number } | null = { src: "/badges/v1/startup-india.png", width: 1969, height: 655 };

const ICONS = [I.LockKey, I.ShieldCheck, I.SealCheck, I.RocketLaunch];

type Seals = Dictionary["seals"];

/** The Startup India mark at `size` px tall, or its icon. The words beside it name it, so it carries no alt */
function StartupMark({ size }: { size: number }) {
  if (STARTUP_INDIA_LOGO) {
    const { src, width, height } = STARTUP_INDIA_LOGO;
    return <Image src={src} alt="" width={width} height={height} sizes={`${Math.ceil((size * width) / height)}px`} className="w-auto" style={{ height: size }} />;
  }
  return <I.RocketLaunch size={size} aria-hidden />;
}

/** The four seals as a row of tiles. `ink` for the dark band (Data and trust) */
export function TrustSeals({ seals, ink = false, className = "sm:grid-cols-2 lg:grid-cols-4" }: { seals: Seals; ink?: boolean; className?: string }) {
  return (
    <ul aria-label={seals.label} className={`grid gap-3 ${className}`}>
      {seals.items.map((x, i) => {
        const Ico = ICONS[i];
        const logo = i === 3 && STARTUP_INDIA_LOGO;
        return (
          <li key={x.t} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${ink ? "border-bg/15 bg-bg/[.04]" : "border-line bg-surface"}`}>
            <span className={`grid h-10 shrink-0 place-items-center rounded-[10px] ${logo ? "bg-white px-1.5" : "w-10 bg-accent-soft text-accent"}`}>
              {i === 3 ? <StartupMark size={logo ? 34 : 20} /> : <Ico size={20} aria-hidden />}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] leading-tight font-semibold">{x.t}</span>
              <span className={`mt-0.5 block text-[13px] leading-snug ${ink ? "text-bg/75" : "text-muted"}`}>{x.d}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Startup India on its own (the homepage hero and About): the logo on its white tile, then the
 * recognition in leaf with a seal over the name, in a card that sits lightly on the page
 */
export function StartupIndiaBadge({ seals, className = "", style }: { seals: Seals; className?: string; style?: CSSProperties }) {
  const x = seals.items[3];
  return (
    <p style={style} className={`inline-flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-1.5 pr-5 shadow-[0_14px_36px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)] ${className}`}>
      <span className={`grid h-12 shrink-0 place-items-center rounded-xl ${STARTUP_INDIA_LOGO ? "bg-white px-3 ring-1 ring-line" : "w-12 bg-accent-soft text-accent"}`}>
        <StartupMark size={STARTUP_INDIA_LOGO ? 36 : 20} />
      </span>
      <span className="flex flex-col gap-1 leading-none">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.1em] text-leaf">
          <I.SealCheck size={14} weight="fill" aria-hidden />{x.d}
        </span>
        <span className="text-[16px] font-semibold text-ink">{x.t}</span>
      </span>
    </p>
  );
}
