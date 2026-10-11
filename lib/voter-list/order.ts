import { site } from "@/content/site";
import type { AreaSummary, VoterListView } from "./types";

const n = (x: number) => x.toLocaleString("en-IN");

/** "₹1,13,300", Indian digit grouping */
export const inr = (x: number) => `₹${n(x)}`;
export const count = n;

/**
 * A WhatsApp link with the order filled in, as the live site sends it: the area, its booths, the
 * rate and the total. The message stays in English, for the team that answers it.
 */
export function orderHref(view: Pick<VoterListView, "trail" | "ratePerBooth">, area?: AreaSummary) {
  const { state, district, ac: current } = view.trail;
  const lines = ["Hello Setuk, I would like to request a voter list Excel download.", ""];
  /* a card names its own area and the ones above it; the hero button (no area) names the trail */
  const st = area?.level === "state" ? area : state;
  const di = area?.level === "district" ? area : area?.level === "state" ? undefined : district;
  const ac = area?.level === "ac" ? area : area ? undefined : current;
  if (st) lines.push(`State: ${st.name}`);
  if (di) lines.push(`District: ${di.name}`);
  if (ac) lines.push(`Vidhan Sabha: ${ac.name} (AC ${ac.no})`);
  if (area) {
    lines.push(`Polling booths: ${n(area.booths)}`, `Rate: ${inr(view.ratePerBooth)} per booth`, `Total price: ${inr(area.booths * view.ratePerBooth)}`);
  }
  lines.push("", area ? "Please confirm availability and help me complete the order." : "Please share the details.");
  return `${site.whatsapp.href}?text=${encodeURIComponent(lines.join("\n"))}`;
}
