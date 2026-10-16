import { getDictionary, type Locale } from "@/content";
import type { RoleHead, RoleKey } from "@/content/types";
import { Kicker } from "@/components/site/kicker";
import { href, routes } from "@/lib/paths";
import { Lead, PageHero, PrimaryLink, TextLink } from "../ui";
import { ROLE_LOOK, type RoleWindow } from "./look";
import { RoleStage } from "./role-stage";

/*
 * The role pages' hero. Each office is drawn in its own composition, so the four read as one family
 * with four faces before a word is read:
 *   dome      MPs          the promise centred over the chamber, as the Lok Sabha is symmetric
 *   circle    MLAs         the promise left, the constituency on a kolam circle running off the page
 *   jharokha  Mayors       the promise across the top, the city in a wide civic window below
 *   pool      Consultants  the turntable first, on its pool of waves, and the promise after it
 * The picture and its case card are role-stage.tsx.
 */

const H1 = "rise font-display-tight text-balance leading-[1.04] [--i:1]";

function Head({ r, center = false, className = "", size = "text-[clamp(34px,4.3vw,56px)]" }: { r: RoleHead; center?: boolean; className?: string; size?: string }) {
  return (
    <div className={className}>
      <Kicker className={`rise text-leaf ${center ? "justify-center" : ""}`}>{r.kicker}</Kicker>
      <h1 className={`${H1} mt-4 ${size} ${center ? "mx-auto max-w-[18ch]" : ""}`}>{r.title}</h1>
    </div>
  );
}

function Body({ r, locale, anchor, center = false, className = "" }: { r: RoleHead; locale: Locale; anchor: string; center?: boolean; className?: string }) {
  return (
    <div className={className}>
      <Lead className={`rise [--i:2] ${center ? "mx-auto" : ""}`}>{r.sub}</Lead>
      <div className={`rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3] ${center ? "justify-center" : ""}`}>
        <PrimaryLink href={href(locale, routes.contact)}>{r.primary}</PrimaryLink>
        <TextLink href={`#${anchor}`}>{r.secondary}</TextLink>
      </div>
    </div>
  );
}

const SHELL: Record<RoleWindow, string> = {
  dome: "pt-8 pb-16 md:pt-14 lg:pb-24",
  circle: "grid gap-10 pt-8 pb-16 md:pt-14 lg:grid-cols-[minmax(0,9fr)_minmax(0,12fr)] lg:gap-6 lg:pb-24",
  jharokha: "pt-8 pb-16 md:pt-14 lg:pb-24",
  pool: "grid items-center gap-10 pt-8 pb-16 md:pt-14 lg:grid-cols-[minmax(0,12fr)_minmax(0,9fr)] lg:gap-10 lg:pb-24"
};

export function RoleHero({ role, r, locale, anchor }: { role: RoleKey; r: RoleHead; locale: Locale; anchor: string }) {
  const look = ROLE_LOOK[role];
  const c = getDictionary(locale).pages.roles.common;
  const stage = (
    <RoleStage
      window={look.window}
      figure={look.figure}
      stops={look.stops}
      label={r.figure.label}
      nouns={r.figure.read}
      word={r.word}
      kase={r.case}
      more={role === "consultants" ? undefined : { href: "#flow", t: c.hero.more }}
    />
  );

  return (
    <PageHero routes={false} pattern={look.pattern} className={SHELL[look.window]}>
      {look.window === "dome" && (
        <>
          <div className="mx-auto max-w-[880px] text-center">
            <Head r={r} center size="text-[clamp(36px,5vw,64px)]" />
            <Body r={r} locale={locale} anchor={anchor} center className="mt-5" />
          </div>
          <div className="rise mt-12 [--i:3] md:mt-14">{stage}</div>
        </>
      )}
      {look.window === "jharokha" && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-14">
            <Head r={r} size="text-[clamp(34px,4.8vw,62px)]" />
            <Body r={r} locale={locale} anchor={anchor} className="lg:pb-1.5" />
          </div>
          <div className="rise mt-10 [--i:3] md:mt-14">{stage}</div>
        </>
      )}
      {(look.window === "circle" || look.window === "pool") && (
        <>
          <div className={look.window === "circle" ? "lg:pt-[clamp(32px,6vw,88px)]" : ""}>
            <Head r={r} />
            <Body r={r} locale={locale} anchor={anchor} className="mt-5" />
          </div>
          <div className={`rise [--i:2] ${look.window === "pool" ? "lg:order-first" : ""}`}>{stage}</div>
        </>
      )}
    </PageHero>
  );
}
