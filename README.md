# Setuk website

The Setuk marketing site: Next.js 16 (App Router, Turbopack), React 19 and Tailwind CSS v4. The homepage tells its story as a scroll through a 3D model of the Lok Sabha chamber, built with Three.js.

```bash
pnpm install
pnpm dev            # http://localhost:3000 (English) and /hi (Hindi)
pnpm build && pnpm start
pnpm lint
```

## Routes

| URL | Source | Notes |
|---|---|---|
| `/` | `app/(en)/page.tsx` | English, static |
| `/hi` | `app/(hi)/hi/page.tsx` | Hindi, static |

Each locale has its own **root layout** (`app/(en)/layout.tsx`, `app/(hi)/layout.tsx`). This gives each URL:
- the correct `<html lang>`;
- its own preloaded fonts;
- its own metadata, with `hreflang` alternates.

Moving between the two locales is a full page load, which is expected with separate root layouts.

## Architecture

```
app/
  (en)/layout.tsx, page.tsx      English root layout and page
  (hi)/layout.tsx, hi/page.tsx   Hindi root layout and page
  globals.css                    Lok Navy tokens, Tailwind @theme, base type, motion utilities
  icon.png                       Favicon (file convention)
content/
  types.ts                       Dictionary type; every locale must match it
  en.ts, hi.ts                   All copy, including strings drawn on the 3D screens
  site.ts                        URLs, contact details, social links, proof figures
components/
  home/home-page.tsx             Composes the page (server) and adds Organization JSON-LD
  home/site-header.tsx           Client: menus, mobile sheet, solid on scroll, language links
  home/story/story-controller.tsx  Client: scroll to chapter, rail, scrim; lazy-loads the engine
  home/story/chapters.tsx        Server: the nine chapter cards
  home/story/proof-strip.tsx     Client: count-up figures
  home/sections.tsx              Server: Engagements, Data and trust, FAQs, CTA
  home/site-footer.tsx           Server
  icons.ts                       The only place icons are imported (see below)
  site/                          Brand mark, the <html> shell, and pattern.tsx (Indian patterns)
lib/
  sadan/engine.ts                The chamber: geometry, materials, lights, camera path, render loop
  sadan/office-set.ts            The table in the well: the problem, the fix and the four steps
  sadan/people.ts                The consultant and the politician: seated rig, IK arms, expressions
  sadan/set-screens.ts           Canvas screens for the set: badges, spreadsheet, chat, setup, call, report
  sadan/glyphs.ts                Phosphor icon paths for canvas drawing (generated)
  sadan/screens.ts               Canvas-drawn wall screens and desk tablet
  sadan/quality.ts               Device tiers (low, mid, high)
  sadan/progress.ts              Scroll position to chapter index
  fonts.ts, metadata.ts
public/sadan/v1/tex/             PBR textures (full set and lite/), cached as immutable
assets/loksabha.jpg              Poster and fallback image (next/image, blur placeholder)
```

**Rendering.** Every section is a server component. Only three client islands ship JavaScript:
- the header;
- the proof counters;
- the story controller.

The page is fully readable without JavaScript.

**The 3D chamber.** `lib/sadan/engine.ts` does not depend on any framework. The story controller loads it with a dynamic `import()` after hydration, so Three.js (about 155 KB gzipped) is never part of first-load JS. The engine takes a canvas, a stage element and a progress getter. It returns a handle with `dispose()`, which removes listeners and frees GPU memory, so React StrictMode double mounts and route changes don't leak WebGL contexts. An `AbortSignal` cancels a load that is still in progress.

Until the engine is ready, and permanently on devices without WebGL, the Lok Sabha photo is shown instead.

**Chapters and camera stops.** These are paired by index:
- the cards are in `chapters.tsx`;
- the stops are `STOPS` in `engine.ts`.

To add a chapter, add a card, a stop and a chapter name in both dictionaries.

**What each chapter shows.** Each shot shows what its card describes:

| # | Card | Scene |
|---|---|---|
| 0 | Welcome | The House from the gallery |
| 1 | Who we serve | Above the House; the front, middle and back rows light in turn, labelled MPs, MLAs and local bodies |
| 2 | The problem | The table in the well as a cluttered office: register stacks and red-tape files shedding papers, a frozen spreadsheet, phones buzzing with a 999+ group chat. Four badges (registers, Excel, WhatsApp, memory) fail one by one, in step with the card's strike-through |
| 3 | With Setuk | The clutter streams into the laptop, which becomes one inbox; the badges merge into one Setuk badge, a phone confirms the citizen's SMS, and pulses run from the badge to the seats as the House lights up |
| 4 | Products | Your desk; the tablet alternates Office and Election |
| 5 | Discuss | A consultant (suit) and a politician (kurta and Nehru jacket) talk across the middle chairs, taking turns |
| 6 | Design | Over the consultant's shoulder: the laptop opens on the office setup (roles, access, record import, SOPs) |
| 7 | Train | The laptop shows a role-by-role training call |
| 8 | Run | The month's numbers count up; then the camera moves to the politician, who smiles, nods and joins his hands |

