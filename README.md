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
| `/for-mps`, `/for-mlas`, `/for-mayors`, `/for-consultants` | `app/(en)/for-*/page.tsx` | The role pages under "By role" in the header (see below) |
| `/legal`, `/legal/[slug]` | `app/(en)/legal/...` | Policy hub and each policy |
| `/office-management-software`, `/election-management-software` | `app/(en)/*-management-software/page.tsx` | The product pages under "Products" in the header |
| `/voter-list-excel/...` | `app/(en)/voter-list-excel/[[...slug]]/page.tsx` | Voter lists by state, district and constituency; static on first visit, then cached (see AGENTS.md) |
| `/hi/...` | `app/(hi)/hi/...` | The same pages in Hindi |
| `/sitemap.xml` | `app/sitemap.ts` | Every page in both languages |
| any unknown address | `app/global-not-found.tsx`, and `not-found.tsx` in the article, policy and voter-list segments | The 404 page in the site's frame (`components/pages/not-found.tsx`), copy in `notFound` |

Inner pages share `components/pages/page-shell.tsx` (header, closing call to action, footer) and are server components; their client islands are small: the process rail on How we work (GSAP ScrollTrigger, loaded on demand, which also lights the first-three-weeks calendar), the product heroes' story (`products/screen-play.tsx`), the voter list landing's map panel, the About before/after slider, the article contents list, the article reader tools (share, copy link, "Was this helpful?", newsletter; `components/pages/article-engage.tsx`), the topic filter, the FAQ search and the contact form. Their copy is in `pages` in both dictionaries. Articles and policies are long-form text in `content/articles.ts` and `content/legal.ts` (generated once from setuk.org, now edited by hand), rendered by `components/pages/prose.tsx`; they are English only, so `/hi` shows them with Hindi navigation and a note. Pictures are Setuk's own illustrations from setuk.org, in `assets/media/` and listed in `content/media.ts`.

The contact form and the request-a-demo dialog have no backend yet: each validates, then shows its thank-you without sending anything (the `TODO` in `onSubmit`, `contact-form.tsx` and `demo-dialog.tsx`). Neither form has an `action`, so without script (or before hydration) the contact form submits by GET and puts the visitor's details in the URL; wiring it to a server action with `method="post"` fixes both. The article newsletter sign-up opens the visitor's email app, and "Was this helpful?" answers are kept only in the reader's browser; both are marked in `article-engage.tsx` where a list provider or analytics call would go.

`next.config.ts` redirects setuk.org's old addresses: each guide's root URL to `/articles/<slug>`, `/features` to `/how-we-work#modules` and `/roadmap` to `/how-we-work#roadmap`.

Each locale has its own **root layout** (`app/(en)/layout.tsx`, `app/(hi)/layout.tsx`). This gives each URL:
- the correct `<html lang>`;
- its own preloaded fonts;
- its own metadata, with `hreflang` alternates.

Moving between the two locales is a full page load, which is expected with separate root layouts.

## Role pages

For MPs, For MLAs, For Mayors and For consultants (`components/pages/roles/`, copy in `pages.roles` in both dictionaries) share one family of sections and differ in five ways, set in `components/pages/roles/look.ts`:

