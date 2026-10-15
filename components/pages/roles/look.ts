import type { Dictionary, RoleKey } from "@/content/types";
import type { PatternKind } from "@/components/site/pattern";
import * as I from "@/components/icons";

/**
 * What makes each role page its own, besides its copy: the hero's line figure (public/hairline/v1),
 * the Indian pattern its sections carry, and the icon it shows in the header's "By role" menu.
 *   MPs          benches    the Lok Sabha chamber        sadan, from the Lok Sabha's own wall
 *   MLAs         booths     a constituency and its booths kolam, the dot-and-loop threshold drawing
 *   Mayors       wards      a city cut into wards         jaali, the stone screens of civic buildings
 *   Consultants  portfolio  one platform, many offices    lehar, waves that carry from shore to shore
 */
export const ROLE_KEYS = ["mps", "mlas", "mayors", "consultants"] as const satisfies readonly RoleKey[];

export const ROLE_LOOK: Record<RoleKey, { figure: string; pattern: PatternKind; icon: I.Icon }> = {
  mps: { figure: "benches", pattern: "sadan", icon: I.Bank },
  mlas: { figure: "booths", pattern: "kolam", icon: I.MapTrifold },
  mayors: { figure: "wards", pattern: "jaali", icon: I.Buildings },
  consultants: { figure: "portfolio", pattern: "lehar", icon: I.Handshake }
};

export type RoleMenuItem = { key: RoleKey; t: string; d: string; word: string };

/** The header's "By role" menu, picked out on the server so the client gets four lines, not the pages' copy */
export function roleMenu(t: Dictionary): RoleMenuItem[] {
  return ROLE_KEYS.map((key) => ({ key, ...t.pages.roles[key].menu, word: t.pages.roles[key].word }));
}