The clutter and the people are swapped while the camera is at your desk (chapter 4), out of sight. Chapter 8's close-up is timed rather than scrolled: it plays about four seconds after the card arrives, and reverses if you scroll back. With reduced motion every animation shows its end state.

The people are stylised, built from primitives (`people.ts`). A pose is a set of wrist targets, hand orientations, a look-at point and expression values, so rigged glTF characters could replace them later behind the same `Pose` interface.

**Performance tiers.** These are set in `lib/sadan/quality.ts` and picked from the GPU name, memory, cores, screen size and Save-Data:

| Tier | Typical device | Materials | Textures | Lights | Shadows | Post |
|---|---|---|---|---|---|---|
| high | Desktop with a real GPU | Physical | 2.8 MB | 6 downlights, wash, 2 alcove | 2048 | GTAO and bloom |
| mid | Phones, tablets, 4-core laptops | Standard | 243 KB | 2 downlights, wash | 1024 | none |
| low | Old phones, integrated or software GPUs | Standard, diffuse only | 140 KB | wash | none | none |

On every tier:
- shadows and the reflection probe render once; the set's props and people don't cast into it, soft contact shadows stand in;
- shaders compile before the first frame, with the whole set visible so nothing compiles mid-scroll;
- frames render only when something changes or animates; idle animation (people, buzzing phones, dust) is capped at 30 fps on mid and low;
- canvas screens redraw at about 8 fps while they animate, otherwise only on change;
- the loop idles off screen and in background tabs.

Measured on the mid tier (`?q=mid&debug`, then `__sadan.info()` in the console): 96 to 150 draw calls per frame and about 670k triangles. The people add about 17k triangles. The 3D chunk is about 178 KB gzipped and is never part of first-load JS (about 185 KB gzipped).

If frames run slower than about 38 fps, the engine steps down in this order: ambient occlusion, then post-processing, then resolution.

URL options:
- `?q=low|mid|high` forces a tier;
- `?ch=4` opens at a chapter;
- `?debug` exposes `window.__sadan.info()` (draw calls, triangles, programs, textures).

**Theme.** The theme is Lok Navy, in light and dark, following the system setting. The colours are CSS variables in `globals.css`, exposed to Tailwind through `@theme` (`bg-bg`, `text-ink`, `text-muted`, `bg-accent` and so on). The engine reads `--accent` and `--accent-ink` for the seat glow and the screens, and redraws when the colour scheme changes.

**Type.** The fonts are self-hosted with `next/font`; there are no requests to Google:
- **Geist** for display and body text;
- **Geist Mono** for chapter numbers and figures;
- **Anek Devanagari** for Hindi. It is preloaded only on `/hi`. On `/` it loads only if Devanagari glyphs render, thanks to `unicode-range`.

**Patterns.** The cards and sections use Indian patterns, drawn as CSS masks over `currentColor` so they take the theme colour in light and dark mode. The classes are in `globals.css` and the components are in `components/site/pattern.tsx`:
- **jaali**: interlocking circles, carried over from option 2;
- **temple**: the stepped temple border of a Kanjeevaram saree;
- **kolam**: dots and loops;
- **lehar**: leheriya waves;
- **buti**: block-print flowers;
- **toran**: hanging leaves;
- **lotus**: an SVG rosette.

Each story card hangs a temple border from its top edge, has its own corner pattern, and shows its chapter number as a Devanagari numeral watermark. Further down the page:
- Engagements: a toran and a lotus;
- Data and trust: a dark band behind a jaali screen;
- FAQs: a buti panel;
- the CTA: the jaali with सेतु;
- the footer: a temple border.

**Icons.** Phosphor icons are imported one module at a time through `components/icons.ts`, from `@phosphor-icons/react/dist/ssr/*`. The package isn't in Next's `optimizePackageImports` list, so importing from the package root would bundle every icon.

## Before launch

- Replace the proof figures in `content/site.ts`. They are illustrative and labelled as such on the page.
- Confirm the engagement packages (`engage.pkgs`) and the "30 lakh+" local body figure.
- Get a native editor to review the Hindi copy in `content/hi.ts`.
- Move menu links from `https://setuk.org/...` to internal paths as those pages are migrated (`content/site.ts`).
- The wall, desk, laptop and phone screens show labelled sample data with illustrative names.
- The training call is drawn in a generic video-call layout (no Google Meet branding).

Content sources and the gap analysis are in `../SETUK-CONTENT.md`. The original static prototype is `../option-4.html`.

## Credits

Textures: Poly Haven (CC0). Chamber photo and the peacock jaali crop: Ministry of Parliamentary Affairs (GODL-India). The full list is in `../README.md`.
