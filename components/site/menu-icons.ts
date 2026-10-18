import * as I from "@/components/icons";
import type { ProductKey, RoleKey } from "@/content/types";

/**
 * The header menus' icons, kept apart from the pages' looks (products/look.ts, roles/look.ts): the header
 * is a client component, and importing a look object pulled every module and problem icon it lists, in
 * all six Phosphor weights, into every page's JavaScript. The looks read their `icon` from here.
 */
export const PRODUCT_MENU_ICON: Record<ProductKey, I.Icon> = { office: I.Briefcase, election: I.FlagBanner };
export const ROLE_MENU_ICON: Record<RoleKey, I.Icon> = { mps: I.Bank, mlas: I.MapTrifold, mayors: I.Buildings, consultants: I.Handshake };
