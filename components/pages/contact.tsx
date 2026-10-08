import { getDictionary, type Locale } from "@/content";
import { site } from "@/content/site";
import * as I from "@/components/icons";
import { href, routes } from "@/lib/paths";
import { ContactForm } from "./contact-form";
import { Figure, H1, Lead, Wrap } from "./ui";

/** Contact: the direct ways to reach the team beside the form, then what happens after you write */
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
    <Wrap className="pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <H1 className="rise">{p.title}</H1>
          <Lead className="rise mt-5 [--i:1]">{p.sub}</Lead>

          <ul className="rise mt-10 divide-y divide-line border-y border-line [--i:2]">
            {channels.map(({ Ico, ...c }) => (
              <li key={c.t}>
                <a href={c.href} className="group flex items-center gap-4 py-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.leaf ? "bg-leaf-soft text-leaf" : "bg-accent-soft text-accent"}`}><Ico size={20} aria-hidden /></span>
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
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><I.MapPin size={20} aria-hidden /></span>
            <div>
              <p className="text-[13px] text-muted">{ch.office}</p>
              <address className="mt-0.5 text-[16px] leading-relaxed not-italic">{site.legalName}<br />{t.footer.address}</address>
            </div>
          </div>
        </div>

        <div className="rise [--i:2]">
          <ContactForm f={p.form} to={site.email} privacyHref={href(locale, routes.legalDoc("privacy"))} />
        </div>
      </div>

      {/* After you write */}
      <div className="mt-20 grid items-center gap-10 md:mt-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Figure img="contactDesk" alt={p.alt} sizes="(min-width: 1024px) 500px, 100vw" className="reveal" />
        <div>
          <h2 className="font-display-tight text-[clamp(26px,3vw,36px)] leading-tight">{p.expect.title}</h2>
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
  );
}
