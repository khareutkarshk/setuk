"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary, Locale } from "@/content";
import { site } from "@/content/site";
import { ArrowRight, CaretDown, List, Moon, Sun, X } from "@/components/icons";
import { ROLE_LOOK, type RoleMenuItem } from "@/components/pages/roles/look";
import { href, routes } from "@/lib/paths";
import { currentTheme, onThemeChange, setTheme } from "@/lib/theme";
import { Pattern } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";

/**
 * Header with every site menu. Transparent over the hero, solid once the page scrolls (at once on inner
 * pages, after a third of the screen on the homepage, whose hero is the 3D chamber). `path` is the
 * current page without the locale: it marks the active link and keeps the language links on the same page.
 * Below lg the menu collapses into a sheet (scrollable, so it fits landscape phones); Escape, link clicks
 * and widening the window close it. On compact screens the story slides the header away while reading
 * down (html[data-hide-header], see globals.css).
 * "By role" opens the role pages' menu: on hover with a mouse (a short delay either way, so passing
 * over it does nothing), and on click, tap, Enter or Space; Escape, a click outside, leaving it with
 * the keyboard and choosing a page close it. In the sheet the roles are listed under their own label.
 * Below xl, Home leaves the desktop row (the logo goes home) so the row keeps to one line.
 * Language links go to the other locale's URL (a full load, since each locale has its own root layout).
 * The theme button switches light and dark (light is the default) and remembers the choice.
 */
