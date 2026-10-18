import type { ReactNode } from "react";
import { SiteDocument } from "@/components/site/site-document";
import { buildMetadata } from "@/lib/metadata";
import "../globals.css";

/* English pages carry no Hindi face: their few Devanagari glyphs are faint, aria-hidden ornaments
   (watermarks, numerals) and the language switch, set in the system's Devanagari font (--font-anek in
   globals.css), so the 250 KB Anek file never downloads here. Declaring it here as well also made /hi
   fetch it twice, from two URLs. */
export const metadata = buildMetadata("en");
export { viewport } from "@/lib/metadata";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument locale="en" fontClassName="">
      {children}
    </SiteDocument>
  );
}
