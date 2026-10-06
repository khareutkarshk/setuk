import type { ReactNode } from "react";
import { Anek_Devanagari } from "next/font/google";
import { SiteDocument } from "@/components/site/site-document";
import { buildMetadata } from "@/lib/metadata";
import "../globals.css";

/* English pages only show a few Devanagari glyphs (the brand line, the language switch), so the
   Hindi face is not preloaded here; its unicode-range means it downloads only if those glyphs render. */
const anek = Anek_Devanagari({ subsets: ["devanagari"], variable: "--font-anek", display: "swap", preload: false });

export const metadata = buildMetadata("en");
export { viewport } from "@/lib/metadata";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument locale="en" fontClassName={anek.variable}>
      {children}
    </SiteDocument>
  );
}
