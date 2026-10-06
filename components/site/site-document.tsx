import type { ReactNode } from "react";
import type { Locale } from "@/content";
import { geist, geistMono } from "@/lib/fonts";
import { THEME_BG, THEME_KEY } from "@/lib/theme";

/* Runs in <head> before first paint: applies a saved dark theme so there is no light flash.
   Light is the default, so the server always renders light and the page stays static. */
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="dark"){var d=document.documentElement;d.setAttribute("data-theme","dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(THEME_BG.dark)})}}catch(e){}})()`;

/**
 * The <html> and <body> shell shared by both root layouts, (en) and (hi). Each locale has its own
 * root layout so the server renders the right `lang` and the right preloaded fonts per URL.
 */
export function SiteDocument({ locale, fontClassName, children }: { locale: Locale; fontClassName: string; children: ReactNode }) {
  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${fontClassName}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
