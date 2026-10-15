import { getDictionary, type Locale } from "@/content";
import type { MayorRole, MlaRole, MpRole } from "@/content/types";
import { ROLE_LOOK } from "./look";
import { MayorWards, MlaGround, MpOffices } from "./own";
import { Challenges, Flow, ModuleBento, Oversight, RoleFaq, RoleHero, SetupAndTrust, Team } from "./parts";

/**
 * For MPs, For MLAs and For Mayors. The same body in the same order, so an office can compare them;
 * what differs is the hero's figure, the pattern, the copy and the section after the problems,
 * which only that office has. Kickers on three of ten sections: the hero, its own section and
 * the oversight band.
 */
export function OfficeRolePage({ role, locale }: { role: "mps" | "mlas" | "mayors"; locale: Locale }) {
  const t = getDictionary(locale);
  const c = t.pages.roles.common;
  const r = t.pages.roles[role];
  const look = ROLE_LOOK[role];

  return (
    <>
      <RoleHero role={role} r={r} locale={locale} anchor="modules" />
      <Challenges title={r.challenges.title} items={r.challenges.items} />
      {role === "mps" && <MpOffices o={(r as MpRole).offices} />}
      {role === "mlas" && <MlaGround g={(r as MlaRole).ground} />}
      {role === "mayors" && <MayorWards w={(r as MayorRole).wards} />}
      <ModuleBento id="modules" title={r.modules.title} sub={r.modules.sub} items={r.modules.items} soon={c.soon} pattern={look.pattern} />
      <Flow title={r.flow.title} sub={r.flow.sub} steps={r.flow.steps} eg={c.eg} />
      <Oversight o={r.oversight} />
      <Team title={r.team.title} sub={r.team.sub} rows={r.team.rows} />
      <SetupAndTrust locale={locale} />
      <RoleFaq title={r.faq.title} items={r.faq.items} locale={locale} pattern={look.pattern} />
    </>
  );
}
