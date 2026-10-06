/**
 * Light and dark theme. Light is the default; the header toggle switches <html data-theme> and
 * saves the choice. The colours themselves are the Lok Navy tokens in app/globals.css.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "setuk-theme";

/** Page background per theme, for the browser's theme-color */
export const THEME_BG: Record<Theme, string> = { light: "#f5f6f8", dark: "#0a0f18" };

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_BG[theme]);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode: the choice lasts this page view */ }
}

/** Calls back whenever the theme attribute changes (for useSyncExternalStore and the 3D engine) */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
