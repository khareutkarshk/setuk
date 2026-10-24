import type { CSSProperties } from "react";
import Image from "next/image";
import type { Dictionary } from "@/content";
import * as I from "@/components/icons";

/**
 * Trust seals: SSL, GDPR, the DPDP Act and Startup India, in the order of `seals.items`. Drawn as
 * Setuk's own tiles (icon and two lines), never as copies of anyone's mark, so they follow the theme.
 * Shown under Data and trust on the homepage, the product pages' data promise and the role pages'.
 *
 * Startup India's own logo replaces its icon once the file is here. To place it: save the official
 * logo from the DPIIT recognition kit as public/badges/v1/startup-india.png (or .svg), and set
 * STARTUP_INDIA_LOGO to its path and size. Until then the tile shows a rocket.
 */
const STARTUP_INDIA_LOGO: { src: string; width: number; height: number } | null = null;

const ICONS = [I.LockKey, I.ShieldCheck, I.SealCheck, I.RocketLaunch];

type Seals = Dictionary["seals"];

/** The Startup India mark, or its icon until the logo arrives */
function StartupMark({ size }: { size: number }) {
  if (STARTUP_INDIA_LOGO) {
    const { src, width, height } = STARTUP_INDIA_LOGO;
    return <Image src={src} alt="" width={width} height={height} className="h-auto" style={{ width: size * 2.2 }} unoptimized={src.endsWith(".svg")} />;
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
            <span className={`grid h-10 shrink-0 place-items-center rounded-[10px] ${logo ? "bg-white px-2" : "w-10 bg-accent-soft text-accent"}`}>
              {i === 3 ? <StartupMark size={20} /> : <Ico size={20} aria-hidden />}
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

/** Startup India on its own, as a quiet pill: the homepage hero and About */
export function StartupIndiaBadge({ seals, className = "", style }: { seals: Seals; className?: string; style?: CSSProperties }) {
  const x = seals.items[3];
  return (
    <p style={style} className={`inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-[13px] ${className}`}>
      <span className={`grid h-8 shrink-0 place-items-center rounded-full ${STARTUP_INDIA_LOGO ? "bg-white px-2" : "w-8 bg-accent-soft text-accent"}`}><StartupMark size={16} /></span>
      <span><b className="font-semibold">{x.t}</b><span className="text-muted"> · {x.d}</span></span>
    </p>
  );
}
