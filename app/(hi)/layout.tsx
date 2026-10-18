import type { ReactNode } from "react";
import { Anek_Devanagari } from "next/font/google";
import { SiteDocument } from "@/components/site/site-document";
import { buildMetadata } from "@/lib/metadata";
import "../globals.css";

/* Not preloaded: the bundler shares font CSS between the two root layouts, so a preload here reached the
   English pages too (250 KB they never use). Hindi text asks for it as soon as it renders, with swap. */
const anek = Anek_Devanagari({ subsets: ["devanagari"], variable: "--font-anek", display: "swap", preload: false });

export const metadata = buildMetadata("hi");
export { viewport } from "@/lib/metadata";

export default function HindiLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument locale="hi" fontClassName={anek.variable}>
      {children}
    </SiteDocument>
  );
}
