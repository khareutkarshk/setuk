import { site } from "@/content/site";
import type { AreaSummary, VoterListView } from "./types";

const n = (x: number) => x.toLocaleString("en-IN");

/** "₹1,13,300", Indian digit grouping */
export const inr = (x: number) => `₹${n(x)}`;
export const count = n;

/**
 * A WhatsApp link with the order filled in, as the live site sends it: the area, its booths, the
 * rate and the total. The message stays in English, for the team that answers it. A card names its
 * own area and the ones above it; the hero button (no area) names the page's trail.
 */
export function orderHref(view: Pick<VoterListView, "trail" | "ratePerBooth">, area?: AreaSummary) {
  const lines = ["Hello Setuk, I would like to request a voter list Excel download.", ""];
  const t = view.trail;
  const state = area ? (area.level === "state" ? area.name : area.state.name) : t.state?.name;
  const district = area ? (area.level === "district" ? area.name : area.level === "ac" ? area.district.name : undefined) : t.district?.name;
  const ac = area ? (area.level === "ac" ? area : undefined) : t.ac;
  const pc = area ? (area.level === "pc" ? area : undefined) : t.pc;
  if (state) lines.push(`State: ${state}`);
  if (district) lines.push(`District: ${district}`);
  if (ac) lines.push(`Vidhan Sabha: ${ac.name} (AC ${ac.no})`);
  if (pc) lines.push(`Lok Sabha: ${pc.name} (PC ${pc.no})`);
  if (area) {
    lines.push(`Polling booths: ${n(area.booths)}`, `Rate: ${inr(view.ratePerBooth)} per booth`, `Total price: ${inr(area.booths * view.ratePerBooth)}`);
  }
  lines.push("", area ? "Please confirm availability and help me complete the order." : "Please share the details.");
  return `${site.whatsapp.href}?text=${encodeURIComponent(lines.join("\n"))}`;
}