export function SiteHeader({ t, roles, locale, path = routes.home }: { t: Pick<Dictionary, "nav" | "brand">; roles: RoleMenuItem[]; locale: Locale; path?: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);
  const rolesButtonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setSolid(scrollY > (path === routes.home ? innerHeight * 0.3 : 8));
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [path]);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const onWide = () => { if (wide.matches) setOpen(false); else setRolesOpen(false); };
    wide.addEventListener("change", onWide);
    return () => wide.removeEventListener("change", onWide);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  /* the role menu closes on Escape (focus back on its button) and on a press anywhere outside it */
  useEffect(() => {
    if (!rolesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setRolesOpen(false); rolesButtonRef.current?.focus(); }
    };
    const onDown = (e: PointerEvent) => { if (!rolesRef.current?.contains(e.target as Node)) setRolesOpen(false); };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => { removeEventListener("keydown", onKey); removeEventListener("pointerdown", onDown); };
  }, [rolesOpen]);

  useEffect(() => () => clearTimeout(timer.current), []);

  /* hover intent, for a mouse only: touch opens on the tap, which is a click */
  const hover = (on: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRolesOpen(on), on ? 70 : 180);
  };

  /* The theme lives on <html data-theme>; the server snapshot is the light default */
  const theme = useSyncExternalStore(onThemeChange, currentTheme, () => "light" as const);
  const dark = theme === "dark";

  /* a section counts as current on its own pages too (an article, a policy) */
  const isCurrent = (p: string) => (p === routes.home ? path === p : path === p || path.startsWith(p + "/"));
  const links = site.nav.map((l) => ({ ...l, href: href(locale, l.path), label: t.nav.labels[l.key], current: isCurrent(l.path) }));
  const roleLinks = roles.map((r) => ({ ...r, href: href(locale, routes.roles[r.key]), current: path === routes.roles[r.key], Icon: ROLE_LOOK[r.key].icon }));
  const onRole = roleLinks.some((r) => r.current);
  const [home, ...rest] = links;
  const langs: { l: Locale; short: string; long: string }[] = [
    { l: "en", short: "EN", long: "English" },
    { l: "hi", short: "हिं", long: "हिन्दी" }
  ];
  const navLink = "relative py-1.5 text-muted transition-colors hover:text-ink aria-[current]:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 aria-[current]:after:scale-x-100";

  return (
    <header
      data-solid={solid || open ? "" : undefined}
      className={`site-header fixed inset-x-0 top-0 z-40 border-b ${
        solid || open ? "border-line/60 bg-bg/80 backdrop-blur-xl backdrop-saturate-150" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-(--header-h) max-w-page items-center justify-between gap-3 px-4 sm:gap-6 sm:px-5 md:px-8">
        <Link href={href(locale, routes.home)} className="flex min-h-11 shrink-0 items-center gap-2.5" aria-label={`${t.brand.name}, ${t.brand.line}`}>
          <span className="w-9"><SetukMark draw /></span>
          <span className="font-display-tight text-[17px] max-[359px]:sr-only">{t.brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-[14px] lg:flex" aria-label={t.nav.menu}>
          <Link href={home.href} aria-current={home.current ? "page" : undefined} className={`${navLink} hidden xl:block`}>{home.label}</Link>
          <div
            ref={rolesRef}
            className="relative"
            onPointerEnter={hover(true)}
            onPointerLeave={hover(false)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setRolesOpen(false); }}
          >
            <button
              ref={rolesButtonRef}
              type="button"
              aria-expanded={rolesOpen}
              aria-controls="role-menu"
              data-current={onRole ? "" : undefined}
              onClick={() => { clearTimeout(timer.current); setRolesOpen((v) => !v); }}
              className={`${navLink} flex items-center gap-1 aria-expanded:text-ink data-[current]:text-ink data-[current]:after:scale-x-100`}
            >
              {t.nav.byRole}
              <CaretDown size={12} weight="bold" aria-hidden className={`transition-transform duration-300 ${rolesOpen ? "rotate-180" : ""}`} />
            </button>
            {/* pt-3 bridges the gap, so the pointer can travel from the button to the panel */}
            <div
              id="role-menu"
              className={`absolute top-full left-1/2 z-10 -translate-x-1/2 pt-3 transition-[opacity,translate,visibility] duration-200 ${rolesOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}
            >
              <div className="relative w-[620px] overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--ink)_35%,transparent)]">
                <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-20" />
                <ul className="relative grid grid-cols-2 gap-1 pt-1.5">
                  {roleLinks.map(({ key, t: title, d, href: to, current, Icon }) => (
                    <li key={key}>
                      <Link
                        href={to}
                        aria-current={current ? "page" : undefined}
                        onClick={() => setRolesOpen(false)}
                        className="group relative flex h-full items-start gap-4 overflow-hidden rounded-xl p-4 transition-colors hover:bg-accent-soft focus-visible:bg-accent-soft aria-[current]:bg-accent-soft"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-surface group-aria-[current]:bg-surface">
                          <Icon size={22} aria-hidden />
                        </span>
                        <span className="relative">
                          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                            {title}
                            <ArrowRight size={13} aria-hidden className="-translate-x-1 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 block text-[13px] leading-snug text-muted">{d}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {rest.map((l) => (
            <Link key={l.key} href={l.href} aria-current={l.current ? "page" : undefined} className={navLink}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center text-[13px] text-muted sm:flex" role="group" aria-label={t.nav.language}>
            {langs.map(({ l, short, long }) => (
              <a key={l} href={href(l, path)} hrefLang={l} lang={l} aria-label={long} aria-current={l === locale ? "true" : undefined}
                className="grid h-10 min-w-10 place-items-center rounded px-2 aria-[current]:font-semibold aria-[current]:text-ink">
                {short}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? t.nav.toLight : t.nav.toDark}
            title={dark ? t.nav.toLight : t.nav.toDark}
            className="press relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors before:absolute before:-inset-1 before:content-[''] hover:border-ink"
          >
            {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>
          <Link href={href(locale, routes.contact)} data-demo="" aria-haspopup="dialog" className="press relative inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-accent px-4 text-[13px] font-semibold text-accent-ink before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] hover:brightness-110">
            {t.nav.demo}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line before:absolute before:-inset-1 before:content-[''] lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} aria-hidden /> : <List size={18} aria-hidden />}
          </button>
        </div>
      </div>
      <div id="site-menu" hidden={!open} data-lenis-prevent className="max-h-[calc(100dvh-var(--header-h))] overflow-y-auto overscroll-contain border-t border-line/60 lg:hidden">
        <nav className="mx-auto grid max-w-page gap-1 px-5 py-4 text-[16px] md:px-8" aria-label={t.nav.menu}>
          <SheetLink l={home} onClose={() => setOpen(false)} />
          <div className="border-b border-line/60 py-3">
            <p className="text-[13px] font-semibold text-muted">{t.nav.byRole}</p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {roleLinks.map(({ key, t: title, href: to, current, Icon }) => (
                <li key={key}>
                  <Link href={to} onClick={() => setOpen(false)} aria-current={current ? "page" : undefined}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 aria-[current]:bg-accent-soft aria-[current]:font-semibold aria-[current]:text-accent">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon size={18} aria-hidden /></span>
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {rest.map((l) => <SheetLink key={l.key} l={l} onClose={() => setOpen(false)} />)}
          <div className="flex gap-2 pt-4 text-[14px]">
            {langs.map(({ l, long }) => (
              <a key={l} href={href(l, path)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 aria-[current]:bg-ink aria-[current]:text-bg">
                {long}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function SheetLink({ l, onClose }: { l: { href: string; label: string; current: boolean }; onClose: () => void }) {
  return (
    <Link href={l.href} onClick={onClose} aria-current={l.current ? "page" : undefined}
      className="flex min-h-12 items-center justify-between border-b border-line/60 py-2.5 aria-[current]:font-semibold aria-[current]:text-accent">
      {l.label}
      <ArrowRight className="text-muted" aria-hidden />
    </Link>
  );
}
