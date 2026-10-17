import type { ReactNode } from "react";
import { getDictionary, type Locale } from "@/content";
import { site } from "@/content/site";
import { href, routes } from "@/lib/paths";
import { DemoHost } from "./demo-dialog";
import { geist, geistMono } from "@/lib/fonts";
import { THEME_BG, THEME_KEY } from "@/lib/theme";
import { SmoothScroll } from "./smooth-scroll";

/* Runs in <head> before first paint: applies a saved dark theme so there is no light flash.
   Light is the default, so the server always renders light and the page stays static. */
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="dark"){var d=document.documentElement;d.setAttribute("data-theme","dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(THEME_BG.dark)})}}catch(e){}})()`;

/**
 * The <html> and <body> shell shared by both root layouts, (en) and (hi). Each locale has its own
 * root layout so the server renders the right `lang` and the right preloaded fonts per URL. It also
 * holds the one request-a-demo dialog that every demo button opens.
 */
export function SiteDocument({ locale, fontClassName, children }: { locale: Locale; fontClassName: string; children: ReactNode }) {
  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${fontClassName}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* extensions add attributes to <body> before React hydrates */}
      <body className="min-h-dvh" suppressHydrationWarning>
        <SmoothScroll />
        {children}
        <DemoHost c={getDictionary(locale).demo} to={site.email} privacyHref={href(locale, routes.legalDoc("privacy"))} whatsapp={site.whatsapp} phone={site.phone} />
      </body>
    </html>
  );
}
