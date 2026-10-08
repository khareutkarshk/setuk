import { getDictionary, type Locale } from "@/content";
import { site } from "@/content/site";
import * as I from "@/components/icons";
import { Faqs } from "./faq-list";
import { FaqSearch } from "./faq-search";
import { H1, Lead, Wrap } from "./ui";

/** FAQs: every question in four groups, searchable, with a way to ask ours if yours is missing */
export function FaqsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.faqs;
  return (
    <Wrap className="pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="max-w-[760px]">
        <H1 className="rise">{p.title}</H1>
        <Lead className="rise mt-5 [--i:1]">{p.sub}</Lead>
      </div>
      <div className="rise mt-10 grid gap-12 [--i:2] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
        <FaqSearch label={p.search} clear={p.clear} results={p.results} none={p.noResults}>
          <div className="mt-4 space-y-12">
            {p.groups.map((g, gi) => (
              <section key={g.t} data-faq-group aria-labelledby={`faq-g${gi}`}>
                <h2 id={`faq-g${gi}`} className="font-display-tight text-[22px]">{g.t}</h2>
                <div className="mt-3"><Faqs items={g.items} idPrefix={`faq-${gi}`} /></div>
              </section>
            ))}
          </div>
        </FaqSearch>
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-7">
            <p className="font-display-tight text-[22px]">{p.still}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.stillBody}</p>
            <ul className="mt-6 space-y-1">
              <li><a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-3 font-semibold hover:text-accent"><I.EnvelopeSimple className="text-accent" aria-hidden />{site.email}</a></li>
              <li><a href={site.phone.href} className="flex min-h-11 items-center gap-3 font-semibold hover:text-accent"><I.Phone className="text-accent" aria-hidden />{site.phone.label}</a></li>
              <li><a href={site.whatsapp.href} className="flex min-h-11 items-center gap-3 font-semibold hover:text-accent"><I.WhatsappLogo className="text-leaf" aria-hidden />WhatsApp</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </Wrap>
  );
}
