import { getDictionary, type Locale } from "@/content";
import type { RoleHead, RoleKey } from "@/content/types";
import { Kicker } from "@/components/site/kicker";
import { href, routes } from "@/lib/paths";
import { Lead, PageHero, PrimaryLink, TextLink } from "../ui";
import { ROLE_KEYS, ROLE_LOOK } from "./look";
import { RoleStage } from "./role-stage";

/*
 * The role pages' hero. Each office is drawn in its own composition, so the four read as one family
 * with four faces before a word is read:
 *   dome      MPs          the promise centred over the chamber, as the Lok Sabha is symmetric
 *   circle    MLAs         the promise across the top, the constituency on a wide kolam oval below
 *   jharokha  Mayors       the promise across the top, the city in a wide civic window below
 *   pool      Consultants  the promise across the top, the turntable on a wide pool of waves below
 * MPs, MLAs and consultants lie horizontal on wide screens: the figure stands right of centre and the
 * case card sits over the window's left (the pool's right, where its next clients stack).
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

function Body({ r, locale, anchor, demo, center = false, className = "" }: { r: RoleHead; locale: Locale; anchor: string; demo: number; center?: boolean; className?: string }) {
  return (
    <div className={className}>
      <Lead className={`rise [--i:2] ${center ? "mx-auto" : ""}`}>{r.sub}</Lead>
      <div className={`rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3] ${center ? "justify-center" : ""}`}>
        <PrimaryLink href={href(locale, routes.contact)} demo={demo}>{r.primary}</PrimaryLink>
        <TextLink href={`#${anchor}`}>{r.secondary}</TextLink>
      </div>
    </div>
  );
}

const SHELL = "pt-8 pb-16 md:pt-14 lg:pb-24";

export function RoleHero({ role, r, locale, anchor }: { role: RoleKey; r: RoleHead; locale: Locale; anchor: string }) {
  const look = ROLE_LOOK[role];
  const c = getDictionary(locale).pages.roles.common;
  /* the demo dialog opens with this role chosen (its roles follow ROLE_KEYS) */
  const demo = ROLE_KEYS.indexOf(role);
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
      motion={c.hero}
    />
  );

  return (
    <PageHero routes={false} pattern={look.pattern} className={SHELL}>
      {look.window === "dome" && (
        <>
          <div className="mx-auto max-w-[880px] text-center">
            <Head r={r} center size="text-[clamp(36px,5vw,64px)]" />
            <Body r={r} locale={locale} anchor={anchor} demo={demo} center className="mt-5" />
          </div>
          <div className="rise mt-12 [--i:3] md:mt-14">{stage}</div>
        </>
      )}
      {look.window !== "dome" && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-14">
            <Head r={r} size="text-[clamp(34px,4.8vw,62px)]" />
            <Body r={r} locale={locale} anchor={anchor} demo={demo} className="lg:pb-1.5" />
          </div>
          <div className="rise mt-10 [--i:3] md:mt-14">{stage}</div>
        </>
      )}
    </PageHero>
  );
}
