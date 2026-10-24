import Link from "next/link";
import type { Dictionary, Locale } from "@/content";
import { site } from "@/content/site";
import { ArrowUp, EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Phone, WhatsappLogo, XLogo, YoutubeLogo, type Icon } from "@/components/icons";
import { SetukMark } from "@/components/site/setuk-mark";
import { Pattern } from "@/components/site/pattern";
import { href, routes } from "@/lib/paths";
import { FooterBridge } from "./footer-bridge";
import { PRODUCT_KEYS } from "@/components/pages/products/look";
import { ROLE_KEYS } from "@/components/pages/roles/look";

const SOCIAL_ICONS: Record<(typeof site.social)[number]["key"], Icon> = { x: XLogo, facebook: FacebookLogo, instagram: InstagramLogo, youtube: YoutubeLogo };

/* a link's underline draws in from the left on hover and focus */
const LINK = "foot-link inline-flex min-h-9 items-center text-muted transition-colors hover:text-ink focus-visible:text-ink";

function Column({ title, links }: { title: string; links: { t: string; href: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="flex items-center gap-2 font-semibold"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-leaf-mark" />{title}</p>
      <ul className="mt-3 space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            {l.external
              ? <a href={l.href} className={LINK}><span>{l.t}</span></a>
              : <Link href={l.href} className={LINK}><span>{l.t}</span></Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** `home` adds the 3D model notes, which only make sense under the chamber */
export function SiteFooter({ t, locale, home = false }: { t: Dictionary; locale: Locale; home?: boolean }) {
  const company = [
    ...site.nav.filter((l) => l.key !== "home").map((l) => ({ t: t.nav.labels[l.key], href: href(locale, l.path) })),
    { t: t.footer.voterList, href: href(locale, routes.voterList) }
  ];
  const products = PRODUCT_KEYS.map((k) => ({ t: t.pages.products[k].menu.t, href: href(locale, routes.products[k]) }));
  const roles = ROLE_KEYS.map((k) => ({ t: t.pages.roles[k].menu.t, href: href(locale, routes.roles[k]) }));
  const guides = t.footer.guideItems.map((g) => ({ t: g.t, href: href(locale, routes.article(g.slug)) }));
  const legal = [{ t: t.pages.legal.all, href: href(locale, routes.legal) }, ...t.footer.legalItems.map((g) => ({ t: g.t, href: href(locale, routes.legalDoc(g.slug)) }))];
  return (
    <footer className="foot relative z-10 overflow-hidden border-t border-line bg-bg">
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-70" />
      <div className="relative mx-auto max-w-page px-5 pt-16 pb-12 text-[14px] md:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.3fr_.7fr_.7fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href={href(locale, routes.home)} className="flex items-center gap-2.5" aria-label={t.brand.name}>
              <span className="w-9"><SetukMark /></span>
              <span className="font-display-tight text-[19px]">{t.brand.name}</span>
            </Link>
            <p className="mt-3 text-muted">{t.brand.line}</p>
            <address className="mt-6 space-y-1 not-italic text-muted">
              <p className="flex gap-2"><MapPin className="mt-0.5 shrink-0" aria-hidden /><span>{site.legalName}, {t.footer.address}</span></p>
              <p><a className="inline-flex min-h-9 items-center gap-2 hover:text-ink" href={`mailto:${site.email}`}><EnvelopeSimple aria-hidden />{site.email}</a></p>
              <p><a className="inline-flex min-h-9 items-center gap-2 hover:text-ink" href={site.phone.href}><Phone aria-hidden />{site.phone.label}</a></p>
              <p><a className="inline-flex min-h-9 items-center gap-2 hover:text-ink" href={site.whatsapp.href}><WhatsappLogo className="text-leaf" aria-hidden />{site.whatsapp.label}</a></p>
            </address>
            <div className="mt-6 flex gap-2">
              {site.social.map((s) => {
                const Ico = SOCIAL_ICONS[s.key];
                return (
                  <a key={s.key} href={s.href} aria-label={`${site.name} on ${s.label}`} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface transition-[translate,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-leaf hover:text-leaf hover:shadow-[0_10px_24px_-14px_color-mix(in_srgb,var(--leaf)_60%,transparent)]">
                    <Ico aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
          <Column title={t.footer.company} links={company} />
          {/* the products sit over the roles, so the row keeps its five columns */}
          <div className="space-y-8">
            <Column title={t.nav.products} links={products} />
            <Column title={t.nav.byRole} links={roles} />
          </div>
          <Column title={t.footer.guides} links={guides} />
          <Column title={t.footer.legal} links={legal} />
        </div>
        <FooterBridge word="सेतुक" />
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[13px] text-muted">
          <span>&copy; 2026 {t.footer.rights}</span>
          <a href="#main" className="group inline-flex min-h-9 items-center gap-2 font-medium transition-colors hover:text-accent">
            {t.footer.top}
            <span className="grid h-8 w-8 place-items-center rounded-full border border-line transition-[translate,border-color] duration-300 group-hover:-translate-y-0.5 group-hover:border-accent"><ArrowUp size={14} aria-hidden /></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
