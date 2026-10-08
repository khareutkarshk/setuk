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
| `/` | `app/(en)/page.tsx` | English homepage (the 3D story), static |
| `/how-we-work` | `app/(en)/how-we-work/page.tsx` | The four steps, the live modules, the eLetter screen, the roadmap |
| `/engagements` | `app/(en)/engagements/page.tsx` | Packages, comparison, pricing, questions |
| `/about` | `app/(en)/about/page.tsx` | The founder's account |
| `/articles`, `/articles/[slug]` | `app/(en)/articles/...` | Guides list (topic filter) and each guide (contents beside the text) |
| `/faqs` | `app/(en)/faqs/page.tsx` | All questions, grouped and searchable |
| `/contact` | `app/(en)/contact/page.tsx` | Channels and the contact form |
| `/legal`, `/legal/[slug]` | `app/(en)/legal/...` | Policy hub and each policy |
| `/hi/...` | `app/(hi)/hi/...` | The same pages in Hindi |
| `/sitemap.xml` | `app/sitemap.ts` | Every page in both languages |

Inner pages share `components/pages/page-shell.tsx` (header, closing call to action, footer) and are server components; their client islands are small: the process rail on How we work (GSAP ScrollTrigger, loaded on demand), the article contents list, the topic filter, the FAQ search and the contact form. Their copy is in `pages` in both dictionaries. Articles and policies are long-form text in `content/articles.ts` and `content/legal.ts` (generated once from setuk.org, now edited by hand), rendered by `components/pages/prose.tsx`; they are English only, so `/hi` shows them with Hindi navigation and a note. Pictures are Setuk's own illustrations from setuk.org, in `assets/media/` and listed in `content/media.ts`.

The contact form has no backend yet: sending opens the visitor's email app with the message filled in (to contact@setuk.org). Wire it to a form endpoint before launch if replies should not depend on a mail app.

`next.config.ts` redirects setuk.org's old addresses: each guide's root URL to `/articles/<slug>`, `/features` to `/how-we-work#modules` and `/roadmap` to `/how-we-work#roadmap`.

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
  sadan/avatar.ts                The consultant and the politician: rigged GLB (public/sadan/v1/people/), IK arms, expressions
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
| 5 | Discuss | A consultant (suit) and a politician (white kurta, glasses and mustache) talk across the middle chairs, taking turns |
| 6 | Design | Over the consultant's shoulder: the laptop opens on the office setup (roles, access, record import, SOPs) |
| 7 | Train | The laptop shows a role-by-role training call |
| 8 | Run | The month's numbers count up; then the camera moves to the politician, who smiles, nods and joins his hands |

The clutter and the people are swapped while the camera is at your desk (chapter 4), out of sight. Chapter 8's close-up is timed rather than scrolled: it plays about four seconds after the card arrives, and reverses if you scroll back. With reduced motion every animation shows its end state.

The people are a rigged glTF model (`public/sadan/v1/people/consultant.glb`, loaded by `avatar.ts` on every tier and placed while the camera is at the desk). A pose is a set of wrist targets, hand orientations, a look-at point and expression values. If the model fails to load, the meeting plays without people.

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

Measured on the mid tier (`?q=mid&debug`, then `__sadan.info()` in the console): 96 to 150 draw calls per frame and about 670k triangles. The 3D chunk is about 178 KB gzipped and is never part of first-load JS (about 185 KB gzipped).

If frames run slower than about 38 fps, the engine steps down in this order: ambient occlusion, then post-processing, then resolution. The threshold follows the display's own frame cadence (measured on frames that render nothing), so a 30 fps cap such as iOS Low Power Mode doesn't count as a slow GPU. Eased camera values snap once they are within a pixel, so the loop goes idle when scrolling stops. If the browser drops the WebGL context, the photo shows and the chamber is rebuilt when the context returns (or after 3 s).

**Devices and layout modes.** The story CSS (`story.module.css`) picks one of three layouts with media queries and exposes it as `--story-mode`; the controller and the engine read it, so the layout is right before any JS runs:

| Mode | When | Scene | Text |
|---|---|---|---|
| `classic` | landscape, at least 768 wide and 560 tall (desktops, laptops, landscape tablets) | full screen, the subject moved away from the card (`sx`) | side cards over the scene |
| `band` | portrait (phones, portrait tablets, split view) | a band across the top, `--band` tall (in `svh`, so mobile toolbars never resize the canvas) | chapters scroll natively under the band |
| `side` | short or narrow landscape (landscape phones) | the left column (`--side-w`) | chapters scroll in the right column |

In `band` and `side`:
- every line of copy shows, and no card scrolls inside itself;
- a chapter taller than the reading area arrives with its top in view (`anchor` in `lib/sadan/progress.ts`), and progress is measured from the middle of the reading area;
- How we work pins only its progress header; the four steps are plain cards (`.howInline`);
- the canvas is only the band, so the camera centres each stop in it and widens the lens for narrow bands. A stop can carry a compact framing (`c: { p, t, fov }` in `STOPS`);
- in-scene text keeps a minimum size on screen (band labels about 11 px, badge captions about 8 px, the Setuk tag about 10 px); the four problem badges regroup into a 2x2 grid;
- the header slides away while reading down through the story and returns on any scroll up (`html[data-hide-header]`);
- the splash gives up after 6 s instead of 15 s; the photo shows until the chamber is ready.

Rotating or resizing across layouts keeps the reader at the same point of the story. Without JavaScript the splash is hidden, the photo stands in for the chamber and every card is readable.

URL options:
- `?q=low|mid|high` forces a tier (headless browsers use a software GPU and get `low`; test with `?q=mid`);
- `?ch=4` opens at a chapter (held until the visitor scrolls, clicks or types);
- `?debug` exposes `window.__sadan.info()` (draw calls, triangles, programs, textures, layout mode, canvas size, renders) and `window.__story` (`go(i)`, `p()`, `mode()`).

**Theme.** The theme is Lok Navy, light by default, with a dark mode switched by the moon and sun button in the header. The choice is saved in `localStorage` (`setuk-theme`) and applied by an inline script in `<head>` before first paint (`components/site/site-document.tsx`), so there is no flash and the pages stay static. The system setting is not followed. Theme helpers are in `lib/theme.ts`. The colours are CSS variables in `globals.css`, exposed to Tailwind through `@theme` (`bg-bg`, `text-ink`, `text-muted`, `bg-accent` and so on). Blue (`accent`) is the primary colour. `leaf`, the green of the logo's dots, is a second accent with one rule: every eyebrow label is leaf (story cards and sections alike) while its number or ornament stays blue, each story card number is followed by the mark's green dot (`leaf-mark`) and its corner ornament is leaf, and inside cards leaf marks only outcomes and confirmations (the "You get" seal, the engagement checks and recommended badge, WhatsApp, an open FAQ's number). On the ink sections it is `leaf-inverse`. Never a button fill or a headline. The engine reads `--accent` and `--accent-ink` for the seat glow and the screens, and redraws when the theme changes (it watches `data-theme` on `<html>`).

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
