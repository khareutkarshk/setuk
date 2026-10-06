import { Geist, Geist_Mono } from "next/font/google";

/**
 * Type system: Geist for Latin (display and body), Geist Mono for figures and chapter numbers,
 * and Anek Devanagari for Hindi (declared per root layout so only /hi preloads it).
 * All three are variable fonts, self-hosted by next/font, so there is no request to Google.
 */
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });
