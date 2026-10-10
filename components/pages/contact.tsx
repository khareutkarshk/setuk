import { getDictionary, type Locale } from "@/content";
import { site } from "@/content/site";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { href, routes } from "@/lib/paths";
import { ContactForm } from "./contact-form";
import { Faqs } from "./faq-list";
import { Band, Figure, H1, H2, IconTile, Lead, PageHero, Panel, SectionHead, TextLink, Wrap } from "./ui";

/** Contact: the direct ways to reach the team beside the form, what happens after you write, then questions about getting in touch */
export function ContactPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.contact;
  const ch = p.channels;
  const channels = [
    { Ico: I.EnvelopeSimple, t: ch.email, v: site.email, note: ch.emailNote, href: `mailto:${site.email}` },
    { Ico: I.Phone, t: ch.phone, v: site.phone.label, note: ch.phoneNote, href: site.phone.href },
    { Ico: I.WhatsappLogo, t: ch.whatsapp, v: site.whatsapp.label, note: ch.whatsappNote, href: site.whatsapp.href, leaf: true }
  ];

  return (
    <>
    <PageHero className="pt-10 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Kicker className="rise text-leaf">{t.nav.labels.contact}</Kicker>
          <H1 className="rise mt-4 [--i:1]">{p.title}</H1>
          <Lead className="rise mt-5 [--i:2]">{p.sub}</Lead>

          <ul className="rise mt-10 divide-y divide-line border-y border-line [--i:2]">
            {channels.map(({ Ico, ...c }) => (
              <li key={c.t}>
                <a href={c.href} className="group flex items-center gap-4 py-4">
                  <IconTile icon={Ico} leaf={c.leaf} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-muted">{c.t} <span aria-hidden>·</span> {c.note}</span>
                    <span className="block truncate text-[17px] font-semibold transition-colors group-hover:text-accent">{c.v}</span>
                  </span>
                  <I.ArrowRight className="shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          <div className="rise mt-8 flex gap-4 [--i:3]">
            <IconTile icon={I.MapPin} />
            <div>
              <p className="text-[13px] text-muted">{ch.office}</p>
              <address className="mt-0.5 text-[16px] leading-relaxed not-italic">{site.legalName}<br />{t.footer.address}</address>
            </div>
          </div>
        </div>

        <Panel fx={100} fy={0} className="rise self-start [--i:2]">
          <ContactForm f={p.form} to={site.email} privacyHref={href(locale, routes.legalDoc("privacy"))} />
        </Panel>
      </div>
    </PageHero>

    {/* After you write */}
    <Wrap className="pt-20 pb-20 md:pt-28 md:pb-28">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Figure img="contactDesk" alt={p.alt} sizes="(min-width: 1024px) 500px, 100vw" className="reveal" />
        <div>
          <Kicker>{p.expect.kicker}</Kicker>
          <H2 className="mt-3 text-[clamp(26px,3vw,36px)]!">{p.expect.title}</H2>
          <ul className="mt-6 space-y-5">
            {p.expect.items.map((x, i) => (
              <li key={x} className="flex gap-4 text-[16px] leading-relaxed">
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${i === 2 ? "bg-accent-soft text-accent" : "bg-leaf-soft text-leaf"}`}>
                  {i === 2 ? <I.Info size={15} aria-hidden /> : <I.Check size={14} weight="bold" aria-hidden />}
                </span>
                <span className={i === 2 ? "text-muted" : ""}>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Wrap>

    <Band tone="surface" labelledBy="contact-faq-title" corner={{ kind: "jaali", fx: 0, fy: 0 }}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
          <SectionHead kicker={p.faq.kicker} title={p.faq.title} id="contact-faq-title" lead={p.faq.lead} />
          <TextLink href={href(locale, routes.faqs)} className="mt-6">{p.faq.all}</TextLink>
        </div>
        <Faqs items={p.faq.items} />
      </div>
    </Band>
    </>
  );
}
