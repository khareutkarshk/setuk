import type { ReactNode } from "react";
import { Anek_Devanagari } from "next/font/google";
import { SiteDocument } from "@/components/site/site-document";
import { buildMetadata } from "@/lib/metadata";
import "../globals.css";

const anek = Anek_Devanagari({ subsets: ["devanagari"], variable: "--font-anek", display: "swap" });

export const metadata = buildMetadata("hi");
export { viewport } from "@/lib/metadata";

export default function HindiLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument locale="hi" fontClassName={anek.variable}>
      {children}
    </SiteDocument>
  );
}
