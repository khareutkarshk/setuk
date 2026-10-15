import { getDictionary, type Locale } from "@/content";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { Pattern } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";
import { Band, Figure, H2, IconTile, SectionHead, Wrap } from "../ui";
import { ROLE_LOOK } from "./look";
import { Challenges, Flow, ModuleBento, RoleFaq, RoleHero } from "./parts";

const WHO_ICONS = [I.Briefcase, I.FlagBanner, I.Plugs, I.UserGear];
const PATH_ICONS = [I.Handshake, I.Wrench, I.Storefront, I.Strategy];
const DATA_ICONS = [I.Buildings, I.Lock, I.Export, I.CloudCheck];

/**
 * For consultants: a partnership page, not an office's. It opens by recognising what consultants
 * do, shows Setuk as the setu between their practice and their clients' offices, what they can
 * deliver, the ways to partner (terms agreed per partner, never published here), the steps, and
 * how each client's records stay apart. Kickers on the hero, the tribute and the ways to partner.
 */
export function ConsultantsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const r = t.pages.roles.consultants;
  const look = ROLE_LOOK.consultants;
  const [practice, platform, clients] = r.model.parts;

  return (
    <>
      <RoleHero role="consultants" r={r} locale={locale} anchor="paths" />

      {/* Recognition first: what consultants bring, and who partners with Setuk */}
      <Wrap className="py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <Kicker className="text-leaf">{r.tribute.kicker}</Kicker>
            <H2 className="mt-3 max-w-[20ch]">{r.tribute.title}</H2>
            <p className="mt-6 max-w-[60ch] text-[19px] leading-relaxed text-ink">{r.tribute.paras[0]}</p>
            {r.tribute.paras.slice(1).map((x) => (
              <p key={x} className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">{x}</p>
            ))}
          </div>
          <Figure img="warRoom" alt={r.tribute.alt} sizes="(min-width: 1024px) 480px, 100vw" className="reveal" ratio="4 / 5" />
        </div>
        <div className="reveal mt-16">
          <h3 className="text-[15px] font-semibold text-muted">{r.who.title}</h3>
          <ul className="mt-4 grid divide-y divide-line rounded-3xl border border-line bg-surface sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {r.who.items.map((x, i) => {
              const Ico = WHO_ICONS[i % WHO_ICONS.length];
              return (
                <li key={x.t} className="flex gap-4 p-6 sm:max-lg:[&:nth-child(n+3)]:border-t sm:max-lg:[&:nth-child(n+3)]:border-line sm:max-lg:[&:nth-child(even)]:border-l sm:max-lg:[&:nth-child(even)]:border-line">
                  <Ico size={22} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="text-[16px] font-semibold leading-snug">{x.t}</p>
                    <p className="mt-1 text-[14px] leading-snug text-muted">{x.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Wrap>

      <Challenges title={r.challenges.title} items={r.challenges.items} />

      {/* The partnership as a setu: your practice on one bank, your clients' offices on the other */}
      <Band tone="surface" labelledBy="model-title" corner={{ kind: look.pattern, fx: 100, fy: 0 }}>
        <SectionHead title={r.model.title} id="model-title" lead={r.model.sub} className="max-w-[760px]" />
        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_40px_minmax(0,1.15fr)_40px_minmax(0,1fr)] lg:gap-0">
          <div className="reveal flex flex-col rounded-3xl border border-line bg-bg p-7">
            <IconTile icon={I.Briefcase} />
            <h3 className="mt-5 text-[20px] font-semibold">{practice.t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{practice.d}</p>
          </div>
          <Link />
          <div className="reveal relative flex flex-col overflow-hidden rounded-3xl bg-accent p-7 text-accent-ink">
            <Pattern kind="jaali" className="absolute inset-0 opacity-[.1]" />
            <span className="relative w-16 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
            <h3 className="relative mt-5 text-[20px] font-semibold">{platform.t}</h3>
            <p className="relative mt-2 text-[15px] leading-relaxed opacity-85">{platform.d}</p>
          </div>
          <Link />
          <div className="reveal flex flex-col rounded-3xl border border-line bg-bg p-7">
            <IconTile icon={I.Buildings} />
            <h3 className="mt-5 text-[20px] font-semibold">{clients.t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{clients.d}</p>
          </div>
        </div>
      </Band>

      <ModuleBento id="offer" title={r.offer.title} sub={r.offer.sub} items={r.offer.items} soon={t.pages.roles.common.soon} pattern={look.pattern} />

      {/* The ways to partner; the note says terms are agreed per partner */}
      <section id="paths" aria-labelledby="paths-title" className="scroll-mt-20 border-t border-line">
        <Wrap className="py-20 md:py-28">
          <SectionHead kicker={r.paths.kicker} title={r.paths.title} id="paths-title" lead={r.paths.sub} className="max-w-[720px]" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {r.paths.items.map((x, i) => (
              <li key={x.t} className="reveal relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6">
                <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-20" />
                <IconTile icon={PATH_ICONS[i % PATH_ICONS.length]} />
                <h3 className="font-display-tight mt-5 text-[22px] leading-tight">{x.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 text-[14px] text-muted"><I.Info size={18} className="mt-px shrink-0" aria-hidden />{r.paths.note}</p>
        </Wrap>
      </section>

      <Flow title={r.steps.title} steps={r.steps.items} />

      {/* How each client's records stay apart: the page's one ink band */}
      <section aria-labelledby="data-title" className="relative overflow-clip bg-ink text-bg">
        <Pattern kind="sadan" className="absolute inset-0 opacity-[.06]" style={{ ["--s" as string]: "56px" }} />
        <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent-soft opacity-50" />
        <Pattern kind="temple" className="absolute inset-x-0 bottom-0 text-accent-soft opacity-50" />
        <Wrap className="relative grid gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHead title={r.data.title} id="data-title" lead={r.data.body} inverse />
          <dl className="grid gap-x-10 gap-y-9 self-center sm:grid-cols-2">
            {r.data.items.map((x, i) => {
              const Ico = DATA_ICONS[i % DATA_ICONS.length];
              return (
                <div key={x.t} className="reveal relative border-t border-bg/15 pt-5 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-leaf-inverse">
                  <dt className="flex items-center gap-2.5 text-[17px] font-semibold"><Ico size={20} className="text-leaf-inverse" aria-hidden />{x.t}</dt>
                  <dd className="mt-1.5 text-[15px] leading-snug text-bg/65">{x.d}</dd>
                </div>
              );
            })}
          </dl>
        </Wrap>
      </section>

      <RoleFaq title={r.faq.title} items={r.faq.items} locale={locale} pattern={look.pattern} />
    </>
  );
}

/** The span of the setu between two cards: a line with a small round node at its middle */
function Link() {
  return (
    <span aria-hidden="true" className="relative hidden items-center lg:flex">
      <span className="h-px w-full bg-accent/40" />
      <span className="absolute left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border border-line bg-surface text-accent">
        <I.ArrowsLeftRight size={12} weight="bold" />
      </span>
    </span>
  );
}
