"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary, Locale } from "@/content";
import { localePath, site } from "@/content/site";
import { ArrowUpRight, List, Moon, Sun, X } from "@/components/icons";
import { currentTheme, onThemeChange, setTheme } from "@/lib/theme";
import { SetukMark } from "@/components/site/setuk-mark";

/**
 * Header with every site menu. Transparent over the hero, solid once the page scrolls.
 * Below lg the menu collapses into a sheet (scrollable, so it fits landscape phones); Escape, link clicks
 * and widening the window close it. On compact screens the story slides the header away while reading
 * down (html[data-hide-header], see globals.css).
 * Language links go to the other locale's URL (a full load, since each locale has its own root layout).
 * The theme button switches light and dark (light is the default) and remembers the choice.
 */
export function SiteHeader({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(scrollY > innerHeight * 0.3);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const onWide = () => { if (wide.matches) setOpen(false); };
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

  /* The theme lives on <html data-theme>; the server snapshot is the light default */
  const theme = useSyncExternalStore(onThemeChange, currentTheme, () => "light" as const);
  const dark = theme === "dark";

  const links = site.nav.map((l) => ({ ...l, label: t.nav.labels[l.key] }));
  const langs: { l: Locale; short: string; long: string }[] = [
    { l: "en", short: "EN", long: "English" },
    { l: "hi", short: "हिं", long: "हिन्दी" }
  ];

  return (
    <header
      data-solid={solid || open ? "" : undefined}
      className={`site-header fixed inset-x-0 top-0 z-40 border-b ${
        solid || open ? "border-line/60 bg-bg/80 backdrop-blur-xl backdrop-saturate-150" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-(--header-h) max-w-page items-center justify-between gap-3 px-4 sm:gap-6 sm:px-5 md:px-8">
        <a href={localePath[locale]} className="flex min-h-11 shrink-0 items-center gap-2.5" aria-label={`${t.brand.name}, ${t.brand.line}`}>
          <span className="w-9"><SetukMark draw /></span>
          <span className="font-display-tight text-[17px] max-[359px]:sr-only">{t.brand.name}</span>
        </a>
        <nav className="hidden items-center gap-5 text-[14px] lg:flex" aria-label={t.nav.menu}>
          {links.map((l) => (
            <a key={l.key} href={l.href} className="py-1.5 text-muted transition-colors hover:text-ink">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center text-[13px] text-muted sm:flex" role="group" aria-label={t.nav.language}>
            {langs.map(({ l, short, long }) => (
              <a key={l} href={localePath[l]} hrefLang={l} lang={l} aria-label={long} aria-current={l === locale ? "true" : undefined}
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
          <a href="#contact" className="press relative inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-accent px-4 text-[13px] font-semibold text-accent-ink before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] hover:brightness-110">
            {t.nav.demo}
          </a>
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
      <div id="site-menu" hidden={!open} className="max-h-[calc(100dvh-var(--header-h))] overflow-y-auto overscroll-contain border-t border-line/60 lg:hidden">
        <nav className="mx-auto grid max-w-page gap-1 px-5 py-4 text-[16px] md:px-8" aria-label={t.nav.menu}>
          {links.map((l) => (
            <a key={l.key} href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between border-b border-line/60 py-2.5">
              {l.label}
              <ArrowUpRight className="text-muted" aria-hidden />
            </a>
          ))}
          <div className="flex gap-2 pt-4 text-[14px]">
            {langs.map(({ l, long }) => (
              <a key={l} href={localePath[l]} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}
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
