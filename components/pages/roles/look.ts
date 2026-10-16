import type { Dictionary, RoleKey } from "@/content/types";
import type { PatternKind } from "@/components/site/pattern";
import * as I from "@/components/icons";

/**
 * What makes each role page its own, besides its copy: the hero's line figure (public/hairline/v1),
 * the window it stands in, the Indian pattern its sections carry, and the icon it shows in the
 * header's "By role" menu.
 *   MPs          benches    the Lok Sabha chamber         dome     sadan, from the Lok Sabha's own wall
 *   MLAs         booths     a constituency and its booths circle   kolam, the dot-and-loop threshold drawing
 *   Mayors       wards      a city cut into wards         jharokha jaali, the stone screens of civic buildings
 *   Consultants  portfolio  one platform, many offices    pool     lehar, waves that carry from shore to shore
 *
 * `problems` are the icons of the four problems under the hero, in the order of `challenges.items`.
 *
 * `stops` are the hero's tour, in the figure's 400 × 320 viewBox: the case card's first three steps
 * land on them, and the fourth when the figure comes back to rest, where its own highlight (the MP's
 * seat, the home booth, the municipal tower, the office in front) turns leaf. Each was read off the
 * figure's read-out; after changing a figure, check its stops still land where they say:
 *   MPs     a back bench (4·2), a middle one (3·5), the front row (1·3): the request comes in to the MP
 *   MLAs    a village booth (131), the office's booth at the centre (114), the village again
 *   Mayors  a ward (10), the wards round the tower (06), the same ward for the site visit
 *   Consultants three pushes of the turntable, each bringing another client's office round
 */
export const ROLE_KEYS = ["mps", "mlas", "mayors", "consultants"] as const satisfies readonly RoleKey[];

export type RoleWindow = "dome" | "circle" | "jharokha" | "pool";
export type Stop = [number, number] | null;

type Look = { figure: string; window: RoleWindow; stops: Stop[]; pattern: PatternKind; icon: I.Icon; problems: [I.Icon, I.Icon, I.Icon, I.Icon] };

export const ROLE_LOOK: Record<RoleKey, Look> = {
  mps: {
    figure: "benches", window: "dome", stops: [[111, 122], [271, 134], [180, 155], null], pattern: "sadan", icon: I.Bank,
    // many registers, two cities, no owner, no single view
    problems: [I.Stack, I.ArrowsLeftRight, I.HourglassMedium, I.MagnifyingGlass]
  },
  mlas: {
    figure: "booths", window: "circle", stops: [[124, 212], [200, 145], [124, 212], null], pattern: "kolam", icon: I.MapTrifold,
    // every direction, teams across villages, letters that go quiet, work without a record
    problems: [I.ChatsCircle, I.UsersThree, I.EnvelopeSimple, I.Notebook]
  },
  mayors: {
    figure: "wards", window: "jharokha", stops: [[136, 195], [179, 153], [136, 195], null], pattern: "jaali", icon: I.Buildings,
    // every channel, many departments, public works, a crowded calendar
    problems: [I.Phone, I.ShareNetwork, I.Barricade, I.CalendarDots]
  },
  consultants: {
    figure: "portfolio", window: "pool", stops: [[125, 172], [205, 250], [300, 205], null], pattern: "lehar", icon: I.Handshake,
    // every client different, the handover, advice on paper, setup that grows
    problems: [I.Strategy, I.DoorOpen, I.ClipboardText, I.UserGear]
  }
};

export type RoleMenuItem = { key: RoleKey; t: string; d: string };

/** The header's "By role" menu, picked out on the server so the client gets four lines, not the pages' copy */
export function roleMenu(t: Dictionary): RoleMenuItem[] {
  return ROLE_KEYS.map((key) => ({ key, ...t.pages.roles[key].menu }));
}
