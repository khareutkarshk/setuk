import type { Dictionary, ProductKey } from "@/content/types";
import type { PatternKind } from "@/components/site/pattern";
import * as I from "@/components/icons";
import { PRODUCT_MENU_ICON } from "@/components/site/menu-icons";

/**
 * What makes each product page its own, besides its copy: the pattern behind its hero, the icon it
 * shows in the header's Products menu, and an icon for each of its modules and features, in the order
 * of `modules.items` and `features.items` in the dictionaries.
 *   office    sadan  the Lok Sabha's wall, for the office that serves the seat
 *   election  kolam  the threshold drawing, dot by dot, like booths across a constituency
 */
export const PRODUCT_KEYS = ["office", "election"] as const satisfies readonly ProductKey[];

type Look = { pattern: PatternKind; icon: I.Icon; modules: I.Icon[]; features: I.Icon[] };

export const PRODUCT_LOOK: Record<ProductKey, Look> = {
  office: {
    pattern: "sadan",
    icon: PRODUCT_MENU_ICON.office,
    // letters, appointments, visitors, calendar, PNR, citizens, WhatsApp, reports; events, LADs, photos
    modules: [I.EnvelopeSimple, I.CalendarCheck, I.DoorOpen, I.CalendarDots, I.Train, I.UsersThree, I.WhatsappLogo, I.ChartLineUp, I.FlagBanner, I.CurrencyInr, I.Camera],
    features: [I.EnvelopeSimple, I.CalendarCheck, I.CalendarDots, I.UsersThree]
  },
  election: {
    pattern: "kolam",
    icon: PRODUCT_MENU_ICON.election,
    // booths, voter list, karyakartas, surveys; influential voters
    modules: [I.HouseLine, I.Table, I.UserList, I.ClipboardText, I.Star],
    features: [I.HouseLine, I.Table, I.UserList, I.ClipboardText]
  }
};

export type ProductMenuItem = { key: ProductKey; t: string; d: string };

/** The header's Products menu, picked out on the server so the client gets two lines, not the pages' copy */
export function productMenu(t: Dictionary): ProductMenuItem[] {
  return PRODUCT_KEYS.map((key) => ({ key, ...t.pages.products[key].menu }));
}
