import type { ReactNode } from "react";
import type { Locale } from "@/content";
import { geist, geistMono } from "@/lib/fonts";

/**
 * The <html> and <body> shell shared by both root layouts, (en) and (hi). Each locale has its own
 * root layout so the server renders the right `lang` and the right preloaded fonts per URL.
 */
export function SiteDocument({ locale, fontClassName, children }: { locale: Locale; fontClassName: string; children: ReactNode }) {
  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable} ${fontClassName}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
