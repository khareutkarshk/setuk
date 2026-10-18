import type { Metadata } from "next";
import { NotFoundPage } from "@/components/pages/not-found";
import { SiteDocument } from "@/components/site/site-document";
import { getDictionary } from "@/content";
import "./globals.css";

/* An address that matches no route. With two root layouts there is no single layout to frame a 404,
   so this one renders the whole document (next.config.ts, experimental.globalNotFound), in English:
   the header's language link leads to the Hindi site. */
export const metadata: Metadata = { title: `${getDictionary("en").notFound.title} | Setuk` };

export default function GlobalNotFound() {
  return (
    <SiteDocument locale="en" fontClassName="">
      <NotFoundPage locale="en" />
    </SiteDocument>
  );
}
