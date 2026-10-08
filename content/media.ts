import type { StaticImageData } from "next/image";
import officeTeam from "@/assets/media/office-team.webp";
import officeBeforeAfter from "@/assets/media/office-before-after.webp";
import warRoom from "@/assets/media/war-room.webp";
import commandCentre from "@/assets/media/command-centre.webp";
import contactDesk from "@/assets/media/contact-desk.webp";
import officeNight from "@/assets/media/office-night.webp";
import appointments from "@/assets/media/appointments.webp";
import calendar from "@/assets/media/calendar.webp";
import eletter from "@/assets/media/eletter.webp";
import pnr from "@/assets/media/pnr.webp";
import booths from "@/assets/media/booths.webp";
import citizens from "@/assets/media/citizens.webp";
import citizenApp from "@/assets/media/citizen-app.webp";
import setu from "@/assets/media/setu.webp";
import eletterScreen from "@/assets/media/eletter-screen.webp";
import lokSabha from "@/assets/media/lok-sabha.webp";
import rajyaSabha from "@/assets/media/rajya-sabha.webp";
import vidhanSabha from "@/assets/media/vidhan-sabha.webp";
import localBody from "@/assets/media/local-body.webp";

/**
 * Setuk's own illustration set (blue duotone, from setuk.org) and one product screenshot.
 * Static imports, so next/image knows each size and gets a blur placeholder. Alt text lives
 * with each use in the dictionaries, since the same picture can say different things.
 */
export const media = {
  officeTeam, officeBeforeAfter, warRoom, commandCentre, contactDesk, officeNight,
  appointments, calendar, eletter, pnr, booths, citizens, citizenApp, setu, eletterScreen,
  lokSabha, rajyaSabha, vidhanSabha, localBody
} satisfies Record<string, StaticImageData>;

export type MediaKey = keyof typeof media;