- **The hero figure**: an isometric line drawing that answers the pointer, drawn on the kernel of `@lucasmarkes/hairline`. MPs: the Lok Sabha benches; MLAs: a constituency map with booths; Mayors: a city cut into wards; consultants: a turntable of client offices. The kernel (`public/hairline/v1/kernel.js`, unchanged) and each figure (`public/hairline/v1/<name>.js`) load after hydration through `components/site/hairline.tsx`, which themes them with the `--hairline-*` variables in `globals.css`, shows the figure's read-out in the page's language and plays its tour once. Write or change a figure only with the hairline-create skill in `.agents/skills/hairline-create`, and check it with that skill's `look.mjs`; never edit the kernel.
- **The hero** (`role-hero.tsx`, `role-stage.tsx`): each role has its own composition and window. MPs: the promise centred over a dark dome; MLAs: a kolam oval under the promise, wide from `lg` up; Mayors: a wide civic window (a jharokha) under the promise; consultants: a wide pool of waves under the promise, the card on its right. Beside the figure a case card plays one real case in four steps (`case` in each role's copy), the office pages' Flow example in short: the hero passes its own `stops` to the figure's tour (`look.ts`), steps one to three light as the unseen pointer reaches each stop, and the fourth when the figure returns to rest, where its rest highlight turns leaf. The card is always readable: before the lap and under reduced motion it shows the case closed. "See every step" jumps to the Flow section (`#flow`). The first lap starts when the card is half in view; the figure then walks on, lap after lap (`loop` on `Hairline`), each lap playing the case again, and the stage's pause button (top corner, WCAG 2.2.2) rests it with the case closed. After changing a figure, check its stops still land where `look.ts` says.
- **The pattern** (sadan, kolam, jaali, lehar) in the hero window and the sections, and the role's word in Devanagari, set large and faint behind the figure.
- **One section of its own** (`own.tsx`): an MP's offices feeding one record, an assembly seat from the office out to its booths, complaints landing ward by ward. The consultants page (`consultants-page.tsx`) is a partnership page with its own sections; partner terms are agreed per partner and never published there.
- **Its copy and modules**, taken from the live modules on How we work; anything still being built is badged "In progress".

The header's "By role" menu opens on hover with a mouse and on click, tap or keyboard; below `xl`, Home leaves the desktop row so the row fits on one line. Each role page also carries FAQPage structured data and its own closing call to action.

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

**The splash.** A brief greeting, never a wait for the chamber: it is `aria-hidden`, lets clicks through, lifts after 1.6 s (`SPLASH_MS`) or at the first key, click, touch or wheel, and also fades itself out in CSS on the compositor, so it lifts on time while the main thread is busy starting the chamber. The page under it is readable from the first paint; the photo stands in until the chamber fades in, on every device.

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

Measured on the mid tier (`?q=mid&debug`, then `__sadan.info()` in the console): 96 to 150 draw calls per frame and about 670k triangles. The 3D chunk is about 178 KB gzipped and is never part of first-load JS (measured from the scripts each page's HTML asks for: about 235 KB gzipped on the homepage, 222 to 236 KB on inner pages; Next prefetches other pages' code afterwards, which is not first load).

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
- the photo shows until the chamber is ready.

Rotating or resizing across layouts keeps the reader at the same point of the story. Without JavaScript the splash is hidden, the photo stands in for the chamber and every card is readable.

URL options:
- `?q=low|mid|high` forces a tier (headless browsers use a software GPU and get `low`; test with `?q=mid`);
- `?ch=4` opens at a chapter (held until the visitor scrolls, clicks or types);
- `?debug` exposes `window.__sadan.info()` (draw calls, triangles, programs, textures, layout mode, canvas size, renders) and `window.__story` (`go(i)`, `p()`, `mode()`).

**Theme.** The theme is Lok Navy, light by default, with a dark mode switched by the moon and sun button in the header. The choice is saved in `localStorage` (`setuk-theme`) and applied by an inline script in `<head>` before first paint (`components/site/site-document.tsx`), so there is no flash and the pages stay static. The system setting is not followed. Theme helpers are in `lib/theme.ts`. The colours are CSS variables in `globals.css`, exposed to Tailwind through `@theme` (`bg-bg`, `text-ink`, `text-muted`, `bg-accent` and so on). Blue (`accent`) is the primary colour. `leaf`, the green of the logo's dots, is a second accent with one rule: every eyebrow label is leaf (story cards and sections alike) while its number or ornament stays blue, each story card number is followed by the mark's green dot (`leaf-mark`) and its corner ornament is leaf, and inside cards leaf marks only outcomes and confirmations (the "You get" seal, the engagement checks and recommended badge, WhatsApp, an open FAQ's number). On the ink sections it is `leaf-inverse`. Never a button fill or a headline. The engine reads `--accent` and `--accent-ink` for the seat glow and the screens, and redraws when the theme changes (it watches `data-theme` on `<html>`).

**Type.** The fonts are self-hosted with `next/font`; there are no requests to Google:
- **Geist** for display and body text;
- **Geist Mono** for chapter numbers and figures;
- **Anek Devanagari** for Hindi, declared only in the Hindi layout and not preloaded (the bundler shares font CSS between the two layouts, so a preload would reach English pages too). English pages never load it: their few Devanagari glyphs are faint `aria-hidden` ornaments set in the system's Devanagari font (`--font-anek` in `globals.css`).

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

**Icons.** Phosphor icons are imported one module at a time through `components/icons.ts`, from `@phosphor-icons/react/dist/ssr/*`. The package isn't in Next's `optimizePackageImports` list, so importing from the package root would bundle every icon. Each icon carries all six weights, so a client component should import only the icons it draws: the header's menu icons live in `components/site/menu-icons.ts` (the product and role looks read them from there), because importing a look object pulled every module icon into every page.

## Performance and accessibility

The site aims at WCAG 2.1 AA, which is what the 50 accessibility checkpoints of GIGW 3.0 (the Guidelines for Indian Government Websites) require. Rules that keep it there:

- **Nothing hides the page.** The homepage splash is `aria-hidden`, lets clicks through and lifts within about 2 s (see The splash); hero items (`rise`) slide in but are visible from the first paint, since starting them at opacity 0 delayed the main text (LCP).
- **Fonts.** English pages load only Geist (about 50 KB); see Type.
- **Motion.** Anything that moves beside the text plays once or on request (the product screens, the role figures' tour); loops longer than 5 s need a pause control (WCAG 2.2.2). Everything shows its end state with reduced motion.
- **Focus.** The global ring is the accent; on blue (`bg-accent`) and ink (`.inverse`) surfaces it switches to the surface's light colour (`globals.css`). Check any new coloured surface for a visible ring.
- **Screen readers.** Visual duplicates are `aria-hidden` and their content stays in the tree: on the homepage How we work's pinned card is hidden from assistive tech, and the four step cards are visually hidden in the classic layout rather than `display: none`. Live regions only for real status messages (never a counter). `<dl>` rows hold only `<dt>` and `<dd>`; put an icon inside the `<dt>`.
- **Contrast.** Small text keeps 4.5:1 on every surface, including the tinted bands: avoid fading `text-muted` with `/70` or `opacity-75`. `--leaf` is a shade darker than the logo green for that reason.
- **Forms and pickers.** A `<select>` never navigates on keyboard changes (the voter-list finder waits for Enter or Show; mouse and touch picks open at once, as its hint says).
- **Caching and headers.** `/sadan/` and `/hairline/` are versioned and cached as immutable; `next.config.ts` also sets baseline security headers (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) and drops `X-Powered-By`. HSTS is left to the host; a Content-Security-Policy needs the inline theme script hashed first.

Check a change with a production build: Lighthouse (mobile and desktop) and axe-core with the WCAG 2.1 A/AA tags. Headless Chrome renders WebGL in software, so test the homepage with `?q=low` and judge its blocking time on a real phone.

## Before launch

- Replace the proof figures in `content/site.ts`. They are illustrative and labelled as such on the page.
- Confirm the engagement packages (`engage.pkgs`) and the "30 lakh+" local body figure.
- Get a native editor to review the Hindi copy in `content/hi.ts` (including the newer `notFound` and voter-list finder `hint`/`go` strings).
- Connect the contact form and the demo dialog to a backend (see above).
- Still open from the accessibility audit: the homepage story's focus ring on the two product links (2.47:1), single arrow-key scrolls in the story being snapped back, a 186 KB non-square favicon (`app/icon.png`), a Content-Security-Policy, and the GIGW content pages (help, an HTML sitemap, an accessibility statement, print styles, copyright and hyperlinking policies, a notice on links that leave the site).
- Move menu links from `https://setuk.org/...` to internal paths as those pages are migrated (`content/site.ts`).
- The wall, desk, laptop and phone screens show labelled sample data with illustrative names.
- The training call is drawn in a generic video-call layout (no Google Meet branding).

Content sources and the gap analysis are in `../SETUK-CONTENT.md`. The original static prototype is `../option-4.html`.

## Credits

Textures: Poly Haven (CC0). Chamber photo and the peacock jaali crop: Ministry of Parliamentary Affairs (GODL-India). The full list is in `../README.md`.
